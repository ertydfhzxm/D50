/* Game Engine */

class GameEngine {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.state = {
      turn: 1,
      maxTurns: 36, // 36 months / turns
      joy: 50,
      health: 80,
      money: 1000,
      academic: 10,
      career: 10,
      social: 10,
      creative: 10,
      
      traits: [], // Array of IDs
      school: null, // '985', '本科', '职校'
      major: null, // 'cs', 'law', etc.
      currentPath: null, // 'study', 'career', 'creative'
      identityStatus: '大学生', // V3.0 Identity Status
      identityTimer: -1,       // -1 means no timer
      
      visitedEvents: [],
      currentEventId: 'start'
    };
  }

  // Load from standard JSON
  loadState(savedState) {
    this.state = { ...this.state, ...savedState };
  }

  // Generate serialization state
  getSaveState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Check if an option is available based on attributes/school
  checkRequirements(req) {
    if (!req) return { ok: true };
    const s = this.state;
    
    if (req.school && s.school !== req.school) return { ok: false };
    if (req.school_not && s.school === req.school_not) return { ok: false };
    
    if (req.major && s.major !== req.major) return { ok: false };
    if (req.major_not && s.major === req.major_not) return { ok: false };

    if (req.academic_min && s.academic < req.academic_min) return { ok: false };
    if (req.career_min && s.career < req.career_min) return { ok: false };
    if (req.social_min && s.social < req.social_min) return { ok: false };
    if (req.creative_min && s.creative < req.creative_min) return { ok: false };
    if (req.money_min && s.money < req.money_min) return { ok: false };
    if (req.health_min && s.health < req.health_min) return { ok: false };
    
    // V3.0 Identity and Phase Checks
    if (req.identityStatus && s.identityStatus !== req.identityStatus) return { ok: false };
    if (req.identityStatus_not && s.identityStatus === req.identityStatus_not) return { ok: false };
    if (req.phase && this.getPhase() !== req.phase) return { ok: false };

    // V3.0 Traits
    if (req.trait && !s.traits.includes(req.trait)) return { ok: false };
    if (req.trait_not && s.traits.includes(req.trait_not)) return { ok: false };

    return { ok: true };
  }

  // Run the option effect
  applyEffect(effect) {
    if (!effect) return '';
    let log = '';
    
    // Add ±20% Randomization (B9 Improvement)
    const randomize = (val) => {
      if (typeof val !== 'number' || val === 0) return val;
      const variance = Math.max(1, Math.ceil(Math.abs(val) * 0.2));
      const drift = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
      return val + drift;
    };

    for (const [key, val] of Object.entries(effect)) {
      if (key === 'currentPath') {
        this.state.currentPath = val;
        continue;
      }
      if (key === 'identityStatus') {
        this.state.identityStatus = val;
        log += `<span class="log-effect" style="color:#d97706; font-weight:bold;">✨ 身份转变：${val}</span> `;
        continue;
      }
      if (key === 'identityTimer') {
        this.state.identityTimer = val;
        continue;
      }
      if (['healthMax', 'baseJoy', 'healthCostMultiplier', 'joyDropRate'].includes(key)) {
        this.state[key] = val;
        continue;
      }
      const finalVal = randomize(val);
      this.state[key] = (this.state[key] || 0) + finalVal;
      
      const icon = { joy: '😊', health: '💪', money: '💰', academic: '🎓', career: '💼', social: '🗣️', creative: '🎨' }[key] || '';
      const colorClass = finalVal >= 0 ? '' : 'negative';
      log += `<span class="log-effect ${colorClass}">${icon} ${key}: ${finalVal >= 0 ? '+' : ''}${finalVal}</span> `;
    }
    return log;
  }

  // Check if the game has reached an ending
  checkEndings() {
    if (this.state.joy <= 0) return { triggered: true, id: 'burnout_joy', title: '情绪崩盘', desc: '你的喜悦值已耗尽。这是一个艰难的时刻，也许你该休息了，去陪伴站找人聊聊吧。' };
    if (this.state.health <= 0) return { triggered: true, id: 'burnout_health', title: '身心透支', desc: '你的健康严重透支。身体是革命的本钱，停下来喘口气。' };
    if (this.state.turn >= this.state.maxTurns) {
      // Hidden Endings (6.3)
      if (this.state.school === '职校' && this.state.money > 5000 && this.state.career > 30) {
        return { triggered: true, id: 'hidden_grassroots', title: '草根逆袭', desc: '起点虽低，但你凭借不懈的努力和精明的商业头脑，实现了令人艳羡的阶层跨越！' };
      }
      if (this.state.major === 'cs' && this.state.money > 8000 && this.state.creative > 30) {
        return { triggered: true, id: 'hidden_indie', title: '独立先锋', desc: '你的产品大卖！从此财富自由，可以去做自己真正热爱的事情了。' };
      }

      if (this.state.money > 10000 && this.state.joy > 40) return { triggered: true, id: 'success_rich', title: '小有所成', desc: '你度过了这段青涩岁月，有了可观的积蓄，对未来充满希望。' };
      if (this.state.career > 50) return { triggered: true, id: 'success_career', title: '职场新星', desc: '你在职场找到了自己的位置，虽然辛苦，但也值得。' };
      if (this.state.identityStatus === '研究生在读') return { triggered: true, id: 'success_master', title: '学术初探', desc: '你的研究生生涯顺利结束，虽有迷茫，但学术之门已向你敞开。' };
      if (this.state.identityStatus === '留学生') return { triggered: true, id: 'success_abroad', title: '海归精英', desc: '你带着不同的视野回到了故土，准备进入全新的人生阶段。' };
      if (this.state.identityStatus === '考公上岸' || this.state.identityStatus === '基层公务员') return { triggered: true, id: 'success_civil', title: '基层公务员', desc: '成功上岸后，体制内的生活平淡而真实，你在平凡的岗位上发光发热。' };
      return { triggered: true, id: 'neutral_normal', title: '平凡之路', desc: '生活依旧在继续，虽然没有大富大贵，但平平安安就是最大的福气。' };
    }
    return { triggered: false };
  }

  // Get current life phase
  getPhase() {
    if (this.state.turn <= 6) return 'phase1';
    if (this.state.turn <= 18) return 'phase2';
    if (this.state.turn <= 30) return 'phase3';
    return 'phase4';
  }

  // Advance one turn
  async advanceTurn(nextEventId) {
    this.state.turn += 1;
    this.state.visitedEvents.push(this.state.currentEventId);
    
    // V3.0 Identity Timer Logic
    if (this.state.identityTimer > 0) {
      this.state.identityTimer -= 1;
      if (this.state.identityTimer === 0) {
        // Graduate/Transition events
        if (this.state.identityStatus === '大学生') this.state.identityStatus = '求职中';
        // More specific graduate events can be triggered by forcing the nextEventId here if we wanted
      }
    }
    
    // Dynamic AI Events trigger (30% chance, overriding static random events)
    if (Math.random() < 0.3) {
      try {
        const prevEventIds = this.state.visitedEvents.slice(-3);
        const previousEvents = prevEventIds.map(id => window.GAME_DATA?.events[id]?.text).filter(Boolean);
        
        const res = await fetch('/api/game/dynamic-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phase: this.getPhase(),
            stats: this.state,
            traits: this.state.traits,
            major: this.state.major,
            currentPath: this.state.currentPath,
            previousEvents
          })
        });
        
        if (res.ok) {
          const aiEvent = await res.json();
          if (aiEvent && aiEvent.text && aiEvent.choices) {
            // Append the actual nextEventId to the AI choices so the game can continue
            aiEvent.choices.forEach(c => {
              if (!c.next) c.next = nextEventId;
            });
            
            const uniqueAiId = `dynamic_ai_${Date.now()}`;
            if (window.GAME_DATA) {
              window.GAME_DATA.events[uniqueAiId] = {
                text: "✨ " + aiEvent.text,
                choices: aiEvent.choices
              };
              this.state.currentEventId = uniqueAiId;
              return; // Successfully injected dynamic event
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic event, falling back to static logic', err);
      }
    }

    // Intercept 'start' to push phase progression instead of looping
    if (nextEventId === 'start' && this.state.turn > 1) {
      // Don't just stay on daily, allow random events to trigger or diverse fallback
      nextEventId = this.getPhase() + '_daily';
    }

    if (GAME_DATA.events[nextEventId] && nextEventId !== this.getPhase() + '_daily') {
      this.state.currentEventId = nextEventId;
    } else {
      // Find a random unvisited event from the phase pool, common pool, or randomEvents pool
      const phasePrefix = this.getPhase() + '_';
      const availableEvents = Object.keys(GAME_DATA.events).filter(id => {
        if (this.state.visitedEvents.includes(id)) return false;
        const ev = GAME_DATA.events[id];
        // Apply path filtering if defined
        if (ev.pathFilter && ev.pathFilter.length > 0 && !ev.pathFilter.includes(this.state.currentPath)) return false;
        
        return (id.startsWith(phasePrefix) || id.startsWith('common_')) && !id.endsWith('_daily');
      });

      // Also consider static randomEvents that haven't been visited as 'id'
      const availableRandom = GAME_DATA.randomEvents.filter(re => {
        if (this.state.visitedEvents.includes(re.id)) return false;
        if (re.pathFilter && re.pathFilter.length > 0 && !re.pathFilter.includes(this.state.currentPath)) return false;
        return true;
      });

      if (availableEvents.length > 0 || availableRandom.length > 0) {
        // Shuffle and pick
        if (availableEvents.length > 0 && (Math.random() < 0.7 || availableRandom.length === 0)) {
          this.state.currentEventId = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        } else {
          // Use a random event from the fixed pool
          const re = availableRandom[Math.floor(Math.random() * availableRandom.length)];
          // Inject it into events so UI can render it
          GAME_DATA.events[re.id] = {
            text: re.text,
            choices: [
              { text: "顺其自然", req: {}, next: this.getPhase() + '_daily', effect: re.effect },
              { text: "主动调整心态", req: {}, next: this.getPhase() + '_daily', effect: Object.assign({}, re.effect, { joy: 5, health: -5 }) }
            ]
          };
          this.state.currentEventId = re.id;
        }
      } else {
        // Diverse Fallback to prevent infinite same-text loop and add choice variety
        const fallbacks = [
          { text: "平淡的一天过去了。你喝了一杯咖啡，看着窗外的车水马龙，思考未来的方向。", effect: { joy: 2 } },
          { text: "又是忙碌而充实的一天，你感觉到自己在时代的浪潮中慢慢沉淀。", effect: { academic: 1, career: 1 } },
          { text: "今天没有太多特别的事发生，平淡也是一种福气。你早早休息了。", effect: { health: 5 } },
          { text: "你在书店偶遇了一本老书，里面的文字让你感触颇深。", effect: { creative: 3, joy: 5 } },
          { text: "晚上的夜空很美，你独自散步，整理了一下最近乱糟糟的信息。", effect: { joy: 5, health: 2 } },
          { text: "你尝试着做了一顿美食，虽然卖相一般，但味道出奇地好。", effect: { creative: 5, joy: 8, money: -50 } },
          { text: "老同学发来消息询问近况，简单的寒暄让你感到一丝温暖。", effect: { social: 5, joy: 5 } },
          { text: "你花了一个下午清理房间，丢掉了一些旧物，心情也跟着明亮起来。", effect: { joy: 10, health: -5 } },
          { text: "今天你在社交媒体上看到一段话，突然觉得自己不应该这么焦虑。", effect: { joy: 15 } },
          { text: "一个老掉牙的电影让你流了泪，情感的宣泄让你轻松了不少。", effect: { creative: 2, joy: 10 } }
        ];
        const fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        const fbId = `fallback_${this.state.turn}_${Math.floor(Math.random() * 1000)}`;
        
        // Multi-choice fallback generator with random routing
        GAME_DATA.events[fbId] = {
          text: fb.text,
          choices: [
            { text: "继续当下的节奏", req: {}, next: 'start', effect: fb.effect },
            { text: "尝试打破常规 (消耗体力)", req: { health_min: 20 }, next: 'start', effect: Object.assign({}, fb.effect, { health: -15, creative: 10, joy: 5 }) },
            { text: "找个树洞倾诉一下", req: {}, next: 'start', effect: { social: 5, joy: 10 } }
          ]
        };
        this.state.currentEventId = fbId;
      }
    }
  }

  // Initial creation stats application
  applyCreationStats() {
    this.state.traits.forEach(traitId => {
      if (!window.GAME_DATA) return;
      const trait = GAME_DATA.traits.find(t => t.id === traitId);
      if (trait && trait.effect) this.applyEffect(trait.effect);
    });

    if (window.GAME_DATA) {
      const school = GAME_DATA.schools.find(s => s.id === this.state.school);
      if (school && school.effect) this.applyEffect(school.effect);
    }
    
    // Ensure we start at the first real event
    this.state.currentEventId = 'start';
    this.state.turn = 1;
  }
}

window.GameEngine = GameEngine;
