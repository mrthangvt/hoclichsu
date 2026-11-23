"""Căn lời dẫn (phụ đề episodes.json) với bản thu đầy đủ, cắt lại từng câu cho khớp.
Ra: cut.json [{id, n, a, b, match}] (giây trong full.mp3)"""
import json, re, difflib, subprocess, unicodedata, numpy as np
EP = json.load(open('/home/claude/src/data/episodes.json'))
F = json.load(open('/home/claude/asr/full.json'))['full.mp3']
W = F['words']; aw = [w['w'].lower() for w in W]; at = [w['t'] for w in W]
SR = 16000
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', '/home/claude/asr/full.mp3', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'])
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
        if not tx or tx.startswith('Nhạc:'): continue
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

out = []
for k, (eid, n, t) in enumerate(lines):
    a, b = cuts[k], cuts[k + 1]
    # bỏ bớt lặng đầu/cuối: giữ 0,1 s trước tiếng đầu, 0,3 s sau tiếng cuối
    th = .008; A = int(a * SR); Bn = int(b * SR); seg = env[A:Bn]; idx = np.where(seg > th)[0]
    fw = min([t for t in at if t >= a] or [a]); lw = max([t for t in at if t < b] or [b])
    if len(idx):
        pw = max([t for t in at if t < a] or [-1]); nw = min([t for t in at if t >= b] or [DUR + 1])
        a2 = max(pw + .4, a - .3, min((A + idx[0]) / SR - .15, fw - .2)); b2 = min(nw - .12, max(min(b, (A + idx[-1]) / SR + .35), lw + .55))
    else: a2, b2 = a, b
    words = ' '.join(aw[first[k]:last[k] + 1]) if first[k] is not None else ''
    out.append({'id': eid, 'n': n, 'a': round(a2, 3), 'b': round(b2, 3), 'match': round(cnt[k] / max(1, len(t)), 2),
                'asr': words[:90]})
json.dump(out, open('/home/claude/asr/cut.json', 'w'), ensure_ascii=False, indent=0)
for o in out: print(f"{o['id'][:12]:12} {o['n']:2} {o['a']:7.2f}-{o['b']:7.2f} ({o['b']-o['a']:5.1f}s) m={o['match']}  {o['asr'][:70]}")
