/* Điện Biên Phủ 1954 — động cơ sa bàn (three.js 0.160). Đọc docs/TOM_TAT.md và docs/dien-bien-phu/KICH_BAN_V1.md trước khi sửa.
   Một địa hình gốc, nhiều trạng thái lịch sử: trạng thái cứ điểm lấy từ data/events.json, không viết cứng trong camera/hiệu ứng.
   Toạ độ Blender (X Đông, Y Bắc, Z lên, mét) → three: B(x,y,z) = (x, z, -y). */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {createAudio} from './audio.js';
import {startDirector} from './director.js';

const $=id=>document.getElementById(id);
const MOBILE=matchMedia('(pointer:coarse)').matches;
const B=(x,y,z=0)=>new THREE.Vector3(x,z,-y);
if(window.parent===window&&location.pathname.includes('/khong-gian/'))$('back').hidden=false;

/* ---------------- renderer ---------------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!MOBILE,powerPreference:'high-performance',logarithmicDepthBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.2:1.6));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xb9c4cc,0.00009);
const camera=new THREE.PerspectiveCamera(40,1,.3,80000);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=3;controls.maxDistance=18000;

const sky=new THREE.Mesh(new THREE.SphereGeometry(60000,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{chieu:{value:0},dem:{value:0},sang:{value:0},may:{value:.3},flash:{value:0}},
  vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}`,
  fragmentShader:`varying vec3 vd;uniform float chieu,dem,sang,may,flash;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
  void main(){float y=vd.y;
   vec3 c=mix(vec3(.80,.84,.86),vec3(.42,.58,.76),smoothstep(0.,.5,y));
   c=mix(c,mix(vec3(.98,.62,.34),vec3(.46,.42,.55),smoothstep(0.,.45,y)),chieu);
   c=mix(c,mix(vec3(.93,.78,.62),vec3(.55,.62,.72),smoothstep(0.,.4,y)),sang);
   float cl=fbm(vd.xz/(y+.2)*1.6);float cov=smoothstep(.7-may*.55,.95-may*.35,cl)*smoothstep(0.,.12,y);
   vec3 cc=mix(vec3(1.),vec3(.42,.44,.47),may);c=mix(c,cc,cov*(.5+may*.5));c=mix(c,vec3(.55,.57,.6)*(1.-chieu*.3),may*.55);
   vec3 nc=mix(vec3(.05,.05,.07),vec3(.01,.015,.03),smoothstep(0.,.4,y));nc+=step(.9988,h(floor(vd.xz/(y+.3)*300.)))*smoothstep(.1,.4,y)*.5*(1.-may);
   c=mix(c,nc,dem);c+=flash*vec3(.85,.85,1.)*(.3+.7*smoothstep(-.05,.4,y));
   if(y<0.)c=mix(c,c*.6,clamp(-y*6.,0.,1.));gl_FragColor=vec4(c,1.);}`}));
const SKY=sky.material.uniforms;sky.renderOrder=-1;scene.add(sky);
const hemi=new THREE.HemisphereLight(0xdfe8ff,0x4a4030,1.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1dc,2.6);scene.add(sun,sun.target);
const flashLight=new THREE.PointLight(0xffa050,0,6000,1.1);scene.add(flashLight);

/* ---------------- tải tài nguyên ---------------- */
const ASSETS=Object.assign({static:'models/static.glb',mau:'models/mau.glb',nhanvat:'models/nhanvat.glb',linh:'models/linh.glb',phap:'models/phap.glb',giap:'models/giap.glb',caymau:'models/cay_mau.glb',hq:'models/hq.glb',
  cay:'data/cay.bin',dat:'tex/dat.webp',datn:'tex/dat_n.webp',chim:'audio/chim-buoi-sang.mp3',caymeta:'data/cay.json',matdat:MOBILE?'tex/matdat_2k.jpg':'tex/matdat_4k.jpg',draco:'vendor/three/addons/libs/draco/',dracoType:'wasm'},window.ASSETS||{});
const draco=new DRACOLoader();draco.setDecoderPath(ASSETS.draco);draco.setDecoderConfig({type:ASSETS.dracoType});
const loader=new GLTFLoader();loader.setDRACOLoader(draco);
const W8={static:.34,mau:.1,nhanvat:.1,linh:.1,phap:.03,giap:.02,caymau:.02,hq:.03,matdat:.16,cay:.12};const prog={};
function setProg(k,v){prog[k]=v;let s=0;for(const q in W8)s+=(prog[q]||0)*W8[q];$('fill').style.width=(s*100).toFixed(0)+'%'}
function fetchBuf(url,key){return new Promise((res,rej)=>{const x=new XMLHttpRequest();const b64=url.endsWith('.txt');x.open('GET',url);x.responseType=b64?'text':'arraybuffer';
  x.onprogress=e=>{if(e.total)setProg(key,e.loaded/e.total)};x.onerror=()=>rej(new Error('Không tải được '+url));
  x.onload=()=>{if(x.status>=400)return rej(new Error('Không tải được '+url));setProg(key,1);if(!b64)return res(x.response);
    const bin=atob(x.responseText.trim());const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);res(u.buffer)};x.send()})}
const parse=buf=>new Promise((res,rej)=>loader.parse(buf,'',res,rej));
const json=u=>fetch(u).then(r=>r.json());
const imgTex=(buf,type='image/jpeg')=>new Promise((res,rej)=>{const url=URL.createObjectURL(new Blob([buf],{type}));new THREE.TextureLoader().load(url,t=>{URL.revokeObjectURL(url);res(t)},undefined,rej)});
const [gS,gM,gN,gL,gP,gG,gC,gH,TEX,TDAT,TDATN,CAY,CAYM,SC,PLACES,EVENTS,SCENES,SOURCES]=await Promise.all([
  fetchBuf(ASSETS.static,'static').then(parse),fetchBuf(ASSETS.mau,'mau').then(parse),fetchBuf(ASSETS.nhanvat,'nhanvat').then(parse),fetchBuf(ASSETS.linh,'linh').then(parse),fetchBuf(ASSETS.phap,'phap').then(parse),fetchBuf(ASSETS.giap,'giap').then(parse),fetchBuf(ASSETS.caymau,'caymau').then(parse),fetchBuf(ASSETS.hq,'hq').then(parse),
  fetchBuf(ASSETS.matdat,'matdat').then(imgTex),fetchBuf(ASSETS.dat,'dat').then(b=>imgTex(b,'image/webp')),fetchBuf(ASSETS.datn,'datn').then(b=>imgTex(b,'image/webp')),fetchBuf(ASSETS.cay,'cay').then(b=>new Int16Array(b)),json(ASSETS.caymeta),
  json('data/scene.json'),json('data/places.json'),json('data/events.json'),json('data/scenes.json'),json('data/sources.json')
]).catch(e=>{$('loadtxt').textContent=e.message;throw e});
$('loadtxt').textContent='Đang dựng sa bàn…';

