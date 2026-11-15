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
