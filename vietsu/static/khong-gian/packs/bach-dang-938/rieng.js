// Bạch Đằng 938 · phần riêng của trận, cắm vào bộ máy 2.0.0 tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/tach_bo_may_2.py).
// Mỗi đoạn bắt đầu bằng dòng //@@ sN. Mã chạy chung phạm vi với bộ máy: dùng được hAt, nvPut, scene, THREE… như mã gốc.
//@@ s1
const STAKE_TOP = -1.0;     // đỉnh cọc (m, so với mực nước trung bình)
const LOW = -2.6, HIGH = 2.2;

//@@ s2
const KEEP_CLEAR = [[-640, -450, 60], [-70, 2700, 45], [-20, 2900, 70], [30, 2970, 40]];
const MARCH0 = [[-2514, -133], [-2350, -142], [-2187, -133], [-2024, -107], [-1869, -56], [-1714, -116], [-1551, -116], [-1422, -219], [-1259, -262], [-1096, -296], [-932, -296], [-795, -391], [-668, -440]];
function clearOf(p) { for (const [x, z, r] of KEEP_CLEAR) if (Math.hypot(p[0] - x, p[1] - z) < r) return false; for (let i = 1; i < MARCH0.length; i++) { const [ax, az] = MARCH0[i - 1], [bx, bz] = MARCH0[i]; const dx = bx - ax, dz = bz - az; const u = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(p[0] - ax - dx * u, p[1] - az - dz * u) < 22) return false; } return true; }
//@@ s3
// ------------------------------------------------------------------ stakes (bãi cọc — vị trí giả định)
const stakeMat = new THREE.MeshStandardMaterial({ color: 0x6a4e33, roughness: 0.9, emissive: 0xff7a30, emissiveIntensity: 0 });
const tipMat = new THREE.MeshStandardMaterial({ color: 0x2c2a28, roughness: 0.5, metalness: 0.6, emissive: 0xffa040, emissiveIntensity: 0 });
clipList.push(stakeMat, tipMat);
// bãi cọc phủ kín lòng sông đoạn z 2740–3240: lưới so le ~4 m, cọc cắm nghiêng 17–26° chĩa mũi về thượng lưu, đỉnh cọc ở khoảng −1 m
const STAKES = [];
{
  const step = 4.0;
  for (let z = 2740, r = 0; z <= 3240; z += step * 0.87, r++) for (let x = -300 + (r % 2) * step * 0.5; x <= 1700; x += step) {
    const jx = x + (rnd(x * 0.37 + z, 90) - 0.5) * step * 0.7, jz = z + (rnd(x + z * 0.53, 91) - 0.5) * step * 0.7;
    if (!isWater(jx, jz)) continue; const b = hAt(jx, jz); if (b > -1.7) continue;
    const tilt = 0.3 + rnd(jx, jz) * 0.16, a = Math.atan2(-0.367, -0.93) + (rnd(jz, jx) - 0.5) * 0.35;
    const top = -1.0 + (rnd(jx + 3, 92) - 0.5) * 0.5, L = (top - b) / Math.cos(tilt);
    STAKES.push([jx, jz, b, L, Math.sin(a), Math.cos(a), tilt]);
  }
}
INST.stakes = STAKES;
const NST = INST.stakes.length;
const stakeMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.2, 1, 6).translate(0, 0.5, 0), stakeMat, NST);
const tipMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.17, 0.75, 6).translate(0, 0.37, 0), tipMat, NST);
const stakeOrder = INST.stakes.map((s, i) => i).sort((a, b) => Math.hypot(INST.stakes[a][0] - 80, INST.stakes[a][1] - 2900) - Math.hypot(INST.stakes[b][0] - 80, INST.stakes[b][1] - 2900));
{
  const up = new THREE.Vector3(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  stakeOrder.forEach((si, i) => {
    const [x, z, b, L, dx, dz, tilt] = INST.stakes[si];
    up.set(dx * Math.sin(tilt), Math.cos(tilt), dz * Math.sin(tilt)).normalize();
    q.setFromUnitVectors(Y, up);
    dummy.position.set(x, b, z); dummy.quaternion.copy(q); dummy.scale.set(1, L, 1); dummy.updateMatrix(); stakeMesh.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x + up.x * L, b + up.y * L, z + up.z * L); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); tipMesh.setMatrixAt(i, dummy.matrix);
  });
}
scene.add(stakeMesh, tipMesh);
LAYER.coc.push(stakeMesh, tipMesh);

// mooring posts + water gauge pole + logs at the work site
//@@ s4
const props = new THREE.Group(); scene.add(props);
const gaugePole = new THREE.Group();
{
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 7, 6).translate(0, 3.5, 0), propMat); gaugePole.add(pole);
  for (let k = 0; k < 6; k++) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.18, 8), new THREE.MeshStandardMaterial({ color: k % 2 ? 0xd8cfb8 : 0x8b2f22, roughness: 0.7 })); ring.position.y = 1.0 + k * 0.85; gaugePole.add(ring); }
  gaugePole.position.set(150, -3.5, 2740); props.add(gaugePole);
  for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 6, 6).translate(0, 3, 0), propMat); p.position.set(40 + k * 7, hAt(40 + k * 7, 2560 + k * 5) - 2.5, 2560 + k * 5); props.add(p); }
}
const logs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.26, 7.5, 6).rotateZ(Math.PI / 2), propMat, 26);
{
  for (let i = 0; i < 26; i++) { const x = -30 - (i % 6) * 2.2 + Math.sin(i) * 0.6, z = 2880 + Math.floor(i / 6) * 2.4 + (i % 2) * 0.6; dummy.position.set(x, hAt(x, z) + 0.25 + (i % 3 === 0 ? 0.42 : 0), z); dummy.rotation.set(0, 0.3 + Math.sin(i * 2) * 0.15, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); logs.setMatrixAt(i, dummy.matrix); }
  scene.add(logs);
}
// forge (lò rèn minh họa)
const forge = new THREE.Group();
{
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 1.0, 10), new THREE.MeshStandardMaterial({ color: 0x5c4f45, roughness: 1 })); base.position.y = 0.5; forge.add(base);
  const coal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0x220a02, emissive: 0xff5a12, emissiveIntensity: 2.4 })); coal.position.y = 1.02; forge.add(coal);
  const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.45), new THREE.MeshStandardMaterial({ color: 0x2f2f30, metalness: 0.7, roughness: 0.45 })); anvil.position.set(2, 0.3, 0.2); forge.add(anvil);
  const glow = new THREE.PointLight(0xff7a2a, 30, 14, 2); glow.position.y = 1.8; forge.add(glow);
  forge.position.set(-46, hAt(-46, 2915), 2915); scene.add(forge);
}
// command post (sở chỉ huy giả định): tent + map table
const CP = new THREE.Vector3(-640, hAt(-640, -450), -450);
//@@ s5
const M = {};
M['thuyen-nam-han'] = await loadModel('thuyen-nam-han');
clipList.push(M['thuyen-nam-han'].mat);
const SS = 0.38;       // thuyền Nam Hán: 100 đơn vị → 38 m

//@@ s6
const NV_KINDS = [['dan-binh', 520], ['linh-nam-han', 170], ['ngo-quyen', 2], ['luu-hoang-thao', 2]];
let nvDone = 0;
await Promise.all(NV_KINDS.map(async ([k, cap]) => { await nvLoad(k, cap); nvDone++; progress(0.5 + 0.35 * nvDone / NV_KINDS.length, 'Đang tải nhân vật có động tác…'); }));
//@@ s7
const coMat = new THREE.MeshLambertMaterial({ map: coTex, side: THREE.DoubleSide });
coMat.onBeforeCompile = (sh) => { sh.uniforms.uTime = U.time; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23; transformed.z += sin(uv.x * 5.5 - uTime * 5.0 + ph) * 0.1 * uv.x;'); };
clipList.push(coMat);
//@@ s8
const coFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.52, 2.45, 0), coMat, 120); coFlag.frustumCulled = false; coFlag.count = 0; scene.add(coFlag);
// cờ quân Ngô trên 3 cột ở sở chỉ huy
//@@ s9
const _Y = new THREE.Vector3(0, 1, 0);
function nvHand(kind, clip, t, ph, pos, yaw, scale) {               // vị trí bàn tay phải (khung cầm) trong không gian
  const C = NVK[kind].clips[clip] || NVK[kind].clips.dung, f = nvFrame(C, t, ph, 0), o = f * 9;
  return new THREE.Vector3(C.mg[o + 6], C.mg[o + 7], C.mg[o + 8]).multiplyScalar(scale).applyAxisAngle(_Y, yaw).add(pos);
}
function nvBegin() { for (const im of NV_IMS) im.count = 0; for (const k in WP) WP[k].count = 0; coFlag.count = 0; }
//@@ s10
// ------------------------------------------------------------------ channel & creeks
//@@ s11
function sAtZ(z) { let lo = 0, hi = CH.length - 1; if (z <= CH[0][1]) return 0; if (z >= CH[hi][1]) return CHS[hi]; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CH[m][1] <= z) lo = m; else hi = m; } return CHS[lo] + (CHS[hi] - CHS[lo]) * (z - CH[lo][1]) / (CH[hi][1] - CH[lo][1]); }
const CR = INST.creeks;
//@@ s12
// ------------------------------------------------------------------ TideController
const TIDE = [[0, 0.2], [20, 1.6], [45, -1.2], [70, 0.6], [145, 0.8], [220, 0.8], [276, 0.6], [280, 2.2], [283, -2.4], [287, 2.2], [304, 2.2], [312, -2.6],
  [395, -2.6], [404, 0.5], [428, -1.5], [442, 1.0], [456, -2.4], [462, 2.2], [470, 2.2], [625, 2.2], [695, -0.6], [760, -2.5], [890, -2.6], [975, -2.6], [1055, -1.6], [1075, 0.6], [1155, 0.8]];
