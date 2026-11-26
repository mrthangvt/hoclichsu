"""Nướng nhân vật có xương (.glb thường, đã giải nén bằng giai_nen_glb.mjs) thành đám đông .nvz + ảnh màu .jpg cho bộ máy sa bàn (dongTai).
python3 nuong_nvz.py <vào.plain.glb> <ra.nvz> <ra.jpg> <số tam giác> <cao m> <ten=Action:số_khung[:1 = một lần, lấy khung cuối]> ...
Ví dụ: python3 nuong_nvz.py qdnd.plain.glb linh-qgp.nvz linh-qgp.jpg 1800 1.68 dung=DungNgam:8 ban=DungBan:10 nam=NgaXuong_TaiCho:1:1
- bpy làm thư viện (không mở Blender của anh Thắng). Giảm lưới ở tư thế nghỉ rồi mới cho xương kéo (giữ trọng số), cắt theo đường nối UV.
- Toạ độ ra: Y lên, mặt nhân vật theo +Z (như các .nvz khác của bộ máy)."""
import bpy, bmesh, sys, os, json, base64, math
import numpy as np
from mathutils import Matrix, Vector
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
VAO, RA, JPG, TRI, CAO = argv[0], argv[1], argv[2], int(argv[3]), float(argv[4])
CLIP = []
for a in argv[5:]:
    ten, _, r = a.partition('='); p = r.split(':'); CLIP.append((ten, p[0], int(p[1]), len(p) > 2 and p[2] == '1'))
bpy.ops.wm.read_factory_settings(use_empty=True)
DT = os.environ.get('DONG_TAC')                                                # mẫu chỉ có lưới + xương (lính Thành cổ mũ tai bèo / đầu trần): lấy động tác từ mẫu khác cùng bộ xương
if DT:
    bpy.ops.import_scene.gltf(filepath=DT)
    for a in list(bpy.data.actions): a.use_fake_user = True
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=VAO)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for a in list(bpy.data.actions): a.use_fake_user = True
arm.animation_data_create(); arm.animation_data.action = None
for pb in arm.pose.bones: pb.matrix_basis = Matrix()
bpy.context.view_layer.update()
mes = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]   # thân có trọng số xương
mes.sort(key=lambda o: -len(o.data.polygons)); me_o = mes[0]
if os.environ.get('KHONG_SUNG') == '1':                                        # lính không cầm súng (kíp thao tác tên lửa, ĐBP trên không 26/11): bỏ súng gắn vào xương
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.parent == arm and o.parent_type == 'BONE': bpy.data.objects.remove(o, do_unlink=True)
PHU = []
for o in bpy.data.objects:                                                     # súng… gắn cứng vào một xương: đổi thành nhóm đỉnh của xương đó (trọng số 1)
    if o.type == 'MESH' and o.parent == arm and o.parent_type == 'BONE' and o.parent_bone:
        if os.environ.get('SUNG_XOAY'):                                          # xoay súng quanh trục nòng (độ) — mẫu Thành cổ: băng đạn quay ngang, cần quay xuống đất (anh Thắng 24/11)
            P_ = np.array([v.co[:] for v in o.data.vertices]); c_ = P_.mean(0); ax_ = np.linalg.svd(P_ - c_)[2][0]; ax_ = -ax_ if ax_[1] > 0 else ax_   # chiều trục cố định (mẫu Thành cổ: nòng theo −Y cục bộ)
            o.data.transform(Matrix.Translation(Vector(c_)) @ Matrix.Rotation(math.radians(float(os.environ['SUNG_XOAY'])), 4, Vector(ax_)) @ Matrix.Translation(-Vector(c_)))
        Mw = o.matrix_world.copy(); xb = o.parent_bone; o.parent = None; o.matrix_world = Mw
        vg = o.vertex_groups.new(name=xb); vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
        if not o.data.uv_layers: o.data.uv_layers.new(name=me_o.data.uv_layers.active.name)
        for d in o.data.uv_layers.active.data: d.uv = (264 / 512, 0.02)                    # màu súng ở dải phụ
        o.data.uv_layers.active.name = me_o.data.uv_layers.active.name
        PHU.append(o); mes.append(o)
