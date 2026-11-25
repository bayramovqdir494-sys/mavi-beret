// ===== soldier models, weapons, procedural (IK) animation =====
const KITS = {}, WEAP = {};
const PAL = {
  police: { shirt: hex(0xaab4c2), vest: hex(0x7c8797), vestD: hex(0x667080), pants: hex(0x535a67), belt: hex(0x2a2d33), boot: hex(0x1d1f23), skin: hex(0xefc59d), hair: hex(0xd6a13c), hat: hex(0x6c92c2), gear: hex(0x22252a), hand: hex(0xefc59d), head: 'beret', pads: hex(0x3a3f48), patch: hex(0x3f6ea8) },
  police2: { shirt: hex(0xaab4c2), vest: hex(0x7c8797), vestD: hex(0x667080), pants: hex(0x535a67), belt: hex(0x2a2d33), boot: hex(0x1d1f23), skin: hex(0xe2b188), hair: hex(0x6e4a2a), hat: hex(0x6c92c2), gear: hex(0x22252a), hand: hex(0xe2b188), head: 'beret', pads: hex(0x3a3f48), patch: hex(0x3f6ea8) },
  police3: { shirt: hex(0xaab4c2), vest: hex(0x7c8797), vestD: hex(0x667080), pants: hex(0x535a67), belt: hex(0x2a2d33), boot: hex(0x1d1f23), skin: hex(0xf2cfae), hair: hex(0x35281d), hat: hex(0x6c92c2), gear: hex(0x22252a), hand: hex(0xf2cfae), head: 'beret', pads: hex(0x3a3f48), patch: hex(0x3f6ea8) },
  rifle: { shirt: hex(0x6d7552), vest: hex(0x8c7b56), vestD: hex(0x6e6043), pants: hex(0x4b4539), belt: hex(0x2a241e), boot: hex(0x2b251f), skin: hex(0xe4b48a), mask: hex(0x26282c), gear: hex(0x1f2125), hand: hex(0x26282c), head: 'balaclava' },
  smg: { shirt: hex(0x3d4049), pants: hex(0x2e3137), belt: hex(0x1c1d20), boot: hex(0x191a1d), skin: hex(0xd9a67c), hair: hex(0x241c16), mask: hex(0xb5332a), hat: hex(0x2a2c31), gear: hex(0x1f2125), hand: hex(0x1f2125), head: 'bandana' },
  heavy: { shirt: hex(0x4e5549), vest: hex(0x3a4037), vestD: hex(0x2c312a), pants: hex(0x3a3d36), belt: hex(0x202220), boot: hex(0x1a1b1a), skin: hex(0xdcae86), mask: hex(0x1f2125), hat: hex(0x414839), gear: hex(0x18191b), hand: hex(0x18191b), head: 'helmet', pads: hex(0x2c312a), bulk: 1 },
  sniper: { hair: hex(0x5a4128), shirt: hex(0x8c7d5d), vest: hex(0x6f6347), vestD: hex(0x5a5039), pants: hex(0x6b6049), belt: hex(0x3a3226), boot: hex(0x3a3024), skin: hex(0xe4b48a), mask: hex(0x7a6d50), hat: hex(0x7f7153), gear: hex(0x2a261e), hand: hex(0x2a261e), head: 'boonie' }
};
// per-map enemy outfits
const SKINS = {
  liman: { rifle: { shirt: hex(0x2f3c55), vest: hex(0x3a4250), vestD: hex(0x2c323d), pants: hex(0x2b2f3a), mask: hex(0x1d2026), hand: hex(0x1d2026) },
    smg: { shirt: hex(0x3a3f48), vest: hex(0xe07b28), vestD: hex(0xc9662b), pants: hex(0x2a2f38), mask: hex(0x2f6fb3), hat: hex(0x1f2328) },
    heavy: { shirt: hex(0x2b2f36), vest: hex(0x1f2329), vestD: hex(0x15181c), pants: hex(0x262a30), hat: hex(0x23272d) },
    sniper: { shirt: hex(0x3d4452), vest: hex(0x2c323c), vestD: hex(0x232830), pants: hex(0x2d323c), hat: hex(0x2d323c), mask: hex(0x2d323c) } },
  sehra: { rifle: { shirt: hex(0xb9a27a), vest: hex(0x8a7650), vestD: hex(0x6f5f40), pants: hex(0x9a8562), mask: hex(0xe1d6bd), hand: hex(0xc9a27a) },
    smg: { shirt: hex(0x7a5a3a), pants: hex(0x5a4a38), mask: hex(0xc23b2b), hat: hex(0xe1d6bd), hair: hex(0x241c16) },
    heavy: { shirt: hex(0x9a8a68), vest: hex(0x6f6347), vestD: hex(0x5a5039), pants: hex(0x7a6c52), hat: hex(0xb9a27a), mask: hex(0xe1d6bd) },
    sniper: { shirt: hex(0xc9b48a), vest: hex(0xa8946c), vestD: hex(0x8a7650), pants: hex(0xb3a07a), hat: hex(0xc9b48a), mask: hex(0xe1d6bd) } },
  qis: { rifle: { shirt: hex(0xd9dde2), vest: hex(0xb9bfc6), vestD: hex(0x9aa1aa), pants: hex(0xc9ced4), mask: hex(0xeef0f2), boot: hex(0x3a3f46), hand: hex(0x8a929c) },
    smg: { shirt: hex(0x8a929c), pants: hex(0x6a727c), mask: hex(0xe8eaec), hat: hex(0x5a626c), boot: hex(0x2a2e33) },
    heavy: { shirt: hex(0xc9ced4), vest: hex(0x9aa1aa), vestD: hex(0x80878f), pants: hex(0xb3b9c0), hat: hex(0xe8eaec), mask: hex(0x3a3f46) },
    sniper: { shirt: hex(0xe6e9ec), vest: hex(0xcfd4d9), vestD: hex(0xb3b9c0), pants: hex(0xdfe3e6), hat: hex(0xeef0f2), mask: hex(0xeef0f2), hair: hex(0xd9dde2) } }
};
for (const sk in SKINS) for (const t in SKINS[sk]) PAL[t + '_' + sk] = Object.assign({}, PAL[t], SKINS[sk][t]);
function buildKit(P) {
  const k = {}, dark = hex(0x15171a); let g;
  // pelvis (origin = pelvis centre)
  g = new Geo();
  g.loft([[-0.12, 0.09, 0.065], [-0.075, 0.156, 0.106], [0.02, 0.164, 0.112], [0.07, 0.158, 0.108]], 10, P.pants, 0, null, 1, 1);
  g.loft([[0.03, 0.171, 0.118], [0.078, 0.171, 0.118]], 10, P.belt, 0, null, 1, 1);
  g.box(0.05, 0.17, 0.1, P.gear, 0, null, -0.17, -0.1, 0.01); g.box(0.07, 0.07, 0.035, P.belt, 0, null, 0.1, 0.0, 0.118);
  k.pelvis = R.mesh(g);
  // torso (origin = waist)
  g = new Geo(); const bk = P.bulk ? 1.12 : 1;
  g.loft([[0, 0.148, 0.103], [0.12, 0.162, 0.112], [0.30, 0.198, 0.128], [0.42, 0.212, 0.128], [0.50, 0.185, 0.112], [0.545, 0.085, 0.07]], 12, P.shirt, 0, null, 1, 1);
  if (P.vest) {
    g.loft([[0.07, 0.168 * bk, 0.122 * bk], [0.2, 0.196 * bk, 0.138 * bk], [0.34, 0.222 * bk, 0.146 * bk], [0.44, 0.222 * bk, 0.14 * bk], [0.49, 0.19 * bk, 0.124 * bk]], 12, P.vest, 0, null, 1, 1);
    for (const x of [-0.1, 0, 0.1]) g.box(0.085, 0.11, 0.05, P.vestD, 0, null, x, 0.17, 0.146 * bk);
    g.box(0.07, 0.11, 0.045, P.gear, 0, null, 0.115, 0.385, 0.142 * bk); g.cyl(0.006, 0.006, 0.15, 5, P.gear, 0, TM(0.14, 0.43, 0.142 * bk));
    g.box(0.3, 0.2, 0.05, P.vestD, 0, null, 0, 0.3, -0.142 * bk);
    for (const s of [-1, 1]) g.box(0.06, 0.05, 0.26 * bk, P.vestD, 0, null, s * 0.13, 0.505, 0);
  } else { g.box(0.2, 0.1, 0.03, mulc(P.shirt, 0.8), 0, null, 0, 0.16, 0.112); g.sph(0.1, 0.07, 0.09, 8, 5, mulc(P.shirt, 0.9), 0, TM(0, 0.52, -0.09)); }
  for (const s of [-1, 1]) g.sph(0.08 * bk, 0.078 * bk, 0.08 * bk, 8, 5, P.bulk ? P.vestD : P.shirt, 0, TM(s * 0.215, 0.465, 0));
  g.cyl(0.052, 0.048, 0.1, 8, P.head === 'balaclava' ? P.mask : P.skin, 0, TM(0, 0.525, 0.005), 0, 0);
  k.torso = R.mesh(g);
  // head (origin = head centre)
  g = new Geo(); const H = P.head, eye = () => { for (const s of [-1, 1]) g.sph(0.017, 0.021, 0.012, 6, 4, dark, 0, TM(s * 0.044, 0.014, 0.113)); };
  if (H === 'beret') {
    g.sph(0.115, 0.128, 0.122, 12, 8, P.skin); eye();
    g.sph(0.122, 0.126, 0.129, 12, 6, P.hair, 0, TM(0, 0.016, -0.02), 0.4, 1);
    g.cyl(0.118, 0.12, 0.034, 12, mulc(P.hat, 0.72), 0, TM(0, 0.07, -0.004), 0, 0);
    g.sph(0.166, 0.06, 0.162, 12, 6, P.hat, 0, TM(0.034, 0.124, 0, 0, 0, -0.3));
    g.box(0.032, 0.036, 0.012, hex(0xd9b84a), 0, TM(-0.05, 0.098, 0.116, -0.35));
  } else if (H === 'balaclava') {
    g.sph(0.117, 0.13, 0.124, 12, 8, P.mask); g.box(0.135, 0.038, 0.03, P.skin, 0, null, 0, 0.016, 0.108); for (const s of [-1, 1]) g.sph(0.016, 0.018, 0.012, 6, 4, dark, 0, TM(s * 0.04, 0.016, 0.124));
  } else if (H === 'bandana') {
    g.sph(0.115, 0.128, 0.122, 12, 8, P.skin); eye();
    g.sph(0.12, 0.124, 0.122, 12, 7, P.hair, 0, TM(0, 0.004, -0.018)); g.sph(0.121, 0.078, 0.128, 12, 5, P.mask, 0, TM(0, -0.052, 0.004)); g.box(0.05, 0.1, 0.02, P.mask, 0, TM(0, -0.06, -0.125, 0, 0.3, 0.2));
    g.sph(0.123, 0.1, 0.13, 12, 5, P.hat, 0, TM(0, 0.04, -0.006), 0.5, 1); g.box(0.15, 0.014, 0.1, P.hat, 0, null, 0, 0.048, 0.16);
  } else if (H === 'helmet') {
    g.sph(0.115, 0.128, 0.122, 12, 8, P.skin); g.sph(0.118, 0.118, 0.12, 12, 7, P.mask, 0, TM(0, -0.01, -0.016));
    g.sph(0.142, 0.13, 0.152, 12, 6, P.hat, 0, TM(0, 0.028, -0.01), 0.44, 1); g.cyl(0.145, 0.15, 0.03, 12, mulc(P.hat, 0.8), 0, TM(0, 0.02, -0.01), 0, 0);
    g.box(0.2, 0.075, 0.03, dark, 12, null, 0, 0.004, 0.118); g.sph(0.118, 0.07, 0.126, 12, 5, P.mask, 0, TM(0, -0.06, 0.004));
  } else {
    g.sph(0.115, 0.128, 0.122, 12, 8, P.skin); eye(); g.sph(0.12, 0.124, 0.122, 12, 7, P.hair || P.mask, 0, TM(0, 0.004, -0.018));
    g.sph(0.121, 0.08, 0.128, 12, 5, P.mask, 0, TM(0, -0.055, 0.004));
    g.cyl(0.215, 0.215, 0.014, 14, P.hat, 0, TM(0, 0.055, 0)); g.cyl(0.118, 0.108, 0.085, 12, P.hat, 0, TM(0, 0.062, 0));
  }
  k.head = R.mesh(g);
  // limbs: origin at proximal joint, +Y toward distal joint
  g = new Geo(); g.cap(0.066 * bk, 0.057 * bk, 0.285, 8, P.bulk ? P.vestD : P.shirt, 0); if (P.patch) g.box(0.02, 0.07, 0.06, P.patch, 0, null, 0, 0.09, -0.062);
  k.uarm = R.mesh(g);
  g = new Geo(); g.cap(0.055 * bk, 0.046, 0.24, 8, P.shirt, 0); g.sph(0.05, 0.056, 0.05, 8, 5, P.hand, 0, TM(0, 0.278, 0)); if (P.bulk) g.cyl(0.06, 0.056, 0.16, 8, P.vestD, 0, TM(0, 0.04, 0), 0, 0);
  k.farm = R.mesh(g);
  g = new Geo(); g.cap(0.1 * bk, 0.082 * bk, 0.44, 8, P.pants, 0); k.thigh = R.mesh(g);
  g = new Geo(); g.cap(0.08 * bk, 0.064, 0.44, 8, P.pants, 0); g.cyl(0.072, 0.068, 0.17, 8, P.boot, 0, TM(0, 0.29, 0), 0, 0);
  if (P.pads) g.sph(0.078, 0.075, 0.06, 8, 5, P.pads, 0, TM(0, 0.0, 0.045));
  k.shin = R.mesh(g);
  g = new Geo(); g.box(0.112, 0.09, 0.2, P.boot, 0, null, 0, -0.04, 0.03); g.sph(0.056, 0.045, 0.075, 8, 4, P.boot, 0, TM(0, -0.04, 0.13)); g.box(0.118, 0.022, 0.275, dark, 0, null, 0, -0.079, 0.048);
  k.boot = R.mesh(g);
  return k;
}
function buildWeapons() {
  const dk = hex(0x1d1f23), tan = hex(0x8e7c4c), wood = hex(0x6d4a2c), st = hex(0x4a4f57), zx = (x, y, z, p) => TM(x, y, z, 0, p === undefined ? PI / 2 : p, 0);
  let g = new Geo();          // assault rifle (player/ally: tan like the reference)
  const rifle = (c1, c2) => {
    const g = new Geo();
    g.box(0.046, 0.076, 0.34, c1, 0, null, 0, 0.03, 0.1); g.box(0.042, 0.06, 0.2, c1, 0, null, 0, 0.024, 0.365);
    g.cyl(0.013, 0.013, 0.26, 6, c2, 12, zx(0, 0.036, 0.44)); g.cyl(0.018, 0.018, 0.05, 6, c2, 12, zx(0, 0.036, 0.67));
    g.box(0.012, 0.034, 0.012, c2, 0, null, 0, 0.076, 0.66); g.box(0.03, 0.022, 0.05, c2, 0, null, 0, 0.08, 0.2);
    g.box(0.04, 0.1, 0.046, c2, 0, TM(0, -0.055, 0.0, 0, 0.25, 0)); g.box(0.033, 0.18, 0.062, c2, 0, TM(0, -0.09, 0.155, 0, -0.3, 0));
    g.box(0.04, 0.062, 0.25, c1, 0, TM(0, 0.0, -0.19, 0, 0.1, 0)); g.box(0.046, 0.115, 0.03, c2, 0, null, 0, -0.02, -0.315);
    return R.mesh(g);
  };
  WEAP.rifle = { name: 'AVTOMAT', mesh: rifle(tan, dk), muz: [0, 0.036, 0.72], lh: [0, -0.012, 0.34], auto: 1, cd: 0.105, dmg: 20, spread: 0.02, bloom: 0.012, maxBloom: 0.075, mag: 30, reload: 1.9, pellets: 1, speed: 95, kick: 0.55, snd: 'rifle', range: 46, shell: 1 };
  WEAP.erifle = Object.assign({}, WEAP.rifle, { mesh: rifle(wood, dk), cd: 0.14, dmg: 11, spread: 0.06, mag: 24, reload: 2.4, speed: 60 });
  g = new Geo();              // shotgun
  g.box(0.05, 0.075, 0.3, st, 0, null, 0, 0.03, 0.08); g.cyl(0.017, 0.017, 0.44, 6, dk, 12, zx(0, 0.05, 0.23)); g.cyl(0.016, 0.016, 0.36, 6, dk, 12, zx(0, 0.012, 0.23));
  g.box(0.052, 0.052, 0.15, wood, 0, null, 0, 0.012, 0.36); g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.25, 0));
  g.box(0.042, 0.068, 0.27, wood, 0, TM(0, -0.005, -0.2, 0, 0.12, 0)); g.box(0.046, 0.115, 0.03, dk, 0, null, 0, -0.03, -0.335);
  WEAP.shotgun = { name: 'POMPALI', mesh: R.mesh(g), muz: [0, 0.05, 0.68], lh: [0, -0.012, 0.36], auto: 0, cd: 0.78, dmg: 12, spread: 0.085, bloom: 0, maxBloom: 0, mag: 7, reload: 0.48, shellLoad: 1, pellets: 9, speed: 80, kick: 1.3, snd: 'shotgun', range: 20, pump: 1 };
  g = new Geo();              // smg
  g.box(0.046, 0.085, 0.27, dk, 0, null, 0, 0.03, 0.08); g.cyl(0.014, 0.014, 0.12, 6, st, 12, zx(0, 0.036, 0.21)); g.cyl(0.022, 0.022, 0.1, 6, dk, 12, zx(0, 0.036, 0.3));
  g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.2, 0)); g.box(0.03, 0.2, 0.045, st, 0, null, 0, -0.1, 0.12); g.box(0.02, 0.03, 0.2, st, 0, null, 0, 0.03, -0.15); g.box(0.04, 0.09, 0.02, st, 0, null, 0, 0.01, -0.25);
  WEAP.smg = { name: 'SMG', mesh: R.mesh(g), muz: [0, 0.036, 0.42], lh: [0, -0.03, 0.2], auto: 1, cd: 0.085, dmg: 7, spread: 0.085, mag: 28, reload: 2.0, pellets: 1, speed: 55, kick: 0.35, snd: 'smg', range: 30, shell: 1 };
  g = new Geo();              // lmg
  g.box(0.06, 0.09, 0.42, hex(0x3d4338), 0, null, 0, 0.03, 0.12); g.cyl(0.017, 0.017, 0.42, 6, dk, 12, zx(0, 0.04, 0.33)); g.cyl(0.026, 0.026, 0.07, 6, dk, 12, zx(0, 0.04, 0.75));
  g.box(0.11, 0.13, 0.15, hex(0x4c5544), 0, null, 0.03, -0.07, 0.17); g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.25, 0));
  g.box(0.046, 0.08, 0.28, hex(0x3d4338), 0, TM(0, 0.0, -0.2, 0, 0.08, 0)); g.box(0.012, 0.012, 0.2, dk, 0, TM(-0.03, -0.05, 0.6, 0, 0.5, 0)); g.box(0.012, 0.012, 0.2, dk, 0, TM(0.03, -0.05, 0.6, 0, 0.5, 0));
  g.box(0.05, 0.03, 0.1, dk, 0, null, 0, 0.1, 0.22);
  WEAP.lmg = { name: 'LMG', mesh: R.mesh(g), muz: [0, 0.04, 0.83], lh: [0, -0.02, 0.4], auto: 1, cd: 0.1, dmg: 9, spread: 0.1, mag: 60, reload: 3.6, pellets: 1, speed: 60, kick: 0.5, snd: 'lmg', range: 40, shell: 1 };
  g = new Geo();              // sniper
  g.box(0.044, 0.07, 0.36, hex(0x7b6c4c), 0, null, 0, 0.03, 0.1); g.cyl(0.012, 0.014, 0.62, 6, dk, 12, zx(0, 0.04, 0.28)); g.cyl(0.02, 0.02, 0.09, 6, dk, 12, zx(0, 0.04, 0.9));
  g.cyl(0.024, 0.024, 0.24, 8, dk, 12, zx(0, 0.105, 0.02)); g.box(0.02, 0.04, 0.03, dk, 0, null, 0, 0.078, 0.07); g.box(0.02, 0.04, 0.03, dk, 0, null, 0, 0.078, 0.2);
  g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.25, 0)); g.box(0.042, 0.08, 0.3, hex(0x7b6c4c), 0, TM(0, -0.005, -0.21, 0, 0.1, 0)); g.box(0.03, 0.09, 0.05, dk, 0, null, 0, -0.06, 0.14);
  WEAP.sniper = { name: 'SNAYPER', mesh: R.mesh(g), muz: [0, 0.04, 1.0], lh: [0, -0.01, 0.4], auto: 0, cd: 2.6, dmg: 38, spread: 0.012, mag: 5, reload: 3.0, pellets: 1, speed: 130, kick: 1.4, snd: 'sniper', range: 60, shell: 1 };
  // ---- player arsenal ----
  const olive = hex(0x5b6346), tanD = hex(0x6f5f3a);
  Object.assign(WEAP.rifle, { id: 'rifle', cat: 0, res: 150, mob: 1, zoom: 0.68, desc: 'Balanslı, dəqiq və etibarlı' });
  Object.assign(WEAP.shotgun, { id: 'shotgun', cat: 1, res: 28, mob: 1, zoom: 0.86, desc: 'Yaxın məsafədə öldürücü' });
  g = new Geo();              // player smg
  g.box(0.046, 0.085, 0.25, tan, 0, null, 0, 0.03, 0.07); g.cyl(0.015, 0.015, 0.14, 6, dk, 12, zx(0, 0.036, 0.2)); g.cyl(0.024, 0.024, 0.11, 6, dk, 12, zx(0, 0.036, 0.3));
  g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.2, 0)); g.box(0.032, 0.17, 0.045, dk, 0, TM(0, -0.09, 0.12, 0, -0.15, 0)); g.box(0.02, 0.03, 0.2, dk, 0, null, 0, 0.03, -0.15); g.box(0.04, 0.09, 0.02, dk, 0, null, 0, 0.01, -0.25);
  g.box(0.03, 0.03, 0.07, dk, 0, null, 0, 0.09, 0.08); g.box(0.012, 0.03, 0.012, dk, 0, null, 0, 0.07, 0.3);
  WEAP.smg_p = { id: 'smg_p', cat: 0, name: 'ŞİMŞƏK SMG', mesh: R.mesh(g), muz: [0, 0.036, 0.36], lh: [0, -0.03, 0.2], auto: 1, cd: 0.068, dmg: 13, spread: 0.04, bloom: 0.009, maxBloom: 0.075, mag: 32, res: 192, reload: 1.6, pellets: 1, speed: 85, kick: 0.32, snd: 'smg', range: 32, shell: 1, mob: 1.1, zoom: 0.8, desc: 'Çox sürətli atəş, yüngül və çevik' };
  g = new Geo();              // player lmg
  g.box(0.06, 0.09, 0.42, olive, 0, null, 0, 0.03, 0.12); g.cyl(0.018, 0.018, 0.42, 6, dk, 12, zx(0, 0.04, 0.33)); g.cyl(0.028, 0.028, 0.08, 6, dk, 12, zx(0, 0.04, 0.75));
  g.box(0.12, 0.13, 0.16, tanD, 0, null, 0.035, -0.07, 0.16); g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.25, 0)); g.box(0.046, 0.08, 0.28, olive, 0, TM(0, 0.0, -0.2, 0, 0.08, 0));
  g.box(0.012, 0.012, 0.2, dk, 0, TM(-0.03, -0.05, 0.6, 0, 0.5, 0)); g.box(0.012, 0.012, 0.2, dk, 0, TM(0.03, -0.05, 0.6, 0, 0.5, 0)); g.box(0.05, 0.03, 0.12, dk, 0, null, 0, 0.1, 0.22); g.box(0.07, 0.025, 0.06, dk, 0, null, 0, 0.09, 0.08);
  WEAP.lmg_p = { id: 'lmg_p', cat: 0, name: 'PULEMYOT', mesh: R.mesh(g), muz: [0, 0.04, 0.83], lh: [0, -0.02, 0.4], auto: 1, cd: 0.088, dmg: 18, spread: 0.035, bloom: 0.006, maxBloom: 0.1, mag: 80, res: 160, reload: 3.8, pellets: 1, speed: 92, kick: 0.5, snd: 'lmg', range: 44, shell: 1, mob: 0.84, zoom: 0.72, desc: 'Böyük daraq, susmayan atəş' };
  g = new Geo();              // player sniper
  g.box(0.044, 0.07, 0.36, tan, 0, null, 0, 0.03, 0.1); g.cyl(0.012, 0.015, 0.64, 6, dk, 12, zx(0, 0.04, 0.28)); g.cyl(0.022, 0.022, 0.1, 6, dk, 12, zx(0, 0.04, 0.92));
  g.cyl(0.026, 0.026, 0.26, 8, dk, 12, zx(0, 0.108, 0.0)); g.cyl(0.034, 0.034, 0.04, 8, dk, 12, zx(0, 0.108, 0.24)); g.box(0.02, 0.04, 0.03, dk, 0, null, 0, 0.078, 0.07); g.box(0.02, 0.04, 0.03, dk, 0, null, 0, 0.078, 0.2);
  g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.055, 0.0, 0, 0.25, 0)); g.box(0.042, 0.085, 0.3, tan, 0, TM(0, -0.005, -0.21, 0, 0.1, 0)); g.box(0.03, 0.08, 0.05, dk, 0, null, 0, -0.06, 0.14); g.box(0.07, 0.015, 0.015, dk, 0, null, 0.04, 0.06, -0.02);
  WEAP.sniper_p = { id: 'sniper_p', cat: 0, name: 'SNAYPER', mesh: R.mesh(g), muz: [0, 0.04, 0.98], lh: [0, -0.01, 0.4], auto: 0, cd: 1.15, dmg: 150, spread: 0.003, bloom: 0, maxBloom: 0, mag: 5, res: 25, reload: 2.8, pellets: 1, speed: 230, kick: 1.6, snd: 'sniper', range: 75, shell: 1, pump: 1, bolt: 1, mob: 0.9, zoom: 0.36, desc: 'Bir atəş — bir hədəf. Optik nişangah' };
  g = new Geo();              // pistol
  g.box(0.036, 0.11, 0.05, dk, 0, TM(0, -0.05, 0.0, 0, 0.22, 0)); g.box(0.04, 0.048, 0.2, hex(0x34383f), 12, null, 0, 0.035, 0.07); g.box(0.034, 0.02, 0.17, dk, 0, null, 0, 0.012, 0.07);
  g.box(0.01, 0.014, 0.01, dk, 0, null, 0, 0.065, 0.16); g.box(0.012, 0.03, 0.04, dk, 0, null, 0, -0.01, 0.03);
  WEAP.pistol = { id: 'pistol', cat: 1, name: 'TAPANÇA', mesh: R.mesh(g), muz: [0, 0.035, 0.18], lh: [0, -0.07, 0.03], auto: 0, cd: 0.16, dmg: 26, spread: 0.022, bloom: 0.018, maxBloom: 0.06, mag: 12, res: Infinity, reload: 1.2, pellets: 1, speed: 90, kick: 0.7, snd: 'pistol', range: 30, shell: 1, mob: 1.12, zoom: 0.84, pistol: 1, desc: 'Sonsuz sursat, sürətli dəyişmə' };
  g = new Geo();              // grenade launcher
  g.cyl(0.05, 0.05, 0.38, 10, hex(0x4a5240), 12, zx(0, 0.04, 0.16)); g.cyl(0.058, 0.058, 0.03, 10, dk, 0, zx(0, 0.04, 0.52)); g.cyl(0.095, 0.095, 0.15, 10, dk, 12, zx(0, 0.02, 0.0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.cyl(0.028, 0.028, 0.152, 6, hex(0xb8962e), 12, zx(cos(a) * 0.06, 0.02 + sin(a) * 0.06, 0.0)); }
  g.box(0.04, 0.1, 0.046, dk, 0, TM(0, -0.075, -0.1, 0, 0.25, 0)); g.box(0.04, 0.12, 0.045, dk, 0, TM(0, -0.06, 0.25, 0, -0.2, 0)); g.box(0.04, 0.06, 0.24, hex(0x4a5240), 0, TM(0, -0.01, -0.24, 0, 0.12, 0)); g.box(0.012, 0.05, 0.02, K.yellow, 0, null, 0, 0.11, 0.3);
  WEAP.launcher = { id: 'launcher', cat: 1, name: 'QUMBARAATAN', mesh: R.mesh(g), muz: [0, 0.04, 0.54], lh: [0, -0.03, 0.27], auto: 0, cd: 0.85, dmg: 0, spread: 0.01, bloom: 0, maxBloom: 0, mag: 6, res: 12, reload: 0.62, shellLoad: 1, pellets: 1, speed: 34, kick: 1.4, snd: 'launcher', range: 42, expl: 1, er: 4.6, edmg: 135, mob: 0.88, zoom: 0.74, desc: 'Partlayıcı mərmi — örtüyün arxasını vurur' };
  // misc meshes
  g = new Geo(); g.cyl(0.29, 0.29, 0.88, 12, hex(0xc23a2b), 12); g.cyl(0.305, 0.305, 0.05, 12, hex(0x8f2a20), 12, TM(0, 0.27, 0)); g.cyl(0.305, 0.305, 0.05, 12, hex(0x8f2a20), 12, TM(0, 0.58, 0));
  g.cyl(0.25, 0.25, 0.012, 12, hex(0x7c241b), 0, TM(0, 0.875, 0)); g.box(0.2, 0.2, 0.01, hex(0xf2c230), 0, TM(0, 0.44, 0.293)); g.box(0.2, 0.2, 0.01, hex(0xf2c230), 0, TM(0, 0.44, -0.293));
  WEAP.barrel = R.mesh(g);
  g = new Geo(); g.cyl(0.3, 0.26, 0.5, 10, hex(0x2a2523), 0); g.cyl(0.24, 0.3, 0.06, 10, hex(0x1a1716), 0, TM(0, 0.5, 0)); WEAP.husk = R.mesh(g);
  g = new Geo(); g.sph(0.055, 0.07, 0.055, 8, 5, hex(0x3d4a36), 0); g.cyl(0.02, 0.02, 0.035, 6, hex(0x8d939c), 12, TM(0, 0.06, 0)); WEAP.frag = R.mesh(g);
  g = new Geo(); g.cyl(0.04, 0.04, 0.13, 8, hex(0x9aa1ab), 12, TM(0, -0.065, 0)); g.cyl(0.043, 0.043, 0.02, 8, hex(0x2a2d33), 0, TM(0, 0.02, 0)); g.cyl(0.043, 0.043, 0.02, 8, hex(0x2a2d33), 0, TM(0, -0.05, 0)); WEAP.flash = R.mesh(g);
  // pickups
  g = new Geo(); g.box(0.46, 0.3, 0.3, hex(0xe9e6df), 0, null, 0, 0.15, 0); g.box(0.2, 0.062, 0.012, hex(0xd0342a), 0, null, 0, 0.16, 0.152); g.box(0.062, 0.2, 0.012, hex(0xd0342a), 0, null, 0, 0.16, 0.152);
  g.box(0.2, 0.012, 0.062, hex(0xd0342a), 0, null, 0, 0.302, 0); g.box(0.062, 0.012, 0.2, hex(0xd0342a), 0, null, 0, 0.302, 0); g.box(0.16, 0.03, 0.05, hex(0x9a988f), 0, null, 0, 0.32, 0); WEAP.pmed = R.mesh(g);
  g = new Geo(); g.box(0.44, 0.26, 0.26, hex(0x56633f), 0, null, 0, 0.13, 0); g.box(0.46, 0.04, 0.28, hex(0x3f4a2e), 0, null, 0, 0.25, 0); g.box(0.2, 0.08, 0.012, hex(0xe3b21f), 0, null, 0, 0.13, 0.132); g.box(0.14, 0.03, 0.04, hex(0x2a2d33), 0, null, 0, 0.285, 0); WEAP.pammo = R.mesh(g);
  g = new Geo(); g.box(0.4, 0.22, 0.3, hex(0x4b5360), 0, null, 0, 0.11, 0); for (const x of [-0.11, 0, 0.11]) g.sph(0.045, 0.055, 0.045, 8, 4, hex(0x3d4a36), 0, TM(x, 0.25, 0)); WEAP.pnade = R.mesh(g);
}

