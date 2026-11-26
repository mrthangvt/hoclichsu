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
