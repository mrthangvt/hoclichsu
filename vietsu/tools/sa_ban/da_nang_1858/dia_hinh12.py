# V1.2 – địa hình sa bàn tròn Đà Nẵng 1858 (tâm 16,1169595 B · 108,1969851 Đ, R 9 417 m)
# Ra: goi/terrain/{h.png (cao độ 16 bit RG, 2048, ±16 km), dist.png (khoảng cách bờ, 2048), mau.jpg (4096 vòng trong), phong.jpg (1024 ±16 km)}
import json, math, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
OUT = '/home/claude/v12/goi/terrain/'
import os; os.makedirs(OUT, exist_ok=True)
C = (16.1169595, 108.1969851); R = 9417.0
mLat = 111320.0; mLon = 111320 * math.cos(math.radians(C[0]))
d = json.load(open('/mnt/user-data/uploads/Downloads/danang1858_v12_du-lieu.json'))
HALF_IN = 10240.0; NI = 1024
dem = np.load('dem14.npy').astype(np.float64)
bad = dem < -60
dem[bad] = np.nan
# lấp ô hỏng bằng trung bình lân cận
idx = ndimage.distance_transform_edt(np.isnan(dem), return_distances=False, return_indices=True)
dem = dem[tuple(idx)]
# DEM cũ (z13, ±16 km quanh 16,095/108,21) cho vùng ngoài
OC = (16.095, 108.21); oLon = 111320 * math.cos(math.radians(OC[0]))
oldZ = np.load('/home/claude/dn/Z.npy'); oldW = np.load('/home/claude/dn/water.npy')
dxo = (C[1] - OC[1]) * oLon; dno = (C[0] - OC[0]) * mLat   # tâm mới trong hệ cũ

# ---- lưới chung 2048 × 2048, ±16 km quanh tâm mới (15,6 m/ô)
HALF = 16000.0; M = 2048; px = 2 * HALF / M
jj, ii = np.mgrid[0:M, 0:M]
X = -HALF + (ii + 0.5) * px; Nn = HALF - (jj + 0.5) * px
def samp(arr, half, n, x, y, order=1):
    fi = (x + half) / (2 * half / n) - 0.5; fj = (half - y) / (2 * half / n) - 0.5
    return ndimage.map_coordinates(arr, [fj, fi], order=order, mode='nearest')
H_in = samp(dem, HALF_IN, NI, X, Nn)
H_old = samp(oldZ.astype(np.float64), 16000, 1024, X + dxo, Nn + dno)
inner_sq = (np.abs(X) < HALF_IN - 40) & (np.abs(Nn) < HALF_IN - 40)
old_ok = (np.abs(X + dxo) < 15900) & (np.abs(Nn + dno) < 15900)

# ---- mặt nạ nước (OSM) ở lưới 2048
def P(p): return [((x + HALF) / px, (HALF - y) / px) for x, y in p]
def noi_vong(ways):
    ways = [list(map(tuple, w)) for w in ways if len(w) > 1]; rings = []
    while ways:
        r = ways.pop(0)
        changed = True
        while changed and r[0] != r[-1]:
            changed = False
            for k, w in enumerate(ways):
                if w[0] == r[-1]: r += w[1:]; ways.pop(k); changed = True; break
                if w[-1] == r[-1]: r += w[::-1][1:]; ways.pop(k); changed = True; break
                if w[-1] == r[0]: r = w[:-1] + r; ways.pop(k); changed = True; break
                if w[0] == r[0]: r = w[::-1][:-1] + r; ways.pop(k); changed = True; break
        rings.append(r)
    return rings
wat = Image.new('L', (M, M), 0); dw = ImageDraw.Draw(wat)
holes = Image.new('L', (M, M), 0); dh = ImageDraw.Draw(holes)
coast = Image.new('L', (M, M), 0); dc = ImageDraw.Draw(coast)
beach = Image.new('L', (M, M), 0); db = ImageDraw.Draw(beach)
moat = []
for o in d['osm']:
    t = o['t']
    if o['k'] == 'w':
        p = o['p']; closed = len(p) > 3 and p[0] == p[-1]
        if t.get('natural') == 'coastline': dc.line(P(p), fill=255, width=3)
        elif t.get('natural') == 'water' or t.get('waterway') == 'riverbank':
            def dt(q): return abs(sum(q[i][0] * q[i - 1][1] - q[i - 1][0] * q[i][1] for i in range(len(q)))) / 2
            giu = t.get('waterway') == 'riverbank' or t.get('water') in ('river', 'canal') or (t.get('water') is None and closed and dt(p) > 60000)
            if closed and giu: dw.polygon(P(p), fill=255)
        elif t.get('natural') in ('beach', 'sand') and closed: db.polygon(P(p), fill=255)
        elif t.get('waterway') in ('river', 'canal'):
            wd = 6 if t.get('waterway') == 'canal' else 10
            dw.line(P(p), fill=255, width=max(1, int(wd / px)))
    else:
        outer = noi_vong([m['p'] for m in o['m'] if m['role'] != 'inner'])
        inner = noi_vong([m['p'] for m in o['m'] if m['role'] == 'inner'])
        if t.get('water') == 'moat':
            moat = outer; continue
        if t.get('water') in ('reservoir', 'lake', 'pond'): continue
        for r in outer:
            if len(r) > 3: dw.polygon(P(r), fill=255)
        for r in inner:
            if len(r) > 3: dh.polygon(P(r), fill=255)
