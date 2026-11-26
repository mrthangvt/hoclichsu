// Hà Nội – Điện Biên Phủ trên không 1972 · phần riêng của trận, cắm vào bộ máy 2.2.0 tại các chỗ /*@@RIENG:sN@@*/.
// GĐ0 (25/11/2026): BẢN NỀN chép nguyên từ packs/ho-chi-minh-1975/rieng.js (V1.9) để giữ các hàm dùng lại được:
//   giaoTranh, uNap, don, tranDia, banTao, LINH_XE, buiXe, MOC_NGAY, camCot, camVai, window.__kiem.
// Biên đạo, địa danh, lịch xe của Sài Gòn trong tệp này CHƯA thay; sẽ thay ở GĐ3–GĐ4 khi có địa hình Khe Sanh.
// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy.
//@@ s1
// Sa bàn Hà Nội – Điện Biên Phủ trên không 1972 — three.js (dựng từ rieng.js Khe Sanh V2.1 bằng tools/sa_ban/dbpk/rieng_tu_ks.py), bộ máy 2.2.0 (họ Bạch Đằng). Tái dựng mô phỏng.
//@@ s2
const HCM = false;
const KS = {};       // biên đạo Khe Sanh (GĐ4) — khai báo sớm, tránh TDZ giữa các đoạn   // GĐ3: biên đạo Sài Gòn của bản nền HCM V1.9 tắt hết; Khe Sanh dựng dần ở GĐ4
const progress = (f, m) => { lp.style.width = (f * 100).toFixed(0) + '%'; if (m) lm.textContent = m; };
// ------------------------------------------------------------------ helpers (như Như Nguyệt)
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
function keys(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return lerp(K[i - 1][1], K[i][1], ease(u)); } return K[K.length - 1][1]; }
function angLerp(a, b, t) { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
function rnd(i, k = 0) { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); }
//@@ s3
const STAKE_TOP = 0.0;
const LOW = 0.3, HIGH = 0.3;      // sông, kênh Sài Gòn: mực nước cố định (bộ máy 2.x dùng cho mặt nước)
//@@ s4
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 900000);
camera.position.set(0, R * 0.9, R * 1.6);
//@@ s5
const SEC_X = 1e9;            // trận này không có mặt cắt
const secPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), SEC_X);
//@@ s6
const groundMat = fogShader({
  uniforms: { uGround: U.ground, uLight: U.light },
  fpre: 'uniform vec3 uGround; uniform float uLight;',
  fbody: `float r=length(vW.xz); float n=noise(vW.xz*${(0.0016 * 3180 / R).toFixed(7)})*0.55+noise(vW.xz*${(0.013 * 3180 / R).toFixed(7)})*0.3+noise(vW.xz*0.09)*0.15;
    vec3 c=uGround*(0.82+0.32*n)*uLight; float rim=smoothstep(${(R * 1.28).toFixed(1)},${(R * 1.02).toFixed(1)},r); c*=1.0-0.18*rim; outc=vec4(c,1.);`,
});
//@@ s7
const water = new THREE.Mesh(new THREE.CircleGeometry(R - 0.3, 360), waterMat);
water.rotation.x = -Math.PI / 2; water.renderOrder = 2; scene.add(water);
const sectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ visible: false }));
sectionMesh.visible = false; scene.add(sectionMesh);
progress(0.35, 'Đang dựng địa hình ' + (TANG === 'ha-noi' ? 'Hà Nội 1972' : 'miền Bắc') + '…');
//@@ s8
const LAYER = { nv: [], xe: [], nha: [] };
//@@ s9
//@@ s10
async function loadModel(name) { throw new Error('trận này không dùng mô hình .mesh.json: ' + name); }
//@@ s11
const NV_KINDS = [];
async function nvNen() {}           // chưa có nhân vật nướng sẵn (.nvz) — GĐ4
//@@ s12
//@@ s13
//@@ s14
//@@ s15
//@@ s16
// nhân vật nướng sẵn (.nvz) và lính lai chưa dùng ở bản thử này; nhân vật có xương đi qua NVX của bộ máy 2.2
function nvPut() {}
function nvBegin() {}
function nvEnd() {}
const farScale = () => EXAG;
const XL = { on: false, load: async () => {} };
const tmpE = new THREE.Euler(), tmpS = new THREE.Vector3(), tmpM = new THREE.Matrix4();
//@@ s17
const tideAt = () => 0.3;
//@@ s18
const BOAT_S = 1, BOAT_DECK = 0, BOAT_STERN = [0, 0, 0], AV_BOAT = 0;
const boats = [];
const boatInst = new THREE.InstancedMesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }), 1); boatInst.visible = false;
//@@ s19
//@@ s20
//@@ s21
//@@ s22
// ------------------------------------------------------------------ toạ độ: kinh-vĩ → three (x Đông, z = −Bắc) của tầng đang mở
const KXm = Math.cos((META.lat0 * Math.PI) / 180) * 111320, KYm = 110574;
const LLx = (lat, lon) => (lon - META.lon0) * KXm, LLz = (lat, lon) => -(lat - META.lat0) * KYm;
const LL = (lat, lon, y = 0) => new THREE.Vector3(LLx(lat, lon), y, LLz(lat, lon));
// mốc (lấy từ OSM 24/11/2026; mốc chính chốt theo nguồn ở GĐ5)
// mốc Khe Sanh (toạ độ: OSM 25/11/2026; điểm cao 881 Nam/Bắc, 950, Bản Huội San theo M27–M29 trong sources.json;
// 861, 861A, 558: lưới bản đồ quân sự XD 803-443, 806-445, 820-451 so với căn cứ XD 841-419 (M30), đặt lệch từ toạ độ OSM của căn cứ;
// Co Roc là ƯỚC LƯỢNG (~13 km tây nam căn cứ, M12) — chỉnh ở GĐ4 khi đối chiếu bản đồ 1:50 000)
// mốc Hà Nội – miền Bắc (toạ độ OSM hôm nay, làm tròn). Trận địa tên lửa: chỉ Tiểu đoàn 77 ở Chèm có nguồn ghi địa danh (S3);
// các trận địa khác, đài ra-đa, sân bay Cẩm Thủy là ƯỚC LƯỢNG (ghi rõ trên nhãn) — chờ đối chiếu sơ đồ bố trí của Quân chủng PK-KQ.
const MOC = {
  hanoi: [21.0285, 105.8542, 'Hà Nội'], haiphong: [20.8650, 106.6830, 'Hải Phòng'],
  hoankiem: [21.0288, 105.8524, 'Hồ Hoàn Kiếm'], longbien: [21.0425, 105.8605, 'Cầu Long Biên'], hotay: [21.0560, 105.8200, 'Hồ Tây'],
  khamthien: [21.0195, 105.8355, 'Phố Khâm Thiên'], bachmai: [21.0010, 105.8410, 'Bệnh viện Bạch Mai'], huutiep: [21.0405, 105.8327, 'Hồ Hữu Tiệp (làng Ngọc Hà)'],
  cotco: [21.0326, 105.8399, 'Cột cờ Hà Nội'], dinhtienhoang: [21.0300, 105.8535, 'Phố Đinh Tiên Hoàng'],
  phulo: [21.2060, 105.8420, 'Xã Phù Lỗ (Đông Anh, nay thuộc Sóc Sơn)'], noibai: [21.2190, 105.8070, 'Sân bay Nội Bài'], dongan: [21.1400, 105.8480, 'Đông Anh'],
  yenvien: [21.0820, 105.9180, 'Ga Yên Viên'], gialam: [21.0400, 105.8860, 'Sân bay Gia Lâm'], thanhtri: [20.9600, 105.8550, 'Thanh Trì'], coloa: [21.1150, 105.8730, 'Cổ Loa'],
  td59: [21.1080, 105.8650, 'Trận địa Tiểu đoàn 59 (ước lượng)'], td57: [21.1250, 105.8000, 'Trận địa Tiểu đoàn 57 (ước lượng, bắc sông Hồng)'],
  td77: [21.0830, 105.7860, 'Trận địa Tiểu đoàn 77 (Chèm)'], td79: [21.0000, 105.8000, 'Trận địa Tiểu đoàn 79 (ước lượng, nam sông Hồng)'], td72: [21.0350, 105.7700, 'Trận địa Tiểu đoàn 72 (ước lượng)'],
  p12a: [21.1600, 105.7700, 'Đài ra-đa (ước lượng)'], p12b: [20.9700, 105.9100, 'Đài ra-đa (ước lượng)'], tdhp: [20.8800, 106.6500, 'Trận địa tên lửa Hải Phòng (ước lượng)'],
  yenbai: [21.7275, 104.8725, 'Sân bay Yên Bái'], camthuy: [20.2050, 105.4700, 'Sân bay Cẩm Thủy (Thanh Hóa, ước lượng)'], mocchau: [20.8500, 104.6500, 'Mộc Châu (Sơn La)'],
  taybac: [21.0500, 104.6000, 'Vùng trời Tây Bắc (hướng Sơn La)'], tamdao: [21.4560, 105.6450, 'Tam Đảo'],
};
const MOC_LON = new Set(['hanoi', 'haiphong', 'hoankiem']);
const MOC_MB = new Set(['hanoi', 'haiphong', 'yenbai', 'camthuy', 'mocchau', 'taybac', 'tamdao']);   // mốc hiện ở tầng miền Bắc
// đường xe 843, 390 vào Dinh (tools/sa_ban/dia_hinh/tim_duong.py trên mạng đường OSM đã bỏ đường làm sau 1975) + đoạn vào sân Dinh — PHÁC THẢO
const DUONG_DINH = [];
const MV = STORY.moc || {};                                                             // mốc sự kiện theo giây voice (story.json, tools/sa_ban/voice/dung_story_hcm.py)
// Các cảnh vào Dinh viết theo "giờ Dinh" cũ (xe 843 tới cổng phụ 84, 390 húc cổng chính 90, Thận tháo cờ 115, hạ cờ 131, kéo cờ 139…).
// Giờ voice → giờ Dinh: nội suy từng đoạn theo câu đọc tương ứng (bản voice 24/11/2026). Mốc 0 = xe 843 bắt đầu qua cầu Sài Gòn.
const tDinh = (() => {
  if (!MV.c11_ram) { const sc = STORY.scenes.find((c) => c.id === 'T02'); const off = sc ? sc.t0 - 40 : 0; return (t) => t - off; }
  const K = [[MV.c10_dai - 8, -40], [MV.c10_cau, 0], [MV.c10_htt, 42], [MV.c11_843, 76], [MV.c11_ram, 84], [MV.c11_cham, 90], [MV.c11_thao, 115], [MV.c11_chay, 122.5],
    [MV.c11_noc, 131], [MV.c11_keo - 1, 139], [MV.c12_dai, 158]];
  return (t) => { if (t <= K[0][0]) return K[0][1] - (K[0][0] - t);
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return K[i - 1][1] + (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]) * (K[i][1] - K[i - 1][1]);
    return K[K.length - 1][1] + t - K[K.length - 1][0]; };
})();
// ĐÁM ĐÔNG (.nvz nướng từ nhân vật có xương bằng tools/sa_ban/nhan_vat_lai/nuong_nvz.py; ảnh màu áo: doi_mau_ao.py). Vẽ hàng loạt mỗi khung:
// DAM = các hàm (tDinh, tVoice) đặt người qua dongDat; chỉ vẽ người gần máy quay. Mẫu lính Quân Giải phóng, lính đối phương: mẫu QĐND, VNCH của
// sa bàn Thành cổ Quảng Trị (dùng lại, giảm lưới). Vị trí, số người, động tác: TÁI DỰNG MINH HOẠ.
const DAN = [], DAM = [], GHIM_SAU = [];   // GHIM_SAU: các ghim tên đặt sau khi có addLabel
const DONG_P = [], dongNap = (ten, nvz, jpg, cap = 1200, tints = [[1, 1, 1], [0.93, 0.92, 0.9], [0.85, 0.84, 0.82]]) => { const p = dongTai(ten, 'models/' + nvz + '.nvz', 'models/' + jpg + '.jpg', tints, cap).catch((e) => console.warn('đám đông', ten, e)); DONG_P.push(p); return p; };
const ganMay = (x, z, r) => { const dx = camera.position.x - x, dz = camera.position.z - z; return dx * dx + dz * dz < r * r; };
const rndS = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const quayXe = (o, lx, ly, lz) => { const p = o.position, y = o.rotation.y, c = Math.cos(y), s = Math.sin(y); return [p.x + lx * c + lz * s, p.y + ly, p.z - lx * s + lz * c, y]; };   // điểm trên xe (mũi +z) → thế giới
// bộ binh ngồi trên thùng xe tải (hai băng ghế dọc, quay mặt vào giữa) / trên nóc xe bọc thép K-63; sc: tỉ lệ (tầng chiến dịch phóng to ×3 như xe)
// thùng xe tải (sàn cao 1,42 m): hai hàng quỳ dọc hai bên thành xe, 5 người mỗi bên (động tác QuyNghi — dáng ngồi duỗi chân cũ bị thành xe che), 3 người đứng giữa (anh Thắng 24/11: thêm người, người ngồi không bị chìm)
const LINH_XE = { tai: [...[-3.0, -2.45, -1.9, -1.35, -0.8].flatMap((z) => [[-0.78, 1.42, z, 1, 'ngoi'], [0.78, 1.42, z, -1, 'ngoi']]), [0, 1.42, -2.7, 2, 'dung'], [0.15, 1.42, -1.9, 2, 'dung'], [-0.15, 1.42, -1.1, 2, 'dung']],
  tang: [[-0.75, 1.95, -2.3, 1, 'ngoi'], [0.75, 1.95, -2.3, -1, 'ngoi'], [-0.6, 1.95, -3.1, 1, 'ngoi'], [0.6, 1.95, -3.1, -1, 'ngoi'], [0.45, 1.5, -0.35, 2, 'dung']],
  // V1.9 (anh Thắng: lính trên K-63 như đứng lơ lửng): đo bằng tia chiếu xuống mẫu xe — mặt sàn sau K-63 cao 1,86–1,92 m (z −2,2…−0,7), trước đây đặt 2,5 m
  k63: [[-0.6, 1.9, -1.75, 1, 'ngoi'], [0.6, 1.9, -1.75, -1, 'ngoi'], [-0.6, 1.9, -0.75, 1, 'ngoi'], [0.6, 1.9, -0.75, -1, 'ngoi'], [0, 1.86, -2.05, 2, 'dung']] };
const linhTrenXe = (o, loai, t, sc = 1, vi = 0) => { if (!o || !o.visible) return;
  for (const [lx, ly, lz, q, clip] of LINH_XE[loai]) { const [x, y, z, yaw] = quayXe(o, lx * sc, ly * sc, lz * sc);
    dongDat('qgp', clip, t, (lx + lz) * 0.37 % 1, x, y, z, yaw + (q === 2 ? 0 : q ? q * Math.PI / 2 : Math.PI), sc, vi++); } };
// KHÓI BỤI sau đoàn xe (anh Thắng 24/11): mỗi xe vài cụm bụi bốc lên, bay ra sau
const BUI = { pool: [], n: 0, mat: null };
const buiXe = (o, sc, t, mau = 0xb49a76) => { if (!o || !o.visible) return; const y = o.rotation.y, fx = Math.sin(y), fz = Math.cos(y);
  for (let k = 0; k < 3; k++) { let s = BUI.pool[BUI.n]; if (!s) { s = new THREE.Sprite(new THREE.SpriteMaterial({ map: NHOE_TEX, color: mau, transparent: true, depthWrite: false })); scene.add(s); BUI.pool.push(s); }
    BUI.n++; const a = (t * 0.9 + k / 3 + (o.id % 7) * 0.13) % 1, d = (3.5 + a * 14) * sc;
    s.visible = true; s.material.color.setHex(mau); s.position.set(o.position.x - fx * d + (k - 1) * 0.8 * sc, o.position.y + (0.6 + a * 3.5) * sc, o.position.z - fz * d); s.scale.setScalar((2.2 + a * 7) * sc); s.material.opacity = 0.42 * (1 - a); } };
if (true) { dongNap('qgpA', 'linh-qgp-a', 'linh-qgp-a', 300); dongNap('qgpB', 'linh-qgp-b', 'linh-qgp-b', 300); dongNap('danNam1', 'dan-sg-nam', 'dan-sg-nam-trang', 200); dongNap('danNam2', 'dan-sg-nam', 'dan-sg-nam-xanh', 200); dongNap('danNu0', 'dan-sg-nu', 'dan-sg-nu-trang', 200); dongNap('danNu1', 'dan-sg-nu', 'dan-sg-nu-xanh', 200); dongNap('danNu2', 'dan-sg-nu', 'dan-sg-nu-hong', 200); dongNap('danNu3', 'dan-sg-nu', 'dan-sg-nu-tim', 200); dongNap('danNam3', 'dan-sg-nam', 'dan-sg-nam-kem', 200);
  dongNap('ktA', 'linh-kt-a', 'linh-kt-a', 300); dongNap('ktB', 'linh-kt-b', 'linh-kt-b', 300);
  // V1.5: hai mức chi tiết — gần máy (< 45 m × tỉ lệ) dùng mẫu 4.700 tam giác (không thủng), xa dùng mẫu 1.570 tam giác (nhẹ cho card đồ hoạ)
  dongNap('qgpAx', 'linh-qgp-a-x', 'linh-qgp-a', 700); dongNap('qgpBx', 'linh-qgp-b-x', 'linh-qgp-b', 700);
  // anh Thắng V1.2: bộ đội ta dùng hai mẫu lính Thành cổ (mũ tai bèo / đầu trần, tools/thanh_co_quang_tri/nhan-vat), lấy động tác của mẫu QĐND cùng bộ xương; 'qgp' chia đều hai mẫu
  const _dd0 = dongDat; dongDat = (ten, clip, t, ph, x, y, z, yaw, sc = 1, vi = 0) => { let n = ten === 'qgp' ? (vi % 2 ? 'qgpA' : 'qgpB') : ten === 'kt' ? (vi % 2 ? 'ktA' : 'ktB') : ten;
    if (n === 'qgpA' || n === 'qgpB' || n === 'vnch' || n === 'my') { const c = camera.position, dx = c.x - x, dy = c.y - y, dz = c.z - z, r = 45 * sc; if (dx * dx + dy * dy + dz * dz > r * r && DONG[n + 'x']) n += 'x'; }
    return _dd0(n, clip, t, ph, x, y, z, yaw, sc, vi); }; }
// GIAO TRANH (anh Thắng 24/11: bộ binh bắn nhau khi giữ cầu, xe tăng bắn nhau): đường đạn vạch sáng (đạn vạch phía ta xanh lục, phía đối phương đỏ — màu
// đạn vạch thông dụng của súng Liên Xô / Mỹ), chớp nòng, nổ. Mỗi trận: hai nhóm lính .nvz, thời gian, tỉ lệ (tầng chiến dịch ×3). Thế trận: MINH HOẠ.
const TRV = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), 900);
TRV.count = 0; TRV.frustumCulled = false; TRV.setColorAt(0, new THREE.Color()); scene.add(TRV);
const _tq = new THREE.Quaternion(), _tm = new THREE.Matrix4(), _ta = new THREE.Vector3(), _tb = new THREE.Vector3(), _tz = new THREE.Vector3(0, 0, 1), _ts = new THREE.Vector3(), _tc = new THREE.Color();
const vach = (ax, ay, az, bx, by, bz, u, dai, day, mau) => {               // một viên đạn vạch đang bay ở phần u (0..1) của đường a→b
  if (TRV.count >= 900) return; _ta.set(bx - ax, by - ay, bz - az); const L = _ta.length(); if (L < 1) return; _ta.divideScalar(L);
  const k = Math.min(dai, L * 0.5), d = u * (L - k); _tb.set(ax + _ta.x * (d + k / 2), ay + _ta.y * (d + k / 2), az + _ta.z * (d + k / 2));
  _tq.setFromUnitVectors(_tz, _ta); _tm.compose(_tb, _tq, _ts.set(day, day, k)); TRV.setMatrixAt(TRV.count, _tm); TRV.setColorAt(TRV.count, _tc.set(mau)); TRV.count++; };
const NHOE_TEX = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const nhoe = (mau, cong = true) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: NHOE_TEX, color: mau, transparent: true, depthWrite: false, blending: cong ? THREE.AdditiveBlending : THREE.NormalBlending })); s.visible = false; scene.add(s); return s; };
const GT = [];                                                                             // các trận bộ binh
// o = { t0, t1, voice: dùng giây voice (tầng chiến dịch) hay giờ Dinh, sc, r: bán kính vẽ, A: [[x,z,yaw,clip]…] (ta), B: (đối phương), chet: phần đối phương ngã sau trận }
const giaoTranh = (o) => { o.sc = o.sc || 1; o.r = o.r || 700; o.ph = o.A.concat(o.B).map((_, i) => (i * 0.618) % 1);
  const r = rndS(o.A.length * 31 + 7);
  for (const P of o.A.concat(o.B)) { P[4] = Math.max(hG(P[0], P[1]), CAU_Y(P[0], P[1])); let q = null; for (let n = 0; n < 8 && !q; n++) { const a = r() * 6.28, d = (4 + r() * 6) * o.sc, x = P[0] + Math.cos(a) * d, z = P[1] + Math.sin(a) * d; if (hG(x, z) > 0.4 || CAU_Y(x, z) > 0) q = [x, z]; } P[5] = q || [P[0], P[1]]; }   // chỗ nấp thứ hai (không dưới nước)
  if (o.dong) o.no = Array.from({ length: 5 }, () => nhoe(0xff9a4a));
  GT.push(o); return o; };
// V1.9 (anh Thắng: Rạch Chiếc, cầu Sài Gòn — thêm ụ bê tông, ụ đất để hai bên có chỗ ẩn nấp mà bắn): sau khi giaoTranh tính chỗ nấp (P, P[5]),
// đặt một ụ trước mỗi chỗ nấp, về phía đối phương (A nhìn theo f, B ngược lại); bỏ ụ nào đè lên chỗ đứng của người khác. Kích thước, vị trí: MINH HOẠ.
const uNap = (A, B, f, yf, sc, seed) => { const bt = [], dat = [], rr = rndS(seed);
  for (const [L, huong] of [[A, 1], [B, -1]]) L.forEach((P, i) => { for (const Q of [P, P[5]]) { if (!Q || (Q !== P && i % 2)) continue; const x = Q[0] + f.x * huong * 1.4 * sc, z = Q[1] + f.z * huong * 1.4 * sc;
    if (hG(x, z) < 0.4 && CAU_Y(x, z) <= 0) continue; if (A.concat(B).some((R) => [R, R[5]].some((S) => S && Math.hypot(S[0] - x, S[1] - z) < 1.25 * sc))) continue;
    (rr() < 0.45 ? bt : dat).push([x, Math.max(hG(x, z), CAU_Y(x, z)), z, yf + (rr() - 0.5) * 0.5]); } });
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  const ve = (geo, mat, L, sx, sy, sz) => { const im = new THREE.InstancedMesh(geo, mat, Math.max(1, L.length)); im.count = L.length;
    L.forEach(([x, y, z, a], i) => im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, y, z), q4.setFromAxisAngle(Y, a), new THREE.Vector3(sx * sc, sy * sc, sz * sc)))); im.frustumCulled = false; scene.add(im); return im; };
  ve(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0x8f8d86 }), bt, 2.2, 1.0, 0.6);                    // ụ bê tông (cao ~1 m: quỳ nấp, đứng bắn qua)
  ve(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x6e5236 }), dat, 1.3, 0.7, 0.75);   // ụ đất, bao cát
  return bt.length + dat.length; };
const BAN = [];                                                                            // các phát pháo xe tăng: { tu, a(), b(), no: nổ ở b, voice }
const banTao = (tu, a, b, o = {}) => { const S = { tu, a, b, sc: o.sc || 1, voice: !!o.voice, loe: nhoe(0xffd08a), no: nhoe(0xff8a3a), khoi: nhoe(0x5a524a, false) }; BAN.push(S); return S; };
DAM.push((t, tv) => {
  for (const o of GT) { const tt = o.voice ? tv : t; if (tt < o.t0 - 0.5 || tt > o.t1 + (o.sau || 25)) continue;
    const c = o.A[0]; if (!ganMay(c[0], c[1], o.r)) continue; const on = tt < o.t1, sc = o.sc;
    const nc = Math.floor(o.B.length * (o.chet || 0));
    // o.dong: lính chạy qua lại giữa hai chỗ nấp, đứng bắn, quỳ bắn, nằm bắn; bên đối phương ngã dần (anh Thắng 24/11: giao tranh ở cầu như trận Thành cổ)
    const vt = (P, i, ben, nga) => { if (!o.dong) return [P[0], P[1], P[2], on ? P[3] : 'dung'];
      if (nga) return [P[0], P[1], P[2], 'nam']; const Ti = 8 + (i % 4) * 1.3, a = tt - o.t0 + o.ph[i] * Ti, c = Math.floor(a / Ti), u = a - c * Ti, q = P[5], A0 = c % 2 ? q : P, B0 = c % 2 ? P : q;
      const chay = ben ? 'chay' : 'chay', nam = ben ? 'namban' : 'truon';
      if (!on) return [P[0], P[1], P[2], ben ? 'dung' : 'nam'];
      const tc = clamp(Math.hypot(B0[0] - A0[0], B0[1] - A0[1]) / ((ben ? 4.0 : 3.8) * sc), 0.6, 3.0);   // chạy đúng nhịp bước (4,0 / 3,8 m/s × tỉ lệ) — không trượt
      if (u < 3.2) return [A0[0], A0[1], P[2], i % 3 ? 'ban' : 'quy'];
      if (u < 3.2 + tc) { const k = (u - 3.2) / tc; return [A0[0] + (B0[0] - A0[0]) * k, A0[1] + (B0[1] - A0[1]) * k, Math.atan2(B0[0] - A0[0], B0[1] - A0[1]), chay]; }
      return [B0[0], B0[1], P[2], u < 5.6 + tc ? (i % 2 ? nam : 'quy') : 'ban']; };
    o.A.forEach((P, i) => { const [x, z, yaw, clip] = vt(P, i, true, false); P[6] = x; P[7] = z; P[8] = clip; dongDat('qgp', clip, tt, o.ph[i], x, Math.max(hG(x, z), CAU_Y(x, z)), z, yaw, sc, i); });
    o.B.forEach((P, i) => { const j = o.A.length + i, nga = o.dong && i < nc && tt > o.t0 + (o.nga0 ?? 4) + i * (o.nga ?? 1.7); if (!on && i >= nc) return;
      const [x, z, yaw, clip] = vt(P, j, false, nga); P[6] = x; P[7] = z; P[8] = clip; dongDat('vnch', on || !o.dong ? (o.dong ? clip : P[3]) : 'nam', tt, o.ph[j], x, Math.max(hG(x, z), CAU_Y(x, z)) + (clip === 'nam' ? 0.2 : 0), z, yaw, sc, i); });
    if (o.no) o.no.forEach((S, k) => { const T2 = 2.6 + k * 0.7, u = ((tt - o.t0) / T2 + k * 0.37) % 1, L_ = k % 2 ? o.B : o.A, Q = L_[(((Math.floor((tt - o.t0) / T2) * 7 + k * 5) % L_.length) + L_.length) % L_.length];   /* V1.4: chỉ số âm khi tt < t0 → lỗi 'reading 5', đứng hình Hồi 10 */
      S.visible = on && u < 0.32; if (!S.visible) return; S.position.set(Q[5][0] + (k - 2) * 3 * sc, hG(Q[5][0], Q[5][1]) + (1 + u * 5) * sc, Q[5][1] + 4 * sc); S.scale.setScalar((3 + u * 16) * sc); S.material.opacity = 0.95 * (1 - u / 0.32); });
    if (!on) continue;
    const ban = (P, Q, ph, mau) => { const u = (tt * 1.6 + ph) % 1, c = P[8] || P[3]; if (u > 0.55 || /chay|nam$|truon/.test(c)) return; const px = P[6] ?? P[0], pz = P[7] ?? P[1];
      const y0 = hG(px, pz) + (c === 'quy' ? 1.0 : c === 'namban' ? 0.35 : 1.35) * sc;
      vach(px + Math.sin(P[2]) * 0.6 * sc, y0, pz + Math.cos(P[2]) * 0.6 * sc, Q[6] ?? Q[0], Q[4] + 1.1 * sc, Q[7] ?? Q[1], u / 0.55, 2.4 * sc, 0.07 * sc, mau); };
    o.A.forEach((P, i) => { if (i % 2 === 0) ban(P, o.B[(i * 7) % o.B.length], o.ph[i], 0x9dff7a); });
    o.B.forEach((P, i) => { if (i % 2 === 1) ban(P, o.A[(i * 5) % o.A.length], o.ph[o.A.length + i], 0xff5a3c); }); }
  for (const S of BAN) { const a = (S.voice ? tv : t) - S.tu, sc = S.sc;
    S.loe.visible = a > 0 && a < 0.3; S.no.visible = a > 0.35 && a < 1.6; S.khoi.visible = a > 0.5 && a < 6;
    if (a < 0 || a > 6) continue; const A = S.a(), B = S.b(); if (!A || !B) { S.loe.visible = S.no.visible = S.khoi.visible = false; continue; }
    if (S.loe.visible) { S.loe.position.copy(A); S.loe.scale.setScalar((3 + a * 12) * sc); }
    if (a < 0.35) vach(A.x, A.y, A.z, B.x, B.y, B.z, a / 0.35, 6 * sc, 0.25 * sc, 0xffc070);
    if (S.no.visible) { const b = a - 0.35; S.no.position.set(B.x, B.y + (1 + b * 3) * sc, B.z); S.no.scale.setScalar((5 + b * 14) * sc); S.no.material.opacity = 0.95 * (1 - b / 1.25); }
    if (S.khoi.visible) { const b = (a - 0.5) / 5.5; S.khoi.position.set(B.x, B.y + (2 + b * 16) * sc, B.z); S.khoi.scale.setScalar((6 + b * 22) * sc); S.khoi.material.opacity = 0.55 * (1 - b); } }
});
// CẦU (anh Thắng 24/11: đoàn xe phải đi trên cầu Thị Nghè, cầu Chữ Y…, không lội nước): dò dọc tuyến xe chạy, chỗ nào mặt đất thấp hơn mặt nước thì
// dựng một cây cầu bê tông (mặt cầu, lan can, trụ) có dốc hai đầu; xe chạy trên mặt cầu (CAU_Y của bộ máy 2.2). Hình dáng cầu: GIẢN LƯỢC, chưa theo ảnh từng cầu.
const CAU = [], CAU_MAT = new THREE.MeshLambertMaterial({ color: 0x9c978c }), CAU_LC = new THREE.MeshLambertMaterial({ color: 0xd8d4c8 });
CAU_Y = (x, z) => { let y = -1e9; for (const C of CAU) { if (x < C.x0 || x > C.x1 || z < C.z0 || z > C.z1) continue;
  for (const S of C.S) { const dx = S.bx - S.ax, dz = S.bz - S.az, L2 = dx * dx + dz * dz || 1, k = clamp(((x - S.ax) * dx + (z - S.az) * dz) / L2, 0, 1), px = S.ax + dx * k - x, pz = S.az + dz * k - z;
    if (px * px + pz * pz < C.w2) y = Math.max(y, S.ya + (S.yb - S.ya) * k); } } return y; };
const cauGan = (x, z, d) => { for (const C of CAU) { if (x < C.x0 - d || x > C.x1 + d || z < C.z0 - d || z > C.z1 + d) continue; const w = Math.sqrt(C.w2) + d;
  for (const S of C.S) { const dx = S.bx - S.ax, dz = S.bz - S.az, L2 = dx * dx + dz * dz || 1, k = clamp(((x - S.ax) * dx + (z - S.az) * dz) / L2, -0.5, 1.5), px = S.ax + dx * k - x, pz = S.az + dz * k - z; if (px * px + pz * pz < w * w) return true; } } return false; };
