// ===== maps =====
const MAPS = {}, MAP_ORDER = ['poligon', 'liman', 'sehra', 'qis'];
const stainsIn = n => { for (let i = 0; i < n; i++) W.stains.push([rnd(W.X0 + 3, W.X1 - 3), rnd(W.Z0 + 3, W.Z1 - 3), rnd(0.7, 2.4), rnd(0.7, 2.0), rnd(TAU), rnd(0.06, 0.18)]); };
const ES = (t, x, z, o) => W.spawns.push(Object.assign({ t, x, z }, o || {}));

MAPS.poligon = {
  id: 'poligon', name: 'POLİQON', sub: 'Təlim kompleksi · gündüz', accent: '#86aee0',
  desc: 'Taxta divarlı təlim evi, konteyner sahəsi və anbar. Klassik yaxın döyüş.',
  bounds: [-38, -48, 38, 46], weather: null, skin: '',
  zones: [{ n: 'HƏYƏT', a: 0, b: 4, r: null }, { n: 'TƏLİM EVİ', a: 4, b: 16, r: [-26.5, -20.5, 6.5, 10.5] }, { n: 'KONTEYNER SAHƏSİ', a: 16, b: 21, r: [10.5, -25, 38, 14] }, { n: 'ANBAR', a: 21, b: 29, r: [-38, -48, 38, -24] }],
  env: { sun: [0.427, 0.854, 0.299], sunC: [0.68, 0.61, 0.5], sky: [0.5, 0.56, 0.67], gnd: [0.42, 0.38, 0.34], fogC: [0.72, 0.8, 0.88], fog: [60, 150], zen: [0.26, 0.47, 0.82], mid: [0.5, 0.67, 0.9], sunG: [1, 0.92, 0.75], cloudC: [1, 1, 1], cloud: 0.7, gr: [1.14, 1.05, 1.0, 0], gt: [1.0, 1.0, 1.0] },
  thumb: { e: [22, 30, 46], l: [-6, 0, 6] },
  build(H) {
    const { g, solid, line, post, plyRun, concRun, crate, crates, barrel, sandbags, jersey, lowWall, plyCover, table, target, tires, pallet, lamp, tree, bush, container, wheel, vehSolid, van, truck, suv, forklift, tower, fuelTank, bldg, tri, beam, face, wallRun, house, awning, stall, palm, pine, hill, dune, snowPile, rock, bollard, shelf, vtank, crane, ship, hut, tent, heli, tank, lattice, radome, flag, helipad, well, domeHouse, carpet, wreck, technical, fence, stripes, barrier } = H;
  // ---------- ground ----------
  g.quadXZ(-120, -120, 120, 120, -0.03, K.grass, 4);
  g.quadXZ(W.X0, W.Z0, W.X1, W.Z1, 0, K.conc, 1);
  g.quadXZ(-5, 46, 5, 120, -0.01, K.asph, 3);
  g.quadXZ(W.X0 + 0.3, 36.5, W.X1 - 0.3, W.Z1 - 0.3, 0.006, K.asph, 3);            // parking
  g.quadXZ(-4.5, 13, 4.5, 36.5, 0.006, K.asph, 3);                                 // access road
  g.quadXZ(-28.5, -22.5, 8.5, 12.5, 0.008, hex(0xcfcbc2), 1);                      // kill-house slab
  g.quadXZ(11, -25, 37, 14, 0.006, mulc(K.conc, 0.92), 1);
  g.quadXZ(14, -47, 37.5, -27, 0.008, K.dirt, 5);
  g.quadXZ(-37.5, -22, -29.5, 12, 0.008, K.dirt, 5);
  // ---------- perimeter ----------
  concRun('x', W.Z1, W.X0, -4.5); concRun('x', W.Z1, 4.5, W.X1); concRun('x', W.Z0, W.X0, W.X1); concRun('z', W.X0, W.Z0, W.Z1); concRun('z', W.X1, W.Z0, W.Z1);
  // gate (closed, barred)
  for (let i = 0; i <= 30; i++) g.bx(-4.5 + i * 0.3 - 0.03, 0.15, 46.0, -4.5 + i * 0.3 + 0.03, 2.7, 46.06, K.metalD, 12);
  g.bx(-4.6, 0.1, 45.96, 4.6, 0.25, 46.1, K.metalD, 12); g.bx(-4.6, 2.65, 45.96, 4.6, 2.8, 46.1, K.metalD, 12); g.bx(-4.6, 1.4, 45.98, 4.6, 1.5, 46.08, K.metalD, 12);
  solid(-4.5, 45.9, 4.5, 46.2, 2.8, 2);
  // trees outside
  for (let i = 0; i < 46; i++) {
    const side = i % 4, t = rnd(-1, 1); let x, z;
    if (side === 0) { x = W.X0 - rnd(4, 20); z = t * 52; } else if (side === 1) { x = W.X1 + rnd(4, 20); z = t * 52; } else if (side === 2) { x = t * 52; z = W.Z0 - rnd(4, 20); } else { x = t * 52; z = W.Z1 + rnd(5, 18); if (abs(x) < 9) x += x < 0 ? -9 : 9; }
    tree(x, z, rnd(0.9, 1.5)); if (i % 3 === 0) bush(x + rnd(-4, 4), z + rnd(-3, 3), rnd(0.8, 1.4));
  }

  // ---------- south entry (start) ----------
  plyRun('z', -3.4, 33, 41);                       // the wall the squad stacks on
  van(-10.5, 41.2, PI / 2); suv(10.5, 42, -PI / 2, hex(0x4a5059));
  for (const x of [-14.5, -6.5, 7, 14]) line(x - 0.06, 38.5, x + 0.06, 44.5);
  bldg(8.5, 32, 12, 35.5, 2.6, hex(0xc9c6bb), hex(0x4b525c));
  g.bx(8.46, 1.1, 32.4, 8.5, 2.0, 35.1, K.glass, 12); g.bx(8.9, 1.1, 35.5, 11.6, 2.0, 35.54, K.glass, 12);
  g.bx(7.55, 0, 31.2, 7.95, 1.15, 31.6, K.metalD, 0); solid(7.55, 31.2, 7.95, 31.6, 1.15, 2);
  { const T = TM(7.75, 1.05, 31.4, 0, 0, 1.15); g.box(0.1, 5.2, 0.1, K.yellow, 0, T, 0, 2.5, 0); g.box(0.11, 0.6, 0.11, K.red, 0, T, 0, 1.2, 0); g.box(0.11, 0.6, 0.11, K.red, 0, T, 0, 3.2, 0); g.box(0.11, 0.5, 0.11, K.red, 0, T, 0, 4.85, 0); }
  sandbags(-9, 30.5, -4.2, 30.5, 3); sandbags(-9.3, 30.8, -9.3, 33.4, 3);
  jersey(2, 27.2, 'x'); jersey(5.2, 27.2, 'x'); jersey(-12, 34.5, 'z');
  lamp(-16, 45, PI); lamp(16, 45, PI); lamp(-35, 30, PI / 2); lamp(35, 30, -PI / 2);
  tree(-33, 41, 1.1); tree(31, 40, 1.2); bush(-30, 43.5, 1.2); bush(34, 36, 1);
  g.bx(-36, 0, 38, -29.5, 0.16, 44.5, K.conc, 7, 8); g.quadXZ(-35.8, 38.2, -29.7, 44.3, 0.165, K.grass, 4);
  g.bx(28, 0, 37, 36, 0.16, 44.5, K.conc, 7, 8); g.quadXZ(28.2, 37.2, 35.8, 44.3, 0.165, K.grass, 4);
  solid(-33.25, 40.75, -32.75, 41.25, 3, 1); solid(30.75, 39.75, 31.25, 40.25, 3, 1);

  // ---------- outer yard ----------
  lowWall(-22, 24, -16, 24.5); lowWall(10, 20, 16, 20.5); lowWall(-6.2, 17, -5.7, 22.5);
  crates(-12, 27, 1.2, 2, 0.1); crates(-13.5, 25.7, 1.0, 1, -0.2); crates(2.2, 22, 1.25, 2, 0.05); crates(3.6, 22.9, 0.9, 1, 0.4);
  crates(18, 26, 1.3, 2, 0); crates(-24, 18, 1.2, 1, 0.2); crates(-25.3, 18.4, 0.9, 2, 0);
  barrel(-2, 26, K.blue); barrel(-1.3, 26.5, K.blue); barrel(14, 16, K.green); barrel(-19, 28.5, K.ochre);
  truck(24, 17.5, PI / 2, hex(0x71806a));
  tires(6, 15.5, 4); tires(6.8, 15.2, 2); pallet(24, 23, 0.1, 0.9); pallet(25.6, 23.2, -0.05, 0.5); pallet(-30, 26, 0, 1.0);
  plyRun('x', 19, -34, -29); plyRun('z', -29, 19, 23.5, [[20, 22.4, 0]]);   // breach-practice facade
  target(-31.5, 21.2, 0); target(-33, 21.2, 0);
  sandbags(-2.5, 15, 2.5, 15, 3);
  line(-28, 13.0, -4.5, 13.2, K.yellow); line(4.5, 13.0, 8, 13.2, K.yellow); for (let z = 15; z < 36; z += 4) line(-0.07, z, 0.07, z + 2, K.white); lamp(-35, 14, PI / 2); lamp(35, 8, -PI / 2);

  // ---------- kill-house ----------
  plyRun('x', 10, -26, 6, [[-23, -20.5, 1], [-12, -9.6, 0], [1, 3.4, 0]]);
  plyRun('x', -20, -26, 6, [[-12, -9.6, 0], [-2, 0.5, 1]]);
  plyRun('z', -26, -20, 10, [[-2, 0.4, 0], [4, 6.5, 1]]);
  plyRun('z', 6, -20, 10, [[-17, -14.5, 1], [-2, 0.4, 0], [4.5, 7, 1]]);
  plyRun('z', -16, 1, 10, [[4, 6.4, 0]]); plyRun('z', -6, 1, 10, [[6, 8.4, 0]]);
  plyRun('x', 1, -26, 6, [[-22, -19.6, 0], [-10, -7.6, 0], [-1, 1.4, 0]]);
  plyRun('x', -3, -26, 6, [[-23, -20.6, 0], [-13, -10.6, 0], [-3, -0.6, 0]]);
  plyRun('z', -17, -20, -3, [[-17, -14.6, 0], [-9, -6.6, 0]]);
  plyRun('z', -5, -20, -3, [[-17, -14.6, 0], [-10.8, -8.8, 1], [-7, -4.6, 0]]);
  plyRun('x', -12, -26, -17, [[-23, -20.6, 0]]); plyRun('x', -11, -5, 6, [[0, 2.4, 0]]);
  plyRun('x', -9, -14.5, -10.5); plyRun('z', -9, -17, -13.5);             // free-standing partitions in the hall
  // interior props
  plyCover(-13.5, 4.2, -11.5, 4.45); crates(-8, 3, 1.0, 1, 0.2); table(-20.5, 7.5, 1.8, 0.9); crates(-24.6, 2.5, 1.1, 2, 0);
  barrel(-17.2, 8.8, K.ochre); table(2, 6.5, 0.9, 2.0); crates(4.6, 8.4, 1.1, 1, 0.1); plyCover(-3.5, 3.2, -1.5, 3.45);
  crates(-18, -1.6, 0.9, 1, 0.1); plyCover(-7, -1.2, -6.75, 0.2); barrel(4.8, -2.4, K.blue);
  crates(-24.5, -4.5, 1.0, 2, 0); table(-21, -9.6, 1.6, 0.9); crates(-18.4, -18.4, 1.2, 1, 0.3); plyCover(-23.5, -15.5, -21.5, -15.25);
  crates(-15.5, -18, 1.2, 2, 0.1); crates(-7.2, -18.2, 1.0, 1, 0); plyCover(-13, -5.6, -11, -5.35); barrel(-6.2, -12, K.green); tires(-15.8, -11, 3);
  table(2.5, -5, 2.0, 0.9); crates(4.8, -9.6, 1.0, 1, 0); plyCover(-1.5, -7.6, 0.5, -7.35);
  crates(4.5, -18.5, 1.2, 2, 0.15); plyCover(-0.5, -15.2, 1.5, -14.95); barrel(-3.8, -19, K.ochre);
  target(-24.5, 8.6, PI / 2); target(4.9, 2.2, -PI / 2); target(-25, -18.6, PI / 4); target(-6, -4, PI); target(5, -12, -PI / 2);

  // ---------- west strip ----------
  bldg(-36.5, -11, -31, -4, 3, hex(0x5f7a66), hex(0x48604f));
  g.bx(-31, 0, -9, -30.94, 2.2, -6.5, K.metalD, 6);
  for (let i = 0; i < 4; i++) g.bx(-35.5, i * 0.2, 2 + i * 0.03, -31.5, i * 0.2 + 0.18, 4.4 - i * 0.03, i % 2 ? K.ply : K.plyD, 10);
  solid(-35.5, 2, -31.5, 4.4, 0.8, 1);
  pallet(-33, 8, 0.05, 0.7); tires(-30.5, -14, 3); crates(-34, -16, 1.3, 2, 0.1); barrel(-33, -19.5, K.blue); barrel(-33.7, -20, K.blue);
  tree(-34, -28.5, 1.0); solid(-34.25, -28.75, -33.75, -28.25, 3, 1); lamp(-35, -20, PI / 2);

  // ---------- container yard ----------
  container(13, -21, 15.44, -8.8, K.rust); container(13, -4, 15.44, 2.06, K.blue); container(13, 6, 15.44, 12.06, K.green);
  container(20, -16, 22.44, -3.8, K.ochre, K.white); container(20, 1, 22.44, 7.06, hex(0x8a8f96));
  container(27, -22, 29.44, -15.94, K.blue); container(27, -11, 29.44, 1.2, K.rust, K.green); container(27, 5, 29.44, 11.06, K.green, K.ochre);
  container(16.5, 10, 22.56, 12.44, hex(0xc9662b)); container(31.5, -23.5, 36.4, -21.06, K.white);
  forklift(24.6, -1, 0.0); pallet(18, -6, 0, 0.9); pallet(25, 8, PI / 2, 0.6); pallet(32.5, -5, 0, 1.0); pallet(33.8, -5.1, 0, 0.5);
  crates(17.6, 3.5, 1.2, 2, 0.2); crates(32, 3, 1.3, 1, 0); crates(33.2, 3.9, 1.0, 2, 0.3); crates(24.8, -19.5, 1.2, 1, 0.1); crates(17.5, -17.5, 1.1, 2, 0);
  barrel(24.2, 3.4, K.blue); barrel(31.2, -14.5, K.green); barrel(31.9, -14.2, K.green); jersey(24.7, -11, 'x'); jersey(18, -24, 'x');
  for (const z of [-20, -10, 0, 10]) line(11.3, z - 0.06, 12.6, z + 0.06, K.yellow);
  line(16.9, -23, 17.1, 13, K.yellow); line(24.4, -23, 24.6, 13, K.yellow); line(31, -20, 31.2, 13, K.yellow);
  lamp(35, -8, -PI / 2); lamp(11.6, -24.4, 0);

  // ---------- north compound ----------
  bldg(-33, -47.4, -10, -34, 4.4, hex(0xc3bfb2), hex(0x586069));
  g.bx(-33.03, 3.3, -47.4, -9.97, 3.75, -33.97, hex(0x3f6ea8), 0, 12);
  for (const x of [-29.5, -23, -16.5]) { g.bx(x, 0, -34, x + 3.4, 3.1, -33.93, hex(0x77808c), 6); g.bx(x - 0.12, 0, -34, x, 3.25, -33.9, K.yellow, 0); g.bx(x + 3.4, 0, -34, x + 3.52, 3.25, -33.9, K.yellow, 0); g.bx(x - 0.12, 3.1, -34, x + 3.52, 3.25, -33.9, K.yellow, 0); }
  g.bx(-12.4, 0, -34, -11.3, 2.1, -33.94, hex(0x4a525e), 0);
  g.bx(-28, 4.72, -44, -25, 5.5, -41.5, K.steel, 12); g.bx(-20, 4.72, -45, -18.4, 5.3, -43.4, K.steel, 12); g.cyl(0.4, 0.4, 0.7, 10, K.steel, 12, TM(-14, 4.72, -40));
  g.bx(-31, 0, -34, -13.5, 1.0, -31.6, K.conc, 7, 8); g.bx(-31, 1.0, -31.75, -13.5, 1.02, -31.6, K.yellow, 0); solid(-31, -34, -13.5, -31.6, 1.02, 0);
  for (const x of [-27.8, -21.3, -14.8]) g.bx(x - 0.15, 0.4, -31.6, x + 0.15, 0.9, -31.5, hex(0x1d1e21), 0);
  crates(-29.5, -32.8, 1.0, 1, 0); g.bx(-30, 1.0, -33.3, -29, 2.0, -32.3, K.crate, 10); crates(-16, -30, 1.3, 2, 0.1); crates(-17.5, -29.6, 1.0, 1, 0.3);
  lowWall(-24, -27.2, -18.5, -26.7); sandbags(-5, -28.5, 0.5, -28.5, 3); sandbags(0.8, -28.2, 0.8, -31, 3);
  truck(2, -39.5, PI, hex(0x8a6f4a)); crates(7.5, -43.5, 1.4, 2, 0); crates(9.2, -43.8, 1.2, 1, 0.2); crates(-6, -44, 1.3, 2, 0.1); crates(-4.4, -44.4, 1.1, 1, 0);
  pallet(8, -34, 0, 0.9); pallet(9.5, -33.8, 0.1, 0.9); pallet(-6.5, -36.5, 0, 0.6); barrel(11, -37, K.blue); jersey(9, -29.5, 'x'); jersey(12.4, -31.5, 'z');
  fuelTank(17.5, -43.5, 6.5); fuelTank(27, -43.5, 6.5);
  g.bx(17, 0.5, -41.9, 33.6, 0.62, -41.78, K.steel, 12); g.bx(24.5, 0, -41.9, 24.62, 0.5, -41.78, K.steel, 12);
  lowWall(16, -33.5, 21, -33); sandbags(26, -31.5, 30.5, -31.5, 3); crates(33.5, -36.5, 1.3, 2, 0); crates(22.5, -38.2, 1.0, 1, 0.2);
  tower(34.2, -28.6); tower(-34.4, -24.6);
  lamp(13, -46.5, 0); lamp(-8, -46.5, 0); lamp(35.5, -40, -PI / 2);
  line(-31, -31.3, -13.5, -31.1, K.yellow); for (let i = 0; i < 9; i++) line(-31 + i * 2.2, -30.9, -30 + i * 2.2, -30.2, K.yellow);

  // ---------- explosive barrels (dynamic) ----------
  for (const p of [[15.2, 24.2], [-18.2, 14.8], [-8.3, -15.5], [24.4, -13.2], [18.4, 5.6], [22, -36], [22.75, -36.3], [28.2, -35], [-9, -30.5], [33, 9]])
    W.barrels.push({ x: p[0], z: p[1] });

  // ---------- colour accents ----------
  flag(-6.5, 44.6, 7.5, [K.blue, K.white, K.blue], 0); flag(6.5, 44.6, 7.5, [K.blue, K.white, K.blue], 0); flag(-10, -33.2, 6.5, [K.red, K.white, K.red], 0.3);
  stripes(-12.4, 10.35, -9.2, 11.1, K.yellow, hex(0x23252a), 8); stripes(1.2, 10.35, 3.2, 11.1, K.yellow, hex(0x23252a), 6); stripes(-4.4, 30.6, 4.4, 31.0, K.yellow, hex(0x23252a), 12);
  barrier(-4.3, 45.2, PI / 2, 3.4); for (const x of [-30, -20, 20, 30]) g.quadXZ(x - 1.2, 39, x + 1.2, 44, 0.012, hex(0x3d6fb0), 0);
  for (const [x, z, c] of [[-24, 3.2, hex(0x3f8ad0)], [-12, -14.6, hex(0xd0503f)], [0, -6.2, hex(0x46a35a)], [2.4, 3.6, hex(0xe0a92a)]]) g.quadXZ(x - 1.6, z - 1.1, x + 1.6, z + 1.1, 0.011, c, 0);
  // ---------- gameplay data ----------
  W.start = { x: -2.55, z: 36.4, yaw: PI };
  W.checkpoints = [{ x: -2.55, z: 36.4 }, { x: -10.8, z: 12.6 }, { x: 9.5, z: -1 }, { x: -10.8, z: -22.5 }];
  const E = (t, x, z, o) => W.spawns.push(Object.assign({ t, x, z }, o || {}));
  // outer yard
  E('rifle', -13, 23.5, { yaw: 0 }); E('rifle', 4, 19.5, { patrol: [[4, 19.5], [17, 23]] }); E('smg', 21, 21.5, { yaw: PI / 2 }); E('rifle', -22.5, 20, { yaw: 0.6 });
  // kill-house
  E('rifle', -11, 5.5, { yaw: 0 }); E('smg', -21, 5.5, { yaw: 1.2 }); E('rifle', -0.5, 6.5, { yaw: 0 }); E('rifle', 3.8, 3, { yaw: -0.5 });
  E('smg', -14, -1, { patrol: [[-14, -1], [3, -1]] }); E('rifle', -21.5, -7.5, { yaw: 1.5 }); E('smg', -22, -16.5, { yaw: 0.8 });
  E('rifle', -12, -14.5, { yaw: 0.3 }); E('heavy', -8, -6.5, { yaw: 0 }); E('rifle', 1, -6.5, { yaw: -1 }); E('rifle', 2.5, -16.5, { yaw: 0 }); E('smg', -2, -13.5, { yaw: 1 });
  // containers
  E('rifle', 17.5, -12, { patrol: [[17.5, -12], [17.5, 0.5]] }); E('rifle', 24.6, -7, { yaw: 0 }); E('smg', 24.6, 5, { yaw: 0 }); E('sniper', 33.5, -18, { yaw: 0.2 }); E('rifle', 32.5, 7.5, { yaw: -1 });
  // north compound
  E('heavy', -14, -28.8, { yaw: 0 }); E('rifle', -23, -29, { yaw: 0.2 }); E('rifle', -2.5, -30, { yaw: 0 }); E('smg', 6, -36, { patrol: [[6, -36], [-8, -36.5]] });
  E('rifle', 12.5, -41, { yaw: 0.5 }); E('sniper', 31.5, -29.5, { yaw: -0.4 }); E('heavy', 25, -34, { yaw: 0 }); E('rifle', 19, -30.5, { yaw: 0 });
  W.pickups = [['med', -21.5, 8.8], ['ammo', 4.4, 6.4], ['med', 2.8, -18.6], ['ammo', -24.6, -17.8], ['nade', -8.8, -18.6], ['ammo', 18.4, -2], ['med', 32.4, -8], ['nade', 31, 9], ['med', -8, -30.5], ['ammo', 8.6, -41.5], ['ammo', -1.5, 27.5], ['nade', -30, 23]];
  for (let i = 0; i < 30; i++) W.stains.push([rnd(-34, 34), rnd(-44, 44), rnd(0.7, 2.4), rnd(0.7, 2.0), rnd(TAU), rnd(0.07, 0.2)]);
  }
};

