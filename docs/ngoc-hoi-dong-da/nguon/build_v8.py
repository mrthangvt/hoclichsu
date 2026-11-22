i=open('base/index_v4.html').read()
pre=open('base/v6_pre.html').read()
css=open('base/v6_css_base.css').read()+open('v6_css_add.css').read()
body=open('v6_body.html').read()
k=i.index('<script type="module">')
head_end=i.index('</head>')
s=pre+'<style>'+css+'</style>\n'+i[i.index('</style>')+len('</style>'):head_end]+'</head>\n'+body+i[k:]
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (s.count(a), a[:90]); s=s.replace(a,b)
rep('''const SKY = new THREE.Color(0xb7bfc1);
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 22000, 70000);
const camera = new THREE.PerspectiveCamera(45, 1, 2, 140000);''','''scene.background = new THREE.Color(0xc9cbc0);
scene.fog = new THREE.Fog(0xc9cbc0, 22000, 90000);
const camera = new THREE.PerspectiveCamera(45, 1, 2, 400000);''')
rep('scene.add(new THREE.HemisphereLight(0xd6dde2, 0x5d4e36, 1.35));','const hemi = new THREE.HemisphereLight(0xd6dde2, 0x5d4e36, 1.35); scene.add(hemi);')
rep('''  world.add(waterMesh(mainField, rects, mainField.aux));''','''  world.add(waterMesh(mainField, rects, mainField.aux));
  setStep("Dựng nền chân trời, núi xa…", 0.5);
  buildSurroundings();''')
rep('''const L = addLabel(LABEL[a.name] || a.name, a.x, a.y, 0, BIG.has(a.name) ? "big" : "", 60, Infinity, () => showCard(a.name));''',
    '''const L = addLabel(LABEL[a.name] || a.name, a.x, a.y, 0, BIG.has(a.name) ? "big" : "", 60, Infinity, () => { showCard(a.name); flyToAnchor(a.name); });''')
rep('''  if (g) { if (g.userData.kind === "pin") openDialog(g.userData.id); else showCard(g.userData.name); }''',
    '''  if (g) { if (g.userData.kind === "pin") openDialog(g.userData.id); else { showCard(g.userData.name); flyToAnchor(g.userData.name); } return; }
  if (W.on) return;
  const p = pickGround(e);                                  // bấm vào bất kỳ điểm nào trên sa bàn: bay tới đó
  if (p) flyTo(p.X, p.Y, THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.72, 300, 20000));''')
rep('''  resize(); goView("all", true);''','''  try {
    const rs = await fetch("story.json"); if (rs.ok) { S = await rs.json(); prepStory(); }
  } catch (err) { console.warn("story.json", err); }
  if (!S) document.querySelector('#modes [data-m="film"]').hidden = true;
  resize(); goView("all", true);''')
rep('''  window.NHDD = { pause: () => renderer.setAnimationLoop(null), once: () => frame(), preset: (n) => goView(n, true), ex: (v) => setEx(v) };''',
'''  window.NHDD = { pause: () => renderer.setAnimationLoop(null), once: () => frame(), preset: (n) => goView(n, true), ex: (v) => setEx(v),
    nv: () => NV.ok, cam: (x, y, z, tx, ty, tz) => { takeOver(); fly = null; camera.position.set(x, z, -y); controls.target.set(tx, tz, -ty); }, am: () => [AM.ready, Object.keys(AM.beds).length, AM.ctx && AM.ctx.state], nvdbg: () => NV.groups.map((g) => [g.id, [...g.meshes.values()].reduce((a, m) => a + m.count, 0)]), mode: (m) => setAppMode(m), scene: (i, t) => goScene(i, t || 0), play: (b) => setPlaying(b), night: (n) => { nightCur = n; },
    walk: (b) => setWalk(b), joy: (x, y) => { W.joy.x = x; W.joy.y = y; }, arrows: () => { for (const A of ARR.values()) A.p = 1; applyArrowProgress(); } };
  const qm = new URLSearchParams(location.search).get("mode");
  setAppMode(qm === "explore" || qm === "compare" ? qm : S ? "film" : "explore");
  if (appMode === "film") { goScene(0); setPlaying(!reduceMotion); }''')
rep('''  if (name === "all") return { pos: new THREE.Vector3(1500, 21000, 26500), tgt: new THREE.Vector3(0, 0, 300) };''',
    '''  if (name === "all") return poseFrom({ X: 0, Y: 1500, d: 30000, az: 180, el: 17 });''')
