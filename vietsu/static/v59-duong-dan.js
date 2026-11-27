/* Học Lịch Sử — đường dẫn rõ ràng cho từng mục (25/11/2026, theo yêu cầu chủ dự án).
   Mỗi menu, hồ sơ, bài học, sự kiện có địa chỉ riêng, ví dụ:
     /dong-thoi-gian-su-viet/   /chu-tich-ho-chi-minh/   /nhan-vat-lich-su/tran-hung-dao/
     /sach-giao-khoa-lich-su/lop-6/bai-1-.../   /su-kien/khoi-nghia-yen-bai/
   - Bấm menu hoặc mở bài: địa chỉ trên thanh trình duyệt đổi theo (history.pushState).
   - Mở thẳng một địa chỉ: trang trung gian (do tools/build_duong_dan.py tạo, có ảnh chia sẻ riêng)
     chuyển về trang chủ kèm ?p=<đường dẫn>; tệp này đọc ?p, đặt lại địa chỉ và mở đúng mục.
   - window.HLS_DUONG_DAN.tatCa() liệt kê mọi đường dẫn để công cụ dựng trang chia sẻ dùng. */
(function(){
'use strict';
const WEB=['http:','https:'].includes(location.protocol);
const GOC=(window.HLS_GOC||'/').replace(/\/?$/,'/');
const slug=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,80);
const MUC={
 'dong-thoi-gian-su-viet':{ten:'Dòng thời gian sử Việt',mo:()=>showSection('main')},
 'chu-tich-ho-chi-minh':{ten:'Chủ tịch Hồ Chí Minh',mo:()=>showSection('hcm')},
 'nhan-vat-lich-su':{ten:'Nhân vật lịch sử',mo:()=>showCharacters()},
 'khong-gian-lich-su':{ten:'Không gian lịch sử',mo:()=>showSpaces()},
 'bo-de-on-su':{ten:'Bộ đề ôn Sử',mo:()=>{const b=document.querySelector('[data-vs-exam-new]');if(b)b.click();}},
 'sach-giao-khoa-lich-su':{ten:'Sách giáo khoa Lịch sử',mo:()=>showSchool()},
 'su-kien':{ten:'Sự kiện lịch sử',mo:()=>showSection('main')},
};
let dangDinhTuyen=false,mucHienTai='dong-thoi-gian-su-viet';

/* ---------- Bảng đường dẫn ---------- */
let BANG=null,themVao=null;
function taoBang(){
 const theoDuong=Object.create(null),theoMa=Object.create(null);
 const them=(duong,ma,the)=>{let d=duong,i=2;while(theoDuong[d]&&theoDuong[d].ma!==ma){d=duong.replace(/\/$/,'')+'-'+i+'/';i++;}theoDuong[d]={ma,...the};theoMa[ma]=d;};
 themVao=them;
 if(typeof details!=='undefined')for(const [id,d] of Object.entries(details)){if(d&&d.name)them('dong-thoi-gian-su-viet/'+slug(d.name)+'/',id,{loai:'trieu-dai'});}
 if(typeof persons!=='undefined')for(const [id,p] of Object.entries(persons)){if(!p||!p.name)continue;const s=typeof v25PersonSlug==='function'?v25PersonSlug(id):slug(p.name);them('nhan-vat-lich-su/'+s+'/',id,{loai:'nhan-vat'});}
 if(typeof battles!=='undefined')for(const [id,b] of Object.entries(battles)){if(b&&b.name)them('su-kien/'+slug(b.name)+'/',id,{loai:'su-kien'});}
 for(const e of (window.VS59_DATA&&window.VS59_DATA.su_kien)||[])them('su-kien/'+slug(e.ten)+'/',e.id,{loai:'su-kien'});
 if(typeof V2_EXPERIENCES!=='undefined')for(const e of V2_EXPERIENCES)them('khong-gian-lich-su/'+slug(e.id)+'/','scene:'+e.id,{loai:'khong-gian'});
 if(typeof hcmEvents!=='undefined')for(const e of hcmEvents)them('chu-tich-ho-chi-minh/'+e.year+'-'+slug(e.title)+'/','hcm:'+e.year,{loai:'hcm'});
 const sgk=window.VS58_SGK&&window.VS58_SGK.lop||{};
 for(const [g,l] of Object.entries(sgk))for(const b of l.bai){
  const so=String(b.so),ma='g'+g+'-sgk-'+so.toLowerCase().replace('cđ','cd');
  const dau=/^\d+$/.test(so)?'bai-'+so:'chu-de-'+so.replace(/\D/g,'');
  them('sach-giao-khoa-lich-su/lop-'+g+'/'+dau+'-'+slug(b.ten)+'/','bai:'+ma,{loai:'bai-hoc',lop:+g,bai:ma});
 }
 BANG={theoDuong,theoMa};return BANG;
}
const bang=()=>BANG||taoBang();

/* ---------- Đặt địa chỉ ---------- */
function datDiaChi(duong,thay){
 if(!WEB||dangDinhTuyen)return;
 const url=GOC+duong;
 if(location.pathname+location.search===url&&!location.hash)return;
 try{history[thay?'replaceState':'pushState']({hls:duong},'',url);}catch(_){}
}
function duongMuc(){return mucHienTai+'/'+(mucHienTai==='sach-giao-khoa-lich-su'&&typeof v21CurrentGrade!=='undefined'?'lop-'+v21CurrentGrade+'/':'');}
function boc(ten,muc,laMuc){
 const cu=window[ten];if(typeof cu!=='function')return;
 window[ten]=function(){const r=cu.apply(this,arguments);if(laMuc){mucHienTai=muc(...arguments);datDiaChi(duongMuc());}else{const d=muc(...arguments);if(d)datDiaChi(d);}return r;};
}
function caiBoc(){
 boc('showSection',s=>s==='hcm'?'chu-tich-ho-chi-minh':s==='characters'?'nhan-vat-lich-su':'dong-thoi-gian-su-viet',true);
 boc('showCharacters',()=>'nhan-vat-lich-su',true);
 boc('showSpaces',()=>'khong-gian-lich-su',true);
 boc('showSchool',()=>'sach-giao-khoa-lich-su',true);
 boc('openItem',id=>bang().theoMa[id]||null,false);
 for(const t of ['v22OpenLesson','v21OpenLesson'])boc(t,id=>bang().theoMa['bai:'+id]||null,false);
 const dong=window.closeModal;
 if(typeof dong==='function')window.closeModal=function(){const r=dong.apply(this,arguments);datDiaChi(duongMuc());return r;};
 window.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-vs-exam-new]')){mucHienTai='bo-de-on-su';setTimeout(()=>datDiaChi('bo-de-on-su/'),0);}},true);
 // Bỏ cách ghi #ho-so=… cũ (vẫn đọc được liên kết cũ khi mở trang).
 try{window.v24WriteHash=function(){};}catch(_){}
 try{v24WriteHash=function(){};}catch(_){}
 // Nút Chia sẻ: dùng địa chỉ rõ ràng hiện tại.
 window.v24ShareCurrent=async function(){
  const link=location.origin+location.pathname;const tieuDe=document.title;
  if(navigator.share){try{await navigator.share({title:tieuDe,url:link});return;}catch(_){}}
  try{await navigator.clipboard.writeText(link);alert('Đã sao chép liên kết: '+link);}catch(_){prompt('Liên kết chia sẻ:',link);}
 };
 try{v24ShareCurrent=window.v24ShareCurrent;}catch(_){}
}

