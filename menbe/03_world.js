// ===== world: map geometry, colliders, navigation =====
const W = { boxes: [], dyn: [], X0: -38, X1: 38, Z0: -48, Z1: 46, spawns: [], pickups: [], barrels: [], stains: [], checkpoints: [], zones: [], mesh: null };
W.reset = function (M) { const b = M.bounds; W.X0 = b[0]; W.Z0 = b[1]; W.X1 = b[2]; W.Z1 = b[3]; W.boxes = []; W.dyn = []; W.spawns = []; W.pickups = []; W.barrels = []; W.stains = []; W.checkpoints = []; W.zones = M.zones; W.map = M; W.start = null; };
const K = {
  ply: hex(0xd6a76e), plyD: hex(0xb38650), post: hex(0x9a7040), conc: hex(0xc4c3bf), concD: hex(0xaeada8), asph: hex(0x7c7f86),
  grass: hex(0x6f9b47), dirt: hex(0xa8906a), wallC: hex(0xb9b6ae), crate: hex(0xc79c60), crateD: hex(0x8f6b3c), metalD: hex(0x3a3e46),
  tire: hex(0x25272b), bag: hex(0xb7a47a), bagD: hex(0xa39068), yellow: hex(0xe3b21f), red: hex(0xb93a2c), white: hex(0xd8d8d4),
  blue: hex(0x3f6ea8), green: hex(0x4e7d55), ochre: hex(0xc48a2c), rust: hex(0xa4472f), glass: hex(0x243445), steel: hex(0x8d939c),
  trunk: hex(0x6b4a2e), leaf: hex(0x4f8a3c), leaf2: hex(0x6aa348), leaf3: hex(0x3f7436),
  snow: hex(0xf3f6fa), sand: hex(0xdcbc8c), clay: hex(0xcf9f6e), clayD: hex(0xb3845a), stone: hex(0xb8a283)
};
const THEME0 = { wall: K.wallC, wallD: K.concD, cap: K.conc, bag: K.bag, bagD: K.bagD, wallM: 7, snow: false, wire: true };

W.solid = function (x0, z0, x1, z1, h, k) { const b = { x0: min(x0, x1), z0: min(z0, z1), x1: max(x0, x1), z1: max(z0, z1), h, k: k || 0 }; W.boxes.push(b); return b; };


