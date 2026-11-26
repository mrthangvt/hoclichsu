// Sa bàn Đà Nẵng 1858 – 1860 · V1.2 · Không gian lịch sử · Học Lịch Sử
// Toạ độ: x Đông, n Bắc (m) so với gốc 16,095 B · 108,21 Đ. three.js: (x, cao, −n).
// Vòng sa bàn: tâm 16,1169595 B · 108,1969851 Đ (TAM trong hệ gốc), bán kính 9 417 m.
import * as THREE from './vendor/three/three.module.min.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

const V3 = THREE.Vector3, Q = new THREE.Quaternion(), D2R = Math.PI / 180;
const HALF = 16000, HM = 2048, HPX = 2 * HALF / HM;
const TAM = [-1392.03, 2444.53], RSB = 9417;   // tâm vòng sa bàn, bán kính
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mod = (a, n) => ((a % n) + n) % n;
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const GOC = (document.currentScript && document.currentScript.src) || import.meta.url;
const URLG = (p) => new URL(p, GOC).href;

let HGT = null;          // Float32Array HM×HM, hàng 0 = Bắc
function hAt(x, n) {
  if (!HGT) return 0;
  x -= TAM[0]; n -= TAM[1];
  const fx = (x + HALF) / HPX - 0.5, fy = (HALF - n) / HPX - 0.5;
  const i = Math.floor(fx), j = Math.floor(fy), ax = fx - i, ay = fy - j;
  const g = (a, b) => HGT[clamp(b, 0, HM - 1) * HM + clamp(a, 0, HM - 1)];
  if (x < -HALF || x > HALF || n < -HALF || n > HALF) return -30;
  return g(i, j) * (1 - ax) * (1 - ay) + g(i + 1, j) * ax * (1 - ay) + g(i, j + 1) * (1 - ax) * ay + g(i + 1, j + 1) * ax * ay;
}
const gAt = (x, n) => Math.max(hAt(x, n), 0);           // mặt đất hoặc mặt nước
const W = (x, n, dy = 0) => new V3(x, gAt(x, n) + dy, -n);

// ---------- dựng cảnh ----------
const cv = $('#cv');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
const DPR = Math.min(window.devicePixelRatio || 1, /Mobi|Android/i.test(navigator.userAgent) ? 1.25 : 1.6);
renderer.setPixelRatio(DPR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 1, 200000);
scene.fog = new THREE.Fog(0xb9c8d4, 4000, 60000);
const hemi = new THREE.HemisphereLight(0xdfe9f2, 0x5a6040, 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.2); scene.add(sun); scene.add(sun.target);
const SUN = new V3(-0.5, 0.6, 0.35).normalize();
function resize() {
  const w = cv.clientWidth, h = cv.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ---------- bầu trời ----------
const skyU = { top: { value: new THREE.Color(0x3f78b8) }, hor: { value: new THREE.Color(0xc6d6e2) }, sunDir: { value: SUN.clone() }, sunCol: { value: new THREE.Color(0xfff0d0) }, cloud: { value: 0.35 }, time: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(150000, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: `varying vec3 vd; void main(){ vd = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }`,
  fragmentShader: `uniform vec3 top,hor,sunDir,sunCol; uniform float cloud,time; varying vec3 vd;
  float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float ns(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
  float fb(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*ns(p); p*=2.03; a*=.5;} return s; }
  void main(){ vec3 d=normalize(vd); float y=max(d.y,0.);
    vec3 c=mix(hor,top,pow(y,.55));
    float s=max(dot(d,sunDir),0.); c+=sunCol*(pow(s,600.)*4.+pow(s,12.)*.35);
    if(d.y>0.){ vec2 uv=d.xz/(d.y+.12)*1.6+vec2(time*.004,0.); float cl=smoothstep(.55-cloud*.35,.95,fb(uv)); c=mix(c,mix(hor*1.05,vec3(1.),.4+.3*s),cl*.75*smoothstep(0.,.25,d.y)); }
    if(d.y<0.) c=hor;
    gl_FragColor=vec4(c,1.); }`
}));
sky.renderOrder = -10; scene.add(sky);

