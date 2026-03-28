/* ============================================
   Landing-C — Experience Page JS (V2.0)
   ============================================ */

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:0.8rem 1.5rem;border-radius:12px;z-index:10000;font-size:0.95rem;box-shadow:0 4px 20px rgba(0,0,0,0.3);transition:opacity 0.3s;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function requireLogin(actionDesc) {
  const token = localStorage.getItem('landingc_token');
  if (!token) {
    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
      // Add pulse animation and temporary text change
      const originalText = loginBtn.textContent;
      loginBtn.style.animation = 'pulse 0.6s ease 3';
      loginBtn.textContent = '请先登录 ✨';
      setTimeout(() => { 
        loginBtn.textContent = originalText; 
        loginBtn.style.animation = ''; 
      }, 3000);
    }
    showToast(`请先登录后再${actionDesc} 🔐`);
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initChat();
  initDiary();
  initStories();
  initCheckin();
  initActivities();
  initToolbox();
});

/* --- Tabs --- */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  function switchTab(id) {
    tabs.forEach(b => b.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    const targetBtn = document.querySelector(`[data-tab="${id}"]`);
    if (targetBtn) targetBtn.classList.add('active');
    const targetContent = document.getElementById('tab-' + id);
    if (targetContent) targetContent.classList.add('active');
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-tab');
      switchTab(id);
      window.location.hash = 'tab-' + id;
    });
  });

  // Handle Hash
  if (window.location.hash.startsWith('#tab-')) {
    const id = window.location.hash.replace('#tab-', '');
    switchTab(id);
  }
}

/* --- AI Chat (Real AI via Backend) --- */
let chatHistory = [];
let chatTurnCount = 0;

function initChat() {
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  
  // We need to inject an input area and the new guided UI
  const optionsContainer = document.getElementById('chatOptions');
  optionsContainer.innerHTML = `
    <!-- Module A: Mood Shortcuts -->
    <div class="mood-shortcuts" id="moodShortcuts" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem; padding: 0 1rem;">
      <div class="mood-card" onclick="sendMoodShortcut('我最近感到非常焦虑不安，总觉得来不及了...')" style="background: #fff; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s;">
        <span class="mood-icon">😰</span> 焦虑不安
      </div>
      <div class="mood-card" onclick="sendMoodShortcut('今天觉得很低落，提不起精神...')" style="background: #fff; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s;">
        <span class="mood-icon">😢</span> 低落委屈
      </div>
      <div class="mood-card" onclick="sendMoodShortcut('我有点迷茫，不知道下一步该怎么走。')" style="background: #fff; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s;">
        <span class="mood-icon">🤯</span> 迷茫困惑
      </div>
      <div class="mood-card" onclick="sendMoodShortcut('我很想行动起来，但不知道从何下手，能帮我理理吗？')" style="background: #fff; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s;">
        <span class="mood-icon">💪</span> 想行动
      </div>
    </div>
    
    <!-- Module A: Topic Bubbles -->
    <div class="topic-bubbles" id="topicBubbles" style="display:flex; gap:0.5rem; margin-bottom:0.5rem; padding: 0 1rem; overflow-x:auto;">
      <span class="topic-bubble" onclick="fillChatInput('最近睡眠怎么样？')" style="font-size: 0.85rem; color: #38b2ac; background: rgba(56, 178, 172, 0.1); padding: 0.3rem 0.8rem; border-radius: 12px; cursor: pointer; white-space: nowrap;">最近睡眠怎么样？</span>
      <span class="topic-bubble" onclick="fillChatInput('今天有什么值得开心的事吗？')" style="font-size: 0.85rem; color: #38b2ac; background: rgba(56, 178, 172, 0.1); padding: 0.3rem 0.8rem; border-radius: 12px; cursor: pointer; white-space: nowrap;">今天有什么值得开心的事吗？</span>
      <span class="topic-bubble" onclick="fillChatInput('对于未来，你最担心的是什么？')" style="font-size: 0.85rem; color: #38b2ac; background: rgba(56, 178, 172, 0.1); padding: 0.3rem 0.8rem; border-radius: 12px; cursor: pointer; white-space: nowrap;">对于未来，你最担心的是什么？</span>
    </div>

    <div style="display: flex; gap: 0.5rem; width: 100%; padding: 0.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0;">
      <input type="text" id="aiChatInput" placeholder="告诉微光你的感受..." style="flex:1; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; color: #1a202c; font-size: 1rem;">
      <button id="aiChatSend" style="background: #38b2ac; color: white; border: none; padding: 0 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">发送</button>
    </div>
  `;


  document.getElementById('aiChatSend').addEventListener('click', handleChatSubmit);
  document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
  });
}

