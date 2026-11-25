import bpy, sys, bmesh, numpy as np
from PIL import Image
f, out = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=f)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
img = None
for m in o.data.materials:
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE': img = n.image
W, H = img.size; px = np.array(img.pixels[:]).reshape(H, W, 4)
bm = bmesh.new(); bm.from_mesh(o.data); uv = bm.loops.layers.uv.active
sel = []
for fc in bm.faces:
    u = np.mean([l[uv].uv[0] for l in fc.loops]); v = np.mean([l[uv].uv[1] for l in fc.loops])
    c = px[int(np.clip(v, 0, 0.999) * H), int(np.clip(u % 1, 0, 0.999) * W), :3]
    mx, mn = c.max(), c.min(); sel.append(mn > 0.38 and (mx - mn) < 0.12)
sel = np.array(sel)
# làm mượt: mặt được chọn nếu đa số láng giềng được chọn (2 lượt)
bm.faces.ensure_lookup_table()
for _ in range(2):
    s2 = sel.copy()
    for i, fc in enumerate(bm.faces):
        nb = [g.index for e in fc.edges for g in e.link_faces if g.index != i]
        if nb: s2[i] = np.mean(sel[nb]) > 0.5
    sel = s2
C = np.array([fc.calc_center_median()[:] for fc in bm.faces])
P = C[sel]; m0 = P.mean(0); _, _, vt = np.linalg.svd(P - m0); ax = vt[0]
d = C - m0; tt = d @ ax; perp = d - np.outer(tt, ax); r = np.linalg.norm(perp, axis=1)
axz = m0[2] + tt * ax[2]; tren = C[:, 2] > axz - 0.30
sel = (sel & (r < 1.7)) | ((r < 1.45) & tren & (np.abs(tt) < 5.2))
print('trục', ax.round(3))
for i, fc in enumerate(bm.faces): fc.select = bool(sel[i])
bm.to_mesh(o.data); bm.free()
print('mặt tên lửa', sel.sum(), '/', len(sel))
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
ms = [x for x in bpy.data.objects if x.type == 'MESH']
for x in ms:
    V = np.array([v.co[:] for v in x.data.vertices]); print(x.name, len(x.data.polygons), V.min(0).round(2), V.max(0).round(2))
ms[0].name = 'be_phong'; ms[1].name = 'ten_lua'
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG')
