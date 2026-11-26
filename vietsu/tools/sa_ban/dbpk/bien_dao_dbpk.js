// ================================================================== HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG 1972 · dàn cảnh V0 (26/11/2026)
// Kịch bản: KICH_BAN_CLAUDE_12_CANH.md (anh Thắng); voice là đồng hồ (story.moc['Cxx.n'] = giây bắt đầu câu n).
// Mọi vị trí trận địa (trừ Tiểu đoàn 77 ở Chèm, S3), đường bay, điểm rơi, số người, cỡ nhà là TÁI DỰNG MINH HOẠ; mốc, đơn vị theo sources.json.
// Độ cao bay, cỡ máy bay, tên lửa trên sa bàn được thu / phóng để nhìn được (B-52 thật bay ~10 km).
{
  const HOI = {}; for (const c of STORY.scenes) HOI[c.id] = c;
  const H = (id) => HOI[id] || { t0: 1e9, t1: 1e9, shots: [] };
  const MC = STORY.moc || {};
  const M = (id, i) => (MC[id + '.' + i] !== undefined ? MC[id + '.' + i] : H(id).t0);
  const HN = TANG === 'ha-noi';
  const SB = HN ? 3.4 : 14;                         /* phóng to máy bay, tên lửa */
  const ALT = HN ? 3200 : 8200;                     /* độ cao bay của tốp B-52 trên sa bàn */
  const PM = (k) => { const v = LL(MOC[k][0], MOC[k][1], 0); v.y = hG(v.x, v.z); return v; };
  const G3 = (x, z, dy = 0) => V3(x, hG(x, z) + dy, z);
  const tren = (p, k = 3) => { const g = hG(p.x, p.z) + k; if (p.y < g) p.y = g; return p; };
  const trongR = (v, m = 0.97) => Math.hypot(v.x, v.z) < R * m;
  const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const rr = rndS(1972);
  const huong = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const napSan = (o) => { const an = [], fc = []; o.traverse((c) => { if (!c.visible) { an.push(c); c.visible = true; } if (c.frustumCulled) { fc.push(c); c.frustumCulled = false; }
      const MM = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : []; for (const m of MM) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) if (m[k]) try { renderer.initTexture(m[k]); } catch (e) {} });
    const v0 = o.visible; o.visible = true; const rt = new THREE.WebGLRenderTarget(1, 1), cu = renderer.getRenderTarget();
    try { renderer.setRenderTarget(rt); renderer.render(scene, camera); } catch (e) { console.warn('nạp sẵn mẫu', e); } renderer.setRenderTarget(cu); rt.dispose();
    o.visible = v0; for (const c of an) c.visible = false; for (const c of fc) c.frustumCulled = true; return o; };
  KS.H = H; KS.M = M;
  const trong = (t, id, a = 0, b = 0) => t >= H(id).t0 - a && t < H(id).t1 + b;
  /* đặt khí tài lên đất liền (anh Thắng 26/11: trận địa pháo phút 13:57 nằm dưới sông Hồng): chỗ định đặt là nước thì dò vòng ra chỗ cao hơn mặt nước */
  const lenDat = (p, rMax = 1200) => { const kho = (x, z) => hG(x, z) > tideNow + 1.2; const ok = (x, z) => kho(x, z) && kho(x + 30, z) && kho(x - 30, z) && kho(x, z + 30) && kho(x, z - 30);
    if (ok(p.x, p.z)) return p; for (let r = 20; r <= rMax; r += 20) for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, x = p.x + Math.sin(a) * r, z = p.z + Math.cos(a) * r; if (ok(x, z)) { p.x = x; p.z = z; p.y = hG(x, z); return p; } } return p; };
  const shotT = (id) => { for (const c of STORY.scenes) for (const s of c.shots) if (s.id === id) return s; return { t0: 1e9, t1: 1e9 }; };

  // ---------------------------------------------------------------- bầu trời: đông u ám, chạng vạng, đêm, bình minh (MINH HOẠ)
  Object.assign(SKY, {
    'Đông u ám': { top: '#6f7f8c', hor: '#c6c9c4', low: '#8a8a7e', ground: '#6e6a58', fog: 0.00005, el: 24, az: 160, sun: '#fff0dc', si: 1.5, hs: '#b6bfc4', hg: '#55503f', hi: 1.0, cover: 0.82, cc: '#e7e6e0', cs: '#8a9096', exp: 0.95, size: 500, glow: 0.4 },
    'Chạng vạng': { top: '#2a3550', hor: '#b98a6a', low: '#5d5a58', ground: '#3d3a33', fog: 0.00005, el: 3, az: 245, sun: '#ffb27a', si: 0.9, hs: '#8890a4', hg: '#3a352b', hi: 0.6, cover: 0.6, cc: '#c9a48c', cs: '#4d4c58', exp: 0.95, size: 1400, glow: 1.2 },
    'Đêm': { top: '#0a1124', hor: '#2a3650', low: '#161c28', ground: '#1c1f26', fog: 0.00003, el: 40, az: 200, sun: '#b4c6ff', si: 0.85, hs: '#7080a8', hg: '#26282f', hi: 0.85, cover: 0.35, cc: '#3a4256', cs: '#141824', exp: 1.35, size: 120, glow: 0.05 },
    'Bình minh': { top: '#4a5f86', hor: '#e2b08a', low: '#8a7f78', ground: '#5c564a', fog: 0.00005, el: 6, az: 115, sun: '#ffc48e', si: 1.3, hs: '#a7b0c2', hg: '#48433a', hi: 0.8, cover: 0.5, cc: '#f1d2bd', cs: '#76727c', exp: 0.95, size: 1400, glow: 1.2 },
  });
  SKYKEYS.length = 0;
  const DEM = ['C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
  SKYKEYS.push([0, 'Đông u ám', 0.01], [M('C01', 11), 'Chạng vạng', 8]);
  for (const id of DEM) SKYKEYS.push([H(id).t0, 'Đêm', id === 'C03' ? 0.01 : 0.01]);
  SKYKEYS.sort((a, b) => a[0] - b[0]);
  SKYKEYS.push([M('C07', 13), 'Bình minh', 6]); SKYKEYS.push([H('C08').t0, 'Đêm', 0.01]);
  SKYKEYS.push([M('C10', 10), 'Bình minh', 8], [H('C11').t0, 'Đông u ám', 0.01], [H('C12').t0, 'Sáng trong', 0.01], [M('C12', 16), 'Trưa nắng', 8]);
  SKYKEYS.sort((a, b) => a[0] - b[0]);
  KS.dem = (t) => { let k = SKYKEYS[0]; for (const x of SKYKEYS) if (t >= x[0]) k = x; return k[1] === 'Đêm'; };
  sky.scale.setScalar(Math.max(1, (R * 3.2) / 100000));                                  /* tầng miền Bắc rộng 250 km: vòm trời không che địa hình */

  // ---------------------------------------------------------------- bể đốm sáng / khói (sprite) dùng chung, cấp mỗi khung
  const BE = { a: [], b: [], na: 0, nb: 0 };
  const dom = (cong, mau, x, y, z, s, op) => { const L = cong ? BE.a : BE.b, n = cong ? BE.na++ : BE.nb++; let sp = L[n];
    if (!sp) { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: NHOE_TEX, transparent: true, depthWrite: false, fog: !cong, blending: cong ? THREE.AdditiveBlending : THREE.NormalBlending })); sp.frustumCulled = false; scene.add(sp); L.push(sp); }
    sp.visible = true; sp.material.color.setHex(mau); sp.position.set(x, y, z); sp.scale.setScalar(s); sp.material.opacity = op; return sp; };
  const domXong = () => { for (let i = BE.na; i < BE.a.length; i++) BE.a[i].visible = false; for (let i = BE.nb; i < BE.b.length; i++) BE.b[i].visible = false; BE.na = BE.nb = 0; };
  const DEN = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xffa860, 0, 1, 1.6); scene.add(l); return l; }); let nDen = 0;
  const denNo = (p, s, k) => { if (nDen >= DEN.length) return; const l = DEN[nDen++]; l.position.copy(p); l.distance = s * 14; l.intensity = 6 * k * (HN ? 1 : 30); };

  // ---------------------------------------------------------------- mẫu dựng bằng mã: tên lửa V-750 (S-75), bệ phóng, xe điều khiển, ra-đa P-12, F-4 (MINH HOẠ)
  const gop = (L) => merge(L.map(([geo, c]) => colored(geo.index ? geo.toNonIndexed() : geo, c)));
  const vcMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const XANH = 0x5d6b4a, SAM = 0xd9dccf, XAM = 0x6b6f6c;
  const cyl = (r1, r2, h, n = 10) => new THREE.CylinderGeometry(r1, r2, h, n);
  const vay = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  /* tên lửa V-750 (dài ~10,6 m: tầng đẩy ~3,2 m có 4 cánh lớn; tầng chính ~7,4 m, cánh giữa thân, cánh lái mũi): trục +Z = mũi */
  const tenLuaGeo = (() => { const L = [];
    L.push([cyl(0.25, 0.25, 7.4).rotateX(Math.PI / 2).translate(0, 0, 2.6), SAM], [cyl(0.02, 0.25, 1.4).rotateX(Math.PI / 2).translate(0, 0, 7.0), SAM]);
    L.push([cyl(0.33, 0.33, 3.0).rotateX(Math.PI / 2).translate(0, 0, -2.6), 0xc9ccbf]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4;
      L.push([vay(0.04, 1.25, 1.5).translate(0, 0.95, -3.4).rotateZ(a), 0xbfc2b6], [vay(0.03, 0.75, 1.6).translate(0, 0.6, 2.2).rotateZ(a), SAM], [vay(0.03, 0.35, 0.5).translate(0, 0.38, 5.9).rotateZ(a), SAM]); }
    return gop(L); })();
  const tenLua = () => { const m = new THREE.Mesh(tenLuaGeo, vcMat); m.visible = false; scene.add(m); return m; };
  /* bệ phóng SM-63 (đế, mâm xoay, dầm phóng nghiêng) */
  const bePhongGeo = (() => gop([[vay(3.6, 0.8, 4.6).translate(0, 0.4, 0), XANH], [cyl(1.3, 1.5, 0.6, 12).translate(0, 1.1, 0), XANH], [vay(0.6, 0.5, 7.5).translate(0, 0, 2.2).rotateX(-0.6).translate(0, 2.0, -0.6), 0x4f5c3e], [vay(1.6, 1.1, 1.0).translate(0, 1.7, -1.6), 0x4f5c3e]]))();
  const bePhong = (x, z, yaw, sc = 1) => { const g = new THREE.Group(), b = new THREE.Mesh(bePhongGeo, vcMat); g.add(b); const tl = new THREE.Mesh(tenLuaGeo, vcMat); tl.position.set(0, 2.55, 1.5); tl.rotation.x = -0.6; g.add(tl);
    g.position.set(x, hG(x, z), z); g.rotation.y = yaw; g.scale.setScalar(sc); scene.add(g); g.userData.tl = tl; return g; };
  /* xe điều khiển + ra-đa SNR-75 (hai ăng-ten máng ngang, dọc) */
  const xeDKGeo = (() => gop([[vay(2.5, 2.6, 6.5).translate(0, 1.6, 0), XANH], [cyl(0.45, 0.45, 0.4).rotateZ(Math.PI / 2).translate(1.3, 0.45, 2.2), 0x222222], [cyl(0.45, 0.45, 0.4).rotateZ(Math.PI / 2).translate(-1.3, 0.45, 2.2), 0x222222],
    [cyl(0.45, 0.45, 0.4).rotateZ(Math.PI / 2).translate(1.3, 0.45, -2.2), 0x222222], [cyl(0.45, 0.45, 0.4).rotateZ(Math.PI / 2).translate(-1.3, 0.45, -2.2), 0x222222]]))();
  const raDaGeo = (() => gop([[vay(3.0, 2.4, 3.0).translate(0, 1.2, 0), XANH], [cyl(0.5, 0.5, 1.2).translate(0, 3.0, 0), XAM], [vay(6.5, 0.9, 0.7).translate(0, 4.2, 0.6), 0x8a8f86], [vay(0.9, 6.0, 0.7).translate(3.6, 4.2, 0.6), 0x8a8f86], [cyl(0.9, 0.9, 0.3, 14).rotateX(Math.PI / 2).translate(-2.3, 5.3, 0.6), 0x9aa094]]))();
  /* ra-đa cảnh giới P-12: khung ăng-ten Yagi trên xe */
  const p12Geo = (() => { const L = [[vay(2.4, 2.2, 6.0).translate(0, 1.4, 0), XANH], [cyl(0.15, 0.15, 3.5, 6).translate(0, 4.2, 0), XAM]];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) L.push([cyl(0.04, 0.04, 3.2, 4).rotateX(Math.PI / 2).translate(-3 + j * 1.2, 5.0 + i * 0.9, 0.3), 0xbfc4bc]);
    L.push([vay(7.6, 0.12, 0.12).translate(0, 4.8, 0), XAM], [vay(7.6, 0.12, 0.12).translate(0, 8.0, 0), XAM]); return gop(L); })();
  /* F-4 (máy bay hộ tống, MINH HOẠ hình khối): trục +Z mũi */
  const f4Geo = (() => gop([[cyl(0.5, 0.9, 17.5, 8).rotateX(Math.PI / 2), 0x7d8780], [cyl(0.02, 0.5, 2.5, 8).rotateX(Math.PI / 2).translate(0, 0, 10), 0x6d7570],
    [vay(11.7, 0.25, 4.5).translate(0, -0.2, -1.5), 0x7a847d], [vay(0.25, 3.2, 3.2).translate(0, 1.8, -7.0), 0x7a847d], [vay(5.2, 0.2, 2.2).translate(0, -0.6, -7.8), 0x6f7871]]))();
  const f4Mat = new THREE.MeshLambertMaterial({ vertexColors: true });

  // ---------------------------------------------------------------- mẫu GLB: B-52D (anh Thắng làm, em sơn rằn ri 1968–72), MiG-21 (anh Thắng 26/11), cao xạ 37 mm, súng 12,7 mm, xe tải
  const GLB = {};
  const veGlb = async (file, sc = 1) => { const g = await glbLoad(file); const o = g.scene.clone(true); o.scale.setScalar(sc); o.visible = false; scene.add(o); return o; };
  const B52 = [], MIG = [], F4 = [], RADA = [];
  const SONG_GEO = new THREE.RingGeometry(0.8, 1, 40, 1, Math.PI * 0.2, Math.PI * 0.6);   /* cung sóng ra-đa (vòng cung quay lên trên) */
  const datMB = (o, p, f, nghieng = 0) => { o.position.copy(p); const yaw = Math.atan2(f.x, f.z), pitch = Math.atan2(f.y, Math.hypot(f.x, f.z)); o.rotation.set(-pitch, yaw, nghieng, 'YXZ'); };

  // ---------------------------------------------------------------- địa danh, trận địa
  const TD = {};                                                                                 /* trận địa tên lửa: {g, be[6], dk, p12, tam} */
  const DS_TD = HN ? [['td59', 'Tiểu đoàn 59 (ước lượng)'], ['td57', 'Tiểu đoàn 57 (ước lượng)'], ['td77', 'Tiểu đoàn 77 · Chèm'], ['td79', 'Tiểu đoàn 79 (ước lượng)'], ['td72', 'Tiểu đoàn 72 (ước lượng)']]
    : [['td59', ''], ['td77', ''], ['td79', ''], ['tdhp', '']];
  for (const [k, ten] of DS_TD) { if (!MOC[k]) continue; const c = PM(k); if (!trongR(c, 0.9)) continue;
    const s = HN ? 1 : 6, yaw0 = rr() * 6.28, be = [];
    for (let i = 0; i < 6; i++) { const a = yaw0 + i * Math.PI / 3, x = c.x + Math.sin(a) * 75 * s, z = c.z + Math.cos(a) * 75 * s; be.push(bePhong(x, z, a, s)); }
    const dk = new THREE.Mesh(xeDKGeo, vcMat); dk.position.set(c.x - 6 * s, hG(c.x, c.z), c.z); dk.scale.setScalar(s); scene.add(dk);
    const rd = new THREE.Mesh(raDaGeo, vcMat); rd.position.set(c.x + 8 * s, hG(c.x, c.z), c.z + 4 * s); rd.scale.setScalar(s); scene.add(rd);
    const ux = new THREE.Mesh(new THREE.TorusGeometry(9 * s, 1.6 * s, 4, 18, Math.PI * 1.6).rotateX(-Math.PI / 2), mat(0x6b5a40));   /* ụ đất quanh bệ */
    TD[k] = { c, be, dk, rd, ten, s, ux: be.map((b) => { const u = ux.clone(); u.position.copy(b.position).add(V3(0, 0.3, 0)); u.rotation.y = b.rotation.y + Math.PI * 0.7; scene.add(u); return u; }) }; }
  const P12 = []; for (const k of ['p12a', 'p12b']) if (MOC[k] && HN) { const c = PM(k); const m = new THREE.Mesh(p12Geo, vcMat); m.position.copy(c); scene.add(m); P12.push(m); }   /* thay bằng mẫu xe ra-đa của anh Thắng khi tải xong */
  KS.TD = TD;

  // ---------------------------------------------------------------- Hà Nội 1972: nhà phố (placement.json › nha, MINH HOẠ), đèn phố, cầu Long Biên, nhà máy, Bạch Mai, Khâm Thiên, Cột cờ
  const HNX = { nhaKT: [], denPho: null };
  const duongD = (k) => (INST.duong && INST.duong[k]) ? INST.duong[k].map(([x, z]) => V3(x, 0, z)) : null;
  const gan = (P, x, z) => { let b = 1e9; for (let i = 1; i < P.length; i++) { const a = P[i - 1], c = P[i], dx = c.x - a.x, dz = c.z - a.z, L2 = dx * dx + dz * dz || 1; let u = ((x - a.x) * dx + (z - a.z) * dz) / L2; u = clamp(u, 0, 1); b = Math.min(b, Math.hypot(a.x + dx * u - x, a.z + dz * u - z)); } return b; };
  if (HN && INST.nha) {
    const TUONG = [0xcdb27a, 0xd8c79a, 0xbfb6a2, 0xe0d6bc, 0xb79e74], MAI = [0x8a4a32, 0x7a4430, 0x5d5a55, 0x93583a];
    const ONHA = new Map(), O = 900;
    /* V0.2 (anh Thắng 26/11: "nhà xếp lại theo đúng các tuyến đường"): placement.json xếp nhà ống thành dãy mặt tiền dọc đường OSM, mặt nhà (+z cục bộ) quay ra đường;
       mái ngói hai dốc, nóc chạy theo bề ngang mặt tiền (song song với đường) */
    const box = vay(1, 1, 1).translate(0, 0.5, 0), mai = (() => { const A = [-0.5, 0, -0.5], B = [0.5, 0, -0.5], C_ = [0.5, 0, 0.5], D = [-0.5, 0, 0.5], E = [-0.5, 1, 0], F = [0.5, 1, 0];
      const v = [A, E, F, A, F, B, D, C_, F, D, F, E, A, D, E, B, F, C_].flat(), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g; })();
    const HTc = INST.vung && INST.vung.huutiep ? INST.vung.huutiep.reduce((a, [x, z], i, A) => [a[0] + x / A.length, a[1] + z / A.length], [0, 0]) : [1e9, 1e9];
    for (const n of INST.nha) { if (Math.hypot(n[0] - HTc[0], n[1] - HTc[1]) < 70) continue; const key = Math.floor(n[0] / O) + ',' + Math.floor(n[1] / O); if (!ONHA.has(key)) ONHA.set(key, []); ONHA.get(key).push(n); }
    const q4 = new THREE.Quaternion(), Y = V3(0, 1, 0), m4 = new THREE.Matrix4(), cl = new THREE.Color();
    for (const [key, L] of ONHA) {
      const th = new THREE.InstancedMesh(box, mat(0xffffff), L.length), mm = new THREE.InstancedMesh(mai, mat(0xffffff, { side: THREE.DoubleSide }), L.length); let cx = 0, cz = 0;
      L.forEach(([x, z, yaw, w, d, h, k], i) => { const y = hG(x, z); q4.setFromAxisAngle(Y, yaw);
        th.setMatrixAt(i, m4.compose(V3(x, y, z), q4, V3(w, h, d))); th.setColorAt(i, cl.setHex(TUONG[k % TUONG.length]));
        mm.setMatrixAt(i, m4.compose(V3(x, y + h, z), q4, V3(w + 0.3, Math.min(2.4, d * 0.2), d + 0.7))); mm.setColorAt(i, cl.setHex(MAI[(k + i) % MAI.length])); cx += x; cz += z; });
      const tam = V3(cx / L.length, 0, cz / L.length);
      for (const m of [th, mm]) { m.userData.tam = tam; m.userData.xa = 4500; m.frustumCulled = true; m.computeBoundingSphere(); scene.add(m); LAYER.nha.push(m); } }
    /* đèn phố, đèn nhà (chạng vạng C01, C03 trước báo động) — tắt ở câu "Đèn đường tắt dần" (C04) */
    { const n = Math.min(INST.nha.length, 9000), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = INST.nha[Math.floor(i * INST.nha.length / n)]; pos.set([a[0] + Math.sin(a[2]) * a[4] * 0.55, hG(a[0], a[1]) + 2.2, a[1] + Math.cos(a[2]) * a[4] * 0.55], i * 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      HNX.denPho = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffc070, size: 7, sizeAttenuation: true, map: NHOE_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
      HNX.denPho.frustumCulled = false; scene.add(HNX.denPho); }
  }
  if (HN) {
    /* cầu Long Biên (1903): mặt cầu theo OSM, giàn thép dầm hẫng cong trên từng nhịp (giản lược, MINH HOẠ) */
    const LB = duongD('longbien');
    if (LB) { const L = [], hD = 11; let acc = 0; const tot = LB.reduce((s, p, i) => s + (i ? p.distanceTo(LB[i - 1]) : 0), 0), nhip = tot / 19;
      for (let i = 1; i < LB.length; i++) { const a = LB[i - 1], b = LB[i], d = a.distanceTo(b), f = b.clone().sub(a).normalize(), yaw = Math.atan2(f.x, f.z);
        for (let s = 0; s < d; s += 6) { const x = a.x + f.x * (s + 3), z = a.z + f.z * (s + 3), sAll = acc + s + 3, u = (sAll % nhip) / nhip, top = hD + 3 + 7 * Math.sin(Math.PI * u);
          const y0 = Math.max(hG(x, z), 0.3) > 9 ? hG(x, z) : hD;
          L.push([vay(9, 0.6, 6.2).rotateY(yaw).translate(x, y0, z), 0x4a4640]);
          for (const sg of [-1, 1]) { const ox = Math.cos(yaw) * 4.3 * sg, oz = -Math.sin(yaw) * 4.3 * sg;
            L.push([vay(0.35, 0.35, 6.2).rotateY(yaw).translate(x + ox, y0 + top - hD, z + oz), 0x3d3a35], [vay(0.25, top - hD, 0.25).translate(x + ox, y0 + (top - hD) / 2, z + oz), 0x3d3a35]); }
          if (u < 0.06 && y0 === hD) L.push([vay(6, hD + 4, 8).rotateY(yaw).translate(x, hD / 2 - 2, z), 0x6a6258]); }
        acc += d; }
      const m = new THREE.Mesh(gop(L), vcMat); scene.add(m); HNX.lb = m; }
    /* nhà máy Xe lửa Gia Lâm: xưởng mái răng cưa, ống khói (MINH HOẠ) */
    const NM = INST.vung && INST.vung.nhamayxelua;
    if (NM) { let cx = 0, cz = 0; for (const [x, z] of NM) { cx += x; cz += z; } cx /= NM.length; cz /= NM.length; const L = [];
      for (let i = 0; i < 4; i++) { const x = cx - 90 + i * 60, z = cz; L.push([vay(48, 9, 150).translate(x, hG(x, z) + 4.5, z), 0x8d7e6a]); for (let j = 0; j < 8; j++) L.push([vay(48, 3, 4).translate(x, hG(x, z) + 10.2, z - 70 + j * 19).rotateX(0), 0x5a524a]); }
      L.push([cyl(1.6, 2.4, 42, 12).translate(cx + 150, hG(cx + 150, cz) + 21, cz + 40), 0x7b5a46]);
      scene.add(new THREE.Mesh(gop(L), vcMat)); HNX.khoiNM = V3(cx + 150, hG(cx + 150, cz) + 43, cz + 40); }
    /* Bệnh viện Bạch Mai: khối nhà 3 tầng (giản lược); từ Cảnh 7 (sau đêm 21 rạng 22/12) đổ nát một phần */
    const BM = INST.vung && INST.vung.bachmai;
    if (BM) { let cx = 0, cz = 0; for (const [x, z] of BM) { cx += x; cz += z; } cx /= BM.length; cz /= BM.length; const L1 = [], L2 = [];
      for (let i = 0; i < 6; i++) { const x = cx - 110 + (i % 3) * 110, z = cz - 60 + Math.floor(i / 3) * 120, y = hG(x, z);
        L1.push([vay(70, 11, 16).translate(x, y + 5.5, z), 0xd9cfae], [vay(72, 1.2, 18).translate(x, y + 11.6, z), 0x8f4c33]);
        if (i % 2) { L2.push([vay(70, 4, 16).translate(x, y + 2, z), 0x8a8072]); for (let j = 0; j < 14; j++) L2.push([vay(4 + rr() * 6, 1 + rr() * 2, 3 + rr() * 5).translate(x - 30 + rr() * 60, y + 4.5, z - 8 + rr() * 16).rotateY(0), 0x7a6f62]); }
        else L2.push([vay(70, 11, 16).translate(x, y + 5.5, z), 0xc9bea0], [vay(72, 1.2, 18).translate(x, y + 11.6, z), 0x5f4a3a]); }
      HNX.bm = [new THREE.Mesh(gop(L1), vcMat), new THREE.Mesh(gop(L2), vcMat)]; for (const m of HNX.bm) scene.add(m); HNX.bmTam = G3(cx, cz); }
    /* Khâm Thiên sau trận bom (gạch đá, khung nhà đổ) — hiện từ lúc vệt bom đi qua (Cảnh 7) */
    const KT = duongD('khamthien');
    if (KT) { const L = []; for (let i = 1; i < KT.length; i++) { const a = KT[i - 1], b = KT[i], d = a.distanceTo(b), f = b.clone().sub(a).normalize();
        for (let s = 0; s < d; s += 11) for (const sg of [-1, 1]) { const off = (6.5 + rr() * 4) * sg, x = a.x + f.x * s + f.z * off, z = a.z + f.z * s - f.x * off, y = hG(x, z);
          L.push([vay(3 + rr() * 5, 0.6 + rr() * 1.6, 2 + rr() * 4).rotateY(rr() * 3).translate(x, y + 0.5, z), [0x8b7d6b, 0x6e6458, 0x9a8a72, 0x5b4b3c][Math.floor(rr() * 4)]]);
          if (rr() < 0.3) L.push([vay(0.4, 2 + rr() * 4, 3 + rr() * 3).rotateY(rr() * 3).rotateZ(0.3 * (rr() - 0.5)).translate(x, y + 2, z), 0xb7a888]); } }
      HNX.gachKT = new THREE.Mesh(gop(L), vcMat); HNX.gachKT.visible = false; scene.add(HNX.gachKT); HNX.KT = KT;
      /* vật dụng gia đình (cận): xe đạp đổ, ghế, nồi — MINH HOẠ */
      const c = KT[Math.floor(KT.length * 0.55)], f = KT[Math.floor(KT.length * 0.55) + 1].clone().sub(c).normalize(), x = c.x + f.z * 9, z = c.z - f.x * 9, y = hG(x, z), VD = [];
      VD.push([new THREE.TorusGeometry(0.34, 0.03, 6, 16).rotateX(Math.PI / 2).translate(0, 0.04, 0), 0x2a2a2a], [new THREE.TorusGeometry(0.34, 0.03, 6, 16).rotateX(Math.PI / 2).translate(1.05, 0.04, 0), 0x2a2a2a], [vay(1.1, 0.04, 0.05).translate(0.52, 0.06, 0), 0x3a4a3a]);
      VD.push([vay(0.45, 0.04, 0.45).translate(-0.9, 0.45, 0.8), 0x7a5a3a], [vay(0.04, 0.45, 0.04).translate(-1.1, 0.22, 0.6), 0x7a5a3a], [cyl(0.22, 0.18, 0.2, 12).translate(0.6, 0.1, 0.9), 0x5c5c58], [vay(0.6, 0.02, 0.4).rotateZ(0.4).translate(-0.3, 0.12, -0.6), 0xd8d0b0]);
      HNX.vd = new THREE.Mesh(gop(VD), vcMat); HNX.vd.position.set(x, y, z); HNX.vd.rotation.y = Math.atan2(f.x, f.z); HNX.vd.visible = false; scene.add(HNX.vd); HNX.vdP = V3(x, y, z); }
    /* Cột cờ Hà Nội (1812): ba tầng đế vuông, thân bát giác, vọng canh; cờ đỏ sao vàng (Cảnh 12) — kích thước theo mô tả phổ biến (cao ~33 m, cả cột cờ ~41 m), giản lược */
    if (MOC.cotco) { const c = PM('cotco'), L = [[vay(42, 3.1, 42).translate(0, 1.55, 0), 0x8a7a68], [vay(27, 3.7, 27).translate(0, 4.95, 0), 0x958571], [vay(12.8, 5.1, 12.8).translate(0, 9.35, 0), 0x9d8d78],
        [cyl(2.6, 3.0, 18.2, 8).translate(0, 21, 0), 0x9a8a76], [cyl(3.4, 3.4, 0.6, 8).translate(0, 30.4, 0), 0x7d6e5d], [cyl(2.4, 2.4, 2.6, 8).translate(0, 32, 0), 0x9a8a76], [cyl(0.12, 0.12, 9, 6).translate(0, 37.5, 0), 0xcfcfcf]];
      const g = new THREE.Mesh(gop(L), vcMat); g.position.copy(c); scene.add(g);
      const tx = new THREE.TextureLoader().load(PU('props/co-qgp.png')); tx.colorSpace = THREE.SRGBColorSpace;
      const fg = new THREE.PlaneGeometry(6, 4, 16, 8).translate(3, 0, 0), co = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }));
      co.position.set(c.x + 0.15, c.y + 40, c.z); scene.add(co); HNX.co = co; HNX.coP0 = fg.attributes.position.array.slice(); HNX.cotco = c; }
    /* Tháp Rùa trên gò giữa Hồ Hoàn Kiếm (anh Thắng 26/11, theo ảnh anh gửi): ba tầng thu nhỏ dần; tầng dưới mỗi mặt dài ba cửa vòm nhọn (giữa to), mặt hẹp một cửa;
       tầng hai ba cửa vòm nhọn, gờ mái; lan can trên sân thượng tầng một; tầng trên cửa sổ tròn; hai lớp mái ngói, chóp hồ lô. Tường vữa xám, rêu phong. Kích thước ước lượng, MINH HOẠ. */
    { const [la, lo] = [21.02796, 105.85224], c = LL(la, lo, 0), y0 = tideNow + 0.9, L = [], VUA = 0x9e9a8c, VUA2 = 0x8f8b7e, TOI = 0x24231f, VIEN = 0xb9b4a5, NGOI = 0x5e5a52;
      const vom = (a, hs) => { const sh = new THREE.Shape(); sh.moveTo(-a, 0); sh.lineTo(-a, hs); sh.quadraticCurveTo(-a, hs + a * 0.95, 0, hs + a * 1.45); sh.quadraticCurveTo(a, hs + a * 0.95, a, hs); sh.lineTo(a, 0); sh.lineTo(-a, 0); return new THREE.ShapeGeometry(sh, 6); };
      /* cửa vòm trên mặt: tâm (u) theo bề ngang mặt, đặt sát mặt tường; mặt: 0 trước (+z), 1 sau, 2 phải (+x), 3 trái */
      const cua = (mat_, u, y, a, hs, w, d, mau = TOI, ra = 0.03) => { const g = vom(a, hs), [ox, oz, ry] = [[u, d / 2 + ra, 0], [-u, -d / 2 - ra, Math.PI], [w / 2 + ra, -u, Math.PI / 2], [-w / 2 - ra, u, -Math.PI / 2]][mat_];
        L.push([g.rotateY(ry).translate(ox, y, oz), mau]); };
      const tang = (w, d, h, y, mau) => { L.push([vay(w, h, d).translate(0, y + h / 2, 0), mau]); };
      // gò đất, bờ kè đá
      L.push([new THREE.CylinderGeometry(1, 1.12, 1, 28).scale(15, 2.6, 10).translate(0, y0 - 1.3, 0), 0x5b7a3c], [new THREE.CylinderGeometry(1, 1, 1, 28).scale(15.3, 0.5, 10.3).translate(0, tideNow + 0.05, 0), 0x77705e]);
      for (const [x, z, h] of [[-10, 3, 6], [9.5, -4, 7], [11, 3.5, 5], [-8, -5, 5.5]]) L.push([cyl(0.18, 0.25, h * 0.55, 6).translate(x, y0 + h * 0.27, z), 0x4a3a2a], [new THREE.SphereGeometry(h * 0.32, 8, 6).scale(1, 0.85, 1).translate(x, y0 + h * 0.7, z), 0x3f5e2c]);
      // bậc đá trước cửa giữa
      for (let k = 0; k < 3; k++) L.push([vay(2.6 - k * 0.3, 0.22, 0.5).translate(0, y0 + 0.11 + k * 0.22, 3.0 + 0.9 - k * 0.45), VIEN]);
      // tầng một 6,4 × 4,6 × 4,2
      const w1 = 6.4, d1 = 4.6, h1 = 4.2; tang(w1, d1, h1, y0 + 0.6, VUA); L.push([vay(w1 + 0.3, 0.6, d1 + 0.3).translate(0, y0 + 0.3, 0), VUA2]);
      for (const m of [0, 1]) { cua(m, 0, y0 + 0.6, 0.85, 1.8, w1, d1, VIEN, 0.02); cua(m, 0, y0 + 0.6, 0.72, 1.75, w1, d1, TOI, 0.05); for (const u of [-2.15, 2.15]) { cua(m, u, y0 + 1.0, 0.48, 1.35, w1, d1, VIEN, 0.02); cua(m, u, y0 + 1.0, 0.38, 1.3, w1, d1, TOI, 0.05); } }
      for (const m of [2, 3]) { cua(m, 0, y0 + 0.6, 0.7, 1.75, w1, d1, VIEN, 0.02); cua(m, 0, y0 + 0.6, 0.58, 1.7, w1, d1, TOI, 0.05); }
      for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) L.push([vay(0.45, h1, 0.45).translate(x * (w1 / 2 + 0.05), y0 + 0.6 + h1 / 2, z * (d1 / 2 + 0.05)), VUA2]);   /* cột góc */
      let y = y0 + 0.6 + h1; L.push([vay(w1 + 0.6, 0.35, d1 + 0.6).translate(0, y + 0.17, 0), VIEN]); y += 0.35;
      // lan can sân thượng: trụ góc, tay vịn, con tiện
      for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) L.push([vay(0.42, 1.15, 0.42).translate(x * (w1 / 2 + 0.05), y + 0.57, z * (d1 / 2 + 0.05)), VUA2], [new THREE.SphereGeometry(0.2, 8, 6).translate(x * (w1 / 2 + 0.05), y + 1.3, z * (d1 / 2 + 0.05)), VUA2]);
      for (const sg of [-1, 1]) { L.push([vay(w1, 0.14, 0.2).translate(0, y + 0.95, sg * (d1 / 2 + 0.05)), VIEN], [vay(0.2, 0.14, d1).translate(sg * (w1 / 2 + 0.05), y + 0.95, 0), VIEN]);
        for (let u = -w1 / 2 + 0.45; u < w1 / 2 - 0.3; u += 0.38) L.push([cyl(0.06, 0.08, 0.8, 5).translate(u, y + 0.45, sg * (d1 / 2 + 0.05)), VUA]);
        for (let u = -d1 / 2 + 0.45; u < d1 / 2 - 0.3; u += 0.38) L.push([cyl(0.06, 0.08, 0.8, 5).translate(sg * (w1 / 2 + 0.05), y + 0.45, u), VUA]); }
      // tầng hai 4,4 × 3,2 × 3,0
      const w2 = 4.4, d2 = 3.2, h2 = 3.0; tang(w2, d2, h2, y, VUA);
      for (const m of [0, 1]) for (const [u, a] of [[-1.35, 0.32], [0, 0.42], [1.35, 0.32]]) { cua(m, u, y + 0.7, a + 0.1, 1.0, w2, d2, VIEN, 0.02); cua(m, u, y + 0.7, a, 0.95, w2, d2, TOI, 0.05); }
      for (const m of [2, 3]) { cua(m, 0, y + 0.7, 0.42, 0.95, w2, d2, VIEN, 0.02); cua(m, 0, y + 0.7, 0.32, 0.9, w2, d2, TOI, 0.05); }
      y += h2; L.push([vay(w2 + 0.7, 0.3, d2 + 0.7).translate(0, y + 0.15, 0), VIEN]); y += 0.3;
      // tầng ba 2,6 × 2,6 × 2,1, cửa sổ tròn
      const w3 = 2.6, h3 = 2.1; tang(w3, w3, h3, y, VUA);
      for (const [ox, oz, ry] of [[0, w3 / 2 + 0.03, 0], [0, -w3 / 2 - 0.03, Math.PI], [w3 / 2 + 0.03, 0, Math.PI / 2], [-w3 / 2 - 0.03, 0, -Math.PI / 2]]) {
        L.push([new THREE.RingGeometry(0.42, 0.56, 20).rotateY(ry).translate(ox, y + h3 * 0.55, oz), VIEN], [new THREE.CircleGeometry(0.42, 20).rotateY(ry).translate(ox * 1.01, y + h3 * 0.55, oz * 1.01), TOI]); }
      y += h3;
      // hai lớp mái ngói (bốn mái, đầu đao cong lên), cổ mái, chóp hồ lô
      const mai4 = (r, h, yy) => { L.push([new THREE.ConeGeometry(r, h, 4, 1).rotateY(Math.PI / 4).translate(0, yy + h / 2, 0), NGOI]);
        for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) L.push([new THREE.ConeGeometry(0.12, 0.7, 5).rotateZ(-x * 0.9).rotateX(z * 0.9).translate(x * r * 0.68, yy + 0.25, z * r * 0.68), NGOI]); };
      mai4(2.75, 1.05, y); L.push([vay(1.25, 0.75, 1.25).translate(0, y + 1.05 + 0.37, 0), VUA]); mai4(1.65, 0.95, y + 1.8);
      for (const [x, z] of [[0, 1], [0, -1]]) L.push([new THREE.TorusGeometry(0.28, 0.07, 5, 10, Math.PI).rotateY(Math.PI / 2).translate(x, y + 2.75, z * 0.45), NGOI]);   /* rồng chầu trên bờ nóc (giản lược) */
      L.push([new THREE.SphereGeometry(0.26, 10, 8).translate(0, y + 2.95, 0), VIEN], [new THREE.SphereGeometry(0.17, 10, 8).translate(0, y + 3.32, 0), VIEN], [cyl(0.02, 0.05, 0.5, 6).translate(0, y + 3.7, 0), VIEN]);
      const m = new THREE.Mesh(gop(L), vcMat); m.position.set(c.x, 0, c.z); m.rotation.y = -0.35; scene.add(m); HNX.thapRua = V3(c.x, y0 + 7, c.z); }
    /* xác B-52 ở hồ Hữu Tiệp (bắn rơi đêm 27/12, S15) — hiện từ Cảnh 10 */
    if (INST.vung && INST.vung.huutiep) { let cx = 0, cz = 0; const P = INST.vung.huutiep; for (const [x, z] of P) { cx += x; cz += z; } HNX.ht = V3(cx / P.length, 0.3, cz / P.length); }
    /* hầm trú ẩn cá nhân trên vỉa hè (nắp bê tông tròn) dọc phố Đinh Tiên Hoàng, Tràng Tiền */
    { const L = []; for (const k of ['dinhtienhoang', 'trangtien', 'hangbong']) { const P = duongD(k); if (!P) continue; for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], d = a.distanceTo(b), f = b.clone().sub(a).normalize();
        for (let s = 4; s < d; s += 22) for (const sg of [-1, 1]) { const x = a.x + f.x * s + f.z * 7.5 * sg, z = a.z + f.z * s - f.x * 7.5 * sg; L.push([cyl(0.55, 0.6, 0.35, 10).translate(x, hG(x, z) + 0.17, z), 0x8f8b80]); } } }
      if (L.length) scene.add(new THREE.Mesh(gop(L), vcMat)); }
  }

  // ---------------------------------------------------------------- phố ngày thường (Cảnh 1): tàu điện, xe đạp (MINH HOẠ)
  const PHO = { tau: [], dap: [], duong: [], tauD: null };
  /* mặt phố: độ cao lấy trung bình trượt ~40 m dọc tim đường, không thấp hơn mặt nước + 0,4 m (anh Thắng 26/11: người, xe đạp đang đi dưới nước ven hồ) */
  const matPho = (D) => { const n = Math.max(2, Math.ceil(D.L / 5)), h = []; for (let i = 0; i <= n; i++) { const { x, z } = diemTren(D, D.L * i / n); h.push(hG(x, z)); }
    const s = h.map((_, i) => { let a = 0, c = 0; for (let k = -4; k <= 4; k++) { const j = i + k; if (j >= 0 && j <= n) { a += h[j]; c++; } } return Math.max(a / c, tideNow + 0.4); });
    D.hp = (d) => { const u = clamp(d / D.L, 0, 1) * n, i = Math.floor(u), k = u - i; return s[i] + (s[Math.min(n, i + 1)] - s[i]) * k; }; return D; };
  /* điểm bên phải chiều đi (xe Việt Nam đi bên phải): lech > 0 lệch sang phải */
  const benPhai = (D, d, lech, chieu = 1) => { const q = diemTren(D, d), yaw = q.yaw + (chieu > 0 ? 0 : Math.PI), x = q.x - Math.cos(yaw) * lech, z = q.z + Math.sin(yaw) * lech; return { x, z, yaw, y: Math.max(D.hp(d), hG(x, z)) }; };
  if (HN) { for (const k of ['hangbong', 'trangtien', 'nguyenthaihoc']) { const P = duongD(k); if (P && P.length > 1) PHO.duong.push(matPho(duong(P.map((p) => [p.x, -p.z])))); }
    PHO.tauD = PHO.duong[0] || null; KS.PHO = PHO; }
  /* bánh quay theo quãng đường: góc = quãng đường / bán kính (đi tới thì quay về phía trước, quanh trục X cục bộ) */
  const phoCap = (t) => { const on = HN && t < H('C02').t0 + 1;
    for (const T_ of PHO.tau) { T_.m.visible = on; if (!on) continue; const D = T_.D, L = D.L, d = ((T_.d0 + t * T_.v) % (2 * L) + 2 * L) % (2 * L), di = d < L, dd = di ? d : 2 * L - d;
      const q = benPhai(D, dd, 0, di ? 1 : -1); T_.m.position.set(q.x, q.y, q.z); T_.m.rotation.y = q.yaw; }   /* lượt về quay đầu tàu 180° — luôn đi tiến */
    PHO.dap.forEach((B, i) => { B.o.visible = on && !!PHO.duong.length; if (!B.o.visible) return; const D = PHO.duong[i % PHO.duong.length], L = D.L, v = 3.0 + ((i * 7) % 5) * 0.35, chieu = i % 2 ? 1 : -1;
      const s0 = (i * 97.3) % L, quang = t * v, d = (((s0 + chieu * quang) % L) + L) % L, q = benPhai(D, d, 3.4 + ((i * 13) % 3) * 0.6, chieu);
      B.o.position.set(q.x, q.y, q.z); B.o.rotation.y = q.yaw; for (const [b, r] of B.banh) b.rotation.x = quang / r; }); };

  // ---------------------------------------------------------------- tốp B-52: 3 chiếc nối đuôi (cell), bay thẳng; tốp "trúng" → chiếc bị bắn rơi theo đường cong xuống điểm rơi
  // tốp: { t0, t1, a: V3 đầu, b: V3 cuối, n, cach, bom: [[t, x, z, dai, huong]], chet: [{ i, t, roi: V3, tRoi }] }
  const TOP = [], ROI = [], BOM = [], TL = [], NO = [], CHAY = [];
  const topTao = (o) => { o.n = o.n || 3; o.cach = o.cach || 260 * SB; o.f = o.b.clone().sub(o.a).normalize(); o.chet = o.chet || []; TOP.push(o); return o; };
  const viTri = (o, i, t) => { const L = o.a.distanceTo(o.b), u = (t - o.t0) / (o.t1 - o.t0), d = u * L - i * o.cach; const p = o.a.clone().addScaledVector(o.f, d); p.x += (i % 2 ? 1 : -1) * (i ? 90 : 0) * SB; p.y = o.a.y + (i * 40 - 40) * SB * 0.3; return p; };
  /* tên lửa: từ bệ (td, chỉ số bệ) bay tới vị trí chiếc (o, i) lúc tHit; trung = true: nổ trúng */
  const phong = (td, k, t0, o, i, tHit, trung) => { const T_ = TD[td]; if (!T_) return null; const b = T_.be[k % 6]; const e = { td, k, t0, o, i, tHit, trung, m: tenLua(), b }; TL.push(e); return e; };
  const NOAT = (t, p, s, chay = 0) => NO.push({ t, p, s, chay });
  const BV = [];
  const bomVet = (t, x, z, dai, yaw, n = 18, chay = 0.3) => { BV.push({ t, p: G3(x, z) }); for (let j = 0; j < n; j++) { const d = (j / (n - 1) - 0.5) * dai, X = x + Math.sin(yaw) * d + (rr() - 0.5) * 60, Z = z + Math.cos(yaw) * d + (rr() - 0.5) * 60;
    BOM.push({ t: t + j * 0.09 + rr() * 0.05, p: G3(X, Z), s: (HN ? 22 : 160) * (0.8 + rr() * 0.5), chay: rr() < chay }); } };
  const dpos = (k, dx = 0, dz = 0) => { const p = PM(k); p.x += dx; p.z += dz; p.y = hG(p.x, p.z); return p; };

  // ---------------------------------------------------------------- KỊCH BẢN HOẠT CẢNH (mốc theo câu đọc)
  if (HN) {
    const A = (k, dx, dz, h = ALT) => { const p = PM(k); return V3(p.x + dx, h, p.z + dz); };
    // Cảnh 2–3: một tốp bay rất cao trên Hà Nội (bóng dáng, không ném bom) — chỉ để hiện thế trận đêm
    // Cảnh 4 (đêm 18/12): các tốp từ hướng Tam Đảo (tây bắc) vào đánh Nội Bài, Đông Anh, Yên Viên, Gia Lâm (S2, S4); Tiểu đoàn 59 phóng 2 quả đạn, chiếc thứ hai của tốp 1 rơi xuống cánh đồng Phù Lỗ (S1, S3)
    { const t0 = M('C04', 4) - 2, ph = PM('phulo');
      const o1 = topTao({ t0, t1: t0 + 70, a: A('phulo', -14000, -9000), b: A('phulo', 9000, 9000) });
      const tHit = M('C04', 13) + 6.5; o1.chet.push({ i: 1, t: tHit, roi: dpos('phulo'), tRoi: tHit + 13 });
      phong('td59', 0, tHit - 7.5, o1, 1, tHit, true); phong('td59', 3, tHit - 6.3, o1, 1, tHit + 0.4, false);
      topTao({ t0: t0 + 3, t1: t0 + 75, a: A('noibai', -12000, -10000), b: A('noibai', 10000, 8000) });
      topTao({ t0: t0 + 6, t1: t0 + 78, a: A('yenvien', -15000, -12000), b: A('yenvien', 8000, 7000) });
      const tb = M('C04', 10);
      bomVet(tb, PM('noibai').x, PM('noibai').z, 1600, 2.2); bomVet(tb + 1.2, PM('dongan').x, PM('dongan').z, 1500, 2.3); bomVet(tb + 2.0, PM('yenvien').x, PM('yenvien').z, 1500, 2.2, 18, 0.5); bomVet(tb + 2.6, PM('gialam').x + 300, PM('gialam').z - 600, 1300, 2.1);
      for (const [td, k, dt] of [['td57', 0, 0], ['td57', 2, 1.4], ['td77', 1, 2.2], ['td79', 4, 3.1], ['td72', 2, 4.0], ['td77', 4, 5.2]]) { const o = TOP[(k + dt * 3 | 0) % TOP.length]; phong(td, k, M('C04', 12) - 0.5 + dt, o, k % 3, M('C04', 12) + dt + 6.5, false); }
      KS.c04 = { o1, tHit, ph }; }
    // Cảnh 5 (rạng sáng 21/12, 5:02–5:11): Tiểu đoàn 57, 77, 79 — bốn chiếc trúng đạn, ba chiếc rơi tại chỗ (S6, S7) — bốn điểm rơi khác nhau, MINH HOẠ
    { const t0 = M('C05', 4) - 4;
      const L = [['yenvien', -16000, -11000, 'td57', [700, -400]], ['noibai', -14000, -6000, 'td77', [-2500, 1200]], ['gialam', -13000, -14000, 'td79', [4200, 2600]], ['thanhtri', -12000, -16000, 'td79', null]];
      L.forEach(([k, dx, dz, td, roi], j) => { const o = topTao({ t0: t0 + j * 3, t1: t0 + 80 + j * 3, a: A(k, dx, dz), b: A(k, -dx * 0.7, -dz * 0.7) });
        const tHit = M('C05', 8) + 2 + j * 3.4, ch = { i: j % 3, t: tHit, roi: roi ? dpos(k, roi[0], roi[1]) : null, tRoi: tHit + 12 };
        if (!roi) { const p = viTri(o, j % 3, tHit); ch.roi = G3(clamp(p.x + o.f.x * 26000, -R * 1.4, R * 1.4), clamp(p.z + o.f.z * 26000, -R * 1.4, R * 1.4)); ch.ngoai = true; }
        o.chet.push(ch); phong(td, j, tHit - 7, o, j % 3, tHit, true); phong(td, j + 2, tHit - 5.5, o, (j + 1) % 3, tHit + 1, false); });
      bomVet(M('C05', 6), PM('yenvien').x, PM('yenvien').z, 1500, 2.3, 18, 0.5); bomVet(M('C05', 6) + 2, PM('gialam').x, PM('gialam').z, 1400, 2.0); }
    // Cảnh 6: một tốp trong màn nhiễu (nhiễu, sợi nhiễu), phóng đạn nhưng không trúng
    { const t0 = H('C06').t0 + 1; topTao({ t0, t1: t0 + 75, a: A('dongan', -15000, -12000), b: A('dongan', 12000, 10000), nhieu: true }); }
    // Cảnh 7 (đêm 26/12, ~22h47 theo VOV, S11): vệt bom dọc phố Khâm Thiên
    if (HNX.KT) { const KT = HNX.KT, a = KT[0], b = KT[KT.length - 1], c = a.clone().lerp(b, 0.5), yaw = huong(a, b), tb = M('C07', 5) + 2.5;
      const o = topTao({ t0: tb - 22, t1: tb + 30, a: V3(c.x - Math.sin(yaw) * 14000, ALT, c.z - Math.cos(yaw) * 14000), b: V3(c.x + Math.sin(yaw) * 9000, ALT, c.z + Math.cos(yaw) * 9000) });
      bomVet(tb, c.x, c.z, a.distanceTo(b) * 1.1, yaw, 28, 0.7); HNX.tBomKT = tb; for (let i = 0; i < 10; i++) { const p = a.clone().lerp(b, i / 9); CHAY.push({ t: tb + i * 0.2, p: G3(p.x + (rr() - 0.5) * 30, p.z + (rr() - 0.5) * 30), s: 16, het: H('C07').t1 }); } }
    // Cảnh 10 (đêm 29/12): Tiểu đoàn 79 bắn rơi một B-52 (S17) — điểm rơi ngoài khung, MINH HOẠ
    { const t0 = M('C10', 8) - 6, o = topTao({ t0, t1: t0 + 80, a: A('thanhtri', -16000, 9000), b: A('thanhtri', 14000, -8000) }), tHit = M('C10', 9) + 4;
      const p = viTri(o, 0, tHit); o.chet.push({ i: 0, t: tHit, roi: G3(clamp(p.x + o.f.x * 30000, -R * 1.5, R * 1.5), clamp(p.z + o.f.z * 30000, -R * 1.5, R * 1.5)), tRoi: tHit + 14, ngoai: true });
      phong('td79', 1, tHit - 7, o, 0, tHit, true); phong('td79', 4, tHit - 5.8, o, 1, tHit + 0.7, false); }
    // Cảnh 2–3 nền: tốp bay ngang trời đêm
    topTao({ t0: H('C03').t0 + 20, t1: H('C03').t0 + 120, a: A('hoankiem', -18000, 6000, ALT * 1.4), b: A('hoankiem', 18000, -4000, ALT * 1.4) });
    /* MiG-21 bay đội hình chữ V (anh Thắng 26/11: "xếp hàng theo hình chữ V, không bay nối đuôi; lửa đỏ ở đuôi, vệt khí phụt ra") — đường bay, thời điểm MINH HOẠ */
    KS.bayV = [];
    { const rw = duongD('rw_noibai'); if (rw) { const a = rw[0], b = rw[rw.length - 1], f = b.clone().sub(a).normalize(), r = V3(f.z, 0, -f.x), s5 = shotT('C03-05'), m = s5.t0 + (s5.t1 - s5.t0) * 0.55;
        const c = a.clone().lerp(b, 0.12).addScaledVector(r, 48).addScaledVector(f, 60); c.y = hG(c.x, c.z) + 40;   /* bay thấp ngang hàng MiG đang đỗ (MIG[0] ở r·70) */
        KS.bayV.push({ t0: m - 7, t1: m + 7, a: c.clone().addScaledVector(f, -900).add(V3(0, -6, 0)), b: c.clone().addScaledVector(f, 900).add(V3(0, 30, 0)) }); } }
    { const cc = MOC.cotco ? PM('cotco') : PM('hoankiem'), s6 = shotT('C12-06'), m = s6.t0 + (s6.t1 - s6.t0) * 0.55, f = V3(0.65, 0, -0.76);   /* bay qua Cột cờ khi máy quay ngước nhìn lá cờ */
      KS.bayV.push({ t0: m - 3.6, t1: m + 3.6, a: cc.clone().addScaledVector(f, -820).setY(cc.y + 72), b: cc.clone().addScaledVector(f, 820).setY(cc.y + 88) }); }
    // pháo cao xạ, súng 12,7 mm: vị trí MINH HOẠ (bên cầu Long Biên, bờ Hồ Tây, mái nhà nội thành)
    KS.caoxa = [['longbien', 260, 160], ['longbien', -300, -200], ['hoankiem', -700, -900], ['hotay', 600, 900], ['gialam', -600, 500], ['bachmai', 500, -300]];
    KS.dshk = [['hoankiem', 160, 60], ['hoankiem', -220, 180], ['khamthien', 80, -40], ['dinhtienhoang', 0, 0]];
  } else {
    const A = (k, dx, dz, h = ALT) => { const p = PM(k); return V3(p.x + dx, h, p.z + dz); };
    // Cảnh 2: các tốp vào miền Bắc từ nhiều hướng (hướng MINH HOẠ theo sơ đồ Air Force Magazine 11/1997, M5: tốp từ U-Tapao qua Lào; từ Guam qua vịnh Bắc Bộ)
    { const t0 = H('C02').t0; const HG = [[-150000, 20000], [-130000, -60000], [140000, -40000], [120000, 50000], [-40000, -150000]];
      HG.forEach(([dx, dz], j) => topTao({ t0: t0 + j * 4, t1: t0 + 120 + j * 4, a: A('hanoi', dx, dz), b: A('hanoi', -dx * 0.15, -dz * 0.15), n: 3, cach: 2200 }));
      KS.c02 = TOP.slice(); }
    // Cảnh 8 (đêm 26/12): các hướng tập kích dồn dập vào Hà Nội, Hải Phòng — 8 B-52 bị bắn rơi (tổng kết phía Việt Nam, S13; trong đó 4 chiếc rơi tại chỗ theo qdnd) — điểm rơi MINH HOẠ, rải ở nhiều nơi
    { const t0 = H('C08').t0 + 2, HG = [['hanoi', -150000, -30000], ['hanoi', -60000, -140000], ['hanoi', 20000, 150000], ['haiphong', 120000, -20000], ['haiphong', 60000, 130000], ['hanoi', 150000, 30000], ['haiphong', -30000, -150000], ['hanoi', -140000, 70000]];
      HG.forEach(([k, dx, dz], j) => { const o = topTao({ t0: t0 + j * 2.5, t1: t0 + 75 + j * 2.5, a: A(k, dx, dz), b: A(k, -dx * 0.25, -dz * 0.25), cach: 2200 });
        const tHit = M('C08', 7) + 1 + j * 1.6, p = viTri(o, j % 3, tHit); o.chet.push({ i: j % 3, t: tHit, roi: G3(p.x + o.f.x * 9000, p.z + o.f.z * 9000), tRoi: tHit + 11 });
        phong(['td59', 'td77', 'td79', 'tdhp'][j % 4], j, tHit - 7, o, j % 3, tHit, true); });
      for (const [k, dx, dz, yaw, tt] of [['hanoi', 2500, 3000, 2.2, 3], ['hanoi', -4000, -2000, 2.6, 5], ['haiphong', 1500, 1000, 1.9, 4], ['hanoi', 6000, -6000, 2.0, 8]]) bomVet(M('C08', 3) + tt, PM(k).x + dx, PM(k).z + dz, 9000, yaw, 16, 0.6);
      KS.c08 = TOP.slice(KS.c02 ? KS.c02.length : 0); }
    // Cảnh 9: tốp B-52 vùng Mộc Châu (27/12) và vùng Tây Bắc (28/12); MiG-21 Phạm Tuân từ Yên Bái, Vũ Xuân Thiều từ Cẩm Thủy (S14, S15, S16) — đường bay MINH HOẠ
    { const mc = PM('mocchau'), o27 = topTao({ t0: M('C09', 7) - 6, t1: M('C09', 7) + 60, a: V3(mc.x - 20000, ALT, mc.z - 60000), b: V3(mc.x + 30000, ALT, mc.z + 40000), cach: 2200 });
      const tb27 = M('C09', 10) + 0.5; o27.chet.push({ i: 1, t: tb27, roi: G3(mc.x + 6000, mc.z + 5000), tRoi: tb27 + 12 });
      const tb28 = M('C09', 14) + 2.5, tb = PM('taybac');
      const o28 = topTao({ t0: M('C09', 11) - 4, t1: M('C09', 11) + 70, a: V3(tb.x + 10000, ALT, tb.z - 60000), b: V3(tb.x - 5000, ALT, tb.z + 50000), cach: 2200 }); o28.chet.push({ i: 0, t: tb28, roi: G3(tb.x - 4000, tb.z + 8000), tRoi: tb28 + 12 });
      KS.c09 = { o27, o28, tb27, tb28 }; }
  }

  // ---------------------------------------------------------------- MiG-21 (Cảnh 3 trên sân Nội Bài; Cảnh 9 cất cánh Yên Bái, Cẩm Thủy) — anh Thắng làm mẫu 26/11; phù hiệu sao đỏ trên mẫu chưa đúng phù hiệu Không quân nhân dân Việt Nam (MINH HOẠ)
  const MIGBAY = [];
  if (!HN && KS.c09) { const { o27, o28, tb27, tb28 } = KS.c09, rw = duongD('mb_rw_yenbai'), yb = rw ? rw[0].clone().lerp(rw[rw.length - 1], 0.5) : PM('yenbai');
    const ct = PM('camthuy');
    const dau27 = rw ? rw[0] : yb, cuoi27 = rw ? rw[rw.length - 1] : yb.clone().add(V3(2000, 0, 0));
    MIGBAY.push({ ten: 'MiG-21 · Phạm Tuân (đêm 27/12)', t0: M('C09', 8), tHit: tb27, o: o27, i: 1, xp: dau27, rw: cuoi27, ve: true, chet: false });
    MIGBAY.push({ ten: 'MiG-21 · Vũ Xuân Thiều (đêm 28/12)', t0: M('C09', 13) - 1.5, tHit: tb28, o: o28, i: 0, xp: ct, rw: ct.clone().add(V3(0, 0, -2500)), ve: false, chet: true }); }
  const migViTri = (m, t) => { /* lăn trên đường băng 8 s, cất cánh, bay tới phía sau mục tiêu lúc tHit − 1,5 s; sau đó: trở về (Phạm Tuân) hoặc mờ dần (Vũ Xuân Thiều — không dựng va chạm) */
    const a = t - m.t0; if (a < 0) return { p: m.xp.clone().setY(hG(m.xp.x, m.xp.z) + 2 * SB / 14), f: m.rw.clone().sub(m.xp).setY(0).normalize(), dat: true };
    const lan = 8, f0 = m.rw.clone().sub(m.xp).setY(0).normalize();
    if (a < lan) { const p = m.xp.clone().addScaledVector(f0, a * a * 18); p.y = hG(p.x, p.z) + 2 + (a > lan - 2 ? (a - lan + 2) ** 2 * 60 : 0); return { p, f: f0, dat: a < lan - 2 }; }
    const pc = m.xp.clone().addScaledVector(f0, lan * lan * 18); pc.y = hG(pc.x, pc.z) + 240;
    const tg = viTri(m.o, m.i, m.tHit - 1.5).addScaledVector(m.o.f, -3500); tg.y -= 200;
    if (t < m.tHit - 1.5) { const u = clamp((a - lan) / (m.tHit - 1.5 - m.t0 - lan), 0, 1), e = u * u * (3 - 2 * u), c = pc.clone().lerp(tg, 0.5); c.y = ALT * 0.9;
      const q = (k) => { const A = pc.clone().lerp(c, k), B = c.clone().lerp(tg, k); return A.lerp(B, k); }; const p = q(e), p2 = q(Math.min(1, e + 0.01)); return { p, f: p2.clone().sub(p).normalize() }; }
    const b = t - (m.tHit - 1.5), p = tg.clone().addScaledVector(m.o.f, b * 900); if (m.ve) { p.y -= b * 120; p.x += b * b * 30; } return { p, f: m.o.f.clone(), mo: m.chet ? clamp(1 - (t - m.tHit - 1.2) / 2.5, 0, 1) : 1 }; };

  // ---------------------------------------------------------------- tải mẫu GLB
  (async () => {
    try { const g = await glbLoad('props/may-bay/b-52d.glb'); GLB.b52 = g.scene; const n = Math.min(24, TOP.reduce((s, o) => s + o.n, 0) + 2);
      for (let i = 0; i < n; i++) { const o = g.scene.clone(true); o.scale.setScalar(SB); o.visible = false; scene.add(o); B52.push(o); }
      if (HN && HNX.ht) { const o = g.scene.clone(true); o.traverse((c) => { if (c.material) { c.material = c.material.clone(); c.material.color && c.material.color.multiplyScalar(0.32); } });
        o.position.set(HNX.ht.x + 4, -0.6, HNX.ht.z + 3); o.rotation.set(0.22, 0.8, 0.45); o.scale.setScalar(0.5); o.visible = false; scene.add(o); HNX.xacHT = o; napSan(o); }
      if (B52[0]) napSan(B52[0]);
    } catch (e) { console.warn('B-52', e); }
    try { const g = await glbLoad('props/may-bay/mig-21.glb'); for (let i = 0; i < (HN ? 9 : 2); i++) { const o = g.scene.clone(true); o.scale.setScalar(HN ? 1 : SB * 0.9); o.visible = false; scene.add(o); MIG.push(o); }
      if (HN) { const rw = duongD('rw_noibai'); if (rw) { const a = rw[0], b = rw[rw.length - 1], f = b.clone().sub(a).normalize(), r = V3(f.z, 0, -f.x);
          MIG.slice(0, 6).forEach((o, i) => { const p = a.clone().lerp(b, 0.12).addScaledVector(r, 70).addScaledVector(f, i * 19); o.position.set(p.x, hG(p.x, p.z), p.z); o.rotation.y = Math.atan2(-r.x, -r.z); o.visible = true; });   /* đỗ một hàng ngang, cách nhau 19 m, mũi quay ra đường lăn */
          KS.migNB = MIG[0] && MIG[0].position.clone(); } KS.migV = MIG.slice(6); }
      if (MIG[0]) napSan(MIG[0]); } catch (e) { console.warn('MiG-21', e); }
    try { const g = await glbLoad('props/phao/s-75-be-phong.glb'), tlN = g.scene.getObjectByName('ten_lua');
      for (const T_ of Object.values(TD)) for (const b of T_.be) { for (const c of b.children) c.visible = false; const o = g.scene.clone(true); b.add(o); b.userData.tl = o.getObjectByName('ten_lua') || b.userData.tl; }
      if (tlN) { const m = tlN.clone(); m.geometry = tlN.geometry.clone(); m.geometry.computeBoundingBox(); const c = m.geometry.boundingBox.getCenter(V3(0, 0, 0)); m.geometry.translate(-c.x, -c.y, -c.z); m.geometry.rotateX(0.14); m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1);
        GLB.tlMau = m; }
      const b0 = Object.values(TD)[0]; if (b0) napSan(b0.be[0]); } catch (e) { console.warn('S-75', e); }
    try { const g = await glbLoad('props/xe/xe-ra-da.glb'); const dat = (old) => { old.visible = false; const o = g.scene.clone(true); o.position.copy(old.position); o.rotation.y = old.rotation.y + 0.6; o.scale.copy(old.scale); scene.add(o);
        o.userData.at = o.getObjectByName('ang_ten'); o.userData.song = [0, 1, 2, 3, 4].map(() => { const m = new THREE.Mesh(SONG_GEO, new THREE.MeshBasicMaterial({ color: 0x8dffb4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.visible = false; scene.add(m); return m; });
        RADA.push(o); return o; };
      for (const T_ of Object.values(TD)) T_.rdG = dat(T_.rd); for (let i = 0; i < P12.length; i++) P12[i] = dat(P12[i]); if (P12[0]) napSan(P12[0]); } catch (e) { console.warn('xe ra-đa', e); }
    for (let i = 0; i < (HN ? 8 : 6); i++) { const m = new THREE.Mesh(f4Geo, f4Mat); m.scale.setScalar(SB); m.visible = false; scene.add(m); F4.push(m); }
    if (HN) { try { const g = await glbLoad('props/phao/cao-xa-37-2-nong.glb'); KS.cx = []; for (const [k, dx, dz] of KS.caoxa) { if (!MOC[k]) continue; const p = lenDat(dpos(k, dx, dz)); for (let i = 0; i < 4; i++) { const o = g.scene.clone(true); o.position.set(p.x + (i % 2) * 14, hG(p.x, p.z), p.z + Math.floor(i / 2) * 14); o.rotation.y = 2.3; scene.add(o); KS.cx.push(o); } } napSan(KS.cx[0]); } catch (e) { console.warn('cao xạ', e); }
      try { const g = await glbLoad('props/phao/dshk-12-7mm.glb'); KS.ds = []; for (const [k, dx, dz] of KS.dshk) { if (!MOC[k]) continue; const p = lenDat(dpos(k, dx, dz), 600); const o = g.scene.clone(true); o.position.set(p.x, hG(p.x, p.z) + 9.6, p.z); o.rotation.y = 0.6; scene.add(o); KS.ds.push(o);
          const san = new THREE.Mesh(vay(6, 0.3, 6), mat(0x7d6c5a)); san.position.set(p.x, hG(p.x, p.z) + 9.45, p.z); scene.add(san); const nha = new THREE.Mesh(vay(8, 9.3, 12).translate(0, 4.65, 0), mat(0xcdb27a)); nha.position.set(p.x, hG(p.x, p.z), p.z + 2); scene.add(nha); } napSan(KS.ds[0]); } catch (e) { console.warn('12,7 mm', e); }
      /* xe vận chuyển – nạp đạn TZM (mẫu anh Thắng, mũi xe +z — đã soi ảnh cạnh, KHÔNG đi lùi): chạy vòng quanh trận địa, ngoài vòng bệ phóng;
         nắp bánh (vẽ bằng mã) gắn đúng tâm 3 trục bánh, quay theo quãng đường (góc = quãng / bán kính 0,62 m) */
      try { const g = await glbLoad('props/xe/xe-tzm.glb'); KS.xt = [];
        const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x2 = cv.getContext('2d'), O_ = (r, c) => { x2.fillStyle = c; x2.beginPath(); x2.arc(64, 64, r, 0, 7); x2.fill(); };
        O_(63, '#1b1b19'); O_(42, '#5f6457'); O_(15, '#2f312c'); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; x2.fillStyle = '#262823'; x2.beginPath(); x2.arc(64 + Math.cos(a) * 27, 64 + Math.sin(a) * 27, 5, 0, 7); x2.fill(); }
        x2.fillStyle = '#b8b29c'; x2.fillRect(60, 2, 8, 18);   /* vạch sáng trên lốp để thấy bánh quay */
        const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const bMat = new THREE.MeshLambertMaterial({ map: tx }), bGeo = new THREE.CircleGeometry(1, 32);
        for (const k of ['td57', 'td77']) { if (!TD[k]) continue; const c = TD[k].c, o = g.scene.clone(true); o.scale.setScalar(TD[k].s); scene.add(o); const banh = [];
          /* tâm, bán kính từng bánh đo bằng ảnh cạnh của mẫu (anh Thắng 26/11: nắp phải to bằng bánh, đúng giữa bánh): [z, cao tâm, bán kính, mặt ngoài lốp |x|] */
          for (const [z, y, r, xm] of [[3.85, 0.81, 0.81, 1.67], [-0.85, 0.78, 0.78, 1.61], [-2.61, 0.77, 0.77, 1.61]]) for (const sg of [-1, 1]) { const pv = new THREE.Object3D(); pv.position.set(sg * (xm + 0.03), y, z); pv.userData.r = r;
            const m = new THREE.Mesh(bGeo, bMat); m.scale.setScalar(r); m.rotation.y = sg * Math.PI / 2; pv.add(m); o.add(pv); banh.push(pv); }
          KS.xt.push({ o, k, c, banh, R: 118 * TD[k].s, v: 4.2, a0: rr() * 6.28 }); }
        if (KS.xt[0]) napSan(KS.xt[0].o); } catch (e) { console.warn('xe TZM', e); }
      /* nhà phố Khâm Thiên: mẫu nhà phố gói HCM 1975 (NhaC, NhaA, XaNgoi, NhaD — gốc ở chân mặt tiền, mặt nhìn +z), dựng thưa 1/3 so với dãy nhà khác.
         Sau vệt bom 26/12: nhà trúng bom bị "cắt" ngang thân theo đường gãy lởm chởm (tường đổ, lộ ruột nhà, ám khói), nhà gần bị ám khói; thêm đống gạch trong nền nhà đổ. MINH HOẠ */
      if (INST.nhaKT && INST.nhaKT.length) try { const g = await glbLoad('props/nha/nha-pho.glb'); g.scene.updateMatrixWorld(true);
        const phang = (geo) => { const G_ = new THREE.BufferGeometry(); for (const [n, a] of Object.entries(geo.attributes)) { const k = a.itemSize, A = new Float32Array(a.count * k);
            for (let i = 0; i < a.count; i++) { A[i * k] = a.getX(i); if (k > 1) A[i * k + 1] = a.getY(i); if (k > 2) A[i * k + 2] = a.getZ(i); if (k > 3) A[i * k + 3] = a.getW(i); } G_.setAttribute(n, new THREE.BufferAttribute(A, k)); }
          if (geo.index) G_.setIndex(geo.index.clone()); return G_; };
        const LOAI = ['NhaC', 'NhaA', 'XaNgoi', 'NhaD'].map((n) => { const o = g.scene.getObjectByName(n); let me = null; if (o) o.traverse((c) => { if (!me && c.isMesh) me = c; }); if (!me) return null;
          const geo = phang(me.geometry).applyMatrix4(me.matrixWorld); if (!geo.attributes.normal) geo.computeVertexNormals(); return geo; });
        const KTm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); HNX.uKT = { value: -1e9 };
        KTm.onBeforeCompile = (sh) => { sh.uniforms.uT = HNX.uKT;
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aHuy; varying vec3 vHuy; varying vec3 vPl;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvHuy = aHuy; vPl = position;');
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; varying vec3 vHuy; varying vec3 vPl;').replace('#include <color_fragment>', `#include <color_fragment>
  if (uT >= vHuy.x) { float cat = vHuy.y + 1.1 * sin(vPl.x * 1.7 + vHuy.z * 20.0) + 0.7 * sin(vPl.x * 4.3 - vPl.z * 0.8) + 0.12 * vPl.z;
    if (vHuy.y > 0.0 && vPl.y > cat) discard;
    float den = vHuy.y > 0.0 ? smoothstep(cat - 3.5, cat, vPl.y) : 0.35; diffuseColor.rgb *= mix(0.72, 0.16, den); }
  if (!gl_FrontFacing) diffuseColor.rgb *= 0.4;`); };
        const BOMKT = BOM.filter((b) => b.t >= (HNX.tBomKT || 1e9) - 1 && b.t < (HNX.tBomKT || 1e9) + 6), NHOM = [[], [], [], []], GACH = [], q4 = new THREE.Quaternion(), Yv = V3(0, 1, 0), m4 = new THREE.Matrix4();
        for (const [x, z, yaw, k, sd] of INST.nhaKT) { let bt = 1e9, bd = 1e9; for (const b of BOMKT) { const d = Math.hypot(b.p.x - x, b.p.z - z); if (d < bd) { bd = d; bt = b.t; } }
          const huy = bd < 48 && sd < 0.78, am = bd < 110; const cut = huy ? 0.7 + sd * 3.4 : -1;
          NHOM[k].push([x, z, yaw, am ? bt + 0.25 : 1e9, cut, sd]);
          if (huy) { const D_ = [14.5, 14.1, 12.8, 14.9][k], W_ = [5.4, 8, 7.8, 4.6][k], c = Math.cos(yaw), s_ = Math.sin(yaw), y = hG(x, z);
            for (let j = 0; j < 7; j++) { const u = (rr() - 0.5) * W_ * 0.9, v = -rr() * D_ * 0.9, X = x + u * c + v * s_, Z = z - u * s_ + v * c;
              GACH.push([vay(1.2 + rr() * 2.6, 0.4 + rr() * 1.4, 1.2 + rr() * 2.4).rotateY(rr() * 3).translate(X, y + 0.3, Z), [0x8b7d6b, 0x6e6458, 0x9a8a72, 0x5b4b3c, 0x7a4a36][Math.floor(rr() * 5)]]); }
            for (let j = 0; j < 2; j++) GACH.push([vay(0.25, 0.25, 3 + rr() * 2.5).rotateX(0.35 + rr() * 0.4).rotateY(yaw + rr()).translate(x + (rr() - 0.5) * 3, y + 0.9, z - rr() * 6), 0x4a3a2c]); } }
        HNX.nhaKT = NHOM.map((L, k) => { if (!L.length || !LOAI[k]) return null; const geo = LOAI[k].clone(), A = new Float32Array(L.length * 3), im = new THREE.InstancedMesh(geo, KTm, L.length);
          L.forEach(([x, z, yaw, tt, cut, sd], i) => { q4.setFromAxisAngle(Yv, yaw); im.setMatrixAt(i, m4.compose(V3(x, hG(x, z), z), q4, V3(1, 1, 1))); A.set([tt, cut, sd], i * 3); });
          geo.setAttribute('aHuy', new THREE.InstancedBufferAttribute(A, 3)); im.computeBoundingSphere(); im.frustumCulled = true; scene.add(im);
          im.userData.tam = V3(L.reduce((a, q) => a + q[0], 0) / L.length, 0, L.reduce((a, q) => a + q[1], 0) / L.length); im.userData.xa = 4500; LAYER.nha.push(im); return im; });
        if (GACH.length) { HNX.gachNha = new THREE.Mesh(gop(GACH), vcMat); HNX.gachNha.visible = false; scene.add(HNX.gachNha); }
      } catch (e) { console.warn('nhà Khâm Thiên', e); }
      /* phố ngày thường: tàu điện, người đạp xe (mẫu anh Thắng: mũi +z, áo tách riêng để đổi màu, hai bánh quay quanh trục) */
      if (PHO.tauD) try { const g = await glbLoad('props/pho/tau-dien.glb'); for (let i = 0; i < 2; i++) { const o = g.scene.clone(true); o.visible = false; scene.add(o); PHO.tau.push({ m: o, D: PHO.tauD, v: 3.8 + i * 0.8, d0: i * 380 }); } } catch (e) { console.warn('tàu điện', e); }
      if (PHO.duong.length) try { const g = await glbLoad('props/pho/xe-dap.glb'); let aoGoc = null; const a0 = g.scene.getObjectByName('ao'); if (a0) a0.traverse((c) => { if (!aoGoc && c.isMesh) aoGoc = c.material; });
        const AO = [0xf4f1e8, 0x7d9cc4, 0xb89c6c, 0x9a9f98, 0x45607e, 0xd2bf94, 0x84604c, 0x5f7a52, 0xe9e3d3, 0x3c4a5c].map((c) => { const m = aoGoc ? aoGoc.clone() : mat(c); m.color.setHex(c); return m; });
        for (let i = 0; i < 54; i++) { const o = g.scene.clone(true), ao = o.getObjectByName('ao'); if (ao) ao.traverse((c) => { if (c.isMesh) c.material = AO[(i * 7) % AO.length]; });
          const banh = []; for (const [n, r] of [['banh_0', 0.40], ['banh_1', 0.37]]) { const b = o.getObjectByName(n); if (b) banh.push([b, r]); }
          o.visible = false; scene.add(o); PHO.dap.push({ o, banh }); } if (PHO.dap[0]) napSan(PHO.dap[0].o); } catch (e) { console.warn('xe đạp', e); } }
  })();

  // ---------------------------------------------------------------- lớp phủ: màn hình ra-đa (mô phỏng), thẻ bản đồ, đồng hồ, số liệu có nguồn, tựa đề cuối
  const OV = document.createElement('div'); OV.id = 'dbOv'; document.body.append(OV);
  const st = document.createElement('style'); st.textContent = `#dbOv{position:fixed;inset:0;pointer-events:none;z-index:28}
#dbOv .k{position:absolute;opacity:0;transition:opacity .7s;color:#f3ead6;font-family:'Be Vietnam Pro',system-ui,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.8)}
#dbOv .k.on{opacity:1}
#dbOv .ra{left:50%;top:46%;transform:translate(-50%,-50%);width:min(62vh,74vw);background:rgba(6,14,10,.88);border:1px solid #3e6b4a;border-radius:14px;padding:10px 10px 8px;box-shadow:0 10px 40px rgba(0,0,0,.6)}
#dbOv .ra canvas{width:100%;aspect-ratio:1;display:block;border-radius:50%}
#dbOv .ra p{margin:6px 4px 0;font-size:12px;color:#9fcfa9;text-align:center}
#dbOv .bd{left:50%;top:44%;transform:translate(-50%,-50%);width:min(680px,84vw);background:rgba(24,20,15,.92);border:1px solid #c9a24a;border-radius:14px;padding:12px 14px}
#dbOv .bd svg{width:100%;height:auto;display:block}
#dbOv .bd p,#dbOv .sl p{margin:6px 2px 0;font-size:12px;color:#c9b88f}
#dbOv .dh{right:max(16px,2.5vw);top:16%;background:rgba(24,20,15,.88);border:1px solid #c9a24a;border-radius:12px;padding:10px 16px;text-align:right}
#dbOv .dh b{display:block;font-size:clamp(30px,5vw,58px);font-weight:800;color:#ffe9a8;letter-spacing:.04em;font-variant-numeric:tabular-nums}
#dbOv .dh i{display:block;font-style:normal;font-size:13px;color:#e8dcbf}
#dbOv .sl{left:50%;transform:translateX(-50%);top:15%;max-width:min(520px,90vw);background:rgba(24,20,15,.9);border:1px solid #c9a24a;border-left:5px solid #c9a24a;border-radius:10px;padding:10px 14px}
#dbOv .sl h4{margin:0 0 4px;font-size:clamp(15px,1.8vw,20px);color:#ffe9a8}
#dbOv .sl .so{font-size:clamp(26px,4vw,46px);font-weight:800;color:#fff;line-height:1.1}
#dbOv .sl .hai{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#dbOv .sl .hai>div{background:rgba(255,255,255,.05);border-radius:8px;padding:8px}
#dbOv .td{left:50%;top:40%;transform:translate(-50%,-50%);text-align:center;width:92vw}
#dbOv .td b{display:block;font-size:clamp(26px,5.4vw,72px);font-weight:800;color:#ffe9a8;letter-spacing:.03em;line-height:1.1}
#dbOv .td i{display:block;margin-top:10px;font-style:normal;font-size:clamp(15px,2vw,24px);color:#f3ead6}
@media (max-width:700px){#dbOv .sl{top:16%}#dbOv .dh{top:12%}}`;
  document.head.append(st);
  const the = (cls, html) => { const d = document.createElement('div'); d.className = 'k ' + cls; d.innerHTML = html; OV.append(d); return d; };
  const raEl = the('ra', '<canvas width="520" height="520"></canvas><p></p>'), raCv = raEl.querySelector('canvas'), raCx = raCv.getContext('2d');
  const RA = { 'C03-08': ['Màn hình ra-đa — MÔ PHỎNG (không phải thông số thật)', 0.3, 3], 'C04-01': ['Dải nhiễu B-52 trên màn hình — MÔ PHỎNG', 1, 3], 'C05-02': ['Nhận dạng mục tiêu trong nhiễu — MÔ PHỎNG', 0.8, 3],
    'C06-03': ['Mục tiêu lẫn trong dải nhiễu — MÔ PHỎNG', 1.2, 3], 'C10-03': ['Ra-đa tiếp tục theo dõi bầu trời — MÔ PHỎNG', 0.25, 1] };
  const raVe = (t, nh, nt) => { const W = 520, c = raCx, r = W / 2; c.fillStyle = '#031208'; c.fillRect(0, 0, W, W);
    c.strokeStyle = 'rgba(80,200,120,.35)'; c.lineWidth = 1; for (let k = 1; k <= 4; k++) { c.beginPath(); c.arc(r, r, r * k / 4.2, 0, 7); c.stroke(); }
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(r, r); c.lineTo(r + Math.cos(a) * r, r + Math.sin(a) * r); c.stroke(); }
    const sw = (t * 1.6) % (Math.PI * 2);
    for (let k = 0; k < 40; k++) { const a = sw - k * 0.02; c.strokeStyle = `rgba(90,255,140,${0.5 * (1 - k / 40)})`; c.beginPath(); c.moveTo(r, r); c.lineTo(r + Math.cos(a) * r, r + Math.sin(a) * r); c.stroke(); }
    for (let s = 0; s < 3 * nh; s++) { const a0 = -0.8 + s * 0.27 + Math.sin(t * 0.7 + s) * 0.03; c.fillStyle = `rgba(130,255,160,${0.08 + 0.06 * Math.random()})`; c.beginPath(); c.moveTo(r, r); c.arc(r, r, r * 0.98, a0, a0 + 0.07 + 0.03 * Math.random()); c.closePath(); c.fill();
      for (let i = 0; i < 60; i++) { const d = Math.random() * r * 0.95, a = a0 + Math.random() * 0.09; c.fillStyle = 'rgba(160,255,180,.55)'; c.fillRect(r + Math.cos(a) * d, r + Math.sin(a) * d, 2, 2); } }
    for (let j = 0; j < nt; j++) { const d = r * (0.85 - ((t * 0.02 + j * 0.06) % 0.6)), a = -0.62 + j * 0.05; const sang = Math.max(0, Math.cos(sw - a)) ** 30; c.fillStyle = `rgba(200,255,210,${0.35 + 0.65 * sang})`; c.beginPath(); c.arc(r + Math.cos(a) * d, r + Math.sin(a) * d, 4, 0, 7); c.fill(); } };
  /* thẻ bản đồ sơ đồ (đường bờ biển giản lược, toạ độ gần đúng — MINH HOẠ) */
  const BO = [[23.0, 106.8], [21.6, 108.0], [21.0, 107.3], [20.7, 106.8], [20.3, 106.6], [19.9, 106.1], [19.5, 105.8], [18.9, 105.7], [18.2, 106.4], [17.5, 106.6], [16.7, 107.3], [16.1, 108.2], [15.3, 108.9], [14.0, 109.2], [12.7, 109.4], [11.6, 109.1], [10.7, 107.9], [10.4, 106.8], [9.5, 106.5], [8.6, 104.8], [10.0, 104.8], [10.5, 104.0], [11.6, 103.0], [12.6, 101.4], [13.4, 100.9], [12.9, 100.0], [11.0, 99.5]];
  const svgMap = (lat0, lat1, lon0, lon1, diem, mui, chu) => { const W = 820, Hh = 460, X = (lo) => (lo - lon0) / (lon1 - lon0) * W, Y = (la) => (lat1 - la) / (lat1 - lat0) * Hh;
    let s = `<svg viewBox="0 0 ${W} ${Hh}"><rect width="${W}" height="${Hh}" fill="#25343d"/><path d="M${BO.filter(([la]) => la >= lat0 - 1.5).map(([la, lo]) => X(lo).toFixed(1) + ',' + Y(la).toFixed(1)).join(' L')} L${X(lon0 - 1)},${Y(lat0 - 1.5)} L${X(lon0 - 1)},${Y(lat1 + 1)} L${X(106.8)},${Y(lat1 + 1)} Z" fill="#6f6b52" stroke="#c9b88f" stroke-width="1.5"/>`;
    for (const [la, lo, la2, lo2] of mui) s += `<line x1="${X(lo)}" y1="${Y(la)}" x2="${X(lo2)}" y2="${Y(la2)}" stroke="#fff" stroke-width="4" stroke-dasharray="14 8" opacity=".9" marker-end="url(#mt)"/>`;
    s = s.replace('<rect', '<defs><marker id="mt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#fff"/></marker></defs><rect');
    for (const [la, lo, ten, mau, dx = 10] of diem) s += `<circle cx="${X(lo)}" cy="${Y(la)}" r="8" fill="${mau}" stroke="#fff" stroke-width="2"/><text x="${X(lo) + dx}" y="${Y(la) - 10}" fill="#fff" font-size="20" font-weight="700" ${dx < 0 ? 'text-anchor="end"' : ''}>${ten}</text>`;
    return s + (chu ? `<text x="12" y="${Hh - 12}" fill="#e8dcbf" font-size="15">${chu}</text>` : '') + '</svg>'; };
  /* anh Thắng 26/11: thẻ sơ đồ Hà Nội – Hải Phòng bật lên thì có vòng tròn bung toả ở hai thành phố */
  const vongLoang = (lat0, lat1, lon0, lon1, P) => P.map(([la, lo, mau]) => { const X = (lo - lon0) / (lon1 - lon0) * 820, Y = (lat1 - la) / (lat1 - lat0) * 460;
    return [0, 1, 2].map((k) => `<circle cx="${X}" cy="${Y}" r="8" fill="none" stroke="${mau}" stroke-width="3"><animate attributeName="r" values="8;60" dur="2.4s" begin="${k * 0.8}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.95;0" dur="2.4s" begin="${k * 0.8}s" repeatCount="indefinite"/></circle>`).join(''); }).join('');
  const bd1 = the('bd', svgMap(19.6, 23.2, 103.2, 108.6, [[21.03, 105.85, 'Hà Nội', '#c0392b'], [20.86, 106.68, 'Hải Phòng', '#c0392b']], [], 'Sơ đồ giản lược — không theo tỉ lệ chính xác').replace('</svg>', vongLoang(19.6, 23.2, 103.2, 108.6, [[21.03, 105.85, '#ff5a3c'], [20.86, 106.68, '#ff5a3c']]) + '</svg>') + '<p>Ngày 18/12/1972, Mỹ mở cuộc tập kích đường không chiến lược (Linebacker II); mục tiêu trọng điểm: Hà Nội, Hải Phòng.</p>');
  const bd2 = the('bd', svgMap(9.5, 23.5, 98.5, 112.5, [[21.03, 105.85, 'Hà Nội', '#c0392b'], [12.68, 101.0, 'U-Tapao (Thái Lan)', '#3b6fb6'], [16.0, 111.9, 'Guam: ~3.900 km về phía đông →', '#3b6fb6', -14]],
    [[12.9, 101.4, 19.2, 104.6], [16.3, 111.6, 20.2, 107.6]], 'Hướng chung MINH HOẠ theo sơ đồ Air Force Magazine 11/1997 — không phải tuyến bay thật') + '<p>B-52 của Mỹ xuất phát từ căn cứ Andersen (đảo Guam) và U-Tapao (Thái Lan) — USAF: 153 chiếc ở Guam, 54 chiếc ở U-Tapao (M1).</p>');
  const dhEl = the('dh', '<b>05:02</b><i>Rạng sáng 21/12/1972 · Tiểu đoàn 57, 77, 79 · theo tổng kết phía Việt Nam</i>');
  const sl = (h) => the('sl', h);
  const SL = [
    [M('C04', 13), M('C04', 16), sl('<h4>Đêm 18/12/1972 — chiếc B-52 đầu tiên rơi tại chỗ</h4><div class="so">20 giờ 13 phút</div><p>Tiểu đoàn 59, Trung đoàn tên lửa 261 — cánh đồng Chuôm, xã Phù Lỗ, Đông Anh (Nhân Dân, TTXVN). Lời dẫn đọc "khoảng 20 giờ 18 phút" theo kịch bản; một số nguồn ghi 20 giờ 16 — cần đối chiếu.</p>')],
    [M('C07', 7), M('C07', 9), sl('<h4>Khâm Thiên, đêm 26/12/1972</h4><div class="so">287 người thiệt mạng</div><p>Theo số liệu khu tưởng niệm Khâm Thiên; VOV ghi thêm 290 người bị thương, khoảng 2.000 ngôi nhà bị phá huỷ.</p>')],
    [M('C08', 8), M('C08', 11), sl('<h4>Đêm 26/12/1972</h4><div class="so">8 máy bay B-52 bị bắn rơi</div><p>Theo tổng kết chiến dịch của phía Việt Nam (qdnd.vn: 4 chiếc rơi tại chỗ). Điểm rơi trên sa bàn là MINH HOẠ.</p>')],
    [M('C11', 1), M('C11', 7), sl('<h4>Kết quả theo hai phía</h4><div class="hai"><div><b>Phía Việt Nam</b><div class="so">81</div>máy bay Mỹ bị bắn rơi, trong đó <b>34 B-52</b> (16 chiếc rơi tại chỗ)<p>Bộ Quốc phòng Việt Nam</p></div><div><b>Phía Mỹ</b><div class="so">15</div>B-52 bị mất (10 chiếc trên miền Bắc, 5 chiếc rơi ở Lào, Thái Lan)<p>Không quân Mỹ (AFHRA, Air Force Magazine)</p></div></div>')],
    [M('C09', 10), M('C09', 11), sl('<h4>Đêm 27/12/1972 — Phạm Tuân</h4><p>Cất cánh từ sân bay Yên Bái lúc 22 giờ 20 (SGGP), bắn rơi B-52 trên vùng trời Mộc Châu (Sơn La) theo lịch sử Không quân Việt Nam. Đường bay trên sa bàn là MINH HOẠ.</p>')],
    [M('C09', 14), M('C09', 17), sl('<h4>Đêm 28/12/1972 — Vũ Xuân Thiều</h4><p>Cất cánh từ sân bay Cẩm Thủy (Thanh Hóa) lúc 21 giờ 41 (SGGP, qdnd.vn), đánh trúng B-52 trên vùng trời Sơn La và hy sinh. Các nguồn mô tả diễn biến cuối khác nhau — sa bàn không dựng cảnh va chạm.</p>')],
  ];
  const tdEl = the('td', '<b>HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG</b><i>18 – 29.12.1972 · Mười hai ngày đêm</i>');
  const ovCap = (t, shot) => { const r = RA[shot.id], on = appMode === 'film' && !!r; raEl.classList.toggle('on', on); if (on) { raVe(t, r[1], r[2]); raEl.querySelector('p').textContent = r[0]; }
    bd1.classList.toggle('on', appMode === 'film' && shot.id === 'C01-06'); bd2.classList.toggle('on', appMode === 'film' && shot.id === 'C02-01');
    const s5 = shotT('C05-05'), dOn = appMode === 'film' && t >= s5.t0 && t < s5.t1; dhEl.classList.toggle('on', dOn); if (dOn) { const p = Math.floor(2 + 9 * clamp((t - s5.t0) / (s5.t1 - s5.t0 - 1), 0, 1)); dhEl.querySelector('b').textContent = '05:' + String(p).padStart(2, '0'); }
    for (const [a, b, el] of SL) el.classList.toggle('on', appMode === 'film' && t >= a && t < b);
    tdEl.classList.toggle('on', appMode === 'film' && ((t >= M('C12', 14) && t < M('C12', 16)) || (t >= M('C12', 19) && t < H('C12').t1))); };

  // ---------------------------------------------------------------- mũi tên (trắng, 0,9 — hướng MINH HOẠ)
  const MT = [];
  if (!HN) { const tc = (k) => { const p = PM(k); return [p.x, p.z]; }; const nang = (pts) => pts.map(([x, z]) => V3(x, Math.max(hG(x, z) * EXH, 0) + 2600, z));
    const mk = (pts, t0, t1) => { const m = muiTen(nang(pts), 0xffffff, 700); m.material.uniforms && (m.material.opacity = 0.9); MT.push({ m, t0, t1 }); };
    const hn = tc('hanoi'), hp = tc('haiphong');
    if (KS.c02) KS.c02.forEach((o, j) => mk([[o.a.x, o.a.z], [o.a.x * 0.55 + hn[0] * 0.45, o.a.z * 0.55 + hn[1] * 0.45], [hn[0] + (o.a.x - hn[0]) * 0.12, hn[1] + (o.a.z - hn[1]) * 0.12]], M('C02', 5) + j * 0.6, H('C02').t1));
    if (KS.c08) KS.c08.forEach((o, j) => mk([[o.a.x, o.a.z], [o.a.x * 0.5 + o.b.x * 0.5, o.a.z * 0.5 + o.b.z * 0.5], [o.b.x, o.b.z]], H('C08').t0 + 1 + j * 1.2, M('C08', 3) + 2));
    if (MIGBAY.length) { const [p, v] = MIGBAY; const o27 = KS.c09.o27, o28 = KS.c09.o28, a27 = viTri(o27, 1, KS.c09.tb27), a28 = viTri(o28, 0, KS.c09.tb28);
      mk([[p.xp.x, p.xp.z], [(p.xp.x + a27.x) / 2 - 8000, (p.xp.z + a27.z) / 2], [a27.x, a27.z]], M('C09', 17), H('C09').t1);
      mk([[v.xp.x, v.xp.z], [(v.xp.x + a28.x) / 2 + 6000, (v.xp.z + a28.z) / 2], [a28.x, a28.z]], M('C09', 17) + 1, H('C09').t1); } }

  // ---------------------------------------------------------------- CẬP NHẬT MỖI KHUNG
  const _f = V3(0, 0, 1), _p = V3(0, 0, 0);
  /* lửa đốt sau đỏ ở đuôi MiG-21, vệt khí phụt ra sau (MINH HOẠ); sc: tỉ lệ mẫu, k: độ hiện */
  const migLua = (p, f, sc, k = 1) => { const tx = p.x - f.x * 7.3 * sc, ty = p.y - f.y * 7.3 * sc + 0.15 * sc, tz = p.z - f.z * 7.3 * sc, nh = 0.85 + 0.15 * Math.sin(performance.now() * 0.05);
    dom(true, 0xff2a10, tx, ty, tz, 3.4 * sc * nh, 0.95 * k); dom(true, 0xffc070, tx + f.x * 0.3 * sc, ty, tz + f.z * 0.3 * sc, 1.6 * sc, 0.95 * k);
    for (let j = 1; j <= 3; j++) dom(true, 0xff4a18, tx - f.x * j * 1.3 * sc, ty - f.y * j * 1.3 * sc, tz - f.z * j * 1.3 * sc, (2.6 - j * 0.5) * sc * nh, 0.7 * k * (1 - j / 4));   /* lưỡi lửa */
    for (let j = 1; j <= 18; j++) { const d = 4 + j * 5.5, a = j / 18; dom(false, 0xd9d5cc, tx - f.x * d * sc, ty - f.y * d * sc, tz - f.z * d * sc, (1.4 + a * 8) * sc, 0.42 * (1 - a) * k); } };
  const viTriV = (F, i, t) => { const f = F.b.clone().sub(F.a).normalize(), r = V3(f.z, 0, -f.x), p = F.a.clone().lerp(F.b, clamp((t - F.t0) / (F.t1 - F.t0), 0, 1));
    if (i) p.addScaledVector(f, -30).addScaledVector(r, i === 1 ? 26 : -26).add(V3(0, i === 1 ? 3 : -3, 0)); return { p, f }; };   /* chữ V: chiếc dẫn đầu, hai chiếc bay chếch sau hai bên */
  const nhieuCap = (o, t, p) => { /* nhiễu điện tử: chấm sợi nhiễu lấp lánh sau đội hình + quầng mờ (MINH HOẠ) */
    for (let k = 0; k < 26; k++) { const a = (t * 0.6 + k * 0.137) % 1, x = p.x - o.f.x * a * 2200 * SB / 2.2 + Math.sin(k * 9.1) * 300 * SB / 2.2, z = p.z - o.f.z * a * 2200 * SB / 2.2 + Math.cos(k * 5.3) * 300 * SB / 2.2;
      dom(true, 0xcfe8ff, x, p.y - a * 500, z, (8 + 30 * a) * SB, 0.55 * (1 - a) * (0.5 + 0.5 * Math.sin(t * 9 + k))); }
    if (o.nhieu) dom(true, 0x6aa8ff, p.x, p.y, p.z, 260 * SB * (0.9 + 0.1 * Math.sin(t * 3)), 0.07); };
  KS.cap = (t, dt) => { try {
    const scn = sceneAt(t), shot = shotAt(t), dem = KS.dem(t);
    nDen = 0; for (const l of DEN) l.intensity = 0;
    // máy bay B-52
    let nb = 0, nf = 0; const bay = [];
    for (const o of TOP) { if (t < o.t0 - 1 || t > o.t1 + 1) continue;
      for (let i = 0; i < o.n; i++) { let p = viTri(o, i, t), f = o.f, ng = 0; const ch = o.chet.find((c) => c.i === i);
        if (ch && t >= ch.t) { const u = clamp((t - ch.t) / (ch.tRoi - ch.t), 0, 1); if (u >= 1) continue; const p0 = viTri(o, i, ch.t), c1 = p0.clone().addScaledVector(o.f, 1500 * SB / 2.2); c1.y = p0.y * 0.9;
          const A = p0.clone().lerp(c1, u), B = c1.clone().lerp(ch.roi, u), q = A.lerp(B, u); const A2 = p0.clone().lerp(c1, u + 0.01), B2 = c1.clone().lerp(ch.roi, u + 0.01); f = A2.lerp(B2, u + 0.01).sub(q).normalize(); p = q; ng = u * 2.4;
          for (let k = 0; k < 10; k++) { const b = k / 10; dom(true, 0xff8a30, p.x - f.x * b * 300 * SB, p.y - f.y * b * 300 * SB, p.z - f.z * b * 300 * SB, (60 - b * 40) * SB, 0.9 * (1 - b)); dom(false, 0x2a2622, p.x - f.x * (b + 0.1) * 500 * SB, p.y - f.y * (b + 0.1) * 500 * SB + b * 80, p.z - f.z * (b + 0.1) * 500 * SB, (80 + b * 160) * SB, 0.5 * (1 - b)); }
          denNo(p, 400 * SB, 0.6); }
        const m = B52[nb++]; if (!m) continue; datMB(m, p, f, ng); m.visible = true; bay.push([o, i, p]);
        if (dem) { const r = V3(f.z, 0, -f.x); dom(true, 0xffe0a0, p.x - f.x * 20 * SB, p.y, p.z - f.z * 20 * SB, 22 * SB, 0.55); dom(true, 0xff5040, p.x + r.x * 28 * SB, p.y, p.z + r.z * 28 * SB, 10 * SB, 0.8); dom(true, 0x50ff70, p.x - r.x * 28 * SB, p.y, p.z - r.z * 28 * SB, 10 * SB, 0.8); }
        if (o.nhieu || (shot.id === 'C02-04' && i === 0)) nhieuCap(o, t, p); }
      /* F-4 hộ tống (Cảnh 2, 6, 9): bay hai bên tốp, MINH HOẠ */
      if ((trong(t, 'C02') || trong(t, 'C06') || trong(t, 'C09')) && nf < F4.length - 1) { const p = viTri(o, 0, t), r = V3(o.f.z, 0, -o.f.x); for (const sg of [-1, 1]) { const m = F4[nf++]; datMB(m, p.clone().addScaledVector(r, sg * 900 * SB / 2.2).add(V3(0, 300 * SB / 2.2, 0)), o.f, sg * 0.1); m.visible = true; } } }
    for (let i = nb; i < B52.length; i++) B52[i].visible = false; for (let i = nf; i < F4.length; i++) F4[i].visible = false;
    // tên lửa S-75
    for (const e of TL) { const a = t - e.t0; if (a < 0 || t > e.tHit + 0.05) { e.m.visible = false; if (t >= e.tHit && t < e.tHit + 3) { const tp = viTri(e.o, e.i, e.tHit), k = 1 - (t - e.tHit) / 3, ex = e.trung ? 1 : 0.55;
          dom(true, 0xffd27a, tp.x, tp.y, tp.z, (e.trung ? 520 : 260) * SB * (0.4 + (1 - k)) , 0.95 * k * ex); dom(false, 0x3a342e, tp.x, tp.y - (1 - k) * 60, tp.z, 380 * SB * (1.2 - k * 0.6), 0.45 * k); denNo(tp, 600 * SB, k * ex); } continue; }
      const be = e.b, s0 = be.userData.tl.getWorldPosition(_p).clone(), tp = viTri(e.o, e.i, e.tHit), D = s0.distanceTo(tp), c = s0.clone().add(V3(0, D * 0.45, 0)).lerp(tp, 0.25);
      const u = clamp(a / (e.tHit - e.t0), 0, 1), q = (k) => { const A_ = s0.clone().lerp(c, k), B_ = c.clone().lerp(tp, k); return A_.lerp(B_, k); };
      const p = q(u), p2 = q(Math.min(1, u + 0.005)), f = p2.clone().sub(p).normalize(); if (GLB.tlMau && !e.g) { e.g = GLB.tlMau.clone(); scene.add(e.g); e.m.visible = false; e.m = e.g; }
      e.m.visible = true; e.m.position.copy(p); e.m.lookAt(p.clone().add(f)); e.m.scale.setScalar((HN ? 1 : 6) * (1 + u * (SB * 1.6 - 1)));
      be.userData.tl.visible = a > 0.3 ? false : true;
      dom(true, 0xfff1c0, p.x - f.x * 6, p.y - f.y * 6, p.z - f.z * 6, (18 + u * 60) * SB, 0.95); denNo(p, 250 * SB, 0.4);
      for (let k = 1; k <= 22; k++) { const uu = u - k * 0.012; if (uu <= 0) break; const pp = q(uu); dom(false, dem ? 0xc8c2b8 : 0xd8d6d0, pp.x, pp.y, pp.z, (10 + k * 4) * SB * (0.6 + uu), (dem ? 0.55 : 0.38) * (1 - k / 23)); if (dem && k < 6) dom(true, 0xffc080, pp.x, pp.y, pp.z, (14 + k * 3) * SB, 0.35 * (1 - k / 6)); }
      if (a < 1.6) dom(false, 0xb0a898, s0.x, hG(s0.x, s0.z) + 4, s0.z, 40 * (HN ? 1 : 6) * (0.5 + a), 0.55 * (1 - a / 1.6)); }
    for (const e of TL) if (t > e.t0 - 15 && t < e.t0 + 0.3) { const tp = viTri(e.o, e.i, e.tHit), bp = e.b.position; e.b.rotation.y = Math.atan2(tp.x - bp.x, tp.z - bp.z); }   /* bệ quay về phía mục tiêu trước khi phóng */
    for (const T_ of Object.values(TD)) for (const b of T_.be) { const tl = b.userData.tl; if (tl.visible === false && !TL.some((e) => e.b === b && t >= e.t0 && t < e.t0 + 40)) tl.visible = true; }
    // xác máy bay rơi: nổ khi chạm đất, cháy âm ỉ
    for (const o of TOP) for (const ch of o.chet) { if (ch.ngoai) continue; const a = t - ch.tRoi; if (a < 0 || a > 400 || !trong(t, scn.id)) continue; const p = ch.roi, k = a < 2.5 ? 1 - a / 2.5 : 0;
      if (k > 0) { dom(true, 0xffb060, p.x, p.y + 20 * SB, p.z, 90 * SB * (0.6 + a * 1.4), 0.9 * k); denNo(p.clone().add(V3(0, 60, 0)), 300 * SB, k); }
      for (let j = 0; j < 6; j++) { const w = (t * 0.7 + j / 6) % 1; dom(true, 0xff7a2a, p.x + Math.sin(j * 2) * 12 * SB, p.y + 3 * SB + w * 14 * SB, p.z + Math.cos(j * 3) * 12 * SB, (16 - w * 10) * SB, 0.7 * (1 - w));
        dom(false, 0x2b2824, p.x + w * 40 * SB, p.y + 20 * SB + w * 160 * SB, p.z - w * 20 * SB, (25 + w * 90) * SB, 0.4 * (1 - w)); }
      if (dem && nDen < DEN.length) denNo(p.clone().add(V3(0, 30, 0)), 400 * SB, 0.35); }
    // bom: chớp nổ, bụi, đám cháy
    for (const b of BOM) { const a = t - b.t; if (a < 0 || a > (b.chay ? 90 : 5)) continue; if (Math.abs(t - b.t) > 200) continue; const p = b.p;
      if (a < 0.6) { dom(true, 0xffc070, p.x, p.y + b.s * 0.5, p.z, b.s * (2 + a * 6), 0.95 * (1 - a / 0.6)); if (a < 0.25) denNo(p.clone().add(V3(0, b.s, 0)), b.s * 8, 1); }
      if (a < 5) dom(false, 0x5a5046, p.x, p.y + b.s * (0.6 + a * 0.6), p.z, b.s * (1.5 + a * 1.4), 0.55 * (1 - a / 5));
      if (b.chay && a > 0.5) { const w = (t * 0.8 + b.t) % 1; dom(true, 0xff7a2a, p.x, p.y + b.s * (0.3 + w * 0.6), p.z, b.s * (1.2 - w * 0.6), 0.7 * (1 - w)); dom(false, 0x2e2a26, p.x + w * b.s, p.y + b.s * (1 + w * 4), p.z, b.s * (1.5 + w * 3), 0.35 * (1 - w)); } }
    for (const c of CHAY) { const a = t - c.t; if (a < 0 || t > c.het) continue; for (let j = 0; j < 3; j++) { const w = (t * 0.9 + j / 3 + c.t) % 1; dom(true, 0xff8a3a, c.p.x, c.p.y + c.s * w * 1.2, c.p.z, c.s * (1.4 - w), 0.75 * (1 - w)); dom(false, 0x2a2622, c.p.x + w * c.s * 2, c.p.y + c.s * (1 + w * 6), c.p.z, c.s * (1.6 + w * 4), 0.4 * (1 - w)); } }
    // Hà Nội: đèn phố, phố ngày thường, nhà máy, Bạch Mai, Khâm Thiên, Hữu Tiệp, cờ
    if (HN) { phoCap(t);
      if (HNX.denPho) { const tat = M('C04', 6), on = (t >= M('C01', 11) && t < H('C02').t0) || (t >= H('C03').t0 && t < tat + 3); HNX.denPho.material.opacity = on ? (t >= tat ? clamp(1 - (t - tat) / 3, 0, 1) : t < H('C02').t0 ? sstep(M('C01', 11), M('C01', 11) + 8, t) : 1) * 0.85 : 0; }
      if (HNX.khoiNM && t < H('C02').t0) for (let j = 0; j < 8; j++) { const w = (t * 0.12 + j / 8) % 1; dom(false, 0x6a6460, HNX.khoiNM.x + w * 60, HNX.khoiNM.y + w * 120, HNX.khoiNM.z - w * 20, 10 + w * 40, 0.45 * (1 - w)); }
      if (HNX.bm) { const hu = t >= H('C07').t0; HNX.bm[0].visible = !hu; HNX.bm[1].visible = hu; }
      if (HNX.gachKT) { const hu = t >= (HNX.tBomKT || 1e9) + 1.5 && t < H('C12').t0; HNX.gachKT.visible = hu; HNX.vd.visible = hu; }
      if (HNX.xacHT) HNX.xacHT.visible = t >= H('C10').t0;
      if (HNX.co) { HNX.co.visible = t >= H('C12').t0; if (HNX.co.visible) { const P = HNX.co.geometry.attributes.position, a0 = HNX.coP0; for (let i = 0; i < P.count; i++) { const x = a0[i * 3]; P.array[i * 3 + 2] = Math.sin(x * 1.3 - U.time.value * 4) * 0.35 * (x / 6); } P.needsUpdate = true; HNX.co.geometry.computeVertexNormals(); } }
      }
    if (HN && KS.migV) KS.migV.forEach((o, i) => { const F = KS.bayV.find((F) => t >= F.t0 && t <= F.t1); o.visible = !!F; if (!F) return; const { p, f } = viTriV(F, i, t); datMB(o, p, f, 0); migLua(p, f, 1); });
    if (HN && KS.xt) for (const X of KS.xt) { const a = X.a0 + X.v * t / X.R, x = X.c.x + Math.sin(a) * X.R, z = X.c.z + Math.cos(a) * X.R; X.o.position.set(x, hG(x, z), z); X.o.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a));   /* hướng tiếp tuyến chiều chạy: luôn đi tiến */
      for (const b of X.banh) b.rotation.x = X.v * t / b.userData.r; }
    for (const [j, o] of RADA.entries()) { const at = o.userData.at; if (at) at.rotation.y = t * 0.9 + j * 1.3; const S = o.userData.song; if (!S) continue; const sc = o.scale.x, gn = ganMay(o.position.x, o.position.z, 2600 * sc);
      S.forEach((m, k) => { m.visible = gn && appMode !== 'pov'; if (!m.visible) return; const a = ((t * 0.55 + k / S.length) % 1), dir = (at || o).getWorldDirection(_f).setY(0).normalize(); dir.y = 0.38; dir.normalize();
        const p0 = (at || o).getWorldPosition(_p); m.position.copy(p0).addScaledVector(dir, (2 + a * 85) * sc).add(V3(0, 1.5 * sc, 0)); m.lookAt(m.position.clone().add(dir)); m.scale.setScalar((1.6 + a * 15) * sc); m.material.opacity = 0.95 * (1 - a) * (a < 0.08 ? a / 0.08 : 1); }); }
    if (HN && HNX.uKT) { const tb = HNX.tBomKT || 1e9; HNX.uKT.value = t >= tb - 2 && t < H('C12').t0 ? t : -1e9; if (HNX.gachNha) HNX.gachNha.visible = t >= tb + 1.5 && t < H('C12').t0; }
    // MiG-21 (miền Bắc)
    if (!HN && MIG.length) MIGBAY.forEach((m, j) => { const o = MIG[j]; if (!o) return; const on = (j === 0 ? t >= H('C09').t0 : t >= m.t0 - 4) && trong(t, 'C09'); o.visible = on; if (!on) return; const v = migViTri(m, t); datMB(o, v.p, v.f, 0);
      if (v.mo !== undefined && v.mo <= 0) { o.visible = false; return; }
      if (!v.dat) migLua(v.p, v.f, SB * 0.9, v.mo ?? 1);
      if (t >= m.tHit - 1.5 && t < m.tHit) { const tp = viTri(m.o, m.i, m.tHit), u = (t - m.tHit + 1.5) / 1.5, p = v.p.clone().lerp(tp, u); dom(true, 0xfff0c0, p.x, p.y, p.z, 40 * SB, 0.9); } });
    // mũi tên
    for (const x of MT) { const on = appMode === 'explore' ? false : t >= x.t0 && t < x.t1; muiTenDat(x.m, on, on ? sstep(x.t0, x.t0 + 3, t) : 0); }
    ovCap(t, shot);
    domXong();
  } catch (e) { if (!KS.loi) { KS.loi = 1; console.error('dàn cảnh ĐBP trên không', e); } } };

  // ---------------------------------------------------------------- người: kíp trận địa, dân trên phố, cứu nạn Khâm Thiên (MINH HOẠ, chỉ vẽ khi máy quay gần)
  DAM.push((t) => { if (!HN) return; const ph = (i) => (i * 0.37) % 1;
    for (const [k, T_] of Object.entries(TD)) { const c = T_.c; if (!ganMay(c.x, c.z, 900)) continue;
      /* anh Thắng 26/11: mỗi bệ phóng 5 người — 4 người không cầm súng đứng thao tác tên lửa, 1 người cầm súng gác (quay ra ngoài) */
      T_.be.forEach((b, i) => { const p = b.position, rx = p.x - c.x, rz = p.z - c.z, rl = Math.hypot(rx, rz) || 1, ux = rx / rl, uz = rz / rl, vx = -uz, vz = ux;
        [[5.2, -2.8, 'dung'], [6.0, -0.9, i % 2 ? 'nhat' : 'dung'], [5.8, 1.2, 'chongnanh'], [4.6, 3.1, i % 3 ? 'vuon' : 'dung']].forEach(([a, l, clip], j) => {
          const x = p.x + ux * a + vx * l, z = p.z + uz * a + vz * l; dongDat('kt', clip, t, ph(i * 5 + j), x, hG(x, z), z, Math.atan2(p.x - x, p.z - z), 1, i * 5 + j); });
        const x = p.x + ux * 13 + vx * 3.5, z = p.z + uz * 13 + vz * 3.5; dongDat('qgp', 'dung', t, ph(i + 30), x, hG(x, z), z, Math.atan2(ux, uz), 1, i + 30); });
      /* cạnh xe điều khiển: 3 trắc thủ không cầm súng, 1 người cầm súng */
      for (let i = 0; i < 4; i++) { const x = c.x - 9 + i * 2.2, z = c.z + 5; dongDat(i === 3 ? 'qgp' : 'kt', i === 3 ? 'dung' : ['dung', 'chongnanh', 'dung'][i], t, ph(i + 3), x, hG(x, z), z, Math.PI, 1, i + 40); } }
    /* anh Thắng 26/11: cụm ra-đa có lính đứng cùng — 2 người không cầm súng (trắc thủ), 2 người cầm súng gác */
    for (const [j, o] of RADA.entries()) { const p = o.position; if (!ganMay(p.x, p.z, 600 * o.scale.x)) continue; const sc = o.scale.x, cr = Math.cos(o.rotation.y), sr = Math.sin(o.rotation.y);
      [[-3.6, 3.4, 'kt', 'dung'], [-3.4, 0.6, 'kt', 'chongnanh'], [3.8, 4.6, 'qgp', 'dung'], [4.2, -4.4, 'qgp', 'dung']].forEach(([dx, dz, ten, clip], i) => {
        const x = p.x + (dx * cr + dz * sr) * sc, z = p.z + (-dx * sr + dz * cr) * sc; dongDat(ten, clip, t, ph(i + j), x, hG(x, z), z, Math.atan2(p.x - x, p.z - z) + (ten === 'qgp' ? Math.PI : 0), sc, 60 + j * 4 + i); }); }
    if (KS.cx) for (const [j, o] of KS.cx.entries()) { if (j % 4 || !ganMay(o.position.x, o.position.z, 500)) continue; for (let i = 0; i < 5; i++) { const x = o.position.x - 4 + i * 2.5, z = o.position.z + 5; dongDat('qgp', 'dung', t, ph(i + j), x, hG(x, z), z, 2.3, 1, i + j); } }
    if (KS.ds) for (const [j, o] of KS.ds.entries()) { if (!ganMay(o.position.x, o.position.z, 400)) continue; for (let i = 0; i < 3; i++) { const x = o.position.x - 1.5 + i * 1.4, z = o.position.z - 1.6; dongDat(i === 1 ? 'kt' : 'qgp', 'dung', t, ph(i + j), x, o.position.y - 0.15, z, 0.6, 1, i + 40 + j); } }
    /* dân trên phố (Cảnh 1 đi lại; Cảnh 4 xuống hầm: đi nhanh về phía hầm rồi khuất) */
    /* người đi bộ trên vỉa hè (anh Thắng 26/11: thêm người đi bộ mặc đồ tây, mặc áo dài; đi trên mặt phố phẳng, không xuống nước): đi tiến dọc phố, hai chiều */
    for (const [j, D] of PHO.duong.entries()) { if (!(t < H('C02').t0 || trong(t, 'C04'))) break; const L = D.L, bao = trong(t, 'C04') ? t - M('C04', 5) : -1;
      for (let i = 0; i < 28; i++) { const chieu = i % 2 ? 1 : -1, v = bao > 0 ? 2.1 : 1.15 + ((i * 7) % 4) * 0.08, d0 = (i * 53.7 + j * 17) % L, d = (((d0 + chieu * v * t) % L) + L) % L;
        const q = benPhai(D, d, 8.2 + ((i * 5) % 3) * 0.45, chieu); if (!ganMay(q.x, q.z, 450)) continue; if (bao > 6 + (i % 5)) continue;   /* báo động (C04): đi nhanh về hầm rồi khuất */
        const ai = i % 7, ten = ai < 3 ? 'danNu' + (i % 4) : 'danNam' + (1 + (i % 3));   /* 3/7 áo dài, 4/7 sơ mi, quần tây — MINH HOẠ */
        dongDat(ten, 'di', t, ph(i), q.x, q.y, q.z, q.yaw, 1, i + j * 30); } }
    /* Khâm Thiên: dân quân, y tế, người dân tìm kiếm (Cảnh 7 từ câu 9; Cảnh 11) */
    if (HNX.KT && (t >= M('C07', 8) && t < H('C07').t1 || trong(t, 'C11'))) { const KT = HNX.KT, n = KT.length;
      for (let i = 0; i < 22; i++) { const a = KT[Math.floor((0.35 + i * 0.012) * n)], b = KT[Math.floor((0.35 + i * 0.012) * n) + 1] || a, f = b.clone().sub(a).normalize(), off = (i % 2 ? 1 : -1) * (6 + (i * 7) % 9);
        const x = a.x + f.z * off + f.x * (i % 3) * 2, z = a.z - f.x * off + f.z * (i % 3) * 2; if (!ganMay(x, z, 350)) continue;
        dongDat(i % 4 === 0 ? 'danNam1' : 'kt', i % 4 === 0 ? 'dung' : ['nhat', 'tha', 'nhat', 'dung', 'vuon'][i % 5], t, ph(i), x, hG(x, z) + 0.6, z, Math.atan2(f.x, f.z) + (i % 2 ? Math.PI / 2 : -Math.PI / 2), 1, i); } }
  });
  DAM.push((t) => { if (!HN || !KS.cx || !KS.dem(t)) return; /* đạn vạch pháo cao xạ, súng 12,7 mm bắn lên khi có tập kích */
    const hot = (t >= M('C04', 11) && t < H('C04').t1) || (t >= M('C05', 7) && t < M('C05', 11)) || (t >= M('C07', 5) && t < M('C07', 7)) || (t >= M('C10', 7) && t < M('C10', 10));
    if (!hot) return; const L = KS.cx.filter((o, j) => j % 2 === 0).concat(KS.ds || []);
    L.forEach((o, j) => { const p = o.position; if (!ganMay(p.x, p.z, 7000)) return; for (let k = 0; k < 4; k++) { const ph = (t * 0.7 + k * 0.25 + j * 0.13) % 1, a = 2.3 + Math.sin(j * 3 + k) * 0.5 + Math.sin(t * 0.3 + j) * 0.2, el = 1.0 + 0.25 * Math.sin(k + j);
        const L2 = 1800, bx = p.x + Math.sin(a) * Math.cos(el) * L2, bz = p.z + Math.cos(a) * Math.cos(el) * L2, by = p.y + 3 + Math.sin(el) * L2;
        vach(p.x, p.y + 3, p.z, bx, by, bz, ph, 22, 1.4, k % 2 ? 0xff9a3a : 0xffd060); } }); });

  // ---------------------------------------------------------------- MÁY QUAY từng cú (u: tiến độ trong cú 0..1, t: giây phim) → [vị trí, điểm nhìn, góc]
  const C = {};
  const quanh = (c, r, h, a0, a1, fov = 42, h1) => (u) => { const [p, l, f] = orbit(c, r, h, a0, a1, fov, h1)(u); return [tren(p, 4), l, f]; };
  const dolly = (a, b, la, lb = la, fov = 40) => (u) => { const e = ease(u); return [tren(a.clone().lerp(b, e), 2), la.clone().lerp(lb, e), fov]; };
  const theoTop = (lay, sau, cao, ngang, fov = 40) => (u, t) => { const r = lay(t); if (!r) return null; const [o, i] = r, p = viTri(o, i, t), f = o.f, rv = V3(f.z, 0, -f.x);
    return [p.clone().addScaledVector(f, -sau * SB).addScaledVector(rv, ngang * SB).add(V3(0, cao * SB, 0)), p.clone().addScaledVector(f, 40 * SB), fov]; };
  const tdCam = (k, r, h, a0, a1, fov = 44) => (u) => { const T_ = TD[k]; if (!T_) return null; const c = T_.c.clone(); c.y += 6; return quanh(c, r, h, a0, a1, fov)(u); };
  if (HN) {
    const hk = PM('hoankiem'), lb = MOC.longbien ? PM('longbien') : hk, gl = PM('gialam'), pl = PM('phulo');
    const tam = V3(hk.x + 500, hG(hk.x, hk.z), hk.z - 2600);
    const DTH = duongD('hangbong') || duongD('dinhtienhoang');   /* V0.2: phố có tàu điện, xe đạp, người đi bộ (Hàng Bông) */
    // Cảnh 1
    C['C01-01'] = quanh(tam, 9000, 4200, 3.6, 4.1, 42, 3200);
    const DP = PHO.tauD, phoCam = (u0, u1, h, truoc, lech, fov = 50) => (u) => { if (!DP) return null; const d = DP.L * (u0 + (u1 - u0) * ease(u)), q = benPhai(DP, d, lech, 1), q2 = benPhai(DP, Math.min(DP.L, d + truoc), lech * 0.3, 1); return [V3(q.x, q.y + h, q.z), V3(q2.x, q2.y + 1.4, q2.z), fov]; };   /* máy quay đi dọc phố Hàng Bông */
    C['C01-02'] = phoCam(0.18, 0.42, 4.2, 55, -2.2, 54);
    C['C01-03'] = (u) => { const NM = INST.vung && INST.vung.nhamayxelua; if (!NM) return null; const c = G3(NM[0][0], NM[0][1]); return quanh(HNX.khoiNM ? HNX.khoiNM.clone().setY(c.y + 10) : c, 420, 140, 0.4, 1.0, 44)(u); };
    C['C01-04'] = tdCam('td77', 70, 14, 1.2, 1.9, 46);
    C['C01-05'] = quanh(tam, 6000, 2200, 4.2, 4.9, 42, 5200);
    C['C01-06'] = quanh(tam, 16000, 12000, 4.9, 5.1, 40);
    C['C01-07'] = quanh(tam, 7000, 2600, 5.1, 5.8, 42, 2000);
    // Cảnh 3
    C['C03-01'] = quanh(tam, 22000, 14000, 0.2, 0.6, 42);
    C['C03-02'] = (u) => { const P = P12[0]; if (!P) return null; return quanh(P.position.clone().add(V3(0, 5, 0)), 40, 10, 0.2, 1.4, 46)(u); };
    C['C03-03'] = tdCam('td59', 210, 90, 2.0, 2.6, 44);
    C['C03-04'] = (u) => { const o = KS.cx && KS.cx[0]; if (!o) return quanh(lb.clone().setY(15), 300, 60, 0, 0.5)(u); const p = o.position, f = p.clone().sub(lb).setY(0).normalize(), r = V3(f.z, 0, -f.x); return [tren(p.clone().addScaledVector(f, 26 - u * 6).addScaledVector(r, 10 - u * 6).add(V3(0, 7, 0))), p.clone().lerp(lb, 0.12).setY(p.y + 6 + u * 10), 50]; };   /* pháo ở tiền cảnh, cầu Long Biên phía sau */
    C['C03-05'] = (u) => { const p = KS.migNB; if (!p) return null; const r = dolly(p.clone().add(V3(-70, 12, -40)), p.clone().add(V3(-20, 6, 60)), p.clone().add(V3(10, 2, 0)), p.clone().add(V3(30, 2, 10)), 46)(u);
      const L = KS.migV && KS.migV[0]; if (L && L.visible) { const k = sstep(0.3, 0.55, u) * (1 - sstep(0.85, 1, u)); r[1] = r[1].clone().lerp(L.position, k * 0.85); r[2] = 46 + k * 6; } return r; };   /* nửa sau: ngước theo tốp MiG bay chữ V */
    C['C03-06'] = (u) => { const o = KS.ds && KS.ds[0]; if (!o) return null; const p = o.position; return [p.clone().add(V3(Math.sin(u) * 8 + 5, 2.5, 7)), p.clone().add(V3(0, 1.2, 0)), 46]; };
    C['C03-07'] = quanh(tam, 14000, 7000, 0.6, 1.1, 42);
    C['C03-08'] = tdCam('td77', 30, 8, 0.5, 0.7, 46);
    C['C03-09'] = tdCam('td77', 45, 7, 2.4, 3.1, 48);
    C['C03-10'] = quanh(tam, 9000, 3600, 1.2, 1.7, 42);
    // Cảnh 4
    C['C04-01'] = tdCam('td59', 35, 9, 0.3, 0.5, 46);
    C['C04-02'] = tdCam('td59', 22, 5, 3.0, 3.4, 50);
    C['C04-03'] = (u, t) => { const o = KS.c04.o1, p = viTri(o, 0, t); return [V3(tam.x + 4000, 1800, tam.z + 6000), p, 40]; };
    C['C04-04'] = phoCam(0.4, 0.52, 9, 120, 0, 52);
    C['C04-05'] = phoCam(0.5, 0.515, 2.6, 35, 5.5, 54);
    C['C04-06'] = tdCam('td59', 55, 10, 1.6, 2.2, 46);
    C['C04-07'] = quanh(V3(gl.x - 3000, 0, gl.z - 5000), 15000, 6500, 3.3, 3.6, 42);
    C['C04-08'] = (u, t) => { const T_ = TD.td57 || TD.td59, c = T_.c; return [V3(c.x - 260, c.y + 30, c.z + 240), V3(c.x + 900, c.y + 1800 + u * 600, c.z - 900), 52]; };
    C['C04-09'] = (u, t) => { const T_ = TD.td59; if (!T_) return null; const b = T_.be[0].position, e = TL.find((x) => x.td === 'td59' && t >= x.t0 && t < x.tHit); const cam = b.clone().add(V3(30, 7, -24));
      return [cam, e ? e.m.position.clone() : b.clone().add(V3(-200, 300 + u * 900, -600)), e ? 58 : 50]; };
    C['C04-10'] = (u, t) => { const o = KS.c04.o1, ch = o.chet[0], p = t < ch.t ? viTri(o, 1, t) : null; const c = V3(pl.x - 6000, 2600, pl.z + 9000); return [c, p || pl.clone().lerp(viTri(o, 1, ch.t), clamp(1 - (t - ch.t) / (ch.tRoi - ch.t), 0, 1)), 38]; };
    C['C04-11'] = quanh(pl.clone().setY(pl.y + 10), 420, 90, 0.4, 1.0, 44);
    C['C04-12'] = quanh(tam, 12000, 5200, 2.0, 2.4, 42, 7000);
    // Cảnh 5
    /* anh Thắng 26/11: cú quay xe TZM để máy xa, nhìn thẳng vào hông xe (vuông góc thân xe, ngang tầm bánh) — bánh xe khớp, không lộ nắp bánh ghép;
       máy đứng phía ngoài vòng chạy, chạy song song theo xe; lech: dời dọc thân xe (m, + về đầu xe) */
    const hongXe = (j, xa, cao, lech = 0, fov = 40) => (u) => { const X = KS.xt && (KS.xt[j] || KS.xt[0]); if (!X) return null; const p = X.o.position, ra = p.clone().sub(X.c).setY(0).normalize(), f = V3(-ra.z, 0, ra.x);
      const m = p.clone().addScaledVector(ra, xa).addScaledVector(f, lech); m.y = p.y + cao; return [m, p.clone().addScaledVector(f, lech * 0.9).add(V3(0, cao * 0.85 - 1.6, 0)), fov]; };   /* nhìn hơi thấp hơn thân xe: xe nằm trên dải phụ đề, thấy rõ bánh */
    C['C05-01'] = hongXe(0, 30, 2.4, 0, 38);
    C['C05-02'] = tdCam('td57', 35, 9, 0.6, 0.9, 46);
    C['C05-03'] = quanh(tam, 20000, 9000, 3.4, 3.8, 42);
    C['C05-04'] = (u) => { const c = (TD.td77 || TD.td59).c; return [V3(c.x - 180, c.y + 20, c.z + 260), V3(c.x + 1200, c.y + 2600, c.z - 2000), 54]; };
    C['C05-05'] = quanh(tam, 26000, 17000, 3.8, 4.0, 42);
    C['C05-06'] = tdCam('td77', 16, 4, 4.2, 4.6, 50);
    C['C05-07'] = hongXe(1, 24, 2.0, 0, 40);
    C['C05-08'] = quanh(tam, 10000, 3800, 4.0, 4.5, 42, 6000);
    // Cảnh 6
    C['C06-01'] = theoTop((t) => [TOP.find((o) => o.nhieu), 0], 1200, 300, 900, 40);
    C['C06-02'] = theoTop((t) => [TOP.find((o) => o.nhieu), 1], -900, 200, -400, 44);
    C['C06-03'] = tdCam('td79', 30, 8, 0.3, 0.5, 46);
    C['C06-04'] = tdCam('td79', 24, 6, 1.0, 2.0, 48);
    C['C06-05'] = hongXe(1, 34, 2.8, 0, 38);
    C['C06-06'] = tdCam('td79', 900, 420, 2.0, 2.5, 44);
    // Cảnh 7
    const kt = HNX.KT, ktC = kt ? kt[Math.floor(kt.length / 2)] : hk;
    C['C07-01'] = (u) => { if (!kt) return null; const a = kt[2], b = kt[kt.length - 3], p = a.clone().lerp(b, 0.1 + 0.3 * u); p.y = hG(p.x, p.z) + 18; return [p, b.clone().setY(hG(b.x, b.z) + 2), 50]; };
    const ktD = kt ? matPho(duong(kt.map((p) => [p.x, -p.z]))) : null, ktCam = (u0, u1, h, lech, nhin, truoc, fov = 50) => (u) => { if (!ktD) return null; const d = ktD.L * (u0 + (u1 - u0) * ease(u)), q = benPhai(ktD, d, lech, 1), q2 = benPhai(ktD, Math.min(ktD.L, d + truoc), nhin, 1); return [V3(q.x, q.y + h, q.z), V3(q2.x, q2.y + 2.5, q2.z), fov]; };   /* máy quay đi dọc lòng phố Khâm Thiên, nhìn chếch sang dãy nhà */
    C['C07-02'] = (u) => { if (!HNX.bmTam) return null; const c = HNX.bmTam; return [V3(c.x - 150 + u * 20, c.y + 9, c.z + 95), V3(c.x - 110 + u * 10, c.y + 3, c.z + 60), 50]; };   /* nhà đổ sập: khối nhà Bạch Mai bị bom (Khâm Thiên chưa bị đánh ở mốc này) */
    C['C07-03'] = (u) => { if (!HNX.bmTam) return null; return quanh(HNX.bmTam.clone().setY(HNX.bmTam.y + 6), 260, 70, 2.2, 2.8, 44)(u); };
    C['C07-04'] = quanh(ktC.clone().setY(hG(ktC.x, ktC.z)), 2600, 1400, 0.7, 0.9, 40);
    C['C07-05'] = ktCam(0.2, 0.6, 9, 0, 6, 60, 52);
    C['C07-06'] = ktCam(0.33, 0.39, 2.4, -2.5, 12, 11, 54);
    C['C07-07'] = (u) => { if (!HNX.vdP) return null; const p = HNX.vdP; return [p.clone().add(V3(2.4 - u, 1.1, 1.6)), p.clone().add(V3(0, 0.2, 0)), 46]; };
    C['C07-08'] = quanh(ktC.clone().setY(hG(ktC.x, ktC.z)), 700, 200, 1.0, 1.5, 44, 900);
    // Cảnh 10
    C['C10-01'] = quanh(tam, 12000, 4200, 0.3, 0.8, 42);
    C['C10-02'] = tdCam('td79', 60, 10, 0.9, 1.5, 46);
    C['C10-03'] = tdCam('td79', 30, 8, 1.6, 1.8, 46);
    C['C10-04'] = (u) => { const o = KS.cx && KS.cx[8]; if (!o) return null; const p = o.position; return [p.clone().add(V3(-10, 3.5, 9 + u * 3)), p.clone().add(V3(60, 40, -60)), 48]; };
    C['C10-05'] = (u) => { const c = (TD.td79 || TD.td59).c; return [V3(c.x + 200, c.y + 25, c.z + 220), V3(c.x - 1500, c.y + 2500, c.z - 1200), 54]; };
    C['C10-06'] = quanh(tam, 7000, 2000, 1.4, 1.8, 42, 1500);
    C['C10-07'] = quanh(hk.clone().setY(hk.y + 10), 1600, 420, 1.9, 2.5, 44);
    C['C10-08'] = C['C07-02'];
    // Cảnh 11
    const ht = HNX.ht || hk;
    C['C11-01'] = quanh(ht.clone().setY(2), 62, 30, 0.3, 1.2, 46);
    C['C11-02'] = quanh(ht.clone().setY(2), 110, 55, 1.2, 1.5, 46);
    C['C11-03'] = tdCam('td77', 40, 9, 0.2, 0.6, 46); C['C11-04'] = (u) => { const P = P12[0]; if (!P) return null; return quanh(P.position.clone().add(V3(0, 6, 0)), 30, 6, 2.0, 2.4, 46)(u); };
    C['C11-05'] = C['C03-05']; C['C11-06'] = C['C03-04']; C['C11-07'] = C['C03-06'];
    C['C11-08'] = phoCam(0.28, 0.48, 7, 90, -2, 48);
    C['C11-09'] = quanh(ktC.clone().setY(hG(ktC.x, ktC.z)), 420, 160, 2.0, 2.6, 44);
    C['C11-10'] = C['C07-07'];
    // Cảnh 12
    const cc = HNX.cotco || hk;
    C['C12-01'] = (u) => { const p = HNX.thapRua; if (!p) return quanh(tam, 7000, 2600, 2.6, 3.3, 42)(u); return quanh(p.clone().add(V3(0, -3, 0)), 150 - u * 85, 34 - u * 20, 2.4, 3.6, 44)(u); };   /* Hồ Gươm, Tháp Rùa — Hà Nội đầu năm 1973 */
    C['C12-02'] = (u) => [cc.clone().add(V3(55 - u * 15, 8, 40)), cc.clone().add(V3(0, 30 + u * 8, 0)), 48];
    C['C12-03'] = (u) => { const ks = [TD.td77 && TD.td77.c, P12[0] && P12[0].position, KS.migNB, ...(KS.cx ? [KS.cx[0].position] : [])].filter(Boolean); const k = Math.min(ks.length - 1, Math.floor(u * ks.length)), c = ks[k]; return c ? quanh(c.clone().setY(c.y + 4), 40, 12, k, k + 0.5, 46)((u * ks.length) % 1) : null; };
    C['C12-04'] = quanh(tam, 9000, 4000, 3.3, 3.8, 42);
    C['C12-05'] = quanh(tam, 14000, 7000, 3.8, 4.2, 42);
    C['C12-06'] = (u) => [cc.clone().add(V3(30, 6, 24)), cc.clone().add(V3(2, 38 + u * 2, 0)), 44];
    C['C12-07'] = quanh(cc.clone().setY(cc.y + 30), 1600, 500, 4.2, 5.0, 44, 2400);
  } else {
    const hn = PM('hanoi'), hp = PM('haiphong'), mid = hn.clone().lerp(hp, 0.35);
    // Cảnh 2
    C['C02-01'] = quanh(hn, 90000, 70000, 3.3, 3.5, 42);
    C['C02-02'] = theoTop((t) => [KS.c02[0], 0], -70, 6, 26, 40);
    C['C02-03'] = theoTop((t) => [KS.c02[1], 1], 220, 40, 160, 42);
    C['C02-04'] = theoTop((t) => [KS.c02[2], 2], 520, 120, -260, 44);
    C['C02-05'] = quanh(hn, 170000, 150000, 3.6, 3.75, 42);
    C['C02-06'] = (u) => { const T_ = TD.td59; if (!T_) return null; const c = T_.c.clone(); c.y += 30; return quanh(c, 700, 160, 0.4, 1.0, 46)(u); };
    C['C02-07'] = quanh(hn, 30000, 14000, 3.9, 4.3, 42);
    // Cảnh 8
    C['C08-01'] = quanh(mid, 170000, 150000, 3.1, 3.3, 42);
    C['C08-02'] = quanh(hn, 40000, 18000, 3.3, 3.7, 42);
    C['C08-03'] = (u) => { const T_ = TD.td77; if (!T_) return null; const b = T_.be[2].position; return [b.clone().add(V3(150, 70, -120)), b.clone().add(V3(-600, 900, 500)), 50]; };
    C['C08-04'] = (u) => { const c = (TD.td59 || TD.td77).c; return [V3(c.x - 1600, c.y + 300, c.z + 1800), V3(c.x + 6000, c.y + 9000, c.z - 6000), 54]; };
    C['C08-05'] = quanh(mid, 120000, 95000, 3.7, 3.9, 42);
    C['C08-06'] = quanh(hn, 22000, 9000, 3.9, 4.4, 42);
    C['C08-07'] = quanh(mid, 140000, 120000, 4.4, 4.6, 42);
    // Cảnh 9
    const yb = MIGBAY[0] ? MIGBAY[0].xp : PM('yenbai'), migCam = (j, sau, cao, ngang, fov = 44) => (u, t) => { const m = MIGBAY[j]; if (!m) return null; const v = migViTri(m, t), rv = V3(v.f.z, 0, -v.f.x);
      return [tren(v.p.clone().addScaledVector(v.f, -sau).addScaledVector(rv, ngang).add(V3(0, cao, 0)), 20), v.p.clone().addScaledVector(v.f, 400), fov]; };
    C['C09-01'] = quanh(yb.clone().setY(yb.y), 14000, 6000, 1.0, 1.4, 42);
    C['C09-02'] = (u) => { const m = MIGBAY[0]; if (!m) return null; const p = m.xp.clone().setY(hG(m.xp.x, m.xp.z)); return [p.clone().add(V3(260 - u * 80, 90, 220)), p.clone().add(V3(0, 30, 0)), 44]; };
    C['C09-03'] = theoTop((t) => [KS.c09.o27, 1], 900, 250, 700, 42);
    C['C09-04'] = migCam(0, 420, 120, 160);
    C['C09-05'] = (u, t) => { const m = MIGBAY[0]; if (!m) return null; const v = migViTri(m, t); return [V3(v.p.x + 45000, 60000, v.p.z + 50000), v.p, 40]; };
    C['C09-06'] = theoTop((t) => [KS.c09.o27, 1], 1400, 300, -1200, 46);
    C['C09-07'] = (u, t) => { const m = MIGBAY[1]; if (!m) return null; const v = migViTri(m, t); return [V3(v.p.x - 20000, 26000, v.p.z + 30000), v.p, 40]; };
    C['C09-08'] = theoTop((t) => [KS.c09.o28, 0], 1500, 350, 1100, 46);
    C['C09-09'] = migCam(1, 900, 220, -500, 46);
    C['C09-10'] = quanh(PM('hanoi').clone().lerp(PM('mocchau'), 0.6), 160000, 140000, 3.0, 3.2, 42);
  }
  for (const [id, fn] of Object.entries(C)) { const cu = SHOTS[id]; SHOTS[id] = (u, t) => { let r = null; try { r = fn(u, t); } catch (e) { r = null; } return r || (cu ? cu(u, t) : [V3(0, R * 0.4, R * 0.6), V3(0, 0, 0), 45]); }; }

  // ---------------------------------------------------------------- ghim tên khí tài, địa danh sự kiện
  GHIM_SAU.push(() => { const gx = (ten, get, dy, xa, cls = 'hero ly') => { const L = addLabel(ten, 0, 0, cls, { grp: 'hero', maxDist: xa }); L.dyn = () => { try { return get(); } catch (e) { return null; } }; L.dy = dy; };
    gx('B-52D (Không quân Mỹ)', () => (B52[0] && B52[0].visible ? B52[0].position : null), 40 * SB, HN ? 16000 : 260000, 'hero ly dich');
    gx('MiG-21 (Không quân nhân dân Việt Nam)', () => (MIG[0] && MIG[0].visible ? MIG[0].position : null), HN ? 6 : 200, HN ? 900 : 60000);
    if (MIG[1]) gx(MIGBAY[1] ? MIGBAY[1].ten : 'MiG-21', () => (MIG[1].visible && !HN ? MIG[1].position : null), 200, 60000);
    if (!HN && MIGBAY[0]) gx(MIGBAY[0].ten, () => (MIG[0].visible ? MIG[0].position : null), 260, 60000);
    for (const [k, T_] of Object.entries(TD)) if (T_.ten) gx(T_.ten + ' · tên lửa S-75', () => T_.c.clone().setY(T_.c.y + 12), 0, HN ? 9000 : 0);
    if (P12[0]) gx('Xe ra-đa (mẫu MINH HOẠ)', () => P12[0].position, 12, 3000);
    gx('Pháo cao xạ 37 mm', () => (KS.cx ? KS.cx[0].position : null), 6, 2500);
    if (HN) gx('Xe vận chuyển – nạp đạn tên lửa (TZM)', () => (KS.xt && KS.xt[0] ? KS.xt[0].o.position : null), 6, 1200);
    if (HNX.thapRua) gx('Tháp Rùa · Hồ Hoàn Kiếm', () => HNX.thapRua, 8, 1500);
    gx('Súng máy phòng không 12,7 mm (tự vệ)', () => (KS.ds ? KS.ds[0].position : null), 3, 1200);
    if (HNX.xacHT) gx('Xác B-52 · hồ Hữu Tiệp (27/12/1972)', () => (HNX.xacHT.visible ? HNX.ht : null), 12, 3000);
    if (HN && KS.c04) { const L = addLabel('Cánh đồng Chuôm, xã Phù Lỗ — B-52 đầu tiên rơi tại chỗ (18/12)', KS.c04.ph.x, KS.c04.ph.z, 'ly', { grp: 'hero', maxDist: 30000, show: () => T >= KS.c04.tHit + 10 }); L.dy = 30; }
  });
  // ---------------------------------------------------------------- âm thanh: nền theo cảnh, tiếng nổ theo sự kiện nổ, tiếng tên lửa phóng, còi báo động
  const HCMbeds = new Set(['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua']);
  window.__ks = { TL, TOP, B52, TD, BOM, viTri, MIG, MIGBAY, HNX, RADA, PHO, hG, tide: () => tideNow, KS };
  /* film: ghim địa danh chỉ hiện ở cú đại toàn (đỡ rối hình) */
  GHIM_SAU.push(() => { for (const L of labels) if (L.grp === 'key' && !L.show) L.show = () => appMode !== 'film' || shotAt(T).size === 'Đại toàn'; });
  /* anh Thắng 26/11: lồng tiếng máy bay ném bom, bom rơi, còi báo động (kho nhạc nền, tiengdong.com) — "maybaynb" là tiếng gầm của tốp máy bay khi tập kích */
  KS.amPlan = (id, t, u) => { const n = (o) => o;
    if (id === 'C01') return n({ gio: 0.28, oto: t < M('C01', 6) ? 0.15 : 0 });
    if (id === 'C02') return { gio: 0.12, maybay: 0.3, maybaynb: 0.22 };
    if (id === 'C03' || id === 'C06') return { gio: 0.15, maybay: 0.18, maybaynb: id === 'C06' ? 0.2 : 0 };
    if (id === 'C07') return { gio: 0.15, lua: t > M('C07', 5) ? 0.45 : 0, maybaynb: t > M('C07', 4) && t < M('C07', 8) ? 0.42 : 0 };
    if (id === 'C11' || id === 'C12') return { gio: 0.25 };
    if (id === 'C04') return { gio: 0.1, maybay: 0.3, lua: 0.15, maybaynb: t > M('C04', 4) ? 0.34 : 0 };
    if (id === 'C09') return { gio: 0.1, maybay: 0.3, maybaynb: 0.14 };
    return { gio: 0.1, maybay: 0.3, lua: 0.15, maybaynb: 0.32 }; };
  KS.amThem = (p, cp) => { let mb = 0; for (const o of B52) if (o.visible) mb = Math.max(mb, clamp(1 - cp.distanceTo(o.position) / (8000 * SB), 0, 1));
    for (const o of MIG) if (o.visible && o.position.y > hG(o.position.x, o.position.z) + 20) mb = Math.max(mb, clamp(1.2 - cp.distanceTo(o.position) / (HN ? 2500 : 40000), 0, 1));   /* MiG đang bay */
    p.maybay = Math.max(p.maybay || 0, 0.75 * mb);
    let xe = 0; if (KS.xt) for (const X of KS.xt) xe = Math.max(xe, clamp(1 - cp.distanceTo(X.o.position) / 380, 0, 1));   /* xe TZM chạy: tiếng nổ máy */
    for (const T_ of PHO.tau) if (T_.m.visible) xe = Math.max(xe, 0.6 * clamp(1 - cp.distanceTo(T_.m.position) / 200, 0, 1));
    p.oto = Math.max(p.oto || 0, 0.85 * xe); return p; };
  KS.amMoc = () => { const L = [], cp = camera.position, vol = (p, r) => clamp(1.15 - cp.distanceTo(p) / r, 0, 1);
    for (const e of TL) { const v = vol(e.b.position, HN ? 9000 : 90000); if (v > 0.05) L.push([e.t0, 'vut', 0.9 * v]); const tp = viTri(e.o, e.i, e.tHit), v2 = vol(tp, HN ? 14000 : 160000), tre = Math.min(3, cp.distanceTo(tp) / 340);
      if (v2 > 0.05) L.push([e.tHit + tre, 'no', 0.8 * v2]); if (e.trung) L.push([e.tHit + tre + 0.05, 'nongan', Math.max(0.45, v2)]); }   /* máy bay trúng đạn: tiếng nổ vang */
    for (const b of BOM) { if (Math.abs(b.t - T) > 30) continue; const v = vol(b.p, HN ? 9000 : 120000); if (v > 0.08 && L.length < 400) L.push([b.t + Math.min(2.5, cp.distanceTo(b.p) / 340), 'no', 0.55 * v]); }
    for (const o of TOP) for (const ch of o.chet) { const v = vol(ch.roi, HN ? 12000 : 150000); if (!ch.ngoai) { if (v > 0.05) L.push([ch.tRoi + 0.3, 'no', v]); L.push([ch.tRoi + 0.25, 'nongan', Math.max(0.4, v)]); } }   /* máy bay rơi chạm đất: nổ */
    for (const b of BV) { if (Math.abs(b.t - T) > 30) continue; const v = vol(b.p, HN ? 12000 : 150000); if (v > 0.05) L.push([b.t - 1.3, 'bomroi', Math.max(0.35, 0.95 * v)]); }   /* tiếng bom rơi rít rồi nổ, khớp loạt bom đầu */
    if (HN) L.push([M('C04', 5) - 0.5, 'coibd', 0.75], [M('C07', 5) - 2, 'coibd', 0.5]);
    return L; };
  KS.amLap = () => HN ? [[M('C04', 11), H('C04').t1, 'daibac', 0.32, 1.6, 1.4], [M('C05', 7), M('C05', 11), 'daibac', 0.3, 1.8, 1.6]] : [];
  // ================================================================== BẢO TÀNG KHÍ TÀI (V0.2, anh Thắng 26/11: "làm bảo tàng tham quan giống như của trận Khe Sanh")
  // Dựng theo khối bảo tàng của gói Khe Sanh 1968 (tools/sa_ban/khe_sanh/bao_tang_gd4.js): sân trưng bày, bục, bảng thông tin, ghim tên bấm mở thẻ có nguồn,
  // bảng thống kê số liệu hai phía, đi bộ tham quan. Chỗ đặt: khoảng ruộng phẳng, khô ngoài nội thành, xa các trận địa (dò lúc tải).
  // Thông số khí tài ghi nguồn ở từng mục (sources.json, mã B1–B9 thêm cho bảo tàng); cách bày, bục, biển là quy ước đồ hoạ.
  if (HN) {
    const RG = 300, D = 170, V0 = -66;                                             /* rộng (đông–tây), sâu (bắc–nam), mép bắc theo v */
    let BT = null, tot = 1e9;
    for (const [la, lo] of [[20.962, 105.742], [21.168, 105.742], [21.150, 105.935], [20.950, 105.930], [21.205, 105.880]]) { const p = LL(la, lo, 0); if (Math.hypot(p.x, p.z) > R - 700) continue;
      let a = -1e9, b = 1e9; for (let u = -RG / 2; u <= RG / 2; u += 15) for (let v = V0; v <= V0 + D; v += 15) { const h = hG(p.x + u, p.z + v); a = Math.max(a, h); b = Math.min(b, h); }
      const xa = Math.min(...Object.values(TD).map((T_) => Math.hypot(T_.c.x - p.x, T_.c.z - p.z)));
      if (b < tideNow + 0.6 || xa < 2500) continue; if (a - b < tot) { tot = a - b; BT = p; } }
    if (!BT) BT = LL(20.962, 105.742, 0);
    let hMax = -1e9, hMin = 1e9; for (let u = -RG / 2; u <= RG / 2; u += 10) for (let v = V0; v <= V0 + D; v += 10) { const h = hG(BT.x + u, BT.z + v); hMax = Math.max(hMax, h); hMin = Math.min(hMin, h); }
    const HF = hMax + 0.5; BT.y = HF;
    matPhang(BT.x, BT.z, 0, -RG / 2, RG / 2, -(V0 + D), -V0, HF);
    const P = (u, v, dy = 0) => V3(BT.x + u, HF + dy, BT.z + v);
    const G = new THREE.Group(); G.visible = false; scene.add(G); KS.BT = { G, BT, HF };
    const matB = (c) => new THREE.MeshLambertMaterial({ color: c });
    { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#c9c3b6'; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = '#a9a295'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(RG / 8, D / 8); tx.colorSpace = THREE.SRGBColorSpace;
      const day = HF - hMin + 2, be = new THREE.Mesh(new THREE.BoxGeometry(RG, day, D), [matB(0x9d968a), matB(0x9d968a), new THREE.MeshLambertMaterial({ map: tx }), matB(0x9d968a), matB(0x9d968a), matB(0x9d968a)]);
      be.position.set(BT.x, HF - day / 2, BT.z + V0 + D / 2); G.add(be);
      const loi = new THREE.Mesh(new THREE.PlaneGeometry(RG - 30, 7).rotateX(-Math.PI / 2), matB(0x8f6b4e)); loi.position.copy(P(0, -8, 0.02)); G.add(loi); }
    const veChu = (g, t, co, w) => { let c = co; do { g.font = `700 ${c}px system-ui, sans-serif`; c -= 2; } while (g.measureText(t).width > w && c > 10); };
    const bien = (dong, rong, cao, nen = '#2a2118', chu = '#f1e2b8') => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * cao / rong); const g = cv.getContext('2d');
      g.fillStyle = nen; g.fillRect(0, 0, cv.width, cv.height); g.strokeStyle = chu; g.lineWidth = 6; g.strokeRect(10, 10, cv.width - 20, cv.height - 20); g.fillStyle = chu; g.textAlign = 'center'; g.textBaseline = 'middle';
      dong.forEach(([t, co], i) => { veChu(g, t, co, cv.width * 0.88); g.fillText(t, cv.width / 2, cv.height * (i + 0.5) / dong.length); });
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshBasicMaterial({ map: tx }), gr = new THREE.Group();
      const a = new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), m), b = new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), m); b.rotation.y = Math.PI; b.position.z = -0.02; gr.add(a, b); return gr; };
    /* cờ: cột + lá cờ (ảnh trong gói), lá cờ phất nhẹ */
    const CO = []; const taoCo = (anh, rong, cao) => { const gr = new THREE.Group(), tru = new THREE.Mesh(cyl(0.07, 0.09, cao, 8).translate(0, cao / 2, 0), matB(0x8a8a86)); gr.add(tru);
      const tx = new THREE.TextureLoader().load(PU('props/' + anh + '.png')); tx.colorSpace = THREE.SRGBColorSpace; const fg = new THREE.PlaneGeometry(rong, rong * 2 / 3, 12, 6).translate(rong / 2, 0, 0);
      const co = new THREE.Mesh(fg, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide })); co.position.set(0.08, cao - rong / 3 - 0.1, 0); gr.add(co); CO.push([co, fg.attributes.position.array.slice()]); G.add(gr); return gr; };
    { const c = bien([['KHÔNG GIAN TRƯNG BÀY KHÍ TÀI', 74], ['HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG 1972', 50], ['Tái dựng mô phỏng · Học Lịch Sử', 36]], 24, 6.5); c.position.copy(P(-RG / 2 + 6, -8, 7.2)); c.rotation.y = -Math.PI / 2; G.add(c);
      for (const s_ of [-1, 1]) { const tru = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10.5, 0.8), matB(0x6f5a43)); tru.position.copy(P(-RG / 2 + 6, -8 + s_ * 12.4, 5.25)); G.add(tru); } }
    { const a = bien([['PHÍA VIỆT NAM', 80], ['Bộ đội Phòng không – Không quân, dân quân tự vệ Hà Nội', 40]], 16, 4, '#5c1410', '#ffe9a8'); a.position.copy(P(-RG / 2 + 16, -30, 3)); a.rotation.y = -Math.PI / 2; G.add(a);
      const b = bien([['PHÍA MỸ', 80], ['Không quân chiến lược Mỹ (B-52), không quân chiến thuật', 40]], 16, 4, '#1c3468', '#eef3ff'); b.position.copy(P(-RG / 2 + 16, 14, 3)); b.rotation.y = -Math.PI / 2; G.add(b);
      taoCo('co-qgp', 2.2, 7).position.copy(P(-RG / 2 + 16, -40)); taoCo('co-my', 2.2, 7).position.copy(P(-RG / 2 + 16, 24)); }
    // danh mục: u, v (m, đông / nam so với tâm sân), hướng, bục [dài, rộng], cao ghim, mẫu, người trên bục, thẻ
    const K = [
      { ben: 'vn', u: -120, v: -40, y: 0.2, buc: [12, 6], h: 2.6, nguoi: [['kt', 'dung', -4.2, 0], ['kt', 'chongnanh', -2, 0.4], ['kt', 'vuon', 0.2, -0.2], ['kt', 'dung', 2.4, 0.3], ['qgp', 'dung', 4.4, 0]],
        ten: 'Kíp chiến đấu tên lửa S-75', tt: [['Một tiểu đoàn', 'thường 6 bệ phóng một ray, cách nhau khoảng 60–100 m (B9)'], ['Trên sa bàn', 'mỗi bệ 5 người: 4 người thao tác, 1 người cầm súng gác']],
        ks: 'Đêm 18/12/1972 Tiểu đoàn 59 (Trung đoàn 261) bắn rơi chiếc B-52 đầu tiên rơi tại chỗ ở cánh đồng Chuôm, xã Phù Lỗ; rạng sáng 21/12 Tiểu đoàn 57 bắn rơi hai B-52 trong khoảng 10 phút.', mh: 'Quân phục, tư thế, số người trên mẫu là MINH HOẠ.', ng: ['B9', 'S5', 'S7', 'S14'] },
      { ben: 'vn', u: -84, v: -40, y: 0.4, buc: [13, 9], h: 6.5, mau: 'props/phao/s-75-be-phong.glb',
        ten: 'Bệ phóng và tên lửa S-75 (SAM-2), đạn V-750', tt: [['Đạn V-750', 'hai tầng: tầng đẩy nhiên liệu rắn, tầng hành trình nhiên liệu lỏng'], ['Dài, nặng', '10,6 m; 2.300 kg'], ['Tầm bắn', 'gần 40 km; độ cao bắn tới 25 km'], ['Đầu nổ', 'gần 200 kg thuốc nổ; tốc độ bay đạt Mach 3'], ['Bệ phóng', 'xoay 360°, nâng đạn 30–60° khi phóng']],
        ks: 'Tên lửa S-75 là vũ khí chủ yếu bắn rơi B-52 trong 12 ngày đêm. Phía Việt Nam công bố bắn rơi 81 máy bay, trong đó 34 B-52 (16 chiếc rơi tại chỗ).', ng: ['B1', 'B2', 'B3', 'S5'] },
      { ben: 'vn', u: -48, v: -40, y: 0.5, buc: [11, 7], h: 6, mau: 'props/xe/xe-ra-da.glb', nguoi: [['kt', 'dung', -3.6, 2.6], ['qgp', 'dung', 3.6, 2.8]],
        ten: 'Xe ra-đa', tt: [['Nhiệm vụ', 'phát hiện, bám mục tiêu, dẫn đường cho tên lửa, không quân, pháo cao xạ']],
        ks: 'Hơn 19 giờ ngày 18/12/1972, Đại đội ra-đa 45 (Trung đoàn 291) phát hiện ba dải nhiễu B-52; trắc thủ phải tìm mục tiêu thật giữa màn nhiễu điện tử dày đặc.', mh: 'Kiểu xe, ăng-ten trên mẫu là MINH HOẠ (mẫu anh Thắng dựng), chưa gắn với một kiểu ra-đa cụ thể.', ng: ['S9', 'S1'] },
      { ben: 'vn', u: -12, v: -40, y: 0.4, buc: [13, 6], h: 6, mau: 'props/xe/xe-tzm.glb',
        ten: 'Xe vận chuyển – nạp đạn tên lửa (TZM)', tt: [['Nhiệm vụ', 'chở đạn V-750 từ kho ra trận địa, nạp đạn lên bệ phóng']],
        ks: 'Rạng sáng 21/12/1972, Tiểu đoàn 57 bắn rơi hai B-52 trong khoảng 10 phút; xe TZM chở đạn bổ sung cho trận địa.', mh: 'Mẫu xe là MINH HOẠ (anh Thắng dựng).', ng: ['S7'] },
      { ben: 'vn', u: 28, v: -44, y: 0.3, buc: [17, 11], h: 5.2, mau: 'props/may-bay/mig-21.glb',
        ten: 'Máy bay tiêm kích MiG-21', tt: [['Tới miền Bắc', 'tháng 4/1966, biên chế Trung đoàn 921'], ['Tháng 12/1972', 'Trung đoàn 921 bay MiG-21MF']],
        ks: 'Đêm 27/12/1972 Phạm Tuân cất cánh từ sân bay Yên Bái, bắn rơi B-52 trên vùng trời Mộc Châu; đêm 28/12 Vũ Xuân Thiều cất cánh từ sân bay Cẩm Thủy, đánh trúng B-52 trên vùng trời Sơn La và hy sinh.', ng: ['B8', 'B7', 'S14', 'S16'] },
      { ben: 'vn', u: 64, v: -40, y: 0.35, buc: [10, 9], h: 3.4, mau: 'props/phao/cao-xa-37-2-nong.glb', nguoi: [['qgp', 'dung', -3.2, 2.6], ['qgp', 'dung', 3.2, 2.6]],
        ten: 'Pháo cao xạ 37 mm', tt: [['Cỡ nòng', '37 mm'], ['Bản gốc 61-K (một nòng)', 'nòng dài 2,73 m; sơ tốc 880 m/s; trần bắn tối đa khoảng 5 km']],
        ks: 'Trên sa bàn: các khẩu đội bên cầu Long Biên, quanh nội thành (vị trí MINH HOẠ).', mh: 'Mẫu là pháo 37 mm hai nòng; thông số ghi theo bản gốc một nòng 61-K.', ng: ['B5'] },
      { ben: 'vn', u: 94, v: -40, y: 0.6, buc: [8, 6], h: 2.6, mau: 'props/phao/dshk-12-7mm.glb', nguoi: [['qgp', 'dung', -2, 0.8], ['danNam1', 'dung', 2, 0.8]],
        ten: 'Súng máy phòng không 12,7 mm (DShK)', tt: [['Đạn', '12,7 × 108 mm']],
        ks: 'Tự vệ nhà máy, khối phố đặt súng 12,7 mm trên mái nhà cao (vị trí trên sa bàn MINH HOẠ).', ng: ['B6'] },
      { ben: 'my', u: -50, v: 62, y: -Math.PI / 2 + 0.2, buc: null, h: 17, mau: 'props/may-bay/b-52d.glb',
        ten: 'Máy bay ném bom chiến lược B-52D', tt: [['Sải cánh', '185 ft (khoảng 56,4 m)'], ['Dài', '156 ft (khoảng 47,5 m)'], ['Động cơ', '8 động cơ phản lực J57-P-19W'], ['Kíp bay', '6 người'], ['Mang bom (cải tiến Big Belly)', '108 quả bom thường, trong và ngoài thân'], ['Tốc độ tối đa', '650 dặm/giờ (khoảng 1.050 km/h)']],
        ks: 'Linebacker II: Mỹ huy động B-52D, B-52G từ Andersen (Guam) và U-Tapao (Thái Lan). Phía Việt Nam công bố bắn rơi 34 B-52; Không quân Mỹ ghi nhận mất 15 B-52.', ng: ['B4', 'M1', 'M2', 'S5'] },
      { ben: 'my', u: 58, v: 36, y: Math.PI - 0.4, buc: [21, 14], h: 5.5, geo: true,
        ten: 'Máy bay tiêm kích F-4 Phantom II', tt: [['Mất trong chiến dịch (phía Mỹ)', '2 chiếc']],
        ks: 'Trên sa bàn, F-4 bay hai bên tốp B-52 là MINH HOẠ.', mh: 'Mẫu F-4 dựng bằng hình khối giản lược, MINH HOẠ.', ng: ['M2'] },
    ];
    const BUC = matB(0xddd6c8), VIEN = matB(0x8c8476), chanMat = matB(0x3b342b), TEN_BEN = { vn: 'Phía Việt Nam', my: 'Phía Mỹ' };
    const bangTT = (k, i) => { const cv = document.createElement('canvas'); cv.width = 640; cv.height = 440; const g = cv.getContext('2d'), vn = k.ben === 'vn';
      g.fillStyle = '#f3ecdc'; g.fillRect(0, 0, 640, 440); g.fillStyle = vn ? '#8e1c14' : '#1c3468'; g.fillRect(0, 0, 640, 70);
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; veChu(g, k.ten, 34, 600); g.fillText(k.ten, 20, 36);
      g.fillStyle = '#3a2f22'; g.font = '600 22px system-ui, sans-serif'; g.fillText(TEN_BEN[k.ben], 20, 98);
      k.tt.slice(0, 4).forEach(([a, v], r) => { g.fillStyle = '#6b5a40'; veChu(g, a, 21, 250); g.fillText(a, 20, 150 + r * 54); g.fillStyle = '#1e1810'; veChu(g, v, 23, 340); g.fillText(v, 280, 150 + r * 54); });
      g.fillStyle = '#8a6d3b'; g.font = 'italic 600 20px system-ui, sans-serif'; g.fillText('Bấm vào bảng hoặc khí tài để xem đầy đủ, có nguồn', 20, 412);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
      const gr = new THREE.Group(), bang = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.03, 0.04), [chanMat, chanMat, chanMat, chanMat, new THREE.MeshBasicMaterial({ map: tx }), chanMat]);
      bang.position.y = 1.15; bang.rotation.x = -0.5; gr.add(bang); const chan = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), chanMat); chan.position.y = 0.5; gr.add(chan);
      const huongLoi = k.v < -8 ? 1 : -1, xa = k.buc ? k.buc[1] / 2 + 1.6 : 30, lech = k.buc ? k.buc[0] / 2 - 0.6 : 0;
      gr.position.copy(P(k.u + lech, k.v + huongLoi * xa, 0)); gr.rotation.y = huongLoi > 0 ? 0 : Math.PI; gr.userData.btK = i; G.add(gr); };
    K.forEach((k, i) => bangTT(k, i));
    const datMau = (k, o) => { o.position.copy(P(k.u, k.v, k.dy)); o.rotation.y = k.y; o.userData.btK = K.indexOf(k); G.add(o); k.o = o; if (G.visible) napSan(o); };
    for (const k of K) {
      if (k.buc) { const [a, b] = k.buc, m = new THREE.Mesh(new THREE.BoxGeometry(a, 0.5, b), [VIEN, VIEN, BUC, VIEN, VIEN, VIEN]); m.position.copy(P(k.u, k.v, 0.25)); m.userData.btK = K.indexOf(k); G.add(m); k.dy = 0.5; }
      else { const m = new THREE.Mesh(new THREE.RingGeometry(32, 33.2, 56).rotateX(-Math.PI / 2), matB(0xf0e6c8)); m.position.copy(P(k.u, k.v, 0.03)); G.add(m); k.dy = 0; }   /* B-52: vòng kẻ trên sàn */
      if (k.mau) glbLoad(k.mau).then((g) => datMau(k, g.scene.clone(true))).catch((e) => console.warn('bảo tàng', k.mau, e));
      if (k.geo) { const m = new THREE.Mesh(f4Geo, f4Mat); m.position.y = 0; const gr = new THREE.Group(); m.position.y = 2.2; gr.add(m); datMau(k, gr); } }
    DAM.push((t) => { if (!G.visible) return; for (const k of K) if (k.nguoi) { const c = Math.cos(k.y), s_ = Math.sin(k.y);
      k.nguoi.forEach(([ten, clip, a, q], i) => { const x = BT.x + k.u + a * c, z = BT.z + k.v - a * s_; dongDat(ten, clip, t, (i * 0.37) % 1, x, HF + k.dy, z, k.y + q, 1, 200 + i); }); }
      /* khách tham quan đi dạo dọc lối giữa (đồ tây, áo dài) */
      for (let i = 0; i < 10; i++) { const chieu = i % 2 ? 1 : -1, L = RG - 50, d = (((i * 37 + chieu * t * 1.1) % L) + L) % L - L / 2, x = BT.x + d, z = BT.z - 8 + (chieu > 0 ? 1.6 : -1.6);
        dongDat(i % 3 ? 'danNam' + (1 + (i % 3)) : 'danNu' + (i % 4), 'di', t, (i * 0.29) % 1, x, HF, z, chieu > 0 ? Math.PI / 2 : -Math.PI / 2, 1, 220 + i); } });
    // thẻ thông tin
    let NG = {}; fetch(PU('sources.json')).then((r) => r.json()).then((j) => { for (const x of j.sources || []) NG[x.id] = x; }).catch(() => {});
    const the_ = document.createElement('div'); the_.id = 'btThe'; the_.hidden = true; document.body.appendChild(the_);
    const moThe = (k) => { the_.classList.remove('tk'); the_.replaceChildren(); const x = document.createElement('button'); x.className = 'dong'; x.textContent = '×'; x.onclick = () => { the_.hidden = true; };
      const h = document.createElement('h3'); h.textContent = k.ten; const b = document.createElement('div'); b.className = 'ben ' + (k.ben === 'vn' ? 'qgp' : 'my'); b.textContent = TEN_BEN[k.ben];
      const tb = document.createElement('table'); for (const [a, v] of k.tt) { const r = tb.insertRow(); r.insertCell().textContent = a; r.insertCell().textContent = v; }
      const p = document.createElement('p'); p.textContent = 'Trong 12 ngày đêm: ' + k.ks; the_.append(x, h, b, tb, p);
      if (k.mh) { const m = document.createElement('p'); m.className = 'mh'; m.textContent = k.mh; the_.append(m); }
      const n = document.createElement('div'); n.className = 'src'; n.textContent = 'Nguồn: ' + k.ng.map((id) => NG[id] ? `${id} · ${NG[id].title}` : id).join('; '); the_.append(n); the_.hidden = false; };
    // bảng thống kê số liệu hai phía (cuối lối tham quan)
    const TK = { ten: 'Số liệu Chiến dịch Hà Nội – Điện Biên Phủ trên không (18 – 29/12/1972)', phu: 'Ghi rõ phía công bố và nguồn ở từng dòng; nguồn lệch nhau thì ghi cả hai',
      muc: [
        ['Kết quả theo phía Việt Nam', [['Máy bay Mỹ bị bắn rơi', '81 chiếc, trong đó 34 B-52 (16 chiếc rơi tại chỗ)', 'S5'], ['Đêm 26/12/1972', '18 máy bay, trong đó 8 B-52 (4 chiếc rơi tại chỗ)', 'S13'],
          ['Chiếc B-52 đầu tiên rơi tại chỗ', 'đêm 18/12, cánh đồng Chuôm, xã Phù Lỗ (Tiểu đoàn 59, Trung đoàn 261)', 'S5, S14']]],
        ['Theo phía Mỹ', [['B-52 bị mất', '15 chiếc', 'M2'], ['Máy bay khác bị mất', '2 F-4, 2 F-111, 1 HH-53', 'M2'], ['Lực lượng B-52', '153 chiếc ở Andersen (Guam: 55 B-52D, 98 B-52G), 54 B-52D ở U-Tapao; đêm đầu 129 chiếc', 'M1']]],
        ['Tổn thất của Hà Nội', [['Phố Khâm Thiên (đêm 26/12)', '287 người chết, 290 người bị thương, khoảng 2.000 ngôi nhà bị phá huỷ', 'S10, S11'], ['Bệnh viện Bạch Mai (đêm 21 rạng 22/12)', 'hơn 100 quả bom; 28 cán bộ, y, bác sĩ, người bệnh hy sinh', 'S12']]]],
      lech: 'Nguồn lệch nhau: số B-52 bị mất — phía Việt Nam 34 (S5), phía Mỹ 15 (M2); giờ chiếc B-52 đầu tiên rơi: 20 giờ 13 / 20 giờ 16 / 20 giờ 18 tuỳ nguồn.' };
    const moTK = () => { the_.replaceChildren(); the_.classList.add('tk'); const x = document.createElement('button'); x.className = 'dong'; x.textContent = '×'; x.onclick = () => { the_.hidden = true; };
      const h = document.createElement('h3'); h.textContent = TK.ten; const p0 = document.createElement('div'); p0.className = 'phu'; p0.textContent = TK.phu; the_.append(x, h, p0); const dung = new Set();
      for (const [tieu, dong] of TK.muc) { const h4 = document.createElement('h4'); h4.textContent = tieu; const tb = document.createElement('table');
        for (const [a, v, ng] of dong) { const r = tb.insertRow(); r.insertCell().textContent = a; const c = r.insertCell(); c.textContent = v; const sp = document.createElement('span'); sp.className = 'ng'; sp.textContent = ' [' + ng + ']'; c.append(sp); ng.split(', ').forEach((i) => dung.add(i)); }
        the_.append(h4, tb); }
      const l = document.createElement('p'); l.className = 'mh'; l.textContent = TK.lech; the_.append(l);
      const n = document.createElement('div'); n.className = 'src'; n.textContent = 'Nguồn: ' + [...dung].sort().map((id) => NG[id] ? `${id} · ${NG[id].title}` : id).join('; '); the_.append(n); the_.hidden = false; };
    KS.BT.moThe = moThe; KS.BT.moTK = moTK; KS.BT.K = K;
    const TKV = { u: 126, v: -34 };
    { const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024; const g = cv.getContext('2d');
      g.fillStyle = '#231b13'; g.fillRect(0, 0, 2048, 1024); g.strokeStyle = '#c9a24a'; g.lineWidth = 10; g.strokeRect(14, 14, 2020, 996);
      g.fillStyle = '#ffe9a8'; g.textAlign = 'center'; g.textBaseline = 'middle'; veChu(g, 'HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG', 96, 1850); g.fillText('HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG', 1024, 110);
      g.fillStyle = '#c9b88f'; veChu(g, '18 – 29.12.1972 · số liệu ghi rõ phía công bố', 46, 1700); g.fillText('18 – 29.12.1972 · số liệu ghi rõ phía công bố', 1024, 200);
      [['81', 'máy bay Mỹ bị bắn rơi', '(phía Việt Nam)'], ['34', 'B-52 bị bắn rơi', '(phía Việt Nam)'], ['15', 'B-52 bị mất', '(phía Mỹ)'], ['287', 'người chết ở Khâm Thiên', '(đêm 26/12)']].forEach(([so, a, b], i) => {
        const x = 60 + i * 482, y = 290; g.fillStyle = 'rgba(255,233,168,.08)'; g.fillRect(x, y, 446, 520); g.strokeStyle = 'rgba(201,162,74,.6)'; g.lineWidth = 4; g.strokeRect(x, y, 446, 520);
        g.fillStyle = '#f0c040'; veChu(g, so, 150, 400); g.fillText(so, x + 223, y + 170); g.fillStyle = '#f1e8d6'; veChu(g, a, 40, 410); g.fillText(a, x + 223, y + 330); veChu(g, b, 40, 410); g.fillText(b, x + 223, y + 390); });
      g.fillStyle = '#e9b44c'; veChu(g, 'Bấm vào bảng để xem đầy đủ số liệu hai bên và nguồn', 48, 1800); g.fillText('Bấm vào bảng để xem đầy đủ số liệu hai bên và nguồn', 1024, 900);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; const m = new THREE.MeshBasicMaterial({ map: tx }), gr = new THREE.Group();
      const a = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), m), b = a.clone(); b.rotation.y = Math.PI; b.position.z = -0.03; gr.add(a, b);
      const khung = new THREE.Mesh(new THREE.BoxGeometry(16.6, 8.6, 0.02), matB(0x6f5a43)); khung.position.z = -0.015; gr.add(khung);
      gr.position.copy(P(TKV.u, TKV.v, 6.2)); gr.rotation.y = -Math.PI / 2; gr.userData.btK = 'tk'; G.add(gr);
      for (const s_ of [-1, 1]) { const tru = new THREE.Mesh(new THREE.BoxGeometry(0.7, 10.6, 0.7), matB(0x6f5a43)); tru.position.copy(P(TKV.u, TKV.v + s_ * 8.6, 5.3)); tru.userData.btK = 'tk'; G.add(tru); }
      const be = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 19), [VIEN, VIEN, BUC, VIEN, VIEN, VIEN]); be.position.copy(P(TKV.u, TKV.v, 0.25)); be.userData.btK = 'tk'; G.add(be); }
    GHIM_SAU.push(() => addLabel('Bảng thống kê số liệu chiến dịch', BT.x + TKV.u, BT.z + TKV.v, 'hero ly', { grp: 'hero', maxDist: 300, yFn: () => HF + 11.6, show: () => G.visible, onClick: () => moTK() }));
    GHIM_SAU.push(() => { for (const k of K) addLabel(k.ten, BT.x + k.u, BT.z + k.v, 'hero ' + (k.ben === 'vn' ? 'ly' : 'btmy'), { grp: 'hero', maxDist: 300, yFn: () => HF + k.dy + k.h + 0.8, show: () => G.visible, onClick: () => moThe(k) }); });
    { const rc = new THREE.Raycaster(), nd = new THREE.Vector2(); let p0 = null;
      const ngoai = (e) => e.target.closest && e.target.closest('button, input, select, a, .card, #btThe, .lbl b, #joy, #runbtn');
      addEventListener('pointerdown', (e) => { p0 = ngoai(e) ? null : [e.clientX, e.clientY]; }, true);
      addEventListener('pointerup', (e) => { if (!p0 || ngoai(e) || !G.visible || Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) > 6) return;
        const r = renderer.domElement.getBoundingClientRect(); nd.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); rc.setFromCamera(nd, camera);
        for (const h of rc.intersectObject(G, true)) { if (h.distance > 260) break; let o = h.object; while (o && o.userData.btK == null && o !== G) o = o.parent; if (o && o.userData.btK != null) { if (o.userData.btK === 'tk') moTK(); else moThe(K[o.userData.btK]); e.stopPropagation(); return; } } });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') the_.hidden = true; }); }
    // hiện ở hồi cuối và khi khám phá; nút vào đi bộ; không đi xuyên bục
    let napXong = false;
    const ve = document.createElement('button'); ve.id = 'btVe'; ve.hidden = true; ve.textContent = '← Về Trang chủ'; document.body.appendChild(ve); ve.onclick = () => KS.veTrang();
    const nut = document.createElement('button'); nut.id = 'btVao'; nut.hidden = true; nut.textContent = '🏛 Vào Bảo tàng khí tài (đi bộ) →'; document.body.appendChild(nut);
    const capBT = () => { const t = T, on = appMode !== 'film' || t >= H('C12').t0 - 1.5; if (appMode !== 'film') for (const e of OV.querySelectorAll('.k.on')) e.classList.remove('on');   /* thẻ phủ của phim không đọng lại khi khám phá */
      if (on !== G.visible) { G.visible = on; if (on && !napXong) { napXong = true; napSan(G); } if (!on) the_.hidden = true; }
      if (G.visible) for (const [co, a0] of CO) { const P_ = co.geometry.attributes.position, tt = performance.now() / 1000; for (let i = 0; i < P_.count; i++) { const x = a0[i * 3]; P_.setZ(i, Math.sin(x * 2.2 - tt * 3) * 0.12 * x); } P_.needsUpdate = true; }
      const het = appMode === 'film' && !playing && t >= DUR - 0.3; nut.classList.toggle('cuoi', het); ve.hidden = !(het && !W.on && !document.getElementById('load'));
      nut.hidden = !(on && !W.on && !document.getElementById('load') && (appMode === 'film' ? t >= DUR - 0.3 && !playing : true)); nut.classList.toggle('nho', appMode !== 'film'); };
    const chanBuc = () => { if (!W.on || !G.visible) return; for (const k of K) { if (!k.buc) continue; const dx = W.pos.x - (BT.x + k.u), dz = W.pos.z - (BT.z + k.v), hx = k.buc[0] / 2 + 0.45, hz = k.buc[1] / 2 + 0.45;
      if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) placeAvatarAt(BT.x + k.u + Math.sign(dx || 1) * hx, W.pos.z); else placeAvatarAt(W.pos.x, BT.z + k.v + Math.sign(dz || 1) * hz); } }
      { const dx = W.pos.x - (BT.x + TKV.u), dz = W.pos.z - (BT.z + TKV.v); if (Math.abs(dx) < 1.95 && Math.abs(dz) < 9.95) placeAvatarAt(BT.x + TKV.u + Math.sign(dx || -1) * 1.95, W.pos.z); } };
    const lapBT = () => { try { capBT(); chanBuc(); } catch (e) {} requestAnimationFrame(lapBT); }; requestAnimationFrame(lapBT);
    nut.onclick = () => { setPlaying(false); setAppMode('explore'); flyA = null; T = clamp(H('C12').t0 + 3, 0, DUR - 0.01);   /* vào bảo tàng: trời sáng (mốc Hồi 12) */ controls.target.copy(P(-RG / 2 + 22, -8, 1.6)); camera.position.copy(controls.target).add(V3(-9, 3, 0)); setWalk(true); };
    KS.BT.vao = () => nut.onclick();
    if (QS.get('baotang') === '1') { const cho = setInterval(() => { if (!document.getElementById('load')) { clearInterval(cho); setTimeout(() => KS.BT.vao(), 400); } }, 300); }
  }
  /* nút "Bảo tàng" trong nhóm chế độ (cả hai tầng): tầng miền Bắc thì chuyển sang tầng Hà Nội rồi vào bảo tàng */
  { const md = $('modes'), b = document.createElement('button'); b.id = 'bBT'; b.setAttribute('role', 'tab'); b.textContent = '🏛 Bảo tàng'; b.title = 'Không gian trưng bày khí tài hai phía — đi bộ tham quan';
    const phim = md && md.querySelector('button[data-m="film"]'); if (md) md.insertBefore(b, phim ? phim.nextSibling : null);
    b.onclick = () => { if (HN && KS.BT && KS.BT.vao) { KS.BT.vao(); return; }
      const q = new URLSearchParams(location.search); q.set('tang', 'ha-noi'); q.set('t', (H('C12').t0 + 3).toFixed(2)); q.set('phat', '1'); q.set('baotang', '1'); q.delete('chuong'); q.delete('tiep');
      let anh = null; try { renderer.render(scene, camera); anh = renderer.domElement.toDataURL('image/jpeg', 0.82); } catch (e) {}
      if (window.parent !== window && window.parent.__doiTang) window.parent.__doiTang(q.toString(), anh); else location.search = q.toString(); };
    md && md.addEventListener('click', (e) => { const x = e.target.closest('button[data-m]'); if (x && x.dataset.m === 'explore' && W.on && KS.BT && KS.BT.G && KS.BT.G.visible && Math.hypot(W.pos.x - KS.BT.BT.x, W.pos.z - KS.BT.BT.z) < 400) setWalk(false); });
    const capNut = () => { const o = KS.BT && KS.BT.G && W.on && Math.hypot(W.pos.x - KS.BT.BT.x, W.pos.z - KS.BT.BT.z) < 400;
      b.classList.toggle('on', !!o); b.setAttribute('aria-selected', !!o); if (o && md) md.querySelectorAll('button[data-m]').forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-selected', false); });
      requestAnimationFrame(capNut); }; requestAnimationFrame(capNut); }
  /* anh Thắng 26/11: bỏ chữ "CẦN ĐỐI CHIẾU TƯ LIỆU" ở góc thẻ tên — chỗ đó đặt nút trở về Trang chủ (địa chỉ: pack.json › ui.trangChu, mặc định "/") */
  KS.veTrang = () => { const u = (PACK.ui && PACK.ui.trangChu) || '/', ngoai = window.parent !== window && window.parent.__doiTang;
    if (ngoai) { if (/^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else window.parent.__doiTang(''); } else location.href = u; };
  { const tag = document.querySelector('.card.title .tag'); if (tag) { const b = document.createElement('button'); b.id = 'btTrangChu'; b.type = 'button'; b.textContent = '⌂ Trang chủ'; b.title = 'Về Trang chủ'; b.onclick = () => KS.veTrang(); tag.replaceWith(b); } }
  /* Khám phá: nhân vật đi bộ bắt đầu trên vỉa hè phố Hàng Bông (đoạn tàu điện chạy), không đứng dưới nước */
  if (HN && PHO.duong[0]) { const q = benPhai(PHO.duong[0], PHO.duong[0].L * 0.45, 7.2, 1); KS.diBo = [q.x, q.z]; }
}
