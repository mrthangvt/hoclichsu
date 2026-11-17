#!/usr/bin/env python3
"""Build the Việt Sử V4.2 page from the trusted V4.1 page + versioned UI modules.

Leaves the V4.1 input untouched; no database, uploads, or secrets are touched.
Works with both FastAPI at / and GitHub Pages at /hoclichsu/.
"""
from pathlib import Path

STATIC = Path(__file__).resolve().parents[1] / "static"
SOURCE = STATIC / "Viet_Su_Timeline_V4.1_Offline.html"
OUTPUT = STATIC / "Viet_Su_Timeline_V4.2_Offline.html"

def build():
    for name in ("v42.css", "v42.js"):
        if not (STATIC / name).is_file():
            raise FileNotFoundError(STATIC / name)
    source = SOURCE.read_text(encoding="utf-8")
    if source.count("</head>") != 1 or source.count("</body>") != 1:
        raise ValueError("HTML gốc không đúng cấu trúc; không ghi file.")
    result = source.replace("</head>", '<link rel="stylesheet" href="static/v42.css"></head>', 1)
    result = result.replace("</body>", '<script defer src="static/v42.js"></script></body>', 1)
    result = result.replace("Bản lưu ngoại tuyến · Dữ liệu được lưu tại thời điểm xuất bản V4.1", "Bản lưu ngoại tuyến · Dữ liệu được lưu tại thời điểm xuất bản V4.2")
    OUTPUT.write_text(result, encoding="utf-8")
    print("Đã tạo", OUTPUT, "với CSS/JS V4.2 và dữ liệu V4.1; bản gốc giữ nguyên.")

if __name__ == "__main__":
    build()
