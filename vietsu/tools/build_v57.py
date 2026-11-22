#!/usr/bin/env python3
"""V5.7: dựng từ V5.6, chỉ thêm v57.css và v57.js (Bộ đề ôn Sử dàn hết trang)."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v56.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V5.6_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v57.css">'
    js='<script defer src="static/v57.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.6")
    if css in source or js in source:
        raise AssertionError("V5.6 không được chứa mã V5.7")
    for f in ["v57.css","v57.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.6"
    output=STATIC/"Viet_Su_Timeline_V5.7_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.7: giữ nguyên nội dung V5.6; thêm v57.css, v57.js")

if __name__=="__main__":
    build()
