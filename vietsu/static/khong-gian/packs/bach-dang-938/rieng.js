// Bạch Đằng 938 · phần riêng của trận, cắm vào bộ máy 2.1.1 tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/cap_nhat_bach_dang.py).
// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy.
//@@ s1
// Sa bàn Bạch Đằng 938 — three.js
// Hệ thống tách rời: TideController (mực nước), ShipPathController (thuyền), BattleTimeline (sự kiện), CameraDirector (góc máy), SkyDirector (bầu trời)

//@@ s2
const progress = (f, m) => { lp.style.width = (f * 100).toFixed(0) + '%'; if (m) lm.textContent = m; };

//@@ s3
const getJSON = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const [META, INST, STORY, VOICE] = await Promise.all([getJSON('data/meta.json'), getJSON('data/inst.json'), getJSON('data/story.json'), getJSON('data/voice.json').catch(() => null)]);
progress(0.1, 'Đang dựng địa hình…');
//@@ s4
const STAKE_TOP = -1.0;     // đỉnh cọc (m, so với mực nước trung bình)
const LOW = -2.6, HIGH = 2.2;

//@@ s5
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 160000);
camera.position.set(1600, 900, 10500);
//@@ s6
const secPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 2990);
//@@ s7
const groundMat = fogShader({
  uniforms: { uGround: U.ground, uLight: U.light },
  fpre: 'uniform vec3 uGround; uniform float uLight;',
  fbody: `float r=length(vW.xz); float n=noise(vW.xz*0.0016)*0.55+noise(vW.xz*0.013)*0.3+noise(vW.xz*0.09)*0.15;
    vec3 c=uGround*(0.82+0.32*n)*uLight; float rim=smoothstep(${(R + 900).toFixed(1)},${(R + 60).toFixed(1)},r); c*=1.0-0.18*rim; outc=vec4(c,1.);`,
});
//@@ s8
const water = new THREE.Mesh(new THREE.CircleGeometry(R - 0.3, 360), waterMat);
water.rotation.x = -Math.PI / 2; water.renderOrder = 2; scene.add(water);

// section panel (mặt cắt)
const sectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(1700, 46, 1, 1), fogShader({
  transparent: true, side: THREE.DoubleSide,
  uniforms: { uH: { value: hTex }, uHalf: { value: HALF }, uLevel: U.level, uDeep: U.deep, uZ: { value: secPlane.constant } },
  fpre: 'uniform sampler2D uH; uniform float uHalf,uLevel,uZ; uniform vec3 uDeep;',
  fbody: `vec2 uv=(vec2(vW.x,uZ)+uHalf)/(2.*uHalf); float hb=texture2D(uH,uv).r;
    if(vW.y<hb){ float y=vW.y; float l=noise(vec2(vW.x*0.08,y*3.))*0.5+0.5; vec3 c=mix(vec3(0.10,0.075,0.05),vec3(0.19,0.14,0.09),l); c*=0.85+0.15*sin(y*3.1+noise(vec2(vW.x*0.05,y))*4.); c=mix(c,vec3(0.05,0.04,0.03),smoothstep(hb-3.,hb-14.,y)); if(hb-y<0.25) c=vec3(0.32,0.26,0.18); outc=vec4(c,1.); }
    else if(vW.y<uLevel){ float d=uLevel-vW.y; outc=vec4(mix(vec3(0.16,0.36,0.42),vec3(0.06,0.18,0.24),clamp(d/7.,0.,1.)),0.42); }
    else { discard; }
    if(abs(vW.y-uLevel)<0.06) outc=vec4(0.8,0.9,0.95,1.);`,
}));
sectionMesh.position.set(700, -14, secPlane.constant + 0.2);
sectionMesh.visible = false; scene.add(sectionMesh);

progress(0.35, 'Đang trồng cây, dựng làng…');
//@@ s9
const hutGeo = merge([
  colored(new THREE.BoxGeometry(7, 2.6, 4.6).translate(0, 1.3, 0), 0x7a6247),
  colored(new THREE.CylinderGeometry(0.01, 4.3, 3.4, 4, 1).rotateY(Math.PI / 4).scale(1.25, 1, 0.92).translate(0, 4.2, 0), 0x9b8456),
]);
const KEEP_CLEAR = [[-640, -450, 60], [-70, 2700, 45], [-20, 2900, 70], [30, 2970, 40]];
const MARCH0 = [[-2514, -133], [-2350, -142], [-2187, -133], [-2024, -107], [-1869, -56], [-1714, -116], [-1551, -116], [-1422, -219], [-1259, -262], [-1096, -296], [-932, -296], [-795, -391], [-668, -440]];
function clearOf(p) { for (const [x, z, r] of KEEP_CLEAR) if (Math.hypot(p[0] - x, p[1] - z) < r) return false; for (let i = 1; i < MARCH0.length; i++) { const [ax, az] = MARCH0[i - 1], [bx, bz] = MARCH0[i]; const dx = bx - ax, dz = bz - az; const u = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(p[0] - ax - dx * u, p[1] - az - dz * u) < 22) return false; } return true; }
const LAYER = { cay: [], nha: [], coc: [], nv: [], co: [] };   // nhóm đối tượng cho bảng Lớp
LAYER.cay.push(scatter(INST.mangrove.filter(clearOf), mangroveGeo, 1, -0.2, [0.3, 0.04, 0.18]));
LAYER.cay.push(scatter(INST.tree.filter(clearOf), treeGeo, 1, -0.4, [0.3, 0.04, 0.2]));
LAYER.cay.push(scatter(INST.grove.filter(clearOf), groveGeo, 1, -0.3, [0.2, 0.04, 0.15]));
LAYER.nha.push(scatter(INST.hut, hutGeo, 1, -0.1, [0.1, 0.02, 0.12]));

// ------------------------------------------------------------------ stakes (bãi cọc — vị trí giả định)
const stakeMat = new THREE.MeshStandardMaterial({ color: 0x6a4e33, roughness: 0.9, emissive: 0xff7a30, emissiveIntensity: 0 });
const tipMat = new THREE.MeshStandardMaterial({ color: 0x2c2a28, roughness: 0.5, metalness: 0.6, emissive: 0xffa040, emissiveIntensity: 0 });
clipList.push(stakeMat, tipMat);
// bãi cọc phủ kín lòng sông đoạn z 2740–3240: lưới so le ~4 m, cọc cắm nghiêng 17–26° chĩa mũi về thượng lưu, đỉnh cọc ở khoảng −1 m
const STAKES = [];
{
  const step = 4.0 * Math.SQRT2;                       // thưa bằng nửa bản trước
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
//@@ s10
const props = new THREE.Group(); scene.add(props);
const gaugePole = new THREE.Group();
{
  // cây cọc đặc tả (C06-C): thân gỗ + đầu nhọn bịt sắt, đỉnh ngay mặt nước
  const st = new THREE.Group(); st.rotation.z = 0.32; gaugePole.add(st);
  st.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 3.2, 8).translate(0, 1.6, 0), propMat));
  st.add(new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 8).translate(0, 3.57, 0), new THREE.MeshStandardMaterial({ color: 0x2c2a28, roughness: 0.45, metalness: 0.7 })));
  gaugePole.userData.top = 3.95 * Math.cos(0.32);
  { const c = STAKES.filter((q) => q[2] < -2.6).sort((p, q) => p[0] - q[0])[12] || [300, 2950]; gaugePole.position.set(c[0] - 6, -3.5, c[1] + 4); }   // đặt giữa mép bãi cọc phía Tây
  props.add(gaugePole);
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
const tableTop = new THREE.Vector3();
{
  const g = new THREE.Group();
  const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7, 5, 4, 1, true).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ color: 0x8a6f4a, roughness: 1, side: THREE.DoubleSide })); tent.position.set(-9, 2.5, -6); g.add(tent);
  const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 2.4), new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.8 })); tbl.position.set(0, 1.15, 0); g.add(tbl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 24).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd2442b })); ring.position.set(0.1, 1.23, 0.78); g.add(ring);
  for (const lx of [-1.5, 1.5]) for (const lz of [-1.0, 1.0]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), propMat); leg.position.set(lx, 0.55, lz); g.add(leg); }
  for (const [fx, fz] of [[-5, 4], [5, -5], [8, 6]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8, 5), propMat); p.position.set(fx, 4, fz); g.add(p); }
  g.position.copy(CP); scene.add(g);
  tableTop.set(CP.x, CP.y + 1.25, CP.z);
}

//@@ s11
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
const M = {};
M['thuyen-nam-han'] = await loadModel('thuyen-nam-han');
clipList.push(M['thuyen-nam-han'].mat);
const SS = 0.38;       // thuyền Nam Hán: 100 đơn vị → 38 m

