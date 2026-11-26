# Đà Nẵng 1858 V1.3 · nướng nhân vật có xương (Mixamo 65) thành chuỗi khung hình (theo bake_bd.py của Bạch Đằng)
# Chạy: python3 nuong_xuong.py <ten|all>
# Ra: goi/nv/x_<ten>.json + goi/nv/x_<ten>.jpg
#  json v4: vị trí lưu theo ĐỈNH GỐC (đã hàn), uv/idx theo đỉnh tách đường may (vids → đỉnh gốc); pháp tuyến tính lại ở trình duyệt
import bpy, numpy as np, base64, json, os, sys, glob, zipfile
from mathutils import Vector
sys.path.insert(0, '/home/claude/v13/kho'); import kho
U = '/mnt/user-data/uploads/'
FX = U + 'dong-tac/_nguon_fbx/'
OUT = '/home/claude/v13/goi/nv/'
os.makedirs(OUT, exist_ok=True)
LOG = open('/home/claude/v13/nuong_log.txt', 'a')
def log(*a):
    s = ' '.join(str(x) for x in a); print(s); LOG.write(s + '\n'); LOG.flush()

NGOAI = {   # động tác ngoài kho (FBX Mixamo anh tải)
  'Rifle Idle': FX + 'Rifle Idle.fbx', 'Rifle Walk': FX + 'Rifle Walk (1).fbx', 'Slow Run': FX + 'Slow Run (1).fbx', 'Sprint Forward': FX + 'Sprint Forward.fbx',
  'Idle Aiming': FX + 'Idle Aiming.fbx', 'Aim Recoil': FX + 'Standing Aim Recoil.fbx', 'Crouch Rapid Fire': FX + 'Crouch Rapid Fire.fbx', 'Reloading': FX + 'Reloading.fbx',
  'Death Front': FX + 'Death From The Front.fbx', 'Dying': FX + 'Dying (1).fbx', 'Pointing': FX + 'Pointing.fbx', 'Happy Idle': FX + 'Happy Idle.fbx',
  'Kneel': FX + 'Rifle Crouch Walk To Kneel.fbx', 'Walk With Rifle': FX + 'Walk With Rifle.fbx',
  'Pistol Aim': U + '_KHO-CHUNG/nhan-vat/_moi/Pistol Aim.fbx', 'Waving': U + '_KHO-CHUNG/nhan-vat/_moi/Waving (1).fbx',
  'Sitting Idle': U + '_KHO-CHUNG/nhan-vat/LinhQDVN1972/Sitting Idle.fbx',
}
# clip: (tên, nguồn, khung đầu, khung cuối, bước, loop|once, {tuỳ chọn})   nguồn 'x:<tên NGOAI>' hoặc tên động tác kho
CHEO = ('cheo', 'Paddling', [(f, f, 0) for f in range(172, 218, 4)] + [(f, f, 0) for f in range(1, 35, 4)] + [(34, 172, k / 4) for k in range(1, 4)], None, 4, 'loop')
LINH = [
  ('dung', 'x:Rifle Idle', 1, 121, 15, 'loop'), ('di', 'x:Rifle Walk', 1, 40, 3, 'loop'), ('chay', 'Fast Run', 1, 17, 1, 'loop'),
  ('ngam', 'x:Idle Aiming', 1, 64, 8, 'loop'), ('ban', 'x:Aim Recoil', 1, 22, 2, 'loop'), ('quy', 'x:Crouch Rapid Fire', 1, 24, 3, 'loop'),
  ('napphao', 'x:Reloading', 1, 100, 8, 'loop'), ('chet', 'x:Death Front', 1, 104, 8, 'once'), ('ngoi', 'x:Sitting Idle', 1, 327, 40, 'loop'),
  ('vac', 'Standard Walk', 1, 36, 3, 'loop', {'arm': ('Put Back Rifle Behind Shoulder', 'Right', 'vai')}), ('khieng', 'Pull Heavy Object', 1, 34, 3, 'loop'),
  ('chihuy', 'x:Pointing', 1, 84, 7, 'loop'), ('dao', 'Digging', 1, 146, 10, 'loop'), ('cang', 'Laying Idle', 1, 376, 60, 'loop'),
]
PHAP = LINH + [CHEO, ('sungngan', 'x:Pistol Aim', 1, 214, 18, 'loop')]
DAN = [
  ('dung', 'Put Back Rifle Behind Shoulder', 100, 121, 4, 'loop'), ('di', 'Standard Walk', 1, 36, 3, 'loop'), ('chay', 'Fast Run', 1, 17, 1, 'loop'),
  ('vac', 'Standard Walk', 1, 36, 3, 'loop', {'arm': ('Put Back Rifle Behind Shoulder', 'Right', 'vai')}), ('keo', 'Pulling A Rope', 1, 121, 8, 'loop'),
  ('dao', 'Digging', 1, 146, 10, 'loop'), ('day', 'Pushing', 1, 81, 6, 'loop'), ('khieng', 'Pull Heavy Object', 1, 34, 3, 'loop'),
  ('dam', 'Standing Melee Attack Downward', 1, 69, 4, 'loop'), CHEO, ('ngoi', 'x:Sitting Idle', 1, 327, 40, 'loop'), ('vaychao', 'x:Waving', 1, 96, 8, 'loop'),
  ('chet', 'x:Death Front', 1, 104, 8, 'once'),
]
DANBINH = DAN + [('ngam', 'x:Idle Aiming', 1, 64, 8, 'loop'), ('napphao', 'x:Reloading', 1, 100, 8, 'loop'), ('quy', 'x:Crouch Rapid Fire', 1, 24, 3, 'loop')]
DANNU = [c if c[0] != 'di' else ('di', 'Female Walk', 1, 36, 3, 'loop') for c in DAN]
KHACH = [('dung', 'Put Back Rifle Behind Shoulder', 100, 121, 4, 'loop'), ('di', 'Standard Walk', 1, 36, 3, 'loop'), ('chihuy', 'x:Pointing', 1, 84, 7, 'loop'), ('nhin', 'x:Happy Idle', 1, 61, 5, 'loop')]
KHACHNU = [c if c[0] != 'di' else ('di', 'Female Walk', 1, 36, 3, 'loop') for c in KHACH]
CHARS = {
  'phap':    dict(nguon=('fbx', FX + 'Walk With Rifle.fbx'), anh=glob.glob('/home/claude/v13/in/lp/*.fbm/*BaseColor.png')[0], H=1.72, tam=3000, clips=PHAP),
  'nguyen':  dict(nguon=('fbx', '/home/claude/v13/in/lb/linh-nguyen-1858.fbx'), anh=('zip', U + '_KHO-CHUNG/nhan-vat/_moi/linh-nguyen-1858.zip'), H=1.66, tam=3000, clips=LINH),
  'dannam':  dict(nguon=('blend', 'DanMienTayNam'), anh='/tmp/danNam.png', H=1.62, tam=1500, clips=DAN),
  'dannu':   dict(nguon=('blend', 'DanMienTayNu'), anh='/tmp/danNu.png', H=1.54, tam=1500, clips=DANNU),
  'khachnam': dict(nguon=('fbx', U + '_KHO-CHUNG/nhan-vat/_moi/Waving.fbx'), anh=('zip', U + '_moi/nguyen-van-ba.zip'), H=1.68, tam=2200, clips=KHACH),
  'khachnu':  dict(nguon=('fbx', U + '_KHO-CHUNG/nhan-vat/_moi/Standing Clap.fbx'), anh=('zip', U + '_moi/nguoi-nu-sai-gon.zip'), H=1.58, tam=2200, clips=KHACHNU),
  'aodai':    dict(nguon=('fbx', U + 'dong-tac/_nguon_fbx/Standing Clap (1).fbx'), anh=('zip', U + '_KHO-CHUNG/nhan-vat/_moi/nu-ao-dai-trang.zip'), H=1.6, tam=2200, clips=KHACHNU),
  'danbinh': dict(nguon=('fbx', U + '_KHO-CHUNG/nhan-vat/DanBInhThoiLy/Crouch Idle 01.fbx'), anh=('zip', U + '_KHO-CHUNG/nhan-vat/DanBInhThoiLy/dan-binh-thoi-ly.zip'), H=1.64, tam=1500, clips=DANBINH),
}

