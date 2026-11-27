#!/usr/bin/env python3
"""Chuyển nhân vật nướng sẵn dạng nv_*.json (base64, sa bàn Ngọc Hồi / Bạch Đằng / Như Nguyệt / Rạch Gầm)
sang tệp nhị phân nén .nvz cho bộ máy sa bàn 1.0 (docs/KHUNG_SA_BAN.md, mục 3).

.nvz = gzip( "NVZ1" + u32 độ dài đầu + JSON đầu (utf-8) + đệm 4 byte + khối dữ liệu )
- Vị trí đỉnh: lượng tử hoá lại theo bước q (mặc định 1 mm), lưu hiệu số giữa hai khung liên tiếp (int16, cộng dồn có tràn).
- Pháp tuyến: mã hoá bát diện 2 × int8, cũng lưu hiệu số giữa hai khung (int8, cộng dồn có tràn).
- Chỉ số, UV, màu đỉnh, ma trận khung (mg, mt, m) giữ nguyên độ chính xác.
Dùng:  python3 nv_sang_nvz.py vao.json ra.nvz [--q 0.001]
"""
import argparse, base64, gzip, json, struct, sys
import numpy as np

def b64(s, dt):
    return np.frombuffer(base64.b64decode(s), dt)

def oct_enc(n):
    n = n / (np.abs(n).sum(1, keepdims=True) + 1e-12)
    x, y, z = n[:, 0], n[:, 1], n[:, 2]
    sx = np.where(x >= 0, 1.0, -1.0); sy = np.where(y >= 0, 1.0, -1.0)
    ox = np.where(z < 0, (1 - np.abs(y)) * sx, x); oy = np.where(z < 0, (1 - np.abs(x)) * sy, y)
    return np.clip(np.round(np.stack([ox, oy], 1) * 127), -127, 127).astype(np.int8)

class Blob:
    def __init__(self): self.parts = []; self.off = 0
    def add(self, arr):
        b = np.ascontiguousarray(arr).tobytes(); pad = (-len(b)) % 4
        o = self.off; self.parts.append(b + b"\0" * pad); self.off += len(b) + pad
        return [o, len(b)]
    def bytes(self): return b"".join(self.parts)

def frames_block(B, pos_b64_list, nor_b64_list, q_old, q):
    """Một chuỗi khung của một phần lưới → (vị trí hiệu số, pháp tuyến hiệu số)."""
    P = np.stack([b64(s, np.int16).astype(np.float64) * q_old for s in pos_b64_list])
    Pq = np.round(P / q).astype(np.int64)
    if np.abs(Pq).max() > 32767: raise SystemExit("bước q quá nhỏ cho kích thước mô hình")
    D = np.diff(Pq, axis=0, prepend=0).astype(np.int16)           # tràn int16 được: giải bằng cộng dồn tràn
    N = np.stack([oct_enc(b64(s, np.int8).reshape(-1, 3).astype(np.float64) / 127) for s in nor_b64_list]).astype(np.int16)
    DN = np.diff(N, axis=0, prepend=0).astype(np.int8)
    return B.add(D), B.add(DN), float(np.abs(Pq * q - P).max())

def convert(j, q):
    B = Blob(); H = {"v": 1, "q": q}; err = 0.0
    as_list = lambda x: x if isinstance(x, list) else [x]
    if "idx" in j:                                                 # người: một lưới
        H["type"] = "hum"
        H["idx"] = B.add(b64(j["idx"], np.uint32 if j.get("idx32") else np.uint16)); H["idx32"] = bool(j.get("idx32"))
        H["uv"] = B.add(b64(j["uv"], np.float32))
        H["clips"] = {}
        for name, c in j["clips"].items():
            p, n, e = frames_block(B, c["pos"], c["nor"], j["q"], q); err = max(err, e)
            C = {"fps": c["fps"], "n": len(c["pos"]), "pos": p, "nor": n, "mg": B.add(np.asarray(c["mg"], np.float32))}
            if c.get("once"): C["once"] = 1
            if c.get("mt"): C["mt"] = B.add(np.asarray(c["mt"], np.float32))
            if c.get("hip") is not None: C["hip"] = c["hip"]                # Như Nguyệt: điểm hông (ngồi ngựa)
            H["clips"][name] = C
        for k, v in j.items():                                     # thông số kèm theo (h, seat, chest, side…): giữ nguyên
            if k not in ("idx", "uv", "clips", "q", "v", "idx32", "tex") and k not in H: H[k] = v
    else:                                                          # ngựa (ani: có phần cứng + ma trận m) / voi (flip)
        H["type"] = "ani" if any("m" in c for c in j["clips"].values()) else "flip"
        parts, anim_ids = [], []
        for pi, p in enumerate(j["parts"]):
            P = {}
            if p.get("tex"): P["tex"] = p["tex"][3:] if p["tex"].startswith("nv_") else p["tex"]   # ảnh màu đi kèm, bỏ tiền tố nv_
            P["idx"] = B.add(b64(p["idx"], np.uint16))
            if p.get("uv"): P["uv"] = B.add(b64(p["uv"], np.float32))
            if p.get("col"): P["col"] = B.add(b64(p["col"], np.float32))
            if p.get("rigid"):
                P["rigid"] = 1
                pos = np.round(b64(p["pos"], np.int16).astype(np.float64) * j["q"] / q).astype(np.int16); P["pos"] = B.add(pos)
                if p.get("nor"): P["nor"] = B.add(oct_enc(b64(p["nor"], np.int8).reshape(-1, 3).astype(np.float64) / 127))
            else: anim_ids.append(pi)
            parts.append(P)
        H["parts"] = parts; H["clips"] = {}
        for name, c in j["clips"].items():
            fr = [as_list(x) for x in c["pos"]]; nr = [as_list(x) for x in c["nor"]]
            C = {"fps": c["fps"], "n": len(fr), "parts": []}
            for k in range(len(anim_ids)):
                p_, n_, e = frames_block(B, [f[k] for f in fr], [f[k] for f in nr], j["q"], q); err = max(err, e)
                C["parts"].append({"pos": p_, "nor": n_})
            if "m" in c: C["m"] = B.add(np.asarray(c["m"], np.float32))
            if c.get("once"): C["once"] = 1
            H["clips"][name] = C
    hj = json.dumps(H, separators=(",", ":"), ensure_ascii=False).encode()
    head = b"NVZ1" + struct.pack("<I", len(hj)) + hj
    head += b"\0" * ((-len(head)) % 4)
    return gzip.compress(head + B.bytes(), 9, mtime=0), err

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("vao"); ap.add_argument("ra"); ap.add_argument("--q", type=float, default=0.001)
    a = ap.parse_args()
    j = json.load(open(a.vao, encoding="utf-8"))
    out, err = convert(j, a.q)
    open(a.ra, "wb").write(out)
    print(f"{a.vao} → {a.ra}: {len(out)/1e6:.2f} MB, sai số vị trí tối đa {err*1000:.2f} mm", file=sys.stderr)

if __name__ == "__main__": main()
