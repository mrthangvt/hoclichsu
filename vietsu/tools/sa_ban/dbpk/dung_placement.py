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
# ---------------- nhà phố nội thành (V0.2, anh Thắng 26/11: "nhà xếp lại theo đúng các tuyến đường trên bản đồ"): nhà ống xếp thành dãy mặt tiền
# dọc hai bên từng tuyến đường OSM (đường lớn trước, rồi ngõ phố), mặt nhà quay ra đường, không đè lên nhau, không đè lên đường khác, không xuống nước.
# Phố Khâm Thiên dựng riêng (nhaKT: mẫu nhà phố của gói HCM 1975, thưa hơn 1/3) để quay cận cảnh đổ vỡ sau trận bom 26/12.
NT_LL = np.array([(la, lo) for la, lo in NOI_THANH]); RO = 1.5                            # ô lưới chiếm chỗ 1,5 m
xy = [T(lo, la) for la, lo in NOI_THANH + GIA_LAM]; X0, X1 = min(p[0] for p in xy) - 50, max(p[0] for p in xy) + 50; Z0, Z1 = min(p[1] for p in xy) - 50, max(p[1] for p in xy) + 50
NX, NZ = int((X1 - X0) / RO) + 1, int((Z1 - Z0) / RO) + 1
gp = lambda x, z: ((x - X0) / RO, (z - Z0) / RO)
HW = {'trunk': 10, 'primary': 9, 'secondary': 7.5, 'tertiary': 6, 'residential': 3.2, 'unclassified': 3.5, 'living_street': 3}
roadI = Image.new('L', (NX, NZ), 0); dr = ImageDraw.Draw(roadI)
DS = []
for e in O:
    if e['t'] != 'w': continue
    hw = e['tags'].get('highway'); rl = e['tags'].get('railway') == 'rail'
    if hw in HW or rl:
        P = [T(lo, la) for lo, la in e['g']]; w = 4 if rl else HW[hw]
        dr.line([gp(*q) for q in P], fill=255, width=max(1, round(2 * w / RO)))
        if hw in HW and e['tags'].get('bridge') != 'yes' and e['tags'].get('tunnel') != 'yes': DS.append((hw, w, P, e['tags'].get('name') or ''))
watI = Image.new('L', (NX, NZ), 0); dw = ImageDraw.Draw(watI)
for e in O:
    if e['tags'].get('natural') == 'water':
        gs = [e['g']] if e['t'] == 'w' else [m['g'] for m in e['m'] if m['role'] == 'outer']
        for g in gs:
            if len(g) > 2: dw.polygon([gp(*T(lo, la)) for lo, la in g], fill=255)
    if e['t'] == 'w' and e['tags'].get('waterway') in ('river', 'canal'): dw.line([gp(*T(lo, la)) for lo, la in e['g']], fill=255, width=max(1, round(30 / RO)))
for g in out['vung'].values(): dw.polygon([gp(x, z) for x, z in g], fill=255)
ntI = Image.new('L', (NX, NZ), 0); dn = ImageDraw.Draw(ntI)
for poly in (NOI_THANH, GIA_LAM): dn.polygon([gp(*T(lo, la)) for la, lo in poly], fill=255)
KTP = out['duong']['khamthien']; ktI = Image.new('L', (NX, NZ), 0); ImageDraw.Draw(ktI).line([gp(*q) for q in KTP], fill=255, width=round(2 * 30 / RO))
CHAN = (np.array(roadI) > 0) | (np.array(watI) > 0) | (np.array(ntI) == 0)              # [z, x]
KTM = np.array(ktI) > 0; OCC = np.zeros_like(CHAN)
rng = np.random.default_rng(1972)
def dat(cx, cz, yaw, w, d, khong_kt=True):
    """thử đặt hình chữ nhật w (mặt tiền) × d (sâu) tâm (cx, cz), quay yaw; được thì đánh dấu chiếm chỗ"""
    c, s_ = math.cos(yaw), math.sin(yaw); us = np.arange(-w / 2 + 0.4, w / 2 - 0.39, RO * 0.8); vs = np.arange(-d / 2 + 0.4, d / 2 - 0.39, RO * 0.8)
    U, V = np.meshgrid(us, vs); X = cx + U * c + V * s_; Z = cz - U * s_ + V * c
    i = ((Z - Z0) / RO).astype(int); j = ((X - X0) / RO).astype(int)
    if i.min() < 0 or j.min() < 0 or i.max() >= NZ or j.max() >= NX: return False
    if CHAN[i, j].any() or OCC[i, j].any() or (khong_kt and KTM[i, j].any()): return False
    OCC[i, j] = True; return True
