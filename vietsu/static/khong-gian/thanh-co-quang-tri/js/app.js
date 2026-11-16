/* Thành cổ Quảng Trị 1972 — viewer three.js 0.160. Đọc docs/TOM_TAT.md trước khi sửa. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const $=id=>document.getElementById(id);
const MOBILE=matchMedia('(pointer:coarse)').matches;
const B=(x,y,z)=>new THREE.Vector3(x,z,-y);          // Blender (x,y,z) → three

/* ---------------- renderer / scene ---------------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!MOBILE,powerPreference:'high-performance',logarithmicDepthBuffer:true});
let PR_MAX=MOBILE?1.25:1.75;renderer.setPixelRatio(Math.min(devicePixelRatio,PR_MAX));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=!MOBILE;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const HAZE=new THREE.Color(0x9a6c4c);
scene.fog=new THREE.FogExp2(HAZE,0.00062);
const camera=new THREE.PerspectiveCamera(50,1,0.2,30000);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.495;controls.minDistance=2;controls.maxDistance=2600;

// bầu trời chiều khói lửa
const sky=new THREE.Mesh(new THREE.SphereGeometry(20000,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{sun:{value:new THREE.Vector3(-1,.16,.25).normalize()}},
  vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}`,
  fragmentShader:`varying vec3 vd;uniform vec3 sun;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
  void main(){float y=vd.y;vec3 hor=vec3(.96,.48,.22),mid=vec3(.62,.36,.24),top=vec3(.16,.12,.11);
  vec3 c=mix(hor,mid,smoothstep(-.02,.12,y));c=mix(c,top,smoothstep(.12,.55,y));
  float s=max(dot(vd,sun),0.);c+=vec3(1.,.55,.25)*pow(s,40.)*1.4+vec3(1.,.45,.2)*pow(s,6.)*.25;
  float cl=fbm(vd.xz/(y+.25)*2.2);c=mix(c,c*vec3(.35,.3,.28),smoothstep(.45,.8,cl)*smoothstep(.0,.15,y)*.85);
  if(y<0.)c=mix(vec3(.6,.4,.27),vec3(.3,.2,.15),clamp(-y*4.,0.,1.));
  gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-1;scene.add(sky);

scene.add(new THREE.HemisphereLight(0xffd2a8,0x5a4030,1.7));
const sun=new THREE.DirectionalLight(0xffb070,3.4);
sun.position.copy(B(-1000,-250,160));sun.castShadow=!MOBILE;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-120,right:120,top:120,bottom:-120,near:10,far:2500});sun.shadow.bias=-0.0005;
scene.add(sun,sun.target);

/* ---------------- tải dữ liệu ---------------- */
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const texL=new THREE.TextureLoader();
// Đường dẫn tài nguyên. Bản artifact Claude ghi đè bằng window.ASSETS (file .glb.txt base64).
const ASSETS=Object.assign({static:'models/static.glb',qdnd:'models/qdnd.glb',vnch:'models/vnch.glb',lib:'models/thuvien.glb',boat:'models/thuyen.glb',
  scene:'data/scene.json',rai:'data/rai.json',tex:'tex/'},window.ASSETS||{});
const files={static:ASSETS.static,qdnd:ASSETS.qdnd,vnch:ASSETS.vnch,lib:ASSETS.lib,boat:ASSETS.boat};
const progress={};function setProg(k,v){progress[k]=v;const t=Object.values(progress);const p=t.reduce((a,b)=>a+b,0)/Object.keys(files).length;$('fill').style.width=(p*100).toFixed(0)+'%'}
function fetchB64(url,key){return new Promise((res,rej)=>{const x=new XMLHttpRequest();const b64=url.endsWith('.txt');x.open('GET',url);x.responseType=b64?'text':'arraybuffer';
  x.onprogress=e=>{if(e.total)setProg(key,e.loaded/e.total)};x.onerror=()=>rej(new Error('Không tải được '+url));
  x.onload=()=>{if(x.status>=400)return rej(new Error('Không tải được '+url));setProg(key,1);if(!b64)return res(x.response);
    const bin=atob(x.responseText.trim());const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);res(u.buffer)};x.send()})}
const parse=buf=>new Promise((res,rej)=>loader.parse(buf,'',res,rej));
function tex(url,rep,srgb){const t=texL.load(url);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return t}

const [gStatic,gQ,gV,gLib,gBoat,data,rai]=await Promise.all([fetchB64(files.static,'static').then(parse),fetchB64(files.qdnd,'qdnd').then(parse),fetchB64(files.vnch,'vnch').then(parse),fetchB64(files.lib,'lib').then(parse),fetchB64(files.boat,'boat').then(parse),fetch(ASSETS.scene).then(r=>r.json()),fetch(ASSETS.rai).then(r=>r.json())]).catch(e=>{$('loadtxt').textContent=e.message;throw e});

/* ---------------- cảnh tĩnh ---------------- */
const world=gStatic.scene;scene.add(world);
const M_GROUND=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',2.6,true),normalMap:tex(ASSETS.tex+'dat_n.webp',2.6),vertexColors:true,roughness:.97,color:0xffffff});
const M_BRICK=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'gach.webp',1.8,true),normalMap:tex(ASSETS.tex+'gach_n.webp',1.8),roughness:.92,color:0xd0b0a0});
const WN=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const im=g.createImageData(256,256);
  const h=(x,y)=>Math.sin(x*.149+Math.sin(y*.071)*2)*.5+Math.sin(y*.203+x*.037)*.35+Math.sin((x+y)*.311)*.15;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const dx=h(x+1,y)-h(x-1,y),dy=h(x,y+1)-h(x,y-1),i=(y*256+x)*4;im.data[i]=128+dx*90;im.data[i+1]=128+dy*90;im.data[i+2]=255;im.data[i+3]=255}
  g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(60,60);return t})();
const M_CRATER=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',2.6,true),normalMap:tex(ASSETS.tex+'dat_n.webp',2.6),vertexColors:true,roughness:.98,color:0xc8b8a8});
const M_RUBBLE=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',1,true),normalMap:tex(ASSETS.tex+'dat_n.webp',1),roughness:.97,color:0x8a5a46,flatShading:true});
const M_WALL_OUT=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'gach.webp',2,true),normalMap:tex(ASSETS.tex+'gach_n.webp',2),roughness:.95,color:0x9c948a});
const M_WALL_CORE=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'gach.webp',2,true),normalMap:tex(ASSETS.tex+'gach_n.webp',2),roughness:.92,color:0x9a7466});
const M_BRICKBIT=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'gach.webp',1,true),roughness:.92,color:0x8c6a5c});
const M_STONE=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',1.5,true),roughness:.9,color:0xb8b0a4});
const M_HOLE=new THREE.MeshStandardMaterial({color:0x1a1612,roughness:1});
const M_IRON=new THREE.MeshStandardMaterial({color:0x3b2e26,roughness:.75,metalness:.35});
const M_TIN=new THREE.MeshStandardMaterial({color:0x4a2a18,roughness:.8,metalness:.3,side:THREE.DoubleSide});
const M_WOOD=new THREE.MeshStandardMaterial({color:0x2a2018,roughness:.95});
const BYMAT={rocks_ground_08:null,M_DatHoBom:M_CRATER,M_DongGachVun:M_RUBBLE,M_TuongNgoai:M_WALL_OUT,M_LoiGach:M_WALL_CORE,M_LoDan:M_HOLE,M_DaVienCong:M_STONE,M_ThepRi:M_IRON,M_TonRi:M_TIN,M_GoChay:M_WOOD};
const M_WATER=new THREE.MeshStandardMaterial({color:0x1b4560,emissive:0x061826,roughness:.12,metalness:.1,normalMap:WN,normalScale:new THREE.Vector2(.6,.6)});
const solid=[],obstacles=[];let planes=[],turrets=[],ground=null;
world.traverse(o=>{
  if(!o.isMesh)return;const n=o.name+' '+(o.parent?o.parent.name:'');
  o.castShadow=o.receiveShadow=!MOBILE;if(/DiaHinh|HoBom|MatNuoc|DatXa/.test(n))o.castShadow=false;
  const mn=o.material&&o.material.name;
  if(/DiaHinh/.test(n)){o.material=M_GROUND;ground=o;solid.push(o)}
  else if(/HoBom/.test(n)){o.material=M_CRATER;solid.push(o)}
  else if(/_GD4|CongTien/.test(n)){if(mn in BYMAT&&BYMAT[mn])o.material=BYMAT[mn];solid.push(o);obstacles.push(o)}
  else if(/ThapSat/.test(n)){if(BYMAT[mn])o.material=BYMAT[mn]}
  else if(/TuongThanh|Cong_/.test(n)){o.material=M_BRICK;solid.push(o);if(/TuongThanh|NhaDoNat/.test(n))obstacles.push(o)}
  else if(/MatNuoc/.test(n)){o.material=M_WATER;o.receiveShadow=false}
  else if(/BaoCat/.test(n)){o.material=new THREE.MeshStandardMaterial({color:0x5e4e36,roughness:1})}
  else if(/DatXa/.test(n)){o.material=new THREE.MeshStandardMaterial({color:0x3a2a1d,roughness:1});o.castShadow=o.receiveShadow=false}
  else{if(BYMAT[mn])o.material=BYMAT[mn];if(/NhaDoNat|NhaDan/.test(n))obstacles.push(o);if(o.material&&o.material.name==='M_GachChay'){o.material=M_BRICK}else if(o.material&&o.material.name==='M_BaoCat'){o.material.color.multiplyScalar(.55)}}
});
world.traverse(o=>{if(/^MayBay_CuongKich/.test(o.name))planes.push(o);if(/_thap_phao$/.test(o.name))turrets.push({o,base:o.rotation.y,ph:Math.random()*6})});

