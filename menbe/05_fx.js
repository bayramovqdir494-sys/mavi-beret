// ===== sound (synthesised) + particles, decals, lights =====
const SFX = {
  ctx: null, on: true, vol: 0.9,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = this.ctx = new C();
      this.out = c.createGain(); this.out.gain.value = this.vol; const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6;
      this.out.connect(comp); comp.connect(c.destination);
      const n = c.sampleRate, b = c.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.nb = b;
    } catch (e) { this.ctx = null; }
  },
  _dst(pan) { const c = this.ctx; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(this.out); return p; } return this.out; },
  noise(dur, f0, f1, q, gain, type, pan, delay) {
    const c = this.ctx; if (!c || !this.on || gain < 0.004) return; const t = c.currentTime + (delay || 0);
    const s = c.createBufferSource(); s.buffer = this.nb; s.loop = true; const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(max(30, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(this._dst(pan)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  },
  tone(f0, f1, dur, gain, type, pan, delay) {
    const c = this.ctx; if (!c || !this.on || gain < 0.004) return; const t = c.currentTime + (delay || 0);
    const o = c.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this._dst(pan)); o.start(t); o.stop(t + dur + 0.02);
  },
  shot(kind, v, pan) {
    if (kind === 'rifle') { this.noise(0.13, 2600, 500, 0.7, 0.55 * v, 'bandpass', pan); this.tone(190, 55, 0.09, 0.5 * v, 'triangle', pan); this.noise(0.3, 900, 200, 0.4, 0.1 * v, 'lowpass', pan, 0.02); }
    else if (kind === 'smg') { this.noise(0.08, 3400, 900, 0.9, 0.36 * v, 'bandpass', pan); this.tone(260, 90, 0.05, 0.3 * v, 'triangle', pan); }
    else if (kind === 'lmg') { this.noise(0.15, 1900, 380, 0.7, 0.5 * v, 'bandpass', pan); this.tone(150, 45, 0.11, 0.55 * v, 'triangle', pan); }
    else if (kind === 'shotgun') { this.noise(0.3, 1500, 220, 0.5, 0.85 * v, 'bandpass', pan); this.tone(130, 38, 0.2, 0.75 * v, 'triangle', pan); this.noise(0.5, 700, 120, 0.3, 0.16 * v, 'lowpass', pan, 0.03); }
    else if (kind === 'pistol') { this.noise(0.09, 2900, 700, 0.8, 0.42 * v, 'bandpass', pan); this.tone(230, 70, 0.07, 0.38 * v, 'triangle', pan); }
    else if (kind === 'launcher') { this.noise(0.22, 700, 160, 0.6, 0.6 * v, 'lowpass', pan); this.tone(110, 55, 0.18, 0.55 * v, 'sine', pan); this.noise(0.4, 1600, 500, 0.8, 0.12 * v, 'bandpass', pan, 0.05); }
    else if (kind === 'sniper') { this.noise(0.36, 2200, 260, 0.5, 0.8 * v, 'bandpass', pan); this.tone(170, 36, 0.24, 0.7 * v, 'triangle', pan); this.noise(0.8, 600, 100, 0.3, 0.14 * v, 'lowpass', pan, 0.04); }
  },
  pump() { this.noise(0.05, 1800, 900, 2, 0.16, 'bandpass', 0, 0.16); this.noise(0.06, 1300, 700, 2, 0.18, 'bandpass', 0, 0.3); },
  reload(st) { if (st === 0) { this.noise(0.05, 2400, 1200, 3, 0.16); this.tone(700, 420, 0.04, 0.06, 'square'); } else if (st === 1) { this.noise(0.06, 1500, 800, 3, 0.2); this.tone(380, 520, 0.05, 0.07, 'square'); } else { this.noise(0.04, 3000, 1500, 4, 0.18); this.noise(0.05, 2000, 900, 3, 0.2, 'bandpass', 0, 0.09); } },
  hit(v, pan) { this.noise(0.07, 700, 240, 1.2, 0.3 * v, 'bandpass', pan); },
  ric(v, pan) { this.noise(0.05, 4200 + Math.random() * 2500, 2600, 5, 0.1 * v, 'bandpass', pan); },
  hurt() { this.noise(0.14, 500, 160, 1, 0.5); this.tone(120, 60, 0.16, 0.4, 'sine'); },
  boom(v, pan) { this.noise(1.1, 900, 50, 0.4, 1.0 * v, 'lowpass', pan); this.tone(95, 24, 0.7, 0.9 * v, 'sine', pan); this.noise(0.25, 3000, 400, 0.6, 0.4 * v, 'bandpass', pan); },
  bang(v) { this.noise(0.4, 5000, 900, 0.5, 0.8 * v, 'highpass'); this.tone(3600, 3400, 1.6 * v + 0.2, 0.1 * v, 'sine'); },
  step(v) { this.noise(0.05, 320 + Math.random() * 160, 110, 1, 0.07 * v, 'lowpass'); },
  ui() { this.tone(660, 880, 0.07, 0.12, 'triangle'); },
  pick() { this.tone(520, 780, 0.08, 0.16, 'triangle'); this.tone(780, 1170, 0.1, 0.13, 'triangle', 0, 0.07); },
  marker(k) { this.tone(k ? 1500 : 1900, k ? 700 : 1500, k ? 0.12 : 0.035, k ? 0.16 : 0.08, 'square'); },
  beep() { this.tone(1250, 1250, 0.06, 0.1, 'square'); },
  alert() { this.tone(300, 460, 0.12, 0.12, 'sawtooth'); },
  roll() { this.noise(0.22, 500, 160, 0.6, 0.16, 'lowpass'); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.35, 0.16, 'triangle', 0, i * 0.13)); },
  lose() { [330, 262, 196].forEach((f, i) => this.tone(f, f * 0.97, 0.5, 0.18, 'triangle', 0, i * 0.22)); }
};

