/* Bộ quay: dựng từng khung theo danh sách khoảnh khắc, ghép chữ, mã hoá H.264 bằng WebCodecs (card đồ hoạ của máy),
   gửi tệp về máy chủ tại máy (may_chu.py). Chạy trong trang /quay/<sa-ban>/ do may_chu.py phục vụ.
   Tham số URL:
     k=<tệp danh sách trong tools/xuat_phim/, bỏ .json>   (mặc định khoanh_khac_thanh_co_916)
     che_do=xem_thu | xuat     xem_thu: chỉ chụp 1 ảnh giữa mỗi khoảnh khắc; xuat: xuất cả phim
     chi=m2,m5                 chỉ dựng các khoảnh khắc này (để thử)
     tu_chay=0                 không tự chạy; gọi __XP.chay() bằng tay */
const XP=window.__XP;const Q=new URLSearchParams(location.search);
const bang=document.createElement('div');bang.id='xp-bang';document.body.appendChild(bang);
const log=s=>{bang.textContent=s;XP.trangThai=s};
const cho=async(f,ms=180000)=>{const t0=XP.nowThuc();while(!f()){if(XP.nowThuc()-t0>ms)throw new Error('quá thời gian chờ');await new Promise(r=>setTimeout(r,200))}};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const lerp=(a,b,k)=>a+(b-a)*k;
const lerpA=(a,b,k)=>a.map((v,i)=>lerp(v,(b||a)[i],k));

