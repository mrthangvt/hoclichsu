/* Việt Sử V5.6 — theo yêu cầu chủ dự án (23/11/2026):
   1) Sơ đồ triều đại có đủ các đời vua (trước đây nhánh Hoàng đế của nhà Trần chỉ có 3 vua).
   2) Hồ sơ cho các vua và tướng lĩnh, danh nhân; hiện trong tab Nhân vật.
   3) Sự kiện văn hóa theo triều đại (tab Văn hóa – xã hội).
   4) Trò chơi trắc nghiệm theo từng triều đại (tab Trắc nghiệm).
   Dữ liệu: static/v56-data.js (VS56_DATA) và danh sách vua của V5.5 (VS55_DYN). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DATA=window.VS56_DATA||{kings:{},people:[],link:{},culture:{},dvskSections:{}};
const DYN=window.VS55_DYN||[];
const BY=Object.create(null);           // mã triều (kể cả mã phụ) -> triều
const KINGS=Object.create(null);        // mã triều chính -> [{id,label,years,note}]
DYN.forEach(d=>{BY[d.id]=d;(d.alias||[]).forEach(a=>BY[a]=d);});
const hasPersons=()=>typeof persons!=='undefined';
const hasDetails=()=>typeof details!=='undefined';
const label=k=>k[0]===k[1]?k[0]:k[0]+' – '+k[1];
const short=d=>d.name.replace(/^Nhà /,'');
const SRC_DEFAULT=d=>{const s=DATA.dvskSections[d.id];return s?`Đại Việt sử ký toàn thư, tr. PDF ${s[0]}–${s[1]}; Việt Nam sử lược`:(['tayson','nguyenvn'].includes(d.id)?'Việt Nam sử lược – Trần Trọng Kim':'Đại Việt sử ký toàn thư; Việt Nam sử lược');};

/* ---------- 1. Hồ sơ vua và nhân vật ---------- */
function buildProfiles(){
 if(!hasPersons())return;
 DYN.forEach(d=>{
  const seen=Object.create(null);
  KINGS[d.id]=d.kings.map((k,i)=>{
   let key=k[1];if(seen[key])key=key+' ';seen[k[1]]=1;   // hai vua cùng tên húy (Lê Duy Kỳ)
   const info=DATA.kings[key]||{};
   const id=info.id||('vs56-'+d.id+'-'+i);
   const aside=k[3]&&/^(Tiếm|Sử cũ không xếp)/.test(k[3]);
   if(!persons[id]){
    const bio=info.bio||k[3]||'Hồ sơ ngắn đang được bổ sung.';
    persons[id]={name:label(k),period:k[2],role:(d.legend?'Nhân vật truyền thuyết · ':'')+(aside?'':'Vua thứ '+(i+1-d.kings.slice(0,i).filter(x=>x[3]&&/^(Tiếm|Sử cũ không xếp)/.test(x[3])).length)+' · ')+d.name,
     desc:bio,bioParagraphs:[bio,'Trị vì: '+k[2]+'.'+(k[3]&&k[3]!==bio?' '+k[3]+'.':''),'Nguồn: '+SRC_DEFAULT(d)+'.'],
     sourceBook:SRC_DEFAULT(d),classification:d.legend?'truyền thuyết':'sử liệu',country:'vn',ties:[],stories:[],battles:[],vs56:true};
   }
   return {id,k,aside};
  });
  // Liên kết vua trước – vua sau trong cùng triều
  KINGS[d.id].forEach((x,i,a)=>{const p=persons[x.id];if(!p||!p.vs56)return;
   if(a[i-1])p.ties.push(['Vua trước: '+label(a[i-1].k),a[i-1].id]);
   if(a[i+1])p.ties.push(['Vua sau: '+label(a[i+1].k),a[i+1].id]);});
 });
 (DATA.people||[]).forEach(x=>{
  if(persons[x.id])return;
  const d=BY[x.dyn];
  persons[x.id]={name:x.name,period:x.period,role:x.role,desc:x.bio,bioParagraphs:[x.bio,'Nguồn: '+x.src+'.'],sourceBook:x.src,classification:'sử liệu',country:'vn',
   ties:d&&KINGS[d.id]&&KINGS[d.id][0]?[[label(KINGS[d.id][0].k)+' (vua đầu triều)',KINGS[d.id][0].id]]:[],stories:[],battles:[],vs56:true};
 });
}
function dynKeys(d){return [d.id,...(d.alias||[])].filter(k=>hasDetails()&&details[k]);}
function linkPeople(){
 if(!hasDetails()||!hasPersons())return;
 const extra=Object.create(null);
 (DATA.people||[]).forEach(x=>{(extra[x.dyn]=extra[x.dyn]||[]).push([persons[x.id].name.split(' (')[0],x.role,x.icon,x.id]);});
 Object.entries(DATA.link||{}).forEach(([dyn,ids])=>ids.forEach(id=>{const p=persons[id];if(p)(extra[dyn]=extra[dyn]||[]).push([p.name.split(' – ')[0],p.role||'',/tướng/i.test(p.role||'')?'sword':'hat',id]);}));
 DYN.forEach(d=>{
  const add=extra[d.id]||[];if(!add.length)return;
  dynKeys(d).forEach(key=>{
   const list=details[key].people=details[key].people||[];
   const ids=new Set(list.map(x=>x[3])),names=new Set(list.map(x=>x[0]));
   add.forEach(x=>{if(!ids.has(x[3])&&!names.has(x[0])){list.push(x);ids.add(x[3]);names.add(x[0]);}});
  });
 });
}

