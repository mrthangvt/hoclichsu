#!/usr/bin/env python3
"""V5.6: dựng từ V5.5, chỉ thêm v56.css, v56-data.js và v56.js (hồ sơ vua – tướng lĩnh, sự kiện văn hóa, trắc nghiệm theo triều đại)."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v55.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V5.5_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v56.css">'
    js='<script defer src="static/v56-data.js"></script><script defer src="static/v56.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.5")
    if css in source or js in source:
        raise AssertionError("V5.5 không được chứa mã V5.6")
    for f in ["v56.css","v56-data.js","v56.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.5"
    output=STATIC/"Viet_Su_Timeline_V5.6_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.6: giữ nguyên nội dung V5.5; thêm v56.css, v56-data.js, v56.js")

if __name__=="__main__":
    build()
