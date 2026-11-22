# V10.4 · Gắn voice thu âm: giữ nguyên dòng thời gian cũ của từng cảnh (máy quay, đội hình, ngày đêm, hiệu ứng)
# và "nắn" thời gian theo mốc câu đọc: sc.dur = thời lượng theo voice, sc.dur_cu = cũ, sc.ban_do = [[giây cũ, giây mới], ...],
# sc.subs = phụ đề theo voice [t0, t1, chữ] (câu dài tách ở dấu phẩy, tối đa ~98 ký tự).
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(HERE, "..", "web10", "story.json")
S = json.load(open(SP)); V = json.load(open(os.path.join(HERE, "voice_ngochoi.json")))
def tach(t0, t1, s):
    if len(s) <= 98: return [[t0, t1, s]]
    parts, cur = [], ""
    for w in re.split(r"(?<=[,;:])\s+", s):
        if cur and len(cur) + len(w) > 98: parts.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    if cur: parts.append(cur)
    tot = sum(len(p) for p in parts); out, t = [], t0
    for p in parts: d = (t1 - t0) * len(p) / tot; out.append([round(t, 2), round(t + d, 2), p]); t += d
    return out
for i, sc in enumerate(S["scenes"]):
    if "dur_cu" in sc: sc["dur"] = sc["dur_cu"]
    sc["dur_cu"] = sc["dur"]; sc["dur"] = V["dur_canh"][i]; sc["ban_do"] = V["ban_do"][i]
    subs = []
    for c, t0, t1, tx in V["cau"]:
        if c == i: subs += tach(t0, t1, tx)
    sc["subs"] = subs
S["voice"] = {"file": "voice_ngochoi.mp3", "dur": V["dur"], "start": V["start"]}
json.dump(S, open(SP, "w"), ensure_ascii=False, indent=1)
print("đã gắn voice:", round(sum(sc["dur"] for sc in S["scenes"]), 1), "s /", V["dur"], "s")
