# V10.4 · Căn voice thu âm (anh Thắng gửi 22/11/2026) với lời dẫn 14 cảnh – không cần nhận dạng tiếng nói:
# 1) đo năng lượng âm từng 10 ms → các khoảng nghỉ (chỗ ngắt câu);
# 2) quy hoạch động: mỗi ranh giới câu đặt vào một khoảng nghỉ sao cho thời lượng câu ≈ tốc độ đọc × số chữ, ưu tiên chỗ nghỉ dài;
# 3) ghi voice.json (mốc từng câu, thời lượng cảnh) + bản đồ giây cũ → giây mới cho từng cảnh; xuất voice web (mono 32 kHz 48 kbps).
import json, re, subprocess, sys, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, "..", "web10")
SRC = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/uploads/b0fcf41a-voice-ngochoidongda.mp3"
SR = 16000
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32); DUR = len(x) / SR
hop = 160; n = len(x) // hop
e = 10 * np.log10(np.maximum(1e-10, (x[:n * hop].reshape(n, hop) ** 2).mean(1)))
es = np.convolve(e, np.ones(5) / 5, mode="same")
lo, hi = np.percentile(es, 8), np.percentile(es, 90)
thr = lo + 0.30 * (hi - lo)
q = es < thr
P = []                                                  # khoảng nghỉ: (đầu, cuối) giây
k = 0
while k < n:
    if q[k]:
        j = k
        while j < n and q[j]: j += 1
        if (j - k) * hop / SR >= 0.14: P.append((k * hop / SR, j * hop / SR))
        k = j
    else: k += 1
print(f"voice {DUR:.1f} s · ngưỡng {thr:.1f} dB · {len(P)} khoảng nghỉ")

S = json.load(open(os.path.join(WEB, "story.json")))
SEN = []                                                # (cảnh, câu, cuối đoạn?)
for i, sc in enumerate(S["scenes"]):
    for pi, para in enumerate(sc["vo"]):
        ss = [s.strip() for s in re.split(r"(?<=[.!?…])\s+", para) if s.strip()]
        for k2, s in enumerate(ss): SEN.append((i, s, k2 == len(ss) - 1, pi == len(sc["vo"]) - 1 and k2 == len(ss) - 1))
L = np.array([len(s) for _, s, _, _ in SEN], float)
# đầu tiếng nói và cuối tiếng nói
t_dau = P[0][1] if P and P[0][0] < 0.05 else 0.0
t_cuoi = P[-1][0] if P and P[-1][1] > DUR - 0.05 else DUR
# ứng viên ranh giới = giữa mỗi khoảng nghỉ nằm trong phần có tiếng
C = [(a, b) for a, b in P if a > t_dau + 0.3 and b < t_cuoi - 0.3]; C0 = len(C)
cm = np.array([(a + b) / 2 for a, b in C]); cl = np.array([b - a for a, b in C])
rate = (t_cuoi - t_dau - 0.35 * len(SEN)) / L.sum()     # giây / ký tự (đã trừ nghỉ trung bình)
print(f"{len(SEN)} câu · {int(L.sum())} ký tự · {1 / rate:.1f} ký tự/giây")
# ánh xạ: số chữ tích luỹ ↔ thời gian CÓ TIẾNG (trừ các khoảng nghỉ) → ranh giới câu, rồi kéo về khoảng nghỉ gần nhất (±1,6 s)
act = np.ones(n, bool)
for a_, b_ in P: act[int(a_ * SR / hop):int(b_ * SR / hop)] = False
act[:int(t_dau * SR / hop)] = False; act[int(t_cuoi * SR / hop):] = False
cum = np.cumsum(act) * hop / SR                         # giây có tiếng tính tới khung k
tt = np.arange(n) * hop / SR
cL = np.cumsum(L) / L.sum() * cum[-1]
N = len(SEN); M = len(cm)
pos = np.concatenate([[t_dau], cm, [t_cuoi]])
B = []; last = 0
for s_ in range(N - 1):
    t_g = float(np.interp(cL[s_], cum, tt))            # thời điểm dự kiến hết câu s_
    cand = [j for j in range(max(last + 1, 1), M + 1) if abs(pos[j] - t_g) < 1.6]
    if cand:
        sc_ = [abs(pos[j] - t_g) - 0.6 * min(plen_, 1.0) for j, plen_ in ((j, cl[j - 1]) for j in cand)]
        j = cand[int(np.argmin(sc_))]
    else:
        j = None
    if j is None:
        B.append(-1 - len(B)); C.append((t_g - 0.05, t_g + 0.05)); continue
    B.append(j); last = j
