
// ------------------------------------------------------------------ âm thanh tổng hợp (cùng bộ với sa bàn Điện Biên Phủ): gió, chim, côn trùng, giao tranh xa, nổ pháo, bước chân
function createAudio() {
  let AC = null, master = null, layers = {}, on = false;
  const target = { wind: 0, birds: 0, insects: 0, battle: 0, drum: 0 };
  const rnd = () => Math.random() * 2 - 1;
  function buf(sec, fill) {
    const sr = AC.sampleRate, n = Math.floor(sec * sr), b = AC.createBuffer(1, n, sr); fill(b.getChannelData(0), sr, n);
    const d = b.getChannelData(0), f = Math.min(Math.floor(sr * 0.4), Math.floor(n / 4));
    for (let i = 0; i < f; i++) { const w = i / f; d[i] = d[i] * w + d[n - f + i] * (1 - w); }
    return b;
  }
  function loop(b) { const s = AC.createBufferSource(); s.buffer = b; s.loop = true; const g = AC.createGain(); g.gain.value = 0; s.connect(g).connect(master); s.start(); return g; }
  function build() {
    AC = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback" });
    master = AC.createGain(); master.gain.value = 0.9;
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.25;
    master.connect(comp).connect(AC.destination);
    const wake = () => { if (on && AC.state !== "running") AC.resume().catch(() => {}); };
    addEventListener("pointerdown", wake); addEventListener("keydown", wake); setInterval(wake, 2000);
    const wind = buf(9, (d, sr, n) => { let a = 0, b = 0; for (let i = 0; i < n; i++) { const t = i / sr; a += (rnd() - a) * 0.012; b += (a - b) * 0.03; d[i] = b * 7 * (0.55 + 0.45 * Math.sin(t * 0.7) * Math.sin(t * 0.23 + 1)); } });
    const birds = buf(8, (d, sr, n) => { for (let k = 0; k < 26; k++) { const s = Math.floor(Math.random() * n), f0 = 2200 + Math.random() * 2400, L = Math.floor(sr * (0.05 + Math.random() * 0.12)), rep = 1 + Math.floor(Math.random() * 4);
      for (let r = 0; r < rep; r++) { const o = s + r * Math.floor(L * 1.6); for (let i = 0; i < L && o + i < n; i++) { const t = i / sr, f = f0 * (1 + 0.25 * Math.sin(t * 90)); d[o + i] += Math.sin(2 * Math.PI * f * t) * 0.16 * Math.sin((Math.PI * i) / L); } } } });
    const insects = buf(5, (d, sr, n) => { for (let i = 0; i < n; i++) { const t = i / sr; d[i] = Math.sin(2 * Math.PI * 4300 * t) * 0.05 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 28 * t)) * (0.6 + 0.4 * Math.sin(t * 1.3)) + rnd() * 0.004; } });
    const battle = buf(10, (d, sr, n) => { let a = 0; for (let i = 0; i < n; i++) { a += (rnd() - a) * 0.004; d[i] = a * 3; }
      for (let k = 0; k < 22; k++) { const s = Math.floor(Math.random() * n), L = Math.floor(sr * (0.6 + Math.random())); let lp = 0; for (let i = 0; i < L && s + i < n; i++) { lp += (rnd() - lp) * 0.02; d[s + i] += lp * 5 * Math.exp((-i / L) * 3); } }
      for (let k = 0; k < 40; k++) { const s = Math.floor(Math.random() * n), r = 8 + Math.floor(Math.random() * 14); for (let j = 0; j < r; j++) { const o = s + Math.floor(j * sr * 0.07); for (let i = 0; i < 300 && o + i < n; i++) d[o + i] += rnd() * 0.12 * Math.exp(-i / 60); } } });
    // trống trận: nhịp dồn của đại quân hành tiến
    const drum = buf(4, (d, sr, n) => { const beats = [0, 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.25, 3.5]; for (const b of beats) { const s = Math.floor(b * sr); for (let i = 0; i < sr * 0.45 && s + i < n; i++) { const t = i / sr; d[s + i] += (Math.sin(2 * Math.PI * (62 + 40 * Math.exp(-t * 18)) * t) * 0.7 + rnd() * 0.08 * Math.exp(-t * 40)) * Math.exp(-t * 7); } } });
    layers = { wind: loop(wind), birds: loop(birds), insects: loop(insects), battle: loop(battle), drum: loop(drum) };
  }
  const BASE = { wind: 0.45, birds: 0.8, insects: 0.35, battle: 0.6, drum: 0.55 };
  const CACHE = {}; let live = 0; const RATE = {};
  function shot(sec, fill, vol, delay = 0, key = null) {
    if (!on || !AC || AC.state !== "running" || live > 14) return;
    const kind = key ? key.replace(/\d+/g, "") : "x", now = AC.currentTime, R = RATE[kind] || (RATE[kind] = { t: now, n: 0 });
    if (now - R.t > 1) { R.t = now; R.n = 0; }
    if (R.n >= (kind === "boom" ? 5 : kind === "buoc" ? 6 : 10)) return; R.n++;
    let b; if (key) { const L = CACHE[key] || (CACHE[key] = []); if (L.length < 4) { b = buf(sec, fill); L.push(b); } else b = L[Math.floor(Math.random() * L.length)]; } else b = buf(sec, fill);
    const s = AC.createBufferSource(); s.buffer = b; s.playbackRate.value = key ? 0.92 + Math.random() * 0.16 : 1;
    const g = AC.createGain(); g.gain.value = vol; s.connect(g).connect(master); live++;
    setTimeout(() => { live = Math.max(0, live - 1); }, (sec / (s.playbackRate.value || 1) + delay) * 1000 + 60);
    s.start(AC.currentTime + delay);
  }
  return {
    get on() { return on; },
    enable(v) { on = v; if (v && !AC) build(); if (AC) { if (v) AC.resume(); else AC.suspend(); } },
    set(m) { Object.assign(target, m); },
    tick(dt) { if (!on || !AC) return; const k = Math.min(1, dt * 1.5); for (const n in layers) { const g = layers[n].gain; g.value += (BASE[n] * (target[n] || 0) - g.value) * k; } },
    boom(dist = 800, size = 1) { const d = Math.max(0.15, Math.min(1, 600 / Math.max(200, dist)));
      shot(2.2, (a, sr, n) => { let lp = 0; for (let i = 0; i < n; i++) { lp += (rnd() - lp) * (0.04 + 0.1 * d); a[i] = lp * 4 * Math.exp((-i / sr) * (2.2 - size * 0.6)) * (i < sr * 0.01 ? i / (sr * 0.01) : 1); } }, 0.5 * d * size, dist / 1500, "boom" + Math.round(d * 2) + Math.min(3, Math.round(size))); },
    gun(dist = 200) { const d = Math.max(0.05, Math.min(1, 60 / Math.max(30, dist)));
      shot(0.35, (a, sr, n) => { let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; lp += (rnd() - lp) * 0.35; a[i] = (rnd() * 0.6 + lp) * Math.exp(-t * (dist < 120 ? 30 : 14)); } }, 0.35 * d, dist / 900, dist < 120 ? "gunN" : "gunF"); },
    step(run) { shot(0.16, (a, sr, n) => { let lp = 0; for (let i = 0; i < n; i++) { const t = i / sr; lp += (rnd() - lp) * 0.18; a[i] = (lp * 1.6 + rnd() * 0.15) * Math.exp(-t * (run ? 34 : 26)) * (t < 0.006 ? t / 0.006 : 1); } }, run ? 0.32 : 0.22, 0, "buoc"); },
  };
}
const audio = createAudio();
// mức giao tranh, trống trận theo diễn biến
const BATTLE = { hahoi: 0.35, ngochoi: 1, dammuc: 0.7, dongda: 0.9, thanglong: 0.4 };
const DRUM = { hanhquan: 0.8, kehoach: 0.5, hahoi: 0.6, ngochoi: 0.9, dongda: 0.9, thanglong: 0.7 };
let boomT = 2;
function audioTick(dt, night, state, live) {
  if (!audio.on) return;
  const battle = live ? BATTLE[state] || 0 : 0;
  audio.set({ wind: W.on ? 0.6 : 0.45, birds: (1 - night) * (battle ? 0.15 : 0.6), insects: night * 0.8, battle, drum: live ? DRUM[state] || 0 : 0 });
  audio.tick(dt);
  if (battle > 0) {
    boomT -= dt;
    if (boomT < 0) { boomT = 0.7 + (Math.random() * 3) / battle; audio.boom(500 + Math.random() * 2500, 0.6 + Math.random() * 0.8); if (Math.random() < 0.6) audio.gun(150 + Math.random() * 700); }
  }
}

