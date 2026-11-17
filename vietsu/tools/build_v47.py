#!/usr/bin/env python3
"""V4.7 – KHÓA GIAO DIỆN: HTML người dùng nhìn thấy phải giống hệt V4.6.

V4.7 bổ sung dữ liệu/CMS, không được tự động tiêm CSS/JS, đổi tab hay tạo
một giao diện xem thử riêng. Chỉ sửa UI khi có phê duyệt rõ ràng của chủ dự án.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys

STATIC = Path(__file__).resolve().parents[1] / "static"
DATA = STATIC / "v47-periods.json"


def validate_content():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    if len(data.get("periods", [])) != 19 or len(data.get("categories", [])) != 13:
        raise ValueError("V4.7 cần đủ 19 thời đại và 13 chuyên mục nội dung.")
    return data


def freeze_v46(source: Path, destination: Path):
    """Sao chép NGUYÊN VẸN V4.6, so khớp SHA-256 để chống đổi giao diện."""
    if not source.is_file():
        raise FileNotFoundError(f"Chưa có bản V4.6: {source}")
    if source.resolve() == destination.resolve():
        raise ValueError("Không được ghi đè bản V4.6.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
    checksum = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
    expected, actual = checksum(source), checksum(destination)
    if expected != actual:
        destination.unlink(missing_ok=True)
        raise RuntimeError("Giao diện V4.7 khác V4.6: đã chặn xuất bản!")
    return expected


def build():
    validate_content()
    # V4.6 có thể chưa dựng được khi thiếu bộ ảnh nguồn: báo lỗi và giữ bản cũ.
    subprocess.run([sys.executable, str(Path(__file__).with_name("build_v46.py"))], check=True)
    original = STATIC / "Viet_Su_Timeline_V4.6_Offline.html"
    output = STATIC / "Viet_Su_Timeline_V4.7_Offline.html"
    digest = freeze_v46(original, output)
    print(f"V4.7: GIAO DIỆN KHÓA theo V4.6; SHA256 trùng khớp {digest}.")
    print(f"Dữ liệu/CMS V4.7 tách riêng, không chỉnh trang người dùng: {output}")


if __name__ == "__main__":
    build()