const FX = { p: [], MAXP: 900, decals: [], MAXD: 240, di: 0, lights: [], debris: [], shake: 0, sx: 0, sz: 0 };
FX.reset = function () { FX.p.length = 0; FX.decals.length = 0; FX.di = 0; FX.lights.length = 0; FX.debris.length = 0; FX.shake = 0; };
FX.add = function (o) {
  o.max = o.life; o.vx = o.vx || 0; o.vy = o.vy || 0; o.vz = o.vz || 0; o.grav = o.grav || 0; o.drag = o.drag || 0; o.shape = o.shape || 0; o.a = o.a === undefined ? 1 : o.a; o.s1 = o.s1 === undefined ? o.s0 : o.s1;
  if (FX.p.length >= FX.MAXP) FX.p.shift(); FX.p.push(o);
};
FX.light = function (x, y, z, r, c, k, life) { FX.lights.push({ x, y, z, r, c, k0: k, k, life, max: life }); };
FX.decal = function (x, y, z, nx, ny, nz, s, c, a, yaw) {
  const d = { x, y, z, nx, ny, nz, s, c, a, yaw: yaw || 0 };
  if (FX.decals.length < FX.MAXD) FX.decals.push(d); else { FX.decals[FX.di] = d; FX.di = (FX.di + 1) % FX.MAXD; }
};
const C_SPARK = [1, 0.85, 0.5], C_FIRE = [1, 0.55, 0.16], C_SMOKE = [0.2, 0.2, 0.21], C_DUST = [[0.72, 0.71, 0.68], [0.78, 0.62, 0.42], [0.62, 0.64, 0.68], [0.72, 0.65, 0.5]];
FX.muzzle = function (x, y, z, dx, dz, big) {
  const k = big || 1;
  FX.add({ x, y, z, life: 0.055, s0: 0.2 * k, s1: 0.34 * k, col: [1, 0.86, 0.55], add: 1, a: 0.95 });
  FX.add({ x: x + dx * 0.2 * k, y, z: z + dz * 0.2 * k, life: 0.05, s0: 0.14 * k, s1: 0.2 * k, col: [1, 0.7, 0.3], add: 1, a: 0.8 });
  for (let i = 0; i < 2; i++) FX.add({ x, y, z, vx: dx * rnd(9, 16) + rnd(-2, 2), vy: rnd(-1, 2), vz: dz * rnd(9, 16) + rnd(-2, 2), life: rnd(0.05, 0.09), s0: 0.025, col: C_SPARK, add: 1, st: 0.035 });
  FX.add({ x: x + dx * 0.15, y: y + 0.03, z: z + dz * 0.15, vx: dx * 1.2 + rnd(-0.3, 0.3), vy: 0.5, vz: dz * 1.2 + rnd(-0.3, 0.3), life: 0.5, s0: 0.08, s1: 0.32 * k, col: [0.8, 0.8, 0.8], a: 0.16, smoke: 1, drag: 2 });
  FX.light(x, y + 0.1, z, 6.5 * k, [1, 0.78, 0.42], 1.5, 0.06);
};
FX.shell = function (x, y, z, rx, rz, red) {
  FX.add({ x, y, z, vx: rx * rnd(1.6, 2.6), vy: rnd(1.8, 2.8), vz: rz * rnd(1.6, 2.6), life: 1.3, s0: red ? 0.035 : 0.022, col: red ? [0.75, 0.16, 0.12] : [0.86, 0.68, 0.25], grav: 12, bounce: 0.38, shape: 3, a: 1 });
};
FX.impact = function (x, y, z, nx, ny, nz, kind, heavy) {
  const dc = C_DUST[kind] || C_DUST[0];
  if (kind === 2 || kind === 0) for (let i = 0; i < (kind === 2 ? 4 : 2); i++) FX.add({ x, y, z, vx: nx * rnd(2, 6) + rnd(-3, 3), vy: ny * rnd(2, 6) + rnd(0, 4), vz: nz * rnd(2, 6) + rnd(-3, 3), life: rnd(0.12, 0.28), s0: 0.02, col: C_SPARK, add: 1, st: 0.03, grav: 9 });
  if (kind === 1) for (let i = 0; i < 3; i++) FX.add({ x, y, z, vx: nx * rnd(1, 3) + rnd(-1.5, 1.5), vy: rnd(0.5, 3), vz: nz * rnd(1, 3) + rnd(-1.5, 1.5), life: rnd(0.3, 0.6), s0: rnd(0.02, 0.04), col: [0.8, 0.62, 0.38], grav: 10, shape: 3, a: 1 });
  FX.add({ x: x + nx * 0.05, y: y + ny * 0.05, z: z + nz * 0.05, vx: nx * 0.9 + rnd(-0.3, 0.3), vy: ny * 0.9 + 0.5, vz: nz * 0.9 + rnd(-0.3, 0.3), life: rnd(0.35, 0.6), s0: 0.07, s1: heavy ? 0.5 : 0.3, col: dc, a: 0.4, smoke: 1, drag: 2.5 });
  if (!(ny > 0.5 && y < 0.05)) FX.decal(x, y, z, nx, ny, nz, rnd(0.04, 0.06), [0.07, 0.06, 0.05], 0.85);
  else FX.decal(x, 0.012, z, 0, 1, 0, rnd(0.05, 0.08), [0.1, 0.1, 0.1], 0.6);
};
FX.blood = function (x, y, z, dx, dz) {
  for (let i = 0; i < 3; i++) FX.add({ x, y, z, vx: dx * rnd(1, 3.5) + rnd(-1, 1), vy: rnd(0.3, 2), vz: dz * rnd(1, 3.5) + rnd(-1, 1), life: rnd(0.2, 0.38), s0: 0.05, s1: 0.13, col: [0.5, 0.05, 0.04], a: 0.75, grav: 6, smoke: 1 });
};
FX.explode = function (x, y, z, r) {
  FX.add({ x, y: y + 0.4, z, life: 0.12, s0: r * 0.5, s1: r * 0.95, col: [1, 0.92, 0.7], add: 1, a: 1 });
  for (let i = 0; i < 11; i++) { const a = rnd(TAU), s = rnd(1, 5); FX.add({ x: x + cos(a) * 0.3, y: y + rnd(0.2, 0.9), z: z + sin(a) * 0.3, vx: cos(a) * s, vy: rnd(1, 5), vz: sin(a) * s, life: rnd(0.3, 0.55), s0: rnd(0.5, 0.9), s1: rnd(1.2, 1.9), col: i % 2 ? C_FIRE : [1, 0.75, 0.3], add: 1, a: 0.85, drag: 2.5 }); }
  for (let i = 0; i < 13; i++) { const a = rnd(TAU), s = rnd(0.5, 3.4); FX.add({ x: x + cos(a) * 0.5, y: y + rnd(0.3, 1.2), z: z + sin(a) * 0.5, vx: cos(a) * s, vy: rnd(1.2, 3.6), vz: sin(a) * s, life: rnd(1.1, 2.3), s0: rnd(0.6, 1.0), s1: rnd(1.8, 3.0), col: C_SMOKE, a: 0.55, smoke: 1, drag: 1.3 }); }
  for (let i = 0; i < 20; i++) { const a = rnd(TAU), s = rnd(5, 17); FX.add({ x, y: y + 0.3, z, vx: cos(a) * s, vy: rnd(2, 11), vz: sin(a) * s, life: rnd(0.3, 0.8), s0: 0.03, col: C_SPARK, add: 1, st: 0.03, grav: 16 }); }
  for (let i = 0; i < 9; i++) { const a = rnd(TAU), s = rnd(2, 8); FX.add({ x, y: y + 0.3, z, vx: cos(a) * s, vy: rnd(3, 9), vz: sin(a) * s, life: rnd(0.7, 1.3), s0: rnd(0.04, 0.09), col: [0.16, 0.15, 0.14], grav: 15, bounce: 0.3, shape: 3, a: 1 }); }
  FX.add({ x, y: 0.05, z, life: 0.35, s0: 0.6, s1: r * 1.25, col: [1, 0.9, 0.75], add: 1, a: 0.5, flat: 1, shape: 1 });
  FX.decal(x, 0.014, z, 0, 1, 0, r * 0.5, [0.05, 0.05, 0.05], 0.6, rnd(TAU)); FX.decal(x, 0.015, z, 0, 1, 0, r * 0.28, [0.02, 0.02, 0.02], 0.7, rnd(TAU));
  FX.light(x, y + 1.2, z, r * 3.2, [1, 0.7, 0.35], 3.2, 0.4);
};
FX.flashbang = function (x, y, z) {
  FX.add({ x, y: y + 0.3, z, life: 0.16, s0: 2.5, s1: 6.5, col: [1, 1, 1], add: 1, a: 1 });
  FX.add({ x, y: 0.05, z, life: 0.4, s0: 0.5, s1: 9, col: [1, 1, 1], add: 1, a: 0.6, flat: 1, shape: 1 });
  for (let i = 0; i < 16; i++) { const a = rnd(TAU), s = rnd(4, 13); FX.add({ x, y: y + 0.2, z, vx: cos(a) * s, vy: rnd(2, 8), vz: sin(a) * s, life: rnd(0.25, 0.6), s0: 0.03, col: [1, 1, 0.9], add: 1, st: 0.03, grav: 12 }); }
  for (let i = 0; i < 5; i++) { const a = rnd(TAU); FX.add({ x, y: y + 0.4, z, vx: cos(a) * 1.2, vy: rnd(0.6, 1.6), vz: sin(a) * 1.2, life: rnd(0.9, 1.6), s0: 0.5, s1: 1.8, col: [0.85, 0.85, 0.85], a: 0.35, smoke: 1, drag: 1.5 }); }
  FX.light(x, y + 1, z, 20, [1, 1, 1], 4, 0.3);
};
FX.puff = function (x, z, n, s) { for (let i = 0; i < (n || 1); i++) FX.add({ x: x + rnd(-0.15, 0.15), y: 0.08, z: z + rnd(-0.15, 0.15), vx: rnd(-0.5, 0.5), vy: rnd(0.2, 0.6), vz: rnd(-0.5, 0.5), life: rnd(0.35, 0.6), s0: 0.1, s1: s || 0.4, col: C_DUST[0], a: 0.22, smoke: 1, drag: 2 }); };
FX.update = function (dt) {
  const P = FX.p;
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i]; p.life -= dt; if (p.life <= 0) { P[i] = P[P.length - 1]; P.pop(); continue; }
    if (p.grav) p.vy -= p.grav * dt; if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; p.vz *= k; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.y < 0.02 && p.vy < 0) { if (p.bounce) { p.y = 0.02; p.vy = -p.vy * p.bounce; p.vx *= 0.5; p.vz *= 0.5; if (p.vy < 0.4) { p.vy = 0; p.grav = 0; p.vx = p.vz = 0; } } else if (p.grav) { p.y = 0.02; p.vy = 0; p.vx *= 0.3; p.vz *= 0.3; } }
  }
  for (let i = FX.lights.length - 1; i >= 0; i--) { const l = FX.lights[i]; l.life -= dt; if (l.life <= 0) { FX.lights.splice(i, 1); continue; } l.k = l.k0 * (l.life / l.max); }
  for (const d of FX.debris) {
    if (d.rest) continue; d.vy -= 14 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; d.yaw += d.spin * dt; d.roll = damp(d.roll, PI / 2, 6, dt);
    if (d.y < 0.03) { d.y = 0.03; if (abs(d.vy) < 1.2) { d.rest = true; d.roll = PI / 2; } else { d.vy = -d.vy * 0.3; d.vx *= 0.5; d.vz *= 0.5; d.spin *= 0.5; } }
  }
  FX.shake = damp(FX.shake, 0, 7, dt); const s = FX.shake; FX.sx = (Math.random() - 0.5) * s; FX.sz = (Math.random() - 0.5) * s;
};
FX.draw = function (fx, fz) {
  const P = FX.p, A = Q.A, B = Q.B;
  for (let i = 0; i < P.length; i++) {
    const p = P[i], t = 1 - p.life / p.max, s = lerp(p.s0, p.s1, t), c = p.col;
    const al = p.a * (p.smoke ? min(1, t * 7) * (1 - t) * 1.4 : (p.bounce || p.shape === 3 ? min(1, p.life * 4) : 1 - t * t));
    const bt = p.add ? B : A;
    if (p.st) Q.line(bt, p.x - p.vx * p.st, p.y - p.vy * p.st, p.z - p.vz * p.st, p.x, p.y, p.z, s, c[0], c[1], c[2], al, 3);
    else if (p.flat) Q.flat(bt, p.x, p.y, p.z, s, s, 0, c[0], c[1], c[2], al, p.shape);
    else Q.bill(bt, p.x, p.y, p.z, s, c[0], c[1], c[2], al, p.shape);
  }
  const D = FX.decals;
  for (let i = 0; i < D.length; i++) {
    const d = D[i]; if (abs(d.x - fx) > 30 || abs(d.z - fz) > 38) continue;
    if (d.ny > 0.9) Q.flat(Q.D, d.x, d.y, d.z, d.s, d.s, d.yaw, d.c[0], d.c[1], d.c[2], d.a, 0); else Q.wall(Q.D, d.x, d.y, d.z, d.nx, d.ny, d.nz, d.s, d.c[0], d.c[1], d.c[2], d.a, 0);
  }
  for (const d of FX.debris) { if (abs(d.x - fx) > 28 || abs(d.z - fz) > 36) continue; const m = R.add(d.mesh, R.CAST); m4trs(m, d.x, d.y, d.z, d.yaw, 0, d.roll); }
};

