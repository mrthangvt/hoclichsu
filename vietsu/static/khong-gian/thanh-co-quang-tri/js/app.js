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
  uniforms:{sun:{value:new THREE.Vector3(-1,.16,.25).normalize()},night:{value:0},storm:{value:0},flash:{value:0}},
  vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}`,
  fragmentShader:`varying vec3 vd;uniform vec3 sun;uniform float night;uniform float storm;uniform float flash;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
  void main(){float y=vd.y;vec3 hor=vec3(.96,.48,.22),mid=vec3(.62,.36,.24),top=vec3(.16,.12,.11);
  vec3 c=mix(hor,mid,smoothstep(-.02,.12,y));c=mix(c,top,smoothstep(.12,.55,y));
  float s=max(dot(vd,sun),0.);c+=vec3(1.,.55,.25)*pow(s,40.)*1.4+vec3(1.,.45,.2)*pow(s,6.)*.25;
  float cl=fbm(vd.xz/(y+.25)*2.2);c=mix(c,c*vec3(.35,.3,.28),smoothstep(.45,.8,cl)*smoothstep(.0,.15,y)*.85);
  if(y<0.)c=mix(vec3(.6,.4,.27),vec3(.3,.2,.15),clamp(-y*4.,0.,1.));
  vec3 nc=mix(vec3(.09,.06,.05),vec3(.01,.014,.028),smoothstep(-.05,.45,y));nc+=vec3(.32,.12,.04)*exp(-abs(y)*14.)*.55;
  nc+=step(.9986,h(floor(vd.xz/(y+.3)*260.)))*smoothstep(.12,.4,y)*.45*(1.-smoothstep(.45,.8,cl));
  c=mix(c,nc,night);
  vec3 sc=mix(vec3(.40,.41,.43),vec3(.19,.2,.22),smoothstep(-.02,.5,y));sc=mix(sc,sc*.16,night);sc*=.8+.35*fbm(vd.xz/(y+.25)*1.4);
  c=mix(c,sc,storm*.93);c+=flash*vec3(.72,.78,1.)*(.35+.65*smoothstep(-.1,.4,y));
  gl_FragColor=vec4(c,1.);}`}));
const SKY=sky.material.uniforms;
sky.renderOrder=-1;scene.add(sky);

const hemi=new THREE.HemisphereLight(0xffd2a8,0x5a4030,1.7);scene.add(hemi);
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

const [gStatic,gQ,gV,gLib,gBoat,data,rai,ROADS]=await Promise.all([fetchB64(files.static,'static').then(parse),fetchB64(files.qdnd,'qdnd').then(parse),fetchB64(files.vnch,'vnch').then(parse),fetchB64(files.lib,'lib').then(parse),fetchB64(files.boat,'boat').then(parse),fetch(ASSETS.scene).then(r=>r.json()),fetch(ASSETS.rai).then(r=>r.json()),fetch(ASSETS.roads||'data/osm_roads.json').then(r=>r.json()).catch(()=>({roads:[]}))]).catch(e=>{$('loadtxt').textContent=e.message;throw e});

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
const WET=[M_GROUND,M_CRATER,M_RUBBLE,M_WALL_OUT,M_WALL_CORE,M_BRICK,M_STONE];WET.forEach(m=>{m.userData.r0=m.roughness;m.userData.c0=m.color.clone()});
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
// Mỗi nhân vật/hiệu ứng thuộc một NHÓM; trạng thái chiến trường (setState) bật/tắt nhóm. PTS[nhóm] = điểm đầu/cuối đường đạn.
let GRP='legacy';const PTS={},GSIDE={},ACT=new Set();const PT=v=>{(PTS[GRP]||(PTS[GRP]=[])).push(v)};
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
    if(g){const sp=new THREE.Sprite(FLASH_MAT);sp.scale.setScalar(.55);sp.position.set(0,.03,.95);sp.visible=false;sp.userData={per:.35+Math.random()*.6,t:Math.random(),side,grp:GRP};g.add(sp);flashes.push(sp)}}
  h.userData.grp=GRP;GSIDE[GRP]=side;if(parent===scene)NPC.push(h);return h}

/* ================= THỊ XÃ QUẢNG TRỊ 1972: nhà, cây, công sự ngoài thành (theo ảnh tư liệu + đường OSM) =================
   Dựng bằng InstancedMesh (ít lần vẽ). Hai trạng thái: nguyên vẹn (trước chiến sự / hôm nay) và chiến tranh (2/3 nhà tốc mái, đổ nát). */
const TOWN=(()=>{
  const N=HG.n,C=HG.cell,Hh=HG.size/2,occ=new Uint8Array(N*N);
  const cellOf=(x,z)=>{const xi=Math.floor((x+Hh)/C),zi=Math.floor((z+Hh)/C);return (xi<0||zi<0||xi>=N||zi>=N)?-1:zi*N+xi};
  const RA=[-668,746],RB=[-606,-728];const rdx=RB[0]-RA[0],rdy=RB[1]-RA[1],rL2=rdx*rdx+rdy*rdy;
  const riverD=(x,y)=>{let t=((x-RA[0])*rdx+(y-RA[1])*rdy)/rL2;t=Math.max(-.3,Math.min(1.3,t));return Math.hypot(x-(RA[0]+rdx*t),y-(RA[1]+rdy*t))};
  // vùng chừa trống: thành + hào, sông, lối tiếp viện/bến, dải trận địa cũ, bãi trống phía Nam và phía Đông trước hào
  const blocked=(x,y)=>Math.abs(x)>870||Math.abs(y)>870||(Math.abs(x)<318&&Math.abs(y)<318)||riverD(x,y)<128||(x>-570&&x<-300&&Math.abs(y)<70)||(Math.abs(x)<240&&y>-585&&y<-300)||(x>300&&x<465&&y>-225&&y<145);
  // kiểm tra + đánh dấu chiếm chỗ theo hình chữ nhật xoay (toạ độ Blender)
  function rect(cx,cy,w,d,th,mark,h){const c=Math.cos(th),s=Math.sin(th);const cells=[];for(let u=-w/2;u<=w/2+.01;u+=1.6)for(let v=-d/2;v<=d/2+.01;v+=1.6){
      const x=cx+u*c-v*s,y=cy+u*s+v*c;if(blocked(x,y))return null;const k=cellOf(x,-y);if(k<0||occ[k])return null;if(HG.ob[k]>HG.h[k]+.5&&HG.ob[k]>-1e8)return null;if(HG.h[k]<-.45&&HG.h[k]>-1e8)return null;cells.push(k)}
    if(mark)for(const k of cells){occ[k]=1;if(h)HG.ob[k]=Math.max(HG.ob[k],HG.h[k]+h)}return cells}
  const houses=[];const MULT=MOBILE?1.6:1;
  const WALL=['#ddd6c6','#d2c7b0','#e4ddcf','#c4b8a0','#cdbda2','#d8cdb5'].map(c=>new THREE.Color(c)),TILE=['#8c4b33','#7d4431','#965a3c','#82503a'].map(c=>new THREE.Color(c)),
        TIN=['#7e7c74','#6c6b65','#8b857a','#7a5c46'].map(c=>new THREE.Color(c));
  const pick=a=>a[(Math.random()*a.length)|0];
  function place(x,y,w,d,h,th,kind){const g=groundAt(x,y);if(g<-.4)return false;if(!rect(x,y,w+1.2,d+1.2,th,false))return false;rect(x,y,w+.6,d+.6,th,true,h+(kind==='shop'?.5:1.6));
    houses.push({x,y,g,w,d,h,th,kind,wall:pick(WALL).clone().multiplyScalar(R(.92,1.04)),roof:(kind==='shop'||Math.random()<.35?pick(TIN):pick(TILE)).clone(),ruin:Math.random()<.66});return true}
  for(const [type,pts] of (ROADS.roads||[])){if(type==='tb')continue;const main=type==='t'||type==='p';
    for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1];const L=Math.hypot(bx-ax,by-ay);if(L<4)continue;const tx=(bx-ax)/L,ty=(by-ay)/L,nx=-ty,ny=tx,th=Math.atan2(ty,tx);
      for(const side of [1,-1]){let u=R(0,6);while(u<L){
        let w,d,h,kind,off;if(main&&Math.random()<.75){kind='shop';w=R(4.2,6.2);d=R(11,16);h=R(5.6,7.6);off=d/2+6.5}else{kind='house';w=R(6.5,11);d=R(7.5,12);h=R(3,3.8);off=d/2+R(8,11)}
        const cx=ax+tx*(u+w/2),cy=ay+ty*(u+w/2);place(cx+nx*off*side,cy+ny*off*side,w,d,h,th,kind);
        // hàng sau (sân, vườn, nhà trong hẻm) cho dày như ảnh tư liệu
        if(Math.random()<(MOBILE?.35:.62)){const w2=R(6,10),d2=R(7,11),o2=off+d/2+R(6,10)+d2/2;place(cx+nx*o2*side+tx*R(-3,3),cy+ny*o2*side+ty*R(-3,3),w2,d2,R(3,3.6),th+R(-.06,.06),'house')}
        if(!MOBILE&&Math.random()<.3){const w3=R(6,9),d3=R(7,10),o3=off+d/2+R(22,30)+d3/2;place(cx+nx*o3*side,cy+ny*o3*side,w3,d3,R(3,3.5),th+R(-.1,.1),'house')}
        u+=(kind==='shop'?w+R(.2,1.2):w+R(4,10))*MULT}}}}
  // cây xanh: quanh nhà (vườn) + rải thêm ở vùng trống
  const trees=[];function tree(x,y,big){if(blocked(x,y))return;const k=cellOf(x,-y);if(k<0||occ[k])return;const g=groundAt(x,y);if(g<-.4)return;occ[k]=1;
    trees.push({x,y,g,h:big?R(10,16):R(6,10),r:big?R(4.2,6.2):R(2.8,4.4),c:new THREE.Color().setHSL(R(.2,.3),R(.4,.6),R(.24,.36)),bare:Math.random()<.3})}
  for(let gq=0;gq<(MOBILE?60:170);gq++){const a=R(0,6.28),r=R(330,860),cx=Math.cos(a)*r,cy=Math.sin(a)*r;for(let k=0;k<(MOBILE?5:9);k++)tree(cx+R(-28,28),cy+R(-28,28),Math.random()<.4)}   // lùm cây, vườn
  for(const hs of houses)if(Math.random()<(MOBILE?.4:.85)){for(let k=0;k<(Math.random()<.4?2:1);k++){const a=R(0,6.28),r=Math.max(hs.w,hs.d)*.5+R(3,8);tree(hs.x+Math.cos(a)*r,hs.y+Math.sin(a)*r,Math.random()<.25)}}
  for(let k=0;k<(MOBILE?350:1100);k++){const a=R(0,6.28),r=R(330,870);tree(Math.cos(a)*r,Math.sin(a)*r,Math.random()<.35)}
  // công sự ngoài thành (chỉ hiện trong thời kỳ chiến tranh): hào giao thông chữ chi + ụ bao cát
  const trench=[],sand=[];
  for(let c=0;c<(MOBILE?8:16);c++){const a=R(0,6.28),r=R(335,520);let x=Math.cos(a)*r,y=Math.sin(a)*r;let th=a+Math.PI/2;
    for(let s2=0;s2<7;s2++){const L=R(7,11);const cx=x+Math.cos(th)*L/2,cy=y+Math.sin(th)*L/2;if(!blocked(cx,cy)&&rect(cx,cy,L,1.6,th,true,0)){trench.push({x:cx,y:cy,L,th,g:groundAt(cx,cy)})}
      x+=Math.cos(th)*L;y+=Math.sin(th)*L;th+=(s2%2?.9:-.9)}}
  for(let k=0;k<(MOBILE?30:70);k++){const a=R(0,6.28),r=R(330,600),x=Math.cos(a)*r,y=Math.sin(a)*r;if(rect(x,y,6,6,0,true,1.2))sand.push({x,y,g:groundAt(x,y),s:R(.6,.9)})}

  const inner=[];{const occ2=[];const ok=(x,y,w,d)=>!occ2.some(o=>Math.abs(o.x-x)<(o.w+w)/2+8&&Math.abs(o.y-y)<(o.d+d)/2+8)&&Math.hypot(x-40,y-60)>30&&Math.hypot(x-140,y-120)>20&&Math.hypot(x-120,y+140)>20&&Math.abs(x)>14&&Math.abs(y)>14;
    for(let k=0;k<(MOBILE?120:260)&&inner.length<(MOBILE?22:42);k++){const rot=Math.random()<.5;const w=rot?R(8,11):R(28,52),d=rot?R(28,52):R(8,11);const x=R(-215+w/2,215-w/2),y=R(-215+d/2,215-d/2);
      if(!ok(x,y,w,d))continue;occ2.push({x,y,w,d});inner.push({x,y,g:groundAt(x,y),w,d,h:R(3.6,5),th:0,roof:(Math.random()<.5?pick(TILE):pick(TIN)).clone(),wall:pick(WALL).clone()})}
    for(let k=0;k<(MOBILE?40:110);k++){const x=R(-215,215),y=R(-215,215);if(occ2.some(o=>Math.abs(o.x-x)<o.w/2+3&&Math.abs(o.y-y)<o.d/2+3))continue;
      trees.push({x,y,g:groundAt(x,y),h:R(7,12),r:R(3,5),c:new THREE.Color().setHSL(R(.2,.3),R(.4,.6),R(.24,.34)),bare:true,inner:true})}}
  /* ---- dựng InstancedMesh ---- */
  const n=houses.length;const geoW=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);const geoR=new THREE.ConeGeometry(.7071,1,4,1).rotateY(Math.PI/4).translate(0,.5,0);
  const mW=new THREE.MeshStandardMaterial({roughness:.92,color:0xffffff}),mR=new THREE.MeshStandardMaterial({roughness:.82,color:0xffffff,flatShading:true});
  const IW=new THREE.InstancedMesh(geoW,mW,n),IR=new THREE.InstancedMesh(geoR,mR,n);
  const trunkG=new THREE.CylinderGeometry(.18,.28,1,5).translate(0,.5,0),crownG=new THREE.IcosahedronGeometry(1,0);
  const IT=new THREE.InstancedMesh(trunkG,new THREE.MeshStandardMaterial({color:0x3d2e22,roughness:1}),trees.length),IC=new THREE.InstancedMesh(crownG,new THREE.MeshStandardMaterial({roughness:.95,flatShading:true,color:0xffffff}),trees.length);
  const ITr=new THREE.InstancedMesh(geoW,new THREE.MeshStandardMaterial({color:0x2a2018,roughness:1}),Math.max(1,trench.length)),ISd=new THREE.InstancedMesh(new THREE.TorusGeometry(3.2,.55,5,14),new THREE.MeshStandardMaterial({color:0x6e5c42,roughness:1,flatShading:true}),Math.max(1,sand.length));
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3(),Y=new THREE.Vector3(0,1,0),Z0=new THREE.Vector3(0,0,0);
  const set=(im,i,x,y,z,rot,sx,sy,sz)=>{v.copy(B(x,y,0));v.y=z;q.setFromAxisAngle(Y,rot);sc.set(sx,sy,sz);m4.compose(v,q,sc);im.setMatrixAt(i,m4)};
  trench.forEach((t,i)=>set(ITr,i,t.x,t.y,t.g-.55,t.th,t.L,.7,1.4));sand.forEach((t,i)=>{v.copy(B(t.x,t.y,0));v.y=t.g+.25;q.setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);sc.set(t.s,t.s,t.s*.6);m4.compose(v,q,sc);ISd.setMatrixAt(i,m4)});
  const dark=new THREE.Color(0x3a3029);
  function setMode(intact){
    houses.forEach((hs,i)=>{const ruin=!intact&&hs.ruin;const hh=ruin?hs.h*R(.35,.6):hs.h;set(IW,i,hs.x,hs.y,hs.g-.3,hs.th,hs.w,hh+.3,hs.d);
      IW.setColorAt(i,ruin?hs.wall.clone().lerp(dark,.55):hs.wall);
      if(ruin)set(IR,i,hs.x,hs.y,-50,0,0,0,0);else if(hs.kind==='shop')set(IR,i,hs.x,hs.y,hs.g+hs.h,hs.th,hs.w*1.05,.5,hs.d*1.02);else set(IR,i,hs.x,hs.y,hs.g+hs.h,hs.th,hs.w*1.22,Math.min(hs.w,hs.d)*.42,hs.d*1.18);
      IR.setColorAt(i,!intact&&!ruin?hs.roof.clone().multiplyScalar(.82):hs.roof)});
    trees.forEach((t,i)=>{const bare=!intact&&t.bare&&!t.inner;set(IT,i,t.x,t.y,t.g,0,1,t.h*(bare?.8:.55),1);
      if(t.inner){if(!intact){set(IT,i,t.x,t.y,-50,0,0,0,0);set(IC,i,t.x,t.y,-50,0,0,0,0);return}}
      if(bare)set(IC,i,t.x,t.y,-50,0,0,0,0);else{v.copy(B(t.x,t.y,0));v.y=t.g+t.h*.62;q.setFromEuler(new THREE.Euler(R(-.2,.2),R(0,6),R(-.2,.2)));sc.set(t.r,t.r*R(.75,1),t.r);m4.compose(v,q,sc);IC.setMatrixAt(i,m4)}
      IC.setColorAt(i,intact?t.c:t.c.clone().lerp(new THREE.Color(0x4a4a2e),.35))});
    for(const im of [IW,IR,IT,IC]){im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere()}
    ITr.visible=ISd.visible=!intact&&trench.length>0;if(typeof IIW!=='undefined'){IIW.visible=IIR.visible=intact&&inner.length>0}}
  for(const im of [IW,IR,IT,IC,ITr,ISd]){im.castShadow=!MOBILE;im.receiveShadow=!MOBILE;scene.add(im)}
  IW.setColorAt(0,WALL[0]);IR.setColorAt(0,TILE[0]);IC.setColorAt(0,new THREE.Color(0x335522));
  ITr.computeBoundingSphere();ISd.computeBoundingSphere();ITr.castShadow=ISd.castShadow=false;
  const IIW=new THREE.InstancedMesh(geoW,mW,Math.max(1,inner.length)),IIR=new THREE.InstancedMesh(geoR,mR,Math.max(1,inner.length));
  inner.forEach((hs,i)=>{set(IIW,i,hs.x,hs.y,hs.g-.3,0,hs.w,hs.h+.3,hs.d);IIW.setColorAt(i,hs.wall);set(IIR,i,hs.x,hs.y,hs.g+hs.h,0,hs.w*1.12,Math.min(hs.w,hs.d)*.38,hs.d*1.12);IIR.setColorAt(i,hs.roof)});
  for(const im of [IIW,IIR]){im.castShadow=im.receiveShadow=!MOBILE;im.computeBoundingSphere();im.visible=false;scene.add(im)}
  setMode(false);
  return {setMode,houses:n,trees:trees.length,trench:trench.length,sand:sand.length,intact:false};
})();

/* ---- sông Thạch Hãn: trục và đường vượt sông ---- */
const RIVER_A=[-668,746],RIVER_B=[-606,-728];   // trục sông Thạch Hãn phía Tây thành, theo OpenStreetMap (s>0: bờ Tây xa, s<0: bờ phía thành)
function crossPath(t,s0,s1){const ax=RIVER_A[0],ay=RIVER_A[1],bx=RIVER_B[0],by=RIVER_B[1];const mx=ax+(bx-ax)*t,my=ay+(by-ay)*t;let dx=bx-ax,dy=by-ay;const L=Math.hypot(dx,dy);dx/=L;dy/=L;const nx=dy,ny=-dx;
  return {a:B(mx+nx*s0,my+ny*s0,0),b:B(mx+nx*s1,my+ny*s1,0),pa:[mx+nx*s0,my+ny*s0],pb:[mx+nx*s1,my+ny*s1]}}   // s>0: bờ Nam (xa) · s<0: bờ phía thành

/* ---- VNCH: phòng ngự trên mặt thành (hướng Nam, Tây đông nhất) ---- */
const VCLIPS=['QuyBan','QuyBan','DiNgamBan_TaiCho','NemLuuDan_TaiCho','DiNgangBan_TaiCho','QuyBan'];
const WALLS=[{n:[-1,0],k:46},{n:[0,-1],k:26},{n:[0,1],k:12},{n:[1,0],k:8}];GRP='vWall';
for(const w of WALLS){const k=Math.round(w.k*MUL);for(let i=0;i<k;i++){let t=R(-232,232);if(Math.abs(t)<15)t+=t<0?-15:15;
  const d=R(248.5,251);const bx=w.n[0]?w.n[0]*d:t,by=w.n[1]?w.n[1]*d:t;
  const h=spawn('V',VCLIPS[i%VCLIPS.length],bx,by,faceTo(w.n[0],w.n[1])+R(-.25,.25),{flash:true});PT(h.position.clone().add(UP14))}}

/* ---- lô cốt bê tông + bao cát ---- */
const M_CONC=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'dat.webp',.6,true),color:0xa49e94,roughness:.95});
const M_SAND=new THREE.MeshStandardMaterial({color:0x6e5c42,roughness:1,flatShading:true});
const BG={body:new THREE.CylinderGeometry(2.3,2.7,2.1,12),roof:new THREE.CylinderGeometry(2.85,2.85,.35,12),slit:new THREE.CylinderGeometry(2.36,2.46,.32,12,1,true,-1.1,2.2),sand:new THREE.TorusGeometry(3.4,.55,5,16)};
const BUNKERS=[[-229,-20],[-229,205],[-229,-215],[-180,-228],[-110,-229],[-45,-228],[40,-228],[110,-229],[180,-228],[-24,-214],[24,-214],[-214,-214],[-229,-160],[-229,-85],[-229,70],[-229,150],[-150,-185],[60,-172],[-170,40],[229,-120],[0,229]];
const bunkers=[];GRP='vBunker';
for(const [bx,by] of BUNKERS){const ox=Math.abs(bx)>Math.abs(by)?Math.sign(bx):0,oy=ox?0:Math.sign(by);
  const g=new THREE.Group();g.position.copy(B(bx,by,0));g.position.y=groundAt(bx,by)-.15;g.rotation.y=faceTo(ox,oy);
  const body=new THREE.Mesh(BG.body,M_CONC);body.position.y=1.05;const roof=new THREE.Mesh(BG.roof,M_CONC);roof.position.y=2.25;
  const slit=new THREE.Mesh(BG.slit,M_HOLE);slit.position.y=1.45;const sand=new THREE.Mesh(BG.sand,M_SAND);sand.rotation.x=Math.PI/2;sand.scale.z=.6;sand.position.y=.3;
  for(const m of [body,roof,sand]){m.castShadow=!MOBILE;m.receiveShadow=!MOBILE}
  g.add(body,roof,slit,sand);scene.add(g);bunkers.push(g);
  const tx=-oy,ty=ox;for(const sgn of MOBILE?[1]:[1,-1]){const px=bx+tx*3.5*sgn+ox*.6,py=by+ty*3.5*sgn+oy*.6;
    const h=spawn('V',sgn>0?'QuyBan':'DiNgamBan_TaiCho',px,py,faceTo(ox,oy)+R(-.3,.3),{flash:true});PT(h.position.clone().add(UP14))}}

/* ---- xe tăng M41 của VNCH: chuyển vào trong thành, nòng hướng ra ngoài ---- */
const TANKS=[{n:'XeTang_VNCH_0',p:[-203,-150],o:[-1,0]},{n:'XeTang_VNCH_1',p:[-60,-202],o:[-.15,-1]},{n:'XeTang_VNCH_2',p:[-200,-40],o:[-1,-.1]},{n:'XeTang_VNCH_3',p:[-198,115],o:[-1,0]}];
const tankObjs=[];GRP='vTank';
for(const t of TANKS){const o=world.getObjectByName(t.n);if(!o)continue;o.position.copy(B(t.p[0],t.p[1],0));o.position.y=groundAt(t.p[0],t.p[1])+.05;o.rotation.set(0,faceTo(t.o[0],t.o[1]),0);
  const tp=o.position.clone().add(new THREE.Vector3(0,2.2,0));tankObjs.push({o,next:R(2,8),def:t,pt:tp});(PTS.tanks||(PTS.tanks=[])).push(tp);GSIDE.tanks='V';
  for(let k=0;k<(MOBILE?1:3);k++){const a=R(0,6.28);spawn('V','DiNgamBan_TaiCho',t.p[0]+Math.cos(a)*5,t.p[1]+Math.sin(a)*5,faceTo(t.o[0],t.o[1]),{flash:true})}}

/* ---- QĐND: bơi vượt sông Thạch Hãn vào bờ phía thành ---- */
GRP='qSwim';const NSW=Math.round(36*MUL);
for(let k=0;k<NSW;k++){const t=.28+.25*k/NSW+R(0,.006);const p=crossPath(t,R(70,80),R(-108,-100));
  const h=spawn('Q','Boi_TaiCho',0,0,0,{z:-1.85});h.userData.swim={a:p.a.setY(-1.85),b:p.b.setY(-1.85),ph:Math.random(),per:R(95,130)};
  h.rotation.y=Math.atan2(p.b.x-p.a.x,p.b.z-p.a.z);swimmers.push(h)}
/* bơi qua hào nước (mặt Nam, Tây) để áp sát chân thành */
GRP='qMoat';
for(let k=0;k<Math.round(12*MUL);k++){const south=k%4===3;const t=R(-200,200);if(Math.abs(t)<20)continue;
  const a=south?[t,-298]:[-298,t*.6],b=south?[t,-263]:[-263,t*.6];
  const h=spawn('Q','Boi_TaiCho',a[0],a[1],faceTo(south?0:1,south?1:0),{z:-1.85});h.userData.swim={a:B(a[0],a[1],-1.85),b:B(b[0],b[1],-1.85),ph:Math.random(),per:R(35,50)};swimmers.push(h)}

/* ---- QĐND: trận địa bắn bên ngoài hào (mặt Nam và Tây) ---- */
const QCLIPS=['QuyBan','QuyBan','DiNgamBan_TaiCho','NemLuuDan_TaiCho','QuyBan'];
GRP='qFire';let placed=0,tries=0;const NFIRE=Math.round(46*MUL);
while(placed<NFIRE&&tries++<800){const west=Math.random()<.8;const bx=west?R(-338,-302):R(-240,0),by=west?R(-240,240):R(-335,-303);
  if(groundAt(bx,by)<-.9)continue;const tgt=west?[-250,by+R(-20,20)]:[bx+R(-20,20),-250];
  const h=spawn('Q',QCLIPS[placed%QCLIPS.length],bx,by,faceTo(tgt[0]-bx,tgt[1]-by),{flash:true});PT(h.position.clone().add(UP14));placed++}

/* ---- QĐND: các tổ xung kích từ bờ sông chạy lên áp sát thành rồi quỳ bắn ---- */
GRP='qRun';for(let k=0;k<Math.round(30*MUL);k++){const t=R(.30,.72);const p=crossPath(t,-112,-135);
  let tx=R(-335,-305),ty=Math.max(-235,Math.min(235,p.pa[1]+R(-40,40)));for(let j=0;j<20&&groundAt(tx,ty)<-.9;j++){tx=R(-335,-305)}
  const h=spawn('Q','ChayLonNhao_TaiCho',p.pa[0],p.pa[1],0,{extra:['QuyBan']});
  const a=p.a.clone(),b=B(tx,ty,0);const dist=a.distanceTo(b);
  h.userData.run={a,b,dur:dist/R(3,4.2),hold:R(8,18),ph:R(0,60),rot:Math.atan2(b.x-a.x,b.z-a.z)};
  h.rotation.y=h.userData.run.rot;runners.push(h);PT(b.clone().setY(groundAt(tx,ty)+1.4))}
function updRunners(T){for(const h of runners){if(!ACT.has(h.userData.grp))continue;const u=h.userData.run;const cyc=u.dur+u.hold;const k=(T+u.ph)%cyc;const run=h.userData.acts[u.cr||'ChayLonNhao_TaiCho'],fire=h.userData.acts[u.ch||'QuyBan'];
  if(k<u.dur){h.position.lerpVectors(u.a,u.b,k/u.dur);h.position.y=Math.max(sampleH(HG.h,h.position.x,h.position.z),-1.7);h.rotation.y=u.rot;run.setEffectiveWeight(1);fire.setEffectiveWeight(0)}
  else{h.position.copy(u.b);h.position.y=sampleH(HG.h,u.b.x,u.b.z);h.rotation.y=u.rot+Math.PI*0;run.setEffectiveWeight(0);fire.setEffectiveWeight(1)}}}

/* ================= NHÓM CHO CHẾ ĐỘ KỂ CHUYỆN (81 ngày đêm: QĐND giữ thành, VNCH phản công) ================= */
const freeAt=(bx,by)=>{const g=groundAt(bx,by);const p=B(bx,by,0);return g>-.9&&sampleH(HG.ob,p.x,p.z)<g+.6};
/* QĐND phòng thủ trên mặt thành — mặt Nam và Đông là hướng phản công chính của VNCH */
GRP='qWall';{const QW=[{n:[0,-1],k:30},{n:[1,0],k:12},{n:[-1,0],k:8},{n:[0,1],k:5}];const CL=['QuyBan','NupQuanSat','DungBan','DiNgamBan_TaiCho','NemLuuDan_TaiCho','KhomChe','DungNgam','QuyBan','DungNapDan'];
  for(const w of QW){const k=Math.round(w.k*MUL);for(let i=0;i<k;i++){let t=R(-232,232);if(Math.abs(t)<15)t+=t<0?-15:15;const d=R(248.5,251);
    const bx=w.n[0]?w.n[0]*d:t,by=w.n[1]?w.n[1]*d:t;const h=spawn('Q',CL[i%CL.length],bx,by,faceTo(w.n[0],w.n[1])+R(-.25,.25),{flash:true});PT(h.position.clone().add(UP14))}}}
/* QĐND trong các lô cốt, công sự sát chân thành */
GRP='qBunker';for(const [bx,by] of BUNKERS){const ox=Math.abs(bx)>Math.abs(by)?Math.sign(bx):0,oy=ox?0:Math.sign(by);
  const h=spawn('Q',Math.random()<.5?'QuyBan':'NupQuanSat',bx-oy*3.5+ox*.6,by+ox*3.5+oy*.6,faceTo(ox,oy)+R(-.3,.3),{flash:true});PT(h.position.clone().add(UP14))}
/* VNCH tiến công từ phía Nam (và một phần phía Đông), ngoài hào nước */
GRP='vAtk';{let n=0,tries=0;const N=Math.round(54*MUL);const CL=['QuyBan','DiNgamBan_TaiCho','QuyBan','NemLuuDan_TaiCho','DiNgangBan_TaiCho'];
  while(n<N&&tries++<1500){const east=Math.random()<.22;const bx=east?R(312,420):R(-230,230),by=east?R(-200,120):R(-430,-312);if(!freeAt(bx,by))continue;
    const tg=east?[250,by+R(-30,30)]:[bx+R(-30,30),-250];const h=spawn('V',CL[n%CL.length],bx,by,faceTo(tg[0]-bx,tg[1]-by),{flash:true});PT(h.position.clone().add(UP14));n++}}
/* VNCH: các tổ tiến lên theo đợt, chạy từ xa về sát hào rồi quỳ bắn */
GRP='vRun';for(let k=0;k<Math.round(26*MUL);k++){let ax=R(-200,200),ay=R(-640,-520),tx=ax+R(-25,25),ty=R(-335,-305);for(let j=0;j<25&&!freeAt(tx,ty);j++){tx=R(-220,220)}
  const h=spawn('V','ChayLonNhao_TaiCho',ax,ay,0,{extra:['QuyBan'],flash:true});const a=B(ax,ay,0),b=B(tx,ty,0);
  h.userData.run={a,b,dur:a.distanceTo(b)/R(2.6,3.6),hold:R(14,30),ph:R(0,90),rot:Math.atan2(b.x-a.x,b.z-a.z)};h.rotation.y=h.userData.run.rot;runners.push(h);PT(b.clone().setY(groundAt(tx,ty)+1.4))}
/* QĐND tiếp viện: sau khi qua sông, đi khom từ bờ phía thành tới chân thành mặt Tây (gần cổng Tây) rồi núp chờ */
GRP='qSupply';for(let k=0;k<Math.round(24*MUL);k++){const t=R(.40,.62);const p=crossPath(t,-104,-112);let tx=R(-318,-302),ty=R(-60,60);for(let j=0;j<20&&!freeAt(tx,ty);j++){tx=R(-320,-300);ty=R(-70,70)}
  const h=spawn('Q','DiKhom_TaiCho',p.pa[0],p.pa[1],0,{extra:['NupQuanSat'],gun:Math.random()<.6});const a=p.a.clone(),b=B(tx,ty,0);
  h.userData.run={a,b,dur:a.distanceTo(b)/R(1.3,1.8),hold:R(10,25),ph:R(0,200),rot:Math.atan2(b.x-a.x,b.z-a.z),cr:'DiKhom_TaiCho',ch:'NupQuanSat'};h.rotation.y=h.userData.run.rot;runners.push(h)}
/* ===== giai đoạn B ===== */
/* VNCH trườn tới sát hào (chậm) rồi khom che */
GRP='vCrawl';for(let k=0;k<Math.round(18*MUL);k++){let ax=R(-180,180),ay=R(-500,-430),tx=ax+R(-10,10),ty=R(-345,-318);for(let j=0;j<20&&!freeAt(tx,ty);j++)tx=R(-200,200);
  const h=spawn('V','TruonToi_TaiCho',ax,ay,0,{extra:['KhomChe']});const a=B(ax,ay,0),b=B(tx,ty,0);
  h.userData.run={a,b,dur:a.distanceTo(b)/R(.5,.8),hold:R(20,40),ph:R(0,220),rot:Math.atan2(b.x-a.x,b.z-a.z),cr:'TruonToi_TaiCho',ch:'KhomChe'};h.rotation.y=h.userData.run.rot;runners.push(h)}
/* VNCH đã lên được góc Đông Nam mặt thành (những ngày cuối) */
GRP='vBreach';for(let k=0;k<Math.round(16*MUL);k++){const onS=k%3!==2;const bx=onS?R(120,240):R(248.5,251),by=onS?R(-251,-248.5):R(-240,-140);
  const h=spawn('V',['DungBan','QuyBan','DungNgam','KhomChe'][k%4],bx,by,onS?faceTo(R(-.3,.1),1):faceTo(-1,R(-.2,.3)),{flash:true});PT(h.position.clone().add(UP14))}
/* QĐND trú dưới hoả lực trong thành */
const M_CRATE=new THREE.MeshStandardMaterial({color:0x5b4a30,roughness:.9}),M_SLAB=new THREE.MeshStandardMaterial({color:0x8d877c,roughness:.95,flatShading:true});
function backrest(h,kind){const g=new THREE.Group();if(kind%2===0){const m=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.0,.34),M_SLAB);m.position.set(R(-.1,.1),.42,-.5);m.rotation.set(-.2,R(-.15,.15),R(-.08,.08));g.add(m);
    const c=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.5),M_SLAB);c.position.set(.75,.12,-.2);c.rotation.y=.6;g.add(c)}
  else{const a=new THREE.Mesh(new THREE.BoxGeometry(.95,.46,.5),M_CRATE);a.position.set(0,.23,-.52);const b=new THREE.Mesh(new THREE.BoxGeometry(.8,.4,.46),M_CRATE);b.position.set(.06,.66,-.56);b.rotation.y=.12;
    const c=new THREE.Mesh(new THREE.BoxGeometry(.7,.36,.42),M_CRATE);c.position.set(-.85,.18,-.3);c.rotation.y=-.5;g.add(a,b,c)}
  g.traverse(o=>{if(o.isMesh){o.castShadow=!MOBILE;o.receiveShadow=!MOBILE}});h.add(g)}
GRP='qShelter';for(let k=0;k<Math.round(22*MUL);k++){const side=k%3;let bx,by;if(side===0){bx=R(-200,200);by=R(-232,-205)}else if(side===1){bx=R(-232,-205);by=R(-200,200)}else{bx=R(-150,150);by=R(-150,150)}
  if(!freeAt(bx,by))continue;const h=spawn('Q',['KhomChe','QuyNghi','NupQuanSat','KhomChe','NgoiNghi'][k%5],bx,by,faceTo(side===1?-1:0,side===0?-1:R(-1,1))+R(-.6,.6));if(k%5===4)backrest(h,k)}
/* Một đêm trong công sự (cạnh lô cốt mặt Tây, phía trong thành) */
GRP='qRest';const REST_C=[-214,-84];{const L=[['NgoiNghi',-216.2,-85.6,1.2],['NgoiNghi',-213.4,-82.4,-2.2],['QuyNghi',-212.6,-86.4,.4],['NupQuanSat',-221.5,-83.2,faceTo(-1,0)],['NamNapDan',-215.4,-80.6,2.6],['KhomChe',-210.8,-84.2,-1.4]];
  L.forEach(([c,x,y,r],i)=>{const h=spawn('Q',c,x,y,r,{gun:c!=='NgoiNghi'});if(c==='NgoiNghi')backrest(h,i)})}
/* Gia cố công sự trong mưa (mặt Nam, phía trong) */
GRP='qRepair';for(let k=0;k<Math.round(12*MUL);k++){const bx=R(-90,90),by=R(-232,-216);if(!freeAt(bx,by))continue;spawn('Q',['NhatDo','KeoVat','NhatDo','QuyNghi'][k%4],bx,by,faceTo(R(-1,1),-1),{gun:false})}
for(let k=0;k<Math.round(6*MUL);k++){const ax=R(-80,80),ay=R(-170,-150),tx=ax+R(-20,20),ty=R(-228,-220);const h=spawn('Q','DiKhom_TaiCho',ax,ay,0,{extra:['NhatDo'],gun:false});const a=B(ax,ay,0),b=B(tx,ty,0);
  h.userData.run={a,b,dur:a.distanceTo(b)/R(1,1.4),hold:R(8,16),ph:R(0,60),rot:Math.atan2(b.x-a.x,b.z-a.z),cr:'DiKhom_TaiCho',ch:'NhatDo'};h.rotation.y=h.userData.run.rot;runners.push(h)}
/* Bến tiếp viện: kéo thuyền, nhặt và chuyển vật tư */
GRP='qLand';let sL=-96;while(sL>-240&&groundAt(...crossPath(.5,sL,0).pa)<-.5)sL-=2;const LAND=crossPath(.5,sL-4,sL-20);{const [lx,ly]=LAND.pa;
  for(let k=0;k<4;k++)spawn('Q','KeoVat',lx+2.2,ly+24+k*1.1,faceTo(-1,0),{gun:false});
  for(let k=0;k<Math.round(7*MUL);k++)spawn('Q',k%3===2?'ThaXuong':'NhatDo',lx+R(10,22),ly+R(-22,-6),faceTo(R(-1,1),R(-1,1)),{gun:false});
  for(let k=0;k<3;k++)spawn('Q','QuyNghi',lx+R(25,35),ly+R(-30,30),faceTo(1,0),{})}
/* QĐND rút khỏi thành về bờ sông, bơi sang bờ Tây (những ngày cuối) */
GRP='qBack';for(let k=0;k<Math.round(16*MUL);k++){const ax=R(-305,-290),ay=R(-120,120);const p=crossPath(R(.42,.62),-110,-120);const h=spawn('Q','DiKhom_TaiCho',ax,ay,0,{extra:['NupQuanSat']});
  const a=B(ax,ay,0),b=p.a.clone();h.userData.run={a,b,dur:a.distanceTo(b)/R(1.4,1.9),hold:R(10,20),ph:R(0,160),rot:Math.atan2(b.x-a.x,b.z-a.z),cr:'DiKhom_TaiCho',ch:'NupQuanSat'};h.rotation.y=h.userData.run.rot;runners.push(h)}
GRP='qSwimBack';for(let k=0;k<Math.round(16*MUL);k++){const t=.40+.24*k/16+R(0,.01);const p=crossPath(t,R(-104,-100),R(72,80));
  const h=spawn('Q','Boi_TaiCho',0,0,0,{z:-1.85});h.userData.swim={a:p.a.setY(-1.85),b:p.b.setY(-1.85),ph:Math.random(),per:R(95,130)};h.rotation.y=Math.atan2(p.b.x-p.a.x,p.b.z-p.a.z);swimmers.push(h)}
GRP='legacy';

/* ---------------- đổ nát rải (InstancedMesh) ---------------- */
const RUBBLE=[];
{const groups={};rai.items.forEach(it=>{(groups[it[0]]||(groups[it[0]]=[])).push(it)});
 const mtx=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3();
 for(const [k,list] of Object.entries(groups)){const name=rai.names[k];
   if(MOBILE&&/TV_(Gach|CucDat)_/.test(name))continue;
   const node=gLib.scene.getObjectByName(name);if(!node)continue;
   const parts=node.isMesh?[node]:node.children.filter(c=>c.isMesh);
   for(const part of parts){const mn=part.material&&part.material.name;const mat=(mn==='M_LoiGach'&&/Gach/.test(name))?M_BRICKBIT:(BYMAT[mn]||part.material);
     const im=new THREE.InstancedMesh(part.geometry,mat,list.length);
     list.forEach((it,i)=>{v.copy(B(it[1],it[2],it[3]));q.set(it[4],it[6],-it[5],it[7]);sc.setScalar(it[8]);mtx.compose(v,q,sc);im.setMatrixAt(i,mtx)});
     im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere();im.castShadow=!MOBILE&&/TV_(DongGach|MangTuong|Cay)_/.test(name);im.receiveShadow=!MOBILE;scene.add(im);RUBBLE.push(im)}}}

/* ---------------- thuyền vượt sông (chèo vào bờ phía thành) ---------------- */
const boatSrc=gBoat.scene.getObjectByName('Thuyen'),paddleSrc=gBoat.scene.getObjectByName('MaiCheo');
[boatSrc,paddleSrc].forEach(o=>o.traverse(m=>{if(m.isMesh){m.castShadow=!MOBILE;m.receiveShadow=!MOBILE}}));
GRP='boats';const boats=[],paddles=[];const WATER_Y=-1.1;
const BOAT_T=MOBILE?[.58,.66,.74]:[.56,.61,.66,.71,.76,.81];
BOAT_T.forEach((t,i)=>{const g=new THREE.Group();const hull=boatSrc.clone();g.add(hull);
  const crew=[{z:1.45,clip:'QuyBan',gun:true},{z:.35,clip:'ChevThuyen',row:true},{z:-.7,clip:'ChevThuyen',row:true,mirror:true},{z:-1.3,clip:'ChevThuyen',row:true}];
  for(const c of crew){const h=spawn('Q',c.clip,0,0,0,{z:0,parent:g,gun:!c.row,mirror:c.mirror,flash:!c.row});h.position.set(0,.17,c.z);
    if(c.row){const s=h.children[0];let L=null,Rh=null;s.traverse(o=>{if(/LeftHand$/.test(o.name))L=o;if(/RightHand$/.test(o.name))Rh=o});const pd=paddleSrc.clone();pd.scale.y*=1.38;scene.add(pd);paddles.push({pd,L,R:Rh,g})}}
  const p=crossPath(t,78,-100);scene.add(g);g.userData.boat={a:p.a,b:p.b,ph:i*.17+Math.random()*.1,per:R(130,170)};boats.push(g)});
const pa=new THREE.Vector3(),pb=new THREE.Vector3(),pdir=new THREE.Vector3(),DOWN=new THREE.Vector3(0,-1,0),_pr=new THREE.Vector3();const PAD_H=.8123*1.38;
function updBoats(T){const on=ACT.has('boats');for(const g of boats){if(!on){g.visible=false;continue}const u=g.userData.boat;const k=((T/u.per)+u.ph)%1;g.position.lerpVectors(u.a,u.b,k);
    const vx=u.b.x-u.a.x,vz=u.b.z-u.a.z;g.rotation.set(0,0,0);g.rotation.y=Math.atan2(vx,vz);g.rotateZ(Math.sin(T*1.7+u.ph*9)*.035);g.rotateX(Math.sin(T*1.3+u.ph*5)*.02);
    g.position.y=WATER_Y-.22+Math.sin(T*2+u.ph*7)*.04;_sph.center.copy(g.position);g.visible=k<.985&&g.position.distanceToSquared(camera.position)<Q.far**2&&_fr.intersectsSphere(_sph)}
  for(const p of paddles){if(!p.L||!p.R)continue;p.pd.visible=on&&p.g.visible;if(!p.g.visible)continue;p.L.getWorldPosition(pa);p.R.getWorldPosition(pb);
    const top=pa.y>=pb.y?pa:pb,bot=pa.y>=pb.y?pb:pa;_pr.set(1,0,0).applyQuaternion(p.g.quaternion);const side=(bot.x-p.g.position.x)*_pr.x+(bot.z-p.g.position.z)*_pr.z>=0?1:-1;
    pdir.subVectors(bot,top).normalize().addScaledVector(DOWN,.9).addScaledVector(_pr,side*.42).normalize();          // chúc xuống và chếch ra ngoài mạn thuyền
    p.pd.position.copy(top).addScaledVector(pdir,PAD_H-.12);const tipY=p.pd.position.y+pdir.y*PAD_H;const lim=WATER_Y-.32;
    if(tipY>lim)p.pd.position.addScaledVector(pdir,Math.min(.9,(tipY-lim)/Math.max(.2,-pdir.y)));                  // trượt mái chèo xuống cho lưỡi chèo ngập nước
    p.pd.quaternion.setFromUnitVectors(DOWN,pdir)}}

/* ---------------- điểm cháy & cột khói mới ---------------- */
GRP='legacy';const FIRE_PTS=[];
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
const smokePts=new THREE.Points(sGeo,sMat);scene.add(smokePts);
function updSmoke(dt){if(!smokePts.visible)return;let i=0;for(const s of smokeSrc){for(let k=0;k<SMOKE_N;k++,i++){sAge[i]+=dt;if(sAge[i]>sLife[i])sAge[i]-=sLife[i];
  const t=sAge[i]/sLife[i],H=s.h*1.15;const y=t*H;const sw=Math.sin(sSeed[i]*30+t*4)*(1+t*6);
  sPos[i*3]=s.p.x+s.lean.x*y+sw;sPos[i*3+1]=s.p.y+y;sPos[i*3+2]=s.p.z+s.lean.z*y+Math.cos(sSeed[i]*20+t*3)*(1+t*6);
  sSize[i]=6+t*t*60+sSeed[i]*6;sAlpha[i]=Math.min(t*6,1)*(1-t)*(.55+.45*sSeed[i])}}
  sGeo.attributes.position.needsUpdate=sGeo.attributes.size.needsUpdate=sGeo.attributes.alpha.needsUpdate=true}

/* ---------------- âm thanh: tổng hợp bằng WebAudio (không cần file) ---------------- */
let audioOn=false,listener=null,AC=null,live=0,shotBudget=0;const SND={};const AMB={battle:1};
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
  SND.thunder=[0,1].map(v=>mkBuf(6,(d,sr,n)=>{let lp=0,lp2=0;for(let i=0;i<n;i++){const t=i/sr;lp+=(rnd()-lp)*(v?.05:.08);lp2+=(lp-lp2)*.06;
    const env=(t<.03?t/.03:1)*Math.exp(-t*.55)*(.65+.35*Math.sin(t*3.1+v)*Math.sin(t*1.3));d[i]=lp2*9*env+rnd()*Math.exp(-t*9)*.35*(v?.6:1)}}));
  SND.amb=mkBuf(9,(d,sr,n)=>{let lp=0,lp2=0;for(let i=0;i<n;i++){lp+=(rnd()-lp)*.02;lp2+=(lp-lp2)*.02;d[i]=lp2*6}
    for(let k=0;k<90;k++){const s=Math.floor(Math.random()*n),a=.04+Math.random()*.1,L=Math.floor(sr*.12);let q=0;for(let i=0;i<L&&s+i<n;i++){q+=(rnd()-q)*.22;d[s+i]+=q*a*Math.exp(-i/sr*35)}}
    for(let k=0;k<6;k++){const s=Math.floor(Math.random()*(n-sr*2));let q=0,q2=0;for(let i=0;i<sr*2;i++){q+=(rnd()-q)*.05;q2+=(q-q2)*.05;d[s+i]+=q2*1.6*Math.exp(-i/sr*2)}}
    const f=Math.floor(sr*.5);for(let i=0;i<f;i++){const w=i/f;d[i]=d[i]*w+d[n-f+i]*(1-w)}})}
function playAt(buf,pos,{vol=1,ref=30,rate=1,delay=true}={}){if(!audioOn||!buf||live>30)return;const dist=pos.distanceTo(camera.position);if(dist>3500)return;
  const go=()=>{const o=new THREE.Object3D();o.position.copy(pos);scene.add(o);o.updateMatrixWorld();const s=new THREE.PositionalAudio(listener);s.setBuffer(buf);s.setRefDistance(ref);s.setRolloffFactor(1);s.setMaxDistance(6000);s.setVolume(vol);s.setPlaybackRate(rate);o.add(s);s.updateMatrixWorld();live++;
    s.onEnded=function(){this.isPlaying=false;live--;o.remove(s);scene.remove(o);try{s.disconnect()}catch(e){}};s.play()};
  if(delay&&dist>80)setTimeout(go,Math.min(dist/340,4)*1000);else go()}
const audioHooks=[];
function setAudio(on){audioOn=on;const b=$('snd');b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.textContent=on?'🔊 Âm thanh':'🔇 Âm thanh';
  if(on&&!listener){listener=new THREE.AudioListener();camera.add(listener);AC=listener.context;buildSounds();
    const amb=new THREE.Audio(listener);amb.setBuffer(SND.amb);amb.setLoop(true);amb.setVolume(.55*AMB.battle);amb.play();SND.ambNode=amb;
    planes.forEach(p=>{const s=new THREE.PositionalAudio(listener);p.userData.snd=s;s.setBuffer(SND.engine);s.setLoop(true);s.setRefDistance(90);s.setRolloffFactor(1);s.setMaxDistance(6000);s.setVolume(1.6);p.add(s);if(PL.on)s.play()})}
  if(AC)(on?AC.resume():AC.suspend()).catch(()=>{});for(const f of audioHooks)f(on)}
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
  if(FX.reduce)s.material.opacity=.35;boomFx.push({s,d,t:0,k,water});boomLight.position.copy(p).y+=6;boomLight.intensity=(big?7000:4000)*(FX.reduce?.12:1);
  playAt(water?SND.splash:(SND.boom||[])[(Math.random()*3)|0],p,{vol:big?3.2:2.2,ref:big?70:45,rate:R(.8,1.15)});
  if(water)playAt((SND.boom||[])[2],p,{vol:1.4,ref:40,rate:R(.7,.9)})}
function updBoom(dt){for(let i=boomFx.length-1;i>=0;i--){const b=boomFx[i];b.t+=dt;const t=b.t,k=b.k;
  b.s.scale.setScalar((4+t*60)*k*(FX.reduce?.5:1));b.s.material.opacity=Math.max(0,(FX.reduce?.35:1)-t*3);
  if(b.water){b.d.scale.set((5+t*8)*k,(4+Math.min(t,.6)*45)*k,1);b.d.position.y=-1.1+b.d.scale.y*.42;b.d.material.opacity=Math.max(0,.95-t*.45)}
  else{b.d.scale.setScalar((6+t*22)*k);b.d.position.y+=dt*4;b.d.material.opacity=Math.max(0,.9-t*.3)}
  if(t>3){scene.remove(b.s,b.d);b.s.material.dispose();b.d.material.dispose();boomFx.splice(i,1)}}boomLight.intensity*=Math.pow(.02,dt)}
// vị trí nổ theo VÙNG (toạ độ Blender). Trạng thái chiến trường chọn vùng + trọng số qua FX.zones.
const ZONES={
  landing:()=>B(R(-480,-300),R(-300,300),0),                                   // bờ phía thành giữa sông và hào (mặt Tây)
  river:()=>crossPath(R(.2,.85),R(-100,70),0).a,                               // trên sông Thạch Hãn
  riverNear:()=>crossPath(R(.42,.66),R(-95,70),0).a,                           // đoạn sông có thuyền qua (gần camera cảnh 05)
  moatW:()=>B(R(-296,-264),R(-220,220),0), moatS:()=>B(R(-220,220),R(-296,-264),0),
  wallW:()=>B(R(-255,-205),R(-240,240),0), wallS:()=>B(R(-240,240),R(-255,-205),0), wallE:()=>B(R(205,255),R(-240,240),0),
  citadel:()=>B(R(-230,230),R(-230,230),0),
  southFar:()=>B(R(-260,260),R(-650,-340),0),                                  // phía Nam ngoài hào (hướng phản công)
  westBank:()=>B(R(-900,-760),R(-500,500),0)};                                 // bờ Tây xa
const FX={on:true,gap:[.5,1.8],zones:{landing:.32,river:.2,moatW:.07,moatS:.03,wallW:.15,wallS:.08,citadel:.15},fire:1,reduce:false,fires:true,smoke:true,big:.15};
function randomTarget(){const z=FX.zones;let sum=0;for(const k in z)sum+=z[k];let r=Math.random()*sum;for(const k in z){r-=z[k];if(r<=0)return ZONES[k]()}return ZONES.citadel()}

/* ---------------- máy bay A-37 bổ nhào ném bom xuống sông và bãi đổ bộ ---------------- */
const BOMB_GEO=new THREE.CapsuleGeometry(.18,1.1,3,6);const BOMB_MAT=new THREE.MeshStandardMaterial({color:0x2b2d24,roughness:.6,metalness:.4});
const bombs=[];const planeState=planes.map((p,i)=>({cool:R(3,8)+i*5,stick:0,next:0,prev:p.position.clone(),vel:new THREE.Vector3()}));
const PL={on:true,cool:[9,15],h:[160,190],cx:-470,cy:-20,rx:[300,380],ry:[480,560],zone:(bx,by)=>bx<-300&&bx>-760&&Math.abs(by)<450};
function inStrikeZone(p){return PL.zone(p.x,-p.z)}
function updPlanes(T,dt){planes.forEach((p,i)=>{if(p.visible!==PL.on){p.visible=PL.on;const s=p.userData.snd;if(s){try{PL.on?(!s.isPlaying&&s.play()):s.pause()}catch(e){}}}const st=planeState[i];if(!PL.on){st.stick=0;return}const a=T*(i?.16:.2)+i*2.4;const cx=PL.cx,cy=PL.cy,ax=PL.rx[i?1:0],ay=PL.ry[i?1:0],hh=PL.h[i?1:0];
    const bx=cx+Math.cos(a)*ax,by=cy+Math.sin(a)*ay;p.position.copy(B(bx,by,hh+12*Math.sin(2*a)));
    const dx=-Math.sin(a)*ax,dy=Math.cos(a)*ay;p.rotation.set(0,faceTo(dx,dy),0);p.rotateZ(.5);
    st.vel.copy(p.position).sub(st.prev).divideScalar(Math.max(dt,1e-3));st.prev.copy(p.position);
    st.cool-=dt;if(st.cool<=0&&inStrikeZone(p.position)){st.stick=4;st.next=0;st.cool=R(PL.cool[0],PL.cool[1])}
    if(st.stick>0){st.next-=dt;if(st.next<=0){st.next=.32;st.stick--;
      const m=new THREE.Mesh(BOMB_GEO,BOMB_MAT);m.position.copy(p.position).add(new THREE.Vector3(0,-1.2,0));m.userData.v=st.vel.clone().multiplyScalar(.9);m.castShadow=false;scene.add(m);bombs.push(m);
      if(audioOn){const s=new THREE.PositionalAudio(listener);s.setBuffer(SND.whistle);s.setRefDistance(60);s.setVolume(1.3);s.setPlaybackRate(R(.9,1.1));m.add(s);s.play();m.userData.snd=s}}}})
  for(let i=bombs.length-1;i>=0;i--){const m=bombs[i];const v=m.userData.v;v.y-=9.8*dt;m.position.addScaledVector(v,dt);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize().negate());
    const g=Math.max(sampleH(HG.h,m.position.x,m.position.z),-1.1);if(m.position.y<=g+.3){if(m.userData.snd){try{m.userData.snd.stop()}catch(e){}}scene.remove(m);bombs.splice(i,1);spawnBoom(m.position,true)}}}

/* ---------------- xe tăng VNCH bắn ra ngoài thành ---------------- */
const tankFlash=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:0xffd090,fog:false}));tankFlash.visible=false;scene.add(tankFlash);let tankFlashT=0;
const TK={on:true,target:()=>B(R(-470,-310),R(-240,240),0)};
function updTanks(dt){tankFlashT-=dt;tankFlash.visible=tankFlashT>0&&!FX.reduce;tankFlash.scale.setScalar(6+Math.random()*3);
  for(const t of tankObjs){const u=t.path;if(!u||!t.o.visible)continue;const dur=u.a.distanceTo(u.b)/2.3,cyc=dur+26;const k=(T+u.ph)%cyc;const o=t.o;   // 2,3 m/s, tới nơi dừng bắn 26 s rồi lặp lại
    o.position.lerpVectors(u.a,u.b,Math.min(1,k/dur));o.position.y=sampleH(HG.h,o.position.x,o.position.z)+.05+(k<dur?Math.sin(T*9+u.ph)*.03:0);t.pt.copy(o.position).y+=2.2}
  if(!TK.on)return;
  for(const t of tankObjs){t.next-=dt;if(t.next>0)continue;t.next=R(4,9);const muzzle=t.o.localToWorld(new THREE.Vector3(0,1.75,4.8));tankFlash.position.copy(muzzle);tankFlashT=.09;
    playAt((SND.boom||[])[1],muzzle,{vol:2.6,ref:45,rate:1.35});const tg=TK.target();setTimeout(()=>{if(TK.on)spawnBoom(tg)},R(500,900))}}

/* ---------------- đường đạn lửa giữa 2 bên ---------------- */
const TR=MOBILE?60:130;const trGeo=new THREE.BufferGeometry();const trPos=new Float32Array(TR*6);trGeo.setAttribute('position',new THREE.BufferAttribute(trPos,3));
const trMat=new THREE.LineBasicMaterial({color:0xffc070,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,fog:false});
scene.add(new THREE.LineSegments(trGeo,trMat));
let pavnPts=[],arvnPts=[];
function rebuildTracerPts(){pavnPts=[];arvnPts=[];for(const g of ACT){const a=PTS[g];if(!a)continue;(GSIDE[g]==='Q'?pavnPts:arvnPts).push(...a)}for(const r of tracers)r.t=1+Math.random()}
const tracers=[];for(let i=0;i<TR;i++)tracers.push({t:1+Math.random()});
function updTracers(dt){for(let i=0;i<TR;i++){const r=tracers[i];r.t+=dt*(r.sp||1);
  if(r.t>=1){if(!pavnPts.length||!arvnPts.length||Math.random()>FX.fire){r.a=null;r.t=-Math.random()*1.2;trPos.fill(0,i*6,i*6+6);continue}const f=Math.random()<.5;r.a=(f?pavnPts:arvnPts)[(Math.random()*(f?pavnPts.length:arvnPts.length))|0];
    r.b=(f?arvnPts:pavnPts)[(Math.random()*(f?arvnPts.length:pavnPts.length))|0].clone().add(new THREE.Vector3((Math.random()-.5)*14,(Math.random()-.3)*5,(Math.random()-.5)*14));
    r.t=-Math.random()*1.2;r.sp=1.4+Math.random()*1.2}
  const a=r.a,b=r.b;if(!a||r.t<0){trPos.fill(0,i*6,i*6+6);continue}
  const t0=r.t,t1=Math.min(1,r.t+.05);for(let k=0;k<3;k++){trPos[i*6+k]=a.getComponent(k)+(b.getComponent(k)-a.getComponent(k))*t0;trPos[i*6+3+k]=a.getComponent(k)+(b.getComponent(k)-a.getComponent(k))*t1}}
  trGeo.attributes.position.needsUpdate=true}
const tmpV=new THREE.Vector3();
function updFlashes(dt){shotBudget=Math.min(shotBudget+dt*16,16);
  for(const f of flashes){const u=f.userData;if(!ACT.has(u.grp)||FX.fire<=0){f.visible=false;continue}u.t+=dt;let fired=false;if(u.t>u.per){u.t=0;u.per=(.25+Math.random()*1.2)/Math.max(FX.fire,.05);fired=true}f.visible=u.t<.06&&!FX.reduce;
    if(f.visible)f.material.rotation=Math.random()*6;
    if(fired&&audioOn&&shotBudget>=1){f.getWorldPosition(tmpV);const d=tmpV.distanceTo(camera.position);if(d<500&&Math.random()<.7){shotBudget--;
      playAt(Math.random()<.18?SND.burst:(SND.shot||[])[(Math.random()*3)|0],tmpV,{vol:.9,ref:14,rate:R(.85,1.15)})}}}}
/* ================= TRẠNG THÁI CHIẾN TRƯỜNG ================= */
// Mỗi trạng thái bật đúng nhóm nhân vật, vùng nổ, máy bay, xe tăng, ngày/đêm. Không sinh thêm đối tượng khi đổi trạng thái.
const TANK_FRONT=[[-150,-470,0,1],[-40,-505,.1,1],[80,-462,-.1,1],[175,-490,-.2,1]];
const TANK_RUN=[[-150,-585,-140,-352,0],[-45,-585,-38,-356,38],[80,-585,72,-350,74],[175,-585,160,-354,20]];   // [x0,y0,x1,y1,lệch pha] — tiến từ phía Nam về sát hào
const C_DAY={hemi:new THREE.Color(0xffd2a8),hg:new THREE.Color(0x5a4030),sun:new THREE.Color(0xffb070),fog:HAZE.clone(),wem:new THREE.Color(0x061826)};
const C_NIGHT={hemi:new THREE.Color(0x7a8cb4),hg:new THREE.Color(0x1a1612),sun:new THREE.Color(0x8ea4d8),fog:new THREE.Color(0x0b0f17),wem:new THREE.Color(0x01060b)};
let NIGHT=0;
const C_STORM={hemi:new THREE.Color(0xa3acba),sun:new THREE.Color(0xbcc6d4),fog:new THREE.Color(0x50545c)};
let NIGHT_T=0;function setNight(k){NIGHT_T=k}   /* đặt đích; updWeather chuyển dần ~4 giây */
function applyLight(){const n=NIGHT,w=WX.k;const L=(a,b,k)=>a+(b-a)*k;SKY.night.value=n;SKY.storm.value=w;
  hemi.intensity=L(1.7,.95,n)*(1-.3*w);hemi.color.copy(C_DAY.hemi).lerp(C_NIGHT.hemi,n).lerp(C_STORM.hemi,w*(1-n)*.7);hemi.groundColor.copy(C_DAY.hg).lerp(C_NIGHT.hg,n);
  sun.intensity=L(3.4,1.1,n)*(1-.72*w);sun.color.copy(C_DAY.sun).lerp(C_NIGHT.sun,n).lerp(C_STORM.sun,w*(1-n));
  scene.fog.color.copy(C_DAY.fog).lerp(C_NIGHT.fog,n).lerp(C_STORM.fog,w*(1-n)*.85);scene.fog.density=L(.00062,.0008,n)+.00075*w;
  renderer.toneMappingExposure=L(1.18,1.25,n);M_WATER.emissive.copy(C_DAY.wem).lerp(C_NIGHT.wem,n);M_WATER.normalScale.setScalar(.6+1.1*w);M_WATER.roughness=.12+.25*w+.4*n;
  for(const m of WET){m.roughness=m.userData.r0*(1-.4*w);m.color.copy(m.userData.c0).multiplyScalar(1-.24*w)}}

/* ================= THỜI TIẾT: mưa giông, sấm chớp (bật bằng nút, hoặc phân cảnh yêu cầu) ================= */
const WX={user:0,scene:0,k:0,prev:-1,next:5,bolt:null};
const RN=MOBILE?2200:6500;const rGeo=new THREE.BufferGeometry();const rPos=new Float32Array(RN*6);const rS=new Float32Array(RN*3);
for(let i=0;i<RN;i++){rS[i*3]=Math.random()*90-45;rS[i*3+1]=Math.random()*55;rS[i*3+2]=Math.random()*90-45}
rGeo.setAttribute('position',new THREE.BufferAttribute(rPos,3));
const rMat=new THREE.LineBasicMaterial({color:0xb4c2d6,transparent:true,opacity:0,depthWrite:false,fog:false});
const rainLines=new THREE.LineSegments(rGeo,rMat);rainLines.frustumCulled=false;rainLines.visible=false;scene.add(rainLines);
const boltLight=new THREE.DirectionalLight(0xc9d6ff,0);boltLight.position.set(0,1000,200);scene.add(boltLight);
const boltMat=new THREE.LineBasicMaterial({color:0xf2f5ff,transparent:true,opacity:0,fog:false,blending:THREE.AdditiveBlending,depthWrite:false});
const boltGeo=new THREE.BufferGeometry();const boltPos=new Float32Array(48*3);boltGeo.setAttribute('position',new THREE.BufferAttribute(boltPos,3));
const boltLine=new THREE.Line(boltGeo,boltMat);boltLine.frustumCulled=false;boltLine.visible=false;scene.add(boltLine);
function strike(){const c=camera.position;const an=R(0,6.28),dist=R(700,2600);const gx=c.x+Math.cos(an)*dist,gz=c.z+Math.sin(an)*dist;
  let x=gx+R(-80,80),y=900,z=gz+R(-80,80);for(let i=0;i<48;i++){const k=i/47;boltPos[i*3]=x;boltPos[i*3+1]=y;boltPos[i*3+2]=z;y=900*(1-k);x+=R(-28,28)*(1-k*.5)+(gx-x)*.08;z+=R(-28,28)*(1-k*.5)+(gz-z)*.08}
  boltGeo.attributes.position.needsUpdate=true;WX.bolt={t:0};boltLight.position.set(gx,900,gz);
  if(audioOn&&SND.thunder){const d=Math.min(dist/340,7);setTimeout(()=>{if(!audioOn)return;const a=new THREE.Audio(listener);a.setBuffer(SND.thunder[(Math.random()*2)|0]);a.setVolume(Math.max(.35,2.4-dist/1300));a.setPlaybackRate(R(.85,1.1));a.play();a.onEnded=function(){this.isPlaying=false;try{a.disconnect()}catch(e){}}},d*1000)}}
function updWeather(dt){if(NIGHT!==NIGHT_T){const d=NIGHT_T-NIGHT,st=dt/4;NIGHT=Math.abs(d)<=st?NIGHT_T:NIGHT+Math.sign(d)*st;applyLight()}
  const tgt=Math.max(WX.user,WX.scene);WX.k+=(tgt-WX.k)*Math.min(1,dt*.7);if(Math.abs(tgt-WX.k)<.003)WX.k=tgt;
  if(Math.abs(WX.k-WX.prev)>.002){WX.prev=WX.k;applyLight()}
  const k=WX.k;rainLines.visible=k>.02;rMat.opacity=.45*k;
  if(rainLines.visible){const c=camera.position,vy=24*dt;for(let i=0;i<RN;i++){let y=rS[i*3+1]-vy;if(y<0)y+=55;rS[i*3+1]=y;
    const x=c.x+rS[i*3],yy=c.y-18+y,z=c.z+rS[i*3+2];const j=i*6;rPos[j]=x;rPos[j+1]=yy;rPos[j+2]=z;rPos[j+3]=x+.12;rPos[j+4]=yy+1.1;rPos[j+5]=z+.05}
    rGeo.attributes.position.needsUpdate=true}
  if(k>.6){WX.next-=dt;if(WX.next<=0){WX.next=R(5,13);strike()}}
  let f=0;if(WX.bolt){const t=WX.bolt.t+=dt;f=t<.07?1:t<.13?.15:t<.22?.85:t<.5?.85*(1-(t-.22)/.28):0;if(t>.55)WX.bolt=null}
  const red=FX.reduce?.22:1;SKY.flash.value=f*.55*red;boltLight.intensity=f*4.5*red;boltMat.opacity=f;boltLine.visible=f>0}

/* ---- trạng thái "trước tàn phá" (giản lược): tường liền + ẩn đổ nát, hố bom, cây cháy ---- */
const WATERS=[];world.traverse(o=>{if(o.isMesh&&/MatNuoc/.test(o.name+' '+(o.parent?o.parent.name:''))){o.userData.y0=o.position.y;WATERS.push(o)}});
function setFlood(k){for(const m of WATERS)m.position.y=m.userData.y0+k}
const RUINS=[];world.traverse(o=>{if(o.isMesh&&/HoBom|NhaDoNat|CayChay|XacXeTang|MangSap|ThapSat_Gay|DamGo|DayThepGai/.test(o.name+' '+(o.parent?o.parent.name:'')))RUINS.push(o)});
const intactRing=new THREE.Group();{const M=new THREE.MeshStandardMaterial({map:tex(ASSETS.tex+'gach.webp',3,true),normalMap:tex(ASSETS.tex+'gach_n.webp',3),roughness:.9,color:0xb8a090});
  for(const [x,y,w,d] of [[0,-250,509,8.6],[0,250,509,8.6],[-250,0,8.6,491],[250,0,8.6,491]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,7.2,d),M);m.position.copy(B(x,y,2.6));m.castShadow=m.receiveShadow=!MOBILE;intactRing.add(m)}
  intactRing.visible=false;scene.add(intactRing)}
const TW=[{p:[-150,-170]},{p:[60,-120]},{p:[-90,120],keep:true}];let TWN=2;const twExtra=new THREE.Group();
{const S=world.getObjectByName('ThapSat_QuanSat_GD5'),G=world.getObjectByName('ThapSat_Gay_GD5');
  if(S&&G){const put=(src,x,y,rot)=>{const c=src.clone();c.position.copy(B(x,y,0));c.position.y=groundAt(x,y)+.5;c.rotation.y=rot;scene.add(c);return c};
    for(const t of TW){const r=R(0,6.28);t.stand=put(S,t.p[0],t.p[1],r);t.broken=put(G,t.p[0],t.p[1],r);t.broken.visible=false}
    const e=put(S,120,-140,0);scene.remove(e);twExtra.add(e);twExtra.visible=false;scene.add(twExtra)}}
function setTowers(n){TWN=n;for(let i=0;i<TW.length;i++){const t=TW[i];if(!t.stand)continue;const down=!INTACT&&i<n&&!t.keep;t.stand.visible=!down;t.broken.visible=down}twExtra.visible=INTACT}
let INTACT=false;
function setIntact(v){INTACT=!!v;townMode();setTowers(TWN);intactRing.visible=INTACT;for(const o of RUINS)o.visible=!INTACT;for(const im of RUBBLE)im.visible=!INTACT;smokePts.visible=FX.smoke&&!INTACT;for(const f of stateHooks)f(STATE)}

/* ---- lớp hướng tiến công / khu vực kiểm soát (mũi tên nổi trên sa bàn) ---- */
const LAYERS={};let LAYER=null;
function ribbon(pts,col,w){const H=34;const g=new THREE.Group();const mat=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const P=pts.map(([x,y])=>B(x,y,H));const head=w*3.2;const last=P[P.length-1],prev=P[P.length-2];const dir=last.clone().sub(prev).normalize();const end=last.clone().addScaledVector(dir,-head);
  const Q=[...P.slice(0,-1),end];const pos=[];for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1];const d=b.clone().sub(a).normalize();const n=new THREE.Vector3(-d.z,0,d.x).multiplyScalar(w/2);
    pos.push(...a.clone().add(n).toArray(),...a.clone().sub(n).toArray(),...b.clone().add(n).toArray(),...a.clone().sub(n).toArray(),...b.clone().sub(n).toArray(),...b.clone().add(n).toArray())}
  const n=new THREE.Vector3(-dir.z,0,dir.x).multiplyScalar(w*1.6);pos.push(...end.clone().add(n).toArray(),...end.clone().sub(n).toArray(),...last.toArray());
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const m=new THREE.Mesh(geo,mat);m.renderOrder=5;g.add(m);return g}
function ring(r,col){const pts=[[-r,-r],[r,-r],[r,r],[-r,r],[-r,-r]].map(([x,y])=>B(x,y,34));const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:col,dashSize:22,gapSize:14,fog:false,transparent:true,opacity:.9}));l.computeLineDistances();return l}
function arrowLabel(text,col,pts){const cv=document.createElement('canvas');const x=cv.getContext('2d');x.font='600 30px "Be Vietnam Pro",system-ui,sans-serif';const w=Math.ceil(x.measureText(text).width)+36;cv.width=w;cv.height=50;
  x.font='600 30px "Be Vietnam Pro",system-ui,sans-serif';x.fillStyle='rgba(18,13,9,.82)';x.beginPath();x.roundRect(0,0,w,50,25);x.fill();x.strokeStyle='#'+col.toString(16).padStart(6,'0');x.lineWidth=3;x.beginPath();x.roundRect(1.5,1.5,w-3,47,24);x.stroke();
  x.fillStyle='#fff3dc';x.textBaseline='middle';x.fillText(text,18,26);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,sizeAttenuation:false,depthTest:false,depthWrite:false,fog:false,transparent:true}));const hgt=MOBILE?.05:.038;sp.scale.set(hgt*w/50,hgt,1);sp.renderOrder=7;
  const m=pts[Math.floor((pts.length-1)/2)],n=pts[Math.floor((pts.length-1)/2)+1]||m;sp.position.copy(B((m[0]+n[0])/2,(m[1]+n[1])/2,52));return sp}
function mkLayer(name,arrows,rings=[]){const g=new THREE.Group();for(const a of arrows){g.add(ribbon(a[0],a[1],a[2]||16));if(a[3])g.add(arrowLabel(a[3],a[1],a[0]))}for(const r of rings)g.add(ring(r[0],r[1]));g.visible=false;scene.add(g);LAYERS[name]=g}
const C_Q=0xd8574a,C_V=0xe9c45a;
mkLayer('spring',[[[[-120,1700],[-80,1000],[-30,420]],C_Q,22,'QĐND tiến công · từ hướng Bắc'],[[[-1700,260],[-1150,140],[-640,40]],C_Q,22,'QĐND tiến công · từ hướng Tây'],[[[60,-380],[90,-900],[150,-1600]],C_V,18,'VNCH rút quân · về hướng Nam']]);
mkLayer('counter',[[[[-150,-1300],[-130,-800],[-95,-360]],C_V,16,'VNCH phản công · từ hướng Nam'],[[[110,-1300],[95,-800],[60,-360]],C_V],[[[1100,-180],[700,-90],[360,-40]],C_V,16,'VNCH phản công · từ hướng Đông']],[[310,C_Q]]);
mkLayer('final',[[[[-40,-700],[-20,-450],[40,-300]],C_V,16,'VNCH tiến công · từ hướng Nam'],[[[700,-420],[450,-300],[290,-230]],C_V,16,'VNCH tiến công · từ hướng Đông Nam'],[[[-300,40],[-420,30],[-560,10]],C_Q,12,'QĐND rút quân · sang bờ Tây']],[[310,C_Q]]);
function setLayer(n){LAYER=n&&LAYERS[n]?n:null;for(const k in LAYERS)LAYERS[k].visible=k===LAYER}

/* ---- cờ VNCH trên cổng Tây (theo chú thích ảnh tư liệu USMC; ngày 15–16/9 tuỳ nguồn) ---- */
/* ---- cờ trên cổng thành ----
   flagQ: cờ Mặt trận Dân tộc Giải phóng miền Nam (nửa trên đỏ, nửa dưới xanh, sao vàng) trên Cổng Tiền khi QĐND kiểm soát Thành cổ
          (ảnh tư liệu: rạng sáng 2/5/1972 cờ giải phóng tung bay trên cổng Thành cổ; FLAG_Q_KIEU='doSaoVang' để dùng cờ đỏ sao vàng).
   flag : cờ VNCH trên cổng Tây ngày 15–16/9 (chú thích ảnh USMC), hiển thị MỜ. */
const FLAG_Q_KIEU='giaiPhong';
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.382:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
function makeFlag(draw,{opacity=1,blur=0}={}){const g=new THREE.Group();const cv=document.createElement('canvas');cv.width=150;cv.height=100;const x=cv.getContext('2d');
  if(blur)x.filter=`blur(${blur}px)`;draw(x,150,100);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
  const geo=new THREE.PlaneGeometry(2.7,1.8,14,6);geo.translate(1.35,0,0);
  const cloth=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:t,side:THREE.DoubleSide,roughness:.85,transparent:opacity<1,opacity,depthWrite:opacity>=1}));cloth.position.y=5.2;
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,6.2,6),new THREE.MeshStandardMaterial({color:0x3a3530,roughness:.6,transparent:opacity<1,opacity:Math.min(1,opacity*1.6)}));pole.position.y=3.1;
  g.add(pole,cloth);g.userData.cloth=cloth;g.userData.base=geo.attributes.position.array.slice();g.scale.setScalar(1.6);g.visible=false;scene.add(g);return g}
function onTop(g,bx,by){g.position.copy(B(bx,by,0));let top=-1e9;for(let dx=-8;dx<=8;dx+=2)for(let dz=-8;dz<=8;dz+=2)top=Math.max(top,sampleH(HG.h,g.position.x+dx,g.position.z+dz));g.position.y=top+.05}
const flag=makeFlag((x,w,h)=>{x.fillStyle='#f2c418';x.fillRect(0,0,w,h);x.fillStyle='#d0251c';for(const yy of [.36,.457,.553])x.fillRect(0,yy*h,w,h*.064)},{opacity:.38,blur:2.2});
onTop(flag,-252,0);flag.rotation.y=Math.PI/2;
const flagQ=makeFlag(FLAG_Q_KIEU==='doSaoVang'?(x,w,h)=>{x.fillStyle='#da251d';x.fillRect(0,0,w,h);x.fillStyle='#ffde00';star(x,w/2,h/2,h*.32)}
  :(x,w,h)=>{x.fillStyle='#da251d';x.fillRect(0,0,w,h/2);x.fillStyle='#0f6fbf';x.fillRect(0,h/2,w,h/2);x.fillStyle='#ffde00';star(x,w/2,h/2,h*.3)});
onTop(flagQ,0,-250);flagQ.rotation.y=0;
function waveFlag(f,T){if(!f.visible)return;const g=f.userData.cloth.geometry,p=g.attributes.position.array,b=f.userData.base;for(let i=0;i<p.length;i+=3){const u=b[i];p[i+2]=Math.sin(u*2.2-T*6)*.18*u/2.7}g.attributes.position.needsUpdate=true}
function updFlag(T){waveFlag(flag,T);waveFlag(flagQ,T)}

/* ---- đèn dầu trong công sự, vật dụng minh hoạ ---- */
const lamp=new THREE.PointLight(0xffa64a,0,26,1.6);lamp.position.copy(B(REST_C[0],REST_C[1],0));lamp.position.y=groundAt(...REST_C)+.7;scene.add(lamp);
const lampSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,color:0xffb060,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));lampSpr.scale.setScalar(.45);lampSpr.position.copy(lamp.position);lampSpr.visible=false;scene.add(lampSpr);
const props=new THREE.Group();{const M1=new THREE.MeshStandardMaterial({color:0x4a5a3a,roughness:.7}),M2=new THREE.MeshStandardMaterial({color:0x6b4a2c,roughness:.9}),M3=new THREE.MeshStandardMaterial({color:0x3e4a32,roughness:.85});
  const at=(bx,by,dz=0)=>{const v=B(bx,by,0);v.y=groundAt(bx,by)+dz;return v};
  const can=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.24,10),M1);can.position.copy(at(-214.6,-83.4,.12));const box=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.36),M2);box.position.copy(at(-213.2,-85.2,.16));
  const hel=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8,0,Math.PI*2,0,Math.PI/2),M3);hel.position.copy(at(-215.8,-83.0,.0));props.add(can,box,hel);
  // thùng vật tư ở bến
  const [lx,ly]=LAND.pa;for(let k=0;k<9;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(.7,.42,.45),M2);b.position.copy(at(lx+15+(k%3)*.8,ly-14+((k/3)|0)*.6,.21+(k%2?0:.42)));b.rotation.y=R(-.2,.2);props.add(b)}
  props.traverse(o=>{if(o.isMesh){o.castShadow=!MOBILE;o.receiveShadow=!MOBILE}});props.visible=false;scene.add(props)}
const landBoats=new THREE.Group();{const [lx,ly]=LAND.pa;for(let k=0;k<2;k++){const b=boatSrc.clone();b.position.copy(B(lx-2+k*.6,ly+24+k*7,0));b.position.y=Math.max(groundAt(lx,ly+24),WATER_Y)-.15;b.rotation.y=faceTo(1,.1)+Math.PI/2*0;landBoats.add(b)}landBoats.visible=false;scene.add(landBoats)}

/* ---- hoa đăng trôi trên sông (biểu tượng tưởng niệm) ---- */
const LAN_N=MOBILE?40:90;const lanterns=[];{const M=new THREE.SpriteMaterial({map:flashTex,color:0xffc070,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
  for(let i=0;i<LAN_N;i++){const s=new THREE.Sprite(M);s.scale.setScalar(R(1.1,1.8));s.userData={t:R(.3,.75),s:R(-90,60),v:R(.0006,.0012),ph:R(0,6)};s.visible=false;scene.add(s);lanterns.push(s)}}
let LAN_ON=false;function updLanterns(T,dt){if(!LAN_ON)return;for(const s of lanterns){const u=s.userData;u.t-=u.v*dt;if(u.t<.2)u.t=.78;const p=crossPath(u.t,u.s,0).a;s.position.set(p.x,WATER_Y+.25+Math.sin(T*1.3+u.ph)*.05,p.z)}}

const STATES={
  legacy:{grp:['vWall','vBunker','vTank','qSwim','qMoat','qFire','qRun','boats','tanks'],tanks:'legacy',night:0,
    fx:{on:true,gap:[.5,1.8],zones:{landing:.32,river:.2,moatW:.07,moatS:.03,wallW:.15,wallS:.08,citadel:.15},fire:1,fires:true,smoke:true,big:.15},
    pl:{on:true,cx:-470,cy:-20,rx:[300,380],ry:[480,560],zone:(x,y)=>x<-300&&x>-760&&Math.abs(y)<450},tk:()=>B(R(-470,-310),R(-240,240),0)},
  overview:{grp:[],tanks:null,night:0,fx:{on:false,fire:0,fires:false,smoke:false},pl:{on:false}},
  night_river_supply:{grp:['boats','qSwim','qSupply','qWall'],tanks:null,night:1,
    fx:{on:true,gap:[3.5,7],zones:{citadel:.35,wallW:.2,southFar:.25,river:.12,landing:.08},fire:.12,fires:true,smoke:true,big:.25},pl:{on:false}},
  wall_fight:{grp:['qWall','qBunker','vAtk','vRun','tanks'],tanks:'front',night:0,
    fx:{on:true,gap:[.8,2.2],zones:{wallS:.3,citadel:.22,moatS:.1,southFar:.2,wallE:.1,wallW:.05,landing:.03},fire:1,fires:true,smoke:true,big:.2},
    pl:{on:true,cx:-20,cy:-80,rx:[360,420],ry:[420,500],zone:(x,y)=>Math.abs(x)<260&&Math.abs(y)<260},tk:()=>B(R(-210,210),R(-262,-238),0)}};
const CITADEL_ZONE=(x,y)=>Math.abs(x)<260&&Math.abs(y)<260;
Object.assign(STATES,{
  spring:{grp:[],tanks:null,night:0,layer:'spring',fx:{on:false,fire:0,fires:false,smoke:false},pl:{on:false}},
  counter_start:{grp:['qWall','qBunker','vAtk','vRun','vCrawl','tanks'],tanks:'advance',night:0,layer:'counter',
    fx:{on:true,gap:[1,2.4],zones:{wallS:.25,citadel:.25,moatS:.1,southFar:.25,wallE:.1,landing:.05},fire:.8,fires:true,smoke:true,big:.25},
    pl:{on:true,cool:[3.5,6],h:[95,120],cx:-10,cy:-230,rx:[300,360],ry:[430,500],zone:(x,y)=>Math.abs(x)<260&&y>-300&&y<260},tk:()=>B(R(-210,210),R(-262,-238),0)},
  under_fire:{grp:['qShelter','qBunker','qWall','tanks'],tanks:'front',night:0,
    fx:{on:true,gap:[.55,1.3],zones:{citadel:.5,wallS:.2,wallW:.12,wallE:.12,moatS:.06},fire:.2,fires:true,smoke:true,big:.35},
    pl:{on:true,cx:-20,cy:-60,rx:[340,400],ry:[400,470],zone:CITADEL_ZONE},tk:()=>B(R(-200,200),R(-240,-120),0)},
  bunker_night:{grp:['qRest','qWall'],tanks:null,night:1,lamp:true,fx:{on:true,gap:[7,13],zones:{southFar:.5,citadel:.3,wallE:.2},fire:.04,fires:true,smoke:true,big:.4},pl:{on:false}},
  rain_ruins:{grp:['qRepair','qWall','qBunker'],tanks:null,night:.3,weather:1,fx:{on:true,gap:[8,16],zones:{southFar:.6,citadel:.4},fire:.06,fires:false,smoke:true,big:.3},pl:{on:false}},
  final:{grp:['vAtk','vRun','vCrawl','vBreach','qWall','qBack','qSwimBack','tanks'],tanks:'front',night:0,layer:'final',
    fx:{on:true,gap:[.7,1.6],zones:{wallS:.2,wallE:.2,citadel:.3,moatS:.1,wallW:.1,landing:.1},fire:1,fires:true,smoke:true,big:.25},
    pl:{on:true,cx:-20,cy:-80,rx:[360,420],ry:[420,500],zone:CITADEL_ZONE},tk:()=>B(R(-150,200),R(-200,150),0)},
  memorial:{grp:[],tanks:null,night:.55,lanterns:true,fx:{on:false,fire:0,fires:false,smoke:false},pl:{on:false}}});
for(const k of ['spring','counter_start','under_fire'])STATES[k].towers=0;
for(const k of ['night_river_supply','wall_fight','counter_start','under_fire','bunker_night','rain_ruins','final'])STATES[k].flagQ=true;
STATES.wall_fight.layerOpt='counter';STATES.under_fire.layerOpt='counter';STATES.night_river_supply.grp.push('qLand');STATES.night_river_supply.props=true;STATES.bunker_night.props=true;
let STATE='legacy';let T=0;
function townMode(){const ok=INTACT||STATE==='spring'||STATE==='memorial';if(ok!==TOWN.intact){TOWN.intact=ok;TOWN.setMode(ok)}}
function setTanks(mode){tankObjs.forEach((t,i)=>{const o=t.o;if(!mode){o.visible=false;return}o.visible=true;
  let x,y,ox,oy;t.path=null;if(mode==='front'){[x,y,ox,oy]=TANK_FRONT[i%TANK_FRONT.length]}else if(mode==='advance'){const r=TANK_RUN[i%TANK_RUN.length];t.path={a:B(r[0],r[1],0),b:B(r[2],r[3],0),ph:r[4]};x=r[0];y=r[1];ox=r[2]-r[0];oy=r[3]-r[1]}else{[x,y]=t.def.p;[ox,oy]=t.def.o}
  o.position.copy(B(x,y,0));o.position.y=groundAt(x,y)+.05;o.rotation.set(0,faceTo(ox,oy),0);t.pt.copy(o.position).y+=2.2;t.next=R(1,6)})}
function clearTransient(){for(const b of boomFx){scene.remove(b.s,b.d);b.s.material.dispose();b.d.material.dispose()}boomFx.length=0;
  for(const m of bombs){if(m.userData.snd){try{m.userData.snd.stop()}catch(e){}}scene.remove(m)}bombs.length=0;boomLight.intensity=0;for(const f of flares)f.life=0}
function setState(name){const st=STATES[name]||STATES.legacy;STATE=name in STATES?name:'legacy';
  ACT.clear();st.grp.forEach(g=>ACT.add(g));if(!st.tanks)ACT.delete('tanks');
  setTanks(st.tanks);TK.on=!!st.tanks;if(st.tk)TK.target=st.tk;
  Object.assign(FX,{on:false,gap:[1,2],zones:{citadel:1},fire:0,fires:true,smoke:true,big:.15},st.fx);smokePts.visible=FX.smoke;
  Object.assign(PL,{on:false,cool:[9,15],h:[160,190]},st.pl);WX.scene=st.weather||0;LAN_ON=!!st.lanterns;lanterns.forEach(l=>l.visible=LAN_ON);
  lamp.intensity=st.lamp?38:0;lampSpr.visible=!!st.lamp;props.visible=!!st.props;landBoats.visible=ACT.has('qLand');flag.visible=false;flagQ.visible=!!st.flagQ;setFlood(0);setLayer(st.layer||null);if(INTACT)setIntact(false);
  townMode();setTowers(st.towers??2);setNight(st.night);clearTransient();rebuildTracerPts();nextBoom=T+R(FX.gap[0],FX.gap[1]);
  for(const f of stateHooks)f(STATE)}
// ghi đè một phần hiệu ứng (bộ dẫn chuyện điều nhịp trong phân cảnh)
function setEnv(e){if(!e)return;if(e.gap)FX.gap=e.gap;if(e.zones)FX.zones=e.zones;if('fire' in e)FX.fire=e.fire;if('booms' in e)FX.on=e.booms;if('big' in e)FX.big=e.big;
  if('planes' in e)PL.on=e.planes&&!!STATES[STATE].pl.zone;if('tanks' in e)TK.on=e.tanks&&!!STATES[STATE].tanks;if('night' in e)setNight(e.night);
  if('weather' in e)WX.scene=e.weather;if('intact' in e&&!!e.intact!==INTACT)setIntact(e.intact);if('layer' in e)setLayer(e.layer);if('flag' in e)flag.visible=!!e.flag;if('flagQ' in e)flagQ.visible=!!e.flagQ;if('fires' in e)FX.fires=e.fires;if('flood' in e)setFlood(e.flood);if('towersDown' in e&&e.towersDown!==TWN)setTowers(e.towersDown)}
const stateHooks=[];
/* pháo sáng (đêm): rơi chậm, chiếu sáng vùng sông */
const flares=[];const flareLight=new THREE.PointLight(0xfff2d0,0,700,1.3);scene.add(flareLight);
const FLARE_MAT=new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,color:0xfff4dc,fog:false});
function flare(bx,by,h=170){const s=new THREE.Sprite(FLARE_MAT);s.position.copy(B(bx,by,h));s.scale.setScalar(5);scene.add(s);flares.push({s,life:28,t:0})}
function updFlares(dt){let best=null;for(let i=flares.length-1;i>=0;i--){const f=flares[i];f.t+=dt;f.life-=dt;f.s.position.y-=dt*3.2;f.s.position.x+=dt*1.2;
  const k=Math.min(1,f.t/1.5)*Math.min(1,f.life/4);f.s.material.opacity=1;f.s.scale.setScalar((MOBILE?3.2:4.6)*(1+Math.random()*.25)*Math.max(k,.01));f.k=k;
  if(f.life<=0||f.s.position.y<2){scene.remove(f.s);flares.splice(i,1);continue}if(!best||f.k>best.k)best=f}
  if(best){flareLight.position.copy(best.s.position);flareLight.intensity=best.k*(FX.reduce?5000:(MOBILE?7000:16000))*(.9+Math.random()*.1)}else flareLight.intensity=0}
let nextBoom=1;

/* ---------------- chú thích & tư liệu ---------------- */
// st: các trạng thái chiến trường hiển thị nhãn (bỏ trống = mọi trạng thái)
const INFO={
 gate:{t:'Cổng Tiền (cổng Nam)',p:B(0,-250,10),h:`<p>Thành cổ Quảng Trị được xây đầu thế kỷ XIX thời Nguyễn, ban đầu bằng đất, sau xây lại bằng gạch. Thành có 4 cổng ở giữa 4 mặt. Ảnh tư liệu năm 1972 cho thấy các vòm cổng bị bắn thủng, tường đổ nát.</p>`},
 wall:{t:'Tường thành kiểu Vauban',p:B(-250,180,8),h:`<p>Mặt bằng thành hình vuông, 4 góc có pháo đài nhô ra theo kiểu Vauban, bao quanh là hào nước. Trong 81 ngày đêm (28/6–16/9/1972), tường thành và các công trình bên trong bị bom đạn phá huỷ gần như hoàn toàn.</p>`},
 qdef:{t:'Tuyến phòng thủ QĐND',p:B(0,-236,15),st:['wall_fight'],h:`<p>Từ 28/6/1972, lực lượng Quân đội Nhân dân Việt Nam tổ chức phòng thủ thị xã và Thành cổ trước cuộc phản công của Quân lực Việt Nam Cộng hoà. Trên sa bàn, vị trí từng người lính trên mặt thành và trong công sự là <b>bố trí minh hoạ</b>, không theo sơ đồ đơn vị cụ thể.</p>`},
 vatk:{t:'Hướng phản công VNCH',p:B(0,-420,10),st:['wall_fight'],h:`<p>Cuộc hành quân "Lam Sơn 72" của Quân lực Việt Nam Cộng hoà mở màn ngày 28/6/1972, có không quân và hải quân Mỹ yểm trợ hoả lực. Giai đoạn cuối, Sư đoàn Thuỷ quân Lục chiến VNCH đảm nhận mũi tiến công vào Thành cổ. Trên sa bàn, đội hình phía Nam và phía Đông là <b>minh hoạ hướng tiến công</b>; quân phục dùng tạm mẫu VNCH chung.</p>`},
 bunker:{t:'Lô cốt, công sự',p:B(-229,-85,6),h:`<p>Lô cốt bê tông có lỗ châu mai và bao cát dọc chân thành phía trong. Vị trí và số lượng trên sa bàn là minh hoạ.</p>`},
 river:{t:'Sông Thạch Hãn',p:B(-610,-200,6),h:`<p>Sông chảy qua thị xã Quảng Trị, phía Tây Thành cổ. Trong 81 ngày đêm, đây là tuyến vượt sông đưa quân và vật tư vào thị xã, chủ yếu vào ban đêm, bằng thuyền và bơi, dưới hoả lực pháo và không quân; nhiều người đã hy sinh trên sông. Ngày nay là nơi thả hoa đăng tưởng niệm.</p><p>Lòng sông dựng theo dữ liệu OpenStreetMap.</p>`},
 attack:{t:'Mũi vượt sông (giả định)',p:B(-330,-40,7),st:['legacy'],h:`<p><b>Phân cảnh giả định</b> giữ lại từ bản sa bàn trước: QĐND vượt sông, đổ bộ và áp sát mặt Tây. Đây không phải diễn biến của 81 ngày đêm (khi đó QĐND giữ thành và vượt sông để tiếp viện).</p>`},
 arvn:{t:'VNCH trên mặt thành (giả định)',p:B(-245,10,14),st:['legacy'],h:`<p><b>Phân cảnh giả định</b> từ bản sa bàn trước. Trong 81 ngày đêm, Thành cổ do QĐND giữ; quân VNCH ở phía tiến công.</p>`},
 towers:{t:'Tháp sắt quan sát',p:B(140,120,24),h:`<p>Tháp giàn thép dùng để quan sát, tham khảo theo sa bàn trưng bày. Một tháp còn đứng, một tháp bị gãy gập.</p>`},
 tower:{t:'Tháp nước',p:B(40,60,24),h:`<p>Tháp nước bằng thép bên trong thành xuất hiện trong nhiều ảnh tư liệu năm 1972, là một trong số ít công trình còn đứng giữa đống đổ nát.</p>`},
 vatdung:{t:'Vật dụng trong công sự (minh hoạ)',p:B(-214,-84,3),st:['bunker_night'],h:`<p>Bi đông, mũ cối, hòm đạn bên đèn dầu: các vật dụng quen thuộc của người lính, đặt trên sa bàn để <b>minh hoạ</b>. Hiện vật thật được trưng bày tại các bảo tàng và khu di tích ở Quảng Trị.</p>`},
 benland:{t:'Bến tiếp viện (minh hoạ)',p:B(-520,0,7),st:['night_river_supply'],h:`<p>Người lên bờ kéo thuyền, nhặt và chuyển các thùng vật tư vào trong. Vị trí bến, số thuyền, số thùng là <b>minh hoạ</b>.</p>`},
 dtn:{t:'Đài tưởng niệm (giữa Thành cổ)',p:B(0,0,16),st:['memorial'],h:`<p>Ngày nay, một đài tưởng niệm lớn được xây ở chính giữa Thành cổ. Thành cổ thuộc Di tích quốc gia đặc biệt "Thành cổ Quảng Trị và những địa điểm lưu niệm sự kiện 81 ngày đêm năm 1972" (xếp hạng ngày 9/12/2013). Vị trí theo OpenStreetMap; sa bàn không dựng hình dáng công trình hiện nay.</p>`},
 benhoa:{t:'Thả hoa đăng trên sông Thạch Hãn',p:B(-600,10,8),st:['memorial'],h:`<p>Tại bến thả hoa bên sông Thạch Hãn, người dân, cựu chiến binh và du khách thả hoa đăng tri ân, tưởng niệm các liệt sĩ. Hoa đăng trên sa bàn là <b>hình ảnh biểu tượng</b>.</p>`},
 moat:{t:'Hào nước',p:B(-280,150,4),h:`<p>Hào nước bao quanh tường thành; nhiều hố bom quanh thành cũng đọng nước như mô tả trong hồi ký và ảnh tư liệu.</p>`}};
const SRC='<p class="src">Nội dung tóm tắt phục vụ học tập, cần đối chiếu tư liệu chính thức. Cảnh vật, nhân vật là tái dựng mô phỏng.</p>';
const lbls=[];for(const [k,v] of Object.entries(INFO)){const d=document.createElement('div');d.className='lbl';d.innerHTML=`<b>${v.t}</b><i></i>`;d.onclick=()=>showInfo(k);$('labels').append(d);lbls.push({d,p:v.p,st:v.st})}
function showInfo(k){$('infobody').innerHTML=`<h2>${INFO[k].t}</h2>${INFO[k].h}${SRC}`;$('info').hidden=false;for(const f of infoHooks)f(k)}
const infoHooks=[],tickHooks=[];
$('infox').onclick=()=>$('info').hidden=true;
let showLbl=true;$('lbtn').onclick=function(){showLbl=!showLbl;this.classList.toggle('on',showLbl);this.setAttribute('aria-pressed',showLbl)};
const pv=new THREE.Vector3();
function updLabels(){const w=innerWidth,h=innerHeight;for(const l of lbls){pv.copy(l.p).project(camera);const vis=showLbl&&(!l.st||l.st.includes(STATE))&&pv.z<1&&Math.abs(pv.x)<1.1&&Math.abs(pv.y)<1.1&&camera.position.distanceTo(l.p)<2200;
  l.d.classList.toggle('hidden',!vis);if(vis){l.d.style.left=((pv.x+1)/2*w)+'px';l.d.style.top=((1-pv.y)/2*h)+'px'}}}

/* ---------------- góc nhìn ---------------- */
const VIEWS={all:[B(-1250,-650,380),B(-250,-30,10)],gate:[B(10,-345,7),B(0,-250,5)],inside:[B(-80,-120,6),B(60,80,6)],
  trench:[B(-470,-95,9),B(-300,-40,4)],towers:[B(170,90,14),B(140,120,9)],boat:[B(0,0,0),B(0,0,0)],river:[B(-262,-470,5),B(-304,-499,-1.5)],arvn:[B(-236,-35,14.5),B(-300,10,8)],tank:[B(-183,-128,7),B(-203,-150,2)],
  front:[B(-40,-247,12.8),B(-15,-345,1)],vatk:[B(40,-470,5),B(0,-262,8)],bastion:[B(-262,-262,24),B(80,-300,2)],landing:[B(-470,-140,7),B(-300,0,3)]};
let tween=null;const viewHooks=[];
function go(v){setWalk(false);let [p,t]=VIEWS[v];
  if(v==='river'){const sw=scene.children.find(h=>h.userData.swim);if(sw){const d=sw.userData.swim.b.clone().sub(sw.userData.swim.a).normalize();const sd=new THREE.Vector3(-d.z,0,d.x);p=sw.position.clone().addScaledVector(d,-4.5).addScaledVector(sd,2.2).add(new THREE.Vector3(0,1.5,0));t=sw.position.clone().addScaledVector(d,30).add(new THREE.Vector3(0,.4,0))}}
  if(v==='boat'){const g=boats[1];const d=g.userData.boat.b.clone().sub(g.userData.boat.a).normalize();const sd=new THREE.Vector3(-d.z,0,d.x);
    p=g.position.clone().addScaledVector(d,-5.5).addScaledVector(sd,3.6).setY(WATER_Y+2.3);t=g.position.clone().addScaledVector(d,3).setY(WATER_Y+.5)}
  tween={p0:camera.position.clone(),t0:controls.target.clone(),p,t,s:performance.now()}}
camera.position.copy(VIEWS.all[0]);controls.target.copy(VIEWS.all[1]);
$('views').onclick=e=>{for(const f of viewHooks)f();const b=e.target.closest('button[data-v]');if(!b)return;document.querySelectorAll('#views button').forEach(x=>x.classList.toggle('on',x===b));go(b.dataset.v)};

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
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<1?Math.min(78,50/Math.max(w/h,.55)):50;   /* màn hình dọc: mở rộng góc nhìn */
  camera.updateProjectionMatrix();sMat.uniforms.scale.value=h/2}
addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
/* ---------------- giao diện cho bộ dẫn chuyện (story-director.js) ---------------- */
const _fwd=new THREE.Vector3();
function npcHead(h){if(!h.userData.head){h.traverse(o=>{if(!h.userData.head&&/Head$/.test(o.name))h.userData.head=o})}h.updateMatrixWorld(true);const v=new THREE.Vector3();(h.userData.head||h).getWorldPosition(v);return v}   /* cập nhật ma trận: nhân vật bị cắt khỏi khung hình thì xương không tự cập nhật */
// anchor: vị trí + hướng tiến của một đối tượng đang chuyển động (thuyền, người bơi, nhân vật theo nhóm)
function anchor(kind,i=0){
  if(kind==='tank'){const t=tankObjs[i%tankObjs.length];if(!t)return null;const r=t.o.rotation.y;return {pos:t.o.position.clone(),dir:new THREE.Vector3(Math.sin(r),0,Math.cos(r)),obj:t.o}}
  if(kind==='boat'){const g=boats[i%boats.length];const u=g.userData.boat;return {pos:g.position.clone(),dir:u.b.clone().sub(u.a).setY(0).normalize(),obj:g}}
  const list=kind==='swimmer'?swimmers.filter(h=>h.userData.grp==='qSwim'):NPC.filter(h=>h.userData.grp===kind);if(!list.length)return null;
  const h=list[i%list.length];let dir;if(h.userData.swim){const u=h.userData.swim;dir=u.b.clone().sub(u.a).setY(0).normalize()}else{const r=h.rotation.y;dir=new THREE.Vector3(Math.sin(r),0,Math.cos(r))}
  return {pos:h.position.clone(),head:npcHead(h),dir,obj:h,count:list.length}}
const API={RIVER:[RIVER_A,RIVER_B],AMB,THREE,scene,camera,controls,renderer,B,R,MOBILE,VIEWS,INFO,STATES,WATER_Y,
  setState,setEnv,getState:()=>STATE,flare,boomAt:(bx,by,big)=>spawnBoom(B(bx,by,0),big),anchor,go,showInfo,groundAt,
  snapNight:()=>{NIGHT=NIGHT_T;applyLight()},towers:()=>TW.map(t=>t.broken&&t.broken.visible),setReduce:v=>{FX.reduce=!!v},setWeather:v=>{WX.user=v?1:0},weather:()=>({user:WX.user,scene:WX.scene,k:WX.k}),setIntact,intact:()=>INTACT,setLayer,layer:()=>LAYER,layerOf:st=>(STATES[st]||{}).layer||(STATES[st]||{}).layerOpt||null,flag:v=>{flag.visible=!!v},setLabels:v=>{showLbl=!!v;$('lbtn').classList.toggle('on',showLbl)},
  audio:()=>({on:audioOn,AC,listener,SND,mkBuf}),setAudio,onAudio:f=>audioHooks.push(f),
  stopTween:()=>{tween=null},setWalk,walking:()=>walking,tickHooks,stateHooks,infoHooks,viewHooks,counts:()=>({town:[TOWN.houses,TOWN.trees,TOWN.trench,TOWN.sand],npc:NPC.length,mixers:mixers.length,boom:boomFx.length,bombs:bombs.length,flares:flares.length,children:scene.children.length,calls:renderer.info.render.calls,geo:renderer.info.memory.geometries,tex:renderer.info.memory.textures})};
window.__QT=API;   // để kiểm thử
setState('wall_fight');
$('loadtxt').textContent='Đang chuẩn bị đồ hoạ…';
try{if(renderer.compileAsync)await renderer.compileAsync(scene,camera)}catch(e){}
if(/\/khong-gian\//.test(location.pathname))$('back').hidden=false;
$('load').classList.add('done');
try{const m=await import('./story-director.js');m.start(API)}catch(e){console.error('Không tải được bộ dẫn chuyện',e)}
renderer.setAnimationLoop(()=>{
  const rawDt=clock.getDelta();const dt=Math.min(rawDt,.1);
  if(!document.hidden){Q.acc+=rawDt;Q.n++;if(Q.acc>2.5){const fps=Q.n/Q.acc;Q.acc=0;Q.n=0;if(fps<28&&Q.lv>0)setQuality(Q.lv-1)}}
  if(!paused){T+=dt;
    const camP=camera.position;
    WN.offset.set(T*.004,T*.0025);for(const h of swimmers){if(!ACT.has(h.userData.grp))continue;const s=h.userData.swim;const t=((T/s.per)+s.ph)%1;h.position.lerpVectors(s.a,s.b,t)}
    updRunners(T);updBoats(T);
    const FAR2=Q.far**2;_pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_fr.setFromProjectionMatrix(_pm);
    for(const m of mixers){const r=m.getRoot().parent;r.getWorldPosition(tmpV);const d2=tmpV.distanceToSquared(camP);
      if(r.parent===scene){if(!ACT.has(r.userData.grp)){r.visible=false;continue}_sph.center.copy(tmpV);_sph.center.y+=1;r.visible=d2<FAR2&&_fr.intersectsSphere(_sph);if(!r.visible)continue}else if(!r.parent.visible)continue;
      const sh=!MOBILE&&d2<170*170;if(r.userData.sh!==sh&&r.userData.meshes){r.userData.sh=sh;for(const o of r.userData.meshes)o.castShadow=sh}
      m._acc=(m._acc||0)+dt;if(d2<150*150||(d2<500*500?m._acc>.1:m._acc>.25)){m.update(m._acc);m._acc=0}}
    updFlashes(dt);
    updSmoke(dt);updTracers(dt);updBoom(dt);updPlanes(T,dt);updTanks(dt);
    if(FX.on&&!INTACT&&T>nextBoom){spawnBoom(randomTarget(),Math.random()<FX.big);nextBoom=T+R(FX.gap[0],FX.gap[1])}
    updFlares(dt);updWeather(dt);updFlag(T);updLanterns(T,dt);for(const f of tickHooks)f(dt,T);
    for(const g of fires){g.visible=FX.fires&&!INTACT;if(!g.visible)continue;for(const s of g.children)if(s.isSprite){const k=Math.sin(T*9+s.userData.ph)*.5+.5;s.scale.set(3+k*2,4+k*3,1)}if(g.userData.L)g.userData.L.intensity=45+Math.sin(T*13+g.position.x)*15}
    turrets.forEach(t=>t.o.rotation.y=t.base+Math.sin(T*.4+t.ph)*.15);
  }
  if(tween){const k=Math.min((performance.now()-tween.s)/1800,1),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;camera.position.lerpVectors(tween.p0,tween.p,e);controls.target.lerpVectors(tween.t0,tween.t,e);if(k>=1)tween=null}
  if(walking)updWalk(dt);else controls.update();
  // bóng đổ theo vùng camera
  const fc=walking?camera.position:controls.target;sun.target.position.copy(fc);sun.position.copy(fc).add(B(-1000,-250,160).normalize().multiplyScalar(800));
  updLabels();renderer.render(scene,camera);
});
