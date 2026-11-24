// Chiến dịch Hồ Chí Minh 1975 · phần riêng của trận, cắm vào bộ máy 2.2.0 tại các chỗ /*@@RIENG:sN@@*/.
// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy.
// Bản GĐ3 (24/11/2026): thử bộ máy 2.2 — hai tầng địa hình (chiến dịch / nội đô), xe GLB chạy theo đường phố, lính lái tăng có xương.
// Mũi tên 5 hướng và lịch chạy xe ở đây là PHÁC THẢO để thử bộ máy; nội dung chốt theo nguồn ở GĐ5 (docs/HCM_1975_TU_LIEU.md).
//@@ s1
// Sa bàn Chiến dịch Hồ Chí Minh 1975 — three.js, bộ máy 2.2.0 (họ Bạch Đằng). Tái dựng mô phỏng.
//@@ s2
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
progress(0.35, 'Đang dựng địa hình ' + (TANG === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') + '…');
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
const MOC = {
  dinh: [10.77694, 106.69534, 'Dinh Độc Lập'],
  tsn: [10.8172, 106.65651, 'Sân bay Tân Sơn Nhất'],
  thinghe: [10.79169, 106.70640, 'Cầu Thị Nghè'],
  causg: [10.79870, 106.72600, 'Cầu Sài Gòn'],
  btt: [10.80326, 106.67153, 'Bộ Tổng tham mưu'],                    // nay là Bộ Tư lệnh Quân khu 7 (OSM); trùng "Vietnam Staff Compound" trên sơ đồ 1968 (M3)
};
// đường xe 843, 390 vào Dinh (tools/sa_ban/dia_hinh/tim_duong.py trên mạng đường OSM đã bỏ đường làm sau 1975) + đoạn vào sân Dinh — PHÁC THẢO
const DUONG_DINH = (INST.duong && INST.duong.dinh) || [];
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
const XEX = { x843: null, x390: null, lai843: null, ctt: null, than: null };
if (TANG === 'noi-do' && DUONG_DINH.length) {
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
                DL(13, 159.4), DL(5, 156.5), DL(1.5, 149.3), DL(3, 138), DL(10, 123), DL(14, 109)],   // rồi lùi ra, theo 390 qua cổng chính vào sân (anh Thắng 24/11)
        D390 = [...CT.slice(0, -1), ...GOC.slice(0, -1), DL(0, 162), DL(0, 149.3), DL(-1.5, 138), DL(-10, 118), DL(-20, 100), DL(-19, 72), DL(-9, 42)];
  const dai = (P, k) => { let a = 0; for (let i = 1; i <= k; i++) a += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return a; };
  const L1 = dai(CT, CT.length - 1), g843 = dai(D843, D843.length - 7), gLui = dai(D843, D843.length - 6), g843v = dai(D843, D843.length - 1), g390 = dai(D390, CT.length - 1 + GOC.length);   // L1: cầu Sài Gòn → Thị Nghè; 843 tới cổng phụ; 390 tới cổng chính
  const HX = LL(10.8013, 106.7113);                                                       // ngã tư Hàng Xanh (toạ độ OSM 2026)
  const dHX = (() => { let b = [1e9, 0], a = 0; for (let i = 1; i < CT.length; i++) { a += Math.hypot(CT[i][0] - CT[i - 1][0], CT[i][1] - CT[i - 1][1]);
    const e = Math.hypot(CT[i][0] - HX.x, -CT[i][1] - HX.z); if (e < b[0]) b = [e, a]; } return b[1]; })();
  const fD = tDinh, cat = 0.02;                                                            // f: giây voice → giờ Dinh; cat: chuyển cảnh (xe "nhảy" theo cú máy)
  // từng đoạn theo cú máy C10: đầu cầu Sài Gòn (M48) · ngã tư Hàng Xanh (390 đi đầu, bắn cháy M113) · cầu Thị Nghè · Hồng Thập Tự
  XEX.L1 = L1; XEX.dHX = dHX;
  // 843 húc cổng phụ bên trái, bị kẹt lại ở cổng phụ (TƯ LIỆU §2: S7, S8, S18; vietnamnet); xe 390 húc đổ cổng chính (S34, S33)
  const LC = MV.c10_cau ? (a, b, c, d, e) => [[-999, a], [fD(MV.c10_cau), a], [fD(MV.c10_hx) - cat, a + 160], [fD(MV.c10_hx), b], [fD(MV.c10_tn) - cat, c], [fD(MV.c10_tn), d], [42, e]] : () => [[42, L1]];
  XEX.x843 = await xeTao('data/xe/xe-tang-843.glb', { duong: D843, lich: [...LC(60, dHX - 120, dHX + 10, L1 - 210, L1 + 40), [84, g843], [91.6, g843], [93.6, gLui], [104, g843v], [999, g843v]], hien: (t) => t >= -60, ten: 'Xe tăng 843' });
  XEX.x390 = await xeTao('data/xe/xe-tang-390.glb', { duong: D390, lich: [...LC(15, dHX - 60, dHX + 70, L1 - 255, L1 - 5), [90, g390], [108, dai(D390, D390.length - 1)]], hien: (t) => t >= -60, ten: 'Xe tăng 390' });
  XEX.DL = DL;
  // NHÀ CỬA SÀI GÒN 1975 — vị trí xếp sẵn bằng tools/sa_ban/nha/xep_nha.py (props/nha/xep.json), mẫu dung_nha_pho.py (props/nha/nha-pho.glb).
  // Theo ảnh anh Thắng gửi 24/11: nhà phố cũ (4 kiểu chi tiết sát lộ trình xe tăng), phố nhìn từ trên cao (nhà xa: mái ngói, mái tôn, bê tông kín lõi khối phố),
  // nhà lá trên cọc ven kênh (ảnh kênh Hàng Bàng – Chợ Lớn), xuồng, ghe. MINH HOẠ mật độ đô thị, không phải bản đồ từng căn.
  // Vẽ hàng loạt theo ô 1,5 km × kiểu (InstancedMesh), ô xa thì ẩn bớt (ẩn trước: nhà chi tiết, nhà lá, ghe).
  { const [g, X] = await Promise.all([glbLoad('data/nha/nha-pho.glb'), fetch(PU('data/nha/xep.json')).then((r) => r.json())]);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y1 = new THREE.Vector3(0, 1, 0), cl = new THREE.Color(), O = 1500;
    const DT = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 820;   // điện thoại, máy tính bảng: tỉa tiếp, nhìn gần hơn
    XEX.nha = []; let tong = 0;
    for (const [kieu, A0] of Object.entries(X.kieu)) {
      const ten = kieu.replace(/[~^]/g, ''), tia = !DT || !ten.startsWith('Xa') || kieu.endsWith('^') ? 0 : kieu.endsWith('~') ? 0.5 : 0.25;   // '^': nhà sát lộ trình (không tỉa)   // tên có ~ : nhà lõi khối phố
      const A = []; for (let i = 0; i < A0.length; i += 4) if (!tia || ((((i >> 2) * 2246822519) >>> 0) / 4294967296) >= tia) A.push(A0[i], A0[i + 1], A0[i + 2], A0[i + 3]);
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
      const ngoai = P3(2, 151), trong = P3(0, 62);
      const giua = P3(5, 70);
      if (t < 122.5) { const u = (t - 116.4) / 6.1, p = lerpP(ben, giua, u); return { ...p, yaw: yawTo(ben, giua), clip: 'chaynhanh', toc: 1.35 }; }   // từ xe 843 trong sân chạy thẳng về phía Dinh
      if (t < 128) { const u = (t - 122.5) / 5.5, p = lerpP(giua, cua, u); return { ...p, yaw: yawTo(giua, cua), clip: 'chaynhanh', toc: 1.35 }; }      // băng qua bãi cỏ tới thềm
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
    o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.multiplyScalar(0.3); m.material.roughness = 1; } });   // cháy đen
    const x = p.x + Math.cos(p.yaw) * 9, z = p.z - Math.sin(p.yaw) * 9; o.position.set(x, hG(x, z), z); o.rotation.set(0.04, p.yaw + 2.3, -0.06); scene.add(o);
    XEX.m41chay = o; LAYER.xe.push(o);
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(32, 32, 2, 32, 32, 31);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
    const km = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), color: 0x3a3836, transparent: true, opacity: 0.4, depthWrite: false });   // khói đen bốc lên
    const khoi = () => Array.from({ length: 10 }, (_, i) => { const sp = new THREE.Sprite(km.clone()); sp.userData.k = i / 10; scene.add(sp); LAYER.xe.push(sp); return sp; });
    XEX.chay = [{ o, khoi: khoi() }];
    // xác M113 cháy cạnh M41, bên kia đường (S36: xe 387 bắn cháy M41 và M113 án ngữ cầu Thị Nghè)
    { const q = diemTren(D, best[1] + 60), g2 = await glbLoad('data/xe/xe-boc-thep-m113.glb'), o2 = g2.scene.clone(true);
      o2.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.multiplyScalar(0.3); m.material.roughness = 1; } });
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
      const x3 = cs.x - 160, z3 = cs.z + 40; o3.position.set(x3, hG(x3, z3), z3); o3.rotation.y = 1.3; scene.add(o3); LAYER.xe.push(o3); XEX.m48 = o3; } }
  const tren = (X, dy, lui) => (t) => { if (!X.obj.visible) return null; const p = X.obj.position, y = X.obj.rotation.y; return { x: p.x - Math.sin(y) * lui, z: p.z - Math.cos(y) * lui, y: p.y + dy, yaw: y, clip: 'dung' }; };   // trưởng xe đứng ở cửa tháp pháo
  const t843 = tren(XEX.x843, 1.35, 0.4);
  XEX.lai843 = await nvxTao('models/linh-tang.glb', (t) => (t < 115 ? t843(t) : null), { ten: 'Trưởng xe 843' });   // từ 1:55 Bùi Quang Thận rời xe (nhân vật riêng bên dưới)
  XEX.lai390 = await nvxTao('models/linh-tang.glb', tren(XEX.x390, 1.35, 0.4), { ten: 'Trưởng xe 390' });
  for (const X of [XEX.x843, XEX.x390]) LAYER.xe.push(X.obj);
}
// NGƯỜI DÂN (mẫu người dân Nam bộ của sa bàn Rạch Gầm – Xoài Mút: áo bà ba, nón lá, khăn rằn; ba biến thể, .nvz dùng chung bộ máy 2.2).
// Trưa 30/4 người dân đổ ra đường đón quân giải phóng (S32). Dọc lộ trình: người đứng hai bên vỉa hè, một số đi bộ; trước cổng Dinh:
// dân kéo tới tụ lại sau khi xe tăng vào (từ 1:30 phim). Vị trí, số người là TÁI DỰNG MINH HOẠ, không theo ảnh từng điểm.
const DAN = [];
if (TANG === 'noi-do' && DUONG_DINH.length) {
  const TINT = [[1, 1, 1], [0.85, 0.82, 0.78], [0.72, 0.7, 0.66], [0.95, 0.9, 0.82]];
  Promise.all([1, 2, 3].map((k) => dongTai('dan' + k, 'models/dan-nam-bo-' + k + '.nvz', 'models/dan-nam-bo-' + k + '.jpg', TINT, 500)))
    .catch((e) => console.warn('người dân', e));
  const D = duong(DUONG_DINH), L0 = D.L, rnd = (() => { let a = 1975; return () => (a = (a * 16807) % 2147483647) / 2147483647; })();
  const ben = (d, lech) => { const p = diemTren(D, d); return { x: p.x + Math.cos(p.yaw) * lech, z: p.z - Math.sin(p.yaw) * lech, yaw: p.yaw }; };   // lệch sang phải (+) / trái (−) theo hướng xe
  for (let d = 40; d < L0 - 230; d += 9 + rnd() * 14) for (const s of [-1, 1]) {        // hai bên đường, mỗi 9–23 m một người
    if (rnd() < 0.35) continue;
    const lech = s * (11 + rnd() * 5), di = rnd() < 0.2;
    DAN.push({ k: 1 + (DAN.length % 3), d, lech, di, v: (rnd() < 0.5 ? 1 : -1) * (1 + rnd() * 0.4), ph: rnd(), vi: DAN.length, t0: 150 + rnd() * 14, quay: s });   // lúc xe tăng vào đường rất vắng; dân ra đường sau trưa
  }
  const G = (() => { const [x, y] = XEX.DL(0, 160); const p = diemTren(D, L0 - 95); return { x, z: -y, yaw: p.yaw }; })();   // ngoài cổng Dinh, đầu Lê Duẩn
  for (let i = 0; i < 160; i++) {
    const r = 10 + rnd() * 60, lat = (rnd() < 0.5 ? -1 : 1) * (13 + rnd() * 35);      // hai bên đường trước cổng, chừa lòng đường cho xe 390 vào sau
    const sy = Math.sin(G.yaw), cy = Math.cos(G.yaw);
    DAN.push({ k: 1 + (i % 3), cong: true, x: G.x - sy * r + cy * lat, z: G.z - cy * r - sy * lat, ph: rnd(), vi: i, t0: 152 + rnd() * 10, buoc: 4 + rnd() * 8 });
  }
  DAN.dat = (t) => {
    dongXoa(); if (!$('ly-nv').checked) return dongXong(false);
    for (const N of DAN) {
      if (t < N.t0) continue;
      if (N.cong) {                                                                       // đi về phía cổng rồi đứng lại
        const u = Math.min(1, (t - N.t0) / 9);
        const dx = G.x - N.x, dz = G.z - N.z, l = Math.hypot(dx, dz) || 1, w = Math.min(N.buoc, l - 6) * u;
        const px = N.x + dx / l * w, pz = N.z + dz / l * w;
        dongDat('dan' + N.k, u < 1 ? 'di' : (N.vi % 4 ? 'dung' : 'dung2'), t, N.ph, px, hG(px, pz) + 0.1, pz, Math.atan2(dx, dz), 1.08, N.vi);
        continue;
      }
      let d = N.d, clip = N.vi % 5 ? 'dung' : 'dung2';
      if (N.di) { d = N.d + ((N.v * (t - 40)) % 40 + 40) % 40 - 20; clip = 'di'; }
      const p = ben(d, N.lech), yaw = N.di ? p.yaw + (N.v > 0 ? 0 : Math.PI) : p.yaw + N.quay * Math.PI / 2;   // người đứng quay mặt ra đường
      dongDat('dan' + N.k, clip, t, N.ph, p.x, hG(p.x, p.z) + 0.1, p.z, yaw, 1.08, N.vi);
    }
    dongXong(true);
  };
}
// ------------------------------------------------------------------ C04 · PHI ĐỘI QUYẾT THẮNG (28/4/1975)
// 16h15 năm A-37 thu được xuất kích từ Phan Rang (S29), ném bom khu đỗ máy bay Tân Sơn Nhất; 18h15 hạ cánh Thành Sơn (S17).
// Vị trí khu đỗ, nhà chứa máy bay của không quân VNCH ("Vietnamese Hangars") theo sơ đồ sân bay 1968 (M3) khớp affine vào bản đồ:
// 2 đầu đường băng (OSM) + "Vietnam Staff Compound" = Bộ Tổng tham mưu (nay Bộ Tư lệnh Quân khu 7, OSM). Sai số vài trăm m — sơ đồ vẽ phỏng.
// Số máy bay đỗ, thứ tự bom rơi là TÁI DỰNG MINH HOẠ (các nguồn ghi số máy bay bị phá khác nhau).
const C04 = {};
if (TANG === 'noi-do') {
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
  const tam = apY(0.5, 11), vao = [tam[0] + 2600, tam[1] + 2300], ra = [tam[0] - 2600, tam[1] - 1300];
  C04.bay = [];
  for (let k = 0; k < 5; k++) { const o = ga.scene.clone(true); o.visible = false; scene.add(o); LAYER.xe.push(o); C04.bay.push({ o, k }); }
  const sprTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 2, 32, 32, 31);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  const sprite = (col, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprTex, color: col, transparent: true, opacity: op, depthWrite: false })); sp.visible = false; scene.add(sp); return sp; };
  trung.forEach((i, n) => { const D = C04.do[i]; C04.no.push({ D, t0: 0, lua: sprite(0xffa040, 0.9), khoi: Array.from({ length: 6 }, (_, j) => Object.assign(sprite(0x2e2b29, 0.4), { k: j / 6 })) }); });
  const T0 = STORY.scenes.find((c) => c.id === 'C04'), t0 = T0 ? T0.t0 : 40, BAY0 = MV.c04_bom ? MV.c04_bom - 6.2 : t0 + 9, BAY1 = BAY0 + 14;   // bom rơi đúng câu "những quả bom được thả xuống"
  C04.no.forEach((N, n) => { N.t0 = BAY0 + 6.2 + n * 0.55; });
  C04.tam = tam; C04.h = hG(tam[0], -tam[1]); C04.t0 = t0; C04.t1 = T0 ? T0.t1 : 75; C04.apY = apY; C04.sprite = sprite;
  C04.cap = (t, dt) => {
    const on = t >= C04.t0 - 0.5 && t < C04.t1 + 0.5;
    for (const B of C04.bay) {
      const u = (t - BAY0 - B.k * 0.45) / (BAY1 - BAY0), vis = on && u > 0 && u < 1; B.o.visible = vis; if (!vis) continue;
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
      for (const K of N.khoi) { K.visible = khoi; if (!khoi) continue; const v = (K.k + U.time.value * 0.05) % 1; K.position.set(p.x + v * 10, p.y + 3 + v * 60, p.z - v * 6); K.scale.setScalar(5 + v * 26); K.material.opacity = 0.5 * (1 - v) * Math.min(1, a / 2); }
    }
  };
}
// ------------------------------------------------------------------ C07 · TÂN SƠN NHẤT 30/4 (S27, S1): 5h30 Sư đoàn 10 cùng hai đại đội xe tăng Trung đoàn 273
// tiến công sân bay; 9h45 Trung đoàn 24 tiếp tục tiến công; 11h30 làm chủ sân bay. Đội hình xe (xe bọc thép K-63, xe tải cắm cờ Mặt trận) và
// đường đi trên sân bay, các điểm nổ: MINH HOẠ (chưa có mẫu xe tăng không số hiệu → không đặt xe tăng ở cảnh này).
const C07 = {}, C89 = {};
if (TANG === 'noi-do' && C04.apY && MV.c07_tc) {
  const A = C04.apY, P = [A(-2.4, 170), A(-1.2, 150), A(-0.2, 90), A(0.3, 55)], fD = tDinh;
  const [gk, gt] = await Promise.all([glbLoad('data/xe/xe-boc-thep-k63.glb'), glbLoad('data/xe/xe-tai.glb')]).catch(() => [null, null]);
  C07.xe = [];
  if (gk && gt) for (let k = 0; k < 4; k++) {
    const D = duong(P), L = D.L, f0 = fD(MV.c07_tc + k * 1.5), f1 = fD(MV.c07_chu - 6 + k * 1.5);
    const X = await xeTao(k % 2 ? 'data/xe/xe-tai.glb' : 'data/xe/xe-boc-thep-k63.glb', { duong: P, lich: [[-1e4, 0], [f0, 0], [f1, L - 30 - k * 28], [1e4, L - 30 - k * 28]], hien: (t) => t >= f0 - 2, ten: k % 2 ? 'Xe tải (minh hoạ)' : 'Xe bọc thép K-63 (minh hoạ)' });
    if (XEX.coXe) XEX.coXe(X.obj, 2.2, 1.1); LAYER.xe.push(X.obj); C07.xe.push(X); }
  C07.no = Array.from({ length: 6 }, (_, k) => ({ sp: C04.sprite(0xff9a4a, 0.9), p: A(-0.6 + k * 0.28, 20 + (k % 3) * 35), ph: k * 0.43 }));
  C07.cap = (t) => { const on = t > MV.c07_tc && t < MV.c07_chu;
    for (const N of C07.no) { const u = ((t - MV.c07_tc + N.ph * 2.4) / 2.4) % 1, v = on && u < 0.45; N.sp.visible = v;
      if (v) { const h = hG(N.p[0], -N.p[1]); N.sp.position.set(N.p[0], h + 6 + u * 30, -N.p[1]); N.sp.scale.setScalar(14 + u * 70); N.sp.material.opacity = 0.9 * (1 - u / 0.45); } } };
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
const HUONG = TANG === 'chien-dich' ? [
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
const SG = LL(10.785, 106.69, 0);
const xeCam = (X, back, up, ahead, fov = 40) => (u) => {
  if (!X || !X.obj.visible) { const c = LL(MOC.dinh[0], MOC.dinh[1], 0); return [c.clone().add(V3(260, 160, 260)), c, 40]; }
  const p = X.obj.position, y = X.obj.rotation.y, f = V3(Math.sin(y), 0, Math.cos(y));
  return [p.clone().addScaledVector(f, -back).add(V3(0, up, 0)), p.clone().addScaledVector(f, ahead).add(V3(0, 2, 0)), fov];
};
const SHOTS = TANG === 'chien-dich' ? {
  'T01-A': fly(V3(0, R * 0.85, R * 1.25), V3(SG.x + R * 0.1, R * 0.55, SG.z + R * 0.75), V3(0, 0, 0), SG.clone(), 45),
  'T01-B': orbit(SG, R * 0.62, R * 0.5, 0.15, -0.35, 45),
  'T02-A': fly(V3(SG.x + R * 0.1, R * 0.55, SG.z + R * 0.75), V3(SG.x + 800, 2500, SG.z + 3000), SG.clone(), SG.clone(), 45),
  'C01-A': (u) => orbit(C01.xl, 22000, 12000, 2.2, 2.9, 42)(u),                                         // Xuân Lộc
  'C01-B': (u) => { const bh = META.places.find((p) => p[1] === 'Biên Hòa'), M = V3((C01.xl.x + bh[2]) / 2, 0, (C01.xl.z - bh[3]) / 2);
    return fly(V3(M.x + 2000, 30000, M.z + 36000), V3(M.x - 2000, 26000, M.z + 30000), M.clone(), M.clone(), 45)(u); },   // cửa phía Đông mở về Biên Hòa
  'C03-A': (u) => orbit(C03.lt, 20000, 11000, 1.4, 2.1, 42)(u),                                         // Long Thành, Nước Trong
  'C05-A': (u) => orbit(C05.dd, 15000, 8500, 2.6, 3.3, 42)(u),                                         // Đồng Dù: pháo bắn chuẩn bị, cắm cờ
  'C05-B': (u) => { const bt = LL(10.80326, 106.67153), M = V3((C05.dd.x + bt.x) / 2, 0, (C05.dd.z + bt.z) / 2);   // mũi tên Đồng Dù → Bộ Tổng tham mưu
    const d = V3(bt.x - C05.dd.x, 0, bt.z - C05.dd.z).normalize(), n = V3(-d.z, 0, d.x);   // nhìn ngang mũi tên
    return fly(M.clone().addScaledVector(n, 30000).setY(24000), M.clone().addScaledVector(n, 24000).setY(19000), M.clone(), M.clone(), 45)(u); },
  'C05-C': (u) => orbit(C05.rc, 12000, 7000, 3.6, 4.2, 42)(u),                                          // cầu Rạch Chiếc
  'C02-A': fly(V3(0, R * 0.85, R * 1.25), V3(SG.x + R * 0.1, R * 0.55, SG.z + R * 0.75), V3(0, 0, 0), SG.clone(), 45),
  'C01-L1': (u, t) => KT.camCot(KT.c01a)(u, t), 'C01-L2': (u, t) => KT.camCot(KT.c01b)(u, t), 'C01-L3': (u, t) => KT.camCot(KT.c01c)(u, t),
  'C01-D': (u) => KT.camDon(KT.don.xl, 0.6, 2.2)(u), 'C01-D2': (u) => KT.camDon(KT.don.xl, 3.4, 4.4)(u), 'C01-P': (u) => KT.camTD(KT.td1)(u),
  'C02-L1': (u, t) => KT.camCot(KT.c02a)(u, t), 'C02-L2': (u, t) => KT.camCot(KT.c02b)(u, t),
  'C03-P': (u) => KT.camTD(KT.td3)(u), 'C03-D': (u) => KT.camDon(KT.don.lt, 1.0, 2.6)(u), 'C03-L': (u, t) => KT.camCot(KT.c03)(u, t),
  'C05-A0': (u) => orbit(C05.dd, 15000, 8500, 2.2, 2.6, 42)(u), 'C05-P': (u) => KT.camTD(KT.td5)(u), 'C05-D': (u) => KT.camDon(KT.don.dd, 4.0, 5.6)(u),
  'C05-L': (u, t) => KT.camCot(KT.c05)(u, t), 'C05-L2': (u, t) => KT.camCot(KT.c05b)(u, t), 'C05-C2': (u) => orbit(C05.rc, 9000, 5000, 4.2, 4.6, 42)(u),
  'C06-A0': orbit(SG, R * 0.55, R * 0.45, 0.4, 0.1, 45), 'C06-L1': (u, t) => KT.camCot(KT.c06a)(u, t), 'C06-L2': (u, t) => KT.camCot(KT.c06b)(u, t), 'C06-P': (u) => KT.camTD(KT.td6)(u),
  'C02-C': orbit(SG, R * 0.85, R * 0.72, -0.35, -0.7, 45),                                                     // vòng vây năm hướng
  'C03-B': orbit(SG, R * 0.7, R * 0.6, 0.5, 0.9, 45),
  'C06-A': orbit(SG, R * 0.75, R * 0.62, -0.7, -0.2, 45),                                                     // năm cánh quân đồng loạt
  'C06-B': (u) => orbit(C06.muc, 16000, 9000, 0.4, 0.9, 42)(u),                                         // Tân Sơn Nhất, Bộ Tổng tham mưu
  'C06-C': (u) => orbit(C05.rc, 11000, 6500, 4.2, 4.8, 42)(u),                                          // cầu Rạch Chiếc → cầu Sài Gòn
} : {
  'T01-A': orbit(V3(0, 0, 0), R * 1.1, R * 0.9, 0, 0.2, 45),
  'T01-B': orbit(V3(0, 0, 0), R * 1.1, R * 0.9, 0.2, 0.4, 45),
  'T02-A': (u) => xeCam(XEX.x843, 40, 16, 30, 42)(u),
  'T02-B': (u) => xeCam(XEX.x390, 22, 7, 40, 45)(u),
  'C04-A': (u) => { const c = V3(C04.tam[0], 0, -C04.tam[1]); return orbit(c, 950, 380, 2.2, 1.7, 45)(u); },             // toàn cảnh Tân Sơn Nhất, khu đỗ máy bay
  'C04-B': (u) => { const L = C04.bay[0].o; if (!L.visible) { const c = V3(C04.tam[0], 0, -C04.tam[1]); return [c.clone().add(V3(900, 520, -700)), c, 45]; }
    const p = L.position, y = L.rotation.y; return [V3(p.x + Math.sin(y) * 160, p.y + 50, p.z + Math.cos(y) * 160), V3(p.x - Math.sin(y) * 300, p.y - 120, p.z - Math.cos(y) * 300), 50]; },   // bám sau chiếc dẫn đầu
  'C04-C': (u) => { const c = V3(C04.tam[0], 0, -C04.tam[1]); return orbit(c, 520, 210, 1.0, 1.6, 48)(u); },              // khói lửa trên khu đỗ
  'T03-A': (u) => { const o = XEX.than.obj, v = o.visible ? o.position : XEX.x843.obj.position, [x, z] = XEX.DL(20 - u * 6, 180 - u * 8), h = XEX.hDinh || 0;   // ngoài cổng nhìn vào: Thận rời 843 ở cổng phụ
    return [V3(x, h + 8, -z), V3(v.x, v.y + 1.5, v.z), 42]; },
  'T03-A2b': (u) => { const o = XEX.than.obj, p = o.position, y = o.rotation.y;          // bám sau khi băng qua bãi cỏ
    return [V3(p.x - Math.sin(y) * 10, p.y + 5, p.z - Math.cos(y) * 10), V3(p.x + Math.sin(y) * 8, p.y + 1.4, p.z + Math.cos(y) * 8), 50]; },
  'T03-A2': (u) => SHOTS['T03-A2b'](u),
  'T03-B': (u) => { const [x, z] = XEX.DL(0, -4), c = V3(x, (XEX.hDinh || 0) + 31, -z); return orbit(c, 17, 1.5, 1.95, 2.75, 48, 4)(u); },   // nóc Dinh, nhìn lá cờ
  'C07-A': (u) => { const c = V3(C04.tam[0], C04.h || 0, -C04.tam[1]); return orbit(c, 1700, 760, 2.6, 2.0, 45)(u); },                  // Tân Sơn Nhất sáng 30/4
  'C07-B': (u) => { const X = C07.xe && C07.xe[0]; if (X && X.obj.visible) return xeCam(X, 70, 32, 60, 46)(u); const c = V3(C04.tam[0], C04.h || 0, -C04.tam[1]); return orbit(c, 600, 240, 1.0, 1.6, 48)(u); },
  'C07-C': (u) => { const c = V3(C04.tam[0], C04.h || 0, -C04.tam[1]); return orbit(c, 1150, 620, 1.6, 2.2, 45)(u); },
  'C08-A': (u) => orbit(C89.btt, 1400, 760, 3.5, 4.1, 45)(u),                                          // Bộ Tổng tham mưu, hai mũi tiến công
  'C08-B': (u) => orbit(C89.btt, 900, 430, 4.1, 4.7, 46)(u),
  'C09-A': (u) => orbit(LL(10.7880, 106.6600, 0), 2800, 1650, -0.95, -0.55, 45)(u),                      // Bà Quẹo – Bảy Hiền – Lê Văn Duyệt
  'C09-B': (u) => orbit(LL(10.7540, 106.6880, 0), 1200, 650, -0.45, 0.1, 45)(u),                         // cầu Chữ Y
  'C09-C': orbit(V3(600, 0, -1100), 6400, 4300, -0.35, 0.25, 45),                                          // năm cánh quân hội tụ giữa nội đô
  'C10-A': (u) => { const X = XEX.x843, p = diemTren(X.D, 60), c = V3(p.x, hG(p.x, p.z), p.z); return orbit(c, 170, 60, p.yaw + 2.0, p.yaw + 2.5, 45)(u); },   // đầu cầu Sài Gòn, M48
  'C10-B': (u) => xeCam(XEX.x843, 32, 13, 32, 42)(u),
  'C10-C': (u) => { const X = XEX.x843, m = XEX.m113hx ? XEX.m113hx.position : diemTren(X.D, XEX.dHX), q = diemTren(X.D, XEX.dHX + 100);   // ngã tư Hàng Xanh
    const c = V3(q.x + Math.cos(q.yaw) * 4, hG(q.x, q.z) + 11 + u * 3, q.z - Math.sin(q.yaw) * 4); return [c, V3(m.x, m.y + 2, m.z), 44]; },
  'C10-D': (u) => { const X = XEX.x843, q = diemTren(X.D, XEX.L1 - 40), w = diemTren(X.D, XEX.L1 - 170 + u * 120);   // cầu Thị Nghè, xác M41, M113
    return [V3(q.x - Math.cos(q.yaw) * 5, hG(q.x, q.z) + 14, q.z + Math.sin(q.yaw) * 5), V3(w.x, hG(w.x, w.z) + 2, w.z), 46]; },
  'C10-E': (u) => xeCam(XEX.x390, 24, 8, 40, 45)(u),
  'C12-A': (u) => { const [x, z] = XEX.DL(0, 30), c = V3(x, (XEX.hDinh || 0) + 12, -z); return orbit(c, 250, 90, 2.15, 2.65, 45)(u); },   // Dinh, lá cờ trên nóc
  'C12-B': (u) => { const DL = XEX.DL, h = XEX.hDinh || 0, P = (a, b, y) => { const [x, z] = DL(a, b); return V3(x, h + y, -z); };   // người dân trước cổng Dinh
    return fly(P(4, 238, 9), P(-4, 226, 8), P(-6, 150, 2), P(6, 156, 2), 48)(u); },
  'C12-C': (u) => { const DL = XEX.DL, h = XEX.hDinh || 0, P = (a, b, y) => { const [x, z] = DL(a, b); return V3(x, h + y, -z); };   // Sài Gòn từ trên cao
    return fly(P(0, 175, 26), P(-300, 1500, 1500), P(0, 0, 18), P(200, -300, 0), 50)(u); },
  'T02-C': (u) => { const DL = XEX.DL, h = XEX.hDinh || 0, P = (a, b, y) => { const [x, z] = DL(a, b); return V3(x, h + y, -z); };   // cổng Dinh: nhìn từ ngoài vào
    if (u < 0.72) return fly(P(-22, 192, 8), P(-15, 178, 7), P(6, 146, 2.5), P(4, 140, 2.5), 46)(u / 0.72);          // ngoài cổng, góc ảnh tư liệu: cổng phụ trái (843) và cổng chính (390)
    return fly(P(4, 3, 23), P(0, 6, 25), P(-4, 120, 0), P(0, 100, 0), 52)((u - 0.72) / 0.28); },                    // từ sân thượng Dinh nhìn ra (góc ảnh tư liệu 30/4)
};
//@@ s35
function sceneAt(t) { for (const s of STORY.scenes) if (t >= s.t0 && t < s.t1) return s; return STORY.scenes[STORY.scenes.length - 1]; }
//@@ s36
const SECTION_SHOTS_X = new Set();
const CARDS = [];
const LABEL_SHOTS = {};
//@@ s37
//@@ s38
// mốc: thị xã, thị trấn (tên năm 1975, terrain/meta.json) + mốc nội đô
const ANCH = TANG === 'chien-dich'
  ? META.places.map(([typ, ten, x, y], k) => ['p' + k, ten, x, -y, typ === 'city' ? 'Thành phố, thị xã (tên năm 1975)' : 'Thị trấn (tên năm 1975)', typ === 'city'])
  : Object.entries(MOC).map(([k, [la, lo, ten]]) => [k, ten, LLx(la, lo), LLz(la, lo), 'Mốc nội đô (toạ độ OSM 2026, chốt theo nguồn ở GĐ5)', k === 'dinh']);
//@@ s39
function addLabel(text, x, z, cls, opts = {}) {
  const el = document.createElement('div'); el.className = 'lbl ' + (cls || '');
  const b = document.createElement('b'); b.textContent = text; const i = document.createElement('i'); el.append(b, i); $('labels').appendChild(el);
  const L = { el, b, x, z, cls, grp: opts.grp || 'anc', maxDist: opts.maxDist || Infinity, yFn: opts.yFn || null, show: opts.show || null };
  if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); if (!dragging) opts.onClick(); });
  if (opts.drag) b.addEventListener('pointerdown', (e) => { if (uiMode === 'drag' && canWrite !== false) { e.preventDefault(); e.stopPropagation(); startDrag(opts.drag, e); } });
  labels.push(L); return L;
}
for (const [name, text, x, z, desc, big] of ANCH) {
  const A = { name, text, x0: x, z0: z, x, z, desc, big };
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', onClick: () => { showCard(name); flyTo(A.x, A.z, TANG === 'noi-do' ? 500 : 9000); }, drag: { kind: 'anchor', name } });
  anchors.set(name, A);
}
for (const M of MUITEN) { const p = HUONG[M.k][1][0]; const L = addLabel(M.ten, LLx(p[0], p[1]), LLz(p[0], p[1]), 'hero tong', { grp: 'muiten', yFn: () => 2500, show: () => M.m.visible }); }
// ------------------------------------------------------------------ C05 · PHÁ TUYẾN NGOÀI (29/4/1975) — tầng chiến dịch
// 5h30 29/4 pháo bắn chuẩn bị vào căn cứ Đồng Dù (Sư đoàn 25 VNCH); 10h30 Sư đoàn 320A (Quân đoàn 3) cắm cờ trên sở chỉ huy sư đoàn;
// 23h Quân đoàn 3 nhận nhiệm vụ đánh Bộ Tổng tham mưu (S5). Lữ đoàn đặc công – biệt động 316 đánh chiếm, giữ cầu Rạch Chiếc 27–30/4 (S19, S40).
// Toạ độ: căn cứ Đồng Dù 10,9875 B · 106,5125 Đ (S41, Wikipedia "Củ Chi Base Camp"); cầu Rạch Chiếc 10,8133 B · 106,7569 Đ (S42).
// Vị trí trận địa pháo, đường bay đạn là MINH HOẠ.
const C05 = {}, C01 = {}, C03 = {}, C06 = {}, KT = { cot: [], td: [], don: {} };
if (TANG === 'chien-dich') {
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
    const [gK, gT, gP, g41, g113] = await Promise.all(['data/xe/xe-boc-thep-k63.glb', 'data/xe/xe-tai.glb', 'data/phao/m-46-130mm.glb', 'data/xe/xe-tang-m41.glb', 'data/xe/xe-boc-thep-m113.glb'].map((f) => glbLoad(f).catch(() => null)));
    const coMat = (t) => { const m = new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uT = U.time;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uv.x * 6.0 - uT * 5.0) * 0.12 * uv.x * 6.0;'); }; return m; };
    const mMT = coMat(txM), mVN = coMat(txV), mCan = new THREE.MeshLambertMaterial({ color: 0x3a2c1c });
    const co = (cao, w, mat) => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(w * 0.03, w * 0.03, cao, 5).translate(0, cao / 2, 0), mCan),
      new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.66, 8, 1).translate(w / 2, cao - w * 0.33, 0), mat)); return g; };
    const moi = (g, s = KS) => { const o = g.scene.clone(true); o.scale.setScalar(s); return o; };
    const huong = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);                              // mũi xe theo +z
    // đồn lũy đối phương: bờ đất, hàng rào, lô cốt, tháp canh, cờ ba sọc, xe tăng M41, xe bọc thép M113 (phóng to)
    const don = (p) => { const g = new THREE.Group(), dat = new THREE.MeshLambertMaterial({ color: 0x7b6040 }), bt = new THREE.MeshLambertMaterial({ color: 0x5d6150 });
      const cao = (m, y) => { m.position.y = y; return m; };
      g.add(cao(new THREE.Mesh(new THREE.TorusGeometry(150, 18, 6, 48).rotateX(Math.PI / 2).scale(1, 0.4, 1), dat), 4),
            cao(new THREE.Mesh(new THREE.CircleGeometry(140, 48).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x9c8b67 })), 1.5),
            cao(new THREE.Mesh(new THREE.TorusGeometry(190, 1.8, 4, 72).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x2b2b28 })), 6));
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, b = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 15), bt); b.position.set(Math.sin(a) * 118, 6, Math.cos(a) * 118); b.rotation.y = a; g.add(b); }
      const th = new THREE.Group(); th.add(new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 34, 6).translate(0, 17, 0), bt), new THREE.Mesh(new THREE.BoxGeometry(16, 7, 16).translate(0, 37, 0), bt)); th.position.set(-40, 0, 30); g.add(th);
      const cv = co(70, 34, mVN); cv.position.set(10, 0, -20); g.add(cv);
      [[g41, 40, 10, 0.5], [g41, -20, -50, 2.0], [g113, 55, -45, 3.6], [g113, -60, 20, 1.2]].forEach(([gg, x, z, y]) => { if (!gg) return; const o = moi(gg); o.position.set(x, 1, z); o.rotation.y = y; g.add(o); });
      g.position.set(p.x, hG(p.x, p.z), p.z); scene.add(g); return g; };
    KT.don.xl = don(C01.xl); KT.don.lt = don(C03.lt); KT.don.dd = don(C05.dd);
    // trận địa pháo ta: 4 khẩu M-46 130 mm (cắm cờ Mặt trận), chớp lửa đầu nòng, khói — đặt ở điểm xuất phát đường đạn phaoTao
    const tranDia = (P, t0, t1) => { const f = V3().subVectors(P.dich, P.src).setY(0).normalize(), r = V3(f.z, 0, -f.x), yaw = Math.atan2(f.x, f.z), S = [];
      for (let k = 0; k < 4; k++) { if (!gP) break; const o = moi(gP, 2.6), x = P.src.x + r.x * (k - 1.5) * 42, z = P.src.z + r.z * (k - 1.5) * 42;
        o.position.set(x, hG(x, z), z); o.rotation.y = yaw; scene.add(o); const c = co(11, 5, mMT); c.position.set(x - f.x * 14, hG(x, z), z - f.z * 14); scene.add(c);
        const lua = spr(0xffc070, 40), khoi = spr(0xbab4a8, 60); S.push({ x, z, y: hG(x, z), lua, khoi, ph: k * 0.29 }); }
      const T = { P, f, r, S, t0, t1 }; KT.td.push(T); return T; };
    KT.td1 = tranDia(C01.phao[0], MV.c01_phao0, MV.c01_phao1); KT.td3 = tranDia(C03.phao[0], MV.c03_phao0, MV.c03_phao1);
    KT.td5 = tranDia(C05.phao[0], MV.c05_phao0, MV.c05_phao1); KT.td6 = tranDia(C06.phao[0], MV.c06_phao, MV.c06_rc + 3);
    // đoàn quân ta: xe bọc thép K-63, xe tải chở bộ binh, xe kéo pháo M-46 (cắm cờ), chạy theo đường tiến về Sài Gòn trong khung giờ của cú máy
    const VAN = 24;                                                                       // tốc độ đoàn xe trên sa bàn (m/s) — chậm như xe chạy thật, không "tua nhanh"
    const RT = (k) => (INST.duong && INST.duong['cot_' + k]) || [];                          // tuyến theo đường bộ OSM (tools/sa_ban/dia_hinh/tuyen_cot.py), không xuyên sông hồ
    const MAU = { xl: 0xd2442b, dong: 0xd2442b, bac: 0xe58a1f, tb: 0xc0408c, dd: 0xc0408c, dn: 0x2f7fd6, lt: 0x2f7fd6, tn: 0x2fa35a };
    const vet = (P, mau, rong = 16) => { const D = duong(P), n = Math.max(2, Math.floor(D.L / 40)), pos = new Float32Array(n * 2 * 3), idx = [];
      for (let i = 0; i < n; i++) { const d = i / (n - 1) * D.L, a = diemTren(D, d), b = diemTren(D, Math.min(D.L, d + 5)), dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l * rong, nz = dx / l * rong;
        pos.set([a.x + nx, hG(a.x + nx, a.z + nz) + 6, a.z + nz, a.x - nx, hG(a.x - nx, a.z - nz) + 6, a.z - nz], i * 6); if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: mau, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 }));
      m.renderOrder = 2; m.visible = false; m.userData = { n, L: D.L }; scene.add(m); return m; };
    KT.vetDat = (m, d) => { const k = Math.max(0, Math.min(m.userData.n - 1, Math.floor(d / m.userData.L * (m.userData.n - 1)))); m.geometry.setDrawRange(0, k * 6); };
    const cot = (k, t0, t1, f1) => { const P = RT(k), D = duong(P), X = [];
      ['K', 'T', 'TP', 'K', 'T', 'T', 'K', 'TP', 'T', 'K', 'T', 'T'].forEach((k, i) => { const g = k === 'K' ? gK : gT; if (!g) return;
        const o = moi(g); o.visible = false; scene.add(o); const c = co(3.6, 1.8, mMT); c.position.set(0, 2.4, -2.2); o.add(c);
        let keo = null; if (k === 'TP' && gP) { keo = moi(gP, KS * 0.8); keo.visible = false; scene.add(keo); } X.push({ o, keo, i }); });
      const d1 = f1 * D.L, d0 = Math.max(0, d1 - VAN * (t1 - t0)); const C = { D, X, t0, t1, d0, d1, vet: vet(P, MAU[k] || 0xd2442b) }; KT.cot.push(C); return C; };
    KT.c01a = cot('xl', MV.c01_l1 - 1, MV.c01_d + 1, 0.55); KT.c01b = cot('xl', MV.c01_l2 - 1, MV.c01_p + 1, 0.82); KT.c01c = cot('xl', MV.c01_l3 - 1, MV.c01_rut, 0.95);
    KT.c02a = cot('bac', MV.c02_l1 - 1, MV.c02_l2 + 1, 0.75); KT.c02b = cot('tb', MV.c02_l2 - 1, MV.c02_vay + 1, 0.8);
    KT.c03 = cot('lt', MV.c03_l - 1, MV.c03_phao1 + 1, 0.92); KT.c05 = cot('dd', MV.c05_l - 1, MV.c05_phao1 + 1, 0.94);
    KT.c05b = cot('dn', MV.c05_l2 - 1, MV.c05_l2e + 1, 0.93); KT.c06a = cot('dong', MV.c06_l1 - 1, MV.c06_tc + 1, 0.9); KT.c06b = cot('bac', MV.c06_l2 - 1, MV.c06_phao + 1, 0.93);
    // hồi 6: vệt năm cánh quân vẽ dần trên đường bộ về Sài Gòn
    KT.vet6 = ['bac', 'tb', 'dong', 'dn', 'tn'].map((k) => vet(RT(k), MAU[k], 240));
    // Sài Gòn: vòng tròn bung tỏa khi các cánh quân áp sát, tiến công vào Sài Gòn (như Long Thành)
    KT.vSG = vong(V3(SG.x, hG(SG.x, SG.z), SG.z));
    const S2 = STORY.scenes.find((c) => c.id === 'C02'), S3 = STORY.scenes.find((c) => c.id === 'C03'), VONG = () => [C01.v, C03.v, C05.vDD, C05.vRC, C06.vT, C06.vB, KT.vSG];
    KT.cap = (t) => {
      { const on6 = t >= C06.t0 && t < C06.t1; for (const m of KT.vet6) { m.visible = on6; if (on6) KT.vetDat(m, m.userData.L * sstep(C06.t0, MV.c06_tc + 4, t)); } }
      for (const C of KT.cot) { const on = t >= C.t0 && t < C.t1, dh = C.d0 + (C.d1 - C.d0) * clamp((t - C.t0) / (C.t1 - C.t0), 0, 1);
        C.vet.visible = on; if (on) KT.vetDat(C.vet, dh - C.X.length * 80);
        for (const X of C.X) { X.o.visible = on; if (X.keo) X.keo.visible = on; if (!on) continue;
          const d = dh - X.i * 80, p = diemTren(C.D, d), q = diemTren(C.D, d + 8), y = huong(p, q);
          X.o.position.set(p.x, hG(p.x, p.z) + 0.5, p.z); X.o.rotation.y = y;
          if (X.keo) { const b = diemTren(C.D, d - 34); X.keo.position.set(b.x, hG(b.x, b.z) + 0.5, b.z); X.keo.rotation.y = y + Math.PI; } } }
      for (const T of KT.td) { const on = t >= T.t0 && t < T.t1;
        for (const G of T.S) { const ph = ((t - T.t0) / 2.4 + G.ph) % 1, ban = on && ph < 0.09;
          G.lua.visible = ban; if (ban) { G.lua.position.set(G.x + T.f.x * 40, G.y + 9, G.z + T.f.z * 40); G.lua.scale.setScalar(30 + ph * 300); }
          G.khoi.visible = on && ph < 0.7; if (G.khoi.visible) { G.khoi.position.set(G.x + T.f.x * (44 + ph * 30), G.y + 10 + ph * 40, G.z + T.f.z * (44 + ph * 30)); G.khoi.scale.setScalar(40 + ph * 160); G.khoi.material.opacity = 0.55 * (1 - ph / 0.7); } } }
      const sg = (t >= MV.c02_vay && t < S2.t1) || (t >= MV.c03_phao1 && t < S3.t1) || (t >= C06.t0 && t < C06.t1);
      KT.vSG.visible = sg; if (sg) { const k = (t * 0.5) % 1; KT.vSG.scale.setScalar(3000 + k * 6000); KT.vSG.material.opacity = 0.8 * (1 - k); }
      if (camera.position.y < 2500) for (const v of VONG()) if (v) v.visible = false; };   // cảnh cận (đoàn quân, trận địa, đồn): ẩn vòng tròn (vòng nằm trên cao, không bị núi che)
    // máy quay: lướt trên đoàn quân (từ cuối đoàn lên đầu, sát trên nóc xe); vòng cung quanh đồn; trung cảnh trận địa pháo
    KT.camCot = (C) => (u, t) => { const dh = C.d0 + (C.d1 - C.d0) * clamp((t - C.t0) / (C.t1 - C.t0), 0, 1), dc = dh - 1000 + u * 900;
      const a = diemTren(C.D, dc), b = diemTren(C.D, dc + 420), ha = hG(a.x, a.z), hb = hG(b.x, b.z), n = V3(b.z - a.z, 0, a.x - b.x).normalize().multiplyScalar(45);
      return [V3(a.x + n.x, Math.max(ha, hb) + 55, a.z + n.z), V3(b.x, hb + 4, b.z), 46]; };
    KT.camDon = (g, a0, a1) => (u) => orbit(g.position, 700, 260, a0, a1, 42, 200)(u);
    KT.camTD = (T) => (u) => { const c = V3(T.P.src.x, hG(T.P.src.x, T.P.src.z), T.P.src.z), f = T.f, r = T.r, w = -1 + u * 0.6;
      return [V3(c.x - f.x * 150 + r.x * 150 * w, c.y + 38, c.z - f.z * 150 + r.z * 150 * w), V3(c.x + f.x * 160, c.y + 30, c.z + f.z * 160), 44]; };
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
if (TANG === 'noi-do' && MV.c08_tc) {
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
    muiTenDat(C89.mNam, on9 && t >= MV.c09_cy - 2, sstep(MV.c09_cy - 2, MV.c09_cs + 2, t));
    if (C89.mDong) muiTenDat(C89.mDong, hoi, sstep(MV.c09_hoi, MV.c09_hoi + 8, t));
    C89.co.visible = (on8 && t >= MV.c08_chu) || (t >= S8.t1 && t < S9.t1); if (C89.co.visible) C89.co.scale.setScalar(Math.min(1, (t - MV.c08_chu) / 1.5) || 1); };
}
const HERO_PINS = TANG === 'noi-do' ? [['Xe tăng 843', () => (XEX.x843 && XEX.x843.obj.visible ? XEX.x843.obj.position : null)], ['Xe tăng 390', () => (XEX.x390 && XEX.x390.obj.visible ? XEX.x390.obj.position : null)]] : [];
for (const [text, get] of HERO_PINS) { const L = addLabel(text, 0, 0, 'hero ly', { grp: 'hero', maxDist: 1200 }); L.dyn = get; L.dy = 3.4; }
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
  if (TANG === 'chien-dich') return { all: [0, 0, R * 1.9, 180, 40], saigon: [SG.x, SG.z, 26000, 190, 38], dinh: v('dinh', 9000, 200, 35), tsn: v('tsn', 9000, 200, 35), thinghe: v('thinghe', 9000, 200, 35), causg: v('causg', 9000, 200, 35) };
  return { all: [0, 0, R * 1.9, 180, 40], saigon: [SG.x, SG.z, 6000, 190, 38], dinh: v('dinh', 420, 210, 24), tsn: v('tsn', 2600, 200, 32), thinghe: v('thinghe', 500, 200, 26), causg: v('causg', 700, 200, 26) };
})();
{ // 2.2: nút đổi tầng địa hình (tải lại trang ở cùng thời điểm phim)
  const b = document.createElement('button'); b.className = 'tang'; b.textContent = TANG === 'noi-do' ? '⇄ Toàn chiến dịch' : '⇄ Nội đô Sài Gòn';
  b.title = 'Đổi tầng địa hình (tải lại sa bàn tại cùng thời điểm)'; b.onclick = () => doiTang(TANG === 'noi-do' ? 'chien-dich' : 'noi-do', T, playing);
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
$('mmLeg').textContent = TANG === 'noi-do' ? 'Bấm để bay tới · ô đỏ: xe tăng · ô vàng: mốc' : 'Bấm để bay tới · ô vàng: thị xã, thị trấn (tên 1975)';
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
function setWalk(on) {            // đi bộ: chưa có ở bản thử (cần nhân vật có xương làm vai người chơi — GĐ4)
  W.on = false; $('bwalk').textContent = on ? '🚶 Chưa có ở bản thử' : '🚶 Xuống đi bộ';
}
//@@ s45
function drawAvatar() {}
//@@ s46
const POV_VAI = [];
const POV_DD = [];
//@@ s47
function povTick() { return false; }
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
const HCM_BED = ['xetang', 'gio', 'reoho', 'ak47'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'votay', 'dang'];
// bản Artifact: AudioContext, bộ đệm tiếng, vòng lặp nền, hai thẻ nhạc nằm ở trang khung ngoài → nhạc, hiệu ứng chạy liền khi đổi tầng (iframe thay mới)
const KHUNG = (() => { try { return window.parent !== window && window.parent.__voxA ? window.parent : null; } catch (e) { return null; } })();
window.__amChung = () => { if (!KHUNG) return null;
  if (!KHUNG.__AMS) { const ctx = new (KHUNG.AudioContext || KHUNG.webkitAudioContext)(), out = ctx.createGain(), sfx = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination); sfx.connect(out);
    KHUNG.__AMS = { K: KHUNG, ctx, out, sfx, buf: {}, beds: {}, ready: false, deck: null, cur: 0 }; }
  return KHUNG.__AMS; };
