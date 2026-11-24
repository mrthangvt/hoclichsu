"""Dựng terrain/ cho sa bàn HCM 1975 (bộ máy 2.1: meta.json, height.png [R·256+G = độ cao 16 bit, B = nước], color.jpg)
từ hcm1975_dem.json (đã giải ra h_<tầng>.npy bằng dem.py) + hcm1975_osm.json.
Lọc theo năm 1975: bỏ hồ chứa xây sau 1975 (lấp lại mặt địa hình từ bờ), bỏ cao tốc và các đường, cầu, hầm làm sau 1975 (danh sách MOI)."""
import json, math, re, sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import median_filter, gaussian_filter, binary_dilation, distance_transform_edt
OSM = json.load(open(sys.argv[1])); OUT = sys.argv[2]
MOI = re.compile(r'Võ Văn Kiệt|Mai Chí Thọ|Nguyễn Văn Linh|Phạm Văn Đồng|Nguyễn Hữu Cảnh|Nguyễn Hữu Thọ|Võ Chí Công|Hầm|hầm|Cầu vượt|cầu vượt|Cầu Phú Mỹ|Sài Gòn 2|Thủ Thiêm|'
                 r'Kỳ Hà|Giồng Ông Tố|Giồng Ống Tố|Cầu Nguyễn Văn Cừ|Tân Thuận 2|Thị Nghè 2|Bình Triệu 2|Điện Biên Phủ 2|Văn Thánh 2|Mỹ Thủy 2|Mỹ Thủy 3|Rạch Đỉa 2|Tham Lương 2|Kênh Tẻ|Cao tốc|Vành đai')
HO_MOI_KM2 = 3.0          # hồ chứa (water=reservoir) lớn hơn mức này: coi là xây sau 1975 → bỏ
TEN_1975 = {'Thành phố Hồ Chí Minh': 'Sài Gòn', 'Đồng Nai': 'Biên Hòa', 'Long Khánh': 'Xuân Lộc (Long Khánh)'}
def rings_of(e):
    """Danh sách (vành, là_ngoài). Way kín = 1 vành ngoài; relation: nối các đoạn thành vành."""
    if e['t'] == 'w': return [(e['g'], True)] if len(e['g']) > 3 and e['g'][0] == e['g'][-1] else []
    out = []
    for role in ('outer', 'inner'):
        segs = [list(m['g']) for m in e['m'] if m['role'] == role and len(m['g']) > 1]
        while segs:
            r = segs.pop(0)
            changed = True
            while r[0] != r[-1] and changed:
                changed = False
                for i, s in enumerate(segs):
                    if s[0] == r[-1]: r += s[1:]
                    elif s[-1] == r[-1]: r += s[::-1][1:]
                    elif s[-1] == r[0]: r = s[:-1] + r
                    elif s[0] == r[0]: r = s[::-1][:-1] + r
                    else: continue
                    segs.pop(i); changed = True; break
            if len(r) > 3: out.append((r, role == 'outer'))
    return out
def area_km2(g, kx, ky):
    a = 0
    for (x1, y1), (x2, y2) in zip(g, g[1:]): a += x1 * y2 - x2 * y1
    return abs(a) / 2 * kx * ky / 1e6
