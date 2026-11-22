/* KaPe palvelut: kiinnitetty isometrinen talo. Kunkin palvelun kohdalla talo näyttää kirjaimellisesti sen, mitä palvelukortin teksti luettelee.
   Vierityksen lepovaiheessa kortin luettelemat asiat vuorottelevat ajan mukaan (pysähtyy, kun osio ei näy). Vähennetty liike: kaikki kerralla, ei liikettä.
   Kevyt SVG, ei kirjastoja. Koordinaatit metreinä: x pituus, y syvyys, z ylös. */
(function () {
  var S = 30, C = 0.866, G = '#2d6432', GD = '#1e4422';
  function P(x, y, z) { return [(x - y) * C * S, ((x + y) * 0.5 - z) * S]; }
  function f1(v) { return v.toFixed(1); }
  function pts(a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); return f1(q[0]) + ',' + f1(q[1]); }).join(' '); }
  function hex(c, k) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(k >= 1 ? v + (255 - v) * (k - 1) : v * k))); }
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  var EDGE = ' stroke="#3f6b45" stroke-opacity=".8" stroke-width=".7" stroke-linejoin="round"';
  function poly(a, fill, extra) { return '<polygon points="' + pts(a) + '" fill="' + fill + '"' + EDGE + (extra || '') + '/>'; }
  function line(a, st) { return '<polyline points="' + pts(a) + '" fill="none" ' + st + '/>'; }
  function box(x0, x1, y0, y1, z0, z1, col, o) {
    o = o || {}; if (x1 - x0 < 0.001) return '';
    var s = '';
    if (!o.noTop) s += poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], hex(col, 1.05));
    if (!o.noFront) s += poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], col);
    if (!o.noSide) s += poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], hex(col, 0.9));
    return s;
  }
  function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sm(t) { t = cl(t); return t * t * (3 - 2 * t); }
  function seg(x, a, b) { return cl((x - a) / (b - a)); }
  function L(a, b, t) { return a + (b - a) * t; }
  function HL(a, amt) { return amt > .01 ? '<polygon points="' + pts(a) + '" fill="' + G + '" fill-opacity="' + (.2 * amt).toFixed(3) + '" stroke="' + G + '" stroke-opacity="' + (.95 * amt).toFixed(3) + '" stroke-width="1.6" stroke-linejoin="round"/>' : ''; }
  function grp(op, s) { return op > .995 ? s : op < .005 ? '' : '<g opacity="' + op.toFixed(3) + '">' + s + '</g>'; }

  /* rakennustyypit (Uudisrakentaminen-kortin luettelo) ja omakotitalo, jota muut vaiheet käyttävät */
  function win(a, b, z0, z1) { return { t: 'win', a: a, b: b, z0: z0 == null ? .9 : z0, z1: z1 == null ? 2.0 : z1 }; }
  function door(a, b, z1) { return { t: 'door', a: a, b: b, z0: 0, z1: z1 || 2.1 }; }
  function gdoor(a, b, z1) { return { t: 'gdoor', a: a, b: b, z0: 0, z1: z1 }; }
  var OKT = { W: 9, D: 6.5, H: 2.7, R: 1.9, wall: '#f6e7bd', front: [win(.8, 1.9), win(2.5, 3.5), win(5.4, 6.4), win(7.5, 8.1, 1.5, 2.0)], side: [win(.8, 1.7, 1.1, 2.0), door(2.6, 3.5)] };
  var TYPES = [
    { n: 'Hallit', g: { W: 16, D: 11, H: 5, R: 1.2, wall: '#efe2bf', hb: true, front: [0, 1, 2, 3].map(function (i) { return win(1.5 + i * 3.1, 3.5 + i * 3.1, 3.5, 4.2); }).concat([door(13.6, 14.6, 2.2)]), side: [gdoor(3.5, 7.5, 4.0)] } },
    { n: 'Rivitalot', g: { W: 18, D: 7, H: 2.7, R: 1.7, wall: '#f6e7bd', front: [0, 1, 2, 3].reduce(function (a, u) { return a.concat([door(u * 4.5 + .5, u * 4.5 + 1.4), win(u * 4.5 + 2.0, u * 4.5 + 3.8)]).concat(u ? [{ t: 'div', a: u * 4.5 }] : []); }, []), side: [win(2.6, 3.7, 1.1, 2.0)] } },
    { n: 'Omakotitalot', g: OKT },
    { n: 'Eläinsuojat', g: { W: 20, D: 9, H: 3, R: 2.4, wall: '#f2e2b8', vent: true, front: [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return win(1.2 + i * 2.3, 2.1 + i * 2.3, 1.9, 2.5); }), side: [door(3.5, 5.5, 2.7)] } },
    { n: 'Autotallit', g: { W: 6.5, D: 5.5, H: 2.5, R: 1.1, wall: '#f6e7bd', front: [win(2.6, 3.6, 1.1, 1.8)], side: [gdoor(1.2, 4.3, 2.2)] } }
  ];
  function geo(g) { var OV = .4; return { W: g.W, D: g.D, H: g.H, RZ: g.H + g.R, OV: OV, EZ: g.H - OV * g.R / (g.D / 2), RT: .12, WT: .2 }; }
  function bbox(g) { var q = geo(g), xs = [], ys = [];
    [[-.6, -.6, -.45], [g.W + .9, -.6, -.45], [g.W + .9, g.D + .9, -.45], [-.6, g.D + .9, -.45], [-.3, g.D / 2, q.RZ + q.RT], [g.W + .3, g.D / 2, q.RZ + q.RT], [-.3, g.D + q.OV, q.EZ], [g.W + .3, -q.OV, q.EZ + q.RT]]
      .forEach(function (p) { var r = P(p[0], p[1], p[2]); xs.push(r[0]); ys.push(r[1]); });
    return [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)]; }
  var BB = bbox(OKT);
  var NORM = { wall: null, roof: '#a3a8a4', sok: '#c9c7bb', glass: '#f5c95a', door: '#c9dcee', board: '#e6d4a4', frame: '#7fa784' };
  var THC = { wall: '#3b2e7e', roof: '#1f2558', sok: '#4a3a8c', glass: '#2b2a6a', door: '#4c3790', board: '#43358a', frame: '#5a43a0' };

  /* rakennus: k = rakentumisen eteneminen (0 tyhjä, 1 valmis), xc = leikkauksen kohta (seinä ja katto poistettu x > xc), th = lämpökuvavärit */
  function bld(g, o) {
    o = o || {}; var q = geo(g), W = q.W, D = q.D, H = q.H, RZ = q.RZ, OV = q.OV, EZ = q.EZ, RT = q.RT, WT = q.WT;
    var k = o.k == null ? 1 : o.k, col = o.th ? THC : NORM, wall = o.th ? THC.wall : g.wall, h = o.hl || {};
    var sokA = sm(seg(k, 0, .15)), hz = H * sm(seg(k, .12, .5)), rA = sm(seg(k, .5, .7)), rd = (1 - rA) * .9;
    var xc = Math.min(o.xc == null ? 99 : o.xc, W + .3), cut = xc < W - .01, xw = Math.min(xc, W);
    var s = '';
    s += '<polygon points="' + pts([[-.6, -.6, -.45], [W + .9, -.6, -.45], [W + .9, D + .9, -.45], [-.6, D + .9, -.45]]) + '" fill="#c3d798" fill-opacity="' + (.9 * sokA).toFixed(3) + '"/>';
    if (sokA < .01) return s;
    var so = poly([[W, 0, -.45], [W, D, -.45], [W, D, 0], [W, 0, 0]], hex(col.sok, .9)) + poly([[0, D, -.45], [W, D, -.45], [W, D, 0], [0, D, 0]], col.sok);
    if (k < 1) so += poly([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], hex(col.sok, 1.1));
    s += grp(sokA, so);
    var roofOn = rA > .01;
    /* takalape */
    /* takalapen pinta piirretään ennen päätyä, sen päätyreuna (räystäslauta x = W + .3) vasta päädyn jälkeen, koska se on katsojaa lähempänä */
    function backRoofTop() { var x1 = cut ? xc : W + .3, dz = rd;
      return poly([[-.3, D / 2, RZ + RT + dz], [x1, D / 2, RZ + RT + dz], [x1, -OV, EZ + RT + dz], [-.3, -OV, EZ + RT + dz]], hex(col.roof, 1.12)) +
        HL([[-.3, D / 2, RZ + RT], [x1, D / 2, RZ + RT], [x1, -OV, EZ + RT], [-.3, -OV, EZ + RT]], h.roof || 0); }
    function backRoofEnd() { var x1 = cut ? xc : W + .3, dz = rd;
      return poly([[x1, D / 2, RZ + dz], [x1, D / 2, RZ + RT + dz], [x1, -OV, EZ + RT + dz], [x1, -OV, EZ + dz]], hex(col.roof, .8)); }
    function backRoof() { return backRoofTop() + backRoofEnd(); }
    /* rakentumisen aikana näkyvät takaseinä ja vasen seinä sisältä */
    if (k < 1 && hz > .02) {
      s += poly([[WT, WT, 0], [W - WT, WT, 0], [W - WT, D - WT, 0], [WT, D - WT, 0]], hex(col.sok, 1.15));
      s += box(0, W, 0, WT, 0, hz, wall, { noSide: true, front: hex(wall, .97) });
      s += box(0, WT, WT, D - WT, 0, hz, wall, { noFront: true, side: hex(wall, .94) });
    }
    if (roofOn && !(k < 1)) s += backRoofTop();
    if (cut) s += o.inside || '';
    /* päätyseinä x = W */
    var sw = hex(wall, .93), sideFace = [[W, 0, 0], [W, D, 0], [W, D, hz], [W, 0, hz]], sOp = o.sideOp == null ? 1 : o.sideOp, s0 = s; s = '';
    var gab = !cut && hz >= H - .001;
    /* valmis pääty piirretään yhtenä viisikulmiona: ei saumaviivaa seinän ja kolmion välissä (z = H) */
    s += poly(gab ? [[W, 0, 0], [W, D, 0], [W, D, H], [W, D / 2, RZ], [W, 0, H]] : sideFace, sw);
    if (g.hb) { for (var zz = .45; zz < hz; zz += .45) s += line([[W, 0, zz], [W, D, zz]], 'stroke="' + col.board + '" stroke-width=".7"'); }
    else for (var yy = .2; yy < D; yy += .2) s += line([[W, yy, 0], [W, yy, hz]], 'stroke="' + col.board + '" stroke-width=".7"');
    if (gab) {
      if (!g.hb) for (yy = .2; yy < D; yy += .2) { var zt = H + (RZ - H) * (1 - Math.abs(yy - D / 2) / (D / 2)); s += line([[W, yy, H], [W, yy, zt - .03]], 'stroke="' + col.board + '" stroke-width=".7"'); }
    }
    if (cut) s += poly([[W - WT, 0, hz], [W, 0, hz], [W, D, hz], [W - WT, D, hz]], hex(wall, 1.02));
    g.side.forEach(function (f) { s += feat(f, 'x', W, hz, col); });
    s += HL(gab ? [[W, 0, 0], [W, D, 0], [W, D, H], [W, D / 2, RZ], [W, 0, H]] : sideFace, h.facade || 0);
    if (h.win) g.side.forEach(function (f) { if (f.t === 'win') s += HL(fq(f, 'x', W, hz), h.win); });
    s = s0 + grp(sOp, s);
    if (roofOn && !(k < 1)) s += backRoofEnd();
    /* etuseinä y = D */
    var front = [[0, D, 0], [xw, D, 0], [xw, D, hz], [0, D, hz]];
    s += poly(front, wall);
    if (g.hb) { for (zz = .45; zz < hz; zz += .45) s += line([[0, D, zz], [xw, D, zz]], 'stroke="' + col.board + '" stroke-width=".7"'); }
    else for (var xx = .2; xx < xw - .02; xx += .2) s += line([[xx, D, 0], [xx, D, hz]], 'stroke="' + col.board + '" stroke-width=".7"');
    if (k < 1 || cut) s += poly([[0, D - WT, hz], [xw, D - WT, hz], [xw, D, hz], [0, D, hz]], hex(wall, 1.02));
    if (cut) s += poly([[xw, D - WT, 0], [xw, D, 0], [xw, D, hz], [xw, D - WT, hz]], hex(wall, .88));
    g.front.forEach(function (f) { if (f.b == null || f.b < xw - .05) s += feat(f, 'y', D, hz, col); });
    s += HL(front, h.facade || 0);
    if (h.win) g.front.forEach(function (f) { if (f.t === 'win' && f.b < xw - .05) s += HL(fq(f, 'y', D, hz), h.win); });
    if (roofOn && k < 1) s += grp(rA, backRoof());
    /* etulape */
    if (roofOn) {
      var c = cut ? xc : W + .3, dz = rd, r = '';
      for (var xr = .25; xr < c - .05; xr += .5) r += '';
      r += poly([[-.3, D + OV, EZ + RT + dz], [c, D + OV, EZ + RT + dz], [c, D / 2, RZ + RT + dz], [-.3, D / 2, RZ + RT + dz]], col.roof);
      for (xr = .25; xr < c - .05; xr += .5) r += line([[xr, D + OV, EZ + RT + dz], [xr, D / 2, RZ + RT + dz]], 'stroke="' + (o.th ? '#2a3170' : '#8b918d') + '" stroke-width=".8"');
      r += poly([[-.3, D + OV, EZ + dz], [c, D + OV, EZ + dz], [c, D + OV, EZ + RT + dz], [-.3, D + OV, EZ + RT + dz]], hex(col.roof, .85));
      r += poly([[c, D + OV, EZ + dz], [c, D + OV, EZ + RT + dz], [c, D / 2, RZ + RT + dz], [c, D / 2, RZ + dz]], hex(col.roof, .7));
      if (g.vent) r += box(2, W - 2, D / 2 - .3, D / 2 + .3, RZ + RT + dz, RZ + RT + .32 + dz, '#8b918d');
      r += HL([[-.3, D + OV, EZ + RT], [c, D + OV, EZ + RT], [c, D / 2, RZ + RT], [-.3, D / 2, RZ + RT]], h.roof || 0);
      s += grp(rA, r);
    }
    return s;
  }
  /* aukko seinätasossa: ax 'y' = etuseinä (y = v), 'x' = päätyseinä (x = v) */
  function Q(ax, v, a, z) { return ax === 'y' ? [a, v, z] : [v, a, z]; }
  function fq(f, ax, v, hz) { var z1 = Math.min(f.z1, hz); return [Q(ax, v, f.a, f.z0), Q(ax, v, f.b, f.z0), Q(ax, v, f.b, z1), Q(ax, v, f.a, z1)]; }
  function feat(f, ax, v, hz, col) {
    if (f.t === 'div') return f.a < 99 ? line([Q(ax, v, f.a, 0), Q(ax, v, f.a, hz)], 'stroke="#7fa784" stroke-width="1.2"') : '';
    if (hz <= f.z0 + .02) return '';
    var z1 = Math.min(f.z1, hz), s = poly(fq(f, ax, v, hz), f.t === 'win' ? col.glass : col.door);
    if (f.t === 'win' && z1 > f.z0 + .2) { var m = (f.a + f.b) / 2; if (f.b - f.a > .7) s += line([Q(ax, v, m, f.z0), Q(ax, v, m, z1)], 'stroke="' + col.frame + '" stroke-width="1.5"'); }
    if (f.t === 'gdoor') for (var zz = f.z0 + .45; zz < z1; zz += .45) s += line([Q(ax, v, f.a, zz), Q(ax, v, f.b, zz)], 'stroke="' + hex(col.door, .85) + '" stroke-width=".8"');
    return s;
  }
  /* omakotitalon sisätilat leikkauksessa: keittiö ja pesuhuone (Saneeraus) */
  var XC = 4.0, XP = 6.5, PD = 4.6;
  function inside(a, h) {
    var g = OKT, W = g.W, D = g.D, H = g.H, WT = .2, x0 = XC, s = '', RZ = H + g.R, XB = XP + .1;
    s += poly([[x0, WT, 0], [XP, WT, 0], [XP, D, 0], [x0, D, 0]], '#e4d3ae');
    for (var x = x0 + .2; x < XP; x += .2) s += line([[x, WT, 0], [x, D, 0]], 'stroke="#d2c19c" stroke-width=".6"');
    s += poly([[XP, WT, 0], [W, WT, 0], [W, D, 0], [XP, D, 0]], '#e7ebeb');
    for (x = XP + .3; x < W; x += .3) s += line([[x, WT, 0], [x, D, 0]], 'stroke="#d3d9da" stroke-width=".6"');
    for (var y = WT + .3; y < D; y += .3) s += line([[XP, y, 0], [W, y, 0]], 'stroke="#d3d9da" stroke-width=".6"');
    s += HL([[x0, WT, 0], [XP, WT, 0], [XP, D, 0], [x0, D, 0]], h.kit || 0) + HL([[XB, WT, 0], [W, WT, 0], [W, D, 0], [XB, D, 0]], h.bath || 0);
    if (h.dmg > .01) s += stain([[6.75, 3.7], [7.3, 3.5], [7.8, 3.8], [7.7, 4.5], [7.2, 4.8], [6.75, 4.5]], 'floor', h.dmg);
    /* takaseinä ja sen pää, pesuhuoneen laatoitus */
    s += poly([[x0, WT, 0], [W, WT, 0], [W, WT, H], [x0, WT, H]], '#efeee9');
    s += poly([[XB, WT, 0], [W, WT, 0], [W, WT, 2.1], [XB, WT, 2.1]], '#e3e9ea');
    for (x = XB + .25; x < W; x += .25) s += line([[x, WT, 0], [x, WT, 2.1]], 'stroke="#cdd5d6" stroke-width=".6"');
    for (var z = .25; z < 2.1; z += .25) s += line([[XB, WT, z], [W, WT, z]], 'stroke="#cdd5d6" stroke-width=".6"');
    s += poly([[x0, 0, H], [W, 0, H], [W, WT, H], [x0, WT, H]], '#f2f1ec') + poly([[W, 0, 0], [W, WT, 0], [W, WT, H], [W, 0, H]], '#dcdbd5');
    /* leikkauspinta vasemmalla (talon ehjä osa) */
    s += poly([[x0, WT, 0], [x0, D, 0], [x0, D, H], [x0, WT, H]], '#e9e8e2');
    s += poly([[x0, 0, H], [x0, D, H], [x0, D / 2, RZ]], '#e3dfd2');
    var f = '';
    /* keittiö vasemman seinän vierellä: jääkaappi, alakaapit ja työtaso, yläkaapit */
    f += box(x0, x0 + .65, WT + .05, WT + .75, 0, 2.1, '#e6e8e8');
    f += box(x0, x0 + .6, 1.0, 4.4, 0, .86, '#f4f4f0', { noFront: false });
    for (y = 1.6; y < 4.35; y += .6) f += line([[x0 + .6, y, .05], [x0 + .6, y, .82]], 'stroke="#c9ccc6" stroke-width=".7"');
    f += box(x0, x0 + .63, 1.0, 4.4, .86, .91, '#7f857e');
    f += poly([[x0 + .12, 2.4, .915], [x0 + .48, 2.4, .915], [x0 + .48, 2.95, .915], [x0 + .12, 2.95, .915]], '#b9c0c0');
    f += box(x0, x0 + .34, 1.0, 4.4, 1.45, 2.1, '#f4f4f0');
    for (y = 1.6; y < 4.35; y += .6) f += line([[x0 + .34, y, 1.47], [x0 + .34, y, 2.08]], 'stroke="#c9ccc6" stroke-width=".7"');
    s += grp(a, f);
    /* väliseinä, laatoitettu pesuhuoneen puolelta */
    s += box(XP, XB, WT, PD, 0, H, '#ecebe5', { side: '#e3e9ea' });
    for (y = WT + .25; y < PD; y += .25) s += line([[XB, y, 0], [XB, y, 2.1]], 'stroke="#cdd5d6" stroke-width=".6"');
    for (z = .25; z < 2.15; z += .25) s += line([[XB, WT, z], [XB, PD, z]], 'stroke="#cdd5d6" stroke-width=".6"');
    if (h.dmg > .01) s += stain([[3.5, 0], [3.9, .3], [4.3, .15], [4.7, .6], [4.4, .8], [3.8, .65], [3.3, .35]], 'wall', h.dmg);
    f = '';
    /* pesuhuone: peili ja allas, wc, suihkunurkka */
    f += poly([[XB + .005, 1.0, 1.2], [XB + .005, 1.55, 1.2], [XB + .005, 1.55, 1.8], [XB + .005, 1.0, 1.8]], '#d3e1e5');
    f += box(XB, XB + .42, 1.0, 1.55, .3, .78, '#e8e6e0');
    f += box(XB, XB + .47, .95, 1.6, .78, .86, '#fbfbfb');
    f += box(XB, XB + .2, 2.15, 2.55, .4, .82, '#fbfbfb');
    f += box(XB + .2, XB + .62, 2.15, 2.55, 0, .42, '#fbfbfb');
    f += line([[8.4, WT, 2.0], [8.4, WT + .25, 2.0]], 'stroke="#8d9592" stroke-width="1.6" stroke-linecap="round"');
    var dr = P(8.35, .75, 0); f += '<circle cx="' + f1(dr[0]) + '" cy="' + f1(dr[1]) + '" r="2.2" fill="#aab3b3"/>';
    f += '<polygon points="' + pts([[7.8, WT, 0], [7.8, 1.3, 0], [7.8, 1.3, 2.0], [7.8, WT, 2.0]]) + '" fill="#cfe5ec" fill-opacity=".4" stroke="#8fb2bd" stroke-width=".9"/>';
    f += '<polygon points="' + pts([[7.8, 1.3, 0], [W, 1.3, 0], [W, 1.3, 2.0], [7.8, 1.3, 2.0]]) + '" fill="#cfe5ec" fill-opacity=".4" stroke="#8fb2bd" stroke-width=".9"/>';
    s += grp(a, f);
    return s;
  }
  function stain(xy, plane, amt) {
    var p3 = xy.map(function (q) { return plane === 'floor' ? [q[0], q[1], 0.002] : [XP + .1, q[0], q[1]]; });
    var d = p3.map(function (p, i) { var r = P(p[0], p[1], p[2]); return (i ? 'L' : 'M') + f1(r[0]) + ' ' + f1(r[1]); }).join('') + 'Z';
    return '<path d="' + d + '" fill="#8f7d5e" fill-opacity="' + (.32 * amt).toFixed(3) + '" stroke="#8f7d5e" stroke-opacity="' + (.5 * amt).toFixed(3) + '" stroke-width=".8" stroke-linejoin="round" filter="url(#pb1)"/>';
  }

  /* nimilappu: sana kortin tekstistä, lyhyt viiva osaan */
  var FS = 13;
  function chip(t, ax, ay, dx, dy, op) {
    if (op < .01) return '';
    var w = t.length * FS * .56 + 16, hh = FS + 11, cx = ax + dx, cy = ay + dy, s = '<g opacity="' + op.toFixed(3) + '">';
    if (dx || dy) s += '<line x1="' + f1(ax) + '" y1="' + f1(ay) + '" x2="' + f1(cx) + '" y2="' + f1(cy) + '" stroke="' + G + '" stroke-width="1.2"/><circle cx="' + f1(ax) + '" cy="' + f1(ay) + '" r="3.4" fill="' + G + '" stroke="#fff" stroke-width="1.3"/>';
    s += '<rect x="' + f1(cx - w / 2) + '" y="' + f1(cy - hh / 2) + '" width="' + f1(w) + '" height="' + hh + '" rx="' + hh / 2 + '" fill="#fff" stroke="' + G + '" stroke-width="1.2"/>' +
      '<text x="' + f1(cx) + '" y="' + f1(cy + FS * .36) + '" text-anchor="middle" font-size="' + FS + '" font-weight="600" fill="' + GD + '">' + t + '</text></g>';
    return s;
  }
  function chipTR(t, row, op) { var w = t.length * FS * .56 + 16; return chip(t, BB[2] - w / 2 - 2, BB[1] + 16 + row * (FS + 20), 0, 0, op); }
  function chipAt(t, p3, dx, dy, op) { var p = P(p3[0], p3[1], p3[2]); return chip(t, p[0], p[1], dx, dy, op); }
  function check(p3, t) {
    if (t < .01) return '';
    var p = P(p3[0], p3[1], p3[2]), sc = .6 + .4 * sm(t);
    return '<g opacity="' + sm(t).toFixed(3) + '" transform="translate(' + f1(p[0]) + ' ' + f1(p[1]) + ') scale(' + sc.toFixed(3) + ')"><circle r="9" fill="' + G + '" stroke="#fff" stroke-width="1.5"/><path d="M-4 0.5 L-1.2 3.3 L4.2 -2.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  var DEFS = '<defs><filter id="pb1" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1600" height="1400"><feGaussianBlur stdDeviation="1"/></filter>' +
    '<filter id="pb3" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1600" height="1400"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<filter id="pb6" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1600" height="1400"><feGaussianBlur stdDeviation="6"/></filter>' +
    '<linearGradient id="psc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0b0630"/><stop offset=".18" stop-color="#2a0f63"/><stop offset=".36" stop-color="#5c1384"/><stop offset=".52" stop-color="#9a1f7c"/><stop offset=".66" stop-color="#d1394f"/><stop offset=".78" stop-color="#f26b22"/><stop offset=".9" stop-color="#fbb13c"/><stop offset="1" stop-color="#fff3c4"/></linearGradient></defs>';

  /* ---------- vaiheet ---------- */
  var D = OKT.D, W = OKT.W, H = OKT.H, RZ = OKT.H + OKT.R, QO = geo(OKT);
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 0 Uudisrakentaminen: hallit, rivitalot, omakotitalot, eläinsuojat ja autotallit, alusta loppuun */
  function fit(g) { var b = bbox(g), f = Math.min((BB[2] - BB[0]) / (b[2] - b[0]), (BB[3] - BB[1]) / (b[3] - b[1]), 1);
    var tx = (BB[0] + BB[2]) / 2 - f * (b[0] + b[2]) / 2, ty = BB[3] - f * b[3]; return 'translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ') scale(' + f.toFixed(4) + ')'; }
  var FITS = TYPES.map(function (t) { return fit(t.g); });
  function stUudis(w, T) {
    if (RM) return bld(OKT) + chipTR('Omakotitalot', 0, w);
    var PD = 2.6, i = Math.floor(T / PD) % 5, ph = (T % PD) / PD, k = seg(ph, 0, .62), op = 1 - sm(seg(ph, .93, 1));
    var s = grp(1 - w, bld(OKT));
    s += grp(w * op, '<g transform="' + FITS[i] + '">' + bld(TYPES[i].g, { k: k }) + '</g>');
    s += chipTR(TYPES[i].n, 0, w * op * sm(seg(ph, .05, .2)));
    return s;
  }
  /* 1 Saneeraus: julkisivut, vesikatot, keittiöt, pesuhuoneet, vesivahingot ja ikkunaremontit */
  var SAN = ['Julkisivut', 'Vesikatot', 'Keittiöt', 'Pesuhuoneet', 'Vesivahingot', 'Ikkunaremontit'];
  function stSaneeraus(w, T) {
    var a = [0, 0, 0, 0, 0, 0], cutA;
    if (RM) { a = [.55, .55, 1, 1, 1, .8]; cutA = 1; }
    else {
      var PD = 2.3, i = Math.floor(T / PD) % 6, ph = (T % PD) / PD;
      cutA = i === 2 ? sm(seg(ph, 0, .3)) : (i === 3 || i === 4) ? 1 : i === 5 ? 1 - sm(seg(ph, 0, .3)) : 0;
      var st = (i === 2 || i === 5) ? .3 : .05;
      a[i] = sm(seg(ph, st, st + .15)) * (1 - sm(seg(ph, .9, 1)));
      if (i === 4) a[3] = .35 * a[4];
    }
    cutA *= w; a = a.map(function (v) { return v * w; });
    var xc = L(W + .3, XC, sm(cutA)), fa = sm(seg(cutA, .75, 1));
    var hl = { facade: a[0], roof: a[1], win: a[5], kit: a[2], bath: a[3], dmg: a[4] };
    var s = bld(OKT, { xc: xc, hl: hl, sideOp: 1 - sm(seg(cutA, 0, .45)), inside: xc < W - .01 ? inside(fa, hl) : '' });
    var lab = [
      ['Julkisivut', [2.2, D, .6], -46, 56], ['Vesikatot', [1.4, D * .75 + .2, (QO.EZ + RZ) / 2 + .1], -20, -58], ['Keittiöt', [XC + .3, 3.4, .92], -50, -66],
      ['Pesuhuoneet', [7.9, 2.9, 0], RM ? 30 : 0, RM ? -96 : 62], ['Vesivahingot', [7.3, 4.2, 0], 20, 62], ['Ikkunaremontit', [1.35, D, 1.45], 12, 70]];
    lab.forEach(function (l, j) { s += chipAt(l[0], l[1], l[2], l[3], RM ? (j >= 2 && j <= 4 ? w : 0) : (j === 3 ? cl((a[3] * 3 - 1.05) / 1.95) : a[j]) * (j >= 2 && j <= 4 ? fa : 1)); });
    return s;
  }
  /* 2 Suunnittelu ja valvonta: piirustukset ja pohja, sitten valvonta kohde kerrallaan */
  /* runkokuva (Suunnittelu): rankarunko 48x198 k600, aukkojen pää- ja tukipuut, kamanat ja alapuitteet, väliseinät pohjaratkaisun mukaan,
     NR-ristikot k870 päätyristikoineen, ruoteet 32x100 ja aluskate oikealla puoliskolla. Lasketaan kerran ja piirretään omana kerroksenaan. */
  function frameSVG() {
    var M = OKT.R / (D / 2), OV = QO.OV, o = [];
    var WOOD = ['#f0dbb0', '#ddbb82', '#c9a066'], WI = ['#f3e6c9', '#e6d2a8', '#d6bd8c'], BC = ['#f4e2bc', '#d9b77d', '#c7a066'];
    function fp(a, f) { return '<polygon points="' + pts(a) + '" fill="' + f + '"/>'; }
    function bx(x0, x1, y0, y1, z0, z1, c, noTop) { if (x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return '';
      return (noTop ? '' : fp([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c[0])) + fp([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], c[1]) + fp([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], c[2]); }
    var EXT = { front: OKT.front.map(function (f) { return [f.a, f.b, f.z0, f.z1]; }), back: [[1.2, 2.4, 1.0, 2.0], [5.2, 5.8, 1.5, 2.0]], left: [[2.4, 3.6, .9, 2.0]],
      right: OKT.side.map(function (f) { return [f.a, f.b, f.z0, f.z1]; }) };
    var INT = [['x', 3.65, .3, 2.1, []], ['x', 3.65, 3.3, 6.2, []], ['x', 4.55, .3, 2.1, []], ['x', 6.55, .3, 2.1, [[.7, 1.4]]], ['x', 6.55, 3.3, 6.2, []],
      ['y', 2.15, 3.7, 6.5, [[3.8, 4.4], [4.75, 5.55]]], ['y', 2.15, 6.6, 8.7, []], ['y', 3.25, 3.7, 6.5, [[5.5, 6.3]]], ['y', 4.35, 6.6, 8.7, [[7.9, 8.6]]]];
    function wall(ax, c0, c1, s0, s1, ops, int) {
      var t = .048, th = int ? .048 : .096, hh = int ? .15 : .2, col = int ? WI : WOOD, m = [], top = H - th, studs = [s0, s1 - t], keep = [], crip = [];
      function B(u0, u1, z0, z1, k) { var nt = k === 1; m.push({ k: k, u: u0, z: z0, s: ax === 'x' ? bx(u0, u1, c0, c1, z0, z1, col, nt) : bx(c0, c1, u0, u1, z0, z1, col, nt) }); }
      B(s0, s1, 0, .048, 0);
      for (var u = s0 + .6; u < s1 - t - .15; u += .6) studs.push(u);
      studs.forEach(function (u) { var hit = null; ops.forEach(function (p) { if (u + t > p[0] - 2 * t - .02 && u < p[1] + 2 * t + .02) hit = p; }); if (!hit) keep.push(u); else if (u > hit[0] && u + t < hit[1]) crip.push([u, hit]); });
      keep.forEach(function (u) { B(u, u + t, .048, top, 1); });
      ops.forEach(function (p) { var a = p[0], b = p[1], z0 = p[2] == null ? 0 : p[2], z1 = p[3] == null ? 2.1 : p[3];
        B(a - 2 * t, a - t, .048, top, 1); B(b + t, b + 2 * t, .048, top, 1); B(a - t, a, .048, z1, 1); B(b, b + t, .048, z1, 1);
        B(a - t, b + t, z1, z1 + hh, 2); if (z0 > .1) B(a, b, z0 - .048, z0, 2); });
      crip.forEach(function (q) { var u = q[0], p = q[1], z0 = p[2] == null ? 0 : p[2], z1 = p[3] == null ? 2.1 : p[3];
        if (z0 > .2) B(u, u + t, .048, z0 - .048, 1); if (top - (z1 + hh) > .08) B(u, u + t, z1 + hh, top, 1); });
      if (int) B(s0, s1, H - .048, H, 9); else { B(s0, s1, H - .096, H - .048, 9); B(s0, s1, H - .048, H, 9); }
      m.sort(function (p, q) { return p.k === 0 ? -1 : q.k === 0 ? 1 : p.k === 9 && q.k !== 9 ? 1 : q.k === 9 && p.k !== 9 ? -1 : p.u - q.u || p.z - q.z; });
      return m.map(function (e) { return e.s; }).join('');
    }
    function zl(y) { return H + M * (y <= D / 2 ? y : D - y); }
    function truss(x, gable) { var X = x + .048, s = '', BT = H + .145, T = .17, F = '#f0dbb0';
      function q(a) { return fp(a.map(function (p) { return [X, p[0], p[1]]; }), F); }
      function web(y0, z0, y1, z1) { var dy = y1 - y0, dz = z1 - z0, l = Math.sqrt(dy * dy + dz * dz), ny = -dz / l * .045, nz = dy / l * .045;
        return q([[y0 + ny, z0 + nz], [y1 + ny, z1 + nz], [y1 - ny, z1 - nz], [y0 - ny, z0 - nz]]); }
      s += q([[0, H], [D, H], [D, BT], [0, BT]]);
      if (gable) { for (var y = .6; y < D - .3; y += .6) if (zl(y) - BT > .12) s += q([[y - .024, BT], [y + .024, BT], [y + .024, zl(y + .024)], [y - .024, zl(y - .024)]]); }
      else s += web(D / 4, zl(D / 4), D / 3, BT) + web(D / 3, BT, D / 2, zl(D / 2)) + web(D / 2, zl(D / 2), 2 * D / 3, BT) + web(2 * D / 3, BT, 3 * D / 4, zl(3 * D / 4));
      s += q([[-OV, H - M * OV], [D / 2, RZ], [D / 2, RZ + T], [-OV, H - M * OV + T]]) + q([[D / 2, RZ], [D + OV, H - M * OV], [D + OV, H - M * OV + T], [D / 2, RZ + T]]);
      return s; }
    function boards() { var s = '', T = .17, BT2 = .032, BW = .1, X0 = 2.65, X1 = W + .3, n = 12;
      function top(y) { return zl(y) + T; }
      function batten(yc) { var y0 = yc - BW / 2, y1 = yc + BW / 2, a = top(y0), b = top(y1);
        return fp([[X0, y0, a + BT2], [X1, y0, a + BT2], [X1, y1, b + BT2], [X0, y1, b + BT2]], BC[0]) + fp([[X0, y1, b], [X1, y1, b], [X1, y1, b + BT2], [X0, y1, b + BT2]], BC[1]) + fp([[X1, y0, a], [X1, y1, b], [X1, y1, b + BT2], [X1, y0, a + BT2]], BC[2]); }
      s += '<polygon points="' + pts([[X0, -OV, top(-OV) + .005], [X1, -OV, top(-OV) + .005], [X1, D / 2, top(D / 2) + .005], [X0, D / 2, top(D / 2) + .005]]) + '" fill="#d5dcdc" stroke="#8b9696"/>';
      for (var i = 0; i < n; i++) s += batten(-OV + .06 + i / (n - 1) * (D / 2 - .1 + OV - .06));
      for (i = 0; i < n; i++) s += batten(D / 2 + .1 + i / (n - 1) * (D + OV - .06 - D / 2 - .1));
      var XR = X1 + .022, TB = .125, zb = top(-OV) + BT2, zr = top(D / 2) + BT2;
      s += fp([[XR, -OV, zb - TB], [XR, D / 2, zr - TB], [XR, D / 2, zr], [XR, -OV, zb]], '#e8cf9e') + fp([[XR, D / 2, zr - TB], [XR, D + OV, zb - TB], [XR, D + OV, zb], [XR, D / 2, zr]], '#e8cf9e');
      return s; }
    var FB = .05, FE = .25, s = '';
    /* maa, sokkeli ja laatta */
    s += '<polygon points="' + pts([[-.6, -.6, -.45], [W + .9, -.6, -.45], [W + .9, D + .9, -.45], [-.6, D + .9, -.45]]) + '" fill="#c3d798" fill-opacity=".9"/>';
    s += '<g stroke="#8d8b80" stroke-width=".4">' + fp([[W, 0, -.45], [W, D, -.45], [W, D, 0], [W, 0, 0]], '#cfcdc3') + fp([[0, D, -.45], [W, D, -.45], [W, D, 0], [0, D, 0]], '#dad8ce') + fp([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], '#e9e7df') + '</g>';
    var f = wall('x', FB, FE, FB, W - FB, EXT.back) + wall('y', FB, FE, FE, D - FE, EXT.left);
    INT.slice().sort(function (a, b) { return (a[1] + a[3]) - (b[1] + b[3]); }).forEach(function (w) {
      f += wall(w[0] === 'x' ? 'y' : 'x', w[1] - .035, w[1] + .035, w[2] - .05, w[3] + .05, w[4].map(function (d) { return [d[0], d[1], 0, 2.1]; }), true); });
    f += wall('y', W - FE, W - FB, FE, D - FE, EXT.right) + wall('x', D - FE, D - FB, FB, W - FB, EXT.front);
    for (var i = 0; i <= 10; i++) f += truss(FB + (W - 2 * FB - .048) * i / 10, i === 0 || i === 10);
    f += boards();
    return s + '<g stroke="#7a5a2e" stroke-width=".35" stroke-linejoin="round">' + f + '</g>';
  }
  var CHK = [[2.0, D, -.22], [3.0, D, 1.35], [W, 1.25, 1.55], [1.4, D * .75 + .2, (QO.EZ + RZ) / 2 + .1]];
  function stSuunnittelu(w, T) {
    var wa, ck = [0, 0, 0, 0], cA, cB;
    if (RM) { wa = 1; cA = 1; cB = 0; }
    else {
      var PD = 6.4, t = T % PD;
      wa = sm(seg(t, .1, .9)) * (1 - sm(seg(t, 2.9, 3.5)));
      cA = sm(seg(t, .3, .6)) * (1 - sm(seg(t, 2.8, 3.1)));
      cB = sm(seg(t, 3.4, 3.7)) * (1 - sm(seg(t, 6.0, 6.4)));
      ck = ck.map(function (v, i) { return seg(t, 3.7 + i * .4, 4.0 + i * .4) * (1 - sm(seg(t, 6.0, 6.4))); });
    }
    wa *= w;
    var s = grp(1 - wa, bld(OKT)) + bgL('runko', frameSVG, wa);
    ck.forEach(function (v, i) { s += check(CHK[i], v * w); });
    s += chipTR('Suunnittelu', 0, cA * w) + chipTR('Valvonta', 0, cB * w);
    return s;
  }
  /* 3 Kosteuden mittaus: rakenteiden kosteuden mittaus mittalaitteella ja vahinkokartoitus */
  function stKosteus(w, T) {
    /* leikkaus kuten Saneerauksessa; sisällä A: betonilaatan porareikämittaus (RH-anturi putkessa, kaapeli mittariin), B: pesuhuoneen väliseinän pintakosteuskartoitus */
    var cut, pA, rh, pts6, out, cA, cB;
    if (RM) { cut = 1; pA = 1; rh = 1; pts6 = 6; out = 1; cA = 1; cB = 1; }
    else {
      var PD = 8.4, t = T % PD;
      cut = sm(seg(t, 0, .7)) * (1 - sm(seg(t, 7.8, 8.4)));
      pA = sm(seg(t, .8, 1.1)) * (1 - sm(seg(t, 4.0, 4.3)));
      rh = sm(seg(t, 1.0, 2.6));
      pts6 = (t - 4.3) / .22; out = sm(seg(t, 5.7, 6.1)) * (1 - sm(seg(t, 7.5, 7.8)));
      cA = pA; cB = sm(seg(t, 4.3, 4.6)) * (1 - sm(seg(t, 7.5, 7.8)));
      if (t > 7.5) pts6 = 6 * (1 - seg(t, 7.5, 7.8));
    }
    cut *= w; pA *= w; cA *= w; cB *= w; out *= w;
    var xc = L(W + .3, XC, sm(cut)), fa = sm(seg(cut, .75, 1)), XB = XP + .1;
    var s = bld(OKT, { xc: xc, sideOp: 1 - sm(seg(cut, 0, .45)), inside: xc < W - .01 ? inside(fa, {}) : '' });
    var o = '';
    /* A: porareikämittaus */
    if (pA > .01) {
      var hp = P(4.4, 6.05, 0), sc = FS / 13;
      /* mittaputki Ø 14 mm todellisessa mittakaavassa: tulppa juuri lattiapinnan yläpuolella */
      var pr = .007 * Math.SQRT2 * S, prx = pr * C, pry = pr * .5, ph = .01 * S, pt = hp[1] - ph;
      var a = '<rect x="' + (hp[0] - prx).toFixed(3) + '" y="' + pt.toFixed(3) + '" width="' + (2 * prx).toFixed(3) + '" height="' + ph.toFixed(3) + '" fill="#9aa19e"/>' +
        '<ellipse cx="' + hp[0].toFixed(3) + '" cy="' + hp[1].toFixed(3) + '" rx="' + prx.toFixed(3) + '" ry="' + pry.toFixed(3) + '" fill="#9aa19e"/>' +
        '<ellipse cx="' + hp[0].toFixed(3) + '" cy="' + pt.toFixed(3) + '" rx="' + prx.toFixed(3) + '" ry="' + pry.toFixed(3) + '" fill="#d6dbda"/>';
      /* mittari: kaapeli anturin päästä */
      var mw = 34 * sc, mh = 54 * sc, mx = hp[0] + 36 * sc, my = hp[1] - 14 * sc;
      a += '<path d="M' + f1(hp[0]) + ' ' + f1(pt) + 'C' + f1(hp[0] + 2) + ' ' + f1(pt - 15) + ' ' + f1(mx - 14 * sc) + ' ' + f1(my + mh * .7) + ' ' + f1(mx) + ' ' + f1(my + mh * .62) + '" fill="none" stroke="#2b3a30" stroke-width="1.3"/>';
      a += '<rect x="' + f1(mx) + '" y="' + f1(my) + '" width="' + f1(mw) + '" height="' + f1(mh) + '" rx="' + f1(5 * sc) + '" fill="#2b3a30"/>' +
        '<rect x="' + f1(mx + 4 * sc) + '" y="' + f1(my + 5 * sc) + '" width="' + f1(mw - 8 * sc) + '" height="' + f1(22 * sc) + '" rx="' + f1(2 * sc) + '" fill="#e6efe5"/>' +
        '<text x="' + f1(mx + mw / 2) + '" y="' + f1(my + 19.5 * sc) + '" text-anchor="middle" font-size="' + f1(11 * sc) + '" font-weight="700" fill="#1e4422">' + Math.round(86 * rh) + ' %</text>' +
        '<text x="' + f1(mx + mw / 2) + '" y="' + f1(my + 25.5 * sc) + '" text-anchor="middle" font-size="' + f1(5.5 * sc) + '" font-weight="600" fill="#46584c">RH</text>' +
        '<circle cx="' + f1(mx + mw / 2) + '" cy="' + f1(my + 40 * sc) + '" r="' + f1(4.5 * sc) + '" fill="#46584c"/>';
      o += '<g opacity="' + pA.toFixed(3) + '">' + a + '</g>';
    }
    /* B: pintakosteuskartoitus pesuhuoneen väliseinän alaosassa (x = XB), mittapisteet 300 mm välein */
    var PTS = [2.7, 3.05, 3.4, 3.75, 4.1, 4.45], WET = [3, 4, 5];
    PTS.forEach(function (y, i) { var v = cl(pts6 - i) * w; if (v < .01) return; var p = P(XB + .01, y, .15), wet = WET.indexOf(i) >= 0;
      o += '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + (3 * (.5 + .5 * sm(v))).toFixed(2) + '" fill="' + (wet ? '#c47a1c' : G) + '" stroke="#fff" stroke-width="1.1" opacity="' + sm(v).toFixed(3) + '"/>'; });
    if (out > .01) { var q = [[XB + .01, 3.58, .02], [XB + .01, 4.58, .02], [XB + .01, 4.58, .62], [XB + .01, 3.58, .62]];
      o += '<polygon points="' + pts(q) + '" fill="#c47a1c" fill-opacity="' + (.1 * out).toFixed(3) + '" stroke="#c47a1c" stroke-width="1.4" stroke-dasharray="4 3" stroke-opacity="' + out.toFixed(3) + '"/>'; }
    /* pintakosteusosoitin painettuna seinää vasten viimeisen mittapisteen kohdalla */
    var dv = RM ? 1 : cl(pts6 + 1) * cB;
    if (dv > .01) { var k = Math.max(0, Math.min(5, Math.floor(pts6))), tp = P(XB + .01, PTS[k], .15), sc2 = FS / 13, wv = WET.indexOf(k) >= 0 || RM;
      var bx = tp[0] + 26 * sc2, by = tp[1] + 2 * sc2, bw = 22 * sc2, bh = 44 * sc2;
      o += '<g opacity="' + dv.toFixed(3) + '"><path d="M' + f1(tp[0] + 3) + ' ' + f1(tp[1] + 1) + 'L' + f1(bx + 3 * sc2) + ' ' + f1(by + 8 * sc2) + '" stroke="#2b3a30" stroke-width="' + f1(3 * sc2) + '" stroke-linecap="round"/>' +
        '<rect x="' + f1(bx) + '" y="' + f1(by) + '" width="' + f1(bw) + '" height="' + f1(bh) + '" rx="' + f1(4 * sc2) + '" fill="#2b3a30"/>' +
        '<rect x="' + f1(bx + 3 * sc2) + '" y="' + f1(by + 4 * sc2) + '" width="' + f1(bw - 6 * sc2) + '" height="' + f1(14 * sc2) + '" rx="' + f1(1.5 * sc2) + '" fill="#e6efe5"/>' +
        '<rect x="' + f1(bx + 5 * sc2) + '" y="' + f1(by + 12 * sc2) + '" width="' + f1((bw - 10 * sc2) * (wv ? .85 : .3)) + '" height="' + f1(4 * sc2) + '" fill="' + (wv ? '#c47a1c' : G) + '"/></g>'; }
    o += chipAt('Kosteuden mittaus', [4.4, 6.35, 0], -64, 50, cA);
    o += chipAt('Vahinkokartoitukset', [XB + .01, 4.08, .62], 40, -84, cB);
    return s + o;
  }
  /* 4 Lämpökuvaus: lämpökuva paljastaa energiavuodot, kylmäsillat ja eristepuutteet */
  function ring(p3, r, op) { if (op < .01) return ''; var p = P(p3[0], p3[1], p3[2]); return '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="' + r + '" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 3" opacity="' + op.toFixed(3) + '"/>'; }
  var LEAK = [[.8, D, .9], [1.9, D, .9], [2.5, D, .9], [3.5, D, .9], [5.4, D, .9], [6.4, D, .9], [W, 2.6, 1.0], [2.2, D, 2.12], [6.0, D, 2.12]];
  /* lämpökuva (ironbow): lämpö karkaa vain liitoksista; hehku piirretään kunkin seinän omassa tasossa ja rajataan siihen. Lasketaan kerran. */
  var IB = [[0, '#0b0630'], [.18, '#2a0f63'], [.36, '#5c1384'], [.52, '#9a1f7c'], [.66, '#d1394f'], [.78, '#f26b22'], [.9, '#fbb13c'], [1, '#fff3c4']];
  function ib(t) { for (var i = 1; i < IB.length; i++) if (t <= IB[i][0]) { var a = IB[i - 1], b = IB[i], k = (t - a[0]) / (b[0] - a[0]);
    return 'rgb(' + [1, 3, 5].map(function (j) { var u = parseInt(a[1].substr(j, 2), 16), v = parseInt(b[1].substr(j, 2), 16); return Math.round(u + (v - u) * k); }).join(',') + ')'; } return IB[IB.length - 1][1]; }
  function mat(a) { return 'matrix(' + a.map(function (v) { return v.toFixed(3); }).join(' ') + ')'; }
  function thermalSVG() {
    var RT = QO.RT, OV = QO.OV, EZ = QO.EZ, s = '', E = 'stroke="' + ib(.3) + '" stroke-width=".6"';
    var GLASS = ib(.2), DOOR = ib(.34), FR = 'filterUnits="userSpaceOnUse" x="-3" y="-3" width="30" height="14"';
    function tp(a, f) { return '<polygon points="' + pts(a) + '" fill="' + f + '" ' + E + '/>'; }
    function heat(shape, w, amt) { return '<g fill="none" stroke-linejoin="round">' +
      '<g filter="url(#tb1)" stroke="' + ib(.55) + '" stroke-width="' + (w * 2.2) + '" opacity="' + (.85 * amt) + '">' + shape + '</g>' +
      '<g filter="url(#tb2)" stroke="' + ib(.75) + '" stroke-width="' + w + '" opacity="' + (.9 * amt) + '">' + shape + '</g>' +
      '<g filter="url(#tb2)" stroke="' + ib(.92) + '" stroke-width="' + (w * .35) + '" opacity="' + (.55 * amt) + '">' + shape + '</g></g>'; }
    function rc(u0, u1, v0, v1) { return '<rect x="' + u0 + '" y="' + v0 + '" width="' + (u1 - u0).toFixed(2) + '" height="' + (v1 - v0).toFixed(2) + '"/>'; }
    function pl(a) { return '<polyline points="' + a.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>'; }
    var gab = '0,0 ' + D + ',0 ' + D + ',' + H + ' ' + (D / 2) + ',' + RZ + ' 0,' + H;
    s += '<defs><filter id="tb1" ' + FR + '><feGaussianBlur stdDeviation=".26"/></filter><filter id="tb2" ' + FR + '><feGaussianBlur stdDeviation=".11"/></filter>' +
      '<clipPath id="tcF"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath><clipPath id="tcS"><polygon points="' + gab + '"/></clipPath>' +
      '<linearGradient id="tgS" x1="0" y1="0" x2="0" y2="' + RZ + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + ib(.2) + '"/><stop offset=".7" stop-color="' + ib(.3) + '"/><stop offset="1" stop-color="' + ib(.36) + '"/></linearGradient>' +
      '<linearGradient id="tgF" x1="0" y1="0" x2="0" y2="' + H + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + ib(.22) + '"/><stop offset="1" stop-color="' + ib(.32) + '"/></linearGradient></defs>';
    /* takalape ja sokkelit */
    s += tp([[-.3, D / 2, RZ + RT], [W + .3, D / 2, RZ + RT], [W + .3, -OV, EZ + RT], [-.3, -OV, EZ + RT]], ib(.11));
    s += tp([[W, 0, -.45], [W, D, -.45], [W, D, 0], [W, 0, 0]], ib(.27)) + tp([[0, D, -.45], [W, D, -.45], [W, D, 0], [0, D, 0]], ib(.3));
    /* päätyseinä x = W, paikallinen u = y, v = z */
    var sw = OKT.side[0], sd = OKT.side[1], sc = '<polygon points="' + gab + '" fill="url(#tgS)"/>';
    sc += heat(pl([[0, H + .02], [D / 2, RZ], [D, H + .02]]), .24, .8) + heat(pl([[.05, 0], [.05, H]]), .18, .7) + heat(pl([[D - .05, 0], [D - .05, H]]), .18, .85) + heat(pl([[0, .08], [D, .08]]), .2, .65);
    sc += heat(rc(sw.a, sw.b, sw.z0, sw.z1), .14, .9) + '<rect x="' + (sw.a + .06) + '" y="' + (sw.z0 + .06) + '" width="' + (sw.b - sw.a - .12).toFixed(2) + '" height="' + (sw.z1 - sw.z0 - .12).toFixed(2) + '" fill="' + GLASS + '"/>';
    sc += '<rect x="' + sd.a + '" y="0" width="' + (sd.b - sd.a).toFixed(2) + '" height="' + sd.z1 + '" fill="' + DOOR + '"/>' + heat(pl([[sd.a, 0], [sd.a, sd.z1], [sd.b, sd.z1], [sd.b, 0]]), .13, 1);
    sc += '<circle cx="' + (D / 2) + '" cy="' + (H + .9) + '" r=".2" fill="' + ib(.95) + '" filter="url(#tb1)"/><circle cx="' + (D / 2) + '" cy="' + (H + .9) + '" r=".1" fill="' + ib(.9) + '" filter="url(#tb2)"/>';
    s += '<g transform="' + mat([-C * S, .5 * S, 0, -S, W * C * S, .5 * W * S]) + '"><g clip-path="url(#tcS)">' + sc + '</g></g>';
    /* etuseinä y = D, paikallinen u = x, v = z */
    var fc = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#tgF)"/>';
    for (var u = .6; u < W; u += .6) fc += '<rect x="' + (u - .03).toFixed(2) + '" y="0" width=".06" height="' + H + '" fill="' + ib(.31) + '" filter="url(#tb2)"/>';
    fc += heat(pl([[0, H - .04], [W, H - .04]]), .32, .95) + heat(pl([[0, .08], [W, .08]]), .2, .65) + heat(pl([[W - .05, 0], [W - .05, H]]), .18, .85) + heat(pl([[.05, 0], [.05, H]]), .18, .6);
    OKT.front.forEach(function (f, i) { fc += heat(rc(f.a, f.b, f.z0, f.z1), .14, i === 1 ? 1 : .8);
      fc += '<rect x="' + (f.a + .06) + '" y="' + (f.z0 + .06) + '" width="' + (f.b - f.a - .12).toFixed(2) + '" height="' + (f.z1 - f.z0 - .12).toFixed(2) + '" fill="' + GLASS + '"/>';
      fc += '<rect x="' + ((f.a + f.b) / 2 - .03).toFixed(2) + '" y="' + f.z0 + '" width=".06" height="' + (f.z1 - f.z0).toFixed(2) + '" fill="' + ib(.45) + '"/>'; });
    fc += '<path d="M3.45 2.0 C3.6 2.2 3.5 2.4 3.7 ' + (H - .05) + '" fill="none" stroke="' + ib(.7) + '" stroke-width=".18" filter="url(#tb1)" opacity=".8"/>';
    s += '<g transform="' + mat([C * S, .5 * S, 0, -S, -C * S * D, .5 * S * D]) + '"><g clip-path="url(#tcF)">' + fc + '</g></g>';
    /* etulape kylmä ja tasainen, räystäät ja päätylaudat */
    s += tp([[-.3, D + OV, EZ + RT], [W + .3, D + OV, EZ + RT], [W + .3, D / 2, RZ + RT], [-.3, D / 2, RZ + RT]], ib(.13));
    for (var xr = .25; xr < W + .25; xr += .5) s += line([[xr, D + OV, EZ + RT], [xr, D / 2, RZ + RT]], 'stroke="' + ib(.17) + '" stroke-width=".7"');
    s += tp([[-.3, D + OV, EZ], [W + .3, D + OV, EZ], [W + .3, D + OV, EZ + RT], [-.3, D + OV, EZ + RT]], ib(.2));
    s += tp([[W + .3, D + OV, EZ], [W + .3, D + OV, EZ + RT], [W + .3, D / 2, RZ + RT], [W + .3, D / 2, RZ]], ib(.18)) + tp([[W + .3, D / 2, RZ], [W + .3, D / 2, RZ + RT], [W + .3, -OV, EZ + RT], [W + .3, -OV, EZ]], ib(.18));
    s += line([[-.3, D / 2, RZ + RT], [W + .3, D / 2, RZ + RT]], 'stroke="' + ib(.4) + '" stroke-width="1.4" opacity=".7"');
    return s;
  }
  function camUI(op) {
    if (op < .01) return '';
    var x0 = BB[0] + 18, y0 = BB[1] + 30, x1 = BB[2] - 30, y1 = BB[3] - 6, a = 18, d = 'M' + x0 + ' ' + (y0 + a) + 'V' + y0 + 'H' + (x0 + a) + 'M' + (x1 - a) + ' ' + y0 + 'H' + x1 + 'V' + (y0 + a) + 'M' + x1 + ' ' + (y1 - a) + 'V' + y1 + 'H' + (x1 - a) + 'M' + (x0 + a) + ' ' + y1 + 'H' + x0 + 'V' + (y1 - a);
    var bx = x1 - 26, by = y0 + 32, bh = 56, fs = (FS * .72).toFixed(1);
    return '<g opacity="' + op.toFixed(3) + '"><path d="' + d + '" fill="none" stroke="' + GD + '" stroke-width="1.8" stroke-linecap="round"/><rect x="' + bx + '" y="' + by + '" width="7" height="' + bh + '" rx="2" fill="url(#psc)"/>' +
      [['°C', -9, 'middle', bx + 3.5], ['+4', 4, 'start', bx + 11], ['-4', bh / 2 + 4, 'start', bx + 11], ['-12', bh + 4, 'start', bx + 11]].map(function (l) { return '<text x="' + l[3] + '" y="' + (by + l[1]) + '" font-size="' + fs + '" font-weight="600" text-anchor="' + l[2] + '" fill="#3a3550">' + l[0] + '</text>'; }).join('') + '</g>';
  }
  function stLampo(w, T) {
    var tv = sm(seg(w, .25, 1)), s = grp(1 - tv, bld(OKT)), a = [1, 1, 1];
    if (!RM) { var PD = 2.4, i = Math.floor(T / PD) % 3, ph = (T % PD) / PD; a = [0, 0, 0]; a[i] = sm(seg(ph, .08, .25)) * (1 - sm(seg(ph, .9, 1))); }
    a = a.map(function (v) { return v * tv; });
    s += bgL('lampo', thermalSVG, tv) + camUI(tv);
    var o = '';
    LEAK.forEach(function (p) { o += ring(p, 9, a[0]); });
    [[1.2, D, 1.35], [4.2, D, 1.35], [W, D, 1.35], [7.5, D, .06]].forEach(function (p, j) { o += ring(p, j === 3 ? 10 : 8, a[1]); });
    if (a[2] > .01) { var q = [[5.5, D, 1.6], [7.3, D, 1.6], [7.3, D, 2.25], [5.5, D, 2.25]]; o += '<polygon points="' + pts(q) + '" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="5 4" opacity="' + a[2].toFixed(3) + '"/>'; }
    o += chipAt('Energiavuodot', [1.9, D, .9], -30, 70, a[0]) + chipAt('Kylmäsillat', [W, D, 1.35], 40, 60, a[1]) + chipAt('Eristepuutteet', [6.4, D, 2.25], 10, -84, a[2]);
    return s + o;
  }
  /* 5 Tiiviysmittaus: puhallin ovessa, ilmavuodot näkyviin; mittaus varmistaa energiatehokkuuden ja sisäilman laadun */
  function fan(op, T) {
    if (op < .01) return '';
    var y0 = 2.6, y1 = 3.5, cy = 3.05, cz = 1.15, r = .36, o = '';
    o += poly([[W + .01, y0, 0], [W + .01, y1, 0], [W + .01, y1, 2.1], [W + .01, y0, 2.1]], '#2b3a30');
    var c = []; for (var i = 0; i < 24; i++) { var t = i / 24 * Math.PI * 2; c.push([W + .02, cy + r * Math.cos(t), cz + r * Math.sin(t)]); }
    o += '<polygon points="' + pts(c) + '" fill="#46584c" stroke="#7d8c83" stroke-width="1"/>';
    var an = T * 7; for (i = 0; i < 3; i++) { var t2 = an + i * 2.094; o += line([[W + .03, cy, cz], [W + .03, cy + r * .9 * Math.cos(t2), cz + r * .9 * Math.sin(t2)]], 'stroke="#c9d3cc" stroke-width="2.4" stroke-linecap="round"'); }
    var hp = P(W + .03, cy, cz); o += '<circle cx="' + f1(hp[0]) + '" cy="' + f1(hp[1]) + '" r="2.4" fill="#c9d3cc"/>';
    /* mittari jalustalla oven vieressä */
    var g0 = P(W + .5, 4.4, 0), g1 = P(W + .5, 4.4, 1.2);
    o += '<line x1="' + f1(g0[0]) + '" y1="' + f1(g0[1]) + '" x2="' + f1(g1[0]) + '" y2="' + f1(g1[1]) + '" stroke="#2b3a30" stroke-width="1.6"/><rect x="' + f1(g1[0] - 13) + '" y="' + f1(g1[1] - 26) + '" width="26" height="22" rx="3" fill="#2b3a30"/><rect x="' + f1(g1[0] - 9) + '" y="' + f1(g1[1] - 22) + '" width="18" height="10" rx="1.5" fill="#e6efe5"/>';
    return '<g opacity="' + op.toFixed(3) + '">' + o + '</g>';
  }
  function arrow(p3, dir, len, op, T, out) {
    if (op < .01) return '';
    var p = P(p3[0], p3[1], p3[2]), ux = dir[0], uy = dir[1], m = Math.hypot(ux, uy); ux /= m; uy /= m;
    var sx = out ? p[0] : p[0] - ux * len, sy = out ? p[1] : p[1] - uy * len, ex = sx + ux * len, ey = sy + uy * len, o = '';
    o += '<line x1="' + f1(sx) + '" y1="' + f1(sy) + '" x2="' + f1(ex) + '" y2="' + f1(ey) + '" stroke="#2f6fb5" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="5 4" stroke-dashoffset="' + f1(-T * 22) + '"/>';
    o += '<path d="M' + f1(ex - ux * 6 - uy * 3.5) + ' ' + f1(ey - uy * 6 + ux * 3.5) + 'L' + f1(ex) + ' ' + f1(ey) + 'L' + f1(ex - ux * 6 + uy * 3.5) + ' ' + f1(ey - uy * 6 - ux * 3.5) + '" fill="none" stroke="#2f6fb5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
    return '<g opacity="' + op.toFixed(3) + '">' + o + '</g>';
  }
  var AIRIN = [[[1.9, D, 2.0], [.6, -.9]], [[3.5, D, 1.0], [.7, -.8]], [[2.6, D, 2.15], [.2, -1]], [[5.0, D, .03], [.5, -1]], [[W, 1.7, 2.0], [-1, -.5]]];
  function stTiiviys(w, T) {
    var s = bld(OKT), lk = 1, cA = 1, cB = 0;
    if (!RM) { var PD = 7, t = T % PD; lk = sm(seg(t, .3, .8)) * (1 - sm(seg(t, 3.6, 4.2))); cA = sm(seg(t, .1, .4)) * (1 - sm(seg(t, 3.5, 3.8))); cB = sm(seg(t, 3.9, 4.3)) * (1 - sm(seg(t, 6.6, 7))); }
    var o = fan(w, T);
    AIRIN.forEach(function (a) { o += arrow(a[0], a[1], 26, lk * w, T, false); });
    [[3.0, 1.2], [3.05, 1.6], [3.1, .8]].forEach(function (q, i) { o += arrow([W + .05, q[0], q[1]], [.87, .5], 34, w * (RM ? 1 : .9), T, true); });
    o += chipAt('Tiiviysmittaus', [W, 3.05, 2.1], 40, -70, cA * w);
    o += chipTR('Energiatehokkuus', 0, cB * w) + chipTR('Sisäilman laatu', 1, cB * w);
    return s + o;
  }
  var BGQ = null, BGC = {};
  function bgL(key, fn, op) { BGQ = { k: key, fn: fn, op: op }; return '<!--bg-->'; }
  var STEPS = [stUudis, stSaneeraus, stSuunnittelu, stKosteus, stLampo, stTiiviys];

  /* ---------- ajastus: kunkin vaiheen oma kello etenee vain, kun vaihe on levossa ja osio näkyy ---------- */
  var st = { s: 0, svg: null, tl: [0, 0, 0, 0, 0, 0], last: 0, raf: 0, vis: true, io: false, rk: -1 };
  function draw() {
    var svg = st.svg; if (!svg) return;
    var mob = window.innerWidth <= 860; FS = mob ? 20 : 13;
    var m = 14, vb = (BB[0] - m).toFixed(0) + ' ' + (BB[1] - m).toFixed(0) + ' ' + (BB[2] - BB[0] + 2 * m).toFixed(0) + ' ' + (BB[3] - BB[1] + 2 * m).toFixed(0);
    if (svg.getAttribute('viewBox') !== vb) svg.setAttribute('viewBox', vb);
    var s = st.s, k = Math.max(0, Math.min(5, Math.round(s))), w = cl(1 - Math.abs(s - k) * 2);
    BGQ = null;
    var h = STEPS[k](w, st.tl[k]).split('<!--bg-->'), Ls = st.L;
    /* kerrokset: edessä ja takana vaihtuvat osat, välissä raskas kiinteä kerros (runko, lämpökuva), joka rakennetaan vain kerran ja jota himmennetään */
    if (!Ls || Ls[0].parentNode !== svg) { svg.innerHTML = DEFS + '<g></g><g></g><g></g>'; Ls = st.L = [svg.childNodes[1], svg.childNodes[2], svg.childNodes[3]]; st.H = [null, null]; st.bk = null; }
    if (st.H[0] !== h[0]) { Ls[0].innerHTML = h[0]; st.H[0] = h[0]; }
    var t2 = h[1] || ''; if (st.H[1] !== t2) { Ls[2].innerHTML = t2; st.H[1] = t2; }
    if (BGQ && BGQ.op > .004) {
      if (st.bk !== BGQ.k) { Ls[1].innerHTML = BGC[BGQ.k] || (BGC[BGQ.k] = BGQ.fn()); st.bk = BGQ.k; }
      Ls[1].setAttribute('opacity', BGQ.op > .995 ? '1' : BGQ.op.toFixed(3)); Ls[1].style.display = '';
    } else Ls[1].style.display = 'none';
  }
  function tick(now) {
    st.raf = 0;
    var dt = st.last ? Math.min(.1, (now - st.last) / 1000) : 0; st.last = now;
    var k = Math.round(st.s);
    if (!st.vis || document.hidden) { st.last = 0; return; }   /* ei piirtoa eikä silmukkaa, kun osio ei näy */
    if (Math.abs(st.s - k) < 1e-3) { if (st.rk !== k) { st.rk = k; st.tl[k] = 0; } st.tl[k] += dt; draw(); }
    loop();
  }
  function loop() { if (!RM && !st.raf) st.raf = requestAnimationFrame(tick); }
  window.KAPE_ISOP = { draw: draw, st: st, steps: STEPS };
  window.SVX = window.SVX || {};
  window.SVX.p = function (svg, s) {
    st.svg = svg; st.s = s;
    if (!st.io && 'IntersectionObserver' in window) { st.io = true; new IntersectionObserver(function (e) { st.vis = e[0].isIntersecting; st.last = 0; if (st.vis) { st.rk = -1; loop(); } }).observe(svg); document.addEventListener('visibilitychange', function () { st.last = 0; if (!document.hidden) loop(); }); }
    draw(); loop();
  };
})();