//@@ s13
// ------------------------------------------------------------------ Nam Hán fleet (ShipPathController)
const NS = 24, FLAG = 2;
const shipInst = new THREE.InstancedMesh(M['thuyen-nam-han'].geo, M['thuyen-nam-han'].mat, NS); shipInst.frustumCulled = false; scene.add(shipInst);
LAYER.nv.push(shipInst);
const bannerGeo = new THREE.PlaneGeometry(7, 4.2, 10, 4).translate(3.5, 0, 0);
function waveMat(color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => { sh.uniforms.uTime = U.time; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(position.x*0.9 - uTime*5.0 + float(gl_InstanceID)*1.7)*0.12*position.x;'); };
  clipList.push(m); return m;
}
const nhBanner = new THREE.InstancedMesh(bannerGeo, waveMat(0x7d1f1a), NS); nhBanner.frustumCulled = false; scene.add(nhBanner);
const CREW_LOCAL = [[-4, 15.2, 22], [4, 15.2, 18], [-3, 15.2, 6], [3.5, 15.2, 2], [-2, 37.5, -22], [2.5, 37.5, -26]];
const ships = [];
for (let i = 0; i < NS; i++) {
  const k = Math.floor(i / 2), lane = i % 2 ? 1 : -1;
  const zStuck = 2770 + ((11 - k) / 11) * 440 + (rnd(i, 1) - 0.5) * 60;
  ships.push({ i, k, lane, zStuck, latStuck: (rnd(i, 2) - 0.5) * 0.62, jam: (rnd(i, 3) - 0.5) * 1.4, roll0: (rnd(i, 4) - 0.5) * 0.16, pitch0: (rnd(i, 5) - 0.4) * 0.12,
    sink: i === FLAG ? 940 : (rnd(i, 6) < 0.42 ? 905 + rnd(i, 7) * 55 : 1e9), fire: i === FLAG ? 900 : rnd(i, 70) < 0.78 ? 816 + rnd(i, 71) * 78 : 1e9, x: 0, y: 0, z: 0, yaw: 0, roll: 0, pitch: 0, vis: false, stuck: 0 });
}
const LEAD = [[470, 4520], [545, 3900], [593, 3600], [625, 2600], [665, 1400]];
//@@ s14
function shipMatrix(sh, scale) { tmpE.set(sh.pitch, sh.yaw, sh.roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(sh.x, sh.y, sh.z); tmpS.setScalar(scale); return tmpM.compose(tmpV, tmpQ, tmpS); }
function localPt(sh, lx, ly, lz, scale = SS) { tmpE.set(sh.pitch, sh.yaw, sh.roll, 'YXZ'); tmpQ.setFromEuler(tmpE); return new THREE.Vector3(lx * scale, ly * scale, lz * scale).applyQuaternion(tmpQ).add(new THREE.Vector3(sh.x, sh.y, sh.z)); }
// động tác thủy thủ Nam Hán theo diễn biến: canh giữ → mắc cọc chao đảo (ngã) → chống trả
function crewAct(sh, c, t) {
  const w = c % 3 === 0 ? 'dao' : 'giao', idle = 'dung';      // giáo: đứng dựng giáo; đao: thế thủ, mũi đao chúc xuống
  if (t < 686) return { clip: idle, wpn: w, tSeg: 0 };
  if (sh.tStuck && t >= sh.tStuck && t < sh.tStuck + 7 && c % 2 === 0) return { clip: 'nga', wpn: null, tSeg: t - sh.tStuck - (c % 4) * 0.3 };
  if (t < 795) return { clip: idle, wpn: w, tSeg: 0 };
  const k = (c + sh.i) % 3; return k === 0 ? { clip: 'chem', wpn: 'dao', tSeg: 0 } : k === 1 ? { clip: 'dam', wpn: 'giao', tSeg: 0 } : { clip: 'ngam', wpn: 'cung', tSeg: 0 };
}
function updateShips(t, level) {
  for (const sh of ships) {
    sh.vis = t >= 470 && t < 1055; sh.stuck = 0; sh.sinkP = 0;
    if (!sh.vis) continue;
    const off = sh.k * 95;
    const lat0 = sh.lane * 0.13 + (rnd(sh.i, 9) - 0.5) * 0.04;
    let s, lat = lat0, yaw, bob = Math.sin(t * 0.9 + sh.i) * 0.25;
    const sTurn = sAtZ(keys(LEAD, 665)) + off;
    if (t < 665) {
      s = sAtZ(keys(LEAD, t)) + off; const c = chan(s, lat); yaw = Math.atan2(-c.dx, -c.dz);
    } else if (t < 686) {
      const u = sstep(665, 686, t); s = sTurn - 25 * Math.sin(u * Math.PI); lat = lat0 + 0.08 * Math.sin(u * Math.PI) * sh.lane;
      const c = chan(s, lat); yaw = angLerp(Math.atan2(-c.dx, -c.dz), Math.atan2(c.dx, c.dz), u);
    } else {
      const sS = sAtZ(sh.zStuck); const D = Math.max(8, (sS - sTurn) / 21); const u = clamp((t - 686) / D, 0, 1); sh.tStuck = 686 + 0.98 * D;
      s = sTurn + (sS - sTurn) * (1 - (1 - u) * (1 - u)); lat = lerp(lat0, sh.latStuck, sstep(0.3, 1, u));
      const c = chan(s, lat); yaw = Math.atan2(c.dx, c.dz) + sh.jam * sstep(0.85, 1, u);
      sh.stuck = u >= 0.98 ? 1 : 0;
      sh.roll = sh.roll0 * sstep(0.85, 1, u) * (level < -0.8 ? 1.6 : 1); sh.pitch = sh.pitch0 * sstep(0.85, 1, u);
    }
    const c = chan(s, lat); sh.x = c.x; sh.z = c.z; sh.yaw = yaw;
    if (t < 686) { sh.roll = Math.sin(t * 0.7 + sh.i) * 0.02; sh.pitch = Math.sin(t * 0.5 + sh.i * 2) * 0.012; }
    let y = level - 1.9 + bob * (sh.stuck ? 0.1 : 1);
    if (sh.stuck) y = Math.max(y, -1.55 + rnd(sh.i, 8) * 0.4);
    const sp = sstep(sh.sink, sh.sink + 28, t);
    if (sp > 0) { y -= sp * 4.6; sh.roll += sp * 0.33 * (sh.i % 2 ? 1 : -1); sh.pitch += sp * 0.1; }
    sh.y = y; sh.sinkP = sp;
    if (Math.hypot(sh.x, sh.z) > R - 22) sh.vis = false;
  }
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (const sh of ships) {
    shipInst.setMatrixAt(sh.i, sh.vis ? shipMatrix(sh, SS) : hide);
    // banner at mast top; flagship banner falls at 935
    if (sh.vis) {
      const fall = sh.i === FLAG ? sstep(933, 938, t) : sstep(sh.sink, sh.sink + 6, t);
      const p = localPt(sh, -1.6, 74 - fall * 38, 10);
      tmpE.set(0, sh.yaw + Math.PI / 2, fall * 1.3, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.setScalar(sh.i === FLAG ? 1.5 : 1);
      nhBanner.setMatrixAt(sh.i, tmpM.compose(p, tmpQ, tmpS));
    } else nhBanner.setMatrixAt(sh.i, hide);
    for (let c = 0; c < 6; c++) {
      const id = sh.i * 6 + c;
      if (!sh.vis || sh.sinkP > 0.35 || (sh.i === FLAG && c < 2)) continue;
      const L = CREW_LOCAL[c]; const p = localPt(sh, L[0], L[1], L[2]);
      const yaw = sh.yaw + (c % 2 ? 0.6 : -0.5) + Math.sin(t * 0.6 + id) * 0.2 * (t > 700 ? 3 : 1);
      const { clip, wpn, tSeg } = crewAct(sh, c, t);
      nvPut('linh-nam-han', clip, t, rnd(id, 50), p, yaw, EXAG, wpn, tSeg, id, sh.roll, sh.pitch);
    }
  }
  shipInst.instanceMatrix.needsUpdate = nhBanner.instanceMatrix.needsUpdate = true;
}

// ------------------------------------------------------------------ Vietnamese light boats
// thuyền nhỏ dùng chung với quân Tây Sơn (Rạch Gầm – Xoài Mút: m_thuyen_ts, dài 6,97 m); đã gỡ cờ Tây Sơn, cắm cờ quân Ngô
//@@ s15
const BOAT_S = EXAG, BOAT_DECK = 0.3, BOAT_STERN = [0, 0.3, -3.1];
const NB = 36, NCIV = 3;
const AV_BOAT = NB + NCIV;   // thuyền riêng cho nhân vật khi khám phá trên sông
//@@ s16
const boats = [];
const GROUP = (j) => (j < 12 ? 'lure' : j < 20 ? 'gia' : j < 28 ? 'chanh' : j < 32 ? 'thai' : 'uong');
function creekHide(name, j) { const pts = CR[name]; return polyAt(pts, 320 + (j % 8) * 34); }
for (let j = 0; j < NB + NCIV; j++) boats.push({ j, g: j >= NB ? 'civ' : GROUP(j), x: 0, y: 0, z: 0, yaw: 0, vis: false, row: 1, tgt: j % NS, ang: rnd(j, 11) * Math.PI * 2 });
//@@ s17
function lurePath(j) { const lat = ((j % 3) - 1) * 0.12 + (rnd(j, 1) - 0.5) * 0.05; return lat; }
//@@ s18
function boatFlag(Mb) {                                  // cán cờ ở đuôi thuyền, cờ quân Ngô bay theo gió
  if (!coOn) return; _bf2.multiplyMatrices(Mb, _bf);
  if (WP.co.count < WP.co.instanceMatrix.count) WP.co.setMatrixAt(WP.co.count++, _bf2);
  if (coFlag.count < 120) coFlag.setMatrixAt(coFlag.count++, _bf2);
}
function updateBoats(t, level) {
  for (const b of boats) {
    b.vis = false; b.row = 1; let x = 0, z = 0, yaw = 0;
    const j = b.j;
    if (b.g === 'civ') {
      const c = j - NB;
      if (c === 0 && (t < 72 || t > 1055)) { const tt = t > 1055 ? t - 1055 : t; const s = sAtZ(3700) - tt * 3.2; const p = chan(s, -0.22); x = p.x; z = p.z; yaw = Math.atan2(-p.dx, -p.dz); b.vis = true; }
      if (c === 1 && ((t > 400 && t < 470) || (t > 1060))) { const tt = t > 1060 ? t - 1060 : t - 400; const pts = CR.gia.slice(0, 30); const r = travel(pts.slice().reverse(), tt, 0, 3.5); x = r.x; z = r.z; yaw = r.yaw; b.vis = true; }
      if (c === 2 && t < 145) { x = 64; z = 2596; yaw = 2.6; b.vis = true; b.row = 0; }
    } else if (b.g === 'lure') {
      const lat = lurePath(j), off = Math.floor(j / 3) * 26;
      if (t >= 538 && t < 593) {
        const zz = keys([[538, 2980], [575, 3430], [593, 3470]], t) + off;
        const p = chan(sAtZ(zz), lat + Math.sin(t * 0.8 + j) * 0.03 * (t > 575 ? 1 : 0)); x = p.x; z = p.z; yaw = Math.atan2(p.dx, p.dz) + (t > 575 ? Math.sin(t * 1.3 + j) * 0.5 : 0); b.vis = true;
      } else if (t >= 593 && t < 640) {
        const zz = keys([[593, 3470], [600, 3380], [640, 1250]], t) + off;
        const p = chan(sAtZ(zz), lat); x = p.x; z = p.z; yaw = angLerp(Math.atan2(p.dx, p.dz), Math.atan2(-p.dx, -p.dz), sstep(593, 600, t)); b.vis = true;
      } else if (t >= 640 && t < 790) {
        const cr = j % 2 ? CR.uong : CR.thai; const start = chan(sAtZ(1250 + off), lat);
        const pts = [[start.x, start.z], ...cr.slice(0, 18 + (j % 6) * 2)];
        const r = travel(pts, t, 640, 14); x = r.x; z = r.z; yaw = r.yaw; b.vis = true; b.row = r.done ? 0 : 1;
      }
    }
    if (b.g !== 'civ' && t >= 640) {
      // ambush groups hidden in creeks, sortie from 780
      const crName = b.g === 'lure' ? (j % 2 ? 'uong' : 'thai') : b.g;
      const cr = CR[crName];
      const hide = b.g === 'lure' ? cr[Math.min(cr.length - 1, 18 + (j % 6) * 2)] : creekHide(crName, j);
      if (b.g !== 'lure' || t >= 790) {
        const t0 = 782 + rnd(j, 12) * 14;
        const tg = ships[b.tgt];
        const blocker = b.g === 'chanh' && j < 26;
        let dest;
        if (blocker) { const p = chan(sAtZ(3440), ((j - 20) / 5 - 0.5) * 0.7); dest = [p.x, p.z]; }
        else { const r0 = 30 + rnd(j, 13) * 18; dest = [tg.x + Math.cos(b.ang) * r0, tg.z + Math.sin(b.ang) * r0]; }
        const hideIdx = cr.findIndex((p) => Math.hypot(p[0] - hide[0], p[1] - hide[1]) < 25);
        const out = cr.slice(0, Math.max(1, hideIdx)).reverse();
        const pts = [hide, ...out, dest];
        if (t < t0) { x = hide[0]; z = hide[1]; const p2 = cr[Math.max(0, hideIdx - 1)]; yaw = Math.atan2(p2[0] - hide[0], p2[1] - hide[1]); b.vis = t >= 640 && (b.g !== 'lure' || t >= 790) ? true : b.vis; b.row = 0; }
        else if (t < 1000) {
          const bv = b.g === 'lure' ? 24 : 13, r = travel(pts, t, t0, bv); x = r.x; z = r.z; yaw = r.yaw; b.vis = true;
          if (r.done && !blocker) { const a = b.ang + (t - t0 - r.L / bv) * 0.05; x = tg.x + Math.cos(a) * 36; z = tg.z + Math.sin(a) * 36; yaw = a + Math.PI; b.row = 0.4; }
          if (r.done && blocker) { yaw = Math.PI * 0.5; b.row = 0; }
        } else if (t < 1055) {
          const p = chan(sAtZ(2300 - (j % 12) * 40), ((j % 5) / 4 - 0.5) * 0.5); const st = [dest[0], dest[1]];
          const r = travel([st, [p.x, p.z]], t, 1000, 11); x = r.x; z = r.z; yaw = r.yaw; b.vis = true;
        }
      }
    }
    if (b.vis && !isWater(x, z) && hAt(x, z) > level + 0.2) { /* keep on water surface anyway */ }
    b.x = x; b.z = z; b.yaw = yaw; b.y = Math.max(level, hAt(x, z) + 0.35) - 0.18 + Math.sin(t * 1.4 + j) * 0.06;
  }
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  for (const b of boats) {
    const j = b.j;
    if (!b.vis) { boatInst.setMatrixAt(j, hide); continue; }
    const roll = Math.sin(t * 1.1 + j) * 0.03;
    tmpE.set(0, b.yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(b.x, b.y, b.z); tmpS.setScalar(BOAT_S);
    boatInst.setMatrixAt(j, tmpM.compose(tmpV, tmpQ, tmpS));
    if (j < NB) boatFlag(tmpM);
    const q = tmpQ.clone();
    const crewN = b.g === 'civ' ? 2 : 4;
    const fight = (t > 575 && t < 593) || (t > 800 && t < 975);
    for (let c = 0; c < crewN; c++) {
      // người mạn phải (chẵn) chèo bên phải; người mạn trái (lẻ) là bản soi gương, chèo bên trái — tay cầm đúng phía
      const right = c % 2 === 0, lz = (1.3 - c * 1.28) * BOAT_S;
      let clip = b.row > 0.5 ? 'cheo' : b.g === 'civ' ? 'dung' : 'dung', wpn = clip === 'cheo' ? 'cheo' : b.g === 'civ' ? null : 'giao';
      if (b.g !== 'civ' && fight && c === 0) { clip = 'ngam'; wpn = 'cung'; }
      if (b.g !== 'civ' && fight && c === 1 && b.row < 0.5) { clip = 'chem'; wpn = 'dao'; }
      const sit = clip === 'cheo', lx = sit ? (right ? -0.2 : 0.2) : (right ? -0.12 : 0.12);
      const p = new THREE.Vector3(lx * BOAT_S, BOAT_DECK * BOAT_S, lz).applyQuaternion(q).add(tmpV);
      nvPut('dan-binh', clip, t * (sit ? 0.8 : 1), rnd(j * 5 + c, 51) * (sit ? 0.15 : 1), p, b.yaw, EXAG * 0.95, wpn, 0, j * 5 + c, roll, 0, 1, sit && !right);
    }
  }
  boatInst.instanceMatrix.needsUpdate = true;
}
// ------------------------------------------------------------------ land forces & heroes
//@@ s19
const NQ = proxy(), LHT = proxy();
//@@ s20
const nhHeroes = [proxy(), proxy(), proxy()];
const ambushN = 170, armyN = 90;
//@@ s21
const blob = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
//@@ s22
const MARCH = MARCH0;                 // đường hành quân trên đất khô tới sở chỉ huy (tìm bằng A* trên bản đồ cao độ, tránh sông Thải)
const marchLen = polyLen(MARCH);
const MARCH_V = 2.0;                   // m/s, khớp nhịp bước Standard Walk (đã phóng đại 1,6)
const marchHead = (t) => marchLen - 130 + (t - 145) * MARCH_V;   // đầu đoàn (Ngô Quyền) tới sở chỉ huy khoảng giây 210
const AMB = [];
for (let i = 0; i < ambushN; i++) {
  const west = i < 100; const k = west ? i : i - 100;
  const z = 2600 + (k / (west ? 100 : 70)) * 800 + (rnd(i, 20) - 0.5) * 30;
  let x = west ? -40 - rnd(i, 21) * 70 : 1330 + rnd(i, 21) * 80;
  // keep on dry land
  let tries = 0; while (hAt(x, z) < 1.4 && tries++ < 20) x += west ? -12 : 12;
  AMB.push([x, z, west ? Math.PI / 2 : -Math.PI / 2]);
}
// các tướng đứng quanh bàn sa bàn, quay mặt vào bàn họp bàn (x, z, hướng, quay ra sông ở cảnh C04-D)
const COUNCIL = [[2.55, -0.1, -Math.PI / 2, 2.2], [-2.55, 0.15, Math.PI / 2, -0.6], [0, 2.15, Math.PI, 0.9]];
const BV = new THREE.Vector3(-70, 0, 2700);
// ---- công trường: tốp đẽo cọc quanh đống gỗ, tốp rèn quanh đe, tốp khiêng cọc đi bộ, tốp dựng cọc ở mép nước
const HEW = [[-21.5, 2878.5], [-22.5, 2886.5], [-14, 2881.5], [-15, 2890]];          // tâm mỗi thân gỗ đang đẽo
const ANVIL = [-44, 2915.2];
const CARRY = [[[-10, 2895], [128, 2930]], [[-12, 2901], [150, 2952]]];                // bến → mép nước
const RAISE = [[150, 2930], [168, 2944], [184, 2958], [160, 2965]];                     // chân cọc đang dựng (mép bãi cọc phía Tây)
const RAISE_P = 15;                                                                      // chu kỳ dựng một cây cọc (giây)
const hewLog = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.25, 5.5, 7).rotateZ(Math.PI / 2), propMat, HEW.length);
const carryLog = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.17, 0.2, 5.2, 7).rotateZ(Math.PI / 2), propMat, CARRY.length);
const raiseStake = new THREE.InstancedMesh(merge([colored(new THREE.CylinderGeometry(0.17, 0.21, 5.2, 7).translate(0, 2.6, 0), WOOD), colored(new THREE.ConeGeometry(0.18, 0.7, 7).translate(0, 5.55, 0), DARK)]), propMat, RAISE.length);
for (const m of [hewLog, carryLog, raiseStake]) { m.frustumCulled = false; scene.add(m); }
const ropeGeo = new THREE.BufferGeometry(); ropeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAISE.length * 2 * 2 * 3), 3));
const ropes = new THREE.LineSegments(ropeGeo, new THREE.LineBasicMaterial({ color: 0xcdbb8c })); ropes.frustumCulled = false; scene.add(ropes);
HEW.forEach(([x, z], i) => { dummy.position.set(x, hG(x, z) + 0.28, z); dummy.rotation.set(0, 0.35 + i * 0.4, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); hewLog.setMatrixAt(i, dummy.matrix); });
const wadeY = (x, z, t) => Math.max(hG(x, z), tideAt(t) - 0.85);
function workSite(t) {
  const on = t >= 300 && t < 470;
  hewLog.visible = carryLog.visible = raiseStake.visible = ropes.visible = on;
  workers.forEach((w) => { w.visible = false; });
  if (!on) return;
  let wi = 0; const proxyAt = (x, y, z, yaw) => { if (wi < workers.length) { const w = workers[wi++]; w.visible = true; w.position.set(x, y, z); w.rotation.set(0, yaw, 0); } };
  // 1) đẽo cọc: 3 người quanh mỗi thân gỗ, bổ rìu xuống
  HEW.forEach(([cx, cz], g) => {
    const a0 = 0.35 + g * 0.4;
    for (let k = 0; k < 3; k++) {
      const along = (k - 1) * 1.7, sideS = k === 1 ? -1 : 1;
      const x = cx + Math.cos(a0) * along + Math.sin(a0) * 1.25 * sideS, z = cz - Math.sin(a0) * along + Math.cos(a0) * 1.25 * sideS;
      const yaw = Math.atan2(cx + Math.cos(a0) * along - x, cz - Math.sin(a0) * along - z);
      _np.set(x, hG(x, z), z); if (g === 0 && k === 0) proxyAt(x, _np.y, z, yaw);
      nvPut('dan-binh', 'dam', t, rnd(g * 3 + k, 61), _np, yaw, EXAG, 'riu', 0, 30 + g * 3 + k);
    }
  });
  // 2) lò rèn: 3 người đập búa quanh đe, 1 người giữ lửa
  for (let k = 0; k < 4; k++) {
    const a = -0.9 + k * 1.25, r = k === 3 ? 0 : 1.35;
    let x = ANVIL[0] + Math.sin(a) * r, z = ANVIL[1] + Math.cos(a) * r, yaw = a + Math.PI;
    if (k === 3) { x = forge.position.x - 1.6; z = forge.position.z + 0.6; yaw = Math.PI / 2 + 0.3; }
    _np.set(x, hG(x, z), z); if (k === 0) proxyAt(x, _np.y, z, yaw);
    nvPut('dan-binh', k === 3 ? 'dung' : 'dam', t, k * 0.31, _np, yaw, EXAG, k === 3 ? null : 'bua', 0, 44 + k);
  }
  // 3) khiêng cọc: hai người một cây, đi bộ đúng nhịp bước (2 m/s), đi xuống mép nước rồi quay về
  CARRY.forEach(([A, B], g) => {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), per = (2 * L) / MARCH_V, ph = ((t - 300 + g * per * 0.45) % per) / per;
    const fwd = ph < 0.5, u = fwd ? ph * 2 : 2 - ph * 2, dx = (B[0] - A[0]) / L, dz = (B[1] - A[1]) / L;
    const yaw = Math.atan2(dx, dz) + (fwd ? 0 : Math.PI), dir = fwd ? 1 : -1;
    const ps = [], vac = fwd && NVK['dan-binh'].clips.vac ? 'vac' : 'di';
    for (let k = 0; k < 2; k++) {
      const off = (k ? -1.35 : 1.35) * dir, x = A[0] + dx * (u * L + off), z = A[1] + dz * (u * L + off), y = wadeY(x, z, t);
      _np.set(x, y, z); if (g === 0 && k === 0) proxyAt(x, y, z, yaw);
      nvPut('dan-binh', vac, t, k * 0.5, _np, yaw, EXAG, null, 0, 50 + g * 2 + k);
      if (vac === 'vac') ps.push(nvHand('dan-binh', vac, t, k * 0.5, _np, yaw, EXAG));        // bàn tay phải đỡ cây gỗ trên vai
      else ps.push(_np.clone().add(new THREE.Vector3(-0.2 * EXAG, 1.5 * EXAG, 0).applyAxisAngle(_Y, yaw)));   // chưa có động tác vác: đặt gỗ lên vai phải
    }
    if (fwd) {                                                              // cây gỗ nằm trên vai phải hai người, dưới bàn tay đỡ
      const m = ps[0].clone().add(ps[1]).multiplyScalar(0.5); m.y -= 0.09 * EXAG; const d = ps[0].clone().sub(ps[1]).normalize();
      dummy.position.copy(m); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d); dummy.scale.set(1, 0.85, 0.85);
    } else dummy.scale.set(0, 0, 0);
    dummy.updateMatrix(); carryLog.setMatrixAt(g, dummy.matrix);
  });
  carryLog.instanceMatrix.needsUpdate = true;
  // 4) dựng cọc: 2 người kéo dây phía trước, 2 người đẩy thân cọc, cọc nghiêng dần từ nằm sang dựng (không trượt)
  const rp = ropeGeo.attributes.position.array; let ri = 0;
  RAISE.forEach(([bx, bz], g) => {
    const ph = ((t - 300 + g * 3.7) % RAISE_P) / RAISE_P;
    const lift = sstep(0.12, 0.7, ph), sink = sstep(0.9, 1, ph);
    const th = lerp(1.32, 0.3, lift);                            // góc nghiêng so với phương đứng
    const by = Math.max(hG(bx, bz), -4) - sink * 1.2, d = new THREE.Vector3(-Math.sin(th), Math.cos(th), 0);
    dummy.position.set(bx, by, bz); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); dummy.scale.setScalar(sink > 0.98 ? 0 : 1); dummy.updateMatrix(); raiseStake.setMatrixAt(g, dummy.matrix);
    const top = new THREE.Vector3(bx, by, bz).addScaledVector(d, 4.4);
    for (let k = 0; k < 4; k++) {
      const pull = k < 2, x = pull ? bx + 6.2 + k * 1.7 : bx - 1.6 - k * 0.15 + (k - 2) * 0.2, z = bz + (k % 2 ? 0.9 : -0.9) * (pull ? 0.8 : 1);
      const y = wadeY(x, z, t), yaw = pull ? -Math.PI / 2 : Math.PI / 2;
      _np.set(x, y, z); if (g === 0 && k === 0) proxyAt(x, y, z, yaw);
      nvPut('dan-binh', pull ? 'keo' : 'day', t * (0.6 + lift * 0.6), rnd(g * 4 + k, 62), _np, yaw, EXAG, null, 0, 56 + g * 4 + k);
      if (pull) { rp[ri++] = top.x; rp[ri++] = top.y; rp[ri++] = top.z; rp[ri++] = x - 0.5; rp[ri++] = y + 1.05 * EXAG; rp[ri++] = z; }
    }
  });
  raiseStake.instanceMatrix.needsUpdate = true; ropeGeo.attributes.position.needsUpdate = true;
} BV.y = hAt(BV.x, BV.z);
function updateLand(t) {
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  // Ngô Quyền
  if (t >= 145 && t < 205 && marchHead(t) < marchLen - 6) {
    const d = marchHead(t); const p = polyAt(MARCH, Math.min(d, marchLen - 6)); const p2 = polyAt(MARCH, Math.min(d + 5, marchLen));
    place(NQ, p[0], p[1], Math.atan2(p2[0] - p[0], p2[1] - p[1]));
  } else if (t >= 205 && t < 975) place(NQ, CP.x, CP.z - 2.15, 0);          // đứng đầu bàn sa bàn, quay mặt vào bàn
  else if (t >= 975 && t < 1075) place(NQ, BV.x, BV.z, Math.PI / 2 + 0.2);
  else if (t >= 1075 && t < 1115) { const u = (t - 1075) / 40; place(NQ, BV.x - u * 60, BV.z - u * 30, -Math.PI / 2 - 0.4); }
  else NQ.visible = false;
  // generals
  generals.forEach((g, i) => {
    if (t >= 205 && t < 975) { const P = COUNCIL[i]; place(g, CP.x + P[0], CP.z + P[1], P[2] + (t > 262.5 && t < 276.6 ? P[3] : 0)); }
    else if (t >= 975 && t < 1075) place(g, BV.x - 3 - i * 2.2, BV.z + 2.5 + i * 1.5, Math.PI / 2 + 0.3);
    else g.visible = false;
  });
  // C05: công trường bãi cọc — mỗi chỗ một tốp người (đẽo cọc, rèn, khiêng, dựng cọc), đứng tại chỗ làm việc, không trượt
  workSite(t);
  // archers on west bank C11-C13
  archers.forEach((a, i) => { if (t >= 780 && t < 1055) place(a, 28 - (i % 2) * 3, 2955 + i * 4.2, Math.PI / 2 + 0.15); else a.visible = false; });
  // Lưu Hoằng Tháo + guards on flagship
  const fs = ships[FLAG];
  const showL = fs.vis && t < 936 && t >= 470;
  LHT.visible = showL;
  if (showL) { const p = localPt(fs, 0, 37.6, -21); LHT.position.copy(p); LHT.rotation.set(fs.pitch, fs.yaw, fs.roll, 'YXZ'); }
  nhHeroes.forEach((h, i) => {
    const sh = ships[[FLAG, 6, 6][i]];
    const ok = sh.vis && sh.sinkP < 0.3 && (i > 0 || t < 936);
    h.visible = ok;
    if (ok) { const L = [[3, 37.6, -24], [-3.5, 15.2, 12], [3, 15.2, 16]][i]; h.position.copy(localPt(sh, L[0], L[1], L[2])); h.rotation.set(sh.pitch, sh.yaw + [0.7, -0.8, 0.5][i] + (t > 700 ? Math.sin(t * 0.9 + i) * 0.6 : 0), sh.roll, 'YXZ'); }
  });
  // ambush infantry along the banks (C07–C13)
  for (let i = 0; i < ambushN; i++) {
    if (t >= 470 && t < 1055) {
      const [x, z, yaw] = AMB[i]; _np.set(x, hG(x, z), z);
      let wpn = i % 20 === 7 ? 'co' : i % 4 === 1 ? 'dao' : i % 4 === 3 ? 'cung' : 'giao', clip = 'dung';
      if (wpn === 'cung') clip = t >= 795 && t < 975 ? 'ngam' : 'dung';        // cung thủ: giương cung khi giao chiến
      nvPut('dan-binh', clip, t, rnd(i, 52), _np, yaw + Math.sin(i) * 0.3, farScale(x, _np.y, z), wpn, 0, i);
    }
  }

  // marching army C03 (and gathering at CP), C14 people returning
  for (let i = 0; i < armyN; i++) {
    let show = false, x = 0, z = 0, yaw = 0;
    if (t >= 145 && t < 305) {
      const d = marchHead(t) - 6 - Math.floor(i / 3) * 3.2;
      if (d > -400) { const row = (i % 3) - 1; const p = polyAt(MARCH, Math.min(d, marchLen)); const p2 = polyAt(MARCH, Math.min(d + 5, marchLen)); yaw = Math.atan2(p2[0] - p[0], p2[1] - p[1]); x = p[0] + Math.cos(yaw) * row * 2.2; z = p[1] - Math.sin(yaw) * row * 2.2; show = true;
        if (d >= marchLen - 1) { const a = (i / armyN) * Math.PI * 1.6 + 2.2; const r = 18 + (i % 4) * 3.4; x = CP.x + Math.cos(a) * r; z = CP.z + Math.sin(a) * r; yaw = Math.atan2(CP.x - x, CP.z - z); } }
    } else if (t >= 1075 && t < 1115) { const u = (t - 1075) / 40; const a = i * 0.7; x = BV.x - 20 - u * 90 + Math.cos(a) * (6 + (i % 7) * 2); z = BV.z - u * 40 + Math.sin(a) * (6 + (i % 5) * 2.2); yaw = -Math.PI / 2 - 0.4; show = true; }
    if (show) {
      _np.set(x, hG(x, z), z);
      const moving = (t >= 145 && t < 305 && marchHead(t) - 6 - Math.floor(i / 3) * 3.2 < marchLen - 1) || (t >= 1075 && t < 1115);
      nvPut('dan-binh', moving ? 'di' : 'dung', t, rnd(i, 53), _np, yaw, farScale(x, _np.y, z), i % 12 === 3 ? 'co' : i % 3 === 2 ? 'dao' : 'giao', 0, i + 3);
    }
  }
  // các nhân vật chính và nhóm nhỏ
  const chihuy = (a, b) => t >= a && t < b;
  drawP(NQ, 'ngo-quyen', t >= 145 && t < 205 ? 'di' : t >= 1075 && t < 1115 ? 'di' : chihuy(234, 248) ? 'chihuy' : chihuy(991, 1007) ? 'chihuy' : 'dung', 0.1, null, chihuy(234, 248) ? t - 234 : t - 991, 0, false);
  generals.forEach((g, i) => drawP(g, 'dan-binh', 'dung', 0.2 + i * 0.3, 'dao', 0, 20 + i, false));
  archers.forEach((a, i) => drawP(a, 'dan-binh', t < 975 ? 'ngam' : 'dung', 0.17 * i, t < 975 ? 'cung' : 'giao', 0, 40 + i, false));
  drawP(LHT, 'luu-hoang-thao', chihuy(515, 530) ? 'chihuy' : chihuy(905, 936) ? 'chem' : 'dung', 0.3, chihuy(905, 936) ? 'dao' : null, t - 515, 0, false);
  nhHeroes.forEach((h, i) => drawP(h, 'linh-nam-han', t < 795 ? 'dung' : i ? 'dam' : 'chem', 0.21 * i, i ? 'giao' : 'dao', 0, 60 + i, false));
}

