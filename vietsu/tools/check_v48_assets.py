#!/usr/bin/env python3
"""Đối chiếu ảnh V4.8: 24 Avatar V4.5 + 17 hình V4.3, không tạo file giả."""
from pathlib import Path
import argparse
import json
import re

STATIC=Path(__file__).resolve().parents[1]/"static"
CATEGORIES=("emperor","official","warrior","queen","female-warrior","woman")
SIZES=(64,128,256,512)
V45=[f"avatar-v45/{cat}-{n}.webp" for cat in CATEGORIES for n in SIZES]

def report():
    script=(STATIC/"v43.js").read_text(encoding="utf8")
    # 15 tên đang được mã V4.3 trực tiếp tham chiếu; bộ xuất bản V4.3 gốc gồm 17.
    v43_referenced=sorted(set(re.findall(r"(?<![\w-])(?:hat|outfit|hcm)-[a-z0-9-]+\.webp",script)))
    current=sorted(f.name for f in (STATIC/"v43").glob("*.webp")) if (STATIC/"v43").is_dir() else []
    missing45=[x for x in V45 if not (STATIC/x).is_file()]
    missing43=[x for x in v43_referenced if x not in current]
    return {
        "v45_expected":len(V45),"v45_found":len(V45)-len(missing45),
        "v45_missing":missing45,"v43_expected_total":17,
        "v43_found":len(current),"v43_referenced":v43_referenced,
        "v43_missing_referenced":missing43,
        "ready":not missing45 and not missing43 and len(current)>=17,
        "note":"Hai ảnh V4.3 không được tham chiếu trực tiếp trong JS; cần xác minh với ZIP gốc V4.3."
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--strict",action="store_true",help="Thoát mã 1 nếu thiếu tài nguyên ảnh")
    args=p.parse_args()
    data=report()
    print(json.dumps(data,ensure_ascii=False,indent=2))
    if args.strict and not data["ready"]:
        raise SystemExit("Chưa thể build/deploy V4.8: còn thiếu ảnh của V4.3/V4.5.")
if __name__=="__main__":
    main()
