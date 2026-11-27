// ---------- V1.3: Bảo tàng vật dụng, binh khí thời kỳ 1858 (sân trưng bày + nhà trưng bày) ----------
// Mẫu 3D là MINH HOẠ (dựng theo ảnh anh gửi); thông số trên thẻ ghi theo nguồn dẫn kèm.
const BT = { M: [-4900, -2900], grp: null, on: false, tCu: 0, camCu: null, items: [], chon: -1, bay: null, nhan: [], va: [], tg: 0 };
const BT_NGUON = {
  vnp: ['TTXVN/VietnamPlus – Đà Nẵng: phát hiện súng thần công cổ tại Thành Điện Hải', 'https://www.vietnamplus.vn/da-nang-phat-hien-sung-than-cong-co-tai-thanh-dien-hai-post1143356.vnp'],
  sggp: ['SGGP – Đà Nẵng tìm giải pháp phát huy giá trị di tích thành Điện Hải', 'https://www.sggp.org.vn/da-nang-tim-giai-phap-phat-huy-gia-tri-di-tich-thanh-dien-hai-post460362.html'],
  vtc: ['VTC News – Vị vua nào trong sử Việt có tài bắn súng bách phát bách trúng (dẫn Việt sử khảo luận)', 'https://www.vtcnews.vn/vi-vua-nao-trong-su-viet-co-tai-ban-sung-bach-phat-bach-trung-ar915195.html'],
  hl: ['Holylandvietnamstudies – Soldiers and Guns (súng hỏa mai, điểu thương)', 'https://holylandvietnamstudies.com/blog/solders-and-guns/'],
  lef: ['Wikipedia – Lefaucheux M1858', 'https://en.wikipedia.org/wiki/Lefaucheux_M1858'],
  m57: ['Drouot – Percussion rifle model 1857 of navy (thông số hiện vật đấu giá)', 'https://drouot.com/en/l/18161660-perkussionsgewehr-modell-1857'],
  min: ['Victorian Web – The Minié rifle', 'https://victorianweb.org/history/crimea/minie.html'],
  tour: ['Wikipedia – Siege of Tourane', 'https://en.wikipedia.org/wiki/Siege_of_Tourane'],
  cb: ['Cục Văn thư và Lưu trữ Nhà nước – Châu bản triều Nguyễn về cuộc kháng chiến tại Đà Nẵng', 'https://archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/chau-ban-trieu-nguyen-ve-cuoc-khang-chien-chong-lien-quan-phap-tay-ban-nha-tai-da-nang-nhung-ngay-dau.htm'],
  ddk: ['Đại Đoàn Kết – Nơi lưu dấu danh tướng Nguyễn Tri Phương đón nhận bằng di tích quốc gia đặc biệt', 'https://daidoanket.vn/noi-luu-dau-danh-tuong-nguyen-tri-phuong-don-nhan-bang-di-tich-quoc-gia-dac-biet-10098779.html'],
  vp: ['Vinpearl – Thành Điện Hải, kiến trúc quân sự trăm tuổi', 'https://vinpearl.com/vi/thanh-dien-hai-kien-truc-quan-su-tram-tuoi-o-da-nang-co-gi-dac-biet'],
  bpl: ['Báo Pháp luật – Lịch sử rất gần (đài Điện Hải, bảo An Hải năm 1813)', 'https://baophapluat.vn/lich-su-rat-gan-post82365.html'],
  bt: ['Bảo tàng Lịch sử Quốc gia – Liên quân Pháp – Tây Ban Nha nổ súng đánh thành Đà Nẵng (9/1858)', 'https://baotanglichsuquocgia.vn/vi/Articles/2002/68063/lien-quan-phap-tay-ban-nha-no-sung-djanh-thanh-dja-nang-mo-djau-cuoc-xam-luoc-viet-nam-lan-thu-nhat-9-1858.html'],
};
const BT_DS = [
  { id: 'thancong', ten: 'Súng thần công', phe: 'Quân triều Nguyễn', p: [-9, -3.5], bang: [-11.6, -1.6, 0.5],
    mo: 'Đại bác đặt trên các thành, đồn ven vịnh Đà Nẵng. Theo Bảo tàng Đà Nẵng, súng thần công có cấu tạo gồm nòng, thân, khối hậu và lỗ điểm hỏa; hai bên thân có trục quay để gắn vào bệ, chỉnh hướng và góc bắn. Bảo tàng hiện lưu giữ 14 khẩu: 13 khẩu gang – sắt tìm thấy ở khu vực Thành Điện Hải và hệ thống phòng thủ Đà Nẵng, 1 khẩu đồng tìm thấy ở Xuân Thiều.',
    so: ['Chất liệu: gang – sắt (13 khẩu), đồng (1 khẩu)', 'Bộ phận: nòng, thân, khối hậu, lỗ điểm hỏa, trục quay'], minh: 'Mẫu 3D trên bệ gỗ có bánh là MINH HOẠ theo mẫu anh gửi.', ng: ['vnp', 'sggp'] },
  { id: 'thancong2', ten: 'Súng thần công', phe: 'Quân triều Nguyễn', p: [9, -3.5], bang: [11.6, -1.6, -0.5], an: true, nhu: 0 },
  { id: 'dieuthuong', ten: 'Súng điểu thương', phe: 'Quân triều Nguyễn', p: [-14, -13], bang: [-12.1, -11.9, 0],
    mo: 'Súng tay của bộ binh nhà Nguyễn. Theo sách Việt sử khảo luận (VTC News dẫn), điểu thương là súng cò đá lửa, bắn xa khoảng 250 đến 300 thước. Tên gọi đến từ nòng dài lắp mũi nhọn như ngọn giáo (thương) và chiếc cò đánh lửa trông như đầu chim (điểu). Dân gian còn gọi chung súng tay là súng hỏa mai.',
    so: ['Cách bắn: nạp đầu nòng, cò đá lửa', 'Tầm bắn: khoảng 250 – 300 thước (Việt sử khảo luận)'], minh: 'Mẫu dựng theo ảnh hiện vật anh gửi (ảnh 3).', ng: ['vtc', 'hl'] },
  { id: 'sungtruong', ten: 'Súng trường hạt nổ của quân Pháp', phe: 'Liên quân Pháp – Tây Ban Nha', p: [-7, -13], bang: [-5.1, -11.9, 0],
    mo: 'Giữa thế kỷ XIX, bộ binh Pháp dùng súng trường nạp đầu nòng, gây hỏa bằng hạt nổ (percussion), nòng có rãnh xoắn bắn đạn Minié. Ví dụ một khẩu kiểu 1857 của hải quân Pháp còn lưu lại có nòng dài 103 cm, toàn súng dài 141 cm. Nòng có rãnh xoắn giúp bắn xa và chính xác hơn hẳn súng nòng trơn cò đá lửa.',
    so: ['Kiểu: nạp đầu nòng, hạt nổ, nòng xoắn', 'Ví dụ kiểu 1857 hải quân: nòng 103 cm, dài 141 cm'], minh: 'Mẫu dựng theo ảnh anh gửi (ảnh 1); không khẳng định đúng kiểu súng của từng đơn vị đổ bộ năm 1858.', ng: ['m57', 'min'] },
  { id: 'sungngan', ten: 'Súng ngắn ổ quay Lefaucheux M1858', phe: 'Hải quân Pháp', p: [7, -13], bang: [8.9, -11.9, 0],
    mo: 'Hải quân Pháp nhận khẩu Lefaucheux kiểu 1858 sau ba năm thử nghiệm, vì cần loại súng chịu được ẩm ướt trên biển cho các đội đổ bộ. Đây là khẩu súng ổ quay dùng đạn có vỏ kim loại đầu tiên được một quân đội chính thức trang bị.',
    so: ['Ổ đạn: 6 viên, đạn kim hỏa 12 mm', 'Dài: 280 mm · nặng khoảng 980 g'], minh: 'Mẫu dựng theo ảnh anh gửi (ảnh 2), phóng to 2 lần trên bệ để dễ nhìn.', ng: ['lef'] },
  { id: 'binhkhi', ten: 'Gươm và giáo', phe: 'Quân triều Nguyễn, dân binh', p: [14, -13], bang: [15.9, -11.9, 0],
    mo: 'Bên cạnh súng, quân triều Nguyễn và dân binh địa phương vẫn dùng nhiều binh khí lạnh như gươm, giáo. Trong sa bàn, giáo được trao cho dân binh, gươm cho các chỉ huy.',
    so: ['Gươm: lưỡi thẳng, chuôi bọc đồng', 'Giáo: cán gỗ khoảng 2,5 m, mũi sắt'], minh: 'Hình dáng MINH HOẠ, chưa đối chiếu hiện vật cụ thể.', ng: [] },
  { id: 'tau', ten: 'Tàu hơi nước bánh guồng', phe: 'Hạm đội liên quân', p: [0, 6], bang: [4.6, 8.0, 0],
    mo: 'Kỳ hạm của Rigault de Genouilly là khinh hạm chân vịt Némésis 50 súng. Đi cùng có hai hộ tống hạm Primauguet, Phlégéton, các pháo hạm hơi nước Alarme, Avalanche, Dragonne, Fusée, Mitraille, các tàu vận tải và tàu Tây Ban Nha El Caño. Châu bản triều Nguyễn ghi ngày 31/8/1858 có 12 thuyền buồm và tàu máy đến cửa biển Đà Nẵng.',
    so: ['Kỳ hạm: Némésis (khinh hạm, 50 súng)', 'Tây Ban Nha: tàu El Caño'], minh: 'Mẫu tàu bánh guồng trên bệ là MINH HOẠ theo mẫu anh gửi, tỉ lệ khoảng 1:12.', ng: ['tour', 'cb'] },
  { id: 'linhnguyen', ten: 'Lính triều Nguyễn', phe: 'Quân triều Nguyễn', p: [-17, -17.6], bang: [-15.3, -16.5, 0],
    mo: 'Quân giữ thành Điện Hải, An Hải và các đồn lũy ven vịnh. Trong sa bàn, lính mặc áo nẹp đỏ, đội nón, cầm súng điểu thương.',
    so: [], minh: 'Quân phục MINH HOẠ theo mẫu anh gửi, cần đối chiếu tư liệu.', ng: ['bt'] },
  { id: 'linhphap', ten: 'Lính thủy đánh bộ Pháp', phe: 'Liên quân Pháp – Tây Ban Nha', p: [17, -17.6], bang: [15.3, -16.5, 0],
    mo: 'Lực lượng đổ bộ của liên quân gồm khoảng 1.000 lính thủy đánh bộ Pháp và 550 lính Tây Ban Nha (từ Philippines).',
    so: ['Pháp: khoảng 1.000 lính thủy đánh bộ', 'Tây Ban Nha: khoảng 550 lính'], minh: 'Quân phục MINH HOẠ theo mẫu anh gửi.', ng: ['tour'] },
  { id: 'danbinh', ten: 'Dân binh', phe: 'Nhân dân Quảng Nam – Đà Nẵng', p: [-9, -18], bang: [-7.3, -16.9, 0],
    mo: 'Dân binh cùng quân triều đình đắp lũy, đào hào, cắm chông, chở tre gỗ và giữ các đoạn lũy dọc tuyến Liên Trì – Thạc Gián – Nại Hiên.',
    so: [], minh: 'Nhân vật MINH HOẠ (mẫu lấy từ sa bàn Bạch Đằng).', ng: ['bt'] },
  { id: 'ntp', ten: 'Nguyễn Tri Phương', phe: 'Tổng chỉ huy quân thứ Quảng Nam', p: [0, -17.8], bang: [2.3, -16.5, 0],
    mo: 'Triều đình cử Nguyễn Tri Phương vào Đà Nẵng chỉ huy kháng chiến. Ông cho đắp hệ thống đồn lũy, thực hiện kế sách “vườn không nhà trống”, chặn bước tiến của liên quân trên bộ.',
    so: [], minh: 'Tượng MINH HOẠ, dựng từ mẫu 3D anh gửi; động tác làm trong Blender.', ng: ['tour', 'bt'] },
  { id: 'mh-dienhai', ten: 'Mô hình thành Điện Hải', phe: 'Công trình phòng thủ triều Nguyễn', p: [-20, 7], bang: [-20, 12.0, 0],
    mo: 'Năm 1813 đời Gia Long, triều đình cho đắp đồn Điện Hải ở gần mép nước tả ngạn sông Hàn. Năm 1823, vua Minh Mạng cho dời vào xây kiên cố bằng gạch ở vị trí hiện nay, bố trí 30 khẩu đại bác cỡ lớn; năm 1835 đổi tên là Thành Điện Hải. Thành xây theo lối Vauban, có góc lồi, cổng chính ở phía Nam, cổng phụ ở phía Đông, bao quanh là hào nước.',
    so: ['Tường cao hơn 5 m, chu vi hơn 556 m', 'Hào nước bao quanh sâu khoảng 3 m', 'Người Pháp gọi là Pháo đài phía Tây (Fort de l’Ouest)'], minh: 'Mô hình thu nhỏ dựng từ chính thành trong sa bàn; hình dạng, số pháo là MINH HOẠ.', ng: ['ddk', 'vp'] },
  { id: 'mh-anhai', ten: 'Mô hình thành An Hải', phe: 'Công trình phòng thủ triều Nguyễn', p: [20, 7], bang: [20, 12.0, 0],
    mo: 'Cùng năm 1813, triều đình sai Nguyễn Văn Thành đắp đài Điện Hải và bảo An Hải ở hai bên cửa sông Hàn để kiểm soát tàu thuyền ra vào. Thành An Hải nằm ở bờ Đông, đối diện Điện Hải, là một trong hai thành bị liên quân đánh chiếm ngay trong ngày đầu nổ súng 1/9/1858.',
    so: ['Vị trí: bờ Đông sông Hàn, đối diện thành Điện Hải', 'Xây dựng: 1813, thời Gia Long'], minh: 'Mô hình thu nhỏ dựng từ chính thành trong sa bàn; hình dạng là MINH HOẠ, chưa có bản vẽ đo đạc gốc.', ng: ['bpl', 'tour'] },
];

