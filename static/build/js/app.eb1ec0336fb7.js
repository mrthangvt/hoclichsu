
'use strict';
/* V2.4 standalone navigation layer: preserves the V2.2 school and timeline workflows. */
const V23_SCENES=[{"id": "co-loa", "kind": "heritage", "lat": 21.112, "lon": 105.872, "name": "Thành Cổ Loa", "year": -208, "category": "Di tích – thành cổ", "x": 375.67, "y": 179.01}, {"id": "lang-sen", "kind": "heritage", "lat": 18.681, "lon": 105.516, "name": "Làng Sen – Kim Liên", "year": 1890, "category": "Di tích – tuổi thơ", "x": 355.92, "y": 303.78}, {"id": "quang-tri", "kind": "battle", "lat": 16.756, "lon": 107.191, "name": "Thành cổ Quảng Trị", "year": 1972, "category": "Chiến sự – di tích", "x": 448.84, "y": 402.58}, {"id": "rach-gam", "kind": "battle", "lat": 10.422, "lon": 106.234, "name": "Rạch Gầm – Xoài Mút", "year": 1785, "category": "Chiến trận – sa bàn", "x": 395.75, "y": 727.65}];
const v23OriginalShowSection=showSection;
const v23OriginalShowSchool=showSchool;
let v23CurrentSection='main';
function v23MarkNav(section){
 v23CurrentSection=section;
 const names={main:'Main',hcm:'HCM',characters:'Characters',spaces:'Spaces',school:'School'};
 for(const [key,suffix] of Object.entries(names)){
  const a=document.getElementById('nav'+suffix),b=document.getElementById('mobile'+suffix);
  [a,b].forEach(el=>{if(el){el.classList.toggle('active',key===section);if(key===section)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');}});
 }
}
function v23HideSpaces(){const p=document.getElementById('spacesHistory');if(p)p.hidden=true;}
showSection=function(section){
 if(section==='spaces'){showSpaces();return;}
 v23HideSpaces();const res=v23OriginalShowSection(section);v23MarkNav(section);return res;
};
showSchool=function(grade){v23HideSpaces();const res=v23OriginalShowSchool(grade);v23MarkNav('school');return res;};
function showSpaces(){
 document.getElementById('spacesHistory').hidden=false;
 document.getElementById('mainHistory').hidden=true;
 document.getElementById('hcmHistory').hidden=true;
 document.getElementById('schoolHistory').hidden=true;
 v23MarkNav('spaces');
 document.querySelector('.crumb').innerHTML='VIỆT SỬ <b>/</b> Không gian lịch sử';
 v23RenderMap();window.scrollTo({top:0,behavior:'smooth'});
}
const v23Map={x:0,y:0,w:760,h:970};
const v23Svg=document.getElementById('v23AtlasSVG');
function v23ApplyMap(){if(v23Svg)v23Svg.setAttribute('viewBox',`${v23Map.x.toFixed(1)} ${v23Map.y.toFixed(1)} ${v23Map.w.toFixed(1)} ${v23Map.h.toFixed(1)}`)}
function v23Zoom(factor){
 const newW=Math.max(110,Math.min(1250,v23Map.w/factor));const newH=newW*970/760;
 const cx=v23Map.x+v23Map.w/2,cy=v23Map.y+v23Map.h/2;
 v23Map.x=cx-newW/2;v23Map.y=cy-newH/2;v23Map.w=newW;v23Map.h=newH;v23ApplyMap();
}
function v23ResetMap(){Object.assign(v23Map,{x:0,y:0,w:760,h:970});v23ApplyMap()}
function v23FlyTo(p){v23Map.w=340;v23Map.h=340*970/760;v23Map.x=p.x-v23Map.w/2;v23Map.y=p.y-v23Map.h/2;v23ApplyMap()}
function v23RenderMap(){
 const filter=document.getElementById('v23SceneFilter')?.value||'all';
 const visible=V23_SCENES.filter(x=>filter==='all'||x.kind===filter);
 const pinContainer=document.getElementById('v23MapPins'),cards=document.getElementById('v23SpaceCards');if(!pinContainer||!cards)return;
 pinContainer.innerHTML=visible.map(p=>`<g class="v23-map-pin" data-kind="${p.kind}" tabindex="0" role="button" aria-label="Mở ${p.name}" onclick="openItem('scene:${p.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openItem('scene:${p.id}')}" transform="translate(${p.x} ${p.y})"><rect x="-25" y="-38" width="250" height="84" rx="12" fill="transparent" pointer-events="all"/><circle class="pin-ring" r="24"/><circle class="pin-core" r="12"/><text x="24" y="-11">${p.name}</text></g>`).join('');
 cards.innerHTML=visible.map(p=>`<button class="v23-space-card" onclick="v23FlyTo(V23_SCENES.find(x=>x.id==='${p.id}'));openItem('scene:${p.id}')"><small>${p.category} · ${p.year<0?Math.abs(p.year)+' TCN':p.year}</small><strong>${p.name}</strong><span>${(V2_EXPERIENCES.find(x=>x.id===p.id)?.description||'Địa điểm có thuyết minh mẫu và tư liệu liên quan.')}</span></button>`).join('');
 document.getElementById('v23MapCount').textContent=visible.length+' điểm';
}
// Offline map gesture pan and wheel zoom. Uses viewBox so it works in a local HTML file.
(function(){
 const el=document.getElementById('v23MapViewport');if(!el)return;
 let drag=null;
 el.addEventListener('pointerdown',e=>{if(e.target.closest('.v23-map-pin'))return;drag={x:e.clientX,y:e.clientY,startX:v23Map.x,startY:v23Map.y};el.classList.add('dragging');try{el.setPointerCapture(e.pointerId)}catch(_){}});
 el.addEventListener('pointermove',e=>{if(!drag)return;const r=el.getBoundingClientRect();const aspect=760/970;const viewWidth=Math.min(r.width,r.height*aspect);const viewHeight=viewWidth/aspect;v23Map.x=drag.startX-(e.clientX-drag.x)*v23Map.w/viewWidth;v23Map.y=drag.startY-(e.clientY-drag.y)*v23Map.h/viewHeight;v23ApplyMap()});
 for(const name of ['pointerup','pointercancel'])el.addEventListener(name,()=>{drag=null;el.classList.remove('dragging')});
 el.addEventListener('wheel',e=>{e.preventDefault();v23Zoom(e.deltaY<0?1.15:1/1.15)},{passive:false});
})();
function v23SetBrand(config){
 for(const [id,key] of [['siteBrandName','name'],['siteBrandSlogan','slogan'],['siteBrandHan','han']]){const el=document.getElementById(id);if(el&&config[key])el.textContent=config[key];}
 if(config.name)document.title=config.name+' – Dòng thời gian lịch sử';
}
// Configuration is editable via the backend CMS; the offline copy uses embedded defaults.
(async function(){if(!['http:','https:'].includes(location.protocol))return;try{const response=await fetch('/api/site-config',{cache:'no-store'});if(response.ok)v23SetBrand(await response.json())}catch(_){}})();
v23RenderMap();v23MarkNav('main');
(async function(){if(!['http:','https:'].includes(location.protocol))return;try{const res=await fetch('/api/v2.3/locations',{cache:'no-store'});if(!res.ok)return;const rows=await res.json();if(!Array.isArray(rows))return;for(const row of rows){const p=V23_SCENES.find(x=>x.id===row.id);if(!p)continue;for(const key of ['name','lat','lon','year','kind','category']){if(row[key]!==undefined)p[key]=row[key]};p.x=Number(((p.lon-99.1)/(112.8-99.1)*760).toFixed(2));p.y=Number(((24.6-p.lat)/(24.6-5.7)*970).toFixed(2))}v23RenderMap()}catch(e){/* Offline/self-contained map remains available. */}})();
/* VIET SU V2.4 — menu metadata, glossary, permalink, theme and Atlas tiles */
const V24_MENU_DEFAULT={
 main:{title:'KHÁM PHÁ DÒNG LỊCH SỬ',description:'Khám phá các thời kỳ Việt Nam, Trung Quốc và phương Tây trên cùng một trục thời gian; nhấn vào nhân vật để mở câu chuyện và bài học.'},
 hcm:{title:'CHỦ TỊCH HỒ CHÍ MINH',description:'Dòng thời gian cuộc đời Chủ tịch Hồ Chí Minh và các thời kỳ cùng tồn tại.'},
 spaces:{title:'KHÔNG GIAN LỊCH SỬ',description:'Mỗi điểm pin đại diện cho một địa danh, di tích hoặc chiến trường có thể mở thành không gian 3D'},
 school:{title:'SÁCH GIÁO KHOA LỊCH SỬ',description:'Hệ thống bài học từ lớp 6 đến lớp 12, có thể liên kết tới dòng thời gian, nhân vật và sự kiện.'},
 characters:{title:'NHÂN VẬT LỊCH SỬ',description:'Khám phá chân dung, niên đại, câu chuyện và quan hệ giữa các nhân vật qua những thời kỳ lịch sử.'}
};
let v24MenuConfig=V24_MENU_DEFAULT;
function v24UpdateHeader(section){
 const m=v24MenuConfig[section]||V24_MENU_DEFAULT[section];if(!m)return;
 const paths={main:['.hero h1','.hero p'],hcm:['#hcmHistory .hcm-intro h2','#hcmHistory .hcm-intro p'],spaces:['.v23-spaces-header h1','.v23-spaces-header p'],school:['.v21-school-header h1','.v21-school-header p'],characters:['.v25-characters-header h1','.v25-characters-header p']};
 const selectors=paths[section];if(!selectors)return;
 const heading=document.querySelector(selectors[0]),description=document.querySelector(selectors[1]);
 if(heading)heading.textContent=m.title;if(description)description.textContent=m.description;
}
let v24Theme='dark';
function v24ApplyTheme(mode){v24Theme=mode==='light'?'light':'dark';document.body.classList.toggle('theme-light',v24Theme==='light');const b=document.getElementById('v24ThemeToggle');if(b){b.textContent=v24Theme==='light'?'☾ Giao diện tối':'☀ Giao diện sáng';b.setAttribute('aria-pressed',String(v24Theme==='light'));}try{localStorage.setItem('vietsutheme',v24Theme)}catch(_){}}
function v24ToggleTheme(){v24ApplyTheme(v24Theme==='light'?'dark':'light')}
try{v24ApplyTheme(localStorage.getItem('vietsutheme')||'dark')}catch(_){v24ApplyTheme('dark')}
const V24_GLOSSARY=[
 {word:'Trần Hưng Đạo',id:'hungdao',note:'Quốc công Tiết chế thời Trần, gắn với kháng chiến chống Mông – Nguyên.'},
 {word:'Trần Nhân Tông',id:'nhantong',note:'Hoàng đế nhà Trần; cùng triều đình lãnh đạo kháng chiến và gắn với Thiền phái Trúc Lâm.'},
 {word:'Quang Trung',id:'quangtrung',note:'Niên hiệu của Nguyễn Huệ, lãnh đạo Tây Sơn đánh bại quân Thanh năm 1789.'},
 {word:'Nguyễn Huệ',id:'quangtrung',note:'Một trong các thủ lĩnh Tây Sơn, về sau lên ngôi hoàng đế Quang Trung.'},
 {word:'Lý Thường Kiệt',id:'lythuongkiet',note:'Danh tướng thời Lý, gắn với chiến tranh Tống – Đại Việt 1075–1077.'},
 {word:'Ngô Thì Sĩ',id:'ngothisi',note:'Danh sĩ, nhà sử học và tác gia thế kỷ XVIII, nổi tiếng với Việt sử tiêu án.'},
 {word:'Nhà Trần',id:'tran',note:'Triều đại Đại Việt từ 1225 đến 1400, ba lần kháng chiến chống Mông – Nguyên.'},
 {word:'nhà Nguyên',id:'nguyen',note:'Triều đại do Hốt Tất Liệt lập ra tại Trung Quốc năm 1271.'},
 {word:'Tây Sơn',id:'tayson',note:'Phong trào và chính quyền cuối thế kỷ XVIII, gắn với Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ.'},
 {word:'Bạch Đằng',id:'battle1288',note:'Địa danh gắn với nhiều trận thủy chiến; xem diễn biến năm 1288 trong hồ sơ.'}
].sort((a,b)=>b.word.length-a.word.length);
function v24AddGlossary(root){
 if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode()){
   const n=walker.currentNode,el=n.parentElement;
   if(!el||el.closest('a,button,.v24-term,code,script,style,textarea,input,.v24-article-toc,.v24-article-facts'))continue;
   if(!/trần|ngô thì|quang trung|nguyễn huệ|lý thường|tây sơn|bạch đằng|nhà nguyên/i.test(n.nodeValue))continue;
   if(n.nodeValue.trim())nodes.push(n);
 }
 const escaped=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const regex=new RegExp('('+V24_GLOSSARY.map(x=>escaped(x.word)).join('|')+')','gi');
 for(const n of nodes){const raw=n.nodeValue,found=[...raw.matchAll(regex)];if(!found.length)continue;
   let start=0,fragment=document.createDocumentFragment();
   for(const m of found){fragment.append(document.createTextNode(raw.slice(start,m.index)));
    const d=V24_GLOSSARY.find(x=>x.word.toLocaleLowerCase('vi')===m[0].toLocaleLowerCase('vi'));
    if(d){const span=document.createElement('span');span.className='v24-term';span.textContent=m[0];span.tabIndex=0;span.setAttribute('role','link');span.dataset.note=d.note;span.setAttribute('aria-label',m[0]+' — '+d.note);span.onclick=()=>openItem(d.id);span.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openItem(d.id);}};fragment.append(span)}else fragment.append(document.createTextNode(m[0]));start=m.index+m[0].length;
   }fragment.append(document.createTextNode(raw.slice(start)));n.replaceWith(fragment);
 }
}
// Additional carefully scoped in-app profile, distinct from source reproductions.
if(typeof persons!=='undefined' && !persons.ngothisi){
 persons.ngothisi={name:'Ngô Thì Sĩ',period:'1726–1780 · Đại Việt thời Lê Trung hưng',role:'Nhà sử học, nhà thơ và quan lại',desc:'Ngô Thì Sĩ là một học giả nổi bật thế kỷ XVIII, có nhiều trước tác về sử học, văn học và chính trị. Ông hoạt động trong bối cảnh xã hội Đại Việt thời Lê Trung hưng và các chúa Trịnh.',ties:[['Lê Trung hưng','letrung'],['Ngô Thì Nhậm','ngothinham']],stories:['Cuộc đời, khoa cử và hoạt động quan trường','Những trước tác về sử học, trong đó có Việt sử tiêu án','Đóng góp vào văn hóa và tư tưởng thế kỷ XVIII'],battles:[]};
}
const v24RenderBase=renderModal;
renderModal=function(){v24RenderBase();const target=document.getElementById('modalbody');if(!target)return;
 const isPerson=modalType()==='person';
 if(isPerson && tab==='overview'){
  const p=persons[active]||{};
  const intro=document.createElement('div');intro.className='v24-article';
  const para=p.desc||'Hồ sơ đang được tiếp tục biên soạn.';
  intro.innerHTML=`<div class="v24-article-header"><div class="panel"><span class="chip">HỒ SƠ DANH NHÂN</span><h3>${safe(p.name||'Nhân vật lịch sử')}</h3><p>${safe(para)}</p><nav class="v24-article-toc"><a href="#v24-bio" onclick="event.preventDefault();document.getElementById('v24-bio')?.scrollIntoView({behavior:'smooth',block:'center'})">Tiểu sử</a><a href="#v24-related" onclick="event.preventDefault();document.getElementById('v24-related')?.scrollIntoView({behavior:'smooth',block:'center'})">Liên hệ lịch sử</a><a href="#v24-footnote" onclick="event.preventDefault();document.getElementById('v24-footnote')?.scrollIntoView({behavior:'smooth',block:'center'})">Ghi chú</a></nav></div><aside class="v24-article-facts"><dl><dt>Niên đại</dt><dd>${safe(p.period||'Chưa rõ')}</dd><dt>Vai trò</dt><dd>${safe(p.role||'Nhân vật lịch sử')}</dd><dt>Nguồn tư liệu</dt><dd>Bài biên soạn mẫu · chờ thẩm định</dd></dl></aside></div><div class="panel" id="v24-bio"><h3>Tiểu sử và thời đại</h3><p>${safe(para)}</p></div><div class="panel" id="v24-related"><h3>Những nhân vật và sự kiện liên quan</h3><p>Nhấn vào các thuật ngữ được gạch chân để xem chú giải; chọn liên kết để mở hồ sơ liên quan mà không rời dòng thời gian.</p></div><div class="panel v24-source" id="v24-footnote"><h3>Ghi chú biên tập</h3><p>Dữ liệu hồ sơ đang được chuẩn hóa. Những thông tin cần kiểm chứng sẽ được đánh dấu trước khi công bố dưới dạng học liệu chính thức.</p></div>`;
  target.prepend(intro);
 }
 v24AddGlossary(target);
};
// Shareable hash for every profile/lesson. File URLs work locally; online share works after deployment.
let v24FromHash=false;
function v24WriteHash(kind,id){if(v24FromHash)return;try{const base=location.href.split('#')[0];history.replaceState(null,'',base+'#'+kind+'='+encodeURIComponent(id));}catch(_){}}
const v24OpenBase=openItem;
openItem=function(id){v24OpenBase(id);v24WriteHash('ho-so',id)};
const v24CloseBase=closeModal;
closeModal=function(){v24CloseBase();if(!v24FromHash)try{history.replaceState(null,'',location.href.split('#')[0])}catch(_){}};
const v24OpenLessonBase=v22OpenLesson;
v22OpenLesson=function(id){v24OpenLessonBase(id);v24WriteHash('bai-hoc',id)};
function v24CurrentShareLink(){let key=active?'ho-so':null,id=active;if(!key && location.hash.includes('bai-hoc=')){key='bai-hoc';id=decodeURIComponent(location.hash.split('=')[1]||'')}
 return location.href.split('#')[0]+(key?'#'+key+'='+encodeURIComponent(id):'');}
