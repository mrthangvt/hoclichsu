"""Học Lịch Sử V3.8 — cấu hình Google AdSense (bật/tắt từ trang quản trị, không cần sửa mã)."""
from __future__ import annotations

import html
import json
import re

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field

from vs_core import DATA, read_json, require_role, site_is_public, write_json

ADS_FILE = DATA / "ads_config.json"

# Vị trí quảng cáo đã chừa sẵn trong giao diện (tên hiển thị cho trang quản trị).
AD_POSITIONS = {
    "home_top": "Trang chủ – dưới phần giới thiệu",
    "timeline_mid": "Dòng thời gian – giữa trang",
    "timeline_bottom": "Dòng thời gian – cuối trang",
    "hcm_bottom": "Chủ tịch Hồ Chí Minh – cuối trang",
    "school_top": "Sách giáo khoa – dưới thanh chọn lớp",
    "school_bottom": "Sách giáo khoa – cuối danh sách bài",
    "characters_bottom": "Nhân vật lịch sử – cuối trang",
    "article_top": "Trang bài học/bài viết – đầu bài",
    "article_inline": "Trang bài học/bài viết – giữa bài",
    "article_bottom": "Trang bài học/bài viết – cuối bài",
}

DEFAULT = {"enabled": False, "client": "", "auto_ads": False, "test_mode": False, "preview": False,
           "slots": {k: "" for k in AD_POSITIONS}, "ads_txt_extra": ""}

CLIENT_RE = re.compile(r"^ca-pub-\d{10,20}$")
SLOT_RE = re.compile(r"^\d{6,20}$")

router = APIRouter()


def load_ads() -> dict:
    cfg = read_json(ADS_FILE, {}) or {}
    out = {**DEFAULT, **{k: v for k, v in cfg.items() if k in DEFAULT}}
    out["slots"] = {k: str((cfg.get("slots") or {}).get(k, "")) for k in AD_POSITIONS}
    out["active"] = bool(out["enabled"] and CLIENT_RE.match(out["client"] or ""))
    # Chế độ xem trước chỉ hiển thị khung giữ chỗ, không gọi Google.
    if out["preview"] and not out["active"]:
        out["active"] = True
        out["client"] = out["client"] if CLIENT_RE.match(out["client"] or "") else ""
        out["preview_only"] = True
    return out


def public_ads_config() -> dict:
    """Phần cấu hình an toàn để nhúng vào trang (không chứa gì bí mật)."""
    a = load_ads()
    if not a["active"]:
        return {"enabled": False}
    return {"enabled": True, "client": a["client"], "test": a["test_mode"], "preview": a["preview"],
            "previewOnly": bool(a.get("preview_only")), "auto": a["auto_ads"],
            "slots": {k: v for k, v in a["slots"].items() if v} if not a.get("preview_only") else {}}


def ads_head_html() -> str:
    a = load_ads()
    cfg = public_ads_config()
    tag = "<script>window.VS_ADS=" + json.dumps(cfg, ensure_ascii=False).replace("<", "\\u003c") + "</script>"
    if a["active"] and not a.get("preview_only") and a["client"]:
        tag += ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='
                + html.escape(a["client"], quote=True) + '" crossorigin="anonymous"></script>')
    return tag


def ads_enabled_live() -> bool:
    a = load_ads()
    return bool(a["active"] and not a.get("preview_only"))


class AdsIn(BaseModel):
    enabled: bool = False
    client: str = Field(default="", max_length=40)
    auto_ads: bool = False
    test_mode: bool = False
    preview: bool = False
    slots: dict[str, str] = Field(default_factory=dict)
    ads_txt_extra: str = Field(default="", max_length=4000)


@router.get("/api/admin/ads")
def get_ads(request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    a = load_ads()
    return {**{k: a[k] for k in DEFAULT}, "positions": AD_POSITIONS, "site_public": site_is_public()}


@router.put("/api/admin/ads")
def put_ads(item: AdsIn, request: Request, x_admin_token: str | None = Header(None)):
    require_role(x_admin_token, request=request)
    client = item.client.strip()
    if client and not CLIENT_RE.match(client):
        raise HTTPException(422, "Mã nhà xuất bản phải có dạng ca-pub-1234567890123456")
    if item.enabled and not client:
        raise HTTPException(422, "Cần nhập mã ca-pub trước khi bật quảng cáo")
    slots = {}
    for k in AD_POSITIONS:
        v = str(item.slots.get(k, "")).strip()
        if v and not SLOT_RE.match(v):
            raise HTTPException(422, f"Mã slot cho '{AD_POSITIONS[k]}' chỉ gồm chữ số")
        slots[k] = v
    extra = "\n".join(line.strip() for line in item.ads_txt_extra.splitlines()
                      if line.strip() and re.match(r"^[\w.\-]+,\s*[\w\-]+,\s*(DIRECT|RESELLER)(,\s*\w+)?$", line.strip()))
    data = {"enabled": item.enabled, "client": client, "auto_ads": item.auto_ads, "test_mode": item.test_mode,
            "preview": item.preview, "slots": slots, "ads_txt_extra": extra}
    write_json(ADS_FILE, data)
    return {**data, "positions": AD_POSITIONS}


@router.get("/ads.txt")
def ads_txt():
    a = load_ads()
    lines = []
    if CLIENT_RE.match(a.get("client") or ""):
        lines.append(f"google.com, {a['client'].replace('ca-', '', 1)}, DIRECT, f08c47fec0942fa0")
    if a.get("ads_txt_extra"):
        lines.extend(a["ads_txt_extra"].splitlines())
    body = "\n".join(lines) + "\n" if lines else "# Chưa cấu hình AdSense\n"
    return Response(body, media_type="text/plain", headers={"Cache-Control": "public, max-age=3600"})