MAPS.liman = {
  id: 'liman', name: 'LİMAN', sub: 'Yük limanı · gün batımı', accent: '#ff9a5c',
  desc: 'Rəngli konteyner labirinti, nəhəng kranlar, anbar və yanacaq məntəqəsi. Arxada dəniz və yük gəmisi.',
  bounds: [-36, -42, 36, 44], weather: 'sea', skin: 'liman',
  zones: [{ n: 'GİRİŞ', a: 0, b: 4, r: null }, { n: 'KONTEYNERLƏR', a: 4, b: 14, r: [-36, -11, 36, 22] }, { n: 'ANBAR', a: 14, b: 21, r: [10, -29, 36, -11] }, { n: 'YANACAQ MƏNTƏQƏSİ', a: 21, b: 25, r: [-36, -29, 10, -11] }, { n: 'RIHTIM', a: 25, b: 32, r: [-36, -43, 36, -29] }],
  radar: { out: '#6d7072', in: '#b5b1a8', b0: '#d9dcdf' },
  theme: { wall: hex(0xa3a8ae), wallD: hex(0x8c9198), cap: hex(0xc6c8ca), wallM: 7 },
  env: { sun: [-0.82, 0.34, 0.46], sunC: [0.92, 0.56, 0.33], sky: [0.42, 0.42, 0.6], gnd: [0.44, 0.33, 0.3], fogC: [0.94, 0.66, 0.5], fog: [50, 175], zen: [0.2, 0.25, 0.52], mid: [0.66, 0.5, 0.62], sunG: [1, 0.66, 0.36], cloudC: [1, 0.74, 0.6], cloud: 0.55, gr: [1.18, 1.07, 1.04, 0], gt: [1.03, 0.98, 0.95] },
  thumb: { e: [34, 26, 40], l: [-4, 0, 0] },
  build(H) {
    const { g, solid, line, post, plyRun, concRun, crate, crates, barrel, sandbags, jersey, lowWall, plyCover, table, target, tires, pallet, lamp, tree, bush, container, wheel, vehSolid, van, truck, suv, forklift, tower, fuelTank, bldg, tri, beam, face, wallRun, house, awning, stall, palm, pine, hill, dune, snowPile, rock, bollard, shelf, vtank, crane, ship, hut, tent, heli, tank, lattice, radome, flag, helipad, well, domeHouse, carpet, wreck, technical, fence, stripes, barrier } = H;
    // ground & sea
    g.quadXZ(-320, -420, 320, -42.4, -0.7, hex(0x1f5f78), 13);
    g.quadXZ(-260, -42.4, 260, 260, -0.03, hex(0x86888a), 3);
    g.quadXZ(-36, -42.4, 36, 44, 0, hex(0xbdb9b0), 1);
    g.bx(-260, -1.4, -42.6, 260, 0.0, -42.2, hex(0x8f8b84), 7);
    for (let x = -34; x <= 34; x += 5) g.cyl(0.32, 0.32, 0.5, 10, K.tire, 0, TM(x, -0.35, -42.95, 0, PI / 2, 0));
    g.quadXZ(-4, -28, 4, 44, 0.006, K.asph, 3); g.quadXZ(-36, 18, 36, 22, 0.006, K.asph, 3); g.quadXZ(-36, -15, 36, -11, 0.006, K.asph, 3);
    for (let z = 24; z < 42; z += 4) line(-0.07, z, 0.07, z + 2, K.white); for (let x = -34; x < 34; x += 4) { line(x, 19.93, x + 2, 20.07, K.white); line(x, -13.07, x + 2, -12.93, K.white); }
    line(-36, -40.62, 36, -40.38, K.steel); line(-36, -31.62, 36, -31.38, K.steel); line(-36, -36.1, 36, -35.9, K.yellow);
    g.bx(-36, 0, -42.4, 36, 0.28, -42.05, K.yellow, 0); for (let x = -35; x < 35; x += 1.2) g.bx(x, 0.001, -42.41, x + 0.6, 0.281, -42.04, hex(0x23252a), 0);
    solid(-36, -42.4, 36, -42.05, 0.6, 2);
    // perimeter
    concRun('x', 44, -36, -5); concRun('x', 44, 5, 36); concRun('z', -36, -42, 44); concRun('z', 36, -42, 44);
    barrier(-4.6, 44.4, PI / 2, 4.0); g.bx(-4.9, 0, 43.4, -4.5, 1.1, 43.8, K.yellow, 0);
    // ---- GİRİŞ (south) ----
    container(-9.94, 31, -7.5, 43.06, K.blue);
    house(14, 30, 30, 40, 4.6, { col: hex(0xdad5ca), m: 7, roof: hex(0x5d6670), door: [0, 0.5, hex(0x2f5f86)], win: 2, ac: true, dish: true });
    g.bx(14.2, 3.2, 29.85, 29.8, 3.9, 29.95, hex(0x2f6fb3), 0);
    house(5.6, 40.5, 8.8, 43.4, 2.6, { col: hex(0xe6e2d8), m: 7, roof: K.blue, door: [2, 0.5, hex(0x2f5f86)], win: 1 });
    truck(-20, 30, 0, hex(0x9a3b2f)); truck(-26, 31, 0, hex(0x2f5f86)); suv(24, 25, PI / 2, hex(0x8a8f96));
    jersey(-4.9, 26, 'z'); jersey(4.9, 28.5, 'z'); sandbags(8, 24, 11.5, 24, 3);
    crates(-14, 26, 1.2, 2, 0.1); crates(-15.4, 27.1, 0.9, 1, 0.3); pallet(-31, 40, 0, 0.9); crates(-31.5, 36, 1.2, 1, 0); crates(-31.2, 34.7, 0.9, 2, 0.2);
    lamp(-12, 23.2, 0); lamp(12, 23.2, 0); lamp(-30, 23.2, 0); lamp(30, 23.2, 0);
    for (const x of [-30, -25, 18, 23, 28]) for (const k of [0, 1]) line(x + k * 2.6 - 0.06, 40.5, x + k * 2.6 + 0.06, 43.4, K.white);
    ES('rifle', -16, 23.6, { yaw: 0 }); ES('rifle', 9, 23.4, { patrol: [[9, 23.4], [19, 23.4]] }); ES('smg', 27, 27.4, { yaw: 0.5 }); ES('rifle', -29, 25.5, { yaw: 0.3 });
    // ---- KONTEYNERLƏR ----
    container(-32, 12, -19.94, 14.44, K.red); container(-16, 12, -3.94, 14.44, K.blue, K.white); container(4, 12, 16.06, 14.44, K.green); container(20, 12, 32.06, 14.44, hex(0xc9662b), K.blue);
    container(-26, 3, -13.94, 5.44, K.ochre, K.green); container(-10, 3, -3.94, 5.44, hex(0x8a8f96)); container(6, 3, 18.06, 5.44, K.rust, K.ochre); container(22, 3, 34.06, 5.44, K.blue);
    container(-34, -6, -21.94, -3.56, K.green, K.rust); container(-16, -6, -3.94, -3.56, hex(0x2f8f8a)); container(2, -6, 14.06, -3.56, K.white, K.blue); container(20, -6, 32.06, -3.56, K.rust);
    container(-30, -3.3, -27.56, 2.76, K.ochre); container(24, 5.7, 26.44, 11.76, K.green);
    forklift(10, 8.7, PI / 2); pallet(-18, 8.6, 0, 0.9); pallet(-16.6, 8.7, 0.1, 0.6); crates(30, 8.4, 1.2, 2, 0.1); crates(-30, 8.2, 1.3, 1, 0); crates(-6, -0.5, 1.1, 2, 0.2);
    pallet(17, -0.6, PI / 2, 1.0); jersey(-20, 0.2, 'x'); jersey(28, -0.2, 'x'); tires(-12.5, 9, 3); barrel(-2.6, 9.2, K.blue); barrel(-2.0, 9.7, K.blue); barrel(19.4, 16.2, K.green);
    lamp(-35.2, 8, PI / 2); lamp(35.2, 0, -PI / 2);
    ES('rifle', -24, 16.4, { yaw: 0 }); ES('rifle', 10, 16.6, { patrol: [[10, 16.6], [-12, 16.6]] }); ES('smg', 28.6, 10.4, { yaw: 0.3 }); ES('rifle', -21, 8.7, { yaw: 0.2 }); ES('heavy', 1, 8.7, { yaw: 0 });
    ES('rifle', -33, 0, { yaw: 0.6 }); ES('smg', 12, 0, { patrol: [[12, 0], [30, 0.2]] }); ES('rifle', -10, -0.4, { yaw: 0.2 }); ES('rifle', 26, -8.6, { yaw: 0 }); ES('smg', 6, -8.8, { yaw: -0.3 });
    // ---- ANBAR (east warehouse) ----
    const wc = { col: hex(0x5f8fa0), m: 6, h: 5.2, th: 0.32, cap: hex(0x37434c), pillars: 4 };
    wallRun('x', -28.5, 12, 34, [[19.5, 24, 0]], wc); wallRun('x', -17, 12, 34, [[15, 19, 0], [27, 31, 0]], wc); wallRun('z', 12, -28.5, -17, [[-24.5, -21, 0]], wc); wallRun('z', 34, -28.5, -17, [], wc);
    for (let x = 13.5; x < 34; x += 3.5) { g.bx(x - 0.1, 5.25, -28.5, x + 0.1, 5.55, -17, hex(0x37434c), 12); beam(x, 5.55, -28.5, x, 6.6, -22.75, 0.16, hex(0x37434c), 12); beam(x, 5.55, -17, x, 6.6, -22.75, 0.16, hex(0x37434c), 12); }
    g.bx(12, 6.5, -22.85, 34, 6.7, -22.65, hex(0x37434c), 12); g.bx(12.2, 4.2, -17.25, 33.8, 5.0, -17.12, hex(0xe07b28), 0);
    shelf(15, -26.6, 25, -25.7, 3); shelf(15, -22.6, 23, -21.7, 3); shelf(28.5, -27.6, 29.4, -20.5, 3);
    forklift(26, -19.6, PI); pallet(31.6, -19.4, 0, 0.9); pallet(31.6, -26.6, 0, 1.0); crates(25.6, -27.2, 1.1, 2, 0); crates(14, -19, 1.1, 1, 0.2); tires(32.6, -23, 3);
    ES('rifle', 20, -19.6, { yaw: 0 }); ES('heavy', 31, -23.4, { yaw: 1.2 }); ES('smg', 19, -24.2, { yaw: 0.4 }); ES('rifle', 27.2, -24.2, { yaw: 0.6 }); ES('rifle', 13.4, -27.2, { yaw: 1 }); ES('smg', 32.4, -18.2, { yaw: -0.3 }); ES('rifle', 22.4, -27.6, { yaw: 0.2 });
    // ---- YANACAQ (west depot) ----
    vtank(-28, -23, 3.0, 6.6, hex(0xe8e6df), K.red); vtank(-19.5, -23, 3.0, 6.6, hex(0xe8e6df), K.blue);
    for (const y of [1.2, 1.6]) g.bx(-25, y, -23.15, -22.5, y + 0.22, -22.85, K.steel, 12); g.bx(-23.9, 0, -23.2, -23.6, 1.8, -22.8, K.steel, 12);
    fuelTank(-14, -26, 6); fence('x', -17.7, -35.5, -22.5); fence('x', -17.7, -17, -9); fence('z', -9, -28.5, -17.7);
    sandbags(-13, -20.5, -9.8, -20.5, 3); sandbags(-33, -19.5, -30, -19.5, 3); crates(-11, -27.6, 1.2, 1, 0); pallet(-33.5, -27.8, 0, 0.8);
    ES('rifle', -24, -18.8, { yaw: 0 }); ES('rifle', -31, -27.6, { yaw: 0.7 }); ES('smg', -12, -23.2, { yaw: 0 }); ES('heavy', -23.6, -27.6, { yaw: 0.2 });
    // ---- RIHTIM (quay) ----
    crane(-14, -40.5, -31.5, hex(0xc9452f)); crane(16, -40.5, -31.5, hex(0x2f6fb3));
    container(-34, -38, -27.94, -35.56, K.blue, K.rust); container(-2, -39, 4.06, -36.56, K.green, K.white); container(26, -37, 32.06, -34.56, K.ochre); container(-30, -33, -27.56, -29.94, K.white);
    for (let x = -33; x <= 33; x += 6) { if ([-20.5, -7.5, 9.5, 22.5].some(lx => abs(lx - x) < 1.4)) continue; bollard(x, -41.5); }
    pallet(6, -33, 0, 0.9); crates(-24, -36.8, 1.2, 2, 0.1); jersey(10.5, -36, 'x'); sandbags(-9, -36, -5.5, -36, 3); tires(31, -40.4, 3);
    ship(-70, 46, -47, -61);
    for (const [x, z] of [[-90, -150], [80, -170], [140, -120]]) g.bx(x, -0.7, z - 6, x + 30, 3, z + 6, hex(0x3a4a5a), 12);
    ES('rifle', -14, -36.2, { yaw: 0 }); ES('rifle', 16, -35.4, { yaw: 0 }); ES('heavy', 2, -33.2, { yaw: 0 }); ES('smg', -26, -33.8, { yaw: 0.4 }); ES('sniper', 30, -40.6, { yaw: -0.4 }); ES('rifle', -32.6, -40.6, { yaw: 0.6 }); ES('smg', 8, -40.2, { yaw: 0 });
    // backdrop: city/industry outside the walls
    for (let i = 0; i < 9; i++) { const side = i % 3, x = side === 0 ? rnd(-90, -45) : side === 1 ? rnd(45, 90) : rnd(-60, 60), z = side === 2 ? rnd(55, 85) : rnd(-30, 60), w = rnd(10, 22), d = rnd(10, 20), h = rnd(6, 16); g.bx(x, 0, z, x + w, h, z + d, pick([hex(0x8a9099), hex(0x9b8a78), hex(0x7a8a8a), hex(0xa39a8e)]), 6); g.bx(x - 0.2, h, z - 0.2, x + w + 0.2, h + 0.4, z + d + 0.2, hex(0x5a6068), 0); }
    for (let i = 0; i < 14; i++) tree(pick([-1, 1]) * rnd(40, 70), rnd(-30, 80), rnd(0.9, 1.4));
    for (const p of [[-24.4, -19.4], [-11, -21.5], [5.6, -0.8], [-18.2, 9.6], [20.5, -21.3], [31.4, -21.6], [-6.4, -33.4], [12.2, -35.3], [-30.6, 24.2], [18, 20.8]]) W.barrels.push({ x: p[0], z: p[1] });
    W.start = { x: -6.75, z: 37, yaw: PI };
    W.checkpoints = [{ x: -6.75, z: 37 }, { x: 0, z: 20 }, { x: -0.5, z: -9 }, { x: 1, z: -27 }];
    W.pickups = [['med', 0.6, 26], ['ammo', -13.6, 21], ['med', 20, 9], ['ammo', -22, -1.2], ['nade', 8.2, -1.2], ['med', 23.5, -21], ['ammo', 16, -19.4], ['nade', -15.4, -20], ['med', -2.4, -33], ['ammo', 20.6, -38.4], ['nade', -20, 16.4], ['ammo', 32, 16.5]];
    stainsIn(26);
  }
};

