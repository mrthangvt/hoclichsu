/* Việt Sử V5.8 — theo yêu cầu chủ dự án (23/11/2026):
   Sách giáo khoa Lịch sử lớp 6, lớp 7: mục lục đúng theo SGK Lịch sử và Địa lí 6, 7 (bộ Kết nối tri thức với cuộc sống)
   và nội dung từng bài do Việt Sử biên soạn lại bằng lời văn riêng (dữ liệu trong v58-sgk.js, nguồn vietsu/data/sgk_kntt_lop*.json).
   Chỉ thay danh sách bài của lớp 6, 7; giao diện mục lục (V2.4, #v22Toc) và các lớp khác giữ nguyên. */
(function(){
'use strict';
const SGK=window.VS58_SGK;
if(!SGK||typeof V21_LESSONS!=='object')return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const BAI={};
const tenBai=b=>typeof b.so==='number'?'Bài '+b.so:'Chủ đề chung '+String(b.so).replace('CĐ','');
const maBai=(g,b)=>'g'+g+'-sgk-'+String(b.so).toLowerCase().replace('cđ','cd');
const namChu=y=>y===null||y===undefined?'':(y<0?Math.abs(y)+' TCN':String(y));

/* 1. Thay danh sách bài lớp 6, 7 (giữ các trường mà mã cũ dùng: mục lục, tìm kiếm) */
for(const [g,sach] of Object.entries(SGK.lop)){
 V21_LESSONS[g]=sach.bai.map(b=>{
  const id=maBai(g,b);BAI[id]={g,b,sach};
  return {id,grade:Number(g),lesson_number:typeof b.so==='number'?b.so:String(b.so),part_number:null,toc_title:tenBai(b)+': '+b.ten,
   title:b.ten,part:typeof b.so==='number'?'Phần Lịch sử':'Chủ đề chung (Lịch sử và Địa lí)',chapter:b.chuong,year:b.nam??null,entity_id:'',
   summary:b.tom,review_questions:b.hoi,status:'đã biên soạn',
   curriculum:'Theo SGK Lịch sử và Địa lí '+g+' (Kết nối tri thức với cuộc sống), tr. '+b.trang.join('–'),
   source_url:'',source_type:'biên soạn lại, không sao chép nguyên văn',toc_verified:true};
 });
}

/* 2. Mục lục: sửa nhãn bài, trạng thái, thêm dòng nguồn (sau mỗi lần V2.4 vẽ lại #v22Toc) */
function sua(toc){
 const g=String(typeof v21CurrentGrade!=='undefined'?v21CurrentGrade:'');const sach=SGK.lop[g];
 if(!sach||toc.dataset.vs58==='1')return;
 toc.dataset.vs58='1';
 toc.querySelectorAll('.v22-lesson[data-v22-id]').forEach(nut=>{
  const x=BAI[nut.dataset.v22Id];if(!x)return;
  const so=nut.querySelector('.v22-lesson-number');if(so)so.textContent=typeof x.b.so==='number'?'Bài '+x.b.so:String(x.b.so);
  const nho=nut.querySelector('.v22-lesson-content small');
  if(nho)nho.textContent='Đã biên soạn · SGK tr. '+x.b.trang.join('–')+(x.b.nam===null||x.b.nam===undefined?'':' · Mốc '+namChu(x.b.nam));
 });
 const nguon=document.createElement('div');nguon.className='vs58-nguon';
 nguon.innerHTML='<b>Theo SGK '+esc(sach.sach)+'</b><span>'+esc(sach.ghi_chu)+'</span>';
 toc.prepend(nguon);
}
const toc=document.getElementById('v22Toc');
if(toc){
 new MutationObserver(()=>{if(toc.dataset.vs58!=='1'||!toc.querySelector('.vs58-nguon')){toc.dataset.vs58='';sua(toc);}}).observe(toc,{childList:true});
 sua(toc);
}

/* 3. Mở một bài */
function moBai(id){
 const x=BAI[id];if(!x)return false;const {g,b,sach}=x;
 let h='<div class="vs58-doc">';
 h+='<p class="vs58-tom">'+esc(b.tom)+'</p>';
 for(const [tieuDe,y] of b.muc){h+='<section><h3>'+esc(tieuDe)+'</h3><ul>'+y.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></section>';}
 h+='<section class="vs58-nho"><h3>Ghi nhớ</h3><ul>'+b.nho.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></section>';
 h+='<section class="vs58-hoi"><h3>Câu hỏi ôn tập</h3><ol>'+b.hoi.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></section>';
 let nut='';
 if(b.nam!==null&&b.nam!==undefined)nut+='<button type="button" class="secondary" data-vs58-nam="'+esc(b.nam)+'">Đến năm '+esc(namChu(b.nam))+' trên timeline ↗</button>';
 if(b.sa_ban)nut+='<a class="secondary vs58-saban" href="'+esc(b.sa_ban.url)+'" target="_blank" rel="noopener noreferrer">'+esc(b.sa_ban.ten)+' ↗</a>';
 if(nut)h+='<div class="vs58-nut">'+nut+'</div>';
 h+='<p class="vs58-chu">Mở SGK Lịch sử và Địa lí '+esc(g)+', trang '+esc(b.trang.join('–'))+' để xem tư liệu, hình ảnh và hoạt động của bài. '+esc(sach.ghi_chu)+'</p></div>';
 document.getElementById('modtype').textContent='SÁCH GIÁO KHOA LỊCH SỬ · LỚP '+g;
 document.getElementById('modtitle').textContent=tenBai(b)+': '+b.ten;
 document.getElementById('moddesc').textContent=b.chuong;
 document.getElementById('tabs').innerHTML='';document.getElementById('modalbody').innerHTML=h;
 document.getElementById('overlay').classList.add('show');
 if(typeof setModalView==='function')setModalView('full');
 document.body.style.overflow='hidden';
 return true;
}
for(const ten of ['v22OpenLesson','v21OpenLesson']){
 const cu=window[ten];
 window[ten]=function(id){if(moBai(id))return;if(typeof cu==='function')return cu.apply(this,arguments);};
}
document.addEventListener('click',e=>{
 const n=e.target.closest('[data-vs58-nam]');
 if(!n)return;
 e.preventDefault();
 const y=Number(n.getAttribute('data-vs58-nam'));
 if(typeof closeModal==='function')closeModal();
 if(typeof v21GoYear==='function')v21GoYear(y);
});
document.documentElement.dataset.vietsuRelease='5.8';
})();
