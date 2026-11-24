"""Xếp nhà cho tầng nội đô sa bàn HCM 1975 → packs/ho-chi-minh-1975/props/nha/xep.json (bộ máy chỉ đọc và vẽ hàng loạt).
python3 xep_nha.py <hcm1975_osm.json> <gói ho-chi-minh-1975>
Theo ảnh anh Thắng gửi 24/11/2026: phố nhìn từ trên cao (mái ngói đỏ cam, mái tôn, nhà bê tông mái bằng xen kẽ, kín cả trong lõi khối phố) và
nhà lá trên cọc ven kênh (ảnh kênh Hàng Bàng, Chợ Lớn trước 1975).
  1. Mặt phố: hai bên mọi đường OSM (đã bỏ đường làm sau 1975 như dung_dia_hinh.py). Sát lộ trình xe tăng: 4 kiểu nhà chi tiết (Nha*), mặt tiền cách tim 18 m (chừa chỗ
     người dân đứng). Đường khác: nhà xa ít mặt (Xa*), mặt tiền sát lề.
  2. Lõi khối phố: lưới 8 m, nhà xa quay mặt về đường gần nhất.
  3. Ven kênh hẹp (rộng < 90 m) và bờ Thủ Thiêm: nhà lá trên cọc chìa ra nước, xuồng, ghe — trừ chỗ bờ là đường (bến, kè).
Không xếp: đường, nước, công viên, nghĩa trang, đất quân sự, sân bay, khuôn viên Dinh. Vùng xếp: bán kính 2,6 km quanh trung tâm + hành lang 400 m theo lộ trình.
Toàn bộ là MINH HOẠ mật độ đô thị năm 1975, không phải bản đồ từng căn nhà."""
import json, math, re, sys, random
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, maximum_filter, binary_dilation
OSM, GOI = sys.argv[1], sys.argv[2]
L = json.load(open(OSM))['layers'][1]
meta = json.load(open(f'{GOI}/terrain/noi-do/meta.json'))
import os; src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dia_hinh', 'dung_dia_hinh.py')).read()
MOI = re.compile(src.split("MOI = re.compile(r'")[1].split("')")[0].replace("'\n                 r'", ''))
kx = 111320.0 * math.cos(math.radians(meta['lat0'])); ky = 110574.0
PL = json.load(open(f'{GOI}/placement.json'))
TUYEN = [np.array(PL['duong']['dinh']), np.array(PL['duong']['causg_thinghe'])]
TAM, RV, HL = (900.0, 800.0), 2600.0, 400.0           # tâm, bán kính vùng xếp, hành lang theo lộ trình
M = 2.0                                                # m / ô
X0, X1, Y0, Y1 = -2200.0, 4000.0, -2200.0, 4000.0
W, Hh = int((X1 - X0) / M), int((Y1 - Y0) / M)
def P(g): return [((lo - meta['lon0']) * kx - X0) / M for lo, la in g], [(Y1 - (la - meta['lat0']) * ky) / M for lo, la in g]
def pts(g): xs, ys = P(g); return list(zip(xs, ys))
def ve(): im = Image.new('L', (W, Hh), 0); return im, ImageDraw.Draw(im)
duong, dd = ve(); goc, dg = ve(); nuoc, dn = ve(); cam, dc = ve()
RONG = {'trunk': 24, 'primary': 18, 'secondary': 12, 'tertiary': 9, 'unclassified': 6, 'residential': 6, 'living_street': 4}
CAP = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street']
exec('def rings_of' + src.split('def rings_of')[1].split('\ndef ')[0])       # nối vành relation (ngoài/trong) như dung_dia_hinh.py
def vanh(e): return [g for g, ngoai in rings_of(e) if ngoai]
roads = []
for e in L['el']:
    t = e.get('tags', {})
    if e['t'] == 'w' and t.get('highway') in RONG and not MOI.search(t.get('name', '') + ' ' + t.get('ref', '')):
        if t.get('bridge') or t.get('tunnel'): continue
        roads.append((CAP.index(t['highway']), RONG[t['highway']], pts(e['g'])))
    if t.get('natural') == 'water':
        R_ = rings_of(e)
        for g, ngoai in R_:
            if ngoai: dn.polygon(pts(g), fill=255)
        for g, ngoai in R_:
            if not ngoai: dn.polygon(pts(g), fill=0)
    if e['t'] == 'w' and t.get('waterway'):
        r = {'river': 60, 'canal': 20, 'stream': 6}.get(t['waterway'], 0)
        if r: dn.line(pts(e['g']), fill=255, width=max(1, round(r / M)))
    if t.get('leisure') == 'park' or t.get('landuse') in ('military', 'cemetery') or t.get('aeroway') or re.search('Dinh Độc Lập|Hội trường Thống Nhất', t.get('name', '')):
        for g in vanh(e): dc.polygon(pts(g), fill=255)
