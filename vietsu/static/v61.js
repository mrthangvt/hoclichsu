/* Học Lịch Sử V6.1 — 27/11/2026 (theo yêu cầu chủ dự án)
   1. Bản đồ Không gian lịch sử:
      - Điện thoại: 1 ngón tay cuộn trang; 2 ngón tay phóng to/thu nhỏ và kéo bản đồ.
      - Máy tính: Ctrl (⌘) + cuộn chuột / chụm bàn rê để phóng; cuộn thường thì cuộn trang; kéo chuột để di chuyển.
      - Phóng mượt (gom các lần cuộn theo khung hình, chuyển động dần), nút + / − / về giữa cũng mượt.
   2. Bộ lọc Di tích / Chiến dịch gọn trên dòng tiêu đề danh sách.
   3. Menu điện thoại: biểu tượng Bộ đề bằng hình vẽ cùng kiểu.
   4. Đăng ký | Đăng nhập: hai liên kết riêng, nối tài khoản thành viên (/api/v6/…).
   5. Mã QR thật tới hoclichsu.com; hướng dẫn cài lên điện thoại mới (sửa được trong CMS). */
(function(){
'use strict';
const WEB=['http:','https:'].includes(location.protocol);
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ================= 1. Bản đồ ================= */
function caiBanDo(){
 const el=document.getElementById('v23MapViewport'),svg=document.getElementById('v23AtlasSVG');
 if(!el||!svg||typeof v23Map==='undefined'||typeof v23ApplyMap!=='function')return;
 const W0=760,H0=970,RATIO=H0/W0,MIN=110,MAX=1250;
 const cur=v23Map;                    // trạng thái đang vẽ (dùng chung với mã cũ)
 const dich={x:cur.x,y:cur.y,w:cur.w}; // trạng thái đích, cur tiến dần tới
 let raf=0;
 const kep=w=>Math.max(MIN,Math.min(MAX,w));
 const ve=()=>{cur.h=cur.w*RATIO;v23ApplyMap();};
 const buoc=()=>{
  raf=0;const k=0.28;
  cur.x+=(dich.x-cur.x)*k;cur.y+=(dich.y-cur.y)*k;cur.w+=(dich.w-cur.w)*k;
  if(Math.abs(dich.w-cur.w)<0.3&&Math.abs(dich.x-cur.x)<0.3&&Math.abs(dich.y-cur.y)<0.3){cur.x=dich.x;cur.y=dich.y;cur.w=dich.w;ve();return;}
  ve();raf=requestAnimationFrame(buoc);
 };
 const chay=()=>{if(!raf)raf=requestAnimationFrame(buoc);};
 const dongBo=()=>{dich.x=cur.x;dich.y=cur.y;dich.w=cur.w;};
 // Điểm màn hình → toạ độ bản đồ, theo đúng phép biến đổi SVG hiện tại.
 const sangBanDo=(cx,cy)=>{const m=svg.getScreenCTM();if(!m)return null;const p=svg.createSVGPoint();p.x=cx;p.y=cy;return p.matrixTransform(m.inverse());};
 const phongTai=(cx,cy,he)=>{ // he > 1: phóng to
  const P=cx==null?{x:dich.x+dich.w/2,y:dich.y+dich.w*RATIO/2}:sangBanDo(cx,cy);if(!P)return;
  // Toạ độ P theo trạng thái đích (bù phần đang chạy dở) để điểm dưới con trỏ đứng yên.
  const tx=P.x+(dich.x-cur.x)+(P.x-cur.x)*(dich.w/cur.w-1), ty=P.y+(dich.y-cur.y)+(P.y-cur.y)*(dich.w/cur.w-1);
  const w2=kep(dich.w/he),r=w2/dich.w;
  dich.x=tx-(tx-dich.x)*r;dich.y=ty-(ty-dich.y)*r;dich.w=w2;chay();
 };
 const toi=(x,y,w)=>{dich.w=kep(w);dich.x=x;dich.y=y;chay();};
 // Thay các hàm cũ (nút + − ⌖ và “bay tới” khi chọn thẻ) bằng bản mượt.
 window.v23Zoom=f=>phongTai(null,null,f);
 window.v23ResetMap=()=>toi(0,0,W0);
 window.v23FlyTo=p=>{if(!p)return;const w=340;toi(p.x-w/2,p.y-w*RATIO/2,w);};

 // Gợi ý thao tác
 const goiY=document.createElement('div');goiY.className='v61-goi-y';el.appendChild(goiY);
 let hGoiY=0;const nhac=t=>{goiY.textContent=t;goiY.classList.add('hien');clearTimeout(hGoiY);hGoiY=setTimeout(()=>goiY.classList.remove('hien'),1300);};
 const laMac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);

 // Chặn bộ xử lý cũ (kéo bằng pointer + cuộn để phóng) ở pha bắt sự kiện của phần tử cha.
 const cha=el.parentElement;
 cha.addEventListener('wheel',e=>{
  if(!el.contains(e.target))return;
  e.stopPropagation();
  if(e.ctrlKey||e.metaKey){ // Ctrl/⌘ + cuộn, hoặc chụm 2 ngón trên bàn rê (trình duyệt gửi kèm ctrlKey)
   e.preventDefault();
   const d=e.deltaMode===1?e.deltaY*16:e.deltaY;
   phongTai(e.clientX,e.clientY,Math.exp(-Math.max(-120,Math.min(120,d))*0.0022));
  }else nhac(laMac?'Giữ ⌘ và cuộn để phóng to bản đồ':'Giữ Ctrl và cuộn để phóng to bản đồ');
 },{capture:true,passive:false});

 let keo=null;
 cha.addEventListener('pointerdown',e=>{
  if(!el.contains(e.target))return;
  if(e.target.closest('.v23-map-pin'))return;        // để bấm pin như cũ
  e.stopPropagation();                                // không cho bộ xử lý cũ chạy
  if(e.pointerType==='touch')return;                  // cảm ứng: xử lý bằng touch bên dưới
  if(e.button!==0)return;
  dongBo();keo={x:e.clientX,y:e.clientY,sx:cur.x,sy:cur.y,id:e.pointerId,di:false};
 },true);
 window.addEventListener('pointermove',e=>{
  if(!keo||e.pointerId!==keo.id)return;
  const m=svg.getScreenCTM();if(!m)return;
  const dx=e.clientX-keo.x,dy=e.clientY-keo.y;
  if(!keo.di&&Math.hypot(dx,dy)<3)return;
  if(!keo.di){keo.di=true;el.classList.add('dragging');}
  cur.x=keo.sx-dx/m.a;cur.y=keo.sy-dy/m.d;dongBo();ve();
 });
 const thaKeo=()=>{if(keo){if(keo.di){el.classList.add('v61-vua-keo');setTimeout(()=>el.classList.remove('v61-vua-keo'),60);}keo=null;el.classList.remove('dragging');}};
 window.addEventListener('pointerup',thaKeo);window.addEventListener('pointercancel',thaKeo);
 // Sau khi kéo không coi là bấm (tránh mở nhầm pin).
 el.addEventListener('click',e=>{if(el.classList.contains('v61-vua-keo')){e.stopPropagation();e.preventDefault();}},true);

 // Cảm ứng: 2 ngón = phóng + kéo; 1 ngón để trình duyệt cuộn trang.
 let chum=null;
 const giua=t=>({x:(t[0].clientX+t[1].clientX)/2,y:(t[0].clientY+t[1].clientY)/2});
 const kc=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 el.addEventListener('touchstart',e=>{
  if(e.touches.length===2){e.preventDefault();cancelAnimationFrame(raf);raf=0;dongBo();
   const g=giua(e.touches);chum={d:kc(e.touches),g,P:sangBanDo(g.x,g.y),w:cur.w};}
 },{passive:false});
 el.addEventListener('touchmove',e=>{
  if(e.touches.length!==2||!chum)return;
  e.preventDefault();
  const g=giua(e.touches),w=kep(chum.w*chum.d/Math.max(10,kc(e.touches)));
  const r=el.getBoundingClientRect(),m=svg.getScreenCTM();if(!m||!chum.P)return;
  // Giữ điểm bản đồ dưới tâm hai ngón đi theo tâm hai ngón.
  cur.w=w;cur.h=w*RATIO;v23ApplyMap();
  const m2=svg.getScreenCTM();const p=svg.createSVGPoint();p.x=g.x;p.y=g.y;const q=p.matrixTransform(m2.inverse());
  cur.x+=chum.P.x-q.x;cur.y+=chum.P.y-q.y;ve();dongBo();
 },{passive:false});
 el.addEventListener('touchend',e=>{if(e.touches.length<2)chum=null;});
 // Gợi ý cho người dùng điện thoại một lần.
 if(matchMedia('(pointer:coarse)').matches){let da=false;el.addEventListener('touchstart',e=>{if(!da&&e.touches.length===1){da=true;nhac('Dùng hai ngón tay để phóng to bản đồ');}},{passive:true});}
}

/* ================= 2. Bộ lọc gọn ================= */
function gonBoLoc(){
 const dau=$('.v23-list-heading'),loc=document.getElementById('v42FilterButtons');
 if(!dau||!loc||loc.classList.contains('v61-loc'))return;
 dau.classList.add('v61-dau');loc.classList.add('v61-loc');dau.appendChild(loc);
}

/* ================= 3. Biểu tượng Bộ đề ================= */
const SVG_DE='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5h6v2.5H9z"/><path d="m8.5 11 1.5 1.5 3-3"/><path d="M14.5 11.5H16"/><path d="m8.5 16.5 1.5 1.5 3-3"/><path d="M14.5 17H16"/></svg>';
function bieuTuongDe(){
 document.querySelectorAll('[data-vs-exam-new] .nav-icon').forEach(s=>{if(!s.querySelector('svg'))s.innerHTML=SVG_DE;});
}

/* ================= 4. Tài khoản ================= */
let TOI=null;
async function goi(url,body){
 const r=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:{'x-hls':'1',...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 let j=null;try{j=await r.json();}catch(_){}
 if(!r.ok){let d=j&&j.detail;if(Array.isArray(d))d=d.map(x=>x.msg).join('; ');throw new Error(d||'Lỗi '+r.status);}
 return j;
}
function veNutTk(){
 let khung=document.getElementById('v61Tk');
 const cu=document.getElementById('v26AuthButton');
 if(!khung&&!cu)return;
 if(!khung){khung=document.createElement('span');khung.id='v61Tk';khung.className='v61-tk';khung.style.position='relative';cu.replaceWith(khung);}
 if(TOI){
  khung.innerHTML='<button type="button" id="v61TkTen" aria-haspopup="true">👤 '+esc(TOI.ten.split(' ').slice(-2).join(' '))+' ▾</button>';
  khung.querySelector('#v61TkTen').onclick=e=>{e.stopPropagation();const m=khung.querySelector('.v61-tk-menu');if(m){m.remove();return;}
   const d=document.createElement('div');d.className='v61-tk-menu';
   d.innerHTML='<small>'+esc(TOI.ten)+'<br>'+esc(TOI.email)+'</small>'+(['quan-tri','bien-tap'].includes(TOI.vai_tro)?'<a href="/admin">✎ Trang quản trị</a>':'')+'<a href="/bai-viet/">Bài viết</a><button type="button" id="v61Ra">Đăng xuất</button>';
   khung.appendChild(d);d.querySelector('#v61Ra').onclick=async()=>{try{await goi('/api/v6/dang-xuat',{});}catch(_){}TOI=null;location.reload();};
   setTimeout(()=>document.addEventListener('click',function t(ev){if(!khung.contains(ev.target)){d.remove();document.removeEventListener('click',t);}}),0);};
 }else{
  khung.innerHTML='<a href="#dang-ky" id="v61DangKy">Đăng ký</a><span class="ngan">|</span><a href="#dang-nhap" id="v61DangNhap">Đăng nhập</a>';
  khung.querySelector('#v61DangKy').onclick=e=>{e.preventDefault();moHop('dang-ky');};
  khung.querySelector('#v61DangNhap').onclick=e=>{e.preventDefault();moHop('dang-nhap');};
 }
 // Nút tài khoản trên thanh điện thoại (biểu tượng người) dùng chung.
 window.v26AuthNote=()=>{if(!TOI){moHop('dang-nhap');return;}
  const h=document.createElement('div');h.className='v61-hop';
  h.innerHTML='<form><button type="button" class="dong" aria-label="Đóng">✕</button><h3>'+esc(TOI.ten)+'</h3><p class="phu">'+esc(TOI.email)+'</p>'+
   (['quan-tri','bien-tap'].includes(TOI.vai_tro)?'<a class="gui" style="text-align:center;text-decoration:none" href="/admin">✎ Trang quản trị</a>':'')+
   '<a class="gui" style="text-align:center;text-decoration:none;background:#efe5d3;color:#2b241c" href="/bai-viet/">Bài viết</a><button type="button" class="gui" id="v61Ra2" style="background:#b3412e">Đăng xuất</button></form>';
  document.body.appendChild(h);h.querySelector('.dong').onclick=()=>h.remove();h.onclick=e=>{if(e.target===h)h.remove();};
  h.querySelector('#v61Ra2').onclick=async()=>{try{await goi('/api/v6/dang-xuat',{});}catch(_){}location.reload();};};
}
function moHop(che){
 if(!WEB){alert('Đăng ký và đăng nhập dùng trên hoclichsu.com.');return;}
 document.querySelector('.v61-hop')?.remove();
 const h=document.createElement('div');h.className='v61-hop';h.setAttribute('role','dialog');h.setAttribute('aria-modal','true');
 h.innerHTML='<form novalidate><button type="button" class="dong" aria-label="Đóng">✕</button><h3>Tài khoản Học Lịch Sử</h3>'+
  '<div class="tab"><button type="button" data-c="dang-nhap">Đăng nhập</button><button type="button" data-c="dang-ky">Đăng ký</button></div>'+
  '<label class="o-ten">Họ tên<input name="ten" autocomplete="name"></label>'+
  '<label>Email<input name="email" type="email" autocomplete="email" required></label>'+
  '<label>Mật khẩu<input name="mat_khau" type="password" required></label>'+
  '<label class="o-ten">Nhập lại mật khẩu<input name="mat_khau_2" type="password" autocomplete="new-password"></label>'+
  '<p class="phu o-ten">Mật khẩu ít nhất 10 ký tự, có chữ hoa, chữ thường và số.</p>'+
  '<input class="bay" name="web" tabindex="-1" autocomplete="off" aria-hidden="true">'+
  '<p class="loi" role="alert"></p><button class="gui" type="submit"></button>'+
  '<p class="phu" style="text-align:center">Thành viên sẽ gửi được bài viết về Học Lịch Sử (sắp có).</p></form>';
 document.body.appendChild(h);
 const f=h.querySelector('form');
 const dat=c=>{che=c;h.querySelectorAll('.tab button').forEach(b=>b.classList.toggle('dang',b.dataset.c===c));
  h.querySelectorAll('.o-ten').forEach(x=>x.hidden=c!=='dang-ky');f.mat_khau.autocomplete=c==='dang-ky'?'new-password':'current-password';
  f.querySelector('.gui').textContent=c==='dang-ky'?'Tạo tài khoản':'Đăng nhập';f.querySelector('.loi').textContent='';
  (c==='dang-ky'?f.ten:f.email).focus();};
 h.querySelectorAll('.tab button').forEach(b=>b.onclick=()=>dat(b.dataset.c));
 const dong=()=>{h.remove();document.removeEventListener('keydown',phim);};
 const phim=e=>{if(e.key==='Escape')dong();};document.addEventListener('keydown',phim);
 h.querySelector('.dong').onclick=dong;h.onclick=e=>{if(e.target===h)dong();};
 f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));const loi=f.querySelector('.loi');loi.textContent='';
  try{
   if(che==='dang-ky'){
    if(!d.ten.trim())throw new Error('Nhập họ tên.');
    if(d.mat_khau!==d.mat_khau_2)throw new Error('Hai lần nhập mật khẩu không khớp.');
    TOI=(await goi('/api/v6/dang-ky',{ten:d.ten,email:d.email,mat_khau:d.mat_khau,web:d.web})).tai_khoan;
   }else TOI=(await goi('/api/v6/dang-nhap',{email:d.email,mat_khau:d.mat_khau})).tai_khoan;
   dong();veNutTk();
   const t=document.createElement('div');t.className='v61-goi-y hien';t.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:130';
   t.textContent=(che==='dang-ky'?'Chào mừng ':'Xin chào ')+TOI.ten+'!';document.body.appendChild(t);setTimeout(()=>t.remove(),2500);
  }catch(err){loi.textContent=err.message;}};
 dat(che);
}
async function caiTaiKhoan(){
 veNutTk();
 if(!WEB)return;
 try{const j=await goi('/api/v6/toi');if(j&&j.tai_khoan){TOI=j.tai_khoan;veNutTk();}}catch(_){}
 if(location.hash==='#dang-ky'||location.hash==='#dang-nhap')moHop(location.hash.slice(1));
}

