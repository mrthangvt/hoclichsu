# Nguyễn Tri Phương: gắn xương và làm động tác trong Blender (bpy), rồi nướng ra goi/nv/x_ntp.json (cùng định dạng v4)
# Áo thụng che chân tay → không qua Mixamo: tự dựng bộ xương theo số đo lưới, trọng số tự động (heat), động tác đặt khoá tay.
import bpy, numpy as np, json, base64, glob, os, math, sys
from mathutils import Vector, Quaternion, Matrix
OUT = '/home/claude/v13/goi/nv/'
FBX = glob.glob('/home/claude/v13/in/ntp/*.fbx')[0]
ANH = glob.glob('/home/claude/v13/in/ntp/*.fbm/*BaseColor.png')[0]
H = 1.84            # kể cả mũ cánh chuồn
def log(*a): print('NTP', *a)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=FBX)
M = [o for o in bpy.data.objects if o.type == 'MESH'][0]
bpy.context.view_layer.objects.active = M; M.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
co = np.array([v.co[:] for v in M.data.vertices])
s = H / (co[:, 2].max() - co[:, 2].min())
cx, cy = (co[:, 0].max() + co[:, 0].min()) / 2, np.median(co[:, 1])
for v in M.data.vertices: v.co = Vector(((v.co.x - cx) * s, (v.co.y - cy) * s, (v.co.z - co[:, 2].min()) * s))
M.data.update()
co = np.array([v.co[:] for v in M.data.vertices])
log('cao', round(co[:, 2].max(), 3), 'rộng', round(co[:, 0].max() - co[:, 0].min(), 3), 'sâu', round(co[:, 1].max() - co[:, 1].min(), 3))
# hướng mặt: mẫu Tripo nhìn về −Y (như Mixamo)
# hàn + giảm lưới (áp dụng hẳn)
wd = M.modifiers.new('weld', 'WELD'); wd.merge_threshold = 0.0006
dc = M.modifiers.new('dec', 'DECIMATE'); dc.ratio = 3400 / len(M.data.polygons); dc.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier='weld'); bpy.ops.object.modifier_apply(modifier='dec')
co = np.array([v.co[:] for v in M.data.vertices]); log('đỉnh', len(co), 'mặt', len(M.data.polygons))
# ---- số đo: bàn tay = điểm xa nhất theo x, vai ~ 0,79 H thân người (bỏ mũ)
hp = 1.68                                         # chiều cao người (không mũ)
zS, zH, zK, zA = 0.815 * hp, 0.53 * hp, 0.28 * hp, 0.06 * hp
hands = {}
for sg in (1, -1):
    k = np.argmax(co[:, 0] * sg); hands[sg] = co[k]
log('tay', hands[1].round(3), hands[-1].round(3))
arm = bpy.data.objects.new('Rig', bpy.data.armatures.new('Rig')); bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; arm.select_set(True); M.select_set(False)
bpy.ops.object.mode_set(mode='EDIT'); eb = arm.data.edit_bones
def bone(n, h, t, par=None, conn=False):
    b = eb.new(n); b.head = Vector(h); b.tail = Vector(t)
    if par: b.parent = eb[par]; b.use_connect = conn
    return b
bone('Hips', (0, 0, zH), (0, 0, zH + 0.12))
bone('Spine', (0, 0, zH + 0.12), (0, 0, zS - 0.12), 'Hips', True)
bone('Chest', (0, 0, zS - 0.12), (0, 0, zS + 0.03), 'Spine', True)
bone('Neck', (0, 0, zS + 0.03), (0, -0.01, zS + 0.12), 'Chest', True)
bone('Head', (0, -0.01, zS + 0.12), (0, -0.01, H), 'Neck', True)
for sg, sd in ((1, 'L'), (-1, 'R')):
    hd = hands[sg]; sh = Vector((sg * 0.19, 0, zS - 0.02)); wr = Vector((hd[0] - sg * 0.07, hd[1], hd[2] + 0.04)); el = (sh + wr) / 2 + Vector((0, 0.03, 0))
    bone('Clav' + sd, (sg * 0.04, 0, zS - 0.02), sh[:], 'Chest')
    bone('Arm' + sd, sh[:], el[:], 'Clav' + sd, True)
    bone('Fore' + sd, el[:], wr[:], 'Arm' + sd, True)
    bone('Hand' + sd, wr[:], (wr + (wr - el).normalized() * 0.09)[:], 'Fore' + sd, True)
    bone('Leg' + sd, (sg * 0.1, 0, zH), (sg * 0.1, -0.01, zK), 'Hips')
    bone('Shin' + sd, (sg * 0.1, -0.01, zK), (sg * 0.1, 0.01, zA), 'Leg' + sd, True)
    bone('Foot' + sd, (sg * 0.1, 0.01, zA), (sg * 0.1, -0.13, 0.015), 'Shin' + sd, True)
