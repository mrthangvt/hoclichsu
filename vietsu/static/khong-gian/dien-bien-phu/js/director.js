/* Bộ đạo diễn sa bàn Điện Biên Phủ: AUTO_FILM (phim tự động), EXPLORE (khám phá), COMPARE (so sánh hai thời điểm).
   Nguyên tắc: mọi thứ hiển thị là HÀM của (cảnh, thời gian) → tua tiến/lùi tới cùng một thời điểm cho cùng một trạng thái (seek idempotent).
   Dữ liệu: data/scenes.json (cảnh, góc máy, thời tiết, lời bình, hành động), data/events.json (trạng thái cứ điểm), data/places.json. */
export async function startDirector(A){
  const {THREE,scene,camera,controls,renderer,B,hAt,safeEye,CAT,GU,audio}=A;
  const $=id=>document.getElementById(id);
  const SCN=A.SCENES.scenes,TOTAL=SCN.reduce((a,s)=>a+s.durationSec,0);
  const START=[];{let a=0;for(const s of SCN){START.push(a);a+=s.durationSec}}
  A.world.traverse(o=>{if(o.isMesh&&o.material&&o.material.name==='M_NuocSong'){o.material.color.set(0x55705e);o.material.emissive=new THREE.Color(0x0c1a16);o.material.roughness=.12}});
  const PH=Object.fromEntries(A.PL.map(p=>[p.id,p]));
  const GUN=A.SC.tran_dia_ta;
  const D={mode:'film',i:0,t:0,playing:false,speed:1,userCam:false,prevT:0,voice:false,started:false};
  const W={on:false,av:null,keys:{},joy:{x:0,y:0},pos:new THREE.Vector3(),yaw:0,moving:0};
  const E={t:0,built:false,idle:0};
  const rngOf=seed=>()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
  const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const lerp=(a,b,k)=>a+(b-a)*k;

  /* ---------- thời gian lịch sử của cảnh (khóa từng đoạn) ---------- */
  function histMs(s,t){const K=s.histKeys;let j=0;while(j<K.length-2&&K[j+1][0]<=t)j++;const a=K[j],b=K[j+1];const k=clamp((t-a[0])/Math.max(1e-6,b[0]-a[0]),0,1);return lerp(A.ts(a[1]),A.ts(b[1]),k)}
  const MS=d=>A.ts(d);
  /* trạng thái chung theo thời điểm lịch sử (dùng cho EXPLORE, COMPARE và làm nền cho phim) */
  function trenchStageAt(ms){const K=[['1954-02-01',0],['1954-03-13',.3],['1954-03-30',.55],['1954-04-30',1]];
    if(ms<=MS(K[0][0]))return 0;for(let i=1;i<K.length;i++)if(ms<=MS(K[i][0])){const a=MS(K[i-1][0]),b=MS(K[i][0]);return lerp(K[i-1][1],K[i][1],(ms-a)/(b-a))}return 1}
  const CASTOR=MS('1953-11-20'),FLAG=MS('1954-05-07T17:30');

  /* ---------- áp trạng thái lớp ---------- */
  const LV={fort:1,reveal:1e9,vn:1,trench:1,routes:1,supply:1,ctrl:0,flag:0,coPhap:1,hq:0,attacks:1};
  function applyLayers(L){
    const R=L.reveal;for(const o of CAT.fortifications){const d=o.userData.d;const k=L.fort?clamp((R-d)/220,0,1):0;o.visible=k>0;if(o.visible)o.scale.set(o.userData.s0.x,o.userData.s0.y*Math.max(.02,k),o.userData.s0.z)}
    for(const u of A.REV_FR)u.uR.value=L.fort?R:-1;
    if(CAT.trench_fr)CAT.trench_fr.visible=!!L.fort;if(CAT.wire)CAT.wire.visible=!!L.fort&&LAYU.wire;
    for(const o of CAT.vn)o.visible=!!L.vn&&LAYU.artillery;for(const o of CAT.supply)o.visible=!!L.supply&&LAYU.vehicles;for(const o of CAT.routes)o.visible=!!L.routes;
    const T=L.trench<=0?1e9:lerp(A.KC_MAX+1,-80,L.trench);for(const u of A.REV_VN)u.uT.value=T;if(CAT.trench_vn)CAT.trench_vn.visible=L.trench>0&&LAYU.trenches;
    if(CAT.trench_fr&&!LAYU.trenches)CAT.trench_fr.visible=false;
    if(CAT.coPhap)CAT.coPhap.visible=!!L.fort&&L.coPhap&&L.reveal>200;
    for(const m of A.TREES)m.visible=LAYU.trees;
    for(const o of A.world.children)if(/^Ban_/.test(o.name))o.visible=LAYU.villages3d;
    GU.uCtrl.value.w=L.ctrl?1:0;A.hq.visible=!!L.hq}
  function stateLayers(ms){return{fort:ms>=CASTOR?1:0,reveal:1e9,vn:ms>=MS('1954-02-01')?1:0,supply:ms>=MS('1954-02-01')?1:0,routes:ms>=MS('1954-02-01')?1:0,trench:trenchStageAt(ms),ctrl:0,flag:ms>=FLAG?1:0,coPhap:ms<FLAG?1:0,hq:0}}
  function colorPlaces(ms,alphaFn){A.setPlaceVis(p=>({state:A.stateAt(p.id,ms),a:alphaFn?alphaFn(p):(ms>=CASTOR?LAYU.status?1:0:0)}))
    for(const p of A.PL){const s=A.stateAt(p.id,ms);const dot=p.lbl.el.querySelector('.dot');if(dot)dot.style.background='#'+new THREE.Color(A.STATE_COL[s]).getHexString()}}
  const LAYU={trenches:true,artillery:true,vehicles:true,trees:true,labels:true,attacks:true,control:true,status:true,villages3d:true,wire:true};

  /* ---------- cờ "Quyết chiến Quyết thắng" ---------- */
  const PCp=PH.HQ_DE_CASTRIES.coordinates;
  const flag=(()=>{const g=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,9,6),new THREE.MeshStandardMaterial({color:0x222222}));pole.position.y=4.5;g.add(pole);
    const cv=document.createElement('canvas');cv.width=270;cv.height=180;const x=cv.getContext('2d');x.fillStyle='#d01414';x.fillRect(0,0,270,180);x.fillStyle='#ffd400';x.beginPath();
    for(let i=0;i<10;i++){const r=i%2?22:55,a=-Math.PI/2+i*Math.PI/5;x.lineTo(135+r*Math.cos(a),90+r*Math.sin(a))}x.fill();
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
    const f=new THREE.Mesh(new THREE.PlaneGeometry(2.7,1.8,12,1),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,roughness:.9}));f.position.set(1.35,8,0);g.add(f);g.userData.f=f;
    g.position.copy(B(PCp[0]-3,PCp[1]+6,hAt(PCp[0],PCp[1])+3));g.visible=false;scene.add(g);return g})();

  /* ---------- Đồi A1: hố bộc phá (hiện sau vụ nổ), công sự Pháp trên đỉnh bị phá ---------- */
  const A1p=PH.A1.coordinates;const BLAST_MS=MS('1954-05-06T22:00');   // "đêm 6/5" — giờ là ước lượng minh họa
  const crater=(()=>{const R=26,N=48,g=new THREE.PlaneGeometry(R*2.6,R*2.6,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position;const col=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z)/R;const wx=A1p[0]+x,wy=A1p[1]-z;let h=hAt(wx,wy)+.35;
      const bowl=r<1?-9*(1-r*r):0,rim=Math.exp(-Math.pow((r-1.05)/.18,2))*2.6+(r>1?Math.exp(-(r-1)*2.2)*.6:0);const nz=Math.sin(x*.7)*Math.cos(z*.6)*.6;
      p.setY(i,h+bowl*.75+rim+nz*(r<1.4?1:0));const c=r<.75?[.10,.08,.06]:r<1.15?[.24,.19,.14]:[.36,.30,.22];const fade=r>1.25?Math.max(0,1-(r-1.25)/.05):1;col.set(c.map(v=>v*(fade?1:1)),i*3)}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,polygonOffset:true,polygonOffsetFactor:-2}));
    // làm mờ viền cho hố hòa vào nền đất
    m.material.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vL;').replace('#include <begin_vertex>','#include <begin_vertex>\nvL=position.xz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vL;').replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.a*=1.-smoothstep(30.,33.,length(vL));')};
    m.position.copy(B(A1p[0],A1p[1],0));m.position.y=0;m.visible=false;scene.add(m);return m})();
  const A1FORT=CAT.fortifications.filter(o=>{const b=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());return Math.hypot(b.x-A1p[0],-b.z-A1p[1])<45});
  function setA1(after){crater.visible=after;for(const o of A1FORT)if(after)o.visible=false}
  // khói lửa nghi ngút sau vụ nổ (hàm của thời gian kể từ khi nổ)
  const EMB=(()=>{const r=rngOf(91),a=[];for(let k=0;k<14;k++){const ang=r()*6.28,rr=r()*30;a.push({x:A1p[0]+Math.cos(ang)*rr,y:A1p[1]+Math.sin(ang)*rr,s:5+r()*9,ph:r()*6})}return a})();
  function lingerA1(since,k){if(since<0||k<=0)return;for(const e of EMB){const f=A.FIRE.take();if(f){f.visible=true;f.position.copy(B(e.x,e.y,hAt(e.x,e.y)+e.s*.35));const fl=.75+.25*Math.sin(since*9+e.ph)*Math.sin(since*5.3+e.ph*2);f.scale.setScalar(e.s*fl*(.6+.4*k));f.material.opacity=.75*k}
      for(let j=0;j<2;j++){const m=A.SMOKE.take();if(!m)break;const c=((since*.07+e.ph*.16+j*.5)%1);m.visible=true;m.position.copy(B(e.x+c*60,e.y+c*35,hAt(e.x,e.y)+8+c*260));m.scale.setScalar(20+c*150);m.material.opacity=.7*(1-c)*k;m.material.color.setScalar(.55*(1-A.SKY.dem.value*.6))}}}

  /* ---------- diễn viên (tạo khi vào cảnh, cập nhật theo t) ---------- */
  const GROUPS=[];let actors=[],booms=[],flashes=[],arrows=[],extra=[];
  const tmp=new THREE.Vector3(),tmp2=new THREE.Vector3();
  function clearActors(){GROUPS.length=0;for(const a of actors)scene.remove(a.obj);for(const o of extra)scene.remove(o);for(const a of arrows)scene.remove(a.mesh);actors=[];booms=[];flashes=[];arrows=[];extra=[]}
  function path(pts){const P=pts.map(p=>B(p[0],p[1],p[2]));const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+P[i].distanceTo(P[i-1]));
    return{len:L[L.length-1],at(s,out,dir){s=clamp(s,0,this.len);let i=1;while(i<L.length-1&&L[i]<s)i++;const k=(s-L[i-1])/Math.max(1e-6,L[i]-L[i-1]);out.lerpVectors(P[i-1],P[i],k);if(dir)dir.subVectors(P[i],P[i-1]).normalize();return out}}}
  const ROUTE={};for(const k in A.SC.duong)ROUTE[k]=path(A.SC.duong[k].map(p=>[p[0],p[1],p[2]-.8]));
  const face=(o,d)=>{o.rotation.y=Math.atan2(d.x,d.z)};
  function ground3(x,y,dz=0){return B(x,y,hAt(x,y)+dz)}
  // tổ kéo pháo: pháo + 12 người kéo dây (động tác "kéo nặng") + 2 người đẩy
  function keoPhao(route,gun,s0,speed,t0,t1,loop=false){const r=ROUTE[route];if(!r)return null;const g=new THREE.Group();const p=A.mau(gun);g.add(p);
    const men=[];for(let i=0;i<6;i++)for(const s of[-1,1]){const c=A.makeChar('bodoi','keo_nang');c.obj.position.set(s*1.1,0,4.5+i*2);g.add(c.obj);men.push(c)}
    for(const s of[-1,1]){const c=A.makeChar('bodoi','day');c.obj.position.set(s*.8,0,-2.6);g.add(c.obj);men.push(c)}
    const rope=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.2,.5,1.9),new THREE.Vector3(-1.1,1,15),new THREE.Vector3(.2,.5,1.9),new THREE.Vector3(1.1,1,15)]),new THREE.LineBasicMaterial({color:0x6b5434}));g.add(rope);
    p.rotation.y=-Math.PI/2;   // nòng pháo quay về sau, càng pháo hướng theo chiều kéo
    scene.add(g);const a={obj:g,center:new THREE.Vector3(),heading:0,update(t){g.visible=t>=t0&&t<=t1;if(!g.visible)return;let s=s0+speed*(t-t0);if(loop)s=s0+(speed*(t-t0))%Math.max(1,r.len*.4);r.at(s,g.position,tmp2);face(g,tmp2);this.center.copy(g.position).addScaledVector(tmp2,7);this.heading=Math.atan2(tmp2.x,-tmp2.z);
      for(let k=0;k<men.length;k++)men[k].set((t-t0)*speed*.9+k*.13)}};actors.push(a);return a}
  // đoàn xe đạp thồ: dân công đẩy xe (động tác "đẩy xe")
  function xeTho(route,n,gap,speed,t0,t1,s0=0){const r=ROUTE[route];if(!r)return;for(let i=0;i<n;i++){const g=new THREE.Group();const c=A.makeChar('dancong','day_xe');g.add(c.obj);
    const bike=A.mau('XeDapTho_Tripo');bike.position.set(.35,0,1.25);bike.rotation.y=-Math.PI/2;g.add(bike);scene.add(g);
    actors.push({obj:g,update(t){g.visible=t>=t0&&t<=t1;if(!g.visible)return;const s=s0+i*gap+speed*(t-t0);r.at(s%r.len,g.position,tmp2);face(g,tmp2);c.set(t*1.05+i*.21)}})}}
  // mũi tiến công: nhóm bộ đội chạy (động tác "chạy") từ hướng xuất phát tới cứ điểm + mũi tên trên địa hình
  function assault(act,seed){const grp={center:new THREE.Vector3(),heading:0,n:0};GROUPS.push(grp);const tg=PH[act.target];if(!tg)return;const rnd=rngOf(seed);const [fx,fy]=act.from_;const [tx,ty]=tg.coordinates;
    const dx=tx-fx,dy=ty-fy,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,stop=L-Math.min(tg.r*.45,L*.3);const n=A.MOBILE?6:12;const clip=act.walk?'di_bo':'chay';const sp=act.walk?1.3:4.2;
    const dur=act.t1-act.t0;const lead=Math.max(0,stop-sp*dur);
    for(let i=0;i<n;i++){const c=A.makeChar('bodoi',clip);const ox=(rnd()-.5)*18,oy=-rnd()*26;scene.add(c.obj);
      actors.push({obj:c.obj,update(t){const on=t>=act.t0&&t<=act.t1+6;c.obj.visible=on;if(!on)return;const s=Math.min(stop,lead+sp*(t-act.t0))+oy;
        const x=fx+ux*s-uy*ox,y=fy+uy*s+ux*ox;c.obj.position.copy(B(x,y,hAt(x,y)-.05));c.obj.rotation.y=Math.atan2(ux,-uy);c.set(t*(act.walk?1:1.15)+i*.17);if(i===0){grp.center.copy(c.obj.position);grp.heading=Math.atan2(ux,uy)}}})}
    // mũi tên
    const pts=[];for(let k=0;k<=24;k++){const f=k/24,x=fx+dx*f*.92+(-uy)*Math.sin(f*Math.PI)*L*.08,y=fy+dy*f*.92+ux*Math.sin(f*Math.PI)*L*.08;pts.push(B(x,y,hAt(x,y)+14+Math.sin(f*Math.PI)*L*.04))}
    const cur=new THREE.CatmullRomCurve3(pts);const geo=new THREE.TubeGeometry(cur,80,Math.max(2.5,L*.0035),6,false);const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xc8372d,transparent:true,opacity:.75,depthWrite:false}));
    const head=new THREE.Mesh(new THREE.ConeGeometry(Math.max(9,L*.012),Math.max(26,L*.035),8),mesh.material);head.position.copy(pts[24]);head.lookAt(pts[23]);head.rotateX(-Math.PI/2);
    const ag=new THREE.Group();ag.add(mesh,head);scene.add(ag);const total=geo.index.count;
    arrows.push({mesh:ag,update(t){const k=clamp((t-act.t0)/Math.max(1,(act.t1-act.t0)*.6),0,1);ag.visible=LAYU.attacks&&t>=act.t0&&t<=act.t1+20&&(!D.lastT||camera.position.distanceTo(D.lastT)>320);geo.setDrawRange(0,Math.floor(total*k/6)*6);head.visible=k>=1}})}
  // pháo kích: chớp nòng ở trận địa ta + nổ tại mục tiêu
  function barrage(act,seed){const rnd=rngOf(seed);const tgs=act.target==='EAST'?['E1','D1','C1','A1']:[act.target];const n=Math.floor((act.t1-act.t0)*(act.target==='EAST'?1.2:2.4));
    for(let k=0;k<n;k++){const g=GUN[Math.floor(rnd()*GUN.length)];const tg=PH[tgs[Math.floor(rnd()*tgs.length)]];if(!tg)continue;const tf=act.t0+rnd()*(act.t1-act.t0);
      flashes.push({t:tf,p:B(g.x+(rnd()-.5)*60,g.y+(rnd()-.5)*60,g.z+3)});const a=rnd()*6.28,r=rnd()*tg.r*.9;const x=tg.coordinates[0]+r*Math.cos(a),y=tg.coordinates[1]+r*Math.sin(a);
      booms.push({t:tf+Math.hypot(g.x-x,g.y-y)/900,p:ground3(x,y,4),size:16+rnd()*14})}}
  // đổ quân dù Castor: máy bay vận tải bay đội hình, dù rơi xuống bãi
  function castor(act){const P0=new THREE.Vector3(),P1=new THREE.Vector3();const from=[3200,5200],to=[-5200,-3600];const alt=hAt(-1100,-100)+520;const dir=new THREE.Vector3(to[0]-from[0],0,-(to[1]-from[1])).normalize();
    const planes=[];for(let i=0;i<6;i++){const p=A.mau('MayBay_C47_Dakota');p.scale.setScalar(1);scene.add(p);planes.push({p,o:new THREE.Vector3((i%3-1)*40,(i%2)*15,-Math.floor(i/3)*60)})}
    const dur=act.t1-act.t0;const tdur=dur*1.15;
    const chute=new THREE.Mesh(new THREE.SphereGeometry(4,10,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xe8e4da,side:THREE.DoubleSide}));
    const lines=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5,.2,0),new THREE.Vector3(0,-5,0),new THREE.Vector3(3.5,.2,0),new THREE.Vector3(0,-5,0)]),new THREE.LineBasicMaterial({color:0xccccbb}));
    const drops=[];const rnd=rngOf(11);const posAt=(t,out)=>{const k=(t-act.t0)/tdur;out.copy(B(lerp(from[0],to[0],k),lerp(from[1],to[1],k),alt));return out};
    for(let i=0;i<(A.MOBILE?24:48);i++){const td=act.t0+dur*.35+rnd()*dur*.35;const pl=planes[i%6];posAt(td,tmp);const s=tmp.clone().add(pl.o);const g=new THREE.Group();
      const c=chute.clone();c.position.y=5;g.add(c,lines.clone());const man=A.mau('LinhPhap_1954');man.position.y=-6.6;g.add(man);scene.add(g);
      const gy=hT0(s.x,s.z);drops.push({g,s,td,gy,drift:new THREE.Vector3((rnd()-.5)*30,0,(rnd()-.5)*30)})}
    D.castor={center:new THREE.Vector3(),heading:Math.atan2(dir.x,-dir.z)};
    actors.push({obj:new THREE.Group(),update(t){const on=t>=act.t0&&t<=act.t1+30;posAt(clamp(t,act.t0,act.t0+tdur),D.castor.center);for(const pl of planes){pl.p.visible=on&&t<=act.t0+tdur;if(!pl.p.visible)continue;posAt(t,pl.p.position).add(pl.o);pl.p.rotation.y=Math.atan2(dir.x,dir.z)-Math.PI/2}
      for(const d of drops){const a=t-d.td;d.g.visible=on&&a>=0;if(!d.g.visible)continue;const y=Math.max(d.gy+6.6,d.s.y-6-a*6.5);d.g.position.set(d.s.x+d.drift.x*Math.min(1,a/40),y,d.s.z+d.drift.z*Math.min(1,a/40));
        d.g.children[0].scale.setScalar(Math.min(1,a*1.5)+.01);if(y<=d.gy+6.7)d.g.children[0].scale.y=Math.max(.05,1-(a-(d.s.y-6-d.gy-6.6)/6.5)*.5)}}});
    extra.push(...planes.map(p=>p.p),...drops.map(d=>d.g))}
  const hT0=(x,z)=>A.hT(x,z);
  // tiếp tế đường không (cảnh 07): máy bay lượn, dù hàng rơi — có dù rơi lệch khỏi vùng phòng ngự
  function airdrop(act){const rnd=rngOf(7);const C=[-800,-500];const planes=[];for(let i=0;i<2;i++){const p=A.mau('MayBay_C47_Dakota');scene.add(p);planes.push(p)}
    const alt=hAt(-800,-500)+600;const posAt=(t,i,out)=>{const a=(t*.05+i*Math.PI);out.copy(B(C[0]+Math.cos(a)*1700,C[1]+Math.sin(a)*1400,alt+i*60));return a};
    const box=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,1.2),new THREE.MeshLambertMaterial({color:0x5b5a3a}));const can=new THREE.Mesh(new THREE.SphereGeometry(3.5,10,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xd8cfae,side:THREE.DoubleSide}));
    const drops=[];for(let k=0;k<(A.MOBILE?14:28);k++){const td=act.t0+rnd()*(act.t1-act.t0-10);const i=k%2;const s=new THREE.Vector3();posAt(td,i,s);const g=new THREE.Group();const c=can.clone();c.position.y=5;g.add(c,box.clone());scene.add(g);
      drops.push({g,s,td,gy:A.hT(s.x,s.z)})}
    actors.push({obj:new THREE.Group(),update(t){const on=t>=act.t0-6&&t<=act.t1+20;planes.forEach((p,i)=>{p.visible=on;if(!on)return;const a=posAt(t,i,p.position);p.rotation.y=-a+(i?Math.PI:0)});
      for(const d of drops){const a=t-d.td;d.g.visible=on&&a>=0;if(!d.g.visible)continue;d.g.position.set(d.s.x,Math.max(d.gy+.5,d.s.y-a*7),d.s.z)}}});extra.push(...planes,...drops.map(d=>d.g))}
  // mặt cắt minh họa đồi A1: đường hầm + khối bộc phá (hiện xuyên địa hình)
  function cutaway(act){const [ax,ay]=PH.A1.coordinates;const z0=hAt(ax+130,ay-40)-2,z1=hAt(ax,ay)-16;const pts=[B(ax+130,ay-40,z0),B(ax+70,ay-22,(z0+z1)/2-2),B(ax,ay,z1)];
    const mat=new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:.85,depthTest:false});const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,1.4,8,false),mat);
    const chg=new THREE.Mesh(new THREE.BoxGeometry(6,4,6),new THREE.MeshBasicMaterial({color:0x1f4a2a,transparent:true,opacity:.95,depthTest:false}));chg.position.copy(pts[2]);
    const wire=new THREE.Mesh(new THREE.BoxGeometry(6.3,4.3,6.3),new THREE.MeshBasicMaterial({color:0x7fd07f,wireframe:true,depthTest:false}));wire.position.copy(pts[2]);
    const g=new THREE.Group();g.add(tube,chg,wire);g.renderOrder=10;tube.renderOrder=chg.renderOrder=wire.renderOrder=10;scene.add(g);
    const lb=A.labels.find(l=>l.cls==='minh-hoa')||(()=>{const el=document.createElement('div');el.className='lbl mh';el.innerHTML='<b>MINH HỌA · đường hầm & khối bộc phá (chưa theo bản vẽ gốc)</b><i></i>';$('labels').appendChild(el);
      const L={el,pos:pts[2].clone().add(new THREE.Vector3(0,40,0)),cls:'minh-hoa',maxD:1e9,on:true,force:false};A.labels.push(L);return L})();
    actors.push({obj:g,update(t){const on=t>=act.t0&&t<=act.t1&&LAYU.cutaway!==false;g.visible=on;lb.force=on;lb.pos.copy(pts[2]).y+=40}})}
  // nổ khối bộc phá A1
  function a1blast(act){const [ax,ay]=PH.A1.coordinates;const rnd=rngOf(61);for(let k=0;k<4;k++)booms.push({t:act.t+k*.15,p:ground3(ax+(rnd()-.5)*24,ay+(rnd()-.5)*24,10+k*8),size:24+rnd()*10,big:true});
    flashes.push({t:act.t,p:ground3(ax,ay,60),big:true});actors.push({obj:new THREE.Group(),update(t){const a=t-act.t;A.flashLight.intensity=a>0&&a<5?3e4*Math.exp(-a*1.5):A.flashLight.intensity;if(a>0&&a<5)A.flashLight.position.copy(ground3(ax,ay,120));
      D.shake=a>0&&a<2.5?(2.5-a)*1.6:0}})}
  // lính Pháp giữ đồi A1 trước vụ nổ
  function a1Garrison(tEnd){const rnd=rngOf(33);for(let i=0;i<10;i++){const c=A.makeChar('linhphap',i%3?'dung':'di_bo');const a=rnd()*6.28,r=8+rnd()*22;const x=A1p[0]+Math.cos(a)*r,y=A1p[1]+Math.sin(a)*r;scene.add(c.obj);
    actors.push({obj:c.obj,update(t){const on=t<tEnd;c.obj.visible=on;if(!on)return;const w=i%3?0:Math.sin(t*.2+i)*6;c.obj.position.copy(B(x+w,y,hAt(x+w,y)));c.obj.rotation.y=a+(i%3?2.5:Math.cos(t*.2+i)>0?1.57:-1.57);c.set(t+i*.4)}})}}
  // quân Pháp tập kết quanh doanh trại khu trung tâm (khám phá)
  function frCamp(){const rnd=rngOf(57);const C=[[PCp[0]-60,PCp[1]+150],[PCp[0]+120,PCp[1]+60],[PCp[0]-180,PCp[1]-120],[-1450,300]];
    for(let i=0;i<(A.MOBILE?12:26);i++){const [cx,cy]=C[i%C.length];const walk=i%2===0;const c=A.makeChar('linhphap',walk?'di_bo':'dung');scene.add(c.obj);const R=12+rnd()*30,ph=rnd()*6.28,sp=(rnd()<.5?-1:1)*(1.3/R);
      const sx=cx+(rnd()-.5)*60,sy=cy+(rnd()-.5)*60,fa=rnd()*6.28;
      actors.push({obj:c.obj,update(t){c.obj.visible=true;if(walk){const a=ph+t*sp;const x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;c.obj.position.copy(B(x,y,hAt(x,y)));c.obj.rotation.y=Math.atan2(-Math.sin(a)*Math.sign(sp),-Math.cos(a)*Math.sign(sp))}
        else{c.obj.position.copy(B(sx,sy,hAt(sx,sy)));c.obj.rotation.y=fa}c.set(t+i*.37)}})}}
  // tù binh đi thành hàng ra khỏi khu trung tâm
  function prisoners(act){const n=A.MOBILE?10:20;const from=[PCp[0]+30,PCp[1]+10],to=[PCp[0]+420,PCp[1]+260];const dx=to[0]-from[0],dy=to[1]-from[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
    for(let i=0;i<n;i++){const c=A.makeChar('linhphap','di_bo');scene.add(c.obj);const row=Math.floor(i/2),side=i%2?1.2:-1.2;
      actors.push({obj:c.obj,update(t){const on=t>=act.t0&&t<=act.t1;c.obj.visible=on;if(!on)return;const s=1.1*(t-act.t0)-row*2.2;if(s<0){c.obj.visible=false;return}
        const x=from[0]+ux*s-uy*side,y=from[1]+uy*s+ux*side;c.obj.position.copy(B(x,y,hAt(x,y)));c.obj.rotation.y=Math.atan2(ux,-uy);c.set(t+i*.3)}})}}
  // bộ đội vượt cầu Mường Thanh tiến vào Sở chỉ huy
  function bridgeRun(act){const grp={center:new THREE.Vector3(),heading:0};GROUPS.push(grp);const br=[-652,-545];const st=[-560,-470];const dst=[PCp[0]+8,PCp[1]+8];const n=A.MOBILE?10:22;
    for(let i=0;i<n;i++){const c=A.makeChar('bodoi','chay');scene.add(c.obj);const lag=i*1.1,side=(i%3-1)*1.2;
      actors.push({obj:c.obj,update(t){const a=t-act.t0-lag;const on=a>=0&&t<=act.t1+10;c.obj.visible=on;if(!on)return;
        const d1=Math.hypot(br[0]-st[0],br[1]-st[1]),d2=Math.hypot(dst[0]-br[0],dst[1]-br[1]);let s=a*4.2,x,y,z;
        if(s<d1){const k=s/d1;x=lerp(st[0],br[0],k);y=lerp(st[1],br[1],k)}else{const k=Math.min(1,(s-d1)/d2);x=lerp(br[0],dst[0],k);y=lerp(br[1],dst[1],k)}
        const nx=s<d1?(br[0]-st[0]):(dst[0]-br[0]),ny=s<d1?(br[1]-st[1]):(dst[1]-br[1]);const ll=Math.hypot(nx,ny);x+=-ny/ll*side;y+=nx/ll*side;
        z=hAt(x,y);const db=Math.hypot(x-br[0],y-br[1]);if(db<30)z=Math.max(z,hAt(br[0],br[1])+4.6);c.obj.position.copy(B(x,y,z));c.obj.rotation.y=Math.atan2(nx,-ny);c.set(t*1.15+i*.2);if(i===2){grp.center.copy(c.obj.position);grp.heading=Math.atan2(nx,ny)}}})}}
  // Sở Chỉ huy Mường Phăng: cán bộ tham mưu đứng bên bàn bản đồ
  function hqStaff(){for(const [x,y,r] of [[30000.9,-1.6,.6],[29999.1,-1.5,-.5]]){const c=A.makeChar('bodoi','dung');c.obj.position.copy(B(x,y,0));c.obj.rotation.y=r+Math.PI;scene.add(c.obj);actors.push({obj:c.obj,update(t){c.set(.02)}})}}

  function setupScene(i){clearActors();const s=SCN[i];let seed=100+i*31;
    for(const a of s.actions){seed+=7;
      if(a.do==='assault')assault(a,seed);else if(a.do==='barrage')barrage(a,seed);else if(a.do==='castor')castor(a);else if(a.do==='airdrop')airdrop(a);
      else if(a.do==='cutaway')cutaway(a);else if(a.do==='a1blast'){a1blast(a);a1Garrison(a.t)}else if(a.do==='prisoners')prisoners(a);else if(a.do==='bridge_run')bridgeRun(a);
      else if(a.do==='convoy'){xeTho('Duong_XeTho_TiepTe',A.MOBILE?6:14,9,1.3,0,s.durationSec,ROUTE.Duong_XeTho_TiepTe?ROUTE.Duong_XeTho_TiepTe.len*.12:0);xeTho('Duong_XeTho_Bac',A.MOBILE?3:6,9,1.3,0,s.durationSec)}
      else if(a.do==='keophao'){D.kp=keoPhao('Duong_KeoPhao_DongBac','Phao_M101_105',ROUTE.Duong_KeoPhao_DongBac?ROUTE.Duong_KeoPhao_DongBac.len*.55:0,.45,0,s.durationSec)}}
    if(s.hq)hqStaff();
    booms.sort((a,b)=>a.t-b.t)}

  /* ---------- góc máy ---------- */
  function tgtOf(sh,u){if(sh.target==='may_bay'&&D.castor)return D.castor.center.clone();if(sh.target==='keo_phao'&&D.kp)return D.kp.center.clone().add(new THREE.Vector3(0,2,0));if(typeof sh.target==='string'&&sh.target.startsWith('nhom:')){const g=GROUPS[+sh.target.slice(5)];if(g)return g.center.clone().add(new THREE.Vector3(0,1.5,0))}const [x,y]=sh.target;return x>20000?B(x,y,sh.tz):B(x,y,hAt(x,y)+sh.tz)}
  function poseOf(sh,u){const T=tgtOf(sh,u);let az0=sh.az;if(sh.target==='keo_phao'&&D.kp)az0+=D.kp.heading*180/Math.PI;if(sh.target==='may_bay'&&D.castor)az0+=D.castor.heading*180/Math.PI;if(typeof sh.target==='string'&&sh.target.startsWith('nhom:')){const g=GROUPS[+sh.target.slice(5)];if(g)az0+=g.heading*180/Math.PI}const az=(az0+sh.daz*(u/sh.dur))*Math.PI/180,el=sh.el*Math.PI/180;
    const off=a=>new THREE.Vector3(Math.sin(a)*Math.cos(el),Math.sin(el),-Math.cos(a)*Math.cos(el)).multiplyScalar(sh.dist);let e=T.clone().add(off(az));
    if(typeof sh.target==='string'){const e2=T.clone().add(off(az+Math.PI));if(A.hT(e2.x,e2.z)<A.hT(e.x,e.z)-2)e=e2}return{e,T,fov:sh.fov||40,high:sh.high}}
  function camAt(s,t){let a=0,j=0;while(j<s.shots.length-1&&a+s.shots[j].dur<=t){a+=s.shots[j].dur;j++}const sh=s.shots[j],u=t-a;let P=poseOf(sh,u);
    if(j>0&&!sh.cut&&sh.blend>0&&u<sh.blend){const pv=s.shots[j-1];const Q=poseOf(pv,pv.dur);const k=ease(u/sh.blend);
      P={e:Q.e.lerp(P.e,k),T:Q.T.lerp(P.T,k),fov:lerp(Q.fov,P.fov,k),high:P.high&&Q.high}}
    safeEye(P.e,P.T,P.high);P.cutFade=sh.cut||j===0?Math.max(0,1-u/0.8):0;return P}

  /* ---------- thời tiết & ánh sáng theo khóa ---------- */
  const TOD={sang:{sun:2.0,sc:0xffd9b0,hemi:1.25,el:12,az:100,sky:[0,0,1],fog:0xd8c8b8,exp:1.0},ngay:{sun:2.6,sc:0xfff1dc,hemi:1.5,el:50,az:150,sky:[0,0,0],fog:0xb9c4cc,exp:1.05},
    chieu:{sun:2.2,sc:0xffa868,hemi:1.15,el:12,az:255,sky:[1,0,0],fog:0xd6aa86,exp:1.0},dem:{sun:.45,sc:0x8899cc,hemi:.5,el:40,az:200,sky:[0,1,0],fog:0x161a24,exp:1.45}};
  function envAt(s,t){const E=s.env;const cur={tod:'ngay',rain:0,wind:.3,fog:1,may:.3,storm:0,birds:0};let prev=null,todA='ngay',todB='ngay',kT=1;
    for(const k of E){if(k.t>t){break}prev=k}
    // nội suy: các khóa áp dần trong 6 giây
    const st={...cur};let lastTod='ngay';for(const k of E){if(k.t>t)break;const kk=clamp((t-k.t)/6,0,1);
      for(const f of['rain','wind','fog','may','storm','birds'])if(k[f]!=null)st[f]=lerp(st[f],k[f],k.t===0?1:kk);
      if(k.tod){todA=k.t===0?k.tod:lastTod;todB=k.tod;kT=k.t===0?1:kk;lastTod=k.tod}}
    st.todA=todA;st.todB=todB;st.kT=kT;return st}
  const cA=new THREE.Color(),cB=new THREE.Color();
  function applyEnv(st){const a=TOD[st.todA],b=TOD[st.todB],k=st.kT;
    A.sun.intensity=lerp(a.sun,b.sun,k)*(1-st.may*.45);A.sun.color.copy(cA.set(a.sc).lerp(cB.set(b.sc),k));A.hemi.intensity=lerp(a.hemi,b.hemi,k)*(1-st.may*.2);
    const el=lerp(a.el,b.el,k)*Math.PI/180,az=lerp(a.az,b.az,k)*Math.PI/180;A.sun.position.copy(camera.position).add(new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),-Math.cos(az)*Math.cos(el)).multiplyScalar(5000));A.sun.target.position.copy(camera.position);
    A.SKY.chieu.value=lerp(a.sky[0],b.sky[0],k);A.SKY.dem.value=lerp(a.sky[1],b.sky[1],k);A.SKY.sang.value=lerp(a.sky[2],b.sky[2],k);A.SKY.may.value=st.may;
    scene.fog.color.copy(cA.set(a.fog).lerp(cB.set(b.fog),k)).lerp(new THREE.Color(0x707680),st.rain*.4*(1-A.SKY.dem.value));const cd=D.lastT?camera.position.distanceTo(D.lastT):3000;scene.fog.density=.00009*st.fog*(1+st.rain*.8)*clamp(2600/Math.max(1,cd),.12,1.4);
    renderer.toneMappingExposure=lerp(a.exp,b.exp,k);A.rain.uA.value=st.rain;A.rain.uW.value=st.wind*1.5;
    D.env=st}
  // chớp và sấm (khi có giông)
  let lightning=0,nextBolt=3;
  function weatherTick(dt,st){A.rain.uT.value+=dt;const ctr=D.mode==='film'&&!D.userCam&&D.lastT?D.lastT:controls.target;const dd=camera.position.distanceTo(ctr);A.rain.uS.value=clamp(dd*.55,40,4500);A.rain.uC.value.copy(ctr).lerp(camera.position,.25);
    if(st.storm>0){nextBolt-=dt;if(nextBolt<=0){lightning=1;nextBolt=4+Math.random()*9;audio.thunder(.6+Math.random()*2)}}lightning=Math.max(0,lightning-dt*2.8);
    const fl=lightning>0?(Math.sin(lightning*40)>0?lightning:lightning*.3):0;A.SKY.flash.value=fl;if(fl>0){A.hemi.intensity+=fl*2.2}}

  /* ---------- hiệu ứng nổ (hàm của t) ---------- */
  function fxAt(t,dt,extraFx){A.FIRE.begin();A.SMOKE.begin();let fl=0;
    for(const f of flashes){const a=t-f.t;if(a<0||a>(f.big?1.2:.18))continue;const s=A.FIRE.take();if(!s)break;s.visible=true;s.position.copy(f.p);s.scale.setScalar(f.big?50:14);s.material.opacity=(1-a/(f.big?1.2:.18))*(f.big?.5:1)}
    for(const b of booms){const a=t-b.t;if(a<0||a>9)continue;if(a<.7){const s=A.FIRE.take();if(s){s.visible=true;s.position.copy(b.p);s.scale.setScalar(b.size*(.5+2*a/.7));s.material.opacity=(1-a/.7)*(b.big?.55:1);fl=Math.max(fl,(1-a/.7)*(b.big?1:.25))}}
      const m=A.SMOKE.take();if(m){m.visible=true;m.material.color.setScalar(1-A.SKY.dem.value*.8);const k=a/9;m.position.copy(b.p);m.position.y+=b.size*(b.big?5:2.2)*k;m.scale.setScalar(b.size*(1.3+(b.big?6:3.4)*k));m.material.opacity=.8*(1-k)}}
    if(extraFx)extraFx();A.FIRE.end();A.SMOKE.end();
    if(D.playing&&D.mode==='film'&&t>D.prevT&&t-D.prevT<1){for(const b of booms)if(b.t>D.prevT&&b.t<=t){if(b.big&&!D.blastDone){audio.blast();D.blastDone=true}else if(!b.big)audio.boom(camera.position.distanceTo(b.p),b.size/20)}
      for(const f of flashes)if(!f.big&&f.t>D.prevT&&f.t<=t&&Math.random()<.35)audio.boom(camera.position.distanceTo(f.p)+600,.6)}
    if(!booms.some(b=>b.big&&t-b.t>-1&&t-b.t<6))A.flashLight.intensity=Math.max(0,A.flashLight.intensity-dt*4e6)}

  /* ---------- áp cảnh tại thời điểm t (idempotent) ---------- */
  function evalScene(i,t,dt){const s=SCN[i];const ms=histMs(s,t);const base=stateLayers(ms);const L={...base};const Ls=s.layers;
    L.fort=Ls.fortifications===0?0:1;L.vn=Ls.vn?1:0;L.supply=Ls.vn?1:0;L.routes=Ls.routes?1:0;L.hq=s.hq?1:0;
    const act=n=>s.actions.find(a=>a.do===n);
    if(Ls.fortifications==='reveal'){const a=act('reveal');L.reveal=lerp(0,7200,clamp((t-a.t0)/(a.t1-a.t0),0,1))}
    if(typeof Ls.trenches_vn==='number')L.trench=Ls.trenches_vn;else if(Ls.trenches_vn==='grow'){const a=act('trench');L.trench=lerp(a.s0,a.s1,clamp((t-a.t0)/(a.t1-a.t0),0,1))}else L.trench=0;
    const fa=act('flag');L.flag=fa&&t>=fa.t?1:base.flag;L.coPhap=!(fa&&t>=fa.t)&&base.coPhap;
    const ca=act('control');if(ca&&LAYU.control){L.ctrl=1;const k=clamp((t-ca.t0)/(ca.t1-ca.t0),0,1);GU.uCtrl.value.set(PCp[0]-150,-(PCp[1]+150),lerp(ca.r0,ca.r1,k),1)}
    applyLayers(L);
    flag.visible=!!L.flag;if(flag.visible){const a=fa?t-fa.t:99;flag.userData.f.position.y=Math.min(8,1+Math.max(0,a)*1.6)}
    // màu trạng thái cứ điểm (ẩn trước khi có công sự); tóm tắt ba đợt ở cảnh 10
    const rc=act('recap');colorPlaces(ms,p=>{if(!L.fort||L.reveal<200||!LAYU.status)return 0;if(Ls.fortifications==='reveal')return clamp((L.reveal-Math.hypot(p.coordinates[0]-PCp[0],p.coordinates[1]-PCp[1]))/400,0,1);
      if(rc&&t>=rc.t0&&t<=rc.t1){const w=(t-rc.t0)/(rc.t1-rc.t0);const grp=p.sector==='NORTH'?0:['E1','E2','D1','C1','C2','F','A1'].includes(p.id)?1:2;const c=(w*3)-grp;return c>=0&&c<1?.6+.4*Math.sin(t*6):.35}return 1});
    const sec=act('sectors');A.LAY.sectors=!!(sec&&t>=sec.t0)||s.id==='C10';
    for(const l of A.labels)if(l.cls==='fr')l.force=(L.fort&&L.reveal>200&&LAYU.labels)?null:false;
    for(const a of actors)a.update(t);for(const a of arrows)a.update(t);
    if(s.hq){const ma=act('maptext');const k=ma?clamp((t-ma.t0)/6,0,1):0;if(A.mapCard.k!==k){A.mapCard.draw(k);A.mapCard.k=k}}
    // A1: trước / sau vụ nổ
    const bl=act('a1blast');const after=bl?t>=bl.t+.3:ms>=BLAST_MS;setA1(after);
    fxAt(t,dt,()=>{if(bl)lingerA1(t-bl.t-.3,1);else if(after&&ms<MS('1954-05-08'))lingerA1((ms-BLAST_MS)/1000/60,.6)});const st=envAt(s,t);applyEnv(st);return{st,ms}}

  /* ---------- giao diện ---------- */
  const ui={sub:$('sub'),title:$('stitle'),date:$('sdate'),bar:$('seek'),play:$('splay'),ret:$('sret'),fade:$('fade'),endt:$('endtitle')};
  const ticks=$('ticks');START.forEach(s=>{const i=document.createElement('i');i.style.left=(s/TOTAL*100)+'%';ticks.appendChild(i)});
  function setPlaying(p){D.playing=p;ui.play.textContent=p?'⏸':'▶';ui.play.setAttribute('aria-label',p?'Tạm dừng':'Phát');if(!p)voStop()}
  function goto(i,t=0){i=clamp(i,0,SCN.length-1);if(i!==D.i||!D.started){D.i=i;setupScene(i);D.blastDone=false}D.started=true;D.t=t;D.prevT=t;D.line=-2;D.blastDone=t>60&&SCN[i].id==='C08';
    const s=SCN[i];ui.title.textContent=`${s.id} · ${s.title}`;ui.date.textContent=s.date_label;$('snote').textContent=s.note||'';$('snote').hidden=!s.note;
    ui.endt.hidden=true;if(D.userCam&&D.mode==='film'){}renderSceneList()}
  $('splay').onclick=()=>{if(D.mode!=='film')setMode('film');if(!D.started)goto(0,0);setPlaying(!D.playing)};
  $('snext').onclick=()=>{if(D.mode!=='film')setMode('film');goto(D.i+1,0);setPlaying(true)};
  $('sprev').onclick=()=>{if(D.mode!=='film')setMode('film');goto(D.t>3?D.i:D.i-1,0);setPlaying(true)};
  ui.bar.oninput=()=>{if(D.mode!=='film')setMode('film');const T=ui.bar.value/1000*TOTAL;let i=0;while(i<SCN.length-1&&START[i+1]<=T)i++;goto(i,T-START[i])};
  $('sspeed').onchange=e=>{D.speed=+e.target.value};
  ui.ret.onclick=()=>{D.userCam=false;ui.ret.hidden=true;controls.enabled=false};
  canvas_on('pointerdown',()=>{if(D.mode==='film'&&!D.userCam){D.userCam=true;ui.ret.hidden=false;controls.enabled=true;controls.target.copy(D.lastT||controls.target)}});
  canvas_on('wheel',()=>{if(D.mode==='film'&&!D.userCam){D.userCam=true;ui.ret.hidden=false;controls.enabled=true;controls.target.copy(D.lastT||controls.target)}});
  function canvas_on(ev,f){document.getElementById('c').addEventListener(ev,f,{passive:true})}
  // danh sách cảnh
  function renderSceneList(){const ol=$('slist');ol.innerHTML='';SCN.forEach((s,i)=>{const li=document.createElement('li');const b=document.createElement('button');
    b.innerHTML=`<b>${s.id}</b>${s.title}<small>${s.date_label} · ${Math.floor(s.durationSec/60)}:${String(s.durationSec%60).padStart(2,'0')}</small>`;if(i===D.i)b.classList.add('on');
    b.onclick=()=>{$('scenes').hidden=true;if(D.mode!=='film')setMode('film');goto(i,0);setPlaying(true)};li.appendChild(b);ol.appendChild(li)})}
  $('bscenes').onclick=()=>{$('scenes').hidden=!$('scenes').hidden;renderSceneList()};$('scx').onclick=()=>$('scenes').hidden=true;
  // lớp
  const LAYER_UI=[['labels','Nhãn cứ điểm'],['status','Màu trạng thái'],['trenches','Chiến hào'],['wire','Dây thép gai'],['artillery','Pháo'],['vehicles','Xe, xe thồ'],['trees','Cây rừng'],['villages3d','Nhà sàn'],['attacks','Tuyến tiến công'],['control','Vùng kiểm soát'],['villages','Tên bản làng']];
  const lp=$('layers');LAYER_UI.forEach(([k,t])=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" ${(k==='villages'?A.LAY.villages:LAYU[k])?'checked':''}> ${t}`;
    l.querySelector('input').onchange=e=>{if(k==='villages')A.LAY.villages=e.target.checked;else if(k==='labels'){LAYU.labels=e.target.checked;A.LAY.labels=e.target.checked}else LAYU[k]=e.target.checked};lp.appendChild(l)});
  $('blayers').onclick=()=>{$('layerp').hidden=!$('layerp').hidden};
  $('blegend').onclick=()=>{$('legend').hidden=!$('legend').hidden};
  $('legend').querySelector('.items').innerHTML=Object.entries(A.STATE_VI).map(([k,v])=>`<div><i style="background:#${new THREE.Color(A.STATE_COL[k]).getHexString()}"></i>${v}</div>`).join('');
  // âm thanh, lời bình
  $('bsnd').onclick=e=>{e.currentTarget.classList.remove('hint');audio.enable(!audio.on);e.currentTarget.classList.toggle('on',audio.on);e.currentTarget.textContent=audio.on?'🔊 Âm thanh':'🔇 Âm thanh'};
  $('bvo').onclick=e=>{D.voice=!D.voice;e.currentTarget.classList.toggle('on',D.voice);if(!D.voice)voStop();else D.line=-2};
  // hotspot
  const SRC=Object.fromEntries(A.SOURCES.sources.map(s=>[s.id,s]));
  const fmtD=e=>{const d=new Date(e.ms);const dd=`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;return e.precision==='HOUR'?`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${dd}`:e.precision==='APPROXIMATE'?'khoảng '+dd:dd};
  A.onHotspot=p=>{const ms=D.mode==='film'?histMs(SCN[D.i],D.t):D.exploreMs;const st=A.stateAt(p.id,ms);const evs=A.EV.filter(e=>e.placeIds.includes(p.id));
    const conf={OSM_HIEN_DAI:'Theo vị trí di tích hiện nay (OpenStreetMap) — chưa đối chiếu bản đồ 1954',UOC_LUONG_ILLUSTRATIVE:'Ước lượng theo sơ đồ minh họa — MINH HỌA, chưa phải toạ độ lịch sử'}[p.confidence]||p.confidence;
    $('infobody').innerHTML=`<div class="eyebrow">${{NORTH:'Phân khu Bắc',CENTER:'Phân khu Trung tâm',SOUTH:'Phân khu Nam'}[p.sector]||''}</div><h2>${p.viName}</h2>${p.frName?`<p class="fr">Tên Pháp: ${p.frName}</p>`:''}
      <p><span class="st" style="background:#${new THREE.Color(A.STATE_COL[st]).getHexString()}"></span>${A.STATE_VI[st]} <small>(tại mốc đang xem)</small></p>
      <h4>Mốc sự kiện</h4>${evs.length?'<ul>'+evs.map(e=>`<li><b>${fmtD(e)}</b> — ${e.narrative} <span class="rv">Chưa thẩm định</span><br><small>Nguồn: ${e.sourceIds.map(s=>SRC[s]?SRC[s].ten:s).join('; ')}</small></li>`).join('')+'</ul>':'<p class="muted">Chưa có sự kiện đã nhập cho vị trí này.</p>'}
      <h4>Vị trí trên sa bàn</h4><p class="muted small">${conf}</p>`;
    $('info').hidden=false;if(D.mode==='film'&&D.playing){D.autoPaused=true;setPlaying(false)}};
  $('infox').onclick=()=>{$('info').hidden=true;if(D.autoPaused){D.autoPaused=false;setPlaying(true)}};

  /* ---------- chế độ ---------- */
  const MS0=MS('1953-11-01'),MS1=MS('1954-05-08');D.exploreMs=MS('1954-03-20');
  const VIEWS={'Toàn cảnh':['three_sectors_overview','C02'],'Phân khu Bắc':['north_overview','C05'],'Him Lam':['him_lam_close','C05'],'Độc Lập':['doc_lap_close','C05'],'Bản Kéo':['ban_keo_close','C05'],
    'Dãy đồi phía Đông':['east_ridge_wide','C06'],'Đồi A1':['A1_wide','C08'],'Sân bay':['airfield','C02'],'Hầm Đờ Cát':['hq_de_castries','C09'],'Cầu Mường Thanh':['bridge','C09'],'Hồng Cúm':['__south',''],'Trận địa pháo':['artillery_position','C04'],'Đường kéo pháo':['ridge_wide','C04']};
  const vb=$('views');for(const [name,[sid,scid]] of Object.entries(VIEWS)){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{
    let sh;if(sid==='__south')sh={target:[-841,-5878],tz:0,az:200,el:40,dist:2600,daz:0,dur:1,high:true,fov:40};else sh=SCN.find(s=>s.id===scid).shots.find(x=>x.id===sid);
    const P=poseOf(sh,0);safeEye(P.e,P.T,P.high);D.fly={t:0,e0:camera.position.clone(),t0:controls.target.clone(),e1:P.e,t1:P.T};for(const x of vb.children)x.classList.toggle('on',x===b)};vb.appendChild(b)}
  const ds=$('dslider');ds.min=MS0;ds.max=MS1;ds.step=3600e3;ds.value=D.exploreMs;
  const fmtMs=ms=>{const d=new Date(ms);return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`};
  ds.oninput=()=>{D.exploreMs=+ds.value;$('dlabel').textContent=fmtMs(D.exploreMs)};$('dlabel').textContent=fmtMs(D.exploreMs);
  // mốc so sánh
  const MARKS=[['1953-11-15','Trước chiến dịch Castor'],['1954-03-12','Trước ngày mở màn'],['1954-03-18','Sau đợt 1'],['1954-04-20','Đợt 2 · tháng 4'],['1954-05-07T18:00','Chiều 7/5/1954']];
  for(const id of['cmpA','cmpB']){const sel=$(id);MARKS.forEach(([d,t],k)=>{const o=document.createElement('option');o.value=d;o.textContent=t;sel.appendChild(o)});sel.value=MARKS[id==='cmpA'?1:4][0]}
  D.split=.5;const dv=$('divider');let drag=false;dv.addEventListener('pointerdown',e=>{drag=true;dv.setPointerCapture(e.pointerId)});
  dv.addEventListener('pointermove',e=>{if(drag){D.split=clamp(e.clientX/innerWidth,.05,.95);dv.style.left=(D.split*100)+'%'}});dv.addEventListener('pointerup',()=>drag=false);
  function setMode(m){D.mode=m;for(const b of document.querySelectorAll('#modes button'))b.classList.toggle('on',b.dataset.m===m);
    $('filmbar').hidden=m!=='film';if(m==='explore')ui.date.textContent='KHÁM PHÁ · CHỌN MỐC LỊCH SỬ';if(m==='compare')ui.date.textContent='SO SÁNH HAI MỐC';if(m==='film'&&SCN[D.i])ui.date.textContent=SCN[D.i].date_label;$('explorebar').hidden=m!=='explore';$('comparebar').hidden=m!=='compare';dv.hidden=m!=='compare';ui.sub.hidden=m!=='film';ui.endt.hidden=true;
    if(m!=='explore'&&W.on)setWalk(false);E.built=false;
    if(m!=='film'){setPlaying(false);clearActors();D.started=false;if(m==='explore')buildAmbient();controls.enabled=true;D.userCam=false;ui.ret.hidden=true;camera.fov=40;camera.updateProjectionMatrix();A.hq.visible=false;
      if(camera.position.x>20000){const P=poseOf(SCN[1].shots[2],0);safeEye(P.e,P.T,true);camera.position.copy(P.e);controls.target.copy(P.T)}}
    else{controls.enabled=D.userCam;if(!D.started)goto(D.i,D.t)}}
  for(const b of document.querySelectorAll('#modes button'))b.onclick=()=>setMode(b.dataset.m);

  /* ---------- KHÁM PHÁ: các khu có người hoạt động, đi bộ bằng một người lính ---------- */
  const AREAS=[['Đoàn xe thồ',[3480,2860],'xe'],['Kéo pháo lên đồi',null,'kp'],['Trận địa pháo Him Lam',[3150,3940]],['Quân Pháp tập kết',[PCp[0]-40,PCp[1]+110]],
    ['Đồi A1',[A1p[0]+70,A1p[1]-60]],['Hầm Đờ Cát',[PCp[0]+30,PCp[1]+25]],['Cầu Mường Thanh',[-600,-505]],['Sân bay',[-1480,-90]],['Him Lam',[860,1380]]];
  function buildAmbient(){clearActors();E.built=true;
    xeTho('Duong_XeTho_TiepTe',A.MOBILE?8:16,9,1.3,0,1e9,0);xeTho('Duong_XeTho_Bac',A.MOBILE?3:6,9,1.3,0,1e9);
    D.kp=keoPhao('Duong_KeoPhao_DongBac','Phao_M101_105',ROUTE.Duong_KeoPhao_DongBac?ROUTE.Duong_KeoPhao_DongBac.len*.5:0,.45,0,1e9,true);
    keoPhao('Duong_KeoPhao_Dong','SonPhao_75',ROUTE.Duong_KeoPhao_Dong?ROUTE.Duong_KeoPhao_Dong.len*.5:0,.4,0,1e9,true);
    E.vn=actors.slice();frCamp();E.fr=actors.slice(E.vn.length);a1Garrison(1e9);E.garrison=actors.slice(-10)}
  function areaPos(a){if(a[2]==='kp'&&D.kp){D.kp.update(E.t);return D.kp.center.clone().addScaledVector(new THREE.Vector3(Math.sin(D.kp.heading),0,-Math.cos(D.kp.heading)),-14)}
    const [x,y]=a[1];return B(x,y,hAt(x,y))}
  function setWalk(on,at){W.on=on;$('bwalk').classList.toggle('on',on);$('bwalk').textContent=on?'🚶 Đang đi bộ · thoát':'🚶 Xuống đi bộ';$('joy').hidden=!(on&&A.MOBILE);$('walkhelp').hidden=!on;
    if(on){if(!W.av){W.av=A.makeChar('bodoi','dung');scene.add(W.av.obj)}W.av.obj.visible=true;const p=at||areaPos(AREAS[0]);W.pos.copy(p);W.pos.y=A.hT(p.x,p.z);
      controls.autoRotate=false;controls.minDistance=2.5;controls.maxDistance=60;controls.target.copy(W.pos).add(new THREE.Vector3(0,1.5,0));
      camera.position.copy(controls.target).add(new THREE.Vector3(-6,3.2,7));D.fly=null}
    else{if(W.av)W.av.obj.visible=false;controls.minDistance=3;controls.maxDistance=18000}}
  const camF=new THREE.Vector3(),camR=new THREE.Vector3(),mv=new THREE.Vector3();
  function walkTick(dt){const k=W.keys;let f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0)-W.joy.y,r=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0)+W.joy.x;
    const run=k.ShiftLeft||k.ShiftRight||Math.hypot(W.joy.x,W.joy.y)>.85;const m=Math.min(1,Math.hypot(f,r));
    camera.getWorldDirection(camF);camF.y=0;camF.normalize();camR.set(-camF.z,0,camF.x);mv.set(0,0,0).addScaledVector(camF,f).addScaledVector(camR,r);
    if(m>.05){mv.normalize();const sp=run?4.2:1.7;const old=W.pos.clone();W.pos.addScaledVector(mv,sp*dt*m);W.pos.y=A.hT(W.pos.x,W.pos.z);
      const d=W.pos.clone().sub(old);camera.position.add(d);controls.target.add(d);W.yaw=Math.atan2(mv.x,mv.z);W.av.play(run?'chay':'di_bo')}else W.av.play('dung');
    W.av.obj.position.copy(W.pos);const dy=((W.yaw-W.av.obj.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI;W.av.obj.rotation.y+=dy*Math.min(1,dt*10);W.av.mixer.update(dt*(run?1.15:1));
    controls.target.y+=(W.pos.y+1.5-controls.target.y)*Math.min(1,dt*8)}
  addEventListener('keydown',e=>{if(W.on&&!e.target.closest('input,select')){W.keys[e.code]=true;if(e.code.startsWith('Arrow'))e.preventDefault()}});
  addEventListener('keyup',e=>{W.keys[e.code]=false});
  {const jb=$('joy'),jk=jb.firstElementChild;let id=null;jb.addEventListener('pointerdown',e=>{id=e.pointerId;jb.setPointerCapture(id)});
    jb.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;const r=jb.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}W.joy.x=x;W.joy.y=y;jk.style.transform=`translate(${x*35}px,${y*35}px)`});
    jb.addEventListener('pointerup',()=>{id=null;W.joy.x=W.joy.y=0;jk.style.transform=''})}
  $('bwalk').onclick=()=>setWalk(!W.on);
  const ab=$('areas');for(const a of AREAS){const b=document.createElement('button');b.textContent=a[0];b.onclick=()=>{
    if(W.on)setWalk(true,areaPos(a));else{const p=areaPos(a);const e=p.clone().add(new THREE.Vector3(-90,70,110));safeEye(e,p,false);D.fly={t:0,e0:camera.position.clone(),t0:controls.target.clone(),e1:e,t1:p}}
    for(const x of ab.children)x.classList.toggle('on',x===b)};ab.appendChild(b)}
  controls.addEventListener('start',()=>{E.idle=0;controls.autoRotate=false});

  /* ---------- lời bình: tệp audio/voice/<cảnh>-<số dòng>.mp3 nếu có, nếu không dùng giọng đọc tiếng Việt của thiết bị ---------- */
  const VO={el:null,files:new Set()};fetch('audio/voice/index.json').then(r=>r.ok?r.json():[]).then(a=>VO.files=new Set(a)).catch(()=>{});
  function voStop(){if(VO.el){VO.el.pause();VO.el=null}try{speechSynthesis.cancel()}catch(e){}}
  function speak(s,n){voStop();if(!D.voice||n<0||!D.playing)return;const tx=s.lines[n].text;const f=`${s.id}-${String(n+1).padStart(2,'0')}.mp3`;
    if(VO.files.has(f)){VO.el=new Audio('audio/voice/'+f);VO.el.play().catch(()=>{});return}
    if(!('speechSynthesis' in window))return;const u=new SpeechSynthesisUtterance(tx.replace(/[“”"…·()]/g,' '));u.lang='vi-VN';const v=speechSynthesis.getVoices().find(v=>/^vi/i.test(v.lang));if(v)u.voice=v;u.rate=1.02;speechSynthesis.speak(u)}
  const lineAt=(s,t)=>{let n=-1;s.lines.forEach((l,k)=>{if(l.t<=t)n=k});return n};

  /* ---------- âm thanh theo cảnh ---------- */
  const BATTLE={C05:.8,C06:1,C07:.6,C08:.7,C09:.5};
  function audioMix(s,st,t){const night=A.SKY.dem.value;const pl=extra.filter(o=>o.visible&&/C47|Dakota/i.test(o.name||'')||false);let plane=0;
    for(const o of extra){if(!o.visible||!o.isObject3D)continue;if(o.children.length&&o.userData.isPlane)plane=Math.max(plane,1-camera.position.distanceTo(o.position)/2500)}
    if(s.id==='C02'&&t<44||s.id==='C07'&&t>26&&t<74)plane=Math.max(plane,.6);
    audio.set({wind:st.wind,rain:st.rain,birds:(st.birds||0)*(1-night),insects:night*.8,battle:(BATTLE[s.id]||0)*(s.id==='C09'?clamp(1-(t-60)/20,0,1):1),plane})}

  /* ---------- vòng lặp ---------- */
  const tmpE=new THREE.Vector3();
  A.tick.push(dt=>{
    if(D.mode==='film'){if(!D.started){goto(0,0)}
      const s=SCN[D.i];if(D.playing){D.t+=dt*D.speed;if(D.t>=s.durationSec){if(D.i<SCN.length-1){goto(D.i+1,0);return}D.t=s.durationSec;setPlaying(false)}}
      const {st}=evalScene(D.i,D.t,dt);
      const P=camAt(s,D.t);D.lastT=P.T;
      if(!D.userCam){camera.position.copy(P.e);if(D.shake){camera.position.x+=(Math.random()-.5)*D.shake;camera.position.y+=(Math.random()-.5)*D.shake}camera.lookAt(P.T);if(Math.abs(camera.fov-P.fov)>.01){camera.fov=P.fov;camera.updateProjectionMatrix()}ui.fade.style.opacity=P.cutFade}
      else{controls.update();clampCam();ui.fade.style.opacity=0}
      weatherTick(dt,st);audioMix(s,st,D.t);audio.tick(dt);
      const n=lineAt(s,D.t);if(n!==D.line){D.line=n;speak(s,n);ui.sub.innerHTML=n>=0?s.lines[n].text:'';ui.sub.hidden=n<0}
      const ea=s.actions.find(a=>a.do==='endtitle');ui.endt.hidden=!(ea&&D.t>=ea.t0);
      ui.bar.value=Math.round((START[D.i]+D.t)/TOTAL*1000);$('stime').textContent=`${Math.floor((START[D.i]+D.t)/60)}:${String(Math.floor((START[D.i]+D.t)%60)).padStart(2,'0')} / ${Math.floor(TOTAL/60)}:${String(TOTAL%60).padStart(2,'0')}`;
      D.prevT=D.t;
      A.renderer.setScissorTest(false);A.renderer.render(scene,camera);A.updLabels(camera);return}
    // khám phá / so sánh: trạng thái theo mốc lịch sử
    if(D.fly){D.fly.t+=dt/2.2;const k=ease(Math.min(1,D.fly.t));camera.position.lerpVectors(D.fly.e0,D.fly.e1,k);controls.target.lerpVectors(D.fly.t0,D.fly.t1,k);tmpE.copy(camera.position);safeEye(tmpE,controls.target,false);camera.position.y=Math.max(camera.position.y,tmpE.y);if(D.fly.t>=1)D.fly=null}
    if(D.mode==='explore'){E.t+=dt;for(const a of actors)a.update(E.t);const pre=D.exploreMs<BLAST_MS;for(const g of E.garrison||[])if(!pre)g.obj.visible=false;
      const frOn=D.exploreMs>=CASTOR&&D.exploreMs<FLAG,vnOn=D.exploreMs>=MS('1954-02-01');for(const a of E.fr||[])if(!frOn)a.obj.visible=false;for(const a of E.vn||[])if(!vnOn)a.obj.visible=false;
      if(W.on)walkTick(dt);else{E.idle+=dt;if(E.idle>7&&!D.fly){controls.autoRotate=true;controls.autoRotateSpeed=.35}}}
    controls.update();clampCam();
    const st={todA:'ngay',todB:'ngay',kT:1,rain:0,wind:.4,fog:1,may:.3,storm:0};applyEnv(st);weatherTick(dt,st);audio.set({wind:.4,rain:0,birds:.4,insects:0,battle:0,plane:0});audio.tick(dt);
    const R=A.renderer,SW=innerWidth,SH=innerHeight;
    if(D.mode==='explore'){applyMs(D.exploreMs);A.FIRE.begin();A.SMOKE.begin();if(D.exploreMs>=BLAST_MS&&D.exploreMs<MS('1954-05-08'))lingerA1(E.t,.8);A.FIRE.end();A.SMOKE.end();R.setScissorTest(false);R.render(scene,camera)}
    else{const ma=MS($('cmpA').value),mb=MS($('cmpB').value);const x=Math.round(SW*D.split);R.setScissorTest(true);
      applyMs(ma);R.setScissor(0,0,x,SH);R.setViewport(0,0,SW,SH);R.render(scene,camera);applyMs(mb);R.setScissor(x,0,SW-x,SH);R.render(scene,camera);R.setScissorTest(false)}
    A.updLabels(camera)});
  function applyMs(ms){const L=stateLayers(ms);applyLayers(L);setA1(ms>=BLAST_MS);flag.visible=!!L.flag;flag.userData.f.position.y=8;colorPlaces(ms);for(const l of A.labels)if(l.cls==='fr')l.force=L.fort&&LAYU.labels?null:false;A.LAY.sectors=false}
  // không cho camera người dùng chui xuống đất
  function clampCam(){const g=A.hT(camera.position.x,camera.position.z)+2;if(camera.position.y<g&&camera.position.x<20000)camera.position.y=g}
  // cờ phấp phới
  A.tick.push(()=>{if(!flag.visible)return;const f=flag.userData.f,p=f.geometry.attributes.position;const tt=performance.now()/300;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(x*2.4-tt)*.18*(x+1.35)/2.7)}p.needsUpdate=true});
  addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();$('splay').click()}else if(e.code==='PageDown')$('snext').click();else if(e.code==='PageUp')$('sprev').click()});
  setMode('film');goto(0,0);setPlaying(true);
  // gợi ý bật âm thanh (trình duyệt chỉ cho phát tiếng sau khi người xem bấm)
  $('bsnd').classList.add('hint');
  window.__DIR={D,goto,setMode,SCN,evalScene,camAt,setPlaying};
}