rep('''  fly = { t0: performance.now(), p0: camera.position.clone(), t0v: controls.target.clone(), p1: v.pos, t1: v.tgt };''',
'''  const dd = camera.position.distanceTo(v.pos) + controls.target.distanceTo(v.tgt);
  fly = { t0: performance.now(), p0: camera.position.clone(), t0v: controls.target.clone(), p1: v.pos, t1: v.tgt, dur: 1100 + Math.min(1600, dd / 12), arc: Math.min(dd * 0.15, 5000) };''')
rep('''function goView(name, instant) {''','''function goView(name, instant) {
  if (W.on) {                                               // đang đi bộ: bấm địa điểm là tới ngay
    if (name === "all") { setWalk(false); } else { const [an, , , , off] = VIEWS[name], A = anchors.get(an); if (A) walkTeleport(A.X + off[0], A.Y + off[1] - 90); return; }
  }''')
rep('''function flyTo(X, Y, dist = 900) {''','''function flyToAnchor(name) {
  const A = anchors.get(name); if (!A) return;
  if (W.on) { walkTeleport(A.X, A.Y - 60); return; }
  flyTo(A.X, A.Y, THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.6, 500, 2500));
}
function flyTo(X, Y, dist = 900) {
  takeOver();''')
rep('''function orbit(dTheta, dPhi, zoomF) {
  fly = null;''','''function orbit(dTheta, dPhi, zoomF) {
  fly = null; takeOver();''')
rep('''  if (act === "north") { b.addEventListener("click", north); return; }''','''  if (act === "north") { b.addEventListener("click", () => { takeOver(); north(); }); return; }''')
rep('''  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  const k = e.key, map''','''  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  if (W.on) return;
  const k = e.key, map''')
rep('''const HELP = { view: "Kéo để xoay · chuột phải để dời · cuộn/chụm để phóng to · chạm nhãn để đọc mô tả",''',
    '''const HELP = { view: "Bấm vào điểm bất kỳ để bay tới · kéo để xoay · chuột phải để dời · cuộn/chụm để phóng to",''')
rep('''$("lbtn").addEventListener("click", () => { const on = $("lbtn").getAttribute("aria-pressed") !== "true"; $("lbtn").setAttribute("aria-pressed", on); $("lbtn").classList.toggle("on", on); });
$("laybtn").addEventListener("click", () => { const open = $("layers").hidden; $("layers").hidden = !open; $("laybtn").setAttribute("aria-expanded", open); $("laybtn").setAttribute("aria-pressed", open); });
''','')
rep('''const showA = $("lbtn").getAttribute("aria-pressed") === "true"''','''const showA = $("ly-lbl").checked''')
rep('''A.marker.visible = showA;''','''A.marker.visible = showA && !W.on;''')
rep('''function frame() {
  if (held) orbit(held[0], held[1], held[2]);
  if (fly) {
    const k = Math.min((performance.now() - fly.t0) / 1300, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.t0v, fly.t1, e);
    if (k >= 1) fly = null;
  }
  controls.update();
  if (!fly) {''','''let lastT = performance.now();
function frame() {
  const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
  if (held && !W.on) orbit(held[0], held[1], held[2]);
  let nightT = storyTick(dt) || 0;
  if (appMode === "explore" && S) nightT = sceneNight(S.scenes[exploreI]);
  if (W.on) walkTick(dt);
  if (fly) {
    const k = Math.min((now - fly.t0) / fly.dur, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.t0v, fly.t1, e);
    camera.position.y += fly.arc * Math.sin(Math.PI * e);
    if (k >= 1) fly = null;
  }
  controls.update();
  envTick(dt, appMode === "compare" ? 0 : nightT); arrowTick(dt);
  const stNow = appMode === "explore" && S ? S.scenes[exploreI].state : appMode === "film" && S ? S.scenes[cur].state : "none";
  audioTick(dt, nightCur, stNow, (appMode === "film" && playing) || appMode === "explore"); fpsTick(now);
  if (!fly && !W.on && !(appMode === "film" && !userCam)) {''')
rep('''  renderer.render(scene, camera);
  const w = stage.clientWidth''','''  renderMain();
  const w = stage.clientWidth''')
