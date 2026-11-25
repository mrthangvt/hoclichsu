"""Dựng story.json + voice.mp3 của sa bàn Khe Sanh 1968 theo bản voice anh Thắng làm (25/11/2026, hai tệp: Hồi 1 và Hồi 2 – Kết).
python3 dung_story_khe_sanh.py <goc.wav> <asr.json> <thư mục gói khe-sanh-1968>
- goc.wav: hai tệp voice nối liền (tệp 1 + 0,6 s lặng + tệp 2); asr.json: asr_onnx.py chạy trên goc.wav.
- Lời đọc: docs/du-lieu/khe-sanh-1968_loi_doc_voice.md (bản Docs "Kịch bản voice"; số viết bằng chữ). Voice đọc cả tên hồi.
- Voice là đồng hồ chính: mốc từng từ = so chuỗi từ nhận dạng với lời đọc (difflib); phụ đề lấy câu chữ của story (số viết bằng số),
  mỗi từ của story gắn với từ lời đọc tương ứng (so chuỗi lần hai).
- Bản thu đọc liền giữa các hồi (lặng ~0,4 s) → chèn LANG giây lặng trước tên mỗi hồi để đổi cảnh / đổi tầng có nhịp thở (đã báo anh Thắng).
- Cú máy: giữ thứ tự, dời theo câu đọc — vị trí cú máy trong bản cũ (ước theo số chữ) → vị trí chữ đó trong voice.
  scene.ban_do: [[giây cũ trong hồi, giây voice]] để mã dàn cảnh đổi các mốc "H(id).t0 + n" (KS.tv)."""
import json, re, sys, difflib, subprocess
from pathlib import Path
GOC, ASR, GOI = sys.argv[1], sys.argv[2], Path(sys.argv[3])
R = Path(__file__).resolve().parents[3]
CU = json.loads((Path(__file__).parent / 'khe_sanh_story_truoc_voice.json').read_text())
MD = (R.parent / 'docs/du-lieu/khe-sanh-1968_loi_doc_voice.md').read_text()
A = json.loads(Path(ASR).read_text()); TU = A['tu']
DAU, LANG = 0.8, 1.2                                                     # lặng đầu phim; lặng chèn trước tên mỗi hồi (giây)
norm = lambda s: [w for w in re.sub(r'[^\wÀ-ỹ]+', ' ', s.lower().replace('-', ' ')).split() if w]
SO = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười', 'mười một']
TEN_DOC = {'Đường 9': 'Đường Chín', '21 tháng 1': 'hai mươi mốt tháng một', '1968': 'một nghìn chín trăm sáu mươi tám', 'Pegasus': 'Pê-ga-xớt'}
# ---- lời đọc theo hồi (bỏ dòng tiêu đề **…**); tên hồi đọc: "Hồi N. <tên>" / "Kết. <tên>"
khoi = re.split(r'\*\*(.+?)\*\*', MD); BAI = [khoi[i + 1] for i in range(1, len(khoi), 2)]
assert len(BAI) == len(CU['scenes']) == 12
SW, VT = [], []                                                         # từ lời đọc; (hồi, 'ten' | 'loi')
for k, (sc, bai) in enumerate(zip(CU['scenes'], BAI)):
    ten = sc['ten']
    for a, b in TEN_DOC.items(): ten = ten.replace(a, b)
    td = norm(('Kết ' if sc['id'] == 'H12' else f'Hồi {SO[k + 1]} ') + ('Không gian trưng bày khí tài' if sc['id'] == 'H12' else ten))
    SW += td; VT += [(k, 'ten')] * len(td); w = norm(bai); SW += w; VT += [(k, 'loi')] * len(w)