def fcurves(a):
    out = []
    try:
        for L in a.layers:
            for st in L.strips:
                for cb in st.channelbags: out += list(cb.fcurves)
    except Exception: pass
    if not out:
        try: out = list(a.fcurves)
        except Exception: pass
    return out
def setact(arm, a):
    if not arm.animation_data: arm.animation_data_create()
    arm.animation_data.action = a
    try:
        if a.slots: arm.animation_data.action_slot = a.slots[0]
    except Exception: pass
def evmesh(M):
    dg = bpy.context.evaluated_depsgraph_get(); ev = M.evaluated_get(dg); return ev, ev.to_mesh()
def topo(M):
    ev, me = evmesh(M); me.calc_loop_triangles(); uvl = me.uv_layers.active.data
    key = {}; vids = []; uvs = []; idx = []
    for t in me.loop_triangles:
        for li in t.loops:
            vi = me.loops[li].vertex_index; u = uvl[li].uv; k = (vi, round(u[0], 4), round(u[1], 4))
            if k not in key: key[k] = len(vids); vids.append(vi); uvs.append((u[0], 1 - u[1]))
            idx.append(key[k])
    nv = len(me.vertices); ev.to_mesh_clear()
    return np.array(vids), np.array(uvs, np.float32), np.array(idx, np.uint32), nv
