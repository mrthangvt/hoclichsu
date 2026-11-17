/* Điện Biên Phủ 1954 — sa bàn three.js 0.160. Đọc docs/TOM_TAT.md trước khi sửa.
   Dữ liệu xuất từ Blender (DienBienPhu_1954_GD2.blend): models/static.glb, models/mau.glb, data/scene.json.
   Toạ độ Blender (X Đông, Y Bắc, Z lên, mét) → three: B(x,y,z) = (x, z, -y). */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';

const $=id=>document.getElementById(id);
const MOBILE=matchMedia('(pointer:coarse)').matches;
const B=(x,y,z)=>new THREE.Vector3(x,z,-y);
const Q_BL=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2); // trục Blender → three
if(window.parent===window&&location.pathname.includes('/khong-gian/'))$('back').hidden=false;

/* ---------------- renderer / cảnh ---------------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!MOBILE,powerPreference:'high-performance',logarithmicDepthBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.25:1.6));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const FOG=new THREE.Color(0xb9c4cc);scene.fog=new THREE.FogExp2(FOG,0.000085);
const camera=new THREE.PerspectiveCamera(42,1,1,60000);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI*0.48;controls.minDistance=8;controls.maxDistance=16000;controls.screenSpacePanning=false;

// bầu trời núi rừng Tây Bắc (ngày ↔ chiều ↔ đêm)
const sky=new THREE.Mesh(new THREE.SphereGeometry(40000,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{chieu:{value:0},dem:{value:0},flash:{value:0}},
  vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}`,
  fragmentShader:`varying vec3 vd;uniform float chieu;uniform float dem;uniform float flash;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
  void main(){float y=vd.y;
   vec3 c=mix(vec3(.80,.84,.86),vec3(.42,.58,.76),smoothstep(0.,.5,y));
   vec3 cc=mix(vec3(.98,.62,.34),vec3(.46,.42,.55),smoothstep(0.,.45,y));c=mix(c,cc,chieu);
   float cl=fbm(vd.xz/(y+.2)*1.6);c=mix(c,mix(c,vec3(1.),.55),smoothstep(.5,.85,cl)*smoothstep(0.,.12,y));
   vec3 nc=mix(vec3(.06,.05,.06),vec3(.01,.015,.03),smoothstep(0.,.4,y));nc+=step(.9988,h(floor(vd.xz/(y+.3)*300.)))*smoothstep(.1,.4,y)*.5;
   c=mix(c,nc,dem);c+=flash*vec3(1.,.6,.25)*(.3+.7*smoothstep(.3,-.05,y));
   if(y<0.)c=mix(c,c*.6,clamp(-y*6.,0.,1.));gl_FragColor=vec4(c,1.);}`}));
const SKY=sky.material.uniforms;sky.renderOrder=-1;scene.add(sky);
const hemi=new THREE.HemisphereLight(0xdfe8ff,0x4a4030,1.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1dc,2.6);sun.position.copy(B(-3000,-4500,6000));scene.add(sun);
const NGAY={hemi:1.5,sun:2.6,sunC:new THREE.Color(0xfff1dc),fog:FOG.clone()};

/* ---------------- tải tài nguyên ---------------- */
// Bản artifact Claude ghi đè đường dẫn bằng window.ASSETS (file .glb.txt base64) vì claude.ai không phục vụ .glb.
const ASSETS=Object.assign({static:'models/static.glb',mau:'models/mau.glb',scene:'data/scene.json',kichban:'data/kichban.json',cay:'data/cay.bin',caymeta:'data/cay.json',matdat:MOBILE?'tex/matdat_2k.jpg':'tex/matdat_4k.jpg',draco:'vendor/three/addons/libs/draco/',dracoType:'wasm'},window.ASSETS||{});
const draco=new DRACOLoader();draco.setDecoderPath(ASSETS.draco);draco.setDecoderConfig({type:ASSETS.dracoType});
const loader=new GLTFLoader();loader.setDRACOLoader(draco);
const prog={static:0,mau:0,matdat:0,cay:0};
function setProg(k,v){prog[k]=v;$('fill').style.width=((prog.static*.45+prog.mau*.2+prog.matdat*.2+prog.cay*.15)*100).toFixed(0)+'%'}
function fetchBuf(url,key){return new Promise((res,rej)=>{const x=new XMLHttpRequest();const b64=url.endsWith('.txt');x.open('GET',url);x.responseType=b64?'text':'arraybuffer';
  x.onprogress=e=>{if(e.total)setProg(key,e.loaded/e.total)};x.onerror=()=>rej(new Error('Không tải được '+url));
  x.onload=()=>{if(x.status>=400)return rej(new Error('Không tải được '+url));setProg(key,1);if(!b64)return res(x.response);
    const bin=atob(x.responseText.trim());const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);res(u.buffer)};x.send()})}
