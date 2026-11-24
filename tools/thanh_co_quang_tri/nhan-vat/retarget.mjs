import {io} from './lib.mjs';import fs from 'fs';
// quaternion [x,y,z,w]
const qm=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
const qi=a=>[-a[0],-a[1],-a[2],a[3]];
const qv=(q,v)=>{const p=qm(qm(q,[v[0],v[1],v[2],0]),qi(q));return [p[0],p[1],p[2]]};
const tgtDoc=await io.read('/home/claude/nv/qdnd.glb');const T=tgtDoc.getRoot().listNodes();
function chainRest(nodes){const m=new Map();for(const n of nodes)m.set(n,{t:n.getTranslation(),r:n.getRotation(),s:n.getScale(),p:n.getParentNode()});return m}
function worldOf(n,loc){ // loc(n)->{t,r}; returns {r,t} world (bỏ qua scale trừ hệ số đều)
  const chain=[];for(let p=n;p;p=p.getParentNode())chain.unshift(p);let R=[0,0,0,1],P=[0,0,0],S=1;
  for(const c of chain){const L=loc(c);const t=L.t.map(x=>x*S);const tw=qv(R,t);P=[P[0]+tw[0],P[1]+tw[1],P[2]+tw[2]];R=qm(R,L.r);S*=L.s?L.s[0]:1}return {r:R,t:P,s:S}}
