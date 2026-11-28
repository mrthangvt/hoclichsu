"""Trang trí nội dung bài viết khi hiển thị (V6.4): ghi chú + tự liên kết từ khóa.

- Ghi chú: trình biên tập lưu <span class="ghi-chu" title="nội dung">chữ</span> → hiển thị số chú thích [1]
  ngay sau chữ, và danh sách "Ghi chú" ở cuối bài (bấm số để nhảy xuống, bấm ↩ để quay lại).
- Tự liên kết: lần xuất hiện ĐẦU TIÊN của tên nhân vật / triều đại / sự kiện có trên Học Lịch Sử
  (theo data/duong_dan.json) thành liên kết tới trang của mục đó. Bỏ qua chữ trong liên kết, tiêu đề, ghi chú số.
Cùng quy tắc với phía trình duyệt (static/v60-cms.js, HLS_NOI_DUNG.trangTri) cho hồ sơ trên trang chính.
"""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

GC_RE = re.compile(r'<span class="ghi-chu" title="([^"]*)">(.*?)</span>', re.S)
THE_RE = re.compile(r"(<[^>]+>)")
BO_QUA = {"a", "h1", "h2", "h3", "h4", "sup", "code", "pre", "figcaption"}
LOAI_LIEN_KET = ("nhan-vat", "trieu-dai", "su-kien")


def ten_bien_the(ten: str) -> list[str]:
    """'Trần Hưng Đạo – Trần Quốc Tuấn (1228)' → ['Trần Hưng Đạo – Trần Quốc Tuấn', 'Trần Hưng Đạo', 'Trần Quốc Tuấn']"""
    ten = re.sub(r"\s*\([^)]*\)", "", ten or "").strip()
    ra = [ten] + [x.strip() for x in re.split(r"\s+[–—-]\s+", ten)]
    # Tên đủ dài, ít nhất hai chữ: tránh nối nhầm từ thường.
    return [x for i, x in enumerate(ra) if len(x) >= 5 and " " in x and x not in ra[:i]]


@lru_cache(maxsize=1)
def _bang_tu_khoa() -> tuple[re.Pattern | None, dict[str, str]]:
    tep = Path(__file__).resolve().parent / "data" / "duong_dan.json"
    try:
        ds = json.loads(tep.read_text(encoding="utf-8")).get("duong_dan", [])
    except (OSError, ValueError):
        return None, {}
    bang: dict[str, str] = {}
    for x in ds:
        if x.get("loai") not in LOAI_LIEN_KET:
            continue
        for t in ten_bien_the(x.get("ten", "")):
            bang.setdefault(t, "/" + x["duong"])
    if not bang:
        return None, {}
    mau = "|".join(re.escape(t) for t in sorted(bang, key=len, reverse=True))
    return re.compile(r"(?<![\w])(" + mau + r")(?![\w])"), bang


def lien_ket_tu_khoa(h: str, bo_url: str = "") -> str:
    mau, bang = _bang_tu_khoa()
    if not mau or not h:
        return h
    da: set[str] = {bo_url} if bo_url else set()
    sau = 0
    ra = []
    for phan in THE_RE.split(h):
        if phan.startswith("<"):
            lk = re.match(r'<a\s[^>]*href="([^"]+)"', phan)
            if lk:   # mục đã được liên kết tay thì không tự liên kết lần nữa
                da.add(lk.group(1).split("#")[0].rstrip("/") + "/")
            m = re.match(r"<(/?)([a-zA-Z0-9]+)", phan)
            if m and m.group(2).lower() in BO_QUA:
                sau += -1 if m.group(1) else 1
                sau = max(sau, 0)
            ra.append(phan)
            continue
        if sau or not phan.strip():
            ra.append(phan)
            continue

        def thay(m: re.Match) -> str:
            url = bang.get(m.group(1))
            if not url or url in da or url.rstrip("/") + "/" in da:
                return m.group(0)
            da.add(url)
            return f'<a class="hls-lk" href="{url}">{m.group(1)}</a>'
        ra.append(mau.sub(thay, phan))
    return "".join(ra)


def ghi_chu(h: str) -> str:
    ds: list[str] = []

    def thay(m: re.Match) -> str:
        ds.append(m.group(1))
        n = len(ds)
        return (f'<span class="ghi-chu">{m.group(2)}</span><sup class="gc-so"><a href="#gc-{n}" id="gcv-{n}" '
                f'title="{m.group(1)}">{n}</a></sup>')
    h = GC_RE.sub(thay, h or "")
    if ds:
        h += ('<div class="gc-ds"><h2>Ghi chú</h2><ol>'
              + "".join(f'<li id="gc-{i}">{t} <a href="#gcv-{i}" aria-label="Quay lại">↩</a></li>' for i, t in enumerate(ds, 1))
              + "</ol></div>")
    return h


def trang_tri(h: str, bo_url: str = "") -> str:
    h = re.sub(r"<p>(?:\s|<br>|&nbsp;)*</p>", "", h or "")   # đoạn trống (thường sau ảnh)
    return lien_ket_tu_khoa(ghi_chu(h), bo_url)


CSS = """
.ghi-chu{border-bottom:1px dotted currentColor}.gc-so{font-size:.72em;line-height:0;margin-left:1px}
.gc-so a{text-decoration:none;font-weight:700;padding:0 .15em}
.gc-ds{clear:both;margin-top:2em;padding-top:1em;border-top:1px solid #e1d8c6;font-size:.92em}.gc-ds h2{font-size:1.05em;margin:0 0 .4em}
.gc-ds ol{padding-left:1.4em;margin:0}.gc-ds li{margin:.3em 0}.gc-ds li:target{background:#fbeed3}
a.hls-lk{color:inherit;text-decoration:underline;text-decoration-color:#c9a35a;text-decoration-thickness:2px;text-underline-offset:3px}
a.hls-lk:hover{color:#8a6420}
article figure.anh-trai{float:left;max-width:45%;margin:.3em 1.4em 1em 0}
article figure.anh-phai{float:right;max-width:45%;margin:.3em 0 1em 1.4em}
article figure.anh-giua{max-width:70%;margin-left:auto;margin-right:auto}
article figure.anh-rong{margin-left:0;margin-right:0}article figure.anh-rong img{width:100%}
article::after{content:"";display:block;clear:both}
@media(max-width:600px){article figure.anh-trai,article figure.anh-phai{float:none;max-width:100%;margin:1em 0}article figure.anh-giua{max-width:100%}}
"""
