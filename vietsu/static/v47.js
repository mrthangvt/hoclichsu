/* Việt Sử V4.7 — hồ sơ 19 giai đoạn, 13 chuyên mục, chỉ mở rộng Popup triều đại. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const ALIAS={hongbang:'xichquy',thuc:'aulac','le-so':'leso','le-trung-hung':'letrung',nguyen:'nguyenvn',quangtrung:'tayson'};
let catalog=null;let focus='overview';
function current(){if(typeof modalType!=='function'||modalType()!=='dynasty'||typeof active!=='string')return null;return ALIAS[active]||active;}
function sourceData(){try{const el=$('v47-data');if(el)return JSON.parse(el.textContent)}catch(e){console.warn('V4.7 data inline',e)}return null;}
function element(tag,className,content){const n=document.createElement(tag);if(className)n.className=className;if(content!==undefined)n.textContent=content;return n;}
function record(){return catalog?.periods?.find(p=>p.id===current())||null;}
function validHref(value){return typeof value==='string'&&/^khong-gian\/[a-z0-9/-]+\/$/.test(value);}
function section(p){const c=catalog.categories.find(x=>x.id===focus)||catalog.categories[0];const area=$('v47-area');if(!area||!c)return;area.replaceChildren();area.append(element('h3','',c.title));const v=p.sections?.[c.id]||'Đang biên tập';const para=element('p',v==='Đang biên tập'?'v47-pending':'',v);area.append(para);
 const related=element('div','v47-related');function b(name,handler){const btn=element('button','v47-link',name);btn.type='button';btn.addEventListener('click',handler);related.append(btn);}
 if(c.id==='people' || c.id==='overview'){for(const person of p.links?.people||[]){if(typeof persons!=='undefined'&&persons[person.id])b('Nhân vật · '+person.name,()=>{if(typeof openItem==='function')openItem(person.id)})}}
 if(c.id==='heritage'||c.id==='overview'){for(const scene of p.links?.scenes||[]){if(!validHref(scene.href))continue;const a=element('a','v47-link','◈ Sa bàn 3D · '+scene.name);a.href=scene.href;a.target='_blank';a.rel='noopener noreferrer';related.append(a);} if(p.links?.costumes?.length){b('Xem minh họa trang phục',()=>{const target=document.getElementById('v35-dynasty-costumes');if(target)target.scrollIntoView({behavior:'smooth',block:'center'});else if(typeof changeTab==='function')changeTab('overview')})}}
 if(related.childNodes.length)area.append(related);
}
function make(){const id=current(),p=record(),body=$('modalbody');if(!p||!body||typeof tab!=='undefined'&&tab!=='overview')return;
 const stale=body.querySelector('.v47-profile');if(stale&&stale.dataset.period===id)return;if(stale)stale.remove();
 const panel=element('section','v47-profile');panel.dataset.period=id;panel.setAttribute('aria-label','Hồ sơ '+p.name);
 const head=element('div','v47-topline');const h=element('div');h.append(element('span','v47-kicker','HỒ SƠ THỜI ĐẠI · VIỆT SỬ 4.7'),element('h2','',p.name));head.append(h,element('span','v47-legend',p.reviewed?'Có bản thảo mở rộng · tiếp tục thẩm định':'Đang biên tập tư liệu'));panel.append(head);
 const nav=element('div','v47-menu');nav.setAttribute('role','tablist');nav.setAttribute('aria-label','13 chuyên mục lịch sử');
 for(const item of catalog.categories){const btn=element('button','',item.title);btn.type='button';btn.dataset.section=item.id;btn.setAttribute('role','tab');btn.setAttribute('aria-selected',String(item.id===focus));btn.addEventListener('click',()=>{focus=item.id;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.section===focus)));section(p)});nav.append(btn)}panel.append(nav);
 const area=element('div','v47-area');area.id='v47-area';area.setAttribute('aria-live','polite');panel.append(area);
 const sources=element('details','v47-sources');const sum=element('summary','','Nguồn tư liệu & mức độ xác minh');sources.append(sum);
 const ul=element('ul');if(p.sources?.length){for(const src of p.sources){const li=element('li','',src.title||'Nguồn chưa biên tập');if(/^https:\/\//.test(src.url||'')){const a=element('a','',' · liên kết');a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a)}ul.append(li)}}else ul.append(element('li','','Đang biên tập nguồn dẫn; chưa coi là hồ sơ được thẩm định.'));sources.append(ul);panel.append(sources);
 panel.append(element('p','v47-advice','Ghi chú biên tập: tư liệu có thể còn tranh luận; niên đại chồng lấn hoặc ước lệ được ghi riêng. Các tab Nhân vật, Sự kiện, Văn hóa, Trắc nghiệm của trang gốc vẫn giữ nguyên.'));
 body.prepend(panel);section(p);
}
function redraw(){const p=record();if(!p)return;const panel=$('modalbody')?.querySelector('.v47-profile');if(panel)panel.remove();make();}
async function refresh(){if(location.protocol==='file:'||!catalog)return;try{const r=await fetch('/api/v4.7/period-profiles',{cache:'no-store',credentials:'same-origin'});if(!r.ok)return;const json=await r.json();if(!json||!Array.isArray(json.periods)||!Array.isArray(json.categories))return;catalog=json;redraw();}catch(_){/* Trang tĩnh: dùng dữ liệu nhúng */}}
function boot(){catalog=sourceData();if(!catalog)return;const old=typeof renderModal==='function'?renderModal:null;if(old){renderModal=function(){const result=old.apply(this,arguments);make();return result;}}make();refresh();document.documentElement.dataset.vietsuVersion='4.7';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();