// ------------------------------------------------------------------ effects: smoke, arrows, attack arrows, Nam Hán route arrow
//@@ s23
const fireF = (sh, t) => (sh.vis ? sstep(sh.fire, sh.fire + 14, t) * (1 - sstep(0.35, 0.85, sh.sinkP)) * (1 - sstep(1000, 1050, t)) : 0);
//@@ s24
function updateArrows(t) {
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const active = (t > 800 && t < 975) || (t > 575 && t < 593);
  for (let i = 0; i < ARROW_N; i++) {
    if (!active) { arrows.setMatrixAt(i, hide); continue; }
    let from, to;
    if (t < 600) { const b = boats[i % 12], sh = ships[i % 6]; if (!b.vis || !sh.vis) { arrows.setMatrixAt(i, hide); continue; } const flip = i % 3 === 0; from = flip ? [sh.x, sh.y + 7, sh.z] : [b.x, b.y + 2, b.z]; to = flip ? [b.x, b.y, b.z] : [sh.x, sh.y + 5, sh.z]; }
    else if (i < 60) { const a = archers[i % archers.length]; const sh = ships[(i * 7) % NS]; if (!sh.vis || !a.visible) { arrows.setMatrixAt(i, hide); continue; } from = [a.position.x, a.position.y + 2.2, a.position.z]; to = [sh.x, sh.y + 6, sh.z]; }
    else { const b = boats[12 + (i % 24)], sh = ships[b.tgt]; if (!b.vis || !sh.vis) { arrows.setMatrixAt(i, hide); continue; } const flip = i % 4 === 0; from = flip ? [sh.x, sh.y + 8, sh.z] : [b.x, b.y + 2, b.z]; to = flip ? [b.x, b.y, b.z] : [sh.x + (rnd(i, 40) - 0.5) * 10, sh.y + 6, sh.z + (rnd(i, 41) - 0.5) * 10]; }
    const per = 2.2 + rnd(i, 42) * 1.5; const u = ((t + rnd(i, 43) * per) % per) / per;
    const dist = Math.hypot(to[0] - from[0], to[2] - from[2]); const arc = dist * 0.18;
    const x = lerp(from[0], to[0], u), z = lerp(from[2], to[2], u), y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arc;
    const dy = (to[1] - from[1]) + Math.cos(u * Math.PI) * Math.PI * arc;
    dummy.position.set(x, y, z); dummy.lookAt(x + (to[0] - from[0]), y + dy, z + (to[2] - from[2])); dummy.scale.set(1, 1, Math.max(1, dist / 60)); dummy.updateMatrix();
    arrows.setMatrixAt(i, dummy.matrix);
  }
  arrows.instanceMatrix.needsUpdate = true;
}
// ---- tên lửa (tên tẩm dầu đốt) bắn vào thuyền Nam Hán, lửa và khói trên thuyền trúng tên
//@@ s25
const _fq = new THREE.Quaternion(), _fe = new THREE.Euler(), _fv = new THREE.Vector3();
function updateFire(t) {
  const hide = new THREE.Matrix4().makeScale(0, 0, 0), tt = U.time.value;
  // tên lửa: từ cung thủ bờ Tây và từ thuyền nhẹ quân ta, rơi vào thuyền sắp bốc cháy
  const active = t > 806 && t < 965;
  for (let i = 0; i < FA_N; i++) {
    let from = null, sh = null;
    if (active) {
      sh = ships[(i * 5 + 3) % NS]; if (!sh.vis || sh.sinkP > 0.4 || t < sh.fire - 14) sh = null;
      if (sh) {
        if (i % 3 === 0) { const a = AMB[(i * 7) % 100]; from = [a[0], hG(a[0], a[1]) + 2.6, a[1]]; }
        else { const b = boats[12 + (i % 24)]; if (b.vis) from = [b.x, b.y + 2.4, b.z]; }
      }
    }
    if (!from) { fireArrows.setMatrixAt(i, hide); continue; }
    const to = [sh.x + (rnd(i, 72) - 0.5) * 16, sh.y + 10 + rnd(i, 73) * 8, sh.z + (rnd(i, 74) - 0.5) * 30];
    const dist = Math.hypot(to[0] - from[0], to[2] - from[2]); if (dist > 700) { fireArrows.setMatrixAt(i, hide); continue; }
    const per = 1.6 + dist / 90 + rnd(i, 75) * 1.2, u = ((t + rnd(i, 76) * per) % per) / per, arc = dist * 0.2;
    const x = lerp(from[0], to[0], u), z = lerp(from[2], to[2], u), y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arc;
    const dy = (to[1] - from[1]) + Math.cos(u * Math.PI) * Math.PI * arc;
    dummy.position.set(x, y, z); dummy.lookAt(x + (to[0] - from[0]), y + dy, z + (to[2] - from[2])); dummy.scale.set(1 + dist / 400, 1 + dist / 400, 1 + dist / 260); dummy.updateMatrix();
    fireArrows.setMatrixAt(i, dummy.matrix);
  }
  fireArrows.instanceMatrix.needsUpdate = true;
  // ngọn lửa trên boong
  let lx = 0, lz = 0, ln = 0;
  for (let i = 0; i < FIRE_N; i++) {
    const sh = ships[i % NS], f = fireF(sh, t);
    if (f <= 0.001) { fireA[i] = 0; continue; }
    const life = 0.9 + rnd(i, 80) * 0.8, age = ((tt + rnd(i, 81) * life) % life) / life;
    const spread = 0.25 + 0.75 * f, lxp = (rnd(i, 82) - 0.5) * 18, lzp = (rnd(i, 83) - 0.5) * 92 * spread, lyp = 16 + (rnd(i, 84) < 0.25 ? 20 : 0) + age * (9 + rnd(i, 85) * 8);
    _fv.copy(localPt(sh, lxp, lyp, lzp));
    firePos[i * 3] = _fv.x + age * 2.5; firePos[i * 3 + 1] = _fv.y; firePos[i * 3 + 2] = _fv.z + age * 1.2;
    fireA[i] = f * (1 - age) * sstep(0, 0.12, age) * (0.55 + 0.45 * Math.sin(tt * 13 + i)); fireS[i] = (5 + rnd(i, 86) * 5) * (1.2 - age * 0.6); fireH[i] = age;
    if ((i % 40) === 0) { lx += sh.x * f; lz += sh.z * f; ln += f; }
  }
  fireGeo.attributes.position.needsUpdate = fireGeo.attributes.aA.needsUpdate = fireGeo.attributes.aS.needsUpdate = fireGeo.attributes.aH.needsUpdate = true;
  fireLight.intensity = ln > 0 ? Math.min(6, ln * 0.18) * 1e4 / 1e4 * 900 : 0; if (ln > 0) fireLight.position.set(lx / ln, 40, lz / ln);
}
// far markers (direction only, not to scale)
//@@ s26
const MARK = {
  daila: { p: bearingPt(274, 14000), t: 'Đại La (hướng Tây, ~95 km)' },
  coloa: { p: bearingPt(281, 15500), t: 'Cổ Loa (hướng Tây, ~95 km)' },
  namhan: { p: bearingPt(70, 15000), t: 'Nam Hán · Quảng Châu (hướng Đông Bắc)' },
  sea: { p: bearingPt(168, 11000), t: 'Ra biển · cửa Nam Triệu' },
  aichau: { p: bearingPt(222, 15000), t: 'Ái Châu (hướng Tây Nam)' },
};
const markMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, emissive: 0x6b4c1c, emissiveIntensity: 0.6, roughness: 0.6 });
for (const k in MARK) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(18, 40, 420, 6).translate(0, 210, 0), markMat); m.position.copy(MARK[k].p); scene.add(m);
  MARK[k].mesh = m; MARK[k].top = MARK[k].p.clone().add(new THREE.Vector3(0, 470, 0));
}
//@@ s27
const spiral = new THREE.Group();
{ const pts = []; for (let i = 0; i < 260; i++) { const a = i * 0.075, r = 120 + i * 2.3; pts.push(new THREE.Vector3(Math.cos(a) * r, 20, Math.sin(a) * r)); }
  spiral.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 38, 6), new THREE.MeshStandardMaterial({ color: 0xd8b26e, emissive: 0x8a5d20, emissiveIntensity: 0.9, roughness: 0.6 })));
  spiral.position.copy(MARK.coloa.p); spiral.visible = false; scene.add(spiral); }