/* ---------------- địa hình + lưới độ cao (camera an toàn) ---------------- */
const world=gS.scene;scene.add(world);
let ground=null;world.traverse(o=>{if(o.isMesh&&/^DiaHinh/.test(o.name))ground=o});
const HG=(()=>{const X0=-5500,Y0=-7360,S=20,NX=519,NY=636,h=new Float32Array(NX*NY).fill(-1e9);
  const p=ground.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const ix=Math.round((x-X0)/S),iy=Math.round((-z-Y0)/S);if(ix>=0&&iy>=0&&ix<NX&&iy<NY){const k=iy*NX+ix;if(y>h[k])h[k]=y}}
  let peak=-1e9;for(let i=0;i<h.length;i++){if(h[i]<-1e8)h[i]=0;if(h[i]>peak)peak=h[i]}
  return{X0,Y0,S,NX,NY,h,peak}})();
// độ cao địa hình tại (x,y) Blender
function hAt(x,y){const fx=Math.min(HG.NX-1.001,Math.max(0,(x-HG.X0)/HG.S)),fy=Math.min(HG.NY-1.001,Math.max(0,(y-HG.Y0)/HG.S));
  const i=Math.floor(fx),j=Math.floor(fy),u=fx-i,v=fy-j,H=HG.h,N=HG.NX;
  return H[j*N+i]*(1-u)*(1-v)+H[j*N+i+1]*u*(1-v)+H[(j+1)*N+i]*(1-u)*v+H[(j+1)*N+i+1]*u*v}
const hT=(x,z)=>hAt(x,-z);   // theo toạ độ three
const PEAK=HG.peak;          // đỉnh núi cao nhất trong sa bàn (đơn vị three)
const inValley=(x,z)=>x>HG.X0-200&&x<HG.X0+HG.S*HG.NX+200&&-z>HG.Y0-200&&-z<HG.Y0+HG.S*HG.NY+200;
/* camera an toàn: không chui vào núi, không bị núi che tầm nhìn; góc cao luôn trên đỉnh núi cao nhất */
const _p=new THREE.Vector3();
function safeEye(eye,tgt,high){if(!inValley(eye.x,eye.z))return eye;
  let r=0;for(const [dx,dz] of [[0,0],[40,0],[-40,0],[0,40],[0,-40]])r=Math.max(r,hT(eye.x+dx,eye.z+dz));
  const dist=eye.distanceTo(tgt);eye.y=Math.max(eye.y,r+Math.max(1.6,Math.min(60,dist*.04)));
  if(high)eye.y=Math.max(eye.y,PEAK+220);
  for(let it=0;it<3;it++){let need=0;for(let k=1;k<24;k++){const f=k/24;_p.lerpVectors(eye,tgt,f);const dT=dist*(1-f);if(dT<8)continue;const g=hT(_p.x,_p.z)+Math.min(6,dT*.08);if(g>_p.y)need=Math.max(need,(g-_p.y)/(1-f))}
    if(need<=0)break;eye.y+=need+2}
  return eye}

/* ---------------- lớp (layer) theo tên đối tượng xuất từ Blender ---------------- */
const CAT={fortifications:[],vn:[],supply:[],routes:[],villages:[],trench_vn:null,trench_fr:null,wire:null,coPhap:null};
const RX={fortifications:/^(Ham_|UngCoi_|Ung_|Phao_105|XeTang_|XeTai_|DoanhTrai_|U_BaoVe|MayBay_|DuongBang_|Cau_)/,vn:/^(TranDiaPhao|CaoXa_)/,supply:/^(DC_|XeDapTho_|PhaoDangKeo_)/,routes:/^Duong_(KeoPhao|XeTho)/,villages:/^Ban_/};
for(const o of [...world.children]){const n=o.name;
  if(n==='Hao_QDND_BaoVay')CAT.trench_vn=o;else if(/^Hao_Phap/.test(n))CAT.trench_fr=o;else if(/^DayThepGai/.test(n))CAT.wire=o;
  else if(/^Co_Phap/.test(n))CAT.coPhap=o;else if(/^Rung_Cay/.test(n))world.remove(o);
  else for(const k in RX)if(RX[k].test(n)){CAT[k].push(o);break}}
world.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];
  for(const m of ms){if(!m)continue;if(m.name==='M_NuocSong'){m.color.set(0x3a4630);m.roughness=.2;m.metalness=.05}else{m.roughness=Math.max(m.roughness??.9,.75);m.metalness=Math.min(m.metalness??0,.2)}}});
