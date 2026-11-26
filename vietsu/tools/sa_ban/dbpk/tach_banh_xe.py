"""Tách bánh xe khỏi lưới Tripo liền khối để bánh quay được trong sa bàn (mẫu đã nướng bằng bake_vat.py: mũi xe −Y Blender, đất z = 0).
python3 tach_banh_xe.py <vào.raw.glb> <ra.raw.glb> oto|xedap
- oto: bánh = mặt màu tối (lốp) thấp hơn 1,2 m; gom cụm theo trục dọc xe (Y) và hai bên (X); mỗi bánh lấy mọi mặt trong hình trụ quanh tâm.
- xedap: hai bánh mảnh ở giữa (|x| nhỏ), trước (y < 0) và sau (y > 0).
Mỗi bánh thành một đối tượng 'banh_<i>' có gốc ở tâm trục — three.js quay quanh trục X cục bộ: rotation.x = quãng đường / bán kính."""
import bpy, sys, bmesh, numpy as np
vao, ra, kieu = sys.argv[-3], sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=vao)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
img = None
for m in o.data.materials:
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE': img = n.image
W, H = img.size; px = np.array(img.pixels[:]).reshape(H, W, 4)
bm = bmesh.new(); bm.from_mesh(o.data); uv = bm.loops.layers.uv.active; bm.faces.ensure_lookup_table()
C = np.array([f.calc_center_median()[:] for f in bm.faces])
col = []
for f in bm.faces:
    u = np.mean([l[uv].uv[0] for l in f.loops]); v = np.mean([l[uv].uv[1] for l in f.loops]); col.append(px[int(np.clip(v, 0, .999) * H), int(np.clip(u % 1, 0, .999) * W), :3])
col = np.array(col); toi = col.max(1) < 0.22
cum = []
if kieu == 'oto':   # xe 3 cầu (ZIL-131 / TZM): một cầu trước, hai cầu sau sát nhau — tách theo khoảng trống lớn nhất giữa cầu trước và cụm sau, cụm sau chia đôi
    sel = toi & (C[:, 2] < 1.25)
    for side in (-1, 1):
        S = sel & (np.sign(C[:, 0]) == side) & (np.abs(C[:, 0]) > 0.5)
        ys = np.sort(C[S, 1]); gaps = np.diff(ys); k = int(np.argmax(gaps)); cat = (ys[k] + ys[k + 1]) / 2
        truoc = S & (C[:, 1] < cat); sau = S & (C[:, 1] >= cat); ms = np.median(C[sau, 1])
        for G in (truoc, sau & (C[:, 1] < ms), sau & (C[:, 1] >= ms)):
            z0, z1 = C[G, 2].min(), C[G, 2].max(); r = (z1 - z0) / 2; yc = float((C[G, 1].min() + C[G, 1].max()) / 2); xs = C[G, 0]
            cum.append(dict(c=(float(np.median(xs)), yc, (z0 + z1) / 2), r=r, x0=(xs.min() - 0.08) if side > 0 and False else (min(xs.min() - 0.08, -0.45) if side < 0 else 0.45), x1=(-0.45 if side < 0 else xs.max() + 0.08)))
else:
    S = toi & (np.abs(C[:, 0]) < 0.07) & (C[:, 2] < 0.8)
    for sg in (-1, 1):
        G = S & (np.sign(C[:, 1]) == sg) & (np.abs(C[:, 1]) > 0.25)
        y0, y1 = C[G, 1].min(), C[G, 1].max(); z0, z1 = C[G, 2].min(), C[G, 2].max()
        cum.append(dict(c=(0.0, (y0 + y1) / 2, (z0 + z1) / 2), r=max(y1 - y0, z1 - z0) / 2, x0=-0.07, x1=0.07))
print('bánh', [[round(v, 3) for v in k['c']] + [round(k['r'], 3), round(k['x0'], 2), round(k['x1'], 2)] for k in cum])
bm.free()
for i, k in enumerate(cum):   # chọn lại theo hình học trên lưới hiện tại (thứ tự mặt đổi sau mỗi lần tách)
    cx, cy, cz = k['c']
    bm = bmesh.new(); bm.from_mesh(o.data)
    for f in bm.faces:
        c = f.calc_center_median(); f.select = bool(np.hypot(c.y - cy, c.z - cz) < k['r'] * (1.08 if kieu == 'oto' else 1.0) and k['x0'] <= c.x <= k['x1'])
    bm.to_mesh(o.data); bm.free()
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
    moi = [x for x in bpy.data.objects if x.type == 'MESH' and x is not o and not x.name.startswith('banh_')][0]
    moi.name = f'banh_{i}'
    bpy.ops.object.select_all(action='DESELECT'); moi.select_set(True); bpy.context.view_layer.objects.active = moi
    bpy.context.scene.cursor.location = k['c']; bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
if kieu == 'xedap':   # áo sơ mi trắng của người đi xe đạp tách riêng ('ao') để đổi màu áo từng người
    def mau_mat(f):
        u = np.mean([l[uv2].uv[0] for l in f.loops]); v = np.mean([l[uv2].uv[1] for l in f.loops]); return px[int(np.clip(v, 0, .999) * H), int(np.clip(u % 1, 0, .999) * W), :3]
    bm = bmesh.new(); bm.from_mesh(o.data); uv2 = bm.loops.layers.uv.active
    for f in bm.faces:
        c = f.calc_center_median(); m = mau_mat(f); f.select = bool(0.95 < c.z < 1.6 and m.min() > 0.45 and m.max() - m.min() < 0.12)
    bm.to_mesh(o.data); bm.free()
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
    ao = [x for x in bpy.data.objects if x.type == 'MESH' and x is not o and not x.name.startswith('banh_')][0]; ao.name = 'ao'
    print('áo', len(ao.data.polygons), 'mặt')
o.name = 'than'
bpy.ops.export_scene.gltf(filepath=ra, export_format='GLB', export_image_format='JPEG')
print('xong', len(cum), 'bánh')
