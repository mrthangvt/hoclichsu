/* Việt Sử V4.11 — chỉ chèn MỘT mục điều hướng trên "Sách giáo khoa". Giao diện V4.6 giữ nguyên. */
(function(){
'use strict';
const MARK='data-vs-exam-linked';
const examHref=()=>{
  const rel=location.protocol==='file:'?'on-thi/index.html':'on-thi/';
  return new URL(rel,document.baseURI).href;
};
function isLabel(t){return /^sách\s+giáo\s+khoa(?:\s+lịch\s+sử)?$/i.test(String(t||'').replace(/\s+/g,' ').trim());}
function findTargets(){
  const all=new Set();
  const anchors=[...document.querySelectorAll('nav a, nav button, aside a, aside button, [id^="nav"], [onclick], [role="button"]')];
  anchors.forEach(node=>{
    const s=(node.textContent||'').replace(/\s+/g,' ').trim();
    if(s.length<85 && isLabel(s)) all.add(node);
  });
  if(!all.size){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode())){
      if(!isLabel(n.nodeValue))continue;
      const el=n.parentElement;
      const target=el?.closest('a,button,[role="button"],[onclick],.nav-item,[class*="nav-item"],[id^="nav"]');
      if(target && (target.textContent||'').trim().length<85)all.add(target);
    }
  }
  return [...all].filter(node=>!node.closest('[data-vs-exam-new]') && !node.getAttribute(MARK));
}
function insert(){
  let count=0;
  for(const target of findTargets()){
    if(!target.parentElement)continue;
    // Tránh lặp lại khi menu SGK xuất hiện ở cả desktop và mobile.
    if(target.previousElementSibling?.hasAttribute('data-vs-exam-new')){target.setAttribute(MARK,'1');continue;}
    const item=target.cloneNode(true);
    item.removeAttribute('id');item.setAttribute('data-vs-exam-new','1');
    item.classList.remove('active','selected','current','on');
    for(const el of [item,...item.querySelectorAll('*')]){
      if(el!==item)el.removeAttribute('id');
      el.removeAttribute('onclick');
      el.removeAttribute('onkeydown');
      el.removeAttribute('data-tab');
      el.removeAttribute('data-page');
      if(el.tagName==='A')el.href=examHref();
    }
    // Giữ nguyên icon, kích thước, khoảng cách, font và hiệu ứng hover của nút SGK.
    const icon=item.querySelector('.nav-icon');
    if(icon){icon.textContent='▤';icon.classList.remove('v30-hcm-mask');icon.style.removeProperty('--v30-hcm-mask');}
    const walker=document.createTreeWalker(item,NodeFilter.SHOW_TEXT);
    let found=false,node;
    while((node=walker.nextNode())){
      if(isLabel(node.nodeValue)){node.nodeValue='Bộ đề ôn Sử';found=true;break;}
    }
    if(!found){
      const parts=[...item.querySelectorAll('span,b,strong,small')];
      const lbl=parts.find(p=>isLabel(p.textContent));
      if(lbl){lbl.textContent='Bộ đề ôn Sử';found=true;}
    }
    if(!found){item.textContent='Bộ đề ôn Sử';}
    item.setAttribute('aria-label','Bộ đề ôn Sử lớp 10, 11, 12');
    if(item.tagName==='BUTTON')item.type='button';
    if(item.tagName!=='A'&&item.tagName!=='BUTTON'){
      item.setAttribute('role','button');item.setAttribute('tabindex','0');
      item.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();location.assign(examHref());}
      },true);
    }
    item.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();location.assign(examHref());},true);
    target.parentNode.insertBefore(item,target);
    target.setAttribute(MARK,'1');count++;
  }
  return count;
}
function init(){
  insert();
  let scheduled=false;
  const obs=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;insert();});
  });
  obs.observe(document.body,{subtree:true,childList:true});
  setTimeout(()=>obs.disconnect(),10000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
