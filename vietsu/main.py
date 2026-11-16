"""VIỆT SỬ V3.9 — backend FastAPI + SQLite.

Thay đổi chính so với V3.7:
  * Bảo mật: so sánh mã bằng hằng thời gian, chặn dò mã, giới hạn tần suất, header bảo mật (CSP, HSTS…),
    kiểm tra URL/độ dài mọi trường nhập, ghi file nguyên tử, tắt /docs mặc định, giới hạn kích thước request.
  * Hiệu năng: trang chủ phục vụ bản build tách ảnh (≈1 MB thay vì 7,3 MB), cache trong RAM, nén gzip,
    cache-control dài hạn cho ảnh/font/JS đã băm.
  * CMS "Sách giáo khoa lịch sử": xem vs_textbook.py.
  * Quảng cáo AdSense bật/tắt trong /admin: xem vs_ads.py.
"""
from __future__ import annotations

import html
import json
import os
import re
import sqlite3
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

import vs_ads
import vs_textbook
import avatar_v46
import dynasty_v47
from vs_core import (ALLOWED_HOSTS, BASE, DATA, ENABLE_DOCS, MAX_BODY_BYTES, SITE_URL, STATIC, UPLOADS, VERSION,
                     ai_limiter, api_limiter, clean_url_list, client_ip, db, decode_image_data, init_db_pragmas,
                     is_safe_url, now, read_json, require_role, site_is_public, slugify, write_json)
from vs_render import ad_slot_html, esc, markdown_safe, page_shell, plain_text

app = FastAPI(title="Việt Sử CMS", version=VERSION,
              docs_url="/docs" if ENABLE_DOCS else None, redoc_url=None,
              openapi_url="/openapi.json" if ENABLE_DOCS else None)

app.include_router(avatar_v46.router)  # V4.6
app.include_router(dynasty_v47.router)  # V4.7: nội dung triều đại & CMS


# ============================================================ static files
class CachedStatic(StaticFiles):
    """Ảnh/JS đã băm tên → cache 1 năm; còn lại 1 giờ. Không cho dò nội dung (nosniff)."""

    async def get_response(self, path, scope):
        resp = await super().get_response(path, scope)
        if resp.status_code == 200:
            if path.startswith(("build/", "fonts/", "vendor/", "uploads/sgk/")):
                resp.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            elif path.endswith((".html",)):
                resp.headers["Cache-Control"] = "no-cache"
            else:
                resp.headers["Cache-Control"] = "public, max-age=3600"
            resp.headers["X-Content-Type-Options"] = "nosniff"
            if path.endswith(".svg") or path.startswith("uploads/"):
                resp.headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox"
        return resp


app.mount("/static", CachedStatic(directory=str(STATIC)), name="static")
# Không gian lịch sử 3D (sa bàn three.js): /khong-gian/<ten-khong-gian>/
KHONG_GIAN = STATIC / "khong-gian"
if KHONG_GIAN.is_dir():
    app.mount("/khong-gian", CachedStatic(directory=str(KHONG_GIAN), html=True), name="khong-gian")


# ============================================================ middleware
NOINDEX_PREFIXES = ("/admin", "/api/", "/static/admin", "/static/costumes_admin")


def _csp(path: str) -> str:
    if path.startswith(("/khong-gian/", "/static/khong-gian/")):
        # Sa bàn 3D: cần WebAssembly (giải nén mô hình meshopt) và blob: (ảnh trong GLB)
        return ("default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; "
                "font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' blob: data:; media-src 'self' blob: data:; "
                "worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'")
    if path.startswith("/admin") or path.startswith("/static/admin") or path.startswith("/static/costumes_admin"):
        return ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; "
                "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'")
    ads = vs_ads.ads_enabled_live()
    script = "'self' 'unsafe-inline'" + (" https:" if ads else "")
    connect = "'self' https://vi.wikipedia.org" + (" https:" if ads else "")
    frame = "https:" if ads else "'none'"
    up = " upgrade-insecure-requests;" if SITE_URL.startswith("https://") else ""
    return (f"default-src 'self'; script-src {script}; style-src 'self' 'unsafe-inline'; "
            f"img-src 'self' data: blob: https:; font-src 'self' data:; connect-src {connect}; frame-src {frame}; "
            f"media-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'self'; "
            f"frame-ancestors 'self';{up}")


@app.middleware("http")
async def guard(request: Request, call_next):
    path = request.url.path
    # 1) giới hạn kích thước body
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > MAX_BODY_BYTES:
        return JSONResponse({"detail": "Dữ liệu gửi lên quá lớn"}, status_code=413)
    # 2) giới hạn tần suất cho API
    if path.startswith("/api/") and not api_limiter.hit("a:" + client_ip(request)):
        return JSONResponse({"detail": "Quá nhiều yêu cầu, vui lòng thử lại sau ít phút"}, status_code=429,
                            headers={"Retry-After": "60"})
    # 3) Host hợp lệ (nếu cấu hình ALLOWED_HOSTS)
    if ALLOWED_HOSTS:
        host = (request.headers.get("host") or "").split(":")[0].lower()
        if host not in ALLOWED_HOSTS:
            return Response("Invalid host", status_code=400)
    resp = await call_next(request)
    h = resp.headers
    h.setdefault("X-Content-Type-Options", "nosniff")
    h.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()")
    h.setdefault("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
    ctype = h.get("content-type", "")
    if "text/html" in ctype:
        h.setdefault("Content-Security-Policy", _csp(path))
        h.setdefault("X-Frame-Options", "DENY" if path.startswith("/admin") else "SAMEORIGIN")
    if SITE_URL.startswith("https://"):
        h.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    if path.startswith(NOINDEX_PREFIXES):
        h.setdefault("X-Robots-Tag", "noindex, nofollow")
    if path.startswith("/api/admin") or path.startswith("/admin"):
        h["Cache-Control"] = "no-store"
    return resp


class SkipBinaryGZip:
    """Nén gzip cho HTML/JS/CSS/JSON; bỏ qua ảnh, font (đã nén sẵn)."""
    SKIP = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".woff2", ".woff", ".mp4", ".zip")

    def __init__(self, app_):
        self.app = app_
        self.gz = GZipMiddleware(app_, minimum_size=1024, compresslevel=6)

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and not scope.get("path", "").lower().endswith(self.SKIP):
            return await self.gz(scope, receive, send)
        return await self.app(scope, receive, send)