//@@ s28
const routeNH = dashTube([MARK.namhan.p.clone().setY(60), new THREE.Vector3(9000, 60, 2000), new THREE.Vector3(5200, 60, 7200), new THREE.Vector3(1500, 40, 6200), new THREE.Vector3(720, 20, 4300), new THREE.Vector3(650, 20, 2000)], 0xd2442b, 70);
const routeNQ = dashTube([MARK.aichau.p.clone().setY(60), new THREE.Vector3(-11000, 60, 2500), MARK.daila.p.clone().setY(60), new THREE.Vector3(-6000, 60, 500), new THREE.Vector3(-2400, 60, 200), new THREE.Vector3(CP.x, CP.y + 30, CP.z)], 0xe3c178, 60);
// C02: đường bay vòng cung cầu cứu từ Đại La sang Nam Hán
const HELP_PTS = [MARK.daila.top.clone(), new THREE.Vector3(-8000, 3600, -2600), new THREE.Vector3(0, 5200, -3900), new THREE.Vector3(8000, 3600, -4900), MARK.namhan.top.clone()];
const helpCurve = new THREE.CatmullRomCurve3(HELP_PTS);
const helpArc = dashTube(HELP_PTS, 0xf0c060, 230);
const attackArrows = [];
for (const [a, b] of [[CR.gia[30], [520, 2950]], [CR.chanh[22], [860, 3080]], [CR.thai[14], [560, 2780]], [CR.uong[14], [700, 2760]], [[-60, 2800], [380, 2950]], [[1400, 3000], [980, 3000]]]) {
  const m = dashTube([new THREE.Vector3(a[0], 12, a[1]), new THREE.Vector3((a[0] + b[0]) / 2, 24, (a[1] + b[1]) / 2), new THREE.Vector3(b[0], 12, b[1])], 0xe3c178, 7); attackArrows.push(m);
}

