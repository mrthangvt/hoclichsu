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