//@@ s12
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
  const matM = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }); clipList.push(matM);
  // soi gương làm mặt ngoài thành "mặt sau": vẽ cả hai mặt (không thủng khi quay cận), đảo dấu mặt để pháp tuyến vẫn hướng ra ngoài
  matM.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', 'normal *= -faceDirection;')); };
  matM.customProgramCacheKey = () => 'nv-guong';
  NVK[kind] = { clips, mat, matM, cap };
}
const NV_KINDS = [['dan-binh', 520], ['linh-nam-han', 170], ['ngo-quyen', 2], ['luu-hoang-thao', 2]];
let nvDone = 0;
await Promise.all(NV_KINDS.map(async ([k, cap]) => { await nvLoad(k, cap); nvDone++; progress(0.5 + 0.35 * nvDone / NV_KINDS.length, 'Đang tải nhân vật có động tác…'); }));
//@@ s13
function nvFrame(C, t, ph, tSeg) { const n = C.frames.length; if (n === 1) return 0; if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg) * C.fps)); return ((Math.floor(t * C.fps + ph * n) % n) + n) % n; }
//@@ s14
const WPGEO = {
  giao: merge([colored(new THREE.CylinderGeometry(0.018, 0.018, 2.7, 5).translate(0, 0.45, 0), WOOD), colored(new THREE.ConeGeometry(0.04, 0.34, 6).translate(0, 1.97, 0), IRON), colored(new THREE.ConeGeometry(0.06, 0.12, 6).rotateX(Math.PI).translate(0, 1.76, 0), 0x8a2018)]),
  dao: merge([colored(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 5).translate(0, -0.05, 0), DARK), colored(new THREE.BoxGeometry(0.13, 0.03, 0.05).translate(0, 0.08, 0), 0x8a6a2a), colored(new THREE.BoxGeometry(0.055, 0.85, 0.012).translate(0, 0.52, 0), IRON)]),
  cung: (() => { const a = Math.PI * 0.62, Rr = 0.78; const arc = new THREE.TorusGeometry(Rr, 0.016, 4, 18, a).rotateZ(Math.PI - a / 2).translate(Rr, 0, 0);
    const half = Rr * Math.sin(a / 2), tipx = Rr * (1 - Math.cos(a / 2));
    return merge([colored(arc, WOOD), colored(new THREE.BoxGeometry(0.006, 2 * half, 0.006).translate(tipx, 0, 0), 0xd9d2bf)]); })(),
  cheo: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 1.55, 5).translate(0, -0.25, 0), WOOD), colored(new THREE.BoxGeometry(0.15, 0.48, 0.025).translate(0, -1.15, 0), WOOD), colored(new THREE.BoxGeometry(0.12, 0.04, 0.04).translate(0, 0.52, 0), WOOD)]),
  bua: merge([colored(new THREE.CylinderGeometry(0.02, 0.022, 0.62, 5).translate(0, 0.18, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.1, 0.1).translate(0, 0.48, 0), DARK)]),
  riu: merge([colored(new THREE.CylinderGeometry(0.022, 0.024, 0.85, 5).translate(0, 0.28, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.15, 0.025).translate(-0.09, 0.62, 0), IRON)]),   // lưỡi rìu hướng theo chiều ngón tay (phía chém)
  co: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 3.6, 5).translate(0, 1.0, 0), WOOD), colored(new THREE.ConeGeometry(0.05, 0.16, 6).translate(0, 2.88, 0), 0xc9a24a)]),
};
//@@ s15
const wpMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); clipList.push(wpMat);
for (const [k, cap] of [['giao', 520], ['dao', 260], ['cung', 200], ['cheo', 240], ['co', 120], ['bua', 24], ['riu', 24]]) { const im = new THREE.InstancedMesh(WPGEO[k], wpMat, cap); im.frustumCulled = false; im.count = 0; scene.add(im); WP[k] = im; }
// cờ hiệu trên cán (ảnh cờ anh gửi: co-trieu-ngo.png — tái dựng giản lược, chưa thẩm định)
const coTex = await texLoader.loadAsync('data/co-trieu-ngo.png'); coTex.colorSpace = THREE.SRGBColorSpace;
const coMat = new THREE.MeshLambertMaterial({ map: coTex, side: THREE.DoubleSide, alphaTest: 0.5 });
coMat.onBeforeCompile = (sh) => { sh.uniforms.uTime = U.time; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <begin_vertex>', '#include <begin_vertex>\nfloat ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23; transformed.z += sin(uv.x * 5.5 - uTime * 5.0 + ph) * 0.1 * uv.x;'); };
clipList.push(coMat);
//@@ s16
const coFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.65, 10, 2).translate(0.52, 2.47, 0), coMat, 120); coFlag.frustumCulled = false; coFlag.count = 0; scene.add(coFlag);
// cờ quân Ngô trên 3 cột ở sở chỉ huy
const cpFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.65, 10, 2).translate(0.5, -0.33, 0), coMat, 3); cpFlag.frustumCulled = false; scene.add(cpFlag);
[[-5, 4], [5, -5], [8, 6]].forEach(([fx, fz], i) => { dummy.position.set(CP.x + fx, CP.y + 7.95, CP.z + fz); dummy.rotation.set(0, 0.5 + i * 0.12, 0); dummy.scale.setScalar(2.8); dummy.updateMatrix(); cpFlag.setMatrixAt(i, dummy.matrix); });
//@@ s17
function wpPut(type, C, f, Mc, clip, side = 1) {
  if (type === 'co' && !coOn) return;
  const im = WP[type]; if (!im || im.count >= im.instanceMatrix.count) return;
  if (type === 'cung' && clip === 'ngam' && C.mt) {             // cung ở tay trái, dựng đứng, lưng cung quay về phía bắn
    const A = C.mt, o = f * 9; _wd.set(A[o], A[o + 1], A[o + 2]).normalize(); _wo.set(A[o + 6], A[o + 7], A[o + 8]).addScaledVector(_wd, 0.55);
    _wd.y = 0; _wd.normalize(); _wu.set(0, 1, 0); const X = _wd.clone().negate(); _wz2.crossVectors(X, _wu);
    _wb.makeBasis(X, _wu, _wz2).setPosition(_wo);
  } else if (type === 'cheo' && C.mt) {                           // mái chèo nằm trên đường nối hai bàn tay: tay trái nắm đầu cán, tay phải ôm thân, lưỡi chèo phía dưới tay phải
    const A = C.mt, o = f * 9; _wu.set(A[o], A[o + 1], A[o + 2]).normalize();
    _wz2.set(0, 0, 1).addScaledVector(_wu, -_wu.z); if (_wz2.lengthSq() < 1e-4) _wz2.set(1, 0, 0); _wz2.normalize(); _wd.crossVectors(_wu, _wz2);
    _wb.makeBasis(_wd, _wu, _wz2).setPosition(A[o + 6], A[o + 7], A[o + 8]);
  }
  else {
    const still = clip === 'dung' || clip === 'thu' || clip === 'di' || clip === 'chay';
    const up = type === 'giao' || type === 'co' || type === 'cung' ? (still ? 1 : 0) : type === 'dao' && (clip === 'dung' || clip === 'thu') ? -1 : 0;
    _wb.copy(nvGrip(C, f, false, up));
  }
  _wm2.multiplyMatrices(Mc, _wb); im.setMatrixAt(im.count++, _wm2);
  if (type === 'co' && coFlag.count < 120) coFlag.setMatrixAt(coFlag.count++, _wm2);
}
const NV_TINT = { 'dan-binh': [0xffffff, 0xe0d2c2, 0xd6c6b0, 0xc9bfae].map((c) => new THREE.Color(c)), 'linh-nam-han': [0xffffff, 0xe4e4ea, 0xcfcfd4].map((c) => new THREE.Color(c)) };
//@@ s18
function nvPut(kind, clip, t, ph, pos, yaw, scale, wpn, tSeg = 0, vi = 0, roll = 0, pitch = 0, side = 1, mir = false) {
  const K = NVK[kind]; if (!K) return;
  t = ANIMT + (t - T);                                              // nhịp động tác theo giây thật (phim đã nắn theo voice)
  const C = K.clips[clip] || K.clips.dung; const f = nvFrame(C, t, ph, tSeg); const im = nvIM(K, C, f, mir);
  if (im.count >= im.instanceMatrix.count) return;
  tmpE.set(pitch, yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(mir ? -scale : scale, scale, scale);
  const Mc = tmpM.compose(pos, tmpQ, tmpS);
  im.setMatrixAt(im.count, Mc); const tints = NV_TINT[kind]; im.setColorAt(im.count, tints ? tints[vi % tints.length] : WHITE); im.count++;
  if (wpn) wpPut(wpn, C, f, Mc, clip in K.clips ? clip : 'dung', side);
}
const _Y = new THREE.Vector3(0, 1, 0);
function nvHand(kind, clip, t, ph, pos, yaw, scale) {               // vị trí bàn tay phải (khung cầm) trong không gian
  const C = NVK[kind].clips[clip] || NVK[kind].clips.dung, f = nvFrame(C, t, ph, 0), o = f * 9;
  return new THREE.Vector3(C.mg[o + 6], C.mg[o + 7], C.mg[o + 8]).multiplyScalar(scale).applyAxisAngle(_Y, yaw).add(pos);
}
function nvBegin() { for (const im of NV_IMS) im.count = 0; for (const k in WP) WP[k].count = 0; coFlag.count = 0; }
function nvEnd() {
  for (const im of NV_IMS) { im.visible = im.count > 0; if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; } }
  for (const k in WP) WP[k].instanceMatrix.needsUpdate = true; coFlag.instanceMatrix.needsUpdate = true;
}
// người trên bờ: phóng to dần khi máy quay ở xa (như NHDD) để vẫn đọc được trên sa bàn
const farScale = (x, y, z) => EXAG * clamp(Math.hypot(camera.position.x - x, camera.position.y - y, camera.position.z - z) / 700, 1, 1.8);

// ------------------------------------------------------------------ channel & creeks
const CH = INST.channel, CHS = [0];
for (let i = 1; i < CH.length; i++) CHS.push(CHS[i - 1] + Math.hypot(CH[i][0] - CH[i - 1][0], CH[i][1] - CH[i - 1][1]));
const CHW = INST.channel_w;
function chan(s, lat) {
  s = Math.min(Math.max(s, 0), CHS[CHS.length - 1] - 0.01);
  let lo = 0, hi = CHS.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CHS[m] <= s) lo = m; else hi = m; }
  const f = (s - CHS[lo]) / (CHS[hi] - CHS[lo]);
  const x = CH[lo][0] + (CH[hi][0] - CH[lo][0]) * f, z = CH[lo][1] + (CH[hi][1] - CH[lo][1]) * f;
  let dx = CH[hi][0] - CH[lo][0], dz = CH[hi][1] - CH[lo][1]; const L = Math.hypot(dx, dz); dx /= L; dz /= L;
  const w = CHW[lo] * (1 - f) + CHW[hi] * f;
  return { x: x - dz * lat * w, z: z + dx * lat * w, dx, dz, w };
}
function sAtZ(z) { let lo = 0, hi = CH.length - 1; if (z <= CH[0][1]) return 0; if (z >= CH[hi][1]) return CHS[hi]; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CH[m][1] <= z) lo = m; else hi = m; } return CHS[lo] + (CHS[hi] - CHS[lo]) * (z - CH[lo][1]) / (CH[hi][1] - CH[lo][1]); }
const CR = INST.creeks;
//@@ s19
function polyLen(pts) { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return a; }

// ------------------------------------------------------------------ helpers
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
function keys(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return lerp(K[i - 1][1], K[i][1], ease(u)); } return K[K.length - 1][1]; }
function angLerp(a, b, t) { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
function rnd(i, k = 0) { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); }

// ------------------------------------------------------------------ TideController
const TIDE = [[0, 0.2], [20, 1.6], [45, -1.2], [70, 0.6], [145, 0.8], [220, 0.8], [276, 0.6], [280, 2.2], [283, -2.4], [287, 2.2], [304, 2.2], [312, -2.6],
  [395, -2.6], [404, 0.5], [428, -1.5], [442, 1.0], [456, -2.4], [462, 2.2], [470, 2.2], [625, 2.2], [695, -0.6], [760, -2.5], [890, -2.6], [975, -2.6], [1055, -1.6], [1075, 0.6], [1155, 0.8]];
