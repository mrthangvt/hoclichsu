# Ảnh màu sa bàn V1.2 (kiểu Điện Biên Phủ): rừng chấm cây, đất cỏ xen đất trống, ruộng, bãi cát vàng, bờ sông có cỏ bụi
import numpy as np, json, math
from PIL import Image
from scipy import ndimage
OUT = '/home/claude/v12/goi/terrain/'
Z = np.load('Z12.npy'); W = np.load('W12.npy'); RV = np.load('R12.npy')
HALF = 16000.0; M = 2048; px = 2 * HALF / M
RIN = 9417.0; BOX = 16000.0; S = 4096; spx = 2 * BOX / S     # toàn vùng ±16 km, 7,8 m/điểm ảnh
rng = np.random.default_rng(1858)
def up(a, order=1):   # lấy mẫu lưới 2048 (±16 km) sang lưới ảnh S (±9,6 km)
    jj, ii = np.mgrid[0:S, 0:S].astype(np.float32)
    x = -BOX + (ii + 0.5) * spx; y = BOX - (jj + 0.5) * spx
    fi = (x + HALF) / px - 0.5; fj = (HALF - y) / px - 0.5
    return ndimage.map_coordinates(a.astype(np.float32), [fj, fi], order=order, mode='nearest')
def noise(scale, seed, octv=4):
    r = np.random.default_rng(seed); out = np.zeros((S, S), np.float32); amp = 1; tot = 0
    for o in range(octv):
        n = max(4, int(S / scale * 2 ** o)); g = r.random((n, n)).astype(np.float32)
        out += amp * np.array(Image.fromarray(g).resize((S, S), Image.BICUBIC)); tot += amp; amp *= 0.5
    return out / tot - 0.5
