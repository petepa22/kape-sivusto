/* Vierityskonseptit (KaPe). Näyttämö on kiinnitetty, ja vierityksen eteneminen radalla valitsee vaiheen.
   Vaihe vaihtuu, kun vieritys on edennyt yli puolen välin seuraavaan; itse vaihto toistuu ajassa (650 ms) kokonaan.
   Vähennetty liike: vaihe vaihtuu kerralla ilman välitiloja. */
(function () {
  var rm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sm(t) { t = cl(t); return t * t * (3 - 2 * t); }
  function seg(x, a, b) { return cl((x - a) / (b - a)); }
  /* piirtää polun pathLength=1 -viivana: 0 = ei näy, 1 = valmis */
  function draw(el, t) { if (!el) return; el.style.strokeDasharray = '1 1'; el.style.strokeDashoffset = (1 - cl(t)).toFixed(4); el.style.opacity = t > 0.001 ? 1 : 0; }
  function op(el, v) { if (el) el.style.opacity = cl(v).toFixed(3); }
  function all(root, sel) { return [].slice.call(root.querySelectorAll(sel)); }

  var V = {
    /* A: Näin palvelumme toimii. 1 hahmotelma katkoviivoin, 2 mitat, 3 talo piirtyy valmiiksi */
    a: function (svg, s) {
      var plan = svg.querySelector('.g-plan'), dims = all(svg, '.g-dims path'), solid = all(svg, '.g-solid [pathLength]'), fill = svg.querySelector('.g-fillA');
      op(plan, 1 - 0.8 * sm(seg(s, 1.45, 2)));
      var d = seg(s, 0.15, 0.95);
      dims.forEach(function (p, i) { draw(p, seg(d, i * 0.12, 0.55 + i * 0.12)); });
      op(svg.querySelector('.g-dims'), 1 - 0.6 * sm(seg(s, 1.6, 2)));
      var b = seg(s, 1.05, 1.9);
      solid.forEach(function (p) { var o = +p.getAttribute('data-o') || 0; draw(p, seg(b, o, o + 0.45)); });
      op(fill, sm(seg(s, 1.75, 2)));
    },
    /* B: mittaukset. 1 kosteus seinän alaosassa, 2 lämpökuva, 3 tiiviysmittaus (puhallin ovessa ja ilmavuodot) */
    b: function (svg, s) {
      var w0 = cl(1 - Math.abs(s - 0)), w1 = cl(1 - Math.abs(s - 1)), w2 = cl(1 - Math.abs(s - 2));
      op(svg.querySelector('.g-moist'), w0);
      all(svg, '.g-moist .probe').forEach(function (p, i) { op(p, seg(w0, 0.4 + i * 0.15, 0.7 + i * 0.1)); });
      /* kameranäkymän vaihto: kuva vaihtuu lyhyellä matkalla, kehys ja asteikko tulevat perässä */
      var tv = sm(seg(w1, 0.35, 0.7));
      op(svg.querySelector('.g-therm'), tv);
      op(svg.querySelector('.g-tui'), sm(seg(w1, 0.6, 0.95)));
      op(svg.querySelector('.g-lines'), 1 - tv);
      op(svg.querySelector('.g-lines-w'), 0.1 * tv);
      svg.querySelector('.g-therm').style.filter = tv > 0 && tv < 1 ? 'brightness(' + (1 + 0.35 * Math.sin(Math.PI * tv)).toFixed(3) + ')' : '';
      op(svg.querySelector('.g-air'), w2);
      var fan = svg.querySelector('.fan-r'); if (fan) fan.setAttribute('transform', 'rotate(' + (s * 220).toFixed(1) + ')');
      all(svg, '.g-air .flow').forEach(function (p) { p.style.strokeDashoffset = (-s * 60).toFixed(1); });
    }
  };

  [].forEach.call(document.querySelectorAll('.sv'), function (sec) {
    var track = sec.querySelector('.sv-track'), svg = sec.querySelector('.sv-art svg'), steps = all(sec, '.sv-step'), n = steps.length, fn = V[sec.getAttribute('data-v')] || (window.SVX && window.SVX[sec.getAttribute('data-v')]);
    var dotsBox = sec.querySelector('.sv-dots'), dots = [], texts = sec.querySelector('.sv-texts');
    /* Mobiili (<= 900 px): palvelut ovat vaakasuuntainen pyyhkäisykaruselli (CSS scroll-snap); talo seuraa kohdalle napsahtanutta korttia. */
    var mq = window.matchMedia ? matchMedia('(max-width: 900px)') : { matches: false };
    function car() { return mq.matches && sec.getAttribute('data-v') === 'p'; }
    sec.style.setProperty('--n', n);
    if (dotsBox) steps.forEach(function (st, i) { var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<i></i>';
      b.setAttribute('aria-label', (i + 1) + ' / ' + n + ': ' + st.querySelector('h3').textContent);
      b.addEventListener('click', function () { if (car()) { texts.scrollTo({ left: steps[i].offsetLeft - steps[0].offsetLeft, behavior: rm.matches ? 'auto' : 'smooth' }); return; } var stg = sec.querySelector('.sv-stage'), span = track.offsetHeight - stg.offsetHeight, top = track.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stg).top) || 0);
        window.scrollTo({ top: Math.round(top + span * (i / (n - 1))), behavior: rm.matches ? 'auto' : 'smooth' }); });
      dotsBox.appendChild(b); dots.push(b); });
    /* Vieritys valitsee vain vaiheen (lepoalueet ja pieni hystereesi). Vaihto itse toistuu ajassa, aina kokonaan:
       näin vierityksen pysähtyessä ei jää puolivälin häivytettyjä tiloja eikä nykimistä hiiren rullan askelista. */
    var raf = 0, last = -1, cur = 0, tgt = 0, from = 0, t0 = 0, DUR = 650;
    function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
    function render(s) {
      if (Math.abs(s - last) < 0.0005) return; last = s;
      fn && fn(svg, s);
      var on = Math.round(s);
      if (car()) { steps.forEach(function (st, i) { st.style.opacity = ''; st.style.transform = ''; st.classList.toggle('on', i === on); st.removeAttribute('aria-hidden'); }); dots.forEach(function (d, i) { d.classList.toggle('on', i === on); }); return; }
      steps.forEach(function (st, i) { var w = cl(1 - Math.abs(s - i) * 1.7); st.style.opacity = w.toFixed(3); st.style.transform = 'translateY(' + ((1 - w) * (i < s ? -8 : 8)).toFixed(1) + 'px)'; st.classList.toggle('on', i === on); st.setAttribute('aria-hidden', i === on ? 'false' : 'true'); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === on); });
    }
    function target() {
      if (car()) { var x = texts.scrollLeft, o0 = steps[0].offsetLeft, best = 0, bd = 1e9;
        steps.forEach(function (st, i) { var d = Math.abs(st.offsetLeft - o0 - x); if (d < bd) { bd = d; best = i; } });
        if (texts.scrollLeft + texts.clientWidth >= texts.scrollWidth - 4) best = n - 1;
        return best; }
      var stage = sec.querySelector('.sv-stage'), span = track.offsetHeight - stage.offsetHeight, r = track.getBoundingClientRect();
      var off = parseFloat(getComputedStyle(stage).top) || 0, p = span > 0 ? cl((off - r.top) / span) : 1, raw = p * (n - 1);
      if (span <= 0) return n - 1;
      return Math.abs(raw - tgt) > 0.6 ? Math.max(0, Math.min(n - 1, Math.round(raw))) : tgt;
    }
    function frame(now) {
      raf = 0;
      var t = target();
      if (t !== tgt) { from = cur; tgt = t; t0 = now || performance.now(); }
      if (rm.matches) cur = tgt;
      else if (cur !== tgt) {
        var d = DUR * Math.min(1.6, Math.max(1, Math.abs(tgt - from))), u = ((now || performance.now()) - t0) / d;
        cur = u >= 1 ? tgt : from + (tgt - from) * ease(u);
      }
      render(cur);
      if (cur !== tgt) req();
    }
    function req() { if (!raf) raf = requestAnimationFrame(frame); }
    var vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis) req(); }).observe(sec);
    window.addEventListener('scroll', function () { if (vis) req(); }, { passive: true });
    window.addEventListener('resize', function () { last = -1; req(); });
    if (texts) texts.addEventListener('scroll', function () { req(); }, { passive: true });
    /* Mobiili: vaakapyyhkäisy vaihtaa kortin vain, kun liike on selvästi vaakasuuntainen (|dx| > 2|dy| ja yli 40 px). Pystyvieritys jää selaimelle. */
    if (texts) { var tx = 0, ty = 0, tOn = false;
      texts.addEventListener('touchstart', function (e) { if (!car() || e.touches.length !== 1) { tOn = false; return; } tOn = true; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
      texts.addEventListener('touchend', function (e) { if (!tOn || !car()) return; tOn = false; var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
        if (Math.abs(dx) > 40 && Math.abs(dx) > 2 * Math.abs(dy)) { var i = Math.max(0, Math.min(n - 1, tgt + (dx < 0 ? 1 : -1))); texts.scrollTo({ left: steps[i].offsetLeft - steps[0].offsetLeft, behavior: rm.matches ? 'auto' : 'smooth' }); } }, { passive: true });
      texts.addEventListener('touchcancel', function () { tOn = false; }, { passive: true }); }
    if (mq.addEventListener) mq.addEventListener('change', function () { last = -1; req(); });
    tgt = cur = target(); from = cur;
    render(cur);
  });
})();
