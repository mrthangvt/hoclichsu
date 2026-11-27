"""Học Lịch Sử V6 — bài viết (trình biên tập kiểu WordPress), chuyên mục, thẻ, SEO, trang công khai.

Trạng thái: nhap (bản nháp) · xuat-ban · thung-rac. (Đợt 2: cho-duyet cho bài thành viên gửi.)
Trang công khai: /bai-viet/ (mới nhất), /bai-viet/chuyen-muc/<đường dẫn>, /bai-viet/<đường dẫn>.
Bài cũ (bảng articles, V3–V5) vẫn hiện ở /bai-viet/<slug> nếu không trùng.
"""
from __future__ import annotations

import html
import json
import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel, Field

from vs_core import SITE_URL, db, now, slugify
from vs_lamsach import chu_tron, lam_sach
from vs_render import page_shell
from vs_taikhoan import VAI_TRO_SUA, can_vai_tro, ghi_nhat_ky, tai_khoan_hien_tai

router = APIRouter()
TRANG_THAI = ("nhap", "xuat-ban", "thung-rac")
DUONG_DAN_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
esc = lambda s: html.escape(str(s or ""), quote=True)


def init_bai_viet() -> None:
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS chuyen_muc (
            id INTEGER PRIMARY KEY AUTOINCREMENT, ten TEXT NOT NULL, duong_dan TEXT NOT NULL UNIQUE,
            mo_ta TEXT DEFAULT '', cha_id INTEGER REFERENCES chuyen_muc(id) ON DELETE SET NULL);
        CREATE TABLE IF NOT EXISTS bai_viet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tieu_de TEXT NOT NULL, duong_dan TEXT NOT NULL UNIQUE,
            noi_dung TEXT NOT NULL DEFAULT '', tom_tat TEXT DEFAULT '',
            trang_thai TEXT NOT NULL DEFAULT 'nhap',
            anh_dai_dien TEXT DEFAULT '', the TEXT DEFAULT '[]',
            seo_tieu_de TEXT DEFAULT '', seo_mo_ta TEXT DEFAULT '', tu_khoa TEXT DEFAULT '', anh_mxh TEXT DEFAULT '',
            cho_index INTEGER NOT NULL DEFAULT 1,
            tac_gia_id INTEGER, tac_gia TEXT DEFAULT '',
            tao_luc TEXT NOT NULL, sua_luc TEXT NOT NULL, xuat_ban_luc TEXT DEFAULT '');
        CREATE INDEX IF NOT EXISTS bv_tt ON bai_viet(trang_thai, xuat_ban_luc);
        CREATE TABLE IF NOT EXISTS bai_viet_cm (
            bai_id INTEGER NOT NULL REFERENCES bai_viet(id) ON DELETE CASCADE,
            cm_id INTEGER NOT NULL REFERENCES chuyen_muc(id) ON DELETE CASCADE, PRIMARY KEY (bai_id, cm_id));
        CREATE TABLE IF NOT EXISTS bai_viet_ban (
            id INTEGER PRIMARY KEY AUTOINCREMENT, bai_id INTEGER NOT NULL REFERENCES bai_viet(id) ON DELETE CASCADE,
            du_lieu TEXT NOT NULL, sua_boi TEXT, luc TEXT NOT NULL);
        """)
        if not con.execute("SELECT 1 FROM chuyen_muc LIMIT 1").fetchone():
            for ten, dd in (("Tin tức", "tin-tuc"), ("Nhân vật", "nhan-vat"), ("Sự kiện", "su-kien"),
                            ("Di tích – Di sản", "di-tich-di-san"), ("Học Sử", "hoc-su")):
                con.execute("INSERT INTO chuyen_muc (ten, duong_dan) VALUES (?,?)", (ten, dd))


# ------------------------------------------------------------------ tiện ích
def _dd(t: str) -> str:
    s = slugify(t or "")[:90].strip("-")
    return s or "bai-viet"


def _dd_duy_nhat(con, dd: str, bo_id: int | None = None) -> str:
    goc, i = dd, 2
    while True:
        r = con.execute("SELECT id FROM bai_viet WHERE duong_dan=?", (dd,)).fetchone()
        if not r or r["id"] == bo_id:
            return dd
        dd = f"{goc}-{i}"
        i += 1


def _url_anh(u: str) -> str:
    u = (u or "").strip()
    if not u:
        return ""
    if u.startswith("https://") or (u.startswith("/") and not u.startswith("//")):
        return u[:500]
    raise HTTPException(422, "Ảnh phải là đường dẫn /static/… hoặc https://…")


def _ra_dict(con, r) -> dict:
    d = dict(r)
    d["the"] = json.loads(d.get("the") or "[]")
    d["chuyen_muc"] = [x["cm_id"] for x in con.execute("SELECT cm_id FROM bai_viet_cm WHERE bai_id=?", (r["id"],))]
    return d


def _bai(con, bai_id: int):
    r = con.execute("SELECT * FROM bai_viet WHERE id=?", (bai_id,)).fetchone()
    if not r:
        raise HTTPException(404, "Không có bài viết này.")
    return r


# ------------------------------------------------------------------ API biên tập
class BaiVietIn(BaseModel):
    tieu_de: str = Field(min_length=1, max_length=250)
    duong_dan: str = Field(default="", max_length=120)
    noi_dung: str = Field(default="", max_length=600_000)
    tom_tat: str = Field(default="", max_length=1000)
    trang_thai: str = "nhap"
    anh_dai_dien: str = Field(default="", max_length=500)
    chuyen_muc: list[int] = Field(default_factory=list, max_length=20)
    the: list[str] = Field(default_factory=list, max_length=40)
    seo_tieu_de: str = Field(default="", max_length=200)
    seo_mo_ta: str = Field(default="", max_length=400)
    tu_khoa: str = Field(default="", max_length=120)
    anh_mxh: str = Field(default="", max_length=500)
    cho_index: bool = True
    xuat_ban_luc: str = Field(default="", max_length=40)


def _chuan_bai(item: BaiVietIn) -> dict:
    if item.trang_thai not in TRANG_THAI:
        raise HTTPException(422, "Trạng thái không hợp lệ.")
    dd = (item.duong_dan or "").strip().lower()
    dd = _dd(dd) if dd else _dd(item.tieu_de)
    if not DUONG_DAN_RE.match(dd):
        raise HTTPException(422, "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.")
    xbl = item.xuat_ban_luc.strip()
    if xbl:
        try:
            xbl = datetime.fromisoformat(xbl.replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
        except ValueError:
            raise HTTPException(422, "Ngày xuất bản không hợp lệ.")
    the = []
    for t in item.the:
        t = re.sub(r"\s+", " ", str(t)).strip()[:60]
        if t and t.lower() not in [x.lower() for x in the]:
            the.append(t)
    for f in (item.tieu_de, item.tom_tat, item.seo_tieu_de, item.seo_mo_ta, item.tu_khoa):
        if "<" in f or ">" in f:
            raise HTTPException(422, "Tiêu đề, tóm tắt và phần SEO không dùng ký tự < >.")
    return {"tieu_de": item.tieu_de.strip(), "duong_dan": dd, "noi_dung": lam_sach(item.noi_dung),
            "tom_tat": item.tom_tat.strip(), "trang_thai": item.trang_thai, "anh_dai_dien": _url_anh(item.anh_dai_dien),
            "the": json.dumps(the, ensure_ascii=False), "seo_tieu_de": item.seo_tieu_de.strip(),
            "seo_mo_ta": item.seo_mo_ta.strip(), "tu_khoa": item.tu_khoa.strip(), "anh_mxh": _url_anh(item.anh_mxh),
            "cho_index": 1 if item.cho_index else 0, "xuat_ban_luc": xbl}


def _luu_cm(con, bai_id: int, ds: list[int]) -> None:
    con.execute("DELETE FROM bai_viet_cm WHERE bai_id=?", (bai_id,))
    for cm in dict.fromkeys(ds):
        if con.execute("SELECT 1 FROM chuyen_muc WHERE id=?", (cm,)).fetchone():
            con.execute("INSERT INTO bai_viet_cm VALUES (?,?)", (bai_id, cm))


def _ban_sua(con, bai_id: int, ai: str) -> None:
    r = con.execute("SELECT * FROM bai_viet WHERE id=?", (bai_id,)).fetchone()
    con.execute("INSERT INTO bai_viet_ban (bai_id, du_lieu, sua_boi, luc) VALUES (?,?,?,?)",
                (bai_id, json.dumps(_ra_dict(con, r), ensure_ascii=False), ai, now()))
    con.execute("""DELETE FROM bai_viet_ban WHERE bai_id=? AND id NOT IN
                   (SELECT id FROM bai_viet_ban WHERE bai_id=? ORDER BY id DESC LIMIT 30)""", (bai_id, bai_id))


@router.get("/api/v6/bai-viet")
def ds_bai(request: Request, trang_thai: str = "", q: str = "", chuyen_muc: int = 0, trang: int = 0):
    can_vai_tro(request, *VAI_TRO_SUA)
    dk, ts = ["1=1"], []
    if trang_thai in TRANG_THAI:
        dk.append("b.trang_thai=?"); ts.append(trang_thai)
    else:
        dk.append("b.trang_thai<>'thung-rac'")
    if q.strip():
        dk.append("(b.tieu_de LIKE ? OR b.the LIKE ?)"); ts += [f"%{q.strip()}%"] * 2
    if chuyen_muc:
        dk.append("EXISTS (SELECT 1 FROM bai_viet_cm c WHERE c.bai_id=b.id AND c.cm_id=?)"); ts.append(chuyen_muc)
    w = " AND ".join(dk)
    with db() as con:
        tong = con.execute(f"SELECT COUNT(*) FROM bai_viet b WHERE {w}", ts).fetchone()[0]
        rows = con.execute(f"""SELECT b.id, b.tieu_de, b.duong_dan, b.trang_thai, b.tac_gia, b.sua_luc, b.xuat_ban_luc,
                               b.anh_dai_dien, b.tu_khoa FROM bai_viet b WHERE {w} ORDER BY b.sua_luc DESC LIMIT 30 OFFSET ?""",
                           ts + [max(0, trang) * 30]).fetchall()
        dem = {r["trang_thai"]: r["n"] for r in con.execute("SELECT trang_thai, COUNT(*) n FROM bai_viet GROUP BY trang_thai")}
        cm = {}
        for r in con.execute("SELECT c.bai_id, m.ten FROM bai_viet_cm c JOIN chuyen_muc m ON m.id=c.cm_id"):
            cm.setdefault(r["bai_id"], []).append(r["ten"])
    return JSONResponse({"tong": tong, "dem": dem, "bai": [{**dict(r), "chuyen_muc": cm.get(r["id"], [])} for r in rows]},
                        headers={"Cache-Control": "no-store"})


@router.get("/api/v6/bai-viet/{bai_id}")
def mot_bai(bai_id: int, request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        return JSONResponse(_ra_dict(con, _bai(con, bai_id)), headers={"Cache-Control": "no-store"})


@router.post("/api/v6/bai-viet")
def tao_bai(item: BaiVietIn, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    d = _chuan_bai(item)
    with db() as con:
        d["duong_dan"] = _dd_duy_nhat(con, d["duong_dan"])
        if d["trang_thai"] == "xuat-ban" and not d["xuat_ban_luc"]:
            d["xuat_ban_luc"] = now()
        cot = list(d) + ["tac_gia_id", "tac_gia", "tao_luc", "sua_luc"]
        gt = list(d.values()) + [tk["id"], tk["ten"], now(), now()]
        cur = con.execute(f"INSERT INTO bai_viet ({','.join(cot)}) VALUES ({','.join('?' * len(cot))})", gt)
        _luu_cm(con, cur.lastrowid, item.chuyen_muc)
        _ban_sua(con, cur.lastrowid, tk["ten"])
        ghi_nhat_ky(con, tk, "tao-bai", d["tieu_de"], request)
        return _ra_dict(con, _bai(con, cur.lastrowid))


@router.put("/api/v6/bai-viet/{bai_id}")
def sua_bai(bai_id: int, item: BaiVietIn, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    d = _chuan_bai(item)
    with db() as con:
        cu = _bai(con, bai_id)
        d["duong_dan"] = _dd_duy_nhat(con, d["duong_dan"], bai_id)
        if d["trang_thai"] == "xuat-ban" and not d["xuat_ban_luc"]:
            d["xuat_ban_luc"] = cu["xuat_ban_luc"] or now()
        con.execute(f"UPDATE bai_viet SET {', '.join(k + '=?' for k in d)}, sua_luc=? WHERE id=?",
                    list(d.values()) + [now(), bai_id])
        _luu_cm(con, bai_id, item.chuyen_muc)
        _ban_sua(con, bai_id, tk["ten"])
        ghi_nhat_ky(con, tk, "sua-bai", d["tieu_de"] + (" (xuất bản)" if d["trang_thai"] == "xuat-ban" and cu["trang_thai"] != "xuat-ban" else ""), request)
        return _ra_dict(con, _bai(con, bai_id))


@router.delete("/api/v6/bai-viet/{bai_id}")
def xoa_bai(bai_id: int, request: Request):
    """Lần 1: chuyển vào thùng rác. Bài đã ở thùng rác: xóa hẳn."""
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        r = _bai(con, bai_id)
        if r["trang_thai"] == "thung-rac":
            con.execute("DELETE FROM bai_viet WHERE id=?", (bai_id,))
            ghi_nhat_ky(con, tk, "xoa-han-bai", r["tieu_de"], request)
            return {"ok": True, "xoa_han": True}
        con.execute("UPDATE bai_viet SET trang_thai='thung-rac', sua_luc=? WHERE id=?", (now(), bai_id))
        ghi_nhat_ky(con, tk, "bo-vao-thung-rac", r["tieu_de"], request)
    return {"ok": True, "xoa_han": False}


@router.get("/api/v6/bai-viet/{bai_id}/ban-sua")
def ban_sua(bai_id: int, request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        rows = con.execute("SELECT id, du_lieu, sua_boi, luc FROM bai_viet_ban WHERE bai_id=? ORDER BY id DESC", (bai_id,)).fetchall()
    return JSONResponse([{"id": r["id"], "sua_boi": r["sua_boi"], "luc": r["luc"], "du_lieu": json.loads(r["du_lieu"])} for r in rows],
                        headers={"Cache-Control": "no-store"})


# --- chuyên mục
class ChuyenMucIn(BaseModel):
    ten: str = Field(min_length=1, max_length=80)
    duong_dan: str = Field(default="", max_length=80)
    mo_ta: str = Field(default="", max_length=500)
    cha_id: int | None = None


@router.get("/api/v6/chuyen-muc")
def ds_cm():
    with db() as con:
        rows = con.execute("""SELECT m.*, (SELECT COUNT(*) FROM bai_viet_cm c JOIN bai_viet b ON b.id=c.bai_id
                              WHERE c.cm_id=m.id AND b.trang_thai='xuat-ban') so_bai FROM chuyen_muc m ORDER BY m.ten""").fetchall()
    return [dict(r) for r in rows]


@router.post("/api/v6/chuyen-muc")
def tao_cm(item: ChuyenMucIn, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    dd = _dd(item.duong_dan or item.ten)
    if "<" in item.ten + item.mo_ta or ">" in item.ten + item.mo_ta:
        raise HTTPException(422, "Không dùng ký tự < >.")
    with db() as con:
        if con.execute("SELECT 1 FROM chuyen_muc WHERE duong_dan=?", (dd,)).fetchone():
            raise HTTPException(409, "Đã có chuyên mục với đường dẫn này.")
        cur = con.execute("INSERT INTO chuyen_muc (ten, duong_dan, mo_ta, cha_id) VALUES (?,?,?,?)",
                          (item.ten.strip(), dd, item.mo_ta.strip(), item.cha_id))
        ghi_nhat_ky(con, tk, "tao-chuyen-muc", item.ten, request)
    return {"id": cur.lastrowid, "ten": item.ten.strip(), "duong_dan": dd}


@router.put("/api/v6/chuyen-muc/{cm_id}")
def sua_cm(cm_id: int, item: ChuyenMucIn, request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    if "<" in item.ten + item.mo_ta or ">" in item.ten + item.mo_ta:
        raise HTTPException(422, "Không dùng ký tự < >.")
    dd = _dd(item.duong_dan or item.ten)
    with db() as con:
        r = con.execute("SELECT id FROM chuyen_muc WHERE duong_dan=?", (dd,)).fetchone()
        if r and r["id"] != cm_id:
            raise HTTPException(409, "Đã có chuyên mục với đường dẫn này.")
        if item.cha_id == cm_id:
            raise HTTPException(422, "Chuyên mục cha không hợp lệ.")
        con.execute("UPDATE chuyen_muc SET ten=?, duong_dan=?, mo_ta=?, cha_id=? WHERE id=?",
                    (item.ten.strip(), dd, item.mo_ta.strip(), item.cha_id, cm_id))
    return {"ok": True}


@router.delete("/api/v6/chuyen-muc/{cm_id}")
def xoa_cm(cm_id: int, request: Request):
    tk = can_vai_tro(request, *VAI_TRO_SUA)
    with db() as con:
        con.execute("DELETE FROM chuyen_muc WHERE id=?", (cm_id,))
        ghi_nhat_ky(con, tk, "xoa-chuyen-muc", str(cm_id), request)
    return {"ok": True}


@router.get("/api/v6/the")
def ds_the(request: Request):
    can_vai_tro(request, *VAI_TRO_SUA)
    dem: dict[str, int] = {}
    with db() as con:
        for r in con.execute("SELECT the FROM bai_viet WHERE trang_thai<>'thung-rac'"):
            for t in json.loads(r["the"] or "[]"):
                dem[t] = dem.get(t, 0) + 1
    return sorted(dem.items(), key=lambda x: -x[1])[:60]


# ------------------------------------------------------------------ trang công khai
BAI_CSS = """
article img{max-width:100%;height:auto;border-radius:8px}article figure{margin:1.4em 0;text-align:center}
article figcaption{font-size:.85em;color:#7b746a;margin-top:.4em}article table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.95em}
article td,article th{border:1px solid #e1d8c6;padding:.5em .7em;text-align:left}article th{background:#f7f1e4}
article blockquote{border-left:4px solid #c9a35a;margin:1.2em 0;padding:.3em 1em;color:#4a443c;background:#faf6ee}
.bv-anh{width:100%;border-radius:12px;margin:.6em 0 1.2em;aspect-ratio:16/9;object-fit:cover}
.bv-the a,.bv-cm a{display:inline-block;margin:0 .35em .35em 0;padding:.15em .7em;border-radius:999px;background:#f2eadb;color:#5a4a2c;text-decoration:none;font-size:.85em}
.bv-ds{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));margin-top:1em}
.bv-o{display:block;text-decoration:none;color:inherit;border:1px solid #e9e1d1;border-radius:12px;overflow:hidden;background:#fff}
.bv-o img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#efe8da}.bv-o div{padding:12px 14px}
.bv-o h3{margin:0 0 6px;font-size:1.05em;line-height:1.35}.bv-o p{margin:0;color:#6b645a;font-size:.9em}
.bv-meta{color:#7b746a;font-size:.9em;margin:.2em 0 1em}
"""


def _ngay(s: str) -> str:
    try:
        return datetime.fromisoformat(s).astimezone().strftime("%d/%m/%Y")
    except (ValueError, TypeError):
        return ""


def _cong_khai_dk() -> str:
    return "b.trang_thai='xuat-ban' AND (b.xuat_ban_luc='' OR b.xuat_ban_luc<=?)"


def _o_bai(r) -> str:
    anh = r["anh_dai_dien"] or "/static/og/hoc-lich-su.jpg"
    nho = anh.replace(".webp", "-480.webp") if anh.startswith("/static/uploads/thu-vien/") and not anh.endswith("-480.webp") else anh
    mt = r["tom_tat"] or chu_tron(r["noi_dung"])[:160]
    return (f'<a class="bv-o" href="/bai-viet/{esc(r["duong_dan"])}"><img src="{esc(nho)}" alt="" loading="lazy">'
            f'<div><h3>{esc(r["tieu_de"])}</h3><p>{esc(_ngay(r["xuat_ban_luc"]))} · {esc(mt[:140])}</p></div></a>')


def trang_danh_sach(cm_dd: str | None = None) -> HTMLResponse:
    with db() as con:
        cm = None
        if cm_dd:
            cm = con.execute("SELECT * FROM chuyen_muc WHERE duong_dan=?", (cm_dd[:80],)).fetchone()
            if not cm:
                raise HTTPException(404, "Không có chuyên mục này.")
        sql = f"SELECT b.* FROM bai_viet b WHERE {_cong_khai_dk()}"
        ts = [now()]
        if cm:
            sql += " AND EXISTS (SELECT 1 FROM bai_viet_cm c WHERE c.bai_id=b.id AND c.cm_id=?)"
            ts.append(cm["id"])
        rows = con.execute(sql + " ORDER BY b.xuat_ban_luc DESC LIMIT 60", ts).fetchall()
        cms = con.execute("SELECT ten, duong_dan FROM chuyen_muc ORDER BY ten").fetchall()
    tieu = cm["ten"] if cm else "Bài viết"
    url = SITE_URL + ("/bai-viet/chuyen-muc/" + cm["duong_dan"] if cm else "/bai-viet/")
    body = (f'<style>{BAI_CSS}</style><div class="crumb"><a href="/">Học Lịch Sử</a> / <a href="/bai-viet/">Bài viết</a>'
            + (f' / {esc(cm["ten"])}' if cm else "") + f'</div><h1>{esc(tieu)}</h1>'
            + (f'<p class="lede">{esc(cm["mo_ta"])}</p>' if cm and cm["mo_ta"] else "")
            + '<div class="bv-cm">' + "".join(f'<a href="/bai-viet/chuyen-muc/{esc(c["duong_dan"])}">{esc(c["ten"])}</a>' for c in cms) + "</div>"
            + ('<div class="bv-ds">' + "".join(_o_bai(r) for r in rows) + "</div>" if rows else "<p>Chưa có bài viết.</p>")
            + '<p class="back"><a href="/">← Trở về Học Lịch Sử</a></p>')
    return HTMLResponse(page_shell(title=f"{tieu} – Học Lịch Sử", description=(cm["mo_ta"] if cm and cm["mo_ta"] else f"{tieu} trên Học Lịch Sử."),
                                   canonical=url, body=body, og_type="website", image="/static/og/hoc-lich-su.jpg"),
                        headers={"Cache-Control": "public, max-age=120"})


def trang_bai(r, xem_truoc: bool = False) -> HTMLResponse:
    with db() as con:
        cms = con.execute("SELECT m.ten, m.duong_dan FROM bai_viet_cm c JOIN chuyen_muc m ON m.id=c.cm_id WHERE c.bai_id=?", (r["id"],)).fetchall()
        lq = []
        if cms:
            lq = con.execute(f"""SELECT DISTINCT b.* FROM bai_viet b JOIN bai_viet_cm c ON c.bai_id=b.id
                                 WHERE {_cong_khai_dk()} AND b.id<>? AND c.cm_id IN (SELECT cm_id FROM bai_viet_cm WHERE bai_id=?)
                                 ORDER BY b.xuat_ban_luc DESC LIMIT 3""", (now(), r["id"], r["id"])).fetchall()
    the = json.loads(r["the"] or "[]")
    url = SITE_URL + "/bai-viet/" + r["duong_dan"]
    mo_ta = r["seo_mo_ta"] or r["tom_tat"] or chu_tron(r["noi_dung"])[:160]
    anh = r["anh_mxh"] or r["anh_dai_dien"] or "/static/og/hoc-lich-su.jpg"
    schema = {"@context": "https://schema.org", "@type": "Article", "headline": r["tieu_de"], "description": mo_ta,
              "datePublished": r["xuat_ban_luc"], "dateModified": r["sua_luc"], "inLanguage": "vi",
              "author": {"@type": "Person", "name": r["tac_gia"] or "Học Lịch Sử"}, "mainEntityOfPage": url,
              "image": anh if anh.startswith("https://") else SITE_URL + anh,
              "publisher": {"@type": "Organization", "name": "Học Lịch Sử", "logo": {"@type": "ImageObject", "url": SITE_URL + "/static/favicon/icon-512.png"}}}
    body = (f'<style>{BAI_CSS}</style>'
            + ('<p style="background:#fff3cd;padding:.6em 1em;border-radius:8px">Bản xem trước — chưa công khai.</p>' if xem_truoc else "")
            + '<div class="crumb"><a href="/">Học Lịch Sử</a> / <a href="/bai-viet/">Bài viết</a>'
            + (f' / <a href="/bai-viet/chuyen-muc/{esc(cms[0]["duong_dan"])}">{esc(cms[0]["ten"])}</a>' if cms else "") + "</div>"
            + f'<h1>{esc(r["tieu_de"])}</h1><div class="bv-meta">{esc(_ngay(r["xuat_ban_luc"]) or _ngay(r["sua_luc"]))}'
            + (f' · {esc(r["tac_gia"])}' if r["tac_gia"] else "") + "</div>"
            + (f'<img class="bv-anh" src="{esc(r["anh_dai_dien"])}" alt="{esc(r["tieu_de"])}">' if r["anh_dai_dien"] else "")
            + (f'<p class="lede">{esc(r["tom_tat"])}</p>' if r["tom_tat"] else "")
            + f'<article>{lam_sach(r["noi_dung"])}</article>'
            + ('<div class="bv-the">' + "".join(f"<a>#{esc(t)}</a>" for t in the) + "</div>" if the else "")
            + ('<h2>Bài liên quan</h2><div class="bv-ds">' + "".join(_o_bai(x) for x in lq) + "</div>" if lq else "")
            + '<p class="back"><a href="/bai-viet/">← Tất cả bài viết</a></p>')
    return HTMLResponse(page_shell(title=r["seo_tieu_de"] or f'{r["tieu_de"]} – Học Lịch Sử', description=mo_ta, canonical=url,
                                   body=body, schema=schema, image=anh, indexable=bool(r["cho_index"]) and not xem_truoc),
                        headers={"Cache-Control": "no-store" if xem_truoc else "public, max-age=120"})


@router.get("/bai-viet/", response_class=HTMLResponse)
def bai_viet_index():
    return trang_danh_sach()


@router.get("/bai-viet/chuyen-muc/{dd}", response_class=HTMLResponse)
def bai_viet_cm(dd: str):
    return trang_danh_sach(dd)


@router.get("/bai-viet/xem-truoc/{bai_id}", response_class=HTMLResponse)
def xem_truoc(bai_id: int, request: Request):
    tk = tai_khoan_hien_tai(request)
    if not tk or tk["vai_tro"] not in VAI_TRO_SUA:
        raise HTTPException(401, "Cần đăng nhập để xem trước.")
    with db() as con:
        r = _bai(con, bai_id)
    return trang_bai(r, xem_truoc=True)


def tim_bai_cong_khai(dd: str):
    with db() as con:
        return con.execute(f"SELECT b.* FROM bai_viet b WHERE b.duong_dan=? AND {_cong_khai_dk()}", (dd[:120], now())).fetchone()


@router.get("/api/v6/bai-viet-moi")
def bai_moi(so: int = 6):
    """Công khai: bài mới nhất (cho trang chính)."""
    with db() as con:
        rows = con.execute(f"SELECT b.tieu_de, b.duong_dan, b.anh_dai_dien, b.tom_tat, b.xuat_ban_luc FROM bai_viet b WHERE {_cong_khai_dk()} ORDER BY b.xuat_ban_luc DESC LIMIT ?",
                           (now(), max(1, min(so, 20)))).fetchall()
    return [dict(r) for r in rows]
