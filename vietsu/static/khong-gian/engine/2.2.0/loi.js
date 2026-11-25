// Bộ máy sa bàn Việt Sử 2.2.0 (họ Bạch Đằng; 2.1.0 + nhiều tầng địa hình, phóng đại độ cao, thuyền tuỳ chọn, xe và nhân vật GLB có xương) — docs/KHUNG_SA_BAN.md. Tách bằng tools/sa_ban/tach_bo_may_2.py từ
// Bạch Đằng 938 V1.2 và Như Nguyệt 1077 V1.6: ở đây là các khối mã giống hệt nhau ở hai trận; phần riêng của từng trận
// ở packs/<id>/rieng.js, cắm vào các chỗ /*@@RIENG:sN@@*/.
import * as THREE from '@@ENGINE@@vendor/three/three.module.min.js';
import { OrbitControls } from '@@ENGINE@@vendor/three/addons/controls/OrbitControls.js';
const PACK = window.__SB.pack, PBASE = window.__SB.base;
let CAU_Y = () => -1e9;                                                                // 2.2: mặt cầu (gói đặt): xe chạy trên mặt cầu, không lội nước
// 2.2: tầng địa hình (pack.json › terrain.tang). Chọn bằng ?tang=<tên>; mặc định tầng đầu tiên. Đổi tầng = tải lại trang tại cùng thời điểm (doiTang).
const QS = new URLSearchParams(location.search);
const TANGS = (PACK.terrain && PACK.terrain.tang) || null;
const TANG = TANGS ? (TANGS[QS.get('tang')] ? QS.get('tang') : Object.keys(TANGS)[0]) : '';
const TT = TANGS ? TANGS[TANG] : { data: 'terrain/meta.json', height: 'terrain/height.png', image: 'terrain/color.jpg' };
const EXH = (TT && TT.phongDai) || (PACK.terrain && PACK.terrain.phongDai) || 1;          // phóng đại độ cao (sa bàn rộng, đồng bằng thấp)
// 2.2: đổi tầng = tải lại trang tại cùng thời điểm; giữa hai tầng hiện THẺ CHƯƠNG (tên cảnh sắp tới) để chỗ chuyển thành một ngắt chương
function doiTang(ten, t, phat) {
  const q = new URLSearchParams(location.search); q.set('tang', ten); if (t != null) q.set('t', (+t).toFixed(2)); if (phat) q.set('phat', '1'); else q.delete('phat');
  let sc = null; try { sc = STORY.scenes.find((c) => t >= c.t0 && t < c.t1); } catch (e) { /* STORY chưa có */ }
  // pack.json › ui.theChuong = false: không phủ màn tối "Tiếp theo" và không hiện thẻ chương trên màn tải — chuyển thẳng (anh Thắng 25/11: màn tối rồi lại màn tải là thừa). Mặc định giữ như cũ cho gói đã phát hành.
  const theChuong = !(PACK.ui && PACK.ui.theChuong === false);
  if (sc && phat && theChuong) q.set('chuong', sc.title); else q.delete('chuong');
  // bản Artifact: khung ngoài đổi tầng. V1.6 Khe Sanh (anh Thắng: bỏ đoạn đen mờ khi chuyển hồi): chụp khung hình cuối gửi kèm — khung ngoài giữ ảnh này trên màn
  // trong lúc tầng mới tải (không còn màn tải tối), tầng mới vẽ xong thì ảnh mờ dần. Chỉ một sa bàn WebGL chạy tại một lúc (không nạp sẵn hai khung — lỗi đơ hình V1.5).
  if (!theChuong) { let anh = null; try { renderer.render(scene, camera); anh = renderer.domElement.toDataURL('image/jpeg', 0.82); } catch (e) { anh = null; }
    if (sc && sc.hoi) q.set('tieude', (sc.hoi || '') + '|' + (sc.ten || '')); else q.delete('tieude');   // V1.8: khung ngoài hiện tên hồi trên ảnh nối — khoảng chờ thành màn mở chương
    if (window.parent !== window && window.parent.__doiTang) window.parent.__doiTang(q.toString(), anh); else location.search = q.toString(); return; }
  const ov = document.createElement('div'); ov.id = 'chuong-ov'; ov.innerHTML = '<div><small>Tiếp theo</small><b></b></div>'; ov.querySelector('b').textContent = sc ? sc.title : '';
  document.body.append(ov); requestAnimationFrame(() => ov.classList.add('on'));
  setTimeout(() => { location.search = q.toString(); }, sc && phat ? 900 : 0);
}
const DUONG = [['data/meta.json', TT.data], ['data/inst.json', 'placement.json'], ['data/story.json', 'story.json'],
  ['data/height.png', TT.height], ['data/color.jpg', TT.image], ['data/', 'props/'], ['models/', 'units/'],
  ['nhanvat/', 'units/'], ['am/', 'audio/'], ['nhac/', 'audio/nhac/']];
const PU = (f) => { for (const [a, b] of DUONG) if (f.startsWith(a)) { f = b + f.slice(a.length); break; } return new URL(f, PBASE).href; };   // tệp trong gói
const fetch = (u, o) => globalThis.fetch(typeof u === 'string' ? PU(u) : u, o);                // mọi fetch của sa bàn đọc trong gói
THREE.DefaultLoadingManager.setURLModifier((u) => (/^(blob|data):/.test(u) ? u : PU(u)));     // ảnh, vân bề mặt cũng vậy
/*@@RIENG:s1@@*/
const $ = (id) => document.getElementById(id);
const lp = $('fill'), lm = $('ld-step');
if (QS.get('chuong')) { $('load').classList.add('chuong'); $('load').querySelector('.eyebrow').textContent = PACK.title || 'Chương tiếp'; $('load').querySelector('h1').textContent = QS.get('chuong'); }   // thẻ chương khi đổi tầng
const showErr = (e) => { const el = document.getElementById('lm'); if (el) { el.textContent = 'Lỗi khi tải sa bàn: ' + (e && (e.message || e.reason || e)) ; el.style.color = '#e08a70'; } };
addEventListener('error', (e) => showErr(e.error || e.message));
addEventListener('unhandledrejection', (e) => showErr(e.reason));
/*@@RIENG:s2@@*/
// ------------------------------------------------------------------ data
const getJSON = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const [META, INST, STORY] = await Promise.all([getJSON('data/meta.json'), getJSON('data/inst.json'), getJSON('data/story.json')]);
progress(0.1, 'Đang dựng địa hình…');
const R = META.R, HALF = META.half, NG = META.N, PX = (2 * HALF) / NG;
const BASE = -32;           // mặt nền ngoài sa bàn
/*@@RIENG:s3@@*/
async function loadBitmap(url) {
  const b = await (await fetch(url)).blob();
  return createImageBitmap(b, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
}
const hbmp = await loadBitmap('data/height.png');
const HG = new Float32Array(NG * NG);
const WM = new Uint8Array(NG * NG);
{
  const cv = document.createElement('canvas'); cv.width = cv.height = NG;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.drawImage(hbmp, 0, 0);
  const d = cx.getImageData(0, 0, NG, NG).data;
  for (let i = 0; i < NG * NG; i++) {
    const q = (d[i * 4] * 256 + d[i * 4 + 1]) / 65535;
    HG[i] = (META.hmin + q * (META.hmax - META.hmin)) * EXH;
    WM[i] = d[i * 4 + 2] > 127 ? 1 : 0;
  }
}
function hAt(x, z) {
  let gx = (x + HALF) / PX - 0.5, gz = (z + HALF) / PX - 0.5;
  gx = Math.min(Math.max(gx, 0), NG - 1.001); gz = Math.min(Math.max(gz, 0), NG - 1.001);
  const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j;
  const a = HG[j * NG + i], b = HG[j * NG + i + 1], c = HG[(j + 1) * NG + i], e = HG[(j + 1) * NG + i + 1];
  return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + e * fx) * fz;
}
const isWater = (x, z) => WM[Math.min(NG - 1, Math.max(0, Math.floor((z + HALF) / PX))) * NG + Math.min(NG - 1, Math.max(0, Math.floor((x + HALF) / PX)))] === 1;

// ------------------------------------------------------------------ renderer
const canvas = $('c');
// V1.7 Khe Sanh (anh Thắng: xem trên điện thoại gần các chương cuối bị tải lại từ đầu — trình duyệt điện thoại thiếu bộ nhớ đồ hoạ thì bỏ trang):
// máy cảm ứng dùng độ phân giải thấp hơn và bỏ khử răng cưa nhiều mẫu (bộ đệm MSAA tốn bộ nhớ gấp nhiều lần)
const MAY_CAM_UNG = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MAY_CAM_UNG, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAY_CAM_UNG ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9aa6a8, 0.00004);
/*@@RIENG:s4@@*/
const controls = new OrbitControls(camera, canvas);
controls.enabled = false; controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.495; controls.maxDistance = 30000;

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
const hemi = new THREE.HemisphereLight(0xbfd2e0, 0x4a4434, 0.9);
const amb = new THREE.AmbientLight(0xffffff, 0.35);
const fill = new THREE.PointLight(0xfff2e0, 2.2, 260, 0);
scene.add(sun, sun.target, hemi, amb, fill);

/*@@RIENG:s5@@*/
const clipList = [];       // materials that follow the section toggle
function setSection(on) { for (const m of clipList) { m.clippingPlanes = on ? [secPlane] : []; m.needsUpdate = true; } sectionMesh.visible = on; }

// height texture for shaders (half float)
const half = new Uint16Array(NG * NG);
for (let i = 0; i < NG * NG; i++) half[i] = THREE.DataUtils.toHalfFloat(HG[i]);
const hTex = new THREE.DataTexture(half, NG, NG, THREE.RedFormat, THREE.HalfFloatType);
hTex.magFilter = hTex.minFilter = THREE.LinearFilter; hTex.needsUpdate = true;

const shaderNoise = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
`;

// ------------------------------------------------------------------ sky
const U = {
  time: { value: 0 }, level: { value: HIGH }, sunDir: { value: new THREE.Vector3(0, 1, 0) },
  sunCol: { value: new THREE.Color(1, 1, 1) }, top: { value: new THREE.Color() }, hor: { value: new THREE.Color() },
  low: { value: new THREE.Color() }, cloudCol: { value: new THREE.Color() }, cloudShade: { value: new THREE.Color() },
  cover: { value: 0.4 }, sunSize: { value: 900 }, glow: { value: 1 }, ground: { value: new THREE.Color() },
  analysis: { value: 0 }, deep: { value: new THREE.Color(0x1d3a3c) }, shallow: { value: new THREE.Color(0x5d7a6c) },
  wetTop: { value: HIGH }, light: { value: 1 },
};
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uTop: U.top, uHor: U.hor, uLow: U.low, uSunDir: U.sunDir, uSunCol: U.sunCol, uCloudCol: U.cloudCol, uCloudShade: U.cloudShade, uCover: U.cover, uTime: U.time, uSunSize: U.sunSize, uGlow: U.glow },
  vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position); vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }`,
  fragmentShader: `uniform vec3 uTop,uHor,uLow,uSunDir,uSunCol,uCloudCol,uCloudShade; uniform float uCover,uTime,uSunSize,uGlow; varying vec3 vDir; ${shaderNoise}
  void main(){ vec3 d=normalize(vDir); float h=d.y;
    vec3 col = h>0. ? mix(uHor,uTop,pow(clamp(h,0.,1.),0.55)) : mix(uHor,uLow,clamp(-h*5.,0.,1.));
    float mu=max(dot(d,uSunDir),0.);
    col += uSunCol*(pow(mu,uSunSize)*5.0 + pow(mu,12.)*0.3*uGlow + pow(mu,2.5)*0.07*uGlow);
    if(h>0.){ vec2 uv=d.xz/(h+0.12)*1.25 + vec2(uTime*0.004,uTime*0.0016);
      float n=fbm(uv*1.4); float c=smoothstep(1.0-uCover-0.12,1.0-uCover+0.3,n)*smoothstep(0.0,0.16,h);
      vec3 cc=mix(uCloudShade,uCloudCol,clamp(n*1.25-0.15+pow(mu,3.)*0.5,0.,1.));
      col=mix(col,cc,c*0.93); }
    col=mix(col,uHor,exp(-abs(h)*16.)*0.55);
    gl_FragColor=vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(100000, 48, 24), skyMat);
sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky);

// ------------------------------------------------------------------ outside ground (nền màu đến chân trời)
function fogShader(opts) {
  const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]);
  Object.assign(uniforms, opts.uniforms);
  return new THREE.ShaderMaterial({
    uniforms, fog: true, clipping: true, transparent: !!opts.transparent, side: opts.side || THREE.FrontSide, depthWrite: opts.depthWrite !== false,
    vertexShader: `#include <common>
