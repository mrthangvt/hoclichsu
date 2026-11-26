"""Dựng terrain/ cho sa bàn Hà Nội – Điện Biên Phủ trên không 1972 (bộ máy 2.2: meta.json, height.png [R·256+G = độ cao 16 bit, B = nước], color.jpg).

python3 dung_dia_hinh_dbpk.py <dbpk1972_du-lieu.json> <thư mục gói>

- Tệp vào do Chrome trên máy anh Thắng dựng (26/11/2026): DEM Terrarium đã nội suy ra lưới N×N (Int16, đơn vị 0,5 m, hàng 0 = Bắc)
  quanh tâm (lat0, lon0) nửa cạnh half; OSM rút gọn (Douglas–Peucker) cho hai tầng.
- Tầng 'ha-noi' (đặt đầu, mặc định) ghi vào <gói>/terrain/, tầng 'mien-bac' vào <gói>/terrain/mien-bac/.
- Lọc theo năm 1972 (sơ bộ, PHỎNG DỰNG):
  * bỏ hồ chứa xây sau 1972 (Hòa Bình, Cửa Đạt, Trung Sơn, Hủa Na, Xạ Hương, Núi Cốc…): mọi hồ water=reservoir > 0,3 km² trừ danh sách giữ
    (Thác Bà tích nước 1971, Đại Lải, Suối Hai, Đồng Mô, Quan Sơn); lòng hồ nội suy lại từ bờ, hạ lòng sông cũ 4 m;
  * Hà Nội: bỏ hồ điều hoà, hồ đô thị mới (tên chứa "điều hòa", Yên Sở, Harmony, Trung Tâm, Nam Cường…);
    đường cao tốc, vành đai, đại lộ, cầu làm sau 1972 (Thăng Long 1985, Chương Dương 1985, Thanh Trì, Vĩnh Tuy, Nhật Tân…) không vẽ;
  * khu phố 1972: chỉ tô màu phố (mái ngói) trong vòng nội thành cũ (vẽ tay theo ranh giới bốn quận nội thành trước 1974, ƯỚC LƯỢNG),
    ngoài vòng đó là làng (lũy tre) + ruộng — đô thị hoá hôm nay không vẽ.
- Mặt nước của bộ máy cố định 0,3 m: Hà Nội hạ toàn bộ địa hình 5 m rồi đào lòng sông, hồ xuống −1,5 m (mặt sông Hồng mùa cạn ~5 m — ước lượng);
  miền Bắc: biển (DEM ≤ 0,5 m) và sông lớn vùng đồng bằng đào xuống −1,5 m; sông vùng núi chỉ tô màu.
"""
import json, math, re, sys, base64, os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, binary_dilation, distance_transform_edt, median_filter

F = json.load(open(sys.argv[1])); GOI = sys.argv[2]
TANG = {'ha-noi': dict(R=18000.0, C=4096, ra='terrain'), 'mien-bac': dict(R=125000.0, C=4096, ra='terrain/mien-bac')}
GIU_HO = re.compile(r'Thác Bà|Đại Lải|Suối Hai|Đồng Mô|Quan Sơn|Hồ Tây|Hoàn Kiếm|Trúc Bạch|Hữu Tiệp|Thiền Quang|Bảy Mẫu|Ba Mẫu|Linh Đàm|Văn Chương|Giảng Võ|Thành Công|Thủ Lệ|Kim Liên|Đống Đa|Ngọc Khánh|Thanh Nhàn', re.I)
HO_MOI = re.compile(r'điều hòa|điều hoà|Yên Sở|Harmony|Trung Tâm|Nam Cường|Times|Vinhomes|Ecopark|Hồ Tai Trâu|Phú Đô|Mễ Trì|Lai Ốc', re.I)
DUONG_MOI = re.compile(r'cao tốc|Cao tốc|Vành đai|vành đai|Đại lộ|Thăng Long|Chương Dương|Thanh Trì|Vĩnh Tuy|Nhật Tân|Võ Nguyên Giáp|Võ Văn Kiệt|Phạm Văn Đồng|Võ Chí Công|Nguyễn Văn Huyên|Lạc Long Quân|Âu Cơ|Phạm Hùng|Lê Văn Lương|Tố Hữu|Trần Duy Hưng|Khuất Duy Tiến|Nguyễn Xiển|Đỗ Mười|Mai Dịch|CT\d|AH\d', re.I)
# nội thành Hà Nội cũ (ƯỚC LƯỢNG theo ranh giới bốn khu phố nội thành ~1961–1974): đa giác (vĩ, kinh)
NOI_THANH = [(21.0560, 105.8370), (21.0520, 105.8530), (21.0430, 105.8600), (21.0230, 105.8620), (21.0050, 105.8640), (20.9930, 105.8600),
             (20.9930, 105.8400), (20.9990, 105.8260), (21.0080, 105.8150), (21.0220, 105.8100), (21.0390, 105.8110), (21.0470, 105.8190), (21.0530, 105.8290)]

