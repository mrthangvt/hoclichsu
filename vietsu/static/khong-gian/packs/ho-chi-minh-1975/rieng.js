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
const LAYER = { nv: [], xe: [] };
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
};
// đường xe 843, 390 vào Dinh (tools/sa_ban/dia_hinh/tim_duong.py trên mạng đường OSM đã bỏ đường làm sau 1975) + đoạn vào sân Dinh — PHÁC THẢO
const DUONG_DINH = (INST.duong && INST.duong.dinh) || [];
const XEX = { x843: null, x390: null, lai843: null, ctt: null, than: null };
if (TANG === 'noi-do' && DUONG_DINH.length) {
  progress(0.4, 'Đang tải xe tăng 843, 390…');
  const L0 = (() => { let a = 0; for (let i = 1; i < DUONG_DINH.length; i++) a += Math.hypot(DUONG_DINH[i][0] - DUONG_DINH[i - 1][0], DUONG_DINH[i][1] - DUONG_DINH[i - 1][1]); return a; })();
  XEX.L = L0;
  XEX.x843 = await xeTao('data/xe/xe-tang-843.glb', { duong: DUONG_DINH, lich: [[42, 0], [88, L0 - 75]], hien: (t) => t >= 40, ten: 'Xe tăng 843' });
  XEX.x390 = await xeTao('data/xe/xe-tang-390.glb', { duong: DUONG_DINH, lich: [[44, -45], [98, L0]], hien: (t) => t >= 44, ten: 'Xe tăng 390' });
  const tren = (X, dy, lui) => (t) => { if (!X.obj.visible) return null; const p = X.obj.position, y = X.obj.rotation.y; return { x: p.x - Math.sin(y) * lui, z: p.z - Math.cos(y) * lui, y: p.y + dy, yaw: y, clip: 'dung' }; };   // trưởng xe đứng ở cửa tháp pháo
  XEX.lai843 = await nvxTao('models/linh-tang.glb', tren(XEX.x843, 1.35, 0.4), { ten: 'Trưởng xe 843' });
  XEX.lai390 = await nvxTao('models/linh-tang.glb', tren(XEX.x390, 1.35, 0.4), { ten: 'Trưởng xe 390' });
  for (const X of [XEX.x843, XEX.x390]) LAYER.xe.push(X.obj);
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
const SKYKEYS = [[0, 'Ngày nhiều mây'], [40, 'Sáng trong'], [80, 'Trưa nắng']];
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
} : {
  'T01-A': orbit(V3(0, 0, 0), R * 1.1, R * 0.9, 0, 0.2, 45),
  'T01-B': orbit(V3(0, 0, 0), R * 1.1, R * 0.9, 0.2, 0.4, 45),
  'T02-A': (u) => xeCam(XEX.x843, 40, 16, 30, 42)(u),
  'T02-B': (u) => xeCam(XEX.x390, 22, 7, 40, 45)(u),
  'T02-C': (() => { const c = LL(MOC.dinh[0], MOC.dinh[1], 6); return orbit(c, 190, 55, 0.9, 0.55, 42); })(),
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
// âm thanh: chưa có ở bản thử (GĐ5)
function amLoad() {}
async function amPrefetch() {}
function amPlan() { return {}; }
//@@ s50
const MU = { init() {}, tick() {} };
function amTick() {}
//@@ s51
function updSub(force) {
  const el = $('sub'), sc = SC[sceneIdx(T)]; let txt = '', key = '';
  if (appMode === 'film') (sc.subs || []).forEach((s, k) => { if (T >= s[0] && T < s[1]) { txt = s[2]; key = sc.id + ':' + k; } });
  if (key && key !== lastLine) { lastLine = key; speak(txt); }
  const on = appMode === 'film' && $('ly-sub').checked;
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt || force) el.textContent = txt; el.hidden = !txt;
}
//@@ s52
function update(dt) {
  if (appMode === 'film' && playing) { T += dt * speed; if (T >= DUR) { T = DUR - 0.01; setPlaying(false); } }
  if (appMode === 'explore') { const sc = SC[exploreI]; T += dt; if (T >= sc.t1 || T < sc.t0) T = sc.t0 + 0.01; }
  const t = T;
  U.time.value += dt;
  const i = sceneIdx(t), scn = SC[i], shot = shotAt(t);
  // 2.2: cảnh thuộc tầng khác → đổi tầng (tải lại ở cùng thời điểm)
  if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) { update.doi = true; $('sub').hidden = false; $('sub').textContent = 'Đang chuyển sang ' + (scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') + '…'; doiTang(scn.tang, t, playing); return; }
  tideNow = 0.3; U.level.value = tideNow; water.position.y = tideNow; U.wetTop.value = tideNow + 0.4;
  applySky(t, appMode === 'explore' ? forcedSky : '');
  scene.fog.density /= 1 + Math.max(0, camera.position.y - R * 0.2) / (R * 0.3);
  xeCapNhat(t); nvxCapNhat(t, dt);
  const xeOn = $('ly-nv').checked; for (const m of LAYER.xe) m.visible = m.visible && xeOn; for (const N of NVX) N.obj.visible = N.obj.visible && xeOn;
  const arrOn = $('ly-arr').checked && $('ly-muiten').checked, ex = appMode === 'explore';
  for (const M of MUITEN) { const t0 = 8 + M.k * 5; const on = arrOn && (ex || t >= t0); muiTenDat(M.m, on, ex ? 1 : sstep(t0, t0 + 8, t)); }
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
window.__sa = { XE, NVX, XEX, TANG, camera, controls, seek: (t) => { T = clamp(t, 0, DUR - 0.01); }, setPlaying, setAppMode, goView, get T() { return T; }, render: () => { update(0); renderer.render(scene, camera); }, ve: () => renderer.render(scene, camera), tinh: () => update(0), buoc: (dt) => { update(dt); renderer.render(scene, camera); } };
function closeLoad() { $('load').classList.add('done'); setTimeout(() => $('load').remove(), 700); }
if (STILL) { document.body.classList.add('ready'); closeLoad(); }
else {
  progress(1, 'Đã tải xong sa bàn');
  document.body.classList.add('ready');
  $('ldtrack').hidden = true; $('ldgo').hidden = false; $('bstart').focus();
  $('bstart').onclick = () => { voUnlock(); closeLoad(); setPlaying(true); };
  $('bexplore').onclick = () => { voUnlock(); closeLoad(); setAppMode('explore'); };
  if (QS.get('phat') === '1') { closeLoad(); setPlaying(true); }
  requestAnimationFrame(frame);
}