const L_UA = 0.285, L_FA = 0.278, L_TH = 0.44, L_SH = 0.44, ROLL_T = 0.5, THROW_T = 0.55;
const T_ = [m4(), m4(), m4(), m4(), m4(), m4(), m4()], V_ = new Float32Array(6), P_ = new Float32Array(3);
let SID = 0;
class Soldier {
  constructor(o) {
    this.id = ++SID; this.team = o.team; this.type = o.type || 'rifle'; this.kit = KITS[o.kit]; this.sc = o.scale || 1;
    this.x = o.x; this.z = o.z; this.px = o.x; this.pz = o.z; this.yaw = o.yaw || 0; this.hip = this.yaw; this.r = 0.32 * this.sc;
    this.hp = this.maxHp = o.hp || 100; this.weapon = WEAP[o.weapon || 'rifle']; this.ammo = this.weapon.mag; this.name = o.name || '';
    this.spd = 0; this.mv = 0; this.ph = rnd(TAU); this.A = 0.3; this.back = false; this.cr = 0; this.crouch = false;
    this.aiming = false; this.aimW = 0; this.sprinting = false; this.sprW = 0; this.rec = 0; this.relW = 0; this.reloading = false; this.relT = 0; this.relDur = 1;
    this.hitP = 0; this.hitR = 0; this.flash = 0; this.dead = false; this.dT = 0; this.fd = 0; this.fallA = 0; this.rollT = 0; this.rollYaw = 0;
    this.throwT = 0; this.stun = 0; this.stunW = 0; this.look = 0; this.seed = rnd(10); this.pumpT = 0; this.fireCd = 0; this.bloom = 0; this.lastShot = -9; this.lastHurt = -9;
    this.mzx = 0; this.mzy = 0; this.mzz = 0; this.mzF = -1; this.step = 0; this.down = false; this.vis = true;
  }
  get height() { return (1.82 - this.cr * 0.62) * this.sc; }
  // analytic muzzle fallback
  muzzle(o, frame) {
    if (this.mzF >= frame - 1) { o[0] = this.mzx; o[1] = this.mzy; o[2] = this.mzz; return o; }
    const s = sin(this.yaw), c = cos(this.yaw); o[0] = this.x + s * 0.85 * this.sc - c * 0.1; o[1] = (1.4 - this.cr * 0.38) * this.sc; o[2] = this.z + c * 0.85 * this.sc + s * 0.1; return o;
  }
  anim(dt, now) {
    let vx = (this.x - this.px) / dt, vz = (this.z - this.pz) / dt; this.px = this.x; this.pz = this.z;
    let sp = hyp(vx, vz); if (sp > 14) sp = 0;
    this.spd = damp(this.spd, sp, 14, dt);
    const moving = this.spd > 0.3 && !this.dead && this.rollT <= 0;
    this.mv = damp(this.mv, moving ? 1 : 0, 10, dt);
    if (moving) {
      const md = atan2(vx, vz), rel = abs(angDiff(this.yaw, md));
      this.back = this.back ? rel > 1.45 : rel > 1.9;
      this.hip = angDamp(this.hip, this.back ? md + PI : md, 13, dt);
      this.A = clamp(0.2 + 0.045 * this.spd, 0.2, 0.42) * (1 - 0.35 * this.cr);
      const o = this.ph; this.ph += (this.back ? -1 : 1) * min(PI * this.spd / (2 * this.A), 17) * dt;
      if (floor(o / PI) !== floor(this.ph / PI)) this.step++;
    } else if (!this.dead) this.hip = angDamp(this.hip, this.yaw - 0.28 * (1 - this.cr * 0.4), 6, dt);
    const d = angDiff(this.yaw, this.hip); if (abs(d) > 1.6) this.hip = this.yaw + clamp(d, -1.6, 1.6);
    this.cr = damp(this.cr, this.crouch && !this.dead ? 1 : 0, 11, dt);
    const st = this.stun > 0 && !this.dead; this.stunW = damp(this.stunW, st ? 1 : 0, 9, dt); if (this.stun > 0) this.stun -= dt;
    this.aimW = damp(this.aimW, this.aiming && !st ? 1 : 0, this.aiming ? 18 : 5, dt);
    this.sprW = damp(this.sprW, this.sprinting && moving ? 1 : 0, 9, dt);
    this.relW = damp(this.relW, this.reloading ? 1 : 0, 13, dt);
    this.rec = damp(this.rec, 0, 16, dt); this.hitP = damp(this.hitP, 0, 9, dt); this.hitR = damp(this.hitR, 0, 9, dt);
    this.flash = max(0, this.flash - dt * 7); if (this.pumpT > 0) this.pumpT -= dt; if (this.throwT > 0) this.throwT -= dt;
    if (this.dead) { this.dT += dt; const t = min(1, this.dT / 0.6); this.fallA = 1.5 * t * t * (1 + 0.12 * sin(min(1, max(0, (this.dT - 0.6) / 0.25)) * PI)); }
  }
  draw(now, frame) {
    const k = this.kit, S = this.sc, mv = this.mv, ph = this.ph, sp = min(1, this.spd / 4.5), dead = this.dead, dk = dead ? sstep(0, 0.45, this.dT) : 0;
    const rolling = this.rollT > 0 && !dead, Rt = T_[0];
    if (dead) { m4trs(Rt, this.x, sin(this.fallA) * 0.13 * S, this.z, this.fd, this.fallA, 0); m4mul(Rt, Rt, m4trs(T_[1], 0, 0, 0, -this.fd, 0, 0)); }
    else if (rolling) { const a = (1 - this.rollT / ROLL_T) * TAU; m4trs(Rt, this.x, 0.5 * S, this.z, this.rollYaw, a, 0); m4mul(Rt, Rt, m4trs(T_[1], 0, -0.5 * S, 0, -this.rollYaw, 0, 0)); }
    else m4trs(Rt, this.x, 0, this.z, 0, 0, 0);
    m4scale(Rt, S, S, S);
    const fl = R.CAST | R.RIM | (this.team === 0 ? R.SIL : 0), ta = this.flash * 0.75, tc = this.down ? 0.9 : 1;
    const hy = this.hip, ay = this.yaw, hs = sin(hy), hc = cos(hy), as = sin(ay), ac = cos(ay);
    const crE = max(this.cr, rolling ? 1 : 0, dk * 0.3, this.down ? 1 : 0);
    const hipH = lerp(0.925, 0.58, crE) - 0.03 * mv * sp + mv * 0.026 * cos(2 * ph) * (0.4 + sp) - dk * 0.08;
    const sway = sin(ph) * 0.018 * mv, Px = hc * sway, Pz = -hs * sway;
    // pelvis
    let m = R.add(k.pelvis, fl, 1, tc, tc, ta); m4trs(m, Px, hipH, Pz, hy, 0.05 * mv * sp + crE * 0.12, 0.05 * sin(ph) * mv);
    let p = m4pt(m, 0.092, -0.045, 0, P_); const jlx = p[0], jly = p[1], jlz = p[2]; p = m4pt(m, -0.092, -0.045, 0, P_); const jrx = p[0], jry = p[1], jrz = p[2];
    m4mul(m, Rt, m);
    // torso
    const sw = this.stunW, blade = -0.1 - 0.3 * this.aimW * (1 - this.sprW);
    const ty = ay + blade + 0.07 * sin(ph) * mv + sw * sin(now * 9 + this.seed) * 0.22;
    const tp = 0.07 + 0.13 * mv * sp + crE * 0.26 + this.sprW * 0.16 - this.rec * 0.03 + this.hitP + sw * 0.5 + dk * 0.15 + (this.down ? 0.35 : 0);
    const Mt = T_[2]; m4trs(Mt, Px, hipH + 0.06, Pz, ty, tp, this.hitR - 0.03 * sin(ph) * mv);
    p = m4pt(Mt, 0.215, 0.465, 0, P_); const slx = p[0], sly = p[1], slz = p[2]; p = m4pt(Mt, -0.215, 0.465, 0, P_); const srx = p[0], sry = p[1], srz = p[2];
    p = m4pt(Mt, 0, 0.675, 0.012, P_); const hx = p[0], hyy = p[1], hz = p[2];
    m = R.add(k.torso, fl, 1, tc, tc, ta); m4mul(m, Rt, Mt);
    m = R.add(k.head, fl, 1, tc, tc, ta); m4trs(m, hx, hyy + 0.012, hz, ay + this.look + sw * sin(now * 7) * 0.3, 0.06 + crE * 0.04 + sw * 0.55 + dk * 0.3 + (this.down ? 0.5 : 0), dk * 0.25); m4scale(m, 1.12, 1.12, 1.12); m4mul(m, Rt, m);
    // weapon in aim frame
    const rl = this.relW, sW = this.sprW * (1 - rl), aW = this.aimW * (1 - this.sprW) * (1 - rl), rW = max(0, 1 - sW - aW - rl);
    const lower = max(sw, this.down ? 1 : 0, dk);
    const wx = aW * -0.105 + rW * -0.09 + sW * -0.06 + rl * -0.10, wy = aW * 0.385 + rW * 0.30 + sW * 0.33 + rl * 0.37 - lower * 0.1,
      wz = aW * 0.20 + rW * 0.19 + sW * 0.16 + rl * 0.22, wyaw = rW * 0.42 + sW * 0.95 + rl * 0.22, wpit = rW * 0.5 + sW * -0.35 + rl * -0.38 + lower * 0.5, wrol = rW * -0.15 + rl * 0.45;
    const Ma = T_[3], Mw = T_[4]; m4trs(Ma, Px, hipH + 0.06, Pz, ay, tp * 0.5, 0);
    m4trs(T_[5], wx, wy + sin(now * 1.6 + this.seed) * 0.004 - crE * 0.02, wz - this.rec * 0.05, wyaw, wpit - this.rec * 0.07, wrol); m4mul(Mw, Ma, T_[5]);
    const W_ = this.weapon;
    p = m4pt(Mw, 0, -0.045, 0, P_); let rhx = p[0], rhy = p[1], rhz = p[2];
    const pump = this.pumpT > 0 ? sin(clamp(1 - this.pumpT / 0.42, 0, 1) * PI) * 0.09 : 0;
    p = m4pt(Mw, W_.lh[0], W_.lh[1] - 0.02, W_.lh[2] - pump, P_); let lhx = p[0], lhy = p[1], lhz = p[2];
    if (this.reloading && !dead) {
      const r = clamp(this.relT / this.relDur, 0, 1); let ax, ay2, az, bx, by, bz, t;
      const magx = 0, magy = -0.15, magz = 0.15;
      const P0 = m4pt(Mw, W_.lh[0], W_.lh[1] - 0.02, W_.lh[2], [0, 0, 0]), P1 = m4pt(Mw, magx, magy, magz, [0, 0, 0]), P2 = m4pt(Mw, magx, magy - 0.16, magz - 0.02, [0, 0, 0]), P3 = m4pt(Mt, 0.09, 0.17, 0.2, [0, 0, 0]);
      let A, B; if (r < 0.15) { A = P0; B = P1; t = r / 0.15; } else if (r < 0.32) { A = P1; B = P2; t = (r - 0.15) / 0.17; } else if (r < 0.55) { A = P2; B = P3; t = (r - 0.32) / 0.23; } else if (r < 0.78) { A = P3; B = P1; t = (r - 0.55) / 0.23; } else { A = P1; B = P0; t = (r - 0.78) / 0.22; }
      t = t * t * (3 - 2 * t); lhx = lerp(A[0], B[0], t); lhy = lerp(A[1], B[1], t); lhz = lerp(A[2], B[2], t);
    }
    if (this.throwT > 0 && !dead) {
      const t = 1 - this.throwT / THROW_T; let q;
      if (t < 0.45) q = m4pt(Ma, lerp(0.1, 0.3, t / 0.45), lerp(0.35, 0.56, t / 0.45), lerp(0.3, -0.22, t / 0.45), P_);
      else if (t < 0.7) { const u = (t - 0.45) / 0.25; q = m4pt(Ma, lerp(0.3, 0.16, u), lerp(0.56, 0.6, u) + sin(u * PI) * 0.1, lerp(-0.22, 0.52, u), P_); }
      else { const u = (t - 0.7) / 0.3; q = m4pt(Ma, lerp(0.16, 0.0, u), lerp(0.6, 0.36, u), lerp(0.52, 0.4, u), P_); }
      lhx = q[0]; lhy = q[1]; lhz = q[2];
    }
    if (sw > 0.05 && !dead) { p = m4pt(Mt, 0.06, 0.66, 0.2, P_); lhx = lerp(lhx, p[0], sw); lhy = lerp(lhy, p[1], sw); lhz = lerp(lhz, p[2], sw); }
    if (dk > 0) { p = m4pt(Mt, 0.34, 0.12, 0.16, P_); lhx = lerp(lhx, p[0], dk); lhy = lerp(lhy, p[1], dk); lhz = lerp(lhz, p[2], dk); p = m4pt(Mt, -0.36, 0.16, 0.12, P_); rhx = lerp(rhx, p[0], dk); rhy = lerp(rhy, p[1], dk); rhz = lerp(rhz, p[2], dk); }
    // arms (IK)
    const plx = Mt[0] * 0.55 - Mt[4] - Mt[8] * 0.25, ply = Mt[1] * 0.55 - Mt[5] - Mt[9] * 0.25, plz = Mt[2] * 0.55 - Mt[6] - Mt[10] * 0.25;
    const prx = -Mt[0] * 0.55 - Mt[4] - Mt[8] * 0.25, pry = -Mt[1] * 0.55 - Mt[5] - Mt[9] * 0.25, prz = -Mt[2] * 0.55 - Mt[6] - Mt[10] * 0.25;
    ik2(V_, srx, sry, srz, rhx, rhy, rhz, L_UA, L_FA, prx, pry, prz);
    m = R.add(k.uarm, fl, 1, tc, tc, ta); m4seg(m, srx, sry, srz, V_[0], V_[1], V_[2], ac, 0, -as); m4mul(m, Rt, m);
    m = R.add(k.farm, fl, 1, tc, tc, ta); m4seg(m, V_[0], V_[1], V_[2], V_[3], V_[4], V_[5], as, 0, ac); m4mul(m, Rt, m);
    ik2(V_, slx, sly, slz, lhx, lhy, lhz, L_UA, L_FA, plx, ply, plz);
    m = R.add(k.uarm, fl, 1, tc, tc, ta); m4seg(m, slx, sly, slz, V_[0], V_[1], V_[2], -ac, 0, as); m4mul(m, Rt, m);
    m = R.add(k.farm, fl, 1, tc, tc, ta); m4seg(m, V_[0], V_[1], V_[2], V_[3], V_[4], V_[5], as, 0, ac); m4mul(m, Rt, m);
    if (!dead) {
      m = R.add(W_.mesh, R.CAST | (this.team === 0 ? R.SIL : 0), 1, 1, 1, ta); m4mul(m, Rt, Mw);
      p = m4pt(m, W_.muz[0], W_.muz[1], W_.muz[2], P_); this.mzx = p[0]; this.mzy = p[1]; this.mzz = p[2]; this.mzF = frame;
    }
    // legs (IK)
    for (let i = 0; i < 2; i++) {
      const sd = i ? -1 : 1, jx = i ? jrx : jlx, jy = i ? jry : jly, jz = i ? jrz : jlz, phi = ph + (i ? PI : 0), s_ = -sin(phi);
      let fz = mv * this.A * cos(phi) + (1 - mv) * sd * 0.07 * (1 - crE) + crE * (i ? -0.25 : 0.17), fy = 0.09 + mv * (0.05 + 0.09 * sp) * max(0, s_) + (i ? crE * 0.06 : 0), fx = sd * (0.105 + crE * 0.03);
      if (rolling) { fz = sd * 0.08; fy = 0.28; } if (dk > 0) { fz = lerp(fz, sd * 0.12, dk); fx = lerp(fx, sd * 0.16, dk); }
      const ax = hc * fx + hs * fz, az = -hs * fx + hc * fz;
      const kd = i ? crE * 1.3 : 0;
      ik2(V_, jx, jy, jz, ax, fy, az, L_TH, L_SH, hs + hc * sd * 0.2, -kd, hc - hs * sd * 0.2);
      m = R.add(k.thigh, fl, 1, tc, tc, ta); m4seg(m, jx, jy, jz, V_[0], V_[1], V_[2], hs, 0, hc); m4mul(m, Rt, m);
      m = R.add(k.shin, fl, 1, tc, tc, ta); m4seg(m, V_[0], V_[1], V_[2], V_[3], V_[4], V_[5], hs, 0, hc); m4mul(m, Rt, m);
      m = R.add(k.boot, fl, 1, tc, tc, ta); m4trs(m, V_[3], V_[4], V_[5], hy + sd * 0.12, mv * (s_ > 0 ? 0.5 * s_ : 0) + (i ? crE * 0.75 : 0) + dk * 0.5, 0); m4mul(m, Rt, m);
    }
  }
}
