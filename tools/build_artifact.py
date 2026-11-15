#!/usr/bin/env python3
"""Đóng gói thư mục web/ thành bản cho artifact Claude (claude.ai không phục vụ file .glb).

Kết quả: dist_artifact/ gồm index.html (đã chèn window.ASSETS), css/, js/, data/, tex/,
và models/*.glb.txt (base64). Claude đăng thư mục này bằng publish_files.
Chạy: python3 tools/build_artifact.py
"""
import base64, json, pathlib, shutil
ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / 'web', ROOT / 'dist_artifact'
shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns('*.glb'))
assets = {}
for glb in sorted((SRC / 'models').glob('*.glb')):
    (OUT / 'models' / (glb.name + '.txt')).write_text(base64.b64encode(glb.read_bytes()).decode())
    key = {'thuvien': 'lib', 'thuyen': 'boat'}.get(glb.stem, glb.stem)
    assets[key] = f'models/{glb.name}.txt'
html = (OUT / 'index.html').read_text()
html = html.replace('<!--ASSETS-->', f'<script>window.ASSETS={json.dumps(assets)};</script>')
(OUT / 'index.html').write_text(html)
print('Đã tạo', OUT, '·', ', '.join(assets.values()))
