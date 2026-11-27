"""Học Lịch Sử V6 — sửa nội dung các mục Menu từ CMS.

Nội dung gốc (nhân vật, triều đại, sự kiện, mốc Hồ Chí Minh, bài SGK) nằm sẵn trong trang tĩnh.
CMS chỉ lưu PHẦN SỬA (bản vá) theo (loai, ma); trang chính tải /api/v6/noi-dung rồi áp lên dữ liệu gốc
(static/v60-cms.js). Xóa bản vá = trở về nội dung gốc. Mọi lần sửa đều lưu lịch sử để khôi phục.
"""
from __future__ import annotations

import json
import re

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from vs_core import db, now
from vs_taikhoan import VAI_TRO_SUA, can_vai_tro, ghi_nhat_ky

router = APIRouter()

# s: chuỗi ngắn · t: đoạn văn · l: danh sách đoạn · n: số · b: có/không
TRUONG: dict[str, dict[str, str]] = {
    "nhan-vat": {"name": "s", "period": "s", "role": "s", "desc": "t", "bioParagraphs": "l",
                 "sourceBook": "s", "sourcePage": "s", "moi": "b"},
    "trieu-dai": {"name": "s", "period": "s", "desc": "t", "sourceBook": "s", "sourceCaution": "t"},
    "su-kien": {"name": "s", "desc": "t", "year": "n", "ten": "s", "nam": "n", "doan": "l", "src": "s", "bieu_tuong": "s"},
    "hcm": {"title": "s", "date": "s", "detail": "t"},
    "bai-sgk": {"ten": "s", "chuong": "s", "tom": "t", "nho": "l", "hoi": "l"},
}
TEN_LOAI = {"nhan-vat": "Nhân vật", "trieu-dai": "Triều đại", "su-kien": "Sự kiện", "hcm": "Mốc Hồ Chí Minh",
            "bai-sgk": "Bài SGK", "menu": "Thanh menu", "cai-dat": "Cài đặt"}
MUC_MENU = ("main", "hcm", "characters", "spaces", "exam", "school")
MA_RE = re.compile(r"^[A-Za-z0-9:._-]{1,80}$")


