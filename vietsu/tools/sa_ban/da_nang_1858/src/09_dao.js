// ---------- máy quay theo cú máy ----------
const FOCUS = {
  'phao-dh': () => { const p = PHAO_DH(); return [p.pos.x, -p.pos.z, p.pos.y + 1.2]; },
  'lang': () => [LANG.C[0], LANG.C[1] + 5, gAt(LANG.C[0], LANG.C[1] + 5) + 1.4],
  'gac': () => { const v = VT['hai-van']; return [v.x + 22, v.n - 14, gAt(v.x + 22, v.n - 14) + 1.5]; },
  'ngua': () => [NGUA.position.x, -NGUA.position.z, NGUA.position.y + 2],
  'luy-cl': () => [-900, -8080, gAt(-900, -8080) + 2],
  'luy': () => [-500, -3492, gAt(-500, -3492) + 1.6],
};
function diemNhin(T, t, k) {
  if (typeof T === 'string') {
    if (T.startsWith('tau:')) { const g = TAU[+T.slice(4)]; return [g.userData.x, g.userData.n, 0]; }
    if (T === 'ham-doi') { let x = 0, n = 0, c = 0; for (const g of TAU) if (g.visible && Math.hypot(g.userData.x, g.userData.n) < 20000) { x += g.userData.x; n += g.userData.n; c++; } return c ? [x / c, n / c, 0] : [-1500, 4000, 0]; }
    if (T === 'do-bo') { let x = 0, n = 0, c = 0; for (const s of XUONG.slice(0, 10)) if (s.obj && s.obj.visible) { x += s.obj.position.x; n += -s.obj.position.z; c++; } return c ? [x / c, n / c, 0] : [VT['bai-st'].x, VT['bai-st'].n, 0]; }
    if (T === 'ban-ntp') return [430, -5420, gAt(430, -5420) + 0.9];
    if (T === 'dao-luy') return [-900, -3440, gAt(-900, -3440) + 1];
    if (T === 'cong-phap') { const o = NHOM.find(o => o.id === 'cong-phap'); const s = viTriNhom(o, t); return [s.x, s.n, gAt(s.x, s.n) + 1.5]; }
    if (T === 'vien-binh') { const o = NHOM.find(o => o.id === 'vien-binh'); const s = viTriNhom(o, t); return [s.x, s.n, gAt(s.x, s.n) + 1.5]; }
    if (NV[T]) { const s = viTriNhom(NV[T], t); return [s.x, s.n, gAt(s.x, s.n) + 1.4]; }
  }
  return T;
}
function giaiKhoa(K, t) {
  let T = K.f && FOCUS[K.f] ? FOCUS[K.f]() : diemNhin(K.T, t);
  T = [T[0], T[1], T[2] != null ? T[2] : 0];
  if (typeof K.T === 'string' && K.T.startsWith('tau:')) {
    const g = TAU[+K.T.slice(4)], l = K.lech || [0, 0];
    const w = g.localToWorld(new V3(l[0], K.dy || 0, -(l[1] || 0)));
    T = [w.x, -w.z, w.y];
  } else if (K.lech) { T = [T[0] + K.lech[0], T[1] + K.lech[1], T[2]]; }
  const laTau = typeof K.T === 'string' && K.T.startsWith('tau:');
  if (T[2] === 0) T[2] = gAt(T[0], T[1]) + (K.dy != null ? 0 : Math.min(K.d * 0.02, 40));
  if (!laTau && K.dy) T[2] += K.dy;
  return { T, d: K.d, az: K.az, el: K.el, nhin: K.nhin, fov: K.fov || 50 };
}
const ease = (k) => k * k * (3 - 2 * k) * 0.6 + k * 0.4;
function mayQuay(t) {
  let sc = ST.scenes.find(s => t >= s.t0 && t < s.t1) || ST.scenes[ST.scenes.length - 1];
  let sh = sc.shots.find(s => t >= s.t0 && t < s.t1) || sc.shots[sc.shots.length - 1];
  const k = ease(clamp((t - sh.t0) / (sh.t1 - sh.t0), 0, 1));
  const A = giaiKhoa(sh.a, t), B = giaiKhoa(sh.b, t);
  const T = [lerp(A.T[0], B.T[0], k), lerp(A.T[1], B.T[1], k), lerp(A.T[2], B.T[2], k)];
  const d = Math.exp(lerp(Math.log(A.d), Math.log(B.d), k));
  let daz = B.az - A.az; if (daz > 180) daz -= 360; if (daz < -180) daz += 360;
  const az = (A.az + daz * k) * D2R, el = lerp(A.el, B.el, k) * D2R;
  let cx = T[0] + Math.sin(az) * Math.cos(el) * d, cn = T[1] + Math.cos(az) * Math.cos(el) * d, cy = T[2] + Math.sin(el) * d;
  const san = Math.max(gAt(cx, cn), hAt(cx + 3, cn), hAt(cx - 3, cn), hAt(cx, cn + 3), hAt(cx, cn - 3), 0) + 1.6;
  if (cy < san) cy = san;
  camera.position.set(cx, cy, -cn);
  let L = T; if (A.nhin || B.nhin) { const a = A.nhin || T, b = B.nhin || T; L = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2] ?? 0, b[2] ?? 0, k)]; if (!L[2]) L[2] = gAt(L[0], L[1]); }
  camera.lookAt(L[0], L[2], -L[1]);
  const fov = lerp(A.fov, B.fov, k); if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; }
  return { sc, sh };
}
function matCat() {
  // mặt cắt gần/xa theo độ cao máy (bài học 5)
  const y = Math.max(camera.position.y - Math.max(gAt(camera.position.x, -camera.position.z), 0), 1);
  camera.near = clamp(y * 0.08, 0.15, 60); camera.far = clamp(y * 60 + 30000, 30000, 260000); camera.updateProjectionMatrix();
}