rep('''  world.scale.y = EX; placeInstances(); buildLinear();''','''  world.scale.y = EX; placeInstances(); buildLinear(); buildArrows(); if (W.on) placeAvatarAt(W.pos.x, -W.pos.z);''')
rep('''  const [tx, ty] = toPx(controls.target.x, -controls.target.z), [cx, cy] = toPx(camera.position.x, -camera.position.z);''','''  if (S && $("ly-arr").checked) for (const id of S.states[arrowState] || []) {
    const def = S.arrows[id], A = ARR.get(id); if (!def || !A || A.p <= 0) continue;
    const pts = def.pts.map(([la, lo]) => toPx(...llXY(la, lo)));
    mmx.strokeStyle = mmx.fillStyle = def.c === "red" ? "#d8392b" : "#3b8ae8"; mmx.lineWidth = 3; mmx.setLineDash(def.c === "red" ? [] : [6, 4]);
    mmx.beginPath(); pts.forEach(([x, y], k) => (k ? mmx.lineTo(x, y) : mmx.moveTo(x, y))); mmx.stroke(); mmx.setLineDash([]);
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], an = Math.atan2(ey - py, ex - px);
    mmx.beginPath(); mmx.moveTo(ex + Math.cos(an) * 6, ey + Math.sin(an) * 6);
    mmx.lineTo(ex + Math.cos(an + 2.5) * 9, ey + Math.sin(an + 2.5) * 9); mmx.lineTo(ex + Math.cos(an - 2.5) * 9, ey + Math.sin(an - 2.5) * 9); mmx.fill();
  }
  mmx.lineWidth = 2;
  const [tx, ty] = toPx(controls.target.x, -controls.target.z), [cx, cy] = toPx(camera.position.x, -camera.position.z);''')
ui=open('js_ui6.js').read()
a=ui.index('function makeAvatar(role) {'); b=ui.index('function roleStart(role) {')
ui=ui[:a]+ui[b:]                       # V8: bỏ hình nhân khối, dùng lính thật (js_quan8.js)
js=open('js_env6.js').read()+ui+open('js_quan8.js').read()+open('js_amthanh8.js').read()
# ---- V7: nhân vật diễn theo cảnh
rep('''import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";''','''import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";''')
rep('''  if (!S) document.querySelector('#modes [data-m="film"]').hidden = true;''','''  if (!S) document.querySelector('#modes [data-m="film"]').hidden = true;
  if (S) nvLoad().catch((err) => console.warn("nhân vật", err));       // tải nền, không chặn màn hình chờ''')
rep('''  envTick(dt, appMode === "compare" ? 0 : nightT); arrowTick(dt);''','''  envTick(dt, appMode === "compare" ? 0 : nightT); arrowTick(dt); nvTick(dt); amTick(dt);''')
rep('''      <label><input type="checkbox" id="ly-quan" checked> Đồn, trại, lều, chông</label>''','''      <label><input type="checkbox" id="ly-quan" checked> Đồn, trại, lều, chông</label>
      <label><input type="checkbox" id="ly-nv" checked> Quân lính, voi, ngựa, tấm mộc</label>''')
rep('''// ------------------------------------------------------------------ khung hình''', js+'''
// ------------------------------------------------------------------ khung hình''')
rep('''    const sc = S.scenes[i]; applyEnv(sceneNight(sc)); showArrowsFor(sc.state);''','''    const sc = S.scenes[i]; applyEnv(sceneNight(sc)); showArrowsFor(sc.state); nvApply(i, 1, performance.now() / 1000);''')
# ---- V8: âm thanh từ thư mục AmThanh, bỏ chim/trống/giao tranh tổng hợp; đi bộ có tiếng chân thật
rep('''  audio.set({ wind: W.on ? 0.6 : 0.45, birds: (1 - night) * (battle ? 0.15 : 0.6), insects: night * 0.8, battle, drum: live ? DRUM[state] || 0 : 0 });''',
    '''  audio.set({ wind: W.on ? 0.35 : 0.22, birds: 0, insects: night * 0.6, battle: 0, drum: 0 });''')
rep('''  if (battle > 0) {
    boomT -= dt;''','''  if (false) {
    boomT -= dt;''')
rep('''  const run = W.run || k.ShiftLeft || k.ShiftRight || Math.hypot(W.joy.x, W.joy.y) > 0.92, m = Math.min(1, Math.hypot(f, r));''',
    '''  const run = W.run || k.ShiftLeft || k.ShiftRight || Math.hypot(W.joy.x, W.joy.y) > 0.92, m = Math.min(1, Math.hypot(f, r));
  W.moving = m > 0.05; W.runNow = run;''')
