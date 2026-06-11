/* ============================================
   SMOOTH SCROLL — Lenis + GSAP
   ============================================ */
const lenis = new Lenis({
  duration: 1.45,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.88,
});

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
lenis.stop();

const isMobile = () => window.innerWidth <= 768;

/* ============================================
   UTILITIES
   ============================================ */
function splitChars(el, crimsonFirst = false) {
  const text = el.textContent.trim();
  el.innerHTML = text.split('').map((c, i) => {
    const cls = crimsonFirst && i === 0 ? 'char__in ini' : 'char__in';
    return `<span class="char"><span class="${cls}">${c === ' ' ? '&nbsp;' : c}</span></span>`;
  }).join('');
  return Array.from(el.querySelectorAll('.char__in'));
}

function wrapTitleLines(el) {
  const parts = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map(p =>
    `<span class="t-line"><span class="t-line-in">${p.trim()}</span></span>`
  ).join('');
  return Array.from(el.querySelectorAll('.t-line-in'));
}

function wrapQuoteLines(el) {
  const p = el.querySelector('p');
  if (!p) return [];
  const parts = p.innerHTML.split(/<br\s*\/?>/i);
  p.innerHTML = parts.map(s =>
    `<span class="q-line"><span class="q-line-in">${s.trim()}</span></span>`
  ).join('');
  return Array.from(el.querySelectorAll('.q-line-in'));
}

/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.preloader__logo');
  const fill = document.querySelector('.preloader__fill');

  gsap.timeline()
    .set(logo, { opacity: 0, y: 24 })
    .to(logo, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
    .to(fill, { scaleX: 1, transformOrigin: 'left', duration: 1.1, ease: 'power3.inOut' }, '-=0.1')
    .to('#preloader', {
      yPercent: -100, duration: 1.1, ease: 'power4.inOut', delay: 0.2,
      onComplete() {
        document.getElementById('preloader').style.display = 'none';
        lenis.start();
        /* refresh ScrollTrigger depois que o preloader some */
        ScrollTrigger.refresh();
      }
    })
    .add(heroEntrance, '-=0.5');
});

/* ============================================
   HERO ENTRANCE
   ============================================ */
function heroEntrance() {
  const c1 = splitChars(document.getElementById('name-line-1'), true);
  const c2 = splitChars(document.getElementById('name-line-2'), true);

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero__eyebrow',  { y: 20, opacity: 0, duration: 0.85 })
    .from(c1, { y: '108%', duration: 1.05, stagger: 0.036 }, '-=0.5')
    .from(c2, { y: '108%', duration: 1.05, stagger: 0.036 }, '-=0.88')
    .from('#hero-rule',    { scaleX: 0, transformOrigin: 'left', duration: 0.85 }, '-=0.42')
    .from('#hero-tagline', { y: 18, opacity: 0, duration: 0.85 }, '-=0.55')
    .from('#hero-scroll',  { opacity: 0, y: 14, duration: 0.7  }, '-=0.3');
}

/* ============================================
   CURSOR
   ============================================ */
if (!isMobile()) {
  const dot   = document.getElementById('cursor');
  const ring  = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.07, ease: 'none' });
  });

  (function loop() {
    rx += (mx - rx) * 0.08;
    ry += (my - ry) * 0.08;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('on-link'); ring.classList.add('on-link'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('on-link'); ring.classList.remove('on-link'); });
  });

  document.querySelectorAll('[data-cursor-label]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      label.textContent = el.getAttribute('data-cursor-label');
      dot.classList.add('on-label'); ring.classList.add('on-label');
      dot.classList.remove('on-link'); ring.classList.remove('on-link');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('on-label'); ring.classList.remove('on-label');
      label.textContent = '';
    });
  });
}

/* ============================================
   MOBILE MENU
   ============================================ */
const burger  = document.getElementById('nav-burger');
const overlay = document.getElementById('menu-overlay');
const mLinks  = Array.from(overlay.querySelectorAll('[data-menu-link]'));
const mFoot   = overlay.querySelector('.menu-overlay__foot');
let menuOpen  = false;

