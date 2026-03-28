const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { PROMPTS } = require('../utils/prompts');
const { callMinimax } = require('../utils/minimax');
const { requireAuth } = require('../utils/auth');

// POST /api/diary/save
router.post('/save', requireAuth, async (req, res) => {
  const { mood, content } = req.body;
  
  if (!mood || !content) {
    return res.status(400).json({ error: '心情和内容不能为空' });
  }
  if (content.length > 2000) {
    return res.status(400).json({ error: '日记内容不可超过 2000 字' }); // F1: Content Limit
  }

  try {
    // Generate AI Feedback via Minimax
    const aiFeedback = await callMinimax(PROMPTS.diary_review, `今天的心情是 ${mood}。日记内容如下：${content}`);

    // Save to Database
    db.run(
      `INSERT INTO diaries (user_id, mood, content, ai_feedback) VALUES (?, ?, ?, ?)`,
      [req.user.id, mood, content, aiFeedback],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: '日记保存失败' });
        }
        
        // M7.1 Log Event
        db.run(`INSERT INTO user_events (user_id, event_type, event_data) VALUES (?, ?, ?)`, [req.user.id, 'diary_entry', JSON.stringify({ mood })]);
        
        // M7.4 Auto-tagging based on mood
        let newTag = null;
        if (mood === '焦虑' || mood === '迷茫') newTag = 'anxious_soul';
        else if (mood === '开心' || mood === '平静') newTag = 'peace_seeker';
        else if (mood === '悲伤' || mood === '失落') newTag = 'needs_hug';

        if (newTag) {
          db.get(`SELECT tags FROM users WHERE id = ?`, [req.user.id], (errT, rowT) => {
            if (!errT && rowT) {
              let tags = [];
              try { tags = JSON.parse(rowT.tags || '[]'); } catch(e){}
              if (!tags.includes(newTag)) {
                tags.push(newTag);
                db.run(`UPDATE users SET tags = ? WHERE id = ?`, [JSON.stringify(tags), req.user.id]);
              }
            }
          });
        }

        res.status(201).json({ 
          message: '日记已记录', 
          id: this.lastID,
          feedback: aiFeedback 
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/diary/list
router.get('/list', requireAuth, (req, res) => {
  db.all(
    `SELECT * FROM diaries WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取日记失败' });
      res.json({ diaries: rows });
    }
  );
});

// POST /api/diary/review
router.post('/review', requireAuth, async (req, res) => {
  try {
    const rows = await db.dbAll(
      `SELECT mood, content, created_at FROM diaries WHERE user_id = ? ORDER BY created_at DESC LIMIT 7`,
      [req.user.id]
    );

    if (!rows || rows.length === 0) return res.status(400).json({ error: '暂无日记，无法生成复盘' });

    const diariesText = rows.map(r => `时间：${r.created_at} | 心情：${r.mood} | 内容：${r.content}`).join('\n\n');
    const prompt = `你是一位专业且温暖的心理咨询师。用户提交了近期的几篇情绪日记。
请根据日记内容，生成一段200字左右的周期复盘报告。包含：
1. **【情绪趋势】**：用温暖的话语总结这些天的整体情绪特征和潜台词。
2. **【模式发现】**：指出导致情绪波动的核心原因（如：似乎每次投简历后都会触发自我否定...）。
3. **【微光建议】**：给出一个具体的关怀和极小的行动建议。
使用结构清晰的 Markdown 格式输出，排版要有利于手机阅读。`;

    const aiFeedback = await callMinimax(prompt, `以下是我近期的日记记录，请帮我复盘梳理：\n\n${diariesText}`);
    res.json({ feedback: aiFeedback, count: rows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