/* ---- lưới độ cao để đi bộ (raster hoá tam giác) ---- */
const HG={size:1800,cell:2,n:900};HG.h=new Float32Array(HG.n*HG.n).fill(-1e9);HG.ob=new Float32Array(HG.n*HG.n).fill(-1e9);
function raster(mesh,arr){mesh.updateWorldMatrix(true,false);const g=mesh.geometry,pos=g.attributes.position,idx=g.index,m=mesh.matrixWorld;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();const N=HG.n,C=HG.cell,H=HG.size/2;
  const cnt=idx?idx.count:pos.count;
  for(let i=0;i<cnt;i+=3){const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,ic=idx?idx.getX(i+2):i+2;
    a.fromBufferAttribute(pos,ia).applyMatrix4(m);b.fromBufferAttribute(pos,ib).applyMatrix4(m);c.fromBufferAttribute(pos,ic).applyMatrix4(m);
    const x0=Math.max(0,Math.floor((Math.min(a.x,b.x,c.x)+H)/C)),x1=Math.min(N-1,Math.floor((Math.max(a.x,b.x,c.x)+H)/C));
    const z0=Math.max(0,Math.floor((Math.min(a.z,b.z,c.z)+H)/C)),z1=Math.min(N-1,Math.floor((Math.max(a.z,b.z,c.z)+H)/C));
    const d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(d)<1e-9)continue;
    for(let zi=z0;zi<=z1;zi++)for(let xi=x0;xi<=x1;xi++){const px=xi*C-H+C/2,pz=zi*C-H+C/2;
      const w1=((b.z-c.z)*(px-c.x)+(c.x-b.x)*(pz-c.z))/d,w2=((c.z-a.z)*(px-c.x)+(a.x-c.x)*(pz-c.z))/d,w3=1-w1-w2;
      if(w1<-.02||w2<-.02||w3<-.02)continue;const y=w1*a.y+w2*b.y+w3*c.y;const k=zi*N+xi;if(y>arr[k])arr[k]=y}}}
function sampleH(arr,x,z){const H=HG.size/2,xi=Math.floor((x+H)/HG.cell),zi=Math.floor((z+H)/HG.cell);if(xi<0||zi<0||xi>=HG.n||zi>=HG.n)return 0;const v=arr[zi*HG.n+xi];return v<-1e8?0:v}

/* ---------------- kịch bản sa bàn: VNCH cố thủ trong thành · QĐND vượt sông tấn công ---------------- */
for(const m of solid)raster(m,HG.h);for(const m of obstacles)raster(m,HG.ob);   // lưới độ cao cần trước khi đặt nhân vật
const clips={},clipsV={};for(const c of gQ.animations)clips[c.name]=c;for(const c of gV.animations)clipsV[c.name]=c;   // mỗi phe một bộ động tác (rig QĐND mới khác hệ trục xương VNCH)
const mixers=[],flashes=[],NPC=[],runners=[],swimmers=[];const SPEED=30/24;const MUL=MOBILE?.5:1;
const flashTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(.3,'rgba(255,170,60,.9)');g.addColorStop(1,'rgba(255,90,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})();
const FLASH_MAT=new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false});
function prep(src){src.scene.traverse(o=>{if(o.isMesh){o.castShadow=!MOBILE;o.frustumCulled=false;if(o.material){o.material.roughness=Math.max(o.material.roughness??.8,.6)}}})}
prep(gQ);prep(gV);
const R=(a,b)=>a+Math.random()*(b-a);
const _fr=new THREE.Frustum(),_pm=new THREE.Matrix4(),_sph=new THREE.Sphere(new THREE.Vector3(),3);
// chất lượng tự hạ khi máy yếu: 3 cao → 0 thấp
const Q={lv:MOBILE?1:3,far:MOBILE?650:1150,acc:0,n:0};
function setQuality(lv){Q.lv=lv;PR_MAX=[.85,1,1.25,1.75][lv];renderer.setPixelRatio(Math.min(devicePixelRatio,PR_MAX));
  if(lv<=1&&sun.castShadow){sun.castShadow=false}Q.far=[450,650,900,1150][lv];resize()}
const groundAt=(bx,by)=>{const p=B(bx,by,0);return sampleH(HG.h,p.x,p.z)};
const faceTo=(dx,dy)=>Math.atan2(dx,-dy);              // hướng (Blender) → rotation.y
const UP14=new THREE.Vector3(0,1.4,0);
const ARVN_PTS=[],PAVN_PTS=[];
function spawn(side,clip,bx,by,rot,{z=null,gun=true,flash=false,parent=scene,mirror=false,extra=null}={}){
  const inst=SkeletonUtils.clone(side==='Q'?gQ.scene:gV.scene);const h=new THREE.Group();h.add(inst);
  if(mirror)inst.scale.x=-1;
  h.position.copy(B(bx,by,0));h.position.y=z??groundAt(bx,by);h.rotation.y=rot;parent.add(h);
  const m=new THREE.AnimationMixer(inst);m.timeScale=SPEED;mixers.push(m);const acts={};
  const CL=(side==='V'&&gV.animations.length)?clipsV:clips;
  for(const cn of [clip,...(extra||[])]){const c=CL[cn]||CL.QuyBan;const a=m.clipAction(c);a.play();a.time=Math.random()*c.duration;acts[cn]=a;if(cn!==clip)a.setEffectiveWeight(0)}
  h.userData.acts=acts;h.userData.meshes=[];inst.traverse(o=>{if(o.isMesh){o.castShadow=false;h.userData.meshes.push(o)}});h.userData.sh=false;
  if(!gun)inst.traverse(o=>{if(/^Sung_/.test(o.name))o.visible=false});
  if(flash&&gun){let g=null;inst.traverse(o=>{if(/^Sung_/.test(o.name))g=o});
    if(g){const sp=new THREE.Sprite(FLASH_MAT);sp.scale.setScalar(.55);sp.position.set(0,.03,.95);sp.visible=false;sp.userData={per:.35+Math.random()*.6,t:Math.random(),side};g.add(sp);flashes.push(sp)}}
  if(parent===scene)NPC.push(h);return h}