const cauTao = (P, o = {}) => { if (!P || P.length < 2) return 0;
  const k = o.k || 1, rong = (o.rong || 12) * k, muc = 0.36, cao = (o.cao || 4.5) * k, D = duong(P), runs = [], buoc = 3 * k; let a = null;
  for (let d = 0; d <= D.L; d += buoc) { const p = diemTren(D, d), uot = hG(p.x, p.z) < muc; if (uot && a === null) a = d; if ((!uot || d + buoc > D.L) && a !== null) { if (d - a >= 5 * k && d - a < 1500 * k) runs.push([a, d]); a = null; } }
  for (const [a0, b0] of runs) {
    const a = Math.max(0, a0 - 16 * k), b = Math.min(D.L, b0 + 16 * k), pa = diemTren(D, a), pb = diemTren(D, b), ya = hG(pa.x, pa.z), yb = hG(pb.x, pb.z), Y = Math.max(ya, yb, muc + cao), r = Math.min(28 * k, (b - a) / 3);
    const yAt = (d) => (d < a + r ? ya + (Y - ya) * sstep(a, a + r, d) : d > b - r ? yb + (Y - yb) * (1 - sstep(b - r, b, d)) : Y);
    const C = { S: [], w2: (rong / 2 + 1) ** 2, x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 }, g = new THREE.Group(), n = Math.max(2, Math.ceil((b - a) / (6 * k)));
    for (let i = 0; i < n; i++) { const d0 = a + (b - a) * i / n, d1 = a + (b - a) * (i + 1) / n, p0 = diemTren(D, d0), p1 = diemTren(D, d1), y0 = yAt(d0), y1 = yAt(d1);
      C.S.push({ ax: p0.x, az: p0.z, bx: p1.x, bz: p1.z, ya: y0, yb: y1 });
      const L = Math.hypot(p1.x - p0.x, p1.z - p0.z), yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z), pit = -Math.atan2(y1 - y0, L), mx = (p0.x + p1.x) / 2, mz = (p0.z + p1.z) / 2, my = (y0 + y1) / 2;
      const san = new THREE.Mesh(new THREE.BoxGeometry(rong, 0.9 * k, L + 0.3 * k), CAU_MAT); san.position.set(mx, my - 0.45 * k, mz); san.rotation.set(pit, yaw, 0, 'YXZ'); g.add(san);
      for (const s of [-1, 1]) { const lc = new THREE.Mesh(new THREE.BoxGeometry(0.35 * k, 1.1 * k, L + 0.3 * k), CAU_LC); lc.position.set(mx + Math.cos(yaw) * s * (rong / 2 - 0.2 * k), my + 0.55 * k, mz - Math.sin(yaw) * s * (rong / 2 - 0.2 * k)); lc.rotation.copy(san.rotation); g.add(lc); }
      if (i % 4 === 2 && d0 > a0 && d1 < b0) { const tru = new THREE.Mesh(new THREE.BoxGeometry(rong * 0.8, my + 3, 1.6 * k), CAU_MAT); tru.position.set(mx, (my - 3) / 2, mz); tru.rotation.y = yaw; g.add(tru); }
      for (const p of [p0, p1]) { C.x0 = Math.min(C.x0, p.x - rong); C.x1 = Math.max(C.x1, p.x + rong); C.z0 = Math.min(C.z0, p.z - rong); C.z1 = Math.max(C.z1, p.z + rong); } }
    scene.add(g); CAU.push(C); }
  return runs.length; };