const parse=buf=>new Promise((res,rej)=>loader.parse(buf,'',res,rej));
$('loadtxt').textContent='Đang tải địa hình, cứ điểm, bản làng…';
const imgTex=buf=>new Promise((res,rej)=>{const url=URL.createObjectURL(new Blob([buf],{type:'image/jpeg'}));new THREE.TextureLoader().load(url,t=>{URL.revokeObjectURL(url);res(t)},undefined,rej)});
const [gS,gM,SC,KB,TEX,CAY,CAYM]=await Promise.all([fetchBuf(ASSETS.static,'static').then(parse),fetchBuf(ASSETS.mau,'mau').then(parse),
  fetch(ASSETS.scene).then(r=>r.json()),fetch(ASSETS.kichban).then(r=>r.json()),fetchBuf(ASSETS.matdat,'matdat').then(imgTex),
  fetchBuf(ASSETS.cay,'cay').then(b=>new Int16Array(b)),fetch(ASSETS.caymeta).then(r=>r.json())]).catch(e=>{$('loadtxt').textContent=e.message;throw e});
$('loadtxt').textContent='Đang dựng rừng cây…';

/* ---------------- cảnh tĩnh ---------------- */
const world=gS.scene;scene.add(world);
let haoVN=null,coPhap=null,ground=null;
world.traverse(o=>{
  if(o.name==='Hao_QDND_BaoVay')haoVN=o;if(o.name==='Co_Phap_PCGONO')coPhap=o;
  if(!o.isMesh)return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const m of mats){if(!m)continue;
    if(m.name==='M_NuocSong'){m.color.set(0x34402c);m.roughness=.18;m.metalness=.05;m.envMapIntensity=.6}
    else{m.roughness=Math.max(m.roughness??.9,.75);m.metalness=Math.min(m.metalness??0,.2)}}
  if(o.name.startsWith('DiaHinh'))ground=o;
});
{const r=world.getObjectByName('Rung_Cay');if(r)r.parent.remove(r)}   // bản sao địa hình mang Geometry Nodes, không cần trên web
TEX.flipY=false;TEX.colorSpace=THREE.SRGBColorSpace;TEX.anisotropy=renderer.capabilities.getMaxAnisotropy();
if(ground)ground.material=new THREE.MeshLambertMaterial({map:TEX});
// Rừng: data/cay.bin (xuất từ Geometry Nodes của Blender) → mỗi loại cây một InstancedMesh đơn giản, lấy mẫu thưa cho nhẹ máy.
(function rung(){
  const step=MOBILE?6:2,N=CAY.length/5,types=CAYM.loai,dims=CAYM.kich_thuoc;
  const cols=[0x2f4a1f,0x3a5524,0x284219,0x46602a,0x324d20,0x3d5a26,0x2b461c];
  const per=types.map(()=>[]);for(let i=0;i<N;i+=step){const t=Math.floor(CAY[i*5+4]/100);if(per[t])per[t].push(i)}
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const bark=new THREE.MeshLambertMaterial({color:0x3a2a1c});
  types.forEach((name,t)=>{const d=dims[name]||[7,7,12];const H=d[2],W=(d[0]+d[1])/2;
    const crown=new THREE.IcosahedronGeometry(.5,0);crown.scale(W*.85,H*.62,W*.85);crown.translate(0,H*.6,0);
    const trunk=new THREE.CylinderGeometry(H*.012,H*.02,H*.45,5,1,true);trunk.translate(0,H*.225,0);
    const mC=new THREE.InstancedMesh(crown,new THREE.MeshLambertMaterial({color:cols[t%cols.length],flatShading:true}),per[t].length);
    const mT=new THREE.InstancedMesh(trunk,bark,per[t].length);
    per[t].forEach((i,k)=>{const o=i*5;p.copy(B(CAY[o]/4,CAY[o+1]/4,CAY[o+2]/10));q.setFromAxisAngle(up,CAY[o+3]/1000);const s=(CAY[o+4]%100)/30;sc.set(s,s,s);
      m4.compose(p,q,sc);mC.setMatrixAt(k,m4);mT.setMatrixAt(k,m4)});
    mC.name=mT.name='Rung_'+name;scene.add(mC,mT)})})();