/* ---- sông Thạch Hãn: trục và đường vượt sông ---- */
const RIVER_A=[-668,746],RIVER_B=[-606,-728];   // trục sông Thạch Hãn phía Tây thành, theo OpenStreetMap (s>0: bờ Tây xa, s<0: bờ phía thành)
function crossPath(t,s0,s1){const ax=RIVER_A[0],ay=RIVER_A[1],bx=RIVER_B[0],by=RIVER_B[1];const mx=ax+(bx-ax)*t,my=ay+(by-ay)*t;let dx=bx-ax,dy=by-ay;const L=Math.hypot(dx,dy);dx/=L;dy/=L;const nx=dy,ny=-dx;
  return {a:B(mx+nx*s0,my+ny*s0,0),b:B(mx+nx*s1,my+ny*s1,0),pa:[mx+nx*s0,my+ny*s0],pb:[mx+nx*s1,my+ny*s1]}}   // s>0: bờ Nam (xa) · s<0: bờ phía thành

/* ---- VNCH: phòng ngự trên mặt thành (hướng Nam, Tây đông nhất) ---- */
const VCLIPS=['QuyBan','QuyBan','DiNgamBan_TaiCho','NemLuuDan_TaiCho','DiNgangBan_TaiCho','QuyBan'];
const WALLS=[{n:[-1,0],k:46},{n:[0,-1],k:26},{n:[0,1],k:12},{n:[1,0],k:8}];
for(const w of WALLS){const k=Math.round(w.k*MUL);for(let i=0;i<k;i++){let t=R(-232,232);if(Math.abs(t)<15)t+=t<0?-15:15;
  const d=R(248.5,251);const bx=w.n[0]?w.n[0]*d:t,by=w.n[1]?w.n[1]*d:t;
  const h=spawn('V',VCLIPS[i%VCLIPS.length],bx,by,faceTo(w.n[0],w.n[1])+R(-.25,.25),{flash:true});ARVN_PTS.push(h.position.clone().add(UP14))}}

/* ---- lô cốt bê tông + bao cát ---- */
const M_CONC=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',.6,true),color:0xa49e94,roughness:.95});
const M_SAND=new THREE.MeshStandardMaterial({color:0x6e5c42,roughness:1,flatShading:true});
const BG={body:new THREE.CylinderGeometry(2.3,2.7,2.1,12),roof:new THREE.CylinderGeometry(2.85,2.85,.35,12),slit:new THREE.CylinderGeometry(2.36,2.46,.32,12,1,true,-1.1,2.2),sand:new THREE.TorusGeometry(3.4,.55,5,16)};
const BUNKERS=[[-229,-20],[-229,205],[-229,-215],[-180,-228],[-110,-229],[-45,-228],[40,-228],[110,-229],[180,-228],[-24,-214],[24,-214],[-214,-214],[-229,-160],[-229,-85],[-229,70],[-229,150],[-150,-185],[60,-172],[-170,40],[229,-120],[0,229]];
const bunkers=[];
for(const [bx,by] of BUNKERS){const ox=Math.abs(bx)>Math.abs(by)?Math.sign(bx):0,oy=ox?0:Math.sign(by);
  const g=new THREE.Group();g.position.copy(B(bx,by,0));g.position.y=groundAt(bx,by)-.15;g.rotation.y=faceTo(ox,oy);
  const body=new THREE.Mesh(BG.body,M_CONC);body.position.y=1.05;const roof=new THREE.Mesh(BG.roof,M_CONC);roof.position.y=2.25;
  const slit=new THREE.Mesh(BG.slit,M_HOLE);slit.position.y=1.45;const sand=new THREE.Mesh(BG.sand,M_SAND);sand.rotation.x=Math.PI/2;sand.scale.z=.6;sand.position.y=.3;
  for(const m of [body,roof,sand]){m.castShadow=!MOBILE;m.receiveShadow=!MOBILE}
  g.add(body,roof,slit,sand);scene.add(g);bunkers.push(g);
  const tx=-oy,ty=ox;for(const sgn of MOBILE?[1]:[1,-1]){const px=bx+tx*3.5*sgn+ox*.6,py=by+ty*3.5*sgn+oy*.6;
    const h=spawn('V',sgn>0?'QuyBan':'DiNgamBan_TaiCho',px,py,faceTo(ox,oy)+R(-.3,.3),{flash:true});ARVN_PTS.push(h.position.clone().add(UP14))}}

/* ---- xe tăng M41 của VNCH: chuyển vào trong thành, nòng hướng ra ngoài ---- */
const TANKS=[{n:'XeTang_VNCH_0',p:[-203,-150],o:[-1,0]},{n:'XeTang_VNCH_1',p:[-60,-202],o:[-.15,-1]},{n:'XeTang_VNCH_2',p:[-200,-40],o:[-1,-.1]},{n:'XeTang_VNCH_3',p:[-198,115],o:[-1,0]}];
const tankObjs=[];
for(const t of TANKS){const o=world.getObjectByName(t.n);if(!o)continue;o.position.copy(B(t.p[0],t.p[1],0));o.position.y=groundAt(t.p[0],t.p[1])+.05;o.rotation.set(0,faceTo(t.o[0],t.o[1]),0);
  tankObjs.push({o,next:R(2,8)});ARVN_PTS.push(o.position.clone().add(new THREE.Vector3(0,2.2,0)));
  for(let k=0;k<(MOBILE?1:3);k++){const a=R(0,6.28);spawn('V','DiNgamBan_TaiCho',t.p[0]+Math.cos(a)*5,t.p[1]+Math.sin(a)*5,faceTo(t.o[0],t.o[1]),{flash:true})}}

/* ---- QĐND: bơi vượt sông Thạch Hãn vào bờ phía thành ---- */
const NSW=Math.round(36*MUL);
for(let k=0;k<NSW;k++){const t=.28+.25*k/NSW+R(0,.006);const p=crossPath(t,R(70,80),R(-108,-100));
  const h=spawn('Q','Boi_TaiCho',0,0,0,{z:-1.85});h.userData.swim={a:p.a.setY(-1.85),b:p.b.setY(-1.85),ph:Math.random(),per:R(95,130)};
  h.rotation.y=Math.atan2(p.b.x-p.a.x,p.b.z-p.a.z);swimmers.push(h)}
/* bơi qua hào nước (mặt Nam, Tây) để áp sát chân thành */
for(let k=0;k<Math.round(12*MUL);k++){const south=k%4===3;const t=R(-200,200);if(Math.abs(t)<20)continue;
  const a=south?[t,-298]:[-298,t*.6],b=south?[t,-263]:[-263,t*.6];
  const h=spawn('Q','Boi_TaiCho',a[0],a[1],faceTo(south?0:1,south?1:0),{z:-1.85});h.userData.swim={a:B(a[0],a[1],-1.85),b:B(b[0],b[1],-1.85),ph:Math.random(),per:R(35,50)};swimmers.push(h)}

/* ---- QĐND: trận địa bắn bên ngoài hào (mặt Nam và Tây) ---- */
const QCLIPS=['QuyBan','QuyBan','DiNgamBan_TaiCho','NemLuuDan_TaiCho','QuyBan'];
let placed=0,tries=0;const NFIRE=Math.round(46*MUL);
while(placed<NFIRE&&tries++<800){const west=Math.random()<.8;const bx=west?R(-338,-302):R(-240,0),by=west?R(-240,240):R(-335,-303);
  if(groundAt(bx,by)<-.9)continue;const tgt=west?[-250,by+R(-20,20)]:[bx+R(-20,20),-250];
  const h=spawn('Q',QCLIPS[placed%QCLIPS.length],bx,by,faceTo(tgt[0]-bx,tgt[1]-by),{flash:true});PAVN_PTS.push(h.position.clone().add(UP14));placed++}

