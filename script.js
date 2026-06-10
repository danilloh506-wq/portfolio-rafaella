/* ============================================
   SMOOTH SCROLL — Lenis + GSAP ticker
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
lenis.stop(); /* paused until preloader finishes */

/* ============================================
   UTILITIES
   ============================================ */

/* Split text node into individual char spans */
function splitChars(el, crimsonFirst = false) {
  const text = el.textContent.trim();
  el.innerHTML = text.split('').map((c, i) => {
    const cls = crimsonFirst && i === 0 ? 'char__in ini' : 'char__in';
    return `<span class="char"><span class="${cls}">${c === ' ' ? '&nbsp;' : c}</span></span>`;
  }).join('');
  return Array.from(el.querySelectorAll('.char__in'));
}

/* Wrap element's line-broken content into overflow:hidden line pairs */
function wrapTitleLines(el) {
  /* Works with <br> delimiters — preserves inner HTML (em, etc.) */
  const html = el.innerHTML;
  const parts = html.split(/<br\s*\/?>/i);
  el.innerHTML = parts.map(part =>
    `<span class="t-line"><span class="t-line-in">${part.trim()}</span></span>`
  ).join('');
  return Array.from(el.querySelectorAll('.t-line-in'));
}

/* Split philosophy quote at <br> for line reveal */
function wrapQuoteLines(el) {
  const p = el.querySelector('p');
  if (!p) return [];
  const parts = p.innerHTML.split(/<br\s*\/?>/i);
  p.innerHTML = parts.map(part =>
    `<span class="q-line"><span class="q-line-in">${part.trim()}</span></span>`
  ).join('');
  return Array.from(p.querySelectorAll('.q-line-in'));
}

/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const logo      = preloader.querySelector('.preloader__logo');
  const fill      = preloader.querySelector('.preloader__fill');

  const tl = gsap.timeline();
  tl
    .set(logo, { opacity: 0, y: 24 })
    .to(logo, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
    .to(fill, {
      scaleX: 1, transformOrigin: 'left',
      duration: 1.1, ease: 'power3.inOut'
    }, '-=0.1')
    .to(preloader, {
      yPercent: -100, duration: 1.1, ease: 'power4.inOut', delay: 0.2,
      onComplete() {
        preloader.style.display = 'none';
        lenis.start();
      }
    })
    .add(heroEntrance, '-=0.5');
});

/* ============================================
   HERO ENTRANCE
   ============================================ */
function heroEntrance() {
  const line1 = document.getElementById('name-line-1');
  const line2 = document.getElementById('name-line-2');
  const c1 = splitChars(line1, true);
  const c2 = splitChars(line2, true);

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.85 })
    .from(c1, { y: '108%', duration: 1.05, stagger: 0.036 }, '-=0.5')
    .from(c2, { y: '108%', duration: 1.05, stagger: 0.036 }, '-=0.88')
    .from('#hero-rule',    { scaleX: 0, transformOrigin: 'left', duration: 0.85 }, '-=0.42')
    .from('#hero-tagline', { y: 18, opacity: 0, duration: 0.85 }, '-=0.55')
    .from('#hero-scroll',  { opacity: 0, y: 14, duration: 0.7  }, '-=0.3');
}

/* ============================================
   CURSOR + CONTEXTUAL LABELS
   ============================================ */
if (window.innerWidth > 768) {
  const dot    = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  const label  = document.getElementById('cursor-label');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.07, ease: 'none' });
  });

  (function ringLoop() {
    rx += (mx - rx) * 0.08;
    ry += (my - ry) * 0.08;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(ringLoop);
  })();

  /* Regular links */
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('on-link');
      ring.classList.add('on-link');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('on-link');
      ring.classList.remove('on-link');
    });
  });

  /* Elements with contextual label (data-cursor-label) */
  document.querySelectorAll('[data-cursor-label]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const txt = el.getAttribute('data-cursor-label');
      label.textContent = txt;
      dot.classList.add('on-label');
      ring.classList.add('on-label');
      /* override any link state */
      dot.classList.remove('on-link');
      ring.classList.remove('on-link');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('on-label');
      ring.classList.remove('on-label');
      label.textContent = '';
    });
  });
}

/* ============================================
   NAV SCROLL + ACTIVE SECTION
   ============================================ */
const nav = document.getElementById('nav');

lenis.on('scroll', ({ scroll }) => {
  nav.classList.toggle('scrolled', scroll > 50);
});

const navLinks = Array.from(document.querySelectorAll('.nav__links a[data-nav]'));
const sections = ['about', 'work', 'contact'].map(id => document.getElementById(id));

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.4 });

sections.forEach(s => s && sectionObs.observe(s));

/* ============================================
   MAGNETIC EFFECT — nav links + CTAs
   ============================================ */