rep('''    W.stepT += dt; if (W.stepT > (run ? 0.3 : 0.5)) { W.stepT = 0; audio.step(run); }''','''''')
rep('''$("bsnd").onclick = (e) => { e.currentTarget.classList.remove("hint"); audio.enable(!audio.on);''',
    '''$("bsnd").onclick = (e) => { e.currentTarget.classList.remove("hint"); audio.enable(!audio.on); amEnable(audio.on);''')
rep('''<option value="dan">Vai: Người dân Thăng Long</option>''','''''')
# ---- V8b: máy quay bám lời dẫn, cận cảnh nhân vật (keys trong story.json do build_camera8.py sinh)
rep('''  return { X, Y, d: k.d, az: k.az, el: k.el };''','''  return { X, Y, d: k.d, az: k.az, el: k.el, h: k.h || 0 };''')
rep('''  const Z = heightAt(q.X, q.Y) * EX, el''','''  const Z = heightAt(q.X, q.Y) * EX + (q.h || 0), el''')
rep('''  const gz = heightAt(pos.x, -pos.z) * EX + 25; if (pos.y < gz) pos.y = gz;''',
    '''  const gz = Math.max(heightAt(pos.x, -pos.z), meta.water) * EX + (q.d < 200 ? 0.5 : 25); if (pos.y < gz) pos.y = gz;   // cận cảnh được xuống sát đất''')
rep('''    const A = keyParams(K[k]), B = keyParams(K[k + 1])''','''    if (K[k + 1].cut) return poseFrom(keyParams(K[k]));   // cắt cảnh: giữ góc cũ tới đúng giây cắt
    const A = keyParams(K[k]), B = keyParams(K[k + 1])''')
rep('''az: A.az + daz * e, el: A.el + (B.el - A.el) * e });''','''az: A.az + daz * e, el: A.el + (B.el - A.el) * e, h: A.h + (B.h - A.h) * e });''')
rep('''      camera.position.copy(P.pos); controls.target.copy(P.tgt);''','''      camera.position.copy(P.pos); controls.target.copy(P.tgt);
      const dn = THREE.MathUtils.clamp(P.pos.distanceTo(P.tgt) * 0.04, 0.05, 2);       // mặt phẳng gần co theo khoảng cách
      if (Math.abs(camera.near - dn) > 0.01) { camera.near = dn; camera.updateProjectionMatrix(); }
      controls.minDistance = 0.3; controls.maxPolarAngle = Math.PI * 0.499;''')
rep('''function takeOver() { if (appMode === "film" && !userCam) { userCam = true; $("sret").hidden = false; } }''',
    '''function takeOver() { if (appMode === "film" && !userCam) { userCam = true; $("sret").hidden = false; if (!W.on) { controls.minDistance = 25; controls.maxPolarAngle = Math.PI * 0.47; camera.near = 2; camera.updateProjectionMatrix(); } } }''')
rep('''      controls.minDistance = 0.3; controls.maxPolarAngle = Math.PI * 0.499;''','''      controls.minDistance = 0.3; controls.maxPolarAngle = Math.PI * 0.499;
      const cc = P.pos.distanceTo(P.tgt) < 260; if (cc !== document.body.classList.contains("cancanh")) { document.body.classList.toggle("cancanh", cc); markers.visible = !cc; }''')
rep('''if (!W.on) { controls.minDistance = 25;''','''document.body.classList.remove("cancanh"); markers.visible = true; if (!W.on) { controls.minDistance = 25;''')
s=s.replace('</style>','body.cancanh #labels .lbl:not(.pin) { opacity: 0; transition: opacity .3s; }\n</style>',1)
# ngoài khung sa bàn (Hà Hồi…): độ cao theo mặt đất vành ngoài của V6, để người và máy quay đứng đúng mặt đất
rep('''  return sampleField(mainField, X, Y);
}''','''  if (outerZ && !inBounds(X, Y)) return outerZ(X, Y);
  return sampleField(mainField, X, Y);
}
let outerZ = null;''')
rep('''  const apronZ = (X, Y) => { const e = sampleField(mainField, cx(X), cy(Y)); return e + (h0 - e) * smooth(0, 2600, outD(X, Y)); };''',
    '''  const apronZ = (X, Y) => { const e = sampleField(mainField, cx(X), cy(Y)); return e + (h0 - e) * smooth(0, 2600, outD(X, Y)); };
  outerZ = apronZ;''')
open('../web/index.html','w').write(s)
print(len(s))
