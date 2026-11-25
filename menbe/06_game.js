// ===== game state, combat, AI =====
const DIFF = [{ n: 'ASAN', dmg: 0.6, acc: 1.5, react: 1.4, hp: 0.85 }, { n: 'NORMAL', dmg: 1, acc: 1, react: 1, hp: 1 }, { n: 'ÇƏTİN', dmg: 1.4, acc: 0.72, react: 0.7, hp: 1.2 }];
const ETYPE = {
  rifle: { kit: 'rifle', weapon: 'erifle', hp: 70, speed: 3.3, pref: 10, burst: [3, 5], pause: [0.6, 1.4], range: 26 },
  smg: { kit: 'smg', weapon: 'smg', hp: 55, speed: 4.5, pref: 5, burst: [5, 8], pause: [0.45, 1.0], range: 15 },
  heavy: { kit: 'heavy', weapon: 'lmg', hp: 320, speed: 1.8, pref: 8, burst: [10, 16], pause: [1.1, 1.8], range: 24, scale: 1.14 },
  sniper: { kit: 'sniper', weapon: 'sniper', hp: 60, speed: 2.6, pref: 16, burst: [1, 1], pause: [1, 1], range: 40 }
};
const KILLPTS = { rifle: 100, smg: 100, heavy: 250, sniper: 150 };
const G = { state: 'menu', time: 0, frame: 0, diff: 1, loadout: { p: 'rifle', s: 'shotgun' }, score: 0, streak: 0, lastKillT: -9, soldiers: [], enemies: [], friends: [], allies: [], player: null, bullets: [], nades: [], barrels: [], pickups: [], trail: [], stats: {}, hold: false, cp: 0, left: 0, god: false };
const _v3 = new Float32Array(3);
const vol3 = (x, z) => { const p = G.player; if (!p) return 0.5; const d = hyp(x - p.x, z - p.z); const v = clamp(1 - d / 48, 0, 1); return v * v; };
const pan3 = x => G.player ? clamp((x - G.player.x) / 16, -1, 1) : 0;

function newSoldier(o) { const s = new Soldier(o); s.vx = 0; s.vz = 0; s.acc = 1; s.ai = { path: null, pi: 0, pt: 0, px: 0, pz: 0, stuck: 0 }; return s; }
function newGame(diff) {
  G.diff = diff; G.time = 0; G.bullets.length = 0; G.nades.length = 0; G.soldiers.length = 0; G.enemies.length = 0; G.friends.length = 0; G.allies.length = 0;
  G.stats = { shots: 0, hits: 0, kills: 0, deaths: 0, t: 0 }; G.hold = false; G.fyaw = W.start.yaw; G.cp = 0; G.contactT = -9; G.eNadeT = 0; G.zoneDone = W.zones.map(() => 0); G.endT = 0; G.deadT = 0; G.score = 0; G.streak = 0; G.lastKillT = -9;
  FX.reset(); const st = W.start;
  const p = G.player = newSoldier({ team: 0, kit: 'police', x: st.x, z: st.z, yaw: st.yaw, hp: 100, weapon: 'rifle', name: 'SƏN' });
  const LP = WEAP[G.loadout.p] || WEAP.rifle, LS = WEAP[G.loadout.s] || WEAP.shotgun; p.weapon = LP; p.ammo = LP.mag;
  p.inv = [{ w: LP, ammo: LP.mag, res: LP.res }, { w: LS, ammo: LS.mag, res: LS.res }]; p.cur = 0; p.frag = 3; p.flashN = 2; p.swapT = 0; p.rollCd = 0; p.nadeT = 0;
  G.soldiers.push(p); G.friends.push(p);
  [['TURAL', 'police2'], ['RƏŞAD', 'police3']].forEach((a, i) => {
    const s = newSoldier({ team: 0, kit: a[1], x: st.x, z: st.z + 1.25 * (i + 1), yaw: st.yaw, hp: 100, weapon: 'rifle', name: a[0] });
    s.think = rnd(0.2); s.tgt = null; s.burst = 0; s.bcd = 0.4; s.rev = 0; s.holdX = s.x; s.holdZ = s.z; G.soldiers.push(s); G.friends.push(s); G.allies.push(s);
  });
  G.trail.length = 0; for (let k = 12; k >= 0; k--) G.trail.push([st.x, st.z + k * 0.4]);
  G.wave = 1; W.spawns.forEach((sp, i) => addEnemy(sp, i, 1));
  G.left = G.enemies.length;
  resetProps();
}
function addEnemy(sp, i, hpMul) {
  const T = ETYPE[sp.t], sk = W.map && W.map.skin, kit = sk && KITS[T.kit + '_' + sk] ? T.kit + '_' + sk : T.kit, e = newSoldier({ team: 1, type: sp.t, kit, x: sp.x, z: sp.z, yaw: sp.yaw || 0, hp: T.hp * DIFF[G.diff].hp * hpMul, weapon: T.weapon, scale: T.scale });
  e.idx = i; e.zone = W.zones.findIndex(z => i >= z.a && i < z.b);
  Object.assign(e.ai, { st: 0, tgt: null, tv: false, td: 99, lkx: e.x, lkz: e.z, seen: -9, think: rnd(0.3), dx: e.x, dz: e.z, rep: 0, burst: 0, bcd: rnd(0.3, 1), aimT: 0, hx: sp.x, hz: sp.z, hyaw: sp.yaw || 0, patrol: sp.patrol || null, pIdx: 0, wait: rnd(1, 3), hide: false, nadeCd: rnd(5, 12), laser: 0, visT: 0, notice: 0, nx: 0, nz: 0 });
  e.vis = false; G.soldiers.push(e); G.enemies.push(e); return e;
}
function resetProps() {
  G.barrels = W.barrels.map(b => { const o = { x: b.x, z: b.z, hp: 34, alive: true, fuse: -1 }; o.box = { x0: b.x - 0.27, z0: b.z - 0.27, x1: b.x + 0.27, z1: b.z + 0.27, h: 0.88, k: 2, alive: true, barrel: o }; return o; });
  W.dyn = G.barrels.map(b => b.box); W.navBuild();
  G.pickups = W.pickups.map(p => ({ t: p[0], x: p[1], z: p[2], taken: false }));
}
function nextWave() {
  G.wave++; const p = G.player, hm = 1 + 0.2 * (G.wave - 1);
  G.soldiers = G.soldiers.filter(s => s.team === 0); G.enemies.length = 0; FX.debris.length = 0; G.bullets.length = 0; G.nades.length = 0;
  W.spawns.forEach((sp, i) => { if (hyp(sp.x - p.x, sp.z - p.z) > 16) addEnemy(sp, i, hm); });
  const types = ['rifle', 'rifle', 'smg', 'rifle', 'smg', 'heavy', 'sniper'];
  for (let n = 0, tries = 0; n < 3 + G.wave * 2 && tries < 400; tries++) {
    const x = rnd(W.X0 + 3, W.X1 - 3), z = rnd(W.Z0 + 3, W.Z1 - 12); if (W.isBlocked(x, z) || nearSolid(x, z) || hyp(x - p.x, z - p.z) < 20) continue;
    const e = addEnemy({ t: pick(types), x, z, yaw: rnd(TAU) }, 100 + n, hm); e.zone = -1; n++;
  }
  G.left = G.enemies.length; G.zoneDone = W.zones.map(() => 0); G.endT = 0; resetProps();
  p.hp = max(p.hp, 70); for (const sl of p.inv) sl.res = max(sl.res, Math.ceil(sl.w.res * 0.8)); p.frag = max(p.frag, 2); p.flashN = max(p.flashN, 2);
  for (const s of G.allies) { s.down = false; s.hp = 100; s.tgt = null; }
  G.state = 'play'; HUD.msg('Dalğa ' + G.wave + ': düşmən əlavə qüvvə gətirdi', 2);
}
G.noise = function (x, z, r) { for (const e of G.enemies) { if (e.dead || e.ai.st === 2 || e.ai.st === 1) continue; if (hyp(e.x - x, e.z - z) < r) alertEnemy(e, x + rnd(-1.5, 1.5), z + rnd(-1.5, 1.5)); } };
function alertEnemy(e, x, z) { const a = e.ai; if (a.st === 2 || e.dead) return; a.st = 1; a.lkx = x; a.lkz = z; a.path = null; a.wait = rnd(4, 6); }

