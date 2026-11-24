"""Soát lỗi "chú thích // nuốt mã" (bài học sa bàn lớn, KHUNG_SA_BAN §10 mục 1): tìm dòng có `//` mà phần sau trông như mã JS.
python3 vietsu/tools/sa_ban/soat_chu_thich.py <tệp.js>…   — in các dòng đáng ngờ; không có gì = sạch."""
import re, sys
MA = re.compile(r"(\bconst \w+ =|\blet \w+ =|\breturn\b[^.]*;|\w+\([^)]*\);\s*$|\w+\.\w+ = [^;]+;|\bif \(.+\) \{|\bfor \(.+\) \{|\}\s*\)\s*;\s*$)")
for f in sys.argv[1:]:
    for i, l in enumerate(open(f, encoding='utf-8'), 1):
        k = 0
        while True:
            k = l.find('//', k)
            if k < 0: break
            if l[k - 1:k] == ':' or l.count("'", 0, k) % 2 or l.count('"', 0, k) % 2 or l.count('`', 0, k) % 2: k += 2; continue   # http://, trong chuỗi
            if MA.search(l[k + 2:]): print(f'{f}:{i}: {l[k:k + 140].rstrip()}')
            break
