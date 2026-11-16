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
  const D={mode:'story',i:0,t:0,playing:true,userCam:false,envIdx:-1,fired:new Set(),autoPaused:false,line:-1,wit:null,witI:0};

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
    nextWitness:()=>{D.witI++}
  };
  const ui=createUI(api,data,H);
  ui.setTicks(starts.map(s=>s/total));

  function setPlaying(p){D.playing=p;ui.setPlaying(p)}
  function goto(i,t=0,seeking=false){if(i<0||i>=list.length)return;const changed=true;/* luôn đặt lại trạng thái: tua lùi không giữ hiệu ứng của mốc sau */D.i=i;const e=list[i];
    if(changed){api.setState(e.state);ui.map(e.state);ui.setEpisode(e);audio.reset()}
    D.t=t;D.envIdx=-1;applyEnv(e,t,true);D.fired=new Set((e.cues||[]).filter(c=>c.t<t).map(c=>c.t+c.do));D.line=-1;
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

  /* ---------- vòng lặp ---------- */
  api.tickHooks.push(rawDt=>{const dt=Math.min(rawDt,.1);audio.tick(dt);ui.tick(dt);
    if(D.mode==='story'){if(api.walking()){setMode('free');return}
      const e=list[D.i];if(D.playing){D.t+=dt;if(D.t>=e.duration_sec){if(D.i<list.length-1){goto(D.i+1,0);return}D.t=e.duration_sec;setPlaying(false)}}
      for(const c of e.cues||[]){const key=c.t+c.do;if(c.t<=D.t&&!D.fired.has(key)){D.fired.add(key);fire(c)}}
      applyEnv(e,D.t,false);
      const n=lineAt(e,D.t);if(n!==D.line){D.line=n;ui.subtitle(n>=0?e.lines[n].text:'')}
      if(!D.userCam){const c=camAt(e,D.t);if(c){camera.position.copy(c.p);controls.target.copy(c.l)}}
      ui.setProgress((starts[D.i]+D.t)/total,D.t,e.duration_sec)}
    else if(D.mode==='witness')witnessCam()});

  setMode('story');goto(0,0);
  window.__STORY={D,list,goto,setMode,H};   // để kiểm thử
}