z = up(Z); w = up(W.astype(np.float32)) > 0.5; rv = up(RV.astype(np.float32)) > 0.5
sea = w & ~rv
dl = ndimage.distance_transform_edt(~w) * spx                  # đất → nước
dsea = ndimage.distance_transform_edt(~sea) * spx              # tới biển
drv = ndimage.distance_transform_edt(~rv) * spx                # tới sông
gy, gx = np.gradient(z, spx); slope = np.hypot(gx, gy)
n1 = noise(560, 1); n2 = noise(160, 2); n3 = noise(38, 3, 3); n4 = noise(1500, 4, 3); n5 = noise(16, 5, 2)
def C(*c): return np.array(c, np.float32)
# --- nền đồng bằng: cỏ xen đất trống, ruộng
grass1, grass2, soil, soil2 = C(98, 116, 58), C(80, 104, 50), C(146, 124, 88), C(124, 104, 74)
paddy1, paddy2 = C(126, 142, 70), C(104, 128, 62)
img = np.zeros((S, S, 3), np.float32)
g = np.clip((n2 + n3 * 0.6) * 2.2 + 0.5, 0, 1)[..., None]
img[:] = grass1 * g + grass2 * (1 - g)
bare = np.clip((n1 * 1.6 + n3 * 0.8 - 0.05) * 4, 0, 1)[..., None] * 0.85
img = img * (1 - bare) + (soil * (0.5 + n5[..., None]) + soil2 * (0.5 - n5[..., None])) * bare
# ruộng: vùng thấp bằng phẳng, ô thửa theo lưới xoay từng khu
low = np.clip((8 - z) / 5, 0, 1) * np.clip(1 - slope / 0.04, 0, 1) * np.clip((n4 + 0.15) * 4, 0, 1)
jj, ii = np.mgrid[0:S, 0:S].astype(np.float32)
ang = (n4 * 3.0)
u = (ii * np.cos(ang) + jj * np.sin(ang)) * spx / 38; v = (-ii * np.sin(ang) + jj * np.cos(ang)) * spx / 26
cell = (np.floor(u) * 7.13 + np.floor(v) * 3.71) % 1.0
bo = ((np.abs(u % 1 - 0.5) > 0.46) | (np.abs(v % 1 - 0.5) > 0.45)).astype(np.float32)
pad = paddy1 * cell[..., None] + paddy2 * (1 - cell[..., None])
pad = pad * (1 - bo[..., None] * 0.25) + C(150, 140, 96) * bo[..., None] * 0.25
low3 = low[..., None]
img = img * (1 - low3 * 0.85) + pad * low3 * 0.85
# --- đồi núi: rừng chấm cây
forest = np.clip((z - 12) / 30, 0, 1) * np.clip(0.75 + n2 * 1.5, 0, 1)
forest = np.maximum(forest, np.clip((n1 + 0.32) * 3, 0, 1) * np.clip((z - 3) / 10, 0, 1) * 0.55)
fcol = C(52, 76, 40) * (1 + n3[..., None] * 0.5) + C(-8, 6, -6) * n2[..., None]
dots = (n5 > 0.17).astype(np.float32) * 0.55 + (noise(8, 9, 1) > 0.2).astype(np.float32) * 0.35
fcol = fcol * (1 - dots[..., None] * 0.45) + C(78, 104, 58) * np.clip(noise(9, 10, 1) - 0.25, 0, 1)[..., None] * 1.6
f3 = forest[..., None]; img = img * (1 - f3) + fcol * f3
rock = np.clip((slope - 0.6) / 0.4, 0, 1) * np.clip((z - 80) / 80, 0, 1)
img = img * (1 - rock[..., None] * 0.6) + C(122, 114, 98) * rock[..., None] * 0.6
# --- bờ sông: dải cỏ xanh đậm, bụi
bank = np.clip(1 - (drv - 4) / 26, 0, 1) * (~rv)
img = img * (1 - bank[..., None] * 0.8) + (C(70, 98, 46) * (1 + n5[..., None] * 0.6)) * bank[..., None] * 0.8
# --- bãi cát vàng ven biển, cát ướt sát mép nước
flat = np.clip(1 - ndimage.gaussian_filter(slope, 6) / 0.05, 0, 1)
wsand = np.clip(1 - (dsea - 18 - flat * (70 + n2 * 140) - n3 * 25) / 35, 0, 1) * np.clip((7 - z) / 3, 0, 1) * (~w)
sand = C(216, 194, 142) * (1 + n5[..., None] * 0.10) + C(10, 8, 2) * n3[..., None] + C(-18, -10, -14) * np.clip(n1 * 3, 0, 1)[..., None]
img = img * (1 - wsand[..., None]) + sand * wsand[..., None]
wet = np.clip(1 - dsea / 9, 0, 1) * (~w)
img = img * (1 - wet[..., None] * 0.55) + C(176, 158, 116) * wet[..., None] * 0.55
# --- bóng đổ (Tây Bắc)
sh = np.clip(1 + (gx * 0.55 - gy * 0.55) * 2.2, 0.62, 1.3)
img *= sh[..., None]
# --- dưới nước: màu đáy (nước vẽ đè bằng shader)
img[w] = (C(150, 140, 100) * 0.6)
# ngoài vòng: tối dần (vành sa bàn)
r = np.hypot(-BOX + (ii + 0.5) * spx, BOX - (jj + 0.5) * spx)
img *= (1 - np.clip((r - RIN + 30) / 60, 0, 1) * 0.0)[..., None]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(OUT + 'mau.jpg', quality=82, optimize=True)
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).resize((1024, 1024)).save('/home/claude/v12/xem_mau.jpg', quality=85)
Image.fromarray(np.clip(img[1900:2400, 2000:2500], 0, 255).astype(np.uint8)).save('/home/claude/v12/xem_mau2.jpg', quality=88)
# --- phông ngoài vòng (±16 km, 1024): màu trầm, mờ
Zs = np.array(Image.fromarray(Z).resize((1024, 1024), Image.BILINEAR)); Ws = np.array(Image.fromarray(W.astype(np.uint8) * 255).resize((1024, 1024))) > 127
gy2, gx2 = np.gradient(Zs, 31.25)
base = np.where((Zs > 15)[..., None], C(50, 70, 42), C(96, 108, 66))
base = base * np.clip(1 + (gx2 * 0.55 - gy2 * 0.55) * 2.2, 0.6, 1.3)[..., None]
base[Ws] = C(40, 70, 90)
Image.fromarray(np.clip(base * 0.85, 0, 255).astype(np.uint8)).save(OUT + 'phong.jpg', quality=82)
# --- danh sách cây (rừng thưa trên đồi, bụi ven sông, cây quanh làng) — mật độ theo ảnh màu
Rn = np.random.default_rng(7); trees = []
cand = Rn.random((S // 4, S // 4)); r4 = np.hypot(-BOX + (np.arange(S // 4)[None, :] * 4 + 2) * spx, BOX - (np.arange(S // 4)[:, None] * 4 + 2) * spx)
fd = forest[::4, ::4]; bk = bank[::4, ::4]; zz = z[::4, ::4]; ww = w[::4, ::4]
for (j, i) in zip(*np.where((cand < (fd * 0.30 + bk * 0.5) * np.clip((RIN + 1500 - r4) / 1500, 0.15, 1)) & ~ww)):
    x = -BOX + (i * 4 + Rn.random() * 4) * spx; y = BOX - (j * 4 + Rn.random() * 4) * spx
    k = 1 if bk[j, i] > 0.3 else 0
    trees.append([round(x, 1), round(y, 1), k])
print('cay', len(trees))
json.dump(trees, open('/home/claude/v12/goi/cay.json', 'w'), separators=(',', ':'))