roads.sort(key=lambda r: r[0])
for cap, r, p in roads[::-1]:
    dd.line(p, fill=255, width=max(1, round(r / M)))
    for (x0, y0), (x1, y1) in zip(p, p[1:]):                       # hướng đường (0–179°) cho lõi khối phố
        dg.line([(x0, y0), (x1, y1)], fill=1 + int(math.degrees(math.atan2(y1 - y0, x1 - x0)) % 180), width=max(1, round(r / M)))
DUONG, NUOC, CAM = np.array(duong) > 0, np.array(nuoc) > 127, np.array(cam) > 127
GOC = np.array(goc)
k = np.arange(W) * M + X0 + M / 2; kk = Y1 - np.arange(Hh) * M - M / 2; XX, YY = np.meshgrid(k, kk)
VUNG = (XX - TAM[0]) ** 2 + (YY - TAM[1]) ** 2 < RV ** 2
def kc_tuyen(x, y):
    best = 1e9
    for T in TUYEN:
        a, b = T[:-1], T[1:]; ab = b - a; t = np.clip(((x - a[:, 0]) * ab[:, 0] + (y - a[:, 1]) * ab[:, 1]) / np.maximum((ab ** 2).sum(1), 1e-9), 0, 1)
        best = min(best, float(np.min(np.hypot(a[:, 0] + t * ab[:, 0] - x, a[:, 1] + t * ab[:, 1] - y))))
    return best
# hành lang theo lộ trình
hl = Image.new('L', (W, Hh), 0); dh = ImageDraw.Draw(hl)
for T in TUYEN: dh.line([((x - X0) / M, (Y1 - y) / M) for x, y in T], fill=255, width=round(2 * HL / M))
VUNG |= np.array(hl) > 0
SAT = np.zeros_like(VUNG); sat = Image.new('L', (W, Hh), 0); ds = ImageDraw.Draw(sat)
for T in TUYEN: ds.line([((x - X0) / M, (Y1 - y) / M) for x, y in T], fill=255, width=round(2 * 40 / M))
SAT = np.array(sat) > 0                                             # sát lộ trình: nhà chi tiết
# khuôn viên Dinh và trục công viên trước cổng tới nhà thờ Đức Bà (khung DL của rieng.js: gốc (27,5; 21), trục ra cổng DN) — trống, không nhà; chỗ đặt máy quay cảnh cổng Dinh
DU_, DN_ = (0.7357, -0.6773), (0.6773, 0.7357); sD = (XX - 27.5) * DU_[0] + (YY - 21) * DU_[1]; dD = (XX - 27.5) * DN_[0] + (YY - 21) * DN_[1]
DINH = ((np.abs(sD) < 230) & (dD > -260) & (dD < 230)) | ((np.abs(sD) < 80) & (dD >= 230) & (dD < 760))
dai = Image.new('L', (W, Hh), 0); dd2 = ImageDraw.Draw(dai)
for T in TUYEN: dd2.line([((x - X0) / M, (Y1 - y) / M) for x, y in T], fill=255, width=round(2 * 17.5 / M))
CHAN = DUONG | binary_dilation(NUOC, iterations=2) | CAM | ~VUNG | (np.array(dai) > 0) | DINH    # ô không được đặt nhà (dải 17,5 m hai bên lộ trình xe tăng: chỗ người dân đứng)
OCC = np.zeros_like(CHAN)
def o(x, y): return int((Y1 - y) / M), int((x - X0) / M)
def chan(x, y, cho=CHAN):
    i, j = o(x, y); return not (0 <= i < Hh and 0 <= j < W) or cho[i, j] or OCC[i, j]
