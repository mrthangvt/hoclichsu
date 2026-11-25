"""Chuyển động tác Mixamo (FBX "without skin") sang một nhân vật có xương mixamorig (FBX Tripo/Mixamo hoặc .glb Thành cổ), canh lại súng cầm tay,
xuất một .glb có lưới + xương + súng + các động tác đã đổi tên — rồi nướng bằng nuong_nvz.py như cũ.

python3 chuyen_dong_tac.py <nhân vật .fbx|.glb> <ra.glb> <thư mục FBX động tác> ten=Tệp.fbx[:tc] ... [--sung <mẫu có súng .glb> <động tác ngắm gốc> <tên lưới súng>] [--ngam ten]
  ten=Tệp.fbx      động tác sẽ mang tên `ten` trong .glb ra
  :tc              "tại chỗ": bỏ dịch chuyển ngang của hông (động tác chạy, đi có dời gốc của Mixamo)
  --sung           lấy súng (vd. Sung_M16_V2 của vnch.glb) gắn vào bàn tay phải; khi nhân vật đã có súng gắn xương thì chỉ canh lại
  --ngam ten       động tác dùng để canh súng (mặc định 'ngam'): súng đặt sao cho tay phải ở báng, nòng hướng về tay trái giống hệt
                   tư thế ngắm gốc của mẫu có súng (đo trên <động tác ngắm gốc>), độ xoay quanh nòng giữ theo hướng lên trời.

Cách đổi (không phụ thuộc trục xương của từng phần mềm):
  - đưa hai bộ xương về cùng hướng mặt (xoay quanh trục đứng) và cùng "tư thế chữ T" (mỗi xương của nhân vật xoay tối thiểu cho trùng hướng
    xương nguồn lúc nghỉ — nhân vật Tripo đứng chữ A vẫn dùng được động tác chữ T của Mixamo);
  - mỗi khung: hướng xoay thế giới của xương nguồn so với lúc nghỉ → áp cùng độ xoay lên xương nhân vật; hông dời theo tỉ lệ chiều cao hông.
bpy làm thư viện (không mở Blender đang chạy của anh Thắng)."""
import bpy, sys, os, math
from mathutils import Matrix, Vector, Quaternion
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
VAO, RA, THU_MUC = argv[0], argv[1], argv[2]
CLIP, SUNG, NGAM = [], None, 'ngam'
i = 3
while i < len(argv):
    a = argv[i]
    if a == '--sung': SUNG = argv[i + 1:i + 4]; i += 4; continue
    if a == '--ngam': NGAM = argv[i + 1]; i += 2; continue
    ten, _, r = a.partition('='); p = r.split(':'); CLIP.append((ten, p[0], 'tc' in p[1:])); i += 1

bpy.ops.wm.read_factory_settings(use_empty=True)
def nhap(f):
    truoc = set(bpy.data.objects)
    (bpy.ops.import_scene.fbx if f.lower().endswith('.fbx') else bpy.ops.import_scene.gltf)(filepath=f)
    return [o for o in bpy.data.objects if o not in truoc]
def ap_bien(arm):                                                              # đưa xương về ma trận đơn vị (FBX Mixamo: tỉ lệ 0,01, xoay 90°)
    obs = [arm] + [o for o in bpy.data.objects if o.parent == arm]
    for o in bpy.data.objects: o.select_set(o in obs)
    bpy.context.view_layer.objects.active = arm
    with bpy.context.temp_override(selected_editable_objects=obs, active_object=arm, object=arm):
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
def nghi(arm):
    if arm.animation_data: arm.animation_data.action = None
    for pb in arm.pose.bones: pb.matrix_basis = Matrix()
    bpy.context.view_layer.update()
def dung_thang(arm):                                                           # có mẫu xuất trục Y lên: xoay cho đầu lên trên
    nghi(arm); M = arm.matrix_world
    h = M @ arm.data.bones['mixamorig:Head'].head_local; c = M @ arm.data.bones['mixamorig:Hips'].head_local
    d = (h - c).normalized()
    if d.z < 0.9:
        q = d.rotation_difference(Vector((0, 0, 1))); arm.matrix_world = q.to_matrix().to_4x4() @ arm.matrix_world; bpy.context.view_layer.update()
def rq(M): return M.to_3x3().normalized().to_quaternion()                     # hướng xoay của ma trận có tỉ lệ
def mat_truoc(arm):                                                            # hướng mặt (ngang): trục đứng × (vai phải − vai trái)
    M = arm.matrix_world; r = (M @ arm.data.bones['mixamorig:RightArm'].head_local) - (M @ arm.data.bones['mixamorig:LeftArm'].head_local)
    f = Vector((0, 0, 1)).cross(r); f.z = 0; return f.normalized()

