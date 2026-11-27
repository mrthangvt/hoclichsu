# -*- coding: utf-8 -*-
"""Gắn bản thu lời dẫn vào sa bàn Như Nguyệt 1077 (bộ máy 2.1.0) — theo Project › quy-trinh-gan-voice-sa-ban.md.

    python3 dung_voice_nhu_nguyet.py <voice gốc.mp3> <asr.json> <thư mục gói>

Bản thu đọc liền (5 phút 52 giây) còn phim dựng sẵn 17 phút 30 giây với hoạt cảnh theo giây cố định, nên KHÔNG nắn phim theo voice
mà làm ngược lại: cắt bản thu thành từng câu (căn bằng nhận dạng tiếng nói, asr_onnx.py), đặt mỗi câu đúng mốc phụ đề cũ của nó
(mốc đã khớp với hoạt cảnh: trống nổi lên đúng lúc phục binh đổ ra…), thêm chỗ ngắt ở dấu phẩy, hai chấm, giữa các câu thơ.
Ra: audio/voice.mp3 (đã đặt sẵn theo giây phim), story.json › scenes[].subs (phụ đề theo câu đọc thật), story.json › voice,
và in mốc câu thơ cho POEM trong rieng.js. Mốc gốc lưu ở nhu_nguyet_moc.json cạnh tệp này (chạy lại được nhiều lần).
"""
import sys, json, re, difflib, subprocess, os
import numpy as np