//@@ s29
const SKYKEYS = [[0, 'Sương sớm cuối đông'], [52, 'Trời u ám mùa đông'], [70, 'Hoàng hôn biến loạn'], [145, 'Sáng trong'], [220, 'Chiều nắng ấm'], [305, 'Ngày nhiều mây'], [400, 'Sương sông buổi sớm'], [470, 'Mây đen áp sát'], [545, 'Triều cường giữa trưa'], [625, 'Chiều ngả hổ phách'], [695, 'Giông chiều cam đỏ'], [795, 'Khói trận'], [890, 'Chạng vạng đỏ thẫm'], [975, 'Hoàng hôn vàng lặng'], [1055, 'Bình minh hồng'], [1115, 'Sáng trong']];
//@@ s30
// ------------------------------------------------------------------ CameraDirector: 74 góc máy
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
//@@ s31
const STK = V3(680, -1, 2990), MOUTH = V3(705, 0, 4100), WS = V3(-20, 0, 2900);
//@@ s32
function shipCam(i, lx, ly, lz, tx, ty, tz, fov = 40, l2) { return (u) => { const sh = ships[i]; const off = l2 ? [lerp(lx, l2[0], ease(u)), lerp(ly, l2[1], ease(u)), lerp(lz, l2[2], ease(u))] : [lx, ly, lz]; return [localPt(sh, off[0], off[1], off[2]), localPt(sh, tx, ty, tz), fov]; }; }
//@@ s33
function fleetCenter() { let x = 0, z = 0, n = 0; for (const s of ships) if (s.vis) { x += s.x; z += s.z; n++; } return n ? V3(x / n, 0, z / n) : STK.clone(); }
// cảnh trung: máy quay lướt dọc đoàn chiến thuyền / vòng quanh một chiến thuyền ở khoảng cách 100–160 m (không cận quân Nam Hán)
const SHIP_ORDER = ships.slice().sort((a, b) => a.k - b.k || a.lane - b.lane);
function fleetPass(a, b, side, dist, h, fov = 40) { return (u) => { const A = SHIP_ORDER[a], B = SHIP_ORDER[b], e = ease(u), e2 = Math.min(1, e + 0.2);
  const nx = Math.cos(A.yaw) * side, nz = -Math.sin(A.yaw) * side;
  return [V3(lerp(A.x, B.x, e) + nx * dist, Math.max(tideNow, 0) + h, lerp(A.z, B.z, e) + nz * dist), V3(lerp(A.x, B.x, e2), 9, lerp(A.z, B.z, e2)), fov]; }; }
