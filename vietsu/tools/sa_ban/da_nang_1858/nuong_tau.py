# Tàu hơi nước – buồm của Pháp (Tripo) → lưới gọn cho web: mũi −z, cao y, dài ~66 m, đường nước y = 0
import bpy, bmesh, sys, json, base64, numpy as np
sys.path.insert(0, '/tmp'); from imp import nap
f, ANH, DAI, TRI = sys.argv[sys.argv.index('--') + 1:]
DAI = float(DAI); TRI = int(TRI)
nap(f); bpy.context.view_layer.update()
ob = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
md = ob.modifiers.new('d', 'DECIMATE'); md.ratio = TRI / len(ob.data.polygons)
dg = bpy.context.evaluated_depsgraph_get(); m2 = ob.evaluated_get(dg).to_mesh()
bm = bmesh.new(); bm.from_mesh(m2); bmesh.ops.triangulate(bm, faces=bm.faces[:]); uvl = bm.loops.layers.uv.active
P = np.array([v.co[:] for v in bm.verts]); mn, mx = P.min(0), P.max(0); L = mx[0] - mn[0]; s = DAI / L
pos, uv, idx, key = [], [], [], {}
for fc in bm.faces:
    for lp in fc.loops:
        k = (lp.vert.index, round(lp[uvl].uv.x, 5), round(lp[uvl].uv.y, 5))
        if k not in key:
            key[k] = len(pos) // 3; c = lp.vert.co
            X = (c.x - (mn[0] + mx[0]) / 2) * s; Y = (c.y - (mn[1] + mx[1]) / 2) * s; Z = (c.z - mn[2]) * s
            pos += [Y, Z, X]; uv += [lp[uvl].uv.x, 1 - lp[uvl].uv.y]
        idx.append(key[k])
pos = np.array(pos, np.float32).reshape(-1, 3)
# đường nước: thân tàu thấp nhất → chìm 4 m; mặt boong: trung vị độ cao các đỉnh giữa thân (|x|<2, z∈[-16,-10])
pos[:, 1] -= 4.0
m = (np.abs(pos[:, 0]) < 2.5) & (pos[:, 2] > -18) & (pos[:, 2] < -8) & (pos[:, 1] > 0) & (pos[:, 1] < 9)
boong = float(np.percentile(pos[m, 1], 70)) if m.sum() else 3.5
rong = float(np.percentile(np.abs(pos[(pos[:, 1] > 0) & (pos[:, 1] < boong)][:, 0]), 98))
b64 = lambda a, t: base64.b64encode(np.asarray(a, t).tobytes()).decode()
out = {'n': len(pos), 'dai': DAI, 'boong': round(boong, 2), 'rong': round(rong, 2), 'pos': b64(pos.ravel(), np.float32), 'uv': b64(uv, np.float32),
       'idx': b64(idx, np.uint16 if len(pos) < 65535 else np.uint32), 'i32': len(pos) >= 65535}
json.dump(out, open('/home/claude/v12/goi/nv/tau-phap.json', 'w'))
from PIL import Image
im = Image.open(ANH).convert('RGB'); im.thumbnail((1024, 1024)); im.save('/home/claude/v12/goi/nv/tau-phap.jpg', quality=85)
print('XONG tau', len(idx) // 3, 'dinh', len(pos), 'boong', boong, 'rong', rong, 'cao', pos[:, 1].max())
