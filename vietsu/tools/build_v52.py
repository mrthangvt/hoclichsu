#!/usr/bin/env python3
"""V5.2: dựng từ V4.11 hiện hành trên GitHub, chỉ thêm hai tệp giao diện được duyệt."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v411.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V4.11_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v52.css">'
    js='<script defer src="static/v52.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V4.11")
    if css in source or js in source:
        raise AssertionError("V4.11 không được chứa mã V5.2")
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay giao diện gốc"
    output=STATIC/"Viet_Su_Timeline_V5.2_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.2: giữ nguyên nội dung V4.11; thêm v52.css và v52.js")

if __name__=="__main__":
    build()
