# Nhận dạng tiếng Việt (zipformer transducer, onnxruntime), lấy mốc từng âm tiết.
# python3 asr.py <voice.mp3> <thư mục mô hình> <ra.json>
import sys, json, subprocess, numpy as np, onnxruntime as ort

mp3, mdir, out = sys.argv[1:4]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
wav = np.frombuffer(pcm, np.int16).astype(np.float32)  # thang int16 như kaldi
SR = 16000

def mel_bank(n=80, nfft=512, lo=20.0, hi=-400.0):
    hi = SR / 2 + hi if hi <= 0 else hi
    mel = lambda f: 1127.0 * np.log(1 + f / 700.0)
    ml, mh = mel(lo), mel(hi)
    pts = np.linspace(ml, mh, n + 2)
    fft_mel = mel(np.arange(nfft // 2 + 1) * SR / nfft)
    W = np.zeros((n, nfft // 2 + 1), np.float32)
    for i in range(n):
        l, c, r = pts[i], pts[i + 1], pts[i + 2]
        up = (fft_mel - l) / (c - l); dn = (r - fft_mel) / (r - c)
        W[i] = np.maximum(0, np.minimum(up, dn))
    return W
MB = mel_bank()
win = (0.5 - 0.5 * np.cos(2 * np.pi * np.arange(400) / 399)) ** 0.85

def fbank(x):
    n = 1 + len(x) // 160
    pad = np.concatenate([x[:200][::-1], x, x[-400:][::-1]])  # snip_edges=False (phản chiếu)
    fr = np.stack([pad[i * 160: i * 160 + 400] for i in range(n)])
    fr = fr - fr.mean(1, keepdims=True)
    fr = np.concatenate([fr[:, :1] * (1 - 0.97), fr[:, 1:] - 0.97 * fr[:, :-1]], 1)
    fr = fr * win
    sp = np.abs(np.fft.rfft(fr, 512)) ** 2
    return np.log(np.maximum(sp @ MB.T, 1.1920929e-07)).astype(np.float32)

opt = ort.SessionOptions(); opt.intra_op_num_threads = 2
enc = ort.InferenceSession(f'{mdir}/encoder-epoch-12-avg-8.onnx', opt, providers=['CPUExecutionProvider'])
dec = ort.InferenceSession(f'{mdir}/decoder-epoch-12-avg-8.onnx', opt, providers=['CPUExecutionProvider'])
joi = ort.InferenceSession(f'{mdir}/joiner-epoch-12-avg-8.onnx', opt, providers=['CPUExecutionProvider'])
tok = {}
for ln in open(f'{mdir}/tokens.txt', encoding='utf-8'):
    a = ln.rstrip('\n').rsplit(' ', 1); tok[int(a[1])] = a[0]

# cắt khúc ≤ 20 s tại chỗ lặng
e = np.array([np.sqrt(np.mean(wav[i:i + 1600] ** 2) + 1e-9) for i in range(0, len(wav), 1600)])  # 0,1 s
cuts = [0]; pos = 0
while pos < len(e):
    if len(e) - pos <= 200: break
    lo, hi = pos + 120, pos + 200
    j = lo + int(np.argmin(e[lo:hi])); cuts.append(j); pos = j
cuts.append(len(e))
words = []
for a, b in zip(cuts[:-1], cuts[1:]):
    seg = wav[a * 1600: b * 1600]
    f = fbank(seg)[None]
    eo, el = enc.run(None, {'x': f, 'x_lens': np.array([f.shape[1]], np.int64)})
    eo = eo[0][:el[0]]
    hyp = [0, 0]
    do = dec.run(None, {'y': np.array([hyp[-2:]], np.int64)})[0]
    for t in range(eo.shape[0]):
        lg = joi.run(None, {'encoder_out': eo[t:t + 1], 'decoder_out': do})[0][0]
        k = int(lg.argmax())
        if k != 0:
            hyp.append(k)
            s = tok[k]; ts = a * 0.1 + t * 0.04
            if s.startswith('▁') or not words: words.append([s.lstrip('▁'), round(ts, 2)])
            else: words[-1][0] += s
            do = dec.run(None, {'y': np.array([hyp[-2:]], np.int64)})[0]
    print(f'{a/10:.0f}-{b/10:.0f}s', ' '.join(w[0] for w in words[-12:]), flush=True)
json.dump({'dur': len(wav) / SR, 'words': words}, open(out, 'w'), ensure_ascii=False)
print('xong', len(words))
