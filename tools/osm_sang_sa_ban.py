#!/usr/bin/env python3
"""Đổi toạ độ OpenStreetMap (vĩ độ, kinh độ) sang toạ độ sa bàn Thành cổ Quảng Trị.

Hệ toạ độ sa bàn (mét, Blender X/Y; Z lên trên):
  - gốc (0,0) = tâm Thành cổ; trục X hướng Đông của sa bàn, Y hướng Bắc của sa bàn;
  - bản đồ đã xoay +16,6° để 4 mặt thành thẳng trục, nên "Bắc" sa bàn lệch 16,6° so với Bắc thật;
  - mặt thành ở khoảng ±250 m; Cổng Tiền ≈ (0, −250); sông Thạch Hãn ở phía Tây (x ≈ −480 … −740).
  - Đổi sang three.js trong app.js: B(x, y, z) = (x, z, −y).
Độ lệch gốc (+6, −9) đã khớp với docs/du-lieu/osm_local.json (sai số < 1 m).

Cách dùng:
  python3 tools/osm_sang_sa_ban.py 16.75121 107.18954            # một điểm (vĩ độ kinh độ, copy từ OSM)
  python3 tools/osm_sang_sa_ban.py 16.75121,107.18954 16.7550,107.1880
  python3 tools/osm_sang_sa_ban.py duong_dan.geojson > ket_qua.json  # cả file GeoJSON (Point/LineString/Polygon)
"""
import json, math, sys

LAT0, LON0, GOC = 16.7538404, 107.1895488, math.radians(16.6)
DX, DY = 6.0, -9.0


def sang_sa_ban(lat, lon):
    x = (lon - LON0) * 111320 * math.cos(math.radians(LAT0))
    y = (lat - LAT0) * 110574
    return (round(x * math.cos(GOC) - y * math.sin(GOC) + DX, 1),
            round(x * math.sin(GOC) + y * math.cos(GOC) + DY, 1))


def doi_hinh(geom):
    t, c = geom['type'], geom['coordinates']
    f = lambda p: list(sang_sa_ban(p[1], p[0]))          # GeoJSON lưu [kinh độ, vĩ độ]
    if t == 'Point': return f(c)
    if t in ('LineString', 'MultiPoint'): return [f(p) for p in c]
    if t in ('Polygon', 'MultiLineString'): return [[f(p) for p in r] for r in c]
    if t == 'MultiPolygon': return [[[f(p) for p in r] for r in poly] for poly in c]
    raise ValueError('Chưa hỗ trợ kiểu ' + t)


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        print(__doc__); sys.exit()
    if a[0].endswith(('.geojson', '.json')):
        g = json.load(open(a[0], encoding='utf-8'))
        ds = g['features'] if 'features' in g else [g]
        out = [{'ten': (f.get('properties') or {}).get('name'), 'loai': f['geometry']['type'],
                'thuoc_tinh': f.get('properties') or {}, 'sa_ban_xy': doi_hinh(f['geometry'])} for f in ds]
        print(json.dumps({'ghi_chu': 'Toạ độ sa bàn (m, Blender X/Y). © OpenStreetMap contributors (ODbL).', 'doi_tuong': out},
                         ensure_ascii=False, indent=1))
    else:
        so = [float(v) for s in a for v in s.replace(',', ' ').split()]
        for i in range(0, len(so) - 1, 2):
            x, y = sang_sa_ban(so[i], so[i + 1])
            print(f'{so[i]:.6f}, {so[i+1]:.6f}  ->  sa bàn x={x}, y={y}   (three.js: {x}, 0, {-y})')
