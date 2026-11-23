// Như Nguyệt 1077 · phần riêng của trận, cắm vào bộ máy 2.1.0 tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/tach_bo_may_2.py).
// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy.
//@@ s1
// Sa bàn trận Như Nguyệt 1077 — three.js (dựng theo khung sa bàn Bạch Đằng 938 V4)
// Các phần: địa hình + sông Như Nguyệt, phòng tuyến (lũy, rào tre, cọc tre), quân Lý / quân Tống (nhân vật có động tác nướng sẵn), bè, cầu phao, thuyền, doanh trại, CameraDirector, SkyDirector

//@@ s2
const progress = (f, m) => { lp.style.width = (f * 100).toFixed(0) + '%'; if (m) lm.textContent = m; };
// ------------------------------------------------------------------ helpers
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
function keys(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return lerp(K[i - 1][1], K[i][1], ease(u)); } return K[K.length - 1][1]; }
function angLerp(a, b, t) { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
function rnd(i, k = 0) { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); }

//@@ s3
const STAKE_TOP = 0.0;
const LOW = -1.0, HIGH = 1.5;      // mực nước sông Như Nguyệt mùa xuân (mô phỏng, dao động nhẹ)

//@@ s4
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 160000);
camera.position.set(600, 2600, 6800);
//@@ s5
const SEC_X = 300;            // mặt cắt ngang phòng tuyến tại bến Như Nguyệt (giữ phần x ≤ 300)
const secPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), SEC_X);
//@@ s6
const outerTex = await new THREE.TextureLoader().loadAsync('data/outer.png');      // sông Cầu, sông Cà Lồ kéo dài ngoài sa bàn (±40 km, OSM)
outerTex.flipY = false; outerTex.minFilter = THREE.LinearMipmapLinearFilter; outerTex.anisotropy = 4;
const groundMat = fogShader({
  uniforms: { uGround: U.ground, uLight: U.light, uOuter: { value: outerTex } },
  fpre: 'uniform vec3 uGround; uniform float uLight; uniform sampler2D uOuter;',
  fbody: `float r=length(vW.xz); float n=noise(vW.xz*0.0016)*0.55+noise(vW.xz*0.013)*0.3+noise(vW.xz*0.09)*0.15;
    vec3 c=uGround*(0.82+0.32*n)*uLight; float rim=smoothstep(${(R + 900).toFixed(1)},${(R + 60).toFixed(1)},r); c*=1.0-0.18*rim; float rv=r>${R.toFixed(1)}?texture2D(uOuter,vW.xz/80000.+.5).r:0.; c=mix(c,vec3(0.17,0.22,0.23)*uLight,rv*0.85); outc=vec4(c,1.);`,
});
//@@ s7
const water = new THREE.Mesh(new THREE.CircleGeometry(R - 0.3, 360), waterMat);
water.rotation.x = -Math.PI / 2; water.renderOrder = 2; scene.add(water);

// section panel (mặt cắt ngang phòng tuyến tại x = SEC_X)
const sectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(420, 46, 1, 1).rotateY(Math.PI / 2), fogShader({
  transparent: true, side: THREE.DoubleSide,
  uniforms: { uH: { value: hTex }, uHalf: { value: HALF }, uLevel: U.level, uDeep: U.deep, uX: { value: SEC_X } },
  fpre: 'uniform sampler2D uH; uniform float uHalf,uLevel,uX; uniform vec3 uDeep;',
  fbody: `vec2 uv=(vec2(uX,vW.z)+uHalf)/(2.*uHalf); float hb=texture2D(uH,uv).r;
    if(vW.y<hb){ float y=vW.y; float l=noise(vec2(vW.z*0.08,y*3.))*0.5+0.5; vec3 c=mix(vec3(0.16,0.11,0.07),vec3(0.27,0.19,0.12),l); c*=0.85+0.15*sin(y*3.1+noise(vec2(vW.z*0.05,y))*4.); c=mix(c,vec3(0.07,0.05,0.03),smoothstep(hb-3.,hb-14.,y)); if(hb-y<0.25) c=vec3(0.36,0.29,0.19); outc=vec4(c,1.); }
    else if(vW.y<uLevel){ float d=uLevel-vW.y; outc=vec4(mix(vec3(0.2,0.34,0.32),vec3(0.08,0.16,0.18),clamp(d/7.,0.,1.)),0.5); }
    else { discard; }
    if(abs(vW.y-uLevel)<0.06) outc=vec4(0.8,0.9,0.95,1.);`,
}));
sectionMesh.position.set(SEC_X + 0.2, -14, 40);
sectionMesh.visible = false; scene.add(sectionMesh);

progress(0.35, 'Đang trồng cây, dựng làng…');
//@@ s8
const hutGeo = merge([
  colored(new THREE.BoxGeometry(7, 2.6, 4.6).translate(0, 1.3, 0), 0x7a6247),
  colored(new THREE.CylinderGeometry(0.01, 4.3, 3.4, 4, 1).rotateY(Math.PI / 4).scale(1.25, 1, 0.92).translate(0, 4.2, 0), 0x9b8456),
]);// ------------------------------------------------------------------ lũy phòng tuyến (bờ Nam sông Như Nguyệt): đường lũy, rào tre, cọc tre
const LUY = [];                       // điểm lũy dày 2 m: {x,z,tx,tz,rx,rz (hướng ra sông),seg,s}
for (let sg = 0; sg < INST.luy.length; sg++) {
  const P = INST.luy[sg]; let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const [ax, az] = P[i - 1], [bx, bz] = P[i], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2));
    const tx = (bx - ax) / L, tz = (bz - az) / L;
    for (let k = 0; k < n; k++) { const f = k / n; LUY.push({ x: ax + (bx - ax) * f, z: az + (bz - az) * f, tx, tz, rx: tz, rz: -tx, seg: sg, s: acc + L * f }); }
    acc += L;
  }
}
const luyNear = (x, z) => { let b = 0, bd = 1e18; for (let i = 0; i < LUY.length; i++) { const d = (LUY[i].x - x) ** 2 + (LUY[i].z - z) ** 2; if (d < bd) { bd = d; b = i; } } return b; };
const KEEP_CLEAR = [];               // [x,z,r] chỗ trống cho doanh trại, sở chỉ huy, đền, cầu phao
function clearOf(p) {
  for (const [x, z, r] of KEEP_CLEAR) if (Math.hypot(p[0] - x, p[1] - z) < r) return false;
  if (Math.abs(p[0] - CAMP.x) < CAMP.w / 2 + 25 && Math.abs(p[1] - CAMP.z) < CAMP.d / 2 + 25) return false;
  return true;
}
const CAMP = { x: 450, z: -700, w: 500, d: 400 };            // doanh trại Triệu Tiết ở Mai Đình (bờ Bắc, đối diện bến Như Nguyệt) — vị trí giả định
const CP = new THREE.Vector3(250, 0, 330); CP.y = hAt(CP.x, CP.z);     // sở chỉ huy Lý Thường Kiệt sau lũy Như Nguyệt (giả định)
const TEMPLE = new THREE.Vector3(-775, 0, -1165); TEMPLE.y = hAt(TEMPLE.x, TEMPLE.z);   // đền Trương Hống – Trương Hát (đền Xà) ở ngã ba sông Cầu – Cà Lồ (tương truyền)
const BR_A = [-628, -700], BR_B = [-800, -700];             // cầu phao lần vượt sông thứ nhất (vị trí giả định, khúc quanh phía Tây)
KEEP_CLEAR.push([CP.x, CP.z, 40], [TEMPLE.x, TEMPLE.z, 30], [BR_A[0], BR_A[1], 60], [BR_B[0], BR_B[1], 90], [BR_B[0] - 140, BR_B[1] + 60, 190], [-1200, -600, 260], [300, 40, 70]);
const LAYER = { cay: [], nha: [], coc: [], nv: [], co: [] };
LAYER.cay.push(scatter(INST.tree.filter(clearOf), treeGeo, 1, -0.4, [0.3, 0.04, 0.2]));
LAYER.cay.push(scatter(INST.grove.filter(clearOf), groveGeo, 1, -0.3, [0.2, 0.04, 0.15]));
LAYER.nha.push(scatter(INST.hut.filter(clearOf), hutGeo, 1, -0.1, [0.1, 0.02, 0.12]));

const bambooMat = new THREE.MeshStandardMaterial({ color: 0x9a8a55, roughness: 0.85, emissive: 0xffb050, emissiveIntensity: 0 });
const stakeMat = new THREE.MeshStandardMaterial({ color: 0x7d6a40, roughness: 0.9 });
clipList.push(bambooMat, stakeMat);
// rào tre trên đỉnh lũy (mép phía sông): cột tre cách 0,9 m, hai thanh ngang
const PAL = [];
{ let acc = 0; for (let i = 1; i < LUY.length; i++) { if (LUY[i].seg !== LUY[i - 1].seg) { acc = 0; continue; } acc += 2; if (acc >= 0.9) { const n = Math.floor(acc / 0.9); for (let k = 0; k < n; k++) { const f = (k + 1) / n; const a = LUY[i - 1], b = LUY[i]; PAL.push({ x: lerp(a.x, b.x, f) + a.rx * 2.2, z: lerp(a.z, b.z, f) + a.rz * 2.2, a }); } acc = 0; } } }
const NPAL = PAL.length;
const palMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 1, 5).translate(0, 0.5, 0), bambooMat, NPAL);
const railMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.07, 1), bambooMat, Math.ceil(NPAL / 3) * 2);
// cọc tre vót nhọn cắm chéo ra phía sông, hai hàng trước chân lũy
const SPK = [];
for (let i = 0; i < LUY.length; i += 1) { const p = LUY[i]; for (const [d, o] of [[9, 0], [13.5, 0.9]]) { const x = p.x + p.rx * d + p.tx * o, z = p.z + p.rz * d + p.tz * o; if (!isWater(x, z) && hAt(x, z) > 0.45) SPK.push({ x, z, a: p }); } }
const NSPK = SPK.length;
const spkMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 1, 5).translate(0, 0.5, 0), stakeMat, NSPK);
const LUY_WORK = luyNear(300, 0);                              // công trường dựng phòng tuyến (C04) — rào lan dần từ đây ra hai phía
const palOrder = PAL.map((p, i) => i).sort((a, b) => Math.hypot(PAL[a].x - LUY[LUY_WORK].x, PAL[a].z - LUY[LUY_WORK].z) - Math.hypot(PAL[b].x - LUY[LUY_WORK].x, PAL[b].z - LUY[LUY_WORK].z));
const spkOrder = SPK.map((p, i) => i).sort((a, b) => Math.hypot(SPK[a].x - LUY[LUY_WORK].x, SPK[a].z - LUY[LUY_WORK].z) - Math.hypot(SPK[b].x - LUY[LUY_WORK].x, SPK[b].z - LUY[LUY_WORK].z));
{
  const up = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  palOrder.forEach((pi, i) => { const p = PAL[pi]; const hh = 3.1 + 0.5 * Math.sin(pi * 1.7); dummy.position.set(p.x, hG(p.x, p.z) - 0.3, p.z); dummy.quaternion.identity(); dummy.rotation.set(Math.sin(pi) * 0.04, 0, Math.cos(pi * 1.3) * 0.04); dummy.scale.set(1, hh, 1); dummy.updateMatrix(); palMesh.setMatrixAt(i, dummy.matrix); });
  let r = 0; for (let i = 0; i + 3 < palOrder.length && r + 1 < railMesh.count; i += 3) { const a = PAL[palOrder[i]]; const L = 2.8; for (const hy of [1.1, 2.2]) { dummy.position.set(a.x, hG(a.x, a.z) + hy, a.z); dummy.rotation.set(0, Math.atan2(a.a.tx, a.a.tz), 0); dummy.scale.set(1, 1, L); dummy.updateMatrix(); railMesh.setMatrixAt(r++, dummy.matrix); } }
  railMesh.userData.n = r;
  spkOrder.forEach((si, i) => { const p = SPK[si]; const L = 2.2 + 0.4 * Math.sin(si * 2.1); const tilt = 0.75; up.set(p.a.rx * Math.sin(tilt), Math.cos(tilt), p.a.rz * Math.sin(tilt)).normalize(); dummy.position.set(p.x, hG(p.x, p.z) - 0.2, p.z); dummy.quaternion.setFromUnitVectors(Y, up); dummy.scale.set(1, L, 1); dummy.updateMatrix(); spkMesh.setMatrixAt(i, dummy.matrix); });
}
for (const m of [palMesh, railMesh, spkMesh]) { m.frustumCulled = false; scene.add(m); LAYER.coc.push(m); }

// ------------------------------------------------------------------ đạo cụ: sở chỉ huy, đền, doanh trại Tống
//@@ s9
const tableTop = new THREE.Vector3();
{
  const g = new THREE.Group();
  const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7, 5, 4, 1, true).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 1, side: THREE.DoubleSide })); tent.position.set(-9, 2.5, 6); g.add(tent);
  const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 2.4), new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.8 })); tbl.position.set(0, 1.15, 0); g.add(tbl);
  for (const lx of [-1.5, 1.5]) for (const lz of [-1.0, 1.0]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), propMat); leg.position.set(lx, 0.55, lz); g.add(leg); }
  for (const [fx, fz] of [[-5, -4], [5, -5], [8, 6]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8, 5), propMat); p.position.set(fx, 4, fz); g.add(p); }
  g.position.copy(CP); scene.add(g); tableTop.set(CP.x, CP.y + 1.25, CP.z);
}
// đền Trương Hống – Trương Hát (dựng giản lược): nền, mái cong, đèn
const templeGlow = new THREE.PointLight(0xffb060, 0, 60, 1.6);
{
  const g = new THREE.Group(), wall = new THREE.MeshStandardMaterial({ color: 0x9c8a6c, roughness: 0.9 }), roof = new THREE.MeshStandardMaterial({ color: 0x6b3424, roughness: 0.8 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0x8a8070, roughness: 1 })); base.position.y = 0.4; g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 7), wall); body.position.y = 2.4; g.add(body);
  const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 7.6, 3, 4, 1).rotateY(Math.PI / 4).scale(1.25, 1, 0.85), roof); rf.position.y = 5.4; g.add(rf);
  for (const sx of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 5).rotateZ(sx * 0.9), roof); horn.position.set(sx * 6.8, 4.6, 0); g.add(horn); }
  const gate = new THREE.Mesh(new THREE.BoxGeometry(5, 4.2, 0.6), wall); gate.position.set(0, 1.4, 9.5); g.add(gate);
  const groof = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.4, 1.4), roof); groof.position.set(0, 3.7, 9.5); g.add(groof);
  templeGlow.position.set(0, 3, 6); g.add(templeGlow);
  g.position.copy(TEMPLE); g.rotation.y = Math.atan2(-120, 240); scene.add(g);
}
// doanh trại Tống: lều theo hàng, rào gỗ bao quanh, chòi canh, cờ
const CAMP_T = [];
{ const cx = CAMP.x, cz = CAMP.z; for (let i = -10; i <= 10; i++) for (let j = -7; j <= 7; j++) { if ((i === 0 || j === 0) || rnd(i * 31 + j, 3) < 0.12) continue; const x = cx + i * 22 + (rnd(i, j) - 0.5) * 5, z = cz + j * 24 + (rnd(j, i) - 0.5) * 5; CAMP_T.push({ x, z, big: Math.abs(i) <= 1 && Math.abs(j) <= 1, burn: 0 }); } }
CAMP_T.forEach((c, k) => { c.burn = 868 + Math.hypot(c.x - CAMP.x, c.z - (CAMP.z + CAMP.d / 2)) / 260 * 26 + rnd(k, 90) * 8; });
const tentGeo = merge([colored(new THREE.CylinderGeometry(0.15, 4.2, 4.2, 4, 1).rotateY(Math.PI / 4).translate(0, 2.1, 0), 0xd2c6a6), colored(new THREE.CylinderGeometry(0.06, 0.06, 5.4, 4).translate(0, 2.7, 0), 0x5a4630)]);
const tentMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }); clipList.push(tentMat);
const tents = new THREE.InstancedMesh(tentGeo, tentMat, CAMP_T.length); tents.frustumCulled = false; scene.add(tents);
const charGeo = merge([colored(new THREE.CylinderGeometry(2.6, 3.4, 0.7, 6).translate(0, 0.35, 0), 0x241c16)]);
const chars = new THREE.InstancedMesh(charGeo, tentMat, CAMP_T.length); chars.frustumCulled = false; scene.add(chars);
const CAMP_P = [];
{ const hw2 = CAMP.w / 2 + 12, hd = CAMP.d / 2 + 12; const per = 2 * (2 * hw2 + 2 * hd); for (let d = 0; d < per; d += 1.6) { let x, z, s = d; if (s < 2 * hw2) { x = -hw2 + s; z = -hd; } else if ((s -= 2 * hw2) < 2 * hd) { x = hw2; z = -hd + s; } else if ((s -= 2 * hd) < 2 * hw2) { x = hw2 - s; z = hd; } else { s -= 2 * hw2; x = -hw2; z = hd - s; } if ((z === hd || z === -hd) && Math.abs(x) < 14) continue; CAMP_P.push([CAMP.x + x, CAMP.z + z]); } }
const campPal = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.17, 4.2, 5).translate(0, 2.1, 0), propMat, CAMP_P.length); campPal.frustumCulled = false; scene.add(campPal);
CAMP_P.forEach(([x, z], i) => { dummy.position.set(x, hG(x, z) - 0.2, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 0.9 + 0.2 * rnd(i, 5), 1); dummy.updateMatrix(); campPal.setMatrixAt(i, dummy.matrix); });
const towerGeo = merge([colored(new THREE.BoxGeometry(0.3, 9, 0.3).translate(-1.4, 4.5, -1.4), 0x5a4630), colored(new THREE.BoxGeometry(0.3, 9, 0.3).translate(1.4, 4.5, -1.4), 0x5a4630), colored(new THREE.BoxGeometry(0.3, 9, 0.3).translate(-1.4, 4.5, 1.4), 0x5a4630), colored(new THREE.BoxGeometry(0.3, 9, 0.3).translate(1.4, 4.5, 1.4), 0x5a4630), colored(new THREE.BoxGeometry(3.6, 0.3, 3.6).translate(0, 8.4, 0), 0x6a5238), colored(new THREE.CylinderGeometry(0.1, 2.8, 1.8, 4).rotateY(Math.PI / 4).translate(0, 10.4, 0), 0x7a6a4a)]);
const TOWERS = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-0.04, 1]].map(([a, b]) => [CAMP.x + a * (CAMP.w / 2 + 12), CAMP.z + b * (CAMP.d / 2 + 12)]);
const towers = new THREE.InstancedMesh(towerGeo, tentMat, TOWERS.length); scene.add(towers);
TOWERS.forEach(([x, z], i) => { dummy.position.set(x + (i === 4 ? 18 : 0), hG(x, z), z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); towers.setMatrixAt(i, dummy.matrix); });
const campGroup = [tents, chars, campPal, towers];

//@@ s10
async function loadModel(name) {
  const d = await getJSON('models/' + name + '.mesh.json');
  const pq = new Uint16Array(b64(d.p)), uq = new Uint16Array(b64(d.uv));
  const pos = new Float32Array(d.n * 3), uv = new Float32Array(d.n * 2);
  for (let i = 0; i < d.n; i++) { for (let k = 0; k < 3; k++) pos[i * 3 + k] = d.lo[k] + pq[i * 3 + k] * d.sc[k]; uv[i * 2] = uq[i * 2] / 65535; uv[i * 2 + 1] = uq[i * 2 + 1] / 65535; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(d.i32 ? new Uint32Array(b64(d.idx)) : new Uint16Array(b64(d.idx)), 1));
  if (d.nrm) { const nq = new Int8Array(b64(d.nrm)); const nrm = new Float32Array(d.n * 3); for (let i = 0; i < nrm.length; i++) nrm[i] = nq[i] / 127; geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); }
  else geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const map = await texLoader.loadAsync('models/' + d.tex);
  map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true;
  return { geo, mat: new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0 }) };
}

