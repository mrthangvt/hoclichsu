# Nhân vật lai — phần cận cảnh: lưới có xương (rig Mixamo65) + bộ động tác từ kho chung → một GLB.
# Chạy (bpy làm thư viện, không mở Blender):  python3 bake_glb.py <cấu hình.json> [thư mục _KHO-CHUNG]
# rồi nén:  gltf-transform meshopt <ra>.raw.glb units/<tên>.glb
# Cấu hình: {"ten", "fbx" (lưới đã gắn xương Mixamo), "cao" (m), "tam_giac", "anh" (cạnh ảnh màu), "fps",
#            "kho" (thư mục _KHO-CHUNG), "nguon_rig" (blend có rig Mixamo65 đứng chuẩn để phát động tác kho),
#            "clip": [[tên, "DT_..." | "@rieng", f0, f1, "lap" | "mot"]], "ra" (đường dẫn .glb chưa nén)}
# Cách chuyển động tác: xoay thế giới của từng xương so với tư thế nghỉ (như bake_nn.py, xem Project › sa-ban-nhu-nguyet-1077-v1.md),
# hông KHÔNG lấy từ kho (đơn vị lẫn cm / m giữa các tệp gốc) mà đặt bằng cách hạ cho khớp thấp nhất chạm đất.
import bpy, sys, json, math, os
from mathutils import Vector, Matrix, Quaternion
C = json.load(open(sys.argv[1]))
KHO = (sys.argv[2] if len(sys.argv) > 2 else C['kho']).rstrip('/') + '/'       # thư mục _KHO-CHUNG (đối số 2 ghi đè cấu hình)
kp = lambda p: p if os.path.isabs(p) else KHO + p                                  # đường dẫn trong cấu hình tính từ _KHO-CHUNG
C['fbx'] = kp(C['fbx']); C['nguon_rig'] = kp(C['nguon_rig'])
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = C.get('fps', 30)

# ---- đích: lưới + xương
bpy.ops.import_scene.fbx(filepath=C['fbx'])
arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
me = [o for o in bpy.data.objects if o.type == 'MESH'][0]
own = arm.animation_data.action if arm.animation_data else None
arm.name = 'rig'; me.name = C['ten']
for o in list(bpy.data.objects):
    if o not in (arm, me): bpy.data.objects.remove(o, do_unlink=True)
own_src = None
if own is not None:
    own_src = arm.copy(); own_src.data = arm.data.copy(); own_src.name = 'own_src'; bpy.context.scene.collection.objects.link(own_src)
    oad = own_src.animation_data or own_src.animation_data_create(); oad.action = own
    try: oad.action_slot = own.slots[0]
    except Exception: pass
    arm.animation_data.action = None

# ---- nguồn: rig Mixamo65 đứng chuẩn + động tác kho
with bpy.data.libraries.load(C['nguon_rig']) as (s, d): d.objects = [n for n in s.objects]
src = [o for o in d.objects if o and o.type == 'ARMATURE'][0]
sc.collection.objects.link(src); SRC0 = src
can = sorted({c[1] for c in C['clip'] if c[1].startswith('DT_')})
with bpy.data.libraries.load(KHO + 'dong-tac.blend') as (s, d): d.actions = [a for a in s.actions if a in can]
sad = src.animation_data_create()

def levels(a):
    lv = {}
    for b in a.data.bones:
        n = 0; p = b.parent
        while p: n += 1; p = p.parent
        lv.setdefault(n, []).append(b.name)
    return [lv[k] for k in sorted(lv)]
LV = levels(arm)
NGON = ('Thumb', 'Index', 'Middle', 'Ring', 'Pinky', '_End', 'HeadTop')
KEY = [b.name for b in arm.data.bones if not any(t in b.name for t in NGON)]
print('xương', len(arm.data.bones), 'khoá động tác', len(KEY))

tw = arm.matrix_world
Ht0 = tw @ arm.data.bones['mixamorig:Hips'].matrix_local
CHAM = ['mixamorig:LeftToeBase', 'mixamorig:RightToeBase', 'mixamorig:LeftFoot', 'mixamorig:RightFoot', 'mixamorig:LeftHand', 'mixamorig:RightHand',
        'mixamorig:Head', 'mixamorig:Hips', 'mixamorig:Spine2', 'mixamorig:LeftLeg', 'mixamorig:RightLeg', 'mixamorig:LeftForeArm', 'mixamorig:RightForeArm']
