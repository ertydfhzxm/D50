const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3005/api';
let token = '';
let userId = '';

async function runTests() {
  console.log('--- Starting API Tests ---');

  try {
    // 1. Auth: Register
    console.log('Testing Register...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'testuser_' + Date.now(), password: 'password123' })
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log('✅ Register Success');
      token = regData.token;
      userId = regData.user.id;
    } else {
      console.error('❌ Register Failed:', regData);
    }

    // 2. Auth: Login
    console.log('Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: regData.user.nickname, password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok) console.log('✅ Login Success');
    else console.error('❌ Login Failed:', loginData);

    // 3. AI: Chat (M2)
    console.log('Testing AI Chat...');
    const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '我最近觉得特别焦虑，感觉什么都做不好', history: [] })
    });
    const chatData = await chatRes.json();
    if (chatRes.ok) {
      console.log('✅ AI Chat Success');
      console.log('   Mode Detected:', chatData._activeMode);
      console.log('   AI Reply:', chatData.reply.substring(0, 30) + '...');
    } else {
      console.error('❌ AI Chat Failed:', chatData);
    }

    // 4. Diary: Save (M2)
    console.log('Testing Diary Save...');
    const diaryRes = await fetch(`${BASE_URL}/diary/save`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ mood: '焦虑', content: '今天面试又挂了，感觉很沮丧。' })
    });
    const diaryData = await diaryRes.json();
    if (diaryRes.ok) {
      console.log('✅ Diary Save Success');
      console.log('   AI Feedback:', diaryData.feedback.substring(0, 30) + '...');
    } else {
      console.error('❌ Diary Save Failed:', diaryData);
    }

    // 5. Stories: Publish (M3)
    console.log('Testing Stories Publish...');
    const storyRes = await fetch(`${BASE_URL}/stories/publish`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tag: '#待业日记', content: '今天依然在努力改简历，哪怕只有一点微光，我也要坚持下去。' })
    });
    const storyData = await storyRes.json();
    if (storyRes.ok) console.log('✅ Story Publish Success');
    else console.error('❌ Story Publish Failed:', storyData);

    // 6. Community: Check-in (M3)
    console.log('Testing Community Check-in...');
    const checkinRes = await fetch(`${BASE_URL}/community/checkin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ task_name: '修改简历' })
    });
    const checkinData = await checkinRes.json();
    if (checkinRes.ok) console.log('✅ Check-in Success:', checkinData.message);
    else console.error('❌ Check-in Failed:', checkinData);

    // 7. Verify Points
    const statusRes = await fetch(`${BASE_URL}/community/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statusData = await statusRes.json();
    console.log('   User Points:', statusData.points);

    // 8. Game: Save & Load (M4)
    console.log('Testing Game Save...');
    const gameState = { turn: 5, health: 70, money: 1200, currentEventId: 'career_path' };
    const saveRes = await fetch(`${BASE_URL}/game/save/1`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ game_data: gameState })
    });
    const saveData = await saveRes.json();
    if (saveRes.ok) console.log('✅ Game Save Success');
    else console.error('❌ Game Save Failed:', saveData);

    console.log('Testing Game Load...');
    const loadRes = await fetch(`${BASE_URL}/game/save/1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const loadData = await loadRes.json();
    if (loadRes.ok && loadData.game_data.turn === 5) {
      console.log('✅ Game Load Success');
    } else {
      console.error('❌ Game Load Failed or Mismatch:', loadData);
    }

    // 9. M6: AI Narrative
    console.log('Testing M6 AI Narrative...');
    const narrRes = await fetch(`${BASE_URL}/game/narrative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        eventId: 'career_path', 
        baseText: '你决定直接工作。你有什么方向？',
        stats: { joy: 50, health: 80, money: 1200, major: 'cs' }
      })
    });
    const narrData = await narrRes.json();
    if (narrRes.ok) {
       console.log('✅ AI Narrative Success');
       console.log('   AI Narrative:', narrData.narrative.substring(0, 50) + '...');
    } else {
       console.error('❌ AI Narrative Failed:', narrData);
    }

    // 10. M7: Telemetry & Tags
    console.log('Testing M7 Telemetry...');
    const telRes = await fetch(`${BASE_URL}/telemetry/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ event_type: 'test_event', event_data: { foo: 'bar' } })
    });
    if (telRes.ok) console.log('✅ Telemetry Event Success');
    else console.error('❌ Telemetry Event Failed');

    console.log('Testing M7 Auto-tagging...');
    const tagRes = await fetch(`${BASE_URL}/telemetry/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ newTag: 'tester_tag' })
    });
    const tagData = await tagRes.json();
    if (tagRes.ok && tagData.tags.includes('tester_tag')) console.log('✅ Tagging Success');
    else console.error('❌ Tagging Failed:', tagData);

    // 11. M8: Social (Requires two users)
    console.log('Setting up User B for Social Tests...');
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: 'testuserB_' + Date.now(), password: 'password123' })
    });
    const regBData = await regBRes.json();
    const tokenB = regBData.token;
    const userBId = regBData.user.id;

    console.log('Assigning common tag to User B...');
    await fetch(`${BASE_URL}/telemetry/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
      body: JSON.stringify({ newTag: 'tester_tag' })
    });

    console.log('Testing M8 Matchmaking...');
    const matchRes = await fetch(`${BASE_URL}/social/match`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const matchData = await matchRes.json();
    if (matchRes.ok) {
      console.log('✅ Matchmaking Success. Match ID:', matchData.match_id);
      const matchId = matchData.match_id;

      console.log('Testing M8 Direct Message...');
      const msgRes = await fetch(`${BASE_URL}/social/message/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: 'Hello from User A!' })
      });
      if (msgRes.ok) console.log('✅ Message Send Success');
      else console.error('❌ Message Send Failed');

      // Small delay for async notification write
      await new Promise(r => setTimeout(r, 500));

      console.log('Testing M8 Notifications (User B)...');
      const notifRes = await fetch(`${BASE_URL}/social/notifications`, {
        headers: { 'Authorization': `Bearer ${tokenB}` }
      });
      const notifData = await notifRes.json();
      if (notifRes.ok && notifData.notifications.length > 0) {
        console.log('✅ userB Notification Received:', notifData.notifications[0].title);
      } else {
        console.error('❌ Notif Failed:', notifData);
      }
    } else {
      console.error('❌ Matchmaking Failed:', matchData);
    }

    console.log('Testing M8 Compliment...');
    const compRes = await fetch(`${BASE_URL}/social/compliment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ to_user: userBId, content: 'You are awesome!' })
    });
    if (compRes.ok) console.log('✅ Compliment Success');
    else console.error('❌ Compliment Failed');

    console.log('--- API Tests Completed ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Script Error:', err);
    process.exit(1);
  }
}

runTests();
