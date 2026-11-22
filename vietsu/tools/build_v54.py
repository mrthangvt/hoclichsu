#!/usr/bin/env python3
"""V5.4: dựng từ V5.3, chỉ thêm v54.css và v54.js (mobile: thẻ trang phục gọn, nhãn Tóc & Mũ, menu dưới một hàng)."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v53.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V5.3_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v54.css">'
    js='<script defer src="static/v54.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.3")
    if css in source or js in source:
        raise AssertionError("V5.3 không được chứa mã V5.4")
    for f in ["v54.css","v54.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.3"
    output=STATIC/"Viet_Su_Timeline_V5.4_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.4: giữ nguyên nội dung V5.3; thêm v54.css và v54.js")

if __name__=="__main__":
    build()