/* ---------------- mô hình mẫu: xe thồ, dân công, pháo, bộ đội ---------------- */
const MAU={};gM.scene.traverse(o=>{if(o.isMesh||o.isGroup||o.isObject3D){if(o.parent===gM.scene)MAU[o.name]=o}});
function mau(name){const o=MAU[name];if(!o)return new THREE.Group();const c=o.clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);return c}
function xeTho(){const g=new THREE.Group();const b=mau('XeDapTho_Tripo');b.position.set(1.25,0,-.35);g.add(b);g.add(mau('DanCong_DayXe_A'));return g}

/* đường đi (polyline Blender) → hàm vị trí theo quãng đường */
function path(pts){const P=pts.map(p=>B(p[0],p[1],p[2]-.8));const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+P[i].distanceTo(P[i-1]));
  return{len:L[L.length-1],at(s,out,dir){s=Math.max(0,Math.min(this.len,s));let i=1;while(i<L.length-1&&L[i]<s)i++;const t=(s-L[i-1])/Math.max(1e-6,L[i]-L[i-1]);
    out.lerpVectors(P[i-1],P[i],t);if(dir)dir.subVectors(P[i],P[i-1]).normalize();return out}}}
const ROUTES={};for(const k in SC.duong)ROUTES[k]=path(SC.duong[k]);
const movers=[];const tmpV=new THREE.Vector3(),tmpD=new THREE.Vector3();
function convoy(route,n,gap,speed,make,start=0,back=false){const r=ROUTES[route];if(!r)return;
  for(let i=0;i<n;i++){const o=make();scene.add(o);movers.push({o,r,s:start+i*gap,speed,back})}}
// đoàn xe thồ tiếp tế (chạy từ núi phía Đông vào thung lũng)
convoy('Duong_XeTho_TiepTe',MOBILE?10:22,9,1.3,xeTho,0);
convoy('Duong_XeTho_Bac',MOBILE?4:8,9,1.3,xeTho,0);
// pháo kéo bằng sức người (cảnh 07: kéo pháo ra khỏi trận địa) — đi ngược đường từ trận địa về sau
function toKeoPhao(gun){return()=>{const g=new THREE.Group();const p=mau(gun);p.rotation.y=Math.PI;g.add(p);
  for(let i=0;i<6;i++)for(const s of[-1,1]){const m=mau('BoDoi_1954');m.position.set(5+i*2,0,s*1.1);m.rotation.y=-Math.PI/2;g.add(m)}return g}}
const kpA=ROUTES['Duong_KeoPhao_DongBac'],kpB=ROUTES['Duong_KeoPhao_Dong'];
if(kpA)convoy('Duong_KeoPhao_DongBac',1,0,.35,toKeoPhao('Phao_M101_105'),kpA.len*.62,true);
if(kpB)convoy('Duong_KeoPhao_Dong',1,0,.35,toKeoPhao('SonPhao_75'),kpB.len*.55,true);
let moving=true;
function updMovers(dt){for(const m of movers){if(moving)m.s+=(m.back?-1:1)*m.speed*dt;
  if(m.s>m.r.len)m.s-=m.r.len;if(m.s<0)m.s+=m.r.len;
  m.r.at(m.s,m.o.position,tmpD);if(m.back)tmpD.negate();m.o.rotation.y=Math.atan2(-tmpD.z,tmpD.x)}}

