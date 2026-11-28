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
    out={"phien_ban":"5.9.2","nhan_vat":nv["nhan_vat"],"su_kien":sk["su_kien"],"hcm":hcm["moc"],
         "hcm_nguon":hcm["nguon"],"hcm_ho_so":hcm["ho_so"],"hcm_bai_viet":hcm.get("bai_viet",[])}
    js=json.dumps(out,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    (STATIC/"v59-data.js").write_text("/* Học Lịch Sử V5.9 — nhân vật, sự kiện, dòng thời gian Hồ Chí Minh (sinh bởi tools/build_v59.py, đừng sửa tay) */\nwindow.VS59_DATA="+js+";\n",encoding="utf-8")
    return len(nv["nhan_vat"]),len(sk["su_kien"]),len(hcm["moc"])

# V5.9.2 — theo yêu cầu chủ dự án (24/11/2026): bỏ các nhãn kiểm duyệt ("chờ thẩm định", "nội dung mẫu",
# "thử nghiệm"…) khỏi giao diện để xuất bản nội dung. Giữ nguyên các ghi chú nguồn và ghi chú sử học
# (truyền thuyết, niên đại ước lệ, ảnh minh họa không phải chân dung tư liệu, "Tái dựng mô phỏng" của sa bàn).
XUAT_BAN=[
 ("Hồ sơ đang được xây dựng. Một số nhân vật sử dụng hình minh họa, nội dung cần tiếp tục thẩm định sử liệu.",
  "Một số nhân vật dùng hình minh họa, không phải chân dung tư liệu."),
 (" Nội dung cần được chuyên gia thẩm định trước khi phát hành giáo dục.",""),
 ('<p class="mini">Thông tin biên tập mẫu để thiết kế giao diện; các mô tả cần được thẩm định trước khi sử dụng trong chương trình giáo dục chính thức.</p>',""),
 (" Những chi tiết chưa đủ nguồn đang ở trạng thái nội dung mẫu.",""),
 ("generic:'DỮ LIỆU MẪU'","generic:'DỮ LIỆU LỊCH SỬ'"),
 (" Đây là lớp kiến thức thử nghiệm, cần tiếp tục biên tập và thẩm định.",""),
 ("<p>Các đề mục này là nội dung mẫu, chưa phải bài nghiên cứu hoàn chỉnh.</p>","<p>Các câu chuyện tiêu biểu gắn với chủ đề này.</p>"),
 ("' · Điểm pin mẫu, chưa định vị địa lý. Sa bàn lịch sử cần thẩm định trước khi công bố.'","' · Vị trí minh họa trên bản đồ.'"),
 ("Nội dung đang ở dạng thử nghiệm · V3.7","Nguồn: Hồ Chí Minh – Tiểu sử (Bảo tàng Hồ Chí Minh)"),
 # (26/11/2026) bỏ nhãn của Làng Sen – Kim Liên: không gian này đã gỡ khỏi Không gian lịch sử theo yêu cầu chủ dự án
 (" Hiện tại đây là sơ đồ các điểm dừng mẫu và yêu cầu nội dung cần thẩm định.",""),
 ('"status":"tóm tắt biên tập mẫu · cần thẩm định"','"status":"tóm tắt biên tập"'),
 ('"status":"chờ biên tập"','"status":"đề mục"'),
 ('"curriculum":"Đề cương minh họa; cần đối chiếu với chương trình đang học"','"curriculum":"Đối chiếu với chương trình đang học"'),
 ("Đọc đề cương ↗","Đọc bài ↗"),
 ("<p>Đây là bản tóm tắt do đội biên tập tạo, cần thẩm định sử liệu trước khi sử dụng như học liệu chính thức.</p>","<p>Bản tóm tắt do Ban biên tập Học Lịch Sử biên soạn.</p>"),
 ("<dd>Bài biên soạn mẫu · chờ thẩm định</dd>","<dd>Ban biên tập Học Lịch Sử</dd>"),
 ("<h3>Ghi chú biên tập</h3><p>Dữ liệu hồ sơ đang được chuẩn hóa. Những thông tin cần kiểm chứng sẽ được đánh dấu trước khi công bố dưới dạng học liệu chính thức.</p>",
  "<h3>Ghi chú biên tập</h3><p>Hồ sơ do Ban biên tập Học Lịch Sử biên soạn từ các nguồn ghi trong bài.</p>"),
 ("'Ảnh có thể đổi trong CMS; đây là bản biên tập chờ thẩm định.</p>'","'</p>'"),
 (" Nội dung cần được chuyển ngữ và thẩm định trước khi đưa vào học liệu chính thức.",""),
 ("Minh họa AI; cần thẩm định độ xác thực phục trang trước khi xuất bản","Minh họa AI, không phải hình tư liệu"),
 ("HỒ SƠ NHÂN VẬT · BẢN THẢO","HỒ SƠ NHÂN VẬT"),
 ("CHUYÊN ĐỀ SỬ LIỆU · V3.4","CHUYÊN ĐỀ SỬ LIỆU"),
 ('"tag":"cần thẩm định"','"tag":"niên đại còn tranh luận"'),
 ("<h3>Đề cương bài viết cùng chặng</h3><p>Nội dung mẫu theo mục lục giai đoạn, chưa thay cho bài thẩm định chính thức.</p>","<h3>Bài viết cùng chặng</h3>"),
]

# Đổi tên website/app thành "Học Lịch Sử" (25/11/2026). Giữ tên sách "Đại Việt sử ký (toàn thư)".
import re as _re
DOI_TEN=[(_re.compile(r'VIỆT SỬ · 越史'),'HỌC LỊCH SỬ'),
         (_re.compile(r'(?<!Đại )Việt Sử(?! [Kk][ýí])'),'Học Lịch Sử'),
         (_re.compile(r'VIỆT SỬ'),'HỌC LỊCH SỬ'),
         (_re.compile(r'vietsu\.com\.vn'),'hoclichsu.com'),
         (_re.compile(r'越史'),'學史')]

TIEU_DE="Học Lịch Sử – Dòng thời gian lịch sử Việt Nam và thế giới"

def doi_ten(html):
    for p,r in DOI_TEN: html=p.sub(r,html)
    # Tiêu đề tab (25/11/2026): chữ thường, đủ ý; tên in hoa vẫn dùng cho chữ thương hiệu trong trang.
    cu1="<title>HỌC LỊCH SỬ · Bản đồ thời gian</title>"; cu2="document.title=config.name+' – Dòng thời gian lịch sử'"
    assert cu1 in html and cu2 in html, "Không thấy tiêu đề tab cần đổi"
    html=html.replace(cu1,"<title>"+TIEU_DE+"</title>",1).replace(cu2,"document.title="+repr(TIEU_DE),1)
    return html

def xuat_ban(html):
    for cu,moi in XUAT_BAN:
        if cu not in html: raise AssertionError("Không thấy nhãn cần bỏ: "+cu[:60])
        html=html.replace(cu,moi)
    return html

def build():
    subprocess.run([sys.executable,str(HERE/"build_v58.py")],check=True)
    n=du_lieu()
    source=(STATIC/"Viet_Su_Timeline_V5.8_Offline.html").read_text(encoding="utf-8")
    css='<link rel="stylesheet" href="static/v59.css"><link rel="stylesheet" href="static/v61.css"><link rel="stylesheet" href="static/v62.css"><link rel="stylesheet" href="static/v63.css">'
    js='<script defer src="static/v59-data.js"></script><script defer src="static/v59.js"></script><script defer src="static/v59-duong-dan.js"></script><script defer src="static/v60-cms.js"></script><script defer src="static/v61.js"></script><script defer src="static/v62.js"></script><script defer src="static/v63.js"></script>'
    if source.count("</head>")!=1 or source.count("</body>")!=1:
        raise AssertionError("Không đúng cấu trúc V5.8")
    if "static/v59" in source:
        raise AssertionError("V5.8 không được chứa mã V5.9")
    for f in ["v59.css","v59.js","v59-data.js","v59-duong-dan.js","v60-cms.js","v61.css","v61.js","v62.css","v62.js","v63.css","v63.js"]:
        if not (STATIC/f).is_file():
            raise AssertionError("Thiếu tệp "+f)
    result=source.replace("</head>",css+"</head>",1).replace("</body>",js+"</body>",1)
    assert result.replace(css,"",1).replace(js,"",1)==source, "Không được thay nội dung V5.8"
    result=doi_ten(xuat_ban(result))
    # Đường dẫn rõ ràng (25/11/2026): đặt <base> theo thư mục gốc của trang để tài nguyên tương đối
    # vẫn đúng khi địa chỉ đổi thành /nhan-vat-lich-su/... (xem static/v59-duong-dan.js).
    goc=('<script>(function(){var p=location.pathname,m=p.match(/^(.*?\\/)(?:dong-thoi-gian-su-viet|chu-tich-ho-chi-minh|'
         'nhan-vat-lich-su|khong-gian-lich-su|sach-giao-khoa-lich-su|bo-de-on-su|su-kien)(?:\\/|$)/);'
         'var b=m?m[1]:p.replace(/[^\\/]*$/,"");window.HLS_GOC=b;'
         'if(/^https?:$/.test(location.protocol))document.write(\'<base href="\'+b+\'">\');})();</script>')
    assert result.find('<head><meta charset="utf-8">')>=0
    result=result.replace('<head><meta charset="utf-8">','<head><meta charset="utf-8">'+goc,1)
    # Favicon Học Lịch Sử (25/11/2026): chữ "Sử" vàng trên nền xanh đen, tệp trong static/favicon/.
    fav=('<link rel="icon" href="static/favicon/favicon.ico" sizes="any">'
         '<link rel="icon" type="image/png" sizes="32x32" href="static/favicon/favicon-32.png">'
         '<link rel="apple-touch-icon" href="static/favicon/apple-touch-icon.png">'
         '<link rel="manifest" href="static/favicon/site.webmanifest"><meta name="theme-color" content="#1f2930">')
    assert 'rel="icon"' not in result.split("</head>")[0]
    result=result.replace("</head>",fav+"</head>",1)
    (STATIC/"Viet_Su_Timeline_V5.9_Offline.html").write_text(result,encoding="utf-8")
    print(f"V5.9: nội dung V5.8 bỏ {len(XUAT_BAN)} nhãn kiểm duyệt; thêm v59.css, v59-data.js ({n[0]} nhân vật, {n[1]} sự kiện, {n[2]} mốc Hồ Chí Minh, bài viết 7 chặng), v59.js")

if __name__=="__main__":
    build()