// ------------------------------------------------------------------ lời bình: giọng tiếng Việt của máy (Web Speech)
const VO = { voice: null, q: 0 };
let voiceOn = false, lastLine = "";
if ("speechSynthesis" in window) {
  const pick = () => { VO.voice = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)) || null; };
  pick(); speechSynthesis.onvoiceschanged = pick;
  setInterval(() => { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 9000);
}
function voStop() { VO.q = 0; try { speechSynthesis.cancel(); } catch (e) {} }
function speak(tx) {
  if (!voiceOn || !playing || appMode !== "film" || !("speechSynthesis" in window)) return;
  const clean = tx.replace(/[“”"…·()]/g, " ").replace(/\s+/g, " ").trim(), parts = []; let c = "";
  for (const w of clean.split(/(?<=[.,;:!?])\s+/)) { if ((c + " " + w).trim().length > 130 && c) { parts.push(c); c = w; } else c = (c + " " + w).trim(); }
  if (c) parts.push(c);
  if (speechSynthesis.speaking && VO.q > 2) voStop();
  for (const p of parts) {
    const u = new SpeechSynthesisUtterance(p); u.lang = "vi-VN"; if (VO.voice) u.voice = VO.voice; u.rate = 1.04 * Math.min(1.4, speed);
    VO.q++; u.onend = u.onerror = () => { VO.q = Math.max(0, VO.q - 1); }; speechSynthesis.speak(u);
  }
}

// ------------------------------------------------------------------ phim tự động: máy quay dẫn chuyện, phụ đề, tư liệu
let appMode = "film", cur = 0, st = 0, playing = false, speed = 1, userCam = false, dirBlend = null, seeking = false, starts = [], total = 1, SUBS = [];
let exploreI = 0, cmpA = 0, cmpB = 0, split = 0.5;
const fmtT = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const sceneNo = (i) => "C" + String(i + 1).padStart(2, "0");
const sceneNight = (sc) => (sc.night_end !== undefined ? sc.night_end : sc.night || 0);
function keyParams(k) {
  let X = 0, Y = 0;
  if (k.ll) [X, Y] = llXY(k.ll[0], k.ll[1]);
  else if (k.at && anchors.get(k.at)) { const A = anchors.get(k.at); X = A.X + (k.off ? k.off[0] : 0); Y = A.Y + (k.off ? k.off[1] : 0); }
  return { X, Y, d: k.d, az: k.az, el: k.el };
}
function poseFrom(q) {
  const Z = heightAt(q.X, q.Y) * EX, el = (q.el * Math.PI) / 180, a = (q.az * Math.PI) / 180, hh = q.d * Math.cos(el);
  const tgt = new THREE.Vector3(q.X, Z, -q.Y);
  const pos = new THREE.Vector3(q.X + Math.sin(a) * hh, Z + q.d * Math.sin(el), -(q.Y + Math.cos(a) * hh));
  const gz = heightAt(pos.x, -pos.z) * EX + 25; if (pos.y < gz) pos.y = gz;
  return { pos, tgt };
}
function scenePose(i, t) {
  const K = S.scenes[i].keys; if (!K || !K.length) return null;
  if (t <= K[0].t) return poseFrom(keyParams(K[0]));
  for (let k = 0; k < K.length - 1; k++) if (t < K[k + 1].t) {
    const A = keyParams(K[k]), B = keyParams(K[k + 1]), u = (t - K[k].t) / (K[k + 1].t - K[k].t), e = 0.35 * u + 0.65 * u * u * (3 - 2 * u);
    const daz = ((B.az - A.az + 540) % 360) - 180;
    return poseFrom({ X: A.X + (B.X - A.X) * e, Y: A.Y + (B.Y - A.Y) * e, d: A.d * Math.pow(B.d / A.d, e), az: A.az + daz * e, el: A.el + (B.el - A.el) * e });
  }
  return poseFrom(keyParams(K[K.length - 1]));
}
function startBlend() { fly = null; dirBlend = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone() }; }
function takeOver() { if (appMode === "film" && !userCam) { userCam = true; $("sret").hidden = false; } }
controls.addEventListener("start", takeOver);
function prepStory() {
  let t = 0; starts = S.scenes.map((sc) => { const s = t; t += sc.dur; return s; }); total = t;
  SUBS = S.scenes.map((sc) => {
    const sents = [];
    for (const para of sc.vo || []) for (const s of para.split(/(?<=[.!?…])\s+/)) if (s.trim()) sents.push(s.trim());
    const tot = sents.reduce((a, s) => a + s.length + 12, 0) || 1; let tt = sc.dur * 0.02; const span = sc.dur * 0.96;
    return sents.map((s) => { const d = ((s.length + 12) / tot) * span, o = { t0: tt, t1: tt + d, text: s }; tt += d; return o; });
  });
  S.scenes.forEach((sc, i) => { if (!i) return; const el = document.createElement("i"); el.style.left = `calc(${(starts[i] / total) * 100}% - 1px)`; $("ticks").append(el); });
  $("scenes").querySelector("h3").textContent = `${S.scenes.length} cảnh · kịch bản V1`;
  S.scenes.forEach((sc, i) => {
    const li = document.createElement("li"), b = document.createElement("button"), n = document.createElement("b"), sm = document.createElement("small");
    n.textContent = sceneNo(i); sm.textContent = `${fmtT(starts[i])} · ${sc.date || ""} · ${sc.place || ""}`;
    b.append(n, sc.title, sm); b.onclick = () => { goScene(i); $("scenes").hidden = true; };
    li.append(b); $("slist").append(li);
    for (const sel of [$("cmpA"), $("cmpB")]) { const o = document.createElement("option"); o.value = i; o.textContent = `${sceneNo(i)} · ${sc.date || sc.title}`; sel.append(o); }
  });
  $("dslider").max = S.scenes.length - 1;
  const first = (stt) => S.scenes.findIndex((sc) => sc.state === stt);
  cmpA = Math.max(0, first("kehoach")); cmpB = S.scenes.length - 1;
  for (let i = S.scenes.length - 1; i >= 0; i--) if (S.scenes[i].state === "thanglong") { cmpB = i; break; }
  $("cmpA").value = cmpA; $("cmpB").value = cmpB;
  buildArrows();
}
function onScene() {
  const sc = S.scenes[cur];
  $("stitle").textContent = `${sceneNo(cur)} · ${sc.title}`;
  $("snote").textContent = sc.outside || ""; $("snote").hidden = !sc.outside;
  if (appMode === "film") $("sdate").textContent = sc.date || "";
  setArrowState(sc.state || "none");
  $("slist").querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === cur));
  if (!$("docs").hidden) fillDocs();
}
function goScene(i, t = 0) {
  cur = Math.max(0, Math.min(S.scenes.length - 1, i)); st = t; userCam = false; $("sret").hidden = true; lastLine = "";
  voStop(); startBlend(); onScene(); updStoryUI(true);
}
function setPlaying(b) {
  if (b && S && cur === S.scenes.length - 1 && st >= S.scenes[cur].dur - 0.05) goScene(0);
  playing = b; $("splay").textContent = b ? "⏸" : "▶"; $("splay").setAttribute("aria-label", b ? "Tạm dừng" : "Phát");
  if (!b) voStop(); else lastLine = "";
}
function updSub() {
  const el = $("sub"), on = S && appMode === "film" && $("ly-sub").checked;
  let txt = "", key = "";
  if (S && appMode === "film") (SUBS[cur] || []).forEach((s, k) => { if (st >= s.t0 && st < s.t1) { txt = s.text; key = cur + ":" + k; } });
  if (key && key !== lastLine) { lastLine = key; speak(txt); }
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt) el.textContent = txt;
  el.hidden = !txt;
}
let uiTick = 0;
function updStoryUI(force) {
  if (!force && (uiTick++ & 3)) return;
  const g = starts[cur] + st;
  $("stime").textContent = `${fmtT(g)} / ${fmtT(total)}`;
  if (!seeking) $("seek").value = Math.round((g / total) * 1000);
  updSub();
}
function storyTick(dt) {
  if (!S || appMode !== "film") return 0;
  let sc = S.scenes[cur];
  if (playing) {
    st += dt * speed;
    if (st >= sc.dur) {
      if (cur < S.scenes.length - 1) { cur++; st = 0; onScene(); sc = S.scenes[cur]; }
      else { st = sc.dur; setPlaying(false); }
    }
  }
  if (!userCam) {
    const P = scenePose(cur, Math.min(st, sc.dur));
    if (P) {
      if (dirBlend) {
        const k = Math.min((performance.now() - dirBlend.t0) / 1500, 1), e = k * k * (3 - 2 * k);
        P.pos.lerpVectors(dirBlend.p0, P.pos, e); P.tgt.lerpVectors(dirBlend.q0, P.tgt, e);
        if (k >= 1) dirBlend = null;
      }
      camera.position.copy(P.pos); controls.target.copy(P.tgt);
    }
  }
  updStoryUI(false);
  const n0 = sc.night || 0, n1 = sc.night_end !== undefined ? sc.night_end : n0;
  return n0 + (n1 - n0) * Math.min(1, st / sc.dur);
}
function addEl(parent, tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; parent.append(e); return e; }
const docsIndex = () => (appMode === "explore" ? exploreI : appMode === "compare" ? cmpB : cur);
function fillDocs() {
  const i = docsIndex(), sc = S.scenes[i], el = $("docsbody"); el.replaceChildren();
  addEl(el, "div", `${sceneNo(i)} · ${sc.place || ""}`, "eyebrow");
  addEl(el, "h2", sc.title);
  addEl(el, "p", [sc.date, sc.mood].filter(Boolean).join(" · "), "muted small");
  if (sc.outside) addEl(el, "p", sc.outside, "note");
  if (sc.shots && sc.shots.length) { addEl(el, "h4", "Điều đang thấy"); const ul = addEl(el, "ul"); for (const s of sc.shots) addEl(ul, "li", `${s.tc} — ${s.desc}`); }
  if (sc.vo && sc.vo.length) { addEl(el, "h4", "Lời bình"); for (const p of sc.vo) addEl(el, "p", p); }
  if (sc.simulated && sc.simulated.length) { addEl(el, "h4", "Phần tái dựng mô phỏng"); const ul = addEl(el, "ul"); for (const s of sc.simulated) addEl(ul, "li", s); }
  if (S.refs && S.refs.length) {
    addEl(el, "h4", "Tư liệu đối chiếu"); const ul = addEl(el, "ul");
    for (const [t, u] of S.refs) { const li = addEl(ul, "li"), a = addEl(li, "a", t); a.href = u; a.target = "_blank"; a.rel = "noopener"; }
  }
  addEl(el, "p", "Sa bàn tương tác tái dựng mô phỏng, chưa phải tư liệu hiện trường chính thống.", "muted small");
}

