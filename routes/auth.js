const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const nodemailer = require('nodemailer');
const { JWT_SECRET } = require('../utils/auth');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.163.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Register
router.post('/register', async (req, res) => {
  const { nickname, password, email } = req.body;
  if (!nickname || !password || !email) {
    return res.status(400).json({ error: '昵称、密码和邮箱为必填项' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO users (nickname, password, email, force_reset) VALUES (?, ?, ?, 0)`,
      [nickname, hashedPassword, email],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: '该昵称或邮箱已被使用' });
          }
          return res.status(500).json({ error: '注册失败，请稍后再试' });
        }
        
        // V3.0 Send Welcome Email
        if (process.env.SMTP_USER) {
          const mailOptions = {
            from: `"Landing-C Team" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '欢迎来到 Landing-C 🌟',
            html: `<p>嗨 <strong>${nickname}</strong>，</p><p>欢迎加入 Landing-C。在这里，你可以放下防备，慢慢探索属于自己的节奏。如果累了，随时来陪伴空间坐坐。</p><p>祝你今天开心！</p><p>Team Landing-C</p>`
          };
          transporter.sendMail(mailOptions).catch(err => console.error("Welcome Email Error:", err));
        }

        const token = jwt.sign({ id: this.lastID, nickname, role: 'user', force_reset: 0 }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: '注册成功', token, user: { id: this.lastID, nickname, role: 'user', force_reset: 0 } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { nickname, password } = req.body;
  if (!nickname || !password) {
    return res.status(400).json({ error: '昵称和密码为必填项' });
  }

  db.get(`SELECT * FROM users WHERE nickname = ?`, [nickname], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: '登录失败，请稍后再试' });
    }
    if (!user) {
      return res.status(401).json({ error: '昵称不存在或密码错误' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: '昵称不存在或密码错误' });
      }

      const token = jwt.sign({ id: user.id, nickname: user.nickname, role: user.role, force_reset: user.force_reset }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ message: '登录成功', token, user: { id: user.id, nickname: user.nickname, role: user.role, force_reset: user.force_reset } });
    } catch (error) {
      res.status(500).json({ error: '服务器内部错误' });
    }
  });
});

// Get Current User (Required for Header)
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: '登录失效' });
    
    db.get(`SELECT id, nickname, role, nickname as name, points, tags, email, force_reset FROM users WHERE id = ?`, [decoded.id], (dbErr, user) => {
      if (dbErr || !user) return res.status(404).json({ error: '用户不存在' });

      res.json(user);
    });
  });
});

// V3.0 Reset Password Request
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: '邮箱不能为空' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      // Return success anyway to prevent email enumeration
      return res.json({ message: '如果账号存在，重置链接已发送到邮箱' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTemp = await bcrypt.hash(tempPassword, 10);

    db.run(`UPDATE users SET password = ?, force_reset = 1 WHERE id = ?`, [hashedTemp, user.id], (updErr) => {
      if (updErr) return res.status(500).json({ error: '系统错误' });
      
      if (process.env.SMTP_USER) {
        const mailOptions = {
          from: `"Landing-C Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Landing-C 密码重置',
          html: `<p>嗨 <strong>${user.nickname}</strong>，</p><p>您的临时密码是：<strong style="font-size:1.2rem; color:#e11d48;">${tempPassword}</strong></p><p>请使用该密码登录，并在登录后立即修改密码以免带来安全隐患。</p>`
        };
        transporter.sendMail(mailOptions).catch(e => console.error('Reset Email Error:', e));
      }

      res.json({ message: '临时密码已发送到您的邮箱，请查收' });
    });
  });
});

// V3.0 Force / Manual Password Change
router.post('/change-password', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: '密码最少 6 位' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashed = await bcrypt.hash(newPassword, 10);
    
    db.run(`UPDATE users SET password = ?, force_reset = 0 WHERE id = ?`, [hashed, decoded.id], function(err) {
      if (err) return res.status(500).json({ error: '密码修改失败' });
      res.json({ message: '密码已成功更新' });
    });
  } catch(e) {
    res.status(401).json({ error: '登录失效' });
  }
});

module.exports = router;