bpy.ops.object.mode_set(mode='OBJECT')
M.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
nvg = sum(1 for v in M.data.vertices if len(v.groups) > 0); log('đỉnh có trọng số', nvg, '/', len(M.data.vertices))
if nvg < 0.9 * len(M.data.vertices):
    log('heat lỗi → dùng bao (envelope)')
    M.vertex_groups.clear(); M.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')

# ---- động tác: xoay theo trục thế giới (độ) cho từng xương, cộng dồn từ cha
REST = {b.name: b.matrix_local.copy() for b in arm.data.bones}
ORDER = [b.name for b in arm.data.bones]                     # thứ tự cha trước con
def dat_tu_the(rot):
    """rot: {xương: Quaternion thế giới (lệch so với tư thế nghỉ)}"""
    tot = {}; newM = {}
    for n in ORDER:
        b = arm.data.bones[n]; par = b.parent.name if b.parent else None
        q = rot.get(n, Quaternion())
        tq = (tot[par] @ q) if par else q; tot[n] = tq
        R0 = REST[n]; head0 = R0.to_translation()
        if par:
            Rp0 = REST[par]; head = newM[par] @ (Rp0.inverted() @ head0)
        else: head = head0
        Mn = Matrix.Translation(head) @ tq.to_matrix().to_4x4() @ R0.to_quaternion().to_matrix().to_4x4()
        newM[n] = Mn
        arm.pose.bones[n].matrix = Mn
        bpy.context.view_layer.update()
def Qa(ax, deg): return Quaternion(Vector(ax).normalized(), math.radians(deg))
X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, -1)
# tay: từ dáng chữ A hạ xuống, khép trước bụng (hai tay chắp trong tay áo)
def tay_chap(sd, k=1.0):
    sg = 1 if sd == 'L' else -1
    return {'Arm' + sd: Qa((1, 0, 0), -18 * k) @ Qa((0, 1, 0), sg * 34 * k), 'Fore' + sd: Qa((0, 0, 1), -sg * 40 * k) @ Qa((1, 0, 0), -14 * k)}
def chi_tay(k):    # tay phải giơ chỉ về phía trước
    return {'ArmR': Qa((0, 0, 1), 42 * k) @ Qa((1, 0, 0), -72 * k), 'ForeR': Qa((1, 0, 0), -6 * k)}
CLIPS = {}
def clip(name, poses, fps, once=False): CLIPS[name] = (poses, fps, once)
# đứng: thở, nghiêng đầu nhẹ (8 khung, 2 fps)
P = []
for i in range(8):
    a = 2 * math.pi * i / 8; r = {}; r.update(tay_chap('L')); r.update(tay_chap('R'))
    r['Chest'] = Qa(X, 1.2 * math.sin(a)); r['Head'] = Qa((0, 0, 1), 4 * math.sin(a)) @ Qa(X, 2 * math.sin(a + 1))
    P.append(r)
clip('dung', P, 2)
# chỉ huy: giơ tay phải chỉ, giữ, hạ (12 khung, 3 fps)
P = []
for i in range(12):
    k = [0, 0.35, 0.75, 1, 1, 1, 1, 1, 1, 0.7, 0.35, 0][i]; r = {}; r.update(tay_chap('L')); rr = tay_chap('R', 1 - k)
    for kk, v in chi_tay(k).items(): rr[kk] = v @ rr.get(kk, Quaternion())
    r.update(rr); r['Head'] = Qa((0, 0, 1), -6 * k) @ Qa(X, -3 * k); r['Chest'] = Qa((0, 0, 1), -5 * k)
    P.append(r)
