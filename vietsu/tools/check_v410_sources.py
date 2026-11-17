#!/usr/bin/env python3
"""Kiểm chứng dữ liệu nguồn sử liệu V4.10, không thay đổi giao diện."""
from pathlib import Path
import json
from collections import Counter

HERE=Path(__file__).resolve().parents[1]
path=HERE/"static/v47-periods.json"
data=json.loads(path.read_text(encoding="utf8"))
periods=data["periods"]
categories={item["id"] for item in data["categories"]}
assert len(periods)==19, "Phải giữ 19 giai đoạn"
assert len(categories)==13, "Phải giữ 13 chuyên mục"
assert len({p["id"] for p in periods})==19, "ID giai đoạn bị trùng"
assert all(set(p["sections"])==categories for p in periods), "Mất chuyên mục hoặc sai ID"
assert data["source_enrichment"]["version"]=="4.10-draft", "Sai phiên bản"
assert data["source_enrichment"]["filled_sections"]==79, "Sai số đoạn đã thêm"
assert all(isinstance(p.get("sources"),list) for p in periods)
assert all(isinstance(p["sections"][k],str) and p["sections"][k].strip() for p in periods for k in categories)
catalog=[p for p in periods if any("Trần Trọng Kim, Việt Nam sử lược" in str(s.get("title")) for s in p["sources"])]
assert len(catalog)==18, f"Thiếu hoặc thừa hồ sơ có nguồn: {len(catalog)}"
for p in catalog:
    assert any("tr. PDF" in s.get("title","") for s in p["sources"] if "Việt Nam sử lược" in s.get("title","")), p["id"]
modern=next(p for p in periods if p["id"]=="hiendai")
assert not any("Việt Nam sử lược" in s.get("title","") for s in modern["sources"]), "Không ép nguồn cũ cho giai đoạn sau 1945"
assert len([p for p in periods if p["id"] in {"xichquy","vanlang","aulac","bacthuoc","trungvuong","vanxuan","ngo","dinh","tienle","ho","hautran","mac"}])==12
# Khóa bộ dựng UI: Không có v410.js / v410.css / HTML phát sinh.
assert not (HERE/"static/v410.js").exists()
assert not (HERE/"static/v410.css").exists()
assert not (HERE/"static/Viet_Su_Timeline_V4.10_Offline.html").exists()
count=Counter("đã bổ sung" if v!="Đang biên tập" else "còn chờ" for p in periods for v in p["sections"].values())
print("PASS V4.10:",len(periods),"giai đoạn,",len(categories),"chuyên mục,",len(catalog),"hồ sơ gắn nguồn,",dict(count))
