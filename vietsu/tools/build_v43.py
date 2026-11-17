#!/usr/bin/env python3
"""Build V4.3 on top of V4.2, preserving earlier generated pages."""
from pathlib import Path
import subprocess,sys
STATIC=Path(__file__).resolve().parents[1]/"static"
def build():
    source=Path(__file__).with_name("build_v42.py")
    if not source.exists():raise FileNotFoundError("Cần build_v42.py từ nhánh V4.2.")
    subprocess.run([sys.executable,str(source)],check=True)
    base=STATIC/"Viet_Su_Timeline_V4.2_Offline.html"
    for name in ("v43.js","v43.css"):
        if not (STATIC/name).is_file():raise FileNotFoundError(name)
    page=base.read_text(encoding="utf-8")
    if page.count("</head>")!=1 or page.count("</body>")!=1:raise ValueError("HTML V4.2 không có đúng một thẻ head/body đóng.")
    page=page.replace("</head>",'<link rel="stylesheet" href="static/v43.css"></head>',1)
    page=page.replace("</body>",'<script defer src="static/v43.js"></script></body>',1)
    target=STATIC/"Viet_Su_Timeline_V4.3_Offline.html"
    target.write_text(page,encoding="utf-8")
    print("Built:",target)
if __name__=="__main__":build()