/* ---- QĐND: các tổ xung kích từ bờ sông chạy lên áp sát thành rồi quỳ bắn ---- */
for(let k=0;k<Math.round(30*MUL);k++){const t=R(.30,.72);const p=crossPath(t,-112,-135);
  let tx=R(-335,-305),ty=Math.max(-235,Math.min(235,p.pa[1]+R(-40,40)));for(let j=0;j<20&&groundAt(tx,ty)<-.9;j++){tx=R(-335,-305)}
  const h=spawn('Q','ChayLonNhao_TaiCho',p.pa[0],p.pa[1],0,{extra:['QuyBan']});
  const a=p.a.clone(),b=B(tx,ty,0);const dist=a.distanceTo(b);
  h.userData.run={a,b,dur:dist/R(3,4.2),hold:R(8,18),ph:R(0,60),rot:Math.atan2(b.x-a.x,b.z-a.z)};
  h.rotation.y=h.userData.run.rot;runners.push(h);PAVN_PTS.push(b.clone().setY(groundAt(tx,ty)+1.4))}
function updRunners(T){for(const h of runners){const u=h.userData.run;const cyc=u.dur+u.hold;const k=(T+u.ph)%cyc;const run=h.userData.acts.ChayLonNhao_TaiCho,fire=h.userData.acts.QuyBan;
  if(k<u.dur){h.position.lerpVectors(u.a,u.b,k/u.dur);h.position.y=Math.max(sampleH(HG.h,h.position.x,h.position.z),-1.7);h.rotation.y=u.rot;run.setEffectiveWeight(1);fire.setEffectiveWeight(0)}
  else{h.position.copy(u.b);h.position.y=sampleH(HG.h,u.b.x,u.b.z);h.rotation.y=u.rot+Math.PI*0;run.setEffectiveWeight(0);fire.setEffectiveWeight(1)}}}

/* ---------------- đổ nát rải (InstancedMesh) ---------------- */
{const groups={};rai.items.forEach(it=>{(groups[it[0]]||(groups[it[0]]=[])).push(it)});
 const mtx=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3();
 for(const [k,list] of Object.entries(groups)){const name=rai.names[k];
   if(MOBILE&&/TV_(Gach|CucDat)_/.test(name))continue;
   const node=gLib.scene.getObjectByName(name);if(!node)continue;
   const parts=node.isMesh?[node]:node.children.filter(c=>c.isMesh);
   for(const part of parts){const mn=part.material&&part.material.name;const mat=(mn==='M_LoiGach'&&/Gach/.test(name))?M_BRICKBIT:(BYMAT[mn]||part.material);
     const im=new THREE.InstancedMesh(part.geometry,mat,list.length);
     list.forEach((it,i)=>{v.copy(B(it[1],it[2],it[3]));q.set(it[4],it[6],-it[5],it[7]);sc.setScalar(it[8]);mtx.compose(v,q,sc);im.setMatrixAt(i,mtx)});
     im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=!MOBILE&&/TV_(DongGach|MangTuong|Cay)_/.test(name);im.receiveShadow=!MOBILE;scene.add(im)}}}

/* ---------------- thuyền vượt sông (chèo vào bờ phía thành) ---------------- */
const boatSrc=gBoat.scene.getObjectByName('Thuyen'),paddleSrc=gBoat.scene.getObjectByName('MaiCheo');
[boatSrc,paddleSrc].forEach(o=>o.traverse(m=>{if(m.isMesh){m.castShadow=!MOBILE;m.receiveShadow=!MOBILE}}));
const boats=[],paddles=[];const WATER_Y=-1.1;
const BOAT_T=MOBILE?[.58,.66,.74]:[.56,.61,.66,.71,.76,.81];
BOAT_T.forEach((t,i)=>{const g=new THREE.Group();const hull=boatSrc.clone();g.add(hull);
  const crew=[{z:1.45,clip:'QuyBan',gun:true},{z:.35,clip:'ChevThuyen',row:true},{z:-.7,clip:'ChevThuyen',row:true,mirror:true},{z:-1.3,clip:'ChevThuyen',row:true}];
  for(const c of crew){const h=spawn('Q',c.clip,0,0,0,{z:0,parent:g,gun:!c.row,mirror:c.mirror,flash:!c.row});h.position.set(0,.17,c.z);
    if(c.row){const s=h.children[0];let L=null,Rh=null;s.traverse(o=>{if(/LeftHand$/.test(o.name))L=o;if(/RightHand$/.test(o.name))Rh=o});const pd=paddleSrc.clone();scene.add(pd);paddles.push({pd,L,R:Rh,g})}}
  const p=crossPath(t,78,-100);scene.add(g);g.userData.boat={a:p.a,b:p.b,ph:i*.17+Math.random()*.1,per:R(130,170)};boats.push(g)});
const pa=new THREE.Vector3(),pb=new THREE.Vector3(),pdir=new THREE.Vector3(),DOWN=new THREE.Vector3(0,-1,0);
function updBoats(T){for(const g of boats){const u=g.userData.boat;const k=((T/u.per)+u.ph)%1;g.position.lerpVectors(u.a,u.b,k);
    const vx=u.b.x-u.a.x,vz=u.b.z-u.a.z;g.rotation.set(0,0,0);g.rotation.y=Math.atan2(vx,vz);g.rotateZ(Math.sin(T*1.7+u.ph*9)*.035);g.rotateX(Math.sin(T*1.3+u.ph*5)*.02);
    g.position.y=WATER_Y-.22+Math.sin(T*2+u.ph*7)*.04;_sph.center.copy(g.position);g.visible=k<.985&&g.position.distanceToSquared(camera.position)<Q.far**2&&_fr.intersectsSphere(_sph)}
  for(const p of paddles){if(!p.L||!p.R)continue;p.pd.visible=p.g.visible;if(!p.g.visible)continue;p.L.getWorldPosition(pa);p.R.getWorldPosition(pb);pdir.subVectors(pb,pa).normalize();
    p.pd.position.copy(pa).addScaledVector(pdir,-.18);p.pd.quaternion.setFromUnitVectors(DOWN,pdir)}}

/* ---------------- điểm cháy & cột khói mới ---------------- */
const FIRE_PTS=[];
world.traverse(o=>{if(/^NhaDoNat_/.test(o.name)&&o.parent===world){FIRE_PTS.push([o.position.x,-o.position.z])}});
[[-120,-238],[60,-240],[-238,-30],[-238,120],[-238,-160],[-150,-185],[60,-172],[-330,-60],[-360,-150],[-345,30],[-330,-200],[310,40],[380,-95],[-30,40],[100,90]].forEach(p=>FIRE_PTS.push(p));
data.fx.fire=FIRE_PTS.map(([x,y])=>[x,y,groundAt(x,y)]);
for(const [x,y] of [[-238,-30],[-330,-60],[-360,-150],[-238,120],[60,-172],[-345,30]])data.fx.smoke.push({p:[x,y,groundAt(x,y)],h:R(55,80),lean:[R(.18,.3),R(-.1,.1)]});
/* ---------------- khói, lửa, nổ, đường đạn ---------------- */
const softTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');
  for(let i=0;i<14;i++){const r=20+Math.random()*30,px=64+(Math.random()-.5)*40,py=64+(Math.random()-.5)*40;const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128)}
  return new THREE.CanvasTexture(cv)})();