def khung(x, y, fx, fy, w, d, y0=0.0):                               # lưới điểm trên nền nhà: mặt tiền tại (x, y), quay ra (fx, fy)
    rx, ry = -fy, fx; out = []
    for a in np.linspace(-w / 2 + 0.6, w / 2 - 0.6, max(2, int(w / 2.5) + 1)):
        for b in np.linspace(y0 + 0.6, d - 0.6, max(2, int((d - y0) / 2.5) + 1)): out.append((x + rx * a - fx * b, y + ry * a - fy * b))
    return out
def dat_duoc(x, y, fx, fy, w, d, cho=CHAN, y0=0.0):
    return all(not chan(px, py, cho) for px, py in khung(x, y, fx, fy, w, d, y0))
def danh_dau(x, y, fx, fy, w, d, y0=0.0):
    for px, py in khung(x, y, fx, fy, w, d, y0): i, j = o(px, py); OCC[i, j] = True
    for px, py in khung(x, y, fx, fy, w + 1.0, d + 0.5, y0): i, j = o(px, py); OCC[i, j] = True
OUT = {}
def them(kieu, x, y, fx, fy, sx=1.0):
    OUT.setdefault(kieu, []).extend([round(x), round(y), round(math.degrees(math.atan2(fx, -fy))) % 360, round(sx * 100)])
rnd = random.Random(1975)
CHI_TIET = [('NhaA', 8.0), ('NhaB', 6.0), ('NhaC', 5.0), ('NhaD', 4.5)]
XA = {'XaPho': 5.0, 'XaBeTong': 6.0, 'XaNgoi': 7.0, 'XaTon': 6.0, 'XaBietThu': 12.0}
SAU = {'XaPho': 14, 'XaBeTong': 14, 'XaNgoi': 12.4, 'XaTon': 14, 'XaBietThu': 11.6}
def chon(bang):
    r = rnd.random()
    for kieu, p in bang:
        r -= p
        if r <= 0: return kieu
    return bang[-1][0]
MAT = [('XaPho', 0.42), ('XaBeTong', 0.18), ('XaNgoi', 0.25), ('XaTon', 0.15)]
LOI = [('XaNgoi', 0.42), ('XaTon', 0.33), ('XaPho', 0.15), ('XaBeTong', 0.06), ('XaBietThu', 0.04)]
# 1. mặt phố
for cap, r, p in roads:
    P2 = [(X0 + a * M, Y1 - b * M) for a, b in p]
    for (ax, ay), (bx, by) in zip(P2, P2[1:]):
        Ld = math.hypot(bx - ax, by - ay)
        if Ld < 4: continue
        ux, uy = (bx - ax) / Ld, (by - ay) / Ld
        for sg in (-1, 1):
            nx, ny = -uy * sg, ux * sg                                  # pháp tuyến ra phía nhà
            s = 2.0
            while s < Ld - 2:
                mx, my = ax + ux * s, ay + uy * s
                i, j = o(mx, my)
                if not (0 <= i < Hh and 0 <= j < W) or not VUNG[i, j]: s += 6; continue
                gan = SAT[i, j] and cap <= 3
                if gan: kieu, w = CHI_TIET[rnd.randrange(4)]; d, lui = 14.0, max(18.0, r / 2 + 1.5)
                else:
                    kieu = 'XaBietThu' if cap >= 5 and rnd.random() < 0.07 else chon(MAT); w = XA[kieu]; d = SAU[kieu]; lui = r / 2 + (4.0 if kieu == 'XaBietThu' else 1.2)
                cx, cy = mx + ux * w / 2 + nx * lui, my + uy * w / 2 + ny * lui
                if dat_duoc(cx, cy, -nx, -ny, w, d):
                    danh_dau(cx, cy, -nx, -ny, w, d); them(kieu, cx, cy, -nx, -ny); s += w + (rnd.random() * 5 if rnd.random() < 0.1 else 0.1)
                else: s += 1.5