/* ---------- Các khối hiển thị ---------- */
function kingButtons(d){
 return (KINGS[d.id]||[]).map((x,i)=>`<button type="button" onclick="openItem('${esc(x.id)}')"${x.aside?' class="vs56-aside"':''}>${typeof iconHtml==='function'?iconHtml('hat','',''):''}<span>${esc(label(x.k))} · ${esc(x.k[2])} ↗</span></button>`).join('');
}
function fixGraph(d,body){
 const branches=body.querySelector('.graph-branches');if(!branches||branches.querySelector('.vs56-kings'))return;
 const n=(KINGS[d.id]||[]).filter(x=>!x.aside).length;
 let b=[...branches.querySelectorAll('.branch')].find(x=>/Hoàng đế/i.test(x.querySelector('strong')?.textContent||''));
 if(!b){b=document.createElement('div');b.className='branch';branches.prepend(b);}
 b.classList.add('vs56-kings');
 b.innerHTML=`<strong>${d.legend?'Các đời (truyền thuyết)':'Hoàng đế · '+n+' vua'}</strong>${kingButtons(d)}`;
}
function peopleBlock(d){
 const ks=KINGS[d.id]||[];if(!ks.length)return '';
 const cards=ks.map((x,i)=>`<button type="button" class="vs56-kcard${x.aside?' vs56-aside':''}" onclick="openItem('${esc(x.id)}')"><span class="vs56-kn">${i+1}</span><span><b>${esc(x.k[0])}</b><small>${esc(x.k[0]===x.k[1]?'':x.k[1]+' · ')}${esc(x.k[2])}</small></span></button>`).join('');
 return `<section class="vs56 vs56-people"><span class="vs56-tag">CÁC ĐỜI VUA · ${esc(d.name.toUpperCase())}</span><p class="vs56-lead">Chạm vào từng vua để mở hồ sơ ngắn (năm trị vì, việc chính, vua trước – vua sau).</p><div class="vs56-kgrid">${cards}</div><p class="vs56-src">Tướng lĩnh và danh nhân của triều này ở mục bên dưới. Hồ sơ là bản tóm lược có nguồn.</p></section>`;
}
function cultureBlock(d){
 const ev=DATA.culture[d.id]||[];if(!ev.length)return '';
 return `<section class="vs56 vs56-culture"><span class="vs56-tag">SỰ KIỆN VĂN HÓA · ${esc(d.name.toUpperCase())}</span><div class="vs56-tl">${ev.map(e=>`<div class="vs56-ev"><span class="vs56-y">${esc(e[0])}</span><div><b>${esc(e[1])}</b><p>${esc(e[2])}</p></div></div>`).join('')}</div><p class="vs56-src">Nguồn: Đại Việt sử ký toàn thư; Việt Nam sử lược; mục ghi "khảo cổ" cần đối chiếu chuyên khảo.</p></section>`;
}