// Module A Helpers
window.fillChatInput = function(text) {
  const inputEl = document.getElementById('aiChatInput');
  if (inputEl) {
    inputEl.value = text;
    inputEl.focus();
  }
};

window.sendMoodShortcut = function(text) {
  const inputEl = document.getElementById('aiChatInput');
  if (inputEl) {
    inputEl.value = text;
    handleChatSubmit();
  }
};

async function handleChatSubmit() {
  // Hide shortcuts on any message send
  const shortcuts = document.getElementById('moodShortcuts');
  if (shortcuts) shortcuts.style.display = 'none';
  const bubbles = document.getElementById('topicBubbles');
  if (bubbles) bubbles.style.display = 'none';

  const inputEl = document.getElementById('aiChatInput');
  const text = inputEl.value.trim();
  if (!text) return;

  const token = localStorage.getItem('landingc_token');
  
  // Enforce Registration after 3 turns if not logged in
  if (!token && chatTurnCount >= 3) {
    if (window.triggerLogin) {
      window.triggerLogin();
    } else {
      alert("请先登录或注册以继续深入的陪伴对话。");
    }
    return;
  }

  appendMessage('user', text);
  inputEl.value = '';
  chatHistory.push({ role: 'user', content: text });
  chatTurnCount++;

  showTypingIndicator();

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-6) }) // Send last 6 messages as context
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      removeTypingIndicator();
      if (res.status === 401 || res.status === 403) {
        if (window.triggerLogin) window.triggerLogin();
      } else {
        appendMessage('ai', `抱歉，微光遇到了一个小错误 (${res.status})。可能是由于 API 额度或连接限制，请稍后再试。`);
      }
      return;
    }
    
    const data = await res.json();
    
    if (data.reply) {
      appendMessage('ai', data.reply);
      chatHistory.push({ role: 'ai', content: data.reply });
    } else {
      appendMessage('ai', '抱歉，暂时无法连接到服务器。');
    }
  } catch (err) {
    console.error(err);
    appendMessage('ai', '抱歉，网络似乎出现了问题...');
    showToast('消息发送失败，请检查网络后重试');
  } finally {
    removeTypingIndicator(); // Ensure typing indicator is removed
    const sendBtnFinal = document.getElementById('aiChatSend');
    if (sendBtnFinal) sendBtnFinal.disabled = false;
    inputEl.focus(); // Focus input field
  }
}