# ---------------------------------------------------------------- nhân vật
moi = nhap(VAO)
ARM = next(o for o in moi if o.type == 'ARMATURE')
for o in moi:
    if o.type == 'MESH' and o.name.startswith('Icosphere'): bpy.data.objects.remove(o, do_unlink=True)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
dung_thang(ARM); ap_bien(ARM); nghi(ARM)
TEN = [b.name for b in ARM.data.bones]
REST = {b.name: b.matrix_local.copy() for b in ARM.data.bones}                 # ma trận nghỉ (hệ xương = thế giới vì đã áp biến)
fT = mat_truoc(ARM); hipT = REST['mixamorig:Hips'].translation.z
print('nhân vật', ARM.name, len(TEN), 'xương · mặt', tuple(round(x, 2) for x in fT), '· hông cao', round(hipT, 3))

# súng: luôn chép từ mẫu có súng (súng cũ của nhân vật, nếu có, bỏ đi) — điểm báng, hướng nòng đo trên lưới súng của mẫu
sung, G_SUNG = None, None
if SUNG:
    mau, act_goc, ten_sung = SUNG
    mm = nhap(mau); armM = next(o for o in mm if o.type == 'ARMATURE'); sM = next(o for o in mm if o.name.startswith(ten_sung))
    nghi(armM); hipM = (armM.matrix_world @ armM.data.bones['mixamorig:Hips'].head_local).z
    A = bpy.data.actions.get(act_goc); armM.animation_data_create(); armM.animation_data.action = A
    try: armM.animation_data.action_slot = A.slots[0]
    except Exception: pass
    bpy.context.scene.frame_set(int(sum(A.frame_range) / 2)); bpy.context.view_layer.update()
    W = sM.matrix_world.copy(); Wi = W.inverted()
    rh = armM.matrix_world @ armM.pose.bones['mixamorig:RightHand'].head; lh = armM.matrix_world @ armM.pose.bones['mixamorig:LeftHand'].head
    import numpy as np
    V = np.array([v.co[:] for v in sM.data.vertices]); c_ = V.mean(0); ax = np.linalg.svd(V - c_)[2][0]            # trục nòng = trục dài nhất của lưới súng
    g_ = np.array((Wi @ rh)[:]); pr = (V - g_) @ ax; ax = ax if pr.max() > -pr.min() else -ax                      # chiều về đầu nòng: phía xa báng hơn
    dl_ = Vector(ax.tolist()); print('súng: hướng tay trái lệch trục nòng', round(math.degrees(dl_.angle((Wi.to_3x3() @ (lh - rh)).normalized())), 1), '°')
    G_SUNG = (Wi @ rh, dl_, (Wi.to_3x3() @ Vector((0, 0, 1))).normalized())
    s0 = W.to_scale()[0]; kS = hipT / max(1e-6, hipM)
    for o in [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == ARM and o.parent_type == 'BONE']: bpy.data.objects.remove(o, do_unlink=True)
    sung = bpy.data.objects.new('Sung', sM.data.copy()); bpy.context.collection.objects.link(sung); sung.matrix_world = W
    for o in mm: bpy.data.objects.remove(o, do_unlink=True)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    print('súng chép từ', os.path.basename(mau), ten_sung, '· tỉ lệ người', round(kS, 3))