function tideAt(t) { return keys(TIDE, t); }

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
  // đội hình hàng ngang: 4 hàng × 6 chiếc dàn ngang sông, mỗi chiếc một chỗ, to nhỏ khác nhau
  const k = Math.floor(i / 6), col = i % 6, lane = (col - 2.5 + (k % 2 ? 0.25 : -0.25)) / 2.75;   // hàng so le, cách đều
  const zStuck = 2810 + ((3 - k) / 3) * 360;
  ships.push({ i, k, col, lane, sz: 0.82 + rnd(i, 14) * 0.36, along: 0, zStuck, latStuck: lane * 0.32, jam: (rnd(i, 3) - 0.5) * 0.5, roll0: (rnd(i, 4) - 0.5) * 0.16, pitch0: (rnd(i, 5) - 0.4) * 0.12,
    sink: i === FLAG ? 940 : (rnd(i, 6) < 0.42 ? 905 + rnd(i, 7) * 55 : 1e9), fire: i === FLAG ? 900 : rnd(i, 70) < 0.78 ? 816 + rnd(i, 71) * 78 : 1e9, x: 0, y: 0, z: 0, yaw: 0, roll: 0, pitch: 0, vis: false, stuck: 0 });
}
const LEAD = [[470, 4520], [545, 3900], [593, 3600], [625, 2600], [665, 1400]];
const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(1, 1, 1);
function shipMatrix(sh, scale) { tmpE.set(sh.pitch, sh.yaw, sh.roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(sh.x, sh.y, sh.z); tmpS.setScalar(scale); return tmpM.compose(tmpV, tmpQ, tmpS); }
function localPt(sh, lx, ly, lz, scale = SS * (sh.sz || 1)) { tmpE.set(sh.pitch, sh.yaw, sh.roll, 'YXZ'); tmpQ.setFromEuler(tmpE); return new THREE.Vector3(lx * scale, ly * scale, lz * scale).applyQuaternion(tmpQ).add(new THREE.Vector3(sh.x, sh.y, sh.z)); }
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
    const off = sh.k * 190;
    const lat0 = sh.lane * 0.32;
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
    shipInst.setMatrixAt(sh.i, sh.vis ? shipMatrix(sh, SS * sh.sz) : hide);
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
//@@ s20
const BOAT_S = EXAG, BOAT_DECK = 0.3, BOAT_STERN = [0, 0.3, -3.1];
const NB = 36, NCIV = 3;
const AV_BOAT = NB + NCIV;   // thuyền riêng cho nhân vật khi khám phá trên sông
const boatInst = new THREE.InstancedMesh(TS.geo, TS.mat, NB + NCIV + 1); boatInst.frustumCulled = false; scene.add(boatInst);
LAYER.nv.push(boatInst);
const boats = [];
const GROUP = (j) => (j < 12 ? 'lure' : j < 20 ? 'gia' : j < 28 ? 'chanh' : j < 32 ? 'thai' : 'uong');
function creekHide(name, j) { const pts = CR[name]; return polyAt(pts, 320 + (j % 8) * 34); }
for (let j = 0; j < NB + NCIV; j++) boats.push({ j, g: j >= NB ? 'civ' : GROUP(j), x: 0, y: 0, z: 0, yaw: 0, vis: false, row: 1, tgt: j % NS, ang: rnd(j, 11) * Math.PI * 2 });
function travel(pts, t, t0, speed) { const L = polyLen(pts); const d = clamp((t - t0) * speed, 0, L); const p = polyAt(pts, d); const p2 = polyAt(pts, Math.min(L, d + 8)); const p1 = polyAt(pts, Math.max(0, d - 8)); return { x: p[0], z: p[1], yaw: Math.atan2(p2[0] - p1[0], p2[1] - p1[1]), done: d >= L, L }; }
function lurePath(j) { const lat = ((j % 3) - 1) * 0.12 + (rnd(j, 1) - 0.5) * 0.05; return lat; }
//@@ s21
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
//@@ s22
const NQ = proxy(), LHT = proxy();
const generals = [proxy(), proxy(), proxy()];
const workers = Array.from({ length: 9 }, proxy);
const archers = Array.from({ length: 7 }, proxy);
const nhHeroes = [proxy(), proxy(), proxy()];
const ambushN = 170, armyN = 90;
function drawP(o, kind, clip, ph, wpn, tSeg = 0, vi = 0, far = true) {
  if (!o.visible) return;
  const sc = far ? farScale(o.position.x, o.position.y, o.position.z) : EXAG;
  nvPut(kind, clip, T, ph, o.position, o.rotation.y, sc, wpn, tSeg, vi, o.rotation.z, o.rotation.x);
}
const blob = new THREE.Mesh(new THREE.CircleGeometry(0.9, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
//@@ s23
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
// tiếng đẽo gỗ / đập sắt đúng lúc lưỡi rìu, búa bổ xuống (khung 7 của động tác dam)
const STRIKE = new Map();
function strikeSound(id, ph, pos, kind) {
  const C = NVK['dan-binh'].clips.dam, f = nvFrame(C, ANIMT, ph, 0), prev = STRIKE.get(id); STRIKE.set(id, f);
  if (prev === undefined || prev === f || f !== 7 || !(playing || appMode === 'explore')) return;
  const d = camera.position.distanceTo(pos); if (d < 160) sfxStrike(kind, clamp(1 - d / 160, 0, 1));
}
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
      nvPut('dan-binh', 'dam', t, rnd(g * 3 + k, 61), _np, yaw, EXAG, 'riu', 0, 30 + g * 3 + k); strikeSound('go' + g + k, rnd(g * 3 + k, 61), _np, 'go');
    }
  });
  // 2) lò rèn: 3 người đập búa quanh đe, 1 người giữ lửa
  for (let k = 0; k < 4; k++) {
    const a = -0.9 + k * 1.25, r = k === 3 ? 0 : 1.35;
    let x = ANVIL[0] + Math.sin(a) * r, z = ANVIL[1] + Math.cos(a) * r, yaw = a + Math.PI;
    if (k === 3) { x = forge.position.x - 1.6; z = forge.position.z + 0.6; yaw = Math.PI / 2 + 0.3; }
    _np.set(x, hG(x, z), z); if (k === 0) proxyAt(x, _np.y, z, yaw);
    nvPut('dan-binh', k === 3 ? 'dung' : 'dam', t, k * 0.31, _np, yaw, EXAG, k === 3 ? null : 'bua', 0, 44 + k); if (k < 3) strikeSound('sat' + k, k * 0.31, _np, 'sat');
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
    // cọc nghiêng lên từ từ suốt cảnh, không ép cho xong, không quay vòng
    const lift = 0.85 * sstep(300 + g * 6, 470, t), sink = 0;
    const th = lerp(1.32, 0.3, lift);                            // góc nghiêng so với phương đứng
    const by = Math.max(hG(bx, bz), -4) - sink * 1.2, d = new THREE.Vector3(-Math.sin(th), Math.cos(th), 0);
    dummy.position.set(bx, by, bz); dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); dummy.scale.setScalar(sink > 0.98 ? 0 : 1); dummy.updateMatrix(); raiseStake.setMatrixAt(g, dummy.matrix);
    const top = new THREE.Vector3(bx, by, bz).addScaledVector(d, 4.4);
    for (let k = 0; k < 4; k++) {
      const pull = k < 2, x = pull ? bx + 6.2 + k * 1.7 : bx - 1.6 - k * 0.15 + (k - 2) * 0.2, z = bz + (k % 2 ? 0.9 : -0.9) * (pull ? 0.8 : 1);
      const y = wadeY(x, z, t), yaw = pull ? -Math.PI / 2 : Math.PI / 2;
      _np.set(x, y, z); if (g === 0 && k === 0) proxyAt(x, y, z, yaw);
      nvPut('dan-binh', pull ? 'keo' : 'day', t, rnd(g * 4 + k, 62), _np, yaw, EXAG, null, 0, 56 + g * 4 + k);
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
//@@ s24
const fireF = (sh, t) => (sh.vis ? sstep(sh.fire, sh.fire + 14, t) * (1 - sstep(0.35, 0.85, sh.sinkP)) * (1 - sstep(1000, 1050, t)) : 0);
function updateSmoke(t) {
  for (let i = 0; i < SMOKE_N; i++) {
    const sh = ships[i % NS]; const life = 26 + rnd(i, 30) * 14; const age = ((t + rnd(i, 31) * life) % life);
    const on = Math.max(fireF(sh, t), sh.sinkP > 0 ? 0.5 * (1 - sh.sinkP) : 0);   // khói đen bốc lên từ thuyền Nam Hán trúng tên lửa
    const wind = age * 2.2;
    smokePos[i * 3] = sh.x + (rnd(i, 33) - 0.5) * 22 + wind; smokePos[i * 3 + 1] = sh.y + 12 + age * (2.4 + rnd(i, 34)); smokePos[i * 3 + 2] = sh.z + (rnd(i, 35) - 0.5) * 22 + wind * 0.5;
    smokeA[i] = on * 0.34 * sstep(0, 3, age) * (1 - age / life); smokeS[i] = 20 + age * 2.6;
  }
  smokeGeo.attributes.position.needsUpdate = smokeGeo.attributes.aA.needsUpdate = smokeGeo.attributes.aS.needsUpdate = true;
}
const ARROW_N = 220;
//@@ s25
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
//@@ s26
const fireArrows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.35, 5), new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), FA_N);
fireArrows.frustumCulled = false; scene.add(fireArrows);
const FIRE_N = 2400;
//@@ s27
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
//@@ s28
const MARK = {
  daila: { p: bearingPt(274, 14000), t: 'Đại La (hướng Tây, ~95 km)' },
  coloa: { p: bearingPt(281, 15500), t: 'Cổ Loa (hướng Tây, ~95 km)' },
  namhan: { p: bearingPt(70, 15000), t: 'Nam Hán · Quảng Châu (hướng Đông Bắc)' },
  sea: { p: bearingPt(168, 11000), t: 'Ra biển · cửa Nam Triệu' },
  aichau: { p: bearingPt(222, 15000), t: 'Ái Châu (hướng Tây Nam)' },
};
const markMat = new THREE.MeshStandardMaterial({ color: 0xc9a46a, emissive: 0x6b4c1c, emissiveIntensity: 0.6, roughness: 0.6 });
// tòa thành tượng trưng (phóng đại để nhìn được từ xa): Đại La thành đất, mái ngói nâu; Nam Hán (Quảng Châu) tường gạch xám, mái ngói sẫm
function citadel(S, cWall, cTower, cRoof, cHall) {
  const parts = [], H = S * 0.06, T = S * 0.035, box = (w, h, d, x, y, z, c, ry = 0) => parts.push(colored(new THREE.BoxGeometry(w, h, d).rotateY(ry).translate(x, y + h / 2, z), c));
  const roof = (w, h, x, y, z, c) => parts.push(colored(new THREE.ConeGeometry(w * 0.75, h, 4).rotateY(Math.PI / 4).scale(1, 1, 0.75).translate(x, y + h / 2, z), c));
  for (const [x, z, w, d] of [[0, -S / 2, S, T], [0, S / 2, S, T], [-S / 2, 0, T, S], [S / 2, 0, T, S]]) box(w, H, d, x, 0, z, cWall);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { box(T * 2.2, H * 1.5, T * 2.2, sx * S / 2, 0, sz * S / 2, cTower); roof(T * 2.6, H * 0.6, sx * S / 2, H * 1.5, sz * S / 2, cRoof); }
  for (const [x, z] of [[0, -S / 2], [0, S / 2], [-S / 2, 0], [S / 2, 0]]) { box(S * 0.12, H * 1.7, T * 2.4, x, 0, z, cTower, x ? Math.PI / 2 : 0); box(S * 0.11, H * 0.35, T * 2.2, x, H * 1.7, z, cHall, x ? Math.PI / 2 : 0); roof(S * 0.15, H * 0.7, x, H * 2.05, z, cRoof); }
  box(S * 0.34, H * 0.35, S * 0.26, 0, 0, 0, cTower);                                       // nền điện
  box(S * 0.26, H * 0.9, S * 0.17, 0, H * 0.35, 0, cHall); roof(S * 0.33, H * 0.7, 0, H * 1.25, 0, cRoof); box(S * 0.17, H * 0.45, S * 0.11, 0, H * 1.75, 0, cHall); roof(S * 0.23, H * 0.6, 0, H * 2.2, 0, cRoof);
  for (let i = 0; i < 10; i++) { const a = rnd(i, 95) * Math.PI * 2, r = S * (0.2 + rnd(i, 96) * 0.22); box(S * 0.07, H * 0.5, S * 0.05, Math.cos(a) * r, 0, Math.sin(a) * r, cHall, a); roof(S * 0.09, H * 0.35, Math.cos(a) * r, H * 0.5, Math.sin(a) * r, cRoof); }
  return merge(parts);
}
const cityMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
const CITY = { daila: citadel(1500, 0x8a6e4e, 0x7a6248, 0x5a3626, 0x9a7b54), namhan: citadel(1700, 0x7d7a73, 0x6e6b66, 0x2f3a46, 0x8a2a20) };
for (const k in MARK) {
  let m;
  if (CITY[k]) { m = new THREE.Mesh(CITY[k], cityMat); m.rotation.y = k === 'daila' ? 0.15 : -0.3; }
  else m = new THREE.Mesh(new THREE.CylinderGeometry(18, 40, 420, 6).translate(0, 210, 0), markMat);
  m.position.copy(MARK[k].p); scene.add(m);
  MARK[k].mesh = m; MARK[k].top = MARK[k].p.clone().add(new THREE.Vector3(0, CITY[k] ? 330 : 470, 0));
}
const pulse = new THREE.Mesh(new THREE.RingGeometry(950, 1060, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd2442b, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
pulse.position.y = BASE + 1; scene.add(pulse);
const spiral = new THREE.Group();
{ const pts = []; for (let i = 0; i < 260; i++) { const a = i * 0.075, r = 120 + i * 2.3; pts.push(new THREE.Vector3(Math.cos(a) * r, 20, Math.sin(a) * r)); }
  spiral.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 38, 6), new THREE.MeshStandardMaterial({ color: 0xd8b26e, emissive: 0x8a5d20, emissiveIntensity: 0.9, roughness: 0.6 })));
  spiral.position.copy(MARK.coloa.p); spiral.visible = false; scene.add(spiral); }