function appendMessage(role, text) {
  const chatWindow = document.getElementById('chatWindow');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;
  
  const avatar = role === 'ai' ? '<img src="assets/images/ai-avatar.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">' : '😊';
  msg.innerHTML = `<div class="chat-avatar">${avatar}</div><div class="chat-text">${role === 'ai' ? text : escapeHtml(text)}</div>`;
  
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const chatWindow = document.getElementById('chatWindow');
  const typingEl = document.createElement('div');
  typingEl.id = 'typingIndicator';
  typingEl.className = 'chat-msg ai';
  typingEl.innerHTML = `<div class="chat-avatar"><img src="assets/images/ai-avatar.png" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></div><div class="chat-typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  chatWindow.appendChild(typingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* --- Diary (Real API) --- */
function initDiary() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const submitBtn = document.getElementById('diarySubmit');
  const btnGenerateReview = document.getElementById('btnGenerateReview');

  if (btnGenerateReview) {
    btnGenerateReview.addEventListener('click', handleGenerateReview);
  }

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  submitBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('landingc_token');
    if (!token) {
      if (window.triggerLogin) window.triggerLogin();
      return;
    }

    const selected = document.querySelector('.mood-btn.selected');
    if (!selected) {
      submitBtn.textContent = '请先选一个心情 💛';
      setTimeout(() => { submitBtn.textContent = '记录一下 ✨'; }, 1500);
      return;
    }

    const content = document.getElementById('diaryInput').value.trim();
    if (!content) {
      showToast('写点什么吧 ✍️');
      submitBtn.textContent = '写点什么吧 ✍️';
      setTimeout(() => { submitBtn.textContent = '记录一下 ✨'; }, 1500);
      return;
    }

    const moodMap = {
      'anxious': '焦虑',
      'sad': '低落',
      'neutral': '平静',
      'okay': '还不错'
    };
    const moodScore = selected.getAttribute('data-mood');

    submitBtn.textContent = 'AI 正在为你生成复盘...';
    submitBtn.disabled = true;

    try {
      const token = localStorage.getItem('landingc_token'); // Token moved inside try block, after login check
      const res = await fetch('/api/diary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mood: moodMap[moodScore], content })
      });

      if (res.status === 401 || res.status === 403) {
        if (window.triggerLogin) window.triggerLogin();
        submitBtn.textContent = '记录一下 ✨';
        submitBtn.disabled = false;
        return;
      }

      const data = await res.json();
      
      // Show feedback
      document.querySelector('.mood-selector').style.display = 'none';
      document.getElementById('diaryInput').style.display = 'none';
      submitBtn.style.display = 'none';
      document.querySelector('.diary-hint').style.display = 'none';
      document.querySelector('.diary-header h2').textContent = '已记录 ✅';
      
      const feedbackContainer = document.getElementById('diaryFeedback');
      feedbackContainer.style.display = 'block';
      
      // Inject AI feedback instead of static text
      const fbText = feedbackContainer.querySelector('.feedback-text');
      fbText.innerHTML = `<strong style="color:#38b2ac;">微光的复盘：</strong><br><br>${data.feedback || '你已经很棒了，愿意正视情绪就是进步 🌟'}`;

      if (window.loadDiaryHistory) window.loadDiaryHistory();
    } catch (err) {
      submitBtn.textContent = '保存失败，请重试';
      setTimeout(() => { submitBtn.textContent = '记录一下 ✨'; submitBtn.disabled = false; }, 2000);
    }
  });

  if (window.loadDiaryHistory) window.loadDiaryHistory();
}

async function handleGenerateReview() {
  const btn = document.getElementById('btnGenerateReview');
  const contentEl = document.getElementById('diaryReviewContent');
  const hintEl = document.getElementById('diaryReviewHint');
  const token = localStorage.getItem('landingc_token');

  if (!token) {
    if (window.triggerLogin) window.triggerLogin();
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '🔄 生成中...';
  contentEl.style.display = 'block';
  contentEl.innerHTML = '<div style="text-align:center; color:#e11d48; padding: 1rem 0;">微光正在仔细阅读你的日记，请稍候...</div>';

  try {
    const res = await fetch('/api/diary/review', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`请求失败 (${res.status})`);
    }

    const data = await res.json();
    
    // Convert markdown to simple HTML
    const formattedFeedback = (data.feedback || '')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#9f1239;">$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    contentEl.innerHTML = formattedFeedback;
    btn.innerHTML = '✨ 重新生成';
    btn.disabled = false;
    if (hintEl) hintEl.textContent = `基于最近的 ${data.count} 篇记录生成`;
  } catch (err) {
    console.error(err);
    contentEl.innerHTML = '<div style="color:#e11d48; text-align:center;">抱歉，生成复盘失败，请稍后再试。</div>';
    btn.innerHTML = '✨ 生成 AI 报告';
    btn.disabled = false;
  }
}

window.loadDiaryHistory = async function() {
  const list = document.getElementById('diaryList');
  const token = localStorage.getItem('landingc_token');
  if (!list) return;
  if (!token) {
    list.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">请登录以查看历史记录</p>';
    return;
  }

  try {
    const res = await fetch('/api/diary/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    list.innerHTML = '';
    
    // Toggle review section visibility based on record count
    const diariesArray = data.diaries || [];
    
    // P1-5: Calculate weekly count
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);
    const weeklyDiaries = diariesArray.filter(d => new Date(d.created_at) >= startOfWeek);
    const subText = document.querySelector('.feedback-sub');
    if (subText) subText.textContent = `这是你本周的第 ${weeklyDiaries.length} 篇日记`;

    // P1-6: Update Mood Chart
    const moodCounts = { '开心': 0, '平静': 0, '焦虑': 0, '迷茫': 0, '悲伤': 0, '失落': 0 };
    diariesArray.slice(0, 10).forEach(d => { if (moodCounts[d.mood] !== undefined) moodCounts[d.mood]++; });
    const bars = document.querySelectorAll('.mini-bar');
    const maxCount = Math.max(...Object.values(moodCounts), 1);
    const moodOrder = ['开心', '平静', '焦虑', '迷茫', '悲伤', '失落'];
    bars.forEach((bar, idx) => {
      const mood = moodOrder[idx];
      const count = moodCounts[mood] || 0;
      bar.style.height = `${(count / maxCount) * 100}%`;
    });

    const reviewSection = document.getElementById('diaryReviewSection');
    if (reviewSection) {
      reviewSection.style.display = diariesArray.length >= 3 ? 'block' : 'none';
      if (diariesArray.length < 3) {
        document.getElementById('diaryReviewContent').style.display = 'none';
      }
    }

    if (diariesArray.length > 0) {
      diariesArray.forEach(d => {
        const item = document.createElement('div');
        item.className = 'story-card'; // Reuse style
        item.style.padding = '1rem';
        item.style.marginBottom = '1rem';
        item.style.background = 'rgba(255,255,255,0.4)';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.8rem; color:#64748b;">
            <span>${new Date(d.created_at).toLocaleDateString()}</span>
            <span style="color:#38b2ac; font-weight:600;">${d.mood}</span>
          </div>
          <p style="font-size:0.95rem; color:#334155; line-height:1.6;">${escapeHtml(d.content)}</p>
        `;
        list.appendChild(item);
      });
    } else {
      list.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">暂无记录</p>';
    }
  } catch (err) {
    list.innerHTML = '<p style="color: #ef4444; font-size: 0.9rem;">加载失败</p>';
  }
}

