// ===== input, HUD, player, camera, menus, main loop =====
const cv = document.getElementById('cv'), $ = id => document.getElementById(id);
const CAM = { tx: 0, tz: 0, view: m4(), proj: m4(), vp: m4(), ivp: m4(), eye: new Float32Array(3), portrait: false };
const SC = { ivp: CAM.ivp, sun: [0.427, 0.854, 0.299], sunC: [0.66, 0.6, 0.5], sky: [0.5, 0.56, 0.66], gnd: [0.4, 0.37, 0.34], fogC: [0.7, 0.78, 0.86], fog: [60, 150], zen: [0.3, 0.5, 0.8], mid: [0.52, 0.68, 0.88], sunG: [1, 0.92, 0.75], cloudC: [1, 1, 1], cloud: 0.7, gr: [1.1, 1.05, 1, 0], gt: [1, 1, 1], lights: [], statics: [], focus: [0, 0], vp: CAM.vp, cam: CAM.eye, time: 0, shR: 30 };
function applyEnv(e) { for (const k of ['sun', 'sunC', 'sky', 'gnd', 'fogC', 'fog', 'zen', 'mid', 'sunG', 'cloudC', 'gr', 'gt']) SC[k] = e[k].slice(); SC.cloud = e.cloud; }

// ---------- settings (kept in this browser only) ----------
const CFG = { snd: 1, vol: 80, sens: 100, cam: 1, q: 0, shake: 1, wx: 1, map: 'poligon', diff: 1, lp: 'rifle', ls: 'shotgun', best: {} };
try { Object.assign(CFG, JSON.parse(localStorage.getItem('mavi-beret-v2') || '{}')); } catch (e) { }
function saveCfg() { try { localStorage.setItem('mavi-beret-v2', JSON.stringify(CFG)); } catch (e) { } }

// ---------- icons ----------
const ICON = {
  rifle: '<path d="M3 15l21-3 2 10-19 5z"/><rect x="24" y="12" width="44" height="9" rx="1"/><rect x="40" y="8" width="16" height="4"/><rect x="68" y="12" width="24" height="8" rx="1"/><rect x="92" y="14.5" width="24" height="3.5"/><path d="M45 21h8l4 13-8 1z"/><path d="M31 21h7l-3 10h-6z"/>',
  smg_p: '<rect x="6" y="14" width="22" height="3"/><rect x="6" y="14" width="3" height="10"/><rect x="28" y="11" width="36" height="11" rx="1"/><rect x="64" y="14" width="22" height="4.5"/><rect x="45" y="22" width="7" height="15"/><path d="M33 22h7l-2 9h-6z"/><rect x="34" y="8" width="10" height="3"/>',
  lmg_p: '<path d="M2 14l20-2 2 10-18 4z"/><rect x="22" y="11" width="52" height="11" rx="1"/><rect x="74" y="14" width="42" height="4"/><rect x="40" y="22" width="18" height="11" rx="1"/><path d="M28 22h7l-3 9h-6z"/><path d="M96 18l-6 16h2l6-16zm4 0l6 16h-2l-6-16z"/><rect x="44" y="7" width="20" height="4"/>',
  sniper_p: '<path d="M2 15l26-3 3 11-24 5z"/><rect x="28" y="13" width="32" height="8" rx="1"/><rect x="60" y="15" width="56" height="3"/><rect x="30" y="4" width="34" height="6" rx="3"/><rect x="40" y="10" width="3" height="3"/><rect x="52" y="10" width="3" height="3"/><path d="M36 21h7l-3 9h-6z"/><rect x="46" y="21" width="6" height="7"/>',
  shotgun: '<path d="M3 16l23-4 2 10-20 5z"/><rect x="26" y="12" width="24" height="9" rx="1"/><rect x="50" y="12" width="64" height="4"/><rect x="52" y="17" width="28" height="5" rx="1"/><path d="M32 21h7l-3 9h-6z"/>',
  pistol: '<rect x="30" y="10" width="54" height="10" rx="1.5"/><rect x="84" y="13" width="6" height="4"/><path d="M38 20h14l-3 16H35z"/><path d="M52 20h8v5h-8z" opacity=".7"/>',
  launcher: '<path d="M4 18l20-4 1 9-18 4z"/><rect x="24" y="14" width="10" height="6"/><circle cx="44" cy="17" r="10"/><rect x="54" y="11" width="56" height="11" rx="2"/><path d="M40 27h7l-2 9h-6z"/><rect x="92" y="6" width="4" height="5"/>',
  boom: '<path d="M60 3l6 10 11-6-3 12 12 2-10 7 8 9-12-1-2 12-8-9-8 9-2-12-12 1 8-9-10-7 12-2-3-12 11 6z"/>'
};
ICON.erifle = ICON.rifle; ICON.smg = ICON.smg_p; ICON.lmg = ICON.lmg_p; ICON.sniper = ICON.sniper_p;
const wsvg = id => '<svg viewBox="0 0 120 40">' + (ICON[id] || ICON.rifle) + '</svg>';
const GICON = {
  frag: '<svg viewBox="0 0 24 24"><ellipse cx="11" cy="15" rx="7" ry="7.5"/><rect x="8.5" y="4.5" width="5" height="4" rx="1"/><path d="M13.5 6h5l1 3h-2l-1-1.5h-3z"/></svg>',
  flash: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="15" rx="2"/><rect x="8.5" y="3" width="7" height="4" rx="1"/><path d="M15.5 4h4l1 2.5h-5z"/></svg>'
};
const TICON = {
  bFire: ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/></svg>', 'ATƏŞ'],
  bRel: ['<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3v5h-5"/></svg>', 'DOLDUR'],
  bSw: ['<svg viewBox="0 0 24 24"><path d="M4 8h14l-4-4M20 16H6l4 4"/></svg>', 'SİLAH'],
  bFr: ['<svg class="f" viewBox="0 0 24 24"><ellipse cx="11" cy="15" rx="7" ry="7.5"/><rect x="8.5" y="4.5" width="5" height="4" rx="1"/><path d="M13.5 6h5l1 3h-2l-1-1.5h-3z"/></svg>', 'QUMBARA'],
  bFl: ['<svg class="f" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="15" rx="2"/><rect x="8.5" y="3" width="7" height="4" rx="1"/><path d="M15.5 4h4l1 2.5h-5z"/></svg>', 'FLAŞ'],
  bCr: ['<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/><path d="M6 4l6 6 6-6" opacity=".5"/></svg>', 'ÇÖMƏL'],
  bRoll: ['<svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 0 1 15-5"/><path d="M20 6v5h-5"/><path d="M4 20h16"/></svg>', 'YUVARLAN'],
  bAds: ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>', 'NİŞAN']
};
const VNAME = { rifle: 'SİLAHLI', smg: 'BASQINÇI', heavy: 'AĞIR PULEMYOTÇU', sniper: 'SNAYPER' };