app.add_middleware(SkipBinaryGZip)


@app.exception_handler(sqlite3.DatabaseError)
async def db_error(_request: Request, _exc: sqlite3.DatabaseError):
    return JSONResponse({"detail": "Lỗi cơ sở dữ liệu. Vui lòng thử lại."}, status_code=500)


# ============================================================ database
def initialize():
    init_db_pragmas()
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            intro TEXT DEFAULT '',
            body TEXT DEFAULT '',
            seo_title TEXT DEFAULT '',
            meta_description TEXT DEFAULT '',
            focus_keyword TEXT DEFAULT '',
            category TEXT DEFAULT 'Lịch sử',
            timeline_year INTEGER,
            entity_id TEXT DEFAULT '',
            source_urls TEXT DEFAULT '[]',
            tags TEXT DEFAULT '[]',
            author_name TEXT DEFAULT 'Nhóm biên tập',
            reviewer_name TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'draft',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            published_at TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS article_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL,
            snapshot TEXT NOT NULL,
            changed_at TEXT NOT NULL,
            FOREIGN KEY (article_id) REFERENCES articles(id)
        );
        CREATE TABLE IF NOT EXISTS experiences (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            period TEXT DEFAULT '',
            entity_id TEXT DEFAULT '',
            timeline_year INTEGER,
            mode TEXT DEFAULT 'tour3d',
            reconstruction_level TEXT DEFAULT 'concept',
            asset_url TEXT DEFAULT '',
            hotspots TEXT DEFAULT '[]',
            notes TEXT DEFAULT '',
            source_urls TEXT DEFAULT '[]',
            status TEXT DEFAULT 'concept'
        );
        CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, entity_id);
        """)
    vs_textbook.init_textbook()


initialize()
app.include_router(vs_textbook.router)
app.include_router(vs_ads.router)


# ============================================================ models
ENTITY_RE = r"^[a-zA-Z0-9_:\-]*$"


class ArticleIn(BaseModel):
    title: str = Field(min_length=4, max_length=240)
    slug: str | None = Field(default=None, max_length=240)
    intro: str = Field(default="", max_length=3000)
    body: str = Field(default="", max_length=200_000)
    seo_title: str = Field(default="", max_length=200)
    meta_description: str = Field(default="", max_length=320)
    focus_keyword: str = Field(default="", max_length=120)
    category: str = Field(default="Lịch sử", max_length=80)
    timeline_year: int | None = Field(default=None, ge=-5000, le=2100)
    entity_id: str = Field(default="", max_length=80, pattern=ENTITY_RE)
    source_urls: list[str] = Field(default_factory=list, max_length=30)
    tags: list[str] = Field(default_factory=list, max_length=30)
    author_name: str = Field(default="Nhóm biên tập", max_length=120)

    @field_validator("tags")
    @classmethod
    def _tags(cls, v):
        return [str(t).strip()[:60] for t in v if str(t).strip()]


class BulkDraftImport(BaseModel):
    """Nhập hàng loạt bài từ tư liệu được phép sử dụng; mọi bản ghi vẫn ở trạng thái nháp."""
    articles: list[ArticleIn] = Field(min_length=1, max_length=100)


class DraftRequest(BaseModel):
    title: str = Field(min_length=5, max_length=240)
    focus_keyword: str = Field(default="", max_length=120)
    timeline_year: int | None = Field(default=None, ge=-5000, le=2100)
    entity_id: str = Field(default="", max_length=80, pattern=ENTITY_RE)
    source_notes: str = Field(default="", max_length=30000)
    source_urls: list[str] = Field(default_factory=list, max_length=30)
    target_words: int = Field(700, ge=250, le=2000)


class ExperienceIn(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9-]{3,80}$")
    title: str = Field(min_length=2, max_length=200)
    period: str = Field(default="", max_length=120)
    timeline_year: int | None = Field(default=None, ge=-5000, le=2100)
    entity_id: str = Field(default="", max_length=80, pattern=ENTITY_RE)
    mode: str = Field(default="tour3d", pattern=r"^[a-z0-9_-]{2,30}$")
    reconstruction_level: str = Field(default="concept", max_length=40)
    asset_url: str = Field(default="", max_length=600)
    hotspots: list[dict] = Field(default_factory=list, max_length=200)
    notes: str = Field(default="", max_length=5000)
    source_urls: list[str] = Field(default_factory=list, max_length=30)
    status: str = Field(default="concept", max_length=40)

    @field_validator("asset_url")
    @classmethod
    def _asset(cls, v):
        if v and not is_safe_url(v):
            raise ValueError("asset_url phải là https:// hoặc đường dẫn nội bộ")
        return v


def as_article(r):
    d = dict(r)
    d["source_urls"] = json.loads(d["source_urls"] or "[]")
    d["tags"] = json.loads(d["tags"] or "[]")
    return d


# ============================================================ articles API
@app.get("/api/health")
def health():
    return {"ok": True, "app": "Việt Sử", "version": VERSION, "ai_connected": bool(os.getenv("OPENAI_API_KEY"))}


@app.get("/api/articles")
def list_articles(request: Request, status: str = "published", entity_id: str = "", timeline_year: int | None = None,
                  x_admin_token: str | None = Header(None)):
    if status not in ("published", "draft"):
        raise HTTPException(422, "Trạng thái không hợp lệ")
    if status != "published":
        require_role(x_admin_token, request=request)
    sql = "SELECT * FROM articles WHERE status=?"
    args: list = [status]
    if entity_id:
        sql += " AND entity_id=?"; args.append(entity_id[:80])
    if timeline_year is not None:
        sql += " AND timeline_year=?"; args.append(timeline_year)
    sql += " ORDER BY COALESCE(published_at,updated_at) DESC, id DESC LIMIT 250"
    with db() as con:
        return [as_article(x) for x in con.execute(sql, args).fetchall()]


@app.get("/api/articles/{slug}")
def get_article(slug: str, request: Request, x_admin_token: str | None = Header(None)):
    with db() as con:
        r = con.execute("SELECT * FROM articles WHERE slug=?", (slug[:240],)).fetchone()
        if not r:
            raise HTTPException(404, "Không tìm thấy bài viết")
        if r["status"] != "published":
            require_role(x_admin_token, request=request)
        return as_article(r)


def _prepare_article(d: dict) -> dict:
    d["slug"] = slugify(d.get("slug") or d["title"])
    d["seo_title"] = d["seo_title"] or d["title"]
    d["meta_description"] = d["meta_description"] or d["intro"][:180]
    d["source_urls"] = json.dumps(clean_url_list(d["source_urls"]), ensure_ascii=False)
    d["tags"] = json.dumps(d["tags"], ensure_ascii=False)
    return d


@app.post("/api/v2.7/articles/bulk-drafts")
def bulk_import_drafts(payload: BulkDraftImport, request: Request, x_admin_token: str | None = Header(None)):
    """Import tối đa 100 bản nháp mỗi yêu cầu; bỏ qua slug trùng, không tự xuất bản."""
    require_role(x_admin_token, request=request)
    imported, skipped = [], []
    timestamp = now()
    with db() as con:
        for i, item in enumerate(payload.articles, start=1):
            data = item.model_dump()
            title = data["title"].strip()
            try:
                data["title"] = title
                data["intro"] = data["intro"] or ("Đề cương đang biên tập: " + title)
                data["tags"] = list(dict.fromkeys(data["tags"] + ["Nháp nhập hàng loạt", "Cần thẩm định"]))
                data = _prepare_article(data)
            except HTTPException:
                skipped.append({"line": i, "title": title, "reason": "URL nguồn không hợp lệ"}); continue
            if con.execute("SELECT 1 FROM articles WHERE slug=?", (data["slug"],)).fetchone():
                skipped.append({"line": i, "title": title, "reason": "Slug đã có trong CMS"}); continue
            data.update(created_at=timestamp, updated_at=timestamp, status="draft")
            try:
                cur = con.execute(f"INSERT INTO articles ({','.join(data)}) VALUES ({','.join('?' for _ in data)})",
                                  tuple(data.values()))
                imported.append({"id": cur.lastrowid, "slug": data["slug"], "title": title})
            except sqlite3.IntegrityError:
                skipped.append({"line": i, "title": title, "reason": "Trùng hoặc không hợp lệ"})
    return {"imported_count": len(imported), "skipped_count": len(skipped), "imported": imported,
            "skipped": skipped, "status": "draft_only"}


def _create_article(item: ArticleIn) -> dict:
    d = _prepare_article(item.model_dump())
    d["created_at"] = d["updated_at"] = now()
    d["status"] = "draft"
    with db() as con:
        try:
            cur = con.execute(f"INSERT INTO articles ({','.join(d)}) VALUES ({','.join('?' for _ in d)})", tuple(d.values()))
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Slug đã tồn tại")
        return {"id": cur.lastrowid, "slug": d["slug"], "status": "draft"}


@app.post("/api/articles", status_code=201)
def create_article(item: ArticleIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    return _create_article(item)


@app.put("/api/articles/{article_id}")
def update_article(article_id: int, item: ArticleIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    with db() as con:
        old = con.execute("SELECT * FROM articles WHERE id=?", (article_id,)).fetchone()
        if not old:
            raise HTTPException(404, "Không tìm thấy bài viết")
        con.execute("INSERT INTO article_versions (article_id,snapshot,changed_at) VALUES (?,?,?)",
                    (article_id, json.dumps(as_article(old), ensure_ascii=False), now()))
        d = _prepare_article(item.model_dump())
        d["updated_at"] = now()
        d["status"] = "draft"
        d["reviewer_name"] = ""
        try:
            con.execute("UPDATE articles SET " + ",".join(f"{k}=?" for k in d) + " WHERE id=?", (*d.values(), article_id))
        except sqlite3.IntegrityError:
            raise HTTPException(409, "Slug đã tồn tại")
        return {"id": article_id, "slug": d["slug"], "status": "draft"}


@app.post("/api/articles/{article_id}/publish")
def publish_article(article_id: int, request: Request, reviewer_name: str = "Người thẩm định",
                    x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, reviewer=True, request=request)
    reviewer_name = re.sub(r"[\x00-\x1f<>]", "", reviewer_name)[:120] or "Người thẩm định"
    with db() as con:
        row = con.execute("SELECT * FROM articles WHERE id=?", (article_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Không tìm thấy bài viết")
        if not row["source_urls"] or row["source_urls"] == "[]":
            raise HTTPException(422, "Cần ít nhất một nguồn tư liệu trước khi công bố.")
        if len(row["body"].strip()) < 150:
            raise HTTPException(422, "Bài viết quá ngắn để công bố.")
        ts = now()
        con.execute("UPDATE articles SET status='published', reviewer_name=?, published_at=?,updated_at=? WHERE id=?",
                    (reviewer_name, ts, ts, article_id))
        return {"status": "published", "url": f"{SITE_URL}/bai-viet/{row['slug']}"}


@app.get("/api/articles/{article_id}/versions")
def versions(article_id: int, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    with db() as con:
        rows = con.execute("SELECT * FROM article_versions WHERE article_id=? ORDER BY id DESC LIMIT 100", (article_id,))
        return [dict(x) for x in rows]


@app.post("/api/ai/draft")
def ai_draft(payload: DraftRequest, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    if not ai_limiter.hit("ai:" + client_ip(request)):
        raise HTTPException(429, "Đã dùng hết lượt AI trong giờ này (10 lượt/giờ).")
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(503, "Chưa cấu hình OPENAI_API_KEY trên máy chủ.")
    source_urls = clean_url_list(payload.source_urls)
    try:
        from openai import OpenAI
        client = OpenAI(timeout=70)
        prompt = ("Bạn là biên tập viên nghiên cứu lịch sử Việt Nam. Hãy viết bản nháp bài học lịch sử bằng tiếng Việt. "
                  "CHỈ dùng dữ kiện trong phần ghi chú nguồn do biên tập viên cung cấp. "
                  "Không tưởng tượng sự kiện, niên đại, lời trích dẫn hay nguồn. "
                  "Nếu thiếu bằng chứng, viết rõ 'Cần kiểm chứng' trong bài. "
                  "Phải có các mục: Tổng quan, Bối cảnh, Diễn biến/Đóng góp, "
                  "Nhân vật liên quan, Ý nghĩa, Ghi chú sử liệu, 3 câu hỏi ôn tập. "
                  "Văn phong rõ ràng, tránh tuyên truyền áp đặt và phân biệt sử liệu với tái dựng. "
                  "Chỉ trả bài viết thuần văn bản với các tiêu đề Markdown.\n\n"
                  f"Tiêu đề: {payload.title}\nTừ khóa: {payload.focus_keyword}\n"
                  f"Niên đại: {payload.timeline_year}\nID liên kết: {payload.entity_id}\n"
                  f"Mục tiêu khoảng {payload.target_words} từ.\nGHI CHÚ NGUỒN:\n{payload.source_notes}\n"
                  "URL nguồn (chỉ dẫn, không tự xác nhận nội dung URL):\n" + "\n".join(source_urls))
        kwargs = {"model": os.getenv("OPENAI_MODEL", "gpt-6-astra"), "input": prompt, "store": False}
        if not payload.source_notes.strip():
            kwargs["tools"] = [{"type": "web_search"}]
            kwargs["tool_choice"] = "required"
            kwargs["include"] = ["web_search_call.action.sources"]
            kwargs["input"] += ("\nCẦN TRA CỨU NGUỒN TRỰC TUYẾN: Chỉ sử dụng nguồn có đường dẫn đáng tin cậy; "
                                "trích rõ URL ngay sau dữ kiện, và liệt kê cuối bài các tài liệu đã tham khảo. "
                                "Nếu các nguồn không nhất quán, ghi rõ có tranh luận. ")
        result = client.responses.create(**kwargs)
        generated = (result.output_text or "")[:200_000]
        researched = []
        for output in result.output:
            if getattr(output, "type", "") != "message":
                continue
            for content in getattr(output, "content", []) or []:
                for ann in getattr(content, "annotations", []) or []:
                    url = getattr(ann, "url", None)
                    if getattr(ann, "type", "") == "url_citation" and url and url.startswith("https://") and is_safe_url(url):
                        researched.append(url)
        all_urls = list(dict.fromkeys(source_urls + researched))[:30]
        if not payload.source_notes.strip() and not researched:
            raise HTTPException(502, "Không tìm được URL nguồn kiểm chứng. Hãy nhập ghi chú tư liệu trước khi tạo bài.")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Không gọi được dịch vụ AI: {type(exc).__name__}")
    body = ArticleIn(title=payload.title, intro=f"Bản nháp về {payload.title} – đang chờ đối chiếu tư liệu.",
                     body=generated, seo_title=payload.title[:200],
                     meta_description=f"Tìm hiểu {payload.title} qua bối cảnh, diễn biến và các nhân vật lịch sử liên quan."[:320],
                     focus_keyword=payload.focus_keyword, timeline_year=payload.timeline_year,
                     entity_id=payload.entity_id, source_urls=all_urls, tags=["AI nháp", "Cần thẩm định"])
    created = _create_article(body)
    created.update(body=generated, source_urls=all_urls, warning="Bản nháp tự động, chưa được thẩm định hoặc công bố.")
    return created


# ============================================================ experiences
@app.get("/api/experiences")
def experiences():
    with db() as con:
        out = []
        for r in con.execute("SELECT * FROM experiences ORDER BY id"):
            d = dict(r)
            d["hotspots"] = json.loads(d["hotspots"] or "[]")
            d["source_urls"] = json.loads(d["source_urls"] or "[]")
            out.append(d)
        return out


@app.post("/api/experiences")
def upsert_experience(e: ExperienceIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    d = e.model_dump()
    hot = json.dumps(d["hotspots"], ensure_ascii=False)
    if len(hot) > 200_000:
        raise HTTPException(413, "Dữ liệu hotspot quá lớn")
    d["hotspots"] = hot
    d["source_urls"] = json.dumps(clean_url_list(d["source_urls"]), ensure_ascii=False)
    with db() as con:
        con.execute("INSERT INTO experiences (" + ",".join(d) + ") VALUES (" + ",".join("?" for _ in d) + ") "
                    "ON CONFLICT(id) DO UPDATE SET " + ",".join(f"{k}=excluded.{k}" for k in d if k != "id"),
                    tuple(d.values()))
    return {"id": e.id, "status": e.status}


# ============================================================ public pages
def _ads():
    return vs_ads.load_ads()


def _ads_head():
    return vs_ads.ads_head_html()


vs_textbook.register_pages(app, _ads, _ads_head)


@app.get("/bai-viet/{slug}", response_class=HTMLResponse)
def article_page(slug: str):
    with db() as con:
        r = con.execute("SELECT * FROM articles WHERE slug=? AND status='published'", (slug[:240],)).fetchone()
        if not r:
            raise HTTPException(404, "Bài viết chưa công bố")
        a = as_article(r)
    ads = _ads()
    url = SITE_URL + "/bai-viet/" + quote(slug)
    schema = {"@context": "https://schema.org", "@type": "Article", "headline": a["title"],
              "description": a["meta_description"], "datePublished": a["published_at"],
              "dateModified": a["updated_at"], "author": {"@type": "Person", "name": a["author_name"]},
              "mainEntityOfPage": url, "inLanguage": "vi"}
    sources = "".join(f'<li><a href="{esc(u)}" target="_blank" rel="noopener noreferrer nofollow">{esc(u)}</a></li>'
                      for u in a["source_urls"] if u.startswith("https://"))
    year = a["timeline_year"]
    chips = [a["category"]] + ([f"{abs(year)} TCN" if year < 0 else str(year)] if year is not None else [])
    if a["reviewer_name"]:
        chips.append("Đã thẩm định: " + a["reviewer_name"])
    body = ('<div class="crumb"><a href="/">Việt Sử</a> / Bài viết</div>'
            f'<h1>{esc(a["title"])}</h1><div class="meta">' + "".join(f'<span class="chip">{esc(c)}</span>' for c in chips)
            + f'</div><p class="lede">{esc(a["intro"])}</p>' + ad_slot_html(ads, "article_top")
            + "<article>" + markdown_safe(a["body"], 3, ad_slot_html(ads, "article_inline")) + "</article>"
            + ad_slot_html(ads, "article_bottom")
            + f'<div class="panel"><h2 style="margin-top:0">Nguồn tư liệu</h2><ul>{sources}</ul></div>'
            + '<p class="back"><a href="/">← Trở về dòng thời gian</a></p>')
    return HTMLResponse(page_shell(title=a["seo_title"] or a["title"], description=a["meta_description"],
                                   canonical=url, body=body, ads_head=_ads_head(), schema=schema))


@app.get("/sitemap.xml")
def sitemap():
    with db() as con:
        rows = con.execute("SELECT slug,updated_at FROM articles WHERE status='published'").fetchall()
    parts = ['<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
             f'<url><loc>{html.escape(SITE_URL + "/")}</loc></url>']
    for r in rows:
        url = SITE_URL + "/bai-viet/" + quote(r["slug"])
        parts.append(f'<url><loc>{html.escape(url)}</loc><lastmod>{html.escape((r["updated_at"] or "")[:10])}</lastmod></url>')
    for url, lastmod in vs_textbook.sitemap_urls():
        parts.append(f"<url><loc>{html.escape(url)}</loc>" + (f"<lastmod>{lastmod}</lastmod>" if lastmod else "") + "</url>")
    for person in historical_characters():
        if person.get("status") == "published":
            parts.append(f'<url><loc>{html.escape(SITE_URL + "/nhan-vat/" + quote(person["slug"]))}</loc></url>')
    parts.append("</urlset>")
    return Response("".join(parts), media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})


@app.get("/robots.txt")
def robots():
    access = "Allow: /" if site_is_public() else "Disallow: /"
    return Response(f"User-agent: *\n{access}\nDisallow: /admin\nDisallow: /api/\nAllow: /api/textbook/\n"
                     f"Sitemap: {SITE_URL}/sitemap.xml\n", media_type="text/plain")


@app.get("/admin")
def admin():
    return FileResponse(STATIC / "admin.html", headers={"X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store"})


# ------------------------------------------------------------ home page
HOME_CANDIDATES = [STATIC / "Viet_Su_Timeline_V4.7_Offline.html", STATIC / "Viet_Su_Timeline_V4.6_Offline.html", STATIC / "Viet_Su_Timeline_V4.5_Offline.html", STATIC / "Viet_Su_Timeline_V4.4_Offline.html", STATIC / "Viet_Su_Timeline_V4.3_Offline.html", STATIC / "Viet_Su_Timeline_V4.2_Offline.html", STATIC / "Viet_Su_Timeline_V4.1_Offline.html", STATIC / "build" / "index.html", STATIC / "Viet_Su_Timeline_V3.9_Offline.html",
                   STATIC / "Viet_Su_Timeline_V3.7_Offline.html"]
_home_cache: dict = {}


def _home_base() -> str:
    src = next((p for p in HOME_CANDIDATES if p.is_file()), None)
    if src is None:
        raise HTTPException(500, "Thiếu file giao diện. Hãy chạy tools/build_frontend.py")
    mtime = src.stat().st_mtime
    if _home_cache.get("key") == (str(src), mtime):
        return _home_cache["page"]
    page = src.read_text(encoding="utf-8")
    page_url = SITE_URL + "/"
    title = "Việt Sử – Dòng thời gian lịch sử Việt Nam và thế giới"
    description = ("Khám phá lịch sử Việt Nam, đối chiếu Trung Quốc và phương Tây qua dòng thời gian, "
                   "hồ sơ nhân vật, sách giáo khoa lịch sử lớp 6–12 và không gian lịch sử.")
    data = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "@id": SITE_URL + "/#website", "url": page_url, "name": "Việt Sử", "inLanguage": "vi"},
        {"@type": "WebPage", "@id": page_url + "#webpage", "url": page_url, "name": title, "description": description,
         "inLanguage": "vi", "isPartOf": {"@id": SITE_URL + "/#website"}}]}
    robot = "index, follow, max-image-preview:large" if site_is_public() else "noindex, nofollow"
    head = (f'<meta name="description" content="{html.escape(description, quote=True)}">'
            f'<meta name="robots" content="{robot}">'
            f'<link rel="canonical" href="{html.escape(page_url, quote=True)}">'
            '<meta property="og:type" content="website"><meta property="og:locale" content="vi_VN">'
            f'<meta property="og:title" content="{html.escape(title, quote=True)}">'
            f'<meta property="og:description" content="{html.escape(description, quote=True)}">'
            f'<meta property="og:url" content="{html.escape(page_url, quote=True)}">'
            '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")
            + "</script><!--VS-ADS-HEAD-->")
    page = page.replace('<meta name="robots" content="noindex, nofollow">', "", 1)
    page = page.replace("</head>", head + "</head>", 1)
    page = re.sub(r"<title>[^<]*</title>", "<title>" + html.escape(title) + "</title>", page, count=1)
    _home_cache.update(key=(str(src), mtime), page=page)
    return page


@app.get("/", response_class=HTMLResponse)
def home():
    page = _home_base().replace("<!--VS-ADS-HEAD-->", _ads_head(), 1)
    return HTMLResponse(page, headers={"Cache-Control": "public, max-age=300"})


# ============================================================ V2.1–V2.2 catalog (read-only)
@app.get("/api/v2.1/dynasty-crosswalk")
def dynasty_crosswalk():
    return read_json(DATA / "dynasty_crosswalk.json", [])


@app.get("/api/v2.1/school/grades")
def school_grades():
    return {"grades": [6, 7, 8, 9, 10, 11, 12], "source": "", "status": "đề cương tham khảo"}


@app.get("/api/v2.1/school/grades/{grade}")
def school_grade(grade: int):
    if grade not in range(6, 13):
        raise HTTPException(404, "Chỉ hỗ trợ lớp 6 đến 12")
    return (read_json(DATA / "school_lessons.json", {}) or {}).get(str(grade), [])


@app.get("/api/v2.1/school/related/{entity_id}")
def school_related(entity_id: str):
    catalog = read_json(DATA / "school_lessons.json", {}) or {}
    return [item for grade in catalog.values() for item in grade if item.get("entity_id") == entity_id]


def load_textbook_catalog():
    """Tương thích V2.2: trả về dữ liệu đang hiển thị (đã gồm chỉnh sửa từ CMS)."""
    with db() as con:
        grades: dict[str, list] = {str(g): [] for g in range(6, 13)}
        chapters: dict[str, list] = {str(g): [] for g in range(6, 13)}
        for r in con.execute("SELECT live, grade FROM textbook_lessons WHERE live_state<>'hidden' ORDER BY grade, sort_order"):
            d = json.loads(r["live"])
            d.pop("content", None)
            grades[str(r["grade"])].append(d)
            ch = {"part": d.get("part", ""), "chapter": d.get("chapter", "")}
            if ch["chapter"] and ch not in chapters[str(r["grade"])]:
                chapters[str(r["grade"])].append(ch)
    note = (read_json(DATA / "textbook_catalog.json", {}) or {}).get("catalog_note", "")
    return {"grades": grades, "chapters": chapters, "catalog_note": note}


@app.get("/api/v2.2/textbooks")
def textbooks_summary():
    d = load_textbook_catalog()
    return {"version": "3.8", "grades": {g: {"lesson_count": len(v), "chapter_count": len(d["chapters"][g])}
                                         for g, v in d["grades"].items()}, "note": d["catalog_note"]}


@app.get("/api/v2.2/textbooks/grade/{grade}")
def textbooks_grade(grade: int, keyword: str = "", entity_id: str = ""):
    if grade not in range(6, 13):
        raise HTTPException(404, "Chỉ có lớp 6–12")
    d = load_textbook_catalog()
    items = d["grades"][str(grade)]
    if keyword:
        items = [x for x in items if keyword.casefold()[:100] in (x["title"] + " " + x.get("chapter", "")).casefold()]
    if entity_id:
        items = [x for x in items if x.get("entity_id") == entity_id]
    return {"grade": grade, "total": len(items), "lessons": items, "chapters": d["chapters"][str(grade)], "note": d["catalog_note"]}


@app.get("/api/v2.2/textbooks/lesson/{lesson_id}")
def textbook_lesson(lesson_id: str):
    return vs_textbook.public_lesson(lesson_id)


@app.get("/api/v2.2/textbooks/related/{entity_id}")
def textbooks_related(entity_id: str):
    d = load_textbook_catalog()
    return [item for group in d["grades"].values() for item in group if item.get("entity_id") == entity_id]


# ============================================================ V2.3 site config
SITE_CONFIG_FILE = DATA / "site_config.json"
SITE_CONFIG_DEFAULT = {"name": "VIỆT SỬ", "slogan": "BẢN ĐỒ THỜI GIAN", "tagline": "BẢN ĐỒ THỜI GIAN", "han": "越史",
                       "font_family": "\"Be Vietnam Pro\", system-ui, sans-serif", "logo_url": ""}
SECTION_DEFAULT = {
    "main": {"title": "KHÁM PHÁ DÒNG LỊCH SỬ", "description": "Khám phá các thời kỳ Việt Nam, Trung Quốc và phương Tây trên cùng một trục thời gian."},
    "hcm": {"title": "CHỦ TỊCH HỒ CHÍ MINH", "description": "Dòng thời gian cuộc đời và những sự kiện liên quan đến Chủ tịch Hồ Chí Minh."},
    "spaces": {"title": "KHÔNG GIAN LỊCH SỬ", "description": "Mỗi điểm pin đại diện cho một địa danh, di tích hoặc chiến trường có thể mở thành không gian 3D"},
    "school": {"title": "SÁCH GIÁO KHOA LỊCH SỬ", "description": "Học liệu lớp 6–12, gắn với các sự kiện và triều đại trên dòng thời gian."},
    "characters": {"title": "NHÂN VẬT LỊCH SỬ", "description": "Hồ sơ nhân vật lịch sử, niên đại, sự kiện và những mối liên hệ với các thời kỳ."},
}


class SiteBrandIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    slogan: str = Field(min_length=2, max_length=150)
    tagline: str | None = Field(default=None, min_length=2, max_length=180)
    han: str = Field(min_length=1, max_length=12)
    font_family: str | None = Field(default=None, min_length=2, max_length=180, pattern=r'^[\w\s,"\'\-]+$')
    logo_url: str | None = Field(default=None, max_length=500)
    sections: dict[str, dict[str, str]] | None = None

    @field_validator("logo_url")
    @classmethod
    def _logo(cls, v):
        if v and not is_safe_url(v.strip()):
            raise ValueError("Logo phải là URL https:// hoặc đường dẫn nội bộ /static/…")
        return v.strip() if v else v


@app.get("/api/site-config")
def get_site_config():
    obj = read_json(SITE_CONFIG_FILE, {}) or {}
    sections = {k: dict(v) for k, v in SECTION_DEFAULT.items()}
    if isinstance(obj, dict):
        for key in SECTION_DEFAULT:
            val = (obj.get("sections") or {}).get(key)
            if isinstance(val, dict):
                sections[key] = {**SECTION_DEFAULT[key], **{k: str(val[k]) for k in ("title", "description") if val.get(k)}}
        base = {k: str(obj[k]) for k in SITE_CONFIG_DEFAULT if obj.get(k)}
    else:
        base = {}
    cfg = {**SITE_CONFIG_DEFAULT, **base, "sections": sections}
    cfg["font_family"] = SITE_CONFIG_DEFAULT["font_family"]  # V3.8: font thống nhất Be Vietnam Pro
    if cfg.get("logo_url") and not is_safe_url(cfg["logo_url"]):
        cfg["logo_url"] = ""
    return cfg


@app.put("/api/site-config")
def update_site_config(item: SiteBrandIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    old = get_site_config()
    data = item.model_dump(exclude_none=True)
    supplied = data.pop("sections", None)
    sections = {k: dict(v) for k, v in old["sections"].items()}
    if isinstance(supplied, dict):
        for key, val in supplied.items():
            if key not in SECTION_DEFAULT or not isinstance(val, dict):
                raise HTTPException(422, "Không hợp lệ: mục menu")
            sections[key] = {}
            for field in ("title", "description"):
                value = str(val.get(field, SECTION_DEFAULT[key][field])).strip()
                if len(value) > (130 if field == "title" else 600) or not value:
                    raise HTTPException(422, "Tiêu đề hoặc mô tả không hợp lệ")
                sections[key][field] = value
    data = {**{k: old[k] for k in SITE_CONFIG_DEFAULT}, **data, "sections": sections}
    write_json(SITE_CONFIG_FILE, data)
    return data


# ============================================================ V2.3 locations
LOCATION_CONFIG_FILE = DATA / "experience_locations.json"


class HistoricalPlaceIn(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    year: int | None = Field(default=None, ge=-5000, le=2100)
    kind: str = Field(pattern=r"^(heritage|battle)$")
    category: str = Field(min_length=2, max_length=100)
    source_note: str = Field(default="", max_length=1000)


@app.get("/api/v2.3/locations")
def list_historical_places():
    return read_json(LOCATION_CONFIG_FILE, [])


@app.put("/api/v2.3/locations/{place_id}")
def update_historical_place(place_id: str, item: HistoricalPlaceIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    places = read_json(LOCATION_CONFIG_FILE, []) or []
    found = next((i for i, x in enumerate(places) if x.get("id") == place_id), None)
    if found is None:
        raise HTTPException(404, "Chưa có không gian này")
    places[found] = {"id": place_id, **item.model_dump()}
    write_json(LOCATION_CONFIG_FILE, places)
    return places[found]


# ============================================================ characters
CHARACTERS_FILE = DATA / "historical_characters.json"


def historical_characters():
    return read_json(CHARACTERS_FILE, []) or []


def _sanitize_person(p: dict) -> dict:
    if p.get("image_url") and not is_safe_url(p["image_url"]):
        p = {**p, "image_url": ""}
    return p


@app.get("/api/v2.5/characters")
def list_characters():
    return [_sanitize_person(p) for p in historical_characters()]


@app.get("/api/v2.5/characters/{slug}")
def character_detail_api(slug: str):
    person = next((p for p in historical_characters() if p.get("slug") == slug), None)
    if person is None:
        raise HTTPException(404, "Không có hồ sơ")
    return _sanitize_person(person)


FEMALE_IDS = {"auco", "mychau", "trungtrac", "trungnhi", "batrieu", "buithixuan", "ylan", "lychieuhoang"}


@app.get("/nhan-vat/{slug}", response_class=HTMLResponse)
def character_detail_page(slug: str):
    person = next((p for p in historical_characters() if p.get("slug") == slug), None)
    if person is None:
        raise HTTPException(404, "Không có hồ sơ")
    person = _sanitize_person(person)
    url = SITE_URL + "/nhan-vat/" + quote(slug)
    media = person.get("image_url") or ""
    # V4.6: hình riêng đã duyệt trong CMS được ưu tiên trên trang hồ sơ HTML.
    approved = avatar_v46.approved_overrides().get(str(person.get("entity_id") or ""))
    if approved:
        media = approved["url"]
    elif str(person.get("entity_id") or "") == "hochiminh":
        # Dùng đúng hình chương 7 hiện đã có trong bộ tài nguyên website.
        media = "/static/assets/hcm_stages/07_di_san.webp"
    if not media:
        role = str(person.get("role", "")).lower()
        military = bool(re.search(r"(đại tướng|danh tướng|tướng lĩnh|quân sự|tiết chế|quốc công|tổng tham mưu|chỉ huy|binh sĩ|khởi nghĩa|võ tướng|thủy quân|đô đốc)", role))
        female = bool(re.search(r"(nữ|hoàng hậu|hoàng thái hậu|công chúa|nguyên phi|quý phi|nữ vương|vương phi)", role)) or person.get("entity_id") in FEMALE_IDS
        media = "/static/assets/nhan_vat_chua_co_anh.svg" if female else ("/static/assets/quan_vo_512.png" if military else "/static/assets/quan_van_512.png")
    paras = person.get("paragraphs") or [person.get("summary", "")]
    bio = "".join("<p>" + esc(p) + "</p>" for p in paras if p)
    ads = _ads()
    indexable = person.get("status") == "published"
    body = ('<div class="crumb"><a href="/">Việt Sử</a> / Nhân vật lịch sử</div>'
            f'<h1>{esc(person["name"])}</h1><div class="meta"><span class="chip">{esc(person.get("period"))}</span>'
            f'<span class="chip">{esc(person.get("role"))}</span></div>'
            f'<figure style="float:right;max-width:min(220px,40%);margin:0 0 12px 18px"><img src="{esc(media)}" '
            f'alt="Hình minh họa {esc(person["name"])}" loading="lazy"></figure>'
            + ad_slot_html(ads, "article_top") + bio
            + f'<p style="clear:both;font-size:13px;color:var(--muted)">Tham khảo: {esc(person.get("source_book", "Đại Việt Sử Ký Toàn Thư"))}. Dữ liệu còn chờ thẩm định.</p>'
            + ad_slot_html(ads, "article_bottom")
            + f'<p><a href="/#ho-so={esc(person.get("entity_id", ""))}">↗ Khám phá nhân vật trong dòng thời gian</a></p>'
            '<p class="back"><a href="/">← Dòng thời gian Việt Sử</a></p>')
    schema = {"@context": "https://schema.org", "@type": "Person", "name": person["name"],
              "description": person.get("summary", ""), "url": url}
    return HTMLResponse(page_shell(title=f"{person['name']} – Nhân vật lịch sử | Việt Sử",
                                   description=plain_text(person.get("summary", ""), 160), canonical=url, body=body,
                                   ads_head=_ads_head(), indexable=indexable, og_type="profile", schema=schema,
                                   image=media))


# ============================================================ V3.3 book index & portraits
@app.get("/api/v3.3/book")
def dvsk_metadata():
    return read_json(DATA / "dvsk_book.json", {})


@app.get("/api/v3.3/sections")
def dvsk_sections():
    return read_json(DATA / "dvsk_sections.json", [])


@app.get("/api/v3.3/source-index")
def dvsk_source_index(year: int | None = None, limit: int = 120):
    entries = read_json(DATA / "dvsk_year_index.json", []) or []
    if year is not None:
        entries = [e for e in entries if e.get("year") == year]
    return entries[:max(1, min(limit, 1200))]


@app.get("/api/v3.3/persons")
def v33_people():
    return [_sanitize_person(p) for p in historical_characters()]


class V33PersonMedia(BaseModel):
    image_url: str = Field(default="", max_length=1000)
    image_data: str = Field(default="", max_length=4_200_000)
    image_caption: str = Field(default="", max_length=400)
    image_source_url: str = Field(default="", max_length=1000)
    image_rights: str = Field(default="", max_length=400)


ID_RE = re.compile(r"[a-z0-9_\-]{2,80}")


@app.get("/media/person/{person_id}")
def v33_person_photo(person_id: str):
    if not ID_RE.fullmatch(person_id):
        raise HTTPException(400, "ID không hợp lệ")
    for ext, ctype in [(".png", "image/png"), (".jpg", "image/jpeg"), (".webp", "image/webp")]:
        candidate = UPLOADS / (person_id + ext)
        if candidate.is_file():
            return FileResponse(candidate, media_type=ctype, headers={"Cache-Control": "public, max-age=3600"})
    raise HTTPException(404, "Không tìm thấy ảnh")


@app.put("/api/v3.3/persons/{person_id}/image")
def v33_save_person_image(person_id: str, req: V33PersonMedia, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    if not ID_RE.fullmatch(person_id):
        raise HTTPException(400, "ID nhân vật không hợp lệ")
    data = historical_characters()
    person = next((p for p in data if p.get("entity_id") == person_id), None)
    if not person:
        raise HTTPException(404, "Không tìm thấy nhân vật")
    image_url = (req.image_url or "").strip()
    if req.image_data:
        blob, ext, _ = decode_image_data(req.image_data, 2_200_000)
        UPLOADS.mkdir(parents=True, exist_ok=True)
        for suffix in (".png", ".jpg", ".webp"):
            (UPLOADS / (person_id + suffix)).unlink(missing_ok=True)
        (UPLOADS / (person_id + ext)).write_bytes(blob)
        image_url = "/media/person/" + person_id
    elif image_url and not (image_url.startswith("/media/person/") or (image_url.startswith("https://") and is_safe_url(image_url))):
        raise HTTPException(400, "Chỉ hỗ trợ URL HTTPS hợp lệ hoặc ảnh đã tải lên")
    src = (req.image_source_url or "").strip()
    if src and not is_safe_url(src, allow_relative=False):
        raise HTTPException(400, "URL nguồn ảnh không hợp lệ")
    person.update(image_url=image_url, image_caption=req.image_caption.strip(), image_source_url=src,
                  image_rights=req.image_rights.strip() or "Chưa khai báo quyền sử dụng ảnh")
    write_json(CHARACTERS_FILE, data)
    return {"ok": True, "person": person}


# ============================================================ V3.4 curated prose
@app.get("/api/v3.4/book")
def v34_book_info():
    return read_json(DATA / "vnsl_v34_book.json", {})


@app.get("/api/v3.4/articles")
def v34_curated_articles():
    return read_json(DATA / "vnsl_v34_articles.json", [])


@app.get("/api/v3.4/portraits/{person_id}.svg")
def v34_illustrative_svg(person_id: str):
    if not ID_RE.fullmatch(person_id):
        raise HTTPException(400, "ID không hợp lệ")
    path = STATIC / "assets" / "portraits" / (person_id + ".svg")
    if not path.is_file():
        raise HTTPException(404, "Không tìm thấy chân dung")
    return FileResponse(path, media_type="image/svg+xml",
                        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=86400",
                                 "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox"})


# ============================================================ V3.5 costumes
COSTUME_DIR = STATIC / "assets" / "costumes"
COSTUME_CONFIG = DATA / "period_costumes.json"


class CostumeEdit(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    credit: str | None = Field(default=None, max_length=500)
    source_image: str | None = Field(default=None, max_length=200)
    image_data: str | None = Field(default=None, max_length=5_000_000)
    image_url: str | None = Field(default=None, max_length=1200)


@app.get("/api/v3.5/costumes")
def v35_list_costumes():
    return read_json(COSTUME_CONFIG, [])


@app.get("/media/costume/{costume_id}")
def v35_photo(costume_id: str):
    if not ID_RE.fullmatch(costume_id):
        raise HTTPException(400, "Mã trang phục không hợp lệ")
    for ext, mt in [(".png", "image/png"), (".webp", "image/webp"), (".jpg", "image/jpeg")]:
        path = COSTUME_DIR / "custom" / (costume_id + ext)
        if path.is_file():
            return FileResponse(path, media_type=mt, headers={"Cache-Control": "public, max-age=3600"})
    for ext, mt in [(".webp", "image/webp"), (".png", "image/png"), (".jpg", "image/jpeg")]:
        path = COSTUME_DIR / (costume_id + ext)
        if path.is_file():
            return FileResponse(path, media_type=mt, headers={"Cache-Control": "public, max-age=86400"})
    raise HTTPException(404, "Không tìm thấy ảnh")


@app.put("/api/v3.5/costumes/{costume_id}")
def v35_update_costume(costume_id: str, form: CostumeEdit, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    data = read_json(COSTUME_CONFIG, []) or []
    item = next((v for v in data if v.get("id") == costume_id), None)
    if item is None:
        raise HTTPException(404, "Mã trang phục không tồn tại")
    if (form.image_data or "").strip():
        blob, ext, _ = decode_image_data(form.image_data, 2_300_000)
        folder = COSTUME_DIR / "custom"
        folder.mkdir(parents=True, exist_ok=True)
        for other in (".png", ".webp", ".jpg"):
            (folder / (costume_id + other)).unlink(missing_ok=True)
        (folder / (costume_id + ext)).write_bytes(blob)
        item["image_url"] = "/media/costume/" + costume_id
    elif form.image_url is not None:
        value = form.image_url.strip()
        if value and not (value.startswith("/media/costume/") or (value.startswith("https://") and is_safe_url(value))):
            raise HTTPException(400, "Chỉ sử dụng HTTPS hoặc đường dẫn nội bộ /media/costume/")
        if value:
            item["image_url"] = value
    for k in ("title", "description", "credit", "source_image"):
        val = getattr(form, k)
        if val is not None:
            item[k] = val.strip()
    write_json(COSTUME_CONFIG, data)
    return item


@app.get("/admin/trang-phuc")
def v35_costume_admin():
    return FileResponse(STATIC / "costumes_admin.html", headers={"X-Robots-Tag": "noindex,nofollow", "Cache-Control": "no-store"})


# ============================================================ V3.6
@app.get("/api/v3.6/curated-people")
def v36_curated_people():
    return read_json(DATA / "v36_curated_people.json", [])


@app.get("/api/v3.6/source-status")
def v36_source_status():
    return read_json(DATA / "v36_source_status.json", {})
