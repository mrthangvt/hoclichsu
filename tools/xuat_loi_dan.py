#!/usr/bin/env python3
"""Xuất lời dẫn để lồng tiếng và cập nhật danh sách tệp giọng đọc.

1) Ghi docs/loi-dan/loi_dan.csv: mỗi dòng = một câu phụ đề, kèm TÊN TỆP cần thu (vd s05-thach-han-03.mp3),
   giây bắt đầu và THỜI LƯỢNG TỐI ĐA (đến câu kế tiếp) để giọng đọc không đè sang câu sau.
2) Quét <sa bàn>/audio/voice/*.mp3 và ghi audio/voice/index.json — sa bàn chỉ phát những tệp có trong danh sách,
   câu nào chưa có tệp thì dùng giọng đọc tiếng Việt của thiết bị.
Chạy: python3 tools/xuat_loi_dan.py
"""
import csv, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
SB = ROOT / 'vietsu' / 'static' / 'khong-gian' / 'thanh-co-quang-tri'
d = json.loads((SB / 'data' / 'episodes.json').read_text())
out = ROOT / 'docs' / 'loi-dan'; out.mkdir(parents=True, exist_ok=True)
rows = []
for e in d['episodes']:
    L = e.get('lines') or []
    for i, l in enumerate(L):
        if not l['text'].strip(): continue
        nxt = L[i + 1]['t'] if i + 1 < len(L) else e['duration_sec']
        rows.append([f"{e['id']}-{i + 1:02d}.mp3", e['sequence'], e['title'], l['t'], round(nxt - l['t'], 1), l['text']])
with open(out / 'loi_dan.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['ten_tep', 'canh', 'ten_canh', 'giay_bat_dau', 'thoi_luong_toi_da_giay', 'loi_dan']); w.writerows(rows)
vo = SB / 'audio' / 'voice'; vo.mkdir(parents=True, exist_ok=True)
files = sorted(p.name for p in vo.glob('*.mp3'))
(vo / 'index.json').write_text(json.dumps(files, ensure_ascii=False))
print(f'{len(rows)} câu → {out / "loi_dan.csv"}; {len(files)} tệp giọng đọc trong audio/voice/')