// ---------- input ----------
const I = { mx: 0, mz: 0, aimYaw: PI, pitch: 0.34, aimX: 0, aimZ: 0, fire: false, fireNew: false, sprint: false, touch: false, keys: {}, pr: {}, mX: innerWidth / 2, mY: innerHeight / 2, ls: { id: -1, ox: 0, oy: 0, x: 0, y: 0 }, lk: { id: -1, x: 0, y: 0 }, mouseFire: false, rmb: false, adsTog: false, ads: false, tFire: false, locked: false, lockFail: false, lastExit: -9999, sens: 0.0024 };
const P_MIN = 0.1, P_MAX = 0.66;
function look(dx, dy) {
  const p = G.player, z = p ? lerp(1, p.weapon.zoom || 1, p.adsW || 0) : 1, k = I.sens * (CFG.sens / 100) * z;
  I.aimYaw -= dx * k; I.pitch = clamp(I.pitch + dy * k * 0.75, P_MIN, P_MAX);
}
function lockPointer() {
  if (I.touch || I.lockFail || I.locked) return;
  if (!cv.requestPointerLock) { I.lockFail = true; lockHint(); return; }
  try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(lockErr); } catch (e) { lockErr(); }
}
function lockErr() { if (performance.now() - I.lastExit > 1600) { I.lockFail = true; lockHint(); } }
function lockHint() { cv.style.cursor = 'crosshair'; if (G.state === 'play') HUD.msg('Siçan kilidi əlçatan deyil: dönmək üçün siçanı ekranın kənarına apar və ya ← → oxlarını işlət', 2); }
document.addEventListener('pointerlockchange', () => { const was = I.locked; I.locked = document.pointerLockElement === cv; if (was && !I.locked) { I.lastExit = performance.now(); I.mouseFire = false; I.rmb = false; if (G.state === 'play' && !I.selfExit) pause(); } I.selfExit = false; });
document.addEventListener('pointerlockerror', lockErr);
addEventListener('keydown', e => { if (!e.repeat) I.pr[e.code] = true; I.keys[e.code] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code) && G.state === 'play') e.preventDefault(); });
addEventListener('keyup', e => { I.keys[e.code] = false; });
addEventListener('blur', () => { I.keys = {}; I.mouseFire = false; I.rmb = false; });
cv.addEventListener('mousemove', e => { I.mX = e.clientX; I.mY = e.clientY; if (G.state === 'play' && !I.touch && (I.locked || I.lockFail)) look(e.movementX || 0, e.movementY || 0); });
cv.addEventListener('mousedown', e => {
  I.mX = e.clientX; I.mY = e.clientY; e.preventDefault();
  if (e.button === 2) { I.rmb = true; if (G.state === 'play' && !I.locked && !I.lockFail && !I.touch) lockPointer(); return; }
  if (G.state === 'play' && !I.locked && !I.lockFail && !I.touch) { lockPointer(); return; }
  if (e.button === 0) { I.mouseFire = true; I.fireNew = true; }
});
addEventListener('mouseup', e => { if (e.button === 0) I.mouseFire = false; else if (e.button === 2) I.rmb = false; });
cv.addEventListener('wheel', e => { if (G.state === 'play') { I.pr.Wheel = true; e.preventDefault(); } }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());
function setTouch() { if (I.touch) return; I.touch = true; document.body.classList.add('touch'); $('tch').style.display = G.state === 'play' ? 'block' : 'none'; HUD.c.tch = undefined; }
function stickEl(el, s, on) { el.classList.toggle('on', on); if (on) { el.style.left = s.ox + 'px'; el.style.top = s.oy + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.margin = '-60px 0 0 -60px'; } el.firstElementChild.style.transform = on ? `translate(${clamp(s.x - s.ox, -50, 50)}px,${clamp(s.y - s.oy, -50, 50)}px)` : ''; }
cv.addEventListener('touchstart', e => {
  setTouch(); e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.clientX < innerWidth * 0.45) { const s = I.ls; if (s.id >= 0) continue; s.id = t.identifier; s.ox = s.x = t.clientX; s.oy = s.y = t.clientY; stickEl($('sL'), s, true); }
    else { const s = I.lk; if (s.id >= 0) continue; s.id = t.identifier; s.x = t.clientX; s.y = t.clientY; }
  }
}, { passive: false });
cv.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const s = I.ls; if (s.id === t.identifier) { s.x = t.clientX; s.y = t.clientY; const dx = s.x - s.ox, dy = s.y - s.oy, d = hyp(dx, dy); if (d > 62) { s.ox += dx / d * (d - 62); s.oy += dy / d * (d - 62); } stickEl($('sL'), s, true); }
    const k = I.lk; if (k.id === t.identifier) { if (G.state === 'play') look((t.clientX - k.x) * 2.1, (t.clientY - k.y) * 1.7); k.x = t.clientX; k.y = t.clientY; }
  }
}, { passive: false });
const tEnd = e => { for (const t of e.changedTouches) { if (I.ls.id === t.identifier) { I.ls.id = -1; stickEl($('sL'), I.ls, false); } if (I.lk.id === t.identifier) I.lk.id = -1; } };
cv.addEventListener('touchend', tEnd); cv.addEventListener('touchcancel', tEnd);
function initTouchButtons() {
  for (const id in TICON) $(id).innerHTML = TICON[id][0] + TICON[id][1] + (id === 'bFr' || id === 'bFl' ? '<b>0</b>' : '');
  for (const [id, code] of [['bRoll', 'Space'], ['bCr', 'KeyC'], ['bRel', 'KeyR'], ['bSw', 'KeyQ'], ['bFr', 'KeyG'], ['bFl', 'KeyF']])
    $(id).addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); I.pr[code] = true; });
  $('bAds').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); I.adsTog = !I.adsTog; $('bAds').classList.toggle('on', I.adsTog); });
  const b = $('bFire'); let px = 0, py = 0, pid = -1;
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); I.tFire = true; I.fireNew = true; pid = e.pointerId; px = e.clientX; py = e.clientY; b.classList.add('on'); try { b.setPointerCapture(pid); } catch (_) { } });
  b.addEventListener('pointermove', e => { if (e.pointerId !== pid) return; if (G.state === 'play') look((e.clientX - px) * 2.1, (e.clientY - py) * 1.7); px = e.clientX; py = e.clientY; });
  const up = e => { if (e.pointerId !== pid) return; pid = -1; I.tFire = false; b.classList.remove('on'); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
}
function readInput(dt) {
  const p = G.player, k = I.keys;
  if (I.touch) {
    const l = I.ls;
    if (l.id >= 0) { I.mx = clamp((l.x - l.ox) / 50, -1, 1); I.mz = clamp((l.y - l.oy) / 50, -1, 1); const m = hyp(I.mx, I.mz); if (m < 0.14) I.mx = I.mz = 0; I.sprint = m > 0.96 && I.mz < -0.7 && !I.tFire; } else { I.mx = I.mz = 0; I.sprint = false; }
    I.fire = I.tFire; I.ads = I.adsTog;
    const t = I.fire ? aimTarget(p, I.aimYaw, 0.18, 30) : null;
    if (t) I.aimYaw += angDiff(I.aimYaw, atan2(t.x - p.x, t.z - p.z)) * (1 - Math.exp(-4.5 * dt));
  } else {
    I.mx = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0); I.mz = (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0);
    I.sprint = !!(k.ShiftLeft || k.ShiftRight); I.fire = I.mouseFire; I.ads = I.rmb;
    let turn = (k.ArrowLeft ? 1 : 0) - (k.ArrowRight ? 1 : 0);
    if (I.lockFail && !I.locked) { const ex = I.mX / innerWidth; if (ex < 0.1) turn += (0.1 - ex) * 18; else if (ex > 0.9) turn -= (ex - 0.9) * 18; }
    I.aimYaw += turn * 2.3 * dt;
  }
  const d = lerp(16, 4.5, (I.pitch - P_MIN) / (P_MAX - P_MIN));
  I.aimX = p.x + sin(I.aimYaw) * d; I.aimZ = p.z + cos(I.aimYaw) * d;
}

