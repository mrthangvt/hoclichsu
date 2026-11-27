import {io} from './lib.mjs';import {meshopt,quantize,prune,dedup} from '@gltf-transform/functions';import {MeshoptEncoder} from 'meshoptimizer';
await MeshoptEncoder.ready;const [,,src,dst]=process.argv;const doc=await io.read(src);
await doc.transform(prune(),dedup(),quantize(),meshopt({encoder:MeshoptEncoder,level:'medium'}));await io.write(dst,doc);console.log('ok',dst)