function makeKit(g, TH) {
  const solid = W.solid, H = 2.7, TH_ = 0.24;
  const line = (x0, z0, x1, z1, c) => g.quadXZ(min(x0, x1), min(z0, z1), max(x0, x1), max(z0, z1), 0.014, c || K.white, 0);
  // ---------- generic props ----------
  function post(x, z, h, s) { g.bx(x - s / 2, 0, z - s / 2, x + s / 2, h, z + s / 2, K.post, 0); }
  // plywood wall run with door (0) / window (1) gaps
  function plyRun(ax, c, a, b, gaps, h) {
    h = h || H; gaps = (gaps || []).slice().sort((p, q) => p[0] - q[0]); let s = a;
    const seg = (s, e, hh) => {
      if (e - s < 0.02) return;
      if (ax === 'x') { g.bx(s, 0, c - TH_ / 2, e, hh, c + TH_ / 2, K.ply, 2, 8); g.bx(s - 0.02, hh, c - TH_ / 2 - 0.03, e + 0.02, hh + 0.06, c + TH_ / 2 + 0.03, K.plyD, 0); solid(s, c - TH_ / 2, e, c + TH_ / 2, hh, 1); }
      else { g.bx(c - TH_ / 2, 0, s, c + TH_ / 2, hh, e, K.ply, 2, 8); g.bx(c - TH_ / 2 - 0.03, hh, s - 0.02, c + TH_ / 2 + 0.03, hh + 0.06, e + 0.02, K.plyD, 0); solid(c - TH_ / 2, s, c + TH_ / 2, e, hh, 1); }
    };
    const pst = t => { if (ax === 'x') post(t, c, h + 0.1, 0.3); else post(c, t, h + 0.1, 0.3); };
    pst(a); pst(b);
    for (const gp of gaps) { seg(s, gp[0], h); if (gp[2] === 1) seg(gp[0], gp[1], 1.0); pst(gp[0]); pst(gp[1]); s = gp[1]; }
    seg(s, b, h);
  }
  function concRun(ax, c, a, b, h, th) {
    h = h || 3.2; th = th || 0.5;
    if (ax === 'x') { g.bx(a, 0, c - th / 2, b, h, c + th / 2, TH.wall, TH.wallM, 8); solid(a, c - th / 2, b, c + th / 2, h, 0); if (TH.wire) g.bx(a, h + 0.3, c - 0.02, b, h + 0.34, c + 0.02, K.metalD, 0); if (TH.snow) g.bx(a, h, c - th / 2 - 0.03, b, h + 0.09, c + th / 2 + 0.03, K.snow, 14); }
    else { g.bx(c - th / 2, 0, a, c + th / 2, h, b, TH.wall, TH.wallM, 8); solid(c - th / 2, a, c + th / 2, b, h, 0); if (TH.wire) g.bx(c - 0.02, h + 0.3, a, c + 0.02, h + 0.34, b, K.metalD, 0); if (TH.snow) g.bx(c - th / 2 - 0.03, h, a, c + th / 2 + 0.03, h + 0.09, b, K.snow, 14); }
    const n = Math.round((b - a) / 5);
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; const px = ax === 'x' ? t : c, pz = ax === 'x' ? c : t; g.bx(px - 0.38, 0, pz - 0.38, px + 0.38, h + 0.18, pz + 0.38, TH.wallD, TH.wallM, 8); g.bx(px - 0.44, h + 0.18, pz - 0.44, px + 0.44, h + 0.28, pz + 0.44, TH.snow ? K.snow : TH.cap, TH.snow ? 14 : 0); }
  }
  function crate(x, z, s, y0, yaw, c) {
    const T = TM(x, (y0 || 0) + s / 2, z, yaw || 0), e = s / 2, t = s * 0.1, o = e - t / 2 + 0.012, cd = K.crateD;
    g.box(s, s, s, c || K.crate, 10, T);
    for (const a of [-1, 1]) for (const b of [-1, 1]) { g.box(t, s + 0.024, t, cd, 0, T, a * o, 0, b * o); g.box(s + 0.024, t, t, cd, 0, T, 0, a * o, b * o); g.box(t, t, s + 0.024, cd, 0, T, a * o, b * o, 0); }
  }
  function crates(x, z, s, n, yaw) { // stack of n
    yaw = yaw || 0; let y = 0;
    for (let i = 0; i < n; i++) { const ss = s * (i ? 0.86 : 1); crate(x + (i ? rnd(-0.08, 0.08) : 0), z + (i ? rnd(-0.08, 0.08) : 0), ss, y, yaw + (i ? rnd(-0.3, 0.3) : 0)); y += ss; }
    if (TH.snow) g.bx(x - s * 0.4, y, z - s * 0.4, x + s * 0.4, y + 0.07, z + s * 0.4, K.snow, 14);
    const r = s / 2 * (abs(cos(yaw)) + abs(sin(yaw))); solid(x - r, z - r, x + r, z + r, y, 1);
  }
  function barrel(x, z, c) {
    const T = TM(x, 0, z);
    g.cyl(0.29, 0.29, 0.88, 12, c, 12, T); g.cyl(0.305, 0.305, 0.05, 12, mulc(c, 0.8), 12, TM(x, 0.27, z)); g.cyl(0.305, 0.305, 0.05, 12, mulc(c, 0.8), 12, TM(x, 0.58, z));
    g.cyl(0.25, 0.25, 0.012, 12, mulc(c, 0.7), 0, TM(x, 0.875, z));
    solid(x - 0.27, z - 0.27, x + 0.27, z + 0.27, 0.88, 2);
  }
  function sandbags(x0, z0, x1, z1, layers) {
    layers = layers || 3; const alongX = abs(x1 - x0) > abs(z1 - z0), len = alongX ? abs(x1 - x0) : abs(z1 - z0), n = max(1, Math.round(len / 0.62));
    for (let l = 0; l < layers; l++) {
      const cnt = l % 2 ? n - 1 : n;
      for (let i = 0; i < cnt; i++) {
        const t = (i + 0.5 + (l % 2 ? 0.5 : 0)) / n, x = lerp(x0, x1, t), z = lerp(z0, z1, t);
        g.sph(0.34, 0.165, 0.215, 8, 5, TH.snow && l === layers - 1 ? K.snow : Math.random() < 0.5 ? TH.bag : TH.bagD, TH.snow && l === layers - 1 ? 14 : 8, TM(x + rnd(-0.02, 0.02), 0.16 + l * 0.29, z + rnd(-0.02, 0.02), (alongX ? 0 : PI / 2) + rnd(-0.08, 0.08)));
      }
    }
    const hh = 0.06 + layers * 0.29;
    if (alongX) solid(min(x0, x1), z0 - 0.24, max(x0, x1), z0 + 0.24, hh, 3); else solid(x0 - 0.24, min(z0, z1), x0 + 0.24, max(z0, z1), hh, 3);
  }
  function jersey(x, z, ax) {
    const L = 2.4, T = TM(x, 0, z, ax === 'x' ? PI / 2 : 0);
    g.box(0.62, 0.3, L, K.concD, 7, T, 0, 0.15, 0); g.box(0.3, 0.58, L, K.conc, 7, T, 0, 0.59, 0);
    g.box(0.47, 0.04, L, K.concD, 0, T, 0, 0.31, 0);
    g.box(0.32, 0.1, L * 0.3, K.yellow, 0, T, 0, 0.7, -L * 0.3); g.box(0.32, 0.1, L * 0.3, K.yellow, 0, T, 0, 0.7, L * 0.3);
    if (ax === 'x') solid(x - L / 2, z - 0.31, x + L / 2, z + 0.31, 0.88, 0); else solid(x - 0.31, z - L / 2, x + 0.31, z + L / 2, 0.88, 0);
  }
  function lowWall(x0, z0, x1, z1, h) {
    h = h || 1.05; g.bx(x0, 0, z0, x1, h, z1, TH.wall, TH.wallM, 8); g.bx(x0 - 0.04, h, z0 - 0.04, x1 + 0.04, h + 0.07, z1 + 0.04, TH.snow ? K.snow : TH.cap, TH.snow ? 14 : 0); solid(x0, z0, x1, z1, h + 0.07, 0);
  }
  function plyCover(x0, z0, x1, z1) { // low plywood barricade
    g.bx(x0, 0, z0, x1, 1.08, z1, K.ply, 2, 8); g.bx(x0 - 0.03, 1.08, z0 - 0.03, x1 + 0.03, 1.13, z1 + 0.03, K.plyD, 0); solid(x0, z0, x1, z1, 1.13, 1);
  }
  function table(x, z, w, d) {
    g.bx(x - w / 2, 0.74, z - d / 2, x + w / 2, 0.8, z + d / 2, K.plyD, 10);
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.bx(x + a * (w / 2 - 0.08) - 0.04, 0, z + b * (d / 2 - 0.08) - 0.04, x + a * (w / 2 - 0.08) + 0.04, 0.74, z + b * (d / 2 - 0.08) + 0.04, K.metalD, 0);
    solid(x - w / 2, z - d / 2, x + w / 2, z + d / 2, 0.8, 1);
  }
  function target(x, z, yaw) {
    // painted range target
    const T = TM(x, 0, z, yaw);
    g.box(0.07, 1.1, 0.07, K.post, 0, T, 0, 0.55, 0); g.box(0.6, 0.05, 0.4, K.post, 0, T, 0, 0.03, 0);
    g.box(0.52, 0.8, 0.03, hex(0xd9d4c3), 0, T, 0, 1.38, 0);
    g.box(0.3, 0.42, 0.012, hex(0x30343a), 0, T, 0, 1.3, 0.02);
    g.box(0.2, 0.2, 0.014, hex(0x30343a), 0, T, 0, 1.62, 0.02); g.box(0.09, 0.09, 0.016, K.red, 0, T, 0, 1.32, 0.03);
  }
  function tires(x, z, n) {
    for (let i = 0; i < n; i++) { g.cyl(0.36, 0.36, 0.2, 12, K.tire, 0, TM(x + rnd(-0.04, 0.04), i * 0.22, z + rnd(-0.04, 0.04))); g.cyl(0.19, 0.19, 0.012, 10, hex(0x101113), 0, TM(x, i * 0.22 + 0.2, z)); }
    solid(x - 0.34, z - 0.34, x + 0.34, z + 0.34, n * 0.22, 3);
  }
  function pallet(x, z, yaw, cargo) {
    const T = TM(x, 0, z, yaw || 0);
    g.box(1.2, 0.03, 1.0, K.crate, 10, T, 0, 0.13, 0); for (const a of [-0.5, 0, 0.5]) g.box(0.1, 0.1, 1.0, K.crateD, 0, T, a, 0.06, 0);
    if (cargo) { g.box(1.1, cargo, 0.92, cargo > 0.8 ? hex(0x7b8a6a) : K.bag, 8, T, 0, 0.145 + cargo / 2, 0); g.box(1.12, 0.04, 0.2, K.metalD, 0, T, 0, 0.145 + cargo * 0.6, 0); }
    solid(x - 0.6, z - 0.55, x + 0.6, z + 0.55, 0.15 + (cargo || 0), 1);
  }
  function lamp(x, z, yaw) {
    const T = TM(x, 0, z, yaw || 0);
    g.cyl(0.1, 0.07, 5.2, 8, K.metalD, 12, T); g.box(0.3, 0.3, 0.3, K.concD, 0, T, 0, 0.15, 0);
    g.box(0.08, 0.08, 1.3, K.metalD, 0, T, 0, 5.2, 0.6); g.box(0.34, 0.1, 0.6, K.metalD, 0, T, 0, 5.16, 1.2); g.box(0.26, 0.03, 0.5, hex(0xfff3c4), 9, T, 0, 5.1, 1.2);
    solid(x - 0.14, z - 0.14, x + 0.14, z + 0.14, 5, 2);
  }
  function tree(x, z, s, col) {
    s = s || 1; g.cyl(0.24 * s, 0.16 * s, 2.4 * s, 7, K.trunk, 0, TM(x, 0, z));
    const c1 = col || K.leaf;
    g.sph(1.7 * s, 1.35 * s, 1.7 * s, 9, 6, c1, 0, TM(x, 3.2 * s, z, rnd(TAU)));
    g.sph(1.2 * s, 1.0 * s, 1.2 * s, 8, 5, K.leaf2, 0, TM(x + 0.8 * s, 4.0 * s, z + 0.3 * s, rnd(TAU)));
    g.sph(1.1 * s, 0.9 * s, 1.1 * s, 8, 5, K.leaf3, 0, TM(x - 0.9 * s, 3.5 * s, z - 0.5 * s, rnd(TAU)));
  }
  function bush(x, z, s) { g.sph(0.9 * s, 0.6 * s, 0.9 * s, 8, 5, K.leaf3, 0, TM(x, 0.45 * s, z)); g.sph(0.6 * s, 0.45 * s, 0.6 * s, 7, 4, K.leaf2, 0, TM(x + 0.6 * s, 0.35 * s, z + 0.2 * s)); }
  function container(x0, z0, x1, z1, c, top) {
    const hh = 2.6, alongX = (x1 - x0) > (z1 - z0), cd = mulc(c, 0.72);
    const one = (y, c, cd) => {
      g.bx(x0, y, z0, x1, y + hh, z1, c, 6, y ? 0 : 8);
      for (const a of [x0, x1]) for (const b of [z0, z1]) g.bx(a - 0.07, y, b - 0.07, a + 0.07, y + hh + 0.02, b + 0.07, cd, 0);
      g.bx(x0 - 0.03, y + hh - 0.14, z0 - 0.03, x1 + 0.03, y + hh + 0.01, z1 + 0.03, cd, 0);
      g.bx(x0 - 0.03, y, z0 - 0.03, x1 + 0.03, y + 0.14, z1 + 0.03, cd, 0);
      // doors on the +end
      if (alongX) { g.bx(x1, y + 0.16, z0 + 0.1, x1 + 0.04, y + hh - 0.16, z1 - 0.1, mulc(c, 0.9), 0); for (const t of [0.3, 0.45, 0.55, 0.7]) g.bx(x1 + 0.04, y + 0.2, lerp(z0, z1, t) - 0.02, x1 + 0.08, y + hh - 0.2, lerp(z0, z1, t) + 0.02, K.steel, 12); }
      else { g.bx(x0 + 0.1, y + 0.16, z1, x1 - 0.1, y + hh - 0.16, z1 + 0.04, mulc(c, 0.9), 0); for (const t of [0.3, 0.45, 0.55, 0.7]) g.bx(lerp(x0, x1, t) - 0.02, y + 0.2, z1 + 0.04, lerp(x0, x1, t) + 0.02, y + hh - 0.2, z1 + 0.08, K.steel, 12); }
    };
    one(0, c, cd); if (top) one(hh, top, mulc(top, 0.72)); if (TH.snow) g.bx(x0 + 0.04, (top ? 2 : 1) * hh, z0 + 0.04, x1 - 0.04, (top ? 2 : 1) * hh + 0.09, z1 - 0.04, K.snow, 14);
    solid(x0, z0, x1, z1, top ? hh * 2 : hh, 2);
  }
  function wheel(T, x, y, z, r, w) { g.cyl(r, r, w, 12, K.tire, 0, m4mul(m4(), T, TM(x - w / 2, y, z, 0, 0, -PI / 2))); g.cyl(r * 0.55, r * 0.55, w + 0.02, 10, K.steel, 12, m4mul(m4(), T, TM(x - w / 2 - 0.01, y, z, 0, 0, -PI / 2))); }
  function vehSolid(x, z, yaw, w, l, h) { const sw = abs(sin(yaw)) > 0.5; const hx = (sw ? l : w) / 2, hz = (sw ? w : l) / 2; solid(x - hx, z - hz, x + hx, z + hz, h, 2); }
  function van(x, z, yaw) {
    const T = TM(x, 0, z, yaw), body = hex(0x5d7896), dark = hex(0x2c3440);
    g.box(2.0, 1.62, 3.5, body, 12, T, 0, 1.26, -0.65); g.box(2.0, 1.3, 1.3, body, 12, T, 0, 1.1, 1.75);
    g.box(1.9, 0.45, 0.4, body, 12, T, 0, 0.72, 2.5); g.box(2.04, 0.2, 5.1, dark, 0, T, 0, 0.42, 0);
    g.box(1.84, 0.62, 0.05, K.glass, 12, T, 0, 1.42, 2.41); g.box(2.03, 0.5, 0.9, K.glass, 12, T, 0, 1.42, 1.8);
    g.box(2.03, 0.22, 3.4, K.white, 0, T, 0, 1.0, -0.65); g.box(2.03, 0.08, 3.4, hex(0x2f4f7a), 0, T, 0, 0.82, -0.65);
    g.box(1.2, 0.1, 0.3, dark, 0, T, 0, 2.12, 0.4); g.box(0.5, 0.12, 0.26, hex(0x3d7bff), 9, T, -0.33, 2.2, 0.4); g.box(0.5, 0.12, 0.26, hex(0xff4035), 9, T, 0.33, 2.2, 0.4);
    g.box(0.34, 0.16, 0.04, hex(0xfff6d8), 9, T, -0.7, 0.78, 2.71); g.box(0.34, 0.16, 0.04, hex(0xfff6d8), 9, T, 0.7, 0.78, 2.71);
    g.box(0.24, 0.3, 0.04, hex(0xd0281e), 9, T, -0.8, 1.0, -2.41); g.box(0.24, 0.3, 0.04, hex(0xd0281e), 9, T, 0.8, 1.0, -2.41);
    g.box(0.9, 1.3, 0.03, mulc(body, 0.85), 0, T, -0.46, 1.2, -2.41); g.box(0.9, 1.3, 0.03, mulc(body, 0.85), 0, T, 0.46, 1.2, -2.41);
    for (const a of [-1, 1]) for (const b of [-1.55, 1.6]) wheel(T, a * 0.9, 0.4, b, 0.4, 0.28);
    vehSolid(x, z, yaw, 2.1, 5.2, 2.1);
  }
  function truck(x, z, yaw, c) {
    const T = TM(x, 0, z, yaw), dark = hex(0x2c3138);
    g.box(2.3, 1.7, 1.9, c, 12, T, 0, 1.45, 2.6); g.box(2.2, 0.6, 0.05, K.glass, 12, T, 0, 1.8, 3.56); g.box(2.32, 0.55, 1.0, K.glass, 12, T, 0, 1.8, 2.8);
    g.box(2.3, 0.3, 0.3, dark, 0, T, 0, 0.65, 3.6); g.box(2.2, 0.22, 7.2, dark, 0, T, 0, 0.72, 0);
    g.box(2.4, 0.14, 5.0, K.crateD, 10, T, 0, 0.95, -1.0);
    for (const a of [-1, 1]) g.box(0.08, 0.55, 5.0, K.post, 10, T, a * 1.16, 1.3, -1.0); g.box(2.4, 0.55, 0.08, K.post, 10, T, 0, 1.3, -3.46); g.box(2.4, 0.7, 0.08, K.post, 10, T, 0, 1.37, 1.5);
    g.box(1.1, 1.0, 1.1, K.crate, 10, T, -0.5, 1.52, -2.4); g.box(0.9, 0.8, 0.9, K.crate, 10, T, 0.55, 1.42, -1.2); g.box(1.9, 0.75, 1.3, hex(0x6d7b5c), 8, T, 0, 1.4, 0.4);
    g.box(0.3, 0.16, 0.04, hex(0xfff6d8), 9, T, -0.85, 0.95, 3.57); g.box(0.3, 0.16, 0.04, hex(0xfff6d8), 9, T, 0.85, 0.95, 3.57);
    for (const a of [-1, 1]) for (const b of [-2.6, -1.5, 2.6]) wheel(T, a * 1.02, 0.48, b, 0.48, 0.34);
    vehSolid(x, z, yaw, 2.5, 7.4, 2.3);
  }
  function suv(x, z, yaw, c) {
    const T = TM(x, 0, z, yaw), dark = hex(0x24282e);
    g.box(1.9, 0.75, 4.5, c, 12, T, 0, 0.82, 0); g.box(1.74, 0.62, 2.5, c, 12, T, 0, 1.5, -0.35);
    g.box(1.76, 0.44, 2.3, K.glass, 12, T, 0, 1.5, -0.35); g.box(1.6, 0.46, 2.54, K.glass, 12, T, 0, 1.5, -0.35);
    g.box(1.94, 0.18, 4.6, dark, 0, T, 0, 0.42, 0);
    g.box(0.34, 0.14, 0.04, hex(0xfff6d8), 9, T, -0.66, 0.92, 2.26); g.box(0.34, 0.14, 0.04, hex(0xfff6d8), 9, T, 0.66, 0.92, 2.26);
    g.box(0.3, 0.14, 0.04, hex(0xd0281e), 9, T, -0.7, 0.95, -2.26); g.box(0.3, 0.14, 0.04, hex(0xd0281e), 9, T, 0.7, 0.95, -2.26);
    for (const a of [-1, 1]) for (const b of [-1.4, 1.45]) wheel(T, a * 0.86, 0.38, b, 0.38, 0.26);
    vehSolid(x, z, yaw, 2.0, 4.6, 1.8);
  }
  function forklift(x, z, yaw) {
    const T = TM(x, 0, z, yaw), dark = hex(0x2a2d33);
    g.box(1.1, 0.7, 1.7, K.yellow, 12, T, 0, 0.65, -0.2); g.box(1.0, 0.5, 0.5, dark, 0, T, 0, 0.75, -1.1);
    for (const a of [-0.48, 0.48]) for (const b of [-0.9, 0.45]) g.box(0.06, 1.25, 0.06, dark, 0, T, a, 1.6, b); g.box(1.06, 0.06, 1.45, dark, 0, T, 0, 2.24, -0.22);
    g.box(0.5, 0.1, 0.5, dark, 0, T, 0, 1.05, -0.3); g.box(0.5, 0.5, 0.1, dark, 0, T, 0, 1.3, -0.55);
    for (const a of [-0.3, 0.3]) { g.box(0.1, 2.6, 0.12, dark, 12, T, a, 1.4, 0.72); g.box(0.12, 0.06, 1.1, K.steel, 12, T, a, 0.16, 1.3); }
    g.box(0.8, 0.5, 0.06, dark, 0, T, 0, 0.5, 0.8);
    for (const a of [-1, 1]) { wheel(T, a * 0.55, 0.3, 0.42, 0.3, 0.2); wheel(T, a * 0.5, 0.24, -0.85, 0.24, 0.18); }
    vehSolid(x, z, yaw, 1.3, 2.6, 2.2);
  }
  function tower(x, z) {
    for (const a of [-1, 1]) for (const b of [-1, 1]) g.bx(x + a * 1.1 - 0.1, 0, z + b * 1.1 - 0.1, x + a * 1.1 + 0.1, 5.6, z + b * 1.1 + 0.1, K.post, 0);
    for (const y of [1.4, 2.8]) { g.bx(x - 1.2, y, z + 1.06, x + 1.2, y + 0.1, z + 1.14, K.post, 0); g.bx(x - 1.2, y, z - 1.14, x + 1.2, y + 0.1, z - 1.06, K.post, 0); g.bx(x - 1.14, y, z - 1.2, x - 1.06, y + 0.1, z + 1.2, K.post, 0); g.bx(x + 1.06, y, z - 1.2, x + 1.14, y + 0.1, z + 1.2, K.post, 0); }
    g.bx(x - 1.5, 4.2, z - 1.5, x + 1.5, 4.36, z + 1.5, K.plyD, 10);
    g.bx(x - 1.5, 4.36, z + 1.42, x + 1.5, 5.3, z + 1.5, K.ply, 2); g.bx(x - 1.5, 4.36, z - 1.5, x + 1.5, 5.3, z - 1.42, K.ply, 2);
    g.bx(x - 1.5, 4.36, z - 1.5, x - 1.42, 5.3, z + 1.5, K.ply, 2); g.bx(x + 1.42, 4.36, z - 1.5, x + 1.5, 5.3, z + 1.5, K.ply, 2);
    g.loft([[0, 2.5, 2.5], [1.1, 0.06, 0.06]], 4, hex(0x556b52), 6, TM(x, 5.6, z, PI / 4), 1, 1);
    for (let i = 0; i < 9; i++) g.bx(x - 0.3, 0.4 + i * 0.44, z + 1.22, x + 0.3, 0.45 + i * 0.44, z + 1.27, K.post, 0);
    solid(x - 1.25, z - 1.25, x + 1.25, z + 1.25, 5, 1);
  }
  function fuelTank(x0, z, len) {
    const r = 1.25, y = 1.75, c = hex(0xd9dbd6);
    g.cyl(r, r, len, 18, c, 12, TM(x0, y, z, 0, 0, -PI / 2), 0, 0);
    g.sph(0.4, r, r, 18, 8, c, 12, TM(x0, y, z)); g.sph(0.4, r, r, 18, 8, c, 12, TM(x0 + len, y, z));
    g.cyl(r + 0.015, r + 0.015, 0.5, 18, K.red, 12, TM(x0 + len * 0.5 - 0.25, y, z, 0, 0, -PI / 2), 0, 0);
    for (const t of [0.2, 0.8]) g.bx(x0 + len * t - 0.2, 0, z - 1.0, x0 + len * t + 0.2, 1.1, z + 1.0, K.concD, 7);
    g.cyl(0.25, 0.25, 0.3, 10, K.steel, 12, TM(x0 + len * 0.3, y + r - 0.05, z)); g.cyl(0.06, 0.06, 1.4, 8, K.steel, 12, TM(x0 + len * 0.7, y + r - 0.1, z));
    solid(x0 - 0.35, z - r, x0 + len + 0.35, z + r, 3, 2);
  }
  function bldg(x0, z0, x1, z1, h, c, roof) {
    g.bx(x0, 0, z0, x1, h, z1, c, TH.wallM === 15 ? 15 : 7, 8); g.bx(x0 - 0.15, h, z0 - 0.15, x1 + 0.15, h + 0.3, z1 + 0.15, roof || K.concD, 0);
    g.bx(x0 + 0.2, h + 0.3, z0 + 0.2, x1 - 0.2, h + 0.32, z1 - 0.2, TH.snow ? K.snow : mulc(roof || K.concD, 0.8), TH.snow ? 14 : 3);
    solid(x0, z0, x1, z1, h + 0.3, 0);
  }


  // ================= new helpers (v2) =================
  function tri(ax, ay, az, bx, by, bz, cx, cy, cz, col, m) {
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az; let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = 1 / (hyp(nx, ny, nz) || 1); nx *= l; ny *= l; nz *= l;
    let i = g.push(ax, ay, az, nx, ny, nz, col, m || 0); g.push(bx, by, bz, nx, ny, nz, col, m || 0); g.push(cx, cy, cz, nx, ny, nz, col, m || 0); g.i.push(i, i + 1, i + 2);
    i = g.push(ax, ay, az, -nx, -ny, -nz, col, m || 0); g.push(cx, cy, cz, -nx, -ny, -nz, col, m || 0); g.push(bx, by, bz, -nx, -ny, -nz, col, m || 0); g.i.push(i, i + 1, i + 2);
  }
  function beam(ax, ay, az, bx, by, bz, w, col, m) { const T = m4seg(m4(), ax, ay, az, bx, by, bz, 0, 0, 1), L = hyp(bx - ax, by - ay, bz - az); g.box(w, L, w, col, m || 0, T, 0, L / 2, 0); }
  // box on a face of a rect: side 0 = z0 (north), 1 = z1 (south), 2 = x0 (west), 3 = x1 (east)
  function face(side, x0, z0, x1, z1, t, w, y0, y1, col, m, d) {
    d = d || 0.05;
    if (side < 2) { const cx = lerp(x0, x1, t); if (side === 0) g.bx(cx - w / 2, y0, z0 - d, cx + w / 2, y1, z0 + 0.01, col, m || 0); else g.bx(cx - w / 2, y0, z1 - 0.01, cx + w / 2, y1, z1 + d, col, m || 0); }
    else { const cz = lerp(z0, z1, t); if (side === 2) g.bx(x0 - d, y0, cz - w / 2, x0 + 0.01, y1, cz + w / 2, col, m || 0); else g.bx(x1 - 0.01, y0, cz - w / 2, x1 + d, y1, cz + w / 2, col, m || 0); }
  }
  // themed wall run with door (0) / window (1) gaps
  function wallRun(ax, c, a, b, gaps, o) {
    o = o || {}; const h = o.h || 2.6, th = o.th || 0.42, col = o.col || TH.wall, m = o.m === undefined ? TH.wallM : o.m, cap = o.cap || mulc(col, 0.86), k = o.k || 0;
    gaps = (gaps || []).slice().sort((p, q) => p[0] - q[0]); let s = a;
    const seg = (s, e, hh) => {
      if (e - s < 0.02) return;
      if (ax === 'x') { g.bx(s, 0, c - th / 2, e, hh, c + th / 2, col, m, 8); g.bx(s - 0.03, hh, c - th / 2 - 0.04, e + 0.03, hh + 0.1, c + th / 2 + 0.04, cap, 0); if (TH.snow) g.bx(s, hh + 0.1, c - th / 2, e, hh + 0.17, c + th / 2, K.snow, 14); solid(s, c - th / 2, e, c + th / 2, hh + 0.1, k); }
      else { g.bx(c - th / 2, 0, s, c + th / 2, hh, e, col, m, 8); g.bx(c - th / 2 - 0.04, hh, s - 0.03, c + th / 2 + 0.04, hh + 0.1, e + 0.03, cap, 0); if (TH.snow) g.bx(c - th / 2, hh + 0.1, s, c + th / 2, hh + 0.17, e, K.snow, 14); solid(c - th / 2, s, c + th / 2, e, hh + 0.1, k); }
    };
    for (const gp of gaps) { seg(s, gp[0], h); if (gp[2] === 1) seg(gp[0], gp[1], 1.0); s = gp[1]; }
    seg(s, b, h);
    if (o.pillars) { const n = Math.round((b - a) / o.pillars); for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n, px = ax === 'x' ? t : c, pz = ax === 'x' ? c : t; if (gaps.some(gp => t > gp[0] - 0.3 && t < gp[1] + 0.3)) continue; g.bx(px - th * 0.8, 0, pz - th * 0.8, px + th * 0.8, h + 0.35, pz + th * 0.8, mulc(col, 0.93), m, 8); g.bx(px - th, h + 0.35, pz - th, px + th, h + 0.45, pz + th, cap, 0); } }
  }
  // solid block house: o = {col, m, roof, door:[side,t,col], win:n, floors, awn:[side,t,c1,c2], tank, ac}
  function house(x0, z0, x1, z1, h, o) {
    o = o || {}; const col = o.col || TH.wall, m = o.m === undefined ? TH.wallM : o.m, rc = o.roof || mulc(col, 0.8), dk = hex(0x2b2622), fr = mulc(col, 1.12);
    g.bx(x0, 0, z0, x1, h, z1, col, m, 8);
    g.bx(x0 - 0.06, h, z0 - 0.06, x1 + 0.06, h + 0.5, z0 + 0.22, rc, 0); g.bx(x0 - 0.06, h, z1 - 0.22, x1 + 0.06, h + 0.5, z1 + 0.06, rc, 0);
    g.bx(x0 - 0.06, h, z0 + 0.22, x0 + 0.22, h + 0.5, z1 - 0.22, rc, 0); g.bx(x1 - 0.22, h, z0 + 0.22, x1 + 0.06, h + 0.5, z1 - 0.22, rc, 0);
    if (TH.snow) g.bx(x0 + 0.22, h, z0 + 0.22, x1 - 0.22, h + 0.14, z1 - 0.22, K.snow, 14);
    g.bx(x0 - 0.04, 0, z0 - 0.04, x1 + 0.04, 0.32, z1 + 0.04, mulc(col, 0.8), m);
    const floors = o.floors || (h > 4.5 ? 2 : 1), wn = o.win === undefined ? 2 : o.win;
    for (let side = 0; side < 4; side++) {
      const len = side < 2 ? x1 - x0 : z1 - z0, n = max(1, Math.round(len / 4 * wn / 2));
      for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n; if (o.door && o.door[0] === side && f === 0 && abs(t - o.door[1]) < 1.6 / len) continue;
        const y0 = 1.25 + f * 2.9; face(side, x0, z0, x1, z1, t, 1.0, y0 - 0.1, y0 + 1.15, fr, 0, 0.06); face(side, x0, z0, x1, z1, t, 0.82, y0, y0 + 1.0, dk, 0, 0.08);
        if (o.shutter) face(side, x0, z0, x1, z1, t + 0.42 / len, 0.4, y0, y0 + 1.0, o.shutter, 0, 0.1);
      }
    }
    if (o.door) { const [sd, t, dc] = o.door; face(sd, x0, z0, x1, z1, t, 1.5, 0, 2.45, fr, 0, 0.07); face(sd, x0, z0, x1, z1, t, 1.2, 0.02, 2.3, dc || hex(0x2f6f86), 0, 0.1); face(sd, x0, z0, x1, z1, t, 1.7, 0, 0.16, mulc(col, 0.75), 0, 0.4); }
    if (o.awn) { const [sd, t, c1, c2] = o.awn, w = 3.2; let ax, az, yw; if (sd < 2) { ax = lerp(x0, x1, t); az = sd ? z1 : z0; yw = sd ? 0 : PI; } else { az = lerp(z0, z1, t); ax = sd === 3 ? x1 : x0; yw = sd === 3 ? PI / 2 : -PI / 2; } awning(ax, az, w, 1.6, yw, c1, c2, 2.5, true); }
    if (o.tank) { g.cyl(0.55, 0.55, 1.1, 10, hex(0x3d4a5a), 12, TM(x1 - 1.2, h, z0 + 1.2)); g.bx(x1 - 1.7, h, z0 + 0.7, x1 - 0.7, h + 0.1, z0 + 1.7, K.metalD, 0); }
    if (o.ac) g.bx(x0 + 1, h, z1 - 1.6, x0 + 2, h + 0.7, z1 - 0.7, hex(0xd5d6d2), 12);
    if (o.dish) { g.cyl(0.04, 0.04, 0.6, 6, K.metalD, 0, TM(x0 + 1.2, h, z0 + 1.2)); g.sph(0.45, 0.12, 0.45, 10, 4, hex(0xe8e8e4), 12, TM(x0 + 1.2, h + 0.75, z0 + 1.2, 0.6, 0.9, 0)); }
    solid(x0, z0, x1, z1, h + 0.5, 0);
  }
  // striped cloth canopy (front edge at local +z), on two poles
  function awning(x, z, w, d, yaw, c1, c2, h, wall) {
    const T = TM(x, h, z, yaw), n = max(3, Math.round(w / 0.55)), sw = w / n, a = 0.28;
    for (let i = 0; i < n; i++) g.box(sw + 0.005, 0.04, d / cos(a), i % 2 ? c2 : c1, 11, m4mul(m4(), T, TM(-w / 2 + sw * (i + 0.5), d * Math.tan(a) / 2 * -1 + 0.02, d / 2, 0, a, 0)));
    for (let i = 0; i < n; i++) g.box(sw + 0.005, 0.22, 0.03, i % 2 ? c2 : c1, 11, m4mul(m4(), T, TM(-w / 2 + sw * (i + 0.5), -d * Math.tan(a) - 0.1, d, 0, 0, 0)));
    for (const sx of [-1, 1]) { g.box(0.07, h, 0.07, hex(0x5a4632), 0, T, sx * (w / 2 - 0.05), -h / 2, d - 0.04); if (!wall) g.box(0.07, h, 0.07, hex(0x5a4632), 0, T, sx * (w / 2 - 0.05), -h / 2 + 0.2, 0.04); }
    const p = m4pt(T, -(w / 2 - 0.05), 0, d - 0.04, [0, 0, 0]), q = m4pt(T, w / 2 - 0.05, 0, d - 0.04, [0, 0, 0]);
    solid(p[0] - 0.06, p[2] - 0.06, p[0] + 0.06, p[2] + 0.06, 2.2, 2); solid(q[0] - 0.06, q[2] - 0.06, q[0] + 0.06, q[2] + 0.06, 2.2, 2);
  }
  function stall(x, z, yaw, c1, c2) {
    const T = TM(x, 0, z, yaw), wood = hex(0x8a6340), goods = [hex(0xe8862a), hex(0xd23c2c), hex(0x7fb540), hex(0xf2cf3a), hex(0x8e4fa8), hex(0xe7e1cf)];
    g.box(2.2, 0.08, 1.0, wood, 10, T, 0, 0.85, 0); for (const a of [-1, 1]) for (const b of [-1, 1]) g.box(0.08, 0.85, 0.08, wood, 0, T, a * 1.02, 0.42, b * 0.42);
    for (let i = 0; i < 4; i++) { const cx = -0.78 + i * 0.52, gc = goods[(((i + floor(x)) % goods.length) + goods.length) % goods.length]; g.box(0.46, 0.14, 0.7, hex(0x9c7b52), 10, T, cx, 0.96, 0); for (let j = 0; j < 5; j++) g.sph(0.07, 0.07, 0.07, 6, 4, gc, 0, m4mul(m4(), T, TM(cx + rnd(-0.15, 0.15), 1.07, rnd(-0.25, 0.25)))); }
    g.cyl(0.18, 0.15, 0.4, 8, hex(0xb5693a), 0, m4mul(m4(), T, TM(1.3, 0, 0.3))); g.cyl(0.22, 0.2, 0.5, 8, hex(0xc9a36a), 10, m4mul(m4(), T, TM(-1.35, 0, -0.2)));
    { const p = m4pt(T, 0, 0, -0.75, [0, 0, 0]); awning(p[0], p[2], 2.6, 1.5, yaw, c1, c2, 2.4, false); }
    const p = m4pt(T, 0, 0, 0, [0, 0, 0]); const r = 1.15 * (abs(cos(yaw)) + abs(sin(yaw)) * 0.5); solid(p[0] - (abs(sin(yaw)) > 0.5 ? 0.55 : 1.15), p[2] - (abs(sin(yaw)) > 0.5 ? 1.15 : 0.55), p[0] + (abs(sin(yaw)) > 0.5 ? 0.55 : 1.15), p[2] + (abs(sin(yaw)) > 0.5 ? 1.15 : 0.55), 1.0, 1);
  }
  function palm(x, z, s, lean) {
    s = s || 1; lean = lean === undefined ? rnd(TAU) : lean; let px = x, py = 0, pz = z; const dx = sin(lean), dz = cos(lean);
    for (let i = 0; i < 7; i++) { const k = i / 7, nx = px + dx * (0.08 + k * 0.16) * s, ny = py + 0.85 * s, nz = pz + dz * (0.08 + k * 0.16) * s; beam(px, py, pz, nx, ny, nz, (0.3 - k * 0.1) * s, i % 2 ? hex(0x7b5a3c) : hex(0x6a4c32), 0); px = nx; py = ny; pz = nz; }
    const fc = [hex(0x4f8f3a), hex(0x5ea145), hex(0x3f7a33)];
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * TAU + rnd(-0.2, 0.2), ca = sin(a), sa = cos(a), L = rnd(2.2, 2.8) * s, mx = px + ca * L * 0.5, mz = pz + sa * L * 0.5, my = py + 0.35 * s, ex = px + ca * L, ez = pz + sa * L, ey = py - rnd(0.6, 1.1) * s;
      const T1 = m4seg(m4(), px, py, pz, mx, my, mz, 0, 1, 0), T2 = m4seg(m4(), mx, my, mz, ex, ey, ez, 0, 1, 0);
      g.box(0.62 * s, hyp(mx - px, my - py, mz - pz), 0.04, fc[i % 3], 11, T1, 0, hyp(mx - px, my - py, mz - pz) / 2, 0);
      g.box(0.5 * s, hyp(ex - mx, ey - my, ez - mz), 0.04, fc[(i + 1) % 3], 11, T2, 0, hyp(ex - mx, ey - my, ez - mz) / 2, 0);
    }
    for (let i = 0; i < 3; i++) g.sph(0.13 * s, 0.15 * s, 0.13 * s, 6, 4, hex(0x5b3f22), 0, TM(px + cos(i * 2.1) * 0.22 * s, py - 0.15 * s, pz + sin(i * 2.1) * 0.22 * s));
    solid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 3, 2);
  }
  function pine(x, z, s, solidIt) {
    s = s || 1; const dk = [hex(0x2c5236), hex(0x35603f), hex(0x2a4a33)][floor(rnd(3))];
    g.cyl(0.2 * s, 0.14 * s, 1.4 * s, 7, hex(0x5a4030), 0, TM(x, 0, z));
    const tiers = [[1.0, 1.7, 2.4], [2.1, 1.3, 2.1], [3.1, 0.95, 1.9]];
    for (const [y, r, hh] of tiers) {
      g.cyl(r * s, 0.04, hh * s, 9, dk, 0, TM(x, y * s, z, rnd(TAU)), 1, 0);
      if (TH.snow) { g.cyl(r * s * 0.62, 0.05, hh * s * 0.62, 9, K.snow, 14, TM(x, (y + hh * 0.4) * s, z, rnd(TAU)), 1, 0); g.cyl(r * s * 1.01, r * s * 0.86, 0.1 * s, 9, K.snow, 14, TM(x, y * s, z), 0, 1); }
    }
    if (solidIt !== false) solid(x - 0.25 * s, z - 0.25 * s, x + 0.25 * s, z + 0.25 * s, 3, 2);
  }
  function hill(x, z, s, col, snowCap) {
    const T = TM(x, -0.5, z, rnd(TAU)); g.loft([[0, s, s * 0.85], [s * 0.45, s * 0.72, s * 0.6], [s * 0.95, s * 0.32, s * 0.36], [s * 1.25, 0.03, 0.03]], 8, col, 8, T, 0, 1);
    if (snowCap) g.loft([[s * 0.78, s * 0.47, s * 0.47], [s * 0.95, s * 0.34, s * 0.38], [s * 1.26, 0.03, 0.03]], 8, K.snow, 14, T, 0, 1);
  }
  function dune(x, z, rx, ry, rz, col) { g.sph(rx, ry, rz, 14, 6, col || K.sand, 16, TM(x, -ry * 0.25, z, rnd(TAU)), 0.5, 1); }
  function snowPile(x, z, s, blk) { g.sph(1.0 * s, 0.42 * s, 0.8 * s, 10, 5, K.snow, 14, TM(x, 0, z, rnd(TAU)), 0.5, 1); if (blk) solid(x - 0.7 * s, z - 0.55 * s, x + 0.7 * s, z + 0.55 * s, 0.4 * s, 3); }
  function rock(x, z, s, col) { g.sph(s, s * 0.6, s * 0.8, 7, 4, col || hex(0x8a8378), 8, TM(x, 0, z, rnd(TAU), rnd(-0.2, 0.2), rnd(-0.2, 0.2)), 0.35, 1); }
  function bollard(x, z) { g.cyl(0.2, 0.17, 0.55, 8, hex(0x2d3036), 12, TM(x, 0, z)); g.cyl(0.26, 0.26, 0.08, 8, hex(0x2d3036), 12, TM(x, 0.55, z)); solid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 0.6, 2); }
  function shelf(x0, z0, x1, z1, lv) {
    const up = hex(0x2f5d9a), bm = hex(0xe07b28), alongX = x1 - x0 > z1 - z0, L = alongX ? x1 - x0 : z1 - z0, n = max(1, Math.round(L / 2.7));
    for (let i = 0; i <= n; i++) { const t = i / n; for (const e of [0, 1]) { const px = alongX ? lerp(x0, x1, t) : (e ? x1 : x0), pz = alongX ? (e ? z1 : z0) : lerp(z0, z1, t); g.bx(px - 0.05, 0, pz - 0.05, px + 0.05, lv * 1.35 + 0.2, pz + 0.05, up, 12); } }
    const cols = [K.crate, hex(0xb9a27a), hex(0x8a9aa8), hex(0xc9b38a), hex(0x6f8a5c)];
    for (let l = 0; l < lv; l++) {
      const y = 0.15 + l * 1.35; if (alongX) { g.bx(x0, y, z0 - 0.04, x1, y + 0.1, z0 + 0.04, bm, 12); g.bx(x0, y, z1 - 0.04, x1, y + 0.1, z1 + 0.04, bm, 12); } else { g.bx(x0 - 0.04, y, z0, x0 + 0.04, y + 0.1, z1, bm, 12); g.bx(x1 - 0.04, y, z0, x1 + 0.04, y + 0.1, z1, bm, 12); }
      for (let i = 0; i < n * 2; i++) { if (Math.random() < 0.15) continue; const t0 = (i + 0.1) / (n * 2), t1 = (i + 0.9) / (n * 2), hh = rnd(0.6, 1.1); const c = pick(cols); if (alongX) g.bx(lerp(x0, x1, t0), y + 0.1, z0 + 0.08, lerp(x0, x1, t1), y + 0.1 + hh, z1 - 0.08, c, c === K.crate ? 10 : 8); else g.bx(x0 + 0.08, y + 0.1, lerp(z0, z1, t0), x1 - 0.08, y + 0.1 + hh, lerp(z0, z1, t1), c, c === K.crate ? 10 : 8); }
    }
    solid(x0, z0, x1, z1, lv * 1.35 + 0.2, 1);
  }
  function vtank(x, z, r, h, col, stripe) {
    g.cyl(r, r, h, 20, col, 12, TM(x, 0, z), 0, 0); g.sph(r, r * 0.25, r, 20, 4, col, 12, TM(x, h, z), 0.5, 1);
    if (stripe) g.cyl(r + 0.02, r + 0.02, 0.6, 20, stripe, 12, TM(x, h * 0.72, z), 0, 0);
    for (let i = 0; i < 12; i++) g.bx(x + r + 0.02, 0.3 + i * (h - 0.6) / 12, z - 0.25, x + r + 0.08, 0.34 + i * (h - 0.6) / 12, z + 0.25, K.steel, 12);
    g.cyl(r + 0.05, r + 0.05, 0.12, 20, K.steel, 12, TM(x, h, z), 0, 0);
    solid(x - r * 0.92, z - r * 0.92, x + r * 0.92, z + r * 0.92, h, 2);
  }
  function crane(xc, zq, zl, col) {
    const w = 6.5, H = 16.5, wh = K.white, dk = K.metalD;
    for (const sx of [-1, 1]) {
      for (const zz of [zq, zl]) { g.bx(xc + sx * w - 0.45, 0.6, zz - 0.45, xc + sx * w + 0.45, H, zz + 0.45, col, 12); g.bx(xc + sx * w - 0.7, 0, zz - 1.1, xc + sx * w + 0.7, 0.6, zz + 1.1, hex(0x30343a), 12); solid(xc + sx * w - 0.6, zz - 1.1, xc + sx * w + 0.6, zz + 1.1, H, 2); }
      g.bx(xc + sx * w - 0.35, 5.2, zl, xc + sx * w + 0.35, 6.0, zq, col, 12); beam(xc + sx * w, 6, zl, xc + sx * w, H - 0.5, zq, 0.35, col, 12); beam(xc + sx * w, 6, zq, xc + sx * w, H - 0.5, zl, 0.35, col, 12);
    }
    for (const zz of [zq, zl]) g.bx(xc - w - 0.5, H - 1.2, zz - 0.5, xc + w + 0.5, H, zz + 0.5, col, 12);
    for (const sx of [-1, 1]) g.bx(xc + sx * 2.2 - 0.4, H, zl + 6, xc + sx * 2.2 + 0.4, H + 1.4, zq - 34, col, 12);
    for (let z = zq - 32; z < zl + 5; z += 3.2) g.bx(xc - 2.2, H + 1.2, z, xc + 2.2, H + 1.4, z + 0.25, col, 12);
    g.bx(xc - 3.2, H + 1.4, zl + 1, xc + 3.2, H + 4.2, zl + 8, wh, 12); g.bx(xc - 3.25, H + 3.4, zl + 1, xc + 3.25, H + 3.7, zl + 8, col, 0);
    g.bx(xc - 1.2, H - 2.2, zq - 8, xc + 1.2, H, zq - 5.5, wh, 12); g.bx(xc - 1.21, H - 1.6, zq - 8.01, xc + 1.21, H - 0.6, zq - 7.2, K.glass, 12);
    g.bx(xc - 0.04, 4, zq - 6.8, xc + 0.04, H - 2.2, zq - 6.7, dk, 0); g.bx(xc - 1.3, 3.4, zq - 7.6, xc + 1.3, 4, zq - 5.9, K.yellow, 12);
    g.bx(xc - 1.0, H + 4.2, zl + 3, xc + 1.0, H + 9, zl + 4.2, col, 12); beam(xc, H + 9, zl + 3.6, xc, H + 1.4, zq - 34, 0.12, dk, 0);
    g.bx(xc - 0.3, H + 9, zl + 3.3, xc + 0.3, H + 9.3, zl + 3.9, hex(0xff3020), 9);
  }
  function ship(x0, x1, zf, zb) {
    const hull = hex(0x24364f), red = hex(0x9b2f25), wh = hex(0xe9e8e2), H = 7;
    g.bx(x0, -1.2, zb, x1, H, zf, hull, 12); g.bx(x0 - 0.02, -1.2, zb - 0.02, x1 + 0.02, 0.3, zf + 0.02, red, 0); g.bx(x0, H, zb, x1, H + 0.6, zb + 0.4, hull, 12); g.bx(x0, H, zf - 0.4, x1, H + 0.6, zf, hull, 12);
    tri(x1, -1.2, zb, x1, -1.2, zf, x1 + 9, H + 0.6, (zb + zf) / 2, hull); tri(x1, H, zb, x1 + 9, H + 0.6, (zb + zf) / 2, x1, H, zf, hull);
    tri(x1, -1.2, zb, x1 + 9, H + 0.6, (zb + zf) / 2, x1, H, zb, hull); tri(x1, -1.2, zf, x1, H, zf, x1 + 9, H + 0.6, (zb + zf) / 2, hull);
    const bx = x0 + 4; g.bx(bx, H, zb + 1.5, bx + 9, H + 9, zf - 1.5, wh, 12); for (let i = 0; i < 4; i++) g.bx(bx - 0.02, H + 1.6 + i * 2.1, zb + 1.5, bx + 9.02, H + 2.3 + i * 2.1, zf - 1.5, K.glass, 12);
    g.bx(bx - 1.5, H + 8.2, zb + 0.5, bx + 10.5, H + 8.6, zf - 0.5, wh, 12); g.cyl(1.3, 1.1, 4.5, 12, red, 12, TM(bx + 4.5, H + 9, (zb + zf) / 2)); g.cyl(1.32, 1.32, 0.6, 12, hex(0x1a1a1a), 0, TM(bx + 4.5, H + 12.8, (zb + zf) / 2));
    const cc = [K.blue, K.rust, K.green, K.ochre, K.white, hex(0xc9662b), hex(0x8a8f96), hex(0x2f8f8a)];
    for (let x = bx + 12; x < x1 - 4; x += 6.4) for (let r = 0; r < 4; r++) { const st = 1 + floor(rnd(3.2)); for (let k = 0; k < st; k++) { const zz = zb + 1 + r * 2.5; g.bx(x, H + k * 2.6, zz, x + 6.06, H + (k + 1) * 2.6 - 0.04, zz + 2.44, pick(cc), 6); } }
  }
  function hut(x0, z0, x1, z1, o) {
    o = o || {}; const h = o.h || 2.7, rh = o.rh || 1.2, col = o.col || hex(0x667a5a), rc = o.roof || hex(0x4c5560), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = (z1 - z0) / 2, a = Math.atan(rh / hw), L = x1 - x0;
    g.bx(x0, 0, z0, x1, h, z1, col, o.m === undefined ? 6 : o.m, 8); g.bx(x0 - 0.05, 0, z0 - 0.05, x1 + 0.05, 0.35, z1 + 0.05, K.concD, 7);
    const sl = hw / cos(a) + 0.35;
    for (const sd of [-1, 1]) { g.box(L + 0.5, 0.14, sl, rc, 6, TM(cx, h + rh / 2 + 0.05, cz + sd * (hw / 2 + 0.08), 0, sd * a, 0)); if (TH.snow) g.box(L + 0.45, 0.1, sl * 0.94, K.snow, 14, TM(cx, h + rh / 2 + 0.16, cz + sd * (hw / 2 + 0.06), 0, sd * a, 0)); }
    for (const xx of [x0, x1]) tri(xx, h, z0, xx, h, z1, xx, h + rh, cz, mulc(col, 0.9), 0);
    const dk = hex(0x2a2f36), n = max(2, Math.round(L / 3.2));
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; if (o.door !== undefined && abs(t - o.door) < 1.3 / L) continue; for (const sd of [0, 1]) { face(sd, x0, z0, x1, z1, t, 1.0, 1.15, 2.1, hex(0xe8e6e0), 0, 0.05); face(sd, x0, z0, x1, z1, t, 0.84, 1.23, 2.02, K.glass, 12, 0.07); } }
    if (o.door !== undefined) { face(1, x0, z0, x1, z1, o.door, 1.3, 0, 2.25, hex(0xe8e6e0), 0, 0.06); face(1, x0, z0, x1, z1, o.door, 1.1, 0.02, 2.15, o.doorC || hex(0x8a3a2c), 0, 0.09); face(1, x0, z0, x1, z1, o.door, 1.8, 0, 0.18, K.concD, 7, 0.7); g.bx(lerp(x0, x1, o.door) - 1.1, 2.4, z1, lerp(x0, x1, o.door) + 1.1, 2.48, z1 + 0.9, rc, 0); }
    if (o.sign) face(1, x0, z0, x1, z1, 0.5, 2.2, h - 0.6, h - 0.15, o.sign, 0, 0.06);
    solid(x0, z0, x1, z1, h + rh, 0);
  }
  function tent(x, z, yaw, w, l, col) {
    const T = TM(x, 0, z, yaw), h = 2.3, a = Math.atan(h / (w / 2)), sl = (w / 2) / cos(a);
    for (const sd of [-1, 1]) g.box(l, 0.06, sl, col, 11, m4mul(m4(), T, TM(0, h / 2, sd * w / 4, 0, sd * a, 0)));
    for (const e of [-1, 1]) { const p0 = m4pt(T, e * l / 2, 0, -w / 2, [0, 0, 0]), p1 = m4pt(T, e * l / 2, 0, w / 2, [0, 0, 0]), p2 = m4pt(T, e * l / 2, h, 0, [0, 0, 0]); tri(p0[0], 0, p0[2], p1[0], 0, p1[2], p2[0], h, p2[2], mulc(col, 0.88), 11); }
    const s_ = abs(sin(yaw)) > 0.5, hx = (s_ ? w : l) / 2, hz = (s_ ? l : w) / 2; solid(x - hx, z - hz, x + hx, z + hz, h, 1);
  }
  function heli(x, z, yaw, col) {
    const T = TM(x, 0, z, yaw), dk = hex(0x23272c), c2 = mulc(col, 0.8);
    g.sph(1.25, 1.1, 2.5, 14, 8, col, 12, m4mul(m4(), T, TM(0, 1.65, 0.3))); g.sph(1.0, 0.85, 1.2, 12, 6, K.glass, 12, m4mul(m4(), T, TM(0, 1.85, 1.75)));
    g.cyl(0.32, 0.14, 5.2, 10, col, 12, m4mul(m4(), T, TM(0, 1.9, -1.6, 0, -PI / 2 - 0.06, 0)));
    g.box(0.12, 1.5, 1.0, c2, 12, T, 0, 2.6, -6.6); g.box(1.6, 0.1, 0.6, c2, 12, T, 0, 2.0, -6.2); g.cyl(0.05, 0.05, 1.6, 6, dk, 0, m4mul(m4(), T, TM(0.1, 2.6, -6.7, 0, 0, -PI / 2)));
    g.cyl(0.14, 0.14, 0.55, 8, dk, 12, m4mul(m4(), T, TM(0, 2.65, 0.2))); for (const a of [0.4, 0.4 + PI / 2]) g.box(11, 0.05, 0.32, dk, 0, m4mul(m4(), T, TM(0, 3.22, 0.2, a)));
    for (const sx of [-1, 1]) { g.cyl(0.07, 0.07, 4.2, 6, dk, 12, m4mul(m4(), T, TM(sx * 1.0, 0.12, -1.6, 0, PI / 2, 0))); for (const zz of [-0.6, 1.2]) beam(...m4pt(T, sx * 1.0, 0.12, zz, [0, 0, 0]), ...m4pt(T, sx * 0.7, 0.75, zz, [0, 0, 0]), 0.07, dk, 0); }
    g.bx(x - 0.02, 0, z - 0.02, x + 0.02, 0.01, z + 0.02, dk, 0);
    vehSolid(x, z, yaw, 2.6, 5.8, 3.2);
  }
  function tank(x, z, yaw, col) {
    const T = TM(x, 0, z, yaw), dk = hex(0x25282c), c2 = mulc(col, 0.85);
    g.box(3.0, 0.75, 6.2, col, 12, T, 0, 0.95, 0); g.box(2.9, 0.5, 1.4, c2, 12, m4mul(m4(), T, TM(0, 1.05, 3.4, 0, 0.55, 0)));
    for (const sx of [-1, 1]) { g.box(0.62, 0.85, 6.6, dk, 0, T, sx * 1.55, 0.45, 0); for (let i = 0; i < 6; i++) g.cyl(0.36, 0.36, 0.66, 10, hex(0x3a3d42), 0, m4mul(m4(), T, TM(sx * 1.55 - 0.33, 0.38, -2.5 + i, 0, 0, -PI / 2))); g.box(0.75, 0.08, 6.4, c2, 12, T, sx * 1.6, 0.92, 0); }
    g.box(2.3, 0.7, 2.9, col, 12, T, 0, 1.68, -0.3); g.box(2.1, 0.5, 0.9, c2, 12, m4mul(m4(), T, TM(0, 1.62, 1.35, 0, 0.5, 0)));
    g.cyl(0.13, 0.1, 4.3, 8, dk, 12, m4mul(m4(), T, TM(0, 1.75, 1.3, 0, PI / 2 - 0.03, 0))); g.cyl(0.18, 0.18, 0.5, 8, dk, 12, m4mul(m4(), T, TM(0, 1.75, 5.4, 0, PI / 2, 0)));
    g.cyl(0.42, 0.42, 0.3, 10, c2, 12, m4mul(m4(), T, TM(0.5, 2.03, -0.6))); if (TH.snow) g.box(2.2, 0.08, 2.6, K.snow, 14, T, 0, 2.06, -0.4);
    vehSolid(x, z, yaw, 3.4, 6.6, 2.1);
  }
  function lattice(x, z, h, c1, c2) {
    const b = 1.3, t = 0.25, legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const [a, c] of legs) beam(x + a * b, 0, z + c * b, x + a * t, h, z + c * t, 0.14, c1, 12);
    for (let y = 2; y < h; y += 2.6) { const k = y / h, r = lerp(b, t, k), r2 = lerp(b, t, min(1, (y + 2.6) / h)); for (let i = 0; i < 4; i++) { const [a, c] = legs[i], [d, e] = legs[(i + 1) % 4]; beam(x + a * r, y, z + c * r, x + d * r2, min(h, y + 2.6), z + e * r2, 0.07, (floor(y / 5.2) % 2) ? c2 : c1, 12); beam(x + a * r, y, z + c * r, x + d * r, y, z + e * r, 0.07, c1, 12); } }
    g.sph(0.22, 0.22, 0.22, 8, 5, hex(0xff3020), 9, TM(x, h + 0.2, z)); g.bx(x - 0.5, h - 2.2, z + t, x + 0.5, h - 0.8, z + t + 0.12, hex(0xe8e8e4), 12);
    g.bx(x - b - 0.2, 0, z - b - 0.2, x + b + 0.2, 0.3, z + b + 0.2, K.concD, 7); solid(x - b, z - b, x + b, z + b, 3, 2);
  }
  function radome(x, z, s, col) { g.bx(x - 2.4 * s, 0, z - 2.4 * s, x + 2.4 * s, 2.6 * s, z + 2.4 * s, col || hex(0xb9bcb8), 7, 8); g.cyl(2.3 * s, 2.3 * s, 0.4 * s, 16, K.metalD, 12, TM(x, 2.6 * s, z)); g.sph(2.25 * s, 2.25 * s, 2.25 * s, 18, 9, hex(0xf2f2ee), 12, TM(x, 3.0 * s, z), 0.5, 1); solid(x - 2.4 * s, z - 2.4 * s, x + 2.4 * s, z + 2.4 * s, 5.2 * s, 0); }
  function flag(x, z, h, cols, yaw) {
    g.cyl(0.06, 0.05, h, 6, K.steel, 12, TM(x, 0, z)); g.sph(0.09, 0.09, 0.09, 6, 4, K.yellow, 12, TM(x, h, z));
    const T = TM(x, h - 0.15, z, yaw || 0), n = cols.length, fh = 1.1, fw = 1.8;
    for (let i = 0; i < 3; i++) for (let j = 0; j < n; j++) g.box(fw / 3 + 0.01, fh / n, 0.03, cols[j], 11, m4mul(m4(), T, TM(fw / 6 + i * fw / 3, -fh / n * (j + 0.5), sin(i * 1.3) * 0.12, 0, 0, 0)));
    solid(x - 0.1, z - 0.1, x + 0.1, z + 0.1, h, 2);
  }
  function helipad(x, z, r) { g.cyl(r, r, 0.04, 28, K.yellow, 0, TM(x, 0, z), 0, 1); g.cyl(r - 0.3, r - 0.3, 0.05, 28, hex(0x6d7178), 3, TM(x, 0, z), 0, 1); g.bx(x - 1.6, 0.05, z - 2, x - 1.0, 0.06, z + 2, K.white, 0); g.bx(x + 1.0, 0.05, z - 2, x + 1.6, 0.06, z + 2, K.white, 0); g.bx(x - 1.0, 0.05, z - 0.3, x + 1.0, 0.06, z + 0.3, K.white, 0); }
  function well(x, z) { g.cyl(0.95, 0.95, 0.85, 14, hex(0xb8a283), 15, TM(x, 0, z)); g.cyl(0.75, 0.75, 0.02, 14, hex(0x1d2a30), 0, TM(x, 0.8, z)); for (const sx of [-1, 1]) g.bx(x + sx * 0.85 - 0.07, 0.8, z - 0.07, x + sx * 0.85 + 0.07, 2.3, z + 0.07, hex(0x6b4a2e), 0); g.bx(x - 1.1, 2.3, z - 0.6, x + 1.1, 2.4, z + 0.6, hex(0x8a5a35), 10); g.cyl(0.06, 0.06, 1.7, 6, hex(0x6b4a2e), 0, TM(x - 0.85, 1.9, z, 0, 0, -PI / 2)); solid(x - 0.95, z - 0.95, x + 0.95, z + 0.95, 0.85, 0); }
  function domeHouse(x0, z0, x1, z1, h, col, dc) { house(x0, z0, x1, z1, h, { col, win: 1, door: [1, 0.5, hex(0x2f6f86)] }); const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, r = min(x1 - x0, z1 - z0) * 0.36; g.cyl(r * 1.05, r * 1.05, 0.6, 18, col, 15, TM(cx, h + 0.5, cz)); g.sph(r, r * 0.95, r, 18, 9, dc, 12, TM(cx, h + 1.1, cz), 0.5, 1); g.cyl(0.05, 0.02, 1.0, 6, K.yellow, 12, TM(cx, h + 1.1 + r * 0.95, cz)); }
  function carpet(x, z, w, d, yaw, c1, c2) { const T = TM(x, 0.012, z, yaw); g.box(w, 0.01, d, c1, 11, T); g.box(w * 0.8, 0.012, d * 0.75, c2, 11, T); g.box(w * 0.5, 0.014, d * 0.4, c1, 11, T); }
  function wreck(x, z, yaw) {
    const T = TM(x, 0, z, yaw), c = hex(0x3a2e28), r = hex(0x6b3a22);
    g.box(1.9, 0.6, 4.4, c, 8, T, 0, 0.55, 0); g.box(1.7, 0.55, 2.2, r, 8, m4mul(m4(), T, TM(0, 1.1, -0.4, 0, 0.05, 0.05))); g.box(1.5, 0.05, 2.0, hex(0x1d1b19), 0, T, 0, 1.4, -0.3);
    for (const a of [-1, 1]) for (const b of [-1.4, 1.4]) g.cyl(0.3, 0.3, 0.2, 8, hex(0x1a1918), 0, m4mul(m4(), T, TM(a * 0.85 - 0.1, 0.28, b, 0, 0, -PI / 2)));
    vehSolid(x, z, yaw, 2.0, 4.5, 1.4);
  }
  function technical(x, z, yaw, col) {
    const T = TM(x, 0, z, yaw), dk = hex(0x24282e);
    g.box(1.9, 0.6, 5.0, col, 12, T, 0, 0.8, 0); g.box(1.8, 0.75, 1.8, col, 12, T, 0, 1.45, 0.9); g.box(1.82, 0.5, 1.6, K.glass, 12, T, 0, 1.5, 0.95);
    g.box(1.94, 0.2, 5.1, dk, 0, T, 0, 0.42, 0); g.box(1.9, 0.45, 0.08, col, 12, T, 0, 1.3, -2.45); for (const a of [-1, 1]) g.box(0.08, 0.45, 2.4, col, 12, T, a * 0.92, 1.3, -1.25);
    g.cyl(0.07, 0.07, 1.0, 6, dk, 0, m4mul(m4(), T, TM(0, 1.1, -1.2))); g.box(0.2, 0.25, 0.8, dk, 12, T, 0, 2.2, -1.0); g.cyl(0.04, 0.04, 1.1, 6, dk, 12, m4mul(m4(), T, TM(0, 2.22, -0.6, 0, PI / 2, 0))); g.box(0.6, 0.45, 0.05, dk, 0, T, 0, 2.05, -0.75);
    for (const a of [-1, 1]) for (const b of [-1.5, 1.6]) wheel(T, a * 0.88, 0.38, b, 0.38, 0.26);
    vehSolid(x, z, yaw, 2.0, 5.0, 1.8);
  }
  function fence(ax, c, a, b, h) {
    h = h || 2.0; const n = Math.round((b - a) / 2.5), col = hex(0x7d838b);
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; if (ax === 'x') g.bx(t - 0.05, 0, c - 0.05, t + 0.05, h, c + 0.05, col, 12); else g.bx(c - 0.05, 0, t - 0.05, c + 0.05, h, t + 0.05, col, 12); }
    for (const y of [0.15, h * 0.5, h - 0.05]) { if (ax === 'x') g.bx(a, y - 0.025, c - 0.02, b, y + 0.025, c + 0.02, col, 12); else g.bx(c - 0.02, y - 0.025, a, c + 0.02, y + 0.025, b, col, 12); }
    for (let t = a; t < b; t += 0.25) { if (ax === 'x') g.bx(t - 0.007, 0.15, c - 0.006, t + 0.007, h - 0.05, c + 0.006, col, 0); else g.bx(c - 0.006, 0.15, t - 0.007, c + 0.006, h - 0.05, t + 0.007, col, 0); }
    const bx_ = ax === 'x' ? W.solid(a, c - 0.06, b, c + 0.06, h, 2) : W.solid(c - 0.06, a, c + 0.06, b, h, 2); bx_.nb = true;
  }
  function stripes(x0, z0, x1, z1, c1, c2, n) { const alongX = x1 - x0 > z1 - z0; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; if (alongX) g.quadXZ(lerp(x0, x1, t0), z0, lerp(x0, x1, t1), z1, 0.016, i % 2 ? c2 : c1, 0); else g.quadXZ(x0, lerp(z0, z1, t0), x1, lerp(z0, z1, t1), 0.016, i % 2 ? c2 : c1, 0); } }
  function barrier(x, z, yaw, len) { const T = TM(x, 0, z, yaw); g.box(0.2, 1.0, 0.2, K.metalD, 0, T, 0, 0.5, 0); const n = 6; for (let i = 0; i < n; i++) g.box(0.1, 0.1, len / n, i % 2 ? K.white : K.red, 0, T, 0, 0.95, 0.1 + len / n * (i + 0.5)); }
  return { g, solid, line, post, plyRun, concRun, crate, crates, barrel, sandbags, jersey, lowWall, plyCover, table, target, tires, pallet, lamp, tree, bush, container, wheel, vehSolid, van, truck, suv, forklift, tower, fuelTank, bldg, tri, beam, face, wallRun, house, awning, stall, palm, pine, hill, dune, snowPile, rock, bollard, shelf, vtank, crane, ship, hut, tent, heli, tank, lattice, radome, flag, helipad, well, domeHouse, carpet, wreck, technical, fence, stripes, barrier };
}