const XEX = { x843: null, x390: null, lai843: null, ctt: null, than: null };
if ((HCM && TANG === 'noi-do') && DUONG_DINH.length) {
  progress(0.4, 'Đang tải xe tăng 843, 390…');
  const L0 = (() => { let a = 0; for (let i = 1; i < DUONG_DINH.length; i++) a += Math.hypot(DUONG_DINH[i][0] - DUONG_DINH[i - 1][0], DUONG_DINH[i][1] - DUONG_DINH[i - 1][1]); return a; })();
  XEX.L = L0;
  // DINH ĐỘC LẬP (dáng trước 1975, tools/sa_ban/dinh/dung_dinh.py): gốc giữa mặt tiền O, mặt tiền nhìn phương vị 42,6° (nền nhà OSM)
  progress(0.45, 'Đang dựng Dinh Độc Lập…');
  const DO = [27.5, 21], DU = [0.7357, -0.6773], DN = [0.6773, 0.7357];
  const DL = (sd, dd) => [DO[0] + sd * DU[0] + dd * DN[0], DO[1] + sd * DU[1] + dd * DN[1]];          // (dọc mặt tiền, ra cổng) → Blender [x, y_Bắc]
  { const hs = []; for (let a = -100; a <= 100; a += 20) for (let b = -90; b <= 140; b += 23) { const [x, y] = DL(a, b); hs.push(hG(x, -y)); }
    hs.sort((p, q) => p - q); XEX.hDinh = hs[Math.floor(hs.length * 0.85)]; }
  matPhang(DO[0], -DO[1], Math.atan2(-DU[1], DU[0]), -110, 110, -100, 146, XEX.hDinh);     // trong rào: mặt sân phẳng
  { const g = await glbLoad('data/dinh/dinh-doc-lap.glb'); const o = g.scene; o.position.set(DO[0], XEX.hDinh, -DO[1]); o.rotation.y = -0.7441; scene.add(o);
    XEX.dinh = o; XEX.cong = { trai: o.getObjectByName('CongTrai'), phai: o.getObjectByName('CongPhai'), phu: o.getObjectByName('CongPhuDuong') }; LAYER.xe.push(o); }
  // đường vào: theo Lê Duẩn tới cổng chính (trục Dinh) — bỏ đoạn rẽ phải cũ của tim_duong
  const iNga = DUONG_DINH.reduce((b, p, i) => { const q = DL(2, 151), e = Math.hypot(p[0] - q[0], p[1] - q[1]); return e < b[0] ? [e, i] : b; }, [1e9, 0])[1];
  const GOC = DUONG_DINH.slice(0, iNga + 1);
  // C10 (bản voice): đoàn xe đi từ cầu Sài Gòn → ngã tư Hàng Xanh → cầu Thị Nghè (placement.json › duong.causg_thinghe, tim_duong.py) rồi theo GOC vào Dinh
  const CT = (INST.duong && INST.duong.causg_thinghe) || [GOC[0]];
  const D843 = [...CT.slice(0, -1), ...GOC.slice(0, -1), DL(6, 168), DL(13, 159), DL(13, 149.6),      // 843: lệch trái vào cổng phụ bên trái, sát cổng chính (ảnh 30/4)
                DL(13, 140)],                                                                          // húc đổ cổng phụ, chết máy, kẹt lại ở cổng (anh Thắng 24/11)
        D390 = [...CT.slice(0, -1), ...GOC.slice(0, -1), DL(0, 162), DL(0, 149.3), DL(-1.5, 138), DL(-10, 118), DL(-20, 100), DL(-19, 72), DL(-9, 42)];
  const dai = (P, k) => { let a = 0; for (let i = 1; i <= k; i++) a += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return a; };
  const L1 = dai(CT, CT.length - 1), g843 = dai(D843, D843.length - 2), g390 = dai(D390, CT.length - 1 + GOC.length);   // L1: cầu Sài Gòn → Thị Nghè; 843 tới cổng phụ; 390 tới cổng chính
  const HX = LL(10.8013, 106.7113);                                                       // ngã tư Hàng Xanh (toạ độ OSM 2026)
  const dHX = (() => { let b = [1e9, 0], a = 0; for (let i = 1; i < CT.length; i++) { a += Math.hypot(CT[i][0] - CT[i - 1][0], CT[i][1] - CT[i - 1][1]);
    const e = Math.hypot(CT[i][0] - HX.x, -CT[i][1] - HX.z); if (e < b[0]) b = [e, a]; } return b[1]; })();
  const fD = tDinh, cat = 0.02;                                                            // f: giây voice → giờ Dinh; cat: chuyển cảnh (xe "nhảy" theo cú máy)
  // từng đoạn theo cú máy C10: đầu cầu Sài Gòn (M48) · ngã tư Hàng Xanh (390 đi đầu, bắn cháy M113) · cầu Thị Nghè · Hồng Thập Tự
  XEX.L1 = L1; XEX.dHX = dHX;
  // 843 húc cổng phụ bên trái, bị kẹt lại ở cổng phụ (TƯ LIỆU §2: S7, S8, S18; vietnamnet); xe 390 húc đổ cổng chính (S34, S33)
  const LC = MV.c10_cau ? (a, b, c, d, e) => [[-999, a], [fD(MV.c10_cau), a], [fD(MV.c10_hx) - cat, a + 160], [fD(MV.c10_hx), b], [fD(MV.c10_tn) - cat, c], [fD(MV.c10_tn), d], [42, e]] : () => [[42, L1]];
  XEX.x843 = await xeTao('data/xe/xe-tang-843.glb', { duong: D843, lich: [...LC(60, dHX - 120, dHX + 10, L1 - 210, L1 + 40), [84, g843], [85.2, g843 + 4], [999, g843 + 4]], hien: (t) => t >= -60, ten: 'Xe tăng 843' });
  XEX.x390 = await xeTao('data/xe/xe-tang-390.glb', { duong: D390, lich: [...LC(15, dHX - 60, dHX + 70, L1 - 255, L1 - 5), [90, g390], [108, dai(D390, D390.length - 1)]], hien: (t) => t >= -60, ten: 'Xe tăng 390' });
  XEX.DL = DL;
  console.log('cầu nội đô', cauTao(CT), cauTao(GOC), cauTao((INST.duong && INST.duong.chu_y) || null));
  // NHÀ CỬA SÀI GÒN 1975 — vị trí xếp sẵn bằng tools/sa_ban/nha/xep_nha.py (props/nha/xep.json), mẫu dung_nha_pho.py (props/nha/nha-pho.glb).
  // Theo ảnh anh Thắng gửi 24/11: nhà phố cũ (4 kiểu chi tiết sát lộ trình xe tăng), phố nhìn từ trên cao (nhà xa: mái ngói, mái tôn, bê tông kín lõi khối phố),
  // nhà lá trên cọc ven kênh (ảnh kênh Hàng Bàng – Chợ Lớn), xuồng, ghe. MINH HOẠ mật độ đô thị, không phải bản đồ từng căn.
  // Vẽ hàng loạt theo ô 1,5 km × kiểu (InstancedMesh), ô xa thì ẩn bớt (ẩn trước: nhà chi tiết, nhà lá, ghe).
  { const [g, X] = await Promise.all([glbLoad('data/nha/nha-pho.glb'), fetch(PU('data/nha/xep.json')).then((r) => r.json())]);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y1 = new THREE.Vector3(0, 1, 0), cl = new THREE.Color(), O = 1500;
    const DT = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 820;   // điện thoại, máy tính bảng: tỉa tiếp, nhìn gần hơn
    XEX.nha = []; let tong = 0;
    // V1.9 (anh Thắng: 11:57 giữa ngã tư Hàng Xanh có cái nhà, nhìn không hợp lý): bỏ nhà nằm trên lòng đường đoàn xe đi (cách tim đường < 12 m)
    // và mọi nhà trong vòng 55 m quanh tâm ngã tư Hàng Xanh
    const TUYEN = [CT, GOC].filter((P) => P && P.length > 1), treoDuong = (x, y) => { if (Math.hypot(x - HX.x, -y - HX.z) < 55) return true;
      for (const P of TUYEN) for (let k = 1; k < P.length; k++) { const [ax, ay] = P[k - 1], [bx, by] = P[k], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
        if (Math.hypot(x - ax - u * dx, y - ay - u * dy) < 12) return true; } return false; };
    for (const [kieu, A0] of Object.entries(X.kieu)) {
      const ten = kieu.replace(/[~^]/g, ''), tia = kieu.endsWith('^') || ten === 'Xuong' || ten === 'Ghe' ? 0 : !ten.startsWith('Xa') ? 0.5 : DT ? (kieu.endsWith('~') ? 0.91 : 0.86) : (kieu.endsWith('~') ? 0.85 : 0.81);   /* V1.6 (22:04): giảm thêm một nửa, cả nhà chi tiết, nhà lá; giữ nhà sát lộ trình */   // '^': sát lộ trình (không tỉa); '~': lõi khối phố — anh Thắng V1.2: bớt nhà để thêm xe
      const A = []; for (let i = 0; i < A0.length; i += 4) if ((!tia || ((((i >> 2) * 2246822519) >>> 0) / 4294967296) >= tia) && !cauGan(A0[i], -A0[i + 1], 40) && !(A0[i] > 1450 && A0[i + 1] < 900 && A0[i + 1] > -2600) && !treoDuong(A0[i], A0[i + 1])) A.push(A0[i], A0[i + 1], A0[i + 2], A0[i + 3]);   // bỏ nhà che lối lên cầu; bỏ hết nhà bán đảo Thủ Thiêm (V1.3: máy quay không nhìn sang đó)
      const src = g.scene.getObjectByName(ten); if (!src) continue; const mesh = src.isMesh ? src : src.children.find((c) => c.isMesh);
      mesh.updateWorldMatrix(true, false); const mq = mesh.matrixWorld.clone();             // ma trận giải nén toạ độ (meshopt lượng tử hoá)
      const la = ten.startsWith('La'), ghe = ten === 'Xuong' || ten === 'Ghe', xa = (la || ghe || ten.startsWith('Nha') ? 1800 : 5200) * (DT ? 0.65 : 1), o = new Map();
      for (let i = 0; i < A.length; i += 4) { const k = Math.floor(A[i] / O) + ',' + Math.floor(A[i + 1] / O); if (!o.has(k)) o.set(k, []); o.get(k).push(i); }
      for (const [k, L] of o) {
        const im = new THREE.InstancedMesh(mesh.geometry, mesh.material, L.length); let cx = 0, cz = 0;
        L.forEach((i, n) => { const x = A[i], z = -A[i + 1], h = ghe ? 0.3 : la ? Math.max(hG(x, z), 0.6) + 0.5 : hG(x, z) - 0.2, r = ((i * 2654435761) >>> 0) / 4294967296;
          m4.compose(new THREE.Vector3(x, h, z), q.setFromAxisAngle(Y1, A[i + 2] * Math.PI / 180), new THREE.Vector3(A[i + 3] / 100, 1, 1)); im.setMatrixAt(n, m4.multiply(mq));
          const c = 0.8 + r * 0.28; im.setColorAt(n, cl.setRGB(c, c * (0.96 + r * 0.05), c * (0.92 + r * 0.06))); cx += x; cz += z; });
        im.computeBoundingSphere(); im.userData.tam = new THREE.Vector3(cx / L.length, 0, cz / L.length); im.userData.xa = xa; scene.add(im); LAYER.nha.push(im); XEX.nha.push(im); tong += L.length; } }
    XEX.nhaTong = tong; }
  // TÀU HẢI QUÂN VNCH kiểu PCE (ảnh HQ-07 anh Thắng gửi) neo ở bến Bạch Đằng — Bộ Tư lệnh Hải quân, mục tiêu hướng Đông (S3, S6). Kích thước lớp PCE: S43. Số tàu, vị trí neo: MINH HOẠ.
  { const g = await glbLoad('data/tau/tau-hq-pce.glb');
    for (const [x, y] of [[1312, -215], [1316, -290]]) { const o = g.scene.clone(true); o.position.set(x, 0.3, -y); o.rotation.y = Math.atan2(0.058, -0.998) + Math.PI; scene.add(o); LAYER.xe.push(o); } }
  // CỜ MẶT TRẬN trên khí tài Quân Giải phóng (anh Thắng dặn 24/11; ảnh tư liệu 30/4: xe tăng cắm cờ trên tháp pháo; "xe nào cũng được trang bị lá cờ", S12/baophapluat).
  // Bùi Quang Thận tháo lá cờ trên tháp pháo xe 843 mang lên nóc Dinh (S37) → cờ xe 843 biến mất khi anh rời xe.
  const coXeTex = new THREE.TextureLoader().load('data/co-mtdtgp.png'); coXeTex.colorSpace = THREE.SRGBColorSpace;
  const coXe = (obj, cao = 2.0, w = 1.15) => {
    const bb = new THREE.Box3().setFromObject(obj), sz = bb.getSize(new THREE.Vector3()), g = new THREE.Group();
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, cao, 5).translate(0, cao / 2, 0), new THREE.MeshLambertMaterial({ color: 0x3a2c1c }));
    const m = new THREE.MeshLambertMaterial({ map: coXeTex, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.x += sin(uv.x * 6.0 - uT * 6.0) * 0.12 * uv.x;'); };
    const la = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.66, 10, 2).translate(w / 2, cao - w * 0.33, 0).rotateY(Math.PI / 2), m);   // lá cờ bay về phía sau xe (−z)
    g.add(can, la); g.position.set(sz.x * 0.17, sz.y * 0.8, -sz.z * 0.1); obj.add(g); return g; };
  XEX.co843 = coXe(XEX.x843.obj); XEX.co390 = coXe(XEX.x390.obj); XEX.coXe = coXe;
  // ĐOÀN XE CHỞ BỘ BINH theo sau xe tăng (anh Thắng 24/11, mốc 12:22 — đường Hồng Thập Tự): Trung đoàn 66 đi cùng Lữ đoàn 203 trong mũi thọc sâu
  // (giaoduc.net.vn: "Trung đoàn 66 cùng với xe tăng của Lữ đoàn 203"). Số xe, thứ tự xe tải / K-63, khoảng cách: MINH HOẠ. Đoàn dừng ngoài cổng, bộ binh xuống xe vào sân.
  { const KX = ['tang', 'tai', 'tai', 'k63', 'tai', 'tang', 'tai', 'tai', 'k63', 'tai', 'tang', 'tai', 'tai', 'k63'], L390 = [...LC(15, dHX - 60, dHX + 70, L1 - 255, L1 - 5), [90, g390]];
    XEX.doan = [];
    for (let k = 0; k < KX.length; k++) {
      const lui = 34 + k * 21, ld = (d) => Math.max(0, d - lui), dung = g390 - 22 - k * 13;     // dừng thành hàng trên đại lộ Thống Nhất, trước cổng
      const X = await xeTao(KX[k] === 'tai' ? 'data/xe/xe-tai.glb' : KX[k] === 'tang' ? 'data/xe/xe-tang-390.glb' : 'data/xe/xe-boc-thep-k63.glb', { duong: D390, lich: [...L390.map(([t, d]) => [t, ld(d)]), [90 + k * 0.8, Math.min(dung, ld(g390))], [999, Math.min(dung, ld(g390))]],
        hien: (t) => t >= fD(MV.c10_tn) - 1, lech: k % 2 ? 1.6 : -1.6, ten: KX[k] === 'tai' ? 'Xe tải chở bộ binh' : KX[k] === 'tang' ? 'Xe tăng T-54' : 'Xe bọc thép K-63' });
      if (KX[k] === 'tang') X.obj.traverse((m) => { if (/^so-hieu/.test(m.name)) m.visible = false; });
      coXe(X.obj, KX[k] === 'tai' ? 2.4 : 2.0, 1.0); LAYER.xe.push(X.obj); XEX.doan.push({ X, loai: KX[k], k }); }
    DAM.push((t) => { for (const { X, loai, k } of XEX.doan) { if (!ganMay(X.obj.position.x, X.obj.position.z, 600)) continue; if (t < 93 + k * 0.6) linhTrenXe(X.obj, loai, t, 1, k * 9);
        if (t < 89.5) buiXe(X.obj, 1, t, 0x9a948a); }
      for (const X of [XEX.x843, XEX.x390]) if (X && X.obj.visible && t < 89 && ganMay(X.obj.position.x, X.obj.position.z, 600)) buiXe(X.obj, 1.2, t, 0x8a857c);
      if (XEX.x390 && XEX.x390.obj.visible && t < 89) for (const [i, P] of LINH_XE.tang.slice(0, 4).entries()) { const [x, y, z, yaw] = quayXe(XEX.x390.obj, P[0], P[1], P[2]); dongDat('qgp', 'ngoi', t, i * 0.3, x, y, z, yaw + P[3] * Math.PI / 2, 1, i); } }); }   // bộ binh ngồi trên sàn xe 390
  // XE TĂNG BẮN NHAU (anh Thắng 24/11). Đầu cầu Sài Gòn: đối phương chống trả quyết liệt (Tiền Phong 30/4/2026), M48 chặn đầu cầu (S33), hai M48 bị bắn cháy
  // (giaoduc.net.vn: ĐKZ). Cầu Thị Nghè: xe 843 bắn cháy 2 xe M41 (S26). Chớp nòng, đường đạn, nổ, cháy theo câu đọc; từng phát bắn: MINH HOẠ.
  XEX.ban = [];                                                                              // { tu, a: () => điểm nòng, b: () => điểm trúng, no: true khi trúng xe }
  // NGƯỜI DÂN SÀI GÒN 1975 cận cảnh (có xương; mẫu anh Thắng 24/11: nữ áo dài, nam sơ mi quần tây) — trước cổng Dinh, vẫy tay, vỗ tay khi xe tăng vào.
  // Vị trí, số người là TÁI DỰNG MINH HOẠ (S32: người dân đổ ra đường trưa 30/4).
  { const rnd = (() => { let a = 30475; return () => (a = (a * 16807) % 2147483647) / 2147483647; })(), CL = ['vay', 'vay2', 'vota', 'dung', 'vay'];
    for (let i = 0; i < 26; i++) {
      const sg = i % 2 ? 1 : -1, sd = sg * (17 + rnd() * 26), dd = 152 + rnd() * 22, [x, y] = DL(sd, dd), [cx, cy] = DL(sd * 0.4, 146);
      const yaw = Math.atan2(cx - x, -cy + y), clip = CL[i % CL.length], t0 = 156 + rnd() * 10, nu = i % 3 !== 0;   // ra đường sau khi cờ lên (giờ Dinh 158 = câu "tại Đài phát thanh")
      nvxTao('models/' + (nu ? 'dan-sg-nu' : 'dan-sg-nam') + '.glb', (t) => (t < t0 ? null : { x, z: -y, yaw, clip: t < t0 + 3 ? 'di' : clip, toc: 0.85 + (i % 5) * 0.07 }), { ten: 'Người dân Sài Gòn' })
        .catch((e) => console.warn('dân SG', e));
    } }
  // CẮM CỜ TRÊN NÓC DINH (cảnh T03): Đại đội trưởng Bùi Quang Thận (trưởng xe 843) tháo lá cờ Mặt trận trên tháp pháo, không mang vũ khí,
  // chạy vào Dinh (S37); trên nóc hạ lá cờ ba sọc — cờ to, vải dày nên mất nhiều phút (S37, S38); đúng 11 giờ 30 cờ được kéo lên cột cờ (S38).
  { const H = XEX.hDinh, P3 = (a, b) => { const [x, y] = DL(a, b); return { x, z: -y }; }, cot = P3(0, -4), dung = P3(1.0, -2.6), cua = P3(0, 20);   // chân bậc thềm (nền Dinh cao 2,7 m)
    const yawTo = (f, t) => Math.atan2(t.x - f.x, t.z - f.z), lerpP = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u });
    XEX.than = await nvxTao('models/linh-tang.glb', (t) => {
      if (t < 115) return null;
      const X = XEX.x843.obj.position, ben = { x: X.x + Math.cos(XEX.x843.obj.rotation.y) * 2.6, z: X.z - Math.sin(XEX.x843.obj.rotation.y) * 2.6 };
      if (t < 116.4) { const u = (t - 115) / 1.4; const p = lerpP(X, ben, u); return { ...p, y: X.y + 1.35 * (1 - u), yaw: yawTo(X, ben), clip: 'leo' }; }
      // anh Thắng 24/11: dáng chạy dứt khoát như bộ binh, tốc độ thật (~7 m/s). Quãng cổng phụ → thềm Dinh ~135 m dài hơn thời gian câu đọc → hai đoạn chạy thật,
      // nối ở chỗ chuyển cú máy (T03-A → T03-A2, câu "chạy").
      const L = Math.hypot(cua.x - ben.x, cua.z - ben.z), V = 7, TOC = 7 / 9.2,   /* nhịp bước 'chaynhanh' 9,2 m/s (đo khi nướng) → chân khớp tốc độ, không trượt */ dx = (cua.x - ben.x) / L, dz = (cua.z - ben.z) / L, yaw = yawTo(ben, cua);
      if (t < 122.5) { const d = Math.min(L, V * (t - 116.4)); return { x: ben.x + dx * d, z: ben.z + dz * d, yaw, clip: 'chaynhanh', toc: TOC }; }   // từ xe 843 kẹt ở cổng phụ chạy vào sân
      if (t < 128) { const d = Math.min(L, V * (128 - t)); return { x: cua.x - dx * d, z: cua.z - dz * d, yaw, clip: 'chaynhanh', toc: TOC }; }        // băng qua bãi cỏ tới thềm
      if (t < 129) return null;                                                                // trong Dinh, lên cầu thang
      const keo = t >= 131 && t < 146;
      return { ...dung, y: H + 27.5, yaw: t < 147 ? yawTo(dung, cot) : yawTo(dung, P3(1.0, 20)), clip: keo ? 'keo' : 'dung' };
    }, { ten: 'Bùi Quang Thận' });
    const cv = (src) => { const tx = new THREE.TextureLoader().load(src); tx.colorSpace = THREE.SRGBColorSpace; return tx; };
    const coMat = (tx) => { const m = new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uv.x * 6.0 - uT * 5.0) * 0.16 * uv.x;'); }; return m; };
    const co = (src, w, h) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 12, 3).translate(w / 2, -h / 2, 0), coMat(cv(src)));
      g.add(m); g.position.set(cot.x, H + 27.5, cot.z); g.rotation.y = -0.7441; scene.add(g); LAYER.xe.push(g); return g; };
    XEX.coVnch = co('data/co-vnch.png', 2.4, 1.6); XEX.coMt = co('data/co-mtdtgp.png', 1.8, 1.2);
    XEX.coCap = (t) => {                                                                     // độ cao mép trên lá cờ so với chân cột (cột 7 m)
      const hv = t < 131 ? 6.9 : t < 137 ? 6.9 - (t - 131) / 6 * 5.6 : -1, hm = t < 139 ? -1 : 1.4 + Math.min(1, (t - 139) / 6) * 5.5;
      XEX.coVnch.visible = hv > 0; XEX.coVnch.position.y = H + 27.5 + hv; XEX.coMt.visible = hm > 0; XEX.coMt.position.y = H + 27.5 + hm;
    }; }
  // Xác M41 cháy án ngữ đầu cầu Thị Nghè: xe 387 bắn cháy một M41 và một M113 ở đây sáng 30/4 (S36).
  { const D = duong(GOC), tn = [LLx(MOC.thinghe[0], MOC.thinghe[1]), LLz(MOC.thinghe[0], MOC.thinghe[1])];
    let best = [1e9, 0]; for (let d = 0; d < D.L; d += 5) { const p = diemTren(D, d), e = Math.hypot(p.x - tn[0], p.z - tn[1]); if (e < best[0]) best = [e, d]; }
    const p = diemTren(D, best[1] + 45), g = await glbLoad('data/xe/xe-tang-m41.glb'), o = g.scene.clone(true);
    XEX.matsCua = (o) => { const M = []; o.traverse((m) => { if (m.isMesh) { if (!m.material.userData.rieng) { m.material = m.material.clone(); m.material.userData.rieng = 1; } M.push([m.material, m.material.color.clone()]); } }); return M; };   // cháy đen từ lúc trúng đạn (tu)
    const x = p.x + Math.cos(p.yaw) * 9, z = p.z - Math.sin(p.yaw) * 9; o.position.set(x, hG(x, z), z); o.rotation.set(0.04, p.yaw + 2.3, -0.06); scene.add(o);
    XEX.m41chay = o; LAYER.xe.push(o);
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
    const km = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), color: 0x3a3836, transparent: true, opacity: 0.4, depthWrite: false });   // khói đen bốc lên
    const khoi = () => Array.from({ length: 10 }, (_, i) => { const sp = new THREE.Sprite(km.clone()); sp.userData.k = i / 10; scene.add(sp); LAYER.xe.push(sp); return sp; });
    XEX.chay = [{ o, khoi: khoi() }]; XEX.khoiTao = khoi;
    // xác M113 cháy cạnh M41, bên kia đường (S36: xe 387 bắn cháy M41 và M113 án ngữ cầu Thị Nghè)
    { const q = diemTren(D, best[1] + 60), g2 = await glbLoad('data/xe/xe-boc-thep-m113.glb'), o2 = g2.scene.clone(true);
      const x2 = q.x - Math.cos(q.yaw) * 8, z2 = q.z + Math.sin(q.yaw) * 8; o2.position.set(x2, hG(x2, z2), z2); o2.rotation.set(-0.03, q.yaw - 0.6, 0.05); scene.add(o2); LAYER.xe.push(o2);
      XEX.chay.push({ o: o2, khoi: khoi() }); }
    // M113 ở ngã tư Hàng Xanh: lời dẫn (S36) — xe 390 bắn cháy chiếc M113 cản đường. Vị trí trên ngã tư, hướng xe: MINH HOẠ.
    if (MV.c10_ban) { const DC = duong(CT), q = diemTren(DC, XEX.dHX + 35), g4 = await glbLoad('data/xe/xe-boc-thep-m113.glb'), o4 = g4.scene.clone(true);
      const mats = []; o4.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); mats.push([m.material, m.material.color.clone()]); } });
      const x4 = q.x + Math.cos(q.yaw) * 5, z4 = q.z - Math.sin(q.yaw) * 5; o4.position.set(x4, hG(x4, z4), z4); o4.rotation.y = q.yaw + Math.PI + 0.25; scene.add(o4); LAYER.xe.push(o4);
      const tu = tDinh(MV.c10_ban + 1.2); XEX.m113hx = o4; XEX.chay.push({ o: o4, khoi: khoi(), tu, mats });
      const spr = (col) => { const sp = new THREE.Sprite(km.clone()); sp.material.color.set(col); sp.material.opacity = 0.95; sp.visible = false; scene.add(sp); return sp; };
      XEX.loe = spr(0xffd08a); XEX.no113 = spr(0xff8a3a); XEX.tBan = tDinh(MV.c10_ban + 0.6); }
    // M48 ở đầu cầu Sài Gòn phía nội đô (S33: tại đầu cầu Sài Gòn, đơn vị xe tăng ta đối mặt xe tăng M48) — tình trạng xe không rõ trong nguồn, đặt nguyên vẹn
    { const cs = LL(MOC.causg[0], MOC.causg[1]), g3 = await glbLoad('data/xe/xe-tang-m48.glb'), o3 = g3.scene.clone(true);
      const pm = diemTren(duong(CT), 150), x3 = pm.x + Math.cos(pm.yaw) * 7, z3 = pm.z - Math.sin(pm.yaw) * 7; o3.position.set(x3, hG(x3, z3), z3); o3.rotation.y = pm.yaw + Math.PI + 0.35;  /* chặn đầu cầu phía nội đô, mũi hướng về cầu */ scene.add(o3); LAYER.xe.push(o3); XEX.m48 = o3; } }
  // GHIM TÊN ĐƯỜNG (tên năm 1975) và TÊN KHÍ TÀI (anh Thắng 24/11). Đoạn Hàng Xanh – Thị Nghè chưa chắc tên năm 1975 → chưa ghim.
  XEX.ghimND = () => { const DC = duong(CT), DG = duong(GOC), du = (D, d, ten) => { const p = diemTren(D, d); const L = addLabel(ten, p.x, p.z, 'vil duong', { maxDist: 2500 }); L.yFn = () => hG(p.x, p.z) + 14; };
    du(DC, Math.min(400, XEX.dHX * 0.5), 'Xa lộ Biên Hòa'); du(DC, XEX.dHX, 'Ngã tư Hàng Xanh'); du(DG, DG.L * 0.35, 'Đường Hồng Thập Tự'); du(DG, DG.L - 160, 'Đại lộ Thống Nhất');
    const gx = (ten, get, dy = 4.2, xa = 450) => { const L = addLabel(ten, 0, 0, 'hero ly', { grp: 'hero', maxDist: xa }); L.dyn = get; L.dy = dy; };
    const vt = (o) => () => (o.visible ? o.position : null);
    gx('Xe tăng M48 (đối phương)', vt(XEX.m48)); gx('Xe tăng M41 (đối phương)', vt(XEX.chay[0].o)); gx('Xe bọc thép M113 (đối phương)', vt(XEX.chay[1].o));
    if (XEX.m113hx) gx('Xe bọc thép M113 (đối phương)', vt(XEX.m113hx));
    const d1 = XEX.doan.find((d) => d.loai === 'tai'), d2 = XEX.doan.find((d) => d.loai === 'k63');
    if (d1) gx('Xe tải chở bộ binh (Quân Giải phóng)', vt(d1.X.obj), 4); if (d2) gx('Xe bọc thép K-63 (Quân Giải phóng)', vt(d2.X.obj), 4); };   // gọi sau khi có addLabel
  // ---- XE TĂNG BẮN NHAU, BỘ BINH GIAO TRANH Ở CẦU (anh Thắng 24/11). Phát bắn, vị trí bộ binh: MINH HOẠ theo câu đọc.
  { const V3 = (x, y, z) => new THREE.Vector3(x, y, z), tD = tDinh, nong = (X, k = 4.2) => () => { const o = X.obj || X; if (!o.visible) return null; const y = o.rotation.y; return V3(o.position.x + Math.sin(y) * k, o.position.y + 2.2, o.position.z + Math.cos(y) * k); };
    const than = (o) => () => V3(o.position.x, o.position.y + 1.4, o.position.z), canh = (o, dx, dz) => () => V3(o.position.x + dx, hG(o.position.x + dx, o.position.z + dz) + 0.5, o.position.z + dz);
    const m48 = XEX.m48, mats48 = []; m48.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); mats48.push([m.material, m.material.color.clone()]); } });
    const k48 = () => { const y = m48.rotation.y; return () => V3(m48.position.x + Math.sin(y) * 5, m48.position.y + 2.2, m48.position.z + Math.cos(y) * 5); };
    // đầu cầu Sài Gòn: M48 bắn trước (trượt, nổ cạnh xe 843), xe ta bắn trả, M48 trúng đạn bốc cháy (tiếng đại bác, nổ đã có ở mốc c10_m48 + 1,6 / 2,1)
    banTao(tD(MV.c10_m48 + 0.5), k48(), canh(XEX.x843.obj, 6, -5)); banTao(tD(MV.c10_m48 + 1.6), nong(XEX.x843), than(m48));
    banTao(tD(MV.c10_m48 + 4.2), nong(XEX.x390), than(m48));
    XEX.chay.push({ o: m48, khoi: XEX.khoiTao(), tu: tD(MV.c10_m48 + 2.0), mats: mats48 });
    // bộ binh Trung đoàn 66 (ta) bám xe tăng ở đầu cầu, đối phương chốt quanh M48 phía nội đô
    { const DC = duong(CT), r = rndS(66), A = [], B = [], p0 = diemTren(DC, 40), f = V3(m48.position.x - p0.x, 0, m48.position.z - p0.z).normalize(), n = V3(f.z, 0, -f.x), yf = Math.atan2(f.x, f.z);
      for (let i = 0; i < 22; i++) { const p = diemTren(DC, 10 + r() * 70), s = (r() < 0.5 ? -1 : 1) * (4 + r() * 7); A.push([p.x + Math.cos(p.yaw) * s, p.z - Math.sin(p.yaw) * s, yf + (r() - 0.5) * 0.4, r() < 0.5 ? 'quy' : 'ban']); }
      for (let i = 0; i < 16; i++) { const a = 8 + r() * 40, b = (r() - 0.5) * 50; B.push([m48.position.x + f.x * a + n.x * b, m48.position.z + f.z * a + n.z * b, yf + Math.PI + (r() - 0.5) * 0.4, r() < 0.4 ? 'quy' : 'ban']); }
      giaoTranh({ dong: true, t0: tD(MV.c10_cau), t1: tD(MV.c10_m48 + 5), A, B, chet: 0.4, sau: tD(MV.c10_hx) - tD(MV.c10_m48 + 5), r: 900 }); uNap(A, B, f, yf, 1, 6666); }
    // cầu Thị Nghè: M41 bắn trước, xe 843 bắn cháy M41 (S26), xe cùng đoàn bắn cháy M113 (S36: xe 387)
    const [c41, c113] = XEX.chay; c41.mats = XEX.matsCua(c41.o); c113.mats = XEX.matsCua(c113.o); c41.tu = tD(MV.c10_tn + 2.6); c113.tu = tD(MV.c10_tn + 4.6);
    const k41 = () => { const o = c41.o, y = o.rotation.y; return V3(o.position.x + Math.sin(y) * 4.5, o.position.y + 2.0, o.position.z + Math.cos(y) * 4.5); };
    banTao(tD(MV.c10_tn + 0.8), k41, canh(XEX.x843.obj, -5, 7)); banTao(tD(MV.c10_tn + 2.2), nong(XEX.x843), than(c41.o)); banTao(tD(MV.c10_tn + 4.2), nong(XEX.x390), than(c113.o)); }
  const tren = (X, dy, lui) => (t) => { if (!X.obj.visible) return null; const p = X.obj.position, y = X.obj.rotation.y; return { x: p.x - Math.sin(y) * lui, z: p.z - Math.cos(y) * lui, y: p.y + dy, yaw: y, clip: 'dung' }; };   // trưởng xe đứng ở cửa tháp pháo
  const t843 = tren(XEX.x843, 1.35, 0.4);
  XEX.lai843 = await nvxTao('models/linh-tang.glb', (t) => (t < 115 ? t843(t) : null), { ten: 'Trưởng xe 843' });   // từ 1:55 Bùi Quang Thận rời xe (nhân vật riêng bên dưới)
  XEX.lai390 = await nvxTao('models/linh-tang.glb', tren(XEX.x390, 1.35, 0.4), { ten: 'Trưởng xe 390' });
  for (const X of [XEX.x843, XEX.x390]) LAYER.xe.push(X.obj);
}
if ((HCM && TANG === 'noi-do') && DUONG_DINH.length) {
  // NGƯỜI DÂN SÀI GÒN đón quân giải phóng trưa 30/4 (S32; nhandan.vn: lúc xe tăng vào đường rất vắng, sau đó người dân tràn ra đường): đứng thẳng hai bên
  // đường thành hàng, quay mặt ra lòng đường, vẫy cờ Mặt trận, vẫy hoa, vỗ tay. Áo dài nhiều màu, đàn ông sơ mi; tỉ lệ các kiểu: MINH HOẠ.
  const LOAI = [['nuco', 'dan-sg-nu-co', ['trang', 'xanh', 'vang', 'hong'], ['vay', 'vay2', 'vay']], ['nuhoa', 'dan-sg-nu-hoa', ['trang', 'hong', 'xanh'], ['vay', 'vay2']],
    ['nu', 'dan-sg-nu', ['trang', 'xanh', 'hong', 'tim'], ['vota', 'vay', 'vota']], ['namco', 'dan-sg-nam-co', ['trang', 'ke'], ['vay', 'vay2']], ['nam', 'dan-sg-nam', ['trang', 'kem', 'xanh'], ['vota', 'vota', 'vay']],
    ['nb', 'dan-nam-bo', ['1', '2', '3'], ['dung', 'dung', 'dung2']]];   // V1.9 (anh Thắng 23:00): thêm người mặc áo Nam bộ (mẫu Rạch Gầm, áo bà ba) thay bớt đồ tây, áo dài
  // V1.9: nhiều người vỗ tay, cầm hoa vẫy hơn; bớt cờ (tỉ lệ MINH HOẠ)
  const TL = [0.1, 0.22, 0.16, 0.07, 0.17, 0.28];
  for (const [ten, nvz, mau] of LOAI) mau.forEach((m, i) => (ten === 'nb' ? dongNap(ten + i, nvz + '-' + m, nvz + '-' + m, 500) : dongNap(ten + i, nvz, (ten === 'nuhoa' ? 'dan-sg-nu-co' : nvz) + '-' + m, 500)));
  const D = duong(DUONG_DINH), L0 = D.L, rnd = rndS(1975);
  const chon = () => { let r = rnd(), k = 0; while (k < TL.length - 1 && r > TL[k]) r -= TL[k++]; const L = LOAI[k]; return { ten: L[0] + Math.floor(rnd() * L[2].length), clip: L[3][Math.floor(rnd() * L[3].length)], sc: L[0] === 'nb' ? 1.06 : 1 }; };
  for (let d = 40; d < L0 - 200;) {                                                      // hai bên đường, hai hàng, mỗi 1,4–2 m một người; chừa khoảng trống ở ngã tư, hẻm
    if (rnd() < 0.08) { d += 18 + rnd() * 25; continue; }
    for (const s of [-1, 1]) for (const h of [0, 1]) { if (rnd() < 0.47) continue; /* V1.6 (22:04): dân giảm một nửa; V1.9 (23:00): đông lại một chút để thấy dân vỗ tay, vẫy hoa hai bên phố */ const c = chon();
      DAN.push({ ...c, d: d + (h ? 0.7 : 0) + rnd() * 0.3, lech: s * (10.6 + h * 1.25 + rnd() * 0.3), quay: s, ph: rnd(), vi: DAN.length, t0: 20 + rnd() * 5 + d / L0 * 6 }); }   // anh Thắng V1.2: dân ra đứng hai bên đường cổ vũ khi đoàn xe tăng đi qua
    d += 1.4 + rnd() * 0.6;
  }
  for (let d = 60; d < L0 - 200; d += 22 + rnd() * 30) for (const s of [-1, 1]) if (rnd() < 0.35) {   // V1.6: giảm một nửa · người đi bộ sát mặt tiền dãy nhà (vỉa hè trong)
    const nu = rnd() < 0.55, L = nu ? LOAI[2] : LOAI[4]; DAN.push({ ten: L[0] + Math.floor(rnd() * L[2].length), clip: 'di', di: true, d, lech: s * (15.2 + rnd() * 0.8), v: (rnd() < 0.5 ? 1 : -1) * (1.1 + rnd() * 0.4), ph: rnd(), vi: DAN.length, t0: 20 + rnd() * 10 }); }
  const G = (() => { const [x, y] = XEX.DL(0, 160); const p = diemTren(D, L0 - 95); return { x, z: -y, yaw: p.yaw }; })();   // ngoài cổng Dinh, đầu đại lộ Thống Nhất
  for (let i = 0; i < 130; i++) {   // V1.6: 260 → 130                                                        // trước cổng: dân kéo tới, đứng thành từng lớp hai bên, chừa lòng đường
    const r = 8 + rnd() * 50, lat = (rnd() < 0.5 ? -1 : 1) * (12 + rnd() * 30), sy = Math.sin(G.yaw), cy = Math.cos(G.yaw), c = chon();
    DAN.push({ ...c, cong: true, x: G.x - sy * r + cy * lat, z: G.z - cy * r - sy * lat, ph: rnd(), vi: i, t0: 150 + rnd() * 10, buoc: 4 + rnd() * 8 });
  }
  const ben = (d, lech) => { const p = diemTren(D, d); return { x: p.x + Math.cos(p.yaw) * lech, z: p.z - Math.sin(p.yaw) * lech, yaw: p.yaw }; };
  for (const N of DAN) if (!N.cong && !N.di) { const p = ben(N.d, N.lech); N.x = p.x; N.z = p.z; N.y = hG(p.x, p.z) + 0.1; N.yaw = p.yaw + N.quay * Math.PI / 2 + (rnd() - 0.5) * 0.25; } else if (N.di) { const p = ben(N.d, N.lech); N.x = p.x; N.z = p.z; }   // quay mặt ra đường
  DAM.push((t) => {
    const r = camera.position.y < 300 ? 420 : 900;
    for (const N of DAN) {
      if (t < N.t0 || !ganMay(N.x, N.z, r)) continue;
      if (N.cong) {                                                                       // đi về phía cổng rồi đứng lại
        const u = Math.min(1, (t - N.t0) / 9), dx = G.x - N.x, dz = G.z - N.z, l = Math.hypot(dx, dz) || 1, w = Math.min(N.buoc, l - 6) * u, px = N.x + dx / l * w, pz = N.z + dz / l * w;
        const di = u < 1 && DONG[N.ten] && DONG[N.ten].clips.di;   // V1.9: đang đi tới thì bước chân (khớp nhịp bước), không trượt
        dongDat(N.ten, di ? 'di' : u < 1 ? 'dung' : N.clip, di ? t * (N.buoc / 9) / 2.38 : t, N.ph, px, hG(px, pz) + 0.1, pz, Math.atan2(dx, dz), N.sc || 1, N.vi); continue;
      }
      if (N.di) { const d = N.d + ((N.v * (t - N.t0)) % 60 + 60) % 60 - 30, p = ben(d, N.lech); dongDat(N.ten, 'di', t * Math.abs(N.v) / 2.38, N.ph, p.x, hG(p.x, p.z) + 0.1, p.z, p.yaw + (N.v > 0 ? 0 : Math.PI), 1.0, N.vi); continue; }
      dongDat(N.ten, N.clip, t, N.ph, N.x, N.y, N.z, N.yaw, N.sc || 1, N.vi);
    }
  });
  // BỘ BINH QUÂN GIẢI PHÓNG Ở DINH (ảnh tư liệu trưa 30/4: bộ đội đứng khắp sân, trên thềm, ban công, sân thượng): sau khi xe 390 húc đổ cổng (90 s),
  // bộ binh đi theo xe tăng chạy vào sân rồi toả ra đứng gác; khoảng 118 s lên ban công, 126 s lên sân thượng, mái bằng (sau Bùi Quang Thận). MINH HOẠ.
  { const H = XEX.hDinh, CG = XEX.DL(0, 156), CT2 = XEX.DL(0, 136), L = [], r2 = rndS(304), A0 = XEX.DL(0, 0), A1 = XEX.DL(0, 10), YG = Math.atan2(A1[0] - A0[0], -(A1[1] - A0[1]));   // YG: mặt nhìn ra cổng
    const them = (n, sd0, sd1, dd0, dd1, y, t0, dt, clips) => { for (let i = 0; i < n; i++) { const sd = sd0 + r2() * (sd1 - sd0), dd = dd0 + r2() * (dd1 - dd0), [x, yb] = XEX.DL(sd, dd);
      L.push({ x, z: -yb, y: H + y, t0: t0 + r2() * dt, clip: clips[Math.floor(r2() * clips.length)], ph: r2(), vi: L.length, yaw: YG + (r2() - 0.5) * (y < 1 ? 1.6 : 0.5), chay: y < 3 }); } };
    // V1.6 (anh Thắng 22:04: "bỏ bớt lính ở Dinh, khoảng 30 lính"): 204 → 30
    them(8, -95, -30, 25, 138, 0.05, 92, 14, ['dung', 'quansat', 'quy', 'quansat']); them(8, 30, 95, 25, 138, 0.05, 92, 14, ['dung', 'quansat', 'quy', 'quansat']);   // hai bãi cỏ
    them(6, -40, 40, 4, 10.5, 2.75, 100, 12, ['dung', 'dung', 'ban']);                                                  // thềm trước sảnh
    them(2, -6.5, 6.5, 1, 3.5, 11.95, 118, 6, ['dung']);              // ban công giữa
    them(4, -44, 44, -3.5, 0.8, 18.55, 126, 12, ['dung', 'quansat', 'ban']); them(2, -18, 18, -22, -6, 27.55, 129, 8, ['quansat', 'quy']);   // sân thượng, mái bằng
    DAM.push((t) => { if (t < 90) return; const r = camera.position.y < 300 ? 500 : 900;
      for (const N of L) { if (t < N.t0 || !ganMay(N.x, N.z, r)) continue; let x = N.x, z = N.z, clip = N.clip, yaw = N.yaw;
        if (N.chay) { const u = (t - N.t0) * 4.0, l1 = Math.hypot(CT2[0] - CG[0], CT2[1] - CG[1]);   // chạy qua cổng chính (CG → CT2 trong sân) rồi tới chỗ đứng, 4 m/s = nhịp bước động tác 'chay'
          const dx = N.x - CT2[0], dz = N.z + CT2[1], l2 = Math.hypot(dx, dz);
          if (u < l1) { const k = u / l1; x = CG[0] + (CT2[0] - CG[0]) * k; z = -(CG[1] + (CT2[1] - CG[1]) * k); clip = 'chay'; yaw = Math.atan2(CT2[0] - CG[0], -(CT2[1] - CG[1])); }
          else if (u < l1 + l2) { const k = (u - l1) / l2; x = CT2[0] + dx * k; z = -CT2[1] + dz * k; clip = 'chay'; yaw = Math.atan2(dx, dz); } }
        dongDat('qgp', clip, t, N.ph, x, N.y, z, yaw, 1.0, N.vi); } });
    XEX.linhDinh = L; }
}
// ------------------------------------------------------------------ C04 · PHI ĐỘI QUYẾT THẮNG (28/4/1975)
// 16h15 năm A-37 thu được xuất kích từ Phan Rang (S29), ném bom khu đỗ máy bay Tân Sơn Nhất; 18h15 hạ cánh Thành Sơn (S17).
// Vị trí khu đỗ, nhà chứa máy bay của không quân VNCH ("Vietnamese Hangars") theo sơ đồ sân bay 1968 (M3) khớp affine vào bản đồ:
// 2 đầu đường băng (OSM) + "Vietnam Staff Compound" = Bộ Tổng tham mưu (nay Bộ Tư lệnh Quân khu 7, OSM). Sai số vài trăm m — sơ đồ vẽ phỏng.
// Số máy bay đỗ, thứ tự bom rơi là TÁI DỰNG MINH HOẠ (các nguồn ghi số máy bay bị phá khác nhau).
const C04 = {};
if ((HCM && TANG === 'noi-do')) {
  const SD = (px, py) => [12.6712604 * px + 6.28036399 * py - 9247.06099, -1.468 * px - 11.5504249 * py + 7007.62698];   // px sơ đồ 1968 → Blender [x, y_Bắc]
  const P3 = (b, y = 0) => V3(b[0], (y === null ? hG(b[0], -b[1]) : y), -b[1]);
  // Sơ đồ 1968: dãy "Vietnamese Hangars" nằm phía Nam, song song đường băng, ở nửa phía Tây. Khớp affine đặt dãy này lệch Nam ~400 m (sơ đồ vẽ
  // phỏng) → đặt khu đỗ song song đường băng 07R/25L (OSM, hướng 20,9°), phía Bắc "Nhà ga Quân sự Tân Sơn Nhất" ngày nay (OSM, −5003; 3703).
  const RW = [Math.cos(0.3648), Math.sin(0.3648)], NB = [-RW[1], RW[0]], apC = [-5050, 3880];
  const ap0 = [apC[0] - RW[0] * 350, apC[1] - RW[1] * 350], ap1 = [apC[0] + RW[0] * 350, apC[1] + RW[1] * 350];
  const apY = (u, k) => [ap0[0] + (ap1[0] - ap0[0]) * u + NB[0] * k, ap0[1] + (ap1[1] - ap0[1]) * u + NB[1] * k];   // dọc khu đỗ; k: lùi về phía đường băng (m)
  const yaw0 = Math.atan2(ap1[0] - ap0[0], -(ap1[1] - ap0[1]));
  // mặt đường băng, khu đỗ (để nhận ra sân bay): hai đường băng song song theo OSM; đầu Đông 07R/25L cắt ngang đầu Đông 07L (sơ đồ 1968 vẽ hai
  // đường băng dài gần bằng nhau; đoạn kéo dài sau này chưa rõ năm) — GIẢN LƯỢC
  { const mat = new THREE.MeshLambertMaterial({ color: 0x8b8a84, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const dai = (A, B, rong) => {                                                       // dải phẳng bám mặt đất (lưới 20 m)
      const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), n = Math.max(2, Math.ceil(L / 20)), m = Math.max(1, Math.ceil(rong / 20)), ux = dx / L, uy = dy / L;
      const g = new THREE.PlaneGeometry(1, 1, m, n), P = g.attributes.position;
      for (let i = 0; i < P.count; i++) { const a = P.getX(i) * rong, b = (P.getY(i) + 0.5) * L, x = A[0] + ux * b - uy * a, y = A[1] + uy * b + ux * a; P.setXYZ(i, x, hG(x, -y) + 0.35, -y); }
      g.index.array.reverse(); g.computeVertexNormals(); const o = new THREE.Mesh(g, mat); o.frustumCulled = false; scene.add(o); LAYER.xe.push(o); };
    dai([-6361, 4204], [-3514, 5291], 46); dai([-6394, 3800], [-3499, 4905], 46);
    dai(apY(-0.05, 35), apY(1.05, 35), 150);                                                // khu đỗ (giữa hai hàng máy bay và đường lăn)
  }
  C04.do = []; C04.no = [];
  const [ga, gc, gu] = await Promise.all(['data/may-bay/a-37.glb', 'data/may-bay/c-130a.glb', 'data/may-bay/uh-1.glb'].map((f) => glbLoad(f)));
  const dat = (g, b, yaw, sc = 1) => { const o = g.scene.clone(true); const h = hG(b[0], -b[1]) + 0.4; o.position.set(b[0], h, -b[1]); o.rotation.y = yaw; o.scale.setScalar(sc); scene.add(o); LAYER.xe.push(o);
    o.traverse((m) => { if (m.isMesh) m.material = m.material.clone(); }); return o; };
  for (let i = 0; i < 14; i++) C04.do.push({ o: dat(ga, apY(0.08 + i * 0.065, (i % 2) * 22), yaw0 + Math.PI / 2 + 0.05 * (i % 3)), loai: 'A-37' });   // A-37 VNCH đỗ hai hàng
  C04.do.push({ o: dat(gc, apY(0.2, 75), yaw0 + Math.PI / 2), loai: 'C-130A' }, { o: dat(gc, apY(0.62, 75), yaw0 + Math.PI / 2), loai: 'C-130A' });
  for (const [px, py] of [[188, 316], [194, 322], [184, 322]]) C04.do.push({ o: dat(gu, SD(px, py), 0.6), loai: 'UH-1' });
  // trúng bom: A-37 hàng trước, theo thứ tự lượt bay
  const trung = [1, 3, 4, 6, 8, 9, 11, 14];
  // phi đội: 5 chiếc, bay vào từ hướng Đông Bắc (phía Phan Rang), bổ nhào qua dãy đỗ rồi vòng ra Tây Nam
  const tam = apY(0.5, 11), vao = [tam[0] + 1300, tam[1] + 1150], ra = [tam[0] + 700, tam[1] - 2300];   // V1.5: vào từ Đông Bắc, ra về phía Nam — cả đường bay nằm trong sa bàn (bán kính 6,8 km)
  C04.bay = [];
  for (let k = 0; k < 5; k++) { const o = ga.scene.clone(true); o.visible = false; scene.add(o); LAYER.xe.push(o); C04.bay.push({ o, k }); }
  const sprTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  const sprite = (col, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprTex, color: col, transparent: true, opacity: op, depthWrite: false })); sp.visible = false; scene.add(sp); return sp; };
  trung.forEach((i, n) => { const D = C04.do[i]; C04.no.push({ D, t0: 0, lua: sprite(0xffa040, 0.9), chay: [sprite(0xff7a20, 0.9), sprite(0xffb040, 0.8), sprite(0xff5a10, 0.85)],
    khoi: Array.from({ length: 9 }, (_, j) => Object.assign(sprite(0x2e2b29, 0.4), { k: j / 9 })) }); });   // anh Thắng 24/11: bom trúng thì có lửa cháy, khói bốc cao
  const T0 = STORY.scenes.find((c) => c.id === 'C04'), t0 = T0 ? T0.t0 : 40, BAY0 = MV.c04_bom ? MV.c04_bom - 6.2 : t0 + 9, BAY1 = BAY0 + 14;   // bom rơi đúng câu "những quả bom được thả xuống"
  C04.no.forEach((N, n) => { N.t0 = BAY0 + 6.2 + n * 0.55; });
  const CAT = MV.c04_catcanh || BAY0 - 11, vao2 = [vao[0] + 850, vao[1] + 750];                // vào từ hướng Đông Bắc (phía Phan Rang), ~220 m/s
  C04.camBay = () => { const V = C04.bay.filter((B) => B.o.visible); if (!V.length) return null; const c = V3(); V.forEach((B) => c.add(B.o.position)); c.divideScalar(V.length);
    const y = V[0].o.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y)), r = V3(f.z, 0, -f.x);
    const L = V[0].o.position, k = clamp((T - (MV.c04_catcanh || 0)) / 9, 0, 1);              // anh Thắng V1.2: đầu đoạn cận một chiếc (thấy rõ kiểu A-37), sau lùi ra thấy cả biên đội
    const near = [L.clone().addScaledVector(f, -16).addScaledVector(r, 9).add(V3(0, 3.5, 0)), L.clone().addScaledVector(f, 6)], far = [c.clone().addScaledVector(f, -95).addScaledVector(r, 55).add(V3(0, 16, 0)), c.clone().addScaledVector(f, 220).add(V3(0, -30, 0))];
    const e = k < 0.6 ? 0 : sstep(0.6, 1, k); return [near[0].lerp(far[0], e), near[1].lerp(far[1], e), 50]; };
  // ghim tên khí tài (anh Thắng 24/11: để người xem học các loại vũ khí của hai bên)
  GHIM_SAU.push(() => { const gx = (ten, get, dy, xa = 900) => { const L = addLabel(ten, 0, 0, 'hero ly', { grp: 'hero', maxDist: xa }); L.dyn = get; L.dy = dy; };
    gx('Cường kích A-37 · Phi đội Quyết Thắng (ta, máy bay thu được)', () => (C04.bay[0].o.visible ? C04.bay[0].o.position : null), 6, 2500);
    const loai = { 'A-37': 'Cường kích A-37 (không quân VNCH)', 'C-130A': 'Vận tải C-130A (không quân VNCH)', 'UH-1': 'Trực thăng UH-1 (không quân VNCH)' }, da = {};
    for (const D of C04.do) { const k = D.loai + (D.loai === 'A-37' ? Math.floor(C04.do.indexOf(D) / 5) : ''); if (da[k]) continue; da[k] = 1;   // mỗi loại một ghim (A-37 ba ghim theo dãy)
      gx(loai[D.loai] || D.loai, () => (D.o.visible ? D.o.position : null), D.loai === 'C-130A' ? 13 : D.loai === 'UH-1' ? 6 : 5, 3500); } });
  C04.tam = tam; C04.h = hG(tam[0], -tam[1]); C04.t0 = t0; C04.t1 = T0 ? T0.t1 : 75; C04.apY = apY; C04.sprite = sprite;
  C04.cap = (t, dt) => {
    const on = t >= C04.t0 - 0.5 && t < C04.t1 + 0.5;
    for (const B of C04.bay) {
      const u = (t - BAY0 - B.k * 0.45) / (BAY1 - BAY0), tr = (t - CAT) / (BAY0 + B.k * 0.45 - CAT);
      if (on && u <= 0 && tr > 0 && tr <= 1) {                                          // từ câu "cất cánh": cả biên đội bay về Sài Gòn (anh Thắng 24/11), máy quay bám theo
        const lech = [(B.k - 2) * 45, -(B.k) * 25], x = vao2[0] + (vao[0] - vao2[0]) * tr + lech[0], yb = vao2[1] + (vao[1] - vao2[1]) * tr + lech[1];
        B.o.visible = true; B.o.position.set(x, C04.h + 820 - 170 * tr + Math.sin(t * 1.3 + B.k) * 3, -yb); B.o.rotation.set(0.04, Math.atan2(vao[0] - vao2[0], -(vao[1] - vao2[1])), Math.sin(t * 0.9 + B.k) * 0.04, 'YXZ'); continue; }
      const vis = on && u > 0 && u < 1; B.o.visible = vis; if (!vis) continue;
      const lech = [(B.k - 2) * 45, -(B.k) * 25], uu = u < 0.5 ? u * 2 : (u - 0.5) * 2;
      const A = u < 0.5 ? vao : tam, Bp = u < 0.5 ? tam : ra, y = u < 0.5 ? 650 - 470 * uu : 180 + 520 * uu * uu;
      const x = A[0] + (Bp[0] - A[0]) * uu + lech[0], yb = A[1] + (Bp[1] - A[1]) * uu + lech[1];
      B.o.position.set(x, y + C04.h, -yb); B.o.rotation.set(u < 0.5 ? 0.25 : -0.3, Math.atan2(Bp[0] - A[0], -(Bp[1] - A[1])), 0, 'YXZ');   // mũi máy bay +z three
    }
    for (const N of C04.no) {
      const a = t - N.t0, p = N.D.o.position, chay = a > 0 && t >= C04.t0 - 0.5;
      N.D.o.traverse((m) => { if (m.isMesh) m.material.color.setScalar(chay ? 0.25 : 1); });
      N.lua.visible = chay && a < 1.6; if (N.lua.visible) { N.lua.position.set(p.x, p.y + 3 + a * 6, p.z); N.lua.scale.setScalar(6 + a * 22); N.lua.material.opacity = 0.95 * (1 - a / 1.6); }
      const khoi = chay && t < C04.t1 + 0.5;                                              // 28/4: khói lửa; các cảnh sau (30/4) chỉ còn xác cháy đen
      N.chay.forEach((F, j) => { F.visible = khoi && a > 0.6; if (!F.visible) return; const f = Math.sin(U.time.value * (11 + j * 3) + j * 2) * 0.5 + 0.5;
        F.position.set(p.x + (j - 1) * 2.2, p.y + 1.6 + f * 1.5 + j * 0.6, p.z + (j % 2) * 1.5); F.scale.setScalar(4.5 + f * 3 + j); F.material.opacity = 0.75 + f * 0.2; });
      for (const K of N.khoi) { K.visible = khoi; if (!khoi) continue; const v = (K.k + U.time.value * 0.05) % 1; K.position.set(p.x + v * 16, p.y + 3 + v * 110, p.z - v * 9); K.scale.setScalar(6 + v * 40); K.material.opacity = 0.5 * (1 - v) * Math.min(1, a / 2); }
    }
  };
}
// ------------------------------------------------------------------ C07 · TÂN SƠN NHẤT 30/4 (S27, S1): 5h30 Sư đoàn 10 cùng hai đại đội xe tăng Trung đoàn 273
// tiến công sân bay; 9h45 Trung đoàn 24 tiếp tục tiến công; 11h30 làm chủ sân bay. Đội hình xe (xe bọc thép K-63, xe tải cắm cờ Mặt trận) và
// đường đi trên sân bay, các điểm nổ: MINH HOẠ (chưa có mẫu xe tăng không số hiệu → không đặt xe tăng ở cảnh này).
const C07 = {}, C89 = {};
if ((HCM && TANG === 'noi-do') && C04.apY && MV.c07_tc) {
  const A = C04.apY, P = [A(-0.05, 125), A(0.08, 105), A(0.2, 82), A(0.3, 55)], fD = tDinh;   // V1.5: đường đi nằm trong sa bàn (khu đỗ ở sát mép), xe chạy ~8 m/s   // đường ngắn lại để xe chạy chậm như thật (anh Thắng 24/11)
  const [gk, gt] = await Promise.all([glbLoad('data/xe/xe-boc-thep-k63.glb'), glbLoad('data/xe/xe-tai.glb')]).catch(() => [null, null]);
  C07.xe = [];
  if (gk && gt) for (let k = 0; k < 4; k++) {
    const D = duong(P), L = D.L, f0 = fD(MV.c07_tc + k * 1.5), f1 = fD(MV.c07_chu - 6 + k * 1.5);
    const X = await xeTao(k % 2 ? 'data/xe/xe-tai.glb' : 'data/xe/xe-boc-thep-k63.glb', { duong: P, lich: [[-1e4, 0], [f0, 0], [f1, L - 30 - k * 28], [1e4, L - 30 - k * 28]], hien: (t) => t >= f0 - 2, ten: k % 2 ? 'Xe tải (minh hoạ)' : 'Xe bọc thép K-63 (minh hoạ)' });
    if (XEX.coXe) XEX.coXe(X.obj, 2.2, 1.1); LAYER.xe.push(X.obj); X.loai = k % 2 ? 'tai' : 'k63'; C07.xe.push(X); }
  DAM.push((t) => { for (const X of C07.xe) if (X.obj.visible && ganMay(X.obj.position.x, X.obj.position.z, 700)) linhTrenXe(X.obj, X.loai, t, 1, 3); });   // bộ binh trên xe (Sư đoàn 10)
  // XE TĂNG TRUNG ĐOÀN 273 dẫn đầu (S27: Sư đoàn 10 cùng hai đại đội xe tăng Trung đoàn 273 tiến công sân bay; mẫu T-54 = xe 390 ẩn số hiệu), bắn cháy máy bay trên
  // khu đỗ, bộ binh chạy theo xe vừa chạy vừa bắn (anh Thắng 24/11, mốc 8:11). Số xe, máy bay trúng đạn, thứ tự phát bắn: MINH HOẠ.
  C07.tang = []; GHIM_SAU.push(() => { const L = addLabel('Xe tăng T-54 · Trung đoàn 273', 0, 0, 'hero ly', { grp: 'hero', maxDist: 600 }); L.dyn = () => (C07.tang[0] && C07.tang[0].obj.visible ? C07.tang[0].obj.position : null); L.dy = 4.2; });
  { const PT = [...P, A(0.62, 35)], DT = duong(PT), LT = DT.L;
    for (let j = 0; j < 2; j++) { const f0 = fD(MV.c07_tc - 3 + j * 1.2), f1 = fD(MV.c07_chu - 7 + j * 1.2);
      const X = await xeTao('data/xe/xe-tang-390.glb', { duong: PT, lich: [[-1e4, 0], [f0, 0], [f1, LT - 6 - j * 24], [1e4, LT - 6 - j * 24]], hien: (t) => t >= f0 - 2, lech: j ? 4 : -2, ten: 'Xe tăng T-54' });
      X.obj.traverse((m) => { if (/^so-hieu/.test(m.name)) m.visible = false; }); if (XEX.coXe) XEX.coXe(X.obj, 2.2, 1.1); LAYER.xe.push(X.obj); C07.tang.push(X); }
    const nong = (X) => () => { const o = X.obj; if (!o.visible) return null; const y = o.rotation.y; return V3(o.position.x + Math.sin(y) * 5, o.position.y + 2.2, o.position.z + Math.cos(y) * 5); };
    C07.chay = [];
    [[0, 5, 0], [2, 9, 1], [15, 13, 0], [5, 17.5, 1], [7, 22, 0], [10, 26, 1]].forEach(([i, dt, j]) => { const D = C04.do[i]; if (!D) return;
      const tu = MV.c07_tc + dt; banTao(tu, nong(C07.tang[j]), () => V3(D.o.position.x, D.o.position.y + 1.5, D.o.position.z), { voice: true });
      C07.chay.push({ D, tu: tu + 0.4, lua: [C04.sprite(0xff7a20, 0.9), C04.sprite(0xffb040, 0.8)], khoi: Array.from({ length: 6 }, (_, k) => Object.assign(C04.sprite(0x2e2b29, 0.4), { k: k / 6 })) }); });
    // bộ binh Sư đoàn 10 bám sau xe tăng: chạy theo, khi xe dừng thì quỳ / đứng bắn
    // bộ binh chạy theo sau xe (4 m/s = nhịp bước 'chay'; xe tăng nhanh hơn nên bộ binh tụt dần phía sau, tới nơi thì quỳ, đứng bắn)
    DAM.push((t, tv) => { for (const [j, X] of C07.tang.entries()) { const t0 = MV.c07_tc - 1 + j * 1.2, dd = DT.L - 30 - j * 24;
      for (let i = 0; i < 9; i++) { const d = Math.min(dd - 6 - Math.floor(i / 2) * 4.5, Math.max(0, (tv - t0 - i * 0.25) * 4.0)), p = diemTren(DT, d), toi = d >= dd - 6 - Math.floor(i / 2) * 4.5 - 0.01;
        if (tv < t0 || !ganMay(p.x, p.z, 500)) continue; const l = (i % 2 ? 1 : -1) * (3.5 + (i % 3) * 2.2) + (j ? 4 : -2), x = p.x + Math.cos(p.yaw) * l, z = p.z - Math.sin(p.yaw) * l;
        dongDat('qgp', toi ? (i % 3 ? 'ban' : 'quy') : (i % 4 === 3 ? 'xung' : 'chay'), tv, (i * 0.31 + j * 0.5) % 1, x, hG(x, z), z, p.yaw, 1, i + j * 9); } } }); }
  C07.no = Array.from({ length: 6 }, (_, k) => ({ sp: C04.sprite(0xff9a4a, 0.9), p: A(-0.6 + k * 0.28, 20 + (k % 3) * 35), ph: k * 0.43 }));
  C07.cap = (t) => { const on = t > MV.c07_tc && t < MV.c07_chu;
    for (const N of C07.no) { const u = ((t - MV.c07_tc + N.ph * 2.4) / 2.4) % 1, v = on && u < 0.45; N.sp.visible = v;
      if (v) { const h = hG(N.p[0], -N.p[1]); N.sp.position.set(N.p[0], h + 6 + u * 30, -N.p[1]); N.sp.scale.setScalar(14 + u * 70); N.sp.material.opacity = 0.9 * (1 - u / 0.45); } }
    for (const C of C07.chay) { const a = t - C.tu, chay = a > 0, p = C.D.o.position; if (C.da !== chay) { C.da = chay; C.D.o.traverse((m) => { if (m.isMesh) m.material.color.setScalar(chay ? 0.25 : 1); }); }   // máy bay trúng đạn cháy đen
      const lua = chay && t < MV.c07_chu + 30; C.lua.forEach((F, j) => { F.visible = lua; if (!lua) return; const f = Math.sin(U.time.value * (12 + j * 4) + j) * 0.5 + 0.5; F.position.set(p.x + (j - 0.5) * 3, p.y + 2 + f * 2, p.z); F.scale.setScalar(6 + f * 4 + j * 2); });
      for (const K of C.khoi) { K.visible = lua; if (!lua) continue; const v = (K.k + U.time.value * 0.05) % 1; K.position.set(p.x + v * 14, p.y + 3 + v * 90, p.z - v * 8); K.scale.setScalar(6 + v * 34); K.material.opacity = 0.5 * (1 - v) * Math.min(1, a / 2); } } };
}
//@@ s23
const ARROW_N = 1;
function updateSmoke() {}
//@@ s24
//@@ s25
const FIRE_N = 1;
//@@ s26
//@@ s27
//@@ s28
//@@ s29
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// ------------------------------------------------------------------ 5 hướng tiến công (PHÁC THẢO theo bản đồ Quyết tâm, S3 — chốt ở GĐ5)
const HUONG = HCM && TANG === 'chien-dich' ? [
  ['Hướng Bắc · Quân đoàn 1', [[11.16, 106.60], [10.98, 106.67], [10.86, 106.68], [10.80, 106.665]]],
  ['Hướng Tây Bắc · Quân đoàn 3', [[11.00, 106.47], [10.92, 106.55], [10.86, 106.62], [10.82, 106.655]]],
  ['Hướng Đông · Quân đoàn 4', [[10.96, 107.02], [10.94, 106.86], [10.85, 106.76], [10.78, 106.71]]],
  ['Hướng Đông Nam · Quân đoàn 2', [[10.76, 107.00], [10.78, 106.86], [10.80, 106.75], [10.78, 106.70]]],
  ['Hướng Tây – Tây Nam · Đoàn 232', [[10.66, 106.43], [10.72, 106.55], [10.77, 106.63], [10.775, 106.685]]],
] : [];
const MUITEN = HUONG.map(([ten, pts], k) => ({ ten, m: muiTen(pts.map(([la, lo]) => LL(la, lo, 900)), 0xd2442b, 420), k }));   // có đầu nhọn chỉ hướng đến
for (const M of MUITEN) muiTenDat(M.m, false);
//@@ s30
const FOGK = 3180 / R;          // sương theo cỡ sa bàn (bảng màu trời gốc làm cho vòng 3,18 km)
const SKY = {
  'Sáng trong': { top: '#3f78b0', hor: '#c7d8e0', low: '#8d9a8a', ground: '#77765a', fog: 0.00003, el: 32, az: 135, sun: '#fff1d8', si: 2.6, hs: '#bcd3e6', hg: '#5f5a44', hi: 0.9, cover: 0.3, cc: '#ffffff', cs: '#a3b0bd', exp: 0.92, size: 900, glow: 1 },
  'Ngày nhiều mây': { top: '#56789a', hor: '#c3c9c6', low: '#7d8072', ground: '#6f6d55', fog: 0.00004, el: 38, az: 170, sun: '#fff4e4', si: 2.0, hs: '#b9c6cf', hg: '#575343', hi: 1.0, cover: 0.58, cc: '#f2f1ec', cs: '#7f8892', exp: 0.95, size: 800, glow: 0.8 },
  'Trưa nắng': { top: '#3a70a8', hor: '#d2dbe0', low: '#8d9a8a', ground: '#7a7858', fog: 0.000028, el: 70, az: 160, sun: '#fff6e8', si: 2.8, hs: '#c4d6e6', hg: '#5f5a44', hi: 1.0, cover: 0.25, cc: '#ffffff', cs: '#a8b4c0', exp: 0.9, size: 900, glow: 0.9 },
};
const SKYKEYS = [[0, 'Ngày nhiều mây'], [MV.c04_catcanh || 40, 'Sáng trong'], [(MV.c11_toi || 80) - 4, 'Trưa nắng']];   // 28/4 chiều · sáng 29–30/4 · trưa 30/4
//@@ s31
function applySky(t, forced) {
  let A, B, u;
  if (forced) { A = B = SKY[forced]; u = 0; }
  else {
    let i = 0; while (i < SKYKEYS.length - 1 && t >= SKYKEYS[i + 1][0]) i++;
    A = SKY[SKYKEYS[i][1]];
    const dd = SKYKEYS[i][2] !== undefined ? SKYKEYS[i][2] : 7; if (i > 0 && t - SKYKEYS[i][0] < dd) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, dd, t - SKYKEYS[i][0]); }
    else { B = A; u = 0; }
  }
  mixHex(A.top, B.top, u, U.top.value); mixHex(A.hor, B.hor, u, U.hor.value); mixHex(A.low, B.low, u, U.low.value);
  mixHex(A.ground, B.ground, u, U.ground.value); mixHex(A.cc, B.cc, u, U.cloudCol.value); mixHex(A.cs, B.cs, u, U.cloudShade.value);
  mixHex(A.sun, B.sun, u, sun.color); U.sunCol.value.copy(sun.color).multiplyScalar(lerp(A.si, B.si, u) * 0.5);
  sun.intensity = lerp(A.si, B.si, u);
  mixHex(A.hs, B.hs, u, hemi.color); mixHex(A.hg, B.hg, u, hemi.groundColor); hemi.intensity = lerp(A.hi, B.hi, u) * 1.35; amb.color.copy(hemi.color);
  U.cover.value = lerp(A.cover, B.cover, u); U.sunSize.value = lerp(A.size, B.size, u); U.glow.value = lerp(A.glow, B.glow, u);
  const el = THREE.MathUtils.degToRad(lerp(A.el, B.el, u)), az = THREE.MathUtils.degToRad(lerp(A.az, B.az, u));
  U.sunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  sun.position.copy(U.sunDir.value).multiplyScalar(5000); sun.target.position.set(0, 0, 0);
  scene.fog.color.copy(U.hor.value); scene.fog.density = lerp(A.fog, B.fog, u) * FOGK;
  renderer.toneMappingExposure = lerp(A.exp, B.exp, u);
  U.light.value = 0.45 + 0.55 * Math.min(1, sun.intensity / 2.2) * 0.8 + hemi.intensity * 0.12;
  U.deep.value.copy(U.hor.value).multiplyScalar(0.25).lerp(new THREE.Color(0x2e3a3c), 0.6);
  U.shallow.value.copy(U.hor.value).multiplyScalar(0.45).lerp(new THREE.Color(0x5a6a5a), 0.55);
}
//@@ s32
let tideNow = 0.3;
//@@ s33
//@@ s34
// ------------------------------------------------------------------ góc máy theo cảnh (bản thử)
const SG = LL(MOC.hoankiem[0], MOC.hoankiem[1], 0);
const xeCam = (X, back, up, ahead, fov = 40) => (u) => {
  if (!X || !X.obj.visible) { const c = LL(MOC.dinh[0], MOC.dinh[1], 0); return [c.clone().add(V3(260, 160, 260)), c, 40]; }
  const p = X.obj.position, y = X.obj.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y));
  return [p.clone().addScaledVector(f, -back).add(V3(0, up, 0)), p.clone().addScaledVector(f, ahead).add(V3(0, 2, 0)), fov];
};
// GĐ3: máy quay TẠM cho mọi cú máy của tầng đang mở — xoay quanh mốc chính của hồi, xa gần theo cỡ cảnh trong kịch bản camera
// (đại toàn / toàn / trung / cận). Chỉnh tay từng cú máy, máy bám xe, máy qua vai ở GĐ4 (KHUNG_SA_BAN §10 B: máy luôn trong vòng R, trên mặt đất).
const MOC_HOI = { C01: 'hoankiem', C02: 'hanoi', C03: 'hoankiem', C04: 'phulo', C05: 'hoankiem', C06: 'td79', C07: 'khamthien', C08: 'hanoi', C09: 'yenbai', C10: 'hoankiem', C11: 'huutiep', C12: 'cotco' };
const CO = { 'Đại toàn': [0.85, 0.55], 'Toàn': [0.32, 0.2], 'Trung': [0.11, 0.06], 'Cận': [0.04, 0.018] };
const SHOTS = {};
for (const sc of STORY.scenes) { if ((sc.tang || 'ha-noi') !== TANG) continue;
  const k = MOC_HOI[sc.id], m = k && MOC[k] ? LL(MOC[k][0], MOC[k][1], 0) : V3(0, 0, 0);
  if (Math.hypot(m.x, m.z) > R * 0.9) m.set(0, 0, 0);
  m.y = hG(m.x, m.z);
  sc.shots.forEach((sh, i) => { const [rr, hh] = CO[sh.size] || CO['Toàn'], a0 = 2.4 + i * 0.9;
    const r = Math.min(R * rr, R * 0.9), h = R * hh + (sh.size === 'Cận' ? 30 : 0);
    SHOTS[sh.id] = orbit(m, r, h, a0, a0 + 0.45, 45); });
}
//@@ s35
function sceneAt(t) { for (const s of STORY.scenes) if (t >= s.t0 && t < s.t1) return s; return STORY.scenes[STORY.scenes.length - 1]; }
//@@ s36
const SECTION_SHOTS_X = new Set();
const CARDS = [];
const LABEL_SHOTS = {};
//@@ s37
//@@ s38
// mốc: thị xã, thị trấn (tên năm 1975, terrain/meta.json) + mốc nội đô
const ANCH = [
  ...Object.entries(MOC).filter(([k, [la, lo]]) => Math.hypot(LLx(la, lo), LLz(la, lo)) < R * 0.96 && (TANG === 'mien-bac' ? MOC_MB.has(k) : !MOC_MB.has(k)))
    .map(([k, [la, lo, ten]]) => [k, ten, LLx(la, lo), LLz(la, lo), 'Mốc (toạ độ OSM hoặc theo nguồn trong sources.json; "ước lượng" là chưa chốt)', MOC_LON.has(k)]),
  ...(false ? META.places.filter((p) => p[0] === 'city').map(([typ, ten, x, y], k) => ['p' + k, ten, x, -y, 'Thị xã (tên hiện nay)', false]) : []),
];
//@@ s39
{ const st = document.createElement('style'); st.textContent = '.lbl.hero.dich b{border-color:#fff;background:rgba(60,59,110,.92);color:#fff}.lbl.hero.dich i{background:linear-gradient(#fff,transparent)}'; document.head.append(st); }
function addLabel(text, x, z, cls, opts = {}) {
  const el = document.createElement('div'); el.className = 'lbl ' + (cls || '') + (/hero/.test(cls || '') && /đối phương|VNCH|\(địch\)/i.test(text) ? ' dich' : '');   // V1.9: ghim khí tài đối phương nền xanh cờ Mỹ, chữ trắng
  const b = document.createElement('b'); b.textContent = text; const i = document.createElement('i'); el.append(b, i); $('labels').appendChild(el);
  const L = { el, b, x, z, cls, grp: opts.grp || 'anc', maxDist: opts.maxDist || Infinity, yFn: opts.yFn || null, show: opts.show || null };
  if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); if (!dragging) opts.onClick(); });
  if (opts.drag) b.addEventListener('pointerdown', (e) => { if (uiMode === 'drag' && canWrite !== false) { e.preventDefault(); e.stopPropagation(); startDrag(opts.drag, e); } });
  labels.push(L); return L;
}
for (const [name, text, x, z, desc, big] of ANCH) {
  const A = { name, text, x0: x, z0: z, x, z, desc, big };
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', onClick: () => { showCard(name); flyTo(A.x, A.z, TANG === 'ha-noi' ? 1500 : 30000); }, drag: { kind: 'anchor', name } });
  anchors.set(name, A);
}
// TƯỚNG CHỈ HUY từng cánh quân (anh Thắng 24/11): nhandan.vn (QĐ1: Nguyễn Hòa – Hoàng Minh Thi; QĐ4: Hoàng Cầm – Hoàng Thế Thiện), sggp.org.vn (QĐ2: Nguyễn Hữu An –
// Lê Linh), baophapluat.vn (QĐ3: Vũ Lăng – Đặng Vũ Hiệp, khi thành lập 27/3/1975), vtcnews.vn (cánh Tây – Tây Nam do Trung tướng Lê Đức Anh, Phó Tư lệnh chiến dịch, chỉ huy)
const TUONG = ['Tư lệnh: Thiếu tướng Nguyễn Hòa · Chính ủy: Thiếu tướng Hoàng Minh Thi', 'Tư lệnh: Thiếu tướng Vũ Lăng · Chính ủy: Đại tá Đặng Vũ Hiệp',
  'Tư lệnh: Thiếu tướng Hoàng Cầm · Chính ủy: Thiếu tướng Hoàng Thế Thiện', 'Tư lệnh: Thiếu tướng Nguyễn Hữu An · Chính ủy: Thiếu tướng Lê Linh', 'Chỉ huy cánh quân: Trung tướng Lê Đức Anh (Phó Tư lệnh chiến dịch)'];