// ---------- HUD ----------
const HUD = {
  msgs: [], c: {}, dd: [], ddi: 0, ar: [], vg: 0, wh: 0, hmT: 0, mmT: 0, fl: [], introT: 0,
  init() {
    this.rows = [$('r0'), $('r1'), $('r2')]; this.fills = this.rows.map(r => r.querySelector('.bar i')); this.dd = [...document.querySelectorAll('.dd')]; this.ar = [...document.querySelectorAll('.ar')];
    this.mm = $('mm'); this.mx = this.mm.getContext('2d'); this.bg = document.createElement('canvas');
    $('gfi').innerHTML = GICON.frag + '<b id="gf">3</b><kbd>G</kbd>'; $('gli').innerHTML = GICON.flash + '<b id="gl">2</b><kbd>F</kbd>';
  },
  buildMap() {
    const M = W.map, RC = Object.assign({ out: '#4f6a44', in: '#9a9ea6', b0: '#c9ccd2', b1: '#d9b27c', b2: '#8fa3bd', low: 'rgba(170,176,186,.55)' }, M.radar || {});
    this.rc = RC; const k = 4; this.bg.width = (W.X1 - W.X0) * k; this.bg.height = (W.Z1 - W.Z0) * k;
    const c = this.bg.getContext('2d'); c.fillStyle = RC.in; c.fillRect(0, 0, this.bg.width, this.bg.height);
    for (const b of W.boxes) { if (b.x1 < W.X0 || b.x0 > W.X1 || b.z1 < W.Z0 || b.z0 > W.Z1) continue; c.fillStyle = b.nb ? 'rgba(90,96,104,.6)' : b.h >= 1.5 ? (b.k === 1 ? RC.b1 : b.k === 2 ? RC.b2 : RC.b0) : RC.low; c.fillRect((b.x0 - W.X0) * k, (b.z0 - W.Z0) * k, max(1.5, (b.x1 - b.x0) * k), max(1.5, (b.z1 - b.z0) * k)); }
  },
  set(k, v, f) { if (this.c[k] !== v) { this.c[k] = v; f(v); } },
  msg(t, p) { const el = document.createElement('div'); el.textContent = t; if (p) el.className = 'p' + p; $('ms').appendChild(el); this.msgs.push({ el, t: 3.6 }); while (this.msgs.length > 3) this.msgs.shift().el.remove(); },
  pop(t, p) { const el = document.createElement('div'); el.textContent = t; if (p) el.className = 'p' + p; const box = $('pop'); box.appendChild(el); setTimeout(() => el.remove(), 1450); while (box.children.length > 3) box.firstChild.remove(); },
  feed(a, icon, v, me) {
    const el = document.createElement('div'); if (me) el.className = 'me';
    el.innerHTML = (a ? '<span>' + a + '</span>' : '') + wsvg(icon) + '<span class="v">' + (VNAME[v] || '') + '</span>';
    const box = $('feed'); box.appendChild(el); this.fl.push({ el, t: 4.5 }); while (this.fl.length > 4) this.fl.shift().el.remove();
  },
  intro() { const M = W.map; $('inS').textContent = M.sub.toUpperCase(); $('inT').textContent = M.name; $('inP').textContent = 'Bütün silahlıları zərərsizləşdirin · ' + DIFF[G.diff].n; this.introT = 3.4; },
  marker(kill) { const el = $('hm'); el.className = kill ? 'k' : ''; el.style.transition = 'none'; el.style.opacity = 1; this.hmT = kill ? 0.3 : 0.12; SFX.marker(kill); },
  damage(dx, dz) { const el = this.dd[this.ddi++ % this.dd.length]; el.style.transition = 'none'; const y = CAM.yaw === undefined ? PI : CAM.yaw; el.style.transform = `rotate(${atan2(dx * cos(y) - dz * sin(y), -dx * sin(y) - dz * cos(y))}rad)`; el.style.opacity = 1; el.t = 0.5; this.vg = min(1, this.vg + 0.5); },
  white(k) { this.wh = max(this.wh, k * 1.6); },
  update(dt) {
    const p = G.player, play = G.state === 'play' || G.state === 'dead' || G.state === 'won';
    this.set('hud', play, v => $('hud').style.display = v ? 'block' : 'none'); if (I.touch) this.set('tch', G.state === 'play', v => $('tch').style.display = v ? 'block' : 'none'); if (!play) return;
    for (let i = this.msgs.length - 1; i >= 0; i--) { const m = this.msgs[i]; m.t -= dt; if (m.t < 0.4) m.el.style.opacity = max(0, m.t / 0.4); if (m.t <= 0) { m.el.remove(); this.msgs.splice(i, 1); } }
    for (let i = this.fl.length - 1; i >= 0; i--) { const m = this.fl[i]; m.t -= dt; if (m.t < 0.4) m.el.style.opacity = max(0, m.t / 0.4); if (m.t <= 0) { m.el.remove(); this.fl.splice(i, 1); } }
    [p, G.allies[0], G.allies[1]].forEach((s, i) => { const f = max(0, Math.round(s.hp / s.maxHp * 50) * 2); this.set('h' + i, f, v => this.fills[i].style.width = v + '%'); this.set('c' + i, (i === 0 ? 'row me' : 'row') + (s.down ? ' dn' : s.hp < 35 ? ' low' : ''), v => this.rows[i].className = v); });
    const hpv = max(0, Math.ceil(p.hp)); this.set('hpn', hpv, v => { $('hpn').textContent = v; $('hp').querySelector('.hb i').style.width = v + '%'; $('hp').classList.toggle('low', v < 35); });
    const sl = p.inv[p.cur];
    this.set('slots', p.inv[0].w.id + '|' + p.inv[1].w.id, () => { for (let i = 0; i < 2; i++) $('sl' + i).innerHTML = wsvg(p.inv[i].w.id) + '<kbd>' + (i + 1) + '</kbd>'; });
    this.set('cur', p.cur, v => { $('sl0').classList.toggle('on', v === 0); $('sl1').classList.toggle('on', v === 1); });
    this.set('an', p.ammo, v => { $('amn').textContent = v; $('amn').style.color = v <= sl.w.mag * 0.25 ? '#ff7a5c' : '#fff'; });
    this.set('ar', sl.res, v => $('amr').textContent = '/ ' + (v === Infinity ? '∞' : v));
    this.set('aw', p.reloading ? 'DOLDURULUR…' : sl.w.name, v => $('wname').textContent = v);
    this.set('gf', p.frag, v => { $('gf').textContent = v; $('gfi').classList.toggle('zero', !v); const b = $('bFr').querySelector('b'); if (b) b.textContent = v; $('bFr').classList.toggle('zero', !v); });
    this.set('gl', p.flashN, v => { $('gl').textContent = v; $('gli').classList.toggle('zero', !v); const b = $('bFl').querySelector('b'); if (b) b.textContent = v; $('bFl').classList.toggle('zero', !v); });
    this.set('ec', G.left, v => $('ec').textContent = v); this.set('wv', G.wave, v => $('wv').textContent = v > 1 ? 'DALĞA ' + v : '');
    this.set('mapn', W.map.name, v => $('mapn').textContent = v); this.set('scv', G.score, v => $('scv').textContent = v);
    let zn = 0; for (let i = 1; i < W.zones.length; i++) { const r = W.zones[i].r; if (r && p.x >= r[0] && p.x <= r[2] && p.z >= r[1] && p.z <= r[3]) { zn = i; break; } }
    this.set('zn', W.map.id + zn, () => $('zn').textContent = W.zones[zn].n);
    this.set('sq', G.hold, v => { $('sq').textContent = v ? 'DƏSTƏ: GÖZLƏ' : 'DƏSTƏ: İZLƏ'; $('sq').classList.toggle('h', v); });
    this.vg = max(0, this.vg - dt * 1.6); const low = p.hp < 35 && !p.dead ? 0.25 + 0.18 * sin(G.time * 5) : 0; $('vg').style.opacity = max(this.vg * 0.9, low).toFixed(2);
    this.wh = max(0, this.wh - dt * 0.75); $('wh').style.opacity = min(1, this.wh).toFixed(2);
    for (const d of this.dd) if (d.t > 0) { d.t -= dt; if (d.t <= 0) { d.style.transition = 'opacity .5s'; d.style.opacity = 0; } }
    if (this.hmT > 0) { this.hmT -= dt; if (this.hmT <= 0) { const el = $('hm'); el.style.transition = 'opacity .22s'; el.style.opacity = 0; } }
    if (this.introT > 0) { this.introT -= dt; $('intro').style.opacity = this.introT > 3.0 ? (3.4 - this.introT) / 0.4 : this.introT < 0.8 ? max(0, this.introT / 0.8) : 1; }
    // crosshair / scope
    const x = $('xh'); let hx = innerWidth / 2, hy = innerHeight / 2;
    if (!p.dead) { const sy = sin(p.yaw), cy = cos(p.yaw), oy = (1.38 - p.cr * 0.36), h = W.ray(p.x + sy * 0.3, oy, p.z + cy * 0.3, sy, 0, cy, 60), t = h ? h.t : 60, q = project(p.x + sy * (0.3 + t), oy, p.z + cy * (0.3 + t)); if (q[2] > 0) { hx = q[0]; hy = q[1]; } }
    const scope = p.weapon.id === 'sniper_p' && p.adsW > 0.7 && !p.dead && G.state === 'play';
    this.set('scope', scope, v => $('scope').style.display = v ? 'block' : 'none');
    this.set('xd', G.state === 'play' && !p.dead && !scope, v => x.style.display = v ? 'block' : 'none'); x.style.transform = `translate(${hx}px,${hy}px)`;
    const g = Math.round((5 + p.bloom * 260 + p.spd * 0.8 + (p.sprinting ? 8 : 0)) * (1 - 0.45 * (p.adsW || 0))); this.set('xg', g, v => { const t = x.children; t[0].style.top = -(v + 8) + 'px'; t[1].style.top = v + 'px'; t[2].style.left = -(v + 8) + 'px'; t[3].style.left = v + 'px'; });
    $('hm').style.transform = `translate(${hx}px,${hy}px)`;
    let rv = null; for (const s of G.allies) if (s.down && s.rev > 0) rv = s;
    this.set('pr', rv ? rv.name + ' ayağa qaldırılır… ' + Math.round(rv.rev / 2.2 * 100) + '%' : '', v => { const el = $('pr'); el.style.display = v ? 'block' : 'none'; el.textContent = v; });
    let ai = 0; const w = innerWidth, h = innerHeight;
    for (const e of G.enemies) {
      if (ai >= this.ar.length) break; if (e.dead || e.ai.st !== 2 || G.time - e.ai.seen > 3.5) continue;
      const q = project(e.x, 1.2, e.z); if (q[2] > 0 && q[0] > 0 && q[0] < w && q[1] > 0 && q[1] < h) continue;
      let dx = (q[0] - w / 2) * (q[2] > 0 ? 1 : -1), dy = (q[1] - h / 2) * (q[2] > 0 ? 1 : -1); const kk = min((w / 2 - 26) / (abs(dx) || 1), (h / 2 - 26) / (abs(dy) || 1));
      const el = this.ar[ai++]; el.style.display = 'block'; el.style.transform = `translate(${w / 2 + dx * kk}px,${h / 2 + dy * kk}px) rotate(${atan2(dx, -dy)}rad)`;
    }
    for (; ai < this.ar.length; ai++) this.ar[ai].style.display = 'none';
    if ((this.mmT -= dt) <= 0) this.radar(p);
  },
  radar(p) {
    this.mmT = 0.05; const c = this.mx, S = this.mm.width, cx = S / 2, cy = S / 2, sc = S / 2 / 24, k = 4, y = CAM.yaw === undefined ? I.aimYaw : CAM.yaw;
    const fx = sin(y), fz = cos(y), rx = -cos(y), rz = sin(y), RP = (X, Z) => { const dx = X - p.x, dz = Z - p.z; return [cx + sc * (dx * rx + dz * rz), cy - sc * (dx * fx + dz * fz)]; };
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, S, S); c.save(); c.beginPath(); c.arc(cx, cy, S / 2 - 2, 0, TAU); c.clip();
    c.fillStyle = this.rc.out; c.fillRect(0, 0, S, S);
    c.setTransform(sc * rx / k, -sc * fx / k, sc * rz / k, -sc * fz / k, cx + sc * (rx * (W.X0 - p.x) + rz * (W.Z0 - p.z)), cy - sc * (fx * (W.X0 - p.x) + fz * (W.Z0 - p.z)));
    c.drawImage(this.bg, 0, 0); c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, S / 2, -PI / 2 - 0.5, -PI / 2 + 0.5); c.closePath(); c.fill();
    const dot = (X, Z, r, col) => { const q = RP(X, Z); c.fillStyle = col; c.beginPath(); c.arc(q[0], q[1], r, 0, TAU); c.fill(); };
    for (const q of G.pickups) if (!q.taken) dot(q.x, q.z, 2.8, q.t === 'med' ? '#ff6b5c' : q.t === 'ammo' ? '#f1c55b' : '#5fd07c');
    for (const b of G.barrels) if (b.alive) dot(b.x, b.z, 2.2, '#ff9a3c');
    for (const e of G.enemies) { if (e.dead) continue; if (!(e.vis || (e.ai.st === 2 && G.time - e.ai.seen < 4))) continue; dot(e.x, e.z, e.type === 'heavy' ? 5.5 : 4.2, '#ff3b2b'); }
    for (const s2 of G.allies) dot(s2.x, s2.z, 4.2, s2.down ? '#ffb347' : '#5fb4ff');
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cx, cy - 8); c.lineTo(cx + 6, cy + 6); c.lineTo(cx, cy + 3); c.lineTo(cx - 6, cy + 6); c.closePath(); c.fill();
    c.restore(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, S / 2 - 2, 0, TAU); c.stroke();
  }
};
function project(x, y, z) { const m = CAM.vp, w = m[3] * x + m[7] * y + m[11] * z + m[15], iw = 1 / (abs(w) || 1e-6); return [((m[0] * x + m[4] * y + m[8] * z + m[12]) * iw * 0.5 + 0.5) * innerWidth, (0.5 - (m[1] * x + m[5] * y + m[9] * z + m[13]) * iw * 0.5) * innerHeight, w]; }

