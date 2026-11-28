/* Học Lịch Sử V6.2 — bản đồ Không gian lịch sử bằng MapLibre GL + OpenFreeMap (28/11/2026, theo yêu cầu chủ dự án).
   - Nền bản đồ véc-tơ OpenStreetMap (OpenFreeMap, kiểu positron) đổi màu theo giao diện tối/sáng, tên địa danh tiếng Việt,
     nổi khối địa hình (hillshade, ô độ cao Terrarium).
   - Hoàng Sa, Trường Sa: ẩn nhãn gốc trong vùng hai quần đảo, ghi "Quần đảo Hoàng Sa (Việt Nam)", "Quần đảo Trường Sa (Việt Nam)".
   - Pin = ảnh sa bàn + tên, màu theo loại; gần nhau thì gom thành cụm có số; bấm pin → bay tới + thẻ "Xem không gian 3D".
   - Cử chỉ hợp tác: máy tính Ctrl/⌘ + cuộn để phóng; điện thoại hai ngón để kéo/phóng, một ngón cuộn trang.
   - Không có mạng, không WebGL, bản offline (file://) hoặc nạp lỗi → giữ bản đồ SVG cũ.
   Thư viện: static/v62/maplibre-gl.js (+ worker), giấy phép BSD-3 (static/v62/LICENSE-maplibre-gl.txt). */
(function(){
'use strict';
const WEB=['http:','https:'].includes(location.protocol);
const KIEU='https://tiles.openfreemap.org/styles/positron';
const DO_CAO='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const VN=[[102.1,8.2],[109.6,23.45]];                  // khung toàn Việt Nam (đất liền)
const HOANG_SA=[[110.9,15.6],[113.0,17.3]], TRUONG_SA=[[111.3,6.8],[117.6,11.8]];
const NHAN_DAO=[{ten:'Quần đảo Hoàng Sa\n(Việt Nam)',lon:112.0,lat:16.5},{ten:'Quần đảo Trường Sa\n(Việt Nam)',lon:114.0,lat:9.6}];
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hop=b=>({type:'Polygon',coordinates:[[[b[0][0],b[0][1]],[b[1][0],b[0][1]],[b[1][0],b[1][1]],[b[0][0],b[1][1]],[b[0][0],b[0][1]]]]});

/* ---------- Bảng màu nền theo giao diện ---------- */
const MAU={
 toi:{nen:'#0e1c23',nuoc:'#14323f',cong_vien:'#13261f',rung:'#132520',dan_cu:'#13222a',nha:'#17262d',duong:'#24363e',duong_lon:'#2f444c',
  ranh_gioi:'#8e7a52',chu:'#c7d2d3',chu_vien:'#0e1c23',chu_nuoc:'#6f9bab',chu_quoc_gia:'#e3c98f',bong:0.32},
 sang:{nen:'#f4eee2',nuoc:'#c6dbe2',cong_vien:'#e3e8cf',rung:'#dfe5cc',dan_cu:'#ece4d3',nha:'#e3d9c6',duong:'#ffffff',duong_lon:'#fbf6ec',
  ranh_gioi:'#a68a5b',chu:'#4b3f31',chu_vien:'#f4eee2',chu_nuoc:'#4f7f91',chu_quoc_gia:'#6b4f2a',bong:0.22},
};
const sang=()=>document.body.classList.contains('theme-light');

/* Biến đổi kiểu bản đồ: tên tiếng Việt, ẩn nhãn trong vùng Hoàng Sa/Trường Sa, ẩn đường tranh chấp. */
function bienDoiKieu(st){
 const ten=['coalesce',['get','name:vi'],['get','name:latin'],['get','name']];
 const ngoaiDao=['!',['within',{type:'MultiPolygon',coordinates:[hop(HOANG_SA).coordinates,hop(TRUONG_SA).coordinates]}]];
 st.layers=st.layers.filter(l=>l.id!=='boundary_disputed'&&!/^highway-shield|road_shield/.test(l.id));
 for(const l of st.layers){
  if(l.type!=='symbol')continue;
  l.layout=l.layout||{};
  if(l.layout['text-field']&&!/shield/.test(l.id))l.layout['text-field']=ten;
  l.filter=l.filter?['all',l.filter,ngoaiDao]:ngoaiDao;
 }
 return st;
}
function apMau(map){
 const m=sang()?MAU.sang:MAU.toi;
 const dat=(id,k,v)=>{if(map.getLayer(id))try{map.setPaintProperty(id,k,v);}catch(_){}};
 for(const l of map.getStyle().layers){
  const id=l.id;
  if(l.type==='background')dat(id,'background-color',m.nen);
  else if(l.type==='fill'){
   const c=id==='water'?m.nuoc:id==='park'?m.cong_vien:/wood|glacier|ice/.test(id)?m.rung:/residential/.test(id)?m.dan_cu:id==='building'?m.nha:/aeroway|road/.test(id)?m.duong:null;
   if(c){dat(id,'fill-color',c);dat(id,'fill-outline-color',c);}
  }else if(l.type==='line'){
   if(id==='waterway')dat(id,'line-color',m.nuoc);
   else if(/boundary/.test(id))dat(id,'line-color',m.ranh_gioi);
   else if(/motorway|major/.test(id))dat(id,'line-color',m.duong_lon);
   else dat(id,'line-color',m.duong);
  }else if(l.type==='symbol'){
   dat(id,'text-color',/water/.test(id)?m.chu_nuoc:/country/.test(id)?m.chu_quoc_gia:m.chu);
   dat(id,'text-halo-color',m.chu_vien);
  }else if(l.type==='hillshade'){
   dat(id,'hillshade-shadow-color',sang()?'#6b5a40':'#000000');dat(id,'hillshade-highlight-color',sang()?'#ffffff':'#3d5560');
   dat(id,'hillshade-exaggeration',m.bong);
  }else if(l.type==='raster'&&id!=='hls-dia-hinh'){dat(id,'raster-opacity',sang()?0.25:0.12);}
 }
 if(map.getLayer('hls-dao'))dat('hls-dao','text-color',sang()?'#8a3b1e':'#f0c987');
 if(map.getLayer('hls-dao'))dat('hls-dao','text-halo-color',m.chu_vien);
}

/* ---------- Khởi tạo ---------- */
let MAP=null,ML=null,dangNap=null,dsPin=[],theMo=null;
const canh=()=>typeof V23_SCENES!=='undefined'?V23_SCENES.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lon)):[];
const locHienTai=()=>{const s=document.getElementById('v23SceneFilter');return s?s.value:'all';};
const anh=id=>'static/v49/scene-'+id+'.webp';