//@@ s11
async function nvLoad(kind, cap) {
  const Z = await nvzRead('nhanvat/' + kind + '.nvz'), H = Z.H, j = H;   // j: tên cũ của dữ liệu nhân vật trong mã gốc
  const map = await texLoader.loadAsync('nhanvat/' + kind + '.jpg'); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }); clipList.push(mat);
  const index = new THREE.BufferAttribute(H.idx32 ? Z.arr(H.idx, Uint32Array) : Z.arr(H.idx, Uint16Array), 1);
  const uv = new THREE.BufferAttribute(Z.arr(H.uv, Float32Array), 2);
  const clips = {};
  for (const [name, c] of Object.entries(H.clips)) {
    const frames = nvzFrames(Z, c.pos, c.nor, c.n, H.q).map(([pos, nor]) => {
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uv);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 3); return g;
    });
    clips[name] = { fps: c.fps, once: !!c.once, frames, mg: Z.arr(c.mg, Float32Array), mt: c.mt ? Z.arr(c.mt, Float32Array) : null, ims: [] };
  }
  // bản soi gương (người ngồi mạn trái chèo bên trái): lật trục x → mặt quay ngược, nên vẽ mặt sau để ánh sáng vẫn đúng
  const matM = new THREE.MeshLambertMaterial({ map, side: THREE.BackSide }); clipList.push(matM);
  matM.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <defaultnormal_vertex>', THREE.ShaderChunk.defaultnormal_vertex.replace(/transformedNormal = - transformedNormal;/g, '')); };   // giữ pháp tuyến đã soi gương, không lật thêm lần nữa
  NVK[kind] = { clips, mat, matM, cap, seat: j.seat || null };
  for (const [name, c] of Object.entries(j.clips)) if (c.hip) clips[name].hip = c.hip;
}
const NV_KINDS = [['dan-binh', 300], ['linh-tong', 700], ['ly-thuong-kiet', 2], ['quach-quy', 2], ['quan-ly', 1400], ['ngua', 8]];      // V1.4: ngựa chiến (mẫu tĩnh trong kho, động tác đi bộ nướng bằng xoay chân)   // dân binh → quân Lý; lính Nam Hán → quân Tống; quân binh nhà Lý: tướng + cung thủ trên lũy (rig mới, V1.3)
// Tải nhân vật theo cảnh (23/11/2026): không loại nào xuất hiện trước 3:30, nên sa bàn hiện ngay khi có địa hình; nhân vật tải nền
// theo thứ tự xuất hiện (giây đầu tiên đo bằng cách chạy hết phim), loại nào cần sớm hơn (tua tới, đổi vai) thì tải ngay khi nvPut gọi tới.
const NV_FIRST = { 'ly-thuong-kiet': 210, 'dan-binh': 212, 'quan-ly': 280, 'ngua': 352, 'quach-quy': 352, 'linh-tong': 352 };
const NV_CAP = Object.fromEntries(NV_KINDS), NV_DANG = {};
function nvNeed(kind) {
  if (kind === 'ngua-tong') kind = 'ngua';
  if (NVK[kind] || NV_DANG[kind] || !(kind in NV_CAP)) return NV_DANG[kind];
  return (NV_DANG[kind] = nvLoad(kind, NV_CAP[kind]).then(async () => {
    if (kind === 'ngua') {     // V1.5: ngựa tướng Tống dùng chung hình ngựa nhưng texture riêng (vải yếm, đệm yên màu chàm, viền bạc) + huy hiệu chữ 宋
      const K = NVK.ngua, map = await texLoader.loadAsync('nhanvat/ngua-tong.jpg'); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
      const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }); mat.clippingPlanes = waterMat.clippingPlanes; clipList.push(mat);
      NVK['ngua-tong'] = { ...K, mat, matM: mat, cap: 8, clips: Object.fromEntries(Object.entries(K.clips).map(([n, c]) => [n, { ...c, ims: [], imsM: undefined }])) };
    }
  }).catch((e) => console.warn('nhân vật', kind, e)));
}
const nvNen = async () => { for (const k of Object.keys(NV_FIRST).sort((a, b) => NV_FIRST[a] - NV_FIRST[b])) await nvNeed(k); };   // tải nền theo thứ tự xuất hiện
// phe của từng loại nhân vật — quyết định cờ, huy hiệu (KHÔNG để quân Tống cầm cờ nhà Lý)
const TONG_KIND = new Set(['linh-tong', 'linh-nam-han', 'luu-hoang-thao', 'quach-quy', 'ngua-tong']);
//@@ s12
const WPGEO = {
  giao: merge([colored(new THREE.CylinderGeometry(0.018, 0.018, 2.7, 5).translate(0, 0.45, 0), WOOD), colored(new THREE.ConeGeometry(0.04, 0.34, 6).translate(0, 1.97, 0), IRON), colored(new THREE.ConeGeometry(0.06, 0.12, 6).rotateX(Math.PI).translate(0, 1.76, 0), 0x8a2018)]),
  dao: merge([colored(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 5).translate(0, -0.05, 0), DARK), colored(new THREE.BoxGeometry(0.13, 0.03, 0.05).translate(0, 0.08, 0), 0x8a6a2a), colored(new THREE.BoxGeometry(0.055, 0.85, 0.012).translate(0, 0.52, 0), IRON)]),
  cung: (() => { const a = Math.PI * 0.62, Rr = 0.78; const arc = new THREE.TorusGeometry(Rr, 0.016, 4, 18, a).rotateZ(Math.PI - a / 2).translate(Rr, 0, 0);
    const half = Rr * Math.sin(a / 2), tipx = Rr * (1 - Math.cos(a / 2));
    return merge([colored(arc, WOOD), colored(new THREE.BoxGeometry(0.006, 2 * half, 0.006).translate(tipx, 0, 0), 0xd9d2bf)]); })(),
  cheo: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 1.55, 5).translate(0, -0.25, 0), WOOD), colored(new THREE.BoxGeometry(0.15, 0.48, 0.025).translate(0, -1.15, 0), WOOD), colored(new THREE.BoxGeometry(0.12, 0.04, 0.04).translate(0, 0.52, 0), WOOD)]),
  bua: merge([colored(new THREE.CylinderGeometry(0.02, 0.022, 0.62, 5).translate(0, 0.18, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.1, 0.1).translate(0, 0.48, 0), DARK)]),
  riu: merge([colored(new THREE.CylinderGeometry(0.022, 0.024, 0.85, 5).translate(0, 0.28, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.15, 0.025).translate(0.09, 0.62, 0), IRON)]),
  tre: merge([colored(new THREE.CylinderGeometry(0.035, 0.045, 5.2, 5).translate(0, 0.6, 0), 0xa7a060)]),
  cuoc: merge([colored(new THREE.CylinderGeometry(0.022, 0.024, 1.1, 5).translate(0, 0.35, 0), WOOD), colored(new THREE.BoxGeometry(0.22, 0.05, 0.16).translate(0, 0.9, 0.05), IRON)]),
  co: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 3.6, 5).translate(0, 1.0, 0), WOOD), colored(new THREE.ConeGeometry(0.05, 0.16, 6).translate(0, 2.88, 0), 0xc9a24a)]),
};
//@@ s13
const wpMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); clipList.push(wpMat);
for (const [k, cap] of [['giao', 900], ['dao', 500], ['cung', 300], ['cheo', 200], ['co', 160], ['bua', 24], ['riu', 40], ['cuoc', 60], ['tre', 40]]) { const im = new THREE.InstancedMesh(WPGEO[k], wpMat, cap); im.frustumCulled = false; im.count = 0; scene.add(im); WP[k] = im; }
// cờ hiệu trên cán: cờ nhà Lý (chữ 李) và cờ quân Tống (chữ 宋) — tái dựng giản lược, chưa thẩm định
function flagMat(tex) { const m = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }); m.onBeforeCompile = (sh) => { sh.uniforms.uTime = U.time; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23; transformed.z += sin(uv.x * 5.5 - uTime * 5.0 + ph) * 0.1 * uv.x;'); }; clipList.push(m); return m; }
const coTex = await texLoader.loadAsync('data/co-ly.png'); coTex.colorSpace = THREE.SRGBColorSpace;
const coTexT = await texLoader.loadAsync('data/co-tong.png'); coTexT.colorSpace = THREE.SRGBColorSpace;
const coMat = flagMat(coTex), coMatT = flagMat(coTexT);
//@@ s14
const flagGeo = new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.52, 2.45, 0);
const coFlag = new THREE.InstancedMesh(flagGeo, coMat, 160); coFlag.frustumCulled = false; coFlag.count = 0; scene.add(coFlag);
const coFlagT = new THREE.InstancedMesh(flagGeo, coMatT, 160); coFlagT.frustumCulled = false; coFlagT.count = 0; scene.add(coFlagT);
// cờ nhà Lý trên 3 cột ở sở chỉ huy; cờ Tống trên các chòi canh doanh trại
const cpFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.5, -0.36, 0), coMat, 3); cpFlag.frustumCulled = false; scene.add(cpFlag);
[[-5, -4], [5, -5], [8, 6]].forEach(([fx, fz], i) => { dummy.position.set(CP.x + fx, CP.y + 7.95, CP.z + fz); dummy.rotation.set(0, 0.5 + i * 0.12, 0); dummy.scale.setScalar(2.8); dummy.updateMatrix(); cpFlag.setMatrixAt(i, dummy.matrix); });
const campFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.5, -0.36, 0), coMatT, TOWERS.length + 6); campFlag.frustumCulled = false; scene.add(campFlag);
const campFlagPole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 5).translate(0, 0.5, 0), propMat, 6); scene.add(campFlagPole);
{ let k = 0; TOWERS.forEach(([x, z], i) => { dummy.position.set(x + (i === 4 ? 18 : 0), hG(x, z) + 13.5, z); dummy.rotation.set(0, 0.3, 0); dummy.scale.setScalar(3.2); dummy.updateMatrix(); campFlag.setMatrixAt(k++, dummy.matrix); });
  for (let i = 0; i < 6; i++) { const x = CAMP.x + (i - 2.5) * 12, z = CAMP.z + CAMP.d / 2 - 6, y = hG(x, z); dummy.position.set(x, y + 9.5, z); dummy.rotation.set(0, 0.2, 0); dummy.scale.setScalar(3); dummy.updateMatrix(); campFlag.setMatrixAt(k++, dummy.matrix); dummy.position.set(x, y, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 10, 1); dummy.updateMatrix(); campFlagPole.setMatrixAt(i, dummy.matrix); } }
campGroup.push(campFlag, campFlagPole);
//@@ s15
function wpPut(type, C, f, Mc, clip, side = 1, tong = false) {
  if (type === 'co' && !coOn) return;
  const im = WP[type]; if (!im || im.count >= im.instanceMatrix.count) return;
  if (type === 'cung' && (clip === 'ngam' || clip === 'ban') && C.mt) {             // cung ở tay trái, dựng đứng, lưng cung quay về phía bắn
    const A = C.mt, o = f * 9; _wd.set(A[o], A[o + 1], A[o + 2]).normalize(); _wo.set(A[o + 6], A[o + 7], A[o + 8]).addScaledVector(_wd, 0.55);
    _wd.y = 0; _wd.normalize(); _wu.set(0, 1, 0); const X = _wd.clone().negate(); _wz2.crossVectors(X, _wu);
    _wb.makeBasis(X, _wu, _wz2).setPosition(_wo);
  } else if (type === 'cheo' && C.mt) {                           // mái chèo nằm trên đường nối hai bàn tay: tay trái nắm đầu cán, tay phải ôm thân, lưỡi chèo phía dưới tay phải
    const A = C.mt, o = f * 9; _wu.set(A[o], A[o + 1], A[o + 2]).normalize();
    _wz2.set(0, 0, 1).addScaledVector(_wu, -_wu.z); if (_wz2.lengthSq() < 1e-4) _wz2.set(1, 0, 0); _wz2.normalize(); _wd.crossVectors(_wu, _wz2);
    _wb.makeBasis(_wd, _wu, _wz2).setPosition(A[o + 6], A[o + 7], A[o + 8]);
  }
  else {
    const still = clip === 'dung' || clip === 'thu' || clip === 'di' || clip === 'chay' || clip === 'cuoi';
    const up = type === 'giao' || type === 'co' || type === 'cung' ? (still ? 1 : 0) : (type === 'dao' && (clip === 'dung' || clip === 'thu')) || (type === 'cuoc' && clip !== 'dao') ? -1 : 0;
    _wb.copy(nvGrip(C, f, false, up));
  }
  _wm2.multiplyMatrices(Mc, _wb); im.setMatrixAt(im.count++, _wm2);
  if (type === 'co') { const fm = tong ? coFlagT : coFlag; if (fm.count < 160) fm.setMatrixAt(fm.count++, _wm2); }
  if (type === 'giao' && TORCH.on && (C.__ti = (C.__ti || 0) + 1) % 7 === 0 && TORCH.n < TORCH.max) { _wo.set(0, 2.1, 0).applyMatrix4(_wm2); TORCH.p[TORCH.n * 3] = _wo.x; TORCH.p[TORCH.n * 3 + 1] = _wo.y; TORCH.p[TORCH.n * 3 + 2] = _wo.z; TORCH.n++; }
}
const NV_TINT = { 'quach-quy': [0xffffff, 0xd8c8b8, 0xc8d0e0].map((c) => new THREE.Color(c)), 'dan-binh': [0xffffff, 0xe0d2c2, 0xd6c6b0, 0xc9bfae].map((c) => new THREE.Color(c)), 'linh-tong': [0xffffff, 0xe4e4ea, 0xcfcfd4, 0xd8cfc0].map((c) => new THREE.Color(c)) };
//@@ s16
const NV_ALIAS = { di: 'chay', ngam: 'ban', dam: 'chem', thu: 'dung', nga: 'chet', chihuy: 'dung', ban: 'ngam', chet: 'nga', buon: 'dung' };   // động tác thay thế khi nhân vật không có clip đó
function nvPut(kind, clip, t, ph, pos, yaw, scale, wpn, tSeg = 0, vi = 0, roll = 0, pitch = 0, side = 1, mir = false) {
  const K = NVK[kind]; if (!K) { nvNeed(kind); return; }
  if (clip === 'dung' && kind === 'dan-binh') clip = 'thu';      // V1.3: bỏ dáng đứng một tay để sau lưng
  const clip0 = clip;
  if (!K.clips[clip] && NV_ALIAS[clip]) clip = NV_ALIAS[clip];
  const C = K.clips[clip] || K.clips.dung;
  if (XL.on && XL.want(kind, clip0, t, ph, pos, yaw, scale, wpn, tSeg, vi, roll, pitch, side, mir, C, clip)) return;   // để sau, khi máy quay đã đặt xong
  nvDraw(K, kind, clip, C, t, ph, pos, yaw, scale, wpn, tSeg, vi, roll, pitch, side, mir);
}
function nvDraw(K, kind, clip, C, t, ph, pos, yaw, scale, wpn, tSeg, vi, roll, pitch, side, mir) {
  XL.stat.nvz++;
  const f = nvFrame(C, t, ph, tSeg); const im = nvIM(K, C, f, mir);
  if (im.count >= im.instanceMatrix.count) return;
  tmpE.set(pitch, yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(mir ? -scale : scale, scale, scale);
  const Mc = tmpM.compose(pos, tmpQ, tmpS);
  im.setMatrixAt(im.count, Mc); const tints = NV_TINT[kind]; im.setColorAt(im.count, tints ? tints[vi % tints.length] : WHITE); im.count++;
  if (wpn) wpPut(wpn, C, f, Mc, clip in K.clips ? clip : 'dung', side, TONG_KIND.has(kind));
}
// ---- Nhân vật lai (thử 23/11/2026): lính ở gần máy quay vẽ bằng mô hình có xương (units/<loại>.glb, rig Mixamo, ~17 động tác
// từ kho chung), lính ở xa giữ .nvz nướng sẵn. Mọi lính vẫn đi qua nvPut(): cùng vị trí, hướng, thời gian, vũ khí, cờ theo phe.
// Bật/tắt: ?xuong=0 tắt, ?xuong=60 đổi bán kính (m). Quy trình: docs/KHUNG_SA_BAN.md › Nhân vật lai.
const XL = (() => {
  const q = new URLSearchParams(location.search), arg = q.get('xuong');
  const S = { on: arg !== '0', R: arg && +arg > 1 ? +arg : 55, MAX: 48, kinds: {}, used: 0, n: 0, stat: { xuong: 0, nvz: 0 } };
  // động tác .nvz → động tác GLB; danh sách thì chọn theo số thứ tự người (vi) cho đa dạng
  const MAP = { dung: 'dung', thu: 'thu', di: 'di', chay: ['chay', 'chay', 'chay', 'chaynhanh'], chem: ['chem', 'chem2', 'chem', 'do'], dam: ['dam', 'dam', 'dam', 'trung'],
    ngam: 'ban', ban: 'ban', nga: ['nga', 'chet'], chet: ['chet', 'chet2'], cheo: 'cheo', keo: 'keo', day: 'day' };
  const ONCE = new Set(['nga', 'chet', 'chet2', 'trung']);
  const FILES = { 'quan-ly': 'nhanvat/quan-ly.glb', 'linh-tong': 'nhanvat/linh-tong.glb' };
  let SU = null;
  S.load = async () => {
    if (!S.on) { S.ready = true; return; }
    const [{ GLTFLoader }, { MeshoptDecoder }, su] = await Promise.all([import('@@ENGINE@@vendor/three/addons/loaders/GLTFLoader.js'),
      import('@@ENGINE@@vendor/three/addons/libs/meshopt_decoder.module.js'), import('@@ENGINE@@vendor/three/addons/utils/SkeletonUtils.js')]);
    SU = su; const L = new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder);
    await Promise.all(Object.entries(FILES).map(async ([kind, f]) => {
      try {
        const g = await L.loadAsync(f); let map = null;
        g.scene.traverse((o) => { if (o.isMesh && o.material.map) map = o.material.map; });
        const tints = NV_TINT[kind] || [WHITE];
        const mats = tints.map((c) => { const m = new THREE.MeshLambertMaterial({ map, color: c, side: THREE.DoubleSide }); m.clippingPlanes = waterMat.clippingPlanes; clipList.push(m); return m; });
        S.kinds[kind] = { g, clips: Object.fromEntries(g.animations.map((a) => [a.name, a])), mats, pool: [], used: 0 };
      } catch (e) { console.warn('nhân vật có xương', kind, e); }
    }));
    S.ready = true;
  };
  function make(K) {
    const root = SU.clone(K.g.scene); root.matrixAutoUpdate = false; let mesh = null; const b = {};
    root.traverse((o) => { if (o.isSkinnedMesh) { mesh = o; o.frustumCulled = false; } if (o.isBone) { if (o.name.endsWith('RightHand')) b.r = o; if (o.name.endsWith('LeftHand')) b.l = o; } });
    const P = { root, mesh, mixer: new THREE.AnimationMixer(root), acts: {}, cur: null, r: b.r, l: b.l };
    for (const [n, a] of Object.entries(K.clips)) { const ac = P.mixer.clipAction(a); ac.setLoop(ONCE.has(n) ? THREE.LoopOnce : THREE.LoopRepeat); ac.clampWhenFinished = true; P.acts[n] = ac; }
    root.visible = false; scene.add(root); return P;
  }
  const _ci = new THREE.Matrix4(), _hb = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _p = new THREE.Vector3();
  const FC = { mg: new Float32Array(9), mt: new Float32Array(9), frames: [0] };
  // khung bàn tay trong toạ độ của nhân vật (chưa nhân tỉ lệ) — cùng quy ước mg / mt của .nvz, để wpPut gắn vũ khí, cờ như cũ
  function hands(P, Mc) {
    _ci.copy(Mc).invert();
    _hb.multiplyMatrices(_ci, P.r.matrixWorld); _hb.extractBasis(_x, _y, _z); _y.normalize(); _z.normalize(); _p.setFromMatrixPosition(_hb);
    FC.mg.set([_y.x, _y.y, _y.z, _z.x, _z.y, _z.z, _p.x, _p.y, _p.z]);
    _hb.multiplyMatrices(_ci, P.l.matrixWorld); _x.setFromMatrixPosition(_hb).sub(_p).normalize();
    FC.mt.set([_x.x, _x.y, _x.z, _z.x, _z.y, _z.z, _p.x, _p.y, _p.z]);
    return FC;
  }
  S.begin = () => { nQ = 0; for (const K of Object.values(S.kinds)) K.used = 0; S.used = 0; S.stat.xuong = 0; S.stat.nvz = 0; };
  S.end = () => { const on = document.getElementById('ly-nv')?.checked !== false;
    for (const K of Object.values(S.kinds)) K.pool.forEach((P, i) => { if (i >= K.used || !on) P.root.visible = false; }); };
  // Người có thể vẽ bằng xương: ghi lại, quyết định ở flush() khi máy quay của khung hình này đã đặt xong
  // (máy quay đặt sau khi xếp quân; xét theo vị trí cũ thì ở khung cắt cảnh sẽ chọn nhầm người).
  const Q = []; let nQ = 0; const _v = new THREE.Vector3();
  S.want = (kind, clip, t, ph, pos, yaw, scale, wpn, tSeg, vi, roll, pitch, side, mir, C, clipN) => {
    const K = S.kinds[kind]; if (!K || mir) return false;
    let m = MAP[clip]; if (!m) return false; if (Array.isArray(m)) m = m[vi % m.length];
    if (!K.clips[m]) return false;
    let r = Q[nQ]; if (!r) Q[nQ] = r = { pos: new THREE.Vector3() };
    nQ++; r.pos.copy(pos); Object.assign(r, { kind, clip, m, t, ph, yaw, scale, wpn, tSeg, vi, roll, pitch, side, mir, C, clipN });
    return true;
  };
  S.flush = () => {
    const R2 = S.R * S.R, cp = camera.position, near = [];
    for (let i = 0; i < nQ; i++) { const r = Q[i]; r.d2 = r.pos.distanceToSquared(cp); if (r.d2 <= R2) near.push(r); else r.x = false; }
    near.sort((a, b) => a.d2 - b.d2); near.forEach((r, k) => { r.x = k < S.MAX; });
    for (let i = 0; i < nQ; i++) { const r = Q[i];
      if (r.x) S.put(r.kind, r.m, r.clip, r.t, r.ph, r.pos, r.yaw, r.scale, r.wpn, r.tSeg, r.vi, r.roll, r.pitch, r.side, r.C);
      else nvDraw(NVK[r.kind], r.kind, r.clipN, r.C, r.t, r.ph, r.pos, r.yaw, r.scale, r.wpn, r.tSeg, r.vi, r.roll, r.pitch, r.side, r.mir); }
    nQ = 0;
  };
  S.put = (kind, m, clip, t, ph, pos, yaw, scale, wpn, tSeg, vi, roll, pitch, side, C) => {
    const K = S.kinds[kind], A = K.clips[m];
    let P = K.pool[K.used]; if (!P) { P = make(K); K.pool.push(P); }
    K.used++; S.used++; S.stat.xuong++;
    const ac = P.acts[m]; if (P.cur !== ac) { if (P.cur) P.cur.stop(); ac.reset().play(); P.cur = ac; }
    let tt;
    if (ONCE.has(m)) tt = Math.min(Math.max(0, tSeg), A.duration - 1e-3);
    else if (C && C.frames && C.frames.length > 1 && !C.once) { const n = C.frames.length; tt = ((((t * C.fps) / n + ph) % 1 + 1) % 1) * A.duration; }   // cùng nhịp với .nvz
    else tt = ((t + ph * A.duration) % A.duration + A.duration) % A.duration;
    P.mixer.setTime(tt);
    tmpE.set(pitch, yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(scale, scale, scale);
    P.root.matrix.compose(pos, tmpQ, tmpS); P.root.visible = true; P.root.updateMatrixWorld(true);
    P.mesh.material = K.mats[vi % K.mats.length];
    if (wpn) wpPut(wpn, hands(P, P.root.matrix), 0, P.root.matrix, clip === 'ngam' || clip === 'ban' ? 'ban' : clip, side, TONG_KIND.has(kind));
  };
  return S;
})();
// huy hiệu tròn trên yếm ngực và hai bên đệm yên ngựa
const huyGeo = new THREE.CircleGeometry(0.17, 24);
const huyMat = (f) => { const tx = new THREE.TextureLoader().load(f); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshLambertMaterial({ map: tx, transparent: true, side: THREE.DoubleSide, alphaTest: 0.3 }); clipList.push(m); return m; };
const HUY = { ly: new THREE.InstancedMesh(huyGeo, huyMat('data/huy-ly.png'), 36), tong: new THREE.InstancedMesh(huyGeo, huyMat('data/huy-tong.png'), 36) };
for (const m of Object.values(HUY)) { m.frustumCulled = false; m.count = 0; scene.add(m); }
const TORCH = { on: false, n: 0, max: 220, p: new Float32Array(220 * 3) };     // đuốc (đêm): đầu cán giáo của mỗi người thứ 7
function nvBegin() { XL.begin(); for (const im of NV_IMS) im.count = 0; for (const k in WP) WP[k].count = 0; coFlag.count = 0; coFlagT.count = 0; HUY.ly.count = HUY.tong.count = 0; TORCH.n = 0; for (const K of Object.values(NVK)) for (const C of Object.values(K.clips)) C.__ti = 0; }
function nvEnd() {
  XL.end();
  for (const im of NV_IMS) { im.visible = im.count > 0; if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; } }
  for (const k in WP) WP[k].instanceMatrix.needsUpdate = true; coFlag.instanceMatrix.needsUpdate = true; coFlagT.instanceMatrix.needsUpdate = true; HUY.ly.instanceMatrix.needsUpdate = HUY.tong.instanceMatrix.needsUpdate = true;
}
// người trên bờ: phóng to dần khi máy quay ở xa (như NHDD) để vẫn đọc được trên sa bàn
const farScale = (x, y, z) => EXAG * clamp(Math.hypot(camera.position.x - x, camera.position.y - y, camera.position.z - z) / 700, 1, 1.8);
// ------------------------------------------------------------------ sông Như Nguyệt (sông Cầu): đường giữa dòng + nửa bề rộng
const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(1, 1, 1);
const CH = INST.song, CHS = [0];
for (let i = 1; i < CH.length; i++) CHS.push(CHS[i - 1] + Math.hypot(CH[i][0] - CH[i - 1][0], CH[i][1] - CH[i - 1][1]));
const CHW = INST.song_w;
function chan(s, lat) {                    // lat: −1 bờ Bắc/Đông (quân Tống), +1 bờ Nam/Tây (quân Lý)
  s = Math.min(Math.max(s, 0), CHS[CHS.length - 1] - 0.01);
  let lo = 0, hi = CHS.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CHS[m] <= s) lo = m; else hi = m; }
  const f = (s - CHS[lo]) / (CHS[hi] - CHS[lo]);
  const x = CH[lo][0] + (CH[hi][0] - CH[lo][0]) * f, z = CH[lo][1] + (CH[hi][1] - CH[lo][1]) * f;
  let dx = CH[hi][0] - CH[lo][0], dz = CH[hi][1] - CH[lo][1]; const L = Math.hypot(dx, dz); dx /= L; dz /= L;
  const w = CHW[lo] * (1 - f) + CHW[hi] * f;
  return { x: x - dz * lat * w, z: z + dx * lat * w, dx, dz, w };
}
function sNear(x, z) { let b = 0, bd = 1e18; for (let i = 0; i < CH.length; i++) { const d = (CH[i][0] - x) ** 2 + (CH[i][1] - z) ** 2; if (d < bd) { bd = d; b = i; } } return CHS[b]; }
//@@ s17
function polyLen(pts) { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return a; }
function travel(pts, t, t0, speed) { const L = polyLen(pts); const d = clamp((t - t0) * speed, 0, L); const p = polyAt(pts, d); const p2 = polyAt(pts, Math.min(L, d + 6)); const p1 = polyAt(pts, Math.max(0, d - 6)); return { x: p[0], z: p[1], yaw: Math.atan2(p2[0] - p1[0], p2[1] - p1[1]), done: d >= L, L, d }; }
function keysV(K, t) {                     // K: [[t, x, z], …] → vị trí nội suy (êm) + hướng đi + đang di chuyển?
  if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], yaw: K.length > 1 ? Math.atan2(K[1][1] - K[0][1], K[1][2] - K[0][2]) : 0, mv: 0 };
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const dx = K[i][1] - K[i - 1][1], dz = K[i][2] - K[i - 1][2], L = Math.hypot(dx, dz);
    return { x: K[i - 1][1] + dx * e, z: K[i - 1][2] + dz * e, yaw: L > 1 ? Math.atan2(dx, dz) : (K[i][3] ?? 0), mv: L / (K[i][0] - K[i - 1][0]) }; }
  const n = K.length - 1; return { x: K[n][1], z: K[n][2], yaw: K[n][3] ?? (n ? Math.atan2(K[n][1] - K[n - 1][1], K[n][2] - K[n - 1][2]) : 0), mv: 0 };
}
const SB = { nn: sNear(300, -40), br: sNear(-714, -703), camp: sNear(560, -200), down: sNear(1400, 380) };

// ------------------------------------------------------------------ mực nước sông (mùa xuân, mực nước thấp, dao động nhẹ)
const LEVELK = [[0, 0.3], [300, 0.2], [600, 0.45], [800, 0.3], [1050, 0.35]];
function tideAt(t) { return keys(LEVELK, t); }