const SMOKE_N=MOBILE?26:44;
const smokeSrc=data.fx.smoke.map(s=>({p:B(...s.p),h:s.h,lean:new THREE.Vector3(s.lean[0],0,-s.lean[1])}));
const sCount=smokeSrc.length*SMOKE_N;
const sGeo=new THREE.BufferGeometry();const sPos=new Float32Array(sCount*3),sSize=new Float32Array(sCount),sAlpha=new Float32Array(sCount),sAge=new Float32Array(sCount),sLife=new Float32Array(sCount),sSeed=new Float32Array(sCount);
for(let i=0;i<sCount;i++){sLife[i]=9+Math.random()*7;sAge[i]=Math.random()*sLife[i];sSeed[i]=Math.random()}
sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));sGeo.setAttribute('size',new THREE.BufferAttribute(sSize,1));sGeo.setAttribute('alpha',new THREE.BufferAttribute(sAlpha,1));sGeo.setAttribute('seed',new THREE.BufferAttribute(sSeed,1));
const sMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,
  uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{map:{value:softTex},scale:{value:innerHeight/2}}]),
  vertexShader:`#include <common>
  attribute float size;attribute float alpha;attribute float seed;varying float va;varying float vs;uniform float scale;
  #include <fog_pars_vertex>
  #include <logdepthbuf_pars_vertex>
  void main(){va=alpha;vs=seed;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_PointSize=size*scale/-mvPosition.z;gl_Position=projectionMatrix*mvPosition;
  #include <logdepthbuf_vertex>
  #include <fog_vertex>
  }`,
  fragmentShader:`#include <common>
  uniform sampler2D map;varying float va;varying float vs;
  #include <fog_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  void main(){
  #include <logdepthbuf_fragment>
  float a=cos(vs*6.28),b=sin(vs*6.28);vec2 uv=gl_PointCoord-.5;uv=mat2(a,-b,b,a)*uv+.5;vec4 t=texture2D(map,uv);
  vec3 col=mix(vec3(.07,.06,.055),vec3(.32,.26,.22),vs*.6);gl_FragColor=vec4(col,t.a*va*1.6);
  #include <fog_fragment>
  }`});
scene.add(new THREE.Points(sGeo,sMat));
function updSmoke(dt){let i=0;for(const s of smokeSrc){for(let k=0;k<SMOKE_N;k++,i++){sAge[i]+=dt;if(sAge[i]>sLife[i])sAge[i]-=sLife[i];
  const t=sAge[i]/sLife[i],H=s.h*1.15;const y=t*H;const sw=Math.sin(sSeed[i]*30+t*4)*(1+t*6);
  sPos[i*3]=s.p.x+s.lean.x*y+sw;sPos[i*3+1]=s.p.y+y;sPos[i*3+2]=s.p.z+s.lean.z*y+Math.cos(sSeed[i]*20+t*3)*(1+t*6);
  sSize[i]=6+t*t*60+sSeed[i]*6;sAlpha[i]=Math.min(t*6,1)*(1-t)*(.55+.45*sSeed[i])}}
  sGeo.attributes.position.needsUpdate=sGeo.attributes.size.needsUpdate=sGeo.attributes.alpha.needsUpdate=true}

/* ---------------- âm thanh: tổng hợp bằng WebAudio (không cần file) ---------------- */
let audioOn=false,listener=null,AC=null,live=0,shotBudget=0;const SND={};
function mkBuf(sec,fn){const sr=AC.sampleRate,n=Math.floor(sec*sr),b=AC.createBuffer(1,n,sr),d=b.getChannelData(0);fn(d,sr,n);for(let i=0;i<n;i++)d[i]=Math.max(-1,Math.min(1,d[i]));return b}
function buildSounds(){const rnd=()=>Math.random()*2-1;
  SND.shot=[0,1,2].map(v=>mkBuf(.4,(d,sr,n)=>{let lp=0;const f=.3+v*.12;for(let i=0;i<n;i++){const t=i/sr;const e=Math.exp(-t*(26+v*7));lp+=(rnd()-lp)*f;d[i]=(lp*1.4+Math.sin(2*Math.PI*(95-v*12)*t)*Math.exp(-t*28)*.7)*e}}));
  SND.burst=mkBuf(1.1,(d,sr,n)=>{let lp=0;for(let s=0;s<7;s++){const o=Math.floor((s*.13+Math.random()*.02)*sr);for(let i=0;i<sr*.25&&o+i<n;i++){const t=i/sr;lp+=(rnd()-lp)*.35;d[o+i]+=(lp*1.2+Math.sin(2*Math.PI*90*t)*Math.exp(-t*30)*.6)*Math.exp(-t*30)}}});
  SND.boom=[0,1,2].map(v=>mkBuf(3.6,(d,sr,n)=>{let lp=0,lp2=0;for(let i=0;i<n;i++){const t=i/sr;const e=t<.008?t/.008:Math.exp(-(t-.008)*(1.3+v*.45));lp+=(rnd()-lp)*.07;lp2+=(lp-lp2)*.05;
    const sub=Math.sin(2*Math.PI*(34+22*Math.exp(-t*5))*t)*Math.exp(-t*(1.8+v*.3));d[i]=(lp2*10+sub*.95)*e+rnd()*Math.exp(-t*22)*.7}}));
  SND.splash=mkBuf(2.4,(d,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;lp+=(rnd()-lp)*.25;d[i]=lp*.9*(t<.02?t/.02:Math.exp(-t*1.6))+Math.sin(2*Math.PI*40*t)*Math.exp(-t*4)*.6}});
  SND.whistle=mkBuf(3.2,(d,sr,n)=>{let ph=0;for(let i=0;i<n;i++){const t=i/sr;const f=1450-950*(t/3.2);ph+=2*Math.PI*f/sr;d[i]=Math.sin(ph+Math.sin(t*28)*.25)*.32*Math.min(1,t*2.5)*(1-Math.pow(t/3.2,8))}});
  SND.engine=mkBuf(2,(d,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;let s=0;for(let h=1;h<9;h++)s+=Math.sin(2*Math.PI*105*h*t+h)/h;lp+=(rnd()-lp)*.15;d[i]=(s*.3+lp*.8)*.55;
    const edge=Math.min(i,n-i)/(sr*.02);if(edge<1)d[i]*=.5+.5*edge}});
  SND.amb=mkBuf(9,(d,sr,n)=>{let lp=0,lp2=0;for(let i=0;i<n;i++){lp+=(rnd()-lp)*.02;lp2+=(lp-lp2)*.02;d[i]=lp2*6}
    for(let k=0;k<90;k++){const s=Math.floor(Math.random()*n),a=.04+Math.random()*.1,L=Math.floor(sr*.12);let q=0;for(let i=0;i<L&&s+i<n;i++){q+=(rnd()-q)*.22;d[s+i]+=q*a*Math.exp(-i/sr*35)}}
    for(let k=0;k<6;k++){const s=Math.floor(Math.random()*(n-sr*2));let q=0,q2=0;for(let i=0;i<sr*2;i++){q+=(rnd()-q)*.05;q2+=(q-q2)*.05;d[s+i]+=q2*1.6*Math.exp(-i/sr*2)}}
    const f=Math.floor(sr*.5);for(let i=0;i<f;i++){const w=i/f;d[i]=d[i]*w+d[n-f+i]*(1-w)}})}
function playAt(buf,pos,{vol=1,ref=30,rate=1,delay=true}={}){if(!audioOn||!buf||live>30)return;const dist=pos.distanceTo(camera.position);if(dist>3500)return;
  const go=()=>{const o=new THREE.Object3D();o.position.copy(pos);scene.add(o);o.updateMatrixWorld();const s=new THREE.PositionalAudio(listener);s.setBuffer(buf);s.setRefDistance(ref);s.setRolloffFactor(1);s.setMaxDistance(6000);s.setVolume(vol);s.setPlaybackRate(rate);o.add(s);s.updateMatrixWorld();live++;
    s.onEnded=function(){this.isPlaying=false;live--;o.remove(s);scene.remove(o);try{s.disconnect()}catch(e){}};s.play()};
  if(delay&&dist>80)setTimeout(go,Math.min(dist/340,4)*1000);else go()}
