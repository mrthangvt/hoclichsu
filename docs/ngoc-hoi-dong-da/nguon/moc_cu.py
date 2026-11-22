# Mốc câu đọc trên dòng thời gian cũ của cảnh (giây theo phụ đề chia đều số chữ, giống build_camera và js_ui6).
# Dùng cho build_quan10 / build_camera10: sự kiện đặt theo câu → sau apply_voice.py tự khớp voice.
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
_S = json.load(open(os.path.join(HERE, "story_goc.json")))
def _cau(i):
    sc = _S["scenes"][i]; ss = [s.strip() for p in sc["vo"] for s in re.split(r"(?<=[.!?…])\s+", p) if s.strip()]
    tot = sum(len(s) + 12 for s in ss); tt = sc["dur"] * 0.02; span = sc["dur"] * 0.96; out = []
    for s in ss: d = (len(s) + 12) / tot * span; out.append((tt, tt + d, s)); tt += d
    return out
def T(i, dau, cuoi=False):
    for t0, t1, s in _cau(i):
        if s.startswith(dau): return round(t1 if cuoi else t0, 2)
    raise KeyError(f"C{i + 1:02d}: không thấy câu {dau!r}")
def U(i, dau, cuoi=False, them=0.0): return round(min(1, max(0, (T(i, dau, cuoi) + them) / _S["scenes"][i]["dur"])), 3)
if __name__ == "__main__":
    for i, d in ((11, "Sầm Nghi Đống"), (11, "Các tuyến phòng ngự"), (12, "Tôn Sĩ Nghị vội vã"), (12, "Những đoàn quân rút lui"), (12, "Phía sau, các cánh quân")):
        print(i, d, T(i, d), T(i, d, True), U(i, d))
