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
js=open('js_env6.js').read()+ui+open('js_quan10.js').read()+open('js_amthanh10.js').read()+open('js_v10_extra.js').read()+open('js_v10_voice.js').read()+open('js_v10_troi.js').read()
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
# ---- V9: ngày – đêm theo đường cong trong story.json (scene.nights)
rep('''  const n0 = sc.night || 0, n1 = sc.night_end !== undefined ? sc.night_end : n0;''','''  if (sc.nights) { const N = sc.nights, t = Math.min(st, sc.dur); for (let k = 0; k < N.length - 1; k++) if (t <= N[k + 1][0]) { const e = (t - N[k][0]) / Math.max(1e-6, N[k + 1][0] - N[k][0]); return N[k][1] + (N[k + 1][1] - N[k][1]) * e; } return N[N.length - 1][1]; }
  const n0 = sc.night || 0, n1 = sc.night_end !== undefined ? sc.night_end : n0;''')
rep('document.body.classList.toggle("cancanh", cc); markers.visible = !cc; }','document.body.classList.toggle("cancanh", cc); markers.visible = !cc; arrowGroup.visible = !cc && $(\"ly-arr\").checked; }')
# ---- V10: góc nhìn nhân vật thay So sánh; âm thanh + lời bình bật sẵn; Tư liệu chỉ còn lời bình và nguồn
rep('''<button data-m="compare" role="tab">◧ So sánh</button>''','''<button data-m="pov" role="tab">👁 Góc nhìn nhân vật</button>''')
rep('''<small class="muted">Kéo vạch giữa màn hình để so sánh hai thời điểm · xoay, phóng to như chế độ Khám phá</small>
  </div>''','''<small class="muted">Kéo vạch giữa màn hình để so sánh hai thời điểm · xoay, phóng to như chế độ Khám phá</small>
  </div>
  <div class="card bar" id="povbar" hidden>
    <div class="row"><span class="lbltxt">Nhìn qua mắt</span><select id="povsel" aria-label="Chọn nhân vật để xem góc nhìn"></select></div>
    <small class="muted" id="povmsg">Kéo màn hình để quay đầu nhìn quanh · phim vẫn chạy theo lời bình</small>
  </div>''')
rep('''<button class="chip" id="bsnd">🔇 Âm thanh</button>''','''<button class="chip on" id="bsnd">🔊 Âm thanh</button>''')
rep('''<button class="chip" id="bvo" ''','''<button class="chip on" id="barr" title="Bật / tắt mũi tên hướng tiến công (tự ẩn khi máy quay xuống cận)">➤ Mũi tên</button>
      <button class="chip on" id="bvo" ''')
rep('''let voiceOn = false, lastLine = "";''','''let voiceOn = true, lastLine = "";''')
rep('''  addEl(el, "p", [sc.date, sc.mood].filter(Boolean).join(" · "), "muted small");
  if (sc.outside) addEl(el, "p", sc.outside, "note");
  if (sc.shots && sc.shots.length) { addEl(el, "h4", "Điều đang thấy"); const ul = addEl(el, "ul"); for (const s of sc.shots) addEl(ul, "li", `${s.tc} — ${s.desc}`); }''','''  if (sc.date) addEl(el, "p", sc.date, "muted small");''')
rep('''  if (sc.simulated && sc.simulated.length) { addEl(el, "h4", "Phần tái dựng mô phỏng"); const ul = addEl(el, "ul"); for (const s of sc.simulated) addEl(ul, "li", s); }''','''''')
rep('''  addEl(el, "p", "Sa bàn tương tác tái dựng mô phỏng, chưa phải tư liệu hiện trường chính thống.", "muted small");
}''','''}''')
rep('''function setAppMode(m) {
  if (m === "film" && !S) m = "explore";''','''function setAppMode(m) {
  const pov = m === "pov" && !!S; if (m === "pov") m = "film";
  if (m === "film" && !S) m = "explore";''')
