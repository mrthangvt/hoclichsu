/* Học Lịch Sử — CMS quản trị V6 (/admin).
   Đăng nhập tài khoản; sửa nội dung từng mục Menu (lưu dạng bản vá, xem vs_noidung.py);
   thanh menu, tiêu đề mục, logo/slogan; tài khoản; nhật ký.
   Dữ liệu gốc đọc từ chính trang Học Lịch Sử qua khung ẩn (/?goc=1) để luôn khớp bản đang chạy. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60);
const TEN_VAI={'quan-tri':'Quản trị','bien-tap':'Biên tập','thanh-vien':'Thành viên'};
let TOI=null, GOC=null, VA={}, dangTaiGoc=null;

/* ---------- gọi API ---------- */
async function api(url,{method='GET',body}={}){
  const r=await fetch(url,{method,credentials:'same-origin',cache:'no-store',
    headers:{'x-hls':'1',...(body!==undefined?{'content-type':'application/json'}:{})},
    body:body!==undefined?JSON.stringify(body):undefined});
  let j=null;try{j=await r.json();}catch(_){}
  if(!r.ok){
    let d=j&&j.detail;if(Array.isArray(d))d=d.map(x=>x.msg).join('; ');
    if(r.status===401&&TOI){TOI=null;hienVao();}
    throw new Error(d||('Lỗi '+r.status));
  }
  return j;
}
function bao(t,loi){const b=$('#thongBao');b.textContent=t;b.className='thong-bao hien'+(loi?' loi':'');clearTimeout(bao.h);bao.h=setTimeout(()=>b.className='thong-bao',loi?6000:2600);}

/* ---------- đăng nhập ---------- */
async function batDau(){
  let j;try{j=await api('/api/v6/toi');}catch(e){document.body.innerHTML='<p style="padding:30px">Không kết nối được máy chủ: '+esc(e.message)+'</p>';return;}
  if(j.tai_khoan&&['quan-tri','bien-tap'].includes(j.tai_khoan.vai_tro)){TOI=j.tai_khoan;vaoKhung();}
  else hienVao(j.can_khoi_tao,j.tai_khoan);
}
function hienVao(khoiTao,tk){
  $('#khung').hidden=true;$('#vao').hidden=false;
  $('#vaoKhoiTao').hidden=!khoiTao;$('#vaoNhapLai').hidden=!khoiTao;
  $('#vaoTieuDe').textContent=khoiTao?'Tạo tài khoản quản trị đầu tiên':'Đăng nhập quản trị';
  $('#vaoPhu').textContent=khoiTao?'Chỉ làm một lần. Dùng mã quản trị trên máy chủ để xác nhận anh/chị là chủ website.':
    (tk?'Tài khoản '+tk.email+' chưa có quyền quản trị.':'Học Lịch Sử · hoclichsu.com');
  $('#vaoNut').textContent=khoiTao?'Tạo tài khoản & vào quản trị':'Đăng nhập';
  const f=$('#formVao');
  f.onsubmit=async e=>{
    e.preventDefault();$('#vaoLoi').textContent='';const d=Object.fromEntries(new FormData(f));
    try{
      if(khoiTao){
        if(d.mat_khau!==d.mat_khau_2)throw new Error('Hai lần nhập mật khẩu không khớp.');
        TOI=(await api('/api/v6/khoi-tao',{method:'POST',body:{ma_quan_tri:d.ma_quan_tri,email:d.email,ten:d.ten,mat_khau:d.mat_khau}})).tai_khoan;
      }else TOI=(await api('/api/v6/dang-nhap',{method:'POST',body:{email:d.email,mat_khau:d.mat_khau}})).tai_khoan;
      if(!['quan-tri','bien-tap'].includes(TOI.vai_tro))throw new Error('Tài khoản này không có quyền quản trị.');
      f.reset();vaoKhung();
    }catch(err){$('#vaoLoi').textContent=err.message;}
  };
}
function vaoKhung(){
  $('#vao').hidden=true;$('#khung').hidden=false;
  $$('[data-quyen]').forEach(a=>a.hidden=TOI.vai_tro!==a.dataset.quyen);
  $('#toi').innerHTML='<div><b>'+esc(TOI.ten)+'</b><div class="vai">'+esc(TEN_VAI[TOI.vai_tro])+' · '+esc(TOI.email)+'</div></div>'+
    '<div class="hang"><button class="nut nho" id="nutDoiMK">Đổi mật khẩu</button><button class="nut nho" id="nutRa">Đăng xuất</button></div>';
  $('#nutRa').onclick=async()=>{try{await api('/api/v6/dang-xuat',{method:'POST'});}catch(_){}TOI=null;location.hash='';location.reload();};
  $('#nutDoiMK').onclick=()=>{location.hash='doi-mat-khau';};
  $('#nutMenu').onclick=()=>$('#thanhBen').classList.toggle('mo');
  window.onhashchange=dieuHuong;dieuHuong();
}