// ------------------------------------------------------------------ thuyền chiến quân Lý (thuyền nhỏ dùng chung với quân Tây Sơn, cắm cờ nhà Lý)
//@@ s18
const BOAT_S = EXAG, BOAT_DECK = 0.22, BOAT_STERN = [0, 0.3, -3.1], BOAT_WX = 1.6;     // V1.3: thân thuyền rộng 1,6 lần, người ngồi thấp hơn — chân người chèo nằm trong lòng thuyền
const NB = 40, AV_BOAT = NB;
const boatInst = new THREE.InstancedMesh(TS.geo, TS.mat, NB + 1); boatInst.frustumCulled = false; scene.add(boatInst);
LAYER.nv.push(boatInst);
const boats = Array.from({ length: NB }, (_, j) => ({ j, x: 0, y: 0, z: 0, yaw: 0, vis: false, row: 1, crew: 4, act: 'cheo' }));
//@@ s19
function boatFlag(Mb) { if (!coOn) return; _bf2.multiplyMatrices(Mb, _bf); if (WP.co.count < WP.co.instanceMatrix.count) WP.co.setMatrixAt(WP.co.count++, _bf2); if (coFlag.count < 160) coFlag.setMatrixAt(coFlag.count++, _bf2); }
// bè tre của quân Tống (tái dựng giản lược): 12 cây tre lớn ghép, dài 14 m
const raftGeo = (() => { const L = []; for (let k = 0; k < 13; k++) L.push(colored(new THREE.CylinderGeometry(0.33, 0.33, 14, 7).rotateX(Math.PI / 2).translate((k - 6) * 0.68, 0, 0), k % 2 ? 0x9a8a55 : 0x8b7b4a)); L.push(colored(new THREE.BoxGeometry(9, 0.2, 0.3).translate(0, 0.35, -5), 0x6b5838), colored(new THREE.BoxGeometry(9, 0.2, 0.3).translate(0, 0.35, 5), 0x6b5838)); return merge(L); })();
const NR = 9;
const rafts = new THREE.InstancedMesh(raftGeo, vegMat, NR + 16); rafts.frustumCulled = false; scene.add(rafts); LAYER.nv.push(rafts);
// cầu phao: 13 đốt bè nối nhau qua sông
const BRN = 13;
const bridge = Array.from({ length: BRN }, (_, i) => ({ i, x: 0, y: 0, z: 0, yaw: 0, vis: false, roll: 0 }));
const RAFT = Array.from({ length: NR }, (_, i) => ({ i, x: 0, y: 0, z: 0, yaw: 0, vis: false, men: 12, sink: 0 }));
const RAFT_X = [150, 240, 330, 420, 505, 590, 680, 770, 860];
RAFT.forEach((r, i) => { r.s = sNear(RAFT_X[i], -120); r.t0 = 606 + (i % 3) * 3 + rnd(i, 4) * 4; r.back = 646 + rnd(i, 5) * 6 + (i % 2) * 3; r.sinkT = i === 2 || i === 6 ? 634 + i : 1e9; });
const NOBR = new THREE.Matrix4().makeScale(0, 0, 0);
function updateRiver(t, level) {
  // ---- cầu phao (C07 dựng dần, C08 quân Tống qua cầu, cầu bị phá ~566 s)
  const bA = BR_A, bB = BR_B, len = Math.hypot(bB[0] - bA[0], bB[1] - bA[1]);
  for (const b of bridge) {
    const f = (b.i + 0.5) / BRN; let x = lerp(bA[0], bB[0], f), z = lerp(bA[1], bB[1], f), yaw = Math.atan2(bB[0] - bA[0], bB[1] - bA[1]), y = level + 0.2;
    const built = t >= 470 + b.i * 3.2 && t < 596;
    b.vis = built && isWater(x, z);
    if (t > 566) { const u = t - 566 - rnd(b.i, 3) * 4; if (u > 0) { const c = chan(SB.br, 0); z += u * 2.4 * c.dz * 3; x += u * 2.4 * c.dx * 3; yaw += u * 0.06 * (b.i % 2 ? 1 : -1); y -= sstep(8, 24, u) * 1.4; b.roll = Math.sin(u) * 0.12; } }
    b.x = x; b.z = z; b.y = y + Math.sin(t * 1.1 + b.i) * 0.05; b.yaw = yaw;
    tmpE.set(0, yaw + Math.PI / 2, b.roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(b.x, b.y, b.z); tmpS.set(1.0, 1, len / BRN / 14 * 1.05);
    rafts.setMatrixAt(NR + b.i, b.vis ? tmpM.compose(tmpV, tmpQ, tmpS.set(1.0, 1, 1)) : NOBR);
  }
  // ---- bè vượt sông lần hai (C09, ~606–660 s)
  for (const r of RAFT) {
    r.vis = (t >= 440 && t < 680);
    const n = chan(r.s, -1.25), so = chan(r.s, 0.86);
    let x = n.x, z = n.z, yaw = Math.atan2(so.x - n.x, so.z - n.z), y = level + 0.25;
    if (t < 600) { const bank = chan(r.s, -1.7); x = bank.x; z = bank.z; y = hG(x, z) + 0.3; }
    else if (t < r.back) { const u = sstep(r.t0, r.t0 + 22, t); x = lerp(n.x, so.x, u); z = lerp(n.z, so.z, u); }
    else { const u = sstep(r.back, r.back + 20, t); x = lerp(so.x, n.x, u); z = lerp(so.z, n.z, u); yaw += Math.PI; }
    const sk = sstep(r.sinkT, r.sinkT + 14, t); y -= sk * 1.6; r.sink = sk;
    if (t >= r.sinkT && t < r.back) { const u = sstep(r.t0, r.t0 + 22, r.sinkT); x = lerp(n.x, so.x, u) + (t - r.sinkT) * 1.2 * n.dx; z = lerp(n.z, so.z, u) + (t - r.sinkT) * 1.2 * n.dz; }
    r.x = x; r.z = z; r.yaw = yaw; r.y = y + Math.sin(t * 1.3 + r.i) * 0.06;
    tmpE.set(0, yaw, sk * 0.3 + Math.sin(t + r.i) * 0.015, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(r.x, r.y, r.z); tmpS.setScalar(1);
    rafts.setMatrixAt(r.i, r.vis && sk < 0.99 ? tmpM.compose(tmpV, tmpQ, tmpS) : NOBR);
    // quân Tống trên bè: đứng cầm giáo, khiên — khi cập bờ thì lên bộ (vẽ trong updateLand)
    if (r.vis && t >= 600 && (t < r.t0 + 21 || t > r.back) && sk < 0.6) {
      for (let k = 0; k < r.men; k++) {
        const lx = ((k % 4) - 1.5) * 1.9, lz = (Math.floor(k / 4) - 1) * 3.2;
        const p = new THREE.Vector3(lx, 0.45, lz).applyQuaternion(tmpQ).add(tmpV);
        const back = t > r.back, hitT = 618 + rnd(r.i * 20 + k, 95) * 22, dead = k % 5 === 2 && t > hitT;
        nvPut('linh-tong', dead ? 'nga' : back ? 'thu' : k % 3 === 0 ? 'ngam' : 'thu', t, rnd(r.i * 20 + k, 7), p, yaw, EXAG, dead ? null : k % 3 === 0 && !back ? 'cung' : k % 3 === 1 ? 'dao' : 'giao', dead ? t - hitT : 0, k);
      }
    } else if (r.vis && t < 600 && t > 452) {
      // C07: dân phu Tống đóng bè trên bãi sông
      for (let k = 0; k < 4; k++) { const a = k * 1.57 + 0.4, p = new THREE.Vector3(r.x + Math.cos(a) * 6, 0, r.z + Math.sin(a) * 8); p.y = hG(p.x, p.z); nvPut('linh-tong', k % 2 ? 'dam' : 'day', t, rnd(r.i * 4 + k, 8), p, Math.atan2(r.x - p.x, r.z - p.z), EXAG, k % 2 ? 'riu' : null, 0, k + 2); }
    }
  }
  rafts.instanceMatrix.needsUpdate = true;
  // ---- thuyền quân Lý
  for (const b of boats) { b.vis = false; b.row = 1; b.crew = 4; b.act = 'cheo'; }
  const put = (b, x, z, yaw, row = 1) => { b.vis = true; b.x = x; b.z = z; b.yaw = yaw; b.row = row; };
  // tuần tra dọc sông (C04–C07, C10)
  if ((t >= 250 && t < 500) || (t >= 680 && t < 820)) for (let j = 0; j < 4; j++) { const s0 = SB.nn - 600 + j * 380, s = s0 + ((t * 2.2 + j * 140) % 700) - 350; const c = chan(s, 0.45 + (j % 2) * 0.1); put(boats[j], c.x, c.z, Math.atan2(c.dx, c.dz)); }
  // C09: 14 thuyền từ hạ lưu ngược lên đánh bè giữa dòng (618–668 s)
  if (t >= 612 && t < 680) for (let j = 0; j < 14; j++) {
    const b = boats[4 + j], tg = RAFT[j % NR], st = chan(SB.down + 40 + (j % 4) * 30, ((j % 3) - 1) * 0.4);
    const t0 = 612 + (j % 5) * 2, ang = rnd(j, 30) * 6.28, dest = [tg.x + Math.cos(ang) * 18, tg.z + Math.sin(ang) * 18];
    const r = travel([[st.x, st.z], [lerp(st.x, dest[0], 0.5), lerp(st.z, dest[1], 0.5) + 30], dest], t, t0, 12);
    if (!r.done) put(b, r.x, r.z, r.yaw); else { const a = ang + (t - t0 - r.L / 12) * 0.06; put(b, tg.x + Math.cos(a) * 20, tg.z + Math.sin(a) * 20, a + Math.PI, 0.4); b.act = 'fight'; }
  }
  // C12: nghi binh — chiến thuyền của Hoằng Chân, Chiêu Văn xuôi dòng về phía đại doanh Quách Quỳ (822–860 s)
  if (t >= 822 && t < 862) for (let j = 0; j < 12; j++) { const b = boats[18 + j]; const s = SB.nn + 200 + (t - 822) * 11 + (j % 6) * 26 - Math.floor(j / 6) * 40; const c = chan(s, ((j % 3) - 1) * 0.35); if (Math.hypot(c.x, c.z) < R - 30) put(b, c.x, c.z, Math.atan2(c.dx, c.dz)); }
  // C12: đại quân Lý Thường Kiệt vượt sông bằng thuyền (848–872 s), rồi neo bên bờ Bắc
  if (t >= 846 && t < 1000) for (let j = 0; j < 10; j++) {
    const b = boats[30 + j], s = SB.camp - 160 + j * 34, a = chan(s, 1.05), c = chan(s, -0.92), t0 = 848 + (j % 4) * 1.5;
    const u = sstep(t0, t0 + 16, t); put(b, lerp(a.x, c.x, u), lerp(a.z, c.z, u), Math.atan2(c.x - a.x, c.z - a.z), u < 1 ? 1 : 0);
    b.act = u < 1 ? 'ferry' : 'moored'; b.crew = u < 1 ? 4 : 1;
  }
  // C13: thuyền đưa quân Tống về (quân Lý cấp thuyền) — vài thuyền chờ ở bến
  if (t >= 940 && t < 990) for (let j = 0; j < 4; j++) { const c = chan(SB.camp + 300 + j * 40, -0.7); put(boats[j], c.x, c.z, Math.atan2(c.dx, c.dz) + 1.2, 0); b0(boats[j]); }
  function b0(b) { b.crew = 2; b.act = 'idle'; }
  for (const b of boats) {
    const j = b.j;
    if (!b.vis) { boatInst.setMatrixAt(j, NOBR); continue; }
    b.y = Math.max(level, hAt(b.x, b.z) + 0.35) - 0.18 + Math.sin(t * 1.4 + j) * 0.06;
    const roll = Math.sin(t * 1.1 + j) * 0.03;
    tmpE.set(0, b.yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(b.x, b.y, b.z); tmpS.set(BOAT_S * BOAT_WX, BOAT_S, BOAT_S * 1.1);
    boatInst.setMatrixAt(j, tmpM.compose(tmpV, tmpQ, tmpS)); boatFlag(tmpM);
    const q = tmpQ.clone(), base = tmpV.clone();
    for (let c = 0; c < b.crew; c++) {
      const right = c % 2 === 0, lz = (2.0 - c * 1.3) * BOAT_S;
      let clip = b.row > 0.5 ? 'cheo' : 'dung', wpn = clip === 'cheo' ? 'cheo' : 'giao';
      if (b.act === 'fight') { clip = c === 0 ? 'ngam' : c === 1 ? 'dam' : 'cheo'; wpn = c === 0 ? 'cung' : c === 1 ? 'giao' : 'cheo'; }
      if (b.act === 'ferry' && c >= 2) { clip = 'dung'; wpn = c === 3 ? 'co' : 'giao'; }
      const sit = clip === 'cheo', lx = sit ? (right ? -0.17 : 0.17) : (right ? -0.12 : 0.12);
      const p = new THREE.Vector3(lx * BOAT_S * BOAT_WX, (sit ? BOAT_DECK - 0.06 : BOAT_DECK) * BOAT_S, lz).applyQuaternion(q).add(base);
      nvPut('dan-binh', clip, t * (sit ? 0.8 : 1), rnd(j * 5 + c, 51) * (sit ? 0.15 : 1), p, b.yaw, EXAG * 0.95, wpn, 0, j * 5 + c, roll, 0, 1, sit && !right);
    }
  }
  boatInst.instanceMatrix.needsUpdate = true;
}

// ------------------------------------------------------------------ quân trên bộ
//@@ s20
const NQ = proxy(), LHT = proxy();             // NQ: Lý Thường Kiệt; LHT: tướng Tống (Triệu Tiết)
const generals = [proxy(), proxy(), proxy(), proxy()];
const workers = Array.from({ length: 6 }, proxy);
const archers = Array.from({ length: 6 }, proxy);
const tongHero = [proxy(), proxy()];
//@@ s21

//@@ s22
const faceRiver = (p) => Math.atan2(p.rx, p.rz);
// quân giữ lũy: các đoạn trọng yếu (Như Nguyệt, khúc quanh phía Tây, ngã ba Cà Lồ, Vọng Nguyệt)
const GAR = [];
for (const [cx, cz, half] of [[300, 0, 300], [-800, -700, 200], [-640, -1180, 110], [1250, 250, 170]]) {
  const c = luyNear(cx, cz); for (let i = Math.max(0, c - half / 2); i < Math.min(LUY.length, c + half / 2); i += 3) { const p = LUY[i]; if (Math.hypot(p.x - cx, p.z - cz) > half * 1.5) continue; GAR.push({ x: p.x - p.rx * 0.4, z: p.z - p.rz * 0.4, yaw: faceRiver(p), p, k: GAR.length }); }
}
const garIn = (g, x, z, r) => Math.hypot(g.x - x, g.z - z) < r;
GAR.forEach((g, i) => { if (i % 16 === 5) return; if (garIn(g, 450, -40, 520) && rnd(i, 91) < 0.09) g.hit9 = 620 + rnd(i, 92) * 40; if (garIn(g, BR_B[0], BR_B[1], 260) && rnd(i, 93) < 0.08) g.hit8 = 534 + rnd(i, 94) * 28; });
// công trường dựng phòng tuyến (C04): đắp lũy, vác tre, dựng rào
const WK = LUY[LUY_WORK];
function workSite(t) {
  const on = t >= 212 && t < 296;
  workers.forEach((w) => { w.visible = false; });
  if (!on) return;
  let wi = 0; const proxyAt = (x, y, z, yaw) => { if (wi < workers.length) { const w = workers[wi++]; w.visible = true; w.position.set(x, y, z); w.rotation.set(0, yaw, 0); } };
  // 1) đắp lũy: hai hàng người cuốc đất dưới chân lũy phía trong
  for (let k = 0; k < 28; k++) {
    const i = clamp(LUY_WORK - 40 + k * 3, 0, LUY.length - 1), p = LUY[i], side = k % 2 ? 1 : 0;
    const x = p.x - p.rx * (6 + side * 2.5), z = p.z - p.rz * (6 + side * 2.5); _np.set(x, hG(x, z), z);
    if (k === 6) proxyAt(x, _np.y, z, faceRiver(p));
    nvPut('dan-binh', 'dao', t, rnd(k, 61), _np, faceRiver(p) + Math.PI * (side ? 1 : 0), EXAG, 'cuoc', 0, 30 + k);
  }
  // 2) vác tre từ làng ra lũy (đi về theo nhịp bước)
  for (let g = 0; g < 8; g++) {
    const i = clamp(LUY_WORK - 30 + g * 9, 0, LUY.length - 1), p = LUY[i], A = [p.x - p.rx * 70, p.z - p.rz * 70], B = [p.x - p.rx * 9, p.z - p.rz * 9];
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), per = 2 * L / 2.0, ph = ((t - 212 + g * per * 0.37) % per) / per, fwd = ph < 0.5, u = fwd ? ph * 2 : 2 - ph * 2;
    const x = lerp(A[0], B[0], u), z = lerp(A[1], B[1], u), yaw = Math.atan2(B[0] - A[0], B[1] - A[1]) + (fwd ? 0 : Math.PI);
    _np.set(x, hG(x, z), z); if (g === 2) proxyAt(x, _np.y, z, yaw);
    nvPut('dan-binh', 'di', t, g * 0.3, _np, yaw, EXAG, fwd ? 'tre' : null, 0, 50 + g);
  }
  // 3) dựng rào tre trên đỉnh lũy: người kéo, người đẩy
  for (let k = 0; k < 16; k++) {
    const i = clamp(LUY_WORK - 24 + k * 3, 0, LUY.length - 1), p = LUY[i], pull = k % 2 === 0;
    const x = p.x + p.rx * (pull ? 4.5 : -1.2), z = p.z + p.rz * (pull ? 4.5 : -1.2); _np.set(x, hG(x, z), z);
    const yaw = faceRiver(p) + (pull ? Math.PI : 0); if (k === 4) proxyAt(x, _np.y, z, yaw);
    nvPut('dan-binh', pull ? 'keo' : 'day', t, rnd(k, 62), _np, yaw, EXAG, null, 0, 70 + k);
  }
  // 4) vót cọc tre: ngồi đẽo
  for (let k = 0; k < 10; k++) { const i = clamp(LUY_WORK + 20 + k * 2, 0, LUY.length - 1), p = LUY[i]; const x = p.x - p.rx * 14 + (k % 2) * 2, z = p.z - p.rz * 14; _np.set(x, hG(x, z), z); if (k === 1) proxyAt(x, _np.y, z, faceRiver(p) + 1.2); nvPut('dan-binh', 'dam', t, rnd(k, 63), _np, faceRiver(p) + 1.2 + (k % 3), EXAG, 'riu', 0, 90 + k); }
}
// đường hành quân của quân Tống tới Mai Đình (C06) và đường rút (C13)
// V1.4: đường hành quân nằm trọn trong vòng sa bàn (trước đây bắt đầu ngoài vòng nên quân bị lún xuống nền)
const TMARCH = [[2160, -2190], [1900, -1700], [1350, -1250], [900, -1000], [CAMP.x + 40, CAMP.z - CAMP.d / 2 - 30], [CAMP.x, CAMP.z - 60]];
const tmLen = polyLen(TMARCH);
const TM_V = 2.6;
const tmHead = (t) => tmLen - 150 + (t - 425) * TM_V;          // đầu đoàn (sau các tướng cưỡi ngựa) tới giữa trại khoảng giây 483
// C13: cổng Bắc của trại, đường quân Tống rút (từ giữa trại ra cổng Bắc rồi theo đường cũ về Đông Bắc), hai hàng quân Lý đứng hai bên
const EXIT_G = [CAMP.x, CAMP.z - CAMP.d / 2 - 12];
const EXITP = [[CAMP.x, CAMP.z + 150], [CAMP.x, CAMP.z - CAMP.d / 2 - 20], [CAMP.x + 60, CAMP.z - CAMP.d / 2 - 100], [900, -1000], [1350, -1250], [1900, -1700], [2160, -2190]];
const exLen = polyLen(EXITP), EX_GATE = Math.abs(EXITP[1][1] - EXITP[0][1]);
const exitHead = (t) => EX_GATE - 30 + Math.max(0, t - 925) * 2.0;
const EXIT_LINE = [];
// Lý Thường Kiệt và 4 tướng cưỡi ngựa đứng sau 3 hàng quân phía Đông, quay mặt vào đường quân Tống đi qua
const VIEW13 = (() => { const d0 = EX_GATE + 30, p = polyAt(EXITP, d0), p2 = polyAt(EXITP, d0 + 3), yw = Math.atan2(p2[0] - p[0], p2[1] - p[1]), out = [];
  for (let k = 0; k < 5; k++) { const along = (k - 2) * 5.5, off = 22 + (k === 0 ? 0 : 3); out.push([p[0] + Math.sin(yw) * along + Math.cos(yw) * off, p[1] + Math.cos(yw) * along - Math.sin(yw) * off, Math.atan2(-Math.cos(yw), Math.sin(yw))]); }
  [out[0], out[2]] = [out[2], out[0]]; return out; })();
for (let d = EX_GATE + 6; d < EX_GATE + 230; d += 3.0) for (const s of [-1, 1]) for (const off of [7.5, 10.3, 13.1]) { const p = polyAt(EXITP, d + (off > 8 ? 1.5 : 0)), p2 = polyAt(EXITP, d + 3); const yw = Math.atan2(p2[0] - p[0], p2[1] - p[1]); EXIT_LINE.push([p[0] + Math.cos(yw) * s * off, p[1] - Math.sin(yw) * s * off, Math.atan2(-s * Math.cos(yw), s * Math.sin(yw))]); }      // V1.5: mỗi bên 3 hàng quân
// quân Tống trong trại
const CAMPS = [];
for (let i = 0; i < 230; i++) { const tt = CAMP_T[(i * 7) % CAMP_T.length]; const a = rnd(i, 70) * 6.28; CAMPS.push([tt.x + Math.cos(a) * 6, tt.z + Math.sin(a) * 6, rnd(i, 71) * 6.28]); }
// đường lũy bị chọc thủng & mai phục (C08)
const BRK = LUY[luyNear(BR_B[0] - 10, BR_B[1])];
const C8_IN = [BR_B[0] - 70, BR_B[1] + 40];                     // chỗ quân Tống tràn vào sau lũy
const AMBUSH = [[-1220, -380, 0], [-1260, -980, 0], [-980, -260, 0]];
// quân Lý phản công (C12): đổ bộ bờ Bắc rồi đánh vào trại
const LAND12 = chan(SB.camp, -1.9);
// C12 (V1.5): 60 cung thủ dàn 2 hàng cách cổng Nam ~85 m; 240 bộ binh chia 3 mũi: qua cổng → giữa trại → tỏa trái / thẳng / phải
const GATE_S = [CAMP.x, CAMP.z + CAMP.d / 2 + 12];
const ARCH12 = Array.from({ length: 60 }, (_, i) => [GATE_S[0] + ((i % 30) - 14.5) * 2.6, GATE_S[1] + 85 + Math.floor(i / 30) * 3]);
const INF12 = 240;
const PATH12 = [-1, 0, 1].map((s) => [[LAND12.x, LAND12.z], [GATE_S[0], GATE_S[1] + 45], GATE_S, [CAMP.x, CAMP.z + 60], s ? [CAMP.x + s * 40, CAMP.z + 2] : [CAMP.x, CAMP.z - 20], s ? [CAMP.x + s * 150, CAMP.z + 2] : [CAMP.x, CAMP.z - 110]]);
const PL12 = PATH12.map(polyLen), GATE12 = polyLen(PATH12[0].slice(0, 3));
const tongVis = { march: [352, 500], camp: [380, 900] };
// ---- tướng cưỡi ngựa: ngựa đi theo đường, người cưỡi ngồi trên yên (theo vị trí yên + chiều cao hông của dáng cưỡi)
const tgen = [proxy(), proxy()];
const MIEU = proxy();                                    // tướng Miêu Lý dẫn quân vượt cầu phao (C08)
const MOUNT = new Set();                                  // proxy nào đang cưỡi ngựa trong khung hình này
const _rq = new THREE.Vector3();
const _hm = new THREE.Matrix4(), _hl = new THREE.Matrix4(), _hq = new THREE.Quaternion(), _hv = new THREE.Vector3(), _hs = new THREE.Vector3();
function drawMounted(o, rider, t, walking, vi, wpn = null) {
  const tong = TONG_KIND.has(rider), hk = tong ? 'ngua-tong' : 'ngua';            // ngựa tướng Tống: yếm chàm + chữ 宋; ngựa nhà Lý: yếm đỏ + chữ 李
  const H = NVK[hk] || NVK.ngua, Rk = NVK[rider]; if (!H || !Rk) { nvNeed('ngua'); nvNeed(rider); return; }
  const sc = farScale(o.position.x, o.position.y, o.position.z), yaw = o.rotation.y, ph = t * 0.85 + vi * 0.37;
  nvPut(hk, walking ? 'di' : 'dung', ph, 0, o.position, yaw, sc, null, 0, 0);
  const bob0 = walking ? 0.025 * Math.sin(4 * Math.PI * ((ph * 12 % 12) / 12)) : 0, HM = tong ? HUY.tong : HUY.ly, ch = H.chest || [0, 1.15, 1.09], sd = H.side || [0.32, 1.13, -0.14];
  tmpE.set(0, yaw, 0); _hq.setFromEuler(tmpE); _hm.compose(o.position, _hq, _hs.set(sc, sc, sc));
  for (const [lx, ly, lz, ry] of [[ch[0], ch[1], ch[2], 0], [sd[0], sd[1], sd[2], Math.PI / 2], [-sd[0], sd[1], sd[2], -Math.PI / 2]]) {
    if (HM.count >= HM.instanceMatrix.count) break;
    tmpE.set(0, ry, 0); _hl.compose(_hv.set(lx, ly + bob0, lz), _hq.setFromEuler(tmpE), _hs.set(1, 1, 1)); HM.setMatrixAt(HM.count++, _hl.premultiply(_hm));
  }
  const S = H.seat || [0, 1.47, -0.28], C = Rk.clips.cuoi, hip = C && C.hip ? C.hip : 0.88;
  const bob = walking ? 0.025 * Math.sin(4 * Math.PI * ((ph * 12 % 12) / 12)) : 0;
  _rq.set(Math.sin(yaw) * S[2] * sc, (S[1] + bob - hip + 0.06) * sc, Math.cos(yaw) * S[2] * sc).add(o.position);
  nvPut(rider, C ? 'cuoi' : 'dung', t, vi * 0.2, _rq, yaw, sc, wpn, 0, vi);
}
function rideAlong(o, P, d, side = 0) { const L = polyLen(P), dd = clamp(d, 0, L - 1), p = polyAt(P, dd), p2 = polyAt(P, Math.min(L, dd + 5)); const yw = Math.atan2(p2[0] - p[0], p2[1] - p[1]); place(o, p[0] + Math.cos(yw) * side, p[1] - Math.sin(yw) * side, yw); return dd < L - 2; }
const TONG_FALL = new Map();
function updateLand(t) {
  const night = isNight(t);
  TORCH.on = night;
  // ---- Lý Thường Kiệt
  if (t >= 210 && t < 296) place(NQ, WK.x - WK.rx * 22, WK.z - WK.rz * 22, faceRiver(WK) + 0.3);
  else if (t >= 296 && t < 840) place(NQ, CP.x, CP.z - 2.15, 0);
  else if (t >= 840 && t < 852) place(NQ, CP.x, CP.z - 2.15, 0);
  else if (t >= 852 && t < 868) { const b = boats[34]; place(NQ, b.x, b.z, b.yaw); NQ.position.y = b.y + BOAT_DECK * BOAT_S + 0.1; }
  else if (t >= 868 && t < 920) { const p = LAND12, g = [CAMP.x + 10, CAMP.z + CAMP.d / 2 + 6]; const D = Math.hypot(g[0] - p.x, g[1] - p.z), u = clamp((t - 866) * 6.6 / D, 0, 1), u2 = clamp((t - 866 - D / 6.6) * 5 / 60, 0, 1); const x = lerp(p.x, g[0], u), z = lerp(p.z, g[1], u) - u2 * 60;      /* chạy đầu đoàn 6,6 m/s rồi vào trong trại */ place(NQ, x, z, Math.atan2(g[0] - p.x, g[1] - p.z)); }      // đi đầu đoàn quân xông vào trại
  else if (t >= 920 && t < 990) place(NQ, VIEW13[0][0], VIEW13[0][1], VIEW13[0][2]);                     // cưỡi ngựa bên cổng Bắc nhìn quân Tống rút
  else if (t >= 990) place(NQ, CP.x, CP.z - 2.15, 0);
  else NQ.visible = false;
  generals.forEach((g, i) => {
    const P = [[2.55, -0.2, -Math.PI / 2], [-2.55, 0.25, Math.PI / 2], [0.7, 2.15, Math.PI], [-0.9, 2.1, Math.PI]][i];
    if ((t >= 296 && t < 852) || t >= 990) place(g, CP.x + P[0], CP.z + P[1], P[2]);
    else if (t >= 868 && t < 920) place(g, NQ.position.x - 3 - i * 2.4, NQ.position.z + 4 + i * 1.6, NQ.rotation.y);
    else if (t >= 920 && t < 990) place(g, VIEW13[i + 1][0], VIEW13[i + 1][1], VIEW13[i + 1][2]);
    else g.visible = false;
  });
  workSite(t);
  // ---- quân giữ lũy
  const garOn = t >= 280 && t < 920 || t >= 990;
  if (garOn) GAR.forEach((g, i) => {
    // V1.3: quân trong rào chỉ dùng cung (quân binh nhà Lý); khi hai bên bắn nhau có người trúng tên ngã xuống
    let clip = 'dung', wpn = i % 16 === 5 ? 'co' : 'cung', tSeg = 0;
    const fight8 = t >= 528 && t < 566 && garIn(g, BR_B[0], BR_B[1], 260), fight9 = t >= 612 && t < 668 && garIn(g, 450, -40, 520);
    if (wpn === 'cung' && (fight8 || fight9)) clip = 'ban';
    const hit = g.hit9 && t >= g.hit9 && t < 680 ? g.hit9 : g.hit8 && t >= g.hit8 && t < 596 ? g.hit8 : 0;
    if (hit) { clip = 'chet'; tSeg = t - hit; wpn = null; }
    if (t >= 850 && t < 990 && garIn(g, 450, -40, 520) && i % 3 === 0) return;     // một phần quân đã theo Lý Thường Kiệt vượt sông
    _np.set(g.x, hG(g.x, g.z), g.z);
    nvPut('quan-ly', clip, t, rnd(i, 52), _np, g.yaw + (clip === 'ban' ? 0 : Math.sin(i) * 0.25), farScale(g.x, _np.y, g.z), wpn, tSeg, i);
  });
  // đặt 6 cung thủ (máy quay bám theo) trên lũy Như Nguyệt
  archers.forEach((a, i) => { const g = GAR[(luyNear(300, 0) && 0) + i * 3 + 30]; if (garOn && g) place(a, g.x, g.z, g.yaw); else a.visible = false; });
  // ---- quân Tống hành quân tới Mai Đình (C06)
  if (t >= tongVis.march[0] && t < tongVis.march[1]) {
    for (let i = 0; i < 420; i++) {
      const d = tmHead(t) - 4 - Math.floor(i / 4) * 3.4; if (d < 0) continue;      // bộ binh đi sau các tướng cưỡi ngựa
      const row = (i % 4) - 1.5, dd = Math.min(d, tmLen - 1), p = polyAt(TMARCH, dd), p2 = polyAt(TMARCH, Math.min(dd + 5, tmLen)); const yaw = Math.atan2(p2[0] - p[0], p2[1] - p[1]);
      let x = p[0] + Math.cos(yaw) * row * 2.2, z = p[1] - Math.sin(yaw) * row * 2.2, moving = d < tmLen - 1;
      if (!moving) { const a = (i / 420) * 6.28 * 3, r = 20 + (i % 9) * 6; x = CAMP.x + Math.cos(a) * r; z = CAMP.z + Math.sin(a) * r * 0.6; }
      _np.set(x, hG(x, z), z);
      nvPut('linh-tong', moving ? 'di' : 'dung', t, rnd(i, 53), _np, yaw, farScale(x, _np.y, z), i % 24 === 3 ? 'co' : i % 3 === 2 ? 'dao' : 'giao', 0, i + 3);
    }
  }
  // ---- doanh trại Tống: lính đứng gác, đi lại; C10 ốm yếu; C12 tháo chạy
  if (t >= tongVis.camp[0] && t < tongVis.camp[1]) {
    CAMPS.forEach(([x0, z0, yaw0], i) => {
      let x = x0, z = z0, yaw = yaw0, clip = i % 5 === 0 ? 'di' : 'dung', wpn = i % 3 === 2 ? 'dao' : 'giao', tSeg = 0;
      if (clip === 'di') { const a = t * 0.05 + i; x += Math.cos(a) * 10; z += Math.sin(a) * 10; yaw = a + Math.PI / 2; }
      if (t >= 680 && t < 820) { clip = i % 4 === 0 ? 'nga' : 'thu'; tSeg = 99; if (i % 4 === 0) wpn = null; }       // bệnh dịch: nhiều người nằm la liệt
      if (t >= 866) {                                                                                    // bị đánh úp: chạy tán loạn về phía Bắc, nhiều người ngã
        const te = 872 + rnd(i, 75) * 12; if (t > te) { const u = t - te; const ang = Math.PI + (rnd(i, 76) - 0.5) * 0.35; x = x0 + Math.sin(ang) * u * 4.2; z = z0 + Math.cos(ang) * u * 4.2; yaw = ang; clip = 'chay'; wpn = null;
          if (z < CAMP.z - CAMP.d / 2 - 60) return;                                                   // chạy ra khỏi trại về phía Bắc
          const fall = 880 + rnd(i, 77) * 24; if (i % 8 === 0 && t > fall) { const uf = Math.min(u, fall - te); x = x0 + Math.sin(ang) * uf * 4.2; z = z0 + Math.cos(ang) * uf * 4.2; clip = 'nga'; tSeg = t - fall; } } }
      _np.set(x, hG(x, z), z);
      nvPut('linh-tong', clip, t, rnd(i, 54), _np, yaw, farScale(x, _np.y, z), wpn, tSeg, i);
    });
  }
  // ---- C08: quân Tống qua cầu phao, chọc thủng lũy, bị phục kích
  MIEU.visible = false;
  if (t >= 500 && t < 596) {
    const N8 = 160;
    for (let i = 0; i < N8; i++) {
      const tStart = 506 + Math.floor(i / 3) * 0.45, row = (i % 3) - 1;
      const route = [[BR_A[0] + 120, BR_A[1] - 60], BR_A, BR_B, [BRK.x - BRK.rx * 12, BRK.z - BRK.rz * 12], C8_IN, [C8_IN[0] - 200 + rnd(i, 1) * 60, C8_IN[1] + 80 + (rnd(i, 2) - 0.5) * 160]];
      if (t < tStart) continue;
      let r = travel(route, t, tStart, 3.2), x = r.x, z = r.z, yaw = r.yaw, clip = 'chay', wpn = i % 3 === 2 ? 'dao' : 'giao', tSeg = 0;
      const ofs = row * 1.9; x += Math.cos(yaw) * ofs; z -= Math.sin(yaw) * ofs;
      let y = hG(x, z); const onBridge = r.d > Math.hypot(route[1][0] - route[0][0], route[1][1] - route[0][1]) && r.d < polyLen(route.slice(0, 3)); if (onBridge) y = Math.max(y, tideNow + 0.55);
      if (t > 546) {                                       // bị phục kích, giao chiến tại chỗ rồi tháo chạy về cầu
        const tb = 552 + rnd(i, 4) * 6;
        if (t < tb) { clip = i % 2 ? 'chem' : 'dam'; }
        else { const u = t - tb; const p0 = [x, z]; const dx = BR_B[0] - p0[0], dz = BR_B[1] - p0[1], L = Math.hypot(dx, dz) || 1; const k = Math.min(u * 4.2, Math.max(0, L - 4)); x = p0[0] + dx / L * k; z = p0[1] + dz / L * k; yaw = Math.atan2(dx, dz); y = hG(x, z); clip = 'chay'; wpn = null;
          const tf = tb + 4 + rnd(i, 5) * 14; if (i % 3 !== 1 && t > tf) { clip = 'nga'; tSeg = t - tf; const k2 = Math.min((tf - tb) * 4.2, Math.max(0, L - 4)); x = p0[0] + dx / L * k2; z = p0[1] + dz / L * k2; y = hG(x, z); }
          else if (k >= L - 4.5) { x = BR_B[0] + (rnd(i, 9) - 0.5) * 24; z = BR_B[1] + (rnd(i, 10) - 0.5) * 30; y = hG(x, z); clip = 'thu'; } }
      }
      _np.set(x, y, z); if (i === 0) { MIEU.visible = true; MIEU.position.copy(_np); }
      nvPut('linh-tong', clip, t, rnd(i, 55), _np, yaw, farScale(x, y, z), wpn, tSeg, i);
    }
    // ba mũi phục binh quân Lý (từ 540 s)
    AMBUSH.forEach(([ax, az], g) => {
      for (let i = 0; i < 46; i++) {
        const row = Math.floor(i / 6), col = (i % 6) - 2.5; const tg = [C8_IN[0] - 120 + g * 20, C8_IN[1] + 60 - g * 30];
        let x, z, clip = 'thu', wpn = i % 4 === 1 ? 'dao' : i % 9 === 4 ? 'co' : 'giao';
        const yaw0 = Math.atan2(tg[0] - ax, tg[1] - az);
        const u = sstep(540 + g * 2, 556 + g * 2, t);
        const cx = lerp(ax, tg[0], u), cz = lerp(az, tg[1], u);
        x = cx + Math.cos(yaw0) * col * 2.4 - Math.sin(yaw0) * row * 2.6; z = cz - Math.sin(yaw0) * col * 2.4 - Math.cos(yaw0) * row * 2.6;
        if (t >= 540 && u < 1) clip = 'chay'; else if (u >= 1 && t < 580) clip = i % 2 ? 'chem' : 'dam';
        if (t >= 580) { clip = 'dung'; const v = sstep(580, 594, t); x = lerp(x, BR_B[0] - 40 + col * 3, v * 0.6); z = lerp(z, BR_B[1] + row * 3, v * 0.6); }
        if (t < 530) continue;
        _np.set(x, hG(x, z), z);
        nvPut('quan-ly', clip, t, rnd(i + g * 50, 56), _np, yaw0, farScale(x, _np.y, z), clip === 'chem' ? 'dao' : wpn, 0, i + g * 50);
      }
    });
  }
  // ---- C09: quân Tống từ bè đổ lên chân lũy Như Nguyệt, bị đánh bật xuống sông
  if (t >= 620 && t < 676) {
    RAFT.forEach((r, ri) => {
      if (r.sink > 0.3) return;
      const so = chan(r.s, 1.2), land = t >= r.t0 + 21 && t < r.back;
      if (!land) return;
      const p = LUY[luyNear(so.x, so.z)];
      for (let k = 0; k < r.men; k++) {
        const col = (k % 6) - 2.5, row = Math.floor(k / 6);
        let x = so.x + p.tx * col * 2.2 + p.rx * (row * 2.2), z = so.z + p.tz * col * 2.2 + p.rz * (row * 2.2), clip = k % 2 ? 'dam' : 'chem', wpn = k % 2 ? 'giao' : 'dao', tSeg = 0;
        const adv = sstep(r.t0 + 21, r.t0 + 30, t) * 6; x -= p.rx * adv; z -= p.rz * adv;
        if (t > r.back - 4) { clip = 'chay'; }
        const tf = r.t0 + 26 + rnd(ri * 20 + k, 6) * 12; if (k % 3 === 0 && t > tf) { clip = 'nga'; tSeg = t - tf; }
        _np.set(x, hG(x, z), z);
        nvPut('linh-tong', clip, t, rnd(ri * 20 + k, 57), _np, faceRiver(p) + Math.PI, farScale(x, _np.y, z), clip === 'nga' ? null : wpn, tSeg, k);
      }
    });
  }
  // ---- C12: quân Lý đổ bộ bờ Bắc, đánh thẳng vào doanh trại Triệu Tiết
  if (t >= 864 && t < 920) {
    // V1.5: tấn công có đội hình — cung thủ dừng lại bắn tên lửa phía sau, bộ binh cầm giáo, gươm theo khối lao qua cổng Nam rồi chia ba mũi trong trại
    ARCH12.forEach(([x1, z1], i) => {
      const x0 = LAND12.x + ((i % 30) - 14.5) * 1.8, z0 = LAND12.z, t0a = 863 + Math.floor(i / 30) * 0.8 + rnd(i, 92) * 0.6, u = clamp((t - t0a) * 5.6 / Math.hypot(x1 - x0, z1 - z0), 0, 1); if (t < t0a) return; const x = lerp(x0, x1, u), z = lerp(z0, z1, u), mv = u < 1;
      _np.set(x, hG(x, z), z); nvPut('quan-ly', mv ? 'chay' : t < 908 ? 'ban' : 'dung', mv ? t * 1.25 : t, rnd(i, 83), _np, mv ? Math.atan2(x1 - x0, z1 - z0) : Math.PI, farScale(x, _np.y, z), mv ? null : 'cung', 0, i);
    });
    for (let i = 0; i < INF12; i++) {
      // V1.5b (theo kiểu Ngọc Hồi – Đống Đa): mỗi người một tốc độ 5–7 m/s, người nhanh vượt lên; hàng ngang thưa 3,4 m; tới đích thì dừng theo chiều sâu, không dồn một chỗ
      const lane = i % 3, k = Math.floor(i / 3), row = Math.floor(k / 8), col = (k % 8) - 3.5, P = PATH12[lane], L = PL12[lane];
      const v = 5.0 + rnd(i, 88) * 2.0, t0 = 865 + row * 0.45 + rnd(i, 89) * 0.8, dEnd = L - row * 2.9 - rnd(i, 90) * 1.5;
      const d = (t - t0) * v; if (d < 0) continue;                                              // còn trên thuyền, chưa lên bờ
      const dd = Math.min(d, dEnd), p = polyAt(P, dd), p2 = polyAt(P, Math.min(L, dd + 4)), p1 = polyAt(P, Math.max(0, dd - 4));
      const yaw = Math.atan2(p2[0] - p1[0], p2[1] - p1[1]), lat = (col + ((row % 3) - 1) * 0.33) * (dd > GATE12 - 10 ? 2.1 : 3.4);      /* hàng sau lệch 1/3 ô so với hàng trước: người nhanh vượt lên đi vào khe giữa, không xuyên qua người phía trước */
      const x = p[0] + Math.cos(yaw) * lat, z = p[1] - Math.sin(yaw) * lat;
      const wpn = i % 25 === 4 ? 'co' : k % 3 === 2 ? 'dao' : 'giao';
      let clip = d < dEnd ? 'chay' : wpn === 'dao' ? 'chem' : wpn === 'co' ? 'thu' : 'dam';
      if (t >= 910 && d >= dEnd) clip = 'thu';
      _np.set(x, hG(x, z), z);
      nvPut('quan-ly', clip, clip === 'chay' ? t * (v / 5.5) : t, rnd(i, 58), _np, yaw, farScale(x, _np.y, z), wpn, 0, i);
    }
    // quân Tống giữ cổng: dàn hàng chặn, giao chiến, một phần ngã tại chỗ, số còn lại rút chạy về phía Bắc theo một hướng
    for (let i = 0; i < 90; i++) {
      const row = Math.floor(i / 30), col = (i % 30) - 14.5;
      let x = CAMP.x + col * 2.1, z = CAMP.z + 70 + row * 2.4, yaw = 0, clip = t < 884 ? 'thu' : i % 2 ? 'chem' : 'dam', wpn = i % 2 ? 'dao' : 'giao', tSeg = 0;
      const tf = 888 + rnd(i, 84) * 12, tr = 895 + rnd(i, 85) * 4;
      if (i % 3 === 0 && t > tf) { clip = 'nga'; tSeg = t - tf; wpn = null; }
      else if (t > tr) { const u = t - tr; z -= u * 4.2; yaw = Math.PI + (rnd(i, 86) - 0.5) * 0.25; clip = 'chay'; wpn = null; if (z < CAMP.z - CAMP.d / 2 - 40) continue; }
      _np.set(x, hG(x, z), z); nvPut('linh-tong', clip, t, rnd(i, 87), _np, yaw, farScale(x, _np.y, z), wpn, tSeg, i);
    }
  }
  // ---- C13: quân Tống xếp hàng ra cổng Bắc của trại về nước, quân Lý đứng hai bên đường
  if (t >= 920 && t < 990) {
    for (let i = 0; i < 240; i++) {
      const row = Math.floor(i / 4), d = exitHead(t) - 8 - row * 3.0;
      const col = (i % 4) - 1.5, dd = clamp(d, 0, exLen - 1), p = polyAt(EXITP, dd), p2 = polyAt(EXITP, Math.min(exLen, dd + 4)); const yaw = Math.atan2(p2[0] - p[0], p2[1] - p[1]);
      const x = p[0] + Math.cos(yaw) * col * 1.9, z = p[1] - Math.sin(yaw) * col * 1.9; _np.set(x, hG(x, z), z);
      const moving = t >= 925 && d > 0;
      nvPut('linh-tong', moving ? 'di' : 'thu', t * 0.9, rnd(i, 59), _np, yaw, farScale(x, _np.y, z), i % 6 === 1 ? 'giao' : null, 0, i);
    }
    EXIT_LINE.forEach(([x, z, yaw], i) => { _np.set(x, hG(x, z), z); nvPut('quan-ly', 'dung', t, rnd(i, 60), _np, yaw, farScale(x, _np.y, z), i % 23 === 3 ? 'co' : 'giao', 0, i + 7); });      // đứng thẳng, giáo dựng
  }
  // ---- tướng Tống
  MOUNT.clear();
  if (t >= 352 && t < 500 && tmHead(t) + 26 < tmLen - 2) { rideAlong(LHT, TMARCH, tmHead(t) + 26); MOUNT.add(LHT); tgen.forEach((g, k) => { rideAlong(g, TMARCH, tmHead(t) + 15, k ? 3.2 : -3.2); MOUNT.add(g); }); }
  else if (t >= 352 && t < 868) { place(LHT, CAMP.x + 4, CAMP.z + 14, Math.PI * 0.05); tgen.forEach((g, k) => place(g, CAMP.x + 4 + (k ? 6 : -6), CAMP.z + 12, Math.PI * 0.05)); }
  else if (t >= 868 && t < 900) { const u = t - 868; place(LHT, CAMP.x + 4 - u * 1.2, CAMP.z + 14 - u * 6, Math.PI); }
  else if (t >= 920 && t < 990) { rideAlong(LHT, EXITP, Math.max(exitHead(t) + 22, 0)); MOUNT.add(LHT); tgen.forEach((g, k) => { rideAlong(g, EXITP, Math.max(exitHead(t) + 12, 0), k ? 3 : -3); MOUNT.add(g); }); }    // Quách Quỳ cưỡi ngựa dẫn đầu, các tướng theo sau, rồi đến bộ binh
  else LHT.visible = false;
  if (!((t >= 352 && t < 868) || (t >= 920 && t < 990))) tgen.forEach((g) => { g.visible = false; });
  tongHero.forEach((h, i) => { if (t >= 380 && t < 868) place(h, CAMP.x + 4 + (i ? 3 : -3), CAMP.z + 17, Math.PI * 0.05 + (i ? -0.3 : 0.3)); else if (t >= 920 && t < 990) { const d = Math.max(exitHead(t) - 1, 0), p = polyAt(EXITP, Math.min(d, exLen - 1)), p2 = polyAt(EXITP, Math.min(exLen, d + 4)), yw = Math.atan2(p2[0] - p[0], p2[1] - p[1]); place(h, p[0] + Math.cos(yw) * (i ? 1.6 : -1.6), p[1] - Math.sin(yw) * (i ? 1.6 : -1.6), yw); } else h.visible = false; });
  // các nhân vật chính và nhóm nhỏ
  const chihuy = (a, b) => t >= a && t < b;
  const nqClip = chihuy(210, 296) ? (Math.floor(t / 9) % 3 === 0 ? 'chihuy' : 'dung') : chihuy(842, 852) ? 'chihuy' : chihuy(868, 906) ? 'chay' : chihuy(906, 920) ? 'chem' : 'dung';
  if (t >= 920 && t < 990) { if (NQ.visible) drawMounted(NQ, 'ly-thuong-kiet', t, false, 0); generals.forEach((g, i) => g.visible && drawMounted(g, 'quan-ly', t, false, i + 1, i === 0 ? 'co' : null)); }
  else drawP(NQ, 'ly-thuong-kiet', nqClip, 0.1, nqClip === 'chem' ? 'dao' : null, nqClip === 'chihuy' ? (t - 842) % 6 : 0, 0, false);
  if (!(t >= 920 && t < 990)) generals.forEach((g, i) => drawP(g, 'quan-ly', t >= 868 && t < 920 ? (t < 900 ? 'chay' : 'chem') : 'dung', 0.2 + i * 0.3, t >= 868 && t < 920 ? 'dao' : i === 0 ? 'co' : null, 0, 20 + i, false));
  if (LHT.visible) { if (MOUNT.has(LHT)) drawMounted(LHT, 'quach-quy', t, t >= 925 || t < 500, 0);
    else { const cl = chihuy(868, 900) ? 'chay' : chihuy(540, 548) ? 'chihuy' : chihuy(680, 820) ? 'buon' : 'dung'; nvPut('quach-quy', cl, t, 0.3, LHT.position, LHT.rotation.y, EXAG, null, t - 540, 0); } }
  tgen.forEach((g, k) => { if (!g.visible) return; if (MOUNT.has(g)) drawMounted(g, 'quach-quy', t, t >= 925 || t < 500, k + 1, k ? 'co' : null); else nvPut('quach-quy', t >= 680 && t < 820 ? 'buon' : 'dung', t, 0.5 + k, g.position, g.rotation.y, EXAG, null, 0, k + 1); });
  tongHero.forEach((h, i) => drawP(h, 'linh-tong', t >= 925 && t < 990 ? 'di' : 'dung', 0.21 * i, i ? 'co' : 'giao', 0, 60 + i, false));
}
function updateCamp(t) {
  const on = t >= 376 && t < 1000;
  for (const m of campGroup) m.visible = on;
  if (!on) return;
  const grow = sstep(376, 420, t);
  CAMP_T.forEach((c, i) => {
    const burnt = t > c.burn + 14, sc = (rnd(i, 1) < grow ? 1 : 0) * (burnt ? 0 : 1 - sstep(c.burn + 4, c.burn + 14, t) * 0.7);
    dummy.position.set(c.x, hG(c.x, c.z), c.z); dummy.rotation.set(0, 0, 0); dummy.scale.set(c.big ? 1.6 : 1, sc * (c.big ? 1.4 : 1), c.big ? 1.6 : 1); dummy.updateMatrix(); tents.setMatrixAt(i, sc > 0 ? dummy.matrix : NOBR);
    dummy.scale.set(c.big ? 1.6 : 1, 1, c.big ? 1.6 : 1); dummy.updateMatrix(); chars.setMatrixAt(i, t > c.burn + 8 ? dummy.matrix : NOBR);
  });
  tents.instanceMatrix.needsUpdate = chars.instanceMatrix.needsUpdate = true;
}
function isNight(t) { return (t >= 500 && t < 596) || (t >= 750 && t < 920); }

// ------------------------------------------------------------------ hiệu ứng: khói, tên bay, lửa, đuốc
//@@ s23
const tentFire = (c, t) => sstep(c.burn - 2, c.burn + 4, t) * (1 - sstep(c.burn + 30, c.burn + 60, t));
function updateSmoke(t) {
  const cook = t >= 400 && t < 866;          // khói bếp trong trại
  for (let i = 0; i < SMOKE_N; i++) {
    const c = CAMP_T[(i * 13) % CAMP_T.length]; const life = 26 + rnd(i, 30) * 14; const age = ((t + rnd(i, 31) * life) % life);
    let on = Math.max(tentFire(c, t), 0); if (cook && i % 9 === 0) on = Math.max(on, 0.25); if (t >= 680 && t < 820 && i % 23 === 0) on = Math.max(on, 0.45);   // C10: khói hoả táng người chết dịch
    const wind = age * 2.2;
    smokePos[i * 3] = c.x + (rnd(i, 33) - 0.5) * 8 + wind; smokePos[i * 3 + 1] = hG(c.x, c.z) + 4 + age * (2.4 + rnd(i, 34)); smokePos[i * 3 + 2] = c.z + (rnd(i, 35) - 0.5) * 8 + wind * 0.5;
    smokeA[i] = (t >= 376 ? on : 0) * 0.34 * sstep(0, 3, age) * (1 - age / life); smokeS[i] = 14 + age * 2.6;
  }
  smokeGeo.attributes.position.needsUpdate = smokeGeo.attributes.aA.needsUpdate = smokeGeo.attributes.aS.needsUpdate = true;
}
const ARROW_N = 260;
//@@ s24
function updateArrows(t) {
  const a8 = t > 532 && t < 566, a9 = t > 612 && t < 668;
  for (let i = 0; i < ARROW_N; i++) {
    let from = null, to = null;
    if (a8 || a9) {
      const cand = GAR.filter ? null : null; void cand;
      const g = GAR[(i * 7) % GAR.length]; const tgt = a8 ? [lerp(BR_A[0], BR_B[0], rnd(i, 1)), BR_A[1] + (rnd(i, 2) - 0.5) * 40] : (() => { const r = RAFT[i % NR]; return [r.x, r.z]; })();
      if (Math.hypot(g.x - tgt[0], g.z - tgt[1]) < 420) { from = [g.x, hG(g.x, g.z) + 2.4, g.z]; to = [tgt[0] + (rnd(i, 3) - 0.5) * 14, tideNow + 1.5, tgt[1] + (rnd(i, 4) - 0.5) * 14]; }
      if (from && i % 3 === 0) { const f2 = to; to = [from[0], from[1] - 0.6, from[2]]; from = [f2[0], f2[1] + 1.2, f2[2]]; }     // quân Tống bắn trả từ bè, từ cầu phao
    }
    if (!from) { arrows.setMatrixAt(i, NOBR); continue; }
    const per = 2.2 + rnd(i, 42) * 1.5; const u = ((t + rnd(i, 43) * per) % per) / per;
    const dist = Math.hypot(to[0] - from[0], to[2] - from[2]); const arc = dist * 0.18;
    const x = lerp(from[0], to[0], u), z = lerp(from[2], to[2], u), y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arc;
    const dy = (to[1] - from[1]) + Math.cos(u * Math.PI) * Math.PI * arc;
    dummy.position.set(x, y, z); dummy.lookAt(x + (to[0] - from[0]), y + dy, z + (to[2] - from[2])); dummy.scale.set(1, 1, Math.max(1, dist / 60)); dummy.updateMatrix();
    arrows.setMatrixAt(i, dummy.matrix);
  }
  arrows.instanceMatrix.needsUpdate = true;
}
// tên lửa bắn vào trại (C12) + lửa cháy trại + đuốc
//@@ s25
const fireArrows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 0.16, 2.6), new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), FA_N);
fireArrows.frustumCulled = false; scene.add(fireArrows);
const FIRE_N = 2600;
//@@ s26
const CAMPFIRE = []; for (let i = 0; i < 14; i++) { const c = CAMP_T[(i * 37) % CAMP_T.length]; CAMPFIRE.push([c.x + 8, c.z + 6]); }
function updateFire(t) {
  const tt = U.time.value;
  const active = t > 874 && t < 908;
  for (let i = 0; i < FA_N; i++) {
    if (!active) { fireArrows.setMatrixAt(i, NOBR); continue; }
    const c = CAMP_T[(i * 11) % CAMP_T.length]; if (t > c.burn + 6) { fireArrows.setMatrixAt(i, NOBR); continue; }
    const a = ARCH12[i % 60], from = [a[0], hG(a[0], a[1]) + 2.6, a[1]], to = [c.x, hG(c.x, c.z) + 3, c.z];
    const dist = Math.hypot(to[0] - from[0], to[2] - from[2]); if (dist > 700) { fireArrows.setMatrixAt(i, NOBR); continue; }
    const per = 1.6 + dist / 90 + rnd(i, 75) * 1.2, u = ((t + rnd(i, 76) * per) % per) / per, arc = dist * 0.2;
    const x = lerp(from[0], to[0], u), z = lerp(from[2], to[2], u), y = lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * arc;
    const dy = (to[1] - from[1]) + Math.cos(u * Math.PI) * Math.PI * arc;
    dummy.position.set(x, y, z); dummy.lookAt(x + (to[0] - from[0]), y + dy, z + (to[2] - from[2])); dummy.scale.set(1, 1, 1 + dist / 500); dummy.updateMatrix();
    fireArrows.setMatrixAt(i, dummy.matrix);
  }
  fireArrows.instanceMatrix.needsUpdate = true;
  let lx = 0, lz = 0, ln = 0; const night = isNight(t);
  for (let i = 0; i < FIRE_N; i++) {
    let f = 0, bx = 0, by = 0, bz = 0, spread = 3, h0 = 0.5, sz = 1;
    if (i < 1700) { const c = CAMP_T[i % CAMP_T.length]; f = t >= 376 ? tentFire(c, t) : 0; bx = c.x; bz = c.z; by = hG(c.x, c.z); spread = 4.2; h0 = 0.6; sz = 1.3; if (f > 0 && i % 40 === 0) { lx += c.x * f; lz += c.z * f; ln += f; } }
    else if (i < 1700 + 14 * 16) { const k = Math.floor((i - 1700) / 16); const cf = CAMPFIRE[k]; f = night && t >= 380 && t < 866 ? 0.55 : 0; bx = cf[0]; bz = cf[1]; by = hG(bx, bz); spread = 0.8; h0 = 0.1; sz = 0.55; }
    else { const k = i - 1700 - 224; if (k < TORCH.n) { f = 0.6; bx = TORCH.p[k * 3]; by = TORCH.p[k * 3 + 1]; bz = TORCH.p[k * 3 + 2]; spread = 0.15; h0 = 0; sz = 0.3; } else if (k < 300 && night && t >= 750 && t < 840 && Math.hypot(TEMPLE.x, 0) > 0 && k < 30) { f = 0.5; bx = TEMPLE.x + Math.sin(k) * 7; bz = TEMPLE.z + Math.cos(k) * 5; by = TEMPLE.y + 1.4; spread = 0.2; h0 = 0; sz = 0.35; } }
    if (f <= 0.001) { fireA[i] = 0; continue; }
    const life = 0.9 + rnd(i, 80) * 0.8, age = ((tt + rnd(i, 81) * life) % life) / life;
    firePos[i * 3] = bx + (rnd(i, 82) - 0.5) * spread * 2 + age * 1.5; firePos[i * 3 + 1] = by + h0 + age * (sz * 6 + rnd(i, 85) * 3 * sz); firePos[i * 3 + 2] = bz + (rnd(i, 83) - 0.5) * spread * 2 + age * 0.7;
    fireA[i] = f * (1 - age) * sstep(0, 0.12, age) * (0.55 + 0.45 * Math.sin(tt * 13 + i)); fireS[i] = (3 + rnd(i, 86) * 4) * sz * (1.2 - age * 0.6); fireH[i] = age;
  }
  fireGeo.attributes.position.needsUpdate = fireGeo.attributes.aA.needsUpdate = fireGeo.attributes.aS.needsUpdate = fireGeo.attributes.aH.needsUpdate = true;
  fireLight.intensity = ln > 0 ? Math.min(900, ln * 30) : 0; if (ln > 0) fireLight.position.set(lx / ln, 60, lz / ln);
  templeGlow.intensity = t >= 750 && t < 840 ? 40 * sstep(752, 760, t) : 0;
}
// mốc hướng ở chân trời (chỉ hướng, không theo tỉ lệ)
//@@ s27
const MARK = {
  thanglong: { p: bearingPt(203, 13000), t: 'Kinh thành Thăng Long (hướng Tây Nam, ~25 km)' },
  quachquy: { p: bearingPt(104, 12500), t: 'Đại doanh Quách Quỳ · đối diện Thị Cầu (hướng Đông)' },
  ung: { p: bearingPt(52, 16000), t: 'Ung Châu (Tống, hướng Đông Bắc)' },
  kham: { p: bearingPt(72, 16000), t: 'Khâm Châu (Tống)' },
  liem: { p: bearingPt(84, 16500), t: 'Liêm Châu (Tống)' },
  bien: { p: bearingPt(44, 12500), t: 'Biên giới · ải phía Bắc (quân Tống tiến sang)' },
  bien2: { p: bearingPt(92, 14000), t: 'Biển Đông Bắc · Lý Kế Nguyên chặn thủy binh Tống' },
};
const markMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, emissive: 0x6b4c1c, emissiveIntensity: 0.6, roughness: 0.6 });
// hình tượng thành trì ở chân trời (không theo tỉ lệ: thành rộng ~1 km, tường cao ~60 m để nhìn rõ từ máy quay trên cao)
function roofGeo(w, d, h, col) { return colored(new THREE.CylinderGeometry(0.01, 1, h, 4, 1).rotateY(Math.PI / 4).scale(w * 0.72, 1, d * 0.72), col); }
function cityGeo(o) {
  const L = [], S = o.size, W = o.wall, T = o.thick, half = S / 2, wc = o.wallCol, rc = o.roofCol;
  const box = (w, h, d, x, y, z, c, ry = 0) => L.push(colored(new THREE.BoxGeometry(w, h, d).rotateY(ry).translate(x, y, z), c));
  // hào nước + nền
  L.push(colored(new THREE.BoxGeometry(S + 200, 4, S + 200).translate(0, 0, 0), 0x3a5658));
  L.push(colored(new THREE.BoxGeometry(S + 60, 6, S + 60).translate(0, 2, 0), o.groundCol));
  // bốn mặt tường + lỗ châu mai
  for (const [x, z, ry] of [[0, -half, 0], [0, half, 0], [-half, 0, Math.PI / 2], [half, 0, Math.PI / 2]]) {
    for (const s of [-1, 1]) { const len = half - 70; const cx = ry ? x : s * (70 + len / 2), cz = ry ? s * (70 + len / 2) : z; box(ry ? T : len, W, ry ? len : T, cx, W / 2, cz, wc); }
    for (let k = -half + 30; k <= half - 30; k += 44) { if (Math.abs(k) < 80) continue; const cx = ry ? x : k, cz = ry ? k : z; box(16, 14, 16, cx + (ry ? 0 : 0), W + 7, cz, wc); }
    // cổng thành + lầu cổng hai tầng mái
    const gx = x, gz = z; box(ry ? T + 30 : 150, W + 12, ry ? 150 : T + 30, gx, (W + 12) / 2, gz, wc);
    box(ry ? 50 : 120, 30, ry ? 120 : 50, gx, W + 27, gz, o.hallCol);
    L.push(roofGeo(ry ? 80 : 170, ry ? 170 : 80, 34, rc).translate(gx, W + 58, gz));
    L.push(roofGeo(ry ? 60 : 130, ry ? 130 : 60, 26, rc).translate(gx, W + 86, gz));
  }
  // tháp góc
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { box(80, W + 40, 80, sx * half, (W + 40) / 2, sz * half, wc); L.push(roofGeo(110, 110, 40, rc).translate(sx * half, W + 60, sz * half)); }
  // nhà trong thành
  let seed = o.seed;
  const r = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < o.houses; i++) { const x = (r() - 0.5) * (S - 160), z = (r() - 0.5) * (S - 160); if (Math.abs(x) < o.core && Math.abs(z) < o.core) continue; const w = 40 + r() * 50, d = 30 + r() * 30, ry = r() < 0.5 ? 0 : Math.PI / 2; box(w, 18, d, x, 9, z, o.houseCol, ry); L.push(roofGeo(ry ? d + 14 : w + 14, ry ? w + 14 : d + 14, 20, rc).translate(x, 28, z)); }
  // công đường / cung điện ở giữa
  box(o.core * 1.3, 14, o.core * 1.0, 0, 7, 0, 0x9a917e);
  box(o.core * 0.9, 34, o.core * 0.55, 0, 31, 0, o.hallCol);
  L.push(roofGeo(o.core * 1.1, o.core * 0.75, 40, rc).translate(0, 68, 0));
  L.push(roofGeo(o.core * 0.8, o.core * 0.5, 30, rc).translate(0, 98, 0));
  return merge(L);
}
const cityMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
const TONG_CITY = { size: 1000, wall: 60, thick: 30, wallCol: 0x8b877c, roofCol: 0x3d3a3a, hallCol: 0x8c3a2c, houseCol: 0xb2a68c, groundCol: 0x6d6b58, houses: 46, core: 120, seed: 11 };
const CITY = {
  ung: cityGeo({ ...TONG_CITY, size: 1150, houses: 60, seed: 3 }),
  kham: cityGeo({ ...TONG_CITY, size: 900, seed: 7 }),
  liem: cityGeo({ ...TONG_CITY, size: 850, seed: 9 }),
  thanglong: cityGeo({ size: 1300, wall: 55, thick: 34, wallCol: 0x8e5a3e, roofCol: 0x6b2a1c, hallCol: 0xa8322a, houseCol: 0xc0a882, groundCol: 0x6a6a4c, houses: 70, core: 170, seed: 5 }),
};
const CITY_FLAG = {};
for (const k in MARK) {
  let m;
  if (CITY[k]) { m = new THREE.Mesh(CITY[k], cityMat); m.rotation.y = Math.atan2(-MARK[k].p.x, -MARK[k].p.z); m.scale.setScalar(1.8); }
  else if (k === 'quachquy') { const L = []; for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) L.push(tentGeo.clone().scale(14, 14, 14).translate(i * 120, 0, j * 120)); m = new THREE.Mesh(merge(L), tentMat); }
  else if (k === 'bien') { const L = []; for (let i = -3; i <= 3; i++) L.push(colored(new THREE.ConeGeometry(900, 520 + (3 - Math.abs(i)) * 90, 9).translate(i * 1100, 230, Math.abs(i) * 260), 0x4a5440)); L.push(colored(new THREE.BoxGeometry(500, 140, 80).translate(0, 70, -300), 0x8b877c)); L.push(roofGeo(260, 120, 60, 0x3d3a3a).translate(0, 170, -300)); m = new THREE.Mesh(merge(L), cityMat); m.rotation.y = Math.atan2(-MARK[k].p.x, -MARK[k].p.z); }
  else m = new THREE.Mesh(new THREE.CylinderGeometry(18, 40, 420, 6).translate(0, 210, 0), markMat);
  m.position.copy(MARK[k].p); scene.add(m); MARK[k].mesh = m; MARK[k].top = MARK[k].p.clone().add(new THREE.Vector3(0, CITY[k] ? 620 : 470, 0));
  if (CITY[k]) {                                   // cờ lớn trên lầu cổng: thành Tống cắm cờ 宋, Thăng Long cờ 李; Ung Châu đổi sang cờ 李 sau khi bị hạ (chương 3)
    const mk = (mat) => { const f = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.5, -0.36, 0), mat, 1); f.frustumCulled = false; dummy.position.set(MARK[k].p.x, MARK[k].p.y + 500, MARK[k].p.z); dummy.rotation.set(0, 0.6, 0); dummy.scale.setScalar(260); dummy.updateMatrix(); f.setMatrixAt(0, dummy.matrix); scene.add(f); const pole = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 510, 5).translate(0, 255, 0), propMat); pole.position.copy(MARK[k].p); scene.add(pole); return f; };
    CITY_FLAG[k] = { tong: k === 'thanglong' ? null : mk(coMatT), ly: k === 'thanglong' || k === 'ung' || k === 'kham' || k === 'liem' ? mk(coMat) : null };
  }
}
// khói lửa trên các thành bị quân Lý hạ (chương 3)
const CSM_N = 420, csmGeo = new THREE.BufferGeometry(), csmPos = new Float32Array(CSM_N * 3), csmA = new Float32Array(CSM_N), csmS = new Float32Array(CSM_N);
csmGeo.setAttribute('position', new THREE.BufferAttribute(csmPos, 3)); csmGeo.setAttribute('aA', new THREE.BufferAttribute(csmA, 1)); csmGeo.setAttribute('aS', new THREE.BufferAttribute(csmS, 1));
const citySmoke = new THREE.Points(csmGeo, smokeMat.clone()); citySmoke.material.uniforms.uScale.value = 600; citySmoke.frustumCulled = false; scene.add(citySmoke);
const CITY_FALL = { kham: [150, 166], liem: [156, 172], ung: [168, 182] };          // [bắt đầu cháy, cắm cờ Lý]
function updateCities(t) {
  for (const k in CITY_FLAG) {
    const F = CITY_FLAG[k], fall = CITY_FALL[k], taken = fall && t >= fall[1] && t < 210;
    if (F.tong) F.tong.visible = !taken; if (F.ly) F.ly.visible = k === 'thanglong' || taken;
  }
  const keys3 = Object.keys(CITY_FALL);
  for (let i = 0; i < CSM_N; i++) {
    const k = keys3[i % 3], [t0] = CITY_FALL[k], p = MARK[k].p, on = t >= t0 && t < 215 ? sstep(t0, t0 + 4, t) : 0;
    const life = 30 + rnd(i, 1) * 20, age = (t * 3 + rnd(i, 2) * life) % life;
    csmPos[i * 3] = p.x + (rnd(i, 3) - 0.5) * 1500 + age * 25; csmPos[i * 3 + 1] = p.y + 100 + age * 30; csmPos[i * 3 + 2] = p.z + (rnd(i, 4) - 0.5) * 900;
    csmA[i] = on * 0.5 * sstep(0, 3, age) * (1 - age / life); csmS[i] = 260 + age * 30;
  }
  csmGeo.attributes.position.needsUpdate = csmGeo.attributes.aA.needsUpdate = csmGeo.attributes.aS.needsUpdate = true;
}
//@@ s28

