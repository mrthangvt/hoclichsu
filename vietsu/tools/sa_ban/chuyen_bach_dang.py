#!/usr/bin/env python3
"""Chuyển tệp của sa bàn Bạch Đằng 938 (V1.2; V1.3 có lời dẫn thu âm voice.json + am/loi-dan.mp3) (artifact "Sa bàn Bạch Đằng 938" + web_v2 trên máy anh Thắng) vào gói
khong-gian/packs/bach-dang-938/ chạy trên bộ máy 2.0. rieng.js do tach_bo_may_2.py sinh; pack.json, sources.json viết tay.
Dùng:  python3 vietsu/tools/sa_ban/chuyen_bach_dang.py <thư mục nguồn có data/ models/ nhanvat/ am/ nhac/>
"""
import json, shutil, sys
from pathlib import Path
KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/bdsrc"); DST = KG / "packs" / "bach-dang-938"
sys.path.insert(0, str(Path(__file__).parent))
from nv_sang_nvz import convert as nvz
def cp(a, b): (DST / b).parent.mkdir(parents=True, exist_ok=True); shutil.copy2(SRC / a, DST / b)
def mini(a, b): (DST / b).parent.mkdir(parents=True, exist_ok=True); (DST / b).write_text(json.dumps(json.load(open(SRC / a, encoding="utf-8")), ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
mini("data/meta.json", "terrain/meta.json"); mini("data/inst.json", "placement.json"); mini("data/story.json", "story.json")
cp("data/height.png", "terrain/height.png"); cp("data/color.jpg", "terrain/color.jpg")
for f in ("co-trieu-ngo.png", "kieu-cong-tien.jpg", "duong-dinh-nghe.jpg"): cp("data/" + f, "props/" + f)
if (SRC / "data/voice.json").exists(): mini("data/voice.json", "props/voice.json")
for f in (SRC / "models").glob("*"): cp("models/" + f.name, "units/" + f.name)
for f in sorted((SRC / "nhanvat").glob("nv_*.json")):
    data, err = nvz(json.load(open(f, encoding="utf-8")), 0.001); out = DST / "units" / (f.stem[3:] + ".nvz"); out.write_bytes(data)
    print(f"{f.name} → units/{out.name} {len(data)/1e6:.2f} MB (sai số ≤ {err*1000:.2f} mm)")
for f in (SRC / "nhanvat").glob("*.jpg"): cp("nhanvat/" + f.name, "units/" + f.name)
for f in (SRC / "am").glob("*.mp3"): cp("am/" + f.name, "audio/" + f.name)
for f in (SRC / "nhac").glob("*.mp3"): cp("nhac/" + f.name, "audio/nhac/" + f.name)
print("Gói:", DST, round(sum(p.stat().st_size for p in DST.rglob("*") if p.is_file()) / 1e6, 1), "MB")
