/* Profile Page Logic */

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('landingc_token');
  if (!token) return;

  loadProfileData(token);
});

async function loadProfileData(token) {
  try {
    // 1. Fetch Diary Entries
    const diaryRes = await fetch('/api/diary/list', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (diaryRes.ok) {
      const diaries = await diaryRes.json();
      renderDiaryList(diaries);
    }

    // 2. Fetch Community Stats (Points)
    const statsRes = await fetch('/api/community/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (statsRes.ok) {
      const stats = await statsRes.json();
      const pointsEl = document.getElementById('statPoints');
      if (pointsEl) pointsEl.textContent = stats.points || 0;
    }

  } catch (err) {
    console.error('Failed to load profile data', err);
  }
}

function renderDiaryList(diaries) {
  const container = document.getElementById('diaryListContent');
  const countEl = document.getElementById('statDiaryCount');
  
  if (!container || !countEl) return;
  
  // Unpack diaries if it's wrapped in an object
  const diaryArray = Array.isArray(diaries) ? diaries : (diaries.diaries || []);
  
  if (!Array.isArray(diaryArray)) {
    console.error('Invalid diaries data:', diaries);
    container.innerHTML = '<div class="empty-state">加载失败，请重试。</div>';
    return;
  }
  
  countEl.textContent = diaryArray.length;

  if (diaryArray.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📔</div>
        <p>暂时还没有记录任何日记，去陪伴站记录一下此刻的心情吧。</p>
        <button onclick="window.location.href='experience.html#tab-diary'" class="auth-btn" style="width: auto; padding: 0.5rem 1.5rem; margin-top: 1.5rem;">去记录</button>
      </div>
    `;
    return;
  }

  const moodEmojis = {
    '焦虑': '😰',
    '低落': '😔',
    '平静': '😐',
    '还不错': '😊'
  };

  const html = diaryArray.map(d => `
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(0,0,0,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; position: relative;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="font-size: 1.5rem;">${moodEmojis[d.mood] || '😐'}</span>
        <span style="font-weight: 600;">${d.mood}</span>
        <span style="color: var(--color-text-muted); font-size: 0.8rem; margin-left: auto;">${new Date(d.created_at).toLocaleString()}</span>
      </div>
      <p style="color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 1rem;">${d.content}</p>
      ${d.ai_feedback ? `
        <div style="background: rgba(56,178,172,0.05); border-radius: 8px; padding: 1rem; font-size: 0.9rem; border-left: 3px solid #38b2ac;">
          <strong style="color: #38b2ac; display: block; margin-bottom: 0.5rem;">微光复盘：</strong>
          <span style="color: var(--color-text-secondary);">${d.ai_feedback}</span>
        </div>
      ` : ''}
    </div>
  `).join('');

  container.innerHTML = html;
}