//@@ s29
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// C03: hai đường tiến công sang đất Tống (1075): thủy quân đánh Khâm, Liêm; bộ binh vây Ung Châu
const routeLy1 = dashTube([MARK.thanglong.p.clone().setY(80), V3(4000, 120, 2000), V3(11000, 200, -1500), MARK.kham.p.clone().setY(120), MARK.liem.p.clone().setY(120)], 0xe3c178, 110);
const routeLy2 = dashTube([MARK.thanglong.p.clone().setY(80), V3(-1500, 120, -2000), V3(4500, 200, -8000), MARK.ung.p.clone().setY(120)], 0xe3c178, 110);
// C05–C06: đường tiến của quân Tống; thủy binh Tống bị chặn ngoài biển
const routeTong = dashTube([MARK.bien.p.clone().setY(80), V3(6000, 100, -6500), V3(3000, 80, -2900), V3(1600, 50, -1500), V3(CAMP.x, 40, CAMP.z)], 0xd2442b, 70);
const routeTongS = dashTube([MARK.liem.p.clone().setY(100), V3(14000, 100, -2200), V3(12500, 100, 1000)], 0xd2442b, 90);
const routeQQ = dashTube([MARK.bien.p.clone().setY(80), V3(8000, 100, -3000), MARK.quachquy.p.clone().setY(60)], 0xd2442b, 70);
const routeNavy = dashTube([V3(1400, 30, 380), V3(2700, 40, 860), V3(6000, 60, 2600), MARK.quachquy.p.clone().setY(60)], 0xe3c178, 60);
const attackArrows = [];
for (const [a, b] of [[[BR_A[0] + 140, BR_A[1] - 70], [BR_B[0] - 80, BR_B[1] + 40]], [[AMBUSH[0][0], AMBUSH[0][1]], C8_IN], [[AMBUSH[1][0], AMBUSH[1][1]], C8_IN], [[AMBUSH[2][0], AMBUSH[2][1]], C8_IN]]) {
  const m = dashTube([V3(a[0], 14, a[1]), V3((a[0] + b[0]) / 2, 26, (a[1] + b[1]) / 2), V3(b[0], 14, b[1])], attackArrows.length ? 0xe3c178 : 0xd2442b, 6); attackArrows.push(m);
}
const attack12 = [];
for (const dx of [-120, 0, 120]) { const a = chan(SB.camp + dx, 2.4), m = dashTube([V3(a.x, 14, a.z), V3((a.x + CAMP.x) / 2 + dx * 0.3, 30, (a.z + CAMP.z) / 2), V3(CAMP.x + dx * 0.5, 16, CAMP.z + 40)], 0xe3c178, 8); attack12.push(m); }
const raftArrows = RAFT.filter((r, i) => i % 2 === 0).map((r) => { const a = chan(r.s, -2.2), b = chan(r.s, 1.6); return dashTube([V3(a.x, 12, a.z), V3((a.x + b.x) / 2, 20, (a.z + b.z) / 2), V3(b.x, 12, b.z)], 0xd2442b, 5); });
//@@ s30
const SKY = {
  'Sương sớm cuối đông': { top: '#7c8fa3', hor: '#c9c6bc', low: '#8e8a7d', ground: '#6e6a5a', fog: 0.00006, el: 9, az: 120, sun: '#ffd9a8', si: 1.5, hs: '#b8c4cc', hg: '#5d5546', hi: 0.9, cover: 0.45, cc: '#e8e1d6', cs: '#8a8f96', exp: 0.95, size: 700, glow: 1.2 },
  'Trời u ám mùa đông': { top: '#5d6b78', hor: '#a3a69f', low: '#6c6a60', ground: '#5c5a4e', fog: 0.000055, el: 24, az: 160, sun: '#d9dde0', si: 0.9, hs: '#a9b2b8', hg: '#4e4a40', hi: 1.15, cover: 0.78, cc: '#b8bcbd', cs: '#5b6168', exp: 1.0, size: 400, glow: 0.4 },
  'Sáng trong': { top: '#3f78b0', hor: '#c7d8e0', low: '#8d9a8a', ground: '#77765a', fog: 0.00003, el: 32, az: 135, sun: '#fff1d8', si: 2.6, hs: '#bcd3e6', hg: '#5f5a44', hi: 0.9, cover: 0.3, cc: '#ffffff', cs: '#a3b0bd', exp: 0.92, size: 900, glow: 1 },
  'Chiều nắng ấm': { top: '#4b74a0', hor: '#e2c99a', low: '#8a7b5c', ground: '#80724f', fog: 0.000035, el: 18, az: 230, sun: '#ffd49a', si: 2.4, hs: '#c4c8c4', hg: '#5f5440', hi: 0.8, cover: 0.38, cc: '#fff0d8', cs: '#9a8f86', exp: 0.95, size: 800, glow: 1.4 },
  'Ngày nhiều mây': { top: '#56789a', hor: '#c3c9c6', low: '#7d8072', ground: '#6f6d55', fog: 0.00004, el: 38, az: 170, sun: '#fff4e4', si: 2.0, hs: '#b9c6cf', hg: '#575343', hi: 1.0, cover: 0.58, cc: '#f2f1ec', cs: '#7f8892', exp: 0.95, size: 800, glow: 0.8 },
  'Sương sông buổi sớm': { top: '#8796a3', hor: '#d6d3c9', low: '#9a978a', ground: '#7a7663', fog: 0.00011, el: 6, az: 115, sun: '#ffe0b8', si: 1.2, hs: '#c8cfd2', hg: '#625b4b', hi: 1.1, cover: 0.35, cc: '#efe9de', cs: '#9fa3a6', exp: 0.98, size: 600, glow: 1.4 },
  'Mây đen áp sát': { top: '#2f3741', hor: '#7d7f7b', low: '#474741', ground: '#45443b', fog: 0.00006, el: 20, az: 200, sun: '#c9c2b4', si: 0.8, hs: '#8a929a', hg: '#3d3a32', hi: 1.0, cover: 0.86, cc: '#8d9196', cs: '#2b3037', exp: 1.05, size: 400, glow: 0.3 },
  'Chiều ngả hổ phách': { top: '#4d5f7a', hor: '#d9a76a', low: '#7d6448', ground: '#76603f', fog: 0.00004, el: 12, az: 238, sun: '#ffb86a', si: 2.2, hs: '#b5aa9a', hg: '#5a4a36', hi: 0.75, cover: 0.45, cc: '#f2c58e', cs: '#6d5f5c', exp: 0.95, size: 700, glow: 1.8 },
  'Khói trận': { top: '#3b3532', hor: '#a37a58', low: '#4a3a2e', ground: '#544434', fog: 0.00007, el: 10, az: 244, sun: '#ffa35e', si: 1.7, hs: '#8f8177', hg: '#3c3229', hi: 0.8, cover: 0.66, cc: '#b88a66', cs: '#3a3230', exp: 1.0, size: 500, glow: 1.6 },
  'Hoàng hôn vàng lặng': { top: '#456189', hor: '#efc27c', low: '#8a6a45', ground: '#83693f', fog: 0.000035, el: 6, az: 246, sun: '#ffc070', si: 2.1, hs: '#c0b4a2', hg: '#5a4831', hi: 0.8, cover: 0.32, cc: '#ffd8a0', cs: '#8a7068', exp: 0.95, size: 650, glow: 2.0 },
  'Bình minh hồng': { top: '#5a7aa8', hor: '#f0b9a0', low: '#8f7a6a', ground: '#7a6c58', fog: 0.000045, el: 5, az: 112, sun: '#ffc79a', si: 1.9, hs: '#c9c2c8', hg: '#5a5044', hi: 0.9, cover: 0.3, cc: '#ffe1cc', cs: '#9c8a96', exp: 0.95, size: 700, glow: 2.0 },
  'Đêm trăng': { top: '#0a1020', hor: '#2c3850', low: '#151a22', ground: '#1e2228', fog: 0.00005, el: 38, az: 150, sun: '#a9bde6', si: 0.75, hs: '#55668a', hg: '#1c1c20', hi: 0.7, cover: 0.32, cc: '#4c566c', cs: '#141a26', exp: 1.35, size: 1600, glow: 0.25 },
  'Đêm thiêng': { top: '#0c0f1c', hor: '#3a3648', low: '#17151c', ground: '#201e24', fog: 0.000055, el: 30, az: 210, sun: '#c2c6e8', si: 0.65, hs: '#5a5a7a', hg: '#1e1a1c', hi: 0.7, cover: 0.45, cc: '#52506a', cs: '#16141e', exp: 1.4, size: 1800, glow: 0.3 },
  'Đêm phản công': { top: '#120c12', hor: '#5e3020', low: '#1e1412', ground: '#2a1e18', fog: 0.00006, el: 25, az: 120, sun: '#c0b0c8', si: 0.6, hs: '#6a5a62', hg: '#241a16', hi: 0.7, cover: 0.55, cc: '#6a3c2c', cs: '#1a1214', exp: 1.35, size: 1600, glow: 0.4 },
};
const SKYKEYS = [[0, 'Sương sớm cuối đông'], [60, 'Trời u ám mùa đông'], [130, 'Sáng trong'], [210, 'Chiều nắng ấm'], [295, 'Mây đen áp sát'], [350, 'Ngày nhiều mây'], [430, 'Chiều ngả hổ phách'], [500, 'Đêm trăng'], [596, 'Sương sông buổi sớm'], [640, 'Khói trận'], [680, 'Trời u ám mùa đông'], [750, 'Đêm thiêng'], [820, 'Đêm phản công'], [920, 'Bình minh hồng'], [940, 'Sáng trong'], [990, 'Hoàng hôn vàng lặng']];
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
  scene.fog.color.copy(U.hor.value); scene.fog.density = lerp(A.fog, B.fog, u);
  renderer.toneMappingExposure = lerp(A.exp, B.exp, u);
  U.light.value = 0.45 + 0.55 * Math.min(1, sun.intensity / 2.2) * 0.8 + hemi.intensity * 0.12;
  U.deep.value.copy(U.hor.value).multiplyScalar(0.25).lerp(new THREE.Color(0x2e3a2c), 0.6);
  U.shallow.value.copy(U.hor.value).multiplyScalar(0.45).lerp(new THREE.Color(0x6a6a4a), 0.55);
}

