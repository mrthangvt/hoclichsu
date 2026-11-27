/* Học Lịch Sử V6 — áp nội dung sửa trong CMS (/admin) lên trang chính.
   Tải /api/v6/noi-dung (bản vá theo loại + mã) rồi ghép vào dữ liệu gốc của trang:
   nhân vật (persons), triều đại (details), sự kiện (battles, VS59_DATA.su_kien), mốc Hồ Chí Minh (hcmEvents),
   bài SGK (VS58_SGK), thanh menu. v59-duong-dan.js đợi window.HLS_CMS_SAN trước khi mở trang,
   nên trang hiện ngay bản đã sửa. Không có máy chủ (GitHub Pages, bản offline) thì bỏ qua.
   Người biên tập đã đăng nhập thấy nút “✎ Sửa” trong cửa sổ hồ sơ/bài. */
(function(){
'use strict';
const WEB=['http:','https:'].includes(location.protocol);
const GOC_DU_LIEU=/[?&]goc=1/.test(location.search);   // CMS đọc dữ liệu gốc qua khung ẩn
const MENU={main:['navMain','mobileMain'],hcm:['navHCM','mobileHCM'],characters:['navCharacters','mobileCharacters'],
 spaces:['navSpaces','mobileSpaces'],exam:['[data-vs-exam-new]'],school:['navSchool','mobileSchool']};
let BAN_VA={};

const escH=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tron(dich,va){for(const [k,v] of Object.entries(va)){if(k==='moi')continue;dich[k]=Array.isArray(v)?v.slice():v;}return dich;}
function doiNhanEras(ma,nhan){
 if(typeof eras==='undefined'||!nhan)return;
 const sua=a=>{if(Array.isArray(a)&&a.length>=2&&a[a.length-1]===ma&&typeof a[0]==='string'){const m=a[0].match(/^([^\p{L}\p{N}]+\s)/u);a[0]=(m?m[1]:'')+nhan;}};
 for(const e of eras)for(const k of Object.keys(e))if(Array.isArray(e[k]))e[k].forEach(sua);
}
function apDung(nd){
 const L=nd||{};
 // Đường dẫn tính theo tên GỐC để liên kết đã chia sẻ không đổi khi sửa tên trong CMS.
 try{window.HLS_DUONG_DAN&&window.HLS_DUONG_DAN.bang();}catch(_){}
 if(typeof persons!=='undefined')for(const [ma,va] of Object.entries(L['nhan-vat']||{})){
  if(persons[ma])tron(persons[ma],va);
  else if(va.moi)persons[ma]=tron({name:'',period:'',role:'',desc:'',ties:[],stories:[],battles:[],country:'vn',classification:'biên soạn'},va);
 }
 if(typeof details!=='undefined')for(const [ma,va] of Object.entries(L['trieu-dai']||{}))if(details[ma]){tron(details[ma],va);doiNhanEras(ma,va.name);}
 const sk=(window.VS59_DATA&&window.VS59_DATA.su_kien)||[];
 for(const [ma,va] of Object.entries(L['su-kien']||{})){
  if(typeof battles!=='undefined'&&battles[ma]){tron(battles[ma],va);doiNhanEras(ma,va.name);}
  const e=sk.find(x=>x.id===ma);if(e){tron(e,va);doiNhanEras(ma,va.ten);}
 }
 if(typeof hcmEvents!=='undefined')for(const [ma,va] of Object.entries(L.hcm||{})){const y=+String(ma).replace('hcm:','');const e=hcmEvents.find(x=>x.year===y);if(!e)continue;
   const v2={...va};if(typeof v2.detail==='string')v2.detail=v2.detail.split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean).map(escH).join('</p><p>');
   tron(e,v2);}
 const sgk=window.VS58_SGK&&window.VS58_SGK.lop;
 if(sgk)for(const [ma,va] of Object.entries(L['bai-sgk']||{})){const m=ma.match(/^g(\d+)-sgk-(.+)$/);if(!m||!sgk[m[1]])continue;
  const b=sgk[m[1]].bai.find(x=>String(x.so).toLowerCase().replace('cđ','cd')===m[2]);if(b)tron(b,va);}
 apMenu((L.menu||{}).chinh);
 apTroLy((L['cai-dat']||{})['tro-ly']);
 try{window.HLS_DUONG_DAN&&window.HLS_DUONG_DAN.boSung();}catch(_){}
 // Vẽ lại các phần đã dựng sẵn lúc tải trang.
 try{if(L.hcm&&typeof buildHCM==='function')buildHCM();}catch(e){console.warn(e);}
 try{if((L['trieu-dai']||L['su-kien'])&&typeof timelineRender==='function')timelineRender();}catch(e){console.warn(e);}
}
function apMenu(cfg){
 if(!cfg||!Array.isArray(cfg.muc))return;
 const nhom={};
 cfg.muc.forEach((m,i)=>{for(const sel of MENU[m.id]||[]){
  const el=sel.startsWith('[')?document.querySelector('.nav'+sel)||document.querySelector(sel):document.getElementById(sel);
  if(!el)continue;
  if(m.nhan){const sp=[...el.querySelectorAll(':scope > span')].find(s=>!s.classList.contains('nav-icon'));
   if(sp){const ch=sp.querySelector('.v21-chevron');sp.textContent=m.nhan+(ch?' ':'');if(ch)sp.appendChild(ch);}
   else el.setAttribute('aria-label',m.nhan);
   el.title=m.nhan;}
  el.style.display=m.an?'none':'';
  el.style.order=String(i);
  const cha=el.parentElement;if(cha){(nhom[cha.dataset.hlsNhom||(cha.dataset.hlsNhom=Math.random().toString(36).slice(2))]=cha);}
 }});
 // Sắp thứ tự: di chuyển nút trong cùng khung theo thứ tự cấu hình (giữ nguyên các phần tử khác).
 for(const cha of Object.values(nhom)){
  const nut=[...cha.children].filter(c=>c.style.order!=='');
  const theo=nut.slice().sort((a,b)=>+a.style.order-+b.style.order);
  const moc=nut.length?nut[0]:null;if(!moc)continue;
  const truoc=moc.previousSibling;let sau=truoc?truoc.nextSibling:cha.firstChild;
  for(const n of theo){cha.insertBefore(n,sau);sau=n.nextSibling;}
  // Khung chọn lớp SGK luôn theo ngay sau nút SGK.
  const lop=document.getElementById('v21Grades'),sgk=document.getElementById('navSchool');
  if(lop&&sgk&&lop.parentElement===cha)cha.insertBefore(lop,sgk.nextSibling);
 }
}

/* ---------- Trợ lý Học Lịch Sử: bật/tắt, tên, biểu tượng, lời chào (CMS → Trợ lý AI) ---------- */
function apTroLy(c){
 if(!c)return;
 let css='';
 if(c.bat===false)css+='#aiOpen,#historyAI{display:none!important}';
 if(c.bieu_tuong&&/^(\/static\/|https:\/\/)[^"'()\s]+$/.test(c.bieu_tuong))
  css+='html body #aiOpen .ai-mascot,html body #historyAI .ai-header-mascot,html body .ai-mascot{animation:none!important;background-image:url("'+c.bieu_tuong+'")!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important}';
 if(css){const st=document.createElement('style');st.id='hlsTroLy';st.textContent=css;document.head.appendChild(st);}
 if(c.ten){const t=document.querySelector('#aiOpen .ai-open-text');if(t)t.textContent=c.ten;}
 if(c.loi_chao){const p=document.querySelector('#aiMessages .ai-bubble p');if(p)p.textContent=c.loi_chao;}
}

/* ---------- Nút “✎ Sửa” cho người biên tập ---------- */
const LOAI_CMS={'nhan-vat':'nhan-vat','trieu-dai':'trieu-dai','su-kien':'su-kien','hcm':'hcm','bai-hoc':'bai-sgk'};
function nutSua(){
 if(!/(?:^|;\s*)hls_bt=1/.test(document.cookie))return;
 fetch('/api/v6/toi',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
  if(!j||!j.tai_khoan||!['quan-tri','bien-tap'].includes(j.tai_khoan.vai_tro))return;
  const st=document.createElement('style');
  st.textContent='.hls-nut-sua{margin-left:8px}.hls-thanh-bt{position:fixed;left:12px;bottom:12px;z-index:9999;background:#1f2930;color:#f6f0e4;border:1px solid #d6ac5c;border-radius:999px;padding:6px 14px;font:13px "Be Vietnam Pro",system-ui;text-decoration:none}';
  document.head.appendChild(st);
  const a=document.createElement('a');a.className='hls-thanh-bt';a.href='/admin';a.textContent='✎ Quản trị · '+j.tai_khoan.ten;document.body.appendChild(a);
  const gan=()=>{
   const row=document.querySelector('#overlay.show .v31-share-row');if(!row)return;
   let b=row.querySelector('.hls-nut-sua');
   const H=window.HLS_DUONG_DAN;if(!H)return;
   const p=decodeURIComponent(location.pathname).slice((window.HLS_GOC||'/').length);
   const m=H.bang().theoDuong[p.endsWith('/')?p:p+'/'];
   const loai=m&&LOAI_CMS[m.loai];
   if(!loai){if(b)b.remove();return;}
   const ma=loai==='bai-sgk'?m.bai:m.ma;
   if(!b){b=document.createElement('a');b.className='v24-share-button hls-nut-sua';b.textContent='✎ Sửa';row.appendChild(b);}
   b.href='/admin#sua/'+loai+'/'+encodeURIComponent(ma);b.target='_blank';
  };
  const ov=document.getElementById('overlay');
  if(ov)new MutationObserver(()=>setTimeout(gan,50)).observe(ov,{attributes:true,attributeFilter:['class'],childList:true,subtree:false});
  window.addEventListener('popstate',()=>setTimeout(gan,80));
  const ps=history.pushState;history.pushState=function(){const r=ps.apply(this,arguments);setTimeout(gan,80);return r;};
 }).catch(()=>{});
}

/* Thẻ “Hồ sơ nhân vật” (v34) dùng dữ liệu riêng đóng kín → sửa trực tiếp trên khung đã vẽ. */
function suaTheV34(){
 const va=(BAN_VA['nhan-vat']||{});if(!Object.keys(va).length)return;
 const body=document.getElementById('modalbody');if(!body)return;
 const chay=()=>{
  const id=typeof active!=='undefined'?active:null;const v=id&&va[id];if(!v)return;
  const sec=body.querySelector('.v34-study .v34-person-head');if(!sec)return;
  const st=sec.closest('.v34-study');
  if(v.name){const h=sec.querySelector('h2');if(h&&h.textContent!==v.name)h.textContent=v.name;}
  if(v.role){const r=sec.querySelector('span');if(r&&r.textContent!==v.role)r.textContent=v.role;}
  if(v.bioParagraphs&&!st.dataset.hlsDaSua){st.dataset.hlsDaSua='1';
   st.querySelectorAll(':scope > p:not(.v34-source)').forEach(p=>p.remove());
   const nguon=st.querySelector('.v34-source');
   v.bioParagraphs.slice(0,5).forEach(t=>{const p=document.createElement('p');p.textContent=t;st.insertBefore(p,nguon);});}
 };
 new MutationObserver(()=>chay()).observe(body,{childList:true,subtree:true});
}

let xong;
window.HLS_CMS_SAN=new Promise(r=>xong=r);
function batDau(){
 if(!WEB||GOC_DU_LIEU){xong();return;}
 const hen=setTimeout(xong,2500);
 fetch('/api/v6/noi-dung',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{
  if(j&&j.noi_dung){BAN_VA=j.noi_dung;try{apDung(BAN_VA);suaTheV34();}catch(e){console.warn('HLS CMS',e);}}
 }).catch(()=>{}).finally(()=>{clearTimeout(hen);xong();});
 nutSua();
}
window.HLS_CMS={apDung,apMenu,banVa:()=>BAN_VA};
// CMS (/admin) đọc dữ liệu gốc qua khung ẩn: các biến const/let của trang không nằm trên window nên đưa ra qua hàm này.
window.HLS_LAY_GOC=()=>({persons:typeof persons!=='undefined'?persons:null,details:typeof details!=='undefined'?details:null,
 battles:typeof battles!=='undefined'?battles:{},hcmEvents:typeof hcmEvents!=='undefined'?hcmEvents:null,
 su_kien:(window.VS59_DATA&&window.VS59_DATA.su_kien)||[],sgk:window.VS58_SGK?window.VS58_SGK.lop:null});
if(document.readyState==='complete')batDau();else window.addEventListener('load',batDau);
})();