function dashTube(points, color, radius) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: U.time, uC: { value: new THREE.Color(color) }, uP: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float uT,uP; uniform vec3 uC; varying vec2 vUv; void main(){ if(vUv.x>uP) discard; float d=fract(vUv.x*24.-uT*0.8); float a=smoothstep(0.,.15,d)*smoothstep(1.,.6,d); float head=smoothstep(uP-0.04,uP,vUv.x); gl_FragColor=vec4(uC*(1.+head*1.5),0.35+0.6*a);\n#include <colorspace_fragment>\n}' });
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, radius, 8), mat); m.visible = false; m.frustumCulled = false; scene.add(m);
  // đầu mũi tên nhọn ở đầu vệt đang chạy, chỉ hướng đi
  const head = new THREE.Mesh(new THREE.ConeGeometry(radius * 3.2, radius * 8, 14).translate(0, radius * 3, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.25), transparent: true, opacity: 0.95, depthWrite: false }));
  head.visible = false; head.frustumCulled = false; scene.add(head); m.userData = { curve, head }; DASH.push(m); return m;
}
const DASH = [], _dt = new THREE.Vector3(), _dY = new THREE.Vector3(0, 1, 0);
function updateHeads() {
  for (const m of DASH) {
    const { curve, head } = m.userData, u = clamp(m.material.uniforms.uP.value, 0, 1);
    head.visible = m.visible && u > 0.015; if (!head.visible) continue;
    const uu = Math.max(0.002, u - 0.004); head.position.copy(curve.getPointAt(uu)); curve.getTangentAt(uu, _dt); head.quaternion.setFromUnitVectors(_dY, _dt.normalize());
  }
}
const routeNH = dashTube([MARK.namhan.p.clone().setY(60), new THREE.Vector3(9000, 60, 2000), new THREE.Vector3(5200, 60, 7200), new THREE.Vector3(1500, 40, 6200), new THREE.Vector3(720, 20, 4300), new THREE.Vector3(650, 20, 2000)], 0xd2442b, 70);
const routeShipMat = M['thuyen-nam-han'].mat.clone(); routeShipMat.clippingPlanes = null;   // ngoài vòng sa bàn: không cắt
const routeShips = new THREE.InstancedMesh(M['thuyen-nam-han'].geo, routeShipMat, 5); routeShips.frustumCulled = false; routeShips.visible = false; scene.add(routeShips);
function updateRouteShips(t) {                                      // đoàn chiến thuyền đi theo đầu mũi tên từ Nam Hán sang
  const u = routeNH.material.uniforms.uP.value, on = routeNH.visible && t < 470 && u > 0.04; routeShips.visible = on; if (!on) return;
  const C = routeNH.userData.curve;
  for (let i = 0; i < 5; i++) {
    const uu = clamp(u - 0.025 - i * 0.018 - (i % 2) * 0.004, 0.002, 0.998), p = C.getPointAt(uu); C.getTangentAt(uu, _dt);
    const side = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 260; p.x += -_dt.z * side; p.z += _dt.x * side;
    dummy.position.set(p.x, BASE + 4, p.z); dummy.rotation.set(0, Math.atan2(_dt.x, _dt.z), 0); dummy.scale.setScalar(Math.hypot(p.x, p.z) < R + 600 ? 0 : i ? 7.5 : 9); dummy.updateMatrix(); routeShips.setMatrixAt(i, dummy.matrix);
  }
  routeShips.instanceMatrix.needsUpdate = true;
}
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
const SKY = {
  'Sương sớm cuối đông': { top: '#7c8fa3', hor: '#c9c6bc', low: '#8e8a7d', ground: '#6e6a5a', fog: 0.00006, el: 9, az: 120, sun: '#ffd9a8', si: 1.5, hs: '#b8c4cc', hg: '#5d5546', hi: 0.9, cover: 0.45, cc: '#e8e1d6', cs: '#8a8f96', exp: 0.95, size: 700, glow: 1.2 },
  'Trời u ám mùa đông': { top: '#5d6b78', hor: '#a3a69f', low: '#6c6a60', ground: '#5c5a4e', fog: 0.000055, el: 24, az: 160, sun: '#d9dde0', si: 0.9, hs: '#a9b2b8', hg: '#4e4a40', hi: 1.15, cover: 0.78, cc: '#b8bcbd', cs: '#5b6168', exp: 1.0, size: 400, glow: 0.4 },
  'Hoàng hôn biến loạn': { top: '#2c2430', hor: '#b2593a', low: '#3b2a24', ground: '#4a3328', fog: 0.000045, el: 4, az: 248, sun: '#ff8a4a', si: 1.6, hs: '#8a6a68', hg: '#3a2a22', hi: 0.6, cover: 0.55, cc: '#d77a4a', cs: '#3a2b2e', exp: 0.95, size: 500, glow: 2.2 },
  'Sáng trong': { top: '#3f78b0', hor: '#c7d8e0', low: '#8d9a8a', ground: '#77765a', fog: 0.00003, el: 32, az: 135, sun: '#fff1d8', si: 2.6, hs: '#bcd3e6', hg: '#5f5a44', hi: 0.9, cover: 0.3, cc: '#ffffff', cs: '#a3b0bd', exp: 0.92, size: 900, glow: 1 },
  'Chiều nắng ấm': { top: '#4b74a0', hor: '#e2c99a', low: '#8a7b5c', ground: '#80724f', fog: 0.000035, el: 18, az: 230, sun: '#ffd49a', si: 2.4, hs: '#c4c8c4', hg: '#5f5440', hi: 0.8, cover: 0.38, cc: '#fff0d8', cs: '#9a8f86', exp: 0.95, size: 800, glow: 1.4 },
  'Ngày nhiều mây': { top: '#56789a', hor: '#c3c9c6', low: '#7d8072', ground: '#6f6d55', fog: 0.00004, el: 38, az: 170, sun: '#fff4e4', si: 2.0, hs: '#b9c6cf', hg: '#575343', hi: 1.0, cover: 0.58, cc: '#f2f1ec', cs: '#7f8892', exp: 0.95, size: 800, glow: 0.8 },
  'Sương sông buổi sớm': { top: '#8796a3', hor: '#d6d3c9', low: '#9a978a', ground: '#7a7663', fog: 0.00011, el: 6, az: 115, sun: '#ffe0b8', si: 1.2, hs: '#c8cfd2', hg: '#625b4b', hi: 1.1, cover: 0.35, cc: '#efe9de', cs: '#9fa3a6', exp: 0.98, size: 600, glow: 1.4 },
  'Mây đen áp sát': { top: '#2f3741', hor: '#7d7f7b', low: '#474741', ground: '#45443b', fog: 0.00006, el: 20, az: 200, sun: '#c9c2b4', si: 0.8, hs: '#8a929a', hg: '#3d3a32', hi: 1.0, cover: 0.86, cc: '#8d9196', cs: '#2b3037', exp: 1.05, size: 400, glow: 0.3 },
  'Triều cường giữa trưa': { top: '#3a6fa6', hor: '#cbd6d6', low: '#8e9583', ground: '#7a7658', fog: 0.00003, el: 52, az: 185, sun: '#fff8ea', si: 2.8, hs: '#c0d4e4', hg: '#5f5a46', hi: 0.85, cover: 0.32, cc: '#ffffff', cs: '#a2adb8', exp: 0.88, size: 1000, glow: 0.8 },
  'Chiều ngả hổ phách': { top: '#4d5f7a', hor: '#d9a76a', low: '#7d6448', ground: '#76603f', fog: 0.00004, el: 12, az: 238, sun: '#ffb86a', si: 2.2, hs: '#b5aa9a', hg: '#5a4a36', hi: 0.75, cover: 0.45, cc: '#f2c58e', cs: '#6d5f5c', exp: 0.95, size: 700, glow: 1.8 },
  'Giông chiều cam đỏ': { top: '#2e2a33', hor: '#c06a3c', low: '#4a3226', ground: '#57402c', fog: 0.00005, el: 8, az: 242, sun: '#ff8f4f', si: 1.9, hs: '#93766a', hg: '#3f2f24', hi: 0.7, cover: 0.7, cc: '#d98a58', cs: '#2e2628', exp: 1.0, size: 500, glow: 2.2 },
  'Khói trận': { top: '#3b3532', hor: '#a37a58', low: '#4a3a2e', ground: '#544434', fog: 0.00007, el: 10, az: 244, sun: '#ffa35e', si: 1.7, hs: '#8f8177', hg: '#3c3229', hi: 0.8, cover: 0.66, cc: '#b88a66', cs: '#3a3230', exp: 1.0, size: 500, glow: 1.6 },
  'Chạng vạng đỏ thẫm': { top: '#1f1c24', hor: '#9c4630', low: '#3a2520', ground: '#46302a', fog: 0.00006, el: 2.5, az: 250, sun: '#ff6a3a', si: 1.3, hs: '#6e5552', hg: '#33241e', hi: 0.6, cover: 0.62, cc: '#b85a3c', cs: '#271f22', exp: 1.05, size: 400, glow: 2.4 },
  'Hoàng hôn vàng lặng': { top: '#456189', hor: '#efc27c', low: '#8a6a45', ground: '#83693f', fog: 0.000035, el: 6, az: 246, sun: '#ffc070', si: 2.1, hs: '#c0b4a2', hg: '#5a4831', hi: 0.8, cover: 0.32, cc: '#ffd8a0', cs: '#8a7068', exp: 0.95, size: 650, glow: 2.0 },
  'Bình minh hồng': { top: '#5a7aa8', hor: '#f0b9a0', low: '#8f7a6a', ground: '#7a6c58', fog: 0.000045, el: 5, az: 112, sun: '#ffc79a', si: 1.9, hs: '#c9c2c8', hg: '#5a5044', hi: 0.9, cover: 0.3, cc: '#ffe1cc', cs: '#9c8a96', exp: 0.95, size: 700, glow: 2.0 },
};
const SKYKEYS = [[0, 'Sương sớm cuối đông'], [52, 'Trời u ám mùa đông'], [70, 'Hoàng hôn biến loạn'], [145, 'Sáng trong'], [220, 'Chiều nắng ấm'], [305, 'Ngày nhiều mây'], [400, 'Sương sông buổi sớm'], [470, 'Mây đen áp sát'], [545, 'Triều cường giữa trưa'], [625, 'Chiều ngả hổ phách'], [695, 'Giông chiều cam đỏ'], [795, 'Khói trận'], [890, 'Chạng vạng đỏ thẫm'], [975, 'Hoàng hôn vàng lặng'], [1055, 'Bình minh hồng'], [1115, 'Sáng trong']];
//@@ s30
function applySky(t, forced) {
  let A, B, u;
  if (forced) { A = B = SKY[forced]; u = 0; }
  else {
    let i = 0; while (i < SKYKEYS.length - 1 && t >= SKYKEYS[i + 1][0]) i++;
    const next = SKYKEYS[i + 1]; A = SKY[SKYKEYS[i][1]];
    if (i > 0 && t - SKYKEYS[i][0] < 7) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, 7, t - SKYKEYS[i][0]); }
    else { B = A; u = 0; }
    void next;
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
  U.deep.value.copy(U.hor.value).multiplyScalar(0.25).lerp(new THREE.Color(0x1d3a3c), 0.6);
  U.shallow.value.copy(U.hor.value).multiplyScalar(0.45).lerp(new THREE.Color(0x5d6f5a), 0.55);
}