/* ================= 5. QR + hướng dẫn cài đặt ================= */
const HD_MAC_DINH=['Mở hoclichsu.com trên điện thoại (quét mã QR bên cạnh).',
 'iPhone, iPad: dùng Safari → bấm nút Chia sẻ (ô vuông có mũi tên) → “Thêm vào MH chính” → Thêm.',
 'Android: dùng Chrome → bấm ⋮ ở góc trên → “Cài đặt ứng dụng” hoặc “Thêm vào màn hình chính”.',
 'Biểu tượng Học Lịch Sử sẽ nằm trên màn hình chính, mở ra như một ứng dụng.'];
function caiQr(){
 const q=$('.v25-qr-placeholder');if(!q||q.classList.contains('v61-qr'))return;
 q.classList.add('v61-qr');q.title='Quét để mở hoclichsu.com';q.setAttribute('aria-label','Mã QR mở hoclichsu.com');
 q.innerHTML='<img src="static/v61/qr-hoclichsu.png" alt="Mã QR hoclichsu.com" width="116" height="116">';
 window.v25InstallHelp=function(){
  const c=((window.HLS_CMS&&window.HLS_CMS.banVa()['cai-dat'])||{})['trang-chu']||{};
  const ds=c.app_huong_dan?c.app_huong_dan.split(/\n+/).map(s=>s.trim()).filter(Boolean):HD_MAC_DINH;
  const b='<div class="panel" style="display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start"><ol style="margin:0;padding-left:1.2em;display:grid;gap:8px">'+ds.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>'+
   '<img src="static/v61/qr-hoclichsu.png" alt="Mã QR hoclichsu.com" width="140" height="140" style="border-radius:8px;background:#fff;padding:6px"></div>';
  if(typeof v21OpenCustomModal==='function')v21OpenCustomModal('ỨNG DỤNG DI ĐỘNG',c.app_tieu_de||'Cài Học Lịch Sử lên điện thoại',b);
 };
}

function chay(){
 try{caiBanDo();}catch(e){console.warn('v61 bản đồ',e);}
 try{gonBoLoc();}catch(e){console.warn(e);}
 try{bieuTuongDe();}catch(e){console.warn(e);}
 try{caiQr();}catch(e){console.warn(e);}
 try{caiTaiKhoan();}catch(e){console.warn(e);}
}
if(document.readyState==='complete')setTimeout(chay,0);else window.addEventListener('load',()=>setTimeout(chay,0));
})();
