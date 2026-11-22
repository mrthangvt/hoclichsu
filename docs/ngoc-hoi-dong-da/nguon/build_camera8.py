# V8b: viết lại máy quay 14 cảnh bám theo lời dẫn, có cận cảnh nhân vật.
# Đọc web/quan.json (đội hình + kịch bản chuyển động), story_v6_keys.json (máy quay gốc V6, để giữ các cảnh bản đồ),
# rồi ghi đè "keys" trong web/story.json.
# Mỗi cảnh là danh sách shot: (t0, t1, A, B). A là góc máy đầu shot (cắt cảnh tới), B là góc máy cuối shot (máy trôi từ A sang B).
# Góc máy: {"g": đội, "d": m, "azr": độ so với hướng mặt đội (0 = đứng trước mặt), "el": độ, "h": m nâng tâm nhìn,
#           "lead": m dời tâm theo hướng đội, "side": m dời ngang}
#      hoặc {"qt": 1, ...} (Quang Trung), {"at": mốc, "off": [dx, dy], "d", "az", "el"}, {"ll": [vĩ, kinh], "d", "az", "el"}, {"xy": [x, y], ...}
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__)); WEB = os.path.join(HERE, "..", "web")
Q = json.load(open(os.path.join(WEB, "quan.json")))
SP = os.path.join(WEB, "story.json"); S = json.load(open(SP))
BK = os.path.join(HERE, "story_v6_keys.json")
if not os.path.exists(BK): json.dump([sc["keys"] for sc in S["scenes"]], open(BK, "w"), ensure_ascii=False)
K6 = json.load(open(BK))
LA0, LO0, KX, KY = 20.96609, 105.8355, 103992.0, 110716.0
G = {g["id"]: g for g in Q["groups"]}
for g in G.values():
    if g["mode"] == "path":
        c = [0.0]
        for a, b in zip(g["path"], g["path"][1:]): c.append(c[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
        g["cum"] = c

def state(g, i, u):
    sc = g["sc"].get(str(i))
    if not sc: return None
    segs = sc["s"]; o = sc.get("o", [0, 0]); ox, oy = o; clip = segs[0][2]; s = segs[0][3]; mvx = mvy = 0
    for q in segs:
        if u < q[0]: break
        k = min(1, (u - q[0]) / max(1e-6, q[1] - q[0])); clip = q[2]
        if g["mode"] == "path": s = q[3] + (q[4] - q[3]) * k; mvx = q[4] - q[3]
        else:
            ox += q[3] * k; oy += q[4] * k
            if q[3] or q[4]: mvx, mvy = q[3], q[4]
    return clip, ox, oy, s, mvx, mvy
def path_at(g, s):
    P, C = g["path"], g["cum"]; s = min(max(s, 0), C[-1] - .01); k = 1
    while k < len(C) - 1 and C[k] < s: k += 1
    a, b = P[k - 1], P[k]; L = C[k] - C[k - 1]; t = (s - C[k - 1]) / L
    return a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]) / L, (b[1] - a[1]) / L
def where(gid, i, t):
    """tâm đội và hướng mặt (độ, 0 = Bắc) ở cảnh i, giây t"""
    g = G[gid]; u = t / S["scenes"][i]["dur"]; stt = state(g, i, u)
    if not stt: raise SystemExit(f"đội {gid} không có ở cảnh {i}")
    clip, ox, oy, s, mvx, mvy = stt
    if g["mode"] == "path":
        al = sum(m[0] for m in g["m"]) / len(g["m"]); x, y, dx, dy = path_at(g, s + al)
        return x, y, math.degrees(math.atan2(dx, dy))
    x = sum(m[0] for m in g["m"]) / len(g["m"]) + ox; y = sum(m[1] for m in g["m"]) / len(g["m"]) + oy
    if (mvx or mvy) and clip not in ("dung", "nghi", "thu", "ngam", "chem", "danh", "roi", "vapnga"):
        hd = math.degrees(math.atan2(mvx, mvy))
    else:
        sx = sum(math.sin(m[2]) for m in g["m"]); sy = sum(-math.cos(m[2]) for m in g["m"])   # yaw → hướng (x, y)
        hd = math.degrees(math.atan2(sx, sy))
    return x, y, hd
