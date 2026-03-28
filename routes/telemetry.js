const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth, requireAdmin } = require('../utils/auth');

// POST /api/telemetry/event  (M7.1)
router.post('/event', requireAuth, (req, res) => {
  const { event_type, event_data } = req.body;
  if (!event_type) return res.status(400).json({ error: 'event_type is required' });
  
  db.run(
    `INSERT INTO user_events (user_id, event_type, event_data) VALUES (?, ?, ?)`,
    [req.user.id, event_type, JSON.stringify(event_data || {})],
    function(err) {
      if (err) return res.status(500).json({ error: '写入失败' });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// POST /api/telemetry/tags (M7.4 Auto-tagging)
router.post('/tags', requireAuth, (req, res) => {
  const { newTag } = req.body;
  if (!newTag) return res.status(400).json({ error: 'newTag is required' });

  db.get(`SELECT tags FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: '用户读取失败' });
    let tags = [];
    try { tags = JSON.parse(row.tags || '[]'); } catch(e) {}
    
    if (!tags.includes(newTag)) {
      tags.push(newTag);
      db.run(`UPDATE users SET tags = ? WHERE id = ?`, [JSON.stringify(tags), req.user.id]);
    }
    res.json({ tags });
  });
});

// GET /api/telemetry/dashboard (M7.2 & M7.3)
router.get('/dashboard', requireAdmin, (req, res) => {
  // Aggregate moods
  const queryMood = new Promise((resolve, reject) => {
    db.all(`SELECT mood, COUNT(*) as count FROM diaries GROUP BY mood`, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });

  // Aggregate Game events
  const queryGame = new Promise((resolve, reject) => {
    db.all(`SELECT event_data FROM user_events WHERE event_type = 'game_end'`, (err, rows) => {
      if (err) reject(err);
      else {
        const counts = {};
        rows.forEach(r => {
          try {
            const d = JSON.parse(r.event_data);
            if (d.ending) counts[d.ending] = (counts[d.ending] || 0) + 1;
          } catch(e) {}
        });
        resolve(Object.entries(counts).map(([k,v]) => ({ path: k, count: v })));
      }
    });
  });

  Promise.all([queryMood, queryGame])
    .then(([moods, gamePaths]) => res.json({ moods, gamePaths }))
    .catch(err => res.status(500).json({ error: '内部聚合错误' }));
});

module.exports = router;