/* máy bay bay qua (cảnh 06, 08) */
const b26=mau('MayBay_B26_Marauder');const c47=mau('MayBay_C47_Dakota');scene.add(b26,c47);b26.visible=c47.visible=false;

/* ---------------- chú thích ---------------- */
const INFO=KB.cu_diem;const labels=[];
function infoKey(id){for(const k in INFO)if(id===k||id.startsWith(k))return k;return null}
function addLabel(text,pos,cls,key,minDist=0,maxDist=1e9){const el=document.createElement('div');el.className='lbl '+cls;el.innerHTML=`<b>${text}</b><i></i>`;
  $('labels').appendChild(el);const L={el,pos,cls,key,minDist,maxDist,on:true};if(key)el.onclick=()=>showInfo(key);labels.push(L);return L}
const seen={};
for(const s of SC.cu_diem){const k=infoKey(s.id);
  // gộp nhãn cụm Him Lam / Huguette thành một
  if(/^HimLam_[23]|^Huguette_[2-7]/.test(s.id))continue;
  const name=/^HimLam/.test(s.id)?'Him Lam (Béatrice)':/^Huguette/.test(s.id)?'Cụm Huguette':s.ten.replace(/\s*\((PC GONO)\)/,'');
  const big=['HimLam_1','DocLap','BanKeo','A1','PC_GONO','Isabelle','Huguette_1','Claudine','D1','C1'].includes(s.id);
  addLabel(name,B(s.x,s.y,s.z+25),'fr',k,0,big?1e9:5200)}
for(const v of SC.ban)addLabel(v.ten,B(v.x,v.y,v.z+18),'ban',null,0,4500);
const TD={TranDiaPhao105_HimLam:'Trận địa pháo 105 (Him Lam)',TranDiaPhao_H6:'Trận địa pháo H6',TranDiaPhao_DongA1:'Trận địa pháo phía Đông',TranDiaPhao_DongNam:'Trận địa pháo Đông Nam',TranDiaPhao_Bac:'Trận địa pháo phía Bắc',TranDiaPhao_Tay:'Trận địa pháo phía Tây',TranDiaPhao_TayNam:'Trận địa pháo Tây Nam'};
for(const t of SC.tran_dia_ta)addLabel(TD[t.id]||t.id,B(t.x,t.y,t.z+20),'vn',null,0,7000);
const PK=[addLabel('PHÂN KHU BẮC',B(-1900,2700,420),'pk',null),addLabel('PHÂN KHU TRUNG TÂM',B(-500,-300,380),'pk',null),addLabel('PHÂN KHU NAM',B(-840,-5600,300),'pk',null)];
let showLbl=true,showBan=false,showPK=true;
function showInfo(k){const d=INFO[k];if(!d)return;$('infobody').innerHTML=`<h2>${d.ten}</h2><p>${d.mo_ta}</p><p class="src">Tái dựng mô phỏng theo kịch bản "Điện Biên Phủ – Dấu ấn non sông".</p>`;$('info').hidden=false}
$('infox').onclick=()=>$('info').hidden=true;
const v3=new THREE.Vector3();
function updLabels(){const W=innerWidth,H=innerHeight;
  for(const L of labels){let vis=showLbl&&(L.cls!=='ban'||showBan)&&(L.cls!=='pk'||showPK);
    if(vis){const d=camera.position.distanceTo(L.pos);vis=d<L.maxDist&&d>L.minDist;
      if(vis){v3.copy(L.pos).project(camera);vis=v3.z<1&&Math.abs(v3.x)<1.1&&Math.abs(v3.y)<1.1;
        if(vis){L.el.style.left=((v3.x+1)/2*W).toFixed(1)+'px';L.el.style.top=((1-v3.y)/2*H).toFixed(1)+'px'}}}
    if(vis!==L.on){L.el.classList.toggle('hidden',!vis);L.on=vis}}}
