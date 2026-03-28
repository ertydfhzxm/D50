const express = require('express');
const router = express.Router();
const { callMinimax } = require('../utils/minimax');
const rateLimit = require('express-rate-limit');

// S4: Tools Limit
const anonToolsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour
  max: 5, // 5 requests per hour for tools
  message: { error: '工具使用过于频繁，请稍后再试或登录以解除限制' },
  validate: { trustProxy: false }
});

router.use(anonToolsLimiter);

// Reusable handler for AI tools
async function handleAITool(req, res, systemPrompt) {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: '输入不可为空' });

  try {
    const aiResponse = await callMinimax(systemPrompt, input, []);
    res.json({ result: aiResponse });
  } catch(err) {
    console.error("AI Tool Error:", err);
    res.status(500).json({ error: 'AI 服务暂时不可用，请稍后再试' });
  }
}

// POST /api/tools/resume-review
router.post('/resume-review', (req, res) => {
  const prompt = `你是一位经验丰富的大厂资深HR和职业规划师。请对我提供的简历内容进行诊断。
要求：
1. 采用结构化输出，分为【亮点优势】、【核心问题】、【优化建议（具体可执行）】。
2. 语气专业、真诚、客观，不要过度夸奖，直接指出痛点。
3. 重点关注匹配度、结果导向（STAR法则）和排版逻辑。
4. 使用 Markdown 格式。`;
  handleAITool(req, res, prompt);
});

// POST /api/tools/mock-interview
router.post('/mock-interview', (req, res) => {
  const prompt = `你现在是一位严厉但公正的面试官。我正在向你描述我的基本情况或我想要面试的岗位。
要求：
1. 针对我的情况，提出 2 个最具挑战性的专业或行为面试问题。
2. 给出一个简短的开场白。
3. 你的回答必须像一个真实的对话，不要生成我的回答。`;
  handleAITool(req, res, prompt);
});

// POST /api/tools/career-explore
router.post('/career-explore', (req, res) => {
  const prompt = `你是一位职业分析师。用户会输入他们的兴趣、专业背景或当前状态。
请为他们推荐 3 个具体的职业方向。
每个方向包括：
1. 职业名称
2. 为什么适合（结合用户输入）
3. 行业前景与平均发展路径
4. 入行需要补充的 1-2 项核心技能
要求采用 Markdown 格式，条理清晰，切实可行，避免空话。`;
  handleAITool(req, res, prompt);
});

// POST /api/tools/action-plan
router.post('/action-plan', (req, res) => {
  const prompt = `你是一位高效的目标管理教练。用户会提供一个目标（如：找到新工作、自学某个技能等）。
请将这个目标拆解为一个切实可行的【4周行动计划】。
要求：
1. 第一周侧重基础准备和心理建设。
2. 将大目标拆解为非常具体、微小、每天可执行的 checklist。
3. 给出可能遇到的阻力及应对方案。
4. 语言使用鼓励、坚定的语气。格式为分块的 Markdown。`;
  handleAITool(req, res, prompt);
});

module.exports = router;