def mat_tien(P, hw, rong, sau, tre, ra, cb):
    """đi dọc đường P, hai bên, đặt nhà mặt tiền; ra: lùi thêm (vỉa hè); cb(cx, cz, yaw, w, d) gọi khi đặt được"""
    for sg in (-1, 1):
        for a, b in zip(P, P[1:]):
            L = math.dist(a, b)
            if L < 3: continue
            fx, fz = (b[0] - a[0]) / L, (b[1] - a[1]) / L; nx, nz = fz * sg, -fx * sg   # pháp tuyến ra phía bên sg
            s = rng.uniform(0, 2)
            while s < L - 2:
                w = rng.uniform(*rong); d = rng.uniform(*sau); off = hw + ra + d / 2
                cx, cz = a[0] + fx * (s + w / 2) + nx * off, a[1] + fz * (s + w / 2) + nz * off
                yaw = math.atan2(-nx, -nz)                                                # mặt nhà (+z cục bộ) nhìn ra đường
                if cb(cx, cz, yaw, w, d): s += w + rng.uniform(0, tre)
                else: s += 2.0
nha = []
def them(cx, cz, yaw, w, d):
    if not dat(cx, cz, yaw, w, d): return False
    tang = 1 + (rng.random() < 0.35) + (rng.random() < 0.1); h = 3.2 * tang + rng.uniform(-0.3, 0.6)
    nha.append([round(cx, 1), round(cz, 1), round(yaw, 2), round(w, 1), round(d, 1), round(h, 1), int(rng.random() * 4)]); return True
UT = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'living_street', 'residential']
DS.sort(key=lambda r: UT.index(r[0]))
# Khâm Thiên trước (dãy nhà mẫu HCM, thưa 1/3: mỗi nhà cách nhau ~ nửa bề ngang)
nhaKT = []; LOAI_KT = [('NhaC', 5.4, 14.5, 0.45), ('NhaA', 8.0, 14.1, 0.3), ('XaNgoi', 7.8, 12.8, 0.15), ('NhaD', 4.6, 14.9, 0.1)]
def themKT(cx, cz, yaw, w, d):
    r = rng.random(); k = 0
    while k < 3 and r > LOAI_KT[k][3]: r -= LOAI_KT[k][3]; k += 1
    ten, W_, D_, _ = LOAI_KT[k]; ox, oz = math.sin(yaw) * D_ / 2, math.cos(yaw) * D_ / 2   # mẫu HCM: gốc ở chân mặt tiền, thân lùi về sau
    if not dat(cx, cz, yaw, W_, D_, khong_kt=False): return False
    nhaKT.append([round(cx + ox, 1), round(cz + oz, 1), round(yaw, 3), k, round(rng.random(), 3)]); return True
for hw, w, P, ten in DS:
    if ten == 'Phố Khâm Thiên': mat_tien(P, w, (4.6, 8.0), (14.5, 14.5), 5.0, 1.2, themKT)
for hw, w, P, ten in DS:
    if hw in ('residential', 'living_street', 'unclassified'): mat_tien(P, w, (4.0, 7.0), (8, 13), 1.5, 0.6, lambda *q: rng.random() < 0.62 or them(*q))   # ngõ: chừa khoảng trống (sân, vườn) cho nhẹ
    else: mat_tien(P, w, (4.2, 7.5), (10, 15), 0.4, 2.5, them)
out['nhaKT'] = nhaKT; print('nhà Khâm Thiên', len(nhaKT))
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