// ------------------------------------------------------------------ khám phá: chọn mốc lịch sử, đi bộ trên sa bàn với phím ảo
function onExplore() {
  if (!S) return;
  const sc = S.scenes[exploreI];
  $("dlabel").textContent = `${sceneNo(exploreI)} · ${sc.date || sc.title}`;
  $("sdate").textContent = "KHÁM PHÁ · " + (sc.date || "");
  setArrowState(sc.state || "none");
  if (!$("docs").hidden) fillDocs();
}
$("dslider").addEventListener("input", (e) => { exploreI = +e.target.value; onExplore(); });

const W = { on: false, av: null, role: "", keys: {}, joy: { x: 0, y: 0 }, pos: new THREE.Vector3(), yaw: 0, fp: false, run: false, phase: 0, stepT: 0 };
function makeAvatar(role) {
  const C = { tayson: [0x7a2a1c, 0x2a2420, 0x2b211a, "non"], thanh: [0x34507a, 0x2a2a30, 0x7a1c1c, "mu"], dan: [0x5c4630, 0x2e2a24, 0xd9c99c, "la"] }[role];
  const L = (c) => new THREE.MeshLambertMaterial({ color: c });
  const skin = L(0xc8956c), shirt = L(C[0]), pants = L(C[1]), hatM = L(C[2]);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const add = (geo, mat, x, y, z, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  add(new THREE.CylinderGeometry(0.19, 0.23, 0.6, 10), shirt, 0, 1.13, 0);
  add(new THREE.CylinderGeometry(0.22, 0.2, 0.2, 10), role === "tayson" ? L(0xb0342a) : pants, 0, 0.84, 0);
  add(new THREE.SphereGeometry(0.115, 14, 10), skin, 0, 1.57, 0);
  if (C[3] === "non") add(new THREE.ConeGeometry(0.19, 0.2, 12), hatM, 0, 1.74, 0);
  else if (C[3] === "mu") { add(new THREE.CylinderGeometry(0.15, 0.2, 0.1, 12), hatM, 0, 1.7, 0); add(new THREE.SphereGeometry(0.045, 8, 6), L(0xd23a2a), 0, 1.78, 0); }
  else add(new THREE.ConeGeometry(0.33, 0.19, 16), hatM, 0, 1.72, 0);
  const limb = (x, y, r0, r1, len, mat) => { const p = new THREE.Group(); p.position.set(x, y, 0); body.add(p); add(new THREE.CylinderGeometry(r0, r1, len, 8), mat, 0, -len / 2, 0, p); return p; };
  const legs = [limb(-0.1, 0.8, 0.075, 0.065, 0.8, pants), limb(0.1, 0.8, 0.075, 0.065, 0.8, pants)];
  const arms = [limb(-0.26, 1.38, 0.06, 0.05, 0.6, shirt), limb(0.26, 1.38, 0.06, 0.05, 0.6, shirt)];
  if (role === "tayson") { const sp = add(new THREE.CylinderGeometry(0.014, 0.014, 2.3, 6), L(0x5a4026), 0.02, -0.25, 0.12, arms[1]); add(new THREE.ConeGeometry(0.04, 0.22, 6), L(0xb8b8b0), 0, 1.25, 0, sp); }
  if (role === "thanh") { const gun = add(new THREE.BoxGeometry(0.05, 1.25, 0.05), L(0x3a2a1c), 0.1, 1.15, -0.2); gun.rotation.z = 0.5; }
  if (role === "dan") { const pole = add(new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6), L(0x8a6a3a), 0, 1.45, 0); pole.rotation.z = Math.PI / 2;
    for (const s of [-0.75, 0.75]) add(new THREE.CylinderGeometry(0.16, 0.12, 0.2, 10), L(0x7a5a30), s, 0.75, 0); }
  g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  scene.add(g);
  return { obj: g, body, legs, arms };
}
function roleStart(role) {
  const at = (n, dx, dy) => { const A = anchors.get(n); return A ? [A.X + dx, A.Y + dy] : [0, 0]; };
  return role === "thanh" ? at("NgocHoi_Don", 0, 0) : role === "dan" ? at("ThangLong_PhoCho", 0, 0) : at("NgocHoi_Don", 0, -480);
}
function clampXY(X, Y) {
  const x1 = meta.x0 + (meta.nx - 1) * meta.cell, y1 = meta.y0 + (meta.ny - 1) * meta.cell;
  return [Math.min(Math.max(X, meta.x0 + 5), x1 - 5), Math.min(Math.max(Y, meta.y0 + 5), y1 - 5)];
}
const groundY = (X, Y) => Math.max(heightAt(X, Y), meta.water - 0.9) * EX;
function placeAvatarAt(X, Y) {
  [X, Y] = clampXY(X, Y); const old = W.pos.clone();
  W.pos.set(X, groundY(X, Y), -Y);
  if (W.on) { const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d); }
}
function setWalk(on, at) {
  W.on = on; document.body.classList.toggle("walking", on);
  $("bwalk").classList.toggle("on", on); $("bwalk").textContent = on ? "🚶 Đang đi bộ · thoát" : "🚶 Xuống đi bộ";
  $("joy").hidden = !on; $("runbtn").hidden = !on; $("walkhelp").hidden = !on; document.querySelector("#explorebar .help").hidden = on;
  if (on) {
    if (mode !== "view") setMode("view");
    const role = $("role").value;
    if (!W.av || W.role !== role) { if (W.av) scene.remove(W.av.obj); W.av = makeAvatar(role); W.role = role; }
    W.av.obj.visible = true;
    let X, Y;
    if (at) [X, Y] = at;
    else if (camera.position.distanceTo(controls.target) < 3000) {      // xuống ngay trước chỗ đang nhìn, quay mặt về phía đó
      const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z, l = Math.hypot(dx, dz) || 1;
      const back = Math.min(90, camera.position.distanceTo(controls.target) * 0.3);
      X = controls.target.x + (dx / l) * back; Y = -(controls.target.z + (dz / l) * back); W.yaw = Math.atan2(-dx, -dz);
    } else [X, Y] = roleStart(role);
    [X, Y] = clampXY(X, Y); W.pos.set(X, groundY(X, Y), -Y);
    fly = null; setAuto(false); controls.enablePan = false; controls.zoomToCursor = false;
    camera.near = 0.1; camera.updateProjectionMatrix();
    controls.target.copy(W.pos).add(new THREE.Vector3(0, 1.5, 0));
    camera.position.copy(controls.target).add(new THREE.Vector3(Math.sin(W.yaw) * -7, 1.6, Math.cos(W.yaw) * -7));
    if (W.av) W.av.obj.rotation.y = W.yaw;
    setPov();
  } else {
    if (W.av) W.av.obj.visible = false;
    W.keys = {}; W.joy.x = W.joy.y = 0;
    controls.enablePan = true; controls.zoomToCursor = true; camera.near = 2; camera.updateProjectionMatrix();
    controls.minDistance = 25; controls.maxDistance = 70000; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.47;
    if (appMode === "explore") flyTo(W.pos.x, -W.pos.z, 700);
  }
}
function setPov() {
  const fp = $("pov").value === "1"; W.fp = fp; if (!W.on) return;
  const dir = camera.position.clone().sub(controls.target);
  if (fp) { dir.set(-Math.sin(W.yaw), 0, -Math.cos(W.yaw)).setLength(0.35); controls.minPolarAngle = Math.PI * 0.3; controls.maxPolarAngle = Math.PI * 0.62; }
  else { dir.setLength(6); controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.49; }
  camera.position.copy(controls.target).add(dir);
  controls.minDistance = fp ? 0.3 : 2; controls.maxDistance = fp ? 0.4 : 60; controls.update();
}
$("role").onchange = () => { if (W.on) setWalk(true, [W.pos.x, -W.pos.z]); };
$("pov").onchange = setPov;
$("bwalk").onclick = () => setWalk(!W.on);
$("runbtn").onclick = () => { W.run = !W.run; $("runbtn").classList.toggle("on", W.run); $("runbtn").setAttribute("aria-pressed", W.run); };
const camF = new THREE.Vector3(), camR = new THREE.Vector3(), mv = new THREE.Vector3();
function walkTick(dt) {
  const k = W.keys;
  const f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - W.joy.y, r = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + W.joy.x;
  const run = W.run || k.ShiftLeft || k.ShiftRight || Math.hypot(W.joy.x, W.joy.y) > 0.92, m = Math.min(1, Math.hypot(f, r));
  camera.getWorldDirection(camF); camF.y = 0; camF.normalize(); camR.set(-camF.z, 0, camF.x);
  mv.set(0, 0, 0).addScaledVector(camF, f).addScaledVector(camR, r);
  const old = W.pos.clone();
  if (m > 0.05) {
    mv.normalize(); const sp = run ? 6 : 1.8;
    let X = W.pos.x + mv.x * sp * dt * m, Y = -(W.pos.z + mv.z * sp * dt * m); [X, Y] = clampXY(X, Y);
    W.pos.set(X, groundY(X, Y), -Y); W.yaw = Math.atan2(mv.x, mv.z);
    W.phase += dt * (run ? 11 : 7) * m;
    W.stepT += dt; if (W.stepT > (run ? 0.3 : 0.5)) { W.stepT = 0; audio.step(run); }
  } else { W.pos.y = groundY(W.pos.x, -W.pos.z); W.phase *= 1 - Math.min(1, dt * 8); }
  const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d);
  const A = W.av, sw = Math.sin(W.phase) * (m > 0.05 ? (run ? 0.75 : 0.5) : Math.min(0.5, Math.abs(W.phase)));
  A.obj.position.copy(W.pos);
  A.legs[0].rotation.x = sw; A.legs[1].rotation.x = -sw; A.arms[0].rotation.x = -sw * 0.8; A.arms[1].rotation.x = sw * 0.8;
  A.body.position.y = m > 0.05 ? Math.abs(Math.cos(W.phase)) * (run ? 0.06 : 0.03) : 0;
  A.body.rotation.x = run && m > 0.05 ? 0.15 : 0;
  const dy = ((W.yaw - A.obj.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI; A.obj.rotation.y += dy * Math.min(1, dt * 10);
  const eye = W.fp ? 1.6 : 1.5; controls.target.y += (W.pos.y + eye - controls.target.y) * Math.min(1, dt * 8);
  A.obj.visible = !W.fp;
}
function walkTeleport(X, Y) { placeAvatarAt(X, Y); }
addEventListener("keydown", (e) => { if (W.on && !(e.target.closest && e.target.closest("input, select, textarea"))) { W.keys[e.code] = true; if (e.code.startsWith("Arrow")) e.preventDefault(); } });
addEventListener("keyup", (e) => { W.keys[e.code] = false; });
{
  const jb = $("joy"), jk = jb.querySelector("span"); let id = null;
  jb.addEventListener("pointerdown", (e) => { id = e.pointerId; jb.setPointerCapture(id); e.preventDefault(); move(e); });
  const move = (e) => {
    if (e.pointerId !== id) return;
    const r = jb.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    W.joy.x = x; W.joy.y = y; jk.style.transform = `translate(${x * 38}px,${y * 38}px)`;
  };
  jb.addEventListener("pointermove", move);
  const end = () => { id = null; W.joy.x = W.joy.y = 0; jk.style.transform = ""; };
  jb.addEventListener("pointerup", end); jb.addEventListener("pointercancel", end);
}

// ------------------------------------------------------------------ so sánh hai mốc: chia đôi màn hình
function showArrowsFor(state) {
  const ids = new Set((S && S.states[state]) || []);
  for (const [id, A] of ARR) { A.g.visible = ids.has(id); for (const m of A.g.children) m.geometry.setDrawRange(0, Infinity); }
}
function updCmpLabels() {
  if (!S) return;
  const a = $("cmpLA"), b = $("cmpLB"), w = stage.clientWidth;
  a.textContent = "◀ " + sceneNo(cmpA) + " · " + (S.scenes[cmpA].date || ""); b.textContent = sceneNo(cmpB) + " · " + (S.scenes[cmpB].date || "") + " ▶";
  a.hidden = b.hidden = appMode !== "compare";
  a.style.left = "auto"; a.style.right = `${w - w * split + 14}px`; b.style.left = `${w * split + 14}px`;
  $("divider").style.left = split * 100 + "%";
  if (appMode === "compare") $("sdate").textContent = "SO SÁNH HAI MỐC";
}
$("cmpA").onchange = (e) => { cmpA = +e.target.value; updCmpLabels(); if (!$("docs").hidden) fillDocs(); };
$("cmpB").onchange = (e) => { cmpB = +e.target.value; updCmpLabels(); if (!$("docs").hidden) fillDocs(); };
{
  const dv = $("divider"); let id = null;
  dv.addEventListener("pointerdown", (e) => { id = e.pointerId; dv.setPointerCapture(id); e.preventDefault(); });
  dv.addEventListener("pointermove", (e) => { if (e.pointerId !== id) return; split = Math.min(0.95, Math.max(0.05, e.clientX / stage.clientWidth)); updCmpLabels(); });
  dv.addEventListener("pointerup", () => { id = null; });
}
function renderMain() {
  if (appMode !== "compare" || !S) { renderer.render(scene, camera); return; }
  const w = stage.clientWidth, h = stage.clientHeight, sx = Math.round(w * split), keep = nightCur;
  renderer.setScissorTest(true);
  for (const [i, x0, ww] of [[cmpA, 0, sx], [cmpB, sx, w - sx]]) {
    if (ww <= 0) continue;
    const sc = S.scenes[i]; applyEnv(sceneNight(sc)); showArrowsFor(sc.state);
    if (!$("ly-arr").checked) arrowGroup.visible = false;
    renderer.setScissor(x0, 0, ww, h); renderer.render(scene, camera);
  }
  renderer.setScissorTest(false); applyEnv(keep);
}

// ------------------------------------------------------------------ chế độ, menu, phím tắt
function setAppMode(m) {
  if (m === "film" && !S) m = "explore";
  if (m !== "explore" && W.on) setWalk(false);
  const prev = appMode; appMode = m;
  document.body.classList.remove("m-film", "m-explore", "m-compare"); document.body.classList.add("m-" + m);
  document.querySelectorAll("#modes button").forEach((b) => { const on = b.dataset.m === m; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
  $("filmbar").hidden = m !== "film"; $("explorebar").hidden = m !== "explore"; $("comparebar").hidden = m !== "compare"; $("divider").hidden = m !== "compare";
  if (m !== "explore") { if (mode !== "view") setMode("view"); $("review").hidden = true; $("revbtn").setAttribute("aria-pressed", "false"); }
  if (m === "film") { userCam = false; $("sret").hidden = true; startBlend(); onScene(); }
  else { setPlaying(false); $("scenes").hidden = true; }
  if (m === "explore") { exploreI = cur; $("dslider").value = cur; onExplore(); $("help").textContent = HELP[mode]; }
  if (prev === "compare" && m !== "compare") { arrowGroup.visible = $("ly-arr").checked; applyArrowProgress(); }
  updCmpLabels(); if (m !== "compare") $("cmpLA").hidden = $("cmpLB").hidden = true;
  if (m === "film" && S) $("sdate").textContent = S.scenes[cur].date || "";
  if (!$("docs").hidden && S) fillDocs();
  updSub(); setTimeout(resize, 30);
}
$("modes").addEventListener("click", (e) => { const b = e.target.closest("button[data-m]"); if (b) setAppMode(b.dataset.m); });
$("splay").onclick = () => setPlaying(!playing);
$("sprev").onclick = () => goScene(st > 4 ? cur : cur - 1);
$("snext").onclick = () => goScene(cur + 1);
$("sspeed").onchange = (e) => { speed = parseFloat(e.target.value) || 1; };
$("bscenes").onclick = () => { $("scenes").hidden = !$("scenes").hidden; };
$("scx").onclick = () => { $("scenes").hidden = true; };
$("sret").onclick = () => { userCam = false; $("sret").hidden = true; startBlend(); };
$("seek").addEventListener("input", (e) => {
  seeking = true; const g = (e.target.value / 1000) * total; let i = 0;
  while (i < starts.length - 1 && g >= starts[i + 1]) i++;
  if (i !== cur) { cur = i; onScene(); }
  st = g - starts[i]; userCam = false; $("sret").hidden = true; voStop(); if (!dirBlend) startBlend(); updStoryUI(true);
});
$("seek").addEventListener("change", () => { seeking = false; });
const panelToggle = (btn, panel, others) => {
  $(btn).onclick = () => { const open = $(panel).hidden; $(panel).hidden = !open; $(btn).classList.toggle("on", open); $(btn).setAttribute("aria-expanded", open);
    if (open) for (const [ob, op] of others) { $(op).hidden = true; $(ob).classList.remove("on"); } };
};
panelToggle("blayers", "layerp", [["blegend", "legend"]]);
panelToggle("blegend", "legend", [["blayers", "layerp"]]);
$("bdocs").onclick = () => { const open = $("docs").hidden; if (open && S) fillDocs(); $("docs").hidden = !open; $("bdocs").classList.toggle("on", open); if (open) $("info").hidden = true; };
$("docsx").onclick = () => { $("docs").hidden = true; $("bdocs").classList.remove("on"); };
$("bsnd").onclick = (e) => { e.currentTarget.classList.remove("hint"); audio.enable(!audio.on); e.currentTarget.classList.toggle("on", audio.on); e.currentTarget.textContent = audio.on ? "🔊 Âm thanh" : "🔇 Âm thanh"; };
$("bvo").onclick = (e) => { voiceOn = !voiceOn; e.currentTarget.classList.toggle("on", voiceOn); if (!voiceOn) voStop(); else lastLine = ""; };
$("ly-sub").onchange = () => updSub();
$("ly-mm").onchange = (e) => { $("minimap").hidden = !e.target.checked; };
const cinema = (on) => { document.body.classList.toggle("cinema", on); $("bshow").hidden = !on; setTimeout(resize, 30); };
$("bhide").onclick = () => cinema(true); $("bshow").onclick = () => cinema(false);
addEventListener("keydown", (e) => {
  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  if (e.code === "KeyH" && !W.on) cinema(!document.body.classList.contains("cinema"));
  else if (e.code === "Space" && appMode === "film" && !(e.target.closest && e.target.closest("button"))) { e.preventDefault(); setPlaying(!playing); }
  else if (e.code === "PageDown" && appMode === "film") goScene(cur + 1);
  else if (e.code === "PageUp" && appMode === "film") goScene(cur - 1);
  else if (e.key === "Escape") { if (W.on) setWalk(false); cinema(false); $("scenes").hidden = true; $("docs").hidden = true; $("bdocs").classList.remove("on"); }
});
$("bsnd").classList.add("hint");
let fpsN = 0, fpsT = performance.now();
function fpsTick(now) { fpsN++; if (now - fpsT > 1000) { $("fps").textContent = Math.round((fpsN * 1000) / (now - fpsT)) + " fps"; fpsN = 0; fpsT = now; } }