def rings_of(e):
    if e['t'] == 'w': return [(e['g'], True)] if len(e['g']) > 3 and e['g'][0] == e['g'][-1] else []
    out = []
    for role in ('outer', 'inner'):
        segs = [list(map(tuple, m['g'])) for m in e['m'] if m['role'] == role and len(m['g']) > 1]
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

for L in F['dem']:
    tang = L['name']; T = TANG[tang]; O = F['osm'][tang]
    N, half, R, C = L['N'], L['half'], T['R'], T['C']
    kx = 111320.0 * math.cos(math.radians(L['lat0'])); ky = 110574.0
    H = np.frombuffer(base64.b64decode(L['i16']), np.int16).reshape(N, N).astype(np.float64) * L['donVi']
    if tang == 'ha-noi': H = gaussian_filter(median_filter(H, 7), 1.5)    # bỏ nhiễu nhà cao tầng hôm nay trong DEM
    P = lambda g, S: [((lo - L['lon0']) * kx / (2 * half) * S + S / 2, -(la - L['lat0']) * ky / (2 * half) * S + S / 2) for lo, la in g]
    nuoc = Image.new('L', (C, C), 0); dn = ImageDraw.Draw(nuoc)
    homoi = Image.new('L', (N, N), 0); dh = ImageDraw.Draw(homoi); bo_ho = []
    for e in O:
        t = e['tags']
        if t.get('natural') != 'water' or e['t'] == 'n': continue
        rs = rings_of(e); ten = t.get('name') or ''
        a = sum(area_km2(g, kx, ky) for g, o in rs if o)
        moi = (t.get('water') == 'reservoir' and a > 0.3 and not GIU_HO.search(ten)) or 'thủy điện' in ten.lower() or (tang == 'ha-noi' and HO_MOI.search(ten))
        if moi:
            bo_ho.append((ten or '?', round(a, 2)))
            for g, o in rs: dh.polygon(P(g, N), fill=255 if o else 0)
            continue
        for g, o in rs: dn.polygon(P(g, C), fill=255 if o else 0)
    mpp = 2 * half / C
    for e in O:
        w = e['tags'].get('waterway')
        if e['t'] != 'w' or not w: continue
        if tang == 'mien-bac' and w != 'river': continue
        rong = {'river': 60 if tang == 'mien-bac' else 40, 'canal': 8, 'stream': 4, 'drain': 3}.get(w, 3)
        dn.line(P(e['g'], C), fill=255, width=max(1, round(rong / mpp)))
    hm = np.array(homoi) > 127
    if hm.any():
        bo = binary_dilation(hm, iterations=2) & ~hm
        idx = distance_transform_edt(~bo, return_distances=False, return_indices=True)
        H[hm] = gaussian_filter(H[idx[0], idx[1]], 4)[hm]
        song = Image.new('L', (N, N), 0); ds = ImageDraw.Draw(song)
        for e in O:
            if e['t'] == 'w' and e['tags'].get('waterway') in ('river', 'stream'): ds.line(P(e['g'], N), fill=255, width=2)
        s = (np.array(song) > 127) & binary_dilation(hm, iterations=3); H[s] -= 4
        dn.bitmap((0, 0), Image.fromarray((s * 255).astype(np.uint8)).resize((C, C), Image.NEAREST), fill=255)
    nuocC = np.array(nuoc) > 127
    nuocN = np.array(nuoc.resize((N, N), Image.BILINEAR)) > 100
    bien = None
    if tang == 'mien-bac':
        bien = (H <= 0.5)
        H = np.where(bien, -6.0, H)
        dong_bang = gaussian_filter(H, 3) < 25
        dao = nuocN & dong_bang
        H = np.where(dao, np.minimum(H, -1.5), np.maximum(H, 0.6))
        nuocN = nuocN | bien
        H = np.where(~(nuocN), np.maximum(H, 0.8), H)
    else:
        H = H - 5.0
        H = np.where(nuocN, -1.5, np.maximum(H, 0.6))
    hmin, hmax = float(H.min()), float(H.max())
    q = np.round((H - hmin) / (hmax - hmin) * 65535).astype(np.uint32)
    hp = np.stack([(q >> 8).astype(np.uint8), (q & 255).astype(np.uint8), (nuocN * 255).astype(np.uint8)], -1)
    ra = os.path.join(GOI, T['ra']); os.makedirs(ra, exist_ok=True)
    Image.fromarray(hp).save(f'{ra}/height.png', optimize=True)
    # ------- ảnh màu (MINH HOẠ): tháng 12 mùa khô — ruộng đã gặt (vàng nâu), làng lũy tre (xanh sẫm), phố mái ngói nội thành, núi rừng
    Hc = np.array(Image.fromarray(H.astype(np.float32)).resize((C, C), Image.BILINEAR))
    px = 2 * half / C; ex = 2.0 if tang == 'mien-bac' else 1.0
    gy, gx = np.gradient(Hc * ex, px); sl = np.arctan(np.hypot(gx, gy)); asp = np.arctan2(-gx, gy)
    s = np.clip(np.sin(np.radians(42)) * np.cos(sl) + np.cos(np.radians(42)) * np.sin(sl) * np.cos(np.radians(315) - asp), 0, 1)
    rng = np.random.default_rng(7)
    nz = gaussian_filter(rng.standard_normal((C, C)), 1.6)
    if tang == 'mien-bac':
        t_ = np.interp(Hc, [0, 15, 60, 300, 900, 2000], [0, .2, .4, .6, .8, 1]); T6 = [0, .2, .4, .6, .8, 1]
        land = np.stack([np.interp(t_, T6, v) for v in ([150, 146, 104, 80, 74, 100], [146, 140, 124, 104, 96, 108], [104, 96, 74, 66, 62, 84])], -1)
        img = land * (0.55 + 0.6 * s[..., None]) * (1 + 0.07 * nz[..., None])
    else:
        img = np.zeros((C, C, 3)) + np.array([150, 140, 102])          # ruộng sau gặt
        o = gaussian_filter(rng.standard_normal((C, C)), 6)             # ô ruộng loang lổ
        img = img * (1 + 0.08 * o[..., None]) * (1 + 0.05 * nz[..., None])
        lang = Image.new('L', (C, C), 0); dl = ImageDraw.Draw(lang)
        for e in O:                                                    # làng: điểm dân cư OSM hôm nay → cụm lũy tre (MINH HOẠ)
            t = e['tags']
            if e['t'] == 'n' and t.get('place') in ('village', 'quarter', 'neighbourhood', 'suburb'):
                (x, y), = P([e['c']], C); r = 120 / px; dl.ellipse([x - r, y - r * 0.8, x + r, y + r * 0.8], fill=255)
        lm = gaussian_filter(np.array(lang) / 255.0, 3) > 0.35
        img[lm] = img[lm] * 0.35 + np.array([66, 92, 52]) * 0.65
        nt = Image.new('L', (C, C), 0); ImageDraw.Draw(nt).polygon(P([(lo, la) for la, lo in NOI_THANH], C), fill=255)
        ntm = gaussian_filter(np.array(nt) / 255.0, 4)
        pho = np.array([128, 104, 88]) * (1 + 0.12 * gaussian_filter(rng.standard_normal((C, C)), 0.8)[..., None])
        img = img * (1 - ntm[..., None]) + pho * ntm[..., None]
        img = img * (0.86 + 0.14 * s[..., None])
    img[nuocC] = [70, 92, 92] if tang == 'ha-noi' else [72, 96, 98]
    if bien is not None:
        bc = np.array(Image.fromarray((bien * 255).astype(np.uint8)).resize((C, C), Image.BILINEAR)) > 127; img[bc] = [58, 82, 96]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    bo_duong = 0
    if tang == 'mien-bac': KIEU = {'trunk': (220, (156, 120, 86)), 'primary': (140, (150, 122, 92))}
    else: KIEU = {'tertiary': (5, (150, 132, 108)), 'secondary': (8, (156, 136, 110)), 'primary': (10, (160, 140, 112)), 'trunk': (12, (160, 140, 112))}
    for hw in ['tertiary', 'secondary', 'primary', 'trunk']:
        if hw not in KIEU: continue
        rong, mau = KIEU[hw]
        for e in O:
            t = e['tags']
            if e['t'] != 'w' or t.get('highway') != hw: continue
            if DUONG_MOI.search((t.get('name') or '') + ' ' + (t.get('ref') or '')): bo_duong += 1; continue
            d.line(P(e['g'], C), fill=mau, width=max(1, round(rong / px)))
    for e in O:                                                         # đường sắt (đã có từ trước 1972: Hà Nội – Hải Phòng, Lào Cai, Lạng Sơn, Thái Nguyên)
        if e['t'] == 'w' and e['tags'].get('railway') == 'rail':
            d.line(P(e['g'], C), fill=(88, 80, 72), width=max(1, round((3 if tang == 'ha-noi' else 120) / px)))
    k = (np.arange(C) + .5) / C * 2 * half - half; X, Y = np.meshgrid(k, -k)
    a = np.array(im); ngoai = X ** 2 + Y ** 2 > R ** 2; a[ngoai] = (a[ngoai] * 0.55 + 40).astype(np.uint8)
    Image.fromarray(a).save(f'{ra}/color.jpg', quality=85, optimize=True)
    places = []
    for e in O:
        t = e['tags']
        if e['t'] == 'n' and t.get('place') in (('city', 'town') if tang == 'mien-bac' else ('city', 'town', 'suburb')):
            x = (e['c'][0] - L['lon0']) * kx; y = (e['c'][1] - L['lat0']) * ky
            if x * x + y * y < R * R: places.append([t['place'], t.get('name:vi') or t.get('name'), round(x), round(y)])
    meta = dict(lat0=L['lat0'], lon0=L['lon0'], R=R, half=half, N=N, hmin=round(hmin, 2), hmax=round(hmax, 2), places=places,
                ghiChu='Toạ độ m: x Đông, y Bắc (Blender). Độ cao thật (chưa phóng đại)' + ('; hạ 5 m để mặt sông Hồng mùa cạn ngang mặt nước chung (ước lượng)' if tang == 'ha-noi' else '')
                       + '. Lọc 1972 (sơ bộ, PHỎNG DỰNG): bỏ hồ ' + (', '.join(f'{n} ({a} km²)' for n, a in bo_ho[:40]) or 'không có')
                       + f'; không vẽ {bo_duong} đoạn đường làm sau 1972 (theo tên). Nhãn places là tên hiện nay.',
                nguon='DEM: AWS Terrain Tiles (Terrarium); sông, hồ, đường: © OpenStreetMap contributors (ODbL), tải 26/11/2026')
    json.dump(meta, open(f'{ra}/meta.json', 'w'), ensure_ascii=False)
    print(tang, 'hmin %.1f hmax %.1f' % (hmin, hmax), 'nuoc %.2f%%' % (nuocN.mean() * 100), 'bo ho', len(bo_ho), bo_ho[:12], 'bo duong', bo_duong, 'nhan', len(places))
