// ---------- V1.3: làng chài Hồi 1 – dân dựng nhà, vác gỗ, đẽo gỗ, kéo thuyền (theo cách công trường làm cọc ở Bạch Đằng) ----------
// Toàn bộ là MINH HOẠ sinh hoạt làng ven biển, không theo tư liệu cụ thể.
const LANG = { on: false };
function dungLangChai() {
  const C = [-205, -1812], y0 = (x, n) => gAt(x, n);
  LANG.C = C;
  const W2 = (dx, dn) => [C[0] + dx, C[1] + dn];
  // nhà đang dựng: khung cột, xà, kèo, mái tranh lợp dở
  const g = new Ghep(), GO_ = 0x7a5534, GO_S = 0x5e4026, TRANH_ = 0xa8904e;
  const cot = [[-4, -2.5], [0, -2.5], [4, -2.5], [-4, 2.5], [0, 2.5], [4, 2.5]];
  for (const [a, b] of cot) g.tru(0.11, 0.13, 3.2, a, 1.6, b, GO_, 6);
  for (const b of [-2.5, 2.5]) g.hop(8.6, 0.18, 0.18, 0, 3.15, b, GO_S);
  for (const a of [-4, 0, 4]) { g.hop(0.16, 0.16, 5.4, a, 3.2, 0, GO_S); g.hop(0.14, 2.0, 0.14, a, 4.1, 0, GO_S);
    for (const s of [-1, 1]) g.hop(0.12, 0.12, 3.6, a, 4.0, s * 1.4, GO_S, 0, s * 0.62); }
  g.hop(8.8, 0.14, 0.14, 0, 5.05, 0, GO_S);
  for (let k = -4; k <= 4; k += 1) for (const s of [-1, 1]) g.hop(0.07, 0.07, 3.6, k, 4.0, s * 1.4, 0x8a6a44, 0, s * 0.62);
  g.hop(4.6, 0.25, 3.5, -2.1, 4.05, -1.35, TRANH_, 0, -0.62);                // mái tranh lợp dở (nửa trái, mặt trước)
  g.hop(8.8, 0.08, 5.6, 0, 0.04, 0, 0x9a8460);                                // nền đất đầm
  const nha = g.luoi(); const [hx, hn] = W2(0, 6); nha.position.set(hx, y0(hx, hn), -hn); nha.rotation.y = 0.15; scene.add(nha); LANG.nha = nha;
  // đống gỗ, thân gỗ đang đẽo, rơm, thuyền kéo lên bãi
  const g2 = new Ghep();
  for (let k = 0; k < 7; k++) g2.tru(0.16, 0.18, 6, (k % 4) * 0.36 - 0.55, 0.17 + Math.floor(k / 4) * 0.31, 0, k % 2 ? 0x7c5a38 : 0x6e4e30, 7, 0, 0, Math.PI / 2);
  const dg = g2.luoi(); const [gx, gn] = W2(-9, -4); dg.position.set(gx, y0(gx, gn), -gn); dg.rotation.y = 1.2; scene.add(dg); LANG.dongGo = dg;
  LANG.deo = [W2(-6, 4), W2(7, -3)];
  const g3 = new Ghep(); for (const [a, b] of LANG.deo.map(([x, n]) => [x - C[0], n - C[1]])) g3.tru(0.2, 0.22, 5, a, 0.22, -b, 0x7c5a38, 7, 0.4, 0, Math.PI / 2);
  const deo = g3.luoi(); deo.position.set(C[0], y0(C[0], C[1]), -C[1]); scene.add(deo); LANG.deoM = deo;
  // thuyền đánh cá trên bãi (2 chiếc nằm, 1 chiếc đang kéo lên)
  LANG.thuyen = [];
  for (const [dx, dn, r] of [[-30, 48, 0.4], [-18, 52, 0.1], [-42, 40, 0.7]]) { const m = new THREE.Mesh(thuyenChaiGeo(), MATV); const [x, n] = W2(dx, dn); m.position.set(x, Math.max(hAt(x, n), -0.2) - 0.2, -n); m.rotation.y = r; scene.add(m); LANG.thuyen.push(m); }
  LANG.keoThuyen = { A: W2(-5, 64), B: W2(-8, 50) };
  { const m = new THREE.Mesh(thuyenChaiGeo(), MATV); scene.add(m); LANG.thuyenKeo = m; }
  // giàn phơi lưới
  const g4 = new Ghep();
  for (let k = 0; k < 4; k++) { g4.tru(0.05, 0.06, 2, k * 3, 1, 0, GO_S, 5); }
  g4.hop(9.2, 0.04, 0.04, 4.5, 1.9, 0, GO_S); g4.hop(9, 1.6, 0.03, 4.5, 1.1, 0, 0x6e6a58);
  const gl = g4.luoi(); const [lx, ln] = W2(14, 14); gl.position.set(lx, y0(lx, ln), -ln); gl.rotation.y = -0.5; scene.add(gl); LANG.luoi = gl;
  // xóm: nhà tranh quanh công trường
  const L = [], R = rng(1858 + 1);
  for (let k = 0; k < 14; k++) { const a = -0.3 + k * 0.42, r = 26 + R() * 18; const x = C[0] + Math.cos(a) * r * 1.2, n = C[1] - 16 - Math.abs(Math.sin(a)) * r * 0.9; if (hAt(x, n) < 0.6) continue; L.push([x, gAt(x, n) - 0.1, -n, R() * 0.6 - 0.3 + Math.PI / 2 * (k % 2), 0.85 + R() * 0.3]); }
  LANG.xom = instDat(nhaGeoMau(), L);
  // cột đang dựng + dây kéo; gỗ đang vác
  const pg = new Ghep(); pg.tru(0.12, 0.14, 3.6, 0, 1.8, 0, GO_, 7); LANG.cotDung = new THREE.Mesh(pg.geo(), MATV); scene.add(LANG.cotDung);
  const lg = new Ghep(); lg.tru(0.13, 0.15, 4.6, 0, 0, 0, 0x7c5a38, 7, 0, 0, Math.PI / 2); LANG.goVac = new THREE.InstancedMesh(lg.geo(), MATV, 4); LANG.goVac.frustumCulled = false; scene.add(LANG.goVac);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 2 * 3), 3));
  LANG.day = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xcdbb8c })); LANG.day.frustumCulled = false; scene.add(LANG.day);
  TRANH.push([C[0], C[1], 30]);
}
const _lm = new THREE.Object3D();
function langCapNhat(t) {
  const on = (t < TS('C03-04') || t > TS('C12-03')) && camera.position.distanceTo(new V3(LANG.C[0], 0, -LANG.C[1])) < 1500;
  for (const k of ['nha', 'dongGo', 'deoM', 'luoi', 'cotDung', 'goVac', 'day', 'thuyenKeo']) LANG[k].visible = on;
  for (const m of LANG.thuyen) m.visible = on;
  if (!on) return;
  const C = LANG.C, D = (x, n) => [x, gAt(x, n), -n];
  const T0 = (x) => x;   // giây động tác
  // 1) đẽo gỗ: hai người bổ rìu quanh mỗi thân gỗ
  LANG.deo.forEach(([x, n], g) => {
    for (let k = 0; k < 2; k++) {
      const s = k ? 1 : -1, px = x + s * 1.1, pn = n + 0.6 * s, yaw = Math.atan2(x - px, -(n - pn));
      xPut(k ? 'dannam' : 'danbinh', 'dam', t, 0.31 * k + g * 0.17, ...D(px, pn), yaw, 1, [1, 1, 1], 'riu');
    }
  });
  // 2) đóng chân cột: hai người đập búa
  for (let k = 0; k < 2; k++) { const px = C[0] + (k ? 4.6 : -4.4), pn = C[1] + 6 + (k ? 2.3 : -2.8), yaw = k ? -1.9 : 1.2; xPut('dannam', 'dam', t * 0.9, k * 0.4, ...D(px, pn), yaw, 1, [0.92, 0.9, 0.86], 'bua'); }
  // 3) vác gỗ: hai người một cây, từ đống gỗ lên công trường rồi quay lại
  const A = [C[0] - 9, C[1] - 4], B = [C[0] - 2, C[1] + 3.5];
  for (let g = 0; g < 2; g++) {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), V = 1.1, per = 2 * L / V + 4, ph = mod(t + g * per * 0.5, per) / per;
    const di = ph < 0.45, ve = ph > 0.55, u = di ? ph / 0.45 : ve ? 1 - (ph - 0.55) / 0.45 : 1;
    const dx = (B[0] - A[0]) / L, dn = (B[1] - A[1]) / L, yaw = Math.atan2(dx, -dn) + (di || !ve ? 0 : Math.PI);
    const ps = [];
    for (let k = 0; k < 2; k++) {
      const off = (k ? -1.6 : 1.6) * (ve ? -1 : 1) + (g ? 0.5 : 0), x = A[0] + dx * (u * L + off), n = A[1] + dn * (u * L + off) + (g ? 1.4 : -0.4);
      const clip = (di || !ve) ? 'vac' : 'di', ten = k ? 'dannu' : 'dannam';
      const tb = t * V / vNat(ten, clip), [px, py, pz] = D(x, n); xPut(ten, ph > 0.45 && ph < 0.55 ? 'dung' : clip, tb, k * 0.5, px, py, pz, yaw, 1, [1, 1, 1], null);
      ps.push(xHand(ten, clip, tb, k * 0.5, px, py, pz, yaw));
    }
    if (!ve) { const m = ps[0].clone().add(ps[1]).multiplyScalar(0.5); m.y -= 0.08; const d = ps[0].clone().sub(ps[1]).normalize(); _lm.position.copy(m); _lm.quaternion.setFromUnitVectors(new V3(1, 0, 0), d); _lm.scale.set(1, 1, 1); }
    else _lm.scale.set(0, 0, 0);
    _lm.updateMatrix(); LANG.goVac.setMatrixAt(g, _lm.matrix);
  }
  LANG.goVac.count = 2; LANG.goVac.instanceMatrix.needsUpdate = true;
  // 4) dựng cột: hai người kéo dây, một người đẩy, cột nghiêng dần lên rồi đứng (chu kỳ 16 s)
  { const bx = C[0] + 4.3, bn = C[1] + 9.6, P = 16, ph = mod(t, P) / P, lift = sstep(0.1, 0.75, ph), th = lerp(1.35, 0.02, lift);
    const by = gAt(bx, bn), dir = new V3(Math.sin(th), Math.cos(th), 0);
    LANG.cotDung.position.set(bx, by, -bn); LANG.cotDung.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
    const top = new V3(bx, by, -bn).addScaledVector(dir, 3.3), rp = LANG.day.geometry.attributes.position.array; let ri = 0;
    for (let k = 0; k < 3; k++) {
      const keo = k < 2, x = keo ? bx - 6.5 - k * 1.5 : bx + 1.2, n = bn + (keo ? (k ? 0.7 : -0.6) : 0.3), yaw = keo ? Math.PI / 2 : -Math.PI / 2;
      const [px, py, pz] = D(x, n); xPut(k === 1 ? 'dannu' : 'danbinh', keo ? 'keo' : 'day', t * (0.7 + lift * 0.5), k * 0.3, px, py, pz, yaw, 1, [1, 1, 1], null);
      if (keo) { rp[ri++] = top.x; rp[ri++] = top.y; rp[ri++] = top.z; rp[ri++] = px + 0.45; rp[ri++] = py + 1.1; rp[ri++] = pz; }
    }
    LANG.day.geometry.attributes.position.needsUpdate = true; }
  // 5) kéo thuyền lên bãi: ba người kéo dây phía trước mũi thuyền
  { const { A: a, B: b } = LANG.keoThuyen, P = 30, u = sstep(0, 0.8, mod(t, P) / P), x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u), h = Math.atan2(b[0] - a[0], b[1] - a[1]);
    LANG.thuyenKeo.position.set(x, Math.max(hAt(x, n), -0.3) - 0.15, -n); LANG.thuyenKeo.rotation.y = -h;
    for (let k = 0; k < 3; k++) { const px = x + Math.sin(h) * (6 + k * 1.3) + (k - 1) * 0.6, pn = n + Math.cos(h) * (6 + k * 1.3); xPut(k ? 'dannam' : 'danbinh', 'keo', t, k * 0.27, ...D(px, pn), Math.PI - h + Math.PI, 1, [1, 1, 1], null); } }
  // 6) phụ nữ ngồi vá lưới, người đi lại, trẻ đứng xem
  const ngoi = [[12, 11], [15, 12.5], [18, 13], [11, 15]];
  ngoi.forEach(([dx, dn], k) => xPut(k % 2 ? 'dannu' : 'dannam', 'ngoi', t, k * 0.2, ...D(C[0] + dx, C[1] + dn), -0.5 + Math.PI + k * 0.2, 1, [1, 1, 1], null));
  for (let k = 0; k < 6; k++) {
    const a = [C[0] - 40 + k * 6, C[1] + 40], b = [C[0] + 30 - k * 4, C[1] - 18 + k * 3], P = 2 * Math.hypot(b[0] - a[0], b[1] - a[1]) / (1.05 + k * 0.04), ph = mod(t / P + k * 0.37, 1);
    const u = ph < 0.5 ? ph * 2 : 2 - ph * 2, x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u), yaw = Math.atan2(b[0] - a[0], -(b[1] - a[1])) + (ph < 0.5 ? 0 : Math.PI);
    if (hAt(x, n) < 0.25) continue; const vv = 2 * Math.hypot(b[0] - a[0], b[1] - a[1]) / P, tn = k % 2 ? 'dannu' : 'dannam'; xPut(tn, 'di', t * vv / vNat(tn, 'di'), k * 0.13, ...D(x, n), yaw, 1, [1, 1, 1], k === 2 ? 'bo' : null);
  }
  for (let k = 0; k < 3; k++) xPut('dannu', k === 1 ? 'vaychao' : 'dung', t, k * 0.3, ...D(C[0] + 9 + k * 1.2, C[1] - 3 + k * 0.5), 2.6, 1, [1, 1, 1], null);
}