window.resetDiary = function() {
  document.getElementById('diaryInput').value = '';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  
  document.querySelector('.mood-selector').style.display = 'flex';
  document.getElementById('diaryInput').style.display = 'block';
  const submitBtn = document.getElementById('diarySubmit');
  submitBtn.style.display = 'block';
  submitBtn.textContent = '记录一下 ✨';
  submitBtn.disabled = false;
  
  document.querySelector('.diary-hint').style.display = 'block';
  const headerH2 = document.querySelector('.diary-header h2');
  if (headerH2) headerH2.textContent = '今天的心情是？';
  
  document.getElementById('diaryFeedback').style.display = 'none';

  if (window.loadDiaryHistory) window.loadDiaryHistory();
}

/* --- Stories (Narrative Hall API) --- */
async function initStories() {
  const container = document.querySelector('.stories-container');
  // First, we clear the existing mock stories (keeping the header)
  const header = container.querySelector('.stories-header');
  container.innerHTML = '';
  container.appendChild(header);
  
  // Add a CTA for publishing story
  const publishDiv = document.createElement('div');
  publishDiv.innerHTML = `
    <div style="background: rgba(255,107,74,0.04); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid rgba(255,107,74,0.1);">
      <h3 style="color:#1a202c; margin-top:0;">🌟 分享你的微光时刻</h3>
      <textarea id="storyInput" placeholder="写下你的故事（默认匿名发布）..." rows="3" style="width:100%; border-radius:8px; padding:0.8rem; background:#fff; border:1px solid #e2e8f0; color:#334155; margin-bottom:1rem; font-size:1rem;"></textarea>
      <input type="text" id="storyTagInput" placeholder="添加标签 (例: #求职碰壁)" style="width:100%; border-radius:8px; padding:0.8rem; background:#fff; border:1px solid #e2e8f0; color:#334155; margin-bottom:1rem; font-size:1rem;">
      <div style="display: flex; justify-content: flex-end;">
        <button id="storyPublishBtn" class="auth-btn" style="width:auto; display:inline-block; background: var(--color-primary); padding: 0.6rem 2rem;">匿名发布</button>
      </div>
    </div>
  `;
  container.appendChild(publishDiv);

  document.getElementById('storyPublishBtn').addEventListener('click', async () => {
    if (!requireLogin('发布故事')) return; // Added requireLogin check

    const token = localStorage.getItem('landingc_token');
    const content = document.getElementById('storyInput').value.trim();
    const tag = document.getElementById('storyTagInput').value.trim();
    if (!content) return showToast('故事内容不能为空'); // Changed from original diff, keeping existing alert style
    
    document.getElementById('storyPublishBtn').textContent = '审核发布中...';
    try {
      const res = await fetch('/api/stories/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content, tag })
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) {
        document.getElementById('storyInput').value = '';
        document.getElementById('storyTagInput').value = '';
        loadStories(); // Reload
      }
    } catch (err) {
      alert('发布失败，请稍后再试');
    } finally {
      document.getElementById('storyPublishBtn').textContent = '匿名发布';
    }
  });

  loadStories();
}