for (const M of MUITEN) { const p = HUONG[M.k][1][0]; const L = addLabel(M.ten, LLx(p[0], p[1]), LLz(p[0], p[1]), 'hero tong', { grp: 'muiten', yFn: () => 2500, show: () => M.m.visible });
  if (TUONG[M.k]) addLabel(TUONG[M.k], LLx(p[0], p[1]), LLz(p[0], p[1]), 'vil tuong', { grp: 'muiten', yFn: () => 1350, show: () => M.m.visible }); }
if (MUITEN.length) addLabel('Bộ Tư lệnh chiến dịch: Đại tướng Văn Tiến Dũng (Tư lệnh) · Phạm Hùng (Chính ủy)', SG.x, SG.z, 'hero', { grp: 'muiten', yFn: () => 4200, show: () => MUITEN.some((M) => M.m.visible) });   // nhandan.vn, vietnamnet.vn
// ------------------------------------------------------------------ C05 · PHÁ TUYẾN NGOÀI (29/4/1975) — tầng chiến dịch
// 5h30 29/4 pháo bắn chuẩn bị vào căn cứ Đồng Dù (Sư đoàn 25 VNCH); 10h30 Sư đoàn 320A (Quân đoàn 3) cắm cờ trên sở chỉ huy sư đoàn;
// 23h Quân đoàn 3 nhận nhiệm vụ đánh Bộ Tổng tham mưu (S5). Lữ đoàn đặc công – biệt động 316 đánh chiếm, giữ cầu Rạch Chiếc 27–30/4 (S19, S40).
// Toạ độ: căn cứ Đồng Dù 10,9875 B · 106,5125 Đ (S41, Wikipedia "Củ Chi Base Camp"); cầu Rạch Chiếc 10,8133 B · 106,7569 Đ (S42).
// Vị trí trận địa pháo, đường bay đạn là MINH HOẠ.
const C05 = {}, C01 = {}, C03 = {}, C06 = {}, KT = { cot: [], td: [], don: {} };
if (HCM && TANG === 'chien-dich') {
  const sc = STORY.scenes.find((c) => c.id === 'C05'); C05.t0 = sc ? sc.t0 : 1e9; C05.t1 = sc ? sc.t1 : 1e9; const T0 = C05.t0;
  const DD = [10.9875, 106.5125], RC = [10.8133, 106.7569], BT = [10.80326, 106.67153];
  const dd = LL(DD[0], DD[1]), rc = LL(RC[0], RC[1]); dd.y = hG(dd.x, dd.z); rc.y = hG(rc.x, rc.z); C05.dd = dd; C05.rc = rc;
  const tex = (src) => { const t = new THREE.TextureLoader().load(src); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const coTx = tex('data/co-mtdtgp.png');
  const ghim = (p, h, w) => {                                                            // cờ ghim trên sa bàn (kiểu sa bàn thật): cán + lá cờ bay
    const g = new THREE.Group(), can = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.035, w * 0.035, h, 6).translate(0, h / 2, 0), new THREE.MeshLambertMaterial({ color: 0x3a2c1c }));
    const m = new THREE.MeshLambertMaterial({ map: coTx, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uv.x * 5.0 - uT * 3.0) * 0.08 * ' + w.toFixed(1) + ' * uv.x;'); };
    const la = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.66, 10, 2).translate(w / 2, h - w * 0.33, 0), m);
    g.add(can, la); g.position.copy(p); g.scale.setScalar(0.001); g.visible = false; scene.add(g); return g; };
  C05.coDD = ghim(dd, 2600, 1500); C05.coRC = ghim(rc, 2200, 1300);
  const vongMat = new THREE.MeshBasicMaterial({ color: 0xffd36a, transparent: true, opacity: 0.8, depthWrite: false, depthTest: false, side: THREE.DoubleSide });   // không bị núi che (anh Thắng 24/11)
  const vong = (p) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 64).rotateX(-Math.PI / 2), vongMat.clone()); m.position.copy(p).y += 450; m.renderOrder = 6; m.visible = false; scene.add(m); return m; };
  C05.vDD = vong(dd); C05.vRC = vong(rc);
  // pháo bắn chuẩn bị: 6 trận địa minh hoạ ở phía Bắc – Tây Bắc căn cứ, đạn bay theo đường cong
  const sprTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  const spr = (col, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprTex, color: col, transparent: true, depthWrite: false })); sp.scale.setScalar(s); sp.visible = false; scene.add(sp); return sp; };
  const phaoTao = (p, huong, n = 6) => Array.from({ length: n }, (_, k) => {               // trận địa pháo MINH HOẠ quanh hướng `huong` (rad, 0 = Bắc), bắn vào p
    const a = huong - 0.45 + k * 0.9 / (n - 1), r = 9000 + (k % 3) * 1800, src = V3(p.x + Math.sin(a) * r, 0, p.z - Math.cos(a) * r); src.y = hG(src.x, src.z);
    const dich = V3(p.x + (k - n / 2) * 500, p.y, p.z + ((k * 37) % 5 - 2) * 400);
    return { src, dich, dan: spr(0xffe0a0, 700), no: spr(0xff8a3a, 2600), ph: k * 0.37 }; });
  const phaoCap = (L, on, u0, u1, u) => { for (const P of L) {                             // đạn bay theo đường cong, nổ ở đích
    const ph = ((u - u0 + P.ph) / 2.4) % 1, ban = on && u > u0 && u < u1;
    P.dan.visible = ban && ph < 0.8; P.no.visible = ban && ph >= 0.8;
    if (P.dan.visible) { const k = ph / 0.8; P.dan.position.lerpVectors(P.src, P.dich, k).y += Math.sin(Math.PI * k) * 4500; }
    if (P.no.visible) { const k = (ph - 0.8) / 0.2; P.no.position.copy(P.dich).y += 600; P.no.scale.setScalar(1500 + k * 3000); P.no.material.opacity = 1 - k; } } };
  C05.phao = phaoTao(dd, -0.4);
  C05.ten = [addLabel('Căn cứ Đồng Dù (Sư đoàn 25)', dd.x, dd.z, 'hero', { grp: 'muiten', yFn: () => 3600, show: () => C05.vDD.visible }),
             addLabel('Cầu Rạch Chiếc — đặc công 316 giữ cầu', rc.x, rc.z, 'hero', { grp: 'muiten', yFn: () => 3200, show: () => C05.vRC.visible })];
  // ---- C01 · Cánh cửa phía Đông: Xuân Lộc 9–21/4 (S21). Toạ độ thị xã theo terrain/meta.json (OSM). Mũi tên theo đường số 1 về Biên Hòa: MINH HOẠ ý "cửa mở".
  const noi = (ten) => { const q = META.places.find((p) => p[1].startsWith(ten)); const v = V3(q[2], 0, -q[3]); v.y = hG(v.x, v.z); return v; };
  { const sc1 = STORY.scenes.find((c) => c.id === 'C01'); C01.t0 = sc1 ? sc1.t0 : 1e9; C01.t1 = sc1 ? sc1.t1 : 1e9;
    C01.xl = noi('Xuân Lộc'); C01.v = vong(C01.xl); C01.phao = phaoTao(C01.xl, 0.3, 5);
    C01.ten = addLabel('Xuân Lộc — trận đánh 9–21/4', C01.xl.x, C01.xl.z, 'hero', { grp: 'muiten', yFn: () => 3600, show: () => C01.v.visible });
    const dg = noi('Dầu Giây'), bh = noi('Biên Hòa');
    C01.mt = muiTen([C01.xl, dg, bh].map((v) => V3(v.x, 900, v.z)), 0xd2442b, 420); muiTenDat(C01.mt, false);
    C01.cap = (t) => { const on = t >= C01.t0 - 0.5 && t < C01.t1 + 0.5, u = t - C01.t0;
      C01.v.visible = on; if (on) { const k = (u * 0.5) % 1; C01.v.scale.setScalar(2500 + k * 4000); C01.v.material.opacity = 0.8 * (1 - k); }
      phaoCap(C01.phao, on, MV.c01_phao0 - C01.t0, MV.c01_phao1 - C01.t0, u); muiTenDat(C01.mt, on && t >= MV.c01_mt, sstep(MV.c01_mt, MV.c01_mt + 9, t)); }; }
  // ---- C03 · Nổ súng mở màn 17h 26/4 (S2, S26): pháo binh Quân đoàn 2 nổ súng hướng Đông, Đông Nam, chi viện đánh Nước Trong, Long Thành (S39).
  { const sc3 = STORY.scenes.find((c) => c.id === 'C03'); C03.t0 = sc3 ? sc3.t0 : 1e9; C03.t1 = sc3 ? sc3.t1 : 1e9;
    C03.lt = noi('Long Thành'); C03.v = vong(C03.lt); C03.phao = phaoTao(C03.lt, 1.3, 8);
    C03.ten = addLabel('Long Thành, Nước Trong — 17 giờ 26/4', C03.lt.x, C03.lt.z, 'hero', { grp: 'muiten', yFn: () => 3600, show: () => C03.v.visible });
    C03.cap = (t) => { const on = t >= C03.t0 - 0.5 && t < C03.t1 + 0.5, u = t - C03.t0;
      C03.v.visible = on; if (on) { const k = (u * 0.5) % 1; C03.v.scale.setScalar(2500 + k * 4000); C03.v.material.opacity = 0.8 * (1 - k); }
      phaoCap(C03.phao, on, MV.c03_phao0 - C03.t0, MV.c03_phao1 - C03.t0, u); }; }
  // ---- C06 · Rạng sáng 30/4 (S1, S19): năm cánh quân đồng loạt tổng công kích; 7h15 pháo cối bắn vào Tân Sơn Nhất và Bộ Tổng tham mưu;
  // 7h30 xe tăng đầu tiên của Lữ đoàn 203 qua cầu Rạch Chiếc. Trận địa cối, đường đạn, mũi tên qua cầu: MINH HOẠ.
  { const sc6 = STORY.scenes.find((c) => c.id === 'C06'); C06.t0 = sc6 ? sc6.t0 : 1e9; C06.t1 = sc6 ? sc6.t1 : 1e9;
    const tsn = LL(MOC.tsn[0], MOC.tsn[1]), btt = LL(BT[0], BT[1]); tsn.y = hG(tsn.x, tsn.z); btt.y = hG(btt.x, btt.z); C06.muc = V3((tsn.x + btt.x) / 2, 0, (tsn.z + btt.z) / 2);
    C06.phao = [...phaoTao(tsn, -0.9, 4), ...phaoTao(btt, -0.2, 4)]; C06.vT = vong(tsn); C06.vB = vong(btt);
    const cs = LL(MOC.causg[0], MOC.causg[1]);
    C06.mt = muiTen([rc, LL(10.807, 106.742), cs].map((v) => V3(v.x, 700, v.z)), 0xd2442b, 260); muiTenDat(C06.mt, false);
    C06.ten = [addLabel('7 giờ 30 · xe tăng Lữ đoàn 203 qua cầu', rc.x, rc.z, 'hero', { grp: 'muiten', yFn: () => 2600, show: () => C06.mt.visible }),
               addLabel('7 giờ 15 · pháo cối vào Tân Sơn Nhất, Bộ Tổng tham mưu', C06.muc.x, C06.muc.z, 'hero', { grp: 'muiten', yFn: () => 3200, show: () => C06.vT.visible })];
    C06.cap = (t) => { const on = t >= C06.t0 - 0.5 && t < C06.t1 + 0.5, u = t - C06.t0;
      C06.vT.visible = C06.vB.visible = on && t >= MV.c06_phao - 1 && t < MV.c06_rc + 2;
      for (const v of [C06.vT, C06.vB]) if (v.visible) { const k = (u * 0.5) % 1; v.scale.setScalar(1200 + k * 2000); v.material.opacity = 0.8 * (1 - k); }
      phaoCap(C06.phao, on, MV.c06_phao - C06.t0, MV.c06_rc + 3 - C06.t0, u);
      muiTenDat(C06.mt, on && t >= MV.c06_rc + 2, sstep(MV.c06_rc + 2, MV.c06_rc + 12, t)); }; }
  // ---- KHÍ TÀI MINH HOẠ TRÊN TẦNG CHIẾN DỊCH (anh Thắng 24/11): lời dẫn nói về đối phương → máy bay vòng cung quanh đồn lũy; nói về
  // Quân Giải phóng → máy lướt sát trên đầu đoàn quân đang tiến về Sài Gòn; nói về pháo → cận cảnh, trung cảnh trận địa pháo ta đang bắn.
  // Mẫu xe, pháo phóng to ×3 (kiểu quân cờ trên sa bàn) để thấy được ở tầm chiến dịch. Vị trí đồn, trận địa, đội hình đoàn xe: MINH HOẠ.
  { const KS = 3, tx = (src) => { const t = new THREE.TextureLoader().load(PU(src)); t.colorSpace = THREE.SRGBColorSpace; return t; }, txM = tx('data/co-mtdtgp.png'), txV = tx('data/co-vnch.png');
    const [gK, gT, gP, g41, g113, gTK] = await Promise.all(['data/xe/xe-boc-thep-k63.glb', 'data/xe/xe-tai.glb', 'data/phao/m-46-130mm.glb', 'data/xe/xe-tang-m41.glb', 'data/xe/xe-boc-thep-m113.glb', 'data/xe/xe-tang-390.glb'].map((f) => glbLoad(f).catch(() => null)));
    const coMat = (t) => { const m = new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uv.x * 6.0 - uT * 5.0) * 0.12 * uv.x * 6.0;'); }; return m; };
    const mMT = coMat(txM), mVN = coMat(txV), mCan = new THREE.MeshLambertMaterial({ color: 0x3a2c1c });
    const co = (cao, w, mat) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.03, w * 0.03, cao, 5).translate(0, cao / 2, 0), mCan),
      new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.66, 8, 1).translate(w / 2, cao - w * 0.33, 0), mat)); return g; };
    const moi = (g, s = KS) => { const o = g.scene.clone(true); o.scale.setScalar(s); return o; };
    const huong = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);                              // mũi xe theo +z
    // ĐỒN LŨY ĐỐI PHƯƠNG (anh Thắng 24/11): thành vuông như thành trì — tường đất, hai cổng ra vào, bốn lô cốt góc, hàng rào dây thép gai, dãy nhà lính,
    // xe tăng M41, xe bọc thép M113, cờ ba sọc, lính đối phương trên tường và trong đồn. Trong lúc pháo ta bắn: nổ trong đồn; sau khi đồn mất (tDo): tường sụt,
    // nhà sập, xe cháy, lính tử trận, cờ Mặt trận trên cột cờ, bộ đội ta trong đồn. Kích thước (cạnh 360 m), bố trí: MINH HOẠ kiểu "quân cờ" trên sa bàn.
    const mat = (c) => new THREE.MeshLambertMaterial({ color: c }), cua = (o) => { const M = []; o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); M.push([m.material, m.material.color.clone()]); } }); return M; };
    const don = (p, tTC, tDo, chet = 0.35, quay = 0.3) => { const g = new THREE.Group(), S = 180, dat = mat(0x7b6040), bt = mat(0x5d6150), mai = mat(0x8d918a), soi = mat(0xa39272);
      const D = { g, tTC, tDo, chet, tuong: [], nha: [], xe: [], lua: [], no: [], A: [], B: [], hu: null };
      const hop = (w, h, d, m, x, y, z, ry = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b; };
      hop(2 * S - 10, 1, 2 * S - 10, soi, 0, 0.4, 0);                                               // nền đồn
      for (const [sx, sz, ngang, cong] of [[0, S, 1, 1], [0, -S, 1, 1], [S, 0, 0, 0], [-S, 0, 0, 0]])  // tường đất từng đoạn 60 m; hai cạnh trước, sau chừa cổng 36 m
        for (let k = 0; k < 6; k++) { let a = -S + k * 60, b = a + 60; const doan = cong && a < 18 && b > -18 ? [[a, -18], [18, b]] : [[a, b]];
          for (const [a1, b1] of doan) { const m = (a1 + b1) / 2, L = b1 - a1; const w = hop(ngang ? L : 14, 7, ngang ? 14 : L, dat, ngang ? m : sx, 3.5, ngang ? sz : m); D.tuong.push(w);
            for (let j = 0; j < 2; j++) { const u = (j + 0.5) / 2, q = a1 + L * u, x = ngang ? q : sx, z = ngang ? sz : q; D.B.push([x, z, Math.atan2(ngang ? 0 : sx, ngang ? sz : 0), 7.2, 'tuong']); } } }
      for (const sz of [S, -S]) for (const sx of [-24, 24]) hop(12, 13, 16, bt, sx, 6.5, sz);      // tháp hai bên cổng
      for (const sx of [-S, S]) for (const sz of [-S, S]) { hop(20, 16, 20, bt, sx, 8, sz); hop(24, 2, 24, mai, sx, 17, sz); }   // lô cốt bốn góc
      for (const [w, d, x, z] of [[2 * S + 80, 1.6, 0, S + 40], [2 * S + 80, 1.6, 0, -S - 40], [1.6, 2 * S + 80, S + 40, 0], [1.6, 2 * S + 80, -S - 40, 0]]) hop(w, 2.4, d, mat(0x2b2b28), x, 1.2, z);   // rào thép gai
      for (const [x, z] of [[-95, -100], [95, -100], [-95, 15], [95, 15], [-95, 110]]) D.nha.push(hop(80, 9, 18, mai, x, 4.5, z));   // dãy nhà lính mái tôn
      const cv = co(70, 34, mVN); cv.position.set(0, 0, -40); g.add(cv); D.coV = cv; const cm = co(70, 34, mMT); cm.position.set(0, 0, -40); cm.visible = false; g.add(cm); D.coM = cm;
      [[g41, 40, 60, 0.5], [g41, -30, 90, 2.0], [g113, 60, -40, 3.6], [g113, -50, -50, 1.2], [g113, 20, 120, 0.2]].forEach(([gg, x, z, y]) => { if (!gg) return; const o = moi(gg); o.position.set(x, 1, z); o.rotation.y = y; g.add(o); D.xe.push({ o, mats: cua(o), ten: gg === g41 ? 'Xe tăng M41 (đối phương)' : 'Xe bọc thép M113 (đối phương)' }); });
      const r = rndS(Math.round(p.x) % 9999 + 7); for (let i = 0; i < 22; i++) D.B.push([(r() - 0.5) * 260, (r() - 0.5) * 260, r() * 6.28, 1, r() < 0.4 ? 'nup' : r() < 0.5 ? 'di' : 'dung']);
      for (let i = 0; i < 24; i++) D.A.push([(r() - 0.5) * 240, (r() - 0.5) * 240, r() * 6.28, 1, 'dung']);   // bộ đội ta trong đồn sau trận
      for (let i = 0; i < 7; i++) { D.lua.push(nhoe(0xff7a2a)); D.no.push(nhoe(0x58504a, false)); }
      g.position.set(p.x, hG(p.x, p.z), p.z); g.rotation.y = quay; scene.add(g); g.updateMatrixWorld(true);
      const W = (P) => { const v = g.localToWorld(V3(P[0], P[3], P[1])); return [v.x, v.y, v.z, P[2] + quay, P[4]]; };
      D.Bw = D.B.map(W); D.Aw = D.A.map(W); D.ph = D.B.map((_, i) => (i * 0.61) % 1);
      // V1.9 (anh Thắng: pháo ta bắn vào cứ điểm thì xe tăng, xe bọc thép, lính địch trong đồn phải chạy toán loạn, tháo chạy): mỗi người, mỗi xe có một
      // đường tháo chạy — chạy loạn trong đồn rồi ra cổng phía Sài Gòn, chạy xa ra ngoài. Lính trong đồn chạy ngay khi pháo bắt đầu, lính trên tường bắn trả
      // nửa đầu trận rồi mới bỏ chạy. Khi đồn mất: người bị trúng đạn nằm lại chỗ đang chạy, xe cháy tại chỗ. Đường chạy, thời điểm: MINH HOẠ.
      { const rf = rndS(Math.round(p.x * 7) % 9999 + 11), cg = [g.localToWorld(V3(0, 0, S)), g.localToWorld(V3(0, 0, -S))], gi = cg[0].distanceToSquared(SG) < cg[1].distanceToSquared(SG) ? 0 : 1;
        const CG = cg[gi], vin = g.localToWorld(V3(0, 0, gi ? -S + 30 : S - 30)), dir = V3(SG.x - CG.x, 0, SG.z - CG.z).normalize(), ng = V3(dir.z, 0, -dir.x);
        const tuyen = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z)); return { P, L }; };
        D.chayBo = D.Bw.map((B, i) => { const tuong = B[4] === 'tuong', q = g.localToWorld(V3((rf() - 0.5) * 260, 0, (rf() - 0.5) * 260)), xa = 300 + rf() * 420, ngang = (rf() - 0.5) * 360;
          const E = V3(CG.x + dir.x * xa + ng.x * ngang, 0, CG.z + dir.z * xa + ng.z * ngang);
          return { ts: tuong ? tTC + (tDo - tTC) * 0.45 + rf() * 5 : tTC + 0.3 + rf() * 2.5, T: tuyen(tuong ? [V3(B[0], 0, B[2]), vin, CG, E] : [V3(B[0], 0, B[2]), q, vin, CG, E]) }; });
        D.chayXe = D.xe.map((X, i) => { const w = g.localToWorld(X.o.position.clone()), xa = 650 + rf() * 400, ngang = (i - 2) * 140 + (rf() - 0.5) * 80, E = V3(CG.x + dir.x * xa + ng.x * ngang, 0, CG.z + dir.z * xa + ng.z * ngang);
          return { ts: tTC + 1 + i * 1.6, p0: X.o.position.clone(), y0: X.o.rotation.y, T: tuyen([w, g.localToWorld(V3((rf() - 0.5) * 200, 0, (rf() - 0.5) * 200)), vin, CG, V3(CG.x + dir.x * 120, 0, CG.z + dir.z * 120), E]) }; });   // vòng loạn trong đồn rồi mới ra cổng
        D.diem = (T, s) => { const L = T.L; s = Math.min(Math.max(0, s), L[L.length - 1] - 0.01); let k = 1; while (k < L.length - 1 && L[k] < s) k++;
          const A = T.P[k - 1], B = T.P[k], u = (s - L[k - 1]) / Math.max(1e-6, L[k] - L[k - 1]); return [A.x + (B.x - A.x) * u, A.z + (B.z - A.z) * u, Math.atan2(B.x - A.x, B.z - A.z), s >= L[L.length - 1] - 0.02]; }; }
      D.hong = D.tuong.filter((_, i) => (i * 7) % 5 < 2);                                         // các đoạn tường bị phá
      D.cap = (t) => { const hu = t >= tDo; if (hu !== D.hu) { D.hu = hu;
          for (const w of D.hong) { w.position.y = hu ? 1.2 : 3.5; w.rotation.z = hu ? 0.22 : 0; w.scale.y = hu ? 0.45 : 1; }
          for (const n of D.nha) { n.scale.y = hu ? 0.3 : 1; n.position.y = hu ? 1.4 : 4.5; n.material = hu ? mat(0x3a3532) : mai; }
          for (const X of D.xe) if (X.mats) for (const [m, c0] of X.mats) m.color.copy(c0).multiplyScalar(hu ? 0.28 : 1);
          D.coV.visible = !hu; D.coM.visible = hu; }
        const danh = t >= tTC && t < tDo, chay = hu && t < tDo + 40;
        D.lua.forEach((s, i) => { const P = i < D.xe.length ? D.xe[i].o.position : D.nha[i % D.nha.length].position, w = g.localToWorld(V3(P.x, 2, P.z));
          if (danh) { const u = (t * 0.55 + i * 0.37) % 1; s.visible = u < 0.4; if (s.visible) { const q = g.localToWorld(V3(((i * 53) % 300) - 150, 2, ((i * 97) % 300) - 150)); s.position.set(q.x, q.y + 6 + u * 40, q.z); s.scale.setScalar(25 + u * 120); s.material.opacity = 0.95 * (1 - u / 0.4); } }
          else if (chay) { s.visible = true; s.position.set(w.x, w.y + 6 + (Math.sin(t * 9 + i) + 1) * 2, w.z); s.scale.setScalar(16 + Math.sin(t * 13 + i * 2) * 4); s.material.opacity = 0.85; }
          else s.visible = false;
          const k = D.no[i]; k.visible = danh || chay; if (k.visible) { const u = (t * 0.12 + i / 7) % 1; k.position.set(w.x + u * 40, w.y + 10 + u * 160, w.z - u * 25); k.scale.setScalar(30 + u * 120); k.material.opacity = 0.5 * (1 - u); } }); };
      KT.dons.push(D); return D; };
    KT.dons = [];
    KT.don.xl = don(C01.xl, MV.c01_phao0, MV.c01_rut, 0.2, 0.4); KT.don.lt = don(C03.lt, MV.c03_phao0, MV.c03_phao1 + 4, 0.35, 1.1); KT.don.dd = don(C05.dd, MV.c05_phao0, MV.c05_co, 0.35, -0.2);
    for (const k of ['xl', 'lt', 'dd']) KT.don[k] = Object.assign(KT.don[k].g, { D: KT.don[k] });
    DAM.push((t, tv) => { for (const D of KT.dons) { const p = D.g.position; if (!ganMay(p.x, p.z, 2600)) continue; D.cap(tv); const hu = tv >= D.tDo, nc = Math.floor(D.Bw.length * D.chet);
      const tc = Math.min(tv, D.tDo);
      D.Bw.forEach((P, i) => { if (hu && i >= nc) return; const C = D.chayBo[i];
        if (tc > C.ts) { const [x, z, yaw, het] = D.diem(C.T, (tc - C.ts) * 4.0 * KS); if (het && !hu) return;   // 4 m/s × KS: khớp nhịp bước động tác 'chay'
          dongDat('vnch', hu ? 'nam' : 'chay', tv, D.ph[i], x, hG(x, z) + (hu ? 0.3 : 0), z, yaw, KS, i); return; }
        const clip = hu ? 'nam' : P[4] === 'tuong' ? (tv >= D.tTC ? 'ban' : 'dung') : P[4]; dongDat('vnch', clip, tv, D.ph[i], P[0], P[1] + (hu ? 0.3 : 0), P[2], P[3], KS, i); });
      D.xe.forEach((X, i) => { const C = D.chayXe[i]; if (tc <= C.ts) { X.o.position.copy(C.p0); X.o.rotation.y = C.y0; return; }
        const [x, z, yaw] = D.diem(C.T, (tc - C.ts) * 8 * KS), l = D.g.worldToLocal(V3(x, hG(x, z) + 1, z)); X.o.position.copy(l); X.o.rotation.y = yaw - D.g.rotation.y; });
      if (hu) D.Aw.forEach((P, i) => dongDat('qgp', 'dung', tv, D.ph[i % D.ph.length], P[0], P[1], P[2], P[3], KS, i)); }
      for (const D of KT.dons) if (!ganMay(D.g.position.x, D.g.position.z, 2600)) D.cap(tv); });
    // trận địa pháo ta: 4 khẩu M-46 130 mm (cắm cờ Mặt trận), chớp lửa đầu nòng, khói — đặt ở điểm xuất phát đường đạn phaoTao
    const tranDia = (P, t0, t1) => { const f = V3().subVectors(P.dich, P.src).setY(0).normalize(), r = V3(f.z, 0, -f.x), yaw = Math.atan2(f.x, f.z), S = [];
      for (let k = 0; k < 4; k++) { if (!gP) break; const o = moi(gP, 2.6), x = P.src.x + r.x * (k - 1.5) * 42, z = P.src.z + r.z * (k - 1.5) * 42;
        o.position.set(x, hG(x, z), z); o.rotation.y = yaw; scene.add(o); const c = co(11, 5, mMT); c.position.set(x - f.x * 14, hG(x, z), z - f.z * 14); scene.add(c);
        const lua = spr(0xffc070, 40), khoi = spr(0xbab4a8, 60); S.push({ x, z, y: hG(x, z), lua, khoi, ph: k * 0.29 }); }
      const N = [], rr = rndS(Math.round(P.src.x) % 9999 + 3);                                        // pháo thủ (3 người mỗi khẩu) + bộ binh bảo vệ trận địa đứng bắn (anh Thắng 24/11)
      // V1.9 (anh Thắng): 3 pháo thủ đứng sát khoá nòng điều khiển pháo; bộ binh còn lại chạy qua chạy lại rồi dừng bắn
      for (const G of S) for (const [lr, lf, yq, cl] of [[-6, -3, 0.9, 'quy'], [6, -3, -0.9, 'quansat'], [0, -10, 0, 'dung']]) { const x = G.x + r.x * lr + f.x * lf, z = G.z + r.z * lr + f.z * lf; N.push([x, hG(x, z), z, yaw + yq, cl]); }
      for (let j = 0; j < 12; j++) { const a = 70 + rr() * 30, b = (j - 5.5) * 13, x = P.src.x + f.x * a + r.x * b, z = P.src.z + f.z * a + r.z * b;
        N.push([x, hG(x, z), z, yaw + (rr() - 0.5) * 0.3, rr() < 0.65 ? 'ban' : 'namban', { ph: rr(), chieu: rr() < 0.5 ? 1 : -1 }]); }
      const T = { P, f, r, S, t0, t1, N }; KT.td.push(T); return T; };
    KT.td1 = tranDia(C01.phao[0], MV.c01_phao0, MV.c01_phao1); KT.td3 = tranDia(C03.phao[0], MV.c03_phao0, MV.c03_phao1);
    KT.td5 = tranDia(C05.phao[0], MV.c05_phao0, MV.c05_phao1); KT.td6 = tranDia(C06.phao[0], MV.c06_phao, MV.c06_rc + 3);
    // đoàn quân ta: xe bọc thép K-63, xe tải chở bộ binh, xe kéo pháo M-46 (cắm cờ), chạy theo đường tiến về Sài Gòn trong khung giờ của cú máy
    const VAN = 9, CACH = 55;                                                             // tốc độ (m/s), khoảng cách xe — anh Thắng 24/11: chạy chậm như xe thật, không "tua nhanh"
    const RT = (k) => { const P = (INST.duong && INST.duong['cot_' + k]) || [], i = P.findIndex(([x, y]) => Math.hypot(x, y) < R - 1500); return i > 0 ? P.slice(i) : P; };   // V1.5: bỏ đoạn đường nằm ngoài sa bàn (đường Xuân Lộc bắt đầu cách tâm 69 km > bán kính 56,5 km → xe, máy quay rơi xuống dưới đất)
    console.log('cầu chiến dịch', ['xl', 'bac', 'tb', 'dong', 'dn', 'dd', 'tn'].map((k) => cauTao(RT(k), { k: 2.2, rong: 13 })));                          // tuyến theo đường bộ OSM (tools/sa_ban/dia_hinh/tuyen_cot.py), không xuyên sông hồ
    const MAU = { xl: 0xd2442b, dong: 0xd2442b, bac: 0xe58a1f, tb: 0xc0408c, dd: 0xc0408c, dn: 0x2f7fd6, lt: 0x2f7fd6, tn: 0x2fa35a };
    let VET_N = 0;   // V1.4: mỗi dải màu một thứ tự vẽ và độ cao riêng — dải chồng nhau (gần Sài Gòn) không còn tranh nhau nhấp nháy
    const vet = (P, mau, rong = 16) => { const D = duong(P), n = Math.max(2, Math.floor(D.L / 40)), pos = new Float32Array(n * 2 * 3), idx = [], dy = 6 + (VET_N % 8) * 1.2, ro = 2 + (VET_N++ % 8);
      for (let i = 0; i < n; i++) { const d = i / (n - 1) * D.L, a = diemTren(D, d), b = diemTren(D, Math.min(D.L, d + 5)), dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l * rong, nz = dx / l * rong;
        pos.set([a.x + nx, hG(a.x + nx, a.z + nz) + dy, a.z + nz, a.x - nx, hG(a.x - nx, a.z - nz) + dy, a.z - nz], i * 6); if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: mau, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 }));
      m.renderOrder = ro; m.visible = false; m.userData = { n, L: D.L }; scene.add(m); return m; };
    KT.vetDat = (m, d) => { const k = Math.max(0, Math.min(m.userData.n - 1, Math.floor(d / m.userData.L * (m.userData.n - 1)))); m.geometry.setDrawRange(0, k * 6); };
    const cot = (k, t0, t1, f1) => { const P = RT(k), D = duong(P), X = [];
      ['TK', 'TK', 'TK', 'K', 'T', 'T', 'TP', 'TK', 'K', 'T', 'T', 'TP', 'T', 'TK', 'K', 'T', 'T', 'TP', 'T', 'TK', 'K', 'T', 'T', 'TP', 'T', 'T', 'K', 'T'].forEach((k, i) => {   /* anh Thắng V1.2: đoàn dài hơn, nhiều xe tăng, xe chở quân, xe kéo pháo */ const g = k === 'K' ? gK : k === 'TK' ? gTK : gT; if (!g) return;   // TK: xe tăng T-54 (mẫu 390, ẩn số hiệu)
        const o = moi(g); o.visible = false; scene.add(o); const c = co(3.6, 1.8, mMT); c.position.set(0, k === 'TK' ? 2.9 : 2.4, -2.2); o.add(c);
        if (k === 'TK') o.traverse((m) => { if (/^so-hieu/.test(m.name)) m.visible = false; });
        let keo = null; if (k === 'TP' && gP) { keo = moi(gP, KS * 0.8); keo.visible = false; scene.add(keo); } X.push({ o, keo, i, k }); });
      const d1 = f1 * D.L, d0 = Math.max(0, d1 - VAN * (t1 - t0)); const C = { D, X, t0, t1, d0, d1, k, vet: vet(P, MAU[k] || 0xd2442b) }; KT.cot.push(C); return C; };
    KT.c01a = cot('xl', MV.c01_l1 - 1, MV.c01_d + 1, 0.55); KT.c01b = cot('xl', MV.c01_l2 - 1, MV.c01_p + 1, 0.82); KT.c01c = cot('xl', MV.c01_l3 - 1, MV.c01_rut, 0.95);
    KT.c02a = cot('bac', MV.c02_l1 - 1, MV.c02_l2 + 1, 0.75); KT.c02b = cot('tb', MV.c02_l2 - 1, MV.c02_vay + 1, 0.8);
    KT.c03 = cot('lt', MV.c03_l - 1, MV.c03_phao1 + 1, 0.92); KT.c05 = cot('dd', MV.c05_l - 1, MV.c05_phao1 + 1, 0.94);
    KT.c05b = cot('dn', MV.c05_l2 - 1, MV.c05_l2e + 1, 0.93); KT.c06a = cot('dong', MV.c06_l1 - 1, MV.c06_tc + 1, 0.9); KT.c06b = cot('bac', MV.c06_l2 - 1, MV.c06_phao + 1, 0.93);
    // 7h30 30/4 chiếc xe tăng đầu tiên của Lữ đoàn 203 qua cầu Rạch Chiếc (VOH): đoàn xe tăng đi đầu tới cầu đúng câu đọc (c06_rc + 3 s)
    { const P = RT('dong'), D = duong(P); let bd = [1e18, 0]; for (let d = 0; d < D.L; d += 20) { const q = diemTren(D, d), e = (q.x - C05.rc.x) ** 2 + (q.z - C05.rc.z) ** 2; if (e < bd[0]) bd = [e, d]; }
      const t0 = MV.c06_rc - 1, t1 = C06.t1 || MV.c06_rc + 30, d1 = Math.min(D.L - 5, bd[1] + VAN * (t1 - MV.c06_rc - 3)); KT.c06rc = cot('dong', t0, t1, d1 / D.L); KT.c06rc.dCau = bd[1]; }
    // cận cảnh xe tăng đi đầu: máy thấp bên mũi xe nhìn về phía sau (đoàn quân đang tiến lên) → vòng ra sau xe nhìn con đường vào nội đô → cẩu lên cao
    KT.camTang = (C) => (u, t) => { const X = C.X[0]; if (!X || !X.o.visible) return orbit(C05.rc, 11000, 6500, 4.2, 4.8, 42)(u);
      const p = X.o.position, y = X.o.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y)), r = V3(f.z, 0, -f.x), e = (a, b, k) => a + (b - a) * sstep(0, 1, k);
      if (u < 0.42) { const k = u / 0.42; return [p.clone().addScaledVector(f, 9 * KS - k * 3 * KS).addScaledVector(r, 4.5 * KS).add(V3(0, 1.4 * KS, 0)), p.clone().addScaledVector(f, -14 * KS).add(V3(0, 1.2 * KS, 0)), 48]; }
      if (u < 0.66) { const k = (u - 0.42) / 0.24, a = e(0, Math.PI, k), c = V3(Math.cos(a) * 9 * KS, 0, 0); const pos = p.clone().addScaledVector(f, Math.cos(a) * 9 * KS).addScaledVector(r, Math.sin(a) * 6 * KS + 4.5 * KS * (1 - k)).add(V3(0, (1.4 + k * 0.8) * KS, 0));
        return [pos, p.clone().addScaledVector(f, e(-14, 60, k) * KS).add(V3(0, 1.2 * KS, 0)), 48]; }
      const k = (u - 0.66) / 0.34; return [p.clone().addScaledVector(f, -12 * KS - k * 300).add(V3(0, 2.2 * KS + e(0, 900, k), 0)), p.clone().addScaledVector(f, 120 + k * 1800), 48 - k * 6]; };
    // hồi 6: vệt năm cánh quân vẽ dần trên đường bộ về Sài Gòn
    KT.vet6 = ['bac', 'tb', 'dong', 'dn', 'tn'].map((k) => vet(RT(k), MAU[k], 240));
    // Sài Gòn: vòng tròn bung tỏa khi các cánh quân áp sát, tiến công vào Sài Gòn (như Long Thành)
    KT.vSG = vong(V3(SG.x, hG(SG.x, SG.z), SG.z));
    const S2 = STORY.scenes.find((c) => c.id === 'C02'), S3 = STORY.scenes.find((c) => c.id === 'C03'), VONG = () => [C01.v, C03.v, C05.vDD, C05.vRC, C06.vT, C06.vB, KT.vSG];
    KT.cap = (t) => {
      { const on6 = t >= C06.t0 && t < C06.t1; for (const m of KT.vet6) { m.visible = on6; if (on6) KT.vetDat(m, m.userData.L * sstep(C06.t0, MV.c06_tc + 4, t)); } }
      for (const C of KT.cot) { const on = t >= C.t0 && t < C.t1, dh = C.d0 + (C.d1 - C.d0) * clamp((t - C.t0) / (C.t1 - C.t0), 0, 1);
        C.vet.visible = on; if (on) KT.vetDat(C.vet, dh - C.X.length * CACH);
        for (const X of C.X) { X.o.visible = on; if (X.keo) X.keo.visible = on; if (!on) continue;
          const d = dh - X.i * CACH, p = diemTren(C.D, d), q = diemTren(C.D, d + 8), y = huong(p, q);
          X.o.position.set(p.x, Math.max(hG(p.x, p.z) + 0.5, CAU_Y(p.x, p.z)), p.z); X.o.rotation.y = y;
          if (X.keo) { const b = diemTren(C.D, d - 34); X.keo.position.set(b.x, Math.max(hG(b.x, b.z) + 0.5, CAU_Y(b.x, b.z)), b.z); X.keo.rotation.y = y + Math.PI; } } }
      for (const T of KT.td) { const on = t >= T.t0 && t < T.t1; T.on = on;
        for (const G of T.S) { const ph = ((t - T.t0) / 2.4 + G.ph) % 1, ban = on && ph < 0.09;
          G.lua.visible = ban; if (ban) { G.lua.position.set(G.x + T.f.x * 40, G.y + 9, G.z + T.f.z * 40); G.lua.scale.setScalar(30 + ph * 300); }
          G.khoi.visible = on && ph < 0.7; if (G.khoi.visible) { G.khoi.position.set(G.x + T.f.x * (44 + ph * 30), G.y + 10 + ph * 40, G.z + T.f.z * (44 + ph * 30)); G.khoi.scale.setScalar(40 + ph * 160); G.khoi.material.opacity = 0.55 * (1 - ph / 0.7); } } }
      const sg = (t >= MV.c02_vay && t < S2.t1) || (t >= MV.c03_phao1 && t < S3.t1) || (t >= C06.t0 && t < C06.t1);
      KT.vSG.visible = sg; if (sg) { const k = (t * 0.5) % 1; KT.vSG.scale.setScalar(3000 + k * 6000); KT.vSG.material.opacity = 0.8 * (1 - k); }
      if (camera.position.y < 2500) for (const v of [...VONG(), C05.coDD, C05.coRC]) if (v) v.visible = false;
      if (camera.position.y - hG(camera.position.x, camera.position.z) < 60) { for (const m of KT.vet6) m.visible = false; for (const C of KT.cot) C.vet.visible = false; } };   // cảnh cận: ẩn dải màu đường tiến quân (máy ở dưới dải → cả khung đỏ)   // cảnh cận (đoàn quân, trận địa, đồn): ẩn vòng tròn (vòng nằm trên cao, không bị núi che)
    // máy quay: lướt trên đoàn quân (từ cuối đoàn lên đầu, sát trên nóc xe); vòng cung quanh đồn; trung cảnh trận địa pháo
    // V1.6 (anh Thắng 22:09: "đoạn đầu cũng mất xe, thay góc camera khác"): bỏ cú máy thấp sau đuôi đoàn; nay máy bay song song bên sườn đoàn xe,
    // cao ~75 m, cách đường ~140 m, nhìn chéo xuống giữa đoàn — thấy cả hàng xe, cờ, lính trên xe, không bị đồi hay mặt đất che.
    KT.camCot = (C) => (u, t) => { const dh = C.d0 + (C.d1 - C.d0) * clamp((t - C.t0) / (C.t1 - C.t0), 0, 1);
      // V1.9 (anh Thắng: máy trên cao đừng lấy K-63 làm tâm mãi): mỗi cú máy chọn một xe làm tâm (xe tăng, xe tải chở bộ binh, xe kéo pháo, K-63…) theo thứ tự trong đoàn,
      // trong cú máy lia dần sang xe kế tiếp; cú máy chẵn, lẻ bay ở hai bên sườn đoàn
      const ks = Math.abs(Math.floor(C.t0 * 13)), sel = [1, 4, 6, 3, 0, 5, 8, 2][ks % 8], dm = dh - (sel + u * 1.4) * CACH, ben = ks % 2 ? -1 : 1;
      const m = diemTren(C.D, Math.max(0, dm)), a = diemTren(C.D, Math.max(0, dm - 100)), b = diemTren(C.D, Math.max(0, dm + 100));
      const n = V3(b.z - a.z, 0, a.x - b.x); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize().multiplyScalar(140 * ben);
      const cx = a.x + n.x, cz = a.z + n.z, hc = Math.max(hG(cx, cz), hG(a.x, a.z), hG(m.x, m.z));
      return [V3(cx, hc + 75, cz), V3(m.x, hG(m.x, m.z) + 3, m.z), 40]; };
    // CÚ MÁY QUA VAI BỘ BINH (anh Thắng 24/11): một tổ bộ binh đứng ven đường phía trước đoàn xe, máy đặt sau vai một chiến sĩ nhìn đoàn xe đang tiến về Sài Gòn
    KT.camVai = (C) => (u, t) => {
      if (!C.vai) { const dA = Math.min(C.D.L - 20, C.d1 + 70), p = diemTren(C.D, dA), px = p.x + Math.cos(p.yaw) * 24, pz = p.z - Math.sin(p.yaw) * 24, q = diemTren(C.D, dA - 260), yaw = Math.atan2(q.x - px, q.z - pz), f = [Math.sin(yaw), Math.cos(yaw)], r = [f[1], -f[0]];
        const N = [[0, 0, 'dung'], [5, -3.5, 'ban'], [-4.5, 2.5, 'quy'], [9, 1.5, 'dung'], [-8.5, -4, 'dung'], [3, 7, 'di']].map(([a, b, c], i) => { const x = px + r[0] * a * KS / 3 + f[0] * b * KS / 3, z = pz + r[1] * a * KS / 3 + f[1] * b * KS / 3; return [x, hG(x, z), z, yaw + (i ? (i % 3 - 1) * 0.25 : 0), c]; });
        C.vai = { N, f, r, yaw, on: -1 }; KT.vai.push(C.vai); }
      const V = C.vai, S = V.N[0]; V.on = t; const dh = C.d0 + (C.d1 - C.d0) * clamp((t - C.t0) / (C.t1 - C.t0), 0, 1), h = diemTren(C.D, Math.max(0, dh - 2 * CACH));
      const cam = V3(S[0] - V.f[0] * 1.7 * KS + V.r[0] * 0.55 * KS, S[1] + 1.62 * KS, S[2] - V.f[1] * 1.7 * KS + V.r[1] * 0.55 * KS);
      return [cam, V3(h.x, hG(h.x, h.z) + 2 * KS, h.z), 44 - u * 6]; };
    KT.vai = []; KT.vaiT = -99; KT.vaiNV = [];
    // V1.9 (anh Thắng: cảnh cận 0:50, 3:40 lính bị thủng): tổ lính cạnh máy quay dùng mẫu Thành cổ ĐỦ LƯỚI có xương (21 nghìn tam giác, units/linh-qgp-*-gan.glb,
    // tools/sa_ban/nhan_vat_lai/lam_linh_gan.py) thay cho đám đông .nvz đã giảm còn 4,7 nghìn tam giác (nhìn gần rách ở mũ, ba lô)
    KT.vaiVT = (i) => { const V = KT.vai.find((v) => Math.abs(v.on - KT.vaiT) < 0.6); if (!V) return null; const P = V.N[i]; return { x: P[0], y: P[1], z: P[2], yaw: P[3], clip: P[4] }; };
    { const p = Promise.all([0, 1, 2, 3, 4, 5].map((i) => nvxTao('models/linh-qgp-' + (i % 2 ? 'b' : 'a') + '-gan.glb', () => KT.vaiVT(i), { sc: KS, ten: 'Bộ binh (cận cảnh)' })))
        .then((L) => { KT.vaiNV = L; }).catch((e) => console.warn('lính cận cảnh', e)); DONG_P.push(p); }
    DAM.push((t, tv) => { KT.vaiT = tv; if (KT.vaiNV.length) return; for (const V of KT.vai) if (Math.abs(V.on - tv) < 0.6) V.N.forEach((P, i) => dongDat('qgp', P[4], tv, (i * 0.29) % 1, P[0], P[1], P[2], P[3], KS, i)); });
    KT.camDon = (g, a0, a1) => (u) => orbit(g.position, 700, 260, a0, a1, 42, 200)(u);
    KT.camTD = (T) => (u) => { const c = V3(T.P.src.x, hG(T.P.src.x, T.P.src.z), T.P.src.z), f = T.f, r = T.r, w = -1 + u * 0.6;
      return [V3(c.x - f.x * 150 + r.x * 150 * w, c.y + 38, c.z - f.z * 150 + r.z * 150 * w), V3(c.x + f.x * 160, c.y + 30, c.z + f.z * 160), 44]; };
    // người trên khí tài: bộ binh ngồi trên xe tải, trên nóc K-63; trưởng xe đứng ở cửa tháp pháo xe tăng; pháo thủ, bộ binh ở trận địa pháo (×3 như xe)
    DAM.push((t, tv) => {
      for (const C of KT.cot) { if (tv < C.t0 || tv >= C.t1) continue;
        for (const X of C.X) { const p = X.o.position; if (!X.o.visible || !ganMay(p.x, p.z, 1500)) continue;
          buiXe(X.o, KS, tv); if (X.keo) buiXe(X.keo, KS * 0.6, tv + 0.3);
          if (X.k === 'T' || X.k === 'TP') linhTrenXe(X.o, 'tai', tv, KS, X.i * 7); else if (X.k === 'K') linhTrenXe(X.o, 'k63', tv, KS, X.i * 7);
          else linhTrenXe(X.o, 'tang', tv, KS, X.i * 7); } }
      for (const T of KT.td) { if (tv < T.t0 - 2 || tv > T.t1 + 2 || !ganMay(T.P.src.x, T.P.src.z, 2200)) continue;
        T.N.forEach((P, i) => { const M = P[5]; if (!M) { dongDat('qgp', P[4], tv, (i * 0.37) % 1, P[0], P[1], P[2], P[3], 2.6, i); return; }
          // chu kỳ 9 s: chạy 4 s (4 m/s × 2,6 — khớp nhịp bước), dừng bắn 5 s; lượt sau chạy ngược lại
          const u = (tv - T.t0) / 9 + M.ph, c = Math.floor(u), k = u - c, L = 41.6, di = (c % 2 ? -1 : 1) * M.chieu, chay = k < 4 / 9;
          const o = (c % 2 ? L : 0) * M.chieu + (chay ? di * L * k * 9 / 4 : (c % 2 ? -L : L) * M.chieu), x = P[0] + T.r.x * o, z = P[2] + T.r.z * o;
          if (chay) dongDat('qgp', 'chay', tv, M.ph, x, hG(x, z), z, Math.atan2(T.r.x * di, T.r.z * di), 2.6, i);
          else dongDat('qgp', P[4], tv, M.ph, x, hG(x, z), z, P[3], 2.6, i); }); } });
    // CẦU RẠCH CHIẾC (VOH: rạng sáng 28/4 đối phương phản công chiếm lại cầu; 29/4 ta đánh chiếm lại, giữ cầu cho đại quân): đặc công giữ hai đầu cầu,
    // đối phương phản kích từ phía nội đô — đấu súng bộ binh, đạn vạch. Vị trí từng người: MINH HOẠ.
    { const P = RT('dong'), D = duong(P); let bd = [1e18, 0]; for (let d = 0; d < D.L; d += 20) { const q = diemTren(D, d), e = (q.x - C05.rc.x) ** 2 + (q.z - C05.rc.z) ** 2; if (e < bd[0]) bd = [e, d]; }
      const d0 = bd[1], r = rndS(316), A = [], B = [], o = diemTren(D, d0), q = diemTren(D, d0 + 40), f = V3(q.x - o.x, 0, q.z - o.z).normalize(), yf = Math.atan2(f.x, f.z);
      const ben0 = (d, lech) => { const p = diemTren(D, d); return [p.x + Math.cos(p.yaw) * lech, p.z - Math.sin(p.yaw) * lech]; };
      const ben = (d, lech) => { for (let n = 0; n < 12; n++) { const q = ben0(d, lech); if (hG(q[0], q[1]) > 0.4 || CAU_Y(q[0], q[1]) > 0) return q; lech *= 0.6; d += (n % 2 ? 1 : -1) * 18 * (n + 1); } return ben0(d, 0); };   // không đứng dưới nước
      for (let i = 0; i < 26; i++) { const [x, z] = ben(d0 + (i < 13 ? -40 - r() * 50 : 20 + r() * 50), (r() < 0.5 ? -1 : 1) * (8 + r() * 30)); A.push([x, z, yf + (r() - 0.5) * 0.4, r() < 0.6 ? 'quy' : 'ban']); }
      for (let i = 0; i < 22; i++) { const [x, z] = ben(d0 + 200 + r() * 220, (r() < 0.5 ? -1 : 1) * (6 + r() * 60)); B.push([x, z, yf + Math.PI + (r() - 0.5) * 0.4, r() < 0.5 ? 'ban' : r() < 0.6 ? 'quy' : 'chay']); }
      // V1.9 (anh Thắng): cuối trận nhiều lính đối phương bị bắn hạ — 16/22 người ngã dần trong cú máy cận (C05-C, 12 s)
      KT.rc = giaoTranh({ dong: true, voice: true, t0: MV.c05_rc - 1, t1: (STORY.scenes.find((c) => c.id === 'C05') || {}).t1 || MV.c05_rc + 25, A, B, sc: KS, chet: 0.75, nga0: 5, nga: 0.5, sau: 60, r: 3000 });
      uNap(A, B, f, yf, KS, 4242);   // V1.9: ụ bê tông, ụ đất cho hai bên nấp
      const cA = V3(...ben(d0 - 150, -40).flatMap((v, i) => (i ? [0, v] : [v]))), cB = V3(...ben(d0 + 300, 0).flatMap((v, i) => (i ? [0, v] : [v])));
      // máy quay hạ thấp sát mặt đất giữa tổ đặc công ở đầu cầu (như các cảnh Thành cổ): rung nhẹ, tiến chậm về phía trước, nhìn về phía đối phương
      const fa = A.slice(13), ca = fa.reduce((v, P) => v.add(V3(P[0], 0, P[1])), V3()).divideScalar(fa.length), cb = B.reduce((v, P) => v.add(V3(P[0], 0, P[1])), V3()).divideScalar(B.length);
      KT.camRC = (u, t) => { const x = ca.x - f.x * (34 - u * 14) + f.z * 7, z = ca.z - f.z * (34 - u * 14) - f.x * 7, n = Math.sin(t * 7.3) * 0.25 + Math.sin(t * 3.1) * 0.35;
        return [V3(x, Math.max(hG(x, z), CAU_Y(x, z), 0.3) + 4.2 + n * 0.4, z), V3(cb.x + n * 2, Math.max(hG(cb.x, cb.z), CAU_Y(cb.x, cb.z)) + 4, cb.z), 46]; }; }
    // GHIM TÊN (anh Thắng 24/11): tên đường năm 1975 dọc tuyến tiến quân (tools/sa_ban/dia_hinh/tuyen_cot.py › duong.ten_cot), tên khí tài khi máy quay ở gần.
    for (const [x, y, ten, k] of (INST.duong && INST.duong.ten_cot) || []) { const L = addLabel(ten, x, -y, 'vil duong', { grp: 'muiten', maxDist: 60000, show: () => KT.cot.some((C) => C.vet.visible && C.k === k) || KT.vet6.some((m) => m.visible) }); L.yFn = () => hG(x, -y) + 300; }
    const ghimXe = (ten, get, dy, xa = 900) => { const L = addLabel(ten, 0, 0, 'hero ly', { grp: 'hero', maxDist: xa }); L.dyn = get; L.dy = dy; };
    const dau = (k) => () => { for (const C of KT.cot) for (const X of C.X) if (X.k === k && X.o.visible) return X.o.position; return null; };
    ghimXe('Xe tăng T-54 (Quân Giải phóng)', dau('TK'), 11); ghimXe('Xe bọc thép K-63 (Quân Giải phóng)', dau('K'), 10); ghimXe('Xe tải chở bộ binh (Quân Giải phóng)', dau('T'), 10);
    ghimXe('Xe tăng đi đầu Lữ đoàn 203 · qua cầu Rạch Chiếc 7 giờ 30', () => (KT.c06rc && KT.c06rc.X[0] && KT.c06rc.X[0].o.visible ? KT.c06rc.X[0].o.position : null), 17, 2500); ghimXe('Pháo M-46 130 mm (Quân Giải phóng, xe kéo)', () => { for (const C of KT.cot) for (const X of C.X) if (X.keo && X.keo.visible) return X.keo.position; return null; }, 9);
    ghimXe('Pháo M-46 130 mm (Quân Giải phóng)', () => { for (const T of KT.td) if (T.on && T.S[0]) return V3(T.S[0].x, T.S[0].y, T.S[0].z); return null; }, 12, 2200);
    for (const D of KT.dons) { const X41 = D.xe.find((X) => /M41/.test(X.ten)), X113 = D.xe.find((X) => /M113/.test(X.ten)), w = (X) => () => X.o.getWorldPosition(V3());
      if (X41) ghimXe('Xe tăng M41 (đối phương)', w(X41), 10, 1400); if (X113) ghimXe('Xe bọc thép M113 (đối phương)', w(X113), 9, 1400); }
  }
  // 23h 29/4: Quân đoàn 3 nhận nhiệm vụ đánh Bộ Tổng tham mưu
  { const bt = LL(BT[0], BT[1]); C05.ten.push(addLabel('Bộ Tổng tham mưu', bt.x, bt.z, 'hero', { grp: 'muiten', yFn: () => 3000, show: () => C05.mt.visible })); }
  C05.mt = muiTen([dd, LL((DD[0] + BT[0]) / 2 + 0.02, (DD[1] + BT[1]) / 2 - 0.02), LL(BT[0], BT[1])].map((v) => V3(v.x, 900, v.z)), 0xd2442b, 380); muiTenDat(C05.mt, false);
  C05.cap = (t) => {
    const on = t >= T0 - 0.5 && t < C05.t1 + 0.5, u = t - T0;
    const on6 = C06.t0 !== undefined && t >= C06.t0 - 0.5 && t < C06.t1 + 0.5;            // C06: cầu Rạch Chiếc vẫn giữ, xe tăng qua cầu 7h30
    C05.vDD.visible = on && t < MV.c05_rc; C05.vRC.visible = (on && t >= MV.c05_rc) || (on6 && t >= MV.c06_rc);
    for (const [v, a] of [[C05.vDD, u], [C05.vRC, t - MV.c05_rc]]) if (v.visible) { const k = (a * 0.5) % 1; v.scale.setScalar(1500 + k * 2500); v.material.opacity = 0.8 * (1 - k); }
    phaoCap(C05.phao, on, MV.c05_phao0 - T0, MV.c05_phao1 - T0, u);                     // 5h30: bắn chuẩn bị
    const cm = (g, a, o = on) => { g.visible = o && a > 0; if (g.visible) g.scale.setScalar(Math.min(1, a / 1.2)); };
    cm(C05.coDD, t - MV.c05_co); cm(C05.coRC, on6 ? 9 : t - MV.c05_rc - 3, on || on6);       // 10h30 cắm cờ Đồng Dù; cờ ở cầu Rạch Chiếc
    muiTenDat(C05.mt, on && t >= MV.c05_btt, sstep(MV.c05_btt, MV.c05_btt + 8, t));         // 23h: nhiệm vụ mới → Bộ Tổng tham mưu
  };
}
// ------------------------------------------------------------------ C08 · BỘ TỔNG THAM MƯU (S1, S5) và C09 · HƯỚNG TÂY – TÂY NAM (S1) — tầng nội đô
// C08: tiến công từ hai phía — Sư đoàn 10 cổng số 1, Trung đoàn 48 cổng số 2, Trung đoàn 28 có xe tăng dẫn đầu vào cổng chính; 11h30 làm chủ.
//      Vị trí từng cổng chưa có nguồn → chỉ vẽ hai mũi tên từ hai phía (phía sân bay, phía Tây Bắc) và cờ ghim lúc 11h30: PHÁC THẢO.
// C09: Trung đoàn 1 Sư đoàn 9 qua Bà Quẹo, Bảy Hiền, theo đường Lê Văn Duyệt hướng Bộ Tư lệnh Biệt khu Thủ đô; một trung đoàn vượt cầu Chữ Y,
//      10h30 đánh chiếm Bộ Tư lệnh Cảnh sát quốc gia. Toạ độ Bà Quẹo, Bảy Hiền, cầu Chữ Y: OSM 2026 (gần đúng); đường mũi tên: PHÁC THẢO.
if ((HCM && TANG === 'noi-do') && MV.c08_tc) {
  const P = (la, lo, dy = 45) => { const v = LL(la, lo); v.y = hG(v.x, v.z) + dy; return v; }, BT = P(MOC.btt[0], MOC.btt[1], 0);
  const mt = (pts, r = 14) => { const m = muiTen(pts.map(([la, lo]) => P(la, lo)), 0xd2442b, r); muiTenDat(m, false); return m; };
  C89.btt = BT;
  C89.m8 = [mt([[10.8098, 106.6560], [10.8062, 106.6630], [MOC.btt[0], MOC.btt[1]]]), mt([[10.8170, 106.6440], [10.8110, 106.6600], [10.8060, 106.6690], [MOC.btt[0] + 0.0004, MOC.btt[1] - 0.0006]])];
  C89.mTay = mt([[10.7915, 106.6380], [10.7932, 106.6532], [10.7870, 106.6640], [10.7805, 106.6780]], 20);
  C89.mNam = mt([[10.7420, 106.6850], [10.7509, 106.6874], [10.7600, 106.6890]], 16);
  const DE = [...((INST.duong && INST.duong.causg_thinghe) || []), ...DUONG_DINH].filter((_, i, a) => i % 6 === 0 || i === a.length - 1);
  C89.mDong = DE.length > 2 ? muiTen(DE.map(([x, y]) => new THREE.Vector3(x, hG(x, -y) + 45, -y)), 0xd2442b, 22) : null; if (C89.mDong) muiTenDat(C89.mDong, false);
  const ten = (s, la, lo, h, fn) => { const v = LL(la, lo); return addLabel(s, v.x, v.z, 'hero', { grp: 'muiten', yFn: () => h, show: fn }); };
  const in9 = () => T >= STORY.scenes.find((c) => c.id === 'C09').t0 && T < STORY.scenes.find((c) => c.id === 'C09').t1;
  ten('Bà Quẹo', 10.7915, 106.6380, 160, in9); ten('Bảy Hiền', 10.7932, 106.6532, 160, in9); ten('Cầu Chữ Y', 10.7509, 106.6874, 140, in9);
  ten('Trung đoàn 1, Sư đoàn 9 · theo đường Lê Văn Duyệt', 10.7840, 106.6720, 260, () => C89.mTay.visible);
  ten('10 giờ 30 · hướng Bộ Tư lệnh Cảnh sát quốc gia', 10.7600, 106.6890, 220, () => C89.mNam.visible);
  ten('Sư đoàn 10 · cổng số 1', 10.8090, 106.6580, 200, () => C89.m8[0].visible); ten('Trung đoàn 48, 28 · từ phía Tây Bắc', 10.8160, 106.6460, 200, () => C89.m8[1].visible);
  // ĐOÀN XE VƯỢT CẦU CHỮ Y (S…: "một trung đoàn vượt cầu Chữ Y" — lời dẫn C09; anh Thắng 24/11: xe đi trên cầu, không lội nước). Tuyến: tim_duong.py trên mạng đường OSM
  // (placement.json › duong.chu_y). Số xe, loại xe: MINH HOẠ.
  { const P = (INST.duong && INST.duong.chu_y) || []; C89.xeCY = [];
    if (P.length > 2 && MV.c09_cy) { const D = duong(P), cy = LL(10.7509, 106.6874); let bd = [1e18, 0]; for (let d = 0; d < D.L; d += 10) { const q = diemTren(D, d), e = (q.x - cy.x) ** 2 + (q.z - cy.z) ** 2; if (e < bd[0]) bd = [e, d]; }
      const tb = tDinh(MV.c09_cy + 4), dB = bd[1];
      for (let k = 0; k < 6; k++) { const lui = k * 24, loai = k % 3 === 0 ? 'k63' : 'tai';
        const X = await xeTao(loai === 'tai' ? 'data/xe/xe-tai.glb' : 'data/xe/xe-boc-thep-k63.glb', { duong: P, lich: [[tb - 60, Math.max(0, dB - 540 - lui)], [tb + 60, Math.min(D.L - 5, dB + 540 - lui)]],
          hien: (t) => T >= S9.t0 && T < S9.t1, ten: loai === 'tai' ? 'Xe tải chở bộ binh' : 'Xe bọc thép K-63' });
        if (XEX.coXe) XEX.coXe(X.obj, 2.2, 1.0); LAYER.xe.push(X.obj); X.loai = loai; C89.xeCY.push(X); }
      DAM.push((t) => { for (const X of C89.xeCY) if (X.obj.visible && ganMay(X.obj.position.x, X.obj.position.z, 900)) { linhTrenXe(X.obj, X.loai, t, 1, 5); buiXe(X.obj, 1, t, 0x9a948a); } }); } }
  // cờ ghim trên Bộ Tổng tham mưu lúc 11h30
  { const tx = new THREE.TextureLoader().load(PU('data/co-mtdtgp.png')); tx.colorSpace = THREE.SRGBColorSpace; const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 60, 6).translate(0, 30, 0), new THREE.MeshLambertMaterial({ color: 0x3a2c1c })),
          new THREE.Mesh(new THREE.PlaneGeometry(30, 20).translate(15, 50, 0), new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide })));
    g.position.copy(BT); g.visible = false; scene.add(g); C89.co = g; }
  const S8 = STORY.scenes.find((c) => c.id === 'C08'), S9 = STORY.scenes.find((c) => c.id === 'C09');
  C89.cap = (t) => { const on8 = t >= S8.t0 && t < S8.t1, on9 = t >= S9.t0 && t < S9.t1, hoi = on9 && t >= MV.c09_hoi;
    muiTenDat(C89.m8[0], (on8 && t >= MV.c08_tc - 1) || hoi, hoi ? 1 : sstep(MV.c08_tc - 1, MV.c08_tc + 5, t));
    muiTenDat(C89.m8[1], (on8 && t >= MV.c08_tc + 2) || hoi, hoi ? 1 : sstep(MV.c08_tc + 2, MV.c08_tc + 9, t));
    muiTenDat(C89.mTay, on9 && t >= MV.c09_tay - 1, sstep(MV.c09_tay - 1, MV.c09_lvd + 4, t));
    muiTenDat(C89.mNam, on9 && t >= MV.c09_cy - 2 && camera.position.y > 220, sstep(MV.c09_cy - 2, MV.c09_cs + 2, t));   // cảnh cận cầu Chữ Y: ẩn mũi tên để thấy đoàn xe
    if (C89.mDong) muiTenDat(C89.mDong, hoi, sstep(MV.c09_hoi, MV.c09_hoi + 8, t));
    C89.co.visible = (on8 && t >= MV.c08_chu) || (t >= S8.t1 && t < S9.t1); if (C89.co.visible) C89.co.scale.setScalar(Math.min(1, (t - MV.c08_chu) / 1.5) || 1); };
}
const HERO_PINS = (HCM && TANG === 'noi-do') ? [['Xe tăng 843 · T-54B', () => (XEX.x843 && XEX.x843.obj.visible ? XEX.x843.obj.position : null)], ['Xe tăng 390 · T-59', () => (XEX.x390 && XEX.x390.obj.visible ? XEX.x390.obj.position : null)],
  ['Đại đội trưởng Bùi Quang Thận', () => (XEX.than && XEX.than.obj.visible ? XEX.than.obj.position : null), 2.3]] : [];
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
        const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const bMat = new THREE.MeshLambertMaterial({ map: tx }), bGeo = new THREE.CircleGeometry(0.6, 24);
        for (const k of ['td57', 'td77']) { if (!TD[k]) continue; const c = TD[k].c, o = g.scene.clone(true); o.scale.setScalar(TD[k].s); scene.add(o); const banh = [];
          for (const z of [3.95, -0.95, -2.6]) for (const sg of [-1, 1]) { const pv = new THREE.Object3D(); pv.position.set(sg * 1.81, 0.63, z); const m = new THREE.Mesh(bGeo, bMat); m.rotation.y = sg * Math.PI / 2; pv.add(m); o.add(pv); banh.push(pv); }
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
      for (const b of X.banh) b.rotation.x = X.v * t / 0.62; }
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
    C['C05-01'] = (u) => { const X = KS.xt && KS.xt[0]; if (!X) return null; const p = X.o.position; return [p.clone().add(V3(-18 + u * 10, 6, 14)), p.clone().add(V3(0, 2, 0)), 46]; };
    C['C05-02'] = tdCam('td57', 35, 9, 0.6, 0.9, 46);
    C['C05-03'] = quanh(tam, 20000, 9000, 3.4, 3.8, 42);
    C['C05-04'] = (u) => { const c = (TD.td77 || TD.td59).c; return [V3(c.x - 180, c.y + 20, c.z + 260), V3(c.x + 1200, c.y + 2600, c.z - 2000), 54]; };
    C['C05-05'] = quanh(tam, 26000, 17000, 3.8, 4.0, 42);
    C['C05-06'] = tdCam('td77', 16, 4, 4.2, 4.6, 50);
    C['C05-07'] = (u) => { const X = KS.xt && (KS.xt[1] || KS.xt[0]); if (!X) return null; const p = X.o.position; return [p.clone().add(V3(10 - u * 8, 3.2, -9)), p.clone().add(V3(0, 1.8, 0)), 48]; };
    C['C05-08'] = quanh(tam, 10000, 3800, 4.0, 4.5, 42, 6000);
    // Cảnh 6
    C['C06-01'] = theoTop((t) => [TOP.find((o) => o.nhieu), 0], 1200, 300, 900, 40);
    C['C06-02'] = theoTop((t) => [TOP.find((o) => o.nhieu), 1], -900, 200, -400, 44);
    C['C06-03'] = tdCam('td79', 30, 8, 0.3, 0.5, 46);
    C['C06-04'] = tdCam('td79', 24, 6, 1.0, 2.0, 48);
    C['C06-05'] = (u) => { const X = KS.xt && (KS.xt[1] || KS.xt[0]); if (!X) return null; const p = X.o.position; return [p.clone().add(V3(16 - u * 12, 5, 12)), p.clone().add(V3(0, 2, 0)), 46]; };
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
if (XEX.ghimND) XEX.ghimND(); for (const f of GHIM_SAU) f();
for (const [text, get, dy] of HERO_PINS) { const L = addLabel(text, 0, 0, 'hero ly', { grp: 'hero', maxDist: 1200 }); L.dyn = get; L.dy = dy || 3.4; }
DAN.dat = (t) => { dongXoa(); TRV.count = 0; BUI.n = 0; if ($('ly-nv').checked) for (const f of DAM) { try { f(t, T); } catch (e) { if (!f.loi) { f.loi = 1; console.error('Lỗi đám đông', e); } } } for (let i = BUI.n; i < BUI.pool.length; i++) BUI.pool[i].visible = false; TRV.instanceMatrix.needsUpdate = true; if (TRV.instanceColor) TRV.instanceColor.needsUpdate = true; dongXong($('ly-nv').checked); };   // mọi đám đông vẽ chung một lượt
//@@ s40

