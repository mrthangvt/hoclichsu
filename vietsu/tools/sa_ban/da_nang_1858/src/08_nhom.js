// ---------- bố trí nhân vật theo kịch bản ----------
const NV = {};      // nhân vật có tên: id -> nhóm
function kipPhao(p, t0, t1, id, seed = 0) {
  // 4 người sau khẩu pháo: nạp đạn, ngắm, hai người đứng
  const d = p.dir, x = p.pos.x - d.x * 1.8, n = -(p.pos.z - d.z * 1.8), rx = -d.z, rz = d.x;
  const vitri = [[-1.0, 0.3], [1.0, 0.2], [-1.5, 1.4], [1.3, 1.5]];   // V1.4: pháo lùi vào, kíp đứng gọn trên mặt thành
  return nhom({ id, phe: 'phaothu', so: 4, vitri, lich: [[0, x, n, 'dung']], huong: [p.pos.x + d.x * 50, -(p.pos.z + d.z * 50)], hien: [t0, t1], y: p.pos.y, seed,
    anRieng: (m, t, an) => { const k = vitri.findIndex(v => v[0] === m.lx && v[1] === m.lz); return k === 0 ? ANIM.napphao : k === 1 ? ANIM.ngam : an; } });
}
function boTriNhanVat() {
  const v = VT, END = ST.dur + 5;
  const dh = CONG['dien-hai'], ah = CONG['an-hai'];
  const yDH = dh.position.y + 5.2;
  // --- Hồi 1: làng chài, thuyền
  nhom({ id: 'dan-cheo', phe: 'dan', so: 2, hinh: 'hang', kc: 1.2, lich: [[0, v['lang-chai'].x - 60, v['lang-chai'].n + 70, 'cheo']], hien: [0, TS('C04-01')], y: 0.35, huong: 290 });
  // --- lính trên thành Điện Hải, An Hải (đến khi rút)
  const phaoDH = PHAO.filter(p => p.ten === 'dien-hai'), phaoAH = PHAO.filter(p => p.ten === 'an-hai');
  phaoDH.slice(0, 8).forEach((p, k) => kipPhao(p, 0, TC('C05', 6), 'kip-dh-' + k, k));
  phaoAH.slice(0, 6).forEach((p, k) => kipPhao(p, 0, TC('C05', 5), 'kip-ah-' + k, k + 20));
  PHAO.filter(p => p.ten === 'son-tra-tay').forEach((p, k) => kipPhao(p, 0, TC('C04', 13), 'kip-st-' + k, k + 40));
  PHAO.filter(p => p.ten === 'dinh-hai').forEach((p, k) => kipPhao(p, 0, END, 'kip-dinh-' + k, k + 60));
  nhom({ id: 'dh-trong', phe: 'nguyen', so: 40, hinh: 'khoi', cot: 8, kc: 2.2, lich: [[0, v['dien-hai'].x - 10, v['dien-hai'].n + 25, 'dung'], [TC('C05', 6), v['dien-hai'].x - 10, v['dien-hai'].n + 25, 'dung'], [TC('C05', 6) + 30, v['hai-chau'].x, v['hai-chau'].n + 60, 'chay']], huong: 0, hien: [0, TC('C05', 6) + 30], y: null });
  nhom({ id: 'ah-trong', phe: 'nguyen', so: 30, hinh: 'khoi', cot: 6, kc: 2.2, lich: [[0, v['an-hai'].x, v['an-hai'].n + 10, 'dung'], [TC('C05', 5), v['an-hai'].x, v['an-hai'].n + 10, 'dung'], [TC('C05', 5) + 26, v['nai-hien'].x, v['nai-hien'].n + 80, 'chay']], huong: 0, hien: [0, TC('C05', 5) + 26] });
  NV['tran-hoang'] = nhom({ id: 'tran-hoang', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[0, v['dien-hai'].x + 4, v['dien-hai'].n + 50, 'chihuy']], huong: [0, 2000], hien: [TS('C03-01'), TC('C05', 6)], ten: 'Trần Hoằng', mauRieng: { A: '#5a1c18', C: '#1a1a1a' } });
  // --- Hồi 3: lính gác Hải Vân, người đưa tin
  const hv = v['hai-van'];
  nhom({ id: 'gac-hv', phe: 'nguyen', so: 3, hinh: 'hang', kc: 1.6, lich: [[0, hv.x + 22, hv.n - 14, 'ngam']], huong: [-1500, 9000], hien: [0, END], vk: 'khong' });
  nhom({ id: 'linh-hv', phe: 'nguyen', so: 12, hinh: 'tan', r: 14, lich: [[0, hv.x + 34, hv.n - 30, 'dung']], huong: [-1500, 9000], hien: [0, END] });
  // --- Hồi 2, 11: bộ chỉ huy liên quân trên kỳ hạm (toạ độ cục bộ của tàu: x ngang, n về mũi)
  const banTau = (t0, t1, id) => {
    nhom({ id: id + '-rg', phe: 'phapxanh', so: 1, vk: 'khong', lich: [[0, 1.6, 14 - 1.2, 'chihuy']], huong: 0, tren: 'tau:0', hien: [t0, t1], ten: 'Rigault de Genouilly', mauRieng: { A: '#141c34', B: '#141c34', C: '#141c34' } });
    nhom({ id: id + '-sq', phe: 'phapxanh', so: 4, vk: 'khong', hinh: 'tan', vitri: [[-1.4, 13.4], [0.4, 15.3], [2.4, 15.2], [3.0, 13.6]], lich: [[0, 0, 0, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1] });
    nhom({ id: id + '-tbn', phe: 'tbn', so: 1, vk: 'khong', lich: [[0, -0.6, 14 + 1.4, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1], ten: 'Sĩ quan Tây Ban Nha', mauRieng: { A: '#2c3c5a', C: '#2c3c5a' }, mu: 'kepi' });
    nhom({ id: id + '-thuy', phe: 'thuy', so: 14, hinh: 'tan', r: 9, lich: [[0, 0, -10, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1] });
  };
  banTau(TS('C02-02'), TE('C02-03'), 'ban1'); banTau(TS('C11-01'), TE('C11-02'), 'ban2');
  NV['rigault'] = NHOM.find(o => o.id === 'ban1-rg');
  nhom({ id: 'tau1-tb', phe: 'thuy', so: 26, hinh: 'khoi', cot: 6, kc: 1.5, lich: [[0, 0, -6, 'dung']], huong: 0, tren: 'tau:1', hien: [TS('C02-05'), TE('C02-05')], anRieng: (m, t, an) => m.ph < 0.4 ? ANIM.napphao : an });
  nhom({ id: 'tau1-bb', phe: 'phap', so: 30, hinh: 'khoi', cot: 6, kc: 1.3, lich: [[0, 0, 8, 'dung']], huong: 0, tren: 'tau:1', hien: [TS('C02-05'), TE('C02-05')], anRieng: (m, t, an) => m.ph < 0.3 ? ANIM.ngam : an });
  // kíp pháo trên tàu 2 (cận cảnh Hồi 4)
  nhom({ id: 'tau2-kip', phe: 'thuy', so: 16, hinh: 'tan', vitri: Array.from({ length: 16 }, (_, k) => [(k % 2 ? 1 : -1) * 3.6, -9 + Math.floor(k / 2) * 3]), lich: [[0, 0, 0, 'napphao']], huong: 90, tren: 'tau:2', hien: [TS('C04-01'), TE('C05-05')] });
  // --- Hồi 4: đổ bộ (16 xuồng)
  const st = v['bai-st'], bh = v['bai-han'];
  XUONG.length = 0;
  for (let k = 0; k < 16; k++) {
    const den = k < 10 ? [st.x - 40 + (k % 5) * 22, st.n - 30 - Math.floor(k / 5) * 22] : [bh.x - 50 + (k % 3) * 25, bh.n + 30 + Math.floor((k - 10) / 3) * 20];
    const tu0 = [VT_BAN1[4], VT_BAN1[5], VT_BAN1[3]][k % 3], tu = [tu0[0] + (k % 4) * 30, tu0[1] - Math.floor(k / 4) * 25];
    { const L = Math.hypot(tu[0] - den[0], tu[1] - den[1]); for (let d = 0; d < L; d += 5) { const x = den[0] + (tu[0] - den[0]) * d / L, n = den[1] + (tu[1] - den[1]) * d / L; if (hAt(x, n) < -0.6) { den[0] = x; den[1] = n; break; } } }
    XUONG.push({ lich: [[TS('C04-03'), tu[0] + 40, tu[1] - 30], [TS('C04-04') + 2, lerp(tu[0], den[0], 0.25), lerp(tu[1], den[1], 0.25)], [TE('C04-04') - 1, den[0], den[1]], [TS('C06-01'), den[0], den[1]]], hien: [TS('C04-03'), TS('C06-01')] });
    nhom({ id: 'xuong-' + k, phe: k % 3 ? 'phap' : 'thuy', so: 10, vitri: Array.from({ length: 10 }, (_, j) => [(j % 2 ? 0.55 : -0.55), -3.2 + Math.floor(j / 2) * 1.5]), lich: [[0, 0, 0, 'cheo']], huong: 0, tren: 'xuong:' + k, hien: [TS('C04-03'), TE('C04-04') - 1], y: 0.15, seed: k });
  }
  nhom({ id: 'dobo-st', phe: 'phap', so: 120, hinh: 'khoi', cot: 12, kc: 1.5, lich: [[TE('C04-04') - 1, st.x - 20, st.n - 10, 'dung'], [TS('C05-01'), st.x + 160, st.n + 60, 'di'], [TS('C06-01'), v['trai-phap'].x, v['trai-phap'].n - 40, 'di']], huong: [v['trai-phap'].x, v['trai-phap'].n], hien: [TE('C04-04') - 1, TS('C06-01')] });
  nhom({ id: 'dobo-han', phe: 'tbn', so: 60, hinh: 'khoi', cot: 10, kc: 1.5, lich: [[TE('C04-04') - 1, bh.x + 10, bh.n - 15, 'dung'], [TC('C05', 7), bh.x + 30, bh.n - 60, 'dung'], [TC('C05', 7) + 25, v['an-hai'].x, v['an-hai'].n + 30, 'chay'], [TS('C06-01'), v['an-hai'].x, v['an-hai'].n + 30, 'dung']], huong: [v['an-hai'].x, v['an-hai'].n], hien: [TE('C04-04') - 1, TS('C08-01')] });
  nhom({ id: 'vao-dh', phe: 'phap', so: 80, hinh: 'khoi', cot: 10, kc: 1.5, lich: [[TC('C05', 7), 1250, -650, 'dung'], [TC('C05', 7) + 22, v['dien-hai'].x + 5, v['dien-hai'].n + 120, 'chay'], [TS('C06-01'), v['dien-hai'].x + 5, v['dien-hai'].n + 30, 'di']], huong: 180, hien: [TC('C05', 7), TS('C06-01')] });
  // --- Hồi 6: Cẩm Lệ
  const cl = v['cam-le'];
  NV['le-dinh-ly'] = nhom({ id: 'le-dinh-ly', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[TS('C06-01'), -4300, -3300, 'di'], [TS('C06-02'), -1650, -8330, 'chihuy'], [TC('C06', 6) + 2, -1650, -8330, 'chihuy'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [300, -6800], hien: [TS('C06-01'), TE('C06-05') + 8], ten: 'Lê Đình Lý', mauRieng: { A: '#6a1a16', C: '#161616' },
    anRieng: (m, t, an) => t > TC('C06', 6) ? ANIM.cang : an });
  nhom({ id: 'ldl-khieng', phe: 'nguyen', so: 2, vk: 'khong', vitri: [[0, 1.0], [0, -1.0]], lich: [[TC('C06', 6) + 2, -1650, -8330, 'dung'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [-1900, -8500], hien: [TC('C06', 6), TE('C06-05') + 8] });
  nhom({ id: 'ldl-ve', phe: 'nguyen', so: 6, hinh: 'tan', r: 4, lich: [[TS('C06-02'), -1655, -8338, 'dung'], [TC('C06', 6) + 2, -1655, -8338, 'dung'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [300, -6800], hien: [TS('C06-02'), TE('C06-05') + 8] });
  nhom({ id: 'vien-binh', phe: 'nguyen', so: 240, hinh: 'khoi', cot: 6, kc: 1.5, lich: [[TS('C06-01'), -4300, -3250, 'di'], [TE('C06-01'), -3900, -3900, 'di'], [TS('C06-03'), -1350, -8150, 'di'], [TS('C06-03') + 1, -1350, -8150, 'dung']], huong: [300, -6800], hien: [TS('C06-01'), TS('C06-03') + 1] });
  nhom({ id: 'cl-tuyen', phe: 'nguyen', so: 260, hinh: 'hang', kc: 2.2, hai: 1, lich: [[TS('C06-03'), -900, -8080, 'dung'], [TC('C06', 4), -900, -8080, 'ngam'], [TE('C06-05') + 6, -900, -8080, 'dung']], huong: [300, -6800], hien: [TS('C06-03'), TS('C07-01')], chet: [TC('C06', 5), 0.12, 10],
    anRieng: (m, t, an) => (an === ANIM.ngam && m.ph > 0.55) ? ANIM.dung : an });
  nhom({ id: 'cl-lien', phe: 'phap', so: 180, hinh: 'hang', kc: 2, hai: 1, lich: [[TS('C06-03'), 900, -6100, 'di'], [TC('C06', 4), -350, -7550, 'di'], [TC('C06', 4) + 1, -350, -7550, 'ngam'], [TE('C06-05'), -350, -7550, 'ngam'], [TS('C07-01'), 600, -6300, 'di']], huong: [-1300, -8300], hien: [TS('C06-03'), TS('C07-01')], chet: [TC('C06', 5), 0.08, 8] });
  nhom({ id: 'cl-tbn', phe: 'tbn', so: 80, hinh: 'hang', kc: 2, lich: [[TS('C06-03'), 1300, -6300, 'di'], [TC('C06', 4), 100, -7750, 'di'], [TC('C06', 4) + 1, 100, -7750, 'ngam'], [TS('C07-01'), 1000, -6500, 'di']], huong: [-1300, -8300], hien: [TS('C06-03'), TS('C07-01')] });
  // --- Hồi 7: bộ chỉ huy Nguyễn Tri Phương (ƯỚC LƯỢNG, gần đồn Liên Trì)
  const bx = 430, bn = -5420;
  NV['ntp'] = nhom({ id: 'ntp', phe: 'nguyen', kind: 'ntp', so: 1, mu: 'khan', vk: 'khong', lich: [[0, bx, bn - 1.1, 'chihuy']], huong: [bx, bn], hien: [TS('C07-02'), TE('C09-01')], ten: 'Nguyễn Tri Phương', mauRieng: { A: '#7a1712', B: '#2a1e18', C: '#1a1410' } });
  NV['pth'] = nhom({ id: 'pth', phe: 'nguyen', so: 1, mu: 'khan', vk: 'khong', lich: [[0, bx + 1.6, bn + 0.4, 'dung']], huong: [bx, bn], hien: [TS('C07-02'), TE('C09-01')], ten: 'Phạm Thế Hiển', mauRieng: { A: '#2b3566', C: '#1a1a1a' } });
  nhom({ id: 'ntp-tuong', phe: 'nguyen', so: 4, mu: 'khan', vk: 'khong', vitri: [[-1.6, 0.3], [-0.6, 1.3], [0.7, 1.3], [1.6, -1.0]], lich: [[0, bx, bn, 'dung']], huong: 0, hien: [TS('C07-02'), TE('C09-01')], anRieng: (m) => ANIM.dung, mauRieng: { C: '#1a1a1a' } });
  nhom({ id: 'ntp-ve', phe: 'nguyen', so: 10, hinh: 'hang', kc: 2.5, lich: [[0, bx, bn - 9, 'dung']], huong: 0, hien: [TS('C07-02'), TE('C09-01')] });
  // --- Hồi 8: đào lũy, chở tre
  nhom({ id: 'dao-luy', phe: 'danbinh', so: 60, hinh: 'tan', r: 22, vk: 'xeng', lich: [[0, -900, -3440, 'dao']], huong: 0, hien: [TS('C08-01'), TE('C08-04')], anRieng: (m, t, an) => m.ph < 0.2 ? ANIM.khieng : an });
  nhom({ id: 'buoc-chong', phe: 'danbinh', so: 4, vk: 'khong', vitri: [[-1.2, 0.8], [0.2, 1.5], [1.4, 0.6], [2.5, 1.6]], lich: [[0, -890, -3452, 'ngoi']], huong: 180, hien: [TS('C08-01'), TE('C08-04')], anRieng: (m, t, an) => m.ph < 0.5 ? ANIM.ngoi : ANIM.dao });
  nhom({ id: 'cho-tre', phe: 'dan', so: 24, hinh: 'khoi', cot: 2, kc: 2.2, vk: 'bo', lich: [[TS('C08-02'), -900, -3700, 'khieng'], [TE('C08-04'), -880, -3460, 'khieng']], huong: 0, hien: [TS('C08-02'), TE('C08-04')] });
  nhom({ id: 'dao-luy2', phe: 'nguyen', so: 40, hinh: 'tan', r: 30, vk: 'xeng', lich: [[0, 300, -3420, 'dao']], huong: 0, hien: [TS('C08-02'), TE('C08-04')] });
  // lính giữ lũy (Hồi 8 → hết)
  const giuLuy = (id, pts, so, t0, t1, phe = 'nguyen', an = 'dung') => {
    const [a, b] = pts, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / L, nn = (b[0] - a[0]) / L;   // về phía Bắc của đoạn
    const vit = Array.from({ length: so }, (_, k) => { const u = (k + 0.5) / so; return [a[0] + (b[0] - a[0]) * u - nx * 5, a[1] + (b[1] - a[1]) * u - nn * 5]; });
    return nhom({ id, phe, so, vitri: vit.map(p => [p[0], -p[1]]), lich: [[0, 0, 0, an]], huong: 180, hien: [t0, t1], seed: so, anRieng: (m, t, a2) => a2 });
  };
  // dân binh & lính trên đoạn Thạc Gián (cận cảnh Hồi 9, 10, 11, 12)
  nhom({ id: 'tg-giu', phe: 'nguyen', so: 70, hinh: 'hang', kc: 3.2, lich: [[0, -480, -3492, 'dung'], [TS('C09-02') + 6, -480, -3492, 'ngam'], [TS('C09-05'), -480, -3492, 'dung']], huong: 0, hien: [TS('C08-04'), END],
    anRieng: (m, t, an) => { if (t > TS('C12-01') && m.ph < 0.5) return ANIM.ngoi; if (an === ANIM.ngam && m.ph > 0.6) return ANIM.napphao; return an; } });
  nhom({ id: 'tg-dan', phe: 'danbinh', so: 30, hinh: 'hang', kc: 5, lich: [[0, -470, -3500, 'dung']], huong: 0, hien: [TS('C09-01'), END], anRieng: (m, t, an) => (t > TS('C12-01') && m.ph < 0.6) ? ANIM.ngoi : an });
  nhom({ id: 'tg-vachi', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[0, -520, -3500, 'chihuy']], huong: 0, hien: [TS('C09-02'), TE('C09-05')] });
  // Hồi 9: liên quân tấn công Thạc Gián và Nại Hiên rồi rút
  nhom({ id: 'cong-phap', phe: 'phap', so: 150, hinh: 'hang', kc: 2.2, hai: 1, lich: [[TS('C09-02'), 400, -2550, 'di'], [TS('C09-04'), -420, -3200, 'di'], [TS('C09-04') + 1, -420, -3200, 'ngam'], [TS('C09-05'), -420, -3200, 'ngam'], [TS('C09-05') + 1, -420, -3200, 'chay'], [TE('C09-05'), 500, -2500, 'chay']], huong: [-480, -3500], hien: [TS('C09-01'), TE('C09-05')], chet: [TS('C09-04') + 2, 0.15, 9] });
  nhom({ id: 'cong-tbn', phe: 'tbn', so: 80, hinh: 'hang', kc: 2.2, lich: [[TS('C09-02'), 2300, -2400, 'di'], [TS('C09-04'), 2300, -3500, 'di'], [TS('C09-04') + 1, 2300, -3500, 'ngam'], [TS('C09-05'), 2300, -3500, 'ngam'], [TS('C09-05') + 1, 2300, -3500, 'chay'], [TE('C09-05'), 2250, -2300, 'chay']], huong: [2350, -3800], hien: [TS('C09-01'), TE('C09-05')] });
  nhom({ id: 'nh-giu', phe: 'nguyen', so: 60, hinh: 'hang', kc: 2.6, lich: [[0, 2380, -3760, 'ngam']], huong: 0, hien: [TS('C09-01'), END], anRieng: (m, t, an) => (t > TE('C09-05') ? ANIM.dung : an) });
  // Hồi 10: doanh trại, vận tải, quân y (Sơn Trà); quân Nguyễn củng cố lũy dưới mưa
  const tp = v['trai-phap'];
  nhom({ id: 'trai-linh', phe: 'phap', so: 60, hinh: 'tan', r: 40, lich: [[0, tp.x, tp.n, 'dung']], huong: 200, hien: [TS('C06-01'), TE('C11-05')], anRieng: (m, t, an) => m.ph < 0.35 ? ANIM.ngoi : m.ph < 0.45 ? ANIM.di : an });
  nhom({ id: 'trai-om', phe: 'phap', so: 8, hinh: 'hang', kc: 1.2, lich: [[0, tp.x - 12, tp.n - 28, 'chet']], huong: 90, hien: [TS('C10-01'), TE('C10-05')], anRieng: () => ANIM.chet, mauRieng: { A: '#d8d4c8' } });
  nhom({ id: 'van-tai', phe: 'thuy', so: 18, hinh: 'khoi', cot: 2, kc: 2, vk: 'bo', lich: [[TS('C10-01'), st.x, st.n + 10, 'khieng'], [TE('C10-03'), tp.x - 20, tp.n - 20, 'khieng']], huong: 0, hien: [TS('C10-01'), TE('C10-03')] });
  nhom({ id: 'dh-lq', phe: 'phap', so: 50, hinh: 'tan', r: 35, lich: [[0, v['dien-hai'].x, v['dien-hai'].n, 'dung']], huong: 180, hien: [TS('C06-01'), TE('C12-02')], y: dh.position.y + 0.3 });
  nhom({ id: 'mua-dao', phe: 'danbinh', so: 40, hinh: 'tan', r: 25, vk: 'xeng', lich: [[0, -520, -3470, 'dao']], huong: 0, hien: [TS('C10-04'), TE('C10-04')] });
  // Hồi 12: dân trở lại làng
  nhom({ id: 'dan-ve', phe: 'dan', so: 30, hinh: 'tan', r: 45, lich: [[0, v['lang-chai'].x, v['lang-chai'].n - 15, 'dung']], huong: [v['lang-chai'].x, v['lang-chai'].n + 200], hien: [TS('C12-03'), END], anRieng: (m, t, an) => m.ph < 0.4 ? ANIM.di : an });
}
// xuồng đổ bộ (vị trí theo lịch)
const XUONG = [];
let XUONG_IM = null;
function xuongCapNhat(t) {
  if (!XUONG_IM) { XUONG_IM = new THREE.InstancedMesh(xuongGeo(), MATV, 16); XUONG_IM.frustumCulled = false; scene.add(XUONG_IM); XUONG.forEach(x => x.obj = new THREE.Object3D()); }
  const m = new THREE.Matrix4(); let n = 0;
  XUONG.forEach((x, k) => {
    if (t < x.hien[0] || t > x.hien[1]) { x.obj.visible = false; return; }
    const L = x.lich; let p = L[L.length - 1], h = 0;
    for (let i = 0; i < L.length - 1; i++) if (t >= L[i][0] && t < L[i + 1][0]) { const u = (t - L[i][0]) / (L[i + 1][0] - L[i][0]); p = [0, lerp(L[i][1], L[i + 1][1], u), lerp(L[i][2], L[i + 1][2], u)]; h = Math.atan2(L[i + 1][1] - L[i][1], L[i + 1][2] - L[i][2]); x.h = h; break; }
    if (t < L[0][0]) p = L[0];
    x.obj.visible = true; x.obj.position.set(p[1], Math.sin(t * 1.3 + k) * 0.08, -p[2]); x.obj.rotation.set(0, -(x.h || 0), Math.sin(t + k) * 0.03); x.obj.updateMatrixWorld();
    XUONG_IM.setMatrixAt(n++, x.obj.matrixWorld);
  });
  XUONG_IM.count = n; XUONG_IM.instanceMatrix.needsUpdate = true;
}
