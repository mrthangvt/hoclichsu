#!/usr/bin/env python3
"""Build Việt Sử V4.6 from V4.5 without touching CMS data."""
from pathlib import Path
import subprocess,sys

STATIC=Path(__file__).resolve().parents[1]/"static"

def build():
    prev=Path(__file__).with_name("build_v45.py")
    if not prev.is_file():raise FileNotFoundError(prev)
    subprocess.run([sys.executable,str(prev)],check=True)
    src=STATIC/"Viet_Su_Timeline_V4.5_Offline.html"
    for name in ["v46.css","v46.js"]:
        if not (STATIC/name).is_file():raise FileNotFoundError(name)
    html=src.read_text(encoding="utf-8")
    if html.count("</head>")!=1 or html.count("</body>")!=1:
        raise ValueError("Trang V4.5 không có thẻ đóng hợp lệ")
    html=html.replace("</head>",'<link rel="stylesheet" href="static/v46.css"></head>',1)
    html=html.replace("</body>",'<script defer src="static/v46.js"></script></body>',1)
    dst=STATIC/"Viet_Su_Timeline_V4.6_Offline.html"
    dst.write_text(html,encoding="utf-8")
    print("V4.6:",dst)

if __name__=="__main__":build()