AW = [w.lower() for w, a, b in TU]
sm = difflib.SequenceMatcher(None, SW, AW, autojunk=False)
TG = [None] * len(SW)                                                   # (giây đầu, giây cuối) trong goc.wav
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for d in range(i2 - i1): TG[i1 + d] = (TU[j1 + d][1], TU[j1 + d][2])
    elif op == 'replace':
        for d in range(i2 - i1):
            a = j1 + d * (j2 - j1) // (i2 - i1); b = max(a, j1 + (d + 1) * (j2 - j1) // (i2 - i1) - 1); TG[i1 + d] = (TU[a][1], TU[b][2])
khop = sum(b.size for b in sm.get_matching_blocks())
for i in range(len(TG)):                                                # từ nhận dạng sót: nội suy giữa hai từ có mốc
    if TG[i] is None:
        a = next((TG[j][1] for j in range(i - 1, -1, -1) if TG[j]), 0.0); b = next((TG[j][0] for j in range(i + 1, len(TG)) if TG[j]), a)
        TG[i] = (a, b) if b > a else (a, a + 0.2)
# ---- chèn lặng trước tên hồi 2…Kết: cắt ở giữa khoảng lặng giữa từ cuối hồi trước và từ đầu tên hồi
dau_ten = [next(i for i, v in enumerate(VT) if v == (k, 'ten')) for k in range(12)]
CAT = [round((TG[i - 1][1] + TG[i][0]) / 2, 3) for i in dau_ten[1:]]
def doi(t): return round(t + DAU + LANG * sum(1 for c in CAT if t >= c), 3)
TG = [(doi(a), doi(b)) for a, b in TG]
mp3 = GOI / 'audio/voice.mp3'
if GOC != '-':
    seg = [0.0] + CAT + [A['dai']]
    f = ''.join(f'[0]atrim={a}:{b},asetpts=PTS-STARTPTS[s{i}];' for i, (a, b) in enumerate(zip(seg, seg[1:])))
    f += f'anullsrc=r=24000:cl=mono,atrim=0:{DAU}[l0];' + ''.join(f'anullsrc=r=24000:cl=mono,atrim=0:{LANG}[l{i + 1}];' for i in range(len(CAT)))
    f += '[l0]' + ''.join(f'[s{i}][l{i + 1}]' for i in range(len(CAT))) + f'[s{len(CAT)}]concat=n={2 * len(CAT) + 2}:v=0:a=1,aresample=32000[o]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', GOC, '-filter_complex', f, '-map', '[o]', '-ac', '1', '-b:a', '48k', str(mp3)], check=True)
