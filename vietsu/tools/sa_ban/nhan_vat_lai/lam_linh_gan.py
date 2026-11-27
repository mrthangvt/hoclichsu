"""Lính "gần" cho cú máy cận (sa bàn HCM 1975, V1.9): mẫu Thành cổ đủ lưới (21 nghìn tam giác) + động tác của mẫu QĐND, xuất GLB có xương.
python3 lam_linh_gan.py <qdvn_a|b.plain.glb> <ra.glb>   (qdnd.plain.glb ở /tmp/soi — giải nén bằng giai_nen_glb.mjs) rồi gltf-transform meshopt.
Súng xoay −114° quanh trục nòng để băng đạn quay xuống đất (giống nuong_nvz.py SUNG_XOAY=-114)."""
import bpy, sys, math
import numpy as np
from mathutils import Matrix, Vector
VAO, RA = sys.argv[1], sys.argv[2]
DT = {'dung': 'DungNgam', 'ban': 'DungBan', 'quy': 'QuyBan', 'di': 'DiCamSung_TaiCho'}
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/tmp/soi/qdnd.glb')
for a in list(bpy.data.actions):
    a.use_fake_user = True
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=VAO)
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.name.startswith('Icosphere'): bpy.data.objects.remove(o, do_unlink=True)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for o in bpy.data.objects:
    if o.type == 'MESH' and o.name.startswith('Sung'):
        P_ = np.array([v.co[:] for v in o.data.vertices]); c_ = P_.mean(0); ax_ = np.linalg.svd(P_ - c_)[2][0]; ax_ = -ax_ if ax_[1] > 0 else ax_
        o.data.transform(Matrix.Translation(Vector(c_)) @ Matrix.Rotation(math.radians(-114), 4, Vector(ax_)) @ Matrix.Translation(-Vector(c_)))
giu = {v: k for k, v in DT.items()}
for a in list(bpy.data.actions):
    if a.name in giu: a.name = giu[a.name]
    else: bpy.data.actions.remove(a)
arm.animation_data_create()
for a in bpy.data.actions:
    tr = arm.animation_data.nla_tracks.new(); tr.name = a.name
    st = tr.strips.new(a.name, int(a.frame_range[0]), a)
    try:
        if len(a.slots): st.action_slot = a.slots[0]
    except Exception: pass
arm.animation_data.action = None
print('ACT', [a.name for a in bpy.data.actions])
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', export_animation_mode='NLA_TRACKS', export_force_sampling=True, export_optimize_animation_size=True)
