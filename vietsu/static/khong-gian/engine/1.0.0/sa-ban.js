// Bộ máy sa bàn Việt Sử 1.0.0 — docs/KHUNG_SA_BAN.md. Tách từ sa bàn Ngọc Hồi – Đống Đa V10 (tools/sa_ban/tach_bo_may.py).
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
  const m = /^\^?(\d+)/.exec(String(rang || "^1")); return !m || +m[1] === ENGINE_MAJOR;
}
export const SaBan = {
  version: VERSION,
  async mount(sel, opt = {}) {
    const root = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (!root) throw new Error("Không thấy chỗ đặt sa bàn: " + sel);
    const base = new URL(String(opt.pack || "").replace(/\/?$/, "/"), location.href);
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

const $ = (id) => document.getElementById(id);
const setStep = (t, f) => { $("ld-step").textContent = t; if (f !== undefined) $("fill").style.width = Math.round(f * 100) + "%"; };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LABEL = P.labels?.anchors || {};
const BIG = new Set(P.labels?.big || []);
const RIVERS = P.labels?.rivers || [];
const CAT = { vitri: "Sửa vị trí", bosung: "Bổ sung", suseu: "Sử liệu", hoi: "Câu hỏi" };

let D, meta, EX = 1, htGroup = null, mmImg = null;
const fields = [];
let mainField;


// ------------------------------------------------------------------ tải
async function bitmapOf(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Không tải được " + url);
  const b = await r.blob();
  return createImageBitmap(b, { premultiplyAlpha: "none", colorSpaceConversion: "none" });
}
async function heightsOf(url, zmin, zmax) {
  const bmp = await bitmapOf(url);
  const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d", { willReadFrequently: true }); ctx.drawImage(bmp, 0, 0);
  const px = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
  const w = bmp.width, h = bmp.height, out = new Float32Array(w * h), aux = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    const row = (h - 1 - j) * w;
    for (let i = 0; i < w; i++) {
      const k = (row + i) * 4, q = px[k] * 256 + px[k + 1];
      out[j * w + i] = zmin + (q / 65535) * (zmax - zmin);
      aux[j * w + i] = px[k + 2] / 255;
    }
  }
  return { w, h, z: out, aux };
}
async function textureOf(url) {
  const r = await fetch(url); const b = await r.blob();
  const tex = await new THREE.TextureLoader().loadAsync(URL.createObjectURL(b));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function sampleField(f, X, Y) {
  const fx = Math.min(Math.max((X - f.x0) / f.cell, 0), f.nx - 1.001), fy = Math.min(Math.max((Y - f.y0) / f.cell, 0), f.ny - 1.001);
  const i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j, n = f.nx, z = f.h;
  const a = z[j * n + i], b = z[j * n + i + 1], c = z[(j + 1) * n + i], d = z[(j + 1) * n + i + 1];
  return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty;
}
function heightAt(X, Y) {
  for (const f of fields) {
    if (f.rect && X >= f.rect[0] && X <= f.rect[1] && Y >= f.rect[2] && Y <= f.rect[3]) return sampleField(f, X, Y);
  }
  if (outerZ && !inBounds(X, Y)) return outerZ(X, Y);
  return sampleField(mainField, X, Y);
}
let outerZ = null;
const inBounds = (X, Y) => X >= mainField.x0 && Y >= mainField.y0 && X <= mainField.x0 + (mainField.nx - 1) * mainField.cell && Y <= mainField.y0 + (mainField.ny - 1) * mainField.cell;
const toLL = (X, Y) => ({ lat: meta.lat0 + Y / meta.ky, lon: meta.lon0 + X / meta.kx });
const T = (X, Y, Z) => new THREE.Vector3(X, Z * EX, -Y);

// ------------------------------------------------------------------ cảnh
const stage = $("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, LOW ? Q_.mobilePixelRatio || 1.5 : Q_.maxPixelRatio || 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc9cbc0);
scene.fog = new THREE.Fog(0xc9cbc0, 22000, 90000);
const camera = new THREE.PerspectiveCamera(45, 1, 2, 400000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.1; controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 25; controls.maxDistance = 70000;
controls.autoRotateSpeed = 0.6; controls.zoomToCursor = true;
const hemi = new THREE.HemisphereLight(0xd6dde2, 0x5d4e36, 1.35); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8cc, 1.9); sun.position.set(6000, 5200, 6000); scene.add(sun);

const world = new THREE.Group(); scene.add(world);         // địa hình, nước, đường, lũy: scale.y = EX
const props = new THREE.Group(); scene.add(props);         // nhà, cây, lều: đặt theo EX, không kéo giãn
const markers = new THREE.Group(); scene.add(markers);
const groups = { nha: new THREE.Group(), cay: new THREE.Group(), quan: new THREE.Group() };
Object.values(groups).forEach((g) => props.add(g));

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

function heightMesh(f, tex, skipRects) {
  const { nx, ny, x0, y0, cell, h } = f;
  const pos = new Float32Array(nx * ny * 3), uv = new Float32Array(nx * ny * 2);
  const W = (nx - 1) * cell, Hh = (ny - 1) * cell;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, X = x0 + i * cell, Y = y0 + j * cell;
    pos[k * 3] = X; pos[k * 3 + 1] = h[k]; pos[k * 3 + 2] = -Y;
    uv[k * 2] = (X - x0) / W; uv[k * 2 + 1] = (Y - y0) / Hh;
  }
  const idx = [];
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    if (skipRects) {
      const cx0 = x0 + i * cell, cy0 = y0 + j * cell; let skip = false;
      for (const r of skipRects) if (cx0 >= r[0] - 1e-3 && cx0 + cell <= r[1] + 1e-3 && cy0 >= r[2] - 1e-3 && cy0 + cell <= r[3] + 1e-3) { skip = true; break; }
      if (skip) continue;
    }
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
  g.computeVertexNormals();
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex }));
  return m;
}
function waterMesh(f, skipRects, redAux) {
  const { nx, ny, x0, y0, cell, h } = f, W = meta.water, lim = W + 0.25;
  const pos = [], col = [], idx = [], vmap = new Map();
  const cA = new THREE.Color(0.07, 0.10, 0.08), cB = new THREE.Color(0.24, 0.15, 0.08), tmp = new THREE.Color();
  const vid = (i, j) => {
    const k = j * nx + i; if (vmap.has(k)) return vmap.get(k);
    const id = pos.length / 3; vmap.set(k, id);
    pos.push(x0 + i * cell, W, -(y0 + j * cell));
    tmp.copy(cA).lerp(cB, redAux ? redAux[k] : 0); col.push(tmp.r, tmp.g, tmp.b);
    return id;
  };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i;
    if (Math.min(h[a], h[a + 1], h[a + nx], h[a + nx + 1]) > lim) continue;
    if (skipRects) {
      const cx0 = x0 + i * cell, cy0 = y0 + j * cell; let skip = false;
      for (const r of skipRects) if (cx0 >= r[0] - 1e-3 && cx0 + cell <= r[1] + 1e-3 && cy0 >= r[2] - 1e-3 && cy0 + cell <= r[3] + 1e-3) { skip = true; break; }
      if (skip) continue;
    }
    const A = vid(i, j), B = vid(i + 1, j), C = vid(i, j + 1), Dd = vid(i + 1, j + 1);
    idx.push(A, B, C, B, Dd, C);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x8a9aa0 }));
}


// ------------------------------------------------------------------ proxy hình khối (toạ độ Blender: x, y, z lên; mặt tiền −Y)
const LIN = (r, g, b) => [r, g, b];
function colorize(geo, c) {
  geo = geo.index ? geo.toNonIndexed() : geo;
  geo.deleteAttribute("uv");
  const n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2]; }
  geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
  if (!geo.attributes.normal) geo.computeVertexNormals();
  return geo;
}
function bbox(x0, x1, y0, y1, z0, z1, c) {
  const g = new THREE.BoxGeometry(x1 - x0, z1 - z0, y1 - y0);
  g.translate((x0 + x1) / 2, (z0 + z1) / 2, -(y0 + y1) / 2);
  return colorize(g, c);
}
function cone(r1, r2, h, z0, seg, x, y, c) {
  const g = new THREE.CylinderGeometry(r2, r1, h, seg); g.translate(x, z0 + h / 2, -y); return colorize(g, c);
}
function ball(r, z, sx, sy, sz, x, y, c, det = 1) {
  const g = new THREE.IcosahedronGeometry(r, det); g.scale(sx, sz, sy); g.translate(x, z, -y); return colorize(g, c);
}
function polys(verts, faces, c) {
  const p = [];
  for (const f of faces) for (let t = 1; t < f.length - 1; t++) for (const k of [f[0], f[t], f[t + 1]]) { const v = verts[k]; p.push(v[0], v[2], -v[1]); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.computeVertexNormals(); return colorize(g, c);
}
function house(L, W, hw, hr, cw, cr, ov = 0.6) {
  const Lh = L / 2 + ov, Wh = W / 2 + ov, z = hw - 0.3;
  const v = [[-Lh, -Wh, z], [Lh, -Wh, z], [Lh, Wh, z], [-Lh, Wh, z], [-L / 2 + 0.8, 0, hw + hr], [L / 2 - 0.8, 0, hw + hr]];
  const roof = polys(v, [[0, 1, 5, 4], [2, 3, 4, 5], [1, 2, 5], [3, 0, 4]], cr);
  return mergeGeometries([bbox(-L / 2, L / 2, -W / 2, W / 2, 0, hw, cw), roof]);
}
function tent(L, W, H, wall, c) {
  const l = L / 2, w = W / 2;
  const v = [[-l, -w, 0], [l, -w, 0], [l, w, 0], [-l, w, 0], [-l, -w, wall], [l, -w, wall], [l, w, wall], [-l, w, wall], [-l, 0, H], [l, 0, H]];
  return polys(v, [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 9, 8], [6, 7, 8, 9], [5, 6, 9], [7, 4, 8]], c);
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const C = { vach: LIN(0.55, 0.47, 0.35), tranh: LIN(0.47, 0.38, 0.22), ngoi: LIN(0.38, 0.17, 0.10), go: LIN(0.25, 0.17, 0.10),
  la: LIN(0.13, 0.22, 0.07), la2: LIN(0.20, 0.28, 0.08), tre: LIN(0.22, 0.32, 0.10), say: LIN(0.42, 0.40, 0.22),
  vai: LIN(0.50, 0.46, 0.37), vaich: LIN(0.52, 0.42, 0.30), sat: LIN(0.20, 0.18, 0.16), dat: LIN(0.36, 0.29, 0.19) };
function buildProxies() {
  const P = {};
  P.nha = [house(9, 5, 2.4, 2.6, C.vach, C.tranh), house(7, 4.5, 2.2, 2.3, C.vach, C.tranh), house(11, 6, 2.8, 2.8, C.vach, C.ngoi)];
  P.dinh = [house(18, 10, 3.6, 4.2, C.go, C.ngoi, 1.4)];
  P.cay = [
    mergeGeometries([ball(2.2, 1.6, 1, 1, 0.8, 0, 0, C.la2), cone(0.15, 0.1, 1.2, 0, 5, 0, 0, C.go)]),
    mergeGeometries([cone(0.35, 0.2, 6, 0, 6, 0, 0, C.go), ball(4.5, 8.5, 1, 1, 0.75, 0, 0, C.la)]),
    mergeGeometries([cone(0.18, 0.14, 11, 0, 5, 0, 0, C.go), ball(2.4, 11.6, 1, 1, 0.45, 0, 0, C.la2)]),
    mergeGeometries([cone(0.4, 0.25, 3.5, 0, 6, 0, 0, C.go), ball(4.8, 6.0, 1.1, 1, 0.7, 0.6, 0, C.la), ball(3.5, 6.8, 1, 1, 0.7, -2.5, 1.5, C.la)]),
    mergeGeometries([cone(1.6, 1.0, 7, 0, 8, 0, 0, C.go), ball(12, 14, 1.15, 1, 0.55, 0, 0, C.la, 2), ball(7, 12, 1, 1, 0.6, 7, -4, C.la)]),
  ];
  let r = rng(7), parts = [];
  for (let k = 0; k < 7; k++) { const a = r() * 6.28, d = r() * 2.2; parts.push(cone(0.9, 0.05, 9 + r() * 5, 0, 4, d * Math.cos(a), d * Math.sin(a), C.tre)); }
  P.tre = [mergeGeometries(parts)];
  parts = [];
  for (let k = 0; k < 5; k++) { const a = r() * 6.28, d = r() * 1.5; parts.push(cone(0.35, 0.02, 1.5 + r() * 1.1, -0.3, 4, d * Math.cos(a), d * Math.sin(a), C.say)); }
  P.say = [mergeGeometries(parts)];
  P.leu = [tent(6, 4.5, 3.0, 0.9, C.vai), tent(14, 9, 5.2, 1.8, C.vaich)];
  parts = [];
  for (const sx of [-1.8, 1.8]) for (const sy of [-1.8, 1.8]) parts.push(bbox(sx - 0.15, sx + 0.15, sy - 0.15, sy + 0.15, 0, 9, C.go));
  parts.push(bbox(-2.3, 2.3, -2.3, 2.3, 7, 7.25, C.go));
  for (const b of [[-2.3, 2.3, -2.3, -2.15], [-2.3, 2.3, 2.15, 2.3], [-2.3, -2.15, -2.3, 2.3], [2.15, 2.3, -2.3, 2.3]]) parts.push(bbox(b[0], b[1], b[2], b[3], 7.25, 8.3, C.go));
  parts.push(polys([[-2.8, -2.8, 9], [2.8, -2.8, 9], [2.8, 2.8, 9], [-2.8, 2.8, 9], [0, 0, 10.8]], [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]], C.tranh));
  P.gac = [mergeGeometries(parts)];
  const barrel = new THREE.CylinderGeometry(0.16, 0.2, 2.6, 10); barrel.rotateX(Math.PI / 2); barrel.translate(0, 1.35, 0.4);
  P.usung = [mergeGeometries([bbox(-2.2, 2.2, -1.6, 1.6, 0, 0.7, C.dat), bbox(-0.7, 0.7, -0.6, 0.9, 0.7, 1.15, C.go), colorize(barrel, C.sat)])];
  parts = []; r = rng(3);
  for (let k = 0; k < 6; k++) {
    const g = new THREE.ConeGeometry(0.06, 0.7 + r() * 0.4, 4); g.translate(0, 0.35, 0);
    g.rotateX((r() - 0.5) * 1.0); g.rotateZ((r() - 0.5) * 1.0); g.translate((r() - 0.5) * 1.2, 0, (r() - 0.5) * 1.2);
    parts.push(colorize(g, C.sat));
  }
  P.chong = [mergeGeometries(parts)];
  return P;
}