MAPS.sehra = {
  id: 'sehra', name: 'SƏHRA KƏNDİ', sub: 'Qum təpələri arasında · günorta', accent: '#f1c55b',
  desc: 'Kərpic evlər, rəngarəng bazar, palma bağları və köhnə qala. Dar küçələrdə gərgin döyüş.',
  bounds: [-38, -44, 38, 44], weather: 'dust', skin: 'sehra',
  zones: [{ n: 'KƏND GİRİŞİ', a: 0, b: 4, r: null }, { n: 'BAZAR', a: 4, b: 11, r: [-12, -24, 12, 24] }, { n: 'QƏRB MƏHƏLLƏSİ', a: 11, b: 17, r: [-38, -26, -12, 24] }, { n: 'ŞƏRQ MƏHƏLLƏSİ', a: 17, b: 23, r: [12, -26, 38, 24] }, { n: 'QALA', a: 23, b: 31, r: [-38, -45, 38, -26] }],
  radar: { out: '#d6b483', in: '#cfae7f', b0: '#9c6f48', b1: '#8a6a44' },
  theme: { wall: K.clay, wallD: K.clayD, cap: hex(0xe2bd8f), wallM: 15, bag: hex(0xcdb38a), bagD: hex(0xb89c72), wire: false },
  env: { sun: [0.35, 0.88, -0.32], sunC: [0.8, 0.71, 0.56], sky: [0.52, 0.58, 0.7], gnd: [0.56, 0.46, 0.36], fogC: [0.92, 0.84, 0.7], fog: [55, 165], zen: [0.16, 0.4, 0.78], mid: [0.55, 0.7, 0.88], sunG: [1, 0.95, 0.8], cloudC: [1, 0.98, 0.95], cloud: 0.25, gr: [1.16, 1.08, 0.98, 0], gt: [1.04, 1.0, 0.93] },
  thumb: { e: [30, 28, 46], l: [-4, 0, 2] },
  build(H) {
    const { g, solid, line, post, plyRun, concRun, crate, crates, barrel, sandbags, jersey, lowWall, plyCover, table, target, tires, pallet, lamp, tree, bush, container, wheel, vehSolid, van, truck, suv, forklift, tower, fuelTank, bldg, tri, beam, face, wallRun, house, awning, stall, palm, pine, hill, dune, snowPile, rock, bollard, shelf, vtank, crane, ship, hut, tent, heli, tank, lattice, radome, flag, helipad, well, domeHouse, carpet, wreck, technical, fence, stripes, barrier } = H;
    const sandC = hex(0xd8b888), road = hex(0xc6a77c), pal = [[hex(0xc23b2b), hex(0xf2e6c8)], [hex(0x2f7f9a), hex(0xf2e6c8)], [hex(0xe08a2a), hex(0x7a3b8a)], [hex(0x3f8a5a), hex(0xf0d36a)], [hex(0x8a2a4a), hex(0xe9d6b0)]];
    g.quadXZ(-320, -320, 320, 320, -0.03, K.sand, 16); g.quadXZ(-38, -44, 38, 44, 0, sandC, 16);
    g.quadXZ(-4.5, -26, 4.5, 44, 0.006, road, 5); g.quadXZ(-38, 22, 38, 26, 0.006, road, 5); g.quadXZ(-38, -2, -12, 2, 0.006, road, 5); g.quadXZ(12, -2, 38, 2, 0.006, road, 5);
    g.quadXZ(-11, -9, 11, 9, 0.008, hex(0xd3bc98), 1);
    // perimeter
    concRun('x', 44, -38, -4.5); concRun('x', 44, 4.5, 38); concRun('x', -44, -38, 38); concRun('z', -38, -44, 44); concRun('z', 38, -44, 44);
    for (const sx of [-1, 1]) { g.bx(sx * 4.5 - 0.7, 0, 43.3, sx * 4.5 + 0.7, 4.4, 44.7, K.clayD, 15); g.bx(sx * 4.5 - 0.85, 4.4, 43.15, sx * 4.5 + 0.85, 4.7, 44.85, hex(0xe2bd8f), 0); }
    g.bx(-5.2, 3.6, 43.6, 5.2, 4.4, 44.4, K.clay, 15);
    // ---- GİRİŞ ----
    wallRun('z', -9.2, 29, 43, [], { h: 2.4 });
    house(-22, 30, -12, 40, 3.2, { door: [3, 0.3, hex(0x2f6f86)], win: 2, awn: [3, 0.75, pal[0][0], pal[0][1]] });
    house(9, 30, 19, 38, 3.4, { door: [2, 0.5, hex(0x3f8a5a)], win: 2, tank: true });
    house(24, 28, 34, 40, 5.6, { door: [2, 0.4, hex(0x8a3a6a)], win: 2, shutter: hex(0x2f7f9a), awn: [2, 0.75, pal[1][0], pal[1][1]] });
    wreck(2.2, 28.5, -0.25); wreck(-15, 25.5, 1.4); sandbags(4.5, 40.8, 8, 40.8, 3); technical(15, 41, PI / 2, hex(0xd8d2c4));
    palm(7, 25, 1.1); palm(-28, 26, 1.0); palm(31, 25, 1.15); palm(-34, 41, 1.0); palm(21, 41.5, 0.9);
    ES('rifle', -14, 23.4, { yaw: 0 }); ES('rifle', 8, 23.6, { patrol: [[8, 23.6], [20, 24.4]] }); ES('smg', 27, 25.2, { yaw: 0.3 }); ES('rifle', -31, 30, { yaw: 0.8 });
    // ---- BAZAR ----
    house(-14, 10, -8.5, 21.5, 3.6, { door: [3, 0.5, hex(0x8a3a2c)], win: 1 }); house(8.5, 10, 14, 21.5, 4.0, { door: [2, 0.55, hex(0x2f6f86)], win: 1, shutter: hex(0x3f8a5a) });
    stall(-6.3, 18, PI / 2, pal[0][0], pal[0][1]); stall(-6.3, 13, PI / 2, pal[3][0], pal[3][1]); stall(6.3, 16, -PI / 2, pal[1][0], pal[1][1]); stall(6.3, 11.4, -PI / 2, pal[2][0], pal[2][1]);
    well(0, 0); stall(-8, -6.6, 0, pal[4][0], pal[4][1]); stall(8, 6.6, PI, pal[2][0], pal[2][1]); stall(-8, 6.6, PI, pal[1][0], pal[1][1]); stall(8.2, -6.6, 0, pal[3][0], pal[3][1]);
    carpet(-3.5, 5.8, 2.2, 1.4, 0.1, hex(0xa3302a), hex(0xe0b44a)); carpet(4, -5, 2.0, 1.3, -0.2, hex(0x2a4f8a), hex(0xd8c39a)); carpet(-4.6, -3.6, 1.8, 1.2, 0.4, hex(0x3f7a4a), hex(0xe8d8b0));
    domeHouse(-14, -21, -5, -12, 5, hex(0xe6d2ad), hex(0x2f8f9a)); house(5, -21, 13, -13, 4.4, { door: [2, 0.5, hex(0x8a3a6a)], win: 1, awn: [2, 0.4, pal[2][0], pal[2][1]] });
    palm(-10, 7.6, 0.9); palm(10.4, -8, 1.0);
    for (const [x, z] of [[-2.2, 7.6], [2.6, -7.8], [-9.6, 1.5]]) { g.cyl(0.25, 0.18, 0.55, 8, hex(0xb5693a), 0, TM(x, 0, z)); g.cyl(0.22, 0.25, 0.4, 8, hex(0xc58a4a), 0, TM(x + 0.5, 0, z + 0.2)); }
    ES('rifle', 0, 15, { patrol: [[0, 15], [0, -9.5]] }); ES('smg', -9, 3.6, { yaw: 1 }); ES('rifle', 7.6, 2, { yaw: -0.8 }); ES('rifle', -3, -9.6, { yaw: 0 }); ES('heavy', 5.6, -10.4, { yaw: 0 }); ES('rifle', 6.6, 20.6, { yaw: 0.4 }); ES('smg', -6.4, 9.5, { yaw: 0.6 });
    // ---- QƏRB MƏHƏLLƏSİ ----
    const cw = { h: 2.3 };
    wallRun('x', -20, -34, -18, [[-28, -25.5, 0]], cw); wallRun('x', -6, -34, -18, [[-24, -21.5, 0]], cw); wallRun('z', -34, -20, -6, [], cw); wallRun('z', -18, -20, -6, [[-14, -11.5, 0]], cw);
    house(-32.5, -18.5, -27.5, -14, 3, { door: [3, 0.5, hex(0x2f6f86)], win: 1 }); tent(-22, -16.5, 0, 3.4, 4.2, hex(0x8a7a58)); technical(-24, -9.6, PI / 2, hex(0xc9c2b2));
    carpet(-29, -9.6, 2.4, 1.6, 0, hex(0x7a2a3a), hex(0xd9b36a)); crates(-32.4, -8, 1.0, 2, 0.1);
    house(-30, -1.5, -20, 6, 3.6, { door: [1, 0.5, hex(0x8a3a2c)], win: 2, awn: [1, 0.5, pal[4][0], pal[4][1]] }); house(-33, 10, -22, 20, 4.2, { door: [3, 0.5, hex(0x3f8a5a)], win: 2, tank: true });
    palm(-17, 10, 1.05); palm(-36, -1, 0.95); palm(-15.5, -23.5, 1.0);
    ES('rifle', -26, -13, { yaw: 0.4 }); ES('smg', -21, -9, { yaw: 0 }); ES('rifle', -30.6, -10, { yaw: 0.5 }); ES('rifle', -26.4, 8.2, { yaw: 0.2 }); ES('smg', -16, -3.6, { yaw: 0.8 }); ES('sniper', -35.6, 4, { yaw: 1.3 });
    // ---- ŞƏRQ MƏHƏLLƏSİ ----
    wallRun('x', -22, 18, 34, [[22.5, 25, 0]], cw); wallRun('x', -8, 18, 34, [[28, 30.5, 0]], cw); wallRun('z', 18, -22, -8, [[-16, -13.5, 0]], cw); wallRun('z', 34, -22, -8, [], cw);
    house(26, -20.5, 33, -14, 5.6, { door: [2, 0.5, hex(0x2f6f86)], win: 1, shutter: hex(0x8a3a2c) }); crates(20.5, -19.5, 1.2, 2, 0); crates(21.8, -20.2, 0.9, 1, 0.3); sandbags(21, -11.5, 24.5, -11.5, 3);
    carpet(29.6, -10.6, 2.4, 1.4, 0, hex(0x2a4f8a), hex(0xe0b44a));
    house(18, -4, 30, 4, 3.6, { door: [2, 0.5, hex(0x8a3a6a)], win: 2, awn: [2, 0.5, pal[3][0], pal[3][1]] }); house(20, 8, 32, 18, 4.2, { door: [2, 0.5, hex(0x2f6f86)], win: 2, ac: true });
    palm(35.5, 5, 1.0); palm(16, 12, 1.1); palm(36, -24, 1.0);
    ES('rifle', 23.6, -13, { yaw: 0.2 }); ES('smg', 30.4, -10, { yaw: -0.5 }); ES('heavy', 21.2, -16.6, { yaw: 0.3 }); ES('rifle', 34.6, 6, { yaw: -1 }); ES('rifle', 16, -2.2, { yaw: 0.2 }); ES('sniper', 35.5, -26, { yaw: -0.5 });
    // ---- QALA (fort) ----
    const fw = { h: 3.4, th: 0.9, pillars: 6, col: hex(0xc4956a), cap: hex(0xa77d55) };
    wallRun('x', -26, -18, 18, [[-3, 3, 0]], fw); wallRun('z', -18, -43.5, -26, [[-36, -33, 0]], fw); wallRun('z', 18, -43.5, -26, [[-34, -31, 0]], fw);
    for (let x = -17.5; x < 17.5; x += 1.4) if (abs(x) > 3.6) g.bx(x - 0.35, 3.5, -26.45, x + 0.35, 4.0, -25.55, hex(0xa77d55), 15);
    for (const sx of [-1, 1]) { house(sx * 18 - 2.2, -28.2, sx * 18 + 2.2, -23.8, 5.8, { col: hex(0xc4956a), win: 1 }); g.bx(sx * 3 - 0.9, 0, -26.9, sx * 3 + 0.9, 4.6, -25.1, hex(0xb3845a), 15); }
    g.bx(-3.9, 4.6, -26.9, 3.9, 5.3, -25.1, hex(0xb3845a), 15);
    tent(-10, -36, 0, 4, 5, hex(0x7a6a4a)); tent(10, -38.5, PI / 2, 4, 5, hex(0x6f7452)); technical(0, -36, PI, hex(0xbfb49c));
    crates(-13, -30, 1.2, 2, 0.1); crates(13.6, -29.6, 1.1, 2, 0); crates(-4, -42, 1.2, 1, 0); sandbags(-8, -29.5, -4.5, -29.5, 3); sandbags(4.5, -30, 8, -30, 3); pallet(14, -42.2, 0, 0.8);
    flag(0, -42.6, 6.5, [hex(0x2a2a2a), hex(0x9a2a2a)], 0);
    ES('heavy', 0, -30.4, { yaw: 0 }); ES('rifle', -10, -30.4, { yaw: 0.1 }); ES('rifle', 10.4, -31.4, { yaw: -0.2 }); ES('smg', -12.4, -40.6, { yaw: 0.5 }); ES('rifle', 12.4, -42, { yaw: -0.4 }); ES('heavy', 0, -41.4, { yaw: 0 }); ES('rifle', -15.4, -35, { yaw: 1 }); ES('smg', 5, -34.2, { yaw: -0.3 });
    // backdrop
    for (let i = 0; i < 26; i++) { const a = rnd(TAU), r = rnd(58, 130); dune(cos(a) * r, sin(a) * r, rnd(14, 30), rnd(3, 8), rnd(12, 26), pick([K.sand, hex(0xd6b07e), hex(0xe3c69a)])); }
    for (let i = 0; i < 8; i++) { const a = rnd(TAU), r = rnd(120, 170); hill(cos(a) * r, sin(a) * r, rnd(22, 40), hex(0xb98f62), false); }
    for (let i = 0; i < 22; i++) { const a = rnd(TAU), r = rnd(44, 75); palm(cos(a) * r, sin(a) * r, rnd(0.9, 1.3)); }
    for (let i = 0; i < 7; i++) { const a = rnd(TAU), r = rnd(50, 85), x = cos(a) * r, z = sin(a) * r, w = rnd(6, 12), d = rnd(6, 10), h = rnd(3, 6); g.bx(x, 0, z, x + w, h, z + d, pick([K.clay, hex(0xd9b082), hex(0xc4956a)]), 15); g.bx(x - 0.1, h, z - 0.1, x + w + 0.1, h + 0.5, z + d + 0.1, K.clayD, 0); }
    for (const p of [[-2.8, 20.5], [11.6, 24.5], [-11, -23.4], [-16.6, 3.2], [24.6, -6.8], [-26.6, -18.4], [24.5, -16], [-6.6, -32.6], [7, -42.6], [-30.5, 22.4]]) W.barrels.push({ x: p[0], z: p[1] });
    W.start = { x: -8.25, z: 36.5, yaw: PI };
    W.checkpoints = [{ x: -8.25, z: 36.5 }, { x: 0, z: 22.5 }, { x: 0, z: -10.5 }, { x: 0, z: -24 }];
    W.pickups = [['med', -2, 30], ['ammo', -19, 23.2], ['med', 3, 9.6], ['ammo', -10.6, -10.4], ['nade', -28.5, -7.6], ['med', -18, 7.4], ['ammo', 25.4, -10.4], ['nade', 15.2, 5.2], ['med', 20.4, -21], ['ammo', -14.6, -31.6], ['nade', 15, -40.6], ['med', 2.6, -42.2]];
    stainsIn(14);
  }
};

