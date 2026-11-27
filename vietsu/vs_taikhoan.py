"""Học Lịch Sử V6 — tài khoản, đăng nhập bằng phiên (cookie), phân quyền.

Vai trò:
  quan-tri  : toàn quyền, quản lý tài khoản
  bien-tap  : sửa nội dung, xuất bản
  thanh-vien: (đợt 2) gửi bài chờ duyệt
Tài khoản quản trị đầu tiên tạo bằng mã VIETSU_ADMIN_TOKEN (chứng minh là chủ máy chủ).
Mật khẩu băm bằng scrypt (thư viện chuẩn), phiên lưu dạng băm SHA-256 trong CSDL.
"""
from __future__ import annotations

import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import vs_core
from vs_core import ADMIN_TOKEN, SITE_URL, _token_ok, auth_fail_limiter, client_ip, db, now

router = APIRouter()
COOKIE = "hls_phien"
COOKIE_BT = "hls_bt"          # cờ không bí mật (JS đọc được) để trang chính biết có người biên tập đăng nhập
THOI_HAN_NGAY = 30
VAI_TRO = ("quan-tri", "bien-tap", "thanh-vien")
VAI_TRO_SUA = ("quan-tri", "bien-tap")
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,24}$")
SECURE = SITE_URL.startswith("https://")


