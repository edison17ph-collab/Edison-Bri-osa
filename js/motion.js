/* motion.js - word reveals, scroll-linked 3D depth, scroll-reactive marquee. Skipped for reduced motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)], body = document.body, root = document.documentElement;
  const ready = cb => { if (!body.classList.contains('intro-on')) return cb(0); const mo = new MutationObserver(() => { if (!body.classList.contains('intro-on')) { mo.disconnect(); setTimeout(cb, 500); } }); mo.observe(body, { attributes: true, attributeFilter: ['class'] }); };

  // 1. split text into masked words, reveal once when scrolled into view
  function split(el) {
    let i = 0;
    (function walk(n) {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return; if (/^\s+$/.test(t)) return f.append(t);
            const w = document.createElement('span'), x = document.createElement('span');
            w.className = 'w'; x.className = 'wi'; x.textContent = t; x.style.setProperty('--i', Math.min(i++, 40)); w.append(x); f.append(w);
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1 && !/^(BR|SVG|SCRIPT|A)$/i.test(c.tagName)) walk(c);
      });
    })(el);
    el.classList.add('sr'); if (el.tagName === 'P' || el.tagName === 'BLOCKQUOTE') el.classList.add('fast');
  }
  const targets = $$('#home h1,#home p,section:not(#skills):not(#interests) h2,section:not(#skills):not(#interests):not(#works) .box > p,blockquote,.works-head p');
  targets.forEach(split);
  const io = new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: .35, rootMargin: '0px 0px -5% 0px' });
  ready(() => targets.forEach(t => io.observe(t)));

  // 2. scroll-linked depth (one rAF-throttled passive listener)
  const secs = $$('section'); let ly = scrollY, sv = 0, queued = false;
  function frame() {
    queued = false; const vh = innerHeight;
    secs.forEach(s => {
      const r = s.getBoundingClientRect(); if (r.bottom < -vh * .3 || r.top > vh * 1.3) return;
      const p = r.top > 0 ? Math.min(1, r.top / vh) : r.bottom < vh ? -Math.min(1, (vh - r.bottom) / vh) : 0;
      s.style.setProperty('--p', p.toFixed(3));
    });
    const v = scrollY - ly; ly = scrollY; sv += (v - sv) * .2; root.style.setProperty('--sv', Math.max(-40, Math.min(40, sv)).toFixed(2));
  }
  const req = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); frame();

  // 3. marquee: drifts on its own, speeds up and reverses with scroll direction
  const mq = $$('.mq-track')[0];
  if (mq) {
    const html = mq.innerHTML; mq.innerHTML = html + html + html; let x = 0, vis = false, dir = -1;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) loop(); }).observe(mq.parentElement);
    function loop() {
      if (!vis) return; const third = mq.scrollWidth / 3;
      sv = Math.abs(sv) < .05 ? 0 : sv * .94; if (Math.abs(sv) > 1) dir = sv > 0 ? -1 : 1;
      x += dir * (.7 + Math.abs(sv) * .45); if (x <= -third) x += third; if (x > 0) x -= third;
      mq.style.translate = x + 'px 0'; requestAnimationFrame(loop);
    }
  }
})();