function updateLabels() {
  const w = innerWidth, h = innerHeight, showA = $('ly-lbl').checked, showP = $('ly-pin').checked;
  for (const L of labels) {
    let on = L.cls === 'pin' || L.cls === 'pin done' ? showP : showA;
    if (on && L.show && !L.show()) on = false;
    if (on && L.dyn) { const p = L.dyn(); if (!p) on = false; else { L.x = p.x; L.z = p.z; L.hy = p.y + L.dy; } }
    if (on) {
      const y = L.dyn ? L.hy : L.yFn ? L.yFn() : Math.max(hG(L.x, L.z), tideNow) + 2;
      v3.set(L.x, y, L.z);
      if (v3.distanceTo(camera.position) > L.maxDist) on = false;
      v3.project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) on = false;
      if (on) { L.el.style.left = ((v3.x + 1) / 2) * w + 'px'; L.el.style.top = ((1 - v3.y) / 2) * h - 2 + 'px'; }
    }
    L.el.style.display = on ? '' : 'none';
  }
}
//@@ s41
const VIEWS = (() => {
  const v = (k, d, az, el) => { const [la, lo] = MOC[k]; return [LLx(la, lo), LLz(la, lo), d, az, el]; };
  if (TANG === 'mien-bac') return { all: [0, 0, R * 1.9, 180, 40], hanoi: v('hanoi', 40000, 200, 35), haiphong: v('haiphong', 40000, 200, 35), yenbai: v('yenbai', 30000, 200, 35) };
  return { all: [0, 0, R * 1.9, 180, 40], hoankiem: v('hoankiem', 2500, 200, 30), khamthien: v('khamthien', 1500, 200, 30), longbien: v('longbien', 2500, 200, 30), phulo: v('phulo', 3000, 200, 30) };
})();
{ // 2.2: nút đổi tầng địa hình (tải lại trang ở cùng thời điểm phim)
  const b = document.createElement('button'); b.className = 'tang'; b.textContent = TANG === 'ha-noi' ? '⇄ Toàn miền Bắc' : '⇄ Hà Nội';
  b.title = 'Đổi tầng địa hình (tải lại sa bàn tại cùng thời điểm)'; b.onclick = () => doiTang(TANG === 'ha-noi' ? 'mien-bac' : 'ha-noi', T, playing);
  const vw = $('views'); if (vw) vw.prepend(b);
}
//@@ s42
function drawMinimap() {
  if ($('minimap').hidden || getComputedStyle($('minimap')).display === 'none') return;
  const w = 300, iw = mmImg.width, ih = mmImg.height, s0 = ((HALF - R) / (2 * HALF)), s1 = (2 * R) / (2 * HALF);
  mmx.clearRect(0, 0, w, w); mmx.save(); mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.clip();
  mmx.drawImage(mmImg, s0 * iw, s0 * ih, s1 * iw, s1 * ih, 0, 0, w, w);
  for (const A of anchors.values()) { const [px, py] = mmPx(A.x, A.z); mmx.fillStyle = A.big ? '#d8705a' : 'rgba(226,183,104,.9)'; mmx.fillRect(px - 2.5, py - 2.5, 5, 5); }
  for (const P of pins.values()) { const [px, py] = mmPx(P.x, P.z); mmx.fillStyle = '#d8705a'; mmx.beginPath(); mmx.arc(px, py, 3.5, 0, 7); mmx.fill(); }
  for (const X of XE) if (X.obj.visible) { const [px, py] = mmPx(X.obj.position.x, X.obj.position.z); mmx.fillStyle = '#c0392b'; mmx.fillRect(px - 3, py - 3, 6, 6); }
  const tg = appMode === 'film' && !userCam ? camLook : controls.target;
  const [tx, ty] = mmPx(tg.x, tg.z), [cx, cy] = mmPx(camera.position.x, camera.position.z);
  mmx.strokeStyle = 'rgba(255,240,210,.9)'; mmx.lineWidth = 2; mmx.beginPath(); mmx.moveTo(cx, cy); mmx.lineTo(tx, ty); mmx.stroke();
  mmx.fillStyle = '#e2b768'; mmx.beginPath(); mmx.arc(tx, ty, 5, 0, 7); mmx.fill(); mmx.strokeStyle = '#23190d'; mmx.lineWidth = 1.5; mmx.stroke();
  mmx.restore(); mmx.strokeStyle = 'rgba(222,180,110,.6)'; mmx.lineWidth = 2; mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.stroke();
  mmx.fillStyle = '#e2b768'; mmx.font = 'bold 18px sans-serif'; mmx.textAlign = 'center'; mmx.fillText('B', w / 2, 22);
}
mm.addEventListener('click', (e) => {
  const r = mm.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
  const x = -R + u * 2 * R, z = -R + v * 2 * R; if (Math.hypot(x, z) > R) return;
  flyTo(x, z, clamp(camera.position.distanceTo(controls.target), R * 0.05, R * 1.5));
});
$('mmLeg').textContent = 'Bấm để bay tới · ô vàng: mốc, điểm cao';
//@@ s43
function renderList() {
  $('n-pins').textContent = pins.size; $('n-moves').textContent = moves.size; $('n-all').textContent = pins.size + moves.size;
  const list = $('list'); list.replaceChildren(); const who = (id) => (id && id === myId ? 'Anh' : names[id] || 'Ai đó');
  if (tab === 'pins') {
    const arr = [...pins.entries()].sort((a, b) => (a[1].doc.status === 'xong') - (b[1].doc.status === 'xong') || String(b[1].doc.created).localeCompare(String(a[1].doc.created)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa có ghi chú. Chọn “＋ Ghi chú” rồi bấm lên sa bàn tại chỗ cần góp ý: hướng tiến công, vị trí mục tiêu, đường xe, sai lệch sử liệu…'; list.append(e); }
    for (const [id, P] of arr) {
      const d = P.doc, it = document.createElement('div'); it.className = 'item' + (d.status === 'xong' ? ' done' : '');
      const h = document.createElement('h3'); h.textContent = d.title; const m = document.createElement('div'); m.className = 'meta';
      const chip = document.createElement('span'); chip.className = 'chiplet c-' + d.cat; chip.textContent = CAT[d.cat] || d.cat;
      const sp = document.createElement('span'); sp.textContent = `${who(d.author)} · ${fmtTime(d.updated || d.created)}${d.canh ? ' · ' + d.canh : ''}`;
      m.append(chip, sp); it.append(h, m);
      if (d.text) { const p = document.createElement('p'); p.textContent = d.text; it.append(p); }
      const acts = document.createElement('div'); acts.className = 'acts'; acts.append(btn('Bay tới', () => flyTo(P.x, P.z, 500)), btn('Sửa', () => openDialog(id)), btn(d.status === 'xong' ? 'Mở lại' : 'Đã xử lý', () => toggleDone(id)));
      it.append(acts); list.append(it);
    }
    resolveNames(arr.map(([, P]) => P.doc.author));
  } else {
    const arr = [...moves.values()].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa dời mốc nào. Chọn “✋ Kéo mốc” rồi kéo các mốc vàng tới vị trí đúng.'; list.append(e); }
    for (const d of arr) {
      const it = document.createElement('div'); it.className = 'item mv'; const h = document.createElement('h3'); h.textContent = d.label;
      const m = document.createElement('div'); m.className = 'meta'; m.textContent = `Dời ${Math.round(Math.hypot(d.x - d.from_x, d.z - d.from_z))} m · ${who(d.author)} · ${fmtTime(d.updated)}`;
      const acts = document.createElement('div'); acts.className = 'acts'; acts.append(btn('Bay tới', () => flyTo(d.x, d.z, 500)), btn('Trả về vị trí cũ', () => undoMove(d.name)));
      it.append(h, m, acts); list.append(it);
    }
    resolveNames(arr.map((d) => d.author));
  }
}
$('export').onclick = async () => {
  const out = { du_an: 'Sa bàn Chiến dịch Hồ Chí Minh 1975', tang: TANG, xuat_luc: nowIso(), goc_toa_do: [META.lat0, META.lon0],
    ghi_chu: [...pins.values()].map((P) => ({ loai: CAT[P.doc.cat], tieu_de: P.doc.title, noi_dung: P.doc.text, trang_thai: P.doc.status, canh: P.doc.canh, lat: P.doc.lat, lon: P.doc.lon, x: P.doc.x, z: P.doc.z })),
    moc_da_doi: [...moves.values()].map((d) => ({ moc: d.name, ten: d.label, tu: [d.from_lat, d.from_lon], den: [d.lat, d.lon], do_dich_m: Math.round(Math.hypot(d.x - d.from_x, d.z - d.from_z)) })) };
  const txt = JSON.stringify(out, null, 1);
  try { await navigator.clipboard.writeText(txt); $('export').textContent = 'Đã sao chép ✓'; setTimeout(() => ($('export').textContent = 'Sao chép dữ liệu review (JSON)'), 2000); }
  catch (e) { const ta = document.createElement('textarea'); ta.id = 'copybox'; ta.value = txt; ta.readOnly = true; $('list').prepend(ta); ta.focus(); ta.select(); }
};
$('revbtn').onclick = () => { const open = $('review').hidden; $('review').hidden = !open; $('revbtn').setAttribute('aria-pressed', open); if (open) $('info').hidden = true; };
$('revx').onclick = () => { $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); };
//@@ s44
// ĐI BỘ TRÊN SA BÀN (anh Thắng V1.2): người xem xuống đi bộ trong vai một chiến sĩ Quân Giải phóng (mẫu lính Thành cổ), phím W A S D / cần ảo, Shift để chạy
function setWalk(on) {
  W.on = on; document.body.classList.toggle('walking', on);
  $('bwalk').classList.toggle('on', on); $('bwalk').textContent = on ? '🚶 Đang đi bộ · thoát' : '🚶 Xuống đi bộ';
  $('joy').hidden = !on; $('runbtn').hidden = !on; $('walkhelp').hidden = !on; const hp = document.querySelector('#explorebar .help'); if (hp) hp.hidden = on;
  if (on) {
    setUiMode('view'); flyA = null; setAuto(false); controls.enablePan = false;
    let x = controls.target.x, z = controls.target.z;
    if (KS.diBo && (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30 || hG(x, z) < tideNow + 0.5)) { [x, z] = KS.diBo; } else if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { if (XEX.DL) { const [a, b] = XEX.DL(0, 175); x = a; z = -b; } else { x = SG.x; z = SG.z; } }
    W.boat = false;
    const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z; W.yaw = Math.atan2(-dx, -dz);
    placeAvatarAt(x, z); controls.target.copy(W.pos).add(V3(0, 2.4, 0));
    camera.position.copy(controls.target).add(V3(-Math.sin(W.yaw) * 9, 2.2, -Math.cos(W.yaw) * 9)); setPovWalk();
  } else { W.keys = {}; W.joy.x = W.joy.y = 0; controls.enablePan = true; controls.minDistance = 4; controls.maxDistance = 40000; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.47; flyTo(W.pos.x, W.pos.z, (HCM && TANG === 'noi-do') ? 400 : 6000); }
}
DAM.push(() => { if (!W.on || W.fp) return; const tt = performance.now() / 1000; W.boat = false;   // nhân vật đi bộ (vẽ cùng đám đông)
  dongDat('qgpA', W.moving ? (W.runNow ? 'chay' : 'di') : 'dung', W.moving ? tt * (W.runNow ? 7 / 4.0 : 2 / 1.07) : tt, 0, W.pos.x, Math.max(W.pos.y, CAU_Y(W.pos.x, W.pos.z)), W.pos.z, W.yaw, 1, 0); });
//@@ s45
function drawAvatar() {}
// V1.6 (Khe Sanh: "nhân vật chạy đi lại trong bảo tàng"): bản nền HCM thiếu bộ nghe phím W A S D / mũi tên và cần ảo cho chế độ đi bộ — chép từ gói Như Nguyệt
addEventListener('keydown', (e) => { if (W.on && !(e.target.closest && e.target.closest('input, select, textarea'))) { W.keys[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); } });
addEventListener('keyup', (e) => { W.keys[e.code] = false; });
{
  const jb = $('joy'), jk = jb.querySelector('span'); let id = null;
  const move = (e) => { if (e.pointerId !== id) return; const r = jb.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } W.joy.x = x; W.joy.y = y; jk.style.transform = `translate(${x * 38}px,${y * 38}px)`; };
  jb.addEventListener('pointerdown', (e) => { id = e.pointerId; jb.setPointerCapture(id); e.preventDefault(); move(e); });
  jb.addEventListener('pointermove', move);
  const end = () => { id = null; W.joy.x = W.joy.y = 0; jk.style.transform = ''; }; jb.addEventListener('pointerup', end); jb.addEventListener('pointercancel', end);
}
//@@ s46
// GÓC NHÌN NHÂN VẬT (anh Thắng V1.2): nhìn qua mắt nhân vật đang có trong cảnh, hoặc đứng xem tại một địa điểm; kéo màn hình để quay đầu, phim vẫn chạy
const mat3 = (o, dx, dy, dz) => { if (!o || !o.visible) return null; const y = o.rotation.y, c = Math.cos(y), s = Math.sin(y); return { p: V3(o.position.x + dx * c + dz * s, o.position.y + dy, o.position.z - dx * s + dz * c), yaw: y }; };
const POV_VAI = (HCM && TANG === 'noi-do') ? [
  ['Trưởng xe tăng 843 (trên tháp pháo)', () => (XEX.x843 && XEX.tDinh < 115 ? mat3(XEX.x843.obj, 0.35, 3.25, -0.2) : null)],
  ['Trưởng xe tăng 390 (trên tháp pháo)', () => (XEX.x390 ? mat3(XEX.x390.obj, 0.35, 3.25, -0.2) : null)],
  ['Bộ binh ngồi trên xe tăng 390', () => (XEX.x390 && XEX.tDinh < 89 ? mat3(XEX.x390.obj, -0.7, 2.95, -1.7) : null)],
  ['Bộ binh ngồi trên xe tải giữa đoàn xe', () => { const d = XEX.doan && XEX.doan.find((d) => d.k >= 4 && d.loai === 'tai' && d.X.obj.visible); return d && XEX.tDinh < 93 ? mat3(d.X.obj, 0.05, 3.05, -0.3) : null; }],
  ['Đại đội trưởng Bùi Quang Thận', () => (XEX.than && XEX.than.obj.visible ? { p: XEX.than.obj.position.clone().add(V3(0, 1.62, 0)), yaw: XEX.than.obj.rotation.y } : null)],
  ['Phi công A-37 dẫn đầu (Phi đội Quyết Thắng)', () => (C04.bay && C04.bay[0].o.visible ? mat3(C04.bay[0].o, 0, 1.4, 1.5) : null)],
  ['Trưởng xe tăng T-54 tiến vào Tân Sơn Nhất', () => (C07.tang && C07.tang[0] ? mat3(C07.tang[0].obj, 0.35, 3.25, -0.2) : null)],
] : [
  ['Trưởng xe tăng đi đầu Lữ đoàn 203 (cầu Rạch Chiếc)', () => (KT.c06rc && KT.c06rc.X[0] ? mat3(KT.c06rc.X[0].o, 0.45 * 3, 3.3 * 3, -0.2 * 3) : null)],
  ['Bộ binh ngồi trên xe tải trong đoàn quân', () => { for (const C of KT.cot) for (const X of C.X) if (X.k === 'T' && X.o.visible) return mat3(X.o, 0.78 * 3, 2.6 * 3, -1.4 * 3); return null; }],
  ['Pháo thủ trận địa M-46', () => { const Tt = KT.td.find((x) => x.on); if (!Tt) return null; const P = Tt.N[1]; return { p: V3(P[0], P[1] + 1.6 * 2.6, P[2]), yaw: P[3] }; }],
  ['Đặc công giữ cầu Rạch Chiếc', () => { const o = KT.rc; if (!o || T < o.t0 - 0.5 || T > o.t1 + 20) return null; const P = o.A[16]; const x = P[6] ?? P[0], z = P[7] ?? P[1]; return { p: V3(x, Math.max(hG(x, z), CAU_Y(x, z)) + 1.5 * 3, z), yaw: P[2] }; }],
];
const POV_DD = (HCM && TANG === 'noi-do') ? (() => { const D = XEX.DL || ((a, b) => [0, 0]), h = XEX.hDinh || 0, P = (a, b) => { const [x, y] = D(a, b); return [x, -y]; };
  const tn = LL(MOC.thinghe[0], MOC.thinghe[1]), cs = LL(MOC.causg[0], MOC.causg[1]), dinh = P(0, 0);
  return [['Trước cổng Dinh Độc Lập', ...P(6, 185), 1.6, dinh], ['Trên nóc Dinh Độc Lập', ...P(3, -1), 27.5 + 1.6, P(0, 160)], ['Đầu cầu Thị Nghè', tn.x + 30, tn.z + 30, 1.6, [cs.x, cs.z]],
    ['Khu đỗ máy bay Tân Sơn Nhất', ...(C04.tam ? [C04.tam[0] + 60, -C04.tam[1] + 40] : [0, 0]), 1.6, C04.tam ? [C04.tam[0], -C04.tam[1]] : [0, 0]]]; })()
  : (() => { const P = (k) => LL(MOC[k][0], MOC[k][1], 0);   // đứng xem (Hà Nội 1972)
      const L = TANG === 'ha-noi' ? [['Bên Hồ Hoàn Kiếm', P('hoankiem').x + 120, P('hoankiem').z + 60, 3, [P('hoankiem').x, P('hoankiem').z]], ['Đầu cầu Long Biên', P('longbien').x - 400, P('longbien').z + 120, 12, [P('longbien').x, P('longbien').z]],
        ['Phố Khâm Thiên', P('khamthien').x, P('khamthien').z, 3, [P('khamthien').x + 200, P('khamthien').z]], ['Trận địa Tiểu đoàn 77 (Chèm)', P('td77').x + 60, P('td77').z + 60, 3, [P('td77').x, P('td77').z]]]
        : [['Trên trời Hà Nội', P('hanoi').x, P('hanoi').z, 3000, [P('hanoi').x + 20000, P('hanoi').z]]];
      return L.filter((q) => Math.hypot(q[1], q[2]) < R * 0.95); })();
