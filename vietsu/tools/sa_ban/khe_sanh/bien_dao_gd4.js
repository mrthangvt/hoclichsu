// ================================================================== KHE SANH 1968 · biên đạo GĐ4 (bản đầu, 25/11/2026)
// Mọi vị trí công sự, số lượng hầm, hướng đường băng, lộ trình xe, số người là TÁI DỰNG MINH HOẠ trên nền nguồn ở docs/KHE_SANH_1968_TU_LIEU.md.
// Căn cứ Tà Cơn theo sơ đồ căn cứ của phía Mỹ (M32, anh Thắng gửi 25/11): đường băng ~99°, nằm phía bắc căn cứ, đầu đông vượt hàng rào; dài 1.190 m theo M11.
// Tâm đường băng đặt ở mốc OSM "Sân bay Tà Cơn" (di tích) — ƯỚC LƯỢNG, chưa đối chiếu ảnh 1968.
{
  const HOI = {}; for (const c of STORY.scenes) HOI[c.id] = c;
  const H = (id) => HOI[id] || { t0: 1e9, t1: 1e9 };
  /* GĐ5 voice: giây n trong hồi ở bản cũ (ước theo số chữ) → giây voice, nội suy theo scene.ban_do (tools/sa_ban/voice/dung_story_khe_sanh.py) */
  const tv = (id, d) => { const L = H(id).ban_do; if (!L) return H(id).t0 + d; if (d <= L[0][0]) return L[0][1] + d - L[0][0];
    for (let i = 1; i < L.length; i++) if (d <= L[i][0]) { const [a, x] = L[i - 1], [b, y] = L[i]; return x + (y - x) * (d - a) / (b - a); } const [a, x] = L[L.length - 1]; return x + d - a; };
  const mv = (k, id, d) => (MV[k] !== undefined ? MV[k] : tv(id, d));                  /* mốc theo câu đọc (story.moc), thiếu thì theo bản cũ */
  const PM = (k) => { const v = LL(MOC[k][0], MOC[k][1], 0); v.y = hG(v.x, v.z); return v; };
  const trong = (v, m = 0.96) => Math.hypot(v.x, v.z) < R * m;
  const SC = TANG === 'chien-dich' ? 4 : 1;                                  /* tầng chiến dịch rộng 66 km: phóng to xe, máy bay để còn nhìn thấy */
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const spr = (c, cong = true) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: NHOE_TEX, color: c, transparent: true, depthWrite: false, blending: cong ? THREE.AdditiveBlending : THREE.NormalBlending })); s.visible = false; scene.add(s); return s; };
  const tex = (src, xong) => { const t = new THREE.TextureLoader().load(PU(src), xong); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // nạp sẵn lên GPU (ảnh màu + hình khối) ngay khi mẫu tải xong: mẫu tải sau bước "dựng sẵn" của bản nền, nếu để tới lúc lần đầu lọt khung hình
  // thì phải nạp giữa phim (đo bằng quet_phim: xe M48 đỗ trong căn cứ làm khung 9:19 đứng 65 s trên SwiftShader)
  const napSan = (o) => { const an = [], fc = []; o.traverse((c) => { if (!c.visible) { an.push(c); c.visible = true; } if (c.frustumCulled) { fc.push(c); c.frustumCulled = false; }
      const M = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : []; for (const m of M) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) if (m[k]) try { renderer.initTexture(m[k]); } catch (e) {} });
    const v0 = o.visible; o.visible = true; const rt = new THREE.WebGLRenderTarget(1, 1), cu = renderer.getRenderTarget();
    try { renderer.setRenderTarget(rt); renderer.render(scene, camera); } catch (e) { console.warn('nạp sẵn mẫu', e); } renderer.setRenderTarget(cu); rt.dispose();
    o.visible = v0; for (const c of an) c.visible = false; for (const c of fc) c.frustumCulled = true; return o; };
  const xeTaoN = (file, o) => xeTao(file, o).then((X) => { if (X && X.obj) { if (o.co) { const sc = X.obj.scale.x || 1, c = taoCo(o.co, 1.1, 2.6, X.obj); c.scale.setScalar(1 / sc); c.position.set(-0.6 / sc, 2.0 / sc, -1.6 / sc); } napSan(X.obj); } return X; });   /* o.co: cắm cờ trên xe */   /* xe tải muộn: nạp sẵn lên GPU như veGlb */
  const veGlb = async (file, sc = 1) => { const g = await glbLoad(file); const o = g.scene.clone(true); o.scale.setScalar(sc); o.visible = false; scene.add(o); return napSan(o); };
  // dải phủ theo mặt đất (đường băng, hào, hàng rào): points [[x, z], …] toạ độ three
  const dai = (pts0, rong, mau, nang = 0.6, op = 1) => {
    const pts = []; for (let i = 0; i < pts0.length; i++) { if (i) { const [ax, az] = pts0[i - 1], [bx, bz] = pts0[i], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 6); for (let k = 1; k < n; k++) pts.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]); } pts.push(pts0[i]); }   /* chia đoạn ≤ 6 m để dải bám sát mặt đất */
    const pos = [], idx = []; let L = 0; const len = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(L); }
    pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
      for (const s of [-1, 1]) { const x = p[0] - dz * rong / 2 * s, z = p[1] + dx * rong / 2 * s; pos.push(x, hG(x, z) + nang, z); } });
    for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: mau, transparent: op < 1, opacity: op, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.renderOrder = 3; m.userData.len = len; m.userData.n = pts.length; scene.add(m); return m; };
  const hienDen = (m, u) => { const n = m.userData.n, len = m.userData.len, L = len[n - 1] * clamp(u, 0, 1); let k = 1; while (k < n - 1 && len[k] < L) k++; m.geometry.setDrawRange(0, Math.max(0, (k) * 6)); m.visible = u > 0.001; };
  const TC = PM('tacon');
  // ---------------------------------------------------------------- CỜ (V1.4, anh Thắng: căn cứ Mỹ cắm cờ Mỹ; đoàn quân, khí tài, xe Việt Nam có cờ đỏ sao vàng)
  const COTX = {}; const coTex = (ten) => COTX[ten] || (COTX[ten] = (() => { const t = new THREE.TextureLoader().load(PU('data/' + ten + '.png'), () => { for (const F of KS.CO || []) if (F.tx === t) napSan(F.g); }); t.colorSpace = THREE.SRGBColorSpace; return t; })());
  KS.CO = [];
  const taoCo = (ten, rong = 1.5, cot = 3.2, cha = null) => { const g = new THREE.Group(), tx = coTex(ten), cao = rong * (ten === 'co-my' ? 10 / 19 : 2 / 3);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.025 * cot / 3, 0.03 * cot / 3, cot, 6).translate(0, cot / 2, 0), mat(0x4a3a26)));
    const geo = new THREE.PlaneGeometry(rong, cao, 12, 4).translate(rong / 2, cot - cao / 2, 0), vai = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }));
    g.add(vai); const goc = Float32Array.from(geo.attributes.position.array); (cha || scene).add(g);
    const F = { g, vai, goc, rong, tx, ph: Math.random() * 6 }; KS.CO.push(F); return g; };
  const coBay = (t) => { for (const F of KS.CO) { if (!F.g.visible || (F.g.parent && !F.g.parent.visible)) continue; const a = F.vai.geometry.attributes.position, g0 = F.goc;   /* cờ bay: sóng chạy dọc lá cờ */
      for (let i = 0; i < a.count; i++) { const x = g0[i * 3]; a.array[i * 3 + 2] = Math.sin(x * 4.2 / F.rong - t * 5 + F.ph) * 0.09 * F.rong * (x / F.rong); } a.needsUpdate = true; } };
  KS.taoCo = taoCo; KS.coBay = coBay;
  KS.TC = TC;
  // ---------------------------------------------------------------- căn cứ Tà Cơn
  // sơ đồ M32: toạ độ điểm ảnh (900 × 500, bắc lên trên), tâm đường băng (628,5; 185,5); tỉ lệ 2,347 m/điểm ảnh để đường băng đủ 1.190 m (thước của sơ đồ: 2,18 m)
  const SD = { cx: 628.5, cy: 185.5, s: 2.347 };
  const mp = (px, py) => [TC.x + (px - SD.cx) * SD.s, TC.z + (py - SD.cy) * SD.s];                                       /* điểm ảnh sơ đồ → toạ độ three (z = nam) */
  const RW_A = mp(378, 147), RW_B = mp(879, 224);
  const RW_HUONG = Math.atan2(RW_B[0] - RW_A[0], -(RW_B[1] - RW_A[1])), fx = Math.sin(RW_HUONG), fz = -Math.cos(RW_HUONG), rx = -fz, rz = fx;   /* trục đường băng (phương vị ~99°), ngang */
  const dd = (u, v) => [TC.x + fx * u + rx * v, TC.z + fz * u + rz * v];                                                   /* toạ độ theo trục đường băng (tâm = TC) */
  KS.dd = dd; KS.rw = { fx, fz, rx, rz };
  // hàng rào ngoài cùng (dò theo sơ đồ M32: Red Sector phía tây, FOB-3 tây nam, Gray Sector phía nam, Tiểu đoàn 37 BĐQ đông nam, Blue Sector phía bắc)
  // V1.4 (anh Thắng): đầu đông đường băng (trên sơ đồ M32 vượt ra ngoài hàng rào) nay được khoanh vào trong vòng rào — MINH HOẠ
  const RAO = [[25, 50], [55, 22], [110, 8], [170, 5], [230, 18], [262, 55], [300, 92], [340, 95], [450, 82], [530, 105], [600, 127], [700, 150], [790, 172], [860, 192], [905, 214],
    [908, 240], [880, 262], [835, 282], [820, 300], [810, 340], [770, 375], [700, 375], [650, 345], [600, 310], [530, 282], [450, 318], [400, 365], [350, 435], [300, 405], [250, 365],
    [200, 330], [178, 295], [140, 285], [100, 250], [30, 210]].map(([a, b]) => mp(a, b));
  const tamRao = RAO.reduce((c, p) => [c[0] + p[0] / RAO.length, c[1] + p[1] / RAO.length], [0, 0]);
  const trongDa = (x, z, P = RAO) => { let o = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) o = !o; } return o; };
  const coGiao = (P, k) => P.map(([x, z]) => [tamRao[0] + (x - tamRao[0]) * k, tamRao[1] + (z - tamRao[1]) * k]);
  const dong = (P) => [...P, P[0]];
  const denRW = (x, z) => { const u = (x - TC.x) * fx + (z - TC.z) * fz, v = (x - TC.x) * rx + (z - TC.z) * rz; return Math.abs(u) < 640 ? Math.abs(v) : 1e9; };
  KS.RAO = RAO; KS.tamRao = tamRao;
  const CC = { bunker: [], cap: [] };
  if (trong(TC)) {
    const rwPts = []; for (let k = 0; k <= 34; k++) rwPts.push(dd(-595 + k * 35, 0));
    KS.duongBang = dai(rwPts, 26 * Math.max(1, SC / 2), 0x8c918e, TANG === 'ta-con' ? 0.12 : 0.7);               /* tấm nhôm AM-2: xám bạc */
    KS.rao = dai(dong(RAO), 9 * SC, 0x9a958a, TANG === 'ta-con' ? 0.08 : 0.4, 0.55);                              /* hàng rào dây thép gai (dải mờ) */
    KS.hao = dai(dong(coGiao(RAO, 0.95)), 4 * SC, 0x5a4630, TANG === 'ta-con' ? 0.06 : 0.5);                       /* chiến hào bên trong hàng rào */
    if (TANG === 'ta-con') {
      const r = (i, k) => rnd(i, k), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
      // sân đỗ (ô gạch chéo trên sơ đồ): đầu tây và vòng lăn giữa đường băng
      { const [x0, z0] = mp(372, 128), [x1, z1] = mp(402, 158); for (let z = z0; z <= z1; z += 12) dai([[x0, z], [x1, z]], 12, 0x7f847f, 0.1); }   /* sân đỗ đầu tây */
      { const Q = [[462, 128], [546, 128], [546, 206], [462, 206], [462, 128]].map(([a, b]) => mp(a, b)); dai(Q, 16, 0x7f847f, 0.1); }                   /* vòng lăn giữa đường băng (sơ đồ M32: viền ô gạch chéo) */
      const bao = new THREE.InstancedMesh(new THREE.BoxGeometry(7, 2.2, 4), mat(0x9c8660), 300), lieu = new THREE.InstancedMesh(new THREE.BoxGeometry(14, 3.4, 6), mat(0x4f5a3c), 46);
      // V1.5 trận địa pháo 105 mm phía Mỹ (M5: các khẩu đội của Tiểu đoàn 1, Trung đoàn 13 TQLC đặt trong căn cứ; mẫu M2A1 anh Thắng gửi 25/11).
      // Số khẩu, vị trí hai cụm, hướng bắn về các điểm cao phía tây bắc là MINH HOẠ (chưa có sơ đồ trận địa pháo). Mỗi khẩu trong một ụ bao cát tròn (ảnh T2).
      const PIT = []; for (const [px, py] of [[352, 212], [626, 232]]) for (let k = 0; k < 3; k++) { const [x, z] = mp(px + (k - 1) * 16, py + (k % 2) * 9); PIT.push([x, z]); }
      KS.PIT = PIT;
      { const u = new THREE.InstancedMesh(new THREE.TorusGeometry(4.6, 0.75, 6, 20).rotateX(Math.PI / 2), mat(0x9c8660), PIT.length), m = new THREE.Matrix4();
        PIT.forEach(([x, z], i) => { m.makeScale(1, 1.2, 1).setPosition(x, hG(x, z) + 0.55, z); u.setMatrixAt(i, m); }); scene.add(u); KS.uPhao = u;
        const ng = PM('h881s');
        veGlb('data/phao/m2a1-105mm.glb').then((o) => { KS.p105 = PIT.map(([x, z], i) => { const c = i ? o.clone(true) : o; c.position.set(x, hG(x, z), z);
          c.rotation.y = Math.atan2(ng.x - x, ng.z - z) + (i % 3 - 1) * 0.06; c.visible = true; if (i) scene.add(c); return c; }); }); }   /* mẫu M2A1: nòng theo +Z */
      let nb = 0, nl = 0; const [bx0, bz0] = mp(20, 0), [bx1, bz1] = mp(830, 440);
      for (let i = 0; i < 3000 && (nb < 300 || nl < 46); i++) {
        const x = bx0 + r(i, 1) * (bx1 - bx0), z = bz0 + r(i, 2) * (bz1 - bz0);
        if (!trongDa(x, z, coGiao(RAO, 0.92)) || denRW(x, z) < 45 || PIT.some(([px, pz]) => Math.hypot(x - px, z - pz) < 14)) continue;               /* trong vòng hào, chừa đường băng */
        const y = hG(x, z); q.setFromAxisAngle(up, RW_HUONG + (r(i, 3) - 0.5) * 0.6);
        if (r(i, 4) < 0.84 && nb < 300) { m4.compose(new THREE.Vector3(x, y + 1.0, z), q, s1); bao.setMatrixAt(nb++, m4); CC.bunker.push([x, y, z]); }
        else if (nl < 46) { m4.compose(new THREE.Vector3(x, y + 1.6, z), q, s1); lieu.setMatrixAt(nl++, m4); }
      }
      bao.count = nb; lieu.count = nl; scene.add(bao, lieu); KS.bao = bao; KS.lieu = lieu;
      // kho đạn số 1 (sơ đồ M32: đông nam đường băng — kho nổ ngày 21/1, M7) và số 2; tháp điều khiển phía bắc đường băng
      const khoTai = (px, py) => { const [kx, kz] = mp(px, py), y0 = hG(kx, kz), k = new THREE.InstancedMesh(new THREE.BoxGeometry(5, 2.5, 5), mat(0x6e6a52), 24);
        for (let i = 0; i < 24; i++) { const x = kx + (i % 6 - 2.5) * 9, z = kz + (Math.floor(i / 6) - 1.5) * 9; m4.compose(new THREE.Vector3(x, hG(x, z) + 1.3, z), q.identity(), s1); k.setMatrixAt(i, m4); }
        scene.add(k); return V3(kx, y0, kz); };
      KS.kho = khoTai(700, 250); khoTai(470, 240);
      const [tx_, tz_] = mp(565, 160); const thap = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 5).translate(0, 7, 0), mat(0x7a6f5a)); thap.position.set(tx_, hG(tx_, tz_), tz_); scene.add(thap);
      // ba xe tăng M48 ở khu Tiểu đoàn 3 xe tăng (sơ đồ M32: tây bắc căn cứ)
      veGlb('data/xe/xe-tang-m48.glb').then((o) => { KS.m48 = [0, 1, 2].map((k) => { const c = k ? o.clone(true) : o; const [x, z] = mp(252 + k * 12, 140 + (k % 2) * 10); c.position.set(x, hG(x, z), z); c.rotation.y = RW_HUONG + Math.PI * 0.75; c.visible = true; scene.add(c); return c; }); });
      KS.ghimCC = [['Kho đạn số 1', mp(700, 250)], ['Trực thăng UH-1 (Mỹ) · sân đỗ', mp(391, 141)], ['Pháo 105 mm M101A1 (M2A1) của TQLC Mỹ', mp(352, 212)], ['Tiểu đoàn 3 xe tăng (Mỹ)', mp(262, 145)], ['Tiểu đoàn 37 Biệt động quân', mp(760, 345)], ['Tháp điều khiển', mp(565, 160)]];
    }
  }
  // ---------------------------------------------------------------- nổ trong căn cứ (pháo kích), kho đạn nổ 21/1 (S7, M7)
  const NO = Array.from({ length: 24 }, (_, i) => ({ s: spr(0xff9a4a), k: spr(0x5b524a, false), i }));
  const noTai = (t, t0, t1, nhip, R0, tam = TC) => {                                /* nổ ngẫu nhiên trong vòng R0 quanh tâm */
    for (const N of NO) { const T = 3.2 + (N.i % 5) * 0.7, a = t - t0 + N.i * 0.53, c = Math.floor(a / T), u = a / T - c;
      const on = t >= t0 && t < t1 && N.i < nhip;
      N.s.visible = on && u < 0.18; N.k.visible = on && u < 0.75; if (!on) continue;
      const x = tam.x + (rnd(c, N.i) - 0.5) * 2 * R0, z = tam.z + (rnd(c, N.i + 50) - 0.5) * 2 * R0 * 0.5, y = hG(x, z);
      if (N.s.visible) { N.s.position.set(x, y + 6 * SC, z); N.s.scale.setScalar((14 + u * 120) * SC); N.s.material.opacity = 1 - u / 0.18; }
      N.k.position.set(x, y + (10 + u * 50) * SC, z); N.k.scale.setScalar((20 + u * 90) * SC); N.k.material.opacity = 0.55 * (1 - u / 0.75); } };
  const KHO_LUA = Array.from({ length: 10 }, (_, i) => ({ s: spr(i % 2 ? 0xffb050 : 0xff6a2a), k: spr(0x3f3a36, false), i }));
  const khoNo = (t, t0, t1) => { const P = KS.kho || TC;
    for (const F of KHO_LUA) { const u = clamp((t - t0) / (t1 - t0), 0, 1), on = t >= t0 && t < t1, ph = (t * (0.6 + F.i * 0.07) + F.i * 0.31) % 1;
      F.s.visible = on && u < 0.75; F.k.visible = on; if (!on) continue;
      F.s.position.set(P.x + Math.sin(F.i * 2.3) * 25, P.y + 15 + ph * 90, P.z + Math.cos(F.i * 1.7) * 25); F.s.scale.setScalar(60 + ph * 140 + (1 - u) * 90); F.s.material.opacity = (1 - ph) * (1 - u);
      F.k.position.set(P.x + Math.sin(F.i) * 40, P.y + 60 + ph * 420 + F.i * 20, P.z + Math.cos(F.i) * 40); F.k.scale.setScalar(160 + ph * 380); F.k.material.opacity = 0.5 * (1 - ph * 0.6); } };
  // ---------------------------------------------------------------- trận địa pháo Co Roc (V1.5 anh Thắng: nòng phải chĩa về đồn — mẫu M-46 có đầu nòng theo trục +Z, không xoay thêm 180°) (pháo 130, 152 mm bắn từ Lào — M12, M16; vị trí ước lượng)
  const CR = PM('coroc'), coCR = trong(CR, 0.99);
  const PHAO = [];
  if (coCR) veGlb('data/phao/m-46-130mm.glb', SC).then((o) => { for (let k = 0; k < 4; k++) { const c = k ? o.clone(true) : o, x = CR.x + (k - 1.5) * 40 * SC, z = CR.z + (k % 2) * 25 * SC;
    c.position.set(x, hG(x, z), z); c.rotation.y = Math.atan2(TC.x - x, TC.z - z); scene.add(c); PHAO.push({ o: c, loe: spr(0xffd08a), dan: spr(0xffe0a0) }); } });
  const phaoBan = (t, on) => { for (const [k, P] of PHAO.entries()) { P.o.visible = true; const ph = ((t * 0.35 + k * 0.27) % 1 + 1) % 1, ban = on && ph < 0.55;
      P.loe.visible = ban && ph < 0.05; P.dan.visible = ban;
      if (P.loe.visible) { const y = P.o.rotation.y; P.loe.position.copy(P.o.position).add(V3(Math.sin(y) * 7.6 * SC, 4.6 * SC, Math.cos(y) * 7.6 * SC)); P.loe.scale.setScalar(9 * SC); }   /* V1.5: chớp lửa ở đầu nòng (trước: giữa thân pháo, 30 m — máy cận cảnh bị chói kín) */
      if (P.dan.visible) { const u = ph / 0.55, d = V3(TC.x + Math.sin(k * 3.1 + Math.floor(t * 0.35)) * 500, TC.y, TC.z + Math.cos(k * 1.7 + Math.floor(t * 0.35)) * 250);
        P.dan.position.lerpVectors(P.o.position, d, u).y += Math.sin(Math.PI * u) * (TANG === 'ta-con' ? 2200 : 4000); P.dan.scale.setScalar(25 * SC); } } };
  // ---------------------------------------------------------------- máy bay: C-130 hạ cánh, B-52 rải bom, UH-1 (M1, M9, M10)
  const MB = {};
  veGlb('data/may-bay/c-130a.glb', SC).then((o) => { MB.c130 = o; });
  veGlb('data/may-bay/b-52d.glb', SC * (TANG === 'ta-con' ? 1 : 1)).then((o) => { MB.b52 = [o, o.clone(true), o.clone(true)]; for (const b of MB.b52) scene.add(b); });
  veGlb('data/may-bay/uh-1.glb', SC).then((o) => { MB.uh1 = [o, ...Array.from({ length: 5 }, () => o.clone(true))]; for (const b of MB.uh1) scene.add(b); });
  const datMB = (o, p, yaw, pitch = 0) => { o.visible = true; o.position.copy(p); o.rotation.set(0, yaw, 0); o.rotateX(pitch); };
  const BOM = Array.from({ length: 30 }, (_, i) => ({ s: spr(0xff8a3a), k: spr(0x6b5f52, false), i }));
  const thamBom = (t, t0, t1) => {                                                     /* rải thảm bom: dải nổ ~2 km phía tây bắc căn cứ (hướng 881 Bắc) */
    const A = PM('h881n'), B = V3(TC.x - 900, 0, TC.z - 1600); if (!trong(A, 1.2)) A.set(TC.x - 4000, 0, TC.z - 3000);
    for (const N of BOM) { const u = (t - t0) / (t1 - t0) * 1.3 - N.i / 30 * 0.3, on = u > 0 && u < 1; N.s.visible = on && u < 0.2; N.k.visible = on;
      if (!on) continue; const p = V3().lerpVectors(A, B, N.i / 29), x = p.x + (rnd(N.i, 3) - 0.5) * 300 * SC / 4, z = p.z + (rnd(N.i, 4) - 0.5) * 300 * SC / 4, y = hG(x, z);
      if (N.s.visible) { N.s.position.set(x, y + 10, z); N.s.scale.setScalar((60 + u * 600) * Math.max(1, SC / 2)); N.s.material.opacity = 1 - u / 0.2; }
      N.k.position.set(x, y + 40 + u * 260, z); N.k.scale.setScalar((120 + u * 500) * Math.max(1, SC / 2)); N.k.material.opacity = 0.5 * (1 - u); } };
  // ---------------------------------------------------------------- HỐ ĐẠN, LỬA CHÁY (V1.4, anh Thắng: "đạn bắn thì đất đai bị cày xới, đổ vỡ, cháy lửa")
  // Mỗi tiếng nổ của noTai / thamBom là một sự kiện tính trước (cùng công thức) → hố đất hiện từ lúc nổ và còn lại về sau (tua lùi vẫn đúng).
  const SU_KIEN = [];
  const lichNo = (t0, t1, nhip, R0, tam = TC, r0 = 2.2) => { for (let i = 0; i < Math.min(nhip, 24); i++) { const T_ = 3.2 + (i % 5) * 0.7;
      for (let c = 0; ; c++) { const tt = t0 - i * 0.53 + c * T_; if (tt >= t1) break; if (tt < t0) continue;
        const x = tam.x + (rnd(c, i) - 0.5) * 2 * R0, z = tam.z + (rnd(c, i + 50) - 0.5) * 2 * R0 * 0.5; SU_KIEN.push({ t: tt, x, z, r: r0 * (0.8 + rnd(c, i + 9) * 0.6), lua: rnd(c, i + 21) < 0.18 }); } } };
  const lichBom = (t0, t1) => { const A = PM('h881n'), B = V3(TC.x - 900, 0, TC.z - 1600); if (!trong(A, 1.2)) A.set(TC.x - 4000, 0, TC.z - 3000);
    for (let i = 0; i < 30; i++) { const p = V3().lerpVectors(A, B, i / 29), x = p.x + (rnd(i, 3) - 0.5) * 300 * SC / 4, z = p.z + (rnd(i, 4) - 0.5) * 300 * SC / 4;
      SU_KIEN.push({ t: t0 + (i / 30 * 0.3) / 1.3 * (t1 - t0), x, z, r: 7 * Math.max(1, SC / 2), lua: i % 4 === 0 }); } };
  KS.SU_KIEN = SU_KIEN; KS.lichNo = lichNo; KS.lichBom = lichBom;
  const HO = { mesh: null, vien: null, lua: Array.from({ length: 14 }, (_, i) => ({ s: spr(i % 2 ? 0xffa040 : 0xff6a20), k: spr(0x4a423c, false) })) };
  KS.lapHo = () => { SU_KIEN.sort((a, b) => a.t - b.t); const n = SU_KIEN.length; if (!n) return;
    const g1 = new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2), g2 = new THREE.RingGeometry(1, 1.55, 14).rotateX(-Math.PI / 2);
    const m1 = new THREE.MeshLambertMaterial({ color: 0x3b2a1c, polygonOffset: true, polygonOffsetFactor: -3 }), m2 = new THREE.MeshLambertMaterial({ color: 0x9a6a44, polygonOffset: true, polygonOffsetFactor: -3 });
    HO.mesh = new THREE.InstancedMesh(g1, m1, n); HO.vien = new THREE.InstancedMesh(g2, m2, n); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    SU_KIEN.forEach((e, i) => { m4.compose(V3(e.x, hG(e.x, e.z) + 0.07, e.z), q, V3(e.r, 1, e.r)); HO.mesh.setMatrixAt(i, m4); HO.vien.setMatrixAt(i, m4); });
    HO.mesh.count = HO.vien.count = 0; HO.mesh.renderOrder = HO.vien.renderOrder = 4; scene.add(HO.mesh, HO.vien); napSan(HO.mesh); napSan(HO.vien); };
  const hoCap = (t) => { if (!HO.mesh) return; let n = 0; const L = SU_KIEN.length; while (n < L && SU_KIEN[n].t <= t) n++; HO.mesh.count = HO.vien.count = n;
    let k = 0; for (let i = n - 1; i >= 0 && k < HO.lua.length; i--) { const e = SU_KIEN[i]; if (t - e.t > 26) break; if (!e.lua) continue;   /* lửa cháy ~26 s ở chỗ đạn rơi */
      const F = HO.lua[k++], y = hG(e.x, e.z), a = t - e.t, ph = (t * 1.7 + i * 0.37) % 1, tat = clamp(1 - a / 26, 0, 1);
      F.s.visible = F.k.visible = true; F.s.position.set(e.x, y + e.r * (0.6 + ph * 0.8), e.z); F.s.scale.setScalar(e.r * (1.6 + ph) * (0.4 + 0.6 * tat)); F.s.material.opacity = 0.85 * tat * (1 - ph * 0.5);
      F.k.position.set(e.x, y + e.r * (2 + ph * 6), e.z); F.k.scale.setScalar(e.r * (3 + ph * 5)); F.k.material.opacity = 0.35 * tat * (1 - ph); }
    for (; k < HO.lua.length; k++) HO.lua[k].s.visible = HO.lua[k].k.visible = false; };
  const DU = Array.from({ length: 8 }, (_, i) => ({ d: spr(0xe8e4d8, false), h: new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), mat(0x5c5a44)), i }));
  for (const D of DU) { D.h.visible = false; scene.add(D.h); }
  KS.DU = DU;
  const thaDu = (t, t0, t1) => { const [x0, z0] = dd(-700, 160);                     /* thả dù tiếp tế xuống bãi phía tây (MINH HOẠ) */
    for (const D of DU) { const u = clamp((t - t0 - D.i * 2.2) / 14, 0, 1), on = t >= t0 + D.i * 2.2 && t < t1;
      D.d.visible = on && u < 1; D.h.visible = on; if (!on) continue; const x = x0 + (D.i % 4) * 40 + rx * 30, z = z0 + Math.floor(D.i / 4) * 40, g = hG(x, z), y = g + (1 - u) * 420 + 1;
      D.h.position.set(x, y, z); D.d.position.set(x, y + 14, z); D.d.scale.setScalar(26); } };
  // ---------------------------------------------------------------- Làng Vây 6–7/2 (S2, S8, M12): cứ điểm, PT-76 hai hướng (tây, nam), bộ binh, cờ
  const LV = PM('langvay'), coLV = TANG === 'ta-con' && trong(LV);
  const LVX = { xe: [], ok: false };
  if (coLV) {
    const vong = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; vong.push([LV.x + Math.cos(a) * 110, LV.z + Math.sin(a) * 85]); }
    dai(vong, 6, 0x6a5232, 0.06); dai(vong.map(([x, z]) => [LV.x + (x - LV.x) * 1.25, LV.z + (z - LV.z) * 1.25]), 7, 0x9a958a, 0.08, 0.5);
    const hamLV = new THREE.InstancedMesh(new THREE.BoxGeometry(8, 2.6, 6), mat(0x8c7a58), 14); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, rr = 40 + (i % 3) * 18, x = LV.x + Math.cos(a) * rr, z = LV.z + Math.sin(a) * rr * 0.8; m4.compose(new THREE.Vector3(x, hG(x, z) + 1.2, z), q, s1); hamLV.setMatrixAt(i, m4); }
    scene.add(hamLV);
    const DT = (INST.duong && INST.duong.tc_pt76_tay) || [];
    const t0 = H('H06').t0, t1 = H('H06').t1, d = t1 - t0;
    if (DT.length > 1) { let L = 0; for (let i = 1; i < DT.length; i++) L += Math.hypot(DT[i][0] - DT[i - 1][0], DT[i][1] - DT[i - 1][1]);
      for (let k = 0; k < 3; k++) xeTaoN('data/xe/xe-tang-pt76.glb', { co: 'co-qgp', duong: DT, lich: [[t0 + d * 0.12, L - 2400 - k * 30], [t0 + d * 0.62, L - 120 - k * 30], [t1, L - 100 - k * 30]], hien: (t) => t > t0 + d * 0.1 && t < t1 + 2, lech: (k - 1) * 7, ten: 'PT-76' }).then((X) => LVX.xe.push(X)); }
    const DN = [[LV.x - 120, -(LV.z + 1600)], [LV.x - 60, -(LV.z + 700)], [LV.x - 10, -(LV.z + 110)]];          /* hướng nam: từ phía sông Sê Pôn lên (Blender y = −z) */
    for (let k = 0; k < 2; k++) xeTaoN('data/xe/xe-tang-pt76.glb', { co: 'co-qgp', duong: DN, lich: [[t0 + d * 0.18, 0], [t0 + d * 0.6, 1480 - k * 35], [t1, 1500 - k * 35]], hien: (t) => t > t0 + d * 0.15 && t < t1 + 2, lech: (k - 0.5) * 8, ten: 'PT-76' }).then((X) => LVX.xe.push(X));
    // bắn: xe tăng bắn vào cứ điểm (banTao của bản nền: chớp nòng, đạn vạch, nổ)
    for (let i = 0; i < 14; i++) { const tu = t0 + d * (0.3 + i * 0.022); banTao(tu, () => { const X = LVX.xe[i % Math.max(1, LVX.xe.length)]; return X && X.obj.visible ? X.obj.position.clone().add(V3(0, 2, 0)) : null; },
      () => V3(LV.x + Math.sin(i * 2.1) * 50, LV.y + 3, LV.z + Math.cos(i * 1.3) * 40)); }
    // cờ đỏ sao vàng cắm trên cứ điểm khi làm chủ (S2: 10 giờ 7/2 hoàn toàn làm chủ)
    const co = taoCo('co-qgp', 2.4, 7); co.position.copy(LV); co.visible = false; LVX.co = co;
    LVX.t0 = t0; LVX.t1 = t1; LVX.ok = true;
    DAM.push((t) => { if (t < t0 || t > t1 + 3 || !(ganMay(LV.x, LV.z, 1400) || LVX.xe.some((X) => X.obj.visible && ganMay(X.obj.position.x, X.obj.position.z, 900)))) return; const u = (t - t0) / d;
      for (let i = 0; i < 26; i++) { const X = LVX.xe[i % Math.max(1, LVX.xe.length)]; if (!X || !X.obj.visible) continue;             /* bộ binh bám sau xe tăng */
        const p = X.obj.position, y = X.obj.rotation.y, b = 12 + (i % 5) * 5, l = ((i * 7) % 9 - 4) * 3, x = p.x - Math.sin(y) * b + Math.cos(y) * l, z = p.z - Math.cos(y) * b - Math.sin(y) * l;
        const kh = u <= 0.62 && i % 3 === 1; dongDat('qgp', u > 0.62 ? ['ban', 'quy', 'ngam', 'nap'][i % 4] : (kh ? 'khom' : 'chay'), kh ? t * 1.85 : t, (i * 0.37) % 1, x, hG(x, z), z, y, 1, i); }   /* V1.7: một phần ba cúi khom chạy (động tác đi khom phát nhanh 1,85 lần cho khớp bước), còn lại chạy thẳng */
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, x = LV.x + Math.cos(a) * 70, z = LV.z + Math.sin(a) * 55, yaw = Math.atan2(Math.cos(a), Math.sin(a));   /* quân phòng thủ cứ điểm (mẫu lính VNCH, MINH HOẠ) */
        if (u > 0.8 && i > 3 && i % 2 === 0) continue; const tNga = t0 + d * (0.5 + (i % 6) * 0.04), chet = i % 2 === 1;      /* nửa số người trúng đạn: động tác ngã (3,4 s) rồi nằm */
        if (chet && t >= tNga) { const s_ = t - tNga; dongDat('vnch', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, x, hG(x, z), z, yaw, 1, i); }
        else dongDat('vnch', ['ban', 'quy', 'ngam', 'nap'][i % 4], t, (i * 0.29) % 1, x, hG(x, z), z, yaw, 1, i); } });
  }
  // ---------------------------------------------------------------- vây lấn Tà Cơn 10/2 – 31/3 (S1, S5, M21): chiến hào hình răng cưa tiến dần về hàng rào
  const HAO = []; KS.HAO_P = []; KS.HAO = HAO;
  if (TANG === 'ta-con' && trong(TC)) {
    const ngoai = (ang) => { let best = null, bd = 1e9; for (const [x, z] of RAO) { const a = Math.atan2(x - tamRao[0], -(z - tamRao[1])), d = Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang))); if (d < bd) { bd = d; best = [x, z]; } }
      const dx = best[0] - tamRao[0], dz = best[1] - tamRao[1], L = Math.hypot(dx, dz); return [best[0] + dx / L * 70, best[1] + dz / L * 70]; };   /* điểm ngay ngoài hàng rào theo hướng ang */
    const huong = [[-2.9, 1.9], [-2.3, 2.1], [2.7, 1.8], [-1.6, 2.2], [3.1, 2.0]];                     /* góc (rad, 0 = Bắc) và độ dài (km) — hướng nam, tây nam, tây (S1, S5, M21; hướng MINH HOẠ) */
    for (const [k, [a, l]] of huong.entries()) { const P = [], E = ngoai(a), S = [E[0] + Math.sin(a) * l * 1000, E[1] - Math.cos(a) * l * 1000];
      for (let i = 0; i <= 26; i++) { const u = i / 26, nx = Math.cos(a), nz = Math.sin(a), lech = (i % 2 ? 22 : -22) * (1 - u * 0.5);
        P.push([S[0] + (E[0] - S[0]) * u + nx * lech, S[1] + (E[1] - S[1]) * u + nz * lech]); }
      HAO.push(dai(P, 3, 0x5a4630, 0.06)); KS.HAO_P.push(P); }
    const t0 = H('H07').t0, t1 = H('H07').t1;
    DAM.push((t) => { if (t < t0 || t > t1 + 3) return; const u = clamp((t - t0) / (t1 - t0) * 1.3, 0, 1);
      HAO.forEach((m, k) => { const pos = m.geometry.attributes.position.array, n = m.userData.n, j = Math.max(1, Math.floor((n - 1) * u)) * 2 * 3;
        for (let i = 0; i < 4; i++) { const x = pos[j] + (i - 1.5) * 4, z = pos[j + 2] + (i % 2) * 3; if (!ganMay(x, z, 900)) continue; dongDat('qgp', i % 2 ? 'quy' : 'nup', t, (k * 0.3 + i * 0.21) % 1, x, hG(x, z), z, Math.atan2(TC.x - x, TC.z - z), 1, k * 4 + i); } }); });
  }
  // ---------------------------------------------------------------- mũi tên (tầng chiến dịch): Quân Giải phóng áp sát (H03, H11), Pegasus theo Đường 9 (H09 — M2, M3), chốt Làng Khoai (S13)
  const MT = [];
  if (TANG === 'chien-dich') {
    // mũi tên phẳng một khối (thân + đầu chung một lưới), không hiệu ứng, màu trắng (V1.5), đặt ở MỘT độ cao: cao hơn đỉnh địa hình dọc đường 250 m → không xuyên núi (anh Thắng 25/11)
    const muiTenPhang = (P, mau, rong) => {
      const c = new THREE.CatmullRomCurve3(P.map((v) => V3(v.x, 0, v.z))), L = c.getLength(), n = Math.max(8, Math.ceil(L / 150)), dau = Math.min(rong * 3.2, L * 0.35);
      let yMax = -1e9; for (let i = 0; i <= 60; i++) { const q = c.getPointAt(i / 60); for (const [ox, oz] of [[0, 0], [rong, 0], [-rong, 0], [0, rong], [0, -rong]]) yMax = Math.max(yMax, hG(q.x + ox, q.z + oz)); }
      const y = yMax + 250, pos = [], idx = [], uThan = 1 - dau / L, T = new THREE.Vector3();
      for (let i = 0; i <= n; i++) { const u = uThan * i / n, q = c.getPointAt(u); c.getTangentAt(u, T); const nx = -T.z, nz = T.x;
        pos.push(q.x + nx * rong / 2, y, q.z + nz * rong / 2, q.x - nx * rong / 2, y, q.z - nz * rong / 2); if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
      const q0 = c.getPointAt(uThan), q1 = c.getPointAt(1); c.getTangentAt(uThan, T); const nx = -T.z, nz = T.x, k = pos.length / 3;
      pos.push(q0.x + nx * rong * 1.25, y, q0.z + nz * rong * 1.25, q0.x - nx * rong * 1.25, y, q0.z - nz * rong * 1.25, q1.x, y, q1.z); idx.push(k, k + 1, k + 2);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));   /* V1.5 (anh Thắng): mũi tên trắng, opacity 90 % — như mũi tên mica trên sa bàn ở di tích */
      m.renderOrder = 6; m.visible = false; m.frustumCulled = false; scene.add(m); return m; };
    const L3 = (a) => a.map(([la, lo]) => LL(la, lo, 0));
    // hướng theo bản đồ "Chiến dịch Đường 9 – Khe Sanh (20.1 – 15.7.1968)" (S19): F.325 từ tây bắc vào các điểm cao 852, 845, 861; E.246 từ phía tây; F.304 từ Lào theo Đường 9 qua Làng Vây về Hướng Hoá
    // (bản đồ vẽ sơ lược nên điểm đầu là ước lượng; điểm cuối là mốc có nguồn)
    MT.push({ m: muiTenPhang(L3([[16.745, 106.615], [16.712, 106.650], [16.680, 106.684]]), 0xd2442b, 480), hoi: ['H03', 'H11'] });
    MT.push({ m: muiTenPhang(L3([[16.668, 106.575], [16.668, 106.625], [16.660, 106.672]]), 0xd2442b, 480), hoi: ['H03', 'H11'] });
    MT.push({ m: muiTenPhang(L3([[16.611, 106.540], [16.604, 106.605], [16.603, 106.660], [16.622, 106.728]]), 0xd2442b, 480), hoi: ['H03', 'H11'] });
    MT.push({ m: muiTenPhang(L3([[16.598, 106.778], [16.618, 106.777], [16.633, 106.775]]), 0xd2442b, 400), hoi: ['H09'] });   /* chốt Làng Khoai chặn Đường 9 (S13, S19; vị trí ước lượng) */
    const DP = (INST.duong && INST.duong.cd_pegasus) || [];
    if (DP.length > 1) { const pts = DP.filter((_, i) => i % 25 === 0 || i === DP.length - 1).map(([x, yb]) => V3(x, 0, -yb)); MT.push({ m: muiTenPhang(pts, 0x2b6cd2, 520), hoi: ['H09'], tien: true });
    KS.LANG_KHOAI = LL(16.633, 106.775, 0); }
    // đoàn xe Pegasus (xe tải, M48 — MINH HOẠ đội hình) và trực thăng đổ quân
    const t0 = H('H09').t0, t1 = H('H09').t1, d = t1 - t0;
    if (DP.length > 1) { let L = 0; for (let i = 1; i < DP.length; i++) L += Math.hypot(DP[i][0] - DP[i - 1][0], DP[i][1] - DP[i - 1][1]);
      for (let k = 0; k < 4; k++) xeTaoN('data/xe/xe-tang-m48.glb', { co: k ? null : 'co-my', duong: DP, sc: 1,   /* V1.4: chỉ M48 — mẫu xe tải của gói là xe Quân Giải phóng */ lich: [[t0 + d * 0.1, 0 - k * 60], [t1, L * 0.8 - k * 60]], hien: (t) => t > t0 + d * 0.1 && t < t1 + 2, ten: 'Pegasus' }); }
  }
  // ---------------------------------------------------------------- thẻ Tết Mậu Thân (H05, S16)
  const TET = document.createElement('div'); TET.id = 'theTet';
  TET.innerHTML = '<b>Tổng tiến công và nổi dậy Tết Mậu Thân 1968</b><p>Đêm 29 rạng sáng 30/1: các tỉnh ven biển miền Trung, Tây Nguyên nổ súng.</p><p>Đêm 30 rạng sáng 31/1: Sài Gòn, Huế và nhiều đô thị khác.</p><small>Nguồn: Nhân Dân (S16) · Tái dựng mô phỏng</small>';
  { const st = document.createElement('style'); st.textContent = '#theTet{position:fixed;left:max(16px,2.2vw);top:30%;max-width:min(80vw,380px);background:rgba(28,22,16,.86);color:#f3e7d2;border:1px solid rgba(226,183,104,.5);border-radius:14px;padding:14px 16px;font:15px/1.45 system-ui,sans-serif;z-index:30;opacity:0;transition:opacity .8s;pointer-events:none}#theTet b{display:block;color:#e2b768;font-size:17px;margin-bottom:6px}#theTet p{margin:4px 0}#theTet small{opacity:.7}'; document.head.append(st); document.body.append(TET); }
  // ---------------------------------------------------------------- ghim tên
  GHIM_SAU.push(() => { const gx = (ten, get, dy, xa) => { const L = addLabel(ten, 0, 0, 'hero ly', { grp: 'hero', maxDist: xa }); L.dyn = get; L.dy = dy; };
    gx('Xe tăng PT-76 · Tiểu đoàn 198 (số 555)', () => (LVX.xe[0] && LVX.xe[0].obj.visible ? LVX.xe[0].obj.position : null), 8, 3000);
    gx('Pháo 130 mm (Quân Giải phóng) · Co Roc', () => (PHAO[0] && T >= H('H04').t0 && T < H('H04').t1 ? PHAO[0].o.position : null), 30 * SC, 40000);
    gx('B-52D (Mỹ)', () => (MB.b52 && MB.b52[0].visible ? MB.b52[0].position : null), 30 * SC, 60000);
    const xeTen = (ten) => () => { const X = XE.find((x) => x.ten === ten && x.obj.visible); return X ? X.obj.position : null; };
    gx('Xe tăng M48 (Mỹ) · Pegasus', xeTen('Pegasus'), 6, 6000);
    gx('Xe vận tải (Quân Giải phóng)', xeTen('Vận tải'), 6, 6000);
    gx('Xe tăng M48 (Mỹ) · rút quân', xeTen('Rút quân'), 6, 4000);
    gx('Xe tăng M48 (Mỹ) · công binh mở đường', xeTen('Công binh'), 6, 5000);
    if (TANG === 'ta-con') gx('Xe tăng M48 (Mỹ) · Tiểu đoàn 3 xe tăng', () => (KS.m48 && KS.m48[1] ? KS.m48[1].position : null), 6, 2500);
    gx('Trực thăng UH-1 (Mỹ)', () => (MB.uh1 && MB.uh1[0].visible ? MB.uh1[0].position : (KS.UH && KS.UH[1] && KS.UH[1].visible ? KS.UH[1].position : null)), 6, 4000);
    gx('Pháo 130 mm M-46 (Quân Giải phóng)', () => (KS.PB && KS.PB[1] && KS.PB[1].visible ? KS.PB[1].position : null), 6, 3000);
    gx('C-130 (Mỹ) · tiếp tế', () => (MB.c130 && MB.c130.visible ? MB.c130.position : null), 12 * SC, 12000);
    if (KS.LANG_KHOAI) { const L = addLabel('Chốt Làng Khoai (vị trí ước lượng)', KS.LANG_KHOAI.x, KS.LANG_KHOAI.z, 'ly', { grp: 'hero', maxDist: 40000 }); L.dy = 60; }
    for (const [ten, [x, z]] of KS.ghimCC || []) { const L = addLabel(ten, x, z, 'ly', { grp: 'hero', maxDist: 3500 }); L.dy = 25; }
    if (KS.kho) gx('Kho đạn số 1 nổ (21/1/1968)', () => (T >= mv('h04_kho', 'H04', 10) && T < H('H04').t1 ? KS.kho : null), 120, 9000); });
  // ---------------------------------------------------------------- mỗi khung
  lichNo(mv('h04_phao', 'H04', 6), H('H04').t1, 16, 700); lichNo(H('H07').t0, H('H07').t1, 8, 800); lichNo(H('H08').t0, H('H08').t1, 6, 800);
  lichBom(H('H07').t0 + (H('H07').t1 - H('H07').t0) * 0.3, H('H07').t0 + (H('H07').t1 - H('H07').t0) * 0.7); lichBom(H('H08').t0 + (H('H08').t1 - H('H08').t0) * 0.1, H('H08').t0 + (H('H08').t1 - H('H08').t0) * 0.5);
  KS.lapHo();
  KS.cap = (t, dt) => { try {
    hoCap(t);
    coBay(t);
    const hz = (id) => t >= H(id).t0 && t < H(id).t1;
    // căn cứ: pháo kích hồi 4, 7, 8; kho đạn nổ hồi 4; rút quân hồi 10 (công sự thưa dần)
    noTai(t, mv('h04_phao', 'H04', 6), H('H04').t1, 16, 700); noTai(t, H('H07').t0, H('H07').t1, 8, 800); noTai(t, H('H08').t0, H('H08').t1, 6, 800);
    khoNo(t, mv('h04_kho', 'H04', 10), H('H04').t1 - 2);
    phaoBan(t, hz('H04') || hz('H07'));
    if (KS.bao) { const u = hz('H10') ? clamp((t - H('H10').t0) / (H('H10').t1 - H('H10').t0) * 1.4, 0, 1) : (t >= H('H10').t1 ? 1 : 0); KS.bao.count = Math.round(CC.bunker.length * (1 - u * 0.85)); if (KS.lieu) KS.lieu.visible = u < 0.6; }
    // máy bay
    if (MB.c130) { MB.c130.visible = false; if (hz('H08') && KS.duongBang) { const u = (t - H('H08').t0) / (H('H08').t1 - H('H08').t0);
      const s = clamp((u - 0.15) / 0.45, 0, 1), dUong = 3500 - s * 4000, h = Math.max(0, (dUong - 500) * 0.06); const [x, z] = dd(Math.max(-500, dUong), 0);
      if (u > 0.15 && u < 0.75) datMB(MB.c130, V3(x, hG(x, z) + h + 3 * SC, z), RW_HUONG + Math.PI, dUong > 500 ? -0.05 : 0); } }
    if (MB.b52) { const on = hz('H08') || hz('H07'), id = hz('H08') ? 'H08' : 'H07', u = on ? (t - H(id).t0) / (H(id).t1 - H(id).t0) : 0, u0 = id === 'H08' ? 0 : 0.2;
      MB.b52.forEach((b, k) => { b.visible = on && u > u0 && u < u0 + 0.5; if (!b.visible) return; const v = (u - u0) / 0.5, cao = TANG === 'ta-con' ? 2600 : 5200;
        const A = V3(TC.x - R * 0.9, cao, TC.z - R * 0.2 + k * 260 * SC), B = V3(TC.x + R * 0.9, cao, TC.z - R * 0.45 + k * 260 * SC); b.position.lerpVectors(A, B, v); b.rotation.set(0, Math.atan2(B.x - A.x, B.z - A.z), 0); });   /* V1.7 (anh Thắng: B-52 bay ngược): mẫu có mũi theo +Z (đo: đuôi đứng ở z = −17,5 m) */
      if (on) thamBom(t, H(id).t0 + (H(id).t1 - H(id).t0) * (u0 + 0.1), H(id).t0 + (H(id).t1 - H(id).t0) * (u0 + 0.5)); else thamBom(t, -10, -5); }
    if (MB.uh1) MB.uh1.forEach((o, k) => { o.visible = false;
      if (hz('H08') && k < 2) { const a = t * 0.12 + k * Math.PI; datMB(o, V3(TC.x + Math.sin(a) * 600, TC.y + 120 + k * 30, TC.z + Math.cos(a) * 300), Math.atan2(Math.cos(a) * 600, -Math.sin(a) * 300)); }   /* V1.7: mũi UH-1 theo +Z, hướng theo tiếp tuyến vòng bay */
 });
    thaDu(t, tv('H08', 40), H('H08').t1);
    // Làng Vây: cờ
    if (LVX.ok && LVX.co) LVX.co.visible = t >= LVX.t0 + (LVX.t1 - LVX.t0) * 0.78 && t < H('H11').t1;
    // chiến hào vây lấn mọc dần
    if (HAO.length) { const u = hz('H07') ? clamp((t - H('H07').t0) / (H('H07').t1 - H('H07').t0) * 1.3, 0, 1) : (t >= H('H07').t1 ? 1 : 0); for (const m of HAO) hienDen(m, u); }
    // mũi tên
    const arrOn = $('ly-arr').checked && $('ly-muiten').checked;
    const shNow = (id) => (H(id).shots || []).find((x) => t >= x.t0 && t < x.t1);
    for (const M of MT) { const id = M.hoi.find((h) => hz(h)), sh = id && shNow(id); const on = arrOn && !!id && (appMode !== 'film' || !sh || sh.size === 'Đại toàn' || sh.id === 'C13-03');   /* mũi tên chỉ hiện ở cảnh đại toàn, không che đoàn xe khi quay gần */ M.m.visible = on; }
    TET.style.opacity = hz('H05') && t > mv('h05_tet', 'H05', 6) && appMode === 'film' ? 1 : 0;
  } catch (e) { console.warn('KS.cap', e); } };
  Object.assign(KS, { xeTaoN, H, tv, mv, PM, mp, trongDa, LV, LVX, MB, PHAO, CR, MT, dai, veGlb, napSan, RW_HUONG, CC });   /* dùng ở phần dàn cảnh từng cú máy (dan_canh_gd4.js) */
  window.__ks = { KS, LVX, MB, PHAO, MT, XE };                              /* để kiểm tra tự động (quet_phim, chụp) */
  // ---------------------------------------------------------------- ÂM THANH (V1.4, anh Thắng: thiếu tiếng nổ, súng, pháo, lửa, máy bay, xe tăng)
  // Nền (vòng lặp): gió, súng nhỏ, xe tăng, lửa; tiếng máy bay phản lực / B-52, trực thăng tổng hợp bằng nhiễu lọc. Tiếng nổ đúng lúc từng tiếng nổ trên hình (SU_KIEN).
  KS.amPlan = (id, t, u) => { const hz = (h) => id === h;
    if (hz('H01') || hz('H11')) return { gio: 0.3 };
    if (hz('H02')) return { gio: 0.26 };
    if (hz('H03')) return { gio: 0.2 };
    if (hz('H04')) return { gio: 0.1, ak47: t > mv('h04_phao', 'H04', 6) + 2 ? 0.22 : 0, lua: t > mv('h04_kho', 'H04', 10) ? 0.45 : 0 };
    if (hz('H05')) return { gio: 0.15 };
    if (hz('H06')) return { gio: 0.08, ak47: u > 0.3 ? 0.5 : 0.08, lua: u > 0.6 ? 0.25 : 0 };
    if (hz('H07')) return { gio: 0.12, ak47: 0.18 };
    if (hz('H08')) return { gio: 0.1, ak47: 0.08, lua: u > 0.2 ? 0.2 : 0 };
    if (hz('H09')) return { gio: 0.15 };
    if (hz('H10')) return { gio: 0.2 };
    return {}; };
  KS.amThem = (p, cp) => { const gan = (o, r) => (o && o.visible ? clamp(1 - cp.distanceTo(o.position) / r, 0, 1) : 0); let mb = 0, tc = 0, xt = 0, ot = 0;
    if (MB.b52) for (const b of MB.b52) mb = Math.max(mb, gan(b, 9000)); mb = Math.max(mb, gan(MB.c130, 4000));
    for (const o of [...(MB.uh1 || []), ...(KS.UH || [])]) tc = Math.max(tc, gan(o, 2500));
    for (const X of XE) if (X.obj.visible) { const v = gan(X.obj, 700); if (/PT-76|Pegasus|Rút quân|Công binh/.test(X.ten || '')) xt = Math.max(xt, v); else ot = Math.max(ot, v); }
    if (KS.m48) for (const o of KS.m48) xt = Math.max(xt, 0.4 * gan(o, 250));
    p.maybay = Math.max(p.maybay || 0, 0.7 * mb); p.trucan = Math.max(p.trucan || 0, 0.7 * tc); p.xetang = Math.max(p.xetang || 0, 0.75 * xt); p.oto = Math.max(p.oto || 0, 0.7 * ot); return p; };
  KS.amMoc = () => { const L = [], cp = camera.position;                                 /* tiếng nổ theo từng sự kiện nổ, nhỏ dần theo khoảng cách tới máy quay */
    for (const e of SU_KIEN) { const d = Math.hypot(e.x - cp.x, e.z - cp.z), v = clamp(1.1 - d / (e.r > 5 ? 12000 : 5000), 0, 1); if (v > 0.05) L.push([e.t + Math.min(2.5, d / 340), 'no', 0.85 * v]); }
    const k = mv('h04_kho', 'H04', 10); L.push([k, 'no', 1], [k + 0.4, 'no', 0.9], [k + 0.9, 'lua', 0.7], [k + 1.6, 'no', 0.8], [k + 2.8, 'no', 0.7]);   /* kho đạn nổ 21/1 */
    for (let i = 0; i < 14; i++) L.push([H('H06').t0 + (H('H06').t1 - H('H06').t0) * (0.3 + i * 0.022), 'daibac', 0.55]);   /* PT-76 bắn */
    return L; };
  KS.amLap = () => [[mv('h04_phao', 'H04', 6) - 1, H('H04').t1, 'daibac', 0.5, 2.4, 2.0], [H('H07').t0, H('H07').t1, 'daibac', 0.35, 3.5, 3.0], [tv('H06', 6), tv('H06', 30), 'daibac', 0.4, 2.2, 2.0]];   /* pháo bắn đi (Co Roc, pháo chiến dịch) */
  // ---------------------------------------------------------------- máy quay riêng cho vài hồi (đè máy quay tạm GĐ3)
  const theoXe = (lay, sau, cao, fov = 44) => (u, t) => { const X = lay(); if (!X || !X.obj.visible) return null; const p = X.obj.position, y = X.obj.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y)), r = V3(f.z, 0, -f.x);
    return [p.clone().addScaledVector(f, -sau).addScaledVector(r, sau * 0.6).add(V3(0, cao, 0)), p.clone().addScaledVector(f, 20).add(V3(0, 2, 0)), fov]; };
  for (const sc of STORY.scenes) { if ((sc.tang || 'chien-dich') !== TANG) continue;
    sc.shots.forEach((sh, i) => { const cu = SHOTS[sh.id];
      if (sc.id === 'H04' && sh.size !== 'Cận') SHOTS[sh.id] = orbit(TC, sh.size === 'Đại toàn' ? 4200 : 1800, sh.size === 'Đại toàn' ? 2200 : 700, 3.4 + i * 0.5, 3.9 + i * 0.5, 45);
      if (sc.id === 'H06' && coLV) { const tank = (u, t) => theoXe(() => LVX.xe[0], sh.size === 'Cận' ? 14 : 45, sh.size === 'Cận' ? 4 : 18)(u, t);
        SHOTS[sh.id] = sh.size === 'Đại toàn' ? orbit(LV, 2600, 1300, 2.6 + i * 0.3, 3.0 + i * 0.3, 45) : (u, t) => tank(u, t) || orbit(LV, 700, 260, 2.4, 2.9, 45)(u); }
      if (sc.id === 'H08' && (sh.size === 'Trung' || sh.size === 'Toàn')) SHOTS[sh.id] = (u, t) => (MB.c130 && MB.c130.visible ? [MB.c130.position.clone().add(V3(-160 * rx + 60, 70, -160 * rz + 60)), MB.c130.position.clone(), 46] : (cu ? cu(u, t) : orbit(TC, 1600, 600, 2, 2.5, 45)(u)));
      if (sc.id === 'H09' && TANG === 'chien-dich' && sh.size !== 'Đại toàn') SHOTS[sh.id] = (u, t) => { const X = XE.find((x) => x.ten === 'Pegasus' && x.obj.visible); if (!X) return (cu ? cu(u, t) : orbit(TC, 9000, 5000, 2, 2.4, 45)(u));
        const p = X.obj.position, y = X.obj.rotation.y; return [p.clone().add(V3(Math.cos(y) * 1300 - Math.sin(y) * 800, 800, -Math.sin(y) * 1300 - Math.cos(y) * 800)), p.clone(), 42]; };
    }); }
}