if (window.innerWidth > 768) {
  document.querySelectorAll('.nav__links a, .js-magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(el, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power2.out' });
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
  scrollTrigger: {
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1,
  }
});

/* ============================================
   ABOUT CLIP-PATH REVEAL
   ============================================ */
ScrollTrigger.create({
  trigger: '.js-clip-reveal',
  start: 'top 76%',
  onEnter() {
    gsap.to('.js-clip-reveal', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.55,
      ease: 'power4.inOut',
    });
  }
});

/* ============================================
   TITLE REVEALS — line by line
   ============================================ */
document.querySelectorAll('.js-title-reveal').forEach(el => {
  const lines = wrapTitleLines(el);
  gsap.from(lines, {
    y: '105%', duration: 1.2, ease: 'power4.out',
    stagger: 0.14,
    scrollTrigger: { trigger: el, start: 'top 82%' },
  });
});

/* ============================================
   FADE-UP REVEALS
   ============================================ */
document.querySelectorAll('.js-fade-up').forEach(el => {
  gsap.to(el, {
    y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 84%' },
  });
});

/* ============================================
   PHILOSOPHY — quote line reveal
   ============================================ */
const quoteLines = wrapQuoteLines(document.getElementById('philosophy-quote'));
if (quoteLines.length) {
  gsap.from(quoteLines, {
    y: '108%', duration: 1.35, ease: 'power4.out',
    stagger: 0.2,
    scrollTrigger: {
      trigger: '#philosophy-quote',
      start: 'top 78%',
    },
  });
}

gsap.to('.philosophy__img', {
  yPercent: 14, ease: 'none',
  scrollTrigger: {
    trigger: '.philosophy',
    start: 'top bottom', end: 'bottom top', scrub: 1.2,
  }
});

/* ============================================
   WORK — HORIZONTAL SCROLL (desktop)
   ============================================ */
const mm = gsap.matchMedia();

mm.add('(min-width: 769px)', () => {
  const track   = document.getElementById('work-track');
  const pin     = document.getElementById('work-pin');
  const fillEl  = document.getElementById('work-progress-fill');
  const countEl = document.getElementById('work-count');
  const cards   = Array.from(track.querySelectorAll('.work__card'));
  const total   = cards.length;

  /* Defer one frame so layout dimensions are settled */
  requestAnimationFrame(() => {
    const dist = track.scrollWidth - window.innerWidth;

    const hTween = gsap.to(track, {
      x: -dist, ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true,
        start: 'top top', end: `+=${dist}`,
        scrub: 1.4,
        onUpdate(self) {
          if (fillEl) fillEl.style.width = (self.progress * 100).toFixed(1) + '%';
          if (countEl) {
            const idx = Math.min(Math.ceil(self.progress * total) || 1, total);
            countEl.textContent =
              String(idx).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
          }
        }
      }
    });

    /* Image parallax inside each card */
    cards.forEach(card => {
      const img    = card.querySelector('.work__card-img');
      const offset = card.offsetWidth * 0.06;
      gsap.fromTo(img,
        { x: -offset },
        {
          x: offset, ease: 'none',
          scrollTrigger: {
            trigger: card, containerAnimation: hTween,
            start: 'left right', end: 'right left', scrub: true,
          }
        }
      );
    });

    /* 3D tilt on work cards */
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = ((e.clientX - r.left)  / r.width  - 0.5) * 16;
        const y  = ((e.clientY - r.top)   / r.height - 0.5) * -10;
        gsap.to(card, {
          rotateY: x, rotateX: y,
          transformPerspective: 900,
          duration: 0.55, ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0,
          duration: 0.9, ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    });

    /* Drag-to-scroll on work section */
    let isDragging   = false;
    let dragStartX   = 0;
    let dragStartSY  = 0;

    pin.style.cursor = 'grab';
    pin.addEventListener('mousedown', e => {
      isDragging  = true;
      dragStartX  = e.clientX;
      dragStartSY = window.pageYOffset;
      pin.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const delta = dragStartX - e.clientX;
      /* convert horizontal drag to vertical page scroll */
      lenis.scrollTo(dragStartSY + delta * 2.2, { immediate: true });
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      pin.style.cursor = 'grab';
    });
  });

  return () => ScrollTrigger.getAll().forEach(t => t.kill());
});

/* ============================================
   CONTACT REVEAL
   ============================================ */
gsap.from('.contact__title .t-line-in', {
  y: '105%', duration: 1.25, ease: 'power4.out', stagger: 0.15,
  scrollTrigger: { trigger: '.contact__title', start: 'top 80%' },
});

gsap.from(['.contact__email', '.contact__social'], {
  y: 34, opacity: 0, duration: 1.05, ease: 'power3.out', stagger: 0.18,
  scrollTrigger: { trigger: '.contact__email', start: 'top 88%' },
});
