#!/usr/bin/env python3
"""Tạo giao diện V4.4 từ V4.3, giữ nguyên dữ liệu và bản HTML trước đó."""
from pathlib import Path
import subprocess
import sys

STATIC = Path(__file__).resolve().parents[1] / "static"

def build():
    tool = Path(__file__).with_name("build_v43.py")
    if not tool.is_file():
        raise FileNotFoundError("Chưa có tools/build_v43.py")
    subprocess.run([sys.executable, str(tool)], check=True)

    source = STATIC / "Viet_Su_Timeline_V4.3_Offline.html"
    script = STATIC / "v44.js"
    if not script.is_file():
        raise FileNotFoundError(script)
    html = source.read_text(encoding="utf-8")
    if html.count("</body>") != 1:
        raise ValueError("V4.3 HTML không có đúng một thẻ body đóng")
    html = html.replace("</body>", '<script defer src="static/v44.js"></script></body>', 1)
    target = STATIC / "Viet_Su_Timeline_V4.4_Offline.html"
    target.write_text(html, encoding="utf-8")
    print("Đã tạo", target)

if __name__ == "__main__":
    build()