function coWebGL(){try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(_){return false;}}

async function nap(){
 if(dangNap)return dangNap;
 dangNap=(async()=>{
  const vp=document.getElementById('v23MapViewport');if(!vp||!WEB||!coWebGL())throw new Error('không đủ điều kiện');
  if(!document.getElementById('v62Css')){const l=document.createElement('link');l.id='v62Css';l.rel='stylesheet';l.href='static/v62/maplibre-gl.css';document.head.appendChild(l);}
  const goc=new URL('static/v62/maplibre-gl.js',document.baseURI).href;
  ML=await import(goc);
  const kieu=bienDoiKieu(await (await fetch(KIEU,{cache:'force-cache'})).json());
  const khung=document.createElement('div');khung.id='v62Map';khung.className='v62-map';vp.appendChild(khung);
  // Không cho sự kiện cuộn lọt lên bộ xử lý của bản đồ SVG cũ (nó chặn cuộn trang và tự phóng).
  // (bộ xử lý cũ còn gọi setPointerCapture → nhấn pin/cụm không ra “click”).
  for(const t of ['wheel','pointerdown'])khung.addEventListener(t,e=>e.stopPropagation());
  const map=new ML.Map({container:khung,style:kieu,bounds:VN,fitBoundsOptions:{padding:24},minZoom:3.6,maxZoom:15,
   attributionControl:{compact:true},cooperativeGestures:true,dragRotate:false,pitchWithRotate:false,touchPitch:false,renderWorldCopies:false,
   locale:{'CooperativeGesturesHandler.WindowsHelpText':'Giữ Ctrl và cuộn để phóng to bản đồ','CooperativeGesturesHandler.MacHelpText':'Giữ ⌘ và cuộn để phóng to bản đồ',
    'CooperativeGesturesHandler.MobileHelpText':'Dùng hai ngón tay để di chuyển bản đồ','NavigationControl.ZoomIn':'Phóng to','NavigationControl.ZoomOut':'Thu nhỏ','Popup.Close':'Đóng'}});
  map.touchZoomRotate.disableRotation();
  await new Promise((ok,loi)=>{map.once('load',ok);map.once('error',e=>{if(!map.loaded())loi(e.error||e);});setTimeout(()=>loi(new Error('quá thời gian')),20000);});
  // Nổi khối địa hình
  try{
   map.addSource('hls-do-cao',{type:'raster-dem',tiles:[DO_CAO],tileSize:256,encoding:'terrarium',maxzoom:12,attribution:'Địa hình: Mapzen/AWS Terrain Tiles'});
   const truoc=map.getStyle().layers.find(l=>l.type==='line'||l.type==='symbol');
   map.addLayer({id:'hls-dia-hinh',type:'hillshade',source:'hls-do-cao',paint:{'hillshade-exaggeration':0.3}},truoc&&truoc.id);
  }catch(e){console.warn('v62 địa hình',e);}
  // Nhãn hai quần đảo
  const fontNhan=(map.getStyle().layers.find(l=>l.id==='label_city')||{}).layout?.['text-font']||['Noto Sans Regular'];
  map.addSource('hls-dao',{type:'geojson',data:{type:'FeatureCollection',features:NHAN_DAO.map(d=>({type:'Feature',properties:{ten:d.ten},geometry:{type:'Point',coordinates:[d.lon,d.lat]}}))}});
  map.addLayer({id:'hls-dao',type:'symbol',source:'hls-dao',layout:{'text-field':['get','ten'],'text-font':fontNhan,'text-size':['interpolate',['linear'],['zoom'],4,11,7,14],'text-allow-overlap':true,'text-letter-spacing':0.04},
   paint:{'text-color':'#f0c987','text-halo-width':1.6}});
  apMau(map);
  // Dòng ghi nguồn thu gọn thành nút ⓘ (bấm để xem), không che bản đồ trên điện thoại.
  setTimeout(()=>{const a=khung.querySelector('.maplibregl-ctrl-attrib');if(a){a.classList.remove('maplibregl-compact-show');a.removeAttribute('open');}},300);
  new MutationObserver(()=>apMau(map)).observe(document.body,{attributes:true,attributeFilter:['class']});
  vp.classList.add('v62-co-map');
  MAP=map;
  datPin();
  map.on('move',veCum);map.on('moveend',veCum);
  new ResizeObserver(()=>map.resize()).observe(vp);
  // Nút cũ + − ⌖ và “bay tới” khi chọn thẻ
  window.v23Zoom=f=>map.easeTo({zoom:map.getZoom()+(f>1?1:-1),duration:350});
  window.v23ResetMap=()=>{dongThe();map.fitBounds(VN,{padding:24,duration:900});};
  window.v23FlyTo=p=>{if(p&&Number.isFinite(p.lat))map.flyTo({center:[p.lon,p.lat],zoom:Math.max(map.getZoom(),9),speed:1.6,curve:1.4,maxDuration:2200});};
  const chan=document.querySelector('.v23-map-foot');
  if(chan)chan.textContent='Bản đồ © OpenStreetMap (OpenFreeMap). Vị trí điểm ghim là vị trí đại diện của di tích/chiến trường; với các trận đánh cổ là vị trí trên bản đồ hiện nay.';
  return map;
 })().catch(e=>{console.warn('Bản đồ MapLibre không dùng được, giữ bản đồ SVG:',e&&e.message||e);const k=document.getElementById('v62Map');if(k)k.remove();
  const vp=document.getElementById('v23MapViewport');if(vp)vp.classList.remove('v62-co-map');MAP=null;return null;});
 return dangNap;
}

