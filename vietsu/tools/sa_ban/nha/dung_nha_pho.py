"""Nhà phố Sài Gòn khoảng 1975 — 4 kiểu dựng bằng hình khối, màu theo đỉnh (một vật liệu/kiểu → bộ máy vẽ hàng loạt bằng InstancedMesh).
python3 dung_nha_pho.py <ra.raw.glb>  rồi  gltf-transform meshopt <ra.raw.glb> packs/ho-chi-minh-1975/props/nha/nha-pho.glb
Theo ảnh mẫu anh Thắng gửi 24/11/2026 (nhà cũ còn lại ở Sài Gòn + ảnh phố 1960s):
  NhaA  2 tầng + sân thượng: tầng trệt hai cửa sắt kéo sơn xanh, mảng tường bông gió, tầng lầu ban công lõm lan can con tiện, giàn bê tông trên mái.
  NhaB  4 tầng góc phố: ban công chạy dài viền xanh, lan can sắt, tầng trệt mái che sọc xanh.
  NhaC  1 tầng mái ngói đỏ: mặt tiền bảng hiệu, ốp gạch men, cửa sắt hoa.
  NhaD  nhà ống 3 tầng: ban công mỗi tầng, cửa chớp.
Thêm (24/11 chiều, theo ảnh phố nhìn từ trên cao và ảnh nhà lá kênh Hàng Bàng): 5 kiểu nhà xa ít mặt (Xa*), 3 kiểu nhà lá trên cọc (La*), xuồng, ghe mui lá.
Gốc toạ độ: giữa chân mặt tiền; mặt tiền nhìn −Y Blender (= +Z three); x dọc phố, y sâu vào trong. Số đo phỏng theo ảnh (tầng ~3,4 m, mặt tiền 4–8 m)."""
import bpy, sys, math, os
out = sys.argv[-1]
COL = {'tuong': (0.84, 0.80, 0.70), 'tuong2': (0.74, 0.73, 0.68), 'xam': (0.55, 0.55, 0.52), 'tran': (0.90, 0.88, 0.82),
       'xanh': (0.20, 0.55, 0.62), 'xanh2': (0.32, 0.62, 0.60), 'toi': (0.12, 0.12, 0.12), 'kinh': (0.18, 0.22, 0.24),
       'ngoi': (0.55, 0.24, 0.16), 'bien': (0.30, 0.55, 0.45), 'bien2': (0.85, 0.80, 0.30), 'men': (0.80, 0.74, 0.62),
       'sat': (0.25, 0.25, 0.24), 'do': (0.62, 0.20, 0.16), 'gch': (0.62, 0.42, 0.30),
       'ngoi2': (0.70, 0.36, 0.22), 'vang': (0.86, 0.78, 0.58), 'ton': (0.52, 0.48, 0.44), 'gi': (0.50, 0.33, 0.22),
       'la': (0.50, 0.43, 0.33), 'la2': (0.60, 0.52, 0.38), 'go': (0.32, 0.25, 0.18), 'van': (0.44, 0.36, 0.26), 'xuong': (0.36, 0.28, 0.20)}
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
def prism_y(T, x0, x1, y0, y1, z0, h, c, cg=None):    # mái hai dốc, nóc chạy theo y (đầu hồi nhìn ra mặt tiền); cg: màu hai đầu hồi
    V, F, C = T; b = len(V); xm = (x0 + x1) / 2
    V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (xm, y0, z0 + h), (xm, y1, z0 + h)]
    F += [[b + i for i in q] for q in [[0, 4, 5, 3], [1, 2, 5, 4], [0, 1, 4], [2, 3, 5]]]; C += [COL[c]] * 2 + [COL[cg or c]] * 2
def hip(T, x0, x1, y0, y1, z0, h, c):              # mái ngói bốn mái, nóc theo cạnh dài
    V, F, C = T; b = len(V); ym, xm = (y0 + y1) / 2, (x0 + x1) / 2
    if y1 - y0 >= x1 - x0: r = (x1 - x0) / 2; V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (xm, y0 + r, z0 + h), (xm, y1 - r, z0 + h)]; Q = [[0, 1, 4], [1, 2, 5, 4], [2, 3, 5], [3, 0, 4, 5]]
    else: r = (y1 - y0) / 2; V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0 + r, ym, z0 + h), (x1 - r, ym, z0 + h)]; Q = [[0, 1, 5, 4], [1, 2, 5], [2, 3, 4, 5], [3, 0, 4]]
    F += [[b + i for i in q] for q in Q]; C += [COL[c]] * 4