$('lbtn').onclick=e=>{showLbl=!showLbl;e.currentTarget.classList.toggle('on',showLbl);e.currentTarget.setAttribute('aria-pressed',showLbl)};
$('bban').onclick=e=>{showBan=!showBan;e.currentTarget.classList.toggle('on',showBan);e.currentTarget.setAttribute('aria-pressed',showBan)};
$('bxe').onclick=e=>{moving=!moving;e.currentTarget.classList.toggle('on',moving);e.currentTarget.setAttribute('aria-pressed',moving)};

/* ---------------- góc nhìn nhanh ---------------- */
const VIEWS={all:[[-1800,-9800,5200],[-700,-1000,0]],bac:[[-200,800,1400],[-1800,2600,0]],tt:[[600,-2300,1300],[-500,-500,0]],
  a1:[[350,-1500,260],[-26,-939,30]],himlam:[[1500,600,420],[720,1480,30]],decastries:[[-450,-1050,170],[-720,-703,0]],
  sanbay:[[-300,-900,700],[-1650,500,0]],nam:[[300,-7600,1100],[-841,-5878,0]],keophao:[[2900,3300,700],[3900,4300,140]],xetho:[[2400,1900,500],[3300,2800,90]]};
let tween=null;
function flyTo(eye,tgt,dur=2.2){const e=B(...eye),t=B(...tgt);tween={t:0,dur,e0:camera.position.clone(),t0:controls.target.clone(),e1:e,t1:t}}
for(const b of $('views').querySelectorAll('button'))b.onclick=()=>{stopStory();for(const x of $('views').querySelectorAll('button'))x.classList.toggle('on',x===b);const v=VIEWS[b.dataset.v];flyTo(v[0],v[1])};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function updTween(dt){if(!tween)return;tween.t+=dt/tween.dur;const k=ease(Math.min(1,tween.t));camera.position.lerpVectors(tween.e0,tween.e1,k);controls.target.lerpVectors(tween.t0,tween.t1,k);if(tween.t>=1)tween=null}

/* ---------------- hiệu ứng: nổ, khói, cờ ---------------- */
function spriteTex(stops){const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);
  for(const[a,c]of stops)g.addColorStop(a,c);x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)}
const FIRE=new THREE.SpriteMaterial({map:spriteTex([[0,'rgba(255,245,210,1)'],[.3,'rgba(255,160,50,.95)'],[1,'rgba(255,60,0,0)']]),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false});
const SMOKE=new THREE.SpriteMaterial({map:spriteTex([[0,'rgba(70,64,58,.75)'],[.6,'rgba(80,74,66,.35)'],[1,'rgba(90,84,76,0)']]),depthWrite:false,transparent:true});
const fx=[];
function boom(bx,by,bz,size=14,t=0){const f=new THREE.Sprite(FIRE);const s=new THREE.Sprite(SMOKE.clone());const p=B(bx,by,bz+size*.3);f.position.copy(p);s.position.copy(p);
  f.visible=s.visible=false;scene.add(f,s);fx.push({f,s,t0:t,size,p})}
function updFx(time){for(const e of fx){const a=time-e.t0;
  e.f.visible=a>=0&&a<.5;if(e.f.visible){const k=a/.5;e.f.scale.setScalar(e.size*(.4+1.6*k));e.f.material.opacity=1-k}
  e.s.visible=a>=.1&&a<7;if(e.s.visible){const k=(a-.1)/6.9;e.s.scale.setScalar(e.size*(1.2+3.5*k));e.s.position.y=e.p.y+e.size*3*k;e.s.material.opacity=.8*(1-k)}}}
