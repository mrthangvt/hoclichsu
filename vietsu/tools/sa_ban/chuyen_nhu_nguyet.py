#!/usr/bin/env python3
"""Chuyển tệp của sa bàn Như Nguyệt 1077 V1.6 (artifact "Phòng Tuyến Như Nguyệt 1077", tải ZIP qua Xuất › ZIP) vào gói
khong-gian/packs/nhu-nguyet-1077/ chạy trên bộ máy 2.1. rieng.js do tach_bo_may_2.py sinh; pack.json, sources.json viết tay.
Dùng:  python3 vietsu/tools/sa_ban/chuyen_nhu_nguyet.py <thư mục giải nén có data/ models/ nhanvat/ am/>
"""
import json, shutil, sys
from pathlib import Path
KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/nnzip/x"); DST = KG / "packs" / "nhu-nguyet-1077"
sys.path.insert(0, str(Path(__file__).parent))
from nv_sang_nvz import convert as nvz
def cp(a, b): (DST / b).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(SRC / a, DST / b)
def mini(a, b): (DST / b).parent.mkdir(parents=True, exist_ok=True); (DST / b).write_text(json.dumps(json.load(open(SRC / a, encoding="utf-8")), ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
mini("data/meta.json", "terrain/meta.json"); mini("data/inst.json", "placement.json"); mini("data/story.json", "story.json")
cp("data/height.png", "terrain/height.png"); cp("data/color.jpg", "terrain/color.jpg")
for f in ("outer.png", "co-ly.png", "co-tong.png", "huy-ly.png", "huy-tong.png"): cp("data/" + f, "props/" + f)
for f in (SRC / "models").glob("*"): cp("models/" + f.name, "units/" + f.name)
for f in sorted((SRC / "nhanvat").glob("nv_*.json")):
    data, err = nvz(json.load(open(f, encoding="utf-8")), 0.001); out = DST / "units" / (f.stem[3:] + ".nvz"); out.write_bytes(data)
    print(f"{f.name} → units/{out.name} {len(data)/1e6:.2f} MB (sai số ≤ {err*1000:.2f} mm)")
for f in (SRC / "nhanvat").glob("*.jpg"): cp("nhanvat/" + f.name, "units/" + f.name)
for f in (SRC / "am").glob("*.mp3"): cp("am/" + f.name, "audio/" + f.name)
print("Gói:", DST, round(sum(p.stat().st_size for p in DST.rglob("*") if p.is_file()) / 1e6, 1), "MB")
