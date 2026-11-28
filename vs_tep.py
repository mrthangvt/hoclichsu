"""Học Lịch Sử V6 — thư viện ảnh cho CMS (ảnh bài viết, ảnh đại diện, biểu tượng trợ lý…).

Ảnh tải lên được kiểm tra định dạng thật (PNG/JPG/WebP), chuyển sang WebP tối đa 1920 px và tạo ảnh nhỏ 480 px.
Lưu ở static/uploads/thu-vien/<năm-tháng>/ (trên VPS là thư mục bền /www/hoclichsu-du-lieu/uploads).
"""
from __future__ import annotations

import io
import re
import secrets
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from vs_core import UPLOADS, db, decode_image_data, now
from vs_taikhoan import VAI_TRO_SUA, can_vai_tro, ghi_nhat_ky

router = APIRouter()
THU_MUC = UPLOADS / "thu-vien"
URL_GOC = "/static/uploads/thu-vien/"


def init_tep() -> None:
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS tep (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ten TEXT NOT NULL, url TEXT NOT NULL, url_nho TEXT NOT NULL,
            rong INTEGER, cao INTEGER, dung_luong INTEGER,
            alt TEXT DEFAULT '', tai_len_boi TEXT, luc TEXT NOT NULL);
        """)


def _ten_an_toan(t: str) -> str:
    import unicodedata
    t = unicodedata.normalize("NFD", t or "anh").encode("ascii", "ignore").decode()
    t = re.sub(r"[^A-Za-z0-9]+", "-", t.rsplit(".", 1)[0]).strip("-").lower()[:50]
    return t or "anh"


class TaiLenIn(BaseModel):
    du_lieu: str = Field(max_length=14_000_000)   # data:image/...;base64,...
    ten: str = Field(default="anh", max_length=200)
    alt: str = Field(default="", max_length=300)


class SuaTepIn(BaseModel):
    alt: str = Field(default="", max_length=300)


@router.post("/api/v6/tep")
def tai_len(item: TaiLenIn, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    blob, _ext, _mime = decode_image_data(item.du_lieu, 10_000_000)
    try:
        from PIL import Image, ImageOps
    except ImportError:
        raise HTTPException(503, "Máy chủ thiếu thư viện Pillow.")
    try:
        im = Image.open(io.BytesIO(blob))
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    except Exception:
        raise HTTPException(415, "Không đọc được ảnh.")
    if im.width * im.height > 60_000_000:
        raise HTTPException(413, "Ảnh quá lớn.")
    thang = datetime.now().strftime("%Y-%m")
    (THU_MUC / thang).mkdir(parents=True, exist_ok=True)
    goc = f"{_ten_an_toan(item.ten)}-{secrets.token_hex(3)}"
    lon = im.copy()
    lon.thumbnail((1920, 1920))
    lon.save(THU_MUC / thang / f"{goc}.webp", "WEBP", quality=84, method=4)
    nho = im.copy()
    nho.thumbnail((480, 480))
    nho.save(THU_MUC / thang / f"{goc}-480.webp", "WEBP", quality=80, method=4)
    dl = (THU_MUC / thang / f"{goc}.webp").stat().st_size
    url, url_nho = f"{URL_GOC}{thang}/{goc}.webp", f"{URL_GOC}{thang}/{goc}-480.webp"
    with db() as con:
        cur = con.execute("INSERT INTO tep (ten, url, url_nho, rong, cao, dung_luong, alt, tai_len_boi, luc) VALUES (?,?,?,?,?,?,?,?,?)",
                          (item.ten[:200], url, url_nho, lon.width, lon.height, dl, item.alt.strip(), tk["ten"], now()))
        ghi_nhat_ky(con, tk, "tai-anh", item.ten[:100], request)
    return {"id": cur.lastrowid, "url": url, "url_nho": url_nho, "rong": lon.width, "cao": lon.height, "alt": item.alt.strip()}


@router.get("/api/v6/tep")
def ds_tep(request: Request, trang: int = 0, q: str = ""):
    can_vai_tro(request, *VAI_TRO_SUA)
    trang = max(0, trang)
    with db() as con:
        dk, ts = "", []
        if q.strip():
            dk, ts = " WHERE ten LIKE ? OR alt LIKE ?", [f"%{q.strip()}%"] * 2
        tong = con.execute("SELECT COUNT(*) FROM tep" + dk, ts).fetchone()[0]
        rows = con.execute("SELECT * FROM tep" + dk + " ORDER BY id DESC LIMIT 40 OFFSET ?", ts + [trang * 40]).fetchall()
    return JSONResponse({"tong": tong, "tep": [dict(r) for r in rows]}, headers={"Cache-Control": "no-store"})


@router.put("/api/v6/tep/{tep_id}")
def sua_tep(tep_id: int, item: SuaTepIn, request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        con.execute("UPDATE tep SET alt=? WHERE id=?", (item.alt.strip(), tep_id))
    return {"ok": True}


@router.delete("/api/v6/tep/{tep_id}")
def xoa_tep(tep_id: int, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        r = con.execute("SELECT * FROM tep WHERE id=?", (tep_id,)).fetchone()
        if not r:
            raise HTTPException(404, "Không có ảnh này.")
        for u in (r["url"], r["url_nho"]):
            if u.startswith(URL_GOC):
                p = (THU_MUC / u[len(URL_GOC):]).resolve()
                if THU_MUC.resolve() in p.parents:
                    p.unlink(missing_ok=True)
        con.execute("DELETE FROM tep WHERE id=?", (tep_id,))
        ghi_nhat_ky(con, tk, "xoa-anh", r["ten"], request)
    return {"ok": True}