function openMenu() {
  menuOpen = true;
  burger.classList.add('open');
  burger.setAttribute('aria-expanded', 'true');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  lenis.stop();
  gsap.set([mLinks, mFoot], { opacity: 0, x: -20 });
  gsap.to(mLinks, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
  gsap.to(mFoot,  { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay: 0.42 });
}

function closeMenu() {
  menuOpen = false;
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  gsap.to([...mLinks, mFoot], {
    opacity: 0, x: -12, duration: 0.3, ease: 'power2.in',
    onComplete() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      lenis.start();
    }
  });
}

burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());

mLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('href');
    closeMenu();
    setTimeout(() => lenis.scrollTo(target, { offset: -68, duration: 1.4 }), 420);
  });
});

/* ============================================
   NAV SCROLL WITH OFFSET
   ============================================ */
document.querySelectorAll('a[data-nav]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    lenis.scrollTo(href, { offset: -80, duration: 1.4 });
  });
});

/* ============================================
   NAV ACTIVE + SCROLLED STATE
   ============================================ */
const nav      = document.getElementById('nav');
const navLinks = Array.from(document.querySelectorAll('.nav__links a[data-nav]'));

lenis.on('scroll', ({ scroll }) => nav.classList.toggle('scrolled', scroll > 50));

['about', 'work', 'contact'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    });
  }, { threshold: 0.4 }).observe(el);
});

/* ============================================
   BACK TO TOP
   ============================================ */
const backTop = document.getElementById('back-top');
lenis.on('scroll', ({ scroll }) => backTop.classList.toggle('visible', scroll > window.innerHeight * 0.8));
backTop.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.6 }));

/* ============================================
   MAGNETIC
   ============================================ */
if (!isMobile()) {
  document.querySelectorAll('.nav__links a, .js-magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width  / 2) * 0.3,
        y: (e.clientY - r.top  - r.height / 2) * 0.3,
        duration: 0.4, ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    });
  });
}

/* ============================================
   HERO PARALLAX
   ============================================ */
gsap.to('.hero__marble', {
  yPercent: 20, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
});

/* ============================================
   ABOUT REVEAL
   ============================================ */
ScrollTrigger.create({
  trigger: '.js-clip-reveal', start: 'top 76%',
  onEnter() {
    gsap.to('.js-clip-reveal', { clipPath: 'inset(0 0% 0 0)', duration: 1.55, ease: 'power4.inOut' });
  }
});

/* ============================================
   TITLE REVEALS
   ============================================ */
document.querySelectorAll('.js-title-reveal').forEach(el => {
  const lines = wrapTitleLines(el);
  gsap.from(lines, {
    y: '105%', duration: 1.2, ease: 'power4.out', stagger: 0.14,
    scrollTrigger: { trigger: el, start: 'top 82%' }
  });
});

/* ============================================
   FADE-UP
   ============================================ */
document.querySelectorAll('.js-fade-up').forEach(el => {
  gsap.to(el, {
    y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 86%' }
  });
});

/* ============================================
   PHILOSOPHY
   ============================================ */
