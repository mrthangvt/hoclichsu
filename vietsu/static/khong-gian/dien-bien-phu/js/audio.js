/* Âm thanh sa bàn Điện Biên Phủ — tổng hợp bằng WebAudio; tiếng chim và 2 bài nhạc nền là tệp mp3 do chủ dự án cung cấp.
   Lớp nền: gió, mưa, chim (sáng), côn trùng (đêm), nền giao tranh xa, tiếng máy bay. Âm đơn: nổ pháo, sấm, nổ lớn.
   Chỉ khởi động khi người xem bật "Âm thanh" (trình duyệt cần thao tác bấm). */
export function createAudio(){
  let AC=null,master=null,layers={},on=false,self=null;
  const target={wind:0,rain:0,birds:0,insects:0,battle:0,plane:0,chim:0};
  const rnd=()=>Math.random()*2-1;
  function buf(sec,fill){const sr=AC.sampleRate,n=Math.floor(sec*sr),b=AC.createBuffer(1,n,sr);fill(b.getChannelData(0),sr,n);
    const d=b.getChannelData(0),f=Math.min(Math.floor(sr*.4),Math.floor(n/4));for(let i=0;i<f;i++){const w=i/f;d[i]=d[i]*w+d[n-f+i]*(1-w)}return b}
  function loop(b,gain=0){const s=AC.createBufferSource();s.buffer=b;s.loop=true;const g=AC.createGain();g.gain.value=gain;s.connect(g).connect(master);s.start();return g}
  function build(){
    AC=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'playback'});master=AC.createGain();master.gain.value=.9;const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=12;comp.ratio.value=6;comp.attack.value=.004;comp.release.value=.25;master.connect(comp).connect(AC.destination);
    const wake=()=>{if(on&&AC.state!=='running')AC.resume().catch(()=>{})};addEventListener('pointerdown',wake);addEventListener('keydown',wake);setInterval(wake,2000);
    const wind=buf(9,(d,sr,n)=>{let a=0,b=0;for(let i=0;i<n;i++){const t=i/sr;a+=(rnd()-a)*.012;b+=(a-b)*.03;d[i]=b*7*(.55+.45*Math.sin(t*.7)*Math.sin(t*.23+1))}});
    const rain=buf(6,(d,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const x=rnd();lp+=(x-lp)*.5;d[i]=(x-lp)*.35}
      for(let k=0;k<1200;k++){const s=Math.floor(Math.random()*n),L=Math.floor(sr*.008);for(let i=0;i<L&&s+i<n;i++)d[s+i]+=rnd()*.45*Math.exp(-i/L*4)}});
    const birds=buf(8,(d,sr,n)=>{for(let k=0;k<26;k++){const s=Math.floor(Math.random()*n),f0=2200+Math.random()*2400,L=Math.floor(sr*(.05+Math.random()*.12)),rep=1+Math.floor(Math.random()*4);
      for(let r=0;r<rep;r++){const o=s+r*Math.floor(L*1.6);for(let i=0;i<L&&o+i<n;i++){const t=i/sr,f=f0*(1+.25*Math.sin(t*90));d[o+i]+=Math.sin(2*Math.PI*f*t)*.16*Math.sin(Math.PI*i/L)}}}});
    const insects=buf(5,(d,sr,n)=>{for(let i=0;i<n;i++){const t=i/sr;d[i]=Math.sin(2*Math.PI*4300*t)*.05*(.5+.5*Math.sin(2*Math.PI*28*t))*(.6+.4*Math.sin(t*1.3))+rnd()*.004}});
    const battle=buf(10,(d,sr,n)=>{let a=0;for(let i=0;i<n;i++){a+=(rnd()-a)*.004;d[i]=a*3}
      for(let k=0;k<22;k++){const s=Math.floor(Math.random()*n),L=Math.floor(sr*(.6+Math.random()));let lp=0;for(let i=0;i<L&&s+i<n;i++){lp+=(rnd()-lp)*.02;d[s+i]+=lp*5*Math.exp(-i/L*3)}}
      for(let k=0;k<40;k++){const s=Math.floor(Math.random()*n),r=8+Math.floor(Math.random()*14);for(let j=0;j<r;j++){const o=s+Math.floor(j*sr*.07);for(let i=0;i<300&&o+i<n;i++)d[o+i]+=rnd()*.12*Math.exp(-i/60)}}});
    const plane=buf(4,(d,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;const x=Math.sin(2*Math.PI*62*t)+.6*Math.sin(2*Math.PI*124*t+1)+.3*Math.sin(2*Math.PI*93*t);lp+=(x*.5+rnd()*.3-lp)*.08;d[i]=lp*.35*(1+.15*Math.sin(t*9))}});
    layers={wind:loop(wind),rain:loop(rain),birds:loop(birds),insects:loop(insects),battle:loop(battle),plane:loop(plane)};
    // tiếng chim buổi sáng (tệp mp3): giải mã khi bật âm thanh lần đầu
    const fs=self&&self.fileSrc;if(fs&&fs.chim)fs.fetchBuf(fs.chim,'chim').then(b=>AC.decodeAudioData(b)).then(buf=>{layers.chim=loop(buf)}).catch(()=>{});
  }
  const BASE={wind:.45,rain:.55,birds:0,insects:.35,battle:.6,plane:1.1,chim:.9};
  // nhạc nền theo dòng thời gian phim: phát tại vị trí pos (giây), âm lượng vol; pos=null thì tắt dần
  const MUS={};
  function musLoad(k){if(MUS[k])return MUS[k];const m=MUS[k]={buf:null,src:null,g:null,t0:0};const fs=self.fileSrc;if(fs&&fs[k])fs.fetchBuf(fs[k],k).then(b=>AC.decodeAudioData(b)).then(b=>{m.buf=b}).catch(()=>{});return m}
  function musStop(m){if(!m.src)return;m.g.gain.setTargetAtTime(0,AC.currentTime,.35);const s=m.src;m.src=null;setTimeout(()=>{try{s.stop()}catch(e){}},1500)}
  const CACHE={};let live=0;const RATE={};
  function shot(sec,fill,vol,delay=0,key=null){if(!on||!AC||AC.state!=='running')return;if(live>14)return;const kind=key?key.replace(/\d+/g,''):'x',now=AC.currentTime,R=RATE[kind]||(RATE[kind]={t:now,n:0});if(now-R.t>1){R.t=now;R.n=0}if(R.n>=(kind==='boom'?5:kind==='buoc'?6:10))return;R.n++;let b;
    if(key){const L=CACHE[key]||(CACHE[key]=[]);if(L.length<4){b=buf(sec,fill);L.push(b)}else b=L[Math.floor(Math.random()*L.length)]}else b=buf(sec,fill);
    const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=key?.92+Math.random()*.16:1;const g=AC.createGain();g.gain.value=vol;s.connect(g).connect(master);live++;setTimeout(()=>{live=Math.max(0,live-1)},(sec/(s.playbackRate.value||1)+delay)*1000+60);s.start(AC.currentTime+delay)}
  self={
    fileSrc:null,
    get on(){return on},
    enable(v){on=v;if(v&&!AC)build();if(AC){if(v)AC.resume();else AC.suspend()}},
    music(k,pos,vol,gen=0){if(!AC)return;const m=musLoad(k);if(!m.buf)return;if(!m.g){m.g=AC.createGain();m.g.gain.value=0;m.g.connect(master)}
      if(!on||pos==null||pos<0||pos>=m.buf.duration-.2||vol<=.001){musStop(m);return}
      const cur=m.src?AC.currentTime-m.t0:-99;if(!m.src||m.gen!==gen||Math.abs(cur-pos)>6){m.gen=gen;if(m.src){try{m.src.stop()}catch(e){}}const s=AC.createBufferSource();s.buffer=m.buf;s.connect(m.g);s.start(0,pos);m.src=s;m.t0=AC.currentTime-pos}
      m.g.gain.setTargetAtTime(vol,AC.currentTime,.3)},
    set(m){Object.assign(target,m);if(m.birds!=null)target.chim=m.birds},
    tick(dt){if(!on||!AC)return;const k=Math.min(1,dt*1.5);for(const n in layers){const g=layers[n].gain;g.value+=(BASE[n]*(target[n]||0)-g.value)*k}},
    boom(dist=800,size=1){const d=Math.max(.15,Math.min(1,600/Math.max(200,dist)));
      shot(2.2,(a,sr,n)=>{let lp=0;for(let i=0;i<n;i++){lp+=(rnd()-lp)*(.04+.1*d);a[i]=lp*4*Math.exp(-i/sr*(2.2-size*.6))*(i<sr*.01?i/(sr*.01):1)}},.5*d*size,dist/1500,'boom'+Math.round(d*2)+Math.min(3,Math.round(size)))},
    gun(dist=200){const d=Math.max(.05,Math.min(1,60/Math.max(30,dist)));shot(.35,(a,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;lp+=(rnd()-lp)*.35;a[i]=(rnd()*.6+lp)*Math.exp(-t*(dist<120?30:14))}},.35*d,dist/900,dist<120?'gunN':'gunF')},
    step(run){shot(.16,(a,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const t=i/sr;lp+=(rnd()-lp)*.18;a[i]=(lp*1.6+rnd()*.15)*Math.exp(-t*(run?34:26))*(t<.006?t/.006:1)}},run?.32:.22,0,'buoc')},
    blast(){shot(6,(a,sr,n)=>{let lp=0,l2=0;for(let i=0;i<n;i++){lp+=(rnd()-lp)*.03;l2+=(lp-l2)*.05;a[i]=(l2*9+lp*2)*Math.exp(-i/sr*.7)*(i<sr*.02?i/(sr*.02):1)}},1,0.25)},
    thunder(delay=1){shot(5,(a,sr,n)=>{let lp=0;for(let i=0;i<n;i++){lp+=(rnd()-lp)*.025;const t=i/sr;a[i]=lp*6*Math.exp(-t*.8)*(.4+.6*Math.abs(Math.sin(t*7+Math.sin(t*3))))}},.5,delay)}
  };
  // khi đã có tiếng chim thật thì giảm tiếng chim tổng hợp
  const tk=self.tick;self.tick=dt=>{if(layers.chim){target.birds=target.birds*.25}tk(dt)};
  return self;
}
