const TOOLBOX_RESOURCES = {
  'resume-template': {
    title: '📄 空白期友好简历模板',
    content: `
### 如何在简历中处理“空白期”？

1. **项目化描述**：将空白期的自我提升、独立开发或自由职业经历写成“项目经历”。
2. **技能聚焦**：强调在此期间习得的新技术栈。
3. **诚实积极**：在简历末尾或自我评价中简述：“202X.XX - 202X.XX 处于个人调整与技术深造期，期间完成了XXX项目...”

#### 针对 Gap Year 的描述建议：
> “在此期间，我通过自主学习掌握了 [技术/技能]，并参与了 [开源/社区项目]，保持了对行业的敏锐洞察力。”
    `
  },
  'interview-50': {
    title: '💬 面试常见问题 50 问',
    content: `
### 核心问题：如何回答“你为什么有半年的待业期？”

- **回答思路**：承认空白期，但强调其价值。
- **示例话术**：
  “在上一份工作结束后，我选择了一段时报进行深思熟虑的职业规划和技能重构。我并没有虚度这段时间，而是系统学习了 [关键词1] 和 [关键词2]。现在的我比半年前更有准备，也更清楚自己能为公司带来什么。”

### 其他高频问题：
1. 请介绍一下你自己？
2. 你最大的缺点是什么？
3. 为什么选择我们公司？
4. 你对加班怎么看？
    `
  },
  'gap-guide': {
    title: '🌱 待业生存指南',
    content: `
### 待业不是失败，而是重新出发的窗口

1. **节奏感**：每天保持固定的作息，不要熬夜到太晚。
2. **社交联系**：每周至少见一位朋友，或在 Landing-C 社区交流，避免社会隔绝。
3. **财务规划**：盘点存款，设定一个“安全期限”，减少不必要的焦虑。
4. **小步快跑**：每天完成一个微小的目标（如：改一个简历段落，看 15 分钟技术文档）。

**记住：你的价值不取决于你现在的职衔。**
    `
  }
};

window.showStaticResource = function(id) {
  const resource = TOOLBOX_RESOURCES[id];
  if (!resource) return;

  const modal = document.getElementById('toolboxModal');
  const toolTitle = document.getElementById('toolTitle');
  const resultArea = document.getElementById('toolResultArea');
  const markdownResult = document.getElementById('toolMarkdownResult');
  const inputArea = document.getElementById('toolInputArea');
  const toolLoader = document.getElementById('toolLoader');

  if (!modal) return;

  toolTitle.innerHTML = resource.title;
  markdownResult.innerHTML = resource.content.replace(/\n/g, '<br>').replace(/### (.*)/g, '<h4>$1</h4>').replace(/#### (.*)/g, '<h5>$1</h5>').replace(/> (.*)/g, '<blockquote style="border-left: 4px solid #38b2ac; padding-left: 1rem; color: #4a5568;">$1</blockquote>');
  
  inputArea.style.display = 'none';
  resultArea.style.display = 'block';
  if (toolLoader) toolLoader.style.display = 'none';
  
  modal.style.display = 'flex';
  modal.classList.add('active');
};