//@@ s47
function povTick() {
  let E = null;
  if (POV.dd >= 0) { const [, x, z, h, M] = POV_DD[POV.dd]; const y = (h > 20 && (HCM && TANG === 'noi-do') ? (XEX.hDinh || 0) : Math.max(hG(x, z), CAU_Y(x, z), tideNow)) + h; E = { p: V3(x, y, z), yaw: Math.atan2(M[0] - x, M[1] - z) }; }
  else E = POV_VAI[POV.sel] ? POV_VAI[POV.sel][1]() : null;
  $('povmsg').textContent = E ? 'Kéo màn hình để quay đầu nhìn quanh · phim vẫn chạy theo lời dẫn' : 'Nhân vật này không có trong cảnh hiện tại · đang xem góc máy của phim';
  if (!E) { POV.has = false; return false; }
  if (POV.has) POV.eye.lerp(E.p, 0.35); else POV.eye.copy(E.p); POV.has = true;
  const yw = E.yaw + POV.yaw, cp = Math.cos(POV.pitch);
  camera.position.copy(POV.eye); camLook.set(POV.eye.x + Math.sin(yw) * cp * 5, POV.eye.y + Math.sin(POV.pitch) * 5, POV.eye.z + Math.cos(yw) * cp * 5);
  camera.lookAt(camLook); if (camera.fov !== 60) { camera.fov = 60; camera.updateProjectionMatrix(); }
  return true;
}
//@@ s48
const SCENE_FACTS = {};
async function fillDocs() {
  const el = $('docsbody'); if (el.dataset.ok) return; el.dataset.ok = '1';
  try {
    const S = await (await fetch('sources.json')).json();
    el.innerHTML = '<p><b>Tái dựng mô phỏng.</b> ' + S.reconstruction.replace(/</g, '&lt;') + '</p><ol>' + S.sources.map((s) => `<li><b>${s.id}</b> · ${s.title.replace(/</g, '&lt;')} <small>(${s.type})</small>${s.url ? ` · <a href="${s.url}" target="_blank" rel="noopener">mở nguồn</a>` : ''}<br><small>${(s.used_for || '').replace(/</g, '&lt;')}</small></li>`).join('') + '</ol>';
  } catch (e) { el.textContent = 'Chưa tải được danh sách nguồn.'; }
}
//@@ s49
// âm thanh nền, hiệu ứng (kho _KHO-CHUNG/nhac-nen: tiengdong.com; Epidemic Sound; tiếng pháo "daibac" dùng lại của gói Ngọc Hồi – Đống Đa)
const HCM_BED = ['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua', 'maybaynb'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang', 'bomroi', 'coibd', 'nongan'];   // Khe Sanh: chỉ các tệp có trong gói
// bản Artifact: AudioContext, bộ đệm tiếng, vòng lặp nền, hai thẻ nhạc nằm ở trang khung ngoài → nhạc, hiệu ứng chạy liền khi đổi tầng (iframe thay mới)
const KHUNG = (() => { try { return window.parent !== window && window.parent.__voxA ? window.parent : null; } catch (e) { return null; } })();
// bản Artifact: tầng địa hình kế tiếp được nạp sẵn trong một khung ẩn (#cho=1) ~35 s trước khi đổi tầng → đổi tầng không còn màn tải (anh Thắng 24/11)
const CHO = { on: QS.get('cho') === '1' };
const MAY_MANH = false;   // V1.5: không nạp sẵn tầng kế tiếp (đơ hình khi đổi tầng). Cũ:   // V1.5: chỉ máy ≥ 8 GB mới nạp sẵn tầng kế tiếp (hai sa bàn cùng lúc dễ tràn bộ nhớ đồ hoạ)
window.__amChung = () => { if (!KHUNG) return null;
  if (!KHUNG.__AMS) { const ctx = new (KHUNG.AudioContext || KHUNG.webkitAudioContext)(), out = ctx.createGain(), sfx = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination); sfx.connect(out);
    KHUNG.__AMS = { K: KHUNG, ctx, out, sfx, buf: {}, beds: {}, ready: false, deck: null, cur: 0 }; }
  return KHUNG.__AMS; };
