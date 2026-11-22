#!/usr/bin/env python3
"""V5.3: dựng từ V5.2, chỉ thêm v53.css và v53.js (logo mới, gom menu Sách giáo khoa, nút sa bàn 3D trong popup chiến trận)."""
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"

def build():
    subprocess.run([sys.executable,str(HERE/"build_v52.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V5.2_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v53.css">'
    js='<script defer src="static/v53.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.2")
    if css in source or js in source:
        raise AssertionError("V5.2 không được chứa mã V5.3")
    for f in ["v53.css","v53.js","v53/logo-toi.webp","v53/logo-sang.webp","v53/logo-chu-toi.webp","v53/logo-chu-sang.webp"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.2"
    output=STATIC/"Viet_Su_Timeline_V5.3_Offline.html"
    output.write_text(result,encoding="utf-8")
    print("V5.3: giữ nguyên nội dung V5.2; thêm v53.css và v53.js")

if __name__=="__main__":
    build()
