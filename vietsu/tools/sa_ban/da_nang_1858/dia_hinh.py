# Dựng địa hình sa bàn Đà Nẵng 1858: mặt nạ biển/sông từ OSM, độ cao từ Terrarium, ảnh màu vẽ theo độ cao, độ dốc.
import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
d = json.load(open('/mnt/user-data/uploads/Downloads/danang1858_du-lieu.json'))
HALF = 16000.0; M = 1024; px = 2 * HALF / M   # 31,25 m/ô
def P(p): return [((x + HALF) / px, (HALF - y) / px) for x, y in p]
dem = np.load('dem.npy')   # 512, hàng 0 = Bắc
H = np.array(Image.fromarray(dem).resize((M, M), Image.BICUBIC))

# --- biển: tô từ góc Đông Bắc, đường bờ biển làm tường
wall = Image.new('L', (M, M), 0); dw = ImageDraw.Draw(wall)
for c in d['coast']: dw.line(P(c['p']), fill=255, width=3)
W = np.array(wall) > 0
land0 = ~W
lab, n = ndimage.label(land0)
sea = np.zeros((M, M), bool)
for seed in [(5, M - 5), (5, M // 2), (M // 3, M - 5)]:
    if lab[seed]: sea |= lab == lab[seed]
sea = ndimage.binary_dilation(sea, iterations=2) & (W | sea)
# --- sông, hồ
wat = Image.new('L', (M, M), 0); dd = ImageDraw.Draw(wat)
def area(p): return abs(sum(p[i][0] * p[i - 1][1] - p[i - 1][0] * p[i][1] for i in range(len(p)))) / 2
for w in d['water']:
    p = w['p']
    if len(p) > 3 and abs(p[0][0] - p[-1][0]) + abs(p[0][1] - p[-1][1]) < 50 and area(p) > 2e4:
        dd.polygon(P(p), fill=255)
for r in d['river']:
    wd = {'Sông Hàn': 460, 'Sông Cẩm Lệ': 260, 'Sông Cu Đê': 150, 'Sông Vĩnh Điện': 160, 'Sông Túy Loan': 110, 'Sông Cổ Cò': 90, 'Sông Yên': 120, 'Sông Quá Giáng': 90}.get(r['n'])
    if wd:
        pts = P(r['p']); wpx = max(2, int(wd / px))
        dd.line(pts, fill=255, width=wpx)
        for q in pts: dd.ellipse([q[0] - wpx / 2, q[1] - wpx / 2, q[0] + wpx / 2, q[1] + wpx / 2], fill=255)
river = np.array(wat) > 0
water = sea | river
np.save('water.npy', water); np.save('sea.npy', sea)
Image.fromarray((np.stack([water * 200, sea * 255, river * 255], -1)).astype(np.uint8)).save('xem/mask.png')

# --- độ cao
dist_land = ndimage.distance_transform_edt(~water) * px   # m tới nước (trên đất)
dist_sea = ndimage.distance_transform_edt(water) * px      # m tới bờ (dưới nước)
Hl = np.maximum(H, 0)
# bờ: DEM ven biển bị nhiễu, nâng dần từ 0,6 m tại mép nước
Hl = np.where(dist_land < 400, np.maximum(Hl * np.clip((dist_land - 60) / 340, 0, 1), 0.6 + dist_land * 0.004), Hl)
Hl = np.maximum(Hl, 0.6)
depth = np.where(sea, -np.minimum(1.5 + dist_sea * 0.012, 28), -np.minimum(1.2 + dist_sea * 0.03, 5))
depth = np.minimum(depth, np.where(H < -1, H, 0))
Z = np.where(water, depth, Hl)
Z = ndimage.gaussian_filter(Z, 0.7)
Z = np.where(water, np.minimum(Z, -0.4), np.maximum(Z, 0.35))
np.save('Z.npy', Z.astype(np.float32))
print('cao', Z.min(), Z.max())

# --- ảnh màu 2048
S = 2048
Zc = np.array(Image.fromarray(Z).resize((S, S), Image.BICUBIC))
wc = np.array(Image.fromarray((water * 255).astype(np.uint8)).resize((S, S), Image.BILINEAR)) / 255.0
gy, gx = np.gradient(Zc, 2 * HALF / S)
slope = np.hypot(gx, gy)
rng = np.random.default_rng(7)
noise = ndimage.gaussian_filter(rng.random((S, S)), 3) - 0.5
noise2 = ndimage.gaussian_filter(rng.random((S, S)), 14) - 0.5
def c(r, g, b): return np.array([r, g, b], np.float32)
sand, paddy, paddy2, scrub, forest, rock, village = c(214, 196, 150), c(150, 168, 88), c(120, 150, 70), c(112, 132, 70), c(58, 92, 48), c(120, 112, 96), c(96, 120, 62)
img = np.zeros((S, S, 3), np.float32)
dl = ndimage.distance_transform_edt(wc < 0.5) * (2 * HALF / S)
low = np.clip((Zc - 2) / 10, 0, 1)
base = paddy * (1 - (noise2 > 0.05)[..., None]) + paddy2 * (noise2 > 0.05)[..., None]
img = base * (1 - low[..., None]) + scrub * low[..., None]
hi = np.clip((Zc - 25) / 60, 0, 1)
img = img * (1 - hi[..., None]) + forest * hi[..., None]
ro = np.clip((slope - 0.55) / 0.4, 0, 1) * np.clip((Zc - 60) / 100, 0, 1)
img = img * (1 - ro[..., None]) + rock * ro[..., None]
# cát ven biển (bãi cát rộng ven vịnh và bờ Đông) — theo khoảng cách tới biển
seac = np.array(Image.fromarray((sea * 255).astype(np.uint8)).resize((S, S), Image.BILINEAR)) / 255.0
ds = ndimage.distance_transform_edt(seac < 0.5) * (2 * HALF / S)
sandw = np.clip(1 - (ds - 120 - noise * 300) / 250, 0, 1) * np.clip((8 - Zc) / 6, 0, 1)
img = img * (1 - sandw[..., None]) + sand * sandw[..., None]
img *= (1 + noise[..., None] * 0.35)
# bóng đổ địa hình (ánh sáng Tây Bắc)
shade = np.clip(1 + (gx * 0.7 - gy * 0.7) * 1.8, 0.55, 1.35)
img *= shade[..., None]
# nước
deep = np.clip(-Zc / 20, 0, 1)
wcol = c(70, 120, 120) * (1 - deep[..., None]) + c(28, 62, 92) * deep[..., None]
img = img * (1 - wc[..., None]) + wcol * wc[..., None]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('goi/terrain/color.jpg', quality=88)
# ảnh cao độ 16 bit (cm, +100 m)
h16 = np.clip((Z + 100) * 100, 0, 65535).astype(np.uint16)
Image.fromarray(h16).save('goi/terrain/height.png')
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((768, 768)).save('xem/color_s.jpg')