async function v24ShareCurrent(){const link=v24CurrentShareLink();try{await navigator.clipboard.writeText(link);alert('Đã sao chép liên kết. Với bản offline, người nhận cần có cùng file HTML.')}catch(e){const input=document.createElement('textarea');input.value=link;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();alert(ok?'Đã sao chép liên kết. Với bản offline, người nhận cần có cùng file HTML.':'Liên kết chia sẻ: '+link);}}
function v24HandleHash(){const m=decodeURIComponent(location.hash.slice(1));if(!m)return;let kind=null,id='';if(m.startsWith('ho-so=')){kind='ho-so';id=m.slice(6)}if(m.startsWith('bai-hoc=')){kind='bai-hoc';id=m.slice(8)}if(!id)return;
  v24FromHash=true;try{if(kind==='ho-so'&&/^[-\w:]+$/.test(id)){if(id.startsWith('scene:'))showSpaces();openItem(id)}else if(kind==='bai-hoc'){const g=id.match(/^g([6-9]|1[012])-b/);if(g)showSchool(+g[1]);v22OpenLesson(id)}}finally{v24FromHash=false;}
}
window.addEventListener('hashchange',v24HandleHash);
const v24ShowSectionBase=showSection;
showSection=function(section){const res=v24ShowSectionBase(section);v24UpdateHeader(section);return res};
const v24ShowSchoolBase=showSchool;
showSchool=function(grade){const res=v24ShowSchoolBase(grade);v24UpdateHeader('school');return res};
const v24ShowSpacesBase=showSpaces;
showSpaces=function(){const res=v24ShowSpacesBase();v24UpdateHeader('spaces');if(v24Leaflet){setTimeout(()=>v24Leaflet.invalidateSize(),120);}return res};
function v24ApplyMenuConfig(config){if(!config||typeof config!=='object')return;for(const key of Object.keys(V24_MENU_DEFAULT)){const item=config[key];if(!item)continue;v24MenuConfig[key]={title:typeof item.title==='string'&&item.title.trim()?item.title.slice(0,130):V24_MENU_DEFAULT[key].title,description:typeof item.description==='string'?item.description.slice(0,600):V24_MENU_DEFAULT[key].description};}v24UpdateHeader(typeof v23CurrentSection!=='undefined'?v23CurrentSection:'main');}
v24UpdateHeader('main');
// If hosted, site menus are editable in /admin via /api/site-config.
if(location.protocol==='http:'||location.protocol==='https:'){
 fetch('/api/site-config',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(config=>v24ApplyMenuConfig(config.sections)).catch(()=>{});
}
// Atlas integration: Leaflet only loads if requested online. Offline SVG remains fully functional.
let v24Leaflet=null,v24Tiles=null,v24AtlasPins=[];
const V24_TILE_STYLES={
 carto:{url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',attrib:'&copy; OpenStreetMap contributors &copy; CARTO'},
 osm:{url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',attrib:'&copy; OpenStreetMap contributors'},
 esri:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',attrib:'&copy; Esri, Earthstar Geographics'}
};
function v24GetLeaflet(){return new Promise((resolve,reject)=>{
 if(window.L){resolve(window.L);return;}if(!navigator.onLine){reject(Error('Không có Internet.'));return;}
 if(!document.querySelector('#v24LeafletStyle')){const css=document.createElement('link');css.id='v24LeafletStyle';css.rel='stylesheet';css.href='/static/vendor/leaflet/leaflet.css';document.head.append(css)}
 const s=document.createElement('script');s.src='/static/vendor/leaflet/leaflet.js';s.async=true;s.onload=()=>window.L?resolve(window.L):reject(Error('Không tải được Leaflet'));s.onerror=()=>reject(Error('Không tải được thư viện bản đồ'));document.head.append(s);
 });}
async function v24SetMapMode(mode){const vec=document.getElementById('v23AtlasSVG'),canvas=document.getElementById('v24LeafletMap'),sel=document.getElementById('v24MapMode');
 if(mode==='offline'){canvas.hidden=true;vec.hidden=false;return;}
 try{const L=await v24GetLeaflet();if(!v24Leaflet){canvas.hidden=false;vec.hidden=true;v24Leaflet=L.map(canvas,{zoomControl:true,scrollWheelZoom:false}).setView([16.5,106.0],5);}
   if(v24Tiles)v24Leaflet.removeLayer(v24Tiles);const style=V24_TILE_STYLES[mode]||V24_TILE_STYLES.carto;v24Tiles=L.tileLayer(style.url,{attribution:style.attrib,maxZoom:18}).addTo(v24Leaflet);
   canvas.hidden=false;vec.hidden=true;v24AtlasPins.forEach(m=>v24Leaflet.removeLayer(m));v24AtlasPins=[];
   const kind=document.getElementById('v23SceneFilter')?.value||'all';
   for(const p of V23_SCENES){if(kind!=='all'&&p.kind!==kind)continue;const marker=L.marker([p.lat,p.lon]).addTo(v24Leaflet).bindPopup('<b>'+safe(p.name)+'</b><p>Chọn pin để mở hồ sơ không gian lịch sử.</p>');marker.on('click',()=>{openItem('scene:'+p.id)});v24AtlasPins.push(marker);}
   setTimeout(()=>v24Leaflet.invalidateSize(),80);
 }catch(e){if(sel)sel.value='offline';canvas.hidden=true;vec.hidden=false;const note=document.querySelector('.v23-map-foot');if(note)note.textContent='Không tải được bản đồ OpenStreetMap nên đang hiển thị bản đồ véc-tơ offline. Khi có mạng, hãy chọn lại OpenStreetMap.';}
}
const v24RenderMapBase=v23RenderMap;
v23RenderMap=function(){const out=v24RenderMapBase();if(v24Leaflet&&document.getElementById('v24MapMode')?.value!=='offline')v24SetMapMode(document.getElementById('v24MapMode').value);return out};
setTimeout(v24HandleHash,100);