T3 = lambda a: np.stack([a[..., 0], a[..., 2], -a[..., 1]], -1)
def frame_co(M, S, off, nv):
    ev, me = evmesh(M); n = len(me.vertices); assert n == nv, (n, nv)
    co = np.empty(n * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3); ev.to_mesh_clear()
    W = np.array(M.matrix_world); co = co @ W[:3, :3].T + W[:3, 3]
    co[:, 0] -= off[0]; co[:, 1] -= off[1]; co *= S
    return T3(co)
def grip(arm, side, S, off):
    pb = arm.pose.bones['mixamorig:' + side + 'Hand']; Mw = arm.matrix_world @ pb.matrix
    R = Mw.to_3x3(); g = R.col[0].normalized(); y = R.col[1].normalized(); p = R.col[2].normalized(); h = Mw.translation
    o = h + y * (0.085 / S) + p * (0.03 / S); o = Vector(((o.x - off[0]) * S, (o.y - off[1]) * S, o.z * S))
    if side == 'Left': g = -g
    return np.array(g), np.array(p), np.array(o), np.array(y)
def fix_units(arm, a, hip_rest_z):
    # bỏ kênh vị trí của hông (đơn vị lẫn cm/m giữa các rig) — đặt chân chạm đất theo từng khung
    n0 = 0
    for L in getattr(a, 'layers', []):
        for st in L.strips:
            for cb in st.channelbags:
                for fc in list(cb.fcurves):
                    if fc.data_path.endswith('.location') or fc.data_path.endswith('.scale'): cb.fcurves.remove(fc); n0 += 1
    # xoay hông bù chênh lệch tư thế nghỉ của xương hông (rig có xương hông nghỉ ≠ đơn vị, vd. FBX Mixamo kèm da của lính Pháp)
    Cq = arm.data.bones['mixamorig:Hips'].matrix_local.to_quaternion().inverted()
    if abs(Cq.w) < 0.9999:
        q4 = [None] * 4
        for fc in fcurves(a):
            if fc.data_path == 'pose.bones["mixamorig:Hips"].rotation_quaternion': q4[fc.array_index] = fc
        if all(q4):
            from mathutils import Quaternion
            n = len(q4[0].keyframe_points)
            for k in range(n):
                q = Quaternion([q4[i].keyframe_points[k].co.y for i in range(4)]); q2 = Cq @ q
                for i in range(4):
                    kp = q4[i].keyframe_points[k]; kp.co.y = q2[i]; kp.handle_left.y = q2[i]; kp.handle_right.y = q2[i]
            log('   bù xoay hông', a.name)
    return
    setact(arm, a); bpy.context.scene.frame_set(int(a.frame_range[0]))
    hz = (arm.matrix_world @ arm.pose.bones['mixamorig:Hips'].head).z
    r = hz / hip_rest_z if hip_rest_z else 1; f = 1.0
    if r < 0.02: f = 100.0
    elif r > 20: f = 0.01
    if f != 1.0:
        for fc in fcurves(a):
            if fc.data_path.endswith('location'):
                for kp in fc.keyframe_points: kp.co.y *= f; kp.handle_left.y *= f; kp.handle_right.y *= f
        log('   sửa đơn vị', a.name, 'x', f)
def arm_chain(arm, side):
    if side == 'Both': return arm_chain(arm, 'Left') + arm_chain(arm, 'Right')
    return [pb for pb in arm.pose.bones if pb.name.startswith('mixamorig:' + side) and any(k in pb.name for k in ('Shoulder', 'Arm', 'Hand'))]
