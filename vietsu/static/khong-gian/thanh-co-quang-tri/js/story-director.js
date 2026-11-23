/* Bộ dẫn chuyện: phát/tạm dừng/tua/chuyển phân cảnh, camera theo khung khoá, nhịp hiệu ứng, sự kiện, 3 chế độ xem.
   Dữ liệu: data/episodes.json. Động cơ chiến trường: API do app.js truyền vào (không sửa trực tiếp đối tượng 3D). */
import {createUI} from './story-ui.js';
import {createStoryAudio} from './story-audio.js';

export async function start(api){
  const {THREE,camera,controls,B}=api;
  const url=(window.ASSETS&&window.ASSETS.episodes)||'data/episodes.json';
  const data=await fetch(url).then(r=>r.json());
  const eps=data.episodes,list=eps.filter(e=>e.ready&&e.cam);
  const total=list.reduce((a,e)=>a+e.duration_sec,0);
  const starts=[];{let a=0;for(const e of list){starts.push(a);a+=e.duration_sec}}
  const audio=createStoryAudio(api);
  const D={mode:'story',i:0,t:0,speed:1,playing:true,userCam:false,envIdx:-1,fired:new Set(),autoPaused:false,line:-1,wit:null,witI:0};

  /* ---------- camera ---------- */
  const UP=new THREE.Vector3(0,1,0),tp=new THREE.Vector3(),tl=new THREE.Vector3();
  const pickCache={};
  // high: chọn người đứng trên đoạn tường còn cao (y>4) để máy quay không chui vào đống đổ nát
  function follow(kind,i,off,look,high){let a=api.anchor(kind,i);if(!a)return null;
    if(high){const key=kind+i;if(pickCache[key]==null){pickCache[key]=i;for(let j=i;j<i+a.count;j++){const b=api.anchor(kind,j);if(b.pos.y>4){pickCache[key]=j;break}}}a=api.anchor(kind,pickCache[key])}
    const d=a.dir,s=new THREE.Vector3(-d.z,0,d.x);
    const base=kind==='boat'?a.pos.clone().setY(api.WATER_Y):(a.head&&kind!=='swimmer')?a.head.clone():a.pos.clone();
    return {p:base.clone().addScaledVector(d,-off[0]).addScaledVector(s,off[1]).addScaledVector(UP,off[2]),l:base.clone().addScaledVector(d,look[0]).addScaledVector(UP,look[1])}}   /* look[0]=0: nhìn thẳng vào nhân vật */
  function pose(k){if(k.p)return {p:B(...k.p),l:B(...k.l)};if(k.view){const v=api.VIEWS[k.view];return {p:v[0].clone(),l:v[1].clone()}}
    if(k.follow)return follow(k.follow,k.i||0,k.off||[6,3,2.4],k.look||[4,.5],k.high);return null}
  const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
  function camAt(e,t){const ks=e.cam;let j=0;while(j<ks.length-1&&ks[j+1].t<=t)j++;const a=pose(ks[j]);if(!a)return null;if(j>=ks.length-1)return a;
    const b=pose(ks[j+1]);if(!b)return a;const k=ease(Math.min(1,Math.max(0,(t-ks[j].t)/(ks[j+1].t-ks[j].t))));
    return {p:tp.copy(a.p).lerp(b.p,k).clone(),l:tl.copy(a.l).lerp(b.l,k).clone()}}

  /* ---------- nhịp hiệu ứng (env) và sự kiện (cues) ---------- */
  function envUpTo(e,t){const m={};let idx=-1;(e.env||[]).forEach((k,n)=>{if(k.t<=t){idx=n;for(const [kk,v] of Object.entries(k))if(kk!=='t'){m[kk]=kk==='audio'?Object.assign(m.audio||{},v):v}}});return {m,idx}}
  function applyEnv(e,t,force){const {m,idx}=envUpTo(e,t);if(idx===D.envIdx&&!force)return;D.envIdx=idx;api.setEnv(m);audio.set(m.audio)}
  function fire(c){if(c.do==='flare')api.flare(c.at[0],c.at[1],c.at[2]||170);
    else if(c.do==='boom')api.boomAt(c.at[0],c.at[1],!!c.big);
    else if(c.do==='boomNear'){const a=api.anchor(c.follow,c.i||0);if(!a)return;const s=new THREE.Vector3(-a.dir.z,0,a.dir.x);const p=a.pos.clone().addScaledVector(a.dir,c.ahead||25).addScaledVector(s,c.side||0);api.boomAt(p.x,-p.z,false)}}
  function lineAt(e,t){let n=-1;(e.lines||[]).forEach((l,k)=>{if(l.t<=t)n=k});return n}

  /* ---------- giao diện ---------- */
  const H={
    setMode,prev:()=>goto(D.i-1,0),next:()=>goto(D.i+1,0),toggle:()=>setPlaying(!D.playing),
    returnCam:()=>{D.userCam=false;ui.showReturn(false);controls.enableDamping=true},
    seekFrac:f=>{const T=f*total;let i=0;while(i<list.length-1&&starts[i+1]<=T)i++;goto(i,T-starts[i],true)},
    gotoId:id=>{const i=list.findIndex(e=>e.id===id);if(i>=0){if(D.mode!=='story')setMode('story');goto(i,0)}},
    docsOpen:o=>{if(o&&D.playing&&D.mode==='story'){D.autoPaused=true;setPlaying(false)}else if(!o&&D.autoPaused){D.autoPaused=false;setPlaying(true)}},
    setPeriod:st=>{api.setState(st);ui.map(st);const p=(data.free_periods||[]).find(x=>x.state===st);if(p&&p.env)api.setEnv(p.env);const A={night_river_supply:{battle:.45,water:.8,wind:.3},overview:{battle:0,wind:.7,water:.25},spring:{battle:0,wind:.6,water:.2},memorial:{battle:0,wind:.4,water:.5},bunker_night:{battle:.3,wind:.3,water:0},rain_ruins:{battle:.3,wind:.4,water:0}};audio.set(Object.assign({battle:1,wind:.2,water:0,rain:0},A[st]||{}))},
    setWitness:id=>{D.wit=(data.witness||[]).find(w=>w.id===id)||data.witness[0];D.witI=0;api.setState(D.wit.state);ui.map(D.wit.state);ui.setWitness(D.wit.id,D.wit.note);if(D.wit.env)api.setEnv(D.wit.env);
      audio.set(D.wit.state==='night_river_supply'?{battle:.5,water:.9,wind:.3}:{battle:1,water:0,wind:.2});ui.setDate(D.wit.state==='night_river_supply'?'MỘT ĐÊM TIẾP VIỆN · THÁNG 7–9/1972':'THÁNG 7–9/1972 · TỔNG HỢP')},
    nextWitness:()=>{D.witI++},
    cine:on=>{D.cine=on;if(on){if(D.mode!=='story')setMode('story');D.userCam=false;ui.showReturn(false);controls.enabled=false;setPlaying(true)}else controls.enabled=D.mode!=='witness'}
  };
  const ui=createUI(api,data,H);
  ui.setTicks(starts.map(s=>s/total));

  function setPlaying(p){D.playing=p;ui.setPlaying(p);if(api.keepAwake)api.keepAwake(p||D.mode!=='story');if(!p&&typeof voStop==='function')voStop();if(p)D.vline=null}
  function goto(i,t=0,seeking=false){if(i<0||i>=list.length)return;const changed=true;/* luôn đặt lại trạng thái: tua lùi không giữ hiệu ứng của mốc sau */D.i=i;const e=list[i];
    if(changed){api.setState(e.state);ui.map(e.state);ui.setEpisode(e);audio.reset()}
    D.t=t;D.envIdx=-1;applyEnv(e,t,true);D.fired=new Set((e.cues||[]).filter(c=>c.t<t).map(c=>c.t+c.do));D.line=-1;D.vline=-2;
    if(!seeking){D.userCam=false;ui.showReturn(false)}
    if(!D.playing&&!seeking)setPlaying(true)}
  function setMode(m){D.mode=m;ui.setMode(m);api.stopTween();if(api.walking()&&m!=='free')api.setWalk(false);
    controls.enabled=m!=='witness';
    if(m==='story'){D.envIdx=-1;goto(D.i,D.t,true);setPlaying(true)}
    else if(m==='free'){const st=api.getState()==='overview'?'wall_fight':api.getState();ui.setPeriod(st);H.setPeriod(st);ui.setDate('TỰ CHỌN THỜI ĐIỂM')}
    else H.setWitness((D.wit&&D.wit.id)||'defender')}

  controls.addEventListener('start',()=>{if(D.mode==='story'&&!D.userCam){D.userCam=true;ui.showReturn(true)}});
  api.infoHooks.push(()=>{if(D.mode==='story'&&D.playing){D.autoPaused=true;setPlaying(false)}});
  document.getElementById('infox').addEventListener('click',()=>{if(D.autoPaused&&ui.docsHidden()){D.autoPaused=false;setPlaying(true)}});
  api.viewHooks.push(()=>{if(D.mode!=='free')setMode('free')});
  addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,select,textarea'))return;
    if(D.mode==='story'){if(e.code==='Space'){e.preventDefault();H.toggle()}else if(e.code==='PageDown'||e.code==='Period')H.next();else if(e.code==='PageUp'||e.code==='Comma')H.prev()}});

  /* ---------- góc nhìn nhân vật ---------- */
  function witnessCam(){const w=D.wit;if(!w)return;
    if(w.follow==='boat'){const r=follow('boat',D.witI,[1.6,.35,1.55],[30,1.2]);if(r){camera.position.copy(r.p);controls.target.copy(r.l)}return}
    const a=api.anchor(w.follow,D.witI*7+3);if(!a)return;const d=a.dir,s=new THREE.Vector3(-d.z,0,d.x);
    camera.position.copy(a.head).addScaledVector(d,-1.3).addScaledVector(s,.45).addScaledVector(UP,.32);controls.target.copy(a.head).addScaledVector(d,40).addScaledVector(UP,-2.5)}

  /* ---------- nhạc nền theo chương: e.music = [{src, start (giây trong chương), from (vị trí trong bài), volume, fade_in, fade_out}]
     Chỉ phát khi bật Âm thanh; bám theo giây phim khi tua; tự hạ khi đang có lời dẫn; tắt dần ở cuối đoạn. ---------- */
  const PRE=window.__AUD||[];   /* phần tử âm thanh đã được mở khoá ngay trong lần bấm "Xem sa bàn" */
  const MUS={el:PRE[1]||new Audio(),src:null,ok:true,duck:1,dur:{}};MUS.el.preload='auto';MUS.el.onerror=()=>{if(MUS.src)MUS.ok=false};
  MUS.el.addEventListener('loadedmetadata',()=>{if(MUS.src)MUS.dur[MUS.src]=MUS.el.duration});
  function segOf(e,t){const L=Array.isArray(e.music)?e.music:(e.music?[e.music]:[]);let k=-1;L.forEach((m,i)=>{if(m.start<=t)k=i});return k<0?null:{m:L[k],end:k+1<L.length?L[k+1].start:e.duration_sec}}
  function musicTick(e,dt){const sg=e?segOf(e,D.t):null;const m=sg&&sg.m;const want=!!m&&D.mode==='story'&&D.playing&&api.audio().on;
    const el=MUS.el;if(!m){if(!el.paused)el.pause();return}
    if(MUS.src!==m.src){el.pause();el.muted=false;MUS.ok=true;MUS.src=m.src;el.src=m.src;el.load()}
    if(!MUS.ok)return;const from=m.from||0;const tt=D.t-m.start;const pos=from+tt;const dur=MUS.dur[m.src]||(isFinite(el.duration)?el.duration:1e9);
    if(!want||tt<0||pos>dur){if(!el.paused)el.pause();return}
    if(el.readyState>=1&&Math.abs(el.currentTime-pos)>1.2)el.currentTime=Math.max(0,pos);
    if(el.playbackRate!==D.speed)el.playbackRate=D.speed;
    if(el.paused)el.play().catch(()=>{});
    MUS.duck+=((voBusy()?.45:1)-MUS.duck)*Math.min(1,(dt||.016)*2.5);   /* hạ nhạc mềm khi có lời dẫn */
    const end=Math.min(sg.end-m.start,dur-from);let v=(m.volume??.8)*MUS.duck;v*=Math.min(1,tt/(m.fade_in||2.5));v*=Math.min(1,Math.max(0,(end-tt)/(m.fade_out||3)));el.volume=Math.max(0,Math.min(1,v))}
  window.__MUS=MUS;

  /* ---------- lồng tiếng lời dẫn: ưu tiên tệp audio/voice/<id>-<số dòng>.mp3 (liệt kê trong audio/voice/index.json); thiếu tệp thì dùng giọng đọc tiếng Việt của thiết bị ---------- */
  const VO={on:true,ex:false,el:PRE[0]||new Audio(),f:null,lt:0,active:false,files:null,retry:0};   /* on: nút 🗣 (mặc định bật); ex: người xem tự bấm bật → đọc cả khi chưa bật Âm thanh */
  VO.el.preload='auto';
  VO.blob={};
  fetch('audio/voice/index.json').then(r=>r.ok?r.json():[]).then(async a=>{VO.files=new Set(a);
    /* tải sẵn toàn bộ lời dẫn vào bộ nhớ (≈7 MB) theo thứ tự phát: câu nào đến lượt cũng phát ngay, không trễ vì mạng → không bị cắt đuôi câu */
    for(const f of a){if(VO.blob[f])continue;try{const b=await fetch('audio/voice/'+f).then(r=>r.ok?r.blob():null);if(b)VO.blob[f]=URL.createObjectURL(b)}catch(e){}}
  }).catch(()=>{VO.files=new Set()});
  /* điện thoại (nhất là iPhone) chỉ cho phát âm thanh từ phần tử đã được mở khoá bằng một lần chạm: dùng lại đúng một phần tử cho giọng đọc và một cho nhạc */
  let unlocked=PRE.length>0;
  const SILENT='data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  function unlock(){if(unlocked)return;unlocked=true;
    for(const el of [VO.el,MUS.el]){if(!el.paused)continue;   /* đang phát = đã mở khoá */
      if(el===VO.el)VO.f=null;else MUS.src=null;el.src=SILENT;el.play().then(()=>{if(el.src===SILENT)el.pause()}).catch(()=>{})}
    D.vline=null}   /* câu đang dở (bị chặn trước lần chạm đầu) sẽ đọc lại từ đúng chỗ ở khung hình sau */
  for(const ev of ['pointerdown','touchend','keydown'])addEventListener(ev,unlock,{passive:true,capture:true});
  function voSeek(){const el=VO.el;const off=D.t-VO.lt;if(off>1.2){if(isFinite(el.duration)&&off>el.duration-.4){el.pause();VO.active=false}else el.currentTime=off}}
  VO.el.addEventListener('loadedmetadata',()=>{if(VO.active)voSeek()});
  VO.el.addEventListener('ended',()=>{VO.active=false});
  function voStop(){VO.active=false;VO.el.pause();try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
  function voBusy(){return (VO.active&&!VO.el.paused&&!VO.el.ended)||(window.speechSynthesis&&speechSynthesis.speaking)}
  function voWant(){return VO.on&&(VO.ex||api.audio().on)}
  function voKeep(){   /* điện thoại có lúc từ chối/ngắt phát: thử lại, giữ khớp với thời gian câu */
    if(!VO.active||!D.playing)return;const el=VO.el;if(el.playbackRate!==D.speed)el.playbackRate=D.speed;
    if(el.paused&&!el.ended&&performance.now()>VO.retry){VO.retry=performance.now()+800;if(el.readyState>=1)voSeek();if(VO.active)el.play().catch(()=>{})}}
  function speak(e,n){voStop();if(!voWant()||n<0||!D.playing)return;const tx=e.lines[n].text;if(!tx)return;const f=e.id+'-'+String(n+1).padStart(2,'0')+'.mp3';
    if(VO.files&&VO.files.has(f)){const el=VO.el;VO.active=true;VO.lt=e.lines[n].t;el.muted=false;
      if(VO.f!==f){VO.f=f;el.src=VO.blob[f]||('audio/voice/'+f);el.load()}else{el.currentTime=0;voSeek()}
      el.playbackRate=D.speed;VO.retry=performance.now()+800;el.play().catch(()=>{});
            return}
    if(!VO.ex)return;   /* chưa có tệp thu âm: chỉ dùng giọng máy khi người xem bấm 🗣 */
    if(!('speechSynthesis' in window))return;const u=new SpeechSynthesisUtterance(tx.replace(/[\u201c\u201d\u2018\u2019\u2026·()]/g,' '));u.lang='vi-VN';
    const v=speechSynthesis.getVoices().find(v=>/^vi/i.test(v.lang));if(v)u.voice=v;u.rate=1.08*D.speed;speechSynthesis.speak(u)}
  H.speed=()=>D.speed;
  H.setSpeed=v=>{D.speed=v;VO.el.playbackRate=v;ui.setSpeed&&ui.setSpeed(v)};
  H.voice=on=>{VO.on=on;VO.ex=on;if(!on)voStop();else if(D.mode==='story'){const e=list[D.i];speak(e,lineAt(e,D.t))}};

  /* ---------- vòng lặp ---------- */
  api.tickHooks.push(rawDt=>{const dt=Math.min(rawDt,.25);audio.tick(dt,voBusy());ui.tick(dt);
    if(D.mode==='story'){if(api.walking()){setMode('free');return}
      const e=list[D.i];if(D.playing){
        /* lời dẫn là đồng hồ chính: chưa đọc xong câu (hoặc câu đang tải) thì giữ phim ở cuối câu, tối đa 4 s, để không cắt mất đuôi câu */
        const nl=(e.lines||[]).find(l=>l.t>D.t+1e-6);const edge=nl?nl.t:e.duration_sec;const el=VO.el;
        const reading=VO.active&&voWant()&&!el.ended&&(el.paused?el.readyState<3&&D.t-VO.lt<3:isFinite(el.duration)&&el.currentTime<el.duration-.12);
        const hold=reading&&D.t+dt*D.speed>=edge-.05&&(D.hold||0)<4;
        if(hold)D.hold=(D.hold||0)+dt;else{D.hold=0;D.t+=dt*D.speed}
        if(D.t>=e.duration_sec){if(D.i<list.length-1){goto(D.i+1,0);return}D.t=e.duration_sec;setPlaying(false)}}
      for(const c of e.cues||[]){const key=c.t+c.do;if(c.t<=D.t&&!D.fired.has(key)){D.fired.add(key);fire(c)}}
      applyEnv(e,D.t,false);
      const hint=!!e.music&&!api.audio().on&&MUS.ok;const n=lineAt(e,D.t);const key=n+(hint?'h':'');
      const vw=voWant();if(n!==D.vline||vw!==D.vwant){D.vline=n;D.vwant=vw;speak(e,n)}else voKeep()
      if(key!==D.line){D.line=key;const tx=n>=0?e.lines[n].text:'';ui.subtitle(hint?(tx?tx+' · ':'')+'🔊 Bật “Âm thanh” để nghe bài hát của chương này':tx)}
      if(!D.userCam){const c=camAt(e,D.t);if(c){camera.position.copy(c.p);controls.target.copy(c.l)}}
      ui.setProgress((starts[D.i]+D.t)/total,D.t,e.duration_sec)}
    else if(D.mode==='witness')witnessCam();
    musicTick(D.mode==='story'?list[D.i]:null,dt)});

  /* màn hình tắt / chuyển ứng dụng: tạm dừng lời dẫn và nhạc; mở lại thì phát tiếp đúng chỗ (lần chạm đầu cũng phát lại ngay, iPhone cần thế) */
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!VO.el.paused)VO.el.pause();if(!MUS.el.paused)MUS.el.pause()}else{D.vline=null}});
  if(api.resumeHooks)api.resumeHooks.push(()=>{if(D.mode!=='story'||!D.playing)return;
    if(VO.active&&VO.el.paused&&!VO.el.ended)VO.el.play().catch(()=>{});
    if(MUS.src&&MUS.el.paused&&api.audio().on)MUS.el.play().catch(()=>{})});
  setMode('story');goto(0,0);
  window.__STORY={D,list,goto,setMode,H};   // để kiểm thử
}
