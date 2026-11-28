/* HỌC LỊCH SỬ V4.3 — asset paths must be copied from patch ZIP */
(function(){
'use strict';
const DIR='static/v43/';
const PERIODS={
vanlang:['Đông Sơn','outfit-dongson.webp','hat-dongson.webp','Thiên niên kỷ I TCN'],
hongbang:['Đông Sơn','outfit-dongson.webp','hat-dongson.webp','Thiên niên kỷ I TCN'],
aulac:['Đông Sơn','outfit-dongson.webp','hat-dongson.webp','Thiên niên kỷ I TCN'],
thuc:['Đông Sơn','outfit-dongson.webp','hat-dongson.webp','Thiên niên kỷ I TCN'],
ly:['Lý','outfit-ly.webp','hat-ly.webp','1009–1225'],
tran:['Trần','outfit-tran.webp','hat-tran.webp','1225–1400'],
leso:['Lê sơ','outfit-leso.webp','hat-leso.webp','1428–1527'],
'le-so':['Lê sơ','outfit-leso.webp','hat-leso.webp','1428–1527'],
mac:['Mạc và Lê Trung Hưng','outfit-letrung.webp','hat-letrung.webp','Thế kỷ XVI–XVIII'],
letrung:['Lê Trung Hưng','outfit-letrung.webp','hat-letrung.webp','1533–1789'],
'le-trung-hung':['Lê Trung Hưng','outfit-letrung.webp','hat-letrung.webp','1533–1789'],
tayson:['Tây Sơn','outfit-tayson.webp',null,'1771–1802'],
nguyen:['Nguyễn','outfit-nguyen.webp','hat-nguyen.webp','1802–1945'],
nguyenvn:['Nguyễn','outfit-nguyen.webp','hat-nguyen.webp','1802–1945']
};
const cache = new Map();
function check(file){if(!cache.has(file)){cache.set(file,new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src=DIR+file}))}return cache.get(file)}
function replace(img,file,alt){if(!img||!file)return;check(file).then(ok=>{if(!ok||!img.isConnected)return;img.src=DIR+file;img.alt=alt;img.loading='lazy';img.decoding='async'})}
function hcm(){
const root=document.getElementById('hcmHistory');if(!root)return;
for(const sel of ['.hcm-board .hcm-chapter','.hcm-mobile .hcm-mobile-chapter']){
 const cards=Array.from(root.querySelectorAll(sel));if(cards.length<6||cards[5].dataset.v43Hcm)return;
 const img=cards.map(c=>c.querySelector('.v29-stage-avatar img'));
 if(!img[2]||!img[3]||!img[5])continue;
 const original=img.map(el=>el?.src);
 img[2].src=original[3];img[3].src=original[5];
 img[2].alt='Minh họa Hồ Chí Minh — hoạt động ở nước ngoài, 1924–1941';
 img[3].alt='Minh họa Hồ Chí Minh — lãnh đạo Tổng khởi nghĩa Tháng Tám, 1941–1945';
 img[5].closest('.v29-stage-avatar')?.classList.add('v43-hcm-photo');
 replace(img[5],'hcm-1954-1969.webp','Ảnh Hồ Chí Minh làm việc; năm chụp chưa được đối chiếu');
 cards.forEach(c=>c.dataset.v43Hcm='done');
}
}
function timeline(){
for(const strip of document.querySelectorAll('#timeline .v41-icons[data-era]')){
 const p=PERIODS[strip.dataset.era];if(!p)continue;
 const clothes=strip.querySelector('.v41-outfit img'),hat=strip.querySelector('.v41-hair img');
 replace(clothes,p[1],'Trang phục thời '+p[0]+' — minh họa tham khảo');
 replace(hat,p[2],'Mũ và tóc thời '+p[0]+' — minh họa tham khảo');
 const tx=strip.querySelector('.v41-outfit small');if(tx)tx.textContent='Thời '+p[0]+' · '+p[3];
 const th=strip.querySelector('.v41-hair small');if(th&&p[2])th.textContent='Mũ & tóc · '+p[3];
}
const modern=document.querySelector('#year-1972 .era-cell.left');
if(modern&&!modern.querySelector('.v43-modern-entry')){
 const b=document.createElement('button');b.className='v43-modern-entry';b.type='button';
 b.innerHTML='<img alt="Quân phục khoảng 1970" loading="lazy"><span><b>Quân phục thập niên 1970</b><small>Tranh minh họa · xem bối cảnh chiến tranh</small></span>';
 replace(b.querySelector('img'),'outfit-modern.webp','Minh họa người lính QĐND khoảng năm 1970');
 b.addEventListener('click',()=>{if(typeof openItem==='function')openItem('vietnamwar')});
 modern.append(b);
}}
function register(){
const catalog=window.v35CostumeCatalog;if(!Array.isArray(catalog))return;
const added=new Set(catalog.map(x=>x.id));
for(const key of ['vanlang','ly','tran','leso','mac','letrung','tayson','nguyen']){
const p=PERIODS[key];
for(const [kind,file] of [['phuc-trang',p[1]],['mu-toc',p[2]]]){
 if(!file)continue;const id='v43-'+key+'-'+(kind==='mu-toc'?'hair':'outfit');if(added.has(id))continue;
 catalog.push({id,title:(kind==='mu-toc'?'Mũ và tóc':'Trang phục')+' thời '+p[0],kind,periods:[key],start:null,end:null,description:'Tranh phục dựng tham khảo, cần đối chiếu nguồn lịch sử. '+p[3],source_image:'Ảnh do người dùng cung cấp',image:DIR+file});
 added.add(id);
}}}
const ALIAS={'hongbang':'vanlang','aulac':'vanlang','thuc':'vanlang','le-so':'leso','le-trung-hung':'letrung','nguyenvn':'nguyen'};
function gallery(){
 const modal=document.getElementById('modalbody');if(!modal)return;
 const grid=modal.querySelector('#v35-dynasty-costumes .v35-gallery-grid');if(!grid||grid.querySelector('.v43-gallery-card'))return;
 const key=ALIAS[typeof active==='string'?active:'']||(typeof active==='string'?active:'');
 const p=PERIODS[key];if(!p)return;
 for(const [kind,file,title] of [['mu-toc',p[2],'Mũ & tóc'],['phuc-trang',p[1],'Trang phục']]){
 if(!file)continue;
 const card=document.createElement('button');card.className='v35-costume-card v43-gallery-card';card.type='button';card.dataset.v42Kind=kind==='mu-toc'?'hair':'clothes';
 const img=document.createElement('img');img.alt=title+' thời '+p[0];img.loading='lazy';
 const strong=document.createElement('strong');strong.textContent=title+' thời '+p[0];
 const small=document.createElement('small');small.textContent=p[3]+' · Phục dựng tham khảo';
 card.append(img,strong,small);card.addEventListener('click',()=>{if(typeof v35OpenCostume==='function')v35OpenCostume('v43-'+key+'-'+(kind==='mu-toc'?'hair':'outfit'))});
 check(file).then(ok=>{if(ok&&grid.isConnected){img.src=DIR+file;grid.prepend(card)}});
 }
}
function init(){
 register();
 if(typeof timelineRender==='function'){const fn=timelineRender;timelineRender=function(){const r=fn.apply(this,arguments);timeline();return r}}
 if(typeof buildHCM==='function'){const fn=buildHCM;buildHCM=function(){const r=fn.apply(this,arguments);hcm();return r}}
 if(typeof renderModal==='function'){const fn=renderModal;renderModal=function(){const r=fn.apply(this,arguments);gallery();return r}}
 timeline();hcm();gallery();document.documentElement.dataset.vietsuVersion='4.3';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();