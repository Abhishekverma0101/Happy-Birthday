/* ============================================
   OJASVI'S BIRTHDAY WEBSITE — script.js
   Mobile-Optimised Version
   ============================================ */

// ============================================
// UTILS — detect touch device
// ============================================
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

// ============================================
// 1. WELCOME POPUP
// ============================================
let siteEntered = false;
function enterSite(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (siteEntered) return;
  siteEntered = true;

  const popup = document.getElementById('welcomePopup');
  if (!popup) return;

  // Unlock body scroll now that popup is dismissed
  document.body.classList.remove('no-scroll');
  popup.style.transition = 'opacity 0.6s ease';
  popup.style.opacity    = '0';
  setTimeout(() => {
    popup.style.display = 'none';
    launchConfetti(180);
    spawnHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
    startFloaters();
    // Auto-play music — button click = valid user gesture on mobile
    toggleMusic();
  }, 600);
}

// ============================================
// 2. STAR CANVAS BACKGROUND
// ============================================
(function initStars() {
  const canvas = document.getElementById('starCanvas');
  const ctx    = canvas.getContext('2d');
  let stars = [], shootingStars = [];
  let W, H;
  let raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    // Fewer stars on mobile → better perf
    const density = isTouchDevice() ? 6000 : 4000;
    const count   = Math.floor((W * H) / density);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.005 + 0.002,
        dir: Math.random() > 0.5 ? 1 : -1,
        color: randomStarColor()
      });
    }
  }

  function randomStarColor() {
    const c = ['#ffffff','#ffd700','#c084fc','#ff6b9d','#a5f3fc'];
    return c[Math.floor(Math.random() * c.length)];
  }

  function addShootingStar() {
    shootingStars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: Math.random() * 160 + 60,
      speed: Math.random() * 8 + 5,
      alpha: 1,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3
    });
  }

  setInterval(addShootingStar, isTouchDevice() ? 4000 : 3000);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    stars.forEach(s => {
      s.alpha += s.speed * s.dir;
      if (s.alpha > 1 || s.alpha < 0.1) s.dir *= -1;
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle   = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur  = s.r * 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    shootingStars.forEach((ss, i) => {
      ctx.save();
      ctx.globalAlpha = ss.alpha;
      const g = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(
        ss.x - Math.cos(ss.angle) * ss.len,
        ss.y - Math.sin(ss.angle) * ss.len
      );
      ctx.stroke();
      ctx.restore();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.018;
      if (ss.alpha <= 0) shootingStars.splice(i, 1);
    });

    raf = requestAnimationFrame(draw);
  }

  // Pause stars when tab hidden (battery saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ============================================
// ============================================
// 3. CONFETTI & HEART PARTICLES
// ============================================
(function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  let pieces   = [];
  let animId   = null;

  function syncSize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  syncSize();
  window.addEventListener('resize', syncSize);

  const COLORS = [
    '#ffd700','#ff6b9d','#c084fc','#ff4d6d',
    '#ff1493','#60a5fa','#34d399','#f472b6','#ffffff'
  ];

  function drawHeartPath(ctx, x, y, size) {
    ctx.beginPath();
    const h = size * 0.9;
    ctx.moveTo(x, y + h * 0.3);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + h * 0.3);
    ctx.bezierCurveTo(x - size / 2, y + h * 0.65, x, y + h, x, y + h);
    ctx.bezierCurveTo(x, y + h, x + size / 2, y + h * 0.65, x + size / 2, y + h * 0.3);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + h * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  function Piece(x, y) {
    this.x = x ?? Math.random() * canvas.width;
    this.y = y ?? -10;
    this.w = Math.random() * 12 + 6;
    this.h = Math.random() * 8 + 4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.vx    = (Math.random() - 0.5) * 7;
    this.vy    = Math.random() * 3 + 2;
    this.spin  = Math.random() * 0.22 - 0.11;
    this.angle = Math.random() * Math.PI * 2;
    this.alpha = 1;
    const rand = Math.random();
    this.shape = rand > 0.4 ? 'heart' : (rand > 0.2 ? 'circle' : 'rect');
  }

  Piece.prototype.update = function () {
    this.x     += this.vx;
    this.y     += this.vy;
    this.vy    += 0.06;
    this.angle += this.spin;
    if (this.y > canvas.height * 0.8) this.alpha -= 0.022;
  };

  Piece.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle  = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 6;
    if (this.shape === 'heart') {
      drawHeartPath(ctx, 0, -this.w / 2, this.w);
    } else if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    ctx.restore();
  };

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter(p => p.alpha > 0);
    pieces.forEach(p => { p.update(); p.draw(); });
    if (pieces.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.launchConfetti = function (count = 140) {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 3;
    for (let i = 0; i < count; i++) {
      const p = new Piece(cx + (Math.random() - 0.5) * 200, cy);
      p.vx = (Math.random() - 0.5) * 16;
      p.vy = Math.random() * -13 - 4;
      pieces.push(p);
    }
    if (!animId) loop();
  };
})();

