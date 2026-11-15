/* VIỆT SỬ V3.9: trải nghiệm offline, truy cập bàn phím, bài học đã duyệt */
(function(){
 'use strict';
 const offline = location.protocol === 'file:';
 const $ = (sel,scope=document)=>scope.querySelector(sel);
 const esc = v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lessons=window.VS39_OFFLINE_LESSONS||{};
 function list(){try{return Object.values(window.V21_LESSONS||V21_LESSONS).flat()}catch(_){return []}}
 function initOfflineLessons(){
  if(!offline||!Object.keys(lessons).length)return;
  const byId=new Map(list().map(x=>[x.id,x]));
  for(const [id,entry] of Object.entries(lessons)){
   const l=byId.get(id); if(!l)continue;
   l.has_content=true; l.status='Đã có bài học'; l.summary=entry.summary||l.summary;
  }
  const prev=window.v22OpenLesson;
  if(typeof prev!=='function')return;
  window.v22OpenLesson=function(id){
   const l=lessons[id];if(!l)return prev(id);
   const ov=$('#overlay');if(!ov)return prev(id);
   $('#modtype').textContent='SÁCH GIÁO KHOA LỊCH SỬ · LỚP '+l.grade;
   $('#modtitle').textContent=l.title||'Bài học';
   $('#moddesc').textContent=l.chapter||'';
   const tabs=$('#tabs');if(tabs)tabs.innerHTML='';
   let body='<div class="panel"><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary||'')+'</p></div>';
   if(l.key_points?.length)body+='<div class="panel"><h3>Ý chính cần nhớ</h3><ul>'+l.key_points.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>';
   body+='<div class="panel vs-lesson-body">'+(l.content_html||'')+'</div>';
   if(l.review_questions?.length)body+='<div class="panel"><h3>Tự ôn tập</h3><ol>'+l.review_questions.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>';
   if(l.sources?.length)body+='<div class="panel"><h3>Nguồn tham khảo</h3><ul>'+l.sources.map(x=>'<li>'+esc(x.title||x.url||'')+'</li>').join('')+'</ul></div>';
   $('#modalbody').innerHTML=body;
   ov.classList.add('show');document.body.style.overflow='hidden';
   try{setModalView('full')}catch(_){ };
   const bodyEl=$('#modalbody');if(bodyEl)bodyEl.scrollTop=0;
  };
 }
 function initSearchKeyboard(){
  const input=$('#v31SearchInput');
  if(input){input.setAttribute('aria-keyshortcuts','Control+K Meta+K')}
  document.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&key==='k'&&input){e.preventDefault();
      try{window.showSection?.('main')}catch(_){};input.focus();input.select();return;
    }
    if(e.key==='Escape'&&input&&document.activeElement===input){
      const panel=$('#v31SearchResults');if(panel)panel.hidden=true;
      input.blur();
    }
  });
 }
 function initOfflineNotice(){
   if(!offline)return;
   const hero=$('#mainHistory header.hero');if(!hero||$('#vs39OfflineNote'))return;
   const p=document.createElement('p');p.id='vs39OfflineNote';p.className='vs39-offline-note';
   p.textContent='Bản lưu ngoại tuyến · Dữ liệu được lưu tại thời điểm xuất bản V3.9; bản đồ nền trực tuyến và chức năng tài khoản cần kết nối Internet.';
   hero.append(p);
 }
 function initOfflineLinks(){
  if(!offline)return;
  document.addEventListener('click',e=>{
   const a=e.target.closest?.('a[href]');if(!a)return;
   const href=a.getAttribute('href')||'';
   if(!href.startsWith('/')||href.startsWith('//'))return;
   if(/^\/(?:nhan-vat|sach-giao-khoa|bai-viet)(?:\/|$)/.test(href)){
    e.preventDefault();
    const s=href.split('/').filter(Boolean);
    if(s[0]==='nhan-vat'&&s[1]){
      try{const found=Object.entries(window.persons||persons).find(([id,p])=>String(p.slug||'')===s[1]);if(found){window.openItem?.(found[0]);return}}catch(_){ }
    }
    if(s[0]==='sach-giao-khoa'){
      const g=Number((s[1]||'').replace('lop-',''))||undefined;
      if(typeof window.showSchool==='function'){showSchool(g);return}
    }
    alert('Trang này có đường dẫn SEO khi sử dụng website trực tuyến. Bản offline chưa có trang riêng; hãy mở bài học hoặc hồ sơ từ menu trong ứng dụng.');
   }
  });
 }
 function init(){initOfflineLessons();initSearchKeyboard();initOfflineNotice();initOfflineLinks()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Việt Sử V4.1 · Không gian lịch sử 3D
   Thêm nút "Vào sa bàn 3D" vào hồ sơ không gian (popup scene:<id>) khi có bản 3D.
   Danh sách sa bàn: thêm một dòng vào KHONG_GIAN_3D khi có không gian mới (thư mục static/khong-gian/<ten>/). */
(function(){
 'use strict';
 const KHONG_GIAN_3D={
  'quang-tri':{url:'khong-gian/thanh-co-quang-tri/',ten:'Sa bàn 3D Thành cổ Quảng Trị 1972',ghiChu:'Tái dựng mô phỏng: địa hình, tường thành đổ nát, bộ đội vượt sông Thạch Hãn, xe tăng, máy bay, âm thanh chiến trường. Cần đối chiếu tư liệu.'}
 };
 const css=document.createElement('style');
 css.textContent='.vs-space3d{margin:0 0 16px;padding:16px 18px;border:1px solid #c9a35b;border-radius:14px;background:linear-gradient(120deg,#3a2a17,#1d2b2f)}'
  +'.vs-space3d b{display:block;color:#f4d49a;font-size:16px;margin-bottom:6px}.vs-space3d p{margin:0 0 12px;color:#d8cdb6;font-size:13px;line-height:1.6}'
  +'.vs-space3d a{display:inline-block;background:#e2b768;color:#23190d;font-weight:700;text-decoration:none;padding:10px 16px;border-radius:10px}'
  +'.vs-space3d a:hover{filter:brightness(1.08)}.vs-space3d small{display:block;margin-top:8px;color:#a99d86;font-size:11px}';
 document.head.appendChild(css);
 function sceneId(){try{return (typeof active==='string'&&active.startsWith('scene:'))?active.slice(6):null}catch(_){return null}}
 function inject(){
  const sp=KHONG_GIAN_3D[sceneId()];const body=document.getElementById('modalbody');
  if(!sp||!body||body.querySelector('.vs-space3d'))return;
  const box=document.createElement('div');box.className='vs-space3d';
  const online=/^https?:$/.test(location.protocol);
  box.innerHTML='<b>'+sp.ten+'</b><p>'+sp.ghiChu+'</p>'+(online
   ?'<a href="'+sp.url+'">▶ Vào sa bàn 3D</a><small>Nên mở trên máy tính; lần đầu tải khoảng 10 MB.</small>'
   :'<small>Sa bàn 3D chỉ mở được khi chạy website qua máy chủ (start_local.command hoặc VPS).</small>');
  body.prepend(box);
 }
 if(typeof window.renderModal==='function'){
  const base=window.renderModal;
  window.renderModal=function(){const r=base.apply(this,arguments);try{inject()}catch(_){}return r};
 }
})();