async function loadStories() {
  const container = document.querySelector('.stories-container');
  // Remove previously loaded story cards if any
  document.querySelectorAll('.story-card').forEach(el => el.remove());

  const token = localStorage.getItem('landingc_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch('/api/stories/list', { headers });
    const data = await res.json();
    
    if (data.stories && data.stories.length > 0) {
      data.stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `
          <div class="story-meta">
            <span class="story-avatar">${escapeHtml(story.nickname)}</span>
            <span class="story-tag">${escapeHtml(story.tag || '#日常')}</span>
            <span class="story-time">${timeAgo(story.created_at)}</span>
          </div>
          <p class="story-text">${escapeHtml(story.content)}</p>
          <div class="story-actions">
            <button class="empathy-btn" onclick="handleRealEmpathy(this, ${story.id})">
              <span class="empathy-icon">🤝</span>
              <span class="empathy-text">共情</span>
              <span class="empathy-count">${story.empathy_count}</span>
            </button>
            <button class="empathy-btn" onclick="handleToggleReplies(${story.id}, this)">
              <span class="empathy-icon">💬</span>
              <span class="empathy-text">暖评</span>
            </button>
          </div>
          <div id="replySection-${story.id}" class="story-replies" style="display:none; margin-top:1rem; border-top:1px solid rgba(0,0,0,0.05); padding-top:1rem;">
            <div class="replies-list" id="repliesList-${story.id}" style="margin-bottom:1rem; font-size:0.9rem; color:#4a5568;"></div>
            <div style="display:flex; gap:0.5rem;">
              <input type="text" id="replyInput-${story.id}" placeholder="说句暖话..." maxlength="100" style="flex:1; border-radius:12px; border:1px solid #e2e8f0; padding:0.5rem 0.8rem; font-size:0.85rem;">
              <button onclick="handleSubmitReply(${story.id})" class="auth-btn" style="width:auto; padding:0.4rem 1rem; font-size:0.85rem; border-radius:12px;">发送</button>
            </div>
            <div class="preset-warm-words" style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.8rem;">
              <button onclick="usePresetReply(${story.id}, '抱抱你 🤗')" style="background:rgba(56,178,172,0.1); border:none; color:#38b2ac; border-radius:8px; padding:0.2rem 0.5rem; font-size:0.75rem; cursor:pointer;">抱抱你 🤗</button>
              <button onclick="usePresetReply(${story.id}, '你不是一个人')" style="background:rgba(56,178,172,0.1); border:none; color:#38b2ac; border-radius:8px; padding:0.2rem 0.5rem; font-size:0.75rem; cursor:pointer;">你不是一个人</button>
              <button onclick="usePresetReply(${story.id}, '好勇敢')" style="background:rgba(56,178,172,0.1); border:none; color:#38b2ac; border-radius:8px; padding:0.2rem 0.5rem; font-size:0.75rem; cursor:pointer;">好勇敢</button>
              <button onclick="usePresetReply(${story.id}, '辛苦了 🌱')" style="background:rgba(56,178,172,0.1); border:none; color:#38b2ac; border-radius:8px; padding:0.2rem 0.5rem; font-size:0.75rem; cursor:pointer;">辛苦了 🌱</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'story-card';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.textContent = '暂无故事，来分享第一个微光时刻吧。';
      container.appendChild(emptyMsg);
    }
  } catch (err) {
    console.error('Failed to load stories', err);
  }
}

/* --- Real Empathy API --- */
window.handleRealEmpathy = async function(btn, storyId) {
  if (btn.classList.contains('empathized')) return;
  
  const token = localStorage.getItem('landingc_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
     const res = await fetch(`/api/stories/${storyId}/empathy`, { method: 'POST', headers });
     if (res.ok) {
       btn.classList.add('empathized');
       const countEl = btn.querySelector('.empathy-count');
       countEl.textContent = parseInt(countEl.textContent) + 1;
       btn.querySelector('.empathy-text').textContent = '已共情';

       const messages = ['我懂你 💛', '你很棒 🌟', '一起加油 ✊', '你不是一个人 🤝'];
       const msg = messages[Math.floor(Math.random() * messages.length)];

       const popup = document.createElement('div');
       popup.className = 'empathy-popup';
       popup.innerHTML = `<p>${msg}</p>`;
       document.body.appendChild(popup);
       setTimeout(() => { popup.style.opacity = '0'; popup.style.transition = 'opacity 0.3s'; setTimeout(() => popup.remove(), 300); }, 1500);
     }
  } catch (err) {
    console.error('Empathy error', err);
  }
}

/* --- Story Replies Logic --- */
window.handleToggleReplies = async function(storyId, btn) {
  const section = document.getElementById(`replySection-${storyId}`);
  if (section.style.display === 'none') {
    section.style.display = 'block';
    loadReplies(storyId);
  } else {
    section.style.display = 'none';
  }
}

async function loadReplies(storyId) {
  const list = document.getElementById(`repliesList-${storyId}`);
  const token = localStorage.getItem('landingc_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`/api/stories/${storyId}/replies`, { headers });
    const data = await res.json();
    if (data.replies && data.replies.length > 0) {
      list.innerHTML = data.replies.map(r => `
        <div style="margin-bottom:0.5rem; line-height:1.4;">
          <strong style="color:var(--color-primary); font-size:0.8rem;">${escapeHtml(r.nickname)}:</strong>
          <span style="color:#475569;">${escapeHtml(r.content)}</span>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color:#94a3b8; font-size:0.8rem; font-style:italic;">暂无回复，留下一段微光暖语吧...</p>';
    }
  } catch (e) {
    list.innerHTML = '<p style="color:#e11d48; font-size:0.8rem;">加载回复失败</p>';
  }
}

window.usePresetReply = function(storyId, text) {
  const input = document.getElementById(`replyInput-${storyId}`);
  if (input) input.value = text;
}