// Floating Heart Burst on Click/Tap
window.spawnHeartBurst = function(x, y, count = 6) {
  const hearts = ['💖', '❤️', '💕', '💗', '💓', '💞', '💘', '✨', '🌸'];
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'tap-heart-particle';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 60; // Bias upward float
    const scale = Math.random() * 0.8 + 0.8;
    const rot = (Math.random() - 0.5) * 60;

    heart.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: ${(Math.random() * 0.8 + 1.3).toFixed(2)}rem;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) scale(${scale}) rotate(${rot}deg);
      transition: transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.2), opacity 1.2s ease;
      opacity: 1;
      filter: drop-shadow(0 0 12px rgba(255, 105, 180, 0.9));
    `;
    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy - 70}px)) scale(${scale * 1.35}) rotate(${rot + (Math.random() - 0.5) * 50}deg)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 1200);
  }
};

// Global click/touch listener for mini heart bursts
document.addEventListener('click', (e) => {
  if (e.clientX !== undefined && e.clientY !== undefined) {
    spawnHeartBurst(e.clientX, e.clientY, 5);
  }
});
document.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches[0]) {
    spawnHeartBurst(e.touches[0].clientX, e.touches[0].clientY, 4);
  }
}, { passive: true });

// ============================================
// 4. FLOATING EMOJIS & HEARTS STREAM
// ============================================
function startFloaters() {
  const container = document.getElementById('floaters');
  const emojis = ['💖','❤️','💕','💗','💓','💞','💘','🌸','🎈','✨','🌟','💫','🎉','🎂','👑'];

  function createFloater() {
    if (!container) return;
    const el = document.createElement('div');
    el.className   = 'floater';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.setAttribute('aria-hidden', 'true');
    const dur = Math.random() * 7 + 8;
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      animation-duration: ${dur}s;
      animation-delay: ${Math.random() * 3}s;
      font-size: ${(Math.random() * 1.5 + 0.8).toFixed(2)}rem;
      filter: drop-shadow(0 0 10px rgba(255, 117, 143, 0.7));
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 4) * 1000);
  }

  for (let i = 0; i < 12; i++) setTimeout(createFloater, i * 400);
  setInterval(createFloater, 1500);
}


// ============================================
// 5. CAKE — BLOW CANDLES (touch + click)
// ============================================
let candlesBlown = false;

function blowCandles() {
  if (candlesBlown) return;

  // Haptic feedback on supported devices
  if (navigator.vibrate) navigator.vibrate([40, 20, 40]);

  const candles = document.querySelectorAll('.candle');
  let delay = 0;
  candles.forEach(candle => {
    setTimeout(() => candle.classList.add('blown'), delay);
    delay += 180;
  });

  setTimeout(() => {
    candlesBlown = true;
    const hint = document.getElementById('blowHint');
    hint.innerHTML = '💖 Your wish has been sent to the stars! 💖';
    hint.style.color = '#ffd700';
    hint.style.animation = 'none';
    launchConfetti(180);
    spawnHeartBurst(window.innerWidth / 2, window.innerHeight * 0.5, 25);
  }, delay + 200);
}

// Keyboard support for cake
document.addEventListener('DOMContentLoaded', () => {
  const cake = document.getElementById('cakeWrapper');
  if (cake) {
    cake.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        blowCandles();
      }
    });
  }
});

// ============================================
// 6. MUSIC — Web Audio API (birthday melody)
// ============================================
let audioCtx    = null;
let musicPlaying = false;
let musicInterval = null;

const NOTES = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25
};

const MELODY = [
  {note:'C4',dur:0.30},{note:'C4',dur:0.15},{note:'D4',dur:0.45},
  {note:'C4',dur:0.45},{note:'F4',dur:0.45},{note:'E4',dur:0.90},
  {note:'C4',dur:0.30},{note:'C4',dur:0.15},{note:'D4',dur:0.45},
  {note:'C4',dur:0.45},{note:'G4',dur:0.45},{note:'F4',dur:0.90},
  {note:'C4',dur:0.30},{note:'C4',dur:0.15},{note:'C5',dur:0.45},
  {note:'A4',dur:0.45},{note:'F4',dur:0.45},{note:'E4',dur:0.45},{note:'D4',dur:0.45},
  {note:'B4',dur:0.30},{note:'B4',dur:0.15},{note:'A4',dur:0.45},
  {note:'F4',dur:0.45},{note:'G4',dur:0.45},{note:'F4',dur:0.90}
];

function playMelody() {
  if (!audioCtx) return 0;
  let t = audioCtx.currentTime + 0.1;
  MELODY.forEach(({note, dur}) => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTES[note], t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.10, t + dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    t += dur;
  });
  return t - audioCtx.currentTime;
}

function toggleMusic() {
  const btn   = document.getElementById('musicBtn');
  const label = document.getElementById('musicLabel');

  if (!musicPlaying) {
    // AudioContext must be created on user gesture — mobile rule
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    musicPlaying = true;
    btn.textContent = '🎵';
    btn.setAttribute('aria-pressed', 'true');
    btn.style.background = 'linear-gradient(135deg,#ffd700,#f97316)';
    label.textContent    = '🎶 Playing...';

    if (navigator.vibrate) navigator.vibrate(30);

    const duration = playMelody();
    musicInterval  = setInterval(() => {
      if (musicPlaying) playMelody();
    }, (duration + 0.5) * 1000);

  } else {
    musicPlaying = false;
    btn.textContent = '🔔';
    btn.setAttribute('aria-pressed', 'false');
    btn.style.background = 'linear-gradient(135deg,#6c1fcb,#e040fb)';
    label.textContent    = '🎵 Birthday Music';
    if (musicInterval) clearInterval(musicInterval);
  }
}

// ============================================
// 7. TOUCH SPARKLE TRAIL
// ============================================
(function initTouchTrail() {
  const sparkles = ['✨','⭐','💫','🌟','✦','🎀','💖'];
  let lastSparkle = 0;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkleOut {
      0%   { opacity:1; transform:translateY(0) scale(1); }
      100% { opacity:0; transform:translateY(-28px) scale(0.2); }
    }
  `;
  document.head.appendChild(style);

  function spawnSparkle(x, y) {
    const now = Date.now();
    if (now - lastSparkle < 100) return;
    lastSparkle = now;

    const el = document.createElement('div');
    el.textContent    = sparkles[Math.floor(Math.random() * sparkles.length)];
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText  = `
      position:fixed;
      left:${x - 10}px;
      top:${y - 10}px;
      font-size:${(Math.random() * 12 + 10).toFixed(0)}px;
      pointer-events:none;
      z-index:9999;
      animation:sparkleOut 0.7s ease forwards;
      user-select:none;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  // Touch events (mobile)
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    spawnSparkle(t.clientX, t.clientY);
  }, { passive: true });

  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    spawnSparkle(t.clientX, t.clientY);
  }, { passive: true });

  // Mouse events (desktop fallback)
  if (!isTouchDevice()) {
    document.addEventListener('mousemove', e => {
      spawnSparkle(e.clientX, e.clientY);
    });
  }
})();

// ============================================
// 8. SCROLL REVEAL (IntersectionObserver)
// ============================================
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after revealing to save resources
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================================
// 9. DEVICE ORIENTATION PARALLAX (mobile only)
//    Gives a 3D depth feel when tilting the phone
// ============================================
function initGyroParallax() {
  if (!window.DeviceOrientationEvent) return;

  // Request permission on iOS 13+
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // We'll trigger this on first user gesture
    document.getElementById('enterBtn')?.addEventListener('click', () => {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') listenOrientation();
      }).catch(() => {});
    }, { once: true });
  } else {
    listenOrientation();
  }
}

function listenOrientation() {
  window.addEventListener('deviceorientation', e => {
    const beta  = e.beta  || 0; // -180 to 180
    const gamma = e.gamma || 0; // -90 to 90
    const mx = (gamma / 90) * 10;
    const my = ((beta  - 45) / 90) * 10;

    document.querySelectorAll('.orb').forEach((orb, i) => {
      const f = (i + 1) * 4;
      orb.style.transform = `translate(${mx * f}px, ${my * f}px)`;
    });
  }, { passive: true });
}

// Desktop mouse parallax
function initMouseParallax() {
  if (isTouchDevice()) return;
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    document.querySelectorAll('.orb').forEach((orb, i) => {
      const f = (i + 1) * 8;
      orb.style.transform = `translate(${mx * f}px, ${my * f}px)`;
    });
  });
}

// ============================================
// 10. INIT — DOMContentLoaded
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initGyroParallax();
  initMouseParallax();
  initLightbox();
  initCoverflow();

  // Explicit touch & click handling for Enter button (mobile friendly)
  const enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', enterSite);
    enterBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      enterSite(e);
    }, { passive: false });
  }
});

// ============================================
// 11. LIGHTBOX
// ============================================
function initLightbox() {
  const lightbox      = document.getElementById('lightbox');
  const lbImg         = document.getElementById('lightboxImg');
  const lbPlaceholder = document.getElementById('lightboxPlaceholder');
  const lbClose       = document.getElementById('lightboxClose');
  const lbBackdrop    = document.getElementById('lightboxBackdrop');
  const lbPrev        = document.getElementById('lightboxPrev');
  const lbNext        = document.getElementById('lightboxNext');
  const lbCounter     = document.getElementById('lightboxCounter');

  // Use cf-card (the 3D coverflow cards) as the gallery items
  let items = [];
  let currentIndex = 0;

  function getItems() {
    // Re-query each time so we always get the latest list
    return Array.from(document.querySelectorAll('.cf-card'));
  }

  // Called from openLightboxForCard to sync index
  window._setLightboxIndex = function(index) {
    currentIndex = index;
  };

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  function showSlide(index) {
    items = getItems();
    const total = items.length;
    if (total === 0) return;

    currentIndex = (index + total) % total; // wrap around
    const item  = items[currentIndex];
    const imgEl = item ? item.querySelector('img') : null;

    if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${total}`;

    if (imgEl && imgEl.src && imgEl.complete && !imgEl.src.endsWith('#')) {
      lbImg.src                   = imgEl.src;
      lbImg.alt                   = imgEl.alt || `Photo ${currentIndex + 1}`;
      lbImg.style.display         = 'block';
      lbPlaceholder.style.display = 'none';
    } else {
      lbImg.style.display         = 'none';
      lbPlaceholder.style.display = 'flex';
    }

    // Pop-in animation
    const content = document.querySelector('.lightbox-content');
    if (content) {
      content.style.transition = 'none';
      content.style.transform  = 'scale(0.92)';
      requestAnimationFrame(() => {
        content.style.transition = 'transform 0.25s ease';
        content.style.transform  = 'scale(1)';
      });
    }
  }

  function goNext() { showSlide(currentIndex + 1); }
  function goPrev() { showSlide(currentIndex - 1); }

  // Close buttons
  if (lbClose)   lbClose.addEventListener('click',    closeLightbox);
  if (lbBackdrop)lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev)    lbPrev.addEventListener('click',  e => { e.stopPropagation(); goPrev(); });
  if (lbNext)    lbNext.addEventListener('click',  e => { e.stopPropagation(); goNext(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
  });

  // Swipe gestures (mobile)
  let touchStartX = 0, touchStartY = 0;

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    if (!lightbox.classList.contains('open')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else        goPrev();
    }
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
  }, { passive: true });
}

