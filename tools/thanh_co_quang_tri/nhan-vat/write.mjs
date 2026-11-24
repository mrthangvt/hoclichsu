import {io,world,inv} from './lib.mjs';import {quantize,meshopt,prune,dedup,weld,simplify} from '@gltf-transform/functions';import fs from 'fs';import sharp from 'sharp';
const [,,which,texPath,out]=process.argv;
const F=JSON.parse(fs.readFileSync(`/home/claude/nv/fit_${which}.json`));
const doc=await io.read('/home/claude/nv/qdnd.glb');const r=doc.getRoot();const N=nm=>r.listNodes().find(n=>n.getName()===nm);
const mn=N('QDND_V2_Nguoi');const skin=mn.getSkin();const joints=skin.listJoints();
// bỏ hoạt cảnh (dùng chung clip của qdnd.glb khi chạy)
for(const a of r.listAnimations())a.dispose();
// IBM mới = nghịch đảo ma trận thế giới lúc nghỉ của khớp; đỉnh để ở không gian thế giới lúc nghỉ
const ibm=new Float32Array(joints.length*16);joints.forEach((j,i)=>ibm.set(inv(world(j)),i*16));
const buf=r.listBuffers()[0];
skin.setInverseBindMatrices(doc.createAccessor('ibm').setType('MAT4').setArray(ibm).setBuffer(buf));
const nd=await io.read(`/home/claude/nv/new_${which}.glb`);const np=nd.getRoot().listMeshes()[0].listPrimitives()[0];
const idx=np.getIndices().getArray();const uv=np.getAttribute('TEXCOORD_0').getArray();
const pos=new Float32Array(F.nRest);const n=pos.length/3;
// pháp tuyến tính lại từ hình đã về tư thế nghỉ
const nor=new Float32Array(n*3);for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],vx=pos[c]-pos[a],vy=pos[c+1]-pos[a+1],vz=pos[c+2]-pos[a+2];
  const cx=uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx;for(const k of [a,b,c]){nor[k]+=cx;nor[k+1]+=cy;nor[k+2]+=cz}}
for(let i=0;i<n;i++){const l=Math.hypot(nor[i*3],nor[i*3+1],nor[i*3+2])||1;nor[i*3]/=l;nor[i*3+1]/=l;nor[i*3+2]/=l}
const prim=mn.getMesh().listPrimitives()[0];const oldMat=prim.getMaterial();
const mat=oldMat.clone().setName('QDVN1972_'+which);
const img=await sharp(fs.readFileSync(texPath)).resize(1024,1024).webp({quality:82}).toBuffer();
const tex=doc.createTexture('QDVN1972_'+which+'_basecolor').setImage(img).setMimeType('image/webp');mat.setBaseColorTexture(tex);
const p2=doc.createPrimitive().setMaterial(mat)
  .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buf))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buf))
  .setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(nor).setBuffer(buf))
  .setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buf))
  .setAttribute('JOINTS_0',doc.createAccessor().setType('VEC4').setArray(new Uint16Array(F.nJ)).setBuffer(buf))
  .setAttribute('WEIGHTS_0',doc.createAccessor().setType('VEC4').setArray(new Float32Array(F.nW)).setBuffer(buf));
const m2=doc.createMesh('QDVN1972_'+which).addPrimitive(p2);mn.setMesh(m2).setName('QDVN1972_Nguoi');
const {MeshoptSimplifier}=await import('meshoptimizer');await MeshoptSimplifier.ready;
await doc.transform(prune(),dedup(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:.38,error:.0015}),quantize(),meshopt({encoder:(await import('meshoptimizer')).MeshoptEncoder,level:'medium'}));
await io.write(out,doc);console.log('ok',fs.statSync(out).size);