print('phụ', [o.name for o in PHU])
tri0 = sum(len(p.vertices) - 2 for p in me_o.data.polygons)                    # giảm lưới THÂN trước khi ghép súng (súng ít tam giác, giảm chung thì mất hình súng)
wm = me_o.modifiers.new('han', 'WELD'); wm.merge_threshold = 1e-5                     # V1.4 (anh Thắng: lính thủng lỗ): hàn đỉnh trùng ở đường nối UV trước khi giảm lưới — không hàn thì giảm lưới xé toang đường nối
with bpy.context.temp_override(object=me_o, active_object=me_o):
    while me_o.modifiers[0].name != 'han': bpy.ops.object.modifier_move_up(modifier='han')
    bpy.ops.object.modifier_apply(modifier='han')
tri0 = sum(len(p.vertices) - 2 for p in me_o.data.polygons)
dm = me_o.modifiers.new('giam', 'DECIMATE'); dm.ratio = min(1.0, TRI / max(tri0, 1))
with bpy.context.temp_override(object=me_o, active_object=me_o):
    while me_o.modifiers[0].name != 'giam': bpy.ops.object.modifier_move_up(modifier='giam')
    bpy.ops.object.modifier_apply(modifier='giam')
for o in mes: o.select_set(True)
bpy.context.view_layer.objects.active = me_o
if len(mes) > 1:
    with bpy.context.temp_override(active_object=me_o, object=me_o, selected_objects=mes, selected_editable_objects=mes): bpy.ops.object.join()
print('lưới', me_o.name, len(me_o.data.polygons))
tm = me_o.modifiers.new('tamgiac', 'TRIANGULATE')
with bpy.context.temp_override(object=me_o, active_object=me_o):
    while me_o.modifiers[0].name != 'tamgiac': bpy.ops.object.modifier_move_up(modifier='tamgiac')
    bpy.ops.object.modifier_apply(modifier='tamgiac')
# ĐỒ CẦM TAY (CAM=co: cờ Mặt trận cán tre; CAM=hoa: bó hoa) gắn vào bàn tay phải — ảnh màu nới thêm dải 64 px phía dưới để vẽ cờ, hoa, cán
CAM = os.environ.get('CAM', '')
me = me_o.data
for p_ in me.polygons:                                                         # ảnh màu nới dải 64 px phía dưới: đỉnh thân dồn lên, đỉnh súng (uv.y 0,02) giữ ở dải
    for li in p_.loop_indices:
        d = me.uv_layers.active.data[li]
        if not (abs(d.uv[1] - 0.02) < 1e-6 and abs(d.uv[0] - 264 / 512) < 1e-6): d.uv[1] = (d.uv[1] * 512 + 64) / 576
        else: d.uv[1] = 32 / 576
if CAM:
    uvn = me.uv_layers.active.name
    W = me_o.matrix_world; inv = W.inverted()
    # vị trí, hướng bàn tay lấy ngay trên lưới (tư thế buộc xương của lưới có thể khác tư thế nghỉ của xương): tâm các đỉnh thuộc bàn tay / cẳng tay phải
    gi = {g.name: g.index for g in me_o.vertex_groups}
    def tam(ten):
        k = gi.get(ten); P_ = [W @ v.co for v in me.vertices if any(e.group == k and e.weight > 0.5 for e in v.groups)]
        return sum(P_, Vector()) / len(P_) if P_ else None
    H = tam('mixamorig:RightHand'); Fa = tam('mixamorig:RightForeArm'); Y = (H - Fa).normalized()
    Z = Y.cross(Vector((0, 0, 1))); Z = Z.normalized() if Z.length > 1e-4 else Vector((1, 0, 0)); X = Y.cross(Z).normalized()
    zz = [(W @ v.co).z for v in me.vertices]; s = (max(zz) - min(zz)) / CAO; print('đồ cầm tay: s', round(s, 4))
    bm = bmesh.new(); uvb = bm.loops.layers.uv.new(uvn)
    def quad(a, b, c, d, u0, u1, v0, v1):
        vs = [bm.verts.new(p) for p in (a, b, c, d)]; f = bm.faces.new(vs)   # toạ độ thế giới: khi ghép, Blender tự đổi về hệ của lưới thân; f = bm.faces.new(vs)
        for l, uvv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): l[uvb].uv = (uvv[0] / 512, uvv[1] / 576)
    if CAM == 'co':
        y0, y1, w = -0.10, 0.62, 0.012
        for e in (X, Z): quad(H + Y * y0 * s - e * w * s, H + Y * y0 * s + e * w * s, H + Y * y1 * s + e * w * s, H + Y * y1 * s - e * w * s, 226, 238, 4, 60)
        a0, a1, fw = 0.36, 0.62, 0.40                                  # lá cờ 0,40 × 0,26 m: trên đỏ, dưới xanh, sao vàng (cờ Mặt trận DTGPMNVN)
        quad(H + Y * a0 * s, H + Y * a0 * s + Z * fw * s, H + Y * a1 * s + Z * fw * s, H + Y * a1 * s, 1, 95, 1, 63)
    else:
        for e in (X, Z, (X + Z).normalized()):
            quad(H - e * 0.12 * s + Y * 0.02 * s, H + e * 0.12 * s + Y * 0.02 * s, H + e * 0.12 * s + Y * 0.32 * s, H - e * 0.12 * s + Y * 0.32 * s, 129, 191, 1, 63)
    om = bpy.data.meshes.new('cam'); bm.to_mesh(om); bm.free(); oo = bpy.data.objects.new('cam', om); bpy.context.collection.objects.link(oo)
    vg = oo.vertex_groups.new(name='mixamorig:RightHand'); vg.add(list(range(len(om.vertices))), 1.0, 'REPLACE')
    with bpy.context.temp_override(active_object=me_o, object=me_o, selected_objects=[me_o, oo], selected_editable_objects=[me_o, oo]): bpy.ops.object.join()
    with bpy.context.temp_override(object=me_o, active_object=me_o):
        tm2 = me_o.modifiers.new('tamgiac2', 'TRIANGULATE')
        while me_o.modifiers[0].name != 'tamgiac2': bpy.ops.object.modifier_move_up(modifier='tamgiac2')
        bpy.ops.object.modifier_apply(modifier='tamgiac2')
