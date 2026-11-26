"""Tô màu đất quanh căn cứ Tà Cơn và các điểm cao (anh Thắng V1.3, 25/11/2026: "đất quanh Tà Cơn phải là màu đất như Thành cổ, cỏ mọc thưa,
làm giống trận Điện Biên Phủ"; ảnh tư liệu anh gửi: đất đỏ bazan, công sự bao cát, hố pháo).
python3 mau_dat_ks.py <ảnh màu gốc> <meta.json> <ảnh màu ra>
- Vùng đất trống: căn cứ (vòng rào theo sơ đồ M32) + 450 m, nhạt dần tới ~2,6 km; đỉnh các điểm cao 881 Nam, 861, 861A, 558, 950; Làng Vây; khu
  rải thảm bom phía tây bắc. Đất đỏ (lấy màu theo ảnh căn cứ 1968), cỏ thưa lấm tấm, hố bom rải rác. Vị trí, mật độ hố là MINH HOẠ.
- Chạy lại từ ảnh gốc (không chồng nhiều lần)."""
import sys, json, math
import numpy as np
from PIL import Image
VAO, META, RA = sys.argv[1:4]
m = json.load(open(META)); half = m['half']; lat0, lon0 = m['lat0'], m['lon0']
KX, KY = math.cos(math.radians(lat0)) * 111320, 110574
im = np.asarray(Image.open(VAO).convert('RGB')).astype(np.float32) / 255; Hh, Ww = im.shape[:2]
xs = -half + (np.arange(Ww) + 0.5) / Ww * 2 * half; ys = half - (np.arange(Hh) + 0.5) / Hh * 2 * half
X, Y = np.meshgrid(xs, ys)
def bl(la, lo): return ((lo - lon0) * KX, (la - lat0) * KY)
TC = bl(16.6543271, 106.7243017)
# vòng rào căn cứ (sơ đồ M32, điểm ảnh → m; giống bien_dao_gd4.js: tâm đường băng (628,5; 185,5), 2,347 m/điểm ảnh, y điểm ảnh hướng nam)
RAO = [[25, 50], [55, 22], [110, 8], [170, 5], [230, 18], [262, 55], [300, 92], [340, 95], [450, 82], [530, 105], [600, 127], [700, 150], [790, 172], [860, 192], [905, 214],
       [908, 240], [880, 262], [835, 282], [820, 300], [810, 340], [770, 375], [700, 375], [650, 345], [600, 310], [530, 282], [450, 318], [400, 365], [350, 435], [300, 405], [250, 365],
       [200, 330], [178, 295], [140, 285], [100, 250], [30, 210]]
P = np.array([[TC[0] + (a - 628.5) * 2.347, TC[1] - (b - 185.5) * 2.347] for a, b in RAO])
# khoảng cách tới đa giác rào (âm bên trong)
def kc_da_giac(X, Y, P):
    d = np.full(X.shape, 1e9, np.float32); ins = np.zeros(X.shape, bool)
    for i in range(len(P)):
        a, b = P[i], P[(i + 1) % len(P)]; ab = b - a; L2 = (ab ** 2).sum()
        t = np.clip(((X - a[0]) * ab[0] + (Y - a[1]) * ab[1]) / L2, 0, 1)
        d = np.minimum(d, np.hypot(X - (a[0] + t * ab[0]), Y - (a[1] + t * ab[1])))
        c = ((a[1] > Y) != (b[1] > Y)) & (X < (b[0] - a[0]) * (Y - a[1]) / (b[1] - a[1] + 1e-9) + a[0]); ins ^= c
    return np.where(ins, -d, d)
rng = np.random.default_rng(7)
def nhieu(sc, seed):                                                            # nhiễu mịn nhiều tầng (giá trị 0..1)
    r = np.random.default_rng(seed); out = np.zeros(X.shape, np.float32)
    for k, w in ((1, 0.5), (2.3, 0.3), (5.1, 0.2)):
        n = max(4, int(2 * half / (sc / k))); g = r.random((n + 1, n + 1)).astype(np.float32)
        u = (X + half) / (2 * half) * n; v = (Y + half) / (2 * half) * n; i0, j0 = np.floor(u).astype(int).clip(0, n - 1), np.floor(v).astype(int).clip(0, n - 1)
        fu, fv = u - i0, v - j0; fu, fv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
        out += w * (g[j0, i0] * (1 - fu) * (1 - fv) + g[j0, i0 + 1] * fu * (1 - fv) + g[j0 + 1, i0] * (1 - fu) * fv + g[j0 + 1, i0 + 1] * fu * fv)
    return out
