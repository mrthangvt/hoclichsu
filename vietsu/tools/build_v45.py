#!/usr/bin/env python3
"""Generate V4.5 on top of V4.4, without rewriting older builds or CMS records."""
from pathlib import Path
import subprocess
import sys

STATIC=Path(__file__).resolve().parents[1]/"static"

def build():
    prev=Path(__file__).with_name("build_v44.py")
    if not prev.is_file():
        raise FileNotFoundError("Thiếu tools/build_v44.py")
    subprocess.run([sys.executable,str(prev)],check=True)
    html=(STATIC/"Viet_Su_Timeline_V4.4_Offline.html").read_text(encoding="utf-8")
    for f in ["v45.css","v45.js"]:
        if not (STATIC/f).is_file():raise FileNotFoundError(f)
    assets=STATIC/"avatar-v45"
    for name in ["emperor","official","warrior","queen","female-warrior","woman"]:
        if not (assets/(name+"-256.webp")).is_file():
            raise FileNotFoundError("Thiếu ảnh chuẩn hóa V4.5: "+name+"-256.webp")
    if html.count("</head>")!=1 or html.count("</body>")!=1:
        raise ValueError("Cấu trúc HTML không hợp lệ")
    html=html.replace("</head>",'<link rel="stylesheet" href="static/v45.css"></head>',1)
    html=html.replace("</body>",'<script defer src="static/v45.js"></script></body>',1)
    dst=STATIC/"Viet_Su_Timeline_V4.5_Offline.html"
    dst.write_text(html,encoding="utf-8")
    print("Built:",dst)

if __name__=="__main__":build()
