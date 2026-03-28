const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireAuth } = require('../utils/auth');

// GET /api/game/saves
router.get('/saves', requireAuth, (req, res) => {
  db.all(
    `SELECT slot_id, updated_at FROM game_saves WHERE user_id = ? ORDER BY slot_id ASC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取存档失败' });
      res.json({ saves: rows });
    }
  );
});

// GET /api/game/save/:slot_id
router.get('/save/:slot_id', requireAuth, (req, res) => {
  const slotId = parseInt(req.params.slot_id);
  db.get(
    `SELECT game_data, updated_at FROM game_saves WHERE user_id = ? AND slot_id = ?`,
    [req.user.id, slotId],
    (err, row) => {
      if (err) return res.status(500).json({ error: '读取存档失败' });
      if (!row) return res.status(404).json({ error: '存档不存在' });
      res.json({ game_data: JSON.parse(row.game_data), updated_at: row.updated_at });
    }
  );
});

// POST /api/game/save/:slot_id
router.post('/save/:slot_id', requireAuth, (req, res) => {
  const slotId = parseInt(req.params.slot_id);
  if (slotId < 1 || slotId > 3) return res.status(400).json({ error: '仅支持 1-3 号存档位' });
  
  const { game_data } = req.body;
  if (!game_data) return res.status(400).json({ error: '存档数据不能为空' });

  const gameDataStr = JSON.stringify(game_data);

  db.get(
    `SELECT id FROM game_saves WHERE user_id = ? AND slot_id = ?`,
    [req.user.id, slotId],
    (err, row) => {
      if (err) return res.status(500).json({ error: '存取系统错误' });
      
      if (row) {
        db.run(
          `UPDATE game_saves SET game_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [gameDataStr, row.id],
          (updateErr) => {
            if (updateErr) return res.status(500).json({ error: '覆盖存档失败' });
            res.json({ message: '存档覆盖成功', slot_id: slotId });
          }
        );
      } else {
        db.run(
          `INSERT INTO game_saves (user_id, slot_id, game_data) VALUES (?, ?, ?)`,
          [req.user.id, slotId, gameDataStr],
          (insertErr) => {
            if (insertErr) return res.status(500).json({ error: '新建存档失败' });
            res.status(201).json({ message: '存档成功', slot_id: slotId });
          }
        );
      }
    }
  );
});

// POST /api/game/narrative // Fetch AI Narrative Enhancement
router.post('/narrative', requireAuth, async (req, res) => {
  const { eventId, baseText, stats, previousEvents } = req.body;
  if (!baseText) return res.status(400).json({ error: '基础文案不能为空' });

  const { callMinimax } = require('../utils/minimax');
  
  let historyContext = "";
  if (previousEvents && previousEvents.length > 0) {
    historyContext = `\n玩家最近经历了：\n- ${previousEvents.join('\n- ')}\n`;
  }

  const systemPrompt = `你是一个人生模拟游戏的旁白引擎，擅长描写极具社会各阶层真实感的故事情境。
玩家所处阶段：第 ${stats.turn}/${stats.maxTurns} 回合。${historyContext}
玩家当前遇到事件：\n"${baseText}"\n
玩家当前属性：喜悦度${stats.joy}/100, 健康${stats.health}/100, 财富${stats.money}, 选择了${stats.major}专业。
请以此为基础，生成这回合由于玩家上述状态而引发的具体情境。
要求：
1. 必须连贯上下文（如果之前有历史），让故事有连续感。
2. 绝对不能改变"当前事件"的核心意思和走向。引入一些具体的细节（如：清晨的冷风、手机屏幕上的未读消息、空荡荡的冰箱等）来增强代入感。
3. 语气要像一个有洞察力的旁白，富有文学性且写实，字数在 80-120 字。
4. 适度结合现代社会的热点话题（如：AI 工具的使用、加班文化、精致利己、房租压力等）进行描写。`;
  
  try {
    const aiResponse = await callMinimax(systemPrompt, baseText, []);
    res.json({ narrative: aiResponse });
  } catch(err) {
    res.json({ narrative: baseText }); // Dropdown to static text gracefully
  }
});

// POST /api/game/dynamic-event
router.post('/dynamic-event', requireAuth, async (req, res) => {
  const { phase, stats, previousEvents, traits, major } = req.body;
  if (!phase) return res.status(400).json({ error: '阶段参数缺失' });

  const { callMinimax } = require('../utils/minimax');
  
  const phaseDesc = {
    'phase1': '大学即将毕业，寻找第一份工作或考研的阶段',
    'phase2': '步入社会1-2年，初尝职场酸甜苦辣，租房独立生活',
    'phase3': '工作3年左右的职场深水区，面临转型、跳槽或瓶颈',
    'phase4': '沉淀期，开始反思人生意义，寻找真正的内心平静'
  }[phase] || '人生普通阶段';

  let historyContext = "";
  if (previousEvents && previousEvents.length > 0) {
    historyContext = `\n最近经历：\n- ${previousEvents.join('\n- ')}\n`;
  }

  const systemPrompt = `你是一个精密的人生模拟动态事件生成器，专注于捕捉当代社会各个阶层的真实困境与机遇。
玩家所处阶段：${phaseDesc}。${historyContext}
玩家属性：喜悦度${stats.joy}/100, 健康${stats.health}/100, 财富${stats.money}, 专业${major}。
特质：${traits ? traits.join(',') : '无'}。

请以 JSON 格式生成一个极具“真实社会感”的随机事件。
要求：
1. 情境设计要深入浅出，避免低幼化，反映现实劳动力市场、社交压力或个人成长的矛盾。
2. 事件中文案必须细腻且具有代入感。
3. 提供 2-3 个选项，选项的权衡必须具有策略性（例如：牺牲健康换取金钱，或者牺牲社交换取学术成就）。
4. 属性支持：joy, health, money, career, academic, social, creative。
数值通常在 -15 到 15 之间，money 在 -3000 到 3000 之间。

输出格式必须是纯 JSON：
{
  "text": "事件背景描述...",
  "choices": [
    { "text": "选项 A", "effect": { "career": 10, "health": -5 } },
    { "text": "选项 B", "effect": { "joy": 15, "money": -500 } }
  ]
}`;

  try {
    const aiResponse = await callMinimax(systemPrompt, "生成一个当前阶段的随机事件", []);
    // Remove markdown code blocks if any
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const eventObj = JSON.parse(cleanJson);
    res.json(eventObj);
  } catch(err) {
    console.error("Dynamic event generation failed:", err);
    res.status(500).json({ error: '事件生成失败' });
  }
});

module.exports = router;
