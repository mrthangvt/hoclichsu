import {io,world,mul,inv,xf,bbox,compose} from './lib.mjs';import fs from 'fs';
const [,,which,S,THETA]=process.argv;const s=+S,th=+THETA*Math.PI/180;
const doc=await io.read('/home/claude/nv/qdnd.glb');const r=doc.getRoot();const N=nm=>r.listNodes().find(n=>n.getName()===nm);
const mn=N('QDND_V2_Nguoi');const skin=mn.getSkin();const joints=skin.listJoints();const J=joints.map(world);const IBM=J.map((_,i)=>skin.getInverseBindMatrices().getElement(i,new Array(16)));
// tư thế chữ A: hạ hai cánh tay góc th quanh trục Z thế giới, xoay quanh khớp vai
const isDesc=(n,anc)=>{for(let p=n;p;p=p.getParentNode())if(p===anc)return true;return false};
const rotZ=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
const tr=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
function pivotRot(anc,a){const w=world(anc);const [x,y,z]=[w[12],w[13],w[14]];return mul(tr(x,y,z),mul(rotZ(a),tr(-x,-y,-z)))}
const LA=N('mixamorig:LeftArm'),RA=N('mixamorig:RightArm');const PL=pivotRot(LA,-th),PR=pivotRot(RA,th);
const Jp=joints.map((j,i)=>isDesc(j,LA)?mul(PL,J[i]):isDesc(j,RA)?mul(PR,J[i]):J[i]);
const ARM=new Set(joints.map((j,i)=>isDesc(j,LA)||isDesc(j,RA)?i:-1).filter(i=>i>=0));const SP2=joints.findIndex(j=>j.getName()==='mixamorig:Spine2');
const D=Jp.map((m,i)=>mul(m,inv(J[i])));   // rest-world → posed-world cho từng xương
// đỉnh cũ: rest-world rồi posed
const prim=mn.getMesh().listPrimitives()[0];const P=prim.getAttribute('POSITION'),JO=prim.getAttribute('JOINTS_0'),WE=prim.getAttribute('WEIGHTS_0');
const nO=P.getCount(),oPos=new Float32Array(nO*3),oJ=new Uint16Array(nO*4),oW=new Float32Array(nO*4);{const v=[0,0,0],a=[0,0,0,0],b=[0,0,0,0];
 for(let i=0;i<nO;i++){P.getElement(i,v);JO.getElement(i,a);WE.getElement(i,b);const tw=b[0]+b[1]+b[2]+b[3];let q=[0,0,0];
  for(let k=0;k<4;k++){if(!b[k])continue;const p=xf(mul(Jp[a[k]],IBM[a[k]]),v);for(let c=0;c<3;c++)q[c]+=p[c]*b[k]/tw}oPos.set(q,i*3);oJ.set(a,i*4);oW.set(b.map(x=>x/tw),i*4)}}
// đỉnh mới, căn theo chiều cao + tâm thân
const nd=await io.read(`/home/claude/nv/new_${which}.glb`);const nprim=nd.getRoot().listMeshes()[0].listPrimitives()[0];const np=nprim.getAttribute('POSITION').getArray();
const nN=np.length/3,nPos=new Float32Array(nN*3);
// tâm thân cũ (vùng ngực) và mới
function torso(p,yl,yh){let sx=0,sz=0,c=0;for(let i=0;i<p.length;i+=3)if(p[i+1]>yl&&p[i+1]<yh&&Math.abs(p[i])<.15){sx+=p[i];sz+=p[i+2];c++}return [sx/c,sz/c]}
const [ox,oz]=torso(oPos,1.0,1.3);for(let i=0;i<nN;i++){nPos[i*3]=np[i*3]*s;nPos[i*3+1]=np[i*3+1]*s;nPos[i*3+2]=np[i*3+2]*s}
const [nx,nz]=torso(nPos,1.0,1.3);for(let i=0;i<nN;i++){nPos[i*3]+=ox-nx;nPos[i*3+2]+=oz-nz}
console.log('align dx dz',(ox-nx).toFixed(3),(oz-nz).toFixed(3));
// lưới tìm láng giềng
const C=.03,grid=new Map();const key=(x,y,z)=>`${Math.floor(x/C)},${Math.floor(y/C)},${Math.floor(z/C)}`;
for(let i=0;i<nO;i++){const k=key(oPos[i*3],oPos[i*3+1],oPos[i*3+2]);(grid.get(k)||grid.set(k,[]).get(k)).push(i)}
const nJ=new Uint16Array(nN*4),nW=new Float32Array(nN*4),nRest=new Float32Array(nN*3);let far=0;
for(let i=0;i<nN;i++){const x=nPos[i*3],y=nPos[i*3+1],z=nPos[i*3+2];let cand=[];
  for(let rr=1;rr<=6&&cand.length<8;rr++){cand=[];const gx=Math.floor(x/C),gy=Math.floor(y/C),gz=Math.floor(z/C);
    for(let a=-rr;a<=rr;a++)for(let b=-rr;b<=rr;b++)for(let c=-rr;c<=rr;c++){const L=grid.get(`${gx+a},${gy+b},${gz+c}`);if(L)for(const j of L){const d=(oPos[j*3]-x)**2+(oPos[j*3+1]-y)**2+(oPos[j*3+2]-z)**2;cand.push([d,j])}}}
  cand.sort((a,b)=>a[0]-b[0]);cand=cand.slice(0,8);if(!cand.length){far++;cand=[[1,0]]}
  const acc=new Map();for(const [d,j] of cand){const w=1/(d+1e-5);for(let k=0;k<4;k++){const jj=oJ[j*4+k],ww=oW[j*4+k];if(ww>0)acc.set(jj,(acc.get(jj)||0)+ww*w)}}
  // thân (vest, quai đeo) không nhận trọng số của tay; tay không nhận trọng số thân/chân
  const torsoV=Math.abs(x)<0.19&&y<1.40;if(torsoV){for(const jj of [...acc.keys()])if(ARM.has(jj))acc.delete(jj);if(!acc.size)acc.set(SP2,1)}
  const top=[...acc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);const tw=top.reduce((a,b)=>a+b[1],0);
  for(let k=0;k<4;k++){nJ[i*4+k]=top[k]?top[k][0]:0;nW[i*4+k]=top[k]?top[k][1]/tw:0}
  // về tư thế nghỉ (chữ T) của khung xương cũ: p_rest = (Σ w·D)^-1 · p
  const M=new Array(16).fill(0);for(let k=0;k<4;k++){const w=nW[i*4+k];if(!w)continue;const Dk=D[nJ[i*4+k]];for(let q=0;q<16;q++)M[q]+=Dk[q]*w}
  nRest.set(xf(inv(M),[x,y,z]),i*3)}
console.log('no-neighbour',far);
fs.writeFileSync(`/home/claude/nv/fit_${which}.json`,JSON.stringify({nPos:[...nPos],oPos:[...oPos],nRest:[...nRest],nJ:[...nJ],nW:[...nW]}));
