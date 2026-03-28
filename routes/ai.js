const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Assuming we want some routes protected
const { PROMPTS, classifyIntent } = require('../utils/prompts');
const { callMinimax } = require('../utils/minimax');
const db = require('../db/database');
const { JWT_SECRET } = require('../utils/auth');
const rateLimit = require('express-rate-limit');

// S5: Anonymous Chat Limit
const anonChatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, 
  max: 20, 
  handler: (req, res, next, options) => {
    if (req.headers.authorization) return next();
    res.status(429).json({ reply: '你的免登录能量已耗尽，请[注册/登录]继续探索。', _activeMode: 'chat' });
  },
  validate: false
});


// POST /api/ai/chat
router.post('/chat', anonChatLimiter, async (req, res) => {
  const { message } = req.body; 

  if (!message) {
    return res.status(400).json({ error: '消息不能为空' });
  }

  // 1. Classify Intent
  const mode = classifyIntent(message);
  let systemPrompt = PROMPTS[mode] || PROMPTS['chat'];

  // 7.5 Prompt A/B Testing Support
  // 50% chance to use Variant B (Highly Empathetic) if enabled
  const isVariantB = (process.env.AB_TEST_ENABLED === 'true') && (Math.random() > 0.5);
  if (isVariantB) {
    systemPrompt += "\n【实验指令】：这段对话中，请比平时展现更多的共情能力，以一个极其温暖、包容的朋友口吻安抚对方。";
  }

  const tk = req.headers.authorization?.split(' ')[1];
  let uid = 0;
  if (tk) {
    try { uid = jwt.verify(tk, JWT_SECRET).id || 0; } catch(e){}
  }

  // Log AI Chat Event (7.1 & 7.5) with anonymous fallback
  db.run(`INSERT INTO user_events (user_id, event_type, event_data) VALUES (?, ?, ?)`,
         [uid, 'ai_chat', JSON.stringify({ mode, variant: isVariantB ? 'B' : 'A', message_len: message.length })]);

  const runMinimaxAndRespond = async (dbHistory) => {
    try {
      // Convert history format if needed
      const formattedHistory = dbHistory.map(msg => ({
        sender_type: (msg.role === 'user' || msg.sender_type === 'USER') ? 'USER' : 'BOT',
        sender_name: (msg.role === 'user' || msg.sender_type === 'USER') ? 'User' : '微光',
        text: msg.content || msg.text
      }));

      // 2. Call Minimax
      const aiResponse = await callMinimax(systemPrompt, message, formattedHistory);
      
      // Safety check: If the response is the hardcoded fallback, we try one more time or log it
      if (aiResponse.includes("离线模式")) {
         console.error("AI returned fallback despite active key.");
      }

      // Save interaction to persistent memory if user is logged in (M8.2)
      if (uid > 0) {
        db.run(`INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'user', ?)`, [uid, message]);
        db.run(`INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'ai', ?)`, [uid, aiResponse]);
      }

      // 3. Return response plus the active mode
      res.json({
        reply: aiResponse,
        _activeMode: mode,
        _variant: isVariantB ? 'B' : 'A'
      });
    } catch (e) {
      console.error("Chat generation failed:", e);
      res.json({ reply: "很抱歉，我刚刚走神了。你能再说一遍吗？", _activeMode: mode });
    }
  };

  if (uid > 0) {
    // Fetch last 20 messages for context (M8.2)
    db.all(`SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 20`, [uid], (err, rows) => {
      let historyToPass = [];
      if (!err && rows) {
        historyToPass = rows.reverse();
      }
      runMinimaxAndRespond(historyToPass);
    });
  } else {
    // Anonymous users rely on max 6 turns of client-passed history
    runMinimaxAndRespond((req.body.history || []).slice(-6));
  }
});

module.exports = router;