// đường băng sân bay Mường Thanh (toạ độ Blender): mở rộng 1,6 lần; hành lang đường băng không có hào/hầm
const RW={s:[-1376,-678],u:(()=>{const x=-566,y=2332,l=Math.hypot(x,y);return[x/l,y/l]})(),L:1150,half:80};
const inRunway=(x,y,pad=0)=>{const dx=x-RW.s[0],dy=y-RW.s[1];const a=dx*RW.u[0]+dy*RW.u[1],b=-dx*RW.u[1]+dy*RW.u[0];return a>-90-pad&&a<RW.L+90+pad&&Math.abs(b)<RW.half+pad};
for(const o of [...world.children]){const n=o.name;
  if(/^DuongBang_MuongThanh/.test(n))o.traverse(c=>{if(!c.isMesh)return;const p=c.geometry.attributes.position;const cx=RW.s[0]+RW.u[0]*RW.L/2,cy=RW.s[1]+RW.u[1]*RW.L/2;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=-p.getZ(i);const dx=x-cx,dy=y-cy;let a=dx*RW.u[0]+dy*RW.u[1],b=-dx*RW.u[1]+dy*RW.u[0];a*=1.15;b*=1.6;
      const nx=cx+a*RW.u[0]-b*RW.u[1],ny=cy+a*RW.u[1]+b*RW.u[0];p.setX(i,nx);p.setZ(i,-ny);p.setY(i,hAt(nx,ny)+.35)}p.needsUpdate=true;c.geometry.computeBoundingSphere()});
  if(/^Song_NamRom/.test(n))o.traverse(c=>{if(!c.isMesh)return;const p=c.geometry.attributes.position;for(let i=0;i+1<p.count;i+=2){const ax=p.getX(i),az=p.getZ(i),bx=p.getX(i+1),bz=p.getZ(i+1);const mx=(ax+bx)/2,mz=(az+bz)/2;
      p.setX(i,mx+(ax-mx)*1.9);p.setZ(i,mz+(az-mz)*1.9);p.setX(i+1,mx+(bx-mx)*1.9);p.setZ(i+1,mz+(bz-mz)*1.9)}p.needsUpdate=true;c.geometry.computeBoundingSphere()});
  if(/^(Ham_|UngCoi_|Ung_|DoanhTrai_|XeTai_)/.test(n)&&!/^Ham_ChiTiet|^Ham_ChiHuy/.test(n)){const b=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());if(inRunway(b.x,-b.z,10)){world.remove(o);CAT.fortifications=CAT.fortifications.filter(x=>x!==o)}}
  if(/^MayBay_(F8F|C47)|^U_BaoVe/.test(n)){world.remove(o);CAT.fortifications=CAT.fortifications.filter(x=>x!==o)}}
for(const o of CAT.supply)world.remove(o);CAT.supply.length=0;
for(const t of[TDAT,TDATN]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8}TDAT.colorSpace=THREE.SRGBColorSpace;
const EARTH=/^(Bao_Cat|BaoCat|Hao_DayToi|Dat_|Van_DayHao|Go_CotHao|Go_MaiHam)/;
function earthify(m){if(m.userData.earth)return;m.userData.earth=true;const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{if(ob)ob(sh,r);sh.uniforms.tDat={value:TDAT};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWq;varying vec3 vNq;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWq=(modelMatrix*vec4(transformed,1.)).xyz;vNq=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWq;varying vec3 vNq;uniform sampler2D tDat;')
   .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 n=abs(vNq);vec3 tx=texture2D(tDat,vWq.zy*.45).rgb*n.x+texture2D(tDat,vWq.xz*.45).rgb*n.y+texture2D(tDat,vWq.xy*.45).rgb*n.z;tx/=max(.001,n.x+n.y+n.z);diffuseColor.rgb*=tx*2.1;}')};
  const k=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>k+'earth'}
world.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m&&EARTH.test(m.name))earthify(m)});
// đường mòn xe thồ/kéo pháo: đất nện tối màu, không phát sáng, dán sát mặt đất
for(const r of CAT.routes)r.traverse(c=>{if(!c.isMesh)return;const m=new THREE.MeshStandardMaterial({color:0x6b5640,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-2});earthify(m);c.material=m;c.renderOrder=1});
// tâm của từng đối tượng công sự Pháp (để dựng dần trong cảnh 02)
const PCX=-720,PCY=-703;
for(const o of CAT.fortifications){const b=new THREE.Box3().setFromObject(o);const c=b.getCenter(new THREE.Vector3());o.userData.d=Math.hypot(c.x-PCX,-c.z-PCY);o.userData.s0=o.scale.clone()}

/* vật liệu có "dựng dần" (reveal theo bán kính) và "hào mọc dần" (theo khoảng cách tới cứ điểm) */
function patch(mat,kind){const m=mat.clone();const prev=mat.onBeforeCompile&&mat.userData.earth?mat.onBeforeCompile:null;m.userData.u={uR:{value:1e9},uC:{value:new THREE.Vector2(PCX,-PCY)},uT:{value:1e9},uRw:{value:new THREE.Vector4(RW.s[0],-RW.s[1],RW.u[0],-RW.u[1])}};
  m.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);Object.assign(sh.uniforms,m.userData.u);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;'+(kind==='kc'?'attribute float kc;varying float vKc;':''))
      .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;'+(kind==='kc'?'vKc=kc;':''));
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uR,uT;uniform vec2 uC;uniform vec4 uRw;'+(kind==='kc'?'varying float vKc;':''))
      .replace('void main() {','void main() {\n{vec2 d=vWp.xz-uRw.xy;float a=dot(d,uRw.zw),b=abs(d.x*uRw.w-d.y*uRw.z);if(a>-90.&&a<'+(RW.L+90).toFixed(1)+'&&b<'+RW.half.toFixed(1)+'.)discard;}\n'+(kind==='kc'?'if(vKc<uT)discard;':'if(distance(vWp.xz,uC)>uR)discard;'))};
  m.customProgramCacheKey=()=>'p'+kind+(prev?'e':'');return m}
function patchObj(o,kind){if(!o)return null;const U=[];o.traverse(c=>{if(c.isMesh){if(Array.isArray(c.material))c.material=c.material.map(x=>{const p=patch(x,kind);U.push(p.userData.u);return p});else{c.material=patch(c.material,kind);U.push(c.material.userData.u)}}});return U}
const REV_FR=[...(patchObj(CAT.trench_fr,'r')||[]),...(patchObj(CAT.wire,'r')||[])];
// hào bao vây: thuộc tính kc = khoảng cách (m) tới rìa cứ điểm gần nhất → hào "mọc" từ chân núi vào
const SITES=SC.cu_diem;let KC_MAX=0;
if(CAT.trench_vn){CAT.trench_vn.traverse(c=>{if(!c.isMesh)return;const p=c.geometry.attributes.position,kc=new Float32Array(p.count);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=-p.getZ(i);let d=1e9;for(const s of SITES)d=Math.min(d,Math.hypot(x-s.x,y-s.y)-s.r);kc[i]=d;if(d>KC_MAX)KC_MAX=d}
  c.geometry.setAttribute('kc',new THREE.BufferAttribute(kc,1))})}
const REV_VN=patchObj(CAT.trench_vn,'kc')||[];

