/* Game UI Binder */

document.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  const token = localStorage.getItem('landingc_token');
  
  async function loadUserProfile() {
    if (!token) {
      const saveBtn = document.getElementById('btnSaveGame');
      if (saveBtn) saveBtn.style.display = 'none';
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) {
          avatarEl.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname}`;
        }
        
        // navUsername is handled by auth.js checkLoginStatus
        
        const saveBtn = document.getElementById('btnSaveGame');
        if (saveBtn) saveBtn.style.display = 'inline-block';
      }
    } catch (e) {
      console.warn('Failed to load fresh user profile', e);
    }
  }

  loadUserProfile();

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('landingc_token');
      localStorage.removeItem('landingc_user');
      location.reload();
    });
  }

  // Navigation
  function showScreen(id) {
    console.log('Switching to screen:', id);
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.remove('active');
      el.style.display = 'none'; 
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
      target.scrollTop = 0;
    } else {
      console.warn('Screen not found:', id);
    }
    // On mobile, ensure dashboard is closed when switching screens
    const dashboard = document.querySelector('.game-dashboard');
    if (dashboard) dashboard.classList.remove('open');
  }

  // Mobile Sidebar Toggle
  const toggleBtn = document.getElementById('dashboardToggle');
  const dashboard = document.querySelector('.game-dashboard');
  if (toggleBtn && dashboard) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dashboard.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (dashboard && dashboard.classList.contains('open') && !dashboard.contains(e.target) && e.target !== toggleBtn) {
        dashboard.classList.remove('open');
      }
    });
  }

  const btnNew = document.getElementById('btnNewGame');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      console.log('New Game clicked');
      engine.resetState();
      try {
        initCreationWizard();
      } catch (e) {
        console.error('Wizard init failed:', e);
      }
      showScreen('screen-creation');
    });
  }

  /* Wizard Logic */
  function initCreationWizard() {
    console.log('Initializing creation wizard...');
    // 1. Render Traits
    const traitGrid = document.getElementById('traitGrid');
    traitGrid.innerHTML = '';
    GAME_DATA.traits.forEach(t => {
      const card = document.createElement('div');
      card.className = 'trait-card';
      card.setAttribute('data-id', t.id);
      card.innerHTML = `<div class="trait-title">${t.name}</div><div class="trait-desc">${t.desc}</div>`;
      card.addEventListener('click', () => {
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
        } else {
          if (traitGrid.querySelectorAll('.selected').length < 2) {
            card.classList.add('selected');
          }
        }
        document.querySelector('[data-next="step-school"]').disabled = traitGrid.querySelectorAll('.selected').length === 0;
      });
      traitGrid.appendChild(card);
    });

    // 2. School Logic
    document.querySelectorAll('.school-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.school-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.querySelector('[data-next="step-major"]').disabled = false;
      });
    });

    // 3. Render Majors
    const majorGrid = document.getElementById('majorGrid');
    majorGrid.innerHTML = '';
    GAME_DATA.majors.forEach(m => {
      const card = document.createElement('div');
      card.className = 'major-card';
      card.setAttribute('data-id', m.id);
      card.innerHTML = `<div class="trait-title">${m.name}</div><div class="trait-desc">${m.desc}</div>`;
      card.addEventListener('click', () => {
        document.querySelectorAll('.major-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('btnStartSimulation').disabled = false;
      });
      majorGrid.appendChild(card);
    });
  }

  // Wizard Nav Buttons
  document.querySelectorAll('.next-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.creation-step');
      if (parent) parent.style.display = 'none';
      const nextId = btn.getAttribute('data-next');
      const nextEl = document.getElementById(nextId);
      if (nextEl) nextEl.style.display = 'block';
    });
  });
  document.querySelectorAll('.prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.creation-step');
      if (parent) parent.style.display = 'none';
      const prevId = btn.getAttribute('data-prev');
      const prevEl = document.getElementById(prevId);
      if (prevEl) prevEl.style.display = 'block';
    });
  });

  // Start Simulation
  document.getElementById('btnStartSimulation').addEventListener('click', async function() {
    this.disabled = true;
    this.textContent = '初始化中...';
    
    // Collect choices
    const traits = Array.from(document.getElementById('traitGrid').querySelectorAll('.selected')).map(el => el.getAttribute('data-id'));
    const schoolBtn = document.getElementById('schoolGrid').querySelector('.selected');
    const school = schoolBtn ? schoolBtn.getAttribute('data-id') : '本科';
    const majorEl = document.getElementById('majorGrid').querySelector('.selected');
    const major = majorEl ? majorEl.getAttribute('data-id') : 'cs';

    engine.state.traits = traits;
    engine.state.school = school;
    engine.state.major = major;

    engine.applyCreationStats();
    updateDashboard();
    renderEvent(); // Render initial event
    showScreen('screen-main');
    
    // Reset button state for next time
    setTimeout(() => {
      this.disabled = false;
      this.textContent = '开始模拟';
    }, 1000);
  });

  /* Main Game Loop */
  function updateDashboard() {
    const s = engine.state;
    document.getElementById('bar-joy').style.width = Math.min(100, s.joy) + '%';
    document.getElementById('bar-health').style.width = Math.min(100, s.health) + '%';
    document.getElementById('val-money').textContent = s.money;
    document.getElementById('val-turn').textContent = s.turn;

    document.getElementById('val-academic').textContent = s.academic;
    document.getElementById('val-career').textContent = s.career;
    document.getElementById('val-social').textContent = s.social;
    document.getElementById('val-creative').textContent = s.creative;

    const traitNames = s.traits.map(id => GAME_DATA.traits.find(t => t.id === id)?.name).join(' | ');
    const schoolName = GAME_DATA.schools.find(sch => sch.id === s.school)?.name || s.school;
    const majorName = GAME_DATA.majors.find(m => m.id === s.major)?.name || s.major;

    document.getElementById('profileInfo').innerHTML = `
      <span>🎓 ${schoolName} - ${majorName}</span>
      <span>🌟 ${traitNames || '平平无奇'}</span>
    `;
  }

  function renderEvent() {
    const eventId = engine.state.currentEventId;
    const ev = GAME_DATA.events[eventId];
    if (!ev) return;

    const hist = document.getElementById('terminalHistory');
    const log = document.createElement('div');
    log.className = 'log-entry';
    
    // Initial render with a loading indicator for the AI narrative.
    // Base text is hidden initially to let AI define the storytelling if applicable.
    log.innerHTML = `
      <div class="log-turn">第 ${engine.state.turn} 回合 <span class="ai-loading" style="font-size:0.75rem;color:#38b2ac;margin-left:8px;">[AI 推演中...]</span></div>
      <div class="log-text"></div>
    `;
    hist.appendChild(log);
    hist.scrollTop = hist.scrollHeight;

    const actions = document.getElementById('terminalActions');
    actions.innerHTML = '<div class="action-options"></div>';
    actions.style.opacity = '1';
    actions.style.pointerEvents = 'auto';
    const optsContainer = actions.querySelector('.action-options');

    // Render actions instantly but disable them during AI generation
    const actionBtns = [];
    ev.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'action-btn locked'; // Temporarily locked
      btn.disabled = true;
      
      const reqCheck = engine.checkRequirements(choice.req);
      
      if (!reqCheck.ok) {
        btn.innerHTML = `${choice.text} <span class="lock-reason">(锁定: ${choice.lockReason || '未满足条件'})</span>`;
        btn.dataset.permanentlyLocked = "true";
      } else {
        btn.textContent = choice.text;
        btn.addEventListener('click', () => handleChoice(choice));
      }
      optsContainer.appendChild(btn);
      actionBtns.push(btn);
    });

    const unlockButtons = () => {
      actionBtns.forEach(btn => {
        if (!btn.dataset.permanentlyLocked) {
          btn.classList.remove('locked');
          btn.disabled = false;
        }
      });
      const loader = log.querySelector('.ai-loading');
      if (loader) loader.remove();
    };

    // Async call to enhance text via Minimax
    setTimeout(async () => {
      let finalText = ev.text; // Default to base text
      try {
        if (ev.choices.length > 0 && eventId !== 'dynamic_random') {
          const token = localStorage.getItem('landingc_token');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

          // Get context
          const prevEventIds = engine.state.visitedEvents.slice(-3);
          const previousEvents = prevEventIds.map(id => GAME_DATA.events[id]?.text).filter(Boolean);

          const res = await fetch('/api/game/narrative', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ 
              eventId, 
              baseText: ev.text, 
              stats: engine.state,
              previousEvents 
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (res.ok) {
            const data = await res.json();
            if (data.narrative && data.narrative !== ev.text) {
              finalText = data.narrative;
            }
          }
        }
      } catch (e) {
        console.warn('Narrative enhancement bypassed or timed out', e);
      } finally {
        // Typewriter effect
        const textEl = log.querySelector('.log-text');
        const chars = finalText.split('');
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < chars.length) {
            textEl.innerHTML += chars[i];
            i++;
          } else {
            clearInterval(typeInterval);
            unlockButtons(); // Unlock only after typing completes
            hist.scrollTop = hist.scrollHeight;
          }
        }, 15);
      }
    }, 100);
  }

  async function handleChoice(choice) {
    // Immediately disable buttons to prevent double-clicks
    const actions = document.getElementById('terminalActions');
    if (actions) {
      actions.querySelectorAll('button').forEach(btn => btn.disabled = true);
      actions.style.opacity = '0.5';
      actions.style.pointerEvents = 'none';
    }

    if (choice.effect) engine.applyEffect(choice.effect);
    
    // Log self outcome briefly
    const hist = document.getElementById('terminalHistory');
    const log = document.createElement('div');
    log.innerHTML = `<div class="log-effect" style="color:#a0aec0;">▶ 你选择了: ${choice.text}</div>`;
    hist.appendChild(log);

    const ending = engine.checkEndings();
    if (ending.triggered) {
      document.getElementById('endingTitle').textContent = ending.title;
      document.getElementById('endingDesc').textContent = ending.desc;
      
      // F4: Send Telemetry Data
      const tk = localStorage.getItem('landingc_token');
      if (tk && ending.id !== 'start') {
        fetch('/api/telemetry/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tk}` },
          body: JSON.stringify({
            event_type: 'game_end',
            details: { title: ending.title, joy: engine.state.joy, health: engine.state.health, money: engine.state.money, turn: engine.state.turn, major: engine.state.major }
          })
        }).catch(e => console.warn('Telemetry end-game failed', e));
      }

      // Q6: Clear History
      document.getElementById('terminalHistory').innerHTML = '';

      // Render stats summary
      const statsEl = document.getElementById('endingStats');
      const s = engine.state;
      statsEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 400px; margin: 2rem auto;">
          <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(246,173,85,0.2);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">😊</div>
            <div style="color: #f6ad55; font-size: 1.5rem; font-weight: 700;">${s.joy}</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">喜悦</div>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(252,129,129,0.2);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💪</div>
            <div style="color: #fc8181; font-size: 1.5rem; font-weight: 700;">${s.health}</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">健康</div>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(104,211,145,0.2);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
            <div style="color: #68d391; font-size: 1.5rem; font-weight: 700;">${s.money}</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">资金</div>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 12px; text-align: center; border: 1px solid rgba(56,178,172,0.2);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
            <div style="color: #38b2ac; font-size: 1.5rem; font-weight: 700;">${s.turn}</div>
            <div style="color: #94a3b8; font-size: 0.8rem;">回合</div>
          </div>
        </div>
        <p style="color: #64748b; font-size: 0.85rem; margin-top: 1rem;">经历了 ${s.visitedEvents.length} 个事件节点</p>
      `;
      
      showScreen('screen-ending');
      return;
    }

    await engine.advanceTurn(choice.next);
    updateDashboard();
    renderEvent();
  }

  /* Save/Load Interstitial */
  document.getElementById('btnSaveGame').addEventListener('click', () => {
    openSaveLoadModal('save');
  });
  document.getElementById('btnOpenLoadModal').addEventListener('click', () => {
    const tk = localStorage.getItem('landingc_token');
    if (!tk) {
      if (window.triggerLogin) window.triggerLogin();
      return;
    }
    openSaveLoadModal('load');
  });

  window.closeSaveLoadModal = function() {
    document.getElementById('saveLoadModal').classList.remove('active');
  }

  async function openSaveLoadModal(mode) {
    document.getElementById('slModalTitle').textContent = mode === 'save' ? '保存游戏' : '读取存档';
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '<div style="color:#a0aec0;text-align:center;">加载中...</div>';
    document.getElementById('saveLoadModal').classList.add('active');

    try {
      const token = localStorage.getItem('landingc_token');
      const res = await fetch('/api/game/saves', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      
      container.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const existing = data.saves ? data.saves.find(s => s.slot_id === i) : null;
        const slotEl = document.createElement('div');
        slotEl.className = 'save-slot';
        
        let infoHtml = `<div class="save-slot-info"><h4>存档位 ${i}</h4><p>${existing ? '记录于 ' + new Date(existing.updated_at).toLocaleString() : '空位'}</p></div>`;
        let btnHtml = `<button class="game-btn-outline">${mode === 'save' ? (existing ? '覆盖' : '保存') : '读取'}</button>`;
        if (mode === 'load' && !existing) btnHtml = '';

        slotEl.innerHTML = infoHtml + btnHtml;

        const actionBtn = slotEl.querySelector('button');
        if (actionBtn) {
          actionBtn.addEventListener('click', () => {
            if (mode === 'save') performSave(i);
            else performLoad(i);
          });
        }
        container.appendChild(slotEl);
      }
    } catch (err) {
      container.innerHTML = '<div style="color:#fc8181;text-align:center;">加载存档失败</div>';
    }
  }

  async function performSave(slotId) {
    try {
      const token = localStorage.getItem('landingc_token');
      const res = await fetch(`/api/game/save/${slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_data: engine.getSaveState() })
      });
      if (res.ok) {
        alert('保存成功！');
        closeSaveLoadModal();
      } else {
        alert('保存失败。');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function performLoad(slotId) {
    try {
      const token = localStorage.getItem('landingc_token');
      const res = await fetch(`/api/game/save/${slotId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        engine.loadState(data.game_data);
        updateDashboard();
        
        document.getElementById('terminalHistory').innerHTML = '<div class="log-entry"><div class="log-text" style="color:#38b2ac;">[系统] 存档已读取，你回到了过去的节点...</div></div>';
        
        renderEvent();
        closeSaveLoadModal();
        showScreen('screen-main');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Initial screen
  console.log('Game UI Initialized. Triggering screen-start...');
  showScreen('screen-start');
});
