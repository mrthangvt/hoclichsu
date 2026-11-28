/* Học Lịch Sử — CMS V6: bài viết (trình biên tập kiểu WordPress), chuyên mục, thư viện ảnh, cài đặt Trợ lý AI.
   Bố cục trình biên tập: menu quản trị bên trái · khung soạn thảo ở giữa · cột tùy chọn bên phải
   (Xuất bản, Chuyên mục, Thẻ, Ảnh đại diện) · phần SEO bên dưới khung soạn (xem trước Google, tiêu đề, mô tả, từ khóa, chấm điểm). */
(function(){
'use strict';
const QT=window.QT;const {api,bao,esc,$,$$,slug}=QT;
const TT={'nhap':'Bản nháp','xuat-ban':'Đã xuất bản','thung-rac':'Thùng rác'};
QT.tieuDe['bai-viet']='Bài viết';QT.tieuDe['viet-bai']='Viết bài';QT.tieuDe['chuyen-muc']='Chuyên mục';QT.tieuDe['thu-vien']='Thư viện ảnh';QT.tieuDe['tro-ly']='Trợ lý AI';
QT.rong=Object.assign(QT.rong||{},{'viet-bai':true});
const ngay=s=>{if(!s)return '';try{return new Date(s).toLocaleString('vi-VN',{dateStyle:'short',timeStyle:'short'});}catch(_){return s;}};
const nho=u=>u&&/^\/static\/uploads\/thu-vien\/.+\.webp$/.test(u)&&!/-480\.webp$/.test(u)?u.replace(/\.webp$/,'-480.webp'):u;

/* ================= Danh sách bài viết ================= */
QT.trang['bai-viet']=async(v)=>{
  const st=QT.trang['bai-viet'].st||(QT.trang['bai-viet'].st={tt:'',q:'',trang:0,cm:0});
  const [ds,cms]=await Promise.all([api('/api/v6/bai-viet?trang_thai='+st.tt+'&q='+encodeURIComponent(st.q)+'&chuyen_muc='+st.cm+'&trang='+st.trang),api('/api/v6/chuyen-muc')]);
  const tong=Object.entries(ds.dem).filter(([k])=>k!=='thung-rac').reduce((a,[,n])=>a+n,0);
  const tab=(k,t,n)=>'<a href="#" data-tt="'+k+'" style="'+(st.tt===k?'font-weight:700;color:#000':'color:#66727a')+';text-decoration:none">'+t+' ('+(n||0)+')</a>';
  v.innerHTML='<div class="cong-cu"><a class="nut chinh" href="#viet-bai">+ Viết bài mới</a>'+tab('','Tất cả',tong)+' · '+tab('xuat-ban','Đã xuất bản',ds.dem['xuat-ban'])+' · '+tab('nhap','Bản nháp',ds.dem.nhap)+' · '+tab('thung-rac','Thùng rác',ds.dem['thung-rac'])+'</div>'+
    '<div class="cong-cu"><input type="search" id="timBai" placeholder="Tìm bài viết…" value="'+esc(st.q)+'"><select id="locCm"><option value="0">Mọi chuyên mục</option>'+cms.map(c=>'<option value="'+c.id+'"'+(st.cm===c.id?' selected':'')+'>'+esc(c.ten)+'</option>').join('')+'</select><span class="phu-dong">'+ds.tong+' bài</span></div>'+
    (ds.bai.length?'<table class="bang"><tr><th style="width:84px"></th><th>Tiêu đề</th><th class="an-nho">Chuyên mục</th><th class="an-nho">Tác giả</th><th>Ngày</th></tr>'+ds.bai.map(b=>
      '<tr><td>'+(b.anh_dai_dien?'<img src="'+esc(nho(b.anh_dai_dien))+'" alt="" style="width:72px;height:48px;object-fit:cover;border-radius:6px">':'<div style="width:72px;height:48px;border-radius:6px;background:#eee"></div>')+'</td>'+
      '<td><a href="#viet-bai/'+b.id+'" style="font-weight:600;text-decoration:none">'+esc(b.tieu_de)+'</a>'+(b.trang_thai!=='xuat-ban'?' <span class="nhan'+(b.trang_thai==='nhap'?' sua':' khoa')+'">'+TT[b.trang_thai]+'</span>':'')+
      '<div class="phu-dong" style="margin-top:4px"><a href="#viet-bai/'+b.id+'">Sửa</a> · '+(b.trang_thai==='xuat-ban'?'<a href="/bai-viet/'+esc(b.duong_dan)+'" target="_blank">Xem</a>':'<a href="/bai-viet/xem-truoc/'+b.id+'" target="_blank">Xem trước</a>')+
      ' · <a href="#" data-xoa="'+b.id+'" style="color:#b3412e">'+(b.trang_thai==='thung-rac'?'Xóa vĩnh viễn':'Bỏ vào thùng rác')+'</a>'+(b.trang_thai==='thung-rac'?' · <a href="#" data-khoi="'+b.id+'">Khôi phục</a>':'')+'</div></td>'+
      '<td class="an-nho phu-dong">'+esc(b.chuyen_muc.join(', '))+'</td><td class="an-nho phu-dong">'+esc(b.tac_gia)+'</td><td class="phu-dong">'+(b.trang_thai==='xuat-ban'?'Đăng<br>'+esc(ngay(b.xuat_ban_luc)):'Sửa<br>'+esc(ngay(b.sua_luc)))+'</td></tr>').join('')+'</table>'
      :'<div class="the"><p class="phu-dong" style="margin:0">Chưa có bài viết nào.</p></div>')+
    (ds.tong>30?'<div class="trang"><button class="nut nho" id="bvTruoc"'+(st.trang?'':' disabled')+'>‹ Trước</button> Trang '+(st.trang+1)+'/'+Math.ceil(ds.tong/30)+' <button class="nut nho" id="bvSau"'+((st.trang+1)*30<ds.tong?'':' disabled')+'>Sau ›</button></div>':'');
  const lai=()=>QT.trang['bai-viet'](v);
  $$('[data-tt]',v).forEach(a=>a.onclick=e=>{e.preventDefault();st.tt=a.dataset.tt;st.trang=0;lai();});
  let h;$('#timBai').oninput=e=>{clearTimeout(h);h=setTimeout(()=>{st.q=e.target.value;st.trang=0;lai().then(()=>{const i=$('#timBai');i.focus();i.setSelectionRange(i.value.length,i.value.length);});},350);};
  $('#locCm').onchange=e=>{st.cm=+e.target.value;st.trang=0;lai();};
  if($('#bvTruoc'))$('#bvTruoc').onclick=()=>{st.trang--;lai();};if($('#bvSau'))$('#bvSau').onclick=()=>{st.trang++;lai();};
  $$('[data-xoa]',v).forEach(a=>a.onclick=async e=>{e.preventDefault();const vv=st.tt==='thung-rac';
    if(vv&&!confirm('Xóa vĩnh viễn bài này? Không thể hoàn tác.'))return;
    try{await api('/api/v6/bai-viet/'+a.dataset.xoa,{method:'DELETE'});bao(vv?'Đã xóa vĩnh viễn.':'Đã bỏ vào thùng rác.');lai();}catch(err){bao(err.message,true);}});
  $$('[data-khoi]',v).forEach(a=>a.onclick=async e=>{e.preventDefault();try{const b=await api('/api/v6/bai-viet/'+a.dataset.khoi);b.trang_thai='nhap';await api('/api/v6/bai-viet/'+b.id,{method:'PUT',body:goiBai(b)});bao('Đã khôi phục thành bản nháp.');lai();}catch(err){bao(err.message,true);}});
};
const goiBai=b=>({tieu_de:b.tieu_de,duong_dan:b.duong_dan,noi_dung:b.noi_dung,tom_tat:b.tom_tat,trang_thai:b.trang_thai,anh_dai_dien:b.anh_dai_dien,
  chuyen_muc:b.chuyen_muc,the:b.the,seo_tieu_de:b.seo_tieu_de,seo_mo_ta:b.seo_mo_ta,tu_khoa:b.tu_khoa,anh_mxh:b.anh_mxh,cho_index:!!b.cho_index,xuat_ban_luc:b.xuat_ban_luc||''});

/* ================= Thư viện ảnh (dùng chung: trang riêng + hộp chọn ảnh) ================= */
async function nenAnh(file){
  // Thu nhỏ ảnh lớn ngay trên trình duyệt (tối đa 2400 px) để tải lên nhanh và không vượt giới hạn 8 MB.
  const bm=await createImageBitmap(file).catch(()=>null);
  if(!bm)throw new Error('Không đọc được ảnh '+file.name);
  const k=Math.min(1,2400/Math.max(bm.width,bm.height));
  const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);
  c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
  return c.toDataURL('image/webp',0.9);
}
async function taiLen(files,alt){
  const ra=[];
  for(const f of files){
    if(!/^image\//.test(f.type)){bao('Bỏ qua '+f.name+' (không phải ảnh).',true);continue;}
    bao('Đang tải lên '+f.name+'…');
    try{ra.push(await api('/api/v6/tep',{method:'POST',body:{du_lieu:await nenAnh(f),ten:f.name,alt:alt||f.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ')}}));}
    catch(e){bao(e.message,true);}
  }
  if(ra.length)bao('Đã tải lên '+ra.length+' ảnh.');
  return ra;
}
function oTaiLen(id){return '<label class="nut" style="cursor:pointer">⇪ Tải ảnh lên<input type="file" id="'+id+'" accept="image/*" multiple hidden></label>';}
const LUOI_CSS='display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px';
function oAnh(t,chon){return '<button type="button" class="o-anh" data-id="'+t.id+'" style="border:2px solid '+(chon?'#d6ac5c':'transparent')+';padding:0;border-radius:8px;overflow:hidden;background:#eee;cursor:pointer;aspect-ratio:1"><img src="'+esc(t.url_nho)+'" alt="'+esc(t.alt)+'" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></button>';}

QT.trang['thu-vien']=async(v)=>{
  const st=QT.trang['thu-vien'].st||(QT.trang['thu-vien'].st={trang:0,q:''});
  const d=await api('/api/v6/tep?trang='+st.trang+'&q='+encodeURIComponent(st.q));
  v.innerHTML='<div class="cong-cu">'+oTaiLen('tlFile')+'<input type="search" id="tlTim" placeholder="Tìm ảnh…" value="'+esc(st.q)+'"><span class="phu-dong">'+d.tong+' ảnh · kéo thả ảnh vào đây để tải lên</span></div>'+
    '<div id="tlLuoi" style="'+LUOI_CSS+'">'+d.tep.map(t=>oAnh(t)).join('')+'</div><div id="tlChiTiet"></div>'+
    (d.tong>40?'<div class="trang"><button class="nut nho" id="tlTruoc"'+(st.trang?'':' disabled')+'>‹</button> '+(st.trang+1)+'/'+Math.ceil(d.tong/40)+' <button class="nut nho" id="tlSau"'+((st.trang+1)*40<d.tong?'':' disabled')+'>›</button></div>':'');
  const lai=()=>QT.trang['thu-vien'](v);
  $('#tlFile').onchange=async e=>{await taiLen([...e.target.files]);lai();};
  v.ondragover=e=>{e.preventDefault();};v.ondrop=async e=>{e.preventDefault();await taiLen([...e.dataTransfer.files]);lai();};
  let h;$('#tlTim').oninput=e=>{clearTimeout(h);h=setTimeout(()=>{st.q=e.target.value;st.trang=0;lai();},350);};
  if($('#tlTruoc'))$('#tlTruoc').onclick=()=>{st.trang--;lai();};if($('#tlSau'))$('#tlSau').onclick=()=>{st.trang++;lai();};
  $$('.o-anh',v).forEach(b=>b.onclick=()=>{const t=d.tep.find(x=>x.id===+b.dataset.id);
    $('#tlChiTiet').innerHTML='<div class="the" style="margin-top:16px;display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:16px"><img src="'+esc(t.url_nho)+'" alt="" style="width:100%;border-radius:8px">'+
      '<div class="bieu-mau"><div><b>'+esc(t.ten)+'</b><div class="phu-dong">'+t.rong+'×'+t.cao+' px · '+Math.round(t.dung_luong/1024)+' KB · '+esc(ngay(t.luc))+' · '+esc(t.tai_len_boi||'')+'</div></div>'+
      '<label>Mô tả ảnh (alt) — giúp SEO và người khiếm thị<input id="tlAlt" value="'+esc(t.alt)+'"></label><label>Đường dẫn<input readonly value="'+esc(t.url)+'" onclick="this.select()"></label>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="nut chinh" id="tlLuu">Lưu mô tả</button><a class="nut" href="'+esc(t.url)+'" target="_blank">Mở ảnh</a><button class="nut nguy" id="tlXoa">Xóa ảnh</button></div></div></div>';
    $('#tlLuu').onclick=async()=>{try{await api('/api/v6/tep/'+t.id,{method:'PUT',body:{alt:$('#tlAlt').value}});t.alt=$('#tlAlt').value;bao('Đã lưu.');}catch(e){bao(e.message,true);}};
    $('#tlXoa').onclick=async()=>{if(!confirm('Xóa ảnh này? Bài viết đang dùng ảnh sẽ mất ảnh.'))return;try{await api('/api/v6/tep/'+t.id,{method:'DELETE'});bao('Đã xóa ảnh.');lai();}catch(e){bao(e.message,true);}};
    $('#tlChiTiet').scrollIntoView({behavior:'smooth',block:'nearest'});});
};

/* Hộp chọn ảnh: trả về {url, alt} hoặc null */
function chonAnh(tieuDe){
  return new Promise(ok=>{
    const nen=document.createElement('div');
    nen.style.cssText='position:fixed;inset:0;background:rgba(20,26,30,.55);z-index:60;display:grid;place-items:center;padding:20px';
    nen.innerHTML='<div class="the" style="width:min(980px,100%);max-height:90vh;display:flex;flex-direction:column;margin:0"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><h3 style="margin:0">'+esc(tieuDe||'Chọn ảnh')+'</h3><span style="margin-left:auto"></span>'+oTaiLen('caFile')+'<input type="search" id="caTim" placeholder="Tìm…" style="max-width:200px"><button class="nut" id="caDong">✕</button></div>'+
      '<div id="caLuoi" style="'+LUOI_CSS+';overflow:auto;flex:1;min-height:200px"></div><div style="display:flex;gap:10px;align-items:center;margin-top:12px"><input id="caAlt" placeholder="Mô tả ảnh (alt)" style="flex:1"><button class="nut chinh" id="caChon" disabled>Chọn ảnh</button></div></div>';
    document.body.appendChild(nen);
    let ds=[],chon=null;
    const dong=r=>{nen.remove();document.removeEventListener('keydown',phim);ok(r);};
    const phim=e=>{if(e.key==='Escape')dong(null);};document.addEventListener('keydown',phim);
    const ve=()=>{$('#caLuoi',nen).innerHTML=ds.map(t=>oAnh(t,chon&&chon.id===t.id)).join('')||'<p class="phu-dong">Chưa có ảnh. Bấm “Tải ảnh lên” hoặc kéo thả ảnh vào đây.</p>';
      $$('.o-anh',nen).forEach(b=>{b.onclick=()=>{chon=ds.find(x=>x.id===+b.dataset.id);$('#caAlt',nen).value=chon.alt||'';$('#caChon',nen).disabled=false;ve();};b.ondblclick=()=>{chon=ds.find(x=>x.id===+b.dataset.id);xong();};});};
    const tai=async q=>{ds=(await api('/api/v6/tep?q='+encodeURIComponent(q||''))).tep;ve();};
    const xong=async()=>{if(!chon)return;const alt=$('#caAlt',nen).value.trim();
      if(alt!==(chon.alt||''))api('/api/v6/tep/'+chon.id,{method:'PUT',body:{alt}}).catch(()=>{});dong({url:chon.url,url_nho:chon.url_nho,alt,rong:chon.rong,cao:chon.cao});};
    $('#caDong',nen).onclick=()=>dong(null);nen.onclick=e=>{if(e.target===nen)dong(null);};
    $('#caChon',nen).onclick=xong;
    let h;$('#caTim',nen).oninput=e=>{clearTimeout(h);h=setTimeout(()=>tai(e.target.value),300);};
    const moi=async files=>{const r=await taiLen(files);await tai('');if(r.length){chon=ds.find(x=>x.id===r[r.length-1].id)||null;if(chon){$('#caAlt',nen).value=chon.alt;$('#caChon',nen).disabled=false;ve();}}};
    $('#caFile',nen).onchange=e=>moi([...e.target.files]);
    nen.ondragover=e=>e.preventDefault();nen.ondrop=e=>{e.preventDefault();moi([...e.dataTransfer.files]);};
    tai('');
  });
}
QT.chonAnh=chonAnh;

/* ================= Trình biên tập bài viết ================= */
const SUA_CSS=`
#vung.rong{max-width:none}
.bt-luoi{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px;align-items:start}
.bt-tieu-de{width:100%;font-size:24px;font-weight:700;padding:10px 14px;border-radius:8px}
.bt-dd{font-size:13px;color:#66727a;margin:6px 2px 12px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.bt-dd input{width:auto;padding:3px 6px;font-size:13px}
.bt-khung{border:1px solid var(--vien);border-radius:10px;background:#fff;overflow:hidden}
.bt-the-tab{display:flex;justify-content:flex-end;gap:4px;background:#faf8f3;border-bottom:1px solid var(--vien);padding:4px 6px 0}
.bt-the-tab button{border:1px solid transparent;border-bottom:0;background:none;padding:5px 12px;border-radius:6px 6px 0 0;cursor:pointer;font-size:13px}
.bt-the-tab button.dang{background:#fff;border-color:var(--vien)}
.bt-cu{display:flex;flex-wrap:wrap;gap:2px;padding:6px;border-bottom:1px solid var(--vien);background:#fff;position:sticky;top:61px;z-index:3}
.bt-cu button,.bt-cu select{border:1px solid transparent;background:none;border-radius:6px;min-width:32px;height:32px;cursor:pointer;font-size:14px;padding:0 6px;width:auto}
.bt-cu button:hover{background:#f2eee4;border-color:var(--vien)}.bt-cu .ngan{width:1px;background:var(--vien);margin:4px 4px}
.bt-soan{min-height:460px;padding:22px 26px;outline:none;font-size:16px;line-height:1.75;font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#24292d}
.bt-soan h2{font-size:1.45em;margin:1.2em 0 .5em}.bt-soan h3{font-size:1.2em}
.bt-soan img{max-width:100%;height:auto;border-radius:6px}.bt-soan figure{margin:1.2em 0;text-align:center}.bt-soan figcaption{font-size:.85em;color:#7b746a}
.bt-soan blockquote{border-left:4px solid #c9a35a;margin:1em 0;padding:.2em 1em;background:#faf6ee}
.bt-soan table{border-collapse:collapse;width:100%}.bt-soan td,.bt-soan th{border:1px dashed #c9c1b1;padding:6px 8px;min-width:40px}
.bt-soan:empty:before{content:attr(data-goi-y);color:#a0a7ab}
.bt-ma{width:100%;min-height:460px;border:0;border-radius:0;font:13px/1.55 ui-monospace,Menlo,monospace;padding:16px}
.bt-chan{display:flex;justify-content:space-between;color:#66727a;font-size:12px;padding:6px 12px;border-top:1px solid var(--vien);background:#faf8f3}
.hop{background:#fff;border:1px solid var(--vien);border-radius:10px;margin-bottom:14px}
.hop>h4{margin:0;padding:10px 14px;border-bottom:1px solid var(--vien);font-size:14px;display:flex;justify-content:space-between}
.hop>div{padding:12px 14px;display:grid;gap:10px;font-size:14px}
.hop .dong{display:flex;gap:6px;align-items:center}.hop .dong select,.hop .dong input{width:auto;flex:1;padding:5px 8px}
.ds-cm{max-height:200px;overflow:auto;border:1px solid var(--vien);border-radius:6px;padding:6px 8px;display:grid;gap:4px}
.ds-cm label{display:flex;gap:8px;align-items:center;font-weight:400;font-size:14px}.ds-cm input{width:auto}
.chip-the{display:inline-flex;gap:4px;align-items:center;background:#f2eadb;border-radius:999px;padding:2px 4px 2px 10px;font-size:13px;margin:0 4px 4px 0}
.chip-the button{border:0;background:none;cursor:pointer;color:#8a6420}
.anh-dd img{width:100%;border-radius:8px;display:block}
.serp{border:1px solid var(--vien);border-radius:8px;padding:12px 14px;max-width:620px;font-family:arial,sans-serif;background:#fff}
.serp .s1{font-size:13px;color:#202124}.serp .s2{font-size:12px;color:#4d5156}.serp .s3{color:#1a0dab;font-size:19px;margin:4px 0;line-height:1.3}.serp .s4{color:#4d5156;font-size:13.5px;line-height:1.5}
.dem-ky{font-size:12px;color:#66727a;text-align:right}.dem-ky.vuot{color:#b3412e}
.kiem{list-style:none;padding:0;margin:0;display:grid;gap:6px}.kiem li{display:flex;gap:8px;font-size:14px}.kiem .y{color:#2e7d4f}.kiem .n{color:#b3412e}.kiem small{display:block;color:#66727a}
.diem{display:inline-block;padding:2px 10px;border-radius:999px;font-weight:700;font-size:13px}
@media(max-width:1100px){.bt-luoi{grid-template-columns:1fr}}`;

function diemSeo(d){
  const kw=(d.tu_khoa||'').trim().toLowerCase();
  const tit=(d.seo_tieu_de||d.tieu_de||'').toLowerCase(), mt=(d.seo_mo_ta||'').toLowerCase();
  const div=document.createElement('div');div.innerHTML=d.noi_dung||'';
  const chu=(div.textContent||'').replace(/\s+/g,' ').trim();const tu=chu?chu.split(' ').length:0;
  const dau=chu.slice(0,Math.max(300,((div.querySelector('p')||{}).textContent||'').length)).toLowerCase();
  const tieuDePhu=[...div.querySelectorAll('h2,h3,h4')].map(h=>h.textContent.toLowerCase());
  const alts=[...div.querySelectorAll('img')].map(i=>(i.getAttribute('alt')||'').toLowerCase());
  const links=[...div.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
  const noi=links.filter(h=>/^\/(?!\/)/.test(h)||/hoclichsu\.com/.test(h)).length, ngoai=links.filter(h=>/^https?:\/\//.test(h)&&!/hoclichsu\.com/.test(h)).length;
  const lan=kw?(chu.toLowerCase().split(kw).length-1):0;const matDo=tu&&kw?lan*kw.split(/\s+/).length/tu*100:0;
  const slugKw=slug(kw);
  const ds=[];const them=(ok,t,g)=>ds.push({ok,t,g});
  if(kw){
    them(tit.includes(kw),'Từ khóa trong tiêu đề SEO','Đưa “'+d.tu_khoa+'” vào tiêu đề SEO, tốt nhất ở đầu.');
    them(mt.includes(kw),'Từ khóa trong mô tả meta','Thêm từ khóa vào mô tả meta.');
    them(!!slugKw&&(d.duong_dan||'').includes(slugKw),'Từ khóa trong đường dẫn','Đường dẫn nên chứa “'+slugKw+'”.');
    them(dau.includes(kw),'Từ khóa ở đoạn mở đầu','Nhắc từ khóa trong đoạn văn đầu tiên.');
    them(tieuDePhu.some(h=>h.includes(kw)),'Từ khóa trong tiêu đề phụ (H2, H3)','Dùng từ khóa trong ít nhất một tiêu đề phụ.');
    them(!alts.length||alts.some(a=>a.includes(kw)),'Từ khóa trong mô tả ảnh (alt)','Ít nhất một ảnh nên có alt chứa từ khóa.');
    them(matDo>=0.5&&matDo<=2.5,'Mật độ từ khóa '+matDo.toFixed(2)+'% ('+lan+' lần)','Nên trong khoảng 0,5% – 2,5%.');
  }else them(false,'Chưa đặt từ khóa chính','Nhập từ khóa chính để chấm điểm SEO.');
  const dt=(d.seo_tieu_de||d.tieu_de||'').length, dm=(d.seo_mo_ta||'').length;
  them(dt>=30&&dt<=60,'Độ dài tiêu đề SEO: '+dt+' ký tự','Nên 30 – 60 ký tự.');
  them(dm>=120&&dm<=160,'Độ dài mô tả meta: '+dm+' ký tự','Nên 120 – 160 ký tự.');
  them(tu>=300,'Độ dài nội dung: '+tu+' từ','Bài nên có ít nhất 300 từ.');
  them(noi>0,'Liên kết nội bộ ('+noi+')','Thêm liên kết tới trang khác trên Học Lịch Sử (vd /nhan-vat-lich-su/…).');
  them(ngoai>0,'Liên kết ra ngoài ('+ngoai+')','Dẫn nguồn tham khảo đáng tin cậy.');
  them(!!d.anh_dai_dien,'Có ảnh đại diện','Chọn ảnh đại diện để chia sẻ đẹp trên mạng xã hội.');
  const diem=Math.round(ds.filter(x=>x.ok).length/ds.length*100);
  return {ds,diem,tu};
}
const mauDiem=n=>n>=80?'background:#dcefe3;color:#2e7d4f':n>=50?'background:#fbeed3;color:#8a6420':'background:#f6dcd6;color:#b3412e';

QT.trang['viet-bai']=async(v,id)=>{
  if(!document.getElementById('btCss')){const s=document.createElement('style');s.id='btCss';s.textContent=SUA_CSS;document.head.appendChild(s);}
  const [cms,theHay]=await Promise.all([api('/api/v6/chuyen-muc'),api('/api/v6/the').catch(()=>[])]);
  let b=id?await api('/api/v6/bai-viet/'+id):{id:null,tieu_de:'',duong_dan:'',noi_dung:'',tom_tat:'',trang_thai:'nhap',anh_dai_dien:'',chuyen_muc:[],the:[],seo_tieu_de:'',seo_mo_ta:'',tu_khoa:'',anh_mxh:'',cho_index:1,xuat_ban_luc:''};
  $('#tieuDe').textContent=id?'Sửa bài viết':'Viết bài mới';
  let ddTay=!!id, ban=JSON.stringify(goiBai(b));
  const tuSlug=t=>slug(t).replace(/^-+|-+$/g,'').slice(0,90);
  v.innerHTML='<div class="bt-luoi"><div>'+
    '<input class="bt-tieu-de" id="btTieuDe" placeholder="Thêm tiêu đề" value="'+esc(b.tieu_de)+'">'+
    '<div class="bt-dd">Đường dẫn: <span>'+esc(location.origin)+'/bai-viet/</span><input id="btDd" value="'+esc(b.duong_dan)+'" size="40" placeholder="tu-tao-theo-tieu-de"><a href="#" id="btDdLai" class="phu-dong">tạo lại</a></div>'+
    '<div class="bt-khung"><div class="bt-the-tab"><button type="button" class="dang" data-che="truc-quan">Trực quan</button><button type="button" data-che="ma">Mã HTML</button></div>'+
    '<div class="bt-cu" id="btCu">'+
      '<select data-lenh="formatBlock" title="Kiểu đoạn"><option value="p">Đoạn văn</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option><option value="h4">Tiêu đề 4</option><option value="blockquote">Trích dẫn</option></select>'+
      '<span class="ngan"></span><button type="button" data-lenh="bold" title="Đậm (Ctrl+B)"><b>B</b></button><button type="button" data-lenh="italic" title="Nghiêng (Ctrl+I)"><i>I</i></button><button type="button" data-lenh="underline" title="Gạch chân"><u>U</u></button><button type="button" data-lenh="strikeThrough" title="Gạch ngang"><s>S</s></button>'+
      '<span class="ngan"></span><button type="button" data-lenh="insertUnorderedList" title="Danh sách chấm">• ≡</button><button type="button" data-lenh="insertOrderedList" title="Danh sách số">1.≡</button><button type="button" data-lenh="formatBlock" data-gt="blockquote" title="Trích dẫn">❝</button>'+
      '<span class="ngan"></span><button type="button" data-lenh="justifyLeft" title="Căn trái">⇤</button><button type="button" data-lenh="justifyCenter" title="Căn giữa">↔</button><button type="button" data-lenh="justifyRight" title="Căn phải">⇥</button><button type="button" data-lenh="justifyFull" title="Căn đều">☰</button>'+
      '<span class="ngan"></span><button type="button" data-lenh="lienKet" title="Chèn liên kết (Ctrl+K)">🔗</button><button type="button" data-lenh="unlink" title="Bỏ liên kết">⛓︎̸</button><button type="button" data-lenh="anh" title="Thêm ảnh">🖼 Ảnh</button><button type="button" data-lenh="bang" title="Chèn bảng">▦</button><button type="button" data-lenh="insertHorizontalRule" title="Đường kẻ">―</button>'+
      '<span class="ngan"></span><button type="button" data-lenh="ghiChu" title="Ghi chú: bôi đen chữ rồi bấm">✎ Ghi chú</button>'+
      '<span class="ngan"></span><button type="button" data-lenh="removeFormat" title="Xóa định dạng">⌫</button><button type="button" data-lenh="undo" title="Hoàn tác">↶</button><button type="button" data-lenh="redo" title="Làm lại">↷</button>'+
    '</div><div class="bt-soan" id="btSoan" contenteditable="true" data-goi-y="Bắt đầu viết nội dung…"></div><textarea class="bt-ma" id="btMa" hidden spellcheck="false"></textarea>'+
    '<div class="bt-chan"><span id="btDem">0 từ</span><span id="btLuuLuc"></span></div></div>'+
    '<div class="hop" style="margin-top:16px"><h4>Tóm tắt (sapo)</h4><div><textarea id="btTomTat" rows="3" placeholder="Một – hai câu giới thiệu, hiện dưới tiêu đề và trong danh sách bài">'+esc(b.tom_tat)+'</textarea></div></div>'+
    '<div class="hop" id="hopSeo"><h4>SEO <span id="btDiem" class="diem"></span></h4><div>'+
      '<div><div class="phu-dong" style="margin-bottom:6px">Xem trước trên Google</div><div class="serp"><div class="s1">Học Lịch Sử</div><div class="s2" id="serpUrl"></div><div class="s3" id="serpTit"></div><div class="s4" id="serpMt"></div></div></div>'+
      '<label>Tiêu đề SEO <input id="btSeoTit" value="'+esc(b.seo_tieu_de)+'" placeholder="Để trống = tiêu đề bài – Học Lịch Sử"></label><div class="dem-ky" id="demTit"></div>'+
      '<label>Mô tả meta <textarea id="btSeoMt" rows="3" placeholder="Mô tả ngắn hiện trên Google (120 – 160 ký tự)">'+esc(b.seo_mo_ta)+'</textarea></label><div class="dem-ky" id="demMt"></div>'+
      '<label>Từ khóa chính <input id="btTuKhoa" value="'+esc(b.tu_khoa)+'" placeholder="vd: Trần Hưng Đạo"></label>'+
      '<ul class="kiem" id="btKiem"></ul>'+
      '<details><summary style="cursor:pointer;font-weight:600">Mạng xã hội &amp; nâng cao</summary><div style="display:grid;gap:10px;margin-top:10px">'+
        '<div class="phu-dong">Ảnh khi chia sẻ Facebook/Zalo (để trống = ảnh đại diện)</div><div id="btMxh"></div>'+
        '<label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="btIndex" style="width:auto"'+(b.cho_index?' checked':'')+'> Cho phép Google lập chỉ mục bài này</label></div></details>'+
    '</div></div>'+
  '</div><aside>'+
    '<div class="hop"><h4>Xuất bản</h4><div>'+
      '<div style="display:flex;gap:8px"><button class="nut" id="btNhap">Lưu nháp</button><button class="nut" id="btXem" style="margin-left:auto">Xem trước</button></div>'+
      '<div>Trạng thái: <b id="btTT">'+TT[b.trang_thai]+'</b></div>'+
      '<div class="dong">Ngày đăng: <input type="datetime-local" id="btNgay"></div>'+
      '<div>Điểm SEO: <span id="btDiem2" class="diem"></span></div>'+
      (b.id?'<div class="phu-dong">Sửa lần cuối '+esc(ngay(b.sua_luc))+' · <a href="#" id="btBan">Phiên bản cũ</a></div>':'')+
      '<div style="display:flex;gap:8px;align-items:center;border-top:1px solid var(--vien);padding-top:10px">'+(b.id?'<a href="#" id="btRac" style="color:#b3412e;font-size:13px">Bỏ vào thùng rác</a>':'')+'<button class="nut chinh" id="btDang" style="margin-left:auto">'+(b.trang_thai==='xuat-ban'?'Cập nhật':'Xuất bản')+'</button></div>'+
    '</div></div>'+
    '<div class="hop"><h4>Chuyên mục</h4><div><div class="ds-cm" id="btCm"></div><a href="#" id="btThemCm" style="font-size:13px">+ Thêm chuyên mục</a></div></div>'+
    '<div class="hop"><h4>Thẻ</h4><div><div class="dong"><input id="btTheMoi" placeholder="Thêm thẻ, cách nhau bởi dấu phẩy" list="btTheGoiY"><button class="nut nho" id="btTheThem">Thêm</button></div><datalist id="btTheGoiY">'+theHay.map(([t])=>'<option value="'+esc(t)+'">').join('')+'</datalist><div id="btThe"></div></div></div>'+
    '<div class="hop"><h4>Ảnh đại diện</h4><div id="btAnh"></div></div>'+
  '</aside></div>';

  const soan=$('#btSoan'),ma=$('#btMa');soan.innerHTML=b.noi_dung||'';
  if(QT.napCssSoan){QT.napCssSoan();QT.ganCongCuAnh(soan);}   // ghi chú + căn ảnh (quan-tri-soan-thao.js)
  let cheDo='truc-quan';
  const layNoiDung=()=>(cheDo==='ma'?ma.value:soan.innerHTML).replace(/<img([^>]*?)\sclass="chon"/g,'<img$1');
  const thu=()=>({...b,tieu_de:$('#btTieuDe').value.trim(),duong_dan:$('#btDd').value.trim(),noi_dung:layNoiDung(),tom_tat:$('#btTomTat').value.trim(),
    seo_tieu_de:$('#btSeoTit').value.trim(),seo_mo_ta:$('#btSeoMt').value.trim(),tu_khoa:$('#btTuKhoa').value.trim(),cho_index:$('#btIndex').checked,
    chuyen_muc:$$('#btCm input:checked').map(i=>+i.value),xuat_ban_luc:$('#btNgay').value?new Date($('#btNgay').value).toISOString():''});
  QT.chanRoi=()=>JSON.stringify(goiBai(thu()))!==ban;
  window.onbeforeunload=e=>{if(QT.chanRoi&&QT.chanRoi()){e.preventDefault();e.returnValue='';}};
  if(b.xuat_ban_luc){const d=new Date(b.xuat_ban_luc);$('#btNgay').value=new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}

  // Đường dẫn tự theo tiêu đề cho đến khi sửa tay.
  $('#btTieuDe').oninput=()=>{if(!ddTay)$('#btDd').value=tuSlug($('#btTieuDe').value);capNhat();};
  $('#btDd').oninput=()=>{ddTay=true;capNhat();};$('#btDd').onblur=()=>{$('#btDd').value=tuSlug($('#btDd').value)||tuSlug($('#btTieuDe').value);capNhat();};
  $('#btDdLai').onclick=e=>{e.preventDefault();ddTay=false;$('#btDd').value=tuSlug($('#btTieuDe').value);capNhat();};

  // Thanh công cụ
  document.execCommand('defaultParagraphSeparator',false,'p');
  const lenh=(c,gt)=>{soan.focus();document.execCommand(c,false,gt);capNhat();};
  $$('#btCu button').forEach(bt=>bt.onmousedown=e=>e.preventDefault());
  $$('#btCu button').forEach(bt=>bt.onclick=async()=>{
    const c=bt.dataset.lenh;
    if(c==='ghiChu'){QT.themGhiChu(soan);capNhat();return;}
    if(c==='lienKet'){const sel=window.getSelection();const r=sel.rangeCount?sel.getRangeAt(0).cloneRange():null;
      const u=prompt('Địa chỉ liên kết (https://… hoặc /nhan-vat-lich-su/…):','https://');if(!u||u==='https://')return;
      if(r){sel.removeAllRanges();sel.addRange(r);}if(r&&r.collapsed)lenh('insertHTML','<a href="'+esc(u)+'">'+esc(u)+'</a>');else lenh('createLink',u);
      if(/^https?:/.test(u)&&!/hoclichsu\.com/.test(u))$$('a[href="'+CSS.escape(u)+'"]',soan).forEach(a=>a.target='_blank');return;}
    if(c==='anh'){const sel=window.getSelection();const r=sel.rangeCount&&soan.contains(sel.anchorNode)?sel.getRangeAt(0).cloneRange():null;
      const a=await chonAnh('Thêm ảnh vào bài');if(!a)return;soan.focus();QT.chenAnh(soan,a,r);capNhat();return;}
    if(c==='bang'){const n=prompt('Số cột × số dòng (vd 2x3):','2x3');if(!n)return;const m=n.match(/(\d+)\s*[x×*]\s*(\d+)/);if(!m)return;
      const cot=Math.min(+m[1],8),dong=Math.min(+m[2],30);
      lenh('insertHTML','<table><thead><tr>'+'<th>Tiêu đề</th>'.repeat(cot)+'</tr></thead><tbody>'+('<tr>'+'<td>&nbsp;</td>'.repeat(cot)+'</tr>').repeat(dong)+'</tbody></table><p><br></p>');return;}
    lenh(c,bt.dataset.gt?'<'+bt.dataset.gt+'>':undefined);
  });
  $('#btCu select').onchange=e=>{lenh('formatBlock','<'+e.target.value+'>');};
  soan.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('[data-lenh=lienKet]').click();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();luu(b.trang_thai==='xuat-ban'?'xuat-ban':'nhap');}});
  // Dán: chỉ giữ cấu trúc cơ bản (máy chủ làm sạch lại khi lưu).
  soan.addEventListener('paste',e=>{const h=e.clipboardData.getData('text/html');
    if(h){e.preventDefault();const d=document.createElement('div');d.innerHTML=h;
      d.querySelectorAll('script,style,meta,link,iframe,object,svg').forEach(x=>x.remove());
      d.querySelectorAll('*').forEach(x=>{[...x.attributes].forEach(at=>{if(!['href','src','alt','colspan','rowspan'].includes(at.name))x.removeAttribute(at.name);});
        if(['SPAN','FONT'].includes(x.tagName))x.replaceWith(...x.childNodes);});
      document.execCommand('insertHTML',false,d.innerHTML);}
    else{const t=e.clipboardData.getData('text/plain');if(t){e.preventDefault();document.execCommand('insertHTML',false,t.split(/\n{2,}/).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join(''));}}
    capNhat();});
  // Ô trống: bắt đầu bằng một đoạn <p> để mọi dòng đều là đoạn văn đúng chuẩn.
  soan.addEventListener('focus',()=>{if(!soan.innerHTML.trim()){soan.innerHTML='<p><br></p>';const r=document.createRange();r.setStart(soan.firstChild,0);r.collapse(true);const se=getSelection();se.removeAllRanges();se.addRange(r);}});
  soan.addEventListener('input',()=>capNhat());ma.addEventListener('input',()=>capNhat());
  // Chuyển chế độ Trực quan / Mã HTML
  $$('.bt-the-tab button').forEach(t=>t.onclick=()=>{const m=t.dataset.che;if(m===cheDo)return;
    if(m==='ma'){ma.value=dinhDangMa(soan.innerHTML);}else{soan.innerHTML=ma.value;}
    cheDo=m;soan.hidden=m==='ma';ma.hidden=m!=='ma';$('#btCu').style.visibility=m==='ma'?'hidden':'visible';
    $$('.bt-the-tab button').forEach(x=>x.classList.toggle('dang',x===t));});

  // Chuyên mục
  const veCm=()=>{$('#btCm').innerHTML=cms.map(c=>'<label><input type="checkbox" value="'+c.id+'"'+(b.chuyen_muc.includes(c.id)?' checked':'')+'> '+esc(c.ten)+'</label>').join('')||'<span class="phu-dong">Chưa có chuyên mục.</span>';
    $$('#btCm input').forEach(i=>i.onchange=()=>{b.chuyen_muc=$$('#btCm input:checked').map(x=>+x.value);capNhat();});};veCm();
  $('#btThemCm').onclick=async e=>{e.preventDefault();const t=prompt('Tên chuyên mục mới:');if(!t)return;
    try{const c=await api('/api/v6/chuyen-muc',{method:'POST',body:{ten:t}});cms.push({id:c.id,ten:c.ten});b.chuyen_muc.push(c.id);veCm();bao('Đã thêm chuyên mục.');}catch(err){bao(err.message,true);}};
  // Thẻ
  const veThe=()=>{$('#btThe').innerHTML=b.the.map((t,i)=>'<span class="chip-the">'+esc(t)+'<button type="button" data-i="'+i+'" aria-label="Bỏ thẻ">✕</button></span>').join('');
    $$('#btThe button').forEach(x=>x.onclick=()=>{b.the.splice(+x.dataset.i,1);veThe();capNhat();});};veThe();
  const themThe=()=>{const v2=$('#btTheMoi').value.split(',').map(x=>x.trim()).filter(Boolean);for(const t of v2)if(!b.the.some(x=>x.toLowerCase()===t.toLowerCase()))b.the.push(t);$('#btTheMoi').value='';veThe();capNhat();};
  $('#btTheThem').onclick=themThe;$('#btTheMoi').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();themThe();}};
  // Ảnh đại diện + ảnh MXH
  const oChonAnh=(chua,khoa,nhanChon)=>{const ve=()=>{const u=b[khoa];
      chua.innerHTML=u?'<div class="anh-dd"><a href="#" class="doi"><img src="'+esc(nho(u))+'" alt=""></a></div><div class="phu-dong">Bấm ảnh để đổi</div><a href="#" class="bo" style="color:#b3412e;font-size:13px">Bỏ ảnh</a>':'<a href="#" class="doi">'+nhanChon+'</a>';
      $$('.doi',chua).forEach(a=>a.onclick=async e=>{e.preventDefault();const r=await chonAnh(nhanChon);if(r){b[khoa]=r.url;ve();capNhat();}});
      const bo=$('.bo',chua);if(bo)bo.onclick=e=>{e.preventDefault();b[khoa]='';ve();capNhat();};};ve();};
  oChonAnh($('#btAnh'),'anh_dai_dien','Đặt ảnh đại diện');oChonAnh($('#btMxh'),'anh_mxh','Chọn ảnh chia sẻ');
  ['btSeoTit','btSeoMt','btTuKhoa','btTomTat','btIndex','btNgay'].forEach(i=>$('#'+i).addEventListener('input',()=>capNhat()));

  function capNhat(){
    const d=thu();const r=diemSeo(d);
    $('#btDem').textContent=r.tu+' từ';
    const tit=d.seo_tieu_de||(d.tieu_de?d.tieu_de+' – Học Lịch Sử':'');
    $('#serpUrl').textContent=location.host+' › bai-viet › '+(d.duong_dan||tuSlug(d.tieu_de)||'…');
    $('#serpTit').textContent=tit||'Tiêu đề bài viết';
    $('#serpMt').textContent=d.seo_mo_ta||d.tom_tat||(soan.textContent||'').slice(0,160)||'Mô tả bài viết sẽ hiện ở đây.';
    const dt=(d.seo_tieu_de||tit).length,dm=d.seo_mo_ta.length;
    $('#demTit').textContent=dt+' / 60 ký tự';$('#demTit').classList.toggle('vuot',dt>60);
    $('#demMt').textContent=dm+' / 160 ký tự';$('#demMt').classList.toggle('vuot',dm>160);
    $('#btKiem').innerHTML=r.ds.map(x=>'<li><span class="'+(x.ok?'y':'n')+'">'+(x.ok?'✔':'✖')+'</span><span>'+esc(x.t)+(x.ok?'':'<small>'+esc(x.g)+'</small>')+'</span></li>').join('');
    for(const k of ['btDiem','btDiem2']){$('#'+k).textContent=r.diem+'/100';$('#'+k).style.cssText=mauDiem(r.diem);}
  }
  capNhat();
  ban=JSON.stringify(goiBai(thu()));   // mốc so sánh “chưa lưu” theo đúng dạng biểu mẫu

  async function luu(trangThai){
    const d=thu();if(!d.tieu_de){bao('Nhập tiêu đề bài viết.',true);$('#btTieuDe').focus();return null;}
    d.trang_thai=trangThai;if(!d.duong_dan)d.duong_dan=tuSlug(d.tieu_de);
    try{
      const r=b.id?await api('/api/v6/bai-viet/'+b.id,{method:'PUT',body:goiBai(d)}):await api('/api/v6/bai-viet',{method:'POST',body:goiBai(d)});
      b=r;ban=JSON.stringify(goiBai(b));$('#btDd').value=b.duong_dan;$('#btTT').textContent=TT[b.trang_thai];
      $('#btDang').textContent=b.trang_thai==='xuat-ban'?'Cập nhật':'Xuất bản';$('#btLuuLuc').textContent='Đã lưu '+new Date().toLocaleTimeString('vi-VN');
      if(cheDo==='truc-quan'&&soan.innerHTML!==b.noi_dung){soan.innerHTML=b.noi_dung;}else if(cheDo==='ma')ma.value=dinhDangMa(b.noi_dung);
      ban=JSON.stringify(goiBai(thu()));
      bao(trangThai==='xuat-ban'?'Đã xuất bản. ':'Đã lưu nháp.');
      if(!id){QT.chanRoi=null;history.replaceState(null,'','#viet-bai/'+b.id);QT.trang['viet-bai'](v,String(b.id));}
      return b;
    }catch(err){bao(err.message,true);return null;}
  }
  $('#btNhap').onclick=()=>luu('nhap');
  $('#btDang').onclick=async()=>{const r=await luu('xuat-ban');if(r)bao('Đã xuất bản — mở bài: /bai-viet/'+r.duong_dan);};
  $('#btXem').onclick=async()=>{const w=window.open('about:blank','_blank');const r=b.id&&!QT.chanRoi()?b:await luu(b.trang_thai);
    if(r&&w)w.location='/bai-viet/'+(r.trang_thai==='xuat-ban'&&!(r.xuat_ban_luc>new Date().toISOString())?r.duong_dan:'xem-truoc/'+r.id);else if(w)w.close();};
  if($('#btRac'))$('#btRac').onclick=async e=>{e.preventDefault();if(!confirm('Bỏ bài này vào thùng rác?'))return;
    try{await api('/api/v6/bai-viet/'+b.id,{method:'DELETE'});QT.chanRoi=null;bao('Đã bỏ vào thùng rác.');location.hash='bai-viet';}catch(err){bao(err.message,true);}};
  if($('#btBan'))$('#btBan').onclick=async e=>{e.preventDefault();const ds=await api('/api/v6/bai-viet/'+b.id+'/ban-sua');
    const chon=prompt('Phiên bản đã lưu (mới nhất trước):\n'+ds.map((x,i)=>(i+1)+'. '+ngay(x.luc)+' · '+(x.sua_boi||'')+' · '+x.du_lieu.tieu_de).join('\n')+'\n\nNhập số thứ tự để nạp lại vào trình biên tập (chưa lưu):');
    const i=parseInt(chon,10)-1;if(!(i>=0&&ds[i]))return;const x=ds[i].du_lieu;
    $('#btTieuDe').value=x.tieu_de;$('#btDd').value=x.duong_dan;soan.innerHTML=x.noi_dung;ma.value=x.noi_dung;$('#btTomTat').value=x.tom_tat||'';
    $('#btSeoTit').value=x.seo_tieu_de||'';$('#btSeoMt').value=x.seo_mo_ta||'';$('#btTuKhoa').value=x.tu_khoa||'';
    b.the=x.the||[];b.chuyen_muc=x.chuyen_muc||[];b.anh_dai_dien=x.anh_dai_dien||'';veThe();veCm();oChonAnh($('#btAnh'),'anh_dai_dien','Đặt ảnh đại diện');capNhat();
    bao('Đã nạp phiên bản cũ — bấm Lưu/Cập nhật để dùng.');};
  if(!id)$('#btTieuDe').focus();
};
function dinhDangMa(h){return h.replace(/></g,'>\n<').replace(/\n<\/(strong|em|a|u|s|span|b|i)>/g,'</$1>');}

/* ================= Chuyên mục ================= */
QT.trang['chuyen-muc']=async(v)=>{
  const ds=await api('/api/v6/chuyen-muc');
  v.innerHTML='<div style="display:grid;grid-template-columns:minmax(0,340px) 1fr;gap:20px;align-items:start" class="hai-cot-cm">'+
    '<form class="the bieu-mau" id="cmForm"><h3 id="cmTD">Thêm chuyên mục</h3><input type="hidden" name="id"><label>Tên<input name="ten" required></label><label>Đường dẫn<input name="duong_dan" placeholder="tự tạo theo tên"></label>'+
    '<label>Chuyên mục cha<select name="cha_id"><option value="">— Không —</option>'+ds.map(c=>'<option value="'+c.id+'">'+esc(c.ten)+'</option>').join('')+'</select></label><label>Mô tả<textarea name="mo_ta" rows="3"></textarea></label>'+
    '<div style="display:flex;gap:8px"><button class="nut chinh">Lưu</button><button class="nut" type="button" id="cmHuy" hidden>Hủy</button></div></form>'+
    '<table class="bang"><tr><th>Tên</th><th class="an-nho">Đường dẫn</th><th>Số bài</th><th></th></tr>'+ds.map(c=>'<tr><td><b>'+esc(c.ten)+'</b>'+(c.mo_ta?'<div class="phu-dong">'+esc(c.mo_ta)+'</div>':'')+'</td><td class="an-nho phu-dong">/bai-viet/chuyen-muc/'+esc(c.duong_dan)+'</td><td>'+c.so_bai+'</td>'+
      '<td style="white-space:nowrap"><button class="nut nho" data-sua="'+c.id+'">Sửa</button> <a class="nut nho" href="/bai-viet/chuyen-muc/'+esc(c.duong_dan)+'" target="_blank">Xem</a> <button class="nut nho nguy" data-xoa="'+c.id+'">Xóa</button></td></tr>').join('')+'</table></div>';
  const f=$('#cmForm');
  f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));const body={ten:d.ten,duong_dan:d.duong_dan,mo_ta:d.mo_ta,cha_id:d.cha_id?+d.cha_id:null};
    try{if(d.id)await api('/api/v6/chuyen-muc/'+d.id,{method:'PUT',body});else await api('/api/v6/chuyen-muc',{method:'POST',body});bao('Đã lưu chuyên mục.');QT.trang['chuyen-muc'](v);}catch(err){bao(err.message,true);}};
  $$('[data-sua]',v).forEach(b=>b.onclick=()=>{const c=ds.find(x=>x.id===+b.dataset.sua);f.id.value=c.id;f.ten.value=c.ten;f.duong_dan.value=c.duong_dan;f.mo_ta.value=c.mo_ta||'';f.cha_id.value=c.cha_id||'';
    $('#cmTD').textContent='Sửa chuyên mục';$('#cmHuy').hidden=false;f.ten.focus();});
  $('#cmHuy').onclick=()=>QT.trang['chuyen-muc'](v);
  $$('[data-xoa]',v).forEach(b=>b.onclick=async()=>{if(!confirm('Xóa chuyên mục này? Bài viết vẫn giữ nguyên.'))return;try{await api('/api/v6/chuyen-muc/'+b.dataset.xoa,{method:'DELETE'});QT.trang['chuyen-muc'](v);}catch(err){bao(err.message,true);}});
};

/* ================= Trợ lý AI ================= */
QT.trang['tro-ly']=async(v)=>{
  const nd=(await api('/api/v6/noi-dung')).noi_dung||{};
  const c={bat:true,...((nd['cai-dat']||{})['tro-ly']||{})};
  const veXem=()=>{$('#tlXem').innerHTML=c.bat?'<span style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#e3c17d,#caa060);color:#1a2021;border-radius:20px;padding:8px 16px 8px 8px;font-weight:700;box-shadow:0 4px 18px rgba(0,0,0,.25)">'+
    (c.bieu_tuong?'<img src="'+esc(c.bieu_tuong)+'" alt="" style="width:44px;height:44px;object-fit:contain">':'<span style="width:44px;height:44px;display:grid;place-items:center;font-size:26px">🧑‍🏫</span>')+esc(c.ten||'Sử gia hỗ trợ')+'</span>':'<span class="phu-dong">(Đang tắt — không hiện trên trang)</span>';};
  v.innerHTML='<div class="the bieu-mau" style="max-width:720px">'+
    '<label style="display:flex;gap:10px;align-items:center;font-size:15px"><input type="checkbox" id="tlBat" style="width:auto;transform:scale(1.3)"'+(c.bat?' checked':'')+'> Bật Trợ lý Học Lịch Sử trên trang</label>'+
    '<label>Tên nút<input id="tlTen" value="'+esc(c.ten||'')+'" placeholder="Sử gia hỗ trợ" maxlength="40"></label>'+
    '<label>Lời chào đầu tiên<textarea id="tlChao" rows="3" maxlength="400" placeholder="Chào bạn! Hãy hỏi về một triều đại, nhân vật, trận chiến…">'+esc(c.loi_chao||'')+'</textarea></label>'+
    '<div><div style="font-weight:600;font-size:13px;margin-bottom:6px">Biểu tượng (ảnh nền trong suốt PNG/WebP, vuông, ≥ 256 px là đẹp nhất)</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="nut" id="tlDoi" type="button">Chọn ảnh biểu tượng…</button><button class="nut" id="tlMacDinh" type="button">Dùng biểu tượng mặc định</button></div></div>'+
    '<div><div class="phu-dong" style="margin-bottom:8px">Xem trước nút trên trang</div><div id="tlXem" style="padding:16px;background:#1f2930;border-radius:10px"></div></div>'+
    '<div class="thanh-luu"><button class="nut chinh" id="tlLuu">Lưu cài đặt</button></div>'+
    '<p class="phu-dong" style="margin:0">Hiện trợ lý tra cứu theo dữ liệu soạn sẵn và tìm nguồn trên Wikipedia. Phần trả lời bằng AI (OpenAI) sẽ bật được tại đây sau khi đặt khóa API trên máy chủ.</p></div>';
  veXem();
  $('#tlBat').onchange=e=>{c.bat=e.target.checked;veXem();};$('#tlTen').oninput=e=>{c.ten=e.target.value;veXem();};$('#tlChao').oninput=e=>{c.loi_chao=e.target.value;};
  $('#tlDoi').onclick=async()=>{const a=await chonAnh('Chọn biểu tượng trợ lý');if(a){c.bieu_tuong=a.url;veXem();}};
  $('#tlMacDinh').onclick=()=>{delete c.bieu_tuong;veXem();};
  $('#tlLuu').onclick=async()=>{try{await api('/api/v6/noi-dung/cai-dat/tro-ly',{method:'PUT',body:{du_lieu:{bat:c.bat,ten:c.ten||'',loi_chao:c.loi_chao||'',bieu_tuong:c.bieu_tuong||''}}});bao('Đã lưu — trang chính áp dụng ngay.');}catch(e){bao(e.message,true);}};
};
})();