DAI = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)], capture_output=True, text=True).stdout)
# ---- cảnh: hồi bắt đầu trong khoảng lặng chèn, 0,5 s trước tên hồi; Kết kéo thêm 4 s sau câu cuối
T0 = [0.0] + [round(TG[i][0] - 0.5, 2) for i in dau_ten[1:]]; T1 = T0[1:] + [round(TG[-1][1] + 4.0, 2)]
# ---- story vo ↔ lời đọc từng hồi (số "1968" ↔ "một nghìn chín trăm sáu mươi tám"): mỗi từ vo lấy mốc các từ lời đọc tương ứng
ST = json.loads(json.dumps(CU)); SUB_ALL = []
NOI = {'Khe Sanh...': None}
for k, sc in enumerate(ST['scenes']):
    idx = [i for i, v in enumerate(VT) if v == (k, 'loi')]; sw = [SW[i] for i in idx]
    tok = [(c, w) for c, cau in enumerate(sc['vo']) for w in cau.split()]                 # (câu, từ hiển thị)
    tn = [' '.join(norm(w)) for c, w in tok]
    vn, vi = [], []                                                                       # từ vo chuẩn hoá (một từ hiển thị có thể ra nhiều từ: "C-130" → "c 130")
    for j, x in enumerate(tn):
        for y in (x.split() or ['∅']): vn.append(y); vi.append(j)
    m2 = difflib.SequenceMatcher(None, vn, sw, autojunk=False); tt = [None] * len(tok)
    def gan(j, a, b):
        t = (TG[idx[a]][0], TG[idx[b]][1]); tt[j] = t if tt[j] is None else (min(tt[j][0], t[0]), max(tt[j][1], t[1]))
    for op, i1, i2, j1, j2 in m2.get_opcodes():
        if op == 'equal':
            for d in range(i2 - i1): gan(vi[i1 + d], j1 + d, j1 + d)
        elif op == 'replace':
            for d in range(i2 - i1):
                a = j1 + d * (j2 - j1) // (i2 - i1); b = max(a, j1 + (d + 1) * (j2 - j1) // (i2 - i1) - 1); gan(vi[i1 + d], a, b)
    for j in range(len(tt)):
        if tt[j] is None:
            a = next((tt[q][1] for q in range(j - 1, -1, -1) if tt[q]), TG[idx[0]][0]); tt[j] = (a, a + 0.15)
    # phụ đề: mỗi câu vo một dòng; câu dài (> 84 ký tự) tách ở dấu phẩy / chỗ ngắt dài nhất gần giữa câu
    subs = []
    for c in range(len(sc['vo'])):
        L = [(w, *tt[j]) for j, (cc, w) in enumerate(tok) if cc == c]
        def tach(L):                                                                      # tách ở chỗ ngắt gần giữa dòng, ưu tiên dấu phẩy; không tách quanh "–" (Việt – Lào)
            s = ' '.join(x[0] for x in L)
            if len(s) <= 84 or len(L) < 6: return [L]
            pos = [len(' '.join(x[0] for x in L[:q])) for q in range(len(L) + 1)]
            ok = [q for q in range(2, len(L) - 1) if pos[q] >= 20 and len(s) - pos[q] >= 20 and L[q - 1][0] != '–' and L[q][0] != '–'] or list(range(2, len(L) - 1))
            best = max(ok, key=lambda q: min(L[q][1] - L[q - 1][2], 0.6) + (0.35 if L[q - 1][0][-1] in ',;:' else 0) - 1.2 * abs(pos[q] - len(s) / 2) / len(s))
            return tach(L[:best]) + tach(L[best:])
        cau_ = [[]]                                                                       # tách câu trong một dòng vo ("… Lào. Những thung lũng …")
        for x in L:
            cau_[-1].append(x)
            if re.search(r'[.!?]$', x[0]) and not x[0].endswith('...'): cau_.append([])
        for C_ in cau_:
            if C_: subs += [[P[0][1], P[-1][2], ' '.join(x[0] for x in P)] for P in tach(C_)]
    q = 0
    while q < len(subs) - 1:                                                              # câu rất ngắn ("Huế.") ghép với câu sau
        if subs[q][1] - subs[q][0] < 1.2 and len(subs[q][2]) + len(subs[q + 1][2]) < 62: subs[q:q + 2] = [[subs[q][0], subs[q + 1][1], subs[q][2] + ' ' + subs[q + 1][2]]]
        else: q += 1
    for q in range(len(subs)):
        nxt = subs[q + 1][0] if q + 1 < len(subs) else T1[k]
        subs[q] = [round(subs[q][0] - 0.1, 2), round(min(subs[q][1] + 0.6, nxt - 0.05), 2), subs[q][2]]
    # cú máy: vị trí cũ (tỉ lệ số chữ trong hồi cũ) → mốc chữ đó trong voice
    o0, o1 = sc['t0'], sc['t1']; NW = len(tok); st = [tt[j][0] for j in range(NW)]
    def moi(dc):                                                                          # dc: giây cũ tính từ đầu hồi
        x = dc / (o1 - o0) * NW
        if x <= 0: return T0[k] + dc
        if x >= NW: return T1[k] + (dc - (o1 - o0))
        j = int(x); a = st[j] if j else T0[k]; b = st[j + 1] if j + 1 < NW else T1[k]
        if j == 0: a = T0[k]
        return a + (b - a) * (x - j)
    ban = sorted({0.0, *[round(s['t0'] - o0, 2) for s in sc['shots']], *[round(o0 + (o1 - o0) * f - o0, 2) for f in (0.25, 0.5, 0.75)], round(o1 - o0, 2)})
    sc['ban_do'] = [[d, round(moi(d), 2)] for d in ban]
    sh = sc['shots']
    for q, s in enumerate(sh): s['t0'] = round(T0[k] if q == 0 else moi(s['t0'] - o0), 2)
    for q, s in enumerate(sh): s['t1'] = sh[q + 1]['t0'] if q + 1 < len(sh) else round(T1[k], 2)
    sc['t0'], sc['t1'], sc['subs'] = round(T0[k], 2), round(T1[k], 2), subs
    sc['_tt'] = tt; sc['_tok'] = tok
