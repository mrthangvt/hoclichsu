#!/usr/bin/env python3
"""Kiểm tra một gói sa bàn theo khung (docs/KHUNG_SA_BAN.md mục 3, 5).

- pack.json có đủ trường bắt buộc, đúng dải phiên bản bộ máy.
- Mọi tệp gói nhắc tới đều có thật.
- Mỗi loại quân trong placement.json có khai báo trong pack.json › units (và ngược lại báo loại thừa).
- Quy tắc phe: cờ lấy theo phe của loại quân; mỗi phe trong sides phải có ảnh cờ nếu có nhóm cầm cờ.
- Ước lượng dung lượng tải lần đầu (đã nén gzip, không tính âm thanh) so với ngân sách 15 MB:
  bộ máy + three.js + pack.json + địa hình + kịch bản + bố trí + loại quân xuất hiện ở 2 cảnh đầu.

Dùng:  python3 vietsu/tools/sa_ban/kiem_tra_goi.py ngoc-hoi-dong-da   (hoặc đường dẫn thư mục gói)
Trả mã 1 nếu có lỗi.
"""
import gzip, json, re, sys
from pathlib import Path

KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
BAT_BUOC = ["id", "version", "engine", "kind", "title", "period", "year", "label", "terrain", "units", "placement"]

def gz(p: Path) -> int:
    b = p.read_bytes()
    if b[:2] == b"\x1f\x8b" or p.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".glb", ".ktx2", ".mp3", ".nvz"): return len(b)
    return len(gzip.compress(b, 6))

def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else "ngoc-hoi-dong-da"
    D = Path(arg) if Path(arg).is_dir() else KG / "packs" / arg
    loi, canh = [], []
    P = json.loads((D / "pack.json").read_text(encoding="utf-8"))
    for k in BAT_BUOC:
        if k not in P: loi.append(f"pack.json thiếu trường '{k}'")
    if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", P.get("id", "")): loi.append("id gói phải là chữ thường không dấu, gạch nối")
    if P.get("id") != D.name: loi.append(f"id '{P.get('id')}' khác tên thư mục '{D.name}'")
    eng = re.match(r"^\^?(\d+)", str(P.get("engine", "")))
    if not eng or not (KG / "engine").glob(f"{eng.group(1)}.*"): loi.append("không có bộ máy khớp " + str(P.get("engine")))

    can = []                                                      # tệp gói nhắc tới
    T = P.get("terrain", {})
    for k in ("data", "height", "image"): can.append(T.get(k))
    data = json.loads((D / T["data"]).read_text(encoding="utf-8")) if T.get("data") and (D / T["data"]).exists() else {}
    for p in (data.get("meta", {}).get("patches") or []):
        can += [T["patchHeight"].replace("{name}", p["name"]), T["patchImage"].replace("{name}", p["name"])]
    can += [P.get("story", "story.json"), P.get("placement"), P.get("sources", "sources.json")]
    for s in P.get("sides", []): can.append(s.get("flag"))
    for k, u in P.get("units", {}).items(): can += [u.get("file"), u.get("image"), u.get("glb")]
    for h in P.get("heroes", []): can.append(h.get("model"))
    A = P.get("audio", {})
    can.append(A.get("voice"))
    for n in set(A.get("beds", [])) | set(A.get("oneShots", [])) | {v[0] for v in A.get("layers", {}).values()}:
        can.append(A.get("dir", "audio/") + n + ".mp3")
    for f in filter(None, can):
        if not (D / f).exists(): loi.append("thiếu tệp " + f)

    Q = json.loads((D / P["placement"]).read_text(encoding="utf-8")) if P.get("placement") and (D / P["placement"]).exists() else {"groups": []}
    U = P.get("units", {})
    dung = {g["kind"] for g in Q["groups"]}
    for k in dung - set(U): loi.append(f"placement dùng loại quân '{k}' chưa khai báo trong pack.json › units")
    for k in set(U) - dung: canh.append(f"loại quân '{k}' khai báo nhưng không nhóm nào dùng")
    for k, u in U.items():
        if "side" not in u: loi.append(f"units.{k} thiếu 'side' (quy tắc phe: cờ, huy hiệu lấy theo phe)")
        elif u["side"] >= len(P.get("sides", [])): loi.append(f"units.{k}.side = {u['side']} không có trong sides")
    for g in Q["groups"]:
        if g.get("co"):
            s = U.get(g["kind"], {}).get("side", 0)
            if not (P.get("sides") or [{}])[s:s + 1] or not P["sides"][s].get("flag"):
                loi.append(f"nhóm {g['id']} cầm cờ nhưng phe {s} chưa có ảnh cờ")

    # tải lần đầu
    first = {}
    for g in Q["groups"]:
        ks = [int(x) for x in (g.get("sc") or {})]
        if ks: first[g["kind"]] = min(first.get(g["kind"], 99), min(ks))
        r = U.get(g["kind"], {}).get("rider")
        if r and ks: first[r["kind"]] = min(first.get(r["kind"], 99), min(ks))
    dau = [f for f in can[:3 + 2 * len(data.get("meta", {}).get("patches") or [])] if f] + ["pack.json", P.get("story", "story.json"), P["placement"]]
    dau += [s["flag"] for s in P.get("sides", []) if s.get("flag")]
    for k, u in U.items():
        if first.get(k, 99) <= 1: dau += [x for x in (u.get("file"), u.get("image"), u.get("glb")) if x]
    for h in P.get("heroes", []):
        ks = [int(x) for x in (Q.get(h.get("placement"), {}) or {})]
        if ks and min(ks) <= 1: dau.append(h["model"])
    E = KG / "engine" / (eng.group(1) + ".0.0" if eng else "1.0.0")
    eng_files = [E / "sa-ban.js", E / "khung.js", E / "sa-ban.css", E / "vendor/three/three.module.min.js"] + list((E / "vendor/three/addons").rglob("*.js"))
    tong_eng = sum(gz(p) for p in eng_files if p.exists())
    tong_goi = sum(gz(D / f) for f in dict.fromkeys(dau) if (D / f).exists())
    tong = (tong_eng + tong_goi) / 1e6
    ns = (P.get("budget") or {}).get("firstLoadMB", 15)
    tat_ca = sum(gz(p) for p in D.rglob("*") if p.is_file() and p.suffix != ".mp3") / 1e6
    am = sum(p.stat().st_size for p in D.rglob("*.mp3")) / 1e6

    print(f"Gói {P.get('id')} {P.get('version')} · bộ máy {P.get('engine')}")
    print(f"  Tải lần đầu (gzip, không tính âm thanh): {tong:.1f} MB  (bộ máy {tong_eng/1e6:.1f} + gói {tong_goi/1e6:.1f}) · ngân sách {ns} MB")
    print(f"  Toàn gói (gzip, không tính âm thanh): {tat_ca:.1f} MB · âm thanh {am:.1f} MB")
    if tong > ns: loi.append(f"tải lần đầu {tong:.1f} MB vượt ngân sách {ns} MB")
    for c in canh: print("  ⚠", c)
    for l in loi: print("  ✗", l)
    if not loi: print("  ✓ Gói hợp lệ")
    sys.exit(1 if loi else 0)

if __name__ == "__main__": main()