// ---------- player ----------
function updPlayer(dt) {
  const p = G.player, P = I.pr; if (p.fireCd > 0) p.fireCd -= dt; if (p.rollCd > 0) p.rollCd -= dt; if (p.swapT > 0) p.swapT -= dt;
  if (G.time - p.lastShot > 0.14) p.bloom = damp(p.bloom, 0, 7, dt);
  p.adsW = damp(p.adsW || 0, I.ads && p.rollT <= 0 && p.swapT <= 0 && !p.sprinting && p.throwT <= 0 ? 1 : 0, 12, dt);
  p.yaw = angDamp(p.yaw, I.aimYaw, I.touch ? 16 : 30, dt);
  let lx = I.mx, lz = I.mz; const ml = hyp(lx, lz); if (ml > 1) { lx /= ml; lz /= ml; }
  const cyw = I.aimYaw, mx = -cos(cyw) * lx - sin(cyw) * lz, mz = sin(cyw) * lx - cos(cyw) * lz;
  if (p.rollT > 0) {
    p.rollT -= dt; const sp = 9.6 * (0.45 + 0.55 * max(0, p.rollT / ROLL_T)); p.vx = sin(p.rollYaw) * sp; p.vz = cos(p.rollYaw) * sp; stepMove(p, dt);
    if (p.rollT <= 0) FX.puff(p.x, p.z, 2, 0.5);
  } else {
    p.sprinting = I.sprint && ml > 0.6 && lz < -0.3 && !I.fire && !I.ads && !p.crouch && !p.reloading && p.throwT <= 0;
    const sp = (p.crouch ? 1.9 : p.sprinting ? 6.2 : (I.fire || G.time - p.lastShot < 0.3) ? 3.1 : 4.3) * (p.weapon.mob || 1) * (1 - 0.4 * p.adsW);
    p.vx = damp(p.vx, mx * sp, 14, dt); p.vz = damp(p.vz, mz * sp, 14, dt); stepMove(p, dt);
    if (P.Space && p.rollCd <= 0) { p.rollT = ROLL_T; p.rollYaw = ml > 0.2 ? atan2(mx, mz) : p.yaw; p.rollCd = 1.0; p.crouch = false; p.reloading = false; SFX.roll(); FX.puff(p.x, p.z, 2, 0.5); }
  }
  if (P.KeyC || P.ControlLeft) { p.crouch = !p.crouch; $('bCr').classList.toggle('on', p.crouch); }
  const slot = p.inv[p.cur], w = slot.w, free = p.rollT <= 0 && p.swapT <= 0;
  const want = P.KeyQ || P.Wheel ? p.cur ^ 1 : P.Digit1 ? 0 : P.Digit2 ? 1 : -1;
  if (want >= 0 && want !== p.cur && free && p.throwT <= 0) { slot.ammo = p.ammo; p.cur = want; p.weapon = p.inv[p.cur].w; p.ammo = p.inv[p.cur].ammo; p.swapT = p.weapon.pistol ? 0.28 : 0.42; p.reloading = false; p.aimW = 0; p.bloom = 0; SFX.reload(0); return; }
  if (p.reloading) {
    p.relT += dt;
    if (w.shellLoad) { if (p.relT >= p.relDur) { p.ammo++; slot.res--; SFX.reload(1); if (p.ammo < w.mag && slot.res > 0 && !I.fire) p.relT = 0; else { p.reloading = false; if (!w.expl) { SFX.pump(); p.pumpT = 0.42; } } } }
    else {
      const r = p.relT / p.relDur;
      if (p.relSt === 0 && r > 0.2) { p.relSt = 1; SFX.reload(0); FX.add({ x: p.x + sin(p.yaw) * 0.35, y: 1.15, z: p.z + cos(p.yaw) * 0.35, vx: rnd(-0.5, 0.5), vy: 0.3, vz: rnd(-0.5, 0.5), life: 1.6, s0: 0.05, col: [0.12, 0.12, 0.13], grav: 12, bounce: 0.25, shape: 3 }); }
      if (p.relSt === 1 && r > 0.66) { p.relSt = 2; SFX.reload(1); }
      if (r >= 1) { const n = min(w.mag - p.ammo, slot.res); p.ammo += n; if (slot.res !== Infinity) slot.res -= n; p.reloading = false; SFX.reload(2); }
    }
  } else if (((P.KeyR && p.ammo < w.mag) || (p.ammo <= 0 && G.time - p.lastShot > 0.25)) && slot.res > 0 && free && p.throwT <= 0) { p.reloading = true; p.relT = 0; p.relDur = w.reload; p.relSt = 0; }
  if (I.fire && free && p.throwT <= 0) {
    if (p.reloading && w.shellLoad && p.ammo > 0) p.reloading = false;
    if (!p.reloading && p.fireCd <= 0 && (w.auto || I.fireNew || I.touch)) { if (p.ammo > 0) shoot(p); else if (I.fireNew && slot.res <= 0) { SFX.reload(0); HUD.msg('Sursat bitdi — silahı dəyiş', 2); } }
  }
  I.fireNew = false;
  p.aiming = (I.fire || I.ads || G.time - p.lastShot < 1.5 || G.near) && !p.sprinting && p.swapT <= 0;
  if (p.nadeT > 0) { p.nadeT -= dt; if (p.nadeT <= 0) throwNade(p, p.nadeType, p.nadeX, p.nadeZ); }
  const fr = P.KeyG && p.frag > 0, fl = P.KeyF && p.flashN > 0;
  if ((fr || fl) && p.throwT <= 0 && free) {
    let tx = I.aimX, tz = I.aimZ;
    const t = aimTarget(p, p.yaw, 0.16, 17); if (t && W.los(p.x, p.z, t.x, t.z)) { tx = t.x; tz = t.z; }
    let dx = tx - p.x, dz = tz - p.z, d = hyp(dx, dz) || 1; const dc = clamp(d, 3.5, 17); tx = p.x + dx / d * dc; tz = p.z + dz / d * dc;
    p.throwT = THROW_T; p.nadeT = THROW_T * 0.62; p.nadeType = fr ? 'frag' : 'flash'; p.nadeX = tx; p.nadeZ = tz; if (fr) p.frag--; else p.flashN--; p.reloading = false;
  }
  if (G.time - p.lastHurt > 6 && p.hp < 50) p.hp = min(50, p.hp + 6 * dt);
  if (p.spd > 1.2) G.fyaw = angDamp(G.fyaw, atan2(p.vx, p.vz), 2.5, dt);
  if (P.KeyE) toggleHold();
  const T = G.trail, l = T[T.length - 1]; if (hyp(l[0] - p.x, l[1] - p.z) > 0.35) { T.push([p.x, p.z]); if (T.length > 70) T.shift(); }
  for (let i = G.cp + 1; i < W.checkpoints.length; i++) { const c = W.checkpoints[i]; if (hyp(c.x - p.x, c.z - p.z) < 4.5) { G.cp = i; HUD.msg('Yoxlama nöqtəsi yadda saxlanıldı', 1); } }
  if (p.step !== p.lastStep) { p.lastStep = p.step; SFX.step(p.sprinting ? 1.5 : p.crouch ? 0.4 : 0.9); if (p.sprinting) FX.puff(p.x, p.z, 1, 0.3); }
}
function toggleHold() { G.hold = !G.hold; for (const s of G.allies) { s.holdX = s.x; s.holdZ = s.z; } HUD.msg(G.hold ? 'Dəstə: mövqeni saxlayır' : 'Dəstə: səni izləyir', 1); SFX.ui(); }
function respawn() {
  const c = W.checkpoints[G.cp], p = G.player; p.dead = false; p.dT = 0; p.fallA = 0; p.hp = 100; p.x = p.px = c.x; p.z = p.pz = c.z; p.vx = p.vz = 0; p.rollT = 0; p.reloading = false; p.crouch = false; p.lastHurt = G.time;
  for (const sl of p.inv) sl.res = max(sl.res, Math.ceil(sl.w.res * 0.6)); p.frag = max(p.frag, 2); p.flashN = max(p.flashN, 1); p.ammo = p.inv[p.cur].w.mag;
  G.allies.forEach((s, i) => { s.down = false; s.hp = 100; const f = W.freeNear(c.x + (i ? 0.9 : -0.9), c.z + 1.2 * (i + 1)); s.x = s.px = f[0]; s.z = s.pz = f[1]; s.tgt = null; s.ai.path = null; });
  G.trail.length = 0; G.trail.push([c.x, c.z + 2], [c.x, c.z]); G.hold = false;
  for (const e of G.enemies) if (!e.dead && e.ai.st !== 0) { e.ai.st = 3; e.ai.wait = 1; e.ai.tgt = null; e.ai.burst = 0; e.ai.laser = 0; e.ai.path = null; }
  G.bullets.length = 0; G.nades.length = 0; G.state = 'play'; HUD.vg = 0; HUD.msg('Yoxlama nöqtəsindən davam', 1); G.score = max(0, G.score - 150);
}

