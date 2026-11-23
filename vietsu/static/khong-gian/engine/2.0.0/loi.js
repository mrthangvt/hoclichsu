// Sa bàn Bạch Đằng 938 — three.js
// Hệ thống tách rời: TideController (mực nước), ShipPathController (thuyền), BattleTimeline (sự kiện), CameraDirector (góc máy), SkyDirector (bầu trời)
// Bộ máy sa bàn Việt Sử 2.0.0 (họ Bạch Đằng) — docs/KHUNG_SA_BAN.md. Tách bằng tools/sa_ban/tach_bo_may_2.py từ Bạch Đằng 938 V1.2:
// phần giống Như Nguyệt 1077 nằm ở đây; phần riêng của từng trận ở packs/<id>/rieng.js, cắm vào các chỗ /*@@RIENG:sN@@*/.
import * as THREE from '@@ENGINE@@vendor/three/three.module.min.js';
import { OrbitControls } from '@@ENGINE@@vendor/three/addons/controls/OrbitControls.js';
const PACK = window.__SB.pack, PBASE = window.__SB.base;
const DUONG = [['data/meta.json', 'terrain/meta.json'], ['data/inst.json', 'placement.json'], ['data/story.json', 'story.json'],
  ['data/height.png', 'terrain/height.png'], ['data/color.jpg', 'terrain/color.jpg'], ['data/', 'props/'], ['models/', 'units/'],
  ['nhanvat/', 'units/'], ['am/', 'audio/'], ['nhac/', 'audio/nhac/']];
const PU = (f) => { for (const [a, b] of DUONG) if (f.startsWith(a)) { f = b + f.slice(a.length); break; } return new URL(f, PBASE).href; };   // tệp trong gói

const $ = (id) => document.getElementById(id);
const lp = $('fill'), lm = $('ld-step');
const showErr = (e) => { const el = document.getElementById('lm'); if (el) { el.textContent = 'Lỗi khi tải sa bàn: ' + (e && (e.message || e.reason || e)) ; el.style.color = '#e08a70'; } };
addEventListener('error', (e) => showErr(e.error || e.message));
addEventListener('unhandledrejection', (e) => showErr(e.reason));
const progress = (f, m) => { lp.style.width = (f * 100).toFixed(0) + '%'; if (m) lm.textContent = m; };

// ------------------------------------------------------------------ data
const getJSON = (u) => fetch(PU(u)).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const [META, INST, STORY] = await Promise.all([getJSON('data/meta.json'), getJSON('data/inst.json'), getJSON('data/story.json')]);
progress(0.1, 'Đang dựng địa hình…');
const R = META.R, HALF = META.half, NG = META.N, PX = (2 * HALF) / NG;
const BASE = -32;           // mặt nền ngoài sa bàn
/*@@RIENG:s1@@*/
async function loadBitmap(url) {
  const b = await (await fetch(PU(url))).blob();
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
    HG[i] = META.hmin + q * (META.hmax - META.hmin);
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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9aa6a8, 0.00004);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 160000);
camera.position.set(1600, 900, 10500);
const controls = new OrbitControls(camera, canvas);
controls.enabled = false; controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.495; controls.maxDistance = 30000;

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
const hemi = new THREE.HemisphereLight(0xbfd2e0, 0x4a4434, 0.9);
const amb = new THREE.AmbientLight(0xffffff, 0.35);
const fill = new THREE.PointLight(0xfff2e0, 2.2, 260, 0);
scene.add(sun, sun.target, hemi, amb, fill);

const secPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 2990);
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
const groundMat = fogShader({
  uniforms: { uGround: U.ground, uLight: U.light },
  fpre: 'uniform vec3 uGround; uniform float uLight;',
  fbody: `float r=length(vW.xz); float n=noise(vW.xz*0.0016)*0.55+noise(vW.xz*0.013)*0.3+noise(vW.xz*0.09)*0.15;
    vec3 c=uGround*(0.82+0.32*n)*uLight; float rim=smoothstep(${(R + 900).toFixed(1)},${(R + 60).toFixed(1)},r); c*=1.0-0.18*rim; outc=vec4(c,1.);`,
});
const ground = new THREE.Mesh(new THREE.CircleGeometry(150000, 96), groundMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = BASE; scene.add(ground);

// ------------------------------------------------------------------ terrain
// TH: cao độ đỉnh lưới địa hình; hG(): cao độ đúng theo tam giác lưới (người, cây đặt bằng hàm này để không lún vào sườn đồi)
const TG = 700, TH = new Float32Array((TG + 1) * (TG + 1));
let TERRAIN = null;
function hG(x, z) {
  if (Math.hypot(x, z) > R - 20) return hAt(x, z);
  const cs = (2 * R) / TG, gj = (x + R) / cs, gi = (z + R) / cs, j = Math.min(TG - 1, Math.max(0, Math.floor(gj))), i = Math.min(TG - 1, Math.max(0, Math.floor(gi)));
  const fx = gj - j, fz = gi - i, n = TG + 1, a = TH[i * n + j], b = TH[i * n + j + 1], c = TH[(i + 1) * n + j], d = TH[(i + 1) * n + j + 1];
  return fx + fz <= 1 ? a + (b - a) * fx + (c - a) * fz : d + (c - d) * (1 - fx) + (b - d) * (1 - fz);
}
const colorTex = await new THREE.TextureLoader().loadAsync(PU('data/color.jpg'));
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
    vec2 p=vW.xz; float dist=length(cameraPosition-vW); float amp=1.6/(1.+dist*0.0015);
    float hx=wav(p+vec2(.6,0.))-wav(p-vec2(.6,0.)); float hz=wav(p+vec2(0.,.6))-wav(p-vec2(0.,.6));
    vec3 N=normalize(vec3(-hx*amp,1.,-hz*amp)); vec3 V=normalize(cameraPosition-vW);
    if(cameraPosition.y<uLevel) N=-N;
    float fres=0.02+0.98*pow(1.-max(dot(N,V),0.),5.);
    vec3 Rf=reflect(-V,N); vec3 skyc=mix(uHor,uTop,clamp(Rf.y*1.6,0.,1.));
    float spec=pow(max(dot(Rf,uSunDir),0.),260.)*3.5;
    float dfac=1.-exp(-max(depth,0.)*0.3);
    vec3 base=mix(uShallow,uDeep,dfac);
    float foam=smoothstep(0.5,0.0,depth)*(0.5+0.5*noise(p*0.5+uTime*0.6));
    vec3 col=mix(base,skyc,fres*0.8)+uSunCol*spec;
    col=mix(col,vec3(0.86,0.85,0.8),foam*0.5);
    float a=mix(0.3,0.93,1.-exp(-max(depth,0.)*0.5)); a=max(a,fres*0.85); a=max(a,foam*0.65);
    a*=(1.-0.6*uAnalysis);
    outc=vec4(col,a);`,
});
clipList.push(waterMat);
const water = new THREE.Mesh(new THREE.CircleGeometry(R - 0.3, 360), waterMat);
water.rotation.x = -Math.PI / 2; water.renderOrder = 2; scene.add(water);

// section panel (mặt cắt)
const sectionMesh = new THREE.Mesh(new THREE.PlaneGeometry(1700, 46, 1, 1), fogShader({
  transparent: true, side: THREE.DoubleSide,
  uniforms: { uH: { value: hTex }, uHalf: { value: HALF }, uLevel: U.level, uDeep: U.deep, uZ: { value: secPlane.constant } },
  fpre: 'uniform sampler2D uH; uniform float uHalf,uLevel,uZ; uniform vec3 uDeep;',
  fbody: `vec2 uv=(vec2(vW.x,uZ)+uHalf)/(2.*uHalf); float hb=texture2D(uH,uv).r;
    if(vW.y<hb){ float y=vW.y; float l=noise(vec2(vW.x*0.08,y*3.))*0.5+0.5; vec3 c=mix(vec3(0.10,0.075,0.05),vec3(0.19,0.14,0.09),l); c*=0.85+0.15*sin(y*3.1+noise(vec2(vW.x*0.05,y))*4.); c=mix(c,vec3(0.05,0.04,0.03),smoothstep(hb-3.,hb-14.,y)); if(hb-y<0.25) c=vec3(0.32,0.26,0.18); outc=vec4(c,1.); }
    else if(vW.y<uLevel){ float d=uLevel-vW.y; outc=vec4(mix(vec3(0.16,0.36,0.42),vec3(0.06,0.18,0.24),clamp(d/7.,0.,1.)),0.42); }
    else { discard; }
    if(abs(vW.y-uLevel)<0.06) outc=vec4(0.8,0.9,0.95,1.);`,
}));
sectionMesh.position.set(700, -14, secPlane.constant + 0.2);
sectionMesh.visible = false; scene.add(sectionMesh);

progress(0.35, 'Đang trồng cây, dựng làng…');
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
const hutGeo = merge([
  colored(new THREE.BoxGeometry(7, 2.6, 4.6).translate(0, 1.3, 0), 0x7a6247),
  colored(new THREE.CylinderGeometry(0.01, 4.3, 3.4, 4, 1).rotateY(Math.PI / 4).scale(1.25, 1, 0.92).translate(0, 4.2, 0), 0x9b8456),
]);
/*@@RIENG:s2@@*/
const LAYER = { cay: [], nha: [], coc: [], nv: [], co: [] };   // nhóm đối tượng cho bảng Lớp
LAYER.cay.push(scatter(INST.mangrove.filter(clearOf), mangroveGeo, 1, -0.2, [0.3, 0.04, 0.18]));
LAYER.cay.push(scatter(INST.tree.filter(clearOf), treeGeo, 1, -0.4, [0.3, 0.04, 0.2]));
LAYER.cay.push(scatter(INST.grove.filter(clearOf), groveGeo, 1, -0.3, [0.2, 0.04, 0.15]));
LAYER.nha.push(scatter(INST.hut, hutGeo, 1, -0.1, [0.1, 0.02, 0.12]));

/*@@RIENG:s3@@*/
const propMat = new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 0.9 });
clipList.push(propMat);
/*@@RIENG:s4@@*/
const tableTop = new THREE.Vector3();
{
  const g = new THREE.Group();
  const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7, 5, 4, 1, true).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ color: 0x8a6f4a, roughness: 1, side: THREE.DoubleSide })); tent.position.set(-9, 2.5, -6); g.add(tent);
  const tbl = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 2.4), new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.8 })); tbl.position.set(0, 1.15, 0); g.add(tbl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 6, 24).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd2442b })); ring.position.set(0.1, 1.23, 0.78); g.add(ring);
  for (const lx of [-1.5, 1.5]) for (const lz of [-1.0, 1.0]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), propMat); leg.position.set(lx, 0.55, lz); g.add(leg); }
  for (const [fx, fz] of [[-5, 4], [5, -5], [8, 6]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8, 5), propMat); p.position.set(fx, 4, fz); g.add(p); }
  g.position.copy(CP); scene.add(g);
  tableTop.set(CP.x, CP.y + 1.25, CP.z);
}

// ------------------------------------------------------------------ models
progress(0.45, 'Đang tải nhân vật và chiến thuyền…');
const texLoader = new THREE.TextureLoader();
const b64 = (str) => { const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; };
async function loadModel(name) {
  const d = await getJSON('models/' + name + '.mesh.json');
  const pq = new Uint16Array(b64(d.p)), uq = new Uint16Array(b64(d.uv));
  const pos = new Float32Array(d.n * 3), uv = new Float32Array(d.n * 2);
  for (let i = 0; i < d.n; i++) { for (let k = 0; k < 3; k++) pos[i * 3 + k] = d.lo[k] + pq[i * 3 + k] * d.sc[k]; uv[i * 2] = uq[i * 2] / 65535; uv[i * 2 + 1] = uq[i * 2 + 1] / 65535; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(new THREE.BufferAttribute(d.i32 ? new Uint32Array(b64(d.idx)) : new Uint16Array(b64(d.idx)), 1));
  if (d.nrm) { const nq = new Int8Array(b64(d.nrm)); const nrm = new Float32Array(d.n * 3); for (let i = 0; i < nrm.length; i++) nrm[i] = nq[i] / 127; geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); }
  else geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const map = await texLoader.loadAsync(PU('models/' + d.tex));
  map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true;
  return { geo, mat: new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0 }) };
}
/*@@RIENG:s5@@*/
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
async function nvLoad(kind, cap) {
  const Z = await nvzRead(PU('nhanvat/' + kind + '.nvz')), H = Z.H;
  const map = await texLoader.loadAsync(PU('nhanvat/' + kind + '.jpg')); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }); clipList.push(mat);
  const index = new THREE.BufferAttribute(H.idx32 ? Z.arr(H.idx, Uint32Array) : Z.arr(H.idx, Uint16Array), 1);
  const uv = new THREE.BufferAttribute(Z.arr(H.uv, Float32Array), 2);
  const clips = {};
  for (const [name, c] of Object.entries(H.clips)) {
    const frames = nvzFrames(Z, c.pos, c.nor, c.n, H.q).map(([pos, nor]) => {
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uv);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 3); return g;
    });
    clips[name] = { fps: c.fps, once: !!c.once, frames, mg: Z.arr(c.mg, Float32Array), mt: c.mt ? Z.arr(c.mt, Float32Array) : null, ims: [] };
  }
  // bản soi gương (người ngồi mạn trái chèo bên trái): lật trục x → mặt quay ngược, nên vẽ mặt sau để ánh sáng vẫn đúng
  const matM = new THREE.MeshLambertMaterial({ map, side: THREE.BackSide }); clipList.push(matM);
  matM.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <defaultnormal_vertex>', THREE.ShaderChunk.defaultnormal_vertex.replace(/transformedNormal = - transformedNormal;/g, '')); };   // giữ pháp tuyến đã soi gương, không lật thêm lần nữa
  NVK[kind] = { clips, mat, matM, cap };
}
/*@@RIENG:s6@@*/
const NV_IMS = [];
function nvIM(K, C, f, mir) {
  const arr = mir ? (C.imsM || (C.imsM = [])) : C.ims;
  let im = arr[f];
  if (!im) { im = new THREE.InstancedMesh(C.frames[f], mir ? K.matM : K.mat, mir ? Math.min(K.cap, 160) : K.cap); im.frustumCulled = false; im.count = 0; im.visible = false; scene.add(im); arr[f] = im; NV_IMS.push(im); }
  return im;
}
function nvFrame(C, t, ph, tSeg) { const n = C.frames.length; if (n === 1) return 0; if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg) * C.fps)); return Math.floor(t * C.fps + ph * n) % n; }
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
const WPGEO = {
  giao: merge([colored(new THREE.CylinderGeometry(0.018, 0.018, 2.7, 5).translate(0, 0.45, 0), WOOD), colored(new THREE.ConeGeometry(0.04, 0.34, 6).translate(0, 1.97, 0), IRON), colored(new THREE.ConeGeometry(0.06, 0.12, 6).rotateX(Math.PI).translate(0, 1.76, 0), 0x8a2018)]),
  dao: merge([colored(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 5).translate(0, -0.05, 0), DARK), colored(new THREE.BoxGeometry(0.13, 0.03, 0.05).translate(0, 0.08, 0), 0x8a6a2a), colored(new THREE.BoxGeometry(0.055, 0.85, 0.012).translate(0, 0.52, 0), IRON)]),
  cung: (() => { const a = Math.PI * 0.62, Rr = 0.78; const arc = new THREE.TorusGeometry(Rr, 0.016, 4, 18, a).rotateZ(Math.PI - a / 2).translate(Rr, 0, 0);
    const half = Rr * Math.sin(a / 2), tipx = Rr * (1 - Math.cos(a / 2));
    return merge([colored(arc, WOOD), colored(new THREE.BoxGeometry(0.006, 2 * half, 0.006).translate(tipx, 0, 0), 0xd9d2bf)]); })(),
  cheo: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 1.55, 5).translate(0, -0.25, 0), WOOD), colored(new THREE.BoxGeometry(0.15, 0.48, 0.025).translate(0, -1.15, 0), WOOD), colored(new THREE.BoxGeometry(0.12, 0.04, 0.04).translate(0, 0.52, 0), WOOD)]),
  bua: merge([colored(new THREE.CylinderGeometry(0.02, 0.022, 0.62, 5).translate(0, 0.18, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.1, 0.1).translate(0, 0.48, 0), DARK)]),
  riu: merge([colored(new THREE.CylinderGeometry(0.022, 0.024, 0.85, 5).translate(0, 0.28, 0), WOOD), colored(new THREE.BoxGeometry(0.2, 0.15, 0.025).translate(0.09, 0.62, 0), IRON)]),
  co: merge([colored(new THREE.CylinderGeometry(0.022, 0.022, 3.6, 5).translate(0, 1.0, 0), WOOD), colored(new THREE.ConeGeometry(0.05, 0.16, 6).translate(0, 2.88, 0), 0xc9a24a)]),
};
const WP = {};
const wpMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }); clipList.push(wpMat);
for (const [k, cap] of [['giao', 520], ['dao', 260], ['cung', 200], ['cheo', 240], ['co', 120], ['bua', 24], ['riu', 24]]) { const im = new THREE.InstancedMesh(WPGEO[k], wpMat, cap); im.frustumCulled = false; im.count = 0; scene.add(im); WP[k] = im; }
// cờ hiệu trên cán (ảnh cờ anh gửi: co-trieu-ngo.png — tái dựng giản lược, chưa thẩm định)
const coTex = await texLoader.loadAsync(PU('data/co-trieu-ngo.png')); coTex.colorSpace = THREE.SRGBColorSpace;
/*@@RIENG:s7@@*/
let coOn = true;
/*@@RIENG:s8@@*/
const cpFlag = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.0, 0.7, 10, 2).translate(0.5, -0.36, 0), coMat, 3); cpFlag.frustumCulled = false; scene.add(cpFlag);
[[-5, 4], [5, -5], [8, 6]].forEach(([fx, fz], i) => { dummy.position.set(CP.x + fx, CP.y + 7.95, CP.z + fz); dummy.rotation.set(0, 0.5 + i * 0.12, 0); dummy.scale.setScalar(2.8); dummy.updateMatrix(); cpFlag.setMatrixAt(i, dummy.matrix); });
const _wm2 = new THREE.Matrix4(), _wb = new THREE.Matrix4(), _wd = new THREE.Vector3(), _wu = new THREE.Vector3(), _wo = new THREE.Vector3(), _wz2 = new THREE.Vector3();
function wpPut(type, C, f, Mc, clip, side = 1) {
  if (type === 'co' && !coOn) return;
  const im = WP[type]; if (!im || im.count >= im.instanceMatrix.count) return;
  if (type === 'cung' && clip === 'ngam' && C.mt) {             // cung ở tay trái, dựng đứng, lưng cung quay về phía bắn
    const A = C.mt, o = f * 9; _wd.set(A[o], A[o + 1], A[o + 2]).normalize(); _wo.set(A[o + 6], A[o + 7], A[o + 8]).addScaledVector(_wd, 0.55);
    _wd.y = 0; _wd.normalize(); _wu.set(0, 1, 0); const X = _wd.clone().negate(); _wz2.crossVectors(X, _wu);
    _wb.makeBasis(X, _wu, _wz2).setPosition(_wo);
  } else if (type === 'cheo' && C.mt) {                           // mái chèo nằm trên đường nối hai bàn tay: tay trái nắm đầu cán, tay phải ôm thân, lưỡi chèo phía dưới tay phải
    const A = C.mt, o = f * 9; _wu.set(A[o], A[o + 1], A[o + 2]).normalize();
    _wz2.set(0, 0, 1).addScaledVector(_wu, -_wu.z); if (_wz2.lengthSq() < 1e-4) _wz2.set(1, 0, 0); _wz2.normalize(); _wd.crossVectors(_wu, _wz2);
    _wb.makeBasis(_wd, _wu, _wz2).setPosition(A[o + 6], A[o + 7], A[o + 8]);
  }
  else {
    const still = clip === 'dung' || clip === 'thu' || clip === 'di' || clip === 'chay';
    const up = type === 'giao' || type === 'co' || type === 'cung' ? (still ? 1 : 0) : type === 'dao' && (clip === 'dung' || clip === 'thu') ? -1 : 0;
    _wb.copy(nvGrip(C, f, false, up));
  }
  _wm2.multiplyMatrices(Mc, _wb); im.setMatrixAt(im.count++, _wm2);
  if (type === 'co' && coFlag.count < 120) coFlag.setMatrixAt(coFlag.count++, _wm2);
}
const NV_TINT = { 'dan-binh': [0xffffff, 0xe0d2c2, 0xd6c6b0, 0xc9bfae].map((c) => new THREE.Color(c)), 'linh-nam-han': [0xffffff, 0xe4e4ea, 0xcfcfd4].map((c) => new THREE.Color(c)) };
const WHITE = new THREE.Color(1, 1, 1), _np = new THREE.Vector3();
// vẽ một người: kind, động tác, thời điểm, pha lệch, vị trí, hướng, tỉ lệ, binh khí, giây trong đoạn (động tác chạy một lần), chỉ số để chọn màu áo
function nvPut(kind, clip, t, ph, pos, yaw, scale, wpn, tSeg = 0, vi = 0, roll = 0, pitch = 0, side = 1, mir = false) {
  const K = NVK[kind]; if (!K) return;
  const C = K.clips[clip] || K.clips.dung; const f = nvFrame(C, t, ph, tSeg); const im = nvIM(K, C, f, mir);
  if (im.count >= im.instanceMatrix.count) return;
  tmpE.set(pitch, yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(mir ? -scale : scale, scale, scale);
  const Mc = tmpM.compose(pos, tmpQ, tmpS);
  im.setMatrixAt(im.count, Mc); const tints = NV_TINT[kind]; im.setColorAt(im.count, tints ? tints[vi % tints.length] : WHITE); im.count++;
  if (wpn) wpPut(wpn, C, f, Mc, clip in K.clips ? clip : 'dung', side);
}
/*@@RIENG:s9@@*/
function nvEnd() {
  for (const im of NV_IMS) { im.visible = im.count > 0; if (im.count) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; } }
  for (const k in WP) WP[k].instanceMatrix.needsUpdate = true; coFlag.instanceMatrix.needsUpdate = true;
}
// người trên bờ: phóng to dần khi máy quay ở xa (như NHDD) để vẫn đọc được trên sa bàn
const farScale = (x, y, z) => EXAG * clamp(Math.hypot(camera.position.x - x, camera.position.y - y, camera.position.z - z) / 700, 1, 1.8);

/*@@RIENG:s10@@*/
const CH = INST.channel, CHS = [0];
for (let i = 1; i < CH.length; i++) CHS.push(CHS[i - 1] + Math.hypot(CH[i][0] - CH[i - 1][0], CH[i][1] - CH[i - 1][1]));
const CHW = INST.channel_w;
function chan(s, lat) {
  s = Math.min(Math.max(s, 0), CHS[CHS.length - 1] - 0.01);
  let lo = 0, hi = CHS.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CHS[m] <= s) lo = m; else hi = m; }
  const f = (s - CHS[lo]) / (CHS[hi] - CHS[lo]);
  const x = CH[lo][0] + (CH[hi][0] - CH[lo][0]) * f, z = CH[lo][1] + (CH[hi][1] - CH[lo][1]) * f;
  let dx = CH[hi][0] - CH[lo][0], dz = CH[hi][1] - CH[lo][1]; const L = Math.hypot(dx, dz); dx /= L; dz /= L;
  const w = CHW[lo] * (1 - f) + CHW[hi] * f;
  return { x: x - dz * lat * w, z: z + dx * lat * w, dx, dz, w };
}
/*@@RIENG:s11@@*/
function polyAt(pts, d) { let acc = 0; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + L >= d) { const f = (d - acc) / L; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; } acc += L; } return pts[pts.length - 1]; }
function polyLen(pts) { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return a; }

// ------------------------------------------------------------------ helpers
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
function keys(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return lerp(K[i - 1][1], K[i][1], ease(u)); } return K[K.length - 1][1]; }
function angLerp(a, b, t) { let d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * t; }
function rnd(i, k = 0) { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); }

/*@@RIENG:s12@@*/
function tideAt(t) { return keys(TIDE, t); }

/*@@RIENG:s13@@*/
const tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpM = new THREE.Matrix4(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(1, 1, 1);
/*@@RIENG:s14@@*/
const TS = await loadModel('thuyen-ts');
TS.mat.side = THREE.DoubleSide; clipList.push(TS.mat);
/*@@RIENG:s15@@*/
const boatInst = new THREE.InstancedMesh(TS.geo, TS.mat, NB + NCIV + 1); boatInst.frustumCulled = false; scene.add(boatInst);
LAYER.nv.push(boatInst);
/*@@RIENG:s16@@*/
function travel(pts, t, t0, speed) { const L = polyLen(pts); const d = clamp((t - t0) * speed, 0, L); const p = polyAt(pts, d); const p2 = polyAt(pts, Math.min(L, d + 8)); const p1 = polyAt(pts, Math.max(0, d - 8)); return { x: p[0], z: p[1], yaw: Math.atan2(p2[0] - p1[0], p2[1] - p1[1]), done: d >= L, L }; }
/*@@RIENG:s17@@*/
const _bf = new THREE.Matrix4().makeTranslation(BOAT_STERN[0], BOAT_STERN[1], BOAT_STERN[2]), _bf2 = new THREE.Matrix4();
/*@@RIENG:s18@@*/
const proxy = () => { const o = new THREE.Object3D(); o.visible = false; return o; };   // vị trí nhân vật (máy quay bám theo), hình vẽ qua nvPut
/*@@RIENG:s19@@*/
const generals = [proxy(), proxy(), proxy()];
const workers = Array.from({ length: 9 }, proxy);
const archers = Array.from({ length: 7 }, proxy);
/*@@RIENG:s20@@*/
function drawP(o, kind, clip, ph, wpn, tSeg = 0, vi = 0, far = true) {
  if (!o.visible) return;
  const sc = far ? farScale(o.position.x, o.position.y, o.position.z) : EXAG;
  nvPut(kind, clip, T, ph, o.position, o.rotation.y, sc, wpn, tSeg, vi, o.rotation.z, o.rotation.x);
}
/*@@RIENG:s21@@*/
function place(obj, x, z, yaw, show = true) { obj.visible = show; if (!show) return; obj.position.set(x, hG(x, z), z); obj.rotation.set(0, yaw, 0); }
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
function updateSmoke(t) {
  for (let i = 0; i < SMOKE_N; i++) {
    const sh = ships[i % NS]; const life = 26 + rnd(i, 30) * 14; const age = ((t + rnd(i, 31) * life) % life);
    const on = Math.max(fireF(sh, t), sh.sinkP > 0 ? 0.5 * (1 - sh.sinkP) : 0);   // khói đen bốc lên từ thuyền Nam Hán trúng tên lửa
    const wind = age * 2.2;
    smokePos[i * 3] = sh.x + (rnd(i, 33) - 0.5) * 22 + wind; smokePos[i * 3 + 1] = sh.y + 12 + age * (2.4 + rnd(i, 34)); smokePos[i * 3 + 2] = sh.z + (rnd(i, 35) - 0.5) * 22 + wind * 0.5;
    smokeA[i] = on * 0.34 * sstep(0, 3, age) * (1 - age / life); smokeS[i] = 20 + age * 2.6;
  }
  smokeGeo.attributes.position.needsUpdate = smokeGeo.attributes.aA.needsUpdate = smokeGeo.attributes.aS.needsUpdate = true;
}
const ARROW_N = 220;
const arrows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 1.6), new THREE.MeshBasicMaterial({ color: 0x2a221a }), ARROW_N); arrows.frustumCulled = false; scene.add(arrows);
/*@@RIENG:s24@@*/
const FA_N = 90;
const fireArrows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.35, 5), new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }), FA_N);
fireArrows.frustumCulled = false; scene.add(fireArrows);
const FIRE_N = 2400;
const fireGeo = new THREE.BufferGeometry();
const firePos = new Float32Array(FIRE_N * 3), fireA = new Float32Array(FIRE_N), fireS = new Float32Array(FIRE_N), fireH = new Float32Array(FIRE_N);
fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3)); fireGeo.setAttribute('aA', new THREE.BufferAttribute(fireA, 1)); fireGeo.setAttribute('aS', new THREE.BufferAttribute(fireS, 1)); fireGeo.setAttribute('aH', new THREE.BufferAttribute(fireH, 1));
const fireMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 520 } },
  vertexShader: 'attribute float aA; attribute float aS; attribute float aH; varying float vA; varying float vH; uniform float uScale; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); float d=-mv.z; vA=aA; vH=aH; gl_PointSize=min(aS*uScale/max(d,1.),260.); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'varying float vA; varying float vH; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); float a=smoothstep(.5,.05,d)*vA; if(a<0.01) discard; vec3 col=mix(vec3(1.,.85,.4),vec3(.95,.25,.05),vH); gl_FragColor=vec4(col*a*1.6,a);\n#include <colorspace_fragment>\n}' });
const flames = new THREE.Points(fireGeo, fireMat); flames.frustumCulled = false; scene.add(flames);
const fireLight = new THREE.PointLight(0xff7a2a, 0, 900, 1.6); scene.add(fireLight);
/*@@RIENG:s25@@*/
function bearingPt(deg, dist) { const a = (deg * Math.PI) / 180; return new THREE.Vector3(Math.sin(a) * dist, BASE, -Math.cos(a) * dist); }
/*@@RIENG:s26@@*/
const pulse = new THREE.Mesh(new THREE.RingGeometry(200, 260, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xd2442b, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
pulse.position.y = BASE + 1; scene.add(pulse);
/*@@RIENG:s27@@*/
function dashTube(points, color, radius) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: U.time, uC: { value: new THREE.Color(color) }, uP: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float uT,uP; uniform vec3 uC; varying vec2 vUv; void main(){ if(vUv.x>uP) discard; float d=fract(vUv.x*24.-uT*0.8); float a=smoothstep(0.,.15,d)*smoothstep(1.,.6,d); float head=smoothstep(uP-0.04,uP,vUv.x); gl_FragColor=vec4(uC*(1.+head*1.5),0.35+0.6*a);\n#include <colorspace_fragment>\n}' });
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, radius, 8), mat); m.visible = false; m.frustumCulled = false; scene.add(m); return m;
}
/*@@RIENG:s28@@*/
// ------------------------------------------------------------------ SkyDirector
const SKY = {
  'Sương sớm cuối đông': { top: '#7c8fa3', hor: '#c9c6bc', low: '#8e8a7d', ground: '#6e6a5a', fog: 0.00006, el: 9, az: 120, sun: '#ffd9a8', si: 1.5, hs: '#b8c4cc', hg: '#5d5546', hi: 0.9, cover: 0.45, cc: '#e8e1d6', cs: '#8a8f96', exp: 0.95, size: 700, glow: 1.2 },
  'Trời u ám mùa đông': { top: '#5d6b78', hor: '#a3a69f', low: '#6c6a60', ground: '#5c5a4e', fog: 0.000055, el: 24, az: 160, sun: '#d9dde0', si: 0.9, hs: '#a9b2b8', hg: '#4e4a40', hi: 1.15, cover: 0.78, cc: '#b8bcbd', cs: '#5b6168', exp: 1.0, size: 400, glow: 0.4 },
  'Hoàng hôn biến loạn': { top: '#2c2430', hor: '#b2593a', low: '#3b2a24', ground: '#4a3328', fog: 0.000045, el: 4, az: 248, sun: '#ff8a4a', si: 1.6, hs: '#8a6a68', hg: '#3a2a22', hi: 0.6, cover: 0.55, cc: '#d77a4a', cs: '#3a2b2e', exp: 0.95, size: 500, glow: 2.2 },
  'Sáng trong': { top: '#3f78b0', hor: '#c7d8e0', low: '#8d9a8a', ground: '#77765a', fog: 0.00003, el: 32, az: 135, sun: '#fff1d8', si: 2.6, hs: '#bcd3e6', hg: '#5f5a44', hi: 0.9, cover: 0.3, cc: '#ffffff', cs: '#a3b0bd', exp: 0.92, size: 900, glow: 1 },
  'Chiều nắng ấm': { top: '#4b74a0', hor: '#e2c99a', low: '#8a7b5c', ground: '#80724f', fog: 0.000035, el: 18, az: 230, sun: '#ffd49a', si: 2.4, hs: '#c4c8c4', hg: '#5f5440', hi: 0.8, cover: 0.38, cc: '#fff0d8', cs: '#9a8f86', exp: 0.95, size: 800, glow: 1.4 },
  'Ngày nhiều mây': { top: '#56789a', hor: '#c3c9c6', low: '#7d8072', ground: '#6f6d55', fog: 0.00004, el: 38, az: 170, sun: '#fff4e4', si: 2.0, hs: '#b9c6cf', hg: '#575343', hi: 1.0, cover: 0.58, cc: '#f2f1ec', cs: '#7f8892', exp: 0.95, size: 800, glow: 0.8 },
  'Sương sông buổi sớm': { top: '#8796a3', hor: '#d6d3c9', low: '#9a978a', ground: '#7a7663', fog: 0.00011, el: 6, az: 115, sun: '#ffe0b8', si: 1.2, hs: '#c8cfd2', hg: '#625b4b', hi: 1.1, cover: 0.35, cc: '#efe9de', cs: '#9fa3a6', exp: 0.98, size: 600, glow: 1.4 },
  'Mây đen áp sát': { top: '#2f3741', hor: '#7d7f7b', low: '#474741', ground: '#45443b', fog: 0.00006, el: 20, az: 200, sun: '#c9c2b4', si: 0.8, hs: '#8a929a', hg: '#3d3a32', hi: 1.0, cover: 0.86, cc: '#8d9196', cs: '#2b3037', exp: 1.05, size: 400, glow: 0.3 },
  'Triều cường giữa trưa': { top: '#3a6fa6', hor: '#cbd6d6', low: '#8e9583', ground: '#7a7658', fog: 0.00003, el: 52, az: 185, sun: '#fff8ea', si: 2.8, hs: '#c0d4e4', hg: '#5f5a46', hi: 0.85, cover: 0.32, cc: '#ffffff', cs: '#a2adb8', exp: 0.88, size: 1000, glow: 0.8 },
  'Chiều ngả hổ phách': { top: '#4d5f7a', hor: '#d9a76a', low: '#7d6448', ground: '#76603f', fog: 0.00004, el: 12, az: 238, sun: '#ffb86a', si: 2.2, hs: '#b5aa9a', hg: '#5a4a36', hi: 0.75, cover: 0.45, cc: '#f2c58e', cs: '#6d5f5c', exp: 0.95, size: 700, glow: 1.8 },
  'Giông chiều cam đỏ': { top: '#2e2a33', hor: '#c06a3c', low: '#4a3226', ground: '#57402c', fog: 0.00005, el: 8, az: 242, sun: '#ff8f4f', si: 1.9, hs: '#93766a', hg: '#3f2f24', hi: 0.7, cover: 0.7, cc: '#d98a58', cs: '#2e2628', exp: 1.0, size: 500, glow: 2.2 },
  'Khói trận': { top: '#3b3532', hor: '#a37a58', low: '#4a3a2e', ground: '#544434', fog: 0.00007, el: 10, az: 244, sun: '#ffa35e', si: 1.7, hs: '#8f8177', hg: '#3c3229', hi: 0.8, cover: 0.66, cc: '#b88a66', cs: '#3a3230', exp: 1.0, size: 500, glow: 1.6 },
  'Chạng vạng đỏ thẫm': { top: '#1f1c24', hor: '#9c4630', low: '#3a2520', ground: '#46302a', fog: 0.00006, el: 2.5, az: 250, sun: '#ff6a3a', si: 1.3, hs: '#6e5552', hg: '#33241e', hi: 0.6, cover: 0.62, cc: '#b85a3c', cs: '#271f22', exp: 1.05, size: 400, glow: 2.4 },
  'Hoàng hôn vàng lặng': { top: '#456189', hor: '#efc27c', low: '#8a6a45', ground: '#83693f', fog: 0.000035, el: 6, az: 246, sun: '#ffc070', si: 2.1, hs: '#c0b4a2', hg: '#5a4831', hi: 0.8, cover: 0.32, cc: '#ffd8a0', cs: '#8a7068', exp: 0.95, size: 650, glow: 2.0 },
  'Bình minh hồng': { top: '#5a7aa8', hor: '#f0b9a0', low: '#8f7a6a', ground: '#7a6c58', fog: 0.000045, el: 5, az: 112, sun: '#ffc79a', si: 1.9, hs: '#c9c2c8', hg: '#5a5044', hi: 0.9, cover: 0.3, cc: '#ffe1cc', cs: '#9c8a96', exp: 0.95, size: 700, glow: 2.0 },
};
/*@@RIENG:s29@@*/
const skySel = $('skySel');
skySel.innerHTML = '<option value="">Theo kịch bản</option>' + Object.keys(SKY).map((k) => `<option>${k}</option>`).join('');
const cA = new THREE.Color(), cB = new THREE.Color();
function mixHex(a, b, u, out) { cA.set(a); cB.set(b); return out.copy(cA).lerp(cB, u); }
function applySky(t, forced) {
  let A, B, u;
  if (forced) { A = B = SKY[forced]; u = 0; }
  else {
    let i = 0; while (i < SKYKEYS.length - 1 && t >= SKYKEYS[i + 1][0]) i++;
    const next = SKYKEYS[i + 1]; A = SKY[SKYKEYS[i][1]];
    if (i > 0 && t - SKYKEYS[i][0] < 7) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, 7, t - SKYKEYS[i][0]); }
    else { B = A; u = 0; }
    void next;
  }
  mixHex(A.top, B.top, u, U.top.value); mixHex(A.hor, B.hor, u, U.hor.value); mixHex(A.low, B.low, u, U.low.value);
  mixHex(A.ground, B.ground, u, U.ground.value); mixHex(A.cc, B.cc, u, U.cloudCol.value); mixHex(A.cs, B.cs, u, U.cloudShade.value);
  mixHex(A.sun, B.sun, u, sun.color); U.sunCol.value.copy(sun.color).multiplyScalar(lerp(A.si, B.si, u) * 0.5);
  sun.intensity = lerp(A.si, B.si, u);
  mixHex(A.hs, B.hs, u, hemi.color); mixHex(A.hg, B.hg, u, hemi.groundColor); hemi.intensity = lerp(A.hi, B.hi, u) * 1.35; amb.color.copy(hemi.color);
  U.cover.value = lerp(A.cover, B.cover, u); U.sunSize.value = lerp(A.size, B.size, u); U.glow.value = lerp(A.glow, B.glow, u);
  const el = THREE.MathUtils.degToRad(lerp(A.el, B.el, u)), az = THREE.MathUtils.degToRad(lerp(A.az, B.az, u));
  U.sunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
  sun.position.copy(U.sunDir.value).multiplyScalar(5000); sun.target.position.set(0, 0, 0);
  scene.fog.color.copy(U.hor.value); scene.fog.density = lerp(A.fog, B.fog, u);
  renderer.toneMappingExposure = lerp(A.exp, B.exp, u);
  U.light.value = 0.45 + 0.55 * Math.min(1, sun.intensity / 2.2) * 0.8 + hemi.intensity * 0.12;
  U.deep.value.copy(U.hor.value).multiplyScalar(0.25).lerp(new THREE.Color(0x1d3a3c), 0.6);
  U.shallow.value.copy(U.hor.value).multiplyScalar(0.45).lerp(new THREE.Color(0x5d6f5a), 0.55);
}

/*@@RIENG:s30@@*/
const G = (x, z, up = 0) => Math.max(hAt(x, z), tideNow) + up;
let tideNow = HIGH;
/*@@RIENG:s31@@*/
function fly(a, b, la, lb, fov = 45) { return (u) => [a.clone().lerp(b, ease(u)), la.clone().lerp(lb, ease(u)), fov]; }
function orbit(c, r, h, a0, a1, fov = 45, h1) { return (u) => { const a = lerp(a0, a1, ease(u)); const hh = h1 === undefined ? h : lerp(h, h1, ease(u)); return [V3(c.x + Math.sin(a) * r, c.y + hh, c.z + Math.cos(a) * r), c.clone(), fov]; }; }
/*@@RIENG:s32@@*/
function boatCam(j, lx, ly, lz, tx, ty, tz, fov = 42) { return (u) => { const b = boats[j]; const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.yaw, 0)); const p = V3(lx, ly, lz).applyQuaternion(q).add(V3(b.x, b.y, b.z)); const tt = V3(tx, ty, tz).applyQuaternion(q).add(V3(b.x, b.y, b.z)); return [p, tt, fov]; }; }
function objCam(obj, lx, ly, lz, tx, ty, tz, fov = 35, l2) { return (u) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, obj.rotation.y, 0)); const off = l2 ? V3(lerp(lx, l2[0], ease(u)), lerp(ly, l2[1], ease(u)), lerp(lz, l2[2], ease(u))) : V3(lx, ly, lz); return [off.applyQuaternion(q).add(obj.position), V3(tx, ty, tz).applyQuaternion(q).add(obj.position), fov]; }; }
/*@@RIENG:s33@@*/
const ALL_SHOTS = STORY.scenes.flatMap((s) => s.shots.map((sh) => ({ ...sh, scene: s })));
function shotAt(t) { for (const s of ALL_SHOTS) if (t >= s.t0 && t < s.t1) return s; return ALL_SHOTS[ALL_SHOTS.length - 1]; }
function sceneAt(t) { for (const s of STORY.scenes) if (t >= s.t0 && t < s.t1) return s; return STORY.scenes[STORY.scenes.length - 1]; }

// shot-specific modes (BattleTimeline)
const SECTION_SHOTS = new Set(['C04-F']);
/*@@RIENG:s34@@*/
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KX = Math.cos((META.lat0 * Math.PI) / 180) * 111320, KZ = 110574;
const toLL = (x, z) => ({ lat: META.lat0 - z / KZ, lon: META.lon0 + x / KX });
/*@@RIENG:s35@@*/
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
/*@@RIENG:s36@@*/
const anchors = new Map(), pins = new Map(), moves = new Map(), labels = [];
function addLabel(text, x, z, cls, opts = {}) {
  const el = document.createElement('div'); el.className = 'lbl ' + (cls || '');
  const b = document.createElement('b'); b.textContent = text; const i = document.createElement('i'); el.append(b, i); $('labels').appendChild(el);
  const L = { el, b, x, z, cls, obj: opts.obj || null, grp: opts.grp || 'anc', maxDist: opts.maxDist || Infinity, yFn: opts.yFn || null, show: opts.show || null };
  if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); if (!dragging) opts.onClick(); });
  if (opts.drag) b.addEventListener('pointerdown', (e) => { if (uiMode === 'drag' && canWrite !== false) { e.preventDefault(); e.stopPropagation(); startDrag(opts.drag, e); } });
  labels.push(L); return L;
}
for (const [name, text, x, z, desc, big] of ANCH) {
  const A = { name, text, x0: x, z0: z, x, z, desc, big };
  A.label = addLabel(text, x, z, big ? 'big' : '', { grp: 'key', maxDist: big ? Infinity : 7000, onClick: () => { showCard(name); flyTo(A.x, A.z, 700); }, drag: { kind: 'anchor', name } });
  anchors.set(name, A);
}
/*@@RIENG:s37@@*/
const v3 = new THREE.Vector3();
/*@@RIENG:s38@@*/
function updateLabels() {
  const filmAuto = appMode === 'film' && !userCam && !povOn;
  const w = innerWidth, h = innerHeight, showA = $('ly-lbl').checked, showP = $('ly-pin').checked;
  for (const L of labels) {
    let on = L.cls === 'pin' || L.cls === 'pin done' ? showP : L.grp === 'who' ? true : showA;
    if (L.obj) { L.x = L.obj.position.x; L.z = L.obj.position.z; }
    if (on && L.show && !L.show()) on = false;
    if (on && filmAuto && L.grp !== 'pin' && L.grp !== 'who') { const g = LABEL_SHOTS[lastShot] || []; on = g.includes(L.grp) || (g.includes('far') && FAR_GRP.has(L.grp)) || (L.grp === 'key' && g.includes('key')); }
    if (on) {
      const y = L.yFn ? L.yFn() : Math.max(hG(L.x, L.z), tideNow) + 2;
      v3.set(L.x, y, L.z);
      if (v3.distanceTo(camera.position) > (camera.position.y < 80 && L.grp !== 'pin' && L.grp !== 'who' ? Math.min(L.maxDist, 1600) : L.maxDist)) on = false;
      v3.project(camera);
      if (v3.z > 1 || Math.abs(v3.x) > 1.1 || Math.abs(v3.y) > 1.1) on = false;
      if (on) { L.el.style.left = ((v3.x + 1) / 2) * w + 'px'; L.el.style.top = ((1 - v3.y) / 2) * h - 2 + 'px'; }
    }
    L.el.style.display = on ? '' : 'none';
  }
}
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
/*@@RIENG:s39@@*/
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
function drawMinimap() {
  if ($('minimap').hidden || getComputedStyle($('minimap')).display === 'none') return;
  const w = 300, iw = mmImg.width, ih = mmImg.height, s0 = ((HALF - R) / (2 * HALF)), s1 = (2 * R) / (2 * HALF);
  mmx.clearRect(0, 0, w, w); mmx.save(); mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.clip();
  mmx.drawImage(mmImg, s0 * iw, s0 * ih, s1 * iw, s1 * ih, 0, 0, w, w);
  for (const A of anchors.values()) { const [px, py] = mmPx(A.x, A.z); mmx.fillStyle = A.big ? '#d8705a' : 'rgba(226,183,104,.9)'; mmx.fillRect(px - 2.5, py - 2.5, 5, 5); }
  for (const P of pins.values()) { const [px, py] = mmPx(P.x, P.z); mmx.fillStyle = '#d8705a'; mmx.beginPath(); mmx.arc(px, py, 3.5, 0, 7); mmx.fill(); }
  for (const sh of ships) if (sh.vis) { const [px, py] = mmPx(sh.x, sh.z); mmx.fillStyle = '#c0392b'; mmx.fillRect(px - 2, py - 2, 4, 4); }
  for (const b of boats) if (b.vis) { const [px, py] = mmPx(b.x, b.z); mmx.fillStyle = '#f0d58a'; mmx.fillRect(px - 1.5, py - 1.5, 3, 3); }
  const tg = appMode === 'film' && !userCam ? camLook : controls.target;
  const [tx, ty] = mmPx(tg.x, tg.z), [cx, cy] = mmPx(camera.position.x, camera.position.z);
  mmx.strokeStyle = 'rgba(255,240,210,.9)'; mmx.lineWidth = 2; mmx.beginPath(); mmx.moveTo(cx, cy); mmx.lineTo(tx, ty); mmx.stroke();
  mmx.fillStyle = '#e2b768'; mmx.beginPath(); mmx.arc(tx, ty, 5, 0, 7); mmx.fill(); mmx.strokeStyle = '#23190d'; mmx.lineWidth = 1.5; mmx.stroke();
  mmx.restore(); mmx.strokeStyle = 'rgba(222,180,110,.6)'; mmx.lineWidth = 2; mmx.beginPath(); mmx.arc(w / 2, w / 2, w / 2 - 1, 0, 7); mmx.stroke();
  mmx.fillStyle = '#e2b768'; mmx.font = 'bold 18px sans-serif'; mmx.textAlign = 'center'; mmx.fillText('B', w / 2, 22);
}
mm.addEventListener('click', (e) => {
  const r = mm.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
  const x = -R + u * 2 * R, z = -R + v * 2 * R; if (Math.hypot(x, z) > R) return;
  if (W.on) { placeAvatarAt(x, z); return; }
  flyTo(x, z, clamp(camera.position.distanceTo(controls.target), 300, 6000));
});
$('mmLeg').textContent = 'Bấm để bay tới · đỏ: thuyền Nam Hán · vàng: thuyền quân Ngô';

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
function renderList() {
  $('n-pins').textContent = pins.size; $('n-moves').textContent = moves.size; $('n-all').textContent = pins.size + moves.size;
  const list = $('list'); list.replaceChildren(); const who = (id) => (id && id === myId ? 'Anh' : names[id] || 'Ai đó');
  if (tab === 'pins') {
    const arr = [...pins.entries()].sort((a, b) => (a[1].doc.status === 'xong') - (b[1].doc.status === 'xong') || String(b[1].doc.created).localeCompare(String(a[1].doc.created)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa có ghi chú. Chọn “＋ Ghi chú” rồi bấm lên sa bàn tại chỗ cần góp ý: vị trí bãi cọc, lạch phục binh, hình dạng bờ sông, sai lệch sử liệu…'; list.append(e); }
    for (const [id, P] of arr) {
      const d = P.doc, it = document.createElement('div'); it.className = 'item' + (d.status === 'xong' ? ' done' : '');
      const h = document.createElement('h3'); h.textContent = d.title; const m = document.createElement('div'); m.className = 'meta';
      const chip = document.createElement('span'); chip.className = 'chiplet c-' + d.cat; chip.textContent = CAT[d.cat] || d.cat;
      const sp = document.createElement('span'); sp.textContent = `${who(d.author)} · ${fmtTime(d.updated || d.created)}${d.canh ? ' · ' + d.canh : ''}`;
      m.append(chip, sp); it.append(h, m);
      if (d.text) { const p = document.createElement('p'); p.textContent = d.text; it.append(p); }
      const acts = document.createElement('div'); acts.className = 'acts'; acts.append(btn('Bay tới', () => flyTo(P.x, P.z, 500)), btn('Sửa', () => openDialog(id)), btn(d.status === 'xong' ? 'Mở lại' : 'Đã xử lý', () => toggleDone(id)));
      it.append(acts); list.append(it);
    }
    resolveNames(arr.map(([, P]) => P.doc.author));
  } else {
    const arr = [...moves.values()].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
    if (!arr.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Chưa dời mốc nào. Chọn “✋ Kéo mốc” rồi kéo các mốc vàng tới vị trí đúng.'; list.append(e); }
    for (const d of arr) {
      const it = document.createElement('div'); it.className = 'item mv'; const h = document.createElement('h3'); h.textContent = d.label;
      const m = document.createElement('div'); m.className = 'meta'; m.textContent = `Dời ${Math.round(Math.hypot(d.x - d.from_x, d.z - d.from_z))} m · ${who(d.author)} · ${fmtTime(d.updated)}`;
      const acts = document.createElement('div'); acts.className = 'acts'; acts.append(btn('Bay tới', () => flyTo(d.x, d.z, 500)), btn('Trả về vị trí cũ', () => undoMove(d.name)));
      it.append(h, m, acts); list.append(it);
    }
    resolveNames(arr.map((d) => d.author));
  }
}
$('export').onclick = async () => {
  const out = { du_an: 'Sa bàn Bạch Đằng 938', xuat_luc: nowIso(), goc_toa_do: [META.lat0, META.lon0],
    ghi_chu: [...pins.values()].map((P) => ({ loai: CAT[P.doc.cat], tieu_de: P.doc.title, noi_dung: P.doc.text, trang_thai: P.doc.status, canh: P.doc.canh, lat: P.doc.lat, lon: P.doc.lon, x: P.doc.x, z: P.doc.z })),
    moc_da_doi: [...moves.values()].map((d) => ({ moc: d.name, ten: d.label, tu: [d.from_lat, d.from_lon], den: [d.lat, d.lon], do_dich_m: Math.round(Math.hypot(d.x - d.from_x, d.z - d.from_z)) })) };
  const txt = JSON.stringify(out, null, 1);
  try { await navigator.clipboard.writeText(txt); $('export').textContent = 'Đã sao chép ✓'; setTimeout(() => ($('export').textContent = 'Sao chép dữ liệu review (JSON)'), 2000); }
  catch (e) { const ta = document.createElement('textarea'); ta.id = 'copybox'; ta.value = txt; ta.readOnly = true; $('list').prepend(ta); ta.focus(); ta.select(); }
};
$('revbtn').onclick = () => { const open = $('review').hidden; $('review').hidden = !open; $('revbtn').setAttribute('aria-pressed', open); if (open) $('info').hidden = true; };
$('revx').onclick = () => { $('review').hidden = true; $('revbtn').setAttribute('aria-pressed', 'false'); };

// ------------------------------------------------------------------ đi bộ trên sa bàn (nhân vật có động tác thật)
const W = { boat: false, on: false, keys: {}, joy: { x: 0, y: 0 }, pos: new THREE.Vector3(), yaw: 0, fp: false, run: false, moving: false, runNow: false };
const WET = (x, z) => hG(x, z) < tideNow - 0.55;                 // đủ sâu để chèo thuyền
const groundW = (x, z) => (W.boat ? tideNow - 0.18 : Math.max(hG(x, z), tideNow - 0.9));
function placeAvatarAt(x, z) {
  const r = Math.hypot(x, z); if (r > R - 25) { x *= (R - 25) / r; z *= (R - 25) / r; }
  const old = W.pos.clone(); W.pos.set(x, groundW(x, z), z);
  if (W.on) { const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d); }
}
function setWalk(on) {
  W.on = on; document.body.classList.toggle('walking', on);
  $('bwalk').classList.toggle('on', on); $('bwalk').textContent = on ? '🚶 Đang đi bộ · thoát' : '🚶 Xuống đi bộ';
  $('joy').hidden = !on; $('runbtn').hidden = !on; $('walkhelp').hidden = !on; document.querySelector('#explorebar .help').hidden = on;
  if (on) {
    setUiMode('view'); flyA = null; setAuto(false); controls.enablePan = false;
    let x = controls.target.x, z = controls.target.z;
    if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { x = -60; z = 2930; }
    W.boat = WET(x, z);                                            // đứng trên sông → ngồi thuyền chèo
    const dx = camera.position.x - controls.target.x, dz = camera.position.z - controls.target.z; W.yaw = Math.atan2(-dx, -dz);
    placeAvatarAt(x, z); controls.target.copy(W.pos).add(V3(0, 2.4, 0));
    camera.position.copy(controls.target).add(V3(-Math.sin(W.yaw) * 9, 2.2, -Math.cos(W.yaw) * 9)); setPovWalk();
  } else { W.keys = {}; W.joy.x = W.joy.y = 0; controls.enablePan = true; controls.minDistance = 4; controls.maxDistance = 40000; controls.minPolarAngle = 0; controls.maxPolarAngle = Math.PI * 0.47; flyTo(W.pos.x, W.pos.z, 500); }
}
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
  const d = W.pos.clone().sub(old); camera.position.add(d); controls.target.add(d);
  controls.target.y += (W.pos.y + (W.fp ? 2.55 : 2.4) - controls.target.y) * Math.min(1, dt * 8);
}
const _avQ = new THREE.Quaternion(), _hideM = new THREE.Matrix4().makeScale(0, 0, 0);
function drawAvatar() {
  const inBoat = W.on && W.boat;
  if (inBoat) {
    tmpE.set(0, W.yaw, Math.sin(performance.now() / 900) * 0.03, 'YXZ'); _avQ.setFromEuler(tmpE); tmpS.setScalar(BOAT_S);
    boatInst.setMatrixAt(AV_BOAT, tmpM.compose(W.pos, _avQ, tmpS));
  } else boatInst.setMatrixAt(AV_BOAT, _hideM);
  boatInst.instanceMatrix.needsUpdate = true;
  if (!W.on || W.fp) return;
  const kind = $('role').value, now = performance.now() / 1000;
  if (inBoat) {                                                     // ngồi giữa thuyền chèo; dừng thì giữ chèo
    const p = new THREE.Vector3(-0.2 * BOAT_S, BOAT_DECK * BOAT_S, 0.3).applyQuaternion(_avQ).add(W.pos);
    if (kind === 'dan-binh') nvPut('dan-binh', 'cheo', W.moving ? now * (W.runNow ? 1.3 : 0.9) : 0.35, 0, p, W.yaw, EXAG * 0.95, 'cheo', 0, 0);
    else nvPut(kind, 'dung', now, 0, p.setX(p.x), W.yaw, EXAG * 0.95, 'dao', 0, 0);
    return;
  }
  const clip = W.moving ? (W.runNow ? 'chay' : 'di') : 'dung';
  nvPut(kind, clip, now, 0, W.pos, W.yaw, EXAG, kind === 'dan-binh' ? 'giao' : 'dao', 0, 0);
}
addEventListener('keydown', (e) => { if (W.on && !(e.target.closest && e.target.closest('input, select, textarea'))) { W.keys[e.code] = true; if (e.code.startsWith('Arrow')) e.preventDefault(); } });
addEventListener('keyup', (e) => { W.keys[e.code] = false; });
{
  const jb = $('joy'), jk = jb.querySelector('span'); let id = null;
  const move = (e) => { if (e.pointerId !== id) return; const r = jb.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } W.joy.x = x; W.joy.y = y; jk.style.transform = `translate(${x * 38}px,${y * 38}px)`; };
  jb.addEventListener('pointerdown', (e) => { id = e.pointerId; jb.setPointerCapture(id); e.preventDefault(); move(e); });
  jb.addEventListener('pointermove', move);
  const end = () => { id = null; W.joy.x = W.joy.y = 0; jk.style.transform = ''; }; jb.addEventListener('pointerup', end); jb.addEventListener('pointercancel', end);
}

// ------------------------------------------------------------------ góc nhìn nhân vật (phim vẫn chạy theo lời bình)
const eyeOf = (o, h) => ({ p: o.position.clone().add(V3(Math.sin(o.rotation.y) * 0.35, h * EXAG + 0.05, Math.cos(o.rotation.y) * 0.35)), yaw: o.rotation.y });
function boatEye(b, c) { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, b.yaw, 0)); return { p: V3(0, BOAT_DECK * BOAT_S + 1.45 * EXAG, (2.0 - c * 1.3) * BOAT_S + 0.4).applyQuaternion(q).add(V3(b.x, b.y, b.z)), yaw: b.yaw }; }
/*@@RIENG:s40@@*/
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
function povTick() {
  let E = null;
  if (POV.dd >= 0) { const [, x, z, h] = POV_DD[POV.dd]; const y = h < 0 ? tideNow + 1.6 : Math.max(hG(x, z), tideNow) + h; E = { p: V3(x, y, z), yaw: Math.atan2(680 - x, 2990 - z) }; if (Math.hypot(680 - x, 2990 - z) < 30) E.yaw = Math.PI; }
  else E = POV_VAI[POV.sel][1]();
  $('povmsg').textContent = E ? 'Kéo màn hình để quay đầu nhìn quanh · phim vẫn chạy theo lời bình' : 'Nhân vật này không có trong cảnh hiện tại · đang xem góc máy của phim';
  if (!E) { POV.has = false; return false; }
  if (POV.has) POV.eye.lerp(E.p, 0.35); else POV.eye.copy(E.p); POV.has = true;
  const yw = E.yaw + POV.yaw, cp = Math.cos(POV.pitch);
  camera.position.copy(POV.eye); camLook.set(POV.eye.x + Math.sin(yw) * cp * 5, POV.eye.y + Math.sin(POV.pitch) * 5, POV.eye.z + Math.cos(yw) * cp * 5);
  camera.lookAt(camLook); if (camera.fov !== 60) { camera.fov = 60; camera.updateProjectionMatrix(); }
  return true;
}

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
function setPlaying(b) { if (b && T >= DUR - 0.1) { T = 0; } playing = b; $('splay').textContent = b ? '⏸' : '▶'; $('splay').setAttribute('aria-label', b ? 'Tạm dừng' : 'Phát'); if (!b) voStop(); else lastLine = ''; }
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
/*@@RIENG:s41@@*/
function fillDocs() {
  const i = appMode === 'explore' ? exploreI : sceneIdx(T), sc = SC[i], el = $('docsbody'); el.replaceChildren();
  const add = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; el.append(e); return e; };
  add('div', `Chương ${i + 1}/14`, 'eyebrow'); add('h2', sc.title);
  add('h4', 'Sự kiện chính'); const ul = add('ul'); for (const f of SCENE_FACTS[i] || []) { const li = document.createElement('li'); li.textContent = f; ul.append(li); }
  add('h4', 'Diễn biến'); const paras = []; let cur = ''; for (const s of sc.subs) { cur += (cur ? ' ' : '') + s[2]; if (/[.!?…:]$/.test(s[2])) { paras.push(cur); cur = ''; } } if (cur) paras.push(cur);
  for (const p of paras) add('p', p);
  add('h4', 'Số liệu trận Bạch Đằng 938'); const dl = add('dl', undefined, 'facts');
  for (const [k, v] of BATTLE) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; dl.append(dt, dd); }
}
$('bdocs').onclick = () => { const open = $('docs').hidden; if (open) fillDocs(); $('docs').hidden = !open; $('bdocs').classList.toggle('on', open); if (open) $('info').hidden = true; };
$('docsx').onclick = () => { $('docs').hidden = true; $('bdocs').classList.remove('on'); };
$('barr').onclick = () => { const c = $('ly-arr'); c.checked = !c.checked; $('barr').classList.toggle('on', c.checked); };
$('ly-arr').onchange = () => $('barr').classList.toggle('on', $('ly-arr').checked);
$('ly-mm').onchange = (e) => { $('minimap').hidden = !e.target.checked; };
$('ly-gauge').onchange = (e) => { $('gauge').hidden = !e.target.checked; };
$('ly-co').onchange = (e) => { coOn = e.target.checked; };
$('ly-mc').onchange = (e) => { if (appMode === 'explore') setSection(e.target.checked); };
for (const [id, key] of [['ly-cay', 'cay'], ['ly-nha', 'nha']]) $(id).onchange = (e) => { for (const m of LAYER[key]) m.visible = e.target.checked; };
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
/*@@RIENG:s42@@*/
const AM_LAP = [[7, 0.3, 0.6, 'cung', 0.35, 0.4, 1.4], [7, 0.3, 0.6, 'muiten', 0.3, 0.6, 1.8], [10, 0.05, 1, 'cung', 0.4, 0.25, 1.0], [10, 0.05, 1, 'muiten', 0.35, 0.4, 1.4],
  [10, 0.3, 1, 'chem', 0.35, 0.5, 1.6], [11, 0, 0.8, 'chem', 0.35, 0.6, 1.8], [11, 0, 0.7, 'cung', 0.3, 0.5, 1.6]];
/*@@RIENG:s43@@*/
function amShot(n, vol) { const b = AM.buf[n]; if (!b || !AM.ready || !AM.on) return; const s = AM.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = 0.94 + Math.random() * 0.12; const g = AM.ctx.createGain(); g.gain.value = vol; s.connect(g).connect(AM.sfx); s.start(); }
function amEnable(on) {
  AM.on = on;
  if (on && !AM.ctx) { AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.out = AM.ctx.createGain(); AM.out.gain.value = 0.9; AM.out.connect(AM.ctx.destination); AM.sfx = AM.ctx.createGain(); AM.sfx.connect(AM.out); MU.init(); amLoad(); }
  if (AM.ctx) { if (on) AM.ctx.resume(); else AM.ctx.suspend(); }
  const b = $('bsnd'); b.classList.toggle('on', on); b.classList.remove('hint'); b.textContent = on ? '🔊 Âm thanh' : '🔇 Âm thanh';
}
const distVol = (x, z) => clamp(1 - Math.hypot(camera.position.x - x, camera.position.z - z, camera.position.y) / 4500, 0.15, 1);
function amTick(dt) {
  if (!AM.ready || !AM.on) { AM.prevT = T; return; }
  const live = (appMode === 'film' && playing) || appMode === 'explore', i = sceneIdx(T), sc = SC[i], u = clamp((T - sc.t0) / (sc.t1 - sc.t0), 0, 1);
  const plan = amPlan(i, u), k = live ? 1 : 0.2, now = AM.ctx.currentTime;
  for (const n in AM.beds) AM.beds[n].gain.setTargetAtTime((plan[n] || 0) * k * (W.on ? 0.6 : 1), now, 0.8);
  if (live && T > AM.prevT && T - AM.prevT < 1) {
    for (const sh of ships) {
      if (sh.tStuck && AM.prevT < sh.tStuck && T >= sh.tStuck) amShot('daroi', 0.55 * distVol(sh.x, sh.z));       // thuyền đâm vào bãi cọc
      if (sh.sink < 1e8 && AM.prevT < sh.sink && T >= sh.sink) amShot('tauchim', 0.6 * distVol(sh.x, sh.z));       // thuyền chìm
    }
    const tt = performance.now() / 1000;
    AM_LAP.forEach(([si, u0, u1, n, v, a, b], j) => { if (si !== i || u < u0 || u > u1) return; if (!(j in AM.next)) AM.next[j] = tt + Math.random() * a; if (tt >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = tt + a + Math.random() * (b - a); } });
  }
  AM.prevT = T;
}
/*@@RIENG:s44@@*/
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
function updSub(force) {
  const el = $('sub'), sc = SC[sceneIdx(T)]; let txt = '', key = '';
  if (appMode === 'film') sc.subs.forEach((s, k) => { if (T >= s[0] && T < s[1]) { txt = s[2]; key = sc.id + ':' + k; } });
  if (key && key !== lastLine) { lastLine = key; speak(txt); }
  const on = appMode === 'film' && $('ly-sub').checked;
  if (!on) { el.hidden = true; return; }
  if (el.textContent !== txt || force) el.textContent = txt; el.hidden = !txt;
}

/*@@RIENG:s45@@*/
// ------------------------------------------------------------------ cập nhật mỗi khung hình
let fpsN = 0, fpsT = performance.now();
/*@@RIENG:s46@@*/
const clock = new THREE.Clock();
let first = true;
function frame() { const dt = Math.min(clock.getDelta(), 0.1); update(first ? 0 : dt); first = false; renderer.render(scene, camera); requestAnimationFrame(frame); }
setAppMode('film'); update(0); renderer.compile(scene, camera);
$('load').classList.add('done'); setTimeout(() => $('load').remove(), 700);
renderList(); connectStore();
const STILL = location.hash === '#still';
if (!STILL && !reduceMotion) setPlaying(true);
window.__sa = { helpCurve, helpArc, NQ, camera, controls, BOAT_S, AM, MU, NVK, seek: (t) => { T = clamp(t, 0, DUR - 0.01); }, setPlaying, setAppMode, goView, get T() { return T; }, ships, boats, render: () => { update(0); renderer.render(scene, camera); } };
if (!STILL) requestAnimationFrame(frame);
