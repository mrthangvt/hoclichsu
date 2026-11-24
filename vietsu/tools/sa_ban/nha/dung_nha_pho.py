"""Nhà phố Sài Gòn khoảng 1975 — 4 kiểu dựng bằng hình khối, màu theo đỉnh (một vật liệu/kiểu → bộ máy vẽ hàng loạt bằng InstancedMesh).
python3 dung_nha_pho.py <ra.raw.glb>  rồi  gltf-transform meshopt <ra.raw.glb> packs/ho-chi-minh-1975/props/nha/nha-pho.glb
Theo ảnh mẫu anh Thắng gửi 24/11/2026 (nhà cũ còn lại ở Sài Gòn + ảnh phố 1960s):
  NhaA  2 tầng + sân thượng: tầng trệt hai cửa sắt kéo sơn xanh, mảng tường bông gió, tầng lầu ban công lõm lan can con tiện, giàn bê tông trên mái.
  NhaB  4 tầng góc phố: ban công chạy dài viền xanh, lan can sắt, tầng trệt mái che sọc xanh.
  NhaC  1 tầng mái ngói đỏ: mặt tiền bảng hiệu, ốp gạch men, cửa sắt hoa.
  NhaD  nhà ống 3 tầng: ban công mỗi tầng, cửa chớp.
Gốc toạ độ: giữa chân mặt tiền; mặt tiền nhìn −Y Blender (= +Z three); x dọc phố, y sâu vào trong. Số đo phỏng theo ảnh (tầng ~3,4 m, mặt tiền 4–8 m)."""
import bpy, sys, math
out = sys.argv[-1]
COL = {'tuong': (0.84, 0.80, 0.70), 'tuong2': (0.74, 0.73, 0.68), 'xam': (0.55, 0.55, 0.52), 'tran': (0.90, 0.88, 0.82),
       'xanh': (0.20, 0.55, 0.62), 'xanh2': (0.32, 0.62, 0.60), 'toi': (0.12, 0.12, 0.12), 'kinh': (0.18, 0.22, 0.24),
       'ngoi': (0.55, 0.24, 0.16), 'bien': (0.30, 0.55, 0.45), 'bien2': (0.85, 0.80, 0.30), 'men': (0.80, 0.74, 0.62),
       'sat': (0.25, 0.25, 0.24), 'do': (0.62, 0.20, 0.16), 'gch': (0.62, 0.42, 0.30)}
NHA = {}
def bat(ten): NHA[ten] = ([], [], []); return NHA[ten]
def box(T, x0, x1, y0, y1, z0, z1, c):
    V, F, C = T; b = len(V)
    V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    F += [[b + i for i in q] for q in [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]]; C += [COL[c]] * 6
def prism(T, x0, x1, y0, y1, z0, h, c):          # mái hai dốc, nóc chạy theo x
    V, F, C = T; b = len(V); ym = (y0 + y1) / 2
    V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, ym, z0 + h), (x1, ym, z0 + h)]
    F += [[b + i for i in q] for q in [[0, 1, 5, 4], [2, 3, 4, 5], [0, 4, 3], [1, 2, 5], [0, 3, 2, 1]]]; C += [COL[c]] * 5
def con_tien(T, x0, x1, y, z0, h, c='tran'):     # lan can con tiện (giản lược: thanh đứng dày)
    box(T, x0, x1, y - 0.08, y + 0.08, z0, z0 + 0.12, c); box(T, x0, x1, y - 0.08, y + 0.08, z0 + h - 0.1, z0 + h, c)
    n = max(2, int((x1 - x0) / 0.22))
    for k in range(n): x = x0 + (k + 0.5) * (x1 - x0) / n; box(T, x - 0.05, x + 0.05, y - 0.05, y + 0.05, z0 + 0.12, z0 + h - 0.1, c)