def init_noi_dung() -> None:
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS noi_dung (
            loai TEXT NOT NULL, ma TEXT NOT NULL, du_lieu TEXT NOT NULL,
            sua_boi TEXT, sua_luc TEXT NOT NULL, PRIMARY KEY (loai, ma));
        CREATE TABLE IF NOT EXISTS noi_dung_lich_su (
            id INTEGER PRIMARY KEY AUTOINCREMENT, loai TEXT NOT NULL, ma TEXT NOT NULL,
            du_lieu TEXT, hanh_dong TEXT NOT NULL, sua_boi TEXT, sua_luc TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS ndls_ma ON noi_dung_lich_su(loai, ma);
        """)


def _chuan(loai: str, du_lieu: dict, ma: str = "") -> dict:
    if loai == "cai-dat" and ma == "trang-chu":
        # Câu trích dẫn ở cột trái và khung "Học Lịch Sử trên điện thoại" (+ hướng dẫn cài đặt).
        ra = {"quote_bat": bool(du_lieu.get("quote_bat", True)), "app_bat": bool(du_lieu.get("app_bat", True))}
        for k, toi_da in (("quote", 500), ("app_tieu_de", 80), ("app_mo_ta", 200), ("app_huong_dan", 3000)):
            v = str(du_lieu.get(k) or "").strip()
            if "<" in v or ">" in v or len(v) > toi_da:
                raise HTTPException(422, f"“{k}” không hợp lệ (tối đa {toi_da} ký tự, không dùng < >).")
            if v:
                ra[k] = v
        return ra
    if loai == "cai-dat" and ma != "tro-ly":
        raise HTTPException(404, "Không có mục cài đặt này.")
    if loai == "cai-dat":
        # Trợ lý Học Lịch Sử: bật/tắt, tên nút, biểu tượng, lời chào.
        ra = {"bat": bool(du_lieu.get("bat", True))}
        for k, toi_da in (("ten", 40), ("loi_chao", 400)):
            v = str(du_lieu.get(k) or "").strip()
            if "<" in v or ">" in v or len(v) > toi_da:
                raise HTTPException(422, f"“{k}” không hợp lệ.")
            if v:
                ra[k] = v
        bt = str(du_lieu.get("bieu_tuong") or "").strip()
        if bt:
            if not (bt.startswith("/static/") or bt.startswith("https://")) or '"' in bt or "'" in bt or ")" in bt:
                raise HTTPException(422, "Biểu tượng phải là ảnh trong thư viện (/static/…) hoặc https://…")
            ra["bieu_tuong"] = bt[:500]
        return ra
    if loai == "menu":
        muc = du_lieu.get("muc")
        if not isinstance(muc, list) or len(muc) > len(MUC_MENU):
            raise HTTPException(422, "Menu không hợp lệ.")
        ra, da = [], set()
        for m in muc:
            if not isinstance(m, dict) or m.get("id") not in MUC_MENU or m["id"] in da:
                raise HTTPException(422, "Mục menu không hợp lệ.")
            da.add(m["id"])
            nhan = str(m.get("nhan") or "").strip()
            if len(nhan) > 60:
                raise HTTPException(422, "Tên mục menu tối đa 60 ký tự.")
            ra.append({"id": m["id"], "nhan": nhan, "an": bool(m.get("an"))})
        return {"muc": ra}
    mau = TRUONG.get(loai)
    if not mau:
        raise HTTPException(404, "Loại nội dung không có.")
    ra = {}
    for k, v in du_lieu.items():
        kieu = mau.get(k)
        if not kieu:
            raise HTTPException(422, f"Trường không được sửa: {k}")
        if kieu in ("s", "t"):
            v = str(v if v is not None else "").strip()
            if len(v) > (300 if kieu == "s" else 8000):
                raise HTTPException(422, f"“{k}” quá dài.")
            if "<" in v or ">" in v:
                raise HTTPException(422, "Không dùng ký tự < > trong nội dung.")
        elif kieu == "l":
            if isinstance(v, str):
                v = [x.strip() for x in re.split(r"\n\s*\n|\n", v) if x.strip()]
            if not isinstance(v, list) or len(v) > 60 or any(not isinstance(x, str) or len(x) > 4000 for x in v):
                raise HTTPException(422, f"“{k}” không hợp lệ.")
            v = [x.strip() for x in v if x.strip()]
            if any("<" in x or ">" in x for x in v):
                raise HTTPException(422, "Không dùng ký tự < > trong nội dung.")
        elif kieu == "n":
            try:
                v = int(v)
            except (TypeError, ValueError):
                raise HTTPException(422, f"“{k}” phải là số năm.")
        elif kieu == "b":
            v = bool(v)
        ra[k] = v
    if loai == "nhan-vat" and ra.get("moi") and not ra.get("name"):
        raise HTTPException(422, "Nhân vật mới cần có tên.")
    return ra


class NoiDungIn(BaseModel):
    du_lieu: dict


def _kiem(loai: str, ma: str) -> None:
    if loai not in TEN_LOAI or not MA_RE.match(ma):
        raise HTTPException(404, "Không có mục này.")


@router.get("/api/v6/noi-dung")
def tat_ca_ban_va():
    """Công khai: các bản vá đang áp dụng cho trang chính."""
    with db() as con:
        rows = con.execute("SELECT loai, ma, du_lieu, sua_luc FROM noi_dung").fetchall()
    ra: dict = {}
    moi_nhat = ""
    for r in rows:
        ra.setdefault(r["loai"], {})[r["ma"]] = json.loads(r["du_lieu"])
        moi_nhat = max(moi_nhat, r["sua_luc"])
    return JSONResponse({"cap_nhat": moi_nhat, "noi_dung": ra}, headers={"Cache-Control": "no-cache"})


@router.get("/api/v6/noi-dung/{loai}/{ma}/lich-su")
def lich_su(loai: str, ma: str, request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    _kiem(loai, ma)
    with db() as con:
        rows = con.execute("""SELECT id, du_lieu, hanh_dong, sua_boi, sua_luc FROM noi_dung_lich_su
                              WHERE loai=? AND ma=? ORDER BY id DESC LIMIT 50""", (loai, ma)).fetchall()
    return JSONResponse([{**dict(r), "du_lieu": json.loads(r["du_lieu"]) if r["du_lieu"] else None} for r in rows],
                        headers={"Cache-Control": "no-store"})


@router.put("/api/v6/noi-dung/{loai}/{ma}")
def luu(loai: str, ma: str, item: NoiDungIn, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    _kiem(loai, ma)
    du_lieu = _chuan(loai, item.du_lieu, ma)
    s = json.dumps(du_lieu, ensure_ascii=False)
    if len(s) > 120_000:
        raise HTTPException(413, "Nội dung quá lớn.")
    with db() as con:
        if not du_lieu:
            con.execute("DELETE FROM noi_dung WHERE loai=? AND ma=?", (loai, ma))
            hd = "khoi-phuc"
        else:
            con.execute("""INSERT INTO noi_dung (loai, ma, du_lieu, sua_boi, sua_luc) VALUES (?,?,?,?,?)
                           ON CONFLICT(loai, ma) DO UPDATE SET du_lieu=excluded.du_lieu, sua_boi=excluded.sua_boi,
                           sua_luc=excluded.sua_luc""", (loai, ma, s, tk["ten"], now()))
            hd = "sua"
        con.execute("INSERT INTO noi_dung_lich_su (loai, ma, du_lieu, hanh_dong, sua_boi, sua_luc) VALUES (?,?,?,?,?,?)",
                    (loai, ma, s if du_lieu else None, hd, tk["ten"], now()))
        ghi_nhat_ky(con, tk, "sua-noi-dung" if du_lieu else "khoi-phuc-noi-dung", f"{TEN_LOAI[loai]} · {ma}", request)
    return {"ok": True, "du_lieu": du_lieu}


@router.delete("/api/v6/noi-dung/{loai}/{ma}")
def khoi_phuc(loai: str, ma: str, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    _kiem(loai, ma)
    with db() as con:
        con.execute("DELETE FROM noi_dung WHERE loai=? AND ma=?", (loai, ma))
        con.execute("INSERT INTO noi_dung_lich_su (loai, ma, du_lieu, hanh_dong, sua_boi, sua_luc) VALUES (?,?,?,?,?,?)",
                    (loai, ma, None, "khoi-phuc", tk["ten"], now()))
        ghi_nhat_ky(con, tk, "khoi-phuc-noi-dung", f"{TEN_LOAI[loai]} · {ma}", request)
    return {"ok": True}


@router.get("/api/v6/thong-ke")
def thong_ke(request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        dem = {r["loai"]: r["n"] for r in con.execute("SELECT loai, COUNT(*) n FROM noi_dung GROUP BY loai")}
        gan_day = [dict(r) for r in con.execute(
            "SELECT loai, ma, hanh_dong, sua_boi, sua_luc FROM noi_dung_lich_su ORDER BY id DESC LIMIT 15")]
        so_tk = con.execute("SELECT COUNT(*) FROM tai_khoan").fetchone()[0]
    return JSONResponse({"da_sua": dem, "gan_day": gan_day, "so_tai_khoan": so_tk, "ten_loai": TEN_LOAI},
                        headers={"Cache-Control": "no-store"})
