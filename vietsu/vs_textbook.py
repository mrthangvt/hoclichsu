"""Việt Sử V3.8 — CMS cho menu "Sách giáo khoa lịch sử" (lớp 6–12).

Mỗi bài học có 2 bản:
  * draft : bản đang biên tập trong /admin (lưu nháp không ảnh hưởng website)
  * live  : bản đang hiển thị công khai (chỉ thay đổi khi bấm "Xuất bản")
"""
from __future__ import annotations

import hashlib
import json
import re

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel, Field, field_validator

from vs_core import (DATA, SITE_URL, UPLOADS, db, decode_image_data, is_safe_url, now, read_json,
                     require_role, slugify)
from vs_render import ad_slot_html, esc, json_ld, markdown_safe, page_shell, plain_text

router = APIRouter()
CATALOG_FILE = DATA / "textbook_catalog.json"
GRADES = range(6, 13)
ID_RE = re.compile(r"^g(6|7|8|9|10|11|12)-[a-z0-9-]{1,80}$")

LESSON_FIELDS = ("id", "grade", "lesson_number", "part_number", "toc_title", "title", "slug", "part", "chapter",
                 "year", "entity_id", "summary", "content", "key_points", "review_questions", "sources",
                 "cover_image", "cover_caption", "seo_title", "meta_description", "status", "curriculum",
                 "source_url", "source_type", "toc_verified", "author")
LIGHT_FIELDS = ("id", "grade", "lesson_number", "part_number", "toc_title", "title", "slug", "part", "chapter",
                "year", "entity_id", "summary", "review_questions", "status", "curriculum", "source_url",
                "source_type", "toc_verified")


