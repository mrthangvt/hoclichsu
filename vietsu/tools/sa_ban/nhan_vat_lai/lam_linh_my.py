"""Lính thủy đánh bộ Mỹ 1968 (Khe Sanh): FBX Tripo đã gắn xương Mixamo (anh Thắng, 25/11/2026) → .glb có súng M16 cầm tay để nướng đám đông.
python3 lam_linh_my.py <linh.fbx> <vnch.plain.glb> <ra.glb>
- Súng: lấy Sung_M16_V2 của mẫu VNCH (Thành cổ), giữ đúng vị trí tương đối với xương bàn tay phải, co theo chiều cao người.
- Động tác lấy từ mẫu VNCH khi nướng (cùng tên xương mixamorig:, biến DONG_TAC của nuong_nvz.py).
- bpy làm thư viện, không đụng Blender đang mở của anh Thắng."""
import bpy, sys, numpy as np
from mathutils import Matrix
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
FBX, VNCH, RA = argv[:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
def caoNguoi(o):
    dg = bpy.context.evaluated_depsgraph_get(); e = o.evaluated_get(dg); m = e.to_mesh()
    z = [(o.matrix_world @ v.co).z for v in m.vertices]; e.to_mesh_clear(); return max(z) - min(z)
def nghi(arm):
    if arm.animation_data: arm.animation_data.action = None
    for pb in arm.pose.bones: pb.matrix_basis = Matrix()
    bpy.context.view_layer.update()
bpy.ops.import_scene.gltf(filepath=VNCH)
armV = next(o for o in bpy.data.objects if o.type == 'ARMATURE'); nghi(armV)
sung = bpy.data.objects['Sung_M16_V2']; nguoiV = bpy.data.objects['VNCH_V2_Nguoi']
hV = caoNguoi(nguoiV)
Bv = armV.matrix_world @ armV.data.bones['mixamorig:RightHand'].matrix_local
Rel = Bv.inverted() @ sung.matrix_world
Ws = sung.matrix_world.copy()
for o in list(bpy.data.objects):
    if o != sung: bpy.data.objects.remove(o, do_unlink=True)
for m in list(bpy.data.meshes):
    if m.users == 0: bpy.data.meshes.remove(m)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
sung.parent = None; sung.matrix_world = Ws
bpy.ops.import_scene.fbx(filepath=FBX)
armM = next(o for o in bpy.data.objects if o.type == 'ARMATURE'); nghi(armM)
for o in [armM] + list(armM.children):                                         # FBX Mixamo: xương tỉ lệ 0,01 → áp tỉ lệ để ma trận xương ra mét
    o.select_set(True)
bpy.context.view_layer.objects.active = armM
with bpy.context.temp_override(selected_editable_objects=[armM] + list(armM.children), active_object=armM):
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
nghi(armM)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
nguoiM = next(o for o in bpy.data.objects if o.type == 'MESH' and o != sung)
hM = caoNguoi(nguoiM); k = hM / hV; print('cao VNCH', round(hV, 3), 'TQLC', round(hM, 3), 'tỉ lệ', round(k, 4))
Bm = armM.matrix_world @ armM.data.bones['mixamorig:RightHand'].matrix_local
loc, rot, sca = Rel.decompose()
sung.matrix_world = Bm @ Matrix.LocRotScale(loc * k, rot, sca * k)
bpy.context.view_layer.update()
Mw = sung.matrix_world.copy(); sung.parent = armM; sung.parent_type = 'BONE'; sung.parent_bone = 'mixamorig:RightHand'; sung.matrix_world = Mw
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.name.startswith('Icosphere'): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', export_animations=False, export_skins=True)
print('xong', RA)
