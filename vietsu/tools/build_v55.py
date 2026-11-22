#!/usr/bin/env python3
"""V5.5: dựng từ V5.4, chỉ thêm v55.css và v55.js (các đời vua trong Sơ đồ triều đại)."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v54.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V5.4_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v55.css">'
    js='<script defer src="static/v55.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.4")
    if css in source or js in source:
        raise AssertionError("V5.4 không được chứa mã V5.5")
    for f in ["v55.css","v55.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.4"
    output=STATIC/"Viet_Su_Timeline_V5.5_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.5: giữ nguyên nội dung V5.4; thêm v55.css và v55.js")

if __name__=="__main__":
    build()
