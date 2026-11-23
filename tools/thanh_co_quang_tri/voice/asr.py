"""Nhận dạng tiếng Việt (sherpa-onnx zipformer-vi) cho danh sách tệp âm thanh.
Dùng: python3 asr.py out.json file1 file2 ...  (tệp dài được cắt khúc <= 20 s, có chồng lấn nhẹ theo khoảng lặng)"""
import sys, json, subprocess, numpy as np, sherpa_onnx
M = '/home/claude/asr/sherpa-onnx-zipformer-vi-int8-2025-04-20/'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=M + 'encoder-epoch-12-avg-8.int8.onnx', decoder=M + 'decoder-epoch-12-avg-8.onnx',
    joiner=M + 'joiner-epoch-12-avg-8.int8.onnx', tokens=M + 'tokens.txt', num_threads=2,
    decoding_method='greedy_search')
SR = 16000

def load(f):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def chunks(x, maxs=20.0):
    """cắt ở chỗ năng lượng thấp nhất trong khoảng 14–20 s"""
    out = []; s = 0; n = len(x); W = int(.05 * SR)
    while s < n:
        if n - s <= maxs * SR:
            out.append((s, n)); break
        lo, hi = s + int(14 * SR), s + int(maxs * SR)
        seg = x[lo:hi]; e = np.convolve(seg ** 2, np.ones(W) / W, 'same')
        cut = lo + int(np.argmin(e)); out.append((s, cut)); s = cut
    return out

def run(f):
    x = load(f); words = []
    for a, b in chunks(x):
        st = rec.create_stream(); st.accept_waveform(SR, x[a:b]); rec.decode_stream(st); r = st.result
        toks, ts = r.tokens, r.timestamps
        # ghép token BPE thành từ (token bắt đầu bằng '▁' là đầu từ)
        cur = None
        for tk, t in zip(toks, ts):
            t = a / SR + t
            if tk.startswith(('▁',' ')) or cur is None:
                if cur: words.append(cur)
                cur = {'w': tk.lstrip('▁ '), 't': round(t, 2)}
            else:
                cur['w'] += tk
        if cur: words.append(cur)
    return {'dur': round(len(x) / SR, 2), 'words': words, 'text': ' '.join(w['w'] for w in words)}

if __name__ == '__main__':
    out = {}
    for f in sys.argv[2:]:
        out[f] = run(f); print(f.split('/')[-1], '|', out[f]['text'][:200], flush=True)
    json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, indent=0)