// ---- ambient weather: snow flakes / desert dust / sea haze motes ----
FX.wx = []; FX.wxType = null;
FX.weather = function (type, cx, cz, dt) {
  if (type !== FX.wxType) { FX.wxType = type; FX.wx.length = 0; const n = type === 'snow' ? 420 : type === 'dust' ? 90 : type === 'sea' ? 40 : 0; for (let i = 0; i < n; i++) FX.wx.push([rnd(-22, 22), rnd(0, 12), rnd(-22, 22), rnd(TAU), rnd(0.6, 1.4)]); }
  if (!type) return; const A = FX.wx, now = G.time;
  for (let i = 0; i < A.length; i++) {
    const f = A[i]; let x = cx + f[0], z = cz + f[2];
    if (type === 'snow') { f[1] -= dt * 1.25 * f[4]; f[0] += sin(now * 0.8 + f[3]) * dt * 0.45 + dt * 0.35; f[2] += cos(now * 0.6 + f[3]) * dt * 0.3; if (f[1] < 0) { f[1] = 11 + rnd(1); f[0] = rnd(-22, 22); f[2] = rnd(-22, 22); } Q.bill(Q.A, x, f[1], z, 0.035 * f[4], 1, 1, 1, 0.85, 2); }
    else if (type === 'dust') { f[0] += dt * 1.6 * f[4]; f[1] += sin(now * 0.7 + f[3]) * dt * 0.12; if (f[0] > 22) { f[0] = -22; f[2] = rnd(-22, 22); f[1] = rnd(0.2, 6); } Q.bill(Q.A, x, f[1], z, 0.05 + 0.04 * f[4], 0.86, 0.74, 0.55, 0.32, 0); }
    else { f[0] += dt * 0.4 * f[4]; f[1] += sin(now * 0.5 + f[3]) * dt * 0.08; if (f[0] > 22) f[0] = -22; Q.bill(Q.B, x, 0.6 + f[1] * 0.5, z, 0.04, 1, 0.75, 0.45, 0.35, 0); }
  }
};
