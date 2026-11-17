#!/usr/bin/env python3
"""V4.9: kế thừa V4.8, chỉ bổ sung lớp ảnh và bản đồ do chủ dự án yêu cầu."""
from pathlib import Path
import subprocess
import sys
STATIC = Path(__file__).resolve().parents[1] / 'static'
def build():
    subprocess.run([sys.executable, str(Path(__file__).with_name('build_v48.py'))], check=True)
    html = (STATIC / 'Viet_Su_Timeline_V4.8_Offline.html').read_text()
    for name in ['v49-data.js', 'v49.js']:
        if not (STATIC / name).is_file(): raise FileNotFoundError(name)
    html = html.replace('</body>', '<script defer src="static/v49-data.js"></script><script defer src="static/v49.js"></script></body>', 1)
    (STATIC / 'Viet_Su_Timeline_V4.9_Offline.html').write_text(html)
    print('Đã dựng V4.9: giữ bố cục V4.6, khôi phục ảnh V4.5 và bản đồ véc-tơ.')
if __name__ == '__main__': build()