function amPlan(i, u) {                                                                    // mức âm nền theo hồi và mốc câu đọc
  const id = SC[i] && SC[i].id, t = T;
  const gan = (() => { const X = XEX.x843; if (!X || !X.obj.visible) return 0; return clamp(1 - camera.position.distanceTo(X.obj.position) / 260, 0, 1); })();
  switch (id) {
    case 'C01': return { gio: 0.32 };
    case 'C02': return { gio: 0.28 };
    case 'C03': return { gio: 0.18, ak47: t > MV.c03_phao0 ? 0.1 : 0 };
    case 'C04': return { gio: 0.14 };
    case 'C05': return { gio: 0.18, ak47: t > MV.c05_phao0 && t < MV.c05_co ? 0.14 : 0 };
    case 'C06': return { gio: 0.16, xetang: t > MV.c06_tc ? 0.22 : 0 };
    case 'C07': return { ak47: 0.26, xetang: 0.22 };
    case 'C08': return { ak47: 0.26, xetang: t > MV.c08_xt ? 0.3 : 0.08 };
    case 'C09': return { ak47: 0.16, gio: 0.12 };
    case 'C10': return { xetang: 0.22 + gan * 0.55, ak47: t > MV.c10_m48 && t < MV.c10_htt ? 0.2 : 0 };
    case 'C11': return { xetang: t < MV.c11_thao ? 0.22 + gan * 0.55 : 0.1, reoho: t > MV.c11_keo + 1 ? 0.3 : 0 };
    case 'C12': return { reoho: t > MV.c12_dan - 2 ? 0.45 : 0.2, gio: t > MV.c12_ket ? 0.16 : 0 };
  }
  return {};
}
// tiếng pháo, tiếng nổ lặp lại trong khoảng mốc: [mốc đầu, mốc cuối, tệp, âm lượng, cách tối thiểu, ngẫu nhiên thêm]
const AM_LAP = () => [[MV.c01_phao0, MV.c01_phao1, 'daibac', 0.32, 1.1, 1.6], [MV.c03_phao0, MV.c03_phao1, 'daibac', 0.36, 0.9, 1.4], [MV.c05_phao0, MV.c05_phao1, 'daibac', 0.36, 0.9, 1.4],
  [MV.c06_phao, MV.c06_rc + 3, 'no', 0.32, 0.8, 1.2], [MV.c07_tc, MV.c07_chu, 'no', 0.3, 1.2, 2.2], [MV.c08_tc, MV.c08_chu, 'no', 0.26, 1.6, 2.4], [MV.c09_tay, MV.c09_cs, 'no', 0.2, 2.0, 3.0]];
