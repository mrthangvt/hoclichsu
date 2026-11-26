"""Tách cụm ăng-ten trên nóc xe ra-đa (mẫu Tripo liền khối) thành đối tượng 'ang_ten' có gốc ở trục cột để xoay tròn trong sa bàn.
python3 tach_ang_ten.py <vào.raw.glb> <ra.raw.glb> <độ cao cắt m>"""
import bpy, sys, bmesh, numpy as np
vao, ra, zc = sys.argv[-3], sys.argv[-2], float(sys.argv[-1])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=vao)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
bm = bmesh.new(); bm.from_mesh(o.data)
C = np.array([f.calc_center_median()[:] for f in bm.faces]); sel = C[:, 2] > zc
day = sel & (C[:, 2] < zc + 0.5); cx, cy = float(np.median(C[day, 0])), float(np.median(C[day, 1]))
for i, f in enumerate(bm.faces): f.select = bool(sel[i])
bm.to_mesh(o.data); bm.free()
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.separate(type='SELECTED'); bpy.ops.object.mode_set(mode='OBJECT')
a = [x for x in bpy.data.objects if x.type == 'MESH' and x is not o][0]; a.name = 'ang_ten'; o.name = 'than'
bpy.ops.object.select_all(action='DESELECT'); a.select_set(True); bpy.context.view_layer.objects.active = a
bpy.context.scene.cursor.location = (cx, cy, zc); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
bpy.ops.export_scene.gltf(filepath=ra, export_format='GLB', export_image_format='JPEG')
print('ăng-ten', sel.sum(), 'mặt, trục', round(cx, 2), round(cy, 2))
