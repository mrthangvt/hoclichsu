
// ------------------------------------------------------------------ nhân vật, voi, ngựa, binh khí, hiệu ứng: diễn theo từng cảnh (V9)
// Lính Tây Sơn / Thanh, Tôn Sĩ Nghị: chuỗi khung hình nướng từ động tác Mixamo, kèm binh khí đi theo bàn tay (gươm, giáo, súng, đuốc).
// Voi có nài, ngựa có người cưỡi: gắn xương trong Blender, người cưỡi gắn vào xương lưng / cổ (nhiều phần trong một khung hình).
// Quang Trung: mô hình có xương, đứng trên bành voi chỉ huy (C08–C10). Kịch bản đội hình: quan.json (source/build_quan9.py).
const NV = { ok: false, on: true, kinds: {}, groups: [], qt: null, qtPos: {}, mixer: null, root: new THREE.Group(), ex: 0, exI: -1, anchor: {}, dt: 0.016, torch: [] };
scene.add(NV.root);
const nvU8 = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
const nvJSON = async (f) => { const r = await fetch(f); if (!r.ok) throw new Error("không tải được " + f); return r.json(); };
const nvGLB = async (f) => { const u = nvU8((await nvJSON(f)).b64); return new Promise((ok, no) => new GLTFLoader().parse(u.buffer, "", ok, no)); };
const nvTex = (f) => new THREE.TextureLoader().loadAsync(f).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t; });
function nvGeo(index, uv, col, pB64, nB64, q) {
  const qa = new Int16Array(nvU8(pB64).buffer), na = new Int8Array(nvU8(nB64).buffer);
  const pos = new Float32Array(qa.length), nor = new Float32Array(na.length);
  for (let i = 0; i < qa.length; i++) pos[i] = qa[i] * q;
  for (let i = 0; i < na.length; i++) nor[i] = na[i] / 127;
  const g = new THREE.BufferGeometry(); g.setIndex(index);
  if (uv) g.setAttribute("uv", uv);
  if (col) g.setAttribute("color", col);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 4);
  return g;
}
const idxAttr = (b64, big) => { const b = nvU8(b64); return new THREE.BufferAttribute(big ? new Uint32Array(b.buffer) : new Uint16Array(b.buffer), 1); };
// đọc chuỗi khung hình: bản 1 (thân + binh khí theo động tác + điểm đầu súng/đuốc) và bản 2 (nhiều phần: con vật + người cưỡi + giáo)
async function nvFlip(f, texf) {
  const j = await nvJSON(f), clips = {};
  if (j.v === 2) {
    const parts = await Promise.all(j.parts.map(async (p) => {
      const mat = p.tex ? new THREE.MeshLambertMaterial({ map: await nvTex(p.tex) })
        : p.col ? new THREE.MeshLambertMaterial({ vertexColors: true }) : new THREE.MeshLambertMaterial({ color: new THREE.Color(...p.color) });
      return { mat, index: idxAttr(p.idx), uv: p.uv ? new THREE.BufferAttribute(new Float32Array(nvU8(p.uv).buffer), 2) : null,
        col: p.col ? new THREE.BufferAttribute(new Float32Array(nvU8(p.col).buffer), 3) : null };
    }));
    for (const [name, c] of Object.entries(j.clips))
      clips[name] = { fps: c.fps, mats: parts.map((p) => p.mat), frames: c.pos.map((fp, k) => fp.map((pb, pi) => nvGeo(parts[pi].index, parts[pi].uv, parts[pi].col, pb, c.nor[k][pi], j.q))) };
    return { flip: true, clips };
  }
  const mat = new THREE.MeshLambertMaterial({ map: await nvTex(texf) }), wmat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const index = idxAttr(j.idx, j.idx32), uv = new THREE.BufferAttribute(new Float32Array(nvU8(j.uv).buffer), 2);
  for (const [name, c] of Object.entries(j.clips)) {
    const W = c.w ? { index: idxAttr(c.w.idx), col: new THREE.BufferAttribute(new Float32Array(nvU8(c.w.col).buffer), 3) } : null;
    clips[name] = { fps: c.fps, tip: c.tip || null, mats: W ? [mat, wmat] : [mat],
      frames: c.pos.map((pb, k) => { const fr = [nvGeo(index, uv, null, pb, c.nor[k], j.q)]; if (W) fr.push(nvGeo(W.index, null, W.col, c.w.pos[k], c.w.nor[k], j.q)); return fr; }) };
  }
  return { flip: true, clips };
}
function nvParts(gltf) {
  gltf.scene.updateMatrixWorld(true); const parts = [];
  gltf.scene.traverse((o) => { if (o.isMesh) { const m = o.material; parts.push({ geo: o.geometry, mat: new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color }), M: o.matrixWorld.clone() }); } });
  return { flip: false, parts };
}
async function nvLoad() {
  const [Q, ts, th, tsn, voi, ngua, nguath, moc, qt] = await Promise.all([
    nvJSON("quan.json"), nvFlip("nv_tayson.json", "nv_tayson.jpg"), nvFlip("nv_thanh.json", "nv_thanh.jpg"), nvFlip("nv_tonsinghi.json", "nv_tonsinghi.jpg"),
    nvFlip("nv_voi_nai.json"), nvFlip("nv_ngua_ts.json"), nvFlip("nv_ngua_th.json"), nvGLB("m_tammoc.json"), nvGLB("m_quangtrung.json")]);
  NV.kinds = { ts, th, tsn, voi, ngua, nguath, moc: nvParts(moc) };
  for (const g of Q.groups) {
    g.meshes = new Map(); g.n = g.m.length;
    if (g.mode === "path") { g.cum = [0]; for (let k = 1; k < g.path.length; k++) g.cum.push(g.cum[k - 1] + Math.hypot(g.path[k][0] - g.path[k - 1][0], g.path[k][1] - g.path[k - 1][1])); }
    NV.groups.push(g);
  }
  NV.qt = qt.scene; NV.qtPos = Q.quangtrung; NV.qt.visible = false;
  NV.qt.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  scene.add(NV.qt);
  NV.mixer = new THREE.AnimationMixer(NV.qt); if (qt.animations[0]) NV.mixer.clipAction(qt.animations[0]).play();
  fxInit();
  NV.ok = true;
}
const NV_MAU = { ts: [[1, 1, 1], [0.74, 0.62, 0.54], [0.84, 0.58, 0.52], [0.92, 0.82, 0.74]].map((c) => new THREE.Color(...c)),
  th: [[1, 1, 1], [0.86, 0.86, 0.9], [0.76, 0.75, 0.72], [0.95, 0.92, 0.85]].map((c) => new THREE.Color(...c)) };