// ------------------------------------------------------------------ CameraDirector
//@@ s32
let tideNow = 0.3;
const NNP = V3(300, 0, -40), CAMPV = V3(CAMP.x, hAt(CAMP.x, CAMP.z), CAMP.z), BRV = V3(-714, 0, -700), TMP = TEMPLE.clone();
//@@ s33

//@@ s34
function raftCam(i, r, h, a0, a1, fov = 40) { return (u) => { const f = RAFT[i], a = f.yaw + lerp(a0, a1, ease(u)); return [V3(f.x + Math.sin(a) * r, Math.max(tideNow, 0) + h, f.z + Math.cos(a) * r), V3(f.x, f.y + 2, f.z), fov]; }; }
const luyP = (x, z) => LUY[luyNear(x, z)];
const LNN = luyP(300, 0), LBR = luyP(BR_B[0], BR_B[1]);
const lv = (p, back, up, side = 0) => V3(p.x - p.rx * back + p.tx * side, hAt(p.x, p.z) + up, p.z - p.rz * back + p.tz * side);   // điểm sau lũy (back>0: phía đồng), trước lũy (back<0: phía sông)
const MP = (k, x = 0, y = 0, z = 0) => MARK[k].p.clone().add(V3(x, y, z));
const KL = MARK.kham.p.clone().lerp(MARK.liem.p, 0.5);
// V1.3: góc máy vòng cung quanh một điểm lũy cố định (mượt, thấy cả đoạn phòng tuyến) thay cho máy chạy dọc rào
function arcLuy(x, z, r, h, da0, da1, fov = 42) { const p = luyP(x, z), base = Math.atan2(p.rx, p.rz), c = V3(p.x - p.rx * 10, hAt(p.x, p.z) + 2, p.z - p.rz * 10);
  return (u) => { const a = base + lerp(da0, da1, ease(u)); return [V3(p.x + Math.sin(a) * r, c.y + h, p.z + Math.cos(a) * r), c.clone(), fov]; }; }