function setAudio(on){audioOn=on;const b=$('snd');b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.textContent=on?'🔊 Âm thanh':'🔇 Âm thanh';
  if(on&&!listener){listener=new THREE.AudioListener();camera.add(listener);AC=listener.context;buildSounds();
    const amb=new THREE.Audio(listener);amb.setBuffer(SND.amb);amb.setLoop(true);amb.setVolume(.55);amb.play();
    planes.forEach(p=>{const s=new THREE.PositionalAudio(listener);s.setBuffer(SND.engine);s.setLoop(true);s.setRefDistance(90);s.setRolloffFactor(1);s.setMaxDistance(6000);s.setVolume(1.6);p.add(s);s.play()})}
  if(AC)(on?AC.resume():AC.suspend()).catch(()=>{})}
$('snd').onclick=()=>setAudio(!audioOn);

/* ---------------- lửa cháy ---------------- */
const fireMat=new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:0xff8a3a});
const fires=data.fx.fire.map((f,i)=>{const g=new THREE.Group();g.position.copy(B(...f));for(let k=0;k<7;k++){const s=new THREE.Sprite(fireMat);s.position.set((Math.random()-.5)*5,1+Math.random()*2.5,(Math.random()-.5)*5);s.userData.ph=Math.random()*9;g.add(s)}
  if(i<(MOBILE?1:3)){const L=new THREE.PointLight(0xff7a2a,60,70,1.6);L.position.y=3;g.add(L);g.userData.L=L}scene.add(g);return g});

/* ---------------- nổ: pháo, bom, đạn xe tăng (trên cạn / dưới nước) ---------------- */
const boomFx=[];const boomLight=new THREE.PointLight(0xffa050,0,260,1.5);scene.add(boomLight);
const WHITE_SPLASH=new THREE.SpriteMaterial({map:softTex,depthWrite:false,transparent:true,color:0xdfe8ee});
function spawnBoom(p,big=false){const water=sampleH(HG.h,p.x,p.z)<-1.15;const y0=water?-1.1:sampleH(HG.h,p.x,p.z);p=p.clone();p.y=y0+(water?0:1);const k=big?1.8:1;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:water?0xfff0d0:0xffc070}));s.position.copy(p);scene.add(s);
  const d=new THREE.Sprite(water?WHITE_SPLASH.clone():new THREE.SpriteMaterial({map:softTex,depthWrite:false,transparent:true,color:0x3a2c22}));d.position.copy(p);scene.add(d);
  boomFx.push({s,d,t:0,k,water});boomLight.position.copy(p).y+=6;boomLight.intensity=big?7000:4000;
  playAt(water?SND.splash:(SND.boom||[])[(Math.random()*3)|0],p,{vol:big?3.2:2.2,ref:big?70:45,rate:R(.8,1.15)});
  if(water)playAt((SND.boom||[])[2],p,{vol:1.4,ref:40,rate:R(.7,.9)})}
function updBoom(dt){for(let i=boomFx.length-1;i>=0;i--){const b=boomFx[i];b.t+=dt;const t=b.t,k=b.k;
  b.s.scale.setScalar((4+t*60)*k);b.s.material.opacity=Math.max(0,1-t*3);
  if(b.water){b.d.scale.set((5+t*8)*k,(4+Math.min(t,.6)*45)*k,1);b.d.position.y=-1.1+b.d.scale.y*.42;b.d.material.opacity=Math.max(0,.95-t*.45)}
  else{b.d.scale.setScalar((6+t*22)*k);b.d.position.y+=dt*4;b.d.material.opacity=Math.max(0,.9-t*.3)}
  if(t>3){scene.remove(b.s,b.d);b.s.material.dispose();b.d.material.dispose();boomFx.splice(i,1)}}boomLight.intensity*=Math.pow(.02,dt)}
// vị trí nổ ngẫu nhiên theo vùng (toạ độ Blender)
function randomTarget(){const r=Math.random();
  if(r<.32)return B(R(-480,-300),R(-300,300),0);                                  // bãi đổ bộ, trận địa QĐND
  if(r<.52){const p=crossPath(R(.2,.85),R(-100,70),0);return p.a}                  // trên sông
  if(r<.62)return Math.random()<.7?B(R(-296,-264),R(-220,220),0):B(R(-220,220),R(-296,-264),0);  // hào nước
  if(r<.85)return Math.random()<.65?B(R(-255,-205),R(-240,240),0):B(R(-240,240),R(-255,-205),0);  // mặt thành Nam/Tây
  return B(R(-230,230),R(-230,230),0)}                                             // trong thành

/* ---------------- máy bay A-37 bổ nhào ném bom xuống sông và bãi đổ bộ ---------------- */
const BOMB_GEO=new THREE.CapsuleGeometry(.18,1.1,3,6);const BOMB_MAT=new THREE.MeshStandardMaterial({color:0x2b2d24,roughness:.6,metalness:.4});
const bombs=[];const planeState=planes.map((p,i)=>({cool:R(3,8)+i*5,stick:0,next:0,prev:p.position.clone(),vel:new THREE.Vector3()}));
function inStrikeZone(p){const bx=p.x,by=-p.z;return bx<-300&&bx>-760&&Math.abs(by)<450}
function updPlanes(T,dt){planes.forEach((p,i)=>{const st=planeState[i];const a=T*(i?.16:.2)+i*2.4;const cx=-470,cy=-20,ax=i?380:300,ay=i?560:480,hh=i?190:160;
    const bx=cx+Math.cos(a)*ax,by=cy+Math.sin(a)*ay;p.position.copy(B(bx,by,hh+12*Math.sin(2*a)));
    const dx=-Math.sin(a)*ax,dy=Math.cos(a)*ay;p.rotation.set(0,faceTo(dx,dy),0);p.rotateZ(.5);
    st.vel.copy(p.position).sub(st.prev).divideScalar(Math.max(dt,1e-3));st.prev.copy(p.position);
    st.cool-=dt;if(st.cool<=0&&inStrikeZone(p.position)){st.stick=4;st.next=0;st.cool=R(9,15)}
    if(st.stick>0){st.next-=dt;if(st.next<=0){st.next=.32;st.stick--;
      const m=new THREE.Mesh(BOMB_GEO,BOMB_MAT);m.position.copy(p.position).add(new THREE.Vector3(0,-1.2,0));m.userData.v=st.vel.clone().multiplyScalar(.9);m.castShadow=false;scene.add(m);bombs.push(m);
      if(audioOn){const s=new THREE.PositionalAudio(listener);s.setBuffer(SND.whistle);s.setRefDistance(60);s.setVolume(1.3);s.setPlaybackRate(R(.9,1.1));m.add(s);s.play();m.userData.snd=s}}}})
  for(let i=bombs.length-1;i>=0;i--){const m=bombs[i];const v=m.userData.v;v.y-=9.8*dt;m.position.addScaledVector(v,dt);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize().negate());
    const g=Math.max(sampleH(HG.h,m.position.x,m.position.z),-1.1);if(m.position.y<=g+.3){if(m.userData.snd){try{m.userData.snd.stop()}catch(e){}}scene.remove(m);bombs.splice(i,1);spawnBoom(m.position,true)}}}

/* ---------------- xe tăng VNCH bắn ra ngoài thành ---------------- */
const tankFlash=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:0xffd090,fog:false}));tankFlash.visible=false;scene.add(tankFlash);let tankFlashT=0;
function updTanks(dt){tankFlashT-=dt;tankFlash.visible=tankFlashT>0;tankFlash.scale.setScalar(6+Math.random()*3);
  for(const t of tankObjs){t.next-=dt;if(t.next>0)continue;t.next=R(4,9);const muzzle=t.o.localToWorld(new THREE.Vector3(0,1.75,4.8));tankFlash.position.copy(muzzle);tankFlashT=.09;
    playAt((SND.boom||[])[1],muzzle,{vol:2.6,ref:45,rate:1.35});const tg=B(R(-470,-310),R(-240,240),0);setTimeout(()=>spawnBoom(tg),R(500,900))}}