# ------------------------------------------------------------------ schema
def init_textbook() -> None:
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS textbook_lessons (
            id TEXT PRIMARY KEY,
            grade INTEGER NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            origin TEXT NOT NULL DEFAULT 'catalog',
            draft TEXT NOT NULL,
            live TEXT NOT NULL,
            live_state TEXT NOT NULL DEFAULT 'outline',
            dirty INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT DEFAULT '',
            published_at TEXT DEFAULT '',
            updated_by TEXT DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_tb_grade ON textbook_lessons(grade, sort_order);
        CREATE TABLE IF NOT EXISTS textbook_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id TEXT NOT NULL,
            action TEXT NOT NULL,
            snapshot TEXT NOT NULL,
            changed_at TEXT NOT NULL,
            changed_by TEXT DEFAULT ''
        );
        CREATE INDEX IF NOT EXISTS idx_tbv_lesson ON textbook_versions(lesson_id, id);
        CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
        """)
        count = con.execute("SELECT COUNT(*) FROM textbook_lessons").fetchone()[0]
        if count:
            return
        catalog = read_json(CATALOG_FILE, {}) or {}
        ts = now()
        for grade, items in (catalog.get("grades") or {}).items():
            for i, item in enumerate(items):
                rec = normalize(item, int(grade))
                blob = json.dumps(rec, ensure_ascii=False)
                con.execute("INSERT OR IGNORE INTO textbook_lessons (id,grade,sort_order,origin,draft,live,live_state,"
                            "updated_at) VALUES (?,?,?,?,?,?,?,?)",
                            (rec["id"], rec["grade"], (i + 1) * 10, "catalog", blob, blob, "outline", ts))
        bump_version(con)


def bump_version(con) -> None:
    con.execute("INSERT INTO kv(k,v) VALUES('textbook_rev',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v", (now(),))


def catalog_rev(con) -> str:
    row = con.execute("SELECT v FROM kv WHERE k='textbook_rev'").fetchone()
    return row[0] if row else "0"


def normalize(item: dict, grade: int | None = None) -> dict:
    rec = {k: item.get(k) for k in LESSON_FIELDS}
    rec["grade"] = int(grade or item.get("grade") or 6)
    rec["title"] = str(rec.get("title") or "").strip()
    rec["toc_title"] = str(rec.get("toc_title") or rec["title"]).strip()
    pn = rec.get("part_number")
    rec["slug"] = slugify(rec.get("slug") or (rec["title"] + (f" phan {pn}" if pn else "")))
    for k in ("part", "chapter", "summary", "content", "cover_image", "cover_caption", "seo_title",
              "meta_description", "entity_id", "curriculum", "source_url", "source_type", "author"):
        rec[k] = str(rec.get(k) or "")
    rec["status"] = str(rec.get("status") or "chờ biên tập")
    for k in ("key_points", "review_questions"):
        rec[k] = [str(x).strip() for x in (rec.get(k) or []) if str(x).strip()]
    srcs = []
    for s in rec.get("sources") or []:
        if isinstance(s, str):
            s = {"title": s, "url": s if s.startswith("https://") else ""}
        title, url = str(s.get("title") or "").strip(), str(s.get("url") or "").strip()
        if title or url:
            srcs.append({"title": title or url, "url": url if is_safe_url(url, allow_relative=False) else ""})
    rec["sources"] = srcs
    rec["toc_verified"] = bool(rec.get("toc_verified"))
    return rec


def has_content(rec: dict) -> bool:
    return len((rec.get("content") or "").strip()) >= 150


def public_url(rec: dict) -> str:
    return f"/sach-giao-khoa/lop-{rec['grade']}/{rec['slug']}"


# ------------------------------------------------------------ input models
class LessonIn(BaseModel):
    grade: int = Field(ge=6, le=12)
    title: str = Field(min_length=3, max_length=240)
    toc_title: str = Field(default="", max_length=260)
    slug: str = Field(default="", max_length=140)
    lesson_number: int | None = Field(default=None, ge=0, le=999)
    part_number: int | None = Field(default=None, ge=0, le=99)
    part: str = Field(default="", max_length=240)
    chapter: str = Field(default="", max_length=240)
    year: int | None = Field(default=None, ge=-5000, le=2100)
    entity_id: str = Field(default="", max_length=80, pattern=r"^[a-zA-Z0-9_:\-]*$")
    summary: str = Field(default="", max_length=2000)
    content: str = Field(default="", max_length=200_000)
    key_points: list[str] = Field(default_factory=list, max_length=40)
    review_questions: list[str] = Field(default_factory=list, max_length=40)
    sources: list[dict] = Field(default_factory=list, max_length=40)
    cover_image: str = Field(default="", max_length=600)
    cover_caption: str = Field(default="", max_length=400)
    seo_title: str = Field(default="", max_length=180)
    meta_description: str = Field(default="", max_length=320)
    status: str = Field(default="", max_length=60)
    curriculum: str = Field(default="", max_length=240)
    author: str = Field(default="", max_length=120)
    sort_order: int | None = Field(default=None, ge=0, le=100000)

    @field_validator("cover_image")
    @classmethod
    def _cover(cls, v: str) -> str:
        v = v.strip()
        if v and not is_safe_url(v):
            raise ValueError("Ảnh bìa phải là URL https:// hoặc /static/uploads/…")
        return v

    @field_validator("key_points", "review_questions")
    @classmethod
    def _lines(cls, v: list[str]) -> list[str]:
        return [str(x).strip()[:600] for x in v if str(x).strip()]


class ImageIn(BaseModel):
    image_data: str = Field(max_length=6_000_000)


class ImportIn(BaseModel):
    lessons: list[dict] = Field(min_length=1, max_length=500)
    overwrite: bool = False


# ------------------------------------------------------------- data access
def _row(con, lesson_id: str):
    r = con.execute("SELECT * FROM textbook_lessons WHERE id=?", (lesson_id,)).fetchone()
    if not r:
        raise HTTPException(404, "Không tìm thấy bài học")
    return r


def _admin_view(r) -> dict:
    d = json.loads(r["draft"])
    live = json.loads(r["live"])
    d["_meta"] = {"sort_order": r["sort_order"], "origin": r["origin"], "live_state": r["live_state"],
                  "dirty": bool(r["dirty"]), "updated_at": r["updated_at"], "published_at": r["published_at"],
                  "updated_by": r["updated_by"], "public_url": public_url(live), "live_title": live.get("title")}
    return d


def _snapshot(con, lesson_id: str, action: str, data: dict, who: str) -> None:
    con.execute("INSERT INTO textbook_versions (lesson_id,action,snapshot,changed_at,changed_by) VALUES (?,?,?,?,?)",
                (lesson_id, action, json.dumps(data, ensure_ascii=False), now(), who))
    # giữ tối đa 50 phiên bản mỗi bài
    con.execute("DELETE FROM textbook_versions WHERE lesson_id=? AND id NOT IN (SELECT id FROM textbook_versions "
                "WHERE lesson_id=? ORDER BY id DESC LIMIT 50)", (lesson_id, lesson_id))


def _unique_slug(con, grade: int, slug: str, lesson_id: str) -> str:
    base, n = slug, 2
    while True:
        clash = False
        for r in con.execute("SELECT id, draft, live FROM textbook_lessons WHERE grade=? AND id<>?", (grade, lesson_id)):
            if json.loads(r["live"]).get("slug") == slug or json.loads(r["draft"]).get("slug") == slug:
                clash = True
                break
        if not clash:
            return slug
        slug = f"{base}-{n}"
        n += 1


# --------------------------------------------------------------- public API
@router.get("/api/textbook/catalog")
def public_catalog(request: Request):
    with db() as con:
        rev = catalog_rev(con)
        etag = '"tb-' + hashlib.sha1(rev.encode()).hexdigest()[:16] + '"'
        if request.headers.get("if-none-match") == etag:
            return Response(status_code=304, headers={"ETag": etag})
        grades: dict[str, list] = {str(g): [] for g in GRADES}
        chapters: dict[str, list] = {str(g): [] for g in GRADES}
        for r in con.execute("SELECT * FROM textbook_lessons WHERE live_state<>'hidden' ORDER BY grade, sort_order, id"):
            live = json.loads(r["live"])
            light = {k: live.get(k) for k in LIGHT_FIELDS}
            light["has_content"] = r["live_state"] == "published" and has_content(live)
            if light["has_content"]:
                light["url"] = public_url(live)
                light["status"] = "đã có bài học · tóm tắt"
            grades[str(r["grade"])].append(light)
            ch = {"part": live.get("part", ""), "chapter": live.get("chapter", "")}
            if ch["chapter"] and ch not in chapters[str(r["grade"])]:
                chapters[str(r["grade"])].append(ch)
    body = json.dumps({"rev": rev, "grades": grades, "chapters": chapters}, ensure_ascii=False)
    return Response(body, media_type="application/json",
                    headers={"ETag": etag, "Cache-Control": "public, max-age=60, stale-while-revalidate=600"})


@router.get("/api/textbook/lessons/{lesson_id}")
def public_lesson(lesson_id: str):
    if not ID_RE.match(lesson_id):
        raise HTTPException(404, "Không tìm thấy bài học")
    with db() as con:
        r = _row(con, lesson_id)
        if r["live_state"] == "hidden":
            raise HTTPException(404, "Không tìm thấy bài học")
        live = json.loads(r["live"])
    live["has_content"] = r["live_state"] == "published" and has_content(live)
    if not live["has_content"]:
        live["content"] = ""
    else:
        live["content_html"] = markdown_safe(live["content"])
        live["url"] = public_url(live)
    return live


# ---------------------------------------------------------------- admin API
@router.get("/api/admin/textbook/lessons")
def admin_list(request: Request, grade: int | None = None, q: str = "", x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    sql, args = "SELECT * FROM textbook_lessons", []
    if grade is not None:
        sql += " WHERE grade=?"; args.append(grade)
    sql += " ORDER BY grade, sort_order, id"
    out = []
    with db() as con:
        for r in con.execute(sql, args):
            d = _admin_view(r)
            if q and q.casefold() not in (d["title"] + " " + d.get("chapter", "") + " " + d.get("toc_title", "")).casefold():
                continue
            d.pop("content", None)
            out.append(d)
    return out


@router.get("/api/admin/textbook/lessons/{lesson_id}")
def admin_get(lesson_id: str, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    with db() as con:
        return _admin_view(_row(con, lesson_id))


@router.post("/api/admin/textbook/lessons", status_code=201)
def admin_create(item: LessonIn, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, request=request)
    rec = normalize(item.model_dump(), item.grade)
    with db() as con:
        base_id = f"g{item.grade}-" + (slugify(item.slug or item.title)[:60])
        lesson_id, n = base_id, 2
        while con.execute("SELECT 1 FROM textbook_lessons WHERE id=?", (lesson_id,)).fetchone():
            lesson_id = f"{base_id}-{n}"; n += 1
        rec["id"] = lesson_id
        rec["slug"] = _unique_slug(con, item.grade, rec["slug"], lesson_id)
        rec["status"] = rec["status"] if item.status else "chờ biên tập"
        order = item.sort_order
        if order is None:
            order = (con.execute("SELECT MAX(sort_order) FROM textbook_lessons WHERE grade=?", (item.grade,)).fetchone()[0] or 0) + 10
        blob = json.dumps(rec, ensure_ascii=False)
        # bản live ban đầu là đề cương (chưa có nội dung) cho tới khi xuất bản
        outline = {**rec, "content": "", "key_points": [], "sources": [], "cover_image": ""}
        con.execute("INSERT INTO textbook_lessons (id,grade,sort_order,origin,draft,live,live_state,dirty,updated_at,"
                    "updated_by) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (lesson_id, item.grade, order, "cms", blob, json.dumps(outline, ensure_ascii=False), "hidden", 1,
                     now(), role))
        _snapshot(con, lesson_id, "create", rec, role)
        _xuat_ban(con, lesson_id, role)  # V5.9.2: tạo là xuất bản
        return _admin_view(_row(con, lesson_id))


@router.put("/api/admin/textbook/lessons/{lesson_id}")
def admin_save(lesson_id: str, item: LessonIn, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, request=request)
    with db() as con:
        r = _row(con, lesson_id)
        old = json.loads(r["draft"])
        rec = normalize({**item.model_dump(), "id": lesson_id,
                         "toc_verified": old.get("toc_verified"), "source_type": old.get("source_type"),
                         "source_url": old.get("source_url")}, r["grade"])
        if item.grade != r["grade"]:
            raise HTTPException(422, "Không đổi lớp của bài đã tạo; hãy tạo bài mới ở lớp khác.")
        rec["slug"] = _unique_slug(con, r["grade"], rec["slug"], lesson_id)
        if not item.status:
            rec["status"] = old.get("status") or "chờ biên tập"
        _snapshot(con, lesson_id, "save", old, role)
        con.execute("UPDATE textbook_lessons SET draft=?, dirty=1, updated_at=?, updated_by=?, sort_order=COALESCE(?,sort_order) "
                    "WHERE id=?", (json.dumps(rec, ensure_ascii=False), now(), role, item.sort_order, lesson_id))
        _xuat_ban(con, lesson_id, role)  # V5.9.2: lưu là xuất bản
        return _admin_view(_row(con, lesson_id))


def _xuat_ban(con, lesson_id: str, role: str) -> dict:
    """V5.9.2: đưa bản đang soạn lên bản công khai (không cần mã thẩm định, không bắt buộc nguồn)."""
    r = _row(con, lesson_id)
    d = json.loads(r["draft"])
    if not d.get("title"):
        raise HTTPException(422, "Cần có tiêu đề trước khi xuất bản.")
    state = "outline"
    if has_content(d):
        state = "published"
        d["status"] = "đã có bài học · tóm tắt"
    _snapshot(con, lesson_id, "publish", json.loads(r["live"]), role)
    ts = now()
    con.execute("UPDATE textbook_lessons SET live=?, draft=?, live_state=?, dirty=0, published_at=?, updated_at=?, "
                "updated_by=? WHERE id=?", (json.dumps(d, ensure_ascii=False), json.dumps(d, ensure_ascii=False),
                                            state, ts, ts, role, lesson_id))
    bump_version(con)
    return {"ok": True, "live_state": state, "url": public_url(d) if state == "published" else None}


@router.post("/api/admin/textbook/lessons/{lesson_id}/publish")
def admin_publish(lesson_id: str, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, request=request)
    with db() as con:
        return _xuat_ban(con, lesson_id, role)


@router.post("/api/admin/textbook/lessons/{lesson_id}/unpublish")
def admin_unpublish(lesson_id: str, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, request=request)
    with db() as con:
        r = _row(con, lesson_id)
        live = json.loads(r["live"])
        _snapshot(con, lesson_id, "unpublish", live, role)
        outline = {**live, "content": "", "key_points": [], "cover_image": "", "status": "chờ biên tập"}
        state = "hidden" if r["origin"] == "cms" else "outline"
        con.execute("UPDATE textbook_lessons SET live=?, live_state=?, dirty=1, updated_at=? WHERE id=?",
                    (json.dumps(outline, ensure_ascii=False), state, now(), lesson_id))
        bump_version(con)
        return {"ok": True, "live_state": state}


@router.delete("/api/admin/textbook/lessons/{lesson_id}")
def admin_delete(lesson_id: str, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, reviewer=True, request=request)
    with db() as con:
        r = _row(con, lesson_id)
        if r["origin"] != "cms":
            raise HTTPException(409, "Bài thuộc mục lục gốc không xóa được — hãy dùng 'Gỡ xuất bản'.")
        _snapshot(con, lesson_id, "delete", json.loads(r["draft"]), role)
        con.execute("DELETE FROM textbook_lessons WHERE id=?", (lesson_id,))
        bump_version(con)
    return {"ok": True}


@router.get("/api/admin/textbook/lessons/{lesson_id}/versions")
def admin_versions(lesson_id: str, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    with db() as con:
        rows = con.execute("SELECT id, action, changed_at, changed_by, snapshot FROM textbook_versions WHERE lesson_id=? "
                           "ORDER BY id DESC LIMIT 50", (lesson_id,)).fetchall()
    return [{"id": r["id"], "action": r["action"], "changed_at": r["changed_at"], "changed_by": r["changed_by"],
             "title": json.loads(r["snapshot"]).get("title"), "chars": len(json.loads(r["snapshot"]).get("content") or "")}
            for r in rows]


@router.post("/api/admin/textbook/lessons/{lesson_id}/restore/{version_id}")
def admin_restore(lesson_id: str, version_id: int, request: Request, x_admin_token: str | None = Header(None)):
    role = require_role(x_admin_token, request=request)
    with db() as con:
        r = _row(con, lesson_id)
        v = con.execute("SELECT snapshot FROM textbook_versions WHERE id=? AND lesson_id=?", (version_id, lesson_id)).fetchone()
        if not v:
            raise HTTPException(404, "Không có phiên bản này")
        _snapshot(con, lesson_id, "save", json.loads(r["draft"]), role)
        snap = normalize({**json.loads(v["snapshot"]), "id": lesson_id}, r["grade"])
        con.execute("UPDATE textbook_lessons SET draft=?, dirty=1, updated_at=?, updated_by=? WHERE id=?",
                    (json.dumps(snap, ensure_ascii=False), now(), role, lesson_id))
        return _admin_view(_row(con, lesson_id))


@router.post("/api/admin/textbook/upload-image")
def admin_upload(item: ImageIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    blob, ext, _ = decode_image_data(item.image_data, 3_500_000)
    name = hashlib.sha256(blob).hexdigest()[:20] + ext
    folder = UPLOADS / "sgk"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / name).write_bytes(blob)
    return {"url": f"/static/uploads/sgk/{name}"}


@router.get("/api/admin/textbook/export")
def admin_export(request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    with db() as con:
        rows = [json.loads(r["draft"]) | {"sort_order": r["sort_order"]}
                for r in con.execute("SELECT * FROM textbook_lessons ORDER BY grade, sort_order")]
    return Response(json.dumps({"version": "3.8", "lessons": rows}, ensure_ascii=False, indent=1),
                    media_type="application/json",
                    headers={"Content-Disposition": 'attachment; filename="sach-giao-khoa-export.json"'})


@router.post("/api/admin/textbook/import")
def admin_import(item: ImportIn, request: Request, x_admin_token: str | None = Header(None)):
    """Nhập JSON vào BẢN NHÁP (cần bấm Xuất bản từng bài hoặc 'Xuất bản tất cả bản nháp')."""
    role = require_role(x_admin_token, request=request)
    created, updated, skipped = [], [], []
    with db() as con:
        for i, raw in enumerate(item.lessons, 1):
            try:
                li = LessonIn(**{k: v for k, v in raw.items() if k in LessonIn.model_fields})
            except Exception as exc:  # noqa: BLE001
                skipped.append({"line": i, "reason": str(exc)[:160]}); continue
            lid = str(raw.get("id") or "")
            if lid and ID_RE.match(lid) and con.execute("SELECT 1 FROM textbook_lessons WHERE id=?", (lid,)).fetchone():
                if not item.overwrite:
                    skipped.append({"line": i, "id": lid, "reason": "Đã có (bật 'ghi đè' để cập nhật bản nháp)"}); continue
                r = _row(con, lid)
                if r["grade"] != li.grade:
                    skipped.append({"line": i, "id": lid, "reason": "Sai lớp"}); continue
                old = json.loads(r["draft"])
                rec = normalize({**old, **li.model_dump(exclude_unset=True), "id": lid}, li.grade)
                _snapshot(con, lid, "import", old, role)
                con.execute("UPDATE textbook_lessons SET draft=?, dirty=1, updated_at=?, updated_by=? WHERE id=?",
                            (json.dumps(rec, ensure_ascii=False), now(), role, lid))
                updated.append(lid)
            else:
                rec = normalize(li.model_dump(), li.grade)
                new_id = lid if lid and ID_RE.match(lid) else f"g{li.grade}-" + slugify(li.title)[:60]
                base, n = new_id, 2
                while con.execute("SELECT 1 FROM textbook_lessons WHERE id=?", (new_id,)).fetchone():
                    new_id = f"{base}-{n}"; n += 1
                rec["id"] = new_id
                rec["slug"] = _unique_slug(con, li.grade, rec["slug"], new_id)
                order = li.sort_order or (con.execute("SELECT MAX(sort_order) FROM textbook_lessons WHERE grade=?",
                                                      (li.grade,)).fetchone()[0] or 0) + 10
                outline = {**rec, "content": "", "key_points": [], "sources": [], "cover_image": ""}
                con.execute("INSERT INTO textbook_lessons (id,grade,sort_order,origin,draft,live,live_state,dirty,"
                            "updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?)",
                            (new_id, li.grade, order, "cms", json.dumps(rec, ensure_ascii=False),
                             json.dumps(outline, ensure_ascii=False), "hidden", 1, now(), role))
                created.append(new_id)
    return {"created": created, "updated": updated, "skipped": skipped}


# ------------------------------------------------------------ SEO pages
def _grade_lessons(con, grade: int):
    rows = con.execute("SELECT * FROM textbook_lessons WHERE grade=? AND live_state<>'hidden' ORDER BY sort_order, id",
                       (grade,)).fetchall()
    return [(json.loads(r["live"]), r["live_state"]) for r in rows]


def render_index(ads: dict, ads_head: str) -> str:
    with db() as con:
        counts = {g: sum(1 for d, s in _grade_lessons(con, g) if s == "published" and has_content(d)) for g in GRADES}
    items = "".join(f'<li><a href="/sach-giao-khoa/lop-{g}"><b>Lịch sử lớp {g}</b></a><br>'
                    f'<small>{counts[g]} bài học đã biên tập</small></li>' for g in GRADES)
    body = ('<div class="crumb"><a href="/">Việt Sử</a> / Sách giáo khoa</div><h1>Sách giáo khoa Lịch sử lớp 6–12</h1>'
            '<p class="lede">Bài học tóm tắt theo chương trình, gắn với dòng thời gian Việt Nam – Trung Quốc – Phương Tây.</p>'
            + ad_slot_html(ads, "article_top") + f'<ul class="lessons">{items}</ul>' + ad_slot_html(ads, "article_bottom"))
    return page_shell(title="Sách giáo khoa Lịch sử lớp 6–12 | Việt Sử",
                      description="Tổng hợp bài học Lịch sử lớp 6 đến 12: tóm tắt, ý chính, câu hỏi ôn tập và liên kết dòng thời gian.",
                      canonical=SITE_URL + "/sach-giao-khoa", body=body, ads_head=ads_head, og_type="website")


def render_grade(grade: int, ads: dict, ads_head: str) -> str:
    with db() as con:
        rows = _grade_lessons(con, grade)
    groups: list[tuple[str, list]] = []
    for d, state in rows:
        key = d.get("chapter") or d.get("part") or "Khái quát"
        if not groups or groups[-1][0] != key:
            groups.append((key, []))
        groups[-1][1].append((d, state))
    html_groups = ""
    for key, items in groups:
        lis = ""
        for d, state in items:
            if state == "published" and has_content(d):
                lis += f'<li><a href="{esc(public_url(d))}"><b>{esc(d.get("toc_title") or d["title"])}</b></a><br><small>{esc(plain_text(d.get("summary", ""), 140))}</small></li>'
            else:
                lis += f'<li><b>{esc(d.get("toc_title") or d["title"])}</b><br><small>Đang biên tập</small></li>'
        html_groups += f"<h2>{esc(key)}</h2><ul class=\"lessons\">{lis}</ul>"
    body = (f'<div class="crumb"><a href="/">Việt Sử</a> / <a href="/sach-giao-khoa">Sách giáo khoa</a> / Lớp {grade}</div>'
            f'<h1>Lịch sử lớp {grade}</h1><p class="lede">Danh sách bài học theo chương. Bài có liên kết là bài đã được biên tập đầy đủ.</p>'
            + ad_slot_html(ads, "article_top") + html_groups + ad_slot_html(ads, "article_bottom"))
    return page_shell(title=f"Lịch sử lớp {grade} – danh sách bài học | Việt Sử",
                      description=f"Mục lục và bài học tóm tắt môn Lịch sử lớp {grade}, kèm câu hỏi ôn tập và liên kết dòng thời gian.",
                      canonical=f"{SITE_URL}/sach-giao-khoa/lop-{grade}", body=body, ads_head=ads_head, og_type="website")


def render_lesson(grade: int, slug: str, ads: dict, ads_head: str) -> str | None:
    with db() as con:
        found = next(((d, s) for d, s in _grade_lessons(con, grade) if d.get("slug") == slug), None)
    if not found or found[1] != "published" or not has_content(found[0]):
        return None
    d = found[0]
    url = SITE_URL + public_url(d)
    year = d.get("year")
    chips = [f"Lớp {grade}"] + [x for x in (d.get("chapter"), d.get("part")) if x]
    if year is not None:
        chips.append(f"{abs(year)} TCN" if year < 0 else str(year))
    cover = ""
    if d.get("cover_image"):
        cover = (f'<figure><img src="{esc(d["cover_image"])}" alt="{esc(d.get("cover_caption") or d["title"])}" '
                 f'fetchpriority="high"><figcaption>{esc(d.get("cover_caption"))}</figcaption></figure>')
    keys = ""
    if d.get("key_points"):
        keys = '<div class="panel"><h2 style="margin-top:0">Ý chính cần nhớ</h2><ul>' + "".join(
            f"<li>{esc(x)}</li>" for x in d["key_points"]) + "</ul></div>"
    review = ""
    if d.get("review_questions"):
        review = '<div class="panel"><h2 style="margin-top:0">Câu hỏi ôn tập</h2><ol>' + "".join(
            f"<li>{esc(x)}</li>" for x in d["review_questions"]) + "</ol></div>"
    srcs = "".join(
        (f'<li><a href="{esc(s["url"])}" target="_blank" rel="noopener noreferrer nofollow">{esc(s["title"])}</a></li>'
         if s.get("url") else f"<li>{esc(s['title'])}</li>") for s in d.get("sources") or [])
    timeline = ""
    if year is not None:
        timeline = f'<p><a href="/#bai-hoc={esc(d["id"])}">↗ Xem bài học trên dòng thời gian</a></p>'
    content = markdown_safe(d["content"], inline_ad_after=3, ad_html=ad_slot_html(ads, "article_inline"))
    desc = d.get("meta_description") or plain_text(d.get("summary") or d["content"], 160)
    body = (f'<div class="crumb"><a href="/">Việt Sử</a> / <a href="/sach-giao-khoa">Sách giáo khoa</a> / '
            f'<a href="/sach-giao-khoa/lop-{grade}">Lớp {grade}</a></div>'
            f'<h1>{esc(d["title"])}</h1><div class="meta">' + "".join(f'<span class="chip">{esc(c)}</span>' for c in chips) + "</div>"
            f'<p class="lede">{esc(d.get("summary"))}</p>' + cover + ad_slot_html(ads, "article_top") + keys
            + f"<article>{content}</article>" + review + ad_slot_html(ads, "article_bottom")
            + (f'<div class="panel"><h2 style="margin-top:0">Nguồn tư liệu</h2><ul>{srcs}</ul>'
               '<p style="font-size:13px;color:var(--muted)">Nội dung tóm tắt do nhóm biên tập Việt Sử thực hiện, không thay thế sách giáo khoa chính thức.</p></div>')
            + timeline + f'<p class="back"><a href="/sach-giao-khoa/lop-{grade}">← Các bài lịch sử lớp {grade}</a></p>')
    schema = {"@context": "https://schema.org", "@graph": [
        {"@type": "LearningResource", "name": d["title"], "description": desc, "url": url, "inLanguage": "vi",
         "educationalLevel": f"Lớp {grade}", "learningResourceType": "Bài học",
         "author": {"@type": "Organization", "name": "Việt Sử"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Việt Sử", "item": SITE_URL + "/"},
            {"@type": "ListItem", "position": 2, "name": "Sách giáo khoa", "item": SITE_URL + "/sach-giao-khoa"},
            {"@type": "ListItem", "position": 3, "name": f"Lớp {grade}", "item": f"{SITE_URL}/sach-giao-khoa/lop-{grade}"},
            {"@type": "ListItem", "position": 4, "name": d["title"], "item": url}]}]}
    return page_shell(title=(d.get("seo_title") or d["title"]) + f" – Lịch sử {grade} | Việt Sử", description=desc,
                      canonical=url, body=body, ads_head=ads_head, schema=schema, image=d.get("cover_image") or "")


def sitemap_urls() -> list[tuple[str, str]]:
    out = [(SITE_URL + "/sach-giao-khoa", "")]
    with db() as con:
        for g in GRADES:
            out.append((f"{SITE_URL}/sach-giao-khoa/lop-{g}", ""))
        for r in con.execute("SELECT live, published_at FROM textbook_lessons WHERE live_state='published'"):
            d = json.loads(r["live"])
            if has_content(d):
                out.append((SITE_URL + public_url(d), (r["published_at"] or "")[:10]))
    return out


def register_pages(app, ads_loader, ads_head_loader):
    @app.get("/sach-giao-khoa", response_class=HTMLResponse)
    def sgk_index():
        return HTMLResponse(render_index(ads_loader(), ads_head_loader()))

    @app.get("/sach-giao-khoa/lop-{grade}", response_class=HTMLResponse)
    def sgk_grade(grade: int):
        if grade not in GRADES:
            raise HTTPException(404, "Chỉ có lớp 6–12")
        return HTMLResponse(render_grade(grade, ads_loader(), ads_head_loader()))

    @app.get("/sach-giao-khoa/lop-{grade}/{slug}", response_class=HTMLResponse)
    def sgk_lesson(grade: int, slug: str):
        if grade not in GRADES or not re.fullmatch(r"[a-z0-9-]{1,140}", slug):
            raise HTTPException(404, "Không tìm thấy bài học")
        page = render_lesson(grade, slug, ads_loader(), ads_head_loader())
        if page is None:
            raise HTTPException(404, "Bài học chưa được xuất bản")
        return HTMLResponse(page)