function amPlan(i, u) {                                                                    // mức âm nền theo hồi và mốc câu đọc
  const id = SC[i] && SC[i].id, t = T;
  const gan = (() => { const X = XEX.x843; if (!X || !X.obj.visible) return 0; return clamp(1 - camera.position.distanceTo(X.obj.position) / 260, 0, 1); })();
  if (!HCM && KS.amPlan) return KS.amPlan(id, t, u);
  switch (id) {
    case 'C01': return { gio: 0.32 };
    case 'C02': return { gio: 0.28 };
    case 'C03': return { gio: 0.18, ak47: t > MV.c03_phao0 ? 0.1 : 0 };
    case 'C04': return { gio: 0.14 };
    case 'C05': return { gio: 0.18, ak47: t > MV.c05_rc - 1 ? 0.42 : t > MV.c05_phao0 && t < MV.c05_co ? 0.14 : 0 };
    case 'C06': return { gio: 0.16, xetang: t > MV.c06_tc ? 0.22 : 0 };
    case 'C07': return { ak47: 0.26, xetang: 0.22 };
    case 'C08': return { ak47: 0.26, xetang: t > MV.c08_xt ? 0.3 : 0.08 };
    case 'C09': return { ak47: 0.16, gio: 0.12 };
    case 'C10': return { xetang: 0.22 + gan * 0.55, ak47: t > MV.c10_cau && t < MV.c10_hx ? 0.3 : t > MV.c10_tn && t < MV.c10_tn + 6 ? 0.15 : 0, reoho: t > MV.c10_tn + 6 ? 0.32 : 0 };   // dân reo hò hai bên đường
    case 'C11': return { xetang: t < MV.c11_thao ? 0.22 + gan * 0.55 : 0.1, reoho: t > MV.c11_keo + 1 ? 0.3 : t < MV.c11_843 ? 0.22 : 0 };
    case 'C12': return { reoho: t > MV.c12_dan - 2 ? 0.45 : 0.2, gio: t > MV.c12_ket ? 0.16 : 0 };
  }
  return {};
}
// tiếng pháo, tiếng nổ lặp lại trong khoảng mốc: [mốc đầu, mốc cuối, tệp, âm lượng, cách tối thiểu, ngẫu nhiên thêm]
const AM_LAP = () => !HCM ? (KS.amLap ? KS.amLap() : []) : [[MV.c01_phao0, MV.c01_phao1, 'daibac', 0.32, 1.1, 1.6], [MV.c03_phao0, MV.c03_phao1, 'daibac', 0.36, 0.9, 1.4], [MV.c05_phao0, MV.c05_phao1, 'daibac', 0.36, 0.9, 1.4],
  [MV.c06_phao, MV.c06_rc + 3, 'no', 0.32, 0.8, 1.2], [MV.c07_tc, MV.c07_chu, 'no', 0.3, 1.2, 2.2], [MV.c08_tc, MV.c08_chu, 'no', 0.26, 1.6, 2.4], [MV.c09_tay, MV.c09_cs, 'no', 0.2, 2.0, 3.0], [MV.c05_rc, MV.c05_rc + 16, 'no', 0.45, 1.6, 1.4], [MV.c10_cau, MV.c10_m48 + 5, 'no', 0.3, 1.8, 1.6]];
// tiếng theo đúng câu đọc: [giây voice, tệp, âm lượng]
const AM_MOC = () => !HCM ? (KS.amMoc ? (AM_MOC.c && AM_MOC.ct === Math.round(T / 2) ? AM_MOC.c : (AM_MOC.ct = Math.round(T / 2), AM_MOC.c = KS.amMoc())) : []) : [[MV.c04_bom - 5, 'vut', 0.7], ...Array.from({ length: 8 }, (_, n) => [MV.c04_bom + n * 0.55, 'no', 0.75]), [MV.c10_m48 + 0.5, 'daibac', 0.5], [MV.c10_m48 + 1.6, 'daibac', 0.6], [MV.c10_m48 + 2.1, 'no', 0.55], [MV.c10_m48 + 4.2, 'daibac', 0.5], [MV.c10_m48 + 4.6, 'no', 0.5], [MV.c10_tn + 0.8, 'daibac', 0.5], [MV.c10_tn + 2.2, 'daibac', 0.6], [MV.c10_tn + 2.6, 'no', 0.6], [MV.c10_tn + 4.2, 'daibac', 0.5], [MV.c10_tn + 4.6, 'no', 0.55],
  ...[5, 9, 13, 17.5, 22, 26].flatMap((d) => [[MV.c07_tc + d, 'daibac', 0.6], [MV.c07_tc + d + 0.4, 'no', 0.7]]), [MV.c10_ban + 0.6, 'daibac', 0.85], [MV.c10_ban + 1.1, 'no', 0.9], [MV.c10_ban + 1.3, 'lua', 0.5], [MV.c10_tn + 2, 'daibac', 0.55], [MV.c11_ram, 'no', 0.85], [MV.c11_ram + 0.1, 'lua', 0.35],
  [MV.c11_cham, 'no', 0.95], [MV.c11_cham + 0.15, 'lua', 0.45], [MV.c11_keo - 9, 'dang', 0.35], [MV.c11_keo + 0.5, 'votay', 0.6], [MV.c12_dan + 3, 'coi', 0.25], [MV.c12_dan + 9, 'coi', 0.2], [MV.c12_dan, 'votay', 0.55]];
// TIẾNG TỔNG HỢP (không tải tệp): tiếng phản lực A-37 và tiếng động cơ xe tải — tạo bằng nhiễu lọc, vòng lặp liền
const AM_TONG = {
  maybay: (ctx) => { const sr = ctx.sampleRate, n = sr * 4, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let l1 = 0, l2 = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; l1 += 0.06 * (w - l1); l2 += 0.5 * (w - l2); const t = i / sr;
      d[i] = (l1 * 2.6 + (w - l2) * 0.35 + Math.sin(2 * Math.PI * (2900 + 40 * Math.sin(t * 3)) * t) * 0.05) * 0.8; }
    for (let i = 0; i < 2000; i++) { const k = i / 2000; d[i] = d[i] * k + d[n - 2000 + i] * (1 - k); } return b; },
  trucan: (ctx) => { const sr = ctx.sampleRate, n = sr * 2, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let l1 = 0;   /* trực thăng: nhiễu trầm đập theo nhịp cánh quạt ~5,5 lần/giây */
    for (let i = 0; i < n; i++) { const t = i / sr, w = Math.random() * 2 - 1; l1 += 0.05 * (w - l1); const nh = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * 5.5 * t), 6); d[i] = (l1 * 3.2 * (0.25 + nh) + Math.sin(2 * Math.PI * 55 * t) * 0.08) * 0.9; }
    return b; },
  oto: (ctx) => { const sr = ctx.sampleRate, n = sr * 3, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let br = 0, lp = 0;
    for (let i = 0; i < n; i++) { const t = i / sr, w = Math.random() * 2 - 1; br = (br + 0.02 * w) * 0.995; const f = 36, ph = (t * f) % 1;
      const x = (ph * 2 - 1) * 0.5 + Math.sin(2 * Math.PI * f * 2 * t) * 0.3 + br * 6; lp += 0.08 * (x - lp); d[i] = lp * (0.75 + 0.25 * Math.sin(2 * Math.PI * 9 * t)) * 0.9; }
    return b; } };
async function amLoad() {
  const S = window.__amChung(); if (S && S.ready) { AM.ready = true; return; }
  for (const n of Object.keys(AM_TONG)) AM.buf[n] = AM_TONG[n](AM.ctx);
  await Promise.all([...HCM_BED, ...HCM_ONE].filter((n) => !AM_TONG[n]).map(async (n) => { try { const r = await fetch(PU('am/' + n + '.mp3')); AM.buf[n] = await AM.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn('âm thanh', n, e); } }));
  for (const n of HCM_BED) { if (!AM.buf[n]) continue; const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.sfx); s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g; }
  AM.ready = true; if (S) S.ready = true;
}
async function amPrefetch() {}
const THE_EL = () => THE_EL.el || (THE_EL.el = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;right:0;top:30%;z-index:20;text-align:center;pointer-events:none;color:#f4e6c4;text-shadow:0 2px 14px #000c,0 0 2px #000';
  d.innerHTML = '<div style="font:600 clamp(16px,2.2vw,26px)/1.2 system-ui;letter-spacing:.18em;color:#e9b44c"></div><div style="font:800 clamp(26px,4.4vw,58px)/1.12 system-ui;margin-top:.25em;padding:0 6vw"></div>'; d.style.display = 'none'; document.body.append(d); return d; })());
//@@ s50
const amThem = (p) => { p = { ...p }; const cp = camera.position;                          // tiếng máy bay, tiếng đoàn xe theo khoảng cách máy quay
  if (C04.bay) { let g = 0; for (const B of C04.bay) if (B.o.visible) g = Math.max(g, 1 - cp.distanceTo(B.o.position) / 1800); p.maybay = Math.max(p.maybay || 0, 0.6 * clamp(g, 0, 1)); }
  let xe = 0; const gan = (o, r) => { if (o && o.visible) xe = Math.max(xe, 1 - cp.distanceTo(o.position) / r); };
  if (KT.cot) for (const C of KT.cot) if (T >= C.t0 && T < C.t1) for (const X of C.X) gan(X.o, 1500);
  if (XEX.doan) for (const d of XEX.doan) gan(d.X.obj, 450); for (const L of [C07.xe, C07.tang, C89.xeCY]) if (L) for (const X of L) gan(X.obj, 450);
  if (XEX.tDinh < 90) for (const X of [XEX.x843, XEX.x390]) if (X) gan(X.obj, 450);                // xe tăng 843, 390 đang chạy
  xe = clamp(xe, 0, 1); p.oto = Math.max(p.oto || 0, 0.85 * xe); p.xetang = Math.max(p.xetang || 0, 0.7 * xe); if (!HCM && KS.amThem) p = KS.amThem(p, cp); return p; };   // anh Thắng V1.2: có xe chạy là có tiếng nổ máy