/* mặt đất: tô trạng thái cứ điểm và vùng kiểm soát thẳng lên địa hình (bám dốc) */
TEX.flipY=false;TEX.colorSpace=THREE.SRGBColorSpace;TEX.anisotropy=renderer.capabilities.getMaxAnisotropy();
const NR=24;
const GU={tDat:{value:TDAT},uPl:{value:Array.from({length:NR},()=>new THREE.Vector3(0,0,0))},uPc:{value:Array.from({length:NR},()=>new THREE.Vector4(0,0,0,0))},
  uCtrl:{value:new THREE.Vector4(0,0,0,0)},uCtrlC:{value:new THREE.Color(0x4f74b8)},uWet:{value:0}};
const groundMat=new THREE.MeshLambertMaterial({map:TEX});
groundMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,GU);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWp;uniform sampler2D tDat;uniform vec3 uPl[${NR}];uniform vec4 uPc[${NR}];uniform vec4 uCtrl;uniform vec3 uCtrlC;uniform float uWet;`)
  .replace('#include <map_fragment>',`#include <map_fragment>
  {float dc=distance(vWp,cameraPosition);float k=1.-smoothstep(150.,700.,dc);vec3 d=texture2D(tDat,vWp.xz*.25).rgb;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*d*2.2,k*.75);}
  diffuseColor.rgb*=1.-uWet*.32;
  float camF=smoothstep(140.,650.,distance(vWp,cameraPosition));// vòng trạng thái mờ dần khi xuống cận
  for(int i=0;i<${NR};i++){if(uPc[i].a<.001)continue;float d=distance(vWp.xz,uPl[i].xy);float r=uPl[i].z;
    float ring=smoothstep(r*.06+3.,0.,abs(d-r));float fill=(1.-smoothstep(r*.85,r,d))*.22;
    diffuseColor.rgb=mix(diffuseColor.rgb,uPc[i].rgb,clamp((ring*.85+fill)*uPc[i].a*camF,0.,1.));}
  if(uCtrl.w>0.){float d=distance(vWp.xz,uCtrl.xy);float edge=smoothstep(16.,0.,abs(d-uCtrl.z));float inn=1.-smoothstep(uCtrl.z-10.,uCtrl.z,d);
    diffuseColor.rgb=mix(diffuseColor.rgb,uCtrlC,(edge*.8+inn*.16)*uCtrl.w*camF);}`)};
groundMat.customProgramCacheKey=()=>'ground';
ground.material=groundMat;

/* ---------------- rừng cây (từ data/cay.bin) ---------------- */
const TREES=[],TPER=[];(function(){const step=MOBILE?6:2,N=CAY.length/5,types=CAYM.loai,dims=CAYM.kich_thuoc;
  const cols=[0x2f4a1f,0x3a5524,0x284219,0x46602a,0x324d20,0x3d5a26,0x2b461c];const per=types.map(()=>[]);
  for(let i=0;i<N;i+=step){const t=Math.floor(CAY[i*5+4]/100);if(per[t])per[t].push(i)}
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);const bark=new THREE.MeshLambertMaterial({color:0x3a2a1c});
  types.forEach((name,t)=>{const d=dims[name]||[7,7,12],H=d[2],W=(d[0]+d[1])/2;
    const crown=new THREE.IcosahedronGeometry(.5,0);crown.scale(W*.85,H*.62,W*.85);crown.translate(0,H*.6,0);
    const trunk=new THREE.CylinderGeometry(H*.012,H*.02,H*.45,5,1,true);trunk.translate(0,H*.225,0);
    const mC=new THREE.InstancedMesh(crown,new THREE.MeshLambertMaterial({color:cols[t%cols.length],flatShading:true}),per[t].length),mT=new THREE.InstancedMesh(trunk,bark,per[t].length);
    per[t].forEach((i,k)=>{const o=i*5;p.copy(B(CAY[o]/4,CAY[o+1]/4,CAY[o+2]/10));q.setFromAxisAngle(up,CAY[o+3]/1000);const s=(CAY[o+4]%100)/30;sc.set(s,s,s);m4.compose(p,q,sc);mC.setMatrixAt(k,m4);mT.setMatrixAt(k,m4)});
    mC.userData.idx=per[t];scene.add(mC,mT);TREES.push(mC,mT);TPER.push({name,mC,mT})})})();
function clearTreesNear(polys,rad){const m4=new THREE.Matrix4(),p=new THREE.Vector3(),zero=new THREE.Matrix4().makeScale(0,0,0);
  for(let k=0;k<TREES.length;k+=2){const mC=TREES[k],mT=TREES[k+1];let ch=false;for(let i=0;i<mC.count;i++){mC.getMatrixAt(i,m4);p.setFromMatrixPosition(m4);const x=p.x,y=-p.z;
    for(const P of polys){let hit=false;for(let j=0;j<P.length-1;j++){const a=P[j],b=P[j+1];const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1;const u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/L));
      if(Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)<rad){hit=true;break}}if(hit){mC.setMatrixAt(i,zero);mT.setMatrixAt(i,zero);ch=true;break}}}
    if(ch){mC.instanceMatrix.needsUpdate=mT.instanceMatrix.needsUpdate=true}}}

/* ---------------- Sở Chỉ huy Mường Phăng (bối cảnh riêng, đặt ngoài khung sa bàn ở x=30000) ---------------- */
const hq=gH.scene;scene.add(hq);hq.visible=false;
{const L=new THREE.PointLight(0xffb060,45,40,1.6);L.position.copy(B(30000.9,.2,1.6));hq.add(L);const L2=new THREE.PointLight(0xffc080,18,50,1.4);L2.position.copy(B(29998,-3,2.6));hq.add(L2);const moon=new THREE.DirectionalLight(0x8090c0,1.4);moon.position.copy(B(30020,-30,40));moon.target.position.copy(B(30000,0,0));hq.add(moon,moon.target)}
const miniS=.00013;const mini=new THREE.Mesh(ground.geometry,groundMat);mini.scale.set(miniS,miniS*1.6,miniS);mini.rotation.y=Math.PI/2;
mini.position.copy(B(30000-1035*miniS,-.4+320*miniS,.86));hq.add(mini);
const mapCard=(()=>{const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.rotation.x=-Math.PI/2;m.position.copy(B(30000,-1.12,.9));hq.add(m);
  function draw(k){const x=cv.getContext('2d');x.clearRect(0,0,1024,256);x.fillStyle='rgba(240,228,200,.95)';x.fillRect(0,0,1024,256);x.textAlign='center';
    x.font='bold 64px "Be Vietnam Pro",sans-serif';x.fillStyle='#5a1a10';x.fillText('ĐÁNH NHANH, GIẢI QUYẾT NHANH',512,100);
    if(k>0){x.strokeStyle='rgba(180,20,20,'+Math.min(1,k*2)+')';x.lineWidth=10;x.beginPath();x.moveTo(60,80);x.lineTo(60+904*Math.min(1,k*2),80);x.stroke();
      x.globalAlpha=Math.max(0,Math.min(1,k*2-1));x.fillStyle='#b01010';x.fillText('ĐÁNH CHẮC, TIẾN CHẮC',512,200);x.globalAlpha=1}t.needsUpdate=true}
  draw(0);return{draw,k:-1}})();

/* ---------------- mô hình mẫu + nhân vật có hoạt hình ---------------- */
const MAU={};for(const o of gM.scene.children)MAU[o.name]=o;
function mau(name){const o=MAU[name];if(!o)return new THREE.Group();const c=o.clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.set(1,1,1);return c}
const CLIPS={};for(const c of gN.animations)CLIPS[c.name]=c;
const CLIPS_L={};for(const c of gL.animations)CLIPS_L[c.name]=c;
const CLIPS_P={};for(const c of gP.animations)CLIPS_P[c.name]=c;
// Đại tướng (model mới) + động tác chỉ sa bàn / đứng nghe; dùng chung khung xương với bộ đội
const CLIPS_G={};for(const c of gG.animations){CLIPS_G[c.name]=c;if(!CLIPS_L[c.name])CLIPS_L[c.name]=c}
// súng trường mới (model anh gửi) thay cho súng cũ của bộ đội: cùng hệ trục (nòng -Y), dùng chung lưới với súng lính Pháp
(()=>{let gp=null;gP.scene.traverse(o=>{if(!gp&&o.isMesh&&/Sung/.test(o.name+(o.parent?o.parent.name:'')))gp=o});const gb=gL.scene.getObjectByName('SungTruong_1954');if(!gp||!gb)return;
  if(gb.isMesh){gb.geometry=gp.geometry;gb.material=gp.material}else{for(const c of [...gb.children])if(c.isMesh)gb.remove(c);const m=new THREE.Mesh(gp.geometry,gp.material);m.name='SungTruong_1954_moi';gb.add(m)}})();
// tên động tác chung → động tác rig Thành cổ (bộ đội, lính Pháp)
// lính Pháp: rig riêng (người lính Thành cổ), chỉ dùng động tác của chính rig này
const MAPP={tu_binh:'DiKhom_TaiCho',chay:'ChayLonNhao_TaiCho',ChayToi_TaiCho:'ChayLonNhao_TaiCho',di_bo:'DiNgamBan_TaiCho',DiCamSung_TaiCho:'DiNgamBan_TaiCho',dung:'DungNgam',NgoiNghi:'QuyNghi',VuonLay:'DungNgam',KeoVat:'DiKhom_TaiCho',DungNapDan:'DungNgam',NamNapDan:'NupQuanSat',keo_nang:'DiKhom_TaiCho',day:'DiKhom_TaiCho'};
const MAPL={chay:'ChayToi_TaiCho',di_bo:'DiCamSung_TaiCho',dung:'DungNgam',keo_nang:'KeoVat',day:'DiKhom_TaiCho',keo_day:'KeoVat',day_xe:'DiCamSung_TaiCho'};
const SRC={dancong:{g:gN,clips:CLIPS,show:['DanCong_Mesh'],s:1.66/1.81},daituong:{g:gG,clips:CLIPS_G,show:['DaiTuong_V2'],s:1.68/1.75,map:{dung:'ChiTaySaBan',VuonLay:'ChiTaySaBan'},own:true},
  bodoi:{g:gL,clips:CLIPS_L,show:['QDND_V2_Nguoi','SungTruong_1954'],s:1.64/1.70,map:MAPL},linhphap:{g:gP,clips:CLIPS_P,show:['VNCH_V2_Nguoi','Sung_Phap_1954'],s:1.72/1.74,map:MAPP,own:true}};
const XCLIP={};function xclip(n){if(XCLIP[n])return XCLIP[n];const c=CLIPS_L[n]||CLIPS[n];if(!c)return null;const k=c.clone();k.tracks=k.tracks.filter(t=>!/\.position$/.test(t.name));XCLIP[n]=k;return k}
// hiệu chỉnh hướng súng bộ đội theo từng động tác (tính trong Blender: nòng hướng về tay trái khi cầm 2 tay, súng không bị lật nghiêng)
const GUNC={ChayToi_TaiCho:[0.1847,0.207,-0.6927,0.6657],DiCamSung_TaiCho:[0.0762,-0.0486,-0.8849,0.457],DungBan:[0.0348,-0.0828,-0.8128,0.5756],DungNapDan:[0.7445,-0.3002,-0.4364,0.4065],NamNapDan:[0.3414,-0.1014,-0.8926,0.2764],NgoiNghi:[0.0575,0.8653,-0.3436,0.3603],DungNgam:[0.0311,-0.0871,-0.8134,0.5743],NgaXuong_TaiCho:[-0.754,-0.008,-0.6565,0.0221],VuonLay:[0.1533,-0.405,-0.1942,0.8802],NhatDo:[-0.0943,0.5989,-0.442,0.6611],DiKhom_TaiCho:[0.2726,-0.1555,-0.7549,0.5758],ChayLonNhao_TaiCho:[0.6728,0.1682,0.6833,0.2285],ChayBan_TaiCho:[-0.4913,-0.0766,-0.7521,0.4326],DiNgamBan_TaiCho:[-0.5298,-0.0232,-0.7499,0.3955],BoThap_TaiCho:[-0.003,-0.0004,-0.3111,0.9504],TruonToi_TaiCho:[0.0804,-0.002,-0.5732,0.8155],NhaoRaTruoc_TaiCho:[-0.4365,0.8281,-0.1604,0.3129],DiNgangBan_TaiCho:[-0.4599,-0.0377,-0.7723,0.4365],TrungDan_TaiCho:[-0.5388,0.0721,-0.7132,0.4425]};
const GUNQ={};for(const k in GUNC)GUNQ[k]=new THREE.Quaternion(...GUNC[k]).normalize();
function makeChar(kind,clip,opt={}){const S=SRC[kind];const root=SkeletonUtils.clone(S.g.scene);root.traverse(o=>{if(o.isMesh){o.visible=(S.show.includes(o.name)||S.show.includes(o.parent&&o.parent.name))&&!(opt.noGun&&/Sung/i.test(o.name+(o.parent?o.parent.name:'')));o.frustumCulled=false}});
  const gunN=kind==='bodoi'?root.getObjectByName('SungTruong_1954'):null;const gunQ0=gunN?gunN.quaternion.clone():null;const fixGun=c=>{if(!gunN)return;const q=GUNQ[c]||GUNQ.DungBan;gunN.quaternion.copy(gunQ0).multiply(q)};
  const g=new THREE.Group();g.add(root);root.scale.setScalar(S.s);const mixer=new THREE.AnimationMixer(root);const nm=n=>S.clips[n]?n:(S.map&&S.map[n])||n;
  let cur=mixer.clipAction(S.clips[nm(clip)]||Object.values(S.clips)[0]);cur.play();fixGun(nm(clip));
  const act=n=>{const c=S.clips[nm(n)]||(S.own?S.clips[S.map.dung]:xclip(n));return c?mixer.clipAction(c):null};
  return{obj:g,mixer,set(t){mixer.setTime(t)},pose(n,tt,once){const a=act(n);if(!a)return;if(a!==cur){cur.stop();a.play();cur=a;fixGun(a.getClip().name)}const d=a.getClip().duration;a.time=once?Math.min(Math.max(0,tt),d-.01):((tt%d)+d)%d;mixer.update(0)},play(n){const c=S.clips[nm(n)];if(!c)return;const a=mixer.clipAction(c);if(a===cur)return;a.reset().play();cur.crossFadeTo(a,.25,false);cur=a;fixGun(c.name)},has:n=>!!S.clips[nm(n)]}}

/* ---------------- hiệu ứng: nổ, khói, chớp, mưa ---------------- */
function spriteTex(stops){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);for(const[a,c]of stops)g.addColorStop(a,c);x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)}
function noiseTex(col,dark){const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');
  for(let k=0;k<26;k++){const r=12+Math.random()*30,a=Math.random()*6.28,d=Math.random()*26;const cx=64+Math.cos(a)*d,cy=64+Math.sin(a)*d;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);
    const c=col(k);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);x.fillStyle=g;x.fillRect(0,0,N,N)}
  const im=x.getImageData(0,0,N,N);for(let i=0;i<N*N;i++){const dx=(i%N)-64,dy=Math.floor(i/N)-64;const f=Math.max(0,1-Math.hypot(dx,dy)/64);im.data[i*4+3]*=f*f*(.75+.5*Math.random())}x.putImageData(im,0,0);return new THREE.CanvasTexture(cv)}
const T_FIRE=noiseTex(k=>k%3?['rgba(255,190,90,.5)','rgba(255,90,10,0)']:['rgba(255,245,200,.7)','rgba(255,140,30,0)']);
const T_SMOKE=noiseTex(k=>[`rgba(${60+k%4*8},${56+k%4*7},${52+k%4*6},.45)`,'rgba(70,66,60,0)']);
const T_FIRE0=spriteTex([[0,'rgba(255,245,210,1)'],[.3,'rgba(255,160,50,.95)'],[1,'rgba(255,60,0,0)']]);

const T_DOT=spriteTex([[0,'rgba(255,255,255,1)'],[1,'rgba(255,255,255,0)']]);
class FXPool{constructor(mat,n){this.s=[];for(let i=0;i<n;i++){const s=new THREE.Sprite(mat.clone());s.visible=false;scene.add(s);this.s.push(s)}this.i=0}
  begin(){this.i=0}take(){const s=this.s[this.i++];return s}end(){for(let k=this.i;k<this.s.length;k++)this.s[k].visible=false}}
const FIRE=new FXPool(new THREE.SpriteMaterial({map:T_FIRE,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}),700);
const SMOKE=new FXPool(new THREE.SpriteMaterial({map:T_SMOKE,depthWrite:false,transparent:true}),900);
// mây: các đám mây trôi chậm, lảng vảng quanh sườn và đỉnh núi
const CLOUDS=(()=>{const tex=noiseTex(k=>['rgba(255,255,255,.55)','rgba(255,255,255,0)']);const list=[];let tries=0;
  while(list.length<(MOBILE?28:56)&&tries<5000){tries++;const x=HG.X0+Math.random()*HG.S*HG.NX,y=HG.Y0+Math.random()*HG.S*HG.NY;const h=hAt(x,y);if(h<240)continue;
    const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.0,color:0xf2f2f2});const sp=new THREE.Sprite(m);const sz=260+Math.random()*520;sp.scale.set(sz*1.8,sz*.6,1);
    sp.position.copy(B(x,y,h+40+Math.random()*160));sp.userData={x,y,base:sp.position.y,sz,ph:Math.random()*6,a:.35+Math.random()*.35};scene.add(sp);list.push(sp)}
  return{list,tick(t,wind,cam,dark){for(const c of list){const u=c.userData;let x=u.x+t*(4+wind*10),y=u.y+Math.sin(t*.02+u.ph)*60;const W=HG.S*HG.NX;x=HG.X0+((x-HG.X0)%W+W)%W;
    c.position.x=x;c.position.z=-y;c.position.y=Math.max(u.base,hAt(x,y)+30)+Math.sin(t*.05+u.ph)*15;const d=c.position.distanceTo(cam);
    c.material.opacity=u.a*Math.min(1,Math.max(0,(d-u.sz*.6)/u.sz))*(1-dark*.6);c.material.color.setScalar(1-dark*.75)}}}})();
// mưa: (1) mưa khu vực — hạt rơi đến đúng mặt đất (đọc bản đồ độ cao), chỉ trong sa bàn; (2) mưa sát camera như Thành cổ; (3) bọt nước bắn trên mặt đất
const HTEX=(()=>{const t=new THREE.DataTexture(HG.h,HG.NX,HG.NY,THREE.RedFormat,THREE.FloatType);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t})();
const RAIN_U={uT:{value:0},uA:{value:0},uW:{value:.3},uC:{value:new THREE.Vector3()},uS:{value:200},uH:{value:HTEX},uB:{value:new THREE.Vector4(HG.X0,HG.Y0,HG.S*(HG.NX-1),HG.S*(HG.NY-1))},uCam:{value:new THREE.Vector3()}};
const RAIN_GLSL=`uniform sampler2D uH;uniform vec4 uB;float hgt(vec2 xz){vec2 uv=vec2((xz.x-uB.x)/uB.z,(-xz.y-uB.y)/uB.w);return texture2D(uH,uv).r;}
 bool inside(vec2 xz){vec2 uv=vec2((xz.x-uB.x)/uB.z,(-xz.y-uB.y)/uB.w);return uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.;}`;
const rain=(()=>{const N=MOBILE?6000:16000,g=new THREE.BufferGeometry(),p=new Float32Array(N*6),o=new Float32Array(N*2);
  for(let i=0;i<N;i++){const x=Math.random()*2-1,y=Math.random(),z=Math.random()*2-1;p.set([x,y,z,x,y,z],i*6);o[i*2]=0;o[i*2+1]=1}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('e',new THREE.BufferAttribute(o,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:RAIN_U,
    vertexShader:RAIN_GLSL+`attribute float e;uniform float uT,uW,uS;uniform vec3 uC;varying float vA;void main(){vec2 xz=uC.xz+position.xz*uS;float g=hgt(xz);
      float H=max(uS*.9,40.);float y=mod(position.y*H-uT*max(uS*.6,18.),H);vec3 w=vec3(xz.x+uW*y*.12,g+y,xz.y);float L=clamp(uS*.035,.6,40.);
      w+=vec3(uW*L*.3,L,0.)*e;vA=(.25+.75*e)*(inside(xz)?1.:0.)*smoothstep(0.,L*2.,y);gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
    fragmentShader:`uniform float uA;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(.8,.84,.9,uA*vA*.55);}`});
  const l=new THREE.LineSegments(g,m);l.frustumCulled=false;scene.add(l);
  // lớp sát camera (khối 90 m quanh camera như Thành cổ)
  const N2=MOBILE?2200:6000,g2=new THREE.BufferGeometry(),p2=new Float32Array(N2*6),o2=new Float32Array(N2*2);
  for(let i=0;i<N2;i++){const x=Math.random()*90-45,y=Math.random()*55,z=Math.random()*90-45;p2.set([x,y,z,x,y,z],i*6);o2[i*2]=0;o2[i*2+1]=1}
  g2.setAttribute('position',new THREE.BufferAttribute(p2,3));g2.setAttribute('e',new THREE.BufferAttribute(o2,1));
  const m2=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:RAIN_U,
    vertexShader:RAIN_GLSL+`attribute float e;uniform float uT,uW;uniform vec3 uCam;varying float vA;void main(){vec3 p=position;float y=mod(p.y-uT*24.,55.);
      vec3 w=vec3(uCam.x+p.x+uW*y*.3,uCam.y-25.+y,uCam.z+p.z);float g=hgt(w.xz);w+=vec3(uW*.4,1.3,0.)*e;vA=(.3+.7*e)*step(g,w.y);gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}`,
    fragmentShader:`uniform float uA;varying float vA;void main(){if(vA<.01)discard;gl_FragColor=vec4(.75,.8,.88,uA*vA*.45);}`});
  const l2=new THREE.LineSegments(g2,m2);l2.frustumCulled=false;scene.add(l2);
  // bọt nước bắn trên mặt đất
  const N3=MOBILE?1500:4000,g3=new THREE.BufferGeometry(),p3=new Float32Array(N3*3);for(let i=0;i<N3;i++)p3.set([Math.random()*2-1,Math.random(),Math.random()*2-1],i*3);
  g3.setAttribute('position',new THREE.BufferAttribute(p3,3));
  const m3=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:RAIN_U,
    vertexShader:RAIN_GLSL+`uniform float uT,uS;uniform vec3 uC;varying float vA;void main(){vec2 xz=uC.xz+position.xz*uS*.7;float ph=fract(uT*1.7+position.y);vec3 w=vec3(xz.x,hgt(xz)+.15,xz.y);
      vA=(1.-ph)*(inside(xz)?1.:0.);vec4 mv=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(ph*uS*2.2/-mv.z*60.,1.,14.);}`,
    fragmentShader:`uniform float uA;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=length(c);float ring=smoothstep(.5,.4,r)*smoothstep(.2,.38,r);if(ring*vA<.02)discard;gl_FragColor=vec4(.85,.9,.95,uA*vA*ring*.6);}`});
  const pt=new THREE.Points(g3,m3);pt.frustumCulled=false;scene.add(pt);
  return RAIN_U})();

