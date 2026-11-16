#!/usr/bin/env python3
"""Build Việt Sử V4.7 from V4.6; does not overwrite older HTML or CMS data."""
from pathlib import Path
import subprocess
import sys

STATIC=Path(__file__).resolve().parents[1]/"static"

def build():
    prev=Path(__file__).with_name("build_v46.py")
    if not prev.is_file(): raise FileNotFoundError(prev)
    subprocess.run([sys.executable,str(prev)],check=True)
    source=STATIC/"Viet_Su_Timeline_V4.6_Offline.html"
    for f in ("v47.css","v47-data.js","v47.js"):
        if not (STATIC/f).is_file(): raise FileNotFoundError(STATIC/f)
    html=source.read_text(encoding="utf-8")
    if html.count("</head>")!=1 or html.count("</body>")!=1:
        raise ValueError("HTML gốc không hợp lệ")
    html=html.replace("</head>",'<link rel="stylesheet" href="static/v47.css"></head>',1)
    html=html.replace("</body>",'<script defer src="static/v47-data.js"></script><script defer src="static/v47.js"></script></body>',1)
    output=STATIC/"Viet_Su_Timeline_V4.7_Offline.html"
    output.write_text(html,encoding="utf-8")
    print("Built Việt Sử:",output)

if __name__=="__main__":build()
