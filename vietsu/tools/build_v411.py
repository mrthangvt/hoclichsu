#!/usr/bin/env python3
"""V4.11: kế thừa UI V4.9/V4.6, chỉ gắn menu Bộ đề ôn Sử được duyệt."""
from pathlib import Path
import subprocess
import sys
STATIC=Path(__file__).resolve().parents[1]/"static"
HERE=Path(__file__).resolve().parent

def build():
    subprocess.run([sys.executable,str(HERE/"build_v49.py")],check=True)
    subprocess.run([sys.executable,str(HERE/"check_v411_exam.py")],check=True)
    source=(STATIC/"Viet_Su_Timeline_V4.9_Offline.html").read_text(encoding="utf-8")
    marker='<script defer src="static/v411.js"></script>'
    if source.count("</body>")!=1:raise ValueError("V4.9 phải có 1 thẻ </body>")
    if marker in source:raise ValueError("V4.9 không được chứa module V4.11")
    result=source.replace("</body>",marker+"</body>",1)
    output=STATIC/"Viet_Su_Timeline_V4.11_Offline.html"
    output.write_text(result,encoding="utf-8")
    if result.replace(marker,"",1)!=source:
        output.unlink(missing_ok=True)
        raise AssertionError("Bản V4.11 khác V4.9 ngoài script menu: vi phạm khóa UI V4.6")
    print("V4.11: giữ nguyên V4.9/V4.6, chỉ thêm nút Bộ đề ôn Sử (script v411.js).")
if __name__=="__main__":build()