clip('chihuy', P, 3)
# đi chậm (10 khung, 9 fps ~ 1,1 s/chu kỳ)
P = []
for i in range(10):
    a = 2 * math.pi * i / 10; sw = math.sin(a); r = {}; r.update(tay_chap('L')); r.update(tay_chap('R'))
    r['LegL'] = Qa(X, -16 * sw); r['LegR'] = Qa(X, 16 * sw)
    r['ShinL'] = Qa(X, 14 * max(0, math.sin(a + 1.2))); r['ShinR'] = Qa(X, 14 * max(0, math.sin(a + 1.2 + math.pi)))
    r['Hips'] = Qa((0, 0, 1), 3 * sw); r['Chest'] = Qa((0, 0, 1), -3 * sw)
    P.append(r)
clip('di', P, 9)
clip('ngam', CLIPS['chihuy'][0], 3)
# ---- nướng
def evmesh():
    dg = bpy.context.evaluated_depsgraph_get(); ev = M.evaluated_get(dg); return ev, ev.to_mesh()
ev, me = evmesh(); me.calc_loop_triangles(); uvl = me.uv_layers.active.data
key = {}; vids = []; uvs = []; idx = []
for t in me.loop_triangles:
    for li in t.loops:
        vi = me.loops[li].vertex_index; u = uvl[li].uv; kk = (vi, round(u[0], 4), round(u[1], 4))
        if kk not in key: key[kk] = len(vids); vids.append(vi); uvs.append((u[0], 1 - u[1]))
        idx.append(key[kk])
nv = len(me.vertices); ev.to_mesh_clear()
T3 = lambda a: np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1)
def grip(side):
    pb = arm.pose.bones['Hand' + side]; Mw = arm.matrix_world @ pb.matrix
    R = Mw.to_3x3(); g = R.col[0].normalized(); y = R.col[1].normalized(); p = R.col[2].normalized(); o = Mw.translation + y * 0.06
    return np.array(g), np.array(p), np.array(o)
out = {}
for name, (poses, fps, once) in CLIPS.items():
    PP = []; MG = []; MT = []
    for r in poses:
        dat_tu_the(r)
        ev, me = evmesh(); c = np.empty(nv * 3, np.float32); me.vertices.foreach_get('co', c); ev.to_mesh_clear(); c = c.reshape(-1, 3)
        c = T3(c); f0 = float(c[:, 1].min()); c[:, 1] -= f0; PP.append(c)
        g, p, o = grip('R'); o = o.copy(); o[2] -= f0; MG.append(np.concatenate([T3(g), T3(p), T3(o)]))
        g2, p2, o2 = grip('L'); o2 = o2.copy(); o2[2] -= f0; dd = o2 - o; dd /= np.linalg.norm(dd) + 1e-9
        MT.append(np.concatenate([T3(dd), T3(np.array([0, 0, -1.0])), T3(o)]))
    out[name] = dict(fps=fps, once=once, P=PP, mg=np.array(MG), mt=np.array(MT))
    log(name, len(PP), 'khung')
b64 = lambda x: base64.b64encode(np.ascontiguousarray(x).tobytes()).decode()
q = max(float(np.abs(p).max()) for c in out.values() for p in c['P']) / 32767.0
img = bpy.data.images.load(ANH); img.scale(1024, 1024); img.filepath_raw = OUT + 'x_ntp.jpg'; img.file_format = 'JPEG'; bpy.context.scene.render.image_settings.quality = 85; img.save()
J = dict(v=4, q=q, nv=nv, vids=b64(np.array(vids, np.uint16)), idx32=False, idx=b64(np.array(idx, np.uint16)), uv=b64(np.array(uvs, np.float32)), tex='x_ntp.jpg', h=H, clips={})
for k, c in out.items():
    e = dict(fps=c['fps'], pos=[b64(np.round(p / q).astype(np.int16)) for p in c['P']], mg=[round(float(x), 3) for x in c['mg'].ravel()], mt=[round(float(x), 3) for x in c['mt'].ravel()])
    J['clips'][k] = e
s2 = json.dumps(J, separators=(',', ':')); open(OUT + 'x_ntp.json', 'w').write(s2); log('x_ntp.json', len(s2) // 1024, 'KB')
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/v13/ntp_rig.blend')