/* ---------------- trạng thái lịch sử ---------------- */
const STATE_COL={neutral:0x8c8c80,french:0x4f74b8,contested:0xd9a441,viet_minh:0xc8372d,historical_unknown:0x8a7f9e};
const STATE_VI={neutral:'Trung lập / chưa có công sự',french:'Quân Pháp kiểm soát',contested:'Đang giằng co',viet_minh:'Quân đội Việt Nam làm chủ',historical_unknown:'Chưa xác định'};
const ts=d=>new Date(d.length<=10?d+'T00:00':d).getTime();
const EV=EVENTS.events.map(e=>({...e,ms:ts(e.dateStart)})).sort((a,b)=>a.ms-b.ms);
const PL=PLACES.places.filter(p=>p.coordinates&&p.hotspot);
function stateAt(pid,ms){let s='neutral';for(const e of EV){if(e.ms>ms)break;if(e.placeIds.includes(pid))s=e.newState}return s}
const placeR=p=>{const ids=p.saBanIds.map(i=>SITES.find(s=>s.id===i)).filter(Boolean);if(!ids.length)return p.id==='AIRFIELD'?650:150;
  let r=0;for(const s of ids)r=Math.max(r,Math.hypot(s.x-p.coordinates[0],s.y-p.coordinates[1])+s.r);return Math.max(r,s0r(ids))};