// ---------- địa hình ----------
async function loadImg(u, lat = false) { const b = await (await fetch(URLG(u))).blob(); return await createImageBitmap(b, { colorSpaceConversion: 'none', premultiplyAlpha: 'none', imageOrientation: lat ? 'flipY' : 'from-image' }); }
let terrain = null, HTEX = null, DTEX = null; const SAN = [];
const ngoaiU = { tam: { value: new THREE.Vector2(TAM[0], -TAM[1]) }, rsb: { value: RSB } };
async function dungDiaHinh() {
  const im = await loadImg('terrain/h.png');
  const c = new OffscreenCanvas(HM, HM).getContext('2d', { willReadFrequently: true });
  c.drawImage(im, 0, 0); const d = c.getImageData(0, 0, HM, HM).data;
  HGT = new Float32Array(HM * HM);
  for (let k = 0; k < HM * HM; k++) HGT[k] = (d[k * 4] * 256 + d[k * 4 + 1]) / 100 - 100;
  // san phẳng nền thành, đồn (vành chuyển tiếp 60 m)
  for (const [x0, n0, r] of SAN) {
    const h0 = Math.max(hAt(x0, n0), 1.2), R2 = r + 60, lx = x0 - TAM[0], ln = n0 - TAM[1];
    const i0 = Math.floor((lx - R2 + HALF) / HPX), i1 = Math.ceil((lx + R2 + HALF) / HPX), j0 = Math.floor((HALF - ln - R2) / HPX), j1 = Math.ceil((HALF - ln + R2) / HPX);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (i < 0 || j < 0 || i >= HM || j >= HM) continue;
      const x = -HALF + (i + 0.5) * HPX, n = HALF - (j + 0.5) * HPX, dd = Math.hypot(x - lx, n - ln), k = 1 - sstep(r, R2, dd);
      const id = j * HM + i; if (HGT[id] < 0.2 && dd > r) continue; HGT[id] = lerp(HGT[id], h0, k);
    }
  }
  // độ sâu cho shader nước: 1024, nửa độ phân giải
  const H2 = new Float32Array(1024 * 1024);
  for (let j = 0; j < 1024; j++) for (let i = 0; i < 1024; i++) { const a = (j * 2) * HM + i * 2; H2[j * 1024 + i] = (HGT[a] + HGT[a + 1] + HGT[a + HM] + HGT[a + HM + 1]) / 4; }
  HTEX = new THREE.DataTexture(H2, 1024, 1024, THREE.RedFormat, THREE.FloatType);
  HTEX.magFilter = HTEX.minFilter = THREE.LinearFilter; HTEX.needsUpdate = true;
  DTEX = new THREE.Texture(await loadImg('terrain/dist.png')); DTEX.flipY = false; DTEX.colorSpace = THREE.NoColorSpace; DTEX.generateMipmaps = false; DTEX.minFilter = THREE.LinearFilter; DTEX.needsUpdate = true;
  const tex = new THREE.Texture(await loadImg('terrain/mau.jpg')); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  // lưới: vòng trong mịn (~22 m), vòng ngoài thưa (~110 m) — uv theo toạ độ cục bộ ±16 km
  const luoi = (half, seg, keep) => {
    const pos = [], uv = [], idx = [], N = seg + 1, ok = new Int32Array(N * N).fill(-1);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const lx = -half + 2 * half * i / seg, ln = half - 2 * half * j / seg;
      ok[j * N + i] = pos.length / 3; const x = lx + TAM[0], n = ln + TAM[1];
      const mep = clamp((HALF - Math.max(Math.abs(lx), Math.abs(ln))) / 2500, 0, 1), hh = hAt(x, n);
      pos.push(x, hh > 0 ? hh * mep - (1 - mep) * 4 : Math.max(hh, -30), -n); uv.push((lx + HALF) / (2 * HALF), (HALF - ln) / (2 * HALF));
    }
    for (let j = 0; j < seg; j++) for (let i = 0; i < seg; i++) {
      const cx = -half + 2 * half * (i + 0.5) / seg, cn = half - 2 * half * (j + 0.5) / seg;
      if (!keep(Math.hypot(cx, cn))) continue;
      const a = j * N + i, b = a + 1, c2 = a + N, d2 = c2 + 1; idx.push(a, c2, b, b, c2, d2);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  };
  const mk = (geo, off) => {
    const mat = new THREE.MeshLambertMaterial({ map: tex });
    if (off) { mat.polygonOffset = true; mat.polygonOffsetFactor = 2; mat.polygonOffsetUnits = 4; }
    mat.onBeforeCompile = (s) => {
      s.uniforms.tam = ngoaiU.tam; s.uniforms.rsb = ngoaiU.rsb;
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <fog_vertex>', '#include <fog_vertex>\nvW=(modelMatrix*vec4(transformed,1.)).xyz;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
        uniform vec2 tam; uniform float rsb; varying vec3 vW; float th(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        float tn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(th(i),th(i+vec2(1,0)),f.x),mix(th(i+vec2(0,1)),th(i+vec2(1,1)),f.x),f.y); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
        float dd=length(vW-cameraPosition); float near=1.-smoothstep(150.,2500.,dd);
        float g1=tn(vW.xz*.45), g2=tn(vW.xz*1.9), g3=tn(vW.xz*.08);
        vec3 dc=diffuseColor.rgb; float lum=dot(dc,vec3(.3,.5,.2));
        // cỏ lốm đốm / đất trống khi nhìn gần
        vec3 co=dc*(0.82+0.36*g2)*(0.9+0.2*g1); vec3 dat=mix(dc,vec3(.52,.44,.32)*lum*2.2,.55);
        float bare=smoothstep(.62,.8,g3*.6+g1*.5)*step(.08,dc.g-dc.b)*(1.-step(.75,lum*1.3));
        diffuseColor.rgb=mix(dc,mix(co,dat,bare*.7),near);
        float wet=smoothstep(1.4,.5,vW.y); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.78,.76,.7),wet*.45);
        float rr=length(vec2(vW.x-tam.x, vW.z-tam.y));
        float ngoai=smoothstep(rsb-20.,rsb+60.,rr);
        diffuseColor.rgb=mix(diffuseColor.rgb, mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb,vec3(.33))), .35)*.78, ngoai);
        diffuseColor.rgb*=1.-.22*(smoothstep(rsb-35.,rsb,rr)-smoothstep(rsb,rsb+35.,rr));`);
    };
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = false; scene.add(m); return m;
  };
  terrain = mk(luoi(RSB + 200, 700, (r) => r < RSB + 150), false);
  mk(luoi(HALF, 300, (r) => r > RSB - 120), true);
}

// ---------- mặt nước (kiểu Bạch Đằng: trong theo độ sâu, sóng nhiễu êm; biển có sóng bờ nhiều lớp) ----------
const waterU = {
  time: { value: 0 }, hmap: { value: null }, dmap: { value: null }, tam: ngoaiU.tam, rsb: ngoaiU.rsb, sunDir: { value: SUN.clone() }, skyC: { value: new THREE.Color(0xa9c3d8) }, topC: { value: new THREE.Color(0x3f78b8) },
  deepC: { value: new THREE.Color(0x163a55) }, shallowC: { value: new THREE.Color(0x2c6670) }, rDeep: { value: new THREE.Color().setRGB(0.055, 0.12, 0.12) }, rShallow: { value: new THREE.Color().setRGB(0.30, 0.31, 0.20) },   // V1.3: màu sông như Thành cổ Quảng Trị
  fogC: { value: new THREE.Color() }, fogN: { value: 1 }, fogF: { value: 2 }, sunK: { value: 1 }, dark: { value: 0 }, rain: { value: 0 }
};
const water = new THREE.Mesh(new THREE.PlaneGeometry(400000, 400000, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
  uniforms: waterU, transparent: true, depthWrite: false,
  vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float time,sunK,dark,rain,fogN,fogF,rsb; uniform sampler2D hmap,dmap; uniform vec2 tam; uniform vec3 sunDir,skyC,topC,deepC,shallowC,rDeep,rShallow,fogC; varying vec3 vW;
  float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float ns(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
  float wav(vec2 q,float t){ return ns(q*.07+vec2(t*.22,t*.15))*.6+ns(q*.29-vec2(t*.37,-t*.28))*.3+ns(q*1.2+t*.8)*.1; }
  void main(){
    vec2 l=vec2(vW.x-tam.x, (-vW.z)+tam.y);
    vec2 uv=vec2((l.x+${HALF}.)/${2 * HALF}., (${HALF}.-l.y)/${2 * HALF}.);
    bool inb=uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.;
    float h=inb? texture2D(hmap,uv).r : -26.; float depth=-h;
    if(depth<-0.05) discard;
    vec3 dd=inb? texture2D(dmap,uv).rgb : vec3(1.,0.,0.);
    float sd=dd.r*510.; bool river=dd.g>.5;
    vec3 V=cameraPosition-vW; float dist=length(V); V/=dist;
    vec2 p=vW.xz; float t=time*(river?.6:1.);
    if(river) p+=vec2(0.,time*.35);
    float amp=(river?.9:1.6)/(1.+dist*.0016)*(1.+rain*.8);
    float e=.6, hx=wav(p+vec2(e,0.),t)-wav(p-vec2(e,0.),t), hz=wav(p+vec2(0.,e),t)-wav(p-vec2(0.,e),t);
    vec3 N=normalize(vec3(-hx*amp,1.,-hz*amp));
    float fr=.02+.98*pow(1.-max(dot(N,V),0.),5.);
    vec3 Rf=reflect(-V,N); vec3 sky=mix(skyC,topC,clamp(Rf.y*1.6,0.,1.));
    float sp=min(pow(max(dot(Rf,sunDir),0.),260.)*3.*sunK,1.6)*(1.-smoothstep(600.,3500.,dist))*(1.-rain);
    float k=1.-exp(-max(depth,0.)*(river?.42:.16));
    vec3 base= river? mix(rShallow,rDeep,k) : mix(shallowC,deepC,k);
    vec3 col=mix(base,sky,fr*(river?.6:.75))+vec3(1.,.93,.8)*sp*(river?.7:1.);
    float a=mix(.28,.95,1.-exp(-max(depth,0.)*.5));
    // sóng bờ biển: nhiều lớp vạch trắng chạy vào bờ
    float foam=0.;
    if(!river && inb){
      float fade=1.-smoothstep(4000.,9000.,dist);
      float br=ns(p*.012)*1.6+ns(p*.05)*.6;
      for(int i=0;i<3;i++){
        float fi=float(i); float lam=26.+fi*11.; float ph=sd/lam+time*(.16+fi*.035)+br+fi*.37;
        float f=fract(ph); float line=smoothstep(.80,.93,f)*(1.-smoothstep(.93,1.,f));
        line*=smoothstep(.15,.55,ns(p*vec2(.02,.035)+fi*7.3+time*.02));
        foam+=line*smoothstep(95.-fi*18.,12.,sd)*(.85-fi*.18);
      }
      float swash=smoothstep(9.,.5,sd)*(.55+.45*ns(p*.18+time*.6));
      foam=max(foam*fade, swash);
      foam=min(foam,1.);
    } else if(river){ foam=smoothstep(.45,.0,depth)*(.35+.35*ns(p*.4+time*.5)); }
    col=mix(col,vec3(.95,.97,.96),foam*.85);
    a=max(a,foam*.9); a=max(a,fr*.7);
    col*=1.-dark*.72;
    float rr=length(vec2(vW.x-tam.x,vW.z-tam.y)); col*=1.-.18*smoothstep(rsb-20.,rsb+80.,rr);
    float fg=smoothstep(fogN,fogF,dist); col=mix(col,fogC,fg); a=mix(a,1.,fg);
    gl_FragColor=vec4(col,a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`
}));
water.renderOrder = 1; scene.add(water);
// mặt nước hào (V1.3): cùng màu sông kiểu Thành cổ Quảng Trị, gợn sóng nhẹ, phản chiếu trời
const MAT_HAO = new THREE.ShaderMaterial({
  uniforms: waterU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
  vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float time,sunK,dark,rain,fogN,fogF; uniform vec3 sunDir,skyC,topC,rDeep,rShallow,fogC; varying vec3 vW;
  float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float ns(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y); }
  float wav(vec2 q,float t){ return ns(q*.29+vec2(t*.2,t*.13))*.6+ns(q*1.1-vec2(t*.35,-t*.25))*.3+ns(q*3.+t*.7)*.1; }
  void main(){
    vec3 V=cameraPosition-vW; float dist=length(V); V/=dist; vec2 p=vW.xz;
    float amp=.5/(1.+dist*.004)*(1.+rain), e=.3, hx=wav(p+vec2(e,0.),time)-wav(p-vec2(e,0.),time), hz=wav(p+vec2(0.,e),time)-wav(p-vec2(0.,e),time);
    vec3 N=normalize(vec3(-hx*amp,1.,-hz*amp)); float fr=.02+.98*pow(1.-max(dot(N,V),0.),5.);
    vec3 Rf=reflect(-V,N); vec3 sky=mix(skyC,topC,clamp(Rf.y*1.6,0.,1.));
    float sp=min(pow(max(dot(Rf,sunDir),0.),220.)*2.*sunK,1.2)*(1.-rain);
    vec3 base=mix(rShallow,rDeep,.5)*(.74+.14*ns(p*.08+time*.05));
    vec3 col=mix(base,sky*.6,fr*.15)+vec3(1.,.93,.8)*sp*.6;
    col*=1.-dark*.72; float fg=smoothstep(fogN,fogF,dist); col=mix(col,fogC,fg);
    gl_FragColor=vec4(col,mix(.9,1.,fr));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`
});
// ---------- bộ ghép hình khối (màu theo đỉnh) ----------
class Ghep {
  constructor() { this.p = []; this.n = []; this.c = []; }
  them(geo, mat, col) {
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(mat); g.computeVertexNormals();
    const P = g.attributes.position.array, N = g.attributes.normal.array, cc = new THREE.Color(col);
    for (let i = 0; i < P.length; i++) { this.p.push(P[i]); this.n.push(N[i]); }
    const C = g.attributes.color;
    for (let i = 0; i < P.length / 3; i++) { if (C) this.c.push(C.getX(i), C.getY(i), C.getZ(i)); else this.c.push(cc.r, cc.g, cc.b); }
    return this;
  }
  hop(sx, sy, sz, x, y, z, col, ry = 0, rx = 0, rz = 0) { return this.them(new THREE.BoxGeometry(sx, sy, sz), M4(x, y, z, ry, rx, rz), col); }
  tru(r1, r2, h, x, y, z, col, seg = 8, ry = 0, rx = 0, rz = 0) { return this.them(new THREE.CylinderGeometry(r1, r2, h, seg), M4(x, y, z, ry, rx, rz), col); }
  // mái hai dốc: dài L (trục x), rộng B, cao H, chìa mái e
  mai(L, B, H, x, y, z, col, ry = 0, e = 0.5) {
    const g = new THREE.BufferGeometry(), a = L / 2 + e, b = B / 2 + e;
    const v = [-a, 0, -b, a, 0, -b, a, H, 0, -a, 0, -b, a, H, 0, -a, H, 0, a, 0, b, -a, 0, b, -a, H, 0, a, 0, b, -a, H, 0, a, H, 0,
      -a, 0, -b, -a, H, 0, -a, 0, b, a, 0, b, a, H, 0, a, 0, -b];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return this.them(g, M4(x, y, z, ry), col);
  }
  // mái chóp (tứ giác)
  maiChop(L, B, H, x, y, z, col, ry = 0, e = 0.6) {
    const a = L / 2 + e, b = B / 2 + e, r = Math.max(0, a - b);
    const g = new THREE.BufferGeometry();
    const v = [-a, 0, -b, a, 0, -b, r, H, 0, -a, 0, -b, r, H, 0, -r, H, 0, a, 0, b, -a, 0, b, -r, H, 0, a, 0, b, -r, H, 0, r, H, 0,
      -a, 0, b, -a, 0, -b, -r, H, 0, a, 0, -b, a, 0, b, r, H, 0];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return this.them(g, M4(x, y, z, ry), col);
  }
  luoi(mat) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    return new THREE.Mesh(g, mat || MATV);
  }
  geo() { return this.luoi().geometry; }
}
const MATV = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
const MATV2 = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
function M4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  const m = new THREE.Matrix4(); m.compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new V3(s, s, s)); return m;
}
// dải (tường, lũy) theo đường gấp khúc kín/hở trong toạ độ cục bộ (x, z)
function dai(g, pts, w0, w1, h0, h1, col, kin = true, colTop, csMin = 0.6) {
  // w0: lệch mép ngoài, w1: lệch mép trong (theo pháp tuyến trái), h0 đáy, h1 đỉnh
  const n = pts.length, L = kin ? n : n - 1, nor = [];
  for (let i = 0; i < n; i++) {
    const a = pts[kin ? (i - 1 + n) % n : Math.max(i - 1, 0)], b = pts[i], c = pts[kin ? (i + 1) % n : Math.min(i + 1, n - 1)];
    let d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = c[0] - b[0], d2z = c[1] - b[1];
    const l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1; d1x /= l1; d1z /= l1; d2x /= l2; d2z /= l2;
    let nx = -(d1z + d2z), nz = d1x + d2x; const ln = Math.hypot(nx, nz) || 1; nx /= ln; nz /= ln;
    const cs = Math.max(csMin, nx * -d2z + nz * d2x); nor.push([nx / cs, nz / cs]);
  }
  const v = [], cl = [], C1 = new THREE.Color(col), C2 = new THREE.Color(colTop || col);
  const P = (i, w, y) => [pts[i][0] + nor[i][0] * w, y, pts[i][1] + nor[i][1] * w];
  const quad = (A, B, Cc, Dd, cc) => { v.push(...A, ...B, ...Cc, ...A, ...Cc, ...Dd); for (let k = 0; k < 6; k++) cl.push(cc.r, cc.g, cc.b); };
  for (let s = 0; s < L; s++) {
    const i = s, j = (s + 1) % n;
    const yo0 = (typeof h0 === 'function') ? h0(i) : h0, yo1 = (typeof h0 === 'function') ? h0(j) : h0;
    const yt0 = (typeof h1 === 'function') ? h1(i) : h1, yt1 = (typeof h1 === 'function') ? h1(j) : h1;
    quad(P(i, w0, yo0), P(j, w0, yo1), P(j, w0 * 0.85 + w1 * 0.15, yt1), P(i, w0 * 0.85 + w1 * 0.15, yt0), C1);
    quad(P(i, w0 * 0.85 + w1 * 0.15, yt0), P(j, w0 * 0.85 + w1 * 0.15, yt1), P(j, w1, yt1), P(i, w1, yt0), C2);
    quad(P(i, w1, yt0), P(j, w1, yt1), P(j, w1, yo1), P(i, w1, yo0), C1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
  g.them(geo, new THREE.Matrix4(), col);
}
function quad2(g, A, B, C, D, col) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...C, ...A, ...C, ...D], 3)); g.them(geo, new THREE.Matrix4(), col); }

// ---------- cờ ----------
function coTex(kieu) {
  const c = document.createElement('canvas'); c.width = 96; c.height = 64; const g = c.getContext('2d');
  if (kieu === 'phap') { ['#1f3f9a', '#f4f4f4', '#d0262e'].forEach((k, i) => { g.fillStyle = k; g.fillRect(i * 32, 0, 32, 64); }); }
  else if (kieu === 'tbn') { g.fillStyle = '#c4202a'; g.fillRect(0, 0, 96, 64); g.fillStyle = '#f2c230'; g.fillRect(0, 16, 96, 32); }
  else { g.fillStyle = '#e8b81f'; g.fillRect(0, 0, 96, 64); g.strokeStyle = '#b8261f'; g.lineWidth = 6; g.strokeRect(3, 3, 90, 58); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const CO_TEX = {};
const coMat = (k) => (CO_TEX[k] ||= new THREE.MeshLambertMaterial({ map: coTex(k), side: THREE.DoubleSide }));
const CO_LIST = [];
const coGeo = () => { const g = new THREE.PlaneGeometry(1.5, 1, 8, 2); g.translate(0.75, 0, 0); return g; };
function taoCo(kieu, cao = 8, to = 1) {
  const grp = new THREE.Group();
  const cot = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * to, 0.09 * to, cao, 6), new THREE.MeshLambertMaterial({ color: 0x5a4632 }));
  cot.position.y = cao / 2; grp.add(cot);
  const la = new THREE.Mesh(coGeo(), coMat(kieu)); la.scale.set(to * 1.6, to * 1.6, 1); la.position.y = cao - to * 0.9; grp.add(la);
  grp.userData = { la, kieu, base: la.geometry.attributes.position.array.slice(), ph: Math.random() * 6 };
  CO_LIST.push(grp); return grp;
}
function doiCo(grp, kieu) { if (grp.userData.kieu !== kieu) { grp.userData.kieu = kieu; grp.userData.la.material = coMat(kieu); } }
function coBay(t) {
  for (const f of CO_LIST) {
    if (!f.visible) continue; const u = f.userData, p = u.la.geometry.attributes.position, b = u.base;
    for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.array[i * 3 + 2] = Math.sin(x * 3.2 - t * 6 + u.ph) * 0.16 * x; p.array[i * 3 + 1] = b[i * 3 + 1] - x * x * 0.05; }
    p.needsUpdate = true;
  }
}

// ---------- khẩu đại bác (thế kỷ XIX, bệ gỗ bánh xe) ----------
// ---------- V1.3: gạch thành kiểu Thành cổ Quảng Trị (vân gạch ám cũ, chiếu theo 3 trục) ----------
const GACH_TEX = new THREE.Texture(); GACH_TEX.wrapS = GACH_TEX.wrapT = THREE.RepeatWrapping; GACH_TEX.colorSpace = THREE.SRGBColorSpace; GACH_TEX.anisotropy = 8;
async function napGach() { try { GACH_TEX.image = await loadImg('tex/gach.webp'); GACH_TEX.needsUpdate = true; } catch (e) { console.warn('gach', e); } }
const MAT_GACH = new THREE.MeshLambertMaterial({ vertexColors: true, map: GACH_TEX, side: THREE.DoubleSide });
MAT_GACH.onBeforeCompile = (sh) => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
    .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
    .replace('#include <map_fragment>', `vec3 an=abs(vWN); vec2 tuv= an.y>.75 ? vWP.xz : (an.x>an.z ? vWP.zy : vWP.xy);
      vec3 tc=texture2D(map,tuv/1.7).rgb; float re=.82+.18*sin(vWP.x*.11+vWP.z*.07)*sin(vWP.y*.6+vWP.x*.03);
      float st=sin(vWP.x*.045+sin(vWP.z*.07)*2.)*sin(vWP.z*.05+vWP.y*.2)*.5+.5; float am=mix(1.,.62,st*st)*mix(.78,1.,smoothstep(.0,2.2,vWP.y-floor(vWP.y/40.)*0.));
      vec3 reu=mix(vec3(1.),vec3(.78,.86,.7),(1.-smoothstep(0.,1.8,fract(vWP.y*.0)+.0))*.0);
      diffuseColor.rgb*=tc*1.8*re*am*(an.y>.75?.85:1.);`);
};
// ---------- V1.3: đại bác theo mẫu súng thần công anh gửi (một InstancedMesh cho cả sa bàn) ----------
let MAU_PHAO = null, PHAO_GRP = null; const PHAO_INST = [];
async function napPhao() {
  try {
    const d = await (await fetch(URLG('nv/phao.json'))).json();
    const tex = new THREE.Texture(await loadImg('nv/phao.jpg')); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(b64(d.pos, Float32Array), 3)); g.setAttribute('uv', new THREE.BufferAttribute(b64(d.uv, Float32Array), 2));
    g.setIndex(new THREE.BufferAttribute(b64(d.idx, Uint16Array), 1)); g.computeVertexNormals();
    MAU_PHAO = { g, mat: new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), mieng: d.mieng };
  } catch (e) { console.warn('phao', e); }
}
function dungPhaoMau() {
  if (!MAU_PHAO || !PHAO_INST.length) return;
  const im = new THREE.InstancedMesh(MAU_PHAO.g, MAU_PHAO.mat, PHAO_INST.length), m = new THREE.Matrix4();
  PHAO_INST.forEach(([grp, L], i) => { grp.updateMatrixWorld(true); im.setMatrixAt(i, m.multiplyMatrices(grp.matrixWorld, L)); });
  im.instanceMatrix.needsUpdate = true; scene.add(im); CONG_PHAO = im;
}
let CONG_PHAO = null;
function daiBac(g, x, y, z, ry, s = 1, mauBe = 0x7a2f22) {
  if (MAU_PHAO && PHAO_GRP) { PHAO_INST.push([PHAO_GRP, M4(x, y, z, ry + Math.PI, 0, 0, 0.85 * s)]); return; }   // nòng mẫu hướng +Z
  const m = M4(x, y, z, ry), add = (geo, mm, col) => g.them(geo, m.clone().multiply(mm), col);
  add(new THREE.CylinderGeometry(0.13 * s, 0.2 * s, 2.5 * s, 10).rotateX(Math.PI / 2), M4(0, 0.95 * s, -0.25 * s, 0, 0.06), 0x24262a);
  add(new THREE.SphereGeometry(0.2 * s, 8, 6), M4(0, 0.95 * s, 0.95 * s), 0x24262a);
  add(new THREE.BoxGeometry(0.12 * s, 0.4 * s, 1.7 * s), M4(-0.3 * s, 0.68 * s, 0.25 * s, 0, -0.18), mauBe);
  add(new THREE.BoxGeometry(0.12 * s, 0.4 * s, 1.7 * s), M4(0.3 * s, 0.68 * s, 0.25 * s, 0, -0.18), mauBe);
  add(new THREE.BoxGeometry(0.72 * s, 0.12 * s, 0.5 * s), M4(0, 0.5 * s, 0.9 * s), mauBe);
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.1 * s, 14).rotateZ(Math.PI / 2), M4(sx * 0.45 * s, 0.55 * s, -0.25 * s), mauBe);
    add(new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.14 * s, 8).rotateZ(Math.PI / 2), M4(sx * 0.47 * s, 0.55 * s, -0.25 * s), 0x2c2c2c);
  }
}
// ---------- công trình ----------
const VT = {};               // vitri.json
const CONG = {};             // các nhóm công trình theo tên
const PHAO = [];             // khẩu pháo trên thành: {pos (world), dir, ten}
const COT_CO = {};           // cờ theo tên vị trí

// vết pháo đài kiểu Vauban 4 góc: nửa trục A (x), B (z), góc lăng p
function vetThanh(A, B, p, q, f) {
  const out = []; const order = [[1, -1], [1, 1], [-1, 1], [-1, -1]];
  for (const [sx, sz] of order) {
    if (sx > 0 && sz < 0) out.push([sx * (A - q), sz * B], [sx * (A - q), sz * (B + f)], [sx * (A + p), sz * (B + p)], [sx * (A + f), sz * (B - q)], [sx * A, sz * (B - q)]);
    if (sx > 0 && sz > 0) out.push([sx * A, sz * (B - q)], [sx * (A + f), sz * (B - q)], [sx * (A + p), sz * (B + p)], [sx * (A - q), sz * (B + f)], [sx * (A - q), sz * B]);
    if (sx < 0 && sz > 0) out.push([sx * (A - q), sz * B], [sx * (A - q), sz * (B + f)], [sx * (A + p), sz * (B + p)], [sx * (A + f), sz * (B - q)], [sx * A, sz * (B - q)]);
    if (sx < 0 && sz < 0) out.push([sx * A, sz * (B - q)], [sx * (A + f), sz * (B - q)], [sx * (A + p), sz * (B + p)], [sx * (A - q), sz * (B + f)], [sx * (A - q), sz * B]);
  }
  return out;
}
function nhaNgoi(g, L, B, H, x, y, z, ry, tuong = 0xd9cdb0, mai = 0x7b3a2a) {
  const m = M4(x, y, z, ry);
  const g2 = new Ghep(); g2.hop(L, H, B, 0, H / 2, 0, tuong); g2.hop(L * 0.98, 0.25, B + 0.9, 0, H, 0, 0x5a3b28); g2.maiChop(L, B, B * 0.45, 0, H, 0, mai, 0, 0.8);
  const geo = g2.geo(); geo.applyMatrix4(m); g.them(geo, new THREE.Matrix4(), tuong);
}
// thành (Điện Hải, An Hải): A, B nửa cạnh
function taoThanh(ten, A, B, ry, coKieu = 'nguyen', soPhao = 12) {
  const v = VT[ten], cx = v.x, cn = v.n, y0 = Math.max(gAt(cx, cn), 0.6) - 0.3;
  const grp = new THREE.Group(); grp.position.set(cx, y0, -cn); grp.rotation.y = ry; scene.add(grp);
  const g = new Ghep(), gg = new Ghep(); PHAO_GRP = grp;
  const vet = vetThanh(A, B, 16, 12, 14);
  const GACH = 0xb3a698, GACH2 = 0xbcae9e, VIEN = 0xcfc4b4;
  // hào nước (V1.3): vành nước quanh chân tường, kè gạch hai bờ
  { const ngoai = lechVet(vet, -15), trong = lechVet(vet, -0.6);
    const sh = new THREE.Shape(ngoai.map(([x, z]) => new THREE.Vector2(x, z))); sh.holes.push(new THREE.Path(trong.map(([x, z]) => new THREE.Vector2(x, z))));
    const mg = new THREE.ShapeGeometry(sh); mg.rotateX(Math.PI / 2); const nh = new THREE.Mesh(mg, MAT_HAO); nh.position.y = 0.45; nh.renderOrder = 2; grp.add(nh);
    dai(gg, ngoai, 0, -1.2, -1.5, 0.75, GACH, true, VIEN); }
  dai(gg, vet, 0, 7, -1.5, 5.2, GACH, true, 0x9a9480, 0.3);             // tường gạch (chân dưới mặt nước hào), mặt thành
  dai(gg, vet, 0.95, 1.95, 5.12, 6.25, GACH2, true, VIEN, 0.3);   // V1.4: tường chắn mái ngồi hẳn trên mặt thành (hết khe hở)
  g.hop(2 * A - 6, 0.4, 2 * B - 6, 0, 0.1, 0, 0x8f8a62);
  // cổng (giữa cạnh Nam, z = +B) + vọng lâu hai tầng mái
  gg.hop(12, 6.8, 9, 0, 3.4, B, GACH2); g.hop(4, 4, 9.4, 0, 2, B, 0x2a211b);
  g.hop(10, 3, 7, 0, 8.3, B, 0xb08a5e); g.maiChop(10, 7, 2.2, 0, 9.8, B, 0x6a3122, 0, 1.2); g.maiChop(7, 5, 2.2, 0, 11.8, B, 0x6a3122, 0, 1.1);
  // cầu qua hào
  gg.hop(4.5, 0.5, 18, 0, 0.75, B + 13, 0xb8a48c); gg.hop(0.3, 0.9, 18, -2.2, 1.3, B + 13, VIEN); gg.hop(0.3, 0.9, 18, 2.2, 1.3, B + 13, VIEN);
  // nhà trong thành
  const R = rng(ten.length * 77);
  nhaNgoi(g, 30, 11, 4.5, 0, 0.2, -B * 0.25, 0, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 24, 9, 4, -A * 0.45, 0.2, B * 0.25, Math.PI / 2, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 24, 9, 4, A * 0.45, 0.2, B * 0.25, Math.PI / 2, 0xcbb995, 0x6d3426);
  nhaNgoi(g, 16, 8, 3.6, -A * 0.4, 0.2, -B * 0.55, 0, 0xc1ad8a, 0x5d3a2b);
  nhaNgoi(g, 16, 8, 3.6, A * 0.4, 0.2, -B * 0.55, 0, 0xc1ad8a, 0x5d3a2b);
  for (let k = 0; k < 18; k++) { const x = (R() - 0.5) * A * 1.5, z = (R() - 0.5) * B * 1.4; if (Math.abs(x) < 18 && Math.abs(z + B * 0.25) < 9) continue; g.tru(0.2, 0.3, 3, x, 1.5, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(2.6, 0), M4(x, 4.6, z), 0x3d6a32); }
  // đại bác sát mép tường trên mọi mặt lăng và các cạnh (trừ chỗ cổng)
  const ds = []; for (let i = 0; i < vet.length; i++) { const a = vet[i], b = vet[(i + 1) % vet.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), mz = (a[1] + b[1]) / 2, mx = (a[0] + b[0]) / 2;
    if (L < 12) continue; if (Math.abs(mx) < 10 && mz > B - 5) { ds.push([i, 2]); continue; } ds.push([i, L > 50 ? 2 : 1]); }
  grp.updateMatrixWorld(true); datPhaoTheoTuong(gg, grp, vet, ten, 5.2, 2.9, ds.slice(0, soPhao));   // bánh xe vừa chạm tường chắn
  const mesh = g.luoi(); grp.add(mesh); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo(coKieu, 14, 2.2); co.position.set(-(A + 12), 5.2, -(B + 12)); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// đồn đất vuông có rào tre
function taoDon(ten, r = 26, coKieu = 'nguyen', ry = 0.3) {
  const v = VT[ten]; const y0 = Math.max(gAt(v.x, v.n), 0.6) - 0.2;
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); grp.rotation.y = ry; scene.add(grp);
  const g = new Ghep(), vet = [[r, -r], [r, r], [-r, r], [-r, -r]];
  dai(g, vet, 9, 4, -1, 0.1, 0x5d5236, true);
  dai(g, vet, 4, -4, 0, 3, 0x8a6a45, true, 0x7c7a48);
  const R = rng(ten.length * 31 + 7);
  for (let k = 0; k < 4; k++) for (let s = -r + 1; s < r; s += 1.4) {
    const [a, b] = vet[k], [c, d] = vet[(k + 1) % 4], u = (s + r) / (2 * r);
    g.tru(0.07, 0.09, 2.2 + R() * 0.6, a + (c - a) * u + (k % 2 ? 0 : 0) * 1, 4, b + (d - b) * u, 0x8d8a4a, 4);
  }
  nhaNgoi(g, 12, 6, 2.8, 0, 0, -4, 0, 0xb9a57c, 0x8a7a48);
  nhaNgoi(g, 9, 5, 2.6, -8, 0, 10, Math.PI / 2, 0xb9a57c, 0x8a7a48);
  PHAO_GRP = grp; daiBac(g, r - 2.2, 3, -r + 2.2, Math.atan2(-(r - 2.2), r - 2.2), 0.8); daiBac(g, -r + 2.2, 3, -r + 2.2, Math.atan2(r - 2.2, r - 2.2), 0.8); PHAO_GRP = null;
  grp.add(g.luoi());
  const co = taoCo(coKieu, 10, 1.5); co.position.set(r - 3, 3, r - 3); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// ụ pháo đá nửa vầng trăng (pháo đài Sơn Trà, Định Hải)
function taoPhaoDai(ten, huong, soPhao = 4, coKieu = 'nguyen') {
  const v = VT[ten]; const y0 = Math.max(gAt(v.x, v.n), 0.6) - 0.2;
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); grp.rotation.y = huong; scene.add(grp);
  const g = new Ghep(), gg = new Ghep(), pts = []; PHAO_GRP = grp;
  for (let k = 0; k <= 12; k++) { const a = Math.PI * (k / 12); pts.push([Math.cos(a) * 22, -Math.sin(a) * 16]); }
  dai(gg, pts, 3, -3, -0.5, 3.2, 0xb0a494, false, 0x9a9480);
  g.hop(40, 0.5, 18, 0, 0, 2, 0x8c845e);
  nhaNgoi(g, 10, 5, 2.6, 0, 0, 8, 0, 0xb9a57c, 0x6d3426);
  for (let k = 0; k < soPhao; k++) {
    const a = Math.PI * ((k + 0.5) / soPhao), x = Math.cos(a) * 22.4, z = -Math.sin(a) * 16.4;
    daiBac(gg, x, 3.2, z, Math.atan2(-x, -z), 1.0);
    const w = new V3(x, 3.2, z).applyAxisAngle(new V3(0, 1, 0), huong).add(grp.position);
    const d = new V3(x, 0, z).normalize().applyAxisAngle(new V3(0, 1, 0), huong);
    PHAO.push({ ten, pos: w, dir: d });
  }
  grp.add(g.luoi()); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo(coKieu, 10, 1.6); co.position.set(16, 3.2, 6); grp.add(co); COT_CO[ten] = co;
  CONG[ten] = grp; return grp;
}
// Hải Vân Quan: cổng đá + vọng lâu
function taoHaiVan() {
  const v = VT['hai-van']; const y0 = gAt(v.x, v.n);
  const grp = new THREE.Group(); grp.position.set(v.x, y0 - 0.5, -v.n); grp.rotation.y = 0.75; scene.add(grp);
  const g = new Ghep();
  g.hop(26, 7, 8, 0, 3.5, 0, 0x8c8478); g.hop(4, 4.6, 8.4, 0, 2.3, 0, 0x2b2620);
  g.hop(30, 6, 3, 0, 3, -6, 0x7d766a); g.hop(30, 6, 3, 0, 3, 6, 0x7d766a);
  g.hop(10, 3.4, 7, 0, 8.7, 0, 0xa68a62); g.maiChop(10, 7, 2.4, 0, 10.4, 0, 0x5d3226, 0, 1.2);
  nhaNgoi(g, 10, 5, 2.6, -16, 0, 10, 0, 0xb9a57c, 0x6d3426);
  grp.add(g.luoi());
  const co = taoCo('nguyen', 9, 1.5); co.position.set(-10, 7, 0); grp.add(co); COT_CO['hai-van'] = co;
  CONG['hai-van'] = grp;
}

// ---------- làng, cây ----------
const NHA_GEO = (() => { const g = new Ghep(); g.hop(7, 2.4, 4.5, 0, 1.2, 0, 0xffffff); g.mai(7, 4.5, 2.4, 0, 2.4, 0, 0xffffff, 0, 0.6); return g.geo(); })();
const NHA_MAT = new THREE.MeshLambertMaterial({ vertexColors: false });
function nhaGeoMau() {
  const g = new Ghep(); g.hop(7, 2.4, 4.5, 0, 1.2, 0, 0xb39a72); g.hop(1.2, 1.6, 0.1, 0, 0.8, 2.26, 0x3b2c20); g.mai(7, 4.5, 2.6, 0, 2.4, 0, 0x9a8650, 0, 0.7); return g.geo();
}
function cayDuaGeo() {
  const g = new Ghep(); g.tru(0.16, 0.24, 9, 0.6, 4.5, 0, 0x7b6a52, 5, 0, 0, -0.12);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; g.hop(0.9, 0.08, 4.2, 1.15 + Math.cos(a) * 1.8, 8.6, Math.sin(a) * 1.8, 0x4f7a34, -a + Math.PI / 2, 0.35); }
  return g.geo();
}
function treGeo() { const g = new Ghep(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; g.tru(0.6, 0.05, 11 + (k % 3) * 2, Math.cos(a) * 1.2, 6, Math.sin(a) * 1.2, k % 2 ? 0x6f8f3d : 0x5c7d33, 5, 0, Math.cos(a) * 0.25, Math.sin(a) * 0.25); } return g.geo(); }
function cayGeo() { const g = new Ghep(); g.tru(0.25, 0.35, 3.5, 0, 1.75, 0, 0x5b4a36, 5); g.them(new THREE.IcosahedronGeometry(3.2, 0), M4(0, 5.2, 0), 0x3f6b30); g.them(new THREE.IcosahedronGeometry(2.2, 0), M4(1.4, 6.6, 0.6), 0x4c7a36); return g.geo(); }
function instDat(geo, list, mat) {
  const im = new THREE.InstancedMesh(geo, mat || MATV, list.length), m = new THREE.Matrix4();
  list.forEach((o, i) => { m.compose(new V3(o[0], o[1], o[2]), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), o[3]), new V3(o[4], o[4], o[4])); im.setMatrixAt(i, m); });
  im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; scene.add(im); return im;
}
function datDuoc(x, n, cachNuoc = 25, hMax = 18) {
  const h = hAt(x, n); if (h < 0.7 || h > hMax) return false;
  for (const [dx, dn] of [[cachNuoc, 0], [-cachNuoc, 0], [0, cachNuoc], [0, -cachNuoc]]) if (hAt(x + dx, n + dn) < 0.3) return false;
  return Math.abs(hAt(x + 15, n) - hAt(x - 15, n)) < 4 && Math.abs(hAt(x, n + 15) - hAt(x, n - 15)) < 4;
}
const TRANH = [];   // vùng không đặt nhà/cây: [x, n, r]
function trongVungTranh(x, n) { for (const [a, b, r] of TRANH) if ((x - a) ** 2 + (n - b) ** 2 < r * r) return true; return false; }
function dungLang() {
  const R = rng(1858), nha = [], dua = [], tre = [], cay = [];
  // cụm làng (ƯỚC LƯỢNG – minh hoạ cảnh quan 1858)
  const LANG = [[-340, -1500, 260, 60], [-1500, -2300, 300, 70], [-2900, -2900, 300, 60], [-4800, -1700, 300, 50], [-6800, -300, 320, 55], [-8300, 1800, 260, 40],
    [-9200, 3800, 200, 30], [600, -2600, 300, 70], [1600, -3900, 240, 40], [2700, -2500, 260, 60], [2600, -4300, 260, 60], [3300, -6000, 260, 55],
    [3800, -7300, 260, 50], [300, -5100, 300, 55], [-700, -3900, 300, 55], [-1200, -8400, 320, 65], [400, -9000, 300, 50], [-3500, -6500, 350, 55],
    [-6000, -7000, 400, 60], [2900, 300, 260, 40], [4800, -2000, 300, 45], [5800, -5200, 300, 45], [-2400, -10500, 400, 60], [1500, -11500, 400, 50]];
  for (const [cx, cn, r, k] of LANG) {
    for (let i = 0; i < k; i++) {
      const a = R() * 6.28, d = Math.sqrt(R()) * r, x = cx + Math.cos(a) * d, n = cn + Math.sin(a) * d;
      if (!datDuoc(x, n) || trongVungTranh(x, n)) continue;
      nha.push([x, gAt(x, n) - 0.1, -n, R() * 6.28, 0.85 + R() * 0.35]);
      for (let j = 0; j < 2; j++) { const xx = x + (R() - 0.5) * 30, nn = n + (R() - 0.5) * 30; if (datDuoc(xx, nn, 10) && !trongVungTranh(xx, nn)) (R() < 0.55 ? tre : cay).push([xx, gAt(xx, nn) - 0.2, -nn, R() * 6.28, 0.8 + R() * 0.5]); }
      if (R() < 0.7) { const xx = x + (R() - 0.5) * 24, nn = n + (R() - 0.5) * 24; if (datDuoc(xx, nn, 8) && !trongVungTranh(xx, nn)) dua.push([xx, gAt(xx, nn) - 0.2, -nn, R() * 6.28, 0.8 + R() * 0.4]); }
    }
  }
  // dừa ven biển, cây rải rác
  for (let i = 0; i < 7000; i++) {
    const x = (R() - 0.5) * 2 * HALF * 0.9, n = (R() - 0.5) * 2 * HALF * 0.9, h = hAt(x, n);
    if (h < 0.7 || trongVungTranh(x, n)) continue;
    let gan = false; for (const [dx, dn] of [[60, 0], [-60, 0], [0, 60], [0, -60]]) if (hAt(x + dx, n + dn) < 0.2) gan = true;
    if (gan && h < 6 && R() < 0.8) dua.push([x, h - 0.2, -n, R() * 6.28, 0.8 + R() * 0.4]);
    else if (h > 6 && h < 300 && R() < 0.5) cay.push([x, h - 0.3, -n, R() * 6.28, 1 + R() * 1.2]);
    else if (h < 20 && R() < 0.12 && datDuoc(x, n, 10)) tre.push([x, h - 0.2, -n, R() * 6.28, 0.8 + R() * 0.5]);
  }
  CONG.nha = instDat(nhaGeoMau(), nha); CONG.dua = instDat(cayDuaGeo(), dua); CONG.tre = instDat(treGeo(), tre); CONG.cay = instDat(cayGeo(), cay);
  return { nha: nha.length, dua: dua.length, tre: tre.length, cay: cay.length };
}

// ---------- lũy đất, hào, chông (Hồi 8) ----------
const LUY = [];   // {pts:[[x,n]], t0, t1, mesh}
function taoLuy(pts, t0, t1, ten) {
  // chia đoạn ngắn 25 m để bám đất
  const P = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = pts[i], [c, d] = pts[i + 1], L = Math.hypot(c - a, d - b), k = Math.max(1, Math.round(L / 25));
    for (let s = 0; s < k; s++) P.push([a + (c - a) * s / k, b + (d - b) * s / k]);
  }
  P.push(pts[pts.length - 1]);
  const g = new Ghep(), loc = P.map(([x, n]) => [x, -n]), hh = P.map(([x, n]) => Math.max(gAt(x, n), 0.5));
  dai(g, loc, 3.5, -3.5, (i) => hh[i] - 0.4, (i) => hh[i] + 2.4, 0x86683f, false, 0x7a7a42);         // lũy
  dai(g, loc, 9, 4.5, (i) => hh[i] - 0.3, (i) => hh[i] - 0.05, 0x3f3526, false);                     // hào (dải sẫm phía Bắc)
  const mesh = g.luoi(MATV2); scene.add(mesh);
  // chông: hàng cọc nghiêng trước hào
  const ch = []; const R = rng(P.length * 13);
  for (let i = 0; i < P.length - 1; i++) {
    const [a, b] = P[i], [c, d] = P[i + 1], L = Math.hypot(c - a, d - b), nx = -(d - b) / L, nn = (c - a) / L;
    for (let s = 0; s < L; s += 1.1) for (const off of [11, 12.2]) {
      const x = a + (c - a) * s / L + nx * off, n = b + (d - b) * s / L + nn * off;
      ch.push([x, Math.max(gAt(x, n), 0.5) - 0.1, -n, Math.atan2(nx, nn) + (R() - 0.5) * 0.3, 1]);
    }
  }
  const cg = new THREE.CylinderGeometry(0.0, 0.05, 1.3, 4); cg.rotateX(-0.6); cg.translate(0, 0.5, 0);
  const cm = instDat(cg, ch, new THREE.MeshLambertMaterial({ color: 0xa79a5c }));
  const o = { ten, pts: P, t0, t1, mesh, chong: cm, dai: P.length }; LUY.push(o); return o;
}
function luyCapNhat(t) {
  for (const o of LUY) {
    const k = clamp((t - o.t0) / (o.t1 - o.t0), 0, 1);
    o.mesh.visible = k > 0; o.chong.visible = k > 0.98;
    const tot = o.mesh.geometry.attributes.position.count; o.mesh.geometry.setDrawRange(0, Math.floor(tot * k / 18) * 18);
  }
}
// lều (trại quân liên quân)
function leuGeo() { const g = new Ghep(), gg = new THREE.BufferGeometry(); const v = [-2, 0, -2.5, 2, 0, -2.5, 0, 2.2, -2.5, -2, 0, 2.5, 0, 2.2, 2.5, 2, 0, 2.5, -2, 0, -2.5, 0, 2.2, -2.5, 0, 2.2, 2.5, -2, 0, -2.5, 0, 2.2, 2.5, -2, 0, 2.5, 2, 0, -2.5, 2, 0, 2.5, 0, 2.2, 2.5, 2, 0, -2.5, 0, 2.2, 2.5, 0, 2.2, -2.5]; gg.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.them(gg, new THREE.Matrix4(), 0xe6e0cc); return g.geo(); }
function dungTrai(cx, cn, nx, nz, ry, t0) {
  const L = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const lx = (i - nx / 2) * 8, lz = (j - nz / 2) * 10, x = cx + lx * Math.cos(ry) + lz * Math.sin(ry), n = cn - (-lx * Math.sin(ry) + lz * Math.cos(ry));
    if (hAt(x, n) < 0.6) continue; L.push([x, gAt(x, n) - 0.05, -n, ry, 1]);
  }
  const im = instDat(leuGeo(), L, MATV2); im.userData.t0 = t0; return im;
}
// bàn bản đồ (chỉ huy)
function banBanDo(x, n, ry, y = null) {
  const g = new Ghep(); g.hop(2.4, 0.08, 1.4, 0, 0.82, 0, 0x6b4a2c); for (const [a, b] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]]) g.hop(0.08, 0.8, 0.08, a, 0.4, b, 0x4d3420);
  const mesh = g.luoi(); const yy = y == null ? gAt(x, n) : y; mesh.position.set(x, yy, -n); mesh.rotation.y = ry; scene.add(mesh);
  // tờ bản đồ (vẽ canvas)
  const c = document.createElement('canvas'); c.width = 256; c.height = 160; const k = c.getContext('2d');
  k.fillStyle = '#e8dcb8'; k.fillRect(0, 0, 256, 160); k.strokeStyle = '#6a5636'; k.lineWidth = 2;
  k.beginPath(); k.moveTo(10, 40); k.bezierCurveTo(60, 120, 120, 140, 150, 90); k.lineTo(160, 60); k.bezierCurveTo(190, 40, 230, 50, 250, 30); k.stroke();
  k.strokeStyle = '#3d6a8a'; k.lineWidth = 4; k.beginPath(); k.moveTo(152, 92); k.lineTo(160, 160); k.stroke();
  k.fillStyle = '#9b2a1f'; for (const [a, b] of [[140, 110], [120, 128], [170, 120], [100, 120]]) { k.fillRect(a - 4, b - 4, 8, 8); }
  k.strokeStyle = '#9b2a1f'; k.setLineDash([6, 4]); k.beginPath(); k.moveTo(80, 118); k.lineTo(150, 132); k.lineTo(200, 120); k.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.15), new THREE.MeshLambertMaterial({ map: t }));
  p.rotation.x = -Math.PI / 2; p.position.y = 0.87; mesh.add(p);
  // la bàn, ống nhòm
  const la = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), new THREE.MeshLambertMaterial({ color: 0x8a6a2a })); la.position.set(0.75, 0.88, 0.35); mesh.add(la);
  const on = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.45, 8), new THREE.MeshLambertMaterial({ color: 0x3a2a1a })); on.rotation.z = Math.PI / 2; on.position.set(-0.7, 0.89, 0.4); mesh.add(on);
  return mesh;
}

// ---------- Thành Điện Hải V1.2: vết tường, hào theo OSM (water=moat), bố cục trong thành theo ảnh dựng 3D anh gửi ----------
const DH_TUONG = [[9.8, -46.9], [43.3, -43.3], [48.5, -53.8], [69.2, -53.4], [62.8, -34], [50.9, -32.2], [47.3, 0.4], [46.5, 7.4], [42.7, 40.9], [52.5, 43.5], [53.7, 64.1], [34.6, 59.4], [33.2, 48.7], [-39.6, 42.1], [-42.9, 52.0], [-62.4, 51.8], [-57.3, 32.4], [-46.8, 31.6], [-43.0, -2.1], [-38.4, -43.1], [-49.0, -47.3], [-49.1, -66.9], [-29.9, -61.4], [-28.8, -52.3], [2.9, -47.7]];
const DH_HAO = [[60.6, 8.9], [63.9, 63.8], [63.8, 69.7], [61.3, 74], [56.7, 76.1], [51, 75.3], [-5.8, 56.7], [-61.3, 63.7], [-68, 62.6], [-72.3, 59.3], [-73.8, 54], [-72.9, 47.6], [-57.1, -3.8], [-55.7, -8.4], [-55.9, -11.2], [-59.4, -67.2], [-58.9, -72], [-56.4, -76.3], [-52, -77.7], [-46.8, -77.3], [4.4, -61.4], [11.4, -61], [67.7, -63.1], [74, -62.4], [78.1, -59.5], [79.4, -54.2], [78.2, -48.1], [61.4, 1.9]];
function huongTrong(pts) {   // đảo chiều để pháp tuyến trái (dai, w>0) chỉ vào trong
  let cx = 0, cz = 0; for (const p of pts) { cx += p[0]; cz += p[1]; } cx /= pts.length; cz /= pts.length;
  const [a, b] = [pts[0], pts[1]], nx = -(b[1] - a[1]), nz = b[0] - a[0];
  const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
  return (nx * (cx - mx) + nz * (cz - mz)) > 0 ? pts : pts.slice().reverse();
}
// offset vết khép kín (giống cách dai() tính pháp tuyến): w > 0 vào trong
function lechVet(pts, w) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    let d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = c[0] - b[0], d2z = c[1] - b[1];
    const l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1; d1x /= l1; d1z /= l1; d2x /= l2; d2z /= l2;
    let nx = -(d1z + d2z), nz = d1x + d2x; const ln = Math.hypot(nx, nz) || 1; nx /= ln; nz /= ln;
    const cs = Math.max(0.6, nx * -d2z + nz * d2x); out.push([b[0] + nx / cs * w, b[1] + nz / cs * w]);
  }
  return out;
}
// đặt đại bác trên mặt thành, sát mép ngoài: ds = [[chỉ số cạnh, số khẩu]]; vào trong 'vao' m tính từ mép ngoài
function datPhaoTheoTuong(gg, grp, pts, ten, y, vao, ds) {
  const n = pts.length; grp.updateMatrixWorld(true);
  let cx = 0, cz = 0; for (const p of pts) { cx += p[0] / n; cz += p[1] / n; }
  for (const [i, so] of ds) {
    const a = pts[i % n], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 4) continue;
    const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L; let ix = -dz, iz = dx;
    if ((cx - (a[0] + b[0]) / 2) * ix + (cz - (a[1] + b[1]) / 2) * iz < 0) { ix = -ix; iz = -iz; }   // pháp tuyến hướng vào trong
    for (let k = 0; k < so; k++) {
      const u = (k + 1) / (so + 1), x = a[0] + dx * L * u + ix * vao, z = a[1] + dz * L * u + iz * vao;
      const ry = Math.atan2(ix, iz);              // daiBac: nòng về −Z cục bộ → quay sao cho nòng hướng ra ngoài (−pháp tuyến trong)
      daiBac(gg, x, y, z, ry, 1);
      const w = new V3(x, y, z).applyMatrix4(grp.matrixWorld), d = new V3(-ix, 0, -iz).transformDirection(grp.matrixWorld);
      PHAO.push({ ten, pos: w, dir: d });
    }
  }
}
function taoDienHai() {
  const v = VT['dien-hai'], y0 = Math.max(gAt(v.x, v.n), 0.8);
  const grp = new THREE.Group(); grp.position.set(v.x, y0, -v.n); scene.add(grp);
  const g = new Ghep(), gg = new Ghep();   // gg: phần gạch (vân gạch kiểu Thành cổ Quảng Trị)
  PHAO_GRP = grp;
  const tuong = huongTrong(DH_TUONG.map(([x, n]) => [x, -n])), hao = huongTrong(DH_HAO.map(([x, n]) => [x, -n]));
  const GACH = 0xb3a698, GACH2 = 0xbcae9e, MAT = 0x9a9480, VIEN = 0xcfc4b4;
  // mặt nước hào (hình vành: hào ngoài trừ tường)
  const sh = new THREE.Shape(hao.map(([x, z]) => new THREE.Vector2(x, z)));
  sh.holes.push(new THREE.Path(tuong.map(([x, z]) => new THREE.Vector2(x, z))));
  const mg = new THREE.ShapeGeometry(sh); mg.rotateX(Math.PI / 2);
  const nuocHao = new THREE.Mesh(mg, MAT_HAO);
  nuocHao.position.y = 0.18; nuocHao.renderOrder = 2; grp.add(nuocHao);
  // tường thành gạch (mặt ngoài thẳng đứng từ đáy hào), mặt thành lát gạch, gờ chắn mái
  dai(gg, tuong, 0, 7.5, -2.2, 4.6, GACH, true, MAT, 0.3);
  dai(gg, tuong, 1.05, 2.05, 4.52, 5.6, GACH2, true, VIEN, 0.3);   // V1.4: tường chắn mái ngồi trên mặt thành
  // bờ hào ngoài: kè gạch thấp, gờ sáng (như ảnh)
  dai(gg, hao, -2.2, 0, -2.2, 0.55, GACH, true, VIEN);
  dai(gg, hao, -0.6, 0.2, 0.55, 0.75, VIEN, true, VIEN);
  // sân trong: cỏ, đường lát chữ thập, sân lát
  const san = new THREE.Shape(tuong.map(([x, z]) => new THREE.Vector2(x, z)));
  const sg = new THREE.ShapeGeometry(san); sg.rotateX(Math.PI / 2); g.them(sg, M4(0, 0.12, 0), 0x6f9a4a);
  g.hop(5, 0.1, 96, 4, 0.2, 0, 0x8a6e62); g.hop(96, 0.1, 5, -2, 0.2, -3, 0x8a6e62);
  g.hop(34, 0.1, 22, -10, 0.21, 27, 0x9c9a92); g.hop(24, 0.1, 22, 25, 0.21, 22, 0x9c9a92);
  g.hop(70, 0.1, 3.5, 0, 0.2, -38, 0x8a6e62); g.hop(3.5, 0.1, 70, -36, 0.2, 0, 0x8a6e62); g.hop(3.5, 0.1, 70, 39, 0.2, 0, 0x8a6e62); g.hop(70, 0.1, 3.5, 0, 0.2, 36, 0x8a6e62);
  // nhà trong thành (mái ngói đỏ cam)
  const NGOI = 0xb24a26, TUONGNHA = 0xe2d6bc;
  nhaNgoi(g, 30, 10, 3.8, -2, 0.2, 30, 0, TUONGNHA, NGOI);          // nhà dài phía Nam
  nhaNgoi(g, 11, 8, 3.4, -24, 0.2, -24, 0, TUONGNHA, NGOI);          // nhà nhỏ Tây Bắc
  nhaNgoi(g, 22, 8, 3.4, 30, 0.2, 2, Math.PI / 2, TUONGNHA, NGOI);    // nhà dài phía Đông
  g.hop(4, 2.6, 4, 30, 1.3, 30, 0xb49a7a); g.maiChop(4, 4, 2, 30, 2.6, 30, NGOI, 0, 0.7);   // nhà nghỉ nhỏ góc Đông Nam
  // kỳ đài cạnh cổng Tây
  gg.hop(13, 3, 11, -30, 1.5, -16, GACH); gg.hop(13.4, 0.3, 11.4, -30, 3.1, -16, VIEN); gg.hop(3, 1.5, 4, -23, 0.75, -16, GACH2);
  // cổng: Nam, Đông (theo chỗ hở của hào OSM), Tây (theo ảnh) — vòm gạch + cầu qua hào
  const cong = (x, z, ry, cau) => {
    gg.hop(8, 6.4, 8.5, x, 3.2, z, GACH2, ry); g.hop(3.2, 3.6, 9, x, 1.8, z, 0x2a1d16, ry);
    gg.hop(8.6, 0.5, 9, x, 6.6, z, VIEN, ry);
    const c = M4(x, 0, z, ry); const b = new Ghep(); b.hop(4.2, 0.6, cau, 0, 0.25, cau / 2 + 4, 0xb8a48c); b.hop(0.3, 0.9, cau, -2.2, 0.85, cau / 2 + 4, VIEN); b.hop(0.3, 0.9, cau, 2.2, 0.85, cau / 2 + 4, VIEN);
    const bg = b.geo(); bg.applyMatrix4(c); g.them(bg, new THREE.Matrix4(), 0xb8a48c);
  };
  cong(6.4, 47.3, 0, 15); cong(47, -4, Math.PI / 2, 15); cong(-43, 6, -Math.PI / 2, 14);
  // lầu cổng Bắc (lầu hai tầng mái, như ảnh)
  gg.hop(12, 5.6, 9, -12, 2.8, -45.4, GACH2); g.hop(3.4, 3.6, 9.4, -12, 1.8, -45.4, 0x2a1d16);
  g.hop(10, 2.6, 7, -12, 7.0, -45.4, 0xc4a27a); g.maiChop(10.5, 7.5, 2.2, -12, 8.3, -45.4, NGOI, 0, 1.3); g.maiChop(7.5, 5, 2.2, -12, 10.3, -45.4, NGOI, 0, 1.0);
  // cây trong sân
  const R = rng(1802);
  for (let k = 0; k < 26; k++) {
    const x = (R() - 0.5) * 80, z = (R() - 0.5) * 80; if (Math.abs(x - 4) < 5 || Math.abs(z + 3) < 5) continue;
    if (Math.abs(x + 2) < 18 && Math.abs(z - 30) < 8) continue; if (Math.abs(x - 30) < 7 && Math.abs(z - 2) < 14) continue; if (Math.abs(x + 30) < 9 && Math.abs(z + 16) < 8) continue;
    const s = 0.8 + R() * 0.5; g.tru(0.2 * s, 0.3 * s, 3 * s, x, 1.5 * s, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(2.8 * s, 1), M4(x, 4.6 * s, z), R() < 0.5 ? 0x3f6e33 : 0x4c7e3a);
  }
  // đại bác: trên 4 góc lăng và mặt Bắc, Tây (hướng ra vịnh, sông)
  // đại bác (V1.3): đặt sát mép tường, nòng chĩa ra ngoài qua gờ chắn mái
  datPhaoTheoTuong(gg, grp, DH_TUONG.map(([x, n]) => [x, -n]), 'dien-hai', 4.6, 3.0, [[0, 1], [2, 1], [3, 1], [5, 1], [7, 1], [9, 1], [10, 1], [12, 2], [14, 1], [15, 1], [17, 1], [18, 1], [20, 1], [21, 1], [23, 1]]);
  const mesh = g.luoi(); grp.add(mesh); grp.add(gg.luoi(MAT_GACH)); PHAO_GRP = null;
  const co = taoCo('nguyen', 16, 2.4); co.position.set(-30, 3.2, -16); grp.add(co); COT_CO['dien-hai'] = co;
  CONG['dien-hai'] = grp; return grp;
}
// ---------- người: V1.3 dùng nhân vật có xương nướng sẵn (04x_xnv.js) ----------
const ANIM = { dung: 0, di: 1, chay: 2, ngam: 3, dao: 4, cheo: 5, chet: 6, khieng: 7, chihuy: 8, napphao: 9, ngoi: 10, cang: 11, vaychao: 12, ban: 13, quy: 14, vac: 15, keo: 16, day: 17, dam: 18, sungngan: 19 };
const CLIPN = Object.keys(ANIM).sort((a, b) => ANIM[a] - ANIM[b]);
const b64 = (s, T) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); };
const hex = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const nguoiU = { uT: { value: 0 } };
// phe → mẫu nhân vật, binh khí, nhuộm màu (MINH HOẠ – quân phục theo ảnh mẫu anh gửi)
const PHE = {
  nguyen:   { kind: 'nguyen', vk: 'dieuthuong', tint: [[1, 1, 1], [0.94, 0.92, 0.9], [1, 0.97, 0.93]] },
  phaothu:  { kind: 'nguyen', vk: null, tint: [[1, 1, 1], [0.93, 0.9, 0.88]] },
  danbinh:  { kind: 'danbinh', vk: 'giao', tint: [[1, 1, 1], [0.9, 0.88, 0.84], [0.96, 0.92, 0.86]] },
  dan:      { kind: ['dannam', 'dannu'], vk: null, tint: [[1, 1, 1], [0.92, 0.9, 0.86], [0.85, 0.82, 0.78], [1, 0.96, 0.9]] },
  phap:     { kind: 'phap', vk: 'sungtruong', tint: [[1, 1, 1], [0.95, 0.95, 0.98]] },
  phapxanh: { kind: 'phap', vk: 'sungngan', tint: [[0.72, 0.74, 0.82]] },
  tbn:      { kind: 'phap', vk: 'sungtruong', tint: [[1.05, 1.0, 0.82], [1.0, 0.96, 0.8]] },
  thuy:     { kind: 'phap', vk: null, tint: [[0.86, 0.95, 1.12], [0.9, 0.98, 1.1]] },
};
const VK_CU = { khong: null, sung: undefined, giao: 'giao', guom: 'guom', xeng: 'xeng', bo: 'bo', co: 'giao' };
// ---------- V1.3: nhân vật có xương nướng sẵn thành chuỗi khung hình (nv/x_<tên>.json) ----------
// Mỗi động tác = chuỗi khung; mỗi khung là một InstancedMesh (theo cách của sa bàn Bạch Đằng).
// Khung bàn tay phải (mg) và khung hai tay (mt) theo từng khung hình để gắn súng, gươm, mái chèo.
const XNV = {};
const XIMS = [];
async function napXNV(ten, cap) {
  const d = await (await fetch(URLG('nv/x_' + ten + '.json'))).json();
  const tex = new THREE.Texture(await loadImg('nv/' + d.tex)); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const vids = b64(d.vids, Uint16Array), idx = d.idx32 ? b64(d.idx, Uint32Array) : b64(d.idx, Uint16Array), uv = b64(d.uv, Float32Array);
  const nE = vids.length, nv = d.nv, q = d.q;
  const index = new THREE.BufferAttribute(idx, 1), uvA = new THREE.BufferAttribute(uv, 2);
  const wi = new Uint32Array(idx.length); for (let i = 0; i < idx.length; i++) wi[i] = vids[idx[i]];
  const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, emissiveMap: tex, emissive: 0x3a3a3a });   // tự sáng nhẹ để không tối đen khi ngược sáng
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3);
  const clips = {};
  for (const [name, c] of Object.entries(d.clips)) {
    const frames = c.pos.map((pb) => {
      const qa = b64(pb, Int16Array); for (let i = 0; i < qa.length; i++) P[i] = qa[i] * q;
      N.fill(0);
      for (let t = 0; t < wi.length; t += 3) {        // pháp tuyến trên lưới đã hàn (không lộ đường may uv)
        const a = wi[t] * 3, b = wi[t + 1] * 3, cc = wi[t + 2] * 3;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[cc] - P[a], vy = P[cc + 1] - P[a + 1], vz = P[cc + 2] - P[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        N[a] += nx; N[a + 1] += ny; N[a + 2] += nz; N[b] += nx; N[b + 1] += ny; N[b + 2] += nz; N[cc] += nx; N[cc + 1] += ny; N[cc + 2] += nz;
      }
      const pos = new Float32Array(nE * 3), nor = new Int8Array(nE * 3);
      for (let i = 0; i < nE; i++) {
        const s = vids[i] * 3; pos[i * 3] = P[s]; pos[i * 3 + 1] = P[s + 1]; pos[i * 3 + 2] = P[s + 2];
        const l = Math.hypot(N[s], N[s + 1], N[s + 2]) || 1; nor[i * 3] = N[s] / l * 127; nor[i * 3 + 1] = N[s + 1] / l * 127; nor[i * 3 + 2] = N[s + 2] / l * 127;
      }
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uvA);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, true));
      g.boundingSphere = new THREE.Sphere(new V3(0, 1, 0), 3); return g;
    });
    clips[name] = { fps: c.fps, once: !!c.once, frames, mg: Float32Array.from(c.mg), mt: Float32Array.from(c.mt), ims: [] };
  }
  XNV[ten] = { clips, mat, cap: cap || 400, h: d.h };
}
function xIM(K, C, f) {
  let im = C.ims[f];
  if (!im) {
    im = new THREE.InstancedMesh(C.frames[f], K.mat, K.cap); im.frustumCulled = false; im.count = 0; im.visible = false;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(im); C.ims[f] = im; XIMS.push(im);
  }
  return im;
}
function xFrame(C, t, ph, tSeg) {
  const n = C.frames.length; if (n === 1) return 0;
  if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg) * C.fps));
  return mod(Math.floor(t * C.fps + ph * n), n);
}
// --- binh khí, đồ cầm tay (toạ độ: +Y về phía mũi/đầu, gốc ở nắm tay) ---
const GO = 0x5c3a22, GO2 = 0x7a5232, SAT = 0x2d2f33, DONG = 0xb08a3e, SATG = 0x6e6458;
const XWGEO = {};
function dungBinhKhi() {
  let g;
  // súng trường Pháp (ảnh 1: nòng bát giác sẫm, báng gỗ, đai đồng) — báng về −Y, nòng về +Y
  g = new Ghep();
  g.hop(0.03, 0.98, 0.03, 0, 0.5, 0, SAT); g.tru(0.007, 0.007, 0.06, 0, 1.0, -0.018, SAT, 5);
  g.hop(0.045, 0.62, 0.05, 0, 0.18, 0.025, GO2); g.hop(0.045, 0.36, 0.1, 0, -0.2, 0.075, GO2, 0, -0.2);   // báng trễ xuống (bụng súng quay xuống đất)
  g.hop(0.05, 0.03, 0.12, 0, -0.38, 0.11, DONG, 0, -0.2);
  for (const y of [0.42, 0.72]) g.hop(0.05, 0.022, 0.055, 0, y, 0.012, DONG);
  g.hop(0.012, 0.09, 0.03, 0, 0.02, 0.07, DONG); g.hop(0.02, 0.04, 0.03, 0, 0.06, -0.03, SAT);
  XWGEO.sungtruong = g.geo();
  // điểu thương nhà Nguyễn (ảnh 3: súng dài, nòng xỉn, báng cong gỗ sẫm)
  g = new Ghep();
  g.hop(0.032, 1.12, 0.032, 0, 0.56, 0, SATG); g.hop(0.05, 0.78, 0.045, 0, 0.22, 0.026, GO);
  g.hop(0.05, 0.38, 0.11, 0, -0.22, 0.085, GO, 0, -0.28); g.hop(0.014, 0.1, 0.035, 0, 0.02, 0.07, SATG);   // báng cong trễ xuống
  for (const y of [0.35, 0.6, 0.9]) g.hop(0.05, 0.02, 0.055, 0, y, 0.012, SATG);
  g.hop(0.03, 0.06, 0.04, 0, 0.08, -0.035, SATG);
  XWGEO.dieuthuong = g.geo();
  // súng ngắn ổ quay (ảnh 2): báng theo ±Y qua nắm tay, nòng về −X (hướng ngón tay trỏ)
  g = new Ghep();
  g.hop(0.03, 0.11, 0.035, 0, -0.01, 0, 0x2a2420); g.tru(0.024, 0.024, 0.05, -0.035, 0.07, 0, SAT, 8, 0, 0, Math.PI / 2);
  g.tru(0.009, 0.009, 0.15, -0.13, 0.08, 0, SAT, 6, 0, 0, Math.PI / 2); g.hop(0.04, 0.03, 0.03, 0.005, 0.07, 0, SAT);
  XWGEO.sungngan = g.geo();
  g = new Ghep(); g.tru(0.016, 0.016, 0.22, 0, -0.04, 0, 0x2a1d16, 5); g.hop(0.12, 0.025, 0.04, 0, 0.08, 0, DONG); g.hop(0.04, 0.78, 0.008, 0, 0.48, 0, 0xb8b8bc);
  XWGEO.guom = g.geo();
  g = new Ghep(); g.tru(0.017, 0.017, 2.5, 0, 0.55, 0, GO2, 5); g.them(new THREE.ConeGeometry(0.035, 0.28, 5), M4(0, 1.92, 0), 0x9a9a9e); g.hop(0.07, 0.1, 0.07, 0, 1.73, 0, 0x8a2018);
  XWGEO.giao = g.geo();
  g = new Ghep(); g.tru(0.018, 0.018, 1.2, 0, 0.1, 0, GO2, 5); g.hop(0.2, 0.26, 0.02, 0, -0.62, 0.02, 0x6a6a6a);
  XWGEO.xeng = g.geo();
  g = new Ghep(); g.tru(0.02, 0.022, 0.8, 0, 0.26, 0, GO2, 5); g.hop(0.18, 0.13, 0.025, 0.08, 0.6, 0, 0x7a7a7e);
  XWGEO.riu = g.geo();
  g = new Ghep(); g.tru(0.018, 0.02, 0.6, 0, 0.18, 0, GO2, 5); g.hop(0.18, 0.09, 0.09, 0, 0.47, 0, 0x3a3028);
  XWGEO.bua = g.geo();
  g = new Ghep(); g.tru(0.022, 0.022, 1.6, 0, -0.25, 0, GO2, 5); g.hop(0.15, 0.48, 0.025, 0, -1.2, 0, GO2);
  XWGEO.cheo = g.geo();
  g = new Ghep(); for (let k = 0; k < 5; k++) g.tru(0.035, 0.035, 3.2, (k % 3 - 1) * 0.06, 0.6, (k > 2 ? 0.06 : -0.02), k % 2 ? 0x8ea24e : 0x9caf58, 5);
  XWGEO.bo = g.geo();
  for (const k in XWGEO) XWGEO[k].computeBoundingSphere();
}
const XW = {};
const XWMAT = new THREE.MeshLambertMaterial({ vertexColors: true });
function xwIM(k) {
  if (!XW[k]) { const im = new THREE.InstancedMesh(XWGEO[k], XWMAT, k === 'bo' ? 200 : 1600); im.frustumCulled = false; im.count = 0; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); XW[k] = im; }
  return XW[k];
}
// động tác nào thì cầm súng bằng hai tay (theo đường nối hai bàn tay)
const HAI_TAY = { dung: 1, di: 1, ngam: 1, ban: 1, quy: 1, napphao: 1 };
const KHONG_CAM = { chet: 1, cang: 1, ngoi: 1, vac: 1, khieng: 1, keo: 1, day: 1, vaychao: 1 };
const _xm = new THREE.Matrix4(), _xb = new THREE.Matrix4(), _xq = new THREE.Quaternion(), _xs = new V3(), _xp = new V3(), _xe = new THREE.Euler();
const _gx = new V3(), _gy = new V3(), _gz = new V3(), _xc = new THREE.Color();
function xGrip(A, f) {
  const o = f * 9;
  _gy.set(A[o], A[o + 1], A[o + 2]).normalize(); _gz.set(A[o + 3], A[o + 4], A[o + 5]);
  _gz.addScaledVector(_gy, -_gz.dot(_gy)).normalize(); _gx.crossVectors(_gy, _gz);
  return _xb.makeBasis(_gx, _gy, _gz).setPosition(A[o + 6], A[o + 7], A[o + 8]);
}
const XMUZ = new V3();   // đầu nòng của người vừa vẽ (toạ độ thế giới) — để đặt chớp lửa
// vẽ một người: kiểu, động tác, giây động tác, pha, vị trí, hướng (rad), tỉ lệ, màu nhuộm [r,g,b], binh khí, giây trong đoạn (động tác một lần)
function xPut(ten, clip, t, ph, x, y, z, yaw, sc, tint, vk, tSeg = 0, nghieng = 0) {
  const K = XNV[ten]; if (!K) return false;
  const C = K.clips[clip] || K.clips.dung; const f = xFrame(C, t, ph, tSeg); const im = xIM(K, C, f);
  if (im.count >= K.cap) return false;
  _xe.set(nghieng, yaw, 0, 'YXZ'); _xq.setFromEuler(_xe); _xs.set(sc, sc, sc);
  _xm.compose(_xp.set(x, y, z), _xq, _xs);
  im.setMatrixAt(im.count, _xm); im.setColorAt(im.count, _xc.setRGB(tint[0], tint[1], tint[2])); im.count++;
  if (vk && !KHONG_CAM[clip] && XWGEO[vk]) {
    const cl = K.clips[clip] ? clip : 'dung';
    const sung = vk === 'sungtruong' || vk === 'dieuthuong';
    const W2 = _xb; xGrip(sung && HAI_TAY[cl] ? C.mt : C.mg, f);
    const wim = xwIM(vk);
    if (wim.count < wim.instanceMatrix.count) { const M = W2.premultiply(_xm); wim.setMatrixAt(wim.count++, M); if (sung) XMUZ.set(0, 1.05, 0).applyMatrix4(M); }
  }
  return true;
}
function xBegin() { for (const im of XIMS) im.count = 0; for (const k in XW) XW[k].count = 0; }
function xEnd() {
  for (const im of XIMS) { im.visible = im.count > 0; if (im.count) { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; } }
  for (const k in XW) XW[k].instanceMatrix.needsUpdate = true;
}
const _hY = new V3(0, 1, 0);
// vị trí bàn tay phải (thế giới) của người vẽ bằng xPut cùng tham số
function xHand(ten, clip, t, ph, x, y, z, yaw, sc = 1, trai = false) {
  const K = XNV[ten]; if (!K) return new V3(x, y + 1.4, z);
  const C = K.clips[clip] || K.clips.dung, f = xFrame(C, t, ph, 0), o = f * 9;
  let hx = C.mg[o + 6], hy = C.mg[o + 7], hz = C.mg[o + 8];
  if (trai) { const A = C.mt; hx = A[o + 6]; hy = A[o + 7]; hz = A[o + 8]; }
  return new V3(hx, hy, hz).multiplyScalar(sc).applyAxisAngle(_hY, yaw).add(new V3(x, y, z));
}
// tốc độ bàn chân trụ (m/s) đo từ khung nướng — nhịp bước khớp quãng đi
const VNAT = {"phap": {"di": 0.99, "chay": 4.66, "khieng": 0.54, "vac": 1.24}, "nguyen": {"di": 0.93, "chay": 4.4, "khieng": 0.88, "vac": 1.16}, "dannam": {"di": 1.23, "chay": 4.56, "khieng": 0.95, "vac": 1.23}, "dannu": {"di": 0.99, "chay": 4.29, "khieng": 0.88, "vac": 1.09}, "khachnam": {"di": 1.33}, "khachnu": {"di": 1.07}, "aodai": {"di": 0.93}, "danbinh": {"di": 1.32, "chay": 4.62, "khieng": 0.99, "vac": 1.32}, "ntp": {"di": 0.76}};
VNAT.ngua_chay = 6.2;
// ---------- chiến hạm hơi nước – buồm (giữa thế kỷ XIX) · mũi tàu hướng −z cục bộ ----------
function thanTau(L, B, D, F, mauThan = 0x1d1d20, mauSoc = 0xe8e2d0, soCua = 10, soc = true) {
  // L dài, B rộng, D mớn nước, F mạn khô
  const seg = 24, ring = 10, P = [], C = [], cT = new THREE.Color(mauThan), cS = new THREE.Color(mauSoc), cD = new THREE.Color(0x6a2a20);
  const wz = (u) => { const a = u < 0.25 ? Math.sin(u / 0.25 * Math.PI / 2) ** 0.8 : u > 0.85 ? 0.55 + 0.45 * Math.cos((u - 0.85) / 0.15 * Math.PI / 2) : 1; return a; };
  const sect = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, z = -L / 2 + u * L, w = B / 2 * wz(u), pts = [];
    for (let k = 0; k <= ring; k++) {
      const a = k / ring * Math.PI; // 0 = mạn phải trên, PI = mạn trái trên
      const s = Math.sin(a), c = Math.cos(a);
      const x = c * w, y = F - (F + D) * Math.pow(s, 0.6) * (u < 0.06 ? u / 0.06 : 1);
      pts.push([x, k === 0 || k === ring ? F + (u < 0.1 ? (0.1 - u) * 8 : 0) : y, z]);
    }
    sect.push(pts);
  }
  const col = (y) => y < -D * 0.3 ? cD : (soc && y > F * 0.45 && y < F * 0.75) ? cS : cT;
  for (let i = 0; i < seg; i++) for (let k = 0; k < ring; k++) {
    const a = sect[i][k], b = sect[i + 1][k], c = sect[i + 1][k + 1], d = sect[i][k + 1];
    P.push(...a, ...b, ...c, ...a, ...c, ...d); for (const q of [a, b, c, a, c, d]) { const cc = col(q[1]); C.push(cc.r, cc.g, cc.b); }
  }
  // đuôi phẳng
  const last = sect[seg]; for (let k = 0; k < ring; k++) { const a = last[k], b = last[k + 1]; P.push(...a, ...b, 0, F, L / 2); for (const q of [a, b, [0, F, 0]]) { const cc = col(q[1]); C.push(cc.r, cc.g, cc.b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  const G = new Ghep(); G.them(g, new THREE.Matrix4(), mauThan);
  // boong
  const dk = []; for (let i = 0; i <= seg; i++) { const u = i / seg; dk.push([B / 2 * wz(u) * 0.97, -L / 2 + u * L]); }
  for (let i = 0; i < seg; i++) quad2(G, [-dk[i][0], F - 0.3, dk[i][1]], [dk[i][0], F - 0.3, dk[i][1]], [dk[i + 1][0], F - 0.3, dk[i + 1][1]], [-dk[i + 1][0], F - 0.3, dk[i + 1][1]], 0x9a8466);
  // cửa pháo
  const cua = [];
  for (let k = 0; k < soCua; k++) {
    const z = -L * 0.3 + k * (L * 0.6 / (soCua - 1));
    for (const sx of [-1, 1]) { const x = sx * B / 2 * 1.005; G.hop(0.12, 0.6, 0.7, x, F * 0.6, z, 0x121212); cua.push([x, F * 0.6, z, sx]); }
  }
  return { G, cua };
}
let MAU_TAU = null;
async function napTau() {
  const d = await (await fetch(URLG('nv/tau-phap.json'))).json();
  const tex = new THREE.Texture(await loadImg('nv/tau-phap.jpg')); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(b64(d.pos, Float32Array), 3)); g.setAttribute('uv', new THREE.BufferAttribute(b64(d.uv, Float32Array), 2));
  g.setIndex(new THREE.BufferAttribute(d.i32 ? b64(d.idx, Uint32Array) : b64(d.idx, Uint16Array), 1)); g.computeVertexNormals();
  MAU_TAU = { d, g, mat: new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }) };
}
function taoTauMau(o) {
  const k = o.L / MAU_TAU.d.dai, F = 1.45 * k, B = MAU_TAU.d.rong * k * 2, L = o.L;   // V1.3: mặt boong đo lại theo mặt phẳng ngang của mẫu (y = 1,45)
  const grp = new THREE.Group(); const m = new THREE.Mesh(MAU_TAU.g, MAU_TAU.mat); m.scale.setScalar(k); grp.add(m);
  const cua = []; const n = o.soCua || 8;
  for (let i = 0; i < n; i++) { const z = -L * 0.3 + i * (L * 0.6 / (n - 1)); for (const sx of [-1, 1]) cua.push([sx * B / 2 * 1.02, F * 0.55, z, sx]); }
  const co = taoCo(o.coKieu || 'phap', 4, 2.2); co.position.set(0, F + 1, L / 2 - 1); co.rotation.y = Math.PI / 2; grp.add(co);
  if (o.ban) { const b = banBanDo(0, 0, 0, 0); scene.remove(b); b.position.set(0.8, F, -14); grp.add(b); }
  const rong = new THREE.Object3D(); grp.add(rong);
  grp.userData = { L, B, F, cua, buom: rong, cuon: rong, ongZ: -L * 0.08, ongY: 11 * k, ten: o.ten, ong: 1 };
  scene.add(grp); return grp;
}
function taoTau(o) {
  if (MAU_TAU) return taoTauMau(o);
  // o: {L, B, cot (số cột), ong (ống khói), banhGuong, kieu, coKieu}
  const { L, B } = o, D = o.D || 3.6, F = o.F || 3.2;
  const { G, cua } = thanTau(L, B, D, F, o.mauThan, o.mauSoc, o.soCua || Math.round(L / 6), o.soc !== false);
  // cột buồm, xà, buồm cuộn
  const cotZ = o.cot === 3 ? [-L * 0.28, -L * 0.02, L * 0.25] : o.cot === 2 ? [-L * 0.2, L * 0.15] : [0];
  const H = o.caoCot || L * 0.62;
  const buom = new Ghep(), buomCuon = new Ghep();
  cotZ.forEach((z, i) => {
    const h = H * (i === 1 || cotZ.length === 1 ? 1 : 0.88);
    G.tru(0.25, 0.42, h, 0, F + h / 2, z, 0x4a3828, 6);
    for (let k = 0; k < 3; k++) {
      const y = F + h * (0.42 + k * 0.2), w = B * (1.6 - k * 0.35);
      G.tru(0.12, 0.12, w, 0, y, z, 0x3a2a1c, 5, 0, 0, Math.PI / 2);
      buomCuon.tru(0.35, 0.35, w * 0.9, 0, y + 0.25, z, 0xd8d0b8, 6, 0, 0, Math.PI / 2);
      // buồm căng: tấm cong
      const sh = h * 0.19, g = new THREE.PlaneGeometry(w * 0.92, sh, 6, 3), p = g.attributes.position;
      for (let v = 0; v < p.count; v++) { const xx = p.getX(v) / (w * 0.46); p.setZ(v, -(1 - xx * xx) * sh * 0.18); }
      buom.them(g, M4(0, y - sh / 2, z - 0.3), 0xe8e0c8);
    }
    // dây chằng (đơn giản)
    G.them(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(h, B), 3), M4(B * 0.45, F + h * 0.5, z + 1, 0, 0, Math.atan2(B * 0.9, h)), 0x2a2018);
    G.them(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(h, B), 3), M4(-B * 0.45, F + h * 0.5, z + 1, 0, 0, -Math.atan2(B * 0.9, h)), 0x2a2018);
  });
  // cần mũi
  G.tru(0.15, 0.3, L * 0.22, 0, F + 1.4, -L / 2 - L * 0.08, 0x4a3828, 5, 0, -1.25);
  // ống khói, hộp bánh guồng
  if (o.ong) { G.tru(1.1, 1.1, 7, 0, F + 3.5, cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : L * 0.1, 0x1a1a1a, 12); }
  if (o.banhGuong) for (const sx of [-1, 1]) { G.them(new THREE.CylinderGeometry(3.2, 3.2, 2.2, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), M4(sx * (B / 2 + 1.1), F - 0.6, cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : 0, Math.PI / 2), 0x1d1d20); }
  // lan can đuôi, buồng lái
  G.hop(B * 0.6, 1.4, 4, 0, F + 0.4, L * 0.42, 0x6a5038);
  for (const c of cua) daiBac(G, c[0] - c[3] * 1.6, F - 0.3, c[2], c[3] > 0 ? -Math.PI / 2 : Math.PI / 2, 0.8, 0x4a3a2a);
  const grp = new THREE.Group();
  const than = G.luoi(); grp.add(than);
  const mB = buom.luoi(MATV2); grp.add(mB); const mC = buomCuon.luoi(); grp.add(mC);
  const co = taoCo(o.coKieu || 'phap', 4, 2.2); co.position.set(0, F + 1, L / 2 + 0.5); co.rotation.y = Math.PI / 2; grp.add(co);
  const co2 = taoCo(o.coKieu || 'phap', 2.5, 1.2); co2.position.set(0, F + H * 0.95, cotZ[cotZ.length > 1 ? 1 : 0]); grp.add(co2);
  grp.userData = { L, B, F, cua, buom: mB, cuon: mC, ongZ: o.ong ? (cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : L * 0.1) : null, ten: o.ten, ong: o.ong };
  if (o.ban) { const b = banBanDo(0, 0, 0, 0); scene.remove(b); b.position.set(0.8, F - 0.3, -14); b.rotation.y = 0; grp.add(b); }
  scene.add(grp); return grp;
}
// thuyền đổ bộ (xuồng chèo) · thuyền đánh cá có buồm
function xuongGeo(L = 9, mau = 0x5b4632) { const { G } = thanTau(L, 2.3, 0.5, 0.6, mau, mau, 0, false); for (let k = 0; k < 4; k++) G.hop(2.1, 0.08, 0.3, 0, 0.35, -L * 0.3 + k * L * 0.2, 0x7a6448); return G.geo(); }
function thuyenChaiGeo() {
  const { G } = thanTau(8, 2.0, 0.6, 0.7, 0x4b3a2a, 0x4b3a2a, 0, false);
  G.tru(0.07, 0.09, 5.5, 0, 3.2, -1, 0x3a2a1c, 5);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 1.2, -2.6, 0, 5.6, -0.9, 0, 1.2, 1.6], 3));
  G.them(g, new THREE.Matrix4(), 0x8a5a3a);
  return G.geo();
}
// ngựa đơn giản (người đưa tin) – chân đong đưa bằng CPU
function taoNgua() {
  const grp = new THREE.Group(), mt = new THREE.MeshLambertMaterial({ color: 0x5a3b26 }), mt2 = new THREE.MeshLambertMaterial({ color: 0x2a1c14 });
  const than = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 1.8), mt); than.position.y = 1.35; grp.add(than);
  const co = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.4), mt); co.position.set(0, 1.85, -0.95); co.rotation.x = 0.6; grp.add(co);
  const dau = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.7), mt); dau.position.set(0, 2.15, -1.35); dau.rotation.x = 0.3; grp.add(dau);
  const bom = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.12), mt2); bom.position.set(0, 1.4, 0.95); bom.rotation.x = -0.5; grp.add(bom);
  const chan = [];
  for (const [x, z] of [[-0.2, -0.7], [0.2, -0.7], [-0.2, 0.7], [0.2, 0.7]]) {
    const piv = new THREE.Group(); piv.position.set(x, 1.15, z); const c = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.1, 0.14), mt); c.position.y = -0.55; piv.add(c); grp.add(piv); chan.push(piv);
  }
  grp.userData.chan = chan; scene.add(grp); return grp;
}
// ---------- hiệu ứng: khói thuốc súng đen, chớp lửa, nổ, cháy, khói ống ----------
function texTron(soft = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45 * soft, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
}
class HatBui {
  constructor(N, cong) {
    this.N = N; this.P = []; this.free = [];
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(N * 3); this.siz = new Float32Array(N); this.col = new Float32Array(N * 4);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.siz, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('col', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    this.u = { map: { value: texTron() }, scale: { value: 800 }, fogC: { value: new THREE.Color() }, fogN: { value: 1 }, fogF: { value: 2 }, light: { value: 1 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false, blending: cong ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute float size; attribute vec4 col; uniform float scale; varying vec4 vc; varying float vd;
        void main(){ vc=col; vec4 mv=modelViewMatrix*vec4(position,1.); vd=-mv.z; gl_PointSize=min(size*scale/max(-mv.z,1.),900.); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 fogC; uniform float fogN,fogF,light; varying vec4 vc; varying float vd;
        void main(){ vec4 t=texture2D(map,gl_PointCoord); vec3 c=vc.rgb*${cong ? '1.' : 'light'}; float f=smoothstep(fogN,fogF,vd); c=mix(c,fogC,f${cong ? '*0.' : ''}); gl_FragColor=vec4(c,t.a*vc.a*(1.-f*${cong ? '1.' : '.3'})); }`
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = cong ? 5 : 4; scene.add(this.pts);
    this.n = 0;
  }
  them(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, age = 0, drag = 0.6, lift = 0) {
    if (this.P.length >= this.N) this.P.shift();
    this.P.push({ x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, age, drag, lift });
  }
  xoa() { this.P.length = 0; }
  capNhat(dt, gio) {
    const P = this.P; let w = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i]; p.age += dt; if (p.age >= p.life) continue;
      const k = Math.exp(-p.drag * dt); p.vx = p.vx * k + gio.x * (1 - k); p.vz = p.vz * k + gio.z * (1 - k); p.vy = p.vy * k + p.lift * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; P[w++] = p;
    }
    P.length = w;
    for (let i = 0; i < w; i++) {
      const p = P[i], u = p.age / p.life;
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.siz[i] = p.s0 + (p.s1 - p.s0) * Math.sqrt(u);
      this.col[i * 4] = p.r; this.col[i * 4 + 1] = p.g; this.col[i * 4 + 2] = p.b; this.col[i * 4 + 3] = p.a * Math.min(1, u * 8) * (1 - u) ** 1.3;
    }
    const g = this.pts.geometry; g.setDrawRange(0, w);
    g.attributes.position.needsUpdate = g.attributes.size.needsUpdate = g.attributes.col.needsUpdate = true;
  }
}
const KHOI = new HatBui(9000, false), LUA = new HatBui(2500, true);
const GIO = new V3(2.2, 0, -0.8);
const R_FX = rng(99);
function khoiSung(p, d, to = 1, age = 0) {
  LUA.them(p.x + d.x * 1.5, p.y + 0.3, p.z + d.z * 1.5, 0, 0, 0, 0.22, 4 * to, 9 * to, 1, 0.75, 0.35, 1, age);
  for (let k = 0; k < 9; k++) {
    const s = 3 + R_FX() * 9;
    KHOI.them(p.x + d.x * 2, p.y + 0.5, p.z + d.z * 2, d.x * s + (R_FX() - 0.5) * 2, 0.6 + R_FX() * 0.8, d.z * s + (R_FX() - 0.5) * 2, 9 + R_FX() * 7, 3 * to, (18 + R_FX() * 14) * to, 0.93, 0.92, 0.9, 0.75, age, 0.9, 0.2);
  }
}
function no(p, to = 1, age = 0, dat = true) {
  LUA.them(p.x, p.y + 2 * to, p.z, 0, 0, 0, 0.35, 10 * to, 26 * to, 1, 0.6, 0.25, 1, age);
  for (let k = 0; k < 14; k++) {
    const a = R_FX() * 6.28, s = 4 + R_FX() * 10;
    if (dat) KHOI.them(p.x, p.y + 1, p.z, Math.cos(a) * s * 0.5, 8 + R_FX() * 14, Math.sin(a) * s * 0.5, 2.5 + R_FX() * 2, 2 * to, 9 * to, 0.42, 0.33, 0.24, 0.9, age, 1.6, -9);
    KHOI.them(p.x, p.y + 2, p.z, Math.cos(a) * s * 0.4, 2 + R_FX() * 3, Math.sin(a) * s * 0.4, 10 + R_FX() * 8, 5 * to, (24 + R_FX() * 16) * to, 0.3, 0.29, 0.28, 0.65, age, 0.8, 0.4);
  }
}
function toeNuoc(p, to = 1, age = 0) {
  for (let k = 0; k < 12; k++) { const a = R_FX() * 6.28, s = R_FX() * 3; KHOI.them(p.x, 0.5, p.z, Math.cos(a) * s, 10 + R_FX() * 12, Math.sin(a) * s, 2 + R_FX(), 2 * to, 7 * to, 0.9, 0.95, 0.97, 0.85, age, 1.4, -10); }
}
// điểm cháy (liên tục)
const CHAY = [];   // {p, t0, t1, to}
function chayCapNhat(t, dt) {
  for (const c of CHAY) {
    if (t < c.t0 || t > c.t1) continue;
    const n = dt * 14 * c.to; let k = Math.floor(n) + (R_FX() < n % 1 ? 1 : 0);
    while (k--) {
      LUA.them(c.p.x + (R_FX() - 0.5) * 6 * c.to, c.p.y + R_FX() * 2, c.p.z + (R_FX() - 0.5) * 6 * c.to, 0, 2 + R_FX() * 2, 0, 0.8 + R_FX() * 0.5, 3 * c.to, 1 * c.to, 1, 0.45 + R_FX() * 0.2, 0.12, 0.9);
      if (R_FX() < 0.5) KHOI.them(c.p.x, c.p.y + 3, c.p.z, 0, 3 + R_FX() * 2, 0, 12, 5 * c.to, 30 * c.to, 0.18, 0.17, 0.16, 0.55, 0, 0.3, 0.3);
    }
  }
}
// mưa quanh máy quay
const MUA = (() => {
  const N = 5000, g = new THREE.BufferGeometry(), p = new Float32Array(N * 6);
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c4cc, transparent: true, opacity: 0.35 }));
  m.frustumCulled = false; m.visible = false; scene.add(m); const seeds = new Float32Array(N * 3); const R = rng(5);
  for (let i = 0; i < N * 3; i++) seeds[i] = R();
  return { m, p, seeds, N };
})();
function muaCapNhat(t, on) {
  MUA.m.visible = on > 0.01; if (!MUA.m.visible) return; MUA.m.material.opacity = 0.35 * on;
  const c = camera.position, R = 120, p = MUA.p;
  for (let i = 0; i < MUA.N; i++) {
    const x = c.x + (MUA.seeds[i * 3] - 0.5) * 2 * R, z = c.z + (MUA.seeds[i * 3 + 1] - 0.5) * 2 * R;
    const y = c.y + 60 - mod(t * 22 + MUA.seeds[i * 3 + 2] * 120, 120);
    p.set([x, y, z, x + 0.3, y - 1.6, z + 0.1], i * 6);
  }
  MUA.m.geometry.attributes.position.needsUpdate = true;
}
// ---------- âm thanh ----------
const AM = { ctx: null, buf: {}, loops: {}, master: null };
async function amNap() {
  try {
    AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.master = AM.ctx.createGain(); AM.master.connect(AM.ctx.destination);
    for (const k of ['daibac', 'daibac2', 'song', 'songbo', 'songtau', 'coitau', 'chientruong', 'trong', 'hanhquan', 'chim', 'bandan', 'songcuon']) {
      try { const ab = await (await fetch(URLG('audio/' + k + '.mp3'))).arrayBuffer(); AM.buf[k] = await AM.ctx.decodeAudioData(ab); } catch (e) { console.warn('am', k, e); }
    }
  } catch (e) { console.warn(e); }
}
function amLap(k, v) {
  if (!AM.ctx || !AM.buf[k]) return;
  let L = AM.loops[k];
  if (!L) { const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[k]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(AM.master); s.start(); L = AM.loops[k] = { s, g }; }
  L.g.gain.setTargetAtTime(v, AM.ctx.currentTime, 0.6);
}
let amLanCuoi = 0;
function amNo(dist, to = 1) {
  if (!AM.ctx || !AM.buf.daibac || AM.ctx.state !== 'running') return;
  const v = clamp(1 - dist / 9000, 0, 1) ** 1.6 * 0.38 * to; if (v < 0.015) return;   // V1.3: tiếng nổ nhỏ lại, chỉ làm nền cho lời dẫn
  const now = AM.ctx.currentTime; if (now - amLanCuoi < 0.12) return; amLanCuoi = now;
  const s = AM.ctx.createBufferSource(); s.buffer = (dist < 2500 && AM.buf.daibac2 && Math.random() < 0.7) ? AM.buf.daibac2 : AM.buf.daibac; s.playbackRate.value = 0.85 + Math.random() * 0.3;
  const g = AM.ctx.createGain(); g.gain.value = v; s.connect(g); g.connect(AM.master); s.start(now + Math.min(dist / 340, 3) * 0.35);
}