def arm_override(arm, a, src, side, how):
    sc = bpy.context.scene; setact(arm, src); r0, r1 = [int(x) for x in src.frame_range]; best = None
    for f in range(r0, r1 + 1):
        sc.frame_set(f); M = arm.matrix_world; sd = 'Right' if side == 'Both' else side
        sh = M @ arm.pose.bones['mixamorig:' + sd + 'Arm'].head; hd = M @ arm.pose.bones['mixamorig:' + sd + 'Hand'].head
        hp = M @ arm.pose.bones['mixamorig:Hips'].head; hh = (M @ arm.pose.bones['mixamorig:Head'].head - hp).length
        score = (hd - (sh + Vector((0, 0, 0.12 * hh)))).length
        if best is None or score < best[0]: best = (score, f)
    sc.frame_set(best[1]); chain = arm_chain(arm, side)
    pose = {pb.name: (pb.rotation_mode, tuple(pb.rotation_quaternion), tuple(pb.rotation_euler)) for pb in chain}
    a2 = a.copy(); names = set(pose)
    for L in getattr(a2, 'layers', []):
        for st in L.strips:
            for cb in st.channelbags:
                for fc in list(cb.fcurves):
                    if any('"' + n + '"' in fc.data_path for n in names) and 'rotation' in fc.data_path: cb.fcurves.remove(fc)
    setact(arm, a2)
    for pb in chain:
        m, q, e = pose[pb.name]; pb.rotation_mode = m; pb.rotation_quaternion = q; pb.rotation_euler = e
    return a2

def nap_ngoai(ten):
    """nạp action từ một FBX Mixamo rời, xoá vật thể kèm theo"""
    truoc = set(bpy.data.objects); acts0 = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=NGOAI[ten])
    moi = [a for a in bpy.data.actions if a not in acts0]
    for o in list(bpy.data.objects):
        if o not in truoc: bpy.data.objects.remove(o, do_unlink=True)
    a = moi[0]; a.name = 'X_' + ten; a.use_fake_user = True
    return a

def anh_mau(spec, web):
    dst = OUT + 'x_' + web + '.jpg'
    if isinstance(spec, tuple):
        with zipfile.ZipFile(spec[1]) as z:
            n = [n for n in z.namelist() if n.lower().endswith(('_basecolor.jpg', '_basecolor.png', 'basecolor.png', '/color.png')) and '__MACOSX' not in n][0]
            tmp = '/tmp/_mau_' + web + os.path.splitext(n)[1]; open(tmp, 'wb').write(z.read(n)); spec = tmp
    img = bpy.data.images.load(spec); img.scale(1024, 1024); img.filepath_raw = dst; img.file_format = 'JPEG'
    bpy.context.scene.render.image_settings.quality = 82; img.save()
    return 'x_' + web + '.jpg'