window.handleSubmitReply = async function(storyId) {
  if (!requireLogin('回复故事')) return;

  const input = document.getElementById(`replyInput-${storyId}`);
  const content = input.value.trim();
  if (!content) return showToast('内容不能为空');

  const token = localStorage.getItem('landingc_token');
  try {
    const res = await fetch(`/api/stories/${storyId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (res.ok) {
      if (data.message.includes('合规') || data.message.includes('成功')) {
        input.value = '';
        loadReplies(storyId);
        showToast('回复已发送');
      } else {
        showToast(data.message, 'error');
      }
    } else {
      showToast(data.error || '回复失败', 'error');
    }
  } catch (e) {
    showToast('网络错误', 'error');
  }
}

/* --- Module D: Mindfulness Checkin Logic --- */
let breathingInterval;

window.startMindfulness = function() {
  const btn = document.getElementById('btnMindfulness');
  const container = document.getElementById('mindfulnessContainer');
  const circle = document.getElementById('breathingCircle');
  const statusEl = document.getElementById('breathingStatus');
  const finishBtn = document.getElementById('btnMindfulnessFinish');
  
  if(btn) btn.style.display = 'none';
  if(container) container.style.display = 'block';
  if(finishBtn) finishBtn.style.display = 'none';
  
  const cycleTime = 12000; // 4s in, 4s hold, 4s out
  let cycles = 0;
  
  function breathCycle() {
    if (cycles >= 5) { // Demo: 5 cycles (60s). For 3 mins need 15 cycles.
      clearInterval(breathingInterval);
      circle.textContent = '完成';
      circle.style.transform = 'scale(1)';
      statusEl.textContent = '你做得很好。感受此刻平静的力量。';
      if(finishBtn) finishBtn.style.display = 'inline-block';
      return;
    }
    
    // Inhale (4s)
    circle.style.transition = 'transform 4s ease-in-out';
    circle.style.transform = 'scale(1.4)';
    circle.textContent = '吸气...';
    
    // Hold (4s)
    setTimeout(() => {
      circle.textContent = '保持...';
    }, 4000);
    
    // Exhale (4s)
    setTimeout(() => {
      circle.style.transform = 'scale(1)';
      circle.textContent = '呼气...';
    }, 8000);
    
    cycles++;
  }
  
  // Start first cycle
  breathCycle();
  breathingInterval = setInterval(breathCycle, cycleTime);
}

window.finishMindfulness = function() {
  handleCheckin('正念呼吸', document.getElementById('btnMindfulness'));
  document.getElementById('mindfulnessContainer').style.display = 'none';
  document.getElementById('taskMindfulness').style.display = 'none'; // hide entire task after completion
}

/* --- Check-in Logic --- */
async function initCheckin() {
  const token = localStorage.getItem('landingc_token');
  if (!token) return;

  try {
    // 1. Load current points
    const resStatus = await fetch('/api/community/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataStatus = await resStatus.json();
    if (dataStatus.points !== undefined) {
      const ptsEl = document.getElementById('userPoints');
      if (ptsEl) ptsEl.textContent = dataStatus.points;
    }

    // 2. Load checkin history (P2-3)
    const resHistory = await fetch('/api/community/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataHist = await resHistory.json();
    if (dataHist.history) {
      const historyList = document.getElementById('checkinHistory');
      if (!historyList) return;
      historyList.innerHTML = '';
      
      const today = new Date().toISOString().split('T')[0];
      dataHist.history.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.5rem 0; border-bottom: 1px dashed rgba(0,0,0,0.05); font-size: 0.85rem;';
        
        const isToday = item.created_at.startsWith(today);
        div.innerHTML = `✅ ${new Date(item.created_at).toLocaleTimeString()} - 完成了: ${escapeHtml(item.task_name)}`;
        historyList.appendChild(div);

        // UI Feedback: Mark tasks as done if they are in history for today
        if (isToday) {
          const buttons = document.querySelectorAll('.checkin-btn');
          buttons.forEach(btn => {
            const row = btn.closest('.checkin-item');
            if (row && row.querySelector('h4').innerText === item.task_name) {
              btn.classList.add('done');
              btn.innerText = '已打卡';
              btn.disabled = true;
            }
          });
        }
      });
    }
  } catch(e) { console.error('Failed to load checkin data', e); }
}

window.handleCheckin = async function(taskName, btn) {
  const token = localStorage.getItem('landingc_token');
  if (!token) {
    if (window.triggerLogin) window.triggerLogin();
    return;
  }

  if (btn.classList.contains('done')) return;

  try {
    const res = await fetch('/api/community/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ task_name: taskName })
    });
    const data = await res.json();
    if (res.ok) {
      btn.classList.add('done');
      btn.textContent = '已打卡';
      const pointsEl = document.getElementById('userPoints');
      pointsEl.textContent = parseInt(pointsEl.textContent) + 2;
      
      const history = document.getElementById('checkinHistory');
      if (history.textContent === '暂无记录') history.innerHTML = '';
      const item = document.createElement('div');
      item.style.padding = '0.5rem 0';
      item.style.borderBottom = '1px dashed rgba(0,0,0,0.05)';
      item.textContent = `✅ ${new Date().toLocaleTimeString()} - 完成了: ${taskName}`;
      history.prepend(item);
    } else {
      alert(data.error || '打卡失败');
    }
  } catch (err) {
    alert('网络错误');
  }
}

/* --- Activities Logic --- */
async function initActivities() {
  const list = document.getElementById('activityList');
  const modal = document.getElementById('activityModal');
  const showBtn = document.getElementById('btnShowPublishActivity');
  const closeBtn = document.getElementById('btnCloseActivityModal');
  const submitBtn = document.getElementById('btnSubmitActivity');

  window.openActivityModal = function() {
    const token = localStorage.getItem('landingc_token');
    if (!token) {
      if (window.triggerLogin) window.triggerLogin();
      return;
    }
    if (modal) modal.classList.add('active');
  };

  window.closeActivityModal = function() {
    if (modal) modal.classList.remove('active');
  };

  if (showBtn) showBtn.addEventListener('click', window.openActivityModal);
  if (closeBtn) closeBtn.addEventListener('click', window.closeActivityModal);

  const form = document.getElementById('activityForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('landingc_token');
      if (!token) {
        if (window.triggerLogin) window.triggerLogin();
        return;
      }
      
      const title = document.getElementById('actTitle')?.value.trim();
      const desc = document.getElementById('actDesc')?.value.trim();
      const time = document.getElementById('actTime')?.value.trim(); 
      
      if (!title || !desc || !time) {
        showToast('请填写活动标题、时间和描述 📝');
        return;
      }

      const location = '线下'; // Standardized for now 
      const max_participants = 20;

      const btn = document.getElementById('btnSubmitActivity');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '发布中...';
      }

      try {
        const res = await fetch('/api/activities/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ title, description: desc, location, event_time: time, max_participants })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message || '发布成功');
          window.closeActivityModal();
          form.reset();
          if (typeof switchActivitySubTab === 'function') switchActivitySubTab('my');
        } else {
          const data = await res.json();
          alert(data.error || '申请失败');
        }
      } catch (err) {
        alert('网络错误');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = '立即发布';
        }
      }
    });
  }

  loadActivities();
}

async function loadActivities(mode = 'all') {
  const list = document.getElementById('activityList');
  const token = localStorage.getItem('landingc_token');
  const endpoint = mode === 'my' ? '/api/activities/my' : '/api/activities/list';
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(endpoint, { headers });
    const data = await res.json();
    
    list.innerHTML = '';
    if (data.activities && data.activities.length > 0) {
      data.activities.forEach(act => {
        const div = document.createElement('div');
        div.className = 'activity-card';
        // Add a badge for status in 'my' mode
        const statusBadge = mode === 'my' ? `<span class="act-status-badge ${act.status}" style="font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:10px; background:${act.status === 'approved' ? '#ecfdf5; color:#059669;' : act.status === 'rejected' ? '#fef2f2; color:#dc2626;' : '#fff7ed; color:#ea580c;'}">${act.status === 'approved' ? '已通过' : act.status === 'rejected' ? '已驳回' : '审核中'}</span>` : '';
        
        div.innerHTML = `
          <div class="act-header">
            <span class="act-title">${act.title}</span>
            ${statusBadge || `<span class="act-status">${act.status === 'approved' ? '进行中' : '审核中'}</span>`}
          </div>
          <p class="act-desc">${act.description}</p>
          <div class="act-meta">
            <span>📍 ${act.location || '线下'}</span>
            <span>👥 ${act.current_participants || 0}/${act.max_participants || '15'} 人</span>
          </div>
          ${act.status === 'approved' ? `<button class="act-join-btn" onclick="handleJoinActivity(${act.id}, this)">立即报名</button>` : ''}
        `;
        list.appendChild(div);
      });
    } else {
      list.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 2rem;">${mode === 'my' ? '你还没有发起过任何活动。' : '暂无活动，快来发起第一个吧。'}</div>`;
    }
  } catch (err) {
    list.innerHTML = '加载失败';
  }
}

