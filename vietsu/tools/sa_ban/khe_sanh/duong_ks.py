"""Đường đi cho các đoàn xe, đoàn quân của sa bàn Khe Sanh 1968 (tìm đường ngắn nhất trên mạng đường OSM, ưu tiên Quốc lộ 9 / Quốc lộ 9 cũ,
bỏ đường Hồ Chí Minh làm sau 1968). Ghi vào placement.json › duong (toạ độ Blender m của từng tầng: x Đông, y Bắc).
python3 duong_ks.py <khe-sanh-1968_osm.json> <thư mục gói>
Điểm đầu, điểm cuối: Cà Lu (Wikipedia "Ca Lu Combat Base"), căn cứ Tà Cơn, Làng Vây (OSM), biên giới Lào trên QL9 — MINH HOẠ hướng đi."""
import json, sys, math, heapq, re, os
OSM = json.load(open(sys.argv[1])); GOI = sys.argv[2]
MOI = re.compile(r'HCM|Hồ Chí Minh|Cao tốc')
def mang(L, kx, ky, lat0, lon0):
    G = {}; key = lambda p: (round(p[0], 6), round(p[1], 6))
    for e in L['el']:
        t = e['tags']
        if e['t'] != 'w' or 'highway' not in t or t['highway'] in ('footway', 'path', 'steps', 'service', 'residential', 'living_street'): continue
        ql9 = 'QL.9' in t.get('ref', '').split(';') or 'Quốc lộ 9' in t.get('name', '') or t.get('ref', '') == 'QL.9'
        if MOI.search(t.get('name', '') + ' ' + t.get('ref', '')) and not ql9: continue   # đoạn QL9 trùng đường Hồ Chí Minh hôm nay: giữ (QL9 có từ trước)
        w = 0.7 if ('9' in t.get('ref', '') and 'QL' in t.get('ref', '')) or 'Quốc lộ 9' in t.get('name', '') else {'trunk': 1, 'primary': 1, 'secondary': 1.2}.get(t['highway'], 1.8)
        for a, b in zip(e['g'], e['g'][1:]):
            A, B = key(a), key(b); d = math.hypot((A[0] - B[0]) * kx, (A[1] - B[1]) * ky) * w
            G.setdefault(A, []).append((B, d)); G.setdefault(B, []).append((A, d))
    return G
def duong(G, kx, ky, lat0, lon0, a, b):
    gan = lambda la, lo: min(G, key=lambda n: (n[0] - lo) ** 2 * kx * kx + (n[1] - la) ** 2 * ky * ky)
    s = gan(*a); D = {s: 0}; P = {}; Q = [(0, s)]
    while Q:                                                   # Dijkstra hết thành phần liên thông chứa điểm đầu
        d, u = heapq.heappop(Q)
        if d > D[u]: continue
        for v, w in G[u]:
            if d + w < D.get(v, 1e18): D[v] = d + w; P[v] = u; heapq.heappush(Q, (d + w, v))
    g = min(D, key=lambda n: (n[0] - b[1]) ** 2 * kx * kx + (n[1] - b[0]) ** 2 * ky * ky)   # điểm tới được gần đích nhất
    path = [g]
    while path[-1] != s: path.append(P[path[-1]])
    pts = [[round((lo - lon0) * kx, 1), round((la - lat0) * ky, 1)] for lo, la in path[::-1]]
    out = [pts[0]]
    for p in pts[1:]:
        if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) > 25: out.append(p)
    return out
pl = json.load(open(os.path.join(GOI, 'placement.json'))); pl.setdefault('duong', {})
TACON, CALU, LANGVAY, KHESANH = (16.6420, 106.7300), (16.69209, 106.88569), (16.60048, 106.66822), (16.62732, 106.7377)
for L in OSM['layers']:
    m = json.load(open(os.path.join(GOI, 'terrain', 'meta.json' if L['name'] == 'chien-dich' else 'ta-con/meta.json')))
    kx = 111320 * math.cos(math.radians(m['lat0'])); ky = 110574
    G = mang(L, kx, ky, m['lat0'], m['lon0'])
    if L['name'] == 'chien-dich':
        P = duong(G, kx, ky, m['lat0'], m['lon0'], CALU, KHESANH)                                  # Pegasus: Cà Lu → làng Khe Sanh theo Đường 9
        P.append([round((TACON[1] - m['lon0']) * kx, 1), round((TACON[0] - m['lat0']) * ky, 1)])   # rồi rẽ lên căn cứ (đoạn cuối thẳng, MINH HOẠ)
        pl['duong']['cd_pegasus'] = P
        pl['duong']['cd_bien_gioi'] = duong(G, kx, ky, m['lat0'], m['lon0'], (16.62, 106.575), LANGVAY)   # biên giới Lào → Làng Vây
    else:
        pl['duong']['tc_pt76_tay'] = duong(G, kx, ky, m['lat0'], m['lon0'], (16.614, 106.603), LANGVAY)   # PT-76 hướng tây, theo QL9 từ phía Lào
        pl['duong']['tc_ql9'] = duong(G, kx, ky, m['lat0'], m['lon0'], LANGVAY, TACON)
    for k, v in pl['duong'].items(): print(k, len(v), v[0], v[-1])
pl['note'] = 'GĐ4 (25/11/2026): duong.* là đường đi tìm trên mạng đường OSM (tools/sa_ban/khe_sanh/duong_ks.py), toạ độ Blender m của tầng ghi ở tiền tố (cd_ = chiến dịch, tc_ = Tà Cơn). Đầu, cuối tuyến là MINH HOẠ hướng đi.'
json.dump(pl, open(os.path.join(GOI, 'placement.json'), 'w'), ensure_ascii=False)