const instSets = [];   // {mesh, data, stride, group}
function addInstances(key, geos, arr, hasVar, group) {
  const stride = hasVar ? 6 : 5, n = arr.length / stride;
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  geos.forEach((geo, vi) => {
    const sel = [];
    for (let i = 0; i < n; i++) if ((hasVar ? arr[i * stride + 5] : 0) === vi) sel.push(i);
    if (!sel.length) return;
    const mesh = new THREE.InstancedMesh(geo, mat, sel.length);
    mesh.frustumCulled = false;
    group.add(mesh);
    instSets.push({ mesh, arr, stride, sel });
  });
}
function placeInstances() {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (const it of instSets) {
    const { mesh, arr, stride, sel } = it;
    sel.forEach((i, k) => {
      const o = i * stride;
      p.set(arr[o], arr[o + 2] * EX, -arr[o + 1]); q.setFromAxisAngle(up, arr[o + 3]); s.setScalar(arr[o + 4]);
      m.compose(p, q, s); mesh.setMatrixAt(k, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }
}

// ------------------------------------------------------------------ đường + lũy/rào (dựng lại khi đổi EX)
const linear = new THREE.Group(); world.add(linear);
const PROFILES = { rao: [[-0.2, 0], [-0.2, 2.7], [0.2, 2.7], [0.2, 0]], raotre: [[-0.15, 0], [-0.15, 2.3], [0.15, 2.3], [0.15, 0]],
  luy: [[-3.2, 0], [-0.9, 1.9], [0.9, 1.9], [3.2, 0]] };
const LINMAT = { rao: new THREE.MeshLambertMaterial({ color: new THREE.Color(0.25, 0.17, 0.10) }),
  raotre: new THREE.MeshLambertMaterial({ color: new THREE.Color(0.22, 0.32, 0.10) }),
  luy: new THREE.MeshLambertMaterial({ color: new THREE.Color(0.36, 0.29, 0.19) }),
  road: new THREE.MeshLambertMaterial({ color: new THREE.Color(0.40, 0.31, 0.20), side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }) };
for (const k of ["rao", "raotre", "luy"]) LINMAT[k].side = THREE.DoubleSide;
function sweep(flat, prof, scaleH) {
  const n = flat.length / 3, m = prof.length, pos = [], idx = [];
  for (let i = 0; i < n; i++) {
    const a = Math.max(i - 1, 0), b = Math.min(i + 1, n - 1);
    let dx = flat[b * 3] - flat[a * 3], dy = flat[b * 3 + 1] - flat[a * 3 + 1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const nx = dy, ny = -dx;
    for (const [off, h] of prof) { const X = flat[i * 3] + nx * off, Y = flat[i * 3 + 1] + ny * off; pos.push(X, flat[i * 3 + 2] + h * scaleH, -Y); }
  }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < m - 1; k++) {
    const a = i * m + k, b = (i + 1) * m + k, c = (i + 1) * m + k + 1, d = i * m + k + 1;
    idx.push(a, c, b, a, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const roadGroup = new THREE.Group(), quanLinear = new THREE.Group();
linear.add(roadGroup, quanLinear);
function buildLinear() {
  for (const grp of [roadGroup, quanLinear]) { grp.children.forEach((c) => c.geometry.dispose()); grp.clear(); }
  for (const r of D.roads) {
    const g = sweep(r.p, [[-r.w / 2, 0.06 / EX], [r.w / 2, 0.06 / EX]], 1);
    roadGroup.add(new THREE.Mesh(g, LINMAT.road));
  }
  const byK = { rao: [], raotre: [], luy: [] };
  for (const l of D.lines) byK[l.k].push(sweep(l.p, PROFILES[l.k], 1 / EX));
  for (const k in byK) if (byK[k].length) quanLinear.add(new THREE.Mesh(mergeGeometries(byK[k]), LINMAT[k]));
}



// ------------------------------------------------------------------ nhãn + mốc
const labelsEl = $("labels");
const labels = [];
function addLabel(text, X, Y, Z, cls, lift = 60, maxDist = Infinity, onClick = null) {
  const el = document.createElement("div"); el.className = "lbl " + (cls || "");
  const b = document.createElement("b"); b.textContent = text; const i = document.createElement("i");
  el.append(b, i); labelsEl.appendChild(el);
  if (onClick) b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  const L = { el, b, X, Y, Z, lift, maxDist, visible: true }; labels.push(L); return L;
}
const markerGeo = { stalk: new THREE.CylinderGeometry(0.6, 0.6, 1, 6).translate(0, 0.5, 0), head: new THREE.SphereGeometry(1, 16, 12) };
const MAT = { anchor: new THREE.MeshBasicMaterial({ color: 0xe2b768 }), moved: new THREE.MeshBasicMaterial({ color: 0x7cc6e6 }),
  pin: new THREE.MeshBasicMaterial({ color: 0xd8705a }), done: new THREE.MeshBasicMaterial({ color: 0x8fc77f }),
  ghost: new THREE.MeshBasicMaterial({ color: 0xb9a88b, transparent: true, opacity: 0.55 }) };
function makeMarker(mat) {
  const g = new THREE.Group();
  const stalk = new THREE.Mesh(markerGeo.stalk, mat), head = new THREE.Mesh(markerGeo.head, mat);
  g.add(stalk, head); g.userData.parts = { stalk, head }; markers.add(g); return g;
}
function sizeMarker(g, X, Y) {
  const Z = heightAt(X, Y), base = T(X, Y, Z);
  const d = camera.position.distanceTo(base), s = THREE.MathUtils.clamp(d / 900, 0.06, 40);
  g.position.copy(base);
  g.userData.parts.stalk.scale.set(s, 26 * s, s);
  g.userData.parts.head.position.y = 26 * s; g.userData.parts.head.scale.setScalar(5 * s);
  g.userData.top = 31 * s;
}
const anchors = new Map(), pins = new Map(), moves = new Map();

// ------------------------------------------------------------------ khởi tạo
async function init() {
  setStep("Tải dữ liệu sa bàn…", 0.05);
  const r = await fetch(U(P.terrain.data)); if (!r.ok) throw new Error("không tải được dữ liệu sa bàn");
  D = await r.json(); meta = D.meta;
  setStep("Giải mã cao độ…", 0.25);
  const hm = await heightsOf(U(P.terrain.height), meta.zmin, meta.zmax);
  mainField = { x0: meta.x0, y0: meta.y0, cell: meta.cell, nx: meta.nx, ny: meta.ny, h: hm.z, aux: hm.aux };
  for (const p of meta.patches || []) {
    const ph = await heightsOf(U(P.terrain.patchHeight.replace("{name}", p.name)), meta.zmin, meta.zmax);
    fields.push({ name: p.name, x0: p.x0, y0: p.y0, cell: p.cell, nx: p.nx, ny: p.ny, h: ph.z, rect: p.rect });
  }
  setStep("Dựng địa hình…", 0.45);
  const rects = (meta.patches || []).map((p) => p.rect);
  const texMain = await textureOf(U(P.terrain.image));
  mmImg = texMain.image;
  world.add(heightMesh(mainField, texMain, rects));
  world.add(waterMesh(mainField, rects, mainField.aux));
  setStep("Dựng nền chân trời, núi xa…", 0.5);
  buildSurroundings();
  for (const f of fields) {
    const tex = await textureOf(U(P.terrain.patchImage.replace("{name}", f.name)));
    world.add(heightMesh(f, tex, null));
    if (!(P.terrain.patchNoWater || []).includes(f.name)) world.add(waterMesh(f, null, null));
  }
  const ldGroup = new THREE.Group(); ldGroup.visible = false; world.add(ldGroup);
  for (const ring of D.linhdam || []) {
    const pts = []; for (let i = 0; i < ring.length; i += 2) pts.push(new THREE.Vector3(ring[i], meta.water + 0.6, -ring[i + 1]));
    ldGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x40d4ff })));
  }
  setStep("Rải nhà cửa, cây, đồn trại…", 0.7);
  const PR = buildProxies(), I = D.inst || {};
  for (const [key, proxy, hasVar, grp] of PROPS.instances || []) if (I[key] && PR[proxy]) addInstances(key, PR[proxy], I[key], hasVar, groups[grp] || groups.quan);
  htGroup = new THREE.Group(); groups.nha.add(htGroup);
  const zg = D.hoangthanh ? D.hoangthanh.zg : 0;
  for (const k in D.hoangthanh ? D.hoangthanh.mats : {}) {
    const m = D.hoangthanh.mats[k], v = m.v, pos = new Float32Array(v.length);
    for (let i = 0; i < v.length; i += 3) { pos[i] = v[i]; pos[i + 1] = v[i + 2] - zg; pos[i + 2] = -v[i + 1]; }
    let g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setIndex(m.f);
    g = g.toNonIndexed(); g.computeVertexNormals();
    htGroup.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: new THREE.Color(m.c[0], m.c[1], m.c[2]), side: THREE.DoubleSide })));
  }
  htGroup.position.y = zg * EX; htGroup.userData.zg = zg;
  placeInstances(); buildLinear();
  setStep("Đặt mốc, nhãn…", 0.9);
  for (const a of D.anchors) {
    const m = makeMarker(MAT.anchor); m.userData.kind = "anchor"; m.userData.name = a.name;
    const L = addLabel(LABEL[a.name] || a.name, a.x, a.y, 0, BIG.has(a.name) ? "big" : "", 60, Infinity, () => { showCard(a.name); flyToAnchor(a.name); });
    anchors.set(a.name, { a, X: Math.min(Math.max(a.x, meta.x0 + 50), meta.x0 + (meta.nx - 1) * meta.cell - 50),
      Y: Math.min(Math.max(a.y, meta.y0 + 50), meta.y0 + (meta.ny - 1) * meta.cell - 50), marker: m, label: L });
  }
  for (const [t, la, lo] of RIVERS) addLabel(t, (lo - meta.lon0) * meta.kx, (la - meta.lat0) * meta.ky, 0, "river", 10);
  for (const v of D.villages || []) { const L = addLabel(v.name, v.x, v.y, 0, "vil", 25, 3500); L.village = true; }
  const bind = (id, fn) => $(id).addEventListener("change", (e) => { fn(e.target.checked); });
  bind("ly-nha", (v) => (groups.nha.visible = v));
  bind("ly-cay", (v) => (groups.cay.visible = v));
  bind("ly-quan", (v) => { groups.quan.visible = v; quanLinear.visible = v; });
  bind("ly-duong", (v) => (roadGroup.visible = v));
  bind("ly-ld", (v) => (ldGroup.visible = v));
  try {
    const rs = await fetch(U(P.story || "story.json")); if (rs.ok) { S = await rs.json(); prepStory(); }
  } catch (err) { console.warn("story.json", err); }
  if (!S) document.querySelector('#modes [data-m="film"]').hidden = true;
  if (S) nvLoad().catch((err) => console.warn("nhân vật", err));       // tải nền, không chặn màn hình chờ
  resize(); goView("all", true);
  setStep("Sẵn sàng", 1);
  $("load").classList.add("done"); setTimeout(() => $("load").remove(), 700);
  renderer.setAnimationLoop(frame);
  emit("ready");
  window.SB = window.NHDD = { pause: () => renderer.setAnimationLoop(null), once: () => frame(), preset: (n) => goView(n, true), ex: (v) => setEx(v),
    nv: () => NV.ok, cam: (x, y, z, tx, ty, tz) => { takeOver(); fly = null; camera.position.set(x, z, -y); controls.target.set(tx, tz, -ty); }, am: () => [AM.ready, Object.keys(AM.beds).length, AM.ctx && AM.ctx.state], nvdbg: () => NV.groups.map((g) => [g.id, [...g.meshes.values()].reduce((a, m) => a + m.count, 0)]), mode: (m) => setAppMode(m), scene: (i, t) => goScene(i, t || 0), play: (b) => setPlaying(b), night: (n) => { nightCur = n; },
    walk: (b) => setWalk(b), joy: (x, y) => { W.joy.x = x; W.joy.y = y; }, arrows: () => { for (const A of ARR.values()) A.p = 1; applyArrowProgress(); } };
  const qm = new URLSearchParams(location.search).get("mode");
  setAppMode(qm === "explore" || qm === "pov" ? qm : S ? "film" : "explore");
  if (appMode === "film") { goScene(0); setPlaying(false); } else window.batDau(false);
  connectStore();
}

// ------------------------------------------------------------------ góc nhìn, chuyển địa điểm, điều khiển
// mỗi điểm: mốc, khoảng cách (m), phương vị camera nhìn từ đâu (độ, 0 = từ phía Bắc, 180 = từ phía Nam), góc ngẩng (độ), dời tâm (m)
const VIEWS = P.views || {};
function viewXY(v) { const A = v.target ? anchors.get(v.target) : null, off = v.off || [0, 0]; return A ? [A.X + off[0], A.Y + off[1]] : [v.X || 0, v.Y || 0]; }
function viewPose(name) {
  const v = VIEWS[name] || { X: 0, Y: 0, dist: 30000, az: 180, el: 17 };
  if (!v.target) return poseFrom({ X: v.X || 0, Y: v.Y || 0, d: v.dist, az: v.az, el: v.el });
  const dist = v.dist, az = v.az, el = v.el, [X, Y] = viewXY(v), Z = heightAt(X, Y) * EX;
  const h = dist * Math.cos(el * Math.PI / 180), a = az * Math.PI / 180;
  return { tgt: new THREE.Vector3(X, Z, -Y), pos: new THREE.Vector3(X + Math.sin(a) * h, Z + dist * Math.sin(el * Math.PI / 180), -(Y + Math.cos(a) * h)) };
}
let fly = null;
function flyPose(v, instant) {
  if (instant || reduceMotion) { camera.position.copy(v.pos); controls.target.copy(v.tgt); controls.update(); fly = null; return; }
  const dd = camera.position.distanceTo(v.pos) + controls.target.distanceTo(v.tgt);
  fly = { t0: performance.now(), p0: camera.position.clone(), t0v: controls.target.clone(), p1: v.pos, t1: v.tgt, dur: 1100 + Math.min(1600, dd / 12), arc: Math.min(dd * 0.15, 5000) };
}
function goView(name, instant) {
  if (W.on) {                                               // đang đi bộ: bấm địa điểm là tới ngay
    const v = VIEWS[name]; if (!v || !v.target) { setWalk(false); } else { const [X, Y] = viewXY(v); walkTeleport(X, Y - 90); return; }
  }
  setAuto(false); flyPose(viewPose(name), instant);
  document.querySelectorAll("#views button").forEach((b) => b.classList.toggle("on", b.dataset.v === name));
}
function flyToAnchor(name) {
  const A = anchors.get(name); if (!A) return;
  if (W.on) { walkTeleport(A.X, A.Y - 60); return; }
  flyTo(A.X, A.Y, THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.6, 500, 2500));
}
function flyTo(X, Y, dist = 900) {
  takeOver();
  const Z = heightAt(X, Y) * EX, tgt = new THREE.Vector3(X, Z, -Y);
  const dir = camera.position.clone().sub(controls.target).normalize();
  const pos = tgt.clone().add(dir.multiplyScalar(dist));
  if (pos.y < Z + dist * 0.35) pos.y = Z + dist * 0.35;
  flyPose({ pos, tgt });
  document.querySelectorAll("#views button").forEach((b) => b.classList.remove("on"));
}
$("views").addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) goView(b.dataset.v); });

const sph = new THREE.Spherical();
function orbit(dTheta, dPhi, zoomF) {
  fly = null; takeOver();
  const off = camera.position.clone().sub(controls.target);
  sph.setFromVector3(off);
  sph.theta += dTheta;
  sph.phi = THREE.MathUtils.clamp(sph.phi + dPhi, 0.05, controls.maxPolarAngle);
  sph.radius = THREE.MathUtils.clamp(sph.radius * zoomF, controls.minDistance, controls.maxDistance);
  off.setFromSpherical(sph); camera.position.copy(controls.target).add(off);
}
const ACTS = { left: [-0.025, 0, 1], right: [0.025, 0, 1], up: [0, -0.015, 1], down: [0, 0.015, 1], in: [0, 0, 0.965], out: [0, 0, 1.036] };
let held = null;
function north() {
  const off = camera.position.clone().sub(controls.target); sph.setFromVector3(off); sph.theta = 0; off.setFromSpherical(sph);
  flyPose({ pos: controls.target.clone().add(off), tgt: controls.target.clone() });
}
document.querySelectorAll("#pad [data-act]").forEach((b) => {
  const act = b.dataset.act;
  if (act === "north") { b.addEventListener("click", () => { takeOver(); north(); }); return; }
  const start = (e) => { e.preventDefault(); setAuto(false); held = ACTS[act]; b.setPointerCapture?.(e.pointerId); };
  const stop = () => { held = null; };
  b.addEventListener("pointerdown", start); b.addEventListener("pointerup", stop); b.addEventListener("pointercancel", stop); b.addEventListener("pointerleave", stop);
  b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const a = ACTS[act]; for (let k = 0; k < 8; k++) orbit(a[0], a[1], a[2]); } });
});
function setAuto(on) { controls.autoRotate = on; $("autorot").setAttribute("aria-pressed", on ? "true" : "false"); }
$("autorot").addEventListener("click", () => setAuto(!controls.autoRotate));
addEventListener("keydown", (e) => {
  if (e.target.closest && e.target.closest("input, textarea, select")) return;
  if (W.on) return;
  const k = e.key, map = { ArrowLeft: "left", ArrowRight: "right", q: "left", e: "right", ArrowUp: "up", ArrowDown: "down", "+": "in", "=": "in", "-": "out" };
  if (map[k]) { const a = ACTS[map[k]]; for (let i = 0; i < 4; i++) orbit(a[0], a[1], a[2]); e.preventDefault(); }
  else if (k === "n" || k === "N") north();
  else if (k === "Escape") { $("info").hidden = true; if (mode !== "view") setMode("view"); }
});
function setEx(v) {
  EX = v; $("exbtn").textContent = "Cao ×" + EX;
  const ty = controls.target.y;
  world.scale.y = EX; placeInstances(); buildLinear(); buildArrows(); if (W.on) placeAvatarAt(W.pos.x, -W.pos.z); if (htGroup) htGroup.position.y = htGroup.userData.zg * EX;
  const X = controls.target.x, Y = -controls.target.z, dy = heightAt(X, Y) * EX - ty;
  controls.target.y += dy; camera.position.y += dy;
}
$("exbtn").addEventListener("click", () => setEx(EX === 1 ? 2 : EX === 2 ? 4 : 1));

