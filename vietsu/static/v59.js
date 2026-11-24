/* Việt Sử V5.9 — theo yêu cầu chủ dự án (24/11/2026): tổng hợp các sách mới trong "Tài liệu sử".
   1) Nhân vật mới: Từ điển nhân vật lịch sử Việt Nam, Những tấm gương anh hùng liệt sĩ của tuổi trẻ Việt Nam.
   2) Dòng thời gian Chủ tịch Hồ Chí Minh: nội dung từng mốc theo Tiểu sử Chủ tịch Hồ Chí Minh, thêm mốc mới.
   3) Dòng thời gian chung: thêm sự kiện theo Việt sử toàn thư (Phạm Văn Sơn).
   Dữ liệu: static/v59-data.js (VS59_DATA, sinh bởi tools/build_v59.py). Nội dung viết lại bằng lời mới, chờ thẩm định. */
(function(){
'use strict';
const D=window.VS59_DATA;if(!D)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P=()=>typeof persons!=='undefined'?persons:null;
const SK=Object.create(null);(D.su_kien||[]).forEach(e=>SK[e.id]=e);
const ten=id=>{const p=P()&&P()[id];return p?p.name:id};
const namChu=y=>y<0?Math.abs(y)+' TCN':String(y);

/* ---------- 1. Nhân vật ---------- */
function themNhanVat(){
 const ps=P();if(!ps)return 0;let n=0;
 (D.nhan_vat||[]).forEach(x=>{
  const nguon='Nguồn: '+x.src+'. Bản tóm lược viết lại, chờ thẩm định.';
  if(ps[x.id]){ // hồ sơ đã có: bổ sung tiểu sử nếu còn sơ sài
   const p=ps[x.id];
   if(x.bo_sung&&!p.vs59&&(!p.bioParagraphs||p.bioParagraphs.join(' ').length<x.bio.join(' ').length)){
    p.bioParagraphs=[...x.bio,nguon];p.desc=x.bio.join(' ');if(x.period)p.period=x.period;p.sourceBook=x.src;p.vs59=true;n++;
   }
   return;
  }
  ps[x.id]={name:x.name,period:x.period,role:x.role,desc:x.bio.join(' '),bioParagraphs:[...x.bio,nguon],sourceBook:x.src,
   classification:'sử liệu',country:'vn',ties:(x.lien||[]).filter(id=>ps[id]).map(id=>[ten(id),id]),stories:[],battles:[],kind:x.nhom||'',vs59:true};
  n++;
 });
 // Gắn vào tab Nhân vật của triều đại tương ứng.
 if(typeof details!=='undefined'){
  (D.nhan_vat||[]).forEach(x=>{
   if(!x.trieu)return;const d=details[x.trieu];if(!d)return;
   if(!Array.isArray(d.people))d.people=[];
   if(!d.people.some(p=>p[3]===x.id))d.people.push([x.name,x.role,/tướng|quân|chiến/i.test(x.role)?'sword':'hat',x.id]);
  });
 }
 return n;
}
/* Bổ sung tiểu sử Hồ Chí Minh vào hồ sơ nhân vật */
function hoSoHCM(){
 const ps=P();if(!ps||!ps.hochiminh||!D.hcm_ho_so)return;
 const p=ps.hochiminh;if(p.vs59)return;
 p.bioParagraphs=[...D.hcm_ho_so,'Nguồn: '+D.hcm_nguon+'.'];p.desc=D.hcm_ho_so.join(' ');p.sourceBook=D.hcm_nguon;p.vs59=true;
}

/* ---------- 2. Dòng thời gian Hồ Chí Minh ---------- */
function capNhatHCM(){
 if(typeof hcmEvents==='undefined'||!Array.isArray(hcmEvents)||!D.hcm)return;
 D.hcm.forEach(m=>{
  const detail=m.doan.map(esc).join('</p><p>')+'</p><p class="vs59-nguon">Nguồn: '+esc(D.hcm_nguon)+(m.trang?', tr. '+esc(m.trang):'')+(m.bo_sung?' (mốc bổ sung theo tiểu sử chính thức, chờ thẩm định)':'')+'. Viết lại bằng lời mới, chờ thẩm định.';
  const e=hcmEvents.find(x=>x.year===m.nam);
  if(e){e.date=m.ngay;e.title=m.ten;e.detail=detail;}
  else hcmEvents.push({year:m.nam,date:m.ngay,title:m.ten,detail});
 });
 hcmEvents.sort((a,b)=>a.year-b.year);
 // Giãn trục ở những giai đoạn dày mốc để thẻ không chồng lên nhau.
 if(typeof hcmX==='function'&&!window.__vs59X){
  const cu=hcmX;const gian=(y,a,b,k)=>Math.max(0,Math.min(y,b)-a)*k;
  hcmX=function(y){return cu(y)+gian(y,1911,1947,46)+gian(y,1950,1970,22)};
  window.__vs59X=true;
 }
 if(typeof buildHCM==='function'&&!window.__vs59Build){
  const cu=buildHCM;buildHCM=function(){const r=cu.apply(this,arguments);xepThe();return r};window.__vs59Build=true;
 }
 try{if(typeof buildHCM==='function')buildHCM();}catch(err){console.warn('V5.9 HCM',err)}
}
/* Bài viết theo chặng (thay "Đề cương bài viết cùng chặng") */
function baiChang(){
 const BV=D.hcm_bai_viet||[];if(!BV.length||typeof v2HcmExtra!=='function'||window.__vs59Bai)return;
 v2HcmExtra=function(year){
  const bv=BV.filter(b=>b.chang<=year).sort((a,b)=>b.chang-a.chang)[0]||BV[0];
  const i=BV.indexOf(bv),sau=BV[i+1],ket=sau?sau.chang:9999;
  const moc=typeof hcmEvents!=='undefined'?hcmEvents.filter(e=>e.year>=bv.chang&&e.year<ket):[];
  let h='<div class="panel vs59-bai"><span class="chip">BÀI VIẾT THEO CHẶNG · '+(i+1)+'/'+BV.length+'</span><h3>'+esc(bv.ten)+'</h3>';
  h+=bv.doan.map(t=>'<p>'+esc(t)+'</p>').join('');
  if(moc.length)h+='<div class="vs59-moc"><b>Các mốc trong chặng</b><div class="vs59-nut">'+moc.map(e=>'<button type="button" class="secondary'+(e.year===year?' vs59-dang':'')+'" onclick="openHCM('+e.year+')">'+esc(e.date)+' · '+esc(e.title)+'</button>').join('')+'</div></div>';
  h+='<p class="vs59-nguon">Nguồn: '+esc(D.hcm_nguon)+', tr. '+esc(bv.trang)+'. Tóm lược bằng lời mới, chờ thẩm định.</p></div>';
  try{if(typeof V2_SOURCES!=='undefined'&&V2_SOURCES.hcm)h=h.replace(/<\/div>$/,'<p><a style="color:#f1d7a0" href="'+esc(V2_SOURCES.hcm)+'" target="_blank" rel="noopener">Tư liệu tiểu sử của Bảo tàng Hồ Chí Minh ↗</a></p></div>');}catch(err){}
  let canh='';try{if(year<=1901&&typeof v2SceneHtml==='function'&&typeof V2_EXPERIENCES!=='undefined')canh=v2SceneHtml(V2_EXPERIENCES[0]);}catch(err){}
  return h+canh;
 };
 window.__vs59Bai=true;
}
/* Xếp thẻ mốc vào 3 hàng, đẩy sang phải khi chật để không chồng nhau */
function xepThe(){
 const tr=document.getElementById('hcmTrack');if(!tr)return;
 const the=[...tr.querySelectorAll('.hcm-event')];if(!the.length)return;
 const W=176,GAP=8,TOP=[150,228,306];const cuoi=TOP.map(()=>-1e9);
 the.map(e=>({e,x:parseFloat(e.style.left)||0})).sort((a,b)=>a.x-b.x).forEach(({e,x})=>{
  let lane=cuoi.findIndex(r=>r+GAP<=x-W/2);
  if(lane<0){lane=cuoi.indexOf(Math.min(...cuoi));x=cuoi[lane]+GAP+W/2;}
  e.style.left=x+'px';e.style.top=TOP[lane]+'px';e.classList.add('vs59-the');cuoi[lane]=x+W/2;
 });
 if(typeof hcmX==='function')tr.style.setProperty('width',Math.round(hcmX(2026)+140)+'px','important');
}

/* ---------- 3. Sự kiện trên Dòng thời gian ---------- */
function themSuKien(){
 if(typeof eras==='undefined'||!Array.isArray(eras))return 0;let n=0;
 (D.su_kien||[]).forEach(e=>{
  let row=eras.find(r=>r.y===e.nam);
  if(!row){
   const truoc=eras.filter(r=>r.y<e.nam).sort((a,b)=>b.y-a.y)[0];
   const nien=x=>{const d=typeof details!=='undefined'&&details[x[2]];return d&&d.period?d.period:(/\d{3,4}\s*[–-]\s*\d{3,4}/.test(x[1])?x[1]:'')};
   row={y:e.nam,v:truoc?truoc.v.map(x=>[x[0],nien(x)||x[1],x[2]]):[],c:truoc&&truoc.c?truoc.c.map(x=>[x[0],x[1],x[2]]):[],ve:[]};
   if(Array.isArray(e.hang)&&e.hang.length===3)row.v=[e.hang.slice()];
   eras.push(row);
  }
  row.ve=row.ve||[];
  if(!row.ve.some(x=>x[1]===e.id)){row.ve.push([e.bieu_tuong+' '+e.ten,e.id]);n++;}
 });
 eras.sort((a,b)=>a.y-b.y);
 try{timelineRender();if(typeof initHorizontalNav==='function')initHorizontalNav();}catch(err){console.warn('V5.9 timeline',err)}
 return n;
}
const LOAI={'⚔':'CHIẾN SỰ','✦':'KHỞI NGHĨA – PHONG TRÀO','⚑':'CHÍNH TRỊ – NGOẠI GIAO','◈':'VĂN HÓA – XÃ HỘI'};
function moSuKien(id){
 const e=SK[id];if(!e)return false;
 const ps=P()||{};
 let h='<div class="vs59-doc"><p class="vs59-nam">'+esc(namChu(e.nam))+' · '+esc(LOAI[e.bieu_tuong]||'SỰ KIỆN')+'</p>';
 h+=e.doan.map(t=>'<p>'+esc(t)+'</p>').join('');
 const lien=(e.lien||[]).filter(x=>ps[x]);
 if(lien.length)h+='<section><h3>Nhân vật liên quan</h3><div class="vs59-nut">'+lien.map(x=>'<button type="button" class="secondary" onclick="openItem(\''+esc(x)+'\')">'+esc(ps[x].name)+' ↗</button>').join('')+'</div></section>';
 h+='<div class="vs59-nut"><button type="button" class="secondary" data-vs59-nam="'+esc(e.nam)+'">Đến năm '+esc(namChu(e.nam))+' trên Dòng thời gian ↗</button></div>';
 h+='<p class="vs59-nguon">Nguồn: '+esc(e.src)+'. Viết lại bằng lời mới, chờ thẩm định.</p></div>';
 document.getElementById('modtype').textContent='SỰ KIỆN LỊCH SỬ';
 document.getElementById('modtitle').textContent=e.ten;
 const md=document.getElementById('moddesc');if(md)md.textContent=namChu(e.nam);
 document.getElementById('tabs').innerHTML='';
 const body=document.getElementById('modalbody');body.innerHTML=h;body.scrollTop=0;
 if(typeof updateBackButton==='function')try{updateBackButton()}catch(err){}
 return true;
}
/* Hồ sơ nhân vật V5.9: hiện đủ các đoạn tiểu sử và nguồn */
function hoSoDayDu(){
 const ps=P();if(!ps||typeof active!=='string'||typeof tab==='undefined'||tab!=='overview')return;
 const p=ps[active];if(!p||!p.vs59||!p.bioParagraphs)return;
 const bio=document.getElementById('v24-bio');
 if(bio)bio.innerHTML='<h3>Tiểu sử và thời đại</h3>'+p.bioParagraphs.map((t,i,a)=>'<p'+(i===a.length-1?' class="vs59-nguon"':'')+'>'+esc(t)+'</p>').join('');
 const head=document.querySelector('.v24-article-header .panel > p');if(head)head.textContent=p.bioParagraphs[0];
 document.querySelectorAll('.v24-article-facts dt').forEach(dt=>{if(/Nguồn/.test(dt.textContent)&&dt.nextElementSibling)dt.nextElementSibling.textContent=(p.sourceBook||'')+' · chờ thẩm định';});
}
function caiModal(){
 if(typeof renderModal!=='function'||window.__vs59Modal)return;
 const cu=renderModal;
 renderModal=function(){if(typeof active==='string'&&SK[active]&&moSuKien(active))return;const r=cu.apply(this,arguments);try{hoSoDayDu()}catch(err){}return r};
 window.__vs59Modal=true;
 document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-vs59-nam]');if(!b)return;
  const y=Number(b.getAttribute('data-vs59-nam'));
  if(typeof closeModal==='function')closeModal();
  if(typeof showSection==='function')showSection('main');
  setTimeout(()=>{const el=document.getElementById('year-'+y);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});},250);
 });
}

function chay(){
 const n=themNhanVat();hoSoHCM();caiModal();baiChang();const m=themSuKien();capNhatHCM();
 try{if(typeof v25RenderCharacters==='function')v25RenderCharacters();}catch(err){}
 document.documentElement.dataset.vs59=n+'/'+m;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(chay,0));else setTimeout(chay,0);
})();