const out={};
for(const [file,name,opt] of JSON.parse(process.argv[2])){
  const sd=await io.read(file);const S=sd.getRoot().listNodes();const anim=sd.getRoot().listAnimations()[0];
  const ch=new Map();let times=null;
  const raw=[];for(const c of anim.listChannels()){const smp=c.getSampler();const inp=smp.getInput().getArray();raw.push([c,inp,smp.getOutput().getArray()]);if(!times||inp.length>times.length)times=inp}
  // lấy mẫu lại mọi kênh theo cùng một dòng thời gian (kênh tĩnh chỉ có 2 khoá)
  for(const [c,inp,outA] of raw){const n=c.getTargetNode(),p=c.getTargetPath();const w=p==='rotation'?4:3;const res=new Float32Array(times.length*w);
    for(let f=0;f<times.length;f++){const t=times[f];let i=0;while(i<inp.length-2&&inp[i+1]<=t)i++;const t0=inp[i],t1=inp[Math.min(i+1,inp.length-1)];const u=t1>t0?Math.min(1,Math.max(0,(t-t0)/(t1-t0))):0;
      const a=outA.slice(i*w,i*w+w),b=outA.slice(Math.min(i+1,inp.length-1)*w,Math.min(i+1,inp.length-1)*w+w);let sg=1;if(w===4&&a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)sg=-1;
      let v=[...a].map((x,k)=>x*(1-u)+b[k]*sg*u);if(w===4){const l=Math.hypot(...v);v=v.map(x=>x/l)}res.set(v,f*w)}
    (ch.get(n)||ch.set(n,{}).get(n))[p]=res}
  if(opt.f1!=null){times=times.slice(opt.f0||0,opt.f1+1)}const F0=opt.f1!=null?(opt.f0||0):0;const nf=times.length;const rest=n=>({t:n.getTranslation(),r:n.getRotation(),s:n.getScale()});
  const C=opt.rx?[Math.sin(opt.rx*Math.PI/360),0,0,Math.cos(opt.rx*Math.PI/360)]:[0,0,0,1];const swo=(n,L)=>{const w=worldOf(n,L);return {r:qm(C,w.r),t:qv(C,w.t),s:w.s}};
  const sBy=new Map(S.map(n=>[n.getName(),n])),tBy=new Map(T.map(n=>[n.getName(),n]));
  const common=[...tBy.keys()].filter(k=>k.startsWith('mixamorig:')&&sBy.has(k));
  const sHip=sBy.get('mixamorig:Hips'),tHip=tBy.get('mixamorig:Hips');
  const sH0=swo(sHip,rest),tH0=worldOf(tHip,rest);if(opt.h0)sH0.t=opt.h0;console.log(name,'src hips rest',sH0.t.map(x=>x.toFixed(3)));const ratio=opt.ratio||(tH0.t[1])/(sH0.t[1]);
  const tracks={};for(const k of common){tracks[k]={q:[]};}tracks['mixamorig:Hips'].p=[];
  const s0=new Map(common.map(k=>[k,swo(sBy.get(k),rest).r])),t0=new Map(common.map(k=>[k,worldOf(tBy.get(k),rest).r]));
  for(let f=0;f<nf;f++){
    const g=f+F0;const sl=n=>{const c=ch.get(n);const r=rest(n);return {t:c&&c.translation?[...c.translation.slice(g*3,g*3+3)]:r.t,r:c&&c.rotation?[...c.rotation.slice(g*4,g*4+4)]:r.r,s:c&&c.scale?[...c.scale.slice(g*3,g*3+3)]:r.s}};
    const tW=new Map();
    const tl=n=>{const k=n.getName();if(tW.has(n))return tW.get(n);return null};
    // thế giới đích theo thứ tự cha → con
    const order=common.slice().sort((a,b)=>{let da=0,db=0;for(let p=tBy.get(a);p;p=p.getParentNode())da++;for(let p=tBy.get(b);p;p=p.getParentNode())db++;return da-db});
    const tWorld=new Map();
    for(const k of order){const sw=swo(sBy.get(k),sl).r;const D=qm(sw,qi(s0.get(k)));const W=qm(D,t0.get(k));tWorld.set(k,W);
      const par=tBy.get(k).getParentNode();let PW;if(tWorld.has(par.getName()))PW=tWorld.get(par.getName());else PW=worldOf(par,rest).r;
      let q=qm(qi(PW),W);const prev=tracks[k].q.slice(-4);if(prev.length&&prev[0]*q[0]+prev[1]*q[1]+prev[2]*q[2]+prev[3]*q[3]<0)q=q.map(x=>-x);tracks[k].q.push(...q)}
    // vị trí hông
    const sw=swo(sHip,sl).t;const H0=opt.hipRef?worldOf(sHip,n=>{const c=ch.get(n);const r=rest(n);return {t:c&&c.translation?[...c.translation.slice(0,3)]:r.t,r:c&&c.rotation?[...c.rotation.slice(0,4)]:r.r,s:r.s}}).t:null;const d=[(sw[0]-sH0.t[0])*ratio,(sw[1]-sH0.t[1])*ratio,(sw[2]-sH0.t[2])*ratio];const tw=[tH0.t[0]+d[0],tH0.t[1]+d[1]+(opt.dy||0),tH0.t[2]+d[2]];
    const par=tHip.getParentNode();const PWo=worldOf(par,rest);const lp=qv(qi(PWo.r),[tw[0]-PWo.t[0],tw[1]-PWo.t[1],tw[2]-PWo.t[2]]).map(x=>x/PWo.s);
    if(opt.inplace&&f>0){}tracks['mixamorig:Hips'].p.push(...lp)}
  let tt=[...times].map(x=>x-times[0]);if(nf===1||tt[tt.length-1]===0){tt=[0,1];for(const k in tracks){tracks[k].q.push(...tracks[k].q.slice(0,4));if(tracks[k].p)tracks[k].p.push(...tracks[k].p.slice(0,3))}}
  const san=s=>s.replace(/\s/g,'_').replace(/[\[\]\.:\/]/g,'');
  const tr=[];for(const k in tracks){tr.push({name:san(k)+'.quaternion',type:'quaternion',times:tt,values:tracks[k].q.map(x=>+x.toFixed(5))});if(tracks[k].p)tr.push({name:san(k)+'.position',type:'vector',times:tt,values:tracks[k].p.map(x=>+x.toFixed(4))})}
  out[name]={name,duration:tt[tt.length-1],tracks:tr,uuid:name,blendMode:2500};
  console.log(name,'frames',nf,'bones',common.length,'ratio',ratio.toFixed(3),'dur',tt[tt.length-1].toFixed(2))}
fs.writeFileSync(process.argv[3],JSON.stringify(Object.values(out)));console.log('size',fs.statSync(process.argv[3]).size);