// ------------------------------------------------------------------ CameraDirector: 74 góc máy
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
//@@ s31
let tideNow = HIGH;
const STK = V3(680, -1, 2990), MOUTH = V3(705, 0, 4100), WS = V3(-20, 0, 2900);
//@@ s32
function orbit(c, r, h, a0, a1, fov = 45, h1) { return (u) => { const a = lerp(a0, a1, ease(u)); const hh = h1 === undefined ? h : lerp(h, h1, ease(u)); return [V3(c.x + Math.sin(a) * r, c.y + hh, c.z + Math.cos(a) * r), c.clone(), fov]; }; }
function shipCam(i, lx, ly, lz, tx, ty, tz, fov = 40, l2) { return (u) => { const sh = ships[i]; const off = l2 ? [lerp(lx, l2[0], ease(u)), lerp(ly, l2[1], ease(u)), lerp(lz, l2[2], ease(u))] : [lx, ly, lz]; return [localPt(sh, off[0], off[1], off[2]), localPt(sh, tx, ty, tz), fov]; }; }
//@@ s33
function fleetCenter() { let x = 0, z = 0, n = 0; for (const s of ships) if (s.vis) { x += s.x; z += s.z; n++; } return n ? V3(x / n, 0, z / n) : STK.clone(); }
// cảnh trung: máy quay lướt dọc đoàn chiến thuyền / vòng quanh một chiến thuyền ở khoảng cách 100–160 m (không cận quân Nam Hán)
const SHIP_ORDER = ships.slice().sort((a, b) => a.k - b.k || a.lane - b.lane);
function fleetPass(r0, r1, side, dist, h, fov = 40) {   // lướt dọc mép đội hình hàng ngang (cột ngoài cùng), máy đặt phía ngoài
  const col = side > 0 ? 5 : 0, ship = (r) => ships[r * 6 + col], rowC = (r) => { let x = 0, z = 0; for (let c = 0; c < 6; c++) { x += ships[r * 6 + c].x; z += ships[r * 6 + c].z; } return [x / 6, z / 6]; };
  return (u) => { const e = ease(u), A = ship(r0), B = ship(r1), C = rowC(r0), e2 = Math.min(1, e + 0.25);
    let ox = A.x - C[0], oz = A.z - C[1]; const L = Math.hypot(ox, oz) || 1; ox /= L; oz /= L;
    return [V3(lerp(A.x, B.x, e) + ox * dist, Math.max(tideNow, 0) + h, lerp(A.z, B.z, e) + oz * dist), V3(lerp(A.x, B.x, e2), 9, lerp(A.z, B.z, e2)), fov]; }; }
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
  'C06-C': (u) => { const g = gaugePole.position, tp = V3(g.x - Math.sin(0.32) * 3.9, g.y + Math.cos(0.32) * 3.9, g.z); return [V3(tp.x + 3.2 - u * 0.6, tideNow + 1.3, tp.z + 3.6), tp.clone().setY(tp.y - 0.7), 34]; },   // đặc tả đầu cọc bịt sắt nhô khỏi mặt nước
  'C06-D': fly(V3(420, 30, 3060), V3(540, 22, 3020), V3(680, -2, 2990), V3(760, -2, 2960), 40),
  'C06-E': orbit(V3(500, 0, 2000), 5200, 2600, -0.2, 0.35, 45),
  'C07-A': (u) => { const s = ships[0]; return [V3(1000 - u * 100, 240 - u * 60, 5200 - u * 300), V3(s.x, 0, s.z - 200), 40]; },
  'C07-B': (u) => { const a = ships[6], c = ships[0]; return [V3(a.x + 340, 70, a.z + 120 - u * 140), V3((a.x + c.x) / 2, 0, (a.z + c.z) / 2), 40]; },
  'C07-C': shipOrbit(FLAG, 135, 58, 0.9, 1.35, 38),
  'C07-D': fleetPass(0, 3, 1, 120, 32, 40),
  'C07-E': (u) => [V3(-70, 6.5, 3080 - u * 30), V3(ships[4].x, 4, ships[4].z), 36],
  'C08-A': fly(V3(320, 24, 2540), V3(380, 18, 2700), V3(640, 0, 2500), V3(680, 0, 2900), 40),
  'C08-B': boatCam(4, 3.6, 2.6, 7.5, 0, 1.4, 0, 40),
  'C08-C': (u) => [V3(1180 - u * 60, 95, 3300), V3(700, 0, 3560), 40],
  'C08-D': boatCam(1, -4.5, 2.4, -6, 0, 1.6, 4, 38),
  'C08-E': (u) => [V3(1350, 520 - u * 80, 3800), V3(690, -2, lerp(3000, 2600, u)), 45],
  'C09-A': fly(V3(1600, 420, 500), V3(1500, 360, 900), V3(650, 0, 1900), V3(650, 0, 1700), 42),
  'C09-B': (u) => [V3(560, tideNow + 1.4, 2945 - u * 6), V3(640, tideNow - 1.5, 2990), 36],
  'C09-C': fleetPass(0, 3, -1, 125, 36, 40),
  'C09-D': (u) => { const s = ships[23]; return [V3(s.x + 14, -3.0, 2810 - u * 20), V3(s.x, -1.5, s.z), 55]; },
  'C09-E': fly(V3(-450, 950, 3950), V3(-350, 800, 3850), V3(700, 0, 2400), V3(700, 0, 2600), 45),
  'C10-A': (u) => { const c = fleetCenter(); return [V3(1450, 280, 2350), V3(c.x, 0, c.z), 42]; },
  'C10-B': fleetPass(1, 3, 1, 110, 28, 40),
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
  'C12-B': shipOrbit(FLAG, 130, 55, 2.0, 2.5, 38),
  'C12-C': fleetPass(0, 3, -1, 160, 52, 42),
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
function sceneAt(t) { for (const s of STORY.scenes) if (t >= s.t0 && t < s.t1) return s; return STORY.scenes[STORY.scenes.length - 1]; }

