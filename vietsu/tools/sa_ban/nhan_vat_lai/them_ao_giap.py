"""Thêm áo giáp chống mảnh (kiểu M1955) cho lính TQLC Mỹ Tripo (chưa gắn xương, tư thế chữ T) — sa bàn Khe Sanh 1968.
Nguồn: từ 1/1968 mũ sắt, áo giáp chống mảnh là bắt buộc ở căn cứ Khe Sanh (sources.json › M20).
python3 them_ao_giap.py <vào.fbx> <ra.fbx>   (bpy làm thư viện, không mở Blender của anh Thắng)
- Phồng nhẹ thân áo (vùng ngực, lưng, vai) ~2 cm theo pháp tuyến.
- Tô lại ảnh màu ở vùng thân: chỗ là vải áo sơ mi → màu ô liu sẫm của áo giáp, vai và ngực trên có gân ngang, khoá kéo giữa ngực;
  dây đeo, túi đạn, thẻ bài, súng (màu khác vải áo) giữ nguyên.
Giả định: mẫu cao ~1 (đơn vị Tripo), trục Z lên, mặt nhìn −Y. Kết quả là MINH HOẠ, gửi Mixamo gắn xương rồi dùng bake_glb.py / nuong_nvz.py."""
import bpy, bmesh, sys, os, numpy as np
from PIL import Image
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
VAO, RA = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=VAO)
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = o.data; V = np.array([v.co[:] for v in me.vertices]); Nn = np.array([v.normal[:] for v in me.vertices])
Hh = V[:, 2].max() - V[:, 2].min(); z0 = V[:, 2].min(); zr = (V[:, 2] - z0) / Hh   # độ cao tương đối 0..1
# vùng áo giáp: trên thắt lưng, dưới cổ áo, không lấy tay (tư thế chữ T: tay chìa ngang)
ZB, ZS, ZC = 0.57, 0.80, 0.83
w_t = np.where(zr < 0.74, 0.118, 0.135)
def trong(x, zr_): return (zr_ > ZB) & (zr_ < ZS) & (np.abs(x) < np.where(zr_ < 0.74, 0.118, 0.135) * Hh)
m = trong(V[:, 0], zr)
# phồng thân: mép vùng giảm dần để không rách
mem = np.clip(np.minimum.reduce([(zr - ZB) / 0.02, (ZS - zr) / 0.02, (w_t * Hh - np.abs(V[:, 0])) / (0.02 * Hh)]), 0, 1) * m
V2 = V + Nn * (0.011 * Hh / 1.0) * mem[:, None]
for i, v in enumerate(me.vertices):
    if mem[i] > 0: v.co = V2[i]
# ảnh màu
mat = me.materials[0]; tex = next(n for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE'); img = tex.image
W, Hp = img.size; px = np.array(img.pixels[:], dtype=np.float32).reshape(Hp, W, 4)   # hàng 0 = dưới
uv = me.uv_layers.active.data
P3, U2 = [], []
for p in me.polygons:
    vi = list(p.vertices)
    if not all(m[i] for i in vi): continue
    li = list(p.loop_indices)
    for k in range(1, len(vi) - 1):
        P3.append([V[vi[0]], V[vi[k]], V[vi[k + 1]]]); U2.append([uv[li[0]].uv[:], uv[li[k]].uv[:], uv[li[k + 1]].uv[:]])
P3 = np.array(P3); U2 = np.array(U2) * [W, Hp]
# màu vải áo sơ mi: trung vị các texel trong vùng
mask = np.zeros((Hp, W), bool); pos = np.zeros((Hp, W, 3), np.float32)
for t in range(len(P3)):
    u = U2[t]; x0, y0 = np.floor(u.min(0)).astype(int); x1, y1 = np.ceil(u.max(0)).astype(int)
    if x1 - x0 > 200 or y1 - y0 > 200: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1)); q = np.stack([xs.ravel() + .5, ys.ravel() + .5], -1)
    T = np.array([u[1] - u[0], u[2] - u[0]]).T
    if abs(np.linalg.det(T)) < 1e-9: continue
    l = np.linalg.solve(T, (q - u[0]).T).T; l0 = 1 - l.sum(1); ok = (l >= -0.02).all(1) & (l0 >= -0.02)
    xx, yy = xs.ravel()[ok] % W, ys.ravel()[ok] % Hp
    mask[yy, xx] = True; pos[yy, xx] = l0[ok, None] * P3[t, 0] + l[ok, 0, None] * P3[t, 1] + l[ok, 1, None] * P3[t, 2]
C = px[..., :3]; vung = C[mask]; ao = np.median(vung, 0)
d = np.linalg.norm(C - ao, axis=-1); vai = mask & (d < 0.055)          # texel giống vải áo → thành áo giáp
zrel = (pos[..., 2] - z0) / Hh
mau = np.array([0.205, 0.215, 0.135])                                  # ô liu sẫm (sRGB tuyến tính ước lượng) — MINH HOẠ
sang = (C.mean(-1) / max(ao.mean(), 1e-3))[..., None]                  # giữ nếp nhăn, bóng của vải
moi = np.clip(mau * sang, 0, 1)
gan = (zrel > 0.70) & (np.mod(zrel * Hh, 0.012 * Hh) < 0.0022 * Hh)    # gân ngang ở vai, ngực trên
moi[gan] *= 0.62
khoa = (np.abs(pos[..., 0]) < 0.004 * Hh) & (pos[..., 1] < 0)          # khoá kéo giữa ngực (mặt trước, −Y)
moi[khoa] *= 0.5
C[vai] = moi[vai]; px[..., :3] = C
img.pixels[:] = px.ravel(); out_png = os.path.splitext(RA)[0] + '_Color.png'
img.filepath_raw = out_png; img.file_format = 'PNG'; img.save()
print('texel vung than', int(mask.sum()), 'thanh ao giap', int(vai.sum()), 'mau vai ao', ao.round(3))
bpy.ops.export_scene.fbx(filepath=RA, use_selection=True, path_mode='COPY', embed_textures=True)
bpy.ops.export_scene.gltf(filepath=os.path.splitext(RA)[0] + '.glb', export_format='GLB', use_selection=True)
print('XONG', RA)