// ---------- camera ----------
function updCamera(dt, now) {
  const asp = cv.width / cv.height, por = asp < 1; CAM.portrait = por; let ex, ey, ez, lx, ly, lz, fov;
  if (G.state === 'menu') {
    const st = W.start, fx = sin(st.yaw), fz = cos(st.yaw), rx = -cos(st.yaw), rz = sin(st.yaw), t = now * 0.22;
    lx = st.x - rx * 0.2 - fx * 1.0; lz = st.z - rz * 0.2 - fz * 1.0; ly = 1.12;
    const ro = 4.85 + sin(t) * 0.9, fo = 5.4 + cos(t) * 0.5; ex = st.x + rx * ro + fx * fo; ez = st.z + rz * ro + fz * fo; ey = 2.7 + sin(t * 0.7) * 0.25;
    if (por) { ex = st.x + rx * 3.2 + fx * 7.8; ez = st.z + rz * 3.2 + fz * 7.8; ey = 3.6; ly = 0.2; }
    else { let qx = lx - ex, qz = lz - ez; const ql = hyp(qx, qz) || 1; qx /= ql; qz /= ql; lx += qz * 1.7; lz -= qx * 1.7; }
    fov = por ? min(1.25, 2 * Math.atan(Math.tan(0.36) / asp)) : 0.7; CAM.tx = lx; CAM.tz = lz;
  } else {
    // stable third-person camera: smoothed follow + pitch, continuous collision pull-in (no pitch popping, no instant snaps)
    const p = G.player, w = p.weapon, aw = p.adsW || 0;
    if (CAM.yaw === undefined) { CAM.yaw = I.aimYaw; CAM.pit = I.pitch; CAM.px = p.x; CAM.pz = p.z; CAM.ph = 1.62; CAM.cd = -1; CAM.lift = 0; }
    if (!p.dead) CAM.yaw = angDamp(CAM.yaw, I.aimYaw, I.touch ? 20 : 30, dt);
    CAM.pit = damp(CAM.pit, I.pitch, 20, dt);
    CAM.px = damp(CAM.px, p.x, 13, dt); CAM.pz = damp(CAM.pz, p.z, 13, dt); if (hyp(CAM.px - p.x, CAM.pz - p.z) > 4) { CAM.px = p.x; CAM.pz = p.z; }
    CAM.ph = damp(CAM.ph, p.dead ? 1.1 : lerp(1.62, 1.22, p.cr || 0), 7, dt);
    const y = CAM.yaw, fx = sin(y), fz = cos(y), rx = -cos(y), rz = sin(y), sh = lerp(por ? 0.3 : 0.6, por ? 0.5 : 0.78, aw);
    const D0 = (por ? 8.4 : 6.6) * [0.8, 1, 1.24][CFG.cam], a0 = por ? 2.6 : 2.4, ahead = lerp(a0, 9, aw), pit = lerp(CAM.pit, 0.03 + (CAM.pit - P_MIN) * 0.12, aw) + CAM.lift;
    const behind = lerp(cos(CAM.pit) * D0 - a0, 2.5, aw), D = (ahead + behind) / cos(pit);
    lx = CAM.px + fx * ahead + rx * sh; ly = (CAM.ph - 0.67) + aw * 0.68; lz = CAM.pz + fz * ahead + rz * sh;
    const hx = CAM.px + rx * sh * 0.5, hy = CAM.ph + 0.06, hz = CAM.pz + rz * sh * 0.5;   // pivot: just over the shoulder
    const E = [lx - fx * cos(pit) * D, ly + sin(pit) * D, lz - fz * cos(pit) * D];
    let dx = E[0] - hx, dy = E[1] - hy, dz = E[2] - hz; const dl = hyp(dx, dy, dz) || 1; dx /= dl; dy /= dl; dz /= dl;
    // probe the pivot->eye segment with 5 rays (centre + a small box around the lens) so the near plane never enters walls
    const ux = -dy * fx, uz = -dy * fz, uy = cos(pit);   // approximate camera up
    let f = 1;
    for (let i = 0; i < 5; i++) {
      const ox = i === 1 ? rx * 0.32 : i === 2 ? -rx * 0.32 : i === 3 ? ux * 0.22 : i === 4 ? -ux * 0.22 : 0;
      const oy = i === 3 ? uy * 0.22 : i === 4 ? -uy * 0.22 : 0, oz = i === 1 ? rz * 0.32 : i === 2 ? -rz * 0.32 : i === 3 ? uz * 0.22 : i === 4 ? -uz * 0.22 : 0;
      const tx = E[0] + ox - hx, ty = E[1] + oy - hy, tz = E[2] + oz - hz, tl = hyp(tx, ty, tz) || 1;
      const h = W.ray(hx, hy, hz, tx / tl, ty / tl, tz / tl, tl + 0.3);
      if (h) f = min(f, max(0, (h.t - 0.3) / tl));
    }
    const wantD = clamp(dl * f, 1.35, dl);
    if (CAM.cd < 0) CAM.cd = wantD;
    CAM.cd = wantD < CAM.cd ? damp(CAM.cd, wantD, 16, dt) : damp(CAM.cd, wantD, 3.2, dt);
    CAM.lift = damp(CAM.lift, (1 - CAM.cd / dl) * 0.32 * (1 - aw), 6, dt);   // gentle, continuous rise when a wall pushes the camera in
    const sk = CFG.shake ? 1 : 0; ex = hx + dx * CAM.cd + FX.sx * 0.5 * sk; ey = max(0.45, hy + dy * CAM.cd + abs(FX.sz) * 0.3 * sk); ez = hz + dz * CAM.cd + FX.sz * 0.5 * sk;
    fov = (por ? min(1.42, 2 * Math.atan(Math.tan(0.6) / asp)) : 0.98) * lerp(1, w.zoom || 1, aw);
    CAM.tx = CAM.px + fx * 13; CAM.tz = CAM.pz + fz * 13;
  }
  if (CAM.thumb) { ex = CAM.thumb.e[0]; ey = CAM.thumb.e[1]; ez = CAM.thumb.e[2]; lx = CAM.thumb.l[0]; ly = CAM.thumb.l[1]; lz = CAM.thumb.l[2]; fov = 0.9; CAM.tx = lx; CAM.tz = lz; }
  const dbg = window.__mb && window.__mb.dbgCam; if (dbg) { ex = dbg[0]; ey = dbg[1]; ez = dbg[2]; lx = dbg[3]; ly = dbg[4]; lz = dbg[5]; fov = dbg[6] || fov; CAM.tx = lx; CAM.tz = lz; }
  CAM.eye[0] = ex; CAM.eye[1] = ey; CAM.eye[2] = ez;
  m4persp(CAM.proj, fov, asp, G.state === 'menu' || CAM.thumb ? 0.5 : 0.25, 260); m4look(CAM.view, ex, ey, ez, lx, ly, lz, 0, 1, 0); m4mul(CAM.vp, CAM.proj, CAM.view); m4inv(CAM.ivp, CAM.vp);
  if (CAM.thumb) { SC.focus[0] = lx; SC.focus[1] = lz; SC.shR = 46; }
  else if (G.state === 'menu') { SC.focus[0] = CAM.tx; SC.focus[1] = CAM.tz; SC.shR = 16; }
  else { SC.focus[0] = CAM.px + sin(CAM.yaw) * 12; SC.focus[1] = CAM.pz + cos(CAM.yaw) * 12; SC.shR = 28; }
}