riv = (np.array(wat) > 0) & ~(np.array(holes) > 0)
wall = np.array(coast) > 0
cand = (H_in <= 0.05)
cand = ndimage.binary_opening(cand, iterations=2)
lab, n = ndimage.label(cand)
sz = ndimage.sum(np.ones_like(lab), lab, range(n + 1))
sea = np.isin(lab, np.where(sz > 40000)[0]) & (lab > 0)
# lấp đảo đất nhỏ trong biển, bỏ vũng nước nhỏ trên đất
labL, nL = ndimage.label(~sea)
szL = ndimage.sum(np.ones_like(labL), labL, range(nL + 1))
sea |= np.isin(labL, np.where(szL < 3000)[0]) & (labL > 0)
sea = ndimage.binary_closing(sea, iterations=2)
sea = ndimage.gaussian_filter(sea.astype(float), 1.5) > 0.5
sea &= inner_sq & ~riv
# ngoài ô vuông DEM mới: dùng mặt nạ cũ
oldwat = samp(oldW.astype(np.float64), 16000, 1024, X + dxo, Nn + dno, 0) > 0.5
water_in = sea | riv
water = np.where(inner_sq, water_in, np.where(old_ok, oldwat, Nn > 0))
# biển vs sông: sông = nước trong ô vuông không thuộc biển
is_river = water & inner_sq & riv & ~(((Nn + 2444.53) > -650) & ((X - 1392.03) > 300) & ((X - 1392.03) < 2800))
water = ndimage.binary_opening(water, iterations=1) | is_river
json.dump({'moat': moat}, open('moat.json', 'w'))
print('nuoc', water.mean(), 'song', is_river.sum())

# ---- độ cao
H = np.where(inner_sq, H_in, np.where(old_ok, H_old, np.where(Nn > 0, -25, 1.0)))
# mép vùng mới/cũ: hoà 600 m
w_in = np.clip(np.minimum(HALF_IN - np.abs(X), HALF_IN - np.abs(Nn)) / 600, 0, 1)
H = np.where(old_ok, H_in * w_in + H_old * (1 - w_in), H)
dl = ndimage.distance_transform_edt(~water) * px          # đất → nước
dsea = ndimage.distance_transform_edt(water) * px          # nước → bờ
Hl = np.maximum(H, 0)
# ven bờ: bãi thoải từ 0,5 m tại mép nước lên 2,5 m ở 150 m (bãi cát), không lồi lõm
coastal = np.minimum(0.5 + dl * 0.012, 2.5)
Hl = np.where(dl < 220, np.minimum(np.maximum(Hl, coastal), np.maximum(coastal, Hl * np.clip((dl - 60) / 160, 0, 1))), Hl)
Hl = np.maximum(Hl, 0.5)
seaw = water & ~is_river
dep_sea = -np.minimum(0.6 + dsea * 0.018 + (dsea > 200) * (dsea - 200) * 0.01, 26)
dep_riv = -np.minimum(0.6 + dsea * 0.06, 6.5)
Z = np.where(water, np.where(is_river, dep_riv, dep_sea), Hl)
Z = np.where(water, np.minimum(Z, np.minimum(H, 0) if False else Z), Z)
Z = ndimage.gaussian_filter(Z, 0.8)
Z = np.where(water, np.minimum(Z, -0.6), np.maximum(Z, 0.45))
np.save('Z12.npy', Z.astype(np.float32)); np.save('W12.npy', water); np.save('R12.npy', is_river)
v = np.clip(np.round((Z + 100) * 100), 0, 65535).astype(np.uint16)
Image.fromarray(np.stack([v >> 8, v & 255, np.zeros_like(v)], -1).astype(np.uint8)).save(OUT + 'h.png', optimize=True)
# khoảng cách bờ (cho sóng): kênh R = khoảng cách trong nước (m/2, tối đa 254 m), G = 255 nếu sông, B = khoảng cách trên đất (m/2)
dd = np.clip(dsea / 2, 0, 255).astype(np.uint8)
Image.fromarray(np.stack([dd, (is_river * 255).astype(np.uint8), np.clip(dl / 2, 0, 255).astype(np.uint8)], -1)).save(OUT + 'dist.png', optimize=True)
print('Z', Z.min(), Z.max())
