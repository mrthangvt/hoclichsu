/* Học Lịch Sử V5.2 — mở rộng giao diện chuẩn V4.11, không thay icon/tài nguyên gốc. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const NOTICE='Sa bàn tương tác tái dựng mô phỏng, chưa phải tư liệu hiện trường chính thống';
let exam;
function openExam(){
 if(!exam)return;
 for(const id of ['mainHistory','hcmHistory','schoolHistory','spacesHistory','charactersHistory']){const e=$(id);if(e)e.hidden=true;}
 exam.hidden=false;
 const iframe=$('vs52ExamFrame');if(iframe&&!iframe.getAttribute('src'))iframe.src=new URL('on-thi/index.html',document.baseURI).href;
 document.querySelectorAll('.nav,.mobile-sections button').forEach(el=>{const yes=el.hasAttribute('data-vs-exam-new');el.classList.toggle('active',yes);if(yes)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
 const crumb=document.querySelector('.crumb');if(crumb)crumb.textContent='HỌC LỊCH SỬ / Bộ đề ôn Sử';
 window.scrollTo({top:0,behavior:'smooth'});
}
function prepareExam(){
 const host=$('schoolHistory');if(!host||$('vs52ExamView'))return;
 exam=document.createElement('section');exam.id='vs52ExamView';exam.hidden=true;
 exam.innerHTML='<div class="vs52-exam-head"><div class="eyebrow">HỌC TẬP · ÔN LUYỆN</div><h1>BỘ ĐỀ ÔN SỬ</h1><p>Lựa chọn lớp 10, 11 hoặc 12 và làm bài ngay trong không gian Học Lịch Sử.</p></div><div class="vs52-exam-shell"><iframe id="vs52ExamFrame" title="Bộ đề ôn Sử lớp 10, 11, 12" loading="lazy"></iframe></div>';
 host.insertAdjacentElement('afterend',exam);
 document.addEventListener('click',e=>{if(!e.target.closest('[data-vs-exam-new]'))return;e.preventDefault();e.stopImmediatePropagation();openExam();},true);
 document.addEventListener('keydown',e=>{if(!e.target.closest('[data-vs-exam-new]')||!['Enter',' '].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();openExam();},true);
 for(const name of ['showSection','showSchool','showSpaces','showCharacters']){
  const original=window[name];if(typeof original==='function')window[name]=function(){exam.hidden=true;return original.apply(this,arguments);};
 }
}
function fixIcon(){
 const icon=$('navHCM')?.querySelector('.nav-icon');
 if(!icon)return;
 icon.classList.remove('v30-hcm-mask');icon.style.removeProperty('--v30-hcm-mask');
}
function addCampaign(){
 if(typeof V23_SCENES==='undefined'||typeof V2_EXPERIENCES==='undefined')return;
 if(!V23_SCENES.some(x=>x.id==='dien-bien-phu'))V23_SCENES.push({id:'dien-bien-phu',kind:'battle',lat:21.386,lon:103.016,name:'Chiến dịch Điện Biên Phủ',year:1954,category:'Chiến dịch – 1954',x:201,y:160});
 if(!V2_EXPERIENCES.some(x=>x.id==='dien-bien-phu'))V2_EXPERIENCES.push({id:'dien-bien-phu',title:'Chiến dịch Điện Biên Phủ 1954',period:'13/3–7/5/1954',kind:'Chiến sự lịch sử',year:1954,description:'Hồ sơ mô phỏng địa hình Điện Biên, hệ thống cứ điểm và ba đợt tiến công; sa bàn 3D chi tiết chưa hoàn thiện.',hotspots:[['Đợt 1 · 13–17/3/1954','Tiến công Him Lam, Độc Lập; Bản Kéo đầu hàng.'],['Đợt 2 · 30/3–30/4/1954','Chiến sự trên các ngọn đồi phía đông, siết chặt vòng vây.'],['Đợt 3 · 1–7/5/1954','Tổng công kích, kết thúc chiến dịch ngày 7/5/1954.']]});
 if(typeof window.v23RenderMap==='function')window.v23RenderMap();
}
function islands(){
 const svg=$('v23AtlasSVG');if(!svg||$('vs52ArchipelagoLabels'))return;
 const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.id='vs52ArchipelagoLabels';g.setAttribute('aria-label','Sơ đồ minh họa quần đảo Hoàng Sa, Trường Sa và đảo Phú Quốc');
 for(const item of [{name:'HOÀNG SA',x:605,y:432},{name:'TRƯỜNG SA',x:650,y:672}]){
  const p=document.createElementNS(ns,'g');p.setAttribute('class','vs52-island');p.setAttribute('transform','translate('+item.x+' '+item.y+')');
  const c=document.createElementNS(ns,'circle');c.setAttribute('r','6');p.append(c);
  const t=document.createElementNS(ns,'text');t.setAttribute('y','-16');t.textContent=item.name;p.append(t);g.append(p);
 }
 // Đảo Phú Quốc (26/11/2026): hình đảo giản lược theo tọa độ thật (cùng tỉ lệ với pin V23_SCENES, tâm 10,23 B · 103,96 Đ ≈ 269,6 · 737,5),
 // dịch ra biển ~30 đơn vị vì đường bờ véc-tơ của bản đồ minh họa vẽ thô và để khỏi đè nhãn Rạch Gầm – Xoài Mút
 {const p=document.createElementNS(ns,'g');p.setAttribute('class','vs52-island vs52-phu-quoc');p.setAttribute('transform','translate(262 770)');
  const sh=document.createElementNS(ns,'path');sh.setAttribute('d','M-6.7 -7.2 L-0.6 -10.3 L3.9 -11.8 L6.1 -9.8 L4.4 -3.6 L5.5 1.5 L3.3 6.7 L2.8 10.8 L1.7 12.8 L0.6 9.2 L-0.6 4.1 L0.0 0.5 L-4.4 -3.6 Z');p.append(sh);
  const t=document.createElementNS(ns,'text');t.setAttribute('x','-10');t.setAttribute('y','5');t.textContent='ĐẢO PHÚ QUỐC';p.append(t);g.append(p);}
 ($('v23MapPins')?.parentNode||svg).append(g);
 const note=document.querySelector('.v23-map-foot');if(note)note.textContent='Bản đồ véc-tơ minh họa; ký hiệu quần đảo không thể hiện đầy đủ tọa độ, ranh giới địa lý.';
}
function disclaimer(){if(typeof window.modalType==='function'&&window.modalType()==='scene'){const e=$('moddesc');if(e)e.textContent=NOTICE;}}
function init(){
 prepareExam();fixIcon();addCampaign();islands();
 if(typeof window.renderModal==='function'){const old=window.renderModal;window.renderModal=function(){const r=old.apply(this,arguments);disclaimer();return r;};}
 disclaimer();const nav=$('navHCM');if(nav)new MutationObserver(fixIcon).observe(nav,{childList:true,subtree:true});
 document.documentElement.dataset.vietsuRelease='5.2';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();