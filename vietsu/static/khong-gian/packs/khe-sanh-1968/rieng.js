// Chiến dịch Đường 9 – Khe Sanh 1968 · phần riêng của trận, cắm vào bộ máy 2.2.0 tại các chỗ /*@@RIENG:sN@@*/.
// GĐ0 (25/11/2026): BẢN NỀN chép nguyên từ packs/ho-chi-minh-1975/rieng.js (V1.9) để giữ các hàm dùng lại được:
//   giaoTranh, uNap, don, tranDia, banTao, LINH_XE, buiXe, MOC_NGAY, camCot, camVai, window.__kiem.
// Biên đạo, địa danh, lịch xe của Sài Gòn trong tệp này CHƯA thay; sẽ thay ở GĐ3–GĐ4 khi có địa hình Khe Sanh.
// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy.
//@@ s1
// Sa bàn Chiến dịch Đường 9 – Khe Sanh 1968 — three.js, bộ máy 2.2.0 (họ Bạch Đằng). Tái dựng mô phỏng.
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
progress(0.35, 'Đang dựng địa hình ' + (TANG === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch Đường 9') + '…');
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
const MOC = {
  tacon: [16.65433, 106.7243, 'Căn cứ Tà Cơn (Khe Sanh)'],
  h881n: [16.69069, 106.65958, 'Điểm cao 881 Bắc'],
  h881s: [16.67167, 106.66256, 'Điểm cao 881 Nam'],
  h861: [16.6760, 106.6887, 'Điểm cao 861'],
  h861a: [16.6778, 106.6915, 'Điểm cao 861A'],
  h558: [16.6833, 106.7046, 'Điểm cao 558'],
  h950: [16.6885, 106.725, 'Điểm cao 950'],
  khesanh: [16.62732, 106.7377, 'Quận lỵ Hướng Hóa (làng Khe Sanh)'],
  cubo: [16.6243, 106.73923, 'Đồi Cu Bốc'],
  langvay: [16.60048, 106.66822, 'Cứ điểm Làng Vây'],
  coroc: [16.575, 106.640, 'Núi Co Roc (Lào, ước lượng)'],
  huoisan: [16.611, 106.538, 'Bản Huội San (Lào)'],
  rockpile: [16.77972, 106.85267, 'Rockpile'],
  carroll: [16.77191, 106.92826, 'Trại Carroll'],
};
const MOC_LON = new Set(['tacon', 'langvay']);
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
if (true) { dongNap('qgpA', 'linh-qgp-a', 'linh-qgp-a', 300); dongNap('qgpB', 'linh-qgp-b', 'linh-qgp-b', 300); dongNap('vnch', 'linh-vnch', 'linh-vnch', 200);
  // V1.5: hai mức chi tiết — gần máy (< 45 m × tỉ lệ) dùng mẫu 4.700 tam giác (không thủng), xa dùng mẫu 1.570 tam giác (nhẹ cho card đồ hoạ)
  dongNap('qgpAx', 'linh-qgp-a-x', 'linh-qgp-a', 700); dongNap('qgpBx', 'linh-qgp-b-x', 'linh-qgp-b', 700); dongNap('vnchx', 'linh-vnch-x', 'linh-vnch', 400); dongNap('my', 'linh-my', 'linh-my', 300); dongNap('myx', 'linh-my-x', 'linh-my', 600);
  // anh Thắng V1.2: bộ đội ta dùng hai mẫu lính Thành cổ (mũ tai bèo / đầu trần, tools/thanh_co_quang_tri/nhan-vat), lấy động tác của mẫu QĐND cùng bộ xương; 'qgp' chia đều hai mẫu
  const _dd0 = dongDat; dongDat = (ten, clip, t, ph, x, y, z, yaw, sc = 1, vi = 0) => { let n = ten === 'qgp' ? (vi % 2 ? 'qgpA' : 'qgpB') : ten;
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
    if (i > 0 && t - SKYKEYS[i][0] < 7) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, 7, t - SKYKEYS[i][0]); }
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
const SG = LL(MOC.tacon[0], MOC.tacon[1], 0);
const xeCam = (X, back, up, ahead, fov = 40) => (u) => {
  if (!X || !X.obj.visible) { const c = LL(MOC.dinh[0], MOC.dinh[1], 0); return [c.clone().add(V3(260, 160, 260)), c, 40]; }
  const p = X.obj.position, y = X.obj.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y));
  return [p.clone().addScaledVector(f, -back).add(V3(0, up, 0)), p.clone().addScaledVector(f, ahead).add(V3(0, 2, 0)), fov];
};
// GĐ3: máy quay TẠM cho mọi cú máy của tầng đang mở — xoay quanh mốc chính của hồi, xa gần theo cỡ cảnh trong kịch bản camera
// (đại toàn / toàn / trung / cận). Chỉnh tay từng cú máy, máy bám xe, máy qua vai ở GĐ4 (KHUNG_SA_BAN §10 B: máy luôn trong vòng R, trên mặt đất).
const MOC_HOI = { H01: 'tacon', H02: 'tacon', H03: 'tacon', H04: 'tacon', H05: null, H06: 'langvay', H07: 'tacon', H08: 'tacon', H09: 'rockpile', H10: 'tacon', H11: null };
const CO = { 'Đại toàn': [0.85, 0.55], 'Toàn': [0.32, 0.2], 'Trung': [0.11, 0.06], 'Cận': [0.04, 0.018] };
const SHOTS = {};
for (const sc of STORY.scenes) { if ((sc.tang || 'chien-dich') !== TANG) continue;
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
  ...Object.entries(MOC).filter(([k, [la, lo]]) => Math.hypot(LLx(la, lo), LLz(la, lo)) < R * 0.96)
    .map(([k, [la, lo, ten]]) => [k, ten, LLx(la, lo), LLz(la, lo), 'Mốc (toạ độ OSM hoặc theo nguồn trong sources.json; "ước lượng" là chưa chốt)', MOC_LON.has(k)]),
  ...(TANG === 'chien-dich' ? META.places.filter((p) => p[0] === 'city').map(([typ, ten, x, y], k) => ['p' + k, ten, x, -y, 'Thị xã (tên hiện nay)', false]) : []),
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
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', onClick: () => { showCard(name); flyTo(A.x, A.z, TANG === 'ta-con' ? 1500 : 9000); }, drag: { kind: 'anchor', name } });
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
  // V2.0 (anh Thắng: giao tranh phải có tia đạn bay như sa bàn Thành cổ Quảng Trị): vệt đạn lửa bay qua lại giữa hai bên.
  // Mỗi nguồn: (t) → [điểm bắn bên này[], điểm bắn bên kia[]] hoặc null; vệt dài ~4 m, bay ~250 m/s; chạy theo giây phim (dừng phim thì đạn đứng).
  const TIA = { nguon: [], n: matchMedia('(pointer: coarse)').matches ? 50 : 90, r: [], lay: -1e9, cap: [] };
  /* vệt đạn là thanh hộp mảnh (InstancedMesh): bề dày theo khoảng cách tới máy quay (~1,5 px) để cảnh toàn vẫn thấy — nét LineSegments chỉ 1 px, đứng xa là mất */
  { TIA.m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffb860, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }), TIA.n);
    TIA.m.frustumCulled = false; TIA.m.renderOrder = 5; TIA.m.visible = false; TIA.m.count = 0; scene.add(TIA.m); for (let i = 0; i < TIA.n; i++) TIA.r.push({ t: 1 + Math.random(), a: null });
    TIA.m4 = new THREE.Matrix4(); TIA.q = new THREE.Quaternion(); TIA.v = V3(0, 0, 0); TIA.s = V3(1, 1, 1); TIA.z = V3(0, 0, 1); TIA.d = V3(0, 0, 0); }
  const bam = (i, c, k) => { const x = Math.sin(i * 127.1 + c * 311.7 + k * 74.7) * 43758.5453; return x - Math.floor(x); };   /* ngẫu nhiên cố định theo (vệt, lượt, khoá) */
  const tiaCap = (t) => {   /* không giữ trạng thái: vị trí từng vệt tính thẳng từ giây phim → tua, dừng, xuất phim đều đúng */
    TIA.cap = []; for (const f of TIA.nguon) { const c = f(t); if (c && c[0].length && c[1].length) TIA.cap.push(c); }   /* tính lại mỗi khung (nhẹ): nguồn phụ thuộc vị trí máy quay */
    TIA.m.visible = TIA.cap.length > 0; if (!TIA.m.visible) return; let w = 0; const cp = camera.position;
    for (let i = 0; i < TIA.n; i++) { const P = 0.9 + 1.3 * bam(i, 0, 0), x = t + P * bam(i, 0, 1), c = Math.floor(x / P), s_ = x - c * P - bam(i, c, 7) * 0.4 * P;
      const C = TIA.cap[Math.floor(bam(i, c, 0) * TIA.cap.length)], f = bam(i, c, 1) < 0.55 ? 0 : 1, A = C[f], B = C[1 - f];
      const a = A[Math.floor(bam(i, c, 2) * A.length)], b = TIA.d.copy(B[Math.floor(bam(i, c, 3) * B.length)]).add(TIA.v.set((bam(i, c, 4) - 0.5) * 8, (bam(i, c, 5) - 0.3) * 2.5, (bam(i, c, 6) - 0.5) * 8));
      const L = Math.max(5, a.distanceTo(b)), bay = L / 250; if (s_ < 0 || s_ > bay) continue;
      TIA.v.copy(a).lerp(b, s_ / bay); b.sub(a).normalize(); TIA.q.setFromUnitVectors(TIA.z, b);
      const kc = TIA.v.distanceTo(cp), th = Math.max(0.08, kc * 0.0022); TIA.s.set(th, th, Math.max(4, kc * 0.02));
      TIA.m4.compose(TIA.v, TIA.q, TIA.s); TIA.m.setMatrixAt(w++, TIA.m4); }
    TIA.m.count = w; TIA.m.instanceMatrix.needsUpdate = true; };
  DAM.push((t) => tiaCap(t));
  const tiaThem = (f) => TIA.nguon.push(f);
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
    tiaThem((t) => { if (t < t0 + d * 0.3 || t > t0 + d * 0.84) return null; const u = (t - t0) / d, A = [], B = [];   /* V2.0: tia đạn Làng Vây */
      for (let i = 0; i < 26; i += 2) { const X = LVX.xe[i % Math.max(1, LVX.xe.length)]; if (!X || !X.obj.visible) continue; const p = X.obj.position, y = X.obj.rotation.y, b = 12 + (i % 5) * 5, l = ((i * 7) % 9 - 4) * 3, x = p.x - Math.sin(y) * b + Math.cos(y) * l, z = p.z - Math.cos(y) * b - Math.sin(y) * l; A.push(V3(x, hG(x, z) + 1.2, z)); }
      for (const X of LVX.xe) if (X.obj.visible) A.push(X.obj.position.clone().add(V3(0, 1.9, 0)));
      for (let i = 0; i < 12; i++) { if (u > 0.8 && i > 3 && i % 2 === 0) continue; if (i % 2 === 1 && t >= t0 + d * (0.5 + (i % 6) * 0.04)) continue; const a = i / 12 * Math.PI * 2, x = LV.x + Math.cos(a) * 70, z = LV.z + Math.sin(a) * 55; B.push(V3(x, hG(x, z) + 1.1, z)); }
      return [A, B]; });
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
      HAO.push(dai(P, 3, 0x5a4630, 0.06)); KS.HAO_P.push(P);
      const R0 = [E[0] - Math.sin(a) * 70, E[1] + Math.cos(a) * 70], g = hG(R0[0], R0[1]);   /* V2.0: tổ lính Mỹ giữ hàng rào trước đầu hào (MINH HOẠ) */
      HAO.rao = HAO.rao || []; HAO.rao.push([0, 1, 2, 3].map((i) => V3(R0[0] + Math.cos(a) * (i - 1.5) * 5, g, R0[1] + Math.sin(a) * (i - 1.5) * 5))); }
    const t0 = H('H07').t0, t1 = H('H07').t1;
    DAM.push((t) => { if (t < t0 || t > t1 + 3) return; const u = clamp((t - t0) / (t1 - t0) * 1.3, 0, 1);
      HAO.forEach((m, k) => { const pos = m.geometry.attributes.position.array, n = m.userData.n, j = Math.max(1, Math.floor((n - 1) * u)) * 2 * 3;
        for (let i = 0; i < 4; i++) { const x = pos[j] + (i - 1.5) * 4, z = pos[j + 2] + (i % 2) * 3; if (!ganMay(x, z, 900)) continue; dongDat('qgp', i % 2 ? 'quy' : 'nup', t, (k * 0.3 + i * 0.21) % 1, x, hG(x, z), z, Math.atan2(TC.x - x, TC.z - z), 1, k * 4 + i); } });
      if (u > 0.15) (HAO.rao || []).forEach((L, k) => L.forEach((q, i) => { if (ganMay(q.x, q.z, 900)) { const hd = HAO[k].geometry.attributes.position.array; dongDat('my', i % 2 ? 'namban' : 'nup', t, (k * 0.23 + i * 0.31) % 1, q.x, q.y, q.z, Math.atan2(hd[0] - q.x, hd[2] - q.z), 1, 200 + k * 4 + i); } })); });
    HAO.forEach((m, k) => tiaThem((t) => { if (t < t0 || t > t1) return null; const u = clamp((t - t0) / (t1 - t0) * 1.3, 0, 1); if (u < 0.15) return null;   /* V2.0: tia đạn đầu hào ↔ hàng rào (mỗi hào một cặp, chỉ khi gần máy quay) */
      const pos = m.geometry.attributes.position.array, n = m.userData.n, j = Math.max(1, Math.floor((n - 1) * u)) * 2 * 3; if (!ganMay(pos[j], pos[j + 2], 1000)) return null; const A = [];
      for (let i = 0; i < 4; i++) { const x = pos[j] + (i - 1.5) * 4, z = pos[j + 2] + (i % 2) * 3; A.push(V3(x, hG(x, z) + 0.6, z)); }
      return [A, ((HAO.rao || [])[k] || []).map((q) => q.clone().add(V3(0, 0.5, 0)))]; }));
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
      /* V2.0 (anh Thắng): mũi tên mọc dần từ gốc tới đích — p ∈ [0,1]: phần thân tới p, đầu mũi tên luôn ở ngọn */
      const ve = (p) => { const A = g.attributes.position.array, uN = Math.max(0.002, p), dauP = Math.min(dau, L * uN * 0.6), uT = Math.max(0.001, uN - dauP / L); let w = 0;
        for (let i = 0; i <= n; i++) { const u = uT * i / n, q = c.getPointAt(u); c.getTangentAt(u, T); const nx = -T.z, nz = T.x;
          A[w++] = q.x + nx * rong / 2; A[w++] = y; A[w++] = q.z + nz * rong / 2; A[w++] = q.x - nx * rong / 2; A[w++] = y; A[w++] = q.z - nz * rong / 2; }
        const q0 = c.getPointAt(uT), q1 = c.getPointAt(uN); c.getTangentAt(uT, T); const nx = -T.z, nz = T.x, s = dauP / dau;
        A[w++] = q0.x + nx * rong * 1.25 * s; A[w++] = y; A[w++] = q0.z + nz * rong * 1.25 * s; A[w++] = q0.x - nx * rong * 1.25 * s; A[w++] = y; A[w++] = q0.z - nz * rong * 1.25 * s; A[w++] = q1.x; A[w++] = y; A[w++] = q1.z;
        g.attributes.position.needsUpdate = true; };
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));   /* V1.5 (anh Thắng): mũi tên trắng, opacity 90 % — như mũi tên mica trên sa bàn ở di tích */
      m.renderOrder = 6; m.visible = false; m.frustumCulled = false; m.userData.ve = ve; m.userData.p = 1; scene.add(m); return m; };
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
    for (const M of MT) { const id = M.hoi.find((h) => hz(h)), sh = id && shNow(id); const on = arrOn && !!id && (appMode !== 'film' || !sh || sh.size === 'Đại toàn' || sh.id === 'C13-03');   /* mũi tên chỉ hiện ở cảnh đại toàn, không che đoàn xe khi quay gần */
      if (on && !M.m.visible) M.tOn = t; if (on && (t < M.tOn || appMode !== 'film')) M.tOn = appMode === 'film' ? t : -1e9;
      M.m.visible = on; if (on) { const p = ease(clamp((t - M.tOn) / 4, 0, 1)); if (Math.abs(p - M.m.userData.p) > 1e-4) { M.m.userData.ve(p); M.m.userData.p = p; } } }   /* V2.0: mọc dần trong 4 s */
    TET.style.opacity = hz('H05') && t > mv('h05_tet', 'H05', 6) && t < mv('h05_tet', 'H05', 6) + 20 && appMode === 'film' ? 1 : 0;   /* V2.0: hiện 20 s rồi tắt (điện thoại bị che) */
  } catch (e) { console.warn('KS.cap', e); } };
  Object.assign(KS, { xeTaoN, H, tv, mv, tiaThem, PM, mp, trongDa, LV, LVX, MB, PHAO, CR, MT, dai, veGlb, napSan, RW_HUONG, CC });   /* dùng ở phần dàn cảnh từng cú máy (dan_canh_gd4.js) */
  window.__ks = { KS, LVX, MB, PHAO, MT, XE, TIA };                              /* để kiểm tra tự động (quet_phim, chụp) */
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
// ================================================================== KHE SANH 1968 · dàn cảnh và máy quay từng cú (GĐ4b, 25/11/2026)
// Anh Thắng 25/11: "camera cứ quay mãi vào đường băng" → mỗi cú máy trong story.json có chủ thể riêng (người, khí tài) và góc đúng cỡ cảnh
// (đại toàn / toàn / trung / cận). Vị trí tổ quân, số người, đường đi là TÁI DỰNG MINH HOẠ; mốc, đơn vị theo docs/KHE_SANH_1968_TU_LIEU.md.
{
  const { H, mp, tv } = KS, TC = KS.TC, SCN = STORY.scenes.filter((c) => (c.tang || 'chien-dich') === TANG);
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
  const uBaoCat = (x, z, r, yaw = 0, mo = 0.9) => { const n = Math.ceil((2 * Math.PI - mo) * r / 0.52) + 1,   /* V2.0 (anh Thắng: công sự xếp kín, chỉ chừa lối vào): bao dài 0,62 m đặt dọc vòng, cách 0,52 m → chồng mép, không hở */ im = new THREE.InstancedMesh(BAO, baoMat, n * 3), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = V3(1, 1, 1);   /* vòng ba lớp, chừa lối vào rộng mo rad */
    let k = 0; for (let l = 0; l < 3; l++) for (let i = 0; i < n; i++) { const a = yaw + mo / 2 + (2 * Math.PI - mo) * Math.min(i + (l % 2) * 0.5, n - 1) / (n - 1), bx = x + Math.sin(a) * r, bz = z + Math.cos(a) * r;   /* mỗi bao đặt theo mặt đất tại chỗ */
      q.setFromAxisAngle(V3(0, 1, 0), a); m4.compose(V3(bx, hG(bx, bz) + 0.12 + l * 0.24, bz), q, s1); im.setMatrixAt(k++, m4); }
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
    const [hx, hz_] = mp(560, 232), HAM = G(hx, hz_), HAM_MO = 2.2; uBaoCat(hx, hz_, 3.2, HAM_MO, 0.75);   /* lối vào ụ quay về hướng lính chạy tới (đông nam) */ uBaoCat(hx + 9, hz_ + 3, 2.6, 1.2, 0.8);
    // V1.4 cờ: cờ Mỹ ở khu chỉ huy Trung đoàn 26 TQLC (sơ đồ M32: 26th Rgt COC) và ở ụ gác; cờ đỏ sao vàng ở trận địa pháo Co Roc
    { const [x, z] = mp(585, 250), c = KS.taoCo('co-my', 1.9, 7); c.position.set(x, hG(x, z), z); DUNG.push([c, 0, H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.5]); }   /* hạ cờ khi rút */
    { const c = KS.taoCo('co-my', 1.2, 4); c.position.set(GAC.x + 2.5, GAC.y, GAC.z + 1.5); DUNG.push([c, 0, H('H10').t0 + (H('H10').t1 - H('H10').t0) * 0.4]); }
    if (KS.CR) { const c = KS.taoCo('co-qgp', 1.4, 4); c.position.set(KS.CR.x + 8, hG(KS.CR.x + 8, KS.CR.z - 30), KS.CR.z - 30); }
    // đường tuần tra trong hào phía bắc
    const TUAN = [mp(330, 102), mp(400, 92), mp(450, 90), mp(530, 112), mp(600, 133)].map(([x, z]) => G(x, z));
    const tuan = diTheo(TUAN, 0.97, tv('H02', 20));                                /* 0,97 m/s: nhịp bước của động tác Rifle Walk (Mixamo) */
    const tuan10 = diTheo(TUAN.slice().reverse(), 0.97, tv('H10', 40));
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
    // V2.0 (anh Thắng: công sự kín, chỉ chừa lối vào; bớt người chạy vào, còn lại ở ngoài, không chồng lên nhau):
    // 4 người chạy qua lối vào, mỗi người một chỗ trong ụ; 7 người dừng nấp quanh ngoài ụ (vòng 6 m, mỗi người một góc); người thứ 8 trúng pháo ngã giữa đường.
    const EX = Math.sin(HAM_MO), EZ = Math.cos(HAM_MO), T4 = tv('H04', 52);
    const TRONG4 = [[-1.1, 0.5], [1.1, 0.4], [0.3, -1.3], [-0.6, -1.4]], NGOAI4 = [-1.7, -1.25, -0.8, 0.8, 1.25, 1.7, 2.15];
    const CHAY4 = Array.from({ length: 12 }, (_, i) => { const a = G(HAM.x + 20 + (i % 4) * 4, HAM.z - 15 + Math.floor(i / 4) * 5);
      if (i < 4) { const [x, z] = TRONG4[i]; return diTheo([a, G(HAM.x + EX * 7, HAM.z + EZ * 7), G(HAM.x + EX * 1.6, HAM.z + EZ * 1.6), G(HAM.x + x, HAM.z + z)], 2.7, T4 + i * 0.9); }
      if (i === 7) return diTheo([a, G(HAM.x + EX * 7, HAM.z + EZ * 7)], 2.7, T4 + 2.2);
      const g = HAM_MO + NGOAI4[i < 7 ? i - 4 : i - 5]; return diTheo([a, G(HAM.x + Math.sin(g) * 6, HAM.z + Math.cos(g) * 6)], 2.7, T4 + 0.5 + i * 0.35); });   /* 2,7 m/s: nhịp bước Rifle Run */
    const HUONG4 = (i) => (i < 4 ? HAM_MO + Math.PI + (i - 1.5) * 0.9 : i === 7 ? 0 : HAM_MO + NGOAI4[i < 7 ? i - 4 : i - 5]);   /* tới nơi: trong ụ nhìn ra phía đồi, ngoài ụ quay lưng vào ụ */
    DAM.push((t) => { if (!trong(t, 'H04') || !ganMay(HAM.x, HAM.z, 600)) return;
      CHAY4.forEach((f, i) => { const o = f(t);
        if (i === 7) { const tn = T4 + 5.2; if (t >= tn) { const q = f(tn), s_ = t - tn; dongDat('my', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, q.p.x, q.p.y, q.p.z, q.yaw, 1, i); return; } }   /* V1.7: một lính Mỹ trúng pháo, ngã trước khi tới ụ */
        const kh = !o.het && i % 4 === 1; dongDat('my', o.het ? (i < 4 ? (i % 2 ? 'ngam' : 'quy') : (i % 3 ? 'nup' : 'quy')) : (kh ? 'khom' : 'chay'), kh ? t * 2.1 : t, i * 0.31 % 1, o.p.x, o.p.y, o.p.z, o.het ? HUONG4(i) : o.yaw, 1, i); }); });
    // H06 thêm mũi bộ binh từ phía bắc (cBB2 trên sơ đồ trận Làng Vây, S18)
    const LV = KS.LV, BB = diTheo([G(LV.x + 20, LV.z - 230), G(LV.x + 10, LV.z - 140), G(LV.x, LV.z - 60)], 2.7, H('H06').t0 + (H('H06').t1 - H('H06').t0) * 0.3);
    const tNgaBB = H('H06').t0 + (H('H06').t1 - H('H06').t0) * 0.5, oNga = BB(tNgaBB), dNga = hang(10, 3, 3)[4];   /* V1.7 (anh Thắng: có cảnh bộ đội hy sinh): chiến sĩ thứ 5 trúng đạn giữa đường xung phong, nằm lại */
    DAM.push((t) => { if (!trong(t, 'H06') || !ganMay(LV.x, LV.z, 1500)) return; const o = BB(t);
      toNguoi('qgp', o.p, o.yaw, hang(10, 3, 3).map(([a, b], i) => [a, b, o.het ? (i % 3 ? 'ban' : 'quy') : (i % 3 === 1 ? 'khomNhanh' : 'chay')]).filter((_, i) => !(i === 4 && t >= tNgaBB)), t);
      if (t >= tNgaBB) { const s_ = t - tNgaBB, c = Math.cos(oNga.yaw), sn = Math.sin(oNga.yaw), x = oNga.p.x + dNga[0] * c + dNga[1] * sn, z = oNga.p.z - dNga[0] * sn + dNga[1] * c; dongDat('qgp', s_ < 3.3 ? 'nga' : 'nam', s_ < 3.3 ? s_ : t, 0, x, hG(x, z), z, oNga.yaw, 1, 4); } });
    KS.tiaThem((t) => { if (!trong(t, 'H06') || t < tNgaBB - 10 || t > H('H06').t1 - 4) return null; const o = BB(t), c = Math.cos(o.yaw), sn = Math.sin(o.yaw), A = [], B = [];   /* V2.0: tia đạn mũi phía bắc */
      hang(10, 3, 3).forEach(([a, b], i) => { if (i % 2 || (i === 4 && t >= tNgaBB)) return; const x = o.p.x + a * c + b * sn, z = o.p.z - a * sn + b * c; A.push(V3(x, hG(x, z) + 1.2, z)); });
      for (let i = 0; i < 12; i += 2) { const a = i / 12 * Math.PI * 2, x = LV.x + Math.cos(a) * 70, z = LV.z + Math.sin(a) * 55; if (Math.hypot(x - o.p.x, z - o.p.z) < 260) B.push(V3(x, hG(x, z) + 1.1, z)); }
      if (!B.length) B.push(V3(LV.x, hG(LV.x, LV.z - 55) + 1.1, LV.z - 55)); return [A, B]; });
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
    const tNgaHao = H('H07').t0 + (H('H07').t1 - H('H07').t0) * 0.62;
    HP.forEach((P, k) => MOCH.forEach((a) => KS.tiaThem((t) => { if (!trong(t, 'H07') || tienHao(t) < a + 0.004) return null; const L = HL[k] || 2000, o = diemHao(k, a); if (!o || !ganMay(o.p.x, o.p.z, 600)) return null;   /* V2.0: tia đạn từ tổ trong hào (gần máy quay) về phía căn cứ và ngược lại — hướng bắn MINH HOẠ */
      const A = [0, 2, 4].map((j) => (diemHao(k, clamp(a + (j - 2) * 3.2 / L, 0.01, 0.999)) || o).p.clone().add(V3(0, 1.3, 0)));
      const B = [0, 1, 2].map((j) => { const q = diemHao(k, Math.min(0.999, a + (160 + j * 50) / L)) || o; const y = Math.max(hG(q.p.x, q.p.z), o.p.y) + 4; return V3(q.p.x + Math.cos(q.yaw) * (j - 1) * 20, y, q.p.z - Math.sin(q.yaw) * (j - 1) * 20); });
      return [A, B]; })));   /* một chiến sĩ ở tổ thứ tư của hào 1 trúng đạn; tổ cứu thương tới bên cạnh (MINH HOẠ) */
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
      for (let k = 0; k < 2; k++) KS.xeTaoN('data/xe/xe-tang-m48.glb', { duong,   /* V1.4: phía Mỹ dùng M48 (mẫu xe tải là xe Quân Giải phóng) */ lich: [[tv('H10', 6), -k * 18], [H('H10').t0 + d * 0.45, 900 - k * 18], [H('H10').t1, 1500 - k * 18]], hien: (t) => trong(t, 'H10'), ten: 'Rút quân' });
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
    MAY('C04-02', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y, p = o.position, a = y + Math.PI + 0.75; return [tren(p.clone().add(V3(Math.sin(a) * 24, 8 + u * 1.5, Math.cos(a) * 24))), p.clone().add(V3(Math.sin(y) * 6, 1.4, Math.cos(y) * 6)), 44]; });   /* V2.0: trung, không cận khẩu pháo */   /* V1.5: đứng sau-trái kíp pháo nhìn theo nòng — chớp lửa đầu nòng ở xa, không chói kín khung */
    MAY('C04-03', (u, t) => { const o = P0(); if (!o) return null; const y = o.rotation.y, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 26, 9, Math.cos(y + Math.PI + 0.6) * 26))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44]; });
    MAY('C04-04', quanh(TC, 3200, 1700, 2.2, 2.45, 46));
    MAY('C04-05', dolly(KS.kho ? KS.kho.clone().add(V3(-420, 90, 260)) : TC, KS.kho ? KS.kho.clone().add(V3(-360, 70, 220)) : TC, KS.kho || TC, (KS.kho || TC).clone().add(V3(0, 60, 0)), 40));
    MAY('C04-06', (u, t) => { const o = CHAY4[2](t); return [tren(o.p.clone().add(V3(9, 3, -7))), o.p.clone().add(V3(0, 1, 0)), 44]; });
    MAY('C04-07', dolly(HAM.clone().add(V3(Math.sin(HAM_MO - 0.6) * 30, 12, Math.cos(HAM_MO - 0.6) * 30)), HAM.clone().add(V3(Math.sin(HAM_MO - 0.3) * 24, 10, Math.cos(HAM_MO - 0.3) * 24)), HAM.clone().add(V3(0, 0.5, 0)), undefined, 44));   /* V2.0: toàn ụ, lối vào, người nấp quanh */
    // H06 Làng Vây (xe tăng PT-76 dựng ở bien_dao_gd4.js)
    const xe0 = (t) => { const X = KS.LVX.xe[0]; return X && X.obj.visible ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    const xe3 = (t) => { const X = KS.LVX.xe[3] || KS.LVX.xe[1]; return X && X.obj.visible ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    const veLV = (fn, du) => (u, t) => fn(u, t) || du(u, t);
    MAY('C05-01', dolly(V3((TC.x + LV.x) / 2 + 2600, TC.y + 4200, (TC.z + LV.z) / 2 - 2600), V3((TC.x + LV.x) / 2 + 1500, TC.y + 3200, (TC.z + LV.z) / 2 - 1500), V3((TC.x + LV.x) / 2, LV.y, (TC.z + LV.z) / 2), undefined, 46));
    MAY('C05-02', quanh(LV, 520, 210, 0.3, 1.1, 44));
    MAY('C05-03', veLV(theo(xe0, 75, 30, 45, 44, 25),   /* V2.0: toàn — xe tăng và bộ binh */ quanh(LV, 520, 200, 1.1, 1.4, 44)));
    MAY('C05-04', veLV(theo(xe0, 65, 40, -70, 44, 30),   /* V2.0: bỏ cận bánh xích → toàn chếch phía bên kia */ quanh(LV, 400, 120, 1.4, 1.6, 44)));
    MAY('C05-05', veLV(theo(xe3, 85, 34, -40, 44, 20),   /* V2.0 (anh Thắng): bộ binh chạy cùng xe tăng lấy toàn, không thấy chạy quá nhanh */ quanh(LV, 420, 150, 1.6, 1.9, 44)));
    MAY('C05-06', quanh(LV, 380, 260, 3.6, 4.2, 44));
    MAY('C05-07', (u, t) => { const o = BB(t); return [tren(o.p.clone().add(V3(Math.sin(o.yaw) * 4.2 + 1.2, 1.7, Math.cos(o.yaw) * 4.2))), o.p.clone().add(V3(0, 1.4, 0)), 38]; });
    MAY('C05-08', (u) => [tren(LV.clone().add(V3(-300 - u * 400, 160 + u * 900, 350 + u * 500))), LV.clone(), 44]);
    // H07 Những chiến hào siết chặt Tà Cơn
    const CU = {}; for (const sc of STORY.scenes) for (const sh of sc.shots) CU[sh.id] = sh;
    const mocCu = (k, id) => { const sh = CU[id], ud = sh ? tienHao(sh.t0 + (sh.t1 - sh.t0) * 0.15) : 0.5; let a = MOCH[0]; for (const m of MOCH) if (m + 0.004 <= ud) a = m; return () => diemHao(k, a); };   /* V1.7: mốc đã có tổ khi cú máy bắt đầu */
    const dau = (k, lui = 0, id) => (id ? ((f) => () => f())(mocCu(k, id)) : (u, t) => diemHao(k, Math.max(0.03, tienHao(t) - lui * 120 / (HL[k] || 2000))));
    MAY('C06-01', (u) => [tren(V3(TC.x - 600, TC.y + 6200 - u * 3600, TC.z + 3800 - u * 1400)), V3(TC.x - 600, TC.y, TC.z + 600), 46]);
    MAY('C06-02', (u, t) => { const o = dau(0, 0, 'C06-02')(); if (!o) return null; const a = o.yaw + 2.2 + u * 0.5, r = 34 - u * 8; return [tren(o.p.clone().add(V3(Math.sin(a) * r, 16 - u * 5, Math.cos(a) * r))), o.p.clone().add(V3(0, 0.5, 0)), 44]; });   /* V1.7: lượn chậm quanh tổ đóng quân, không bám đầu hào */
    MAY('C06-03', (u, t) => { const o = dau(2, 0, 'C06-03')(); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, 34).add(V3(0, 15, 0))), o.p.clone().add(V3(0, 0.6, 0)), 44]; });   /* V2.0: toàn đoạn hào */
    MAY('C06-04', (u, t) => { const o = dau(2, 0, 'C06-04')(); if (!o) return null; const f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [tren(o.p.clone().addScaledVector(f, -30).add(V3(14, 18, 0)), 0.8), o.p.clone().add(V3(0, 0.3, 0)), 44]; });   /* V2.0: bỏ cận tay đào → toàn */
    MAY('C06-05', dolly(HAM.clone().add(V3(-9, 3.2, 8)), HAM.clone().add(V3(-6, 2.6, 5)), HAM.clone().add(V3(0.5, 0.6, 0)), undefined, 42));
    MAY('C09-02', (u, t) => { const o = dau(3, 0, 'C09-02')(); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, -32).add(V3(0, 13, 0))), o.p.clone().add(V3(0, 0.5, 0)), 44]; });   /* V2.0: toàn */
    MAY('C09-03', (u, t) => { const o = diemHao(1, 0.57); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)), f = V3(Math.sin(o.yaw), 0, Math.cos(o.yaw)); return [tren(o.p.clone().addScaledVector(r, -22 + u * 2).addScaledVector(f, 8).add(V3(0, 10, 0))),   /* V2.0: toàn tổ cứu thương */ o.p.clone().addScaledVector(f, 1).add(V3(0, 0.2, 0)), 42]; });   /* V1.7: nhìn ngang hào: chiến sĩ hy sinh, tổ cứu thương bên cạnh */
    MAY('C06-06', (u, t) => { const o = diemHao(0, tienHao(t)) || { p: TC }; const a = o.p.clone().add(V3(0, 40, 0)), b = V3((o.p.x + TC.x) / 2 - 900, TC.y + 1800, (o.p.z + TC.z) / 2 + 1400); return [tren(a.lerp(b, ease(u))), o.p.clone().lerp(TC, ease(u)), 46]; });
    // H08 Bầu trời Khe Sanh
    const b52 = () => (KS.MB.b52 && KS.MB.b52[1].visible ? KS.MB.b52[1] : null), c130 = () => (KS.MB.c130 && KS.MB.c130.visible ? KS.MB.c130 : null);
    MAY('C07-01', (u, t) => { const o = b52(); if (!o) return [V3(TC.x - 6000, TC.y + 3200, TC.z + 1500), TC, 46]; const y = o.rotation.y; return [o.position.clone().add(V3(-Math.sin(y) * 480 + 120, 150, -Math.cos(y) * 480 + 80)),   /* V2.0: lùi xa B-52 */ o.position.clone().add(V3(Math.sin(y) * 200, -60, Math.cos(y) * 200)), 46]; });
    MAY('C07-02', (u) => { const A = KS.PM('h881n'); return [tren(V3(A.x + 2600, A.y + 1700, A.z + 2600 - u * 600)), V3(A.x + 900, A.y, A.z + 900), 46]; });
    MAY('C07-03', (u, t) => { const o = diemHao(1, 1 - 12 / (HL[1] || 2000)); if (!o) return null; const r = V3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); return [tren(o.p.clone().addScaledVector(r, 28).add(V3(0, 11, 0))), o.p.clone().add(V3(0, 0.4, 0)), 44]; });   /* V2.0: toàn */
    MAY('C07-04', (u, t) => { const o = c130(); if (!o) return [V3(TC.x + 2600, TC.y + 600, TC.z + 300), TC, 46]; const y = o.rotation.y + NB; return [o.position.clone().add(V3(-Math.sin(y) * 330 + 90, 120, -Math.cos(y) * 330 + 60)),   /* V2.0: lùi xa C-130 */ o.position.clone().add(V3(Math.sin(y) * 120, -10, Math.cos(y) * 120)), 46]; });
    MAY('C07-05', (u) => { const D = KS.DU && KS.DU[1]; if (!D || !D.h.visible) return null; const p = D.h.position; return [tren(p.clone().add(V3(110, 45, 90))), p.clone().add(V3(0, -20, 0)), 44]; });   /* V2.0: toàn — nhiều kiện dù rơi */
    MAY('C07-06', quanh(DZ, 42, 18, 0.6, 1.0, 42));
    MAY('C07-07', dolly(V3(TC.x + 800, TC.y + 500, TC.z + 1200), V3(TC.x + 3400, TC.y + 3000, TC.z + 4400), TC, TC, 46));
    // H10 Mùa hè 1968 – quân Mỹ rời Tà Cơn
    const xeRut = () => { const X = XE.find((x) => x.ten === 'Rút quân' && x.obj.visible); return X ? { p: X.obj.position, yaw: X.obj.rotation.y } : null; };
    MAY('C12-01', C['C02-01'] || quanh(TC, 3000, 2500, 0, 0.2, 46));
    MAY('C12-02', (u, t) => theo(xeRut, 48, 16, 26, 44, 10)(u, t) || [TC.clone().add(V3(0, 200, 300)), TC, 44]);
    MAY('C12-03', quanh(TC, 900, 260, 3.6, 4.4, 44));
    MAY('C12-04', dolly(GAC.clone().add(V3(-10, 2.6, -8)), GAC.clone().add(V3(-6, 1.9, -5)), GAC.clone().add(V3(0, 0.6, 0)), undefined, 40));
    MAY('C12-05', dolly(rwB.clone().add(V3(150, 40, 60)), rwA.clone().add(V3(-80, 30, 40)), rwB.clone().lerp(rwA, 0.5), rwA, 50));
    MAY('C11-02', theo((t) => tuan10(t), 13, 3, -7, 42, 4));
    MAY('C11-04', (u) => { const o = KS.m48 && KS.m48[0]; if (!o) return null; const p = o.position; return [tren(p.clone().add(V3(Math.sin(u * 0.5 + 0.4) * 48, 16, Math.cos(u * 0.5 + 0.4) * 48))), p.clone().add(V3(0, 1.6, 0)), 44]; });   /* V2.0: toàn xe M48 */
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
      return diTheo([G(hx + Math.sin(a) * 3, hz + Math.cos(a) * 3), G(LZ.x + Math.sin(a) * 34, LZ.z + Math.cos(a) * 30)], 2.7, tv('H09', 33) + (i % 5) * 0.7); });
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
    MAY('C03-03', (u) => { const o = PB[1]; if (!o) return [CRc.clone().add(V3(0, 200, 300)), CRc, 44]; const y = o.rotation.y, p = o.position; return [tren(p.clone().add(V3(Math.sin(y + Math.PI + 0.6) * 48, 16, Math.cos(y + Math.PI + 0.6) * 48))), p.clone().add(V3(Math.sin(y) * 30, 2, Math.cos(y) * 30)), 44];   /* V2.0: lùi xa khẩu pháo */ });
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
    MAY('C10-05', (u) => { const o = UH[1]; if (!o) return null; const p = o.position; return [tren(p.clone().add(V3(55 + u * 8, 18, 40)), 1), p.clone().add(V3(0, 1.5, 0)), 44]; });   /* V2.0: bỏ cận cánh quạt → toàn bãi đáp */
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
{
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
    // V1.8 (anh Thắng: biển mất chữ hai bên; biển hai mặt đều đọc được): cỡ chữ tự thu cho vừa 88 % bề ngang; hai tấm quay lưng vào nhau, mỗi tấm chỉ vẽ mặt trước
    const veChu = (g, t, co, w) => { let c = co; do { g.font = `700 ${c}px system-ui, sans-serif`; c -= 2; } while (g.measureText(t).width > w && c > 10); };
    const bien = (dong, rong, cao, nen = '#2a2118', chu = '#f1e2b8') => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * cao / rong); const g = cv.getContext('2d');
      g.fillStyle = nen; g.fillRect(0, 0, cv.width, cv.height); g.strokeStyle = chu; g.lineWidth = 6; g.strokeRect(10, 10, cv.width - 20, cv.height - 20); g.fillStyle = chu; g.textAlign = 'center'; g.textBaseline = 'middle';
      dong.forEach(([t, co], i) => { veChu(g, t, co, cv.width * 0.88); g.fillText(t, cv.width / 2, cv.height * (i + 0.5) / dong.length); });
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshBasicMaterial({ map: tx }), gr = new THREE.Group();
      const a = new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), m), b = new THREE.Mesh(new THREE.PlaneGeometry(rong, cao), m); b.rotation.y = Math.PI; b.position.z = -0.02; gr.add(a, b); return gr; };
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
    // V1.8 (anh Thắng: cạnh khí tài có bảng thông tin như ở bảo tàng, lại gần bấm vào xem): bảng nghiêng trên chân, quay ra lối đi
    const BANG = [], chanMat = mat(0x3b342b);
    const bangTT = (k, i) => { const cv = document.createElement('canvas'); cv.width = 640; cv.height = 440; const g = cv.getContext('2d'), qgp = k.ben === 'qgp';
      g.fillStyle = '#f3ecdc'; g.fillRect(0, 0, 640, 440); g.fillStyle = qgp ? '#8e1c14' : '#1c3468'; g.fillRect(0, 0, 640, 70);
      g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; veChu(g, k.ten, 34, 600); g.fillText(k.ten, 20, 36);
      g.fillStyle = '#3a2f22'; g.font = '600 22px system-ui, sans-serif'; g.fillText({ qgp: 'Quân Giải phóng (QĐND Việt Nam)', my: 'Quân đội Mỹ', vnch: 'Quân lực VNCH' }[k.ben], 20, 98);
      k.tt.slice(0, 4).forEach(([a, v], r) => { g.font = '600 21px system-ui, sans-serif'; g.fillStyle = '#6b5a40'; veChu(g, a, 21, 250); g.fillText(a, 20, 150 + r * 54); g.fillStyle = '#1e1810'; veChu(g, v, 23, 340); g.fillText(v, 280, 150 + r * 54); });
      g.fillStyle = '#8a6d3b'; g.font = 'italic 600 20px system-ui, sans-serif'; g.fillText('Bấm vào bảng hoặc khí tài để xem đầy đủ, có nguồn', 20, 412);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
      const gr = new THREE.Group(), bang = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.03, 0.04), [chanMat, chanMat, chanMat, chanMat, new THREE.MeshBasicMaterial({ map: tx }), chanMat]);
      bang.position.y = 1.15; bang.rotation.x = -0.5; gr.add(bang); const chan = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), chanMat); chan.position.y = 0.5; gr.add(chan);
      const huongLoi = k.v < -8 ? 1 : -1, xa = k.buc ? k.buc[1] / 2 + 1.6 : 30, lech = k.buc ? k.buc[0] / 2 - 0.6 : 0;
      gr.position.copy(P(k.u + lech, k.v + huongLoi * xa, 0)); gr.rotation.y = huongLoi > 0 ? 0 : Math.PI; gr.userData.btK = i; G.add(gr); BANG.push(gr); };
    K.forEach((k, i) => bangTT(k, i));
    for (const k of K) {
      if (k.buc) { const [a, b] = k.buc, m = new THREE.Mesh(new THREE.BoxGeometry(a, 0.5, b), [VIEN, VIEN, BUC, VIEN, VIEN, VIEN]); m.position.copy(P(k.u, k.v, 0.25)); m.userData.btK = K.indexOf(k); G.add(m); k.dy = 0.5; }
      else { const m = new THREE.Mesh(new THREE.RingGeometry(26, 27.2, 48).rotateX(-Math.PI / 2), mat(0xf0e6c8)); m.position.copy(P(k.u, k.v, 0.03)); G.add(m); k.dy = 0; }   /* máy bay lớn: vòng kẻ trên sàn */
      if (k.mau) glbLoad(k.mau).then((g) => { const o = g.scene.clone(true); o.position.copy(P(k.u, k.v, k.dy)); o.rotation.y = k.y; o.userData.btK = K.indexOf(k); G.add(o); k.o = o;
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
    { const rc = new THREE.Raycaster(), nd = new THREE.Vector2(); let p0 = null;
      const ngoai = (e) => e.target.closest && e.target.closest('button, input, select, a, .card, #btThe, .lbl b, #joy, #runbtn');   /* bấm vào giao diện thì bỏ qua */
      addEventListener('pointerdown', (e) => { p0 = ngoai(e) ? null : [e.clientX, e.clientY]; }, true);
      addEventListener('pointerup', (e) => { if (!p0 || ngoai(e) || !G.visible || Math.hypot(e.clientX - p0[0], e.clientY - p0[1]) > 6) return;
        const r = renderer.domElement.getBoundingClientRect(); nd.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); rc.setFromCamera(nd, camera);
        for (const h of rc.intersectObject(G, true)) { if (h.distance > 260) break; let o = h.object; while (o && o.userData.btK == null && o !== G) o = o.parent; if (o && o.userData.btK != null) { moThe(K[o.userData.btK]); e.stopPropagation(); return; } } });
      addEventListener('keydown', (e) => { if (e.key === 'Escape') the.hidden = true; }); }   /* V1.8: bấm khí tài, bục, bảng thông tin đều mở thẻ */
    GHIM_SAU.push(() => { for (const k of K) addLabel(k.ten, BT.x + k.u, BT.z + k.v, 'hero ' + (k.ben === 'qgp' ? 'ly' : 'btmy'), { grp: 'hero', maxDist: 300, yFn: () => HF + k.dy + k.h + 0.8,
      show: () => G.visible, onClick: () => moThe(k) }); });
    // hiện / ẩn: chỉ hiện ở hồi cuối và khi tự khám phá — trong phim các hồi trận đánh không thấy
    let napXong = false;
    // chạy theo khung hình của trình duyệt (cả khi phim dừng, khi khám phá, khi đi bộ — KS.cap chỉ chạy trong phim)
    const capBT = () => { const t = T, on = appMode !== 'film' || t >= H12.t0 - 1.5;
      if (on !== G.visible) { G.visible = on; if (on && !napXong) { napXong = true; KS.napSan(G); } if (!on) the.hidden = true; }
      const het = appMode === 'film' && !playing && t >= DUR - 0.3; nut.classList.toggle('cuoi', het); ve.hidden = !(het && !W.on && !document.getElementById('load'));
      nut.hidden = !(on && !W.on && !document.getElementById('load') && (appMode === 'film' ? t >= H12.t0 + 2 : true)); nut.classList.toggle('nho', appMode !== 'film'); };   /* khám phá: nút nhỏ ở góc, bấm là tới sân trưng bày */
    // V1.6: đi bộ không xuyên qua bục trưng bày — chạm mép bục thì bị đẩy ra theo phía gần nhất (máy bay lớn không có bục: đi dưới cánh được)
    const chanBuc = () => { if (!W.on || !G.visible) return; for (const k of K) { if (!k.buc) continue; const dx = W.pos.x - (BT.x + k.u), dz = W.pos.z - (BT.z + k.v), hx = k.buc[0] / 2 + 0.45, hz = k.buc[1] / 2 + 0.45;
      if (Math.abs(dx) < hx && Math.abs(dz) < hz) { if (hx - Math.abs(dx) < hz - Math.abs(dz)) placeAvatarAt(BT.x + k.u + Math.sign(dx || 1) * hx, W.pos.z); else placeAvatarAt(W.pos.x, BT.z + k.v + Math.sign(dz || 1) * hz); } } };
    const lapBT = () => { try { capBT(); chanBuc(); } catch (e) {} requestAnimationFrame(lapBT); };
    // nút vào đi bộ tham quan (cuối phim và khi khám phá)
    // V1.7 (anh Thắng): hết phim hiện nút "Vào Bảo tàng" (phải) và nút trở về trang Không gian lịch sử (trái). Địa chỉ trang: pack.json › ui.trangChu (mặc định "/").
    const ve = document.createElement('button'); ve.id = 'btVe'; ve.hidden = true; ve.textContent = '← Về trang Không gian lịch sử'; document.body.appendChild(ve);
    ve.onclick = () => KS.veTrang();
    const nut = document.createElement('button'); nut.id = 'btVao'; nut.hidden = true; nut.textContent = '🏛 Vào Bảo tàng khí tài (đi bộ) →'; document.body.appendChild(nut);
    requestAnimationFrame(lapBT);
    KS.BT.vao = () => nut.onclick(); KS.BT.G = G;
    if (QS.get('baotang') === '1') { const cho = setInterval(() => { if (!document.getElementById('load')) { clearInterval(cho); setTimeout(() => KS.BT.vao(), 400); } }, 300); }   /* mở từ nút "Bảo tàng" ở tầng chiến dịch */
    nut.onclick = () => { setPlaying(false); setAppMode('explore'); flyA = null;
      controls.target.copy(P(-RG / 2 + 22, -8, 1.6)); camera.position.copy(controls.target).add(V3(-9, 3, 0)); setWalk(true); };
    // máy quay hồi kết (H12): bay xuống sân, lia dọc hai dãy, quanh máy bay, dừng ở cổng
    const dolly = (a, b, la, lb, fov = 42) => (u) => { const e = ease(u); return [a.clone().lerp(b, e), la.clone().lerp(lb, e), fov]; };
    const C14 = { 'C14-01': (u) => { const a = 2.6 - ease(u) * 1.0, r = 420 - ease(u) * 230; return [P(Math.sin(a) * r, Math.cos(a) * r, 190 - ease(u) * 140), P(0, 10, 0), 46]; },
      'C14-02': dolly(P(-135, -14, 9), P(45, -14, 7), P(-100, -40, 2), P(40, -40, 2), 44),
      'C14-03': dolly(P(-135, 6, 8), P(20, 4, 6), P(-100, 30, 1.5), P(10, 34, 2), 44),
      'C14-04': (u) => { const a = -1.2 + ease(u) * 1.6, c = P(75, 50, 3); return [c.clone().add(V3(Math.sin(a) * 95, 22 - u * 6, Math.cos(a) * 95)), c, 44]; },
      'C14-05': dolly(P(-RG / 2 - 60, -8, 30), P(-RG / 2 - 16, -8, 16), P(0, -6, 0), P(10, -6, 0), 50) };   /* V1.7: dừng trên cao sau biển cổng — không để biển che kín khung khi hiện hai nút cuối phim */
    for (const [id, fn] of Object.entries(C14)) SHOTS[id] = fn;
  }
  // V1.8 (anh Thắng): nút "Bảo tàng" đặt trong nhóm chế độ: Phim tự động · Bảo tàng · Khám phá · Góc nhìn nhân vật — bấm để chuyển qua lại; cả hai tầng
  { const md = $('modes'), b = document.createElement('button'); b.id = 'bBT'; b.setAttribute('role', 'tab'); b.textContent = '🏛 Bảo tàng'; b.title = 'Không gian trưng bày khí tài hai bên — đi bộ tham quan';
    const phim = md && md.querySelector('button[data-m="film"]'); if (md) md.insertBefore(b, phim ? phim.nextSibling : null);
    b.onclick = () => { if (TANG === 'ta-con' && KS.BT && KS.BT.vao) { KS.BT.vao(); return; }
      const h = STORY.scenes.find((c) => c.id === 'H12'), q = new URLSearchParams(location.search); q.set('tang', 'ta-con'); q.set('t', ((h ? h.t0 : 824) + 3).toFixed(2)); q.set('phat', '1'); q.set('baotang', '1'); q.delete('chuong'); q.delete('tiep');
      let anh = null; try { renderer.render(scene, camera); anh = renderer.domElement.toDataURL('image/jpeg', 0.82); } catch (e) {}
      if (window.parent !== window && window.parent.__doiTang) window.parent.__doiTang(q.toString(), anh); else location.search = q.toString(); };
    md && md.addEventListener('click', (e) => { const x = e.target.closest('button[data-m]'); if (x && x.dataset.m === 'explore' && W.on && KS.BT && KS.BT.G && KS.BT.G.visible && Math.hypot(W.pos.x - KS.BT.BT.x, W.pos.z - KS.BT.BT.z) < 400) setWalk(false); });   /* rời bảo tàng khi bấm Khám phá */
    const capNut = () => { const o = KS.BT && KS.BT.G && W.on && Math.hypot(W.pos.x - KS.BT.BT.x, W.pos.z - KS.BT.BT.z) < 400;
      b.classList.toggle('on', !!o); b.setAttribute('aria-selected', !!o); if (o) md.querySelectorAll('button[data-m]').forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-selected', false); });
      requestAnimationFrame(capNut); }; requestAnimationFrame(capNut); }
  // V1.8 (anh Thắng: thẻ "Không gian lịch sử" ở trên có nút quay lại trang Không gian lịch sử)
  KS.veTrang = () => { const u = (PACK.ui && PACK.ui.trangChu) || '/', ngoai = window.parent !== window && window.parent.__doiTang;
    if (ngoai) { if (/^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else window.parent.__doiTang(''); } else location.href = u; };
  { const tt = document.querySelector('.card.title .eyebrow'); if (tt) { const b = document.createElement('button'); b.id = 'btLui'; b.title = 'Về trang Không gian lịch sử'; b.setAttribute('aria-label', 'Về trang Không gian lịch sử'); b.textContent = '←'; b.onclick = () => KS.veTrang(); tt.prepend(b); } }
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
  if (TANG === 'chien-dich') return { all: [0, 0, R * 1.9, 180, 40], tacon: v('tacon', 9000, 200, 35), langvay: v('langvay', 9000, 200, 35), rockpile: v('rockpile', 9000, 200, 35) };
  return { all: [0, 0, R * 1.9, 180, 40], tacon: v('tacon', 2200, 200, 30), h881s: v('h881s', 2200, 200, 30), langvay: v('langvay', 2200, 200, 30), khesanh: v('khesanh', 2200, 200, 30) };
})();
{ // 2.2: nút đổi tầng địa hình (tải lại trang ở cùng thời điểm phim)
  const b = document.createElement('button'); b.className = 'tang'; b.textContent = TANG === 'ta-con' ? '⇄ Toàn chiến dịch' : '⇄ Căn cứ Tà Cơn';
  b.title = 'Đổi tầng địa hình (tải lại sa bàn tại cùng thời điểm)'; b.onclick = () => doiTang(TANG === 'ta-con' ? 'chien-dich' : 'ta-con', T, playing);
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
    if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { if (XEX.DL) { const [a, b] = XEX.DL(0, 175); x = a; z = -b; } else { x = SG.x; z = SG.z; } }
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
  : (() => { const P = (k) => LL(MOC[k][0], MOC[k][1], 0), tc = P('tacon'), h = P('h881s'), lv = P('langvay');   // đứng xem (Khe Sanh)
      const L = [['Trên điểm cao 881 Nam nhìn về căn cứ', h.x, h.z, 4, [tc.x, tc.z]], ['Đầu đường băng Tà Cơn', tc.x + 500, tc.z, 3, [tc.x - 600, tc.z]], ['Cứ điểm Làng Vây', lv.x + 150, lv.z + 120, 3, [lv.x, lv.z]]];
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
const HCM_BED = ['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang'];   // Khe Sanh: chỉ các tệp có trong gói
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
const NGAY_HOI = { H01: ['', '1968', 'Thung lũng Khe Sanh, phía Tây Quảng Trị'], H02: ['', 'Cuối 1967 – đầu 1968', 'Căn cứ Tà Cơn và các điểm cao'],
  H03: ['', 'Cuối năm 1967', 'Chuẩn bị Chiến dịch Đường 9 – Khe Sanh'], H04: ['Đêm 20, rạng sáng', '21.1.1968', 'Chiến dịch mở màn'],
  H05: ['Đêm 30, rạng sáng', '31.1.1968', 'Tổng tiến công và nổi dậy Tết Mậu Thân'], H06: ['Đêm 6, rạng sáng', '7.2.1968', 'Trận Làng Vây'],
  H07: ['', '10.2 – 31.3.1968', 'Vây lấn Tà Cơn'], H08: ['', '21.1 – 8.4.1968', 'Không kích và không vận quanh Khe Sanh'],
  H09: ['', '1.4.1968', 'Chiến dịch Pegasus bắt đầu'], H10: ['', 'Mùa hè 1968', 'Quân Mỹ rút khỏi Tà Cơn'], H11: ['', '20.1 – 15.7.1968', 'Chiến dịch Đường 9 – Khe Sanh'] };
const MOC_NGAY = { L: STORY.scenes.filter((c) => NGAY_HOI[c.id]).map((c) => { const [g, d, x] = NGAY_HOI[c.id]; return [c.t0 + 5.5, (g ? g + ' · ' : '') + d, x]; }),
  el: null, cur: -1,
  tick() { if (!this.el) { const st = document.createElement('style');
      st.textContent = '#mocNgay{position:fixed;right:max(16px,2.2vw);top:34%;transform:translateY(-50%);max-width:min(46vw,380px);text-align:right;pointer-events:none;z-index:30;opacity:0;transition:opacity .8s;color:#fff4dc;text-shadow:0 2px 10px rgba(0,0,0,.75),0 0 2px rgba(0,0,0,.9)}#mocNgay.on{opacity:1}#mocNgay u{display:block;text-decoration:none;font-size:clamp(15px,1.9vw,24px);font-weight:700;color:#f0c040;white-space:nowrap}#mocNgay b{display:block;font-size:clamp(22px,3.2vw,42px);font-weight:800;letter-spacing:.02em;line-height:1.1;white-space:nowrap}#mocNgay i{display:block;margin-top:6px;padding-top:6px;border-top:2px solid #f0c040;font-style:normal;font-size:clamp(12px,1.35vw,17px);line-height:1.3;color:#f6e7c4}@media (max-width:700px){#mocNgay{top:auto;bottom:44%;transform:none;max-width:72vw;background:rgba(24,19,14,.62);padding:8px 12px;border-radius:12px}}';
      document.head.append(st); this.el = document.createElement('div'); this.el.id = 'mocNgay'; this.el.innerHTML = '<u></u><b></b><i></i>'; document.body.append(this.el); }
    let k = -1; if (appMode === 'film') for (let i = 0; i < this.L.length; i++) if (T >= this.L[i][0] - 0.2 && T < this.L[i][0] + 6.5) k = i;
    if (k !== this.cur) { this.cur = k; if (k >= 0) { const [g, d] = this.L[k][1].includes(' · ') ? this.L[k][1].split(' · ') : ['', this.L[k][1]]; this.el.querySelector('u').textContent = g; this.el.querySelector('b').textContent = d; this.el.querySelector('i').textContent = this.L[k][2]; } this.el.classList.toggle('on', k >= 0); } } };
const NHAC_DUR = { 'hiep-si': 231.2, 'ke-thu': 130.2, 'thuc-day': 118.5, 'tro-ve': 105.1, 'giua-tran': 146.4, 'quyet-chien': 97, 'vi-thanh': 114.7 };
const NHAC_KS = { H01: ['thuc-day', 0, 0.34], H02: ['hiep-si', 50, 0.4], H03: ['giua-tran', 0, 0.34], H04: ['quyet-chien', 0, 0.34], H05: ['ke-thu', 0, 0.32], H06: ['quyet-chien', 20, 0.36],
  H07: ['giua-tran', 40, 0.34], H08: ['ke-thu', 50, 0.32], H09: ['hiep-si', 100, 0.38], H10: ['tro-ve', 0, 0.36], H11: ['vi-thanh', 0, 0.44], H12: ['hiep-si', 0, 0.3] };   // nhạc theo hồi Khe Sanh (MINH HOẠ, anh duyệt lại)
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
  if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi && seeking) { $('sub').hidden = false; $('sub').textContent = 'Thả thanh thời gian để chuyển sang ' + (scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch') + '…'; }
  else if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) { update.doi = true; $('sub').hidden = false; $('sub').textContent = 'Đang chuyển sang ' + (HCM ? (scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') : (scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch')) + '…'; doiTang(scn.tang, Math.max(t, scn.t0 + 0.05), playing); return; }   // t làm tròn có thể rơi về cảnh trước (tầng cũ) → đổi tầng qua lại mãi
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
  if (scn.id !== lastScene) { lastScene = scn.id; $('stitle').textContent = `${scn.id} · ${scn.title}`; if (appMode === 'film') $('sdate').textContent = `Cảnh ${i + 1}/${NSC} · ${scn.title}`; $('slist').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); }
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