/* ---------- dữ liệu gốc của trang ---------- */
function taiGoc(){
  if(GOC)return Promise.resolve(GOC);
  if(dangTaiGoc)return dangTaiGoc;
  $('#trangThai').textContent='Đang đọc dữ liệu trang…';
  dangTaiGoc=new Promise((ok,loi)=>{
    const f=$('#khungGoc');f.src='/?goc=1';
    const bd=Date.now();
    const doi=()=>{
      let w;try{w=f.contentWindow;}catch(_){}
      const d=w&&w.HLS_DUONG_DAN&&w.HLS_LAY_GOC&&w.HLS_LAY_GOC();
      if(d&&d.persons&&d.hcmEvents&&d.sgk){
        setTimeout(()=>{try{
          const d=w.HLS_LAY_GOC();
          const sach=o=>JSON.parse(JSON.stringify(o));
          const ng={};for(const [k,p] of Object.entries(d.persons)){const {avatar,...r}=p;ng[k]=sach(r);}
          GOC={persons:ng,details:sach(d.details),battles:sach(d.battles||{}),su_kien:sach(d.su_kien),
            hcm:sach(d.hcmEvents),sgk:sach(d.sgk),duong:sach(w.HLS_DUONG_DAN.bang().theoMa),goc:w.HLS_GOC||'/'};
          f.src='about:blank';$('#trangThai').textContent='';ok(GOC);
        }catch(e){loi(e);}},400);
        return;
      }
      if(Date.now()-bd>40000){loi(new Error('Không đọc được dữ liệu trang chính.'));return;}
      setTimeout(doi,300);
    };
    f.onload=()=>setTimeout(doi,300);
  }).catch(e=>{dangTaiGoc=null;$('#trangThai').textContent='';throw e;});
  return dangTaiGoc;
}
async function taiVa(){VA=(await api('/api/v6/noi-dung')).noi_dung||{};return VA;}
const lienKet=ma=>GOC&&GOC.duong[ma]?'/'+GOC.duong[ma]:null;

/* ---------- mô tả từng loại nội dung ---------- */
// kieu: s (một dòng) · t (đoạn) · p (nhiều đoạn, cách nhau dòng trống) · d (danh sách, mỗi dòng một ý) · n (năm)
const LOAI={
 'trieu-dai':{ten:'Triều đại · thời kỳ',
   ds:()=>Object.entries(GOC.details).map(([ma,d])=>({ma,ten:d.name,phu:d.period,goc:d})),
   truong:[['name','Tên','s'],['period','Thời gian','s'],['desc','Giới thiệu','t'],['sourceBook','Nguồn','s'],['sourceCaution','Lưu ý về nguồn','t']]},
 'su-kien':{ten:'Sự kiện lịch sử',
   ds:()=>[...Object.entries(GOC.battles).map(([ma,b])=>({ma,ten:b.name,phu:b.year?String(b.year):'',goc:b})),
     ...GOC.su_kien.map(e=>({ma:e.id,ten:e.ten,phu:(e.nam<0?(-e.nam)+' TCN':String(e.nam)),goc:e}))],
   truong:g=>'ten' in g?[['ten','Tên sự kiện','s'],['nam','Năm (âm = trước Công nguyên)','n'],['bieu_tuong','Biểu tượng','s'],['doan','Nội dung','p'],['src','Nguồn','s']]
     :[['name','Tên sự kiện','s'],['year','Năm','n'],['desc','Nội dung','t']]},
 'hcm':{ten:'Chủ tịch Hồ Chí Minh',
   ds:()=>GOC.hcm.map(e=>({ma:'hcm:'+e.year,ten:e.title,phu:e.date,goc:e})),
   truong:[['date','Thời gian','s'],['title','Tiêu đề','s'],['detail','Nội dung (mỗi đoạn cách nhau một dòng trống)','h']]},
 'nhan-vat':{ten:'Nhân vật lịch sử',them:true,
   ds:()=>{const ra=Object.entries(GOC.persons).map(([ma,p])=>({ma,ten:p.name,phu:[p.period,p.role].filter(Boolean).join(' · '),goc:p}));
     for(const [ma,v] of Object.entries(VA['nhan-vat']||{}))if(v.moi&&!GOC.persons[ma])ra.unshift({ma,ten:v.name,phu:v.period||'',goc:{},moi:true});return ra;},
   truong:[['name','Họ tên','s'],['period','Năm sinh – mất / thời gian hoạt động','s'],['role','Vai trò, chức vụ','s'],['desc','Tóm tắt','t'],
     ['bioParagraphs','Tiểu sử (mỗi đoạn cách nhau một dòng trống)','p'],['sourceBook','Nguồn','s'],['sourcePage','Trang','s']]},
 'bai-sgk':{ten:'Sách giáo khoa',
   ds:()=>{const ra=[];for(const [g,l] of Object.entries(GOC.sgk))for(const b of l.bai){const so=String(b.so);
     ra.push({ma:'g'+g+'-sgk-'+so.toLowerCase().replace('cđ','cd'),ten:(/^\d+$/.test(so)?'Bài '+so:'Chủ đề '+so.replace(/\D/g,''))+': '+b.ten,phu:'Lớp '+g+' · '+b.chuong,goc:b,lop:g});}return ra;},
   truong:[['ten','Tên bài','s'],['chuong','Chương','s'],['tom','Tóm tắt','t'],['nho','Ghi nhớ (mỗi dòng một ý)','d'],['hoi','Câu hỏi ôn tập (mỗi dòng một câu)','d']]},
};
const truongCua=(loai,g)=>typeof LOAI[loai].truong==='function'?LOAI[loai].truong(g):LOAI[loai].truong;
// h: đoạn HTML của trang gốc → chữ thường (đoạn cách dòng trống) để sửa; trang chính tự đổi lại thành HTML an toàn.
const boThe=h=>{const d=document.createElement('textarea');d.innerHTML=String(h??'').replace(/<\/p>\s*<p[^>]*>/g,'\n\n').replace(/<br\s*\/?>/g,'\n').replace(/<[^>]+>/g,'');return d.value.trim();};
const sangChu=(v,k)=>k==='h'?boThe(v):Array.isArray(v)?v.join(k==='p'?'\n\n':'\n'):(v??'')+'';
function tuChu(s,k){s=String(s);if(k==='h')return s.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).join('\n\n');if(k==='p')return s.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  if(k==='d')return s.split('\n').map(x=>x.trim()).filter(Boolean);if(k==='n'){const n=parseInt(s,10);return Number.isFinite(n)?n:null;}return s.trim();}
const chuanSS=x=>(x==null||(Array.isArray(x)&&!x.length))?'':x;
const giongNhau=(a,b)=>JSON.stringify(chuanSS(a))===JSON.stringify(chuanSS(b));

