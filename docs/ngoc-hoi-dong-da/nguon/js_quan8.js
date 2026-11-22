
// ------------------------------------------------------------------ nhân vật, voi, ngựa, tấm mộc: diễn theo từng cảnh (V8)
// Lính Tây Sơn / Thanh: chuỗi khung hình nướng từ động tác Mixamo (flipbook), vẽ gộp InstancedMesh.
// Voi, ngựa: gắn xương trong Blender (gan-xuong/VoiNgua), nướng 4 động tác: dung, di, chay, roi.
// Quang Trung: mô hình có xương. Tấm mộc, Tôn Sĩ Nghị: mô hình tĩnh.
// Kịch bản đội hình ở quan.json (sinh bằng source/build_quan.py). Mật độ quân là minh hoạ.
const NV = { ok: false, on: true, kinds: {}, groups: [], qt: null, qtPos: {}, mixer: null, root: new THREE.Group(), ex: 0, exI: -1 };
scene.add(NV.root);
const nvU8 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const nvJSON = async (f) => { const r = await fetch(f); if (!r.ok) throw new Error("không tải được " + f); return r.json(); };
const nvGLB = async (f) => { const u = nvU8((await nvJSON(f)).b64); return new Promise((ok, no) => new GLTFLoader().parse(u.buffer, "", ok, no)); };
async function nvFlip(f, texf) {
  const [j, tex] = await Promise.all([nvJSON(f), new THREE.TextureLoader().loadAsync(texf)]);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const ib = nvU8(j.idx), index = new THREE.BufferAttribute(j.idx32 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer), 1);
  const uv = new THREE.BufferAttribute(new Float32Array(nvU8(j.uv).buffer), 2);
  const clips = {};
  for (const [name, c] of Object.entries(j.clips)) {
    const geos = c.pos.map((p, k) => {
      const q = new Int16Array(nvU8(p).buffer), n = new Int8Array(nvU8(c.nor[k]).buffer);
      const pos = new Float32Array(q.length), nor = new Float32Array(n.length);
      for (let i = 0; i < q.length; i++) pos[i] = q[i] * j.q;
      for (let i = 0; i < n.length; i++) nor[i] = n[i] / 127;
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute("uv", uv);
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 2);
      return g;
    });
    clips[name] = { fps: c.fps, geos };
  }
  return { flip: true, mat, clips };
}
function nvParts(gltf) {
  gltf.scene.updateMatrixWorld(true); const parts = [];
  gltf.scene.traverse((o) => { if (o.isMesh) { const m = o.material; parts.push({ geo: o.geometry, mat: new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color }), M: o.matrixWorld.clone() }); } });
  return { flip: false, parts };
}
async function nvLoad() {
  const [Q, ts, th, voi, ngua, moc, tsn, qt] = await Promise.all([
    nvJSON("quan.json"), nvFlip("nv_tayson.json", "nv_tayson.jpg"), nvFlip("nv_thanh.json", "nv_thanh.jpg"),
    nvFlip("nv_voi.json", "nv_voi.jpg"), nvFlip("nv_ngua.json", "nv_ngua.jpg"), nvGLB("m_tammoc.json"), nvGLB("m_tonsinghi.json"), nvGLB("m_quangtrung.json")]);
  NV.kinds = { ts, th, voi, ngua, moc: nvParts(moc), tsn: nvParts(tsn) };
  for (const g of Q.groups) {
    g.meshes = new Map(); g.n = g.m.length;
    if (g.mode === "path") {                                  // độ dài cộng dồn của tuyến
      g.cum = [0]; for (let k = 1; k < g.path.length; k++) g.cum.push(g.cum[k - 1] + Math.hypot(g.path[k][0] - g.path[k - 1][0], g.path[k][1] - g.path[k - 1][1]));
    }
    NV.groups.push(g);
  }
  NV.qt = qt.scene; NV.qtPos = Q.quangtrung; NV.qt.visible = false;
  NV.qt.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  scene.add(NV.qt);
  NV.mixer = new THREE.AnimationMixer(NV.qt); if (qt.animations[0]) NV.mixer.clipAction(qt.animations[0]).play();
  NV.ok = true;
}
const NV_MAU = { ts: [[1, 1, 1], [0.74, 0.62, 0.54], [0.84, 0.58, 0.52], [0.92, 0.82, 0.74]].map((c) => new THREE.Color(...c)),
  th: [[1, 1, 1], [0.86, 0.86, 0.9], [0.76, 0.75, 0.72], [0.95, 0.92, 0.85]].map((c) => new THREE.Color(...c)) };
