"""Dựng Dinh Độc Lập (hình dáng trước 30/4/1975) bằng hình khối — bpy làm thư viện, không mở Blender của anh Thắng.
python3 dung_dinh.py <ra.raw.glb>   rồi   gltf-transform meshopt <ra.raw.glb> packs/ho-chi-minh-1975/props/dinh/dinh-doc-lap.glb

Hệ toạ độ cục bộ (m): X = dọc mặt tiền (s), Y = hướng ra cổng (d, mặt tiền nhìn +Y), Z lên; gốc = giữa mặt tiền, mặt sân.
Đặt vào sa bàn: gốc tại O = (27,5; 21) m của tầng nội đô (lat0 10,7770; lon0 106,6953), mặt tiền nhìn phương vị 42,6° (Đông Bắc).
Nguồn số đo:
  - Nền nhà (chữ T): đường bao OSM "Dinh Độc Lập" (historic=building) → thân trước 85,6 × ~28 m, thân sau ~32 × 53 m.
  - Cao 26 m, 3 tầng chính, 2 gác lửng, sân thượng có sân đáp trực thăng (dinhdoclap.gov.vn; Báo Thanh tra).
  - Bãi cỏ trước Dinh hình bầu dục, đường kính 102 m (dinhdoclap.gov.vn).
  - Hàng rào, cổng: đường Nam Kỳ Khởi Nghĩa (OSM) chạy song song mặt tiền cách 151 m; Lê Duẩn vào đúng trục Dinh.
  - Dáng mặt tiền: ảnh tư liệu trước 1975 (rèm hoa đá, ban công giữa, lầu thượng mái bằng, hàng cau trên sân thượng);
    hồ tròn có tượng trắng giữa bãi cỏ: ảnh xe tăng vào sân Dinh trưa 30/4/1975.
Mọi chi tiết khác (số ô cửa, cây, chậu cảnh) là phỏng theo ảnh, giản lược."""
import bpy, sys, math, numpy as np
out = sys.argv[-1]
V, F, M = [], [], []          # đỉnh, mặt, chỉ số vật liệu của mặt
MATS = {  # tên: (màu, nhám)
    'trang': ((0.86, 0.86, 0.83), 0.8), 'bechong': ((0.70, 0.70, 0.67), 0.85), 'da': ((0.42, 0.38, 0.33), 0.9),
    'kinh': ((0.10, 0.12, 0.14), 0.3), 'co': ((0.30, 0.42, 0.20), 1.0), 'co2': ((0.40, 0.46, 0.27), 1.0), 'san': ((0.62, 0.60, 0.54), 0.95),
    'nuoc': ((0.22, 0.32, 0.36), 0.15), 'sat': ((0.16, 0.16, 0.15), 0.6), 'la': ((0.17, 0.28, 0.13), 1.0),
    'than': ((0.30, 0.24, 0.18), 1.0), 'duong': ((0.36, 0.35, 0.33), 0.95), 'tuong': ((0.92, 0.91, 0.88), 0.7),
}
MI = {k: i for i, k in enumerate(MATS)}
OBJ = {}   # đối tượng riêng (cánh cổng) — tên: (V, F, M)

def _add(v, f, m, tgt=None):
    VV, FF, MM = tgt if tgt else (V, F, M)
    b = len(VV); VV.extend(v); FF.extend([[i + b for i in q] for q in f]); MM.extend([MI[m]] * len(f))

def box(x0, x1, y0, y1, z0, z1, m, tgt=None):
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
    _add(v, f, m, tgt)

def lathe(cx, cy, z0, prof, m, n=6):          # prof: [(dz, r), …] từ dưới lên
    v, f = [], []
    for dz, r in prof:
        for k in range(n):
            a = 2 * math.pi * k / n; v.append((cx + r * math.cos(a), cy + r * math.sin(a), z0 + dz))
    for j in range(len(prof) - 1):
        for k in range(n):
            a, b = j * n + k, j * n + (k + 1) % n; f.append([a, b, b + n, a + n])
    _add(v, f, m)

def cyl(cx, cy, z0, z1, r, m, n=8): lathe(cx, cy, z0, [(0, r), (z1 - z0, r)], m, n)

def blob(cx, cy, cz, r, m, rz=None):           # tán cây: khối 8 mặt giãn
    rz = rz or r; v = [(cx + r, cy, cz), (cx - r, cy, cz), (cx, cy + r, cz), (cx, cy - r, cz), (cx, cy, cz + rz), (cx, cy, cz - rz * 0.6)]
    f = [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]]
    _add(v, f, m)