def bake_char(web):
    C = CHARS[web]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.fps = 30
    if C['nguon'][0] == 'fbx': bpy.ops.import_scene.fbx(filepath=C['nguon'][1])
    else: kho.nhan_vat(C['nguon'][1])
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    M = max([o for o in bpy.data.objects if o.type == 'MESH'], key=lambda o: len(o.data.vertices))
    for o in bpy.data.objects:
        if o.type == 'MESH' and o != M: bpy.data.objects.remove(o, do_unlink=True)
    tex = anh_mau(C['anh'], web)
    hip_rest_z = 1.0
    kho_ten = [c[1] for c in C['clips'] if not c[1].startswith('x:')] + [c[6]['arm'][0] for c in C['clips'] if len(c) > 6 and 'arm' in c[6]]
    acts = kho.nap_dong_tac(kho_ten)
    for c in C['clips']:
        if c[1].startswith('x:') and ('X_' + c[1][2:]) not in bpy.data.actions: nap_ngoai(c[1][2:])
    # đo chiều cao ở dáng đứng của clip đầu
    c0 = C['clips'][0]; a0c = bpy.data.actions.get('X_' + c0[1][2:]) if c0[1].startswith('x:') else acts.get(kho.chuan(c0[1]))
    fix_units(arm, a0c, 1); setact(arm, a0c); sc.frame_set(c0[2]); bpy.context.view_layer.update()
    ev, me = evmesh(M); W = M.matrix_world; zs = [(W @ v.co).z for v in me.vertices]; ntam = len(me.polygons); ev.to_mesh_clear()
    S = C['H'] / (max(zs) - min(zs)); zmin = min(zs)
    log(web, 'cao gốc', round(max(zs) - min(zs), 3), 'S', round(S, 4), 'mặt', ntam)
    wd = M.modifiers.new('weld', 'WELD'); wd.merge_threshold = 0.0005 / (S * M.matrix_world.to_scale()[0])
    d = M.modifiers.new('dec', 'DECIMATE'); d.ratio = min(1, C['tam'] / max(ntam, 1)); d.use_collapse_triangulate = True
    M.modifiers.move(M.modifiers.find('weld'), 0); M.modifiers.move(M.modifiers.find('dec'), 1)
    vids, uvs, idx, nv = topo(M)
    log('  đỉnh gốc', nv, 'đỉnh uv', len(uvs), 'tam giác', len(idx) // 3)
    out = {}; fixed = {a0c.name}
    for clip in C['clips']:
        name, dt, a0, a1, step, mode = clip[:6]; opt = clip[6] if len(clip) > 6 else {}
        a = bpy.data.actions.get('X_' + dt[2:]) if dt.startswith('x:') else acts.get(kho.chuan(dt))
        if a is None: log('  thiếu động tác', dt); continue
        if a.name not in fixed: fix_units(arm, a, hip_rest_z); fixed.add(a.name)
        if 'arm' in opt:
            src = acts.get(kho.chuan(opt['arm'][0]))
            if src.name not in fixed: fix_units(arm, src, hip_rest_z); fixed.add(src.name)
            a = arm_override(arm, a, src, opt['arm'][1], opt['arm'][2])
        setact(arm, a)
        once = mode == 'once'; spec = a0 if isinstance(a0, list) else None
        r1 = int(a.frame_range[1])
        if spec: frames = sorted(set([x[0] for x in spec] + [x[1] for x in spec]))
        else:
            a1 = min(a1, r1); frames = list(range(a0, a1 + 1, step)) if once else list(range(a0, a1, step))
            if once and frames[-1] != a1: frames.append(a1)
            if not frames: frames = [a0]
        sc.frame_set(frames[0]); hip = arm.pose.bones['mixamorig:Hips']; h0 = arm.matrix_world @ hip.head
        P = []; MG = []; MT = []
        for fr in frames:
            sc.frame_set(fr); hw = arm.matrix_world @ hip.head
            off = (h0.x, h0.y) if once else (hw.x, hw.y)
            co = frame_co(M, S, off, nv); co[:, 1] -= zmin * S; P.append(co)
            g, p, o, y = grip(arm, 'Right', S, off); o = o.copy(); o[2] -= zmin * S
            MG.append(np.concatenate([T3(g), T3(p), T3(o)]))
            g2, p2, o2, y2 = grip(arm, 'Left', S, off); o2 = o2.copy(); o2[2] -= zmin * S
            dd = o2 - o; dd /= (np.linalg.norm(dd) + 1e-9); up = np.array([0, 0, 1.0]); pp = -(up - up.dot(dd) * dd); pp /= (np.linalg.norm(pp) + 1e-9)
            MT.append(np.concatenate([T3(dd), T3(pp), T3(o)]))
        if spec:
            ix = {f: k for k, f in enumerate(frames)}; mix = lambda L, a, b, w: L[ix[a]] * (1 - w) + L[ix[b]] * w
            P = [mix(P, a, b, w) for a, b, w in spec]; MG = [mix(MG, a, b, w) for a, b, w in spec]; MT = [mix(MT, a, b, w) for a, b, w in spec]
        foot = 0
        for c, m, m2 in zip(P, MG, MT):
            f0 = float(c[:, 1].min()); c[:, 1] -= f0; m[7] -= f0; m2[7] -= f0
            foot = min(foot, f0)
        out[name] = dict(fps=round(30 / step, 3), once=once, P=P, mg=np.array(MG), mt=np.array(MT))
        log('  ', name, dt, len(P), 'khung', 'hạ chân', round(foot, 3), 'cao', round(max(float(c[:, 1].max()) for c in P), 3))
    b64 = lambda x: base64.b64encode(np.ascontiguousarray(x).tobytes()).decode()
    q = max(float(np.abs(p).max()) for c in out.values() for p in c['P']) / 32767.0
    big = len(uvs) > 65535
    J = dict(v=4, q=q, nv=int(nv), vids=b64(vids.astype(np.uint16)), idx32=big, idx=b64(idx.astype(np.uint32 if big else np.uint16)), uv=b64(uvs.astype(np.float32)), tex=tex, h=C['H'], clips={})
    for k, c in out.items():
        e = dict(fps=c['fps'], pos=[b64(np.round(p / q).astype(np.int16)) for p in c['P']], mg=[round(float(x), 3) for x in c['mg'].ravel()], mt=[round(float(x), 3) for x in c['mt'].ravel()])
        if c['once']: e['once'] = 1
        J['clips'][k] = e
    s = json.dumps(J, separators=(',', ':')); fn = 'x_' + web + '.json'
    open(OUT + fn, 'w').write(s)
    log(fn, len(s) // 1024, 'KB · khung', sum(len(c['P']) for c in out.values()))

args = sys.argv[1:] or ['all']
for w in (CHARS if args[0] == 'all' else args):
    try: bake_char(w)
    except Exception:
        import traceback; log('LỖI', w, traceback.format_exc())
log('XONG')
