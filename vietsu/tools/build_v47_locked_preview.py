#!/usr/bin/env python3
"""Đóng gói BẢN XEM THỬ NGOẠI TUYẾN cho V4.7, KHÔNG thiết kế lại giao diện.

Đọc bản nền V4.1 và lần lượt áp dụng chính xác phép nối thẻ CSS/JS
của các bản build V4.2→V4.6. Đóng gói nội dung V4.6, không chèn UI V4.7.
Được phép bỏ qua kiểm tra 41 ảnh còn thiếu trong nhánh để preview,
nhưng không coi đó là bản build chính thức đã đủ tài nguyên.
"""
from __future__ import annotations

from pathlib import Path
from shutil import copytree, copyfile
import hashlib
import html
import json
import re

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"static"
OUT=ROOT/"preview-v47-locked"

def make():
    src=SRC/"Viet_Su_Timeline_V4.1_Offline.html"
    if not src.is_file():
        raise SystemExit("Thiếu trang nền V4.1")
    page=src.read_text(encoding="utf8")
    if page.count("</head>")!=1 or page.count("</body>")!=1:
        raise SystemExit("Trang nền không đủ head/body")
    for version in ("42","43","44","45","46"):
        css=SRC/f"v{version}.css"
        js=SRC/f"v{version}.js"
        if version!="44":
            if not css.is_file():raise SystemExit(f"Thiếu {css}")
            page=page.replace("</head>",f'<link rel="stylesheet" href="static/v{version}.css"></head>',1)
        if not js.is_file():raise SystemExit(f"Thiếu {js}")
        page=page.replace("</body>",f'<script defer src="static/v{version}.js"></script></body>',1)
        if version=="42":
            page=page.replace("Bản lưu ngoại tuyến · Dữ liệu được lưu tại thời điểm xuất bản V4.1",
                             "Bản lưu ngoại tuyến · Dữ liệu được lưu tại thời điểm xuất bản V4.2")
    if "static/v47.css" in page or "static/v47.js" in page or "v47-profile" in page:
        raise SystemExit("Khác giao diện V4.6, không cho xuất bản.")
    # Các URL tuyệt đối chỉ dành cho HTTP server: đổi thành tương đối
    # cho chế độ double-click file://. Chỉ đổi đường dẫn, không thay UI.
    page=page.replace('src="/static/', 'src="static/')
    page=page.replace('href="/static/', 'href="static/')
    page=page.replace("url('/static/", "url('static/")
    OUT.mkdir(exist_ok=True)
    (OUT/"index.html").write_text(page,encoding="utf8")
    # Mang theo JS/CSS, ảnh có sẵn, và sa bàn 3D. Không thay thế ảnh còn thiếu
    # bằng hình AI hoặc trộn asset không rõ nguồn.
    folder=OUT/"static"
    folder.mkdir(exist_ok=True)
    for version in ("42","43","44","45","46"):
        for ext in (("css","js") if version!="44" else ("js",)):
            f=SRC/f"v{version}.{ext}"
            copyfile(f,folder/f.name)
    for name in ["assets","avatar-v45","v43","build","fonts","vendor","khong-gian"]:
        if (SRC/name).is_dir():
            copytree(SRC/name,folder/name,dirs_exist_ok=True)
    # Sa bàn có url không nằm dưới /static
    if (SRC/"khong-gian").is_dir():
        copytree(SRC/"khong-gian",OUT/"khong-gian",dirs_exist_ok=True)
    note="""VIỆT SỬ V4.7 — XEM THỬ GIAO DIỆN KHÓA V4.6

MỞ OFFLINE:
1. Giải nén cả thư mục, không di chuyển riêng file index.html.
2. Mở index.html bằng Google Chrome / Safari.
3. Giao diện sử dụng đúng các lớp HTML/CSS/JavaScript V4.1–V4.6.
   KHÔNG có thanh chuyên mục V4.7, không có thiết kế mới.
4. Không có API/CMS khi chạy offline. CMS V4.7 cần chạy qua FastAPI Local.
5. 41 ảnh WebP của V4.3/V4.5 vẫn chưa có trên GitHub; một số vị trí
   có thể rơi về ảnh dự phòng/hiển thị chữ thay thế.
6. Bản preview này để anh DUYỆT GIAO DIỆN, chưa phải gói deploy.
"""
    (OUT/"HUONG_DAN.txt").write_text(note,encoding="utf8")
    print("PREVIEW_OK",len(page),str(OUT))
    print("SHA256",hashlib.sha256(page.encode("utf8")).hexdigest())
    assert (OUT/"static/v46.js").exists()
    assert (OUT/"static/v45.js").exists()
    assert not (OUT/"static/v47.js").exists()
    assert not (OUT/"static/v47.css").exists()
    assert 'v47-profile' not in page

if __name__=="__main__":make()