for tang, L in zip(['chien-dich', 'noi-do'], OSM['layers']):
    T = json.load(open(f't_{tang}.json')); N, half, R = T['N'], T['half'], T['R']
    kx = 111320.0 * math.cos(math.radians(T['lat0'])); ky = 110574.0
    H = np.load(f'h_{tang}.npy').astype(np.float64)
    C = 2048 if tang == 'chien-dich' else 4096          # cạnh ảnh màu
    def P(g, S):  # kinh-vĩ → pixel ảnh cạnh S (hàng 0 = Bắc)
        return [((lo - T['lon0']) * kx / (2 * half) * S + S / 2, -(la - T['lat0']) * ky / (2 * half) * S + S / 2) for lo, la in g]
    nuoc = Image.new('L', (C, C), 0); dn = ImageDraw.Draw(nuoc)
    homoi = Image.new('L', (N, N), 0); dh = ImageDraw.Draw(homoi)
    bo_ho = []
    for e in L['el']:
        t = e['tags']
        if t.get('natural') != 'water': continue
        rs = rings_of(e)
        if t.get('water') == 'reservoir':
            a = sum(area_km2(g, kx, ky) for g, o in rs if o)
            if a > HO_MOI_KM2:
                bo_ho.append((t.get('name') or '?', round(a, 1)))
                for g, o in rs: dh.polygon(P(g, N), fill=255 if o else 0)
                continue
        for g, o in rs:
            if o: dn.polygon(P(g, C), fill=255)
        for g, o in rs:
            if not o: dn.polygon(P(g, C), fill=0)
    # sông, kênh dạng đường (chỗ OSM chưa có mặt nước)
    mpp = 2 * half / C
    for e in L['el']:
        w = e['tags'].get('waterway')
        if e['t'] != 'w' or not w: continue
        rong = {'river': 60, 'canal': 20, 'stream': 6, 'ditch': 3, 'drain': 3}.get(w, 4)
        dn.line(P(e['g'], C), fill=255, width=max(1, round(rong / mpp)))
    # hồ chứa mới: lấp mặt hồ bằng nội suy từ bờ (thung lũng trước khi ngập — phỏng dựng), hạ lòng sông cũ 6 m
    hm = np.array(homoi) > 127
    if hm.any():
        bo = binary_dilation(hm, iterations=2) & ~hm
        idx = distance_transform_edt(~bo, return_distances=False, return_indices=True)
        fill = gaussian_filter(H[idx[0], idx[1]], 6)
        H[hm] = fill[hm]
    if tang == 'noi-do': H = gaussian_filter(np.minimum(median_filter(H, 7), 25.0), 4)   # bỏ nhà cao tầng hôm nay, làm mượt nhiễu DEM (~55 m)
    nuocN = np.array(nuoc.resize((N, N), Image.BILINEAR)) > 100
    if tang == 'chien-dich':   # biển: OSM không có vùng nước biển → ô thấp hơn 0,5 m nối liền mép Nam
        from scipy.ndimage import label
        lab, _ = label(H < 0.5); bien = np.isin(lab, np.unique(lab[-1, :][lab[-1, :] > 0]))
        nuocN |= bien; dn.bitmap((0, 0), Image.fromarray((bien * 255).astype(np.uint8)).resize((C, C), Image.NEAREST), fill=255)
    if hm.any():  # dòng sông chảy qua vùng hồ cũ
        song = Image.new('L', (N, N), 0); ds = ImageDraw.Draw(song)
        for e in L['el']:
            if e['t'] == 'w' and e['tags'].get('waterway') == 'river': ds.line(P(e['g'], N), fill=255, width=2)
        s = (np.array(song) > 127) & binary_dilation(hm, iterations=3); H[s] -= 6; nuocN |= s
    H[nuocN] = np.minimum(H[nuocN], np.percentile(H[nuocN], 50) if nuocN.any() else 0)
    H[nuocN] -= 1.5
    hmin, hmax = float(H.min()), float(H.max())
    q = np.round((H - hmin) / (hmax - hmin) * 65535).astype(np.uint32)
    hp = np.stack([(q >> 8).astype(np.uint8), (q & 255).astype(np.uint8), (nuocN * 255).astype(np.uint8)], -1)
    import os; os.makedirs(f'{OUT}/{tang}', exist_ok=True)
    Image.fromarray(hp).save(f'{OUT}/{tang}/height.png', optimize=True)
    # ảnh màu: nền đất + bóng đồi + nước + đường
    Hc = np.array(Image.fromarray(H.astype(np.float32)).resize((C, C), Image.BILINEAR))
    px = 2 * half / C; ex = 6 if tang == 'chien-dich' else 3
    gy, gx = np.gradient(Hc * ex, px); sl = np.arctan(np.hypot(gx, gy)); asp = np.arctan2(-gx, gy)
    s = np.clip(np.sin(np.radians(40)) * np.cos(sl) + np.cos(np.radians(40)) * np.sin(sl) * np.cos(np.radians(315) - asp), 0, 1)
    t_ = np.interp(Hc, [0, 5, 20, 80, 250, 700], [0, .15, .35, .6, .85, 1])
    land = np.stack([np.interp(t_, [0, .15, .35, .6, .85, 1], v) for v in ([138, 150, 168, 176, 160, 214], [154, 160, 160, 150, 128, 206], [96, 98, 104, 104, 96, 190])], -1)
    img = land * (0.55 + 0.6 * s[..., None])
    wm = np.array(nuoc) > 127
    img[wm] = [62, 96, 112]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    bo_duong = 0
    KIEU = {'trunk': (8, (120, 72, 40)), 'primary': (6, (130, 92, 56)), 'secondary': (4, (140, 112, 80)), 'tertiary': (3, (150, 130, 104)),
            'unclassified': (2, (150, 136, 112)), 'residential': (2, (156, 144, 124)), 'living_street': (1, (156, 144, 124))}
    if tang == 'chien-dich': KIEU = {'trunk': (170, (128, 58, 30)), 'primary': (120, (138, 80, 44)), 'secondary': (60, (150, 110, 76))}
    for hw in ['living_street', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk']:
        if hw not in KIEU: continue
        rong, mau = KIEU[hw]
        for e in L['el']:
            t = e['tags']
            if e['t'] != 'w' or t.get('highway') != hw: continue
            if MOI.search(t.get('name', '') + ' ' + t.get('ref', '')): bo_duong += 1; continue
            d.line(P(e['g'], C), fill=mau, width=max(1, round((rong if tang == 'chien-dich' else rong * 4) / px)) if tang == 'chien-dich' else max(1, round(rong * 3.0 / px)))
    k = (np.arange(C) + .5) / C * 2 * half - half; X, Y = np.meshgrid(k, -k)
    a = np.array(im); a[X ** 2 + Y ** 2 > R ** 2] = (a[X ** 2 + Y ** 2 > R ** 2] * 0.55 + 40).astype(np.uint8)
    Image.fromarray(a).save(f'{OUT}/{tang}/color.jpg', quality=86, optimize=True)
    # nhãn
    places = []
    for e in L['el']:
        t = e['tags']
        if e['t'] == 'n' and t.get('place') in ('city', 'town'):
            x = (e['c'][0] - T['lon0']) * kx; y = (e['c'][1] - T['lat0']) * ky
            if x * x + y * y < R * R: places.append([t['place'], TEN_1975.get(t.get('name'), t.get('name')), round(x), round(y)])
    meta = dict(lat0=T['lat0'], lon0=T['lon0'], R=R, half=half, N=N, hmin=round(hmin, 2), hmax=round(hmax, 2), places=places,
                ghiChu='Toạ độ m: x Đông, y Bắc (Blender). Độ cao thật (chưa phóng đại). Lọc 1975: bỏ hồ ' + ', '.join(f'{n} ({a} km²)' for n, a in bo_ho) + f'; bỏ {bo_duong} đoạn đường/cầu/hầm làm sau 1975 (lọc theo tên, sơ bộ).',
                nguon='DEM: AWS Terrain Tiles (Terrarium); sông, đường: © OpenStreetMap contributors (ODbL), tải 24/11/2026')
    json.dump(meta, open(f'{OUT}/{tang}/meta.json', 'w'), ensure_ascii=False)
    print(tang, 'hmin %.1f hmax %.1f' % (hmin, hmax), 'nuoc %.1f%%' % (nuocN.mean() * 100), 'bo ho', bo_ho, 'bo duong', bo_duong, 'nhan', len(places))
