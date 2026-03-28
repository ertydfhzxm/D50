const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../utils/auth');

// GET /api/activities/list (Public)
router.get('/list', (req, res) => {
  db.all(
    `SELECT * FROM activities WHERE status = 'approved' ORDER BY event_time ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取活动失败' });
      res.json({ activities: rows });
    }
  );
});

// POST /api/activities/publish (Require Auth)
router.post('/publish', requireAuth, (req, res) => {
  const { title, description, location, event_time, max_participants } = req.body;
  if (!title || !event_time) return res.status(400).json({ error: '标题和时间为必填项' });

  const status = req.user.role === 'admin' ? 'approved' : 'pending_review';

  db.run(
    `INSERT INTO activities (user_id, title, description, location, event_time, max_participants, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, title, description, location, event_time, max_participants || 15, status],
    function (err) {
      if (err) return res.status(500).json({ error: '活动创建失败' });
      res.status(201).json({ message: status === 'approved' ? '活动发布成功' : '活动已提交，等待审核', id: this.lastID });
    }
  );
});

// GET /api/activities/my (Require Auth)
router.get('/my', requireAuth, (req, res) => {
  db.all(
    `SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取我的活动失败' });
      res.json({ activities: rows });
    }
  );
});

// POST /api/activities/:id/join (Require Auth)
router.post('/:id/join', requireAuth, (req, res) => {
  const activityId = req.params.id;
  const userId = req.user.id;

  db.get(`SELECT 1 FROM activity_participants WHERE activity_id = ? AND user_id = ?`, [activityId, userId], (err, participant) => {
    if (err) return res.status(500).json({ error: '数据库错误' });
    if (participant) return res.status(400).json({ error: '你已经报过名啦 🏕️' });

    // Atomic update to prevent race conditions (B2)
    db.run(
      `UPDATE activities SET current_participants = current_participants + 1 WHERE id = ? AND current_participants < max_participants`,
      [activityId],
      function(updErr) {
        if (updErr) return res.status(500).json({ error: '系统异常' });
        
        if (this.changes === 0) {
          // No rows updated means it was full or didn't exist
          return res.status(400).json({ error: '活动已满员或不存在' });
        }
        
        // Success updating count, now safely insert participant
        db.run(`INSERT INTO activity_participants (activity_id, user_id) VALUES (?, ?)`, [activityId, userId], (insErr) => {
          if (insErr) {
            // Rollback count if insert fails (unlikely, but good form)
            db.run(`UPDATE activities SET current_participants = current_participants - 1 WHERE id = ?`, [activityId]);
            return res.status(500).json({ error: '报名记录失败' });
          }
          res.json({ message: '报名成功' });
        });
      }
    );
  });
});


module.exports = router;