function nvMesh(g, key, geo, mat) {
  let im = g.meshes.get(key);
  if (!im) { im = new THREE.InstancedMesh(geo, mat, g.n); im.frustumCulled = false; im.count = 0; NV.root.add(im); g.meshes.set(key, im); }
  return im;
}
function nvState(g, i, u) {                                  // đoạn đang diễn + độ dời (fixed) hoặc vị trí dọc tuyến (path)
  const sc = g.sc[i]; if (!sc) return null;
  const segs = sc.s; let ox = sc.o ? sc.o[0] : 0, oy = sc.o ? sc.o[1] : 0, clip = segs[0][2], s = segs[0][3], mvx = 0, mvy = 0, cs = segs[0];
  for (const q of segs) {
    if (u < q[0]) break;
    const k = Math.min(1, (u - q[0]) / Math.max(1e-6, q[1] - q[0])); clip = q[2]; cs = q;
    if (g.mode === "path") { s = q[3] + (q[4] - q[3]) * k; mvx = q[4] - q[3]; }
    else { ox += q[3] * k; oy += q[4] * k; if (k < 1) { mvx = q[3]; mvy = q[4]; } }
  }
  if (g.mode === "path" && u < segs[0][0]) s = segs[0][3];
  return { clip, ox, oy, s, mvx, mvy, spd: cs[5] || 1, moving: g.mode === "path" ? cs[4] !== cs[3] && u <= cs[1] : (mvx || mvy) && u <= cs[1] };
}
function nvPathAt(g, s) {
  const P = g.path, C = g.cum; s = Math.min(Math.max(s, 0), C[C.length - 1] - 0.01);
  let k = 1; while (k < C.length - 1 && C[k] < s) k++;
  const a = P[k - 1], b = P[k], t = (s - C[k - 1]) / (C[k] - C[k - 1]), dx = (b[0] - a[0]) / (C[k] - C[k - 1]), dy = (b[1] - a[1]) / (C[k] - C[k - 1]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, dx, dy];
}
const _nq = new THREE.Quaternion(), _nq2 = new THREE.Quaternion(), _nm = new THREE.Matrix4(), _np = new THREE.Vector3(), _ns = new THREE.Vector3(), _nY = new THREE.Vector3(0, 1, 0), _nX = new THREE.Vector3(1, 0, 0);
const nvGround = (X, Y) => Math.max(heightAt(X, Y), meta.water - 0.7) * EX;
function nvApply(i, u, time) {
  if (!NV.ok) return;
  const vis = NV.on && $("ly-nv").checked;
  for (const g of NV.groups) {
    for (const im of g.meshes.values()) im.count = 0;
    const stt = vis ? nvState(g, i, u) : null;
    if (!stt || stt.clip === "an") continue;
    const K = NV.kinds[g.kind]; if (!K) continue;
    // tâm đội để tính khoảng cách tới camera: ẩn khi rất xa, phóng to nhẹ khi xa vừa
    let cx, cy;
    if (g.mode === "path") [cx, cy] = nvPathAt(g, stt.s); else { cx = g.m[0][0] + stt.ox; cy = g.m[0][1] + stt.oy; }
    const dist = camera.position.distanceTo(_np.set(cx, heightAt(cx, cy) * EX, -cy));
    if (dist > 6000) continue;
    const sc = THREE.MathUtils.clamp(dist / 450, 1, 2); _ns.set(sc, sc, sc);
    const moveYaw = g.mode === "path" ? null : Math.atan2(stt.mvx, -stt.mvy);
    const clipD = K.flip ? K.clips[stt.clip] || K.clips.dung : null;
    for (let k = 0; k < g.n; k++) {
      const m = g.m[k]; let X, Y, yaw;
      if (g.mode === "path") {
        const [px, py, dx, dy] = nvPathAt(g, stt.s + m[0]);
        X = px + -dy * m[1]; Y = py + dx * m[1]; yaw = Math.atan2(dx, -dy);
      } else { X = m[0] + stt.ox; Y = m[1] + stt.oy; yaw = stt.moving && g.kind !== "moc" ? moveYaw : m[2]; }
      const ph = g.mode === "path" ? m[2] : m[3], va = g.mode === "path" ? m[3] : m[4];
      let lift = 0;
      if (!K.flip) {
        if (stt.clip === "di") lift = Math.abs(Math.sin(time * (g.kind === "voi" ? 3 : 7) + ph * 6.3)) * (g.kind === "voi" ? 0.12 : 0.18);
        if (stt.clip === "roi") yaw += Math.sin(time * 2.4 + ph * 9) * 0.9;
      }
      _np.set(X, nvGround(X, Y) + lift, -Y);
      _nq.setFromAxisAngle(_nY, yaw);
      if (g.kind === "moc" && stt.clip === "nam") { _nq2.setFromAxisAngle(_nX, -Math.PI / 2); _nq.multiply(_nq2); _np.y += 0.12; }
      if (K.flip) {
        const n = clipD.geos.length, f = n === 1 ? 0 : Math.floor(time * clipD.fps * stt.spd + ph * n) % n;
        const im = nvMesh(g, stt.clip + ":" + f, clipD.geos[f], K.mat), c = im.count++;
        _nm.compose(_np, _nq, _ns); im.setMatrixAt(c, _nm);
        if (NV_MAU[g.kind]) im.setColorAt(c, NV_MAU[g.kind][va % 4]);
      } else {
        K.parts.forEach((p, pi) => {
          const im = nvMesh(g, "p" + pi, p.geo, p.mat), c = im.count++;
          _nm.compose(_np, _nq, _ns).multiply(p.M); im.setMatrixAt(c, _nm);
        });
      }
    }
    for (const im of g.meshes.values()) if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  }
  // Quang Trung
  const q = NV.qtPos[i]; NV.qt.visible = !!(vis && q && camera.position.distanceTo(_np.set(q[0], heightAt(q[0], q[1]) * EX, -q[1])) < 3000);
  if (NV.qt.visible) { NV.qt.position.set(q[0], nvGround(q[0], q[1]), -q[1]); NV.qt.rotation.y = q.length > 2 ? q[2] : Math.PI; }
}
function nvTick(dt) {
  if (!NV.ok || !S) return;
  const time = performance.now() / 1000; let i = 0, u = 1;
  if (appMode === "film") { i = cur; u = Math.min(1, st / S.scenes[cur].dur); }
  else if (appMode === "explore") {                         // khám phá: diễn lại cảnh đang chọn theo vòng
    i = exploreI; if (NV.exI !== i) { NV.exI = i; NV.ex = 0; }
    NV.ex += dt; u = (NV.ex % S.scenes[i].dur) / S.scenes[i].dur;
  } else i = cmpA;
  nvApply(i, u, time);
  if (NV.mixer) NV.mixer.update(dt);
  nvAvatarTick();
}