// ---------- loop ----------
let last = 0, fAvg = 16, qTimer = 0, lastDt = 0.016;
function update(dt, now) {
  G.time += dt; G.frame++;
  const p = G.player;
  if (G.state === 'play') {
    G.stats.t += dt; if (window.__mb.bot) window.__mb.bot(); else readInput(dt);
    let near = false; for (const e of G.enemies) if (!e.dead && e.vis && hyp(e.x - p.x, e.z - p.z) < 17) { near = true; break; } G.near = near;
    updPlayer(dt);
  } else { p.vx = p.vz = 0; p.aiming = false; }
  if (G.eNadeT > 0) G.eNadeT -= dt;
  G.allies.forEach((s, i) => updAlly(s, i, dt));
  for (const e of G.enemies) if (!e.dead) updEnemy(e, dt);
  separate(); for (const s of G.soldiers) if (!s.dead && !s.down) W.collide(s, s.r);
  updateBullets(dt); updateNades(dt); updateBarrels(dt); if (G.state === 'play') updatePickups(dt);
  for (const s of G.soldiers) s.anim(dt, now);
  FX.update(dt);
  if (G.state === 'play' && G.left <= 0) { G.state = 'won'; G.endT = 0; }
  if (G.state === 'dead') { G.deadT += dt; if (G.deadT > 1.5 && !$('dead').classList.contains('on')) { $('dSc').textContent = G.score; $('dK').textContent = G.stats.kills; show('dead'); } }
  if (G.state === 'won') { G.endT += dt; if (G.endT > 1.8 && !$('win').classList.contains('on')) showWin(); }
  I.pr = {};
}
function render(now) {
  R.begin(); updCamera(lastDt, now); Q.cam(CAM.view, CAM.eye);
  const fx = CAM.tx, fz = CAM.tz, menu = G.state === 'menu', E = CAM.eye, vfx = CAM.view[2], vfz = CAM.view[10];
  if (!CAM.thumb) {
    for (const s of G.soldiers) {
      if (s.team === 1 && !menu && !s.vis && !s.dead) continue;
      const dx = s.x - E[0], dz = s.z - E[2], d2 = dx * dx + dz * dz;
      if (menu) { if (abs(s.x - fx) > 27 || abs(s.z - fz) > 30) continue; }
      else { if (d2 > 4900 || -(dx * vfx + dz * vfz) < -1.5) continue; if (s.team === 0 && s !== G.player && d2 < 6.25) continue; /* allies right at the lens would block the view */ }
      s.draw(now, G.frame);
    }
    drawEntities(fx, fz, now); FX.draw(fx, fz);
    if (CFG.wx && W.map.weather) { const p = G.player, cx = menu ? W.start.x : p.x + sin(CAM.yaw || 0) * 7, cz = menu ? W.start.z : p.z + cos(CAM.yaw || 0) * 7; FX.weather(W.map.weather, cx, cz, lastDt); }
    const p = G.player;
    if (!menu && !p.dead && p.aimW > 0.5 && p.rollT <= 0 && !p.reloading && !(p.weapon.id === 'sniper_p' && p.adsW > 0.7)) {
      const m = p.muzzle(_v3, G.frame), sx = sin(p.yaw), cz = cos(p.yaw), h = W.ray(m[0] - sx * 0.6, m[1], m[2] - cz * 0.6, sx, 0, cz, 15), t = (h ? h.t : 15) - 0.6;
      if (t > 0.2) { Q.line(Q.B, m[0], m[1], m[2], m[0] + sx * t, m[1], m[2] + cz * t, 0.012, 1, 0.16, 0.1, 0.34 * p.aimW, 3); if (h) Q.bill(Q.B, m[0] + sx * t, m[1], m[2] + cz * t, 0.05, 1, 0.2, 0.12, 0.8, 0); }
    }
  }
  const Ls = FX.lights; Ls.sort((a, b) => b.k - a.k); SC.lights = CAM.thumb ? [] : Ls.slice(0, 4); SC.time = now;
  R.frame(SC);
}
function frame(t) {
  requestAnimationFrame(frame); const now = t / 1000; let dt = now - last; last = now; if (dt <= 0) return; if (dt > 0.05) dt = 0.05; lastDt = dt;
  R.resize();
  if (I.pr.Escape || I.pr.KeyP) { if (G.state === 'play') pause(); else if (G.state === 'pause' && performance.now() - G.pauseAt > 450) resume(); I.pr.Escape = I.pr.KeyP = false; }
  if (G.state === 'play' || G.state === 'dead' || G.state === 'won') update(dt, now);
  else if (G.state === 'menu') { G.frame++; G.time += dt; for (const s of G.soldiers) s.anim(dt, now); FX.update(dt); I.pr = {}; }
  HUD.update(dt); render(now);
  fAvg = lerp(fAvg, dt * 1000, 0.05);
  if (CFG.q === 0 && G.state === 'play') {
    if (fAvg > 26) { qTimer += dt; if (qTimer > 2 && R.scale > 0.5) { R.scale = max(0.5, R.scale - 0.15); if (R.scale < 0.8 && R.shQ > 1024) R.makeShadow(1024); qTimer = 0; fAvg = 18; } }
    else if (fAvg < 12 && R.scale < (I.touch ? 0.85 : 1)) { qTimer -= dt; if (qTimer < -8) { R.scale = min(I.touch ? 0.85 : 1, R.scale + 0.15); qTimer = 0; } } else qTimer = 0;
  }
}