def init_tai_khoan() -> None:
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS tai_khoan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            ten TEXT NOT NULL,
            mat_khau TEXT NOT NULL,
            vai_tro TEXT NOT NULL DEFAULT 'thanh-vien',
            trang_thai TEXT NOT NULL DEFAULT 'hoat-dong',
            tao_luc TEXT NOT NULL,
            dang_nhap_luc TEXT
        );
        CREATE TABLE IF NOT EXISTS phien (
            ma_bam TEXT PRIMARY KEY,
            tai_khoan_id INTEGER NOT NULL REFERENCES tai_khoan(id) ON DELETE CASCADE,
            tao_luc TEXT NOT NULL,
            het_han TEXT NOT NULL,
            ip TEXT,
            trinh_duyet TEXT
        );
        CREATE INDEX IF NOT EXISTS phien_tk ON phien(tai_khoan_id);
        CREATE TABLE IF NOT EXISTS nhat_ky (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tai_khoan_id INTEGER,
            ten TEXT,
            hanh_dong TEXT NOT NULL,
            chi_tiet TEXT,
            ip TEXT,
            luc TEXT NOT NULL
        );
        """)


# ------------------------------------------------------------ mật khẩu & phiên
def bam_mat_khau(mk: str) -> str:
    muoi = secrets.token_bytes(16)
    h = hashlib.scrypt(mk.encode("utf-8"), salt=muoi, n=2 ** 14, r=8, p=1, dklen=32)
    return "scrypt$" + muoi.hex() + "$" + h.hex()


def dung_mat_khau(mk: str, luu: str) -> bool:
    try:
        _, muoi, h = luu.split("$")
        tinh = hashlib.scrypt(mk.encode("utf-8"), salt=bytes.fromhex(muoi), n=2 ** 14, r=8, p=1, dklen=32)
        return hmac.compare_digest(tinh.hex(), h)
    except (ValueError, TypeError):
        return False


def _bam_phien(t: str) -> str:
    return hashlib.sha256(t.encode()).hexdigest()


def kiem_mat_khau(mk: str) -> None:
    if len(mk) < 10:
        raise HTTPException(422, "Mật khẩu cần ít nhất 10 ký tự.")
    if len(mk) > 200:
        raise HTTPException(422, "Mật khẩu quá dài.")
    if mk.lower() == mk or not re.search(r"\d", mk):
        raise HTTPException(422, "Mật khẩu cần có chữ hoa, chữ thường và số.")


def ghi_nhat_ky(con, tk: dict | None, hanh_dong: str, chi_tiet: str = "", request: Request | None = None) -> None:
    con.execute("INSERT INTO nhat_ky (tai_khoan_id, ten, hanh_dong, chi_tiet, ip, luc) VALUES (?,?,?,?,?,?)",
                (tk and tk["id"], tk and tk["ten"], hanh_dong, chi_tiet[:500], client_ip(request) if request else "", now()))


def _dat_cookie(resp: Response, token: str, tk: dict) -> None:
    tuoi = THOI_HAN_NGAY * 86400
    resp.set_cookie(COOKIE, token, max_age=tuoi, httponly=True, secure=SECURE, samesite="lax", path="/")
    if tk["vai_tro"] in VAI_TRO_SUA:
        resp.set_cookie(COOKIE_BT, "1", max_age=tuoi, httponly=False, secure=SECURE, samesite="lax", path="/")


def _xoa_cookie(resp: Response) -> None:
    resp.delete_cookie(COOKIE, path="/")
    resp.delete_cookie(COOKIE_BT, path="/")


def tao_phien(con, tk: dict, request: Request) -> str:
    token = secrets.token_urlsafe(32)
    het = (datetime.now(timezone.utc) + timedelta(days=THOI_HAN_NGAY)).isoformat()
    con.execute("INSERT INTO phien VALUES (?,?,?,?,?,?)",
                (_bam_phien(token), tk["id"], now(), het, client_ip(request),
                 (request.headers.get("user-agent") or "")[:200]))
    con.execute("UPDATE tai_khoan SET dang_nhap_luc=? WHERE id=?", (now(), tk["id"]))
    con.execute("DELETE FROM phien WHERE het_han < ?", (datetime.now(timezone.utc).isoformat(),))
    return token


def tai_khoan_hien_tai(request: Request | None) -> dict | None:
    if request is None:
        return None
    token = request.cookies.get(COOKIE)
    if not token or len(token) > 100:
        return None
    with db() as con:
        r = con.execute("""SELECT t.id, t.email, t.ten, t.vai_tro, t.trang_thai, p.het_han FROM phien p
                           JOIN tai_khoan t ON t.id = p.tai_khoan_id WHERE p.ma_bam=?""", (_bam_phien(token),)).fetchone()
    if not r or r["trang_thai"] != "hoat-dong" or r["het_han"] < datetime.now(timezone.utc).isoformat():
        return None
    return {k: r[k] for k in ("id", "email", "ten", "vai_tro")}


def kiem_csrf(request: Request) -> None:
    """Thao tác ghi bằng cookie phải có header X-HLS (trình duyệt không tự gửi từ trang khác) và cùng nguồn."""
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return
    if request.headers.get("x-hls") != "1":
        raise HTTPException(403, "Thiếu xác nhận yêu cầu (X-HLS).")
    origin = request.headers.get("origin")
    if origin:
        host = (request.headers.get("host") or "").lower().split(":")[0]
        if origin.split("://", 1)[-1].lower().split("/")[0].split(":")[0] != host:
            raise HTTPException(403, "Yêu cầu từ nguồn khác bị chặn.")


def can_vai_tro(request: Request, *vai_tro: str) -> dict:
    tk = tai_khoan_hien_tai(request)
    if not tk:
        raise HTTPException(401, "Cần đăng nhập.")
    if vai_tro and tk["vai_tro"] not in vai_tro:
        raise HTTPException(403, "Tài khoản không đủ quyền.")
    kiem_csrf(request)
    return tk


def _vai_tro_cho_api_cu(request: Request | None) -> str | None:
    """Để các API cũ (dùng mã quản trị) cũng nhận người đã đăng nhập với vai trò quản trị/biên tập."""
    tk = tai_khoan_hien_tai(request)
    if tk and tk["vai_tro"] in VAI_TRO_SUA:
        kiem_csrf(request)
        return "admin"
    return None


vs_core.session_role_hook = _vai_tro_cho_api_cu


# ------------------------------------------------------------ API
class KhoiTaoIn(BaseModel):
    ma_quan_tri: str = Field(min_length=8, max_length=200)
    email: str = Field(max_length=254)
    ten: str = Field(min_length=2, max_length=80)
    mat_khau: str = Field(max_length=200)


class DangNhapIn(BaseModel):
    email: str = Field(max_length=254)
    mat_khau: str = Field(max_length=200)


class TaiKhoanIn(BaseModel):
    email: str = Field(max_length=254)
    ten: str = Field(min_length=2, max_length=80)
    vai_tro: str
    mat_khau: str = Field(max_length=200)


class SuaTaiKhoanIn(BaseModel):
    ten: str | None = Field(default=None, min_length=2, max_length=80)
    vai_tro: str | None = None
    trang_thai: str | None = None
    mat_khau: str | None = Field(default=None, max_length=200)


class DoiMatKhauIn(BaseModel):
    mat_khau_cu: str = Field(max_length=200)
    mat_khau_moi: str = Field(max_length=200)


def _so_tai_khoan() -> int:
    with db() as con:
        return con.execute("SELECT COUNT(*) FROM tai_khoan WHERE vai_tro='quan-tri'").fetchone()[0]


@router.get("/api/v6/toi")
def toi(request: Request):
    tk = tai_khoan_hien_tai(request)
    return JSONResponse({"tai_khoan": tk, "can_khoi_tao": _so_tai_khoan() == 0},
                        headers={"Cache-Control": "no-store"})


@router.post("/api/v6/khoi-tao")
def khoi_tao(item: KhoiTaoIn, request: Request):
    kiem_csrf(request)
    ip = client_ip(request)
    if auth_fail_limiter.count(ip) >= auth_fail_limiter.limit:
        raise HTTPException(429, "Nhập sai quá nhiều lần. Thử lại sau 15 phút.")
    if _so_tai_khoan() > 0:
        raise HTTPException(409, "Đã có tài khoản quản trị. Hãy đăng nhập.")
    if not _token_ok(item.ma_quan_tri.strip(), ADMIN_TOKEN):
        auth_fail_limiter.hit(ip)
        raise HTTPException(403, "Mã quản trị không đúng (xem dòng VIETSU_ADMIN_TOKEN trong file .env trên máy chủ).")
    email = item.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(422, "Email không hợp lệ.")
    kiem_mat_khau(item.mat_khau)
    with db() as con:
        cur = con.execute("INSERT INTO tai_khoan (email, ten, mat_khau, vai_tro, tao_luc) VALUES (?,?,?,?,?)",
                          (email, item.ten.strip(), bam_mat_khau(item.mat_khau), "quan-tri", now()))
        tk = {"id": cur.lastrowid, "email": email, "ten": item.ten.strip(), "vai_tro": "quan-tri"}
        token = tao_phien(con, tk, request)
        ghi_nhat_ky(con, tk, "khoi-tao", "Tạo tài khoản quản trị đầu tiên", request)
    resp = JSONResponse({"tai_khoan": tk})
    _dat_cookie(resp, token, tk)
    return resp


@router.post("/api/v6/dang-nhap")
def dang_nhap(item: DangNhapIn, request: Request):
    kiem_csrf(request)
    ip = client_ip(request)
    if auth_fail_limiter.count(ip) >= auth_fail_limiter.limit:
        raise HTTPException(429, "Đăng nhập sai quá nhiều lần. Thử lại sau 15 phút.")
    with db() as con:
        r = con.execute("SELECT * FROM tai_khoan WHERE email=?", (item.email.strip().lower(),)).fetchone()
        ok = bool(r) and dung_mat_khau(item.mat_khau, r["mat_khau"])
        if not ok:
            auth_fail_limiter.hit(ip)
            raise HTTPException(403, "Email hoặc mật khẩu không đúng.")
        if r["trang_thai"] != "hoat-dong":
            raise HTTPException(403, "Tài khoản đang bị khóa.")
        tk = {k: r[k] for k in ("id", "email", "ten", "vai_tro")}
        token = tao_phien(con, tk, request)
        ghi_nhat_ky(con, tk, "dang-nhap", "", request)
    resp = JSONResponse({"tai_khoan": tk})
    _dat_cookie(resp, token, tk)
    return resp


@router.post("/api/v6/dang-xuat")
def dang_xuat(request: Request):
    kiem_csrf(request)
    token = request.cookies.get(COOKIE)
    if token:
        with db() as con:
            con.execute("DELETE FROM phien WHERE ma_bam=?", (_bam_phien(token),))
    resp = JSONResponse({"ok": True})
    _xoa_cookie(resp)
    return resp


@router.post("/api/v6/doi-mat-khau")
def doi_mat_khau(item: DoiMatKhauIn, request: Request):
    tk = can_vai_tro(request)
    kiem_mat_khau(item.mat_khau_moi)
    with db() as con:
        r = con.execute("SELECT mat_khau FROM tai_khoan WHERE id=?", (tk["id"],)).fetchone()
        if not dung_mat_khau(item.mat_khau_cu, r["mat_khau"]):
            raise HTTPException(403, "Mật khẩu hiện tại không đúng.")
        con.execute("UPDATE tai_khoan SET mat_khau=? WHERE id=?", (bam_mat_khau(item.mat_khau_moi), tk["id"]))
        # Đăng xuất các thiết bị khác.
        con.execute("DELETE FROM phien WHERE tai_khoan_id=? AND ma_bam<>?", (tk["id"], _bam_phien(request.cookies.get(COOKIE, ""))))
        ghi_nhat_ky(con, tk, "doi-mat-khau", "", request)
    return {"ok": True}


@router.get("/api/v6/tai-khoan")
def ds_tai_khoan(request: Request):
    can_vai_tro(request, "quan-tri")
    with db() as con:
        rows = con.execute("SELECT id, email, ten, vai_tro, trang_thai, tao_luc, dang_nhap_luc FROM tai_khoan ORDER BY id").fetchall()
    return JSONResponse([dict(r) for r in rows], headers={"Cache-Control": "no-store"})


@router.post("/api/v6/tai-khoan")
def them_tai_khoan(item: TaiKhoanIn, request: Request):
    tk = can_vai_tro(request, "quan-tri")
    email = item.email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(422, "Email không hợp lệ.")
    if item.vai_tro not in VAI_TRO:
        raise HTTPException(422, "Vai trò không hợp lệ.")
    kiem_mat_khau(item.mat_khau)
    with db() as con:
        if con.execute("SELECT 1 FROM tai_khoan WHERE email=?", (email,)).fetchone():
            raise HTTPException(409, "Email này đã có tài khoản.")
        cur = con.execute("INSERT INTO tai_khoan (email, ten, mat_khau, vai_tro, tao_luc) VALUES (?,?,?,?,?)",
                          (email, item.ten.strip(), bam_mat_khau(item.mat_khau), item.vai_tro, now()))
        ghi_nhat_ky(con, tk, "them-tai-khoan", f"{email} ({item.vai_tro})", request)
    return {"id": cur.lastrowid}


@router.put("/api/v6/tai-khoan/{tk_id}")
def sua_tai_khoan(tk_id: int, item: SuaTaiKhoanIn, request: Request):
    tk = can_vai_tro(request, "quan-tri")
    with db() as con:
        r = con.execute("SELECT * FROM tai_khoan WHERE id=?", (tk_id,)).fetchone()
        if not r:
            raise HTTPException(404, "Không có tài khoản này.")
        doi = []
        if item.ten:
            con.execute("UPDATE tai_khoan SET ten=? WHERE id=?", (item.ten.strip(), tk_id)); doi.append("tên")
        if item.vai_tro:
            if item.vai_tro not in VAI_TRO:
                raise HTTPException(422, "Vai trò không hợp lệ.")
            if tk_id == tk["id"] and item.vai_tro != "quan-tri":
                raise HTTPException(422, "Không tự hạ quyền của chính mình.")
            con.execute("UPDATE tai_khoan SET vai_tro=? WHERE id=?", (item.vai_tro, tk_id)); doi.append("vai trò " + item.vai_tro)
        if item.trang_thai:
            if item.trang_thai not in ("hoat-dong", "khoa"):
                raise HTTPException(422, "Trạng thái không hợp lệ.")
            if tk_id == tk["id"] and item.trang_thai == "khoa":
                raise HTTPException(422, "Không tự khóa chính mình.")
            con.execute("UPDATE tai_khoan SET trang_thai=? WHERE id=?", (item.trang_thai, tk_id)); doi.append(item.trang_thai)
            if item.trang_thai == "khoa":
                con.execute("DELETE FROM phien WHERE tai_khoan_id=?", (tk_id,))
        if item.mat_khau:
            kiem_mat_khau(item.mat_khau)
            con.execute("UPDATE tai_khoan SET mat_khau=? WHERE id=?", (bam_mat_khau(item.mat_khau), tk_id))
            con.execute("DELETE FROM phien WHERE tai_khoan_id=?", (tk_id,)); doi.append("đặt lại mật khẩu")
        ghi_nhat_ky(con, tk, "sua-tai-khoan", f"{r['email']}: {', '.join(doi)}", request)
    return {"ok": True}


@router.get("/api/v6/nhat-ky")
def nhat_ky(request: Request, gioi_han: int = 100):
    can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        rows = con.execute("SELECT ten, hanh_dong, chi_tiet, luc FROM nhat_ky ORDER BY id DESC LIMIT ?",
                           (max(1, min(gioi_han, 500)),)).fetchall()
    return JSONResponse([dict(r) for r in rows], headers={"Cache-Control": "no-store"})
