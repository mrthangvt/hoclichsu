"""Nướng nhân vật có xương (.glb thường, đã giải nén bằng giai_nen_glb.mjs) thành đám đông .nvz + ảnh màu .jpg cho bộ máy sa bàn (dongTai).
python3 nuong_nvz.py <vào.plain.glb> <ra.nvz> <ra.jpg> <số tam giác> <cao m> <ten=Action:số_khung[:1 = một lần, lấy khung cuối]> ...
Ví dụ: python3 nuong_nvz.py qdnd.plain.glb linh-qgp.nvz linh-qgp.jpg 1800 1.68 dung=DungNgam:8 ban=DungBan:10 nam=NgaXuong_TaiCho:1:1
- bpy làm thư viện (không mở Blender của anh Thắng). Giảm lưới ở tư thế nghỉ rồi mới cho xương kéo (giữ trọng số), cắt theo đường nối UV.
- Toạ độ ra: Y lên, mặt nhân vật theo +Z (như các .nvz khác của bộ máy)."""
import bpy, bmesh, sys, os, json, base64, math
import numpy as np
from mathutils import Matrix
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
VAO, RA, JPG, TRI, CAO = argv[0], argv[1], argv[2], int(argv[3]), float(argv[4])
CLIP = []
for a in argv[5:]:
    ten, _, r = a.partition('='); p = r.split(':'); CLIP.append((ten, p[0], int(p[1]), len(p) > 2 and p[2] == '1'))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=VAO)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for a in list(bpy.data.actions): a.use_fake_user = True
arm.animation_data_create(); arm.animation_data.action = None
for pb in arm.pose.bones: pb.matrix_basis = Matrix()
bpy.context.view_layer.update()
mes = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]   # thân có trọng số xương
mes.sort(key=lambda o: -len(o.data.polygons)); me_o = mes[0]
PHU = []
for o in bpy.data.objects:                                                     # súng… gắn cứng vào một xương: đổi thành nhóm đỉnh của xương đó (trọng số 1)
    if o.type == 'MESH' and o.parent == arm and o.parent_type == 'BONE' and o.parent_bone:
        Mw = o.matrix_world.copy(); xb = o.parent_bone; o.parent = None; o.matrix_world = Mw
        vg = o.vertex_groups.new(name=xb); vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
        if not o.data.uv_layers: o.data.uv_layers.new(name=me_o.data.uv_layers.active.name)
        for d in o.data.uv_layers.active.data: d.uv = (264 / 512, 0.02)                    # màu súng ở dải phụ
        o.data.uv_layers.active.name = me_o.data.uv_layers.active.name
        PHU.append(o); mes.append(o)
print('phụ', [o.name for o in PHU])
for o in mes: o.select_set(True)
bpy.context.view_layer.objects.active = me_o
if len(mes) > 1:
    with bpy.context.temp_override(active_object=me_o, object=me_o, selected_objects=mes, selected_editable_objects=mes): bpy.ops.object.join()
print('lưới', me_o.name, len(me_o.data.polygons))
tri0 = sum(len(p.vertices) - 2 for p in me_o.data.polygons)
dm = me_o.modifiers.new('giam', 'DECIMATE'); dm.ratio = min(1.0, TRI / max(tri0, 1))
with bpy.context.temp_override(object=me_o, active_object=me_o):
    while me_o.modifiers[0].name != 'giam': bpy.ops.object.modifier_move_up(modifier='giam')
    bpy.ops.object.modifier_apply(modifier='giam')
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
    Pw = [W @ v.co for v in me.vertices]; h0w = max(p.z for p in Pw) - min(p.z for p in Pw); s = h0w / CAO
    bn = arm.data.bones['mixamorig:RightHand']; M = arm.matrix_world @ bn.matrix_local
    H = M.translation; X = M.col[0].xyz.normalized(); Y = M.col[1].xyz.normalized(); Z = M.col[2].xyz.normalized()
    bm = bmesh.new(); uvb = bm.loops.layers.uv.new(uvn)
    def quad(a, b, c, d, u0, u1, v0, v1):
        vs = [bm.verts.new(inv @ p) for p in (a, b, c, d)]; f = bm.faces.new(vs)
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
P0, _ = khung(); h0 = P0[:, 2].max() - P0[:, 2].min(); k = CAO / h0; z0 = P0[:, 2].min(); cx, cy = P0[:, 0].mean(), P0[:, 1].mean()
q = 0.001; clips = {}
for ten, act, n, once in CLIP:
    A = bpy.data.actions.get(act)
    if not A: print('thiếu động tác', act); continue
    arm.animation_data.action = A
    try:
        if not arm.animation_data.action_slot and len(A.slots): arm.animation_data.action_slot = A.slots[0]
    except Exception: pass
    f0, f1 = A.frame_range; fs = [f1] if once else [f0 + (f1 - f0) * i / n for i in range(n)]
    pos, nor = [], []
    for f in fs:
        sc.frame_set(int(f), subframe=f - int(f)); P, N = khung()
        X = np.stack([(P[:, 0] - cx) * k, (P[:, 2] - z0) * k, -(P[:, 1] - cy) * k], 1)          # Z lên → Y lên
        Nn = np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1)
        pos.append(base64.b64encode(np.round(X / q).astype(np.int16).tobytes()).decode())
        nor.append(base64.b64encode(np.clip(np.round(Nn * 127), -127, 127).astype(np.int8).tobytes()).decode())
    dur = max(0.2, (f1 - f0) / 24.0)
    clips[ten] = {'fps': 1.0 if once else round(n / dur, 3), 'pos': pos, 'nor': nor, 'mg': [0, 0, 0]}
    if once: clips[ten]['once'] = 1
    print(ten, act, len(fs), 'khung')
J = {'q': q, 'idx': base64.b64encode(np.array(idx, np.uint16).tobytes()).decode(), 'uv': base64.b64encode(np.array(uv, np.float32).tobytes()).decode(), 'clips': clips, 'h': CAO}
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import nv_sang_nvz
out, err = nv_sang_nvz.convert(J, q); open(RA, 'wb').write(out); print('xong', RA, round(len(out) / 1e6, 2), 'MB')