me = me_o.data; uvl = me.uv_layers.active.data
# đỉnh tách theo UV
key, idx, uv, vid = {}, [], [], []
for p in me.polygons:
    for li in p.loop_indices:
        v = me.loops[li].vertex_index; u = tuple(round(c, 5) for c in uvl[li].uv); k = (v, u)
        if k not in key: key[k] = len(vid); vid.append(v); uv.append((u[0], u[1]))   # three: TextureLoader flipY → v Blender dùng thẳng
        idx.append(key[k])
vid = np.array(vid); print('tam giác', len(idx) // 3, 'đỉnh', len(vid), '(gốc', tri0, ')')
# ảnh màu: ảnh đầu tiên của vật liệu
img = next((n.image for m in me.materials if m and m.use_nodes for n in m.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image), None)
if img:
    img.scale(512, 512)
    if True:
        A = np.array(img.pixels[:], np.float32).reshape(512, 512, 4); S = np.zeros((64, 512, 4), np.float32); S[..., 3] = 1
        S[:, 248:280] = (0.16, 0.13, 0.1, 1)                                                                   # súng: gỗ sẫm, thép
        yy, xx = np.mgrid[0:64, 0:512]
        S[(xx < 96) & (yy >= 32)] = (0.80, 0.08, 0.10, 1); S[(xx < 96) & (yy < 32)] = (0.05, 0.28, 0.72, 1)        # đỏ trên, xanh dưới (hàng 0 = đáy)
        ang = np.arctan2(yy - 32, xx - 48); rr = np.hypot(xx - 48, yy - 32)
        star = rr < 13 * (0.5 + 0.5 * np.abs(np.cos(2.5 * (ang - np.pi / 2)))) ** 2.2 + 4.5
        S[star & (xx < 96)] = (1.0, 0.85, 0.12, 1)
        hoa = (xx >= 128) & (xx < 192); S[hoa] = (0.18, 0.45, 0.15, 1)
        rng = np.random.default_rng(5)
        for k in range(26):
            cx, cy, r = 130 + rng.random() * 60, 4 + rng.random() * 56, 4 + rng.random() * 4; c = [(0.95, 0.2, 0.3), (1, 0.55, 0.7), (1, 0.9, 0.3), (1, 1, 0.95), (0.9, 0.1, 0.1)][k % 5]
            S[hoa & ((xx - cx) ** 2 + (yy - cy) ** 2 < r * r)] = (*c, 1)
        S[(xx >= 224) & (xx < 240)] = (0.72, 0.62, 0.42, 1)                                                     # cán tre
        B2 = np.concatenate([S, A], 0); img2 = bpy.data.images.new('ra', 512, 576); img2.pixels = B2.ravel(); img = img2
    img.filepath_raw = JPG; img.file_format = 'JPEG'; img.save()
sc = bpy.context.scene; dg = bpy.context.evaluated_depsgraph_get()
def khung():
    dg.update(); ev = me_o.evaluated_get(dg); m = ev.to_mesh(); W = me_o.matrix_world
    P = np.array([W @ v.co for v in m.vertices]); N = np.array([(W.to_3x3() @ v.normal).normalized() for v in m.vertices]); ev.to_mesh_clear()
    return P[vid], N[vid]
# chiều cao: theo tư thế nghỉ
P0, _ = khung()
A1 = bpy.data.actions.get(CLIP[0][1])                                           # đo chiều cao theo khung đầu của động tác đầu (đứng): có mẫu (dân SG) động tác co giãn khác tư thế nghỉ
if A1:
    arm.animation_data.action = A1
    try: arm.animation_data.action_slot = A1.slots[0]
    except Exception: pass
    sc0 = bpy.context.scene; sc0.frame_set(int(A1.frame_range[0])); P0, _ = khung()
h0 = P0[:, 2].max() - P0[:, 2].min(); k = CAO / h0; z0 = P0[:, 2].min(); cx, cy = P0[:, 0].mean(), P0[:, 1].mean()
print('cao gốc', round(h0, 3), '→', CAO)
q = 0.001; clips = {}
for ten, act, n, once in CLIP:
    A = bpy.data.actions.get(act)
    if not A: print('thiếu động tác', act); continue
    arm.animation_data.action = A
    try:
        if not arm.animation_data.action_slot and len(A.slots): arm.animation_data.action_slot = A.slots[0]
    except Exception: pass
    f0, f1 = A.frame_range; fs = [f1] if once else [f0 + (f1 - f0) * i / n for i in range(n)]
    pos, nor = [], []; XS = []                                                          # XS: toạ độ từng khung (đo nhịp bước chân)
    for f in fs:
        sc.frame_set(int(f), subframe=f - int(f)); P, N = khung()
        X = np.stack([(P[:, 0] - cx) * k, (P[:, 2] - z0) * k, -(P[:, 1] - cy) * k], 1)          # Z lên → Y lên
        Nn = np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1)
        if os.environ.get('SOI') and f == fs[0]:                                       # ảnh soi kiểm tra tư thế (nhìn ngang)
            from PIL import Image, ImageDraw
            im = Image.new('RGB', (240, 240), 'white'); dd = ImageDraw.Draw(im); U2 = np.array(uv)
            for i_, p_ in enumerate(X[::3]): dd.point((120 + p_[2] * 100, 220 - p_[1] * 100), fill='red' if U2[i_ * 3][1] < 64 / 576 else 'black')
            im.save(os.environ['SOI'] + '-' + ten + '.png')
        XS.append(X); pos.append(base64.b64encode(np.round(X / q).astype(np.int16).tobytes()).decode())
        nor.append(base64.b64encode(np.clip(np.round(Nn * 127), -127, 127).astype(np.int8).tobytes()).decode())
    dur = max(0.2, (f1 - f0) / 24.0)
    if len(XS) > 2:                                                                  # nhịp bước: động tác tại chỗ → bàn chân chạm đất trôi ngược ra sau với tốc độ v
        dt_ = dur / len(XS); vs = []
        for A_, B_ in zip(XS, XS[1:] + XS[:1]):
            g = (A_[:, 1] < 0.06) & (B_[:, 1] < 0.06)
            if g.sum() > 3: vs.append(-(B_[g, 2] - A_[g, 2]).mean() / dt_)
        if vs: print('nhịp bước', ten, round(float(np.median(vs)), 2), 'm/s')
    clips[ten] = {'fps': 1.0 if once else round(n / dur, 3), 'pos': pos, 'nor': nor, 'mg': [0, 0, 0]}
    if once: clips[ten]['once'] = 1
    print(ten, act, len(fs), 'khung')
J = {'q': q, 'idx': base64.b64encode(np.array(idx, np.uint16).tobytes()).decode(), 'uv': base64.b64encode(np.array(uv, np.float32).tobytes()).decode(), 'clips': clips, 'h': CAO}
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import nv_sang_nvz
out, err = nv_sang_nvz.convert(J, q); open(RA, 'wb').write(out); print('xong', RA, round(len(out) / 1e6, 2), 'MB')
