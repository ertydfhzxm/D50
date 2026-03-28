/* Game Database: Traits, Schools, Majors, Events (V3.0 Expanded) */

const GAME_DATA = {
  traits: [
    { id: 'frail', name: '💪 体弱多病', effect: { healthMax: -20 }, desc: '健康上限 -20，容易生病' },
    { id: 'robust', name: '💪 健康体魄', effect: { healthMax: 10 }, desc: '健康上限 +10，耐受高强度压力' },
    { id: 'high_energy', name: '⚡ 高精力', effect: { baseJoy: 10 }, desc: '初始喜悦 +10，干劲十足' },
    { id: 'low_energy', name: '⚡ 低精力', effect: { healthCostMultiplier: 1.5 }, desc: '行动消耗更多健康，容易疲惫' },
    { id: 'genius', name: '🧠 学术天才', effect: { academic: 20 }, desc: '初始学术 +20' },
    { id: 'socialite', name: '🧠 社交达人', effect: { social: 20 }, desc: '初始社交 +20' },
    { id: 'artist', name: '🧠 创意灵魂', effect: { creative: 20 }, desc: '初始创意 +20' },
    { id: 'rich', name: '💰 经济优渥', effect: { money: 2000 }, desc: '初始资金 3000' },
    { id: 'poor', name: '💰 经济拮据', effect: { money: -500 }, desc: '初始资金 500，解锁勤工俭学' },
    { id: 'optimist', name: '🎲 乐天派', effect: { joyDropRate: 0.7 }, desc: '喜悦下降速度变慢' },
    // V3.0 New Traits
    { id: 'charisma', name: '🌟 高颜值', effect: { social: 15, joy: 5 }, desc: '社交场合更有优势，容易积累人脉' },
    { id: 'introvert', name: '🤫 社恐内向', effect: { social: -10, creative: 10 }, desc: '社交困难但内省力强，适合独立创造' },
    { id: 'lucky', name: '🍀 欧皇', effect: { baseJoy: 5 }, desc: '总能遇到意想不到的好事' },
    { id: 'unlucky', name: '💀 非酋', effect: { baseJoy: -5 }, desc: '喝凉水都塞牙的体质' },
    { id: 'silver_spoon', name: '👑 家里有矿', effect: { money: 5000, joy: 10 }, desc: '起点极高，衣食无忧，但也可能因此迷失' }
  ],

  schools: [
    { id: '985', name: '🏆 985/211', effect: { academic: 15, social: 10 }, unlocks: ['baoyan', 'big_tech'] },
    { id: '本科', name: '📘 普通本科', effect: {}, unlocks: [] },
    { id: '职校', name: '🔧 职业院校', effect: { career: 15 }, unlocks: ['blue_collar', 'zhuan_sheng_ben'], locks: ['baoyan', 'big_tech'] }
  ],

  majors: [
    { id: 'cs', name: '💻 计算机', type: 'core', desc: '大厂、独立开发、AI创业' },
    { id: 'law', name: '⚖️ 法律', type: 'core', desc: '律所、法检、法务 (需法考)' },
    { id: 'language', name: '🌐 语言类', type: 'core', desc: '翻译、外企、自由职业' },
    { id: 'civil', name: '🏗️ 土木工程', type: 'core', desc: '基建、地产、设计院' },
    { id: 'med', name: '🏥 医学', type: 'core', desc: '医院、规培、医药企业' },
    { id: 'design', name: '🎨 设计', type: 'core', desc: 'UI/UX、插画、接单' },
    { id: 'biz', name: '💰 商科', type: 'core', desc: '投行、四大、财务' },
    { id: 'science', name: '🔬 数理化', type: 'core', desc: '科研、教培、转码' },
    // V3.0 New Majors
    { id: 'media', name: '🎭 传媒新闻', type: 'core', desc: '记者、编导、新媒体' },
    { id: 'edu', name: '📚 教育师范', type: 'core', desc: '公办教师、教培机构' },
    { id: 'agri', name: '🌾 农学', type: 'core', desc: '选调生、农业科技' },
    { id: 'music', name: '🎵 音乐表演', type: 'core', desc: '乐手、演员、自媒体' },
    { id: 'publicAdmin', name: '🏛️ 公共管理', type: 'core', desc: '考公主力军、行政' }
  ],

  randomEvents: [
    // Core (10)
    { id: 'rand_1', text: "周末连续睡了两个饱觉，感觉身体又充满了力量。", effect: { health: 10, joy: 5 } },
    { id: 'rand_2', text: "突然换季感冒，脑子嗡嗡作响，连着几天没缓过劲。", effect: { health: -15, joy: -5 } },
    { id: 'rand_3', text: "电脑突然坏了，不得不去修理店大出血换了主板。", effect: { money: -800, joy: -10 } },
    { id: 'rand_4', text: "意外帮以前的朋友做了一点小活，拿到了一笔外快红包。", effect: { money: 500, joy: 10 } },
    { id: 'rand_5', text: "参加了同城校友聚会，认识了几个聊得来的新朋友。", effect: { social: 15, joy: 10, money: -100 } },
    { id: 'rand_6', text: "无意间读到一篇非常有启发的行业Paper，感觉茅塞顿开。", effect: { academic: 10, joy: 5 }, pathFilter: ['study', 'career'] },
    { id: 'rand_7', text: "在路边散步时突然涌现出绝佳的点子，赶紧记录下来。", effect: { creative: 15, joy: 5 }, pathFilter: ['creative'] },
    { id: 'rand_8', text: "看着社交媒体上同学的光鲜旅游照，你陷入了深深的同辈焦虑中。", effect: { joy: -15, health: -5 } },
    { id: 'rand_9', text: "今天天气极好，买了一束花，给自己做了一顿好吃的。", effect: { joy: 20, health: 5, money: -50 } },
    { id: 'rand_10', text: "因为粗心错过了公交，导致全勤甚至奖学金评定受影响，心情暴躁。", effect: { money: -200, joy: -15 } },
    // V3.0 Traits Specfic
    { id: 'rand_char_1', text: "因为外形出众，路上被街拍搭讪，心情莫名地变好了。", effect: { joy: 15, social: 5 }, traitFilter: ['charisma'] },
    { id: 'rand_char_2', text: "在活动中因为长得好看被优先照顾，省去了一些麻烦。", effect: { joy: 10, career: 5 }, traitFilter: ['charisma'] },
    { id: 'rand_intro_1', text: "一个人戴着耳机看了一下午云卷云舒，恢复了大量电量。", effect: { joy: 15, health: 10, creative: 5 }, traitFilter: ['introvert'] },
    { id: 'rand_lucky_1', text: "随手买的刮刮乐竟然中奖了！天降横财！", effect: { money: 2000, joy: 20 }, traitFilter: ['lucky'] },
    { id: 'rand_unlucky_1', text: "下雨天走在路边，经过的车溅了你一身泥水，真倒霉。", effect: { joy: -20, health: -5 }, traitFilter: ['unlucky'] },
    { id: 'rand_rich_1', text: "家里给你转了一笔零花钱，让你不要亏待自己。", effect: { money: 3000, joy: 10 }, traitFilter: ['silver_spoon'] },
    // Identity Specific
    { id: 'rand_student_1', text: "期末周连抽转，虽然疲惫但学到了很多东西。", effect: { academic: 15, health: -10 }, identityFilter: ['大学生'] },
    { id: 'rand_master_1', text: "组会汇报被导师夸奖了，这真是难得的一天。", effect: { academic: 15, joy: 20 }, identityFilter: ['研究生在读'] },
    { id: 'rand_jobless_1', text: "半夜睡不着，看着天花板陷入了漫长的人生虚无感。", effect: { joy: -20, health: -10 }, identityFilter: ['待业中', '求职中'] },
    { id: 'rand_jobless_2', text: "尝试做了一周的规律作息，意外感觉精神面貌好了很多。", effect: { joy: 15, health: 15 }, identityFilter: ['待业中', '求职中'] },
    { id: 'rand_worker_1', text: "被迫晚上加班处理毫无意义的PPT，十分抓狂。", effect: { joy: -15, health: -10, career: 5 }, identityFilter: ['在职', '基层公务员'] },
    { id: 'rand_worker_2', text: "发工资了！看着银行卡余额，觉得再累也值得。", effect: { joy: 20, money: 5000 }, identityFilter: ['在职', '基层公务员'] },
    // V3.0+ Social Realities (10)
    { id: 'rand_soc_1', text: "某地房租大涨，你不得不考虑搬到更远但更便宜的郊区。", effect: { money: -500, social: -10, health: -5 } },
    { id: 'rand_soc_2', text: "AI 工具大火，你花了一个周末学习如何使用它，效率大幅提升。", effect: { career: 15, creative: 10, health: -5 } },
    { id: 'rand_soc_3', text: "公司突然开始严抓考勤，甚至连如厕时间都要记录，极其压抑。", effect: { joy: -20, health: -5 } },
    { id: 'rand_soc_4', text: "你关注的一个博主突然‘翻车’了，让你对互联网人设产生了深深的怀疑。", effect: { creative: 5, joy: -5 } },
    { id: 'rand_soc_5', text: "偶然发现楼下的深夜食堂，老板的故事让你觉得生活还有希望。", effect: { joy: 15, health: 5 } },
    { id: 'rand_soc_6', text: "由于行业政策变动，你原本看好的赛道突然降温，心情低落。", effect: { career: -15, joy: -10 } },
    { id: 'rand_soc_7', text: "你尝试着做了一周‘电子斋戒’，不看社交媒体，意外发现焦虑减轻了。", effect: { joy: 20, health: 10 } },
    { id: 'rand_soc_8', text: "偶然刷到高中同学在国外做数字游民的生活，你心生向往又感到现实沉重。", effect: { creative: 10, joy: -10 } },
    { id: 'rand_soc_9', text: "由于长期伏案工作，你的腰椎发出了尖锐的警报，不得不去医院复健。", effect: { money: -600, health: -20, joy: -5 } },
    { id: 'rand_soc_10', text: "你在社区二手群里卖掉了一些旧物，不仅赚了钱还清空了负累。", effect: { money: 300, joy: 10 } },
    // V3.5 New Expansions
    { id: 'rand_soc_11', text: "今年流行的某小众运动在朋友圈刷屏，你跟风体验了一次，感觉非常解压。", effect: { health: 15, joy: 15, money: -300 } },
    { id: 'rand_soc_12', text: "突然收到一张陌生人的结婚请帖，硬着头皮去随了份子钱。", effect: { money: -800, joy: -10, social: 5 } },
    { id: 'rand_soc_13', text: "连续吃了一周外卖，你的肠胃终于发出了抗议...", effect: { health: -20, joy: -5 } },
    { id: 'rand_soc_14', text: "在二手书店意外淘到一本绝版专业书，里面还有前主人的密密麻麻的批注。", effect: { academic: 25, joy: 20 } },
    { id: 'rand_soc_15', text: "你的一个好朋友突然决定离开这座城市回老家，送别的那天晚上你失眠了。", effect: { joy: -20, social: -10 } },
    { id: 'rand_soc_16', text: "尝试做了一周的极简主义者（断舍离），房间变空了，心也变静了。", effect: { joy: 20, health: 10 } },
    { id: 'rand_soc_17', text: "由于极端恶劣天气，航班/高铁延误了一整晚，在候车大厅睡得腰酸背痛。", effect: { health: -25, joy: -20 } },
    { id: 'rand_soc_18', text: "你顺手帮路边的阿姨解答了一个智能手机使用问题，她送了你几个刚摘的橘子。", effect: { joy: 20, social: 10 } },
    { id: 'rand_soc_19', text: "在地铁上听完了某个硬核科普播客，感觉脑海里某条神经被打通了。", effect: { academic: 15, creative: 10, joy: 5 } },
    { id: 'rand_soc_20', text: "因为睡前报复性熬夜刷短视频，第二天一整个上午都像在梦游。", effect: { health: -15, joy: -10, career: -5 } },
    { id: 'rand_soc_21', text: "花了一个月工资买了一件心仪已久的贵重物品，虽然肉疼但也获得了巨大满足。", effect: { money: -5000, joy: 40 } },
    { id: 'rand_soc_22', text: "不小心下载了一个流氓软件，被各种弹窗广告折磨了三天三夜。", effect: { joy: -15, health: -5 } }
  ],

  events: {
    start: {
      text: "毕业季的喧嚣即将落幕（或者你早已离开校园）。站在人生的又一个十字路口，你的首要目标是什么？",
      choices: [
        { text: "准备深入学习深造", req: {}, next: "study_path", effect: { academic: 10, joy: -5, currentPath: 'study', identityStatus: '大学生' } },
        { text: "立刻投身波澜壮阔的职场", req: {}, next: "career_path", effect: { career: 10, health: -5, currentPath: 'career', identityStatus: '求职中' } },
        { text: "尝试自由发展或创业", req: {}, next: "creative_path", effect: { creative: 10, money: -200, currentPath: 'creative', identityStatus: '自由职业' } }
      ]
    },
    
    // ==========================================
    // 学习线 / Study Core
    // ==========================================
    study_path: {
      text: "你决定在学术上提升自己。你要选择哪条路？",
      pathFilter: ['study'],
      choices: [
        { text: "争取保研/直博名额", req: { school_not: '职校', academic_min: 30 }, next: "baoyan_success", effect: { joy: 10, social: 5 }, lockReason: "平时成绩不足" },
        { text: "报名冲刺考研", req: { school_not: '职校' }, next: "kaoyan_prep", effect: { joy: -10, health: -10, academic: 10 }, lockReason: "需本科学历" },
        { text: "申请海外留学", req: { money_min: 5000 }, next: "study_abroad", effect: { money: -5000, joy: 5, social: 10 }, lockReason: "启动资金不足五千" },
        { text: "备战专升本", req: { school: '职校' }, next: "zhuan_sheng_ben", effect: { academic: 20, joy: -10 }, lockReason: "仅职业院校适用" }
      ]
    },

    kaoyan_prep: {
      text: "考研是一场孤独的苦行。你在自习室里从夏日蝉鸣坐到冬日飞雪。临考前状态不佳，你想放弃吗？",
      choices: [
        { text: "咬牙死磕，成败在此一举", req: { health_min: 20 }, next: "kaoyan_result_hard", effect: { academic: 30, joy: -20, health: -30 }, lockReason: "身心已经到达极限" },
        { text: "尽人事听天命，顺其自然", req: {}, next: "kaoyan_result_soft", effect: { academic: 10, joy: 10, health: 10 } },
        { text: "实在撑不住了，中途弃考找工作", req: {}, next: "job_hunt_late", effect: { joy: -20, health: 20, identityStatus: '求职中' } }
      ]
    },

    kaoyan_result_hard: {
      text: "成绩放榜！你每天拼死拼劳的复习终于有了结果。",
      choices: [
        { text: "高分上岸！", req: { academic_min: 50 }, next: "master_life_1", effect: { joy: 50, career: 20, identityStatus: '研究生在读', identityTimer: 9 }, lockReason: "学识积累不足，未能高分上岸" },
        { text: "差几分，只能调剂", req: {}, next: "master_life_1", effect: { joy: -10, academic: 10, identityStatus: '研究生在读', identityTimer: 9 } },
        { text: "遗憾落榜（转求职）", req: {}, next: "job_hunt_late", effect: { joy: -30, health: -10, identityStatus: '求职中' } },
        { text: "不甘心，二战！", req: {}, next: "kaoyan_prep", effect: { joy: -20, health: -10, money: -2000, identityStatus: '待业中' } }
      ]
    },

    kaoyan_result_soft: {
      text: "成绩放榜。因为中间有所懈怠，成绩出来时你在边缘试探。",
      choices: [
        { text: "勉强压线进入复试！", req: { academic_min: 30 }, next: "master_life_1", effect: { joy: 30, identityStatus: '研究生在读', identityTimer: 9 }, lockReason: "分数低于国家线" },
        { text: "落榜了，接受现实找工作", req: {}, next: "job_hunt_late", effect: { joy: -10, identityStatus: '求职中' } }
      ]
    },

    baoyan_success: {
      text: "你成功保研！身边同学还在苦苦挣扎时，你已经有大把空闲时间了。",
      choices: [
        { text: "提前进组做打工人", req: {}, next: "master_life_1", effect: { academic: 25, career: 10, joy: -10, identityStatus: '研究生在读', identityTimer: 9 } },
        { text: "去心仪的大厂实习", req: {}, next: "master_life_1", effect: { career: 20, money: 3000, health: -5, identityStatus: '研究生在读', identityTimer: 9 } },
        { text: "彻底摆烂，环游全国", req: { money_min: 3000 }, next: "master_life_1", effect: { joy: 40, money: -3000, identityStatus: '研究生在读', identityTimer: 9 }, lockReason: "经费不足" }
      ]
    },

    study_abroad: {
      text: "跨越重洋，你开始了留学生活。语言障碍和繁重的课业接踵而至。",
      choices: [
        { text: "疯狂参加活动融入老外圈", req: { social_min: 20 }, next: "abroad_life_1", effect: { social: 30, joy: 10, money: -2000, identityStatus: '留学生', identityTimer: 6 }, lockReason: "太怂了不敢开口" },
        { text: "在华人圈里抱团取暖", req: {}, next: "abroad_life_1", effect: { social: 10, joy: 20, health: 5, identityStatus: '留学生', identityTimer: 6 } },
        { text: "闭门苦读，拿全A", req: {}, next: "abroad_life_1", effect: { academic: 30, joy: -15, social: -10, identityStatus: '留学生', identityTimer: 6 } }
      ]
    },

    zhuan_sheng_ben: {
      text: "经过艰苦的备考，你成功升入本科，但发现一切又要从头开始，同学们似乎更强了。",
      choices: [
        { text: "自卑作祟，拼命卷成绩", req: {}, next: "study_path", effect: { academic: 20, joy: -15, health: -10, identityStatus: '大学生' } },
        { text: "看开点，正常读完找工作", req: {}, next: "career_path", effect: { joy: 10, career: 10, identityStatus: '求职中' } }
      ]
    },

    master_life_1: {
      text: "【研一季】你的研究生导师分配了极其不合理的横向项目，占用你大量个人时间。",
      choices: [
        { text: "忍气吞声，通宵完成", req: {}, next: "master_life_2", effect: { academic: 15, health: -20, joy: -15 }, lockReason: "身体吃不消通宵" },
        { text: "阳奉阴违，偷偷搞自己方向", req: { creative_min: 20 }, next: "master_life_2", effect: { creative: 15, joy: 5, academic: -10 }, lockReason: "你缺乏自主研究的想法" },
        { text: "直接跟导师硬刚争取权益", req: { social_min: 40 }, next: "master_life_2", effect: { social: 20, joy: 10, academic: -20 }, lockReason: "你不够圆滑，不敢开口" }
      ]
    },

    master_life_2: {
      text: "【研二季】核心期刊需要一篇一作小论文才能毕业。你因为实验数据出问题，进度严重落后。",
      choices: [
        { text: "推翻重来，住进实验室", req: { health_min: 40 }, next: "master_life_3", effect: { academic: 30, joy: -30, health: -30 }, lockReason: "健康不允许你这么拼" },
        { text: "换个水题，凑合发了算了", req: {}, next: "master_life_3", effect: { academic: 5, joy: -5, career: -5 } },
        { text: "向同门师兄/师姐求助抱大腿", req: { social_min: 30, trait: 'charisma' }, next: "master_life_3", effect: { social: 15, joy: 10, academic: 10 }, lockReason: "平时不维系人脉，别人不鸟你" }
      ]
    },

    master_life_3: {
      text: "【研三季】毕业论文答辩终于结束。带着沉重的黑眼圈，你面临着下一步抉择。（即将毕业离校）",
      choices: [
        { text: "申请读博", req: { academic_min: 60 }, next: "study_path", effect: { academic: 20, joy: -20, identityStatus: '大学生' }, lockReason: "学术成果不足以申博" },
        { text: "拿硕士学历去拼大厂", req: {}, next: "big_tech_interview", effect: { career: 20, joy: 10, identityStatus: '求职中' } },
        { text: "考公考编，求稳", req: {}, next: "kaogong_prep", effect: { joy: -10, identityStatus: '求职中' } }
      ]
    },

    abroad_life_1: {
      text: "【海外漂泊】房租贵得离谱，为了赚取生活费，你想找份兼职。",
      choices: [
        { text: "去中餐馆端盘子刷碗", req: {}, next: "abroad_life_2", effect: { money: 3000, health: -20, joy: -10 } },
        { text: "做留学中介抽成/代购", req: { social_min: 30 }, next: "abroad_life_2", effect: { money: 5000, social: 15, joy: 5 }, lockReason: "社交能力弱，找不到客源" },
        { text: "家里有钱，不需要打工", req: { trait: 'silver_spoon' }, next: "abroad_life_2", effect: { joy: 20, health: 10 }, lockReason: "你不是富二代" }
      ]
    },

    abroad_life_2: {
      text: "【海外漂泊】毕业在即。此时国内秋招已经开始，但你人在国外存在时差和面试不便。",
      choices: [
        { text: "努力留在海外发展", req: { career_min: 40 }, next: "work_abroad", effect: { career: 30, joy: -10, social: -10, identityStatus: '在职' }, lockReason: "职业技能不足以在海外拿offer" },
        { text: "参加跨国线上面试卷国内大厂", req: {}, next: "big_tech_interview", effect: { career: 10, health: -15, identityStatus: '求职中' } },
        { text: "不管了先回国 Gap 一段时间", req: {}, next: "gap_year", effect: { joy: 30, health: 10, identityStatus: '待业中' } }
      ]
    },

    work_abroad: {
      text: "你成功拿到海外工作签证，开始了异国他乡的职场生涯。这里崇尚 Work-Life Balance，但天花板隐约可见。",
      choices: [
        { text: "享受生活，按时下班喝咖啡", req: {}, next: "routine_life", effect: { joy: 30, health: 20, money: 3000, career: -10 } },
        { text: "打破透明天花板，疯狂表现", req: { career_min: 50 }, next: "routine_life", effect: { career: 20, money: 5000, health: -20 }, lockReason: "能力仍需积累" }
      ]
    },

    // ==========================================
    // 职场/求职线 / Career Core
    // ==========================================
    career_path: {
      text: "你决定找工作。面对不确定的市场，你将主攻哪个方向？",
      pathFilter: ['career'],
      choices: [
        { text: "死磕一线互联网大厂", req: { school_not: '职校' }, next: "big_tech_interview", effect: { career: 5, joy: -10 }, lockReason: "学历初筛没过" },
        { text: "全职备考公务员/事业编", req: {}, next: "kaogong_fulltime_1", effect: { joy: -15, health: -10, academic: 15, currentPath: 'civil' } },
        { text: "国企/外企/私企海投", req: {}, next: "normal_job_search", effect: { career: 10, joy: 5 } },
        { text: "转行蓝领/下基层", req: {}, next: "blue_collar_job", effect: { career: 20, health: -15, money: 1000 } }
      ]
    },

    job_hunt_late: {
      text: "别人早早拿了offer，你现在才开始找工作，错过了校招的黄金期。焦虑感如潮水般涌来。",
      choices: [
        { text: "海投几百份简历，拼了！", req: {}, next: "normal_job_search", effect: { joy: -20, health: -15, career: 10 } },
        { text: "花钱报个求职辅导保offer班", req: { money_min: 5000 }, next: "normal_job_search", effect: { money: -5000, joy: 10, career: 20 }, lockReason: "没钱报班" },
        { text: "摆烂了，决定在家蹲着做全职儿女", req: {}, next: "gap_year", effect: { joy: 10, money: -1000, identityStatus: '待业中' } }
      ]
    },

    big_tech_interview: {
      text: "终于盼到了某大厂的二面，面试官面无表情地让你手撕一道Hard级的算法/专业题。",
      choices: [
        { text: "疯狂输出，完美解题！", req: { academic_min: 40, career_min: 20 }, next: "big_tech_offer", effect: { career: 30, joy: 30 }, lockReason: "硬技能不足以手撕Hard题" },
        { text: "结结巴巴思路混乱，凉凉", req: {}, next: "job_hunt_fail", effect: { joy: -20, health: -10 } },
        { text: "用幽默和沟通化解尴尬，提供思路", req: { social_min: 40 }, next: "big_tech_offer", effect: { career: 15, joy: 10, social: 15 }, lockReason: "不善表达，场面极其尴尬" }
      ]
    },

    big_tech_offer: {
      text: "你收到了大厂的 Offer！薪资诱人，但入职后发现完全是大、小周甚至996的节奏。",
      choices: [
        { text: "为了钱，卷死这群同事！", req: {}, next: "worker_life_1", effect: { money: 8000, career: 20, health: -30, joy: -20, identityStatus: '在职' } },
        { text: "悄悄摸鱼，绝不加班", req: {}, next: "worker_life_1", effect: { money: 5000, health: 10, joy: 10, career: -10, identityStatus: '在职' } }
      ]
    },

    job_hunt_fail: {
      text: "连续几次面试失利，你的锐气被磨平了不少。简历还在投，但每天都像在走黑夜的隧道。",
      choices: [
        { text: "降低期望，去小公司苟着", req: {}, next: "worker_life_smb", effect: { career: 5, money: 3000, joy: -10, identityStatus: '在职' } },
        { text: "不将就，继续死磕好公司", req: { money_min: 2000 }, next: "big_tech_interview", effect: { joy: -15, money: -1000 }, lockReason: "身上钱不够支撑长时间待业了" },
        { text: "回老家，接受父母安排", req: {}, next: "routine_life", effect: { joy: -20, money: 2000, social: 10, identityStatus: '在职' } }
      ]
    },

    worker_life_1: {
      text: "【职场修行】直属领导分配给你的任务越来越多，而且全是没人愿意接的烫手山芋。同时大老板要考核了。",
      choices: [
        { text: "据理力争，拒绝不合理要求", req: { social_min: 50 }, next: "worker_life_2", effect: { social: 20, joy: 10, career: -10 }, lockReason: "你没胆量和领导掀桌" },
        { text: "慢慢吞下，疯狂加班完成", req: {}, next: "worker_life_2", effect: { career: 20, money: 2000, health: -30 }, lockReason: "身体亮红灯，吃不消了" },
        { text: "趁机拉拢其他同事一起甩锅", req: { trait: 'charisma' }, next: "worker_life_2", effect: { social: 30, joy: 15, career: 10 }, lockReason: "你在公司里是个透明人，拉不动" }
      ]
    },

    worker_life_2: {
      text: "【职场修行】公司效益下滑，开始传出裁员风波。HR频繁找人约谈，气氛很压抑。",
      choices: [
        { text: "四处打探消息，开始看机会", req: {}, next: "worker_life_3", effect: { career: 10, joy: -15, social: 10 } },
        { text: "两耳不闻窗外事，疯狂展示绩效", req: { career_min: 60 }, next: "worker_life_3", effect: { career: 25, money: 3000, health: -15 }, lockReason: "你手头没有拿得出手的核心产出" },
        { text: "我不干了！拿 N+1 赔偿裸辞！", req: {}, next: "gap_year", effect: { money: 10000, joy: 40, health: 10, identityStatus: '待业中' } }
      ]
    },

    worker_life_3: {
      text: "【职场修行】你熬过了优化期，迎来了年度晋升答辩。竞争对手是一个极其擅长做PPT汇报的人。",
      choices: [
        { text: "用扎实的硬干货数据碾压他", req: { career_min: 80 }, next: "routine_life", effect: { career: 30, money: 8000, joy: 20 }, lockReason: "你的业绩并不能造成绝对碾压" },
        { text: "用比他更绚丽的PPT和故事战胜他", req: { creative_min: 50 }, next: "routine_life", effect: { creative: 20, money: 6000, joy: 10 }, lockReason: "你的PPT像上个世纪的产物" },
        { text: "佛系随缘，没上去就算了", req: {}, next: "routine_life", effect: { joy: 10, health: 10, money: 1000 } }
      ]
    },

    worker_life_smb: {
      text: "【小公司生存】公司是个几十人的草台班子，老板每天都会画出各种不切实际的大饼，朝令夕改。",
      choices: [
        { text: "跟着画饼，狐假虎威混成心腹", req: { social_min: 40 }, next: "routine_life", effect: { money: 4000, social: 20, joy: -10 }, lockReason: "你没有这种察言观色的本领" },
        { text: "做好本分工作，骑驴找马", req: {}, next: "job_hunt_late", effect: { career: 10, money: 2000, joy: -15, identityStatus: '求职中' } },
        { text: "忍受不了这种SB老板，当场掀桌子", req: {}, next: "gap_year", effect: { joy: 50, money: -1000, health: 10, identityStatus: '待业中' } }
      ]
    },

    routine_life: {
      text: "日子就这样一天天平淡地过去，工作成了谋生工具，你渐渐习惯了这种早出晚归的规律节奏。",
      choices: [
        { text: "下班后搞点副业/爱好", req: {}, next: "routine_life", effect: { creative: 15, money: 1000, joy: 10 } },
        { text: "纯粹摆烂，打游戏刷剧", req: {}, next: "routine_life", effect: { health: -5, joy: 15, career: -5 } },
        { text: "寻求突破，辞职创业去！", req: { money_min: 10000 }, next: "creative_path", effect: { joy: 20, money: -5000, identityStatus: '创业者' }, lockReason: "没钱别随便裸辞创业" }
      ]
    },

    // ==========================================
    // 考公考编线 / Civil Servant
    // ==========================================
    kaogong_fulltime_1: {
      text: "全职备考。别人都在分享发薪水的喜悦，只有你还在出租屋里做着永无止境的申论和行测。",
      choices: [
        { text: "耐住寂寞，题海战术", req: { health_min: 30 }, next: "kaogong_result", effect: { academic: 25, joy: -20, health: -15 }, lockReason: "颈椎病犯了，根本坐不住" },
        { text: "去报个天价的面试保过班", req: { money_min: 10000 }, next: "kaogong_result", effect: { money: -10000, academic: 40, joy: -10 }, lockReason: "家里没矿，报不起两万的班" },
        { text: "三天打鱼两天晒网", req: {}, next: "kaogong_result", effect: { academic: -10, joy: 10, health: 10 } }
      ]
    },

    kaogong_result: {
      text: "省考出成绩了。你屏住呼吸输入了准考证号，页面缓缓加载...",
      choices: [
        { text: "高分进面！最终成功上岸！", req: { academic_min: 70 }, next: "civil_life_1", effect: { joy: 100, money: 1000, social: 30, identityStatus: '考公上岸' }, lockReason: "行测申论基本功不达标，差零点几分" },
        { text: "无缘进面，心灰意冷", req: {}, next: "job_hunt_late", effect: { joy: -40, health: -10, identityStatus: '求职中' } },
        { text: "没中，但我还要考！（二战三战）", req: { money_min: 2000 }, next: "kaogong_fulltime_1", effect: { joy: -20, money: -2000, identityStatus: '待业中' }, lockReason: "弹尽粮绝，必须打工了" }
      ]
    },

    civil_life_1: {
      text: "【体制内】你被分配到了一个偏远街道办/基层单位。文件堆积如山，还会被老同志甩锅。",
      choices: [
        { text: "勤勤恳恳，任劳任怨（当老黄牛）", req: {}, next: "civil_life_2", effect: { career: 15, health: -20, joy: -15 }, lockReason: "你受不了高强度的形式主义操作" },
        { text: "学会太极推手，绝不接锅", req: { social_min: 40 }, next: "civil_life_2", effect: { social: 20, joy: 10, career: -10 }, lockReason: "你不懂体制内的人情世故" },
        { text: "靠写材料出众，引起借调机会", req: { creative_min: 40 }, next: "civil_life_2", effect: { creative: 20, career: 25, joy: -10 }, lockReason: "你写不出八股文大部头" }
      ]
    },

    civil_life_2: {
      text: "【体制内】工作逐渐步入正轨，相亲成了别人关心的重点。有个条件看起来不错的人...",
      choices: [
        { text: "听从安排，去见一见", req: {}, next: "routine_life", effect: { social: 15, joy: 10, money: -500 } },
        { text: "果断拒绝，搞事业要紧", req: {}, next: "routine_life", effect: { career: 10, joy: -5 } },
        { text: "我已经有对象了，谢谢", req: { trait: 'charisma' }, next: "routine_life", effect: { joy: 20, health: 10 }, lockReason: "凭本事单身" }
      ]
    },

    // ==========================================
    // 自由创造线 / Creative & Gap
    // ==========================================
    creative_path: {
      text: "没有固定的公司，没有按时的工资。你完全靠自己在这个社会立足。你打算着手做什么？",
      pathFilter: ['creative'],
      choices: [
        { text: "全身心投入自媒体/爆款短视频", req: { creative_min: 30 }, next: "media_creator", effect: { creative: 20, joy: -10, money: -1000 }, lockReason: "网感太差，不知道拍什么" },
        { text: "独立开发APP/做个人外包工作室", req: { major: 'cs', money_min: 2000 }, next: "indie_hacker", effect: { career: 20, joy: 5, money: -2000 }, lockReason: "缺乏技术实现能力或启动资金" },
        { text: "实在没方向，先出去 Gap 体验生活吧", req: {}, next: "gap_year", effect: { joy: 30, health: 20, money: -2000, identityStatus: '待业中' } }
      ]
    },

    media_creator: {
      text: "做自媒体的日子：每天绞尽脑汁想脚本，剪视频到深夜。你的第一条视频发布了...",
      choices: [
        { text: "居然爆了！涨了五万粉！", req: { creative_min: 60 }, next: "media_success", effect: { social: 40, money: 2000, joy: 50 }, lockReason: "你的内容过于平淡，无人在意" },
        { text: "只有几十个播放，全是朋友捧场", req: {}, next: "media_fail", effect: { joy: -20, health: -10 } },
        { text: "花钱买点薯条/DOU+碰碰运气", req: { money_min: 1500 }, next: "media_fail", effect: { money: -1500, joy: -10, social: 10 }, lockReason: "囊中羞涩" }
      ]
    },

    media_fail: {
      text: "持续大半年，几组账号都没做起来，存款快见底了。身边的人也在劝你找个正经工作。",
      choices: [
        { text: "最后拼一把，把剩下的钱全投进去", req: { money_min: 3000 }, next: "media_success", effect: { money: -3000, creative: 30, joy: 20 }, lockReason: "实在没钱了" },
        { text: "认输了，老老实实去上班", req: {}, next: "job_hunt_late", effect: { joy: -30, career: 10, identityStatus: '求职中' } },
        { text: "做点小生意/去摆摊续命", req: {}, next: "small_business", effect: { money: 1000, health: -15, joy: -5 } }
      ]
    },

    media_success: {
      text: "账号做起来了！甲方开始找你接商单，你体会到了不用打卡就能赚钱的快感。但数据焦虑也随之而来。",
      choices: [
        { text: "接烂恰饭恰饱，趁没凉多赚钱", req: {}, next: "routine_life", effect: { money: 15000, social: -20, joy: -15 } },
        { text: "顶住压力，坚持做精品内容", req: { creative_min: 70 }, next: "routine_life", effect: { creative: 30, money: 5000, joy: 20, social: 30 }, lockReason: "你快江郎才尽了" }
      ]
    },

    indie_hacker: {
      text: "每天在一平米的书桌前敲代码，你的第一个产品上线了。",
      choices: [
        { text: "被各种收录，斩获 Product Hunt 榜单！", req: { creative_min: 60, career_min: 30 }, next: "routine_life", effect: { money: 20000, career: 40, joy: 50 }, lockReason: "产品打磨还不够惊艳" },
        { text: "无人问津，0 销量，甚至有 bug 被喷", req: {}, next: "media_fail", effect: { joy: -30, health: -10, creative: -10 } }
      ]
    },

    small_business: {
      text: "你去网红夜市支了个摊子卖烤肠/手打柠檬茶。每天风吹日晒，还要躲城管。",
      choices: [
        { text: "咬牙坚持，和城管斗智斗勇", req: { health_min: 40 }, next: "routine_life", effect: { money: 4000, health: -20, social: 10 }, lockReason: "你扛不住这种高强度体力活" },
        { text: "太累了，还是去上班吧", req: {}, next: "job_hunt_late", effect: { joy: -15, identityStatus: '求职中' } }
      ]
    },

    gap_year: {
      text: "你开启了 Gap Year！时间完全属于自己。这天，父母打电话来问你未来的打算。",
      choices: [
        { text: "敷衍过去，继续快乐躺平", req: {}, next: "gap_year_2", effect: { joy: 10, social: -10, health: 5 } },
        { text: "说出实情，大吵一架", req: {}, next: "gap_year_2", effect: { joy: -30, health: -10 } },
        { text: "用精心包装的人生规划说服他们", req: { social_min: 30 }, next: "gap_year_2", effect: { social: 20, joy: 15 }, lockReason: "你不知道怎么圆这个谎" }
      ]
    },

    gap_year_2: {
      text: "Gap 几个月后，存款大幅缩水。每天睡到中午起，其实内心深处有些空虚甚至焦虑。",
      choices: [
        { text: "强行振作，开始投简历找工作", req: {}, next: "job_hunt_late", effect: { career: 10, joy: -10, identityStatus: '求职中' } },
        { text: "去干点日结兼职/跑外卖续命", req: {}, next: "gap_year_2", effect: { money: 1500, health: -20, joy: -15 } },
        { text: "重新寻找人生的热爱和目标", req: { creative_min: 40 }, next: "creative_path", effect: { creative: 20, joy: 20 }, lockReason: "长期摆烂，动力全无" }
      ]
    },
    // V3.0+ New Reality Events
    common_ai_scam: {
      text: "你收到一个视频电话，画面里是你的‘老同学’急需借钱。但你总觉得对方说话的动作有些生硬，这可能是最新的 AI 换脸诈骗。",
      choices: [
        { text: "立刻报警并转告共同好友", req: { social_min: 30 }, next: "start", effect: { social: 20, joy: 10 } },
        { text: "迟疑中被对方的话术带偏，转了一小笔钱", req: {}, next: "start", effect: { money: -2000, joy: -30 } },
        { text: "冷静挂断，并在朋友圈科普防诈知识", req: { creative_min: 20 }, next: "start", effect: { creative: 10, social: 10, joy: 5 } }
      ]
    },
    phase2_flatmate_drama: {
      text: "【租房风云】合租的室友不仅总是在半夜大声打游戏，还不爱清理公共区域的垃圾。你已经忍到了极限。",
      choices: [
        { text: "正式进行严肃沟通，制订公约", req: { social_min: 40 }, next: "start", effect: { social: 15, joy: 10, health: 5 } },
        { text: "忍气吞声，自己在屋里戴耳塞", req: {}, next: "start", effect: { joy: -20, health: -10 } },
        { text: "宁愿多花钱，立马找中介看整租", req: { money_min: 5000 }, next: "start", effect: { money: -3000, joy: 20, health: 10 }, lockReason: "存款不足以支持整租" }
      ]
    },
    phase3_career_plateau: {
      text: "【职场深水区】你在现在的岗位上已经驾轻就熟，但每天重复的工作让你感觉自己像是在生锈。晋升之路漫长，跳槽风险巨大。",
      choices: [
        { text: "寻找内部转岗机会，挑战新业务", req: { career_min: 50 }, next: "start", effect: { career: 20, joy: 5, health: -10 } },
        { text: "开启‘慢就业’模式，工作只要 60 分即可", req: {}, next: "start", effect: { joy: 15, health: 15, career: -20 } },
        { text: "利用业余时间打造个人 IP，寻求变现", req: { creative_min: 50 }, next: "creative_path", effect: { creative: 25, joy: 10, health: -15 } }
      ]
    },
    common_digital_detox: {
      text: "你决定进行一次为期三天的‘离线挑战’。关掉手机，不看屏幕。最初的戒断反应让你抓狂，但渐渐地...",
      choices: [
        { text: "你重新找回了专注力，看完了三本书", req: { academic_min: 30 }, next: "start", effect: { academic: 20, joy: 25, health: 10 } },
        { text: "你感到与世界脱节，半天就放弃了", req: {}, next: "start", effect: { joy: -5, health: -5 } },
        { text: "你开始练习冥想，察觉到了内心的平静", req: { creative_min: 30 }, next: "start", effect: { creative: 20, joy: 30 } }
      ]
    },
    common_job_ai_impact: {
      text: "行业里突然传出某大公司引入 AI 替代了整个初级岗位部门的消息。你的职业安全感降到了冰点。",
      choices: [
        { text: "连夜更新简历，寻找更具不可替代性的职位", req: { career_min: 60 }, next: "career_path", effect: { career: 20, joy: -10, health: -15 } },
        { text: "自暴自弃，觉得反正最后都要被替代", req: {}, next: "start", effect: { joy: -30, career: -20 } },
        { text: "积极拥抱 AI，将其作为自己的提效副驾驶", req: { creative_min: 40 }, next: "start", effect: { creative: 30, career: 15, joy: 5 } }
      ]
    }
  }
};

window.GAME_DATA = GAME_DATA;
