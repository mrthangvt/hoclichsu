// ---------- công trình ----------
const VT = {};               // vitri.json
const CONG = {};             // các nhóm công trình theo tên
const PHAO = [];             // khẩu pháo trên thành: {pos (world), dir, ten}
const COT_CO = {};           // cờ theo tên vị trí

// vết pháo đài kiểu Vauban 4 góc: nửa trục A (x), B (z), góc lăng p
function vetThanh(A, B, p, q, f) {
  const out = []; const order = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
  for (const [sx, sz] of order) {
    if (sx > 0 && sz < 0) out.push([sx * (A - q), sz * B], [sx * (A - q), sz * (B + f)], [sx * (A + p), sz * (B + p)], [sx * (A + f), sz * (B - q)], [sx * A, sz * (B - q)]);
    if (sx > 0 && sz > 0) out.push([sx * A, sz * (B - q)], [sx * (A + f), sz * (B - q)], [sx * (A + p), sz * (B + p)], [sx * (A - q), sz * (B + f)], [sx * (A - q), sz * B]);
    if (sx < 0 && sz > 0) out.push([sx * (A - q), sz * B], [sx * (A - q), sz * (B + f)], [sx * (A + p), sz * (B + p)], [sx * (A + f), sz * (B - q)], [sx * A, sz * (B - q)]);
    if (sx < 0 && sz < 0) out.push([sx * A, sz * (B - q)], [sx * (A + f), sz * (B - q)], [sx * (A + p), sz * (B + p)], [sx * (A - q), sz * (B + f)], [sx * (A - q), sz * B]);
  }
  return out;
}
function nhaNgoi(g, L, B, H, x, y, z, ry, tuong = 0xd9cdb0, mai = 0x7b3a2a) {
  const m = M4(x, y, z, ry);
  const g2 = new Ghep(); g2.hop(L, H, B, 0, H / 2, 0, tuong); g2.hop(L * 0.98, 0.25, B + 0.9, 0, H, 0, 0x5a3b28); g2.maiChop(L, B, B * 0.45, 0, H, 0, mai, 0, 0.8);
  const geo = g2.geo(); geo.applyMatrix4(m); g.them(geo, new THREE.Matrix4(), tuong);
}
// thành (Điện Hải, An Hải): A, B nửa cạnh
function taoThanh(ten, A, B, ry, coKieu = 'nguyen', soPhao = 12) {
  const v = VT[ten], cx = v.x, cn = v.n, y0 = Math.max(gAt(cx, cn), 0.6) - 0.3;
  const grp = new THREE.Group(); grp.position.set(cx, y0, -cn); grp.rotation.y = ry; scene.add(grp);
  const g = new Ghep(), gg = new Ghep(); PHAO_GRP = grp;
  const vet = vetThanh(A, B, 16, 12, 14);
  const GACH = 0xb3a698, GACH2 = 0xbcae9e, VIEN = 0xcfc4b4;
  // hào nước (V1.3): vành nước quanh chân tường, kè gạch hai bờ
  { const ngoai = lechVet(vet, -15), trong = lechVet(vet, -0.6);
    const sh = new THREE.Shape(ngoai.map(([x, z]) => new THREE.Vector2(x, z))); sh.holes.push(new THREE.Path(trong.map(([x, z]) => new THREE.Vector2(x, z))));
    const mg = new THREE.ShapeGeometry(sh); mg.rotateX(Math.PI / 2); const nh = new THREE.Mesh(mg, MAT_HAO); nh.position.y = 0.45; nh.renderOrder = 2; grp.add(nh);
    dai(gg, ngoai, 0, -1.2, -1.5, 0.75, GACH, true, VIEN); }
  dai(gg, vet, 0, 7, -1.5, 5.2, GACH, true, 0x9a9480, 0.3);             // tường gạch (chân dưới mặt nước hào), mặt thành
  dai(gg, vet, 0.95, 1.95, 5.12, 6.25, GACH2, true, VIEN, 0.3);   // V1.4: tường chắn mái ngồi hẳn trên mặt thành (hết khe hở)
  g.hop(2 * A - 6, 0.4, 2 * B - 6, 0, 0.1, 0, 0x8f8a62);
  // cổng (giữa cạnh Nam, z = +B) + vọng lâu hai tầng mái
  gg.hop(12, 6.8, 9, 0, 3.4, B, GACH2); g.hop(4, 4, 9.4, 0, 2, B, 0x2a211b);
  g.hop(10, 3, 7, 0, 8.3, B, 0xb08a5e); g.maiChop(10, 7, 2.2, 0, 9.8, B, 0x6a3122, 0, 1.2); g.maiChop(7, 5, 2.2, 0, 11.8, B, 0x6a3122, 0, 1.1);
  // cầu qua hào
  gg.hop(4.5, 0.5, 18, 0, 0.75, B + 13, 0xb8a48c); gg.hop(0.3, 0.9, 18, -2.2, 1.3, B + 13, VIEN); gg.hop(0.3, 0.9, 18, 2.2, 1.3, B + 13, VIEN);
  // nhà trong thành
  const R = rng(ten.length * 77);
  nhaNgoi(g, 30, 11, 4.5, 0, 0.2, -B * 0.25, 0, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 24, 9, 4, -A * 0.45, 0.2, B * 0.25, Math.PI / 2, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 24, 9, 4, A * 0.45, 0.2, B * 0.25, Math.PI / 2, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 16, 8, 3.6, -A * 0.4, 0.2, -B * 0.55, 0, 0xc1ad8a, 0x5d3a2b);
  nhaNgoi(g, 16, 8, 3.6, A * 0.4, 0.2, -B * 0.55, 0, 0xc1ad8a, 0x5d3a2b);
  for (let k = 0; k < 18; k++) { const x = (R() - 0.5) * A * 1.5, z = (R() - 0.5) * B * 1.4; if (Math.abs(x) < 18 && Math.abs(z + B * 0.25) < 9) continue; g.tru(0.2, 0.3, 3, x, 1.5, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(2.6, 0), M4(x, 4.6, z), 0x3d6a32); }
  // đại bác sát mép tường trên mọi mặt lăng và các cạnh (trừ chỗ cổng)
  const ds = []; for (let i = 0; i < vet.length; i++) { const a = vet[i], b = vet[(i + 1) % vet.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), mz = (a[1] + b[1]) / 2, mx = (a[0] + b[0]) / 2;
    if (L < 12) continue; if (Math.abs(mx) < 10 && mz > B - 5) { ds.push([i, 2]); continue; } ds.push([i, L > 50 ? 2 : 1]); }
  grp.updateMatrixWorld(true); datPhaoTheoTuong(gg, grp, vet, ten, 5.2, 2.9, ds.slice(0, soPhao));   // bánh xe vừa chạm tường chắn
  const mesh = g.luoi(); grp.add(mesh); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo(coKieu, 14, 2.2); co.position.set(-(A + 12), 5.2, -(B + 12)); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// đồn đất vuông có rào tre
function taoDon(ten, r = 26, coKieu = 'nguyen', ry = 0.3) {
  const v = VT[ten]; const y0 = Math.max(gAt(v.x, v.n), 0.6) - 0.2;
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); grp.rotation.y = ry; scene.add(grp);
  const g = new Ghep(), vet = [[r, -r], [r, r], [-r, r], [-r, -r]];
  dai(g, vet, 9, 4, -1, 0.1, 0x5d5236, true);
  dai(g, vet, 4, -4, 0, 3, 0x8a6a45, true, 0x7c7a48);
  const R = rng(ten.length * 31 + 7);
  for (let k = 0; k < 4; k++) for (let s = -r + 1; s < r; s += 1.4) {
    const [a, b] = vet[k], [c, d] = vet[(k + 1) % 4], u = (s + r) / (2 * r);
    g.tru(0.07, 0.09, 2.2 + R() * 0.6, a + (c - a) * u + (k % 2 ? 0 : 0) * 1, 4, b + (d - b) * u, 0x8d8a4a, 4);
  }
  nhaNgoi(g, 12, 6, 2.8, 0, 0, -4, 0, 0xb9a57c, 0x8a7a48);
  nhaNgoi(g, 9, 5, 2.6, -8, 0, 10, Math.PI / 2, 0xb9a57c, 0x8a7a48);
  PHAO_GRP = grp; daiBac(g, r - 2.2, 3, -r + 2.2, Math.atan2(-(r - 2.2), r - 2.2), 0.8); daiBac(g, -r + 2.2, 3, -r + 2.2, Math.atan2(r - 2.2, r - 2.2), 0.8); PHAO_GRP = null;
  grp.add(g.luoi());
  const co = taoCo(coKieu, 10, 1.5); co.position.set(r - 3, 3, r - 3); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// ụ pháo đá nửa vầng trăng (pháo đài Sơn Trà, Định Hải)
function taoPhaoDai(ten, huong, soPhao = 4, coKieu = 'nguyen') {
  const v = VT[ten]; const y0 = Math.max(gAt(v.x, v.n), 0.6) - 0.2;
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); grp.rotation.y = huong; scene.add(grp);
  const g = new Ghep(), gg = new Ghep(), pts = []; PHAO_GRP = grp;
  for (let k = 0; k <= 12; k++) { const a = Math.PI * (k / 12); pts.push([Math.cos(a) * 22, -Math.sin(a) * 16]); }
  dai(gg, pts, 3, -3, -0.5, 3.2, 0xb0a494, false, 0x9a9480);
  g.hop(40, 0.5, 18, 0, 0, 2, 0x8c845e);
  nhaNgoi(g, 10, 5, 2.6, 0, 0, 8, 0, 0xb9a57c, 0x6d3426);
  for (let k = 0; k < soPhao; k++) {
    const a = Math.PI * ((k + 0.5) / soPhao), x = Math.cos(a) * 22.4, z = -Math.sin(a) * 16.4;
    daiBac(gg, x, 3.2, z, Math.atan2(-x, -z), 1.0);
    const w = new V3(x, 3.2, z).applyAxisAngle(new V3(0, 1, 0), huong).add(grp.position);
    const d = new V3(x, 0, z).normalize().applyAxisAngle(new V3(0, 1, 0), huong);
    PHAO.push({ ten, pos: w, dir: d });
  }
  grp.add(g.luoi()); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo(coKieu, 10, 1.6); co.position.set(16, 3.2, 6); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// Hải Vân Quan: cổng đá + vọng lâu
function taoHaiVan() {
  const v = VT['hai-van']; const y0 = gAt(v.x, v.n);
  const grp = new THREE.Group(); grp.position.set(v.x, y0 - 0.5, -v.n); grp.rotation.y = 0.75; scene.add(grp);
  const g = new Ghep();
  g.hop(26, 7, 8, 0, 3.5, 0, 0x8c8478); g.hop(4, 4.6, 8.4, 0, 2.3, 0, 0x2b2620);
  g.hop(30, 6, 3, 0, 3, -6, 0x7d766a); g.hop(30, 6, 3, 0, 3, 6, 0x7d766a);
  g.hop(10, 3.4, 7, 0, 8.7, 0, 0xa68a62); g.maiChop(10, 7, 2.4, 0, 10.4, 0, 0x5d3226, 0, 1.2);
  nhaNgoi(g, 10, 5, 2.6, -16, 0, 10, 0, 0xb9a57c, 0x6d3426);
  grp.add(g.luoi());
  const co = taoCo('nguyen', 9, 1.5); co.position.set(-10, 7, 0); grp.add(co); COT_CO['hai-van'] = co;
  CONG['hai-van'] = grp;
}

// ---------- làng, cây ----------
const NHA_GEO = (() => { const g = new Ghep(); g.hop(7, 2.4, 4.5, 0, 1.2, 0, 0xffffff); g.mai(7, 4.5, 2.4, 0, 2.4, 0, 0xffffff, 0, 0.6); return g.geo(); })();
const NHA_MAT = new THREE.MeshLambertMaterial({ vertexColors: false });
function nhaGeoMau() {
  const g = new Ghep(); g.hop(7, 2.4, 4.5, 0, 1.2, 0, 0xb39a72); g.hop(1.2, 1.6, 0.1, 0, 0.8, 2.26, 0x3b2c20); g.mai(7, 4.5, 2.6, 0, 2.4, 0, 0x9a8650, 0, 0.7); return g.geo();
}
function cayDuaGeo() {
  const g = new Ghep(); g.tru(0.16, 0.24, 9, 0.6, 4.5, 0, 0x7b6a52, 5, 0, 0, -0.12);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; g.hop(0.9, 0.08, 4.2, 1.15 + Math.cos(a) * 1.8, 8.6, Math.sin(a) * 1.8, 0x4f7a34, -a + Math.PI / 2, 0.35); }
  return g.geo();
}
function treGeo() { const g = new Ghep(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; g.tru(0.6, 0.05, 11 + (k % 3) * 2, Math.cos(a) * 1.2, 6, Math.sin(a) * 1.2, k % 2 ? 0x6f8f3d : 0x5c7d33, 5, 0, Math.cos(a) * 0.25, Math.sin(a) * 0.25); } return g.geo(); }
function cayGeo() { const g = new Ghep(); g.tru(0.25, 0.35, 3.5, 0, 1.75, 0, 0x5b4a36, 5); g.them(new THREE.IcosahedronGeometry(3.2, 0), M4(0, 5.2, 0), 0x3f6b30); g.them(new THREE.IcosahedronGeometry(2.2, 0), M4(1.4, 6.6, 0.6), 0x4c7a36); return g.geo(); }
function instDat(geo, list, mat) {
  const im = new THREE.InstancedMesh(geo, mat || MATV, list.length), m = new THREE.Matrix4();
  list.forEach((o, i) => { m.compose(new V3(o[0], o[1], o[2]), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), o[3]), new V3(o[4], o[4], o[4])); im.setMatrixAt(i, m); });
  im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; scene.add(im); return im;
}
function datDuoc(x, n, cachNuoc = 25, hMax = 18) {
  const h = hAt(x, n); if (h < 0.7 || h > hMax) return false;
  for (const [dx, dn] of [[cachNuoc, 0], [-cachNuoc, 0], [0, cachNuoc], [0, -cachNuoc]]) if (hAt(x + dx, n + dn) < 0.3) return false;
  return Math.abs(hAt(x + 15, n) - hAt(x - 15, n)) < 4 && Math.abs(hAt(x, n + 15) - hAt(x, n - 15)) < 4;
}
const TRANH = [];   // vùng không đặt nhà/cây: [x, n, r]
function trongVungTranh(x, n) { for (const [a, b, r] of TRANH) if ((x - a) ** 2 + (n - b) ** 2 < r * r) return true; return false; }
function dungLang() {
  const R = rng(1858), nha = [], dua = [], tre = [], cay = [];
  // cụm làng (ƯỚC LƯỢNG – minh hoạ cảnh quan 1858)
  const LANG = [[-340, -1500, 260, 60], [-1500, -2300, 300, 70], [-2900, -2900, 300, 60], [-4800, -1700, 300, 50], [-6800, -300, 320, 55], [-8300, 1800, 260, 40],
    [-9200, 3800, 200, 30], [600, -2600, 300, 70], [1600, -3900, 240, 40], [2700, -2500, 260, 60], [2600, -4300, 260, 60], [3300, -6000, 260, 55],
    [3800, -7300, 260, 50], [300, -5100, 300, 55], [-700, -3900, 300, 55], [-1200, -8400, 320, 65], [400, -9000, 300, 50], [-3500, -6500, 350, 55],
    [-6000, -7000, 400, 60], [2900, 300, 260, 40], [4800, -2000, 300, 45], [5800, -5200, 300, 45], [-2400, -10500, 400, 60], [1500, -11500, 400, 50]];
  for (const [cx, cn, r, k] of LANG) {
    for (let i = 0; i < k; i++) {
      const a = R() * 6.28, d = Math.sqrt(R()) * r, x = cx + Math.cos(a) * d, n = cn + Math.sin(a) * d;
      if (!datDuoc(x, n) || trongVungTranh(x, n)) continue;
      nha.push([x, gAt(x, n) - 0.1, -n, R() * 6.28, 0.85 + R() * 0.35]);
      for (let j = 0; j < 2; j++) { const xx = x + (R() - 0.5) * 30, nn = n + (R() - 0.5) * 30; if (datDuoc(xx, nn, 10) && !trongVungTranh(xx, nn)) (R() < 0.55 ? tre : cay).push([xx, gAt(xx, nn) - 0.2, -nn, R() * 6.28, 0.8 + R() * 0.5]); }
      if (R() < 0.7) { const xx = x + (R() - 0.5) * 24, nn = n + (R() - 0.5) * 24; if (datDuoc(xx, nn, 8) && !trongVungTranh(xx, nn)) dua.push([xx, gAt(xx, nn) - 0.2, -nn, R() * 6.28, 0.8 + R() * 0.4]); }
    }
  }
  // dừa ven biển, cây rải rác
  for (let i = 0; i < 7000; i++) {
    const x = (R() - 0.5) * 2 * HALF * 0.9, n = (R() - 0.5) * 2 * HALF * 0.9, h = hAt(x, n);
    if (h < 0.7 || trongVungTranh(x, n)) continue;
    let gan = false; for (const [dx, dn] of [[60, 0], [-60, 0], [0, 60], [0, -60]]) if (hAt(x + dx, n + dn) < 0.2) gan = true;
    if (gan && h < 6 && R() < 0.8) dua.push([x, h - 0.2, -n, R() * 6.28, 0.8 + R() * 0.4]);
    else if (h > 6 && h < 300 && R() < 0.5) cay.push([x, h - 0.3, -n, R() * 6.28, 1 + R() * 1.2]);
    else if (h < 20 && R() < 0.12 && datDuoc(x, n, 10)) tre.push([x, h - 0.2, -n, R() * 6.28, 0.8 + R() * 0.5]);
  }
  CONG.nha = instDat(nhaGeoMau(), nha); CONG.dua = instDat(cayDuaGeo(), dua); CONG.tre = instDat(treGeo(), tre); CONG.cay = instDat(cayGeo(), cay);
  return { nha: nha.length, dua: dua.length, tre: tre.length, cay: cay.length };
}

