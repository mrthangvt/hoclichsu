"""Chuyển vật dụng Tripo (FBX: pháo, máy bay, trực thăng…) sang GLB cho sa bàn — bản chung của bake_xe.py, không đoán đầu xe.
python3 bake_vat.py <fbx> <ra.raw.glb> <trục đo: dai|rong|cao> <số đo m> <số tam giác>
  dai = cạnh dài nhất trên mặt đất, rong = cạnh ngắn trên mặt đất, cao = chiều cao.
Biến môi trường:
  XOAY=<độ>      xoay quanh trục đứng trước khi đo (để mũi / nòng nhìn −Y Blender như xe)
  XOA_TRANG=1    xoá chữ, phù hiệu màu trắng do máy sinh trong ảnh màu (cv2.inpaint) — vd. chữ "ARMY", sao Mỹ
  XOA_TOI=1      xoá chữ tối trên thân sáng (vd. chữ vô nghĩa trên thân C-130)
Sau đó: gltf-transform meshopt <ra>.raw.glb packs/<gói>/props/<…>.glb"""
import bpy, sys, os, math, mathutils, numpy as np
from PIL import Image
import cv2
fbx, out, truc, L, ntri = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), int(sys.argv[5])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o.data.transform(mathutils.Matrix.Rotation(math.radians(float(os.environ.get('XOAY', '0'))), 4, 'Z'))
V = np.array([v.co[:] for v in o.data.vertices]); mn, mx = V.min(0), V.max(0); ext = mx - mn
cur = {'dai': max(ext[0], ext[1]), 'rong': min(ext[0], ext[1]), 'cao': ext[2]}[truc]
s = L / cur
o.data.transform(mathutils.Matrix.Translation((-(mn[0] + mx[0]) / 2, -(mn[1] + mx[1]) / 2, -mn[2])))
o.data.transform(mathutils.Matrix.Scale(s, 4)); o.data.update()
t0 = sum(len(p.vertices) - 2 for p in o.data.polygons)
m = o.modifiers.new('g', 'DECIMATE'); m.ratio = min(1, ntri / t0); m.use_collapse_triangulate = True
bpy.ops.object.modifier_apply(modifier='g')
t1 = sum(len(p.vertices) - 2 for p in o.data.polygons)
d = os.path.dirname(fbx); fbm = [x for x in os.listdir(d) if x.endswith('.fbm')][0]
img = np.array(Image.open(os.path.join(d, fbm, 'Color.png') if os.path.exists(os.path.join(d, fbm, 'Color.png')) else os.path.join(d, fbm, 'Color.jpg')).convert('RGB'))   # Tripo xuất png hoặc jpg
if os.environ.get('XOA_TRANG') == '1':
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    mask = ((hsv[..., 2] > 170) & (hsv[..., 1] < 50)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    img = cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)
if os.environ.get('XOA_TOI') == '1':                                                   # chữ tối máy sinh trên thân sáng (vd. C-130): điểm tối mà vùng quanh sáng
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY); nen = cv2.medianBlur(g, 41)
    mask = ((g < nen.astype(int) - 45) & (nen > 140)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8)); img = cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)
im = Image.fromarray(img).resize((1024, 1024), Image.LANCZOS); tex = out + '.jpg'; im.save(tex, quality=88)
mat = bpy.data.materials.new('vat'); mat.use_nodes = True; nt = mat.node_tree; b = nt.nodes['Principled BSDF']
b.inputs['Roughness'].default_value = 0.75; b.inputs['Metallic'].default_value = 0.3
ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = bpy.data.images.load(tex); nt.links.new(ti.outputs['Color'], b.inputs['Base Color'])
o.data.materials.clear(); o.data.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_image_format='JPEG', export_apply=True)
V = np.array([v.co[:] for v in o.data.vertices]); e = V.max(0) - V.min(0)
print(f'xong: {out} | tam giác {t0} → {t1} | kích thước X {e[0]:.2f} × Y {e[1]:.2f} × cao {e[2]:.2f} m')
