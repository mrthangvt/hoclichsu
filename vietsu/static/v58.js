/* Việt Sử V5.8 — theo yêu cầu chủ dự án (23/11/2026):
   1) Sách giáo khoa Lịch sử lớp 6–12: mục lục đúng theo SGK bộ Kết nối tri thức với cuộc sống (Lịch sử và Địa lí 6–9,
      Lịch sử 10–12); lớp 6, 7 có nội dung từng bài do Việt Sử biên soạn lại bằng lời văn riêng; lớp 8–12 có tóm tắt,
      nội dung chi tiết đang biên soạn. Dữ liệu trong v58-sgk.js (nguồn vietsu/data/sgk_kntt_lop*.json).
   2) Cửa sổ bài học có nút Bài trước / Bài tiếp theo.
   3) Giữ icon Chủ tịch Hồ Chí Minh trên menu khi chọn mục đó.
   4) Ảnh chặng "Thơ ấu và trưởng thành" của Chủ tịch Hồ Chí Minh dùng ảnh minh họa mới (static/v58/hcm-tho-au.webp). */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

/* ---------- 1. Sách giáo khoa ---------- */
const SGK=window.VS58_SGK;
const BAI={},THU_TU={};
const tenBai=b=>typeof b.so==='number'?'Bài '+b.so:'Chủ đề chung '+String(b.so).replace('CĐ','');
const maBai=(g,b)=>'g'+g+'-sgk-'+String(b.so).toLowerCase().replace('cđ','cd');
const namChu=y=>y===null||y===undefined?'':(y<0?Math.abs(y)+' TCN':String(y));
const dangBienSoan=b=>!!b.dang_bien_soan&&!b.muc;
if(SGK&&typeof V21_LESSONS==='object'){
 for(const [g,sach] of Object.entries(SGK.lop)){
  THU_TU[g]=[];
  V21_LESSONS[g]=sach.bai.map(b=>{
   const id=maBai(g,b);BAI[id]={g,b,sach};THU_TU[g].push(id);
   const chu=Number(g)>=10||/^Chủ đề/.test(b.chuong);
   return {id,grade:Number(g),lesson_number:typeof b.so==='number'?b.so:String(b.so),part_number:null,toc_title:tenBai(b)+': '+b.ten,
    title:b.ten,part:typeof b.so==='number'?(chu?'Lịch sử '+g:'Phần Lịch sử'):'Chủ đề chung (Lịch sử và Địa lí)',chapter:b.chuong,year:b.nam??null,entity_id:'',
    summary:b.tom,review_questions:b.hoi||[],status:dangBienSoan(b)?'đang biên soạn':'đã biên soạn',
    curriculum:'Theo SGK '+sach.sach.split(' (')[0]+' (Kết nối tri thức với cuộc sống), tr. '+b.trang.join('–'),
    source_url:'',source_type:'biên soạn lại, không sao chép nguyên văn',toc_verified:true};
  });
 }
}

/* Mục lục V2.4 (#v22Toc): nhãn bài, trạng thái, dòng nguồn */
function sua(toc){
 const g=String(typeof v21CurrentGrade!=='undefined'?v21CurrentGrade:'');const sach=SGK&&SGK.lop[g];
 if(!sach||toc.dataset.vs58==='1')return;
 toc.dataset.vs58='1';
 toc.querySelectorAll('.v22-lesson[data-v22-id]').forEach(nut=>{
  const x=BAI[nut.dataset.v22Id];if(!x)return;
  const so=nut.querySelector('.v22-lesson-number');if(so)so.textContent=typeof x.b.so==='number'?'Bài '+x.b.so:String(x.b.so);
  const nho=nut.querySelector('.v22-lesson-content small');
  if(nho)nho.textContent=(dangBienSoan(x.b)?'Đang biên soạn':'Đã biên soạn')+' · SGK tr. '+x.b.trang.join('–')+(x.b.nam===null||x.b.nam===undefined?'':' · Mốc '+namChu(x.b.nam));
 });
 const nguon=document.createElement('div');nguon.className='vs58-nguon';
 nguon.innerHTML='<b>Theo SGK '+esc(sach.sach)+'</b><span>'+esc(sach.ghi_chu)+'</span>';
 toc.prepend(nguon);
}
const toc=document.getElementById('v22Toc');
if(toc&&SGK){
 new MutationObserver(()=>{if(toc.dataset.vs58!=='1'||!toc.querySelector('.vs58-nguon')){toc.dataset.vs58='';sua(toc);}}).observe(toc,{childList:true});
 sua(toc);
}

