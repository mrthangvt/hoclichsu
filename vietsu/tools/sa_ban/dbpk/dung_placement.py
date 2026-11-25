"""placement.json cho sa bàn Điện Biên Phủ trên không 1972: nhà phố nội thành (MINH HOẠ), các tuyến phố, cầu Long Biên, đường băng,
khuôn viên Bạch Mai, hồ Hữu Tiệp… lấy từ OSM hôm nay (dbpk1972_du-lieu-v2.json), toạ độ three (x Đông, z Nam) của từng tầng.

python3 dung_placement.py <dbpk1972_du-lieu-v2.json> <thư mục gói>
"""
import json, math, sys, re
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, gaussian_filter

F = json.load(open(sys.argv[1])); GOI = sys.argv[2]
DEM = {d['name']: d for d in F['dem']}
NOI_THANH = [(21.0560, 105.8370), (21.0520, 105.8530), (21.0430, 105.8600), (21.0230, 105.8620), (21.0050, 105.8640), (20.9930, 105.8600),
             (20.9930, 105.8400), (20.9990, 105.8260), (21.0080, 105.8150), (21.0220, 105.8100), (21.0390, 105.8110), (21.0470, 105.8190), (21.0530, 105.8290)]
GIA_LAM = [(21.0560, 105.8720), (21.0560, 105.8920), (21.0400, 105.8960), (21.0380, 105.8760)]     # thị trấn Gia Lâm cũ (ước lượng)

def khung(tang):
    L = DEM[tang]; kx = 111320.0 * math.cos(math.radians(L['lat0'])); ky = 110574.0
    return (lambda lo, la: (round((lo - L['lon0']) * kx, 1), round(-(la - L['lat0']) * ky, 1))), L

def noi(ways):
    """nối các đoạn đường cùng tên thành chuỗi dài nhất"""
    segs = [list(map(tuple, g)) for g in ways]; best = []
    while segs:
        r = segs.pop(0); ch = True
        while ch:
            ch = False
            for i, s in enumerate(segs):
                if s[0] == r[-1]: r += s[1:]
                elif s[-1] == r[-1]: r += s[::-1][1:]
                elif s[-1] == r[0]: r = s[:-1] + r
                elif s[0] == r[0]: r = s[::-1][:-1] + r
                else: continue
                segs.pop(i); ch = True; break
        if len(r) > len(best): best = r
    return best

def dai(P): return sum(math.dist(a, b) for a, b in zip(P, P[1:]))

out = {'note': 'Toạ độ three (x Đông, z Nam, m) theo tầng. Nhà phố, vị trí, kích thước là MINH HOẠ (OSM hôm nay + ranh giới nội thành cũ ước lượng). Dựng bằng tools/sa_ban/dbpk/dung_placement.py.',
       'inst': {}, 'groups': [], 'duong': {}, 'vung': {}, 'nha': []}
# ---------------- tầng Hà Nội
T, L = khung('ha-noi'); O = F['osm']['ha-noi']
def ten_w(rx, hw=None):
    return [e['g'] for e in O if e['t'] == 'w' and re.search(rx, e['tags'].get('name') or '') and (hw is None or e['tags'].get('highway') in hw)]
for k, rx, hw in [('khamthien', r'^Phố Khâm Thiên$', ('secondary', 'tertiary')), ('longbien', r'^Cầu Long Biên$', ('residential',)), ('dinhtienhoang', r'^Phố Đinh Tiên Hoàng$', ('secondary',)),
                  ('trangtien', r'^Phố Tràng Tiền$', ('secondary',)), ('hangbong', r'^Phố Hàng Bông$', ('secondary', 'tertiary')), ('leduan', r'^Đường Lê Duẩn$', ('secondary',)),
                  ('giaiphong', r'^Đường Giải Phóng$', ('primary', 'secondary')), ('hoanghoatham', r'^Đường Hoàng Hoa Thám$', ('secondary',)), ('nguyenthaihoc', r'^Phố Nguyễn Thái Học$', ('secondary',))]:
    P = noi(ten_w(rx, hw)); out['duong'][k] = [T(lo, la) for lo, la in P]; print(k, len(P), round(dai(out['duong'][k])), 'm')
for k, rx in [('bachmai', r'^Bệnh viện Bạch Mai$'), ('nhamayxelua', r'^Nhà máy Xe lửa Gia Lâm$')]:
    e = next(e for e in O if e['t'] == 'w' and re.search(rx, e['tags'].get('name') or ''))
    out['vung'][k] = [T(lo, la) for lo, la in e['g']]
for k, rx in [('huutiep', r'^Hồ Hữu Tiệp$'), ('hoankiem', r'^Hồ Hoàn Kiếm$')]:
    e = next(e for e in O if e['t'] == 'r' and re.search(rx, e['tags'].get('name') or ''))
    g = noi([m['g'] for m in e['m'] if m['role'] == 'outer']); out['vung'][k] = [T(lo, la) for lo, la in g]
