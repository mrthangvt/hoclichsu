
(function(){
  const V29_HCM_ICON = "/static/build/media/c62edb179589.png";
  const V29_AVATARS = {"hungdao": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20role%3D%22img%22%20aria-label%3D%22Tr%E1%BA%A7n%20H%C6%B0ng%20%C4%90%E1%BA%A1o%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%233f2b1c%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2320373a%22/%3E%3C/linearGradient%3E%3C/defs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22url%28%23g%29%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2246%22%20fill%3D%22none%22%20stroke%3D%22%23d1a461%22%20stroke-width%3D%222.5%22%20opacity%3D%220.9%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2237%22%20r%3D%2215%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.22%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M28%2078c3-14%2014-23%2022-23s19%209%2022%2023%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.18%22/%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23f7eddc%22%3ETH%C4%90%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2280%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%227%22%20fill%3D%22%23f0d8ae%22%20letter-spacing%3D%22.9%22%3EQU%E1%BB%90C%20C%C3%94NG%3C/text%3E%0A%20%20%20%20%3C/svg%3E", "nhantong": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20role%3D%22img%22%20aria-label%3D%22Tr%E1%BA%A7n%20Nh%C3%A2n%20T%C3%B4ng%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%235a3f2c%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2332473b%22/%3E%3C/linearGradient%3E%3C/defs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22url%28%23g%29%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2246%22%20fill%3D%22none%22%20stroke%3D%22%23d1a461%22%20stroke-width%3D%222.5%22%20opacity%3D%220.9%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2237%22%20r%3D%2215%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.22%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M28%2078c3-14%2014-23%2022-23s19%209%2022%2023%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.18%22/%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23f7eddc%22%3ETNT%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2280%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%227%22%20fill%3D%22%23f0d8ae%22%20letter-spacing%3D%22.9%22%3EPH%E1%BA%ACT%20HO%C3%80NG%3C/text%3E%0A%20%20%20%20%3C/svg%3E", "hotatliet": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20role%3D%22img%22%20aria-label%3D%22H%E1%BB%91t%20T%E1%BA%A5t%20Li%E1%BB%87t%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%2346352f%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2327424a%22/%3E%3C/linearGradient%3E%3C/defs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22url%28%23g%29%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2246%22%20fill%3D%22none%22%20stroke%3D%22%23d1a461%22%20stroke-width%3D%222.5%22%20opacity%3D%220.9%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2237%22%20r%3D%2215%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.22%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M28%2078c3-14%2014-23%2022-23s19%209%2022%2023%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.18%22/%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23f7eddc%22%3EHTL%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2280%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%227%22%20fill%3D%22%23f0d8ae%22%20letter-spacing%3D%22.9%22%3EHO%C3%80NG%20%C4%90%E1%BA%BE%3C/text%3E%0A%20%20%20%20%3C/svg%3E", "quangtrung": "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20role%3D%22img%22%20aria-label%3D%22Quang%20Trung%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%236a3422%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23243a41%22/%3E%3C/linearGradient%3E%3C/defs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22url%28%23g%29%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2246%22%20fill%3D%22none%22%20stroke%3D%22%23d1a461%22%20stroke-width%3D%222.5%22%20opacity%3D%220.9%22/%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2237%22%20r%3D%2215%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.22%22/%3E%0A%20%20%20%20%3Cpath%20d%3D%22M28%2078c3-14%2014-23%2022-23s19%209%2022%2023%22%20fill%3D%22%23f3e7d0%22%20opacity%3D%220.18%22/%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23f7eddc%22%3EQT%3C/text%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%22%20y%3D%2280%22%20text-anchor%3D%22middle%22%20font-family%3D%22Be%20Vietnam%20Pro%2CArial%2Csans-serif%22%20font-size%3D%227%22%20fill%3D%22%23f0d8ae%22%20letter-spacing%3D%22.9%22%3EHO%C3%80NG%20%C4%90%E1%BA%BE%3C/text%3E%0A%20%20%20%20%3C/svg%3E"};
  const V29_MENU_SVGS = {main:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M12 7.4v5.1l3.6 2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",characters:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8.1\" r=\"3.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M5.2 18.6c1.6-3 4-4.5 6.8-4.5s5.2 1.5 6.8 4.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>",spaces:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M9 5.2 15 3l5 1.8v14L15 21l-6-2.2L4 21V7z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M9 5.2v13.6M15 3v18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"/></svg>",school:"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 6.2h10.4a2 2 0 0 1 2 2V18H7a2 2 0 0 0-2 2z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><path d=\"M7 20c0-1 .8-1.8 1.8-1.8H19\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M4 4h10.5a1.8 1.8 0 0 1 1.8 1.8v1.1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M4 8.8h10.5a1.8 1.8 0 0 1 1.8 1.8v1\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"/></svg>"};
  const V29_HCM_STAGES = [
    {label:'Thơ ấu', bg:'#f0e2cb'},
    {label:'Thanh niên', bg:'#ead4b6'},
    {label:'Nguyễn Ái Quốc', bg:'#e5d1b8'},
    {label:'Pác Bó', bg:'#d9cab2'},
    {label:'Kháng chiến', bg:'#d3c4aa'},
    {label:'Lãnh tụ', bg:'#d9c7a4'},
    {label:'Di sản', bg:'#eee0c9'}
  ];
  // V3.7: Seven illustrated age-stage portraits, embedded for offline use.
  const V37_STAGE_IMAGES = ["/static/build/media/09a011562a9c.webp","/static/build/media/49bfd805f934.webp","/static/build/media/7a5a80a49eed.webp","/static/build/media/36cbee6e8cf6.webp","/static/build/media/a1c1b4d510ff.webp","/static/build/media/560c6460b4b6.webp","/static/build/media/21bcb1bef94f.webp"];
  function v29WrapIcon(markup, extra=''){return '<span class="nav-icon '+extra+'" aria-hidden="true">'+markup+'</span>';}
  function v29HcmIcon(){return '<span class="nav-icon hcm v30-hcm-mask" aria-hidden="true" style="--v30-hcm-mask:url('+V29_HCM_ICON+')"></span>';}
  function v29ApplyMenuIcons(){
    const replacements = [
      ['navMain', v29WrapIcon(V29_MENU_SVGS.main), 'Dòng thời gian sử Việt'],
      ['navHCM', v29HcmIcon(), 'Chủ tịch Hồ Chí Minh'],
      ['navCharacters', v29WrapIcon(V29_MENU_SVGS.characters), 'Nhân vật lịch sử'],
      ['navSpaces', v29WrapIcon(V29_MENU_SVGS.spaces), 'Không gian lịch sử'],
      ['navSchool', v29WrapIcon(V29_MENU_SVGS.school), 'Sách giáo khoa Lịch sử <span class="v21-chevron">⌄</span>']
    ];
    for(const [id, icon, label] of replacements){const el=document.getElementById(id); if(el) el.innerHTML=icon+'<span>'+label+'</span>';}
    const mobile = [
      ['mobileMain', v29WrapIcon(V29_MENU_SVGS.main), 'Dòng thời gian'],
      ['mobileHCM', v29HcmIcon(), 'Hồ Chí Minh'],
      ['mobileCharacters', v29WrapIcon(V29_MENU_SVGS.characters), 'Nhân vật'],
      ['mobileSpaces', v29WrapIcon(V29_MENU_SVGS.spaces), 'Không gian'],
      ['mobileSchool', v29WrapIcon(V29_MENU_SVGS.school), 'Sách giáo khoa']
    ];
    for(const [id, icon, label] of mobile){const el=document.getElementById(id); if(el) el.innerHTML=icon+'<span>'+label+'</span>';}
  }

  function v29AvatarMarkup(id, p){
    const src = p && p.avatar ? p.avatar : (V29_AVATARS[id] || '');
    if(src) return '<span class="v25-char-avatar"><img src="'+src+'" alt="'+safe((p&&p.name)||id)+'"></span>';
    const initial = safe((((p&&p.name)||id||'?').trim().charAt(0)||'?'));
    return '<span class="v25-char-avatar">'+initial+'</span>';
  }
  Object.keys(V29_AVATARS).forEach(id=>{ if(typeof persons !== "undefined" && persons[id]) persons[id].avatar = V29_AVATARS[id]; });

  if(typeof window.v25RenderCharacters === 'function'){
    window.v25RenderCharacters = function(){
      const term=(document.getElementById('v25CharacterSearch')?.value||'').toLocaleLowerCase('vi');
      const rows=Object.entries(persons).filter(([id,p])=>p&&p.name&&([p.name,p.period||'',p.role||''].join(' ').toLocaleLowerCase('vi').includes(term))).sort((a,b)=>a[1].name.localeCompare(b[1].name,'vi'));
      const grid=document.getElementById('v25CharacterGrid'),count=document.getElementById('v25CharacterCount'); if(!grid)return;
      if(count)count.textContent=rows.length+' nhân vật';
      grid.innerHTML=rows.map(([id,p])=>`<button class="v25-char-card" onclick="openItem('${id}')" title="Xem hồ sơ ${safe(p.name)}">${v29AvatarMarkup(id,p)}<span class="v25-char-info"><b>${safe(p.name)}</b><small>${safe(p.period||'Đang cập nhật niên đại')}</small><em>${safe(p.role||'Nhân vật lịch sử')}</em></span></button>`).join('')||'<p>Không có nhân vật phù hợp. Thử từ khóa khác.</p>';
    };
  }
  window.personCard = function(x){ const id=x[3], p=persons[id]||{name:x[0],period:x[1]}; return `<button class="person" onclick="openItem('${id}')">${v29AvatarMarkup(id,p)}<span class="v25-char-info"><b>${safe(x[0])}</b><small>${safe(x[1]||'')}</small></span></button>`; };

  function v29EnsureBrandLogo(config){
    const crest=document.querySelector('.seal');
    if(!crest) return;
    let logo=document.getElementById('siteBrandLogo');
    if(!logo){ logo=document.createElement('img'); logo.id='siteBrandLogo'; logo.className='v29-brand-logo'; crest.prepend(logo); }
    const src=(config && config.logo_url) ? config.logo_url : '';
    if(src){ logo.src=src; logo.hidden=false; } else { logo.hidden=true; }
    if(config && config.font_family) document.documentElement.style.setProperty('--v29-body-font', config.font_family);
    const slogan=config && (config.tagline || config.slogan);
    if(slogan){ const el=document.getElementById('siteBrandSlogan'); if(el) el.textContent=slogan; }
  }
  if(typeof window.v23SetBrand === 'function'){
    const v29BaseBrand = window.v23SetBrand;
    window.v23SetBrand = function(config){ v29BaseBrand(config||{}); v29EnsureBrandLogo(config||{}); };
  }
  if(typeof window.showSection==='function'){ const baseShow=window.showSection; window.showSection=function(section){ baseShow(section); v29ApplyMenuIcons(); }; }

  window.hcmX = function(y){ return 120 + (y-1890)/(2026-1890)*5360; };
  window.buildHCM = function(){
    const wrap=document.getElementById('hcmHistory'); if(!wrap) return;
    const chapters=hcmChapters.map((c,i)=>{
      const av=V29_HCM_STAGES[i]||V29_HCM_STAGES[V29_HCM_STAGES.length-1];
      return `<button class="hcm-chapter" style="left:${hcmX(c.start)}px;width:${hcmX(c.end)-hcmX(c.start)-8}px" onclick="hcmGo(${c.start})"><div class="v29-hcm-stage-copy"><strong>${i+1}. ${safe(c.title)}</strong><span>${c.short}</span></div><span class="v29-stage-avatar" style="--v29-stage-bg:${av.bg}"><img src="${V37_STAGE_IMAGES[i]}" alt="Minh họa Hồ Chí Minh: ${safe(c.title)}"></span></button>`;
    }).join('');
    const gov=hcmGovernmentPeriods.map(g=>{const x=hcmX(g.start),w=Math.max(30,hcmX(g.end)-x-8);return `<button class="hcm-government ${g.cls||''}" style="left:${x}px;top:${477+g.lane*70}px;width:${w}px;height:56px" onclick="openGovernment('${g.id}',${g.start},'${g.label}')"><div><b>${safe(hcmGovernmentName(g))}</b><span>${g.start}–${g.end===2026?'nay':g.end}</span></div></button>`}).join('');
    const cards=hcmEvents.map((e,i)=>`<button class="hcm-event" style="left:${hcmX(e.year)}px;top:${160+(i%3)*72}px" onclick="openHCM(${e.year})"><small>${safe(e.date)}</small><b>${safe(e.title)}</b><span>Đọc câu chuyện ↗</span></button>`).join('');
    const mobile=hcmChapters.map((c,i)=>{ const av=V29_HCM_STAGES[i]||V29_HCM_STAGES[V29_HCM_STAGES.length-1]; return `<div class="hcm-mobile-chapter">${i+1}. ${safe(c.title)}<small>${c.short}</small><span class="v29-stage-avatar" style="--v29-stage-bg:${av.bg}"><img src="${V37_STAGE_IMAGES[i]}" alt="Minh họa Hồ Chí Minh: ${safe(c.title)}"></span></div>${hcmEvents.filter((e,j)=>e.year>=c.start&&(e.year<c.end||(i===6&&e.year===2026))).map(e=>`<button class="hcm-mobile-card" onclick="openHCM(${e.year})"><span class="date">${safe(e.date)}</span><b>${safe(e.title)}</b><div class="hcm-mobile-context">Cùng thời: ${safe(hcmContextAt(e.year))}</div><small>Xem bài viết ↗</small></button>`).join('')}`; }).join('');
    wrap.innerHTML=`<div class="hcm-page"><div class="hcm-intro"><span class="eyebrow">DÒNG THỜI GIAN NHÂN VẬT · 7 CHẶNG THEO TƯ LIỆU ANH GỬI</span><h2>CHỦ TỊCH HỒ CHÍ MINH</h2><div class="hcm-toolbar"><button class="toolbtn" onclick="hcmGo(1911)">1911 · Ra đi</button><button class="toolbtn" onclick="hcmGo(1941)">1941 · Trở về</button><button class="toolbtn" onclick="hcmGo(1945)">1945 · Độc lập</button><button class="toolbtn" onclick="hcmGo(1969)">1969 · Di sản</button><button class="toolbtn" onclick="hcmGo(2026)">Đến hiện tại</button></div></div><div class="hcm-board v18"><div class="hcm-board-header"><div><h3>Cuộc đời Hồ Chí Minh và bối cảnh lịch sử song hành</h3><small>Thanh năm chung · kéo ngang để khám phá · chọn thẻ mở Popup</small></div><div class="hcm-controls"><button onclick="hcmPan(-640)" aria-label="Về trước">←</button><button onclick="hcmZoom(-1)" aria-label="Thu nhỏ">−</button><strong id="hcmCurrent">1890</strong><button onclick="hcmZoom(1)" aria-label="Phóng to">+</button><button onclick="hcmPan(640)" aria-label="Tiếp theo">→</button></div></div><div class="hcm-scroll" id="hcmScroll"><div class="hcm-track" id="hcmTrack"><div class="hcm-life-label">CUỘC ĐỜI VÀ DI SẢN</div><div class="hcm-gov-label">CHÍNH QUYỀN / THỜI KỲ CÙNG THỜI</div><div class="hcm-axis"></div>${Array.from({length:14},(_,i)=>1890+i*10).concat([2026]).map(y=>`<div class="hcm-tick" style="left:${hcmX(y)}px">${y}</div>`).join('')}${chapters}${cards}${gov}<p class="hcm-gov-note">Dải dưới liên kết tới dữ liệu các chính quyền đã có ở timeline chính; những giai đoạn chồng lấn được thể hiện thành nhiều hàng.</p></div></div><div class="hcm-year-range"><b>1890</b><input id="hcmSlider" type="range" min="1890" max="2026" step="1" value="1890" oninput="hcmGo(Number(this.value))"><b>2026</b></div></div><div class="hcm-mobile">${mobile}</div><p class="hcm-source v23-hcm-note">Nội dung đang ở dạng thử nghiệm · V3.7</p></div>`;
  };

  function v29Init(){
    try{v29ApplyMenuIcons();}catch(e){}
    try{v25RenderCharacters();}catch(e){}
    try{buildHCM();}catch(e){}
    try{ if(typeof window.v23SetBrand==='function') v23SetBrand({name:document.getElementById('siteBrandName')?.textContent||'', slogan:document.getElementById('siteBrandSlogan')?.textContent||''}); }catch(e){}
    if(['http:','https:'].includes(location.protocol)){
      fetch('/api/site-config',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(cfg=>{if(cfg){try{v23SetBrand(cfg)}catch(e){}}}).catch(()=>{});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', v29Init, {once:true}); else v29Init();
})();
