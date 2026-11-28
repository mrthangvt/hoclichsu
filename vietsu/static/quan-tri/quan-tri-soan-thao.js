/* Học Lịch Sử — CMS V6.4: trình soạn thảo định dạng dùng chung (giống trình biên tập bài viết).
   Dùng cho: Triều đại → Bài chuyên đề, Nhân vật → Tiểu sử, Chủ tịch Hồ Chí Minh → Nội dung.
   QT.trinhSoan(chua, html, {goiY}) → {lay(), dat(html), ban: html ban đầu đã chuẩn hóa}
   Có: kiểu đoạn, đậm/nghiêng/gạch, danh sách, trích dẫn, căn lề, liên kết, ảnh (thư viện) + căn ảnh trái/giữa/phải/toàn khổ,
   bảng, ghi chú (bôi đen chữ → Ghi chú), xóa định dạng, hoàn tác, chế độ Mã HTML.
   QT.ganCongCuAnh(soan) và QT.themGhiChu(soan) cũng được trình biên tập bài viết dùng. */
(function(){
'use strict';
const QT=window.QT;const {bao,esc,$$}=QT;

const CSS=`
.ts-khung{border:1px solid var(--vien);border-radius:10px;background:#fff;margin-top:6px}
.ts-tab{border-radius:10px 10px 0 0}.ts-chan{border-radius:0 0 10px 10px}
.ts-tab{display:flex;justify-content:flex-end;gap:4px;background:#faf8f3;border-bottom:1px solid var(--vien);padding:4px 6px 0}
.ts-tab button{border:1px solid transparent;border-bottom:0;background:none;padding:5px 12px;border-radius:6px 6px 0 0;cursor:pointer;font-size:13px;font-weight:500}
.ts-tab button.dang{background:#fff;border-color:var(--vien)}
.ts-cu{display:flex;flex-wrap:wrap;gap:2px;padding:6px;border-bottom:1px solid var(--vien);background:#fff}
.ts-cu button,.ts-cu select{border:1px solid transparent;background:none;border-radius:6px;min-width:32px;height:32px;cursor:pointer;font-size:14px;padding:0 6px;width:auto;font-weight:500}
.ts-cu button:hover{background:#f2eee4;border-color:var(--vien)}.ts-cu .ngan{width:1px;background:var(--vien);margin:4px 4px}
.ts-soan,.bt-soan{font-family:"Be Vietnam Pro",system-ui,sans-serif!important;font-size:16px!important;line-height:1.75!important;color:#24292d}
.ts-soan{min-height:320px;max-height:70vh;overflow:auto;padding:18px 22px;outline:none}
.ts-soan h2,.ts-soan h3,.ts-soan h4{line-height:1.35;margin:1.1em 0 .45em}.ts-soan h2{font-size:1.4em}.ts-soan h3{font-size:1.2em}
.ts-soan p{margin:.6em 0}
.ts-soan img,.bt-soan img{max-width:100%;height:auto;border-radius:6px;cursor:pointer}
.ts-soan figure,.bt-soan figure{margin:1em 0;text-align:center}.ts-soan figcaption,.bt-soan figcaption{font-size:.85em;color:#7b746a}
.ts-soan figure.anh-trai,.bt-soan figure.anh-trai{float:left;max-width:45%;margin:.3em 1.2em .8em 0}
.ts-soan figure.anh-phai,.bt-soan figure.anh-phai{float:right;max-width:45%;margin:.3em 0 .8em 1.2em}
.ts-soan figure.anh-giua,.bt-soan figure.anh-giua{max-width:70%;margin-left:auto;margin-right:auto}
.ts-soan figure.anh-rong img,.bt-soan figure.anh-rong img{width:100%}
.ts-soan img.chon,.bt-soan img.chon{outline:3px solid #d6ac5c;outline-offset:2px}
.ts-soan blockquote{border-left:4px solid #c9a35a;margin:1em 0;padding:.2em 1em;background:#faf6ee}
.ts-soan table{border-collapse:collapse;width:100%}.ts-soan td,.ts-soan th{border:1px dashed #c9c1b1;padding:6px 8px;min-width:40px}
.ts-soan .ghi-chu,.bt-soan .ghi-chu{background:#fff3cd;border-bottom:2px dotted #c9a35a;cursor:help}
.ts-soan .ghi-chu::after,.bt-soan .ghi-chu::after{content:"✎";font-size:.7em;vertical-align:super;color:#a37a2c;margin-left:1px}
.ts-soan:empty:before{content:attr(data-goi-y);color:#a0a7ab}
.ts-ma{width:100%;min-height:320px;border:0;border-radius:0;font:13px/1.55 ui-monospace,Menlo,monospace;padding:14px}
.ts-chan{display:flex;justify-content:space-between;color:#66727a;font-size:12px;padding:6px 12px;border-top:1px solid var(--vien);background:#faf8f3}
.ts-anh-cu{position:absolute;z-index:40;display:flex;gap:2px;background:#1f2930;border-radius:8px;padding:4px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.ts-anh-cu button{border:0;background:none;color:#f6f0e4;font:500 12.5px "Be Vietnam Pro",system-ui;padding:6px 9px;border-radius:6px;cursor:pointer}
.ts-anh-cu button:hover,.ts-anh-cu button.dang{background:#d6ac5c;color:#1b1407}
.ts-goi-y{font-size:12.5px;color:#66727a;margin-top:6px}
@media(max-width:700px){.ts-soan{max-height:55vh;padding:14px 14px}.ts-cu button,.ts-cu select{height:36px}}`;
function napCss(){if(!document.getElementById('tsCss')){const s=document.createElement('style');s.id='tsCss';s.textContent=CSS;document.head.appendChild(s);}}

/* ---------- Ghi chú ---------- */
function themGhiChu(soan){
 const sel=getSelection();
 if(!sel.rangeCount||!soan.contains(sel.anchorNode)){bao('Đặt con trỏ vào bài và bôi đen chữ cần ghi chú.',true);return;}
 const r=sel.getRangeAt(0);
 const cu=(sel.anchorNode.nodeType===1?sel.anchorNode:sel.anchorNode.parentElement).closest('.ghi-chu');
 if(cu){suaGhiChu(cu);return;}
 if(r.collapsed){bao('Bôi đen chữ (từ, cụm từ) cần ghi chú rồi bấm “Ghi chú”.',true);return;}
 const nd=prompt('Nội dung ghi chú cho “'+r.toString().slice(0,60)+'”:\n(hiện thành số chú thích [1] và mục “Ghi chú” cuối bài)');
 if(!nd||!nd.trim())return;
 const sp=document.createElement('span');sp.className='ghi-chu';sp.title=nd.trim().replace(/\s+/g,' ').slice(0,1000);
 try{sp.appendChild(r.extractContents());r.insertNode(sp);}catch(e){bao('Không gắn được ghi chú ở chỗ này.',true);return;}
 sel.removeAllRanges();soan.dispatchEvent(new Event('input',{bubbles:true}));
}
function suaGhiChu(sp){
 const nd=prompt('Sửa ghi chú (để trống để bỏ ghi chú):',sp.title||'');
 if(nd===null)return;
 if(!nd.trim())sp.replaceWith(...sp.childNodes);else sp.title=nd.trim().replace(/\s+/g,' ').slice(0,1000);
 const soan=document.querySelector('.ts-soan:focus,.bt-soan')||document.body;soan.dispatchEvent(new Event('input',{bubbles:true}));
}

/* ---------- Công cụ ảnh: bấm ảnh trong khung soạn → căn trái / giữa / phải / toàn khổ, chú thích, xóa ---------- */
function ganCongCuAnh(soan){
 let thanh=null,anh=null;
 const dong=()=>{if(thanh)thanh.remove();thanh=null;if(anh)anh.classList.remove('chon');anh=null;};
 const bao_quanh=img=>{let f=img.closest('figure');if(!f||!soan.contains(f)){f=document.createElement('figure');img.replaceWith(f);f.appendChild(img);}return f;};
 soan.addEventListener('click',e=>{
  const img=e.target.closest('img');
  if(e.target.closest('.ghi-chu')&&!img){suaGhiChu(e.target.closest('.ghi-chu'));return;}
  if(!img||!soan.contains(img)){dong();return;}
  dong();anh=img;img.classList.add('chon');
  const f=img.closest('figure');const lop=f?['anh-trai','anh-giua','anh-phai','anh-rong'].find(c=>f.classList.contains(c))||'':'';
  thanh=document.createElement('div');thanh.className='ts-anh-cu';
  thanh.innerHTML=[['anh-trai','⇤ Trái'],['anh-giua','↔ Giữa'],['anh-phai','Phải ⇥'],['anh-rong','▭ Toàn khổ']].map(([c,t])=>'<button type="button" data-c="'+c+'" class="'+(lop===c?'dang':'')+'">'+t+'</button>').join('')+
   '<button type="button" data-c="chu">✎ Chú thích</button><button type="button" data-c="xoa">✕ Xóa</button>';
  document.body.appendChild(thanh);
  const r=img.getBoundingClientRect();thanh.style.left=Math.max(8,r.left+scrollX)+'px';thanh.style.top=Math.max(8,r.top+scrollY-44)+'px';
  thanh.addEventListener('mousedown',ev=>ev.preventDefault());
  thanh.onclick=ev=>{const c=ev.target.closest('button');if(!c)return;const k=c.dataset.c;const f2=bao_quanh(img);
   if(k==='xoa'){f2.remove();dong();}
   else if(k==='chu'){let cap=f2.querySelector('figcaption');const t=prompt('Chú thích ảnh (để trống để bỏ):',cap?cap.textContent:(img.alt||''));if(t===null)return;
    if(!t.trim()){if(cap)cap.remove();}else{if(!cap){cap=document.createElement('figcaption');f2.appendChild(cap);}cap.textContent=t.trim();}}
   else{f2.classList.remove('anh-trai','anh-giua','anh-phai','anh-rong');if(k!==lop)f2.classList.add(k);dong();}
   soan.dispatchEvent(new Event('input',{bubbles:true}));};
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dong();});
 soan.addEventListener('input',()=>{if(anh&&!soan.contains(anh))dong();});
 window.addEventListener('hashchange',dong);
}

/* ---------- Chèn ảnh: đặt <figure> SAU khối đang đứng (không lồng trong <p>, tránh trình duyệt tách đôi ảnh và chú thích) ---------- */
function chenAnh(soan,a,r){
 const f=document.createElement('figure');f.className='anh-giua';
 const img=document.createElement('img');img.src=a.url;img.alt=a.alt||'';if(a.rong)img.width=a.rong;if(a.cao)img.height=a.cao;f.appendChild(img);
 if(a.alt){const c=document.createElement('figcaption');c.textContent=a.alt;f.appendChild(c);}
 let khoi=null;
 if(r&&soan.contains(r.startContainer)){let n=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement;
  khoi=n.closest('p,h2,h3,h4,li,blockquote,figure,table,ul,ol');if(khoi&&khoi.closest('li'))khoi=khoi.closest('ul,ol');
  while(khoi&&khoi.parentElement!==soan)khoi=khoi.parentElement;}
 const p=document.createElement('p');p.appendChild(document.createElement('br'));
 if(khoi){const rong=!khoi.textContent.trim()&&!khoi.querySelector('img');
  if(rong&&khoi.tagName==='P'){khoi.replaceWith(f);}else khoi.after(f);}
 else soan.appendChild(f);
 if(!f.nextElementSibling)f.after(p);
 const rr=document.createRange();const sau=f.nextElementSibling;rr.setStart(sau,0);rr.collapse(true);const se=getSelection();se.removeAllRanges();se.addRange(rr);
 soan.dispatchEvent(new Event('input',{bubbles:true}));
}

/* ---------- Dán: chỉ giữ cấu trúc cơ bản (máy chủ làm sạch lại khi lưu) ---------- */
function ganDan(soan){
 soan.addEventListener('paste',e=>{const h=e.clipboardData.getData('text/html');
  if(h){e.preventDefault();const d=document.createElement('div');d.innerHTML=h;
   d.querySelectorAll('script,style,meta,link,iframe,object,svg').forEach(x=>x.remove());
   d.querySelectorAll('*').forEach(x=>{[...x.attributes].forEach(at=>{if(!['href','src','alt','colspan','rowspan'].includes(at.name))x.removeAttribute(at.name);});
    if(['SPAN','FONT'].includes(x.tagName))x.replaceWith(...x.childNodes);});
   document.execCommand('insertHTML',false,d.innerHTML);}
  else{const t=e.clipboardData.getData('text/plain');if(t){e.preventDefault();document.execCommand('insertHTML',false,t.split(/\n{2,}/).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join(''));}}
  soan.dispatchEvent(new Event('input',{bubbles:true}));});
}
const dinhDangMa=h=>h.replace(/></g,'>\n<').replace(/\n<\/(strong|em|a|u|s|span|b|i)>/g,'</$1>');
const sachHien=h=>String(h||'').replace(/<img([^>]*?)\sclass="chon"/g,'<img$1').replace(/\sclass=""/g,'');

/* ---------- Trình soạn thảo ---------- */
function trinhSoan(chua,html,opt={}){
 napCss();
 chua.innerHTML='<div class="ts-khung"><div class="ts-tab"><button type="button" class="dang" data-che="truc-quan">Trực quan</button><button type="button" data-che="ma">Mã HTML</button></div>'+
  '<div class="ts-cu">'+
   '<select data-lenh="formatBlock" title="Kiểu đoạn"><option value="p">Đoạn văn</option><option value="h2">Tiêu đề 2</option><option value="h3">Tiêu đề 3</option><option value="h4">Tiêu đề 4</option><option value="blockquote">Trích dẫn</option></select>'+
   '<span class="ngan"></span><button type="button" data-lenh="bold" title="Đậm (Ctrl+B)"><b>B</b></button><button type="button" data-lenh="italic" title="Nghiêng (Ctrl+I)"><i>I</i></button><button type="button" data-lenh="underline" title="Gạch chân"><u>U</u></button><button type="button" data-lenh="strikeThrough" title="Gạch ngang"><s>S</s></button>'+
   '<span class="ngan"></span><button type="button" data-lenh="insertUnorderedList" title="Danh sách chấm">• ≡</button><button type="button" data-lenh="insertOrderedList" title="Danh sách số">1.≡</button><button type="button" data-lenh="formatBlock" data-gt="blockquote" title="Trích dẫn">❝</button>'+
   '<span class="ngan"></span><button type="button" data-lenh="justifyLeft" title="Căn trái">⇤</button><button type="button" data-lenh="justifyCenter" title="Căn giữa">↔</button><button type="button" data-lenh="justifyRight" title="Căn phải">⇥</button><button type="button" data-lenh="justifyFull" title="Căn đều">☰</button>'+
   '<span class="ngan"></span><button type="button" data-lenh="lienKet" title="Chèn liên kết (Ctrl+K)">🔗</button><button type="button" data-lenh="unlink" title="Bỏ liên kết">⛓︎̸</button><button type="button" data-lenh="anh" title="Thêm ảnh từ thư viện">🖼 Ảnh</button><button type="button" data-lenh="bang" title="Chèn bảng">▦</button><button type="button" data-lenh="insertHorizontalRule" title="Đường kẻ">―</button>'+
   '<span class="ngan"></span><button type="button" data-lenh="ghiChu" title="Ghi chú: bôi đen chữ rồi bấm">✎ Ghi chú</button>'+
   '<span class="ngan"></span><button type="button" data-lenh="removeFormat" title="Xóa định dạng">⌫</button><button type="button" data-lenh="undo" title="Hoàn tác">↶</button><button type="button" data-lenh="redo" title="Làm lại">↷</button>'+
  '</div><div class="ts-soan" contenteditable="true" data-goi-y="'+esc(opt.goiY||'Bắt đầu viết nội dung…')+'"></div><textarea class="ts-ma" hidden spellcheck="false"></textarea>'+
  '<div class="ts-chan"><span class="ts-dem">0 từ</span><span>Tên nhân vật, triều đại, sự kiện tự thành liên kết khi hiển thị</span></div></div>';
 const soan=chua.querySelector('.ts-soan'),ma=chua.querySelector('.ts-ma'),cu=chua.querySelector('.ts-cu');
 soan.innerHTML=html||'';
 let cheDo='truc-quan';
 const lay=()=>sachHien(cheDo==='ma'?ma.value:soan.innerHTML).trim();
 const dem=()=>{const t=(cheDo==='ma'?ma.value.replace(/<[^>]+>/g,' '):soan.textContent).trim();chua.querySelector('.ts-dem').textContent=(t?t.split(/\s+/).length:0)+' từ';};
 document.execCommand('defaultParagraphSeparator',false,'p');
 const lenh=(c,gt)=>{soan.focus();document.execCommand(c,false,gt);dem();};
 $$('button',cu).forEach(bt=>bt.onmousedown=e=>e.preventDefault());
 $$('button',cu).forEach(bt=>bt.onclick=async()=>{
  const c=bt.dataset.lenh;
  if(c==='ghiChu'){themGhiChu(soan);return;}
  if(c==='lienKet'){const sel=getSelection();const r=sel.rangeCount?sel.getRangeAt(0).cloneRange():null;
   const u=prompt('Địa chỉ liên kết (https://… hoặc /nhan-vat-lich-su/…):','https://');if(!u||u==='https://')return;
   if(r){sel.removeAllRanges();sel.addRange(r);}if(r&&r.collapsed)lenh('insertHTML','<a href="'+esc(u)+'">'+esc(u)+'</a>');else lenh('createLink',u);return;}
  if(c==='anh'){const sel=getSelection();const r=sel.rangeCount&&soan.contains(sel.anchorNode)?sel.getRangeAt(0).cloneRange():null;
   const a=await QT.chonAnh('Thêm ảnh');if(!a)return;soan.focus();chenAnh(soan,a,r);dem();return;}
  if(c==='bang'){const n=prompt('Số cột × số dòng (vd 2x3):','2x3');if(!n)return;const m=n.match(/(\d+)\s*[x×*]\s*(\d+)/);if(!m)return;
   const cot=Math.min(+m[1],8),dong=Math.min(+m[2],30);
   lenh('insertHTML','<table><thead><tr>'+'<th>Tiêu đề</th>'.repeat(cot)+'</tr></thead><tbody>'+('<tr>'+'<td>&nbsp;</td>'.repeat(cot)+'</tr>').repeat(dong)+'</tbody></table><p><br></p>');return;}
  lenh(c,bt.dataset.gt?'<'+bt.dataset.gt+'>':undefined);
 });
 cu.querySelector('select').onchange=e=>{lenh('formatBlock','<'+e.target.value+'>');e.target.value='p';};
 soan.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();cu.querySelector('[data-lenh=lienKet]').click();}});
 soan.addEventListener('focus',()=>{if(!soan.innerHTML.trim()){soan.innerHTML='<p><br></p>';const r=document.createRange();r.setStart(soan.firstChild,0);r.collapse(true);const se=getSelection();se.removeAllRanges();se.addRange(r);}});
 soan.addEventListener('input',dem);ma.addEventListener('input',dem);
 ganDan(soan);ganCongCuAnh(soan);
 $$('.ts-tab button',chua).forEach(t=>t.onclick=()=>{const m=t.dataset.che;if(m===cheDo)return;
  if(m==='ma')ma.value=dinhDangMa(sachHien(soan.innerHTML));else soan.innerHTML=ma.value;
  cheDo=m;soan.hidden=m==='ma';ma.hidden=m!=='ma';cu.style.visibility=m==='ma'?'hidden':'visible';
  $$('.ts-tab button',chua).forEach(x=>x.classList.toggle('dang',x===t));});
 dem();
 const ban=lay();
 return {lay,ban,dat:h=>{if(cheDo==='ma')ma.value=dinhDangMa(h);else soan.innerHTML=h;dem();},soan};
}

Object.assign(QT,{trinhSoan,themGhiChu,ganCongCuAnh,chenAnh,napCssSoan:napCss});
})();