/* ---------------- đường đạn lửa giữa 2 bên ---------------- */
const TR=MOBILE?60:130;const trGeo=new THREE.BufferGeometry();const trPos=new Float32Array(TR*6);trGeo.setAttribute('position',new THREE.BufferAttribute(trPos,3));
const trMat=new THREE.LineBasicMaterial({color:0xffc070,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,fog:false});
scene.add(new THREE.LineSegments(trGeo,trMat));
const pavnPts=PAVN_PTS,arvnPts=ARVN_PTS;
const tracers=[];for(let i=0;i<TR;i++)tracers.push({t:1+Math.random()});
function updTracers(dt){for(let i=0;i<TR;i++){const r=tracers[i];r.t+=dt*(r.sp||1);
  if(r.t>=1){const f=Math.random()<.5;r.a=(f?pavnPts:arvnPts)[(Math.random()*(f?pavnPts.length:arvnPts.length))|0];
    r.b=(f?arvnPts:pavnPts)[(Math.random()*(f?arvnPts.length:pavnPts.length))|0].clone().add(new THREE.Vector3((Math.random()-.5)*14,(Math.random()-.3)*5,(Math.random()-.5)*14));
    r.t=-Math.random()*1.2;r.sp=1.4+Math.random()*1.2}
  const a=r.a,b=r.b;if(!a||r.t<0){trPos.fill(0,i*6,i*6+6);continue}
  const t0=r.t,t1=Math.min(1,r.t+.05);for(let k=0;k<3;k++){trPos[i*6+k]=a.getComponent(k)+(b.getComponent(k)-a.getComponent(k))*t0;trPos[i*6+3+k]=a.getComponent(k)+(b.getComponent(k)-a.getComponent(k))*t1}}
  trGeo.attributes.position.needsUpdate=true}
const tmpV=new THREE.Vector3();
function updFlashes(dt){shotBudget=Math.min(shotBudget+dt*16,16);
  for(const f of flashes){const u=f.userData;u.t+=dt;let fired=false;if(u.t>u.per){u.t=0;u.per=.25+Math.random()*1.2;fired=true}f.visible=u.t<.06;
    if(f.visible)f.material.rotation=Math.random()*6;
    if(fired&&audioOn&&shotBudget>=1){f.getWorldPosition(tmpV);const d=tmpV.distanceTo(camera.position);if(d<500&&Math.random()<.7){shotBudget--;
      playAt(Math.random()<.18?SND.burst:(SND.shot||[])[(Math.random()*3)|0],tmpV,{vol:.9,ref:14,rate:R(.85,1.15)})}}}}
/* ---------------- chú thích & tư liệu ---------------- */
const INFO={
 gate:{t:'Cổng Tiền (cổng Nam)',p:B(0,-250,10),h:`<p>Thành cổ Quảng Trị được xây từ đầu thế kỷ XIX thời Nguyễn, ban đầu bằng đất, sau được xây lại bằng gạch. Thành có 4 cổng ở giữa 4 mặt; ảnh tư liệu năm 1972 cho thấy các vòm cổng bị bắn thủng, tường đổ nát.</p>`},
 wall:{t:'Tường thành kiểu Vauban',p:B(-250,180,8),h:`<p>Mặt bằng thành hình vuông, 4 góc có pháo đài nhô ra theo kiểu Vauban, bao quanh là hào nước. Trong 81 ngày đêm năm 1972, tường thành và các công trình bên trong bị bom đạn phá hủy gần như hoàn toàn.</p>`},
attack:{t:'Mũi tấn công QĐND',p:B(-330,-40,7),h:`<p>Kịch bản sa bàn: sau khi vượt sông Thạch Hãn, các tổ xung kích Quân đội Nhân dân Việt Nam đổ bộ lên bờ, triển khai trận địa bắn ngoài hào nước và bơi qua hào để áp sát mặt Tây (và một phần mặt Nam) của thành. Vị trí sông, hào và thành theo dữ liệu OpenStreetMap.</p>`},
 bunker:{t:'Lô cốt',p:B(-229,-85,6),h:`<p>Lô cốt bê tông có lỗ châu mai và bao cát, bố trí dọc chân thành phía trong. Trong kịch bản sa bàn, đây là các điểm hoả lực phòng ngự của quân VNCH.</p>`},
 river:{t:'Sông Thạch Hãn',p:B(-610,-200,6),h:`<p>Con sông chảy qua thị xã Quảng Trị. Năm 1972, bộ đội Quân đội Nhân dân Việt Nam vượt sông nhiều lần, chủ yếu vào ban đêm, bằng thuyền và bơi; nhiều người đã hy sinh trên sông. Ngày nay đây là nơi thả hoa đăng tưởng niệm.</p><p>Kịch bản sa bàn: các tổ bộ đội bơi và chèo thuyền gỗ vượt sông dưới bom đạn, từ bờ Tây sang, đổ bộ lên bờ phía thành để tấn công. Lòng sông dựng theo dữ liệu OpenStreetMap.</p>`},
 towers:{t:'Tháp sắt quan sát',p:B(140,120,24),h:`<p>Tháp giàn thép dùng để quan sát, tham khảo theo sa bàn trưng bày. Một tháp còn đứng, một tháp bị gãy gập vì bom đạn.</p>`},
 arvn:{t:'Quân VNCH cố thủ',p:B(-245,10,14),h:`<p>Kịch bản sa bàn: quân Việt Nam Cộng hòa phòng ngự trên mặt thành và trong các lô cốt; phía sau có xe tăng M41, trên không có máy bay cường kích A-37 ném bom xuống sông và bãi đổ bộ.</p>`},
 tower:{t:'Tháp nước',p:B(40,60,24),h:`<p>Tháp nước bằng thép bên trong thành xuất hiện trong nhiều ảnh tư liệu năm 1972, là một trong số ít công trình còn đứng giữa đống đổ nát.</p>`},
 moat:{t:'Hào nước',p:B(-280,150,4),h:`<p>Hào nước bao quanh tường thành; trong mô phỏng, nhiều hố bom quanh thành cũng đọng nước như mô tả trong hồi ký và ảnh tư liệu.</p>`}};
const SRC='<p class="src">Nội dung tóm tắt phục vụ học tập, cần đối chiếu tư liệu chính thức. Cảnh vật, nhân vật là tái dựng mô phỏng.</p>';
const lbls=[];for(const [k,v] of Object.entries(INFO)){const d=document.createElement('div');d.className='lbl';d.innerHTML=`<b>${v.t}</b><i></i>`;d.onclick=()=>showInfo(k);$('labels').append(d);lbls.push({d,p:v.p})}
function showInfo(k){$('infobody').innerHTML=`<h2>${INFO[k].t}</h2>${INFO[k].h}${SRC}`;$('info').hidden=false}
$('infox').onclick=()=>$('info').hidden=true;
let showLbl=true;$('lbtn').onclick=function(){showLbl=!showLbl;this.classList.toggle('on',showLbl);this.setAttribute('aria-pressed',showLbl)};
const pv=new THREE.Vector3();
function updLabels(){const w=innerWidth,h=innerHeight;for(const l of lbls){pv.copy(l.p).project(camera);const vis=showLbl&&pv.z<1&&Math.abs(pv.x)<1.1&&Math.abs(pv.y)<1.1&&camera.position.distanceTo(l.p)<2200;
  l.d.classList.toggle('hidden',!vis);if(vis){l.d.style.left=((pv.x+1)/2*w)+'px';l.d.style.top=((1-pv.y)/2*h)+'px'}}}

/* ---------------- góc nhìn ---------------- */
const VIEWS={all:[B(-1250,-650,380),B(-250,-30,10)],gate:[B(10,-345,7),B(0,-250,5)],inside:[B(-80,-120,6),B(60,80,6)],
  trench:[B(-470,-95,9),B(-300,-40,4)],towers:[B(170,90,14),B(140,120,9)],boat:[B(0,0,0),B(0,0,0)],river:[B(-262,-470,5),B(-304,-499,-1.5)],arvn:[B(-236,-35,14.5),B(-300,10,8)],tank:[B(-183,-128,7),B(-203,-150,2)]};
