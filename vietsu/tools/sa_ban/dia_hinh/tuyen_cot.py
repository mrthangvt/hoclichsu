"""Tuyến đường cho các đoàn xe Quân Giải phóng trên tầng chiến dịch (đi theo đường bộ OSM, đã bỏ đường làm sau 1975 — không xuyên sông, hồ).
python3 tuyen_cot.py <hcm1975_osm.json> <gói ho-chi-minh-1975>   → ghi placement.json › duong.cot_<tên> (toạ độ Blender m, tầng chiến dịch)
Điểm đầu, điểm cuối mỗi tuyến là MINH HOẠ hướng tiến quân theo năm hướng (S3) và các trận Xuân Lộc, Đồng Dù, Long Thành; đường đi do tìm đường
ngắn nhất trên mạng đường quốc lộ, tỉnh lộ năm đó (ưu tiên đường lớn)."""
import json, sys, math, heapq, re, os
OSM = json.load(open(sys.argv[1])); GOI = sys.argv[2]
L = [l for l in OSM['layers'] if l['name'] == 'chien-dich'][0]
T = json.load(open(f'{GOI}/terrain/meta.json')); kx = 111320 * math.cos(math.radians(T['lat0'])); ky = 110574
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dung_dia_hinh.py')).read()
MOI = re.compile(src.split("MOI = re.compile(r'")[1].split("')")[0].replace("'\n                 r'", ''))
XY = lambda lo, la: ((lo - T['lon0']) * kx, (la - T['lat0']) * ky)
G = {}; key = lambda p: (round(p[0], 5), round(p[1], 5))
for e in L['el']:
    t = e['tags']
    if e['t'] != 'w' or 'highway' not in t or MOI.search(t.get('name', '') + ' ' + t.get('ref', '')): continue
    if t.get('tunnel'): continue
    w = {'trunk': 1, 'primary': 1, 'secondary': 1.15}.get(t['highway'], 1.5)
    for a, b in zip(e['g'], e['g'][1:]):
        A, B = key(a), key(b); d = math.hypot((A[0] - B[0]) * kx, (A[1] - B[1]) * ky) * w
        G.setdefault(A, []).append((B, d)); G.setdefault(B, []).append((A, d))
def gan(la, lo): return min(G, key=lambda n: (n[0] - lo) ** 2 * kx * kx + (n[1] - la) ** 2 * ky * ky)
def dij(s, g):
    D = {s: 0}; P = {}; Q = [(0, s)]
    while Q:
        d, u = heapq.heappop(Q)
        if u == g: break
        if d > D[u]: continue
        for v, w in G[u]:
            if d + w < D.get(v, 1e18): D[v] = d + w; P[v] = u; heapq.heappush(Q, (d + w, v))
    if g not in P and g != s: raise SystemExit('không nối được')
    path = [g]
    while path[-1] != s: path.append(P[path[-1]])
    return path[::-1]
TUYEN = {   # tên: [điểm đầu, (qua…), điểm cuối] (vĩ, kinh)
    'xl': [(11.19, 107.35), (10.935, 107.245)],                       # Quân đoàn 4: Định Quán → Xuân Lộc (QL20)
    'bac': [(11.16, 106.60), (10.97, 106.66), (10.85, 106.68)],       # Quân đoàn 1: Bến Cát → Thủ Dầu Một → Gò Vấp (QL13)
    'tb': [(10.99, 106.47), (10.886, 106.59), (10.83, 106.64)],       # Quân đoàn 3: Củ Chi → Hóc Môn → Tân Sơn Nhất (QL22, QL1)
    'dong': [(10.96, 106.86), (10.86, 106.79), (10.81, 106.75)],      # Quân đoàn 4: Biên Hòa → xa lộ → Rạch Chiếc
    'dn': [(10.70, 107.12), (10.78, 106.95), (10.83, 106.80)],        # Quân đoàn 2: Bà Rịa → Long Thành → xa lộ
    'dd': [(11.07, 106.40), (10.9875, 106.5125)],                     # Quân đoàn 3 vào Đồng Dù
    'lt': [(10.70, 107.12), (10.78, 106.95)],                         # Quân đoàn 2 tới Long Thành
    'tn': [(10.62, 106.45), (10.70, 106.56), (10.76, 106.63)],        # Đoàn 232: Long An → Bình Chánh → Phú Lâm (QL1, QL4)
}
pl = json.load(open(f'{GOI}/placement.json')); pl.setdefault('duong', {})
for ten, seq in TUYEN.items():
    out = []
    for a, b in zip(seq, seq[1:]):
        p = dij(gan(*a), gan(*b)); out += p if not out else p[1:]
    xy = [[round(v, 1) for v in XY(*n)] for n in out]
    # bỏ điểm quá sát nhau (< 40 m)
    gon = [xy[0]]
    for q in xy[1:]:
        if math.hypot(q[0] - gon[-1][0], q[1] - gon[-1][1]) >= 40: gon.append(q)
    if gon[-1] != xy[-1]: gon.append(xy[-1])
    Ld = sum(math.hypot(gon[i][0] - gon[i - 1][0], gon[i][1] - gon[i - 1][1]) for i in range(1, len(gon)))
    pl['duong']['cot_' + ten] = gon; print(ten, len(gon), 'điểm', round(Ld / 1000, 1), 'km')
pl['ghiChu'] = (pl.get('ghiChu') or '') if isinstance(pl.get('ghiChu'), str) else pl.get('ghiChu')
json.dump(pl, open(f'{GOI}/placement.json', 'w'), ensure_ascii=False)
