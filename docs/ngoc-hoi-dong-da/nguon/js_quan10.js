
// ------------------------------------------------------------------ nhân vật, voi, ngựa, binh khí, hiệu ứng: diễn theo từng cảnh (V10)
// Lính (Tây Sơn, Thanh, Tôn Sĩ Nghị): chuỗi khung hình nướng từ động tác Mixamo; mỗi khung có toạ độ bàn tay phải (mg) và
// khung hai tay khi ngắm súng (mt). Binh khí (súng hỏa hồ, giáo, gươm, đuốc) dựng ở đây rồi gắn theo bàn tay → cùng một động tác
// dùng được cho lính súng, lính giáo, lính gươm. Ngựa: thân nướng theo xương, người cưỡi + giáo gắn cứng vào xương lưng (v4).
// Voi có nài (v2). Kịch bản đội hình: quan.json (source/build_quan10.py).
const NV = { ok: false, on: true, kinds: {}, groups: [], qt: null, qtPos: {}, mixer: null, root: new THREE.Group(), ex: 0, exI: -1, anchor: {}, dt: 0.016,
  torch: [], W: {}, bridge: null, povT: null, povAt: null };
scene.add(NV.root);
const nvU8 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const nvJSON = async (f) => { const r = await fetch(f); if (!r.ok) throw new Error("không tải được " + f); return r.json(); };
const nvGLB = async (f) => { const u = nvU8((await nvJSON(f)).b64); return new Promise((ok, no) => new GLTFLoader().parse(u.buffer, "", ok, no)); };
const nvTexC = {};
const nvTex = (f) => nvTexC[f] || (nvTexC[f] = new THREE.TextureLoader().loadAsync(f).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t; }));
const nvF32 = (b) => new Float32Array(nvU8(b).buffer);
function nvGeo(index, uv, col, pB64, nB64, q) {
  const qa = new Int16Array(nvU8(pB64).buffer), pos = new Float32Array(qa.length);
  for (let i = 0; i < qa.length; i++) pos[i] = qa[i] * q;
  const g = new THREE.BufferGeometry(); g.setIndex(index);
  if (uv) g.setAttribute("uv", uv);
  if (col) g.setAttribute("color", col);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (nB64) { const na = new Int8Array(nvU8(nB64).buffer), nor = new Float32Array(na.length); for (let i = 0; i < na.length; i++) nor[i] = na[i] / 127; g.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); }
  else g.computeVertexNormals();
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 4);
  return g;
}
const idxAttr = (b64, big) => { const b = nvU8(b64); return new THREE.BufferAttribute(big ? new Uint32Array(b.buffer) : new Uint16Array(b.buffer), 1); };
// người (v3): thân + khung bàn tay
async function nvHum(f, texf) {
  const j = await nvJSON(f), mat = new THREE.MeshLambertMaterial({ map: await nvTex(texf) }), clips = {};
  const index = idxAttr(j.idx, j.idx32), uv = new THREE.BufferAttribute(nvF32(j.uv), 2);
  for (const [name, c] of Object.entries(j.clips))
    clips[name] = { fps: c.fps, once: !!c.once, mat, frames: c.pos.map((pb, k) => nvGeo(index, uv, null, pb, c.nor[k], j.q)),
      mg: Float32Array.from(c.mg), mt: c.mt ? Float32Array.from(c.mt) : null };
  return { hum: true, clips };
}
// voi có nài (v2): nhiều phần, tất cả nướng theo khung
async function nvFlip2(f) {
  const j = await nvJSON(f), clips = {};
  const parts = await Promise.all(j.parts.map(async (p) => ({ mat: p.tex ? new THREE.MeshLambertMaterial({ map: await nvTex(p.tex) }) : new THREE.MeshLambertMaterial({ vertexColors: true }),
    index: idxAttr(p.idx), uv: p.uv ? new THREE.BufferAttribute(nvF32(p.uv), 2) : null, col: p.col ? new THREE.BufferAttribute(nvF32(p.col), 3) : null })));
  for (const [name, c] of Object.entries(j.clips))
    clips[name] = { fps: c.fps, mats: parts.map((p) => p.mat), frames: c.pos.map((fp, k) => fp.map((pb, pi) => nvGeo(parts[pi].index, parts[pi].uv, parts[pi].col, pb, c.nor[k][pi], j.q))) };
  return { flip: true, clips };
}
// ngựa có người cưỡi (v4): thân ngựa nướng theo khung; người cưỡi, giáo cứng, đi theo xương lưng (ma trận m mỗi khung)
async function nvAni(f) {
  const j = await nvJSON(f), anim = [], rigid = [];
  for (const p of j.parts) {
    const P = { mat: p.tex ? new THREE.MeshLambertMaterial({ map: await nvTex(p.tex) }) : new THREE.MeshLambertMaterial({ vertexColors: true }),
      index: idxAttr(p.idx), uv: p.uv ? new THREE.BufferAttribute(nvF32(p.uv), 2) : null, col: p.col ? new THREE.BufferAttribute(nvF32(p.col), 3) : null };
    if (p.rigid) { P.geo = nvGeo(P.index, P.uv, P.col, p.pos, p.nor || null, j.q); rigid.push(P); } else anim.push(P);
  }
  const clips = {};
  for (const [name, c] of Object.entries(j.clips))
    clips[name] = { fps: c.fps, mats: anim.map((p) => p.mat), frames: c.pos.map((fp, k) => fp.map((pb, pi) => nvGeo(anim[pi].index, anim[pi].uv, anim[pi].col, pb, c.nor[k][pi], j.q))),
      m: c.m.map((a) => new THREE.Matrix4().set(a[0], a[1], a[2], a[9], a[3], a[4], a[5], a[10], a[6], a[7], a[8], a[11], 0, 0, 0, 1)) };
  return { ani: true, clips, rigid };
}
// ------------------------------------------------------------------ binh khí (toạ độ tay cầm: +Y hướng mũi, gốc ở nắm tay)
function nvMerge(list) {
  const P = [], N = [], C = [], I = []; let base = 0;
  for (const [g, c] of list) {
    const p = g.attributes.position, n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(...c); }
    const ix = g.index.array; for (let i = 0; i < ix.length; i++) I.push(ix[i] + base); base += p.count;
  }
  const g = new THREE.BufferGeometry(); g.setIndex(I);
  g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 3); return g;
}
const nvCy = (r0, r1, h, y) => new THREE.CylinderGeometry(r1, r0, h, 6).translate(0, y, 0);
const nvBx = (x, h, z, y) => new THREE.BoxGeometry(x, h, z).translate(0, y, 0);
const GO = [0.43, 0.29, 0.15], SAT = [0.76, 0.76, 0.8], SAM = [0.17, 0.16, 0.17];
const NV_VK = {      // 1 súng hỏa hồ · 2 giáo · 3 gươm · 4 đuốc; tip: đầu nòng / ngọn lửa
  1: { geo: nvMerge([[nvBx(0.05, 0.4, 0.09, -0.2), [0.36, 0.22, 0.12]], [nvCy(0.013, 0.011, 1.05, 0.52), SAM]]), tip: 1.05 },
  2: { geo: nvMerge([[nvCy(0.016, 0.016, 2.6, 0.4), GO], [new THREE.ConeGeometry(0.034, 0.32, 6).translate(0, 1.86, 0), SAT], [new THREE.ConeGeometry(0.055, 0.14, 6).rotateX(Math.PI).translate(0, 1.66, 0), [0.72, 0.1, 0.08]]]), tip: 2 },
  3: { geo: nvMerge([[nvCy(0.018, 0.018, 0.2, -0.06), [0.15, 0.1, 0.07]], [nvBx(0.12, 0.025, 0.045, 0.05), [0.55, 0.43, 0.2]], [nvBx(0.042, 0.8, 0.008, 0.46), SAT]]), tip: 0.86 },
  4: { geo: nvMerge([[nvCy(0.02, 0.018, 0.8, 0.05), GO], [nvCy(0.042, 0.03, 0.16, 0.5), [0.16, 0.12, 0.1]]]), tip: 0.66 } };
