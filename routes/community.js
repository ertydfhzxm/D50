const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../utils/auth');

// POST /api/community/checkin
router.post('/checkin', requireAuth, (req, res) => {
  const { task_name } = req.body;
  if (!task_name) return res.status(400).json({ error: '打卡任务不能为空' });

  // Today's date string (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Prevent duplicate check-in for the same task today
  db.get(
    `SELECT 1 FROM checkins WHERE user_id = ? AND task_name = ? AND date(created_at) = ?`,
    [req.user.id, task_name, today],
    (err, row) => {
      if (err) return res.status(500).json({ error: '数据库错误' });
      if (row) return res.status(400).json({ error: '今日已完成该打卡啦 🌱' });

      // Earn 1~2 points based on task
      const points = task_name.includes('简历') || task_name.includes('面试') ? 2 : 1;

      db.serialize(() => {
        db.run(
          `INSERT INTO checkins (user_id, task_name, points_earned) VALUES (?, ?, ?)`,
          [req.user.id, task_name, points],
          function(err) {
            if (err) return res.status(500).json({ error: '打卡失败' });
            
            db.run(
              `UPDATE users SET points = points + ? WHERE id = ?`,
              [points, req.user.id],
              function(updateErr) {
                if (updateErr) console.error('Failed to update user points', updateErr);
                res.json({ message: `打卡成功，获得 ${points} 点微光积分！`, points_earned: points });
              }
            );
          }
        );
      });
    }
  );
});

// GET /api/community/history (P2-3 Persist history)
router.get('/history', requireAuth, (req, res) => {
  db.all(
    `SELECT task_name, points_earned, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取打卡历史失败' });
      res.json({ history: rows });
    }
  );
});

// GET /api/community/leaderboard (or status)
router.get('/status', requireAuth, (req, res) => {
  db.get(`SELECT points FROM users WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: '获取积分失败' });
    res.json({ points: row ? row.points : 0 });
  });
});

module.exports = router;