// ---------- lũy đất, hào, chông (Hồi 8) ----------
const LUY = [];   // {pts:[[x,n]], t0, t1, mesh}
function taoLuy(pts, t0, t1, ten) {
  // chia đoạn ngắn 25 m để bám đất
  const P = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = pts[i], [c, d] = pts[i + 1], L = Math.hypot(c - a, d - b), k = Math.max(1, Math.round(L / 25));
    for (let s = 0; s < k; s++) P.push([a + (c - a) * s / k, b + (d - b) * s / k]);
  }
  P.push(pts[pts.length - 1]);
  const g = new Ghep(), loc = P.map(([x, n]) => [x, -n]), hh = P.map(([x, n]) => Math.max(gAt(x, n), 0.5));
  dai(g, loc, 3.5, -3.5, (i) => hh[i] - 0.4, (i) => hh[i] + 2.4, 0x86683f, false, 0x7a7a42);         // lũy
  dai(g, loc, 9, 4.5, (i) => hh[i] - 0.3, (i) => hh[i] - 0.05, 0x3f3526, false);                     // hào (dải sẫm phía Bắc)
  const mesh = g.luoi(MATV2); scene.add(mesh);
  // chông: hàng cọc nghiêng trước hào
  const ch = []; const R = rng(P.length * 13);
  for (let i = 0; i < P.length - 1; i++) {
    const [a, b] = P[i], [c, d] = P[i + 1], L = Math.hypot(c - a, d - b), nx = -(d - b) / L, nn = (c - a) / L;
    for (let s = 0; s < L; s += 1.1) for (const off of [11, 12.2]) {
      const x = a + (c - a) * s / L + nx * off, n = b + (d - b) * s / L + nn * off;
      ch.push([x, Math.max(gAt(x, n), 0.5) - 0.1, -n, Math.atan2(nx, nn) + (R() - 0.5) * 0.3, 1]);
    }
  }
  const cg = new THREE.CylinderGeometry(0.0, 0.05, 1.3, 4); cg.rotateX(-0.6); cg.translate(0, 0.5, 0);
  const cm = instDat(cg, ch, new THREE.MeshLambertMaterial({ color: 0xa79a5c }));
  const o = { ten, pts: P, t0, t1, mesh, chong: cm, dai: P.length }; LUY.push(o); return o;
}
function luyCapNhat(t) {
  for (const o of LUY) {
    const k = clamp((t - o.t0) / (o.t1 - o.t0), 0, 1);
    o.mesh.visible = k > 0; o.chong.visible = k > 0.98;
    const tot = o.mesh.geometry.attributes.position.count; o.mesh.geometry.setDrawRange(0, Math.floor(tot * k / 18) * 18);
  }
}
// lều (trại quân liên quân)
function leuGeo() { const g = new Ghep(), gg = new THREE.BufferGeometry(); const v = [-2, 0, -2.5, 2, 0, -2.5, 0, 2.2, -2.5, -2, 0, 2.5, 0, 2.2, 2.5, 2, 0, 2.5, -2, 0, -2.5, 0, 2.2, -2.5, 0, 2.2, 2.5, -2, 0, -2.5, 0, 2.2, 2.5, -2, 0, 2.5, 2, 0, -2.5, 2, 0, 2.5, 0, 2.2, 2.5, 2, 0, -2.5, 0, 2.2, 2.5, 0, 2.2, -2.5]; gg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.them(gg, new THREE.Matrix4(), 0xe6e0cc); return g.geo(); }
function dungTrai(cx, cn, nx, nz, ry, t0) {
  const L = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const lx = (i - nx / 2) * 8, lz = (j - nz / 2) * 10, x = cx + lx * Math.cos(ry) + lz * Math.sin(ry), n = cn - (-lx * Math.sin(ry) + lz * Math.cos(ry));
    if (hAt(x, n) < 0.6) continue; L.push([x, gAt(x, n) - 0.05, -n, ry, 1]);
  }
  const im = instDat(leuGeo(), L, MATV2); im.userData.t0 = t0; return im;
}
// bàn bản đồ (chỉ huy)
function banBanDo(x, n, ry, y = null) {
  const g = new Ghep(); g.hop(2.4, 0.08, 1.4, 0, 0.82, 0, 0x6b4a2c); for (const [a, b] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]]) g.hop(0.08, 0.8, 0.08, a, 0.4, b, 0x4d3420);
  const mesh = g.luoi(); const yy = y == null ? gAt(x, n) : y; mesh.position.set(x, yy, -n); mesh.rotation.y = ry; scene.add(mesh);
  // tờ bản đồ (vẽ canvas)
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const k = c.getContext('2d');
  k.fillStyle = '#e8dcb8'; k.fillRect(0, 0, 256, 160); k.strokeStyle = '#6a5636'; k.lineWidth = 2;
  k.beginPath(); k.moveTo(10, 40); k.bezierCurveTo(60, 120, 120, 140, 150, 90); k.lineTo(160, 60); k.bezierCurveTo(190, 40, 230, 50, 250, 30); k.stroke();
  k.strokeStyle = '#3d6a8a'; k.lineWidth = 4; k.beginPath(); k.moveTo(152, 92); k.lineTo(160, 160); k.stroke();
  k.fillStyle = '#9b2a1f'; for (const [a, b] of [[140, 110], [120, 128], [170, 120], [100, 120]]) { k.fillRect(a - 4, b - 4, 8, 8); }
  k.strokeStyle = '#9b2a1f'; k.setLineDash([6, 4]); k.beginPath(); k.moveTo(80, 118); k.lineTo(150, 132); k.lineTo(200, 120); k.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.15), new THREE.MeshLambertMaterial({ map: t }));
  p.rotation.x = -Math.PI / 2; p.position.y = 0.87; mesh.add(p);
  // la bàn, ống nhòm
  const la = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), new THREE.MeshLambertMaterial({ color: 0x8a6a2a })); la.position.set(0.75, 0.88, 0.35); mesh.add(la);
  const on = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.45, 8), new THREE.MeshLambertMaterial({ color: 0x3a2a1a })); on.rotation.z = Math.PI / 2; on.position.set(-0.7, 0.89, 0.4); mesh.add(on);
  return mesh;
}

