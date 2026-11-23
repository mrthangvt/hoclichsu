import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
export const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
// 4x4 column-major
export function mul(a,b){const o=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}
export function compose(t,q,s){const [x,y,z,w]=q;const x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  return [(1-(yy+zz))*s[0],(xy+wz)*s[0],(xz-wy)*s[0],0,(xy-wz)*s[1],(1-(xx+zz))*s[1],(yz+wx)*s[1],0,(xz+wy)*s[2],(yz-wx)*s[2],(1-(xx+yy))*s[2],0,t[0],t[1],t[2],1]}
export function inv(m){const a=m,o=new Array(16);const [a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=a;
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;d=1/d;
  o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o}
export const xf=(m,v,w=1)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12]*w,m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13]*w,m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]*w];
export function world(n){let m=compose(n.getTranslation(),n.getRotation(),n.getScale());let p=n.getParentNode();while(p){m=mul(compose(p.getTranslation(),p.getRotation(),p.getScale()),m);p=p.getParentNode()}return m}
// vị trí đỉnh lúc nghỉ trong không gian thế giới theo cách three.js: Σ w·J·IBM·Mmesh·v
export function restWorld(meshNode){const skin=meshNode.getSkin();const J=skin.listJoints().map(world);const ibmA=skin.getInverseBindMatrices();const IBM=J.map((_,i)=>ibmA.getElement(i,new Array(16)));
  const M=world(meshNode);const prim=meshNode.getMesh().listPrimitives()[0];const P=prim.getAttribute('POSITION'),JO=prim.getAttribute('JOINTS_0'),WE=prim.getAttribute('WEIGHTS_0');
  const SK=J.map((j,i)=>mul(mul(j,IBM[i]),M));const n=P.getCount(),out=new Float32Array(n*3),jj=new Uint16Array(n*4),ww=new Float32Array(n*4);const v=[0,0,0],a=[0,0,0,0],b=[0,0,0,0];
  for(let i=0;i<n;i++){P.getElement(i,v);JO.getElement(i,a);WE.getElement(i,b);let s=[0,0,0];const tw=b[0]+b[1]+b[2]+b[3];for(let k=0;k<4;k++){if(!b[k])continue;const p=xf(SK[a[k]],v);s[0]+=p[0]*b[k]/tw;s[1]+=p[1]*b[k]/tw;s[2]+=p[2]*b[k]/tw}
    out.set(s,i*3);jj.set(a,i*4);ww.set(b.map(x=>x/tw),i*4)}
  return {pos:out,joints:jj,weights:ww,J,M,names:skin.listJoints().map(j=>j.getName())}}
export function bbox(p){const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<p.length;i+=3)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],p[i+k]);mx[k]=Math.max(mx[k],p[i+k])}return {mn,mx}}