/* ---------- 4. Trắc nghiệm theo triều ---------- */
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pickOthers(pool,correct,n){return shuffle([...new Set(pool.filter(x=>x&&x!==correct))]).slice(0,n);}
function makeQ(q,correct,wrong,why){if(wrong.length<2)return null;const a=shuffle([correct,...wrong.slice(0,3)]);return {q,a,c:a.indexOf(correct),why};}
function buildQuestions(d){
 const out=[],ks=(KINGS[d.id]||[]).filter(x=>!x.aside),others=DYN.filter(x=>x!==d&&!x.legend&&x.id!=='khuc-duong');
 const isYear=y=>/^\d{2,4}(–\d{2,4})?( TCN)?$/.test(y)&&(/TCN/.test(y)===false);
 const goodNote=n=>n&&n.length>=14&&!/^(Sau đó|Cùng em|Truyền thuyết|Ở ngôi)/.test(n);
 const firstOf=x=>(KINGS[x.id]||[]).find(y=>!y.aside);
 if(typeof d.count==='number'){
  const c=d.count;const w=pickOthers([c-2,c-1,c+1,c+2,c+3].filter(x=>x>0).map(String),String(c),3);
  out.push(makeQ(`Theo sử cũ, ${d.name} có bao nhiêu đời vua?`,String(c),w,`${d.name} có ${c} đời vua (${d.span}).`));
 }
 if(ks.length&&!d.legend){
  out.push(makeQ(`Ai là vị vua đầu tiên của ${d.name}?`,label(ks[0].k),pickOthers(others.map(x=>firstOf(x)&&label(firstOf(x).k)),label(ks[0].k),3),`${label(ks[0].k)} lên ngôi năm ${ks[0].k[2].split('–')[0]}.`));
  if(ks.length>2)out.push(makeQ(`Vị vua cuối cùng của ${d.name} là ai?`,label(ks[ks.length-1].k),pickOthers(ks.slice(0,-1).map(x=>label(x.k)),label(ks[ks.length-1].k),3),`${label(ks[ks.length-1].k)} trị vì ${ks[ks.length-1].k[2]}.`));
  shuffle(ks.filter(x=>goodNote(x.k[3]))).slice(0,2).forEach(x=>{
   const pool=ks.length>3?ks.map(y=>label(y.k)):others.map(o=>firstOf(o)&&label(firstOf(o).k));
   out.push(makeQ(`Vị vua nào gắn với điều sau: "${x.k[3]}"?`,label(x.k),pickOthers(pool,label(x.k),3),`${label(x.k)} (${x.k[2]}).`));});
  shuffle(ks).slice(0,2).forEach(x=>{
   const pool=ks.length>3?ks.map(y=>y.k[2]):DYN.flatMap(o=>(KINGS[o.id]||[]).map(y=>y.k[2])).filter(isYear);
   out.push(makeQ(`${label(x.k)} trị vì trong khoảng thời gian nào?`,x.k[2],pickOthers(pool,x.k[2],3),`${label(x.k)}: ${x.k[2]}.`));});
 }
 const ev=DATA.culture[d.id]||[];
 const allEv=Object.entries(DATA.culture).flatMap(([k,v])=>k===d.id?[]:v);
 shuffle(ev).slice(0,3).forEach(e=>{
  if(/^\d{3,4}(–\d{3,4})?$/.test(e[0]))out.push(makeQ(`"${e[1]}" thời ${short(d)} diễn ra vào năm nào?`,e[0],pickOthers(allEv.map(x=>x[0]).filter(y=>/^\d{3,4}(–\d{3,4})?$/.test(y)),e[0],3),e[2]));
  else out.push(makeQ(`Sự kiện văn hóa nào thuộc thời ${short(d)}?`,e[1],pickOthers(allEv.map(x=>x[1]),e[1],3),e[2]));
 });
 const ppl=(DATA.people||[]).filter(x=>x.dyn===d.id),allP=(DATA.people||[]).filter(x=>x.dyn!==d.id);
 shuffle(ppl).slice(0,2).forEach(x=>{const n=x.name.split(' (')[0];out.push(makeQ(`Nhân vật nào thời ${short(d)} được mô tả: "${x.bio.split('. ')[0].replace(/\.$/,'')}"?`,n,pickOthers(allP.map(y=>y.name.split(' (')[0]),n,3),x.bio));});
 return shuffle(out.filter(Boolean)).slice(0,8);
}
const GAME={};
function best(id,v){try{const k='vs56-best-'+id;if(v!=null){if(v>(+localStorage.getItem(k)||0))localStorage.setItem(k,v);}return +localStorage.getItem(k)||0;}catch(_){return 0;}}
function gameHtml(d){
 const g=GAME[d.id];const q=g.qs[g.i];
 if(!q)return `<div class="vs56-end"><b>Hoàn thành!</b><p>Bạn trả lời đúng <strong>${g.score}/${g.qs.length}</strong> câu về ${esc(d.name)}.</p><p class="vs56-src">Điểm cao nhất trên máy này: ${best(d.id,g.score)}/${g.qs.length}</p><button type="button" class="primary" data-vs56-q="again">Chơi lại với câu hỏi khác</button></div>`;
 return `<div class="vs56-qhead"><span>Câu ${g.i+1}/${g.qs.length}</span><span>Điểm: ${g.score}</span></div><div class="vs56-bar"><i style="width:${Math.round(g.i/g.qs.length*100)}%"></i></div><h3 class="vs56-qq">${esc(q.q)}</h3><div class="vs56-choices">${q.a.map((a,j)=>`<button type="button" class="vs56-choice${g.picked!=null?(j===q.c?' ok':j===g.picked?' bad':''):''}" data-vs56-q="${j}"${g.picked!=null?' disabled':''}>${'ABCD'[j]}. ${esc(a)}</button>`).join('')}</div>${g.picked!=null?`<div class="vs56-fb ${g.picked===q.c?'ok':'bad'}">${g.picked===q.c?'✓ Chính xác! ':'Chưa đúng. Đáp án: '+'ABCD'[q.c]+'. '}${esc(q.why)}</div><button type="button" class="primary" data-vs56-q="next">${g.i+1<g.qs.length?'Câu tiếp theo':'Xem kết quả'}</button>`:''}`;
}
function quizBlock(d){
 if(!GAME[d.id])GAME[d.id]={qs:buildQuestions(d),i:0,score:0,picked:null};
 if(!GAME[d.id].qs.length)return '';
 return `<section class="vs56 vs56-quiz" data-vs56-dyn="${esc(d.id)}"><span class="vs56-tag">TRÒ CHƠI TRẮC NGHIỆM · ${esc(d.name.toUpperCase())}</span><p class="vs56-lead">Câu hỏi lấy từ danh sách các đời vua, nhân vật và sự kiện văn hóa của chính triều này; mỗi lần chơi lại sẽ đổi câu hỏi.</p><div class="vs56-game">${gameHtml(d)}</div></section>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-vs56-q]');if(!b)return;
 const box=b.closest('.vs56-quiz');const d=BY[box?.dataset.vs56Dyn];if(!d)return;
 const g=GAME[d.id],v=b.dataset.vs56Q;
 if(v==='next'){g.i++;g.picked=null;}
 else if(v==='again'){GAME[d.id]={qs:buildQuestions(d),i:0,score:0,picked:null};}
 else if(g.picked==null){g.picked=+v;if(g.picked===g.qs[g.i].c)g.score++;if(g.i+1>=g.qs.length)best(d.id,g.score);}
 box.querySelector('.vs56-game').innerHTML=gameHtml(d);
});

/* ---------- Gắn vào popup ---------- */
function afterFirst(body,html){if(!html)return;const first=body.querySelector(':scope > .v21-crosswalk')||null;if(first)first.insertAdjacentHTML('afterend',html);else body.insertAdjacentHTML('afterbegin',html);}
function inject(){
 if(typeof window.modalType!=='function'||window.modalType()!=='dynasty')return;
 const d=BY[typeof active==='string'?active:''];if(!d)return;
 const body=$('modalbody');if(!body)return;
 const t=typeof tab==='string'?tab:'';
 if(t==='mindmap')fixGraph(d,body);
 if(t==='people'&&!body.querySelector('.vs56-people'))afterFirst(body,peopleBlock(d));
 if(t==='culture'&&!body.querySelector('.vs56-culture'))afterFirst(body,cultureBlock(d));
 if(t==='quiz'&&!body.querySelector('.vs56-quiz')){
  // Thay khung "sẽ được bổ sung sau"; riêng nhà Trần giữ bộ 9 câu cũ ở dưới.
  const placeholder=[...body.querySelectorAll('.panel')].find(p=>p.querySelector('[onclick^="openQuiz"]'));
  const html=quizBlock(d);
  if(placeholder&&html)placeholder.outerHTML=html;else afterFirst(body,html);
 }
}
function init(){
 buildProfiles();linkPeople();
 if(typeof window.renderModal==='function'){const old=window.renderModal;window.renderModal=function(){const r=old.apply(this,arguments);inject();return r;};}
 document.documentElement.dataset.vietsuRelease='5.6';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