// ---------- screens / menus ----------
const SCREENS = ['menu', 'maps', 'arsenal', 'settings', 'help', 'pause', 'dead', 'win'];
const UI = { back: 'menu' };
function show(id) { for (const s of SCREENS) $(s).classList.toggle('on', s === id); if (id && I.locked && document.exitPointerLock) { I.selfExit = true; document.exitPointerLock(); } }
function go(id) {
  SFX.init(); SFX.ui();
  if (id === 'maps') renderMaps(); else if (id === 'arsenal') { UI.arBack = $('maps').classList.contains('on') ? 'maps' : 'menu'; renderArsenal(); } else if (id === 'settings') syncSettings(); else if (id === 'menu') renderChips();
  show(id);
}
function pause() { if (G.state !== 'play') return; G.state = 'pause'; G.pauseAt = performance.now(); I.mouseFire = false; I.tFire = false; I.rmb = false; $('pInfo').textContent = W.map.name + ' · ' + DIFF[G.diff].n + ' · Xal: ' + G.score; show('pause'); }
function resume() { G.state = 'play'; show(null); last = performance.now() / 1000; }
function resumeLock() { SFX.ui(); resume(); lockPointer(); }
function loadMap(id) {
  if (!MAPS[id]) id = 'poligon'; buildWorld(id); applyEnv(MAPS[id].env); SC.statics = [W.mesh]; HUD.buildMap();
  G.loadout = { p: CFG.lp, s: CFG.ls }; newGame(CFG.diff); FX.wxType = null; CAM.yaw = undefined;
}
function start() {
  SFX.init(); SFX.ui(); G.loadout = { p: CFG.lp, s: CFG.ls }; newGame(CFG.diff); G.state = 'play'; show(null); lockPointer();
  I.aimYaw = W.start.yaw; I.pitch = 0.34; I.adsTog = false; $('bAds').classList.remove('on'); CAM.yaw = undefined; CAM.tx = G.player.x; CAM.tz = G.player.z;
  HUD.msgs.forEach(m => m.el.remove()); HUD.msgs.length = 0; HUD.fl.forEach(m => m.el.remove()); HUD.fl.length = 0; HUD.c = {}; HUD.intro();
  setTimeout(() => { if (G.state === 'play') HUD.msg('Komandir: ' + W.map.name + ' — əməliyyata icazə verildi', 0); }, 2600);
}
function toMenu() { SFX.ui(); newGame(CFG.diff); G.state = 'menu'; CAM.yaw = undefined; FX.reset(); go('menu'); }
function nextMapId() { return MAP_ORDER[(MAP_ORDER.indexOf(W.map.id) + 1) % MAP_ORDER.length]; }
function showWin() {
  const s = G.stats, acc = s.shots ? Math.round(s.hits / s.shots * 100) : 0, m = floor(s.t / 60), sec = floor(s.t % 60);
  let st = 1; if (s.deaths === 0) st++; if (acc >= 30 && s.t < 660) st++; if (s.deaths > 2) st = 1;
  const id = W.map.id, b = CFG.best[id] || { score: 0, stars: 0 }; const rec = G.score > b.score; CFG.best[id] = { score: max(b.score, G.score), stars: max(b.stars, st) }; saveCfg();
  $('wStars').innerHTML = '★'.repeat(st) + '<i>' + '★'.repeat(3 - st) + '</i>'; $('wT').textContent = m + ':' + (sec < 10 ? '0' : '') + sec; $('wK').textContent = s.kills; $('wA').textContent = acc + '%'; $('wD').textContent = s.deaths;
  $('wSc').textContent = G.score + (rec ? '  ★ REKORD' : ''); $('wBest').textContent = CFG.best[id].score;
  $('wTitle').textContent = G.wave > 1 ? 'DALĞA ' + G.wave + ' DƏF EDİLDİ' : 'ƏRAZİ TƏMİZLƏNDİ'; $('wSub').textContent = W.map.name + ' · ' + DIFF[G.diff].n;
  $('wNext').textContent = 'DALĞA ' + (G.wave + 1); $('wMap').textContent = 'NÖVBƏTİ XƏRİTƏ: ' + MAPS[nextMapId()].name;
  show('win'); SFX.win();
}
const THUMB = {};
function renderMaps() {
  const box = $('mgrid'); box.innerHTML = '';
  for (const id of MAP_ORDER) {
    const M = MAPS[id], b = CFG.best[id], el = document.createElement('div'); el.className = 'mcard' + (CFG.map === id ? ' on' : ''); el.style.setProperty('--c', M.accent);
    const n = M.zones.length;
    el.innerHTML = `<div class="ck">✓</div><div class="im" style="background-image:url(${THUMB[id] || ''})"></div><div class="bd"><h3>${M.name}</h3><div class="sb">${M.sub.toUpperCase()}</div><p>${M.desc}</p><div class="mt"><span>${n} ZONA</span><span class="st">${b ? '★'.repeat(b.stars) + '<i>' + '★'.repeat(3 - b.stars) + '</i>' : '<i>★★★</i>'}</span></div>${b ? `<div class="mt"><span>REKORD</span><span>${b.score}</span></div>` : ''}</div>`;
    el.onclick = () => { if (CFG.map === id) return; SFX.ui(); CFG.map = id; saveCfg(); loadMap(id); renderMaps(); };
    box.appendChild(el);
  }
  for (const bt of $('df').children) bt.classList.toggle('on', +bt.dataset.d === CFG.diff);
  document.documentElement.style.setProperty('--ac', MAPS[CFG.map].accent);
}
function stat(w) {
  const dmg = w.expl ? w.edmg : w.dmg * w.pellets;
  return [['ZƏRƏR', sqrt(min(1, dmg / 150))], ['SÜRƏT', min(1, 1 / w.cd / 15)], ['MƏSAFƏ', min(1, w.range / 75)], ['ÇEVİKLİK', clamp((w.mob - 0.8) / 0.34, 0.05, 1)], ['DARAQ', min(1, w.mag / 80)]];
}
function renderArsenal() {
  const groups = [['rifle', 'smg_p', 'lmg_p', 'sniper_p'], ['shotgun', 'pistol', 'launcher']];
  groups.forEach((ids, gi) => {
    const box = $('wg' + gi); box.innerHTML = '';
    for (const id of ids) {
      const w = WEAP[id], sel = (gi ? CFG.ls : CFG.lp) === id, el = document.createElement('div'); el.className = 'wcard' + (sel ? ' on' : '');
      el.innerHTML = wsvg(id) + `<h4>${w.name}</h4><p>${w.desc}</p><div class="stt">` + stat(w).map(([n, v]) => `<span>${n}</span><div><i style="width:${Math.round(v * 100)}%"></i></div>`).join('') + '</div>';
      el.onclick = () => { SFX.ui(); if (gi) CFG.ls = id; else CFG.lp = id; saveCfg(); renderArsenal(); };
      box.appendChild(el);
    }
  });
}
function renderChips() {
  const M = MAPS[CFG.map]; $('cMap').querySelector('span').textContent = M.name + ' · ' + DIFF[CFG.diff].n; $('cMap').querySelector('i').style.background = M.accent;
  $('cLd').innerHTML = wsvg(CFG.lp) + WEAP[CFG.lp].name + ' + ' + wsvg(CFG.ls) + WEAP[CFG.ls].name;
  document.documentElement.style.setProperty('--ac', M.accent);
}
function applyQuality(init) {
  const q = CFG.q, touch = I.touch;
  if (q === 0) { R.scale = touch ? 0.85 : 1; R.makeShadow(touch ? 1024 : 2048); }
  else { R.scale = [1, 1, 0.8, 0.6][q]; R.makeShadow([2048, 2048, 1536, 1024][q]); }
}
function applySound() { SFX.on = !!CFG.snd; SFX.vol = CFG.vol / 100 * 0.95; if (SFX.out) SFX.out.gain.value = SFX.vol; }
function syncSettings() {
  const segs = { sSnd: 'snd', sCam: 'cam', sQ: 'q', sShk: 'shake', sWx: 'wx' };
  for (const id in segs) for (const b of $(id).children) b.classList.toggle('on', +b.dataset.v === CFG[segs[id]]);
  $('sVol').value = CFG.vol; $('sSens').value = CFG.sens;
}
function screenshot(id) {
  const M = MAPS[id]; CAM.thumb = M.thumb; R.resize(); render(0); CAM.thumb = null;
  const c = document.createElement('canvas'); c.width = 384; c.height = 240; const x = c.getContext('2d'), W_ = cv.width, H_ = cv.height, ar = 384 / 240;
  let sw = W_, sh = W_ / ar; if (sh > H_) { sh = H_; sw = H_ * ar; }
  x.drawImage(cv, (W_ - sw) / 2, (H_ - sh) / 2, sw, sh, 0, 0, 384, 240);
  try { THUMB[id] = c.toDataURL('image/jpeg', 0.86); } catch (e) { THUMB[id] = ''; }
}
function boot() {
  if (!R.init(cv)) { $('err').style.display = 'flex'; $('load').style.display = 'none'; return; }
  if (matchMedia('(pointer:coarse)').matches) setTouch();
  buildWeapons(); for (const k in PAL) KITS[k] = buildKit(PAL[k]); hyApply(); HUD.init(); initTouchButtons();
  if (!WEAP[CFG.lp] || WEAP[CFG.lp].cat !== 0) CFG.lp = 'rifle'; if (!WEAP[CFG.ls] || WEAP[CFG.ls].cat !== 1) CFG.ls = 'shotgun'; if (!MAPS[CFG.map]) CFG.map = 'poligon'; CFG.diff = clamp(CFG.diff | 0, 0, 2);
  applyQuality(); applySound(); G.diff = CFG.diff;
  // UI wiring
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  $('df').addEventListener('click', e => { const d = e.target.dataset.d; if (d === undefined) return; CFG.diff = +d; G.diff = CFG.diff; saveCfg(); renderMaps(); SFX.init(); SFX.ui(); });
  $('go').onclick = start; $('pz').onclick = () => { SFX.ui(); pause(); }; $('pRes').onclick = resumeLock;
  $('pRst').onclick = $('dRst').onclick = start; $('pMenu').onclick = $('dMenu').onclick = $('wMenu').onclick = toMenu;
  $('wNext').onclick = () => { SFX.ui(); show(null); nextWave(); lockPointer(); };
  $('wMap').onclick = () => { const n = nextMapId(); CFG.map = n; saveCfg(); loadMap(n); start(); };
  $('dCont').onclick = () => { SFX.ui(); show(null); respawn(); lockPointer(); };
  $('pSet').onclick = () => { UI.back = 'pause'; go('settings'); };
  $('stBack').onclick = () => { const b = UI.back; UI.back = 'menu'; go(b); };
  document.querySelector('[data-go="settings"]').addEventListener('click', () => { UI.back = 'menu'; });
  $('arBack').onclick = $('arOk').onclick = () => go(UI.arBack || 'menu');
  const seg = (id, key, f) => $(id).addEventListener('click', e => { const v = e.target.dataset.v; if (v === undefined) return; CFG[key] = +v; saveCfg(); syncSettings(); if (f) f(); SFX.init(); SFX.ui(); });
  seg('sSnd', 'snd', applySound); seg('sCam', 'cam'); seg('sQ', 'q', applyQuality); seg('sShk', 'shake'); seg('sWx', 'wx');
  $('sVol').addEventListener('input', e => { CFG.vol = +e.target.value; applySound(); saveCfg(); });
  $('sSens').addEventListener('input', e => { CFG.sens = +e.target.value; saveCfg(); });
  $('sq').onclick = () => { if (G.state === 'play') toggleHold(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.__mb = { G, W, R, I, CAM, FX, HUD, SC, KITS, WEAP, CFG, MAPS, start, respawn, nextWave, loadMap, toMenu, updCamera, render, sim(n) { for (let i = 0; i < n; i++) update(1 / 60, G.time); } };
  // build every map once for its picture, then open the chosen one
  let i = 0; const total = MAP_ORDER.length + 1;
  const step = () => {
    try {
      if (i < MAP_ORDER.length) { const id = MAP_ORDER[i++]; $('lt').textContent = MAPS[id].name + ' HAZIRLANIR'; loadMap(id); G.state = 'menu'; screenshot(id); $('lbi').style.width = (i / total * 100) + '%'; setTimeout(step, 20); return; }
      loadMap(CFG.map); G.state = 'menu'; $('lbi').style.width = '100%';
      setTimeout(() => { $('load').style.display = 'none'; go('menu'); requestAnimationFrame(frame); }, 120);
    } catch (e) { console.error(e); const el = $('err'); el.style.display = 'flex'; el.textContent = 'Xəta: ' + e.message; }
  };
  setTimeout(step, 30);
}
hyLoad().then(() => { try { boot(); } catch (e) { console.error(e); const el = $('err'); el.style.display = 'flex'; el.textContent = 'Xəta: ' + e.message; } });