// ---------- V1.4: ngói vẩy cá ----------
function vayCaTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const k = c.getContext('2d');
  k.fillStyle = '#5c2416'; k.fillRect(0, 0, 256, 256);
  const R = rng(11), r = 32;      // 4 viên mỗi hàng, 8 hàng (mỗi hàng lệch nửa viên)
  for (let row = -1; row < 9; row++) for (let col = -1; col < 5; col++) {
    const x = col * 64 + (row % 2 ? 32 : 0) + 32, y = row * 32;
    const v = 0.85 + R() * 0.3, g = k.createRadialGradient(x, y - 6, 4, x, y, r + 2);
    g.addColorStop(0, `rgb(${178 * v | 0},${86 * v | 0},${52 * v | 0})`); g.addColorStop(0.8, `rgb(${150 * v | 0},${66 * v | 0},${40 * v | 0})`); g.addColorStop(1, '#3e170d');
    k.fillStyle = g; k.beginPath(); k.moveTo(x - r, y - 16); k.lineTo(x - r, y); k.arc(x, y, r, Math.PI, 0, true); k.lineTo(x + r, y - 16); k.closePath(); k.fill();
    k.strokeStyle = 'rgba(40,14,8,.55)'; k.lineWidth = 2; k.beginPath(); k.arc(x, y, r - 1, Math.PI * 0.05, Math.PI * 0.95); k.stroke();
    if (R() < 0.25) { k.fillStyle = 'rgba(60,70,40,.18)'; k.beginPath(); k.arc(x + (R() - 0.5) * 20, y + 10, 8 + R() * 10, 0, 6.3); k.fill(); }   // rêu
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
let VAY_TEX = null;
// mái hai dốc lợp ngói vẩy cá: dài L (trục x), sâu B, cao H, chìa e; nóc có bờ nóc và hai đầu đao cong
function maiVay(grp, L, B, H, x, y, z, e = 1.2, ry = 0) {
  VAY_TEX = VAY_TEX || vayCaTex();
  const a = L / 2 + e, b = B / 2 + e, slope = Math.hypot(b, H), O = 0.9;   // 1 ô vân = 0.9 m
  const v = [], uv = [], idx = [];
  const mat = new THREE.MeshLambertMaterial({ map: VAY_TEX, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {   // s = -1 dốc phía Bắc, +1 dốc phía Nam
    const i0 = v.length / 3;
    const N = 6;   // chia dốc thành N đoạn hơi võng (mái cong)
    for (let j = 0; j <= N; j++) {
      const u = j / N, zz = s * b * (1 - u), yy = H * u - Math.sin(u * Math.PI) * H * 0.08 + (1 - u) * (1 - u) * 0.25;
      for (const xx of [-a, a]) { v.push(xx, yy, zz); uv.push(xx / O, (1 - u) * slope / O); }
    }
    for (let j = 0; j < N; j++) { const p = i0 + j * 2; if (s < 0) idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); else idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.rotation.y = ry; grp.add(m);
  // bờ nóc, đầu đao, hai đầu hồi
  const gh = new Ghep(), NOC = 0x6e2c1a, VOI = 0xe8e0cc, q = clamp(Math.min(L, B) / 12, 0.22, 1);
  gh.hop(2 * a + 0.2 * q, 0.32 * q, 0.5 * q, 0, H + 0.12 * q, 0, NOC); gh.hop(2 * a, 0.08 * q, 0.56 * q, 0, H + 0.3 * q, 0, VOI);
  for (const sx of [-1, 1]) { gh.hop(0.5 * q, 0.9 * q, 0.4 * q, sx * (a + 0.05 * q), H + 0.5 * q, 0, NOC, 0, 0, sx * 0.35); gh.hop(0.3 * q, 0.5 * q, 0.3 * q, sx * (a + 0.32 * q), H + 0.98 * q, 0, NOC, 0, 0, sx * 0.7); }
  for (const s of [-1, 1]) for (const sx of [-1, 1]) gh.hop(0.35 * q, 0.3 * q, 0.6 * q, sx * (a - 0.1 * q), 0.35 * q, s * (b - 0.1 * q), NOC, 0, s * 0.3, sx * 0.4);   // góc đao
  const hm = gh.luoi(); hm.position.set(x, y, z); hm.rotation.y = ry; grp.add(hm);
  return m;
}
// ---------- bảng thông tin trước mỗi hiện vật ----------
function veChu(k, text, x, y, w, lh, maxL) {
  const tu = text.split(' '); let dong = '', n = 0;
  for (const t of tu) { const th = dong ? dong + ' ' + t : t; if (k.measureText(th).width > w && dong) { k.fillText(dong, x, y + n * lh); n++; dong = t; if (n >= maxL) return n; } else dong = th; }
  if (dong && n < maxL) { k.fillText(dong, x, y + n * lh); n++; } return n;
}
function bangTex(o) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 420; const k = c.getContext('2d');
  k.fillStyle = '#2b1e14'; k.fillRect(0, 0, 640, 420); k.strokeStyle = '#c9a25a'; k.lineWidth = 6; k.strokeRect(10, 10, 620, 400);
  k.fillStyle = '#c9a25a'; k.font = '600 22px system-ui, sans-serif'; k.fillText((o.phe || '').toUpperCase(), 34, 52);
  k.fillStyle = '#f6e7c4'; k.font = '800 38px system-ui, sans-serif'; const nT = veChu(k, o.ten, 34, 98, 572, 42, 2);
  k.fillStyle = '#e4d6bb'; k.font = '400 22px system-ui, sans-serif';
  const cau = (o.mo || '').split(/(?<=\.)\s/).slice(0, 2).join(' ');
  const y0 = 98 + nT * 42 + 10; const n2 = veChu(k, cau, 34, y0, 572, 30, nT > 1 ? 6 : 7);
  k.fillStyle = '#c9a25a'; k.font = 'italic 500 19px system-ui, sans-serif'; k.fillText('Chạm tên hiện vật để đọc đầy đủ và xem nguồn', 34, 392);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function datBang(grp, g, o, info) {
  const [x, z, ry] = o.bang, yb = sanY(z), H = 0.95;
  g.hop(0.08, H, 0.08, x, yb + H / 2, z - 0.05, 0x3a2a1c, ry);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.755), new THREE.MeshBasicMaterial({ map: bangTex(info) }));
  m.position.set(x, yb + H + 0.2, z); m.rotation.set(-0.55, ry, 0, 'YXZ'); grp.add(m);
  const lung = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.82, 0.04), new THREE.MeshLambertMaterial({ color: 0x3a2a1c }));
  lung.rotation.copy(m.rotation); lung.position.copy(m.position).add(new V3(0, 0, -0.025).applyEuler(m.rotation)); grp.add(lung);
}
// ---------- mô hình thu nhỏ hai toà thành (nhân bản từ chính thành trong sa bàn) ----------
function moHinhThanh(grp, ten, lx, lz, kich, top) {
  const src = CONG[ten]; if (!src) return;
  const inner = src.clone(true); inner.position.set(0, 0, 0); inner.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(inner), cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  const s = kich / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  inner.position.set(-cx, 0, -cz);
  const w = new THREE.Group(); w.add(inner); w.scale.setScalar(s); w.position.set(lx, top - bb.min.y * s, lz); grp.add(w);
  // đế đất (che phần móng dưới mặt đất)
  const hd = Math.max(0.02, -bb.min.y * s - 0.004);
  const de = new THREE.Mesh(new THREE.BoxGeometry(kich * 1.12, hd, kich * 1.12), new THREE.MeshLambertMaterial({ color: 0x6d7546 }));
  de.position.set(lx, top + hd / 2, lz); grp.add(de);
  // súng thần công thu nhỏ trên mặt thành
  if (MAU_PHAO) {
    const L = PHAO_INST.filter(([g]) => g === src); if (!L.length) return;
    const im = new THREE.InstancedMesh(MAU_PHAO.g, MAU_PHAO.mat, L.length); w.updateMatrix(); inner.updateMatrix();
    const M = new THREE.Matrix4().multiplyMatrices(w.matrix, inner.matrix), m = new THREE.Matrix4();
    L.forEach(([, Lm], i) => im.setMatrixAt(i, m.multiplyMatrices(M, Lm))); grp.add(im);
  }
}
function dungBaoTang() {
  const [mx, mn] = BT.M, y0 = gAt(mx, mn) + 0.1;
  const grp = new THREE.Group(); grp.position.set(mx, y0, -mn); grp.visible = false; scene.add(grp); BT.grp = grp; BT.y0 = y0;
  const g = new Ghep(), gg = new Ghep();
  const DA = 0xb9b4a6, DA2 = 0x8e897c, GO_ = 0x6a4a30, NGOI = 0x9b3a22, TRANG = 0xe4dccb, VA = BT.va = [];
  const chan = (x, z, w, d) => VA.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  g.hop(70, 0.3, 46, 0, 0.0, 0, DA);                                   // sân lát đá
  for (let i = -6; i <= 6; i++) g.hop(0.06, 0.32, 46, i * 5.4, 0.01, 0, DA2);
  for (let j = -4; j <= 4; j++) g.hop(70, 0.32, 0.06, 0, 0.01, j * 5.1, DA2);
  // tường rào gạch thấp, cổng phía Nam (mái cổng lợp ngói vẩy cá)
  for (const [x, z, w, d] of [[0, -23, 70, 0.6], [-35, 0, 0.6, 46], [35, 0, 0.6, 46], [-21, 23, 28, 0.6], [21, 23, 28, 0.6]]) { gg.hop(w, 1.3, d, x, 0.65, z, 0xbcae9e); chan(x, z, w, d); }
  for (const x of [-7, 7]) { gg.hop(1.4, 3.6, 1.4, x, 1.8, 23, 0xbcae9e); chan(x, 23, 1.4, 1.4); maiVay(grp, 1.6, 1.6, 0.7, x, 3.6, 23, 0.25); }
  // nhà trưng bày phía Bắc: nền cao 0,5 m, tường hậu và hai hồi, hiên cột mở về phía Nam
  const ZN = -14.5, SAU = 14;      // tâm, chiều sâu nhà
  g.hop(50, 0.5, SAU, 0, 0.25, ZN, 0xa29a88);
  g.hop(50, 0.24, 1.0, 0, 0.12, ZN + SAU / 2 + 0.5, 0x968e7c);           // bậc thềm
  gg.hop(50, 5.2, 0.5, 0, 2.85, ZN - SAU / 2 + 0.25, 0xd8ccb4); chan(0, ZN - SAU / 2 + 0.25, 50, 0.5);
  for (const sx of [-1, 1]) { gg.hop(0.5, 5.2, SAU, sx * 24.75, 2.85, ZN, 0xd8ccb4); chan(sx * 24.75, ZN, 0.5, SAU); }
  const ZC = ZN + SAU / 2 - 0.6;   // hàng cột hiên
  for (let i = -4; i <= 4; i++) { g.tru(0.24, 0.27, 4.7, i * 5.8, 2.85, ZC, 0x7a2f22, 10); g.tru(0.36, 0.36, 0.25, i * 5.8, 0.62, ZC, 0x8e897c, 10); chan(i * 5.8, ZC, 0.6, 0.6); }
  for (let i = -4; i <= 4; i++) g.tru(0.22, 0.25, 4.7, i * 5.8, 2.85, ZN - SAU / 2 + 1.4, 0x7a2f22, 10);   // hàng cột trong
  g.hop(50, 0.45, 0.45, 0, 5.3, ZC, GO_); g.hop(50, 0.4, 0.4, 0, 5.3, ZN - SAU / 2 + 1.4, GO_);
  for (let i = -4; i <= 4; i++) g.hop(0.3, 0.35, SAU - 1.6, i * 5.8, 5.45, ZN + 0.2, GO_);   // xà ngang
  maiVay(grp, 50, SAU, 4.2, 0, 5.5, ZN, 1.5);
  // hoành phi treo dưới xà hiên (V1.4: hạ xuống trước hàng cột, đủ chữ)
  { const c = document.createElement('canvas'); c.width = 1200; c.height = 176; const k = c.getContext('2d'); k.fillStyle = '#5a1e14'; k.fillRect(0, 0, 1200, 176); k.strokeStyle = '#d8b46a'; k.lineWidth = 8; k.strokeRect(10, 10, 1180, 156);
    k.fillStyle = '#f1dca2'; k.textAlign = 'center'; k.font = '800 66px system-ui, sans-serif'; k.fillText('BẢO TÀNG ĐÀ NẴNG 1858', 600, 86); k.font = '500 34px system-ui, sans-serif'; k.fillText('Vật dụng · binh khí · thành luỹ · hạm đội (tái dựng mô phỏng)', 600, 140);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 1.7), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 4.2, ZC + 0.34); grp.add(m);
    g.hop(11.9, 1.95, 0.12, 0, 4.2, ZC + 0.26, 0x3a1a10); }
  // bệ trưng bày
  const be = (x, z, w, d, h, col = TRANG, y = 0.15) => { g.hop(w, h, d, x, y + h / 2, z, col); g.hop(w + 0.2, 0.08, d + 0.2, x, y + h, z, 0xb08a3e); chan(x, z, w + 0.2, d + 0.2); };
  be(-9, -3.5, 3.4, 4.4, 0.35); be(9, -3.5, 3.4, 4.4, 0.35);      // hai súng thần công hai bên trước nhà
  be(0, 6, 7.6, 2.4, 0.9);                                         // mô hình tàu
  be(-20, 7, 8.4, 8.4, 0.85, 0x5a4232); be(20, 7, 8.4, 8.4, 0.85, 0x5a4232);   // mô hình hai toà thành
  for (const x of [-14, -7, 7, 14]) be(x, -13, 3.0, 1.2, 0.95, 0x4a3426, 0.5);
  be(-17, -17.6, 1.6, 1.6, 0.5, TRANG, 0.5); be(17, -17.6, 1.6, 1.6, 0.5, TRANG, 0.5); be(-9, -18, 1.6, 1.6, 0.5, TRANG, 0.5);
  be(0, -17.8, 2.4, 2.4, 1.1, 0xcfc4b4, 0.5);
  // cây cảnh quanh sân
  const R = rng(7); for (let k = 0; k < 10; k++) { const x = (k < 5 ? -1 : 1) * (31.5 + R()), z = -4 + (k % 5) * 6.2; g.tru(0.15, 0.2, 2.4, x, 1.2, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(1.5, 1), M4(x, 3.1, z), 0x3f6e33); chan(x, z, 0.6, 0.6); }
  // súng thần công: hai khẩu hai bên, nòng quay ra phía trước (Nam)
  if (MAU_PHAO) for (const x of [-9, 9]) { const m = new THREE.Mesh(MAU_PHAO.g, MAU_PHAO.mat); m.position.set(x, 0.58, -3.6); m.rotation.y = 0; m.scale.setScalar(0.95); grp.add(m); }
  // mô hình tàu bánh guồng 1:12
  if (MAU_TAU) { const m = new THREE.Mesh(MAU_TAU.g, MAU_TAU.mat); const k = 6.2 / MAU_TAU.d.dai; m.scale.setScalar(k); m.position.set(0, 1.13 + 4 * k, 6); m.rotation.y = Math.PI / 2; grp.add(m); }
  // mô hình hai toà thành
  moHinhThanh(grp, 'dien-hai', -20, 7, 7.6, 1.08); moHinhThanh(grp, 'an-hai', 20, 7, 7.6, 1.08);
  // binh khí nằm trên bệ
  const wp = (geo, x, z, s, rz = Math.PI / 2, y = 1.58) => { const m = new THREE.Mesh(geo, XWMAT); m.position.set(x, y, z); m.rotation.set(0, 0, rz); m.scale.setScalar(s); grp.add(m); return m; };
  wp(XWGEO.dieuthuong, -14.4, -13, 1); wp(XWGEO.sungtruong, -7.4, -13, 1); wp(XWGEO.sungngan, 7, -13, 2, 0, 1.62).rotation.set(Math.PI / 2, 0, 0);
  wp(XWGEO.guom, 13.4, -13.3, 1); wp(XWGEO.giao, 14.4, -12.7, 1, Math.PI / 2, 1.56).position.x = 15.4;
  grp.add(g.luoi()); grp.add(gg.luoi(MAT_GACH));
  // bảng thông tin trước mỗi hiện vật
  const gb = new Ghep();
  for (const o of BT_DS) if (o.bang) datBang(grp, gb, o, o.an ? BT_DS[o.nhu || 0] : o);
  grp.add(gb.luoi());
  for (const o of BT_DS) if (o.bang) chan(o.bang[0], o.bang[1] + 0.12, 0.5, 0.4);
  BT.items = BT_DS.map(o => ({ ...o, w: new V3(mx + o.p[0], y0 + (o.p[1] < -8 ? 2.3 : 1.9), -mn + o.p[1]) }));
  TRANH.push([mx, mn, 60]);
  dungLoTrinh();
}
// ---------- khách tham quan: vòng đi qua từng hiện vật, dừng xem ----------
// điểm [x, z, dừng (s), nhìn về [x, z]]
const LT_DIEM = [
  [0, 20], [-2, 10.4, 8, [0, 6]], [-14, 12.6], [-20, 13.4, 9, [-20, 7]], [-27, 10.5], [-27, 0.5], [-12, 0.6], [-9, 0.9, 7, [-9, -3.5]],
  [-2.9, -2.2], [-2.9, -10.4], [-14, -11, 8, [-14, -13]], [-7, -11, 7, [-7, -13]], [-3.4, -11.6], [-3.4, -15.2], [-9, -15.2, 7, [-9, -18]],
  [-17, -15.2, 7, [-17, -17.6]], [-1.5, -15.0, 9, [0, -17.8]], [17, -15.2, 7, [17, -17.6]], [14, -11, 8, [14, -13]], [7, -11, 7, [7, -13]],
  [2.9, -10.4], [2.9, -2.2], [9, 0.9, 7, [9, -3.5]], [27, 0.5], [27, 10.5], [20, 13.4, 9, [20, 7]], [3, 13.5]];
