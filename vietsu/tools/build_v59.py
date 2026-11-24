#!/usr/bin/env python3
"""V5.9: dựng từ V5.8, thêm v59.css, v59-data.js và v59.js.

v59-data.js sinh từ vietsu/data/v59_nhan_vat.json, v59_su_kien.json, v59_hcm.json
(tổng hợp các sách mới trong "Tài liệu sử": Từ điển nhân vật lịch sử Việt Nam, Những tấm gương anh hùng liệt sĩ
của tuổi trẻ Việt Nam, Tiểu sử Chủ tịch Hồ Chí Minh, Việt sử toàn thư của Phạm Văn Sơn).
Nội dung viết lại bằng lời mới, không chép nguyên văn sách.
"""
from pathlib import Path
import json
import subprocess
import sys
HERE=Path(__file__).resolve().parent
STATIC=HERE.parent/"static"
DATA=HERE.parent/"data"
BIEU_TUONG="⚔✦⚑◈"

def doc(ten):
    return json.loads((DATA/ten).read_text(encoding="utf-8"))

def du_lieu():
    nv=doc("v59_nhan_vat.json"); sk=doc("v59_su_kien.json"); hcm=doc("v59_hcm.json")
    ids=set()
    for x in nv["nhan_vat"]:
        for k in ("id","name","period","role","bio","src"):
            if not x.get(k): raise AssertionError(f"Nhân vật {x.get('id')}: thiếu {k}")
        assert x["id"] not in ids, "Trùng id "+x["id"]; ids.add(x["id"])
        assert isinstance(x["bio"],list) and all(isinstance(t,str) and t.strip() for t in x["bio"]), x["id"]
    for e in sk["su_kien"]:
        for k in ("id","nam","bieu_tuong","ten","doan","src"):
            if k not in e: raise AssertionError(f"Sự kiện {e.get('id')}: thiếu {k}")
        assert e["bieu_tuong"] in BIEU_TUONG, e["id"]
        assert e["id"] not in ids, "Trùng id "+e["id"]; ids.add(e["id"])
    nam=[m["nam"] for m in hcm["moc"]]
    assert len(nam)==len(set(nam)), "Mốc Hồ Chí Minh trùng năm"
    for m in hcm["moc"]:
        for k in ("nam","ngay","ten","doan"):
            if k not in m: raise AssertionError(f"Mốc HCM {m.get('nam')}: thiếu {k}")
    chang=[b["chang"] for b in hcm.get("bai_viet",[])]
    assert len(chang)==len(set(chang)), "Bài viết chặng Hồ Chí Minh trùng"
    for b in hcm.get("bai_viet",[]):
        for k in ("chang","ten","trang","doan"):
            if not b.get(k): raise AssertionError(f"Bài viết chặng {b.get('chang')}: thiếu {k}")
    out={"phien_ban":"5.9.1","nhan_vat":nv["nhan_vat"],"su_kien":sk["su_kien"],"hcm":hcm["moc"],
         "hcm_nguon":hcm["nguon"],"hcm_ho_so":hcm["ho_so"],"hcm_bai_viet":hcm.get("bai_viet",[])}
    js=json.dumps(out,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    (STATIC/"v59-data.js").write_text("/* Việt Sử V5.9 — nhân vật, sự kiện, dòng thời gian Hồ Chí Minh (sinh bởi tools/build_v59.py, đừng sửa tay) */\nwindow.VS59_DATA="+js+";\n",encoding="utf-8")
    return len(nv["nhan_vat"]),len(sk["su_kien"]),len(hcm["moc"])

def build():
    subprocess.run([sys.executable,str(HERE/"build_v58.py")],check=True)
    n=du_lieu()
    source=(STATIC/"Viet_Su_Timeline_V5.8_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v59.css">'
    js='<script defer src="static/v59-data.js"></script><script defer src="static/v59.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.8")
    if "static/v59" in source:
        raise AssertionError("V5.8 không được chứa mã V5.9")
    for f in ["v59.css","v59.js","v59-data.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.8"
    (STATIC/"Viet_Su_Timeline_V5.9_Offline.html").write_text(result,encoding="utf-8")
    print(f"V5.9: giữ nguyên nội dung V5.8; thêm v59.css, v59-data.js ({n[0]} nhân vật, {n[1]} sự kiện, {n[2]} mốc Hồ Chí Minh, bài viết 7 chặng), v59.js")

if __name__=="__main__":
    build()
