// ===== MAVİ BERET — core: math + geometry builder =====
const PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos, abs = Math.abs, sqrt = Math.sqrt,
  min = Math.min, max = Math.max, hyp = Math.hypot, atan2 = Math.atan2, floor = Math.floor;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function angDiff(a, b) { let d = (b - a) % TAU; if (d > PI) d -= TAU; else if (d < -PI) d += TAU; return d; }
const angDamp = (a, b, k, dt) => a + angDiff(a, b) * (1 - Math.exp(-k * dt));
const hex = h => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const mulc = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

// ---- mat4 (column-major) ----
function m4() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }
function m4id(m) { m.fill(0); m[0] = m[5] = m[10] = m[15] = 1; return m; }
function m4mul(o, a, b) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  for (let i = 0; i < 16; i += 4) {
    const b0 = b[i], b1 = b[i + 1], b2 = b[i + 2], b3 = b[i + 3];
    o[i] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[i + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[i + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[i + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
  return o;
}
function m4persp(o, fovy, asp, n, f) {
  const t = 1 / Math.tan(fovy / 2); o.fill(0);
  o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o;
}
function m4ortho(o, l, r, b, t, n, f) {
  o.fill(0); o[0] = 2 / (r - l); o[5] = 2 / (t - b); o[10] = -2 / (f - n);
  o[12] = -(r + l) / (r - l); o[13] = -(t + b) / (t - b); o[14] = -(f + n) / (f - n); o[15] = 1; return o;
}
function m4look(o, ex, ey, ez, cx, cy, cz, ux, uy, uz) {
  let zx = ex - cx, zy = ey - cy, zz = ez - cz, l = 1 / hyp(zx, zy, zz); zx *= l; zy *= l; zz *= l;
  let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx; l = 1 / hyp(xx, xy, xz); xx *= l; xy *= l; xz *= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
  o[12] = -(xx * ex + xy * ey + xz * ez); o[13] = -(yx * ex + yy * ey + yz * ez); o[14] = -(zx * ex + zy * ey + zz * ez); o[15] = 1;
  return o;
}
function m4inv(o, m) {
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
    a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return null; det = 1 / det;
  o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return o;
}
// rigid transform: R = Ry(yaw) * Rx(pitch) * Rz(roll).  yaw 0 faces +Z; pitch>0 tips forward(+Z) down.
function m4trs(o, x, y, z, yaw, pitch, roll) {
  const cy = cos(yaw), sy = sin(yaw), cx = cos(pitch || 0), sx = sin(pitch || 0), cz = cos(roll || 0), sz = sin(roll || 0);
  o[0] = cy * cz + sy * sx * sz; o[1] = cx * sz; o[2] = -sy * cz + cy * sx * sz; o[3] = 0;
  o[4] = -cy * sz + sy * sx * cz; o[5] = cx * cz; o[6] = sy * sz + cy * sx * cz; o[7] = 0;
  o[8] = sy * cx; o[9] = -sx; o[10] = cy * cx; o[11] = 0;
  o[12] = x; o[13] = y; o[14] = z; o[15] = 1; return o;
}
function m4scale(o, sx, sy, sz) { o[0] *= sx; o[1] *= sx; o[2] *= sx; o[4] *= sy; o[5] *= sy; o[6] *= sy; o[8] *= sz; o[9] *= sz; o[10] *= sz; return o; }
// TM: build a fresh transform (used at mesh-build time)
function TM(x, y, z, yaw, pitch, roll, sx, sy, sz) {
  const m = m4trs(m4(), x, y, z, yaw || 0, pitch || 0, roll || 0);
  if (sx !== undefined) m4scale(m, sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz);
  return m;
}
const _p = new Float32Array(3);
function m4pt(m, x, y, z, o) { o = o || _p; o[0] = m[0] * x + m[4] * y + m[8] * z + m[12]; o[1] = m[1] * x + m[5] * y + m[9] * z + m[13]; o[2] = m[2] * x + m[6] * y + m[10] * z + m[14]; return o; }
// matrix with origin A, +Y along (B-A), +Z as close as possible to hint
function m4seg(o, ax, ay, az, bx, by, bz, hx, hy, hz) {
  let yx = bx - ax, yy = by - ay, yz = bz - az, l = 1 / (hyp(yx, yy, yz) || 1); yx *= l; yy *= l; yz *= l;
  let d = hx * yx + hy * yy + hz * yz, zx = hx - yx * d, zy = hy - yy * d, zz = hz - yz * d; l = hyp(zx, zy, zz);
  if (l < 1e-4) { zx = 1 - yx * yx; zy = -yx * yy; zz = -yx * yz; l = hyp(zx, zy, zz); if (l < 1e-4) { zx = 0; zy = 0; zz = 1; l = 1; } }
  zx /= l; zy /= l; zz /= l;
  const xx = yy * zz - yz * zy, xy = yz * zx - yx * zz, xz = yx * zy - yy * zx;
  o[0] = xx; o[1] = xy; o[2] = xz; o[3] = 0; o[4] = yx; o[5] = yy; o[6] = yz; o[7] = 0; o[8] = zx; o[9] = zy; o[10] = zz; o[11] = 0;
  o[12] = ax; o[13] = ay; o[14] = az; o[15] = 1; return o;
}
// two-bone IK: returns elbow/knee position in o
function ik2(o, sx, sy, sz, tx, ty, tz, l1, l2, px, py, pz) {
  let dx = tx - sx, dy = ty - sy, dz = tz - sz, d = hyp(dx, dy, dz) || 1e-4;
  const dc = clamp(d, abs(l1 - l2) + 0.01, l1 + l2 - 0.004);
  dx /= d; dy /= d; dz /= d;
  const a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc), h = sqrt(max(0, l1 * l1 - a * a));
  const pd = px * dx + py * dy + pz * dz; let qx = px - dx * pd, qy = py - dy * pd, qz = pz - dz * pd, ql = hyp(qx, qy, qz);
  if (ql < 1e-4) { qx = 0; qy = -1; qz = 0; ql = 1; }
  o[0] = sx + dx * a + qx / ql * h; o[1] = sy + dy * a + qy / ql * h; o[2] = sz + dz * a + qz / ql * h;
  // effective target (clamped) returned in o[3..5]
  o[3] = sx + dx * dc; o[4] = sy + dy * dc; o[5] = sz + dz * dc;
  return o;
}

// ---- geometry builder: 10 floats/vertex: pos3 nor3 col3 mat1 ----
const BF = [[1, 0, 0, 0, 1, 0, 0, 0, 1], [-1, 0, 0, 0, 0, 1, 0, 1, 0], [0, 1, 0, 0, 0, 1, 1, 0, 0], [0, -1, 0, 1, 0, 0, 0, 0, 1], [0, 0, 1, 1, 0, 0, 0, 1, 0], [0, 0, -1, 0, 1, 0, 1, 0, 0]];
class Geo {
  constructor() { this.v = []; this.i = []; this.n = 0; }
  _nm(T) {
    const a = T[0], b = T[1], c = T[2], d = T[4], e = T[5], f = T[6], g = T[8], h = T[9], k = T[10];
    return [e * k - h * f, c * h - b * k, b * f - e * c, f * g - d * k, a * k - g * c, c * d - a * f, d * h - g * e, b * g - a * h, a * e - d * b];
  }
  push(x, y, z, nx, ny, nz, c, m, T, C) {
    if (T) {
      const px = T[0] * x + T[4] * y + T[8] * z + T[12], py = T[1] * x + T[5] * y + T[9] * z + T[13], pz = T[2] * x + T[6] * y + T[10] * z + T[14];
      const ax = C[0] * nx + C[1] * ny + C[2] * nz, ay = C[3] * nx + C[4] * ny + C[5] * nz, az = C[6] * nx + C[7] * ny + C[8] * nz, l = 1 / (hyp(ax, ay, az) || 1);
      this.v.push(px, py, pz, ax * l, ay * l, az * l, c[0], c[1], c[2], m);
    } else this.v.push(x, y, z, nx, ny, nz, c[0], c[1], c[2], m);
    return this.n++;
  }
  // box centred at (ox,oy,oz) in local space of T
  box(w, h, d, c, m, T, ox, oy, oz, skip) {
    const hx = w / 2, hy = h / 2, hz = d / 2, C = T && this._nm(T); m = m || 0; ox = ox || 0; oy = oy || 0; oz = oz || 0; skip = skip || 0;
    for (let f = 0; f < 6; f++) {
      if (skip >> f & 1) continue;
      const F = BF[f], nx = F[0], ny = F[1], nz = F[2], ux = F[3] * hx, uy = F[4] * hy, uz = F[5] * hz, vx = F[6] * hx, vy = F[7] * hy, vz = F[8] * hz,
        cx = ox + nx * hx, cy = oy + ny * hy, cz = oz + nz * hz;
      const a = this.push(cx - ux - vx, cy - uy - vy, cz - uz - vz, nx, ny, nz, c, m, T, C);
      this.push(cx + ux - vx, cy + uy - vy, cz + uz - vz, nx, ny, nz, c, m, T, C);
      this.push(cx + ux + vx, cy + uy + vy, cz + uz + vz, nx, ny, nz, c, m, T, C);
      this.push(cx - ux + vx, cy - uy + vy, cz - uz + vz, nx, ny, nz, c, m, T, C);
      this.i.push(a, a + 1, a + 2, a, a + 2, a + 3);
    }
    return this;
  }
  // world-space min/max box
  bx(x0, y0, z0, x1, y1, z1, c, m, skip) { return this.box(x1 - x0, y1 - y0, z1 - z0, c, m, null, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, skip); }
  loft(Rg, seg, c, m, T, capB, capT) {
    const C = T && this._nm(T), n = Rg.length, base = this.n; m = m || 0;
    for (let i = 0; i < n; i++) {
      const r = Rg[i], p = Rg[max(0, i - 1)], q = Rg[min(n - 1, i + 1)];
      const dy = q[0] - p[0], dr = ((q[1] + q[2]) - (p[1] + p[2])) * 0.5, rx = max(r[1], 1e-4), rz = max(r[2], 1e-4);
      for (let j = 0; j <= seg; j++) {
        const a = TAU * j / seg, ca = cos(a), sa = sin(a);
        let hx = ca / rx, hz = sa / rz; const hl = 1 / hyp(hx, hz); hx *= hl; hz *= hl;
        const nx = hx * dy, ny = -dr, nz = hz * dy, l = 1 / (hyp(nx, ny, nz) || 1);
        this.push(r[1] * ca, r[0], r[2] * sa, nx * l, ny * l, nz * l, c, m, T, C);
      }
    }
    const w = seg + 1;
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) { const a = base + i * w + j, b = a + w; this.i.push(a, b, b + 1, a, b + 1, a + 1); }
    if (capB) {
      const r = Rg[0], ci = this.push(0, r[0], 0, 0, -1, 0, c, m, T, C), s = this.n;
      for (let j = 0; j <= seg; j++) { const a = TAU * j / seg; this.push(r[1] * cos(a), r[0], r[2] * sin(a), 0, -1, 0, c, m, T, C); }
      for (let j = 0; j < seg; j++) this.i.push(ci, s + j, s + j + 1);
    }
    if (capT) {
      const r = Rg[n - 1], ci = this.push(0, r[0], 0, 0, 1, 0, c, m, T, C), s = this.n;
      for (let j = 0; j <= seg; j++) { const a = TAU * j / seg; this.push(r[1] * cos(a), r[0], r[2] * sin(a), 0, 1, 0, c, m, T, C); }
      for (let j = 0; j < seg; j++) this.i.push(ci, s + j + 1, s + j);
    }
    return this;
  }
  cyl(r0, r1, h, seg, c, m, T, capB, capT) { return this.loft([[0, r0, r0], [h, r1, r1]], seg, c, m, T, capB === undefined ? 1 : capB, capT === undefined ? 1 : capT); }
  // ellipsoid (f0..f1 = fraction of latitude range, bottom->top)
  sph(rx, ry, rz, seg, rg, c, m, T, f0, f1) {
    const C = T && this._nm(T), base = this.n; m = m || 0; f0 = f0 || 0; f1 = f1 === undefined ? 1 : f1;
    for (let i = 0; i <= rg; i++) {
      const ph = PI * lerp(f0, f1, i / rg), sp = sin(ph), cp = -cos(ph);
      for (let j = 0; j <= seg; j++) {
        const a = TAU * j / seg, ux = sp * cos(a), uz = sp * sin(a), nx = ux / rx, ny = cp / ry, nz = uz / rz, l = 1 / (hyp(nx, ny, nz) || 1);
        this.push(ux * rx, cp * ry, uz * rz, nx * l, ny * l, nz * l, c, m, T, C);
      }
    }
    const w = seg + 1;
    for (let i = 0; i < rg; i++) for (let j = 0; j < seg; j++) { const a = base + i * w + j, b = a + w; this.i.push(a, b, b + 1, a, b + 1, a + 1); }
    return this;
  }
  // capsule along +Y, sphere centres at y=0 (radius r0) and y=h (radius r1)
  cap(r0, r1, h, seg, c, m, T, k) {
    k = k || 3; const Rg = [];
    for (let i = 0; i <= k; i++) { const ph = PI / 2 * i / k; Rg.push([-r0 * cos(ph), r0 * sin(ph), r0 * sin(ph)]); }
    for (let i = 0; i <= k; i++) { const ph = PI / 2 * i / k; Rg.push([h + r1 * sin(ph), r1 * cos(ph), r1 * cos(ph)]); }
    return this.loft(Rg, seg, c, m, T, 0, 0);
  }
  quadXZ(x0, z0, x1, z1, y, c, m) {
    const a = this.push(x0, y, z0, 0, 1, 0, c, m || 0); this.push(x0, y, z1, 0, 1, 0, c, m || 0); this.push(x1, y, z1, 0, 1, 0, c, m || 0); this.push(x1, y, z0, 0, 1, 0, c, m || 0);
    this.i.push(a, a + 1, a + 2, a, a + 2, a + 3); return this;
  }
}