function nvMesh(g, key, geo, mat) {
  let im = g.meshes.get(key);
  if (!im) { im = new THREE.InstancedMesh(geo, mat, g.n); im.frustumCulled = false; im.count = 0; NV.root.add(im); g.meshes.set(key, im); }
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
  return { clip, ox, oy, s, mvx, mvy, spd: cs[5] || 1, moving: g.mode === "path" ? cs[4] !== cs[3] && u <= cs[1] : (mvx || mvy) && u <= cs[1] };
}
function nvPathAt(g, s) {
  const P = g.path, C = g.cum; s = Math.min(Math.max(s, 0), C[C.length - 1] - 0.01);
  let k = 1; while (k < C.length - 1 && C[k] < s) k++;
  const a = P[k - 1], b = P[k], t = (s - C[k - 1]) / (C[k] - C[k - 1]), dx = (b[0] - a[0]) / (C[k] - C[k - 1]), dy = (b[1] - a[1]) / (C[k] - C[k - 1]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, dx, dy];
}
const _nq = new THREE.Quaternion(), _nq2 = new THREE.Quaternion(), _nm = new THREE.Matrix4(), _np = new THREE.Vector3(), _ns = new THREE.Vector3(), _nt = new THREE.Vector3(), _nY = new THREE.Vector3(0, 1, 0), _nX = new THREE.Vector3(1, 0, 0);
const nvGround = (X, Y) => Math.max(heightAt(X, Y), meta.water - 0.7) * EX;
function nvClip(g, K, stt, k) {
  let name = stt.clip;
  if (g.mix && g.mix.includes(name)) name = g.mix[k % g.mix.length];
  if (g.duoc && k % g.duoc === 0 && nightCur > 0.35 && K.clips[name + "_duoc"]) name += "_duoc";
  return K.clips[name] ? name : K.clips.dung ? "dung" : Object.keys(K.clips)[0];
}
function nvApply(i, u, time) {
  if (!NV.ok) return;
  const vis = NV.on && $("ly-nv").checked; NV.torch.length = 0;
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
    for (let k = 0; k < g.n; k++) {
      const m = g.m[k]; let X, Y, yaw;
      if (g.mode === "path") { const [px, py, dx, dy] = nvPathAt(g, stt.s + m[0]); X = px + -dy * m[1]; Y = py + dx * m[1]; yaw = Math.atan2(dx, -dy); }
      else { X = m[0] + stt.ox; Y = m[1] + stt.oy; yaw = stt.moving && g.kind !== "moc" ? moveYaw : m[2]; }
      const ph = g.mode === "path" ? m[2] : m[3], va = g.mode === "path" ? m[3] : m[4];
      _np.set(X, nvGround(X, Y), -Y); _nq.setFromAxisAngle(_nY, yaw);
      if (k === 0) NV.anchor[g.id] = { X, Y, yaw, y: _np.y };
      if (g.kind === "moc" && stt.clip === "nam") { _nq2.setFromAxisAngle(_nX, -Math.PI / 2); _nq.multiply(_nq2); _np.y += 0.12; }
      _nm.compose(_np, _nq, _ns);
      if (K.flip) {
        const name = nvClip(g, K, stt, k), C = K.clips[name], n = C.frames.length, f = n === 1 ? 0 : Math.floor(time * C.fps * stt.spd + ph * n) % n;
        C.frames[f].forEach((geo, pi) => {
          const im = nvMesh(g, name + ":" + f + ":" + pi, geo, C.mats[pi]), c = im.count++;
          im.setMatrixAt(c, _nm); if (pi === 0 && NV_MAU[g.kind]) im.setColorAt(c, NV_MAU[g.kind][va % 4]);
        });
        if (C.tip && near) {
          _nt.set(...C.tip[f]).applyMatrix4(_nm);
          if (name.endsWith("duoc")) NV.torch.push(_nt.x, _nt.y, _nt.z);
          else if (name === "ngam" && Math.random() < NV.dt * 0.28) fxShot(_nt);
        }
      } else {
        K.parts.forEach((p, pi) => { const im = nvMesh(g, "p" + pi, p.geo, p.mat), c = im.count++; _nm.compose(_np, _nq, _ns).multiply(p.M); im.setMatrixAt(c, _nm); });
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
  NV.qt.visible = !!(vis && qx !== undefined && camera.position.distanceTo(_np.set(qx, qz, -qy)) < 3000);
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
    khoi: fxPool(1800, 5, false, true), khoiTo: fxPool(700, 13, false, true) };
}
function fxAdd(pool, x, y, z, vx, vy, vz, life, r, g, b, a) { const P = FX.pools[pool]; if (P.list.length < P.cap) P.list.push({ x, y, z, vx, vy, vz, t: 0, life, r, g, b, a }); }
function fxShot(p) {                                                    // súng tay: chớp lửa + khói trắng
  fxAdd("flash", p.x, p.y, p.z, 0, 0, 0, 0.12, 1, 0.85, 0.5, 1);
  for (let k = 0; k < 2; k++) fxAdd("khoi", p.x, p.y, p.z, (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6, 3 + Math.random() * 2, 0.82, 0.82, 0.8, 0.55);
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
      if (name.startsWith("khoi")) { p.vx *= 0.99; p.vy *= 0.985; }
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
const NV_DI = { tayson: { kind: "ts", dung: "dung", di: "buoc", chay: "chay", sp: 1 }, thanh: { kind: "th", dung: "nghi", di: "chay", chay: "chay", sp: 0.6 } };
function makeAvatar(role) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = NV_DI[role] || NV_DI.tayson, K = NV.kinds[R.kind];
  const meshes = [0, 1].map(() => { const m = new THREE.Mesh(); m.frustumCulled = false; body.add(m); return m; });
  scene.add(g);
  const d = () => new THREE.Object3D();
  return { obj: g, body, legs: [d(), d()], arms: [d(), d()], meshes, R };
}
function nvAvatarTick() {
  const A = W.av; if (!W.on || !A || !A.R) return;
  const K = NV.kinds[A.R.kind]; if (!K) return;
  const C = K.clips[W.moving ? (W.runNow ? A.R.chay : A.R.di) : A.R.dung] || K.clips.dung;
  const n = C.frames.length, f = n === 1 ? 0 : Math.floor((performance.now() / 1000) * C.fps * (W.moving && !W.runNow ? A.R.sp : 1)) % n;
  A.meshes.forEach((m, pi) => { const geo = C.frames[f][pi]; m.visible = !!geo; if (geo) { m.geometry = geo; m.material = C.mats[pi]; } });
  A.body.position.y = 0; A.body.rotation.x = 0;
}
