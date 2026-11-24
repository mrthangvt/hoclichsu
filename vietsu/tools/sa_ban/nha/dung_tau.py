"""Tàu hộ tống Hải quân VNCH kiểu PCE (ảnh HQ-07 anh Thắng gửi 24/11/2026; HQ-07 Đống Đa II nguyên là USS PCE-895) — hình khối, màu theo đỉnh.
python3 dung_tau.py <ra.raw.glb>   →  gltf-transform meshopt … props/tau/tau-hq-pce.glb
Dài ~56 m, rộng ~10 m (cỡ lớp PCE-842, phỏng); mũi tàu −Y Blender (= +Z three), gốc giữa tàu, z = 0 là mặt nước."""
import bpy, sys, math, bmesh
out = sys.argv[-1]
COL = {'xam': (0.58, 0.60, 0.62), 'xam2': (0.48, 0.50, 0.52), 'boong': (0.40, 0.40, 0.40), 'den': (0.12, 0.12, 0.12), 'trang': (0.88, 0.88, 0.86), 'do': (0.45, 0.18, 0.15)}
V, F, C = [], [], []
def box(x0, x1, y0, y1, z0, z1, c):
    b = len(V); V.extend([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)])
    F.extend([[b + i for i in q] for q in [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]]); C.extend([COL[c]] * 6)
def cyl(x, y, z0, z1, r, c, n=8):
    b = len(V)
    for k in range(n): a = 2 * math.pi * k / n; V.extend([(x + r * math.cos(a), y + r * math.sin(a), z0), (x + r * math.cos(a), y + r * math.sin(a), z1)])
    for k in range(n): i, j = 2 * k, 2 * ((k + 1) % n); F.append([b + i, b + j, b + j + 1, b + i + 1]); C.append(COL[c])
    F.append([b + 2 * k + 1 for k in range(n)]); C.append(COL[c])
# thân: các mặt cắt dọc tàu (y: mũi −28, đuôi +28), nửa rộng b, mạn từ z = −2,6 (đáy) tới z = +2,2 (boong; mũi cao 3,4)
S = [(-28.0, 0.05, 3.6), (-25, 2.2, 3.4), (-20, 3.9, 3.0), (-12, 4.9, 2.5), (0, 5.05, 2.2), (14, 5.0, 2.1), (24, 4.6, 2.1), (28.0, 4.0, 2.1)]
ring = []
for y, b, zt in S:
    ring.append([(-b, y, zt), (-b * 0.92, y, -1.0), (-b * 0.35, y, -2.6), (b * 0.35, y, -2.6), (b * 0.92, y, -1.0), (b, y, zt)])
for i in range(len(ring) - 1):
    A, B = ring[i], ring[i + 1]
    for k in range(5):
        bb = len(V); V.extend([A[k], A[k + 1], B[k + 1], B[k]]); F.append([bb, bb + 1, bb + 2, bb + 3]); C.append(COL['xam2'] if A[k][2] > -1.05 and A[k + 1][2] > -1.05 else COL['do'])
    bb = len(V); V.extend([A[0], A[5], B[5], B[0]]); F.append([bb, bb + 1, bb + 2, bb + 3]); C.append(COL['boong'])   # boong
bb = len(V); V.extend(ring[-1]); F.append(list(range(bb, bb + 6))); C.append(COL['xam2'])                      # đuôi phẳng
# thượng tầng, đài chỉ huy, ống khói, cột buồm, pháo
box(-3.6, 3.6, -10, 6, 2.2, 5.0, 'xam'); box(-3.0, 3.0, -9, -2, 5.0, 7.4, 'xam'); box(-3.1, 3.1, -9.2, -8.6, 6.4, 7.3, 'den')   # đài chỉ huy, kính
box(-3.4, 3.4, -9.4, -1.6, 7.4, 7.6, 'xam2')
cyl(0, 1.5, 5.0, 8.6, 1.1, 'xam2'); cyl(0, 1.5, 8.6, 8.9, 1.15, 'den')                                          # ống khói
cyl(0, -4.5, 7.6, 18.5, 0.18, 'xam2', 6); box(-2.6, 2.6, -4.6, -4.4, 15.5, 15.7, 'xam2'); box(-1.8, 1.8, -4.6, -4.4, 17.4, 17.55, 'xam2')   # cột buồm, xà ngang
box(-0.8, 0.8, -5.0, -4.0, 12.5, 13.3, 'xam')                                                                   # ra đa
cyl(0, -17.5, 3.0, 3.9, 1.3, 'xam'); box(-0.15, 0.15, -21.5, -17.5, 3.4, 3.7, 'xam2')                         # pháo 76 mm mũi
box(-2.2, 2.2, 10, 15, 2.2, 3.6, 'xam'); cyl(0, 17, 2.4, 3.2, 1.0, 'xam')                                       # pháo 40 mm sau
for sx in (-1, 1): box(sx * 3.4 - 0.6, sx * 3.4 + 0.6, 3, 7, 5.0, 6.0, 'trang')                                  # xuồng cứu sinh
bpy.ops.wm.read_factory_settings(use_empty=True)
mat = bpy.data.materials.new('tau'); mat.use_nodes = True; nt = mat.node_tree; bs = nt.nodes['Principled BSDF']
vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'; nt.links.new(vc.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.7
me = bpy.data.meshes.new('TauHQ'); me.from_pydata(V, [], F); me.update()
bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER')
for p in me.polygons:
    c = C[p.index]
    for li in p.loop_indices: ca.data[li].color = (c[0] ** 2.2, c[1] ** 2.2, c[2] ** 2.2, 1)
me.materials.append(mat); ob = bpy.data.objects.new('TauHQ', me); bpy.context.collection.objects.link(ob)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True)
print('xong', out, len(F), 'mặt')
