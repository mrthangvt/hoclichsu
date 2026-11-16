#!/usr/bin/env python3
"""V4.7 kế thừa V4.6, nhúng hồ sơ lịch sử để file:// mở được không cần API."""
from pathlib import Path
import json
import subprocess
import sys

STATIC = Path(__file__).resolve().parents[1] / "static"

def build():
    previous = Path(__file__).with_name("build_v46.py")
    subprocess.run([sys.executable, str(previous)], check=True)
    original = STATIC / "Viet_Su_Timeline_V4.6_Offline.html"
    raw = (STATIC / "v47-periods.json").read_text(encoding="utf-8")
    data = json.loads(raw)
    assert len(data["periods"]) == 19 and len(data["categories"]) == 13
    page = original.read_text(encoding="utf-8")
    if page.count("</head>") != 1 or page.count("</body>") != 1:
        raise ValueError("Sai thẻ đóng HTML V4.6")
    page = page.replace("</head>", '<link rel="stylesheet" href="static/v47.css"></head>', 1)
    safe_json = json.dumps(data, ensure_ascii=False).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    page = page.replace("</body>", '<script type="application/json" id="v47-data">' + safe_json + '</script><script defer src="static/v47.js"></script></body>', 1)
    output = STATIC / "Viet_Su_Timeline_V4.7_Offline.html"
    output.write_text(page, encoding="utf-8")
    print("V4.7:", output)

if __name__ == "__main__":
    build()