# 2. lõi khối phố (quay mặt về đường gần nhất)
dist, (ii, jj) = distance_transform_edt(~DUONG, return_indices=True)
O = [(x, y) for y in np.arange(Y0 + 4, Y1, 8.0) for x in np.arange(X0 + 4, X1, 8.0)]; rnd.shuffle(O)
for x, y in O:
    x += rnd.uniform(-2, 2); y += rnd.uniform(-2, 2); i, j = o(x, y)
    if not (0 <= i < Hh and 0 <= j < W) or CHAN[i, j] or OCC[i, j] or rnd.random() > 0.9: continue
    gx, gy = X0 + jj[i, j] * M - x, Y1 - ii[i, j] * M - y; g = math.hypot(gx, gy)
    if g < 1: continue
    fx, fy = gx / g, gy / g
    if g > 60:                                                      # xa đường: xoay theo hướng đường gần nhất cho thẳng hàng
        a = math.radians(GOC[ii[i, j], jj[i, j]] - 1); fx, fy = (-math.sin(a), -math.cos(a)) if (-math.sin(a)) * gx + (-math.cos(a)) * gy > 0 else (math.sin(a), math.cos(a))
    kieu = chon(LOI); sx = rnd.uniform(0.9, 1.5) if kieu in ('XaNgoi', 'XaTon') else 1.0; w = XA[kieu] * sx; d = SAU[kieu]
    if dat_duoc(x, y, fx, fy, w, d): danh_dau(x, y, fx, fy, w, d); them(kieu, x, y, fx, fy, sx)
# 3. nhà lá ven kênh
hw = distance_transform_edt(NUOC) * M; RONGK = maximum_filter(hw, size=int(120 / M) + 1) * 2       # bề rộng sông/kênh gần đó (m)
dW, (wi, wj) = distance_transform_edt(~NUOC, return_indices=True)
TT = ((XX - 2450) ** 2 + (YY + 450) ** 2 < 1000 ** 2) & (XX > 1600)          # Thủ Thiêm (bờ Đông sông Sài Gòn, đối diện bến Bạch Đằng): xóm nhà lá
from scipy.ndimage import label
lab, _ = label(NUOC); co = np.bincount(lab.ravel()); SONG = NUOC & (co[lab] * M * M > 60000)   # chỉ sông, kênh (bỏ hồ nhỏ, hồ nước trong Dinh)
BO = (~NUOC) & (dW * M <= 2.5) & (VUNG | TT) & ~CAM & ~DINH
dR = distance_transform_edt(~DUONG) * M
cand = list(zip(*np.nonzero(BO))); rnd.shuffle(cand); nla = 0
CHAN_LA = DUONG | CAM | DINH | ~(VUNG | TT)
for i, j in cand:
    x, y = X0 + j * M + M / 2, Y1 - i * M - M / 2
    if dR[i, j] < 10 or OCC[i, j]: continue                          # bờ là đường (bến, kè): bỏ
    gx, gy = X0 + wj[i, j] * M + M / 2 - x, Y1 - wi[i, j] * M - M / 2 - y; g = math.hypot(gx, gy)
    if g < 0.5: continue
    fx, fy = gx / g, gy / g                                         # mặt trước nhìn ra nước
    if not SONG[wi[i, j], wj[i, j]]: continue
    rk = RONGK[wi[i, j], wj[i, j]]
    thu_thiem = rk >= 90 and TT[i, j] and fx < -0.3
    if rk >= 90 and not thu_thiem: continue
    if rnd.random() > 0.55: continue
    kieu = chon([('LaA', 0.4), ('LaB', 0.35), ('LaC', 0.25)]); w = {'LaA': 5.4, 'LaB': 7.6, 'LaC': 3.8}[kieu]
    sau = {'LaA': 5.0, 'LaB': 4.5, 'LaC': 3.0}[kieu]
    if not dat_duoc(x, y, fx, fy, w, sau, CHAN_LA): continue
    danh_dau(x, y, fx, fy, w, sau); them(kieu, x, y, fx, fy); nla += 1
    for px, py in khung(x + fx * 6, y + fy * 6, fx, fy, w, 6.0): i2, j2 = o(px, py); OCC[i2, j2] = True     # sàn chìa ra nước
    if rnd.random() < 0.45:                                         # xuồng, ghe đậu trước nhà, song song bờ
        bx, by = x + fx * (8.5 + rnd.random() * 2), y + fy * (8.5 + rnd.random() * 2); bi, bj = o(bx, by)
        if 0 <= bi < Hh and 0 <= bj < W and NUOC[bi, bj]: sg = 1 if rnd.random() < .5 else -1; them('Ghe' if rnd.random() < 0.35 else 'Xuong', bx, by, sg * fy, -sg * fx)