function amMot(k, v) {
  if (!AM.ctx || !AM.buf[k] || AM.ctx.state !== 'running' || v < 0.02) return;
  const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[k]; const g = AM.ctx.createGain(); g.gain.value = v; s.connect(g); g.connect(AM.master); s.start();
}
// ---------- dàn cảnh: tàu, nhóm người, sự kiện bắn, theo giây voice ----------
let ST = null;                    // story.json
const SC = {};                    // id hồi -> hồi
const SH = {};                    // id cú máy -> cú máy
const TC = (id, k = 0) => { const s = SC[id]; return k <= 0 ? s.t0 : (s.moc[Math.min(k, s.moc.length - 1)] ?? s.t0); };   // mốc câu k (0 = đầu hồi)
const TS = (id) => SH[id].t0, TE = (id) => SH[id].t1;

// ---------- hạm đội (12 chiếc theo Châu bản: thuyền buồm + tàu máy) · tên MINH HOẠ ----------
const TAU = [];
const TAU_DEF = [
  { ten: 'Kỳ hạm (khinh hạm hơi nước)', L: 72, B: 14.5, cot: 3, ong: 1, soCua: 14, ban: 1 },
  { ten: 'Hộ tống hạm', L: 60, B: 12, cot: 3, ong: 1 },
  { ten: 'Hộ tống hạm', L: 58, B: 11.5, cot: 3, ong: 1 },
  { ten: 'Pháo hạm', L: 42, B: 8.5, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 42, B: 8.5, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Tàu Tây Ban Nha', L: 50, B: 9.5, cot: 2, ong: 1, banhGuong: 1, coKieu: 'tbn', soCua: 6 },
  { ten: 'Tàu vận tải', L: 66, B: 12.5, cot: 3, ong: 1, banhGuong: 1, soCua: 6 },
  { ten: 'Tàu vận tải', L: 64, B: 12, cot: 3, ong: 1, banhGuong: 1, soCua: 6 },
  { ten: 'Tàu thông tin', L: 46, B: 8.5, cot: 2, ong: 1, banhGuong: 1, soCua: 4 },
];
// vị trí: biển xa → vào vịnh → trận bắn phá 1/9 → áp sát cửa sông 2/9 → neo vịnh → rời đi
const VT_XA = (i) => [-2600 + (i % 4) * 380 + Math.floor(i / 4) * 120, 23000 + Math.floor(i / 4) * 900 + (i % 2) * 200];
const VT_VAO = (i) => [-1900 + (i % 4) * 330, 9800 + Math.floor(i / 4) * 650];
const VT_CHO = (i) => [-2600 + (i % 4) * 420, 5200 + Math.floor(i / 4) * 520];
const VT_BAN1 = [[-1800, 3400], [-1450, 2950], [-1150, 2520], [-850, 2100], [-560, 1700], [-280, 1300], [-2500, 3900], [-2150, 3550], [-2000, 4300], [-2700, 4700], [-3100, 4200], [-1600, 3900]];
const VT_BAN2 = [[-300, 1250], [0, 900], [250, 600], [-650, 1050], [-450, 650], [-150, 350], [-2400, 3200], [-1900, 2700], [-2100, 3800], [-2800, 4400], [-3200, 3700], [-1200, 2300]];
const VT_NEO = (i) => [-2700 + (i % 4) * 520, 2500 + Math.floor(i / 4) * 620 + (i % 2) * 150];
const RA_DI = [0, 3, 4, 5, 8, 9, 10, 11];      // rời đi tháng 2/1859 (phần lớn lực lượng)
function lichTau(i) {
  const K = [];
  const a = VT_XA(i), b = VT_VAO(i), c = VT_CHO(i), d = VT_BAN1[i], e = VT_BAN2[i], f = VT_NEO(i);
  K.push([0, a[0], a[1] + 6000, 180, 0], [TS('C01-05') - 0.01, a[0], a[1] + 6000, 180, 0], [TS('C01-05'), a[0] + 800, a[1] - 13200, 180, 1], [TE('C01-05'), a[0] + 800, a[1] - 13800, 180, 1]);
  K.push([TS('C02-01'), a[0] + 300, a[1] + 2000, 180, 1], [TE('C02-05'), a[0] + 300, a[1] - 1800, 180, 1]);
  K.push([TS('C03-01'), b[0], b[1] + 1500, 185, 1], [TE('C03-03'), b[0], b[1] - 600, 185, 1]);
  K.push([TS('C03-04'), c[0] + 250, c[1] + 1400, 190, 1], [TE('C03-04') + 2, c[0], c[1], 200, 0]);
  K.push([TS('C04-01'), d[0] - 150, d[1] + 260, 150, 0], [TS('C04-01') + 10, d[0], d[1], 150, 0]);
  K.push([TS('C05-01'), e[0], e[1] + 300, 160, 0], [TC('C05', 3) + 4, e[0], e[1], 160, 0]);
  K.push([TS('C06-01'), f[0], f[1], 210, 0]);
  if (RA_DI.includes(i)) {
    K.push([TS('C11-03'), f[0], f[1], 20, 0], [TE('C11-03'), f[0] + 300, f[1] + 2200, 10, 1], [TE('C11-03') + 6, f[0] + 400, f[1] + 30000, 10, 1]);
  } else {
    K.push([TS('C12-02'), f[0], f[1], 20, 0], [TE('C12-02'), f[0] + 250, f[1] + 2400, 15, 1], [TE('C12-02') + 6, f[0] + 400, f[1] + 30000, 15, 1]);
  }
  return K;
}
function viTriTau(K, t) {
  if (t <= K[0][0]) return { x: K[0][1], n: K[0][2], h: K[0][3], buom: K[0][4], v: 0 };
  for (let k = 0; k < K.length - 1; k++) {
    const A = K[k], B = K[k + 1];
    if (t >= A[0] && t < B[0]) {
      const u = (t - A[0]) / Math.max(B[0] - A[0], 1e-3), x = lerp(A[1], B[1], u), n = lerp(A[2], B[2], u);
      const dx = B[1] - A[1], dn = B[2] - A[2], L = Math.hypot(dx, dn), v = L / Math.max(B[0] - A[0], 1e-3);
      const h = (L > 30 && v < 400) ? Math.atan2(dx, dn) / D2R : lerp(A[3], B[3], u);
      return { x, n, h: v > 400 ? A[3] : h, buom: A[4], v: v > 400 ? 0 : v };
    }
  }
  const L = K[K.length - 1]; return { x: L[1], n: L[2], h: L[3], buom: L[4], v: 0 };
}
function dungHamDoi() {
  TAU_DEF.forEach((o, i) => { const g = taoTau(o); g.userData.K = lichTau(i); g.userData.i = i; TAU.push(g); });
}
const _v = new V3();
function tauCapNhat(t) {
  for (const g of TAU) {
    const s = viTriTau(g.userData.K, t), u = g.userData;
    const xa = Math.hypot(s.x, s.n) > 40000;
    g.visible = !xa;
    g.position.set(s.x, 4 * u.L / 66 + 0.05 + Math.sin(t * 0.7 + u.i) * 0.08, -s.n);   // V1.3: đáy tàu (y = −4 trong mẫu) bằng mặt nước
    g.rotation.set(Math.sin(t * 0.5 + u.i * 2) * 0.012, -s.h * D2R, Math.sin(t * 0.63 + u.i) * 0.02, 'YXZ');
    u.x = s.x; u.n = s.n; u.h = s.h; u.v = s.v;
    u.buom.visible = !!s.buom; u.cuon.visible = !s.buom;
  }
}
function tauKhoi(t, dt) {
  for (const g of TAU) {
    const u = g.userData; if (!g.visible || u.ongZ == null) continue;
    const dang = (t < TS('C06-01')) || u.v > 0.5;
    if (!dang || R_FX() > dt * 5) continue;
    _v.set(0, u.ongY || u.F + 7.3, u.ongZ); g.localToWorld(_v);
    KHOI.them(_v.x, _v.y, _v.z, 0, 3, 0, 14, 4, 26, 0.16, 0.16, 0.17, 0.5, 0, 0.5, 0.25);
  }
}
const tauDiem = (i, lx = 0, ly = 0, lz = 0) => { _v.set(lx, ly, lz); return TAU[i].localToWorld(_v.clone()); };

// ---------- sự kiện bắn ----------
const BAN = [];   // {t, loai:'tau'|'phao'|'sung', i, tx, tn, ...}
function lichBan() {
  const R = rng(2025);
  // 1/9: hạm đội bắn Sơn Trà và cửa sông
  const muc1 = [[VT['son-tra-tay'].x, VT['son-tra-tay'].n], [VT['trai-phap'].x, VT['trai-phap'].n], [900, -350], [VT['nghia-dia'].x, VT['nghia-dia'].n]];
  for (let i = 0; i < 12; i++) {
    let t = TC('C04', 3) + R() * 3; const end = TC('C04', 13);
    while (t < end) { const m = muc1[Math.floor(R() * muc1.length)]; BAN.push({ t, loai: 'tau', i, tx: m[0] + (R() - 0.5) * 160, tn: m[1] + (R() - 0.5) * 160 }); t += (i === 2 ? 2.2 : 4) + R() * 5; }
  }
  // quân Nguyễn bắn trả
  for (const p of PHAO.filter(p => p.ten === 'son-tra-tay' || p.ten === 'dinh-hai')) {
    let t = TC('C04', 8) + R() * 2; while (t < TC('C04', 11)) { const i = Math.floor(R() * 7); BAN.push({ t, loai: 'phao', p, i }); t += 5 + R() * 6; }
  }
  // 2/9: An Hải rồi Điện Hải
  for (let i = 0; i < 12; i++) {
    let t = TS('C05-01') + R() * 3; const end = TC('C05', 7);
    while (t < end) {
      const dh = t > TC('C05', 3) || R() < 0.3; const v = dh ? VT['dien-hai'] : VT['an-hai'];
      BAN.push({ t, loai: 'tau', i, tx: v.x + (R() - 0.5) * 220, tn: v.n + (R() - 0.5) * 200 }); t += (i < 6 ? 3 : 7) + R() * 5;
    }
  }
  const phaoDH = PHAO.filter(p => p.ten === 'dien-hai');
  for (const p of phaoDH) { let t = TS('C05-01') + R() * 4; while (t < TC('C05', 6)) { BAN.push({ t, loai: 'phao', p, i: Math.floor(R() * 6) }); t += 6 + R() * 7; } }
  BAN.push({ t: TS('C05-02') + 1.5, loai: 'phao', p: PHAO_DH(), i: 0 }); BAN.push({ t: TS('C05-02') + 6.5, loai: 'phao', p: PHAO_DH(), i: 3 });
  BAN.push({ t: TS('C04-03') + 3, loai: 'phao', p: PHAO.find(p => p.ten === 'son-tra-tay'), i: 1 }); BAN.push({ t: TS('C04-03') + 9, loai: 'phao', p: PHAO.filter(p => p.ten === 'son-tra-tay')[2], i: 2 });
  BAN.sort((a, b) => a.t - b.t);
}
const PHAO_DH = () => PHAO.filter(p => p.ten === 'dien-hai')[2];
let tTruoc = -1;
function banCapNhat(t, dt, nhay) {
  const t0 = nhay ? t - 12 : tTruoc, cam = camera.position;
  if (nhay) { KHOI.xoa(); LUA.xoa(); }
  for (const e of BAN) {
    if (e.t <= t0) continue; if (e.t > t) break;
    const age = t - e.t;
    if (e.loai === 'tau') {
      const g = TAU[e.i]; if (!g.visible) continue; const u = g.userData;
      // mạn hướng về mục tiêu
      const tx = e.tx - u.x, tn = e.tn - u.n, hx = Math.sin(u.h * D2R), hn = Math.cos(u.h * D2R);
      const ben = (hx * tn - hn * tx) > 0 ? -1 : 1;
      const cua = u.cua.filter(c => c[3] === ben);
      for (let k = 0; k < 3; k++) {
        const c = cua[Math.floor(R_FX() * cua.length)]; if (!c) break;
        const p = g.localToWorld(new V3(c[0], c[1], c[2])), d = g.localToWorld(new V3(c[0] + ben, c[1], c[2])).sub(p).setY(0).normalize();
        khoiSung(p, d, 1.1, age + k * 0.15);
        if (!nhay) amNo(p.distanceTo(cam), 0.8);
      }
      const ay = hAt(e.tx, e.tn), dich = new V3(e.tx, Math.max(ay, 0), -e.tn), tr = 2.2;
      if (age > tr || !nhay) DAN.push({ t: e.t + tr, p: dich, nuoc: ay < 0.3 });
    } else if (e.loai === 'phao') {
      if (!e.p) continue; khoiSung(e.p.pos.clone().add(new V3(0, 1, 0)), e.p.dir, 1, age);
      if (!nhay) amNo(e.p.pos.distanceTo(cam), 1);
      const g = TAU[e.i]; if (g && g.visible) { const m = new V3(g.userData.x + (R_FX() - 0.5) * 140, 0, -(g.userData.n + (R_FX() - 0.5) * 140)); DAN.push({ t: e.t + 2.5, p: m, nuoc: true }); }
    } else if (e.loai === 'sung') {
      const p = new V3(e.x, gAt(e.x, e.n) + 1.4, -e.n); KHOI.them(p.x, p.y, p.z, e.dx * 3, 0.3, -e.dn * 3, 6, 0.6, 5, 0.9, 0.9, 0.88, 0.55, age, 0.9, 0.15);
      LUA.them(p.x + e.dx * 0.8, p.y, p.z - e.dn * 0.8, 0, 0, 0, 0.12, 0.8, 1.6, 1, 0.8, 0.4, 1, age);
    }
  }
  // đạn rơi
  for (let k = DAN.length - 1; k >= 0; k--) {
    const d = DAN[k]; if (d.t > t) continue; DAN.splice(k, 1); if (t - d.t > 14) continue;
    if (d.nuoc) toeNuoc(d.p, 1.2, t - d.t); else { no(d.p, 1.2, t - d.t); if (!nhay) amNo(d.p.distanceTo(cam), 1); }
  }
  tTruoc = t;
}
const DAN = [];

// ---------- nhóm người ----------
const NHOM = [];
// o: {id, phe, so, hinh:'khoi'|'hang'|'tan', cot, kc, r, lich:[[t,x,n,anim]], huong:[x,n]|deg, hien:[t0,t1], tren:'tau:i', y, mu, vk, chet:[t, tile], ten, to}
function nhom(o) {
  const M = PHE[o.phe], R = rng(o.id.length * 131 + o.so * 7 + (o.seed || 0));
  const kinds = o.kind ? [o.kind] : Array.isArray(M.kind) ? M.kind : [M.kind];
  o.vkX = o.vk !== undefined ? (VK_CU[o.vk] === undefined ? M.vk : VK_CU[o.vk]) : M.vk;
  o.hien = o.hien || [-1, 1e9]; o.cot = o.cot || Math.ceil(Math.sqrt(o.so)); o.kc = o.kc || 1.6;
  o.m = [];
  for (let k = 0; k < o.so; k++) {
    let lx, lz;
    if (o.hinh === 'tan') { const a = R() * 6.28, d = Math.sqrt(R()) * (o.r || 10); lx = Math.cos(a) * d; lz = Math.sin(a) * d; }
    else if (o.hinh === 'hang') { lx = (k - (o.so - 1) / 2) * o.kc + (R() - 0.5) * 0.4; lz = (R() - 0.5) * 0.8 + (k % 2) * (o.hai ? 1.4 : 0); }
    else { const c = k % o.cot, r = Math.floor(k / o.cot); lx = (c - (o.cot - 1) / 2) * o.kc + (R() - 0.5) * 0.3; lz = r * o.kc * 1.1 + (R() - 0.5) * 0.3; }
    if (o.vitri) [lx, lz] = o.vitri[k];
    const tint = o.tint || M.tint[Math.floor(R() * M.tint.length)];
    o.m.push({ kind: kinds[k % kinds.length], lx, lz, tint, ph: R(), sp: 0.92 + R() * 0.16, chet: R(), yaw: (R() - 0.5) * 0.25, quy: R() < 0.35, sq: (o.phe === 'phap' || o.phe === 'tbn') && o.so > 8 && k % 12 === 5 });
  }
  NHOM.push(o); return o;
}
// ---- V1.4: chống "trôi" — giới hạn tốc độ đi/chạy theo sải chân thật, nhảy vị trí đúng lúc cắt cảnh ----
const DONG_DI = { di: 1, chay: 1, khieng: 1, vac: 1, keo: 1 };
let CAT = null;     // mốc cắt cảnh (đầu mỗi cảnh quay)
function vNat(kind, clip) { const v = VNAT[kind] && VNAT[kind][clip]; return v || (clip === 'chay' ? 4.4 : 1.0); }
function chuanHoaLich(o) {
  if (!CAT) CAT = Object.values(SH).map(s => s.t0).sort((a, b) => a - b);
  const kinds = [...new Set(o.m.map(m => m.kind))];
  const cap = (an) => Math.min(...kinds.map(k => vNat(k, an))) * (an === 'chay' ? 1.15 : 1.3);
  const L0 = o.lich.map((a, i) => [...a, i]).sort((a, b) => a[0] - b[0] || a[4] - b[4]).map(a => a.slice(0, 4));
  const cuts = CAT.concat([o.hien[0], o.hien[1]]);
  const R = [L0[0]];
  for (let k = 1; k < L0.length; k++) {
    const A = R[R.length - 1], B = L0[k].slice(), dt = B[0] - A[0], d = Math.hypot(B[1] - A[1], B[2] - A[2]);
    if (d <= 2) { R.push(B); continue; }
    let an = B[3] || 'di'; if (!DONG_DI[an]) an = 'di';
    if (dt > 0 && an === 'di' && d / dt > cap('di') * 1.6) an = 'chay';      // phải vội thì chạy
    B[3] = an;
    const vc = cap(an);
    const goc = L0[k][3], them = () => { if (goc && !DONG_DI[goc]) R.push([B[0], B[1], B[2], goc]); };
    if (dt > 0.05 && d / dt <= vc) { R.push(B); them(); continue; }
    // quá nhanh: chạy vc, nhảy cóc ở một mốc cắt cảnh
    const ux = (B[1] - A[1]) / d, un = (B[2] - A[2]) / d;
    let tc = null, best = 1e9;
    for (const c of cuts) if (c > A[0] + 0.05 && c < B[0] - 0.05) { const w = Math.abs(c - (A[0] + B[0]) / 2); if (w < best) { best = w; tc = c; } }
    if (tc == null) {
      const gan = (t) => Math.min(...cuts.map(c => Math.abs(c - t)));
      tc = gan(A[0]) <= gan(B[0]) ? A[0] : B[0];
    }
    const s1 = vc * Math.max(0, tc - A[0]), s2 = vc * Math.max(0, B[0] - tc);
    if (tc > A[0]) R.push([tc, A[1] + ux * s1, A[2] + un * s1, an]);
    R.push([tc, B[1] - ux * s2, B[2] - un * s2, an]);
    if (B[0] > tc) R.push(B); them();
  }
  // quãng đường cộng dồn (để nhịp bước khớp với quãng đi)
  o.lichQ = [0]; for (let k = 1; k < R.length; k++) o.lichQ.push(o.lichQ[k - 1] + Math.hypot(R[k][1] - R[k - 1][1], R[k][2] - R[k - 1][2]));
  o.lich = R; o._chuan = true;
}
function viTriNhom(o, t) {
  if (!o._chuan) chuanHoaLich(o);
  const L = o.lich; let x, n, an, dx = 0, dn = 0, mv = false, q = 0;
  if (t <= L[0][0]) { [, x, n, an] = L[0]; }
  else if (t >= L[L.length - 1][0]) { [, x, n, an] = L[L.length - 1]; }
  else for (let k = 0; k < L.length - 1; k++) {
    const A = L[k], B = L[k + 1];
    if (t >= A[0] && t < B[0]) {
      const u = (t - A[0]) / (B[0] - A[0]); x = lerp(A[1], B[1], u); n = lerp(A[2], B[2], u); dx = B[1] - A[1]; dn = B[2] - A[2];
      mv = Math.hypot(dx, dn) > 2; an = mv ? B[3] : A[3]; q = lerp(o.lichQ[k], o.lichQ[k + 1], u); break;
    }
  }
  if (!mv && DONG_DI[an]) an = 'dung';   // đứng yên thì không bước tại chỗ
  let h;
  if (mv) h = Math.atan2(dx, dn);
  else if (Array.isArray(o.huong)) h = Math.atan2(o.huong[0] - x, o.huong[1] - n);
  else h = (o.huong || 0) * D2R;
  return { x, n, h, an, mv, q };
}
let NHOM_DT = 0, NHOM_NHAY = false;
const BAN_SUNG = { nguyen: 1, phap: 1, tbn: 1, danbinh: 0.4, phapxanh: 1 };
function nhomCapNhat(t) {
  xBegin();
  const cam = camera.position;
  for (const o of NHOM) {
    if (t < o.hien[0] || t > o.hien[1]) continue;
    const s = viTriNhom(o, t);
    let tau = null; if (o.tren) { const [k, i] = o.tren.split(':'); tau = k === 'tau' ? TAU[+i] : (XUONG[+i] && XUONG[+i].obj); }
    if (tau && !tau.visible) continue;
    let cx = s.x, cz = -s.n; if (tau) { const w = tau.localToWorld(new V3(s.x, 0, -s.n)); cx = w.x; cz = w.z; }
    const dd = Math.hypot(cx - cam.x, cz - cam.z); if (dd > (o.xa || 4200) + cam.y * 1.5) continue;
    const ch = Math.cos(s.h), sh = Math.sin(s.h), an0 = ANIM[s.an] ?? 0;
    for (const m of o.m) {
      const ex = m.lx * ch - m.lz * sh, en = -m.lx * sh - m.lz * ch;
      let x = s.x + ex, n = s.n + en, y, yaw = -s.h + m.yaw + Math.PI, an = an0, tSeg = 0;
      if (o.chet) { const tc = o.chet[0] + m.chet * (o.chet[2] || 4); if (t > tc && m.chet < o.chet[1]) { an = ANIM.chet; tSeg = t - tc; } }
      if (o.anRieng) an = o.anRieng(m, t, an);
      if (an === ANIM.chet && !tSeg) tSeg = 99;
      if (an === ANIM.ngam && m.quy && o.phe !== 'phaothu' && !o.tren) an = ANIM.quy;
      let clip = CLIPN[an] || 'dung', vkM = o.vkX; const ta = s.mv && an === an0 ? s.q / vNat(m.kind, clip) : t * m.sp;
      if (m.sq) { vkM = 'sungngan'; if (an === ANIM.ngam || an === ANIM.quy || an === ANIM.ban) clip = 'sungngan'; else if (an === ANIM.dung) clip = 'chihuy'; }   // sĩ quan cầm súng ngắn ổ quay
      if (tau) {
        const w = tau.localToWorld(new V3(x, o.y != null ? o.y : tau.userData.F + 0.02, -n));
        xPut(m.kind, clip, ta, m.ph, w.x, w.y, w.z, yaw + tau.rotation.y, o.to || 1, m.tint, vkM, tSeg);
      } else {
        if (o.y == null && hAt(x, n) < 0.3) continue;
        y = o.y != null ? o.y : gAt(x, n);
        const ve = xPut(m.kind, clip, ta, m.ph, x, y, -n, yaw, o.to || 1, m.tint, vkM, tSeg);
        if (ve && (an === ANIM.ngam || an === ANIM.quy) && !NHOM_NHAY && BAN_SUNG[o.phe] && dd < 2500 && R_FX() < NHOM_DT * 0.22 * BAN_SUNG[o.phe] && (o.vkX === 'sungtruong' || o.vkX === 'dieuthuong')) {
          const px = XMUZ.x, py = XMUZ.y, pz = XMUZ.z;
          LUA.them(px, py, pz, 0, 0, 0, 0.1, 0.7, 1.4, 1, 0.8, 0.45, 1);
          for (let q = 0; q < 3; q++) KHOI.them(px, py, pz, Math.sin(s.h) * 2.5 + (R_FX() - 0.5), 0.3, -Math.cos(s.h) * 2.5 + (R_FX() - 0.5), 6 + R_FX() * 4, 0.6, 4 + R_FX() * 3, 0.92, 0.92, 0.9, 0.5, 0, 0.9, 0.15);
          if (dd < 220) amMot('bandan', 0.12 * clamp(1 - dd / 220, 0, 1));
        }
      }
    }
    o._pos = new V3(cx, (o.y != null ? o.y : gAt(s.x, s.n)) + 1.6, cz);
  }
  langCapNhat(t); baoTangCapNhat(t);
  if (NGUA && NGUA.visible) xPut('ngua', 'chay', NGUA.userData.q || t, 0, NGUA.position.x, NGUA.position.y, NGUA.position.z, NGUA.rotation.y + Math.PI, 1, [1, 1, 1], null);
  xEnd();
}

// ---------- bố trí nhân vật theo kịch bản ----------
const NV = {};      // nhân vật có tên: id -> nhóm
function kipPhao(p, t0, t1, id, seed = 0) {
  // 4 người sau khẩu pháo: nạp đạn, ngắm, hai người đứng
  const d = p.dir, x = p.pos.x - d.x * 1.8, n = -(p.pos.z - d.z * 1.8), rx = -d.z, rz = d.x;
  const vitri = [[-1.0, 0.3], [1.0, 0.2], [-1.5, 1.4], [1.3, 1.5]];   // V1.4: pháo lùi vào, kíp đứng gọn trên mặt thành
  return nhom({ id, phe: 'phaothu', so: 4, vitri, lich: [[0, x, n, 'dung']], huong: [p.pos.x + d.x * 50, -(p.pos.z + d.z * 50)], hien: [t0, t1], y: p.pos.y, seed,
    anRieng: (m, t, an) => { const k = vitri.findIndex(v => v[0] === m.lx && v[1] === m.lz); return k === 0 ? ANIM.napphao : k === 1 ? ANIM.ngam : an; } });
}
function boTriNhanVat() {
  const v = VT, END = ST.dur + 5;
  const dh = CONG['dien-hai'], ah = CONG['an-hai'];
  const yDH = dh.position.y + 5.2;
  // --- Hồi 1: làng chài, thuyền
  nhom({ id: 'dan-cheo', phe: 'dan', so: 2, hinh: 'hang', kc: 1.2, lich: [[0, v['lang-chai'].x - 60, v['lang-chai'].n + 70, 'cheo']], hien: [0, TS('C04-01')], y: 0.35, huong: 290 });
  // --- lính trên thành Điện Hải, An Hải (đến khi rút)
  const phaoDH = PHAO.filter(p => p.ten === 'dien-hai'), phaoAH = PHAO.filter(p => p.ten === 'an-hai');
  phaoDH.slice(0, 8).forEach((p, k) => kipPhao(p, 0, TC('C05', 6), 'kip-dh-' + k, k));
  phaoAH.slice(0, 6).forEach((p, k) => kipPhao(p, 0, TC('C05', 5), 'kip-ah-' + k, k + 20));
  PHAO.filter(p => p.ten === 'son-tra-tay').forEach((p, k) => kipPhao(p, 0, TC('C04', 13), 'kip-st-' + k, k + 40));
  PHAO.filter(p => p.ten === 'dinh-hai').forEach((p, k) => kipPhao(p, 0, END, 'kip-dinh-' + k, k + 60));
  nhom({ id: 'dh-trong', phe: 'nguyen', so: 40, hinh: 'khoi', cot: 8, kc: 2.2, lich: [[0, v['dien-hai'].x - 10, v['dien-hai'].n + 25, 'dung'], [TC('C05', 6), v['dien-hai'].x - 10, v['dien-hai'].n + 25, 'dung'], [TC('C05', 6) + 30, v['hai-chau'].x, v['hai-chau'].n + 60, 'chay']], huong: 0, hien: [0, TC('C05', 6) + 30], y: null });
  nhom({ id: 'ah-trong', phe: 'nguyen', so: 30, hinh: 'khoi', cot: 6, kc: 2.2, lich: [[0, v['an-hai'].x, v['an-hai'].n + 10, 'dung'], [TC('C05', 5), v['an-hai'].x, v['an-hai'].n + 10, 'dung'], [TC('C05', 5) + 26, v['nai-hien'].x, v['nai-hien'].n + 80, 'chay']], huong: 0, hien: [0, TC('C05', 5) + 26] });
  NV['tran-hoang'] = nhom({ id: 'tran-hoang', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[0, v['dien-hai'].x + 4, v['dien-hai'].n + 50, 'chihuy']], huong: [0, 2000], hien: [TS('C03-01'), TC('C05', 6)], ten: 'Trần Hoằng', mauRieng: { A: '#5a1c18', C: '#1a1a1a' } });
  // --- Hồi 3: lính gác Hải Vân, người đưa tin
  const hv = v['hai-van'];
  nhom({ id: 'gac-hv', phe: 'nguyen', so: 3, hinh: 'hang', kc: 1.6, lich: [[0, hv.x + 22, hv.n - 14, 'ngam']], huong: [-1500, 9000], hien: [0, END], vk: 'khong' });
  nhom({ id: 'linh-hv', phe: 'nguyen', so: 12, hinh: 'tan', r: 14, lich: [[0, hv.x + 34, hv.n - 30, 'dung']], huong: [-1500, 9000], hien: [0, END] });
  // --- Hồi 2, 11: bộ chỉ huy liên quân trên kỳ hạm (toạ độ cục bộ của tàu: x ngang, n về mũi)
  const banTau = (t0, t1, id) => {
    nhom({ id: id + '-rg', phe: 'phapxanh', so: 1, vk: 'khong', lich: [[0, 1.6, 14 - 1.2, 'chihuy']], huong: 0, tren: 'tau:0', hien: [t0, t1], ten: 'Rigault de Genouilly', mauRieng: { A: '#141c34', B: '#141c34', C: '#141c34' } });
    nhom({ id: id + '-sq', phe: 'phapxanh', so: 4, vk: 'khong', hinh: 'tan', vitri: [[-1.4, 13.4], [0.4, 15.3], [2.4, 15.2], [3.0, 13.6]], lich: [[0, 0, 0, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1] });
    nhom({ id: id + '-tbn', phe: 'tbn', so: 1, vk: 'khong', lich: [[0, -0.6, 14 + 1.4, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1], ten: 'Sĩ quan Tây Ban Nha', mauRieng: { A: '#2c3c5a', C: '#2c3c5a' }, mu: 'kepi' });
    nhom({ id: id + '-thuy', phe: 'thuy', so: 14, hinh: 'tan', r: 9, lich: [[0, 0, -10, 'dung']], huong: 0, tren: 'tau:0', hien: [t0, t1] });
  };
  banTau(TS('C02-02'), TE('C02-03'), 'ban1'); banTau(TS('C11-01'), TE('C11-02'), 'ban2');
  NV['rigault'] = NHOM.find(o => o.id === 'ban1-rg');
  nhom({ id: 'tau1-tb', phe: 'thuy', so: 26, hinh: 'khoi', cot: 6, kc: 1.5, lich: [[0, 0, -6, 'dung']], huong: 0, tren: 'tau:1', hien: [TS('C02-05'), TE('C02-05')], anRieng: (m, t, an) => m.ph < 0.4 ? ANIM.napphao : an });
  nhom({ id: 'tau1-bb', phe: 'phap', so: 30, hinh: 'khoi', cot: 6, kc: 1.3, lich: [[0, 0, 8, 'dung']], huong: 0, tren: 'tau:1', hien: [TS('C02-05'), TE('C02-05')], anRieng: (m, t, an) => m.ph < 0.3 ? ANIM.ngam : an });
  // kíp pháo trên tàu 2 (cận cảnh Hồi 4)
  nhom({ id: 'tau2-kip', phe: 'thuy', so: 16, hinh: 'tan', vitri: Array.from({ length: 16 }, (_, k) => [(k % 2 ? 1 : -1) * 3.6, -9 + Math.floor(k / 2) * 3]), lich: [[0, 0, 0, 'napphao']], huong: 90, tren: 'tau:2', hien: [TS('C04-01'), TE('C05-05')] });
  // --- Hồi 4: đổ bộ (16 xuồng)
  const st = v['bai-st'], bh = v['bai-han'];
  XUONG.length = 0;
  for (let k = 0; k < 16; k++) {
    const den = k < 10 ? [st.x - 40 + (k % 5) * 22, st.n - 30 - Math.floor(k / 5) * 22] : [bh.x - 50 + (k % 3) * 25, bh.n + 30 + Math.floor((k - 10) / 3) * 20];
    const tu0 = [VT_BAN1[4], VT_BAN1[5], VT_BAN1[3]][k % 3], tu = [tu0[0] + (k % 4) * 30, tu0[1] - Math.floor(k / 4) * 25];
    { const L = Math.hypot(tu[0] - den[0], tu[1] - den[1]); for (let d = 0; d < L; d += 5) { const x = den[0] + (tu[0] - den[0]) * d / L, n = den[1] + (tu[1] - den[1]) * d / L; if (hAt(x, n) < -0.6) { den[0] = x; den[1] = n; break; } } }
    XUONG.push({ lich: [[TS('C04-03'), tu[0] + 40, tu[1] - 30], [TS('C04-04') + 2, lerp(tu[0], den[0], 0.25), lerp(tu[1], den[1], 0.25)], [TE('C04-04') - 1, den[0], den[1]], [TS('C06-01'), den[0], den[1]]], hien: [TS('C04-03'), TS('C06-01')] });
    nhom({ id: 'xuong-' + k, phe: k % 3 ? 'phap' : 'thuy', so: 10, vitri: Array.from({ length: 10 }, (_, j) => [(j % 2 ? 0.55 : -0.55), -3.2 + Math.floor(j / 2) * 1.5]), lich: [[0, 0, 0, 'cheo']], huong: 0, tren: 'xuong:' + k, hien: [TS('C04-03'), TE('C04-04') - 1], y: 0.15, seed: k });
  }
  nhom({ id: 'dobo-st', phe: 'phap', so: 120, hinh: 'khoi', cot: 12, kc: 1.5, lich: [[TE('C04-04') - 1, st.x - 20, st.n - 10, 'dung'], [TS('C05-01'), st.x + 160, st.n + 60, 'di'], [TS('C06-01'), v['trai-phap'].x, v['trai-phap'].n - 40, 'di']], huong: [v['trai-phap'].x, v['trai-phap'].n], hien: [TE('C04-04') - 1, TS('C06-01')] });
  nhom({ id: 'dobo-han', phe: 'tbn', so: 60, hinh: 'khoi', cot: 10, kc: 1.5, lich: [[TE('C04-04') - 1, bh.x + 10, bh.n - 15, 'dung'], [TC('C05', 7), bh.x + 30, bh.n - 60, 'dung'], [TC('C05', 7) + 25, v['an-hai'].x, v['an-hai'].n + 30, 'chay'], [TS('C06-01'), v['an-hai'].x, v['an-hai'].n + 30, 'dung']], huong: [v['an-hai'].x, v['an-hai'].n], hien: [TE('C04-04') - 1, TS('C08-01')] });
  nhom({ id: 'vao-dh', phe: 'phap', so: 80, hinh: 'khoi', cot: 10, kc: 1.5, lich: [[TC('C05', 7), 1250, -650, 'dung'], [TC('C05', 7) + 22, v['dien-hai'].x + 5, v['dien-hai'].n + 120, 'chay'], [TS('C06-01'), v['dien-hai'].x + 5, v['dien-hai'].n + 30, 'di']], huong: 180, hien: [TC('C05', 7), TS('C06-01')] });
  // --- Hồi 6: Cẩm Lệ
  const cl = v['cam-le'];
  NV['le-dinh-ly'] = nhom({ id: 'le-dinh-ly', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[TS('C06-01'), -4300, -3300, 'di'], [TS('C06-02'), -1650, -8330, 'chihuy'], [TC('C06', 6) + 2, -1650, -8330, 'chihuy'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [300, -6800], hien: [TS('C06-01'), TE('C06-05') + 8], ten: 'Lê Đình Lý', mauRieng: { A: '#6a1a16', C: '#161616' },
    anRieng: (m, t, an) => t > TC('C06', 6) ? ANIM.cang : an });
  nhom({ id: 'ldl-khieng', phe: 'nguyen', so: 2, vk: 'khong', vitri: [[0, 1.0], [0, -1.0]], lich: [[TC('C06', 6) + 2, -1650, -8330, 'dung'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [-1900, -8500], hien: [TC('C06', 6), TE('C06-05') + 8] });
  nhom({ id: 'ldl-ve', phe: 'nguyen', so: 6, hinh: 'tan', r: 4, lich: [[TS('C06-02'), -1655, -8338, 'dung'], [TC('C06', 6) + 2, -1655, -8338, 'dung'], [TE('C06-05') + 8, -1900, -8500, 'di']], huong: [300, -6800], hien: [TS('C06-02'), TE('C06-05') + 8] });
  nhom({ id: 'vien-binh', phe: 'nguyen', so: 240, hinh: 'khoi', cot: 6, kc: 1.5, lich: [[TS('C06-01'), -4300, -3250, 'di'], [TE('C06-01'), -3900, -3900, 'di'], [TS('C06-03'), -1350, -8150, 'di'], [TS('C06-03') + 1, -1350, -8150, 'dung']], huong: [300, -6800], hien: [TS('C06-01'), TS('C06-03') + 1] });
  nhom({ id: 'cl-tuyen', phe: 'nguyen', so: 260, hinh: 'hang', kc: 2.2, hai: 1, lich: [[TS('C06-03'), -900, -8080, 'dung'], [TC('C06', 4), -900, -8080, 'ngam'], [TE('C06-05') + 6, -900, -8080, 'dung']], huong: [300, -6800], hien: [TS('C06-03'), TS('C07-01')], chet: [TC('C06', 5), 0.12, 10],
    anRieng: (m, t, an) => (an === ANIM.ngam && m.ph > 0.55) ? ANIM.dung : an });
  nhom({ id: 'cl-lien', phe: 'phap', so: 180, hinh: 'hang', kc: 2, hai: 1, lich: [[TS('C06-03'), 900, -6100, 'di'], [TC('C06', 4), -350, -7550, 'di'], [TC('C06', 4) + 1, -350, -7550, 'ngam'], [TE('C06-05'), -350, -7550, 'ngam'], [TS('C07-01'), 600, -6300, 'di']], huong: [-1300, -8300], hien: [TS('C06-03'), TS('C07-01')], chet: [TC('C06', 5), 0.08, 8] });
  nhom({ id: 'cl-tbn', phe: 'tbn', so: 80, hinh: 'hang', kc: 2, lich: [[TS('C06-03'), 1300, -6300, 'di'], [TC('C06', 4), 100, -7750, 'di'], [TC('C06', 4) + 1, 100, -7750, 'ngam'], [TS('C07-01'), 1000, -6500, 'di']], huong: [-1300, -8300], hien: [TS('C06-03'), TS('C07-01')] });
  // --- Hồi 7: bộ chỉ huy Nguyễn Tri Phương (ƯỚC LƯỢNG, gần đồn Liên Trì)
  const bx = 430, bn = -5420;
  NV['ntp'] = nhom({ id: 'ntp', phe: 'nguyen', kind: 'ntp', so: 1, mu: 'khan', vk: 'khong', lich: [[0, bx, bn - 1.1, 'chihuy']], huong: [bx, bn], hien: [TS('C07-02'), TE('C09-01')], ten: 'Nguyễn Tri Phương', mauRieng: { A: '#7a1712', B: '#2a1e18', C: '#1a1410' } });
  NV['pth'] = nhom({ id: 'pth', phe: 'nguyen', so: 1, mu: 'khan', vk: 'khong', lich: [[0, bx + 1.6, bn + 0.4, 'dung']], huong: [bx, bn], hien: [TS('C07-02'), TE('C09-01')], ten: 'Phạm Thế Hiển', mauRieng: { A: '#2b3566', C: '#1a1a1a' } });
  nhom({ id: 'ntp-tuong', phe: 'nguyen', so: 4, mu: 'khan', vk: 'khong', vitri: [[-1.6, 0.3], [-0.6, 1.3], [0.7, 1.3], [1.6, -1.0]], lich: [[0, bx, bn, 'dung']], huong: 0, hien: [TS('C07-02'), TE('C09-01')], anRieng: (m) => ANIM.dung, mauRieng: { C: '#1a1a1a' } });
  nhom({ id: 'ntp-ve', phe: 'nguyen', so: 10, hinh: 'hang', kc: 2.5, lich: [[0, bx, bn - 9, 'dung']], huong: 0, hien: [TS('C07-02'), TE('C09-01')] });
  // --- Hồi 8: đào lũy, chở tre
  nhom({ id: 'dao-luy', phe: 'danbinh', so: 60, hinh: 'tan', r: 22, vk: 'xeng', lich: [[0, -900, -3440, 'dao']], huong: 0, hien: [TS('C08-01'), TE('C08-04')], anRieng: (m, t, an) => m.ph < 0.2 ? ANIM.khieng : an });
  nhom({ id: 'buoc-chong', phe: 'danbinh', so: 4, vk: 'khong', vitri: [[-1.2, 0.8], [0.2, 1.5], [1.4, 0.6], [2.5, 1.6]], lich: [[0, -890, -3452, 'ngoi']], huong: 180, hien: [TS('C08-01'), TE('C08-04')], anRieng: (m, t, an) => m.ph < 0.5 ? ANIM.ngoi : ANIM.dao });
  nhom({ id: 'cho-tre', phe: 'dan', so: 24, hinh: 'khoi', cot: 2, kc: 2.2, vk: 'bo', lich: [[TS('C08-02'), -900, -3700, 'khieng'], [TE('C08-04'), -880, -3460, 'khieng']], huong: 0, hien: [TS('C08-02'), TE('C08-04')] });
  nhom({ id: 'dao-luy2', phe: 'nguyen', so: 40, hinh: 'tan', r: 30, vk: 'xeng', lich: [[0, 300, -3420, 'dao']], huong: 0, hien: [TS('C08-02'), TE('C08-04')] });
  // lính giữ lũy (Hồi 8 → hết)
  const giuLuy = (id, pts, so, t0, t1, phe = 'nguyen', an = 'dung') => {
    const [a, b] = pts, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / L, nn = (b[0] - a[0]) / L;   // về phía Bắc của đoạn
    const vit = Array.from({ length: so }, (_, k) => { const u = (k + 0.5) / so; return [a[0] + (b[0] - a[0]) * u - nx * 5, a[1] + (b[1] - a[1]) * u - nn * 5]; });
    return nhom({ id, phe, so, vitri: vit.map(p => [p[0], -p[1]]), lich: [[0, 0, 0, an]], huong: 180, hien: [t0, t1], seed: so, anRieng: (m, t, a2) => a2 });
  };
  // dân binh & lính trên đoạn Thạc Gián (cận cảnh Hồi 9, 10, 11, 12)
  nhom({ id: 'tg-giu', phe: 'nguyen', so: 70, hinh: 'hang', kc: 3.2, lich: [[0, -480, -3492, 'dung'], [TS('C09-02') + 6, -480, -3492, 'ngam'], [TS('C09-05'), -480, -3492, 'dung']], huong: 0, hien: [TS('C08-04'), END],
    anRieng: (m, t, an) => { if (t > TS('C12-01') && m.ph < 0.5) return ANIM.ngoi; if (an === ANIM.ngam && m.ph > 0.6) return ANIM.napphao; return an; } });
  nhom({ id: 'tg-dan', phe: 'danbinh', so: 30, hinh: 'hang', kc: 5, lich: [[0, -470, -3500, 'dung']], huong: 0, hien: [TS('C09-01'), END], anRieng: (m, t, an) => (t > TS('C12-01') && m.ph < 0.6) ? ANIM.ngoi : an });
  nhom({ id: 'tg-vachi', phe: 'nguyen', so: 1, mu: 'khan', vk: 'guom', lich: [[0, -520, -3500, 'chihuy']], huong: 0, hien: [TS('C09-02'), TE('C09-05')] });
  // Hồi 9: liên quân tấn công Thạc Gián và Nại Hiên rồi rút
  nhom({ id: 'cong-phap', phe: 'phap', so: 150, hinh: 'hang', kc: 2.2, hai: 1, lich: [[TS('C09-02'), 400, -2550, 'di'], [TS('C09-04'), -420, -3200, 'di'], [TS('C09-04') + 1, -420, -3200, 'ngam'], [TS('C09-05'), -420, -3200, 'ngam'], [TS('C09-05') + 1, -420, -3200, 'chay'], [TE('C09-05'), 500, -2500, 'chay']], huong: [-480, -3500], hien: [TS('C09-01'), TE('C09-05')], chet: [TS('C09-04') + 2, 0.15, 9] });
  nhom({ id: 'cong-tbn', phe: 'tbn', so: 80, hinh: 'hang', kc: 2.2, lich: [[TS('C09-02'), 2300, -2400, 'di'], [TS('C09-04'), 2300, -3500, 'di'], [TS('C09-04') + 1, 2300, -3500, 'ngam'], [TS('C09-05'), 2300, -3500, 'ngam'], [TS('C09-05') + 1, 2300, -3500, 'chay'], [TE('C09-05'), 2250, -2300, 'chay']], huong: [2350, -3800], hien: [TS('C09-01'), TE('C09-05')] });
  nhom({ id: 'nh-giu', phe: 'nguyen', so: 60, hinh: 'hang', kc: 2.6, lich: [[0, 2380, -3760, 'ngam']], huong: 0, hien: [TS('C09-01'), END], anRieng: (m, t, an) => (t > TE('C09-05') ? ANIM.dung : an) });
  // Hồi 10: doanh trại, vận tải, quân y (Sơn Trà); quân Nguyễn củng cố lũy dưới mưa
  const tp = v['trai-phap'];
  nhom({ id: 'trai-linh', phe: 'phap', so: 60, hinh: 'tan', r: 40, lich: [[0, tp.x, tp.n, 'dung']], huong: 200, hien: [TS('C06-01'), TE('C11-05')], anRieng: (m, t, an) => m.ph < 0.35 ? ANIM.ngoi : m.ph < 0.45 ? ANIM.di : an });
  nhom({ id: 'trai-om', phe: 'phap', so: 8, hinh: 'hang', kc: 1.2, lich: [[0, tp.x - 12, tp.n - 28, 'chet']], huong: 90, hien: [TS('C10-01'), TE('C10-05')], anRieng: () => ANIM.chet, mauRieng: { A: '#d8d4c8' } });
  nhom({ id: 'van-tai', phe: 'thuy', so: 18, hinh: 'khoi', cot: 2, kc: 2, vk: 'bo', lich: [[TS('C10-01'), st.x, st.n + 10, 'khieng'], [TE('C10-03'), tp.x - 20, tp.n - 20, 'khieng']], huong: 0, hien: [TS('C10-01'), TE('C10-03')] });
  nhom({ id: 'dh-lq', phe: 'phap', so: 50, hinh: 'tan', r: 35, lich: [[0, v['dien-hai'].x, v['dien-hai'].n, 'dung']], huong: 180, hien: [TS('C06-01'), TE('C12-02')], y: dh.position.y + 0.3 });
  nhom({ id: 'mua-dao', phe: 'danbinh', so: 40, hinh: 'tan', r: 25, vk: 'xeng', lich: [[0, -520, -3470, 'dao']], huong: 0, hien: [TS('C10-04'), TE('C10-04')] });
  // Hồi 12: dân trở lại làng
  nhom({ id: 'dan-ve', phe: 'dan', so: 30, hinh: 'tan', r: 45, lich: [[0, v['lang-chai'].x, v['lang-chai'].n - 15, 'dung']], huong: [v['lang-chai'].x, v['lang-chai'].n + 200], hien: [TS('C12-03'), END], anRieng: (m, t, an) => m.ph < 0.4 ? ANIM.di : an });
}
// xuồng đổ bộ (vị trí theo lịch)
const XUONG = [];
let XUONG_IM = null;
function xuongCapNhat(t) {
  if (!XUONG_IM) { XUONG_IM = new THREE.InstancedMesh(xuongGeo(), MATV, 16); XUONG_IM.frustumCulled = false; scene.add(XUONG_IM); XUONG.forEach(x => x.obj = new THREE.Object3D()); }
  const m = new THREE.Matrix4(); let n = 0;
  XUONG.forEach((x, k) => {
    if (t < x.hien[0] || t > x.hien[1]) { x.obj.visible = false; return; }
    const L = x.lich; let p = L[L.length - 1], h = 0;
    for (let i = 0; i < L.length - 1; i++) if (t >= L[i][0] && t < L[i + 1][0]) { const u = (t - L[i][0]) / (L[i + 1][0] - L[i][0]); p = [0, lerp(L[i][1], L[i + 1][1], u), lerp(L[i][2], L[i + 1][2], u)]; h = Math.atan2(L[i + 1][1] - L[i][1], L[i + 1][2] - L[i][2]); x.h = h; break; }
    if (t < L[0][0]) p = L[0];
    x.obj.visible = true; x.obj.position.set(p[1], Math.sin(t * 1.3 + k) * 0.08, -p[2]); x.obj.rotation.set(0, -(x.h || 0), Math.sin(t + k) * 0.03); x.obj.updateMatrixWorld();
    XUONG_IM.setMatrixAt(n++, x.obj.matrixWorld);
  });
  XUONG_IM.count = n; XUONG_IM.instanceMatrix.needsUpdate = true;
}
// ---------- V1.3: làng chài Hồi 1 – dân dựng nhà, vác gỗ, đẽo gỗ, kéo thuyền (theo cách công trường làm cọc ở Bạch Đằng) ----------
// Toàn bộ là MINH HOẠ sinh hoạt làng ven biển, không theo tư liệu cụ thể.
const LANG = { on: false };
function dungLangChai() {
  const C = [-205, -1812], y0 = (x, n) => gAt(x, n);
  LANG.C = C;
  const W2 = (dx, dn) => [C[0] + dx, C[1] + dn];
  // nhà đang dựng: khung cột, xà, kèo, mái tranh lợp dở
  const g = new Ghep(), GO_ = 0x7a5534, GO_S = 0x5e4026, TRANH_ = 0xa8904e;
  const cot = [[-4, -2.5], [0, -2.5], [4, -2.5], [-4, 2.5], [0, 2.5], [4, 2.5]];
  for (const [a, b] of cot) g.tru(0.11, 0.13, 3.2, a, 1.6, b, GO_, 6);
  for (const b of [-2.5, 2.5]) g.hop(8.6, 0.18, 0.18, 0, 3.15, b, GO_S);
  for (const a of [-4, 0, 4]) { g.hop(0.16, 0.16, 5.4, a, 3.2, 0, GO_S); g.hop(0.14, 2.0, 0.14, a, 4.1, 0, GO_S);
    for (const s of [-1, 1]) g.hop(0.12, 0.12, 3.6, a, 4.0, s * 1.4, GO_S, 0, s * 0.62); }
  g.hop(8.8, 0.14, 0.14, 0, 5.05, 0, GO_S);
  for (let k = -4; k <= 4; k += 1) for (const s of [-1, 1]) g.hop(0.07, 0.07, 3.6, k, 4.0, s * 1.4, 0x8a6a44, 0, s * 0.62);
  g.hop(4.6, 0.25, 3.5, -2.1, 4.05, -1.35, TRANH_, 0, -0.62);                // mái tranh lợp dở (nửa trái, mặt trước)
  g.hop(8.8, 0.08, 5.6, 0, 0.04, 0, 0x9a8460);                                // nền đất đầm
  const nha = g.luoi(); const [hx, hn] = W2(0, 6); nha.position.set(hx, y0(hx, hn), -hn); nha.rotation.y = 0.15; scene.add(nha); LANG.nha = nha;
  // đống gỗ, thân gỗ đang đẽo, rơm, thuyền kéo lên bãi
  const g2 = new Ghep();
  for (let k = 0; k < 7; k++) g2.tru(0.16, 0.18, 6, (k % 4) * 0.36 - 0.55, 0.17 + Math.floor(k / 4) * 0.31, 0, k % 2 ? 0x7c5a38 : 0x6e4e30, 7, 0, 0, Math.PI / 2);
  const dg = g2.luoi(); const [gx, gn] = W2(-9, -4); dg.position.set(gx, y0(gx, gn), -gn); dg.rotation.y = 1.2; scene.add(dg); LANG.dongGo = dg;
  LANG.deo = [W2(-6, 4), W2(7, -3)];
  const g3 = new Ghep(); for (const [a, b] of LANG.deo.map(([x, n]) => [x - C[0], n - C[1]])) g3.tru(0.2, 0.22, 5, a, 0.22, -b, 0x7c5a38, 7, 0.4, 0, Math.PI / 2);
  const deo = g3.luoi(); deo.position.set(C[0], y0(C[0], C[1]), -C[1]); scene.add(deo); LANG.deoM = deo;
  // thuyền đánh cá trên bãi (2 chiếc nằm, 1 chiếc đang kéo lên)
  LANG.thuyen = [];
  for (const [dx, dn, r] of [[-30, 48, 0.4], [-18, 52, 0.1], [-42, 40, 0.7]]) { const m = new THREE.Mesh(thuyenChaiGeo(), MATV); const [x, n] = W2(dx, dn); m.position.set(x, Math.max(hAt(x, n), -0.2) - 0.2, -n); m.rotation.y = r; scene.add(m); LANG.thuyen.push(m); }
  LANG.keoThuyen = { A: W2(-5, 64), B: W2(-8, 50) };
  { const m = new THREE.Mesh(thuyenChaiGeo(), MATV); scene.add(m); LANG.thuyenKeo = m; }
  // giàn phơi lưới
  const g4 = new Ghep();
  for (let k = 0; k < 4; k++) { g4.tru(0.05, 0.06, 2, k * 3, 1, 0, GO_S, 5); }
  g4.hop(9.2, 0.04, 0.04, 4.5, 1.9, 0, GO_S); g4.hop(9, 1.6, 0.03, 4.5, 1.1, 0, 0x6e6a58);
  const gl = g4.luoi(); const [lx, ln] = W2(14, 14); gl.position.set(lx, y0(lx, ln), -ln); gl.rotation.y = -0.5; scene.add(gl); LANG.luoi = gl;
  // xóm: nhà tranh quanh công trường
  const L = [], R = rng(1858 + 1);
  for (let k = 0; k < 14; k++) { const a = -0.3 + k * 0.42, r = 26 + R() * 18; const x = C[0] + Math.cos(a) * r * 1.2, n = C[1] - 16 - Math.abs(Math.sin(a)) * r * 0.9; if (hAt(x, n) < 0.6) continue; L.push([x, gAt(x, n) - 0.1, -n, R() * 0.6 - 0.3 + Math.PI / 2 * (k % 2), 0.85 + R() * 0.3]); }
  LANG.xom = instDat(nhaGeoMau(), L);
  // cột đang dựng + dây kéo; gỗ đang vác
  const pg = new Ghep(); pg.tru(0.12, 0.14, 3.6, 0, 1.8, 0, GO_, 7); LANG.cotDung = new THREE.Mesh(pg.geo(), MATV); scene.add(LANG.cotDung);
  const lg = new Ghep(); lg.tru(0.13, 0.15, 4.6, 0, 0, 0, 0x7c5a38, 7, 0, 0, Math.PI / 2); LANG.goVac = new THREE.InstancedMesh(lg.geo(), MATV, 4); LANG.goVac.frustumCulled = false; scene.add(LANG.goVac);
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 2 * 3), 3));
  LANG.day = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xcdbb8c })); LANG.day.frustumCulled = false; scene.add(LANG.day);
  TRANH.push([C[0], C[1], 30]);
}
const _lm = new THREE.Object3D();
function langCapNhat(t) {
  const on = (t < TS('C03-04') || t > TS('C12-03')) && camera.position.distanceTo(new V3(LANG.C[0], 0, -LANG.C[1])) < 1500;
  for (const k of ['nha', 'dongGo', 'deoM', 'luoi', 'cotDung', 'goVac', 'day', 'thuyenKeo']) LANG[k].visible = on;
  for (const m of LANG.thuyen) m.visible = on;
  if (!on) return;
  const C = LANG.C, D = (x, n) => [x, gAt(x, n), -n];
  const T0 = (x) => x;   // giây động tác
  // 1) đẽo gỗ: hai người bổ rìu quanh mỗi thân gỗ
  LANG.deo.forEach(([x, n], g) => {
    for (let k = 0; k < 2; k++) {
      const s = k ? 1 : -1, px = x + s * 1.1, pn = n + 0.6 * s, yaw = Math.atan2(x - px, -(n - pn));
      xPut(k ? 'dannam' : 'danbinh', 'dam', t, 0.31 * k + g * 0.17, ...D(px, pn), yaw, 1, [1, 1, 1], 'riu');
    }
  });
  // 2) đóng chân cột: hai người đập búa
  for (let k = 0; k < 2; k++) { const px = C[0] + (k ? 4.6 : -4.4), pn = C[1] + 6 + (k ? 2.3 : -2.8), yaw = k ? -1.9 : 1.2; xPut('dannam', 'dam', t * 0.9, k * 0.4, ...D(px, pn), yaw, 1, [0.92, 0.9, 0.86], 'bua'); }
  // 3) vác gỗ: hai người một cây, từ đống gỗ lên công trường rồi quay lại
  const A = [C[0] - 9, C[1] - 4], B = [C[0] - 2, C[1] + 3.5];
  for (let g = 0; g < 2; g++) {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), V = 1.1, per = 2 * L / V + 4, ph = mod(t + g * per * 0.5, per) / per;
    const di = ph < 0.45, ve = ph > 0.55, u = di ? ph / 0.45 : ve ? 1 - (ph - 0.55) / 0.45 : 1;
    const dx = (B[0] - A[0]) / L, dn = (B[1] - A[1]) / L, yaw = Math.atan2(dx, -dn) + (di || !ve ? 0 : Math.PI);
    const ps = [];
    for (let k = 0; k < 2; k++) {
      const off = (k ? -1.6 : 1.6) * (ve ? -1 : 1) + (g ? 0.5 : 0), x = A[0] + dx * (u * L + off), n = A[1] + dn * (u * L + off) + (g ? 1.4 : -0.4);
      const clip = (di || !ve) ? 'vac' : 'di', ten = k ? 'dannu' : 'dannam';
      const tb = t * V / vNat(ten, clip), [px, py, pz] = D(x, n); xPut(ten, ph > 0.45 && ph < 0.55 ? 'dung' : clip, tb, k * 0.5, px, py, pz, yaw, 1, [1, 1, 1], null);
      ps.push(xHand(ten, clip, tb, k * 0.5, px, py, pz, yaw));
    }
    if (!ve) { const m = ps[0].clone().add(ps[1]).multiplyScalar(0.5); m.y -= 0.08; const d = ps[0].clone().sub(ps[1]).normalize(); _lm.position.copy(m); _lm.quaternion.setFromUnitVectors(new V3(1, 0, 0), d); _lm.scale.set(1, 1, 1); }
    else _lm.scale.set(0, 0, 0);
    _lm.updateMatrix(); LANG.goVac.setMatrixAt(g, _lm.matrix);
  }
  LANG.goVac.count = 2; LANG.goVac.instanceMatrix.needsUpdate = true;
  // 4) dựng cột: hai người kéo dây, một người đẩy, cột nghiêng dần lên rồi đứng (chu kỳ 16 s)
  { const bx = C[0] + 4.3, bn = C[1] + 9.6, P = 16, ph = mod(t, P) / P, lift = sstep(0.1, 0.75, ph), th = lerp(1.35, 0.02, lift);
    const by = gAt(bx, bn), dir = new V3(Math.sin(th), Math.cos(th), 0);
    LANG.cotDung.position.set(bx, by, -bn); LANG.cotDung.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir);
    const top = new V3(bx, by, -bn).addScaledVector(dir, 3.3), rp = LANG.day.geometry.attributes.position.array; let ri = 0;
    for (let k = 0; k < 3; k++) {
      const keo = k < 2, x = keo ? bx - 6.5 - k * 1.5 : bx + 1.2, n = bn + (keo ? (k ? 0.7 : -0.6) : 0.3), yaw = keo ? Math.PI / 2 : -Math.PI / 2;
      const [px, py, pz] = D(x, n); xPut(k === 1 ? 'dannu' : 'danbinh', keo ? 'keo' : 'day', t * (0.7 + lift * 0.5), k * 0.3, px, py, pz, yaw, 1, [1, 1, 1], null);
      if (keo) { rp[ri++] = top.x; rp[ri++] = top.y; rp[ri++] = top.z; rp[ri++] = px + 0.45; rp[ri++] = py + 1.1; rp[ri++] = pz; }
    }
    LANG.day.geometry.attributes.position.needsUpdate = true; }
  // 5) kéo thuyền lên bãi: ba người kéo dây phía trước mũi thuyền
  { const { A: a, B: b } = LANG.keoThuyen, P = 30, u = sstep(0, 0.8, mod(t, P) / P), x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u), h = Math.atan2(b[0] - a[0], b[1] - a[1]);
    LANG.thuyenKeo.position.set(x, Math.max(hAt(x, n), -0.3) - 0.15, -n); LANG.thuyenKeo.rotation.y = -h;
    for (let k = 0; k < 3; k++) { const px = x + Math.sin(h) * (6 + k * 1.3) + (k - 1) * 0.6, pn = n + Math.cos(h) * (6 + k * 1.3); xPut(k ? 'dannam' : 'danbinh', 'keo', t, k * 0.27, ...D(px, pn), Math.PI - h + Math.PI, 1, [1, 1, 1], null); } }
  // 6) phụ nữ ngồi vá lưới, người đi lại, trẻ đứng xem
  const ngoi = [[12, 11], [15, 12.5], [18, 13], [11, 15]];
  ngoi.forEach(([dx, dn], k) => xPut(k % 2 ? 'dannu' : 'dannam', 'ngoi', t, k * 0.2, ...D(C[0] + dx, C[1] + dn), -0.5 + Math.PI + k * 0.2, 1, [1, 1, 1], null));
  for (let k = 0; k < 6; k++) {
    const a = [C[0] - 40 + k * 6, C[1] + 40], b = [C[0] + 30 - k * 4, C[1] - 18 + k * 3], P = 2 * Math.hypot(b[0] - a[0], b[1] - a[1]) / (1.05 + k * 0.04), ph = mod(t / P + k * 0.37, 1);
    const u = ph < 0.5 ? ph * 2 : 2 - ph * 2, x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u), yaw = Math.atan2(b[0] - a[0], -(b[1] - a[1])) + (ph < 0.5 ? 0 : Math.PI);
    if (hAt(x, n) < 0.25) continue; const vv = 2 * Math.hypot(b[0] - a[0], b[1] - a[1]) / P, tn = k % 2 ? 'dannu' : 'dannam'; xPut(tn, 'di', t * vv / vNat(tn, 'di'), k * 0.13, ...D(x, n), yaw, 1, [1, 1, 1], k === 2 ? 'bo' : null);
  }
  for (let k = 0; k < 3; k++) xPut('dannu', k === 1 ? 'vaychao' : 'dung', t, k * 0.3, ...D(C[0] + 9 + k * 1.2, C[1] - 3 + k * 0.5), 2.6, 1, [1, 1, 1], null);
}
// ---------- máy quay theo cú máy ----------
const FOCUS = {
  'phao-dh': () => { const p = PHAO_DH(); return [p.pos.x, -p.pos.z, p.pos.y + 1.2]; },
  'lang': () => [LANG.C[0], LANG.C[1] + 5, gAt(LANG.C[0], LANG.C[1] + 5) + 1.4],
  'gac': () => { const v = VT['hai-van']; return [v.x + 22, v.n - 14, gAt(v.x + 22, v.n - 14) + 1.5]; },
  'ngua': () => [NGUA.position.x, -NGUA.position.z, NGUA.position.y + 2],
  'luy-cl': () => [-900, -8080, gAt(-900, -8080) + 2],
  'luy': () => [-500, -3492, gAt(-500, -3492) + 1.6],
};
function diemNhin(T, t, k) {
  if (typeof T === 'string') {
    if (T.startsWith('tau:')) { const g = TAU[+T.slice(4)]; return [g.userData.x, g.userData.n, 0]; }
    if (T === 'ham-doi') { let x = 0, n = 0, c = 0; for (const g of TAU) if (g.visible && Math.hypot(g.userData.x, g.userData.n) < 20000) { x += g.userData.x; n += g.userData.n; c++; } return c ? [x / c, n / c, 0] : [-1500, 4000, 0]; }
    if (T === 'do-bo') { let x = 0, n = 0, c = 0; for (const s of XUONG.slice(0, 10)) if (s.obj && s.obj.visible) { x += s.obj.position.x; n += -s.obj.position.z; c++; } return c ? [x / c, n / c, 0] : [VT['bai-st'].x, VT['bai-st'].n, 0]; }
    if (T === 'ban-ntp') return [430, -5420, gAt(430, -5420) + 0.9];
    if (T === 'dao-luy') return [-900, -3440, gAt(-900, -3440) + 1];
    if (T === 'cong-phap') { const o = NHOM.find(o => o.id === 'cong-phap'); const s = viTriNhom(o, t); return [s.x, s.n, gAt(s.x, s.n) + 1.5]; }
    if (T === 'vien-binh') { const o = NHOM.find(o => o.id === 'vien-binh'); const s = viTriNhom(o, t); return [s.x, s.n, gAt(s.x, s.n) + 1.5]; }
    if (NV[T]) { const s = viTriNhom(NV[T], t); return [s.x, s.n, gAt(s.x, s.n) + 1.4]; }
  }
  return T;
}
function giaiKhoa(K, t) {
  let T = K.f && FOCUS[K.f] ? FOCUS[K.f]() : diemNhin(K.T, t);
  T = [T[0], T[1], T[2] != null ? T[2] : 0];
  if (typeof K.T === 'string' && K.T.startsWith('tau:')) {
    const g = TAU[+K.T.slice(4)], l = K.lech || [0, 0];
    const w = g.localToWorld(new V3(l[0], K.dy || 0, -(l[1] || 0)));
    T = [w.x, -w.z, w.y];
  } else if (K.lech) { T = [T[0] + K.lech[0], T[1] + K.lech[1], T[2]]; }
  const laTau = typeof K.T === 'string' && K.T.startsWith('tau:');
  if (T[2] === 0) T[2] = gAt(T[0], T[1]) + (K.dy != null ? 0 : Math.min(K.d * 0.02, 40));
  if (!laTau && K.dy) T[2] += K.dy;
  return { T, d: K.d, az: K.az, el: K.el, nhin: K.nhin, fov: K.fov || 50 };
}
const ease = (k) => k * k * (3 - 2 * k) * 0.6 + k * 0.4;
function mayQuay(t) {
  let sc = ST.scenes.find(s => t >= s.t0 && t < s.t1) || ST.scenes[ST.scenes.length - 1];
  let sh = sc.shots.find(s => t >= s.t0 && t < s.t1) || sc.shots[sc.shots.length - 1];
  const k = ease(clamp((t - sh.t0) / (sh.t1 - sh.t0), 0, 1));
  const A = giaiKhoa(sh.a, t), B = giaiKhoa(sh.b, t);
  const T = [lerp(A.T[0], B.T[0], k), lerp(A.T[1], B.T[1], k), lerp(A.T[2], B.T[2], k)];
  const d = Math.exp(lerp(Math.log(A.d), Math.log(B.d), k));
  let daz = B.az - A.az; if (daz > 180) daz -= 360; if (daz < -180) daz += 360;
  const az = (A.az + daz * k) * D2R, el = lerp(A.el, B.el, k) * D2R;
  let cx = T[0] + Math.sin(az) * Math.cos(el) * d, cn = T[1] + Math.cos(az) * Math.cos(el) * d, cy = T[2] + Math.sin(el) * d;
  const san = Math.max(gAt(cx, cn), hAt(cx + 3, cn), hAt(cx - 3, cn), hAt(cx, cn + 3), hAt(cx, cn - 3), 0) + 1.6;
  if (cy < san) cy = san;
  camera.position.set(cx, cy, -cn);
  let L = T; if (A.nhin || B.nhin) { const a = A.nhin || T, b = B.nhin || T; L = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2] ?? 0, b[2] ?? 0, k)]; if (!L[2]) L[2] = gAt(L[0], L[1]); }
  camera.lookAt(L[0], L[2], -L[1]);
  const fov = lerp(A.fov, B.fov, k); if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; }
  return { sc, sh };
}
function matCat() {
  // mặt cắt gần/xa theo độ cao máy (bài học 5)
  const y = Math.max(camera.position.y - Math.max(gAt(camera.position.x, -camera.position.z), 0), 1);
  camera.near = clamp(y * 0.08, 0.15, 60); camera.far = clamp(y * 60 + 30000, 30000, 260000); camera.updateProjectionMatrix();
}