const s0r=ids=>Math.max(...ids.map(s=>s.r))*1.4;
PL.forEach((p,i)=>{p.r=Math.min(900,placeR(p));p.slot=i;GU.uPl.value[i].set(p.coordinates[0],-p.coordinates[1],p.r)});
const _c=new THREE.Color();
function setPlaceVis(fn){for(const p of PL){const v=fn(p);_c.set(STATE_COL[v.state]||STATE_COL.historical_unknown);GU.uPc.value[p.slot].set(_c.r,_c.g,_c.b,v.a)}}

/* ---------------- nhãn / hotspot ---------------- */
const labels=[];
function addLabel(html,pos,cls,onclick,maxD=1e9){const el=document.createElement('div');el.className='lbl '+cls;el.innerHTML=html;$('labels').appendChild(el);
  const L={el,pos,cls,maxD,on:true,force:null};if(onclick)el.onclick=onclick;labels.push(L);return L}
for(const p of PL){const [x,y]=p.coordinates;p.lbl=addLabel(`<b><span class="dot"></span>${p.viName}${p.frName&&!/cần/.test(p.frName)?' · '+p.frName:''}</b><i></i>`,B(x,y,hAt(x,y)+30),'fr',()=>API.onHotspot(p),
  ['HIM_LAM','DOC_LAP','BAN_KEO','A1','HQ_DE_CASTRIES','SOUTH','AIRFIELD','C1','D1','E1'].includes(p.id)?1e9:6000)}