function shipOrbit(i, r, h, a0, a1, fov = 40) { return (u) => { const sh = ships[i], a = sh.yaw + lerp(a0, a1, ease(u)); return [V3(sh.x + Math.sin(a) * r, Math.max(tideNow, 0) + h, sh.z + Math.cos(a) * r), V3(sh.x, sh.y + 12, sh.z), fov]; }; }
const SHOTS = {
  'C01-A': fly(V3(1700, 950, 10800), V3(950, 330, 5600), V3(700, 0, 3000), V3(650, 0, 2500), 42),
  'C01-B': fly(V3(1550, 170, 4350), V3(1180, 24, 3420), V3(900, 0, 3050), V3(1300, 0, 3200), 45),
  'C01-C': boatCam(NB, -22, 9, -14, 0, 0, 4, 40),
  'C01-D': (u) => [V3(lerp(108, 96, u), tideNow + 1.3, lerp(2618, 2604, u)), V3(58, tideNow + 0.2, 2590), 38],
  'C01-E': fly(V3(700, 500, 3700), V3(-2600, 5200, 6900), V3(650, 0, 2600), V3(200, 0, -200), 45),
  'C02-A': fly(V3(0, 15000, 11000), V3(0, 12500, 8500), V3(-500, 0, -1500), V3(-800, 0, -1800), 50),
  'C02-B': fly(V3(-1500, 2600, 2400), V3(-2600, 2100, 1500), MARK.daila.p.clone().setY(400), MARK.daila.p.clone().setY(250), 40),
  'C02-C': fly(V3(-8000, 1500, 1800), V3(-9300, 1100, 1300), MARK.daila.p.clone().setY(250), MARK.daila.p.clone().setY(150), 40),
  'C02-D': fly(V3(-3000, 14000, 26000), V3(2000, 13000, 24000), V3(0, 6500, -3000), V3(0, 6000, -3000), 55),
  'C02-E': fly(V3(-4500, 9500, 9500), V3(-3000, 8200, 9800), V3(4200, 0, -1000), V3(2500, 0, 1500), 50),
  'C03-A': (u, t) => { const p = polyAt(MARCH, marchHead(t) - 50); return [V3(p[0] - 60 + u * 30, G(p[0], p[1]) + 150, p[1] + 230 - u * 40), V3(p[0] + 10, G(p[0], p[1]), p[1] - 5), 38]; },
  'C03-B': objCam(NQ, -3.5, 3.4, 8.5, 0, 2.3, 0, 34, [-2.8, 3.0, 7.0]),
  'C03-C': objCam(NQ, -1.6, 3.2, 3.8, 0, 2.4, 0, 30, [-1.3, 3.0, 3.2]),
  'C03-D': fly(V3(CP.x + 36, CP.y + 12, CP.z + 44), V3(CP.x + 24, CP.y + 9, CP.z + 32), V3(CP.x, CP.y + 1.5, CP.z), V3(CP.x - 6, CP.y + 1, CP.z), 42),
  'C03-E': orbit(V3(CP.x, CP.y, CP.z), 240, 110, 0.8, 1.9, 45),
  'C04-A': fly(V3(CP.x + 15, CP.y + 7, CP.z + 15), V3(CP.x + 10, CP.y + 5, CP.z + 11), V3(CP.x, CP.y + 1.2, CP.z), V3(CP.x - 1, CP.y + 1.2, CP.z), 40),
  'C04-B': (u) => [V3(CP.x - 1.5 - u * 0.6, CP.y + 3.1, CP.z - 5.2 + u * 0.4), V3(STK.x, 0, lerp(1200, 2500, ease(u))), 36],
  'C04-C': (u) => [V3(tableTop.x + 0.25 + u * 0.15, tableTop.y + 1.9 - u * 0.4, tableTop.z + 1.6 - u * 0.2), V3(tableTop.x + 0.1, tableTop.y, tableTop.z + 0.6), 34],
  'C04-D': (u) => [V3(CP.x - 6 - u * 2, CP.y + 3.2, CP.z + 1 - u * 2), V3(STK.x - 200, 0, lerp(-300, 400, u)), 34],
  'C04-E': orbit(V3(500, 0, 1900), 6200, 3300, 0.45, 0.05, 45),
  'C04-F': fly(V3(640, 3.5, 3032), V3(650, 12, 3095), V3(640, -2.6, 2990), V3(650, -3, 2990), 45),
  'C05-A': fly(V3(-110, 26, 2960), V3(-85, 18, 2945), V3(-20, 1, 2895), V3(-15, 1, 2900), 40),
  'C05-B': (u) => { const w = workers[0]; return [V3(w.position.x + 7.5 - u * 1.2, w.position.y + 3.6, w.position.z + 6.5), V3(w.position.x, w.position.y + 1.2, w.position.z + 1), 36]; },
  'C05-C': (u) => [V3(forge.position.x + 7.5 - u, forge.position.y + 3.2, forge.position.z + 6.5), V3(forge.position.x + 0.6, forge.position.y + 1.0, forge.position.z), 34],
  'C05-D': (u) => { const w = workers[2]; return [V3(w.position.x - 4, Math.max(w.position.y, tideNow) + 3.2, w.position.z + 12), V3(w.position.x + 4, w.position.y + 1.2, w.position.z), 38]; },
  'C05-E': (u) => { const w = workers[3]; return [V3(w.position.x + 3.5 - u, w.position.y + 1.6, w.position.z + 7.5), V3(w.position.x - 2.5, w.position.y + 1.2, w.position.z - 1), 40]; },
  'C05-F': fly(V3(700, 820, 3650), V3(690, 460, 3360), STK, V3(680, -1, 2960), 45),
  'C06-A': fly(V3(-300, 1500, 5000), V3(-150, 1100, 4500), V3(700, 0, 2700), V3(700, 0, 2600), 45),
  'C06-B': boatCam(NB + 1, 9, 4, 10, 0, 0.5, -2, 40),
  'C06-C': (u) => [V3(gaugePole.position.x - 6, tideNow + 1.6, gaugePole.position.z + 4.5), V3(gaugePole.position.x, tideNow + 0.6, gaugePole.position.z), 34],
  'C06-D': fly(V3(420, 30, 3060), V3(540, 22, 3020), V3(680, -2, 2990), V3(760, -2, 2960), 40),
  'C06-E': orbit(V3(500, 0, 2000), 5200, 2600, -0.2, 0.35, 45),
  'C07-A': (u) => { const s = ships[0]; return [V3(1000 - u * 100, 240 - u * 60, 5200 - u * 300), V3(s.x, 0, s.z - 200), 40]; },
  'C07-B': (u) => { const a = ships[6], c = ships[0]; return [V3(a.x + 340, 70, a.z + 120 - u * 140), V3((a.x + c.x) / 2, 0, (a.z + c.z) / 2), 40]; },
  'C07-C': shipOrbit(FLAG, 130, 42, 0.9, 1.35, 38),
  'C07-D': fleetPass(0, 10, 1, 115, 30, 40),
  'C07-E': (u) => [V3(-70, 6.5, 3080 - u * 30), V3(ships[4].x, 4, ships[4].z), 36],
  'C08-A': fly(V3(320, 24, 2540), V3(380, 18, 2700), V3(640, 0, 2500), V3(680, 0, 2900), 40),
  'C08-B': boatCam(4, 3.6, 2.6, 7.5, 0, 1.4, 0, 40),
  'C08-C': (u) => [V3(1180 - u * 60, 95, 3300), V3(700, 0, 3560), 40],
  'C08-D': boatCam(1, -4.5, 2.4, -6, 0, 1.6, 4, 38),
  'C08-E': (u) => [V3(1350, 520 - u * 80, 3800), V3(690, -2, lerp(3000, 2600, u)), 45],
  'C09-A': fly(V3(1600, 420, 500), V3(1500, 360, 900), V3(650, 0, 1900), V3(650, 0, 1700), 42),
  'C09-B': (u) => [V3(560, tideNow + 1.4, 2945 - u * 6), V3(640, tideNow - 1.5, 2990), 36],
  'C09-C': fleetPass(4, 16, -1, 125, 34, 40),
  'C09-D': (u) => { const s = ships[23]; return [V3(s.x + 14, -3.0, 2810 - u * 20), V3(s.x, -1.5, s.z), 55]; },
  'C09-E': fly(V3(-450, 950, 3950), V3(-350, 800, 3850), V3(700, 0, 2400), V3(700, 0, 2600), 45),
  'C10-A': (u) => { const c = fleetCenter(); return [V3(1450, 280, 2350), V3(c.x, 0, c.z), 42]; },
  'C10-B': fleetPass(12, 22, 1, 105, 26, 40),
  'C10-C': (u) => { const s = ships[20]; return [V3(s.x + 30, -3.6, s.z + 38), V3(s.x, -2.3, s.z), 55]; },
  'C10-D': shipOrbit(12, 115, 38, 0.5, 1.05, 40),
  'C10-E': (u) => [V3(1120, 120, 3240 - u * 40), V3(680, 0, 2960), 42],
  'C10-F': fly(V3(700, 1350, 4400), V3(700, 1500, 4550), STK, STK, 45),
  'C11-A': (u) => [V3(1520, 36, 3560), V3(1300 - u * 300, 0, 3330), 40],
  'C11-B': (u) => { const a = archers[3]; return [V3(a.position.x + 6.5, a.position.y + 2.5, a.position.z - 3 + u * 2), V3(a.position.x, a.position.y + 2, a.position.z + 1), 36]; },
  'C11-C': boatCam(14, 1.4, 1.5, 5.2, 0, 0.6, 30, 48),
  'C11-D': (u) => { const s = ships[10]; return [V3(s.x + 90 - u * 20, 22, s.z + 60), V3(s.x, 0, s.z), 38]; },
  'C11-E': shipOrbit(10, 140, 46, 1.0, 1.5, 40),
  'C11-F': fly(V3(700, 1800, 3150), V3(700, 1650, 3100), V3(700, 0, 3000), V3(700, 0, 2990), 45),
  'C12-A': (u) => [V3(1250, 85, 2850 + u * 40), V3(700, 0, 3000), 40],
  'C12-B': shipOrbit(FLAG, 125, 40, 2.0, 2.5, 38),
  'C12-C': fleetPass(0, 23, -1, 160, 52, 42),
  'C12-D': orbit(V3(690, 0, 2990), 1100, 650, 2.4, 2.9, 45),
  'C12-E': (u) => [V3(705, 55, 3880 - u * 80), V3(700, 0, 3000), 40],
  'C13-A': orbit(V3(690, 0, 2990), 800, 230, 3.6, 4.4, 45),
  'C13-B': objCam(NQ, 2.6, 2.8, 6.2, 0, 2.3, 0, 32, [2.0, 2.6, 5.0]),
  'C13-C': (u) => { const a = archers[2]; return [V3(a.position.x + 2.6, a.position.y + 2.4, a.position.z + 2.4 - u), V3(a.position.x, a.position.y + 2.2, a.position.z), 30]; },
  'C13-D': boatCam(18, -14, 8, -18, 0, 0, 6, 42),
  'C13-E': fly(V3(700, 70, 3300), V3(950, 950, 7800), V3(700, 0, 4200), MARK.sea.p.clone().setY(100), 45),
  'C14-A': (u) => [V3(150, 32 + u * 10, 2050 - u * 60), V3(1600, 50, 2600), 42],
  'C14-B': (u) => [V3(BV.x - 40 - u * 50, BV.y + 26, BV.z + 40 - u * 20), V3(BV.x - 70 - u * 60, BV.y, BV.z - 20 - u * 20), 40],
  'C14-C': fly(V3(400, 600, 3400), V3(-2500, 3200, 2200), V3(400, 0, 1500), MARK.coloa.p.clone().setY(200), 45),
  'C14-D': fly(MARK.coloa.p.clone().add(V3(3600, 2600, 3000)), MARK.coloa.p.clone().add(V3(2600, 1700, 2100)), MARK.coloa.p.clone().setY(60), MARK.coloa.p.clone().setY(0), 40),
  'C14-E': fly(V3(2500, 9000, 9500), V3(0, 13500, 6800), V3(0, 0, 500), V3(-1500, 0, -500), 48),
};
//@@ s34
const LABEL_SHOTS = { 'C01-E': ['river'], 'C02-A': ['far'], 'C02-B': ['daila'], 'C02-E': ['namhan', 'sea'], 'C03-A': ['aichau', 'daila'], 'C04-E': ['river', 'key'], 'C05-F': ['key'], 'C06-A': ['river'], 'C06-E': ['river'], 'C09-E': ['key'], 'C10-F': ['key'], 'C11-F': ['key'], 'C13-E': ['sea'], 'C14-C': ['coloa'], 'C14-D': ['coloa'], 'C14-E': ['far', 'river'] };
const CARDS = [
  [0.5, 7, 'Cuối năm 938', 'Bạch Đằng', 'Dòng sông của vận mệnh'],
  [70.5, 77, 'Cảnh 2', 'Biến loạn trong nước, giặc ngoài nhòm ngó', ''],
  [100.5, 112, 'Năm 937', 'Kiều Công Tiễn sát hại Dương Đình Nghệ', 'Minh họa biểu tượng tại Đại La, không dựng lại chi tiết sự kiện'],
  [115.5, 128, 'Thư cầu viện', 'Kiều Công Tiễn cầu cứu Nam Hán', 'Lưu Nghiễm sai con trai là Lưu Hoằng Tháo đem thủy quân'],
  [145.5, 152, 'Cảnh 3', 'Ngô Quyền, quyết không để giặc trở lại', ''],
  [220.5, 227, 'Cảnh 4', 'Kế sách quyết chiến trên dòng Bạch Đằng', ''],
  [290.8, 304, 'Mặt cắt', 'Triều cường che khuất bãi cọc', 'Đỉnh cọc khoảng −1 m · triều lên +2,2 m · triều rút −2,6 m (mô phỏng)'],
  [305.5, 312, 'Cảnh 5', 'Những cây cọc làm nên lịch sử', ''],
  [336.8, 350, 'Minh họa', 'Rèn đầu sắt cho cọc', 'Không khẳng định quy trình chế tác'],
  [400.5, 407, 'Cảnh 6', 'Những người hiểu từng con nước', ''],
  [470.5, 477, 'Cảnh 7', 'Thủy quân Nam Hán xuất hiện', ''],
  [545.5, 552, 'Cảnh 8', 'Trận khiêu chiến, kế nhử địch bắt đầu', ''],
  [625.5, 632, 'Cảnh 9', 'Khi thủy triều bắt đầu đổi chiều', ''],
  [695.5, 702, 'Cảnh 10', 'Bãi cọc trỗi dậy từ lòng sông', ''],
  [795.5, 802, 'Cảnh 11', 'Quân ta phản công từ nhiều hướng', ''],
  [890.5, 897, 'Cảnh 12', 'Đội quân Nam Hán tan vỡ', ''],
  [975.5, 982, 'Cảnh 13', 'Chiến thắng Bạch Đằng', 'Đất nước thoát khỏi hiểm họa'],
  [1055.5, 1062, 'Cảnh 14', 'Năm 939, mở nền độc lập lâu dài', ''],
  [1115.5, 1133, 'Năm 939', 'Ngô Quyền xưng vương, đóng đô ở Cổ Loa', 'Cảnh mang tính biểu tượng'],
  [1140, 1155, 'Bạch Đằng 938', 'Mở ra kỷ nguyên độc lập lâu dài', 'Sa bàn tái dựng mô phỏng'],
];

// ================================================================== GIAO DIỆN (bố trí theo sa bàn Rạch Gầm – Xoài Mút 1785)
//@@ s35
const crp = (n, i) => { const p = CR[n][Math.min(CR[n].length - 1, i)]; return [p[0], p[1]]; };
//@@ s36
const ANCH = [
  ['CuaSong', 'Cửa sông Bạch Đằng', 705, 4000, 'Hướng ra biển (cửa Nam Triệu ở ngoài khung). Thủy quân Nam Hán theo đường này tiến vào trong cảnh 7.', true],
  ['BaiCoc', 'Bãi cọc (vị trí giả định)', 680, 2990, 'Gần 2 900 cọc gỗ vót nhọn, đầu bịt sắt; đỉnh cọc ở khoảng −1 m: chìm khi triều lên +2,2 m, lộ ra khi triều rút −2,6 m. Vị trí dựng theo kịch bản, không lấy bãi cọc khảo cổ năm 1288.', true],
  ['SoChiHuy', 'Sở chỉ huy Ngô Quyền (giả định)', CP.x, CP.z, 'Đồi cao nhìn xuống dòng sông, nơi Ngô Quyền cùng các tướng bàn kế (cảnh 4) và theo dõi trận đánh.', true],
  ['BoTay', 'Bờ Tây · phục binh, cung thủ', -40, 2965, 'Bộ binh, cung thủ nấp sau rừng ngập mặn chờ triều rút để xuất kích (cảnh 7, 11).', false],
  ['BenCoc', 'Bến đẽo cọc', -24, 2895, 'Quân dân tập kết thân gỗ, đẽo nhọn, rèn đầu sắt rồi đưa cọc xuống bãi triều (cảnh 5).', false],
  ['LachGia', 'Lạch sông Giá', ...crp('gia', 14), 'Một trong các cửa lạch giấu thuyền nhẹ phục kích (cảnh 11).', false],
  ['LachChanh', 'Lạch sông Chanh', ...crp('chanh', 12), 'Thuyền nhẹ từ đây chặn đường lui ra biển của đội hình Nam Hán (cảnh 12).', false],
  ['NgaBa', 'Ngã ba Đá Bạc – Bạch Đằng', 686, 2595, 'Nơi sông Giá đổ vào; đội thuyền nhử địch quay đầu rút về thượng lưu (cảnh 8).', false],
  ['SongUong', 'Cửa sông Uông', ...crp('uong', 10), 'Thuyền nhử địch rẽ vào đây ẩn nấp rồi trở ra phản công (cảnh 11).', false],
  ['SongThai', 'Cửa sông Thải', ...crp('thai', 10), 'Lạch phía Tây giấu thuyền nhẹ.', false],
];
//@@ s37
const RIVERS = [['Sông Bạch Đằng', 720, 3700], ['Sông Đá Bạc', -250, -1800], ['Sông Giá', ...crp('gia', 40)], ['Sông Chanh', ...crp('chanh', 40)], ['Sông Uông', ...crp('uong', 50)], ['Sông Thải', ...crp('thai', 50)]];
for (const [t, x, z] of RIVERS) addLabel(t, x, z, 'river', { grp: 'river', yFn: () => tideNow + 4 });
// tên nhân vật: chủ tướng, các tướng quân ta (vàng) và tướng giặc (đỏ), bám theo người
const WHO = [[NQ, 'Ngô Quyền', 'ta', 1.75], [generals[0], 'Dương Tam Kha', 'ta', 1.65], [generals[1], 'Kiều Công Hãn', 'ta', 1.65], [generals[2], 'Đỗ Cảnh Thạc', 'ta', 1.65], [LHT, 'Lưu Hoằng Tháo · chủ tướng Nam Hán', 'dich', 1.75]];
for (const [o, t, side, h] of WHO) addLabel(t, 0, 0, 'who ' + side, { grp: 'who', obj: o, maxDist: 900, yFn: () => o.position.y + h * EXAG + 0.5, show: () => o.visible && $('ly-ten').checked });
for (const k in MARK) addLabel(MARK[k].t, MARK[k].p.x, MARK[k].p.z, '', { grp: k, yFn: () => MARK[k].top.y, show: () => appMode === 'explore' || ['C02', 'C03', 'C13', 'C14'].includes(SC[sceneIdx(T)].id) });
//@@ s38
const FAR_GRP = new Set(['daila', 'coloa', 'namhan', 'sea', 'aichau']);
//@@ s39
const VIEWS = { all: [300, 600, 9500, 180, 36], cuasong: [705, 3900, 1500, 170, 26], baicoc: [680, 2990, 650, 150, 28], botay: [-20, 2950, 240, 110, 20],
  lachgia: [...crp('gia', 14), 650, 200, 30], lachchanh: [...crp('chanh', 12), 650, 140, 30], ngaba: [686, 2595, 900, 200, 32], uong: [...crp('uong', 10), 700, 60, 30], chihuy: [CP.x, CP.z, 140, 120, 22] };