let LT = null;
function dungLoTrinh() {
  const seg = []; let T = 0;
  for (let i = 0; i < LT_DIEM.length; i++) {
    const a = LT_DIEM[i], b = LT_DIEM[(i + 1) % LT_DIEM.length];
    if (a[2]) { seg.push({ dung: true, t0: T, t1: T + a[2], x: a[0], z: a[1], nh: a[3] }); T += a[2]; }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push({ dung: false, t0: T, L, a, b }); T += L;   // T tính theo "mét" khi đi
  }
  LT = { seg, T };
}
const KHACH = Array.from({ length: 16 }, (_, k) => ({ kind: ['khachnam', 'aodai', 'khachnu'][k % 3], off: k / 16, lech: ((k * 7) % 5 - 2) * 0.28, ph: (k * 0.37) % 1, chi: k % 4 === 1 }));
function sanY(z) { return z < -7.5 ? 0.5 : z < -6.5 ? lerp(0.15, 0.5, -6.5 - z) : 0.15; }
function baoTangCapNhat() {
  if (!BT.on) return;
  const t = BT.tg = performance.now() / 1000;
  const [mx, mn] = BT.M, Y = BT.y0, X = mx, Z = -mn;
  // tượng trên bệ
  xPut('nguyen', 'dung', 0.3, 0, X - 17, Y + 1.0, Z - 17.6, 0.15, 1, [1, 1, 1], 'dieuthuong');
  xPut('phap', 'dung', 0.3, 0, X + 17, Y + 1.0, Z - 17.6, -0.15, 1, [1, 1, 1], 'sungtruong');
  xPut('danbinh', 'dung', 0.3, 0, X - 9, Y + 1.0, Z - 18, 0.1, 1, [1, 1, 1], 'giao');
  xPut('ntp', 'chihuy', t * 0.5, 0, X, Y + 1.6, Z - 17.8, 0, 1.05, [1, 1, 1], null);
  if (!LT) return;
  // khách: mỗi người đi trọn vòng theo tốc độ bước chân của mình (nhịp bước = quãng đi), dừng xem hiện vật
  for (const k of KHACH) {
    const v = vNat(k.kind, 'di') * 1.02, Tv = (() => { let T = 0; for (const s of LT.seg) T += s.dung ? s.t1 - s.t0 : s.L / v; return T; })();
    let tau = mod(t + k.off * Tv, Tv), x, z, yaw, clip = 'di', ta = 0, q = 0;
    for (const s of LT.seg) {
      const d = s.dung ? s.t1 - s.t0 : s.L / v;
      if (tau < d) {
        if (s.dung) { x = s.x; z = s.z; yaw = Math.atan2(s.nh[0] - x, s.nh[1] - z); clip = k.chi && tau > 2 && tau < 4.5 ? 'chihuy' : (k.kind === 'khachnam' ? 'dung' : 'nhin'); ta = tau; }
        else { const u = tau / d; x = lerp(s.a[0], s.b[0], u); z = lerp(s.a[1], s.b[1], u); yaw = Math.atan2(s.b[0] - s.a[0], s.b[1] - s.a[1]); ta = (q + u * s.L) / vNat(k.kind, 'di'); }
        break;
      }
      tau -= d; if (!s.dung) q += s.L;
    }
    // lệch sang bên để người không chồng lên nhau
    const ox = Math.cos(yaw) * k.lech, oz = -Math.sin(yaw) * k.lech;
    xPut(k.kind, clip, ta, k.ph, X + x + ox, Y + sanY(z + oz), Z + z + oz, yaw, 1, [1, 1, 1], null);
  }
}
function dungNhanBaoTang() {
  BT.items.forEach((o, i) => { if (o.an) return; nhan(o.ten, () => o.w, 'bt', () => BT.on); const L = NHAN[NHAN.length - 1]; L.el.onclick = () => baoTangThe(i); L.bt = true; });
}
function baoTangThe(i) {
  BT.chon = i; const o = BT.items[i], c = $('#bt');
  const ds = BT.items.map((x, k) => x.an ? '' : `<button data-k="${k}" class="${k === i ? 'on' : ''}">${esc(x.ten)}</button>`).join('');
  c.innerHTML = `<button class="x" id="btX" aria-label="Đóng">×</button><div class="eyebrow">Hiện vật · ${esc(o.phe)}</div><h2>${esc(o.ten)}</h2><p>${esc(o.mo)}</p>
    ${o.so && o.so.length ? `<ul>${o.so.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}<p class="src">${esc(o.minh)}</p>
    ${o.ng && o.ng.length ? `<p class="src">Nguồn: ${o.ng.map(k => `<a href="${BT_NGUON[k][1]}" target="_blank" rel="noopener">${esc(BT_NGUON[k][0])}</a>`).join(' · ')}</p>` : ''}
    <div id="btList">${ds}</div>`;
  c.hidden = false; $('#btX').onclick = () => { c.hidden = true; };
  c.querySelectorAll('#btList button').forEach(b => b.onclick = () => baoTangThe(+b.dataset.k));
  if (DI.on) { diBoToi(o); return; }
  // bay máy quay tới hiện vật
  const w = o.w, d = o.id === 'tau' || o.id.startsWith('mh-') ? 11 : o.id.startsWith('thancong') ? 8 : 5.5;
  BT.bay = { t0: performance.now(), p0: camera.position.clone(), q0: OC.target.clone(), q1: w.clone().setY(w.y - 0.5), p1: w.clone().add(new V3(d * 0.35, d * 0.45, d)) };
}
function baoTangVao() {
  BT.tCu = UI.t; BT.camCu = [camera.position.clone(), OC ? OC.target.clone() : null];
  UI.t = 25; NHAY = true; BT.on = true; BT.grp.visible = true;
  const [mx, mn] = BT.M; OC.target.set(mx, BT.y0 + 1.5, -mn - 6); camera.position.set(mx + 4, BT.y0 + 20, -mn + 40); OC.minDistance = 2; OC.maxDistance = 220;
  $('#btDi').hidden = false; $('#bt').hidden = true;
}
function baoTangRa() {
  diBoTat(); $('#btDi').hidden = true;
  BT.on = false; BT.grp.visible = false; $('#bt').hidden = true; UI.t = BT.tCu; NHAY = true; BT.bay = null;
}
function baoTangBay() {
  const b = BT.bay; if (!b || !OC) return;
  const k = Math.min((performance.now() - b.t0) / 1400, 1), e = k * k * (3 - 2 * k);
  camera.position.lerpVectors(b.p0, b.p1, e); OC.target.lerpVectors(b.q0, b.q1, e); if (k >= 1) BT.bay = null;
}
// ---------- V1.4: đi bộ tham quan (góc nhìn người, W A S D / mũi tên, kéo để nhìn; điện thoại: cần gạt trái) ----------
const DI = { on: false, x: 0, z: 19, yaw: Math.PI, pitch: -0.05, keys: {}, joy: null, nhin: null, toi: null };
function diBoBat() {
  DI.on = true; DI.x = 0; DI.z = 19; DI.yaw = Math.PI; DI.pitch = -0.06; DI.toi = null; BT.bay = null;
  if (OC) OC.enabled = false; $('#bt').hidden = true;
  $('#btDi').textContent = '✕ Thôi đi bộ'; $('#btDi').classList.add('on'); $('#joy').hidden = !matchMedia('(pointer:coarse)').matches;
  $('#help').textContent = 'W A S D hoặc mũi tên để đi · kéo chuột để nhìn quanh · Shift để đi nhanh · chạm tên hiện vật để đọc thẻ';
}
function diBoTat() {
  if (!DI.on) return; DI.on = false; DI.keys = {}; DI.joy = null; DI.nhin = null;
  $('#btDi').textContent = '🚶 Đi bộ tham quan'; $('#btDi').classList.remove('on'); $('#joy').hidden = true;
  if (OC) { OC.enabled = true; const [mx, mn] = BT.M; OC.target.set(mx + DI.x, BT.y0 + 1.2, -mn + DI.z - 4); camera.position.set(mx + DI.x + 3, BT.y0 + 9, -mn + DI.z + 9); }
  $('#help').textContent = 'Kéo để xoay quanh hiện vật · chạm tên hiện vật để đọc thẻ · bấm “Đi bộ tham quan” để dạo trong bảo tàng';
}
// đi tới đứng trước bảng thông tin của hiện vật
function diBoToi(o) { const b = o.bang || [o.p[0], o.p[1] + 3, 0]; DI.toi = { x: b[0] + Math.sin(b[2] || 0) * 1.6, z: b[1] + 1.7, nx: o.p[0], nz: o.p[1] }; }
function vaCham(x, z, r = 0.32) {
  for (let lan = 0; lan < 2; lan++) for (const [x0, z0, x1, z1] of BT.va) {
    if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) {
      const dl = x - (x0 - r), dr = x1 + r - x, dt = z - (z0 - r), db = z1 + r - z, m = Math.min(dl, dr, dt, db);
      if (m === dl) x = x0 - r; else if (m === dr) x = x1 + r; else if (m === dt) z = z0 - r; else z = z1 + r;
    }
  }
  return [clamp(x, -34.3, 34.3), clamp(z, -22.3, 25)];
}
function diBoCapNhat(dt) {
  if (!DI.on) return;
  const K = DI.keys, nhanh = K.ShiftLeft || K.ShiftRight ? 2.0 : 1;
  let f = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0), s = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0);
  if (K.ArrowLeft) DI.yaw += dt * 1.6; if (K.ArrowRight) DI.yaw -= dt * 1.6;
  if (DI.joy) { f -= DI.joy.dy; s += DI.joy.dx; }
  const fx = Math.sin(DI.yaw), fz = Math.cos(DI.yaw), rx = -fz, rz = fx;
  if (f || s) DI.toi = null;
  let x = DI.x, z = DI.z;
  if (DI.toi) {   // tự đi tới hiện vật đã chọn
    const dx = DI.toi.x - x, dz = DI.toi.z - z, d = Math.hypot(dx, dz), want = Math.atan2(DI.toi.nx - x, DI.toi.nz - z);
    let dy = mod(want - DI.yaw + Math.PI, Math.PI * 2) - Math.PI; DI.yaw += dy * Math.min(1, dt * 3);
    if (d > 0.1) { const st = Math.min(d, dt * 3.2); x += dx / d * st; z += dz / d * st; } else DI.toi = null;
  } else { const v = 2.1 * nhanh * dt; x += (fx * f + rx * s) * v; z += (fz * f + rz * s) * v; }
  [DI.x, DI.z] = vaCham(x, z);
  const [mx, mn] = BT.M, ey = BT.y0 + sanY(DI.z) + 1.62 + Math.sin(performance.now() / 1000 * 7.5) * ((f || s) ? 0.025 : 0);
  camera.position.set(mx + DI.x, ey, -mn + DI.z);
  const cp = Math.cos(DI.pitch); camera.lookAt(mx + DI.x + Math.sin(DI.yaw) * cp, ey + Math.sin(DI.pitch), -mn + DI.z + Math.cos(DI.yaw) * cp);
}
function diBoGiaoDien() {
  const b = document.createElement('button'); b.id = 'btDi'; b.className = 'chip'; b.hidden = true; b.textContent = '🚶 Đi bộ tham quan'; document.body.appendChild(b);
  b.onclick = () => DI.on ? diBoTat() : diBoBat();
  const j = document.createElement('div'); j.id = 'joy'; j.hidden = true; j.innerHTML = '<b></b>'; document.body.appendChild(j);
  addEventListener('keydown', (e) => { if (DI.on) { DI.keys[e.code] = true; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); } });
  addEventListener('keyup', (e) => { DI.keys[e.code] = false; });
  addEventListener('blur', () => { DI.keys = {}; });
  const cvs = renderer.domElement;
  cvs.addEventListener('pointerdown', (e) => {
    if (!DI.on) return;
    if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.42) { DI.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; j.style.left = (e.clientX - 55) + 'px'; j.style.top = (e.clientY - 55) + 'px'; j.classList.add('on'); }
    else DI.nhin = { id: e.pointerId, x: e.clientX, y: e.clientY };
    cvs.setPointerCapture(e.pointerId);
  });
  cvs.addEventListener('pointermove', (e) => {
    if (!DI.on) return;
    if (DI.joy && e.pointerId === DI.joy.id) { DI.joy.dx = clamp((e.clientX - DI.joy.x0) / 50, -1, 1); DI.joy.dy = clamp((e.clientY - DI.joy.y0) / 50, -1, 1); j.firstChild.style.transform = `translate(${DI.joy.dx * 30}px,${DI.joy.dy * 30}px)`; }
    else if (DI.nhin && e.pointerId === DI.nhin.id) { DI.yaw -= (e.clientX - DI.nhin.x) * 0.0045; DI.pitch = clamp(DI.pitch - (e.clientY - DI.nhin.y) * 0.0035, -1.1, 0.9); DI.nhin.x = e.clientX; DI.nhin.y = e.clientY; DI.toi = null; }
  });
  const len = (e) => { if (DI.joy && e.pointerId === DI.joy.id) { DI.joy = null; j.classList.remove('on'); j.firstChild.style.transform = ''; } if (DI.nhin && e.pointerId === DI.nhin.id) DI.nhin = null; };
  cvs.addEventListener('pointerup', len); cvs.addEventListener('pointercancel', len);
}
