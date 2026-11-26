# Nướng nhân vật cho sa bàn V1.2: lưới tĩnh + 4 trọng số (chân T, chân P, tay T, tay P), tay hạ xuống, giảm lưới, ảnh màu 512.
# python3 nuong_nv.py -- <tệp> <tên> <cao m> <số tam giác> <ảnh màu>
import bpy, bmesh, sys, math, json, base64, numpy as np, mathutils
sys.path.insert(0, '/tmp'); from imp import nap
a = sys.argv[sys.argv.index('--') + 1:]
f, ten, CAO, TRI, ANH = a[0], a[1], float(a[2]), int(a[3]), a[4]
nap(f); bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
P, UV, F = [], [], []
for o in [o for o in bpy.context.scene.objects if o.type == 'MESH']:
    oe = o.evaluated_get(dg); me = oe.to_mesh(); me.transform(o.matrix_world)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.triangulate(bm, faces=bm.faces[:])
    uvl = bm.loops.layers.uv.active; base = len(P)
    for fc in bm.faces:
        ids = []
        for lp in fc.loops:
            P.append(tuple(lp.vert.co)); UV.append(tuple(lp[uvl].uv) if uvl else (0, 0)); ids.append(len(P) - 1)
        F.append(ids)
    bm.free(); oe.to_mesh_clear()
P = np.array(P, np.float64); UV = np.array(UV, np.float64); F = np.array(F)
# trục cao: trục có khoảng lớn nhất; đưa về (x phải, y lên, z trước) của three.js: nhìn về −Z
ext = P.max(0) - P.min(0); up = int(np.argmax(ext))
if up == 2: Q = np.stack([-P[:, 0], P[:, 2], P[:, 1]], 1)        # Blender Z lên, mặt nhìn −Y → three (−x, z, y)
else: Q = np.stack([-P[:, 0], P[:, 1], -P[:, 2]], 1)             # Y lên (FBX), mặt nhìn +Z → quay 180°
Q[:, 1] -= Q[:, 1].min(); s = CAO / Q[:, 1].max(); Q *= s
Q[:, 0] -= (Q[:, 0].max() + Q[:, 0].min()) / 2; Q[:, 2] -= np.median(Q[:, 2])
# kiểm tra mặt nhìn: mũi nhô về −z ở vùng đầu
head = Q[:, 1] > CAO * 0.86
if head.sum() and np.percentile(Q[head, 2], 5) > -np.percentile(Q[head, 2], 95): Q[:, 0] *= -1; Q[:, 2] *= -1
H = CAO; y = Q[:, 1]; x = Q[:, 0]; ax = np.abs(x)
# vai cố định 0,81 H; bàn tay = những điểm xa nhất theo x
x0 = 0.115 * H; ys_sh = 0.81 * H
far = ax > np.percentile(ax, 98.5); xh = float(np.median(ax[far])); yh = float(np.median(y[far]))
slope = math.degrees(math.atan2(ys_sh - yh, max(xh - x0, 0.05)))
tn = math.tan(math.radians(max(slope, 4.0)))
dd = ax - x0 - np.clip(ys_sh - y, 0, None) / tn * 0.75
armw = np.clip(dd / (0.05 * H) + 0.3, 0, 1) * (y > yh - 0.08 * H) * (y < ys_sh + 0.12 * H)
hand_far = xh
crotch = 0.47 * H
legw = np.clip((crotch + 0.03 * H - y) / (0.06 * H), 0, 1)
sideL = np.clip(0.5 - x / (0.04 * H), 0, 1)        # x<0 → trái
wLL = legw * sideL; wLR = legw * (1 - sideL)
wAL = armw * (x < 0); wAR = armw * (x > 0)
goc = math.radians(max(8.0, 90.0 - slope - 1.0))
for side, w in ((-1, wAL), (1, wAR)):
    m = w > 0
    px_, py_ = Q[m, 0] - side * x0, Q[m, 1] - ys_sh
    a_ = -side * goc * w[m]
    ca, sa = np.cos(a_), np.sin(a_)
    Q[m, 0] = side * x0 + px_ * ca - py_ * sa; Q[m, 1] = ys_sh + px_ * sa + py_ * ca
armLen = math.hypot(xh - x0, ys_sh - yh)
# giảm lưới: dựng lưới tạm trong Blender
bpy.ops.wm.read_factory_settings(use_empty=True)
me = bpy.data.meshes.new('m'); verts = [tuple(v) for v in Q]
me.from_pydata(verts, [], [tuple(t) for t in F]); me.update()
uvl = me.uv_layers.new(name='uv')
for poly in me.polygons:
    for li in poly.loop_indices: uvl.data[li].uv = UV[me.loops[li].vertex_index]
wl = me.attributes.new('w', 'FLOAT_COLOR', 'POINT')
for i in range(len(Q)): wl.data[i].color = (wLL[i], wLR[i], wAL[i], wAR[i])
ob = bpy.data.objects.new('o', me); bpy.context.scene.collection.objects.link(ob); bpy.context.view_layer.objects.active = ob
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.object.mode_set(mode='OBJECT')
r = min(1.0, TRI / max(1, len(me.polygons)))
md = ob.modifiers.new('d', 'DECIMATE'); md.ratio = r
dg = bpy.context.evaluated_depsgraph_get(); oe = ob.evaluated_get(dg); m2 = oe.to_mesh()
bm = bmesh.new(); bm.from_mesh(m2); bmesh.ops.triangulate(bm, faces=bm.faces[:])
uvl = bm.loops.layers.uv.active; wcl = bm.verts.layers.float_color.get('w')
pos, uv, ww, idx = [], [], [], []; key = {}
for fc in bm.faces:
    for lp in fc.loops:
        k = (lp.vert.index, round(lp[uvl].uv.x, 5), round(lp[uvl].uv.y, 5))
        if k not in key:
            key[k] = len(pos) // 3; c = lp.vert.co; pos += [c.x, c.y, c.z]; uv += [lp[uvl].uv.x, 1 - lp[uvl].uv.y]
            wv = lp.vert[wcl] if wcl else (0, 0, 0, 0); ww += [int(max(0, min(1, t)) * 255) for t in wv]
        idx.append(key[k])
b64 = lambda a, t: base64.b64encode(np.array(a, t).tobytes()).decode()
out = {'ten': ten, 'cao': CAO, 'vai': round(ys_sh, 3), 'hong': round(crotch + 0.03 * H, 3), 'x0': round(x0, 3), 'tay': [round(x0 + 0.03, 3), round(ys_sh - armLen * 0.92, 3), 0.05], 'doc': round(slope, 1),
       'n': len(pos) // 3, 'pos': b64(pos, np.float32), 'uv': b64(uv, np.float32), 'w': b64(ww, np.uint8), 'idx': b64(idx, np.uint16 if len(pos) // 3 < 65535 else np.uint32), 'i32': len(pos) // 3 >= 65535}
json.dump(out, open(f'/home/claude/v12/goi/nv/{ten}.json', 'w'))
from PIL import Image
im = Image.open(ANH).convert('RGB'); im.thumbnail((512, 512)); im.save(f'/home/claude/v12/goi/nv/{ten}.jpg', quality=86)
print('XONG', ten, 'tam giac', len(idx) // 3, 'dinh', len(pos) // 3, 'vai', ys_sh, 'goc', math.degrees(goc))