// shot-specific modes (BattleTimeline)
//@@ s35
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
//@@ s36
const toLL = (x, z) => ({ lat: META.lat0 - z / KZ, lon: META.lon0 + x / KX });
const crp = (n, i) => { const p = CR[n][Math.min(CR[n].length - 1, i)]; return [p[0], p[1]]; };
const DUR = STORY.duration, SC = STORY.scenes, NSC = SC.length;
// ---- lời dẫn thu âm là đồng hồ chính của phim: TV = giây trong bản voice; T = giây kịch bản cũ, nắn theo mốc từng câu đọc (voice.json: warp)
const WARP = VOICE ? VOICE.warp : [[0, 0], [DUR, DUR]], DURV = VOICE ? VOICE.dur : DUR;
const SCV = VOICE ? VOICE.scenes : SC.map((s) => s.t0);
function warpT(tv) { const A = WARP; if (tv <= A[0][0]) return A[0][1]; for (let i = 1; i < A.length; i++) if (tv <= A[i][0]) { const a = A[i - 1], b = A[i]; return a[1] + ((tv - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); } return A[A.length - 1][1]; }
function unwarpT(t) { const A = WARP; if (t <= A[0][1]) return A[0][0]; for (let i = 1; i < A.length; i++) if (t <= A[i][1]) { const a = A[i - 1], b = A[i]; return b[1] > a[1] ? a[0] + ((t - a[1]) / (b[1] - a[1])) * (b[0] - a[0]) : a[0]; } return A[A.length - 1][0]; }
const blobCache = {};
function blobURL(p) { return blobCache[p] || (blobCache[p] = fetch(p).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then((b) => URL.createObjectURL(b))); }   // artifact chỉ phát media từ blob:
const VC = { el: null, ready: false, blocked: false };
if (VOICE) {
  VC.el = new Audio(); VC.el.preload = 'auto';
  blobURL('am/loi-dan.mp3').then((u) => { VC.el.src = u; VC.el.addEventListener('canplay', () => { VC.ready = true; }, { once: true }); }).catch((e) => console.warn('voice', e));
}
//@@ s37
let TV = 0, ANIMT = 0, T = 0, playing = false, speed = 1, appMode = 'film', povOn = false, userCam = false, tideAuto = true, forcedSky = '';
//@@ s38
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
//@@ s39
function addLabel(text, x, z, cls, opts = {}) {
  const el = document.createElement('div'); el.className = 'lbl ' + (cls || '');
  const b = document.createElement('b'); b.textContent = text; const i = document.createElement('i'); el.append(b, i); $('labels').appendChild(el);
  const L = { el, b, x, z, cls, obj: opts.obj || null, grp: opts.grp || 'anc', maxDist: opts.maxDist || Infinity, yFn: opts.yFn || null, show: opts.show || null };
  if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); if (!dragging) opts.onClick(); });
  if (opts.drag) b.addEventListener('pointerdown', (e) => { if (uiMode === 'drag' && canWrite !== false) { e.preventDefault(); e.stopPropagation(); startDrag(opts.drag, e); } });
  labels.push(L); return L;
}
for (const [name, text, x, z, desc, big] of ANCH) {
  const A = { name, text, x0: x, z0: z, x, z, desc, big };
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', maxDist: big ? Infinity : 7000, onClick: () => { showCard(name); flyTo(A.x, A.z, 700); }, drag: { kind: 'anchor', name } });
  anchors.set(name, A);
}
const RIVERS = [['Sông Bạch Đằng', 720, 3700], ['Sông Đá Bạc', -250, -1800], ['Sông Giá', ...crp('gia', 40)], ['Sông Chanh', ...crp('chanh', 40)], ['Sông Uông', ...crp('uong', 50)], ['Sông Thải', ...crp('thai', 50)]];
for (const [t, x, z] of RIVERS) addLabel(t, x, z, 'river', { grp: 'river', yFn: () => tideNow + 4 });
// tên nhân vật: chủ tướng, các tướng quân ta (vàng) và tướng giặc (đỏ), bám theo người
const WHO = [[NQ, 'Ngô Quyền', 'ta', 1.75], [generals[0], 'Dương Tam Kha', 'ta', 1.65], [generals[1], 'Kiều Công Hãn', 'ta', 1.65], [generals[2], 'Đỗ Cảnh Thạc', 'ta', 1.65], [LHT, 'Lưu Hoằng Tháo · chủ tướng Nam Hán', 'dich', 1.75]];
for (const [o, t, side, h] of WHO) addLabel(t, 0, 0, 'who ' + side, { grp: 'who', obj: o, maxDist: 900, yFn: () => o.position.y + h * EXAG + 0.5, show: () => o.visible && $('ly-ten').checked });
for (const k in MARK) addLabel(MARK[k].t, MARK[k].p.x, MARK[k].p.z, '', { grp: k, yFn: () => MARK[k].top.y, show: () => appMode === 'explore' || ['C02', 'C03', 'C13', 'C14'].includes(SC[sceneIdx(T)].id) });
//@@ s40
const FAR_GRP = new Set(['daila', 'coloa', 'namhan', 'sea', 'aichau']);
function updateLabels() {
  const filmAuto = appMode === 'film' && !userCam && !povOn;
  const w = innerWidth, h = innerHeight, showA = $('ly-lbl').checked, showP = $('ly-pin').checked;
  for (const L of labels) {
    let on = L.cls === 'pin' || L.cls === 'pin done' ? showP : L.grp === 'who' ? true : showA;
    if (L.obj) { L.x = L.obj.position.x; L.z = L.obj.position.z; }
    if (on && L.show && !L.show()) on = false;
    if (on && filmAuto && L.grp !== 'pin' && L.grp !== 'who') { const g = LABEL_SHOTS[lastShot] || []; on = g.includes(L.grp) || (g.includes('far') && FAR_GRP.has(L.grp)) || (L.grp === 'key' && g.includes('key')); }
    if (on) {
      const y = L.yFn ? L.yFn() : Math.max(hG(L.x, L.z), tideNow) + 2;
      v3.set(L.x, y, L.z);
      if (v3.distanceTo(camera.position) > (camera.position.y < 80 && L.grp !== 'pin' && L.grp !== 'who' ? Math.min(L.maxDist, 1600) : L.maxDist)) on = false;
      v3.project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) on = false;
      if (on) { L.el.style.left = ((v3.x + 1) / 2) * w + 'px'; L.el.style.top = ((1 - v3.y) / 2) * h - 2 + 'px'; }
    }
    L.el.style.display = on ? '' : 'none';
  }
}
//@@ s41
const VIEWS = { all: [300, 600, 9500, 180, 36], cuasong: [705, 3900, 1500, 170, 26], baicoc: [680, 2990, 650, 150, 28], botay: [-20, 2950, 240, 110, 20],
  lachgia: [...crp('gia', 14), 650, 200, 30], lachchanh: [...crp('chanh', 12), 650, 140, 30], ngaba: [686, 2595, 900, 200, 32], uong: [...crp('uong', 10), 700, 60, 30], chihuy: [CP.x, CP.z, 140, 120, 22] };