function clearFx(){for(const e of fx){scene.remove(e.f,e.s);e.s.material.dispose()}fx.length=0}
// cờ "Quyết chiến Quyết thắng" (hiện ở cuối cảnh 12)
const coVN=(()=>{const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,9,6),new THREE.MeshStandardMaterial({color:0x222222}));pole.position.y=4.5;g.add(pole);
  const cv=document.createElement('canvas');cv.width=270;cv.height=180;const x=cv.getContext('2d');x.fillStyle='#d01414';x.fillRect(0,0,270,180);x.fillStyle='#ffd400';x.beginPath();
  for(let i=0;i<10;i++){const r=i%2?22:55,a=-Math.PI/2+i*Math.PI/5;x.lineTo(135+r*Math.cos(a),90+r*Math.sin(a))}x.fill();
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.8,12,1),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide,roughness:.9}));
  flag.position.set(1.35,8,0);g.add(flag);g.userData.flag=flag;const pc=SC.cu_diem.find(s=>s.id==='PC_GONO');g.position.copy(B(pc.x-3,pc.y+6,pc.z+3));g.visible=false;scene.add(g);return g})();
const pcPos=(()=>{const pc=SC.cu_diem.find(s=>s.id==='PC_GONO');return B(pc.x,pc.y,pc.z+20)})();
const flashLight=new THREE.PointLight(0xffa050,0,5000,1.2);scene.add(flashLight);

/* ---------------- kể chuyện theo kịch bản (camera lấy từ Blender) ---------------- */
const CAMS={};for(const c of SC.camera)CAMS[c.marker]=c;
const STORY=KB.canh.map(s=>{const segs=s.markers.map(m=>CAMS[m]).filter(Boolean);const dur=segs.reduce((a,c)=>a+c.dai/24,0);return{...s,segs,dur}}).filter(s=>s.segs.length);
let st=null;   // {i, t}
const qa=new THREE.Quaternion(),qb=new THREE.Quaternion();
function camAt(c,t){const f=t*24;const K=c.keys;let i=1;while(i<K.length-1&&K[i][0]<f)i++;const a=K[i-1],b=K[i];const k=Math.max(0,Math.min(1,(f-a[0])/Math.max(1,b[0]-a[0])));
  camera.position.copy(B(a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k,a[3]+(b[3]-a[3])*k));
  qa.set(a[5],a[6],a[7],a[4]);qb.set(b[5],b[6],b[7],b[4]);qa.slerp(qb,k);camera.quaternion.copy(Q_BL).multiply(qa);
  const hf=2*Math.atan(18/c.lens);camera.fov=THREE.MathUtils.radToDeg(camera.aspect>=1?2*Math.atan(Math.tan(hf/2)/camera.aspect):hf);camera.updateProjectionMatrix()}
function setupScene(s){clearFx();
  const sites=Object.fromEntries(SC.cu_diem.map(c=>[c.id,c]));
  if(s.no){const t0=s.id==='C09'?3:2;for(let i=0;i<(s.id==='C09'?70:55);i++){const c=sites[s.no[i%s.no.length]];if(!c)continue;const a=Math.random()*6.28,r=Math.random()*c.r*1.3;
    boom(c.x+r*Math.cos(a),c.y+r*Math.sin(a),c.z,10+Math.random()*12,t0+Math.random()*(s.dur-t0-6))}}
  if(s.no_a1){const a=sites.A1;for(let i=0;i<6;i++)boom(a.x+(Math.random()-.5)*30,a.y+(Math.random()-.5)*30,a.z+5,70+Math.random()*30,s.no_a1+i*.15)}
  if(haoVN)haoVN.visible=!(['MO_DAU','C06','C07','C08','C09','C10'].includes(s.id));
  showPK=!!s.nhan_phan_khu||s.id==='MO_DAU';
  coVN.visible=false;if(coPhap)coPhap.visible=true;
  b26.visible=c47.visible=(s.id==='C06'||s.id==='C08');
  $('sub').innerHTML=`<span class="st">${s.tieu_de}</span>${s.loi}`;$('sub').hidden=false;
  $('stitle').textContent=s.tieu_de}
