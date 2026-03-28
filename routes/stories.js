const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { callMinimax } = require('../utils/minimax');
const { requireAuth, optionalAuth } = require('../utils/auth');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// F2: Empathy Rate Limiter
const empathyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 empathy clicks per hour per IP
  message: { error: '共情太频繁啦，休息一下吧 🌱' },
  validate: { trustProxy: false }
});

// GET /api/stories/list (Public)
router.get('/list', optionalAuth, (req, res) => {
  // Only return approved stories (or we assume all approved for MVP)
  db.all(
    `SELECT s.*, u.nickname FROM stories s JOIN users u ON s.user_id = u.id WHERE s.status = 'approved' ORDER BY s.created_at DESC LIMIT 50`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取故事失败' });
      
      // Mask nicknames to a secure anon hash (F3)
      const maskedRows = rows.map(r => {
        const isOwner = req.user && req.user.id === r.user_id;
        const anonHash = crypto.createHash('md5').update(r.user_id.toString() + 'landingc_salt').digest('hex').substring(0, 5);
        return {
          ...r,
          nickname: isOwner ? `${r.nickname} (你)` : `微光 ${anonHash}`,
        };
      });
      res.json({ stories: maskedRows });
    }
  );
});

// POST /api/stories/publish (Require Auth)
router.post('/publish', requireAuth, async (req, res) => {
  const { tag, content } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });
  if (content.length > 1000) return res.status(400).json({ error: '内容不能超过 1000 个字符' }); // F1

  // Anti-anxiety moderation via AI
  try {
    const aiReview = await callMinimax(
      "你是一个平台内容审核员。判断以下文字是否含有严重的攀比、恶意炫耀或极端引发社区焦虑的内容？只回答 '合规' 或 '违规'，不用解释。", 
      content
    );
    
    // Default to approved only if admin, otherwise pending_review after AI check
    const status = (aiReview.includes('违规')) ? 'rejected' : (req.user.role === 'admin' ? 'approved' : 'pending_review');

    db.run(
      `INSERT INTO stories (user_id, tag, content, status) VALUES (?, ?, ?, ?)`,
      [req.user.id, tag || '#日常', content, status],
      function (err) {
        if (err) return res.status(500).json({ error: '发布失败' });
        
        if (status === 'rejected') {
          return res.status(200).json({ message: '发布失败，内容可能包含违规或过度引发焦虑的信息。' });
        }
        res.status(201).json({ message: '发布成功', id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// POST /api/stories/:id/empathy (Public/Optional Auth)
router.post('/:id/empathy', empathyLimiter, optionalAuth, (req, res) => {
  const storyId = req.params.id;
  const userId = req.user ? req.user.id : null;

  if (userId) {
    // Check if user already empathized
    db.get(`SELECT 1 FROM story_empathy_records WHERE story_id = ? AND user_id = ?`, [storyId, userId], (err, row) => {
      if (err) return res.status(500).json({ error: '数据库错误' });
      if (row) return res.status(400).json({ error: '你已经共情过啦 🌱' });

      // Record empathy
      db.run(`INSERT INTO story_empathy_records (story_id, user_id) VALUES (?, ?)`, [storyId, userId]);
      updateEmpathyCount();
    });
  } else {
    // For guests, we just increment (ideal to have IP check, but following user request for simplicity)
    updateEmpathyCount();
  }

  function updateEmpathyCount() {
    db.run(`UPDATE stories SET empathy_count = empathy_count + 1 WHERE id = ?`, [storyId], function(err) {
      if (err) return res.status(500).json({ error: '共情操作失败' });
      res.json({ message: '已共情' });
    });
  }
});

// GET /api/stories/:id/replies (Public)
router.get('/:id/replies', optionalAuth, (req, res) => {
  const storyId = req.params.id;
  db.all(
    `SELECT r.*, u.nickname FROM story_replies r JOIN users u ON r.user_id = u.id WHERE r.story_id = ? ORDER BY r.created_at ASC`,
    [storyId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取回复失败' });
      
      const maskedRows = rows.map(r => {
        const isOwner = req.user && req.user.id === r.user_id;
        return {
          ...r,
          nickname: isOwner ? `${r.nickname} (你)` : `好友 ${r.user_id * 31 + 500}`,
        };
      });
      res.json({ replies: maskedRows });
    }
  );
});

// POST /api/stories/:id/reply (Require Auth)
router.post('/:id/reply', requireAuth, async (req, res) => {
  const storyId = req.params.id;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '内容不能为空' });
  if (content.length > 100) return res.status(400).json({ error: '回复过长' });

  // Moderate reply
  try {
    const aiReview = await callMinimax(
      "你是一个平台内容审核员。判断以下文字是否含有恶意攻击、讽刺或引发焦虑的内容？只回答 '合规' 或 '违规'，不用解释。", 
      content
    );
    
    if (aiReview.includes('违规')) {
      return res.status(200).json({ message: '回复内容不太温柔哦，换句话试试吧 🌱' });
    }

    db.run(
      `INSERT INTO story_replies (story_id, user_id, content) VALUES (?, ?, ?)`,
      [storyId, req.user.id, content],
      function (err) {
        if (err) return res.status(500).json({ error: '回复失败' });
        res.status(201).json({ message: '回复成功', id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