//@@ s42
function drawMinimap() {
  if ($('minimap').hidden || getComputedStyle($('minimap')).display === 'none') return;
  const w = 300, iw = mmImg.width, ih = mmImg.height, s0 = ((HALF - R) / (2 * HALF)), s1 = (2 * R) / (2 * HALF);
  mmx.clearRect(0, 0, w, w); mmx.save(); mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.clip();
  mmx.drawImage(mmImg, s0 * iw, s0 * ih, s1 * iw, s1 * ih, 0, 0, w, w);
  for (const A of anchors.values()) { const [px, py] = mmPx(A.x, A.z); mmx.fillStyle = A.big ? '#d8705a' : 'rgba(226,183,104,.9)'; mmx.fillRect(px - 2.5, py - 2.5, 5, 5); }
  for (const P of pins.values()) { const [px, py] = mmPx(P.x, P.z); mmx.fillStyle = '#d8705a'; mmx.beginPath(); mmx.arc(px, py, 3.5, 0, 7); mmx.fill(); }
  for (const sh of ships) if (sh.vis) { const [px, py] = mmPx(sh.x, sh.z); mmx.fillStyle = '#c0392b'; mmx.fillRect(px - 2, py - 2, 4, 4); }
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
$('mmLeg').textContent = 'Bấm để bay tới · đỏ: thuyền Nam Hán · vàng: thuyền quân Ngô';

//@@ s43
function renderList() {
  $('n-pins').textContent = pins.size; $('n-moves').textContent = moves.size; $('n-all').textContent = pins.size + moves.size;
  const list = $('list'); list.replaceChildren(); const who = (id) => (id && id === myId ? 'Anh' : names[id] || 'Ai đó');
  if (tab === 'pins') {
    const arr = [...pins.entries()].sort((a, b) => (a[1].doc.status === 'xong') - (b[1].doc.status === 'xong') || String(b[1].doc.created).localeCompare(String(a[1].doc.created)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa có ghi chú. Chọn “＋ Ghi chú” rồi bấm lên sa bàn tại chỗ cần góp ý: vị trí bãi cọc, lạch phục binh, hình dạng bờ sông, sai lệch sử liệu…'; list.append(e); }
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
  const out = { du_an: 'Sa bàn Bạch Đằng 938', xuat_luc: nowIso(), goc_toa_do: [META.lat0, META.lon0],
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
    if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { x = -60; z = 2930; }
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
    else nvPut(kind, 'dung', now, 0, p.setX(p.x), W.yaw, EXAG * 0.95, 'dao', 0, 0);
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
  ['Ngô Quyền', () => (NQ.visible ? eyeOf(NQ, 1.62) : null)],
  ['Dân binh trên thuyền nhử địch', () => (boats[1].vis ? boatEye(boats[1], 0) : null)],
  ['Dân binh thuyền phục kích (lạch Chanh)', () => (boats[22].vis ? boatEye(boats[22], 0) : null)],
  ['Cung thủ bờ Tây', () => (archers[3].visible ? eyeOf(archers[3], 1.55) : null)],
  ['Dân binh dựng cọc', () => (workers[3].visible ? eyeOf(workers[3], 1.55) : null)],
  ['Thủy thủ Nam Hán (thuyền mắc cọc)', () => { const sh = ships[8]; if (!sh.vis || sh.sinkP > 0.3) return null; const L = CREW_LOCAL[1]; return { p: localPt(sh, L[0], L[1], L[2]).add(V3(0, 1.62 * EXAG, 0)), yaw: sh.yaw - 0.4 }; }],
  ['Lưu Hoằng Tháo', () => (LHT.visible ? eyeOf(LHT, 1.66) : null)],
];
const POV_DD = [['Đỉnh đồi sở chỉ huy', CP.x + 8, CP.z + 6, 3.2], ['Bờ Tây trước bãi cọc', 30, 2985, 2.6], ['Giữa bãi cọc, sát mặt nước', 680, 2995, -1], ['Cửa lạch sông Giá', ...crp('gia', 6), 2.4], ['Cửa sông nhìn ra biển', 705, 4020, 4]];
//@@ s47
function povTick() {
  let E = null;
  if (POV.dd >= 0) { const [, x, z, h] = POV_DD[POV.dd]; const y = h < 0 ? tideNow + 1.6 : Math.max(hG(x, z), tideNow) + h; E = { p: V3(x, y, z), yaw: Math.atan2(680 - x, 2990 - z) }; if (Math.hypot(680 - x, 2990 - z) < 30) E.yaw = Math.PI; }
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
function setAppMode(m) {
  const pov = m === 'pov'; if (pov) m = 'film';
  if (m !== 'explore' && W.on) setWalk(false);
  appMode = m; povOn = pov;
  document.body.classList.remove('m-film', 'm-explore', 'm-compare', 'm-pov'); document.body.classList.add('m-' + m); document.body.classList.toggle('m-pov', pov);
  $('povbar').hidden = !pov; controls.enabled = !pov;
  document.querySelectorAll('#modes button').forEach((b) => { const on = b.dataset.m === (pov ? 'pov' : m); b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  $('filmbar').hidden = m !== 'film'; $('explorebar').hidden = m !== 'explore';
  if (m !== 'explore') { if (uiMode !== 'view') setUiMode('view'); $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); }
  if (m === 'film') { userCam = false; $('sret').hidden = true; controls.autoRotate = false; TV = unwarpT(T); voSeek(); }
  else { setPlaying(false); $('scenes').hidden = true; }
  if (m === 'explore') {
    exploreI = sceneIdx(T); $('dslider').value = exploreI; onExplore(); $('help').textContent = HELP[uiMode];
    controls.target.copy(camLook); if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }
  setSection(false); sectionShot = false; if (!$('docs').hidden) fillDocs(); updSub(true);
}
$('modes').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (b) setAppMode(b.dataset.m); });
//@@ s49
function setPlaying(b) { if (b && TV >= DURV - 0.1) { TV = 0; voSeek(); } playing = b; if (!b && VC.el) VC.el.pause(); $('splay').textContent = b ? '⏸' : '▶'; $('splay').setAttribute('aria-label', b ? 'Tạm dừng' : 'Phát'); if (!b) voStop(); else lastLine = ''; }
function goScene(i) { i = clamp(i, 0, NSC - 1); TV = SCV[i] + 0.01; T = warpT(TV); voSeek(); userCam = false; $('sret').hidden = true; voStop(); lastLine = ''; startBlend(); }
let blend = null; function startBlend() { blend = { t0: performance.now(), p0: camera.position.clone(), q0: camLook.clone() }; }
$('splay').onclick = () => { voUnlock(); VC.blocked = false; setPlaying(!playing); };
$('sprev').onclick = () => { const i = sceneIdx(T); goScene(TV - SCV[i] > 4 ? i : i - 1); };
$('snext').onclick = () => goScene(sceneIdx(T) + 1);
$('sspeed').onchange = (e) => { speed = parseFloat(e.target.value) || 1; if (VC.el) VC.el.playbackRate = speed; };
function voSeek() { if (VC.el && VC.ready) try { VC.el.currentTime = clamp(TV, 0, DURV - 0.05); } catch (e) {} }
$('sret').onclick = () => { userCam = false; $('sret').hidden = true; controls.autoRotate = false; startBlend(); };
$('bscenes').onclick = () => { $('scenes').hidden = !$('scenes').hidden; };
$('scx').onclick = () => { $('scenes').hidden = true; };
SC.forEach((sc, i) => {
  if (i) { const el = document.createElement('i'); el.style.left = `calc(${(SCV[i] / DURV) * 100}% - 1px)`; $('ticks').append(el); }
  const li = document.createElement('li'), b = document.createElement('button'), n = document.createElement('b'), sm = document.createElement('small');
  n.textContent = sc.id; sm.textContent = `${fmtT(SCV[i])}`; b.append(n, sc.title, sm); b.onclick = () => { goScene(i); $('scenes').hidden = true; }; li.append(b); $('slist').append(li);
});
let seeking = false;
$('seek').addEventListener('input', (e) => { seeking = true; TV = (e.target.value / 1000) * DURV; T = warpT(TV); voSeek(); userCam = false; $('sret').hidden = true; voStop(); lastLine = ''; });
$('seek').addEventListener('change', () => { seeking = false; });
//@@ s50
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
function fillDocs() {
  const i = appMode === 'explore' ? exploreI : sceneIdx(T), sc = SC[i], el = $('docsbody'); el.replaceChildren();
  const add = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; el.append(e); return e; };
  add('div', `Chương ${i + 1}/14`, 'eyebrow'); add('h2', sc.title);
  add('h4', 'Sự kiện chính'); const ul = add('ul'); for (const f of SCENE_FACTS[i] || []) { const li = document.createElement('li'); li.textContent = f; ul.append(li); }
  add('h4', 'Diễn biến'); const paras = []; let cur = ''; for (const s of sc.subs) { cur += (cur ? ' ' : '') + s[2]; if (/[.!?…:]$/.test(s[2])) { paras.push(cur); cur = ''; } } if (cur) paras.push(cur);
  for (const p of paras) add('p', p);
  add('h4', 'Số liệu trận Bạch Đằng 938'); const dl = add('dl', undefined, 'facts');
  for (const [k, v] of BATTLE) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
}
$('bdocs').onclick = () => { const open = $('docs').hidden; if (open) fillDocs(); $('docs').hidden = !open; $('bdocs').classList.toggle('on', open); if (open) $('info').hidden = true; };
$('docsx').onclick = () => { $('docs').hidden = true; $('bdocs').classList.remove('on'); };
$('barr').onclick = () => { const c = $('ly-arr'); c.checked = !c.checked; $('barr').classList.toggle('on', c.checked); };
$('ly-arr').onchange = () => $('barr').classList.toggle('on', $('ly-arr').checked);
$('ly-mm').onchange = (e) => { $('minimap').hidden = !e.target.checked; };
$('ly-gauge').onchange = (e) => { $('gauge').hidden = !e.target.checked; };
$('ly-co').onchange = (e) => { coOn = e.target.checked; };
$('ly-mc').onchange = (e) => { if (appMode === 'explore') setSection(e.target.checked); };
for (const [id, key] of [['ly-cay', 'cay'], ['ly-nha', 'nha']]) $(id).onchange = (e) => { for (const m of LAYER[key]) m.visible = e.target.checked; };
//@@ s51
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
const AM_LAP = [[7, 0.3, 0.6, 'cung', 0.35, 0.4, 1.4], [7, 0.3, 0.6, 'muiten', 0.3, 0.6, 1.8], [10, 0.05, 1, 'cung', 0.4, 0.25, 1.0], [10, 0.05, 1, 'muiten', 0.35, 0.4, 1.4],
  [10, 0.3, 1, 'chem', 0.35, 0.5, 1.6], [11, 0, 0.8, 'chem', 0.35, 0.6, 1.8], [11, 0, 0.7, 'cung', 0.3, 0.5, 1.6]];
async function amLoad() {
  await Promise.all([...AM_BED, ...AM_ONE].map(async (n) => { try { const r = await fetch('am/' + n + '.mp3'); AM.buf[n] = await AM.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn('âm thanh', n, e); } }));
  for (const n of AM_BED) { if (!AM.buf[n]) continue; const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.sfx); s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g; }
  AM.ready = true;
}
//@@ s52
let NOISE = null;
function sfxStrike(kind, v) {                                       // âm tổng hợp: chặt gỗ (tiếng cộc trầm + xào xạo) / đập sắt (tiếng ngân kim loại)
  if (!AM.on || !AM.ctx || !AM.sfx) return;
  const C = AM.ctx, t = C.currentTime + 0.01, g0 = C.createGain(); g0.gain.value = v * (0.85 + Math.random() * 0.3); g0.connect(AM.sfx);
  if (!NOISE) { NOISE = C.createBuffer(1, C.sampleRate * 0.4, C.sampleRate); const a = NOISE.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
  const burst = (dur, type, f, q, vol) => { const n = C.createBufferSource(); n.buffer = NOISE; const b = C.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const g = C.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); n.connect(b).connect(g).connect(g0); n.start(t); n.stop(t + dur + 0.02); };
  const tone = (f0, f1, dur, vol, type = 'sine') => { const o = C.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); const g = C.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g).connect(g0); o.start(t); o.stop(t + dur + 0.02); };
  if (kind === 'go') { tone(190, 85, 0.16, 0.9); tone(520, 380, 0.07, 0.35, 'triangle'); burst(0.12, 'bandpass', 1100, 1.1, 0.8); burst(0.05, 'highpass', 3000, 0.7, 0.25); }
  else { const p = 1 + (Math.random() - 0.5) * 0.06; for (const [f, d, a] of [[1180, 0.9, 0.35], [2730, 0.55, 0.22], [4410, 0.32, 0.14], [6020, 0.18, 0.08]]) tone(f * p, f * p * 0.995, d, a); burst(0.03, 'highpass', 2500, 0.7, 0.6); tone(150, 70, 0.08, 0.5); }
}
//@@ s53
const distVol = (x, z) => clamp(1 - Math.hypot(camera.position.x - x, camera.position.z - z, camera.position.y) / 4500, 0.15, 1);
// đang có lời dẫn? → hạ hiệu ứng và nhạc để giọng đọc nổi rõ
function voiceTalking() {
  if (!VOICE || appMode !== 'film' || !playing || !VO.on || !VC.el || VC.el.paused) return false;
  for (const s of VOICE.subs) { if (s[0] > TV + 0.4) break; if (TV >= s[0] - 0.3 && TV < s[1] + 0.4) return true; }
  return false;
}
function amTick(dt) {
  if (AM.sfx) AM.sfx.gain.setTargetAtTime(voiceTalking() ? 0.38 : 0.75, AM.ctx.currentTime, 0.35);
  if (!AM.ready || !AM.on) { AM.prevT = T; return; }
  const live = (appMode === 'film' && playing) || appMode === 'explore', i = sceneIdx(T), sc = SC[i], u = clamp((T - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const plan = amPlan(i, u), k = live ? 1 : 0.2, now = AM.ctx.currentTime;
  for (const n in AM.beds) AM.beds[n].gain.setTargetAtTime((plan[n] || 0) * k * (W.on ? 0.6 : 1), now, 0.8);
  if (live && T > AM.prevT && T - AM.prevT < 1) {
    for (const sh of ships) {
      if (sh.tStuck && AM.prevT < sh.tStuck && T >= sh.tStuck) amShot('daroi', 0.55 * distVol(sh.x, sh.z));       // thuyền đâm vào bãi cọc
      if (sh.sink < 1e8 && AM.prevT < sh.sink && T >= sh.sink) amShot('tauchim', 0.6 * distVol(sh.x, sh.z));       // thuyền chìm
    }
    const tt = performance.now() / 1000;
    AM_LAP.forEach(([si, u0, u1, n, v, a, b], j) => { if (si !== i || u < u0 || u > u1) return; if (!(j in AM.next)) AM.next[j] = tt + Math.random() * a; if (tt >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = tt + a + Math.random() * (b - a); } });
  }
  AM.prevT = T;
}
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
      const el = new Audio(); el.preload = 'auto'; el.loop = true;
      const g = AM.ctx.createGain(); g.gain.value = 0;
      try { AM.ctx.createMediaElementSource(el).connect(g); g.connect(AM.out); } catch (e) { el.volume = 0; }
      this.deck.push({ el, g, ch: -1, f: '', seek: null });
    }
  },
  pos(i) { const [f, off] = NHAC[i], d = NHAC_DUR[f]; return (off + Math.max(0, appMode === 'film' ? TV - SCV[i] : T - SC[i].t0)) % d; },
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
        if (D.f !== f) { D.f = f; const want = f; blobURL('nhac/' + f + '.mp3').then((u) => { if (D.f === want) D.el.src = u; }).catch(() => {}); }
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
      const duck = voiceTalking() ? 0.42 : 0.85;
      D.g.gain.setTargetAtTime(vol * duck * (W.on ? 0.6 : 1), now, 0.8);
    } else {
      D.g.gain.setTargetAtTime(0, now, 0.25);
      if (D.g.gain.value < 0.01 && !D.el.paused) D.el.pause();
    }
  },
};
//@@ s54
function speak(tx) {
  if (VOICE) return;                                                // đã có lời dẫn thu âm
  if (!VO.on || !playing || appMode !== 'film' || !('speechSynthesis' in window) || !voUnlock.done) return;
  if (speechSynthesis.speaking && VO.q > 2) voStop();
  const u = new SpeechSynthesisUtterance(tx.replace(/[“”"…·()]/g, ' ')); u.lang = 'vi-VN'; if (VO.voice) u.voice = VO.voice; u.rate = 1.05 * Math.min(1.4, speed);
  VO.q++; u.onend = u.onerror = () => { VO.q = Math.max(0, VO.q - 1); }; speechSynthesis.speak(u);
}
function voUnlock() { if (!('speechSynthesis' in window) || voUnlock.done) return; voUnlock.done = true; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(' '); u.lang = 'vi-VN'; u.volume = 0; speechSynthesis.speak(u); } catch (e) {} lastLine = ''; }
$('bvo').onclick = (e) => { voUnlock(); VO.on = !VO.on; e.currentTarget.classList.toggle('on', VO.on); if (VC.el) VC.el.muted = !VO.on; if (!VO.on) voStop(); else lastLine = ''; };
$('bsnd').onclick = () => { amEnable(!AM.on); };
$('bsnd').classList.add('hint');
{ const first = (e) => { removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true); voUnlock(); VC.blocked = false; if (e && e.target && e.target.closest && e.target.closest('#bsnd')) return; if (!AM.on) amEnable(true); };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true); }