def vo(T, x0, x1, y0, y1, z0, z1, c):              # hộp không đáy (nhà xa, bớt mặt)
    V, F, C = T; b = len(V)
    V += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    F += [[b + i for i in q] for q in [[4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]]; C += [COL[c]] * 5
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

# ---- NHÀ XA (ít mặt, vẽ dày trong các khối phố — theo ảnh chụp từ trên cao anh gửi: mái ngói đỏ cam, mái tôn, nhà bê tông mái bằng xen kẽ)
def mat(T, x0, x1, y, z0, z1, c):                  # một mặt phẳng nhìn ra −y (cửa, dải kính nhà xa)
    V, F, C = T; b = len(V); V += [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]; F.append([b, b + 1, b + 2, b + 3]); C.append(COL[c])
T = bat('XaNgoi'); vo(T, -3.5, 3.5, 0, 12, 0, 3.6, 'vang'); hip(T, -3.9, 3.9, -0.4, 12.4, 3.6, 2.2, 'ngoi2')
T = bat('XaTon'); vo(T, -3, 3, 0, 14, 0, 3.2, 'tuong2'); V, F, C = T; b = len(V)
V += [(-3.3, -0.5, 3.4), (3.3, -0.5, 3.4), (3.3, 14.3, 4.4), (-3.3, 14.3, 4.4)]; F += [[b, b + 1, b + 2, b + 3]]; C += [COL['ton']]
T = bat('XaBeTong'); vo(T, -3, 3, 0, 14, 0, 10.2, 'tuong')
for z in (1.0, 4.4, 7.8): mat(T, -2.6, 2.6, -0.05, z, z + 1.9, 'kinh')
T = bat('XaPho'); vo(T, -2.5, 2.5, 0, 14, 0, 7.0, 'tuong2'); mat(T, -2.2, 2.2, -0.05, 0.2, 2.6, 'xanh'); mat(T, -1.6, 1.6, -0.05, 4.0, 6.2, 'kinh')
V, F, C = T; b = len(V); V += [(-2.5, -1.0, 3.5), (2.5, -1.0, 3.5), (2.5, 0, 3.5), (-2.5, 0, 3.5)]; F.append([b, b + 1, b + 2, b + 3]); C.append(COL['tran'])
T = bat('XaBietThu'); vo(T, -6, 6, 0, 11, 0, 7.0, 'tran'); hip(T, -6.6, 6.6, -0.6, 11.6, 7.0, 2.8, 'ngoi'); vo(T, -2, 2, -2.5, 0, 0, 3.2, 'tran')
# ---- NHÀ LÁ VEN KÊNH (theo ảnh kênh Hàng Bàng – Chợ Lớn trước 1975 anh gửi): sàn gỗ trên cọc, vách lá, mái lá.
# Gốc: mép bờ; −y (mặt trước) chìa ra sông; z = 0 là mặt sàn (đặt sàn cao hơn bờ ~0,5 m); cọc xuống tới z = −3,5.
def coc(T, xs, ys, z0=-3.5):
    for x in xs:
        for y in ys: box(T, x - 0.08, x + 0.08, y - 0.08, y + 0.08, z0, 0, 'go')
T = bat('LaA')                                      # mái hai dốc, đầu hồi nhìn ra kênh
coc(T, (-2.4, 0, 2.4), (-6.0, -3.5, -1.0)); box(T, -2.6, 2.6, -6.2, 5.0, -0.15, 0, 'van')
vo(T, -2.4, 2.4, -3.8, 5.0, 0, 2.2, 'la2'); box(T, -0.6, 0.6, -3.86, -3.78, 0, 1.8, 'toi')
prism_y(T, -3.0, 3.0, -4.6, 5.6, 2.2, 1.9, 'la', 'la2')
T = bat('LaB')                                      # mái hai dốc dọc bờ, hiên trước
coc(T, (-3.5, -1, 1.5, 3.5), (-5.0, -2.5)); box(T, -3.7, 3.7, -5.2, 4.5, -0.15, 0, 'van')
vo(T, -3.4, 3.4, -2.0, 4.5, 0, 2.0, 'la2'); box(T, -1.0, 0.2, -2.06, -1.98, 0, 1.8, 'toi')
prism(T, -4.0, 4.0, -5.4, 5.2, 2.0, 2.6, 'la')
T = bat('LaC')                                      # chòi nhỏ một mái, vách lá cũ
coc(T, (-1.6, 1.6), (-4.2, -1.5)); box(T, -1.8, 1.8, -4.4, 3.0, -0.12, 0, 'van')
vo(T, -1.6, 1.6, -3.0, 3.0, 0, 1.9, 'la'); V, F, C = T; b = len(V)
V += [(-2.1, -3.8, 2.4), (2.1, -3.8, 2.4), (2.1, 3.4, 1.7), (-2.1, 3.4, 1.7)]; F += [[b, b + 1, b + 2, b + 3]]; C += [COL['la2']]
# xuồng ba lá và ghe có mui lá (gốc giữa ghe, z = 0 mặt nước, mũi theo +y)
def thuyen(T, L, W, h, c):
    V, F, C = T; b = len(V); l = L / 2
    V += [(0, -l, h), (W / 2, -l * 0.55, h), (W / 2, l * 0.55, h), (0, l, h), (-W / 2, l * 0.55, h), (-W / 2, -l * 0.55, h),
          (0, -l * 0.9, -0.15), (W / 3, -l * 0.5, -0.25), (W / 3, l * 0.5, -0.25), (0, l * 0.9, -0.15), (-W / 3, l * 0.5, -0.25), (-W / 3, -l * 0.5, -0.25)]
    for k in range(6): j = (k + 1) % 6; F.append([b + k, b + j, b + 6 + j, b + 6 + k]); C.append(COL[c])
    F.append([b + 6 + k for k in range(6)][::-1]); C.append(COL[c])
    F.append([b + k for k in range(6)]); C.append(COL['van'])
T = bat('Xuong'); thuyen(T, 5.5, 1.1, 0.35, 'xuong')
T = bat('Ghe'); thuyen(T, 9.0, 2.0, 0.55, 'xuong'); V, F, C = T; b = len(V); n = 6
for k in range(n + 1):
    a = math.pi * k / n; V += [(0.85 * math.cos(a), -1.6, 0.55 + 1.0 * math.sin(a)), (0.85 * math.cos(a), 1.8, 0.55 + 1.0 * math.sin(a))]
for k in range(n): F.append([b + 2 * k, b + 2 * k + 2, b + 2 * k + 3, b + 2 * k + 1]); C.append(COL['la'])

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
    if os.environ.get("XEM"): ob.location = ((i % 5) * 16, (i // 5) * 20, 0)   # xem thử: xếp lưới
    print(ten, len(F) * 2, 'tam giác ~')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True)
print('xong', out)
