#!/bin/bash
# Sao lưu cơ sở dữ liệu SQLite đang dùng cùng các tệp nội dung và ảnh tải lên.
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PYTHON'
from pathlib import Path
import sqlite3, shutil, zipfile, datetime, tempfile
root=Path.cwd()
backups=root/'backups'
backups.mkdir(exist_ok=True)
name='vietsu_backup_'+datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
out=backups/(name+'.zip')
with tempfile.TemporaryDirectory(prefix='vietsu_backup_') as td:
    temp=Path(td)
    (temp/'data').mkdir()
    db=root/'data'/'vietsucms.sqlite3'
    if db.exists():
        src=sqlite3.connect(str(db))
        dst=sqlite3.connect(str(temp/'data'/'vietsucms.sqlite3'))
        try: src.backup(dst)
        finally: dst.close(); src.close()
    for f in (root/'data').glob('*.json'):
        shutil.copy2(f,temp/'data'/f.name)
    uploads=root/'static'/'uploads'
    if uploads.exists(): shutil.copytree(uploads,temp/'static'/'uploads')
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for p in temp.rglob('*'):
            if p.is_file(): z.write(p,p.relative_to(temp))
print('Đã sao lưu:',out)
PYTHON