for(const v of SC.ban)addLabel(`<b>${v.ten}</b><i></i>`,B(v.x,v.y,v.z+18),'ban',null,4500);
const SECT=[{t:'PHÂN KHU BẮC',x:-1900,y:2700,r:1700},{t:'PHÂN KHU TRUNG TÂM',x:-650,y:-450,r:1500},{t:'PHÂN KHU NAM',x:-841,y:-5878,r:700}];
for(const s of SECT)s.lbl=addLabel(`<b>${s.t}</b>`,B(s.x,s.y,hAt(s.x,s.y)+380),'pk',null);
const LAY={labels:true,villages:false,sectors:false};
const v3=new THREE.Vector3();
function updLabels(cam){const W=innerWidth,H=innerHeight;
  for(const L of labels){let vis=L.force!=null?L.force:(LAY.labels&&(L.cls!=='ban'||LAY.villages)&&(L.cls!=='pk'||LAY.sectors));
    if(vis){const d=cam.position.distanceTo(L.pos);vis=d<L.maxD;if(vis){v3.copy(L.pos).project(cam);vis=v3.z<1&&Math.abs(v3.x)<1.05&&Math.abs(v3.y)<1.05;
      if(vis){L.el.style.left=((v3.x+1)/2*W).toFixed(1)+'px';L.el.style.top=((1-v3.y)/2*H).toFixed(1)+'px'}}}
    if(vis!==L.on){L.el.classList.toggle('hidden',!vis);L.on=vis}}}

