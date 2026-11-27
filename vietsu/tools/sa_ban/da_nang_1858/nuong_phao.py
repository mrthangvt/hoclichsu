# Súng thần công (mẫu Tripo anh gửi) → goi/nv/phao.json + .jpg  (nòng hướng +Z, bánh chạm đất y=0, dài 3,2 m)
import bpy, numpy as np, json, base64, glob
F = glob.glob('/home/claude/v13/in/stc/*.fbx')[0]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=F)
M = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = M; M.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
d = M.modifiers.new('dec', 'DECIMATE'); d.ratio = 7000 / len(M.data.polygons); d.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier='dec')
me = M.data; me.calc_loop_triangles(); uvl = me.uv_layers.active.data
co = np.array([v.co[:] for v in me.vertices]); print('dims', co.max(0) - co.min(0), 'tri', len(me.loop_triangles))
key = {}; pos = []; uvs = []; idx = []
for t in me.loop_triangles:
    for li in t.loops:
        vi = me.loops[li].vertex_index; u = uvl[li].uv; k = (vi, round(u[0], 4), round(u[1], 4))
        if k not in key: key[k] = len(pos); pos.append(co[vi]); uvs.append((u[0], 1 - u[1]))
        idx.append(key[k])
P = np.array(pos, np.float32)
# trục dài nhất = trục nòng; đầu nòng là đầu có điểm cao nhất
ax = int(np.argmax(co.max(0) - co.min(0))); c0 = (co.max(0) + co.min(0)) / 2
lo = co[co[:, ax] < c0[ax]]; hi = co[co[:, ax] > c0[ax]]
sgn = 1 if hi[:, 2].max() > lo[:, 2].max() else -1
print('trục', ax, 'đầu nòng', sgn)
# Blender (x,y,z) → three: dọc nòng → +Z, cao → +Y
L = (co.max(0) - co.min(0))[ax]; s = 3.2 / L
other = [i for i in (0, 1) if i != ax][0]
Q = np.stack([P[:, other] - c0[other], P[:, 2] - co[:, 2].min(), (P[:, ax] - c0[ax]) * sgn], 1) * s
# giữ hệ tay phải: nếu đảo dấu một trục thì đảo luôn trục ngang
if (ax == 0 and sgn < 0) or (ax == 1 and sgn > 0): Q[:, 0] *= -1
idx = np.array(idx, np.uint32)
# nếu hệ bị lật (định thức âm) thì đảo thứ tự tam giác
print('cao', Q[:, 1].max(), 'rộng', Q[:, 0].max() - Q[:, 0].min(), 'nòng z max', Q[:, 2].max(), 'y tại đầu nòng', Q[Q[:, 2] > 1.3][:, 1].mean())
b64 = lambda x: base64.b64encode(np.ascontiguousarray(x).tobytes()).decode()
out = dict(pos=b64(Q.astype(np.float32)), uv=b64(np.array(uvs, np.float32)), idx=b64(idx.astype(np.uint16)), dai=3.2, mieng=[0, float(Q[Q[:, 2] > 1.4][:, 1].mean()), float(Q[:, 2].max())])
json.dump(out, open('/home/claude/v13/goi/nv/phao.json', 'w'))
img = bpy.data.images.load(glob.glob('/home/claude/v13/in/stc/*.fbm/*basecolor.jpg')[0]); img.scale(1024, 1024); img.filepath_raw = '/home/claude/v13/goi/nv/phao.jpg'; img.file_format = 'JPEG'; bpy.context.scene.render.image_settings.quality = 82; img.save()
print('XONG', len(pos))
