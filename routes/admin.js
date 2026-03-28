const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAdmin } = require('../utils/auth');

// Ensure all routes use the admin check
router.use(requireAdmin);

// ==========================================
// User Management
// ==========================================
router.get('/users', (req, res) => {
  db.all('SELECT id, nickname, role, status, points, email, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json({ users: rows });
  });
});

router.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'banned'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update user status' });
    res.json({ message: '用户状态已更新' });
  });
});

// ==========================================
// Story Management
// ==========================================
router.get('/stories', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const query = `
    SELECT s.id, s.content, s.tag, s.empathy_count, s.status, s.created_at, u.nickname 
    FROM stories s 
    LEFT JOIN users u ON s.user_id = u.id 
    ORDER BY s.created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  db.all(query, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stories' });
    res.json({ stories: rows });
  });
});

router.put('/stories/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE stories SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update story status' });
    res.json({ message: '故事状态已更新' });
  });
});

router.delete('/stories/:id', (req, res) => {
  db.run('DELETE FROM stories WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete story' });
    res.json({ message: '故事已删除' });
  });
});

// ==========================================
// Activity Management
// ==========================================
router.get('/activities', (req, res) => {
  const query = `
    SELECT a.id, a.title, a.location, a.event_time, a.status, a.created_at, u.nickname 
    FROM activities a 
    LEFT JOIN users u ON a.user_id = u.id 
    ORDER BY a.created_at DESC LIMIT 50
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch activities' });
    res.json({ activities: rows });
  });
});

router.put('/activities/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending_review'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE activities SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update activity status' });
    res.json({ message: '活动状态已更新' });
  });
});

module.exports = router;