// ------------------------------------------------------------------ phụ đề
function updSub(force) {
  const el = $('sub'), sc = SC[sceneIdx(T)]; let txt = '', key = '';
  if (appMode === 'film') {
    if (VOICE) { for (let k = 0; k < VOICE.subs.length; k++) { const s = VOICE.subs[k], nx = VOICE.subs[k + 1]; if (TV >= s[0] && TV < Math.min(nx ? nx[0] : 1e9, s[1] + 0.5)) { txt = s[2]; key = 'v' + k; break; } if (s[0] > TV) break; } }
    else sc.subs.forEach((s, k) => { if (T >= s[0] && T < s[1]) { txt = s[2]; key = sc.id + ':' + k; } });
  }
  if (key && key !== lastLine) { lastLine = key; speak(txt); }
  const on = appMode === 'film' && $('ly-sub').checked;
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt || force) el.textContent = txt; el.hidden = !txt;
}

// ------------------------------------------------------------------ C02: biểu tượng Kiều Công Tiễn sát hại Dương Đình Nghệ, thư cầu viện bay sang Nam Hán
const c02 = $('c02'), c02m = $('c02m'), c02v = new THREE.Vector3();
function scr(v) { c02v.copy(v).project(camera); return c02v.z < 1 && Math.abs(c02v.x) < 1.2 && Math.abs(c02v.y) < 1.2 ? [((c02v.x + 1) / 2) * innerWidth, ((1 - c02v.y) / 2) * innerHeight] : null; }
function updateC02(t) {
  const show = t >= 100.5 && t < 115.5 && !document.body.classList.contains('m-explore') || (appMode === 'explore' && exploreI === 1 && t >= 100.5 && t < 115.5);
  c02.hidden = !show;
  if (show) {
    const p = scr(MARK.daila.top); const x = p ? clamp(p[0], 160, innerWidth - 160) : innerWidth / 2, y = Math.max(innerHeight * 0.62, p ? p[1] - 12 : 0);       // nằm dưới thẻ chương
    c02.style.left = x + 'px'; c02.style.top = y + 'px'; c02.style.opacity = sstep(100.5, 101.3, t) * (1 - sstep(114.6, 115.4, t));
    const k = sstep(102.5, 104.6, t);                                  // thanh kiếm lao từ Kiều Công Tiễn sang Dương Đình Nghệ
    $('c02sw').style.opacity = Math.min(1, k * 4) * (1 - sstep(108, 109, t) * 0.4); $('c02sw').style.transform = `translateX(${(k - 0.5) * 50}px) rotate(${(1 - k) * -18}deg)`;
    const xk = sstep(104.8, 105.6, t); $('c02x').style.transform = `translate(-50%,-50%) scale(${xk})`; $('ppD').classList.toggle('dead', xk > 0.5);
  }
  helpArc.visible = t >= 115 && t < 145; helpArc.material.uniforms.uP.value = sstep(116, 127, t);
  const mOn = t >= 116 && t < 131; c02m.hidden = !mOn;
  if (mOn) { const p = scr(helpCurve.getPointAt(clamp(sstep(116, 127, t), 0, 1))); c02m.hidden = !p; if (p) { c02m.style.left = p[0] + 'px'; c02m.style.top = p[1] + 'px'; c02m.style.opacity = 1 - sstep(129.5, 131, t); } }
}
//@@ s55
function update(dt) {
  if (appMode === 'film') {
    if (playing) {
      if (VC.el && !VC.ready && VC.el.src && VC.el.readyState >= 1) VC.ready = true;
      const useV = VC.el && VC.ready && !VC.blocked && !VC.el.ended;
      if (useV) {
        if (VC.el.paused) { if (Math.abs(VC.el.currentTime - TV) > 0.25) voSeek(); VC.el.playbackRate = speed; VC.el.play().catch(() => { VC.blocked = true; }); }
        const pred = TV + dt * speed, cur = VC.el.currentTime;                // đồng hồ theo voice, làm mượt bước nhảy của currentTime
        TV = Math.abs(cur - pred) > 0.3 ? cur : pred + (cur - pred) * 0.15;
      } else TV += dt * speed;
      if (TV >= DURV) { TV = DURV - 0.01; setPlaying(false); }
      ANIMT += dt * speed;
    }
    T = warpT(TV);
  }
  if (appMode === 'explore') { const sc = SC[exploreI]; T += dt; ANIMT += dt; if (T >= sc.t1 || T < sc.t0) T = sc.t0 + 0.01; }
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
  logs.visible = forge.visible = t >= 300 && t < 470; gaugePole.visible = t < 1060; gaugePole.position.y = Math.max(hAt(gaugePole.position.x, gaugePole.position.z) - 1.2, tideNow + 0.3 - gaugePole.userData.top);
  if (appMode === 'film') { const want = SECTION_SHOTS.has(shot.id) && !userCam; if (want !== sectionShot) { sectionShot = want; setSection(want); } }
  // mũi tên, mốc hướng
  const arrOn = $('ly-arr').checked && !W.on, far = camera.position.y > 120;
  routeNH.visible = arrOn && ((t >= 128 && t < 145) || (t >= 470 && t < 485) || (appMode === 'explore' && i === 6)); routeNH.material.uniforms.uP.value = t < 470 ? sstep(129, 141, t) : 1;
  routeNQ.visible = arrOn && ((t >= 145 && t < 162) || (appMode === 'explore' && i === 2)); routeNQ.material.uniforms.uP.value = appMode === 'explore' ? 1 : sstep(146, 158, t);
  const atk = arrOn && far && (shot.id === 'C11-F' || (appMode === 'explore' && (i === 10 || i === 11)) || (userCam && (i === 10 || i === 11)));
  attackArrows.forEach((m) => { m.visible = atk; m.material.uniforms.uP.value = appMode === 'film' && !userCam ? sstep(shot.t0 + 1, shot.t0 + 7, t) : 1; });
  pulse.visible = t >= 85 && t < 130; pulse.position.x = MARK.daila.p.x; pulse.position.z = MARK.daila.p.z; pulse.material.opacity = 0.6 * (0.5 + 0.5 * Math.sin(t * 3)); pulse.scale.setScalar(1 + ((t * 0.6) % 1) * 1.2);
  spiral.visible = t >= 1105; spiral.rotation.y = t * 0.05;
  updateC02(t); updateHeads(); updateRouteShips(t);
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
  $('stime').textContent = `${fmtT(appMode === 'film' ? TV : t)} / ${fmtT(DURV)}`; if (!seeking) $('seek').value = Math.round((TV / DURV) * 1000);
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
//@@ s56
function frame() { const dt = Math.min(clock.getDelta(), 0.1); update(first ? 0 : dt); first = false; renderer.render(scene, camera); requestAnimationFrame(frame); }
setAppMode('film'); update(0); renderer.compile(scene, camera);
$('load').classList.add('done'); setTimeout(() => $('load').remove(), 700);
renderList(); connectStore();
const STILL = location.hash === '#still';
if (!STILL && !reduceMotion) setPlaying(true);
window.__sa = { helpCurve, helpArc, routeShips, routeNH, NQ, camera, controls, BOAT_S, AM, MU, NVK, seek: (t) => { T = clamp(t, 0, DUR - 0.01); TV = unwarpT(T); voSeek(); }, get TV() { return TV; }, VC, setPlaying, setAppMode, goView, get T() { return T; }, ships, boats, render: () => { update(0); renderer.render(scene, camera); } };
if (!STILL) requestAnimationFrame(frame);

