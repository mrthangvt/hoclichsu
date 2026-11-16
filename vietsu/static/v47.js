/* VIỆT SỬ V4.7 — Hồ sơ triều đại mở rộng, giữ nguyên Popup/Timeline cũ. */
(function(){
'use strict';
const KEYS = [
 ['overview','Tổng quan','compass'],['foundation','Hình thành','landmark'],
 ['politics','Chính trị','scroll'],['economy','Kinh tế','wheat'],
 ['military','Quân sự','shield'],['culture','Văn hóa – Giáo dục','book'],
 ['religion','Tín ngưỡng','flower'],['costume','Trang phục','shirt'],
 ['figures','Nhân vật','users'],['heritage','Di tích','map'],
 ['events','Diễn biến','calendar'],['transition','Chuyển giao','arrow'],
 ['sources','Nguồn tư liệu','library'] ];
const ALIASES={'hongbang':'vanlang','thuc':'aulac','le-so':'leso','le-trung-hung':'letrung',
 'hau-tran':'hautran','minhthuoc':'bacthuoc','minh-thuoc':'bacthuoc','khuc-duong':'khuc',
 'tien-ly':'vanxuan','trieu-viet-vuong':'vanxuan','hau-ly':'vanxuan'};
const $ = id => document.getElementById(id);
const clean = value => String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALL = Object.create(null);
let currentPart = 'overview', readAll = false;
const v47Data = Array.isArray(window.V47_DYNASTIES) ? window.V47_DYNASTIES : [];
function ingest(rows){
 if(!Array.isArray(rows))return;
 for(const item of rows){if(!item||!(/^[a-z0-9_-]+$/.test(item.id||'')))continue;
  const previous=ALL[item.id]||{};
  ALL[item.id]={...previous,...item,sections:{...(previous.sections||{}),...(item.sections||{})}};
 }
}
ingest(v47Data);
function current(){const id=typeof active==='string'?active:'';return ALL[ALIASES[id]||id]||null}
function relatedPeople(p){
 const entity = (typeof details !== 'undefined' && details[p.id]) || null;
 const people = entity?.people || [];
 const valid = people.filter(x=>Array.isArray(x)&&typeof x[3]==='string'&&/^[\w-]+$/.test(x[3]));
 if(!valid.length)return '';
 return '<div class="v47-relations">'+valid.map(x=>'<button type="button" data-v47-open="'+clean(x[3])+'" class="v47-pill">'+clean(x[0])+' <span aria-hidden="true">↗</span></button>').join('')+'</div>';
}
function relatedEvents(p){
 const entity = (typeof details !== 'undefined' && details[p.id]) || null;
 const events = entity?.events || [];
 const valid = events.filter(x=>Array.isArray(x)&&typeof x[1]==='string'&&/^[\w-]+$/.test(x[1]));
 if(!valid.length)return '';
 return '<div class="v47-relations">'+valid.map(x=>'<button type="button" data-v47-open="'+clean(x[1])+'" class="v47-pill">'+clean(x[0])+' <span aria-hidden="true">↗</span></button>').join('')+'</div>';
}
function trustedSources(p){return (p.references||[]).filter(x=>x&&typeof x.title==='string'&&typeof x.url==='string'&&/^https:\/\/[a-z0-9.-]+\//i.test(x.url)).slice(0,15)}
function sourceCards(p){
 const sources=trustedSources(p);
 return sources.length?'<div class="v47-source-list">'+sources.map((r,i)=>'<a href="'+clean(r.url)+'" target="_blank" rel="noopener noreferrer nofollow"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+clean(r.title)+'</span><span aria-hidden="true">↗</span></a>').join('')+'</div>':'<p class="v47-empty">Chưa bổ sung đường dẫn tư liệu đối chiếu cho thời kỳ này.</p>';
}
function section(p,k){
 let value=p.sections?.[k]; if(typeof value==='string')value={text:value,reviewed:false};
 if(!value||typeof value!=='object')value={text:'',reviewed:false};
 const detail=String(value.text||'').trim();const reviewed=value.reviewed===true;
 const title=KEYS.find(x=>x[0]===k)?.[1]||k;
 let body='';
 if(k==='figures')body=relatedPeople(p);
 if(k==='events')body=relatedEvents(p);
 if(k==='sources')body=sourceCards(p);
 if(k==='heritage'){
  const location={'aulac':'co-loa','vanlang':'co-loa','tayson':'rach-gam'}[p.id];
  if(location)body+='<div class="v47-actions"><button type="button" data-v47-open="scene:'+location+'" class="v47-pill">Mở hồ sơ địa điểm trên bản đồ ↗</button></div>';
 }
 if(k==='costume')body+='<div class="v47-actions"><button type="button" class="v47-pill" data-v47-go-tab="overview">Mở thư viện Trang phục & Mũ tóc ↗</button></div>';
 const note=detail?'<p class="v47-prose">'+clean(detail).replace(/\n+/g,'</p><p class="v47-prose">')+'</p>':'<p class="v47-empty">Đang bổ sung tư liệu cho chuyên mục này. Anh có thể biên tập nội dung trong CMS.</p>';
 const badge=k==='sources'?'Nguồn đối chiếu':reviewed?'Đã thẩm định':'Bản biên tập';
 return '<section class="v47-chapter" id="v47-ch-'+clean(k)+'" data-key="'+clean(k)+'"><div class="v47-chapter-heading"><span class="v47-ordinal">'+String(KEYS.findIndex(x=>x[0]===k)+1).padStart(2,'0')+'</span><h3>'+clean(title)+'</h3><span class="v47-review">'+badge+'</span></div>'+(k==='sources'?'':note)+body+'</section>';
}
function view(p){
 const count=KEYS.filter(x=>String((p.sections?.[x[0]]||{}).text||'').trim()).length;
 const total=KEYS.length;
 return '<div class="v47-wrap"><header class="v47-lead">'+
 '<div class="v47-eyebrow">BÁCH KHOA LỊCH SỬ TRỰC QUAN · V4.7</div><h2>'+clean(p.name)+'</h2>'+
 '<p class="v47-date">'+(Number.isFinite(p.start)?(p.start<0?Math.abs(p.start)+' TCN':p.start):'')+' – '+(Number.isFinite(p.end)?(p.end<0?Math.abs(p.end)+' TCN':p.end):'')+'</p>'+
 '<p class="v47-note">Hồ sơ đang biên tập: nội dung có thể thay đổi khi đối chiếu thêm sử liệu. Không đồng nhất niên đại truyền thống với niên đại khảo cổ.</p>'+
 '<div class="v47-lead-actions"><button type="button" id="v47ReadMode" aria-pressed="'+readAll+'">'+(readAll?'Xem theo chuyên mục':'Đọc toàn bộ hồ sơ')+'</button><span>'+count+'/'+total+' chủ đề có nội dung · '+trustedSources(p).length+' nguồn dẫn</span></div></header>'+
 '<div class="v47-layout"><nav class="v47-chapter-nav" aria-label="Mục lục hồ sơ triều đại">'+KEYS.map(([k,title],i)=>'<button type="button" data-v47-section="'+k+'" aria-current="'+(readAll||currentPart===k?'true':'false')+'"><small>'+String(i+1).padStart(2,'0')+'</small>'+clean(title)+'</button>').join('')+'</nav>'+
 '<div class="v47-content">'+(readAll?KEYS.map(x=>section(p,x[0])).join(''):section(p,currentPart))+
 '<footer class="v47-footer"><p>Thư viện hồ sơ tiếp tục được bổ sung. Ảnh trang phục là tranh minh họa, không thay thế tư liệu gốc.</p><button class="v47-pill" type="button" data-v47-go-tab="people">Xem danh sách nhân vật ↗</button><button class="v47-pill" type="button" data-v47-go-tab="story">Xem sự kiện ↗</button></footer></div></div></div>';
}
function patch(){
 if(typeof modalType!=='function'||modalType()!=='dynasty')return;
 const period=current();if(!period)return;
 const tabbar=$('tabs');if(!tabbar)return;
 const prev=tabbar.querySelector('[data-v47-tab]');if(prev)prev.remove();
 const button=document.createElement('button');button.className='tab'+(tab==='v47'?' sel':'');button.dataset.v47Tab='true';
 button.type='button';button.textContent='Hồ sơ chuyên sâu';button.addEventListener('click',()=>{currentPart='overview';readAll=false;changeTab('v47')});
 tabbar.insertBefore(button,tabbar.children[1]||null);
 if(tab==='v47'){
  const body=$('modalbody');if(body){body.innerHTML=view(period);body.dataset.v47Dynasty=period.id}
 }
}
function onClick(event){
 const body=$('modalbody');if(!body||!body.contains(event.target))return;
 const sect=event.target.closest('[data-v47-section]');
 if(sect){currentPart=sect.dataset.v47Section;if(!readAll){patch();$('modalbody')?.scrollIntoView({block:'nearest'});}else{const target=$('v47-ch-'+currentPart);if(target)target.scrollIntoView({behavior:'smooth',block:'nearest'})}return}
 const target=event.target.closest('[data-v47-open]');
 if(target){const id=target.dataset.v47Open;if(id&&typeof openItem==='function')openItem(id);return}
 const other=event.target.closest('[data-v47-go-tab]');
 if(other){if(typeof changeTab==='function')changeTab(other.dataset.v47GoTab);return}
 if(event.target.closest('#v47ReadMode')){readAll=!readAll;patch();return}
}
async function updateFromCMS(){
 try{
  const response=await fetch('/api/v4.7/dynasties',{credentials:'same-origin',cache:'no-store'});
  if(!response.ok)return;
  const payload=await response.json();
  if(Array.isArray(payload.periods)){ingest(payload.periods);if(typeof modalType==='function'&&modalType()==='dynasty'&&tab==='v47')patch()}
 }catch(_){/* Offline/GitHub Pages dùng dữ liệu seed đóng gói. */}
}
function boot(){
 if(typeof renderModal==='function'){
  const old=renderModal;
  renderModal=function(){const result=old.apply(this,arguments);patch();return result};
 }
 document.addEventListener('click',onClick);
 window.V47Dynasty={getPeriod:id=>ALL[ALIASES[id]||id],ids:()=>Object.keys(ALL),sections:KEYS.map(x=>x[0])};
 updateFromCMS();document.documentElement.dataset.vietsuVersion='4.7';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();