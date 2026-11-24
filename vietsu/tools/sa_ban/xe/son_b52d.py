"""Sơn lại B-52 Tripo thành B-52D năm 1968 (Arc Light): mặt trên rằn ri Đông Nam Á ba màu (nâu vàng, xanh đậm, xanh vừa), bụng đen bóng
(M18, M19 trong sources.json gói khe-sanh-1968); xoá mã đuôi, số máy sinh (sơn đè). Xoay mũi về −Y, co thân theo chiều dài công bố.
python3 son_b52d.py <vào.raw.glb (bake_vat.py, dai = sải cánh 56,39 m)> <ra.raw.glb> [dài thân m = 47.70]
Bản rằn ri là MINH HOẠ (vệt màu sinh theo nhiễu, không theo sơ đồ sơn thật)."""
import bpy, sys, os, math, numpy as np, mathutils
from PIL import Image
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
VAO, RA = a[0], a[1]; DAI = float(a[2]) if len(a) > 2 else 47.70
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=VAO)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = o.data; V = np.array([v.co[:] for v in me.vertices])
top = V[V[:, 2] > V[:, 2].max() - 1.5]; mui = 1 if top[:, 0].mean() < 0 else -1           # đuôi đứng ở phía ngược mũi
truc = 0 if (V[:, 0].max() - V[:, 0].min()) < (V[:, 1].max() - V[:, 1].min()) else 1          # thân dọc trục ngắn hơn (sải cánh dài hơn)
# xoay: mũi theo +X → −Y
if truc == 0: me.transform(mathutils.Matrix.Rotation(math.radians(-90 * mui), 4, 'Z'))
V = np.array([v.co[:] for v in me.vertices]); L = V[:, 1].max() - V[:, 1].min(); k = DAI / L
me.transform(mathutils.Matrix.Diagonal((1, k, 1, 1))); me.update()
V = np.array([v.co[:] for v in me.vertices]); print('kich thuoc', (V.max(0) - V.min(0)).round(2))
mat = me.materials[0]; tx = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE'); img = tx.image
W, H = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
uv = me.uv_layers.active.data; P3, U2, NZ = [], [], []
for p in me.polygons:
    vi = list(p.vertices); li = list(p.loop_indices)
    for j in range(1, len(vi) - 1):
        P3.append([V[vi[0]], V[vi[j]], V[vi[j + 1]]]); U2.append([uv[li[0]].uv[:], uv[li[j]].uv[:], uv[li[j + 1]].uv[:]]); NZ.append(p.normal.z)
P3 = np.array(P3); U2 = np.array(U2) * [W, H]; NZ = np.array(NZ)
pos = np.zeros((H, W, 3), np.float32); nz = np.zeros((H, W), np.float32); ok_ = np.zeros((H, W), bool)
for t in range(len(P3)):
    u = U2[t]; x0, y0 = np.floor(u.min(0)).astype(int); x1, y1 = np.ceil(u.max(0)).astype(int)
    if x1 - x0 > 400 or y1 - y0 > 400: continue
    xs, ys = np.meshgrid(np.arange(x0 - 1, x1 + 2), np.arange(y0 - 1, y1 + 2)); q = np.stack([xs.ravel() + .5, ys.ravel() + .5], -1)
    T = np.array([u[1] - u[0], u[2] - u[0]]).T
    if abs(np.linalg.det(T)) < 1e-9: continue
    l = np.linalg.solve(T, (q - u[0]).T).T; l0 = 1 - l.sum(1); ok = (l >= -0.05).all(1) & (l0 >= -0.05)
    xx, yy = xs.ravel()[ok] % W, ys.ravel()[ok] % H
    pos[yy, xx] = l0[ok, None] * P3[t, 0] + l[ok, 0, None] * P3[t, 1] + l[ok, 1, None] * P3[t, 2]; nz[yy, xx] = NZ[t]; ok_[yy, xx] = True
def nhieu(p, f):     # nhiễu giá trị trơn theo vị trí 3D (tổng sin lệch pha) — đủ cho vệt rằn ri
    return (np.sin(p[..., 0] * f + 1.3) * np.sin(p[..., 1] * f * 0.8 + 0.4) + np.sin(p[..., 1] * f * 1.7 + p[..., 2] * f * 0.9 + 2.1) * 0.6
            + np.sin((p[..., 0] + p[..., 1]) * f * 0.55 + 4.0) * 0.5)
n1 = nhieu(pos, 0.22); n2 = nhieu(pos[..., [1, 0, 2]], 0.19)
TAN, XD, XV, DEN = np.array([0.56, 0.47, 0.33]), np.array([0.23, 0.27, 0.19]), np.array([0.35, 0.39, 0.25]), np.array([0.035, 0.035, 0.04])
mau = np.where((n1 > 0.35)[..., None], XD, np.where((n2 > 0.1)[..., None], XV, TAN))
bung = nz < -0.15
mau[bung] = DEN
C = px[..., :3]; sang = np.clip(C.mean(-1) / max(np.median(C[ok_].mean(-1)), 1e-3), 0.86, 1.12)[..., None]   # giữ chút chi tiết tấm; kẹp hẹp để mã đuôi, số máy sinh chìm hẳn
C[ok_] = np.clip(mau[ok_] * sang[ok_], 0, 1); px[..., :3] = C
png = os.path.splitext(RA)[0] + '_mau.png'; Image.fromarray((np.clip(px[::-1, :, :3], 0, 1) * 255).astype(np.uint8)).save(png)   # hàng 0 của pixels là đáy ảnh
tx.image = bpy.data.images.load(png)                                          # gán ảnh mới (ảnh gốc nằm trong GLB, sửa pixels không vào bản xuất)
b = mat.node_tree.nodes.get('Principled BSDF')
if b: b.inputs['Roughness'].default_value = 0.6; b.inputs['Metallic'].default_value = 0.1
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', use_selection=False, export_image_format='JPEG')
print('XONG', RA, 'texel', int(ok_.sum()), 'bung', int((ok_ & bung).sum()))