# ---- thẻ hồi: hiện đúng lúc voice đọc tên hồi, giữ thêm 2,8 s
the = []
for k, sc in enumerate(ST['scenes']):
    ii = [i for i, v in enumerate(VT) if v == (k, 'ten')]; a, b = TG[ii[0]][0], TG[ii[-1]][1]
    nho, lon = CU['the'][k][2], CU['the'][k][3]
    the.append([round(max(0.0, a - 0.15), 2), round(min(b + 2.8, T1[k] - 0.1), 2), nho, lon])
# ---- mốc sự kiện theo câu đọc (rieng.js / bien_dao: STORY.moc)
def cau(id_, dau):
    sc = next(s for s in ST['scenes'] if s['id'] == id_)
    for c, v in enumerate(sc['vo']):
        if v.startswith(dau): return round(next(sc['_tt'][j][0] for j, (cc, w) in enumerate(sc['_tok']) if cc == c), 2)
    raise SystemExit('không thấy câu: ' + dau)
MOC = dict(h04_phao=cau('H04', 'Tiếng pháo bất ngờ'), h04_kho=cau('H04', 'Kho đạn trong căn cứ'), h04_ungpho=cau('H04', 'Quân Mỹ nhanh chóng'),
           h05_tet=cau('H05', 'Cuộc Tổng tiến công'))
for sc in ST['scenes']: sc.pop('_tt'); sc.pop('_tok')
ST['duration'] = round(max(T1[-1], DAI), 2); ST['the'] = the; ST['moc'] = MOC
ST['voice'] = {'file': 'audio/voice.mp3', 'nguon': f'Bản voice anh Thắng làm, 25/11/2026 (voice-khesanh-1.mp3 + voice-khe-sanh2.mp3, {A["dai"]:.0f} s; chèn {LANG} s lặng trước tên mỗi hồi); mốc từng từ nhận dạng bằng tools/sa_ban/voice/asr_onnx.py, khớp {100 * khop / len(SW):.1f} % số từ lời đọc'}
ST['note'] = ('KỊCH BẢN 11 HỒI + KẾT theo VOICE (giây voice). Dựng bằng tools/sa_ban/voice/dung_story_khe_sanh.py từ khe_sanh_story_truoc_voice.json '
              '(bản ước theo số chữ, nhap_story_khe_sanh.py). Phụ đề: câu chữ story (vo), mốc theo voice. scene.ban_do: giây cũ trong hồi → giây voice. '
              'Trường goc: mã cảnh trong kịch bản camera; nguon: mã trong sources.json.')
(GOI / 'story.json').write_text(json.dumps(ST, ensure_ascii=False, indent=1))
print(f'khớp {khop}/{len(SW)} = {100 * khop / len(SW):.1f} % · voice {DAI:.1f} s · phim {ST["duration"]} s')
for k, sc in enumerate(ST['scenes']):
    print(sc['id'], sc['t0'], sc['t1'], f"{sc['t1'] - sc['t0']:.1f}s (cũ {CU['scenes'][k]['t1'] - CU['scenes'][k]['t0']:.0f})", len(sc['subs']), 'dòng', [s['id'][-2:] + '@' + str(s['t0']) for s in sc['shots']])
print('mốc', MOC)
