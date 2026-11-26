# Toạ độ các mốc (m, x Đông, n Bắc so với tâm 16.095 B, 108.21 Đ). ƯỚC LƯỢNG trừ thành Điện Hải.
import json, numpy as np, math
Z = np.load('Z.npy'); water = np.load('water.npy'); M = 1024; HALF = 16000; px = 31.25
C = (16.095, 108.21); mLat = 111320; mLon = 111320 * math.cos(math.radians(C[0]))
def ll(lat, lon): return [(lon - C[1]) * mLon, (lat - C[0]) * mLat]
def idx(x, n): return int((HALF - n) / px), int((x + HALF) / px)
def isw(x, n): j, i = idx(x, n); return bool(water[j, i])
def h(x, n): j, i = idx(x, n); return float(Z[j, i])
def len_dat(x, n, r=600):  # dời lên đất gần nhất
    if not isw(x, n): return x, n
    best = None
    for rr in range(1, int(r / 15)):
        for a in range(0, 360, 10):
            xx, nn = x + rr * 15 * math.cos(math.radians(a)), n + rr * 15 * math.sin(math.radians(a))
            if not isw(xx, nn) and h(xx, nn) > 0.8: return xx, nn
    return x, n
P = {
 'dien-hai':   (16.0777, 108.2213, 'Thành Điện Hải', 'Vị trí di tích hiện nay (24 Trần Phú)'),
 'an-hai':     (16.0805, 108.2300, 'Thành An Hải', 'ƯỚC LƯỢNG bờ Đông sông Hàn'),
 'cua-han':    (16.1030, 108.2215, 'Cửa sông Hàn', ''),
 'hai-chau':   (16.0665, 108.2195, 'Đồn Hải Châu', 'ƯỚC LƯỢNG'),
 'phuoc-ninh': (16.0590, 108.2150, 'Đồn Phước Ninh', 'ƯỚC LƯỢNG'),
 'thac-gian':  (16.0630, 108.2050, 'Đồn Thạc Gián', 'ƯỚC LƯỢNG'),
 'lien-tri':   (16.0470, 108.2140, 'Đồn Liên Trì', 'ƯỚC LƯỢNG'),
 'nai-hien':   (16.0590, 108.2330, 'Nại Hiên', 'ƯỚC LƯỢNG'),
 'hoa-khue':   (16.0400, 108.2400, 'Hóa Khuê', 'ƯỚC LƯỢNG'),
 'my-thi':     (16.0300, 108.2450, 'Mỹ Thị', 'ƯỚC LƯỢNG'),
 'cam-le':     (16.0170, 108.2000, 'Cẩm Lệ', 'ƯỚC LƯỢNG'),
 'hai-van':    (16.1977, 108.1306, 'Hải Vân Quan', 'Vị trí cửa ải hiện nay'),
 'chon-sang':  (16.1330, 108.1250, 'Đồn Chơn Sảng', 'ƯỚC LƯỢNG theo bản đồ 1859'),
 'dinh-hai':   (16.1170, 108.1360, 'Pháo đài Định Hải', 'ƯỚC LƯỢNG theo bản đồ 1859'),
 'thanh-khe':  (16.0720, 108.1900, 'Thanh Khê', 'ƯỚC LƯỢNG'),
 'son-tra-tay':(16.1200, 108.2140, 'Pháo đài Bắc · Đài quan sát', 'ƯỚC LƯỢNG mũi Tây Sơn Trà'),
 'trai-phap':  (16.1180, 108.2290, 'Trại quân Pháp', 'ƯỚC LƯỢNG theo bản đồ 1859'),
 'nghia-dia':  (16.1215, 108.2235, 'Nghĩa địa Tây Ban Nha', 'ƯỚC LƯỢNG'),
 'tien-don':   (16.1000, 108.2420, 'Tiền đồn', 'ƯỚC LƯỢNG'),
 'son-tra':    (16.1250, 108.2700, 'Bán đảo Sơn Trà', ''),
 'lang-chai':  (16.0820, 108.2050, 'Làng chài ven vịnh', 'MINH HOẠ'),
}
out = {}
for k, (la, lo, ten, gc) in P.items():
    x, n = ll(la, lo)
    if k not in ('cua-han',): x, n = len_dat(x, n)
    out[k] = {'x': round(x), 'n': round(n), 'h': round(h(x, n), 2), 'ten': ten, 'ghi': gc, 'nuoc': isw(x, n)}
    print(k, out[k])
json.dump(out, open('vitri.json', 'w'), ensure_ascii=False, indent=1)
