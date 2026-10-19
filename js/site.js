(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    menu();
    splitLines();
    reveals();
    statement();
    heroVideo();
    tileVideos();
    lightbox();
    fitMark();
    addEventListener('resize', fitMark);
    document.fonts && document.fonts.ready.then(fitMark);
  });

  /* Footer wordmark fills the full width */
  function fitMark() {
    const wrap = document.querySelector('.footer__markwrap');
    const mark = wrap && wrap.querySelector('.footer__mark');
    if (!mark) return;
    if (!wrap.querySelector('.footer__blur')) {
      const twin = mark.cloneNode(true);
      twin.className = 'footer__mark footer__blur';
      wrap.appendChild(twin);
    }
    wrap.style.setProperty('--mark-size', '100px');
    const ratio = wrap.clientWidth / mark.getBoundingClientRect().width;
    wrap.style.setProperty('--mark-size', (100 * ratio).toFixed(2) + 'px');
  }

  /* ---------- Mobile menu ---------- */
  function menu() {
    const btn = document.querySelector('.nav__toggle');
    const m = document.querySelector('.menu');
    if (!btn || !m) return;
    btn.addEventListener('click', () => {
      const open = m.classList.toggle('open');
      btn.textContent = open ? 'Close' : 'Menu';
      btn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* ---------- Headlines: each .line gets a mask ---------- */
  function splitLines() {
    document.querySelectorAll('.lines').forEach(el => {
      el.querySelectorAll('.line').forEach((line, i) => {
        line.style.setProperty('--i', i);
        line.innerHTML = `<span>${line.innerHTML}</span>`;
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveals() {
    const els = document.querySelectorAll('[data-reveal], .lines, [data-curtain]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    // Clipped elements never "intersect", so curtains are watched through their parent
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { (en.target._revealTarget || en.target).classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(e => {
      if (e.hasAttribute('data-curtain')) { e.parentElement._revealTarget = e; io.observe(e.parentElement); }
      else io.observe(e);
    });
  }

  /* ---------- Statement: words light up while scrolling ---------- */
  function statement() {
    const el = document.querySelector('.statement');
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    const spans = el.querySelectorAll('.w');
    if (reduce) { spans.forEach(s => s.classList.add('on')); return; }
    let ticking = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Vimeo helpers ---------- */
  function vimeoFrame(id, start = 0) {
    const f = document.createElement('iframe');
    f.className = 'cover-frame';
    f.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1#t=${start}s`;
    f.allow = 'autoplay; fullscreen';
    f.title = '';
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    return f;
  }
  function onPlaying(iframe, cb) {
    let done = false;
    const go = () => { if (!done) { done = true; cb(); } };
    if (window.Vimeo && Vimeo.Player) {
      try { new Vimeo.Player(iframe).on('playing', go); } catch {}
    }
    setTimeout(go, 2500); // fallback if the API is slow or blocked
  }

  function heroVideo() {
    const m = document.querySelector('.hero__media');
    if (!m || reduce) return;
    const f = vimeoFrame(m.dataset.vimeo, m.dataset.start || 0);
    m.appendChild(f);
    onPlaying(f, () => m.classList.add('is-playing'));
  }

  /* ---------- Work tiles: play a silent loop when in view (or on hover) ---------- */
  function tileVideos() {
    const tiles = [...document.querySelectorAll('.tile[data-vimeo]')];
    if (!tiles.length || reduce) return;

    const start = t => {
      if (t._frame) { t.classList.add('is-playing'); return; }
      const box = t.querySelector('.tile__video');
      const f = vimeoFrame(t.dataset.vimeo, t.dataset.start || 0);
      t._frame = f;
      box.appendChild(f);
      onPlaying(f, () => { if (t._frame === f) t.classList.add('is-playing'); });
    };
    const stop = t => {
      t.classList.remove('is-playing');
      const f = t._frame;
      t._frame = null;
      if (f) setTimeout(() => f.remove(), 1200);
    };

    // One tile at a time: the one most in view
    const ratios = new Map();
    let current = null;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => ratios.set(en.target, en.intersectionRatio));
      let best = null, bestR = 0.55;
      ratios.forEach((r, t) => { if (r > bestR) { best = t; bestR = r; } });
      if (best !== current) {
        if (current) stop(current);
        if (best) start(best);
        current = best;
      }
    }, { threshold: [0, 0.25, 0.55, 0.75, 1] });
    tiles.forEach(t => io.observe(t));

    // Hover still wins on desktop
    if (matchMedia('(hover: hover)').matches) {
      tiles.forEach(t => t.addEventListener('mouseenter', () => {
        if (current && current !== t) stop(current);
        current = t; start(t);
      }));
    }
  }

  /* ---------- Stills lightbox ---------- */
  function lightbox() {
    const grid = document.querySelector('.stills');
    if (!grid) return;
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<img alt="" />';
    document.body.appendChild(lb);
    const img = lb.querySelector('img');
    grid.addEventListener('click', e => {
      const src = e.target.closest('figure')?.querySelector('img');
      if (!src) return;
      img.src = src.dataset.full || src.currentSrc || src.src;
      img.alt = src.alt;
      lb.classList.add('open');
    });
    const close = () => lb.classList.remove('open');
    lb.addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
  }
})();