function startStory(i=0){tween=null;controls.enabled=false;st={i,t:0};setupScene(STORY[i]);$('splay').textContent='⏸';for(const x of $('views').querySelectorAll('button'))x.classList.remove('on')}
function stopStory(){if(!st)return;st=null;controls.enabled=true;clearFx();$('sub').hidden=true;$('splay').textContent='▶';setLight(0,0,0);
  if(haoVN)haoVN.visible=true;showPK=true;coVN.visible=false;if(coPhap)coPhap.visible=true;b26.visible=c47.visible=false;
  const d=new THREE.Vector3();camera.getWorldDirection(d);controls.target.copy(camera.position).addScaledVector(d,Math.max(300,camera.position.y*1.5));camera.fov=42;camera.updateProjectionMatrix()}
$('splay').onclick=()=>st?stopStory():startStory(0);
$('snext').onclick=()=>startStory(st?Math.min(STORY.length-1,st.i+1):0);
$('sprev').onclick=()=>startStory(st?Math.max(0,st.i-1):0);
function setLight(chieu,dem,flash){SKY.chieu.value=chieu;SKY.dem.value=dem;SKY.flash.value=flash;
  const day=1-dem;hemi.intensity=NGAY.hemi*(.12+.88*day);sun.intensity=NGAY.sun*(.04+.96*day);
  sun.color.copy(NGAY.sunC).lerp(new THREE.Color(0xffa060),chieu);scene.fog.color.copy(NGAY.fog).lerp(new THREE.Color(0xd8a078),chieu*.6).lerp(new THREE.Color(0x0b0c12),dem*.9);
  flashLight.intensity=flash*4e6}
function updStory(dt){if(!st)return;const s=STORY[st.i];st.t+=dt;
  if(st.t>=s.dur){if(st.i<STORY.length-1){startStory(st.i+1);return}stopStory();return}
  let t=st.t;for(const c of s.segs){const d=c.dai/24;if(t<=d||c===s.segs[s.segs.length-1]){camAt(c,Math.min(t,d));break}t-=d}
  $('sbar').style.width=(st.t/s.dur*100).toFixed(1)+'%';
  // ánh sáng theo kịch bản
  let chieu=s.chieu?1:0,dem=0,flash=0;
  if(s.dem){const[a,b]=s.dem;dem=THREE.MathUtils.smoothstep(st.t,a-3,a)*(1-THREE.MathUtils.smoothstep(st.t,b,b+4))}
  if(s.no_a1){const a=st.t-s.no_a1;if(a>0&&a<4){flash=Math.exp(-a*1.6);flashLight.position.copy(B(-26,-939,140))}}
  if(s.co){const a=st.t-s.co;if(a>0){coVN.visible=true;if(coPhap)coPhap.visible=false;coVN.userData.flag.position.y=Math.min(8,1+a*1.4)}}
  setLight(chieu,dem,flash);updFx(st.t)}

/* ---------------- vòng lặp ---------------- */
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
camera.position.copy(B(...VIEWS.all[0]).multiplyScalar(1.15));controls.target.copy(B(...VIEWS.all[1]));flyTo(...VIEWS.all,3);
const clock=new THREE.Clock();let fN=0,fT=0;
renderer.setAnimationLoop(()=>{const dt=Math.min(.1,clock.getDelta());
  updTween(dt);updMovers(dt);updStory(dt);if(!st)controls.update();
  if(coVN.visible){const f=coVN.userData.flag,p=f.geometry.attributes.position;const tt=performance.now()/300;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(x*2.4-tt)*.18*(x+1.35)/2.7)}p.needsUpdate=true}
  const tb=performance.now()/1000;b26.position.copy(B(-6000+((tb*95)%12000),-6000+((tb*95)%12000),700));b26.rotation.y=Math.PI/4;
  c47.position.copy(B(4000-((tb*70)%9000),-3500+((tb*70)%9000)*.75,520));c47.rotation.y=Math.atan2(.75,1)+Math.PI;
  renderer.render(scene,camera);updLabels();
  fN++;fT+=dt;if(fT>1){$('fps').textContent=fN+' fps';fN=0;fT=0}});
$('load').classList.add('done');