/* ---------- Mở theo đường dẫn ---------- */
function dinhTuyen(duong){
 duong=String(duong||'').replace(/^\/+/,'');if(duong&&!duong.endsWith('/'))duong+='/';
 const phan=duong.split('/').filter(Boolean);
 dangDinhTuyen=true;
 try{
  if(!phan.length){showSection('main');mucHienTai='dong-thoi-gian-su-viet';return true;}
  const muc=MUC[phan[0]];if(!muc)return false;
  const muc0=phan[0]==='su-kien'?'dong-thoi-gian-su-viet':phan[0];
  if(phan[0]==='sach-giao-khoa-lich-su'&&/^lop-(\d+)$/.test(phan[1]||'')){showSchool(+phan[1].slice(4));}else muc.mo();
  mucHienTai=muc0;
  if(phan.length>=2&&!(phan[0]==='sach-giao-khoa-lich-su'&&phan.length===2)){
   const m=bang().theoDuong[duong];
   if(m){
    if(m.loai==='bai-hoc'){if(typeof v22OpenLesson==='function')v22OpenLesson(m.bai);}
    else if(typeof openItem==='function')openItem(m.ma);
   }
  }
  return true;
 }finally{dangDinhTuyen=false;}
}
function duongHienTai(){
 const p=decodeURIComponent(location.pathname);
 return p.startsWith(GOC)?p.slice(GOC.length):p.replace(/^\//,'');
}
function khoiDong(){
 caiBoc();
 if(!WEB)return;
 const q=new URLSearchParams(location.search).get('p');
 if(q){const d=q.replace(/^\/+/,'');try{history.replaceState({hls:d},'',GOC+d+location.hash);}catch(_){}}
 const d=duongHienTai();
 if(d&&!/\.html?$/.test(d)){dinhTuyen(d);try{history.replaceState({hls:d},'',GOC+d);}catch(_){}}
 else{
  // Có nội dung sửa từ CMS → vẽ lại dòng thời gian (đã vẽ trước khi bản vá về).
  const va=window.HLS_CMS&&window.HLS_CMS.banVa();
  if(va&&Object.keys(va).length)dinhTuyen('');
  datDiaChi('dong-thoi-gian-su-viet/',true);
 }
 window.addEventListener('popstate',()=>{const d=duongHienTai();if(typeof closeModal==='function'&&document.getElementById('overlay')?.classList.contains('show')){dangDinhTuyen=true;try{closeModal();}finally{dangDinhTuyen=false;}}dinhTuyen(d);});
}

/* ---------- Danh sách cho công cụ dựng trang chia sẻ ---------- */
function moTa(t){t=String(t||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();return t.length>220?t.slice(0,217).replace(/\s+\S*$/,'')+'…':t;}
function tatCa(){
 const B=bang(),ds=[];
 for(const [k,m] of Object.entries(MUC))if(k!=='su-kien')ds.push({duong:k+'/',ten:m.ten,loai:'muc',mo_ta:''});
 for(let g=6;g<=12;g++)ds.push({duong:'sach-giao-khoa-lich-su/lop-'+g+'/',ten:'Sách giáo khoa Lịch sử lớp '+g,loai:'lop',mo_ta:'Các bài học Lịch sử lớp '+g+' theo bộ sách Kết nối tri thức với cuộc sống: tóm tắt, ghi nhớ và câu hỏi ôn tập.'});
 const stage=y=>{const ch=(typeof hcmChapters!=='undefined'?hcmChapters:[]).findIndex(c=>y>=c.start&&y<c.end);const f=['01_tho_au','02_tim_duong','03_hoat_dong_quoc_te','04_tro_ve','05_chong_phap','06_1954_1969','07_di_san'][ch<0?6:ch];return 'static/assets/hcm_stages/'+f+'.webp';};
 for(const [duong,m] of Object.entries(B.theoDuong)){
  let ten='',mt='',nhan='',anh='',phu='';
  if(m.loai==='nhan-vat'){const p=persons[m.ma];ten=p.name;phu=[p.period,p.role].filter(Boolean).join(' · ');mt=moTa((p.bioParagraphs||[]).join(' ')||p.desc);nhan='Nhân vật lịch sử';if(typeof p.avatar==='string'&&!p.avatar.startsWith('data:'))anh=p.avatar;}
  else if(m.loai==='trieu-dai'){const d=details[m.ma];ten=d.name;phu=d.period||'';mt=moTa(d.desc);nhan='Triều đại · Thời kỳ';}
  else if(m.loai==='su-kien'){const e=(window.VS59_DATA.su_kien||[]).find(x=>x.id===m.ma);if(e){ten=e.ten;phu=(e.nam<0?-e.nam+' TCN':e.nam)+'';mt=moTa(e.doan.join(' '));}else{const b=battles[m.ma];ten=b.name;phu=b.year?String(b.year):'';mt=moTa(b.desc);}nhan='Sự kiện lịch sử';}
  else if(m.loai==='khong-gian'){const e=V2_EXPERIENCES.find(x=>'scene:'+x.id===m.ma);ten=e.title;phu=e.period||'';mt=moTa(e.description);nhan='Không gian lịch sử';}
  else if(m.loai==='hcm'){const y=+m.ma.slice(4);const e=hcmEvents.find(x=>x.year===y);ten=e.title;phu=e.date;mt=moTa(e.detail);nhan='Chủ tịch Hồ Chí Minh';anh=stage(y);}
  else if(m.loai==='bai-hoc'){const l=window.VS58_SGK.lop[m.lop];const so=m.bai.split('-sgk-')[1];const b=l.bai.find(x=>String(x.so).toLowerCase().replace('cđ','cd')===so);ten=(/^\d+$/.test(String(b.so))?'Bài '+b.so:'Chủ đề '+String(b.so).replace(/\D/g,''))+': '+b.ten;phu='Lịch sử lớp '+m.lop+' · '+b.chuong;mt=moTa(b.tom);nhan='Sách giáo khoa Lịch sử';}
  ds.push({duong,ten,phu,mo_ta:mt,loai:m.loai,nhan,anh});
 }
 return ds;
}
// V6: nhân vật mới thêm trong CMS (không có trong bảng gốc) — thêm đường dẫn sau khi bản vá được áp.
function boSung(){
 const B=bang();
 if(typeof persons!=='undefined')for(const [id,p] of Object.entries(persons)){if(p&&p.name&&!B.theoMa[id])themVao('nhan-vat-lich-su/'+slug(p.name)+'/',id,{loai:'nhan-vat'});}
}
window.HLS_DUONG_DAN={slug,dinhTuyen,tatCa,boSung,bang:()=>bang()};

// V6: đợi nội dung sửa trong CMS (static/v60-cms.js) được áp xong rồi mới mở trang.
function chay(){setTimeout(()=>Promise.resolve(window.HLS_CMS_SAN).then(khoiDong,khoiDong),300);}
if(document.readyState==='complete')chay();else window.addEventListener('load',chay);
})();