// tiếng theo đúng câu đọc: [giây voice, tệp, âm lượng]
const AM_MOC = () => [[MV.c04_bom - 5, 'vut', 0.7], ...Array.from({ length: 8 }, (_, n) => [MV.c04_bom + n * 0.55, 'no', 0.75]), [MV.c10_m48 + 1.6, 'daibac', 0.6], [MV.c10_m48 + 2.1, 'no', 0.55],
  [MV.c10_ban + 0.6, 'daibac', 0.85], [MV.c10_ban + 1.1, 'no', 0.9], [MV.c10_ban + 1.3, 'lua', 0.5], [MV.c10_tn + 2, 'daibac', 0.55], [MV.c11_ram, 'no', 0.85], [MV.c11_ram + 0.1, 'lua', 0.35],
  [MV.c11_cham, 'no', 0.95], [MV.c11_cham + 0.15, 'lua', 0.45], [MV.c11_keo - 9, 'dang', 0.35], [MV.c11_keo + 0.5, 'votay', 0.6], [MV.c12_dan + 3, 'coi', 0.25], [MV.c12_dan + 9, 'coi', 0.2], [MV.c12_dan, 'votay', 0.55]];
async function amLoad() {
  const S = window.__amChung(); if (S && S.ready) { AM.ready = true; return; }
  await Promise.all([...HCM_BED, ...HCM_ONE].map(async (n) => { try { const r = await fetch(PU('am/' + n + '.mp3')); AM.buf[n] = await AM.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn('âm thanh', n, e); } }));
  for (const n of HCM_BED) { if (!AM.buf[n]) continue; const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.sfx); s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g; }
  AM.ready = true; if (S) S.ready = true;
}
async function amPrefetch() {}
const THE_EL = () => THE_EL.el || (THE_EL.el = (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;right:0;top:30%;z-index:20;text-align:center;pointer-events:none;color:#f4e6c4;text-shadow:0 2px 14px #000c,0 0 2px #000';
  d.innerHTML = '<div style="font:600 clamp(16px,2.2vw,26px)/1.2 system-ui;letter-spacing:.18em;color:#e9b44c"></div><div style="font:800 clamp(26px,4.4vw,58px)/1.12 system-ui;margin-top:.25em;padding:0 6vw"></div>'; d.style.display = 'none'; document.body.append(d); return d; })());
