#!/usr/bin/env python3
"""Chuyển sa bàn Rạch Gầm – Xoài Mút (bản V2.0, khong-gian/rach-gam-xoai-mut/) thành gói theo khung
(khong-gian/packs/rach-gam-xoai-mut/), chạy trên bộ máy 1.1. pack.json, rieng.js, sources.json viết tay, không ghi đè.
Dùng:  python3 vietsu/tools/sa_ban/chuyen_rach_gam.py
"""
import base64, json, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
SRC, DST = ROOT / "rach-gam-xoai-mut", ROOT / "packs" / "rach-gam-xoai-mut"
sys.path.insert(0, str(Path(__file__).parent))
from nv_sang_nvz import convert as nvz

GLB = {"m_thuyen_ts": "units/thuyen-ts.glb", "m_thuyen_xiem": "units/thuyen-xiem.glb", "m_dai_thuyen_ts": "units/dai-thuyen-ts.glb",
       "m_thuyen_dan": "units/thuyen-dan.glb", "m_buom_xiem": "units/buom-xiem.glb", "m_buom_xiem_rach": "units/buom-xiem-rach.glb",
       "m_buom_daits": "units/buom-daits.glb", "m_buom_daits_rach": "units/buom-daits-rach.glb",
       "m_cay_dua": "props/cay-dua.glb", "m_nha_la": "props/nha-la.glb"}

def w_json(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

def main():
    for d in ("terrain", "units", "props", "audio"): (DST / d).mkdir(parents=True, exist_ok=True)
    shutil.copy2(SRC / "h_main.png", DST / "terrain" / "h_main.png")
    shutil.copy2(SRC / "tex_main.jpg", DST / "terrain" / "tex_main.jpg")
    w_json(DST / "terrain" / "dia-hinh.json", json.load(open(SRC / "sa_ban_data.json", encoding="utf-8")))
    S = json.load(open(SRC / "story.json", encoding="utf-8"))
    S["voice"]["file"] = "audio/voice.mp3"
    w_json(DST / "story.json", S)
    w_json(DST / "placement.json", json.load(open(SRC / "quan.json", encoding="utf-8")))
    for f in sorted(SRC.glob("nv_*.json")):
        data, err = nvz(json.load(open(f, encoding="utf-8")), 0.001)
        out = DST / "units" / (f.stem[3:] + ".nvz"); out.write_bytes(data)
        print(f"{f.name} → units/{out.name}  {len(data)/1e6:.2f} MB  (sai số ≤ {err*1000:.2f} mm)")
    for f in SRC.glob("nv_*.jpg"): shutil.copy2(f, DST / "units" / f.name[3:])
    for stem, out in GLB.items():
        with tempfile.TemporaryDirectory() as td:
            raw = Path(td) / "in.glb"; raw.write_bytes(base64.b64decode(json.load(open(SRC / f"{stem}.json"))["b64"]))
            r = subprocess.run(["npx", "--yes", "@gltf-transform/cli@4.5.1", "meshopt", str(raw), str(DST / out)], capture_output=True, text=True)
            if r.returncode: print(r.stderr); sys.exit(1)
        print(f"{stem}.json → {out}  {(DST / out).stat().st_size/1e6:.2f} MB")
    for f in (SRC / "am").glob("*.mp3"): shutil.copy2(f, DST / "audio" / f.name)
    tot = sum(p.stat().st_size for p in DST.rglob("*") if p.is_file())
    print(f"Gói: {DST}  tổng {tot/1e6:.1f} MB")

if __name__ == "__main__": main()