// ---------- trời theo hồi ----------
const TROI = {
  sang: { sun: [-0.45, 0.62, 0.4], sc: 0xfff1dc, si: 2.3, hi: 1.05, top: 0x3f78b8, hor: 0xc6d6e2, fog: 0xbfcfdc, exp: 1.0, cl: 0.35, dark: 0 },
  chieu: { sun: [-0.8, 0.25, 0.2], sc: 0xffc98a, si: 2.0, hi: 0.85, top: 0x4f78a8, hor: 0xe8c9a0, fog: 0xd8c4a8, exp: 1.0, cl: 0.4, dark: 0 },
  dem: { sun: [0.3, 0.5, -0.4], sc: 0x9fb8e8, si: 0.7, hi: 0.45, top: 0x0f1a30, hor: 0x2a3a58, fog: 0x22304a, exp: 1.25, cl: 0.25, dark: 0.45 },
  binhminh: { sun: [0.85, 0.12, 0.2], sc: 0xffb07a, si: 1.6, hi: 0.7, top: 0x4a6a9a, hor: 0xf0b890, fog: 0xd8b8a0, exp: 1.0, cl: 0.4, dark: 0.05 },
  mua: { sun: [-0.3, 0.7, 0.3], sc: 0xc8ccd0, si: 0.7, hi: 1.0, top: 0x6a7480, hor: 0x9aa4ac, fog: 0x8e989f, exp: 0.95, cl: 0.95, dark: 0.15 },
  hoanghon: { sun: [-0.85, 0.1, 0.1], sc: 0xffa060, si: 2.0, hi: 0.7, top: 0x3a5a8a, hor: 0xf0a878, fog: 0xd89c7c, exp: 1.05, cl: 0.45, dark: 0 },
};
let LICH_TROI = [];
function lapLichTroi() {
  LICH_TROI = [[0, 'sang'], [SC.C03.t0, 'sang'], [SC.C03.t0 + 6, 'chieu'], [TC('C03', 9) - 1, 'chieu'], [TC('C03', 9) + 3, 'dem'], [SC.C04.t0 - 0.5, 'dem'], [SC.C04.t0 + 0.5, 'binhminh'], [TC('C04', 3), 'binhminh'], [TC('C04', 6), 'sang'],
    [SC.C10.t0 - 0.5, 'sang'], [SC.C10.t0 + 0.5, 'mua'], [SC.C10.t1 - 0.5, 'mua'], [SC.C10.t1 + 0.5, 'sang'], [TC('C12', 9) - 2, 'sang'], [TC('C12', 9) + 6, 'hoanghon'], [1e9, 'hoanghon']];
}
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function troiCapNhat(t) {
  let a = LICH_TROI[0], b = a;
  for (let i = 0; i < LICH_TROI.length - 1; i++) if (t >= LICH_TROI[i][0] && t < LICH_TROI[i + 1][0]) { a = LICH_TROI[i]; b = LICH_TROI[i + 1]; break; }
  const k = sstep(a[0], b[0], t), A = TROI[a[1]], B = TROI[b[1]];
  const mix = (x, y) => lerp(x, y, k), mc = (x, y, out) => out.set(x).lerp(_c2.set(y), k);
  SUN.set(mix(A.sun[0], B.sun[0]), mix(A.sun[1], B.sun[1]), mix(A.sun[2], B.sun[2])).normalize();
  sun.position.copy(SUN).multiplyScalar(10000).add(camera.position); sun.target.position.copy(camera.position);
  mc(A.sc, B.sc, sun.color); sun.intensity = mix(A.si, B.si); hemi.intensity = mix(A.hi, B.hi);
  mc(A.top, B.top, skyU.top.value); mc(A.hor, B.hor, skyU.hor.value); skyU.sunDir.value.copy(SUN); skyU.cloud.value = mix(A.cl, B.cl);
  skyU.sunCol.value.copy(sun.color).multiplyScalar(mix(A.si, B.si) > 1 ? 1 : 0.4);
  mc(A.fog, B.fog, scene.fog.color);
  const camY = camera.position.y; scene.fog.near = 3000 + camY * 2; scene.fog.far = 45000 + camY * 6;
  if (a[1] === 'mua' || b[1] === 'mua') { scene.fog.near *= 0.25; scene.fog.far *= 0.35; }
  renderer.toneMappingExposure = mix(A.exp, B.exp);
  waterU.skyC.value.copy(skyU.hor.value); waterU.topC.value.copy(skyU.top.value); waterU.sunDir.value.copy(SUN); waterU.fogC.value.copy(scene.fog.color);
  waterU.fogN.value = scene.fog.near; waterU.fogF.value = scene.fog.far; waterU.sunK.value = mix(A.si, B.si) / 2.3; waterU.dark.value = mix(A.dark, B.dark);
  const mua = (a[1] === 'mua' ? 1 - k : 0) + (b[1] === 'mua' ? k : 0); waterU.rain.value = mua;
  for (const H of [KHOI, LUA]) { H.u.fogC.value.copy(scene.fog.color); H.u.fogN.value = scene.fog.near; H.u.fogF.value = scene.fog.far; H.u.scale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * D2R / 2)); }
  KHOI.u.light.value = clamp(hemi.intensity * 0.9 + 0.1, 0.25, 1.05);
  return mua;
}