/* ---------- Pin + cụm ---------- */
function datPin(){
 for(const p of dsPin)p.mk.remove();dsPin=[];
 const loc=locHienTai();
 for(const s of canh()){
  if(loc!=='all'&&s.kind!==loc)continue;
  const el=document.createElement('button');el.type='button';el.className='v62-pin v62-'+(s.kind==='battle'?'tran':'ditich');
  el.setAttribute('aria-label','Mở '+s.name);
  el.innerHTML='<span class="anh"><img src="'+esc(anh(s.id))+'" alt="" loading="lazy" onerror="this.remove()"></span><span class="ten">'+esc(s.name)+'</span>';
  el.addEventListener('click',e=>{e.stopPropagation();moThe(s);});
  const mk=new ML.Marker({element:el,anchor:'left',offset:[-22,0]}).setLngLat([s.lon,s.lat]).addTo(MAP);
  dsPin.push({s,mk,el});
 }
 veCum();
}
const cum=[];
function veCum(){
 if(!MAP)return;
 // Nhìn xa hoặc màn hình hẹp: chỉ hiện ảnh tròn, tên hiện khi phóng gần (đỡ chồng chữ).
 const hep=MAP.getContainer().clientWidth<560;
 MAP.getContainer().classList.toggle('v62-an-ten',MAP.getZoom()<(hep?7:5.6));
 const NGUONG=hep?54:46;
 for(const c of cum.splice(0))c.remove();
 const diem=dsPin.map(p=>({p,xy:MAP.project([p.s.lon,p.s.lat])}));
 const da=new Set();
 for(let i=0;i<diem.length;i++){
  if(da.has(i))continue;
  const nhom=[i];
  for(let j=i+1;j<diem.length;j++)if(!da.has(j)&&Math.hypot(diem[i].xy.x-diem[j].xy.x,diem[i].xy.y-diem[j].xy.y)<NGUONG){nhom.push(j);}
  if(nhom.length===1){diem[i].p.el.style.display='';continue;}
  nhom.forEach(k=>{da.add(k);diem[k].p.el.style.display='none';});
  const ds=nhom.map(k=>diem[k].p.s);
  const el=document.createElement('button');el.type='button';el.className='v62-cum';el.textContent=ds.length;
  el.title=ds.map(s=>s.name).join(' · ');el.setAttribute('aria-label',ds.length+' địa điểm: '+el.title);
  const lon=ds.reduce((a,s)=>a+s.lon,0)/ds.length,lat=ds.reduce((a,s)=>a+s.lat,0)/ds.length;
  el.addEventListener('click',e=>{e.stopPropagation();const b=new ML.LngLatBounds();ds.forEach(s=>b.extend([s.lon,s.lat]));
   MAP.fitBounds(b,{padding:120,maxZoom:Math.min(MAP.getZoom()+4,11),duration:800});});
  cum.push(new ML.Marker({element:el}).setLngLat([lon,lat]).addTo(MAP));
 }
}