//@@ s50
function amTick(dt) {
  if (!AM.ready || !AM.on) { AM.prevT = T; return; }
  const live = (appMode === 'film' && playing) || appMode === 'explore', i = sceneIdx(T), sc = SC[i], u = clamp((T - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const plan = amPlan(i, u), k = live ? 1 : 0.15, now = AM.ctx.currentTime, duck = voxNoi() ? 0.75 : 1;
  for (const n in AM.beds) AM.beds[n].gain.setTargetAtTime((plan[n] || 0) * k * duck, now, 0.6);
  if (live && appMode === 'film' && T > AM.prevT && T - AM.prevT < 1) {
    for (const [tc, n, v] of AM_MOC()) if (tc > AM.prevT && tc <= T) amShot(n, v);
    const tt = performance.now() / 1000;
    AM_LAP().forEach(([a, b, n, v, g, r], j) => { if (!(T >= a && T <= b)) return; if (!(j in AM.next)) AM.next[j] = tt + Math.random() * g; if (tt >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = tt + g + Math.random() * r; } });
  }
  AM.prevT = T;
}
// ------------------------------------------------------------------ nhạc nền theo hồi (Epidemic Sound, kho chung _KHO-CHUNG/nhac-nen; bản nén dùng lại của gói Bạch Đằng)
const NHAC = { C01: ['thuc-day', 0, 0.34], C02: ['hiep-si', 0, 0.36], C03: ['giua-tran', 0, 0.34], C04: ['quyet-chien', 0, 0.34], C05: ['ke-thu', 0, 0.34], C06: ['giua-tran', 40, 0.36],
  C07: ['quyet-chien', 20, 0.32], C08: ['ke-thu', 50, 0.32], C09: ['thuc-day', 30, 0.32], C10: ['quyet-chien', 0, 0.38], C11: ['hiep-si', 100, 0.4], C12: ['vi-thanh', 0, 0.46] };
const NHAC_DUR = { 'hiep-si': 231.2, 'ke-thu': 130.2, 'thuc-day': 118.5, 'tro-ve': 105.1, 'giua-tran': 146.4, 'quyet-chien': 97, 'vi-thanh': 114.7 };
const nhacCua = (i) => NHAC[SC[i].id] || ['thuc-day', 0, 0.3];
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
      D.g.gain.setTargetAtTime(Math.min(0.75, vol * 1.45) * (voxNoi() ? 0.72 : 1), now, 0.8);
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
  const a = VOX.a; if (!a || VOX.fail) return false;
  if (VOX.tiep) { if (!(playing && appMode === 'film')) return false; VOX.tiep = false; if (!a.paused) { T = a.currentTime; return true; } }
  const want = VO.on && playing && appMode === 'film' && !seeking;
  if (!want) { if (!a.paused) a.pause(); return false; }
  if (!VOX.ok || a.readyState < 2 || T >= a.duration - 0.05) return false;
  a.playbackRate = clamp(speed, 0.5, 2);
  if (a.paused) { if (Math.abs(a.currentTime - T) > 0.25) try { a.currentTime = T; } catch (e) {}
    if (!VOX.cho) { VOX.cho = true; a.play().then(() => { VOX.cho = false; }).catch((e) => { VOX.cho = false; if (e && e.name === 'NotAllowedError') voxChan(); }); }
    return false; }
  if (a.seeking) return true;
  if (Math.abs(a.currentTime - T) > 0.8) { try { a.currentTime = T; } catch (e) {} return true; }     // người xem tua / chọn cảnh: voice nhảy theo
  T = a.currentTime; return true;
}
voxInit();
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
  const i = sceneIdx(t), scn = SC[i], shot = shotAt(t);
  // 2.2: cảnh thuộc tầng khác → đổi tầng (tải lại ở cùng thời điểm)
  if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) { update.doi = true; $('sub').hidden = false; $('sub').textContent = 'Đang chuyển sang ' + (scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') + '…'; doiTang(scn.tang, Math.max(t, scn.t0 + 0.05), playing); return; }   // t làm tròn có thể rơi về cảnh trước (tầng cũ) → đổi tầng qua lại mãi
  tideNow = 0.3; U.level.value = tideNow; water.position.y = tideNow; U.wetTop.value = tideNow + 0.4;
  applySky(t, appMode === 'explore' ? forcedSky : '');
  scene.fog.density /= 1 + Math.max(0, camera.position.y - R * 0.2) / (R * 0.3);
  if (C04.cap) C04.cap(t, dt);                                                          // cảnh C04 Phi đội Quyết Thắng: dùng giây phim gốc
  { const t = tDinh(T);                                                                  // các cảnh vào Dinh viết theo mốc cũ (T02 bắt đầu 40 s) → dời theo story
  xeCapNhat(t);
  if (XEX.x843) { const o = XEX.x843.obj; if (t < 91.6) XEX.yaw843 = o.rotation.y; else if (t < 93.6 && XEX.yaw843 !== undefined) o.rotation.y = XEX.yaw843; }   // lùi thẳng khỏi cổng phụ
  nvxCapNhat(t, dt);
  if (DAN.dat) DAN.dat(t);
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
  if (XEX.cong && XEX.cong.phai) {                                                       // 843 húc cổng phụ (84 s): rung rồi oằn, không đổ; 390 húc đổ cổng chính (90 s)
    const rung = t > 84 && t < 86.5 ? 0.08 * Math.sin((t - 84) * 20) * (1 - (t - 84) / 2.5) : 0, k1 = sstep(90, 90.7, t), k2 = sstep(90.45, 91.6, t);
    XEX.cong.trai.rotation.set(-k2 * Math.PI / 2, -1.75 * k1, 0, 'YXZ'); XEX.cong.phai.rotation.set(-k2 * Math.PI / 2, 1.75 * k1, 0, 'YXZ');   // bung vào trong hai bên rồi đổ nằm xuống đất
    if (XEX.cong.phu) XEX.cong.phu.rotation.x = rung + sstep(84, 84.6, t) * 0.14;
  }
  }
  { const on = !$('ly-nha') || $('ly-nha').checked, c = camera.position; for (const m of LAYER.nha) m.visible = on && Math.hypot(m.userData.tam.x - c.x, m.userData.tam.z - c.z) < m.userData.xa + Math.max(0, c.y) * 2; }
  const xeOn = $('ly-nv').checked; for (const m of LAYER.xe) m.visible = m.visible && xeOn; for (const N of NVX) N.obj.visible = N.obj.visible && xeOn;
  const arrOn = $('ly-arr').checked && $('ly-muiten').checked, ex = appMode === 'explore';
  { const c2 = STORY.scenes.find((c) => c.id === 'C02') || STORY.scenes[0], c6 = STORY.scenes.find((c) => c.id === 'C06');   // năm hướng: C02 lần lượt theo câu đọc; C06 đủ năm hướng
    for (const M of MUITEN) { const t0 = MV.c02_m ? MV.c02_m[M.k] : c2.t0 + 14 + M.k * 9, in6 = c6 && (MV.c06_tc ? t >= MV.c06_tc && t < MV.c06_l2 : t >= c6.t0 && t < c6.t1), gan = MV.c02_l1 && t >= MV.c02_l1 && t < MV.c02_vay;   // C06: đủ năm hướng (cú máy toàn); ẩn khi máy lướt sát đoàn quân
      const on = arrOn && (ex || (t >= t0 && t < c2.t1 && !gan) || in6); muiTenDat(M.m, on, ex || in6 ? 1 : sstep(t0, t0 + 6, t)); } }
  if (C05.cap) C05.cap(t); if (C01.cap) C01.cap(t); if (C03.cap) C03.cap(t); if (C06.cap) C06.cap(t); if (KT.cap) KT.cap(t); if (C07.cap) C07.cap(t, dt); if (C89.cap) C89.cap(t);
  // máy quay
  if (appMode === 'film' && !userCam) {
    const fn = SHOTS[shot.id], u = clamp((t - shot.t0) / (shot.t1 - shot.t0), 0, 1);
    if (fn) {
      const [p, l, fov] = fn(u, t);
      if (blend) { const k = Math.min((performance.now() - blend.t0) / 1200, 1), e = k * k * (3 - 2 * k); p.lerpVectors(blend.p0, p, e); l.lerpVectors(blend.q0, l, e); if (k >= 1) blend = null; }
      camera.position.copy(p); camLook.copy(l); camera.lookAt(l); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
      controls.target.copy(l);
    }
  } else {
    if (held) orbitCam(held[0], held[1], held[2]);
    if (flyA) { const k = Math.min((performance.now() - flyA.t0) / flyA.dur, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; camera.position.lerpVectors(flyA.p0, flyA.p1, e); controls.target.lerpVectors(flyA.q0, flyA.q1, e); if (k >= 1) flyA = null; }
    controls.update(); camLook.copy(controls.target);
    if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }
  const gh = hAt(camera.position.x, camera.position.z), inR = Math.hypot(camera.position.x, camera.position.z) < R;
  const ghm = inR ? Math.max(gh, hG(camera.position.x, camera.position.z)) : gh;
  if (inR && camera.position.y < ghm + 1.2) { camera.position.y = ghm + 1.2; if (appMode === 'film' && !userCam) camera.lookAt(camLook); }
  const above = Math.max(1, camera.position.y - Math.max(gh, tideNow));
  camera.near = clamp(above * 0.05, 0.15, R * 0.01); camera.far = R * 16; camera.updateProjectionMatrix();
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
  updateLabels(); amTick(dt); MU.tick();
  fpsN++; const nw = performance.now(); if (nw - fpsT > 1000) { $('fps').textContent = Math.round((fpsN * 1000) / (nw - fpsT)) + ' fps'; fpsN = 0; fpsT = nw; drawMinimap(); }
  else if ((fpsN & 7) === 0) drawMinimap();
}
progress(0.97, 'Đang chuẩn bị hình ảnh…');
//@@ s53
function frame() { const dt = Math.min(clock.getDelta(), 0.1); update(first ? 0 : dt); first = false; renderer.render(scene, camera); requestAnimationFrame(frame); }
setAppMode('film');
{ const t0 = parseFloat(QS.get('t')); T = Number.isFinite(t0) ? clamp(t0, 0, DUR - 0.01) : (SC.find((s) => s.tang === TANG) || SC[0]).t0; }
update(0); renderer.compile(scene, camera); renderer.render(scene, camera);
renderList(); connectStore();
const STILL = location.hash === '#still';
window.__sa = { DAN, DONG, get NHA() { return XEX.nhaTong; }, get VOX() { return VOX; }, XE, NVX, XEX, TANG, camera, controls, seek: (t) => { T = clamp(t, 0, DUR - 0.01); }, setPlaying, setAppMode, goView, get T() { return T; }, render: () => { update(0); renderer.render(scene, camera); }, ve: () => renderer.render(scene, camera), tinh: () => update(0), buoc: (dt) => { update(dt); renderer.render(scene, camera); } };
function closeLoad() { $('load').classList.add('done'); setTimeout(() => $('load').remove(), 700); }
if (STILL) { document.body.classList.add('ready'); closeLoad(); }
else {
  progress(1, 'Đã tải xong sa bàn');
  document.body.classList.add('ready');
  $('ldtrack').hidden = true; $('ldgo').hidden = false; $('bstart').focus();
  $('bstart').onclick = () => { voUnlock(); if (!AM.on) amEnable(true); closeLoad(); setPlaying(true); };   // Play bật cả nhạc, hiệu ứng
  $('bexplore').onclick = () => { voUnlock(); closeLoad(); setAppMode('explore'); };
  if (QS.get('phat') === '1') { closeLoad(); if (KHUNG && KHUNG.__AMS && !AM.on) amEnable(true); setPlaying(true); }
  requestAnimationFrame(frame);
}
