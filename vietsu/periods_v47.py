"""V4.7: CMS hồ sơ thời đại với nháp riêng và API công khai chỉ trả bản đã duyệt."""
from __future__ import annotations
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from vs_core import DATA, STATIC, read_json, require_role, write_json

router = APIRouter()
PUBLIC = STATIC / "v47-periods.json"
OVERRIDES = DATA / "v47_period_overrides_local.json"
ID = re.compile(r"^[a-z0-9][a-z0-9_-]{0,60}$")
CATEGORIES = {"overview","context","territory","state","economy","military","foreign","law","culture","religion","education","people","heritage"}

class ProfileUpdate(BaseModel):
    category: str = Field(min_length=2, max_length=40)
    content: str = Field(min_length=1,max_length=5000)
    source_title: str = Field(default="",max_length=280)
    source_url: str = Field(default="",max_length=1200)
    approved: bool = False

def base():
    value = read_json(PUBLIC,{})
    return value if isinstance(value,dict) else {}

def overrides():
    value = read_json(OVERRIDES,{})
    return value if isinstance(value,dict) else {}

def _validate(period_id: str, category: str):
    if not ID.fullmatch(period_id):
        raise HTTPException(422,"ID không hợp lệ.")
    if category not in CATEGORIES:
        raise HTTPException(422,"Chuyên mục không hợp lệ.")
    if period_id not in {p["id"] for p in base().get("periods",[])}:
        raise HTTPException(404,"Chưa có thời đại này.")

@router.get("/api/v4.7/period-profiles")
def get_public_profiles():
    d = base()
    draft = overrides()
    for p in d.get("periods",[]):
        for category, row in draft.get(p["id"],{}).items():
            if category in CATEGORIES and isinstance(row,dict) and row.get("approved") is True:
                p["sections"][category] = row["content"]
                source = {"title": row.get("source_title",""),"url":row.get("source_url","")}
                if source["title"] and source not in p.get("sources",[]):
                    p.setdefault("sources",[]).append(source)
    return JSONResponse(d,headers={"Cache-Control":"no-store"})

@router.get("/api/v4.7/period-admin")
def get_admin_profiles(request: Request,x_admin_token: str | None = Header(None)):
    require_role(x_admin_token,request=request)
    return JSONResponse({"public":base(),"overrides":overrides()},headers={"Cache-Control":"no-store"})

@router.put("/api/v4.7/periods/{period_id}")
def upsert_period(period_id: str,payload: ProfileUpdate,request: Request,
                  x_admin_token: str | None = Header(None)):
    require_role(x_admin_token,request=request)
    _validate(period_id,payload.category)
    if payload.source_url and not payload.source_url.startswith("https://"):
        raise HTTPException(422,"Nguồn URL phải dùng HTTPS.")
    if payload.approved and not payload.source_title.strip():
        raise HTTPException(422,"Nội dung xuất bản cần khai báo nguồn tư liệu.")
    d = overrides()
    d.setdefault(period_id,{})[payload.category] = {
        "content":payload.content.strip(),
        "source_title":payload.source_title.strip(),
        "source_url":payload.source_url.strip(),
        "approved":payload.approved,
        "updated_at":datetime.now(timezone.utc).isoformat()
    }
    write_json(OVERRIDES,d)
    return {"ok":True,"period_id":period_id,"category":payload.category,"approved":payload.approved}

@router.get("/admin/periods")
def editor():
    page=STATIC/"periods_admin_v47.html"
    if not page.is_file():
        raise HTTPException(404,"Thiếu giao diện biên tập V4.7")
    return FileResponse(page,headers={"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"})
