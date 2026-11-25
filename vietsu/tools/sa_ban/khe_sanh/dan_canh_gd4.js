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
  const banBanDo = (x, z, yaw) => { const g = new THREE.Group(), y = hG(x, z); g.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.0).translate(0, 0.78, 0), mat(0x6a5236)));
    for (const [a, b] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06).translate(a, 0.39, b), mat(0x4d3b26)));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.01, 0.8).translate(0, 0.81, 0), mat(0xd9ceb0)));                    /* tấm bản đồ (giấy trơn, không vẽ nội dung) */
    g.position.set(x, y, z); g.rotation.y = yaw; scene.add(g); KS.napSan(g); return g; };
  const hien = (o, on) => { if (o) o.visible = on; };
  // tổ người: danh sách [dx, dz (m, theo hướng yaw của tổ), động tác, quay thêm] quanh tâm
  const toNguoi = (ten, tam, yaw, ds, t, sc = 1) => { const c = Math.cos(yaw), s = Math.sin(yaw);
    ds.forEach(([a, b, clip, q = 0], i) => { const x = tam.x + a * c + b * s, z = tam.z - a * s + b * c; dongDat(ten, clip, t, (i * 0.37) % 1, x, hG(x, z), z, yaw + q, sc, i); }); };
  const hang = (n, cot, gian = 2.2) => Array.from({ length: n }, (_, i) => [(i % cot - (cot - 1) / 2) * gian + ((i * 7) % 3 - 1) * 0.3, -Math.floor(i / cot) * gian]);   /* đội hình hàng dọc */
  const DUNG = [];                                                                                                // đạo cụ chỉ hiện trong một khoảng thời gian: [vật, t0, t1]
  DAM.push((t) => { for (const [o, a, b] of DUNG) o.visible = t >= a && t < b; });
  const MAY = (id, fn) => { if (SCN.some((c) => c.shots.some((s) => s.id === id))) C[id] = fn; };

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
    DAM.push((t) => { if (!(trong(t, 'H04', 3, 3) || trong(t, 'H07', 3, 3))) return;
      for (const [k, P] of KS.PHAO.entries()) { const o = P.o; if (!ganMay(o.position.x, o.position.z, 1500)) continue; const y = o.rotation.y + Math.PI;
        toNguoi('qgp', o.position, y, [[-1.6, -2.2, 'quy'], [1.5, -2.6, 'dung'], [0, -4.2, 'nem'], [2.6, -0.5, 'quansat', -0.6]], t + k * 0.3); } });
    // H02, H10: lính Mỹ tuần tra, gác
    DAM.push((t) => { const on2 = trong(t, 'H02'), on10 = trong(t, 'H10');
      if (on2 || on10) { const f = on2 ? tuan : tuan10, o = f(t); if (ganMay(o.p.x, o.p.z, 700)) toNguoi('my', o.p, o.yaw, hang(6, 2, 2.6).map(([a, b]) => [a, b, o.het ? 'dung' : 'di']), t);
        if (ganMay(GAC.x, GAC.z, 600)) toNguoi('my', GAC, yawBac, on10 && t > H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.3 ? [] : [[-0.8, 0.6, 'nup'], [0.9, 0.4, 'ngam'], [0, -1.2, 'dung']], t); }
      if (on2 || trong(t, 'H01')) for (const [k, v] of DOI.entries()) if (ganMay(v.x, v.z, 900)) toNguoi('my', v, k, [[-1.2, 0.5, 'ngam'], [1.4, 0.2, 'dung'], [0, -2, 'nup', 1]], t); });
    // H04: lính Mỹ chạy vào công sự khi bị pháo kích, kho đạn cháy
    const CHAY4 = Array.from({ length: 12 }, (_, i) => { const a = G(HAM.x + 40 + (i % 4) * 6, HAM.z - 30 + Math.floor(i / 4) * 7), b = G(HAM.x + (i % 3 - 1) * 1.4, HAM.z + (Math.floor(i / 3) % 2) * 1.2); return diTheo([a, b], 2.7, H('H04').t0 + 52 + i * 0.4); });                 /* 2,7 m/s: nhịp bước Rifle Run */
    DAM.push((t) => { if (!trong(t, 'H04') || !ganMay(HAM.x, HAM.z, 600)) return;
      CHAY4.forEach((f, i) => { const o = f(t); dongDat('my', o.het ? (i % 3 ? 'quy' : 'nap') : 'chay', t, i * 0.31 % 1, o.p.x, o.p.y, o.p.z, o.het ? Math.PI + i : o.yaw, 1, i); }); });
    // H06 thêm mũi bộ binh từ phía bắc (cBB2 trên sơ đồ trận Làng Vây, S18)
    const LV = KS.LV, BB = diTheo([G(LV.x + 20, LV.z - 230), G(LV.x + 10, LV.z - 140), G(LV.x, LV.z - 60)], 2.7, H('H06').t0 + (H('H06').t1 - H('H06').t0) * 0.3);
    DAM.push((t) => { if (!trong(t, 'H06') || !ganMay(LV.x, LV.z, 1500)) return; const o = BB(t); toNguoi('qgp', o.p, o.yaw, hang(10, 3, 3).map(([a, b], i) => [a, b, o.het ? (i % 3 ? 'ban' : 'quy') : 'chay']), t); });
    { const c = KS.taoCo('co-qgp', 1.0, 2.6); c.visible = false; DAM.push((t) => { c.visible = trong(t, 'H06'); if (!c.visible) return; const o = BB(t); c.position.set(o.p.x + Math.cos(o.yaw) * 0.6, o.p.y + 0.2, o.p.z - Math.sin(o.yaw) * 0.6); c.rotation.y = o.yaw - Math.PI / 2; }); }   /* cờ đi đầu mũi bộ binh */
    // H07: bộ đội dọc chiến hào vây lấn (đào, chuyển đạn, quan sát), một tổ cứu thương; lính Mỹ trong ụ
    const HP = (KS.HAO_P || []).map((P) => P.map(([x, z]) => G(x, z)));
    const HL = HP.map((P) => { let L = 0; for (let i = 1; i < P.length; i++) L += P[i].distanceTo(P[i - 1]); return L; });
    const tienHao = (t) => (trong(t, 'H07') ? clamp((t - H('H07').t0) / (H('H07').t1 - H('H07').t0) * 1.3, 0, 1) : t >= H('H07').t1 ? 1 : 0);
    const diemHao = (k, u) => { const P = HP[k]; if (!P) return null; const f = Math.min(P.length - 1.001, u * (P.length - 1)), i = Math.floor(f), a = P[i], b = P[i + 1]; const p = a.clone().lerp(b, f - i); p.y = hG(p.x, p.z); return { p, yaw: huong(a, b) }; };
    DAM.push((t) => { if (!(trong(t, 'H07') || trong(t, 'H08'))) return; const u = tienHao(t);
      HP.forEach((P, k) => { const L = HL[k] || 2000;
        for (let j = 0; j < 12; j++) { const lui = j < 8 ? 3 + j * 3.5 : 60 + (j - 8) * 90, o = diemHao(k, Math.max(0.02, u - lui / L)); if (!o || !ganMay(o.p.x, o.p.z, 700)) continue;   /* 8 người dồn ở đầu hào (đang đào), 4 người rải phía sau */
          const bom = trong(t, 'H08'), clip = bom ? (j % 2 ? 'namban' : 'nup') : ['quy', 'nup', 'nap', 'quansat', 'quy', 'namban', 'nem', 'ngam', 'nup', 'quansat', 'quy', 'nap'][j];   /* tư thế tại chỗ (không dùng động tác đi khi đứng yên — trượt chân) */
          const nghieng = (j % 2 ? 1 : -1) * 0.7; dongDat('qgp', clip, t, (k * 0.3 + j * 0.17) % 1, o.p.x + Math.cos(o.yaw) * nghieng, o.p.y - 0.3, o.p.z - Math.sin(o.yaw) * nghieng, o.yaw + (j % 3 - 1) * 0.5, 1, k * 12 + j); } });
      const yt = diemHao(1, Math.max(0.02, u - 45 / (HL[1] || 2000))); if (yt && trong(t, 'H07')) toNguoi('qgp', yt.p, yt.yaw, [[0.9, 0, 'nam'], [-0.4, 0.2, 'quy', -1.5]], t);    /* tổ cứu thương */
      if (trong(t, 'H07') && ganMay(HAM.x, HAM.z, 500)) toNguoi('my', HAM, 0.3, [[-1, 0.8, 'nup'], [1.1, 0.5, 'ngam'], [0.2, -1.4, 'nup', 0.6], [9.5, 3.5, 'nup'], [8.2, 2.2, 'dung']], t);   /* V1.4: trong ụ chỉ cử động nhẹ (quỳ chờ, ngắm) */ });
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
    MAY('C04-02', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y + NB, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + 2.4) * 6.5, 2.0 + u * 0.4, Math.cos(y + 2.4) * 6.5))), p.clone().add(V3(0, 1.3, 0)), 40]; });
    MAY('C04-03', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y + NB, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 26, 9, Math.cos(y + Math.PI + 0.6) * 26))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44]; });
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
    const dau = (k, lui = 0) => (u, t) => diemHao(k, Math.max(0.03, tienHao(t) - lui * 120 / (HL[k] || 2000)));
    MAY('C06-01', (u) => [tren(V3(TC.x - 600, TC.y + 6200 - u * 3600, TC.z + 3800 - u * 1400)), V3(TC.x - 600, TC.y, TC.z + 600), 46]);
    MAY('C06-02', (u, t) => { const o = dau(0, 0.06)(u, t); if (!o) return null; return theo(() => o, 30, 22, 6, 46, 40)(u, t); });
    MAY('C06-03', (u, t) => { const o = dau(2, 0.05)(u, t); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, 13).add(V3(0, 3.5, 0))), o.p.clone().add(V3(0, 0.6, 0)), 42]; });
    MAY('C06-04', (u, t) => { const o = dau(2, 0.05)(u, t); if (!o) return null; const f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [tren(o.p.clone().addScaledVector(f, -3.2).add(V3(1.6, 1.4, 0)), 0.8), o.p.clone().add(V3(0, 0.3, 0)), 40]; });
    MAY('C06-05', dolly(HAM.clone().add(V3(-9, 3.2, 8)), HAM.clone().add(V3(-6, 2.6, 5)), HAM.clone().add(V3(0.5, 0.6, 0)), undefined, 42));
    MAY('C09-02', (u, t) => { const o = dau(3, 0.07)(u, t); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, -11).add(V3(0, 2.8, 0))), o.p.clone().add(V3(0, 0.5, 0)), 42]; });
    MAY('C09-03', (u, t) => { const o = diemHao(1, Math.max(0.02, tienHao(t) - 45 / (HL[1] || 2000))); if (!o) return null; return [tren(o.p.clone().add(V3(2.2, 2.8, 1.8))), o.p.clone().add(V3(0.4, 0.1, 0)), 40]; });
    MAY('C06-06', (u, t) => { const o = diemHao(0, tienHao(t)) || { p: TC }; const a = o.p.clone().add(V3(0, 40, 0)), b = V3((o.p.x + TC.x) / 2 - 900, TC.y + 1800, (o.p.z + TC.z) / 2 + 1400); return [tren(a.lerp(b, ease(u))), o.p.clone().lerp(TC, ease(u)), 46]; });
    // H08 Bầu trời Khe Sanh
    const b52 = () => (KS.MB.b52 && KS.MB.b52[1].visible ? KS.MB.b52[1] : null), c130 = () => (KS.MB.c130 && KS.MB.c130.visible ? KS.MB.c130 : null);
    MAY('C07-01', (u, t) => { const o = b52(); if (!o) return [V3(TC.x - 6000, TC.y + 3200, TC.z + 1500), TC, 46]; const y = o.rotation.y + NB; return [o.position.clone().add(V3(-Math.sin(y) * 260 + 60, 70, -Math.cos(y) * 260 + 40)), o.position.clone().add(V3(Math.sin(y) * 200, -60, Math.cos(y) * 200)), 46]; });
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
    const HQ = diTheo([ll(16.760, 106.600), ll(16.745, 106.615), ll(16.728, 106.633), ll(16.712, 106.650)], 0.97, H('H03').t0);
    DAM.push((t) => { if (!trong(t, 'H03', 2, 2)) return; const o = HQ(t); if (ganMay(o.p.x, o.p.z, 2500)) toNguoi('qgp', o.p, o.yaw, hang(36, 2, 2.4).map(([a, b]) => [a, b, 'di']), t); });
    const CRc = KS.CR, PB = []; KS.PB = PB; glbLoad('data/phao/m-46-130mm.glb').then((g) => { for (let k = 0; k < 3; k++) { const o = KS.napSan(g.scene.clone(true)), x = CRc.x + (k - 1) * 22, z = CRc.z + (k % 2) * 14;
      o.position.set(x, hG(x, z), z); o.rotation.y = huong(o.position, TC) + Math.PI; scene.add(o); PB.push(o); DUNG.push([o, H('H03').t0 - 1, H('H03').t1 + 1]); } });
    DAM.push((t) => { if (!trong(t, 'H03')) return; PB.forEach((o, k) => { if (ganMay(o.position.x, o.position.z, 1200)) toNguoi('qgp', o.position, o.rotation.y + Math.PI, [[-1.6, -2.2, 'quy'], [1.5, -2.6, 'dung'], [0, -4.2, 'nem'], [2.6, -0.5, 'quansat', -0.6]], t + k * 0.3); }); });
    const SCH = ll(16.735, 106.590); const ban = banBanDo(SCH.x, SCH.z, 0.4); DUNG.push([ban, H('H03').t0 - 1, H('H03').t1 + 1]);
    DAM.push((t) => { if (!trong(t, 'H03') || !ganMay(SCH.x, SCH.z, 600)) return; toNguoi('qgp', SCH, 0.4, [[0, -1.25, 'dung'], [-1.35, 0.15, 'dung', 1.5], [1.35, 0.25, 'dung', -1.55], [0.3, 1.35, 'dung', Math.PI], [-0.9, 1.2, 'dung', 2.4]], t); });   /* V1.4: họp bàn — mọi người đứng quanh bàn, chỉ lắc lư nhẹ (Rifle Idle) */
    const DB = (INST.duong && INST.duong.cd_bien_gioi) || [];                                                     /* đường qua biên giới (OSM) — tuyến vận tải MINH HOẠ */
    const VT = DB.length > 1 ? diTheo(DB.filter((_, i) => i % 3 === 0).map(([x, yb]) => G(x, -yb)), 0.97, H('H03').t0 - 120) : null;
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
        o.position.copy(q); o.rotation.set(0, huong(A, LZ) + Math.PI, 0); });
      if (ganMay(LZ.x, LZ.z, 700)) RA_LZ.forEach((f, i) => { const o = f(t); dongDat('my', o.het ? (i % 3 ? 'quy' : 'ngam') : 'chay', t, i * 0.29 % 1, o.p.x, o.p.y, o.p.z, o.het ? o.yaw : o.yaw, 1, i); });   /* lính nhảy khỏi trực thăng, chạy ra vòng ngoài rồi quỳ bắn */
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
    // C01-03 (anh Thắng V1.3: 0:24–0:35 giật): máy bay ở MỘT độ cao cố định (cao hơn đỉnh núi dọc tuyến), vị trí, hướng nhìn đều làm trơn
    const c013 = (u) => { const o = dpAt(0.18 + u * 0.14), f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [o.p.clone().addScaledVector(f, -700).add(V3(300, 0, 0)), o.p.clone().addScaledVector(f, 600)]; };
    let y013 = -1e9; for (let i = 0; i <= 40; i++) { const [p] = c013(i / 40); y013 = Math.max(y013, hG(p.x, p.z)); }
    MAY('C01-03', (u) => { const [p, l] = c013(u); p.y = y013 + 380; l.y = hG(l.x, l.z); return [p, l, 46]; });
    MAY('C01-04', quanh(TC, 2600, 1200, 0.8, 1.6, 44));
    MAY('C01-05', dolly(Q.clone().add(V3(9, 3.5, -7)), Q.clone().add(V3(4, 2.2, -3)), Q.clone().add(V3(0, 1.0, 0)), undefined, 40));
    MAY('C01-06', dolly(Q.clone().add(V3(40, 60, -40)), V3(TC.x + 4000, TC.y + 9000, TC.z + 9000), Q, TC, 48));
    // H03
    MAY('C03-01', (u) => [V3(TC.x - 9000, TC.y + 26000 - u * 2000, TC.z + 6000), V3(TC.x - 7000, TC.y, TC.z - 2000), 48]);
    MAY('C03-02', theo((t) => HQ(t), 40, 26, 34, 44, -10));
    MAY('C03-03', (u) => { const o = PB[1]; if (!o) return [CRc.clone().add(V3(0, 200, 300)), CRc, 44]; const y = o.rotation.y + Math.PI, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 24, 8, Math.cos(y + Math.PI + 0.6) * 24))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44]; });
    MAY('C03-04', dolly(SCH.clone().add(V3(2.6, 2.6, 2.4)), SCH.clone().add(V3(1.5, 2.0, 1.4)), SCH.clone().add(V3(0, 0.8, 0)), undefined, 40));
    MAY('C03-05', (u, t) => VT ? theo(VT, 30, 14, 22, 44, -6)(u, t) : null);
    MAY('C03-06', dolly(V3(TC.x - 6000, TC.y + 5000, TC.z + 9000), V3(TC.x - 4000, TC.y + 14000, TC.z + 12000), V3(TC.x - 4000, TC.y, TC.z), TC, 48));
    // H05 Tết Mậu Thân (thẻ chữ ở bien_dao_gd4.js; máy bay cao quanh vùng)
    const H5 = SCN.find((c) => c.id === 'H05'); if (H5) H5.shots.forEach((s, i) => MAY(s.id, quanh(TC, 15000 - i * 900, 9000 - i * 600, 1.6 + i * 0.35, 1.95 + i * 0.35, 48)));
    // H09
    MAY('C10-01', (u) => [V3(TC.x + 9000, TC.y + 22000, TC.z + 5000), V3(TC.x + 9000, TC.y, TC.z - 1500), 48]);
    MAY('C10-02', quanh(DAU, 70, 26, 2.2, 2.7, 42));
    MAY('C10-03', (u) => { const o = UH[4]; if (!o) return null; const y = o.rotation.y + Math.PI; return [o.position.clone().add(V3(-Math.sin(y) * 160 + 70, 40, -Math.cos(y) * 160 + 50)), o.position.clone().add(V3(Math.sin(y) * 100, -20, Math.cos(y) * 100)), 46]; });
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
  window.__ks.C = C;
}
