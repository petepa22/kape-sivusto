/* Harppi: varsi kasvaa Vetelistä 100 km:iin ja kiertää pohjoisen rannikon leikkauskohdasta myötäpäivään eteläiseen; kaari piirtyy vain maalle.
   Sitten rannikko leikkauskohtien välillä piirtyy etelästä pohjoiseen ja sulkee alueen. Paikkakunta syttyy, kun varsi tai rannikkoviiva ohittaa sen suunnan.
   Lopuksi ulkokehä sykkii kaksi kertaa, tauko 1,5 s, piirto häivytetään ja kierros alkaa alusta. Toistuu vain, kun kartta näkyy. */
(function () {
  var tk = document.querySelector('.tk'); if (!tk) return;
  var H = +tk.getAttribute('data-h') || 120, AN = +tk.getAttribute('data-an'), AS = +tk.getAttribute('data-as'),
      SPAN = (AS - AN + 360) % 360, GROW = 520, SWEEP = 2300, COAST = 800, WAVE = 2800, GAP = 5600;
  var ring = tk.querySelector('.tk-ring'), arm = tk.querySelector('.tk-arm'), armLine = arm.querySelector('line');
  var tick = arm.querySelector('.tk-tick'), ray = tk.querySelector('.tk-ray');
  var pins = [].slice.call(tk.querySelectorAll('.pin'));
  var words = [].slice.call(document.querySelectorAll('.area-map p strong[data-t]'));
  var coast = tk.querySelector('.tk-coast'), wave = tk.querySelector('.tk-wave');
  tk.style.setProperty('--a0', AS + 'deg');
  function sizeKm() { tk.style.setProperty('--r', (tk.clientWidth / (2 * H) * 100) + 'px'); }
  sizeKm(); window.addEventListener('resize', sizeKm);

  /* tekstin paikkakunta ja kartan piste korostavat toisiaan */
  function pinOf(n) { return tk.querySelector('.pin[data-t="' + n + '"]'); }
  function hl(n, on) {
    var p = pinOf(n); if (!p) return;
    p.classList.toggle('on', on);
    words.forEach(function (w) { if (w.getAttribute('data-t') === n) w.classList.toggle('on', on); });
    if (on) { var x = parseFloat(p.style.left) / 100 * 2 * H - H, y = parseFloat(p.style.top) / 100 * 2 * H - H; ray.setAttribute('x2', x); ray.setAttribute('y2', y); }
    ray.classList.toggle('on', on);
  }
  words.forEach(function (w) { var n = w.getAttribute('data-t');
    w.addEventListener('mouseenter', function () { hl(n, true); }); w.addEventListener('mouseleave', function () { hl(n, false); }); });
  pins.forEach(function (p) { var n = p.getAttribute('data-t'); if (p.classList.contains('core')) return;
    p.addEventListener('mouseenter', function () { hl(n, true); }); p.addEventListener('mouseleave', function () { hl(n, false); }); });

  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* vähennetty liike tai ei tukea: valmis kartta ilman animaatiota */
  if (rm || !('IntersectionObserver' in window) || !window.requestAnimationFrame || !coast.getPointAtLength) return;
  tk.classList.add('anim');
  function rel(a) { return (a - AN + 720) % 360; }
  var order = pins.map(function (p) { return { p: p, core: p.classList.contains('core'), a: rel(parseFloat(p.getAttribute('data-a'))) }; });
  /* Hallabitin käyrä cubic-bezier(.16,1,.3,1) ja rauhallinen ease-in-out pyyhkäisyyn */
  function bez(x1, y1, x2, y2) { return function (x) { if (x <= 0) return 0; if (x >= 1) return 1; var t = x;
    for (var i = 0; i < 8; i++) { var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x, d = 3 * x1 * (1 - t) * (1 - t) + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t; if (Math.abs(cx) < 1e-5 || !d) break; t -= cx / d; t = t < 0 ? 0 : t > 1 ? 1 : t; }
    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t; }; }
  var easeOut = bez(.16, 1, .3, 1), easeIO = bez(.65, 0, .35, 1);
  /* Kierros: varsi kasvaa, kaari piirtyy hitaasti ja paikkakunnat syttyvät sen ohittaessa, rannikko sulkee alueen,
     ulkokehä sykkii kaksi kertaa, tauko, häivytys ja alusta uudelleen. Pysähtyy, kun kartta ei näy. */
  var GROW = 450, SWEEP = 2300, COAST = 700, PULSE = 1000, HOLD = 1500, OUT = 450;
  var CL = coast.getTotalLength(), visible = false, raf = 0, timer = 0, running = false;
  function clear() { cancelAnimationFrame(raf); raf = 0; clearTimeout(timer); timer = 0; }
  function reset() {
    tk.classList.add('rs'); tk.classList.remove('run', 'done', 'out'); coast.classList.remove('hot');
    pins.forEach(function (p) { p.classList.remove('lit'); });
    arm.style.opacity = 0; armLine.setAttribute('x2', 0); tick.style.opacity = 0;
    ring.style.strokeDashoffset = ''; coast.style.strokeDashoffset = ''; ring.style.strokeWidth = ''; ring.style.strokeOpacity = '';
    wave.style.opacity = 0;
  }
  function cycle() {
    clear(); reset(); if (!visible) { running = false; return; }
    running = true; void tk.offsetWidth; tk.classList.remove('rs');
    var t0 = performance.now(), coastMax = SPAN, base = parseFloat(getComputedStyle(ring).strokeWidth) || .62;
    tk.classList.add('run');
    order.forEach(function (o) { if (o.core) o.p.classList.add('lit'); });
    arm.style.opacity = 1; arm.style.transform = 'rotate(' + AN + 'deg)';
    function f(now) {
      var t = Math.max(0, now - t0);
      if (t < GROW) { armLine.setAttribute('x2', 100 * easeOut(t / GROW)); raf = requestAnimationFrame(f); return; }
      armLine.setAttribute('x2', 100); tick.style.opacity = 1;
      var s = Math.min(1, (t - GROW) / SWEEP), deg = SPAN * easeIO(s);
      arm.style.transform = 'rotate(' + (AN + deg) + 'deg)';
      ring.style.strokeDashoffset = 1 - easeIO(s);
      order.forEach(function (o) { if (!o.core && o.a <= deg) o.p.classList.add('lit'); });
      if (s < 1) { raf = requestAnimationFrame(f); return; }
      ring.style.strokeDashoffset = 0;
      var c = Math.min(1, (t - GROW - SWEEP) / COAST), ce = easeOut(c);
      if (!coast.classList.contains('hot')) coast.classList.add('hot');
      coast.style.strokeDashoffset = 1 - ce;
      var pt = coast.getPointAtLength(CL * ce), pa = rel(Math.atan2(pt.y, pt.x) * 180 / Math.PI);
      if (pa > coastMax) coastMax = pa;
      order.forEach(function (o) { if (!o.core && o.a <= coastMax) o.p.classList.add('lit'); });
      if (c < 1) { raf = requestAnimationFrame(f); return; }
      coast.style.strokeDashoffset = 0;
      if (!tk.classList.contains('done')) { order.forEach(function (o) { o.p.classList.add('lit'); }); tk.classList.add('done'); coast.classList.remove('hot'); }
      /* kaksi pehmeää sykäystä ulkokehässä */
      var u = (t - GROW - SWEEP - COAST) / PULSE;
      if (u < 2) { var k = Math.sin(Math.PI * (u % 1)); k = k * k;
        ring.style.strokeWidth = (base * (1 + 1.4 * k)).toFixed(3); ring.style.strokeOpacity = (0.85 + 0.15 * k).toFixed(3);
        raf = requestAnimationFrame(f); return; }
      ring.style.strokeWidth = ''; ring.style.strokeOpacity = '';
      raf = 0;
      timer = setTimeout(function () { tk.classList.add('out'); arm.style.opacity = 0; timer = setTimeout(cycle, OUT + 60); }, HOLD);
    }
    raf = requestAnimationFrame(f);
  }
  function stop() { clear(); running = false; reset(); void tk.offsetWidth; tk.classList.remove('rs'); }
  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible && !running && e[0].intersectionRatio >= .35) { running = true; timer = setTimeout(cycle, 200); }
    if (!visible && running) stop();
  }, { threshold: [0, .35] }).observe(tk);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { if (running) stop(); } else if (visible && !running) { running = true; timer = setTimeout(cycle, 200); } });
})();