// ---------- trời theo hồi ----------
const TROI = {
  sang: { sun: [-0.45, 0.62, 0.4], sc: 0xfff1dc, si: 2.3, hi: 1.05, top: 0x3f78b8, hor: 0xc6d6e2, fog: 0xbfcfdc, exp: 1.0, cl: 0.35, dark: 0 },
  chieu: { sun: [-0.8, 0.25, 0.2], sc: 0xffc98a, si: 2.0, hi: 0.85, top: 0x4f78a8, hor: 0xe8c9a0, fog: 0xd8c4a8, exp: 1.0, cl: 0.4, dark: 0 },
  dem: { sun: [0.3, 0.5, -0.4], sc: 0x9fb8e8, si: 0.7, hi: 0.45, top: 0x0f1a30, hor: 0x2a3a58, fog: 0x22304a, exp: 1.25, cl: 0.25, dark: 0.45 },
  binhminh: { sun: [0.85, 0.12, 0.2], sc: 0xffb07a, si: 1.6, hi: 0.7, top: 0x4a6a9a, hor: 0xf0b890, fog: 0xd8b8a0, exp: 1.0, cl: 0.4, dark: 0.05 },
  mua: { sun: [-0.3, 0.7, 0.3], sc: 0xc8ccd0, si: 0.7, hi: 1.0, top: 0x6a7480, hor: 0x9aa4ac, fog: 0x8e989f, exp: 0.95, cl: 0.95, dark: 0.15 },
  hoanghon: { sun: [-0.85, 0.1, 0.1], sc: 0xffa060, si: 2.0, hi: 0.7, top: 0x3a5a8a, hor: 0xf0a878, fog: 0xd89c7c, exp: 1.05, cl: 0.45, dark: 0 },
};
let LICH_TROI = [];
function lapLichTroi() {
  LICH_TROI = [[0, 'sang'], [SC.C03.t0, 'sang'], [SC.C03.t0 + 6, 'chieu'], [TC('C03', 9) - 1, 'chieu'], [TC('C03', 9) + 3, 'dem'], [SC.C04.t0 - 0.5, 'dem'], [SC.C04.t0 + 0.5, 'binhminh'], [TC('C04', 3), 'binhminh'], [TC('C04', 6), 'sang'],
    [SC.C10.t0 - 0.5, 'sang'], [SC.C10.t0 + 0.5, 'mua'], [SC.C10.t1 - 0.5, 'mua'], [SC.C10.t1 + 0.5, 'sang'], [TC('C12', 9) - 2, 'sang'], [TC('C12', 9) + 6, 'hoanghon'], [1e9, 'hoanghon']];
}
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function troiCapNhat(t) {
  let a = LICH_TROI[0], b = a;
  for (let i = 0; i < LICH_TROI.length - 1; i++) if (t >= LICH_TROI[i][0] && t < LICH_TROI[i + 1][0]) { a = LICH_TROI[i]; b = LICH_TROI[i + 1]; break; }
  const k = sstep(a[0], b[0], t), A = TROI[a[1]], B = TROI[b[1]];
  const mix = (x, y) => lerp(x, y, k), mc = (x, y, out) => out.set(x).lerp(_c2.set(y), k);
  SUN.set(mix(A.sun[0], B.sun[0]), mix(A.sun[1], B.sun[1]), mix(A.sun[2], B.sun[2])).normalize();
  sun.position.copy(SUN).multiplyScalar(10000).add(camera.position); sun.target.position.copy(camera.position);
  mc(A.sc, B.sc, sun.color); sun.intensity = mix(A.si, B.si); hemi.intensity = mix(A.hi, B.hi);
  mc(A.top, B.top, skyU.top.value); mc(A.hor, B.hor, skyU.hor.value); skyU.sunDir.value.copy(SUN); skyU.cloud.value = mix(A.cl, B.cl);
  skyU.sunCol.value.copy(sun.color).multiplyScalar(mix(A.si, B.si) > 1 ? 1 : 0.4);
  mc(A.fog, B.fog, scene.fog.color);
  const camY = camera.position.y; scene.fog.near = 3000 + camY * 2; scene.fog.far = 45000 + camY * 6;
  if (a[1] === 'mua' || b[1] === 'mua') { scene.fog.near *= 0.25; scene.fog.far *= 0.35; }
  renderer.toneMappingExposure = mix(A.exp, B.exp);
  waterU.skyC.value.copy(skyU.hor.value); waterU.topC.value.copy(skyU.top.value); waterU.sunDir.value.copy(SUN); waterU.fogC.value.copy(scene.fog.color);
  waterU.fogN.value = scene.fog.near; waterU.fogF.value = scene.fog.far; waterU.sunK.value = mix(A.si, B.si) / 2.3; waterU.dark.value = mix(A.dark, B.dark);
  const mua = (a[1] === 'mua' ? 1 - k : 0) + (b[1] === 'mua' ? k : 0); waterU.rain.value = mua;
  for (const H of [KHOI, LUA]) { H.u.fogC.value.copy(scene.fog.color); H.u.fogN.value = scene.fog.near; H.u.fogF.value = scene.fog.far; H.u.scale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * D2R / 2)); }
  KHOI.u.light.value = clamp(hemi.intensity * 0.9 + 0.1, 0.25, 1.05);
  return mua;
}

