const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../utils/auth');

function notify(userId, title, content) {
  db.run(`INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)`, [userId, title, content]);
}

// M8.1 同频匹配 2.0
router.post('/match', requireAuth, (req, res) => {
  const me = req.user.id;
  db.get(`SELECT tags FROM users WHERE id = ?`, [me], (err, myRow) => {
    let myTags = [];
    try { myTags = JSON.parse(myRow.tags || '[]'); } catch(e){}
    
    db.all(`
      SELECT id, tags FROM users 
      WHERE id != ? AND id NOT IN (
        SELECT user_b FROM matches WHERE user_a = ? UNION SELECT user_a FROM matches WHERE user_b = ?
      )
    `, [me, me, me], (errUsers, users) => {
      let matchedId = null;
      for (let u of users) {
        let theirTags = [];
        try { theirTags = JSON.parse(u.tags || '[]'); } catch(e){}
        const common = myTags.filter(t => theirTags.includes(t));
        if (common.length > 0) {
          matchedId = u.id;
          break;
        }
      }
      
      // Fallback: If no resonant match, just pick the first available
      if (!matchedId && users && users.length > 0) matchedId = users[0].id;

      if (matchedId) {
        db.run(`INSERT INTO matches (user_a, user_b) VALUES (?, ?)`, [me, matchedId], function(e) {
          if (e) return res.status(500).json({ error: '匹配引擎错误' });
          const matchId = this.lastID;
          notify(me, '新匹配', '我们为你匹配到了一位同频伙伴！');
          notify(matchedId, '新匹配', '有人在宇宙的角落和你产生了共鸣。');
          res.json({ message: '匹配成功', match_id: matchId, matched_user: matchedId });
        });
      } else {
        res.status(404).json({ error: '当前没有合适的伙伴，请稍后再试' });
      }
    });
  });
});

// M8.3 Anonymous 1v1 Chat Send
router.post('/message/:matchId', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '发空消息是没有灵魂的' });
  
  // F5: Check status = 'active'
  db.get(`SELECT user_a, user_b FROM matches WHERE id = ? AND status = 'active' AND (user_a = ? OR user_b = ?)`, 
  [req.params.matchId, req.user.id, req.user.id], (err, match) => {
    if (!match) return res.status(403).json({ error: '匹配不存在或已失效' });

    db.run(`INSERT INTO direct_messages (match_id, sender_id, content) VALUES (?, ?, ?)`,
      [req.params.matchId, req.user.id, content], function() {
        const receiver = match.user_a === req.user.id ? match.user_b : match.user_a;
        notify(receiver, '新私信', '你收到了一条匿名消息');
        res.json({ success: true, id: this.lastID });
    });
  });
});

// M8.3 Get Chat History
router.get('/messages/:matchId', requireAuth, (req, res) => {
  db.all(`SELECT sender_id, content, created_at FROM direct_messages WHERE match_id = ? ORDER BY created_at ASC`, [req.params.matchId], (err, rows) => {
    res.json({ messages: rows || [] });
  });
});

// M8.4 Compliment Co-creation
router.post('/compliment', requireAuth, (req, res) => {
  const { to_user, content } = req.body;
  if (!to_user || !content) return res.status(400).json({ error: '缺少对象或内容' });

  db.run(`INSERT INTO compliments (from_user, to_user, content) VALUES (?, ?, ?)`, [req.user.id, to_user, content], function() {
    notify(to_user, '优点清单', '有人为你写下了一条优点，快去看看吧！');
    res.json({ success: true, message: '赞美已送达 🌟' });
  });
});

// M8.5 Get Notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const rows = await db.dbAll(`SELECT id, title, content, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`, [req.user.id]);
    
    // F6: Precise update using read IDs to avoid race conditions
    const unreadIds = rows.filter(r => r.is_read === 0).map(r => r.id);
    if (unreadIds.length > 0) {
      const placeholders = unreadIds.map(() => '?').join(',');
      await db.dbRun(`UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders})`, unreadIds);
    }
    
    res.json({ notifications: rows || [] });
  } catch(e) {
    res.status(500).json({ error: '获取通知失败' });
  }
});

module.exports = router;
