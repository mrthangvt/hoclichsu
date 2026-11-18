#!/usr/bin/env python3
"""Đóng gói sa bàn Điện Biên Phủ (vietsu/static/khong-gian/dien-bien-phu) thành bản cho artifact Claude.

claude.ai không phục vụ .glb/.bin/.wasm → các file nhị phân được mã hoá base64 thành *.txt và khai báo qua window.ASSETS;
bộ giải nén Draco dùng bản JavaScript (không cần WebAssembly).
Chạy: python3 tools/build_artifact_dbp.py  → dist_artifact_dbp/
"""
import base64, json, pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / 'vietsu' / 'static' / 'khong-gian' / 'dien-bien-phu', ROOT / 'dist_artifact_dbp'
shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns('*.glb', '*.bin', '*.jpg', '*.wasm', '*.mp3', '*.webp'))
assets = {'dracoType': 'js'}
def b64(rel, key):
    (OUT / (rel + '.txt')).write_text(base64.b64encode((SRC / rel).read_bytes()).decode())
    assets[key] = rel + '.txt'
b64('models/static.glb', 'static'); b64('models/mau.glb', 'mau'); b64('models/nhanvat.glb', 'nhanvat'); b64('models/hq.glb', 'hq'); b64('models/linh.glb', 'linh'); b64('models/phap.glb', 'phap'); b64('models/giap.glb', 'giap'); b64('models/xucdat.glb', 'xucdat'); b64('models/cay_mau.glb', 'caymau'); b64('data/cay.bin', 'cay'); b64('tex/matdat_2k.jpg', 'matdat'); b64('audio/chim-buoi-sang.mp3', 'chim'); b64('audio/nhac-xuan-ve-tren-ban-mong.mp3', 'xuan'); b64('audio/nhac-giai-phong-dien-bien.mp3', 'gp'); b64('tex/dat.webp', 'dat'); b64('tex/dat_n.webp', 'datn')
html = (OUT / 'index.html').read_text()
html = html.replace('<!--ASSETS-->', f'<script>window.ASSETS={json.dumps(assets)};</script>')
(OUT / 'index.html').write_text(html)
print('Đã tạo', OUT, '·', ', '.join(f'{k}={v}' for k, v in assets.items()))