// ---------- shooting ----------
function aimTarget(s, yaw, maxAng, range) {
  let best = null, bs = 1e9; const L = s.team === 0 ? G.enemies : G.friends;
  for (const t of L) {
    if (t.dead || t.down) continue; const dx = t.x - s.x, dz = t.z - s.z, d = hyp(dx, dz); if (d > range || d < 0.4) continue;
    const a = abs(angDiff(yaw, atan2(dx, dz))); if (a > maxAng + 0.5 / d) continue;
    const sc = a + d * 0.004; if (sc < bs && W.los(s.x, s.z, t.x, t.z)) { bs = sc; best = t; }
  }
  return best;
}
function shoot(s) {
  const w = s.weapon, yaw = s.yaw, sy = sin(yaw), cy = cos(yaw);
  s.fireCd = w.cd; s.ammo--; s.rec = min(1.7, s.rec + w.kick); s.lastShot = G.time;
  const oy = (1.38 - s.cr * 0.36) * s.sc, ox = s.x + sy * 0.2, oz = s.z + cy * 0.2;
  let slope = 0; const tg = s.team === 0 ? aimTarget(s, yaw, 0.14, 44) : s.ai.tgt;
  if (tg) { const d = hyp(tg.x - s.x, tg.z - s.z); if (d > 0.6) slope = (tg.height * 0.62 - oy) / d; }
  const spread = s.team === 0 && s === G.player ? (w.spread + s.bloom + (s.spd > 1.5 ? 0.014 : 0) - s.cr * 0.006) * (1 - 0.5 * (s.adsW || 0)) : w.spread * s.acc;
  const dm = s.team === 0 ? (s === G.player ? 1 : 0.38) : 1;
  for (let i = 0; i < w.pellets; i++) {
    const a = yaw + (Math.random() + Math.random() - 1) * spread, sl = slope + (Math.random() - 0.5) * spread * (w.pellets > 1 ? 1 : 0.5);
    G.bullets.push({ x: ox, y: oy, z: oz, dx: sin(a), dy: sl, dz: cos(a), spd: w.speed * rnd(0.95, 1.05), dmg: w.dmg * dm, team: s.team, own: s, d: 0, range: w.range, vis: 0.8, expl: w.expl ? w : null, sn: w.snd === 'sniper' });
  }
  if (s === G.player) { s.bloom = min(w.maxBloom || 0, s.bloom + (w.bloom || 0)); if (!w.expl) G.stats.shots += w.pellets; FX.shake += w.pellets > 1 || w.expl ? 0.16 : w.snd === 'sniper' ? 0.2 : 0.035; }
  const m = s.muzzle(_v3, G.frame); FX.muzzle(m[0], m[1], m[2], sy, cy, w.pellets > 1 ? 1.4 : w.snd === 'sniper' ? 1.5 : 1);
  if (w.shell) FX.shell(s.x + sy * 0.32 - cy * 0.14, oy, s.z + cy * 0.32 + sy * 0.14, -cy, sy);
  if (w.pump) { s.pumpT = 0.42; if (!w.bolt) FX.shell(s.x + sy * 0.3 - cy * 0.14, oy, s.z + cy * 0.3 + sy * 0.14, -cy, sy, 1); if (s === G.player) SFX.pump(); }
  SFX.shot(w.snd, s === G.player ? 1 : vol3(s.x, s.z) * 0.8, pan3(s.x));
  if (s.team === 0) G.noise(s.x, s.z, 17);
}
function updateBullets(dt) {
  const B = G.bullets;
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i]; let step = b.spd * dt; if (b.d + step > b.range) step = b.range - b.d;
    let t = step, wall = null, wk = 0, wnx = 0, wny = 0, wnz = 0, hs = null, hy = 0;
    const h = W.ray(b.x, b.y, b.z, b.dx, b.dy, b.dz, step); if (h) { t = h.t; wall = h.b; wk = h.b.k || 0; wnx = h.nx; wny = h.ny; wnz = h.nz; }
    const L = b.team === 0 ? G.enemies : G.friends;
    for (let j = 0; j < L.length; j++) {
      const s = L[j]; if (s.dead || s.down || s.rollT > 0.14) continue;
      const fx = b.x - s.x, fz = b.z - s.z, r = 0.36 * s.sc, bq = fx * b.dx + fz * b.dz, c = fx * fx + fz * fz - r * r; let ts;
      if (c < 0) ts = 0; else { const disc = bq * bq - c; if (disc < 0 || bq > 0) continue; ts = -bq - sqrt(disc); }
      if (ts > t) continue; const yy = b.y + b.dy * ts; if (yy < 0.02 || yy > s.height) continue; t = ts; hs = s; hy = yy;
    }
    if (b.expl) { if (Math.random() < 0.8) FX.add({ x: b.x, y: b.y, z: b.z, vx: rnd(-0.3, 0.3), vy: rnd(0.2, 0.6), vz: rnd(-0.3, 0.3), life: rnd(0.5, 0.9), s0: 0.08, s1: 0.4, col: [0.75, 0.75, 0.75], a: 0.4, smoke: 1, drag: 2 });
      if (hs || wall || b.d + step >= b.range - 1e-3) { const tt = hs || wall ? t : step; explode(b.x + b.dx * tt - b.dx * 0.15, b.z + b.dz * tt - b.dz * 0.15, b.expl.er, b.expl.edmg, b.own); B[i] = B[B.length - 1]; B.pop(); continue; } }
    if (hs) { hurt(hs, b.dmg, b.dx, b.dz, b.own, hy); B[i] = B[B.length - 1]; B.pop(); continue; }
    if (wall) {
      const x = b.x + b.dx * t, y = b.y + b.dy * t, z = b.z + b.dz * t; FX.impact(x, y, z, wnx, wny, wnz, wk); if (Math.random() < 0.5) SFX.ric(vol3(x, z) * 0.9, pan3(x));
      if (wall.barrel) hitBarrel(wall.barrel, b.dmg, b.own); B[i] = B[B.length - 1]; B.pop(); continue;
    }
    b.x += b.dx * step; b.y += b.dy * step; b.z += b.dz * step; b.d += step; if (b.d >= b.range - 1e-3 || b.y < -0.2) { B[i] = B[B.length - 1]; B.pop(); }
  }
}
function hurt(s, dmg, dx, dz, att, hy, expl) {
  if (s.dead || s.down) return;
  if (s === G.player) { if (G.god || (s.rollT > 0.14 && !expl)) return; dmg *= DIFF[G.diff].dmg; }
  else if (s.team === 0) dmg *= 0.42 * DIFF[G.diff].dmg;
  s.hp -= dmg; s.flash = 1; s.lastHurt = G.time;
  const f = dx * sin(s.yaw) + dz * cos(s.yaw), sd = dx * cos(s.yaw) - dz * sin(s.yaw), kk = min(1.5, dmg / 22);
  s.hitP += f * 0.2 * kk; s.hitR -= sd * 0.18 * kk;
  FX.blood(s.x, hy || 1.2, s.z, dx, dz);
  if (att === G.player) { if (!expl) G.stats.hits++; HUD.marker(s.hp <= 0); }
  s.expl = !!expl; if (s.team === 1 && att) { const a = s.ai; if (a.st !== 2) { a.st = 1; a.lkx = att.x; a.lkz = att.z; a.path = null; a.wait = 5; } }
  if (s === G.player) { HUD.damage(dx, dz); SFX.hurt(); FX.shake += 0.22; } else SFX.hit(vol3(s.x, s.z), pan3(s.x));
  if (s.hp <= 0) die(s, dx, dz, att);
}
function die(s, dx, dz, att) {
  s.hp = 0; s.reloading = false; s.aiming = false; s.crouch = false;
  if (s.team === 0 && s !== G.player) { s.down = true; s.rev = 0; s.tgt = null; HUD.msg(s.name + ' yaralandı — yaxınlaş və ayağa qaldır', 2); return; }
  s.dead = true; s.dT = 0; s.fd = atan2(dx, dz); s.vis = true;
  FX.debris.push({ mesh: s.weapon.mesh, x: s.x + sin(s.yaw) * 0.4, y: 1.1, z: s.z + cos(s.yaw) * 0.4, vx: dx * 1.6 + rnd(-1, 1), vy: 2.2, vz: dz * 1.6 + rnd(-1, 1), yaw: s.yaw, roll: 0, spin: rnd(-7, 7), rest: false });
  if (s.team === 1) {
    G.stats.kills++; G.left--;
    if (Math.random() < 0.34) { const r = Math.random(); G.pickups.push({ t: r < 0.55 ? 'ammo' : r < 0.87 ? 'med' : 'nade', x: s.x, z: s.z, taken: false, drop: 1 }); }
    const zn = s.zone; if (zn >= 0 && !G.zoneDone[zn] && !G.enemies.some(e => !e.dead && e.zone === zn)) { G.zoneDone[zn] = 1; if (G.left > 0) { HUD.msg(W.zones[zn].n + ' təmizləndi', 1); if (att === G.player || (att && att.team === 0)) { G.score += 200; HUD.pop('ZONA TƏMİZLƏNDİ  +200', 1); } } }
    const pts = Math.round((KILLPTS[s.type] || 100) * (1 + 0.25 * (G.wave - 1)));
    if (att === G.player) {
      G.streak = G.time - G.lastKillT < 3 ? G.streak + 1 : 1; G.lastKillT = G.time; const bonus = (G.streak - 1) * 50;
      G.score += pts + bonus; HUD.pop((G.streak >= 4 ? 'DAYANILMAZ!' : G.streak === 3 ? 'ÜÇQAT ZƏRBƏ!' : G.streak === 2 ? 'İKİQAT ZƏRBƏ!' : (s.expl ? 'PARTLAYIŞ' : 'ZƏRƏRSİZLƏŞDİRİLDİ')) + '  +' + (pts + bonus), G.streak > 1 ? 2 : 0);
    } else if (att && att.team === 0) G.score += 25;
    HUD.feed(att ? (att === G.player ? 'SƏN' : att.name || '') : '', s.expl ? 'boom' : att && att.weapon ? att.weapon.id || 'erifle' : 'boom', s.type, att === G.player);
    if (G.left > 0 && att && att !== G.player && att.team === 0 && Math.random() < 0.5) HUD.msg(att.name + ': Hədəf zərərsizləşdirildi', 0);
  } else { G.state = 'dead'; G.deadT = 0; G.stats.deaths++; SFX.lose(); }
}
// ---------- grenades / explosions / barrels ----------
function throwNade(s, type, tx, tz) {
  const g = 14, x = s.x + sin(s.yaw) * 0.3, z = s.z + cos(s.yaw) * 0.3, y = 1.5, d = hyp(tx - x, tz - z), T = clamp(d / 11, 0.45, 1.15);
  G.nades.push({ type, x, y, z, vx: (tx - x) / T, vy: (0.1 - y + 0.5 * g * T * T) / T, vz: (tz - z) / T, fuse: type === 'frag' ? (s.team ? 2.4 : max(T + 0.6, 1.5)) : max(T + 0.25, 1.1), team: s.team, own: s, rot: rnd(TAU), beep: 0 });
}
function updateNades(dt) {
  const N = G.nades;
  for (let i = N.length - 1; i >= 0; i--) {
    const n = N[i]; n.fuse -= dt; n.vy -= 14 * dt; const oy = n.y; n.x += n.vx * dt; n.y += n.vy * dt; n.z += n.vz * dt; n.rot += hyp(n.vx, n.vz) * dt * 3;
    if (n.y < 0.07) { n.y = 0.07; if (n.vy < -1.5) SFX.ric(vol3(n.x, n.z) * 0.5, 0); n.vy = -n.vy * 0.34; n.vx *= 0.62; n.vz *= 0.62; if (abs(n.vy) < 0.5) n.vy = 0; }
    const L = W.near(n.x, n.z);
    for (let j = 0; j < L.length; j++) {
      const b = L[j]; if (n.x < b.x0 - 0.07 || n.x > b.x1 + 0.07 || n.z < b.z0 - 0.07 || n.z > b.z1 + 0.07 || n.y > b.h + 0.07) continue;
      if (oy >= b.h + 0.05) { n.y = b.h + 0.07; n.vy = -n.vy * 0.34; n.vx *= 0.6; n.vz *= 0.6; continue; }
      const l = n.x - (b.x0 - 0.07), r = (b.x1 + 0.07) - n.x, t = n.z - (b.z0 - 0.07), bt = (b.z1 + 0.07) - n.z, m = min(l, r, t, bt);
      if (m === l) { n.x = b.x0 - 0.08; n.vx = -abs(n.vx) * 0.45; } else if (m === r) { n.x = b.x1 + 0.08; n.vx = abs(n.vx) * 0.45; } else if (m === t) { n.z = b.z0 - 0.08; n.vz = -abs(n.vz) * 0.45; } else { n.z = b.z1 + 0.08; n.vz = abs(n.vz) * 0.45; }
    }
    if (n.team === 1) { n.beep -= dt; if (n.beep <= 0) { n.beep = 0.28; SFX.tone(1250, 1250, 0.05, 0.1 * vol3(n.x, n.z), 'square'); } }
    if (n.fuse <= 0) { if (n.type === 'frag') explode(n.x, n.z, 5.6, 135, n.own); else flashbang(n.x, n.z, n.own); N.splice(i, 1); }
  }
}
function explode(x, z, r, dmg, own) {
  FX.explode(x, 0.2, z, r); const v = vol3(x, z); SFX.boom(0.3 + v * 0.7, pan3(x)); FX.shake += v * 1.3;
  for (const s of G.soldiers) {
    if (s.dead || s.down) continue; const dx = s.x - x, dz = s.z - z, d = hyp(dx, dz) || 0.01; if (d > r || !W.los(x, z, s.x, s.z)) continue;
    let dm = dmg * (0.25 + 0.75 * (1 - d / r)); if (s.crouch && W.lowCover(s.x, s.z, x, z)) dm *= 0.4;
    if (s === own) dm *= 0.6; else if (own && own.team === 0 && s.team === 0) dm *= 0.2;
    hurt(s, dm, dx / d, dz / d, own, 1.0, true);
  }
  for (const b of G.barrels) if (b.alive && b.fuse < 0 && hyp(b.x - x, b.z - z) < r * 0.85 && (b.x !== x || b.z !== z)) { b.hp = 0; b.fuse = rnd(0.12, 0.4); if (own) b.own = own; }
  G.noise(x, z, 28);
}
function flashbang(x, z, own) {
  FX.flashbang(x, 0.3, z); SFX.bang(0.25 + vol3(x, z) * 0.75); let n = 0;
  for (const e of G.enemies) { if (e.dead) continue; const d = hyp(e.x - x, e.z - z); if (d < 9.5 && W.los(x, z, e.x, e.z)) { e.stun = lerp(4.6, 2.2, d / 9.5); e.ai.aimT = 0.8; e.ai.burst = 0; e.ai.laser = 0; n++; } }
  const p = G.player, d = hyp(p.x - x, p.z - z); if (d < 6.5 && W.los(x, z, p.x, p.z)) HUD.white(lerp(0.95, 0.35, d / 6.5));
  if (n && own === G.player) HUD.msg(n + ' düşmən kor edildi', 0);
  G.noise(x, z, 20);
}
function hitBarrel(b, dmg, own) { if (!b.alive) return; if (own) b.own = own; b.hp -= dmg; if (b.hp <= 0 && b.fuse < 0) b.fuse = rnd(0.25, 0.5); }
function updateBarrels(dt) {
  for (const b of G.barrels) {
    if (!b.alive) continue;
    if (b.hp < 34 && Math.random() < dt * 30) FX.add({ x: b.x + rnd(-0.1, 0.1), y: 0.9, z: b.z + rnd(-0.1, 0.1), vx: rnd(-0.3, 0.3), vy: rnd(1.5, 3), vz: rnd(-0.3, 0.3), life: rnd(0.25, 0.45), s0: 0.22, s1: 0.05, col: C_FIRE, add: 1, a: 0.9 });
    if (b.fuse >= 0) { b.fuse -= dt; if (b.fuse <= 0) { b.alive = false; b.box.alive = false; explode(b.x, b.z, 5.2, 150, b.own || null); } }
  }
}
function updatePickups(dt) {
  const p = G.player; if (p.dead) return;
  for (const k of G.pickups) {
    if (k.taken || hyp(k.x - p.x, k.z - p.z) > 1.0) continue;
    if (k.t === 'med') { if (p.hp >= p.maxHp - 1) continue; p.hp = min(p.maxHp, p.hp + 45); HUD.msg('+45 sağlamlıq', 1); }
    else if (k.t === 'ammo') { for (const sl of p.inv) if (sl.res !== Infinity) sl.res = min(Math.ceil(sl.w.res * 1.6), sl.res + Math.ceil(sl.w.res * 0.4)); HUD.msg('+ döyüş sursatı', 1); }
    else { if (p.frag >= 4 && p.flashN >= 3) continue; p.frag = min(4, p.frag + 1); p.flashN = min(3, p.flashN + 1); HUD.msg('+ qumbara', 1); }
    k.taken = true; SFX.pick(); FX.add({ x: k.x, y: 0.4, z: k.z, life: 0.35, s0: 0.3, s1: 1.2, col: [0.6, 1, 0.7], add: 1, a: 0.5, flat: 1, shape: 1 });
  }
}
// ---------- movement helpers ----------
function stepMove(e, dt) { e.x += e.vx * dt; e.z += e.vz * dt; W.collide(e, e.r); }
function halt(e, dt) { e.vx = damp(e.vx, 0, 12, dt); e.vz = damp(e.vz, 0, 12, dt); stepMove(e, dt); }
function seek(e, x, z, speed, dt) {
  const a = e.ai, d = hyp(x - e.x, z - e.z); if (d < 0.35) { halt(e, dt); return true; }
  a.pt -= dt;
  if (!a.path || (a.pt <= 0 && (hyp(a.px - x, a.pz - z) > 1.2 || a.stuck > 0.8))) { a.path = W.path(e.x, e.z, x, z); a.pi = 0; a.px = x; a.pz = z; a.pt = rnd(0.45, 0.8); a.stuck = 0; if (!a.path) a.pt = 1.5; }
  if (!a.path) { halt(e, dt); return false; }
  while (a.pi < a.path.length - 1 && hyp(a.path[a.pi][0] - e.x, a.path[a.pi][1] - e.z) < 0.5) a.pi++;
  const w = a.path[min(a.pi, a.path.length - 1)], tx = w[0], tz = w[1], dd = hyp(tx - e.x, tz - e.z) || 1, sp = min(speed, d * 5 + 0.7);
  if (a.pi >= a.path.length - 1 && dd < 0.3) { halt(e, dt); return true; }
  e.vx = damp(e.vx, (tx - e.x) / dd * sp, 10, dt); e.vz = damp(e.vz, (tz - e.z) / dd * sp, 10, dt);
  const ox = e.x, oz = e.z; stepMove(e, dt);
  if (hyp(e.x - ox, e.z - oz) < sp * dt * 0.25) a.stuck += dt; else a.stuck = max(0, a.stuck - dt);
  return false;
}
function separate() {
  const L = G.soldiers, n = L.length;
  for (let i = 0; i < n; i++) {
    const a = L[i]; if (a.dead || a.down) continue;
    for (let j = i + 1; j < n; j++) {
      const b = L[j]; if (b.dead || b.down) continue; const dx = b.x - a.x, dz = b.z - a.z, rr = a.r + b.r, d2 = dx * dx + dz * dz; if (d2 >= rr * rr) continue;
      const d = sqrt(d2) || 0.01, o = (rr - d) / d, wa = a === G.player ? 0.12 : b === G.player ? 0.88 : 0.5;
      a.x -= dx * o * wa; a.z -= dz * o * wa; b.x += dx * o * (1 - wa); b.z += dz * o * (1 - wa);
    }
  }
}
function nearSolid(x, z) { return W.isBlocked(x + 1, z) || W.isBlocked(x - 1, z) || W.isBlocked(x, z + 1) || W.isBlocked(x, z - 1); }
function pickSpot(e, tx, tz, hide, pref) {
  let best = null, bs = -1e9;
  for (let i = 0; i < 14; i++) {
    let x = e.x, z = e.z; if (i) { const a = rnd(TAU), r = rnd(2, 7.5); x += cos(a) * r; z += sin(a) * r; }
    if (W.isBlocked(x, z)) continue;
    const d = hyp(x - tx, z - tz), los = W.los(x, z, tx, tz); let sc = rnd(0.6);
    if (hide) sc += los ? -4 : 5; else { sc += los ? 5 : -3; sc -= abs(d - pref) * 0.45; if (d < 3.5) sc -= 4; }
    if (W.lowCover(x, z, tx, tz)) sc += 2.5; else if (nearSolid(x, z)) sc += 1.2;
    sc -= hyp(x - e.x, z - e.z) * 0.12; if (!i) sc += 0.8;
    for (const o of G.enemies) if (o !== e && !o.dead && hyp(o.x - x, o.z - z) < 1.8) sc -= 2.5;
    if (sc > bs) { bs = sc; best = [x, z]; }
  }
  return best;
}
// ---------- enemy AI ----------
function engage(e, t) {
  const a = e.ai, was = a.st; a.st = 2; a.aimT = (rnd(0.35, 0.7) + (was === 0 ? 0.3 : 0)) * DIFF[G.diff].react; a.rep = 0; a.hide = false; a.path = null;
  for (const o of G.enemies) if (o !== e && !o.dead && o.ai.st < 2 && o.ai.notice <= 0 && hyp(o.x - e.x, o.z - e.z) < 11) { o.ai.notice = rnd(0.3, 0.9); o.ai.nx = t.x; o.ai.nz = t.z; }
  FX.add({ x: e.x, y: 2.25 * e.sc, z: e.z, life: 0.6, s0: 0.2, s1: 0.1, col: [1, 0.25, 0.15], add: 1, a: 1, shape: 2 });
  if (G.time - G.contactT > 9) { G.contactT = G.time; SFX.alert(); const al = G.allies.filter(s => !s.down); if (al.length) HUD.msg(pick(al).name + ': Təmas! Düşmən ' + (abs(t.x - e.x) > abs(t.z - e.z) ? (e.x > t.x ? 'sağda' : 'solda') : (e.z < t.z ? 'qarşıda' : 'arxada')), 2); }
}
function perceive(e) {
  const a = e.ai; let best = null, bd = 1e9, seenBy = false;
  for (const t of G.friends) {
    if (t.dead) continue; const dx = t.x - e.x, dz = t.z - e.z, d = hyp(dx, dz); if (d > 36) continue;
    const los = W.los(e.x, e.z, t.x, t.z); if (los && !t.down) seenBy = true; if (!los || t.down) continue;
    let rng = a.st === 0 ? 16 : 27; if (a.st === 0) { if (t.crouch) rng *= 0.7; if (d > 4.2 && abs(angDiff(e.yaw, atan2(dx, dz))) > 1.0) continue; }
    if (d > rng || d >= bd) continue; best = t; bd = d;
  }
  if (seenBy) a.visT = 0.7;
  if (best) { if (a.st !== 2) engage(e, best); a.tgt = best; a.lkx = best.x; a.lkz = best.z; a.seen = G.time; a.tv = true; a.td = bd; }
  else { a.tv = false; if (a.st === 2 && G.time - a.seen > 2.4) { a.st = 3; a.wait = rnd(3, 5); a.tgt = null; a.path = null; a.burst = 0; } }
}
function updEnemy(e, dt) {
  const a = e.ai, T = ETYPE[e.type], D = DIFF[G.diff];
  if (e.fireCd > 0) e.fireCd -= dt; a.visT -= dt; e.vis = a.visT > 0;
  if (a.notice > 0) { a.notice -= dt; if (a.notice <= 0 && a.st < 2) alertEnemy(e, a.nx, a.nz); }
  a.think -= dt; if (a.think <= 0) { a.think = 0.15 + rnd(0.1); perceive(e); }
  if (e.stun > 0) { e.aiming = false; e.crouch = false; e.sprinting = false; e.vx = damp(e.vx, sin(G.time * 2 + e.seed) * 0.6, 4, dt); e.vz = damp(e.vz, cos(G.time * 1.7 + e.seed) * 0.6, 4, dt); stepMove(e, dt); return; }
  if (e.reloading) { e.relT += dt; if (e.relT >= e.relDur) { e.reloading = false; e.ammo = e.weapon.mag; a.hide = false; a.rep = 0; } }
  else if (e.ammo <= 0) { e.reloading = true; e.relT = 0; e.relDur = e.weapon.reload; a.hide = e.type !== 'heavy'; a.rep = 0; a.burst = 0; }
  const st = a.st; e.sprinting = false;
  if (st === 0) {
    e.aiming = false; e.crouch = false;
    if (a.patrol) {
      const w = a.patrol[a.pIdx];
      if (a.wait > 0) { a.wait -= dt; halt(e, dt); e.yaw = angDamp(e.yaw, e.yaw + sin(G.time * 0.7 + e.seed) * 0.5, 2, dt); }
      else if (seek(e, w[0], w[1], 1.4, dt)) { a.pIdx = (a.pIdx + 1) % a.patrol.length; a.wait = rnd(1.5, 3.5); }
      else if (e.spd > 0.3) e.yaw = angDamp(e.yaw, atan2(e.vx, e.vz), 6, dt);
    } else if (hyp(e.x - a.hx, e.z - a.hz) > 0.8) { seek(e, a.hx, a.hz, 1.7, dt); if (e.spd > 0.3) e.yaw = angDamp(e.yaw, atan2(e.vx, e.vz), 6, dt); }
    else { halt(e, dt); e.yaw = angDamp(e.yaw, a.hyaw + sin(G.time * 0.45 + e.seed * 3) * 0.7, 2.5, dt); }
    return;
  }
  if (st === 1 || st === 3) {
    e.aiming = true; e.crouch = false; const d = hyp(a.lkx - e.x, a.lkz - e.z);
    if (d > 1.6 && !(d < 5 && W.los(e.x, e.z, a.lkx, a.lkz))) { seek(e, a.lkx, a.lkz, T.speed * 0.72, dt); if (e.spd > 0.3) e.yaw = angDamp(e.yaw, atan2(e.vx, e.vz), 7, dt); }
    else { halt(e, dt); a.wait -= dt; e.yaw += sin(G.time * 1.1 + e.seed) * 1.4 * dt; if (a.wait <= 0) { a.st = 0; a.path = null; a.wait = 1; } }
    return;
  }
  // --- combat ---
  const tg = a.tgt, tx = a.lkx, tz = a.lkz, d = hyp(tx - e.x, tz - e.z), want = atan2(tx - e.x, tz - e.z);
  e.yaw = angDamp(e.yaw, want, 11, dt); e.aiming = true; a.nadeCd -= dt;
  let arrived = false;
  if (e.type === 'smg') {
    if (!a.tv || d > 6.5) arrived = seek(e, tx, tz, T.speed, dt);
    else { a.rep -= dt; if (a.rep <= 0) { const s = Math.random() < 0.5 ? 1 : -1, k = rnd(2, 4), px = e.x + cos(want) * s * k - sin(want) * (d - 5) * -0.6, pz = e.z - sin(want) * s * k - cos(want) * (d - 5) * -0.6; const f = W.isBlocked(px, pz) ? [e.x, e.z] : [px, pz]; a.dx = f[0]; a.dz = f[1]; a.rep = rnd(0.7, 1.4); } arrived = seek(e, a.dx, a.dz, T.speed * 0.8, dt); }
    e.crouch = false;
  } else if (e.type === 'heavy') {
    if (!a.tv || d > 9.5) seek(e, tx, tz, T.speed, dt); else halt(e, dt); e.crouch = false;
  } else if (e.type === 'sniper' && !(a.tv && d < 7)) { halt(e, dt); e.crouch = false; }
  else {
    a.rep -= dt;
    if (a.rep <= 0 || (!a.tv && !a.hide && G.time - a.seen > 1.2 && a.rep < 1.5)) {
      const s = pickSpot(e, tx, tz, a.hide, T.pref); if (s) { a.dx = s[0]; a.dz = s[1]; } a.rep = rnd(2.2, 4.5);
      if (a.hide && !e.reloading && e.hp > e.maxHp * 0.3) a.hide = false;
    }
    arrived = seek(e, a.dx, a.dz, T.speed, dt);
    e.crouch = arrived && (e.reloading || a.hide || (a.burst === 0 && a.bcd > 0.25)) && W.lowCover(e.x, e.z, tx, tz);
    if (!a.hide && e.hp < e.maxHp * 0.3 && !a.fled) { a.fled = true; a.hide = true; a.rep = 0; }
    // grenade at a hiding target
    if (e.type === 'rifle' && !a.tv && a.nadeCd <= 0 && G.eNadeT <= 0 && G.time - a.seen > 1.4 && G.time - a.seen < 6 && d > 6 && d < 16 && W.los(e.x, e.z, tx, tz)) {
      throwNade(e, 'frag', tx + rnd(-0.6, 0.6), tz + rnd(-0.6, 0.6)); e.throwT = THROW_T; a.nadeCd = rnd(14, 22); G.eNadeT = 7; HUD.msg('Qumbara! Uzaqlaş!', 2);
    }
  }
  // --- fire control ---
  if (a.tv && tg && !e.reloading && e.ammo > 0 && d < T.range) {
    a.aimT -= dt;
    if (a.aimT <= 0) {
      if (e.type === 'sniper' && d >= 7) {
        if (e.fireCd <= 0) { if (a.laser === 0) SFX.tone(1800, 1800, 0.08, 0.1 * vol3(e.x, e.z), 'square'); a.laser += dt; if (a.laser > 1.3 * D.react + 0.25) { e.acc = D.acc * (tg.rollT > 0 ? 6 : tg.spd > 5 ? 2.5 : 1); shoot(e); a.laser = 0; } }
      } else if (a.burst > 0) {
        if (e.fireCd <= 0 && abs(angDiff(e.yaw, want)) < 0.25) { e.acc = D.acc * (e.spd > 1 ? 1.4 : 1) * (tg.rollT > 0 ? 2.2 : tg.spd > 5 ? 1.35 : 1) * (tg.crouch ? 1.15 : 1) * (d > 16 ? 1.3 : 1); shoot(e); a.burst--; if (!a.burst) a.bcd = rnd(T.pause[0], T.pause[1]) * D.react; }
      } else { a.bcd -= dt; if (a.bcd <= 0) a.burst = (T.burst[0] + Math.random() * (T.burst[1] - T.burst[0] + 1)) | 0; }
    }
  } else { a.laser = max(0, a.laser - dt * 2); if (!a.tv) a.burst = 0; }
}
// ---------- squad AI ----------
function trailPoint(dist) {
  const T = G.trail, p = G.player; let px = p.x, pz = p.z, acc = 0;
  for (let i = T.length - 1; i >= 0; i--) { const d = hyp(T[i][0] - px, T[i][1] - pz); if (acc + d >= dist) { const t = (dist - acc) / (d || 1); return [lerp(px, T[i][0], t), lerp(pz, T[i][1], t)]; } acc += d; px = T[i][0]; pz = T[i][1]; }
  return [px, pz];
}
function updAlly(s, i, dt) {
  const p = G.player;
  if (s.fireCd > 0) s.fireCd -= dt;
  if (s.down) {
    s.vx = s.vz = 0; s.downT = (s.downT || 0) + dt;
    if (s.downT > 22 && !G.enemies.some(e => !e.dead && e.ai.st === 2 && hyp(e.x - s.x, e.z - s.z) < 14)) { s.down = false; s.hp = 45; s.rev = 0; s.downT = 0; HUD.msg(s.name + ' özünə gəldi', 1); return; }
    if (!p.dead && hyp(p.x - s.x, p.z - s.z) < 1.8) { s.rev += dt; if (s.rev >= 2.2) { s.down = false; s.hp = 60; s.rev = 0; s.downT = 0; HUD.msg(s.name + ' yenidən sıradadır', 1); SFX.pick(); } } else s.rev = max(0, s.rev - dt * 0.6);
    return;
  }
  if (G.time - s.lastHurt > 5 && s.hp < s.maxHp) s.hp = min(s.maxHp, s.hp + 8 * dt);
  s.think -= dt;
  if (s.think <= 0) {
    s.think = 0.2; let best = null, bd = 23;
    for (const e of G.enemies) { if (e.dead) continue; const d = hyp(e.x - s.x, e.z - s.z); if (d < bd && W.los(s.x, s.z, e.x, e.z)) { bd = d; best = e; } }
    if (best && !s.tgt) s.aimT = rnd(0.25, 0.5); s.tgt = best;
  }
  if (s.tgt && s.tgt.dead) s.tgt = null;
  let tx, tz;
  if (G.hold) { tx = s.holdX; tz = s.holdZ; }
  else {
    const f = G.fyaw, ox = i ? 2.1 : -1.9, oz = i ? -1.0 : -0.4, sx = p.x - cos(f) * ox + sin(f) * oz, sz = p.z + sin(f) * ox + cos(f) * oz;
    if (!W.isBlocked(sx, sz) && W.clearLine(p.x, p.z, sx, sz)) { tx = sx; tz = sz; } else { const q = trailPoint(1.3 * (i + 1)); tx = q[0]; tz = q[1]; }
  }
  const d = hyp(tx - s.x, tz - s.z);
  if (d > 0.28) {
    if (d > 7 || !W.clearLine(s.x, s.z, tx, tz)) seek(s, tx, tz, 5.8, dt);
    else { const sp = min(5.9, d * 4.5); s.vx = damp(s.vx, (tx - s.x) / d * sp, 12, dt); s.vz = damp(s.vz, (tz - s.z) / d * sp, 12, dt); stepMove(s, dt); s.ai.path = null; }
  } else halt(s, dt);
  if (d > 16 && !G.hold) { const f = W.freeNear(tx, tz); s.x = f[0]; s.z = f[1]; }      // hopelessly lost: regroup
  const tg = s.tgt; s.crouch = p.crouch && d < 1.2; s.sprinting = !tg && s.spd > 4.9;
  if (tg) {
    const want = atan2(tg.x - s.x, tg.z - s.z); s.yaw = angDamp(s.yaw, want, 12, dt); s.aiming = true;
    if (s.reloading) { s.relT += dt; if (s.relT >= s.relDur) { s.reloading = false; s.ammo = s.weapon.mag; } }
    else if (s.ammo <= 0) { s.reloading = true; s.relT = 0; s.relDur = s.weapon.reload; }
    else {
      s.aimT -= dt;
      if (s.aimT <= 0) {
        if (s.burst > 0) { if (s.fireCd <= 0 && abs(angDiff(s.yaw, want)) < 0.2) { s.acc = 2.8 + (s.spd > 1 ? 1 : 0); shoot(s); s.burst--; if (!s.burst) s.bcd = rnd(0.7, 1.4); } }
        else { s.bcd -= dt; if (s.bcd <= 0) s.burst = 3 + ((Math.random() * 3) | 0); }
      }
    }
  } else {
    if (s.reloading) { s.relT += dt; if (s.relT >= s.relDur) { s.reloading = false; s.ammo = s.weapon.mag; } } else if (s.ammo < 12) { s.reloading = true; s.relT = 0; s.relDur = s.weapon.reload; }
    s.aiming = p.aiming && G.time - p.lastShot < 2; s.burst = 0;
    if (s.spd > 0.6) s.yaw = angDamp(s.yaw, atan2(s.vx, s.vz), 9, dt); else s.yaw = angDamp(s.yaw, p.yaw + (i ? -0.35 : 0.3) * (p.aiming ? 0.3 : 1), 4, dt);
  }
}
// ---------- world entity drawing ----------
function drawEntities(fx, fz, now) {
  for (const b of G.barrels) { if (abs(b.x - fx) > 28 || abs(b.z - fz) > 38) continue; const m = R.add(b.alive ? WEAP.barrel : WEAP.husk, R.CAST); m4trs(m, b.x, 0, b.z, b.x * 3, 0, 0); }
  for (const k of G.pickups) {
    if (k.taken || abs(k.x - fx) > 26 || abs(k.z - fz) > 36) continue;
    const m = R.add(k.t === 'med' ? WEAP.pmed : k.t === 'ammo' ? WEAP.pammo : WEAP.pnade, R.CAST); m4trs(m, k.x, 0.12 + sin(now * 2.4 + k.x) * 0.06, k.z, now * 1.2 + k.z, 0, 0);
    const c = k.t === 'med' ? [1, 0.35, 0.3] : k.t === 'ammo' ? [1, 0.82, 0.25] : [0.5, 0.9, 0.5];
    Q.flat(Q.B, k.x, 0.03, k.z, 0.62, 0.62, 0, c[0], c[1], c[2], 0.35 + 0.15 * sin(now * 4), 4); Q.flat(Q.B, k.x, 0.025, k.z, 0.55, 0.55, 0, c[0], c[1], c[2], 0.1, 0);
  }
  for (const n of G.nades) {
    const m = R.add(n.type === 'frag' ? WEAP.frag : WEAP.flash, R.CAST); m4trs(m, n.x, n.y, n.z, n.rot, n.rot * 1.3, 0);
    if (n.type === 'frag') { const pulse = 0.5 + 0.5 * sin(now * 22); Q.flat(Q.B, n.x, 0.035, n.z, 5.4, 5.4, 0, 1, 0.16, 0.1, n.team === 1 ? 0.55 : 0.28, 4); Q.flat(Q.B, n.x, 0.03, n.z, 5.4, 5.4, 0, 1, 0.1, 0.05, n.team === 1 ? 0.07 : 0.035, 2); Q.bill(Q.B, n.x, n.y + 0.08, n.z, 0.12 + pulse * 0.08, 1, 0.2, 0.1, 0.9, 0); }
  }
  // tracers
  for (const b of G.bullets) {
    if (b.d < b.vis) continue; const L = min(b.d - b.vis, b.team === 0 ? 2.6 : 1.9) + 0.2;
    if (b.expl) { Q.bill(Q.A, b.x, b.y, b.z, 0.09, 0.2, 0.22, 0.2, 1, 2); Q.bill(Q.B, b.x - b.dx * 0.18, b.y, b.z - b.dz * 0.18, 0.16 + Math.random() * 0.06, 1, 0.6, 0.2, 0.95, 0); continue; }
    if (b.sn) { Q.line(Q.B, b.x - b.dx * 6, b.y - b.dy * 6, b.z - b.dz * 6, b.x, b.y, b.z, 0.05, 0.75, 0.9, 1, 0.9); continue; }
    if (b.team === 0) Q.line(Q.B, b.x - b.dx * L, b.y - b.dy * L, b.z - b.dz * L, b.x, b.y, b.z, 0.035, 1, 0.9, 0.55, 0.95);
    else { Q.line(Q.B, b.x - b.dx * L, b.y - b.dy * L, b.z - b.dz * L, b.x, b.y, b.z, 0.045, 1, 0.45, 0.2, 0.95); Q.bill(Q.B, b.x, b.y, b.z, 0.09, 1, 0.6, 0.3, 0.9, 0); }
  }
  // sniper lasers + stun stars + revive rings
  for (const e of G.enemies) {
    if (e.dead) continue; const a = e.ai;
    if (a.laser > 0 && a.tgt) { const m = e.muzzle(_v3, G.frame), t = a.tgt, k = min(1, a.laser / 1.3); Q.line(Q.B, m[0], m[1], m[2], t.x, t.height * 0.62, t.z, 0.02 + k * 0.03, 1, 0.08, 0.05, 0.35 + 0.6 * k * (0.6 + 0.4 * sin(now * 40)), 3); Q.bill(Q.B, t.x, t.height * 0.62, t.z, 0.1 + k * 0.1, 1, 0.1, 0.05, 0.9, 0); }
    if (e.stun > 0 && e.vis) for (let i = 0; i < 3; i++) { const an = now * 5 + i * 2.1; Q.bill(Q.B, e.x + cos(an) * 0.25, 2.05 * e.sc, e.z + sin(an) * 0.25, 0.07, 1, 1, 0.6, 0.9, 0); }
  }
  for (const s of G.allies) if (s.down) { const k = s.rev / 2.2; Q.flat(Q.B, s.x, 0.04, s.z, 0.9, 0.9, 0, 0.3, 0.7, 1, 0.5 + 0.3 * sin(now * 6), 4); if (k > 0) Q.flat(Q.B, s.x, 0.045, s.z, 0.9 * k, 0.9 * k, 0, 0.4, 1, 0.6, 0.45, 2); Q.bill(Q.B, s.x, 1.9, s.z, 0.16, 0.3, 0.7, 1, 0.8 + 0.2 * sin(now * 6), 2); }
  for (let i = 0; i < W.stains.length; i++) { const s = W.stains[i]; if (abs(s[0] - fx) > 30 || abs(s[1] - fz) > 40) continue; Q.flat(Q.D, s[0], 0.011, s[1], s[2], s[3], s[4], 0.05, 0.05, 0.06, s[5], 0); }
}