/* ---------- điều hướng ---------- */
const TIEU_DE={'tong-quan':'Tổng quan','menu':'Menu & trang chủ','tai-khoan':'Tài khoản','nhat-ky':'Nhật ký thao tác','cong-cu':'Công cụ khác','doi-mat-khau':'Đổi mật khẩu'};
async function dieuHuong(){
  $('#thanhBen').classList.remove('mo');
  const h=decodeURIComponent(location.hash.slice(1))||'tong-quan';
  const [trang,...con]=h.split('/');
  $$('#menuQT a').forEach(a=>a.classList.toggle('dang',a.dataset.m===(trang==='sua'?con[0]:trang)));
  $('#tieuDe').textContent=TIEU_DE[trang]||(LOAI[trang]&&LOAI[trang].ten)||(trang==='sua'&&LOAI[con[0]]?LOAI[con[0]].ten:'');
  const v=$('#vung');v.innerHTML='<p class="dang-tai">Đang tải…</p>';window.scrollTo(0,0);
  try{
    if(trang==='tong-quan')await tongQuan(v);
    else if(trang==='menu')await trangMenu(v);
    else if(trang==='tai-khoan')await trangTaiKhoan(v);
    else if(trang==='nhat-ky')await trangNhatKy(v);
    else if(trang==='cong-cu')trangCongCu(v);
    else if(trang==='doi-mat-khau')trangDoiMK(v);
    else if(trang==='sua'&&LOAI[con[0]])await trangSua(v,con[0],con.slice(1).join('/'));
    else if(LOAI[trang])await trangDanhSach(v,trang);
    else v.innerHTML='<p>Không có trang này.</p>';
  }catch(e){v.innerHTML='<div class="the"><b>Có lỗi:</b> '+esc(e.message)+'</div>';}
}

