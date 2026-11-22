
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
const _wm = new THREE.Matrix4(), _wx = new THREE.Vector3(), _wy = new THREE.Vector3(), _wz = new THREE.Vector3();
function nvGrip(C, f, two) {                                     // khung tay cầm tại khung hình f
  const A = two && C.mt ? C.mt : C.mg, o = f * 9;
  _wy.set(A[o], A[o + 1], A[o + 2]).normalize(); _wz.set(A[o + 3], A[o + 4], A[o + 5]);
  _wz.addScaledVector(_wy, -_wz.dot(_wy)).normalize(); _wx.crossVectors(_wy, _wz);
  return _wm.makeBasis(_wx, _wy, _wz).setPosition(A[o + 6], A[o + 7], A[o + 8]);
}
// ------------------------------------------------------------------ tấm mộc ghép: 3 tấm (mẫu khien-tam-moc của anh) thành 1 bức lớn + 4 đòn khiêng dọc
function nvMocGhep(gltf) {
  gltf.scene.updateMatrixWorld(true); const src = [];
  gltf.scene.traverse((o) => { if (o.isMesh) { const m = o.material; src.push({ geo: o.geometry, mat: new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color }), M: o.matrixWorld.clone() }); } });
  const bb = new THREE.Box3(); for (const p of src) { p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox.clone().applyMatrix4(p.M)); }
  const w = bb.max.x - bb.min.x, parts = [];
  for (const dx of [-w * 0.97, 0, w * 0.97]) for (const p of src) parts.push({ geo: p.geo, mat: p.mat, M: new THREE.Matrix4().makeTranslation(dx, 0, 0).multiply(p.M) });
  const L = 5.9, z0 = bb.min.z - 0.05, pole = new THREE.BoxGeometry(0.06, 0.06, L), pm = new THREE.MeshLambertMaterial({ color: 0x6b4a2a });
  for (const x of [-0.71, -0.29, 0.29, 0.71]) parts.push({ geo: pole, mat: pm, M: new THREE.Matrix4().makeTranslation(x, 0.81, z0 - L / 2), pole: true });
  parts.push({ geo: new THREE.BoxGeometry(1.6, 0.06, 0.06), mat: pm, M: new THREE.Matrix4().makeTranslation(0, 0.81, z0 - 0.1), pole: true });   // đòn ngang nối 4 đòn vào lưng mộc
  return { flip: false, parts };
}
// ------------------------------------------------------------------ cầu phao sông Hồng (Tây Long – Bồ Đề): thuyền nối nhau, ván lát trên
function nvCau() {
  const A = [2756, 7076], B = [4004, 8183], L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L;
  let s0 = -1, s1 = -1;
  for (let s = 0; s <= L; s += 3) { const x = A[0] + dx * s, y = A[1] + dy * s; if (heightAt(x, y) < meta.water + 0.15) { if (s0 < 0) s0 = s; s1 = s; } }
  if (s0 < 0) { s0 = L * 0.2; s1 = L * 0.8; }
  s0 = Math.max(0, s0 - 12); s1 = Math.min(L, s1 + 12);
  const top = meta.water + 0.75, n = Math.ceil((s1 - s0) / 5.5), yaw = Math.atan2(dx, -dy);
  const thuyen = new THREE.InstancedMesh(new THREE.BoxGeometry(6.2, 0.9, 1.9), new THREE.MeshLambertMaterial({ color: 0x4a3524 }), n);
  const van = new THREE.InstancedMesh(new THREE.BoxGeometry(4.2, 0.12, 5.6), new THREE.MeshLambertMaterial({ color: 0x8a6a45 }), n);
  const q = new THREE.Quaternion().setFromAxisAngle(_nY, yaw), one = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const s = s0 + (k + 0.5) * (s1 - s0) / n, x = A[0] + dx * s, y = A[1] + dy * s;
    p.set(x, (meta.water + 0.15) * EX, -y); thuyen.setMatrixAt(k, M.compose(p, q, one));
    p.set(x, (top - 0.06) * EX, -y); van.setMatrixAt(k, M.compose(p, q, one));
  }
  for (const m of [thuyen, van]) { m.frustumCulled = false; scene.add(m); }
  NV.bridge = { A, dx, dy, s0, s1, top };
}
function nvGround(X, Y, cau) {
  let h = Math.max(heightAt(X, Y), meta.water - 0.7);
  const B = NV.bridge;
  if (cau && B) { const rx = X - B.A[0], ry = Y - B.A[1], s = rx * B.dx + ry * B.dy, d = Math.abs(rx * B.dy - ry * B.dx); if (s > B.s0 - 4 && s < B.s1 + 4 && d < 3.5) h = Math.max(h, B.top); }
  return h * EX;
}
async function nvLoad() {
  const [Q, ts, th, tsn, voi, ngua, nguath, moc, qt] = await Promise.all([
    nvJSON("quan.json"), nvHum("nv_tayson.json", "nv_tayson.jpg"), nvHum("nv_thanh.json", "nv_thanh.jpg"), nvHum("nv_tonsinghi.json", "nv_tonsinghi.jpg"),
    nvFlip2("nv_voi_nai.json"), nvAni("nv_ngua_ts.json"), nvAni("nv_ngua_th.json"), nvGLB("m_tammoc.json"), nvGLB("m_quangtrung.json")]);
  NV.kinds = { ts, th, tsn, voi, ngua, nguath, moc: nvMocGhep(moc) };
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
  th: { nghi: "dung", khom: "chay", di: "tuan", buoc: "tuan", khieng: "chay", vapnga: "vap", kiem: "danh", bodao: "danh" },
  tsn: { nghi: "dung", tuan: "di", vap: "chay", vapnga: "chay" } };