// bản đồ nhỏ
const mm = $("mm"), mmx = mm.getContext("2d");
const mmW = () => (meta.nx - 1) * meta.cell, mmH = () => (meta.ny - 1) * meta.cell;
function drawMinimap() {
  if (!mmImg || getComputedStyle($("minimap")).display === "none") return;
  const w = mm.width, h = mm.height;
  mmx.drawImage(mmImg, 0, 0, w, h);
  const toPx = (X, Y) => [((X - meta.x0) / mmW()) * w, (1 - (Y - meta.y0) / mmH()) * h];
  mmx.lineWidth = 2;
  for (const A of anchors.values()) { const [px, py] = toPx(A.X, A.Y); mmx.fillStyle = "rgba(226,183,104,.75)"; mmx.fillRect(px - 2, py - 2, 4, 4); }
  for (const P of pins.values()) { const [px, py] = toPx(P.X, P.Y); mmx.fillStyle = "#d8705a"; mmx.fillRect(px - 3, py - 3, 6, 6); }
  if (S && $("ly-arr").checked) for (const id of S.states[arrowState] || []) {
    const def = S.arrows[id], A = ARR.get(id); if (!def || !A || A.p <= 0) continue;
    const pts = def.pts.map(([la, lo]) => toPx(...llXY(la, lo)));
    mmx.strokeStyle = mmx.fillStyle = def.c === "red" ? "#d8392b" : "#3b8ae8"; mmx.lineWidth = 3; mmx.setLineDash(def.c === "red" ? [] : [6, 4]);
    mmx.beginPath(); pts.forEach(([x, y], k) => (k ? mmx.lineTo(x, y) : mmx.moveTo(x, y))); mmx.stroke(); mmx.setLineDash([]);
    const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 2], an = Math.atan2(ey - py, ex - px);
    mmx.beginPath(); mmx.moveTo(ex + Math.cos(an) * 6, ey + Math.sin(an) * 6);
    mmx.lineTo(ex + Math.cos(an + 2.5) * 9, ey + Math.sin(an + 2.5) * 9); mmx.lineTo(ex + Math.cos(an - 2.5) * 9, ey + Math.sin(an - 2.5) * 9); mmx.fill();
  }
  mmx.lineWidth = 2;
  const [tx, ty] = toPx(controls.target.x, -controls.target.z), [cx, cy] = toPx(camera.position.x, -camera.position.z);
  mmx.strokeStyle = "rgba(255,240,210,.9)"; mmx.beginPath(); mmx.moveTo(cx, cy); mmx.lineTo(tx, ty); mmx.stroke();
  mmx.fillStyle = "#e2b768"; mmx.beginPath(); mmx.arc(tx, ty, 5, 0, 7); mmx.fill();
  mmx.strokeStyle = "#23190d"; mmx.lineWidth = 1.5; mmx.stroke();
}
mm.addEventListener("click", (e) => {
  const r = mm.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
  flyTo(meta.x0 + u * mmW(), meta.y0 + (1 - v) * mmH(), camera.position.distanceTo(controls.target));
});

// chip công cụ
$("revbtn").addEventListener("click", () => { const open = $("review").hidden; $("review").hidden = !open; $("revbtn").setAttribute("aria-pressed", open); if (open) $("info").hidden = true; });
$("revx").addEventListener("click", () => { $("review").hidden = true; $("revbtn").setAttribute("aria-pressed", "false"); });
$("infox").addEventListener("click", () => { $("info").hidden = true; });

// ------------------------------------------------------------------ chọn điểm trên mặt đất (dò tia theo heightmap)
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
function setNdc(e) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
function pickGround(e) {
  setNdc(e); raycaster.setFromCamera(ndc, camera);
  const o = raycaster.ray.origin, d = raycaster.ray.direction;
  let t = 0, prevT = 0, hit = null;
  for (let k = 0; k < 4000 && t < 130000; k++) {
    const X = o.x + d.x * t, Y = -(o.z + d.z * t), y = o.y + d.y * t;
    if (inBounds(X, Y) && y <= heightAt(X, Y) * EX) { hit = t; break; }
    prevT = t; t += Math.max(2, t * 0.004);
  }
  if (hit === null) return null;
  let a = prevT, b = hit;
  for (let k = 0; k < 18; k++) { const m = (a + b) / 2, X = o.x + d.x * m, Y = -(o.z + d.z * m), y = o.y + d.y * m; if (y <= heightAt(X, Y) * EX) b = m; else a = m; }
  const X = o.x + d.x * b, Y = -(o.z + d.z * b);
  return { X, Y, Z: heightAt(X, Y) };
}
function pickMarker(e) {
  setNdc(e); raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(markers.children.filter((m) => m.visible), true);
  for (const h of hits) { let g = h.object; while (g && !g.userData.kind) g = g.parent; if (g) return g; }
  return null;
}



// ------------------------------------------------------------------ chế độ + tương tác
let mode = "view";
const HELP = { view: "Bấm vào điểm bất kỳ để bay tới · kéo để xoay · chuột phải để dời · cuộn/chụm để phóng to",
  drag: "Kéo mốc vàng hoặc ghi chú đỏ tới vị trí mới · thả ra là lưu cho cả nhóm · Esc để thoát",
  add: "Bấm vào chỗ cần góp ý trên sa bàn để đặt ghi chú · Esc để thoát" };
function setMode(m) {
  mode = m;
  $("m-drag").setAttribute("aria-pressed", m === "drag" ? "true" : "false");
  $("m-add").setAttribute("aria-pressed", m === "add" ? "true" : "false");
  $("help").textContent = HELP[m];
  renderer.domElement.style.cursor = m === "add" ? "crosshair" : "";
}
$("m-drag").onclick = () => setMode(mode === "drag" ? "view" : "drag");
$("m-add").onclick = () => setMode(mode === "add" ? "view" : "add");

let drag = null, down = null, hoverQueued = null;
const cvs = renderer.domElement;
cvs.addEventListener("pointerdown", (e) => {
  down = { x: e.clientX, y: e.clientY }; setAuto(false);
  if (mode === "drag" && e.button === 0) {
    const g = pickMarker(e);
    if (g && canWrite !== false) { drag = { g }; controls.enabled = false; cvs.setPointerCapture(e.pointerId); e.preventDefault(); }
  }
});
cvs.addEventListener("pointermove", (e) => {
  if (drag) {
    const p = pickGround(e); if (!p) return;
    drag.X = p.X; drag.Y = p.Y;
    const ud = drag.g.userData;
    if (ud.kind === "anchor") { const A = anchors.get(ud.name); A.X = p.X; A.Y = p.Y; }
    else { const P = pins.get(ud.id); if (P) { P.X = p.X; P.Y = p.Y; } }
    showReadout(p); return;
  }
  if (!hoverQueued) { hoverQueued = e; requestAnimationFrame(() => { const p = pickGround(hoverQueued); hoverQueued = null; if (p) showReadout(p); }); } else hoverQueued = e;
});
cvs.addEventListener("pointerup", async (e) => {
  const moved = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5;
  if (drag) {
    const { g, X, Y } = drag; drag = null; controls.enabled = true;
    if (X !== undefined) {
      if (g.userData.kind === "anchor") await saveMove(g.userData.name, X, Y);
      else await savePinPos(g.userData.id, X, Y);
    }
    return;
  }
  if (moved || e.button !== 0) return;
  if (mode === "add") { const p = pickGround(e); if (p) openDialog(null, p); return; }
  const g = pickMarker(e);
  if (g) { if (g.userData.kind === "pin") openDialog(g.userData.id); else { showCard(g.userData.name); flyToAnchor(g.userData.name); } return; }
  if (W.on) return;
  const p = pickGround(e);                                  // bấm vào bất kỳ điểm nào trên sa bàn: bay tới đó
  if (p) flyTo(p.X, p.Y, THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.72, 300, 20000));
});
function showReadout(p) {
  const ll = toLL(p.X, p.Y);
  $("readout").textContent = `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · cao ${p.Z.toFixed(1)} m`;
}
function showCard(name) {
  const A = anchors.get(name), a = A.a, ll = toLL(A.X, A.Y), mv = moves.get(name);
  const body = $("infobody"); body.replaceChildren();
  const h = document.createElement("h2"); h.textContent = LABEL[name] || name;
  const p = document.createElement("p"); p.textContent = a.desc;
  const m = document.createElement("div"); m.className = "src";
  m.textContent = `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · mốc ${name}` + (a.outside ? " · ngoài khung địa hình" : "") + (mv ? ` · đã dời ${Math.round(Math.hypot(mv.x - a.x, mv.y - a.y))} m` : "");
  const acts = document.createElement("div"); acts.className = "acts";
  const b1 = document.createElement("button"); b1.className = "gold"; b1.textContent = "Bay tới"; b1.onclick = () => flyTo(A.X, A.Y, 900);
  const b2 = document.createElement("button"); b2.textContent = "Ghi chú tại mốc này";
  b2.onclick = () => openDialog(null, { X: A.X, Y: A.Y, Z: heightAt(A.X, A.Y) }, `Mốc ${LABEL[name] || name}: `);
  acts.append(b1, b2); body.append(h, p, m, acts);
  $("review").hidden = true; $("revbtn").setAttribute("aria-pressed", "false"); $("info").hidden = false;
}

// ------------------------------------------------------------------ kho ghi chú dùng chung (db)
let db = null, userApi = null, myId = null, canWrite = null, local = false, names = {};
function sync(state, text) { $("syncdot").className = "dot " + state; $("synctext").textContent = text; }
async function connectStore() {
  const use = window.claude && window.claude.use ? window.claude.use.bind(window.claude) : null;
  if (!use) { local = true; sync("warn", "Chế độ cục bộ: ghi chú chỉ nằm trong phiên này"); renderList(); return; }
  const timer = setTimeout(() => { if (!db) sync("warn", "Chưa kết nối được kho ghi chú, đang thử tiếp…"); }, 10000);
  try { db = await use("db"); } catch { db = null; }
  try { userApi = await use("user"); if (userApi) { myId = await userApi.id(); const c = userApi.can ? await userApi.can("data.write") : null; if (c === false) canWrite = false; } } catch {}
  if (!db) { clearTimeout(timer); local = true; sync("warn", "Chế độ cục bộ: ghi chú chỉ nằm trong phiên này"); renderList(); return; }
  let firstPins = false, firstMoves = false;
  const ready = () => { if (firstPins && firstMoves) { clearTimeout(timer); sync("on", canWrite === false ? "Đã kết nối · anh chỉ có quyền xem" : "Đã lưu chung cho cả nhóm"); } };
  db.collection("pins").onSnapshot((snap) => {
    const seen = new Set();
    for (const d of snap.docs) { seen.add(d.id); upsertPin(d.id, d.data()); }
    for (const id of [...pins.keys()]) if (!seen.has(id)) removePin(id);
    if (!snap.metadata.fromCache) { firstPins = true; ready(); }
    renderList();
  }, (err) => { sync("warn", "Mất kết nối kho ghi chú (" + err.code + ")"); });
  db.collection("moves").onSnapshot((snap) => {
    const seen = new Set();
    for (const d of snap.docs) { seen.add(d.id); applyMove(d.id, d.data()); }
    for (const n of [...moves.keys()]) if (!seen.has(n)) clearMove(n);
    if (!snap.metadata.fromCache) { firstMoves = true; ready(); }
    renderList();
  }, (err) => { sync("warn", "Mất kết nối kho ghi chú (" + err.code + ")"); });
}
function failWrite(e) {
  if (e && e.code === "invalid_argument") { canWrite = false; sync("warn", "Anh chỉ có quyền xem, không lưu được thay đổi"); }
  else if (e && e.code === "quota_exceeded") sync("warn", "Kho ghi chú đã đầy, hãy xoá bớt ghi chú cũ");
  else sync("warn", "Chưa lưu được, thử lại sau ít phút");
}
const now = () => new Date().toISOString();

function upsertPin(id, doc) {
  let P = pins.get(id);
  if (!P) {
    const m = makeMarker(MAT.pin); m.userData.kind = "pin"; m.userData.id = id;
    P = { marker: m, label: addLabel("", doc.x, doc.y, 0, "pin", 60, Infinity, () => openDialog(id)) }; pins.set(id, P);
  }
  P.doc = doc; P.X = doc.x; P.Y = doc.y;
  P.marker.userData.parts.stalk.material = P.marker.userData.parts.head.material = doc.status === "xong" ? MAT.done : MAT.pin;
  P.label.b.textContent = doc.title || "Ghi chú";
  P.label.el.className = "lbl pin" + (doc.status === "xong" ? " done" : "");
}
function removePin(id) {
  const P = pins.get(id); if (!P) return;
  markers.remove(P.marker); P.label.el.remove(); labels.splice(labels.indexOf(P.label), 1); pins.delete(id);
}
function applyMove(name, doc) {
  const A = anchors.get(name); if (!A) return;
  moves.set(name, doc); A.X = doc.x; A.Y = doc.y;
  A.marker.userData.parts.stalk.material = A.marker.userData.parts.head.material = MAT.moved;
  A.label.el.classList.add("moved");
  if (!A.ghost) { A.ghost = makeMarker(MAT.ghost); A.ghost.userData.kind = null; A.ghost.userData.ghostOf = name; }
}
function clearMove(name) {
  const A = anchors.get(name); moves.delete(name); if (!A) return;
  A.X = A.a.x; A.Y = A.a.y; A.marker.userData.parts.stalk.material = A.marker.userData.parts.head.material = MAT.anchor;
  A.label.el.classList.remove("moved");
  if (A.ghost) { markers.remove(A.ghost); A.ghost = null; }
}
async function saveMove(name, X, Y) {
  const A = anchors.get(name), ll = toLL(X, Y);
  const doc = { name, label: LABEL[name] || name, x: +X.toFixed(1), y: +Y.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6),
    from_x: A.a.x, from_y: A.a.y, from_lat: A.a.lat, from_lon: A.a.lon, author: myId, updated: now() };
  if (local) { applyMove(name, doc); renderList(); return; }
  try { await db.collection("moves").doc(name).set(doc); } catch (e) { failWrite(e); clearMove(name); if (moves.has(name)) applyMove(name, moves.get(name)); }
}
async function undoMove(name) {
  if (local) { clearMove(name); renderList(); return; }
  try { await db.collection("moves").doc(name).delete(); } catch (e) { failWrite(e); }
}
async function savePinPos(id, X, Y) {
  const P = pins.get(id); if (!P) return; const ll = toLL(X, Y);
  const patch = { x: +X.toFixed(1), y: +Y.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6), updated: now() };
  if (local) { upsertPin(id, { ...P.doc, ...patch }); renderList(); return; }
  try { await db.collection("pins").doc(id).update(patch); } catch (e) { failWrite(e); upsertPin(id, P.doc); }
}

// ------------------------------------------------------------------ hộp thoại ghi chú
let editing = null;
function openDialog(id, pos, prefix = "") {
  editing = { id, pos };
  const P = id ? pins.get(id) : null, d = P ? P.doc : null;
  $("dlg-title").textContent = d ? "Sửa ghi chú" : "Ghi chú mới";
  const X = d ? d.x : pos.X, Y = d ? d.y : pos.Y, ll = toLL(X, Y);
  $("dlg-pos").textContent = `Tại ${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · cao độ ${heightAt(X, Y).toFixed(1)} m`;
  $("f-cat").value = d ? d.cat : "vitri"; $("f-title").value = d ? d.title : prefix; $("f-text").value = d ? d.text || "" : "";
  $("f-del").style.display = d ? "" : "none";
  const ro = canWrite === false;
  for (const f of ["f-cat", "f-title", "f-text", "f-save", "f-del"]) $(f).disabled = ro;
  $("dlg").classList.add("show"); $("f-title").focus();
}
function closeDialog() { $("dlg").classList.remove("show"); editing = null; }
$("f-cancel").onclick = closeDialog;
$("dlg").addEventListener("keydown", (e) => { if (e.key === "Escape") closeDialog(); });
$("dlg-form").addEventListener("submit", async (e) => {
  e.preventDefault(); if (!editing) return;
  const body = { cat: $("f-cat").value, title: $("f-title").value.trim() || "Ghi chú", text: $("f-text").value.trim(), updated: now() };
  const { id, pos } = editing; closeDialog();
  if (id) {
    if (local) { upsertPin(id, { ...pins.get(id).doc, ...body }); renderList(); return; }
    try { await db.collection("pins").doc(id).update(body); } catch (err) { failWrite(err); }
  } else {
    const ll = toLL(pos.X, pos.Y);
    const doc = { ...body, x: +pos.X.toFixed(1), y: +pos.Y.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6),
      status: "mo", author: myId, created: now() };
    if (local) { upsertPin("l" + Date.now(), doc); renderList(); return; }
    try { await db.collection("pins").add(doc); } catch (err) { failWrite(err); }
  }
});
$("f-del").onclick = async () => {
  if (!editing || !editing.id) return; const id = editing.id; closeDialog();
  if (local) { removePin(id); renderList(); return; }
  try { await db.collection("pins").doc(id).delete(); } catch (err) { failWrite(err); }
};
async function toggleDone(id) {
  const P = pins.get(id); const status = P.doc.status === "xong" ? "mo" : "xong";
  if (local) { upsertPin(id, { ...P.doc, status }); renderList(); return; }
  try { await db.collection("pins").doc(id).update({ status, updated: now() }); } catch (e) { failWrite(e); }
}