# độ cao: tư thế nghỉ đích → đặt khớp thấp nhất = 0 lúc nghỉ, chiều cao đo từ lưới
bb = [me.matrix_world @ Vector(v) for v in me.bound_box]; z0 = min(v.z for v in bb); H = max(v.z for v in bb) - z0
k_cao = C['cao'] / H
print('cao gốc %.3f → %.2f m (×%.4f)' % (H, C['cao'], k_cao))

def retarget(f, src=None):
    src = src or SRC0
    sc.frame_set(int(f), subframe=f - int(f))
    sw = src.matrix_world
    Hs0 = sw @ src.data.bones['mixamorig:Hips'].matrix_local
    Gi = (Ht0.to_quaternion() @ Hs0.to_quaternion().inverted()).inverted()
    for pb in arm.pose.bones: pb.location = (0, 0, 0); pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0)
    bpy.context.view_layer.update()
    for lv in LV:
        for n in lv:
            if n not in src.pose.bones or any(t in n for t in NGON): continue
            sp, tp = src.pose.bones[n], arm.pose.bones[n]
            Ms, Ms0 = sw @ sp.matrix, sw @ src.data.bones[n].matrix_local
            Mt0 = tw @ arm.data.bones[n].matrix_local
            Rq = Ms.to_quaternion() @ Ms0.to_quaternion().inverted() @ Gi @ Mt0.to_quaternion()
            pos = (tw @ tp.matrix).translation
            tp.matrix = tw.inverted() @ (Matrix.Translation(pos) @ (Rq.to_matrix() @ Matrix.Diagonal(Mt0.to_scale())).to_4x4())
        bpy.context.view_layer.update()

def ground():
    # hạ / nâng hông để khớp thấp nhất chạm đất (z của tư thế nghỉ)
    zs = [(tw @ arm.pose.bones[n].head).z for n in CHAM if n in arm.pose.bones]
    dz = z0 + 0.035 / k_cao - min(zs)
    hp = arm.pose.bones['mixamorig:Hips']
    M = tw @ hp.matrix; M = Matrix.Translation((0, 0, dz)) @ M
    hp.matrix = tw.inverted() @ M
    bpy.context.view_layer.update()

def key(act_name, frames, from_own=None, src_rig=None):
    act = bpy.data.actions.new(act_name)
    ad = arm.animation_data or arm.animation_data_create(); ad.action = act
    for i, f in enumerate(frames):
        if from_own is not None:
            retarget(f, src_rig or own_src); ground()
        else:
            retarget(f); ground()
        for n in KEY:
            pb = arm.pose.bones[n]
            pb.keyframe_insert('rotation_quaternion', frame=i + 1)
            if n == 'mixamorig:Hips': pb.keyframe_insert('location', frame=i + 1)
    for fc in getattr(act, 'fcurves', []):
        for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'
    return act

# ---- giảm lưới (trước khi gắn động tác: Weld + Decimate giữ trọng số xương)
bpy.context.view_layer.objects.active = me
for m in list(me.modifiers):
    if m.type != 'ARMATURE': me.modifiers.remove(m)
w = me.modifiers.new('Weld', 'WELD'); w.merge_threshold = 0.0004 * max(me.dimensions)
n_tri = sum(len(p.vertices) - 2 for p in me.data.polygons)
dmod = me.modifiers.new('Dec', 'DECIMATE'); dmod.ratio = min(1.0, C['tam_giac'] / n_tri)
for nm in ('Weld', 'Dec'):
    me.modifiers.move(me.modifiers.find(nm), 0 if nm == 'Weld' else 1)
    bpy.ops.object.modifier_apply(modifier=nm)
print('tam giác %d → %d' % (n_tri, sum(len(p.vertices) - 2 for p in me.data.polygons)))
# bỏ nhóm đỉnh rỗng, chuẩn hoá trọng số, tối đa 4 xương mỗi đỉnh
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.vertex_group_limit_total(limit=4); bpy.ops.object.vertex_group_normalize_all(lock_active=False)