N1, N2 = nhieu(900, 1), nhieu(160, 2)
dR = kc_da_giac(X, Y, P)
mask = np.clip(1 - (dR - 450 * (0.6 + 0.8 * N1)) / 2100, 0, 1) ** 1.3                    # căn cứ + vùng phát quang, bờ vùng loang lổ theo nhiễu
for la, lo, r in [(16.67167, 106.66256, 420), (16.6760, 106.6887, 380), (16.6778, 106.6915, 300), (16.6833, 106.7046, 320), (16.6885, 106.725, 300),   # 881 Nam, 861, 861A, 558, 950
                  (16.60048, 106.66822, 330), (16.6243, 106.73923, 260)]:                                                                  # Làng Vây, Cu Bốc
    cx, cy = bl(la, lo); dd = np.hypot(X - cx, Y - cy); mask = np.maximum(mask, np.clip(1 - (dd - r * (0.7 + 0.6 * N1)) / (r * 1.4), 0, 1))
A, B = bl(16.69069, 106.65958), (TC[0] - 900, TC[1] + 1600)                     # dải thảm bom B-52 phía tây bắc (bien_dao_gd4.js › thamBom)
ab = np.array(B) - np.array(A); t = np.clip(((X - A[0]) * ab[0] + (Y - A[1]) * ab[1]) / (ab ** 2).sum(), 0, 1)
db = np.hypot(X - (A[0] + t * ab[0]), Y - (A[1] + t * ab[1])); mask = np.maximum(mask, 0.85 * np.clip(1 - (db - 250) / 500, 0, 1) * (0.5 + 0.5 * N1))
# màu đất đỏ bazan (theo ảnh căn cứ 1968 anh gửi), cỏ thưa lấm tấm
dat = np.stack([0.62 + 0.10 * N2, 0.36 + 0.07 * N2, 0.21 + 0.05 * N2], -1)
co = np.stack([0.42 + 0.05 * N2, 0.45 + 0.05 * N2, 0.24 + 0.03 * N2], -1)
lam_tam = (nhieu(40, 3) > 0.62).astype(np.float32) * 0.55 + np.clip((N2 - 0.55) * 2, 0, 1) * 0.35   # đốm cỏ
nen = dat * (1 - lam_tam[..., None]) + co * lam_tam[..., None]
sang = im.mean(-1, keepdims=True); nen *= (0.75 + 0.5 * sang / max(1e-3, float(sang.mean())))[..., :1] ** 0.5   # giữ bóng đổ của địa hình
# hố bom, hố pháo: chấm tối viền sáng trong vùng đất trống
px = 2 * half / Ww; n_ho = int(mask.sum() * px * px / 9000)
iy, ix = np.nonzero(mask > 0.35); sel = rng.choice(len(ix), size=min(n_ho, len(ix)), replace=False) if len(ix) else []
ho = np.zeros(X.shape, np.float32)
for k in sel:
    r = rng.uniform(4, 11) / px; cx, cy = ix[k], iy[k]; r0 = max(1, int(r * 1.8))
    y0, y1, x0, x1 = max(0, cy - r0), min(Hh, cy + r0 + 1), max(0, cx - r0), min(Ww, cx + r0 + 1)
    yy, xx = np.mgrid[y0:y1, x0:x1]; d = np.hypot(yy - cy, xx - cx) / max(r, 0.6)
    ho[y0:y1, x0:x1] += np.where(d < 1, -0.35 * (1 - d * d), np.where(d < 1.6, 0.12 * (1 - (d - 1) / 0.6), 0))
nen = np.clip(nen * (1 + ho[..., None]), 0, 1)
out = im * (1 - mask[..., None]) + nen * mask[..., None]
Image.fromarray((out * 255).astype(np.uint8)).save(RA, quality=88)
print('xong', RA, 'vùng đất', round(float(mask.mean() * 100), 2), '% · hố', len(sel))