for e in O:
    if e['t'] == 'w' and e['tags'].get('aeroway') == 'runway':
        k = {'02/20': 'rw_gialam', '11L/29R': 'rw_noibai', '11R/29L': 'rw_noibai2'}.get(e['tags'].get('ref'))
        if k: out['duong'][k] = [T(lo, la) for lo, la in e['g']]
# đường sắt qua cầu Long Biên (đoạn gần nhất)
# ---------------- nhà phố nội thành: lưới ~13 m, lệch ngẫu nhiên; tránh đường lớn, nước; quay mặt ra đường gần nhất
S = 4096; half = L['half']; px = 2 * half / S
toPix = lambda x, z: (x / (2 * half) * S + S / 2, z / (2 * half) * S + S / 2)
road = Image.new('L', (S, S), 0); dr = ImageDraw.Draw(road)
for e in O:
    if e['t'] == 'w' and e['tags'].get('highway') in ('trunk', 'primary', 'secondary', 'tertiary'):
        dr.line([toPix(*T(lo, la)) for lo, la in e['g']], fill=255, width=max(1, round({'trunk': 16, 'primary': 14, 'secondary': 11, 'tertiary': 8}[e['tags']['highway']] / px)))
    if e['t'] == 'w' and e['tags'].get('railway') == 'rail':
        dr.line([toPix(*T(lo, la)) for lo, la in e['g']], fill=255, width=max(1, round(8 / px)))
wat = Image.new('L', (S, S), 0); dw = ImageDraw.Draw(wat)
for e in O:
    if e['tags'].get('natural') == 'water':
        gs = [e['g']] if e['t'] == 'w' else [m['g'] for m in e['m'] if m['role'] == 'outer']
        for g in gs:
            if len(g) > 2: dw.polygon([toPix(*T(lo, la)) for lo, la in g], fill=255)
    if e['t'] == 'w' and e['tags'].get('waterway') in ('river', 'canal'):
        dw.line([toPix(*T(lo, la)) for lo, la in e['g']], fill=255, width=max(1, round(30 / px)))
for g in out['vung'].values(): dw.polygon([toPix(x, z) for x, z in g], fill=255)        # khuôn viên Bạch Mai, nhà máy: dựng riêng
R_ = np.array(road) > 0; W_ = np.array(wat) > 0
dist, ind = distance_transform_edt(~R_, return_indices=True)
nt = Image.new('L', (S, S), 0); dn = ImageDraw.Draw(nt)
for poly in (NOI_THANH, GIA_LAM): dn.polygon([toPix(*T(lo, la)) for la, lo in poly], fill=255)
NT = np.array(nt) > 0
rng = np.random.default_rng(1972); nha = []
step = 21.0
xs = np.arange(-half, half, step)
for x in xs:
    for z in xs:
        X = x + rng.uniform(-3, 3); Z = z + rng.uniform(-3, 3); i, j = int(Z / px + S / 2), int(X / px + S / 2)
        if not (0 <= i < S and 0 <= j < S) or not NT[i, j] or W_[i, j]: continue
        d = dist[i, j] * px
        if d < 5: continue
        if d > 34 and rng.random() < 0.75: continue                                      # trong lõi ô phố thưa hơn (sân, ngõ)
        ri, rj = ind[0][i, j], ind[1][i, j]; yaw = math.atan2((rj - j), (ri - i))       # hướng ra đường gần nhất (three: +z Nam)
        tang = 1 + (rng.random() < 0.35) + (rng.random() < 0.12)
        w = rng.uniform(4.5, 8); dd = rng.uniform(9, 14); h = 3.2 * tang + rng.uniform(-0.3, 0.6)
        nha.append([round(X, 1), round(Z, 1), round(yaw, 2), round(w, 1), round(dd, 1), round(h, 1), int(rng.random() * 4)])
out['nha'] = nha; print('nhà', len(nha))
# ---------------- tầng miền Bắc: đường băng Yên Bái (gần toạ độ sân bay Yên Bái)
T2, L2 = khung('mien-bac'); O2 = F['osm']['mien-bac']; yb = T2(104.8725, 21.7275); best = None
for e in O2:
    if e['t'] == 'w' and e['tags'].get('aeroway') == 'runway':
        P = [T2(lo, la) for lo, la in e['g']]; c = np.mean(P, 0); d = math.dist(c, yb)
        if best is None or d < best[0]: best = (d, P)
out['duong']['mb_rw_yenbai'] = best[1]; print('đường băng Yên Bái lệch', round(best[0]), 'm')
json.dump(out, open(f'{GOI}/placement.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('placement.json', round(len(json.dumps(out)) / 1024), 'KB')
