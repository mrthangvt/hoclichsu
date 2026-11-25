// ================================================================== KHE SANH 1968 · dàn cảnh và máy quay từng cú (GĐ4b, 25/11/2026)
// Anh Thắng 25/11: "camera cứ quay mãi vào đường băng" → mỗi cú máy trong story.json có chủ thể riêng (người, khí tài) và góc đúng cỡ cảnh
// (đại toàn / toàn / trung / cận). Vị trí tổ quân, số người, đường đi là TÁI DỰNG MINH HOẠ; mốc, đơn vị theo docs/KHE_SANH_1968_TU_LIEU.md.
{
  const { H, mp } = KS, TC = KS.TC, SCN = STORY.scenes.filter((c) => (c.tang || 'chien-dich') === TANG);
  const G = (x, z, dy = 0) => V3(x, hG(x, z) + dy, z);
  const ll = (la, lo, dy = 0) => { const v = LL(la, lo, 0); v.y = hG(v.x, v.z) + dy; return v; };
  const tren = (p, k = 3) => { const g = hG(p.x, p.z) + k; if (p.y < g) p.y = g; return p; };                     /* máy quay không chui xuống đất */
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const trong = (t, id, a = 0, b = 0) => t >= H(id).t0 - a && t < H(id).t1 + b;
  const C = {};                                                                                                   // id cú máy → hàm (u, t) → [vị trí, nhìn, fov]
  const dolly = (a, b, la, lb = la, fov = 40) => (u) => { const e = ease(u); return [tren(a.clone().lerp(b, e)), la.clone().lerp(lb, e), fov]; };
  const quanh = (c, r, h, a0, a1, fov = 42, h1) => (u) => { const [p, l, f] = orbit(c, r, h, a0, a1, fov, h1)(u); return [tren(p), l, f]; };
  const theo = (lay, sau, cao, ngang = 0, fov = 40, nhinTruoc = 6) => (u, t) => { const o = lay(t); if (!o) return null;   /* bám vật đang chạy: lay(t) → {p, yaw} */
    const f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)), r = V3(f.z, 0, -f.x);
    return [tren(o.p.clone().addScaledVector(f, -sau).addScaledVector(r, ngang).add(V3(0, cao, 0))), o.p.clone().addScaledVector(f, nhinTruoc).add(V3(0, 1.2, 0)), fov]; };
  const huong = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  // đường đi theo các điểm (toạ độ three), tốc độ v m/s, bắt đầu lúc t0 → {p, yaw}
  const diTheo = (P, v, t0, lap = false) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
    const tai = (d) => { d = clamp(d, 0, L[L.length - 1] - 0.01); let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const a = P[i - 1], b = P[i], k = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return a.clone().lerp(b, k); };
    return (t) => { let d = Math.max(0, (t - t0) * v); if (lap) d %= L[L.length - 1]; d = Math.min(d, L[L.length - 1] - 0.01);
      const p = tai(d); p.y = hG(p.x, p.z); const A = tai(d - 6), B = tai(d + 6);                                    /* hướng lấy trung bình ±6 m: không giật ở chỗ gấp khúc */
      return { p, yaw: huong(A, B), het: d >= L[L.length - 1] - 0.02 }; }; };
  // ---------------------------------------------------------------- đạo cụ cận cảnh: ụ bao cát, dây thép gai cuộn, bàn bản đồ
  const BAO = new THREE.BoxGeometry(0.62, 0.24, 0.36), baoMat = mat(0x8f7a55);
  const uBaoCat = (x, z, r, yaw = 0, mo = 0.9) => { const n = Math.round(2 * Math.PI * r / 0.6), im = new THREE.InstancedMesh(BAO, baoMat, n * 3), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = V3(1, 1, 1);   /* vòng ba lớp, chừa lối vào rộng mo rad */
    let k = 0; for (let l = 0; l < 3; l++) for (let i = 0; i < n; i++) { const a = yaw + mo / 2 + (2 * Math.PI - mo) * (i + (l % 2) * 0.5) / n, bx = x + Math.sin(a) * r, bz = z + Math.cos(a) * r;   /* mỗi bao đặt theo mặt đất tại chỗ */
      q.setFromAxisAngle(V3(0, 1, 0), a + Math.PI / 2); m4.compose(V3(bx, hG(bx, bz) + 0.12 + l * 0.24, bz), q, s1); im.setMatrixAt(k++, m4); }
    im.count = k; scene.add(im); KS.napSan(im); return im; };
  const thepGai = (a, b) => { const d = b.clone().sub(a), L = d.length(), n = Math.round(L / 0.22), pts = [];                 /* cuộn dây thép gai (concertina), bán kính 0,45 m */
    const f = d.clone().normalize(), r = V3(f.z, 0, -f.x); for (let i = 0; i <= n * 12; i++) { const u = i / (n * 12), w = u * n * Math.PI * 2;
      const p = a.clone().addScaledVector(f, u * L).addScaledVector(r, Math.cos(w) * 0.45); p.y = hG(p.x, p.z) + 0.45 + Math.sin(w) * 0.45; pts.push(p); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length, 0.012, 3), mat(0x6f6f68)); scene.add(m); KS.napSan(m); return m; };
  const banBanDo = (x, z, yaw, tx = null) => { const g = new THREE.Group(), y = hG(x, z); g.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.0).translate(0, 0.78, 0), mat(0x6a5236)));
    for (const [a, b] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06).translate(a, 0.39, b), mat(0x4d3b26)));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.01, 0.8).translate(0, 0.81, 0), tx ? [mat(0xd9ceb0), mat(0xd9ceb0), new THREE.MeshLambertMaterial({ map: tx }), mat(0xd9ceb0), mat(0xd9ceb0), mat(0xd9ceb0)] : mat(0xd9ceb0)));   /* tấm bản đồ: V1.8 vẽ bản đồ trận Khe Sanh lên mặt giấy */
    g.position.set(x, y, z); g.rotation.y = yaw; scene.add(g); KS.napSan(g); return g; };
  const hien = (o, on) => { if (o) o.visible = on; };
  // V1.5 (anh Thắng: đoàn quân hành quân phải đi trên đường đất; trận địa pháo, nơi họp bàn cũng nền đất chứ không phải cỏ xanh)
  // nền đất đỏ bazan bám theo mặt đất, mép mờ dần (màu theo đất đỏ đã tô ở mau_dat_ks.py). Vị trí, độ rộng là MINH HOẠ.
  const NANG = 0.06, DAT = new THREE.Color(0x8e5a3a);   /* V1.5b (anh Thắng: đất tới gối, tới đùi): nền chỉ nhô 6 cm, độ lệch chiều sâu nhỏ — chỉ che đế giày */
  // mép mờ bằng alphaMap theo toạ độ u; một màu đất ; vẽ hai mặt (lưới quay mặt xuống thì mặt trên bị bỏ qua — lỗi thử 25/11)
  const doc = (f) => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 2; const g = cv.getContext('2d'); for (let i = 0; i < 64; i++) { const v = Math.round(255 * f(i / 63)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i, 0, 1, 2); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
  // V1.5c (anh Thắng: đất + cỏ lốm đốm cho thật): ảnh màu tự vẽ — nền đất đỏ nhiều sắc, vạt cỏ xanh rải rác, vệt sỏi; lặp theo toạ độ phẳng 14 m
  const LOM = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'), r = rndS(91); g.fillStyle = '#8e5a3a'; g.fillRect(0, 0, 256, 256);
    const cham = (n, mau, r0, r1, a0 = 0.5) => { for (let i = 0; i < n; i++) { const x = r() * 256, y = r() * 256, rr = r0 + r() * (r1 - r0); g.globalAlpha = a0 + r() * 0.4; g.fillStyle = mau[Math.floor(r() * mau.length)];
      for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) { g.beginPath(); g.ellipse(x + dx, y + dy, rr, rr * (0.5 + r() * 0.5), r() * 3, 0, 7); g.fill(); } } };
    cham(160, ['#7d4c31', '#9a6544', '#a8714b', '#6f432b'], 4, 16, 0.35);                     /* đất nhiều sắc */
    cham(70, ['#5f7a38', '#6b8640', '#55702f', '#7a8f4a'], 3, 14, 0.55);                        /* vạt cỏ */
    cham(400, ['#4e6a2c', '#68843c'], 0.8, 2.2, 0.7);                                           /* túm cỏ nhỏ */
    cham(120, ['#b48a64', '#c29a72'], 0.6, 1.6, 0.6);                                           /* sỏi */
    g.globalAlpha = 1; const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.channel = 1; return t; })();
  const vatLieu = (am) => new THREE.MeshLambertMaterial({ map: LOM, transparent: true, alphaMap: am, side: THREE.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  const matDuong = vatLieu(doc((u) => Math.min(1, Math.min(u, 1 - u) * 5.5))), matNen = vatLieu(doc((u) => clamp((1 - u) * 4.5, 0, 1)));
  const luoiDat = (pos, col, uv, idx, m0) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); 
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); const u1 = []; for (let i = 0; i < pos.length; i += 3) u1.push(pos[i] / 14, pos[i + 2] / 14); g.setAttribute('uv1', new THREE.Float32BufferAttribute(u1, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, m0); m.renderOrder = 2; scene.add(m); KS.napSan(m); return m; };
  const nenDat = (x, z, r, sang = 0) => { const pos = [], col = [], uv = [], idx = [], N = 28, V = 6;               /* nền đất tròn bán kính r, lưới đủ mịn để bám dốc */
    for (let i = 0; i <= V; i++) for (let j = 0; j < N; j++) { const rr = r * i / V, a = j / N * Math.PI * 2, px = x + Math.sin(a) * rr * (1 + 0.12 * Math.sin(a * 3 + x)), pz = z + Math.cos(a) * rr;
      pos.push(px, hG(px, pz) + NANG, pz); const k = 1 - (0.06 * rnd(i, j)); col.push(DAT.r * k + sang, DAT.g * k + sang, DAT.b * k + sang); uv.push(i / V, 0.5); }
    for (let i = 0; i < V; i++) for (let j = 0; j < N; j++) { const a = i * N + j, b = i * N + (j + 1) % N, c = a + N, d = b + N; idx.push(a, c, b, b, c, d); }
    return luoiDat(pos, col, uv, idx, matNen); };
  const duongDat = (P, rong) => { const pts = []; for (let i = 0; i < P.length; i++) { if (i) { const a = P[i - 1], b = P[i], n = Math.ceil(a.distanceTo(b) / 5); for (let k = 1; k < n; k++) pts.push(a.clone().lerp(b, k / n)); } pts.push(P[i].clone()); }
    const pos = [], col = [], uv = [], idx = [], Wd = [-1, -0.5, 0, 0.5, 1];                                          /* 5 vệt ngang: mép mờ, lòng đường đậm */
    pts.forEach((p, i) => { const A = pts[Math.max(0, i - 1)], B = pts[Math.min(pts.length - 1, i + 1)]; let dx = B.x - A.x, dz = B.z - A.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
      Wd.forEach((w, j) => { const x = p.x - dz * w * rong / 2, z = p.z + dx * w * rong / 2, k = 1 - 0.08 * rnd(i, j) + (j === 2 ? 0.05 : 0); pos.push(x, hG(x, z) + NANG, z); col.push(DAT.r * k, DAT.g * k, DAT.b * k); uv.push(j / 4, 0.5); }); });
    for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < 4; j++) { const a = i * 5 + j; idx.push(a, a + 5, a + 1, a + 1, a + 5, a + 6); }
    return luoiDat(pos, col, uv, idx, matDuong); };
  KS.nenDat = nenDat; KS.duongDat = duongDat;
  // V1.5c (anh Thắng: thêm vài cái cây tô điểm cảnh hành quân): cây thấp và bụi tre hai bên đường mòn, quanh nơi họp, trận địa pháo — MINH HOẠ
  const CAYM = new THREE.MeshLambertMaterial({ vertexColors: true }), CAYS = [];
  const cayVen = (P, dai, buoc = 7, xa0 = 7, xa1 = 28, seed = 5) => { const r = rndS(seed), out = []; let L = 0;
    for (let i = 1; i < P.length && L < dai; i++) { const a = P[i - 1], b = P[i], d = a.distanceTo(b), f = V3(b.x - a.x, 0, b.z - a.z).normalize(), n = V3(f.z, 0, -f.x);
      for (let k = 0; k < d && L + k < dai; k += buoc) for (const sg of [-1, 1]) { if (r() > 0.55) continue; const q = a.clone().lerp(b, k / d).addScaledVector(n, sg * (xa0 + r() * (xa1 - xa0))).addScaledVector(f, (r() - 0.5) * buoc); out.push([q.x, q.z, r()]); }
      L += d; }
    return out; };
  const trongCay = (ds) => { const nC = ds.filter((c) => c[2] < 0.7).length, A = new THREE.InstancedMesh(treeGeo, CAYM, Math.max(1, nC)), B = new THREE.InstancedMesh(groveGeo, CAYM, Math.max(1, ds.length - nC)), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let ia = 0, ib = 0; for (const [x, z, k] of ds) { const sc = 0.5 + (k * 7.3 % 1) * 0.32; q.setFromAxisAngle(V3(0, 1, 0), k * 40); m4.compose(V3(x, hG(x, z) - 0.3, z), q, V3(sc, sc * (0.9 + (k * 3.1 % 1) * 0.25), sc));
      if (k < 0.7) A.setMatrixAt(ia++, m4); else B.setMatrixAt(ib++, m4); }
    A.count = ia; B.count = ib; scene.add(A, B); KS.napSan(A); KS.napSan(B); CAYS.push(A, B); return [A, B]; };
  const vongCay = (c, r0, r1, n, seed) => { const r = rndS(seed); return Array.from({ length: n }, (_, i) => { const a = (i + r() * 0.6) / n * Math.PI * 2, rr = r0 + r() * (r1 - r0); return [c.x + Math.sin(a) * rr, c.z + Math.cos(a) * rr, r()]; }); };
  // tổ người: danh sách [dx, dz (m, theo hướng yaw của tổ), động tác, quay thêm] quanh tâm
  const toNguoi = (ten, tam, yaw, ds, t, sc = 1) => { const c = Math.cos(yaw), s = Math.sin(yaw);
    ds.forEach(([a, b, clip, q = 0], i) => { const x = tam.x + a * c + b * s, z = tam.z - a * s + b * c, kn = clip === 'khomNhanh'; dongDat(ten, kn ? 'khom' : clip, kn ? t * 1.85 : t, (i * 0.37) % 1, x, hG(x, z), z, yaw + q, sc, i); }); };   /* 'khomNhanh': cúi khom chạy theo đội (V1.7) */
  const hang = (n, cot, gian = 2.2) => Array.from({ length: n }, (_, i) => [(i % cot - (cot - 1) / 2) * gian + ((i * 7) % 3 - 1) * 0.3, -Math.floor(i / cot) * gian]);   /* đội hình hàng dọc */
  const DUNG = [];                                                                                                // đạo cụ chỉ hiện trong một khoảng thời gian: [vật, t0, t1]
  DAM.push((t) => { for (const [o, a, b] of DUNG) o.visible = t >= a && t < b; });
  const MAY = (id, fn) => { if (SCN.some((c) => c.shots.some((s) => s.id === id))) C[id] = fn; };

  // V1.6 (anh Thắng: trực thăng có hiệu ứng cánh quạt quay; để trực thăng trên đường băng Tà Cơn để nhận diện)
  // Mẫu UH-1 (Tripo) có cánh quạt chính đúc liền thân, nằm dọc thân máy: bỏ các tam giác cánh quạt (cao sát nóc, xa trục > 0,55 m) — làm một lần trên hình khối dùng chung —
  // rồi gắn cụm cánh quạt dựng bằng mã: hai lá dài 14,6 m (đường kính cánh quạt UH-1H, M40) + đĩa mờ khi quay. Tốc độ quay hiển thị ~1,3 vòng/s (thật ~5 vòng/s sẽ nhấp nháy).
  const QUAT = [], laMat = new THREE.MeshLambertMaterial({ color: 0x2f302b }), boMat = new THREE.MeshBasicMaterial({ color: 0x2a2a24, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  const bongMat = new THREE.MeshBasicMaterial({ color: 0x2f302b, transparent: true, opacity: 0.25, depthWrite: false });
  const canhQuat = (o, sp = 1) => { if (!o || o.userData.quat) return; o.updateMatrixWorld(true); const inv = o.matrixWorld.clone().invert(), v = new THREE.Vector3(); let me = null; o.traverse((m) => { if (m.isMesh && !me) me = m; }); if (!me) return;
    const M = inv.clone().multiply(me.matrixWorld), g = me.geometry, P = g.attributes.position, n = P.count, Y = new Float32Array(n), X = new Float32Array(n), Z = new Float32Array(n); let ym = -1e9;
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(P, i).applyMatrix4(M); X[i] = v.x; Y[i] = v.y; Z[i] = v.z; if (v.y > ym) ym = v.y; }
    const zs = []; for (let i = 0; i < n; i++) if (Y[i] > ym - 0.3 && Math.abs(X[i]) < 0.45) zs.push(Z[i]); zs.sort((a, b) => a - b); const hz = zs.length ? zs[zs.length >> 1] : 0;
    if (!g.userData.boQuat) { g.userData.boQuat = 1; const I = g.index ? g.index.array : Array.from({ length: n }, (_, i) => i), giu = [];
      for (let t = 0; t < I.length; t += 3) { const a = I[t], b = I[t + 1], c = I[t + 2], cy = (Y[a] + Y[b] + Y[c]) / 3, cx = (X[a] + X[b] + X[c]) / 3, cz = (Z[a] + Z[b] + Z[c]) / 3;
        if (cy > ym - 0.45 && Math.hypot(cx, cz - hz) > 0.55) continue; giu.push(a, b, c); }
      g.setIndex(giu); }
    const q = new THREE.Group(); q.position.set(0, ym - 0.12, hz); const s = 1 / (o.scale.x || 1);
    const la = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.06, 0.36), laMat); q.add(la);
    for (const k of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.04, 0.36), bongMat); b.rotation.y = k * 0.22; q.add(b); }   /* vệt mờ theo chiều quay */
    const dia = new THREE.Mesh(new THREE.CircleGeometry(7.3, 40).rotateX(-Math.PI / 2), boMat); q.add(dia);
    const tru = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 8), laMat); tru.position.y = -0.2; q.add(tru);
    o.add(q); o.userData.quat = { q, sp, bong: q.children.slice(1, 4) }; QUAT.push(o); };
  KS.canhQuat = canhQuat;
  let tq = performance.now(); const quay = () => { const now = performance.now(), dt = Math.min(0.1, (now - tq) / 1000); tq = now;
    if (KS.MB && KS.MB.uh1) for (const o of KS.MB.uh1) canhQuat(o, 1); for (const o of KS.UH || []) canhQuat(o, 1); if (KS.BT && KS.BT.K) for (const k of KS.BT.K) if (k.o && /UH-1/.test(k.ten)) canhQuat(k.o, 0);
    for (const o of QUAT) { const Q = o.userData.quat; if (!o.visible) continue; const on = Q.sp > 0; for (const b of Q.bong) b.visible = on; Q.q.rotation.y += dt * Q.sp * Math.PI * 2 * 1.3; }
    requestAnimationFrame(quay); };
  requestAnimationFrame(quay);
  // trực thăng đỗ ở sân đỗ đầu tây đường băng Tà Cơn, cánh quạt quay — để nhận diện (số chiếc, chỗ đỗ: MINH HOẠ)
  if (TANG === 'ta-con') glbLoad('data/may-bay/uh-1.glb').then((g) => { [[384, 133, 0.15], [398, 150, -0.1]].forEach(([px, py, dy], k) => { const [x, z] = mp(px, py), o = g.scene.clone(true);
      o.position.set(x, hG(x, z) + 0.05, z); o.rotation.y = KS.RW_HUONG + Math.PI / 2 + dy; scene.add(o); KS.napSan(o); canhQuat(o, 1); DUNG.push([o, 0, H('H12').t0 - 1]); }); });
  if (TANG === 'ta-con') {
    // ---------------------------------------------------------------- ụ gác cận cảnh ở tuyến hàng rào phía bắc (Blue Sector, sơ đồ M32)
    const [gx, gz] = mp(470, 96), GAC = G(gx, gz), yawBac = KS.RW_HUONG - Math.PI / 2;                          /* mặt ụ nhìn ra phía bắc, ngoài hàng rào */
    uBaoCat(gx, gz, 2.4, yawBac, 1.0);
    const [wa, wza] = mp(440, 82), [wb, wzb] = mp(505, 92); thepGai(V3(wa, 0, wza), V3(wb, 0, wzb));
    const [wc, wzc] = mp(440, 76), [wd, wzd] = mp(505, 86); thepGai(V3(wc, 0, wzc), V3(wd, 0, wzd));
    // hầm chỉ huy tiểu đoàn và ụ bên đường băng (cảnh lính Mỹ trong hầm)
    const [hx, hz_] = mp(560, 232), HAM = G(hx, hz_); uBaoCat(hx, hz_, 3.2, 0, 0.7); uBaoCat(hx + 9, hz_ + 3, 2.6, 1.2, 0.8);
    // V1.4 cờ: cờ Mỹ ở khu chỉ huy Trung đoàn 26 TQLC (sơ đồ M32: 26th Rgt COC) và ở ụ gác; cờ đỏ sao vàng ở trận địa pháo Co Roc
    { const [x, z] = mp(585, 250), c = KS.taoCo('co-my', 1.9, 7); c.position.set(x, hG(x, z), z); DUNG.push([c, 0, H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.5]); }   /* hạ cờ khi rút */
    { const c = KS.taoCo('co-my', 1.2, 4); c.position.set(GAC.x + 2.5, GAC.y, GAC.z + 1.5); DUNG.push([c, 0, H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.4]); }
    if (KS.CR) { const c = KS.taoCo('co-qgp', 1.4, 4); c.position.set(KS.CR.x + 8, hG(KS.CR.x + 8, KS.CR.z - 30), KS.CR.z - 30); }
    // đường tuần tra trong hào phía bắc
    const TUAN = [mp(330, 102), mp(400, 92), mp(450, 90), mp(530, 112), mp(600, 133)].map(([x, z]) => G(x, z));
    const tuan = diTheo(TUAN, 0.97, H('H02').t0 + 20);                                /* 0,97 m/s: nhịp bước của động tác Rifle Walk (Mixamo) */
    const tuan10 = diTheo(TUAN.slice().reverse(), 0.97, H('H10').t0 + 40);
    // các điểm cao có quân Mỹ (M5, M25): ụ bao cát và vài người trên đỉnh
    const DOI = ['h881s', 'h861', 'h861a', 'h558', 'h950'].filter((k) => MOC[k]).map((k) => { const v = KS.PM(k); uBaoCat(v.x, v.z, 4, 0, 0.6); uBaoCat(v.x + 12, v.z - 6, 3, 2, 0.6); return v; });
    for (const v of DOI) { const c = KS.taoCo('co-my', 1.2, 4); c.position.set(v.x + 3, hG(v.x + 3, v.z + 2), v.z + 2); }   /* cờ Mỹ trên các điểm cao có TQLC đóng (M5) */
    // Co Roc: kíp pháo Quân Giải phóng quanh 4 khẩu 130 mm (pháo đã đặt ở bien_dao_gd4.js)
    { let n = 0; const cho = () => { if (KS.PHAO && KS.PHAO.length && !n) { n = 1; for (const P of KS.PHAO) nenDat(P.o.position.x, P.o.position.z, TANG === 'ta-con' ? 11 : 38); } else if (!n) setTimeout(cho, 500); }; cho(); }   /* nền đất quanh từng khẩu (V1.5) */
    DAM.push((t) => { if (!(trong(t, 'H04', 3, 3) || trong(t, 'H07', 3, 3))) return;
      for (const [k, P] of KS.PHAO.entries()) { const o = P.o; if (!ganMay(o.position.x, o.position.z, 1500)) continue; const y = o.rotation.y;   /* hướng nòng (về căn cứ); kíp pháo đứng sau càng pháo */
        toNguoi('qgp', o.position, y, [[-1.8, -3.9, 'quy'], [1.7, -4.3, 'dung'], [0, -5.6, 'nem'], [2.8, -1.2, 'quansat', -0.6]], t + k * 0.3); } });
    // H02, H10: lính Mỹ tuần tra, gác
    DAM.push((t) => { const on2 = trong(t, 'H02'), on10 = trong(t, 'H10');
      if (on2 || on10) { const f = on2 ? tuan : tuan10, o = f(t); if (ganMay(o.p.x, o.p.z, 700)) toNguoi('my', o.p, o.yaw, hang(6, 2, 2.6).map(([a, b]) => [a, b, o.het ? 'dung' : 'di']), t);
        if (ganMay(GAC.x, GAC.z, 600)) toNguoi('my', GAC, yawBac, on10 && t > H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.3 ? [] : [[-0.8, 0.6, 'nup'], [0.9, 0.4, 'ngam'], [0, -1.2, 'dung']], t); }
      if (on2 || trong(t, 'H01')) for (const [k, v] of DOI.entries()) if (ganMay(v.x, v.z, 900)) toNguoi('my', v, k, [[-1.2, 0.5, 'ngam'], [1.4, 0.2, 'dung'], [0, -2, 'nup', 1]], t); });
    // H04: lính Mỹ chạy vào công sự khi bị pháo kích, kho đạn cháy
    // V1.6 (anh Thắng: lính Mỹ chạy vào công sự không được đi xuyên bức tường bao cát — nhảy qua): tính chỗ đường chạy cắt vòng bao cát (bán kính 3,2 m)
    const VUOT4 = Array.from({ length: 12 }, (_, i) => { const a = G(HAM.x + 20 + (i % 4) * 4, HAM.z - 15 + Math.floor(i / 4) * 5), b = G(HAM.x + (i % 3 - 1) * 1.4, HAM.z + (Math.floor(i / 3) % 2) * 1.2);
      const L = Math.hypot(b.x - a.x, b.z - a.z); let dc = L; for (let k = 0; k <= 400; k++) { const q = k / 400, x = a.x + (b.x - a.x) * q, z = a.z + (b.z - a.z) * q; if (Math.hypot(x - HAM.x, z - HAM.z) < 3.35) { dc = q * L; break; } }
      return { dc, t0: H('H04').t0 + 52 + i * 0.4 }; });
    const CHAY4 = Array.from({ length: 12 }, (_, i) => { const a = G(HAM.x + 20 + (i % 4) * 4, HAM.z - 15 + Math.floor(i / 4) * 5), b = G(HAM.x + (i % 3 - 1) * 1.4, HAM.z + (Math.floor(i / 3) % 2) * 1.2); return diTheo([a, b], 2.7, H('H04').t0 + 52 + i * 0.4); });                 /* 2,7 m/s: nhịp bước Rifle Run */
    DAM.push((t) => { if (!trong(t, 'H04') || !ganMay(HAM.x, HAM.z, 600)) return;
      CHAY4.forEach((f, i) => { const o = f(t), v = VUOT4[i], d = (t - v.t0) * 2.7, u = (d - v.dc + 1.5) / 2.7;
        if (!o.het && u > 0 && u < 1 && i !== 7) { const C = DONG.my && DONG.my.clips.nhay;   /* tới bờ ụ bao cát: nhảy qua (động tác "jump forward"), nhấc người qua bức tường cao ~0,7 m */
          if (C) { dongDat('my', 'nhay', u * 0.999 * C.frames.length / C.fps, 0, o.p.x, o.p.y + Math.sin(Math.PI * u) * 0.55, o.p.z, o.yaw, 1, i); return; } }
        if (i === 7) { const tn = v.t0 + 4.5; if (t >= tn) { const q = f(tn), s_ = t - tn; dongDat('my', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, q.p.x, q.p.y, q.p.z, q.yaw, 1, i); return; } }   /* V1.7: một lính Mỹ trúng pháo, ngã trước khi tới ụ */
        const kh = !o.het && i % 4 === 1; dongDat('my', o.het ? (i % 3 ? 'quy' : 'nap') : (kh ? 'khom' : 'chay'), kh ? t * 2.1 : t, i * 0.31 % 1, o.p.x, o.p.y, o.p.z, o.het ? Math.PI + i : o.yaw, 1, i); }); });
    // H06 thêm mũi bộ binh từ phía bắc (cBB2 trên sơ đồ trận Làng Vây, S18)
    const LV = KS.LV, BB = diTheo([G(LV.x + 20, LV.z - 230), G(LV.x + 10, LV.z - 140), G(LV.x, LV.z - 60)], 2.7, H('H06').t0 + (H('H06').t1 - H('H06').t0) * 0.3);
    const tNgaBB = H('H06').t0 + (H('H06').t1 - H('H06').t0) * 0.5, oNga = BB(tNgaBB), dNga = hang(10, 3, 3)[4];   /* V1.7 (anh Thắng: có cảnh bộ đội hy sinh): chiến sĩ thứ 5 trúng đạn giữa đường xung phong, nằm lại */
    DAM.push((t) => { if (!trong(t, 'H06') || !ganMay(LV.x, LV.z, 1500)) return; const o = BB(t);
      toNguoi('qgp', o.p, o.yaw, hang(10, 3, 3).map(([a, b], i) => [a, b, o.het ? (i % 3 ? 'ban' : 'quy') : (i % 3 === 1 ? 'khomNhanh' : 'chay')]).filter((_, i) => !(i === 4 && t >= tNgaBB)), t);
      if (t >= tNgaBB) { const s_ = t - tNgaBB, c = Math.cos(oNga.yaw), sn = Math.sin(oNga.yaw), x = oNga.p.x + dNga[0] * c + dNga[1] * sn, z = oNga.p.z - dNga[0] * sn + dNga[1] * c; dongDat('qgp', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, x, hG(x, z), z, oNga.yaw, 1, 4); } });
    { const c = KS.taoCo('co-qgp', 1.0, 2.6); c.visible = false; DAM.push((t) => { c.visible = trong(t, 'H06'); if (!c.visible) return; const o = BB(t); c.position.set(o.p.x + Math.cos(o.yaw) * 0.6, o.p.y + 0.2, o.p.z - Math.sin(o.yaw) * 0.6); c.rotation.y = o.yaw - Math.PI / 2; }); }   /* cờ đi đầu mũi bộ binh */
    // H07: bộ đội dọc chiến hào vây lấn (đào, chuyển đạn, quan sát), một tổ cứu thương; lính Mỹ trong ụ
    const HP = (KS.HAO_P || []).map((P) => P.map(([x, z]) => G(x, z)));
    const HL = HP.map((P) => { let L = 0; for (let i = 1; i < P.length; i++) L += P[i].distanceTo(P[i - 1]); return L; });
    const tienHao = (t) => (trong(t, 'H07') ? clamp((t - H('H07').t0) / (H('H07').t1 - H('H07').t0) * 1.3, 0, 1) : t >= H('H07').t1 ? 1 : 0);
    const diemHao = (k, u) => { const P = HP[k]; if (!P) return null; const f = Math.min(P.length - 1.001, u * (P.length - 1)), i = Math.floor(f), a = P[i], b = P[i + 1]; const p = a.clone().lerp(b, f - i); p.y = hG(p.x, p.z); return { p, yaw: huong(a, b) }; };
    // V1.7 (anh Thắng: cảnh giao tranh — bộ đội ngồi mà cả đường hào lẫn người trượt trên cảnh): trước đây tổ đào hào bám theo đầu hào đang dài ra
    // (đầu hào chạy ~20–30 m/s vì nén nhiều tuần vào 87 s) → người quỳ, ngồi mà trôi. Nay mỗi hào có 6 điểm đóng quân cố định; đầu hào tới điểm nào thì tổ ở đó
    // hiện ra và ở yên tại chỗ (đào, chuyển đạn, quan sát). Máy quay cận cũng nhìn vào một điểm cố định, không bám đầu hào.
    const MOCH = [0.12, 0.27, 0.42, 0.57, 0.72, 0.87], VIEC = ['quy', 'nup', 'nap', 'quansat', 'namban', 'nem', 'ngam', 'quy'];
    const mocHao = (k, a) => diemHao(k, a);
    const tNgaHao = H('H07').t0 + (H('H07').t1 - H('H07').t0) * 0.62;   /* một chiến sĩ ở tổ thứ tư của hào 1 trúng đạn; tổ cứu thương tới bên cạnh (MINH HOẠ) */
    DAM.push((t) => { if (!(trong(t, 'H07') || trong(t, 'H08'))) return; const u = tienHao(t), bom = trong(t, 'H08');
      HP.forEach((P, k) => { const L = HL[k] || 2000;
        MOCH.forEach((a, m) => { if (u < a + 0.004) return; const o = mocHao(k, a); if (!o || !ganMay(o.p.x, o.p.z, 700)) return;
          for (let j = 0; j < 5; j++) { const doc = (j - 2) * 3.2 / L, q = diemHao(k, clamp(a + doc, 0.01, 0.999)) || o, nghieng = (j % 2 ? 1 : -1) * 0.7, x = q.p.x + Math.cos(q.yaw) * nghieng, z = q.p.z - Math.sin(q.yaw) * nghieng;
            const id = k * 40 + m * 5 + j;
            if (!bom && k === 1 && m === 3 && j === 2 && t >= tNgaHao) { const s_ = t - tNgaHao; dongDat('qgp', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, x, q.p.y - 0.3, z, q.yaw, 1, id); continue; }
            const clip = bom ? (j % 2 ? 'namban' : 'nup') : VIEC[(m + j * 3) % VIEC.length];
            dongDat('qgp', clip, t, (k * 0.3 + j * 0.17 + m * 0.11) % 1, x, q.p.y - 0.3, z, q.yaw + (j % 3 - 1) * 0.5, 1, id); } }); });
      const yt = t >= tNgaHao + 4 ? diemHao(1, 0.57 + 2 / (HL[1] || 2000)) : null; if (yt && trong(t, 'H07') && ganMay(yt.p.x, yt.p.z, 700)) toNguoi('qgp', yt.p, yt.yaw, [[0.9, 0, 'nam'], [-0.4, 0.2, 'quy', -1.5]], t);    /* tổ cứu thương */
      if (trong(t, 'H07') && ganMay(HAM.x, HAM.z, 500)) { toNguoi('my', HAM, 0.3, [[-1, 0.8, 'nup'], [1.1, 0.5, 'ngam'], [0.2, -1.4, 'nup', 0.6], [9.5, 3.5, 'nup']], t); const tn = H('H07').t0 + (H('H07').t1 - H('H07').t0) * 0.45, c = Math.cos(0.3), sn = Math.sin(0.3), x = HAM.x + 8.2 * c + 2.2 * sn, z = HAM.z - 8.2 * sn + 2.2 * c;
        if (t < tn) dongDat('my', 'dung', t, 0.5, x, hG(x, z), z, 0.3, 1, 4); else { const s_ = t - tn; dongDat('my', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, x, hG(x, z), z, 0.3, 1, 4); } }   /* V1.7: lính Mỹ đứng ngoài ụ trúng đạn */   /* V1.4: trong ụ chỉ cử động nhẹ (quỳ chờ, ngắm) */ });
    // H08: khu nhận hàng thả dù — lính Mỹ tập kết, chuyển hàng; xe tải
    const [dx, dz] = KS.dd(-700, 160), DZ = G(dx + 60, dz + 40);
    DAM.push((t) => { if (!trong(t, 'H08') || !ganMay(DZ.x, DZ.z, 800)) return; toNguoi('my', DZ, 1.2, [[0, 0, 'dung'], [3, 1, 'ngam', 1.2], [-3, 2, 'nup'], [5, -2, 'quy'], [-5, -1, 'dung', -0.8], [1, 5, 'nap'], [-2, -5, 'nup', 2], [6, 4, 'dung', 2.6]], t); });
    // H10: xe tải chở vật tư rút theo đường băng về phía đông (M8), lính đi bộ theo; cờ trên sân bay Tà Cơn ngày 9/7 (S14, S15)
    { const d = H('H10').t1 - H('H10').t0, A = KS.dd(-450, 55), B = KS.dd(560, 55), E = mp(840, 245), duong = [[A[0], -A[1]], [B[0], -B[1]], [E[0], -E[1]]];
      for (let k = 0; k < 2; k++) KS.xeTaoN('data/xe/xe-tang-m48.glb', { duong,   /* V1.4: phía Mỹ dùng M48 (mẫu xe tải là xe Quân Giải phóng) */ lich: [[H('H10').t0 + 6, -k * 18], [H('H10').t0 + d * 0.45, 900 - k * 18], [H('H10').t1, 1500 - k * 18]], hien: (t) => trong(t, 'H10'), ten: 'Rút quân' });
      const [cx, cz] = KS.dd(-150, -35), co = KS.taoCo('co-qgp', 2.4, 6);
      co.position.set(cx, hG(cx, cz), cz); KS.coTC = co; const tCo = H('H10').t0 + d * 0.86; DUNG.push([co, tCo, H('H10').t1 + 1]);
      DAM.push((t) => { if (t < tCo || t > H('H10').t1 + 1 || !ganMay(cx, cz, 900)) return; toNguoi('qgp', co.position, KS.RW_HUONG, [[-2, 2, 'dung'], [2.5, 1.5, 'dung'], [-4, -1, 'quansat'], [4, -1.5, 'dung'], [0, 4, 'dung'], [-1, 6, 'di']], t); }); }
    // ---------------------------------------------------------------- máy quay tầng Tà Cơn
    const NB = Math.PI;                                                                                           /* hướng nhìn: 0 = máy ở phía bắc */
    const rwA = G(...KS.dd(-595, 0)), rwB = G(...KS.dd(595, 0));
    // H02 Những pháo đài trên Đường 9
    MAY('C02-01', dolly(V3(TC.x - 1500, TC.y + 11000, TC.z + 2500), V3(TC.x - 1200, TC.y + 9500, TC.z + 1800), V3(TC.x - 1500, TC.y, TC.z - 100), undefined, 48));
    MAY('C02-02', dolly(rwA.clone().add(V3(-120, 70, 90)), rwB.clone().add(V3(60, 45, 60)), rwA.clone().lerp(rwB, 0.4), rwB, 50));
    MAY('C02-03', theo((t) => tuan(t), 14, 3.2, 8, 42, 4));
    MAY('C02-04', dolly(GAC.clone().add(V3(-12, 3.5, -10)), GAC.clone().add(V3(-5, 2.2, -4.5)), GAC.clone().add(V3(0, 0.8, 0)), undefined, 40));
    if (DOI.length >= 4) MAY('C02-05', (u) => { const k = Math.min(DOI.length - 2, Math.floor(u * (DOI.length - 1))), f = u * (DOI.length - 1) - k, a = DOI[k], b = DOI[k + 1], l = a.clone().lerp(b, ease(f));
      return [tren(l.clone().add(V3(-500, 380, 650))), l, 44]; });
    MAY('C02-06', dolly(V3(TC.x + 900, TC.y + 1400, TC.z + 1800), V3(TC.x + 2500, TC.y + 6500, TC.z + 6000), TC, TC, 46));
    // H04 Ngày 21/1 – Khe Sanh bùng cháy
    const P0 = () => (KS.PHAO[0] ? KS.PHAO[0].o : null);
    MAY('C04-01', dolly(V3(TC.x + 5200, TC.y + 1500, TC.z + 2600), V3(TC.x + 2800, TC.y + 900, TC.z + 1400), TC, TC, 44));
    MAY('C04-02', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y, p = o.position, a = y + Math.PI + 0.75; return [tren(p.clone().add(V3(Math.sin(a) * 9, 2.3 + u * 0.4, Math.cos(a) * 9))), p.clone().add(V3(Math.sin(y) * 2, 1.4, Math.cos(y) * 2)), 42]; });   /* V1.5: đứng sau-trái kíp pháo nhìn theo nòng — chớp lửa đầu nòng ở xa, không chói kín khung */
    MAY('C04-03', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 26, 9, Math.cos(y + Math.PI + 0.6) * 26))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44]; });
    MAY('C04-04', quanh(TC, 3200, 1700, 2.2, 2.45, 46));
    MAY('C04-05', dolly(KS.kho ? KS.kho.clone().add(V3(-420, 90, 260)) : TC, KS.kho ? KS.kho.clone().add(V3(-360, 70, 220)) : TC, KS.kho || TC, (KS.kho || TC).clone().add(V3(0, 60, 0)), 40));
    MAY('C04-06', (u, t) => { const o = CHAY4[2](t); return [tren(o.p.clone().add(V3(9, 3, -7))), o.p.clone().add(V3(0, 1, 0)), 44]; });
    MAY('C04-07', dolly(HAM.clone().add(V3(-7, 1.6, 6)), HAM.clone().add(V3(-4.5, 1.3, 4)), HAM.clone().add(V3(0, 0.5, 0)), undefined, 42));
    // H06 Làng Vây (xe tăng PT-76 dựng ở bien_dao_gd4.js)
    const xe0 = (t) => { const X = KS.LVX.xe[0]; return X && X.obj.visible ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    const xe3 = (t) => { const X = KS.LVX.xe[3] || KS.LVX.xe[1]; return X && X.obj.visible ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    const veLV = (fn, du) => (u, t) => fn(u, t) || du(u, t);
    MAY('C05-01', dolly(V3((TC.x + LV.x) / 2 + 2600, TC.y + 4200, (TC.z + LV.z) / 2 - 2600), V3((TC.x + LV.x) / 2 + 1500, TC.y + 3200, (TC.z + LV.z) / 2 - 1500), V3((TC.x + LV.x) / 2, LV.y, (TC.z + LV.z) / 2), undefined, 46));
    MAY('C05-02', quanh(LV, 520, 210, 0.3, 1.1, 44));
    MAY('C05-03', veLV(theo(xe0, 22, 2.2, 14, 42, 12), quanh(LV, 520, 200, 1.1, 1.4, 44)));
    MAY('C05-04', veLV(theo(xe0, 2.5, 0.9, 4.2, 48, -1), quanh(LV, 400, 120, 1.4, 1.6, 44)));
    MAY('C05-05', veLV(theo(xe3, 19, 2.6, -2, 42, 14), quanh(LV, 420, 150, 1.6, 1.9, 44)));
    MAY('C05-06', quanh(LV, 380, 260, 3.6, 4.2, 44));
    MAY('C05-07', (u, t) => { const o = BB(t); return [tren(o.p.clone().add(V3(Math.sin(o.yaw) * 4.2 + 1.2, 1.7, Math.cos(o.yaw) * 4.2))), o.p.clone().add(V3(0, 1.4, 0)), 38]; });
    MAY('C05-08', (u) => [tren(LV.clone().add(V3(-300 - u * 400, 160 + u * 900, 350 + u * 500))), LV.clone(), 44]);
    // H07 Những chiến hào siết chặt Tà Cơn
    const CU = {}; for (const sc of STORY.scenes) for (const sh of sc.shots) CU[sh.id] = sh;
    const mocCu = (k, id) => { const sh = CU[id], ud = sh ? tienHao(sh.t0 + (sh.t1 - sh.t0) * 0.15) : 0.5; let a = MOCH[0]; for (const m of MOCH) if (m + 0.004 <= ud) a = m; return () => diemHao(k, a); };   /* V1.7: mốc đã có tổ khi cú máy bắt đầu */
    const dau = (k, lui = 0, id) => (id ? ((f) => () => f())(mocCu(k, id)) : (u, t) => diemHao(k, Math.max(0.03, tienHao(t) - lui * 120 / (HL[k] || 2000))));
    MAY('C06-01', (u) => [tren(V3(TC.x - 600, TC.y + 6200 - u * 3600, TC.z + 3800 - u * 1400)), V3(TC.x - 600, TC.y, TC.z + 600), 46]);
    MAY('C06-02', (u, t) => { const o = dau(0, 0, 'C06-02')(); if (!o) return null; const a = o.yaw + 2.2 + u * 0.5, r = 34 - u * 8; return [tren(o.p.clone().add(V3(Math.sin(a) * r, 16 - u * 5, Math.cos(a) * r))), o.p.clone().add(V3(0, 0.5, 0)), 44]; });   /* V1.7: lượn chậm quanh tổ đóng quân, không bám đầu hào */
    MAY('C06-03', (u, t) => { const o = dau(2, 0, 'C06-03')(); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, 13).add(V3(0, 3.5, 0))), o.p.clone().add(V3(0, 0.6, 0)), 42]; });
    MAY('C06-04', (u, t) => { const o = dau(2, 0, 'C06-04')(); if (!o) return null; const f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [tren(o.p.clone().addScaledVector(f, -3.2).add(V3(1.6, 1.4, 0)), 0.8), o.p.clone().add(V3(0, 0.3, 0)), 40]; });
    MAY('C06-05', dolly(HAM.clone().add(V3(-9, 3.2, 8)), HAM.clone().add(V3(-6, 2.6, 5)), HAM.clone().add(V3(0.5, 0.6, 0)), undefined, 42));
    MAY('C09-02', (u, t) => { const o = dau(3, 0, 'C09-02')(); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, -11).add(V3(0, 2.8, 0))), o.p.clone().add(V3(0, 0.5, 0)), 42]; });
    MAY('C09-03', (u, t) => { const o = diemHao(1, 0.57); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)), f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [tren(o.p.clone().addScaledVector(r, -6.5 + u * 1.2).addScaledVector(f, 3).add(V3(0, 3.4, 0))), o.p.clone().addScaledVector(f, 1).add(V3(0, 0.2, 0)), 42]; });   /* V1.7: nhìn ngang hào: chiến sĩ hy sinh, tổ cứu thương bên cạnh */
    MAY('C06-06', (u, t) => { const o = diemHao(0, tienHao(t)) || { p: TC }; const a = o.p.clone().add(V3(0, 40, 0)), b = V3((o.p.x + TC.x) / 2 - 900, TC.y + 1800, (o.p.z + TC.z) / 2 + 1400); return [tren(a.lerp(b, ease(u))), o.p.clone().lerp(TC, ease(u)), 46]; });
    // H08 Bầu trời Khe Sanh
    const b52 = () => (KS.MB.b52 && KS.MB.b52[1].visible ? KS.MB.b52[1] : null), c130 = () => (KS.MB.c130 && KS.MB.c130.visible ? KS.MB.c130 : null);
    MAY('C07-01', (u, t) => { const o = b52(); if (!o) return [V3(TC.x - 6000, TC.y + 3200, TC.z + 1500), TC, 46]; const y = o.rotation.y; return [o.position.clone().add(V3(-Math.sin(y) * 260 + 60, 70, -Math.cos(y) * 260 + 40)), o.position.clone().add(V3(Math.sin(y) * 200, -60, Math.cos(y) * 200)), 46]; });
    MAY('C07-02', (u) => { const A = KS.PM('h881n'); return [tren(V3(A.x + 2600, A.y + 1700, A.z + 2600 - u * 600)), V3(A.x + 900, A.y, A.z + 900), 46]; });
    MAY('C07-03', (u, t) => { const o = diemHao(1, 1 - 12 / (HL[1] || 2000)); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, 9).add(V3(0, 2.4, 0))), o.p.clone().add(V3(0, 0.4, 0)), 44]; });
    MAY('C07-04', (u, t) => { const o = c130(); if (!o) return [V3(TC.x + 2600, TC.y + 600, TC.z + 300), TC, 46]; const y = o.rotation.y + NB; return [o.position.clone().add(V3(-Math.sin(y) * 140, 55, -Math.cos(y) * 140)), o.position.clone().add(V3(Math.sin(y) * 120, -10, Math.cos(y) * 120)), 46]; });
    MAY('C07-05', (u) => { const D = KS.DU && KS.DU[1]; if (!D || !D.h.visible) return null; const p = D.h.position; return [tren(p.clone().add(V3(9, 7, 7))), p.clone().add(V3(0, -3, 0)), 44]; });
    MAY('C07-06', quanh(DZ, 42, 18, 0.6, 1.0, 42));
    MAY('C07-07', dolly(V3(TC.x + 800, TC.y + 500, TC.z + 1200), V3(TC.x + 3400, TC.y + 3000, TC.z + 4400), TC, TC, 46));
    // H10 Mùa hè 1968 – quân Mỹ rời Tà Cơn
    const xeRut = () => { const X = XE.find((x) => x.ten === 'Rút quân' && x.obj.visible); return X ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    MAY('C12-01', C['C02-01'] || quanh(TC, 3000, 2500, 0, 0.2, 46));
    MAY('C12-02', (u, t) => theo(xeRut, 24, 6, 14, 42, 10)(u, t) || [TC.clone().add(V3(0, 200, 300)), TC, 44]);
    MAY('C12-03', quanh(TC, 900, 260, 3.6, 4.4, 44));
    MAY('C12-04', dolly(GAC.clone().add(V3(-10, 2.6, -8)), GAC.clone().add(V3(-6, 1.9, -5)), GAC.clone().add(V3(0, 0.6, 0)), undefined, 40));
    MAY('C12-05', dolly(rwB.clone().add(V3(150, 40, 60)), rwA.clone().add(V3(-80, 30, 40)), rwB.clone().lerp(rwA, 0.5), rwA, 50));
    MAY('C11-02', theo((t) => tuan10(t), 13, 3, -7, 42, 4));
    MAY('C11-04', (u) => { const o = KS.m48 && KS.m48[0]; if (!o) return null; const p = o.position; return [tren(p.clone().add(V3(Math.sin(u * 0.6 + 0.4) * 9, 2.2, Math.cos(u * 0.6 + 0.4) * 9))), p.clone().add(V3(0, 1.6, 0)), 40]; });
    MAY('C12-06', (u) => { const c = KS.coTC ? KS.coTC.position : TC; return [tren(c.clone().add(V3(-20 - u * 900, 8 + u * 1600, 24 + u * 1500))), c.clone().add(V3(0, 4, 0)), 44]; });
  }

  if (TANG === 'chien-dich') {
    const VUNG = { dongha: ll(16.818, 107.08), camlo: ll(16.80, 106.98), rock: KS.PM('rockpile'), h881s: KS.PM('h881s') };
    // tổ quan sát trên 881 Nam (cảnh gác, H01)
    const Q = VUNG.h881s; uBaoCat(Q.x, Q.z, 2.6, 2.2, 1.0);
    DAM.push((t) => { if (!trong(t, 'H01') || !ganMay(Q.x, Q.z, 1500)) return; toNguoi('my', Q, 2.2, [[0, 1.1, 'ngam'], [-1.2, -0.8, 'dung'], [1.4, -0.5, 'nup']], t); });
    // H03: đội hình bộ binh hành quân trong rừng (F.325 từ tây bắc), trận địa pháo, sở chỉ huy, đoàn vận tải
    const HQP = [ll(16.760, 106.600), ll(16.745, 106.615), ll(16.728, 106.633), ll(16.712, 106.650)];
    const HQ = diTheo(HQP, 0.97, H('H03').t0);
    { const d = HQP[0].clone().sub(HQP[1]).setY(0).normalize(), q = HQP[0].clone().addScaledVector(d, 160); q.y = hG(q.x, q.z); duongDat([q, ...HQP], 5); trongCay(cayVen([q, ...HQP], 1100, 7, 7, 30, 11)); }   /* đường kéo dài về phía sau đầu đội hình: cả hàng quân (≈ 45 m) đều đứng trên đường */                                                     /* đường mòn đất đỏ đoàn quân đi trên đó (V1.5) */
    // V1.8 (anh Thắng: đường hành quân có chướng ngại — tảng đá, cây đổ ngang đường — bộ đội nhảy qua để đi tiếp): mỗi người đi theo đường mòn ở khoảng cách riêng
    // (không còn cả khối người trượt theo đầu đội hình); tới cây đổ thì cả hàng nhảy qua, tới tảng đá thì hàng bên trái nhảy qua. Vị trí chướng ngại: MINH HOẠ
    const HQL = [0]; for (let i = 1; i < HQP.length; i++) HQL.push(HQL[i - 1] + HQP[i].distanceTo(HQP[i - 1]));
    const hqAt = (d) => { if (d <= 0) { const f = HQP[0].clone().sub(HQP[1]).setY(0).normalize(); const p = HQP[0].clone().addScaledVector(f, -d); p.y = hG(p.x, p.z); return { p, yaw: huong(HQP[0], HQP[1]) }; }
      let i = 1; while (i < HQL.length - 1 && HQL[i] < d) i++; const k = clamp((d - HQL[i - 1]) / (HQL[i] - HQL[i - 1]), 0, 1), p = HQP[i - 1].clone().lerp(HQP[i], k); p.y = hG(p.x, p.z); return { p, yaw: huong(HQP[i - 1], HQP[i]) }; };
    const CN = [{ d: 8, ca: true }, { d: -5, ca: false }];   /* đặt để các hàng nhảy qua đúng trong cú máy C03-02 (152–163 s) */                                                     /* cây đổ ngang (cả hai hàng) · tảng đá (hàng trái) */
    { const vo = mat(0x5a4330), da = mat(0x7d7a72), go = mat(0x8a6a48);
      for (const c of CN) { const o = hqAt(c.d), f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)), r = V3(f.z, 0, -f.x);
        if (c.ca) { const g = new THREE.Group(), than = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 7, 9), vo); than.rotation.z = Math.PI / 2; g.add(than);
          for (const [x, a] of [[-2.2, 0.7], [1.1, -0.9], [2.6, 0.5]]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.3, 5), vo); n.position.set(x, 0.35, 0); n.rotation.set(a, 0, 0.6); g.add(n); }
          const mat_ = new THREE.Mesh(new THREE.CircleGeometry(0.33, 9), go); mat_.position.set(3.5, 0, 0); mat_.rotation.y = Math.PI / 2; g.add(mat_);
          g.position.set(o.p.x, hG(o.p.x, o.p.z) + 0.28, o.p.z); g.rotation.y = o.yaw + Math.PI / 2; scene.add(g); KS.napSan(g); c.o = g; }
        else { const q = o.p.clone().addScaledVector(r, -1.2), m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0).scale(1.3, 0.62, 1.0), da); m.position.set(q.x, hG(q.x, q.z) + 0.3, q.z); m.rotation.y = o.yaw + 0.4; scene.add(m); KS.napSan(m); c.o = m; } } }
    DAM.push((t) => { if (!trong(t, 'H03', 2, 2)) return; const dh = Math.max(0, (t - H('H03').t0) * 0.97); if (!ganMay(hqAt(dh).p.x, hqAt(dh).p.z, 2500)) return;
      hang(36, 2, 2.4).forEach(([a, b], i) => { const d = dh + b, o = hqAt(d), c = Math.cos(o.yaw), sn = Math.sin(o.yaw); let x = o.p.x + a * c, z = o.p.z - a * sn, y = hG(x, z), clip = 'di', tc = t, ph = (i * 0.37) % 1;
        for (const cn of CN) { if (!cn.ca && a > 0) continue; const u = (d - cn.d + 0.85) / 1.7; if (u > 0 && u < 1) { const C = DONG[(i % 2 ? 'qgpA' : 'qgpB')] && DONG[(i % 2 ? 'qgpA' : 'qgpB')].clips.nhay;
            if (C) { clip = 'nhay'; tc = u * 0.999 * C.frames.length / C.fps; ph = 0; y += Math.sin(Math.PI * u) * 0.45; } } }
        dongDat('qgp', clip, tc, ph, x, y, z, o.yaw, 1, i); }); });
    const CRc = KS.CR, PB = []; KS.PB = PB; glbLoad('data/phao/m-46-130mm.glb').then((g) => { for (let k = 0; k < 3; k++) { const o = KS.napSan(g.scene.clone(true)), x = CRc.x + (k - 1) * 22, z = CRc.z + (k % 2) * 14;
      o.position.set(x, hG(x, z), z); o.rotation.y = huong(o.position, TC); scene.add(o); PB.push(o); DUNG.push([o, H('H03').t0 - 1, H('H03').t1 + 1]); } });
    for (let k = 0; k < 3; k++) nenDat(CRc.x + (k - 1) * 22, CRc.z + (k % 2) * 14 - 2, 12); nenDat(CRc.x, CRc.z + 5, 42, -0.03); trongCay(vongCay(CRc, 55, 80, 12, 37));   /* nền đất trận địa pháo (V1.5) */
    DAM.push((t) => { if (!trong(t, 'H03')) return; PB.forEach((o, k) => { if (ganMay(o.position.x, o.position.z, 1200)) toNguoi('qgp', o.position, o.rotation.y, [[-1.8, -3.9, 'quy'], [1.7, -4.3, 'dung'], [0, -5.6, 'nem'], [2.8, -1.2, 'quansat', -0.6]], t + k * 0.3); }); });
    // V1.8 (anh Thắng: bàn họp chiến thuật có bản đồ trận Khe Sanh): vẽ bằng mã trên nền ảnh địa hình của sa bàn (tông giấy cũ) — căn cứ, các điểm cao, Làng Vây,
    // Co Roc, Đường 9, mũi tiến công (theo các mũi tên trên sa bàn). MINH HOẠ: không chép bản đồ trong sách
    const banDoKS = () => { const W2 = 1536, H2 = 1024, cv = document.createElement('canvas'); cv.width = W2; cv.height = H2; const g = cv.getContext('2d');
      const L = (k) => LL(MOC[k][0], MOC[k][1], 0), D = ['tacon', 'h881n', 'h950', 'khesanh', 'langvay', 'coroc'].map(L);
      let x0 = Math.min(...D.map((v) => v.x)), x1 = Math.max(...D.map((v) => v.x)), z0 = Math.min(...D.map((v) => v.z)), z1 = Math.max(...D.map((v) => v.z)); const mx = (x1 - x0) * 0.18, mz = (z1 - z0) * 0.18; x0 -= mx; x1 += mx; z0 -= mz; z1 += mz;
      if ((x1 - x0) / (z1 - z0) < 1.5) { const c = (x0 + x1) / 2, w = (z1 - z0) * 1.5; x0 = c - w / 2; x1 = c + w / 2; } else { const c = (z0 + z1) / 2, h = (x1 - x0) / 1.5; z0 = c - h / 2; z1 = c + h / 2; }
      const px = (v) => [(v.x - x0) / (x1 - x0) * W2, (v.z - z0) / (z1 - z0) * H2], im = colorTex.image, iw = im.width, ih = im.height;
      g.filter = 'sepia(0.55) saturate(0.85) brightness(1.08) contrast(0.95)';
      g.drawImage(im, (x0 + HALF) / (2 * HALF) * iw, (z0 + HALF) / (2 * HALF) * ih, (x1 - x0) / (2 * HALF) * iw, (z1 - z0) / (2 * HALF) * ih, 0, 0, W2, H2); g.filter = 'none';
      g.fillStyle = 'rgba(238,224,190,0.28)'; g.fillRect(0, 0, W2, H2); g.strokeStyle = 'rgba(80,60,30,0.25)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * W2 / 12, 0); g.lineTo(i * W2 / 12, H2); g.stroke(); } for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(0, i * H2 / 8); g.lineTo(W2, i * H2 / 8); g.stroke(); }
      const DB9 = (INST.duong && (INST.duong.duong9 || INST.duong.cd_duong9 || INST.duong.cd_pegasus)) || []; if (DB9.length > 1) { g.strokeStyle = '#5a3a1a'; g.lineWidth = 5; g.setLineDash([16, 10]); g.beginPath(); DB9.forEach(([x, yb], i) => { const [a, b] = px({ x, z: -yb }); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); g.setLineDash([]); }
      const muiTen = (pts, mau) => { const P = pts.map(([la, lo]) => px(LL(la, lo, 0))); g.strokeStyle = mau; g.fillStyle = mau; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); P.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke();
        const [ax, ay] = P[P.length - 2], [bx, by] = P[P.length - 1], an = Math.atan2(by - ay, bx - ax); g.beginPath(); g.moveTo(bx + Math.cos(an) * 34, by + Math.sin(an) * 34); g.lineTo(bx + Math.cos(an + 2.4) * 40, by + Math.sin(an + 2.4) * 40); g.lineTo(bx + Math.cos(an - 2.4) * 40, by + Math.sin(an - 2.4) * 40); g.closePath(); g.fill(); };
      muiTen([[16.745, 106.615], [16.712, 106.650], [16.680, 106.684]], 'rgba(178,30,22,0.9)'); muiTen([[16.668, 106.575], [16.668, 106.625], [16.660, 106.672]], 'rgba(178,30,22,0.9)'); muiTen([[16.585, 106.620], [16.596, 106.650], [16.599, 106.664]], 'rgba(178,30,22,0.9)');
      const nhan = (k, ten, mau, dich) => { const [a, b] = px(L(k)); g.fillStyle = mau; g.strokeStyle = '#1e140a'; g.lineWidth = 3;
        if (dich) { g.beginPath(); g.arc(a, b, k === 'tacon' ? 34 : 16, 0, 7); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.stroke(); } else { g.beginPath(); g.moveTo(a, b - 20); g.lineTo(a + 18, b + 14); g.lineTo(a - 18, b + 14); g.closePath(); g.fill(); g.stroke(); }
        g.font = '700 30px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(245,236,214,0.9)'; g.strokeText(ten, a + 26, b - 4); g.fillStyle = '#1e140a'; g.fillText(ten, a + 26, b - 4); };
      nhan('tacon', 'Tà Cơn', '#2b4f9a', 1); for (const [k, t] of [['h881s', '881 Nam'], ['h881n', '881 Bắc'], ['h861', '861'], ['h558', '558'], ['h950', '950']]) nhan(k, t, '#2b4f9a', 1);
      nhan('langvay', 'Làng Vây', '#2b4f9a', 1); nhan('khesanh', 'Hướng Hóa', '#2b4f9a', 1); nhan('coroc', 'Co Roc – pháo binh', '#b21e16', 0);
      g.fillStyle = 'rgba(245,236,214,0.88)'; g.fillRect(24, 22, 900, 64); g.fillStyle = '#5c1410'; g.font = '800 36px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('PHƯƠNG ÁN TIẾN CÔNG ĐƯỜNG 9 – KHE SANH (minh hoạ)', 40, 56);
      g.strokeStyle = '#3b2a14'; g.lineWidth = 10; g.strokeRect(5, 5, W2 - 10, H2 - 10);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx; };
    let BDKS = null; try { BDKS = banDoKS(); } catch (e) { console.warn('bản đồ bàn họp', e); }
    const SCH = ll(16.735, 106.590); const ban = banBanDo(SCH.x, SCH.z, 0.4, BDKS); DUNG.push([ban, H('H03').t0 - 1, H('H03').t1 + 1]); nenDat(SCH.x, SCH.z, 9); trongCay(vongCay(SCH, 13, 24, 9, 31));   /* nền đất nơi họp bàn (V1.5) */
    DAM.push((t) => { if (!trong(t, 'H03') || !ganMay(SCH.x, SCH.z, 600)) return; toNguoi('qgp', SCH, 0.4, [[0, -1.25, 'dung'], [-1.35, 0.15, 'dung', 1.5], [1.35, 0.25, 'dung', -1.55], [0.3, 1.35, 'dung', Math.PI], [-0.9, 1.2, 'dung', 2.4]], t); });   /* V1.4: họp bàn — mọi người đứng quanh bàn, chỉ lắc lư nhẹ (Rifle Idle) */
    const DB = (INST.duong && INST.duong.cd_bien_gioi) || [];                                                     /* đường qua biên giới (OSM) — tuyến vận tải MINH HOẠ */
    const VT = DB.length > 1 ? diTheo(DB.filter((_, i) => i % 3 === 0).map(([x, yb]) => G(x, -yb)), 0.97, H('H03').t0 - 120) : null;
    if (DB.length > 1) { const Q = DB.map(([x, yb]) => G(x, -yb)); duongDat(Q, 6); trongCay(cayVen(Q, 1200, 8, 8, 32, 23)); }                                                 /* tuyến vận tải: đường đất (V1.5) */
    if (DB.length > 1) for (let k = 0; k < 3; k++) KS.xeTaoN('data/xe/xe-tai.glb', { co: k ? null : 'co-qgp', duong: DB, lich: [[H('H03').t0, 2200 - k * 22], [H('H03').t1, 4600 - k * 22]], hien: (t) => trong(t, 'H03'), ten: 'Vận tải' });
    DAM.push((t) => { if (!VT || !trong(t, 'H03')) return; const o = VT(t); if (ganMay(o.p.x, o.p.z, 1500)) toNguoi('qgp', o.p, o.yaw, hang(16, 1, 3.2).map(([a, b]) => [a, b, 'di']), t); });
    // H09 Pegasus: công binh mở đường (lính Mỹ, xe tăng M48, xe tải ở đầu tuyến Cà Lu), bãi đổ quân trực thăng
    const DP = (INST.duong && INST.duong.cd_pegasus) || [], DAU = DP.length ? G(DP[30][0], -DP[30][1]) : TC;
    const LZ = ll(16.672, 106.800), UH = []; KS.UH = UH;
    const RA_LZ = Array.from({ length: 14 }, (_, i) => { const k = i % 3, hx = LZ.x + (k - 1) * 24, hz = LZ.z + (k % 2) * 16, a = 0.9 + (i / 14) * Math.PI * 2;   /* từ ba chiếc trực thăng đã đáp chạy ra vòng ngoài */
      return diTheo([G(hx + Math.sin(a) * 3, hz + Math.cos(a) * 3), G(LZ.x + Math.sin(a) * 34, LZ.z + Math.cos(a) * 30)], 2.7, H('H09').t0 + 33 + (i % 5) * 0.7); });
    glbLoad('data/may-bay/uh-1.glb').then((g) => { for (let k = 0; k < 9; k++) { const o = KS.napSan(g.scene.clone(true)); o.visible = false; scene.add(o); UH.push(o); } });
    DAM.push((t) => { if (!trong(t, 'H09')) { for (const o of UH) o.visible = false; return; } const d = H('H09').t1 - H('H09').t0, u = (t - H('H09').t0) / d;
      UH.forEach((o, k) => { o.visible = true; if (k < 3) { const x = LZ.x + (k - 1) * 24, z = LZ.z + (k % 2) * 16; o.position.set(x, hG(x, z) + 0.2, z); o.rotation.y = 0.9; return; }   /* ba chiếc đã đáp */
        const j = k - 3, A = V3(LZ.x + 9000, 0, LZ.z - 2500), q = A.clone().lerp(LZ, clamp(u * 1.25, 0, 1)); q.x += (j % 3 - 1) * 45; q.z += Math.floor(j / 3) * 55; q.y = Math.max(hG(q.x, q.z) + 240, LZ.y + 260);
        o.position.copy(q); o.rotation.set(0, huong(A, LZ), 0); })   /* V1.7: mũi UH-1 theo +Z */;
      if (ganMay(LZ.x, LZ.z, 700)) RA_LZ.forEach((f, i) => { const o = f(t); dongDat('my', o.het ? (i % 3 ? 'quy' : 'ngam') : (i % 3 === 2 ? 'khom' : 'chay'), !o.het && i % 3 === 2 ? t * 2.1 : t, i * 0.29 % 1, o.p.x, o.p.y, o.p.z, o.het ? o.yaw : o.yaw, 1, i); });   /* lính nhảy khỏi trực thăng, chạy ra vòng ngoài rồi quỳ bắn */
      if (ganMay(DAU.x, DAU.z, 900)) toNguoi('my', DAU, 0, [[4, 0, 'dung'], [6, 3, 'quy'], [-4, 2, 'ngam', 0.8], [-6, -2, 'dung', -1], [3, -5, 'nup'], [-2, 6, 'quy', 2]], t); });
    { const ten = 'Công binh'; KS.xeTaoN('data/xe/xe-tang-m48.glb', { duong: DP, lich: [[H('H09').t0, 30 * 0], [H('H09').t1, 900]], hien: (t) => trong(t, 'H09'), ten }); }
    // H11: cờ chiến thắng trên sân bay Tà Cơn (9/7/1968 — S14, S15)
    const [fx, fz] = KS.dd(-150, -35), co = KS.taoCo('co-qgp', 2.4, 6);
    co.position.set(fx, hG(fx, fz), fz); DUNG.push([co, H('H11').t0, H('H11').t1 + 1]);
    DAM.push((t) => { if (!trong(t, 'H11') || !ganMay(fx, fz, 800)) return; toNguoi('qgp', co.position, KS.RW_HUONG, [[-2, 2, 'dung'], [2.5, 1.5, 'dung'], [-4, -1, 'quansat'], [4, -1.5, 'dung'], [0, 4, 'dung'], [-1, 6, 'dung'], [3, 6, 'quansat']], t); });
    { const c = KS.taoCo('co-qgp', 1.0, 2.6); c.visible = false; DAM.push((t) => { c.visible = trong(t, 'H03'); if (!c.visible) return; const o = HQ(t); c.position.set(o.p.x + Math.cos(o.yaw) * 0.6, o.p.y + 0.2, o.p.z - Math.sin(o.yaw) * 0.6); c.rotation.y = o.yaw - Math.PI / 2; }); }   /* cờ đi đầu đội hình hành quân */
    { const c = KS.taoCo('co-qgp', 1.2, 3.5); c.position.set(KS.CR.x + 8, hG(KS.CR.x + 8, KS.CR.z - 30), KS.CR.z - 30); DUNG.push([c, H('H03').t0 - 1, H('H03').t1 + 1]); }
    // ---------------------------------------------------------------- máy quay tầng chiến dịch
    const DPp = DP.map(([x, yb]) => G(x, -yb)), dp1 = (u) => { const f = clamp(u, 0, 1) * (DPp.length - 1.001), i = Math.floor(f); return DPp[i].clone().lerp(DPp[i + 1], f - i); };
    const dpAt = (u) => { if (!DPp.length) return { p: TC, yaw: 0 }; const p = V3(); for (let k = -6; k <= 6; k++) p.add(dp1(u + k * 0.006)); p.multiplyScalar(1 / 13);   /* làm trơn đường Đường 9 (OSM gấp khúc) cho máy quay chạy theo */
      return { p, yaw: huong(dp1(u - 0.04), dp1(u + 0.04)) }; };
    // H01
    MAY('C01-01', dolly(VUNG.camlo.clone().add(V3(0, 7500, 0)), VUNG.rock.clone().add(V3(1500, 4200, 1200)), VUNG.rock, TC, 50));
    MAY('C01-02', quanh(TC, 7000, 1700, 1.2, 1.9, 46));
    // C01-03 (anh Thắng V1.5: 0:24–0:35 bay vòng tròn trên cao cho êm): lia vòng quanh đoạn Đường 9 giữa Cà Lu và Khe Sanh, độ cao cố định
    { const c = dpAt(0.25).p; let yM = -1e9; for (let i = 0; i <= 36; i++) { const a = 0.9 + i / 36 * 1.1; yM = Math.max(yM, hG(c.x + Math.sin(a) * 5200, c.z + Math.cos(a) * 5200)); }
      MAY('C01-03', (u) => { const a = 0.9 + ease(u) * 1.1; return [V3(c.x + Math.sin(a) * 5200, Math.max(yM, c.y) + 2600, c.z + Math.cos(a) * 5200), c.clone(), 46]; }); }
    MAY('C01-04', quanh(TC, 2600, 1200, 0.8, 1.6, 44));
    MAY('C01-05', dolly(Q.clone().add(V3(9, 3.5, -7)), Q.clone().add(V3(4, 2.2, -3)), Q.clone().add(V3(0, 1.0, 0)), undefined, 40));
    MAY('C01-06', dolly(Q.clone().add(V3(40, 60, -40)), V3(TC.x + 4000, TC.y + 9000, TC.z + 9000), Q, TC, 48));
    // H03
    MAY('C03-01', (u) => [V3(TC.x - 9000, TC.y + 26000 - u * 2000, TC.z + 6000), V3(TC.x - 7000, TC.y, TC.z - 2000), 48]);
    MAY('C03-02', theo((t) => HQ(t), 40, 26, 34, 44, -10));
    MAY('C03-03', (u) => { const o = PB[1]; if (!o) return [CRc.clone().add(V3(0, 200, 300)), CRc, 44]; const y = o.rotation.y, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 24, 8, Math.cos(y + Math.PI + 0.6) * 24))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44]; });
    MAY('C03-04', dolly(SCH.clone().add(V3(2.6, 2.6, 2.4)), SCH.clone().add(V3(1.5, 2.0, 1.4)), SCH.clone().add(V3(0, 0.8, 0)), undefined, 40));
    MAY('C03-05', (u, t) => VT ? theo(VT, 30, 14, 22, 44, -6)(u, t) : null);
    MAY('C03-06', dolly(V3(TC.x - 6000, TC.y + 5000, TC.z + 9000), V3(TC.x - 4000, TC.y + 14000, TC.z + 12000), V3(TC.x - 4000, TC.y, TC.z), TC, 48));
    // H05 Tết Mậu Thân (thẻ chữ ở bien_dao_gd4.js; máy bay cao quanh vùng)
    const H5 = SCN.find((c) => c.id === 'H05'); if (H5) H5.shots.forEach((s, i) => MAY(s.id, quanh(TC, 15000 - i * 900, 9000 - i * 600, 1.6 + i * 0.35, 1.95 + i * 0.35, 48)));
    // H09
    MAY('C10-01', (u) => [V3(TC.x + 9000, TC.y + 22000, TC.z + 5000), V3(TC.x + 9000, TC.y, TC.z - 1500), 48]);
    MAY('C10-02', quanh(DAU, 70, 26, 2.2, 2.7, 42));
    MAY('C10-03', (u) => { const o = UH[4]; if (!o) return null; const y = o.rotation.y; return [o.position.clone().add(V3(-Math.sin(y) * 160 + 70, 40, -Math.cos(y) * 160 + 50)), o.position.clone().add(V3(Math.sin(y) * 100, -20, Math.cos(y) * 100)), 46]; });
    MAY('C10-04', quanh(LZ, 62, 18, 4.0, 4.5, 42));
    MAY('C10-05', (u) => { const o = UH[1]; if (!o) return null; const p = o.position; return [tren(p.clone().add(V3(9 + u * 2, 2.2, 7)), 1), p.clone().add(V3(0, 1.5, 0)), 42]; });
    const xePeg = () => { const X = XE.find((x) => x.ten === 'Pegasus' && x.obj.visible); return X ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    MAY('C10-06', theo(xePeg, 45, 22, 30, 44, 30));
    MAY('C10-07', quanh(TC, 3200, 1800, 3.0, 3.7, 46));
    // H11
    MAY('C13-01', dolly(V3(TC.x + 4000, TC.y + 300, TC.z + 3000), V3(TC.x + 3000, TC.y + 3500, TC.z + 6000), TC, TC, 48));
    MAY('C13-02', quanh(co.position, 22, 4, 0.4, 0.9, 40));
    MAY('C13-03', (u) => [V3(TC.x - 4000, TC.y + 17000, TC.z + 15000 - u * 2000), V3(TC.x - 6000, TC.y, TC.z - 1000), 48]);
    MAY('C13-04', dolly(V3(TC.x + 2000, TC.y + 2500, TC.z + 4000), V3(TC.x + 6000, TC.y + 16000, TC.z + 16000), TC, TC, 48));
    MAY('C13-05', quanh(TC, 12000, 9000, 0.5, 0.6, 48));
    // tựa đề cuối phim
    const TUA = document.createElement('div'); TUA.id = 'tuaKS'; TUA.innerHTML = '<b>KHE SANH 1968</b><small>Tái dựng mô phỏng</small>';
    const st = document.createElement('style'); st.textContent = '#tuaKS{position:fixed;inset:0;display:grid;place-content:center;text-align:center;pointer-events:none;z-index:25;opacity:0;transition:opacity 1.2s;color:#f3e7d2;text-shadow:0 2px 18px #000a}#tuaKS b{font:800 clamp(34px,7vw,84px)/1 system-ui,sans-serif;letter-spacing:.06em}#tuaKS small{display:block;margin-top:10px;font:600 14px system-ui;letter-spacing:.2em;text-transform:uppercase;color:#e2b768}';
    document.head.append(st); document.body.append(TUA);
    const s5 = SCN.find((c) => c.id === 'H11'), sh5 = s5 && s5.shots.find((s) => s.id === 'C13-05');
    DAM.push((t) => { TUA.style.opacity = sh5 && appMode === 'film' && t >= sh5.t0 + 0.5 && t < sh5.t1 + 0.5 ? 1 : 0; });
  }
  // gán vào SHOTS: cú nào trả null (vật chưa tải xong) thì dùng máy quay tạm GĐ3
  for (const [id, fn] of Object.entries(C)) { const cu = SHOTS[id]; SHOTS[id] = (u, t) => { let r = null; try { r = fn(u, t); } catch (e) { r = null; } return r || (cu ? cu(u, t) : [TC.clone().add(V3(0, 1500, 2500)), TC.clone(), 45]); }; }
  // cây không được che máy quay: dò vị trí máy của mọi cú trên tầng này (21 điểm mỗi cú), cây nào cách máy < 22 m hoặc nằm chắn giữa máy và chủ thể (< 9 m quanh đường ngắm) thì bỏ
  { const M = []; for (const sc of SCN) for (const sh of sc.shots) { const f = SHOTS[sh.id]; if (!f) continue; for (let k = 0; k <= 20; k++) { let r = null; try { r = f(k / 20, sh.t0 + (sh.t1 - sh.t0) * k / 20); } catch (e) {} if (r && r[0]) M.push([r[0], r[1] || r[0]]); } }
    const m4 = new THREE.Matrix4(), v = V3(0, 0, 0), O = new THREE.Matrix4().makeScale(0, 0, 0); let bo = 0;
    for (const I of CAYS) { for (let i = 0; i < I.count; i++) { I.getMatrixAt(i, m4); v.setFromMatrixPosition(m4); if (M.some(([c, l]) => { const dx = l.x - c.x, dz = l.z - c.z, L2 = dx * dx + dz * dz || 1, k = clamp(((v.x - c.x) * dx + (v.z - c.z) * dz) / L2, 0, 1); return Math.hypot(c.x + dx * k - v.x, c.z + dz * k - v.z) < (k < 0.05 ? 22 : 9) && c.y - v.y < 400; })) { I.setMatrixAt(i, O); bo++; } } I.instanceMatrix.needsUpdate = true; }
    KS.cayBo = bo; }
  window.__ks.C = C;
}
