"""Giải mã DEM Terrarium (hcm1975_dem.json) ra lưới độ cao cho 2 tầng sa bàn. Lưu npy (m) để bước sau tô màu, mặt nạ nước."""
import json, base64, io, math, numpy as np
from PIL import Image
D = json.load(open('/mnt/user-data/uploads/ChienDichHoChiMinh1975/hcm1975_dem.json'))
TANG = {  # tâm (vĩ, kinh), nửa cạnh m, bán kính sa bàn m, N
 'chien-dich': dict(lat0=10.83, lon0=106.83, half=58000.0, R=56500.0, N=1024),
 'noi-do':     dict(lat0=10.7770, lon0=106.6953, half=7000.0, R=6800.0, N=1024),
}
def merc(lat, lon, z):
    n = 2 ** z; x = (lon + 180) / 360 * n; y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y
for L in D['layers']:
    T = TANG[L['name']]
    im = np.array(Image.open(io.BytesIO(base64.b64decode(L['png'].split(',')[1]))).convert('RGB')).astype(np.float64)
    h = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
    N, half = T['N'], T['half']; k = (np.arange(N) + 0.5) / N * 2 * half - half     # m, x đông, y bắc
    X, Yn = np.meshgrid(k, -k)                    # hàng 0 = phía Bắc
    lat = T['lat0'] + Yn / 110574.0; lon = T['lon0'] + X / (111320.0 * math.cos(math.radians(T['lat0'])))
    n = 2 ** L['z']; px = ((lon + 180) / 360 * n - L['x0']) * 256 - 0.5
    py = ((1 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2 * n - L['y0']) * 256 - 0.5
    x0 = np.clip(np.floor(px).astype(int), 0, h.shape[1] - 2); y0 = np.clip(np.floor(py).astype(int), 0, h.shape[0] - 2)
    fx = np.clip(px - x0, 0, 1); fy = np.clip(py - y0, 0, 1)
    g = (h[y0, x0] * (1 - fx) + h[y0, x0 + 1] * fx) * (1 - fy) + (h[y0 + 1, x0] * (1 - fx) + h[y0 + 1, x0 + 1] * fx) * fy
    ngoai = (px < 0) | (py < 0) | (px > h.shape[1] - 1) | (py > h.shape[0] - 1)
    g = np.clip(g, -25, None)  # Terrarium có vài ô lỗi sâu tới -500 m trên sông
    np.save(f"h_{L['name']}.npy", g.astype(np.float32)); json.dump(T, open(f"t_{L['name']}.json", 'w'))
    print(L['name'], 'z', L['z'], 'min %.1f max %.1f tb %.1f' % (g.min(), g.max(), g.mean()), 'ngoai vung DEM', int(ngoai.sum()), 'o; m/px %.1f' % (2 * half / N))
