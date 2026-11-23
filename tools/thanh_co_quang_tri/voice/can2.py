"""Căn lời dẫn (phụ đề episodes.json) với bản thu đầy đủ, cắt lại từng câu cho khớp.
Ra: cut.json [{id, n, a, b, match}] (giây trong full.mp3)"""
import json, re, difflib, subprocess, unicodedata, numpy as np
EP = json.load(open('/home/claude/src/data/episodes.json'))
F = json.load(open('/home/claude/asr/full2.json'))['full2.mp3']
W = F['words']; aw = [w['w'].lower() for w in W]; at = [w['t'] for w in W]
SR = 16000
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', '/home/claude/asr/full2.mp3', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'])
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
win = int(.02 * SR); env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, 'same'))
DUR = len(x) / SR

def toks(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = re.sub(r'[–—–—,.;:!?“”"‘’…()·]', ' ', s)
    return s.split()

lines = []   # (epid, n, tokens)
for e in EP['episodes']:
    for n, l in enumerate(e.get('lines', [])):
        tx = l['text']
        if not tx or tx.startswith('Nhạc'): continue
        lines.append((e['id'], n + 1, toks(tx)))
sub = []; owner = []
for k, (_, _, t) in enumerate(lines):
    sub += t; owner += [k] * len(t)
sm = difflib.SequenceMatcher(None, sub, aw, autojunk=False)
first = [None] * len(lines); last = [None] * len(lines); cnt = [0] * len(lines)
for a, b, size in sm.get_matching_blocks():
    for i in range(size):
        k = owner[a + i]; j = b + i; cnt[k] += 1
        if first[k] is None or j < first[k]: first[k] = j
        if last[k] is None or j > last[k]: last[k] = j
# vị trí khớp đầu/cuối trong câu phụ đề: số từ phụ đề chưa khớp ở đầu/cuối câu
def lead_unmatched(k):
    """số từ đầu câu phụ đề không khớp (ví dụ con số '4', '30/3/1972')"""
    matched = set()
    for a, b, size in sm.get_matching_blocks():
        for i in range(size): matched.add(a + i)
    s0 = owner.index(k); s1 = len(owner) - owner[::-1].index(k)
    lu = 0
    for i in range(s0, s1):
        if i in matched: break
        lu += 1
    tu = 0
    for i in range(s1 - 1, s0 - 1, -1):
        if i in matched: break
        tu += 1
    return lu, tu
LU = [lead_unmatched(k) for k in range(len(lines))]

def quiet_point(t0, t1):
    """điểm năng lượng thấp nhất (cửa sổ 120 ms) trong [t0, t1]"""
    a, b = int(t0 * SR), int(t1 * SR)
    if b - a < int(.05 * SR): return (t0 + t1) / 2
    seg = env[a:b]; w = int(.12 * SR); s = np.convolve(seg, np.ones(w) / w, 'same')
    return (a + int(np.argmin(s))) / SR

cuts = [0.0]
for k in range(len(lines) - 1):
    i0, i1 = last[k], first[k + 1]
    # ứng viên: các khoảng giữa hai từ ASR liên tiếp từ i0 tới i1
    lo, hi = i0, i1
    if LU[k + 1][0] > 0 and LU[k][1] == 0: hi = i0 + 1          # chữ chưa khớp thuộc câu sau → cắt ngay sau từ cuối câu trước
    elif LU[k][1] > 0 and LU[k + 1][0] == 0: lo = i1 - 1        # thuộc câu trước → cắt ngay trước từ đầu câu sau
    best = None
    for j in range(lo, max(lo + 1, hi)):
        t0 = at[j] + .12; t1 = at[j + 1]
        if t1 - t0 <= 0: continue
        c = quiet_point(t0, t1); q = env[int(c * SR) - 800:int(c * SR) + 800].mean()
        sc = (t1 - t0) - q * 40
        if best is None or sc > best[0]: best = (sc, c)
    cuts.append(best[1] if best else (at[i0] + at[i1]) / 2)
cuts.append(DUR)

# --- tinh chỉnh: dời mỗi chỗ cắt vào giữa khoảng lặng thật (năng lượng), vì mốc từ của nhận dạng có thể lệch 0,3–1 s ---
TH = .0105; W50 = int(.05 * SR)
e50 = np.array([np.sqrt((x[i:i + W50] ** 2).mean()) for i in range(0, len(x) - W50, W50)])
def runs(t0, t1, TH=TH):
    i0, i1 = max(0, int(t0 / .05)), min(len(e50), int(t1 / .05)); r = []; s0 = None
    for i in range(i0, i1):
        q = e50[i] < TH
        if q and s0 is None: s0 = i
        if not q and s0 is not None: r.append((s0 * .05, i * .05)); s0 = None
    if s0 is not None: r.append((s0 * .05, i1 * .05))
    return r
bounds = []   # (cuối câu trước, đầu câu sau)
for k in range(1, len(cuts) - 1):
    c = cuts[k]; R = []
    for th2 in (TH, .02, .035):
        R = [r for r in runs(c - 1.6, c + 1.6, th2) if r[1] - r[0] >= .2]
        if R: break
    if R:
        best = max(R, key=lambda r: (r[1] - r[0]) - .35 * abs((r[0] + r[1]) / 2 - c)); L = best[1] - best[0]
        bounds.append((best[0] + min(.45, L * .55), best[1] - min(.3, L * .4)))
    else: bounds.append((c, c)); print('KHÔNG THẤY KHOẢNG LẶNG', lines[k][0], lines[k][1], c)
# đầu câu đầu tiên / cuối câu cuối: theo năng lượng
sp = np.where(e50 >= TH)[0]; first_on = sp[0] * .05; last_off = (sp[-1] + 1) * .05
starts = [max(0, first_on - .15)] + [b[1] for b in bounds]; ends = [b[0] for b in bounds] + [min(DUR, last_off + .4)]
def onset(a, b):
    i0, i1 = int(a / .05), int(b / .05); q = [i for i in range(i0, i1) if e50[i] >= .02]
    return (q[0] * .05, (q[-1] + 1) * .05) if q else (a, b)
for k in range(len(starts)):
    on, off = onset(starts[k], ends[k]); starts[k] = max(starts[k], on - .3); ends[k] = min(ends[k], max(off + .5, ends[k] - 2))
for k in range(len(starts)):   # đuôi câu: giữ ít nhất 0,45 s sau tiếng cuối nếu còn chỗ trước câu sau
    on, off = onset(starts[k], ends[k]); nxt = starts[k + 1] - .03 if k + 1 < len(starts) else DUR
    if ends[k] < off + .45: ends[k] = max(ends[k], min(nxt, off + .45))
out = []
for k, (eid, n, t) in enumerate(lines):
    words = ' '.join(aw[first[k]:last[k] + 1]) if first[k] is not None else ''
    out.append({'id': eid, 'n': n, 'a': round(starts[k], 3), 'b': round(ends[k], 3), 'match': round(cnt[k] / max(1, len(t)), 2), 'asr': words[:90]})
json.dump(out, open('/home/claude/asr/cut2.json', 'w'), ensure_ascii=False, indent=0)
for o in out: print(f"{o['id'][:12]:12} {o['n']:2} {o['a']:7.2f}-{o['b']:7.2f} ({o['b']-o['a']:5.1f}s) m={o['match']}  {o['asr'][:60]}")