# chỗ không có khoảng nghỉ gần: đặt điểm ảo
Bpos = []
for s_ in range(N - 1):
    j = B[s_]
    Bpos.append(pos[j] if j >= 0 else C[-1 - j + 0][0] if False else float(np.interp(cL[s_], cum, tt)))
B.append(M + 1); Bpos.append(t_cuoi)
# mốc câu: bắt đầu = cuối khoảng nghỉ trước, kết thúc = đầu khoảng nghỉ sau
def mep(j, dau, s_=None):
    if j == 0: return t_dau
    if j == M + 1: return t_cuoi
    if j < 0: return Bpos[s_]
    a, b = C[j - 1]; return b if dau else a
cau = []
for s in range(N):
    jp = 0 if s == 0 else B[s - 1]; jn = B[s]
    cau.append(dict(canh=SEN[s][0], text=SEN[s][1], t0=round(mep(jp, True, s - 1), 2), t1=round(mep(jn, False, s), 2)))
# cảnh: bắt đầu từ giữa khoảng nghỉ trước câu đầu tiên của cảnh (cảnh 1 bắt đầu ở 0)
NS = len(S["scenes"]); start = []
for i in range(NS):
    s = next(k for k, c in enumerate(cau) if c["canh"] == i)
    start.append(0.0 if i == 0 else round(Bpos[s - 1], 2))
dur = [round((start[i + 1] if i + 1 < NS else DUR) - start[i], 2) for i in range(NS)]
# bản đồ giây cũ → giây mới (mỗi cảnh): mốc câu theo công thức phụ đề cũ (đều theo số chữ) ↔ mốc câu theo voice
ban_do = []
for i, sc in enumerate(S["scenes"]):
    cs = [c for c in cau if c["canh"] == i]
    tot = sum(len(c["text"]) + 12 for c in cs); tt = sc["dur"] * 0.02; span = sc["dur"] * 0.96; old = []
    for c in cs: old.append(tt); tt += (len(c["text"]) + 12) / tot * span
    knots = [[0.0, 0.0]] + [[round(o, 2), round(c["t0"] - start[i], 2)] for o, c in zip(old, cs)] + [[sc["dur"], dur[i]]]
    knots = [knots[0]] + [k_ for k_ in knots[1:-1] if 0 < k_[1] < dur[i]] + [knots[-1]]
    ban_do.append(knots)
V = dict(nguon=os.path.basename(SRC), dur=round(DUR, 2), start=start, dur_canh=dur, ban_do=ban_do,
         cau=[[c["canh"], round(c["t0"] - start[c["canh"]], 2), round(c["t1"] - start[c["canh"]], 2), c["text"]] for c in cau])
json.dump(V, open(os.path.join(HERE, "voice_ngochoi.json"), "w"), ensure_ascii=False, indent=0)
for i in range(NS): print(f"C{i + 1:02d}  {start[i]:7.1f}  {dur[i]:6.1f} s  (cũ {S['scenes'][i]['dur']} s)")
d = [c["t1"] - c["t0"] for c in cau]; r = [len(c["text"]) / max(.3, c["t1"] - c["t0"]) for c in cau]
print("tốc độ câu (ký tự/giây): nhỏ nhất %.1f · lớn nhất %.1f · trung vị %.1f" % (min(r), max(r), float(np.median(r))))
lech = sorted([(abs(rr - 1 / rate), k) for k, rr in enumerate(r)], reverse=True)[:8]
print("câu lệch nhịp nhất:", [(k, round(r[k], 1), cau[k]["text"][:40]) for _, k in lech])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", "32000", "-b:a", "48k", os.path.join(WEB, "voice_ngochoi.mp3")], check=True)
print("voice web:", os.path.getsize(os.path.join(WEB, "voice_ngochoi.mp3")) // 1024, "KB")