const quoteLines = wrapQuoteLines(document.getElementById('philosophy-quote'));
if (quoteLines.length) {
  gsap.from(quoteLines, {
    y: '108%', duration: 1.35, ease: 'power4.out', stagger: 0.22,
    scrollTrigger: { trigger: '#philosophy-quote', start: 'top 78%' }
  });
}
gsap.to('.philosophy__img', {
  yPercent: 14, ease: 'none',
  scrollTrigger: { trigger: '.philosophy', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
});

/* ============================================
   MOOD STRIP — GSAP marquee com duas fileiras
   ============================================ */
function createMarquee(trackId, duration, reverse = false) {
  const track = document.getElementById(trackId);
  if (!track) return null;

  /* posição inicial para direção reversa */
  if (reverse) gsap.set(track, { x: '-50%' });

  const tween = gsap.to(track, {
    x: reverse ? '0%' : '-50%',
    ease: 'none',
    duration,
    repeat: -1,
  });

  /* pausar/retomar suavemente ao hover */
  const row = track.closest('[data-marquee-row]');
  if (row) {
    row.addEventListener('mouseenter', () =>
      gsap.to(tween, { timeScale: 0, duration: 0.6, ease: 'power2.out' })
    );
    row.addEventListener('mouseleave', () =>
      gsap.to(tween, { timeScale: 1, duration: 0.8, ease: 'power2.inOut' })
    );
  }

  return tween;
}

/* Fileira 1: esquerda, 34s  |  Fileira 2: direita, 44s */
createMarquee('mood-track-1', 34, false);
createMarquee('mood-track-2', 44, true);

/* ============================================
   WORK — HORIZONTAL SCROLL (desktop)
   ============================================ */
gsap.matchMedia().add('(min-width: 769px)', () => {
  const track   = document.getElementById('work-track');
  const pin     = document.getElementById('work-pin');
  const fillEl  = document.getElementById('work-progress-fill');
  const countEl = document.getElementById('work-count');
  const cards   = Array.from(track.querySelectorAll('.work__card'));
  const total   = cards.length;

  /* Aguarda fontes + imagens para medidas corretas */
  function init() {
    const dist = track.scrollWidth - window.innerWidth;
    if (dist <= 0) return; /* sem espaço suficiente */

    const hTween = gsap.to(track, {
      x: -dist, ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true,
        start: 'top top',
        end: `+=${dist}`,
        scrub: 1,           /* 1 = responsivo e suave */
        anticipatePin: 1,
        onUpdate(self) {
          if (fillEl) fillEl.style.width = (self.progress * 100).toFixed(2) + '%';
          if (countEl) {
            const idx = Math.min(Math.ceil(self.progress * total) || 1, total);
            countEl.textContent = String(idx).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
          }
        }
      }
    });

    /* Entrada suave de cada card (scale + opacity via containerAnimation) */
    cards.forEach((card, i) => {
      /* entrada */
      gsap.fromTo(card,
        { opacity: i === 0 ? 1 : 0.4, scale: i === 0 ? 1 : 0.94 },
        {
          opacity: 1, scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card, containerAnimation: hTween,
            start: 'left 88%', end: 'left 45%', scrub: 0.8,
          }
        }
      );

      /* parallax da imagem */
      const img    = card.querySelector('.work__card-img');
      const offset = card.offsetWidth * 0.055;
      gsap.fromTo(img, { x: -offset }, {
        x: offset, ease: 'none',
        scrollTrigger: {
          trigger: card, containerAnimation: hTween,
          start: 'left right', end: 'right left', scrub: true,
        }
      });
    });

    /* 3D tilt */
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        gsap.to(card, {
          rotateY: ((e.clientX - r.left) / r.width  - 0.5) * 14,
          rotateX: ((e.clientY - r.top)  / r.height - 0.5) * -9,
          transformPerspective: 900,
          duration: 0.5, ease: 'power2.out', overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out', overwrite: 'auto' })
      );
    });

    /* Drag horizontal → scroll vertical */
    let isDragging = false, startX = 0, startSY = 0;
    pin.style.cursor = 'grab';

    pin.addEventListener('mousedown', e => {
      isDragging = true; startX = e.clientX; startSY = window.pageYOffset;
      pin.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const delta = (startX - e.clientX) * 2.4;
      lenis.scrollTo(startSY + delta, { immediate: true });
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      pin.style.cursor = 'grab';
    });
  }

  /* Inicializa após carregamento total para dimensões corretas */
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }

  /* Recalcula ao redimensionar */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      init();
    }, 300);
  });

  return () => ScrollTrigger.getAll().forEach(t => t.kill());
});

/* ============================================
   WORK MOBILE — progress via scroll nativo
   ============================================ */
if (isMobile()) {
  const pin     = document.getElementById('work-pin');
  const fillEl  = document.getElementById('work-progress-fill');
  const countEl = document.getElementById('work-count');
  const total   = document.querySelectorAll('.work__card').length;

  pin.addEventListener('scroll', () => {
    const max  = pin.scrollWidth - pin.clientWidth;
    const prog = max > 0 ? pin.scrollLeft / max : 0;
    if (fillEl) fillEl.style.width = (prog * 100).toFixed(1) + '%';
    if (countEl) {
      const idx = Math.min(Math.ceil(prog * total) || 1, total);
      countEl.textContent = String(idx).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
    }
  }, { passive: true });
}