// ------------------------------------------------------------------ danh sách review
let tab = "pins";
$("tab-pins").onclick = () => { tab = "pins"; $("tab-pins").setAttribute("aria-selected", "true"); $("tab-moves").setAttribute("aria-selected", "false"); renderList(); };
$("tab-moves").onclick = () => { tab = "moves"; $("tab-moves").setAttribute("aria-selected", "true"); $("tab-pins").setAttribute("aria-selected", "false"); renderList(); };
const fmtTime = (s) => { try { return new Date(s).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
async function resolveNames(ids) {
  ids = ids.filter((i) => i && !(i in names)); if (!ids.length || !userApi || !userApi.profiles) return;
  try { const ps = await userApi.profiles(ids); for (const i of ids) names[i] = (ps[i] && ps[i].name) || "Ai đó"; renderList(); } catch {}
}
function btn(text, fn) { const b = document.createElement("button"); b.textContent = text; b.onclick = fn; return b; }
function renderList() {
  $("n-pins").textContent = pins.size; $("n-moves").textContent = moves.size; $("n-all").textContent = pins.size + moves.size;
  const list = $("list"); list.replaceChildren();
  const who = (id) => (id && id === myId ? "Anh" : names[id] || "Ai đó");
  if (tab === "pins") {
    const arr = [...pins.entries()].sort((a, b) => (a[1].doc.status === "xong") - (b[1].doc.status === "xong") || String(b[1].doc.created).localeCompare(String(a[1].doc.created)));
    if (!arr.length) { const e = document.createElement("div"); e.className = "empty"; e.textContent = "Chưa có ghi chú. Chọn “Thêm ghi chú” rồi bấm lên sa bàn tại chỗ cần góp ý: vị trí đồn, làng, đường, hình dạng hồ, sai lệch sử liệu…"; list.append(e); }
    for (const [id, P] of arr) {
      const d = P.doc, it = document.createElement("div"); it.className = "item" + (d.status === "xong" ? " done" : "");
      const h = document.createElement("h3"); h.textContent = d.title;
      const m = document.createElement("div"); m.className = "meta";
      const chip = document.createElement("span"); chip.className = "chip c-" + d.cat; chip.textContent = CAT[d.cat] || d.cat;
      const s = document.createElement("span"); s.textContent = `${who(d.author)} · ${fmtTime(d.updated || d.created)}`;
      const c = document.createElement("span"); c.textContent = `${(+d.lat).toFixed(5)}, ${(+d.lon).toFixed(5)}`;
      m.append(chip, s, c);
      it.append(h, m);
      if (d.text) { const p = document.createElement("p"); p.textContent = d.text; it.append(p); }
      const acts = document.createElement("div"); acts.className = "acts";
      acts.append(btn("Bay tới", () => flyTo(P.X, P.Y)), btn("Sửa", () => openDialog(id)), btn(d.status === "xong" ? "Mở lại" : "Đã xử lý", () => toggleDone(id)));
      it.append(acts); list.append(it);
    }
    resolveNames(arr.map(([, P]) => P.doc.author));
  } else {
    const arr = [...moves.values()].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
    if (!arr.length) { const e = document.createElement("div"); e.className = "empty"; e.textContent = "Chưa dời mốc nào. Chọn “Kéo mốc” rồi kéo các chấm vàng (mốc theo kịch bản) tới vị trí đúng."; list.append(e); }
    for (const d of arr) {
      const it = document.createElement("div"); it.className = "item mv";
      const h = document.createElement("h3"); h.textContent = d.label;
      const m = document.createElement("div"); m.className = "meta";
      const dist = Math.round(Math.hypot(d.x - d.from_x, d.y - d.from_y));
      m.textContent = `Dời ${dist} m · ${who(d.author)} · ${fmtTime(d.updated)} · mới ${(+d.lat).toFixed(5)}, ${(+d.lon).toFixed(5)}`;
      const acts = document.createElement("div"); acts.className = "acts";
      acts.append(btn("Bay tới", () => flyTo(d.x, d.y)), btn("Trả về vị trí cũ", () => undoMove(d.name)));
      it.append(h, m, acts); list.append(it);
    }
    resolveNames(arr.map((d) => d.author));
  }
}
$("export").onclick = async () => {
  const out = { du_an: "Sa bàn " + P.title, goi: P.id + "@" + P.version, xuat_luc: now(), goc_toa_do: [meta.lat0, meta.lon0],
    ghi_chu: [...pins.values()].map((P) => ({ loai: CAT[P.doc.cat], tieu_de: P.doc.title, noi_dung: P.doc.text, trang_thai: P.doc.status,
      lat: P.doc.lat, lon: P.doc.lon, x: P.doc.x, y: P.doc.y })),
    moc_da_doi: [...moves.values()].map((d) => ({ moc: d.name, ten: d.label, tu: [d.from_lat, d.from_lon], den: [d.lat, d.lon], x: d.x, y: d.y,
      do_dich_m: Math.round(Math.hypot(d.x - d.from_x, d.y - d.from_y)) })) };
  const txt = JSON.stringify(out, null, 1);
  try { await navigator.clipboard.writeText(txt); $("export").textContent = "Đã sao chép ✓"; setTimeout(() => ($("export").textContent = "Sao chép dữ liệu review (JSON)"), 2000); }
  catch {
    const ta = document.createElement("textarea"); ta.id = "copybox"; ta.value = txt; ta.readOnly = true;
    const list = $("list"); list.prepend(ta); ta.focus(); ta.select();
  }
};




// ------------------------------------------------------------------ bầu trời, mây, nền chân trời, núi xa
const DAY = { hor: new THREE.Color(0xc9cbc0), top: new THREE.Color(0x7a9cbd), sun: new THREE.Color(0xffe8cc) };
const NIGHT = { hor: new THREE.Color(0x1c2230), top: new THREE.Color(0x060a14), sun: new THREE.Color(0x9fb4ff) };
const _c1 = new THREE.Color(), _c2 = new THREE.Color(), _rgb = { r: 0, g: 0, b: 0 };
const skyU = { uTop: { value: new THREE.Vector3() }, uHor: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(6000, 5200, 6000).normalize() },
  uTime: { value: 0 }, uNight: { value: 0 } };
const NOISE_GLSL = `
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.02 + vec2(1.7, 9.2); a *= .5; } return s; }`;
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uTop, uHor, uSunDir; uniform float uTime, uNight; varying vec3 vDir;` + NOISE_GLSL + `
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(uHor, uTop, pow(clamp(h, 0., 1.), .5));
  float sd = max(dot(d, uSunDir), 0.);
  float sUp = smoothstep(-.2, .04, uSunDir.y), sLow = sUp * (1. - smoothstep(.04, .42, uSunDir.y));
  vec3 sunc = mix(vec3(1., .42, .16), vec3(1., .95, .82), smoothstep(-.02, .35, uSunDir.y));
  float saz = max(dot(normalize(d.xz + 1e-5), normalize(uSunDir.xz + 1e-5)), 0.);
  col = mix(col, vec3(.98, .5, .24), sLow * pow(saz, 3.) * exp(-max(h, 0.) * 5.) * .8);
  col = mix(col, vec3(.55, .42, .55), sLow * (1. - saz) * exp(-max(h, 0.) * 4.) * .25);
  col += sUp * sunc * (smoothstep(.99982, .99990, sd) * 2.4 + pow(sd, 500.) * 1.2 + pow(sd, 40.) * .32 + pow(sd, 5.) * .1);
  if (h > 0.) {
    vec2 uv = d.xz / (h + .08);
    vec2 q = uv * .9 + vec2(uTime * .006, uTime * .0025);
    float n = fbm(q), n2 = fbm(q * 2.7 + 3.1 + uTime * .004);
    float cov = smoothstep(.44, .76, n + .18 * n2) * (1. - .55 * sLow);
    float thick = smoothstep(.55, .95, n + .25 * n2);
    vec3 lit = mix(vec3(1., .985, .955), vec3(1., .9, .75), pow(sd, 3.) * .5);
    lit = mix(lit, vec3(1., .58, .38), sLow * (.35 + .5 * pow(saz, 2.)));
    vec3 cc = mix(lit, vec3(.70, .72, .76), thick * .75);
    cc = mix(cc, vec3(.12, .14, .20), uNight * (1. - .55 * sLow));
    col = mix(col, cc, cov * smoothstep(0., .07, h) * .95);
    if (uNight > .01) { vec2 sp = d.xz / (h + .3) * 260.; float st = step(.997, h21(floor(sp))); col += vec3(st) * uNight * (1. - cov) * smoothstep(.05, .3, h) * .8; }
  }
  col += sUp * sunc * (pow(sd, 60.) * .3 + pow(sd, 900.) * .9);          // quầng mặt trời xuyên qua mây
  col = mix(col, uHor, smoothstep(.035, -.01, h));
  gl_FragColor = vec4(col, 1.);
}` }));
sky.renderOrder = -10; sky.frustumCulled = false; sky.scale.setScalar(1000); scene.add(sky);

// mặt đất ngoài khung: cùng ánh sáng Lambert với địa hình, màu ruộng – làng biến thiên theo nhiễu
const GROUND_GLSL = `
varying vec2 vGP; varying float vGY;
float gh(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(gh(i), gh(i + vec2(1., 0.)), f.x), mix(gh(i + vec2(0., 1.)), gh(i + vec2(1., 1.)), f.x), f.y); }
float gf(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * gn(p); p = p * 2.03 + vec2(3.1, 7.7); a *= .5; } return s; }
vec3 groundCol(vec2 p, float y){
  float big = gf(p / 7000.), mid = gf(p / 1500. + 11.), vil = gf(p / 520. + 4.2), fine = gn(p / 90.);
  vec3 c = mix(vec3(.51, .49, .38), vec3(.63, .61, .48), big);
  c = mix(c, vec3(.47, .50, .33), smoothstep(.5, .72, mid) * .6);
  c = mix(c, vec3(.31, .35, .23), smoothstep(.66, .8, vil) * .85);
  c *= .93 + .14 * fine;
#ifdef FOREST
  vec3 f = mix(vec3(.33, .38, .27), vec3(.42, .45, .33), gf(p / 900.));
  c = mix(c, f, smoothstep(H0 + 12., H0 + 140., y));
#endif
  return pow(c, vec3(2.2));
}`;
function groundMaterial(forest, h0) {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  if (forest) m.defines = { FOREST: "", H0: h0.toFixed(2) };
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vGP; varying float vGY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 gwp = modelMatrix * vec4(transformed, 1.0); vGP = gwp.xz; vGY = gwp.y;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + GROUND_GLSL)
      .replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= groundCol(vec2(vGP.x, -vGP.y), vGY);");
  };
  return m;
}
function hash2(i, j) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm2(x, y, o = 5) { let s = 0, a = 0.5; for (let k = 0; k < o; k++) { s += a * vnoise(x, y); x = x * 2.03 + 1.7; y = y * 2.03 + 9.2; a *= 0.5; } return s; }
const smooth = (a, b, v) => { const t = Math.min(Math.max((v - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

function buildSurroundings() {
  const { x0, y0, cell, nx, ny, h } = mainField, x1 = x0 + (nx - 1) * cell, y1 = y0 + (ny - 1) * cell;
  const bz = [];
  for (let i = 0; i < nx; i++) bz.push(h[i], h[(ny - 1) * nx + i]);
  for (let j = 0; j < ny; j++) bz.push(h[j * nx], h[j * nx + nx - 1]);
  bz.sort((a, b) => a - b);
  const h0 = Math.max(bz[bz.length >> 1], meta.water + 1.5);
  const cx = (X) => Math.min(Math.max(X, x0), x1), cy = (Y) => Math.min(Math.max(Y, y0), y1);
  const outD = (X, Y) => Math.hypot(X - cx(X), Y - cy(Y));
  const apronZ = (X, Y) => { const e = sampleField(mainField, cx(X), cy(Y)); return e + (h0 - e) * smooth(0, 2600, outD(X, Y)); };
  outerZ = apronZ;
  // lưới vành ngoài: cột/hàng trong khung trùng đúng lưới địa hình nên mép khớp tuyệt đối, ra xa thưa dần tới 150 km
  const OFF = [20, 50, 100, 180, 300, 480, 750, 1100, 1600, 2300, 3300, 4700, 6700, 9500, 13500, 19000, 27000, 38000, 54000, 76000, 110000, 150000];
  const xs = [...OFF.map((o) => x0 - o).reverse(), ...Array.from({ length: nx }, (_, i) => x0 + i * cell), ...OFF.map((o) => x1 + o)];
  const ys = [...OFF.map((o) => y0 - o).reverse(), ...Array.from({ length: ny }, (_, j) => y0 + j * cell), ...OFF.map((o) => y1 + o)];
  const NX = xs.length, a0 = OFF.length, ax1 = OFF.length + nx - 1, ay1 = OFF.length + ny - 1;
  const pos = [], idx = [], vmap = new Map();
  const vid = (i, j) => {
    const k = j * NX + i; let v = vmap.get(k);
    if (v === undefined) { v = pos.length / 3; vmap.set(k, v); pos.push(xs[i], apronZ(xs[i], ys[j]), -ys[j]); }
    return v;
  };
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < NX - 1; i++) {
    if (i >= a0 && i < ax1 && j >= a0 && j < ay1) continue;
    const a = vid(i, j), b = vid(i + 1, j), c = vid(i, j + 1), d = vid(i + 1, j + 1);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1)); g.computeVertexNormals();
  const apron = new THREE.Mesh(g, groundMaterial(false, h0)); apron.name = "NenChanTroi"; world.add(apron);

  // sông kéo dài ra ngoài khung
  const inR = (X, Y) => X > x0 && X < x1 && Y > y0 && Y < y1;
  const riverZ = (X, Y) => Math.max(meta.water + (h0 + 0.6 - meta.water) * smooth(0, 2600, outD(X, Y)), apronZ(X, Y) + 0.6);
  const cross = (pin, pout) => { let lo = 0, hi = 1; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (inR(pin[0] + (pout[0] - pin[0]) * m, pin[1] + (pout[1] - pin[1]) * m)) lo = m; else hi = m; } return [pin[0] + (pout[0] - pin[0]) * hi, pin[1] + (pout[1] - pin[1]) * hi]; };
  const extend = (pts, seed) => {
    const E = pts[pts.length - 1]; let k = pts.length - 1;
    while (k > 0 && Math.hypot(pts[k][0] - E[0], pts[k][1] - E[1]) < 1500) k--;
    const hd0 = Math.atan2(E[1] - pts[k][1], E[0] - pts[k][0]), out = []; let X = E[0], Y = E[1];
    for (let s = 250; s <= 90000; s += 250) {
      const hd = hd0 + 0.5 * Math.sin(s / 5200 + seed) * Math.min(1, s / 6000) + 0.25 * Math.sin(s / 1900 + 2 * seed) * Math.min(1, s / 3000);
      X += Math.cos(hd) * 250; Y += Math.sin(hd) * 250; out.push([X, Y]);
    }
    return out;
  };
  const RIV = (P.terrain.riverExtend || []).map(([n, e, c]) => [n, e, new THREE.Color(...c)]);
  for (const [name, ext, col] of RIV) {
    const R = D.rivers && D.rivers[name]; if (!R) continue;
    let P = []; for (let i = 0; i < R.p.length; i += 2) P.push([R.p[i], R.p[i + 1]]);
    if (ext[0]) P = [...extend([...P].reverse(), 1.3).reverse(), ...P];
    if (ext[1]) P = [...P, ...extend(P, 4.1)];
    const runs = []; let run = null;
    for (let i = 0; i < P.length; i++) {
      const out = !inR(P[i][0], P[i][1]);
      if (out) { if (!run) { run = []; if (i > 0) run.push(cross(P[i - 1], P[i])); } run.push(P[i]); }
      else if (run) { run.push(cross(P[i], P[i - 1])); runs.push(run); run = null; }
    }
    if (run) runs.push(run);
    const rp = [], ri = [];
    for (const r of runs) {
      if (r.length < 2) continue;
      const base = rp.length / 3;
      for (let i = 0; i < r.length; i++) {
        const a = r[Math.max(0, i - 1)], b = r[Math.min(r.length - 1, i + 1)];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
        const far = outD(r[i][0], r[i][1]), w = R.w * (1 + 0.25 * smooth(3000, 40000, far)) / 2, Z = riverZ(r[i][0], r[i][1]);
        rp.push(r[i][0] - ty * w, Z, -(r[i][1] + tx * w), r[i][0] + ty * w, Z, -(r[i][1] - tx * w));
        if (i > 0) { const p = base + (i - 1) * 2; ri.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); }
      }
    }
    if (!ri.length) continue;
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ri);
    const nrm = new Float32Array(rp.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1; rg.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    world.add(new THREE.Mesh(rg, new THREE.MeshPhongMaterial({ color: col, shininess: 80, specular: 0x6a7a80, side: THREE.DoubleSide })));
  }

  // núi xa làm phông chiều sâu: Ba Vì (tây), Tam Đảo (bắc), Sóc Sơn, cụm núi đá vôi phía nam — vị trí tương đối, chỉ để định hướng
  const ridge = (X, Y, mx, my, ang, a, b, peak, seed) => {
    const dx = X - mx, dy = Y - my, c = Math.cos(ang), s = Math.sin(ang), u = (dx * c + dy * s) / a, v = (-dx * s + dy * c) / b;
    const gg = Math.exp(-(u * u + v * v) * 1.6), rr = 1 - Math.abs(vnoise(X / 2600 + seed, Y / 2600) * 2 - 1);
    return peak * gg * (0.55 + 0.45 * fbm2(X / 5200 + seed, Y / 5200 - seed, 4)) * (0.8 + 0.35 * rr);
  };
  const FM = P.terrain.farMountains || {}, M = [];
  for (const r of FM.ridges || []) M.push([r.c[0], r.c[1], r.half, r.step, (X, Y) => ridge(X, Y, r.c[0], r.c[1], r.ang, r.a, r.b, r.peak, r.seed)]);
  for (const K of FM.karst || []) {
    const karst = []; for (let k = 0; k < K.n; k++) karst.push([K.c[0] + (hash2(k, 3) - 0.5) * K.spread[0], K.c[1] + (hash2(k, 7) - 0.5) * K.spread[1], K.peak[0] + K.peak[1] * hash2(k, 11), K.rad[0] + K.rad[1] * hash2(k, 13)]);
    M.push([K.c[0], K.c[1], K.half, K.step, (X, Y) => { let z = 0; for (const [kx, ky, pk, rad] of karst) { const r2 = ((X - kx) ** 2 + (Y - ky) ** 2) / (rad * rad); z = Math.max(z, pk * Math.exp(-r2 * 2) * (0.8 + 0.4 * vnoise(X / 300, Y / 300))); } return z; }]);
  }
  const fmat = groundMaterial(true, h0);
  for (const [mx, my, half, step, fn] of M) {
    const n = Math.round((2 * half) / step) + 1, mp = new Float32Array(n * n * 3), mi = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const X = mx - half + i * step, Y = my - half + j * step, k = (j * n + i) * 3;
      mp[k] = X; mp[k + 1] = h0 - 25 + fn(X, Y); mp[k + 2] = -Y;
      if (i < n - 1 && j < n - 1) { const a = j * n + i; mi.push(a, a + 1, a + n, a + 1, a + n + 1, a + n); }
    }
    const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.BufferAttribute(mp, 3)); mg.setIndex(mi); mg.computeVertexNormals();
    scene.add(new THREE.Mesh(mg, fmat));
  }
}

let nightCur = 0;
function envTick(dt, nightTarget) {
  nightCur += (nightTarget - nightCur) * Math.min(1, dt * 1.2);
  applyEnv(nightCur); skyU.uTime.value += dt;
  sky.position.copy(camera.position);
  const d = camera.position.distanceTo(controls.target);
  scene.fog.near = Math.max(W.on ? 400 : 4000, d * 0.9); scene.fog.far = scene.fog.near + Math.max(80000, d * 3);
}
function applyEnv(n) {
  _c1.copy(DAY.hor).lerp(NIGHT.hor, n); scene.fog.color.copy(_c1); scene.background.copy(_c1);
  _c1.getRGB(_rgb, THREE.SRGBColorSpace); skyU.uHor.value.set(_rgb.r, _rgb.g, _rgb.b);
  _c2.copy(DAY.top).lerp(NIGHT.top, n); _c2.getRGB(_rgb, THREE.SRGBColorSpace); skyU.uTop.value.set(_rgb.r, _rgb.g, _rgb.b);
  skyU.uNight.value = n;
  hemi.intensity = 1.35 + (0.42 - 1.35) * n; sun.intensity = 1.9 + (0.28 - 1.9) * n; sun.color.copy(DAY.sun).lerp(NIGHT.sun, n);
  troiApply(n);
}

// ------------------------------------------------------------------ lớp hướng: mũi tên tiến công 3D theo bản đồ diễn biến
const arrowGroup = new THREE.Group(); scene.add(arrowGroup);
const ARR = new Map();
let S = null, arrowState = "none";
const llXY = (lat, lon) => [(lon - meta.lon0) * meta.kx, (lat - meta.lat0) * meta.ky];
function arrowTris(def, grow) {
  const w = def.w || 220, dashed = def.c !== "red";
  const curve = new THREE.CatmullRomCurve3(def.pts.map(([la, lo]) => { const [X, Y] = llXY(la, lo); return new THREE.Vector3(X, 0, Y); }), false, "centripetal");
  const L = curve.getLength(), n = Math.max(8, Math.round(L / 45)), P = curve.getSpacedPoints(n);
  const headL = Math.min(w * 2.2, L * 0.35), shaftEnd = L - headL, dash = w * 1.5, lift = 14 * Math.max(1, EX * 0.7);
  const zAt = (X, Y, half, nx, ny) => Math.max(heightAt(X, Y), heightAt(X + nx * half, Y + ny * half), heightAt(X - nx * half, Y - ny * half)) * EX + lift;
  const out = [];
  const edge = (p, t, half) => { const nx = -t.z, ny = t.x, Z = zAt(p.x, p.z, half, nx, ny); return [[p.x + nx * half, Z, -(p.z + ny * half)], [p.x - nx * half, Z, -(p.z - ny * half)]]; };
  for (let i = 0; i < n; i++) {
    const s0 = (i / n) * L, s1 = ((i + 1) / n) * L; if (s0 >= shaftEnd) break;
    if (dashed && Math.floor((s0 + s1) / 2 / dash) % 2 === 1) continue;
    const t0 = curve.getTangentAt(i / n), t1 = curve.getTangentAt(Math.min((i + 1) / n, shaftEnd / L));
    const pB = s1 > shaftEnd ? curve.getPointAt(shaftEnd / L) : P[i + 1];
    const hw0 = w * 0.42 * (0.6 + 0.4 * Math.min(1, s0 / (w * 4))) + grow, hw1 = w * 0.42 * (0.6 + 0.4 * Math.min(1, s1 / (w * 4))) + grow;
    const [a, b] = edge(P[i], t0, hw0), [c, d] = edge(pB, t1, hw1);
    out.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const tb = curve.getTangentAt(shaftEnd / L), pb = curve.getPointAt(shaftEnd / L), tip = curve.getPointAt(1), te = curve.getTangentAt(1);
  const hw = w * 0.95 + grow * 1.6, [l, r] = edge(pb.clone().addScaledVector(tb, -grow), tb, hw);
  const tp = tip.clone().addScaledVector(te, grow * 1.8), tz = zAt(tp.x, tp.z, 1, 0, 0);
  out.push(...l, ...r, tp.x, tz, -tp.z);
  return new Float32Array(out);
}
function buildArrows() {
  if (!S || !S.arrows) return;
  for (const A of ARR.values()) { arrowGroup.remove(A.g); A.g.traverse((o) => o.geometry && o.geometry.dispose()); }
  for (const id in S.arrows) {
    const def = S.arrows[id], red = def.c === "red", g = new THREE.Group(), old = ARR.get(id);
    const mk = (grow, color, op, ro) => {
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(arrowTris(def, grow), 3));
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      m.renderOrder = ro; m.frustumCulled = false; g.add(m); return m;
    };
    const w = def.w || 220;
    mk(w * 0.09, 0x140b06, 0.5, 5); mk(0, red ? 0xd8392b : 0x2f86e8, 0.9, 6);
    arrowGroup.add(g);
    ARR.set(id, { def, g, p: old ? old.p : 0 });
  }
  applyArrowProgress();
}
function applyArrowProgress() {
  const act = new Set((S && S.states && S.states[arrowState]) || []);
  for (const [id, A] of ARR) {
    if (!act.has(id)) A.p = 0;
    A.g.visible = act.has(id) && A.p > 0;
    for (const m of A.g.children) { const n = m.geometry.attributes.position.count / 3; m.geometry.setDrawRange(0, Math.floor(A.p * n) * 3); }
  }
}
function arrowTick(dt) {
  if (!ARR.size) return;
  const act = (S.states && S.states[arrowState]) || [];
  let ch = false;
  for (const id of act) { const A = ARR.get(id); if (A && A.p < 1) { A.p = reduceMotion ? 1 : Math.min(1, A.p + dt / 2.4); ch = true; } }
  if (ch) applyArrowProgress();
}
function setArrowState(st) {
  if (st === arrowState) return;
  arrowState = st; applyArrowProgress();
  const leg = $("mmLeg"); leg.replaceChildren();
  const txt = S && S.legend && S.legend[st];
  if (txt && st !== "none") {
    const ids = (S.states[st] || []).map((i) => S.arrows[i]);
    if (ids.some((d) => d && d.c === "red")) { const i = document.createElement("i"); i.className = "r"; leg.append(i); }
    if (ids.some((d) => d && d.c !== "red")) { const i = document.createElement("i"); i.className = "b"; leg.append(i); }
    leg.append(txt);
  } else leg.append("Bấm để bay tới · chấm vàng là vị trí đang xem");
  $("legNow").textContent = txt && st !== "none" ? "Đang hiển thị: " + txt : "";
}
$("ly-arr").addEventListener("change", (e) => { arrowGroup.visible = e.target.checked; });


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
    enable(v) { on = v; },   // V10.6: âm nền thật nằm ở js_amthanh10 (amEnable); bộ tạo tiếng tổng hợp V6 đã bỏ
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
const BATTLE = {};
let boomT = 2;
function audioTick(dt, night, state, live) {
  if (!audio.on) return;
  const battle = live ? BATTLE[state] || 0 : 0;
  audio.set({ wind: W.on ? 0.35 : 0.22, birds: 0, insects: night * 0.6, battle: 0, drum: 0 });
  audio.tick(dt);
  if (false) {
    boomT -= dt;
    if (boomT < 0) { boomT = 0.7 + (Math.random() * 3) / battle; audio.boom(500 + Math.random() * 2500, 0.6 + Math.random() * 0.8); if (Math.random() < 0.6) audio.gun(150 + Math.random() * 700); }
  }
}

// ------------------------------------------------------------------ lời bình: giọng tiếng Việt của máy (Web Speech)
const VO = { voice: null, q: 0 };
let voiceOn = true, lastLine = "";
if ("speechSynthesis" in window) {
  const pick = () => { VO.voice = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)) || null; };
  pick(); speechSynthesis.onvoiceschanged = pick;
  // mẹo giữ giọng đọc của Chrome máy tính; trên điện thoại pause/resume làm tắt tiếng nên bỏ
  if (!/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) setInterval(() => { if (speechSynthesis.speaking && !speechSynthesis.paused) { speechSynthesis.pause(); speechSynthesis.resume(); } }, 9000);
}
function voStop() { VO.q = 0; try { speechSynthesis.cancel(); } catch (e) {} }
function speak(tx) {
  if (!voiceOn || !playing || appMode !== "film" || !("speechSynthesis" in window) || VC.el) return;   // có voice thu âm thì không dùng giọng máy
  const clean = tx.replace(/[“”"…·()]/g, " ").replace(/\s+/g, " ").trim(), parts = []; let c = "";
  for (const w of clean.split(/(?<=[.,;:!?])\s+/)) { if ((c + " " + w).trim().length > 130 && c) { parts.push(c); c = w; } else c = (c + " " + w).trim(); }
  if (c) parts.push(c);
  if (speechSynthesis.speaking && VO.q > 2) voStop();
  for (const p of parts) {
    if (!VO.voice) VO.voice = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)) || null;
    const u = new SpeechSynthesisUtterance(p); u.lang = "vi-VN"; if (VO.voice) u.voice = VO.voice; u.rate = 1.04 * Math.min(1.4, speed); u.volume = 1;
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
  return { X, Y, d: k.d, az: k.az, el: k.el, h: k.h || 0 };
}
function poseFrom(q) {
  if (camera.aspect < 1 && q.d < 400) q = { ...q, d: q.d * Math.pow(1 / camera.aspect, 0.75) };   // điện thoại cầm dọc: lùi máy cho đủ khung
  const Z = heightAt(q.X, q.Y) * EX + (q.h || 0), el = (q.el * Math.PI) / 180, a = (q.az * Math.PI) / 180, hh = q.d * Math.cos(el);
  const tgt = new THREE.Vector3(q.X, Z, -q.Y);
  const pos = new THREE.Vector3(q.X + Math.sin(a) * hh, Z + q.d * Math.sin(el), -(q.Y + Math.cos(a) * hh));
  const gz = Math.max(heightAt(pos.x, -pos.z), meta.water) * EX + (q.d < 200 ? 0.5 : 25); if (pos.y < gz) pos.y = gz;   // cận cảnh được xuống sát đất
  return { pos, tgt };
}
function scenePose(i, t) {
  const K = S.scenes[i].keys; if (!K || !K.length) return null;
  if (t <= K[0].t) return poseFrom(keyParams(K[0]));
  for (let k = 0; k < K.length - 1; k++) if (t < K[k + 1].t) {
    if (K[k + 1].cut) return poseFrom(keyParams(K[k]));   // cắt cảnh: giữ góc cũ tới đúng giây cắt
    const A = keyParams(K[k]), B = keyParams(K[k + 1]), u = (t - K[k].t) / (K[k + 1].t - K[k].t), e = 0.35 * u + 0.65 * u * u * (3 - 2 * u);
    const daz = ((B.az - A.az + 540) % 360) - 180;
    return poseFrom({ X: A.X + (B.X - A.X) * e, Y: A.Y + (B.Y - A.Y) * e, d: A.d * Math.pow(B.d / A.d, e), az: A.az + daz * e, el: A.el + (B.el - A.el) * e, h: A.h + (B.h - A.h) * e });
  }
  return poseFrom(keyParams(K[K.length - 1]));
}
function startBlend() { fly = null; dirBlend = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone() }; }
function takeOver() { if (appMode === "film" && !userCam) { userCam = true; $("sret").hidden = false; document.body.classList.remove("cancanh"); markers.visible = true; if (!W.on) { controls.minDistance = 25; controls.maxPolarAngle = Math.PI * 0.47; camera.near = 2; camera.updateProjectionMatrix(); } } }
controls.addEventListener("start", takeOver);
function prepStory() {
  let t = 0; starts = S.scenes.map((sc) => { const s = t; t += sc.dur; return s; }); total = t;
  SUBS = S.scenes.map((sc) => {
    if (sc.subs) return sc.subs.map(([t0, t1, text]) => ({ t0, t1, text }));
    const sents = [];
    for (const para of sc.vo || []) for (const s of para.split(/(?<=[.!?…])\s+/)) if (s.trim()) sents.push(s.trim());
    const tot = sents.reduce((a, s) => a + s.length + 12, 0) || 1; let tt = sc.dur * 0.02; const span = sc.dur * 0.96;
    return sents.map((s) => { const d = ((s.length + 12) / tot) * span, o = { t0: tt, t1: tt + d, text: s }; tt += d; return o; });
  });
  S.scenes.forEach((sc, i) => { if (!i) return; const el = document.createElement("i"); el.style.left = `calc(${(starts[i] / total) * 100}% - 1px)`; $("ticks").append(el); });
  $("scenes").querySelector("h3").textContent = `${S.scenes.length} cảnh · ${P.storyLabel || "kịch bản"}`;
  S.scenes.forEach((sc, i) => {
    const li = document.createElement("li"), b = document.createElement("button"), n = document.createElement("b"), sm = document.createElement("small");
    n.textContent = sceneNo(i); sm.textContent = `${fmtT(starts[i])} · ${sc.date || ""} · ${sc.place || ""}`;
    b.append(n, sc.title, sm); b.onclick = () => { goScene(i); $("scenes").hidden = true; };
    li.append(b); $("slist").append(li);
    for (const sel of [$("cmpA"), $("cmpB")]) { const o = document.createElement("option"); o.value = i; o.textContent = `${sceneNo(i)} · ${sc.date || sc.title}`; sel.append(o); }
  });
  $("dslider").max = S.scenes.length - 1;
  const first = (stt) => S.scenes.findIndex((sc) => sc.state === stt);
  const CMP = (P.ui && P.ui.compare) || [];
  cmpA = Math.max(0, first(CMP[0])); cmpB = S.scenes.length - 1;
  for (let i = S.scenes.length - 1; i >= 0; i--) if (S.scenes[i].state === CMP[1]) { cmpB = i; break; }
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
  emit("scene", cur, sc);
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
  vcGuard();
  if (!S || appMode !== "film") return 0;
  let sc = S.scenes[cur];
  if (playing && vcTick()) sc = S.scenes[cur];
  else if (playing) {
    st += dt * speed;
    if (st >= sc.dur) {
      if (cur < S.scenes.length - 1) { cur++; st = 0; onScene(); sc = S.scenes[cur]; }
      else { st = sc.dur; setPlaying(false); }
    }
  }
  if (!userCam) {
    const P = scenePose(cur, tCu(cur, Math.min(st, sc.dur)));
    if (P) {
      if (dirBlend) {
        const k = Math.min((performance.now() - dirBlend.t0) / 1500, 1), e = k * k * (3 - 2 * k);
        P.pos.lerpVectors(dirBlend.p0, P.pos, e); P.tgt.lerpVectors(dirBlend.q0, P.tgt, e);
        if (k >= 1) dirBlend = null;
      }
      camera.position.copy(P.pos); controls.target.copy(P.tgt);
      const dn = THREE.MathUtils.clamp(P.pos.distanceTo(P.tgt) * 0.04, 0.05, 2);       // mặt phẳng gần co theo khoảng cách
      if (Math.abs(camera.near - dn) > 0.01) { camera.near = dn; camera.updateProjectionMatrix(); }
      controls.minDistance = 0.3; controls.maxPolarAngle = Math.PI * 0.499;
      const cc = P.pos.distanceTo(P.tgt) < 260; if (cc !== document.body.classList.contains("cancanh")) { document.body.classList.toggle("cancanh", cc); markers.visible = !cc; arrowGroup.visible = !cc && $("ly-arr").checked; }
    }
  }
  updStoryUI(false);
  if (sc.nights) { const N = sc.nights, t = tCu(cur, Math.min(st, sc.dur)); for (let k = 0; k < N.length - 1; k++) if (t <= N[k + 1][0]) { const e = (t - N[k][0]) / Math.max(1e-6, N[k + 1][0] - N[k][0]); return N[k][1] + (N[k + 1][1] - N[k][1]) * e; } return N[N.length - 1][1]; }
  const n0 = sc.night || 0, n1 = sc.night_end !== undefined ? sc.night_end : n0;
  return n0 + (n1 - n0) * Math.min(1, st / sc.dur);
}
function addEl(parent, tag, text, cls) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; parent.append(e); return e; }
const docsIndex = () => (appMode === "explore" ? exploreI : appMode === "compare" ? cmpB : cur);
function fillDocs() {
  const i = docsIndex(), sc = S.scenes[i], el = $("docsbody"); el.replaceChildren();
  addEl(el, "div", `${sceneNo(i)} · ${sc.place || ""}`, "eyebrow");
  addEl(el, "h2", sc.title);
  if (sc.date) addEl(el, "p", sc.date, "muted small");
  if (sc.vo && sc.vo.length) { addEl(el, "h4", "Lời bình"); for (const p of sc.vo) addEl(el, "p", p); }

  if (S.refs && S.refs.length) {
    addEl(el, "h4", "Tư liệu đối chiếu"); const ul = addEl(el, "ul");
    for (const [t, u] of S.refs) { const li = addEl(ul, "li"), a = addEl(li, "a", t); a.href = u; a.target = "_blank"; a.rel = "noopener"; }
  }
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
function roleStart(role) {
  const at = (n, dx, dy) => { const A = anchors.get(n); return A ? [A.X + dx, A.Y + dy] : [0, 0]; };
  const R = (P.roles || {})[role] || Object.values(P.roles || {})[0], s = R && R.start;
  return s ? at(s[0], s[1] || 0, s[2] || 0) : [0, 0];
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
  W.moving = m > 0.05; W.runNow = run;
  camera.getWorldDirection(camF); camF.y = 0; camF.normalize(); camR.set(-camF.z, 0, camF.x);
  mv.set(0, 0, 0).addScaledVector(camF, f).addScaledVector(camR, r);
  const old = W.pos.clone();
  if (m > 0.05) {
    mv.normalize(); const sp = run ? 6 : 1.8;
    let X = W.pos.x + mv.x * sp * dt * m, Y = -(W.pos.z + mv.z * sp * dt * m); [X, Y] = clampXY(X, Y);
    W.pos.set(X, groundY(X, Y), -Y); W.yaw = Math.atan2(mv.x, mv.z);
    W.phase += dt * (run ? 11 : 7) * m;

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
    const sc = S.scenes[i]; applyEnv(sceneNight(sc)); showArrowsFor(sc.state); nvApply(i, 1, performance.now() / 1000);
    if (!$("ly-arr").checked) arrowGroup.visible = false;
    renderer.setScissor(x0, 0, ww, h); renderer.render(scene, camera);
  }
  renderer.setScissorTest(false); applyEnv(keep);
}

// ------------------------------------------------------------------ chế độ, menu, phím tắt
function setAppMode(m) {
  const pov = m === "pov" && !!S; if (m === "pov") m = "film";
  if (m === "film" && !S) m = "explore";
  if (m !== "explore" && W.on) setWalk(false);
  const prev = appMode; appMode = m;
  document.body.classList.remove("m-film", "m-explore", "m-compare", "m-pov"); document.body.classList.add("m-" + m); document.body.classList.toggle("m-pov", pov);
  $("povbar").hidden = !pov; povSet(pov);
  document.querySelectorAll("#modes button").forEach((b) => { const on = b.dataset.m === (pov ? "pov" : m); b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
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
$("bsnd").onclick = (e) => { e.currentTarget.classList.remove("hint"); audio.enable(!audio.on); amEnable(audio.on); e.currentTarget.classList.toggle("on", audio.on); e.currentTarget.textContent = audio.on ? "🔊 Âm thanh" : "🔇 Âm thanh"; };
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
const glbOf = (f) => gltfLoader.loadAsync(U(f));
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
SIDES.forEach((s, k) => { if (s.flag) NV_VK[5 + k] = { geo: CO_CAN, flag: coGeo(), fmat: coMat(U(s.flag)), tip: 2.5 }; });
const sideOf = (kind) => (UNITS[kind] && UNITS[kind].side) || 0;
const flagW = (side) => (NV_VK[5 + side] ? 5 + side : 5);
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
  const CB = PROPS.pontoonBridge; if (!CB) return;
  const A = CB.a, B = CB.b, L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L, s0 = 0, s1 = L;
  const top = meta.water + 0.75, n = Math.ceil((s1 - s0) / (CB.step || 5.5)), yaw = Math.atan2(dx, -dy);
  const thuyen = new THREE.InstancedMesh(new THREE.BoxGeometry(7.4, 1.1, 2.2), new THREE.MeshLambertMaterial({ color: 0x2e2118 }), n);
  const van = new THREE.InstancedMesh(new THREE.BoxGeometry(4.4, 0.16, 5.6), new THREE.MeshLambertMaterial({ color: 0xc9a46c }), n);
  const q = new THREE.Quaternion().setFromAxisAngle(_nY, yaw), one = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let k = 0; k < n; k++) {
    const s = s0 + (k + 0.5) * (s1 - s0) / n, x = A[0] + dx * s, y = A[1] + dy * s;
    p.set(x, (meta.water + 0.15) * EX, -y); thuyen.setMatrixAt(k, M.compose(p, q, one));
    p.set(x, (top - 0.06) * EX, -y); van.setMatrixAt(k, M.compose(p, q, one));
  }
  for (const m of [thuyen, van]) { m.frustumCulled = false; scene.add(m); }
  if (window.NHDD) { const NHDD = window.NHDD; NHDD.nvb = () => NV.bridge; NHDD.anc = (id) => NV.anchor[id]; NHDD.h = (x, y) => heightAt(x, y); NHDD.NV = NV; NHDD.camAt = (id, dx, dy, z, tz) => { const A = NV.anchor[id]; NHDD.cam(A.X + dx, A.Y + dy, A.y / EX + z, A.X, A.Y, A.y / EX + tz); }; NHDD.arr = () => [arrowGroup.visible, arrowGroup.position.y, camera.position.y, arrowGroup.children.length, arrowGroup.children.filter((c) => c.visible).length, typeof arrowState !== "undefined" ? arrowState : ""]; }
  const O = CB.origin || A, sA = Math.hypot(A[0] - O[0], A[1] - O[1]), inst = [];
  for (let k = 0; k < n; k++) inst.push(s0 + (k + 0.5) * (s1 - s0) / n);
  NV.bridge = { A, dx, dy, s0, s1, top, sA, inst, thuyen, van, yaw, cat: false };
}
// ------------------------------------------------------------------ trại Hà Hồi (ngoài khung, minh hoạ): lều vải, rào gỗ vòng ngoài, cổng phía nam
function nvTraiHaHoi() { for (const T of PROPS.outerCamps || []) nvTrai(T); }
function nvTrai(TR) {
  const C = TR.c; let r0 = TR.seed || 4242;
  const rnd = () => ((r0 = (r0 * 16807) % 2147483647) / 2147483647);
  const leu = []; while (leu.length < (TR.tents || 46)) { const r = TR.r[0] + (TR.r[1] - TR.r[0]) * Math.sqrt(rnd()), a = rnd() * 6.283; const x = C[0] + r * Math.cos(a), y = C[1] + r * Math.sin(a); if (leu.every(([px, py]) => Math.hypot(px - x, py - y) > 7.5)) leu.push([x, y, rnd() * 3]); }
  const tg = new THREE.ConeGeometry(2.6, 2.7, 4).rotateY(Math.PI / 4).translate(0, 1.35, 0), tm = new THREE.MeshLambertMaterial({ color: 0xd8ccb0 });
  const T = new THREE.InstancedMesh(tg, tm, leu.length), M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  leu.forEach(([x, y, a], k) => { q.setFromAxisAngle(_nY, a); p.set(x, nvGround(x, y), -y); T.setMatrixAt(k, M.compose(p, q, one)); });
  const FR = TR.fence || 92, posts = []; for (let a = 0; a < 6.283; a += 3 / FR) if (TR.gate === undefined || Math.abs(a - TR.gate) > 0.09) posts.push(a);
  const P = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 2.6, 0.22).translate(0, 1.3, 0), new THREE.MeshLambertMaterial({ color: 0x5b4330 }), posts.length);
  posts.forEach((a, k) => { const x = C[0] + FR * Math.cos(a), y = C[1] + FR * Math.sin(a); q.identity(); p.set(x, nvGround(x, y), -y); P.setMatrixAt(k, M.compose(p, q, one)); });
  for (const m of [T, P]) { m.frustumCulled = false; scene.add(m); }
}
// cờ Thanh cắm ở doanh trại: [tên, cảnh đầu, cảnh cuối, các vị trí]; ẩn khi doanh trại đã mất
function nvDiem(at) {                                         // danh sách điểm [x, y] theo mô tả trong gói
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
    const pole = new THREE.InstancedMesh(CO_CAN, NV_VKMAT, P.length), fl = new THREE.InstancedMesh(W_.flag, W_.fmat, P.length);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(3.2, 3.2, 3.2);
    P.forEach(([x, y], k) => { q.setFromAxisAngle(_nY, 0.6 + k); p.set(x, nvGround(x, y) + 1.25 * 3.2, -y); M.compose(p, q, s); pole.setMatrixAt(k, M); fl.setMatrixAt(k, M); });
    for (const m of [pole, fl]) { m.frustumCulled = false; scene.add(m); }
    return { a: cf.from, b: cf.to, ms: [pole, fl] };
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
// pin tên nhân vật: nhãn nổi trên đầu Quang Trung, các tướng Tây Sơn, Tôn Sĩ Nghị, Sầm Nghi Đống
const NV_TEN = { box: null, pool: [] };
function nvTenVe() {
  if (!NV_TEN.box) {
    NV_TEN.box = document.createElement("div"); NV_TEN.box.id = "nvten"; document.body.append(NV_TEN.box);
    const st = document.createElement("style");
    st.textContent = "#nvten{position:fixed;inset:0;pointer-events:none;z-index:4}#nvten div{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center}" +
      "#nvten b{font:600 12px/1.2 var(--font,system-ui);color:#fff3d6;background:rgba(122,31,22,.88);border:1px solid #e2b768;border-radius:99px;padding:3px 9px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.45)}" +
      "#nvten div.th b{background:rgba(24,52,96,.88);border-color:#9fc0ea}#nvten div.vua b{background:rgba(150,104,24,.92);border-color:#ffe08a;font-size:13px}" +
      "#nvten i{width:1.5px;height:16px;background:#e2b768}body.cinema #nvten,body.m-pov #nvten{}";
    document.head.append(st);
  }
  const L = NV.tenPos, W = innerWidth, H = innerHeight, v = new THREE.Vector3(), on = $("ly-nv").checked && $("ly-lbl").checked;
  let n = 0;
  if (on) for (const [ten, X, y, Y, vua, phe] of L) {
    v.set(X, y, -Y); const d = camera.position.distanceTo(v); v.project(camera);
    if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05 || d > 2500) continue;
    let el = NV_TEN.pool[n];
    if (!el) { el = document.createElement("div"); el.innerHTML = "<b></b><i></i>"; NV_TEN.box.append(el); NV_TEN.pool.push(el); }
    if (el._t !== ten) { el._t = ten; el.firstChild.textContent = ten; el.className = vua ? "vua" : phe ? "th" : ""; }
    el.style.display = ""; el.style.left = ((v.x + 1) / 2) * W + "px"; el.style.top = ((1 - v.y) / 2) * H + "px"; el.style.opacity = d > 1500 ? 0.7 : 1; n++;
  }
  for (let k = n; k < NV_TEN.pool.length; k++) NV_TEN.pool[k].style.display = "none";
}
// đại bác trong đồn: đặt lên mặt lũy (đỉnh lũy gần nhất trong 10 m), có bục gỗ đỡ
function nvNangPhao() {
  const U = (D.inst || {}).usung; if (!U || !PROPS.raiseCannons) return; const bp = [];
  for (let o = 0; o < U.length; o += 5) {
    let best = U[o + 2], bx = U[o], by = U[o + 1];
    for (let a = 0; a < 6.283; a += 0.393) for (let r = 1; r <= 10; r += 1) { const x = U[o] + Math.cos(a) * r, y = U[o + 1] + Math.sin(a) * r, h = heightAt(x, y); if (h > best + 0.05) { best = h; bx = x; by = y; } }
    if (best > U[o + 2] + 0.3) { U[o] += (bx - U[o]) * 0.55; U[o + 1] += (by - U[o + 1]) * 0.55; }
    const g0 = heightAt(U[o], U[o + 1]); U[o + 2] = best + 2.0;           // bục pháo cao hơn rào gỗ trên lũy, nòng chĩa qua rào
    bp.push([U[o], U[o + 1], g0, U[o + 2], U[o + 3]]);
  }
  placeInstances();
  const M = new THREE.InstancedMesh(new THREE.BoxGeometry(3.2, 1, 3.6).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0x6e5236 }), bp.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  bp.forEach(([x, y, z0, z1, a], k) => { q.setFromAxisAngle(_nY, a); p.set(x, z0 * EX, -y); s.set(1, Math.max(0.3, (z1 - z0) * EX), 1); M.setMatrixAt(k, m4.compose(p, q, s)); });
  M.frustumCulled = false; groups.quan.add(M);
}
// dấu X đánh dấu đồn Hà Hồi đã bị hạ (lớp phủ mờ 40%)
function nvDauX() {
  const m = new THREE.MeshBasicMaterial({ color: 0xc0241a, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
  NV.dauX = (PROPS.crossMarks || []).map((X_) => {
    const C = X_.c, sz = X_.size || [250, 34], g = new THREE.Group();
    for (const a of [Math.PI / 4, -Math.PI / 4]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(sz[0], sz[1]).rotateX(-Math.PI / 2), m); b.rotation.y = a; b.renderOrder = 5; g.add(b); }
    g.position.set(C[0], (heightAt(C[0], C[1]) + 4) * EX, -C[1]); g.visible = false; scene.add(g); return { g, from: X_.from, to: X_.to ?? 1e9 };
  });
}
function nvGround(X, Y, cau) {
  let h = Math.max(heightAt(X, Y), meta.water - 0.7);
  const B = NV.bridge;
  if (cau && B) { const rx = X - B.A[0], ry = Y - B.A[1], s = rx * B.dx + ry * B.dy, d = Math.abs(rx * B.dy - ry * B.dx); if (s > B.s0 - 4 && s < B.s1 + 4 && d < 3.5 && !(B.cat && s + B.sA > NV.catcau.gap[0] && s + B.sA < NV.catcau.gap[1])) h = Math.max(h, B.top); }
  return h * EX;
}
async function nvLoad() {
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
const NV_MAU = {}; for (const [k, d] of Object.entries(UNITS)) if (d.tint) NV_MAU[k] = d.tint.map((c) => new THREE.Color(...c));
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
const NV_ALIAS = {}; for (const [k, d] of Object.entries(UNITS)) if (d.alias) NV_ALIAS[k] = d.alias;
const NV_DIDONG = new Set(["chay", "khieng", "buoc", "tuan", "di", "vap"]);
function nvVk(g, k, raw) {                                       // binh khí của thành viên k
  if (raw === "khieng") return 0;
  let w = g.vk ? g.vk[k % g.vk.length] : 0;
  if (!w && g.vk2 && raw !== "dung") w = g.vk2[k % g.vk2.length];
  if (g.duoc && k % g.duoc === 0 && nightCur > 0.35) w = 4;
  if (g.co && k % g.co === (g.co >> 1)) w = flagW(sideOf(g.kind));   // người cầm cờ: cờ đúng phe của mình
  return w;
}
function nvClip(g, K, raw, k, w) {
  let n = (NV_ALIAS[g.kind] || {})[raw] || raw;
  if (n === "danh") n = w === 2 ? "dam" : w === 3 ? (k % 2 ? "chem" : "bua") : "bua";
  if (n === "ngam" && w !== 1) n = w >= 5 ? "dung" : "thu";
  if (w >= 5 && (n === "chem" || n === "bua" || n === "dam" || n === "thu")) n = "dung";    // người cầm cờ không xông vào đánh
  if (n === "nga" && K.clips.nga2 && k % 2) n = "nga2";
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
  const vis = NV.on && $("ly-nv").checked, dur = S && S.scenes[i] ? S.scenes[i].dur_cu || S.scenes[i].dur : 60; NV.torch.length = 0; NV.povAt = null;
  const PT = NV.povT; NV.mocPts = []; NV.tenPos = [];
  NV.cutOn = !!(NV.catcau && ((i === NV.catcau.i && u >= NV.catcau.u) || i > NV.catcau.i)); nvCauCat(NV.cutOn);
  for (const g of NV.groups) {
    for (const im of g.meshes.values()) im.count = 0;
    const stt = vis ? nvState(g, i, u) : null;
    if (!stt || stt.clip === "an") continue;
    const K = NV.kinds[g.kind]; if (!K) continue;
    let cx, cy;
    if (g.mode === "path") [cx, cy] = nvPathAt(g, stt.s); else { cx = g.m[0][0] + stt.ox; cy = g.m[0][1] + stt.oy; }
    const dist = camera.position.distanceTo(_np.set(cx, heightAt(cx, cy) * EX, -cy));
    if (dist > (LOW ? Q_.mobileUnitDrawDist || 3500 : Q_.unitDrawDist || 6000)) continue;
    const sc = THREE.MathUtils.clamp(dist / 450, 1, 2); _ns.set(sc, sc, sc);
    const moveYaw = g.mode === "path" ? null : Math.atan2(stt.mvx, -stt.mvy), near = dist < 1500;
    const hum = !!K.hum, dense = hum && g.dense !== 0, reps = dense && !LOW && dist > 600 && !stt.moving ? 3 : 1, thin = dense && dist < 260 && stt.moving;
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
        const SP = (P.groupFrames || {}).spread || { frame: "", u: [-150, 140], v: 100, jitter: 45 };
        const tg = FRX(SP.frame, SP.u[0] + ph * (SP.u[1] - SP.u[0]), (va / 3 - 0.5) * 2 * SP.v + Math.sin(ph * 77) * SP.jitter), P0 = g.toaP[k];
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
        if (!g.bucY) g.bucY = g.m.map((mm) => {                   // đỉnh lũy trong 9 m phía ngoài; chân lính cao hơn đỉnh lũy 0,15 m để cả nửa người nhô lên, súng chĩa ra ngoài
          const EU = (FRAMES[(P.groupFrames || {}).raise] || { eu: [0, 1] }).eu; let top = 0; for (let d = 0; d <= 9; d += 0.5) top = Math.max(top, heightAt(mm[0] - EU[0] * d, mm[1] - EU[1] * d));
          return Math.max(top + 1.6, heightAt(mm[0], mm[1])) * EX; });     // rào gỗ trên lũy cao 2,7 m: chân lính cao hơn đỉnh lũy 1,6 m để ngực, súng vượt qua rào
        const top = g.bucY[k];
        if (top > gy + 0.1) { const bm = nvMesh(g, "buc", NV_BUC, NV_BUCMAT); _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _ns2.set(1, top - gy, 1); _nm.compose(_np, _nq, _ns2); bm.setMatrixAt(bm.count++, _nm); }
        gy = top;
      }
      if (chim) gy -= Math.min(1.8, (u - NV.catcau.u) * dur * 0.5);
      if (k === 0) NV.anchor[g.id] = { X, Y, yaw, y: gy };
      if (g.ten && g.ten[k] && dist < 2500) NV.tenPos.push([g.ten[k], X, gy + (K.ani ? 3.4 : K.flip ? 5.2 : 2.2), Y, 0, K.side]);
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
            const G = nvGripNgua(K), w = flagW(K.side), fm = _nm2.clone().multiply(G);
            const a = nvMesh(g, "w" + w, NV_VK[w].geo, NV_VKMAT), b = nvMesh(g, "f" + w, NV_VK[w].flag, NV_VK[w].fmat);
            a.setMatrixAt(a.count++, fm); b.setMatrixAt(b.count++, fm);
          }
        }
        if (near && S0.moving && Math.random() < NV.dt * 0.8) fxBui(X, gy, Y, 1.6);
      } else if (K.flip) {
        const C = K.clips[S0.clip] || K.clips.dung, f = nvFrame(C, time, ph, S0.spd, 0);
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw); _nm.compose(_np, _nq, _ns);
        C.frames[f].forEach((geo, pi) => { const im = nvMesh(g, S0.clip + ":" + f + ":" + pi, geo, C.mats[pi]); im.setMatrixAt(im.count++, _nm); });
        if (near && S0.moving && Math.random() < NV.dt * 1.2) fxBui(X, gy, Y, 2.4);
        const RD = UNITS[g.kind] && UNITS[g.kind].rider, KT = RD && NV.kinds[RD.kind];
        if (g.linh && KT && dist < 900) {                         // một lính súng hỏa hồ đứng trên bành voi (cùng nài voi ngồi cổ)
          const cn = RD.aim && i + u > RD.aim[0] && i + u < RD.aim[1] ? "ngam" : "dung", CC = KT.clips[cn], f2 = nvFrame(CC, time, ph, 1, 0);
          _nt.set(...(RD.at || [0, 2.62, -0.15])); _nm2.copy(_nm).multiply(_wm.makeTranslation(_nt.x, _nt.y, _nt.z));
          const im = nvMesh(g, "L" + cn + ":" + f2, CC.frames[f2], CC.mat); im.setMatrixAt(im.count++, _nm2);
          const G = nvGrip(CC, f2, cn === "ngam", cn === "dung" ? 1 : 0), gm = _nm2.clone().multiply(G), wim = nvMesh(g, "Lw1", NV_VK[1].geo, NV_VKMAT); wim.setMatrixAt(wim.count++, gm);
          if (cn === "ngam" && Math.random() < NV.dt * 0.3) { _nt.set(0, NV_VK[1].tip, 0).applyMatrix4(gm); fxShot(_nt); }
        }
      } else {                                                    // tấm mộc ghép
        _np.set(X, gy, -Y); _nq.setFromAxisAngle(_nY, yaw);
        const nam = S0.clip === "nam";
        if (nam) { _nq2.setFromAxisAngle(_nX, -Math.PI / 2); _nq.multiply(_nq2); _np.y += 0.1; }
        else NV.mocPts.push(X, gy, Y, yaw);
        K.parts.forEach((p, pi) => { if (nam && p.pole) return; const im = nvMesh(g, "p" + pi, p.geo, p.mat); _nm.compose(_np, _nq, _ns).multiply(p.M); im.setMatrixAt(im.count++, _nm); });
      }
    }
    for (const im of g.meshes.values()) if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
  }
  // nhân vật chính (pack.json › heroes): đứng trên bành voi / lưng ngựa theo nhóm quân, hoặc đứng đất tại toạ độ
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
  nvTenVe();
}
function nvTick(dt) {
  if (!NV.ok || !S) return;
  NV.dt = dt;
  const time = performance.now() / 1000; let i = 0, u = 1;
  if (appMode === "film") { i = cur; u = uCu(cur, st); }
  else if (appMode === "explore") { i = exploreI; if (NV.exI !== i) { NV.exI = i; NV.ex = 0; } NV.ex += dt; u = (NV.ex % S.scenes[i].dur) / S.scenes[i].dur; }
  else i = cmpA;
  CO_T.value = time;
  if (NV.dauX) for (const X_ of NV.dauX) X_.g.visible = appMode !== "compare" && i + u >= X_.from && i + u < X_.to;
  if (NV.coTrai) { const iu = i + (appMode === "film" ? u : 0); for (const c of NV.coTrai) { const on = $("ly-nv").checked && iu >= c.a && iu <= c.b; c.ms.forEach((m) => { m.visible = on; }); } }
  nvApply(i, u, time);
  if (appMode !== "compare") fxTick(i, u, dt); else fxClear();
  for (const H of NV.heroes || []) H.mixer.update(dt);
  nvAvatarTick();
  povTick(i);
  // V10.3: mũi tên treo trên trời (cao 320 m): nhìn toàn cảnh từ trên cao vẫn thấy, xuống mặt đất thì nằm phía trên, không che quân
  arrowGroup.position.y = NV_MUITEN_CAO;
  arrowGroup.visible = $("ly-arr").checked && !document.body.classList.contains("m-pov") && camera.position.y > NV_MUITEN_CAO + 60;
}
// ------------------------------------------------------------------ góc nhìn nhân vật: nhìn qua mắt một người trong trận, phim vẫn chạy theo lời bình
const NV_MUITEN_CAO = (P.ui && P.ui.arrowHeight) ?? 200;
var POV = null;
// địa điểm đứng xem: [tên, x, y, độ cao mắt so với đất (m)]; hướng nhìn ban đầu quay về đội quân gần nhất đang có trong cảnh
const POV_DD = (P.pov && P.pov.places) || [];
const POV_VAI = (P.pov && P.pov.people) || [];
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
  for (const [gid, k, h, fw] of (POV_VAI[POV.vai] || [0, []])[1]) {
    const HH = (NV.heroes || []).find((x) => x.def.id === gid); if (HH) { if (HH.pos[i]) { pick = { gid, k, h, fw }; break; } continue; }
    const g = NV.groups.find((x) => x.id === gid); if (!g || k >= g.n) continue;
    const s = nvState(g, i, appMode === "film" ? uCu(i, st) : 0.5); if (s && s.clip !== "an") { pick = { gid, k, h, fw }; break; }
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
const FXD = P.fx || {};
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
const NV_DI = {}; for (const [k, r] of Object.entries(P.roles || {})) NV_DI[k] = { kind: r.kind, dung: r.idle || "dung", di: r.walk || "di", chay: r.run || "chay", sp: r.walkSpeed || 1, w: r.weapon || 2 };
function makeAvatar(role) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = NV_DI[role] || Object.values(NV_DI)[0];
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

// ------------------------------------------------------------------ âm thanh nền theo cảnh (V10): dùng file thật trong thư mục AmThanh của anh
// Thay cho tiếng chim, trống, giao tranh tổng hợp của V6 (đã tắt). Gió đêm, côn trùng tổng hợp vẫn giữ làm nền rất nhẹ.
// V10: "thaochay" là file chiến trường tàn sát (dùng lúc xông đồn), "hetxung" là tiếng hét xung trận.
// Hành quân: nhiều lớp tiếng chân (hai file chân, mỗi file phát thêm một lớp lệch nhịp) chồng lên nhau cho dày.
const AM = { ctx: null, out: null, buf: {}, beds: {}, ready: false, next: {}, fired: new Set(), key: "" };
const AM_BED = PA.beds || [];
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
// V10.6: nạp lười – chỉ giải mã file nào cảnh đang cần, lần lượt từng file (điện thoại không bị treo, không ngốn bộ nhớ)
AM.q = []; AM.busy = false; AM.req = new Set();
function amNeed(n) {
  const src = AM_LOP[n] ? AM_LOP[n][0] : n;
  if (AM.buf[src] || AM.req.has(src) || !AM.ctx) return; AM.req.add(src); AM.q.push(src); amPump();
}
async function amPump() {
  if (AM.busy || !AM.q.length) return; AM.busy = true;
  const n = AM.q.shift();
  try {
    const r = await fetch(U((PA.dir || "audio/") + n + ".mp3")); const ab = await r.arrayBuffer();
    AM.buf[n] = await new Promise((ok, no) => AM.ctx.decodeAudioData(ab, ok, no));
  } catch (e) { console.warn("âm thanh", n, e); }
  AM.busy = false; setTimeout(amPump, 30);
}
function amBed(n) {
  if (AM.beds[n]) return AM.beds[n];
  const src = AM_LOP[n] ? AM_LOP[n][0] : n, b = AM.buf[src]; if (!b) { amNeed(n); return null; }
  const s = AM.ctx.createBufferSource(); s.buffer = b; s.loop = true; if (AM_LOP[n]) s.playbackRate.value = AM_LOP[n][1];
  const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.out); s.start(0, Math.random() * b.duration);
  return (AM.beds[n] = g);
}
async function amLoad() { AM.ready = true; for (const n of AM_ONE) amNeed(n); }
function amEnable(on) {
  if (on && !AM.ctx) {
    AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.out = AM.ctx.createGain(); AM.out.gain.value = 0.9; AM.out.connect(AM.ctx.destination);
    amLoad();
  }
  if (AM.ctx) { if (on) AM.ctx.resume(); else AM.ctx.suspend(); }
}
function amShot(n, vol) {
  const b = AM.buf[n]; if (!b || !AM.ready) return;
  const s = AM.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = 0.94 + Math.random() * 0.12;
  const g = AM.ctx.createGain(); g.gain.value = vol; s.connect(g).connect(AM.out); s.start();
}
function amTick(dt) {
  if (!AM.ready || !audio.on || !S) return;
  let i = 0, u = 0, live = true;
  if (appMode === "film") { i = cur; u = uCu(cur, st); live = playing; }
  else if (appMode === "explore") { i = exploreI; u = S.scenes[i] ? (NV.ex % S.scenes[i].dur) / S.scenes[i].dur : 0; }
  else { i = cmpA; u = 1; }
  const plan = amPlan(i, u), k = live ? 1 : 0.25, now = AM.ctx.currentTime;
  const buoc = W.on && W.moving ? (W.runNow ? 0.55 : 0.32) : 0;              // đi bộ trên sa bàn: tiếng chân thật
  if (buoc) plan.buoc_co = Math.max(plan.buoc_co || 0, buoc);
  for (const n in plan) if (plan[n] > 0) amBed(n);
  for (const n in AM.beds) {
    let v = (plan[n] || 0) * k; if (W.on) v *= 0.5; if (n === "buoc_co") v = Math.max(v, buoc);
    AM.beds[n].gain.setTargetAtTime(v, now, 0.8);
  }
  if (!live) return;
  const key = appMode + ":" + i;
  if (key !== AM.key) { AM.key = key; AM.fired.clear(); AM.next = {}; }
  for (const [si, mu, n, v] of AM_MOC) if (si === i && u >= mu && u < mu + 0.08 && !AM.fired.has(si + n + mu)) { AM.fired.add(si + n + mu); amShot(n, v); }
  const t = performance.now() / 1000;
  AM_LAP.forEach(([si, u0, u1, n, v, a, b], j) => {
    if (si !== i || u < u0 || u > u1) return;
    if (!(j in AM.next)) AM.next[j] = t + Math.random() * a;
    if (t >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = t + a + Math.random() * (b - a); }
  });
}
// V10.2: điện thoại (iOS/Android) chỉ cho đọc giọng sau khi gọi speak() ngay trong một lần chạm → đọc một câu rỗng để mở khoá
function voUnlock() {
  if (!("speechSynthesis" in window) || voUnlock.done) return; voUnlock.done = true;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(" "); u.lang = "vi-VN"; u.volume = 0; speechSynthesis.speak(u); speechSynthesis.resume(); } catch (e) {}
  lastLine = "";
}
$("bvo").addEventListener("click", () => { voUnlock(); });
$("splay").addEventListener("click", () => { voUnlock(); lastLine = ""; });
// ------------------------------------------------------------------ V10: vào sa bàn là bật sẵn âm thanh và lời bình (trình duyệt chỉ cho phát sau lần chạm đầu tiên)
{
  const amFirst = (e) => {
    window.removeEventListener("pointerdown", amFirst, true); window.removeEventListener("keydown", amFirst, true);
    if (e && e.target && e.target.closest && e.target.closest("#bsnd")) return;          // bấm thẳng nút âm thanh: để nút tự xử lý
    voUnlock();
    if (!audio.on) { audio.enable(true); amEnable(true); }
    const b = $("bsnd"); b.classList.add("on"); b.classList.remove("hint"); b.textContent = "🔊 Âm thanh";
    lastLine = "";
  };
  window.addEventListener("pointerdown", amFirst, true); window.addEventListener("keydown", amFirst, true);
}

// V10.1: nút bật/tắt mũi tên trên thanh trên cùng, đồng bộ với ô "Mũi tên" trong Lớp
{
  const sync = () => $("barr").classList.toggle("on", $("ly-arr").checked);
  $("barr").onclick = () => { const c = $("ly-arr"); c.checked = !c.checked; c.dispatchEvent(new Event("change")); sync(); };
  $("ly-arr").addEventListener("change", sync);
}
// V10.7: thẻ ghi chú khi bấm vào điểm pin – đặt vào khoảng trống giữa cụm nút phía trên và thanh phim phía dưới, không đè lên nút
{
  const xep = () => {
    const el = $("info"); document.body.classList.toggle("info-mo", !!el && !el.hidden); if (!el || el.hidden) return;
    const top = document.querySelector(".hud.top .right"), bar = ["filmbar", "explorebar", "povbar"].map((id) => $(id)).find((b) => b && !b.hidden);
    const t = top && !document.body.classList.contains("cinema") ? top.getBoundingClientRect().bottom + 8 : 12;
    const b = bar && !document.body.classList.contains("cinema") ? innerHeight - bar.getBoundingClientRect().top + 8 : 12;
    Object.assign(el.style, { top: t + "px", bottom: b + "px", maxHeight: Math.max(120, innerHeight - t - b) + "px", height: "auto", overflowY: "auto", zIndex: 30 });
    if (innerWidth < 700) Object.assign(el.style, { left: "10px", right: "10px", width: "auto", borderRadius: "16px" });
    el.style.bottom = "auto";
  };
  new MutationObserver(xep).observe($("info"), { attributes: true, attributeFilter: ["hidden"] });
  addEventListener("resize", xep);
}
{ const st = document.createElement("style"); st.textContent = "body.info-mo #pad{visibility:hidden}"; document.head.append(st); }
// ------------------------------------------------------------------ V10.4: voice thu âm làm đồng hồ chính của phim
// Thời gian cảnh theo voice (sc.dur); máy quay, đội hình, ngày đêm, hiệu ứng vẫn dựng trên dòng thời gian cũ (sc.dur_cu)
// và được "nắn" qua sc.ban_do = [[giây cũ, giây mới], …] (source/voice_ngochoi.py, apply_voice.py).
function tCu(i, t) {
  const sc = S && S.scenes[i], K = sc && sc.ban_do; if (!K) return t;
  for (let k = 0; k < K.length - 1; k++) if (t <= K[k + 1][1]) { const a = K[k], b = K[k + 1], e = (t - a[1]) / Math.max(1e-6, b[1] - a[1]); return a[0] + (b[0] - a[0]) * e; }
  return K[K.length - 1][0];
}
function uCu(i, t) { const sc = S.scenes[i]; return Math.min(1, Math.max(0, tCu(i, t) / (sc.dur_cu || sc.dur))); }
var VC = { el: null, ok: false, unlocked: false, jump: true };
(async () => {
  try {
    if (!PA.voice) { VC.err = true; return; }
    const r = await fetch(U(PA.voice)); if (!r.ok) { VC.err = true; return; }
    const url = URL.createObjectURL(await r.blob()), a = new Audio(); a.preload = "auto"; a.src = url;   // trang artifact chỉ phát media từ blob:
    a.addEventListener("canplaythrough", () => { VC.ok = true; }, { once: true }); a.addEventListener("loadedmetadata", () => { VC.ok = true; }, { once: true });
    VC.el = a;
  } catch (e) { VC.err = true; console.warn("voice", e); }
})();
const vcDung = () => voiceOn && VC.ok && VC.unlocked && appMode === "film";
function vcGuard() { const a = VC.el; if (a && !a.paused && !(vcDung() && playing)) a.pause(); }
function vcTick() {                                      // true = giây phim lấy theo voice
  const a = VC.el; if (!a || !vcDung() || !S) return false;
  const g = starts[cur] + st;
  a.playbackRate = speed;
  if (VC.jump || (a.paused && Math.abs(a.currentTime - g) > 0.3)) { try { a.currentTime = Math.min(g, a.duration || g); } catch (e) {} VC.jump = false; }
  if (a.paused) { if (!a.ended) a.play().catch(() => { VC.unlocked = false; }); return false; }
  const t = a.currentTime; if (a.ended || t >= total - 0.05) return false;
  let i = cur; while (i < starts.length - 1 && t >= starts[i + 1]) i++; while (i > 0 && t < starts[i]) i--;
  if (i !== cur) { cur = i; onScene(); }
  st = t - starts[i]; return true;
}
{
  const g0 = goScene; goScene = function (...a) { VC.jump = true; return g0.apply(this, a); };
  $("seek").addEventListener("input", () => { VC.jump = true; });
  const mo = () => { VC.unlocked = true; VC.jump = true; };
  window.addEventListener("pointerdown", mo, true); window.addEventListener("keydown", mo, true);
}
window.__vc = () => [VC.ok, VC.unlocked, VC.el ? VC.el.paused : null, VC.el ? +VC.el.currentTime.toFixed(2) : null, +(starts[cur] + st).toFixed(2), voiceOn, playing];
// ------------------------------------------------------------------ V10.6: nút "Bắt đầu xem" – điện thoại chỉ cho phát tiếng trong một lần chạm,
// nên mọi thứ có tiếng (voice, âm nền) được mở ngay trong cú chạm này; phim chờ ở giây 0 tới khi người xem bấm.
{
  const box = document.createElement("div"); box.id = "batdau";
  box.innerHTML = '<button id="bbatdau" disabled hidden>▶ Bắt đầu xem</button><div id="bdtai"><span></span><em><i></i></em></div><small>Phim có lời dẫn thu âm và âm thanh – bấm để bắt đầu</small>';
  document.body.append(box);
  const st_ = document.createElement("style");
  st_.textContent = "#batdau{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(10,8,6,.45);backdrop-filter:blur(2px)}" +
    "#batdau button{font:700 18px var(--font,system-ui);padding:14px 26px;border-radius:99px;border:0;background:var(--gold,#e2b768);color:#23190d;box-shadow:0 6px 24px rgba(0,0,0,.4)}" +
    "#batdau button:disabled{opacity:.7}#batdau button[hidden]{display:none}#bdtai{display:flex;flex-direction:column;align-items:center;gap:8px;color:#f3ead9;font:600 15px var(--font,system-ui);text-shadow:0 1px 3px #000}#bdtai[hidden]{display:none}#bdtai em{display:block;width:220px;height:6px;border-radius:9px;background:rgba(255,255,255,.18);overflow:hidden}#bdtai i{display:block;height:100%;width:0;background:var(--gold,#e2b768);transition:width .3s}#batdau small{color:#f3ead9;text-shadow:0 1px 3px #000;font-size:13px;padding:0 20px;text-align:center}#batdau[hidden]{display:none}";
  document.head.append(st_);
  // V10.9: chỉ hiện nút khi đã tải xong toàn bộ: địa hình + kịch bản, nhân vật (voi, ngựa, lính), lời dẫn thu âm
  const buoc = () => [["Địa hình, kịch bản", !!S], [(P.ui && P.ui.unitsLoading) || "Nhân vật", typeof NV !== "undefined" && NV.ok], ["Lời dẫn thu âm", VC.ok || !!VC.err]];
  const san = () => {
    const B = buoc(), xong = B.filter((x) => x[1]).length, b = $("bbatdau"), t = $("bdtai");
    t.querySelector("span").textContent = xong < B.length ? "Đang tải " + B.find((x) => !x[1])[0].toLowerCase() + "… (" + xong + "/" + B.length + ")" : "";
    t.querySelector("i").style.width = Math.round((100 * xong) / B.length) + "%";
    if (xong === B.length) { b.hidden = false; b.disabled = false; t.hidden = true; return true; }
    return false;
  };
  const iv = setInterval(() => { if (san()) clearInterval(iv); }, 250);
  $("bbatdau").addEventListener("click", () => {
    const a = VC.el;
    if (a) { try { a.currentTime = Math.min(starts[cur] + st, (a.duration || 1) - 0.1); } catch (e) {} const p = a.play(); if (p) p.catch(() => {}); }   // phát ngay trong cú chạm
    VC.unlocked = true; VC.jump = false; voiceOn = true; $("bvo").classList.add("on");
    if (!audio.on) audio.enable(true);
    amEnable(true);
    const b = $("bsnd"); b.classList.add("on"); b.classList.remove("hint"); b.textContent = "🔊 Âm thanh";
    box.hidden = true; setPlaying(true);
  });
  window.batDau = (hien) => { box.hidden = !hien; };
}
$("splay").addEventListener("click", () => {                 // bấm nút Phát cũng là một cú chạm: mở tiếng luôn
  if (!playing) return;
  const a = VC.el; if (a && a.paused) { const p = a.play(); if (p) p.catch(() => {}); }
  VC.unlocked = true; amEnable(audio.on || true); if (!audio.on) audio.enable(true); window.batDau(false);
});
$("modes").addEventListener("click", () => window.batDau(false));

// V10.9: nút Phát ở thanh dưới cũng chỉ bấm được khi đã tải xong
{ const kt = setInterval(() => { const ok = !$("bbatdau").hidden; $("splay").disabled = !ok; if (ok) clearInterval(kt); }, 250); }
// ------------------------------------------------------------------ V10.4: mặt trời theo giờ trong cảnh
// Hướng mặt trời: cảnh tối dần → chiều, lặn phía tây; cảnh sáng dần (tờ mờ → rạng đông) → mọc phía đông; còn lại ban ngày cao phía nam.
// Độ cao mặt trời đi theo độ tối (nightCur): trời càng tối mặt trời càng thấp, quá ~0,6 là đã xuống dưới chân trời.
const TROI = { dir: new THREE.Vector3(), warm: new THREE.Color(1.0, 0.56, 0.3), hz: new THREE.Color(0.9, 0.6, 0.45), c: new THREE.Color() };
function troiHuong() {
  if (!S) return 0;
  const sc = S.scenes[appMode === "explore" ? exploreI : cur]; if (!sc) return 0;
  if (sc.troi !== undefined) return sc.troi;
  const N = sc.nights; if (!N) return (sc.night || 0) > 0.3 ? 1 : 0;
  const a = N[0][1], b = N[N.length - 1][1];
  return b < a - 0.05 ? 1 : b > a + 0.05 ? -1 : a > 0.3 ? 1 : 0;
}
function troiApply(n) {
  if (typeof S === "undefined") return;
  const h = troiHuong(), D = THREE.MathUtils.degToRad;
  const el = D(52 - 66 * Math.min(1, n / 0.78)), az = D(h === 1 ? 105 : h === -1 ? 255 : 160);
  TROI.dir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
  skyU.uSunDir.value.copy(TROI.dir); sun.position.copy(TROI.dir).multiplyScalar(8000);
  const up = THREE.MathUtils.smoothstep(el, -0.2, 0.03), low = up * (1 - THREE.MathUtils.smoothstep(el, 0.05, 0.45));
  sun.color.lerp(TROI.warm, low * 0.85);
  sun.intensity *= 0.6 + 0.4 * THREE.MathUtils.smoothstep(el, -0.05, 0.35) + 0.25 * low;
  scene.fog.color.lerp(TROI.hz, low * 0.4 * (1 - 0.5 * n)); scene.background.copy(scene.fog.color);
  TROI.c.copy(TROI.hz).lerp(scene.fog.color, 0.4); TROI.c.getRGB(_rgb, THREE.SRGBColorSpace);
  skyU.uHor.value.lerp(new THREE.Vector3(_rgb.r, _rgb.g, _rgb.b), low * 0.35);
}
window.__troi = () => [nightCur, TROI.dir.toArray().map((v) => +v.toFixed(3)), troiHuong(), sun.intensity, scene.fog.color.getHexString()];

// ------------------------------------------------------------------ khung hình
const v3 = new THREE.Vector3();
let mmTick = 0;
let lastT = performance.now();
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
  envTick(dt, appMode === "compare" ? 0 : nightT); arrowTick(dt); nvTick(dt); amTick(dt);
  const stNow = appMode === "explore" && S ? S.scenes[exploreI].state : appMode === "film" && S ? S.scenes[cur].state : "none";
  audioTick(dt, nightCur, stNow, (appMode === "film" && playing) || appMode === "explore"); fpsTick(now);
  if (!fly && !W.on && !(appMode === "film" && !userCam)) {                                            // giữ tâm xoay bám mặt đất khi dời bản đồ
    const X = controls.target.x, Y = -controls.target.z;
    if (inBounds(X, Y)) { const dy = heightAt(X, Y) * EX - controls.target.y; if (Math.abs(dy) > 0.05) { controls.target.y += dy * 0.2; camera.position.y += dy * 0.2; } }
  }
  const showA = $("ly-lbl").checked, showV = $("ly-lang").checked, showP = $("ly-pin").checked;
  for (const A of anchors.values()) {
    A.marker.visible = showA && !W.on; sizeMarker(A.marker, A.X, A.Y); A.label.X = A.X; A.label.Y = A.Y; A.label.lift = A.marker.userData.top; A.label.visible = showA;
    if (A.ghost) { A.ghost.visible = showA; sizeMarker(A.ghost, A.a.x, A.a.y); A.ghost.scale.setScalar(0.6); }
  }
  for (const P of pins.values()) {
    P.marker.visible = showP; sizeMarker(P.marker, P.X, P.Y);
    P.label.X = P.X; P.label.Y = P.Y; P.label.lift = P.marker.userData.top; P.label.visible = showP;
  }
  renderMain();
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const L of labels) {
    let on = L.visible !== false;
    if (L.village) on = showV;
    else if (L.el.classList.contains("river")) on = showA;
    if (on) {
      const Z = heightAt(L.X, L.Y) * EX + (L.lift || 0);
      v3.set(L.X, Z, -L.Y);
      if (v3.distanceTo(camera.position) > L.maxDist) on = false;
      v3.project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) on = false;
      if (on) { L.el.style.left = ((v3.x + 1) / 2) * w + "px"; L.el.style.top = ((1 - v3.y) / 2) * h - 2 + "px"; }
    }
    L.el.style.display = on ? "" : "none";
  }
  if ((mmTick++ & 3) === 0) drawMinimap();
}

const ready = init().catch((e) => { $("err").textContent = "Không dựng được sa bàn: " + e.message + ". Hãy tải lại trang; nếu vẫn lỗi, trình duyệt có thể chưa hỗ trợ WebGL."; console.error(e); throw e; });
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
  stats: () => ({ fps: +($("fps").textContent || "0").replace(/\D/g, "") || 0, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    units: NV.ok, unitsLoaded: NV.loadedN, unitsTotal: NV.totalN, scene: cur, time: S ? starts[cur] + st : 0 }),
};
return ready.then(() => API);
} // run()
