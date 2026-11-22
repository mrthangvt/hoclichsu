/* Việt Sử V5.7 — theo yêu cầu chủ dự án (23/11/2026): trang Bộ đề ôn Sử bỏ khung bao,
   dàn hết trang như các trang khác. Trang on-thi/ vẫn giữ nguyên khi mở độc lập;
   chỉ khi nhúng trong Việt Sử mới ẩn thanh đầu trang và phần giới thiệu trùng lặp,
   nền trong suốt, và khung tự cao theo nội dung (không còn thanh cuộn riêng). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const EMBED_CSS=`
html.vs-embed,html.vs-embed body{background:transparent!important;overflow:hidden}
html.vs-embed .header,html.vs-embed .intro{display:none!important}
html.vs-embed main{max-width:none!important;padding:4px 0 24px!important}
html.vs-embed .grade-grid{margin-top:0!important}
html.vs-embed.vs-light{--bg:#f7f0e2;--panel:#fffaf0;--panel2:#f3e8d4;--line:#dccaa6;--gold:#8a5a1c;--text:#2b2116;--muted:#6f5f49;--white:#2b2116;color-scheme:light}
html.vs-embed.vs-light .grade-card:hover,html.vs-embed.vs-light .grade-card.selected{background:#f3e3c3!important}
html.vs-embed.vs-light select,html.vs-embed.vs-light input{background:#fffdf7;color:#2b2116}
html.vs-embed.vs-light .qnav{background:#f3e8d4!important}
html.vs-embed.vs-light .metric,html.vs-embed.vs-light .review-item{background:#f3e8d4!important;border-color:#dccaa6!important}
html.vs-embed.vs-light .feedback{background:#e6f2e8!important;border-color:#9cc7a8!important}
html.vs-embed.vs-light .num.wrong{background:#f6d6d0!important}
html.vs-embed.vs-light .btn.secondary{border-color:#b9a27a!important}
html.vs-embed.vs-light .progress{background:#e4d5b8!important}
html.vs-embed.vs-light .option{border-color:#cdb68c!important}
html.vs-embed.vs-light .option .letter{border-color:#b9a27a!important}
html.vs-embed.vs-light .option.selected{background:#f3e3c3!important}
html.vs-embed.vs-light .option.correct{background:#dff0e4!important;border-color:#3f8f5f!important}
html.vs-embed.vs-light .option.correct .letter{color:#2f7a4c!important;border-color:#3f8f5f!important}
html.vs-embed.vs-light .option.wrong{background:#f8dfda!important;border-color:#c0574a!important}
html.vs-embed.vs-light .option.wrong .letter{color:#b0463a!important;border-color:#c0574a!important}
html.vs-embed.vs-light .num{background:#fffaf0!important;border-color:#cdb68c!important;color:#2b2116!important}
html.vs-embed.vs-light .num.answered{background:#e3efe6!important;border-color:#7fb08f!important}
html.vs-embed.vs-light .num.correct{background:#d3ecdc!important;border-color:#3f8f5f!important}
html.vs-embed.vs-light .num.wrong{background:#f6d6d0!important;border-color:#c0574a!important}
html.vs-embed.vs-light .selected{background:#f3e3c3}`;
let ro=null;
function light(){return document.body.classList.contains('theme-light');}
function fit(f){
 const d=f.contentDocument;if(!d||!d.documentElement)return;
 // Đo chiều cao thật của nội dung (scrollHeight không bao giờ nhỏ hơn chiều cao khung hiện tại).
 const b=d.body;if(!b)return;
 const cs=d.defaultView.getComputedStyle(b);
 const h=Math.ceil(b.getBoundingClientRect().height+parseFloat(cs.marginTop||0)+parseFloat(cs.marginBottom||0));
 if(h>0)f.style.height=h+'px';
}
function prepare(f){
 const d=f.contentDocument;if(!d||!d.head)return;
 const root=d.documentElement;
 root.classList.add('vs-embed');root.classList.toggle('vs-light',light());
 // Khung và trang bên trong phải cùng color-scheme, nếu không trình duyệt vẽ nền đặc phía sau.
 f.style.colorScheme=light()?'light':'dark';
 if(!d.getElementById('vs57-embed')){const s=d.createElement('style');s.id='vs57-embed';s.textContent=EMBED_CSS;d.head.appendChild(s);}
 // Cuộn trang ngoài về đầu bài khi bắt đầu, chuyển câu hoặc xem kết quả.
 if(!root.dataset.vs57){
  root.dataset.vs57='1';
  d.addEventListener('click',e=>{if(e.target.closest('#startButton,#finishButton,#exitButton,#retryButton,#reviewButton,#newButton')){setTimeout(()=>{fit(f);f.scrollIntoView({behavior:'smooth',block:'start'});},60);}});
 }
 if(ro)ro.disconnect();
 if('ResizeObserver' in window){ro=new ResizeObserver(()=>fit(f));ro.observe(d.documentElement);if(d.body)ro.observe(d.body);}
 fit(f);setTimeout(()=>fit(f),300);
}
function hook(){
 const f=$('vs52ExamFrame');if(!f||f.dataset.vs57)return!!f;
 f.dataset.vs57='1';f.setAttribute('scrolling','no');
 f.addEventListener('load',()=>prepare(f));
 if(f.contentDocument&&f.contentDocument.readyState==='complete'&&f.getAttribute('src'))prepare(f);
 const p=document.querySelector('.vs52-exam-head p');
 if(p)p.textContent='Ôn kiến thức theo từng lớp, từng chủ đề hoặc thi thử với đồng hồ đếm ngược. Chọn đáp án A/B/C/D, xem lời giải và kết quả theo thang 10.';
 return true;
}
function init(){
 if(!hook()){const mo=new MutationObserver(()=>{if(hook())mo.disconnect();});mo.observe(document.body,{childList:true,subtree:true});}
 // Đổi giao diện sáng/tối thì đổi luôn trong khung.
 new MutationObserver(()=>{const f=$('vs52ExamFrame');const d=f&&f.contentDocument;if(d&&d.documentElement){d.documentElement.classList.toggle('vs-light',light());f.style.colorScheme=light()?'light':'dark';}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',()=>{const f=$('vs52ExamFrame');if(f)fit(f);});
 document.documentElement.dataset.vietsuRelease='5.7';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