XP.chay=async function(){
  const tenDs=Q.get('k')||'khoanh_khac_thanh_co_916';
  const cfg=await fetch('/xuat_phim/'+tenDs+'.json',{cache:'no-store'}).then(r=>r.json());const ten=cfg.ten||tenDs;
  const cheDo=Q.get('che_do')||'xem_thu';const chi=Q.get('chi')?Q.get('chi').split(','):null;
  log('Đang tải sa bàn…');
  await cho(()=>window.__STORY&&window.__QT);
  const S=window.__STORY,A=window.__QT,{THREE,camera,controls,B}=A;
  /* bỏ giới hạn góc của OrbitControls khi quay (máy được phép thấp hơn điểm nhìn, rất gần nhân vật) */
  controls.maxPolarAngle=Math.PI;controls.minDistance=.01;controls.enableDamping=false;
  const W=XP.W,H=XP.H,FPS=XP.FPS,NGANG=W>H,sc=NGANG?H/1080:W/1080;   /* sc: kích thước chữ viết theo khung 1080 (dọc: rộng 1080; ngang: cao 1080) */

  /* ---------- máy quay của từng khoảnh khắc ---------- */
  const UP=new THREE.Vector3(0,1,0);let cam=null;const cur={p:null,l:null};const pick={};
  function theo(c,off,look){let a=A.anchor(c.follow,c.i||0);if(!a)return null;
    if(c.high){const key=c.follow+(c.i||0);if(pick[key]==null){pick[key]=c.i||0;for(let j=c.i||0;j<(c.i||0)+a.count;j++){const b=A.anchor(c.follow,j);if(b.pos.y>4){pick[key]=j;break}}}a=A.anchor(c.follow,pick[key])}
    const d=a.dir,s=new THREE.Vector3(-d.z,0,d.x);
    const base=c.follow==='boat'?a.pos.clone().setY(A.WATER_Y):(a.head&&c.follow!=='swimmer')?a.head.clone():a.pos.clone();
    return {p:base.clone().addScaledVector(d,-off[0]).addScaledVector(s,off[1]).addScaledVector(UP,off[2]),
            l:base.clone().addScaledVector(d,look[0]).addScaledVector(s,look[2]||0).addScaledVector(UP,look[1])}}
  function viTri(c,u,dai){const k=ease(Math.min(1,Math.max(0,u/dai)));
    if(c.follow)return theo(c,lerpA(c.off,c.off2,k),lerpA(c.look,c.look2,k));
    if(c.p)return {p:B(...lerpA(c.p,c.p2,k)),l:B(...lerpA(c.l,c.l2,k))};return null}
  A.tickHooks.push(dt=>{if(!cam)return;const c=cam.c;const u=S.D.t-cam.t0;
    if(c.lop!==undefined&&A.layer()!==c.lop)A.setLayer(c.lop);
    camera.fov=lerp(c.fov||50,c.fov2||c.fov||50,ease(Math.min(1,Math.max(0,u/cam.dai))));camera.updateProjectionMatrix();
    if(c.dao_dien)return;   /* dùng máy của bộ dẫn chuyện */
    const v=viTri(c,u,cam.dai);if(!v)return;
    const m=c.muot??(c.follow?5:0);   /* làm mượt khi bám nhân vật đang chuyển động */
    if(!cur.p||!m||cam.snap){cur.p=v.p.clone();cur.l=v.l.clone();cam.snap=false}else{const k=1-Math.exp(-dt*m);cur.p.lerp(v.p,k);cur.l.lerp(v.l,k)}
    camera.position.copy(cur.p);controls.target.copy(cur.l);camera.lookAt(cur.l)});

  /* ---------- chữ, nhãn, logo ---------- */
  const FONT='"Be Vietnam Pro", system-ui, sans-serif';
  const allTxt=[cfg.nhan,cfg.ket&&cfg.ket.chu,cfg.ket&&cfg.ket.web,...cfg.khoanh_khac.map(m=>m.chu)].filter(Boolean).join(' ');
  for(const w of [600,700,800])await document.fonts.load(`${w} 60px "Be Vietnam Pro"`,allTxt).catch(()=>{});
  const logo=new Image();logo.src=cfg.logo;await logo.decode().catch(()=>{});
  const logoKenh=new Image();if(cfg.logo_kenh){logoKenh.src=cfg.logo_kenh;await logoKenh.decode().catch(()=>{})}   /* logo kênh (vd. Trường Thắng Documentary) góc dưới phải */
  const logoKet=new Image();logoKet.src=cfg.ket&&cfg.ket.logo||cfg.logo;await logoKet.decode().catch(()=>{});
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  function dong(txt,maxW){const words=txt.split(' ');const out=[];let s='';for(const w of words){const t=s?s+' '+w:w;if(g.measureText(t).width>maxW&&s){out.push(s);s=w}else s=t}if(s)out.push(s);return out}
  function chuGiua(txt,cy,size,{weight=800,color='#fff',maxW=940,lh=1.2,alpha=1,dy=0}={}){
    g.save();g.globalAlpha=alpha;g.font=`${weight} ${size*sc}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';
    const L=dong(txt,maxW*sc);const h=L.length*size*lh*sc;let y=cy*sc-h/2+size*lh*sc/2+dy*sc;
    g.lineJoin='round';g.shadowColor='rgba(0,0,0,.65)';g.shadowBlur=18*sc;g.shadowOffsetY=3*sc;
    for(const s of L){g.lineWidth=10*sc;g.strokeStyle='rgba(0,0,0,.78)';g.strokeText(s,W/2,y);g.shadowColor='transparent';g.fillStyle=color;g.fillText(s,W/2,y);g.shadowColor='rgba(0,0,0,.65)';y+=size*lh*sc}
    g.restore();return h}
  function nhan(){const x=44*sc,y=150*sc,txt=cfg.nhan||'TÁI DỰNG MÔ PHỎNG';g.save();g.font=`700 ${27*sc}px ${FONT}`;g.textBaseline='middle';
    const w=g.measureText(txt).width+34*sc,h=54*sc;g.fillStyle='rgba(20,10,6,.62)';g.strokeStyle='rgba(240,170,90,.9)';g.lineWidth=2.5*sc;
    g.beginPath();g.roundRect(x,y-h/2,w,h,h/2);g.fill();g.stroke();g.fillStyle='#ffd9a8';g.fillText(txt,x+17*sc,y+1*sc);g.restore()}
  function logoGoc(){if(!logo.naturalWidth)return;const w=(cfg.logo_rong||220)*sc,h=w*logo.naturalHeight/logo.naturalWidth;
    g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=14*sc;g.drawImage(logo,W-44*sc-w,150*sc-h/2,w,h);g.restore()}
  /* ---- khung ngang 16:9 (phim đầy đủ): nhãn + logo góc trên, thẻ tên phân cảnh, phụ đề lời dẫn ---- */
  function veNgang(m,u,dai,glc){
    g.globalAlpha=1;g.fillStyle='#000';g.fillRect(0,0,W,H);g.filter=m.loc||'none';g.drawImage(glc,0,0,W,H);g.filter='none';
    let gr=g.createLinearGradient(0,0,0,170*sc);gr.addColorStop(0,'rgba(0,0,0,.42)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,170*sc);
    const t=m.the;if(t&&u>=t.tu&&u<=t.den){const a=Math.min(1,(u-t.tu)/.6)*Math.min(1,Math.max(0,(t.den-u)/.6));
      gr=g.createLinearGradient(0,330*sc,0,750*sc);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,`rgba(0,0,0,${.5*a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,330*sc,W,420*sc);
      if(t.nho)chuGiua(t.nho,470,30,{weight:700,color:'#f3c969',alpha:a,maxW:1500,lh:1.1});
      chuGiua(t.chu,540,76,{alpha:a,maxW:1600,dy:(1-Math.min(1,(u-t.tu)/.6))*18})}
    const pd=(m.phu_de||[]).find(x=>u>=x.tu&&u<x.den);
    if(pd){const a=Math.min(1,(u-pd.tu)/.25)*Math.min(1,Math.max(0,(pd.den-u)/.25));
      const pw=cfg.logo_kenh?1260:1500;g.save();g.font=`600 ${40*sc}px ${FONT}`;const L=dong(pd.text,pw*sc);g.restore();
      const cy=1080-60-(L.length*40*1.25)/2;chuGiua(pd.text,cy,40,{weight:600,alpha:a,maxW:pw,lh:1.25})}
    if(m.ket){const k=Math.min(1,u/.6);g.fillStyle=`rgba(6,4,3,${.66*k})`;g.fillRect(0,0,W,H);
      if(logoKet.naturalWidth){const w=(m.logo_rong||420)*sc,h=w*logoKet.naturalHeight/logoKet.naturalWidth;g.save();g.globalAlpha=k;g.drawImage(logoKet,(W-w)/2,(m.logo_y||380)*sc-h/2,w,h);g.restore()}
      chuGiua(m.chu,700,64,{alpha:k,maxW:1500});chuGiua(m.web||'',800,44,{weight:700,color:'#f3c969',alpha:k,maxW:1500});
      if(m.cong)chuGiua(m.cong,930,26,{weight:500,alpha:k*.9,maxW:cfg.logo_kenh?1260:1700,lh:1.35})}
    {const x=40*sc,y=60*sc,txt=cfg.nhan||'TÁI DỰNG MÔ PHỎNG';g.save();g.font=`700 ${22*sc}px ${FONT}`;g.textBaseline='middle';
      const w=g.measureText(txt).width+28*sc,h=44*sc;g.fillStyle='rgba(20,10,6,.62)';g.strokeStyle='rgba(240,170,90,.9)';g.lineWidth=2*sc;
      g.beginPath();g.roundRect(x,y-h/2,w,h,h/2);g.fill();g.stroke();g.fillStyle='#ffd9a8';g.fillText(txt,x+14*sc,y+1*sc);g.restore()}
    if(logo.naturalWidth){const w=(cfg.logo_rong||170)*sc,h=w*logo.naturalHeight/logo.naturalWidth;g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=12*sc;g.drawImage(logo,W-40*sc-w,60*sc-h/2,w,h);g.restore()}
    if(logoKenh.naturalWidth){const w=(cfg.logo_kenh_rong||230)*sc,h=w*logoKenh.naturalHeight/logoKenh.naturalWidth;g.save();g.globalAlpha=cfg.logo_kenh_mo??.85;g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=10*sc;g.drawImage(logoKenh,W-40*sc-w,H-36*sc-h,w,h);g.restore()}
    if(m.den_vao&&u<m.den_vao){g.fillStyle=`rgba(0,0,0,${1-u/m.den_vao})`;g.fillRect(0,0,W,H)}
    if(m.den_ra&&dai-u<m.den_ra){g.fillStyle=`rgba(0,0,0,${1-(dai-u)/m.den_ra})`;g.fillRect(0,0,W,H)}}
  function veKhung(m,u,dai,glc){if(NGANG)return veNgang(m,u,dai,glc);
    g.globalAlpha=1;g.fillStyle='#000';g.fillRect(0,0,W,H);g.filter=m.loc||'none';g.drawImage(glc,0,0,W,H);g.filter='none';   /* loc: chỉnh sáng/tương phản cho cảnh đêm, vd. "brightness(1.5) contrast(1.1)" */
    /* làm tối nhẹ trên cùng cho nhãn/logo dễ đọc, và dải dưới chữ */
    let gr=g.createLinearGradient(0,0,0,330*sc);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,330*sc);
    const vao=m.chu_tu??.25;
    if(m.ket){const k=Math.min(1,u/.45);g.fillStyle=`rgba(6,4,3,${.62*k})`;g.fillRect(0,0,W,H);
      if(logoKet.naturalWidth){const w=(m.logo_rong||560)*sc,h=w*logoKet.naturalHeight/logoKet.naturalWidth;g.save();g.globalAlpha=k;g.drawImage(logoKet,(W-w)/2,(m.logo_y||600)*sc-h/2,w,h);g.restore()}
      chuGiua(m.chu,960,78,{alpha:k,maxW:900});
      chuGiua(m.web||'',1210,50,{weight:700,color:'#f3c969',alpha:k,maxW:980});
    }else if(m.chu&&u>=vao&&u<=dai){
      const hn=!!m.chu_hien_ngay,het=m.chu_het??.3;   /* chu_hien_ngay: chữ nối tiếp từ đoạn trước, không hiện dần */
      const vaoK=hn?1:Math.min(1,(u-vao)/.35);const a=vaoK*(het>0?Math.min(1,Math.max(0,(dai-u)/het)):1);const moc=m.kieu_chu==='moc';
      const cy=m.chu_y||(moc?900:1250),size=m.chu_co||(moc?88:74);
      gr=g.createLinearGradient(0,(cy-260)*sc,0,(cy+260)*sc);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,`rgba(0,0,0,${.42*a})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,(cy-260)*sc,W,520*sc);
      chuGiua(m.chu,cy,size,{alpha:a,dy:(1-vaoK)*24,color:moc?'#ffe08a':'#fff',maxW:m.chu_rong||920})}
    nhan();logoGoc();
    if(m.den_vao&&u<m.den_vao){g.fillStyle=`rgba(0,0,0,${1-u/m.den_vao})`;g.fillRect(0,0,W,H)}
    if(m.den_ra&&dai-u<m.den_ra){g.fillStyle=`rgba(0,0,0,${1-(dai-u)/m.den_ra})`;g.fillRect(0,0,W,H)}}

  /* ---------- bộ mã hoá H.264 ---------- */
  let enc=null,parts=[],nByte=0;
  async function moMaHoa(){
    const ds=W*H>2.2e6?['avc1.640033','avc1.640034','avc1.4d0033']:['avc1.640028','avc1.64002a','avc1.4d0028','avc1.42e028'];
    for(const hw of ['prefer-hardware','no-preference'])for(const codec of ds){
      const c={codec,width:W,height:H,bitrate:cfg.ma_hoa&&cfg.ma_hoa.bitrate||(W*H>2.2e6?60e6:20e6),framerate:FPS,avc:{format:'annexb'},hardwareAcceleration:hw,latencyMode:'quality',bitrateMode:'variable'};
      try{const r=await VideoEncoder.isConfigSupported(c);if(r.supported){enc=new VideoEncoder({output:ch=>{const b=new Uint8Array(ch.byteLength);ch.copyTo(b);parts.push(b);nByte+=b.byteLength},error:e=>{XP.loi=String(e);console.error(e)}});enc.configure(c);XP.maHoa=codec+' / '+hw;return}}catch(e){}}
    throw new Error('Trình duyệt không mã hoá được H.264 ở '+W+'×'+H)}
  async function luu(tenTep,blob,noi){const r=await fetch('/xuat_phim/luu?ten='+encodeURIComponent(tenTep)+(noi?'&noi=1':''),{method:'POST',body:blob});if(!r.ok)throw new Error('Không lưu được '+tenTep);return r.text()}

  /* ---------- sự kiện dàn dựng trong khoảnh khắc (dùng chính API của sa bàn): su_kien = [{luc, no:[x,y], lon}, {luc, phao_sang:[x,y,cao]}] ---------- */
  function suKien(m,u0,u1){for(const e of m.su_kien||[]){if(e.luc<u0-1e-6||e.luc>=u1-1e-6)continue;
    if(e.no)A.boomAt(e.no[0],e.no[1],!!e.lon);
    if(e.no_truoc){   /* nổ phía trước máy quay: [cách bao nhiêu mét, lệch ngang (+ phải)] */
      const f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3(-f.z,0,f.x);
      const q=camera.position.clone().addScaledVector(f,e.no_truoc[0]).addScaledVector(r,e.no_truoc[1]||0);A.boomAt(q.x,-q.z,e.lon!==false)}
    if(e.phao_sang)A.flare(e.phao_sang[0],e.phao_sang[1],e.phao_sang[2]||170)}}

  /* ---------- chạy ---------- */
  XP.chiemDongHo();
  const ds=cfg.khoanh_khac.filter(m=>!chi||chi.includes(m.id));if(cfg.ket&&(!chi||chi.includes('ket')))ds.push(Object.assign({id:'ket',ket:true},cfg.ket));
  const tong=ds.reduce((a,m)=>a+Math.round(m.dai*FPS),0);
  if(cheDo==='xuat')await moMaHoa();
  const glc=A.renderer.domElement,t0=XP.nowThuc(),bao={ten,che_do:cheDo,khung:[W,H,FPS],ma_hoa:null,khoanh_khac:[],no:[]};let n=0;
  for(const m of ds){const tm=XP.nowThuc();
    const idx=S.list.findIndex(e=>e.id===m.chuong);if(idx<0)throw new Error('Không có chương '+m.chuong);
    const pre=m.chuan_bi??3;S.goto(idx,Math.max(0,m.tu-pre));S.D.speed=1;
    if(m.dem)A.snapNight();
    cam={c:m.may||{dao_dien:true},t0:m.tu,dai:m.dai,snap:true};cur.p=null;
    /* chạy trước vài giây (không ghi) để ánh sáng, khói, nhân vật vào nhịp */
    const nPre=Math.round((S.D.t<m.tu?m.tu-S.D.t:0)*FPS);for(let f=0;f<nPre;f++){if(f%10===9)await XP.nhuong();cam.snap=f<1;XP.buocToi()}
    const N=Math.round(m.dai*FPS);
    if(cheDo==='xem_thu'){   /* ?anh=3: chụp 3 ảnh ở 10%, 50%, 90% đoạn; mặc định 1 ảnh ở 55% */
      const nA=+Q.get('anh')||1;const moc=nA>1?Array.from({length:nA},(_,j)=>m.dai*(.1+.8*j/(nA-1))):[m.anh_luc??m.dai*.55];let f=0;
      for(const [j,lu] of moc.entries()){for(;f<Math.round(lu*FPS);f++){if(f%10===9)await XP.nhuong();suKien(m,f/FPS,(f+1)/FPS);XP.buocToi()}   /* nhường TRƯỚC khi vẽ: sau khi nhường, khung vẽ WebGL bị xoá */
        veKhung(m,lu,m.dai,glc);const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',.88));await luu(`${ten}_${m.id}${nA>1?'_'+(j+1):''}.jpg`,b)}
      n+=N;log(`Xem thử ${m.id} xong (${((XP.nowThuc()-tm)/1000).toFixed(1)} s)`)}
    else{const tepM=cfg.tach_tep?`${ten}_${m.id}`:null;let phan=0;   /* tach_tep: mỗi khoảnh khắc ghi thành nhiều phần <ten>_<id>_pNNN.h264 (~10 s), ghep_am_thanh.py nối lại */
      const ghiDan=async()=>{await enc.flush();if(!parts.length)return;const b=new Blob(parts);parts=[];await luu(`${tepM}_p${String(++phan).padStart(3,'0')}.h264`,b)};
      let nNo=A.counts().boom;
      for(let f=0;f<N;f++){suKien(m,f/FPS,(f+1)/FPS);XP.buocToi();veKhung(m,f/FPS,m.dai,glc);
        const c0=A.counts().boom;if(c0>nNo)for(let q=0;q<c0-nNo;q++)bao.no.push(+(n/FPS).toFixed(3));nNo=c0;   /* ghi lại lúc nổ để dựng tiếng nổ */
        const vf=new VideoFrame(cv,{timestamp:Math.round(n*1e6/FPS),duration:Math.round(1e6/FPS)});enc.encode(vf,{keyFrame:f===0||n%(FPS*2)===0});vf.close();n++;
        if(tepM&&f%(FPS*10)===FPS*10-1)await ghiDan();
        if(f===Math.round(N*.55)){const b=await new Promise(r=>cv.toBlob(r,'image/jpeg',.85));luu(`${ten}_${m.id}.jpg`,b)}
        while(enc.encodeQueueSize>3)await new Promise(r=>enc.addEventListener('dequeue',r,{once:true}));
        if(f%5===4){await XP.nhuong();const tt=(XP.nowThuc()-t0)/1000;log(`Đang xuất ${m.id}: khung ${n}/${tong} · ${tt.toFixed(0)} s · còn ~${(tt/n*(tong-n)).toFixed(0)} s`)}
        if(XP.loi)throw new Error(XP.loi)}
      if(tepM)await ghiDan()}
    bao.khoanh_khac.push({id:m.id,giay_that:+((XP.nowThuc()-tm)/1000).toFixed(1),khung:N});if(cfg.tach_tep)luu(`${ten}_${cheDo}_tien_do.json`,new Blob([JSON.stringify(bao)]))}
  cam=null;
  if(cheDo==='xuat'){await enc.flush();enc.close();bao.ma_hoa=XP.maHoa;bao.byte=nByte;
    if(!cfg.tach_tep)await luu(`${ten}.h264`,new Blob(parts,{type:'video/h264'}));parts=[]}
  bao.giay_that=+((XP.nowThuc()-t0)/1000).toFixed(1);bao.khung_tong=n;
  await luu(`${ten}_${cheDo}.json`,new Blob([JSON.stringify(bao,null,1)],{type:'application/json'}));
  XP.ketQua=bao;log(`XONG ${cheDo}: ${n} khung trong ${bao.giay_that} s`+(bao.ma_hoa?` · ${bao.ma_hoa}`:''));return bao};

if(Q.get('tu_chay')!=='0')XP.chay().catch(e=>{XP.loi=String(e&&e.stack||e);log('LỖI: '+e)});
