#!/usr/bin/env python3
"""Chuyển sa bàn Ngọc Hồi – Đống Đa (bản V10, thư mục khong-gian/ngoc-hoi-dong-da/) thành gói theo khung
(khong-gian/packs/ngoc-hoi-dong-da/). Chạy lại được nhiều lần; pack.json và sources.json viết tay, không ghi đè.
Cần: python3 + numpy; node + npx (gltf-transform) để nén GLB.  Dùng:  python3 vietsu/tools/sa_ban/chuyen_ngoc_hoi.py
"""
import base64, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
SRC, DST = ROOT / "ngoc-hoi-dong-da", ROOT / "packs" / "ngoc-hoi-dong-da"
sys.path.insert(0, str(Path(__file__).parent))
from nv_sang_nvz import convert as nvz

def w_json(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

def main():
    for d in ("terrain", "units", "props", "audio"): (DST / d).mkdir(parents=True, exist_ok=True)
    # địa hình: lưới cao độ PNG 16 bit (giữ nguyên, không nén mất dữ liệu), ảnh bề mặt, dữ liệu vector
    for f in SRC.glob("h_*.png"): shutil.copy2(f, DST / "terrain" / f.name)
    for f in SRC.glob("tex_*.jpg"): shutil.copy2(f, DST / "terrain" / f.name)
    w_json(DST / "terrain" / "dia-hinh.json", json.load(open(SRC / "sa_ban_data.json", encoding="utf-8")))
    # kịch bản, bố trí quân
    w_json(DST / "story.json", json.load(open(SRC / "story.json", encoding="utf-8")))
    w_json(DST / "placement.json", json.load(open(SRC / "quan.json", encoding="utf-8")))
    # nhân vật nướng sẵn → .nvz; ảnh màu đi kèm
    for f in sorted(SRC.glob("nv_*.json")):
        data, err = nvz(json.load(open(f, encoding="utf-8")), 0.001)
        out = DST / "units" / (f.stem[3:] + ".nvz"); out.write_bytes(data)
        print(f"{f.name} → units/{out.name}  {len(data)/1e6:.2f} MB  (sai số ≤ {err*1000:.2f} mm)")
    for f in SRC.glob("nv_*.jpg"): shutil.copy2(f, DST / "units" / f.name[3:])
    for f in SRC.glob("co_*.jpg"): shutil.copy2(f, DST / "props" / f.name)
    # mô hình glTF (base64 trong JSON) → .glb nén meshopt
    for stem, out in (("m_quangtrung", "units/quang-trung.glb"), ("m_tammoc", "props/tam-moc.glb")):
        with tempfile.TemporaryDirectory() as td:
            raw = Path(td) / "in.glb"; raw.write_bytes(base64.b64decode(json.load(open(SRC / f"{stem}.json"))["b64"]))
            r = subprocess.run(["npx", "--yes", "@gltf-transform/cli@4.5.1", "meshopt", str(raw), str(DST / out)], capture_output=True, text=True)
            if r.returncode: print(r.stderr); sys.exit(1)
        print(f"{stem}.json → {out}  {(DST / out).stat().st_size/1e6:.2f} MB")
    # âm thanh
    for f in (SRC / "am").glob("*.mp3"): shutil.copy2(f, DST / "audio" / f.name)
    shutil.copy2(SRC / "voice_ngochoi.mp3", DST / "audio" / "voice.mp3")
    tot = sum(p.stat().st_size for p in DST.rglob("*") if p.is_file())
    print(f"Gói: {DST}  tổng {tot/1e6:.1f} MB")

if __name__ == "__main__": main()
