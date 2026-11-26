"""Chuyển xe Tripo (FBX) sang GLB cho sa bàn: xoay mũi xe về −Y Blender, đặt bánh chạm đất, đổi tỉ lệ, giảm lưới, ảnh màu 1024.
python3 bake_xe.py <fbx> <ra.glb> <kiểu: tank|truck> <số đo m> <số tam giác>
tank: số đo = chiều dài thân xe (phần thấp, không tính nòng pháo); truck: chiều dài toàn xe."""
import bpy, sys, os, math, mathutils, numpy as np
from PIL import Image
fbx, out, kieu, L, ntri = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), int(sys.argv[5])
SO = sys.argv[6] if len(sys.argv) > 6 else ''        # số hiệu dán lại hai bên tháp pháo (xoá chữ máy sinh trong ảnh màu)
XOA = (kieu == 'truck' and os.environ.get('GIU_CHU') != '1') or bool(SO)                     # xe tải: xoá chữ vô nghĩa trên cửa + lốp viền trắng
import cv2
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
V = np.array([v.co[:] for v in o.data.vertices])
mn, mx = V.min(0), V.max(0); H = mx[2] - mn[2]
# trục dài là X hay Y
ax = 0 if (mx[0]-mn[0]) > (mx[1]-mn[1]) else 1
FRONT_FLIP = os.environ.get('LAT') == '1'
# đầu xe: tank = đầu có nòng pháo (đỉnh cao xa nhất theo trục dài); truck = đầu có ca-bin (phía cao hơn ở nửa trước) -> chọn theo khối lượng đỉnh trên cao
c = (mn + mx) / 2
if kieu == 'tank':
    top = V[V[:, 2] > mn[2] + 0.55 * H]
    d = top[:, ax] - c[ax]; front = 1 if d.max() > -d.min() else -1
else:
    # ca-bin: phần cao nhất (mui) nằm ở một đầu; thùng hàng thấp hơn mui ca-bin một chút -> so mật độ đỉnh rất cao
    top = V[V[:, 2] > mn[2] + 0.9 * H]
    front = 1 if (top[:, ax] - c[ax]).mean() > 0 else -1
if FRONT_FLIP: front = -front
fv = np.zeros(3); fv[ax] = front
ang = math.atan2(fv[1], fv[0]) - math.atan2(-1, 0)   # xoay để mũi xe nhìn −Y
o.data.transform(mathutils.Matrix.Rotation(-ang, 4, 'Z'))
V = np.array([v.co[:] for v in o.data.vertices]); mn, mx = V.min(0), V.max(0); H = mx[2]-mn[2]
if kieu == 'tank':
    low = V[V[:, 2] < mn[2] + 0.35 * H]           # xích + thân dưới
    cur = low[:, 1].max() - low[:, 1].min()
else:
    cur = mx[1] - mn[1]
s = L / cur
o.data.transform(mathutils.Matrix.Translation((-(mn[0]+mx[0])/2, -(mn[1]+mx[1])/2, -mn[2])))
o.data.transform(mathutils.Matrix.Scale(s, 4))
o.data.update()
t0 = sum(len(p.vertices) - 2 for p in o.data.polygons)
m = o.modifiers.new('g', 'DECIMATE'); m.ratio = min(1, ntri / t0); m.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier='g')
t1 = sum(len(p.vertices) - 2 for p in o.data.polygons)
# vật liệu: chỉ ảnh màu 1024 (jpg), nhám 0.8, kim loại 0.3
fbm = os.path.join(os.path.dirname(os.path.abspath(fbx)), [d for d in os.listdir(os.path.dirname(os.path.abspath(fbx))) if d.endswith('.fbm')][0])
src = os.path.join(fbm, 'Color.png') if os.path.exists(os.path.join(fbm, 'Color.png')) else os.path.join(fbm, 'Color.jpg')   # Tripo xuất png hoặc jpg
img = np.array(Image.open(src).convert('RGB'))
decals = []; CHIEU = False           # CHIEU: dán bằng chiếu thẳng theo trục X (mặt cong có tay nắm, móc)
if XOA:
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    mask = ((hsv[..., 2] > 150) & (hsv[..., 1] < 60)).astype(np.uint8) * 255      # chữ trắng, lốp viền trắng
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    if SO:   # vị trí chữ số cũ trên thân xe: mặt có UV rơi vào vùng chữ, nhìn sang hai bên (±X)
        Hh, Ww = mask.shape; uv = o.data.uv_layers.active.data; groups = {1: [], -1: []}
        for p in o.data.polygons:
            u = sum(uv[i].uv[0] for i in p.loop_indices) / p.loop_total; v = sum(uv[i].uv[1] for i in p.loop_indices) / p.loop_total
            px, py = int(u % 1 * Ww), int((1 - v % 1) * Hh)
            if mask[min(py, Hh-1), min(px, Ww-1)] and abs(p.normal.x) > 0.6 and p.center.z > 0.45 * (V[:, 2].max()):
                groups[1 if p.normal.x > 0 else -1].append(p)
        for sd, ps in groups.items():
            if len(ps) < 3: continue
            P = np.array([q.center[:] for q in ps]); A = np.array([q.area for q in ps])
            # cụm lớn nhất theo Y (bỏ vết trắng lẻ)
            yc = np.median(P[:, 1]); keep = np.abs(P[:, 1] - yc) < 0.9
            c = (P[keep] * A[keep, None]).sum(0) / A[keep].sum()
            # phù hiệu tròn (đỏ/vàng) cùng bên: đặt số liền phía sau phù hiệu, không đè lên
            R = []
            for p in o.data.polygons:
                if (p.normal.x > 0.6 if sd > 0 else p.normal.x < -0.6) and p.center.z > 0.45 * V[:, 2].max():
                    u = sum(uv[i].uv[0] for i in p.loop_indices) / p.loop_total; v = sum(uv[i].uv[1] for i in p.loop_indices) / p.loop_total
                    hh, ss_, vv = hsv[min(int((1 - v % 1) * Hh), Hh-1), min(int(u % 1 * Ww), Ww-1)]
                    if ss_ > 120 and vv > 110 and (hh < 12 or hh > 165 or 18 < hh < 35): R.append(p.center[:])
            if len(R) > 3:
                cr = np.median(np.array(R), 0); dy = 1 if c[1] >= cr[1] else -1
                c = np.array([c[0], cr[1] + dy * (0.30 + 0.45 + 0.04), cr[2]])
            decals.append((sd, c))
    if SO and not decals:   # xe máy sinh không có chữ số cũ (vd. PT-76): dán số giữa hai bên tháp pháo
        V2 = np.array([v.co[:] for v in o.data.vertices]); z0 = V2[:, 2].min()      # toạ độ sau khi đã đổi tỉ lệ
        T = V2[V2[:, 2] > z0 + 0.78 * (V2[:, 2].max() - z0)]
        zc = float(np.median(T[:, 2])); band = T[np.abs(T[:, 2] - zc) < 0.12]; yc = float(np.median(band[:, 1]))
        mid = band[np.abs(band[:, 1] - yc) < 0.25]
        for sd in (1, -1): decals.append((sd, np.array([mid[:, 0].max() if sd > 0 else mid[:, 0].min(), yc, zc - 0.05])))
        CHIEU = True
        print('khong co chu so cu: dan so giua thap phao')
    img = cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)
