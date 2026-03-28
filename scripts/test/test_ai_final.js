require('dotenv').config();
const path = require('path');
const minimaxPath = path.join(__dirname, 'utils', 'minimax.js');
const { callMinimax } = require(minimaxPath);

async function testDirect() {
  console.log('Testing Minimax API directly from Project Root...');
  console.log('API Key exists:', !!process.env.MINIMAX_API_KEY);
  
  try {
    const response = await callMinimax('You are a helpful assistant.', 'Hello, this is a direct test.');
    console.log('AI Response:', response);
    
    if (response.includes('离线模式') || response.includes('助手正在升级')) {
      console.error('FAILED: Received fallback response.');
      process.exit(1);
    } else {
      console.log('SUCCESS: Received live AI response.');
      process.exit(0);
    }
  } catch (e) {
    console.error('FATAL API ERROR:', e);
    process.exit(1);
  }
}

testDirect();
