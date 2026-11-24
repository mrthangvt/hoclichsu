import {io} from './lib.mjs';import {dequantize} from '@gltf-transform/functions';
const doc=await io.read(process.argv[2]);for(const e of doc.getRoot().listExtensionsUsed())if(/meshopt|quantization|texture_webp/.test(e.extensionName))e.dispose();
await doc.transform(dequantize());await io.write(process.argv[3],doc);
