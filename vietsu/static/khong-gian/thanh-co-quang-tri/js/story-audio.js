/* Âm thanh theo phân cảnh — 3 lớp: môi trường (gió, mưa), địa điểm (nước sông), chiến sự (nền giao tranh có sẵn trong app.js).
   Tổng hợp bằng WebAudio, không dùng file. Chỉ chạy khi người xem bật "Âm thanh". */
export function createStoryAudio(api){
  const {THREE}=api;
  const target={battle:1,wind:0,water:0,rain:0};
  const cur={battle:1,wind:0,water:0,rain:0};
  const BASE={wind:.5,water:.55,rain:.5};
  let layers=null;
  const rnd=()=>Math.random()*2-1;
  function loopFix(d,sr,n){const f=Math.floor(sr*.4);for(let i=0;i<f;i++){const w=i/f;d[i]=d[i]*w+d[n-f+i]*(1-w)}}
  function build(){
    const {AC,listener,mkBuf}=api.audio();if(!AC||layers)return;
    const wind=mkBuf(9,(d,sr,n)=>{let a=0,b=0;for(let i=0;i<n;i++){const t=i/sr;a+=(rnd()-a)*.012;b+=(a-b)*.03;d[i]=b*7*(.55+.45*Math.sin(t*.7)*Math.sin(t*.23+1))}loopFix(d,sr,n)});
    const water=mkBuf(7,(d,sr,n)=>{let a=0,b=0;for(let i=0;i<n;i++){const t=i/sr;a+=(rnd()-a)*.09;b+=(a-b)*.25;const lap=Math.max(0,Math.sin(t*2.1+Math.sin(t*.7)*2));d[i]=b*1.4*(.25+.75*lap*lap)}
      for(let k=0;k<60;k++){const s=Math.floor(Math.random()*n),L=Math.floor(sr*.05),f=600+Math.random()*900;for(let i=0;i<L&&s+i<n;i++)d[s+i]+=Math.sin(2*Math.PI*f*i/sr*(1-i/L*.4))*.12*Math.exp(-i/L*5)}loopFix(d,sr,n)});
    const rain=mkBuf(6,(d,sr,n)=>{let lp=0;for(let i=0;i<n;i++){const x=rnd();lp+=(x-lp)*.5;d[i]=(x-lp)*.35}
      for(let k=0;k<900;k++){const s=Math.floor(Math.random()*n);const L=Math.floor(sr*.008);for(let i=0;i<L&&s+i<n;i++)d[s+i]+=rnd()*.5*Math.exp(-i/L*4)}loopFix(d,sr,n)});
    layers={};for(const [k,buf] of Object.entries({wind,water,rain})){const a=new THREE.Audio(listener);a.setBuffer(buf);a.setLoop(true);a.setVolume(0);a.play();layers[k]=a}
  }
  api.onAudio(on=>{if(on)build()});
  return {
    set(mix){if(mix)Object.assign(target,mix)},
    reset(){Object.assign(target,{battle:1,wind:0,water:0,rain:0})},
    tick(dt){const k=Math.min(1,dt*1.2);const w=api.weather().k;const eff={battle:target.battle,wind:Math.max(target.wind,w*.8),water:target.water,rain:Math.max(target.rain,w)};for(const n in cur)cur[n]+=(eff[n]-cur[n])*k;
      api.AMB.battle=cur.battle;const {SND,on}=api.audio();if(!on)return;
      if(SND.ambNode)SND.ambNode.setVolume(.55*cur.battle);
      if(layers)for(const n in layers)layers[n].setVolume(BASE[n]*cur[n])}
  };
}