rep('''  document.body.classList.remove("m-film", "m-explore", "m-compare"); document.body.classList.add("m-" + m);
  document.querySelectorAll("#modes button").forEach((b) => { const on = b.dataset.m === m;''','''  document.body.classList.remove("m-film", "m-explore", "m-compare", "m-pov"); document.body.classList.add("m-" + m); document.body.classList.toggle("m-pov", pov);
  $("povbar").hidden = !pov; povSet(pov);
  document.querySelectorAll("#modes button").forEach((b) => { const on = b.dataset.m === (pov ? "pov" : m);''')
rep('''setAppMode(qm === "explore" || qm === "compare" ? qm : S ? "film" : "explore");''','''setAppMode(qm === "explore" || qm === "pov" ? qm : S ? "film" : "explore");''')
# ---- V10.2: ẩn menu vẫn giữ pin địa điểm; lời bình chạy được trên điện thoại
rep('''body.cinema .hud, body.cinema #labels, ''','''body.cinema .hud, ''')
rep('''  setInterval(() => { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 9000);''',
'''  // mẹo giữ giọng đọc của Chrome máy tính; trên điện thoại pause/resume làm tắt tiếng nên bỏ
  if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) setInterval(() => { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 9000);''')
rep('''    const u = new SpeechSynthesisUtterance(p); u.lang = "vi-VN"; if (VO.voice) u.voice = VO.voice; u.rate = 1.04 * Math.min(1.4, speed);''',
'''    if (!VO.voice) VO.voice = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)) || null;
    const u = new SpeechSynthesisUtterance(p); u.lang = "vi-VN"; if (VO.voice) u.voice = VO.voice; u.rate = 1.04 * Math.min(1.4, speed); u.volume = 1;''')
# ---- V10.4: voice thu âm làm đồng hồ; dòng thời gian cũ nắn theo voice; phụ đề theo câu đọc
rep('''function storyTick(dt) {
  if (!S || appMode !== "film") return 0;
  let sc = S.scenes[cur];
  if (playing) {
    st += dt * speed;''','''function storyTick(dt) {
  vcGuard();
  if (!S || appMode !== "film") return 0;
  let sc = S.scenes[cur];
  if (playing && vcTick()) sc = S.scenes[cur];
  else if (playing) {
    st += dt * speed;''')
rep('''    const P = scenePose(cur, Math.min(st, sc.dur));''','''    const P = scenePose(cur, tCu(cur, Math.min(st, sc.dur)));''')
rep('''if (sc.nights) { const N = sc.nights, t = Math.min(st, sc.dur);''','''if (sc.nights) { const N = sc.nights, t = tCu(cur, Math.min(st, sc.dur));''')
rep('''  if (appMode === "film") { i = cur; u = Math.min(1, st / S.scenes[cur].dur); }''','''  if (appMode === "film") { i = cur; u = uCu(cur, st); }''')
rep('''nvState(g, i, appMode === "film" ? Math.min(1, st / S.scenes[i].dur) : 0.5)''','''nvState(g, i, appMode === "film" ? uCu(i, st) : 0.5)''')
rep('''  if (appMode === "film") { i = cur; u = Math.min(1, st / S.scenes[cur].dur); live = playing; }''','''  if (appMode === "film") { i = cur; u = uCu(cur, st); live = playing; }''')
rep('''dur = S && S.scenes[i] ? S.scenes[i].dur : 60;''','''dur = S && S.scenes[i] ? S.scenes[i].dur_cu || S.scenes[i].dur : 60;''')
rep('''  SUBS = S.scenes.map((sc) => {
    const sents = [];''','''  SUBS = S.scenes.map((sc) => {
    if (sc.subs) return sc.subs.map(([t0, t1, text]) => ({ t0, t1, text }));
    const sents = [];''')
