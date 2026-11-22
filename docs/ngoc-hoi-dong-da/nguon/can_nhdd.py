# V10.5 · Căn lời dẫn (story.json, vo từng cảnh) vào voice bằng kết quả nhận dạng sherpa-onnx (voice/asr.json) – cùng cách RGXM
import json, re, difflib, unicodedata, bisect, os
HERE = os.path.dirname(os.path.abspath(__file__)); VD = "/mnt/user-data/uploads/NgocHoiDongDa/voice/"
A = json.load(open(VD + "asr.json")); S = json.load(open(os.path.join(HERE, "story_goc.json")))
W = []
for tk, ts in A["tokens"]:
    if tk[:1] in (" ", "▁") or not W: W.append([tk.strip(" ▁"), ts])
    else: W[-1][0] += tk
W = [[unicodedata.normalize("NFC", w).lower(), t] for w, t in W if w]
SO = {"1788": "một nghìn bảy trăm tám mươi tám", "1789": "một nghìn bảy trăm tám mươi chín", "XVIII": "mười tám", "1771": "một nghìn bảy trăm bảy mươi mốt",
      "10": "mười", "20": "hai mươi", "60": "sáu mươi", "5": "năm", "3": "ba", "29": "hai mươi chín", "30": "ba mươi", "2": "hai", "1": "một", "4": "bốn"}
def tu(s):
    s = re.sub(r"[–—\-]", " ", s); out = []
    for w in re.findall(r"[^\s,.;:!?…\"“”()]+", s):
        out += SO[w].split() if w in SO else [unicodedata.normalize("NFC", w).lower()]
    return out
L = []                                                      # (cảnh, câu)
for i, sc in enumerate(S["scenes"]):
    for para in sc["vo"]:
        for s in re.split(r"(?<=[.!?…])\s+", para):
            if s.strip(): L.append((i, s.strip()))
SW = [(k, w) for k, (_, l) in enumerate(L) for w in tu(l)]
a = [w for _, w in SW]; b = [w for w, _ in W]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t_of = [None] * len(a)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1): t_of[i1 + k] = W[j1 + k][1]
print("từ lời dẫn %d · từ nhận dạng %d · khớp %.1f%%" % (len(a), len(b), 100 * sum(t is not None for t in t_of) / len(a)))
idx = [k for k, t in enumerate(t_of) if t is not None]
def T(k):
    if t_of[k] is not None: return t_of[k]
    p = bisect.bisect_left(idx, k); lo = idx[p - 1] if p > 0 else None; hi = idx[p] if p < len(idx) else None
    if lo is None: return t_of[hi]
    if hi is None: return t_of[lo]
    return t_of[lo] + (t_of[hi] - t_of[lo]) * (k - lo) / (hi - lo)
sil = [(float(e) - float(d), float(e)) for e, d in re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", open(VD + "sil.txt").read())]
def bat_dau(t):
    c = [e for s, e in sil if e <= t + 0.12 and t - e < 0.6]; return max(c) if c else t - 0.05
def ket_thuc(t_next, t_last):
    c = [s for s, e in sil if s >= t_last and e <= t_next + 0.15]; return c[-1] if c else t_next - 0.05
first, last = {}, {}
for k, (i, w) in enumerate(SW): first.setdefault(i, k); last[i] = k
khop = []
for k_ in range(len(L)):
    ks = [k for k, (i, _) in enumerate(SW) if i == k_]; khop.append(sum(t_of[k] is not None for k in ks) / len(ks))
cau = []
for i, (c, l) in enumerate(L):
    t0 = bat_dau(T(first[i])); tn = bat_dau(T(first[i + 1])) if i + 1 < len(L) else A["dur"]
    t1 = ket_thuc(tn, T(last[i])) if i + 1 < len(L) else A["dur"]
    cau.append(dict(c=c, t0=round(t0, 2), t1=round(max(t1, t0 + 0.4), 2), text=l))
# ranh giới cảnh: giữa khoảng nghỉ trước câu đầu cảnh
NS = len(S["scenes"]); start = [0.0]
for i in range(1, NS):
    k = next(n for n, c in enumerate(cau) if c["c"] == i); start.append(round((cau[k - 1]["t1"] + cau[k]["t0"]) / 2, 2))
dur = [round((start[i + 1] if i + 1 < NS else A["dur"]) - start[i], 2) for i in range(NS)]
ban_do = []
for i, sc in enumerate(S["scenes"]):
    cs = [c for c in cau if c["c"] == i]
    cs_all = cs; cs = [c for c, m in zip(cau, khop) if c["c"] == i and m >= 0.2]
    tot = sum(len(c["text"]) + 12 for c in cs); tt = sc["dur"] * 0.02; span = sc["dur"] * 0.96; old = []
    for c in cs: old.append(tt); tt += (len(c["text"]) + 12) / tot * span
    kn = [[0.0, 0.0]] + [[round(o, 2), round(c["t0"] - start[i], 2)] for o, c in zip(old, cs)] + [[sc["dur"], dur[i]]]
    ok = [kn[0]]
    for x in kn[1:]:
        if x[1] > ok[-1][1] + 0.05 and x[0] > ok[-1][0]: ok.append(x)
    ban_do.append(ok)
V = dict(nguon="voice_ngochoidongda.mp3", dur=round(A["dur"], 2), start=start, dur_canh=dur, ban_do=ban_do,
         cau=[[c["c"], round(c["t0"] - start[c["c"]], 2), round(c["t1"] - start[c["c"]], 2), c["text"]] for c, m in zip(cau, khop) if m >= 0.2])
json.dump(V, open(os.path.join(HERE, "voice_ngochoi.json"), "w"), ensure_ascii=False, indent=0)
for i in range(NS): print("C%02d  %7.1f  %6.1f s (cũ %s)" % (i + 1, start[i], dur[i], S["scenes"][i]["dur"]))
# soát: câu có ít từ khớp
for k_, (c, l) in enumerate(L):
    ks = [k for k, (i, _) in enumerate(SW) if i == k_]; m = sum(t_of[k] is not None for k in ks) / len(ks)
    if m < 0.5: print("  câu khớp kém %.0f%%: C%02d %s" % (100 * m, c + 1, l[:70]))