const NV_DIDONG = new Set(["chay", "khieng", "buoc", "tuan", "di", "vap"]);
function nvVk(g, k, raw) {                                       // binh khí của thành viên k
  if (raw === "khieng") return 0;
  let w = g.vk ? g.vk[k % g.vk.length] : 0;
  if (!w && g.vk2 && raw !== "dung") w = g.vk2[k % g.vk2.length];
  if (g.duoc && k % g.duoc === 0 && nightCur > 0.35) w = 4;
  return w;
}
function nvClip(g, K, raw, k, w) {
  let n = (NV_ALIAS[g.kind] || {})[raw] || raw;
  if (n === "danh") n = w === 2 ? "dam" : w === 3 ? (k % 2 ? "chem" : "bua") : "bua";
  if (n === "ngam" && w !== 1) n = "thu";
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
  const PT = NV.povT;
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
    const NG = g.nga && g.nga[i], sttF = NG ? nvState(g, i, NG[1]) : null, loan = g.loan && (stt.clip === "chay" || stt.clip === "vap");
    for (let k = 0; k < g.n; k++) {
      if (thin && k % 3 === 2) continue;
      const m = g.m[k], ga = !!(NG && k % NG[0] === 0 && u >= NG[1]), S0 = ga ? sttF : stt;
      const ph = g.mode === "path" ? m[2] : m[3], va = g.mode === "path" ? m[3] : m[4];
      let X, Y, yaw;
      if (g.mode === "path") {
        let al = m[0], lat = m[1];
        if (loan && !ga) { al += (va - 1.5) * 2.2 + Math.sin(time * 0.4 + ph * 17) * 1.6; lat = lat * 1.6 + Math.sin(time * 0.6 + ph * 40) * 1.8 + (ph - 0.5) * 7; }
        const [px, py, dx, dy] = nvPathAt(g, S0.s + al); X = px - dy * lat; Y = py + dx * lat; yaw = Math.atan2(dx, -dy);
      } else {
        X = m[0] + S0.ox; Y = m[1] + S0.oy; yaw = S0.moving && g.kind !== "moc" ? moveYaw : m[2];
        if (loan && !ga) { const a = (ph - 0.5) * 9 + Math.sin(time * 0.5 + ph * 23) * 2.5; X += Math.cos(yaw) * a; Y += Math.sin(yaw) * a; }
      }
      if (loan && !ga) yaw += Math.sin(time * 1.1 + ph * 31) * 0.45 + (ph - 0.5) * 0.7;
      const gy = nvGround(X, Y, g.cau);
      if (k === 0) NV.anchor[g.id] = { X, Y, yaw, y: gy };
      const isPov = PT && PT.gid === g.id && PT.k === k;
      if (isPov) NV.povAt = { X, Y, yaw, y: gy };
      const raw = ga ? "nga" : S0.clip;
      if (K.hum) {
        const w = ga ? 0 : nvVk(g, k, raw), name = nvClip(g, K, raw, k, w), C = K.clips[name];
        const tSeg = ga ? (u - NG[1]) * dur : (u - S0.u0) * dur, f = nvFrame(C, time, ph, S0.spd, tSeg);
        const mau = NV_MAU[g.kind] ? NV_MAU[g.kind][va % 4] : null, im = nvMesh(g, name + ":" + f, C.frames[f], C.mat);
        const wim = w ? nvMesh(g, "w" + w, NV_VK[w].geo, NV_VKMAT) : null, two = w === 1 && name === "ngam";
        if (w) nvGrip(C, f, two);
        const sy = Math.sin(yaw), cyw = Math.cos(yaw);
        for (let r = 0; r < (ga ? 1 : reps); r++) {
          const [lx, lb] = NV_LOP[r], X2 = X + cyw * lx + sy * lb * 1, Y2 = Y + sy * lx - cyw * lb * 1;
          const y2 = r ? nvGround(X2, Y2, g.cau) : gy;
          _np.set(X2, y2, -Y2); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
          if (!(isPov && r === 0)) { const c = im.count++; im.setMatrixAt(c, _nm); if (mau) im.setColorAt(c, mau); }
          if (wim) { _nm2.multiplyMatrices(_nm, _wm); wim.setMatrixAt(wim.count++, _nm2); }
          if (r === 0 && near && w) {
            if (w === 4 || (two && Math.random() < NV.dt * 0.22)) { _nt.set(0, NV_VK[w].tip, 0).applyMatrix4(_nm2); if (w === 4) NV.torch.push(_nt.x, _nt.y, _nt.z); else fxShot(_nt); }
          }
          if (r === 0 && near && S0.moving && !ga && NV_DIDONG.has(name) && Math.random() < NV.dt * 0.35) fxBui(X, gy, Y, 1);
        }
      } else if (K.ani) {
        const C = K.clips[S0.clip] || K.clips.dung, f = nvFrame(C, time, ph, S0.spd, 0);
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
        C.frames[f].forEach((geo, pi) => { const im = nvMesh(g, S0.clip + ":" + f + ":" + pi, geo, C.mats[pi]); im.setMatrixAt(im.count++, _nm); });
        if (!isPov) { _nm2.multiplyMatrices(_nm, C.m[f]); K.rigid.forEach((p, pi) => { const im = nvMesh(g, "r" + pi, p.geo, p.mat); im.setMatrixAt(im.count++, _nm2); }); }
        if (near && S0.moving && Math.random() < NV.dt * 0.8) fxBui(X, gy, Y, 1.6);
      } else if (K.flip) {
        const C = K.clips[S0.clip] || K.clips.dung, f = nvFrame(C, time, ph, S0.spd, 0);
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
        C.frames[f].forEach((geo, pi) => { const im = nvMesh(g, S0.clip + ":" + f + ":" + pi, geo, C.mats[pi]); im.setMatrixAt(im.count++, _nm); });
        if (near && S0.moving && Math.random() < NV.dt * 1.2) fxBui(X, gy, Y, 2.4);
      } else {                                                    // tấm mộc ghép
        _np.set(X, gy + (S0.clip === "khieng" || S0.moving ? 0.12 : 0), -Y); _nq.setFromAxisAngle(_nY, yaw);
        const nam = S0.clip === "nam";
        if (nam) { _nq2.setFromAxisAngle(_nX, -Math.PI / 2); _nq.multiply(_nq2); _np.y += 0.12; }
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
  nvApply(i, u, time);
  if (appMode !== "compare") fxTick(i, u, dt); else fxClear();
  if (NV.mixer) NV.mixer.update(dt);
  nvAvatarTick();
  povTick(i);
}
// ------------------------------------------------------------------ góc nhìn nhân vật: nhìn qua mắt một người trong trận, phim vẫn chạy theo lời bình
var POV = null;
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
    POV = { vai: 0, yaw: 0, pitch: -0.05, drag: null, eye: new THREE.Vector3(), has: false };
    const sel = $("povsel"); POV_VAI.forEach(([t], k) => { const o = document.createElement("option"); o.value = k; o.textContent = t; sel.append(o); });
    sel.onchange = (e) => { POV.vai = +e.target.value; POV.yaw = 0; POV.pitch = -0.05; POV.has = false; };
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