/* ---------- Thẻ thông tin ---------- */
function dongThe(){if(theMo){theMo.remove();theMo=null;}}
function moThe(s){
 dongThe();
 const ex=typeof V2_EXPERIENCES!=='undefined'?V2_EXPERIENCES.find(x=>x.id===s.id):null;
 const mo=(ex&&ex.description||'').slice(0,170);
 const html='<div class="v62-the"><img src="'+esc(anh(s.id))+'" alt="" onerror="this.remove()"><div class="nd"><small>'+esc(s.category||'')+' · '+(s.year<0?Math.abs(s.year)+' TCN':s.year)+'</small>'+
  '<strong>'+esc(s.name)+'</strong>'+(mo?'<p>'+esc(mo)+(ex.description.length>170?'…':'')+'</p>':'')+
  '<button type="button" class="mo">Xem không gian 3D ›</button></div></div>';
 theMo=new ML.Popup({offset:18,maxWidth:'300px',closeButton:true,focusAfterOpen:false,className:'v62-popup'}).setLngLat([s.lon,s.lat]).setHTML(html).addTo(MAP);
 theMo.getElement().querySelector('.mo').onclick=()=>{if(typeof openItem==='function')openItem('scene:'+s.id);};
 MAP.flyTo({center:[s.lon,s.lat],zoom:Math.max(MAP.getZoom(),8),speed:1.6,curve:1.4,maxDuration:2200,offset:[0,80]});
}

/* ---------- Gắn với trang ---------- */
function thuNap(){
 const vp=document.getElementById('v23MapViewport');
 if(!vp||MAP||!vp.offsetParent)return;
 nap();
}
function caiDat(){
 if(!WEB)return;
 // Bộ lọc Di tích / Chiến dịch vẽ lại danh sách qua v23RenderMap → vẽ lại pin.
 const cu=window.v23RenderMap;
 if(typeof cu==='function')window.v23RenderMap=function(){const r=cu.apply(this,arguments);if(MAP)datPin();return r;};
 const cuSpaces=window.showSpaces;
 if(typeof cuSpaces==='function')window.showSpaces=function(){const r=cuSpaces.apply(this,arguments);setTimeout(()=>{thuNap();if(MAP)MAP.resize();},60);return r;};
 thuNap();
 window.HLS_BAN_DO={nap,bienDoiKieu,map:()=>MAP,chon:id=>{const s=canh().find(x=>x.id===id);if(MAP&&s){moThe(s);return true;}return false;}};
}
if(document.readyState==='complete')setTimeout(caiDat,400);else window.addEventListener('load',()=>setTimeout(caiDat,400));
})();