/* ---------- Tổng quan ---------- */
async function tongQuan(v){
  const tk=await api('/api/v6/thong-ke');
  const o=Object.entries(tk.ten_loai).map(([k,t])=>'<div class="the"><div class="so">'+(tk.da_sua[k]||0)+'</div><div class="so-nhan">'+esc(t)+' đã sửa</div></div>').join('');
  const gd=tk.gan_day.length?'<table class="bang"><tr><th>Lúc</th><th>Mục</th><th>Thao tác</th><th class="an-nho">Người sửa</th></tr>'+tk.gan_day.map(r=>
    '<tr class="mo-duoc" data-di="'+(r.loai==='menu'?'menu':'sua/'+esc(r.loai)+'/'+encodeURIComponent(r.ma))+'"><td class="phu-dong">'+esc(thoiGian(r.sua_luc))+'</td><td>'+esc(tk.ten_loai[r.loai]||r.loai)+' · '+esc(r.ma)+
    '</td><td>'+(r.hanh_dong==='sua'?'Sửa':'Khôi phục gốc')+'</td><td class="an-nho">'+esc(r.sua_boi||'')+'</td></tr>').join('')+'</table>':'<p class="phu-dong">Chưa có thay đổi nào.</p>';
  v.innerHTML='<div class="the"><h3>Chào '+esc(TOI.ten)+'</h3><p class="phu-dong" style="margin:0">Chọn một mục ở menu bên trái để sửa nội dung. Mọi thay đổi được <b>xuất bản ngay</b> lên hoclichsu.com và có thể khôi phục lại bản gốc bất cứ lúc nào.</p></div>'+
    '<div class="luoi">'+o+'<div class="the"><div class="so">'+tk.so_tai_khoan+'</div><div class="so-nhan">Tài khoản</div></div></div>'+
    '<div class="the"><h3>Thay đổi gần đây</h3>'+gd+'</div>';
  $$('[data-di]',v).forEach(tr=>tr.onclick=()=>location.hash=tr.dataset.di);
}
function thoiGian(s){try{return new Date(s).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'});}catch(_){return s;}}

/* ---------- Danh sách ---------- */
const TRANG_CO=50;
async function trangDanhSach(v,loai){
  await Promise.all([taiGoc(),taiVa()]);
  const L=LOAI[loai],ds=L.ds(),va=VA[loai]||{};
  const nho=trangDanhSach.loc||(trangDanhSach.loc={});const st=nho[loai]||(nho[loai]={q:'',chiSua:false,trang:0,lop:''});
  v.innerHTML='<div class="cong-cu"><input type="search" id="tim" placeholder="Tìm theo tên…" value="'+esc(st.q)+'">'+
    (loai==='bai-sgk'?'<select id="lop"><option value="">Tất cả lớp</option>'+Object.keys(GOC.sgk).map(g=>'<option'+(st.lop===g?' selected':'')+' value="'+g+'">Lớp '+g+'</option>').join('')+'</select>':'')+
    '<label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" id="chiSua" style="width:auto"'+(st.chiSua?' checked':'')+'> Chỉ mục đã sửa</label>'+
    (L.them?'<button class="nut chinh" id="nutThem">+ Thêm nhân vật</button>':'')+'<span class="phu-dong" id="dem"></span></div><div id="ds"></div>';
  const ve=()=>{
    const q=slug(st.q);
    const loc=ds.filter(x=>(!q||slug(x.ten+' '+x.phu).includes(q))&&(!st.chiSua||va[x.ma])&&(!st.lop||x.lop===st.lop));
    const tong=Math.max(1,Math.ceil(loc.length/TRANG_CO));st.trang=Math.min(st.trang,tong-1);
    const phan=loc.slice(st.trang*TRANG_CO,(st.trang+1)*TRANG_CO);
    $('#dem').textContent=loc.length+' mục';
    $('#ds').innerHTML='<table class="bang"><tr><th>Tên</th><th class="an-nho">Thông tin</th><th>Trạng thái</th></tr>'+
      phan.map(x=>'<tr class="mo-duoc" data-ma="'+esc(x.ma)+'"><td><b>'+esc((va[x.ma]&&(va[x.ma].name||va[x.ma].ten||va[x.ma].title))||x.ten)+'</b><div class="phu-dong">'+esc(x.ma)+'</div></td><td class="an-nho phu-dong">'+esc(x.phu)+'</td><td>'+
        (x.moi?'<span class="nhan moi">Mới</span>':va[x.ma]?'<span class="nhan sua">Đã sửa</span>':'<span class="nhan">Gốc</span>')+'</td></tr>').join('')+'</table>'+
      (tong>1?'<div class="trang"><button class="nut nho" id="truoc"'+(st.trang?'':' disabled')+'>‹ Trước</button> Trang '+(st.trang+1)+'/'+tong+' <button class="nut nho" id="sau"'+(st.trang<tong-1?'':' disabled')+'>Sau ›</button></div>':'');
    $$('tr[data-ma]',v).forEach(tr=>tr.onclick=()=>location.hash='sua/'+loai+'/'+encodeURIComponent(tr.dataset.ma));
    const t=$('#truoc'),s=$('#sau');if(t)t.onclick=()=>{st.trang--;ve();};if(s)s.onclick=()=>{st.trang++;ve();};
  };
  $('#tim').oninput=e=>{st.q=e.target.value;st.trang=0;ve();};
  $('#chiSua').onchange=e=>{st.chiSua=e.target.checked;st.trang=0;ve();};
  if($('#lop'))$('#lop').onchange=e=>{st.lop=e.target.value;st.trang=0;ve();};
  if($('#nutThem'))$('#nutThem').onclick=()=>location.hash='sua/nhan-vat/+moi';
  ve();
}

/* ---------- Sửa một mục ---------- */
async function trangSua(v,loai,ma){
  await Promise.all([taiGoc(),taiVa()]);
  const L=LOAI[loai];const moi=ma==='+moi';
  const muc=moi?{ma:'',ten:'',goc:{},moi:true}:L.ds().find(x=>x.ma===ma);
  if(!muc){v.innerHTML='<p>Không tìm thấy mục “'+esc(ma)+'”.</p>';return;}
  const goc=muc.goc,va=moi?{}:((VA[loai]||{})[ma]||{}),laMoi=moi||!!va.moi;
  const truong=truongCua(loai,goc);
  const hien=k=>k in va?va[k]:goc[k];
  const xem=lienKet(loai==='bai-sgk'?'bai:'+ma:ma);
  v.innerHTML='<a class="quay-lai" href="#'+loai+'">‹ '+esc(L.ten)+'</a>'+
    '<div class="the"><h3>'+(moi?'Thêm nhân vật mới':esc(hien(truong[0][0])||muc.ten))+' '+(laMoi?'<span class="nhan moi">Mới</span>':Object.keys(va).length?'<span class="nhan sua">Đã sửa</span>':'<span class="nhan">Gốc</span>')+'</h3>'+
    '<div class="phu-dong">Mã: '+esc(moi?'(tự tạo theo tên)':ma)+(xem?' · <a href="'+esc(xem)+'" target="_blank">Xem trên trang ↗</a>':'')+'</div></div>'+
    '<form class="the bieu-mau" id="bm">'+truong.map(([k,nhan,kieu])=>{
      const gt=sangChu(hien(k),kieu),g=sangChu(goc[k],kieu);
      const o=kieu==='s'||kieu==='n'?'<input name="'+k+'" '+(kieu==='n'?'type="number"':'')+' value="'+esc(gt)+'">':
        '<textarea name="'+k+'" rows="'+(kieu==='p'||kieu==='h'?10:kieu==='t'?5:6)+'">'+esc(gt)+'</textarea>';
      return '<div class="'+(k in va&&!laMoi?'doi':'')+'"><label>'+esc(nhan)+o+'</label>'+(!laMoi&&k in va?'<div class="goc">Bản gốc: '+esc(g||'(trống)')+'</div>':'')+'</div>';
    }).join('')+
    '<div class="thanh-luu"><button class="nut chinh" type="submit">Lưu &amp; xuất bản</button>'+
    (!moi&&Object.keys(va).length?'<button class="nut nguy" type="button" id="khoiPhuc">'+(laMoi?'Xóa nhân vật này':'Khôi phục bản gốc')+'</button>':'')+
    (!moi?'<button class="nut" type="button" id="lichSu">Lịch sử sửa</button>':'')+'</div></form><div id="ls"></div>';
  const f=$('#bm');
  f.onsubmit=async e=>{
    e.preventDefault();
    const va2={};
    for(const [k,,kieu] of truong){const gt=tuChu(f.elements[k].value,kieu);
      if(laMoi){if(gt!==''&&gt!==null&&!(Array.isArray(gt)&&!gt.length))va2[k]=gt;}
      else if(!giongNhau(gt,kieu==='h'?tuChu(boThe(goc[k]),'h'):kieu==='s'&&goc[k]!=null?String(goc[k]):goc[k]))va2[k]=gt===null?'':gt;}
    let ma2=ma;
    if(laMoi){if(!va2.name){bao('Nhập họ tên nhân vật.',true);return;}va2.moi=true;
      if(moi){ma2='cms-'+slug(va2.name);if(GOC.persons[ma2]||(VA['nhan-vat']||{})[ma2])ma2+='-'+Date.now().toString(36).slice(-4);}}
    try{
      if(!Object.keys(va2).length)await api('/api/v6/noi-dung/'+loai+'/'+encodeURIComponent(ma2),{method:'DELETE'});
      else await api('/api/v6/noi-dung/'+loai+'/'+encodeURIComponent(ma2),{method:'PUT',body:{du_lieu:va2}});
      bao(Object.keys(va2).length?'Đã lưu và xuất bản.':'Không khác bản gốc — đã giữ nguyên bản gốc.');
      if(moi)location.hash='sua/'+loai+'/'+encodeURIComponent(ma2);else dieuHuong();
    }catch(err){bao(err.message,true);}
  };
  if($('#khoiPhuc'))$('#khoiPhuc').onclick=async()=>{
    if(!confirm(laMoi?'Xóa nhân vật mới này khỏi trang?':'Bỏ mọi chỉnh sửa và trở về bản gốc?'))return;
    try{await api('/api/v6/noi-dung/'+loai+'/'+encodeURIComponent(ma),{method:'DELETE'});bao(laMoi?'Đã xóa.':'Đã khôi phục bản gốc.');
      if(laMoi)location.hash=loai;else dieuHuong();}catch(err){bao(err.message,true);}
  };
  if($('#lichSu'))$('#lichSu').onclick=async()=>{
    const ls=await api('/api/v6/noi-dung/'+loai+'/'+encodeURIComponent(ma)+'/lich-su');
    $('#ls').innerHTML='<div class="the"><h3>Lịch sử sửa</h3>'+(ls.length?'<ul class="lich-su">'+ls.map((r,i)=>'<li><b>'+esc(thoiGian(r.sua_luc))+'</b> · '+esc(r.sua_boi||'')+' · '+
      (r.hanh_dong==='sua'?'Sửa':'Khôi phục gốc')+(r.du_lieu&&i>0?' <button class="nut nho" data-i="'+i+'">Dùng lại bản này</button>':'')+'</li>').join('')+'</ul>':'<p class="phu-dong">Chưa có.</p>')+'</div>';
    $$('[data-i]',$('#ls')).forEach(b=>b.onclick=async()=>{
      try{await api('/api/v6/noi-dung/'+loai+'/'+encodeURIComponent(ma),{method:'PUT',body:{du_lieu:ls[+b.dataset.i].du_lieu}});bao('Đã dùng lại bản cũ.');dieuHuong();}catch(err){bao(err.message,true);}
    });
    $('#ls').scrollIntoView({behavior:'smooth'});
  };
}

/* ---------- Menu & trang chủ ---------- */
const MUC_MENU=[['main','Dòng thời gian sử Việt'],['hcm','Chủ tịch Hồ Chí Minh'],['characters','Nhân vật lịch sử'],['spaces','Không gian lịch sử'],['exam','Bộ đề ôn Sử'],['school','Sách giáo khoa Lịch sử']];
const MUC_DAU=[['main','Dòng thời gian'],['hcm','Chủ tịch Hồ Chí Minh'],['characters','Nhân vật lịch sử'],['spaces','Không gian lịch sử'],['school','Sách giáo khoa']];
async function trangMenu(v){
  await taiVa();
  const cfg=await api('/api/site-config');
  const luu=((VA.menu||{}).chinh||{}).muc||[];
  let muc=luu.length?luu.map(m=>({...m})):[];
  for(const [id] of MUC_MENU)if(!muc.find(m=>m.id===id))muc.push({id,nhan:'',an:false});
  v.innerHTML='<div class="the"><h3>Thanh menu</h3><p class="phu-dong" style="margin-top:0">Đổi tên, sắp thứ tự (mũi tên), ẩn/hiện các mục. Để trống tên = dùng tên mặc định.</p><div id="dsMenu"></div>'+
    '<div class="thanh-luu"><button class="nut chinh" id="luuMenu">Lưu thanh menu</button><button class="nut" id="macDinh">Về mặc định</button></div></div>'+
    '<form class="the bieu-mau" id="bmTrang"><h3>Tên website &amp; tiêu đề từng mục</h3>'+
    '<div class="hai-cot"><label>Tên website<input name="name" value="'+esc(cfg.name)+'"></label><label>Chữ Hán<input name="han" value="'+esc(cfg.han)+'"></label></div>'+
    '<div class="hai-cot"><label>Khẩu hiệu (slogan)<input name="slogan" value="'+esc(cfg.slogan)+'"></label><label>Dòng phụ (tagline)<input name="tagline" value="'+esc(cfg.tagline||'')+'"></label></div>'+
    '<label>Đường dẫn logo riêng (để trống = logo mặc định)<input name="logo_url" value="'+esc(cfg.logo_url||'')+'" placeholder="/static/… hoặc https://…"></label>'+
    MUC_DAU.map(([id,t])=>'<div class="hai-cot"><label>'+esc(t)+' — tiêu đề<input name="t_'+id+'" value="'+esc((cfg.sections[id]||{}).title||'')+'"></label>'+
      '<label>'+esc(t)+' — mô tả<textarea name="d_'+id+'" rows="2">'+esc((cfg.sections[id]||{}).description||'')+'</textarea></label></div>').join('')+
    '<div class="thanh-luu"><button class="nut chinh" type="submit">Lưu tiêu đề &amp; logo</button></div></form>';
  const ve=()=>{$('#dsMenu').innerHTML=muc.map((m,i)=>{const t=MUC_MENU.find(x=>x[0]===m.id)[1];
    return '<div class="menu-hang"><span class="stt">'+(i+1)+'</span><span class="phu-dong">'+esc(t)+'</span><input data-i="'+i+'" value="'+esc(m.nhan)+'" placeholder="'+esc(t)+'">'+
      '<label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" style="width:auto" data-an="'+i+'"'+(m.an?' checked':'')+'> Ẩn</label>'+
      '<span><button class="nut nho" data-len="'+i+'"'+(i?'':' disabled')+'>↑</button> <button class="nut nho" data-xuong="'+i+'"'+(i<muc.length-1?'':' disabled')+'>↓</button></span></div>';}).join('');
    $$('[data-i]',v).forEach(x=>x.oninput=()=>muc[+x.dataset.i].nhan=x.value);
    $$('[data-an]',v).forEach(x=>x.onchange=()=>muc[+x.dataset.an].an=x.checked);
    $$('[data-len]',v).forEach(b=>b.onclick=()=>{const i=+b.dataset.len;[muc[i-1],muc[i]]=[muc[i],muc[i-1]];ve();});
    $$('[data-xuong]',v).forEach(b=>b.onclick=()=>{const i=+b.dataset.xuong;[muc[i+1],muc[i]]=[muc[i],muc[i+1]];ve();});
  };ve();
  $('#luuMenu').onclick=async()=>{try{await api('/api/v6/noi-dung/menu/chinh',{method:'PUT',body:{du_lieu:{muc}}});bao('Đã lưu thanh menu.');await taiVa();}catch(e){bao(e.message,true);}};
  $('#macDinh').onclick=async()=>{if(!confirm('Đưa thanh menu về mặc định?'))return;try{await api('/api/v6/noi-dung/menu/chinh',{method:'DELETE'});bao('Đã về mặc định.');dieuHuong();}catch(e){bao(e.message,true);}};
  $('#bmTrang').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    const body={name:d.name,slogan:d.slogan,tagline:d.tagline||null,han:d.han,logo_url:d.logo_url||null,sections:{}};
    for(const [id] of MUC_DAU)body.sections[id]={title:d['t_'+id],description:d['d_'+id]};
    try{await api('/api/site-config',{method:'PUT',body});bao('Đã lưu tiêu đề & logo.');}catch(err){bao(err.message,true);}};
}

/* ---------- Tài khoản ---------- */
async function trangTaiKhoan(v){
  if(TOI.vai_tro!=='quan-tri'){v.innerHTML='<p>Chỉ quản trị viên xem được mục này.</p>';return;}
  const ds=await api('/api/v6/tai-khoan');
  v.innerHTML='<form class="the bieu-mau" id="themTK"><h3>Thêm tài khoản</h3><div class="hai-cot"><label>Họ tên<input name="ten" required></label><label>Email<input name="email" type="email" required></label></div>'+
    '<div class="hai-cot"><label>Vai trò<select name="vai_tro"><option value="bien-tap">Biên tập — sửa nội dung</option><option value="quan-tri">Quản trị — thêm quản lý tài khoản</option><option value="thanh-vien">Thành viên — gửi bài (đợt 2)</option></select></label>'+
    '<label>Mật khẩu tạm<input name="mat_khau" required><span class="goi-y">Ít nhất 10 ký tự, có chữ hoa, chữ thường và số. Gửi riêng cho người dùng và nhắc đổi mật khẩu.</span></label></div>'+
    '<div><button class="nut chinh">Thêm tài khoản</button></div></form>'+
    '<table class="bang"><tr><th>Người dùng</th><th>Vai trò</th><th class="an-nho">Đăng nhập gần nhất</th><th></th></tr>'+ds.map(t=>
      '<tr><td><b>'+esc(t.ten)+'</b><div class="phu-dong">'+esc(t.email)+'</div></td><td><select data-vai="'+t.id+'"'+(t.id===TOI.id?' disabled':'')+'>'+
      Object.entries(TEN_VAI).map(([k,n])=>'<option value="'+k+'"'+(k===t.vai_tro?' selected':'')+'>'+n+'</option>').join('')+'</select> '+(t.trang_thai==='khoa'?'<span class="nhan khoa">Đã khóa</span>':'')+
      '</td><td class="an-nho phu-dong">'+esc(t.dang_nhap_luc?thoiGian(t.dang_nhap_luc):'Chưa')+'</td><td>'+(t.id===TOI.id?'<span class="phu-dong">(anh/chị)</span>':
      '<button class="nut nho" data-khoa="'+t.id+'" data-tt="'+(t.trang_thai==='khoa'?'hoat-dong':'khoa')+'">'+(t.trang_thai==='khoa'?'Mở khóa':'Khóa')+'</button> <button class="nut nho" data-mk="'+t.id+'">Đặt lại mật khẩu</button>')+'</td></tr>').join('')+'</table>';
  $('#themTK').onsubmit=async e=>{e.preventDefault();try{await api('/api/v6/tai-khoan',{method:'POST',body:Object.fromEntries(new FormData(e.target))});bao('Đã thêm tài khoản.');dieuHuong();}catch(err){bao(err.message,true);}};
  $$('[data-vai]',v).forEach(s=>s.onchange=async()=>{try{await api('/api/v6/tai-khoan/'+s.dataset.vai,{method:'PUT',body:{vai_tro:s.value}});bao('Đã đổi vai trò.');}catch(err){bao(err.message,true);dieuHuong();}});
  $$('[data-khoa]',v).forEach(b=>b.onclick=async()=>{try{await api('/api/v6/tai-khoan/'+b.dataset.khoa,{method:'PUT',body:{trang_thai:b.dataset.tt}});dieuHuong();}catch(err){bao(err.message,true);}});
  $$('[data-mk]',v).forEach(b=>b.onclick=async()=>{const mk=prompt('Mật khẩu mới cho tài khoản này (≥10 ký tự, chữ hoa, chữ thường, số):');if(!mk)return;
    try{await api('/api/v6/tai-khoan/'+b.dataset.mk,{method:'PUT',body:{mat_khau:mk}});bao('Đã đặt lại mật khẩu. Người dùng sẽ phải đăng nhập lại.');}catch(err){bao(err.message,true);}});
}
function trangDoiMK(v){
  v.innerHTML='<form class="the bieu-mau" id="mk" style="max-width:460px"><label>Mật khẩu hiện tại<input type="password" name="cu" required autocomplete="current-password"></label>'+
    '<label>Mật khẩu mới<input type="password" name="moi" required autocomplete="new-password"><span class="goi-y">Ít nhất 10 ký tự, có chữ hoa, chữ thường và số.</span></label>'+
    '<label>Nhập lại mật khẩu mới<input type="password" name="moi2" required autocomplete="new-password"></label><div><button class="nut chinh">Đổi mật khẩu</button></div></form>';
  $('#mk').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
    if(d.moi!==d.moi2){bao('Hai lần nhập không khớp.',true);return;}
    try{await api('/api/v6/doi-mat-khau',{method:'POST',body:{mat_khau_cu:d.cu,mat_khau_moi:d.moi}});bao('Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.');e.target.reset();}catch(err){bao(err.message,true);}};
}
async function trangNhatKy(v){
  const ds=await api('/api/v6/nhat-ky?gioi_han=200');
  v.innerHTML='<table class="bang"><tr><th>Lúc</th><th>Người</th><th>Thao tác</th></tr>'+ds.map(r=>'<tr><td class="phu-dong">'+esc(thoiGian(r.luc))+'</td><td>'+esc(r.ten||'')+'</td><td>'+esc(r.hanh_dong)+(r.chi_tiet?' <span class="phu-dong">· '+esc(r.chi_tiet)+'</span>':'')+'</td></tr>').join('')+'</table>';
}
function trangCongCu(v){
  const c=[['/admin/cu','Bài viết & SEO, nhập bài hàng loạt, AI nháp, bài học SGK chi tiết, sa bàn, quảng cáo','Giao diện quản trị cũ'],
    ['/admin/avatar','Tải ảnh chân dung nhân vật lên trang','Ảnh nhân vật'],['/admin/trang-phuc','Ảnh trang phục, mũ, tóc theo thời kỳ','Trang phục'],['/admin/periods','Hồ sơ triều đại (công cụ V4.7)','Hồ sơ triều đại']];
  v.innerHTML='<div class="the"><p class="phu-dong" style="margin:0">Các công cụ dưới đây là giao diện cũ, vẫn dùng <b>mã quản trị</b> (dòng VIETSU_ADMIN_TOKEN trong /www/hoclichsu-du-lieu/.env). Sẽ được chuyển dần vào giao diện mới.</p></div>'+
    '<div class="luoi">'+c.map(([u,m,t])=>'<a class="the" style="text-decoration:none" href="'+u+'" target="_blank"><h3>'+esc(t)+' ↗</h3><div class="phu-dong">'+esc(m)+'</div></a>').join('')+'</div>';
}

batDau();
})();
