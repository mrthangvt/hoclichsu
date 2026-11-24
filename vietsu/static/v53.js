/* Việt Sử V5.3 — theo yêu cầu chủ dự án (22/11/2026):
   1) Gom các mục "Sách lịch sử lớp 6–12" vào trong "Sách giáo khoa Lịch sử" (chọn lớp ở phần nội dung).
   2) Thay logo Việt Sử (bản tối / bản sáng).
   3) Popup chiến trận trên dòng thời gian: mục "Sa bàn tương tác" có nút vào sa bàn 3D nếu trận đó đã có sa bàn. */
(function(){
'use strict';
const $=id=>document.getElementById(id);

/* Chỉ ghi những trận đã có trang sa bàn thật trong vietsu/static/khong-gian/. */
const SA_BAN_3D={
 battle1785:{title:'Rạch Gầm – Xoài Mút 1785',href:'khong-gian/rach-gam-xoai-mut/'},
 battle1789:{title:'Ngọc Hồi – Đống Đa 1789',href:'khong-gian/ngoc-hoi-dong-da/'},
 war1954:{title:'Điện Biên Phủ 1954',href:'khong-gian/dien-bien-phu/'},
 war1972:{title:'Thành cổ Quảng Trị 1972',href:'khong-gian/thanh-co-quang-tri/'},
 war1975:{title:'Chiến dịch Hồ Chí Minh 1975',href:'khong-gian/engine/2.2.0/sa-ban.html?goi=ho-chi-minh-1975'}
};

/* ---------- 1. Logo ---------- */
function logoImgs(kind){
 const wrap=document.createElement('span');wrap.className='vs53-logo vs53-logo-'+kind;
 for(const theme of ['toi','sang']){
  const img=document.createElement('img');
  img.className='vs53-logo-'+theme;
  img.src='static/v53/'+(kind==='chu'?'logo-chu-':'logo-')+theme+'.webp';
  img.alt=theme==='toi'?'Việt Sử — Dân ta phải biết sử ta':'';
  if(theme==='sang')img.setAttribute('aria-hidden','true');
  img.decoding='async';
  wrap.append(img);
 }
 return wrap;
}
function goHome(e){
 if(e.type==='keydown'&&!['Enter',' '].includes(e.key))return;
 e.preventDefault();
 if(typeof window.showSection==='function')window.showSection('main');
 window.scrollTo({top:0,behavior:'smooth'});
}
function setLogo(){
 const seal=document.querySelector('aside .seal');
 if(seal&&!seal.querySelector('.vs53-logo')){
  seal.classList.add('vs53-seal');seal.append(logoImgs('day-du'));
  seal.setAttribute('role','link');seal.tabIndex=0;seal.title='Về dòng thời gian sử Việt';
  seal.addEventListener('click',goHome);seal.addEventListener('keydown',goHome);
 }
 const mob=document.querySelector('.v31-mobile-brand');
 if(mob&&!mob.querySelector('.vs53-logo')){
  mob.classList.add('vs53-mobile-brand');mob.append(logoImgs('chu'));mob.setAttribute('aria-label','Việt Sử');
 }
}

/* ---------- 2. Sách giáo khoa: danh sách lớp chỉ hiện trong phần nội dung ---------- */
function folds(){
 const grades=$('v21Grades');if(grades)grades.setAttribute('aria-hidden','true');
 const nav=$('navSchool');if(nav)nav.setAttribute('aria-label','Sách giáo khoa Lịch sử — chọn lớp 6 đến 12 trong trang');
}

/* ---------- 3. Nút vào sa bàn 3D trong popup chiến trận ---------- */
function saBanButton(){
 if(typeof window.modalType!=='function'||window.modalType()!=='battle')return;
 const id=typeof active==='string'?active:'';
 const item=SA_BAN_3D[id];if(!item)return;
 const body=$('modalbody');if(!body||body.querySelector('.vs53-3d'))return;
 const head=[...body.querySelectorAll('.panel > h3')].find(h=>h.textContent.trim().startsWith('Sa bàn tương tác'));
 if(!head)return;
 const box=document.createElement('div');box.className='vs53-3d';
 const text=document.createElement('div');text.className='vs53-3d-text';
 const tag=document.createElement('span');tag.className='vs53-3d-tag';tag.textContent='ĐÃ CÓ SA BÀN 3D';
 const name=document.createElement('b');name.textContent=item.title;
 const note=document.createElement('small');note.textContent='Tái dựng mô phỏng · mở trong thẻ mới';
 text.append(tag,name,note);
 const a=document.createElement('a');a.className='v46-3d-button vs53-3d-button';
 a.href=item.href;a.target='_blank';a.rel='noopener noreferrer';
 const b3=document.createElement('b');b3.className='v46-3d-badge';b3.textContent='3D';
 a.append(b3,document.createTextNode('Vào sa bàn 3D'));
 box.append(text,a);
 head.insertAdjacentElement('afterend',box);
}

function init(){
 setLogo();folds();
 if(typeof window.renderModal==='function'){
  const old=window.renderModal;
  window.renderModal=function(){const r=old.apply(this,arguments);saBanButton();return r;};
 }
 saBanButton();
 document.documentElement.dataset.vietsuRelease='5.3';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
