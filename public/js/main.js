/* ============================================
   Landing-C — Main JavaScript v1.5
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initScrollAnimations();
  initCounterAnimations();
  initSmoothScroll();
  initMobileNav();
  initPlanCards();
  initFAB();
});


/* --- Navbar --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id'); });
    navLinks.forEach(l => { l.classList.toggle('active', l.getAttribute('data-section') === current); });
  });
}

/* --- Particles --- */
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const colors = ['rgba(255,107,74,0.5)', 'rgba(255,142,83,0.4)', 'rgba(56,178,172,0.4)', 'rgba(255,179,71,0.3)'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 8 + 4;
    Object.assign(p.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
      background: colors[Math.floor(Math.random()*colors.length)],
      animationDelay: `${Math.random()*8}s`, animationDuration: `${6+Math.random()*6}s`
    });
    container.appendChild(p);
  }
}

/* --- Scroll Animations --- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  const moodChart = document.querySelector('.mood-chart');
  if (moodChart) observer.observe(moodChart);
}

/* --- Counter Animation --- */
function initCounterAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const decimal = parseInt(el.getAttribute('data-decimal')) || 0;
  const duration = 2000;
  const startTime = performance.now();
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function update(ct) {
    const progress = Math.min((ct - startTime) / duration, 1);
    const val = easeOutExpo(progress) * target;
    el.textContent = prefix + (decimal > 0 ? val.toFixed(decimal) : Math.floor(val)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + (decimal > 0 ? target.toFixed(decimal) : target) + suffix;
  }
  requestAnimationFrame(update);
}

/* --- Smooth Scroll --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      const el = document.querySelector(this.getAttribute('href'));
      if (el) {
        window.scrollTo({ top: el.offsetTop - document.getElementById('navbar').offsetHeight, behavior: 'smooth' });
        const navLinks = document.getElementById('navLinks');
        const navToggle = document.getElementById('navToggle');
        if (navLinks.classList.contains('open')) { navLinks.classList.remove('open'); navToggle.classList.remove('active'); }
      }
    });
  });
}

/* --- Mobile Nav --- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => { links.classList.toggle('open'); toggle.classList.toggle('active'); });
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) { links.classList.remove('open'); toggle.classList.remove('active'); }
  });
}

/* --- Plan Flip Cards --- */
function initPlanCards() {
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

/* --- FAB visibility --- */
function initFAB() {
  const fab = document.getElementById('fabExperience');
  if (!fab) return;
  window.addEventListener('scroll', () => {
    fab.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
  });
}
