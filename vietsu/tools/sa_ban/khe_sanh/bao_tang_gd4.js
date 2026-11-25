  // ================================================================== KHE SANH 1968 · KHÔNG GIAN TRƯNG BÀY KHÍ TÀI (V1.5, 25/11/2026)
  // Anh Thắng: cuối phim có một không gian như bảo tàng, trưng bày khí tài của cả hai bên, mỗi khí tài có ghim tên, bấm vào xem thông tin;
  // có nhân vật đi bộ qua lại; đặt ở một chỗ trên bản đồ không ảnh hưởng không gian trận đánh.
  // Chỗ đặt: khoảng đất bằng nhất (chênh ~4 m trên 420 × 260 m) cách mọi mốc chiến sự ≥ 3,5 km, phía bắc tầng Tà Cơn (dò bằng height.png).
  // Thông số từng khí tài lấy theo nguồn ghi ở từng mục (sources.json); cách bày, bục, biển là quy ước đồ hoạ.
  if (TANG === 'ta-con') {
    const { H } = KS, H12 = H('H12');
    const BT = V3(-490, 0, -7420), RG = 290, D = 165, V0 = -62;                 /* tâm sân, rộng (đông–tây), sâu (bắc–nam), mép bắc theo v */
    let hMax = -1e9, hMin = 1e9; for (let u = -RG / 2; u <= RG / 2; u += 10) for (let v = V0; v <= V0 + D; v += 10) { const h = hG(BT.x + u, BT.z + v); hMax = Math.max(hMax, h); hMin = Math.min(hMin, h); }
    const HF = hMax + 0.5; BT.y = HF;
    matPhang(BT.x, BT.z, 0, -RG / 2, RG / 2, -(V0 + D), -V0, HF);                 /* mặt sân phẳng: người, khí tài đứng trên sàn */
    const P = (u, v, dy = 0) => V3(BT.x + u, HF + dy, BT.z + v);
    const G = new THREE.Group(); G.visible = false; scene.add(G); KS.BT = { G, BT, HF };
    const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
    // nền: khối bệ đá nhạt + mặt sàn kẻ ô (ô 8 m)
    { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#c9c3b6'; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = '#a9a295'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(RG / 8, D / 8); tx.colorSpace = THREE.SRGBColorSpace;
      const day = HF - hMin + 2, be = new THREE.Mesh(new THREE.BoxGeometry(RG, day, D), [mat(0x9d968a), mat(0x9d968a), new THREE.MeshLambertMaterial({ map: tx }), mat(0x9d968a), mat(0x9d968a), mat(0x9d968a)]);
      be.position.set(BT.x, HF - day / 2, BT.z + V0 + D / 2); G.add(be);
      const loi = new THREE.Mesh(new THREE.PlaneGeometry(RG - 30, 7).rotateX(-Math.PI / 2), mat(0x8f6b4e)); loi.position.copy(P(0, -8, 0.02)); G.add(loi); }   /* lối đi giữa (gạch nung) */
    // biển chữ (canvas) — chữ tự vẽ, không dùng ảnh ngoài
    const bien = (dong, rong, cao, nen = '#2a2118', chu = '#f1e2b8') => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * cao / rong); const g = cv.getContext('2d');
      g.fillStyle = nen; g.fillRect(0, 0, cv.width, cv.height); g.strokeStyle = chu; g.lineWidth = 6; g.strokeRect(10, 10, cv.width - 20, cv.height - 20); g.fillStyle = chu; g.textAlign = 'center'; g.textBaseline = 'middle';
      dong.forEach(([t, co], i) => { g.font = `700 ${co}px system-ui, sans-serif`; g.fillText(t, cv.width / 2, cv.height * (i + 0.5) / dong.length); });
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), new THREE.MeshBasicMaterial({ map: tx, side: THREE.DoubleSide })); };
    { const c = bien([['KHÔNG GIAN TRƯNG BÀY KHÍ TÀI', 74], ['CHIẾN DỊCH ĐƯỜNG 9 – KHE SANH 1968', 52], ['Tái dựng mô phỏng · Học Lịch Sử', 36]], 24, 6.5); c.position.copy(P(-RG / 2 + 6, -8, 7.2)); c.rotation.y = -Math.PI / 2; G.add(c);
      for (const s of [-1, 1]) { const tru = new THREE.Mesh(new THREE.BoxGeometry(0.8, 10.5, 0.8), mat(0x6f5a43)); tru.position.copy(P(-RG / 2 + 6, -8 + s * 12.4, 5.25)); G.add(tru); } }
    { const a = bien([['QUÂN GIẢI PHÓNG', 80], ['Quân đội nhân dân Việt Nam', 50]], 16, 4, '#5c1410', '#ffe9a8'); a.position.copy(P(-RG / 2 + 16, -30, 3)); a.rotation.y = -Math.PI / 2; G.add(a);
      const b = bien([['QUÂN ĐỘI MỸ · QUÂN LỰC VNCH', 64], ['Thủy quân lục chiến, Lục quân, Không quân Mỹ; Biệt động quân', 34]], 16, 4, '#1c3468', '#eef3ff'); b.position.copy(P(-RG / 2 + 16, 14, 3)); b.rotation.y = -Math.PI / 2; G.add(b);
      const c1 = KS.taoCo('co-qgp', 2.2, 7, G); c1.position.copy(P(-RG / 2 + 16, -40)); const c2 = KS.taoCo('co-my', 2.2, 7, G); c2.position.copy(P(-RG / 2 + 16, 24));
      const c3 = KS.taoCo('co-vnch', 2.2, 7, G); c3.position.copy(P(-RG / 2 + 16, 30)); }   /* mỗi bên chỉ cắm cờ của mình, cạnh dãy trưng bày của mình */
    // danh mục khí tài: u, v (m, đông / nam so với tâm sân), hướng, bục [dài, rộng], cao ghim, mẫu, dữ liệu thẻ
    const K = [
      { ben: 'qgp', u: -112, v: -40, y: 0.25, buc: [11, 6], h: 2.6, nguoi: [['qgpA', 'dung', -3, 0], ['qgpB', 'ngam', -1, 0.6], ['qgpA', 'quansat', 1.2, -0.3], ['qgpB', 'dung', 3.2, 0.2]],
        ten: 'Chiến sĩ bộ binh Quân Giải phóng', tt: [['Lực lượng chiến dịch', '4 sư đoàn bộ binh, 5 trung đoàn pháo binh, 3 trung đoàn cao xạ, 4 đại đội xe tăng…'], ['Các sư đoàn (theo nguồn Mỹ)', '304, 320, 324, 325']],
        ks: 'Đêm 20 rạng 21/1/1968 mở màn chiến dịch; đợt 2 (10/2 – 31/3) bộ đội đào hào vây lấn sát căn cứ Tà Cơn.', mh: 'Quân phục, trang bị trên mẫu nhân vật là MINH HOẠ.', ng: ['S3', 'M1', 'S1', 'S12'] },
      { ben: 'qgp', u: -78, v: -40, y: 0.45, buc: [10, 6], h: 3.4, mau: 'data/xe/xe-tang-pt76.glb',
        ten: 'Xe tăng lội nước PT-76', tt: [['Khối lượng chiến đấu', 'khoảng 14 tấn'], ['Kíp xe', '3 người'], ['Pháo chính', '76 mm (D-56)'], ['Tốc độ', '44 km/h trên đường; 10 km/h dưới nước'], ['Tầm hoạt động', 'khoảng 260 km trên đường'], ['Thân xe', 'dài 6,91 m, rộng 3,14 m']],
        ks: 'Đêm 6 rạng 7/2/1968, Tiểu đoàn xe tăng 198 với 16 xe PT-76 tiến công cứ điểm Làng Vây — trận đầu đánh thắng của Binh chủng Tăng thiết giáp. Nguồn Mỹ ghi PT-76 đã xuất hiện ở Bản Huội San từ 23–24/1/1968 (hai cách nói lệch nhau, xem tư liệu).', ng: ['M26', 'S8', 'S2', 'M13', 'M12'] },
      { ben: 'qgp', u: -40, v: -40, y: 0.6, buc: [14, 7], h: 3.6, mau: 'data/phao/m-46-130mm.glb',
        ten: 'Pháo nòng dài 130 mm M-46', tt: [['Tầm bắn xa nhất', '27.150 m'], ['Kíp pháo', '8 người'], ['Dài khi hành quân', 'khoảng 11,8 m (38,6 ft)'], ['Khối lượng', 'khoảng 8,3 tấn (ghi 9,2 tấn Mỹ)']],
        ks: 'Pháo 130 mm, 152 mm đặt trên núi Co Roc (Lào), cách căn cứ khoảng 13 km về tây nam; pháo 130 mm bắn xa gần gấp đôi pháo 155 mm của TQLC. Đêm 20 rạng 21/1/1968 pháo binh chiến dịch phát hoả.', ng: ['M36', 'M12', 'M14', 'S7'] },
      { ben: 'qgp', u: -4, v: -40, y: 0.35, buc: [9, 8], h: 3.2, mau: 'data/phao/cao-xa-37-2-nong.glb',
        ten: 'Pháo cao xạ 37 mm hai nòng', tt: [['Cỡ nòng', '37 mm, hai nòng']],
        ks: 'Lực lượng chiến dịch có 3 trung đoàn cao xạ. Phía Mỹ ghi máy bay tiếp tế vào Tà Cơn phải lượn tránh hoả lực phòng không, nhất là súng máy 12,7 mm.', mh: 'Cỡ pháo cao xạ cụ thể dùng quanh Tà Cơn chưa có nguồn đối chiếu — mẫu 37 mm là MINH HOẠ.', ng: ['S3', 'M6'] },
      { ben: 'qgp', u: 30, v: -40, y: 0.6, buc: [10, 6], h: 3.6, mau: 'data/xe/xe-tai.glb', co: 'co-qgp',
        ten: 'Xe vận tải quân sự', tt: [['Nhiệm vụ', 'chở đạn, gạo, thương binh trên các tuyến qua biên giới']],
        ks: 'Hậu cần chiến dịch được bảo đảm qua các tuyến đường vận tải; đường đất đỏ trong phim là tuyến MINH HOẠ.', mh: 'Kiểu xe là MINH HOẠ (mẫu xe tải chung của dự án).', ng: ['S6'] },
      { ben: 'my', u: -116, v: 30, y: Math.PI, buc: [8, 5], h: 2.6, nguoi: [['my', 'dung', -2, 0], ['my', 'ngam', 0, -0.4], ['my', 'quansat', 2, 0.3]], nhom: 'my',
        ten: 'Lính Thủy quân lục chiến Mỹ', tt: [['Quân Mỹ giữ căn cứ và các đồi', 'khoảng 6.000'], ['Đơn vị chính', 'Trung đoàn 26 TQLC (thêm Tiểu đoàn 1/9 TQLC từ 22/1)']],
        ks: 'Từ tháng 1/1968 mũ sắt, áo giáp chống mảnh, mặt nạ phòng độc là bắt buộc trong căn cứ.', mh: 'Trang bị trên mẫu nhân vật là MINH HOẠ.', ng: ['M25', 'M1', 'M20'] },
      { ben: 'vnch', u: -104, v: 30, y: Math.PI, buc: [6, 5], h: 2.6, nguoi: [['vnch', 'dung', -1.2, 0], ['vnch', 'ngam', 1.2, 0.3]],
        ten: 'Biệt động quân VNCH', tt: [['Đơn vị', 'Tiểu đoàn 37 Biệt động quân']],
        ks: 'Giữ khu đông nam căn cứ; trận lớn cuối cùng đánh vào căn cứ (21/2/1968) nhằm vào khu của tiểu đoàn này.', mh: 'Trang bị trên mẫu nhân vật là MINH HOẠ.', ng: ['M1', 'M32', 'M17'] },
      { ben: 'my', u: -76, v: 30, y: Math.PI - 0.45, buc: [12, 7], h: 4.2, mau: 'data/xe/xe-tang-m48.glb', co: 'co-my',
        ten: 'Xe tăng M48A3 Patton', tt: [['Khối lượng', 'khoảng 48,5 tấn'], ['Kíp xe', '4 người'], ['Pháo chính', '90 mm M41'], ['Dài kể cả nòng', '8,68 m'], ['Tốc độ', '48 km/h'], ['Tầm hoạt động', '480 km']],
        ks: 'Trong căn cứ có khu của Tiểu đoàn 3 xe tăng TQLC (sơ đồ căn cứ); căn cứ còn có 10 xe chống tăng Ontos.', ng: ['M41', 'M32', 'M20'] },
      { ben: 'my', u: -40, v: 30, y: Math.PI - 0.5, buc: [8, 6], h: 3.0, mau: 'data/phao/m2a1-105mm.glb',
        ten: 'Pháo 105 mm M101A1 (M2A1)', tt: [['Khối lượng', '2.258 kg'], ['Dài khi hành quân', '5,94 – 5,99 m (hai nguồn lệch ~5 cm)'], ['Tầm bắn xa nhất', '11.270 m'], ['Tốc độ bắn', 'tối đa 10 phát/phút, duy trì 3 phát/phút'], ['Kíp pháo', '8 người']],
        ks: 'Các khẩu đội của Tiểu đoàn 1, Trung đoàn pháo 13 TQLC đặt trong căn cứ; ba khẩu 105 mm đặt trên điểm cao 881 Nam.', ng: ['M34', 'M35', 'M5'] },
      { ben: 'my', u: -2, v: 36, y: Math.PI - 0.6, buc: [17, 15], h: 5.2, mau: 'data/may-bay/uh-1.glb',
        ten: 'Trực thăng UH-1 Iroquois', tt: [['Đường kính cánh quạt', '14,63 m (bản UH-1H)'], ['Dài kể cả cánh quạt', '17,4 m'], ['Tốc độ tối đa', 'khoảng 217 km/h'], ['Tầm bay', 'khoảng 507 km'], ['Động cơ', 'Lycoming T53-L-13']],
        ks: 'Cuộc hành quân Pegasus (1 – 15/4/1968): Sư đoàn Kỵ binh bay đổ quân bằng trực thăng dọc Đường 9 từ bãi đáp LZ Stud; ngày 8/4 tới căn cứ.', mh: 'Số liệu theo bản UH-1H; mẫu 3D là UH-1 chung.', ng: ['M40', 'M3', 'M2'] },
      { ben: 'my', u: 42, v: 68, y: -Math.PI / 2 - 0.25, buc: null, h: 13, mau: 'data/may-bay/c-130a.glb',
        ten: 'Máy bay vận tải C-130A Hercules', tt: [['Sải cánh', '40,4 m'], ['Dài', '29,8 m'], ['Động cơ', '4 động cơ cánh quạt Allison T56'], ['Tốc độ tối đa', 'khoảng 610 km/h'], ['Sức chở', '92 lính hoặc 64 lính dù']],
        ks: 'Không vận vào căn cứ trung bình 165 tấn mỗi ngày. Sau nhiều chiếc trúng đạn khi hạ cánh, chỉ huy Mỹ cấm C-130 đáp xuống Khe Sanh, chuyển sang thả dù hàng.', ng: ['M38', 'M9', 'M39'] },
      { ben: 'my', u: 104, v: 38, y: -Math.PI / 2 + 0.2, buc: null, h: 14, mau: 'data/may-bay/b-52d.glb',
        ten: 'Máy bay ném bom chiến lược B-52D', tt: [['Sải cánh', '56,39 m'], ['Dài', '47,70 m'], ['Động cơ', '8 động cơ phản lực J57'], ['Tốc độ tối đa', '638 dặm/giờ (khoảng 1.030 km/h)'], ['Tầm bay không tiếp dầu', '8.338 dặm (khoảng 13.400 km)'], ['Mang bom', 'hơn 60.000 lb; bản "Big Belly" chở 84 quả bom 500 lb trong khoang']],
        ks: 'Chiến dịch Niagara: B-52 bay 2.548 lượt, ném 59.542 tấn bom quanh Khe Sanh; toàn chiến dịch không quân ném 98.721 tấn bom.', ng: ['M31', 'M19', 'M9', 'M10'] },
    ];
    const BUC = mat(0xddd6c8), VIEN = mat(0x8c8476);
    for (const k of K) {
      if (k.buc) { const [a, b] = k.buc, m = new THREE.Mesh(new THREE.BoxGeometry(a, 0.5, b), [VIEN, VIEN, BUC, VIEN, VIEN, VIEN]); m.position.copy(P(k.u, k.v, 0.25)); G.add(m); k.dy = 0.5; }
      else { const m = new THREE.Mesh(new THREE.RingGeometry(26, 27.2, 48).rotateX(-Math.PI / 2), mat(0xf0e6c8)); m.position.copy(P(k.u, k.v, 0.03)); G.add(m); k.dy = 0; }   /* máy bay lớn: vòng kẻ trên sàn */
      if (k.mau) glbLoad(k.mau).then((g) => { const o = g.scene.clone(true); o.position.copy(P(k.u, k.v, k.dy)); o.rotation.y = k.y; G.add(o); k.o = o;
        if (k.co) { const c = KS.taoCo(k.co, 1.1, 2.6, o); c.position.set(-0.6, 2.0, -1.6); }
        if (G.visible) KS.napSan(o); });
    }
    // người trên bục (đám đông .nvz dùng chung): đứng yên, ngắm, quan sát — không có người ngã hay bắn trong không gian trưng bày
    DAM.push((t) => { if (!G.visible) return; for (const k of K) if (k.nguoi) { const c = Math.cos(k.y), s = Math.sin(k.y);
      k.nguoi.forEach(([ten, clip, a, q], i) => { const x = BT.x + k.u + a * c, z = BT.z + k.v - a * s; dongDat(ten, clip, t, (i * 0.37) % 1, x, HF + k.dy, z, k.y + q, 1, i); }); } });
    // ghim tên + thẻ thông tin
    let NG = {}; fetch(PU('sources.json')).then((r) => r.json()).then((j) => { for (const x of j.sources || []) NG[x.id] = x; }).catch(() => {});
    const the = document.createElement('div'); the.id = 'btThe'; the.hidden = true; document.body.appendChild(the);
    const moThe = (k) => { the.replaceChildren(); const x = document.createElement('button'); x.className = 'dong'; x.textContent = '×'; x.onclick = () => { the.hidden = true; };
      const h = document.createElement('h3'); h.textContent = k.ten;
      const b = document.createElement('div'); b.className = 'ben ' + k.ben; b.textContent = { qgp: 'Quân Giải phóng (Quân đội nhân dân Việt Nam)', my: 'Quân đội Mỹ', vnch: 'Quân lực Việt Nam Cộng hòa' }[k.ben];
      const tb = document.createElement('table'); for (const [a, v] of k.tt) { const r = tb.insertRow(); r.insertCell().textContent = a; r.insertCell().textContent = v; }
      const p = document.createElement('p'); p.textContent = 'Ở Khe Sanh: ' + k.ks;
      the.append(x, h, b, tb, p);
      if (k.mh) { const m = document.createElement('p'); m.className = 'mh'; m.textContent = k.mh; the.append(m); }
      const n = document.createElement('div'); n.className = 'src'; n.textContent = 'Nguồn: ' + k.ng.map((id) => NG[id] ? `${id} · ${NG[id].title}` : id).join('; '); the.append(n);
      the.hidden = false; };
    KS.BT.moThe = moThe; KS.BT.K = K;
    GHIM_SAU.push(() => { for (const k of K) addLabel(k.ten, BT.x + k.u, BT.z + k.v, 'hero ' + (k.ben === 'qgp' ? 'ly' : 'btmy'), { grp: 'hero', maxDist: 300, yFn: () => HF + k.dy + k.h + 0.8,
      show: () => G.visible, onClick: () => moThe(k) }); });
    // hiện / ẩn: chỉ hiện ở hồi cuối và khi tự khám phá — trong phim các hồi trận đánh không thấy
    let napXong = false;
    // chạy theo khung hình của trình duyệt (cả khi phim dừng, khi khám phá, khi đi bộ — KS.cap chỉ chạy trong phim)
    const capBT = () => { const t = T, on = appMode !== 'film' || t >= H12.t0 - 1.5;
      if (on !== G.visible) { G.visible = on; if (on && !napXong) { napXong = true; KS.napSan(G); } if (!on) the.hidden = true; }
      nut.hidden = !(on && !W.on && !document.getElementById('load') && (appMode === 'film' ? t >= H12.t0 + 2 : true)); nut.classList.toggle('nho', appMode !== 'film'); };   /* khám phá: nút nhỏ ở góc, bấm là tới sân trưng bày */
    // V1.6: đi bộ không xuyên qua bục trưng bày — chạm mép bục thì bị đẩy ra theo phía gần nhất (máy bay lớn không có bục: đi dưới cánh được)
    const chanBuc = () => { if (!W.on || !G.visible) return; for (const k of K) { if (!k.buc) continue; const dx = W.pos.x - (BT.x + k.u), dz = W.pos.z - (BT.z + k.v), hx = k.buc[0] / 2 + 0.45, hz = k.buc[1] / 2 + 0.45;
      if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) placeAvatarAt(BT.x + k.u + Math.sign(dx || 1) * hx, W.pos.z); else placeAvatarAt(W.pos.x, BT.z + k.v + Math.sign(dz || 1) * hz); } } };
    const lapBT = () => { try { capBT(); chanBuc(); } catch (e) {} requestAnimationFrame(lapBT); };
    // nút vào đi bộ tham quan (cuối phim và khi khám phá)
    const nut = document.createElement('button'); nut.id = 'btVao'; nut.hidden = true; nut.textContent = '🚶 Vào tham quan khí tài (đi bộ)'; document.body.appendChild(nut);
    requestAnimationFrame(lapBT);
    nut.onclick = () => { setPlaying(false); setAppMode('explore'); flyA = null;
      controls.target.copy(P(-RG / 2 + 22, -8, 1.6)); camera.position.copy(controls.target).add(V3(-9, 3, 0)); setWalk(true); };
    // máy quay hồi kết (H12): bay xuống sân, lia dọc hai dãy, quanh máy bay, dừng ở cổng
    const dolly = (a, b, la, lb, fov = 42) => (u) => { const e = ease(u); return [a.clone().lerp(b, e), la.clone().lerp(lb, e), fov]; };
    const C14 = { 'C14-01': (u) => { const a = 2.6 - ease(u) * 1.0, r = 420 - ease(u) * 230; return [P(Math.sin(a) * r, Math.cos(a) * r, 190 - ease(u) * 140), P(0, 10, 0), 46]; },
      'C14-02': dolly(P(-135, -14, 9), P(45, -14, 7), P(-100, -40, 2), P(40, -40, 2), 44),
      'C14-03': dolly(P(-135, 6, 8), P(20, 4, 6), P(-100, 30, 1.5), P(10, 34, 2), 44),
      'C14-04': (u) => { const a = -1.2 + ease(u) * 1.6, c = P(75, 50, 3); return [c.clone().add(V3(Math.sin(a) * 95, 22 - u * 6, Math.cos(a) * 95)), c, 44]; },
      'C14-05': dolly(P(-RG / 2 - 30, -8, 14), P(-RG / 2 - 4, -8, 5), P(0, -6, 2), P(0, -6, 2), 50) };
    for (const [id, fn] of Object.entries(C14)) SHOTS[id] = fn;
  }
