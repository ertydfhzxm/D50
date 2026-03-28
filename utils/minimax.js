const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Manual fallback for env loading if process.env is empty in some contexts
let MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
if (!MINIMAX_API_KEY) {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MINIMAX_API_KEY=(.*)/);
      if (match) MINIMAX_API_KEY = match[1].trim();
    }
  } catch(e) {
    console.error("AI System: Error reading .env fallback", e);
  }
}

// Native fetch is available in Node 18+
const MINIMAX_URL = 'https://api.minimax.chat/v1/chat/completions';


console.log('AI System: API Key Loaded:', !!MINIMAX_API_KEY);


// Remove <think> reasoning chain (from IFS project experience)
function stripThinkTags(text) {
    if (!text) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

/**
 * Call Minimax API. If no API key is provided or the call fails, return a degradation fallback message.
 */
async function callMinimax(systemPrompt, userMessage, history = []) {
  if (!MINIMAX_API_KEY || MINIMAX_API_KEY === 'your_minimax_api_key_here') {
    return handleDegradation(userMessage);
  }

  // A2: Minimax Timeout & Retry
  let attempts = 0;
  while (attempts < 2) {
    try {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
            role: (msg.role === 'user' || msg.sender_type === 'USER') ? 'user' : 'assistant',
            content: msg.content || msg.text
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(MINIMAX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5', 
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
          const errorText = await response.text();
          console.error(`Status: ${response.status}, Body: ${errorText}`);
          throw new Error(`Minimax API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return stripThinkTags(data.choices[0].message.content);
    } catch (error) {
      console.error(`AI Proxy Error (Attempt ${attempts}):`, error.message);
      if (attempts >= 2 || error.name === 'AbortError') {
        return handleDegradation(userMessage);
      }
      // Wait 1s before retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

/**
 * AI Degradation Strategy (M2.4)
 */
function handleDegradation(message) {
  // If the API isn't working, fallback to a local rule-based response
  console.warn('Using AI degradation fallback.');
  const roll = Math.random();
  
  if (message.includes('简历') || message.includes('工作')) {
    return "找工作确实是一件很消耗心力的事情。由于我的智能正在升级中，有时候可能无法给出最深入的陪伴。如果你现在觉得焦虑，不妨去我们的「工具箱」中心做一次3分钟的呼吸冥想，或者去看看「叙事馆」里大家的故事。";
  }
  
  if (roll > 0.5) {
    return "我现在可能有些'断线'了，但我依然在这里陪伴你。允许自己今天什么都不想，这没关系的。";
  } else {
    return "听到你这么说，我很希望能给你更多建议。不过我目前处于离线模式，你可以去「社群共创」看看其他小伙伴今天的微光打卡，也许能获得一些力量。";
  }
}

module.exports = {
  callMinimax
};
