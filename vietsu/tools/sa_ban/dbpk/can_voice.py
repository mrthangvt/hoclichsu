"""Căn voice Điện Biên Phủ trên không: so chuỗi từ nhận dạng (asr.json) với lời dẫn 12 cảnh (KICH_BAN_CLAUDE_12_CANH.md).
Ra can.json: mỗi cảnh danh sách câu [giây đầu, giây cuối, câu], tỉ lệ khớp."""
import json, re, sys, difflib
KB, ASR, OUT = sys.argv[1:4]
md = open(KB, encoding='utf-8').read()
CANH = []
for m in re.finditer(r'^### (C\d\d) — (.+?)\n(.*?)(?=^### |^## GHI CHÚ)', md, re.S | re.M):
    id_, ten, body = m.group(1), m.group(2).strip(), m.group(3)
    vo = body.split('**Lời dẫn (nguyên văn để đồng bộ):**', 1)[1]
    cau = []
    for para in [p.strip() for p in vo.split('\n\n') if p.strip()]:
        cau += [c.strip() for c in re.split(r'(?<=[.!?…])\s+(?=[A-ZÀ-Ỹ"“0-9])', para) if c.strip()]
    hinh = re.search(r'\*\*Hình ảnh/camera:\*\* (.+)', body).group(1)
    dia = re.search(r'\*\*Địa bàn:\*\* (.+?)\.?\n', body).group(1)
    CANH.append({'id': id_, 'ten': ten, 'cau': cau, 'hinh': hinh, 'dia': dia})
assert len(CANH) == 12, len(CANH)
SO = 'không một hai ba bốn năm sáu bảy tám chín'.split()
def doc(n):
    n = int(n)
    if n < 10: return SO[n]
    if n < 20: return 'mười' + ('' if n == 10 else ' ' + ('lăm' if n % 10 == 5 else SO[n % 10]))
    if n < 100:
        c, d = divmod(n, 10); s = SO[c] + ' mươi'
        return s + ('' if d == 0 else ' ' + {1: 'mốt', 4: 'tư', 5: 'lăm'}.get(d, SO[d]))
    if n < 1000:
        c, r = divmod(n, 100); s = SO[c] + ' trăm'
        return s + ('' if r == 0 else (' linh ' + SO[r] if r < 10 else ' ' + doc(r)))
    c, r = divmod(n, 1000); s = doc(c) + ' ngàn'
    return s + ('' if r == 0 else (' không trăm ' + doc(r) if r < 100 else ' ' + doc(r)))
def norm(s):
    s = s.lower().replace('nghìn', 'ngàn').replace('-', ' ')
    s = re.sub(r'\d+', lambda m: ' ' + doc(m.group()) + ' ', s)
    return [w for w in re.sub(r'[^\wÀ-ỹ]+', ' ', s).split() if w]
A = json.load(open(ASR)); TU = A['tu']
AW = [w.lower().replace('nghìn', 'ngàn') for w, a, b in TU]
SW, VT = [], []
for k, c in enumerate(CANH):
    for j, cau in enumerate(c['cau']):
        w = norm(cau); SW += w; VT += [(k, j)] * len(w)
sm = difflib.SequenceMatcher(None, SW, AW, autojunk=False)
TG = [None] * len(SW)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for d in range(i2 - i1): TG[i1 + d] = (TU[j1 + d][1], TU[j1 + d][2])
    elif op == 'replace':
        for d in range(i2 - i1):
            a = j1 + d * (j2 - j1) // (i2 - i1); b = max(a, j1 + (d + 1) * (j2 - j1) // (i2 - i1) - 1); TG[i1 + d] = (TU[a][1], TU[b][2])
khop = sum(b.size for b in sm.get_matching_blocks()) / len(SW)
for i in range(len(TG)):
    if TG[i] is None:
        a = next((TG[j][1] for j in range(i - 1, -1, -1) if TG[j]), 0.0); b = next((TG[j][0] for j in range(i + 1, len(TG)) if TG[j]), a)
        TG[i] = (a, b) if b > a else (a, a + 0.2)
# khớp từng câu
khopCau = {}
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for i in range(i1, i2): khopCau[VT[i]] = khopCau.get(VT[i], 0) + 1
ra = []
for k, c in enumerate(CANH):
    L = []
    for j, cau in enumerate(c['cau']):
        ii = [i for i, v in enumerate(VT) if v == (k, j)]
        L.append([round(TG[ii[0]][0], 2), round(TG[ii[-1]][1], 2), cau, round(khopCau.get((k, j), 0) / len(ii), 2)])
    ra.append({**c, 'cau': L})
json.dump({'khop': round(khop, 4), 'dai': A['dai'], 'canh': ra}, open(OUT, 'w'), ensure_ascii=False, indent=1)
print('khớp', round(khop * 100, 1), '%')
for c in ra:
    kem = [(x[2][:40], x[3]) for x in c['cau'] if x[3] < 0.5]
    print(c['id'], c['cau'][0][0], '→', c['cau'][-1][1], len(c['cau']), 'câu', 'kém:', kem)