MP3, ASR, GOI = sys.argv[1:4]
DIR = os.path.dirname(os.path.abspath(__file__))
MOC = os.path.join(DIR, 'nhu_nguyet_moc.json')
SR = 24000
story = json.load(open(os.path.join(GOI, 'story.json'), encoding='utf-8'))
if not os.path.exists(MOC):        # lần đầu: lưu phụ đề cũ làm mốc
    json.dump({s['id']: s['subs'] for s in story['scenes']}, open(MOC, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
moc = json.load(open(MOC, encoding='utf-8'))
DUR = story['duration']

# ---- câu lời dẫn (nối các đoạn phụ đề cũ thành câu) + mốc đặt câu = đầu đoạn phụ đề cũ chứa chữ đầu câu
cau = []          # (cảnh, chữ, mốc)
for s in story['scenes']:
    subs = moc[s['id']]; full = ''; starts = []
    for a, b, t in subs:
        starts.append((len(full), a)); full += t.strip() + ' '
    full = re.sub(r'\s+', ' ', full).strip()
    full = full.replace('bài thơ: Nam quốc', 'bài thơ:¶ Nam quốc')            # câu thơ đọc tách khỏi câu dẫn
    for m in re.finditer(r'[^.!?¶]+[.!?¶]+|[^.!?¶]+$', full):
        tx = m.group().replace('¶', '').strip()
        if not tx: continue
        pos = m.start() + len(m.group()) - len(m.group().lstrip()); a0 = max(a for p, a in starts if p <= pos)
        cau.append([s['id'], tx, a0])
# tách bốn câu thơ thành bốn câu riêng
thu = []
for c in cau:
    if c[1].startswith(('Nam quốc sơn hà', 'Như hà nghịch')):
        ps = re.split(r'(?<=[,.])\s+', c[1]); thu += [[c[0], p, c[2]] for p in ps]
    else: thu.append(c)
cau = thu

# ---- căn với kết quả nhận dạng
SO = {'1075': 'một ngàn không trăm bảy mươi lăm', '1076': 'một ngàn không trăm bảy mươi sáu', '1077': 'một ngàn không trăm bảy mươi bảy'}
def chuan(s):
    for k, v in SO.items(): s = s.replace(k, v)
    return re.findall(r"[\wÀ-ỹ]+", s.lower().replace('nghìn', 'ngàn'))
W = json.load(open(ASR))['tu']
asr = [(chuan(w[0]) or [''])[0] for w in W]
toks, own, dau = [], [], []          # dau: chữ ngay trước dấu ngắt trong câu (phẩy, hai chấm)
for k, (_, s, _) in enumerate(cau):
    for p in re.finditer(r"[\wÀ-ỹ0-9]+[,:;]?", s):
        w = p.group(); ws = chuan(w.rstrip(',:;'))
        for j, x in enumerate(ws):
            toks.append(x); own.append(k); dau.append(w[-1] if (j == len(ws) - 1 and w[-1] in ',:;') else '')
sm = difflib.SequenceMatcher(None, toks, asr, autojunk=False); M = {}
for b in sm.get_matching_blocks():
    for i in range(b.size): M[b.a + i] = b.b + i
khop = sum(1 for i in range(len(toks)) if i in M) / len(toks)
print('khớp %.1f %% số chữ' % (khop * 100))

# ---- âm thanh gốc + năng lượng 10 ms để tìm chỗ lặng thật
pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', MP3, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
H = SR // 100; E = np.sqrt(np.convolve(x ** 2, np.ones(H) / H, 'same'))[::H]; E = 20 * np.log10(E + 1e-6)
nen = np.percentile(E, 8); NGUONG = nen + 12          # dưới ngưỡng = lặng
def lang_nhat(a, b):                                  # giây lặng nhất trong [a, b]
    i0, i1 = max(0, int(a * 100)), min(len(E) - 1, int(b * 100));
    if i1 <= i0: return a
    k = i0 + int(np.argmin(np.convolve(E[i0:i1 + 1], np.ones(3) / 3, 'same'))); return k / 100
def mep_dau(t):                                       # lùi về chỗ bắt đầu có tiếng
    i = int(t * 100)
    while i > 0 and E[i - 1] > NGUONG and t * 100 - i < 40: i -= 1
    return max(0, i / 100 - 0.03)
def mep_cuoi(t):                                      # tiến tới chỗ hết tiếng (đuôi âm tiết cuối)
    i = int(t * 100)
    while i < len(E) - 1 and (E[i] > NGUONG or i - t * 100 < 15) and i - t * 100 < 90: i += 1
    return min(len(x) / SR, i / 100 + 0.06)

# ---- cụm bỏ khỏi lời đọc (bản thu còn giữ). 26/11/2026: không có cảnh quân Lý xếp hai hàng cho quân Tống đi giữa (anh Thắng)
BO = ['đi giữa hai hàng quân Đại Việt,', 'xếp hàng']
# ---- mỗi câu: các khúc [đầu, cuối] trong bản gốc, nghỉ chèn sau mỗi khúc
NGHI = {',': 0.22, ';': 0.3, ':': 0.38}
khuc_cau = []
for k, (sid, tx, a0) in enumerate(cau):
    idx = [i for i, o in enumerate(own) if o == k]; hit = [M[i] for i in idx if i in M]
    if not hit: print('KHÔNG KHỚP:', tx); khuc_cau.append(None); continue
    w0, w1 = min(hit), max(hit)
    t0 = mep_dau(W[w0][1]); t1 = mep_cuoi(W[w1][1])
    if w1 + 1 < len(W): t1 = min(t1, lang_nhat(W[w1][1] + 0.12, W[w1 + 1][1] + 0.04))
    cat = []
    for i in idx:
        if dau[i] and i in M and M[i] + 1 <= w1:
            j = M[i]; c = lang_nhat(W[j][1] + 0.12, W[j + 1][1] + 0.04); cat.append((c, NGHI[dau[i]]))
    pieces, a = [], t0
    for c, ng in cat:
        if c > a + 0.25: pieces.append((a, c, ng)); a = c
    pieces.append((a, t1, 0.0))
    for cum in BO:                                    # cắt hẳn một cụm khỏi câu đọc (lời và tiếng), ghép hai phần còn lại có nghỉ dấu phẩy
        if cum not in tx: continue
        ct = chuan(cum); ti = [i for i in idx]; pos = next((q for q in range(len(ti) - len(ct) + 1) if toks[ti[q]:ti[q] + len(ct)] == ct), None)
        if pos is None or ti[pos] not in M or ti[pos + len(ct) - 1] not in M: print('KHÔNG CẮT ĐƯỢC:', cum); continue
        m0, m1 = M[ti[pos]], M[ti[pos + len(ct) - 1]]
        c1 = lang_nhat(W[m0 - 1][1] + 0.12, W[m0][1] + 0.04); c2 = lang_nhat(W[m1][1] + 0.12, W[m1 + 1][1] + 0.04)
        moi = []
        for pa, pb, ng in pieces:
            if pb <= c1 or pa >= c2: moi.append((pa, pb, ng)); continue
            if pa < c1: moi.append((pa, c1, NGHI[','] if cum.endswith(',') else 0.03))
            if pb > c2: moi.append((c2, pb, ng))
        pieces = moi; cau[k][1] = tx = tx.replace(cum + ' ', '').replace(' ' + cum, '').replace(cum, ''); print('đã cắt:', cum, round(c2 - c1, 2), 's')
    khuc_cau.append(pieces)

# ---- đặt câu theo mốc; nghỉ tối thiểu giữa hai câu, dài hơn sau câu ngắn kết đoạn
POEM_MOC = [766.0, 769.5, 773.0, 776.5]; YTHO = 779.6
out = np.zeros(int((DUR + 2) * SR), np.float32); dat = []; het = 0.0; tho = []
for k, ((sid, tx, a0), pieces) in enumerate(zip(cau, khuc_cau)):
    if pieces is None: continue
    if tx.startswith(('Nam quốc', 'Tiệt nhiên', 'Như hà', 'Nhữ đẳng')): a0 = POEM_MOC[len(tho)]; tho.append(a0)
    if tx.startswith('Ý thơ'): a0 = YTHO
    if tx.startswith('Kẻ thù nào'): a0 = 0          # đọc liền sau ý thơ
    t = max(a0, het + (0.75 if dat and dat[-1][0] == sid else 0.3)); dau_cau = t; moc_khuc = []
    for a, b, ng in pieces:
        seg = x[int(a * SR):int(b * SR)].copy(); f = min(len(seg) // 2, int(0.012 * SR))
        if f: seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        i = int(t * SR); out[i:i + len(seg)] += seg; moc_khuc.append((t, t + len(seg) / SR)); t += len(seg) / SR + ng
    het = moc_khuc[-1][1]; dat.append((sid, tx, dau_cau, het, moc_khuc, a0))
    if het > (next((s['t1'] for s in story['scenes'] if s['id'] == sid))): print('TRÀN CẢNH', sid, tx[:40], round(het, 2))

# ---- phụ đề: mỗi câu một dòng; câu dài > 90 ký tự tách ở dấu phẩy, mốc lấy theo chỗ ngắt thật (không có thì chia theo số chữ)
by = {s['id']: [] for s in story['scenes']}
for sid, tx, a, b, mk, a0 in dat:
    if len(tx) <= 90:
        by[sid].append([round(a, 2), round(b + 0.35, 2), tx]); continue
    phan = re.split(r'(?<=[,;:])\s+', tx); L = len(tx)
    def moc_chu(n):                                # giây đọc tới ký tự thứ n
        bien = [kb for ka, kb in mk[:-1]]
        return a + (b - a) * n / L if not bien else min(bien, key=lambda t: abs(t - (a + (b - a) * n / L)))
    nhom, cur = [], ''
    for p in phan:
        if cur and len(cur) + 1 + len(p) > 90: nhom.append(cur); cur = ''
        cur = (cur + ' ' + p).strip()
    nhom.append(cur); n = 0; t0 = a
    for i, g in enumerate(nhom):
        n += len(g) + 1; t1 = moc_chu(n) if i + 1 < len(nhom) else b + 0.35
        by[sid].append([round(t0, 2), round(t1, 2), g]); t0 = t1 + 0.05
for s in story['scenes']: s['subs'] = by[s['id']]
story['voice'] = {'file': 'audio/voice.mp3', 'nguon': 'bản thu của chủ dự án (25/11/2026), đặt theo mốc phụ đề cũ bằng dung_voice_nhu_nguyet.py',
                  'cau': [[round(a, 2), round(b, 2)] for _, _, a, b, _, _ in dat], 'khop': round(khop, 3)}
json.dump(story, open(os.path.join(GOI, 'story.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# ---- âm thanh ra: mono 24 kHz, VBR (khoảng lặng gần như không tốn dung lượng)
wav = os.path.join(DIR, '_voice_tmp.raw'); (np.clip(out, -1, 1) * 32767).astype(np.int16).tofile(wav)
ra = os.path.join(GOI, 'audio', 'voice.mp3')
subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '5', ra], check=True); os.remove(wav)
print('voice.mp3 %.2f MB, %d câu, mốc thơ %s' % (os.path.getsize(ra) / 1e6, len(dat), [round(d[2], 2) for d in dat if d[1].startswith(('Nam quốc', 'Tiệt nhiên', 'Như hà', 'Nhữ đẳng'))]))
lech = [(round(a - a0, 1), tx[:40]) for _, tx, a, _, _, a0 in dat if a - a0 > 0.5]
print('câu bị đẩy muộn hơn mốc > 0,5 s:', lech)