// ---------- nhãn, ghim ----------
const NHAN = [];
function nhan(ten, pos, loai, hien) { const el = document.createElement('div'); el.className = 'ghim ' + loai; el.innerHTML = '<b></b><span>' + ten + '</span>'; $('#nhan').appendChild(el); NHAN.push({ el, pos, loai, hien }); }
function nhanCapNhat(t, bat, coDo) {
  const w = cv.clientWidth, h = cv.clientHeight, v = new V3(), camH = camera.position.y;
  for (const L of NHAN) {
    let on = (bat || L.bt || L.luon) && L.hien(t); if (BT.on && !L.bt) on = false;
    if (on) {
      const p = typeof L.pos === 'function' ? L.pos(t) : L.pos; if (!p) { L.el.style.display = 'none'; continue; }
      v.copy(p); const dist = v.distanceTo(camera.position);
      if (L.loai === 'moc' && (camH < 250 || dist > 26000)) on = false;
      if (L.loai === 'nv' && dist > 90) on = false; if (L.loai === 'moc' && t > TS('C02-01') && t < TE('C02-01')) on = false; if (L.loai === 'bt' && DI.on && dist > 18) on = false;
      if (L.loai === 'tau' && (dist > 2500 || dist < 40)) on = false;
      if (on) { v.project(camera); if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05) on = false; }
      if (on) { L.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px,${(-v.y * 0.5 + 0.5) * h}px)`; }
    }
    L.el.style.display = on ? 'block' : 'none';
  }
}
function dungNhan() {
  const P = (k, dy = 30) => () => { const v = VT[k]; return new V3(v.x, gAt(v.x, v.n) + dy, -v.n); };
  const luon = () => true;
  for (const k of ['dien-hai', 'an-hai', 'hai-van', 'son-tra-tay', 'trai-phap', 'nghia-dia', 'tien-don', 'chon-sang', 'dinh-hai', 'thanh-khe', 'cam-le']) {
    const ten = VT[k].ten + (VT[k].ghi && VT[k].ghi.startsWith('ƯỚC') ? ' ·' : '');
    const hien = k === 'trai-phap' || k === 'nghia-dia' || k === 'tien-don' ? (t) => t > TS('C05-01') && t < SC.C12.t0 + 20 : luon;
    nhan(ten, P(k), 'moc', hien);
  }
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) nhan(VT[k].ten, P(k), 'moc', (t) => t > SC.C07.t0);
  nhan('Đèo Hải Vân', () => W(-9500, 12500, 120), 'moc', luon);
  nhan('Bán đảo Sơn Trà', () => W(6400, 3600, 60), 'moc', luon);
  nhan('Vịnh Đà Nẵng', () => new V3(-3500, 30, -5500), 'moc', luon);
  nhan('Sông Hàn', () => new V3(1760, 20, 2600), 'moc', luon);
  nhan('Biển Đông', () => new V3(9000, 30, -9000), 'moc', luon);
  nhan('Hướng ra Huế', () => W(-13000, 14500, 80), 'moc', luon);
  for (const [id, o] of Object.entries(NV)) nhan(o.ten, (t) => o._pos ? o._pos.clone().add(new V3(0, 0.9, 0)) : null, 'nv', (t) => t >= o.hien[0] && t <= o.hien[1]);
  nhan('Kỳ hạm liên quân', () => TAU[0].visible ? TAU[0].position.clone().add(new V3(0, 48, 0)) : null, 'tau', luon);
  nhan('Tàu Tây Ban Nha', () => TAU[8].visible ? TAU[8].position.clone().add(new V3(0, 38, 0)) : null, 'tau', luon);
}

// ---------- mũi tên (một khối liền, trắng, độ đục 0,9) ----------
const MUI = [];
function muiTen(pts, cao, t0, t1, hien, mau = 0xffffff, r = 40) {
  const P = pts.map(([x, n, y]) => new V3(x, y != null ? y : cao, -n)), cur = new THREE.CatmullRomCurve3(P, false, 'centripetal');
  const N = 80, path = cur.getSpacedPoints(N), L = cur.getLength(), dau = Math.min(r * 5, L * 0.25);
  const v = [], idx = []; const ring = 8;
  for (let i = 0; i <= N; i++) {
    const p = path[i], tg = cur.getTangentAt(i / N), s = i / N * L, rr = s > L - dau ? 0 : r;
    const nn = new V3(-tg.z, 0, tg.x).normalize(), up = new V3(0, 1, 0);
    for (let k = 0; k < ring; k++) { const a = k / ring * 6.283; v.push(p.x + (nn.x * Math.cos(a)) * rr, p.y + Math.sin(a) * rr * 0.5, p.z + nn.z * Math.cos(a) * rr); }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < ring; k++) { const a = i * ring + k, b = i * ring + (k + 1) % ring, c = a + ring, d = b + ring; idx.push(a, c, b, b, c, d); }
  // đầu mũi dẹt
  const iT = Math.floor(N * (1 - dau / L)), pT = path[iT], tgT = cur.getTangentAt(iT / N), nT = new V3(-tgT.z, 0, tgT.x).normalize(), tip = path[N];
  const b0 = v.length / 3;
  v.push(pT.x + nT.x * r * 2.6, pT.y, pT.z + nT.z * r * 2.6, pT.x - nT.x * r * 2.6, pT.y, pT.z - nT.z * r * 2.6, tip.x, tip.y, tip.z, pT.x, pT.y + r * 0.6, pT.z);
  idx.push(b0, b0 + 1, b0 + 2, b0, b0 + 3, b0 + 2, b0 + 1, b0 + 3, b0 + 2);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: mau, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.renderOrder = 8; scene.add(m);
  const o = { m, t0, t1, hien, nIdx: idx.length, nTube: N * ring * 6 }; MUI.push(o); return o;
}
function muiCapNhat(t) {
  for (const o of MUI) {
    const on = t >= o.hien[0] && t <= o.hien[1]; o.m.visible = on; if (!on) continue;
    const k = clamp((t - o.t0) / (o.t1 - o.t0), 0, 1);
    o.m.geometry.setDrawRange(0, k >= 1 ? o.nIdx : Math.floor(o.nTube * k / 6) * 6);
    o.m.material.opacity = 0.9 * sstep(o.hien[0], o.hien[0] + 0.6, t) * (1 - sstep(o.hien[1] - 0.6, o.hien[1], t));
  }
}
// vùng liên quân chiếm đóng (phủ đỏ mờ trên đất) và dấu X đồn mất
let VUNG = null; const DAU_X = [];
function dungVung() {
  const poly = [[-300, 3300], [2700, 3500], [3900, 900], [3000, -2700], [1300, -2700], [500, -2200], [600, -600], [-100, 700]];
  const shape = new THREE.Shape(poly.map(([x, n]) => new THREE.Vector2(x, n)));
  const g = new THREE.ShapeGeometry(shape, 1); const tri = g.toNonIndexed();
  // chia nhỏ để bám đất
  let geo = tri; for (let k = 0; k < 5; k++) geo = chiaTamGiac(geo);
  const p = geo.attributes.position; const out = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), n = p.getY(i); out.push(x, Math.max(hAt(x, n), 0) + 12, -n); }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  VUNG = new THREE.Mesh(G, new THREE.MeshBasicMaterial({ color: 0xd0302a, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  VUNG.renderOrder = 6; scene.add(VUNG);
  const dv = []; const pc = [...poly, poly[0]];
  for (let i = 0; i < pc.length - 1; i++) { const [a, b] = pc[i], [c, d] = pc[i + 1], L = Math.hypot(c - a, d - b); for (let s = 0; s < L; s += 120) { const x = a + (c - a) * s / L, n = b + (d - b) * s / L; dv.push([x, n, Math.max(hAt(x, n), 0) + 14]); } }
  dv.push([pc[0][0], pc[0][1], Math.max(hAt(pc[0][0], pc[0][1]), 0) + 14]);
  const vien = muiTen(dv, 0, 0, 0, [-1, -1], 0xff5040, 10); // viền dùng ống mảnh (không đầu mũi)
  vien.m.geometry.setDrawRange(0, vien.nTube); vien.vien = true; VUNG.userData.vien = vien;
  for (const k of ['dien-hai', 'an-hai', 'son-tra-tay']) {
    const v = VT[k], gx = new THREE.Group();
    for (const s of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(420, 30, 60), new THREE.MeshBasicMaterial({ color: 0xff3a30, transparent: true, opacity: 0.9, fog: false, depthWrite: false })); b.rotation.y = s * Math.PI / 4; gx.add(b); }
    gx.position.set(v.x, 260, -v.n); gx.renderOrder = 9; scene.add(gx); DAU_X.push(gx);
  }
}
function chiaTamGiac(g) {
  const p = g.attributes.position, o = [];
  for (let i = 0; i < p.count; i += 3) {
    const a = [p.getX(i), p.getY(i)], b = [p.getX(i + 1), p.getY(i + 1)], c = [p.getX(i + 2), p.getY(i + 2)];
    const ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2], ca = [(c[0] + a[0]) / 2, (c[1] + a[1]) / 2];
    for (const T of [[a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]]) for (const q of T) o.push(q[0], q[1], 0);
  }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(o, 3)); return G;
}
// ---------- V1.3: Bảo tàng vật dụng, binh khí thời kỳ 1858 (sân trưng bày + nhà trưng bày) ----------
// Mẫu 3D là MINH HOẠ (dựng theo ảnh anh gửi); thông số trên thẻ ghi theo nguồn dẫn kèm.
const BT = { M: [-4900, -2900], grp: null, on: false, tCu: 0, camCu: null, items: [], chon: -1, bay: null, nhan: [], va: [], tg: 0 };
const BT_NGUON = {
  vnp: ['TTXVN/VietnamPlus – Đà Nẵng: phát hiện súng thần công cổ tại Thành Điện Hải', 'https://www.vietnamplus.vn/da-nang-phat-hien-sung-than-cong-co-tai-thanh-dien-hai-post1143356.vnp'],
  sggp: ['SGGP – Đà Nẵng tìm giải pháp phát huy giá trị di tích thành Điện Hải', 'https://www.sggp.org.vn/da-nang-tim-giai-phap-phat-huy-gia-tri-di-tich-thanh-dien-hai-post460362.html'],
  vtc: ['VTC News – Vị vua nào trong sử Việt có tài bắn súng bách phát bách trúng (dẫn Việt sử khảo luận)', 'https://www.vtcnews.vn/vi-vua-nao-trong-su-viet-co-tai-ban-sung-bach-phat-bach-trung-ar915195.html'],
  hl: ['Holylandvietnamstudies – Soldiers and Guns (súng hỏa mai, điểu thương)', 'https://holylandvietnamstudies.com/blog/solders-and-guns/'],
  lef: ['Wikipedia – Lefaucheux M1858', 'https://en.wikipedia.org/wiki/Lefaucheux_M1858'],
  m57: ['Drouot – Percussion rifle model 1857 of navy (thông số hiện vật đấu giá)', 'https://drouot.com/en/l/18161660-perkussionsgewehr-modell-1857'],
  min: ['Victorian Web – The Minié rifle', 'https://victorianweb.org/history/crimea/minie.html'],
  tour: ['Wikipedia – Siege of Tourane', 'https://en.wikipedia.org/wiki/Siege_of_Tourane'],
  cb: ['Cục Văn thư và Lưu trữ Nhà nước – Châu bản triều Nguyễn về cuộc kháng chiến tại Đà Nẵng', 'https://archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/chau-ban-trieu-nguyen-ve-cuoc-khang-chien-chong-lien-quan-phap-tay-ban-nha-tai-da-nang-nhung-ngay-dau.htm'],
  ddk: ['Đại Đoàn Kết – Nơi lưu dấu danh tướng Nguyễn Tri Phương đón nhận bằng di tích quốc gia đặc biệt', 'https://daidoanket.vn/noi-luu-dau-danh-tuong-nguyen-tri-phuong-don-nhan-bang-di-tich-quoc-gia-dac-biet-10098779.html'],
  vp: ['Vinpearl – Thành Điện Hải, kiến trúc quân sự trăm tuổi', 'https://vinpearl.com/vi/thanh-dien-hai-kien-truc-quan-su-tram-tuoi-o-da-nang-co-gi-dac-biet'],
  bpl: ['Báo Pháp luật – Lịch sử rất gần (đài Điện Hải, bảo An Hải năm 1813)', 'https://baophapluat.vn/lich-su-rat-gan-post82365.html'],
  bt: ['Bảo tàng Lịch sử Quốc gia – Liên quân Pháp – Tây Ban Nha nổ súng đánh thành Đà Nẵng (9/1858)', 'https://baotanglichsuquocgia.vn/vi/Articles/2002/68063/lien-quan-phap-tay-ban-nha-no-sung-djanh-thanh-dja-nang-mo-djau-cuoc-xam-luoc-viet-nam-lan-thu-nhat-9-1858.html'],
};
const BT_DS = [
  { id: 'thancong', ten: 'Súng thần công', phe: 'Quân triều Nguyễn', p: [-9, -3.5], bang: [-11.6, -1.6, 0.5],
    mo: 'Đại bác đặt trên các thành, đồn ven vịnh Đà Nẵng. Theo Bảo tàng Đà Nẵng, súng thần công có cấu tạo gồm nòng, thân, khối hậu và lỗ điểm hỏa; hai bên thân có trục quay để gắn vào bệ, chỉnh hướng và góc bắn. Bảo tàng hiện lưu giữ 14 khẩu: 13 khẩu gang – sắt tìm thấy ở khu vực Thành Điện Hải và hệ thống phòng thủ Đà Nẵng, 1 khẩu đồng tìm thấy ở Xuân Thiều.',
    so: ['Chất liệu: gang – sắt (13 khẩu), đồng (1 khẩu)', 'Bộ phận: nòng, thân, khối hậu, lỗ điểm hỏa, trục quay'], minh: 'Mẫu 3D trên bệ gỗ có bánh là MINH HOẠ theo mẫu anh gửi.', ng: ['vnp', 'sggp'] },
  { id: 'thancong2', ten: 'Súng thần công', phe: 'Quân triều Nguyễn', p: [9, -3.5], bang: [11.6, -1.6, -0.5], an: true, nhu: 0 },
  { id: 'dieuthuong', ten: 'Súng điểu thương', phe: 'Quân triều Nguyễn', p: [-14, -13], bang: [-12.1, -11.9, 0],
    mo: 'Súng tay của bộ binh nhà Nguyễn. Theo sách Việt sử khảo luận (VTC News dẫn), điểu thương là súng cò đá lửa, bắn xa khoảng 250 đến 300 thước. Tên gọi đến từ nòng dài lắp mũi nhọn như ngọn giáo (thương) và chiếc cò đánh lửa trông như đầu chim (điểu). Dân gian còn gọi chung súng tay là súng hỏa mai.',
    so: ['Cách bắn: nạp đầu nòng, cò đá lửa', 'Tầm bắn: khoảng 250 – 300 thước (Việt sử khảo luận)'], minh: 'Mẫu dựng theo ảnh hiện vật anh gửi (ảnh 3).', ng: ['vtc', 'hl'] },
  { id: 'sungtruong', ten: 'Súng trường hạt nổ của quân Pháp', phe: 'Liên quân Pháp – Tây Ban Nha', p: [-7, -13], bang: [-5.1, -11.9, 0],
    mo: 'Giữa thế kỷ XIX, bộ binh Pháp dùng súng trường nạp đầu nòng, gây hỏa bằng hạt nổ (percussion), nòng có rãnh xoắn bắn đạn Minié. Ví dụ một khẩu kiểu 1857 của hải quân Pháp còn lưu lại có nòng dài 103 cm, toàn súng dài 141 cm. Nòng có rãnh xoắn giúp bắn xa và chính xác hơn hẳn súng nòng trơn cò đá lửa.',
    so: ['Kiểu: nạp đầu nòng, hạt nổ, nòng xoắn', 'Ví dụ kiểu 1857 hải quân: nòng 103 cm, dài 141 cm'], minh: 'Mẫu dựng theo ảnh anh gửi (ảnh 1); không khẳng định đúng kiểu súng của từng đơn vị đổ bộ năm 1858.', ng: ['m57', 'min'] },
  { id: 'sungngan', ten: 'Súng ngắn ổ quay Lefaucheux M1858', phe: 'Hải quân Pháp', p: [7, -13], bang: [8.9, -11.9, 0],
    mo: 'Hải quân Pháp nhận khẩu Lefaucheux kiểu 1858 sau ba năm thử nghiệm, vì cần loại súng chịu được ẩm ướt trên biển cho các đội đổ bộ. Đây là khẩu súng ổ quay dùng đạn có vỏ kim loại đầu tiên được một quân đội chính thức trang bị.',
    so: ['Ổ đạn: 6 viên, đạn kim hỏa 12 mm', 'Dài: 280 mm · nặng khoảng 980 g'], minh: 'Mẫu dựng theo ảnh anh gửi (ảnh 2), phóng to 2 lần trên bệ để dễ nhìn.', ng: ['lef'] },
  { id: 'binhkhi', ten: 'Gươm và giáo', phe: 'Quân triều Nguyễn, dân binh', p: [14, -13], bang: [15.9, -11.9, 0],
    mo: 'Bên cạnh súng, quân triều Nguyễn và dân binh địa phương vẫn dùng nhiều binh khí lạnh như gươm, giáo. Trong sa bàn, giáo được trao cho dân binh, gươm cho các chỉ huy.',
    so: ['Gươm: lưỡi thẳng, chuôi bọc đồng', 'Giáo: cán gỗ khoảng 2,5 m, mũi sắt'], minh: 'Hình dáng MINH HOẠ, chưa đối chiếu hiện vật cụ thể.', ng: [] },
  { id: 'tau', ten: 'Tàu hơi nước bánh guồng', phe: 'Hạm đội liên quân', p: [0, 6], bang: [4.6, 8.0, 0],
    mo: 'Kỳ hạm của Rigault de Genouilly là khinh hạm chân vịt Némésis 50 súng. Đi cùng có hai hộ tống hạm Primauguet, Phlégéton, các pháo hạm hơi nước Alarme, Avalanche, Dragonne, Fusée, Mitraille, các tàu vận tải và tàu Tây Ban Nha El Caño. Châu bản triều Nguyễn ghi ngày 31/8/1858 có 12 thuyền buồm và tàu máy đến cửa biển Đà Nẵng.',
    so: ['Kỳ hạm: Némésis (khinh hạm, 50 súng)', 'Tây Ban Nha: tàu El Caño'], minh: 'Mẫu tàu bánh guồng trên bệ là MINH HOẠ theo mẫu anh gửi, tỉ lệ khoảng 1:12.', ng: ['tour', 'cb'] },
  { id: 'linhnguyen', ten: 'Lính triều Nguyễn', phe: 'Quân triều Nguyễn', p: [-17, -17.6], bang: [-15.3, -16.5, 0],
    mo: 'Quân giữ thành Điện Hải, An Hải và các đồn lũy ven vịnh. Trong sa bàn, lính mặc áo nẹp đỏ, đội nón, cầm súng điểu thương.',
    so: [], minh: 'Quân phục MINH HOẠ theo mẫu anh gửi, cần đối chiếu tư liệu.', ng: ['bt'] },
  { id: 'linhphap', ten: 'Lính thủy đánh bộ Pháp', phe: 'Liên quân Pháp – Tây Ban Nha', p: [17, -17.6], bang: [15.3, -16.5, 0],
    mo: 'Lực lượng đổ bộ của liên quân gồm khoảng 1.000 lính thủy đánh bộ Pháp và 550 lính Tây Ban Nha (từ Philippines).',
    so: ['Pháp: khoảng 1.000 lính thủy đánh bộ', 'Tây Ban Nha: khoảng 550 lính'], minh: 'Quân phục MINH HOẠ theo mẫu anh gửi.', ng: ['tour'] },
  { id: 'danbinh', ten: 'Dân binh', phe: 'Nhân dân Quảng Nam – Đà Nẵng', p: [-9, -18], bang: [-7.3, -16.9, 0],
    mo: 'Dân binh cùng quân triều đình đắp lũy, đào hào, cắm chông, chở tre gỗ và giữ các đoạn lũy dọc tuyến Liên Trì – Thạc Gián – Nại Hiên.',
    so: [], minh: 'Nhân vật MINH HOẠ (mẫu lấy từ sa bàn Bạch Đằng).', ng: ['bt'] },
  { id: 'ntp', ten: 'Nguyễn Tri Phương', phe: 'Tổng chỉ huy quân thứ Quảng Nam', p: [0, -17.8], bang: [2.3, -16.5, 0],
    mo: 'Triều đình cử Nguyễn Tri Phương vào Đà Nẵng chỉ huy kháng chiến. Ông cho đắp hệ thống đồn lũy, thực hiện kế sách “vườn không nhà trống”, chặn bước tiến của liên quân trên bộ.',
    so: [], minh: 'Tượng MINH HOẠ, dựng từ mẫu 3D anh gửi; động tác làm trong Blender.', ng: ['tour', 'bt'] },
  { id: 'mh-dienhai', ten: 'Mô hình thành Điện Hải', phe: 'Công trình phòng thủ triều Nguyễn', p: [-20, 7], bang: [-20, 12.0, 0],
    mo: 'Năm 1813 đời Gia Long, triều đình cho đắp đồn Điện Hải ở gần mép nước tả ngạn sông Hàn. Năm 1823, vua Minh Mạng cho dời vào xây kiên cố bằng gạch ở vị trí hiện nay, bố trí 30 khẩu đại bác cỡ lớn; năm 1835 đổi tên là Thành Điện Hải. Thành xây theo lối Vauban, có góc lồi, cổng chính ở phía Nam, cổng phụ ở phía Đông, bao quanh là hào nước.',
    so: ['Tường cao hơn 5 m, chu vi hơn 556 m', 'Hào nước bao quanh sâu khoảng 3 m', 'Người Pháp gọi là Pháo đài phía Tây (Fort de l’Ouest)'], minh: 'Mô hình thu nhỏ dựng từ chính thành trong sa bàn; hình dạng, số pháo là MINH HOẠ.', ng: ['ddk', 'vp'] },
  { id: 'mh-anhai', ten: 'Mô hình thành An Hải', phe: 'Công trình phòng thủ triều Nguyễn', p: [20, 7], bang: [20, 12.0, 0],
    mo: 'Cùng năm 1813, triều đình sai Nguyễn Văn Thành đắp đài Điện Hải và bảo An Hải ở hai bên cửa sông Hàn để kiểm soát tàu thuyền ra vào. Thành An Hải nằm ở bờ Đông, đối diện Điện Hải, là một trong hai thành bị liên quân đánh chiếm ngay trong ngày đầu nổ súng 1/9/1858.',
    so: ['Vị trí: bờ Đông sông Hàn, đối diện thành Điện Hải', 'Xây dựng: 1813, thời Gia Long'], minh: 'Mô hình thu nhỏ dựng từ chính thành trong sa bàn; hình dạng là MINH HOẠ, chưa có bản vẽ đo đạc gốc.', ng: ['bpl', 'tour'] },
];

// ---------- V1.4: ngói vẩy cá ----------
function vayCaTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const k = c.getContext('2d');
  k.fillStyle = '#5c2416'; k.fillRect(0, 0, 256, 256);
  const R = rng(11), r = 32;      // 4 viên mỗi hàng, 8 hàng (mỗi hàng lệch nửa viên)
  for (let row = -1; row < 9; row++) for (let col = -1; col < 5; col++) {
    const x = col * 64 + (row % 2 ? 32 : 0) + 32, y = row * 32;
    const v = 0.85 + R() * 0.3, g = k.createRadialGradient(x, y - 6, 4, x, y, r + 2);
    g.addColorStop(0, `rgb(${178 * v | 0},${86 * v | 0},${52 * v | 0})`); g.addColorStop(0.8, `rgb(${150 * v | 0},${66 * v | 0},${40 * v | 0})`); g.addColorStop(1, '#3e170d');
    k.fillStyle = g; k.beginPath(); k.moveTo(x - r, y - 16); k.lineTo(x - r, y); k.arc(x, y, r, Math.PI, 0, true); k.lineTo(x + r, y - 16); k.closePath(); k.fill();
    k.strokeStyle = 'rgba(40,14,8,.55)'; k.lineWidth = 2; k.beginPath(); k.arc(x, y, r - 1, Math.PI * 0.05, Math.PI * 0.95); k.stroke();
    if (R() < 0.25) { k.fillStyle = 'rgba(60,70,40,.18)'; k.beginPath(); k.arc(x + (R() - 0.5) * 20, y + 10, 8 + R() * 10, 0, 6.3); k.fill(); }   // rêu
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
let VAY_TEX = null;
// mái hai dốc lợp ngói vẩy cá: dài L (trục x), sâu B, cao H, chìa e; nóc có bờ nóc và hai đầu đao cong
function maiVay(grp, L, B, H, x, y, z, e = 1.2, ry = 0) {
  VAY_TEX = VAY_TEX || vayCaTex();
  const a = L / 2 + e, b = B / 2 + e, slope = Math.hypot(b, H), O = 0.9;   // 1 ô vân = 0.9 m
  const v = [], uv = [], idx = [];
  const mat = new THREE.MeshLambertMaterial({ map: VAY_TEX, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {   // s = -1 dốc phía Bắc, +1 dốc phía Nam
    const i0 = v.length / 3;
    const N = 6;   // chia dốc thành N đoạn hơi võng (mái cong)
    for (let j = 0; j <= N; j++) {
      const u = j / N, zz = s * b * (1 - u), yy = H * u - Math.sin(u * Math.PI) * H * 0.08 + (1 - u) * (1 - u) * 0.25;
      for (const xx of [-a, a]) { v.push(xx, yy, zz); uv.push(xx / O, (1 - u) * slope / O); }
    }
    for (let j = 0; j < N; j++) { const p = i0 + j * 2; if (s < 0) idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); else idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.rotation.y = ry; grp.add(m);
  // bờ nóc, đầu đao, hai đầu hồi
  const gh = new Ghep(), NOC = 0x6e2c1a, VOI = 0xe8e0cc, q = clamp(Math.min(L, B) / 12, 0.22, 1);
  gh.hop(2 * a + 0.2 * q, 0.32 * q, 0.5 * q, 0, H + 0.12 * q, 0, NOC); gh.hop(2 * a, 0.08 * q, 0.56 * q, 0, H + 0.3 * q, 0, VOI);
  for (const sx of [-1, 1]) { gh.hop(0.5 * q, 0.9 * q, 0.4 * q, sx * (a + 0.05 * q), H + 0.5 * q, 0, NOC, 0, 0, sx * 0.35); gh.hop(0.3 * q, 0.5 * q, 0.3 * q, sx * (a + 0.32 * q), H + 0.98 * q, 0, NOC, 0, 0, sx * 0.7); }
  for (const s of [-1, 1]) for (const sx of [-1, 1]) gh.hop(0.35 * q, 0.3 * q, 0.6 * q, sx * (a - 0.1 * q), 0.35 * q, s * (b - 0.1 * q), NOC, 0, s * 0.3, sx * 0.4);   // góc đao
  const hm = gh.luoi(); hm.position.set(x, y, z); hm.rotation.y = ry; grp.add(hm);
  return m;
}
// ---------- bảng thông tin trước mỗi hiện vật ----------
function veChu(k, text, x, y, w, lh, maxL) {
  const tu = text.split(' '); let dong = '', n = 0;
  for (const t of tu) { const th = dong ? dong + ' ' + t : t; if (k.measureText(th).width > w && dong) { k.fillText(dong, x, y + n * lh); n++; dong = t; if (n >= maxL) return n; } else dong = th; }
  if (dong && n < maxL) { k.fillText(dong, x, y + n * lh); n++; } return n;
}
function bangTex(o) {
  const c = document.createElement('canvas'); c.width = 640; c.height = 420; const k = c.getContext('2d');
  k.fillStyle = '#2b1e14'; k.fillRect(0, 0, 640, 420); k.strokeStyle = '#c9a25a'; k.lineWidth = 6; k.strokeRect(10, 10, 620, 400);
  k.fillStyle = '#c9a25a'; k.font = '600 22px system-ui, sans-serif'; k.fillText((o.phe || '').toUpperCase(), 34, 52);
  k.fillStyle = '#f6e7c4'; k.font = '800 38px system-ui, sans-serif'; const nT = veChu(k, o.ten, 34, 98, 572, 42, 2);
  k.fillStyle = '#e4d6bb'; k.font = '400 22px system-ui, sans-serif';
  const cau = (o.mo || '').split(/(?<=\.)\s/).slice(0, 2).join(' ');
  const y0 = 98 + nT * 42 + 10; const n2 = veChu(k, cau, 34, y0, 572, 30, nT > 1 ? 6 : 7);
  k.fillStyle = '#c9a25a'; k.font = 'italic 500 19px system-ui, sans-serif'; k.fillText('Chạm tên hiện vật để đọc đầy đủ và xem nguồn', 34, 392);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function datBang(grp, g, o, info) {
  const [x, z, ry] = o.bang, yb = sanY(z), H = 0.95;
  g.hop(0.08, H, 0.08, x, yb + H / 2, z - 0.05, 0x3a2a1c, ry);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.755), new THREE.MeshBasicMaterial({ map: bangTex(info) }));
  m.position.set(x, yb + H + 0.2, z); m.rotation.set(-0.55, ry, 0, 'YXZ'); grp.add(m);
  const lung = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.82, 0.04), new THREE.MeshLambertMaterial({ color: 0x3a2a1c }));
  lung.rotation.copy(m.rotation); lung.position.copy(m.position).add(new V3(0, 0, -0.025).applyEuler(m.rotation)); grp.add(lung);
}
// ---------- mô hình thu nhỏ hai toà thành (nhân bản từ chính thành trong sa bàn) ----------
function moHinhThanh(grp, ten, lx, lz, kich, top) {
  const src = CONG[ten]; if (!src) return;
  const inner = src.clone(true); inner.position.set(0, 0, 0); inner.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(inner), cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  const s = kich / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  inner.position.set(-cx, 0, -cz);
  const w = new THREE.Group(); w.add(inner); w.scale.setScalar(s); w.position.set(lx, top - bb.min.y * s, lz); grp.add(w);
  // đế đất (che phần móng dưới mặt đất)
  const hd = Math.max(0.02, -bb.min.y * s - 0.004);
  const de = new THREE.Mesh(new THREE.BoxGeometry(kich * 1.12, hd, kich * 1.12), new THREE.MeshLambertMaterial({ color: 0x6d7546 }));
  de.position.set(lx, top + hd / 2, lz); grp.add(de);
  // súng thần công thu nhỏ trên mặt thành
  if (MAU_PHAO) {
    const L = PHAO_INST.filter(([g]) => g === src); if (!L.length) return;
    const im = new THREE.InstancedMesh(MAU_PHAO.g, MAU_PHAO.mat, L.length); w.updateMatrix(); inner.updateMatrix();
    const M = new THREE.Matrix4().multiplyMatrices(w.matrix, inner.matrix), m = new THREE.Matrix4();
    L.forEach(([, Lm], i) => im.setMatrixAt(i, m.multiplyMatrices(M, Lm))); grp.add(im);
  }
}
function dungBaoTang() {
  const [mx, mn] = BT.M, y0 = gAt(mx, mn) + 0.1;
  const grp = new THREE.Group(); grp.position.set(mx, y0, -mn); grp.visible = false; scene.add(grp); BT.grp = grp; BT.y0 = y0;
  const g = new Ghep(), gg = new Ghep();
  const DA = 0xb9b4a6, DA2 = 0x8e897c, GO_ = 0x6a4a30, NGOI = 0x9b3a22, TRANG = 0xe4dccb, VA = BT.va = [];
  const chan = (x, z, w, d) => VA.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  g.hop(70, 0.3, 46, 0, 0.0, 0, DA);                                   // sân lát đá
  for (let i = -6; i <= 6; i++) g.hop(0.06, 0.32, 46, i * 5.4, 0.01, 0, DA2);
  for (let j = -4; j <= 4; j++) g.hop(70, 0.32, 0.06, 0, 0.01, j * 5.1, DA2);
  // tường rào gạch thấp, cổng phía Nam (mái cổng lợp ngói vẩy cá)
  for (const [x, z, w, d] of [[0, -23, 70, 0.6], [-35, 0, 0.6, 46], [35, 0, 0.6, 46], [-21, 23, 28, 0.6], [21, 23, 28, 0.6]]) { gg.hop(w, 1.3, d, x, 0.65, z, 0xbcae9e); chan(x, z, w, d); }
  for (const x of [-7, 7]) { gg.hop(1.4, 3.6, 1.4, x, 1.8, 23, 0xbcae9e); chan(x, 23, 1.4, 1.4); maiVay(grp, 1.6, 1.6, 0.7, x, 3.6, 23, 0.25); }
  // nhà trưng bày phía Bắc: nền cao 0,5 m, tường hậu và hai hồi, hiên cột mở về phía Nam
  const ZN = -14.5, SAU = 14;      // tâm, chiều sâu nhà
  g.hop(50, 0.5, SAU, 0, 0.25, ZN, 0xa29a88);
  g.hop(50, 0.24, 1.0, 0, 0.12, ZN + SAU / 2 + 0.5, 0x968e7c);           // bậc thềm
  gg.hop(50, 5.2, 0.5, 0, 2.85, ZN - SAU / 2 + 0.25, 0xd8ccb4); chan(0, ZN - SAU / 2 + 0.25, 50, 0.5);
  for (const sx of [-1, 1]) { gg.hop(0.5, 5.2, SAU, sx * 24.75, 2.85, ZN, 0xd8ccb4); chan(sx * 24.75, ZN, 0.5, SAU); }
  const ZC = ZN + SAU / 2 - 0.6;   // hàng cột hiên
  for (let i = -4; i <= 4; i++) { g.tru(0.24, 0.27, 4.7, i * 5.8, 2.85, ZC, 0x7a2f22, 10); g.tru(0.36, 0.36, 0.25, i * 5.8, 0.62, ZC, 0x8e897c, 10); chan(i * 5.8, ZC, 0.6, 0.6); }
  for (let i = -4; i <= 4; i++) g.tru(0.22, 0.25, 4.7, i * 5.8, 2.85, ZN - SAU / 2 + 1.4, 0x7a2f22, 10);   // hàng cột trong
  g.hop(50, 0.45, 0.45, 0, 5.3, ZC, GO_); g.hop(50, 0.4, 0.4, 0, 5.3, ZN - SAU / 2 + 1.4, GO_);
  for (let i = -4; i <= 4; i++) g.hop(0.3, 0.35, SAU - 1.6, i * 5.8, 5.45, ZN + 0.2, GO_);   // xà ngang
  maiVay(grp, 50, SAU, 4.2, 0, 5.5, ZN, 1.5);
  // hoành phi treo dưới xà hiên (V1.4: hạ xuống trước hàng cột, đủ chữ)
  { const c = document.createElement('canvas'); c.width = 1200; c.height = 176; const k = c.getContext('2d'); k.fillStyle = '#5a1e14'; k.fillRect(0, 0, 1200, 176); k.strokeStyle = '#d8b46a'; k.lineWidth = 8; k.strokeRect(10, 10, 1180, 156);
    k.fillStyle = '#f1dca2'; k.textAlign = 'center'; k.font = '800 66px system-ui, sans-serif'; k.fillText('BẢO TÀNG ĐÀ NẴNG 1858', 600, 86); k.font = '500 34px system-ui, sans-serif'; k.fillText('Vật dụng · binh khí · thành luỹ · hạm đội (tái dựng mô phỏng)', 600, 140);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 1.7), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 4.2, ZC + 0.34); grp.add(m);
    g.hop(11.9, 1.95, 0.12, 0, 4.2, ZC + 0.26, 0x3a1a10); }
  // bệ trưng bày
  const be = (x, z, w, d, h, col = TRANG, y = 0.15) => { g.hop(w, h, d, x, y + h / 2, z, col); g.hop(w + 0.2, 0.08, d + 0.2, x, y + h, z, 0xb08a3e); chan(x, z, w + 0.2, d + 0.2); };
  be(-9, -3.5, 3.4, 4.4, 0.35); be(9, -3.5, 3.4, 4.4, 0.35);      // hai súng thần công hai bên trước nhà
  be(0, 6, 7.6, 2.4, 0.9);                                         // mô hình tàu
  be(-20, 7, 8.4, 8.4, 0.85, 0x5a4232); be(20, 7, 8.4, 8.4, 0.85, 0x5a4232);   // mô hình hai toà thành
  for (const x of [-14, -7, 7, 14]) be(x, -13, 3.0, 1.2, 0.95, 0x4a3426, 0.5);
  be(-17, -17.6, 1.6, 1.6, 0.5, TRANG, 0.5); be(17, -17.6, 1.6, 1.6, 0.5, TRANG, 0.5); be(-9, -18, 1.6, 1.6, 0.5, TRANG, 0.5);
  be(0, -17.8, 2.4, 2.4, 1.1, 0xcfc4b4, 0.5);
  // cây cảnh quanh sân
  const R = rng(7); for (let k = 0; k < 10; k++) { const x = (k < 5 ? -1 : 1) * (31.5 + R()), z = -4 + (k % 5) * 6.2; g.tru(0.15, 0.2, 2.4, x, 1.2, z, 0x5a4530, 5); g.them(new THREE.IcosahedronGeometry(1.5, 1), M4(x, 3.1, z), 0x3f6e33); chan(x, z, 0.6, 0.6); }
  // súng thần công: hai khẩu hai bên, nòng quay ra phía trước (Nam)
  if (MAU_PHAO) for (const x of [-9, 9]) { const m = new THREE.Mesh(MAU_PHAO.g, MAU_PHAO.mat); m.position.set(x, 0.58, -3.6); m.rotation.y = 0; m.scale.setScalar(0.95); grp.add(m); }
  // mô hình tàu bánh guồng 1:12
  if (MAU_TAU) { const m = new THREE.Mesh(MAU_TAU.g, MAU_TAU.mat); const k = 6.2 / MAU_TAU.d.dai; m.scale.setScalar(k); m.position.set(0, 1.13 + 4 * k, 6); m.rotation.y = Math.PI / 2; grp.add(m); }
  // mô hình hai toà thành
  moHinhThanh(grp, 'dien-hai', -20, 7, 7.6, 1.08); moHinhThanh(grp, 'an-hai', 20, 7, 7.6, 1.08);
  // binh khí nằm trên bệ
  const wp = (geo, x, z, s, rz = Math.PI / 2, y = 1.58) => { const m = new THREE.Mesh(geo, XWMAT); m.position.set(x, y, z); m.rotation.set(0, 0, rz); m.scale.setScalar(s); grp.add(m); return m; };
  wp(XWGEO.dieuthuong, -14.4, -13, 1); wp(XWGEO.sungtruong, -7.4, -13, 1); wp(XWGEO.sungngan, 7, -13, 2, 0, 1.62).rotation.set(Math.PI / 2, 0, 0);
  wp(XWGEO.guom, 13.4, -13.3, 1); wp(XWGEO.giao, 14.4, -12.7, 1, Math.PI / 2, 1.56).position.x = 15.4;
  grp.add(g.luoi()); grp.add(gg.luoi(MAT_GACH));
  // bảng thông tin trước mỗi hiện vật
  const gb = new Ghep();
  for (const o of BT_DS) if (o.bang) datBang(grp, gb, o, o.an ? BT_DS[o.nhu || 0] : o);
  grp.add(gb.luoi());
  for (const o of BT_DS) if (o.bang) chan(o.bang[0], o.bang[1] + 0.12, 0.5, 0.4);
  BT.items = BT_DS.map(o => ({ ...o, w: new V3(mx + o.p[0], y0 + (o.p[1] < -8 ? 2.3 : 1.9), -mn + o.p[1]) }));
  TRANH.push([mx, mn, 60]);
  dungLoTrinh();
}
// ---------- khách tham quan: vòng đi qua từng hiện vật, dừng xem ----------
// điểm [x, z, dừng (s), nhìn về [x, z]]
const LT_DIEM = [
  [0, 20], [-2, 10.4, 8, [0, 6]], [-14, 12.6], [-20, 13.4, 9, [-20, 7]], [-27, 10.5], [-27, 0.5], [-12, 0.6], [-9, 0.9, 7, [-9, -3.5]],
  [-2.9, -2.2], [-2.9, -10.4], [-14, -11, 8, [-14, -13]], [-7, -11, 7, [-7, -13]], [-3.4, -11.6], [-3.4, -15.2], [-9, -15.2, 7, [-9, -18]],
  [-17, -15.2, 7, [-17, -17.6]], [-1.5, -15.0, 9, [0, -17.8]], [17, -15.2, 7, [17, -17.6]], [14, -11, 8, [14, -13]], [7, -11, 7, [7, -13]],
  [2.9, -10.4], [2.9, -2.2], [9, 0.9, 7, [9, -3.5]], [27, 0.5], [27, 10.5], [20, 13.4, 9, [20, 7]], [3, 13.5]];
let LT = null;
function dungLoTrinh() {
  const seg = []; let T = 0;
  for (let i = 0; i < LT_DIEM.length; i++) {
    const a = LT_DIEM[i], b = LT_DIEM[(i + 1) % LT_DIEM.length];
    if (a[2]) { seg.push({ dung: true, t0: T, t1: T + a[2], x: a[0], z: a[1], nh: a[3] }); T += a[2]; }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push({ dung: false, t0: T, L, a, b }); T += L;   // T tính theo "mét" khi đi
  }
  LT = { seg, T };
}
const KHACH = Array.from({ length: 16 }, (_, k) => ({ kind: ['khachnam', 'aodai', 'khachnu'][k % 3], off: k / 16, lech: ((k * 7) % 5 - 2) * 0.28, ph: (k * 0.37) % 1, chi: k % 4 === 1 }));
function sanY(z) { return z < -7.5 ? 0.5 : z < -6.5 ? lerp(0.15, 0.5, -6.5 - z) : 0.15; }
function baoTangCapNhat() {
  if (!BT.on) return;
  const t = BT.tg = performance.now() / 1000;
  const [mx, mn] = BT.M, Y = BT.y0, X = mx, Z = -mn;
  // tượng trên bệ
  xPut('nguyen', 'dung', 0.3, 0, X - 17, Y + 1.0, Z - 17.6, 0.15, 1, [1, 1, 1], 'dieuthuong');
  xPut('phap', 'dung', 0.3, 0, X + 17, Y + 1.0, Z - 17.6, -0.15, 1, [1, 1, 1], 'sungtruong');
  xPut('danbinh', 'dung', 0.3, 0, X - 9, Y + 1.0, Z - 18, 0.1, 1, [1, 1, 1], 'giao');
  xPut('ntp', 'chihuy', t * 0.5, 0, X, Y + 1.6, Z - 17.8, 0, 1.05, [1, 1, 1], null);
  if (!LT) return;
  // khách: mỗi người đi trọn vòng theo tốc độ bước chân của mình (nhịp bước = quãng đi), dừng xem hiện vật
  for (const k of KHACH) {
    const v = vNat(k.kind, 'di') * 1.02, Tv = (() => { let T = 0; for (const s of LT.seg) T += s.dung ? s.t1 - s.t0 : s.L / v; return T; })();
    let tau = mod(t + k.off * Tv, Tv), x, z, yaw, clip = 'di', ta = 0, q = 0;
    for (const s of LT.seg) {
      const d = s.dung ? s.t1 - s.t0 : s.L / v;
      if (tau < d) {
        if (s.dung) { x = s.x; z = s.z; yaw = Math.atan2(s.nh[0] - x, s.nh[1] - z); clip = k.chi && tau > 2 && tau < 4.5 ? 'chihuy' : (k.kind === 'khachnam' ? 'dung' : 'nhin'); ta = tau; }
        else { const u = tau / d; x = lerp(s.a[0], s.b[0], u); z = lerp(s.a[1], s.b[1], u); yaw = Math.atan2(s.b[0] - s.a[0], s.b[1] - s.a[1]); ta = (q + u * s.L) / vNat(k.kind, 'di'); }
        break;
      }
      tau -= d; if (!s.dung) q += s.L;
    }
    // lệch sang bên để người không chồng lên nhau
    const ox = Math.cos(yaw) * k.lech, oz = -Math.sin(yaw) * k.lech;
    xPut(k.kind, clip, ta, k.ph, X + x + ox, Y + sanY(z + oz), Z + z + oz, yaw, 1, [1, 1, 1], null);
  }
}
function dungNhanBaoTang() {
  BT.items.forEach((o, i) => { if (o.an) return; nhan(o.ten, () => o.w, 'bt', () => BT.on); const L = NHAN[NHAN.length - 1]; L.el.onclick = () => baoTangThe(i); L.bt = true; });
}
function baoTangThe(i) {
  BT.chon = i; const o = BT.items[i], c = $('#bt');
  const ds = BT.items.map((x, k) => x.an ? '' : `<button data-k="${k}" class="${k === i ? 'on' : ''}">${esc(x.ten)}</button>`).join('');
  c.innerHTML = `<button class="x" id="btX" aria-label="Đóng">×</button><div class="eyebrow">Hiện vật · ${esc(o.phe)}</div><h2>${esc(o.ten)}</h2><p>${esc(o.mo)}</p>
    ${o.so && o.so.length ? `<ul>${o.so.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}<p class="src">${esc(o.minh)}</p>
    ${o.ng && o.ng.length ? `<p class="src">Nguồn: ${o.ng.map(k => `<a href="${BT_NGUON[k][1]}" target="_blank" rel="noopener">${esc(BT_NGUON[k][0])}</a>`).join(' · ')}</p>` : ''}
    <div id="btList">${ds}</div>`;
  c.hidden = false; $('#btX').onclick = () => { c.hidden = true; };
  c.querySelectorAll('#btList button').forEach(b => b.onclick = () => baoTangThe(+b.dataset.k));
  if (DI.on) { diBoToi(o); return; }
  // bay máy quay tới hiện vật
  const w = o.w, d = o.id === 'tau' || o.id.startsWith('mh-') ? 11 : o.id.startsWith('thancong') ? 8 : 5.5;
  BT.bay = { t0: performance.now(), p0: camera.position.clone(), q0: OC.target.clone(), q1: w.clone().setY(w.y - 0.5), p1: w.clone().add(new V3(d * 0.35, d * 0.45, d)) };
}
function baoTangVao() {
  BT.tCu = UI.t; BT.camCu = [camera.position.clone(), OC ? OC.target.clone() : null];
  UI.t = 25; NHAY = true; BT.on = true; BT.grp.visible = true;
  const [mx, mn] = BT.M; OC.target.set(mx, BT.y0 + 1.5, -mn - 6); camera.position.set(mx + 4, BT.y0 + 20, -mn + 40); OC.minDistance = 2; OC.maxDistance = 220;
  $('#btDi').hidden = false; $('#bt').hidden = true;
}
function baoTangRa() {
  diBoTat(); $('#btDi').hidden = true;
  BT.on = false; BT.grp.visible = false; $('#bt').hidden = true; UI.t = BT.tCu; NHAY = true; BT.bay = null;
}
function baoTangBay() {
  const b = BT.bay; if (!b || !OC) return;
  const k = Math.min((performance.now() - b.t0) / 1400, 1), e = k * k * (3 - 2 * k);
  camera.position.lerpVectors(b.p0, b.p1, e); OC.target.lerpVectors(b.q0, b.q1, e); if (k >= 1) BT.bay = null;
}
// ---------- V1.4: đi bộ tham quan (góc nhìn người, W A S D / mũi tên, kéo để nhìn; điện thoại: cần gạt trái) ----------
const DI = { on: false, x: 0, z: 19, yaw: Math.PI, pitch: -0.05, keys: {}, joy: null, nhin: null, toi: null };
function diBoBat() {
  DI.on = true; DI.x = 0; DI.z = 19; DI.yaw = Math.PI; DI.pitch = -0.06; DI.toi = null; BT.bay = null;
  if (OC) OC.enabled = false; $('#bt').hidden = true;
  $('#btDi').textContent = '✕ Thôi đi bộ'; $('#btDi').classList.add('on'); $('#joy').hidden = !matchMedia('(pointer:coarse)').matches;
  $('#help').textContent = 'W A S D hoặc mũi tên để đi · kéo chuột để nhìn quanh · Shift để đi nhanh · chạm tên hiện vật để đọc thẻ';
}
function diBoTat() {
  if (!DI.on) return; DI.on = false; DI.keys = {}; DI.joy = null; DI.nhin = null;
  $('#btDi').textContent = '🚶 Đi bộ tham quan'; $('#btDi').classList.remove('on'); $('#joy').hidden = true;
  if (OC) { OC.enabled = true; const [mx, mn] = BT.M; OC.target.set(mx + DI.x, BT.y0 + 1.2, -mn + DI.z - 4); camera.position.set(mx + DI.x + 3, BT.y0 + 9, -mn + DI.z + 9); }
  $('#help').textContent = 'Kéo để xoay quanh hiện vật · chạm tên hiện vật để đọc thẻ · bấm “Đi bộ tham quan” để dạo trong bảo tàng';
}
// đi tới đứng trước bảng thông tin của hiện vật
function diBoToi(o) { const b = o.bang || [o.p[0], o.p[1] + 3, 0]; DI.toi = { x: b[0] + Math.sin(b[2] || 0) * 1.6, z: b[1] + 1.7, nx: o.p[0], nz: o.p[1] }; }
function vaCham(x, z, r = 0.32) {
  for (let lan = 0; lan < 2; lan++) for (const [x0, z0, x1, z1] of BT.va) {
    if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) {
      const dl = x - (x0 - r), dr = x1 + r - x, dt = z - (z0 - r), db = z1 + r - z, m = Math.min(dl, dr, dt, db);
      if (m === dl) x = x0 - r; else if (m === dr) x = x1 + r; else if (m === dt) z = z0 - r; else z = z1 + r;
    }
  }
  return [clamp(x, -34.3, 34.3), clamp(z, -22.3, 25)];
}
function diBoCapNhat(dt) {
  if (!DI.on) return;
  const K = DI.keys, nhanh = K.ShiftLeft || K.ShiftRight ? 2.0 : 1;
  let f = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0), s = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0);
  if (K.ArrowLeft) DI.yaw += dt * 1.6; if (K.ArrowRight) DI.yaw -= dt * 1.6;
  if (DI.joy) { f -= DI.joy.dy; s += DI.joy.dx; }
  const fx = Math.sin(DI.yaw), fz = Math.cos(DI.yaw), rx = -fz, rz = fx;
  if (f || s) DI.toi = null;
  let x = DI.x, z = DI.z;
  if (DI.toi) {   // tự đi tới hiện vật đã chọn
    const dx = DI.toi.x - x, dz = DI.toi.z - z, d = Math.hypot(dx, dz), want = Math.atan2(DI.toi.nx - x, DI.toi.nz - z);
    let dy = mod(want - DI.yaw + Math.PI, Math.PI * 2) - Math.PI; DI.yaw += dy * Math.min(1, dt * 3);
    if (d > 0.1) { const st = Math.min(d, dt * 3.2); x += dx / d * st; z += dz / d * st; } else DI.toi = null;
  } else { const v = 2.1 * nhanh * dt; x += (fx * f + rx * s) * v; z += (fz * f + rz * s) * v; }
  [DI.x, DI.z] = vaCham(x, z);
  const [mx, mn] = BT.M, ey = BT.y0 + sanY(DI.z) + 1.62 + Math.sin(performance.now() / 1000 * 7.5) * ((f || s) ? 0.025 : 0);
  camera.position.set(mx + DI.x, ey, -mn + DI.z);
  const cp = Math.cos(DI.pitch); camera.lookAt(mx + DI.x + Math.sin(DI.yaw) * cp, ey + Math.sin(DI.pitch), -mn + DI.z + Math.cos(DI.yaw) * cp);
}
function diBoGiaoDien() {
  const b = document.createElement('button'); b.id = 'btDi'; b.className = 'chip'; b.hidden = true; b.textContent = '🚶 Đi bộ tham quan'; document.body.appendChild(b);
  b.onclick = () => DI.on ? diBoTat() : diBoBat();
  const j = document.createElement('div'); j.id = 'joy'; j.hidden = true; j.innerHTML = '<b></b>'; document.body.appendChild(j);
  addEventListener('keydown', (e) => { if (DI.on) { DI.keys[e.code] = true; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); } });
  addEventListener('keyup', (e) => { DI.keys[e.code] = false; });
  addEventListener('blur', () => { DI.keys = {}; });
  const cvs = renderer.domElement;
  cvs.addEventListener('pointerdown', (e) => {
    if (!DI.on) return;
    if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.42) { DI.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; j.style.left = (e.clientX - 55) + 'px'; j.style.top = (e.clientY - 55) + 'px'; j.classList.add('on'); }
    else DI.nhin = { id: e.pointerId, x: e.clientX, y: e.clientY };
    cvs.setPointerCapture(e.pointerId);
  });
  cvs.addEventListener('pointermove', (e) => {
    if (!DI.on) return;
    if (DI.joy && e.pointerId === DI.joy.id) { DI.joy.dx = clamp((e.clientX - DI.joy.x0) / 50, -1, 1); DI.joy.dy = clamp((e.clientY - DI.joy.y0) / 50, -1, 1); j.firstChild.style.transform = `translate(${DI.joy.dx * 30}px,${DI.joy.dy * 30}px)`; }
    else if (DI.nhin && e.pointerId === DI.nhin.id) { DI.yaw -= (e.clientX - DI.nhin.x) * 0.0045; DI.pitch = clamp(DI.pitch - (e.clientY - DI.nhin.y) * 0.0035, -1.1, 0.9); DI.nhin.x = e.clientX; DI.nhin.y = e.clientY; DI.toi = null; }
  });
  const len = (e) => { if (DI.joy && e.pointerId === DI.joy.id) { DI.joy = null; j.classList.remove('on'); j.firstChild.style.transform = ''; } if (DI.nhin && e.pointerId === DI.nhin.id) DI.nhin = null; };
  cvs.addEventListener('pointerup', len); cvs.addEventListener('pointercancel', len);
}
// ---------- thẻ bản đồ, thẻ chữ ----------
const BO_BIEN = {
  vn: [[22.5, 113.5], [21.6, 111.5], [21.4, 109.8], [21.5, 108.3], [20.9, 107.1], [20.3, 106.6], [19.8, 105.9], [18.7, 105.7], [18.0, 106.5], [17.0, 107.1], [16.4, 107.7], [16.1, 108.2], [15.5, 108.7], [14.1, 109.2], [12.9, 109.4], [11.6, 109.2], [10.9, 108.4], [10.4, 107.2], [10.3, 106.7], [9.6, 106.6], [8.6, 105.0], [10.0, 104.8], [10.6, 104.2], [11.5, 103.0], [12.5, 102.3], [13.4, 100.9], [12.7, 100.0], [10.5, 99.2], [8.5, 100.2], [6.9, 100.6], [5.3, 103.1], [3.0, 103.4], [1.4, 104.2], [1.3, 103.6], [2.5, 101.8], [4.0, 100.6], [6.5, 100.2], [8.0, 98.3], [12, 98.6], [16, 97.6], [17, 94.6]],
  tq: [[22.5, 113.5], [22.3, 114.2], [23.2, 116.5], [24.5, 118.2], [26.0, 119.6], [28, 121]],
  hn: [[20.0, 110.2], [19.6, 111.0], [18.6, 110.5], [18.2, 109.5], [18.7, 108.7], [19.6, 108.6], [20.1, 109.6], [20.0, 110.2]],
  lz: [[18.5, 120.8], [18.3, 122.2], [16.0, 121.8], [14.6, 121.4], [13.8, 120.6], [14.6, 120.0], [16.2, 119.8], [17.5, 120.4], [18.5, 120.8]],
  tw: [[25.2, 121.5], [24.0, 121.6], [22.0, 120.8], [23.0, 120.1], [24.5, 120.6], [25.2, 121.5]],
  bn: [[7.0, 116.8], [5.6, 115.5], [4.6, 114.2], [2.8, 111.5], [2.0, 109.6], [0.5, 109.0]],
};
function veBanDo(kieu) {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 900; const g = c.getContext('2d');
  const lo0 = 96, lo1 = 126, la0 = -1, la1 = 27;
  const P = (la, lo) => [(lo - lo0) / (lo1 - lo0) * 1400, (la1 - la) / (la1 - la0) * 900];
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#1d3a52'); gr.addColorStop(1, '#13283c'); g.fillStyle = gr; g.fillRect(0, 0, 1400, 900);
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1; for (let lo = 100; lo <= 125; lo += 5) { const [x] = P(0, lo); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 900); g.stroke(); } for (let la = 0; la <= 25; la += 5) { const [, y] = P(la, 0); g.beginPath(); g.moveTo(0, y); g.lineTo(1400, y); g.stroke(); }
  // đất liền: tô vùng phía Tây/Bắc đường bờ
  g.fillStyle = '#c8b68a'; g.strokeStyle = '#8a7650'; g.lineWidth = 3;
  const vn = BO_BIEN.vn.map(p => P(...p)), tq = BO_BIEN.tq.map(p => P(...p));
  g.beginPath(); g.moveTo(...P(28, 121)); [...tq].reverse().forEach(p => g.lineTo(...p)); vn.forEach(p => g.lineTo(...p)); g.lineTo(0, P(17, 94.6)[1]); g.lineTo(0, 0); g.lineTo(P(28, 121)[0], 0); g.closePath(); g.fill(); g.stroke();
  for (const k of ['hn', 'lz', 'tw']) { g.beginPath(); BO_BIEN[k].forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, ...P(...p))); g.closePath(); g.fill(); g.stroke(); }
  g.beginPath(); g.moveTo(1400, P(7.5, 117)[1]); BO_BIEN.bn.forEach(p => g.lineTo(...P(...p))); g.lineTo(P(0.5, 109)[0], 900); g.lineTo(1400, 900); g.closePath(); g.fill(); g.stroke();
  const diem = (la, lo, ten, mau = '#fff', dx = 14, dy = 6, to = 26) => { const [x, y] = P(la, lo); g.fillStyle = mau; g.beginPath(); g.arc(x, y, 9, 0, 6.3); g.fill(); g.font = `600 ${to}px system-ui, sans-serif`; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 5; g.strokeText(ten, x + dx, y + dy); g.fillText(ten, x + dx, y + dy); };
  const mui = (pts, mau) => {
    const Q = pts.map(p => P(...p)); g.strokeStyle = mau; g.lineWidth = 9; g.setLineDash([24, 14]); g.beginPath(); Q.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, ...p)); g.stroke(); g.setLineDash([]);
    const [a, b] = [Q[Q.length - 2], Q[Q.length - 1]], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.fillStyle = mau; g.beginPath(); g.moveTo(b[0] + Math.cos(an) * 26, b[1] + Math.sin(an) * 26); g.lineTo(b[0] + Math.cos(an + 2.4) * 30, b[1] + Math.sin(an + 2.4) * 30); g.lineTo(b[0] + Math.cos(an - 2.4) * 30, b[1] + Math.sin(an - 2.4) * 30); g.fill();
  };
  g.font = '600 30px system-ui'; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillText('BIỂN ĐÔNG', ...P(14, 112.5)); g.fillText('ĐẠI NAM', ...P(15.2, 104.6));
  if (kieu === 'bando-chau-a') {
    mui([[22.2, 114.0], [19.5, 112.2], [17.2, 109.6], [16.25, 108.45]], '#ffffff');
    mui([[14.4, 120.6], [15.0, 115.5], [16.0, 110.5], [16.15, 108.5]], '#f2c230');
    mui([[3, 96.5], [5.5, 103.8], [10.0, 108.6], [15.6, 108.8]], 'rgba(255,255,255,.65)');
    diem(22.3, 114.17, 'Vùng biển Trung Hoa', '#fff', 14, -14); diem(14.6, 120.98, 'Manila (Tây Ban Nha)', '#f2c230', 14, 30); diem(1.29, 103.85, 'Singapore', '#fff', 14, 30, 22);
    g.font = '500 24px system-ui'; g.fillStyle = '#fff'; g.fillText('← từ châu Âu: Pháp, Tây Ban Nha', 20, P(2, 0)[1] + 60);
  } else {
    mui([[16.0, 108.6], [14.0, 109.7], [11.5, 109.6], [10.2, 107.6], [10.75, 106.8]], '#ffffff');
    diem(10.78, 106.69, 'Gia Định', '#ff5a4a', -150, 8, 30);
  }
  diem(16.07, 108.22, 'Đà Nẵng', '#ff5a4a', 16, 8, 32); diem(16.46, 107.59, 'Kinh đô Huế', '#f2c230', -200, -8, 26);
  g.font = '500 20px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('Sơ đồ MINH HOẠ · không theo tỉ lệ đo đạc', 20, 880);
  return c.toDataURL('image/jpeg', 0.9);
}
const THE = {};
function theHien(id, on) {
  const el = $('#the');
  if (!on) { if (el.dataset.id) { el.classList.remove('hien'); el.dataset.id = ''; } return; }
  if (el.dataset.id === id) return; el.dataset.id = id; el.classList.add('hien');
  if (id === 'bando-chau-a' || id === 'bando-gia-dinh') {
    THE[id] ||= veBanDo(id);
    el.innerHTML = `<img src="${THE[id]}"><div class="chu">${id === 'bando-chau-a' ? 'Liên quân Pháp – Tây Ban Nha hướng tới Đà Nẵng (1858)' : 'Tháng 2/1859: phần lớn hạm đội chuyển hướng vào Gia Định'}</div>`;
  } else if (id === 'trieu-dinh') {
    el.innerHTML = `<div class="chu-lon"><small>Kinh đô Huế</small>Triều đình nhận tin chiến sự Đà Nẵng<br><span>Vua Tự Đức điều Nguyễn Tri Phương ra mặt trận Quảng Nam</span></div>`;
  } else if (id === 'loi-binh') {
    el.innerHTML = `<div class="chu-lon loi"><small>Lời bình (sáng tác, không phải lời ghi lại của Nguyễn Tri Phương)</small>Không để địch mở rộng chiếm đóng.<br>Không cho địch dễ dàng tiếp tế trên bộ.<br>Buộc đối phương sa lầy.</div>`;
  } else if (id === 'hien-trang') {
    el.innerHTML = `<img src="${ANH_HT || ''}"><div class="chu">Thành Điện Hải hôm nay (ảnh tư liệu)</div>`;
  } else if (id === 'tua-de') {
    el.innerHTML = `<div class="tua"><small>Không gian lịch sử · Học Lịch Sử</small>ĐÀ NẴNG 1858<span>Nơi tiếng súng xâm lược đầu tiên vang lên<br>và ý chí kháng chiến của quân dân Đại Nam được thể hiện từ những ngày đầu tiên</span></div>`;
  }
}

