"""Ghép lại nguyên ZIP người dùng cung cấp và xác nhận SHA-256."""
from pathlib import Path
import hashlib, json
root=Path(__file__).resolve().parent
m=json.loads((root/'manifest.json').read_text())
b=b''.join((root/p).read_bytes() for p in m['zip_parts'])
assert hashlib.sha256(b).hexdigest()==m['zip_sha256'], 'Sai SHA-256'
out=root/m['source_zip']
out.write_bytes(b)
print('Đã khôi phục và kiểm tra:',out)
