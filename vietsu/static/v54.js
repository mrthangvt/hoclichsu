/* Việt Sử V5.4 — theo yêu cầu chủ dự án (22/11/2026): đổi nhãn "Hair & Hat" thành "Tóc & Mũ".
   Bố cục mobile (thẻ trang phục, thanh menu dưới) nằm trong v54.css. */
(function(){
'use strict';
const LABEL='Tóc & Mũ';
function rename(root){
 (root||document).querySelectorAll('.v41-hair b').forEach(b=>{if(b.textContent!==LABEL)b.textContent=LABEL;});
}
function init(){
 rename();
 const host=document.getElementById('timeline')||document.body;
 let queued=false;
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;rename(host);});}).observe(host,{childList:true,subtree:true});
 document.documentElement.dataset.vietsuRelease='5.4';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
