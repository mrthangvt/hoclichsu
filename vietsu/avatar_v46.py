"""Việt Sử V4.6: quản lý ảnh đại diện riêng, không sửa dữ liệu lịch sử gốc."""
from __future__ import annotations

import re
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from vs_core import DATA, STATIC, decode_image_data, read_json, require_role, write_json

router = APIRouter()
REGISTRY_FILE = DATA / "avatar_overrides_local.json"
IMAGE_DIR = STATIC / "uploads" / "avatars"
ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


class AvatarUpdate(BaseModel):
    image_data: str = Field(min_length=100, max_length=5_000_000)
    caption: str = Field(default="", max_length=240)
    credit: str = Field(default="", max_length=240)
    source_type: str = Field(default="minh-hoa", max_length=40)
    source_url: str = Field(default="", max_length=1200)
    approved: bool = False


def _validate_id(person_id: str) -> None:
    if not ID_PATTERN.fullmatch(person_id):
        raise HTTPException(422, "Mã nhân vật phải là chữ thường, số hoặc dấu gạch nối.")


def _registry() -> dict:
    value = read_json(REGISTRY_FILE, {})
    return value if isinstance(value, dict) else {}


def approved_overrides() -> dict:
    """Chỉ trả ảnh đã duyệt, tránh lộ các bản thảo quản trị."""
    return {
        key: {"url": item["url"], "approved": True,
              "caption": item.get("caption", ""), "source_type": item.get("source_type", "")}
        for key, item in _registry().items()
        if isinstance(item, dict) and item.get("approved") is True
        and isinstance(item.get("url"), str)
        and item["url"].startswith("/static/uploads/avatars/")
    }


@router.get("/api/v4.6/avatar-overrides")
def public_avatar_overrides():
    return JSONResponse({"overrides": approved_overrides()},
                        headers={"Cache-Control": "no-store", "X-Robots-Tag": "noindex"})


@router.get("/api/v4.6/avatar-admin")
def admin_avatar_list(request: Request, x_admin_token: str | None = Header(default=None)):
    require_role(x_admin_token, request=request)
    people = read_json(DATA / "historical_characters.json", []) or []
    names = [{"id": p.get("entity_id") or p.get("slug"), "name": p.get("name", "")}
             for p in people if isinstance(p, dict)]
    return JSONResponse({"records": _registry(), "people": names},
                        headers={"Cache-Control": "no-store"})


@router.put("/api/v4.6/avatars/{person_id}")
def upload_avatar(person_id: str, payload: AvatarUpdate, request: Request,
                  x_admin_token: str | None = Header(default=None)):
    require_role(x_admin_token, request=request)
    _validate_id(person_id)
    if payload.approved and not payload.credit.strip():
        raise HTTPException(422, "Ảnh muốn công bố cần ghi nguồn/tác giả.")
    if payload.source_url and not payload.source_url.startswith("https://"):
        raise HTTPException(422, "Đường dẫn nguồn phải dùng HTTPS.")
    if payload.source_type not in ("anh-tu-lieu", "tranh-phuc-dung", "minh-hoa", "ai-minh-hoa"):
        raise HTTPException(422, "Loại tư liệu không hợp lệ.")
    blob, ext, _ = decode_image_data(payload.image_data, 2_300_000)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{person_id}_{secrets.token_hex(8)}{ext}"
    path = IMAGE_DIR / filename
    path.write_bytes(blob)
    record = {
        "url": "/static/uploads/avatars/" + filename,
        "approved": payload.approved,
        "caption": payload.caption.strip(),
        "credit": payload.credit.strip(),
        "source_type": payload.source_type,
        "source_url": payload.source_url.strip(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    registry = _registry()
    registry[person_id] = record
    write_json(REGISTRY_FILE, registry)
    return JSONResponse({"id": person_id, "record": record},
                        headers={"Cache-Control": "no-store"})


@router.delete("/api/v4.6/avatars/{person_id}")
def reset_avatar(person_id: str, request: Request,
                 x_admin_token: str | None = Header(default=None)):
    require_role(x_admin_token, request=request)
    _validate_id(person_id)
    registry = _registry()
    removed = registry.pop(person_id, None)
    write_json(REGISTRY_FILE, registry)
    return {"id": person_id, "reset": removed is not None}


@router.get("/admin/avatar")
def avatar_editor():
    page = STATIC / "avatar_admin_v46.html"
    if not page.is_file():
        raise HTTPException(404, "Thiếu trang quản trị avatar.")
    return FileResponse(page, media_type="text/html",
                        headers={"Cache-Control": "no-store",
                                 "X-Robots-Tag": "noindex,nofollow"})