# ---- vật liệu: một ảnh màu, cạnh C['anh']
im = [i for i in bpy.data.images if i.filepath.endswith('Color.png') or 'basecolor' in i.name.lower()][0]
im.scale(C['anh'], C['anh'])
mat = bpy.data.materials.new(C['ten']); mat.use_nodes = True
nt = mat.node_tree; bs = nt.nodes['Principled BSDF']; tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = im
nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.85; bs.inputs['Metallic'].default_value = 0
me.data.materials.clear(); me.data.materials.append(mat)

# ---- động tác
acts = []
for nm, nguon, f0, f1, kieu in C['clip']:
    step = C.get('buoc', 2)
    frames = [f0 + i * step for i in range(int((f1 - f0) / step) + 1)]
    if nguon == '@rieng':
        a = key(nm, frames, from_own=own)
    elif nguon.startswith('fbx:'):                      # động tác lấy từ một tệp FBX rig Mixamo khác (vd. bắn cung của lính Lý)
        before = set(bpy.data.objects); bpy.ops.import_scene.fbx(filepath=kp(nguon[4:]))
        new = [o for o in bpy.data.objects if o not in before]; fs = [o for o in new if o.type == 'ARMATURE'][0]
        for o in new:
            if o is not fs: bpy.data.objects.remove(o, do_unlink=True)
        a = key(nm, frames, from_own=True, src_rig=fs); bpy.data.objects.remove(fs, do_unlink=True)
    else:
        sa = bpy.data.actions[nguon]; sad.action = sa
        try: sad.action_slot = sa.slots[0]
        except Exception: pass
        a = key(nm, frames)
    a['kieu'] = kieu; a.use_fake_user = True; acts.append(a)
    print('clip', nm, nguon, len(frames), 'khung')
# ---- dọn: bỏ rig nguồn, action kho; đẩy mỗi action thành một rãnh NLA để xuất đủ
bpy.data.objects.remove(src, do_unlink=True)
if own_src: bpy.data.objects.remove(own_src, do_unlink=True)
for a in list(bpy.data.actions):
    if a not in acts: bpy.data.actions.remove(a)
ad = arm.animation_data; ad.action = None
for a in acts:
    tr = ad.nla_tracks.new(); tr.name = a.name; st = tr.strips.new(a.name, 1, a); st.name = a.name
# đổi tỉ lệ: đo ở dáng đứng (clip đầu, khung 1) → cao C['cao'] m, tâm ở gốc, chân ở z=0
import numpy as np
for tr in ad.nla_tracks: tr.mute = True
ad.action = acts[0]
try: ad.action_slot = acts[0].slots[0]
except Exception: pass
def do():
    sc.frame_set(1); bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get(); ev = me.evaluated_get(dg); mm = ev.to_mesh()
    co = np.array([me.matrix_world @ v.co for v in mm.vertices]); ev.to_mesh_clear(); return co
co = do(); k2 = C['cao'] / (co[:, 2].max() - co[:, 2].min())
arm.scale = [s * k2 for s in arm.scale]; bpy.context.view_layer.update(); co = do()
arm.location.x -= (co[:, 0].max() + co[:, 0].min()) / 2; arm.location.y -= (co[:, 1].max() + co[:, 1].min()) / 2; arm.location.z -= co[:, 2].min()
co = do(); print('dáng đứng: cao %.2f, x %.2f..%.2f, y %.2f..%.2f, z %.2f' % (np.ptp(co[:, 2]), co[:, 0].min(), co[:, 0].max(), co[:, 1].min(), co[:, 1].max(), co[:, 2].min()))
ad.action = None
for tr in ad.nla_tracks: tr.mute = False
bpy.ops.export_scene.gltf(filepath=C['ra'], export_format='GLB', export_animations=True, export_animation_mode='NLA_TRACKS',
                          export_force_sampling=False, export_optimize_animation_size=True, export_def_bones=True,
                          export_image_format='JPEG', export_jpeg_quality=82, export_normals=True, export_tangents=False,
                          export_morph=False, export_skins=True, export_all_influences=False, export_apply=False)
print('xong', C['ra'], os.path.getsize(C['ra']) // 1024, 'KB')
