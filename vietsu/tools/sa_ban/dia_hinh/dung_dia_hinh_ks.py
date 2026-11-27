"""Dựng terrain/ cho sa bàn Khe Sanh 1968 (bộ máy 2.2: meta.json, height.png [R·256+G = độ cao 16 bit, B = nước], color.jpg).

python3 dung_dia_hinh_ks.py <khe-sanh-1968_dem.json> <khe-sanh-1968_osm.json> <thư mục gói>

- DEM: tệp do Chrome ghép từ ô Terrarium; mỗi lớp mang sẵn tâm (lat0, lon0), nửa cạnh half, bán kính R, lưới N.
- Tầng 'chien-dich' ghi vào <gói>/terrain/, tầng 'ta-con' vào <gói>/terrain/ta-con/.
- Lọc theo năm 1968 (sơ bộ, theo tên): bỏ hồ chứa (thuỷ điện Rào Quán… xây sau 1968; lấp lại mặt đất nội suy từ bờ — PHỎNG DỰNG),
  bỏ đường Hồ Chí Minh nhánh Tây, cao tốc, đường vành đai. Đường Hồ Chí Minh hiện nay chạy qua khu sân bay Tà Cơn (S15).
- Sông suối vùng núi nằm cao hơn mặt nước chung của bộ máy (0,3 m) nên chỉ vẽ màu trên ảnh và đánh dấu kênh B (isWater), không hạ xuống mặt nước.
"""
import json, math, re, sys, base64, io, os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, binary_dilation, distance_transform_edt

DEM = json.load(open(sys.argv[1])); OSM = json.load(open(sys.argv[2])); GOI = sys.argv[3]
MOI = re.compile(r'Hồ Chí Minh|HCM|Cao tốc|cao tốc|Vành đai|Expressway', re.I)
HO_MOI_KM2 = 0.2           # hồ chứa (water=reservoir) lớn hơn mức này: coi là xây sau 1968 → bỏ
OSM_L = {l['name']: l for l in OSM['layers']}

def luoi_do_cao(L):
    """Giải PNG Terrarium ghép → lưới N×N (hàng 0 = Bắc), nội suy song tuyến như dem.py."""
    im = np.array(Image.open(io.BytesIO(base64.b64decode(L['png'].split(',')[1]))).convert('RGB')).astype(np.float64)
    h = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
    N, half = L['N'], L['half']; k = (np.arange(N) + 0.5) / N * 2 * half - half
    X, Yn = np.meshgrid(k, -k)
    lat = L['lat0'] + Yn / 110574.0; lon = L['lon0'] + X / (111320.0 * math.cos(math.radians(L['lat0'])))
    n = 2 ** L['z']; px = ((lon + 180) / 360 * n - L['x0']) * 256 - 0.5
    py = ((1 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2 * n - L['y0']) * 256 - 0.5
    x0 = np.clip(np.floor(px).astype(int), 0, h.shape[1] - 2); y0 = np.clip(np.floor(py).astype(int), 0, h.shape[0] - 2)
    fx = np.clip(px - x0, 0, 1); fy = np.clip(py - y0, 0, 1)
    g = (h[y0, x0] * (1 - fx) + h[y0, x0 + 1] * fx) * (1 - fy) + (h[y0 + 1, x0] * (1 - fx) + h[y0 + 1, x0 + 1] * fx) * fy
    return np.clip(g, 0, None)

def rings_of(e):
    if e['t'] == 'w': return [(e['g'], True)] if len(e['g']) > 3 and e['g'][0] == e['g'][-1] else []
    out = []
    for role in ('outer', 'inner'):
        segs = [list(m['g']) for m in e['m'] if m['role'] == role and len(m['g']) > 1]
        while segs:
            r = segs.pop(0); changed = True
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
    a = sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(g, g[1:]))
    return abs(a) / 2 * kx * ky / 1e6