rep('''  if (!voiceOn || !playing || appMode !== "film" || !("speechSynthesis" in window)) return;''','''  if (!voiceOn || !playing || appMode !== "film" || !("speechSynthesis" in window) || VC.el) return;   // có voice thu âm thì không dùng giọng máy''')
# ---- V10.4: bầu trời – vầng mặt trời rõ, chân trời ửng cam lúc rạng đông / chiều tối, mây nhuộm màu
rep('''  col += (1. - uNight) * (vec3(1., .86, .62) * pow(sd, 48.) * .35 + vec3(1., .93, .8) * pow(sd, 6.) * .07);''',
'''  float sUp = smoothstep(-.2, .04, uSunDir.y), sLow = sUp * (1. - smoothstep(.04, .42, uSunDir.y));
  vec3 sunc = mix(vec3(1., .42, .16), vec3(1., .95, .82), smoothstep(-.02, .35, uSunDir.y));
  float saz = max(dot(normalize(d.xz + 1e-5), normalize(uSunDir.xz + 1e-5)), 0.);
  col = mix(col, vec3(.98, .5, .24), sLow * pow(saz, 3.) * exp(-max(h, 0.) * 5.) * .8);
  col = mix(col, vec3(.55, .42, .55), sLow * (1. - saz) * exp(-max(h, 0.) * 4.) * .25);
  col += sUp * sunc * (smoothstep(.99982, .99990, sd) * 2.4 + pow(sd, 500.) * 1.2 + pow(sd, 40.) * .32 + pow(sd, 5.) * .1);''')
rep('''    vec3 lit = mix(vec3(1., .985, .955), vec3(1., .9, .75), pow(sd, 3.) * .5);''','''    vec3 lit = mix(vec3(1., .985, .955), vec3(1., .9, .75), pow(sd, 3.) * .5);
    lit = mix(lit, vec3(1., .58, .38), sLow * (.35 + .5 * pow(saz, 2.)));''')
rep('''    float cov = smoothstep(.44, .76, n + .18 * n2);''','''    float cov = smoothstep(.44, .76, n + .18 * n2) * (1. - .55 * sLow);''')
rep('''    cc = mix(cc, vec3(.12, .14, .20), uNight);''','''    cc = mix(cc, vec3(.12, .14, .20), uNight * (1. - .55 * sLow));''')
rep('''  col = mix(col, uHor, smoothstep(.035, -.01, h));''','''  col += sUp * sunc * (pow(sd, 60.) * .3 + pow(sd, 900.) * .9);          // quầng mặt trời xuyên qua mây
  col = mix(col, uHor, smoothstep(.035, -.01, h));''')
rep('''  hemi.intensity = 1.35 + (0.42 - 1.35) * n; sun.intensity = 1.9 + (0.28 - 1.9) * n; sun.color.copy(DAY.sun).lerp(NIGHT.sun, n);''',
'''  hemi.intensity = 1.35 + (0.42 - 1.35) * n; sun.intensity = 1.9 + (0.28 - 1.9) * n; sun.color.copy(DAY.sun).lerp(NIGHT.sun, n);
  troiApply(n);''')
# ---- V10.6: điện thoại – nút Bắt đầu xem, bỏ bộ tạo tiếng tổng hợp (nặng, gây treo), máy quay rộng hơn khi cầm dọc
rep('''  if (appMode === "film") { goScene(0); setPlaying(!reduceMotion); }''','''  if (appMode === "film") { goScene(0); setPlaying(false); } else window.batDau(false);''')
rep('''    enable(v) { on = v; if (v && !AC) build(); if (AC) { if (v) AC.resume(); else AC.suspend(); } },''','''    enable(v) { on = v; },   // V10.6: âm nền thật nằm ở js_amthanh10 (amEnable); bộ tạo tiếng tổng hợp V6 đã bỏ''')
rep('''function poseFrom(q) {
  const Z''','''function poseFrom(q) {
  if (camera.aspect < 1 && q.d < 400) q = { ...q, d: q.d * Math.pow(1 / camera.aspect, 0.75) };   // điện thoại cầm dọc: lùi máy cho đủ khung
  const Z''')
open('../web10/index.html','w').write(s)
print(len(s))