// ---------- đồng hồ (voice), giao diện ----------
const UI = { t: 0, chay: false, che: 'phim', nhan: true, am: true, keo: false };
const voice = new Audio(); voice.preload = 'auto';
const nhac = new Audio(); nhac.loop = true; nhac.volume = 0;
let voiceSan = false, tDongHo = performance.now();
let ANH_HT = null;
async function napVoice() {
  try { ANH_HT = URL.createObjectURL(await (await fetch(URLG('anh/thanh-dien-hai-nay.jpg'))).blob()); } catch (e) { }
  try { const b = await (await fetch(URLG('audio/voice.mp3'))).blob(); voice.src = URL.createObjectURL(b); voiceSan = true; } catch (e) { console.warn('voice', e); }
  try { const b = await (await fetch(URLG('audio/nhacnen.mp3'))).blob(); nhac.src = URL.createObjectURL(b); } catch (e) { }
}
function phat() {
  UI.chay = true; $('#sbPlay').textContent = '⏸';
  if (AM.ctx && AM.ctx.state !== 'running') AM.ctx.resume();
  if (voiceSan && UI.am && UI.vo) { voice.currentTime = UI.t; voice.playbackRate = UI.toc; voice.play().catch(() => { }); }
  if (UI.am) nhac.play().catch(() => { });
  tDongHo = performance.now();
}
function dung() { UI.chay = false; $('#sbPlay').textContent = '▶'; voice.pause(); nhac.pause(); }
function tua(t) { UI.t = clamp(t, 0, ST.dur); if (voiceSan) voice.currentTime = UI.t; NHAY = true; }
let NHAY = true;
// ---------- giao diện kiểu Thành cổ Quảng Trị (V1.3) ----------
UI.toc = 1; UI.vo = true; UI.cc = true; UI.cine = false;
const TOC = [0.75, 1, 1.25, 1.5];
const esc = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let NGUON = null;
function hoiHienTai() { return ST.scenes.find(s => UI.t >= s.t0 && UI.t < s.t1) || ST.scenes[ST.scenes.length - 1]; }
function chip(id, on) { const b = $('#' + id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
function dungGiaoDien() {
  $('#sbTicks').innerHTML = ST.scenes.map(s => `<i style="left:${(s.t0 / ST.dur * 100).toFixed(2)}%"></i>`).join('');
  const seek = $('#sbSeek');
  seek.addEventListener('input', () => { UI.keo = true; tua(seek.value / 1000 * ST.dur); });
  seek.addEventListener('change', () => { UI.keo = false; if (UI.chay) phat(); });
  $('#sbPlay').onclick = () => UI.chay ? dung() : phat();
  $('#sbPrev').onclick = () => { const i = ST.scenes.indexOf(hoiHienTai()); const s = UI.t - hoiHienTai().t0 > 3 ? hoiHienTai() : ST.scenes[Math.max(0, i - 1)]; tua(s.t0 + 0.01); if (UI.chay) phat(); };
  $('#sbNext').onclick = () => { const i = ST.scenes.indexOf(hoiHienTai()); tua(ST.scenes[Math.min(ST.scenes.length - 1, i + 1)].t0 + 0.01); if (UI.chay) phat(); };
  $('#sbSpeed').onclick = () => { UI.toc = TOC[(TOC.indexOf(UI.toc) + 1) % TOC.length]; $('#sbSpeed').textContent = String(UI.toc).replace('.', ',') + '×'; $('#sbSpeed').classList.toggle('on', UI.toc !== 1); voice.playbackRate = UI.toc; };
  $('#pickList').innerHTML = ST.scenes.map((s, i) => `<li><button data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b> ${esc(s.title)}<small>${esc(s.date)} · ${fmt(s.t1 - s.t0)}</small></button></li>`).join('');
  $('#sbPick').onclick = () => { $('#picker').hidden = !$('#picker').hidden; };
  $('#picker').onclick = (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; $('#picker').hidden = true; cheDo('phim'); tua(ST.scenes[+b.dataset.i].t0 + 0.01); if (!UI.chay) phat(); else phat(); };
  $('#sbDocs').onclick = () => moTuLieu();
  $('#cc').onclick = () => { UI.cc = !UI.cc; chip('cc', UI.cc); };
  $('#vo').onclick = () => { UI.vo = !UI.vo; chip('vo', UI.vo); voice.muted = !UI.vo || !UI.am; if (UI.vo && UI.chay) phat(); };
  $('#bnhan').onclick = () => { UI.nhan = !UI.nhan; chip('bnhan', UI.nhan); };
  $('#bam').onclick = () => { UI.am = !UI.am; chip('bam', UI.am); $('#bam').textContent = UI.am ? '🔊 Âm thanh' : '🔇 Âm thanh'; voice.muted = !UI.am || !UI.vo; nhac.muted = !UI.am; if (AM.master) AM.master.gain.value = UI.am ? 1 : 0; };
  const setCine = (v) => { UI.cine = v; document.body.classList.toggle('cine', v); if (v) { $('#picker').hidden = true; $('#docs').hidden = true; } };
  $('#cine').onclick = () => setCine(true); $('#cineExit').onclick = () => setCine(false);
  let cineT = null; const peek = () => { if (!UI.cine) return; $('#cineExit').classList.add('show'); clearTimeout(cineT); cineT = setTimeout(() => $('#cineExit').classList.remove('show'), 2500); };
  addEventListener('pointermove', peek); addEventListener('pointerdown', peek);
  document.querySelector('.modes').onclick = (e) => { const b = e.target.closest('button[data-m]'); if (b) cheDo(b.dataset.m); };
  document.addEventListener('keydown', (e) => {
    if (UI.che === 'baotang') return;
    if (e.code === 'Space') { e.preventDefault(); UI.chay ? dung() : phat(); }
    if (e.code === 'ArrowRight') tua(UI.t + 5); if (e.code === 'ArrowLeft') tua(UI.t - 5);
    if (e.code === 'KeyH') setCine(!UI.cine); if (e.code === 'Escape' && UI.cine) setCine(false);
  });
  // nút về trang chủ Học Lịch Sử — chỉ hiện khi sa bàn chạy trong website (đường dẫn có /khong-gian/)
  { const i = location.pathname.indexOf('/khong-gian/'); if (i >= 0) { const b = $('#veTrang'); b.href = location.pathname.slice(0, i) + '/'; b.hidden = false; } }
  $('#go').onclick = () => { $('#load').classList.add('done'); cheDo('phim'); tua(0); phat(); };
  fetch(URLG('sources.json')).then(r => r.json()).then(j => NGUON = j).catch(() => { });
  // bản đồ nhỏ
  MM.img = new Image(); MM.img.src = URLG('anh/bando-nho.jpg');
}
function moTuLieu(dong) {
  const d = $('#docs'); if (dong || !d.hidden) { d.hidden = true; $('#sbDocs').classList.remove('on'); return; }
  const sc = hoiHienTai(), i = ST.scenes.indexOf(sc);
  const ng = (NGUON && NGUON.sources) || [];
  d.innerHTML = `<button class="x" id="docsX" aria-label="Đóng">×</button>
    <div class="eyebrow">Hồi ${String(i + 1).padStart(2, '0')} · ${esc(sc.date)}</div><h2>${esc(sc.title)}</h2>
    <h4>1 · Điều đang thấy</h4><ul>${sc.shots.map(h => `<li>${esc(h.mo)}</li>`).join('')}</ul>
    <h4>2 · Phần tái dựng mô phỏng</h4><p>${esc(NGUON ? NGUON.reconstruction : '')}</p>
    <h4>3 · Tham khảo</h4><ul class="refs">${ng.map(s => `<li><b>[${esc(s.id)}]</b> ${/^https?:/.test(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}${s.used_for ? ' — <span class="muted">' + esc(s.used_for) + '</span>' : ''}</li>`).join('')}</ul>
    <p class="muted small">Sa bàn là tái dựng mô phỏng phục vụ học tập; nhân vật, vị trí và hiệu ứng là minh hoạ trừ khi ghi có nguồn.</p>`;
  d.hidden = false; $('#sbDocs').classList.add('on'); $('#docsX').onclick = () => moTuLieu(true);
}
let OC = null;
function cheDo(c) {
  const cu = UI.che; UI.che = c;
  document.querySelectorAll('.modes button').forEach(b => { const on = b.dataset.m === c; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  $('#storybar').hidden = c !== 'phim'; $('#picker').hidden = true; if (c !== 'phim') { $('#docs').hidden = true; $('#sub').hidden = true; }
  $('#bt').hidden = c !== 'baotang';
  $('#tieuDe').textContent = c === 'phim' ? 'Theo dòng lịch sử · tái dựng có dẫn chuyện' : c === 'kham' ? 'Khám phá tự do' : 'Bảo tàng vật dụng, binh khí 1858';
  $('#help').textContent = c === 'phim' ? 'Kéo để nhìn quanh · ⏸ để dừng · Tư liệu để đọc nguồn' : c === 'kham' ? 'Kéo để xoay · cuộn/chụm để phóng to · bấm nút hồi để đổi thời điểm' : 'Kéo để xoay quanh hiện vật · chạm tên hiện vật để đọc thẻ · bấm “Đi bộ tham quan” để dạo trong bảo tàng';
  if (c === 'kham' || c === 'baotang') {
    if (!OC) { OC = new OrbitControls(camera, cv); OC.enableDamping = true; OC.maxPolarAngle = Math.PI * 0.495; OC.minDistance = 3; OC.maxDistance = 40000; }
    OC.enabled = true; theHien(null, false);
    if (c === 'kham') { const v = VT['dien-hai']; OC.target.set(v.x, gAt(v.x, v.n), -v.n); camera.position.set(v.x - 1200, 900, -v.n + 1600); OC.minDistance = 8; }
    else { baoTangVao(); }
    if (UI.chay && c === 'baotang') dung();
  } else if (OC) OC.enabled = false;
  if (cu === 'baotang' && c !== 'baotang') baoTangRa();
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let hoiCu = null;
const MM = { img: null, t: 0 };
function veBanDoNho(dt) {
  MM.t += dt; if (MM.t < 0.25) return; MM.t = 0;
  const cvm = $('#minimap canvas'), g = cvm.getContext('2d'), S = 300, R = 10200;
  const P = (x, n) => [((x - TAM[0]) + R) / (2 * R) * S, (R - (n - TAM[1])) / (2 * R) * S];
  if (MM.img && MM.img.complete) g.drawImage(MM.img, 0, 0, S, S); else { g.fillStyle = '#2a2119'; g.fillRect(0, 0, S, S); }
  g.strokeStyle = 'rgba(226,183,104,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(S / 2, S / 2, RSB / R * S / 2, 0, 6.3); g.stroke();
  for (const [k, ten] of [['dien-hai', 'Điện Hải'], ['an-hai', 'An Hải'], ['son-tra-tay', 'Sơn Trà']]) { const [x, y] = P(VT[k].x, VT[k].n); g.fillStyle = '#c44838'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#fff3d6'; g.font = '600 11px sans-serif'; g.fillText(ten, x + 5, y + 4); }
  for (const t of TAU) if (t.visible) { const [x, y] = P(t.userData.x, t.userData.n); if (x > 0 && x < S && y > 0 && y < S) { g.fillStyle = '#9ecbff'; g.beginPath(); g.arc(x, y, 2.2, 0, 6.3); g.fill(); } }
  const c = camera.position, d = new V3(); camera.getWorldDirection(d); const [x, y] = P(c.x, -c.z), an = Math.atan2(d.z, d.x);
  g.fillStyle = 'rgba(255,240,200,.28)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 30, an - 0.45, an + 0.45); g.closePath(); g.fill();
  g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(clamp(x, 4, S - 4), clamp(y, 4, S - 4), 4, 0, 7); g.fill();
  g.fillStyle = '#fff3d6'; g.font = '600 14px sans-serif'; g.fillText('B ↑', S - 32, 18);
}
function giaoDienCapNhat(t, sc, sh) {
  const i = ST.scenes.indexOf(sc);
  if (!UI.keo) $('#sbSeek').value = Math.round(t / ST.dur * 1000);
  $('#sbTime').textContent = ' ' + fmt(t) + ' / ' + fmt(ST.dur);
  if (sc !== hoiCu) {
    hoiCu = sc; $('#sbNum').textContent = String(i + 1).padStart(2, '0') + '/' + String(ST.scenes.length).padStart(2, '0'); $('#sbName').textContent = sc.title;
    $('#dateLbl').textContent = sc.date; $('#hoiChu').textContent = 'Hồi ' + (i + 1) + ' · ' + sc.title; $('#hoiChu').classList.remove('moi'); void $('#hoiChu').offsetWidth; $('#hoiChu').classList.add('moi');
    $('#mmLeg').textContent = sc.date + ' · ' + sc.title;
    if (!$('#docs').hidden) { $('#docs').hidden = true; moTuLieu(); }
  }
  let sub = ''; if (UI.che === 'phim') for (const s of sc.subs) if (t >= s[0] && t < s[1] + 0.4) sub = s[2];
  $('#sub').textContent = sub; $('#sub').hidden = !(sub && UI.cc && UI.che === 'phim');
}
// mức âm nền theo hồi
function amCapNhat(t, sc) {
  if (!UI.chay || !UI.am) { for (const k in AM.loops) amLap(k, 0); return; }
  const id = sc.id, tran = ['C04', 'C05', 'C06', 'C09'].includes(id);
  const camH = camera.position.y, gan = camH < 400 ? 1 : camH < 1500 ? 0.5 : 0.2;
  amLap('song', ['C01', 'C02', 'C03', 'C10', 'C11', 'C12'].includes(id) ? 0.2 : 0.1);
  amLap('songbo', ['C01', 'C02', 'C03', 'C04', 'C05', 'C11', 'C12'].includes(id) ? 0.55 * gan : 0.12 * gan);
  let dt = 1e9; for (const g of TAU) if (g.visible) dt = Math.min(dt, g.position.distanceTo(camera.position));
  amLap('songtau', dt < 250 ? 0.6 * (1 - dt / 250) + 0.15 : 0);
  amLap('chim', ['C01', 'C07', 'C08', 'C12'].includes(id) ? 0.25 : 0);
  amLap('chientruong', tran ? 0.16 : 0);
  amLap('trong', id === 'C06' || id === 'C09' ? 0.18 : 0);
  amLap('hanhquan', id === 'C06' && t < TE('C06-01') + 3 ? 0.3 : 0);
  amLap('bandan', (id === 'C06' && t > TC('C06', 4)) || (id === 'C09' && t > TS('C09-03')) ? 0.18 : 0);
  // giọng đọc rõ: khi đang có lời dẫn thì hạ hiệu ứng, nhạc
  const noi = UI.vo && sc.subs.some(s => t >= s[0] - 0.2 && t < s[1] + 0.3);
  if (AM.master && UI.am) AM.master.gain.setTargetAtTime(noi ? 0.5 : 0.8, AM.ctx.currentTime, 0.25);
  nhac.volume = clamp((tran ? 0.06 : 0.16) * (noi ? 0.65 : 1), 0, 1);
}

// ---------- khởi động ----------
let NGUA = null, NGUOI_NGUA = null, THUYEN_CHAI = null, TRAI = [];
async function khoiDong() {
  resize();
  const tien = (k, s) => { $('#fill').style.width = (k * 100) + '%'; $('#loadtxt').textContent = s; };
  tien(0.05, 'Đang tải kịch bản…');
  ST = await (await fetch(URLG('story.json'))).json();
  Object.assign(VT, await (await fetch(URLG('vitri.json'))).json());
  for (const s of ST.scenes) { SC[s.id] = s; for (const h of s.shots) SH[h.id] = h; }
  SAN.push([VT['dien-hai'].x, VT['dien-hai'].n, 125], [VT['an-hai'].x, VT['an-hai'].n, 90], [VT['son-tra-tay'].x, VT['son-tra-tay'].n, 30], [VT['dinh-hai'].x, VT['dinh-hai'].n, 30], [430, -5420, 20]);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi', 'chon-sang']) SAN.push([VT[k].x, VT[k].n, 45]);
  SAN.push([BT.M[0], BT.M[1], 55]);
  tien(0.15, 'Đang dựng địa hình vịnh Đà Nẵng…'); await dungDiaHinh(); waterU.hmap.value = HTEX; waterU.dmap.value = DTEX;
  tien(0.4, 'Đang dựng thành lũy…');
  TRANH.push([VT['dien-hai'].x, VT['dien-hai'].n, 160], [VT['an-hai'].x, VT['an-hai'].n, 110], [430, -5420, 60], [VT['trai-phap'].x, VT['trai-phap'].n, 90], [VT['son-tra-tay'].x, VT['son-tra-tay'].n, 60]);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) TRANH.push([VT[k].x, VT[k].n, 60]);
  // lũy (vết ƯỚC LƯỢNG theo sơ đồ 1859) — ranh không trồng cây
  const L1 = [[1560, -3300], [1100, -3330], [400, -3420], [-535, -3480], [-1300, -3300], [-2000, -2950]];
  const L2 = [[-535, -3560], [-300, -4500], [300, -5150], [1300, -5600], [1800, -5700]];
  const L3 = [[2300, -3700], [2700, -4600], [3150, -5900], [3700, -7000]];
  const L4 = [[-1600, -8000], [-900, -8050], [-300, -8150]];
  for (const L of [L1, L2, L3, L4]) for (let i = 0; i < L.length - 1; i++) for (let s = 0; s <= 1; s += 0.1) TRANH.push([lerp(L[i][0], L[i + 1][0], s), lerp(L[i][1], L[i + 1][1], s), 40]);
  TRANH.push([-260, -1320, 50], [-900, -3440, 50], [BT.M[0], BT.M[1], 70], [VT['hai-van'].x + 25, VT['hai-van'].n - 20, 45], [-505, -3510, 60], [430, -5420, 40]);
  await Promise.all([napGach(), napPhao()]);
  taoDienHai();
  taoThanh('an-hai', 46, 36, -0.2, 'nguyen', 10);
  taoPhaoDai('son-tra-tay', 2.6, 5); taoPhaoDai('dinh-hai', 0.6, 4);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi', 'chon-sang']) taoDon(k, k === 'lien-tri' ? 30 : 24);
  taoHaiVan();
  taoLuy(L1, TC('C08', 1), TC('C08', 4) + 2, 'L1'); taoLuy(L2, TC('C08', 3), TC('C08', 6), 'L2'); taoLuy(L3, TC('C08', 4), TC('C08', 7), 'L3'); taoLuy(L4, 0, 0.1, 'L4');
  banBanDo(430, -5420, 0.2); dungPhaoMau();
  tien(0.55, 'Đang dựng làng mạc, tre, dừa…'); await new Promise(r => setTimeout(r, 0));
  const dem = dungLang(); console.log('lang', dem); dungLangChai();
  // cây rừng thưa, bụi ven sông (V1.2)
  { const L = await (await fetch(URLG('cay.json'))).json(); const R = rng(77);
    const gC = new THREE.OctahedronGeometry(1, 0); gC.translate(0, 0.6, 0);
    const mk = (list, sx, sy, cols) => { const im = new THREE.InstancedMesh(gC, new THREE.MeshLambertMaterial({ color: 0xffffff }), list.length), m = new THREE.Matrix4(), c = new THREE.Color();
      list.forEach((t, i) => { const x = t[0] + TAM[0], n = t[1] + TAM[1], s = 0.7 + R() * 0.7; m.compose(new V3(x, gAt(x, n) - 0.3, -n), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), R() * 6.3), new V3(sx * s, sy * s * (0.8 + R() * 0.5), sx * s)); im.setMatrixAt(i, m); im.setColorAt(i, c.set(cols[Math.floor(R() * cols.length)])); });
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false; scene.add(im); return im; };
    const ok = (t) => !trongVungTranh(t[0] + TAM[0], t[1] + TAM[1]); const rung = L.filter(t => !t[2] && ok(t) && hAt(t[0] + TAM[0], t[1] + TAM[1]) > 0.6), bui = L.filter(t => t[2] && ok(t) && hAt(t[0] + TAM[0], t[1] + TAM[1]) > 0.5);
    CONG.rung = mk(rung, 3.6, 4.2, [0x2f4a26, 0x3a5a2c, 0x45662f, 0x2a4222]); CONG.bui = mk(bui, 2.2, 1.6, [0x4a6a30, 0x587a36, 0x3e5e2a]);
    console.log('cay v12', rung.length, bui.length); }
  { const g = new Ghep(), x0 = -890, n0 = -3452, y0 = gAt(x0, n0);
    for (let k = 0; k < 40; k++) g.tru(0.03, 0.05, 1.4, (k % 8) * 0.12 - 0.5, 0.06 + Math.floor(k / 8) * 0.08, (k % 3) * 0.05, 0xb8a868, 4, 0, 0, Math.PI / 2);
    for (let k = 0; k < 12; k++) g.tru(0.0, 0.04, 1.2, 1.2 + (k % 6) * 0.25, 0.5, 0.8 + Math.floor(k / 6) * 0.3, 0xa89a58, 4, 0, -0.5);
    const m = g.luoi(); m.position.set(x0, y0, -n0); scene.add(m); CONG.chong = m; }
  // trại liên quân (từ khi chiếm, gỡ khi rút 1860)
  TRAI.push(dungTrai(VT['trai-phap'].x, VT['trai-phap'].n - 10, 6, 5, 0.3, TS('C06-01')), dungTrai(VT['dien-hai'].x + 170, VT['dien-hai'].n + 120, 5, 4, 0.1, TS('C06-01')));
  // thùng lương thực, quân y (Hồi 10)
  { const g = new Ghep(), tp = VT['trai-phap']; const x0 = tp.x - 10, n0 = tp.n - 30, y0 = gAt(x0, n0);
    for (let k = 0; k < 9; k++) g.hop(0.9, 0.6, 0.6, (k % 3) * 1.0 - 1, 0.3 + Math.floor(k / 3) * 0.6 * (k > 5 ? 0 : 1), Math.floor(k / 3) * 0.7, 0x7a5a36);
    for (let k = 0; k < 5; k++) g.tru(0.32, 0.32, 0.8, 2.4 + (k % 2) * 0.7, 0.4, -1 + k * 0.6, 0x5a4026, 10);
    g.hop(0.7, 0.4, 0.5, -2.5, 0.2, 1.5, 0xe8e4d8); g.hop(0.15, 0.4, 0.4, -2.5, 0.42, 1.5, 0xc0302a); g.hop(0.4, 0.15, 0.15, -2.5, 0.42, 1.5, 0xc0302a);
    const m = g.luoi(); m.position.set(x0, y0, -n0); scene.add(m); CONG.hang = m; }
  tien(0.65, 'Đang dựng hạm đội…'); await napTau(); dungHamDoi();
  THUYEN_CHAI = (() => { const R = rng(31), L = []; for (let k = 0; k < 28; k++) { const x = -1800 + R() * 2200, n = -1250 + R() * 900; if (hAt(x, n) > -1.2) continue; L.push([x, 0, -n, R() * 6.28, 1]); } const im = instDat(thuyenChaiGeo(), L); im.userData.L = L; return im; })();
  NGUA = taoNgua(); NGUA.children.forEach(c => c.visible = false);   // V1.3: vẽ bằng ngựa có xương của Ngọc Hồi – Đống Đa
  tien(0.75, 'Đang bố trí quân…');
  dungBinhKhi();
  { let k = 0; const ds = [['phap', 320], ['nguyen', 320], ['danbinh', 160], ['dannam', 120], ['dannu', 120], ['ntp', 4], ['khachnam', 10], ['khachnu', 10], ['aodai', 10], ['ngua', 4]];
    await Promise.all(ds.map(async ([t, c]) => { await napXNV(t, c); k++; tien(0.75 + 0.08 * k / ds.length, 'Đang tải nhân vật có xương… ' + k + '/' + ds.length); })); }
  boTriNhanVat(); dungBaoTang();
  NGUOI_NGUA = nhom({ id: 'nguoi-ngua', phe: 'nguyen', so: 1, mu: 'nondau', vk: 'khong', lich: [[0, 0, 0, 'ngoi']], hien: [TS('C03-03') - 1, TE('C03-03') + 1], y: 0 });
  lichBan();
  // điểm cháy
  const cv0 = CONG['dien-hai'].position, ca = CONG['an-hai'].position;
  CHAY.push({ p: cv0.clone().add(new V3(-20, 5, -8)), t0: TC('C05', 4), t1: TS('C06-03'), to: 1.6 }, { p: cv0.clone().add(new V3(25, 4, 10)), t0: TC('C05', 5), t1: TS('C06-02'), to: 1.2 },
    { p: ca.clone().add(new V3(5, 4, -5)), t0: TC('C05', 2), t1: TS('C06-02'), to: 1.4 }, { p: W(VT['son-tra-tay'].x + 10, VT['son-tra-tay'].n + 8, 3), t0: TC('C04', 6), t1: TS('C05-03'), to: 1.2 },
    { p: W(-1500, -8150, 2), t0: TC('C06', 5), t1: TS('C07-01'), to: 1 }, { p: W(-200, -7900, 2), t0: TC('C06', 5) + 3, t1: TS('C07-01'), to: 0.8 });
  // đuốc đêm 31/8 trên thành, đồn
  for (const p of PHAO.filter(p => p.ten === 'dien-hai' || p.ten === 'an-hai' || p.ten === 'son-tra-tay')) CHAY.push({ p: p.pos.clone().add(new V3(-p.dir.z * 2.5, 2.2, p.dir.x * 2.5)), t0: TC('C03', 9) - 2, t1: TC('C04', 4), to: 0.12 });
  // mũi tên
  const A = (pts, cao, t0, t1, h0, h1) => muiTen(pts, cao, t0, t1, [h0, h1]);
  A([[-1200, 2700], [200, 2900], [1500, 2500]], 140, TS('C04-05'), TS('C04-05') + 4, TS('C04-05'), TE('C04-05'));
  A([[-700, 1500], [500, 600], [1400, -200], [2050, -1300]], 140, TS('C04-05') + 2, TS('C04-05') + 6, TS('C04-05'), TE('C04-05'));
  A([[-4300, -3250], [-3200, -6000], [-1500, -8000]], 160, TS('C06-03'), TS('C06-03') + 4, TS('C06-03'), TE('C06-03'));
  A([[1200, -2300], [800, -5500], [-200, -7600]], 160, TS('C06-03') + 1, TS('C06-03') + 5, TS('C06-03'), TE('C06-03'));
  A([[1100, -2200], [400, -2900], [-420, -3300]], 180, TS('C09-01'), TS('C09-01') + 3, TS('C09-01'), TE('C09-01'));
  A([[1400, -2300], [700, -3700], [450, -5000]], 180, TS('C09-01') + 1, TS('C09-01') + 4, TS('C09-01'), TE('C09-01'));
  A([[2200, -1800], [2350, -3000], [2400, -3650]], 180, TS('C09-01') + 2, TS('C09-01') + 5, TS('C09-01'), TE('C09-01'));
  A([[2350, -2000], [2900, -4200], [3150, -5800]], 180, TS('C09-01') + 3, TS('C09-01') + 6, TS('C09-01'), TE('C09-01'));
  A([[-420, -3200], [300, -2700], [1000, -2300]], 120, TS('C09-05'), TS('C09-05') + 4, TS('C09-05'), TE('C09-05'));
  // V1.4 — Hồi 2 (0:44–0:54): hải trình liên quân tiến vào cửa biển Đà Nẵng, vẽ thẳng trên sa bàn
  { const t0 = TS('C02-01'), t1 = TE('C02-01') + 0.6;
    muiTen([[7600, 9900], [4600, 9200], [1400, 7600], [-300, 4600], [-850, 2350]], 420, t0 + 0.6, t0 + 5.2, [t0, t1], 0xd8402e, 150);
    muiTen([[9800, 5200], [7200, 7600], [3400, 8300], [600, 6300], [-450, 2700]], 420, t0 + 2.2, t0 + 7.2, [t0, t1], 0xf2c14e, 120);
    const mt = (ten, x, n, h, a, b) => { nhan(ten, new V3(x, h, -n), 'mt', (t) => t > a && t < b); NHAN[NHAN.length - 1].luon = true; };
    mt('Hạm đội Pháp từ Biển Đông (Quảng Châu)', 6900, 9600, 700, t0 + 0.6, t1);
    mt('Tàu, quân Tây Ban Nha từ Manila', 9000, 5700, 700, t0 + 2.2, t1);
    mt('Cửa biển Đà Nẵng', -900, 2600, 500, t0 + 5.5, t1); }
  for (const [L, t0, t1] of [[L1, TC('C08', 1), TC('C08', 4) + 2], [L2, TC('C08', 3), TC('C08', 6)], [L3, TC('C08', 4), TC('C08', 7)]]) {
    const dv = []; for (let i = 0; i < L.length - 1; i++) for (let s2 = 0; s2 < 1; s2 += 0.2) { const x = lerp(L[i][0], L[i + 1][0], s2), n = lerp(L[i][1], L[i + 1][1], s2); dv.push([x, n, gAt(x, n) + 25]); }
    const e = L[L.length - 1]; dv.push([e[0], e[1], gAt(e[0], e[1]) + 25]);
    const o = muiTen(dv, 0, t0, t1, [t0, ST.dur + 10], 0xf2b84a, 26); o.vachLuy = true;
  }
  COI = [TS('C01-05') + 2, TS('C02-05') + 1, TS('C03-04') + 1, TE('C03-04') - 1, TS('C11-03') + 1, TS('C12-02') + 1];
  dungVung(); dungNhan(); dungNhanBaoTang(); diBoGiaoDien();
  lapLichTroi(); dungGiaoDien();
  tien(0.85, 'Đang tải giọng đọc và âm thanh…');
  await Promise.all([napVoice(), amNap()]);
  tien(0.95, 'Đang nạp lên card đồ hoạ…');
  // vẽ thử toàn cảnh để nạp mọi hình khối lên GPU (bài học 10)
  capNhat(TS('C04-01') + 20, 0.016, true); renderer.compile(scene, camera); renderer.render(scene, camera);
  capNhat(TS('C09-04') + 3, 0.016, true); renderer.render(scene, camera);
  capNhat(0, 0.016, true); renderer.render(scene, camera);
  tien(1, 'Sẵn sàng'); $('#load').classList.add('ready'); $('#go').hidden = false; $('#gohint').hidden = false;
  window.__sa = { get OC() { return OC; }, NHOM, PHAO, BT, CONG, DI, TAU, get NGUA() { return NGUA; }, nhin: (p, t) => { UI.che = 'tu'; camera.position.set(...p); camera.lookAt(...t); }, tua, phat, dung, get t() { return UI.t; }, buoc: (dt) => { UI.t += dt; }, ST, cheDo, capNhat, renderer, camera, scene };
  requestAnimationFrame(vong);
}
let tLast = performance.now(), tCoi = 0, COI = [];
function capNhat(t, dt, nhay) {
  nguoiU.uT.value = t; waterU.time.value = t; skyU.time.value = t;
  tauCapNhat(t); xuongCapNhat(t);
  // ngựa đưa tin
  { const t0 = TS('C03-03') - 1, t1 = TE('C03-03') + 1, a = [-7480, 9880], LN = VNAT.ngua_chay * (t1 - t0), b = [a[0] + 100 / 156.2 * LN, a[1] - 120 / 156.2 * LN], u = clamp((t - t0) / (t1 - t0), 0, 1);   // ngựa phi đúng sải chân
    const x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u); NGUA.visible = t > t0 && t < t1; NGUA.userData.q = (t - t0); NGUA.position.set(x, gAt(x, n), -n); NGUA.rotation.y = -Math.atan2(b[0] - a[0], b[1] - a[1]);
    NGUA.userData.chan.forEach((c, i) => c.rotation.x = Math.sin(t * 9 + (i % 2 ? 0 : 1.6) + (i > 1 ? 0.8 : 0)) * 0.6);
    NGUOI_NGUA.lich = [[0, x, n, 'ngoi']]; NGUOI_NGUA.huong = [b[0], b[1]]; NGUOI_NGUA.y = gAt(x, n) + 1.22; }
  let mt = null;
  if (UI.che === 'phim') mt = mayQuay(t); else if (DI.on) diBoCapNhat(dt || 0.016); else { OC && OC.update(); baoTangBay(); }
  matCat();
  NHOM_DT = dt; NHOM_NHAY = nhay; nhomCapNhat(t);
  const mua = troiCapNhat(t);
  // cờ: Nguyễn → Pháp khi mất; trở lại khi liên quân rút
  const doi = (k, t0) => { const f = COT_CO[k]; if (f) doiCo(f, t >= t0 && t < TE('C12-02') ? 'phap' : 'nguyen'); };
  doi('son-tra-tay', TC('C04', 13)); doi('an-hai', TC('C05', 6)); doi('dien-hai', TC('C05', 7) + 6);
  coBay(t); luyCapNhat(t);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) CONG[k].visible = t > SC.C07.t0;
  for (const im of TRAI) im.visible = t > im.userData.t0 && t < TE('C12-02');
  CONG.hang.visible = t > TS('C06-01') && t < TE('C11-05');
  THUYEN_CHAI.visible = t < TS('C03-04') || t > TS('C12-03');
  const camH = camera.position.y;
  VUNG.visible = (t > TS('C05-05') && t < TE('C12-01')) && camH > 1500; VUNG.userData.vien.m.visible = VUNG.visible;
  for (const x of DAU_X) x.visible = VUNG.visible && t < TS('C12-02');
  muiCapNhat(t);
  if (!nhay && UI.chay) for (const e of COI) if (tCoi < e && e <= t) { let d = 1e9; for (const g of TAU) if (g.visible) d = Math.min(d, g.position.distanceTo(camera.position)); amMot('coitau', clamp(1 - d / 9000, 0.25, 0.9)); }
  tCoi = t;
  for (const o of MUI) if (o.vachLuy) { o.m.visible = o.m.visible && camH > 1200; o.m.material.opacity = 0.85; }
  banCapNhat(t, dt, nhay); chayCapNhat(t, nhay ? 0 : dt); tauKhoi(t, nhay ? 0 : dt);
  if (!nhay) { KHOI.capNhat(dt, GIO); LUA.capNhat(dt, GIO); } else { KHOI.capNhat(0.001, GIO); LUA.capNhat(0.001, GIO); }
  muaCapNhat(t, mua > 0.5 && camH < 400 ? mua : 0);
  if (mt) {
    const id = mt.sh.the || ((t >= TC('C07', 4) - 0.3 && t < TC('C07', 7)) ? 'loi-binh' : mt.sh.id === 'C12-04' && t > (mt.sh.t0 + mt.sh.t1) / 2 ? 'hien-trang' : null);
    theHien(id, !!id && UI.che === 'phim'); document.body.classList.toggle('tua', id === 'tua-de');
    giaoDienCapNhat(t, mt.sc, mt.sh); amCapNhat(t, mt.sc);
  } else { const sc = ST.scenes.find(s => t >= s.t0 && t < s.t1) || ST.scenes[11]; giaoDienCapNhat(t, sc, null); amCapNhat(t, sc); }
  nhanCapNhat(t, UI.nhan, 0); veBanDoNho(dt || 0.016);
}
function vong() {
  requestAnimationFrame(vong);
  try {
    const now = performance.now(), dt = Math.min((now - tLast) / 1000, 0.1); tLast = now;
    if (UI.chay && !UI.keo) {
      if (voiceSan && UI.am && UI.vo && !voice.paused && Math.abs(voice.currentTime - UI.t) < 3) UI.t = voice.currentTime; else UI.t += dt * UI.toc;
      if (UI.t >= ST.dur) { UI.t = ST.dur; dung(); }
    }
    capNhat(UI.t, dt, NHAY); NHAY = false;
    renderer.render(scene, camera);
  } catch (e) { console.error(e); }
}
khoiDong().catch(e => { console.error(e); $('#loadtxt').textContent = 'Lỗi: ' + e.message; });