const FIRE_TENT = CAMP_T.slice().sort((a, b) => Math.abs(a.burn - 879) - Math.abs(b.burn - 879))[0];
const SHOTS = {
  'C01-A': fly(V3(600, 2600, 6800), V3(450, 900, 2300), V3(300, 0, -300), V3(350, 0, -100), 42),
  'C01-B': fly(V3(-300, 260, 700), V3(150, 160, 520), V3(450, 0, -150), V3(500, 0, -200), 42),
  'C01-C': arcLuy(300, 0, 150, 34, -0.9, 0.9, 42),
  'C01-D': fly(V3(700, 140, 140), V3(800, 180, 60), V3(450, 0, -700), V3(500, 0, -900), 42),
  'C01-E': orbit(V3(200, 0, -300), 4200, 2300, 0.2, -0.3, 45),
  'C02-A': fly(V3(-6000, 15000, 14000), V3(-4000, 13000, 12000), V3(3000, 0, -4000), V3(4000, 0, -5000), 50),
  'C02-B': fly(MP('ung', -3600, 2900, 3400), MP('ung', -2500, 2000, 2400), MP('ung', 0, 150), MP('ung', 0, 80), 42),
  'C02-C': fly(KL.clone().add(V3(-4200, 3400, 3800)), KL.clone().add(V3(-3000, 2500, 2800)), KL.clone().setY(120), KL.clone().setY(60), 45),
  'C02-D': fly(MP('thanglong', 3000, 2300, -2600), MP('thanglong', 2100, 1500, -1900), MP('thanglong', 0, 150), MP('thanglong', 0, 60), 42),
  'C02-E': fly(V3(-2000, 18000, 16000), V3(0, 16000, 15000), V3(3000, 0, -3000), V3(2500, 0, -2500), 50),
  'C03-A': fly(V3(-4000, 16000, 18000), V3(-2500, 14500, 16000), V3(3500, 0, -2500), V3(4500, 0, -3500), 50),
  'C03-B': fly(V3(6000, 6000, 5000), KL.clone().add(V3(-3200, 2600, 3000)), V3(11000, 0, -1500), KL.clone().setY(60), 45),
  'C03-C': fly(MP('ung', -2800, 2200, 2900), MP('ung', -1900, 1500, 2000), MP('ung', 0, 200), MP('ung', 0, 80), 42),
  'C03-D': fly(V3(12000, 9000, 9000), V3(4000, 9000, 9000), MARK.ung.p.clone().setY(0), MARK.thanglong.p.clone().setY(0), 50),
  'C03-E': fly(V3(-1500, 6000, 9000), V3(-200, 700, 1700), V3(300, 0, 0), V3(300, 0, -50), 45),
  'C04-A': (u) => { const c = lv(WK, 60, 0); return [V3(c.x + 120 - u * 40, c.y + 70 - u * 20, c.z + 120), V3(WK.x, hAt(WK.x, WK.z), WK.z), 40]; },
  'C04-B': (u) => { const w = workers[0]; return [V3(w.position.x + 7 - u * 1.5, w.position.y + 3.4, w.position.z + 6), V3(w.position.x, w.position.y + 1, w.position.z), 36]; },
  'C04-C': (u) => { const w = workers[1]; return [V3(w.position.x - 10, w.position.y + 4, w.position.z + 9 - u * 2), V3(w.position.x, w.position.y + 1.4, w.position.z), 38]; },
  'C04-D': (u) => { const w = workers[2]; return [V3(w.position.x + 6, w.position.y + 3, w.position.z - 7 + u * 2), V3(w.position.x, w.position.y + 1.8, w.position.z), 38]; },
  'C04-E': objCam(NQ, -2.6, 3.0, 6.4, 0, 2.3, 0, 32, [-2.0, 2.8, 5.0]),
  'C04-F': (u) => { const z0 = LUY[luyNear(SEC_X, 0)].z; return [V3(SEC_X + 95 - u * 25, 22 - u * 6, z0 + 30 - u * 10), V3(SEC_X, 2, z0 - 8), 42]; },
  'C05-A': fly(V3(-3000, 15000, 15000), V3(2000, 13000, 13000), V3(6000, 0, -2500), V3(8000, 0, -1000), 50),
  'C05-B': fly(V3(9000, 4200, 4000), V3(11000, 3800, 2600), MARK.bien2.p.clone().setY(200), MARK.bien2.p.clone().setY(120), 45),
  'C05-C': fly(V3(1000, 7000, 6000), V3(2000, 6000, 3500), MARK.bien.p.clone().setY(100), V3(2000, 0, -2000), 48),
  'C05-D': arcLuy(380, 0, 125, 26, 0.7, -0.4, 40),
  'C06-A': (u, t) => { const p = polyAt(TMARCH, Math.max(0, tmHead(t) - 120)); return [V3(p[0] + 600 - u * 100, 360, p[1] + 420), V3(p[0], 0, p[1]), 40]; },
  'C06-B': (u, t) => { const p = polyAt(TMARCH, Math.max(0, tmHead(t) - 30)), q = polyAt(TMARCH, Math.max(0, tmHead(t) - 5)); const yaw = Math.atan2(q[0] - p[0], q[1] - p[1]); return [V3(p[0] + Math.cos(yaw) * 45 + Math.sin(yaw) * 20, G(p[0], p[1]) + 14, p[1] - Math.sin(yaw) * 45 + Math.cos(yaw) * 20), V3(q[0], G(q[0], q[1]) + 2, q[1]), 38]; },
  'C06-C': objCam(LHT, 9, 6.5, 17, 0, 4.2, -4, 38, [7.5, 6, 15]),      // Quách Quỳ cưỡi ngựa dẫn đầu
  'C06-D': fly(V3(CAMP.x + 420, 260, CAMP.z + 520), V3(CAMP.x + 300, 180, CAMP.z + 420), CAMPV, CAMPV, 40),
  'C06-E': orbit(V3(350, 0, -350), 2600, 1500, 3.4, 2.8, 45),
  'C07-A': (u) => [lv(LNN, 30, 14 - u * 3, -20 + u * 30), V3(CAMP.x, 6, CAMP.z + 150), 38],
  'C07-B': (u) => { const r = RAFT[4]; return [V3(r.x + 34 - u * 8, r.y + 12, r.z - 26), V3(r.x, r.y, r.z), 38]; },
  'C07-C': (u) => { const a = archers[2]; return [V3(a.position.x - a.position.x * 0 + Math.sin(a.rotation.y) * -5 + 2, a.position.y + 2.8, a.position.z - Math.cos(a.rotation.y) * 5), V3(a.position.x + Math.sin(a.rotation.y) * 200, a.position.y, a.position.z + Math.cos(a.rotation.y) * 200), 36]; },
  'C07-D': fly(V3(-520, 120, -560), V3(-560, 90, -600), BRV, V3(-720, 0, -700), 40),
  'C07-E': (u) => [V3(CP.x - 1.5 - u * 0.6, CP.y + 3.1, CP.z - 5.2 + u * 0.4), V3(CAMP.x, 4, CAMP.z + 100), 34],
  'C08-A': fly(V3(-300, 260, -400), V3(-420, 180, -520), BRV, BRV, 40),
  'C08-B': (u) => [V3(lerp(BR_A[0], BR_B[0], u * 0.6) + 10, tideNow + 14, BR_A[1] - 42), V3(lerp(BR_A[0], BR_B[0], 0.3 + u * 0.6), tideNow + 2, BR_A[1]), 40],
  'C08-C': (u) => [lv(LBR, -34, 15, 40 - u * 20), V3(C8_IN[0], hAt(C8_IN[0], C8_IN[1]) + 2, C8_IN[1]), 40],
  'C08-D': fly(V3(-1500, 420, 200), V3(-1400, 340, 100), V3(C8_IN[0] - 100, 0, C8_IN[1]), V3(C8_IN[0] - 80, 0, C8_IN[1]), 42),
  'C08-E': orbit(V3(C8_IN[0] - 140, hAt(C8_IN[0] - 140, C8_IN[1] + 50) + 2, C8_IN[1] + 50), 60, 22, 1.2, 2.0, 40),
  'C08-F': fly(V3(-760, 120, -440), V3(-700, 160, -420), BRV, V3(-700, 0, -650), 42),
  'C09-A': (u) => [V3(560 + u * 60, 160, 260), V3(450, 0, -200), 42],
  'C09-B': raftCam(4, 70, 16, 0.6, 1.4, 38),
  'C09-C': (u) => { const a = archers[3]; return [V3(a.position.x - Math.sin(a.rotation.y) * 4 + 2.5, a.position.y + 2.8, a.position.z - Math.cos(a.rotation.y) * 4 + 1), V3(RAFT[3].x, tideNow + 2, RAFT[3].z), 36]; },
  'C09-D': (u) => { const r = RAFT[5]; return [V3(r.x + 120 - u * 30, 36, r.z + 90), V3(r.x, 0, r.z), 38]; },
  'C09-E': fly(V3(400, 380, 520), V3(450, 520, 640), V3(450, 0, -120), V3(450, 0, -200), 42),
  'C10-A': orbit(CAMPV, 520, 230, 2.6, 3.2, 42),
  'C10-B': (u) => [V3(CAMP.x + 60 - u * 10, CAMPV.y + 9, CAMP.z + 70), V3(CAMP.x + 10, CAMPV.y + 1, CAMP.z + 20), 38],
  'C10-C': objCam(LHT, -2.8, 3.0, 6.5, 0, 2.2, 0, 32),
  'C10-D': (u) => [V3(tableTop.x + 0.25 + u * 0.15, tableTop.y + 1.9 - u * 0.4, tableTop.z + 1.6 - u * 0.2), V3(tableTop.x + 0.1, tableTop.y, tableTop.z + 0.4), 34],
  'C10-E': orbit(V3(300, 0, -300), 3400, 1700, 0.6, 0.9, 45),
  'C11-A': fly(V3(TMP.x + 260, 140, TMP.z + 260), V3(TMP.x + 120, 60, TMP.z + 130), TMP, TMP, 40),
  'C11-B': orbit(V3(TMP.x, TMP.y + 3, TMP.z), 34, 9, 0.5, 1.4, 40),
  'C11-C': arcLuy(250, 0, 130, 24, -0.7, 0.6, 42),
  'C11-D': (u) => { const a = 0.6 + ease(u) * 1.1; return [V3(tableTop.x + Math.sin(a) * 8.5, tableTop.y + 3.4, tableTop.z + Math.cos(a) * 8.5), V3(tableTop.x, tableTop.y + 0.7, tableTop.z), 40]; },
  'C11-E': fly(V3(-200, 600, 900), V3(200, 900, 1200), V3(0, 0, -400), V3(200, 0, -500), 45),
  'C12-A': (u) => { const b = boats[20]; return [V3(b.x - 80, 40, b.z + 90), V3(b.x, 0, b.z), 40]; },
  'C12-B': fly(V3(3000, 2600, 3400), V3(6000, 3200, 4200), V3(2500, 0, 900), MARK.quachquy.p.clone().setY(100), 45),
  'C12-C': boatCam(34, -5, 3.4, -9, 0, 1.6, 8, 40),
  'C12-D': (u) => { const p = NQ.position, y = NQ.rotation.y, sx = Math.sin(y), cz = Math.cos(y); return [V3(p.x + cz * 30 - sx * 4, p.y + 7, p.z - sx * 30 - cz * 4), V3(p.x + sx * 14, p.y + 1.6, p.z + cz * 14), 46]; },
  'C12-E': (u) => { const c = FIRE_TENT, y = hAt(c.x, c.z), a = 0.5 + u * 0.5; return [V3(c.x + Math.sin(a) * 15, y + 3.5, c.z + Math.cos(a) * 15), V3(c.x, y + 2.5, c.z), 42]; },
  'C12-F': orbit(V3(CAMP.x, CAMPV.y, CAMP.z + 40), 240, 75, 0.15, 1.55, 42),      // V1.5: bay vòng tròn quanh trại địch
  'C12-G': orbit(V3(CAMP.x, CAMPV.y, CAMP.z), 380, 170, 1.55, 2.6, 44),
  'C13-A': orbit(V3(EXIT_G[0], CAMPV.y, EXIT_G[1]), 320, 120, 3.6, 4.2, 42),
  'C13-B': (u, t) => { const d = Math.max(EX_GATE + 40, exitHead(t) + 60), p = polyAt(EXITP, d), q = polyAt(EXITP, d - 40), p2 = polyAt(EXITP, d + 4), yw = Math.atan2(p2[0] - p[0], p2[1] - p[1]); return [V3(p[0] + Math.cos(yw) * 3, G(p[0], p[1]) + 5.5, p[1] - Math.sin(yw) * 3), V3(q[0], G(q[0], q[1]) + 3.5, q[1]), 40]; },      // máy lùi trước mặt đoàn: Quách Quỳ cưỡi ngựa đi giữa hai hàng quân Lý
  'C13-C': (u) => { const p = NQ.position, y = NQ.rotation.y; return [V3(p.x - Math.sin(y) * 9 + Math.cos(y) * 5, p.y + 6.5, p.z - Math.cos(y) * 9 - Math.sin(y) * 5), V3(p.x + Math.sin(y) * 30, p.y + 2.5, p.z + Math.cos(y) * 30), 42]; },
  'C13-D': fly(V3(2600, 1800, 1600), V3(3400, 3200, 2200), V3(1500, 0, -1300), MARK.bien.p.clone().setY(0), 45),
  'C14-A': arcLuy(320, 0, 210, 55, 1.0, -0.6, 42),
  'C14-B': orbit(V3(TMP.x, TMP.y + 3, TMP.z), 60, 18, 2.0, 2.8, 40),
  'C14-C': orbit(V3(300, 0, -40), 900, 380, 0.3, 1.2, 45),
  'C14-D': fly(V3(500, 900, 1600), V3(0, 9000, 9500), V3(300, 0, -100), V3(0, 0, -800), 48),
};
//@@ s35
function sceneAt(t) { for (const s of STORY.scenes) if (t >= s.t0 && t < s.t1) return s; return STORY.scenes[STORY.scenes.length - 1]; }
//@@ s36
const LABEL_SHOTS = { 'C01-A': ['river'], 'C01-E': ['river', 'key'], 'C02-A': ['far'], 'C02-B': ['ung'], 'C02-C': ['kham', 'liem'], 'C02-D': ['thanglong'], 'C02-E': ['far'], 'C03-A': ['far'], 'C03-B': ['kham', 'liem'], 'C03-C': ['ung'], 'C03-D': ['far'], 'C05-A': ['far'], 'C05-B': ['bien2'], 'C05-C': ['bien'], 'C06-E': ['key', 'river'], 'C10-E': ['key'], 'C11-A': ['key'], 'C11-E': ['key'], 'C12-B': ['quachquy'], 'C13-D': ['bien'], 'C14-C': ['key', 'river'], 'C14-D': ['far', 'river', 'key'] };
const CARDS = [
  [0.5, 7, 'Mùa xuân năm 1077', 'Như Nguyệt', 'Phòng tuyến trên dòng sông'],
  [60.5, 67, 'Chương 2', 'Nhà Tống mưu đồ xâm lược', ''],
  [130.5, 137, 'Chương 3', '“Tiên phát chế nhân”', 'Cuối năm 1075 – đầu năm 1076'],
  [210.5, 217, 'Chương 4', 'Dựng phòng tuyến sông Như Nguyệt', ''],
  [286.5, 295, 'Minh họa', 'Lũy đất, rào tre, cọc tre', 'Hình dạng phòng tuyến là tái dựng giản lược'],
  [295.5, 302, 'Chương 5', 'Chặn thủy binh, chờ giặc', ''],
  [350.5, 357, 'Chương 6', 'Quân Tống kéo đến bờ Bắc', 'Đầu năm 1077'],
  [430.5, 437, 'Chương 7', 'Hai bờ đối mặt', ''],
  [500.5, 507, 'Chương 8', 'Lần vượt sông thứ nhất', 'Cầu phao · vị trí giả định'],
  [596.5, 603, 'Chương 9', 'Quân Tống đóng bè vượt sông', ''],
  [680.5, 687, 'Chương 10', 'Thế giằng co, giặc khốn đốn', ''],
  [750.5, 757, 'Chương 11', 'Tiếng thơ thần bên sông', 'Theo truyền thuyết'],
  [820.5, 827, 'Chương 12', 'Phản công', 'Đánh úp doanh trại Triệu Tiết'],
  [920.5, 927, 'Chương 13', 'Giảng hòa, quân Tống rút về', ''],
  [990.5, 997, 'Chương 14', 'Phòng tuyến Như Nguyệt', 'Đỉnh cao nghệ thuật quân sự thời Lý'],
  [1036, 1050, 'Như Nguyệt 1077', 'Giữ vững nền độc lập Đại Việt', 'Sa bàn tái dựng mô phỏng'],
];
// ================================================================== GIAO DIỆN (bố trí theo sa bàn Rạch Gầm – Xoài Mút 1785)
//@@ s37

