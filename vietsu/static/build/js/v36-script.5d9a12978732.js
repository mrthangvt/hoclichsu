
(function(){
 'use strict';
 const CIV="/static/build/media/4b3de6256277.webp";
 const MIL="/static/build/media/2c96c0fc7cb4.webp";
 const EXTRA=[{"id": "vanhanh", "name": "Thiền sư Vạn Hạnh", "period": "Thế kỷ X – đầu XI", "role": "Thiền sư, cố vấn chính trị", "desc": "Được nhắc đến với vai trò quan trọng trong bối cảnh nhà Lý hình thành, gắn với Lý Công Uẩn và Phật giáo thời đầu tự chủ.", "year": 1009, "era": "ly", "source_url": "https://tuvigiacngo.com/lich-su-viet-nam/nhan-vat", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "lephunghieu", "name": "Lê Phụng Hiểu", "period": "Thế kỷ XI · Nhà Lý", "role": "Danh tướng triều Lý", "desc": "Công thần thời Lý, gắn với việc bảo vệ triều đình và góp phần ổn định bộ máy đầu thời Lý.", "year": 1009, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "military", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "duongtuminh", "name": "Dương Tự Minh", "period": "Thế kỷ XII · Nhà Lý", "role": "Tướng lĩnh và thủ lĩnh vùng biên", "desc": "Nhân vật có ảnh hưởng tại vùng biên phía Bắc dưới thời Lý, được nhắc trong lịch sử địa phương và các câu chuyện bảo vệ biên cương.", "year": 1127, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "military", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "thancanhphuc", "name": "Thân Cảnh Phúc", "period": "Thế kỷ XI · Nhà Lý", "role": "Tướng lĩnh vùng biên", "desc": "Người có vai trò trong kháng chiến chống Tống thời Lý, thường được nhắc ở vùng biên giới phía Bắc.", "year": 1075, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "military", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "ylan", "name": "Ỷ Lan", "period": "Thế kỷ XI · Nhà Lý", "role": "Nguyên phi, Hoàng thái hậu", "desc": "Người phụ nữ có ảnh hưởng trong chính sự nhà Lý, từng tham gia điều hành triều chính trong các giai đoạn nhà vua đi chinh chiến.", "year": 1075, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "lychieuhoang", "name": "Lý Chiêu Hoàng", "period": "1218–1278 · Lý – Trần", "role": "Hoàng đế cuối triều Lý", "desc": "Việc Lý Chiêu Hoàng nhường ngôi cho Trần Cảnh năm 1225 là mốc chuyển giao từ triều Lý sang triều Trần.", "year": 1225, "era": "tran", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "levanthinh", "name": "Lê Văn Thịnh", "period": "Thế kỷ XI · Nhà Lý", "role": "Quan văn, đại thần", "desc": "Nhân vật nổi bật trong khoa cử và quan trường nhà Lý, liên hệ với sự phát triển của nền giáo dục và tổ chức chính quyền.", "year": 1075, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "nguyenbinhkhiem", "name": "Nguyễn Bỉnh Khiêm", "period": "1491–1585", "role": "Nhà giáo, nhà thơ, học giả", "desc": "Học giả thế kỷ XVI, được nhớ đến qua hoạt động dạy học, thơ văn và vai trò trong đời sống tư tưởng thời Mạc.", "year": 1527, "era": "mac", "source_url": "https://tuvigiacngo.com/lich-su-viet-nam/nhan-vat", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "phungkhackhoan", "name": "Phùng Khắc Khoan", "period": "1528–1613", "role": "Nhà ngoại giao, học giả", "desc": "Nhân vật giai đoạn Lê Trung hưng, có đóng góp trên lĩnh vực ngoại giao, văn chương và đời sống tri thức.", "year": 1600, "era": "letrung", "source_url": "https://tuvigiacngo.com/lich-su-viet-nam/nhan-vat", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "lequydon", "name": "Lê Quý Đôn", "period": "1726–1784", "role": "Nhà bác học, quan văn", "desc": "Học giả lớn thế kỷ XVIII, để lại các công trình nghiên cứu về lịch sử, văn hóa, địa lý và kinh tế.", "year": 1771, "era": "letrung", "source_url": "https://tuvigiacngo.com/lich-su-viet-nam/nhan-vat", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "lehuutrac", "name": "Lê Hữu Trác", "period": "1724–1791", "role": "Danh y, tác giả y học", "desc": "Hải Thượng Lãn Ông nổi bật với việc hệ thống hóa tri thức y học cổ truyền, để lại di sản sách thuốc có ảnh hưởng lâu dài.", "year": 1771, "era": "letrung", "source_url": "https://baotanglichsuquocgia.vn/vi/Articles/3098/nhan-vat-lich-su", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "phanboichau", "name": "Phan Bội Châu", "period": "1867–1940", "role": "Chí sĩ yêu nước", "desc": "Một trong những nhân vật tiêu biểu của phong trào yêu nước đầu thế kỷ XX, gắn với các hoạt động tìm đường cứu nước thời thuộc địa.", "year": 1900, "era": "nguyen", "source_url": "https://tuvigiacngo.com/lich-su-viet-nam/nhan-vat", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "huynhthuckhang", "name": "Huỳnh Thúc Kháng", "period": "1876–1947", "role": "Chí sĩ yêu nước, nhà báo", "desc": "Tham gia phong trào Duy Tân; sau Cách mạng Tháng Tám tiếp tục giữ vai trò trong đời sống chính trị và báo chí.", "year": 1945, "era": "vndcch", "source_url": "https://baotanglichsuquocgia.vn/vi/Articles/3098/nhan-vat-lich-su/Page1", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "phamvandong", "name": "Phạm Văn Đồng", "period": "1906–2000", "role": "Nhà cách mạng, lãnh đạo chính phủ", "desc": "Tham gia hoạt động cách mạng, sau năm 1945 đảm nhiệm nhiều công việc trong bộ máy lãnh đạo và ngoại giao Việt Nam.", "year": 1945, "era": "vndcch", "source_url": "https://baotanglichsuquocgia.vn/vi/Articles/3098/nhan-vat-lich-su", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "vonguyengiap", "name": "Võ Nguyên Giáp", "period": "1911–2013", "role": "Đại tướng, chỉ huy quân sự", "desc": "Nhà chỉ huy quân sự có vai trò trọng yếu trong các cuộc kháng chiến của Việt Nam ở thế kỷ XX, gắn với chiến dịch Điện Biên Phủ.", "year": 1954, "era": "vndcch", "source_url": "https://baotanglichsuquocgia.vn/vi/Articles/3098/nhan-vat-lich-su/Page1", "kind": "military", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "hoangvanthai", "name": "Hoàng Văn Thái", "period": "1915–1986", "role": "Đại tướng, Tổng Tham mưu trưởng", "desc": "Một trong những sĩ quan cao cấp thời kỳ đầu của Quân đội nhân dân Việt Nam, tham gia nhiều công việc tham mưu và chiến dịch.", "year": 1954, "era": "vndcch", "source_url": "https://baotanglichsuquocgia.vn/vi/Articles/3098/nhan-vat-lich-su", "kind": "military", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}, {"id": "lynhantong", "name": "Lý Nhân Tông", "period": "1066–1127 · Nhà Lý", "role": "Hoàng đế nhà Lý", "desc": "Thời kỳ trị vì dài và nhiều đổi mới về văn hóa – giáo dục, diễn ra cuộc kháng chiến chống Tống ở thế kỷ XI.", "year": 1075, "era": "ly", "source_url": "https://tracuulicham.com/lich-su-viet-nam/nha-ly/", "kind": "civil", "country": "vn", "status": "draft", "data_origin": "Nguồn đối chiếu khác (không phải donglichsu.com)"}];
 const CN_IDS=new Set(['hotatliet','bao','baochung','qinthuyhoang','sohan','tamquoc','thoduong','genghis','hongwu','thanhdrama','lybach','dophu']);
 const WORLD_IDS=new Set(['picasso','napoleon','shakespeare','leonardo']);
 const IS_SVG_PLACEHOLDER=/^data:image\/svg/i;
 const militaryWords=/(đại tướng|danh tướng|tướng lĩnh|tư lệnh|tiết chế|quốc công|chỉ huy quân sự|binh sĩ|vệ binh|đô đốc|nghĩa quân|võ tướng|quân đội|thủy quân|nguyên soái|khởi nghĩa|chiến trận)/i;
 const militaryIds=new Set(['hungdao','lythuongkiet','ngoquyen','phamtuu','tranquangkhai','trannhatduat','tranquangdieu','buithixuan','nguyenphuong','duongdinhnghe','nguyenbac','phamculuong','trungtrac','trungnhi','batrieu','caolo','phunghung','maithucloan','quangtrung','vonguyengiap','hotatliet','genghis','hoangvanthai']);
 function chooseMilitary(id,p){return militaryIds.has(id)||p.kind==='military'||p.avatar_type==='military'||militaryWords.test(String(p.role||''));}
 const femaleIds=new Set(['auco','mychau','trungtrac','trungnhi','batrieu','buithixuan','ylan','lychieuhoang']);
 function neutralIcon(p){const initials=String(p?.name||'?').trim().charAt(0)||'?';const s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="61" fill="#59472e" stroke="#d5b782" stroke-width="5"/><text x="64" y="82" text-anchor="middle" font-family="serif" font-size="58" font-weight="bold" fill="#f3deb7">${initials}</text></svg>`;return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s);}
 function isFemale(id,p){return femaleIds.has(id)||/(nữ|hoàng hậu|hoàng thái hậu|công chúa|nguyên phi|quý phi|nữ vương|vương phi)/i.test(String(p.role||''));}
 function fallback(id,p){return isFemale(id,p)?neutralIcon(p):chooseMilitary(id,p)?MIL:CIV;}
 function hasRealPhoto(src){return typeof src==='string'&&src.length>0&&!IS_SVG_PLACEHOLDER.test(src);}
 function portrait(id,p){let s=p?.image_url||p?.avatar||'';return hasRealPhoto(s)?s:fallback(id,p||{});}
 function esc(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
 // Preserve hand-edited portraits and all existing encyclopedic records.
 for(const p of EXTRA){
    if(!persons[p.id]){
      persons[p.id]={name:p.name,period:p.period,role:p.role,desc:p.desc,stories:[p.desc],ties:[[p.era,p.era]],battles:[],kind:p.kind,country:p.country,source_url:p.source_url,status:'draft'};
    }
 }
 // Photo fallback only for absent/placeholder images; do not override submitted CMS photos.
 for(const [id,p] of Object.entries(persons)){
    const current=p.image_url||p.avatar||'';
    if(!hasRealPhoto(current))p.avatar=fallback(id,p);
 }
 const getRows=()=>Object.entries(persons).filter(([id,p])=>p&&p.name);
 const makeCard=([id,p])=>`<button class="v25-char-card" onclick="openItem('${id}')" title="Hồ sơ ${esc(p.name)}"><span class="v25-char-avatar"><img class="v36-fallback-img" src="${esc(portrait(id,p))}" alt="Hình minh họa ${esc(p.name)}" loading="lazy" onerror="this.src=window.V36_FALLBACK_CIV"></span><span class="v25-char-info"><b>${esc(p.name)}</b><small>${esc(p.period||'Đang cập nhật')}</small><em>${esc(p.role||'Nhân vật lịch sử')}</em></span></button>`;
 window.V36_FALLBACK_CIV=CIV;
 window.v25RenderCharacters=function(){
    const grid=document.getElementById('v25CharacterGrid');if(!grid)return;
    const q=(document.getElementById('v25CharacterSearch')?.value||'').toLocaleLowerCase('vi');
    const rows=getRows().filter(([id,p])=>[p.name,p.period||'',p.role||''].join(' ').toLocaleLowerCase('vi').includes(q)).sort((a,b)=>a[1].name.localeCompare(b[1].name,'vi'));
    const cn=[],vn=[],world=[];
    for(const x of rows){const [id,p]=x; if(p.country==='cn'||CN_IDS.has(id))cn.push(x);else if(p.country==='world'||WORLD_IDS.has(id))world.push(x);else vn.push(x);}
    const col=(title,a)=>`<section class="v30-character-column"><h2 class="v30-character-title">${title} <small>${a.length} hồ sơ</small></h2><div class="v30-character-list">${a.map(makeCard).join('')||'<p class="v30-empty">Chưa có nhân vật phù hợp</p>'}</div></section>`;
    grid.innerHTML=`<div class="v30-character-layout">${col('🇻🇳 Việt Nam',vn)}${col('🇨🇳 Trung Quốc',cn)}</div>`+(world.length?`<section class="v30-character-other"><h2 class="v30-character-title">🌍 Nhân vật khác</h2><div class="v30-character-list">${world.map(makeCard).join('')}</div></section>`:'');
    const counter=document.getElementById('v25CharacterCount');if(counter)counter.textContent=rows.length+' nhân vật';
 };
 // Extend the same-era links with selected, independently sourced profiles.
 for(const p of EXTRA){
   if([1009,1075,1127,1225,1527,1771,1945,1954].includes(p.year)){
     if(!famousPeople[p.year]) famousPeople[p.year]={};
     if(!famousPeople[p.year].vn)famousPeople[p.year].vn=[];
     if(!famousPeople[p.year].vn.some(x=>x[1]===p.id))famousPeople[p.year].vn.push([p.name,p.id,p.role]);
   }
 }
 // Image defaults apply to character thumbnails, mindmaps, and diagrams.
 const previousPersonCard=personCard;
 personCard=function(x){const id=x[3],p=persons[id]||{name:x[0],role:x[1]};return `<button class="person" onclick="openItem('${id}')"><span class="avatar"><img class="v36-fallback-img" src="${esc(portrait(id,p))}" alt="Minh họa" loading="lazy"></span><b>${esc(x[0])}</b><small>${esc(x[1])}</small></button>`;};
 const previousMemory=memoryChips;
 memoryChips=function(row,geo){let rows=(famousPeople[row.y]||{})[geo]||[];if(!rows.length)return '';return `<div class="memory-people"><span class="memory-label">Gợi nhớ văn hóa · cùng thời</span>${rows.map(p=>`<button class="memory-person" onclick="openItem('${p[1]}')" title="${esc(p[2])}"><span class="memory-avatar"><img class="v36-fallback-img" src="${esc(portrait(p[1],persons[p[1]]||{name:p[0],role:p[2]}))}" alt=""></span><span class="memory-name">${esc(p[0])}</span></button>`).join('')}</div>`;};
 const oldGraph=graph;
 graph=function(root,branches){return `<div class="graph-wrap"><div class="graph"><div class="graph-root">${esc(root)}</div><div class="graph-lines"></div><div class="graph-branches">${branches.map(b=>`<div class="branch"><strong>${esc(b[0])}</strong>${b[1].map(x=>`<button onclick="openItem('${x[1]}')"><img class="v36-inline-photo" src="${esc(portrait(x[1],persons[x[1]]||{name:x[0],role:b[0]}))}" alt=""><span>${esc(x[0])} ↗</span></button>`).join('')}</div>`).join('')}</div></div></div>`;};
 function decorateModal(){
    const body=document.getElementById('modalbody');if(!body)return;
    body.querySelectorAll('.portrait-grid .person, .graph-branches .branch button').forEach(el=>{
       let id=(el.getAttribute('onclick')||'').match(/openItem\('([^']+)'\)/)?.[1];if(!id)return;
       const p=persons[id]||{name:id};
       const existing=el.querySelector('img.v34-small-photo, img.v33-avatar, img:not(.v36-inline-photo):not(.v36-fallback-img)');
       if(existing && existing.getAttribute('src') && !/svg\+xml/.test(existing.getAttribute('src')))return;
       const img=el.querySelector('img.v36-inline-photo,img.v36-fallback-img');
       if(img)img.src=portrait(id,p);
       else{const container=el.querySelector('.avatar')||el;const newImg=document.createElement('img');newImg.className=container===el?'v36-inline-photo':'v36-fallback-img';newImg.alt='Hình minh họa';newImg.src=portrait(id,p);container.prepend(newImg);}
    });
    if(typeof active==='string' && persons[active] && !body.querySelector('.v34-person-image,.v36-profile-preview')){
       const p=persons[active];const pic=document.createElement('img');pic.className='v36-profile-preview';pic.src=portrait(active,p);pic.alt='Hình minh họa '+p.name;body.prepend(pic);
    }
 }
 const oldRender=renderModal;
 renderModal=function(){const result=oldRender.apply(this,arguments);decorateModal();return result;};
 // Request published/editable media paths from CMS only when deployed online.
 function loadOnlineMedia(){
    if(!/^https?:$/.test(location.protocol))return;
    fetch('/api/v2.5/characters',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(rows=>{
       if(!Array.isArray(rows))return;
       for(const item of rows){const p=persons[item.entity_id];if(!p)continue;
         if(item.image_url){p.image_url=item.image_url;p.avatar=item.image_url;}
       }
       v25RenderCharacters();
    }).catch(()=>{});
 }
 function init(){
    v25RenderCharacters();loadOnlineMedia();
    const desc=document.querySelector('#charactersHistory .v25-char-note');
    if(desc)desc.textContent='Ảnh mặc định minh họa quan văn hoặc quan võ; không phải chân dung lịch sử. Có thể thay ảnh trong CMS. Các hồ sơ bổ sung V3.6 đang ở trạng thái nháp, đối chiếu từ các nguồn khác; chưa nhập trực tiếp từ Đông Lịch Sử.';
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