//@@ s40
const POV_VAI = [
  ['Ngô Quyền', () => (NQ.visible ? eyeOf(NQ, 1.62) : null)],
  ['Dân binh trên thuyền nhử địch', () => (boats[1].vis ? boatEye(boats[1], 0) : null)],
  ['Dân binh thuyền phục kích (lạch Chanh)', () => (boats[22].vis ? boatEye(boats[22], 0) : null)],
  ['Cung thủ bờ Tây', () => (archers[3].visible ? eyeOf(archers[3], 1.55) : null)],
  ['Dân binh dựng cọc', () => (workers[3].visible ? eyeOf(workers[3], 1.55) : null)],
  ['Thủy thủ Nam Hán (thuyền mắc cọc)', () => { const sh = ships[8]; if (!sh.vis || sh.sinkP > 0.3) return null; const L = CREW_LOCAL[1]; return { p: localPt(sh, L[0], L[1], L[2]).add(V3(0, 1.62 * EXAG, 0)), yaw: sh.yaw - 0.4 }; }],
  ['Lưu Hoằng Tháo', () => (LHT.visible ? eyeOf(LHT, 1.66) : null)],
];
const POV_DD = [['Đỉnh đồi sở chỉ huy', CP.x + 8, CP.z + 6, 3.2], ['Bờ Tây trước bãi cọc', 30, 2985, 2.6], ['Giữa bãi cọc, sát mặt nước', 680, 2995, -1], ['Cửa lạch sông Giá', ...crp('gia', 6), 2.4], ['Cửa sông nhìn ra biển', 705, 4020, 4]];
//@@ s41
const BATTLE = [
  ['Thời gian', 'Cuối năm 938 (năm Mậu Tuất)'],
  ['Địa điểm', 'Cửa sông Bạch Đằng, đoạn đổ ra biển qua cửa Nam Triệu (Quảng Ninh – Hải Phòng ngày nay)'],
  ['Chỉ huy quân ta', 'Ngô Quyền; các tướng Dương Tam Kha, Kiều Công Hãn, Đỗ Cảnh Thạc'],
  ['Chỉ huy Nam Hán', 'Lưu Hoằng Tháo (con thứ 9 vua Nam Hán, phong Giao Vương, Bình Hải tướng quân); vua Nam Hán Lưu Nghiễm đem quân tiếp ứng ở Hải Môn'],
  ['Lực lượng', 'Quân Nam Hán ước khoảng 2 vạn (nhiều nguồn khác nhau); quân Ngô Quyền ước 5 nghìn – 1 vạn'],
  ['Kế sách', 'Cắm cọc gỗ đầu nhọn bịt sắt ngầm dưới lòng sông; nhử địch vào lúc triều lên, phản công khi triều rút'],
  ['Kết quả', 'Lưu Hoằng Tháo tử trận; quân Nam Hán bị giết và chết đuối khoảng một nửa; vua Nam Hán rút quân về nước'],
  ['Ý nghĩa', 'Chấm dứt hơn một nghìn năm Bắc thuộc; mùa xuân 939 Ngô Quyền xưng vương, đóng đô ở Cổ Loa'],
];
const SCENE_FACTS = [
  ['Sông Bạch Đằng dài hơn 20 km, từ ngã ba với sông Đá Bạc tới cửa biển Nam Triệu.', 'Vùng cửa sông có nhiều bãi bồi, lạch nhánh; mực nước chênh lệch lớn giữa lúc triều lên và triều rút.'],
  ['Năm 931, Dương Đình Nghệ đánh đuổi quân Nam Hán, giữ chức Tiết độ sứ Tĩnh Hải quân.', 'Năm 937, nha tướng Kiều Công Tiễn giết Dương Đình Nghệ, đoạt quyền.', 'Kiều Công Tiễn sai người sang cầu cứu Nam Hán; vua Nam Hán Lưu Nghiễm nhân cơ hội đó sai con là Lưu Hoằng Tháo đem thủy quân sang.'],
  ['Ngô Quyền, người Đường Lâm, con rể và là bộ tướng của Dương Đình Nghệ, đang trấn giữ Ái Châu.', 'Năm 938, Ngô Quyền kéo quân ra Bắc, giết Kiều Công Tiễn, trừ nội phản trước khi giặc tới.'],
  ['Ngô Quyền tính trước: quân Nam Hán sẽ theo đường biển vào cửa Bạch Đằng.', 'Kế sách: đóng cọc lớn đầu nhọn bịt sắt ở cửa sông, đợi triều lên nhử địch vào, triều rút thì đánh.'],
  ['Cọc gỗ được vót nhọn, đầu bịt sắt, cắm ngầm ở lòng sông.', 'Khi triều lên, mặt nước che kín bãi cọc; khi triều rút, đầu cọc nhô lên.'],
  ['Quân ta nắm vững quy luật con nước và hệ thống lạch nhánh vùng cửa sông.', 'Các lạch nhánh là nơi giấu thuyền nhẹ phục kích.'],
  ['Lưu Hoằng Tháo chỉ huy đoàn chiến thuyền Nam Hán tiến vào cửa Bạch Đằng.', 'Vua Nam Hán Lưu Nghiễm đem quân đóng ở Hải Môn để làm thanh viện.'],
  ['Khi triều lên, Ngô Quyền sai thuyền nhẹ ra khiêu chiến rồi giả thua chạy.', 'Quân Nam Hán hăng hái đuổi theo, vượt qua bãi cọc mà không hay biết.'],
  ['Khi nước triều bắt đầu rút, Ngô Quyền ra lệnh dốc toàn lực đánh quay trở lại.'],
  ['Nước triều rút nhanh, bãi cọc nhô lên.', 'Thuyền lớn của Nam Hán va vào cọc, bị vỡ, thủng hoặc mắc kẹt, không xoay trở được.'],
  ['Quân ta từ các lạch nhánh và hai bên bờ đổ ra đánh dữ dội, bắn tên vào đoàn thuyền địch.'],
  ['Quân Nam Hán bị giết và chết đuối khoảng một nửa.', 'Lưu Hoằng Tháo tử trận.'],
  ['Vua Nam Hán nghe tin bại trận, thương khóc, thu nhặt quân còn lại rút về nước.', 'Sử thần Lê Văn Hưu khen Ngô Quyền: “mưu giỏi mà đánh cũng giỏi”.'],
  ['Mùa xuân năm 939, Ngô Quyền xưng vương, đóng đô ở Cổ Loa.', 'Chiến thắng Bạch Đằng chấm dứt thời kỳ Bắc thuộc, mở ra thời kỳ độc lập lâu dài.'],
];
//@@ s42
function amPlan(i, u) {           // mức âm nền theo chương i (0..13) và tiến độ u (0..1)
  switch (i) {
    case 0: return { song: 0.45, chim: 0.3 };                                              // dòng sông của vận mệnh
    case 1: return { song: 0.12, trong: u > 0.8 ? 0.22 : 0 };                               // biến loạn, Nam Hán nhòm ngó
    case 2: return { hanhquan: 0.5, buoc: 0.45, chim: 0.12 };                               // Ngô Quyền đem quân ra Bắc
    case 3: return { chim: 0.25, song: 0.2 };                                               // bàn kế
    case 4: return { song: 0.35, chim: 0.25, buoc: 0.18 };                                  // đóng cọc
    case 5: return { song: 0.55, chim: 0.2 };                                               // những người hiểu con nước
    case 6: return { trong: 0.55, song: 0.35 };                                             // thủy quân Nam Hán xuất hiện
    case 7: return { trong: 0.45, song: 0.3, hetxung: u > 0.3 && u < 0.6 ? 0.45 : 0, noido: u > 0.35 && u < 0.55 ? 0.3 : 0 };   // khiêu chiến, giả thua
    case 8: return { song: 0.5, trong: 0.18 };                                              // triều đổi chiều
    case 9: return { song: 0.45, trong: 0.25, hetxung: u > 0.82 ? 0.6 : 0 };                // bãi cọc trỗi dậy, xuất kích
    case 10: return { chientruong: 0.5, hetxung: u < 0.35 ? 0.5 : 0.2, danhkiem: u > 0.3 ? 0.45 : 0.15, noido: 0.2, song: 0.25 };   // phản công
    case 11: return { chientruong: 0.45, danhkiem: 0.4, thaochay: u > 0.4 ? 0.4 : 0.15, song: 0.25 };                              // Nam Hán tan vỡ
    case 12: return { song: 0.4, chim: 0.15 };                                              // chiến thắng
    case 13: return { chim: 0.4, song: 0.3, buoc: u > 0.15 && u < 0.5 ? 0.2 : 0 };          // năm 939
  }
  return {};
}
//@@ s43
async function amLoad() {
  await Promise.all([...AM_BED, ...AM_ONE].map(async (n) => { try { const r = await fetch(PU('am/' + n + '.mp3')); AM.buf[n] = await AM.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn('âm thanh', n, e); } }));
  for (const n of AM_BED) { if (!AM.buf[n]) continue; const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.sfx); s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g; }
  AM.ready = true;
}
//@@ s44
// ------------------------------------------------------------------ nhạc nền theo chương (kho chung _KHO-CHUNG/nhac-nen, Epidemic Sound)
// [tệp, giây bắt đầu trong bản nhạc, âm lượng] — chọn theo tâm trạng từng chương
const NHAC = [
  ['hiep-si', 0, 0.55],      // C01 dòng sông của vận mệnh: mở đầu êm, dâng dần
  ['ke-thu', 0, 0.5],        // C02 biến loạn, giặc ngoài nhòm ngó: căng, u tối
  ['hiep-si', 50, 0.5],      // C03 Ngô Quyền ra Bắc: hùng tráng
  ['thuc-day', 0, 0.45],     // C04 bàn kế: bí ẩn, trầm tư
  ['tro-ve', 0, 0.4],        // C05 đóng cọc: dàn nhạc đều nhịp, bền bỉ
  ['hiep-si', 125, 0.55],    // C06 những người hiểu con nước: lắng, sâu
  ['ke-thu', 55, 0.5],       // C07 thủy quân Nam Hán xuất hiện: đe dọa dâng cao
  ['giua-tran', 0, 0.45],    // C08 khiêu chiến, nhử địch: nhịp giao tranh
  ['giai-dieu', 85, 0.95],   // C09 triều đổi chiều: giai điệu thưa, chờ đợi
  ['quyet-chien', 0, 0.5],   // C10 bãi cọc trỗi dậy: từ lặng tới bùng nổ
  ['giua-tran', 50, 0.5],    // C11 phản công nhiều hướng: cao trào
  ['thuc-day', 35, 0.45],    // C12 Nam Hán tan vỡ: dồn dập
  ['tro-ve', 0, 0.42],       // C13 chiến thắng: hào hùng
  ['vi-thanh', 15, 0.55],    // C14 năm 939: vĩ thanh, kết thúc cùng phim
];
const NHAC_DUR = { 'hiep-si': 231.2, 'ke-thu': 130.2, 'thuc-day': 118.5, 'tro-ve': 105.1, 'giua-tran': 146.4, 'giai-dieu': 180, 'quyet-chien': 97, 'vi-thanh': 114.7 };
const MU = {
  deck: [], cur: 0,
  init() {
    for (let k = 0; k < 2; k++) {
      const el = new Audio(); el.preload = 'auto'; el.loop = true; el.crossOrigin = 'anonymous';
      const g = AM.ctx.createGain(); g.gain.value = 0;
      try { AM.ctx.createMediaElementSource(el).connect(g); g.connect(AM.out); } catch (e) { el.volume = 0; }
      this.deck.push({ el, g, ch: -1, f: '', seek: null });
    }
  },
  pos(i) { const [f, off] = NHAC[i], d = NHAC_DUR[f]; return (off + Math.max(0, T - SC[i].t0)) % d; },
  tick() {
    if (!this.deck.length) return;
    const now = AM.ctx.currentTime, film = appMode === 'film';
    const live = AM.on && $('ly-nhac').checked && ((film && playing) || appMode === 'explore');
    const i = sceneIdx(T), [f, , vol] = NHAC[i];
    let D = this.deck[this.cur];
    if (D.ch !== i) {                                                // đổi chương → chuyển nhạc mượt 2 giây
      const sameTrack = D.f === f && Math.abs((D.el.currentTime || 0) - this.pos(i)) < 3;
      if (sameTrack) D.ch = i;
      else {
        D.g.gain.setTargetAtTime(0, now, 0.7);
        this.cur = 1 - this.cur; D = this.deck[this.cur];
        if (D.f !== f) { D.f = f; D.el.src = PU('nhac/' + f + '.mp3'); }
        D.ch = i; D.seek = this.pos(i); D.g.gain.setValueAtTime(0, now);
      }
    }
    const other = this.deck[1 - this.cur];
    if (other.g.gain.value < 0.01 && !other.el.paused) other.el.pause();
    if (D.seek !== null && D.el.readyState >= 1) { try { D.el.currentTime = D.seek; } catch (e) {} D.seek = null; }
    if (live) {
      if (D.el.paused) D.el.play().catch(() => {});
      D.el.playbackRate = film ? clamp(speed, 0.5, 2) : 1;
      const p = this.pos(i); if (D.seek === null && D.el.readyState >= 1 && Math.abs(D.el.currentTime - p) > 3) D.el.currentTime = p;    // bám theo phim khi tua
      const duck = ('speechSynthesis' in window && speechSynthesis.speaking) ? 0.6 : 1;
      D.g.gain.setTargetAtTime(vol * duck * (W.on ? 0.6 : 1), now, 0.8);
    } else {
      D.g.gain.setTargetAtTime(0, now, 0.25);
      if (D.g.gain.value < 0.01 && !D.el.paused) D.el.pause();
    }
  },
};
//@@ s45
// ------------------------------------------------------------------ C02: biểu tượng Kiều Công Tiễn sát hại Dương Đình Nghệ, thư cầu viện bay sang Nam Hán
const c02 = $('c02'), c02m = $('c02m'), c02v = new THREE.Vector3();
function scr(v) { c02v.copy(v).project(camera); return c02v.z < 1 && Math.abs(c02v.x) < 1.2 && Math.abs(c02v.y) < 1.2 ? [((c02v.x + 1) / 2) * innerWidth, ((1 - c02v.y) / 2) * innerHeight] : null; }
function updateC02(t) {
  const show = t >= 100.5 && t < 115.5 && !document.body.classList.contains('m-explore') || (appMode === 'explore' && exploreI === 1 && t >= 100.5 && t < 115.5);
  c02.hidden = !show;
  if (show) {
    const p = scr(MARK.daila.top); const x = p ? clamp(p[0], 160, innerWidth - 160) : innerWidth / 2, y = p ? clamp(p[1] - 12, 190, innerHeight * 0.6) : innerHeight * 0.4;
    c02.style.left = x + 'px'; c02.style.top = y + 'px'; c02.style.opacity = sstep(100.5, 101.3, t) * (1 - sstep(114.6, 115.4, t));
    const k = sstep(102.5, 104.6, t);                                  // thanh kiếm lao từ Kiều Công Tiễn sang Dương Đình Nghệ
    $('c02sw').style.opacity = Math.min(1, k * 4) * (1 - sstep(108, 109, t) * 0.4); $('c02sw').style.transform = `translateX(${(k - 0.5) * 50}px) rotate(${(1 - k) * -18}deg)`;
    const xk = sstep(104.8, 105.6, t); $('c02x').style.transform = `translate(-50%,-50%) scale(${xk})`; $('ppD').classList.toggle('dead', xk > 0.5);
  }
  helpArc.visible = t >= 115 && t < 145; helpArc.material.uniforms.uP.value = sstep(116, 127, t);
  const mOn = t >= 116 && t < 131; c02m.hidden = !mOn;
  if (mOn) { const p = scr(helpCurve.getPointAt(clamp(sstep(116, 127, t), 0, 1))); c02m.hidden = !p; if (p) { c02m.style.left = p[0] + 'px'; c02m.style.top = p[1] + 'px'; c02m.style.opacity = 1 - sstep(129.5, 131, t); } }
}
//@@ s46
function update(dt) {
  if (appMode === 'film' && playing) { T += dt * speed; if (T >= DUR) { T = DUR - 0.01; setPlaying(false); } }
  if (appMode === 'explore') { const sc = SC[exploreI]; T += dt; if (T >= sc.t1 || T < sc.t0) T = sc.t0 + 0.01; }
  const t = T;
  U.time.value += dt;
  const level = appMode === 'explore' && !tideAuto ? +$('tide').value : tideAt(t);
  tideNow = level; U.level.value = level; water.position.y = level;
  if (tideAuto) $('tide').value = level.toFixed(2);
  U.wetTop.value = Math.max(level, keys([[0, 1.6], [305, 0.8], [470, 2.2], [1055, 2.2], [1155, 0.8]], t));
  applySky(t, appMode === 'explore' ? forcedSky : '');
  if (W.on) walkTick(dt);
  nvBegin(); updateShips(t, level); updateBoats(t, level); updateLand(t); drawAvatar(); nvEnd();
  const nvOn = $('ly-nv').checked;
  for (const m of NV_IMS) if (!nvOn) m.visible = false;
  for (const k in WP) WP[k].visible = nvOn || k === 'co'; for (const m of LAYER.nv) m.visible = nvOn; nhBanner.visible = nvOn && coOn; coFlag.visible = cpFlag.visible = coOn;
  updateSmoke(t); updateArrows(t); updateFire(t);
  const i = sceneIdx(t), scn = SC[i], shot = shotAt(t);
  // bãi cọc
  let stakeCount = 0, glow = 0;
  if (t >= 290 && t < 305) { stakeCount = NST; glow = 0.55; } else if (t >= 305 && t < 1060) stakeCount = Math.floor(NST * clamp((t - 308) / 80, 0, 1));
  if (t >= 384 && t < 400) glow = 0.9; if (shot.id === 'C08-E') glow = 0.35;
  const ptOn = $('ly-pt').checked, mcOn = $('ly-mc').checked;
  let analysis = appMode === 'film' && !userCam && ['C05-F', 'C08-E', 'C04-F'].includes(shot.id) ? 1 : 0;
  if (ptOn) { analysis = 1; glow = Math.max(glow, 0.8); if (!stakeCount) stakeCount = NST; }
  if (appMode === 'explore' && mcOn && !stakeCount) stakeCount = NST;
  if (!$('ly-coc').checked) stakeCount = 0;
  stakeMesh.count = tipMesh.count = stakeCount; stakeMat.emissiveIntensity = glow; tipMat.emissiveIntensity = glow * 1.2;
  U.analysis.value += (analysis - U.analysis.value) * Math.min(1, dt * 3);
  logs.visible = forge.visible = t >= 300 && t < 470; gaugePole.visible = t < 1060; gaugePole.position.y = hAt(gaugePole.position.x, gaugePole.position.z) - 1.0;
  if (appMode === 'film') { const want = SECTION_SHOTS.has(shot.id) && !userCam; if (want !== sectionShot) { sectionShot = want; setSection(want); } }
  // mũi tên, mốc hướng
  const arrOn = $('ly-arr').checked && !W.on, far = camera.position.y > 120;
  routeNH.visible = arrOn && ((t >= 128 && t < 145) || (t >= 470 && t < 485) || (appMode === 'explore' && i === 6)); routeNH.material.uniforms.uP.value = t < 470 ? sstep(129, 141, t) : 1;
  routeNQ.visible = arrOn && ((t >= 145 && t < 162) || (appMode === 'explore' && i === 2)); routeNQ.material.uniforms.uP.value = appMode === 'explore' ? 1 : sstep(146, 158, t);
  const atk = arrOn && far && (shot.id === 'C11-F' || (appMode === 'explore' && (i === 10 || i === 11)) || (userCam && (i === 10 || i === 11)));
  attackArrows.forEach((m) => { m.visible = atk; m.material.uniforms.uP.value = appMode === 'film' && !userCam ? sstep(shot.t0 + 1, shot.t0 + 7, t) : 1; });
  pulse.visible = t >= 85 && t < 130; pulse.position.x = MARK.daila.p.x; pulse.position.z = MARK.daila.p.z; pulse.material.opacity = 0.6 * (0.5 + 0.5 * Math.sin(t * 3)); pulse.scale.setScalar(1 + ((t * 0.6) % 1) * 2.5);
  spiral.visible = t >= 1105; spiral.rotation.y = t * 0.05;
  updateC02(t);
  // máy quay
  let povDone = false;
  if (appMode === 'film' && povOn) povDone = povTick();
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
    if (flyA) { const k = Math.min((performance.now() - flyA.t0) / flyA.dur, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; camera.position.lerpVectors(flyA.p0, flyA.p1, e); controls.target.lerpVectors(flyA.q0, flyA.q1, e); camera.position.y += flyA.arc * Math.sin(Math.PI * e); if (k >= 1) flyA = null; }
    controls.update(); camLook.copy(controls.target);
    if (camera.fov !== 45 && !W.on) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }
  const gh = hAt(camera.position.x, camera.position.z), inR = Math.hypot(camera.position.x, camera.position.z) < R;
  const ghm = inR ? Math.max(gh, hG(camera.position.x, camera.position.z)) : gh;
  if (inR && camera.position.y < ghm + (W.on && W.fp ? 0.3 : 1.2) && !povDone) { camera.position.y = ghm + 1.2; if (appMode === 'film' && !userCam) camera.lookAt(camLook); }
  const above = Math.max(1, camera.position.y - Math.max(gh, level));
  camera.near = povDone || (W.on && W.fp) ? 0.05 : clamp(above * 0.05, 0.15, 30); camera.far = 160000; camera.updateProjectionMatrix();
  sky.position.copy(camera.position); fill.position.copy(camera.position);
  const under = camera.position.y < level - 0.05 && inR && !sectionMesh.visible;
  $('underwater').style.opacity = under ? 1 : 0; if (under) { scene.fog.color.set(0x24484a); scene.fog.density = 0.012; }
  if (appMode === 'film' && playing && !userCam) { const ds = Math.min(t - scn.t0, scn.t1 - t); veil.style.opacity = ds < 0.45 ? 1 - ds / 0.45 : 0; } else veil.style.opacity = 0;
  const cc = appMode === 'film' && !userCam && camera.position.distanceTo(camLook) < 260; if (cc !== document.body.classList.contains('cancanh')) document.body.classList.toggle('cancanh', cc);
  // chữ trên giao diện
  if (scn.id !== lastScene) { lastScene = scn.id; $('stitle').textContent = `${scn.id} · ${scn.title}`; if (appMode === 'film') $('sdate').textContent = `Chương ${i + 1}/14 · ${scn.title}`; $('slist').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); if (!$('docs').hidden) fillDocs(); }
  if (shot.id !== lastShot) { lastShot = shot.id; $('snote').textContent = `${shot.id} · ${shot.size} · ${shot.desc}`; $('snote').hidden = false; }
  $('stime').textContent = `${fmtT(t)} / ${fmtT(DUR)}`; if (!seeking) $('seek').value = Math.round((t / DUR) * 1000);
  updSub();
  const cd = appMode === 'film' ? CARDS.find((c) => t >= c[0] && t < c[1]) : null;
  if (cd) { $('cardK').textContent = cd[2]; $('cardT').textContent = cd[3]; $('cardS').textContent = cd[4]; card.style.opacity = sstep(cd[0], cd[0] + 0.8, t) * (1 - sstep(cd[1] - 1, cd[1], t)); } else card.style.opacity = 0;
  const g01 = (level - LOW) / (HIGH - LOW);
  $('gLv').style.height = (8 + g01 * 84).toFixed(1) + '%'; $('gStk').style.bottom = (8 + ((STAKE_TOP - LOW) / (HIGH - LOW)) * 84).toFixed(1) + '%';
  $('gVal').textContent = (level >= 0 ? '+' : '−') + Math.abs(level).toFixed(1).replace('.', ',') + ' m';
  const tr = tideAt(t + 2) - tideAt(t); $('gTrend').textContent = Math.abs(tr) < 0.01 ? 'nước đứng' : tr > 0 ? 'triều lên' : 'triều rút';
  updateLabels(); amTick(dt); MU.tick();
  fpsN++; const nw = performance.now(); if (nw - fpsT > 1000) { $('fps').textContent = Math.round((fpsN * 1000) / (nw - fpsT)) + ' fps'; fpsN = 0; fpsT = nw; drawMinimap(); }
  else if ((fpsN & 7) === 0) drawMinimap();
}

// ------------------------------------------------------------------ bắt đầu
progress(1, 'Sẵn sàng');