# 4. xóm nhà lá trong đất Thủ Thiêm (rải thưa, quay về đường hoặc bờ gần nhất)
O = [(x, y) for y in np.arange(-1500, 600, 13.0) for x in np.arange(1600, 3500, 13.0)]; rnd.shuffle(O)
for x, y in O:
    x += rnd.uniform(-4, 4); y += rnd.uniform(-4, 4); i, j = o(x, y)
    if not (0 <= i < Hh and 0 <= j < W) or not TT[i, j] or NUOC[i, j] or CHAN_LA[i, j] or OCC[i, j] or rnd.random() > 0.3: continue
    if dist[i, j] * M > 120 and dW[i, j] * M > 120 and rnd.random() > 0.25: continue        # bám đường, bờ kênh
    if dW[i, j] * M > 150: gx, gy = X0 + jj[i, j] * M - x, Y1 - ii[i, j] * M - y
    else: gx, gy = X0 + wj[i, j] * M - x, Y1 - wi[i, j] * M - y
    g = math.hypot(gx, gy) or 1; fx, fy = gx / g, gy / g
    kieu = chon([('LaA', 0.35), ('LaB', 0.4), ('LaC', 0.25)]); w = {'LaA': 5.4, 'LaB': 7.6, 'LaC': 3.8}[kieu]
    if dat_duoc(x, y, fx, fy, w, 5.0, CHAN_LA | NUOC, -6.0):
        danh_dau(x, y, fx, fy, w, 5.0, -6.0); them(kieu, x, y, fx, fy); nla += 1
print('nhà lá', nla)
tong = {k: len(v) // 4 for k, v in OUT.items()}
print(tong, 'tổng', sum(tong.values()))
json.dump(dict(ghiChu='Xếp bằng tools/sa_ban/nha/xep_nha.py — MINH HOẠ mật độ nhà năm 1975 (không phải bản đồ từng căn). Mỗi kiểu: dãy [x, y_Bắc (m, Blender), góc quay độ (three, quanh trục đứng), bề ngang %].',
               nguon='Đường, sông, công viên: © OpenStreetMap contributors (ODbL); kiểu nhà theo ảnh anh Thắng gửi 24/11/2026', kieu=OUT),
          open(f'{GOI}/props/nha/xep.json', 'w'), ensure_ascii=False, separators=(',', ':'))