function buildWorld(id) {
  const M = MAPS[id]; W.reset(M);
  const g = new Geo(), H = makeKit(g, Object.assign({}, THEME0, M.theme || {}));
  M.build(H, g);
  if (W.mesh) R.free(W.mesh); W.mesh = R.mesh(g); W.tris = g.i.length / 3;
  W.finish();
}


// ---------- spatial hash + nav grid ----------
W.finish = function () {
  const CS = 4, nx = Math.ceil((W.X1 - W.X0) / CS) + 2, nz = Math.ceil((W.Z1 - W.Z0) / CS) + 2;
  W.cs = CS; W.cnx = nx; W.cnz = nz; W.cells = []; for (let i = 0; i < nx * nz; i++) W.cells.push([]);
  for (const b of W.boxes) {
    const i0 = max(0, floor((b.x0 - 0.7 - W.X0) / CS) + 1), i1 = min(nx - 1, floor((b.x1 + 0.7 - W.X0) / CS) + 1), j0 = max(0, floor((b.z0 - 0.7 - W.Z0) / CS) + 1), j1 = min(nz - 1, floor((b.z1 + 0.7 - W.Z0) / CS) + 1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) W.cells[j * nx + i].push(b);
  }
  W.tall = W.boxes.filter(b => b.h >= 1.5 && !b.nb);
  W.navBuild();
};
W.navBuild = function () {
  const NS = W.NS = 2, gx = (W.X1 - W.X0) * NS, gz = (W.Z1 - W.Z0) * NS; W.gx = gx; W.gz = gz;
  const bl = W.blocked = new Uint8Array(gx * gz), E = 0.3;
  const mark = b => {
    const i0 = max(0, Math.ceil((b.x0 - E - W.X0) * NS - 0.5)), i1 = min(gx - 1, floor((b.x1 + E - W.X0) * NS - 0.5)), j0 = max(0, Math.ceil((b.z0 - E - W.Z0) * NS - 0.5)), j1 = min(gz - 1, floor((b.z1 + E - W.Z0) * NS - 0.5));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) bl[j * gx + i] = 1;
  };
  for (const b of W.boxes) if (b.h > 0.3) mark(b);
  for (const b of W.dyn) if (b.alive) mark(b);
  for (let i = 0; i < gx; i++) { bl[i] = 1; bl[(gz - 1) * gx + i] = 1; } for (let j = 0; j < gz; j++) { bl[j * gx] = 1; bl[j * gx + gx - 1] = 1; }
  if (!W.ng || W.ng.length !== gx * gz) { W.ng = new Float32Array(gx * gz); W.np = new Int32Array(gx * gz); W.ns = new Uint32Array(gx * gz); W.nc = new Uint32Array(gx * gz); W.sid = 1; }
};
W.cellOf = (x, z) => clamp(floor((z - W.Z0) * W.NS), 0, W.gz - 1) * W.gx + clamp(floor((x - W.X0) * W.NS), 0, W.gx - 1);
W.isBlocked = (x, z) => x <= W.X0 || x >= W.X1 || z <= W.Z0 || z >= W.Z1 || W.blocked[floor((z - W.Z0) * W.NS) * W.gx + floor((x - W.X0) * W.NS)] === 1;
W.freeNear = function (x, z) {
  if (!W.isBlocked(x, z)) return [x, z];
  for (let r = 1; r < 12; r++) for (let a = 0; a < 8 * r; a++) { const t = a / (8 * r) * TAU, px = (floor((x + cos(t) * r * 0.5) * 2) + 0.5) / 2, pz = (floor((z + sin(t) * r * 0.5) * 2) + 0.5) / 2; if (!W.isBlocked(px, pz)) return [px, pz]; }
  return [x, z];
};
// straight walkable line on the nav grid
W.clearLine = function (ax, az, bx, bz) {
  const d = hyp(bx - ax, bz - az), n = Math.ceil(d / 0.2);
  for (let i = 1; i <= n; i++) { const t = i / n; if (W.isBlocked(ax + (bx - ax) * t, az + (bz - az) * t)) return false; }
  return true;
};
W.path = function (ax, az, bx, bz) {
  const s = W.freeNear(ax, az), e = W.freeNear(bx, bz);
  if (W.clearLine(s[0], s[1], e[0], e[1])) return [[e[0], e[1]]];
  const gx = W.gx, gz = W.gz, bl = W.blocked, G = W.ng, P = W.np, st = W.ns, cl = W.nc, id = ++W.sid, NS = W.NS;
  const si = W.cellOf(s[0], s[1]), ei = W.cellOf(e[0], e[1]), ex = ei % gx, ez = (ei / gx) | 0;
  const heap = [], hf = [];
  const pushH = (f, i) => { let k = heap.length; heap.push(i); hf.push(f); while (k > 0) { const p = (k - 1) >> 1; if (hf[p] <= f) break; heap[k] = heap[p]; hf[k] = hf[p]; k = p; } heap[k] = i; hf[k] = f; };
  const popH = () => {
    const top = heap[0], li = heap.pop(), lf = hf.pop(), n = heap.length;
    if (n) { let k = 0; for (; ;) { let c = k * 2 + 1; if (c >= n) break; if (c + 1 < n && hf[c + 1] < hf[c]) c++; if (hf[c] >= lf) break; heap[k] = heap[c]; hf[k] = hf[c]; k = c; } heap[k] = li; hf[k] = lf; }
    return top;
  };
  const hfun = i => { const dx = abs(i % gx - ex), dz = abs(((i / gx) | 0) - ez); return (max(dx, dz) + 0.414 * min(dx, dz)) * 1.001; };
  G[si] = 0; P[si] = -1; st[si] = id; pushH(hfun(si), si);
  let found = false, it = 0;
  while (heap.length && it++ < 40000) {
    const c = popH(); if (cl[c] === id) continue; cl[c] = id; if (c === ei) { found = true; break; }
    const cx = c % gx, cz = (c / gx) | 0, gc = G[c];
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dz) continue; const x = cx + dx, z = cz + dz; if (x < 0 || z < 0 || x >= gx || z >= gz) continue;
      const ni = z * gx + x; if (bl[ni] || cl[ni] === id) continue;
      if (dx && dz && (bl[cz * gx + x] || bl[z * gx + cx])) continue;
      const ng = gc + (dx && dz ? 1.414 : 1);
      if (st[ni] !== id || ng < G[ni]) { G[ni] = ng; P[ni] = c; st[ni] = id; pushH(ng + hfun(ni), ni); }
    }
  }
  if (!found) return null;
  const pts = []; let c = ei; while (c !== -1) { pts.push([(c % gx + 0.5) / NS + W.X0, (((c / gx) | 0) + 0.5) / NS + W.Z0]); c = P[c]; }
  pts.reverse(); pts[pts.length - 1] = [e[0], e[1]];
  const out = []; let i = 0, px = s[0], pz = s[1];
  while (i < pts.length - 1) {
    let j = min(pts.length - 1, i + 24);
    while (j > i + 1 && !W.clearLine(px, pz, pts[j][0], pts[j][1])) j--;
    out.push(pts[j]); px = pts[j][0]; pz = pts[j][1]; i = j;
  }
  if (!out.length) out.push(pts[pts.length - 1]);
  return out;
};
// ---------- collision / ray queries ----------
W.near = function (x, z) { const i = clamp(floor((x - W.X0) / W.cs) + 1, 0, W.cnx - 1), j = clamp(floor((z - W.Z0) / W.cs) + 1, 0, W.cnz - 1); return W.cells[j * W.cnx + i]; };
function pushOut(p, r, b) {
  const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1); let dx = p.x - cx, dz = p.z - cz; const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return false;
  if (d2 > 1e-8) { const d = sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
  else { const l = p.x - b.x0, rr = b.x1 - p.x, t = p.z - b.z0, bb = b.z1 - p.z, m = min(l, rr, t, bb); if (m === l) p.x = b.x0 - r; else if (m === rr) p.x = b.x1 + r; else if (m === t) p.z = b.z0 - r; else p.z = b.z1 + r; }
  return true;
}
W.collide = function (p, r) {
  let hit = false;
  for (let it = 0; it < 2; it++) {
    const L = W.near(p.x, p.z); for (let i = 0; i < L.length; i++) if (pushOut(p, r, L[i])) hit = true;
    for (let i = 0; i < W.dyn.length; i++) if (W.dyn[i].alive && pushOut(p, r, W.dyn[i])) hit = true;
  }
  p.x = clamp(p.x, W.X0 + 0.6, W.X1 - 0.6); p.z = clamp(p.z, W.Z0 + 0.6, W.Z1 - 0.6);
  return hit;
};
function seg2(ax, az, dx, dz, b) { // entry t in [0,1] or -1
  let t0 = 0, t1 = 1;
  if (abs(dx) < 1e-9) { if (ax < b.x0 || ax > b.x1) return -1; } else { let a = (b.x0 - ax) / dx, c = (b.x1 - ax) / dx; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) return -1; }
  if (abs(dz) < 1e-9) { if (az < b.z0 || az > b.z1) return -1; } else { let a = (b.z0 - az) / dz, c = (b.z1 - az) / dz; if (a > c) { const s = a; a = c; c = s; } if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) return -1; }
  return t0;
}
// line of sight past tall obstacles
W.los = function (ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, T = W.tall;
  const x0 = min(ax, bx), x1 = max(ax, bx), z0 = min(az, bz), z1 = max(az, bz);
  for (let i = 0; i < T.length; i++) { const b = T[i]; if (b.x1 < x0 || b.x0 > x1 || b.z1 < z0 || b.z0 > z1) continue; if (seg2(ax, az, dx, dz, b) >= 0) return false; }
  return true;
};
// is there low cover between a (target) and b (shooter), close to a?
W.lowCover = function (ax, az, bx, bz) {
  let dx = bx - ax, dz = bz - az; const d = hyp(dx, dz) || 1, k = min(1.7, d) / d; dx *= k; dz *= k;
  const L = W.near(ax, az);
  for (let i = 0; i < L.length; i++) { const b = L[i]; if (b.h >= 1.5 || b.h < 0.7 || b.nb) continue; if (seg2(ax, az, dx, dz, b) >= 0) return true; }
  return false;
};
// 3D ray vs all solids. returns hit info in W.hit (t, nx,ny,nz, box) or null
W.hit = { t: 0, nx: 0, ny: 0, nz: 0, b: null };
W.ray = function (ox, oy, oz, dx, dy, dz, maxT) {
  let best = maxT, bb = null, bn = 0; const B = W.boxes, n = B.length + W.dyn.length;
  const ex = ox + dx * maxT, ez = oz + dz * maxT, x0 = min(ox, ex), x1 = max(ox, ex), z0 = min(oz, ez), z1 = max(oz, ez);
  for (let i = 0; i < n; i++) {
    const b = i < B.length ? B[i] : W.dyn[i - B.length]; if (b.alive === false || b.nb) continue;
    if (b.x1 < x0 || b.x0 > x1 || b.z1 < z0 || b.z0 > z1) continue;
    let t0 = 0, t1 = best, ax = -1;
    if (abs(dx) < 1e-9) { if (ox < b.x0 || ox > b.x1) continue; } else { let a = (b.x0 - ox) / dx, c = (b.x1 - ox) / dx; if (a > c) { const s = a; a = c; c = s; } if (a > t0) { t0 = a; ax = 0; } if (c < t1) t1 = c; if (t0 > t1) continue; }
    if (abs(dz) < 1e-9) { if (oz < b.z0 || oz > b.z1) continue; } else { let a = (b.z0 - oz) / dz, c = (b.z1 - oz) / dz; if (a > c) { const s = a; a = c; c = s; } if (a > t0) { t0 = a; ax = 2; } if (c < t1) t1 = c; if (t0 > t1) continue; }
    if (abs(dy) < 1e-9) { if (oy < 0 || oy > b.h) continue; } else { let a = (0 - oy) / dy, c = (b.h - oy) / dy; if (a > c) { const s = a; a = c; c = s; } if (a > t0) { t0 = a; ax = 1; } if (c < t1) t1 = c; if (t0 > t1) continue; }
    if (t0 < best) { best = t0; bb = b; bn = ax; }
  }
  if (dy < -1e-9) { const tg = -oy / dy; if (tg >= 0 && tg < best) { best = tg; bb = W.ground; bn = 1; } }
  if (!bb) return null;
  const h = W.hit; h.t = best; h.b = bb; h.nx = bn === 0 ? (dx > 0 ? -1 : 1) : 0; h.ny = bn === 1 ? (dy > 0 ? -1 : 1) : 0; h.nz = bn === 2 ? (dz > 0 ? -1 : 1) : 0;
  if (bn === -1) { h.ny = 1; }
  return h;
};
W.ground = { k: 0, ground: true };
