// ===== Hunyuan3D models: soldiers (rigid limb parts in the game's own bone frames) + weapons =====
// assets/mb_models.bin holds every mesh (int16 positions, int8 normals, per-vertex colour class, uint16 indices).
// Each soldier part is already in the frame the IK rig drives (pelvis, torso, head, upper/fore arms, thighs, shins, boots),
// so the existing procedural animation moves real arms, legs and torso; missing parts fall back to the procedural kit.
const HY = { d: null, base: 0, buf: null, ok: 0 };
const HY_PARTS = { pelvis: 'pelvis', torso: 'torso', head: 'head', uarmR: 'uarmR', farmR: 'farmR', uarmL: 'uarmL', farmL: 'farmL', thighR: 'thighR', shinR: 'shinR', bootR: 'bootR', thighL: 'thighL', shinL: 'shinL', bootL: 'bootL' };
async function hyLoad() {
  if (location.protocol === 'file:') return;
  try {
    const r = await Promise.race([fetch('assets/mb_models.bin'), new Promise((_, j) => setTimeout(() => j(new Error('timeout')), 20000))]);
    if (!r.ok) return; const buf = await r.arrayBuffer(), dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x314D424D) return;
    const jl = dv.getUint32(4, true); HY.d = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, jl))); HY.base = 8 + jl; HY.buf = buf;
  } catch (e) { HY.d = null; }
}
function hyGeo(M, cols, mats) {
  const b = HY.buf, o = HY.base, nv = M.nv, q = M.q, s = q[3];
  const P = new Int16Array(b, o + M.p, nv * 3), N = new Int8Array(b, o + M.n, nv * 3), C = new Uint8Array(b, o + M.c, nv), I = new Uint16Array(b, o + M.i, M.nf * 3);
  const v = new Float32Array(nv * 10);
  for (let k = 0; k < nv; k++) {
    const a = k * 10, c = C[k] * 3;
    v[a] = (P[k * 3] + 32500) * s + q[0]; v[a + 1] = (P[k * 3 + 1] + 32500) * s + q[1]; v[a + 2] = (P[k * 3 + 2] + 32500) * s + q[2];
    let nx = N[k * 3] / 127, ny = N[k * 3 + 1] / 127, nz = N[k * 3 + 2] / 127; const l = 1 / (hyp(nx, ny, nz) || 1);
    v[a + 3] = nx * l; v[a + 4] = ny * l; v[a + 5] = nz * l;
    v[a + 6] = cols[c]; v[a + 7] = cols[c + 1]; v[a + 8] = cols[c + 2]; v[a + 9] = mats[C[k]] || 0;
  }
  return { v, i: I, n: nv };
}
function hyApply() {
  const D = HY.d; if (!D) return;
  for (const base in D.kits) {
    const K = D.kits[base];
    for (const vname of K.variants) {
      const kit = KITS[vname], cols = K.colors[vname]; if (!kit || !cols) continue;
      let n = 0; const parts = {};
      for (const nm in HY_PARTS) { const M = K.parts[nm]; if (!M) continue; try { parts[nm] = R.mesh(hyGeo(M, cols, K.mat)); n++; } catch (e) { } }
      if (n < 13) continue;               // need the full set, otherwise keep the procedural soldier
      for (const nm in parts) kit[nm] = parts[nm];
      kit.hy = 1; HY.ok++;
    }
  }
  for (const id in D.weapons) {
    const Wd = D.weapons[id];
    for (const vname of Wd.variants) { const w = WEAP[vname]; if (!w || !Wd.colors[vname]) continue; try { w.mesh = R.mesh(hyGeo(Wd.mesh, Wd.colors[vname], Wd.mat)); w.hy = 1; } catch (e) { } }
  }
}
