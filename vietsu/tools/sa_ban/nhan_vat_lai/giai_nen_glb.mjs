// Giải nén .glb (meshopt + lượng tử hoá) thành glb thường để Blender (bpy không có thư viện meshopt) đọc được.
// node giai_nen_glb.mjs <vào.glb> <ra.glb>   (dùng @gltf-transform của gltf-transform CLI cài toàn cục)
import { createRequire } from 'module';
const R = createRequire('/home/claude/.npm-global/lib/node_modules/@gltf-transform/cli/package.json');
const { NodeIO } = R('@gltf-transform/core'), { ALL_EXTENSIONS } = R('@gltf-transform/extensions'), { dequantize } = R('@gltf-transform/functions'), { MeshoptDecoder } = R('meshoptimizer');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(process.argv[2]);
await doc.transform(dequantize());
for (const e of doc.getRoot().listExtensionsUsed()) if (['EXT_meshopt_compression', 'KHR_mesh_quantization'].includes(e.extensionName)) e.dispose();
await io.write(process.argv[3], doc); console.log('xong', process.argv[3]);
