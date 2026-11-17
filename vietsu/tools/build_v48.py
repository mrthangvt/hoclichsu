#!/usr/bin/env python3
"""V4.8 chỉ bổ sung tài nguyên; khóa HTML hoàn toàn theo V4.6/V4.7."""
import hashlib
from pathlib import Path
import shutil
import subprocess
import sys

STATIC=Path(__file__).resolve().parents[1]/"static"
HERE=Path(__file__).resolve().parent

def build():
    # Không xuất bản V4.8 nếu thiếu bất kỳ asset bắt buộc.
    subprocess.run([sys.executable,str(HERE/"check_v48_assets.py"),"--strict"],check=True)
    subprocess.run([sys.executable,str(HERE/"build_v47.py")],check=True)
    source=STATIC/"Viet_Su_Timeline_V4.7_Offline.html"
    dest=STATIC/"Viet_Su_Timeline_V4.8_Offline.html"
    shutil.copyfile(source,dest)
    digest=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
    if digest(source)!=digest(dest):
        dest.unlink(missing_ok=True)
        raise RuntimeError("KHÓA GIAO DIỆN: V4.8 không được khác V4.7/V4.6.")
    print("V4.8 đã build: giao diện trùng 100% V4.6, SHA256",digest(dest))

if __name__=="__main__":build()