def slab(pts, z0, z1, m):                      # đa giác lồi/hình sao từ tâm → khối dẹt
    n = len(pts); cx = sum(p[0] for p in pts) / n; cy = sum(p[1] for p in pts) / n
    v = [(cx, cy, z0), (cx, cy, z1)] + [(x, y, z0) for x, y in pts] + [(x, y, z1) for x, y in pts]; f = []
    for i in range(n):
        j = (i + 1) % n; f += [[0, 2 + j, 2 + i], [1, 2 + n + i, 2 + n + j], [2 + i, 2 + j, 2 + n + j, 2 + n + i]]
    _add(v, f, m)

def ring(cx, cy, r0, r1, z0, z1, m, n=48):
    v, f = [], []
    for k in range(n):
        a = 2 * math.pi * k / n; c, s = math.cos(a), math.sin(a)
        v += [(cx + r0 * c, cy + r0 * s, z0), (cx + r1 * c, cy + r1 * s, z0), (cx + r1 * c, cy + r1 * s, z1), (cx + r0 * c, cy + r0 * s, z1)]
    for k in range(n):
        a, b = 4 * k, 4 * ((k + 1) % n)
        f += [[a + 1, b + 1, b + 2, a + 2], [a + 3, a + 2, b + 2, b + 3], [a, a + 3, b + 3, b]]
    _add(v, f, m)