jpg = out.replace('.glb', '.jpg'); Image.fromarray(img).resize((1024, 1024), Image.LANCZOS).save(jpg, quality=88)
mat = bpy.data.materials.new(os.path.basename(out).replace('.glb', '')); mat.use_nodes = True
b = mat.node_tree.nodes['Principled BSDF']; tx = mat.node_tree.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(jpg)
mat.node_tree.links.new(tx.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = 0.8; b.inputs['Metallic'].default_value = 0.3
o.data.materials.clear(); o.data.materials.append(mat); o.name = mat.name
if SO:
    from PIL import ImageDraw, ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/freefont/FreeSansBold.ttf', 200)
    im = Image.new('RGBA', (512, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    bb = d.textbbox((0, 0), SO, font=f); d.text(((512-(bb[2]-bb[0]))/2 - bb[0], (256-(bb[3]-bb[1]))/2 - bb[1]), SO, font=f, fill=(236, 236, 230, 255))
    png = out.replace('.glb', '-so.png'); im.save(png)
    md = bpy.data.materials.new('so-hieu'); md.use_nodes = True; bd = md.node_tree.nodes['Principled BSDF']
    t2 = md.node_tree.nodes.new('ShaderNodeTexImage'); t2.image = bpy.data.images.load(png)
    md.node_tree.links.new(t2.outputs['Color'], bd.inputs['Base Color']); md.node_tree.links.new(t2.outputs['Alpha'], bd.inputs['Alpha']); bd.inputs['Roughness'].default_value = 0.85
    w, h, NX, NY = (0.62, 0.31, 18, 9) if CHIEU else (0.9, 0.45, 18, 9)
    for sd, c in decals:
        n = mathutils.Vector((sd, 0, 0)); r = mathutils.Vector((0, 0, 1)).cross(n); z = mathutils.Vector((0, 0, 1))
        cc = mathutils.Vector(c) + n * 0.25
        vs, fs, uvs = [], [], []
        for j in range(NY + 1):
            for i in range(NX + 1):
                vs.append((cc + r * w * (i / NX - .5) + z * h * (j / NY - .5))[:]); uvs.append((i / NX, j / NY))
        for j in range(NY):
            for i in range(NX):
                a = j * (NX + 1) + i; fs.append((a, a + 1, a + NX + 2, a + NX + 1))
        me = bpy.data.meshes.new('so'); me.from_pydata(vs, [], fs); me.uv_layers.new()
        for poly in me.polygons:
            for li in poly.loop_indices: me.uv_layers[0].data[li].uv = uvs[me.loops[li].vertex_index]
        me.materials.append(md); ob = bpy.data.objects.new('so-hieu', me); bpy.context.scene.collection.objects.link(ob)
        sw = ob.modifiers.new('bam', 'SHRINKWRAP'); sw.target = o; sw.offset = 0.015
        if CHIEU: sw.wrap_method = 'PROJECT'; sw.use_project_x = True; sw.use_negative_direction = True; sw.use_positive_direction = True
        else: sw.wrap_method = 'NEAREST_SURFACEPOINT'
        bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier='bam')
    for x in bpy.data.objects: x.select_set(x.type == 'MESH')
    print('so hieu dat tai', [(sd, [round(x, 2) for x in c]) for sd, c in decals])
bpy.ops.export_scene.gltf(filepath=out.replace('.glb', '.raw.glb'), export_format='GLB', use_selection=True, export_yup=True, export_image_format='JPEG', export_apply=True)
V = np.array([v.co[:] for v in o.data.vertices]); d = V.max(0) - V.min(0)
print(f'XONG {os.path.basename(out)} tri {t0}->{t1} kich thuoc (m) rong {d[0]:.2f} dai {d[1]:.2f} cao {d[2]:.2f} ti le {s:.3f}')