let tween=null;
function go(v){setWalk(false);let [p,t]=VIEWS[v];
  if(v==='river'){const sw=scene.children.find(h=>h.userData.swim);if(sw){const d=sw.userData.swim.b.clone().sub(sw.userData.swim.a).normalize();const sd=new THREE.Vector3(-d.z,0,d.x);p=sw.position.clone().addScaledVector(d,-4.5).addScaledVector(sd,2.2).add(new THREE.Vector3(0,1.5,0));t=sw.position.clone().addScaledVector(d,30).add(new THREE.Vector3(0,.4,0))}}
  if(v==='boat'){const g=boats[1];const d=g.userData.boat.b.clone().sub(g.userData.boat.a).normalize();const sd=new THREE.Vector3(-d.z,0,d.x);
    p=g.position.clone().addScaledVector(d,-5.5).addScaledVector(sd,3.6).setY(WATER_Y+2.3);t=g.position.clone().addScaledVector(d,3).setY(WATER_Y+.5)}
  tween={p0:camera.position.clone(),t0:controls.target.clone(),p,t,s:performance.now()}}
camera.position.copy(VIEWS.all[0]);controls.target.copy(VIEWS.all[1]);
$('views').onclick=e=>{const b=e.target.closest('button[data-v]');if(!b)return;document.querySelectorAll('#views button').forEach(x=>x.classList.toggle('on',x===b));go(b.dataset.v)};

/* ---------------- chế độ đi bộ ---------------- */
let walking=false,yaw=0,pitch=0;const keys={};const joy={x:0,y:0};
function setWalk(on){walking=on;$('walk').classList.toggle('on',on);$('walk').setAttribute('aria-pressed',on);controls.enabled=!on;$('cross').hidden=!on;$('joy').hidden=!(on&&MOBILE);
  $('help').textContent=on?(MOBILE?'Cần điều khiển trái để đi · vuốt màn hình để nhìn quanh':'W A S D để đi · Shift chạy nhanh · kéo chuột để nhìn quanh · Esc để thoát'):'Kéo để xoay · cuộn/chụm để phóng to · chạm chú thích để đọc tư liệu';
  if(on){const d=new THREE.Vector3();camera.getWorldDirection(d);yaw=Math.atan2(-d.x,-d.z);pitch=0;
    let p=camera.position.clone();if(p.y>40){p=new THREE.Vector3(0,0,140)}camera.position.set(p.x,sampleH(HG.h,p.x,p.z)+1.65,p.z);tween=null}}
$('walk').onclick=()=>setWalk(!walking);
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Escape'&&walking)setWalk(false)});addEventListener('keyup',e=>keys[e.code]=false);
let drag=null;canvas.addEventListener('pointerdown',e=>{if(walking){drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(walking&&drag&&e.pointerId===drag.id){yaw-=(e.clientX-drag.x)*.004;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY}});
canvas.addEventListener('pointerup',()=>drag=null);
const jb=$('joy'),jk=jb.firstElementChild;let jid=null;
jb.addEventListener('pointerdown',e=>{jid=e.pointerId;jb.setPointerCapture(jid);e.stopPropagation()});
jb.addEventListener('pointermove',e=>{if(e.pointerId!==jid)return;const r=jb.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}joy.x=x;joy.y=y;jk.style.transform=`translate(${x*35}px,${y*35}px)`});
jb.addEventListener('pointerup',()=>{jid=null;joy.x=joy.y=0;jk.style.transform=''});
function updWalk(dt){let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y,s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x;
  const sp=(keys.ShiftLeft||keys.ShiftRight?9:4)*dt;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*sp,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*sp;
  const p=camera.position;const gh=sampleH(HG.h,p.x,p.z);
  for(const [mx,mz] of [[dx,0],[0,dz]]){const nx=p.x+mx,nz=p.z+mz;const ob=sampleH(HG.ob,nx,nz);const ng=sampleH(HG.h,nx,nz);
    if(ob>gh+1.3||ng>gh+1.3)continue;p.x=nx;p.z=nz}
  const target=Math.max(sampleH(HG.h,p.x,p.z),-1.0)+1.65;p.y+=(target-p.y)*Math.min(1,dt*10);
  camera.rotation.set(pitch,yaw,0,'YXZ')}

/* ---------------- tạm dừng ---------------- */
let paused=false;$('pause').onclick=function(){paused=!paused;this.textContent=paused?'▶':'⏸';this.setAttribute('aria-pressed',paused)};

/* ---------------- vòng lặp ---------------- */
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();sMat.uniforms.scale.value=h/2}
addEventListener('resize',resize);resize();
const clock=new THREE.Clock();let T=0,nextBoom=1;
$('loadtxt').textContent='Đang chuẩn bị đồ hoạ…';
try{if(renderer.compileAsync)await renderer.compileAsync(scene,camera)}catch(e){}
if(/\/khong-gian\//.test(location.pathname))$('back').hidden=false;
$('load').classList.add('done');
renderer.setAnimationLoop(()=>{
  const rawDt=clock.getDelta();const dt=Math.min(rawDt,.1);
  if(!document.hidden){Q.acc+=rawDt;Q.n++;if(Q.acc>2.5){const fps=Q.n/Q.acc;Q.acc=0;Q.n=0;if(fps<28&&Q.lv>0)setQuality(Q.lv-1)}}
  if(!paused){T+=dt;
    const camP=camera.position;
    WN.offset.set(T*.004,T*.0025);for(const h of swimmers){const s=h.userData.swim;const t=((T/s.per)+s.ph)%1;h.position.lerpVectors(s.a,s.b,t)}
    updRunners(T);updBoats(T);
    const FAR2=Q.far**2;_pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_fr.setFromProjectionMatrix(_pm);
    for(const m of mixers){const r=m.getRoot().parent;r.getWorldPosition(tmpV);const d2=tmpV.distanceToSquared(camP);
      if(r.parent===scene){_sph.center.copy(tmpV);_sph.center.y+=1;r.visible=d2<FAR2&&_fr.intersectsSphere(_sph);if(!r.visible)continue}else if(!r.parent.visible)continue;
      const sh=!MOBILE&&d2<170*170;if(r.userData.sh!==sh&&r.userData.meshes){r.userData.sh=sh;for(const o of r.userData.meshes)o.castShadow=sh}
      m._acc=(m._acc||0)+dt;if(d2<150*150||(d2<500*500?m._acc>.1:m._acc>.25)){m.update(m._acc);m._acc=0}}
    updFlashes(dt);
    updSmoke(dt);updTracers(dt);updBoom(dt);updPlanes(T,dt);updTanks(dt);
    if(T>nextBoom){spawnBoom(randomTarget(),Math.random()<.15);nextBoom=T+R(.5,1.8)}
    for(const g of fires){for(const s of g.children)if(s.isSprite){const k=Math.sin(T*9+s.userData.ph)*.5+.5;s.scale.set(3+k*2,4+k*3,1)}if(g.userData.L)g.userData.L.intensity=45+Math.sin(T*13+g.position.x)*15}
    turrets.forEach(t=>t.o.rotation.y=t.base+Math.sin(T*.4+t.ph)*.15);
  }
  if(tween){const k=Math.min((performance.now()-tween.s)/1800,1),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(tween.p0,tween.p,e);controls.target.lerpVectors(tween.t0,tween.t,e);if(k>=1)tween=null}
  if(walking)updWalk(dt);else controls.update();
  // bóng đổ theo vùng camera
  const fc=walking?camera.position:controls.target;sun.target.position.copy(fc);sun.position.copy(fc).add(B(-1000,-250,160).normalize().multiplyScalar(800));
  updLabels();renderer.render(scene,camera);
});