// ---------- Thành Điện Hải V1.2: vết tường, hào theo OSM (water=moat), bố cục trong thành theo ảnh dựng 3D anh gửi ----------
const DH_TUONG = [[9.8, -46.9], [43.3, -43.3], [48.5, -53.8], [69.2, -53.4], [62.8, -34], [50.9, -32.2], [47.3, 0.4], [46.5, 7.4], [42.7, 40.9], [52.5, 43.5], [53.7, 64.1], [34.6, 59.4], [33.2, 48.7], [-39.6, 42.1], [-42.9, 52.0], [-62.4, 51.8], [-57.3, 32.4], [-46.8, 31.6], [-43.0, -2.1], [-38.4, -43.1], [-49.0, -47.3], [-49.1, -66.9], [-29.9, -61.4], [-28.8, -52.3], [2.9, -47.7]];
const DH_HAO = [[60.6, 8.9], [63.9, 63.8], [63.8, 69.7], [61.3, 74], [56.7, 76.1], [51, 75.3], [-5.8, 56.7], [-61.3, 63.7], [-68, 62.6], [-72.3, 59.3], [-73.8, 54], [-72.9, 47.6], [-57.1, -3.8], [-55.7, -8.4], [-55.9, -11.2], [-59.4, -67.2], [-58.9, -72], [-56.4, -76.3], [-52, -77.7], [-46.8, -77.3], [4.4, -61.4], [11.4, -61], [67.7, -63.1], [74, -62.4], [78.1, -59.5], [79.4, -54.2], [78.2, -48.1], [61.4, 1.9]];
function huongTrong(pts) {   // đảo chiều để pháp tuyến trái (dai, w>0) chỉ vào trong
  let cx = 0, cz = 0; for (const p of pts) { cx += p[0]; cz += p[1]; } cx /= pts.length; cz /= pts.length;
  const [a, b] = [pts[0], pts[1]], nx = -(b[1] - a[1]), nz = b[0] - a[0];
  const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
  return (nx * (cx - mx) + nz * (cz - mz)) > 0 ? pts : pts.slice().reverse();
}
// offset vết khép kín (giống cách dai() tính pháp tuyến): w > 0 vào trong
function lechVet(pts, w) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    let d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = c[0] - b[0], d2z = c[1] - b[1];
    const l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1; d1x /= l1; d1z /= l1; d2x /= l2; d2z /= l2;
    let nx = -(d1z + d2z), nz = d1x + d2x; const ln = Math.hypot(nx, nz) || 1; nx /= ln; nz /= ln;
    const cs = Math.max(0.6, nx * -d2z + nz * d2x); out.push([b[0] + nx / cs * w, b[1] + nz / cs * w]);
  }
  return out;
}
// đặt đại bác trên mặt thành, sát mép ngoài: ds = [[chỉ số cạnh, số khẩu]]; vào trong 'vao' m tính từ mép ngoài
function datPhaoTheoTuong(gg, grp, pts, ten, y, vao, ds) {
  const n = pts.length; grp.updateMatrixWorld(true);
  let cx = 0, cz = 0; for (const p of pts) { cx += p[0] / n; cz += p[1] / n; }
  for (const [i, so] of ds) {
    const a = pts[i % n], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 4) continue;
    const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L; let ix = -dz, iz = dx;
    if ((cx - (a[0] + b[0]) / 2) * ix + (cz - (a[1] + b[1]) / 2) * iz < 0) { ix = -ix; iz = -iz; }   // pháp tuyến hướng vào trong
    for (let k = 0; k < so; k++) {
      const u = (k + 1) / (so + 1), x = a[0] + dx * L * u + ix * vao, z = a[1] + dz * L * u + iz * vao;
      const ry = Math.atan2(ix, iz);              // daiBac: nòng về −Z cục bộ → quay sao cho nòng hướng ra ngoài (−pháp tuyến trong)
      daiBac(gg, x, y, z, ry, 1);
      const w = new V3(x, y, z).applyMatrix4(grp.matrixWorld), d = new V3(-ix, 0, -iz).transformDirection(grp.matrixWorld);
      PHAO.push({ ten, pos: w, dir: d });
    }
  }
}
function taoDienHai() {
  const v = VT['dien-hai'], y0 = Math.max(gAt(v.x, v.n), 0.8);
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); scene.add(grp);
  const g = new Ghep(), gg = new Ghep();   // gg: phần gạch (vân gạch kiểu Thành cổ Quảng Trị)
  PHAO_GRP = grp;
  const tuong = huongTrong(DH_TUONG.map(([x, n]) => [x, -n])), hao = huongTrong(DH_HAO.map(([x, n]) => [x, -n]));
  const GACH = 0xb3a698, GACH2 = 0xbcae9e, MAT = 0x9a9480, VIEN = 0xcfc4b4;
  // mặt nước hào (hình vành: hào ngoài trừ tường)
  const sh = new THREE.Shape(hao.map(([x, z]) => new THREE.Vector2(x, z)));
  sh.holes.push(new THREE.Path(tuong.map(([x, z]) => new THREE.Vector2(x, z))));
  const mg = new THREE.ShapeGeometry(sh); mg.rotateX(Math.PI / 2);
  const nuocHao = new THREE.Mesh(mg, MAT_HAO);
  nuocHao.position.y = 0.18; nuocHao.renderOrder = 2; grp.add(nuocHao);
  // tường thành gạch (mặt ngoài thẳng đứng từ đáy hào), mặt thành lát gạch, gờ chắn mái
  dai(gg, tuong, 0, 7.5, -2.2, 4.6, GACH, true, MAT, 0.3);
  dai(gg, tuong, 1.05, 2.05, 4.52, 5.6, GACH2, true, VIEN, 0.3);   // V1.4: tường chắn mái ngồi trên mặt thành
  // bờ hào ngoài: kè gạch thấp, gờ sáng (như ảnh)
  dai(gg, hao, -2.2, 0, -2.2, 0.55, GACH, true, VIEN);
  dai(gg, hao, -0.6, 0.2, 0.55, 0.75, VIEN, true, VIEN);
  // sân trong: cỏ, đường lát chữ thập, sân lát
  const san = new THREE.Shape(tuong.map(([x, z]) => new THREE.Vector2(x, z)));
  const sg = new THREE.ShapeGeometry(san); sg.rotateX(Math.PI / 2); g.them(sg, M4(0, 0.12, 0), 0x6f9a4a);
  g.hop(5, 0.1, 96, 4, 0.2, 0, 0x8a6e62); g.hop(96, 0.1, 5, -2, 0.2, -3, 0x8a6e62);
  g.hop(34, 0.1, 22, -10, 0.21, 27, 0x9c9a92); g.hop(24, 0.1, 22, 25, 0.21, 22, 0x9c9a92);
  g.hop(70, 0.1, 3.5, 0, 0.2, -38, 0x8a6e62); g.hop(3.5, 0.1, 70, -36, 0.2, 0, 0x8a6e62); g.hop(3.5, 0.1, 70, 39, 0.2, 0, 0x8a6e62); g.hop(70, 0.1, 3.5, 0, 0.2, 36, 0x8a6e62);
  // nhà trong thành (mái ngói đỏ cam)
  const NGOI = 0xb24a26, TUONGNHA = 0xe2d6bc;
  nhaNgoi(g, 30, 10, 3.8, -2, 0.2, 30, 0, TUONGNHA, NGOI);          // nhà dài phía Nam
  nhaNgoi(g, 11, 8, 3.4, -24, 0.2, -24, 0, TUONGNHA, NGOI);          // nhà nhỏ Tây Bắc
  nhaNgoi(g, 22, 8, 3.4, 30, 0.2, 2, Math.PI / 2, TUONGNHA, NGOI);    // nhà dài phía Đông
  g.hop(4, 2.6, 4, 30, 1.3, 30, 0xb49a7a); g.maiChop(4, 4, 2, 30, 2.6, 30, NGOI, 0, 0.7);   // nhà nghỉ nhỏ góc Đông Nam
  // kỳ đài cạnh cổng Tây
  gg.hop(13, 3, 11, -30, 1.5, -16, GACH); gg.hop(13.4, 0.3, 11.4, -30, 3.1, -16, VIEN); gg.hop(3, 1.5, 4, -23, 0.75, -16, GACH2);
  // cổng: Nam, Đông (theo chỗ hở của hào OSM), Tây (theo ảnh) — vòm gạch + cầu qua hào
  const cong = (x, z, ry, cau) => {
    gg.hop(8, 6.4, 8.5, x, 3.2, z, GACH2, ry); g.hop(3.2, 3.6, 9, x, 1.8, z, 0x2a1d16, ry);
    gg.hop(8.6, 0.5, 9, x, 6.6, z, VIEN, ry);
    const c = M4(x, 0, z, ry); const b = new Ghep(); b.hop(4.2, 0.6, cau, 0, 0.25, cau / 2 + 4, 0xb8a48c); b.hop(0.3, 0.9, cau, -2.2, 0.85, cau / 2 + 4, VIEN); b.hop(0.3, 0.9, cau, 2.2, 0.85, cau / 2 + 4, VIEN);
    const bg = b.geo(); bg.applyMatrix4(c); g.them(bg, new THREE.Matrix4(), 0xb8a48c);
  };
  cong(6.4, 47.3, 0, 15); cong(47, -4, Math.PI / 2, 15); cong(-43, 6, -Math.PI / 2, 14);
  // lầu cổng Bắc (lầu hai tầng mái, như ảnh)
  gg.hop(12, 5.6, 9, -12, 2.8, -45.4, GACH2); g.hop(3.4, 3.6, 9.4, -12, 1.8, -45.4, 0x2a1d16);
  g.hop(10, 2.6, 7, -12, 7.0, -45.4, 0xc4a27a); g.maiChop(10.5, 7.5, 2.2, -12, 8.3, -45.4, NGOI, 0, 1.3); g.maiChop(7.5, 5, 2.2, -12, 10.3, -45.4, NGOI, 0, 1.0);
  // cây trong sân
  const R = rng(1802);
  for (let k = 0; k < 26; k++) {
    const x = (R() - 0.5) * 80, z = (R() - 0.5) * 80; if (Math.abs(x - 4) < 5 || Math.abs(z + 3) < 5) continue;
    if (Math.abs(x + 2) < 18 && Math.abs(z - 30) < 8) continue; if (Math.abs(x - 30) < 7 && Math.abs(z - 2) < 14) continue; if (Math.abs(x + 30) < 9 && Math.abs(z + 16) < 8) continue;
    const s = 0.8 + R() * 0.5; g.tru(0.2 * s, 0.3 * s, 3 * s, x, 1.5 * s, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(2.8 * s, 1), M4(x, 4.6 * s, z), R() < 0.5 ? 0x3f6e33 : 0x4c7e3a);
  }
  // đại bác: trên 4 góc lăng và mặt Bắc, Tây (hướng ra vịnh, sông)
  // đại bác (V1.3): đặt sát mép tường, nòng chĩa ra ngoài qua gờ chắn mái
  datPhaoTheoTuong(gg, grp, DH_TUONG.map(([x, n]) => [x, -n]), 'dien-hai', 4.6, 3.0, [[0, 1], [2, 1], [3, 1], [5, 1], [7, 1], [9, 1], [10, 1], [12, 2], [14, 1], [15, 1], [17, 1], [18, 1], [20, 1], [21, 1], [23, 1]]);
  const mesh = g.luoi(); grp.add(mesh); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo('nguyen', 16, 2.4); co.position.set(-30, 3.2, -16); grp.add(co); COT_CO['dien-hai'] = co;
  CONG['dien-hai'] = grp; return grp;
}