// ------------------------------------------------------------------ đi bộ: dùng lính thật trong thư mục (thay hình nhân khối của V6)
const NV_DI = { tayson: { kind: "ts", dung: "dung", di: "buoc", chay: "chay", sp: 1 }, thanh: { kind: "th", dung: "nghi", di: "chay", chay: "chay", sp: 0.6 } };
function makeAvatar(role) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = NV_DI[role] || NV_DI.tayson, K = NV.kinds[R.kind];
  const mesh = K ? new THREE.Mesh(K.clips[R.dung].geos[0], K.mat) : new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.7), new THREE.MeshLambertMaterial({ color: 0x7a2a1c }));
  if (!K) mesh.position.y = 0.85;
  mesh.frustumCulled = false; body.add(mesh); scene.add(g);
  const d = () => new THREE.Object3D();
  return { obj: g, body, legs: [d(), d()], arms: [d(), d()], mesh, R };
}
function nvAvatarTick() {
  const A = W.av; if (!W.on || !A || !A.R) return;
  const K = NV.kinds[A.R.kind]; if (!K) return;
  const clip = K.clips[W.moving ? (W.runNow ? A.R.chay : A.R.di) : A.R.dung] || K.clips.dung;
  const n = clip.geos.length, f = n === 1 ? 0 : Math.floor((performance.now() / 1000) * clip.fps * (W.moving && !W.runNow ? A.R.sp : 1)) % n;
  if (A.mesh.geometry !== clip.geos[f]) A.mesh.geometry = clip.geos[f];
  A.body.position.y = 0; A.body.rotation.x = 0;
}