// ---------- nhãn, ghim ----------
const NHAN = [];
function nhan(ten, pos, loai, hien) { const el = document.createElement('div'); el.className = 'ghim ' + loai; el.innerHTML = '<b></b><span>' + ten + '</span>'; $('#nhan').appendChild(el); NHAN.push({ el, pos, loai, hien }); }
function nhanCapNhat(t, bat, coDo) {
  const w = cv.clientWidth, h = cv.clientHeight, v = new V3(), camH = camera.position.y;
  for (const L of NHAN) {
    let on = (bat || L.bt || L.luon) && L.hien(t); if (BT.on && !L.bt) on = false;
    if (on) {
      const p = typeof L.pos === 'function' ? L.pos(t) : L.pos; if (!p) { L.el.style.display = 'none'; continue; }
      v.copy(p); const dist = v.distanceTo(camera.position);
      if (L.loai === 'moc' && (camH < 250 || dist > 26000)) on = false;
      if (L.loai === 'nv' && dist > 90) on = false; if (L.loai === 'moc' && t > TS('C02-01') && t < TE('C02-01')) on = false; if (L.loai === 'bt' && DI.on && dist > 18) on = false;
      if (L.loai === 'tau' && (dist > 2500 || dist < 40)) on = false;
      if (on) { v.project(camera); if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05) on = false; }
      if (on) { L.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px,${(-v.y * 0.5 + 0.5) * h}px)`; }
    }
    L.el.style.display = on ? 'block' : 'none';
  }
}
function dungNhan() {
  const P = (k, dy = 30) => () => { const v = VT[k]; return new V3(v.x, gAt(v.x, v.n) + dy, -v.n); };
  const luon = () => true;
  for (const k of ['dien-hai', 'an-hai', 'hai-van', 'son-tra-tay', 'trai-phap', 'nghia-dia', 'tien-don', 'chon-sang', 'dinh-hai', 'thanh-khe', 'cam-le']) {
    const ten = VT[k].ten + (VT[k].ghi && VT[k].ghi.startsWith('ƯỚC') ? ' ·' : '');
    const hien = k === 'trai-phap' || k === 'nghia-dia' || k === 'tien-don' ? (t) => t > TS('C05-01') && t < SC.C12.t0 + 20 : luon;
    nhan(ten, P(k), 'moc', hien);
  }
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) nhan(VT[k].ten, P(k), 'moc', (t) => t > SC.C07.t0);
  nhan('Đèo Hải Vân', () => W(-9500, 12500, 120), 'moc', luon);
  nhan('Bán đảo Sơn Trà', () => W(6400, 3600, 60), 'moc', luon);
  nhan('Vịnh Đà Nẵng', () => new V3(-3500, 30, -5500), 'moc', luon);
  nhan('Sông Hàn', () => new V3(1760, 20, 2600), 'moc', luon);
  nhan('Biển Đông', () => new V3(9000, 30, -9000), 'moc', luon);
  nhan('Hướng ra Huế', () => W(-13000, 14500, 80), 'moc', luon);
  for (const [id, o] of Object.entries(NV)) nhan(o.ten, (t) => o._pos ? o._pos.clone().add(new V3(0, 0.9, 0)) : null, 'nv', (t) => t >= o.hien[0] && t <= o.hien[1]);
  nhan('Kỳ hạm liên quân', () => TAU[0].visible ? TAU[0].position.clone().add(new V3(0, 48, 0)) : null, 'tau', luon);
  nhan('Tàu Tây Ban Nha', () => TAU[8].visible ? TAU[8].position.clone().add(new V3(0, 38, 0)) : null, 'tau', luon);
}

// ---------- mũi tên (một khối liền, trắng, độ đục 0,9) ----------
const MUI = [];
function muiTen(pts, cao, t0, t1, hien, mau = 0xffffff, r = 40) {
  const P = pts.map(([x, n, y]) => new V3(x, y != null ? y : cao, -n)), cur = new THREE.CatmullRomCurve3(P, false, 'centripetal');
  const N = 80, path = cur.getSpacedPoints(N), L = cur.getLength(), dau = Math.min(r * 5, L * 0.25);
  const v = [], idx = []; const ring = 8;
  for (let i = 0; i <= N; i++) {
    const p = path[i], tg = cur.getTangentAt(i / N), s = i / N * L, rr = s > L - dau ? 0 : r;
    const nn = new V3(-tg.z, 0, tg.x).normalize(), up = new V3(0, 1, 0);
    for (let k = 0; k < ring; k++) { const a = k / ring * 6.283; v.push(p.x + (nn.x * Math.cos(a)) * rr, p.y + Math.sin(a) * rr * 0.5, p.z + nn.z * Math.cos(a) * rr); }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < ring; k++) { const a = i * ring + k, b = i * ring + (k + 1) % ring, c = a + ring, d = b + ring; idx.push(a, c, b, b, c, d); }
  // đầu mũi dẹt
  const iT = Math.floor(N * (1 - dau / L)), pT = path[iT], tgT = cur.getTangentAt(iT / N), nT = new V3(-tgT.z, 0, tgT.x).normalize(), tip = path[N];
  const b0 = v.length / 3;
  v.push(pT.x + nT.x * r * 2.6, pT.y, pT.z + nT.z * r * 2.6, pT.x - nT.x * r * 2.6, pT.y, pT.z - nT.z * r * 2.6, tip.x, tip.y, tip.z, pT.x, pT.y + r * 0.6, pT.z);
  idx.push(b0, b0 + 1, b0 + 2, b0, b0 + 3, b0 + 2, b0 + 1, b0 + 3, b0 + 2);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: mau, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.renderOrder = 8; scene.add(m);
  const o = { m, t0, t1, hien, nIdx: idx.length, nTube: N * ring * 6 }; MUI.push(o); return o;
}
function muiCapNhat(t) {
  for (const o of MUI) {
    const on = t >= o.hien[0] && t <= o.hien[1]; o.m.visible = on; if (!on) continue;
    const k = clamp((t - o.t0) / (o.t1 - o.t0), 0, 1);
    o.m.geometry.setDrawRange(0, k >= 1 ? o.nIdx : Math.floor(o.nTube * k / 6) * 6);
    o.m.material.opacity = 0.9 * sstep(o.hien[0], o.hien[0] + 0.6, t) * (1 - sstep(o.hien[1] - 0.6, o.hien[1], t));
  }
}
// vùng liên quân chiếm đóng (phủ đỏ mờ trên đất) và dấu X đồn mất
let VUNG = null; const DAU_X = [];
function dungVung() {
  const poly = [[-300, 3300], [2700, 3500], [3900, 900], [3000, -2700], [1300, -2700], [500, -2200], [600, -600], [-100, 700]];
  const shape = new THREE.Shape(poly.map(([x, n]) => new THREE.Vector2(x, n)));
  const g = new THREE.ShapeGeometry(shape, 1); const tri = g.toNonIndexed();
  // chia nhỏ để bám đất
  let geo = tri; for (let k = 0; k < 5; k++) geo = chiaTamGiac(geo);
  const p = geo.attributes.position; const out = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), n = p.getY(i); out.push(x, Math.max(hAt(x, n), 0) + 12, -n); }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  VUNG = new THREE.Mesh(G, new THREE.MeshBasicMaterial({ color: 0xd0302a, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  VUNG.renderOrder = 6; scene.add(VUNG);
  const dv = []; const pc = [...poly, poly[0]];
  for (let i = 0; i < pc.length - 1; i++) { const [a, b] = pc[i], [c, d] = pc[i + 1], L = Math.hypot(c - a, d - b); for (let s = 0; s < L; s += 120) { const x = a + (c - a) * s / L, n = b + (d - b) * s / L; dv.push([x, n, Math.max(hAt(x, n), 0) + 14]); } }
  dv.push([pc[0][0], pc[0][1], Math.max(hAt(pc[0][0], pc[0][1]), 0) + 14]);
  const vien = muiTen(dv, 0, 0, 0, [-1, -1], 0xff5040, 10); // viền dùng ống mảnh (không đầu mũi)
  vien.m.geometry.setDrawRange(0, vien.nTube); vien.vien = true; VUNG.userData.vien = vien;
  for (const k of ['dien-hai', 'an-hai', 'son-tra-tay']) {
    const v = VT[k], gx = new THREE.Group();
    for (const s of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(420, 30, 60), new THREE.MeshBasicMaterial({ color: 0xff3a30, transparent: true, opacity: 0.9, fog: false, depthWrite: false })); b.rotation.y = s * Math.PI / 4; gx.add(b); }
    gx.position.set(v.x, 260, -v.n); gx.renderOrder = 9; scene.add(gx); DAU_X.push(gx);
  }
}
function chiaTamGiac(g) {
  const p = g.attributes.position, o = [];
  for (let i = 0; i < p.count; i += 3) {
    const a = [p.getX(i), p.getY(i)], b = [p.getX(i + 1), p.getY(i + 1)], c = [p.getX(i + 2), p.getY(i + 2)];
    const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2], ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
    for (const T of [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]) for (const q of T) o.push(q[0], q[1], 0);
  }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(o, 3)); return G;
}
