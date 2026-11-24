"""Nhận dạng tiếng Việt cho bản voice sa bàn — chạy thẳng bằng onnxruntime (không cần gói sherpa-onnx).
Mô hình: sherpa-onnx-zipformer-vi-2025-04-20 (encoder/decoder/joiner .onnx + tokens.txt; bản lưu ở _KHO-CHUNG/cong-cu/).
python3 asr_onnx.py <thư mục mô hình> <voice.mp3> <ra asr.json>
Ra: {"tu": [[từ, giây đầu, giây cuối], ...], "dai": thời lượng}. Đặc trưng fbank 80 kiểu Kaldi (25 ms / 10 ms, povey, 20–7600 Hz),
giải mã tham lam (greedy) transducer, cắt khúc ≤ 22 s ở chỗ lặng (khúc dài làm tiến trình nặng)."""
import sys, json, subprocess, numpy as np, onnxruntime as ort
MD, MP3, OUT = sys.argv[1:4]
SR = 16000
pcm = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', MP3, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
wav = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
DAI = len(wav) / SR
def mel_banks(n=80, nfft=512, lo=20.0, hi=SR / 2 - 400):
    mel = lambda f: 1127.0 * np.log(1 + f / 700.0)
    ml, mh = mel(lo), mel(hi); c = np.linspace(ml, mh, n + 2)
    fm = mel(np.arange(nfft // 2 + 1) * SR / nfft); B = np.zeros((n, nfft // 2 + 1), np.float32)
    for i in range(n):
        l, m, r = c[i], c[i + 1], c[i + 2]
        B[i] = np.clip(np.minimum((fm - l) / (m - l), (r - fm) / (r - m)), 0, None)
    return B
BANK = mel_banks(); WIN = (0.5 - 0.5 * np.cos(2 * np.pi * np.arange(400) / 399)) ** 0.85
def fbank(x):
    nf = 1 + (len(x) - 1) // 160 if len(x) > 0 else 0                      # snip_edges = false: khung giữa quanh mỗi mốc 10 ms
    pad = np.pad(x, (200 - 80, 400), mode='reflect'); F = np.lib.stride_tricks.sliding_window_view(pad, 400)[::160][:nf].copy()
    F -= F.mean(1, keepdims=True); F[:, 1:] -= 0.97 * F[:, :-1]; F[:, 0] -= 0.97 * F[:, 0]
    S = np.abs(np.fft.rfft(F * WIN, 512)) ** 2
    return np.log(np.maximum(S @ BANK.T, np.finfo(np.float32).eps)).astype(np.float32)
so = ort.SessionOptions(); so.intra_op_num_threads = 4
E = ort.InferenceSession(f'{MD}/encoder-epoch-12-avg-8.onnx', so, providers=['CPUExecutionProvider'])
D = ort.InferenceSession(f'{MD}/decoder-epoch-12-avg-8.onnx', so, providers=['CPUExecutionProvider'])
J = ort.InferenceSession(f'{MD}/joiner-epoch-12-avg-8.onnx', so, providers=['CPUExecutionProvider'])
TOK = [l.rsplit(' ', 1)[0] for l in open(f'{MD}/tokens.txt', encoding='utf-8').read().splitlines()]
# cắt khúc ở chỗ lặng nhất trong cửa sổ 14–22 s
fr = 0.02; en = np.sqrt(np.convolve(wav ** 2, np.ones(int(SR * fr)) / (SR * fr), 'same'))[::int(SR * fr)]
cuts, a = [0.0], 0.0
while DAI - a > 22:
    i0, i1 = int((a + 14) / fr), int((a + 22) / fr); k = i0 + int(np.argmin(np.convolve(en[i0:i1], np.ones(15) / 15, 'same'))); a = k * fr; cuts.append(a)
cuts.append(DAI)
tu = []
for c0, c1 in zip(cuts, cuts[1:]):
    x = wav[int(c0 * SR):int(c1 * SR)]; f = fbank(x)[None]
    eo, el = E.run(None, {'x': f, 'x_lens': np.array([f.shape[1]], np.int64)}); eo = eo[0, :el[0]]
    ctx = [0, 0]; do = D.run(None, {'y': np.array([ctx], np.int64)})[0]
    Tn = eo.shape[0]; dt = (c1 - c0) / max(Tn, 1)
    for t in range(Tn):
        y = int(np.argmax(J.run(None, {'encoder_out': eo[t:t + 1], 'decoder_out': do})[0][0]))
        if y == 0: continue
        p = TOK[y]; tt = c0 + t * dt
        if p.startswith('▁') or not tu: tu.append([p.lstrip('▁'), tt, tt + dt])
        else: tu[-1][0] += p; tu[-1][2] = tt + dt
        ctx = [ctx[1], y]; do = D.run(None, {'y': np.array([ctx], np.int64)})[0]
    print(f'{c0:7.1f}–{c1:7.1f}s', ' '.join(w for w, *_ in tu[-12:])[:150], flush=True)
json.dump({'tu': [[w, round(a, 2), round(b, 2)] for w, a, b in tu if w], 'dai': round(DAI, 2), 'cat': [round(c, 2) for c in cuts]}, open(OUT, 'w'), ensure_ascii=False)
print('xong', len(tu), 'từ', round(DAI, 1), 's')
