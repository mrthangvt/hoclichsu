#!/usr/bin/env python3
"""V5.8: dựng từ V5.7, thêm v58.css, v58-sgk.js (bài học SGK Lịch sử lớp 6, 7) và v58.js.

v58-sgk.js sinh từ vietsu/data/sgk_kntt_lop6.json, sgk_kntt_lop7.json (nội dung Việt Sử biên soạn lại theo mạch bài
của SGK Lịch sử và Địa lí 6, 7 bộ Kết nối tri thức với cuộc sống; không chép nguyên văn sách).
"""
from pathlib import Path
import json
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"
DATA=HERE.parent/"data"
BAT_BUOC=("so","chuong","ten","trang","nam","tom","muc","nho","hoi")

def du_lieu():
    lop={}
    for g in (6,7):
        d=json.loads((DATA/f"sgk_kntt_lop{g}.json").read_text(encoding="utf-8"))
        assert d["lop"]==g
        for b in d["bai"]:
            thieu=[k for k in BAT_BUOC if k not in b]
            if thieu: raise AssertionError(f"Lớp {g} bài {b.get('so')}: thiếu {thieu}")
            assert len(b["trang"])==2 and b["trang"][0]<=b["trang"][1], b["ten"]
            assert b["muc"] and all(len(m)==2 and m[1] for m in b["muc"]), b["ten"]
        lop[str(g)]={k:d[k] for k in ("sach","ghi_chu","bai")}
    js=json.dumps({"phien_ban":"5.8","lop":lop},ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    (STATIC/"v58-sgk.js").write_text("/* Việt Sử V5.8 — bài học SGK Lịch sử lớp 6, 7 (sinh bởi tools/build_v58.py, đừng sửa tay) */\nwindow.VS58_SGK="+js+";\n",encoding="utf-8")
    return sum(len(v["bai"]) for v in lop.values())

def build():
    subprocess.run([sys.executable,str(HERE/"build_v57.py")],check=True)
    n=du_lieu()
    source=(STATIC/"Viet_Su_Timeline_V5.7_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v58.css">'
    js='<script defer src="static/v58-sgk.js"></script><script defer src="static/v58.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.7")
    if "static/v58" in source:
        raise AssertionError("V5.7 không được chứa mã V5.8")
    for f in ["v58.css","v58.js","v58-sgk.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.7"
    output=STATIC/"Viet_Su_Timeline_V5.8_Offline.html"
    output.write_text(result,encoding="utf-8")
    print(f"V5.8: giữ nguyên nội dung V5.7; thêm v58.css, v58-sgk.js ({n} bài lớp 6, 7), v58.js")

if __name__=="__main__":
    build()