/* ---------------- vòng lặp ---------------- */
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const audio=createAudio();audio.fileSrc={chim:ASSETS.chim,fetchBuf};
clearTreesNear(Object.values(SC.duong),26);
// cây thật (model CayTT_ từ Blender) thay khối cây trong bán kính gần camera
const treeLOD=(()=>{const NEAR=MOBILE?260:520,CAP=MOBILE?350:1400;const src={};gC.scene.traverse(o=>{if(/^CayM_/.test(o.name)&&!src[o.name])src[o.name]=o});
  const L=TPER.map(({name,mC,mT})=>{const s=src[name.replace('CayTT_','CayM_')];if(!s)return null;const n=mC.count;const orig=new Float32Array(n*16),xy=new Float32Array(n*2),ok=new Uint8Array(n);const m4=new THREE.Matrix4();
    for(let i=0;i<n;i++){mC.getMatrixAt(i,m4);m4.toArray(orig,i*16);xy[i*2]=orig[i*16+12];xy[i*2+1]=orig[i*16+14];ok[i]=Math.abs(orig[i*16])+Math.abs(orig[i*16+2])>1e-6?1:0}
    const parts=[];s.traverse(o=>{if(o.isMesh){const mat=o.material.clone();mat.side=THREE.DoubleSide;const im=new THREE.InstancedMesh(o.geometry,mat,CAP);im.count=0;im.frustumCulled=false;scene.add(im);parts.push(im)}});
    return{mC,mT,orig,xy,ok,parts,hid:[]}}).filter(Boolean);
  const m4=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);let lx=1e9,lz=1e9,last=0;
  return(cam,force)=>{const now=performance.now();if(!force&&now-last<350&&Math.hypot(cam.x-lx,cam.z-lz)<25)return;last=now;lx=cam.x;lz=cam.z;
    const far=cam.y-hAt(cam.x,-cam.z)>NEAR*1.6;
    for(const T of L){for(const i of T.hid){m4.fromArray(T.orig,i*16);T.mC.setMatrixAt(i,m4);T.mT.setMatrixAt(i,m4)}const hadHid=T.hid.length>0;T.hid=[];let k=0;
      if(!far&&T.mC.visible){const n=T.xy.length/2;for(let i=0;i<n&&k<CAP;i++){if(!T.ok[i])continue;const dx=T.xy[i*2]-cam.x,dz=T.xy[i*2+1]-cam.z;if(dx*dx+dz*dz>NEAR*NEAR)continue;
        m4.fromArray(T.orig,i*16);for(const im of T.parts)im.setMatrixAt(k,m4);T.mC.setMatrixAt(i,zero);T.mT.setMatrixAt(i,zero);T.hid.push(i);k++}}
      for(const im of T.parts){im.count=k;im.visible=T.mC.visible;im.instanceMatrix.needsUpdate=true}if(k||hadHid){T.mC.instanceMatrix.needsUpdate=T.mT.instanceMatrix.needsUpdate=true}}}})();
const API={THREE,scene,camera,controls,renderer,B,hAt,hT,PEAK,safeEye,world,ground,groundMat,GU,CAT,REV_FR,REV_VN,KC_MAX,TREES,hq,mapCard,mini,
  mau,makeChar,FIRE,SMOKE,T_DOT,rain,SKY,hemi,sun,flashLight,SC,PLACES,PL,EV,EVENTS,SCENES,SOURCES,STATE_COL,STATE_VI,stateAt,setPlaceVis,labels,LAY,SECT,
  updLabels,audio,MOBILE,ts,CLOUDS,inRunway,RW,onHotspot:()=>{},tick:[]};
window.__DBP=API;
await startDirector(API);
const clock=new THREE.Clock();let fN=0,fT=0;
renderer.setAnimationLoop(()=>{const dt=Math.min(.1,clock.getDelta());treeLOD(camera.position);for(const f of API.tick)f(dt);
  fN++;fT+=dt;if(fT>1){$('fps').textContent=fN+' fps';fN=0;fT=0}});
$('load').classList.add('done');
