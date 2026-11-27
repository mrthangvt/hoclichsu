"""Tìm đường đi trên mạng đường OSM (đã bỏ đường làm sau 1975) giữa hai điểm kinh-vĩ, trả toạ độ Blender (m) của tầng sa bàn.
python3 tim_duong.py <hcm1975_osm.json> <tang> <lat1> <lon1> <lat2> <lon2> [qua lat,lon ...]   → JSON [[x, y], …]"""
import json, sys, math, heapq, re
sys.path.insert(0, '.')
OSM = json.load(open(sys.argv[1])); tang = sys.argv[2]
L = [l for l in OSM['layers'] if l['name'] == tang][0]
T = json.load(open(f't_{tang}.json')); kx = 111320 * math.cos(math.radians(T['lat0'])); ky = 110574
MOI = re.compile(open('dung_dia_hinh.py').read().split("MOI = re.compile(r'")[1].split("')")[0].replace("'\n                 r'", ''))
XY = lambda lo, la: ((lo - T['lon0']) * kx, (la - T['lat0']) * ky)
G = {}; key = lambda p: (round(p[0], 5), round(p[1], 5))
for e in L['el']:
    t = e['tags']
    if e['t'] != 'w' or 'highway' not in t or t['highway'] in ('footway', 'path', 'steps', 'cycleway', 'service', 'pedestrian'): continue
    if MOI.search(t.get('name', '') + ' ' + t.get('ref', '')): continue
    w = {'trunk': 1, 'primary': 1, 'secondary': 1.1, 'tertiary': 1.25}.get(t['highway'], 1.6)   # ưu tiên đường lớn
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
    path = [g]
    while path[-1] != s: path.append(P[path[-1]])
    return path[::-1]
pts = [tuple(map(float, sys.argv[i:i + 2])) for i in (3, 5)]
via = [tuple(map(float, a.split(','))) for a in sys.argv[7:]]
seq = [pts[0]] + via + [pts[1]]; out = []
for (a, b) in zip(seq, seq[1:]):
    p = dij(gan(*a), gan(*b)); out += p if not out else p[1:]
xy = [[round(v, 1) for v in XY(*n)] for n in out]
L_ = sum(math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]) for i in range(1, len(xy)))
print(json.dumps({'diem': xy, 'dai_m': round(L_)}))