D = 14.0                                          # sâu nhà
# ---- A
T = bat('NhaA'); W = 8.0
box(T, -W / 2, W / 2, 0.6, D, 0, 3.6, 'tuong2'); box(T, -W / 2, W / 2, 0, 0.6, 3.3, 3.6, 'tran')
for x in (-2.0, 1.8): box(T, x - 1.5, x + 1.5, -0.02, 0.05, 0.05, 2.7, 'xanh')            # cửa sắt kéo
box(T, -W / 2, W / 2, -0.02, 0.6, 2.75, 3.3, 'gch')                                         # ô thông gió gạch
box(T, -W / 2, -W / 2 + 0.5, 0, 0.6, 0, 3.3, 'tuong'); box(T, W / 2 - 0.5, W / 2, 0, 0.6, 0, 3.3, 'tuong')
box(T, -W / 2, W / 2, 1.8, D, 3.6, 7.0, 'tuong'); box(T, -W / 2, -W / 2 + 1.9, 0, 1.8, 3.6, 7.0, 'tuong2')   # tầng lầu lõm, cột tường trái
box(T, -W / 2 + 0.2, -W / 2 + 1.7, -0.05, 0.1, 3.9, 6.6, 'xam')                             # mảng bông gió
box(T, -W / 2 + 1.9, W / 2, 1.75, 1.85, 3.8, 6.4, 'kinh'); box(T, 1.2, 2.2, 1.7, 1.86, 3.8, 6.0, 'do')
con_tien(T, -W / 2 + 1.9, W / 2, 0.05, 3.6, 1.0)
box(T, -W / 2, W / 2, 0, D, 7.0, 7.3, 'tran'); box(T, -W / 2, W / 2, 0, 0.15, 7.3, 8.1, 'tuong')       # mái bằng, tường chắn mái
for x in (-2.5, 2.5): box(T, x - 0.15, x + 0.15, 1.0, 1.3, 7.3, 9.6, 'tuong2')                         # giàn bê tông
for y in (0.6, 1.6, 2.6, 3.6): box(T, -3.4, 3.4, y, y + 0.18, 9.6, 9.8, 'tuong2')
# ---- B
T = bat('NhaB'); W = 6.0
box(T, -W / 2, W / 2, 0.4, D, 0, 13.6, 'tuong2')
box(T, -W / 2 + 0.3, W / 2 - 0.3, 0.3, 0.42, 0.05, 2.8, 'toi'); box(T, -W / 2, W / 2, -1.6, 0.4, 2.9, 3.05, 'xanh2')   # cửa hàng + mái che sọc
for k in range(5): box(T, -W / 2 + k * 1.2, -W / 2 + k * 1.2 + 0.6, -1.62, 0.4, 3.05, 3.08, 'tran')
for f in range(1, 4):
    z = f * 3.4
    box(T, -W / 2, W / 2, -1.2, 0.4, z - 0.1, z + 0.12, 'tuong'); box(T, -W / 2, W / 2, -1.25, -1.1, z + 0.12, z + 0.3, 'xanh')   # sàn ban công, viền xanh
    con_tien(T, -W / 2, W / 2, -1.15, z + 0.12, 1.0, 'sat')
    box(T, -W / 2 + 0.6, W / 2 - 0.6, 0.35, 0.42, z + 0.4, z + 2.8, 'kinh')
    box(T, -0.12, 0.12, -1.2, -1.0, z + 0.12, z + 3.3, 'tuong')
box(T, -W / 2, W / 2, -1.2, D, 13.6, 13.8, 'tuong'); con_tien(T, -W / 2, W / 2, -1.15, 13.8, 1.0, 'sat')
# ---- C
T = bat('NhaC'); W = 5.0
box(T, -W / 2, W / 2, 0, D, 0, 3.4, 'men'); box(T, -W / 2 + 0.5, W / 2 - 0.5, -0.03, 0.05, 0.05, 2.5, 'sat')   # cửa sắt hoa
box(T, -W / 2, W / 2, -0.25, 0.05, 2.6, 3.4, 'bien')                                              # bảng hiệu
box(T, -W / 2, W / 2, 0, 1.2, 3.4, 5.2, 'tuong'); prism(T, -W / 2 - 0.2, W / 2 + 0.2, 1.0, D + 0.3, 3.4, 2.4, 'ngoi')   # tường mặt tiền + mái ngói
# ---- D
T = bat('NhaD'); W = 4.5
box(T, -W / 2, W / 2, 0.3, D, 0, 10.4, 'tuong'); box(T, -W / 2 + 0.4, W / 2 - 0.4, 0.25, 0.32, 0.05, 2.8, 'xanh')
box(T, -W / 2, W / 2, -0.4, 0.3, 2.7, 3.2, 'bien2')
for f in (1, 2):
    z = f * 3.4; box(T, -W / 2, W / 2, -0.9, 0.3, z - 0.1, z + 0.1, 'tran'); con_tien(T, -W / 2, W / 2, -0.85, z + 0.1, 0.9, 'sat')
    box(T, -1.2, 1.2, 0.25, 0.32, z + 0.3, z + 2.7, 'xanh2')
box(T, -W / 2, W / 2, 0, D, 10.4, 10.6, 'tran'); box(T, -W / 2, W / 2, 0, 0.15, 10.6, 11.3, 'tuong')

bpy.ops.wm.read_factory_settings(use_empty=True)
mat = bpy.data.materials.new('nha'); mat.use_nodes = True; nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.9
import bmesh
for i, (ten, (V, F, C)) in enumerate(NHA.items()):
    me = bpy.data.meshes.new(ten); me.from_pydata(V, [], F); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
    for p in me.polygons:
        c = C[p.index]
        for li in p.loop_indices: ca.data[li].color = (c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2, 1)
    me.materials.append(mat); ob = bpy.data.objects.new(ten, me); bpy.context.collection.objects.link(ob)
    print(ten, len(F) * 2, 'tam giác ~')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True)
print('xong', out)