def key(i, t, P, cut=False):
    k = {"t": round(t, 2)}
    if cut: k["cut"] = True
    if "g" in P or "qt" in P:
        if "qt" in P: q = Q["quangtrung"][str(i)]; x, y, hd = q[0], q[1], math.degrees(math.atan2(math.sin(q[2]), -math.cos(q[2])))
        else: x, y, hd = where(P["g"], i, t)
        r = math.radians(hd); lead, side = P.get("lead", 0), P.get("side", 0)
        x += math.sin(r) * lead + math.cos(r) * side; y += math.cos(r) * lead - math.sin(r) * side
        k["ll"] = [round(LA0 + y / KY, 7), round(LO0 + x / KX, 7)]
        k["az"] = round((hd + P.get("azr", 0)) % 360, 1)
    elif "xy" in P:
        x, y = P["xy"]; k["ll"] = [round(LA0 + y / KY, 7), round(LO0 + x / KX, 7)]; k["az"] = P["az"]
    else:
        for f in ("at", "off", "ll"):
            if f in P: k[f] = P[f]
        k["az"] = P["az"]
    k["d"] = P["d"]; k["el"] = P["el"]
    if "h" in P: k["h"] = P["h"]
    elif P["d"] < 150: k["h"] = 1.3                               # cận cảnh: nhìn ngang ngực người
    return k
def M(i, n):                                                      # máy quay gốc V6 thứ n của cảnh i
    k = dict(K6[i][n]); k.pop("t", None); return k