//@@ s38
const ANCH = [
  ['BenNN', 'Bến Như Nguyệt', 300, -40, 'Đoạn sông trước làng Như Nguyệt. Bờ Nam là phòng tuyến chính của quân Lý; bờ Bắc là đất Mai Đình, nơi Triệu Tiết đóng trại. Quân Tống đóng bè vượt sông ở đây (chương 9).', true],
  ['Luy', 'Chiến lũy bờ Nam (tái dựng)', LNN.x - LNN.rx * 4, LNN.z - LNN.rz * 4, 'Lũy đất cao khoảng 3 m dọc bờ Nam, trên đỉnh có rào tre, phía trước cắm hai hàng cọc tre vót nhọn. Hình dạng, kích thước là tái dựng giản lược theo mô tả "đắp lũy, cắm cọc, dựng rào", chưa thẩm định khảo cổ.', true],
  ['TrieuTiet', 'Doanh trại Triệu Tiết · Mai Đình (giả định)', CAMP.x, CAMP.z, 'Phó tướng Triệu Tiết đóng quân ở bờ Bắc, nay thuộc thôn Mai Thượng, xã Mai Đình (Hiệp Hòa, Bắc Giang cũ), đối diện bến Như Nguyệt. Lý Thường Kiệt đánh thẳng vào trại này trong trận phản công (chương 12). Bố cục lều, rào là minh họa.', true],
  ['SoChiHuy', 'Sở chỉ huy Lý Thường Kiệt (giả định)', CP.x, CP.z, 'Đặt sau lũy Như Nguyệt để minh họa nơi Thái úy Lý Thường Kiệt theo dõi quân Tống bên kia sông. Vị trí thật chưa xác định.', true],
  ['Den', 'Đền Trương Hống – Trương Hát (đền Xà)', TEMPLE.x, TEMPLE.z, 'Đền ở ngã ba sông Cầu – sông Cà Lồ. Tương truyền bài thơ "Nam quốc sơn hà" vang lên từ đền này trong những ngày giằng co bên sông (chương 11). Kiến trúc trên sa bàn là dựng giản lược.', false],
  ['CauPhao', 'Cầu phao quân Tống (giả định)', -714, -700, 'Minh họa lần vượt sông thứ nhất: quân Tống bắc cầu phao, khoảng 2 000 quân cảm tử tràn sang bờ Nam, chọc thủng một đoạn lũy rồi bị phục binh đánh tan (chương 8). Sử chỉ ghi chung, vị trí cầu trên sa bàn là giả định.', false],
  ['PhucBinh', 'Nơi phục binh quân Lý (giả định)', C8_IN[0] - 160, C8_IN[1] + 40, 'Các mũi quân mai phục sau phòng tuyến, đổ ra chặn và cắt quân Tống vừa vượt sông (chương 8). Sử chép trận này ở vùng Yên Phụ, Thụy Lôi; trên sa bàn dời vào trong vòng tròn để minh họa.', false],
  ['NgaBa', 'Ngã ba sông Cầu – Cà Lồ', -470, -1240, 'Sông Cà Lồ đổ vào sông Cầu (sông Như Nguyệt).', false],
  ['VongNguyet', 'Làng Vọng Nguyệt', 858, 526, 'Làng ven bờ Nam, có đền Vọng Nguyệt và chùa Khai Nghiêm.', false],
  ['MaiDinh', 'Đất Mai Đình (bờ Bắc)', 1300, -620, 'Bờ Bắc sông Như Nguyệt, nơi quân Tống hạ trại.', false],
  ['GoXac', 'Gò Xác (theo truyền thuyết)', CAMP.x - 120, CAMP.z - 140, 'Sau trận đánh úp, xác quân Tống chất thành gò; dân gian gọi là Gò Xác. Vị trí trên sa bàn là minh họa.', false],
];
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
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', maxDist: big ? Infinity : 7000, onClick: () => { showCard(name); flyTo(A.x, A.z, 700); }, drag: { kind: 'anchor', name } });
  anchors.set(name, A);
}
const RIVERS = [['Sông Như Nguyệt (sông Cầu)', 1700, 460], ['Sông Như Nguyệt', -1000, -2450], ['Sông Cà Lồ', -1900, -1180]];
for (const [t, x, z] of RIVERS) addLabel(t, x, z, 'river', { grp: 'river', yFn: () => tideNow + 4 });
for (const k in MARK) addLabel(MARK[k].t, MARK[k].p.x, MARK[k].p.z, '', { grp: k, yFn: () => MARK[k].top.y, show: () => appMode === 'explore' || ['C02', 'C03', 'C05', 'C06', 'C12', 'C13', 'C14'].includes(SC[sceneIdx(T)].id) });
// V1.4: nhãn tên nhân vật nổi tiếng hai bên, bám theo người (ẩn khi nhân vật không có trong cảnh)
const HERO_PINS = [
  ['Thái úy Lý Thường Kiệt', 'ly', () => (NQ.visible ? NQ.position : null), () => (T >= 920 && T < 990 ? 7.6 : 4.6)],
  ['Quách Quỳ · chánh tướng Tống', 'tong', () => (LHT.visible ? LHT.position : null), () => (MOUNT.has(LHT) ? 7.4 : 4.6)],
  ['Triệu Tiết · phó tướng Tống', 'tong', () => (tgen[0].visible ? tgen[0].position : null), () => (MOUNT.has(tgen[0]) ? 9.2 : 6.0)],
  ['Miêu Lý · tướng Tống', 'tong', () => (MIEU.visible && T < 552 ? MIEU.position : null), 4.4],
  ['Hoằng Chân', 'ly', () => (boats[18].vis && T >= 822 && T < 862 ? V3(boats[18].x, boats[18].y, boats[18].z) : null), 4.2],
  ['Chiêu Văn', 'ly', () => (boats[24].vis && T >= 822 && T < 862 ? V3(boats[24].x, boats[24].y, boats[24].z) : null), 4.2],
];
for (const [text, side, get, dy] of HERO_PINS) { const L = addLabel(text, 0, 0, 'hero ' + side, { grp: 'hero', maxDist: 900 }); L.dyn = get; L.dy = dy; }
//@@ s40
const FAR_GRP = new Set(Object.keys(MARK));
function updateLabels() {
  const filmAuto = appMode === 'film' && !userCam && !povOn;
  const w = innerWidth, h = innerHeight, showA = $('ly-lbl').checked, showP = $('ly-pin').checked;
  for (const L of labels) {
    let on = L.cls === 'pin' || L.cls === 'pin done' ? showP : showA;
    if (on && L.show && !L.show()) on = false;
    if (on && L.dyn) { const p = L.dyn(); if (!p) on = false; else { L.x = p.x; L.z = p.z; L.hy = p.y + (typeof L.dy === 'function' ? L.dy() : L.dy) * EXAG * 0.62; } }
    if (on && filmAuto && L.grp !== 'pin' && L.grp !== 'hero') { const g = LABEL_SHOTS[lastShot] || []; on = g.includes(L.grp) || (g.includes('far') && FAR_GRP.has(L.grp)) || (L.grp === 'key' && g.includes('key')); }
    if (on) {
      const y = L.dyn ? L.hy : L.yFn ? L.yFn() : Math.max(hG(L.x, L.z), tideNow) + 2;
      v3.set(L.x, y, L.z);
      if (v3.distanceTo(camera.position) > (camera.position.y < 80 && L.grp !== 'pin' ? Math.min(L.maxDist, 1600) : L.maxDist)) on = false;
      v3.project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) on = false;
      if (on) { L.el.style.left = ((v3.x + 1) / 2) * w + 'px'; L.el.style.top = ((1 - v3.y) / 2) * h - 2 + 'px'; }
    }
    L.el.style.display = on ? '' : 'none';
  }
}
//@@ s41
const VIEWS = { all: [300, -300, 8200, 180, 36], nhunguyet: [300, -40, 900, 170, 26], luy: [LNN.x, LNN.z, 220, 200, 18], trai: [CAMP.x, CAMP.z, 900, 170, 30], chihuy: [CP.x, CP.z, 140, 160, 22],
  cauphao: [-714, -700, 600, 110, 26], phucbinh: [C8_IN[0] - 120, C8_IN[1] + 40, 600, 220, 28], den: [TEMPLE.x, TEMPLE.z, 260, 200, 24], ngaba: [-470, -1240, 900, 160, 30], vongnguyet: [1000, 400, 900, 200, 28] };
//@@ s42
function drawMinimap() {
  if ($('minimap').hidden || getComputedStyle($('minimap')).display === 'none') return;
  const w = 300, iw = mmImg.width, ih = mmImg.height, s0 = ((HALF - R) / (2 * HALF)), s1 = (2 * R) / (2 * HALF);
  mmx.clearRect(0, 0, w, w); mmx.save(); mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.clip();
  mmx.drawImage(mmImg, s0 * iw, s0 * ih, s1 * iw, s1 * ih, 0, 0, w, w);
  for (const A of anchors.values()) { const [px, py] = mmPx(A.x, A.z); mmx.fillStyle = A.big ? '#d8705a' : 'rgba(226,183,104,.9)'; mmx.fillRect(px - 2.5, py - 2.5, 5, 5); }
  for (const P of pins.values()) { const [px, py] = mmPx(P.x, P.z); mmx.fillStyle = '#d8705a'; mmx.beginPath(); mmx.arc(px, py, 3.5, 0, 7); mmx.fill(); }
  for (const r of RAFT) if (r.vis) { const [px, py] = mmPx(r.x, r.z); mmx.fillStyle = '#c0392b'; mmx.fillRect(px - 2, py - 2, 4, 4); }
  if (T >= 376 && T < 1000) { const [px, py] = mmPx(CAMP.x, CAMP.z); mmx.strokeStyle = '#c0392b'; mmx.lineWidth = 2; mmx.strokeRect(px - 11, py - 9, 22, 18); }
  mmx.strokeStyle = 'rgba(240,213,138,.9)'; mmx.lineWidth = 1.6; for (let sg = 0; sg < INST.luy.length; sg++) { mmx.beginPath(); INST.luy[sg].forEach((p, k) => { const [px, py] = mmPx(p[0], p[1]); k ? mmx.lineTo(px, py) : mmx.moveTo(px, py); }); mmx.stroke(); }
  for (const b of boats) if (b.vis) { const [px, py] = mmPx(b.x, b.z); mmx.fillStyle = '#f0d58a'; mmx.fillRect(px - 1.5, py - 1.5, 3, 3); }
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
  if (W.on) { placeAvatarAt(x, z); return; }
  flyTo(x, z, clamp(camera.position.distanceTo(controls.target), 300, 6000));
});
$('mmLeg').textContent = 'Bấm để bay tới · vạch vàng: phòng tuyến · đỏ: trại, bè quân Tống · chấm vàng: thuyền quân Lý';

//@@ s43
function renderList() {
  $('n-pins').textContent = pins.size; $('n-moves').textContent = moves.size; $('n-all').textContent = pins.size + moves.size;
  const list = $('list'); list.replaceChildren(); const who = (id) => (id && id === myId ? 'Anh' : names[id] || 'Ai đó');
  if (tab === 'pins') {
    const arr = [...pins.entries()].sort((a, b) => (a[1].doc.status === 'xong') - (b[1].doc.status === 'xong') || String(b[1].doc.created).localeCompare(String(a[1].doc.created)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa có ghi chú. Chọn “＋ Ghi chú” rồi bấm lên sa bàn tại chỗ cần góp ý: vị trí lũy, doanh trại, cầu phao, hình dạng bờ sông, sai lệch sử liệu…'; list.append(e); }
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
  const out = { du_an: 'Sa bàn Như Nguyệt 1077', xuat_luc: nowIso(), goc_toa_do: [META.lat0, META.lon0],
    ghi_chu: [...pins.values()].map((P) => ({ loai: CAT[P.doc.cat], tieu_de: P.doc.title, noi_dung: P.doc.text, trang_thai: P.doc.status, canh: P.doc.canh, lat: P.doc.lat, lon: P.doc.lon, x: P.doc.x, z: P.doc.z })),
    moc_da_doi: [...moves.values()].map((d) => ({ moc: d.name, ten: d.label, tu: [d.from_lat, d.from_lon], den: [d.lat, d.lon], do_dich_m: Math.round(Math.hypot(d.x - d.from_x, d.z - d.from_z)) })) };
  const txt = JSON.stringify(out, null, 1);
  try { await navigator.clipboard.writeText(txt); $('export').textContent = 'Đã sao chép ✓'; setTimeout(() => ($('export').textContent = 'Sao chép dữ liệu review (JSON)'), 2000); }
  catch (e) { const ta = document.createElement('textarea'); ta.id = 'copybox'; ta.value = txt; ta.readOnly = true; $('list').prepend(ta); ta.focus(); ta.select(); }
};
$('revbtn').onclick = () => { const open = $('review').hidden; $('review').hidden = !open; $('revbtn').setAttribute('aria-pressed', open); if (open) $('info').hidden = true; };
$('revx').onclick = () => { $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); };

//@@ s44
function setWalk(on) {
  W.on = on; document.body.classList.toggle('walking', on);
  $('bwalk').classList.toggle('on', on); $('bwalk').textContent = on ? '🚶 Đang đi bộ · thoát' : '🚶 Xuống đi bộ';
  $('joy').hidden = !on; $('runbtn').hidden = !on; $('walkhelp').hidden = !on; document.querySelector('#explorebar .help').hidden = on;
  if (on) {
    setUiMode('view'); flyA = null; setAuto(false); controls.enablePan = false;
    let x = controls.target.x, z = controls.target.z;
    if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { x = LNN.x - LNN.rx * 20; z = LNN.z - LNN.rz * 20; }
    W.boat = WET(x, z);                                            // đứng trên sông → ngồi thuyền chèo
    const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z; W.yaw = Math.atan2(-dx, -dz);
    placeAvatarAt(x, z); controls.target.copy(W.pos).add(V3(0, 2.4, 0));
    camera.position.copy(controls.target).add(V3(-Math.sin(W.yaw) * 9, 2.2, -Math.cos(W.yaw) * 9)); setPovWalk();
  } else { W.keys = {}; W.joy.x = W.joy.y = 0; controls.enablePan = true; controls.minDistance = 4; controls.maxDistance = 40000; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.47; flyTo(W.pos.x, W.pos.z, 500); }
}
//@@ s45
function drawAvatar() {
  const inBoat = W.on && W.boat;
  if (inBoat) {
    tmpE.set(0, W.yaw, Math.sin(performance.now() / 900) * 0.03, 'YXZ'); _avQ.setFromEuler(tmpE); tmpS.setScalar(BOAT_S);
    boatInst.setMatrixAt(AV_BOAT, tmpM.compose(W.pos, _avQ, tmpS));
  } else boatInst.setMatrixAt(AV_BOAT, _hideM);
  boatInst.instanceMatrix.needsUpdate = true;
  if (!W.on || W.fp) return;
  const kind = $('role').value, now = performance.now() / 1000;
  if (inBoat) {                                                     // ngồi giữa thuyền chèo; dừng thì giữ chèo
    const p = new THREE.Vector3(-0.2 * BOAT_S, BOAT_DECK * BOAT_S, 0.3).applyQuaternion(_avQ).add(W.pos);
    if (kind === 'dan-binh') nvPut('dan-binh', 'cheo', W.moving ? now * (W.runNow ? 1.3 : 0.9) : 0.35, 0, p, W.yaw, EXAG * 0.95, 'cheo', 0, 0);
    else nvPut(kind, 'thu', now, 0, p.setX(p.x), W.yaw, EXAG * 0.95, 'dao', 0, 0);
    return;
  }
  const clip = W.moving ? (W.runNow ? 'chay' : 'di') : 'dung';
  nvPut(kind, clip, now, 0, W.pos, W.yaw, EXAG, kind === 'dan-binh' ? 'giao' : 'dao', 0, 0);
}
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
const POV_VAI = [
  ['Lý Thường Kiệt', () => (NQ.visible ? eyeOf(NQ, 1.62) : null)],
  ['Cung thủ trên lũy Như Nguyệt', () => (archers[3].visible ? eyeOf(archers[3], 1.55) : null)],
  ['Dân binh đắp lũy', () => (workers[0].visible ? eyeOf(workers[0], 1.55) : null)],
  ['Quân Lý trên thuyền vượt sông (chương 12)', () => (boats[34].vis ? boatEye(boats[34], 2) : null)],
  ['Quân Tống trên bè (chương 9)', () => { const r = RAFT[4]; if (!r.vis || T < 600) return null; return { p: V3(r.x, r.y + 0.45 + 1.62 * EXAG, r.z), yaw: r.yaw }; }],
  ['Tướng Tống (Triệu Tiết)', () => (LHT.visible ? eyeOf(LHT, 1.66) : null)],
];
const POV_DD = [['Trên lũy Như Nguyệt', LNN.x - LNN.rx * 1, LNN.z - LNN.rz * 1, 3.6], ['Bờ Bắc trước doanh trại Tống', CAMP.x + 40, CAMP.z + CAMP.d / 2 + 40, 2.6], ['Giữa dòng Như Nguyệt', 300, -60, -1], ['Sân đền Trương Hống – Trương Hát', TEMPLE.x + 12, TEMPLE.z + 14, 2.2], ['Đầu cầu phao (bờ Nam)', BR_B[0] - 30, BR_B[1], 2.6]];
//@@ s47
function povTick() {
  let E = null;
  if (POV.dd >= 0) { const [, x, z, h] = POV_DD[POV.dd]; const y = h < 0 ? tideNow + 1.6 : Math.max(hG(x, z), tideNow) + h; E = { p: V3(x, y, z), yaw: Math.atan2(300 - x, -40 - z) }; if (Math.hypot(300 - x, -40 - z) < 60) E.yaw = Math.PI; }
  else E = POV_VAI[POV.sel][1]();
  $('povmsg').textContent = E ? 'Kéo màn hình để quay đầu nhìn quanh · phim vẫn chạy theo lời bình' : 'Nhân vật này không có trong cảnh hiện tại · đang xem góc máy của phim';
  if (!E) { POV.has = false; return false; }
  if (POV.has) POV.eye.lerp(E.p, 0.35); else POV.eye.copy(E.p); POV.has = true;
  const yw = E.yaw + POV.yaw, cp = Math.cos(POV.pitch);
  camera.position.copy(POV.eye); camLook.set(POV.eye.x + Math.sin(yw) * cp * 5, POV.eye.y + Math.sin(POV.pitch) * 5, POV.eye.z + Math.cos(yw) * cp * 5);
  camera.lookAt(camLook); if (camera.fov !== 60) { camera.fov = 60; camera.updateProjectionMatrix(); }
  return true;
}

//@@ s48
const BATTLE = [
  ['Thời gian', 'Đầu năm 1077 (tháng Giêng đến khoảng tháng Ba âm lịch năm Đinh Tỵ)'],
  ['Địa điểm', 'Phòng tuyến sông Như Nguyệt (sông Cầu), đoạn qua Yên Phong – Bắc Ninh ngày nay; trọng điểm ở các bến Như Nguyệt, Thị Cầu'],
  ['Chỉ huy Đại Việt', 'Thái úy Lý Thường Kiệt; thủy quân: hoàng tử Hoằng Chân, Chiêu Văn; Lý Kế Nguyên chặn thủy binh Tống ở vùng biển Đông Bắc'],
  ['Chỉ huy nhà Tống', 'Quách Quỳ (chánh tướng), Triệu Tiết (phó tướng); các tướng Miêu Lý, Vương Mẫn, Yên Đạt…; thủy binh do Hòa Mâu chỉ huy'],
  ['Lực lượng', 'Quân Tống khoảng 10 vạn quân, 1 vạn ngựa, 20 vạn dân phu (theo sách giáo khoa); quân Lý ước khoảng 6 vạn trên phòng tuyến, 400 chiến thuyền (các nguồn khác nhau)'],
  ['Kế sách', 'Đánh trước để phá thế (1075–1076); dựng phòng tuyến chặn giặc trên sông; phòng ngự tích cực, chờ thời cơ phản công; chủ động giảng hòa để kết thúc chiến tranh'],
  ['Kết quả', 'Hai lần vượt sông của quân Tống đều bị đánh bật; trận phản công đánh tan doanh trại Triệu Tiết; quân Tống chết quá nửa, Quách Quỳ chấp nhận giảng hòa, rút quân về nước'],
  ['Ý nghĩa', 'Bảo vệ vững chắc nền độc lập, chủ quyền Đại Việt; là trận phòng ngự – phản công tiêu biểu trong lịch sử quân sự Việt Nam'],
];
const SCENE_FACTS = [
  ['Sông Như Nguyệt là tên xưa của đoạn sông Cầu chảy qua Bắc Ninh.', 'Đây là tuyến sông án ngữ đường từ biên giới phía Bắc về Thăng Long.'],
  ['Nhà Tống cho tích trữ lương thảo, khí giới ở các châu Ung, Khâm, Liêm sát biên giới Đại Việt để chuẩn bị xâm lược.'],
  ['Cuối năm 1075, quân Lý tiến công sang đất Tống: thủy quân đánh Khâm Châu, Liêm Châu; cánh quân của Tông Đản vây Ung Châu.', 'Đầu năm 1076, quân ta hạ thành Ung Châu, phá các căn cứ chuẩn bị xâm lược rồi rút về nước.'],
  ['Lý Thường Kiệt cho xây phòng tuyến dọc bờ Nam sông Như Nguyệt: đắp lũy đất, cắm cọc tre, dựng rào.', 'Các trại quân chốt ở những bến sông quan trọng; thủy quân sẵn sàng tiếp ứng.'],
  ['Thủy binh Tống theo đường biển vào tiếp ứng bị thủy quân của Lý Kế Nguyên chặn đánh ở vùng biển Đông Bắc.', 'Các tù trưởng miền biên giới đánh chặn, tiêu hao quân Tống trên đường tiến.'],
  ['Đầu năm 1077, quân Tống do Quách Quỳ, Triệu Tiết chỉ huy kéo đến bờ Bắc sông Như Nguyệt.', 'Quách Quỳ đóng đại doanh ở phía Đông (đối diện Thị Cầu); Triệu Tiết đóng ở Mai Đình, đối diện bến Như Nguyệt.'],
  ['Không có thủy binh hỗ trợ, quân Tống phải đóng bè, bắc cầu phao để tìm cách vượt sông.'],
  ['Lần thứ nhất, khoảng 2 000 quân Tống vượt sông bằng cầu phao, chọc thủng một đoạn phòng tuyến.', 'Quân ta phục kích, đánh tan cánh quân này; cầu phao bị phá, quân Tống không rút về được.'],
  ['Quân Tống đóng nhiều bè lớn vượt sông lần nữa, bị quân ta trên lũy và thủy quân đánh bật trở lại.', 'Từ đó Quách Quỳ chuyển sang phòng ngự, cấm bàn chuyện đánh.'],
  ['Quân Tống đóng lâu ở bờ Bắc, khí hậu khắc nghiệt, bệnh dịch, thiếu lương; tinh thần ngày càng sa sút.'],
  ['Tương truyền bài thơ "Nam quốc sơn hà" vang lên từ đền thờ Trương Hống, Trương Hát bên sông.', 'Bài thơ được xem là một bản tuyên ngôn về chủ quyền của Đại Việt.'],
  ['Hoằng Chân, Chiêu Văn đem thủy quân đánh vào đại doanh Quách Quỳ để nghi binh; hai ông hy sinh.', 'Lý Thường Kiệt dẫn quân chủ lực vượt sông đánh úp doanh trại Triệu Tiết; quân Tống tan vỡ, chết quá nửa.'],
  ['Lý Thường Kiệt chủ động đề nghị giảng hòa; Quách Quỳ chấp nhận, rút quân về nước.', 'Cuộc kháng chiến chống Tống (1075–1077) kết thúc thắng lợi.'],
  ['Phòng tuyến Như Nguyệt thể hiện nghệ thuật quân sự đặc sắc: chủ động, sáng tạo, kết hợp phòng ngự và phản công.', 'Nhiều di tích dọc sông Cầu ngày nay còn lưu dấu trận đánh.'],
];
function fillDocs() {
  const i = appMode === 'explore' ? exploreI : sceneIdx(T), sc = SC[i], el = $('docsbody'); el.replaceChildren();
  const add = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; el.append(e); return e; };
  add('div', `Chương ${i + 1}/${NSC}`, 'eyebrow'); add('h2', sc.title);
  add('h4', 'Sự kiện chính'); const ul = add('ul'); for (const f of SCENE_FACTS[i] || []) { const li = document.createElement('li'); li.textContent = f; ul.append(li); }
  add('h4', 'Diễn biến'); const paras = []; let cur = ''; for (const s of sc.subs) { cur += (cur ? ' ' : '') + s[2]; if (/[.!?…:]$/.test(s[2])) { paras.push(cur); cur = ''; } } if (cur) paras.push(cur);
  for (const p of paras) add('p', p);
  add('h4', 'Số liệu trận Như Nguyệt 1077'); const dl = add('dl', undefined, 'facts');
  for (const [k, v] of BATTLE) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
}
$('bdocs').onclick = () => { const open = $('docs').hidden; if (open) fillDocs(); $('docs').hidden = !open; $('bdocs').classList.toggle('on', open); if (open) $('info').hidden = true; };
$('docsx').onclick = () => { $('docs').hidden = true; $('bdocs').classList.remove('on'); };
$('barr').onclick = () => { const c = $('ly-arr'); c.checked = !c.checked; $('barr').classList.toggle('on', c.checked); };
$('ly-arr').onchange = () => $('barr').classList.toggle('on', $('ly-arr').checked);
$('ly-mm').onchange = (e) => { $('minimap').hidden = !e.target.checked; };
$('ly-co').onchange = (e) => { coOn = e.target.checked; };
$('ly-mc').onchange = (e) => { if (appMode === 'explore') setSection(e.target.checked); };
for (const [id, key] of [['ly-cay', 'cay'], ['ly-nha', 'nha']]) $(id).onchange = (e) => { for (const m of LAYER[key]) m.visible = e.target.checked; };
//@@ s49
function amPlan(i, u) {           // mức âm nền theo chương i (0..13) và tiến độ u (0..1)
  switch (i) {
    case 0: return { song: 0.4, chim: 0.35 };                                              // dòng Như Nguyệt
    case 1: return { song: 0.1, trong: u > 0.7 ? 0.2 : 0 };                                 // Tống mưu đồ
    case 2: return { hanhquan: 0.45, trong: 0.35, buoc: 0.3 };                              // tiên phát chế nhân
    case 3: return { chim: 0.3, song: 0.25, buoc: 0.25 };                                   // dựng phòng tuyến
    case 4: return { song: 0.35, trong: 0.2 };                                              // chặn thủy binh
    case 5: return { hanhquan: 0.55, buoc: 0.5, trong: 0.25 };                              // quân Tống kéo đến
    case 6: return { song: 0.45, chim: 0.15, buoc: 0.12 };                                  // hai bờ đối mặt
    case 7: return { song: 0.3, buoc: u < 0.4 ? 0.4 : 0.15, hetxung: u > 0.42 && u < 0.7 ? 0.5 : 0, danhkiem: u > 0.45 && u < 0.75 ? 0.45 : 0, chientruong: u > 0.4 ? 0.35 : 0, thaochay: u > 0.7 ? 0.35 : 0 };
    case 8: return { song: 0.4, trong: 0.35, chientruong: u > 0.2 && u < 0.85 ? 0.45 : 0.1, danhkiem: u > 0.35 && u < 0.8 ? 0.35 : 0, hetxung: u > 0.3 && u < 0.5 ? 0.35 : 0 };
    case 9: return { song: 0.3, chim: 0.08 };                                               // giằng co, dịch bệnh
    case 10: return { song: 0.25, trong: u > 0.3 && u < 0.7 ? 0.15 : 0 };                   // đêm thơ thần
    case 11: return { song: 0.25, trong: u < 0.4 ? 0.4 : 0.2, hetxung: u > 0.42 && u < 0.6 ? 0.6 : 0.15, chientruong: u > 0.4 ? 0.5 : 0, danhkiem: u > 0.45 ? 0.45 : 0, noido: u > 0.4 ? 0.3 : 0, thaochay: u > 0.55 ? 0.4 : 0 };
    case 12: return { song: 0.35, chim: 0.25, buoc: 0.3 };                                  // giảng hòa, Tống rút
    case 13: return { chim: 0.4, song: 0.35 };                                              // ý nghĩa
  }
  return {};
}
const AM_LAP = [[7, 0.3, 0.6, 'cung', 0.35, 0.4, 1.4], [7, 0.3, 0.6, 'muiten', 0.3, 0.6, 1.8], [7, 0.45, 0.75, 'chem', 0.35, 0.5, 1.6], [8, 0.2, 0.85, 'cung', 0.4, 0.25, 1.0], [8, 0.2, 0.85, 'muiten', 0.35, 0.4, 1.4],
  [8, 0.35, 0.8, 'chem', 0.3, 0.6, 1.8], [11, 0.42, 0.75, 'muiten', 0.35, 0.3, 1.2], [11, 0.5, 0.95, 'chem', 0.4, 0.4, 1.4]];
const AM_RAW = {};
const NHAC = ['binh', 'hung', 'dem', 'chien'];
const NHAC_CH = ['binh', 'dem', 'hung', 'binh', 'dem', 'hung', 'dem', 'chien', 'chien', 'dem', 'binh', 'chien', 'binh', 'hung'];   // bản nhạc theo từng chương
const MUS = { g: {}, out: null };
async function amPrefetch() { await Promise.all([...AM_BED, ...AM_ONE, ...NHAC.map((n) => 'nhac-' + n)].map(async (n) => { try { const r = await fetch('am/' + n + '.mp3'); if (r.ok) AM_RAW[n] = await r.arrayBuffer(); } catch (e) { console.warn('âm thanh', n, e); } })); }
async function amLoad() {
  await Promise.all([...AM_BED, ...AM_ONE].map(async (n) => { try { const ab = AM_RAW[n] ? AM_RAW[n].slice(0) : await (await fetch('am/' + n + '.mp3')).arrayBuffer(); AM.buf[n] = await AM.ctx.decodeAudioData(ab); } catch (e) { console.warn('âm thanh', n, e); } }));
  for (const n of AM_BED) { if (!AM.buf[n]) continue; const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.sfx); s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g; }
  MUS.out = AM.ctx.createGain(); MUS.out.gain.value = 0; MUS.out.connect(AM.out);
  await Promise.all(NHAC.map(async (n) => { try { const ab = AM_RAW['nhac-' + n] ? AM_RAW['nhac-' + n].slice(0) : await (await fetch('am/nhac-' + n + '.mp3')).arrayBuffer(); const b = await AM.ctx.decodeAudioData(ab);
    const s = AM.ctx.createBufferSource(); s.buffer = b; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(MUS.out); s.start(0); MUS.g[n] = g; } catch (e) { console.warn('nhạc nền', n, e); } }));
  AM.ready = true;
}
//@@ s50
function amTick(dt) {
  if (!AM.ready || !AM.on) { AM.prevT = T; return; }
  const live = (appMode === 'film' && playing) || appMode === 'explore', i = sceneIdx(T), sc = SC[i], u = clamp((T - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const plan = amPlan(i, u), k = live ? 1 : 0.2, now = AM.ctx.currentTime;
  for (const n in AM.beds) AM.beds[n].gain.setTargetAtTime((plan[n] || 0) * k * (W.on ? 0.6 : 1), now, 0.8);
  if (live && T > AM.prevT && T - AM.prevT < 1) {
    if (AM.prevT < 566 && T >= 566) amShot('daroi', 0.6 * distVol(BRV.x, BRV.z));                                 // cầu phao bị phá
    for (const r of RAFT) if (r.sinkT < 1e8 && AM.prevT < r.sinkT && T >= r.sinkT) amShot('tauchim', 0.6 * distVol(r.x, r.z));   // bè vỡ, chìm
    const tt = performance.now() / 1000;
    AM_LAP.forEach(([si, u0, u1, n, v, a, b], j) => { if (si !== i || u < u0 || u > u1) return; if (!(j in AM.next)) AM.next[j] = tt + Math.random() * a; if (tt >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = tt + a + Math.random() * (b - a); } });
  }
  AM.prevT = T;
}
// ------------------------------------------------------------------ nhạc nền tổng hợp (ngũ cung, theo tâm trạng từng chương — thư mục âm thanh không có bản nhạc)
const MOOD = [
  { r: 146.8, sc: [0, 3, 5, 7, 10], tp: 0.55, pad: 0.5, pl: 0.32, dr: 0 }, { r: 130.8, sc: [0, 1, 5, 7, 8], tp: 0.4, pad: 0.6, pl: 0.22, dr: 0.15 },
  { r: 146.8, sc: [0, 2, 5, 7, 9], tp: 1.2, pad: 0.4, pl: 0.32, dr: 0.45 }, { r: 164.8, sc: [0, 3, 5, 7, 10], tp: 0.7, pad: 0.45, pl: 0.3, dr: 0.1 },
  { r: 174.6, sc: [0, 2, 5, 7, 9], tp: 1.0, pad: 0.35, pl: 0.36, dr: 0.2 }, { r: 146.8, sc: [0, 2, 5, 7, 9], tp: 0.6, pad: 0.45, pl: 0.3, dr: 0 },
  { r: 123.5, sc: [0, 1, 5, 7, 8], tp: 0.8, pad: 0.6, pl: 0.2, dr: 0.5 }, { r: 130.8, sc: [0, 3, 5, 7, 10], tp: 1.6, pad: 0.4, pl: 0.28, dr: 0.6 },
  { r: 123.5, sc: [0, 1, 5, 6, 10], tp: 0.5, pad: 0.6, pl: 0.24, dr: 0.25 }, { r: 130.8, sc: [0, 3, 5, 7, 10], tp: 1.8, pad: 0.55, pl: 0.28, dr: 0.7 },
  { r: 146.8, sc: [0, 3, 5, 7, 10], tp: 2.2, pad: 0.5, pl: 0.22, dr: 0.85 }, { r: 138.6, sc: [0, 3, 5, 7, 10], tp: 2.0, pad: 0.55, pl: 0.2, dr: 0.75 },
  { r: 164.8, sc: [0, 2, 4, 7, 9], tp: 0.6, pad: 0.5, pl: 0.38, dr: 0.1 }, { r: 174.6, sc: [0, 2, 4, 7, 9], tp: 0.8, pad: 0.55, pl: 0.42, dr: 0.2 },
];
const MU = {
  g: null, pad: [], padG: null, lp: null, dly: null, nextT: 0, step: 0, mood: MOOD[0],
  init() {
    const C = AM.ctx; this.g = C.createGain(); this.g.gain.value = 0; this.g.connect(AM.out);
    this.dly = C.createDelay(1.5); this.dly.delayTime.value = 0.42; const fb = C.createGain(); fb.gain.value = 0.32; const dg = C.createGain(); dg.gain.value = 0.35;
    this.dly.connect(fb).connect(this.dly); this.dly.connect(dg).connect(this.g);
    this.lp = C.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 650; this.padG = C.createGain(); this.padG.gain.value = 0; this.lp.connect(this.padG).connect(this.g);
    for (const [m, det, type] of [[1, -6, 'sawtooth'], [1.5, 5, 'sawtooth'], [2, 3, 'triangle'], [0.5, 0, 'sine']]) { const o = C.createOscillator(); o.type = type; o.frequency.value = MOOD[0].r * m; o.detune.value = det; const gg = C.createGain(); gg.gain.value = type === 'sine' ? 0.35 : 0.12; o.connect(gg).connect(this.lp); o.start(); this.pad.push([o, m]); }
    this.nextT = C.currentTime + 0.3;
  },
  note(t, f, v, dur) { const C = AM.ctx, o = C.createOscillator(), g = C.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(this.g); g.connect(this.dly); o.start(t); o.stop(t + dur + 0.05); },
  drum(t, v) { const C = AM.ctx, o = C.createOscillator(), g = C.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.35); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g).connect(this.g); o.start(t); o.stop(t + 0.6); },
  tick() {
    if (!this.g) return;
    if (Object.keys(MUS.g).length) {                       // V1.4: phát nhạc nền thu sẵn, đổi bản theo chương (chuyển mượt 2,5 s)
      const C = AM.ctx, now = C.currentTime, live = AM.on && $('ly-nhac').checked && ((appMode === 'film' && playing) || appMode === 'explore');
      MUS.out.gain.setTargetAtTime(live ? (W.on ? 0.22 : 0.34) : 0, now, live ? 1.2 : 0.5);
      const want = NHAC_CH[sceneIdx(T)] || 'binh';
      for (const n in MUS.g) MUS.g[n].gain.setTargetAtTime(n === want ? 1 : 0, now, 2.5);
      this.g.gain.setTargetAtTime(0, now, 0.5); return;
    }
    const C = AM.ctx, now = C.currentTime, live = AM.on && $('ly-nhac').checked && ((appMode === 'film' && playing) || appMode === 'explore');
    const i = sceneIdx(T), m = MOOD[i] || MOOD[0]; this.mood = m;
    this.g.gain.setTargetAtTime(live ? 0.2 : 0, now, live ? 1.5 : 0.6);
    this.padG.gain.setTargetAtTime(m.pad * 0.5, now, 2);
    for (const [o, mul] of this.pad) o.frequency.setTargetAtTime(m.r * mul * 0.5, now, 1.5);
    if (!live) { this.nextT = now + 0.2; return; }
    while (this.nextT < now + 0.25) {
      const t = this.nextT, beat = 1 / Math.max(0.3, m.tp);
      if (Math.random() < 0.7) { const deg = m.sc[Math.floor(Math.random() * m.sc.length)], oct = Math.random() < 0.3 ? 2 : 1; this.note(t, m.r * oct * Math.pow(2, deg / 12), m.pl * (0.5 + Math.random() * 0.5), 1.4 + Math.random()); }
      if (m.dr > 0 && this.step % 2 === 0) this.drum(t, m.dr * (this.step % 8 === 0 ? 0.9 : 0.55));
      this.step++; this.nextT += beat * (0.85 + Math.random() * 0.3);
    }
  },
};
//@@ s51
function updSub(force) {
  const el = $('sub'), sc = SC[sceneIdx(T)]; let txt = '', key = '';
  if (appMode === 'film') sc.subs.forEach((s, k) => { if (T >= s[0] && T < s[1]) { txt = s[2]; key = sc.id + ':' + k; } });
  if (key && key !== lastLine) { lastLine = key; speak(txt); }
  const on = appMode === 'film' && $('ly-sub').checked && $('poem').hidden;      // khi bài thơ hiện giữa màn hình thì ẩn phụ đề để không chồng chữ
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt || force) el.textContent = txt; el.hidden = !txt;
}