window.switchActivitySubTab = function(mode) {
  document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`tab-act-${mode}`).classList.add('active');
  loadActivities(mode);
}

window.handleJoinActivity = async function(id, btn) {
  const token = localStorage.getItem('landingc_token');
  if (!token) {
    if (window.triggerLogin) window.triggerLogin();
    return;
  }
  
  try {
    const res = await fetch(`/api/activities/${id}/join`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      btn.textContent = '已报名 ✅';
      btn.style.borderColor = '#cbd5e1';
      btn.style.color = '#94a3b8';
      btn.disabled = true;
      loadActivities(); // Refresh counts
    } else {
      const data = await res.json();
      alert(data.error || '报名失败');
    }
  } catch (err) {
    alert('网络错误');
  }
}

/* =========================================
   Toolbox Logic (P2)
   ========================================= */
function initToolbox() {

  const modal = document.getElementById('toolboxModal');
  const closeBtn = document.getElementById('btnCloseToolboxModal');
  const toolTitle = document.getElementById('toolTitle');
  const toolInput = document.getElementById('toolInput');
  const btnSubmit = document.getElementById('btnSubmitTool');
  const resultArea = document.getElementById('toolResultArea');
  const markdownResult = document.getElementById('toolMarkdownResult');
  const btnReset = document.getElementById('btnResetTool');
  const inputArea = document.getElementById('toolInputArea');

  if (!modal) {
    console.warn("Toolbox Modal not found!");
    return;
  }

  let currentToolId = null;
  const toolDefs = {
    'resume': { 
      title: '简历深度诊断 📝', 
      hint: '请在此粘贴你的简历内容...',
      template: '【我的简历】\n经历：\n技能：\n我的困惑：',
      endpoint: '/api/tools/resume-review' 
    },
    'interview': { 
      title: '模拟面试官 🎯', 
      hint: '请描述你的背景...',
      template: '【面试准备】\n目标岗位：\n目前背景：\n想重点练习的问题：',
      endpoint: '/api/tools/mock-interview' 
    },
    'career': { 
      title: '职业偏好探索 📊', 
      hint: '请描述你的专业或困惑...',
      template: '【职业探索】\n专业背景：\n感兴趣的方向：\n目前的困惑：',
      endpoint: '/api/tools/career-explore' 
    },
    'plan': { 
      title: '周行动清单 💡', 
      hint: '请输入你的核心目标...',
      template: '【本周计划】\n我的目标：\n可用时间：\n目前的阻碍：',
      endpoint: '/api/tools/action-plan' 
    }
  };

  // Improved Modal Open via Event Delegation
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.tool-card');
    if (!card) return;


    const toolId = card.getAttribute('data-tool');
    openToolboxModal(toolId);
  });

  window.openToolboxModal = function(toolId) {
    currentToolId = toolId;
    const def = toolDefs[currentToolId];
    if (!def) return;
    
    const m = document.getElementById('toolboxModal');
    if (!m) return;

    // Reset UI to input mode
    if(toolTitle) toolTitle.innerHTML = def.title;
    if(toolInput) {
      toolInput.placeholder = def.hint;
      toolInput.value = def.template || '';
    }
    if(markdownResult) markdownResult.innerHTML = '';
    if(inputArea) inputArea.style.display = 'block';
    if(resultArea) resultArea.style.display = 'none';
    if(document.getElementById('toolLoader')) document.getElementById('toolLoader').style.display = 'none';
    
    // Show Modal via display and class
    m.style.display = 'flex';
    m.classList.add('active');
  };

  // Close Modal
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      // Removed the 300ms setTimeout to avoid race conditions with quick re-opening
    });
  }

  // Submit Tool
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const input = toolInput.value.trim();
      if (!input) return showToast('请输入内容后再分析'); // Changed from alert to showToast
      if (!requireLogin('使用工具箱')) return; // Added requireLogin check

      const def = toolDefs[currentToolId];
      btnSubmit.disabled = true;
      btnSubmit.textContent = '分析中...';
      
      inputArea.style.display = 'none';
      resultArea.style.display = 'block';
      document.getElementById('toolLoader').style.display = 'block';

      try {
        const res = await fetch(def.endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('landingc_token')}`
          },
          body: JSON.stringify({ input })
        });
        const data = await res.json();
        
        document.getElementById('toolLoader').style.display = 'none';
        
        if (res.ok) {
          let formatted = data.result || '生成失败';
          // Basic formatting
          formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          formatted = formatted.replace(/### (.*)/g, '<h4>$1</h4>');
          formatted = formatted.replace(/## (.*)/g, '<h3>$1</h3>');
          formatted = formatted.replace(/\n/g, '<br>');
          
          markdownResult.innerHTML = formatted;
          // Ensure result area is definitely visible
          resultArea.style.display = 'block';
          inputArea.style.display = 'none';
        } else {
          markdownResult.innerHTML = `<p style="color:#ef4444;">错误: ${data.error || '联调 AI 失败'}</p>`;
        }
      } catch (err) {
        document.getElementById('toolLoader').style.display = 'none';
        markdownResult.innerHTML = '<p style="color:#ef4444;">网络连接错误，请检查服务器状态。</p>';
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '开始分析 ✨';
      }
    });
  }

  // Reset
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inputArea.style.display = 'block';
      resultArea.style.display = 'none';
      markdownResult.innerHTML = '';
    });
  }
}