def g(gid, d, azr, el, **kw): return dict(g=gid, d=d, azr=azr, el=el, **kw)
SHOTS = {
 0: [(0, 3.4, M(0, 0), M(0, 0)),
     (3.4, 15, M(0, 1), dict(M(0, 1), d=500)),
     (15, 28.7, M(0, 3), dict(M(0, 3), d=4000)),
     (28.7, 33.2, M(0, 2), M(0, 2)),
     (33.2, 41.1, g("th_vao", 70, 90, 9), g("th_vao", 45, 40, 6)),                       # vó ngựa, đoàn quân tiến bước
     (41.1, 48.4, dict(at="CauPhao_SongHong", off=[600, 600], d=1600, az=200, el=28), dict(at="CauPhao_SongHong", off=[400, 400], d=2600, az=200, el=32)),
     (48.4, 55, dict(ll=[20.9, 105.85], d=9000, az=180, el=40), M(0, 4))],
 1: [(0, 8.1, g("th_vao", 90, 30, 12), g("th_vao", 50, 70, 7)),                           # quân Thanh qua cầu phao
     (8.1, 13.1, g("th_vao_ky", 22, 20, 5), g("th_vao_ky", 30, 80, 7)),
     (13.1, 19.3, g("th_tsn", 14, 0, 6, h=1.5), g("th_tsn", 26, 40, 9, h=1.5)),          # Tôn Sĩ Nghị, đóng quân
     (19.3, 25.8, g("th_luy_nam", 34, 0, 6), g("th_luy_nam", 60, 25, 12)),               # Ngọc Hồi
     (25.8, 31.8, dict(at="KhuongThuong", off=[0, 0], d=900, az=210, el=20), dict(at="KhuongThuong", off=[-200, 100], d=700, az=230, el=18)),
     (31.8, 33.8, g("th_luy", 22, 10, 5), g("th_luy", 26, 30, 6)),                       # tuần phòng
     (33.8, 38.8, dict(at="NgocHoi_Don", off=[-20, -225], d=70, az=200, el=10, h=1), dict(at="NgocHoi_Don", off=[20, -225], d=90, az=160, el=14, h=1)),
     (38.8, 48.8, g("th_tsn", 20, 25, 7, h=1.5), g("th_tsn", 40, -40, 12, h=1.5)),
     (48.8, 56.1, M(1, 2), M(1, 3)),
     (56.1, 65, g("ts_hq", 9, 95, 2, h=0.5), g("ts_hq", 18, 60, 4))],                    # bước chân Tây Sơn
 2: [(0, 6.4, M(2, 0), M(2, 0)),
     (6.4, 18.9, dict(qt=1, d=7, azr=0, el=5, h=1.5), dict(qt=1, d=12, azr=25, el=7, h=1.5)),
     (18.9, 25.5, g("ts_tapket", 30, 0, 5, side=-60), g("ts_tapket", 30, 0, 5, side=60)),  # hàng ngũ tập hợp
     (25.5, 37.6, dict(qt=1, d=18, azr=180, el=14, h=1.6), dict(qt=1, d=30, azr=150, el=18, h=1.6)),
     (37.6, 54.7, g("ts_tapket", 80, 160, 18), g("ts_tapket", 450, 180, 32)),
     (54.7, 65, M(2, 1), M(2, 2))],
 3: [(0, 9.6, M(3, 0), dict(M(3, 0), d=900)),
     (9.6, 15.6, g("ts_hq", 140, 120, 18), g("ts_hq", 90, 100, 12)),
     (15.6, 26, g("ts_hq", 36, 90, 7), g("ts_hq", 36, 90, 7, lead=25)),                  # máy chạy ngang theo đoàn quân
     (26, 28.9, g("ts_hq", 8, 95, 2, h=0.4), g("ts_hq", 9, 85, 2, h=0.4)),              # bàn chân
     (28.9, 31.8, g("ts_hq", 26, 0, 6, lead=48), g("ts_hq", 22, 15, 5, lead=48)),        # tiên phong
     (31.8, 37.5, g("ts_hq_ngua", 14, 70, 6), g("ts_hq_ngua", 18, 110, 7)),              # hậu cần, ngựa thồ
     (37.5, 46.9, g("ts_hq_voi", 24, 60, 7, h=2), g("ts_hq_voi", 30, 130, 9, h=2)),      # voi chở khí tài
     (46.9, 54.4, g("ts_hq", 130, 150, 28), g("ts_hq", 90, 200, 22)),
     (54.4, 62.4, g("ts_hq", 55, 200, 9), g("ts_hq", 40, 230, 7)),                       # mặt trời lặn, đoàn quân vẫn tiến
     (62.4, 72, g("ts_hq", 7, 100, 2, h=0.5), g("ts_hq", 10, 70, 3, h=0.6)),             # đôi chân rã rời
     (72, 81.1, g("ts_hq", 40, 10, 6, lead=50), g("ts_hq", 70, 0, 10, lead=50)),
     (81.1, 95, M(3, 3), M(3, 4))],
 4: [(0, 8.8, dict(qt=1, d=9, azr=200, el=8, h=1.6), dict(qt=1, d=16, azr=160, el=10, h=1.6)),   # Quang Trung gặp các tướng
     (8.8, 54.5, M(4, 0), M(4, 1)),
     (54.5, 65, g("ts_tapket", 26, 0, 5), g("ts_tapket", 120, 20, 16))],                 # năm mới bắt đầu bằng xuất quân
 5: [(0, 3.7, M(5, 0), M(5, 0)),
     (3.7, 13.6, g("ts_hq", 34, 95, 6), g("ts_hq", 34, 95, 6, lead=18)),
     (13.6, 19.3, g("ts_hq", 11, 80, 3), g("ts_hq", 11, 100, 3)),                        # bóng người lặng lẽ
     (19.3, 25.7, g("ts_hq", 24, 10, 5, lead=48), g("ts_hq", 30, 30, 6, lead=48)),
     (25.7, 37.8, g("ts_hq", 260, 150, 24), g("ts_hq", 340, 180, 28)),
     (37.8, 44.3, g("ts_hq_voi", 22, 200, 6, h=2), g("ts_hq_voi", 26, 230, 7, h=2)),
     (44.3, 53.3, dict(at="HaHoi", off=[0, 0], d=1800, az=0, el=14), dict(at="HaHoi", off=[0, 0], d=1300, az=10, el=16)),
     (53.3, 65, g("ts_hq", 45, 180, 9), g("ts_hq", 90, 180, 14))],
 6: [(0, 5.7, M(6, 0), M(6, 0)),
     (5.7, 9.2, g("th_hahoi", 70, 0, 16), g("th_hahoi", 55, 30, 14)),                    # trại Thanh trong bóng tối
     (9.2, 15.8, g("ts_vay", 115, 0, 8, h=1), g("ts_vay", 110, 40, 8, h=1)),             # âm thầm vây
     (15.8, 23.7, g("th_hahoi", 14, 0, 5), g("th_hahoi", 20, 50, 6)),                    # tiếng loa vang
     (23.7, 30.9, g("th_hahoi", 24, 120, 7), g("th_hahoi", 30, 170, 9)),
     (30.9, 38.1, dict(at="HaHoi", off=[0, 0], d=260, az=180, el=70), dict(at="HaHoi", off=[0, 0], d=320, az=200, el=62)),
     (38.1, 50.5, dict(at="HaHoi", off=[0, 0], d=650, az=160, el=30), dict(at="HaHoi", off=[0, 0], d=900, az=200, el=28)),
     (50.5, 65, M(6, 1), M(6, 2))],
 7: [(0, 4.8, M(7, 0), M(7, 0)),
     (4.8, 14.6, dict(at="NgocHoi_Don", off=[-30, -228], d=55, az=200, el=8, h=1), dict(at="NgocHoi_Don", off=[30, -228], d=75, az=165, el=12, h=1)),  # lũy, chông
     (14.6, 21.1, g("th_luy_nam", 22, 0, 5), g("th_luy_nam", 28, 30, 6)),
     (21.1, 25.7, g("th_luy_nam", 16, 190, 6), g("th_luy_nam", 20, 210, 8)),             # hỏa lực chờ (sau lưng lính Thanh)
     (25.7, 32.8, dict(qt=1, d=8, azr=0, el=5, h=1.6), dict(qt=1, d=13, azr=30, el=7, h=1.6)),
     (32.8, 35.6, g("ts_voi", 20, 15, 4, h=2), g("ts_voi", 24, 40, 5, h=2)),             # voi chiến
     (35.6, 38.1, g("ts_xungkich", 20, 10, 5, side=7.5), g("ts_xungkich", 22, 35, 6, side=7.5)),            # đội quân tinh nhuệ
     (38.1, 46.6, g("ts_khieng", 7, 0, 3, h=1.2, side=7.5), g("ts_khieng", 16, 25, 5, h=1.2, side=7.5)),      # tấm mộc rơm
     (46.6, 55, dict(at="NgocHoi_Don", off=[0, -300], d=420, az=190, el=18), M(7, 3))],
 8: [(0, 5.1, M(8, 0), M(8, 0)),
     (5.1, 10.1, g("ts_dubi", 26, 10, 5), g("ts_dubi", 32, 40, 7)),                      # trống trận
     (10.1, 18.8, g("ts_voi", 24, 0, 3, h=2), g("ts_voi", 30, 20, 4, h=2)),              # voi lao tới (máy trước mặt voi)
     (18.8, 22.7, g("th_ky", 28, 90, 5), g("th_ky", 24, 60, 4)),                         # kỵ binh Thanh ra
     (22.7, 34.4, g("th_ky", 22, 50, 5, h=1.4), g("th_ky", 30, 90, 7, h=1.4)),           # ngựa hoảng loạn trước voi
     (34.4, 40.7, g("ts_sung", 18, 25, 4), g("ts_sung", 22, 50, 5)),
     (40.7, 50, g("ts_sung", 8, 15, 3), g("ts_sung", 26, 40, 6)),                        # súng tay, hỏa khí
     (50, 56.9, dict(at="NgocHoi_Don", off=[0, -320], d=160, az=200, el=14), dict(at="NgocHoi_Don", off=[0, -320], d=220, az=170, el=18)),
     (56.9, 60.4, dict(qt=1, d=8, azr=0, el=5, h=1.6), dict(qt=1, d=11, azr=25, el=6, h=1.6)),   # Quang Trung đốc chiến
     (60.4, 70.8, g("ts_voi", 40, 90, 8, h=2), g("ts_voi", 60, 120, 12, h=2)),           # voi tách sườn, kỵ binh lui
     (70.8, 84.6, g("th_luy_nam", 16, 195, 4), g("th_luy_nam", 22, 175, 6)),             # súng tên trong đồn chờ
     (84.6, 95, g("ts_khieng", 9, 0, 3, h=1.2, side=7.5), g("ts_khieng", 14, 20, 4, h=1.2, side=7.5))],
 9: [(0, 9, g("ts_khieng", 240, 180, 24, side=7.5), g("ts_khieng", 200, 190, 20, side=7.5)),
     (9, 17.3, g("ts_khieng", 6, 10, 3, h=1.1, side=7.5), g("ts_khieng", 9, -20, 4, h=1.1, side=7.5)),       # tấm mộc, rơm ướt
     (17.3, 25.2, g("ts_khieng", 16, 90, 6, side=7.5), g("ts_khieng", 18, 125, 7, side=7.5)),                # mười người khiêng, hai mươi theo sau
     (25.2, 30.2, g("ts_khieng", 260, 180, 62, side=7.5), g("ts_khieng", 300, 200, 58, side=7.5)),
     (30.2, 34.6, g("th_luy_nam", 18, 0, 5), g("th_luy_nam", 22, 25, 6)),
     (34.6, 38.7, g("ts_dubi", 22, 0, 5), g("ts_dubi", 26, 25, 6)),
     (38.7, 43.9, dict(qt=1, d=7, azr=10, el=5, h=1.6), dict(qt=1, d=10, azr=40, el=6, h=1.6)),
     (43.9, 47.6, g("ts_khieng", 5, 92, 1, h=0.3, side=7.5), g("ts_khieng", 5, 92, 1, h=0.3, lead=2, side=7.5)),     # một bước, rồi một bước nữa
     (47.6, 54.7, g("ts_khieng", 7, 0, 4, h=1.1, side=7.5), g("ts_khieng", 10, 15, 5, h=1.1, side=7.5)),     # đạn tên, rơm rung
     (54.7, 58.5, g("ts_khieng", 4, 160, 10, h=1.1, side=7.5), g("ts_khieng", 5, 140, 10, h=1.1, side=7.5)), # bàn tay ghì thanh khiêng
     (58.5, 71.6, g("ts_xungkich", 3, 180, 6, h=1.5, side=7.5), g("ts_xungkich", 3, 180, 6, h=1.5, lead=1, side=7.5)),   # sau lưng đồng đội
     (71.6, 83.3, g("ts_khieng", 30, 90, 6, side=7.5), g("ts_khieng", 30, 90, 6, lead=8, side=7.5)),         # máy chạy ngang theo tuyến mộc
     (83.3, 92.4, g("ts_xungkich", 22, 40, 7, side=7.5), g("ts_xungkich", 18, 70, 6, side=7.5)),             # buông mộc, giáp lá cà
     (92.4, 99.8, g("ts_dubi", 30, 120, 8), g("ts_dubi", 40, 150, 10)),
     (99.8, 104.5, dict(at="NgocHoi_Don", off=[0, -150], d=180, az=190, el=28), dict(at="NgocHoi_Don", off=[0, -120], d=260, az=200, el=34)),
     (104.5, 125, M(9, 5), M(9, 6))],
 10: [(0, 7.2, g("th_dammuc", 20, 30, 5), g("th_dammuc", 26, 60, 6)),
      (7.2, 12.8, M(10, 1), M(10, 1)),
      (12.8, 19.6, g("ts_bao", 24, 0, 6), g("ts_bao", 30, 30, 7)),                      # cánh quân chặn
      (19.6, 27.3, g("th_dammuc", 40, 120, 10), g("th_dammuc", 34, 90, 8)),
      (27.3, 32.1, g("ts_bao", 28, 70, 6), g("ts_bao", 30, 100, 7)),
      (32.1, 35.8, g("th_dammuc", 12, 20, 4), g("th_dammuc", 15, 50, 5)),               # rối loạn
      (35.8, 55, M(10, 2), M(10, 3))],
 11: [(0, 13.7, M(11, 0), M(11, 0)),
      (13.7, 28.4, g("ts_dongda", 30, 90, 6), g("ts_dongda", 30, 90, 6, lead=14)),      # vượt Tô Lịch trong bóng tối
      (28.4, 39.6, M(11, 3), dict(M(11, 3), d=1000)),
      (39.6, 44.4, g("ts_dongda", 20, 15, 5), g("ts_dongda", 26, 30, 6)),               # đòn tập kích bắt đầu
      (44.4, 48.8, g("ts_voi_dd", 24, 50, 6, h=2), g("ts_voi_dd", 28, 80, 7, h=2)),       # tượng binh
      (48.8, 52.9, g("ts_ngua_dd", 16, 60, 5), g("ts_ngua_dd", 20, 90, 6)),             # kỵ binh
      (52.9, 59.4, g("ts_dongda", 24, 60, 8), g("ts_dongda", 30, 100, 10)),
      (59.4, 78.4, M(11, 4), M(11, 5)),
      (78.4, 86.4, dict(xy=[-1820, 4197], az=200, d=320, el=24), dict(xy=[-1820, 4197], az=230, d=380, el=26)),
      (86.4, 92, g("ts_dongda", 40, 180, 9), g("ts_dongda", 60, 180, 12)),              # thọc sâu về kinh thành
      (92, 105, M(11, 5), M(11, 6))],
 12: [(0, 8.6, g("th_tsn", 14, 0, 6, h=1.5), g("th_tsn", 20, 35, 7, h=1.5)),             # tin dữ tới đại bản doanh
      (8.6, 13.8, M(12, 0), M(12, 0)),
      (13.8, 17.6, g("th_tsn", 18, 60, 6, h=1.4), g("th_tsn", 20, 80, 6, h=1.4)),        # Tôn Sĩ Nghị bỏ chạy
      (17.6, 24, g("th_rut", 30, 90, 6), g("th_rut", 28, 60, 5)),                        # chen chúc vượt sông
      (24, 28.8, g("ts_vao", 24, 15, 5), g("ts_vao", 30, 40, 6)),                        # Tây Sơn vào kinh thành
      (28.8, 41.5, M(12, 3), dict(M(12, 3), d=700)),
      (41.5, 51, g("ts_vao", 8, 90, 2, h=0.5), g("ts_vao", 20, 60, 5)),                  # bước chân qua cửa ô
      (51, 70, M(12, 3), M(12, 4))],
 13: [(0, 21, M(13, 0), M(13, 1)),
      (21, 26.2, M(13, 1), M(13, 1)),
      (26.2, 38.1, g("ts_hoangthanh", 20, 0, 5), g("ts_hoangthanh", 45, 20, 10)),        # những người lính ra trận
      (38.1, 63, M(13, 2), M(13, 3)),
      (63, 85, M(13, 3), M(13, 4))],
}
for i, shots in SHOTS.items():
    keys = []
    prev = None
    for (t0, t1, A, B) in shots:
        assert prev is None or abs(t0 - prev) < 1e-6, (i, t0, prev); prev = t1
        keys.append(key(i, t0, A, cut=bool(keys)))
        keys.append(key(i, t1, B))
    assert abs(prev - S["scenes"][i]["dur"]) < 1e-6, (i, prev)
    S["scenes"][i]["keys"] = keys
json.dump(S, open(SP, "w"), ensure_ascii=False, indent=1)
print("đã ghi máy quay:", {i: len(S["scenes"][i]["keys"]) for i in SHOTS})
