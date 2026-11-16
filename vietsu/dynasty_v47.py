"""Việt Sử V4.7 — nội dung triều đại biên tập trong CMS, tách khỏi dữ liệu gốc.

Lưu draft/review/published bằng JSON nguyên tử. Chỉ nội dung published
được đưa qua API public. GitHub Pages sử dụng bộ nội dung có nguồn kèm bản build.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator

from vs_core import DATA, STATIC, read_json, require_role, write_json

router = APIRouter()
STORE = DATA / "dynasty_v47_local.json"
CROSSWALK = DATA / "dynasty_crosswalk.json"
FIELDS = {"overview", "foundation", "politics", "economy", "military", "culture",
          "religion", "costume", "figures", "heritage", "events", "transition", "sources"}
ADDITIONAL = {"namviet", "bacthuoc", "vanxuan", "khuc"}
ID_RE = re.compile(r"^[a-z][a-z0-9_-]{1,49}$")


class Reference(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    url: str = Field(min_length=12, max_length=1200)

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not re.match(r"^https://[a-z0-9.-]+/", value, re.I) or any(c in value for c in '<>"\''):
            raise ValueError("Nguồn phải là HTTPS hợp lệ")
        return value


class SectionEdit(BaseModel):
    section: str = Field(min_length=4, max_length=30)
    text: str = Field(default="", max_length=14000)
    status: Literal["draft", "review", "published"] = "draft"
    references: list[Reference] = Field(default_factory=list, max_length=12)

    @field_validator("section")
    @classmethod
    def valid_section(cls, value: str) -> str:
        if value not in FIELDS:
            raise ValueError("Chuyên mục không hợp lệ")
        return value


def _available() -> dict[str, dict]:
    periods = {}
    for entry in read_json(CROSSWALK, []) or []:
        if not isinstance(entry, dict):
            continue
        ident = entry.get("id")
        if isinstance(ident, str) and ID_RE.fullmatch(ident):
            periods[ident] = {"id": ident, "name": entry.get("name", ident),
                              "start": entry.get("start"), "end": entry.get("end"),
                              "note": entry.get("note", "")}
    for ident in ADDITIONAL:
        periods.setdefault(ident, {"id": ident, "name": ident, "start": None, "end": None})
    return periods


def _store() -> dict:
    value = read_json(STORE, {}) or {}
    return value if isinstance(value, dict) else {}


@router.get("/api/v4.7/dynasties")
def public_dynasties():
    periods = []
    allowed = _available()
    for period_id, row in _store().items():
        if period_id not in allowed or not isinstance(row, dict):
            continue
        sections, refs = {}, []
        for key, section in row.get("sections", {}).items():
            if key not in FIELDS or not isinstance(section, dict) or section.get("status") != "published":
                continue
            sections[key] = {"text": str(section.get("text", "")), "reviewed": True}
            refs.extend(section.get("references", []))
        if sections:
            periods.append({"id": period_id, "sections": sections, "references": refs})
    return JSONResponse({"periods": periods},
                        headers={"Cache-Control": "no-store", "X-Robots-Tag": "noindex"})


@router.get("/api/v4.7/dynasties/admin")
def admin_dynasties(request: Request, x_admin_token: str | None = Header(default=None)):
    require_role(x_admin_token, request=request)
    return JSONResponse({"periods": list(_available().values()), "records": _store(),
                         "fields": sorted(FIELDS)}, headers={"Cache-Control": "no-store"})


@router.put("/api/v4.7/dynasties/{period_id}")
def save_section(period_id: str, edit: SectionEdit, request: Request,
                 x_admin_token: str | None = Header(default=None)):
    require_role(x_admin_token, reviewer=edit.status == "published", request=request)
    if not ID_RE.fullmatch(period_id) or period_id not in _available():
        raise HTTPException(status_code=404, detail="Không tìm thấy thời đại trong danh mục")
    if edit.status == "published" and (len(edit.text.strip()) < 120 or not edit.references):
        raise HTTPException(status_code=422, detail="Cần nội dung từ 120 ký tự và ít nhất 1 nguồn trước khi công bố")
    if edit.status == "published" and edit.section == "sources":
        raise HTTPException(status_code=422, detail="Nguồn tư liệu được lưu kèm từng chuyên mục")
    data = _store()
    era = data.setdefault(period_id, {"sections": {}})
    era["sections"][edit.section] = {
        "text": edit.text.strip(), "status": edit.status,
        "references": [x.model_dump() for x in edit.references],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    write_json(STORE, data)
    return {"period_id": period_id, "section": edit.section, "status": edit.status}


@router.get("/admin/thoi-dai")
def editor_page():
    page = STATIC / "dynasty_admin_v47.html"
    if not page.is_file():
        raise HTTPException(status_code=404, detail="Chưa có trang biên tập thời đại")
    return FileResponse(page, media_type="text/html",
                        headers={"Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow"})
