/* Giao diện kể chuyện: chế độ xem, thanh phân cảnh, phụ đề, bảng Tư liệu & Chú giải, chọn cảnh, bản đồ nhỏ. */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

export function createUI(api,data,H){
  const eps=data.episodes,src=data.sources||{};
  const el=(tag,attrs={},html='')=>{const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);e.innerHTML=html;return e};

  /* ---- chế độ xem (đặt đầu hàng công cụ) ---- */
  const modes=el('div',{class:'modes',role:'tablist','aria-label':'Chế độ xem'},
    `<button data-m="story" role="tab">Theo dòng lịch sử</button><button data-m="free" role="tab">Khám phá tự do</button><button data-m="witness" role="tab">Góc nhìn nhân vật</button>`);
  document.querySelector('.hud.top').insertBefore(modes,document.querySelector('.hud.top .tools'));
  modes.onclick=e=>{const b=e.target.closest('button[data-m]');if(b)H.setMode(b.dataset.m)};
  const tools=document.querySelector('.hud.top .tools');
  const ccBtn=el('button',{class:'chip on',id:'cc','aria-pressed':'true',title:'Bật/tắt phụ đề'},'Phụ đề');
  const rfBtn=el('button',{class:'chip',id:'rf','aria-pressed':'false',title:'Giảm chớp sáng khi nổ'},'Giảm chớp');
  const wxBtn=el('button',{class:'chip',id:'wx','aria-pressed':'false',title:'Bật/tắt mưa giông, sấm chớp'},'⛈ Mưa giông');
  const lyBtn=el('button',{class:'chip',id:'ly','aria-pressed':'false',title:'Lớp hướng tiến công và khu vực kiểm soát',hidden:''},'➶ Lớp hướng');
  const cineBtn=el('button',{class:'chip',id:'cine',title:'Ẩn mọi nút, xem như một bộ phim (phím H; Esc để thoát)'},'🎬 Xem như phim');tools.insertBefore(cineBtn,tools.firstChild);
  const cineExit=el('button',{id:'cineExit','aria-label':'Thoát chế độ xem phim'},'✕ Thoát xem phim');document.body.append(cineExit);
  const bars=el('div',{id:'cineBars','aria-hidden':'true'},'<i></i><i></i>');document.body.append(bars);
  let cineOn=false,cineT=null;
  function setCine(v){cineOn=!!v;document.body.classList.toggle('cine',cineOn);H.cine(cineOn);if(cineOn){pick.hidden=true;toggleDocs(false);peek()}else cineExit.classList.remove('show')}
  function peek(){if(!cineOn)return;cineExit.classList.add('show');clearTimeout(cineT);cineT=setTimeout(()=>cineExit.classList.remove('show'),2500)}
  cineBtn.onclick=()=>setCine(true);cineExit.onclick=()=>setCine(false);
  addEventListener('pointermove',peek);addEventListener('pointerdown',peek);
  addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,select,textarea'))return;if(e.code==='Escape'&&cineOn)setCine(false);else if(e.code==='KeyH')setCine(!cineOn)});
  tools.insertBefore(rfBtn,tools.firstChild);tools.insertBefore(ccBtn,tools.firstChild);tools.insertBefore(lyBtn,tools.firstChild);tools.insertBefore(wxBtn,tools.firstChild);
  let wxOn=false;wxBtn.onclick=()=>{wxOn=!wxOn;wxBtn.classList.toggle('on',wxOn);wxBtn.setAttribute('aria-pressed',wxOn);api.setWeather(wxOn)};
  lyBtn.onclick=()=>{const st=api.getState();const L=api.layerOf(st);const on=!api.layer();api.setLayer(on?L:null);syncChips(st)};
  function syncChips(st){const L=api.layerOf(st);lyBtn.hidden=!L;const on=!!api.layer();lyBtn.classList.toggle('on',on);lyBtn.setAttribute('aria-pressed',on);
    const ba=$('sbBA');if(ba){ba.querySelectorAll('button').forEach(b=>b.classList.toggle('on',(b.dataset.ba==='truoc')===api.intact()))}
    const fi=$('perIntact');if(fi)fi.checked=api.intact()}
  api.stateHooks.push(syncChips);
  let ccOn=true;ccBtn.onclick=()=>{ccOn=!ccOn;ccBtn.classList.toggle('on',ccOn);ccBtn.setAttribute('aria-pressed',ccOn);$('sub').hidden=!ccOn||!$('sub').textContent};
  let rfOn=false;rfBtn.onclick=()=>{rfOn=!rfOn;rfBtn.classList.toggle('on',rfOn);rfBtn.setAttribute('aria-pressed',rfOn);api.setReduce(rfOn)};
  try{if(matchMedia('(prefers-reduced-motion: reduce)').matches){rfBtn.click()}}catch(e){}

  /* ---- nhãn mốc thời gian trên thẻ tiêu đề ---- */
  const titleP=document.querySelector('.card.title p');
  const dateChip=el('span',{class:'tag date',id:'dateLbl'},'');document.querySelector('.card.title').insertBefore(dateChip,document.querySelector('.card.title .tag'));

  /* ---- phụ đề ---- */
  const sub=el('div',{id:'sub','aria-live':'polite',hidden:''});document.body.append(sub);

  /* ---- thanh phân cảnh ---- */
  const bar=el('div',{class:'storybar card',id:'storybar'},`
    <div class="sb-row">
      <button class="sb-btn" id="sbPrev" aria-label="Cảnh trước">⏮</button>
      <button class="sb-btn big" id="sbPlay" aria-label="Phát / tạm dừng">⏸</button>
      <button class="sb-btn" id="sbNext" aria-label="Cảnh tiếp">⏭</button>
      <div class="sb-title"><b id="sbNum">01/10</b> <span id="sbName"></span><small id="sbTime"></small></div>
      <button class="sb-chip" id="sbPick" aria-haspopup="true" aria-label="Chọn cảnh"><span class="lg">Chọn c</span><span class="sm">C</span>ảnh</button>
      <span class="sb-ba" id="sbBA" hidden><button data-ba="truoc">Trước</button><button data-ba="sau" class="on">Sau</button></span>
      <button class="sb-chip" id="sbDocs">Tư liệu</button>
    </div>
    <input type="range" id="sbSeek" min="0" max="1000" value="0" aria-label="Tua giữa các phân cảnh">
    <div class="sb-ticks" id="sbTicks"></div>
    <button class="sb-return" id="sbReturn" hidden>↺ Quay lại máy quay dẫn chuyện</button>`);
  document.querySelector('.hud.bottom').insertBefore(bar,document.querySelector('.hud.bottom').firstChild);
  $('sbPrev').onclick=()=>H.prev();$('sbNext').onclick=()=>H.next();$('sbPlay').onclick=()=>H.toggle();
  $('sbReturn').onclick=()=>H.returnCam();$('sbBA').onclick=e=>{const b=e.target.closest('button[data-ba]');if(b){api.setIntact(b.dataset.ba==='truoc');syncChips(api.getState())}};$('sbDocs').onclick=()=>toggleDocs();
  let seeking=false;const seek=$('sbSeek');
  seek.addEventListener('input',()=>{seeking=true;H.seekFrac(seek.value/1000)});seek.addEventListener('change',()=>{seeking=false});

  /* ---- chọn cảnh ---- */
  const pick=el('div',{class:'card picker',id:'picker',hidden:''},
    `<h3>Mười phân cảnh</h3><ol>${eps.map(e=>`<li><button data-id="${e.id}" ${e.ready?'':'disabled'}><b>${String(e.sequence).padStart(2,'0')}</b> ${esc(e.title)}<small>${esc(e.date_label)}${e.ready?' · '+fmt(e.duration_sec):' · chưa dựng (giai đoạn B)'}</small></button></li>`).join('')}</ol>`);
  document.body.append(pick);
  $('sbPick').onclick=()=>{pick.hidden=!pick.hidden};
  pick.onclick=e=>{const b=e.target.closest('button[data-id]');if(b){pick.hidden=true;H.gotoId(b.dataset.id)}};

  /* ---- Tư liệu & Chú giải ---- */
  const docs=el('div',{class:'card docs',id:'docs',hidden:'',role:'dialog','aria-label':'Tư liệu và chú giải'},'');document.body.append(docs);
  function srcLinks(keys){return (keys||[]).map(k=>src[k]?`<a href="${esc(src[k].url)}" target="_blank" rel="noopener">[${esc(k)}]</a>`:'').join(' ')}
  function fillDocs(e){if(!e){docs.innerHTML='';return}const p=e.panel||{};const used=new Set();(p.facts||[]).forEach(f=>(f.src||[]).forEach(k=>used.add(k)));
    docs.innerHTML=`<button class="x" id="docsX" aria-label="Đóng">×</button>
      <div class="eyebrow">Cảnh ${String(e.sequence).padStart(2,'0')} · ${esc(e.date_label)}</div><h2>${esc(e.title)}</h2>
      <h4>1 · Điều đang thấy</h4><p>${esc(p.seeing||e.plan||'')}</p>
      <h4>2 · Sự kiện có nguồn</h4>${(p.facts||[]).length?`<ul>${p.facts.map(f=>`<li>${esc(f.text)} ${srcLinks(f.src)}</li>`).join('')}</ul>`:'<p class="muted">Chưa có.</p>'}
      <h4>3 · Phần tái dựng mô phỏng</h4>${(p.simulated||[]).length?`<ul>${p.simulated.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:'<p class="muted">—</p>'}
      <h4>4 · Tham khảo</h4><ul class="refs">${[...used].map(k=>src[k]?`<li><b>[${esc(k)}]</b> <a href="${esc(src[k].url)}" target="_blank" rel="noopener">${esc(src[k].title)}</a></li>`:'').join('')}</ul>
      <p class="muted small">Sa bàn là tái dựng mô phỏng phục vụ học tập; nhân vật, vị trí và hiệu ứng là minh hoạ trừ khi ghi có nguồn.</p>`;
    $('docsX').onclick=()=>toggleDocs(false)}
  function toggleDocs(v){docs.hidden=v===undefined?!docs.hidden:!v;$('sbDocs').classList.toggle('on',!docs.hidden);H.docsOpen(!docs.hidden)}

  /* ---- khám phá tự do: chọn thời điểm ---- */
  const per=el('div',{class:'card periods',id:'periods',hidden:''},`<label for="perSel">Thời điểm</label><select id="perSel">${(data.free_periods||[]).map(p=>`<option value="${p.state}">${esc(p.label)}</option>`).join('')}</select><label class="chk"><input type="checkbox" id="perIntact"> Trước tàn phá (giản lược)</label>`);
  document.querySelector('.hud.bottom').insertBefore(per,document.querySelector('.hud.bottom').firstChild);
  $('perSel').onchange=e=>H.setPeriod(e.target.value);$('perIntact').onchange=e=>{api.setIntact(e.target.checked)};

  /* ---- góc nhìn nhân vật ---- */
  const wit=el('div',{class:'card witness',id:'witness',hidden:''},`<div class="wl">${(data.witness||[]).map(w=>`<button data-w="${w.id}">${esc(w.label)}</button>`).join('')}</div>
    <div class="wrow"><button class="sb-chip" id="wNext">Đổi người ⟳</button><small id="wNote"></small></div>`);
  document.querySelector('.hud.bottom').insertBefore(wit,document.querySelector('.hud.bottom').firstChild);
  wit.onclick=e=>{const b=e.target.closest('button[data-w]');if(b)H.setWitness(b.dataset.w)};$('wNext').onclick=()=>H.nextWitness();

  /* ---- bản đồ nhỏ ---- */
  const mm=el('div',{class:'minimap card',id:'minimap'},`<canvas width="300" height="300" aria-label="Bản đồ nhỏ"></canvas><div class="mm-leg" id="mmLeg"></div>`);document.body.append(mm);
  const cv=mm.querySelector('canvas'),cx=cv.getContext('2d');
  const W=1500,CXb=-230,CYb=-40;const toPx=(bx,by)=>[(bx-CXb)/W*300+150,150-(by-CYb)/W*300];
  function arrow(x0,y0,x1,y1,col){const [a,b]=toPx(x0,y0),[c,d]=toPx(x1,y1);cx.strokeStyle=col;cx.fillStyle=col;cx.lineWidth=3;cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d);cx.stroke();
    const an=Math.atan2(d-b,c-a);cx.beginPath();cx.moveTo(c,d);cx.lineTo(c-9*Math.cos(an-.45),d-9*Math.sin(an-.45));cx.lineTo(c-9*Math.cos(an+.45),d-9*Math.sin(an+.45));cx.fill()}
  function drawMap(state){const [RA,RB]=api.RIVER;cx.clearRect(0,0,300,300);cx.fillStyle='#2a2119';cx.fillRect(0,0,300,300);
    cx.strokeStyle='#2c5f80';cx.lineWidth=220/W*300;cx.lineCap='butt';cx.beginPath();cx.moveTo(...toPx(RA[0],RA[1]));cx.lineTo(...toPx(RB[0],RB[1]));cx.stroke();
    const [m0x,m0y]=toPx(-296,296),[m1x,m1y]=toPx(296,-296);cx.fillStyle='#24485f';cx.fillRect(m0x,m0y,m1x-m0x,m1y-m0y);
    const [w0x,w0y]=toPx(-254,254),[w1x,w1y]=toPx(254,-254);const QH=['wall_fight','night_river_supply','counter_start','under_fire','bunker_night','rain_ruins'];cx.fillStyle=QH.includes(state)?'rgba(196,72,56,.85)':state==='final'?'rgba(214,130,60,.85)':state==='legacy'?'rgba(214,170,60,.8)':'#7d6450';cx.fillRect(w0x,w0y,w1x-w0x,w1y-w0y);
    cx.fillStyle='#2a2119';const [i0x,i0y]=toPx(-238,238),[i1x,i1y]=toPx(238,-238);cx.globalAlpha=.55;cx.fillRect(i0x,i0y,i1x-i0x,i1y-i0y);cx.globalAlpha=1;
    let leg='';
    if(state==='spring'){arrow(-100,1000,-40,330,'#e46a52');arrow(-1150,140,-330,30,'#e46a52');arrow(60,-330,120,-900,'#e9c45a');leg='<i class="r"></i>QĐND tiến công (30/3–2/5) <i class="y"></i>VNCH rút (1/5) — minh hoạ'}
    else if(state==='final'){arrow(-40,-650,30,-300,'#e9c45a');arrow(650,-380,300,-230,'#e9c45a');arrow(-300,30,-560,10,'#e46a52');leg='<i class="y"></i>VNCH tiến vào thành <i class="r"></i>QĐND rút sang bờ Tây (minh hoạ)'}
    else if(['counter_start','under_fire','bunker_night','rain_ruins'].includes(state)){if(state==='counter_start'){arrow(-120,-620,-90,-330,'#e9c45a');arrow(80,-620,60,-330,'#e9c45a');arrow(560,-60,330,-40,'#e9c45a')}leg='<i class="r"></i>QĐND giữ thành'+(state==='counter_start'?' <i class="y"></i>Hướng phản công VNCH (minh hoạ)':'')}
    else if(state==='memorial'){leg='Thành cổ hôm nay là khu di tích, nơi tưởng niệm'}
    else if(state==='wall_fight'){arrow(-120,-620,-90,-330,'#e9c45a');arrow(80,-620,60,-330,'#e9c45a');arrow(560,-60,330,-40,'#e9c45a');leg='<i class="r"></i>QĐND giữ thành <i class="y"></i>Hướng phản công VNCH (minh hoạ)'}
    else if(state==='night_river_supply'){arrow(-820,-160,-470,-80,'#e46a52');arrow(-830,20,-470,10,'#e46a52');leg='<i class="r"></i>QĐND giữ thành · mũi tên: tiếp viện qua sông (minh hoạ)'}
    else if(state==='legacy'){arrow(-820,-80,-330,-40,'#e46a52');leg='<i class="y"></i>VNCH trong thành · mũi tên: kịch bản giả định cũ'}
    else leg='Sông Thạch Hãn · hào nước · Thành cổ';
    $('mmLeg').innerHTML=leg;mapState=state}
  let mapState='',camDot=[0,0,0];
  function drawCam(){const c=api.camera;const bx=c.position.x,by=-c.position.z;const d=new api.THREE.Vector3();c.getWorldDirection(d);
    drawMap(mapState);const [x,y]=toPx(bx,by);const an=Math.atan2(d.z,d.x);
    cx.fillStyle='rgba(255,240,200,.25)';cx.beginPath();cx.moveTo(x,y);cx.arc(x,y,36,an-.45,an+.45);cx.closePath();cx.fill();cx.fillStyle='#fff3d6';cx.beginPath();cx.arc(Math.max(4,Math.min(296,x)),Math.max(4,Math.min(296,y)),4,0,7);cx.fill()}
  let mmT=0;

  return {
    setMode(m){modes.querySelectorAll('button').forEach(b=>{const on=b.dataset.m===m;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
      bar.hidden=m!=='story';per.hidden=m!=='free';wit.hidden=m!=='witness';$('views').hidden=m!=='free';pick.hidden=true;
      if(m!=='story'){this.subtitle('');toggleDocs(false)}
      $('help').textContent=m==='story'?'Kéo để nhìn quanh · ⏸ để dừng · Tư liệu để đọc nguồn':m==='witness'?'Góc nhìn quan sát của nhân vật tổng hợp — không điều khiển bắn':'Kéo để xoay · cuộn/chụm để phóng to · chạm chú thích để đọc tư liệu';
      titleP.textContent=m==='story'?'Theo dòng lịch sử · tái dựng có dẫn chuyện':m==='witness'?'Góc nhìn nhân vật tổng hợp':'Khám phá tự do'},
    setEpisode(e,num,total){$('sbBA').hidden=!e.compare;$('sbNum').textContent=String(e.sequence).padStart(2,'0')+'/'+String(eps.length).padStart(2,'0');$('sbName').textContent=e.title;dateChip.textContent=e.date_label;fillDocs(e)},
    setDate(t){dateChip.textContent=t},
    setPlaying(p){$('sbPlay').textContent=p?'⏸':'▶';$('sbPlay').setAttribute('aria-pressed',!p)},
    setProgress(frac,t,dur){if(!seeking)seek.value=Math.round(frac*1000);$('sbTime').textContent=' '+fmt(t)+' / '+fmt(dur)},
    setTicks(fracs){$('sbTicks').innerHTML=fracs.map(f=>`<i style="left:${(f*100).toFixed(2)}%"></i>`).join('')},
    subtitle(text){sub.textContent=text||'';sub.hidden=!ccOn||!text},
    showReturn(v){$('sbReturn').hidden=!v},
    setPeriod(st){$('perSel').value=st},
    setWitness(id,note){wit.querySelectorAll('button[data-w]').forEach(b=>b.classList.toggle('on',b.dataset.w===id));$('wNote').textContent=note||''},
    map(state){drawMap(state)},
    tick(dt){mmT+=dt;if(mmT>.25){mmT=0;drawCam()}},
    closeDocs(){toggleDocs(false)},
    docsHidden:()=>docs.hidden
  };
}