#include <fog_pars_vertex>
#include <clipping_planes_pars_vertex>
${opts.vpre || ''}
varying vec3 vW;
void main(){ vec3 transformed=position; ${opts.vbody || ''} vec4 w=modelMatrix*vec4(transformed,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;
#include <clipping_planes_vertex>
#include <fog_vertex>
}`,
    fragmentShader: `#include <common>
#include <fog_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec3 vW;
${shaderNoise}
${opts.fpre || ''}
void main(){
#include <clipping_planes_fragment>
vec4 outc=vec4(1.); ${opts.fbody}
gl_FragColor=outc;
#include <tonemapping_fragment>
#include <colorspace_fragment>
#include <fog_fragment>
}`,
  });
}
/*@@RIENG:s6@@*/
const ground = new THREE.Mesh(new THREE.RingGeometry(R * 0.995, 150000, 192, 1), groundMat);   // 2.2 (V1.6): vành quanh sa bàn, không trải dưới địa hình — trước đây mặt nền nằm ngay dưới đất, nhìn xa tranh nhau → vệt đen nháy
ground.rotation.x = -Math.PI / 2; ground.position.y = BASE; scene.add(ground);

// ------------------------------------------------------------------ terrain
// TH: cao độ đỉnh lưới địa hình; hG(): cao độ đúng theo tam giác lưới (người, cây đặt bằng hàm này để không lún vào sườn đồi)
const TG = 560, TH = new Float32Array((TG + 1) * (TG + 1));   // 2.2 (V1.5): lưới địa hình 560² (≈ 630 nghìn tam giác, trước 700² ≈ 980 nghìn) — nhẹ cho card đồ hoạ yếu
let TERRAIN = null;
// 2.2: VÙNG PHẲNG — công trình dựng sẵn (vd. khuôn viên Dinh) có mặt sân riêng; hG trả độ cao mặt sân trong vùng đó để xe, người không lún
const PHANG = [];        // { cx, cz, c, s, s0, s1, d0, d1, h } — hình chữ nhật xoay (s dọc, d ngang) quanh (cx, cz) three
function matPhang(cx, cz, yaw, s0, s1, d0, d1, h) { PHANG.push({ cx, cz, c: Math.cos(yaw), s: Math.sin(yaw), s0, s1, d0, d1, h }); }
function hG(x, z) {
  for (const P of PHANG) { const dx = x - P.cx, dz = z - P.cz, ss = dx * P.c - dz * P.s, dd = -dx * P.s - dz * P.c; if (ss > P.s0 && ss < P.s1 && dd > P.d0 && dd < P.d1) return P.h; }
  if (Math.hypot(x, z) > R - 20) return hAt(x, z);
  const cs = (2 * R) / TG, gj = (x + R) / cs, gi = (z + R) / cs, j = Math.min(TG - 1, Math.max(0, Math.floor(gj))), i = Math.min(TG - 1, Math.max(0, Math.floor(gi)));
  const fx = gj - j, fz = gi - i, n = TG + 1, a = TH[i * n + j], b = TH[i * n + j + 1], c = TH[(i + 1) * n + j], d = TH[(i + 1) * n + j + 1];
  return fx + fz <= 1 ? a + (b - a) * fx + (c - a) * fz : d + (c - d) * (1 - fx) + (b - d) * (1 - fz);
}
const colorTex = await new THREE.TextureLoader().loadAsync('data/color.jpg');
colorTex.flipY = false; colorTex.colorSpace = THREE.SRGBColorSpace; colorTex.anisotropy = 8; colorTex.needsUpdate = true;
progress(0.25);
{
  const G = TG, n = G + 1;
  const pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2), out = new Uint8Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    let x = -R + (2 * R * j) / G, z = -R + (2 * R * i) / G;
    const r = Math.hypot(x, z);
    if (r > R) { out[i * n + j] = r > R + (2 * R) / G * 1.5 ? 1 : 0; x *= R / r; z *= R / r; }
    const k = i * n + j;
    pos[k * 3] = x; pos[k * 3 + 1] = hAt(x, z); pos[k * 3 + 2] = z; TH[k] = pos[k * 3 + 1];
    uv[k * 2] = (x + HALF) / (2 * HALF); uv[k * 2 + 1] = (z + HALF) / (2 * HALF);
  }
  const idx = [];
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    const a = i * n + j, b = a + 1, c = a + n, d = c + 1;
    if (out[a] && out[b] && out[c] && out[d]) continue;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.93, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uLevel = U.level; sh.uniforms.uWetTop = U.wetTop;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uLevel,uWetTop;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float wet=smoothstep(uWetTop+0.25,uWetTop-0.5,vWP.y)*step(uLevel-0.05,vWP.y);
        diffuseColor.rgb*=mix(1.0,0.66,wet);
        float under=smoothstep(uLevel+0.05,uLevel-1.2,vWP.y);
        diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.5,0.62,0.6),under);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.38,wet);');
  };
  clipList.push(mat);
  const terrain = new THREE.Mesh(geo, mat);
  scene.add(terrain); TERRAIN = terrain;
}
// plinth skirt with soil layers + water side band
{
  const S = 1440, pos = [], idx = [], hh = [], top = [];
  for (let i = 0; i <= S; i++) {
    const a = (i / S) * Math.PI * 2, x = Math.cos(a) * R, z = Math.sin(a) * R, h = hAt(x, z);
    pos.push(x, h, z, x, BASE, z); hh.push(h, h); top.push(1, 0);
    if (i < S) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const skirtMat = fogShader({
    uniforms: { uLight: U.light },
    fpre: 'uniform float uLight;',
    fbody: `float y=vW.y; float band=noise(vec2(atan(vW.z,vW.x)*400.,y*0.9))*0.5+0.5;
      vec3 c=mix(vec3(0.33,0.25,0.18),vec3(0.46,0.36,0.25),smoothstep(-6.,2.,y));
      c=mix(c,vec3(0.22,0.17,0.13),smoothstep(-14.,-22.,y));
      c*= 0.82+0.3*band; c*= 0.9+0.1*sin(y*2.4); c*=uLight*0.9; outc=vec4(c,1.);`,
  });
  scene.add(new THREE.Mesh(g, skirtMat));
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.Float32BufferAttribute(pos.map((v, i) => (i % 3 === 1 ? 0 : v)), 3));
  g2.setAttribute('aH', new THREE.Float32BufferAttribute(hh, 1));
  g2.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1));
  g2.setIndex(idx);
  const bandMat = fogShader({
    transparent: true, side: THREE.DoubleSide,
    uniforms: { uLevel: U.level, uDeep: U.deep },
    vpre: 'attribute float aH; attribute float aTop; uniform float uLevel; varying float vDepth;',
    vbody: 'transformed.y = aTop>0.5 ? max(uLevel,aH) : aH; vDepth = uLevel - transformed.y;',
    fpre: 'uniform vec3 uDeep; uniform float uLevel; varying float vDepth;',
    fbody: 'float d=uLevel-vW.y; outc=vec4(mix(uDeep*1.6,uDeep*0.7,clamp(d/8.,0.,1.)),0.78);',
  });
  scene.add(new THREE.Mesh(g2, bandMat));
}

// ------------------------------------------------------------------ water
const waterMat = fogShader({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  uniforms: { uH: { value: hTex }, uHalf: { value: HALF }, uLevel: U.level, uTime: U.time, uSunDir: U.sunDir, uSunCol: U.sunCol, uTop: U.top, uHor: U.hor, uDeep: U.deep, uShallow: U.shallow, uAnalysis: U.analysis },
  fpre: `uniform sampler2D uH; uniform float uHalf,uLevel,uTime,uAnalysis; uniform vec3 uSunDir,uSunCol,uTop,uHor,uDeep,uShallow;
    float wav(vec2 q){ return noise(q*0.07+vec2(uTime*0.22,uTime*0.15))*0.6+noise(q*0.29-vec2(uTime*0.37,-uTime*0.28))*0.3+noise(q*1.2+uTime*0.8)*0.1; }`,
  fbody: `vec2 uv=(vW.xz+uHalf)/(2.*uHalf); float hb=texture2D(uH,uv).r; float depth=uLevel-hb;
    if(depth<-0.03) discard;
    vec2 p=vW.xz; float dist=length(cameraPosition-vW); float xa=smoothstep(500.,2500.,dist); float amp=1.6/(1.+dist*0.0015)*(1.-0.9*xa);
    float hx=wav(p+vec2(.6,0.))-wav(p-vec2(.6,0.)); float hz=wav(p+vec2(0.,.6))-wav(p-vec2(0.,.6));
    vec3 N=normalize(vec3(-hx*amp,1.,-hz*amp)); vec3 V=normalize(cameraPosition-vW);
    if(cameraPosition.y<uLevel) N=-N;
    float fres=0.02+0.98*pow(1.-max(dot(N,V),0.),5.);
    vec3 Rf=reflect(-V,N); vec3 skyc=mix(uHor,uTop,clamp(Rf.y*1.6,0.,1.));
    float spec=pow(max(dot(Rf,uSunDir),0.),260.)*3.5*(1.-xa);   // 2.2: nhìn từ xa bỏ gợn sóng, lấp lánh, bọt (chống nháy khi nhìn bản đồ từ trên cao)
    float dfac=1.-exp(-max(depth,0.)*0.3);
    vec3 base=mix(uShallow,uDeep,dfac);
    float foam=smoothstep(0.5,0.0,depth)*(0.5+0.5*noise(p*0.5+uTime*0.6))*(1.-xa);
    vec3 col=mix(base,skyc,fres*0.8)+uSunCol*spec;
    col=mix(col,vec3(0.86,0.85,0.8),foam*0.5);
    float a=mix(0.3,0.93,1.-exp(-max(depth,0.)*0.5)); a=max(a,fres*0.85); a=max(a,foam*0.65);
    a*=(1.-0.6*uAnalysis);
    outc=vec4(col,a);`,
});
clipList.push(waterMat);
/*@@RIENG:s7@@*/
// ------------------------------------------------------------------ vegetation, huts
const dummy = new THREE.Object3D();
function colored(geo, hex) { const c = new THREE.Color(hex); const n = geo.attributes.position.count; const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo; }
function merge(list) {
  list = list.map((g) => (g.index ? g.toNonIndexed() : g));
  const out = new THREE.BufferGeometry(); let n = 0; for (const g of list) n += g.attributes.position.count;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); const I = []; let o = 0;
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; g.computeVertexNormals(); const c = g.attributes.position.count;
    P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += c; }
  out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('color', new THREE.BufferAttribute(C, 3));
  return out;
}
const vegMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
clipList.push(vegMat);
function scatter(list, geo, scale, yoff, colorVar) {
  const m = new THREE.InstancedMesh(geo, vegMat, list.length);
  const col = new THREE.Color();
  list.forEach((p, i) => {
    const [x, z, s, r] = p; dummy.position.set(x, hG(x, z) + yoff, z); dummy.rotation.set(0, r, 0); dummy.scale.setScalar(s * scale); dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix); col.setHSL(colorVar[0] + (Math.sin(i * 12.9) * 0.5) * colorVar[1], 1, 1); m.setColorAt(i, col.setRGB(1 - colorVar[2] * Math.abs(Math.sin(i * 7.1)), 1 - colorVar[2] * Math.abs(Math.sin(i * 3.3)), 1 - colorVar[2] * Math.abs(Math.cos(i * 5.7))));
  });
  m.instanceMatrix.needsUpdate = true; scene.add(m); return m;
}
const mangroveGeo = merge([
  colored(new THREE.CylinderGeometry(0.25, 0.35, 2.4, 5).translate(0, 1.2, 0), 0x4a3c2c),
  colored(new THREE.IcosahedronGeometry(3.2, 0).scale(1.25, 0.62, 1.15).translate(0, 3.4, 0), 0x31462b),
  colored(new THREE.IcosahedronGeometry(2.2, 0).scale(1.1, 0.7, 1.0).translate(1.9, 2.8, 0.6), 0x3a522f),
]);
const treeGeo = merge([
  colored(new THREE.CylinderGeometry(0.4, 0.6, 5, 5).translate(0, 2.5, 0), 0x4d3d2b),
  colored(new THREE.IcosahedronGeometry(5.2, 0).scale(1, 1.2, 1).translate(0, 8.4, 0), 0x2b3f25),
]);
const groveGeo = merge([
  colored(new THREE.ConeGeometry(2.0, 15, 6).translate(0, 7.5, 0), 0x6b7a3a),
  colored(new THREE.ConeGeometry(1.6, 12, 6).translate(2.2, 6, 1), 0x7c8a43),
  colored(new THREE.ConeGeometry(1.5, 11, 6).translate(-1.8, 5.5, -1.2), 0x5f6e34),
]);
/*@@RIENG:s8@@*/
const propMat = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.9 });
clipList.push(propMat);
/*@@RIENG:s9@@*/
// ------------------------------------------------------------------ models
progress(0.45, 'Đang tải nhân vật và chiến thuyền…');
const texLoader = new THREE.TextureLoader();
const b64 = (str) => { const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
/*@@RIENG:s10@@*/
// ------------------------------------------------------------------ nhân vật có động tác (kho chung · rig Mixamo · nướng bằng Blender: web_v2/_nguon/bake_bd.py)
// Cách làm theo sa bàn Ngọc Hồi – Đống Đa V10: mỗi động tác là chuỗi khung hình nướng sẵn; mỗi khung là một InstancedMesh;
// mỗi khung có ma trận bàn tay phải (mg) và khung hai tay (mt) để gắn giáo, đao, cung, mái chèo, cờ.
const EXAG = 1.6;      // người cao 1,65–1,75 m, phóng đại 1,6 lần để đọc được trên sa bàn (cùng tỉ lệ thuyền)
const NVK = {};
async function nvzRead(url) {                  // gzip("NVZ1" + u32 + JSON đầu + khối nhị phân)
  const r = await fetch(url); if (!r.ok) throw new Error('không tải được ' + url);
  let buf = await r.arrayBuffer(); const h8 = new Uint8Array(buf, 0, 2);
  if (h8[0] === 0x1f && h8[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const dv = new DataView(buf); if (dv.getUint32(0, false) !== 0x4e565a31) throw new Error('tệp không phải NVZ1: ' + url);
  const hl = dv.getUint32(4, true), H = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl))), b0 = (8 + hl + 3) & ~3;
  return { H, arr: (ref, T) => new T(buf, b0 + ref[0], ref[1] / T.BYTES_PER_ELEMENT) };
}
function nvzFrames(Z, posRef, norRef, n, q) {
  const D = Z.arr(posRef, Int16Array), DN = Z.arr(norRef, Int8Array), nv = D.length / n / 3, acc = new Int16Array(nv * 3), an = new Int8Array(nv * 2), out = [];
  for (let f = 0; f < n; f++) {
    const p = new Int16Array(nv * 3), nr = new Int8Array(nv * 3);                       // 2.2 (V1.5): giữ số nguyên trên GPU (vị trí × q, pháp tuyến chuẩn hoá) — bộ nhớ ¼
    for (let i = 0, o = f * nv * 3; i < nv * 3; i++) { acc[i] += D[o + i]; p[i] = acc[i]; }
    for (let i = 0, o = f * nv * 2; i < nv; i++) {
      an[i * 2] += DN[o + i * 2]; an[i * 2 + 1] += DN[o + i * 2 + 1];
      let x = an[i * 2] / 127, y = an[i * 2 + 1] / 127; const z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) { const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1); }
      const l = Math.hypot(x, y, z) || 1; nr[i * 3] = Math.round(x / l * 127); nr[i * 3 + 1] = Math.round(y / l * 127); nr[i * 3 + 2] = Math.round(z / l * 127);
    }
    out.push([p, nr]);
  }
  return out;
}
/*@@RIENG:s11@@*/
const NV_IMS = [];
function nvIM(K, C, f, mir) {
  const arr = mir ? (C.imsM || (C.imsM = [])) : C.ims;
  let im = arr[f];
  if (!im) { im = new THREE.InstancedMesh(C.frames[f], mir ? K.matM : K.mat, mir ? Math.min(K.cap, 160) : K.cap); im.frustumCulled = false; im.count = 0; im.visible = false; scene.add(im); arr[f] = im; NV_IMS.push(im); }
  return im;
}
function nvFrame(C, t, ph, tSeg) { const n = C.frames.length; if (n === 1) return 0; if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg) * C.fps)); return ((Math.floor(t * C.fps + ph * n) % n) + n) % n; }   // 2.2 (V1.5): t âm (giờ Dinh trước mốc 0) → chỉ số âm, lưới đặt ở khoá âm không được xoá mỗi khung → lính đứng im, nhấp nháy
const _gm = new THREE.Matrix4(), _gx = new THREE.Vector3(), _gy = new THREE.Vector3(), _gz = new THREE.Vector3();
function nvGrip(C, f, two, up) {               // khung bàn tay tại khung hình f (theo NHDD V10); up: dựng thẳng cán
  const A = two && C.mt ? C.mt : C.mg, o = f * 9;
  _gy.set(A[o], A[o + 1], A[o + 2]).normalize(); _gz.set(A[o + 3], A[o + 4], A[o + 5]);
  if (up) { _gy.set(0, up, 0); _gz.y = 0; if (_gz.lengthSq() < 1e-4) _gz.set(1, 0, 0); }
  _gz.addScaledVector(_gy, -_gz.dot(_gy)).normalize(); _gx.crossVectors(_gy, _gz);
  return _gm.makeBasis(_gx, _gy, _gz).setPosition(A[o + 6], A[o + 7], A[o + 8]);
}
// binh khí (toạ độ tay cầm: +Y về phía mũi, gốc ở nắm tay)
const WOOD = 0x6b4a2c, IRON = 0x8e9095, DARK = 0x2a2420;
/*@@RIENG:s12@@*/
const WP = {};
/*@@RIENG:s13@@*/
let coOn = true;
/*@@RIENG:s14@@*/
const _wm2 = new THREE.Matrix4(), _wb = new THREE.Matrix4(), _wd = new THREE.Vector3(), _wu = new THREE.Vector3(), _wo = new THREE.Vector3(), _wz2 = new THREE.Vector3();
/*@@RIENG:s15@@*/
const WHITE = new THREE.Color(1, 1, 1), _np = new THREE.Vector3();
// vẽ một người: kind, động tác, thời điểm, pha lệch, vị trí, hướng, tỉ lệ, binh khí, giây trong đoạn (động tác chạy một lần), chỉ số để chọn màu áo
/*@@RIENG:s16@@*/
function polyAt(pts, d) { let acc = 0; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + L >= d) { const f = (d - acc) / L; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; } acc += L; } return pts[pts.length - 1]; }
/*@@RIENG:s17@@*/
const TS = PACK.units && PACK.units['thuyen-ts'] ? await loadModel('thuyen-ts') : { geo: new THREE.BufferGeometry(), mat: new THREE.MeshBasicMaterial({ visible: false }) };   // 2.2: thuyền tuỳ chọn
TS.mat.side = THREE.DoubleSide; clipList.push(TS.mat);
/*@@RIENG:s18@@*/
const _bf = new THREE.Matrix4().makeTranslation(BOAT_STERN[0], BOAT_STERN[1], BOAT_STERN[2]), _bf2 = new THREE.Matrix4();
/*@@RIENG:s19@@*/
const proxy = () => { const o = new THREE.Object3D(); o.visible = false; return o; };   // vị trí nhân vật (máy quay bám theo), hình vẽ qua nvPut
/*@@RIENG:s20@@*/
function drawP(o, kind, clip, ph, wpn, tSeg = 0, vi = 0, far = true) {
  if (!o.visible) return;
  const sc = far ? farScale(o.position.x, o.position.y, o.position.z) : EXAG;
  nvPut(kind, clip, T, ph, o.position, o.rotation.y, sc, wpn, tSeg, vi, o.rotation.z, o.rotation.x);
}
/*@@RIENG:s21@@*/
function place(obj, x, z, yaw, show = true) { obj.visible = show; if (!show) return; obj.position.set(x, hG(x, z), z); obj.rotation.set(0, yaw, 0); }
// ------------------------------------------------------------------ 2.2: mô hình GLB (meshopt) — xe chạy theo đường, nhân vật có xương (AnimationMixer)
// Toạ độ đường đi theo Blender: [[x, y_Bắc], …] (m) → three (x, -y). Xe: mũi xe nhìn −Y Blender (= +z three quay 180°), bánh chạm đất.
const GLBX = { L: null, SU: null, cache: {} };
async function glbLoad(url) {
  if (!GLBX.L) { const [{ GLTFLoader }, { MeshoptDecoder }, su] = await Promise.all([import('@@ENGINE@@vendor/three/addons/loaders/GLTFLoader.js'),
    import('@@ENGINE@@vendor/three/addons/libs/meshopt_decoder.module.js'), import('@@ENGINE@@vendor/three/addons/utils/SkeletonUtils.js')]);
    GLBX.L = new GLTFLoader(); GLBX.L.setMeshoptDecoder(MeshoptDecoder); GLBX.SU = su; }
  if (!GLBX.cache[url]) GLBX.cache[url] = GLBX.L.loadAsync(url);
  return GLBX.cache[url];
}
function duong(pts) {                       // đường gấp khúc (three x,z) + độ dài tích luỹ
  const P = pts.map((p) => [p[0], -p[1]]); const acc = [0];
  for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  return { P, acc, L: acc[acc.length - 1] };
}
function diemTren(D, d) {                   // vị trí + hướng tại quãng d trên đường D
  d = Math.min(Math.max(d, 0), D.L); let i = 1; while (i < D.P.length - 1 && D.acc[i] < d) i++;
  const a = D.P[i - 1], b = D.P[i], u = (d - D.acc[i - 1]) / Math.max(1e-6, D.acc[i] - D.acc[i - 1]);
  return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) };
}
const XE = [];                               // { obj, D, lich: [[t, d], …] (giây phim → quãng đường m), sc, hien(t) }
async function xeTao(file, opt = {}) {
  const g = await glbLoad(file); const obj = g.scene.clone(true); const sc = opt.sc || 1;
  obj.scale.setScalar(sc); obj.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.frustumCulled = true; } });
  obj.visible = false; scene.add(obj); const X = { obj, sc, D: opt.duong ? duong(opt.duong) : null, lich: opt.lich || [[0, 0]], hien: opt.hien || (() => true), lech: opt.lech || 0, ten: opt.ten || file };
  XE.push(X); return X;
}
function xeCapNhat(t) {
  for (const X of XE) {
    const on = X.D && X.hien(t); X.obj.visible = on; if (!on) continue;
    const d = keys(X.lich, t); const p = diemTren(X.D, d), q = diemTren(X.D, d + 4), r = diemTren(X.D, d - 4);
    const ox = Math.cos(p.yaw) * X.lech, oz = -Math.sin(p.yaw) * X.lech;
    const y = Math.max(hG(p.x + ox, p.z + oz), tideNow, CAU_Y(p.x + ox, p.z + oz));
    X.obj.position.set(p.x + ox, y, p.z + oz);
    const pitch = Math.atan2(hG(q.x, q.z) - hG(r.x, r.z), 8);
    X.obj.rotation.set(0, p.yaw, 0); X.obj.rotateX(-pitch);
  }
}
const NVX = [];                              // nhân vật GLB có xương: { obj, mixer, acts, cur, vt(t) → {x,z,yaw,clip,y?}, sc }
async function nvxTao(file, vt, opt = {}) {
  const g = await glbLoad(file); const obj = GLBX.SU.clone(g.scene); const sc = opt.sc || 1; obj.scale.setScalar(sc);
  obj.traverse((m) => { if (m.isMesh) { m.frustumCulled = false; } });
  const mixer = new THREE.AnimationMixer(obj), acts = {}; for (const c of g.animations) acts[c.name] = mixer.clipAction(c);
  obj.visible = false; scene.add(obj); const N = { obj, mixer, acts, cur: null, vt, sc, ten: opt.ten || file }; NVX.push(N); return N;
}
function nvxCapNhat(t, dt) {
  for (const N of NVX) {
    const v = N.vt(t); N.obj.visible = !!v; if (!v) continue;
    const y = v.y != null ? v.y : Math.max(hG(v.x, v.z), tideNow);
    N.obj.position.set(v.x, y, v.z); N.obj.rotation.set(0, v.yaw || 0, 0);
    if (v.clip !== N.cur && N.acts[v.clip]) {   // khung xương Tripo có tư thế nghỉ nằm ngang → động tác đầu chạy ngay đủ trọng số, đổi động tác thì chuyển chéo
      const a = N.acts[v.clip].reset(); a.setEffectiveWeight(1); a.play();
      if (N.cur && N.acts[N.cur]) N.acts[N.cur].crossFadeTo(a, 0.25, false); N.cur = v.clip; }
    N.mixer.update(dt * (v.toc || 1));
  }
}
// 2.2: ĐÁM ĐÔNG .nvz dùng chung (người dân, quân đứng xa…) — mỗi khung hình động tác là một InstancedMesh.
// Mỗi khung phim: dongXoa() → dongDat(...) từng người → dongXong(). Người .nvz nướng sẵn (tools/sa_ban/nv_sang_nvz.py), mặt nhìn +Z.
const DONG = {};
const DONG_GEO = {};                                                                     // 2.2: nhiều ảnh màu (áo khác màu) dùng chung một bộ khung hình .nvz
async function dongTai(ten, nvz, jpg, tints, cap = 400) {
  const map = await texLoader.loadAsync(jpg); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide });
  const G = await (DONG_GEO[nvz] = DONG_GEO[nvz] || dongHinh(nvz)), clips = {};
  for (const [name, c] of Object.entries(G.clips)) clips[name] = { fps: c.fps, once: c.once, ims: [], frames: c.frames };
  DONG[ten] = { clips, mat, cap, q: G.q, tints: (tints || [[1, 1, 1]]).map((c) => new THREE.Color(c[0], c[1], c[2])) };
  return DONG[ten];
}
async function dongHinh(nvz) {
  const Z = await nvzRead(nvz), H = Z.H;
  const index = new THREE.BufferAttribute(H.idx32 ? Z.arr(H.idx, Uint32Array) : Z.arr(H.idx, Uint16Array), 1), uv = new THREE.BufferAttribute(Z.arr(H.uv, Float32Array), 2), clips = {};
  for (const [name, c] of Object.entries(H.clips)) clips[name] = { fps: c.fps, once: !!c.once, ims: [], frames: nvzFrames(Z, c.pos, c.nor, c.n, H.q).map(([pos, nor]) => {
    const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uv); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, true));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 3 / H.q); return g; }) };
  return { clips, q: H.q };
}
function dongXoa() { for (const K of Object.values(DONG)) for (const C of Object.values(K.clips)) for (const im of C.ims) if (im) im.count = 0; }
const _dc = new THREE.Color(1, 1, 1), _dq = new THREE.Quaternion(), _dm = new THREE.Matrix4(), _dp = new THREE.Vector3(), _ds = new THREE.Vector3(), _dY = new THREE.Vector3(0, 1, 0);
function dongDat(ten, clip, t, ph, x, y, z, yaw, sc = 1, vi = 0) {   // ph: pha lệch 0..1 để mọi người không cử động đồng loạt
  const K = DONG[ten]; if (!K) return false; const C = K.clips[clip] || K.clips.dung, f = nvFrame(C, t, ph, 0);
  let im = C.ims[f]; if (!im) { im = new THREE.InstancedMesh(C.frames[f], K.mat, K.cap); im.frustumCulled = false; im.count = 0; im.setColorAt(0, _dc); scene.add(im); C.ims[f] = im; }
  if (im.count >= K.cap) return false;
  _dm.compose(_dp.set(x, y, z), _dq.setFromAxisAngle(_dY, yaw), _ds.setScalar(sc * K.q)); /* khung hình lưu số nguyên (đơn vị q) */ im.setMatrixAt(im.count, _dm); im.setColorAt(im.count, K.tints[vi % K.tints.length]); im.count++;
  return true;
}
// 2.2: chỉ tải lên GPU phần đang dùng (count), và chỉ khi có người — trước đây mỗi khung tải lại cả bộ đệm (cap × 64 byte) của mọi lưới → giật, đứng hình khi đông người
function dongXong(hien = true) { for (const K of Object.values(DONG)) for (const C of Object.values(K.clips)) for (const im of C.ims) if (im) { const v = hien && im.count > 0; im.visible = v; if (!v) continue;
  const M = im.instanceMatrix; M.clearUpdateRanges(); M.addUpdateRange(0, im.count * 16); M.needsUpdate = true;
  if (im.instanceColor) { const Cc = im.instanceColor; Cc.clearUpdateRanges(); Cc.addUpdateRange(0, im.count * 3); Cc.needsUpdate = true; } } }
/*@@RIENG:s22@@*/
const SMOKE_N = 1400;
const smokeGeo = new THREE.BufferGeometry();
const smokePos = new Float32Array(SMOKE_N * 3), smokeA = new Float32Array(SMOKE_N), smokeS = new Float32Array(SMOKE_N);
smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3)); smokeGeo.setAttribute('aA', new THREE.BufferAttribute(smokeA, 1)); smokeGeo.setAttribute('aS', new THREE.BufferAttribute(smokeS, 1));
const smokeMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { uCol: { value: new THREE.Color(0x4d4743) }, uScale: { value: 600 } },
  vertexShader: 'attribute float aA; attribute float aS; varying float vA; uniform float uScale; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; vA=aA*smoothstep(20.,140.,d); gl_PointSize=min(aS*uScale/max(d,1.),220.); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'uniform vec3 uCol; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); float a=smoothstep(.5,.0,d)*vA; if(a<0.01) discard; gl_FragColor=vec4(uCol,a);\n#include <colorspace_fragment>\n}',
});
const smoke = new THREE.Points(smokeGeo, smokeMat); smoke.frustumCulled = false; scene.add(smoke);
/*@@RIENG:s23@@*/
const arrows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 1.6), new THREE.MeshBasicMaterial({ color: 0x2a221a }), ARROW_N); arrows.frustumCulled = false; scene.add(arrows);
/*@@RIENG:s24@@*/
const FA_N = 90;
/*@@RIENG:s25@@*/
const fireGeo = new THREE.BufferGeometry();
const firePos = new Float32Array(FIRE_N * 3), fireA = new Float32Array(FIRE_N), fireS = new Float32Array(FIRE_N), fireH = new Float32Array(FIRE_N);
fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3)); fireGeo.setAttribute('aA', new THREE.BufferAttribute(fireA, 1)); fireGeo.setAttribute('aS', new THREE.BufferAttribute(fireS, 1)); fireGeo.setAttribute('aH', new THREE.BufferAttribute(fireH, 1));
const fireMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 520 } },
  vertexShader: 'attribute float aA; attribute float aS; attribute float aH; varying float vA; varying float vH; uniform float uScale; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; vA=aA; vH=aH; gl_PointSize=min(aS*uScale/max(d,1.),260.); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'varying float vA; varying float vH; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); float a=smoothstep(.5,.05,d)*vA; if(a<0.01) discard; vec3 col=mix(vec3(1.,.85,.4),vec3(.95,.25,.05),vH); gl_FragColor=vec4(col*a*1.6,a);\n#include <colorspace_fragment>\n}' });
const flames = new THREE.Points(fireGeo, fireMat); flames.frustumCulled = false; scene.add(flames);
const fireLight = new THREE.PointLight(0xff7a2a, 0, 900, 1.6); scene.add(fireLight);
/*@@RIENG:s26@@*/
function bearingPt(deg, dist) { const a = (deg * Math.PI) / 180; return new THREE.Vector3(Math.sin(a) * dist, BASE, -Math.cos(a) * dist); }
/*@@RIENG:s27@@*/
const pulse = new THREE.Mesh(new THREE.RingGeometry(200, 260, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd2442b, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
pulse.position.y = BASE + 1; scene.add(pulse);
/*@@RIENG:s28@@*/
function dashTube(points, color, radius) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: U.time, uC: { value: new THREE.Color(color) }, uP: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float uT,uP; uniform vec3 uC; varying vec2 vUv; void main(){ if(vUv.x>uP) discard; float d=fract(vUv.x*24.-uT*0.8); float a=smoothstep(0.,.15,d)*smoothstep(1.,.6,d); float head=smoothstep(uP-0.04,uP,vUv.x); gl_FragColor=vec4(uC*(1.+head*1.5),0.35+0.6*a);\n#include <colorspace_fragment>\n}' });
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, radius, 8), mat); m.visible = false; m.frustumCulled = false; scene.add(m); return m;
}
// 2.2: mũi tên hướng tiến có ĐẦU NHỌN — ống gạch đứt như dashTube + đầu mũi tam giác dẹt nằm ngang (kiểu bản đồ tác chiến),
// chạy theo tiến độ vẽ, chỉ theo hướng đi; viền sẫm để nổi trên nền
const _mtT = new THREE.Vector3();
function tamGiac(W, L, h) {
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-W, -L); sh.lineTo(0, -L * 0.72); sh.lineTo(W, -L); sh.closePath();
  return new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2);   // đỉnh tại gốc, chỉ về −Z
}
function muiTen(points, color, radius) {
  const m = dashTube(points, color, radius), curve = new THREE.CatmullRomCurve3(points);
  const W = radius * 3.2, L = radius * 7.5, dau = new THREE.Group();
  const vien = new THREE.Mesh(tamGiac(W, L, radius * 0.5).translate(0, 0, -L * 0.6).scale(1.16, 1, 1.16).translate(0, -radius * 0.3, L * 0.6), new THREE.MeshBasicMaterial({ color: 0x3a1208, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  const than = new THREE.Mesh(tamGiac(W, L, radius * 0.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.2), transparent: true, opacity: 0.97, depthWrite: false, side: THREE.DoubleSide }));
  vien.renderOrder = 3; than.renderOrder = 4; dau.add(vien, than);
  dau.visible = false; dau.traverse((o) => { o.frustumCulled = false; }); scene.add(dau);
  m.userData.curve = curve; m.userData.dau = dau; m.userData.lui = L * 0.62 / Math.max(1, curve.getLength()); return m;   // lui: ống dừng sau đỉnh mũi (không thò ra)
}
function muiTenDat(m, on, p = 1) {          // bật/tắt + tiến độ 0..1 (đầu mũi đi theo chỗ đang vẽ tới)
  m.visible = on; const d = m.userData.dau; if (!d) return; d.visible = on && p > 0.02; if (!on) return;
  if (m.material.uniforms) m.material.uniforms.uP.value = Math.max(0, p - (m.userData.lui || 0));
  const c = m.userData.curve, u = Math.min(1, Math.max(0.001, p));
  c.getPointAt(u, d.position); c.getTangentAt(u, _mtT); d.rotation.set(0, Math.atan2(-_mtT.x, -_mtT.z), 0);
}
/*@@RIENG:s29@@*/
// ------------------------------------------------------------------ SkyDirector
/*@@RIENG:s30@@*/
const skySel = $('skySel');
skySel.innerHTML = '<option value="">Theo kịch bản</option>' + Object.keys(SKY).map((k) => `<option>${k}</option>`).join('');
const cA = new THREE.Color(), cB = new THREE.Color();
function mixHex(a, b, u, out) { cA.set(a); cB.set(b); return out.copy(cA).lerp(cB, u); }
/*@@RIENG:s31@@*/
const G = (x, z, up = 0) => Math.max(hAt(x, z), tideNow) + up;
/*@@RIENG:s32@@*/
function fly(a, b, la, lb, fov = 45) { return (u) => [a.clone().lerp(b, ease(u)), la.clone().lerp(lb, ease(u)), fov]; }
function orbit(c, r, h, a0, a1, fov = 45, h1) { return (u) => { const a = lerp(a0, a1, ease(u)); const hh = h1 === undefined ? h : lerp(h, h1, ease(u)); return [V3(c.x + Math.sin(a) * r, c.y + hh, c.z + Math.cos(a) * r), c.clone(), fov]; }; }
/*@@RIENG:s33@@*/
function boatCam(j, lx, ly, lz, tx, ty, tz, fov = 42) { return (u) => { const b = boats[j]; const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.yaw, 0)); const p = V3(lx, ly, lz).applyQuaternion(q).add(V3(b.x, b.y, b.z)); const tt = V3(tx, ty, tz).applyQuaternion(q).add(V3(b.x, b.y, b.z)); return [p, tt, fov]; }; }
function objCam(obj, lx, ly, lz, tx, ty, tz, fov = 35, l2) { return (u) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, obj.rotation.y, 0)); const off = l2 ? V3(lerp(lx, l2[0], ease(u)), lerp(ly, l2[1], ease(u)), lerp(lz, l2[2], ease(u))) : V3(lx, ly, lz); return [off.applyQuaternion(q).add(obj.position), V3(tx, ty, tz).applyQuaternion(q).add(obj.position), fov]; }; }
/*@@RIENG:s34@@*/
const ALL_SHOTS = STORY.scenes.flatMap((s) => s.shots.map((sh) => ({ ...sh, scene: s })));
function shotAt(t) { for (const s of ALL_SHOTS) if (t >= s.t0 && t < s.t1) return s; return ALL_SHOTS[ALL_SHOTS.length - 1]; }
/*@@RIENG:s35@@*/
const SECTION_SHOTS = new Set(['C04-F']);
/*@@RIENG:s36@@*/
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KX = Math.cos((META.lat0 * Math.PI) / 180) * 111320, KZ = 110574;
const toLL = (x, z) => ({ lat: META.lat0 - z / KZ, lon: META.lon0 + x / KX });
/*@@RIENG:s37@@*/
const DUR = STORY.duration, SC = STORY.scenes, NSC = SC.length;
const fmtT = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const sceneIdx = (t) => { let i = 0; while (i < NSC - 1 && t >= SC[i + 1].t0) i++; return i; };

// ------------------------------------------------------------------ trạng thái
let T = 0, playing = false, speed = 1, appMode = 'film', povOn = false, userCam = false, tideAuto = true, forcedSky = '';
let exploreI = 0, sectionShot = false, lastShot = '', lastScene = '', lastLine = '', flyA = null, held = null;
const camLook = new THREE.Vector3();
const veil = $('veil'), card = $('card');
controls.enabled = true; controls.enableDamping = true; controls.dampingFactor = 0.1; controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 4; controls.maxDistance = 40000; controls.autoRotateSpeed = 0.6;
try { controls.zoomToCursor = true; } catch (e) {}

// ------------------------------------------------------------------ mốc, nhãn
/*@@RIENG:s38@@*/
const anchors = new Map(), pins = new Map(), moves = new Map(), labels = [];
/*@@RIENG:s39@@*/
const v3 = new THREE.Vector3();
/*@@RIENG:s40@@*/
function showCard(name) {
  const A = anchors.get(name), ll = toLL(A.x, A.z), mv = moves.get(name), body = $('infobody'); body.replaceChildren();
  const h = document.createElement('h2'); h.textContent = A.text;
  const p = document.createElement('p'); p.textContent = A.desc;
  const m = document.createElement('div'); m.className = 'src';
  m.textContent = `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · cao ${hG(A.x, A.z).toFixed(1)} m` + (mv ? ` · đã dời ${Math.round(Math.hypot(mv.x - A.x0, mv.z - A.z0))} m` : '');
  const acts = document.createElement('div'); acts.className = 'acts';
  const b1 = document.createElement('button'); b1.className = 'gold'; b1.textContent = 'Bay tới'; b1.onclick = () => flyTo(A.x, A.z, 600);
  const b2 = document.createElement('button'); b2.textContent = 'Ghi chú tại mốc này'; b2.onclick = () => openDialog(null, { x: A.x, z: A.z }, `Mốc ${A.text}: `);
  acts.append(b1, b2); body.append(h, p, m, acts);
  $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); $('info').hidden = false;
}
$('infox').onclick = () => { $('info').hidden = true; };

// ------------------------------------------------------------------ máy quay: bay, xoay, cụm điều khiển
function poseFrom(x, z, d, az, el) {
  const y = Math.max(hG(x, z), tideNow), a = (az * Math.PI) / 180, e = (el * Math.PI) / 180, hh = d * Math.cos(e);
  return { tgt: V3(x, y, z), pos: V3(x + Math.sin(a) * hh, y + d * Math.sin(e), z - Math.cos(a) * hh) };
}
function flyPose(v, instant) {
  if (instant || reduceMotion) { camera.position.copy(v.pos); controls.target.copy(v.tgt); controls.update(); flyA = null; return; }
  const dd = camera.position.distanceTo(v.pos) + controls.target.distanceTo(v.tgt);
  flyA = { t0: performance.now(), p0: camera.position.clone(), q0: controls.target.clone(), p1: v.pos, q1: v.tgt, dur: 1100 + Math.min(1600, dd / 10), arc: Math.min(dd * 0.12, 2500) };
}
function takeOver() {
  if (appMode === 'film' && !userCam && !povOn) { userCam = true; $('sret').hidden = false; document.body.classList.remove('cancanh'); controls.target.copy(camLook); }
}
controls.addEventListener('start', () => { takeOver(); setAuto(false); flyA = null; });
function flyTo(x, z, dist = 900) {
  takeOver();
  const y = Math.max(hG(x, z), tideNow), tgt = V3(x, y, z), dir = camera.position.clone().sub(controls.target).normalize();
  const pos = tgt.clone().add(dir.multiplyScalar(dist)); if (pos.y < y + dist * 0.35) pos.y = y + dist * 0.35;
  flyPose({ pos, tgt }); document.querySelectorAll('#views button').forEach((b) => b.classList.remove('on'));
}
/*@@RIENG:s41@@*/
function goView(name, instant) {
  if (W.on) { const v = VIEWS[name]; if (name === 'all') setWalk(false); else placeAvatarAt(v[0] - 30, v[1] + 30); return; }
  setAuto(false); takeOver(); const v = VIEWS[name]; flyPose(poseFrom(...v), instant);
  document.querySelectorAll('#views button').forEach((b) => b.classList.toggle('on', b.dataset.v === name));
}
$('views').addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b) goView(b.dataset.v); });
const sph = new THREE.Spherical();
function orbitCam(dT, dP, zf) {
  flyA = null; takeOver();
  const off = camera.position.clone().sub(controls.target); sph.setFromVector3(off);
  sph.theta += dT; sph.phi = clamp(sph.phi + dP, 0.05, controls.maxPolarAngle); sph.radius = clamp(sph.radius * zf, controls.minDistance, controls.maxDistance);
  off.setFromSpherical(sph); camera.position.copy(controls.target).add(off);
}
const ACTS = { left: [-0.025, 0, 1], right: [0.025, 0, 1], up: [0, -0.015, 1], down: [0, 0.015, 1], in: [0, 0, 0.965], out: [0, 0, 1.036] };
function north() { takeOver(); const off = camera.position.clone().sub(controls.target); sph.setFromVector3(off); sph.theta = Math.PI; off.setFromSpherical(sph); flyPose({ pos: controls.target.clone().add(off), tgt: controls.target.clone() }); }
document.querySelectorAll('#pad [data-act]').forEach((b) => {
  const act = b.dataset.act;
  if (act === 'north') { b.addEventListener('click', north); return; }
  const start = (e) => { e.preventDefault(); setAuto(false); held = ACTS[act]; b.setPointerCapture?.(e.pointerId); };
  const stop = () => { held = null; };
  b.addEventListener('pointerdown', start); b.addEventListener('pointerup', stop); b.addEventListener('pointercancel', stop); b.addEventListener('pointerleave', stop);
  b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const a = ACTS[act]; for (let k = 0; k < 8; k++) orbitCam(a[0], a[1], a[2]); } });
});
function setAuto(on) { controls.autoRotate = on; $('autorot').setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) takeOver(); }
$('autorot').onclick = () => setAuto(!controls.autoRotate);

// ------------------------------------------------------------------ bản đồ nhỏ (vòng tròn sa bàn, Bắc lên trên)
const mm = $('mm'), mmx = mm.getContext('2d'); mm.width = mm.height = 300;
const mmImg = colorTex.image;
const mmPx = (x, z) => [((x + R) / (2 * R)) * 300, ((z + R) / (2 * R)) * 300];
/*@@RIENG:s42@@*/
// ------------------------------------------------------------------ chọn điểm trên địa hình
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function pickGround(e) {
  const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(TERRAIN, false)[0];
  waterPlane.constant = -tideNow; const wp = new THREE.Vector3(); const hw = raycaster.ray.intersectPlane(waterPlane, wp);
  let p = hit ? hit.point : null;
  if (hw && Math.hypot(wp.x, wp.z) < R && (!p || wp.distanceTo(camera.position) < p.distanceTo(camera.position))) p = wp;
  return p && Math.hypot(p.x, p.z) < R ? p : null;
}
function showReadout(p) { const ll = toLL(p.x, p.z); $('readout').textContent = `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · cao ${hG(p.x, p.z).toFixed(1)} m · nước ${tideNow >= 0 ? '+' : '−'}${Math.abs(tideNow).toFixed(1)} m`; }

// ------------------------------------------------------------------ chế độ thao tác (xem / kéo mốc / ghi chú) và review chung
let uiMode = 'view', dragging = null, downAt = null, hoverQ = null;
const HELP = { view: 'Bấm vào điểm bất kỳ để bay tới · kéo để xoay · chuột phải để dời · cuộn/chụm để phóng to',
  drag: 'Kéo mốc vàng hoặc ghi chú đỏ tới vị trí mới · thả ra là lưu cho cả nhóm · Esc để thoát',
  add: 'Bấm vào chỗ cần góp ý trên sa bàn để đặt ghi chú · Esc để thoát' };
function setUiMode(m) { uiMode = m; $('m-drag').setAttribute('aria-pressed', m === 'drag'); $('m-add').setAttribute('aria-pressed', m === 'add'); $('help').textContent = HELP[m]; renderer.domElement.style.cursor = m === 'add' ? 'crosshair' : ''; }
$('m-drag').onclick = () => setUiMode(uiMode === 'drag' ? 'view' : 'drag');
$('m-add').onclick = () => setUiMode(uiMode === 'add' ? 'view' : 'add');
function startDrag(d, e) {
  dragging = { ...d }; controls.enabled = false;
  const mv = (ev) => { const p = pickGround(ev); if (!p) return; dragging.x = p.x; dragging.z = p.z;
    if (d.kind === 'anchor') { const A = anchors.get(d.name); A.x = A.label.x = p.x; A.z = A.label.z = p.z; } else { const P = pins.get(d.id); if (P) { P.x = P.label.x = p.x; P.z = P.label.z = p.z; } }
    showReadout(p); };
  const up = async () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); controls.enabled = !povOn; const D = dragging; dragging = null;
    if (D.x === undefined) return; if (D.kind === 'anchor') await saveMove(D.name, D.x, D.z); else await savePinPos(D.id, D.x, D.z); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
const cvs = renderer.domElement;
cvs.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
cvs.addEventListener('pointermove', (e) => { if (appMode !== 'explore') return; if (!hoverQ) { hoverQ = e; requestAnimationFrame(() => { const p = pickGround(hoverQ); hoverQ = null; if (p) showReadout(p); }); } else hoverQ = e; });
cvs.addEventListener('pointerup', (e) => {
  const moved = downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5;
  if (moved || e.button !== 0 || povOn) return;
  if (uiMode === 'add') { const p = pickGround(e); if (p) openDialog(null, { x: p.x, z: p.z }); return; }
  if (appMode === 'explore' && !W.on) { const p = pickGround(e); if (p) flyTo(p.x, p.z, clamp(camera.position.distanceTo(controls.target) * 0.72, 150, 9000)); }
});
let db = null, userApi = null, myId = null, canWrite = null, local = false; const names = {};
const CAT = { vitri: 'Sửa vị trí', bosung: 'Bổ sung', suseu: 'Sử liệu', hoi: 'Câu hỏi' };
function sync(st, text) { $('syncdot').className = 'dot ' + st; $('synctext').textContent = text; }
async function connectStore() {
  const use = window.claude && window.claude.use ? window.claude.use.bind(window.claude) : null;
  if (!use) { local = true; sync('warn', 'Chế độ cục bộ: ghi chú chỉ nằm trong phiên này'); renderList(); return; }
  const timer = setTimeout(() => { if (!db) sync('warn', 'Chưa kết nối được kho ghi chú, đang thử tiếp…'); }, 10000);
  try { db = await use('db'); } catch (e) { db = null; }
  try { userApi = await use('user'); if (userApi) { myId = await userApi.id(); const c = userApi.can ? await userApi.can('data.write') : null; if (c === false) canWrite = false; } } catch (e) {}
  if (!db) { clearTimeout(timer); local = true; sync('warn', 'Chế độ cục bộ: ghi chú chỉ nằm trong phiên này'); renderList(); return; }
  let fp = false, fm = false; const ready = () => { if (fp && fm) { clearTimeout(timer); sync('on', canWrite === false ? 'Đã kết nối · anh chỉ có quyền xem' : 'Đã lưu chung cho cả nhóm'); } };
  db.collection('pins').onSnapshot((snap) => { const seen = new Set(); for (const d of snap.docs) { seen.add(d.id); upsertPin(d.id, d.data()); } for (const id of [...pins.keys()]) if (!seen.has(id)) removePin(id); if (!snap.metadata.fromCache) { fp = true; ready(); } renderList(); }, (err) => sync('warn', 'Mất kết nối kho ghi chú (' + err.code + ')'));
  db.collection('moves').onSnapshot((snap) => { const seen = new Set(); for (const d of snap.docs) { seen.add(d.id); applyMove(d.id, d.data()); } for (const n of [...moves.keys()]) if (!seen.has(n)) clearMove(n); if (!snap.metadata.fromCache) { fm = true; ready(); } renderList(); }, (err) => sync('warn', 'Mất kết nối kho ghi chú (' + err.code + ')'));
}
function failWrite(e) { if (e && e.code === 'invalid_argument') { canWrite = false; sync('warn', 'Anh chỉ có quyền xem, không lưu được thay đổi'); } else if (e && e.code === 'quota_exceeded') sync('warn', 'Kho ghi chú đã đầy'); else sync('warn', 'Chưa lưu được, thử lại sau ít phút'); }
const nowIso = () => new Date().toISOString();
function upsertPin(id, doc) {
  let P = pins.get(id);
  if (!P) { P = { label: addLabel('', doc.x, doc.z, 'pin', { grp: 'pin', onClick: () => openDialog(id), drag: { kind: 'pin', id } }) }; pins.set(id, P); }
  P.doc = doc; P.x = P.label.x = doc.x; P.z = P.label.z = doc.z;
  P.label.b.textContent = doc.title || 'Ghi chú'; P.label.cls = doc.status === 'xong' ? 'pin done' : 'pin'; P.label.el.className = 'lbl ' + P.label.cls;
}
function removePin(id) { const P = pins.get(id); if (!P) return; P.label.el.remove(); labels.splice(labels.indexOf(P.label), 1); pins.delete(id); }
function applyMove(name, doc) { const A = anchors.get(name); if (!A) return; moves.set(name, doc); A.x = A.label.x = doc.x; A.z = A.label.z = doc.z; A.label.el.classList.add('moved'); }
function clearMove(name) { const A = anchors.get(name); moves.delete(name); if (!A) return; A.x = A.label.x = A.x0; A.z = A.label.z = A.z0; A.label.el.classList.remove('moved'); }
async function saveMove(name, x, z) {
  const A = anchors.get(name), ll = toLL(x, z), l0 = toLL(A.x0, A.z0);
  const doc = { name, label: A.text, x: +x.toFixed(1), z: +z.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6), from_x: A.x0, from_z: A.z0, from_lat: +l0.lat.toFixed(6), from_lon: +l0.lon.toFixed(6), author: myId, updated: nowIso() };
  if (local) { applyMove(name, doc); renderList(); return; }
  try { await db.collection('moves').doc(name).set(doc); } catch (e) { failWrite(e); }
}
async function undoMove(name) { if (local) { clearMove(name); renderList(); return; } try { await db.collection('moves').doc(name).delete(); } catch (e) { failWrite(e); } }
async function savePinPos(id, x, z) {
  const P = pins.get(id); if (!P) return; const ll = toLL(x, z); const patch = { x: +x.toFixed(1), z: +z.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6), updated: nowIso() };
  if (local) { upsertPin(id, { ...P.doc, ...patch }); renderList(); return; }
  try { await db.collection('pins').doc(id).update(patch); } catch (e) { failWrite(e); upsertPin(id, P.doc); }
}
let editing = null;
function openDialog(id, pos, prefix = '') {
  editing = { id, pos }; const P = id ? pins.get(id) : null, d = P ? P.doc : null;
  $('dlg-title').textContent = d ? 'Sửa ghi chú' : 'Ghi chú mới';
  const x = d ? d.x : pos.x, z = d ? d.z : pos.z, ll = toLL(x, z);
  $('dlg-pos').textContent = `Tại ${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)} · cao độ ${hG(x, z).toFixed(1)} m · ${SC[sceneIdx(T)].id}`;
  $('f-cat').value = d ? d.cat : 'vitri'; $('f-title').value = d ? d.title : prefix; $('f-text').value = d ? d.text || '' : '';
  $('f-del').style.display = d ? '' : 'none';
  const ro = canWrite === false; for (const f of ['f-cat', 'f-title', 'f-text', 'f-save', 'f-del']) $(f).disabled = ro;
  $('dlg').classList.add('show'); $('f-title').focus();
}
function closeDialog() { $('dlg').classList.remove('show'); editing = null; }
$('f-cancel').onclick = closeDialog;
$('dlg').addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDialog(); });
$('dlg-form').addEventListener('submit', async (e) => {
  e.preventDefault(); if (!editing) return;
  const body = { cat: $('f-cat').value, title: $('f-title').value.trim() || 'Ghi chú', text: $('f-text').value.trim(), updated: nowIso() };
  const { id, pos } = editing; closeDialog();
  if (id) { if (local) { upsertPin(id, { ...pins.get(id).doc, ...body }); renderList(); return; } try { await db.collection('pins').doc(id).update(body); } catch (err) { failWrite(err); } }
  else {
    const ll = toLL(pos.x, pos.z), doc = { ...body, x: +pos.x.toFixed(1), z: +pos.z.toFixed(1), lat: +ll.lat.toFixed(6), lon: +ll.lon.toFixed(6), canh: SC[sceneIdx(T)].id, status: 'mo', author: myId, created: nowIso() };
    if (local) { upsertPin('l' + Date.now(), doc); renderList(); return; }
    try { await db.collection('pins').add(doc); } catch (err) { failWrite(err); }
  }
  setUiMode('view');
});
$('f-del').onclick = async () => { if (!editing || !editing.id) return; const id = editing.id; closeDialog(); if (local) { removePin(id); renderList(); return; } try { await db.collection('pins').doc(id).delete(); } catch (err) { failWrite(err); } };
async function toggleDone(id) { const P = pins.get(id); const status = P.doc.status === 'xong' ? 'mo' : 'xong'; if (local) { upsertPin(id, { ...P.doc, status }); renderList(); return; } try { await db.collection('pins').doc(id).update({ status, updated: nowIso() }); } catch (e) { failWrite(e); } }
let tab = 'pins';
$('tab-pins').onclick = () => { tab = 'pins'; $('tab-pins').setAttribute('aria-selected', 'true'); $('tab-moves').setAttribute('aria-selected', 'false'); renderList(); };
$('tab-moves').onclick = () => { tab = 'moves'; $('tab-moves').setAttribute('aria-selected', 'true'); $('tab-pins').setAttribute('aria-selected', 'false'); renderList(); };
const fmtTime = (s) => { try { return new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
async function resolveNames(ids) { ids = ids.filter((i) => i && !(i in names)); if (!ids.length || !userApi || !userApi.profiles) return; try { const ps = await userApi.profiles(ids); for (const i of ids) names[i] = (ps[i] && ps[i].name) || 'Ai đó'; renderList(); } catch (e) {} }
function btn(text, fn) { const b = document.createElement('button'); b.textContent = text; b.onclick = fn; return b; }
/*@@RIENG:s43@@*/
// ------------------------------------------------------------------ đi bộ trên sa bàn (nhân vật có động tác thật)
const W = { boat: false, on: false, keys: {}, joy: { x: 0, y: 0 }, pos: new THREE.Vector3(), yaw: 0, fp: false, run: false, moving: false, runNow: false };
const WET = (x, z) => hG(x, z) < tideNow - 0.55;                 // đủ sâu để chèo thuyền
const groundW = (x, z) => (W.boat ? tideNow - 0.18 : Math.max(hG(x, z), tideNow - 0.9));
function placeAvatarAt(x, z) {
  const r = Math.hypot(x, z); if (r > R - 25) { x *= (R - 25) / r; z *= (R - 25) / r; }
  const old = W.pos.clone(); W.pos.set(x, groundW(x, z), z);
  if (W.on) { const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d); }
}
/*@@RIENG:s44@@*/
function setPovWalk() {
  W.fp = $('pov').value === '1'; if (!W.on) return;
  const dir = camera.position.clone().sub(controls.target);
  if (W.fp) { dir.set(-Math.sin(W.yaw), 0, -Math.cos(W.yaw)).setLength(0.35); controls.minPolarAngle = Math.PI * 0.3; controls.maxPolarAngle = Math.PI * 0.62; }
  else { dir.setLength(9); controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.49; }
  camera.position.copy(controls.target).add(dir); controls.minDistance = W.fp ? 0.3 : 3; controls.maxDistance = W.fp ? 0.4 : 80; controls.update();
}
$('pov').onchange = setPovWalk; $('bwalk').onclick = () => setWalk(!W.on);
$('runbtn').onclick = () => { W.run = !W.run; $('runbtn').classList.toggle('on', W.run); $('runbtn').setAttribute('aria-pressed', W.run); };
const camF = new THREE.Vector3(), camR = new THREE.Vector3(), mvv = new THREE.Vector3();
function walkTick(dt) {
  const k = W.keys, f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - W.joy.y, r = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + W.joy.x;
  const run = W.run || k.ShiftLeft || k.ShiftRight || Math.hypot(W.joy.x, W.joy.y) > 0.92, m = Math.min(1, Math.hypot(f, r));
  W.moving = m > 0.05; W.runNow = run;
  camera.getWorldDirection(camF); camF.y = 0; camF.normalize(); camR.set(-camF.z, 0, camF.x);
  mvv.set(0, 0, 0).addScaledVector(camF, f).addScaledVector(camR, r); const old = W.pos.clone();
  if (W.moving) {
    mvv.normalize();
    if (W.boat) {                                                   // chèo thuyền: quay mũi từ từ, tốc độ thuyền nhẹ 2,5–4,5 m/s
      const want = Math.atan2(mvv.x, mvv.z); let dA = ((want - W.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; W.yaw += clamp(dA, -1.4 * dt, 1.4 * dt);
      const sp = (run ? 4.5 : 2.5) * m * Math.max(0.2, Math.cos(dA)), nx = W.pos.x + Math.sin(W.yaw) * sp * dt, nz = W.pos.z + Math.cos(W.yaw) * sp * dt;
      if (WET(nx, nz)) placeAvatarAt(nx, nz); else if (hG(nx, nz) > tideNow - 0.1) { W.boat = false; placeAvatarAt(nx, nz); } else W.moving = false;
    } else {
      const sp = (run ? 7 : 2.0) * m, nx = W.pos.x + mvv.x * sp * dt, nz = W.pos.z + mvv.z * sp * dt; W.yaw = Math.atan2(mvv.x, mvv.z);
      if (WET(nx, nz)) { W.boat = true; placeAvatarAt(nx, nz); } else placeAvatarAt(nx, nz);   // bước xuống nước sâu → lên thuyền
    }
  }
  else W.pos.y = groundW(W.pos.x, W.pos.z);
  // V1.8 Khe Sanh (anh Thắng: đi bộ thì máy quay chạy nhanh hơn nhân vật, trôi ra trước): placeAvatarAt() đã dời máy quay theo nhân vật khi W.on —
  // trước đây dời thêm lần nữa ở đây → máy đi gấp đôi. Chỉ bù phần độ cao khi đứng yên.
  if (!W.moving) { const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d); }
  controls.target.y += (W.pos.y + (W.fp ? 2.55 : 2.4) - controls.target.y) * Math.min(1, dt * 8);
}
const _avQ = new THREE.Quaternion(), _hideM = new THREE.Matrix4().makeScale(0, 0, 0);
/*@@RIENG:s45@@*/
// ------------------------------------------------------------------ góc nhìn nhân vật (phim vẫn chạy theo lời bình)
const eyeOf = (o, h) => ({ p: o.position.clone().add(V3(Math.sin(o.rotation.y) * 0.35, h * EXAG + 0.05, Math.cos(o.rotation.y) * 0.35)), yaw: o.rotation.y });
function boatEye(b, c) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.yaw, 0)); return { p: V3(0, BOAT_DECK * BOAT_S + 1.45 * EXAG, (2.0 - c * 1.3) * BOAT_S + 0.4).applyQuaternion(q).add(V3(b.x, b.y, b.z)), yaw: b.yaw }; }
/*@@RIENG:s46@@*/
const POV = { sel: 0, dd: -1, yaw: 0, pitch: -0.05, drag: null, eye: new THREE.Vector3(), has: false };
{
  const sel = $('povsel'), g1 = document.createElement('optgroup'), g2 = document.createElement('optgroup'); g1.label = 'Nhìn qua mắt nhân vật'; g2.label = 'Đứng xem tại địa điểm';
  POV_VAI.forEach(([t], k) => { const o = document.createElement('option'); o.value = k; o.textContent = t; g1.append(o); });
  POV_DD.forEach(([t], k) => { const o = document.createElement('option'); o.value = 'd' + k; o.textContent = t; g2.append(o); });
  sel.append(g1, g2);
  sel.onchange = (e) => { const v = e.target.value; POV.dd = v[0] === 'd' ? +v.slice(1) : -1; POV.sel = POV.dd < 0 ? +v : 0; POV.yaw = 0; POV.pitch = POV.dd >= 0 ? -0.12 : -0.05; POV.has = false; };
  cvs.addEventListener('pointerdown', (e) => { if (povOn) POV.drag = [e.clientX, e.clientY]; });
  addEventListener('pointermove', (e) => { if (!POV.drag) return; POV.yaw -= (e.clientX - POV.drag[0]) * 0.005; POV.pitch = clamp(POV.pitch - (e.clientY - POV.drag[1]) * 0.004, -1.1, 0.9); POV.drag = [e.clientX, e.clientY]; });
  addEventListener('pointerup', () => { POV.drag = null; });
}
/*@@RIENG:s47@@*/
// ------------------------------------------------------------------ chế độ xem, phim, menu
function setAppMode(m) {
  const pov = m === 'pov'; if (pov) m = 'film';
  if (m !== 'explore' && W.on) setWalk(false);
  appMode = m; povOn = pov;
  document.body.classList.remove('m-film', 'm-explore', 'm-compare', 'm-pov'); document.body.classList.add('m-' + m); document.body.classList.toggle('m-pov', pov);
  $('povbar').hidden = !pov; controls.enabled = !pov;
  document.querySelectorAll('#modes button').forEach((b) => { const on = b.dataset.m === (pov ? 'pov' : m); b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  $('filmbar').hidden = m !== 'film'; $('explorebar').hidden = m !== 'explore';
  if (m !== 'explore') { if (uiMode !== 'view') setUiMode('view'); $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); }
  if (m === 'film') { userCam = false; $('sret').hidden = true; controls.autoRotate = false; }
  else { setPlaying(false); $('scenes').hidden = true; }
  if (m === 'explore') {
    exploreI = sceneIdx(T); $('dslider').value = exploreI; onExplore(); $('help').textContent = HELP[uiMode];
    controls.target.copy(camLook); if (camera.fov !== 45) { camera.fov = 45; camera.updateProjectionMatrix(); }
  }
  setSection(false); sectionShot = false; if (!$('docs').hidden) fillDocs(); updSub(true);
}
$('modes').addEventListener('click', (e) => { const b = e.target.closest('button[data-m]'); if (b) setAppMode(b.dataset.m); });
function onExplore() { const sc = SC[exploreI]; T = sc.t0 + (sc.t1 - sc.t0) * 0.45; $('dlabel').textContent = `${sc.id} · ${sc.title}`; $('sdate').textContent = 'KHÁM PHÁ · ' + sc.title; if (!$('docs').hidden) fillDocs(); }
$('dslider').max = NSC - 1;
$('dslider').addEventListener('input', (e) => { exploreI = +e.target.value; onExplore(); });
$('tide').oninput = () => { tideAuto = false; $('btide').classList.remove('on'); $('btide').setAttribute('aria-pressed', 'false'); };
$('btide').onclick = () => { tideAuto = !tideAuto; $('btide').classList.toggle('on', tideAuto); $('btide').setAttribute('aria-pressed', tideAuto); };
skySel.onchange = () => { forcedSky = skySel.value; };
// V1.7 (anh Thắng: xử lý màn hình nghỉ khi không chạm vào): giữ màn hình sáng khi đang phát phim hoặc đang đi bộ — Screen Wake Lock (nếu trình duyệt cho),
// dự phòng một đoạn video câm 2 s, 16×16 điểm ảnh, lặp vô hạn (cách NoSleep: iOS không cho màn hình nghỉ khi có video đang chạy)
const THUC = { v: null, wl: null, muon: false };
function thuc(on) { THUC.muon = on;
  if (on) { if ('wakeLock' in navigator && !THUC.wl) navigator.wakeLock.request('screen').then((l) => { THUC.wl = l; l.addEventListener('release', () => { THUC.wl = null; }); }).catch(() => {});
    if (!THUC.v) { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('aria-hidden', 'true');
      v.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1'; v.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAbMbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAwV0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAQAAABAAAAAAJ9bWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAoAAAAUABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAACKG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAehzdGJsAAAAvHN0c2QAAAAAAAAAAQAAAKxhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAMmF2Y0MBZAAK/+EAF2dkAAqs2V7ARAAAAwAEAAADACg8SJZYAQAEaO+8sP34+AAAAAAQcGFzcAAAAAEAAAABAAAAFGJ0cnQAAAAAAAANNAAADTQAAAAYc3R0cwAAAAAAAAABAAAACgAACAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAAGBjdHRzAAAAAAAAAAoAAAABAAAQAAAAAAEAACgAAAAAAQAAEAAAAAABAAAAAAAAAAEAAAgAAAAAAQAAKAAAAAABAAAQAAAAAAEAAAAAAAAAAQAACAAAAAABAAAQAAAAAChzdHNjAAAAAAAAAAIAAAABAAAAAgAAAAEAAAACAAAAAQAAAAEAAAA8c3RzegAAAAAAAAAAAAAACgAAAtQAAAANAAAADQAAAA0AAAANAAAADgAAAA8AAAANAAAADQAAAA4AAAA0c3RjbwAAAAAAAAAJAAAG/AAACfIAAAoHAAAKHAAACi0AAApDAAAKVgAACmsAAAp8AAAC8XRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAIAAAAAAAAH0AAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAB9AAAAQAAAEAAAAAAmltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAB9AAABCgFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAIUbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAHYc3RibAAAAH5zdHNkAAAAAAAAAAEAAABubXA0YQAAAAAAAAABAAAAAAAAAAAAAQAQAAAAAB9AAAAAAAA2ZXNkcwAAAAADgICAJQACAASAgIAXQBUAAAAAAB9AAAABPwWAgIAFFYhW5QAGgICAAQIAAAAUYnRydAAAAAAAAB9AAAABPwAAACBzdHRzAAAAAAAAAAIAAAAQAAAEAAAAAAEAAAKAAAAAcHN0c2MAAAAAAAAACAAAAAEAAAABAAAAAQAAAAIAAAACAAAAAQAAAAQAAAABAAAAAQAAAAUAAAACAAAAAQAAAAYAAAABAAAAAQAAAAcAAAACAAAAAQAAAAgAAAABAAAAAQAAAAkAAAAFAAAAAQAAAFhzdHN6AAAAAAAAAAAAAAARAAAAFQAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAA0c3RjbwAAAAAAAAAJAAAJ3QAACf8AAAoUAAAKKQAACjsAAApSAAAKYwAACngAAAqKAAAAGnNncGQBAAAAcm9sbAAAAAIAAAAB//8AAAAcc2JncAAAAAByb2xsAAAAAQAAABEAAAABAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDAAAAAIZnJlZQAAA6ptZGF0AAACuQYF//+13EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOi0zOi0zIGFuYWx5c2U9MHgzOjB4MyBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9Mi4wMDowLjcwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgc3RpdGNoYWJsZT0xIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTEga2V5aW50PTI1MCBrZXlpbnRfbWluPTUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjIwAIAAAAATZYiEABnOf+x/wlV/0QKRHm1/8QAAAAlBmiQYgxnP/vDeAgBMYXZjNjAuMzEuMTAyAAIwQA4AAAAJQZ5CQgtnP5yBARggBwEYIAcAAAAJAZ5hRBXOf6GAARggBwEYIAcAAAAJAZ5jRBXOf6GBARggBwAAAApBmmg0TEFs5/7hARggBwEYIAcAAAALQZ6GRREsFs5/nIEBGCAHAAAACQGepUQVzn+hgQEYIAcBGCAHAAAACQGep0QVzn+hgAEYIAcAAAAKQZqpNExBXOf+4AEYIAcBGCAHARggBwEYIAcBGCAH'; document.body.append(v); THUC.v = v; }
    if (THUC.v.paused) THUC.v.play().catch(() => {}); }
  else { if (THUC.wl) { THUC.wl.release().catch(() => {}); THUC.wl = null; } if (THUC.v && !THUC.v.paused) THUC.v.pause(); } }
setInterval(() => { try { thuc((appMode === 'film' && playing) || W.on); } catch (e) {} }, 3000);
addEventListener('pointerdown', () => { if (THUC.muon) thuc(true); }, true);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && THUC.muon) { THUC.wl = null; thuc(true); } });
function setPlaying(b) { try { thuc(b || W.on); } catch (e) {} if (b && T >= DUR - 0.1) { T = 0; } playing = b; $('splay').textContent = b ? '⏸' : '▶'; $('splay').setAttribute('aria-label', b ? 'Tạm dừng' : 'Phát'); if (!b) voStop(); else lastLine = ''; }
function goScene(i) { i = clamp(i, 0, NSC - 1); T = SC[i].t0 + 0.01; userCam = false; $('sret').hidden = true; voStop(); lastLine = ''; startBlend(); }
let blend = null; function startBlend() { blend = { t0: performance.now(), p0: camera.position.clone(), q0: camLook.clone() }; }
$('splay').onclick = () => { voUnlock(); setPlaying(!playing); };
$('sprev').onclick = () => { const i = sceneIdx(T); goScene(T - SC[i].t0 > 4 ? i : i - 1); };
$('snext').onclick = () => goScene(sceneIdx(T) + 1);
$('sspeed').onchange = (e) => { speed = parseFloat(e.target.value) || 1; };
$('sret').onclick = () => { userCam = false; $('sret').hidden = true; controls.autoRotate = false; startBlend(); };
$('bscenes').onclick = () => { $('scenes').hidden = !$('scenes').hidden; };
$('scx').onclick = () => { $('scenes').hidden = true; };
SC.forEach((sc, i) => {
  if (i) { const el = document.createElement('i'); el.style.left = `calc(${(sc.t0 / DUR) * 100}% - 1px)`; $('ticks').append(el); }
  const li = document.createElement('li'), b = document.createElement('button'), n = document.createElement('b'), sm = document.createElement('small');
  n.textContent = sc.id; sm.textContent = `${fmtT(sc.t0)} · ${sc.shots.length} góc máy`; b.append(n, sc.title, sm); b.onclick = () => { goScene(i); $('scenes').hidden = true; }; li.append(b); $('slist').append(li);
});
let seeking = false;
$('seek').addEventListener('input', (e) => { seeking = true; T = (e.target.value / 1000) * DUR; userCam = false; $('sret').hidden = true; voStop(); lastLine = ''; });
$('seek').addEventListener('change', () => { seeking = false; });
const panelToggle = (b, p, others) => { $(b).onclick = () => { const open = $(p).hidden; $(p).hidden = !open; $(b).classList.toggle('on', open); $(b).setAttribute('aria-expanded', open); if (open) for (const [ob, op] of others) { $(op).hidden = true; $(ob).classList.remove('on'); } }; };
panelToggle('blayers', 'layerp', [['blegend', 'legend']]); panelToggle('blegend', 'legend', [['blayers', 'layerp']]);
// Tư liệu: chỉ nội dung lịch sử và số liệu của cuộc chiến (theo Đại Việt sử ký toàn thư và các nghiên cứu phổ biến)
/*@@RIENG:s48@@*/
const cinema = (on) => { document.body.classList.toggle('cinema', on); $('bshow').hidden = !on; };
$('bhide').onclick = () => cinema(true); $('bshow').onclick = () => cinema(false);
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (W.on) { if (e.key === 'Escape') setWalk(false); return; }
  const k = e.key, map = { ArrowLeft: 'left', ArrowRight: 'right', q: 'left', e: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out' };
  if (e.code === 'KeyH') cinema(!document.body.classList.contains('cinema'));
  else if (e.code === 'Space' && appMode === 'film' && !(e.target.closest && e.target.closest('button'))) { e.preventDefault(); voUnlock(); setPlaying(!playing); }
  else if (e.code === 'PageDown' && appMode === 'film') goScene(sceneIdx(T) + 1);
  else if (e.code === 'PageUp' && appMode === 'film') goScene(sceneIdx(T) - 1);
  else if (appMode === 'explore' && map[k]) { const a = ACTS[map[k]]; for (let i = 0; i < 4; i++) orbitCam(a[0], a[1], a[2]); e.preventDefault(); }
  else if (k === 'n' || k === 'N') north();
  else if (k === 'Escape') { cinema(false); $('scenes').hidden = true; $('docs').hidden = true; $('bdocs').classList.remove('on'); $('info').hidden = true; if (uiMode !== 'view') setUiMode('view'); }
});
function placePanels() { const tl = document.querySelector('.hud.top .right .tools'); if (tl) document.documentElement.style.setProperty('--rtop', Math.round(tl.getBoundingClientRect().bottom) + 'px'); }
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); placePanels(); });
placePanels(); setTimeout(placePanels, 800);

// ------------------------------------------------------------------ âm thanh nền theo cảnh (tệp thật trong thư mục AmThanh của Ngọc Hồi – Đống Đa)
const AM = { ctx: null, out: null, sfx: null, buf: {}, beds: {}, ready: false, on: false, next: {}, prevT: 0 };
const AM_BED = ['song', 'chim', 'trong', 'hanhquan', 'buoc', 'chientruong', 'danhkiem', 'hetxung', 'noido', 'thaochay'];
const AM_ONE = ['tauchim', 'daroi', 'cung', 'muiten', 'chem'];
/*@@RIENG:s49@@*/
function amShot(n, vol) { const b = AM.buf[n]; if (!b || !AM.ready || !AM.on) return; const s = AM.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = 0.94 + Math.random() * 0.12; const g = AM.ctx.createGain(); g.gain.value = vol; s.connect(g).connect(AM.sfx); s.start(); }
function amEnable(on) {
  AM.on = on;
  if (on && !AM.ctx) {
    const S = window.__amChung ? window.__amChung() : null;                                  // 2.2: âm thanh dùng chung với trang khung ngoài (Artifact) → chạy liền khi đổi tầng
    if (S) { AM.ctx = S.ctx; AM.out = S.out; AM.sfx = S.sfx; AM.buf = S.buf; AM.beds = S.beds; }
    else { AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.out = AM.ctx.createGain(); AM.out.gain.value = 0.9; AM.out.connect(AM.ctx.destination); AM.sfx = AM.ctx.createGain(); AM.sfx.connect(AM.out); }
    MU.init(); amLoad(); }
  if (AM.ctx) { if (on) AM.ctx.resume(); else AM.ctx.suspend(); }
  const b = $('bsnd'); b.classList.toggle('on', on); b.classList.remove('hint'); b.textContent = on ? '🔊 Âm thanh' : '🔇 Âm thanh';
}
const distVol = (x, z) => clamp(1 - Math.hypot(camera.position.x - x, camera.position.z - z, camera.position.y) / 4500, 0.15, 1);
/*@@RIENG:s50@@*/
// ------------------------------------------------------------------ lời bình: giọng tiếng Việt của máy (Web Speech)
const VO = { voice: null, q: 0, on: true };
if ('speechSynthesis' in window) { const pick = () => { VO.voice = speechSynthesis.getVoices().find((v) => /^vi/i.test(v.lang)) || null; }; pick(); speechSynthesis.onvoiceschanged = pick; }
function voStop() { VO.q = 0; try { speechSynthesis.cancel(); } catch (e) {} }
function speak(tx) {
  if (!VO.on || !playing || appMode !== 'film' || !('speechSynthesis' in window) || !voUnlock.done) return;
  if (speechSynthesis.speaking && VO.q > 2) voStop();
  const u = new SpeechSynthesisUtterance(tx.replace(/[“”"…·()]/g, ' ')); u.lang = 'vi-VN'; if (VO.voice) u.voice = VO.voice; u.rate = 1.05 * Math.min(1.4, speed);
  VO.q++; u.onend = u.onerror = () => { VO.q = Math.max(0, VO.q - 1); }; speechSynthesis.speak(u);
}
function voUnlock() { if (!('speechSynthesis' in window) || voUnlock.done) return; voUnlock.done = true; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(' '); u.lang = 'vi-VN'; u.volume = 0; speechSynthesis.speak(u); } catch (e) {} lastLine = ''; }
$('bvo').onclick = (e) => { voUnlock(); VO.on = !VO.on; e.currentTarget.classList.toggle('on', VO.on); if (!VO.on) voStop(); else lastLine = ''; };
$('bsnd').onclick = () => { amEnable(!AM.on); };
$('bsnd').classList.add('hint');
{ const first = (e) => { removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true); voUnlock(); if (e && e.target && e.target.closest && e.target.closest('#bsnd')) return; if (!AM.on) amEnable(true); };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true); }

// ------------------------------------------------------------------ phụ đề
/*@@RIENG:s51@@*/
// ------------------------------------------------------------------ cập nhật mỗi khung hình
let fpsN = 0, fpsT = performance.now();
/*@@RIENG:s52@@*/
const clock = new THREE.Clock();
let first = true;
/*@@RIENG:s53@@*/
