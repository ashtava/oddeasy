(function () {
  // "odd" spelled by sound in each script, the way the logo writes ओड: Hindi first, then the next nine
  // most-spoken Indian languages. "easy" never changes.
  const EASY = { t: 'easy', lang: 'en', name: 'English' };
  const PAIRS = [
    { odd: { t: 'ओड', lang: 'hi', name: 'Hindi' }, easy: EASY },
    { odd: { t: 'অড', lang: 'bn', name: 'Bengali' }, easy: EASY },
    { odd: { t: 'ऑड', lang: 'mr', name: 'Marathi' }, easy: EASY },
    { odd: { t: 'ఆడ్', lang: 'te', name: 'Telugu' }, easy: EASY },
    { odd: { t: 'ஆட்', lang: 'ta', name: 'Tamil' }, easy: EASY },
    { odd: { t: 'ઑડ', lang: 'gu', name: 'Gujarati' }, easy: EASY },
    { odd: { t: 'آڈ', lang: 'ur', name: 'Urdu', dir: 'rtl' }, easy: EASY },
    { odd: { t: 'ಆಡ್', lang: 'kn', name: 'Kannada' }, easy: EASY },
    { odd: { t: 'ଅଡ୍', lang: 'or', name: 'Odia' }, easy: EASY },
    { odd: { t: 'ഓഡ്', lang: 'ml', name: 'Malayalam' }, easy: EASY }
  ];
  const N = PAIRS.length, HOME = PAIRS[0], OTHERS = PAIRS.slice(1);

  const $ = id => document.getElementById(id);
  const words = $('words');
  const mOdd = $('mOdd'), mEasy = $('mEasy');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  if (G) G.registerPlugin(...[window.CustomEase].filter(Boolean));

  const seg = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const graphemes = t => seg ? [...seg.segment(t)].map(x => x.segment) : Array.from(t);

  function setLang(el, d) { el.lang = d.lang; if (d.dir) el.dir = d.dir; else el.removeAttribute('dir'); }
  function makeSlot(id, cls) {
    const slot = $(id);
    const el = document.createElement('span');
    el.className = 'w ' + cls; slot.appendChild(el);
    return { slot, el, cls, chars: [], k: -1, face: HOME[cls] };
  }
  const S = { odd: makeSlot('oddSlot', 'odd'), easy: makeSlot('easySlot', 'easy') };

  function setFace(s, d, split) {
    setLang(s.el, d); s.face = d;
    s.el.textContent = ''; s.chars = [];
    if (split) {
      graphemes(d.t).forEach(g => {
        const c = document.createElement('span');
        c.className = 'ch'; c.textContent = g;
        s.el.appendChild(c); s.chars.push(c);
      });
    } else s.el.textContent = d.t;
    s.el.classList.toggle('alt', d !== HOME[s.cls]);
    s.faceW = s.el.offsetWidth;            // the real laid-out width in this script's font
  }

  // ---------- measuring ----------
  const wCache = new Map();
  function natW(d, cls) {
    const key = cls + '|' + d.t;
    if (wCache.has(key)) return wCache.get(key);
    const m = cls === 'odd' ? mOdd : mEasy;
    setLang(m, d); m.textContent = d.t;
    const w = m.getBoundingClientRect().width;
    wCache.set(key, w); return w;
  }
  let fs = 120, leftRoom = 0;
  function fit() {
    const wo = natW(HOME.odd, 'odd'), we = natW(HOME.easy, 'easy');
    const vw = innerWidth, vh = innerHeight;
    const maxW = vw * (vw < 700 ? 0.8 : 0.6);
    fs = Math.min(100 * maxW / (wo + we + 16), vh * 0.24, 240);
    words.style.fontSize = fs + 'px';
    S.odd.slot.style.width = (wo * fs / 100) + 'px';
    S.easy.slot.style.width = (we * fs / 100) + 'px';
    const r = S.odd.slot.getBoundingClientRect();
    leftRoom = Math.max(0, r.left - (innerWidth < 700 ? 18 : 28) - 0.25 * fs);
  }

  // ---------- the reel ----------
  const deg = Math.PI / 180;
  function draw(s, a, sign, faces, v) {
    const H = faces.length - 1;
    const k = Math.max(0, Math.min(H, Math.floor((a + 90) / 180)));
    if (k !== s.k) { s.k = k; setFace(s, faces[k], k === 0 || k === H); }
    const vis = a - k * 180;
    const slotW = parseFloat(s.slot.style.width) || 0;
    const w = s.faceW || natW(faces[k], s.cls) * fs / 100;
    const blur = Math.min(9, Math.max(0, (v - 0.15) * 3));
    // a word tipping toward the lens grows at its near edge (perspective), blur spreads it further,
    // and some scripts draw past their measured box: fit all of that inside the slot plus part of the gap
    const mag = 5 / (5 - 0.6 * Math.abs(Math.sin(vis * deg)));
    const ink = faces[k] === HOME[s.cls] ? 0 : 0.06 * fs;
    const need = w * mag + ink + 2 * blur, room = slotW + (s.cls === 'odd' ? leftRoom : 0);
    const sc = (slotW > 0 && need > room) ? room / need : 1;

    if (k === H && H > 0 && vis < 0 && s.chars.length > 1) {
      s.el.style.transform = `scale(${sc})`;
      s.el.style.opacity = '';
      s.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
      const q = (vis + 90) / 90, n = s.chars.length, d = 0.16, span = 1 - (n - 1) * d;
      s.chars.forEach((c, i) => {
        const qi = Math.min(1, Math.max(0, (q - i * d) / span));
        const vi = sign * (-90 + 90 * qi);
        c.style.transform = `perspective(5em) rotateX(${vi}deg)`;
        c.style.opacity = (0.15 + 0.85 * Math.cos(vi * deg)).toFixed(3);
      });
    } else {
      s.chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; });
      s.el.style.transform = `perspective(5em) rotateX(${sign * vis}deg) scale(${sc})`;
      s.el.style.opacity = (0.2 + 0.8 * Math.cos(vis * deg)).toFixed(3);
      s.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    }
  }
  function settle(s) {
    s.el.style.transform = s.el.style.filter = s.el.style.opacity = '';
    s.chars.forEach(c => { c.style.transform = ''; c.style.opacity = ''; });
  }

  let pulse = () => {};
  function spin(s, faces, sign, duration, ease, delay = 0) {
    return new Promise(res => {
      const H = faces.length - 1, p = { a: 0 };
      let lastA = 0, lastT = performance.now();
      s.k = -1; draw(s, 0, sign, faces, 0);
      G.to(p, {
        a: H * 180, duration, ease, delay,
        onStart() { lastT = performance.now(); },
        onUpdate() {
          const now = performance.now();
          const v = Math.abs(p.a - lastA) / Math.max(1, now - lastT);
          lastA = p.a; lastT = now;
          draw(s, p.a, sign, faces, v); pulse(v);
        },
        onComplete() { draw(s, H * 180, sign, faces, 0); settle(s); pulse(0); res(); }
      });
    });
  }

  // ---------- light that follows the cursor and breathes with the reel ----------
  function setupLight() {
    const key = $('keyLight'), shade = $('shadeLight');
    G.set(key,   { x: -innerWidth * 0.22, y: -innerHeight * 0.18 });
    G.set(shade, { x:  innerWidth * 0.30, y:  innerHeight * 0.25 });
    if (reduce) return;
    const kx = G.quickTo(key, 'x', { duration: 2.2, ease: 'power3.out' });
    const ky = G.quickTo(key, 'y', { duration: 2.2, ease: 'power3.out' });
    const sx = G.quickTo(shade, 'x', { duration: 3.2, ease: 'power3.out' });
    const sy = G.quickTo(shade, 'y', { duration: 3.2, ease: 'power3.out' });
    addEventListener('pointermove', e => {
      pdx = e.clientX - innerWidth / 2; pdy = e.clientY - innerHeight / 2; aimLight();
    });
    G.to(shade, { scale: 'random(0.92, 1.1)', duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true });
    const ks = G.quickTo(key, 'scale', { duration: 1.0, ease: 'power3.out' });
    pulse = v => ks(1 + Math.min(v, 2.5) * 0.06);
    moveLight = (kxv, kyv, sxv, syv) => { kx(kxv); ky(kyv); sx(sxv); sy(syv); };
  }
  let moveLight = () => {}, pdx = 0, pdy = 0, q = 0;
  function aimLight() {
    const W = innerWidth, Hh = innerHeight;
    moveLight(W * (-0.22 + 0.5 * q) + pdx * 0.35, Hh * (-0.18 - 0.12 * q) + pdy * 0.35,
              W * (0.30 - 0.6 * q) - pdx * 0.22, Hh * (0.25 + 0.05 * q) - pdy * 0.22);
  }

  // ---------- scroll: the reel turns with the scroll, lands back on the logo, then About rises ----------
  const scene = $('scene'), photo = $('photo');
  const hero = $('hero'), about = $('about'), aboutBtn = $('aboutBtn'), dock = $('dock'), chrome = $('chrome');
  const innerRules = [...document.querySelectorAll('.rule.c1, .rule.c2, .rule.r1, .rule.r2')];
  const lines = [...about.querySelectorAll('.rev > *, .contact li')];
  const REEL = [HOME.odd, ...OTHERS.map(p => p.odd), HOME.odd], RH = REEL.length - 1;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const spinDist = () => Math.max(1, hero.offsetHeight - innerHeight);
  let live = false, target = 0, cur = 0, atRest = true, revealed = false, revealTl = null, snapT = 0, lastT = performance.now();

  function readScroll() {
    const y = scrollY, vh = innerHeight, sd = spinDist();
    target = clamp01(y / sd) * RH * 180;
    q = clamp01((y - sd) / (vh * 0.45));
    G.set(words, { y: -40 * q, opacity: 1 - q, filter: q > 0.001 ? `blur(${(16 * q).toFixed(2)}px)` : 'none' });
    G.set(innerRules, { opacity: 1 - q });
    // the photograph pulls into focus as About arrives
    scene.style.visibility = q > 0.001 ? 'visible' : 'hidden';
    scene.style.opacity = q.toFixed(3);
    G.set(photo, { scale: 1.08 - 0.08 * q, filter: q < 0.999 ? `blur(${(10 * (1 - q)).toFixed(2)}px)` : 'none' });
    chrome.style.opacity = (1 - clamp01(q * 1.6)).toFixed(3);
    const b = 1 - clamp01(y / (vh * 0.12));
    dock.style.opacity = b.toFixed(3); dock.style.pointerEvents = b < 0.1 ? 'none' : '';
    aimLight();
    if (revealTl) {
      if (!revealed && q > 0.25) { revealed = true; revealTl.play(); }
      else if (revealed && y < sd * 0.5) { revealed = false; revealTl.reverse(); }
    }
  }
  function onScroll() {
    if (!live) return;
    readScroll();
    clearTimeout(snapT);
    // when the scroll stops, the reel settles on the nearest whole word instead of hanging mid-flip
    snapT = setTimeout(() => { target = Math.round(target / 180) * 180; }, 160);
  }
  function tick() {
    if (!live || reduce) return;
    const now = performance.now(), dt = Math.min(64, now - lastT); lastT = now;
    const d = target - cur;
    if (Math.abs(d) < 0.05) {
      if (!atRest) { cur = target; draw(S.odd, cur, 1, REEL, 0); pulse(0); if (cur % 180 === 0) settle(S.odd); atRest = true; }
      return;
    }
    atRest = false;
    const step = d * (1 - Math.pow(0.84, dt / 16.67));
    cur += step;
    const v = Math.abs(step) / Math.max(1, dt) * 0.6;
    draw(S.odd, cur, 1, REEL, v); pulse(v);
  }
  function goAbout() { scrollTo({ top: about.offsetTop, behavior: reduce ? 'auto' : 'smooth' }); }
  aboutBtn.addEventListener('click', goAbout);
  aboutBtn.addEventListener('pointerenter', () => document.body.classList.add('about-hover'));
  aboutBtn.addEventListener('pointerleave', () => document.body.classList.remove('about-hover'));
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- opening: light settles, the frame draws, the logo pulls into focus, the reel runs ----------
  function introEase() {
    return window.CustomEase
      ? CustomEase.create('reel', 'M0,0 C0.28,0 0.36,0.3 0.5,0.56 C0.64,0.82 0.78,1.012 0.88,1.008 C0.94,1.004 0.97,1 1,1')
      : 'power4.inOut';
  }
  async function opening() {
    const key = $('keyLight'), shade = $('shadeLight');
    const tl = G.timeline();
    // overexposed white, settling into the lit wall
    tl.fromTo(key, { scale: 2.6, opacity: 1 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0);
    tl.fromTo(shade, { opacity: 0 }, { opacity: .75, duration: 2.2, ease: 'power2.out' }, 0.2);
    // the frame rules draw themselves
    tl.fromTo('.rule.h', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.06 }, 0.5);
    tl.fromTo('.rule.v', { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.06 }, 0.6);
    tl.fromTo('.mark-corner', { opacity: 0 }, { opacity: 1, duration: .5 }, 1.6);
    // focus pull on the logo
    tl.fromTo(words, { opacity: 0, filter: 'blur(26px)', scale: 1.04 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 2.0, ease: 'power2.inOut' }, 0.6);
    await tl.then();
    words.style.filter = '';

    const H = N * 2, oddFaces = [];
    for (let k = 0; k <= H; k++) oddFaces.push(PAIRS[k % N].odd);
    const ease = introEase();
    await spin(S.odd, oddFaces, 1, 3.2, ease, 0.3);
    document.body.classList.remove('intro');
    G.fromTo(['.tl', '.badge', '.about-btn'], { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08 });
    document.documentElement.classList.remove('lock');
    S.odd.k = -1; cur = target = 0; lastT = performance.now();
    live = true; readScroll(); G.ticker.add(tick);
    if (location.hash === '#about') goAbout();
  }

  // ---------- boot ----------
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  setFace(S.odd, HOME.odd, true);
  setFace(S.easy, HOME.easy, false);
  fit();
  addEventListener('resize', () => { wCache.clear(); fit(); if (live) readScroll(); });
  // fonts that arrive late (the Indic and Arabic faces) change word widths: re-measure so nothing collides
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { wCache.clear(); fit(); S.odd.faceW = S.odd.el.offsetWidth; });

  if (!G || reduce) {
    document.body.classList.remove('intro');
    if (G) { setupLight(); live = true; readScroll(); }
    if (location.hash === '#about') about.scrollIntoView();
    return;
  }
  scrollTo(0, 0);
  document.documentElement.classList.add('lock');
  G.set(lines, { yPercent: 110, opacity: 0 });
  revealTl = G.timeline({ paused: true }).to(lines, { yPercent: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .07 });
  // slow turn of the badge
  G.to('.badge svg', { rotate: 360, duration: 40, ease: 'none', repeat: -1 });

  const heavy = getComputedStyle(document.documentElement).getPropertyValue('--heavy');
  const light = getComputedStyle(document.documentElement).getPropertyValue('--logo-latin');
  const loads = [];
  PAIRS.forEach(p => {
    loads.push(document.fonts.load((/^(hi|mr)$/.test(p.odd.lang) ? '900' : '800') + ' 100px ' + heavy, p.odd.t));
    loads.push(document.fonts.load('400 100px ' + light, p.easy.t));
  });
  Promise.race([
    Promise.allSettled(loads).then(() => document.fonts.ready),
    new Promise(r => setTimeout(r, 2500))
  ]).then(() => {
    wCache.clear(); fit();
    setupLight(); opening();
  });
})();
