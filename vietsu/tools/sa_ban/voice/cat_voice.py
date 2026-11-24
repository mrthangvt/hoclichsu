"""Cắt câu đọc lặp trong voice (anh Thắng 24/11 19:22) và dời mốc nhận dạng tương ứng.
python3 cat_voice.py <asr gốc.json> <asr ra.json>   — đoạn cắt theo giây audio GỐC; voice.mp3 cắt bằng ffmpeg cùng các đoạn này:
  ffmpeg -i voice_goc.mp3 -filter_complex "[0]atrim=0:264.42…[a];[0]atrim=265.95:403.10…[b];[0]atrim=404.32…[c];…concat" voice.mp3
  0:00–0:02,62  tạp âm đầu bản thu (anh Thắng V1.2: bắt đầu đúng lúc cất lời) · 4:24,4–4:26,0  "đó là những chiếc máy bay" (lặp, giữ lần đọc sau)
  6:43,1–6:44,3  "và Sài Gòn" (lặp, giữ lần đọc sau)
Mốc từ nhận dạng sớm hơn âm thanh khoảng 0,4 s nên khoảng bỏ từ lùi tương ứng."""
import json, sys
CAT = [(0.0, 2.62, -1, -1), (264.42, 265.95, 264.2, 265.9), (403.10, 404.32, 403.0, 404.2)]   # (audio từ, audio tới, bỏ từ nhận dạng từ, tới); đoạn đầu: không bỏ từ (nhận dạng gán nhầm 2 từ đầu vào tạp âm)
a = json.load(open(sys.argv[1]))
def doi(t):
    s = 0.0
    for a0, a1, w0, w1 in CAT:
        if w1 < 0: s += min(a1 - a0, t)                                          # đoạn đầu: từ nằm trong tạp âm dồn về giây 0
        elif t >= w1: s += a1 - a0
    return round(max(0.0, t - s), 3)
tu = [w for w in a['tu'] if not any(w0 <= w[1] < w1 for _, _, w0, w1 in CAT)]
a['tu'] = [[w[0], doi(w[1]), doi(w[2])] + w[3:] for w in tu]
a['cat'] = [doi(t) for t in a['cat']]; a['dai'] = round(a['dai'] - sum(a1 - a0 for a0, a1, _, _ in CAT), 3)
a['ghiChu'] = 'Đã cắt 2 câu lặp (tools/sa_ban/voice/cat_voice.py), dài ' + str(a['dai']) + ' s'
json.dump(a, open(sys.argv[2], 'w'), ensure_ascii=False)
print('bỏ', sum(1 for w in json.load(open(sys.argv[1]))['tu']) - len(tu), 'từ; dài', a['dai'])