function amTick(dt) {
  if (!AM.ready || !AM.on) { AM.prevT = T; return; }
  const live = (appMode === 'film' && playing) || appMode === 'explore', i = sceneIdx(T), sc = SC[i], u = clamp((T - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const plan = amThem(amPlan(i, u)), k = live ? 1 : 0.15, now = AM.ctx.currentTime, duck = voxNoi() ? (HCM ? 0.75 : 0.45) : (HCM ? 1 : 0.8);
  for (const n in AM.beds) AM.beds[n].gain.setTargetAtTime((plan[n] || 0) * k * duck, now, 0.6);
  if (live && appMode === 'film' && T > AM.prevT && T - AM.prevT < 1) {
    for (const [tc, n, v] of AM_MOC()) if (tc > AM.prevT && tc <= T) amShot(n, v);
    const tt = performance.now() / 1000;
    AM_LAP().forEach(([a, b, n, v, g, r], j) => { if (!(T >= a && T <= b)) return; if (!(j in AM.next)) AM.next[j] = tt + Math.random() * g; if (tt >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = tt + g + Math.random() * r; } });
  }
  if (!HCM && AM.sfx) AM.sfx.gain.setTargetAtTime(voxNoi() ? 0.42 : 0.75, AM.ctx.currentTime, 0.3);   /* V2.0: tiếng nổ / bắn từng phát nhỏ lại khi voice đang đọc */
  AM.prevT = T;
}
// ------------------------------------------------------------------ nhạc nền theo hồi (Epidemic Sound, kho chung _KHO-CHUNG/nhac-nen; bản nén dùng lại của gói Bạch Đằng)
// V1.9: 'hiep-si' 35 s đầu rất nhỏ (−25…−35 dB) → đầu Hồi 2 (1:41–2:12) gần như chỉ có voice; Hồi 2 vào nhạc từ giây 50 (đoạn đầy)
const NHAC = { C01: ['thuc-day', 0, 0.34], C02: ['hiep-si', 50, 0.42], C03: ['giua-tran', 0, 0.34], C04: ['quyet-chien', 0, 0.34], C05: ['ke-thu', 0, 0.34], C06: ['giua-tran', 40, 0.36],
  C07: ['quyet-chien', 20, 0.32], C08: ['ke-thu', 50, 0.32], C09: ['thuc-day', 30, 0.32], C10: ['quyet-chien', 0, 0.38], C11: ['hiep-si', 100, 0.4], C12: ['vi-thanh', 0, 0.46] };
// V1.9 (anh Thắng): khi voice đọc tới mốc ngày giờ, hiện chữ ngày giờ ở bên phải màn hình (cỡ chữ co theo màn hình, điện thoại vẫn cân đối).
// Mốc lấy đúng giây câu đọc (story.json › subs); dòng nhỏ tóm tắt câu đọc đó.
// chữ ngày giờ (V1.9): mỗi hồi hiện một mốc sau thẻ hồi; ngày theo bảng mốc docs/KHE_SANH_1968_TU_LIEU.md mục 2. Khi có voice: đặt theo câu đọc (GĐ5)
const NGAY_HOI = { C01: ['', 'Tháng 12.1972', 'Hà Nội mùa đông'], C02: ['', '18 – 29.12.1972', 'Chiến dịch Linebacker II'], C03: ['', 'Tháng 12.1972', 'Thế trận phòng không Hà Nội'],
  C04: ['Tối', '18.12.1972', 'Đêm đầu tiên'], C05: ['Đêm 20, rạng sáng', '21.12.1972', 'Bẻ gãy những đợt tập kích'], C06: ['', '18 – 29.12.1972', 'Đấu trí trong màn nhiễu'],
  C07: ['Đêm', '26.12.1972', 'Phố Khâm Thiên'], C08: ['Đêm', '26.12.1972', 'Trận đánh quyết liệt'], C09: ['Đêm', '27 và 28.12.1972', 'MiG-21 xuất kích'],
  C10: ['', '29 – 30.12.1972', 'Đêm cuối cùng'], C11: ['', '18 – 29.12.1972', 'Chiến thắng và mất mát'], C12: ['', '27.1.1973', 'Hiệp định Paris được ký kết'] };
const MOC_NGAY = { L: STORY.scenes.filter((c) => NGAY_HOI[c.id]).map((c) => { const [g, d, x] = NGAY_HOI[c.id]; return [c.t0 + 5.5, (g ? g + ' · ' : '') + d, x]; }),
  el: null, cur: -1,
  tick() { if (!this.el) { const st = document.createElement('style');
      st.textContent = '#mocNgay{position:fixed;right:max(16px,2.2vw);top:34%;transform:translateY(-50%);max-width:min(46vw,380px);text-align:right;pointer-events:none;z-index:30;opacity:0;transition:opacity .8s;color:#fff4dc;text-shadow:0 2px 10px rgba(0,0,0,.75),0 0 2px rgba(0,0,0,.9)}#mocNgay.on{opacity:1}#mocNgay u{display:block;text-decoration:none;font-size:clamp(15px,1.9vw,24px);font-weight:700;color:#f0c040;white-space:nowrap}#mocNgay b{display:block;font-size:clamp(22px,3.2vw,42px);font-weight:800;letter-spacing:.02em;line-height:1.1;white-space:nowrap}#mocNgay i{display:block;margin-top:6px;padding-top:6px;border-top:2px solid #f0c040;font-style:normal;font-size:clamp(12px,1.35vw,17px);line-height:1.3;color:#f6e7c4}@media (max-width:700px){#mocNgay{top:auto;bottom:44%;transform:none;max-width:72vw;background:rgba(24,19,14,.62);padding:8px 12px;border-radius:12px}}';
      document.head.append(st); this.el = document.createElement('div'); this.el.id = 'mocNgay'; this.el.innerHTML = '<u></u><b></b><i></i>'; document.body.append(this.el); }
    let k = -1; if (appMode === 'film') for (let i = 0; i < this.L.length; i++) if (T >= this.L[i][0] - 0.2 && T < this.L[i][0] + 6.5) k = i;
    if (k !== this.cur) { this.cur = k; if (k >= 0) { const [g, d] = this.L[k][1].includes(' · ') ? this.L[k][1].split(' · ') : ['', this.L[k][1]]; this.el.querySelector('u').textContent = g; this.el.querySelector('b').textContent = d; this.el.querySelector('i').textContent = this.L[k][2]; } this.el.classList.toggle('on', k >= 0); } } };
const NHAC_DUR = { 'hiep-si': 231.2, 'ke-thu': 130.2, 'thuc-day': 118.5, 'tro-ve': 105.1, 'giua-tran': 146.4, 'quyet-chien': 97, 'vi-thanh': 114.7 };
const NHAC_KS = { C01: ['thuc-day', 0, 0.3], C02: ['ke-thu', 0, 0.36], C03: ['giua-tran', 0, 0.32], C04: ['quyet-chien', 0, 0.34], C05: ['ke-thu', 50, 0.34], C06: ['giua-tran', 40, 0.3],
  C07: ['tro-ve', 0, 0.3], C08: ['quyet-chien', 20, 0.36], C09: ['hiep-si', 50, 0.38], C10: ['giua-tran', 0, 0.32], C11: ['tro-ve', 0, 0.32], C12: ['vi-thanh', 0, 0.44] };   // nhạc theo cảnh (dùng lại nhạc gói HCM / Khe Sanh, MINH HOẠ, anh duyệt lại)   // nhạc theo hồi Khe Sanh (MINH HOẠ, anh duyệt lại)
const nhacCua = (i) => (HCM ? NHAC : NHAC_KS)[SC[i].id] || ['thuc-day', 0, 0.3];
const MU = {
  deck: [], cur: 0,
  init() {
    const S = window.__amChung(); this.S = S; if (S && S.deck) { this.deck = S.deck; this.cur = S.cur || 0; return; }
    for (let k = 0; k < 2; k++) {
      const el = S ? new S.K.Audio() : new Audio(); el.preload = 'auto'; el.loop = true; el.crossOrigin = 'anonymous';
      const g = AM.ctx.createGain(); g.gain.value = 0;
      try { AM.ctx.createMediaElementSource(el).connect(g); g.connect(AM.out); } catch (e) { el.volume = 0; }
      this.deck.push({ el, g, ch: -1, f: '', seek: null });
    }
    if (S) S.deck = this.deck;
  },
  pos(i) { const [f, off] = nhacCua(i), d = NHAC_DUR[f]; return (off + Math.max(0, T - SC[i].t0)) % d; },
  tick() {
    if (!this.deck.length) return;
    const now = AM.ctx.currentTime, film = appMode === 'film', on = !$('ly-nhac') || $('ly-nhac').checked;
    const live = AM.on && on && ((film && playing) || appMode === 'explore');
    const i = sceneIdx(T), [f, , vol] = nhacCua(i);
    let D = this.deck[this.cur];
    if (D.ch !== i) {                                                                      // đổi hồi → chuyển nhạc mượt
      if (D.f === f && Math.abs((D.el.currentTime || 0) - this.pos(i)) < 3) D.ch = i;
      else { D.g.gain.setTargetAtTime(0, now, 0.7); this.cur = 1 - this.cur; D = this.deck[this.cur];
        if (D.f !== f) { D.f = f; D.el.src = new URL(PU('nhac/' + f + '.mp3'), location.href).href; } D.ch = i; D.seek = this.pos(i); D.g.gain.setValueAtTime(0, now); }
      if (this.S) this.S.cur = this.cur;
    }
    const other = this.deck[1 - this.cur];
    if (other.g.gain.value < 0.01 && !other.el.paused) other.el.pause();
    if (D.seek !== null && D.el.readyState >= 1) { try { D.el.currentTime = D.seek; } catch (e) {} D.seek = null; }
    if (live) {
      if (D.el.paused) D.el.play().catch(() => {});
      D.el.playbackRate = film ? clamp(speed, 0.5, 2) : 1;
      const p = this.pos(i); if (D.seek === null && D.el.readyState >= 1 && Math.abs(D.el.currentTime - p) > 3) D.el.currentTime = p;
      D.g.gain.setTargetAtTime(Math.min(0.75, vol * 1.45) * (voxNoi() ? (HCM ? 0.72 : 0.5) : 1), now, 0.8);
    } else { D.g.gain.setTargetAtTime(0, now, 0.25); if (D.g.gain.value < 0.01 && !D.el.paused) D.el.pause(); }
  },
};
// ------------------------------------------------------------------ VOICE THU ÂM là đồng hồ chính của phim (quy trình gắn voice, docs dự án)
// Một tệp voice chạy suốt phim; đang phát thì giây phim bám theo giây voice; voice chưa tải / bị chặn / tắt lời bình thì phim tự đếm giờ.
// Trình duyệt chặn tiếng khi trang vừa mở (cả lúc tải lại để đổi tầng địa hình) → dừng phim, hiện nút "Tiếp tục cùng lời dẫn".
const VOX = { a: null, ok: false, fail: false, cho: false };
function voxNoi() { const a = VOX.a; return !!(a && !a.paused && !a.ended); }
function voxInit() {
  if (!STORY.voice || VOX.a || location.hash === '#still' || QS.get('voice') === '0') return;
  // bản Artifact: trang khung ngoài giữ một thẻ voice chạy suốt, kể cả lúc đổi tầng địa hình (trang trong nạp lại) → voice không ngắt
  const K = (() => { try { return window.parent !== window && window.parent.__voxA ? window.parent : null; } catch (e) { return null; } })();
  if (K) { const a = K.__voxA; VOX.a = a; VOX.ok = a.readyState >= 2; a.addEventListener('canplay', () => { VOX.ok = true; }); a.addEventListener('error', () => { VOX.fail = true; });
    VOX.tiep = !a.paused && QS.get('phat') === '1'; return; }                              // đang phát dở: phim nhảy tới giây voice khi tải xong
  const a = new Audio(); a.preload = 'auto'; VOX.a = a;
  a.addEventListener('canplay', () => { VOX.ok = true; }); a.addEventListener('error', () => { VOX.fail = true; });
  fetch(PU('am/voice.mp3')).then((r) => (r.ok ? r.blob() : Promise.reject(r.status))).then((b) => { a.src = URL.createObjectURL(b); a.load(); })
    .catch(() => { a.src = PU('am/voice.mp3'); a.load(); });
}
function voxChan() {
  setPlaying(false); if (document.getElementById('vox-mo')) return;
  const b = document.createElement('button'); b.id = 'vox-mo'; b.textContent = '▶ Tiếp tục cùng lời dẫn';
  b.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;padding:14px 26px;border-radius:24px;border:0;background:#e9b44c;color:#2a2116;font:600 17px system-ui;box-shadow:0 6px 24px #0007;cursor:pointer';
  b.onclick = () => { b.remove(); voUnlock(); if (!AM.on) amEnable(true); const a = VOX.a; try { a.currentTime = T; } catch (e) {} a.play().catch(() => {}); setPlaying(true); };
  document.body.append(b);
}
function voxTick() {                                                                        // true: giây phim vừa lấy theo voice
  const a = VOX.a; if (!a || VOX.fail || CHO.on) return false;                             // khung chờ không đụng tới voice đang phát
  if (VOX.nghi) { if (playing && appMode === 'film' && performance.now() < VOX.nghi) { if (!a.paused) a.pause(); T = VOX.nghiT; return true; }   // nghỉ đầu hồi
    VOX.nghi = 0; VOX.tiep = false; try { a.currentTime = T; } catch (e) {} }
  if (VOX.tiep) { if (!(playing && appMode === 'film')) return false; VOX.tiep = false; if (!a.paused) { T = a.currentTime; return true; } }
  const want = VO.on && playing && appMode === 'film' && !seeking;
  if (!want) { if (!a.paused) a.pause(); return false; }
  if (!VOX.ok || a.readyState < 2 || T >= a.duration - 0.05) return false;
  a.playbackRate = clamp(speed, 0.5, 2);
  if (a.paused) { if (Math.abs(a.currentTime - T) > 0.25) try { a.currentTime = T; } catch (e) {}
    if (!VOX.cho) { VOX.cho = true; a.play().then(() => { VOX.cho = false; }).catch((e) => { VOX.cho = false; if (e && e.name === 'NotAllowedError') voxChan(); }); }
    return false; }
  if (a.seeking) return true;
  if (Math.abs(a.currentTime - T) > 0.8) { try { a.currentTime = T; } catch (e) {} VOX.tc = T; return true; }     // người xem tua / chọn cảnh: voice nhảy theo
  const tc = VOX.tc === undefined ? T : VOX.tc; T = a.currentTime; VOX.tc = T;
  // (bỏ nghỉ đầu hồi theo anh Thắng V1.2: dừng voice làm ngắt tiếng, ngắt hình)
  return true;
}
const VOX_NGHI = 2600;
voxInit();
for (const ev of ['pointerup', 'touchend', 'mouseup']) $('seek').addEventListener(ev, () => { seeking = false; });
//@@ s51
function updSub(force) {
  const el = $('sub'), sc = SC[sceneIdx(T)]; let txt = '', key = '';
  if (appMode === 'film') (sc.subs || []).forEach((s, k) => { if (T >= s[0] && T < s[1]) { txt = s[2]; key = sc.id + ':' + k; } });
  if (key && key !== lastLine) { lastLine = key; if (!STORY.voice) speak(txt); }        // có voice thu âm thì không dùng giọng máy
  const on = appMode === 'film' && $('ly-sub').checked;
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt || force) el.textContent = txt; el.hidden = !txt;
}
//@@ s52
function update(dt) {
  if (appMode === 'film' && playing) { const dv = voxTick(); if (!dv) T += dt * speed; if (T >= DUR) { T = DUR - 0.01; setPlaying(false); } } else voxTick();
  if (appMode === 'explore') { const sc = SC[exploreI]; T += dt; if (T >= sc.t1 || T < sc.t0) T = sc.t0 + 0.01; }
  const t = T;
  U.time.value += dt;
  if (W.on) walkTick(dt);
  const i = sceneIdx(t), scn = SC[i], shot = shotAt(t);
  // 2.2: cảnh thuộc tầng khác → đổi tầng (tải lại ở cùng thời điểm)
  if (KHUNG && KHUNG.__chuanBi && MAY_MANH && appMode === 'film' && playing && !CHO.on && !update.cb) {    // nạp trước tầng kế tiếp (bản Artifact)
    const nx = SC.find((c) => c.t0 > T && c.t0 - T < 35); if (nx && nx.tang && nx.tang !== TANG) { update.cb = 1; const q = new URLSearchParams(QS); q.delete('cho'); q.delete('chuong'); q.delete('chan-doan');
      q.set('tang', nx.tang); q.set('t', (nx.t0 + 0.05).toFixed(2)); q.set('phat', '1'); KHUNG.__chuanBi(q.toString()); } }
  if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi && seeking) { $('sub').hidden = false; $('sub').textContent = 'Thả thanh thời gian để chuyển sang ' + (scn.tang === 'ha-noi' ? 'Hà Nội' : 'toàn miền Bắc') + '…'; }
  else if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) { update.doi = true; $('sub').hidden = false; $('sub').textContent = 'Đang chuyển sang ' + (HCM ? (scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') : (scn.tang === 'ha-noi' ? 'Hà Nội' : 'toàn miền Bắc')) + '…'; doiTang(scn.tang, Math.max(t, scn.t0 + 0.05), playing); return; }   // t làm tròn có thể rơi về cảnh trước (tầng cũ) → đổi tầng qua lại mãi
  tideNow = 0.3; U.level.value = tideNow; water.position.y = tideNow; U.wetTop.value = tideNow + 0.4;
  applySky(t, appMode === 'explore' ? forcedSky : '');
  scene.fog.density /= 1 + Math.max(0, camera.position.y - R * 0.2) / (R * 0.3);
  if (C04.cap) C04.cap(t, dt);                                                          // cảnh C04 Phi đội Quyết Thắng: dùng giây phim gốc
  { const t = tDinh(T); XEX.tDinh = t;                                                    // các cảnh vào Dinh viết theo mốc cũ (T02 bắt đầu 40 s) → dời theo story
  xeCapNhat(t);
  nvxCapNhat(t, dt);
  DAN.dat(t);
  if (XEX.coCap) XEX.coCap(t);
  if (XEX.co843) XEX.co843.visible = t < 115;                                         // cờ xe 843 đã được tháo mang lên nóc Dinh
  if (XEX.loe) { const a = t - XEX.tBan, X = XEX.x390.obj, y = X.rotation.y;              // Hàng Xanh: chớp nòng pháo 390, nổ ở M113
    XEX.loe.visible = a > 0 && a < 0.35; if (XEX.loe.visible) { XEX.loe.position.set(X.position.x + Math.sin(y) * 7, X.position.y + 2.3, X.position.z + Math.cos(y) * 7); XEX.loe.scale.setScalar(5 + a * 20); }
    const b = a - 0.45; XEX.no113.visible = b > 0 && b < 1.4; if (XEX.no113.visible) { const q = XEX.m113hx.position; XEX.no113.position.set(q.x, q.y + 2 + b * 4, q.z); XEX.no113.scale.setScalar(6 + b * 16); XEX.no113.material.opacity = 0.95 * (1 - b / 1.4); } }
  if (XEX.chay) for (const C of XEX.chay) { const p = C.o.position, chay = !C.tu || t >= C.tu;
    if (C.mats && C.mats.chay !== chay) { C.mats.chay = chay; for (const [m, c0] of C.mats) m.color.copy(c0).multiplyScalar(chay ? 0.3 : 1); }
    if (!chay) { for (const sp of C.khoi) sp.visible = false; continue; }
    for (const sp of C.khoi) { sp.visible = true; const u = (sp.userData.k + U.time.value * 0.06) % 1;
    sp.position.set(p.x + u * 6, p.y + 2 + u * 28, p.z - u * 4); sp.scale.setScalar(2.5 + u * 10); sp.material.opacity = 0.45 * (1 - u); } }
  if (XEX.cong && XEX.cong.phai) {                                                       // 843 húc đổ cổng phụ (84 s) rồi kẹt lại; 390 húc đổ cổng chính (90 s)
    const rung = t > 84 && t < 86.5 ? 0.08 * Math.sin((t - 84) * 20) * (1 - (t - 84) / 2.5) : 0, k1 = sstep(90, 90.7, t), k2 = sstep(90.45, 91.6, t);
    // V1.9 (anh Thắng: 390 húc cổng thì cánh cổng vỡ thành 2 cánh, rơi ra 2 bên xuống đất): hai cánh bật tung vào trong, rồi đổ nghiêng ra HAI BÊN lối vào
    // (trước đây đổ vào giữa, nằm chắn ngang lối như một tấm phẳng). Cánh đổ hơi vặn — gãy khỏi bản lề.
    // Gốc toạ độ mỗi cánh ở TÂM cánh (không phải bản lề); trục Dinh: cổng ở z ≈ −146, sân là phía +z. Cánh bị húc bật vào sân, gãy khỏi trụ,
    // rồi đổ nằm phẳng trên bãi cỏ HAI BÊN lối vào (tâm cách trục 4,1 m, vào sân 3 m), xe 390 đi giữa. Vị trí cuối: MINH HOẠ.
    const Cg = XEX.cong; if (!Cg.p0) Cg.p0 = [Cg.trai.position.clone(), Cg.phai.position.clone()];
    [[Cg.trai, Cg.p0[0], -1], [Cg.phai, Cg.p0[1], 1]].forEach(([o, p, sg]) => { const v = Math.sin(k2 * Math.PI) * 1.2;   // v: cánh văng lên một chút giữa chừng
      o.position.set(p.x + (sg * 4.1 - p.x) * k2, p.y + (0.12 - p.y) * k2 + v, p.z + 0.6 * k1 + 2.4 * k2);
      o.rotation.set(0.28 * k1 * (1 - k2) + k2 * Math.PI / 2, sg * k2 * Math.PI / 2, sg * 0.1 * k2, 'YXZ'); });
    if (XEX.cong.phu) XEX.cong.phu.rotation.x = rung + sstep(84, 84.9, t) * 1.25;          // 843 húc đổ cổng phụ, cánh cổng đổ đè dưới xích xe (xe chết máy, kẹt lại)
  }
  }
  { const on = !$('ly-nha') || $('ly-nha').checked, c = camera.position; for (const m of LAYER.nha) m.visible = on && Math.hypot(m.userData.tam.x - c.x, m.userData.tam.z - c.z) < (m.userData.xa + Math.max(0, c.y) * 2) * (m.visible ? 1.12 : 1); }   // có trễ: ô nhà không bật tắt liên tục (nháy) khi máy quay ở sát ngưỡng
  const xeOn = $('ly-nv').checked; for (const m of LAYER.xe) m.visible = m.visible && xeOn; for (const N of NVX) N.obj.visible = N.obj.visible && xeOn;
  const arrOn = $('ly-arr').checked && $('ly-muiten').checked, ex = appMode === 'explore';
  { const c2 = STORY.scenes.find((c) => c.id === 'C02') || STORY.scenes[0], c6 = STORY.scenes.find((c) => c.id === 'C06');   // năm hướng: C02 lần lượt theo câu đọc; C06 đủ năm hướng
    for (const M of MUITEN) { const t0 = MV.c02_m ? MV.c02_m[M.k] : c2.t0 + 14 + M.k * 9, in6 = c6 && (MV.c06_tc ? t >= MV.c06_tc && t < MV.c06_l2 : t >= c6.t0 && t < c6.t1), gan = MV.c02_l1 && t >= MV.c02_l1 && t < MV.c02_vay;   // C06: đủ năm hướng (cú máy toàn); ẩn khi máy lướt sát đoàn quân
      const on = arrOn && (ex || (t >= t0 && t < c2.t1 && !gan) || in6); muiTenDat(M.m, on, ex || in6 ? 1 : sstep(t0, t0 + 6, t)); } }
  if (KS.cap) KS.cap(t, dt); if (C05.cap) C05.cap(t); if (C01.cap) C01.cap(t); if (C03.cap) C03.cap(t); if (C06.cap) C06.cap(t); if (KT.cap) KT.cap(t); if (C07.cap) C07.cap(t, dt); if (C89.cap) C89.cap(t);
  // máy quay
  let povDone = false; if (appMode === 'film' && povOn) povDone = povTick();
  if (appMode === 'film' && !userCam && !povDone) {
    const fn = SHOTS[shot.id], u = clamp((t - shot.t0) / (shot.t1 - shot.t0), 0, 1);
    if (fn) {
      const [p, l, fov] = fn(u, t);
      if (blend) { const k = Math.min((performance.now() - blend.t0) / 1200, 1), e = k * k * (3 - 2 * k); p.lerpVectors(blend.p0, p, e); l.lerpVectors(blend.q0, l, e); if (k >= 1) blend = null; }
      camera.position.copy(p); camLook.copy(l); camera.lookAt(l); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      controls.target.copy(l);
    }
  } else if (!povDone) {
    if (held) orbitCam(held[0], held[1], held[2]);
    if (flyA) { const k = Math.min((performance.now() - flyA.t0) / flyA.dur, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; camera.position.lerpVectors(flyA.p0, flyA.p1, e); controls.target.lerpVectors(flyA.q0, flyA.q1, e); if (k >= 1) flyA = null; }
    controls.update(); camLook.copy(controls.target);
    if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }
  const gh = hAt(camera.position.x, camera.position.z), inR = Math.hypot(camera.position.x, camera.position.z) < R;
  const ghm = inR ? Math.max(gh, hG(camera.position.x, camera.position.z)) : gh;
  if (camera.position.y < ghm + 1.2) { camera.position.y = ghm + 1.2; if (appMode === 'film' && !userCam) camera.lookAt(camLook); }   // V1.5: chặn máy dưới đất ở mọi nơi (cả ngoài vòng sa bàn)
  const above = Math.max(1, camera.position.y - Math.max(gh, tideNow));
  camera.near = clamp(Math.min(above * 0.05, camera.position.distanceTo(camLook) * 0.2), 0.15, R * 0.01);   // máy bám sát vật ở trên cao (A-37): không cắt mất vật
  // V1.6 (nháy đen từ trên cao; máy thấp mất xe, chỉ thấy mặt nền): trước đây lời chú thích ở dòng trên nuốt mất lệnh cập nhật — mặt cắt gần chỉ được áp
  // khi đổi góc rộng (fov) hoặc đổi cỡ cửa sổ, nên có lúc còn giữ giá trị của cảnh cao (≈ 565 m) khi máy đã hạ thấp → cắt mất đất và xe trước mặt.
  camera.far = Math.max(R * 4, 110000); camera.updateProjectionMatrix();
  sky.position.copy(camera.position); fill.position.copy(camera.position); fill.intensity = 2.2;
  $('underwater').style.opacity = 0;
  if (appMode === 'film' && playing && !userCam) { const ds = Math.min(t - scn.t0, scn.t1 - t); veil.style.opacity = ds < 0.45 ? 1 - ds / 0.45 : 0; } else veil.style.opacity = 0;
  if (scn.id !== lastScene) { lastScene = scn.id; $('stitle').textContent = `${scn.id} · ${scn.title}`; if (appMode === 'film') $('sdate').textContent = `Hồi ${i + 1}/${NSC} · ${scn.ten || scn.title}`; $('slist').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); }
  if (shot.id !== lastShot) { lastShot = shot.id; $('snote').textContent = `${shot.id} · ${shot.size} · ${shot.desc}`; $('snote').hidden = false; }
  $('stime').textContent = `${fmtT(t)} / ${fmtT(DUR)}`; if (!seeking) $('seek').value = Math.round((t / DUR) * 1000);
  updSub();
  { const el = THE_EL(); let c = null; if (appMode === 'film') for (const x of STORY.the || []) if (t >= x[0] && t < x[1]) c = x;   // thẻ hồi
    if (c) { const k = Math.min(1, (t - c[0]) / 0.6, (c[1] - t) / 0.8); if (el.dataset.k !== c[0] + '') { el.dataset.k = c[0] + ''; el.children[0].textContent = c[2]; el.children[1].textContent = c[3]; } el.style.opacity = k; el.style.display = ''; }
    else el.style.display = 'none'; }
  updateLabels(); amTick(dt); MU.tick(); MOC_NGAY.tick();
  fpsN++; const nw = performance.now(); if (nw - fpsT > 1000) { $('fps').textContent = Math.round((fpsN * 1000) / (nw - fpsT)) + ' fps'; fpsN = 0; fpsT = nw; drawMinimap(); }
  else if ((fpsN & 7) === 0) drawMinimap();
}
progress(0.97, 'Đang chuẩn bị hình ảnh…');
//@@ s53
function frame() { if (CHO.on) { clock.getDelta(); return setTimeout(frame, 500); } requestAnimationFrame(frame);   // V1.4: hẹn khung sau TRƯỚC — một lỗi trong khung này không làm đứng cả phim
  const dt = Math.min(clock.getDelta(), 0.1); try { update(first ? 0 : dt); } catch (e) { if (!frame.loi) { frame.loi = 1; console.error('Lỗi khung hình', e); } } first = false; renderer.render(scene, camera); }   // khung chờ: không vẽ, đỡ tốn máy
setAppMode('film');
{ const t0 = parseFloat(QS.get('t')); T = Number.isFinite(t0) ? clamp(t0, 0, DUR - 0.01) : (SC.find((s) => s.tang === TANG) || SC[0]).t0; }
// V1.3 (Hồi 10 đứng hình): dựng sẵn mọi chương trình đồ hoạ lúc tải — trước đây vật nào ẩn tới cảnh sau (đám đông, xe, đạn vạch…) mới dựng khi lần đầu hiện,
// trên Windows (ANGLE/D3D) mỗi lần dựng tốn hàng trăm ms → nhiều thứ cùng hiện ở Hồi 10 làm đứng hình.
await Promise.race([Promise.all(DONG_P), new Promise((r) => setTimeout(r, 20000))]);
{ const an = [], tam = [], mx = new THREE.Matrix4().makeTranslation(0, -9999, 0);
  scene.traverse((o) => { if (!o.visible) { an.push(o); o.visible = true; } });
  for (const K of Object.values(DONG)) { const C = Object.values(K.clips)[0]; if (!C || !C.frames[0]) continue; const im = new THREE.InstancedMesh(C.frames[0], K.mat, 1); im.setMatrixAt(0, mx); im.setColorAt(0, new THREE.Color(1, 1, 1)); im.frustumCulled = false; scene.add(im); tam.push(im); }
  TRV.count = 1; try { renderer.compile(scene, camera); } catch (e) { console.warn('dựng sẵn', e); }
  const daTx = new Set(); scene.traverse((o) => { const M = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of M) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) { const t = m[k]; if (t && t.isTexture && !daTx.has(t)) { daTx.add(t); try { renderer.initTexture(t); } catch (e) {} } } });   // nạp sẵn ảnh màu lên GPU
  // V1.5: compile() chỉ dựng chương trình, KHÔNG nạp hình khối — vật ẩn tới cảnh sau (xe ở Dinh, cờ, đạn…) vẫn nạp khi lần đầu hiện (đo: ~90 hình khối, 1,5–10 s ở 13:44).
  // Vẽ cả cảnh một lần (bỏ cắt khung nhìn) vào khung 1×1 điểm ảnh để nạp hết lên GPU trong lúc còn màn hình tải.
  { const rt = new THREE.WebGLRenderTarget(1, 1), fc = []; scene.traverse((o) => { if (o.frustumCulled) { fc.push(o); o.frustumCulled = false; } });
    try { const cu = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(cu); } catch (e) { console.warn('nạp sẵn cảnh', e); }
    for (const o of fc) o.frustumCulled = true; rt.dispose(); }
  for (const o of an) o.visible = false; for (const im of tam) { scene.remove(im); im.dispose(); } TRV.count = 0;
  // V1.5 (giật ~1–10 s ở 13:44, Hồi 10): mỗi khung hình của mỗi động tác đám đông là một lưới riêng (~980 lưới, ~53 MB) và chỉ được đưa lên GPU khi lần đầu
  // xuất hiện → cảnh nào nhiều người đổi động tác cùng lúc thì đứng hình. Nay vẽ thử một lần mọi lưới vào khung 1×1 điểm ảnh lúc tải để nạp sẵn hết.
  { const sc = new THREE.Scene(), rt = new THREE.WebGLRenderTarget(1, 1), ims = [], mx2 = new THREE.Matrix4().makeTranslation(0, -9999, 0), mau = new THREE.Color(1, 1, 1);
    for (const K of Object.values(DONG)) for (const C of Object.values(K.clips)) for (const g of C.frames) { if (!g) continue; const im = new THREE.InstancedMesh(g, K.mat, 1); im.setMatrixAt(0, mx2); im.setColorAt(0, mau); im.frustumCulled = false; sc.add(im); ims.push(im); }
    try { const cu = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.render(sc, camera); renderer.setRenderTarget(cu); } catch (e) { console.warn('nạp sẵn đám đông', e); }
    for (const im of ims) im.dispose(); rt.dispose(); window.__napSan = ims.length; } }
update(0); renderer.compile(scene, camera); renderer.render(scene, camera);
renderList(); connectStore();
const STILL = location.hash === '#still';
window.__kiem = () => { const c = camera.position, out = []; if (c.y < Math.max(hG(c.x, c.z), hAt(c.x, c.z)) + 0.5) out.push('máy dưới đất'); if (camera.near > camera.position.distanceTo(camLook) * 0.5 || Math.abs(camera.projectionMatrix.elements[14] + 2 * camera.far * camera.near / (camera.far - camera.near)) > 1e-3 * Math.abs(camera.projectionMatrix.elements[14])) out.push('mặt cắt gần sai');   // V1.6   // V1.5: kiểm tra tự động (tools: quét cả phim)
  let ng = 0; for (const X of XE) if (X.obj.visible && Math.hypot(X.obj.position.x, X.obj.position.z) > R - 50) ng++; for (const C of KT.cot || []) for (const X of C.X) if (X.o.visible && Math.hypot(X.o.position.x, X.o.position.z) > R - 50) ng++;
  if (ng) out.push(ng + ' xe ngoài sa bàn'); if (Math.hypot(c.x, c.z) > R * 1.02 && c.y < 3000) out.push('máy ngoài sa bàn, thấp'); return out; };
window.__sa = { DAM, get dongDat() { return dongDat; }, renderer, scene, THREE, KT, C89, C07, C04, DAN, DONG, get NHA() { return XEX.nhaTong; }, get VOX() { return VOX; }, XE, NVX, XEX, TANG, camera, controls, seek: (t) => { T = clamp(t, 0, DUR - 0.01); }, setPlaying, setAppMode, goView, get T() { return T; }, get DUR() { return DUR; }, render: () => { update(0); renderer.render(scene, camera); }, ve: () => renderer.render(scene, camera), tinh: () => update(0), buoc: (dt) => { update(dt); renderer.render(scene, camera); } };
// V1.5: card đồ hoạ mất ngữ cảnh (máy yếu, tràn bộ nhớ) → tự dựng lại sa bàn ở đúng giây đang xem, thay vì để màn hình đen
renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); if (update.mat) return; update.mat = 1; console.warn('mất ngữ cảnh WebGL — dựng lại');
  if (CHO.on) { window.__sanSang = false; return; }   // V1.6: khung nạp sẵn mất ngữ cảnh → bỏ, khi tới hồi đó sẽ tải bình thường
  // V1.6: chống vòng tải lại vô hạn (máy treo) — quá 2 lần trong 2 phút thì dừng, báo anh chị đóng bớt thẻ trình duyệt
  let L = []; try { L = JSON.parse(sessionStorage.getItem('sb-mat') || '[]').filter((x) => Date.now() - x < 120000); L.push(Date.now()); sessionStorage.setItem('sb-mat', JSON.stringify(L)); } catch (er) {}
  $('sub').hidden = false;
  if (L.length > 2) { $('sub').textContent = 'Máy đồ hoạ quá tải. Hãy đóng bớt thẻ trình duyệt rồi tải lại trang.'; return; }
  $('sub').textContent = 'Máy đồ hoạ quá tải — đang dựng lại sa bàn…'; setTimeout(() => doiTang(TANG, T, playing), 600); });
window.__dong = () => { update.mat = 1; CHO.on = true; try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} };   // V1.6: khung bị thay — trả bộ nhớ đồ hoạ ngay
function closeLoad() { $('load').classList.add('done'); setTimeout(() => $('load').remove(), 700); }
if (STILL) { document.body.classList.add('ready'); closeLoad(); }
else {
  progress(1, 'Đã tải xong sa bàn');
  document.body.classList.add('ready');
  $('ldtrack').hidden = true; $('ldgo').hidden = false; $('bstart').focus();
  $('bstart').onclick = () => { voUnlock(); if (!AM.on) amEnable(true); closeLoad(); setPlaying(true); };   // Play bật cả nhạc, hiệu ứng
  $('bexplore').onclick = () => { voUnlock(); closeLoad(); setAppMode('explore'); };
  if (CHO.on) {                                                                            // khung chờ: nạp xong thì đứng yên, khung ngoài gọi __tiep khi tới giờ đổi tầng
    window.__tiep = (t, phat) => { CHO.on = false; T = clamp(+t || T, 0, DUR - 0.01); closeLoad(); if (KHUNG && KHUNG.__AMS && !AM.on) amEnable(true);
      VOX.tiep = !!(VOX.a && !VOX.a.paused); VOX.tc = T;
      setAppMode('film'); setPlaying(phat !== false); update(0); renderer.render(scene, camera); };
    window.__sanSang = true;
  } else if (QS.get('phat') === '1') { closeLoad(); if (KHUNG && KHUNG.__AMS && !AM.on) amEnable(true); setPlaying(true); }
  requestAnimationFrame(frame);
}
