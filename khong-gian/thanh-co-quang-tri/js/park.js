/* Thành cổ hôm nay — công viên tưởng niệm (chỉ hiện ở phân cảnh cuối, trạng thái 'memorial').
   Dựng theo ảnh chụp trên cao hiện nay (dạng biểu tượng, không đo đạc): bãi cỏ phủ kín trong thành, trục đường Bắc–Nam
   xuyên thành, quảng trường tròn với Đài tưởng niệm ở giữa, đường dạo lát gạch đỏ từ cổng Tây vào quảng trường,
   lối đi uốn lượn, hàng dừa sát chân thành, các lùm cây, vài công trình mái ngói đỏ, cầu bắc qua hào ở bốn cổng.
   Mặt đất trong thành được san phẳng (hố bom 1972 lấp đầy) khi vào chế độ này và trả lại nguyên trạng khi rời đi. */
import * as THREE from 'three';

export function makePark({scene,B,groundAt,ground,MOBILE,walls=[],brickTex=null}){
  const R=(a,b)=>a+Math.random()*(b-a);
  const LEVEL=.9,IN=236,EDGE=12;                      // độ cao bãi cỏ (m), nửa cạnh vùng san phẳng, dải chuyển tiếp
  const gatePass=(x,y)=>(Math.abs(y)<9&&Math.abs(x)<258)||(Math.abs(x)<9&&Math.abs(y)<258);   // lối qua 4 cổng: phẳng ngang bãi cỏ
  const wFlat=(x,y)=>{if(gatePass(x,y))return 1;const m=Math.max(Math.abs(x),Math.abs(y));return m<=IN-EDGE?1:m>=IN?0:(IN-m)/EDGE};
  const H=(x,y)=>{const g=groundAt(x,y),w=wFlat(x,y);return g+(LEVEL-g)*w};
  let MON=null;const G=new THREE.Group();G.name='ThanhCo_HomNay';G.visible=false;scene.add(G);

  /* ---- san phẳng địa hình trong thành ---- */
  let orig=null,origN=null,flatY=null;
  function prepFlat(){if(!ground||flatY)return;const P=ground.geometry.attributes.position,n=P.count;ground.updateMatrixWorld(true);
    orig=new Float32Array(n);origN=ground.geometry.attributes.normal.array.slice();flatY=new Float32Array(n);
    const sc=ground.scale.y||1,oy=ground.position.y,v=new THREE.Vector3();
    for(let i=0;i<n;i++){const y=P.getY(i);orig[i]=y;v.fromBufferAttribute(P,i).applyMatrix4(ground.matrixWorld);const bx=v.x,by=-v.z;const w=wFlat(bx,by);
      flatY[i]=w>0?y+((LEVEL-oy)/sc-y)*w:y}}
  let flat=false;
  function setFlat(on){if(!ground||on===flat)return;prepFlat();flat=on;const g=ground.geometry,P=g.attributes.position;
    for(let i=0;i<P.count;i++)P.setY(i,on?flatY[i]:orig[i]);P.needsUpdate=true;
    if(on){g.computeVertexNormals()}else{g.attributes.normal.array.set(origN);g.attributes.normal.needsUpdate=true}}

  /* ---- vật liệu ---- */
  const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.95},o));
  const M_PATH=mat(0xcfc6b2,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
        M_BRICK=mat(0xb8705f,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
        M_LAWN=mat(0x6f9a3e,{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),
        M_WHITE=mat(0xe9e4d6,{roughness:.7}),M_STONE=mat(0xa9a397,{roughness:.85}),M_ROOF=mat(0xa4472f,{roughness:.8,flatShading:true}),
        M_WALL=mat(0xeadfc4,{roughness:.9}),M_GOLD=mat(0xc8a24a,{roughness:.45,metalness:.5});

  /* ---- dải đường (bám mặt đất đã san) ---- */
  function strips(list,M,lift=.16){const pos=[],idx=[];
    for(const {pts,w,closed,poly} of list){let P=pts.map(p=>new THREE.Vector2(p[0],p[1]));
      if(poly){const Q=[];for(let i=0;i<P.length-1;i++){const n=Math.max(1,Math.round(P[i].distanceTo(P[i+1])/3));for(let k=0;k<n;k++)Q.push(P[i].clone().lerp(P[i+1],k/n))}Q.push(P[P.length-1]);P=Q}
      else if(P.length>2){const c=new THREE.SplineCurve(closed?[...P,P[0]]:P);const L=c.getLength();P=c.getSpacedPoints(Math.max(2,Math.round(L/3)))}
      const base=pos.length/3;
      for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let tx=b.x-a.x,ty=b.y-a.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;const nx=-ty*w/2,ny=tx*w/2;
        for(const s of [1,-1]){const x=P[i].x+nx*s,y=P[i].y+ny*s;const v=B(x,y,H(x,y)+lift);pos.push(v.x,v.y,v.z)}}
      for(let i=0;i<P.length-1;i++){const k=base+i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,M);m.receiveShadow=!MOBILE;G.add(m);return m}
  function disc(x,y,r0,r1,M,lift,seg=48){const g=new THREE.RingGeometry(r0,r1,seg,1);g.rotateX(-Math.PI/2);const p=g.attributes.position;
    for(let i=0;i<p.count;i++){const bx=x+p.getX(i),by=y-p.getZ(i);p.setY(i,H(bx,by)+lift)}g.translate(x,0,-y);g.computeVertexNormals();const m=new THREE.Mesh(g,M);m.receiveShadow=!MOBILE;G.add(m);return m}

  {const S=244,N=MOBILE?48:96;const g=new THREE.PlaneGeometry(S*2,S*2,N,N);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=[],c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=-p.getZ(i);p.setY(i,H(x,y)+.05);
      const n=.5+.25*Math.sin(x*.045+y*.03)*Math.cos(y*.05-x*.02)+.15*Math.sin(x*.21+y*.17);c.setHSL(.25+n*.03,.42+n*.1,.18+n*.06);col.push(c.r,c.g,c.b)}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.receiveShadow=!MOBILE;G.add(m)}   // bãi cỏ xanh trong thành
  // trục Bắc–Nam xuyên thành, đường dạo lát gạch đỏ cổng Tây → quảng trường, lối sang cổng Đông, đường vòng sát chân thành
  strips([{pts:[[0,-257],[0,-36]],w:6},{pts:[[0,36],[0,257]],w:6},{pts:[[36,0],[257,0]],w:4.5},
          {pts:[[-222,-222],[222,-222],[222,222],[-222,222],[-222,-222]],w:3,poly:true}],M_PATH);
  strips([{pts:[[-257,0],[-34,0]],w:15}],M_BRICK);
  // lối đi uốn lượn giữa các bãi cỏ (theo nét chung trong ảnh)
  strips([
    {pts:[[-210,40],[-160,70],[-120,140],[-70,185],[-20,150],[-40,80],[-100,40],[-160,30]],w:2.6,closed:true},
    {pts:[[-200,200],[-150,160],[-120,140]],w:2.4},{pts:[[-6,110],[-40,80]],w:2.4},
    {pts:[[20,40],[70,90],[130,120],[205,105]],w:2.6},{pts:[[50,210],[90,160],[150,70],[215,40]],w:2.6},{pts:[[120,215],[130,120]],w:2.4},
    {pts:[[-25,-30],[-70,-70],[-140,-80],[-205,-150]],w:2.6},{pts:[[-125,-25],[-115,-120],[-60,-200]],w:2.6},{pts:[[-205,-60],[-115,-120]],w:2.4},
    {pts:[[25,-30],[85,-55],[150,-115],[205,-205]],w:2.6},{pts:[[55,-150],[115,-175],[185,-95],[212,-40]],w:2.6},{pts:[[6,-110],[55,-150]],w:2.4}],M_PATH,.14);
  disc(-75,130,6,8.4,M_PATH,.15,28);   // vòng tròn nhỏ ở góc Tây Bắc

  /* ---- quảng trường tròn + Đài tưởng niệm (vị trí theo OpenStreetMap: giữa thành), dựng phỏng theo ảnh:
     gò cỏ tròn có bậc lên bốn phía, sân đá hồng có lan can; trên sân một bồn tròn (thành đá xám, dải hoa văn vàng, vòng nước xanh);
     trong bồn: tháp biểu tượng bằng đồng hình nén hương (bầu, đĩa, thân chạm, búp sen đỏ trên đỉnh) và lầu hương mái ngói vàng. Kích thước ước theo người trong ảnh. ---- */
  disc(0,0,19.5,36,M_BRICK,.2,72);
  {const g0=H(0,0),HM=4.2;const D=new THREE.Group();D.position.copy(B(0,0,g0));
    const M_GRASS=mat(0x5f8f34,{roughness:1}),M_PINK=mat(0xc79a8a,{roughness:.7}),M_RAIL=mat(0x8e5a3c,{roughness:.8}),M_GREY=mat(0x9b9890,{roughness:.85}),
      M_BRONZE=mat(0xa8713c,{roughness:.42,metalness:.55}),M_LOTUS=mat(0x8a2f22,{roughness:.5,metalness:.3}),M_WATER=mat(0x3f9cc8,{roughness:.15,metalness:.1,emissive:0x0b2a3a}),
      M_YROOF=mat(0xd9a33c,{roughness:.55,flatShading:true}),M_RED=mat(0x9e3a26,{roughness:.6});
    const add=(geo,M,x,y,z)=>{const m=new THREE.Mesh(geo,M);m.position.set(x,y,z);m.castShadow=m.receiveShadow=!MOBILE;D.add(m);return m};
    // gò cỏ: mặt trên phẳng r 13,6 cao 4,2 m, sườn thoải tới r 19,5
    add(new THREE.LatheGeometry([[0,HM],[13.6,HM],[14.2,HM-.25],[17.5,1.4],[19.6,0],[19.6,-.4]].map(([r,y])=>new THREE.Vector2(r,y)),48),M_GRASS,0,0,0);
    add(new THREE.CylinderGeometry(13.8,13.8,.22,48),M_PINK,0,HM+.11,0);
    // lan can quanh sân trên (chừa bốn lối bậc)
    for(let k=0;k<4;k++){const a0=k*Math.PI/2+.17,a1=a0+Math.PI/2-.34;const tor=new THREE.TorusGeometry(13.5,.09,4,24,a1-a0);tor.rotateX(Math.PI/2);tor.rotateY(-a0);const t=add(tor,M_RAIL,0,HM+.95,0);
      for(let a=a0;a<=a1+1e-3;a+=(a1-a0)/8)add(new THREE.BoxGeometry(.22,.85,.22),M_RAIL,Math.cos(a)*13.5,HM+.55,-Math.sin(a)*13.5)}
    // bậc lên bốn phía (theo các trục đường)
    for(let k=0;k<4;k++){const a=k*Math.PI/2;const st=new THREE.Group();st.rotation.y=a;D.add(st);const NS=14;
      for(let i=0;i<NS;i++){const r0=19.8-i*(5.7/NS),hh=(i+1)*HM/NS;const b=new THREE.Mesh(new THREE.BoxGeometry(5.7/NS+.02,hh,3.6),M_PINK);b.position.set(r0-5.7/NS/2,hh/2,0);b.receiveShadow=!MOBILE;st.add(b)}
      for(const sd of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(6.2,.5,.3),M_RAIL);w.position.set(16.9,HM/2+.35,sd*1.95);w.rotation.z=-Math.atan2(HM,5.7);st.add(w)}}
    // bồn tròn trên sân
    const BY=HM+.22;add(new THREE.CylinderGeometry(6.6,6.8,1.3,48,1,true),M_GREY,0,BY+.65,0);add(new THREE.CylinderGeometry(6.35,6.35,1.3,48,1,true),M_GREY,0,BY+.65,0).material=M_GREY;
    add(new THREE.CylinderGeometry(6.62,6.62,.3,48,1,true),M_BRONZE,0,BY+.9,0);   // dải hoa văn vàng
    add(new THREE.TorusGeometry(6.5,.18,4,48).rotateX(Math.PI/2),M_PINK,0,BY+1.32,0);
    add(new THREE.RingGeometry(4.2,6.35,48).rotateX(-Math.PI/2),M_WATER,0,BY+.95,0);
    add(new THREE.CylinderGeometry(4.2,4.2,1.15,40),M_PINK,0,BY+.58,0);
    // tháp biểu tượng (đồng): bầu, đĩa, thân, búp sen
    const TX=1.5,TZ=.6,T0=BY+1.15;
    add(new THREE.CylinderGeometry(1.15,1.3,.5,24),M_BRONZE,TX,T0+.25,TZ);
    add(new THREE.SphereGeometry(1.05,24,16).scale(1,1.25,1),M_BRONZE,TX,T0+1.55,TZ);
    add(new THREE.CylinderGeometry(.45,.6,1.4,20),M_BRONZE,TX,T0+3.1,TZ);
    add(new THREE.CylinderGeometry(2.1,1.2,.32,32),M_BRONZE,TX,T0+3.95,TZ);   // đĩa
    add(new THREE.CylinderGeometry(.62,.62,.4,20),M_BRONZE,TX,T0+4.3,TZ);
    const SH=11.5;add(new THREE.CylinderGeometry(.5,.56,SH,20),M_BRONZE,TX,T0+4.5+SH/2,TZ);
    for(let k=0;k<7;k++)add(new THREE.TorusGeometry(.56,.06,6,20).rotateX(Math.PI/2),M_BRONZE,TX,T0+5+k*1.6,TZ);   // vòng chạm
    add(new THREE.CylinderGeometry(.7,.55,.5,20),M_BRONZE,TX,T0+4.5+SH+.25,TZ);
    const bud=add(new THREE.SphereGeometry(.72,20,14).scale(1,1.6,1),M_LOTUS,TX,T0+4.5+SH+1.4,TZ);
    add(new THREE.ConeGeometry(.3,.7,12),M_LOTUS,TX,T0+4.5+SH+2.7,TZ);
    // lầu hương: 4 cột đỏ, mái ngói vàng cong, lư hương đồng
    const PX=-1.7,PZ=-.8,P0=BY+1.15;for(const [dx,dz] of [[-1.15,-1.15],[1.15,-1.15],[-1.15,1.15],[1.15,1.15]])add(new THREE.CylinderGeometry(.14,.16,2.7,10),M_RED,PX+dx,P0+1.35,PZ+dz);
    add(new THREE.BoxGeometry(2.7,.25,2.7),M_RED,PX,P0+2.75,PZ);
    const roof=new THREE.ConeGeometry(2.6,1.25,4,1).rotateY(Math.PI/4);{const p=roof.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<0){p.setY(i,y+.25*Math.max(Math.abs(p.getX(i)),Math.abs(p.getZ(i)))/1.84)}}roof.computeVertexNormals()}   // đầu đao cong lên
    add(roof,M_YROOF,PX,P0+3.45,PZ);add(new THREE.BoxGeometry(1.6,.22,.22),M_YROOF,PX,P0+4.12,PZ);
    for(const dx of [-.8,.8])add(new THREE.SphereGeometry(.16,8,6),M_YROOF,PX+dx,P0+4.3,PZ);
    add(new THREE.CylinderGeometry(.45,.32,.55,16),M_BRONZE,PX,P0+.28,PZ);add(new THREE.CylinderGeometry(.5,.5,.08,16),M_BRONZE,PX,P0+.58,PZ);
    D.userData={top:g0+HM+.22,basin:6.8,bowl:[PX,PZ]};G.add(D);MON=D}

  /* ---- công trình mái ngói đỏ (nhà trưng bày, nhà khách, đền thờ…) — dạng biểu tượng ---- */
  const geoBox=new THREE.BoxGeometry(1,1,1).translate(0,.5,0),geoHip=new THREE.ConeGeometry(.7071,1,4,1).rotateY(Math.PI/4).translate(0,.5,0);
  const BLD=[[-222,26,10,26,4,0],[-222,-28,10,22,4,0],[-196,-34,18,8,3.6,0],[-60,-118,16,16,5,0],[78,22,22,10,4.2,0],[118,30,12,12,4.4,0],[132,-6,16,9,4,0],[-40,214,14,9,3.8,0]];
  const IBW=new THREE.InstancedMesh(geoBox,M_WALL,BLD.length),IBR=new THREE.InstancedMesh(geoHip,M_ROOF,BLD.length);
  {const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3();
   BLD.forEach(([x,y,w,d,h],i)=>{const g=H(x,y);v.copy(B(x,y,0));v.y=g-.2;s.set(w,h+.2,d);m4.compose(v,q,s);IBW.setMatrixAt(i,m4);
     v.y=g+h;s.set(w*1.22,Math.min(w,d)*.3,d*1.16);m4.compose(v,q,s);IBR.setMatrixAt(i,m4)});
   for(const im of [IBW,IBR]){im.castShadow=im.receiveShadow=!MOBILE;im.computeBoundingSphere();G.add(im)}}
  // sân lát trước các công trình
  strips([{pts:[[-208,-14],[-208,14]],w:6},{pts:[[-60,-104],[-60,-60],[-10,-30]],w:3},{pts:[[78,10],[100,0]],w:3}],M_PATH,.15);

  /* ---- cầu qua hào ở bốn cổng: từ mép trong hào (≈256 m, ngang lối cổng) dốc nhẹ xuống bờ ngoài (≈308 m) ---- */
  {const M=mat(0xbdb5a5,{roughness:.9});for(const [sx,sy] of [[-1,0],[1,0],[0,1],[0,-1]]){
    const r0=255,r1=309,L=r1-r0,y0=LEVEL+.12,y1=Math.max(groundAt(sx*r1,sy*r1),-.2)+.15;const br=new THREE.Group();const c=B(sx*(r0+r1)/2,sy*(r0+r1)/2,(y0+y1)/2);br.position.copy(c);
    br.rotation.y=Math.atan2(sx,-sy)-Math.PI/2;const tilt=Math.atan2(y1-y0,L);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(L+.2,.5,8),M);deck.rotation.z=tilt;deck.castShadow=deck.receiveShadow=!MOBILE;br.add(deck);
    for(const sd of [-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(L,.85,.25),M_WHITE);r.position.set(0,.65,sd*3.9);r.rotation.z=deck.rotation.z;br.add(r)}
    for(const t of [-.3,0,.3]){const p=new THREE.Mesh(new THREE.BoxGeometry(1.1,3.2,6.5),M_STONE);p.position.set(t*L,-1.8,0);br.add(p)}
    G.add(br)}}

  /* ---- cây: hàng dừa sát chân thành + lùm cây tán tròn ---- */
  const nearPath=(x,y)=>Math.abs(x)<7||(Math.abs(y)<26&&x<0)||(Math.abs(y)<5&&x>0)||Math.hypot(x,y)<40||Math.abs(Math.abs(x)-222)<4||Math.abs(Math.abs(y)-222)<4||
    BLD.some(([bx,by,w,d])=>Math.abs(x-bx)<w/2+5&&Math.abs(y-by)<d/2+5);
  const palms=[],trees=[];
  const sideRows=[[229,5.5],[220,6],[211,6.5]];   // hai hàng dừa trong chân thành (theo ảnh: dày nhất ở mặt Nam và mặt Bắc)
  for(const [d,sp] of sideRows)for(let t=-d;t<=d;t+=sp*(MOBILE?1.6:1)){
    for(const [x,y] of [[t,-d],[t,d],[-d,t],[d,t]]){if(Math.abs(x)<10&&Math.abs(y)>200||Math.abs(y)<12&&Math.abs(x)>200)continue;if(d<215&&Math.abs(x)>Math.abs(y)&&Math.random()<.6)continue;
      palms.push([x+R(-1,1),y+R(-1,1),R(8,12)])}}
  // dừa dọc trục đường, hai bên đường dạo
  for(let y=-236;y<=236;y+=11)if(Math.abs(y)>34){palms.push([-6.5,y,R(8,11)]);palms.push([6.5,y,R(8,11)])}
  // lùm cây tán tròn: dày ở các góc (như ảnh), rải trên bãi cỏ
  const CL=[[-180,180,40,46],[160,170,46,40],[-170,-175,48,60],[175,-170,40,50],[-90,-150,40,30],[60,-90,40,40],[140,80,30,40],[-120,90,30,26],[-40,170,26,30],[70,150,30,26]];
  for(const [cx,cy,rx,ry,] of CL){const n=MOBILE?Math.round(rx*ry/90):Math.round(rx*ry/26);for(let k=0;k<n;k++){const a=R(0,6.28),r=Math.sqrt(Math.random());const x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r;
      if(Math.abs(x)>208||Math.abs(y)>208||nearPath(x,y))continue;trees.push([x,y,R(8,13),R(3.8,6.2)])}}
  for(let k=0;k<(MOBILE?90:240);k++){const x=R(-205,205),y=R(-205,205);if(nearPath(x,y))continue;trees.push([x,y,R(7,12),R(3,5.4)])}
  // cây ven quảng trường
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2+.2;const x=Math.cos(a)*34,y=Math.sin(a)*34;if(Math.abs(y)<12&&x<0||Math.abs(x)<8)continue;trees.push([x,y,R(6,8),R(2.2,3)])}

  const trunk=new THREE.CylinderGeometry(.16,.24,1,5).translate(0,.5,0);
  // tán dừa: hình sao 8 cánh rủ xuống
  const crown=new THREE.ConeGeometry(1,.45,16,1,true).translate(0,-.22,0);{const p=crown.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-.3){const k=i%2?1:.38;p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);p.setY(i,y-(i%2?.25:0))}}crown.computeVertexNormals()}
  const ball=new THREE.IcosahedronGeometry(1,2);{const p=ball.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.12*Math.sin(x*11+y*7)*Math.cos(z*9-y*5);p.setXYZ(i,x*f,y*f,z*f)}ball.computeVertexNormals()}
  const M_TR=mat(0x6e604c,{roughness:1}),M_PL=mat(0xffffff,{roughness:.9,side:THREE.DoubleSide}),M_CR=mat(0xffffff,{roughness:.98});
  const IPT=new THREE.InstancedMesh(trunk,M_TR,palms.length+trees.length),IPC=new THREE.InstancedMesh(crown,M_PL,palms.length),ICR=new THREE.InstancedMesh(ball,M_CR,trees.length);
  {const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),s=new THREE.Vector3(),c=new THREE.Color(),Yx=new THREE.Vector3(0,1,0);let ti=0;
   palms.forEach(([x,y,h],i)=>{const g=H(x,y);v.copy(B(x,y,0));v.y=g;q.setFromAxisAngle(Yx,R(0,6.28));s.set(1,h,1);m4.compose(v,q,s);IPT.setMatrixAt(ti++,m4);
     v.y=g+h;const r=R(3.6,4.6);s.set(r,r*.9,r);m4.compose(v,q,s);IPC.setMatrixAt(i,m4);IPC.setColorAt(i,c.setHSL(R(.2,.25),R(.4,.55),R(.2,.28)))});
   trees.forEach(([x,y,h,r],i)=>{const g=H(x,y);v.copy(B(x,y,0));v.y=g;q.identity();s.set(1.3,h*.5,1.3);m4.compose(v,q,s);IPT.setMatrixAt(ti++,m4);
     v.y=g+h*.62;q.setFromAxisAngle(Yx,R(0,6.28));s.set(r,r*R(.75,.95),r);m4.compose(v,q,s);ICR.setMatrixAt(i,m4);ICR.setColorAt(i,c.setHSL(R(.22,.3),R(.35,.5),R(.15,.24)))});
   for(const im of [IPT,IPC,ICR]){im.castShadow=!MOBILE;im.receiveShadow=!MOBILE;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.computeBoundingSphere();G.add(im)}}

  /* ---- tường thành hôm nay: gọn, mặt trên phủ cỏ, ốp gạch (thay khối tường đổ nát 1972) ----
     Lấy dấu chân tường từ chính lưới tường cũ (ô 1,5 m, lấp các chỗ bị phá), dựng lại thành các khối liền. */
  if(walls.length){const C=1.5,N=Math.ceil(620/C),O=310,occ=new Uint8Array(N*N),v=new THREE.Vector3();
    for(const w of walls){w.updateMatrixWorld(true);const P=w.geometry.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(w.matrixWorld);if(v.y<2.5)continue;
      const xi=Math.floor((v.x+O)/C),yi=Math.floor((-v.z+O)/C);if(xi>=0&&yi>=0&&xi<N&&yi<N)occ[yi*N+xi]=1}}
    const morph=(src,dil,r)=>{const out=new Uint8Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let hit=!dil;
      for(let dy=-r;dy<=r&&(dil?!hit:hit);dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;const o=X>=0&&Y>=0&&X<N&&Y<N?src[Y*N+X]:0;if(dil&&o){hit=true;break}if(!dil&&!o){hit=false;break}}out[y*N+x]=hit?1:0}return out};
    let m=morph(morph(occ,true,5),false,5);   // lấp lỗ hổng, chỗ tường bị phá
    const gate=(x,y)=>(Math.abs(y)<9.5&&Math.abs(Math.abs(x)-250)<9)||(Math.abs(x)<10.5&&Math.abs(Math.abs(y)-250)<9);
    const runs=[];for(let yi=0;yi<N;yi++){let a=-1;for(let xi=0;xi<=N;xi++){const x=xi*C-O+C/2,y=yi*C-O+C/2;const on=xi<N&&m[yi*N+xi]&&!gate(x,y);
      if(on&&a<0)a=xi;if(!on&&a>=0){runs.push([a,xi,yi]);a=-1}}}
    const TOP=6.2,BOT=-2.2;const bm=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.93}),gm=null;
    /* gạch cũ, rêu xanh bám lốm đốm (nhiều hơn ở mặt trên và chân tường), mạch vữa theo hàng gạch — tô bằng nhiễu theo toạ độ thế giới */
    bm.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;')
      .replace('#include <project_vertex>','#include <project_vertex>\n mat4 wm4=modelMatrix;\n #ifdef USE_INSTANCING\n wm4=modelMatrix*instanceMatrix;\n #endif\n vWP=(wm4*vec4(transformed,1.)).xyz;vWN=normalize(mat3(wm4)*objectNormal);');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vWP;varying vec3 vWN;
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return nz(p)*.55+nz(p*2.3)*.3+nz(p*5.1)*.15;}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
 vec2 q=abs(vWN.y)>.5?vWP.xz:vec2(vWP.x+vWP.z,vWP.y);
 bool tp=abs(vWN.y)>.5;float rowY=(tp?vWP.z/.3:vWP.y/.28);float row=floor(rowY);float bx=(tp?vWP.x:vWP.x+vWP.z)/.55+row*.5;
 float mortar=max(step(fract(rowY),.1),step(fract(bx),.06));
 vec3 brick=mix(vec3(.47,.27,.2),vec3(.58,.36,.27),hh(vec2(floor(bx),row)))*(.85+.15*fb(q*3.))*(tp?.82:1.);
 brick=mix(brick,vec3(.55,.52,.47),mortar*.8);
 float n=fb(q*.22+3.7);float top=abs(vWN.y)>.5?1.:0.;float foot=clamp((1.2-vWP.y)/2.5,0.,1.);
 float moss=smoothstep(.64-top*.05-foot*.08,.76,n)*smoothstep(.35,.7,fb(q*1.9+7.1))*.9;   /* rêu lốm đốm, không phủ kín */
 vec3 mc=mix(vec3(.24,.33,.13),vec3(.36,.45,.2),fb(q*2.9));
 diffuseColor.rgb=mix(brick,mc,clamp(moss,0.,1.));`)};
    const box=new THREE.BoxGeometry(1,1,1);const IW=new THREE.InstancedMesh(box,bm,runs.length);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3();
    runs.forEach(([a,b,yi],i)=>{const x0=a*C-O,x1=b*C-O,y=yi*C-O+C/2;p.copy(B((x0+x1)/2,y,(TOP+BOT)/2));sc.set(x1-x0,TOP-BOT,C);m4.compose(p,q,sc);IW.setMatrixAt(i,m4)});
    for(const im of [IW]){im.castShadow=im.receiveShadow=!MOBILE;im.computeBoundingSphere();G.add(im)}}

  function set(on){G.visible=on;setFlat(on);for(const w of walls)w.visible=!on}
  return {group:G,set,palms:palms.length,trees:trees.length,H,MON,LEVEL}
}