// ============================================
// 12. 3D COVERFLOW GALLERY
// ============================================
function initCoverflow() {
  const scene   = document.getElementById('coverflowScene');
  const dotsEl  = document.getElementById('cfDots');
  const counter = document.getElementById('cfCounter');
  const btnPrev = document.getElementById('cfPrev');
  const btnNext = document.getElementById('cfNext');
  const cards   = Array.from(document.querySelectorAll('.cf-card'));
  if (!scene || cards.length === 0) return;

  const total  = cards.length;
  let current  = 0;
  const cardW  = cards[0].offsetWidth || 220;
  const SPREAD  = cardW * 0.72;
  const MAX_ROT = 55;

  // Build dot indicators
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cf-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function updateCarousel(animated) {
    const dots = dotsEl.querySelectorAll('.cf-dot');
    cards.forEach((card, i) => {
      const offset = i - current;
      const absOff = Math.abs(offset);
      const tx     = offset * SPREAD;
      const ry     = -Math.sign(offset) * Math.min(MAX_ROT, absOff * 28);
      const scale  = absOff === 0 ? 1 : Math.max(0.55, 1 - absOff * 0.18);
      const op     = absOff === 0 ? 1 : Math.max(0, 1 - absOff * 0.3);
      const tz     = -absOff * 60;

      card.style.transition = animated ? '' : 'none';
      card.style.transform  = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`;
      card.style.opacity    = op;
      card.style.zIndex     = total - absOff;
      card.style.visibility = absOff > 4 ? 'hidden' : 'visible';
      card.classList.toggle('active', offset === 0);
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (counter) counter.textContent = `${current + 1} / ${total}`;
    // Update button disabled state
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === total - 1;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(total - 1, index));
    updateCarousel(true);
  }

  // ← → button click handlers
  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

  // Tap: side card → navigate, active card → lightbox
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (i === current) openLightboxForCard(i);
      else goTo(i);
    });
  });

  // Touch swipe
  let txStart = 0, tyStart = 0, dragging = false, swipeDelta = 0;

  scene.addEventListener('touchstart', e => {
    txStart    = e.touches[0].clientX;
    tyStart    = e.touches[0].clientY;
    dragging   = true;
    swipeDelta = 0;
  }, { passive: true });

  scene.addEventListener('touchmove', e => {
    if (!dragging) return;
    swipeDelta   = e.touches[0].clientX - txStart;
    const dy     = e.touches[0].clientY - tyStart;
    if (Math.abs(swipeDelta) > Math.abs(dy)) {
      cards.forEach((card, i) => {
        const off = i - current;
        const tx  = off * SPREAD + swipeDelta * 0.45;
        const tz  = -Math.abs(off) * 60;
        const ry  = -Math.sign(off) * Math.min(MAX_ROT, Math.abs(off) * 28);
        const sc  = Math.abs(off) === 0 ? 1 : Math.max(0.55, 1 - Math.abs(off) * 0.18);
        card.style.transition = 'none';
        card.style.transform  = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      });
    }
  }, { passive: true });

  scene.addEventListener('touchend', () => {
    dragging = false;
    if (swipeDelta < -50)     goTo(current + 1);
    else if (swipeDelta > 50) goTo(current - 1);
    else                      updateCarousel(true);
  }, { passive: true });

  // Mouse drag
  let mDown = false, mStartX = 0;
  scene.addEventListener('mousedown', e => {
    mDown = true; mStartX = e.clientX;
    scene.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', e => {
    if (!mDown) return;
    mDown = false; scene.style.cursor = '';
    const dx = e.clientX - mStartX;
    if (dx < -50)     goTo(current + 1);
    else if (dx > 50) goTo(current - 1);
    else              updateCarousel(true);
  });

  // Keyboard arrows (only when lightbox closed)
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  updateCarousel(false);
  requestAnimationFrame(() => updateCarousel(true));
}

function openLightboxForCard(index) {
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbPh     = document.getElementById('lightboxPlaceholder');
  const lbCount  = document.getElementById('lightboxCounter');
  const cards    = Array.from(document.querySelectorAll('.cf-card'));
  if (!lightbox) return;

  // Sync index with initLightbox's internal state
  if (typeof window._setLightboxIndex === 'function') {
    window._setLightboxIndex(index);
  }

  const imgEl = cards[index] ? cards[index].querySelector('img') : null;
  if (imgEl && imgEl.src && imgEl.complete && !imgEl.src.endsWith('#')) {
    lbImg.src = imgEl.src;
    lbImg.alt = imgEl.alt || `Photo ${index + 1}`;
    lbImg.style.display = 'block';
    lbPh.style.display  = 'none';
  } else {
    lbImg.style.display = 'none';
    lbPh.style.display  = 'flex';
  }
  if (lbCount) lbCount.textContent = `${index + 1} / ${cards.length}`;
  lightbox.classList.add('open');
  document.body.classList.add('no-scroll');
}
