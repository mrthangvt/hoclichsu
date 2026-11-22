#!/usr/bin/env python3
"""Dựng bộ máy sa bàn 1.0.0 (khong-gian/engine/1.0.0/sa-ban.js) từ mã sa bàn Ngọc Hồi – Đống Đa V10.

Bộ máy 1.0 là mã V10 đã tách phần riêng của trận ra gói dữ liệu (pack.json): tên mốc, góc nhìn, núi xa, âm nền theo cảnh,
loại quân, cờ, hiệu ứng, cầu phao, trại, vai đi bộ, góc nhìn nhân vật. Script này ghi lại từng chỗ sửa để soát được,
và chỉ dùng một lần khi tách; từ nay sửa thẳng engine/1.0.0/sa-ban.js (bản 1.0.x) hoặc tạo engine/1.1.0/.

Dùng:  python3 vietsu/tools/sa_ban/tach_bo_may.py   (đọc mã từ khong-gian/ngoc-hoi-dong-da/index.html)
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
html = (ROOT / "ngoc-hoi-dong-da" / "index.html").read_text(encoding="utf-8")
a = html.index('<script type="module">'); b = html.index("</script>", a)
js = html[a + len('<script type="module">'):b]

def rep(old, new, count=1):
    global js
    n = js.count(old)
    if n != count: raise SystemExit(f"Không khớp ({n} ≠ {count}):\n{old[:160]}")
    js = js.replace(old, new)

# ── đầu tệp: three.js dùng bản đặt sẵn cạnh bộ máy, không cần importmap
rep('''import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
''', '''// Bộ máy sa bàn Việt Sử 1.0.0 — docs/KHUNG_SA_BAN.md. Tách từ sa bàn Ngọc Hồi – Đống Đa V10 (tools/sa_ban/tach_bo_may.py).
// Mọi thứ riêng của một trận nằm trong gói: packs/<id>/pack.json, story.json, placement.json, terrain/, units/, props/, audio/.
import * as THREE from "./vendor/three/three.module.min.js";
import { OrbitControls } from "./vendor/three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "./vendor/three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "./vendor/three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "./vendor/three/addons/libs/meshopt_decoder.module.js";
import { khungHTML } from "./khung.js";
export const VERSION = "1.0.0";
const ENGINE_MAJOR = 1;

function hopPhienBan(rang) {                                 // "^1.0" → bộ máy 1.x chạy được
  const m = /^\\^?(\\d+)/.exec(String(rang || "^1")); return !m || +m[1] === ENGINE_MAJOR;
}
export const SaBan = {
  version: VERSION,
  async mount(sel, opt = {}) {
    const root = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!root) throw new Error("Không thấy chỗ đặt sa bàn: " + sel);
    const base = new URL(String(opt.pack || "").replace(/\\/?$/, "/"), location.href);
    if (!document.querySelector("link[data-sa-ban]")) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = new URL("./sa-ban.css", import.meta.url).href; l.dataset.saBan = "1"; document.head.append(l);
    }
    const r = await fetch(new URL("pack.json", base)); if (!r.ok) throw new Error("Không tải được pack.json của gói " + base.href);
    const P = await r.json();
    if (!hopPhienBan(P.engine)) throw new Error(`Gói ${P.id} cần bộ máy ${P.engine}, đây là bộ máy ${VERSION}`);
    document.title = "Sa bàn " + P.title;
    root.innerHTML = khungHTML(P);
    document.body.classList.add("m-film");
    return run(root, base, P);
  },
};

function run(root, base, P) {
const U = (f) => new URL(f, base).href;                       // đường dẫn tệp trong gói
const EV = {}; const emit = (n, ...a) => (EV[n] || []).forEach((f) => { try { f(...a); } catch (e) { console.warn(e); } });
const UNITS = P.units || {}, SIDES = P.sides || [], PROPS = P.props || {}, FRAMES = P.frames || {}, PA = P.audio || {};
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const Q_ = P.quality || {};
// chất lượng: ?chatluong=thap | cao ép chế độ; mặc định điện thoại dùng mức thấp (ít lớp quân nhân bản, vẽ quân trong bán kính ngắn hơn)
const CL = new URLSearchParams(location.search).get("chatluong") || (isMobile ? "thap" : "cao");
const LOW = CL === "thap";
// khung toạ độ cục bộ (u dọc, v ngang) đặt trong pack.json › frames
const FRX = (name, u, v) => { const F = FRAMES[name]; return F ? [F.c0[0] + F.eu[0] * u + F.ev[0] * v, F.c0[1] + F.eu[1] * u + F.ev[1] * v] : [u, v]; };
// mốc thời gian dạng số thực: chỉ số cảnh + tiến độ trong cảnh (8.2 = cảnh 9, đã chạy 20%)
const inRange = (iu, r) => iu >= r.from && iu < r.to;
''')

# ── tên mốc, nhãn sông lấy từ gói
a0 = js.index('const LABEL = { NgocHoi_Don'); a1 = js.index('HoGuom: "Hồ Gươm" };', a0) + len('HoGuom: "Hồ Gươm" };')
js = js[:a0] + "const LABEL = P.labels?.anchors || {};" + js[a1:]
rep('''const BIG = new Set(["NgocHoi_Don", "KhuongThuong", "ThangLong_HoangThanh", "DamMuc", "HoLinhDam", "HoGuom"]);
const RIVERS = [["Sông Hồng", 21.005, 105.8735], ["Sông Tô Lịch", 20.985, 105.8155], ["Sông Nhuệ", 21.012, 105.77], ["Sông Kim Ngưu", 20.986, 105.864]];''',
'''const BIG = new Set(P.labels?.big || []);
const RIVERS = P.labels?.rivers || [];''')

# ── chất lượng hình theo máy
rep('renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));',
    'renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW ? Q_.mobilePixelRatio || 1.5 : Q_.maxPixelRatio || 2));')

# ── khởi tạo: tệp địa hình, vật thể, kịch bản theo gói
rep('const r = await fetch("sa_ban_data.json");', 'const r = await fetch(U(P.terrain.data));')
rep('const hm = await heightsOf("h_main.png", meta.zmin, meta.zmax);', 'const hm = await heightsOf(U(P.terrain.height), meta.zmin, meta.zmax);')
rep('for (const p of meta.patches) {\n    const ph = await heightsOf(`h_${p.name}.png`, meta.zmin, meta.zmax);',
    'for (const p of meta.patches || []) {\n    const ph = await heightsOf(U(P.terrain.patchHeight.replace("{name}", p.name)), meta.zmin, meta.zmax);')
rep('const rects = meta.patches.map((p) => p.rect);', 'const rects = (meta.patches || []).map((p) => p.rect);')
rep('const texMain = await textureOf("tex_main.jpg");', 'const texMain = await textureOf(U(P.terrain.image));')
rep('''    const tex = await textureOf(`tex_${f.name}.jpg`);
    world.add(heightMesh(f, tex, null));
    if (f.name !== "fort") world.add(waterMesh(f, null, null));''',
'''    const tex = await textureOf(U(P.terrain.patchImage.replace("{name}", f.name)));
    world.add(heightMesh(f, tex, null));
    if (!(P.terrain.patchNoWater || []).includes(f.name)) world.add(waterMesh(f, null, null));''')
rep('for (const ring of D.linhdam) {', 'for (const ring of D.linhdam || []) {')
rep('''  addInstances("nha", P.nha, I.nha, true, groups.nha);
  addInstances("dinh", P.dinh, I.dinh, false, groups.nha);
  addInstances("nhapho", P.nha, I.nhapho, true, groups.nha);
  htGroup = new THREE.Group(); groups.nha.add(htGroup);
  const zg = D.hoangthanh.zg;
  for (const k in D.hoangthanh.mats) {''', '''  for (const [key, proxy, hasVar, grp] of PROPS.instances || []) if (I[key] && PR[proxy]) addInstances(key, PR[proxy], I[key], hasVar, groups[grp] || groups.quan);
  htGroup = new THREE.Group(); groups.nha.add(htGroup);
  const zg = D.hoangthanh ? D.hoangthanh.zg : 0;
  for (const k in D.hoangthanh ? D.hoangthanh.mats : {}) {''')
rep('const P = buildProxies(), I = D.inst;', 'const PR = buildProxies(), I = D.inst || {};')
rep('''  addInstances("cay", P.cay, I.cay, true, groups.cay);
  addInstances("tre", P.tre, I.tre, false, groups.cay);
  addInstances("say", P.say, I.say, false, groups.cay);
  addInstances("leu", P.leu, I.leu, true, groups.quan);
  addInstances("gac", P.gac, I.gac, false, groups.quan);
  addInstances("usung", P.usung, I.usung, false, groups.quan);
  addInstances("chong", P.chong, I.chong, false, groups.quan);
''', '')
rep('for (const v of D.villages) {', 'for (const v of D.villages || []) {')
rep('const rs = await fetch("story.json");', 'const rs = await fetch(U(P.story || "story.json"));')
rep('''  window.NHDD = {''', '''  emit("ready");
  window.SB = window.NHDD = {''')

# ── góc nhìn có tên
a0 = js.index("const VIEWS = {\n  thanglong:"); a1 = js.index("};\n", a0) + 3
js = js[:a0] + "const VIEWS = P.views || {};\n" + js[a1:]
rep('''function viewPose(name) {
  if (name === "all") return poseFrom({ X: 0, Y: 1500, d: 30000, az: 180, el: 17 });
  const [an, dist, az, el, off] = VIEWS[name], A = anchors.get(an);
  const X = A.X + off[0], Y = A.Y + off[1], Z = heightAt(X, Y) * EX;''', '''function viewXY(v) { const A = v.target ? anchors.get(v.target) : null, off = v.off || [0, 0]; return A ? [A.X + off[0], A.Y + off[1]] : [v.X || 0, v.Y || 0]; }
function viewPose(name) {
  const v = VIEWS[name] || { X: 0, Y: 0, dist: 30000, az: 180, el: 17 };
  if (!v.target) return poseFrom({ X: v.X || 0, Y: v.Y || 0, d: v.dist, az: v.az, el: v.el });
  const dist = v.dist, az = v.az, el = v.el, [X, Y] = viewXY(v), Z = heightAt(X, Y) * EX;''')
rep('''if (name === "all") { setWalk(false); } else { const [an, , , , off] = VIEWS[name], A = anchors.get(an); if (A) walkTeleport(A.X + off[0], A.Y + off[1] - 90); return; }''',
    '''const v = VIEWS[name]; if (!v || !v.target) { setWalk(false); } else { const [X, Y] = viewXY(v); walkTeleport(X, Y - 90); return; }''')
rep('const out = { du_an: "Sa bàn Ngọc Hồi – Đống Đa 1789",', 'const out = { du_an: "Sa bàn " + P.title, goi: P.id + "@" + P.version,')

# ── núi xa, sông kéo dài: theo gói
rep('const RIV = [["Song_Hong", [true, true], new THREE.Color(0.2, 0.135, 0.075)], ["Song_Nhue", [false, true], new THREE.Color(0.075, 0.1, 0.08)]];',
    'const RIV = (P.terrain.riverExtend || []).map(([n, e, c]) => [n, e, new THREE.Color(...c)]);')
rep('''  const karst = []; for (let k = 0; k < 16; k++) karst.push([-9000 + (hash2(k, 3) - 0.5) * 18000, -40000 + (hash2(k, 7) - 0.5) * 16000, 150 + 230 * hash2(k, 11), 600 + 1000 * hash2(k, 13)]);
  const M = [
    [-48400, 11500, 22000, 350, (X, Y) => ridge(X, Y, -48400, 11500, 0.6, 9000, 6500, 1150, 2.1)],
    [-20300, 53600, 34000, 450, (X, Y) => ridge(X, Y, -20300, 53600, -0.78, 24000, 5500, 1300, 5.3)],
    [-3700, 31400, 9000, 250, (X, Y) => ridge(X, Y, -3700, 31400, 0.3, 5000, 3500, 280, 8.8)],
    [-9000, -40000, 14000, 200, (X, Y) => { let z = 0; for (const [kx, ky, pk, rad] of karst) { const r2 = ((X - kx) ** 2 + (Y - ky) ** 2) / (rad * rad); z = Math.max(z, pk * Math.exp(-r2 * 2) * (0.8 + 0.4 * vnoise(X / 300, Y / 300))); } return z; }],
  ];''', '''  const FM = P.terrain.farMountains || {}, M = [];
  for (const r of FM.ridges || []) M.push([r.c[0], r.c[1], r.half, r.step, (X, Y) => ridge(X, Y, r.c[0], r.c[1], r.ang, r.a, r.b, r.peak, r.seed)]);
  for (const K of FM.karst || []) {
    const karst = []; for (let k = 0; k < K.n; k++) karst.push([K.c[0] + (hash2(k, 3) - 0.5) * K.spread[0], K.c[1] + (hash2(k, 7) - 0.5) * K.spread[1], K.peak[0] + K.peak[1] * hash2(k, 11), K.rad[0] + K.rad[1] * hash2(k, 13)]);
    M.push([K.c[0], K.c[1], K.half, K.step, (X, Y) => { let z = 0; for (const [kx, ky, pk, rad] of karst) { const r2 = ((X - kx) ** 2 + (Y - ky) ** 2) / (rad * rad); z = Math.max(z, pk * Math.exp(-r2 * 2) * (0.8 + 0.4 * vnoise(X / 300, Y / 300))); } return z; }]);
  }''')

# ── âm thanh tổng hợp: bảng giao tranh cũ không còn dùng
rep('''const BATTLE = { hahoi: 0.35, ngochoi: 1, dammuc: 0.7, dongda: 0.9, thanglong: 0.4 };
const DRUM = { hanhquan: 0.8, kehoach: 0.5, hahoi: 0.6, ngochoi: 0.9, dongda: 0.9, thanglong: 0.7 };''', 'const BATTLE = {};')

# ── kịch bản: số cảnh, mốc so sánh mặc định
rep('$("scenes").querySelector("h3").textContent = `${S.scenes.length} cảnh · kịch bản V1`;',
    '$("scenes").querySelector("h3").textContent = `${S.scenes.length} cảnh · ${P.storyLabel || "kịch bản"}`;')
rep('''  cmpA = Math.max(0, first("kehoach")); cmpB = S.scenes.length - 1;
  for (let i = S.scenes.length - 1; i >= 0; i--) if (S.scenes[i].state === "thanglong") { cmpB = i; break; }''',
'''  const CMP = (P.ui && P.ui.compare) || [];
  cmpA = Math.max(0, first(CMP[0])); cmpB = S.scenes.length - 1;
  for (let i = S.scenes.length - 1; i >= 0; i--) if (S.scenes[i].state === CMP[1]) { cmpB = i; break; }''')
rep('''  if (!$("docs").hidden) fillDocs();
}
function goScene(''', '''  if (!$("docs").hidden) fillDocs();
  emit("scene", cur, sc);
}
function goScene(''')

# ── vai đi bộ
rep('''  const at = (n, dx, dy) => { const A = anchors.get(n); return A ? [A.X + dx, A.Y + dy] : [0, 0]; };
  return role === "thanh" ? at("NgocHoi_Don", 0, 0) : role === "dan" ? at("ThangLong_PhoCho", 0, 0) : at("NgocHoi_Don", 0, -480);''',
'''  const at = (n, dx, dy) => { const A = anchors.get(n); return A ? [A.X + dx, A.Y + dy] : [0, 0]; };
  const R = (P.roles || {})[role] || Object.values(P.roles || {})[0], s = R && R.start;
  return s ? at(s[0], s[1] || 0, s[2] || 0) : [0, 0];''')

# ══ nhân vật: tải tệp .nvz (nhị phân nén) thay cho JSON base64, tải dần theo cảnh
rep('''const nvTexC = {};
const nvTex = (f) => nvTexC[f] || (nvTexC[f] = new THREE.TextureLoader().loadAsync(f).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t; }));''',
'''const nvTexC = {};
const nvTex = (f) => nvTexC[f] || (nvTexC[f] = new THREE.TextureLoader().loadAsync(f).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t; }));
// ---- định dạng .nvz (tools/sa_ban/nv_sang_nvz.py): gzip("NVZ1" + u32 + JSON đầu + khối nhị phân)
async function nvzRead(url) {
  const r = await fetch(url); if (!r.ok) throw new Error("không tải được " + url);
  let buf = await r.arrayBuffer(); const h8 = new Uint8Array(buf, 0, 2);
  if (h8[0] === 0x1f && h8[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
  const dv = new DataView(buf);
  if (dv.getUint32(0, false) !== 0x4e565a31) throw new Error("tệp không phải NVZ1: " + url);
  const hl = dv.getUint32(4, true), H = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl)));
  const b0 = (8 + hl + 3) & ~3;
  return { H, arr: (ref, T) => new T(buf, b0 + ref[0], ref[1] / T.BYTES_PER_ELEMENT) };
}
function nvzFrames(Z, posRef, norRef, n, q) {                 // cộng dồn hiệu số giữa các khung → vị trí, pháp tuyến từng khung
  const D = Z.arr(posRef, Int16Array), DN = Z.arr(norRef, Int8Array), nv = D.length / n / 3, acc = new Int16Array(nv * 3), an = new Int8Array(nv * 2), out = [];
  for (let f = 0; f < n; f++) {
    const p = new Float32Array(nv * 3), nr = new Float32Array(nv * 3);
    for (let i = 0, o = f * nv * 3; i < nv * 3; i++) { acc[i] += D[o + i]; p[i] = acc[i] * q; }
    for (let i = 0, o = f * nv * 2; i < nv; i++) {
      an[i * 2] += DN[o + i * 2]; an[i * 2 + 1] += DN[o + i * 2 + 1];
      let x = an[i * 2] / 127, y = an[i * 2 + 1] / 127; const z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) { const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1); }
      const l = Math.hypot(x, y, z) || 1; nr[i * 3] = x / l; nr[i * 3 + 1] = y / l; nr[i * 3 + 2] = z / l;
    }
    out.push([p, nr]);
  }
  return out;
}
function nvzGeo(index, uv, col, pn) {
  const g = new THREE.BufferGeometry(); g.setIndex(index);
  if (uv) g.setAttribute("uv", uv); if (col) g.setAttribute("color", col);
  g.setAttribute("position", new THREE.BufferAttribute(pn[0], 3)); g.setAttribute("normal", new THREE.BufferAttribute(pn[1], 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 4); return g;
}
function nvzOctN(i8) { const n = i8.length / 2, o = new Float32Array(n * 3); for (let i = 0; i < n; i++) { let x = i8[i * 2] / 127, y = i8[i * 2 + 1] / 127; const z = 1 - Math.abs(x) - Math.abs(y); if (z < 0) { const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1); } const l = Math.hypot(x, y, z) || 1; o[i * 3] = x / l; o[i * 3 + 1] = y / l; o[i * 3 + 2] = z / l; } return o; }
async function nvzKind(def) {
  const Z = await nvzRead(U(def.file)), H = Z.H, q = H.q, mat4 = (a, k) => new THREE.Matrix4().set(a[k], a[k + 1], a[k + 2], a[k + 9], a[k + 3], a[k + 4], a[k + 5], a[k + 10], a[k + 6], a[k + 7], a[k + 8], a[k + 11], 0, 0, 0, 1);
  const texOf = async (t) => (t ? new THREE.MeshLambertMaterial({ map: await nvTex(U(def.texDir ? def.texDir + t : "units/" + t)) }) : new THREE.MeshLambertMaterial({ vertexColors: true }));
  if (H.type === "hum") {
    const mat = new THREE.MeshLambertMaterial({ map: await nvTex(U(def.image)) }), clips = {};
    const index = new THREE.BufferAttribute(H.idx32 ? Z.arr(H.idx, Uint32Array) : Z.arr(H.idx, Uint16Array), 1), uv = new THREE.BufferAttribute(Z.arr(H.uv, Float32Array), 2);
    for (const [name, c] of Object.entries(H.clips))
      clips[name] = { fps: c.fps, once: !!c.once, mat, frames: nvzFrames(Z, c.pos, c.nor, c.n, q).map((pn) => nvzGeo(index, uv, null, pn)),
        mg: Z.arr(c.mg, Float32Array), mt: c.mt ? Z.arr(c.mt, Float32Array) : null };
    return { hum: true, clips };
  }
  const parts = await Promise.all(H.parts.map(async (p) => ({ ...p, mat: await texOf(p.tex), index: new THREE.BufferAttribute(Z.arr(p.idx, Uint16Array), 1),
    uv: p.uv ? new THREE.BufferAttribute(Z.arr(p.uv, Float32Array), 2) : null, col: p.col ? new THREE.BufferAttribute(Z.arr(p.col, Float32Array), 3) : null })));
  const anim = parts.filter((p) => !p.rigid), rigid = [];
  for (const p of parts) if (p.rigid) {
    const qi = Z.arr(p.pos, Int16Array), pos = new Float32Array(qi.length); for (let i = 0; i < qi.length; i++) pos[i] = qi[i] * q;
    const g = new THREE.BufferGeometry(); g.setIndex(p.index); if (p.uv) g.setAttribute("uv", p.uv); if (p.col) g.setAttribute("color", p.col);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    if (p.nor) g.setAttribute("normal", new THREE.BufferAttribute(nvzOctN(Z.arr(p.nor, Int8Array)), 3)); else g.computeVertexNormals();
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 4); p.geo = g; rigid.push(p);
  }
  const clips = {};
  for (const [name, c] of Object.entries(H.clips)) {
    const per = c.parts.map((cp, pi) => nvzFrames(Z, cp.pos, cp.nor, c.n, q).map((pn) => nvzGeo(anim[pi].index, anim[pi].uv, anim[pi].col, pn)));
    const frames = []; for (let f = 0; f < c.n; f++) frames.push(per.map((a) => a[f]));
    const C = { fps: c.fps, mats: anim.map((p) => p.mat), frames };
    if (c.m) { const m = Z.arr(c.m, Float32Array); C.m = []; for (let f = 0; f < c.n; f++) C.m.push(mat4(m, f * 12)); }
    clips[name] = C;
  }
  return H.type === "ani" ? { ani: true, clips, rigid } : { flip: true, clips };
}
const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const glbOf = (f) => gltfLoader.loadAsync(U(f));''')

# cờ theo phe: vũ khí 5 + chỉ số phe (pack.json › sides[].flag)
rep('''NV_VK[5] = { geo: CO_CAN, flag: coGeo(), fmat: coMat("co_tayson.jpg"), tip: 2.5 };
NV_VK[6] = { geo: CO_CAN, flag: coGeo(), fmat: coMat("co_thanh.jpg"), tip: 2.5 };''',
'''SIDES.forEach((s, k) => { if (s.flag) NV_VK[5 + k] = { geo: CO_CAN, flag: coGeo(), fmat: coMat(U(s.flag)), tip: 2.5 }; });
const sideOf = (kind) => (UNITS[kind] && UNITS[kind].side) || 0;
const flagW = (side) => (NV_VK[5 + side] ? 5 + side : 5);''')

# cầu phao: theo pack.json › props.pontoonBridge
rep('''function nvCau() {
  // vắt ngang sông Hồng (lòng sông rộng ~680 m) qua mốc Cầu phao, vuông góc dòng chảy; khớp với tuyến P_CAU trong build_quan10.py
  const A = [2420, 6947], B = [3092, 7205], L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L, s0 = 0, s1 = L;
  const top = meta.water + 0.75, n = Math.ceil((s1 - s0) / 5.5), yaw = Math.atan2(dx, -dy);''',
'''function nvCau() {
  const CB = PROPS.pontoonBridge; if (!CB) return;
  const A = CB.a, B = CB.b, L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L, s0 = 0, s1 = L;
  const top = meta.water + 0.75, n = Math.ceil((s1 - s0) / (CB.step || 5.5)), yaw = Math.atan2(dx, -dy);''')
rep('''  if (window.NHDD) { NHDD.nvb''', '''  if (window.NHDD) { const NHDD = window.NHDD; NHDD.nvb''')
rep('const sA = Math.hypot(2420 - 2184, 6947 - 6910), inst = [];', 'const O = CB.origin || A, sA = Math.hypot(A[0] - O[0], A[1] - O[1]), inst = [];')

# trại ngoài khung: pack.json › props.outerCamps
rep('''function nvTraiHaHoi() {
  const C = [3900, -13960]; let r0 = 4242;
  const rnd = () => ((r0 = (r0 * 16807) % 2147483647) / 2147483647);
  const leu = []; while (leu.length < 46) { const r = 14 + 62 * Math.sqrt(rnd()), a = rnd() * 6.283;''',
'''function nvTraiHaHoi() { for (const T of PROPS.outerCamps || []) nvTrai(T); }
function nvTrai(TR) {
  const C = TR.c; let r0 = TR.seed || 4242;
  const rnd = () => ((r0 = (r0 * 16807) % 2147483647) / 2147483647);
  const leu = []; while (leu.length < (TR.tents || 46)) { const r = TR.r[0] + (TR.r[1] - TR.r[0]) * Math.sqrt(rnd()), a = rnd() * 6.283;''')
rep('''  const posts = []; for (let a = 0; a < 6.283; a += 3 / 92) if (Math.abs(a - 4.712) > 0.09) posts.push(a);''',
    '''  const FR = TR.fence || 92, posts = []; for (let a = 0; a < 6.283; a += 3 / FR) if (TR.gate === undefined || Math.abs(a - TR.gate) > 0.09) posts.push(a);''')
rep('''posts.forEach((a, k) => { const x = C[0] + 92 * Math.cos(a), y = C[1] + 92 * Math.sin(a);''',
    '''posts.forEach((a, k) => { const x = C[0] + FR * Math.cos(a), y = C[1] + FR * Math.sin(a);''')

# cờ doanh trại: pack.json › props.campFlags
rep('''function nvCoTrai() {
  const L = D.inst.leu, kt = [];
  for (let k = 0, n = 0; k < L.length; k += 6) if (Math.hypot(L[k] + 1094, L[k + 1] - 4236) < 800 && (n++ % 45 === 0)) kt.push([L[k] + 3, L[k + 1] + 3]);
  const hh = []; for (let a = 0.3; a < 6.28; a += 6.283 / 8) hh.push([3900 + 94 * Math.cos(a), -13960 + 94 * Math.sin(a)]); hh.push([3900, -13960]);
  const nh = [[-186, -60], [-186, 0], [-186, 60], [-172, -122], [-172, 122], [172, -122], [172, 122], [0, 0], [60, -60], [60, 60]].map(([u, v]) => fxF(u, v));
  const tl = [[2184, 6930], [2200, 6890], [2160, 6905], [2410, 6950]];
  NV.coTrai = [["nh", 0, 9.9, nh], ["hh", 0, 6, hh], ["kt", 1, 11, kt], ["tl", 1, 12, tl]].map(([id, a, b, P]) => {
    const pole = new THREE.InstancedMesh(CO_CAN, NV_VKMAT, P.length), fl = new THREE.InstancedMesh(NV_VK[6].flag, NV_VK[6].fmat, P.length);''',
'''function nvDiem(at) {                                         // danh sách điểm [x, y] theo mô tả trong gói
  if (Array.isArray(at)) return at;
  const out = [];
  if (at.frame) for (const [u, v] of at.uv) out.push(FRX(at.frame, u, v));
  else if (at.ring) { for (let a = at.a0 || 0; a < 6.28; a += 6.283 / at.n) out.push([at.ring[0] + at.r * Math.cos(a), at.ring[1] + at.r * Math.sin(a)]); if (at.center) out.push([...at.ring]); }
  else if (at.near) { const L = (D.inst || {})[at.inst || "leu"] || [], st = at.stride || 6, o = at.offset || 0;
    for (let k = 0, n = 0; k < L.length; k += st) if (Math.hypot(L[k] - at.near[0], L[k + 1] - at.near[1]) < at.r && (n++ % (at.every || 1) === 0)) out.push([L[k] + o, L[k + 1] + o]); }
  return out;
}
function nvCoTrai() {
  NV.coTrai = (PROPS.campFlags || []).map((cf) => {
    const P = nvDiem(cf.at), W_ = NV_VK[flagW(cf.side || 0)];
    const pole = new THREE.InstancedMesh(CO_CAN, NV_VKMAT, P.length), fl = new THREE.InstancedMesh(W_.flag, W_.fmat, P.length);''')
rep('''    return { a, b, ms: [pole, fl] };''', '''    return { a: cf.from, b: cf.to, ms: [pole, fl] };''')

# tên nhân vật: màu nhãn theo phe, không dò theo tên riêng
rep('''if (el._t !== ten) { el._t = ten; el.firstChild.textContent = ten; el.className = vua ? "vua" : /Tôn Sĩ Nghị|Sầm Nghi Đống/.test(ten) ? "th" : ""; }''',
    '''if (el._t !== ten) { el._t = ten; el.firstChild.textContent = ten; el.className = vua ? "vua" : phe ? "th" : ""; }''')
rep('for (const [ten, X, y, Y, vua] of L) {', 'for (const [ten, X, y, Y, vua, phe] of L) {')

# đặt pháo lên lũy, dấu X
rep('function nvNangPhao() {\n  const U = D.inst.usung; if (!U) return; const bp = [];', 'function nvNangPhao() {\n  const U = (D.inst || {}).usung; if (!U || !PROPS.raiseCannons) return; const bp = [];')
rep('''function nvDauX() {
  const C = [3900, -13960], m = new THREE.MeshBasicMaterial({ color: 0xc0241a, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
  const g = new THREE.Group();
  for (const a of [Math.PI / 4, -Math.PI / 4]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(250, 34).rotateX(-Math.PI / 2), m); b.rotation.y = a; b.renderOrder = 5; g.add(b); }
  g.position.set(C[0], (heightAt(C[0], C[1]) + 4) * EX, -C[1]); g.visible = false; scene.add(g); NV.dauX = g;
}''', '''function nvDauX() {
  const m = new THREE.MeshBasicMaterial({ color: 0xc0241a, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
  NV.dauX = (PROPS.crossMarks || []).map((X_) => {
    const C = X_.c, sz = X_.size || [250, 34], g = new THREE.Group();
    for (const a of [Math.PI / 4, -Math.PI / 4]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(sz[0], sz[1]).rotateX(-Math.PI / 2), m); b.rotation.y = a; b.renderOrder = 5; g.add(b); }
    g.position.set(C[0], (heightAt(C[0], C[1]) + 4) * EX, -C[1]); g.visible = false; scene.add(g); return { g, from: X_.from, to: X_.to ?? 1e9 };
  });
}''')

# tải nhân vật: bố trí quân trước, rồi tải dần từng loại theo thứ tự cảnh xuất hiện
a0 = js.index("async function nvLoad() {"); a1 = js.index("const NV_MAU = {")
js = js[:a0] + '''async function nvLoad() {
  const r = await fetch(U(P.placement || "placement.json")); if (!r.ok) throw new Error("không tải được placement.json");
  const Q = await r.json();
  try { nvNangPhao(); } catch (e) { console.warn("đại bác", e); }
  try { nvDauX(); } catch (e) { console.warn("dấu X", e); }
  NV.catcau = Q.catcau || null;
  const firstSc = {};
  for (const g of Q.groups) {
    g.meshes = new Map(); g.n = g.m.length; g.cap = g.n * ((UNITS[g.kind] || {}).dense && g.dense !== 0 ? 3 : 1);
    if (g.mode === "path") { g.cum = [0]; for (let k = 1; k < g.path.length; k++) g.cum.push(g.cum[k - 1] + Math.hypot(g.path[k][0] - g.path[k - 1][0], g.path[k][1] - g.path[k - 1][1])); }
    NV.groups.push(g);
    const ks = Object.keys(g.sc || {}).map(Number); if (ks.length) firstSc[g.kind] = Math.min(firstSc[g.kind] ?? 99, ...ks);
    if (g.linh && UNITS[g.kind] && UNITS[g.kind].rider) firstSc[UNITS[g.kind].rider.kind] = Math.min(firstSc[UNITS[g.kind].rider.kind] ?? 99, ...ks);
  }
  NV.heroes = [];
  try { nvCau(); } catch (e) { console.warn("cầu phao", e); }
  try { nvTraiHaHoi(); } catch (e) { console.warn("trại", e); }
  try { nvCoTrai(); } catch (e) { console.warn("cờ doanh trại", e); }
  fxInit();
  // hàng đợi: loại quân xuất hiện sớm tải trước; nhân vật chính (glTF) tải khi tới lượt cảnh đầu tiên của họ
  const jobs = Object.keys(UNITS).filter((k) => firstSc[k] !== undefined).map((k) => [firstSc[k], "u", k]);
  for (const h of P.heroes || []) { const pos = Q[h.placement] || {}, ks = Object.keys(pos).map(Number); jobs.push([ks.length ? Math.min(...ks) : 99, "h", h, pos]); }
  jobs.sort((a, b) => a[0] - b[0]);
  NV.need = new Set(jobs.filter((j) => j[0] <= 1).map((j) => (j[1] === "u" ? j[2] : "hero:" + j[2].id)));
  NV.loadedN = 0; NV.totalN = jobs.length;
  const one = async (j) => {
    try {
      if (j[1] === "u") { const def = UNITS[j[2]]; const K = def.type === "moc-ghep" ? nvMocGhep(await glbOf(def.glb)) : await nvzKind(def); K.side = def.side || 0; NV.kinds[j[2]] = K; NV.need.delete(j[2]); }
      else {
        const h = j[2], g = await glbOf(h.model), obj = g.scene; obj.visible = false; obj.traverse((o) => { if (o.isMesh) o.frustumCulled = false; }); scene.add(obj);
        const mixer = new THREE.AnimationMixer(obj); if (g.animations[0]) mixer.clipAction(g.animations[0]).play();
        NV.heroes.push({ def: h, obj, mixer, pos: j[3] }); NV.need.delete("hero:" + h.id);
      }
    } catch (e) { console.warn("nhân vật", j[2], e); NV.need.delete(j[1] === "u" ? j[2] : "hero:" + j[2].id); }
    NV.loadedN++; if (!NV.need.size) NV.ok = true;
  };
  if (!NV.need.size) NV.ok = true;
  for (let k = 0; k < jobs.length; k += 2) await Promise.all(jobs.slice(k, k + 2).map(one));     // hai tệp một lượt: điện thoại không nghẽn
  NV.ok = true;
}
''' + js[a1:]

rep('''const NV_MAU = { ts: [[1, 1, 1], [0.74, 0.62, 0.54], [0.84, 0.58, 0.52], [0.92, 0.82, 0.74]].map((c) => new THREE.Color(...c)),
  th: [[1, 1, 1], [0.86, 0.86, 0.9], [0.76, 0.75, 0.72], [0.95, 0.92, 0.85]].map((c) => new THREE.Color(...c)) };''',
'''const NV_MAU = {}; for (const [k, d] of Object.entries(UNITS)) if (d.tint) NV_MAU[k] = d.tint.map((c) => new THREE.Color(...c));''')
rep('''const NV_ALIAS = { ts: { nghi: "dung", khom: "buoc", di: "chay", vapnga: "nga", vap: "nga", tuan: "chay", kiem: "danh", bodao: "danh" },
  th: { nghi: "dung", khom: "chay", buoc: "di", khieng: "chay", vapnga: "vap", kiem: "danh", bodao: "danh" },
  tsn: { nghi: "dung", tuan: "di", vap: "chay", vapnga: "chay" } };''',
'''const NV_ALIAS = {}; for (const [k, d] of Object.entries(UNITS)) if (d.alias) NV_ALIAS[k] = d.alias;''')
rep('if (g.co && k % g.co === (g.co >> 1)) w = g.kind === "th" ? 6 : 5;   // người cầm cờ',
    'if (g.co && k % g.co === (g.co >> 1)) w = flagW(sideOf(g.kind));   // người cầm cờ: cờ đúng phe của mình')
rep('if (n === "nga" && g.kind === "th" && k % 2) n = "nga2";', 'if (n === "nga" && K.clips.nga2 && k % 2) n = "nga2";')

# nvApply: khung đồn, xa gần, tên, voi có lính, mộc, nhân vật chính
rep('const dist = camera.position.distanceTo(_np.set(cx, heightAt(cx, cy) * EX, -cy));\n    if (dist > 6000) continue;',
    'const dist = camera.position.distanceTo(_np.set(cx, heightAt(cx, cy) * EX, -cy));\n    if (dist > (LOW ? Q_.mobileUnitDrawDist || 3500 : Q_.unitDrawDist || 6000)) continue;')
rep('reps = dense && dist > 600 && !stt.moving ? 3 : 1,', 'reps = dense && !LOW && dist > 600 && !stt.moving ? 3 : 1,')
rep('''const tg = fxF(-150 + ph * 290, (va / 3 - 0.5) * 200 + Math.sin(ph * 77) * 45), P0 = g.toaP[k];''',
    '''const SP = (P.groupFrames || {}).spread || { frame: "", u: [-150, 140], v: 100, jitter: 45 };
        const tg = FRX(SP.frame, SP.u[0] + ph * (SP.u[1] - SP.u[0]), (va / 3 - 0.5) * 2 * SP.v + Math.sin(ph * 77) * SP.jitter), P0 = g.toaP[k];''')
rep('''let top = 0; for (let d = 0; d <= 9; d += 0.5) top = Math.max(top, heightAt(mm[0] - FX_EU[0] * d, mm[1] - FX_EU[1] * d));''',
    '''const EU = (FRAMES[(P.groupFrames || {}).raise] || { eu: [0, 1] }).eu; let top = 0; for (let d = 0; d <= 9; d += 0.5) top = Math.max(top, heightAt(mm[0] - EU[0] * d, mm[1] - EU[1] * d));''')
rep('if (g.ten && g.ten[k] && dist < 2500) NV.tenPos.push([g.ten[k], X, gy + (K.ani ? 3.4 : K.flip ? 5.2 : 2.2), Y]);',
    'if (g.ten && g.ten[k] && dist < 2500) NV.tenPos.push([g.ten[k], X, gy + (K.ani ? 3.4 : K.flip ? 5.2 : 2.2), Y, 0, K.side]);')
rep('const G = nvGripNgua(K), w = 5, fm = _nm2.clone().multiply(G);', 'const G = nvGripNgua(K), w = flagW(K.side), fm = _nm2.clone().multiply(G);')
rep('const a = nvMesh(g, "w5", NV_VK[w].geo, NV_VKMAT), b = nvMesh(g, "f5", NV_VK[w].flag, NV_VK[w].fmat);',
    'const a = nvMesh(g, "w" + w, NV_VK[w].geo, NV_VKMAT), b = nvMesh(g, "f" + w, NV_VK[w].flag, NV_VK[w].fmat);')
rep('''        if (g.linh && dist < 900) {                               // một lính súng hỏa hồ đứng trên bành voi (cùng nài voi ngồi cổ)
          const KT = NV.kinds.ts, cn = i === 8 && u > 0.08 && u < 0.62 ? "ngam" : "dung", CC = KT.clips[cn], f2 = nvFrame(CC, time, ph, 1, 0);
          _nt.set(0, 2.62, -0.15);''', '''        const RD = UNITS[g.kind] && UNITS[g.kind].rider, KT = RD && NV.kinds[RD.kind];
        if (g.linh && KT && dist < 900) {                         // một lính súng hỏa hồ đứng trên bành voi (cùng nài voi ngồi cổ)
          const cn = RD.aim && i + u > RD.aim[0] && i + u < RD.aim[1] ? "ngam" : "dung", CC = KT.clips[cn], f2 = nvFrame(CC, time, ph, 1, 0);
          _nt.set(...(RD.at || [0, 2.62, -0.15]));''')
rep('else if (i === 8 || i === 9) NV.mocPts.push(X, gy, Y, yaw);', 'else NV.mocPts.push(X, gy, Y, yaw);')
a0 = js.index("  // Quang Trung: đứng trên bành voi chỉ huy, hoặc đứng đất"); a1 = js.index("  nvTenVe();\n}", a0)
js = js[:a0] + '''  // nhân vật chính (pack.json › heroes): đứng trên bành voi / lưng ngựa theo nhóm quân, hoặc đứng đất tại toạ độ
  for (const H of NV.heroes || []) {
    const q = H.pos[i]; let qx, qy, qz, qyaw;
    if (q && q.g && NV.anchor[q.g] && NV.groups.find((g) => g.id === q.g && g.sc[i])) {
      const A = NV.anchor[q.g], c = Math.cos(A.yaw), s = Math.sin(A.yaw);
      qx = A.X + q.off[0] * c - q.off[1] * s; qy = A.Y + q.off[0] * s + q.off[1] * c; qz = A.y + q.off[2]; qyaw = A.yaw;
    } else if (q && !q.g) { qx = q[0]; qy = q[1]; qz = nvGround(q[0], q[1]); qyaw = q.length > 2 ? q[2] : Math.PI; }
    const on = vis && qx !== undefined, me = PT && PT.gid === H.def.id;
    if (on && me) NV.povAt = { X: qx, Y: qy, yaw: qyaw, y: qz };
    H.obj.visible = !!(on && !me && camera.position.distanceTo(_np.set(qx, qz, -qy)) < 3000);
    if (H.obj.visible) { H.obj.position.set(qx, qz, -qy); H.obj.rotation.y = qyaw; NV.tenPos.push([H.def.name, qx, qz + 2.1, qy, H.def.king ? 1 : 0, H.def.side || 0]); }
  }
''' + js[a1:]

# nvTick
rep('if (NV.dauX) NV.dauX.visible = appMode !== "compare" && ((i === 6 && u > 0.8) || i > 6);',
    'if (NV.dauX) for (const X_ of NV.dauX) X_.g.visible = appMode !== "compare" && i + u >= X_.from && i + u < X_.to;')
rep('if (NV.mixer) NV.mixer.update(dt);', 'for (const H of NV.heroes || []) H.mixer.update(dt);')
rep('const NV_MUITEN_CAO = 200;', 'const NV_MUITEN_CAO = (P.ui && P.ui.arrowHeight) ?? 200;')

# góc nhìn nhân vật
a0 = js.index("const POV_DD = ["); a1 = js.index("function povSet(on) {")
js = js[:a0] + "const POV_DD = (P.pov && P.pov.places) || [];\nconst POV_VAI = (P.pov && P.pov.people) || [];\n" + js[a1:]
rep('''    if (gid === "qt") { if (NV.qtPos[i]) { pick = { gid, k, h, fw }; break; } continue; }''',
    '''    const HH = (NV.heroes || []).find((x) => x.def.id === gid); if (HH) { if (HH.pos[i]) { pick = { gid, k, h, fw }; break; } continue; }''')
rep('for (const [gid, k, h, fw] of POV_VAI[POV.vai][1]) {', 'for (const [gid, k, h, fw] of (POV_VAI[POV.vai] || [0, []])[1]) {')

# hiệu ứng theo gói: pháo khai hoả, lửa trên tấm mộc, trại cháy
a0 = js.index("// toạ độ khung đồn Ngọc Hồi (khớp build_quan9.py)"); a1 = js.index("  // cập nhật hạt", a0)
js = js[:a0] + '''const FXD = P.fx || {};
function fxSpots(F) {                                            // chọn các đám cháy trong vùng lều trại (pack.json › fx.campFire)
  const L = (D.inst || {})[F.inst || "leu"] || [], out = [], st = 6;
  for (let k = 0; k < L.length; k += st) {
    if (F.frame) { const C0 = FRAMES[F.frame], dx = L[k] - C0.c0[0], dy = L[k + 1] - C0.c0[1], uu = dx * C0.eu[0] + dy * C0.eu[1], vv = dx * C0.ev[0] + dy * C0.ev[1];
      if (uu > F.u[0] && uu < F.u[1] && vv > F.v[0] && vv < F.v[1]) out.push([L[k], L[k + 1]]); }
    else if (F.near && Math.hypot(L[k] - F.near[0], L[k + 1] - F.near[1]) < F.r) out.push([L[k], L[k + 1]]);
  }
  const pick = []; let r = F.seed || 1789;
  for (let k = 0; k < Math.min(F.n || 16, out.length); k++) { r = (r * 1103515245 + 12345) & 0x7fffffff; pick.push(out[r % out.length]); }
  return pick;
}
function fxTick(i, u, dt) {
  if (!FX.pools.flash) return;
  const iu = i + u, key = appMode + ":" + i; if (key !== FX.key) { FX.key = key; fxClear(); }
  for (const C of FXD.cannons || []) if (inRange(iu, C)) {           // đại bác khai hoả
    C._t = (C._t ?? 2) - dt;
    if (C._t < 0) {
      C._t = C.every[0] + Math.random() * (C.every[1] - C.every[0]);
      const U_ = (D.inst || {})[C.source || "usung"]; if (!U_ || !U_.length) continue;
      const n = U_.length / 5, k = Math.floor(Math.random() * n) * 5;
      fxBoom(U_[k], U_[k + 1], false);
      const tgt = FRX(C.frame, C.u[0] + Math.random() * (C.u[1] - C.u[0]), C.v[0] + Math.random() * (C.v[1] - C.v[0]));
      setTimeout(() => fxBoom(tgt[0], tgt[1], true), 500 + Math.random() * 500);
      const d = camera.position.distanceTo(_np.set(U_[k], nvGround(U_[k], U_[k + 1]), -U_[k + 1]));
      if (C.sound && d < 1500) amShot(C.sound, 0.5 * Math.max(0.15, 1 - d / 1500));
    }
  }
  if ((FXD.shieldFire || []).some((r) => inRange(iu, r))) {      // đạn bắn trúng tấm mộc đang tiến: chớp lửa, vệt cháy, khói
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
  for (const F of FXD.campFire || []) {                          // doanh trại cháy
    if (!inRange(iu, F)) continue;
    const spots = F._s || (F._s = fxSpots(F)); if (!spots.length) continue;
    F._e = (F._e || 0) + dt;
    while (F._e > 0.05) {
      F._e -= 0.05;
      for (const [X, Y] of spots) {
        const y = nvGround(X, Y);
        if (camera.position.distanceTo(_np.set(X, y, -Y)) > 5000) continue;
        for (let r = 0; r < 2; r++) fxAdd("lua", X + (Math.random() - 0.5) * 5, y + 0.8, -Y + (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 0.6, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 0.6, 0.8 + Math.random() * 0.6, 1, 0.42 + Math.random() * 0.3, 0.1, 0.85);
        if (Math.random() < 0.12) fxAdd("khoiCot", X + (Math.random() - 0.5) * 3, y + 6, -Y + (Math.random() - 0.5) * 3, 0.6 + Math.random() * 0.8, 4 + Math.random() * 2, (Math.random() - 0.5) * 0.8, 12 + Math.random() * 6, 0.2, 0.18, 0.17, 0.5);
      }
    }
  }
''' + js[a1:]

# đi bộ: vai theo gói
rep('const NV_DI = { tayson: { kind: "ts", dung: "dung", di: "chay", chay: "chay", sp: 0.6, w: 2 }, thanh: { kind: "th", dung: "dung", di: "tuan", chay: "chay", sp: 1, w: 2 } };',
    'const NV_DI = {}; for (const [k, r] of Object.entries(P.roles || {})) NV_DI[k] = { kind: r.kind, dung: r.idle || "dung", di: r.walk || "di", chay: r.run || "chay", sp: r.walkSpeed || 1, w: r.weapon || 2 };')
rep('const R = NV_DI[role] || NV_DI.tayson;', 'const R = NV_DI[role] || Object.values(NV_DI)[0];')

# âm thanh nền theo cảnh: bảng trong gói
a0 = js.index("const AM_BED = ["); a1 = js.index("// V10.6: nạp lười")
js = js[:a0] + '''const AM_BED = PA.beds || [];
const AM_LOP = PA.layers || {};
const AM_ONE = PA.oneShots || [];
function amPlan(i, u) {                                          // mức âm nền theo cảnh i và tiến độ u: ghép các đoạn [u0, u1, {nền: mức}]
  const out = {}, M = PA.march || {};
  for (const [u0, u1, lv] of (PA.plan || [])[i] || []) {
    if (!(u >= u0 && (u < u1 || u1 >= 1))) continue;
    for (const [n, v] of Object.entries(lv)) { if (n === "HQ") for (const [m, w] of Object.entries(M)) out[m] = w * v; else out[n] = v; }
  }
  return out;
}
const AM_MOC = PA.cues || [];
const AM_LAP = PA.repeats || [];
''' + js[a1:]
rep('const r = await fetch("am/" + n + ".mp3"); const ab = await r.arrayBuffer();', 'const r = await fetch(U((PA.dir || "audio/") + n + ".mp3")); const ab = await r.arrayBuffer();')
rep('const r = await fetch("voice_ngochoi.mp3"); if (!r.ok) { VC.err = true; return; }', 'if (!PA.voice) { VC.err = true; return; }\n    const r = await fetch(U(PA.voice)); if (!r.ok) { VC.err = true; return; }')
rep('const buoc = () => [["Địa hình, kịch bản", !!S], ["Nhân vật, voi, ngựa", typeof NV !== "undefined" && NV.ok], ["Lời dẫn thu âm", VC.ok || !!VC.err]];',
    'const buoc = () => [["Địa hình, kịch bản", !!S], [(P.ui && P.ui.unitsLoading) || "Nhân vật", typeof NV !== "undefined" && NV.ok], ["Lời dẫn thu âm", VC.ok || !!VC.err]];')

# ── cuối: chạy và trả API
rep('''init().catch((e) => { $("err").textContent = "Không dựng được sa bàn: " + e.message + ". Hãy tải lại trang; nếu vẫn lỗi, trình duyệt có thể chưa hỗ trợ WebGL."; console.error(e); });''',
'''const ready = init().catch((e) => { $("err").textContent = "Không dựng được sa bàn: " + e.message + ". Hãy tải lại trang; nếu vẫn lỗi, trình duyệt có thể chưa hỗ trợ WebGL."; console.error(e); throw e; });
const API = {
  pack: P, ready,
  play: () => setPlaying(true), pause: () => setPlaying(false),
  seek: (t) => { if (!S) return; let i = 0; while (i < starts.length - 1 && t >= starts[i + 1]) i++; goScene(i, Math.max(0, t - starts[i])); },
  goto: (i, t = 0) => goScene(i, t),
  view: (name) => goView(name),
  mode: (m) => setAppMode(m),
  layer: (id, on) => { const el = $("ly-" + id); if (el) { el.checked = on; el.dispatchEvent(new Event("change")); } },
  quality: (q) => { if (q && q.pixelRatio) { renderer.setPixelRatio(q.pixelRatio); resize(); } },
  on: (n, f) => { (EV[n] = EV[n] || []).push(f); return API; },
  stats: () => ({ fps: +($("fps").textContent || "0").replace(/\\D/g, "") || 0, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    units: NV.ok, unitsLoaded: NV.loadedN, unitsTotal: NV.totalN, scene: cur, time: S ? starts[cur] + st : 0 }),
};
return ready.then(() => API);
} // run()''')

# lúc chưa chạy init, `S` dùng trong các hàm hoãn: giữ nguyên. Ghi tệp.
out = ROOT / "engine" / "1.0.0" / "sa-ban.js"
out.write_text(js.strip() + "\n", encoding="utf-8")
print("Đã ghi", out, len(js), "ký tự")