# ---------------------------------------------------------------- đổi từng động tác
def doi(ten, tep, taiCho):
    src = nhap(os.path.join(THU_MUC, tep)); S = next(o for o in src if o.type == 'ARMATURE')
    A = S.animation_data.action if S.animation_data else None
    if not A: print('không có động tác', tep); return None
    S.animation_data.action = None; dung_thang(S); nghi(S)
    Ms = S.matrix_world.copy()
    fS = mat_truoc(S); q = fS.rotation_difference(fT); Q = q.to_matrix().to_4x4()   # quay nguồn cho cùng hướng mặt
    restS = {b.name: (Q @ Ms @ b.matrix_local) for b in S.data.bones}; rS = {n: rq(m) for n, m in restS.items()}
    hipS = restS['mixamorig:Hips'].translation.z; k = hipT / max(1e-6, hipS)
    # tư thế chữ T chung: xoay tối thiểu hướng xương nhân vật cho trùng hướng xương nguồn
    REF = {}
    for n in TEN:
        Rt = rq(REST[n])
        if n in restS and n != 'mixamorig:Hips':
            b = ARM.data.bones[n]; dt = (b.tail_local - b.head_local).normalized()
            bs = S.data.bones[n]; ds = ((Q @ Ms).to_3x3() @ (bs.tail_local - bs.head_local)).normalized()
            Rt = dt.rotation_difference(ds) @ Rt
        REF[n] = Rt
    S.animation_data.action = A
    try: S.animation_data.action_slot = A.slots[0]
    except Exception: pass
    act = bpy.data.actions.new(ten); act.use_fake_user = True
    ARM.animation_data_create(); ARM.animation_data.action = act
    f0, f1 = int(A.frame_range[0]), int(A.frame_range[1]); sc = bpy.context.scene; p0 = None
    for f in range(f0, f1 + 1):
        sc.frame_set(f); bpy.context.view_layer.update()
        WS = {pb.name: (Q @ Ms @ pb.matrix) for pb in S.pose.bones}
        hp = WS['mixamorig:Hips'].translation
        if p0 is None: p0 = hp.copy()
        MW = {}
        for n in TEN:                                                           # cha trước con (thứ tự bones của Blender)
            b = ARM.data.bones[n]
            if n in WS: R = rq(WS[n]) @ rS[n].inverted() @ REF[n]
            else:                                                               # xương không có ở nguồn (ngón tay…): giữ như lúc nghỉ so với cha
                R = rq((MW[b.parent.name] if b.parent else Matrix()) @ (REST[b.parent.name].inverted() if b.parent else Matrix()) @ REST[n])
            if b.parent: t = (MW[b.parent.name] @ (REST[b.parent.name].inverted() @ REST[n])).translation
            else:
                d = (hp - p0) * k; t = REST[n].translation + Vector((0 if taiCho else d.x, 0 if taiCho else d.y, d.z))
                t.z = REST[n].translation.z + (hp.z - restS[n].translation.z) * k
            MW[n] = Matrix.Translation(t) @ R.to_matrix().to_4x4()
        for n in TEN:
            pb = ARM.pose.bones[n]; b = pb.bone
            loc = (REST[b.parent.name].inverted() @ REST[n]) if b.parent else REST[n]
            pa = MW[b.parent.name] if b.parent else Matrix()
            pb.matrix_basis = loc.inverted() @ pa.inverted() @ MW[n]
            pb.keyframe_insert('location', frame=f - f0 + 1); pb.keyframe_insert('rotation_quaternion', frame=f - f0 + 1)
    for o in src: bpy.data.objects.remove(o, do_unlink=True)
    print('động tác', ten, '←', tep, f1 - f0 + 1, 'khung', '(tại chỗ)' if taiCho else '')
    return act
for pb in ARM.pose.bones: pb.rotation_mode = 'QUATERNION'
ACTS = {}
for ten, tep, tc in CLIP:
    a = doi(ten, tep, tc)
    if a: ACTS[ten] = a
for a in list(bpy.data.actions):                                                # bỏ động tác nguồn còn sót
    if a.name not in ACTS: bpy.data.actions.remove(a)

# ---------------------------------------------------------------- canh súng theo tư thế ngắm mới
if sung is not None and G_SUNG and NGAM in ACTS:
    A = ACTS[NGAM]; ARM.animation_data.action = A; bpy.context.scene.frame_set(int(sum(A.frame_range) / 2)); bpy.context.view_layer.update()
    rh = ARM.pose.bones['mixamorig:RightHand'].head.copy(); lh = ARM.pose.bones['mixamorig:LeftHand'].head.copy()
    g, dl, ul = G_SUNG
    dw = (lh - rh).normalized(); uw = Vector((0, 0, 1)); uw = (uw - dw * uw.dot(dw)).normalized()
    ul2 = (ul - dl * ul.dot(dl)).normalized()
    Bl = Matrix((dl, ul2, dl.cross(ul2))).transposed(); Bw = Matrix((dw, uw, dw.cross(uw))).transposed()
    R = Bw @ Bl.inverted()                                                       # hệ súng → thế giới
    M = Matrix.Translation(rh) @ R.to_4x4() @ Matrix.Scale(s0 * kS, 4) @ Matrix.Translation(-g)
    Rel = ARM.pose.bones['mixamorig:RightHand'].matrix.inverted() @ M              # súng so với xương bàn tay ở tư thế ngắm
    nghi(ARM)
    sung.parent = None; sung.matrix_world = REST['mixamorig:RightHand'] @ Rel; bpy.context.view_layer.update()
    Mw = sung.matrix_world.copy(); sung.parent = ARM; sung.parent_type = 'BONE'; sung.parent_bone = 'mixamorig:RightHand'; sung.matrix_world = Mw
    print('canh súng theo', NGAM, '· tỉ lệ', round(kS, 3))
nghi(ARM)
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.name.startswith('Icosphere'): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_skins=True, export_force_sampling=True)
print('xong', RA, list(ACTS))