const NV_VKMAT = new THREE.MeshLambertMaterial({ vertexColors: true });
const NV_BUC = new THREE.BoxGeometry(1.3, 1, 1.3).translate(0, 0.5, 0), NV_BUCMAT = new THREE.MeshLambertMaterial({ color: 0x6e5236 }), _ns2 = new THREE.Vector3();
// cờ xí (V10.2): 5 cờ Tây Sơn (đỏ, mặt trời vàng, viền vàng), 6 cờ Thanh (long kỳ vàng) – ảnh cờ anh gửi; vải bay theo gió (sóng trong vertex shader)
const CO_T = { value: 0 };
function coMat(f) {
  const m = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  nvTex(f).then((t) => { m.map = t; m.needsUpdate = true; });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = CO_T;
    sh.vertexShader = "uniform float uT;\nattribute vec2 coUV;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      float coPh = 0.0;
      #ifdef USE_INSTANCING
        coPh = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;
      #endif
      transformed.z += sin(coUV.x * 5.5 - uT * 5.0 + coPh) * 0.12 * coUV.x;
      transformed.y -= 0.05 * coUV.x * coUV.x;`);
  };
  m.customProgramCacheKey = () => "co-" + f;
  return m;
}
function coGeo() { const g = new THREE.PlaneGeometry(1.15, 0.77, 12, 2).translate(0.6, 2.02, 0); g.setAttribute("coUV", g.attributes.uv.clone()); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 4); return g; }
const CO_CAN = nvMerge([[nvCy(0.02, 0.018, 3.75, 0.62), GO], [new THREE.ConeGeometry(0.05, 0.18, 6).translate(0, 2.58, 0), [0.85, 0.66, 0.2]]]);
NV_VK[5] = { geo: CO_CAN, flag: coGeo(), fmat: coMat("co_tayson.jpg"), tip: 2.5 };
NV_VK[6] = { geo: CO_CAN, flag: coGeo(), fmat: coMat("co_thanh.jpg"), tip: 2.5 };
const _wm = new THREE.Matrix4(), _wx = new THREE.Vector3(), _wy = new THREE.Vector3(), _wz = new THREE.Vector3();
function nvGrip(C, f, two, up) {                                 // khung tay cầm tại khung hình f; up: dựng thẳng (đứng nghiêm)
  const A = two && C.mt ? C.mt : C.mg, o = f * 9;
  _wy.set(A[o], A[o + 1], A[o + 2]).normalize(); _wz.set(A[o + 3], A[o + 4], A[o + 5]);
  if (up) { _wy.set(0, up, 0); _wz.y = 0; if (_wz.lengthSq() < 1e-4) _wz.set(1, 0, 0); }
  _wz.addScaledVector(_wy, -_wz.dot(_wy)).normalize(); _wx.crossVectors(_wy, _wz);
  return _wm.makeBasis(_wx, _wy, _wz).setPosition(A[o + 6], A[o + 7], A[o + 8]);
}
// tay cầm giáo của người cưỡi ngựa (suy từ hình cây giáo: vòng đầu cán = o − g, vòng cuối = o + 1,6 g)
function nvGripNgua(K) {
  if (K.grip) return K.grip;
  const p = K.rigid[1].geo.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i < 12; i++) { v.fromBufferAttribute(p, i); (i % 2 ? b : a).add(v); }
  a.multiplyScalar(1 / 6); b.multiplyScalar(1 / 6);
  const gs = b.clone().sub(a).normalize(), o = a.clone().addScaledVector(gs, 1.0), gy = new THREE.Vector3(0, 1, 0);   // cán cờ dựng thẳng tại nắm tay
  const gz = new THREE.Vector3(0, 0, 1); gz.addScaledVector(gy, -gz.dot(gy)).normalize(); const gx = new THREE.Vector3().crossVectors(gy, gz);
  return (K.grip = new THREE.Matrix4().makeBasis(gx, gy, gz).setPosition(o));
}
// ------------------------------------------------------------------ tấm mộc ghép: 3 tấm (mẫu khien-tam-moc của anh) thành 1 bức lớn + 4 đòn khiêng dọc
function nvMocGhep(gltf) {
  gltf.scene.updateMatrixWorld(true); const src = [];
  gltf.scene.traverse((o) => { if (o.isMesh) { const m = o.material; src.push({ geo: o.geometry, mat: new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color }), M: o.matrixWorld.clone() }); } });
  const bb = new THREE.Box3(); for (const p of src) { p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox.clone().applyMatrix4(p.M)); }
  const w = bb.max.x - bb.min.x, parts = [];
  // V10.7: bức mộc 3 tấm dựng gần thẳng (ngả nhẹ 8°), cao hơn đầu người; khung đòn gọn phía sau: 2 đòn ngang đúng tầm tay
  // của 2 hàng × 5 người (cách lưng mộc 0,33 m và 0,93 m, cao 0,81 m) + 3 đòn dọc nối về lưng mộc
  const T = new THREE.Matrix4().makeTranslation(0, 0.22, 0).multiply(new THREE.Matrix4().makeRotationX(-0.14))
    .multiply(new THREE.Matrix4().makeTranslation(0, -bb.min.y, -bb.min.z));
  for (const dx of [-w * 0.97, 0, w * 0.97]) for (const p of src) parts.push({ geo: p.geo, mat: p.mat, M: T.clone().multiply(new THREE.Matrix4().makeTranslation(dx, 0, 0).multiply(p.M)) });
  const pm = new THREE.MeshLambertMaterial({ color: 0x6b4a2a }), W3 = w * 2.9;
  for (const z of [-0.33, -0.93]) parts.push({ geo: new THREE.BoxGeometry(W3 * 0.92, 0.07, 0.07), mat: pm, M: new THREE.Matrix4().makeTranslation(0, 0.81, z), pole: true });
  for (const x of [-W3 * 0.42, 0, W3 * 0.42]) parts.push({ geo: new THREE.BoxGeometry(0.07, 0.07, 1.0), mat: pm, M: new THREE.Matrix4().makeTranslation(x, 0.81, -0.5), pole: true });
  return { flip: false, parts };
}
// ------------------------------------------------------------------ cầu phao sông Hồng (Tây Long – Bồ Đề): thuyền nối nhau, ván lát trên
function nvCau() {
  // vắt ngang sông Hồng (lòng sông rộng ~680 m) qua mốc Cầu phao, vuông góc dòng chảy; khớp với tuyến P_CAU trong build_quan10.py
  const A = [2420, 6947], B = [3092, 7205], L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L, s0 = 0, s1 = L;
  const top = meta.water + 0.75, n = Math.ceil((s1 - s0) / 5.5), yaw = Math.atan2(dx, -dy);
  const thuyen = new THREE.InstancedMesh(new THREE.BoxGeometry(7.4, 1.1, 2.2), new THREE.MeshLambertMaterial({ color: 0x2e2118 }), n);
  const van = new THREE.InstancedMesh(new THREE.BoxGeometry(4.4, 0.16, 5.6), new THREE.MeshLambertMaterial({ color: 0xc9a46c }), n);
  const q = new THREE.Quaternion().setFromAxisAngle(_nY, yaw), one = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const s = s0 + (k + 0.5) * (s1 - s0) / n, x = A[0] + dx * s, y = A[1] + dy * s;
    p.set(x, (meta.water + 0.15) * EX, -y); thuyen.setMatrixAt(k, M.compose(p, q, one));
    p.set(x, (top - 0.06) * EX, -y); van.setMatrixAt(k, M.compose(p, q, one));
  }
  for (const m of [thuyen, van]) { m.frustumCulled = false; scene.add(m); }
  if (window.NHDD) { NHDD.nvb = () => NV.bridge; NHDD.anc = (id) => NV.anchor[id]; NHDD.h = (x, y) => heightAt(x, y); NHDD.NV = NV; NHDD.camAt = (id, dx, dy, z, tz) => { const A = NV.anchor[id]; NHDD.cam(A.X + dx, A.Y + dy, A.y / EX + z, A.X, A.Y, A.y / EX + tz); }; NHDD.arr = () => [arrowGroup.visible, arrowGroup.position.y, camera.position.y, arrowGroup.children.length, arrowGroup.children.filter((c) => c.visible).length, typeof arrowState !== "undefined" ? arrowState : ""]; }
  const sA = Math.hypot(2420 - 2184, 6947 - 6910), inst = [];
  for (let k = 0; k < n; k++) inst.push(s0 + (k + 0.5) * (s1 - s0) / n);
  NV.bridge = { A, dx, dy, s0, s1, top, sA, inst, thuyen, van, yaw, cat: false };
}
// ------------------------------------------------------------------ trại Hà Hồi (ngoài khung, minh hoạ): lều vải, rào gỗ vòng ngoài, cổng phía nam
function nvTraiHaHoi() {
  const C = [3900, -13960]; let r0 = 4242;
  const rnd = () => ((r0 = (r0 * 16807) % 2147483647) / 2147483647);
  const leu = []; while (leu.length < 46) { const r = 14 + 62 * Math.sqrt(rnd()), a = rnd() * 6.283; const x = C[0] + r * Math.cos(a), y = C[1] + r * Math.sin(a); if (leu.every(([px, py]) => Math.hypot(px - x, py - y) > 7.5)) leu.push([x, y, rnd() * 3]); }
  const tg = new THREE.ConeGeometry(2.6, 2.7, 4).rotateY(Math.PI / 4).translate(0, 1.35, 0), tm = new THREE.MeshLambertMaterial({ color: 0xd8ccb0 });
  const T = new THREE.InstancedMesh(tg, tm, leu.length), M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  leu.forEach(([x, y, a], k) => { q.setFromAxisAngle(_nY, a); p.set(x, nvGround(x, y), -y); T.setMatrixAt(k, M.compose(p, q, one)); });
  const posts = []; for (let a = 0; a < 6.283; a += 3 / 92) if (Math.abs(a - 4.712) > 0.09) posts.push(a);
  const P = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 2.6, 0.22).translate(0, 1.3, 0), new THREE.MeshLambertMaterial({ color: 0x5b4330 }), posts.length);
  posts.forEach((a, k) => { const x = C[0] + 92 * Math.cos(a), y = C[1] + 92 * Math.sin(a); q.identity(); p.set(x, nvGround(x, y), -y); P.setMatrixAt(k, M.compose(p, q, one)); });
  for (const m of [T, P]) { m.frustumCulled = false; scene.add(m); }
}
// cờ Thanh cắm ở doanh trại: [tên, cảnh đầu, cảnh cuối, các vị trí]; ẩn khi doanh trại đã mất
function nvCoTrai() {
  const L = D.inst.leu, kt = [];
  for (let k = 0, n = 0; k < L.length; k += 6) if (Math.hypot(L[k] + 1094, L[k + 1] - 4236) < 800 && (n++ % 45 === 0)) kt.push([L[k] + 3, L[k + 1] + 3]);
  const hh = []; for (let a = 0.3; a < 6.28; a += 6.283 / 8) hh.push([3900 + 94 * Math.cos(a), -13960 + 94 * Math.sin(a)]); hh.push([3900, -13960]);
  const nh = [[-186, -60], [-186, 0], [-186, 60], [-172, -122], [-172, 122], [172, -122], [172, 122], [0, 0], [60, -60], [60, 60]].map(([u, v]) => fxF(u, v));
  const tl = [[2184, 6930], [2200, 6890], [2160, 6905], [2410, 6950]];
  NV.coTrai = [["nh", 0, 9.9, nh], ["hh", 0, 6, hh], ["kt", 1, 11, kt], ["tl", 1, 12, tl]].map(([id, a, b, P]) => {
    const pole = new THREE.InstancedMesh(CO_CAN, NV_VKMAT, P.length), fl = new THREE.InstancedMesh(NV_VK[6].flag, NV_VK[6].fmat, P.length);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(3.2, 3.2, 3.2);
    P.forEach(([x, y], k) => { q.setFromAxisAngle(_nY, 0.6 + k); p.set(x, nvGround(x, y) + 1.25 * 3.2, -y); M.compose(p, q, s); pole.setMatrixAt(k, M); fl.setMatrixAt(k, M); });
    for (const m of [pole, fl]) { m.frustumCulled = false; scene.add(m); }
    return { a, b, ms: [pole, fl] };
  });
}
function nvCauCat(on) {                                        // C13: Tôn Sĩ Nghị qua sông rồi cho chặt đứt cầu phao
  const B = NV.bridge; if (!B || !NV.catcau || B.cat === on) return; B.cat = on;
  const [g0, g1] = NV.catcau.gap, M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  B.inst.forEach((s, k) => {
    const sp = s + B.sA; if (sp < g0 - 6 || sp > g1 + 6) return;
    const x = B.A[0] + B.dx * s, y = B.A[1] + B.dy * s, roi = on && sp > g0 && sp < g1, k2 = (k % 3) - 1;
    const dr = roi ? 18 + 14 * k2 : 0;                           // nhịp bị chặt trôi theo dòng
    q.setFromAxisAngle(_nY, B.yaw + (roi ? 0.5 + 0.4 * k2 : 0));
    p.set(x - B.dy * dr, (meta.water + (roi ? -0.2 : 0.15)) * EX, -(y + B.dx * dr)); B.thuyen.setMatrixAt(k, M.compose(p, q, one));
    p.y = (roi ? meta.water + 0.35 : B.top - 0.06) * EX; B.van.setMatrixAt(k, M.compose(p, q, roi && k % 2 ? new THREE.Vector3(0, 0, 0) : one));
  });
  B.thuyen.instanceMatrix.needsUpdate = true; B.van.instanceMatrix.needsUpdate = true;
}
function nvGround(X, Y, cau) {
  let h = Math.max(heightAt(X, Y), meta.water - 0.7);
  const B = NV.bridge;
  if (cau && B) { const rx = X - B.A[0], ry = Y - B.A[1], s = rx * B.dx + ry * B.dy, d = Math.abs(rx * B.dy - ry * B.dx); if (s > B.s0 - 4 && s < B.s1 + 4 && d < 3.5 && !(B.cat && s + B.sA > NV.catcau.gap[0] && s + B.sA < NV.catcau.gap[1])) h = Math.max(h, B.top); }
  return h * EX;
}
async function nvLoad() {
  const [snd, nguatsn] = await Promise.all([nvHum("nv_samnghidong.json", "nv_samnghidong.jpg"), nvAni("nv_ngua_tsn.json")]);
  const [Q, ts, th, tsn, voi, ngua, nguath, moc, qt] = await Promise.all([
    nvJSON("quan.json"), nvHum("nv_tayson.json", "nv_tayson.jpg"), nvHum("nv_thanh.json", "nv_thanh.jpg"), null,
    nvFlip2("nv_voi_nai.json"), nvAni("nv_ngua_ts.json"), nvAni("nv_ngua_th.json"), nvGLB("m_tammoc.json"), nvGLB("m_quangtrung.json")]);
  NV.kinds = { ts, th, tsn, voi, ngua, nguath, nguatsn, snd, moc: nvMocGhep(moc) };
  NV.catcau = Q.catcau || null;
  for (const g of Q.groups) {
    g.meshes = new Map(); g.n = g.m.length; g.cap = g.n * ((g.kind === "ts" || g.kind === "th") && g.dense !== 0 ? 3 : 1);
    if (g.mode === "path") { g.cum = [0]; for (let k = 1; k < g.path.length; k++) g.cum.push(g.cum[k - 1] + Math.hypot(g.path[k][0] - g.path[k - 1][0], g.path[k][1] - g.path[k - 1][1])); }
    NV.groups.push(g);
  }
  NV.qt = qt.scene; NV.qtPos = Q.quangtrung; NV.qt.visible = false;
  NV.qt.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  scene.add(NV.qt);
  NV.mixer = new THREE.AnimationMixer(NV.qt); if (qt.animations[0]) NV.mixer.clipAction(qt.animations[0]).play();
  try { nvCau(); } catch (e) { console.warn("cầu phao", e); }
  try { nvTraiHaHoi(); } catch (e) { console.warn("trại Hà Hồi", e); }
  try { nvCoTrai(); } catch (e) { console.warn("cờ doanh trại", e); }
  fxInit();
  NV.ok = true;
}
const NV_MAU = { ts: [[1, 1, 1], [0.74, 0.62, 0.54], [0.84, 0.58, 0.52], [0.92, 0.82, 0.74]].map((c) => new THREE.Color(...c)),
  th: [[1, 1, 1], [0.86, 0.86, 0.9], [0.76, 0.75, 0.72], [0.95, 0.92, 0.85]].map((c) => new THREE.Color(...c)) };
function nvMesh(g, key, geo, mat) {
  let im = g.meshes.get(key);
  if (!im) { im = new THREE.InstancedMesh(geo, mat, g.cap); im.frustumCulled = false; im.count = 0; NV.root.add(im); g.meshes.set(key, im); }
  return im;
}
function nvState(g, i, u) {
  const sc = g.sc[i]; if (!sc) return null;
  const segs = sc.s; let ox = sc.o ? sc.o[0] : 0, oy = sc.o ? sc.o[1] : 0, clip = segs[0][2], s = segs[0][3], mvx = 0, mvy = 0, cs = segs[0];
  for (const q of segs) {
    if (u < q[0]) break;
    const k = Math.min(1, (u - q[0]) / Math.max(1e-6, q[1] - q[0])); clip = q[2]; cs = q;
    if (g.mode === "path") { s = q[3] + (q[4] - q[3]) * k; mvx = q[4] - q[3]; }
    else { ox += q[3] * k; oy += q[4] * k; if (k < 1) { mvx = q[3]; mvy = q[4]; } }
  }
  if (g.mode === "path" && u < segs[0][0]) s = segs[0][3];
  return { clip, ox, oy, s, mvx, mvy, u0: cs[0], spd: cs[5] || 1, moving: g.mode === "path" ? cs[4] !== cs[3] && u <= cs[1] : (mvx || mvy) && u <= cs[1] };
}
function nvPathAt(g, s) {
  const P = g.path, C = g.cum; s = Math.min(Math.max(s, 0), C[C.length - 1] - 0.01);
  let k = 1; while (k < C.length - 1 && C[k] < s) k++;
  const a = P[k - 1], b = P[k], t = (s - C[k - 1]) / (C[k] - C[k - 1]), dx = (b[0] - a[0]) / (C[k] - C[k - 1]), dy = (b[1] - a[1]) / (C[k] - C[k - 1]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, dx, dy];
}
const _nq = new THREE.Quaternion(), _nq2 = new THREE.Quaternion(), _nm = new THREE.Matrix4(), _nm2 = new THREE.Matrix4(), _np = new THREE.Vector3(), _ns = new THREE.Vector3(), _nt = new THREE.Vector3(), _nY = new THREE.Vector3(0, 1, 0), _nX = new THREE.Vector3(1, 0, 0);
const NV_ALIAS = { ts: { nghi: "dung", khom: "buoc", di: "chay", vapnga: "nga", vap: "nga", tuan: "chay", kiem: "danh", bodao: "danh" },
  th: { nghi: "dung", khom: "chay", buoc: "di", khieng: "chay", vapnga: "vap", kiem: "danh", bodao: "danh" },
  tsn: { nghi: "dung", tuan: "di", vap: "chay", vapnga: "chay" } };
const NV_DIDONG = new Set(["chay", "khieng", "buoc", "tuan", "di", "vap"]);
function nvVk(g, k, raw) {                                       // binh khí của thành viên k
  if (raw === "khieng") return 0;
  let w = g.vk ? g.vk[k % g.vk.length] : 0;
  if (!w && g.vk2 && raw !== "dung") w = g.vk2[k % g.vk2.length];
  if (g.duoc && k % g.duoc === 0 && nightCur > 0.35) w = 4;
  if (g.co && k % g.co === (g.co >> 1)) w = g.kind === "th" ? 6 : 5;   // người cầm cờ
  return w;
}
function nvClip(g, K, raw, k, w) {
  let n = (NV_ALIAS[g.kind] || {})[raw] || raw;
  if (n === "danh") n = w === 2 ? "dam" : w === 3 ? (k % 2 ? "chem" : "bua") : "bua";
  if (n === "ngam" && w !== 1) n = w >= 5 ? "dung" : "thu";
  if (w >= 5 && (n === "chem" || n === "bua" || n === "dam" || n === "thu")) n = "dung";    // người cầm cờ không xông vào đánh
  if (n === "nga" && g.kind === "th" && k % 2) n = "nga2";
  if (!K.clips[n]) n = K.clips[raw] ? raw : K.clips.dung ? "dung" : Object.keys(K.clips)[0];
  return n;
}
function nvFrame(C, time, ph, spd, tSeg) {
  const n = C.frames.length; if (n === 1) return 0;
  if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg - ph * 0.5) * C.fps));
  return Math.floor(time * C.fps * spd + ph * n) % n;
}
const NV_LOP = [[0, 0], [0.85, -1.0], [-0.85, -2.0]];            // nhân bản lớp sau khi nhìn toàn cảnh (quân đứng yên)
function nvApply(i, u, time) {
  if (!NV.ok) return;
  const vis = NV.on && $("ly-nv").checked, dur = S && S.scenes[i] ? S.scenes[i].dur : 60; NV.torch.length = 0; NV.povAt = null;
  const PT = NV.povT; NV.mocPts = [];
  NV.cutOn = !!(NV.catcau && ((i === NV.catcau.i && u >= NV.catcau.u) || i > NV.catcau.i)); nvCauCat(NV.cutOn);
  for (const g of NV.groups) {
    for (const im of g.meshes.values()) im.count = 0;
    const stt = vis ? nvState(g, i, u) : null;
    if (!stt || stt.clip === "an") continue;
    const K = NV.kinds[g.kind]; if (!K) continue;
    let cx, cy;
    if (g.mode === "path") [cx, cy] = nvPathAt(g, stt.s); else { cx = g.m[0][0] + stt.ox; cy = g.m[0][1] + stt.oy; }
    const dist = camera.position.distanceTo(_np.set(cx, heightAt(cx, cy) * EX, -cy));
    if (dist > 6000) continue;
    const sc = THREE.MathUtils.clamp(dist / 450, 1, 2); _ns.set(sc, sc, sc);
    const moveYaw = g.mode === "path" ? null : Math.atan2(stt.mvx, -stt.mvy), near = dist < 1500;
    const hum = !!K.hum, dense = hum && g.dense !== 0, reps = dense && dist > 600 && !stt.moving ? 3 : 1, thin = dense && dist < 260 && stt.moving;
    const cutS = g.cat && NV.cutOn && NV.catcau && i === NV.catcau.i ? nvState(g, i, NV.catcau.u) : null;
    const NG = g.nga && g.nga[i], sttF = NG ? nvState(g, i, NG[1]) : null, loan = g.loan && (stt.clip === "chay" || stt.clip === "vap") && !(g.tan && g.tan[i] && g.mode === "fixed");
    for (let k = 0; k < g.n; k++) {
      if (thin && k % 3 === 2) continue;
      const m = g.m[k], ga = !!(NG && k % NG[0] === 0 && u >= NG[1]), S0 = ga ? sttF : stt;
      const ph = g.mode === "path" ? m[2] : m[3], va = g.mode === "path" ? m[3] : m[4];
      let X, Y, yaw, chim = false, ket = false;
      if (g.mode === "path") {
        let al = m[0], lat = m[1];
        const RA = g.rai && g.rai[i];
        if (RA && u > RA[0]) { const kp = Math.min(1, (u - RA[0]) / (1 - RA[0])); al += (ph - 0.5) * 2 * RA[1] * kp; lat += ((va - 1.5) / 1.5) * RA[2] * kp + Math.sin(ph * 91) * RA[2] * 0.5 * kp; }
        let sNow = S0.s + al;
        if (cutS) {                                              // cầu bị chặt: ai đã qua thì đi tiếp, ai đang ở nhịp cầu bị chặt thì rơi xuống sông, còn lại kẹt lại
          const GP = NV.catcau.gap, sC = cutS.s + m[0];
          if (sC < GP[1] && sC >= GP[0]) { chim = true; sNow = sC; }
          else if (sC < GP[0]) { const lim = sC + (GP[0] - 2 - sC) * 0.7; if (sNow > lim) { sNow = lim + Math.sin(time * 0.5 + ph * 30) * 0.6; ket = true; } }
        }
        if (loan && !ga) { al += (va - 1.5) * 2.2 + Math.sin(time * 0.4 + ph * 17) * 1.6; lat = lat * 1.6 + Math.sin(time * 0.6 + ph * 40) * 1.8 + (ph - 0.5) * 7; }
        const [px, py, dx, dy] = nvPathAt(g, sNow); X = px - dy * lat; Y = py + dx * lat; yaw = Math.atan2(dx, -dy);
        if (ket) yaw += Math.PI * (k % 3 === 0 ? 1 : 0) + Math.sin(ph * 40) * 0.8;
      } else {
        X = m[0] + S0.ox; Y = m[1] + S0.oy; yaw = S0.moving && g.kind !== "moc" ? moveYaw : m[2];
        if (loan && !ga) { const a = (ph - 0.5) * 9 + Math.sin(time * 0.5 + ph * 23) * 2.5; X += Math.cos(yaw) * a; Y += Math.sin(yaw) * a; }
      }
      const TO = g.toa && g.toa[i];
      if (TO && u > TO[0] && !ga) {                              // vượt lũy rồi tỏa ra đánh vào các lều trại, không theo hàng lối
        if (!g.toaP || g.toaI !== i) { g.toaI = i; const s0 = nvState(g, i, TO[0]); g.toaP = g.m.map((mm) => [mm[0] + s0.ox, mm[1] + s0.oy]); }
        const kk = Math.min(1, (u - TO[0]) / ((TO[1] - TO[0]) * (0.55 + 0.45 * ph))), e = kk * kk * (3 - 2 * kk);
        const tg = fxF(-150 + ph * 290, (va / 3 - 0.5) * 200 + Math.sin(ph * 77) * 45), P0 = g.toaP[k];
        X = P0[0] + (tg[0] - P0[0]) * e; Y = P0[1] + (tg[1] - P0[1]) * e;
        yaw = Math.atan2(tg[0] - P0[0], -(tg[1] - P0[1]));
        g._toaK = kk;
      } else g._toaK = -1;
      const TN = g.tan && g.tan[i];
      if (TN && u > TN[0]) {                                     // tháo chạy tứ phía khỏi trại, mỗi người một hướng
        const uu = ga ? NG[1] : u, k2 = Math.min(1, Math.max(0, (uu - TN[0]) / (TN[1] - TN[0])));
        const a = Math.atan2(Y - TN[4], X - TN[3]) + (ph - 0.5) * 1.8 + Math.sin(ph * 50) * 0.5, d = TN[2] * k2 * (0.45 + ph * 0.9);
        X += Math.cos(a) * d; Y += Math.sin(a) * d; yaw = Math.atan2(Math.cos(a), -Math.sin(a));
      }
      if (loan && !ga) yaw += Math.sin(time * 1.1 + ph * 31) * (TN ? 0.25 : 0.45) + (TN ? 0 : (ph - 0.5) * 0.7);
      let gy = nvGround(X, Y, g.cau);
      if (g.tren) gy = g.tren[0] * EX + g.tren[1];
      if (g.buc && !ga && !(S0.moving)) {                          // bục gỗ sau lũy: đứng cao, ngực ngang mặt lũy, vươn súng ra ngoài
        if (!g.bucY) g.bucY = g.m.map((mm) => { const P = [mm[0] - FX_EU[0] * 5, mm[1] - FX_EU[1] * 5]; return Math.max((heightAt(P[0], P[1]) - 1.0) * EX, heightAt(mm[0], mm[1]) * EX); });
        const top = g.bucY[k];
        if (top > gy + 0.1) { const bm = nvMesh(g, "buc", NV_BUC, NV_BUCMAT); _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _ns2.set(1, top - gy, 1); _nm.compose(_np, _nq, _ns2); bm.setMatrixAt(bm.count++, _nm); }
        gy = top;
      }
      if (chim) gy -= Math.min(1.8, (u - NV.catcau.u) * dur * 0.5);
      if (k === 0) NV.anchor[g.id] = { X, Y, yaw, y: gy };
      const isPov = PT && PT.gid === g.id && PT.k === k;
      if (isPov) NV.povAt = { X, Y, yaw, y: gy };
      let raw = ga || chim ? "nga" : ket ? (k % 3 === 1 ? "vap" : "dung") : S0.clip;
      if (g._toaK >= 0) raw = g._toaK < 1 ? "chay" : "danh";
      if (g.nhip && raw === "chay") raw = k % 5 === 0 ? "vap" : k % 5 === 1 ? "di" : "chay";
      if (K.hum) {
        const w = ga ? 0 : nvVk(g, k, raw), name = nvClip(g, K, raw, k, w), C = K.clips[name];
        const tSeg = chim ? (u - NV.catcau.u) * dur : ga ? (u - NG[1]) * dur : (u - S0.u0) * dur, f = nvFrame(C, time, ph, S0.spd * (g.nhip ? 0.75 + 0.5 * ph : 1), tSeg);
        const mau = NV_MAU[g.kind] ? NV_MAU[g.kind][va % 4] : null, im = nvMesh(g, name + ":" + f, C.frames[f], C.mat);
        const wim = w ? nvMesh(g, "w" + w, NV_VK[w].geo, NV_VKMAT) : null, two = w === 1 && name === "ngam";
        if (w) nvGrip(C, f, two, w >= 5 || ((w === 2 || w === 4) && NV_DIDONG.has(name)) ? 1 : name === "dung" ? (w === 3 ? -1 : 1) : 0);
        const fim = w >= 5 ? nvMesh(g, "f" + w, NV_VK[w].flag, NV_VK[w].fmat) : null;
        const sy = Math.sin(yaw), cyw = Math.cos(yaw);
        for (let r = 0; r < (ga ? 1 : reps); r++) {
          const [lx, lb] = NV_LOP[r], X2 = X + cyw * lx + sy * lb * 1, Y2 = Y + sy * lx - cyw * lb * 1;
          const y2 = r ? nvGround(X2, Y2, g.cau) : gy;
          _np.set(X2, y2, -Y2); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
          if (!(isPov && r === 0)) { const c = im.count++; im.setMatrixAt(c, _nm); if (mau) im.setColorAt(c, mau); }
          if (wim) { _nm2.multiplyMatrices(_nm, _wm); wim.setMatrixAt(wim.count++, _nm2); if (fim) fim.setMatrixAt(fim.count++, _nm2); }
          if (r === 0 && near && w) {
            if (w === 4 || (two && Math.random() < NV.dt * 0.22)) { _nt.set(0, NV_VK[w].tip, 0).applyMatrix4(_nm2); if (w === 4) NV.torch.push(_nt.x, _nt.y, _nt.z); else fxShot(_nt); }
          }
          if (r === 0 && near && (S0.moving || g._toaK >= 0 && g._toaK < 1 || (g.tan && g.tan[i] && u > g.tan[i][0])) && !ga && NV_DIDONG.has(name) && Math.random() < NV.dt * 0.35) fxBui(X, gy, Y, 1);
        }
      } else if (K.ani) {
        const C = K.clips[S0.clip] || K.clips.dung, f = nvFrame(C, time, ph, S0.spd, 0);
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
        C.frames[f].forEach((geo, pi) => { const im = nvMesh(g, S0.clip + ":" + f + ":" + pi, geo, C.mats[pi]); im.setMatrixAt(im.count++, _nm); });
        if (!isPov) {
          _nm2.multiplyMatrices(_nm, C.m[f]);
          K.rigid.forEach((p, pi) => { if (g.co && pi === 1) return; const im = nvMesh(g, "r" + pi, p.geo, p.mat); im.setMatrixAt(im.count++, _nm2); });
          if (g.co) {                                            // tướng cưỡi ngựa cầm cờ: cán cờ đặt đúng tay cầm giáo
            const G = nvGripNgua(K), w = 5, fm = _nm2.clone().multiply(G);
            const a = nvMesh(g, "w5", NV_VK[w].geo, NV_VKMAT), b = nvMesh(g, "f5", NV_VK[w].flag, NV_VK[w].fmat);
            a.setMatrixAt(a.count++, fm); b.setMatrixAt(b.count++, fm);
          }
        }
        if (near && S0.moving && Math.random() < NV.dt * 0.8) fxBui(X, gy, Y, 1.6);
      } else if (K.flip) {
        const C = K.clips[S0.clip] || K.clips.dung, f = nvFrame(C, time, ph, S0.spd, 0);
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
        C.frames[f].forEach((geo, pi) => { const im = nvMesh(g, S0.clip + ":" + f + ":" + pi, geo, C.mats[pi]); im.setMatrixAt(im.count++, _nm); });
        if (near && S0.moving && Math.random() < NV.dt * 1.2) fxBui(X, gy, Y, 2.4);
        if (g.linh && dist < 900) {                               // hai lính đứng trên bành voi cầm giáo, đâm khi xông vào kỵ binh Thanh
          const KT = NV.kinds.ts, cn = i === 8 && u > 0.08 && u < 0.62 ? "dam" : "dung", CC = KT.clips[cn];
          for (const [ox, oz, p2] of [[0.36, 0.1, 0.1], [-0.36, -0.25, 0.6]]) {
            const f2 = nvFrame(CC, time, ph + p2, 1, 0);
            _nt.set(ox, 2.62, oz); _nm2.copy(_nm).multiply(_wm.makeTranslation(_nt.x, _nt.y, _nt.z));
            const im = nvMesh(g, "L" + cn + ":" + f2, CC.frames[f2], CC.mat); im.setMatrixAt(im.count++, _nm2);
            const G = nvGrip(CC, f2, false, cn === "dung" ? 1 : 0), gm = _nm2.clone().multiply(G), wim = nvMesh(g, "Lw2", NV_VK[2].geo, NV_VKMAT); wim.setMatrixAt(wim.count++, gm);
          }
        }
      } else {                                                    // tấm mộc ghép
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw);
        const nam = S0.clip === "nam";
        if (nam) { _nq2.setFromAxisAngle(_nX, -Math.PI / 2); _nq.multiply(_nq2); _np.y += 0.1; }
        else if (i === 8 || i === 9) NV.mocPts.push(X, gy, Y, yaw);
        K.parts.forEach((p, pi) => { if (nam && p.pole) return; const im = nvMesh(g, "p" + pi, p.geo, p.mat); _nm.compose(_np, _nq, _ns).multiply(p.M); im.setMatrixAt(im.count++, _nm); });
      }
    }
    for (const im of g.meshes.values()) if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  }
  // Quang Trung: đứng trên bành voi chỉ huy, hoặc đứng đất
  const q = NV.qtPos[i]; let qx, qy, qz, qyaw;
  if (q && q.g && NV.anchor[q.g] && NV.groups.find((g) => g.id === q.g && g.sc[i])) {
    const A = NV.anchor[q.g], c = Math.cos(A.yaw), s = Math.sin(A.yaw);
    qx = A.X + q.off[0] * c - q.off[1] * s; qy = A.Y + q.off[0] * s + q.off[1] * c; qz = A.y + q.off[2]; qyaw = A.yaw;
  } else if (q && !q.g) { qx = q[0]; qy = q[1]; qz = nvGround(q[0], q[1]); qyaw = q.length > 2 ? q[2] : Math.PI; }
  const qtOn = vis && qx !== undefined;
  if (qtOn && PT && PT.gid === "qt") NV.povAt = { X: qx, Y: qy, yaw: qyaw, y: qz };
  NV.qt.visible = !!(qtOn && !(PT && PT.gid === "qt") && camera.position.distanceTo(_np.set(qx, qz, -qy)) < 3000);
  if (NV.qt.visible) { NV.qt.position.set(qx, qz, -qy); NV.qt.rotation.y = qyaw; }
}
function nvTick(dt) {
  if (!NV.ok || !S) return;
  NV.dt = dt;
  const time = performance.now() / 1000; let i = 0, u = 1;
  if (appMode === "film") { i = cur; u = Math.min(1, st / S.scenes[cur].dur); }
  else if (appMode === "explore") { i = exploreI; if (NV.exI !== i) { NV.exI = i; NV.ex = 0; } NV.ex += dt; u = (NV.ex % S.scenes[i].dur) / S.scenes[i].dur; }
  else i = cmpA;
  CO_T.value = time;
  if (NV.coTrai) { const iu = i + (appMode === "film" ? u : 0); for (const c of NV.coTrai) { const on = $("ly-nv").checked && iu >= c.a && iu <= c.b; c.ms.forEach((m) => { m.visible = on; }); } }
  nvApply(i, u, time);
  if (appMode !== "compare") fxTick(i, u, dt); else fxClear();
  if (NV.mixer) NV.mixer.update(dt);
  nvAvatarTick();
  povTick(i);
  // V10.3: mũi tên treo trên trời (cao 320 m): nhìn toàn cảnh từ trên cao vẫn thấy, xuống mặt đất thì nằm phía trên, không che quân
  arrowGroup.position.y = NV_MUITEN_CAO;
  arrowGroup.visible = $("ly-arr").checked && !document.body.classList.contains("m-pov") && camera.position.y > NV_MUITEN_CAO + 60;
}
// ------------------------------------------------------------------ góc nhìn nhân vật: nhìn qua mắt một người trong trận, phim vẫn chạy theo lời bình
const NV_MUITEN_CAO = 200;
var POV = null;
// địa điểm đứng xem: [tên, x, y, độ cao mắt so với đất (m)]; hướng nhìn ban đầu quay về đội quân gần nhất đang có trong cảnh
const POV_DD = [
  ["Gò trước đồn Ngọc Hồi (phía nam)", 1083, -5455, 6], ["Trên lũy nam đồn Ngọc Hồi", 1068, -5338, 4.5], ["Trong đồn Ngọc Hồi", 1040, -5160, 1.7],
  ["Ven Đầm Mực", -1716, -4106, 1.7], ["Gò Loa Sơn – Đống Đa", -1080, 3880, 8], ["Doanh trại Khương Thượng", -1039.9, 4086.5, 1.7],
  ["Bến vượt sông Tô Lịch", -2028, 3588, 1.7], ["Đầu cầu phao (bờ Tây Long)", 2400, 6935, 2.2], ["Giữa cầu phao sông Hồng", 2756, 7076, 2.4],
  ["Cửa ô Cầu Dền", 1507.9, 4529.4, 1.7], ["Trước Hoàng thành Thăng Long", 468, 7230, 1.7], ["Trại Thanh ở Hà Hồi", 3900, -13930, 1.7],
  ["Gò ngoài vòng vây Hà Hồi", 3900, -14110, 6], ["Đường thiên lý – nơi quân hành quân", 2236, -8978, 1.7]];
const POV_VAI = [
  ["Vua Quang Trung", [["qt", 0, 1.62, 0.15]]],
  ["Lính khiêng mộc Tây Sơn", [["ts_khieng", 104, 1.6, 0.12]]],
  ["Lính xung kích Tây Sơn (gươm, giáo)", [["ts_xungkich", 212, 1.6, 0.12], ["ts_dongda", 6, 1.6, 0.12], ["ts_vao", 21, 1.6, 0.12], ["ts_hoangthanh", 40, 1.6, 0.12]]],
  ["Lính hành quân Tây Sơn", [["ts_hq", 22, 1.6, 0.12], ["ts_tapket", 150, 1.6, 0.12], ["ts_vay", 10, 1.6, 0.12], ["ts_bao", 30, 1.6, 0.12], ["ts_dubi", 40, 1.6, 0.12]]],
  ["Lính súng hỏa hồ", [["ts_sung", 10, 1.6, 0.12], ["ts_bao", 4, 1.6, 0.12]]],
  ["Kỵ binh Tây Sơn", [["ts_hq_ngua", 0, 2.45, 0.1], ["ts_ngua_tuong", 0, 2.45, 0.1], ["ts_ngua_dd", 0, 2.45, 0.1]]],
  ["Nài voi chiến", [["ts_voi", 0, 3.35, 1.5], ["ts_hq_voi", 0, 3.35, 1.5], ["ts_voi_dd", 0, 3.35, 1.5], ["ts_tapket_voi", 0, 3.35, 1.5]]],
  ["Lính Thanh giữ đồn", [["th_luy_nam", 3, 1.6, 0.12], ["th_tuantra0", 1, 1.6, 0.12], ["th_canve", 15, 1.6, 0.12], ["th_vao", 30, 1.6, 0.12], ["th_hahoi", 3, 1.6, 0.12], ["th_kt", 5, 1.6, 0.12]]],
  ["Lính Thanh tháo chạy", [["th_dammuc", 10, 1.6, 0.12], ["th_rut", 20, 1.6, 0.12], ["th_kt", 9, 1.6, 0.12], ["th_canve", 15, 1.6, 0.12]]],
  ["Kỵ binh Thanh", [["th_ky", 2, 2.45, 0.1], ["th_vao_ky", 0, 2.45, 0.1]]],
  ["Tôn Sĩ Nghị", [["th_tsn", 0, 1.66, 0.12]]]];
function povSet(on) {
  if (!POV) {
    POV = { vai: 0, dd: -1, ddYaw: null, ddI: -1, yaw: 0, pitch: -0.05, drag: null, eye: new THREE.Vector3(), has: false };
    const sel = $("povsel"), g1 = document.createElement("optgroup"), g2 = document.createElement("optgroup");
    g1.label = "Nhìn qua mắt nhân vật"; g2.label = "Đứng xem tại địa điểm";
    POV_VAI.forEach(([t], k) => { const o = document.createElement("option"); o.value = k; o.textContent = t; g1.append(o); });
    POV_DD.forEach(([t], k) => { const o = document.createElement("option"); o.value = "d" + k; o.textContent = t; g2.append(o); });
    sel.append(g1, g2);
    sel.onchange = (e) => { const v = e.target.value; POV.dd = v[0] === "d" ? +v.slice(1) : -1; POV.vai = POV.dd < 0 ? +v : 0; POV.yaw = 0; POV.pitch = POV.dd >= 0 ? -0.12 : -0.05; POV.has = false; POV.ddYaw = null; };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", (e) => { if (!document.body.classList.contains("m-pov")) return; POV.drag = [e.clientX, e.clientY]; });
    window.addEventListener("pointermove", (e) => { if (!POV.drag) return; POV.yaw -= (e.clientX - POV.drag[0]) * 0.005; POV.pitch = THREE.MathUtils.clamp(POV.pitch - (e.clientY - POV.drag[1]) * 0.004, -1.1, 0.9); POV.drag = [e.clientX, e.clientY]; });
    window.addEventListener("pointerup", () => { POV.drag = null; });
  }
  controls.enabled = !on; if (!on) { NV.povT = null; document.body.classList.remove("cancanh"); markers.visible = true; arrowGroup.visible = $("ly-arr").checked; camera.near = 2; camera.updateProjectionMatrix(); }
}
function povTick(i) {
  if (!POV || !document.body.classList.contains("m-pov")) { NV.povT = null; return; }
  let pick = null;
  if (POV.dd >= 0) {                                             // đứng tại địa điểm
    const [, x, y, h] = POV_DD[POV.dd];
    if (POV.ddYaw === null || POV.ddI !== i) {
      let best = null, bd = 4000;
      for (const g of NV.groups) { const A = NV.anchor[g.id]; if (!A || !g.sc[i]) continue; const d = Math.hypot(A.X - x, A.Y - y); if (d > 6 && d < bd) { bd = d; best = A; } }
      POV.ddYaw = best ? Math.atan2(best.X - x, -(best.Y - y)) : 0; POV.ddI = i;
    }
    NV.povT = null;
    const gy = nvGround(x, y, true), yw = POV.ddYaw + POV.yaw, cp = Math.cos(POV.pitch);
    $("povmsg").textContent = "Kéo màn hình để nhìn quanh · phim vẫn chạy theo lời bình";
    POV.eye.set(x, gy + h, -y); POV.has = true; camera.position.copy(POV.eye);
    controls.target.set(POV.eye.x + Math.sin(yw) * cp * 5, POV.eye.y + Math.sin(POV.pitch) * 5, POV.eye.z + Math.cos(yw) * cp * 5);
    camera.lookAt(controls.target);
    if (camera.near !== 0.05) { camera.near = 0.05; camera.updateProjectionMatrix(); }
    document.body.classList.add("cancanh"); markers.visible = false; return;
  }
  for (const [gid, k, h, fw] of POV_VAI[POV.vai][1]) {
    if (gid === "qt") { if (NV.qtPos[i]) { pick = { gid, k, h, fw }; break; } continue; }
    const g = NV.groups.find((x) => x.id === gid); if (!g || k >= g.n) continue;
    const s = nvState(g, i, appMode === "film" ? Math.min(1, st / S.scenes[i].dur) : 0.5); if (s && s.clip !== "an") { pick = { gid, k, h, fw }; break; }
  }
  NV.povT = pick;
  const A = NV.povAt;
  $("povmsg").textContent = pick && A ? "Kéo màn hình để quay đầu nhìn quanh · phim vẫn chạy theo lời bình" : "Nhân vật này không có trong cảnh hiện tại – đang xem toàn cảnh";
  if (!pick || !A) { if (POV.has) { POV.has = false; document.body.classList.remove("cancanh"); markers.visible = true; } return; }
  const yw = A.yaw + POV.yaw, fx = Math.sin(A.yaw), fz = Math.cos(A.yaw);
  const eye = _np.set(A.X + fx * pick.fw, A.y + pick.h, -A.Y + fz * pick.fw);
  if (POV.has) POV.eye.lerp(eye, 0.35); else POV.eye.copy(eye); POV.has = true;
  camera.position.copy(POV.eye);
  const cp = Math.cos(POV.pitch);
  controls.target.set(POV.eye.x + Math.sin(yw) * cp * 5, POV.eye.y + Math.sin(POV.pitch) * 5, POV.eye.z + Math.cos(yw) * cp * 5);
  camera.lookAt(controls.target);
  if (camera.near !== 0.05) { camera.near = 0.05; camera.updateProjectionMatrix(); }
  document.body.classList.add("cancanh"); markers.visible = false; arrowGroup.visible = false;
}

// ------------------------------------------------------------------ hiệu ứng: chớp lửa đầu súng, khói súng, đại bác, đạn rơi tung đất, doanh trại cháy, đuốc
const FX = { pools: {}, cannonT: 2, key: "", spots: [], emit: 0 };
function fxSprite(soft) {
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(soft ? 0.45 : 0.25, `rgba(255,255,255,${soft ? 0.55 : 0.8})`); gr.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
}
function fxPool(cap, size, additive, soft) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(cap * 3), col = new Float32Array(cap * 4);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 4).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.PointsMaterial({ size, map: fxSprite(soft), vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  return { cap, pts, pos, col, list: [] };
}
function fxInit() {
  FX.pools = { flash: fxPool(300, 6, true, false), lua: fxPool(2500, 7, true, true), khoiCot: fxPool(900, 34, false, true), duoc: fxPool(1200, 1.1, true, false),
    khoi: fxPool(1800, 5, false, true), bui: fxPool(2600, 7, false, true), khoiTo: fxPool(700, 13, false, true) };
}
function fxAdd(pool, x, y, z, vx, vy, vz, life, r, g, b, a) { const P = FX.pools[pool]; if (P.list.length < P.cap) P.list.push({ x, y, z, vx, vy, vz, t: 0, life, r, g, b, a }); }
function fxShot(p) {                                                    // súng tay: chớp lửa + khói trắng
  fxAdd("flash", p.x, p.y, p.z, 0, 0, 0, 0.12, 1, 0.85, 0.5, 1);
  for (let k = 0; k < 2; k++) fxAdd("khoi", p.x, p.y, p.z, (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6, 3 + Math.random() * 2, 0.82, 0.82, 0.8, 0.55);
}
function fxBui(X, y, Y, k) {                                         // bụi đất bốc lên dưới chân quân, ngựa, voi khi di chuyển
  const day = 1 - 0.75 * nightCur;
  fxAdd("bui", X + (Math.random() - 0.5) * 1.5 * k, y + 0.3, -Y + (Math.random() - 0.5) * 1.5 * k, (Math.random() - 0.5) * 0.5, 0.25 + Math.random() * 0.35, (Math.random() - 0.5) * 0.5,
    2.5 + Math.random() * 2, 0.6 * day, 0.53 * day, 0.42 * day, 0.16 + 0.05 * k);
}
function fxBoom(X, Y, big) {                                            // đại bác nổ / đạn rơi: chớp, khói, tung đất
  const y = nvGround(X, Y) + 1, z = -Y;
  fxAdd("flash", X, y, z, 0, 0, 0, 0.25, 1, 0.75, 0.35, 1); fxAdd("flash", X, y + 2, z, 0, 0, 0, 0.12, 1, 0.9, 0.6, 1);
  for (let k = 0; k < (big ? 6 : 3); k++) fxAdd("khoiTo", X + (Math.random() - 0.5) * 4, y + Math.random() * 2, z + (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 1.5, 1.2 + Math.random(), (Math.random() - 0.5) * 1.5, 4 + Math.random() * 3, big ? 0.46 : 0.75, big ? 0.38 : 0.74, big ? 0.3 : 0.72, 0.6);
}
function fxClear() { for (const P of Object.values(FX.pools)) { P.list.length = 0; P.pts.geometry.setDrawRange(0, 0); } }
// toạ độ khung đồn Ngọc Hồi (khớp build_quan9.py)
const FX_C0 = [1039.92, -5158.26], FX_EU = [-0.15986, 0.98714], FX_EV = [0.98714, 0.15986];
const fxF = (u, v) => [FX_C0[0] + FX_EU[0] * u + FX_EV[0] * v, FX_C0[1] + FX_EU[1] * u + FX_EV[1] * v];
function fxSpots(i) {                                                   // các đám cháy theo cảnh
  const L = D.inst.leu, out = [], st = 6;
  if (i === 9 || i === 10) {
    for (let k = 0; k < L.length; k += st) { const dx = L[k] - FX_C0[0], dy = L[k + 1] - FX_C0[1], uu = dx * FX_EU[0] + dy * FX_EU[1]; if (Math.abs(uu) < 170 && Math.abs(dx * FX_EV[0] + dy * FX_EV[1]) < 120 && uu < 40) out.push([L[k], L[k + 1]]); }
  } else if (i === 11) {
    for (let k = 0; k < L.length; k += st) if (Math.hypot(L[k] + 1039.9, L[k + 1] - 4086.5) < 900) out.push([L[k], L[k + 1]]);   // trại Khương Thượng
  }
  const pick = []; let r = 1789;
  for (let k = 0; k < Math.min(i === 11 ? 26 : 16, out.length); k++) { r = (r * 1103515245 + 12345) & 0x7fffffff; pick.push(out[r % out.length]); }
  return pick;
}
function fxTick(i, u, dt) {
  if (!FX.pools.flash) return;
  const key = appMode + ":" + i; if (key !== FX.key) { FX.key = key; FX.spots = fxSpots(i); fxClear(); }
  // đại bác trong đồn khai hoả về phía quân Tây Sơn (C09, C10 trước khi vỡ lũy)
  if ((i === 8 && u > 0.2) || (i === 9 && u < 0.74)) {
    FX.cannonT -= dt;
    if (FX.cannonT < 0) {
      FX.cannonT = 2.5 + Math.random() * 3.5;
      const U = D.inst.usung, n = U.length / 5, k = Math.floor(Math.random() * n) * 5;
      fxBoom(U[k], U[k + 1], false);
      const tgt = fxF(-300 - Math.random() * 140, (Math.random() - 0.5) * 300);
      setTimeout(() => fxBoom(tgt[0], tgt[1], true), 500 + Math.random() * 500);
      const d = camera.position.distanceTo(_np.set(U[k], nvGround(U[k], U[k + 1]), -U[k + 1]));
      if (typeof amShot === "function" && d < 1500) amShot("daibac", 0.5 * Math.max(0.15, 1 - d / 1500));
    }
  }
  // trong đồn bắn ra: vệt lửa và khói bám trên mặt tấm mộc đang tiến (C09 cuối, C10 trước khi bỏ mộc)
  if ((i === 8 && u > 0.45) || (i === 9 && u < 0.7)) {
    const M = NV.mocPts, nM = M.length / 4;
    if (nM) {
      FX.mocT = (FX.mocT || 0) - dt;
      if (FX.mocT < 0) {
        FX.mocT = 0.12 + Math.random() * 0.25; const k = Math.floor(Math.random() * nM) * 4, yw = M[k + 3];
        (FX.vet = FX.vet || []).push({ k: k / 4, dx: (Math.random() - 0.5) * 2.8, h: 0.5 + Math.random() * 1.6, t: 0, life: 4 + Math.random() * 6 });
        const fx_ = Math.sin(yw), fz = Math.cos(yw);
        _nt.set(M[k] - fx_ * -0.15, M[k + 1] + 1.3, -M[k + 2] - fz * 0.15);
        fxAdd("flash", _nt.x, _nt.y, _nt.z, 0, 0, 0, 0.1, 1, 0.8, 0.5, 1);
      }
      if (FX.vet) FX.vet = FX.vet.filter((v) => {
        v.t += dt; if (v.t > v.life || v.k * 4 >= M.length) return false;
        const b = v.k * 4, yw = M[b + 3], cx = Math.cos(yw), sx = Math.sin(yw);
        const X = M[b] + cx * v.dx - sx * -0.25, Y = M[b + 2] + sx * v.dx + cx * -0.25, y = M[b + 1] + v.h;
        if (camera.position.distanceTo(_np.set(X, y, -Y)) > 1200) return true;
        if (Math.random() < dt * 9) fxAdd("lua", X, y, -Y, (Math.random() - 0.5) * 0.2, 0.6 + Math.random() * 0.5, (Math.random() - 0.5) * 0.2, 0.5, 1, 0.45, 0.12, 0.7 * (1 - v.t / v.life));
        if (Math.random() < dt * 4) fxAdd("khoi", X, y + 0.3, -Y, (Math.random() - 0.5) * 0.3, 0.7, (Math.random() - 0.5) * 0.3, 3, 0.3, 0.29, 0.28, 0.45);
        return true;
      });
    }
  } else if (FX.vet) FX.vet.length = 0;
  // doanh trại cháy: lũy Ngọc Hồi vỡ (C10 cuối, C11), trại Khương Thượng (C12 sau đòn tập kích)
  const fireOn = (i === 9 && u > 0.8) || i === 10 || (i === 11 && u > 0.5);
  if (fireOn && FX.spots.length) {
    FX.emit += dt;
    while (FX.emit > 0.05) {
      FX.emit -= 0.05;
      for (const [X, Y] of FX.spots) {
        const y = nvGround(X, Y);
        if (camera.position.distanceTo(_np.set(X, y, -Y)) > 5000) continue;
        for (let r = 0; r < 2; r++) fxAdd("lua", X + (Math.random() - 0.5) * 5, y + 0.8, -Y + (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 0.6, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 0.6, 0.8 + Math.random() * 0.6, 1, 0.42 + Math.random() * 0.3, 0.1, 0.85);
        if (Math.random() < 0.12) fxAdd("khoiCot", X + (Math.random() - 0.5) * 3, y + 6, -Y + (Math.random() - 0.5) * 3, 0.6 + Math.random() * 0.8, 4 + Math.random() * 2, (Math.random() - 0.5) * 0.8, 12 + Math.random() * 6, 0.2, 0.18, 0.17, 0.5);
      }
    }
  }
  // cập nhật hạt
  for (const [name, P] of Object.entries(FX.pools)) {
    if (name === "duoc") continue;
    let n = 0;
    for (const p of P.list) {
      p.t += dt; if (p.t >= p.life) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (name.startsWith("khoi") || name === "bui") { p.vx *= 0.99; p.vy *= 0.985; }
      const k = p.t / p.life, a = name === "lua" || name === "flash" ? p.a * (1 - k) : p.a * Math.min(1, k * 6) * (1 - k);
      P.pos.set([p.x, p.y, p.z], n * 3); P.col.set([p.r, p.g, p.b, a], n * 4); P.list[n++] = p;
    }
    P.list.length = n; P.pts.geometry.setDrawRange(0, n);
    P.pts.geometry.attributes.position.needsUpdate = true; P.pts.geometry.attributes.color.needsUpdate = true;
  }
  // đuốc hành quân đêm: ngọn lửa nhấp nháy theo tay người cầm
  const T = FX.pools.duoc, m = Math.min(T.cap, NV.torch.length / 3), tm = performance.now() / 1000;
  for (let k = 0; k < m; k++) {
    T.pos.set([NV.torch[k * 3], NV.torch[k * 3 + 1] + 0.12, NV.torch[k * 3 + 2]], k * 3);
    T.col.set([1, 0.55 + 0.15 * Math.sin(tm * 17 + k), 0.18, 0.75 + 0.25 * Math.sin(tm * 23 + k * 1.7)], k * 4);
  }
  T.pts.geometry.setDrawRange(0, m); T.pts.geometry.attributes.position.needsUpdate = true; T.pts.geometry.attributes.color.needsUpdate = true;
}


// ------------------------------------------------------------------ đi bộ: lính thật cầm binh khí
const NV_DI = { tayson: { kind: "ts", dung: "dung", di: "chay", chay: "chay", sp: 0.6, w: 2 }, thanh: { kind: "th", dung: "dung", di: "tuan", chay: "chay", sp: 1, w: 2 } };
function makeAvatar(role) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = NV_DI[role] || NV_DI.tayson;
  const meshes = [new THREE.Mesh(), new THREE.Mesh(NV_VK[R.w].geo, NV_VKMAT)];
  meshes.forEach((m) => { m.frustumCulled = false; body.add(m); }); meshes[1].matrixAutoUpdate = false;
  scene.add(g);
  const d = () => new THREE.Object3D();
  return { obj: g, body, legs: [d(), d()], arms: [d(), d()], meshes, R };
}
function nvAvatarTick() {
  const A = W.av; if (!W.on || !A || !A.R) return;
  const K = NV.kinds[A.R.kind]; if (!K) return;
  const C = K.clips[W.moving ? (W.runNow ? A.R.chay : A.R.di) : A.R.dung] || K.clips.dung;
  const n = C.frames.length, f = n === 1 ? 0 : Math.floor((performance.now() / 1000) * C.fps * (W.moving && !W.runNow ? A.R.sp : 1)) % n;
  A.meshes[0].geometry = C.frames[f]; A.meshes[0].material = C.mat;
  A.meshes[1].matrix.copy(nvGrip(C, f, false));
  A.body.position.y = 0; A.body.rotation.x = 0;
}