for L in DEM['layers']:
    tang = L['name']; O = OSM_L[tang]['el']
    N, half, R = L['N'], L['half'], L['R']
    kx = 111320.0 * math.cos(math.radians(L['lat0'])); ky = 110574.0
    H = luoi_do_cao(L)
    C = 2048 if tang == 'chien-dich' else 4096
    P = lambda g, S: [((lo - L['lon0']) * kx / (2 * half) * S + S / 2, -(la - L['lat0']) * ky / (2 * half) * S + S / 2) for lo, la in g]
    nuoc = Image.new('L', (C, C), 0); dn = ImageDraw.Draw(nuoc)
    homoi = Image.new('L', (N, N), 0); dh = ImageDraw.Draw(homoi); bo_ho = []
    for e in O:
        t = e['tags']
        if t.get('natural') != 'water' or e['t'] == 'n': continue
        rs = rings_of(e)
        if t.get('water') == 'reservoir' or 'thủy điện' in (t.get('name') or '').lower() or 'thuỷ điện' in (t.get('name') or '').lower():
            a = sum(area_km2(g, kx, ky) for g, o in rs if o)
            if a > HO_MOI_KM2:
                bo_ho.append((t.get('name') or '?', round(a, 2)))
                for g, o in rs: dh.polygon(P(g, N), fill=255 if o else 0)
                continue
        for g, o in rs: dn.polygon(P(g, C), fill=255 if o else 0)
    mpp = 2 * half / C
    for e in O:
        w = e['tags'].get('waterway')
        if e['t'] != 'w' or not w: continue
        rong = {'river': 40, 'canal': 10, 'stream': 5}.get(w, 3)
        if tang == 'chien-dich' and w != 'river': continue
        dn.line(P(e['g'], C), fill=255, width=max(1, round(rong / mpp)))
    hm = np.array(homoi) > 127
    if hm.any():   # lòng hồ chứa mới: nội suy từ bờ (thung lũng trước khi ngập — phỏng dựng), hạ lòng sông cũ 4 m
        bo = binary_dilation(hm, iterations=2) & ~hm
        idx = distance_transform_edt(~bo, return_distances=False, return_indices=True)
        H[hm] = gaussian_filter(H[idx[0], idx[1]], 4)[hm]
        song = Image.new('L', (N, N), 0); ds = ImageDraw.Draw(song)
        for e in O:
            if e['t'] == 'w' and e['tags'].get('waterway') in ('river', 'stream'): ds.line(P(e['g'], N), fill=255, width=1)
        s = (np.array(song) > 127) & binary_dilation(hm, iterations=3); H[s] -= 4
        dn.bitmap((0, 0), Image.fromarray((s * 255).astype(np.uint8)).resize((C, C), Image.NEAREST), fill=255)
    nuocN = np.array(nuoc.resize((N, N), Image.BILINEAR)) > 100
    H = np.maximum(H, 0.6)
    hmin, hmax = float(H.min()), float(H.max())
    q = np.round((H - hmin) / (hmax - hmin) * 65535).astype(np.uint32)
    hp = np.stack([(q >> 8).astype(np.uint8), (q & 255).astype(np.uint8), (nuocN * 255).astype(np.uint8)], -1)
    ra = os.path.join(GOI, 'terrain') if tang == 'chien-dich' else os.path.join(GOI, 'terrain', tang)
    os.makedirs(ra, exist_ok=True)
    Image.fromarray(hp).save(f'{ra}/height.png', optimize=True)
    # ảnh màu: rừng núi theo độ cao + bóng đồi + sông + đường (màu là MINH HOẠ)
    Hc = np.array(Image.fromarray(H.astype(np.float32)).resize((C, C), Image.BILINEAR))
    px = 2 * half / C; ex = 2.0 if tang == 'chien-dich' else 1.5
    gy, gx = np.gradient(Hc * ex, px); sl = np.arctan(np.hypot(gx, gy)); asp = np.arctan2(-gx, gy)
    s = np.clip(np.sin(np.radians(42)) * np.cos(sl) + np.cos(np.radians(42)) * np.sin(sl) * np.cos(np.radians(315) - asp), 0, 1)
    t_ = np.interp(Hc, [0, 40, 150, 400, 800, 1600], [0, .2, .4, .6, .8, 1])
    T6 = [0, .2, .4, .6, .8, 1]
    land = np.stack([np.interp(t_, T6, v) for v in ([150, 132, 104, 86, 78, 96], [158, 150, 128, 112, 102, 112], [100, 92, 76, 70, 66, 80])], -1)
    nz = gaussian_filter(np.random.default_rng(7).standard_normal((C, C)), 2.5 if tang == 'ta-con' else 1.5)
    img = land * (0.5 + 0.62 * s[..., None]) * (1 + 0.06 * nz[..., None])
    img[np.array(nuoc) > 127] = [74, 98, 96]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    bo_duong = 0
    if tang == 'chien-dich': KIEU = {'trunk': (90, (150, 96, 60)), 'primary': (70, (150, 104, 70)), 'secondary': (40, (150, 118, 88))}
    else: KIEU = {'trunk': (10, (150, 100, 66)), 'primary': (9, (150, 104, 70)), 'secondary': (7, (150, 116, 86)), 'tertiary': (5, (148, 122, 96)),
                  'unclassified': (4, (144, 124, 100)), 'track': (3, (140, 124, 102))}
    for hw in ['track', 'unclassified', 'tertiary', 'secondary', 'primary', 'trunk']:
        if hw not in KIEU: continue
        rong, mau = KIEU[hw]
        for e in O:
            t = e['tags']
            if e['t'] != 'w' or t.get('highway') != hw: continue
            if MOI.search(t.get('name', '') + ' ' + t.get('ref', '')): bo_duong += 1; continue
            d.line(P(e['g'], C), fill=mau, width=max(1, round(rong / px)))
    k = (np.arange(C) + .5) / C * 2 * half - half; X, Y = np.meshgrid(k, -k)
    a = np.array(im); ngoai = X ** 2 + Y ** 2 > R ** 2; a[ngoai] = (a[ngoai] * 0.55 + 40).astype(np.uint8)
    Image.fromarray(a).save(f'{ra}/color.jpg', quality=86, optimize=True)
    places = []
    for e in O:
        t = e['tags']
        if e['t'] == 'n' and t.get('place') in (('city', 'town') if tang == 'chien-dich' else ('city', 'town', 'village')):
            x = (e['c'][0] - L['lon0']) * kx; y = (e['c'][1] - L['lat0']) * ky
            if x * x + y * y < R * R: places.append([t['place'], t.get('name:vi') or t.get('name'), round(x), round(y)])
    meta = dict(lat0=L['lat0'], lon0=L['lon0'], R=R, half=half, N=N, hmin=round(hmin, 2), hmax=round(hmax, 2), places=places,
                ghiChu='Toạ độ m: x Đông, y Bắc (Blender). Độ cao thật (chưa phóng đại). Lọc 1968 (sơ bộ): bỏ hồ chứa '
                       + (', '.join(f'{n} ({a} km²)' for n, a in bo_ho) or 'không có') + f'; bỏ {bo_duong} đoạn đường làm sau 1968 (theo tên). Nhãn places là tên hiện nay, nhãn 1968 đặt ở GĐ4.',
                nguon='DEM: AWS Terrain Tiles (Terrarium); sông, đường: © OpenStreetMap contributors (ODbL), tải 25/11/2026')
    json.dump(meta, open(f'{ra}/meta.json', 'w'), ensure_ascii=False)
    print(tang, 'hmin %.1f hmax %.1f' % (hmin, hmax), 'nuoc %.2f%%' % (nuocN.mean() * 100), 'bo ho', bo_ho, 'bo duong', bo_duong, 'nhan', len(places))
