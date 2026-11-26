# Khớp lời dẫn (kịch bản, theo cảnh) với kết quả nhận dạng -> mốc từng câu, thời lượng cảnh, phụ đề.
import re, json, difflib, unicodedata
KB = open('/mnt/user-data/uploads/TranDaNang-1858/KICH_BAN_CLAUDE_12_CANH_60_SHOT.md', encoding='utf-8').read()
asr = json.load(open('asr.json'))
W = asr['words']; DUR = asr['dur']

so = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
def doc3(n, dau):
    t, c, d = n // 100, n // 10 % 10, n % 10; r = []
    if t or not dau: r += [so[t], 'trăm']
    if c == 0 and d: r += (['linh'] if (t or not dau) else []) + [so[d]]; return r
    if c == 1: r += ['mười']
    elif c: r += [so[c], 'mươi']
    if d: r += ['mốt' if d == 1 and c > 1 else ('lăm' if d == 5 and c else so[d])]
    return r
def doc(n):
    if n < 1000: return doc3(n, True)
    return doc3(n // 1000, True) + ['nghìn'] + (doc3(n % 1000, False) if n % 1000 else [])
def norm_words(s):
    s = re.sub(r'\d+', lambda m: ' ' + ' '.join(doc(int(m.group()))) + ' ', s)
    s = s.lower().replace('ngàn', 'nghìn')
    s = re.sub(r"[^\wÀ-ỹ]+", ' ', s)
    return s.split()

# lời dẫn từng cảnh
scenes = []
for m in re.finditer(r'## (C\d\d) – (.+?)\n.*?### Lời dẫn voice\n(.*?)### Camera', KB, re.S):
    sents = [x.strip() for x in m.group(3).split('\n') if x.strip()]
    scenes.append({'id': m.group(1), 'title': m.group(2).strip(), 'sents': sents})
assert len(scenes) == 12
ref = []  # (cảnh, câu, từ)
for si, sc in enumerate(scenes):
    for ci, s in enumerate(sc['sents']):
        for w in norm_words(s): ref.append((si, ci, w))
hyp = [w[0].lower().replace('ngàn', 'nghìn') for w in W]
sm = difflib.SequenceMatcher(None, [r[2] for r in ref], hyp, autojunk=False)
t_of = [None] * len(ref); nm = 0
for a, b, n in sm.get_matching_blocks():
    for k in range(n): t_of[a + k] = W[b + k][1]; nm += 1
print('khớp %.1f%% số từ' % (100 * nm / len(ref)))
# mốc câu: đầu = từ khớp đầu tiên (trừ bù theo vị trí), cuối = từ khớp cuối + 0,35 s
out = []
for si, sc in enumerate(scenes):
    rows = []
    for ci, s in enumerate(sc['sents']):
        idx = [k for k, r in enumerate(ref) if r[0] == si and r[1] == ci]
        ts = [(k, t_of[k]) for k in idx if t_of[k] is not None]
        rate = len(ts) / max(1, len(idx))
        rows.append({'s': s, 'k0': idx[0], 'k1': idx[-1], 'ts': ts, 'rate': rate})
    out.append(rows)
# nội suy mốc: âm tiết ~0,22 s
def t_start(r):
    k, t = r['ts'][0]; return t - (k - r['k0']) * 0.22
def t_end(r):
    k, t = r['ts'][-1]; return t + (r['k1'] - k) * 0.22 + 0.3
res = []
for si, rows in enumerate(out):
    subs = []
    for r in rows:
        if not r['ts']: print('KHÔNG KHỚP', scenes[si]['id'], r['s']); continue
        if r['rate'] < 0.5: print('khớp thấp %.0f%%' % (100 * r['rate']), scenes[si]['id'], r['s'])
        subs.append([round(max(0, t_start(r)), 2), round(t_end(r), 2), r['s']])
    res.append({'id': scenes[si]['id'], 'title': scenes[si]['title'], 'subs': subs})
# ranh giới cảnh: giữa câu cuối cảnh trước và câu đầu cảnh sau
for i, sc in enumerate(res):
    sc['t0'] = 0.0 if i == 0 else round((res[i - 1]['subs'][-1][1] + sc['subs'][0][0]) / 2, 2)
for i, sc in enumerate(res):
    sc['t1'] = res[i + 1]['t0'] if i < 11 else round(DUR, 2)
    sc['dur'] = round(sc['t1'] - sc['t0'], 2)
    print(sc['id'], sc['t0'], sc['t1'], sc['dur'], len(sc['subs']))
# phụ đề không chồng nhau
for sc in res:
    for a, b in zip(sc['subs'], sc['subs'][1:]):
        if a[1] > b[0]: a[1] = b[0] - 0.05
json.dump(res, open('voice_moc.json', 'w'), ensure_ascii=False, indent=1)