function nutChuyen(id){
 const {g}=BAI[id];const ds=THU_TU[g];const i=ds.indexOf(id);
 const truoc=ds[i-1],sau=ds[i+1];
 const nhan=k=>{const b=BAI[k].b;return tenBai(b)+': '+b.ten;};
 return '<nav class="vs58-chuyen" aria-label="Chuyển bài">'+
  (truoc?'<button type="button" class="secondary" data-vs58-mo="'+esc(truoc)+'" title="'+esc(nhan(truoc))+'">← Bài trước</button>':'<span></span>')+
  '<span class="vs58-vitri">'+(i+1)+' / '+ds.length+'</span>'+
  (sau?'<button type="button" class="secondary vs58-tiep" data-vs58-mo="'+esc(sau)+'" title="'+esc(nhan(sau))+'">Bài tiếp theo →</button>':'<span></span>')+'</nav>';
}
function moBai(id){
 const x=BAI[id];if(!x)return false;const {g,b,sach}=x;
 let h='<div class="vs58-doc">'+nutChuyen(id);
 h+='<p class="vs58-tom">'+esc(b.tom)+'</p>';
 if(b.muc){
  for(const [tieuDe,y] of b.muc){h+='<section><h3>'+esc(tieuDe)+'</h3><ul>'+y.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></section>';}
  h+='<section class="vs58-nho"><h3>Ghi nhớ</h3><ul>'+b.nho.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></section>';
  h+='<section class="vs58-hoi"><h3>Câu hỏi ôn tập</h3><ol>'+b.hoi.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></section>';
 }else{
  h+='<section class="vs58-cho"><h3>Nội dung chi tiết đang biên soạn</h3><p>Việt Sử đang biên soạn phần nội dung, ghi nhớ và câu hỏi ôn tập cho bài này. Trong lúc chờ, em hãy học theo SGK, trang '+esc(b.trang.join('–'))+'.</p></section>';
 }
 let nut='';
 if(b.nam!==null&&b.nam!==undefined)nut+='<button type="button" class="secondary" data-vs58-nam="'+esc(b.nam)+'">Đến năm '+esc(namChu(b.nam))+' trên timeline ↗</button>';
 if(b.sa_ban)nut+='<a class="secondary vs58-saban" href="'+esc(b.sa_ban.url)+'" target="_blank" rel="noopener noreferrer">'+esc(b.sa_ban.ten)+' ↗</a>';
 if(nut)h+='<div class="vs58-nut">'+nut+'</div>';
 h+='<p class="vs58-chu">Mở SGK '+esc(sach.sach.split(' (')[0])+', trang '+esc(b.trang.join('–'))+' để xem tư liệu, hình ảnh và hoạt động của bài. '+esc(sach.ghi_chu)+'</p>';
 h+=nutChuyen(id)+'</div>';
 document.getElementById('modtype').textContent='SÁCH GIÁO KHOA LỊCH SỬ · LỚP '+g;
 document.getElementById('modtitle').textContent=tenBai(b)+': '+b.ten;
 document.getElementById('moddesc').textContent=b.chuong;
 document.getElementById('tabs').innerHTML='';
 const body=document.getElementById('modalbody');body.innerHTML=h;
 document.getElementById('overlay').classList.add('show');
 if(typeof setModalView==='function')setModalView('full');
 document.body.style.overflow='hidden';
 body.scrollTop=0;const md=body.closest('.modal');if(md)md.scrollTop=0;
 return true;
}
if(SGK){
 for(const ten of ['v22OpenLesson','v21OpenLesson']){
  const cu=window[ten];
  window[ten]=function(id){if(moBai(id))return;if(typeof cu==='function')return cu.apply(this,arguments);};
 }
}
document.addEventListener('click',e=>{
 const m=e.target.closest('[data-vs58-mo]');
 if(m){e.preventDefault();moBai(m.getAttribute('data-vs58-mo'));return;}
 const n=e.target.closest('[data-vs58-nam]');
 if(!n)return;
 e.preventDefault();
 const y=Number(n.getAttribute('data-vs58-nam'));
 if(typeof closeModal==='function')closeModal();
 if(typeof v21GoYear==='function')v21GoYear(y);
});
document.addEventListener('keydown',e=>{
 const ov=document.getElementById('overlay');
 if(!ov||!ov.classList.contains('show')||e.target.closest('input,textarea,select'))return;
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 const nav=document.querySelector('#modalbody .vs58-chuyen');if(!nav)return;
 const nut=e.key==='ArrowRight'?nav.querySelector('.vs58-tiep'):nav.querySelector('button:not(.vs58-tiep)');
 if(nut){e.preventDefault();nut.click();}
});

/* ---------- 3. Icon Chủ tịch Hồ Chí Minh trên menu ---------- */
const ICON_HCM=(window.V49_REFERENCE&&window.V49_REFERENCE.menu)||'static/v49/hcm-menu.webp';
function giuIcon(){
 for(const id of ['navHCM','mobileHCM']){
  const icon=document.getElementById(id)?.querySelector('.nav-icon');
  if(!icon||icon.querySelector('img'))continue;
  icon.classList.remove('v30-hcm-mask');icon.style.removeProperty('--v30-hcm-mask');
  const img=document.createElement('img');img.src=ICON_HCM;img.alt='';img.width=28;img.height=28;img.style.objectFit='contain';
  icon.replaceChildren(img);
 }
}
/* ---------- 4. Ảnh chặng Thơ ấu và trưởng thành ---------- */
const ANH_THO_AU='static/v58/hcm-tho-au.webp';
function doiAnh(goc){
 (goc||document).querySelectorAll('img[alt*="Thơ ấu và trưởng thành"]').forEach(img=>{
  if(img.getAttribute('src')!==ANH_THO_AU){img.src=ANH_THO_AU;img.alt='Minh họa Hồ Chí Minh: Thơ ấu và trưởng thành (Nguyễn Sinh Cung)';img.dataset.vs58='1';}
 });
}
let hen=0;
new MutationObserver(()=>{if(hen)return;hen=requestAnimationFrame(()=>{hen=0;giuIcon();doiAnh();});})
 .observe(document.body,{childList:true,subtree:true});
giuIcon();doiAnh();
document.documentElement.dataset.vietsuRelease='5.8';
})();