def ellipse(cx, cy, rx, ry, n=64): return [(cx + rx * math.cos(2 * math.pi * k / n), cy + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]

# ---------------------------------------------------------------- sân, bãi cỏ, hồ
slab([(-110, -100), (110, -100), (110, 146), (-110, 146)], -3.0, 0.0, 'co2')          # mặt bằng khuôn viên, cỏ (váy 3 m che chỗ địa hình trũng)
slab([(-9, 128), (9, 128), (9, 146), (-9, 146)], 0.0, 0.03, 'san')                     # lối vào sau cổng
slab(ellipse(0, 86, 51, 51 * 0.82), 0.0, 0.06, 'co')                                    # bãi cỏ bầu dục đường kính 102 m
for sx in (-1, 1):                                                                       # hai bãi cỏ hai bên nhà
    slab([(sx * 50, -95), (sx * 104, -95), (sx * 104, 30), (sx * 50, 30)], 0.0, 0.05, 'co')
ring(0, 86, 10.5, 12.0, 0.0, 0.55, 'sat')                                                # vòng hồ tròn giữa bãi cỏ
slab(ellipse(0, 86, 10.5, 10.5, 32), 0.0, 0.12, 'nuoc')
ring(0, 86, 3.2, 4.2, 0.0, 1.1, 'trang', 24)                                             # tượng trắng giữa hồ (giản lược)
for k in range(8):
    a = 2 * math.pi * k / 8; lathe(3.7 * math.cos(a), 86 + 3.7 * math.sin(a), 1.1, [(0, 0.5), (0.5, 0.25)], 'trang', 4)
# hồ bán nguyệt trước sảnh + bể phun nước bên phải (ảnh)
slab([(x, 13 + 4 * math.cos(x / 44 * math.pi / 2)) for x in np.linspace(-44, 44, 23)] + [(44, 12), (-44, 12)], 0.0, 0.1, 'nuoc')
box(30, 46, 10, 16, 0, 1.0, 'da'); box(31, 45, 11, 15, 1.0, 1.05, 'nuoc')

# ---------------------------------------------------------------- nhà chính (chữ T)
W = 42.8
box(-W - 1, W + 1, -28.5, 11.5, 0, 1.2, 'bechong')                                       # bệ, sân trước sảnh
for i in range(10):                                                                      # bậc thềm giữa
    box(-12, 12, 11.5 + i * 0.45, 11.5 + (i + 1) * 0.45, 0, 1.2 - i * 0.12, 'bechong')
for s in np.linspace(-38, 38, 14):                                                       # chậu cây cảnh trên thềm
    if abs(s) < 13: continue
    box(s - 0.5, s + 0.5, 9.6, 10.6, 1.2, 1.9, 'trang'); lathe(s, 10.1, 1.9, [(0, 0.2), (0.6, 0.9), (1.8, 0.6), (3.0, 0.1)], 'la', 6)
# tầng nền: lùi vào, ốp đá hai đầu, kính ở giữa
box(-W + 1, W - 1, -26, -4, 1.2, 5.2, 'kinh')
for sx in (-1, 1): box(sx * 28, sx * (W - 0.5), -27, -3, 1.2, 5.2, 'da') if sx > 0 else box(sx * (W - 0.5), sx * 28, -27, -3, 1.2, 5.2, 'da')
for s in np.linspace(-26, 26, 9): box(s - 0.5, s + 0.5, -4.5, -3.5, 1.2, 5.2, 'trang')   # cột tầng nền
box(-W - 0.8, W + 0.8, -28.5, 0.8, 5.2, 6.0, 'trang')                                    # sàn tầng 1 (đua ra)
# tầng 1–2
box(-W, W, -27.5, -1.2, 6.0, 15.6, 'tuong')
box(-W + 1, W - 1, -1.3, -1.0, 6.2, 15.4, 'kinh')                                        # nền tối sau rèm hoa đá
nbay = 23; xs = np.linspace(-W, W, nbay + 1)
for x in xs: box(x - 0.28, x + 0.28, -1.2, 0.6, 6.0, 15.6, 'trang')                      # cột đứng chia ô
for fl, (z0, z1) in enumerate([(6.3, 10.6), (11.1, 15.4)]):
    box(-W, W, -1.2, 0.3, z1, z1 + 0.5 if fl == 0 else z1, 'trang')
    for i in range(nbay):
        a, b = xs[i] + 0.3, xs[i + 1] - 0.3; c = (a + b) / 2
        if abs(c) > 29:                                                                  # hai đầu: tường + cửa sổ
            box(a, b, -1.15, -0.95, z0, z1, 'tuong'); box(c - 0.7, c + 0.7, -0.96, -0.9, z0 + 1.2, z1 - 0.6, 'kinh')
            box(c - 0.8, c + 0.8, -0.95, -0.7, z0 + 0.5, z0 + 1.1, 'bechong')
        elif abs(c) < 6.5: continue                                                      # giữa: ban công
        else:                                                                            # rèm hoa đá: thanh tiện thắt eo
            for xx in np.linspace(a + 0.25, b - 0.25, 5):
                h = z1 - z0; lathe(xx, -0.7, z0, [(0, 0.10), (h * 0.18, 0.26), (h * 0.5, 0.08), (h * 0.82, 0.26), (h, 0.10)], 'trang', 6)
# ban công giữa (đua ra), hai tầng
for z in (10.4, 15.2):
    box(-7.2, 7.2, -1.2, 4.0, z - 0.45, z, 'trang'); box(-7.2, 7.2, 3.6, 4.0, z, z + 1.0, 'trang')
    for sx in (-1, 1): box(sx * 7.2 - 0.2, sx * 7.2 + 0.2, -1.2, 4.0, z, z + 1.0, 'trang')
box(-6.8, 6.8, -1.3, -1.0, 6.0, 15.6, 'kinh')
for sx in (-1, 1): box(sx * 7.2 - 0.35, sx * 7.2 + 0.35, -1.2, 4.0, 5.2, 16.2, 'trang')
box(-W - 1.2, W + 1.2, -29, 1.4, 15.6, 17.0, 'trang')                                    # mái đua tầng 2
# tầng 3 lùi vào + hàng cau, lầu thượng mái bằng
box(-W + 3, W - 3, -25, -4, 17.0, 20.8, 'tuong'); box(-W + 4, W - 4, -4.1, -3.9, 17.6, 20.2, 'kinh')
box(-W + 2.5, W - 2.5, -25.5, -3.5, 20.8, 21.4, 'trang')
box(-W - 1.2, W + 1.2, 0.9, 1.4, 17.0, 18.1, 'trang')                                    # lan can sân thượng
for s in [-37, -31, -26, -21, -15, 15, 21, 26, 31, 37]:                                  # cau trên sân thượng (ảnh)
    cyl(s, -1.5, 17.0, 21.5, 0.15, 'than', 5)
    for k in range(6): a = k * math.pi / 3; box(s - 0.1, s + 0.1, -1.6, -1.4, 21.3, 21.5, 'la'); blob(s + 1.1 * math.cos(a), -1.5 + 1.1 * math.sin(a), 21.3, 0.9, 'la', 0.25)
box(-15, 15, -20, -6, 21.4, 24.6, 'kinh')                                                # lầu thượng: kính + cột trắng
for s in np.linspace(-15, 15, 9): box(s - 0.3, s + 0.3, -6.3, -5.7, 21.4, 24.6, 'trang')
box(-19.5, 19.5, -23.5, -2.5, 24.6, 26.0, 'trang')                                       # mái bằng đua rộng — đỉnh 26 m
for s in (-1.6, 0, 1.6): cyl(s, -4.0, 26.0, 33.0, 0.07, 'sat', 5)                         # cột cờ
# thân sau (nối chữ T)
box(-16.4, 15.8, -76.5, -27.5, 1.2, 15.6, 'tuong')
for z in (7.8, 12.6):
    for sx in (-16.5, 15.9): box(sx - 0.05, sx + 0.05, -74, -30, z - 1.4, z + 1.2, 'kinh')
box(-17, 16.4, -77, -27, 15.6, 17.0, 'trang'); box(-13, 12, -70, -30, 17.0, 20.6, 'tuong')

# ---------------------------------------------------------------- hàng rào, cổng, chòi gác
DF = 146.0
for x in np.arange(-104, 104.1, 3.2):
    if abs(x) < 8.6: continue
    box(x - 0.22, x + 0.22, DF - 0.22, DF + 0.22, 0, 2.3, 'trang')
for sgn in (-1, 1):
    a, b = (8.6, 104) if sgn > 0 else (-104, -8.6)
    box(a, b, DF - 0.15, DF + 0.15, 0, 0.55, 'trang'); box(a, b, DF - 0.04, DF + 0.04, 0.55, 2.0, 'sat'); box(a, b, DF - 0.08, DF + 0.08, 2.0, 2.1, 'sat')
    box(sgn * 8.0 - 0.5, sgn * 8.0 + 0.5, DF - 0.5, DF + 0.5, 0, 3.0, 'trang')          # trụ cổng
    box(sgn * 12 - 1.5, sgn * 12 + 1.5, DF - 6, DF - 3, 0, 2.8, 'tuong'); box(sgn * 12 - 1.8, sgn * 12 + 1.8, DF - 6.3, DF - 2.7, 2.8, 3.1, 'trang')   # chòi gác
for x in (-104, 104): box(x - 0.15, x + 0.15, -100, DF, 0, 2.0, 'sat')
# hai cánh cổng sắt — đối tượng riêng để xe tăng húc (bản lề ở trụ ±7,5 m, cánh hướng vào giữa)
for ten, sgn in (('CongTrai', -1), ('CongPhai', 1)):
    T = ([], [], []); x0 = 0.0
    box(0, 7.4, -0.06, 0.06, 0.1, 0.25, 'sat', T); box(0, 7.4, -0.06, 0.06, 2.25, 2.4, 'sat', T)
    for k in range(25): xx = 0.15 + k * 0.29; box(xx - 0.04, xx + 0.04, -0.04, 0.04, 0.1, 2.55, 'sat', T)
    box(0, 7.4, -0.05, 0.05, 1.2, 1.32, 'sat', T)
    if sgn > 0: T = ([(-x, y, z) for x, y, z in T[0]], [q[::-1] for q in T[1]], T[2])        # cánh phải: từ bản lề +7,5 m vào giữa
    OBJ[ten] = (T, (sgn * 7.5, DF, 0))

# ---------------------------------------------------------------- cây (trong khuôn viên và công viên hai bên Lê Duẩn)
rng = np.random.default_rng(1975)
def tree(x, y, h):                                                                       # cây nhiệt đới tán tròn rộng (sao, dầu, me…)
    cyl(x, y, 0, h * 0.62, 0.35 + h * 0.012, 'than', 6)
    for k in range(6):
        r = h * rng.uniform(0.13, 0.18); a = rng.uniform(0, 6.3); o = h * 0.12 if k else 0
        blob(x + o * math.cos(a), y + o * math.sin(a), h * rng.uniform(0.68, 0.9), r, 'la', r * 0.85)
for _ in range(70):                                                                      # hai bên + sau nhà
    x = rng.uniform(55, 102) * rng.choice([-1, 1]); y = rng.uniform(-92, 135); tree(x, y, rng.uniform(16, 26))
for _ in range(30):
    x = rng.uniform(-100, 100); y = rng.uniform(-98, -82); tree(x, y, rng.uniform(14, 22))
for _ in range(110):                                                                     # công viên hai bên Lê Duẩn ngoài cổng (ảnh 1975)
    x = rng.uniform(22, 100) * rng.choice([-1, 1]); y = rng.uniform(158, 330); tree(x, y, rng.uniform(18, 28))

# ---------------------------------------------------------------- xuất
bpy.ops.wm.read_factory_settings(use_empty=True)
mats = []
for k, (c, r) in MATS.items():
    m = bpy.data.materials.new(k); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*[x ** 2.2 for x in c], 1); b.inputs['Roughness'].default_value = r; mats.append(m)
def make(name, VV, FF, MM, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name); me.from_pydata(VV, [], FF); me.update()
    for m in mats: me.materials.append(m)
    for p, mi in zip(me.polygons, MM): p.material_index = mi
    ob = bpy.data.objects.new(name, me); ob.location = loc; bpy.context.collection.objects.link(ob)
    import bmesh; bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = False
    return ob
make('DinhDocLap', V, F, M)
for ten, (T, loc) in OBJ.items(): make(ten, *T, loc=loc)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('xong', out, 'tam giác ~', sum(len(q) - 2 for q in F))
