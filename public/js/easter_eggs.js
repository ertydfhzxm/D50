/**
 * Landing-C Easter Eggs & Team Tribute Logic
 * Version: 3.0.1
 */

const EASTER_EGGS = {
  'szxw': {
    to: '程曦文',
    content: `D50的相遇让我看到了很多很多可能性，你身上有那种天然的领导力，和号召力，两天一夜的营期，能量很高，感觉很燃，你的组织能力，思维能力让人眼前一亮，也希望你在接下去的旅程中，找到自己的落脚点，发光发热，希望未来能在政界看到你的身影，真正用青年人的影响力，做出你想要的东西`
  },
  'ldjx': {
    to: '李婧娴',
    content: `你是一个细腻，善于观察善于捕捉生活的人，有一种天然的亲和力，你也很优秀，很勇敢，一直在勇敢的做自己，追寻自己理想的生活。D50相处细节，我会发现你一直在照顾着整个团队，为大家拍了很多照片，记录了珍贵的点滴，哪怕在自己还有很多事情要处理的情况下，依然在为大家而付出，完成了大的策划框架，有你在这个团队是踏实的，感恩在D50的相遇，你身上的特质，也一定会帮助你真正的Landing到你想成为的样子`
  },
  'xldyb': {
    to: '白雪莲',
    content: `从你的生活中，我看到了勇气，你勇敢的追寻自己想要的方向，勇敢的表达，发声，D50的团队两天中，你默默的为大家贡献你的力量，无论是犀利的选题，还是最终呈现出来的视频，我们也看到了一个有趣的你，正如分享中不约而同提到的一个词：D100，希望在赋启D100的过程中，我们还能相遇，以后有缘来景德镇，想来体验你的生活！`
  },
  'gjqgyz': {
    to: '高架桥',
    content: `你是一个很热爱生活的人，从那种你分享的生命盘中，看到了很多你有趣的一面，塔罗，电影，都是一些生动有趣的标签，D50的团队中，你是中坚力量，为大家准备了大量物料，你的表演，你的创意，都让这个团队更有生命力，我们也因此被感染，你的实力也如你的颜值，在接下去的生活中，愿继续热爱，继续发光`
  },
  'rqjy': {
    to: '李染秋',
    content: `很少有看到人，真正去发现那些不曾被关注的群体，从你的发言，从你提出的话题和观点中，我们看到了很多有温度的一面，那些少数的群体，也许在另一个平行世界，他们也是多数，团队中，你作为中坚力量，给大家贡献观点，1分钟的展演环节，我们看到了你生命的张力。你的脸上，总能看到笑容，你积极的面对生活，生活也会给予积极的反馈，他们都会在接下去的生活里，结结实实的给予你最好的反馈`
  },
  'phza': {
    to: '吴沛衡',
    content: `记得第一天上午写标签的时候，不约而同的我们都在标签上写下了ADHD，在一个完全陌生的场域，公开这个身份，和大家讨论，本身就是需要勇气的一件事情，你赶着非常疲惫的路途，来到D50，本身就是一种不易，Landing-C计划的游戏中，我们为你的画，和创意感到惊讶，你是个有趣，也热爱探索的人，记得最后一天分别时，也聊了很多ADHD话题，这本身就是一种缘分，眼下你也在追寻自己的热爱，希望你在未来的探索中，找到你的舞台，发光发热`
  },
  'xygo': {
    to: '新颖',
    content: `入营前，被你的学校所吸引，曾几何时，我也在地级市的职业本科院校就读，我清楚的知道里面的困局，营期两天，当一个自信的你呈现在大家面前，为大家出谋划策的时候，真的感同身受你在这样一个环境里付出了多大的努力。你是有力量的，任何地方都有那1%，那1%永远是一束光，他能照亮自己，也能照亮他人，因为热爱，也因为坚持，一切胜在人为，两天的时间很快，你的生命也在影响着大家，感恩在D50的相遇`
  }
};

const TEAM_TRIBUTE = `生命影响生命，我们被生命影响着，也在影响着生命，感谢2天1夜，32位伙伴，8位教练，还有无数为Diggers奉献的人在2026年3月21日~22日在杭州的共同陪伴，这是我人生中一段难忘的旅程，也是因为有了你们，才有了Landing-C，这一切都在欢声笑语中产生，我也希望，Landing-C的意义不只于一个Demo，或者PPT，于是一念之间，我想把它真的做出来，虽然它很粗糙，但这些数字，被赋予生命的那一刻就产生了另外一种价值，我希望把他传递下去，也希望在未来探索热爱的过程中，继续去迭代它的版本

——小E 2026年3月27日，V3`;

/**
 * Shared Modal Logic
 */
function openCreditsModal() {
  const modal = document.getElementById('creditsModal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
  }
}

function closeCreditsModal() {
  const modal = document.getElementById('creditsModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}

function openTeamTribute() {
  const letterBody = document.getElementById('letterBody');
  const modal = document.getElementById('secretLetterModal');
  if (letterBody && modal) {
    letterBody.innerText = TEAM_TRIBUTE;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
  }
}

function closeLetterModal() {
  const modal = document.getElementById('secretLetterModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
  }
}

function checkEasterEgg() {
  const input = document.getElementById('easterEggInput');
  const val = input ? input.value.trim() : '';
  const letterBody = document.getElementById('letterBody');
  const secretModal = document.getElementById('secretLetterModal');
  const creditsModal = document.getElementById('creditsModal');

  if (EASTER_EGGS[val]) {
    const egg = EASTER_EGGS[val];
    letterBody.innerText = `To ${egg.to} \n\n${egg.content}`;
    if (creditsModal) {
      creditsModal.classList.remove('active');
      setTimeout(() => creditsModal.style.display = 'none', 300);
    }
    if (secretModal) {
      secretModal.style.display = 'flex';
      setTimeout(() => secretModal.classList.add('active'), 310);
    }
  } else if (val === '6688' || val === 'light' || val === 'IFS') {
    // Legacy codes for About page
    const legacy = {
      '6688': '亲爱的伙伴，恭喜你找到了这里。这是 Landing-C 的初始坐标。希望在这个空间里，你能找到属于自己的平静。',
      'light': '即使是一点微弱的光，也能照亮前行的路。感谢你来到这里，成为我们的一员。',
      'IFS': '从 IFS 到 Landing-C，我们一直在进化。感谢你见证了这一切。'
    };
    letterBody.innerText = legacy[val];
    if (creditsModal) {
      creditsModal.classList.remove('active');
      setTimeout(() => creditsModal.style.display = 'none', 300);
    }
    if (secretModal) {
      secretModal.style.display = 'flex';
      setTimeout(() => secretModal.classList.add('active'), 310);
    }
  } else {
    alert('暗号不正确哦 🌱');
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  // Any global setup for UI can go here
});
