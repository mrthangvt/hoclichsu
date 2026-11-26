# Ngựa chiến (rig + 4 động tác của sa bàn Ngọc Hồi – Đống Đa) → goi/nv/x_ngua.json (định dạng v4 như nhân vật)
import bpy, numpy as np, json, base64, os
bpy.ops.wm.open_mainfile(filepath='/mnt/user-data/uploads/NgocHoiDongDa/gan-xuong/VoiNgua/NHDD_VoiNgua_Rig.blend')
M = bpy.data.objects['Ngua']; arm = bpy.data.objects['Rig_Ngua']
for o in list(bpy.data.objects):
    if o not in (M, arm): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
def ev():
    dg = bpy.context.evaluated_depsgraph_get(); e = M.evaluated_get(dg); return e, e.to_mesh()
e, me = ev(); me.calc_loop_triangles(); uvl = me.uv_layers.active.data
key = {}; vids = []; uvs = []; idx = []
for t in me.loop_triangles:
    for li in t.loops:
        vi = me.loops[li].vertex_index; u = uvl[li].uv; k = (vi, round(u[0], 4), round(u[1], 4))
        if k not in key: key[k] = len(vids); vids.append(vi); uvs.append((u[0], 1 - u[1]))
        idx.append(key[k])
nv = len(me.vertices); e.to_mesh_clear()
T3 = lambda a: np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1)
def co():
    e, me = ev(); c = np.empty(nv * 3, np.float32); me.vertices.foreach_get('co', c); e.to_mesh_clear(); c = c.reshape(-1, 3)
    W = np.array(M.matrix_world); return c @ W[:3, :3].T + W[:3, 3]
# hướng mặt: đầu ngựa ở phía y nào
setact = lambda a: (setattr(arm.animation_data, 'action', a), [setattr(arm.animation_data, 'action_slot', a.slots[0]) if a.slots else None])
if not arm.animation_data: arm.animation_data_create()
setact(bpy.data.actions['Ngua_dung']); sc.frame_set(1); c0 = co()
hd = c0[np.argmax(c0[:, 2])]; print('đỉnh cao nhất (đầu) y =', hd[1], 'tâm y', c0[:, 1].mean())
lat = -1 if hd[1] < c0[:, 1].mean() else 1      # đầu về −y → giữ nguyên (mặt +Z trong three)
CL = [('dung', 'Ngua_dung', 6), ('di', 'Ngua_di', 2), ('chay', 'Ngua_chay', 1)]
out = {}
for name, an, st in CL:
    a = bpy.data.actions[an]; setact(a); r0, r1 = [int(x) for x in a.frame_range]; P = []
    for f in range(r0, r1, st):
        sc.frame_set(f); c = co(); c[:, 0] -= c0[:, 0].mean(); c[:, 1] -= c0[:, 1].mean()
        if lat > 0: c[:, 0] *= -1; c[:, 1] *= -1
        c = T3(c); c[:, 1] -= c[:, 1].min(); P.append(c)
    out[name] = dict(fps=round(30 / st, 3), P=P); print(name, len(P), 'khung')
b64 = lambda x: base64.b64encode(np.ascontiguousarray(x).tobytes()).decode()
q = max(float(np.abs(p).max()) for c in out.values() for p in c['P']) / 32767.0
mat = M.data.materials[0]; img = None
for n in mat.node_tree.nodes:
    if n.type == 'TEX_IMAGE' and n.image and 'metallic' not in n.image.name and 'rough' not in n.image.name: img = n.image; break
print('ảnh', img.name)
img.filepath_raw = '/home/claude/v13/goi/nv/x_ngua.jpg'; img.file_format = 'JPEG'; sc.render.image_settings.quality = 82; img.save()
z9 = [0.0] * 9
J = dict(v=4, q=q, nv=nv, vids=b64(np.array(vids, np.uint16)), idx32=False, idx=b64(np.array(idx, np.uint16)), uv=b64(np.array(uvs, np.float32)), tex='x_ngua.jpg', h=1.88, clips={})
for k, c in out.items():
    J['clips'][k] = dict(fps=c['fps'], pos=[b64(np.round(p / q).astype(np.int16)) for p in c['P']], mg=[0, 1, 0, 0, 0, 1, 0, 1.3, 0] * len(c['P']), mt=[0, 1, 0, 0, 0, 1, 0, 1.3, 0] * len(c['P']))
s = json.dumps(J, separators=(',', ':')); open('/home/claude/v13/goi/nv/x_ngua.json', 'w').write(s); print('XONG', len(s) // 1024, 'KB')