MAPS.qis = {
  id: 'qis', name: 'QIŞ BAZASI', sub: 'Dağ bazası · qar yağır', accent: '#9fd4ff',
  desc: 'Qarla örtülmüş hərbi baza: kazarmalar, helikopter meydançası, rabitə qülləsi və qərargah.',
  bounds: [-36, -44, 36, 42], weather: 'snow', skin: 'qis',
  zones: [{ n: 'KPP', a: 0, b: 4, r: null }, { n: 'KAZARMALAR', a: 4, b: 11, r: [-36, 4, 36, 24] }, { n: 'HELİPORT', a: 11, b: 17, r: [6, -24, 36, 4] }, { n: 'RABİTƏ', a: 17, b: 23, r: [-36, -24, 6, 4] }, { n: 'QƏRARGAH', a: 23, b: 31, r: [-36, -45, 36, -24] }],
  radar: { out: '#dfe7ef', in: '#eef3f8', b0: '#6f7886', b1: '#8a7a62', b2: '#5d6b7a', low: 'rgba(120,130,145,.5)' },
  theme: { wall: hex(0xaab0b6), wallD: hex(0x90969d), cap: hex(0xc9ccd0), wallM: 7, snow: true, bag: hex(0x7b8164), bagD: hex(0x6a7056) },
  env: { sun: [0.5, 0.55, 0.67], sunC: [0.52, 0.52, 0.56], sky: [0.5, 0.56, 0.66], gnd: [0.5, 0.53, 0.58], fogC: [0.8, 0.85, 0.91], fog: [30, 120], zen: [0.4, 0.5, 0.64], mid: [0.66, 0.73, 0.83], sunG: [1, 0.96, 0.9], cloudC: [0.9, 0.92, 0.96], cloud: 0.95, gr: [1.1, 1.06, 0.96, 0], gt: [0.97, 1.0, 1.05] },
  thumb: { e: [30, 28, 44], l: [-4, 0, 0] },
  build(H) {
    const { g, solid, line, post, plyRun, concRun, crate, crates, barrel, sandbags, jersey, lowWall, plyCover, table, target, tires, pallet, lamp, tree, bush, container, wheel, vehSolid, van, truck, suv, forklift, tower, fuelTank, bldg, tri, beam, face, wallRun, house, awning, stall, palm, pine, hill, dune, snowPile, rock, bollard, shelf, vtank, crane, ship, hut, tent, heli, tank, lattice, radome, flag, helipad, well, domeHouse, carpet, wreck, technical, fence, stripes, barrier } = H;
    const snowG = hex(0xeaeff4), road = hex(0x737880);
    g.quadXZ(-320, -320, 320, 320, -0.03, K.snow, 14); g.quadXZ(-36, -44, 36, 42, 0, snowG, 14);
    g.quadXZ(-4, -32, 4, 42, 0.006, road, 3); g.quadXZ(-36, 0, 36, 4, 0.006, road, 3); g.quadXZ(-36, -24, 36, -20, 0.006, road, 3);
    for (let z = -30; z < 40; z += 3.2) { snowPile(-4.6, z + rnd(-0.5, 0.5), rnd(0.5, 0.8)); snowPile(4.6, z + rnd(-0.5, 0.5), rnd(0.5, 0.8)); }
    for (let x = -34; x < 34; x += 3.4) { if (abs(x) < 5) continue; snowPile(x, -0.5, rnd(0.45, 0.7)); snowPile(x, 4.6, rnd(0.45, 0.7)); snowPile(x, -24.6, rnd(0.45, 0.7)); snowPile(x, -19.4, rnd(0.45, 0.7)); }
    // perimeter
    concRun('x', 42, -36, -4.5); concRun('x', 42, 4.5, 36); concRun('x', -44, -36, 36); concRun('z', -36, -44, 42); concRun('z', 36, -44, 42);
    barrier(-4.3, 42.6, PI / 2, 3.6); tower(-33.4, 39.4); tower(33.4, 39.4);
    // ---- KPP ----
    hut(-19, 28, -7.3, 39, { door: 0.35, col: hex(0x5f7058), sign: hex(0x3f6ea8) });
    house(5.6, 36.6, 8.6, 39.6, 2.6, { col: hex(0xdfe3e6), m: 7, roof: K.red, door: [2, 0.5, hex(0x3a4048)], win: 1 });
    truck(14, 33, PI / 2, hex(0x5f6b52)); suv(26, 38.4, PI / 2, hex(0xdfe3e6)); sandbags(9, 26, 12.5, 26, 3); jersey(-4.9, 27, 'z'); jersey(4.9, 30, 'z');
    pine(-30, 33, 1.1); pine(-25, 36.5, 0.9); pine(30, 28, 1.0); lamp(-12, 25, 0); lamp(14, 25, 0);
    ES('rifle', -14, 24.6, { yaw: 0 }); ES('rifle', 10, 25, { patrol: [[10, 25], [24, 26]] }); ES('smg', 28.6, 31, { yaw: 0.5 }); ES('rifle', -28, 25.6, { yaw: 0.3 });
    // ---- KAZARMALAR ----
    hut(-32, 8, -20, 14.5, { door: 0.5, col: hex(0x667a5a) }); hut(-32, 17, -20, 22.6, { door: 0.5, col: hex(0x6d7a62), doorC: hex(0x3f6ea8) });
    hut(12, 8, 24, 14.5, { door: 0.4, col: hex(0x667a5a) }); hut(12, 17, 24, 22.6, { door: 0.6, col: hex(0x5f7058), sign: K.red });
    tank(30, 12, 0, hex(0x9ea39a)); sandbags(-9, 10, -5.6, 10, 3); sandbags(5.6, 18, 9, 18, 3); crates(-8, 20.6, 1.2, 2, 0.1); crates(8.4, 8.6, 1.1, 1, 0.2);
    flag(-1.6, 20.6, 7, [K.white, hex(0x3f6ea8), K.white], 0); for (const [x, z] of [[-14, 6.8], [10, 21.2], [-34, 16], [34, 22]]) pine(x, z, 0.85);
    ES('rifle', -17.4, 11.2, { yaw: 0.2 }); ES('smg', -26, 16, { yaw: 0 }); ES('rifle', -8, 15.6, { patrol: [[-8, 15.6], [8, 15.6]] }); ES('rifle', 17, 16, { yaw: 0 }); ES('heavy', 6.6, 6.8, { yaw: 0 }); ES('smg', 26.4, 20, { yaw: -0.3 }); ES('rifle', -12, 6.2, { yaw: 0.4 });
    // ---- HELİPORT ----
    helipad(22, -11, 5.6); heli(22, -11, 0.6, hex(0x6b7a5a)); house(28, -20, 35.5, -4, 6, { col: hex(0x7d8a7a), m: 6, roof: hex(0x5a6570), door: [2, 0.5, hex(0x3a4048)], win: 1 });
    radome(14, -19, 1.0); for (let i = 0; i < 5; i++) barrel(9.6 + i * 0.62, -2.2, K.green); pallet(13.5, -6, 0, 0.9);
    ES('rifle', 18, -3.6, { yaw: 0 }); ES('rifle', 26, -5.6, { yaw: 0.3 }); ES('smg', 14, -13.6, { yaw: 0.6 }); ES('heavy', 26, -18.6, { yaw: 0 }); ES('sniper', 33.6, -1.2, { yaw: -0.6 }); ES('rifle', 9.6, -21.4, { yaw: 0.4 });
    // ---- RABİTƏ ----
    lattice(-22, -12, 18, hex(0xd23a2a), K.white); fence('x', -15.4, -28.4, -15.6); fence('x', -8.6, -28.4, -24); fence('x', -8.6, -20, -15.6); fence('z', -28.4, -15.4, -8.6); fence('z', -15.6, -15.4, -8.6);
    container(-34, -6, -27.94, -3.56, K.green); hut(-34, -20, -26, -14, { door: 0.5, col: hex(0x7a6a52) }); house(-14, -20, -7, -14, 3, { col: hex(0xc9ccd0), m: 7, dish: true, door: [1, 0.5, hex(0x3a4048)], win: 1 });
    crates(-30, -10, 1.2, 2, 0.1); sandbags(-14, -5.6, -10.5, -5.6, 3); pine(-35, -23, 0.9);
    ES('rifle', -20.4, -6, { yaw: 0.2 }); ES('smg', -26.4, -11.6, { yaw: 0.5 }); ES('rifle', -16, -17, { yaw: 0.4 }); ES('heavy', -30, -22.6, { yaw: 0 }); ES('rifle', -10, -3.6, { yaw: 0 }); ES('sniper', -34, -1, { yaw: 1.2 });
    // ---- QƏRARGAH ----
    house(-12, -40, 12, -32, 3.6, { col: hex(0x9aa0a6), m: 7, roof: hex(0x6a7078), door: [1, 0.5, hex(0x3a4048)], win: 2, dish: true, ac: true });
    g.bx(-12.05, 2.6, -32.05, 12.05, 3.0, -31.9, hex(0x3f6ea8), 0);
    tank(-26, -34, 0.3, hex(0x9ea39a)); truck(22, -32, 0, hex(0x5f6b52)); tower(-31, -39.4); tower(31, -39.4);
    sandbags(-6, -27.6, -2.5, -27.6, 3); sandbags(2.5, -27.6, 6, -27.6, 3); sandbags(-18, -28, -14.5, -28, 3); crates(15, -40.6, 1.2, 2, 0); crates(-15.6, -41, 1.1, 1, 0.2); container(26, -43.4, 32.06, -40.96, K.blue);
    for (const x of [-20, 18]) pine(x, -42.4, 0.8);
    ES('heavy', 0, -28.6, { yaw: 0 }); ES('rifle', -14, -30.4, { yaw: 0.2 }); ES('rifle', 14, -30, { yaw: -0.2 }); ES('smg', -20, -38, { yaw: 0.6 }); ES('smg', 18, -38, { yaw: -0.4 }); ES('rifle', -6, -42.4, { yaw: 0 }); ES('rifle', 8, -42.4, { yaw: 0 }); ES('sniper', -28.4, -27.6, { yaw: 0.6 });
    // backdrop: pine forest + snowy mountains
    for (let i = 0; i < 70; i++) { const a = rnd(TAU), r = rnd(42, 95), x = cos(a) * r, z = sin(a) * r; if (abs(x) < 39 && abs(z) < 47) continue; pine(x, z, rnd(1.0, 1.8), false); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + rnd(-0.2, 0.2), r = rnd(130, 185); hill(cos(a) * r, sin(a) * r, rnd(38, 65), hex(0x7d8590), true); }
    for (let i = 0; i < 30; i++) { const a = rnd(TAU), r = rnd(40, 70); snowPile(cos(a) * r, sin(a) * r, rnd(1.5, 3.5)); }
    for (const p of [[-3.2, 22.6], [11.4, 6.6], [-19, 6.8], [31.8, 5.2], [18.4, -18.4], [-26.4, -2.2], [-11.6, -13], [-4.2, -30], [20.6, -27.6], [-33.4, 24.6]]) W.barrels.push({ x: p[0], z: p[1] });
    W.start = { x: -6.55, z: 36.4, yaw: PI };
    W.checkpoints = [{ x: -6.55, z: 36.4 }, { x: 0, z: 24.5 }, { x: 0, z: 2 }, { x: 0, z: -22 }];
    W.pickups = [['med', 1.8, 31], ['ammo', -14.6, 26.2], ['med', -10.6, 18.6], ['ammo', 9.4, 16.2], ['nade', 27.6, 6.4], ['med', 16.4, -6.2], ['ammo', 31.6, -22.2], ['nade', -24.6, -17], ['med', -6.4, -9.6], ['ammo', -33.2, -12], ['nade', 2.6, -42.2], ['med', 25.6, -26]];
    stainsIn(8);
  }
};
