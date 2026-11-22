/* Việt Sử V5.4 — theo yêu cầu chủ dự án (22/11/2026): đổi nhãn "Hair & Hat" thành "Tóc & Mũ".
   Bố cục mobile (thẻ trang phục, thanh menu dưới) nằm trong v54.css.
   V5.4.2: nút Bộ đề tắt sáng khi chọn mục menu khác. */
(function(){
'use strict';
const LABEL='Tóc & Mũ';
function rename(root){
 (root||document).querySelectorAll('.v41-hair b').forEach(b=>{if(b.textContent!==LABEL)b.textContent=LABEL;});
}
function examOff(e){
 const btn=e.target.closest('.nav,.mobile-sections button');
 if(!btn||btn.hasAttribute('data-vs-exam-new'))return;
 document.querySelectorAll('[data-vs-exam-new]').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current');});
}
function init(){
 rename();
 document.addEventListener('click',examOff,true);
 const host=document.getElementById('timeline')||document.body;
 let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;rename(host);});}).observe(host,{childList:true,subtree:true});
 document.documentElement.dataset.vietsuRelease='5.4.2';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