//@@ s52
const ROUTES = [routeLy1, routeLy2, routeTong, routeTongS, routeQQ, routeNavy];
function routeOn(m, on, p) { m.visible = on; if (on) m.material.uniforms.uP.value = p; }
const BIG_ROUTES = new Set([routeLy1, routeLy2, routeTong, routeTongS, routeQQ, routeNavy]);
function update(dt) {
  if (appMode === 'film' && playing) { T += dt * speed; if (T >= DUR) { T = DUR - 0.01; setPlaying(false); } }
  if (appMode === 'explore') { const sc = SC[exploreI]; T += dt; if (T >= sc.t1 || T < sc.t0) T = sc.t0 + 0.01; }
  const t = T;
  U.time.value += dt;
  const level = appMode === 'explore' && !tideAuto ? +$('tide').value : tideAt(t);
  tideNow = level; U.level.value = level; water.position.y = level;
  if (tideAuto) $('tide').value = level.toFixed(2);
  U.wetTop.value = level + 0.4;
  applySky(t, appMode === 'explore' ? forcedSky : '');
  scene.fog.density /= 1 + Math.max(0, camera.position.y - 600) / 900;      // nhìn từ trên cao: bớt sương để thấy mốc xa
  if (W.on) walkTick(dt);
  nvBegin(); updateRiver(t, level); updateCamp(t); updateLand(t); drawAvatar(); nvEnd();
  const nvOn = $('ly-nv').checked;
  for (const m of NV_IMS) if (!nvOn) m.visible = false;
  for (const k in WP) WP[k].visible = nvOn || k === 'co'; for (const m of LAYER.nv) m.visible = nvOn; coFlag.visible = coFlagT.visible = cpFlag.visible = coOn; campFlag.visible = campFlag.visible && coOn;
  updateSmoke(t); updateArrows(t); updateFire(t); updateCities(t);
  const i = sceneIdx(t), scn = SC[i], shot = shotAt(t);
  // phòng tuyến: có sẵn ở chương 1 (mùa xuân 1077), chưa có ở chương 2–3, dựng dần ở chương 4
  let grow = t < 60 ? 1 : t < 212 ? 0 : sstep(214, 292, t);
  const ptOn = $('ly-pt').checked;
  if (appMode === 'explore' && $('ly-mc').checked) grow = 1;
  if (ptOn) grow = 1;
  if (!$('ly-coc').checked) grow = 0;
  palMesh.count = Math.floor(NPAL * grow); spkMesh.count = Math.floor(NSPK * grow); railMesh.count = Math.floor(railMesh.userData.n * grow);
  bambooMat.emissiveIntensity = ptOn || (appMode === 'film' && !userCam && shot.id === 'C04-F') ? 0.55 : 0; stakeMat.emissive.set(0xffb050); stakeMat.emissiveIntensity = bambooMat.emissiveIntensity;
  U.analysis.value += ((ptOn ? 1 : 0) - U.analysis.value) * Math.min(1, dt * 3);
  if (appMode === 'film') { const want = SECTION_SHOTS.has(shot.id) && !userCam; if (want !== sectionShot) { sectionShot = want; setSection(want); } }
  // mũi tên, mốc hướng
  const arrOn = $('ly-arr').checked && !W.on, ex = appMode === 'explore';
  routeOn(routeLy1, arrOn && ((t >= 132 && t < 210) || (ex && i === 2)), ex ? 1 : sstep(134, 160, t));
  routeOn(routeLy2, arrOn && ((t >= 132 && t < 210) || (ex && i === 2)), ex ? 1 : sstep(138, 168, t));
  routeOn(routeTongS, arrOn && ((t >= 296 && t < 340) || (ex && i === 4)), ex ? 1 : sstep(297, 312, t));
  routeOn(routeTong, arrOn && ((t >= 322 && t < 380) || (ex && (i === 4 || i === 5))), ex ? 1 : sstep(324, 340, t));
  routeOn(routeQQ, arrOn && ((t >= 326 && t < 380) || (ex && i === 5)), ex ? 1 : sstep(328, 344, t));
  routeOn(routeNavy, arrOn && ((t >= 822 && t < 860) || (ex && i === 11)), ex ? 1 : sstep(824, 846, t));
  for (const m of BIG_ROUTES) if (m.visible && camera.position.y < 700) m.visible = false;      // tuyến đường lớn chỉ hiện khi nhìn từ cao
  const far = camera.position.y > 60;
  attackArrows.forEach((m, k) => routeOn(m, arrOn && far && ((t >= 506 && t < 520 && k === 0) || (t >= 540 && t < 562 && k > 0) || (ex && i === 7)), ex ? 1 : k === 0 ? sstep(506, 514, t) : sstep(540, 552, t)));
  attack12.forEach((m) => routeOn(m, arrOn && far && ((t >= 862 && t < 884) || (ex && i === 11)), ex ? 1 : sstep(862, 874, t)));
  raftArrows.forEach((m) => routeOn(m, arrOn && far && ((t >= 598 && t < 626) || (ex && i === 8)), ex ? 1 : sstep(600, 612, t)));
  const pk = t >= 74 && t < 130 ? (t < 102 ? 'ung' : 'liem') : t >= 162 && t < 180 ? 'ung' : t >= 308 && t < 326 ? 'bien2' : t >= 834 && t < 850 ? 'quachquy' : null;
  pulse.visible = !!pk; if (pk) { pulse.position.x = MARK[pk].p.x; pulse.position.z = MARK[pk].p.z; pulse.material.opacity = 0.6 * (0.5 + 0.5 * Math.sin(t * 3)); pulse.scale.setScalar(1 + ((t * 0.6) % 1) * 2.5); }
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
  if (XL.on) { XL.flush(); nvEnd(); if (!$('ly-nv').checked) for (const m of NV_IMS) m.visible = false; }     // nhân vật lai: người gần máy quay vẽ bằng xương
  fill.intensity = isNight(t) ? 0.6 : 2.2;
  const under = camera.position.y < level - 0.05 && inR && !sectionMesh.visible;
  $('underwater').style.opacity = under ? 1 : 0; if (under) { scene.fog.color.set(0x2c3a30); scene.fog.density = 0.02; }
  if (appMode === 'film' && playing && !userCam) { const ds = Math.min(t - scn.t0, scn.t1 - t); veil.style.opacity = ds < 0.45 ? 1 - ds / 0.45 : 0; } else veil.style.opacity = 0;
  const cc = appMode === 'film' && !userCam && camera.position.distanceTo(camLook) < 260; if (cc !== document.body.classList.contains('cancanh')) document.body.classList.toggle('cancanh', cc);
  // chữ trên giao diện
  if (scn.id !== lastScene) { lastScene = scn.id; $('stitle').textContent = `${scn.id} · ${scn.title}`; if (appMode === 'film') $('sdate').textContent = `Chương ${i + 1}/${NSC} · ${scn.title}`; $('slist').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); if (!$('docs').hidden) fillDocs(); }
  if (shot.id !== lastShot) { lastShot = shot.id; $('snote').textContent = `${shot.id} · ${shot.size} · ${shot.desc}`; $('snote').hidden = false; }
  $('stime').textContent = `${fmtT(t)} / ${fmtT(DUR)}`; if (!seeking) $('seek').value = Math.round((t / DUR) * 1000);
  updSub();
  const cd = appMode === 'film' ? CARDS.find((c) => t >= c[0] && t < c[1]) : null;
  if (cd) { $('cardK').textContent = cd[2]; $('cardT').textContent = cd[3]; $('cardS').textContent = cd[4]; card.style.opacity = sstep(cd[0], cd[0] + 0.8, t) * (1 - sstep(cd[1] - 1, cd[1], t)); } else card.style.opacity = 0;
  updatePoem(t); updateTL(t);
  updateLabels(); amTick(dt); MU.tick();
  fpsN++; const nw = performance.now(); if (nw - fpsT > 1000) { $('fps').textContent = Math.round((fpsN * 1000) / (nw - fpsT)) + ' fps'; fpsN = 0; fpsT = nw; drawMinimap(); }
  else if ((fpsN & 7) === 0) drawMinimap();
}
// ảnh Kinh thành Thăng Long (data/kinh-thanh.jpg) khi máy quay hướng về Thăng Long
let tlOk = false; { const im = $('tlimg'); im.onload = () => { tlOk = true; }; im.onerror = () => { tlOk = false; }; im.src = PU('data/kinh-thanh.jpg'); }
function updateTL(t) {
  const sid = appMode === 'film' && !userCam ? shotAt(t).id : '';
  const on = tlOk && (sid === 'C02-D' || sid === 'C03-A' && t < 136 || (appMode === 'explore' && camera.position.distanceTo(MARK.thanglong.p) < 6000));
  const el = $('tlcard'); el.hidden = !on;
}
// bài thơ "Nam quốc sơn hà" (nguyên văn Hán Việt, thế kỷ XI) hiện từng câu ở chương 11
const POEM = [[766, 'Nam quốc sơn hà Nam đế cư,'], [769.5, 'Tiệt nhiên định phận tại thiên thư.'], [773, 'Như hà nghịch lỗ lai xâm phạm,'], [776.5, 'Nhữ đẳng hành khan thủ bại hư.']];      // V1.3: hiện xong trước cảnh họp bàn (C11-D), không chồng lên nhau
function updatePoem(t) {
  const el = $('poem'); const on = appMode === 'film' && t >= 765 && t < 787;
  el.hidden = !on; if (!on) return;
  el.style.opacity = sstep(765, 766.5, t) * (1 - sstep(785.4, 786.8, t));
  [...el.querySelectorAll('p')].forEach((p, k) => { p.style.opacity = sstep(POEM[k][0], POEM[k][0] + 1.2, t); });
  $('poemy').style.opacity = sstep(779.5, 781, t);
}
// ------------------------------------------------------------------ bắt đầu: tải xong hết (địa hình, nhân vật, âm thanh, biên dịch shader) mới hiện nút Xem phim
progress(0.92, 'Đang tải âm thanh…');
await amPrefetch();
progress(0.97, 'Đang chuẩn bị hình ảnh…');
//@@ s53
function frame() { const dt = Math.min(clock.getDelta(), 0.1); update(first ? 0 : dt); first = false; renderer.render(scene, camera); requestAnimationFrame(frame); }
setAppMode('film');
for (const tw of [5, 300, 560, 640, 880]) { T = tw; update(0); renderer.compile(scene, camera); renderer.render(scene, camera); }   // dựng sẵn các cảnh có nhiều hiệu ứng để lúc xem không bị khựng
T = 0; update(0); renderer.render(scene, camera);
renderList(); connectStore();
const NV_XONG = nvNen().then(() => XL.load());   // nhân vật nướng sẵn (theo thứ tự xuất hiện), rồi nhân vật có xương cho cận cảnh — đều tải sau khi sa bàn đã hiện, không tính vào tải lần đầu
const STILL = location.hash === '#still';
window.__sa = { XL, WP, NV_XONG, NQ, LHT, camera, controls, BOAT_S, AM, MU, NVK, LUY, GAR, RAFT, CAMP, seek: (t) => { T = clamp(t, 0, DUR - 0.01); }, setPlaying, setAppMode, goView, get T() { return T; }, boats, render: () => { update(0); renderer.render(scene, camera); }, ve: () => renderer.render(scene, camera), tinh: () => update(0) };
function closeLoad() { $('load').classList.add('done'); setTimeout(() => $('load').remove(), 700); }
if (STILL) { document.body.classList.add('ready'); closeLoad(); }
else {
  progress(1, 'Đã tải xong toàn bộ sa bàn');
  document.body.classList.add('ready');
  $('ldtrack').hidden = true; $('ldgo').hidden = false; $('bstart').focus();
  $('bstart').onclick = () => { voUnlock(); if (!AM.on) amEnable(true); closeLoad(); setPlaying(true); };
  $('bexplore').onclick = () => { voUnlock(); if (!AM.on) amEnable(true); closeLoad(); setAppMode('explore'); };
  requestAnimationFrame(frame);
}

