# Sinh web/quan.json: đội hình nhân vật và kịch bản chuyển động theo từng cảnh (V7).
# Toạ độ: mét cục bộ Blender (X Đông, Y Bắc). Mỗi đoạn: [u0, u1, động_tác, dx, dy] (u = tỉ lệ thời gian cảnh 0..1).
# Đội "path": thành viên có (dọc, ngang) theo tuyến; đoạn: [u0, u1, động_tác, s0, s1] (s = mét dọc tuyến).
# Động tác "an" = ẩn. Mật độ quân là minh hoạ, KHÔNG phải quân số sử liệu.
import json, math, random, os

R = random.Random(1789)
HERE = os.path.dirname(os.path.abspath(__file__))
TT = json.load(open(os.path.join(HERE, "the_tran_blender.json")))["nhom"]   # vị trí đặt trong Blender V4

KX, KY, LA0, LO0 = 103992.0, 110716.0, 20.96609, 105.8355
ll = lambda la, lo: ((lo - LO0) * KX, (la - LA0) * KY)
# khung đồn Ngọc Hồi: eu = dọc đường thiên lý (hướng Bắc), ev = ngang (hướng Đông)
C0 = (1039.92, -5158.26); EU = (-0.15986, 0.98714); EV = (0.98714, 0.15986)
F = lambda u, v: (C0[0] + EU[0] * u + EV[0] * v, C0[1] + EU[1] * u + EV[1] * v)
def local(x, y):
    dx, dy = x - C0[0], y - C0[1]
    return dx * EU[0] + dy * EU[1], dx * EV[0] + dy * EV[1]
YAW_N = math.atan2(EU[0], -EU[1])          # mặt nhìn về đồn (Bắc)
yaw_of = lambda dx, dy: math.atan2(dx, -dy)
mv = lambda du, dv: [round(EU[0] * du + EV[0] * dv, 2), round(EU[1] * du + EV[1] * dv, 2)]   # dời theo khung đồn

G = []
def doi(id, kind, members, scenes, **kw):
    G.append(dict(id=id, kind=kind, mode="fixed", m=members, sc={str(k): v for k, v in scenes.items()}, **kw))
def doi_tuyen(id, kind, path, members, scenes, **kw):
    G.append(dict(id=id, kind=kind, mode="path", path=[[round(a, 1), round(b, 1)] for a, b in path], m=members,
                  sc={str(k): v for k, v in scenes.items()}, **kw))
def mem(x, y, yaw, du=0.0):
    x2, y2 = x + EU[0] * du, y + EU[1] * du
    return [round(x2, 2), round(y2, 2), round(yaw, 3), round(R.random(), 3), R.randrange(4)]
def seg(u0, u1, clip, d=(0, 0)):
    return [u0, u1, clip, d[0], d[1]]
def scene(o, *segs):
    return {"o": o, "s": list(segs)}

# ---------------------------------------------------------------- NGỌC HỒI (C08 = 7, C09 = 8, C10 = 9)
TIEN = 50.0                            # lùi tuyến xuất phát lên 50 m so với bản Blender (mộc ở u ≈ −420)
moc = [p for p in TT["20b_NgocHoi_20Moc (moc chua hoan thien)"] if p[0].startswith("MOC")]
nguoi = [p for p in TT["20b_NgocHoi_20Moc (moc chua hoan thien)"] if not p[0].startswith("MOC")]
khieng, theo = [], []
for p in nguoi:
    (khieng if local(p[1], p[2])[0] > -473.5 else theo).append(p)
# C09: cả tuyến nhích lên 60 m; C10: tiến tới đai chông (u ≈ −230), hạ mộc, xông lên lũy (u ≈ −183), đánh giáp lá cà, tràn vào
A9 = mv(60, 0); A10a = mv(130, 0); A10b = mv(47, 0); A10c = mv(70, 0)
O8 = [0, 0]; O9 = A9; O10 = [A9[0] + A10a[0], A9[1] + A10a[1]]
kb_moc = {7: scene([0, 0], seg(0, 1, "thu")),
          8: scene(O8, seg(0, .55, "thu"), seg(.55, 1, "khieng", A9)),
          9: scene(O9, seg(0, .66, "khieng", A10a), seg(.66, .74, "chay", A10b), seg(.74, .8, "chem"), seg(.8, 1, "chay", A10c))}
kb_theo = {7: scene([0, 0], seg(0, 1, "thu")),
           8: scene(O8, seg(0, .55, "thu"), seg(.55, 1, "khom", A9)),
           9: scene(O9, seg(0, .66, "khom", A10a), seg(.66, .74, "chay", A10b), seg(.74, .8, "danh"), seg(.8, 1, "chay", A10c))}
doi("ts_khieng", "ts", [mem(p[1], p[2], YAW_N, TIEN) for p in khieng], kb_moc)
doi("ts_xungkich", "ts", [mem(p[1], p[2], YAW_N, TIEN) for p in theo], kb_theo)
# tấm mộc: đi cùng người khiêng, hạ xuống ở cuối đoạn tiến (u = .62) rồi nằm lại
kb_tam = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene(O8, seg(0, .55, "dung"), seg(.55, 1, "dung", A9)),
          9: scene(O9, seg(0, .66, "dung", A10a), seg(.66, 1, "nam"))}
doi("tam_moc", "moc", [mem(p[1], p[2], YAW_N, TIEN) for p in moc], kb_tam)

# voi chiến: đứng giữa phía trước, C09 tiến lên rồi tách sang hai sườn để lộ đội mộc
voi = []
for k in range(8):
    s = -1 if k < 4 else 1; v = s * (40 + (k % 4) * 22)
    x, y = F(-350 + R.uniform(-6, 6), v); voi.append(mem(x, y, YAW_N))
doi("ts_voi", "voi", voi[:4], {7: scene([0, 0], seg(0, 1, "dung")),
    8: scene([0, 0], seg(0, .24, "di", mv(55, 0)), seg(.24, .34, "roi", mv(5, 0)), seg(.34, .62, "dung"), seg(.62, .8, "chay", mv(10, -95)), seg(.8, 1, "dung")),
    9: scene(mv(70, -95), seg(0, 1, "dung"))})
doi("ts_voi2", "voi", voi[4:], {7: scene([0, 0], seg(0, 1, "dung")),
    8: scene([0, 0], seg(0, .24, "di", mv(55, 0)), seg(.24, .34, "roi", mv(5, 0)), seg(.34, .62, "dung"), seg(.62, .8, "chay", mv(10, 95)), seg(.8, 1, "dung")),
    9: scene(mv(70, 95), seg(0, 1, "dung"))})
# kỵ binh Thanh ra cửa Nam nghênh đánh, rối loạn trước voi, lui về đồn (ngựa tạm, chưa có người cưỡi)
ky = []
for k in range(16):
    x, y = F(-200 - (k // 8) * 6, -40 + (k % 8) * 11); ky.append(mem(x, y, YAW_N + math.pi))
doi("th_ky", "ngua", ky, {8: scene([0, 0], seg(0, .08, "an"), seg(.08, .24, "chay", mv(-75, 0)), seg(.24, .36, "roi"),
    seg(.36, .52, "chay", mv(75, 0)), seg(.52, 1, "an"))}, tam=True)
# Quang Trung, voi chỉ huy, ngựa tướng phía sau giữa
x, y = F(-510, 0); qt = [x, y]
doi("ts_voi_chihuy", "voi", [mem(*F(-510, 9), YAW_N)], {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")), 9: scene([0, 0], seg(0, .7, "dung"), seg(.7, 1, "di", mv(150, 0)))})
doi("ts_ngua_tuong", "ngua", [mem(*F(-516, -6 - k * 3), YAW_N) for k in range(4)], {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")), 9: scene([0, 0], seg(0, 1, "dung"))})
# quân dự bị: hàng đầu là lính súng (ngắm), C10 cuối cảnh tràn lên
db = TT["20a_NgocHoi_TaySon"]; db = [p for p in db if p[0].startswith("NV_LinhTaySon")]
hang = sorted(db, key=lambda p: -local(p[1], p[2])[0])
sung, sau = hang[:30], hang[30:]
kb_db = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")),
         9: scene([0, 0], seg(0, .74, "dung"), seg(.74, 1, "chay", mv(170, 0)))}
kb_sung = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, .3, "dung"), seg(.3, 1, "ngam")),
           9: scene([0, 0], seg(0, .74, "ngam"), seg(.74, 1, "chay", mv(170, 0)))}
doi("ts_dubi", "ts", [mem(p[1], p[2], YAW_N, TIEN) for p in sau], kb_db)
doi("ts_sung", "ts", [mem(p[1], p[2], YAW_N, TIEN + 25) for p in sung], kb_sung)
# quân Thanh trên lũy và trong đồn
luy = [p for p in TT["20c_NgocHoi_QuanThanh"] if "LOD1" in p[0]]; trong = [p for p in TT["20c_NgocHoi_QuanThanh"] if "LOD2" in p[0]]
nam = [p for p in luy if local(p[1], p[2])[0] < -150]; khac = [p for p in luy if local(p[1], p[2])[0] >= -150]
lui = mv(140, 0)
doi("th_luy_nam", "th", [mem(p[1], p[2], p[4]) for p in nam], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, .25, "nghi"), seg(.25, 1, "ngam")),
    9: scene([0, 0], seg(0, .74, "ngam"), seg(.74, .8, "danh"), seg(.8, .84, "vapnga"), seg(.84, 1, "chay", lui))})
doi("th_luy", "th", [mem(p[1], p[2], p[4]) for p in khac], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, 1, "ngam")),
    9: scene([0, 0], seg(0, .8, "ngam"), seg(.8, 1, "chay", mv(60, -80)))})
doi("th_trong", "th", [mem(p[1], p[2], YAW_N + math.pi) for p in trong], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, 1, "thu")),
    9: scene([0, 0], seg(0, .8, "thu"), seg(.8, 1, "chay", mv(40, -120)))})

# ---------------------------------------------------------------- ĐẦM MỰC (C11 = 10): quân Thanh tháo chạy, đạo quân Bảo chặn
def cot(n, w, gap=2.2, back=0.0):
    out = []
    for k in range(n):
        out.append([round(-back - (k // w) * gap + R.uniform(-.4, .4), 2), round((k % w - (w - 1) / 2) * 1.6 + R.uniform(-.3, .3), 2), round(R.random(), 3), R.randrange(4)])
    return out
p_dm = [(676, -5324), (-572, -4660), (-1716, -4106)]
doi_tuyen("th_dammuc", "th", p_dm, cot(120, 8, 2.4), {10: {"s": [[0, .58, "chay", 900, 1120], [.58, .7, "vapnga", 1120, 1126], [.7, 1, "chay", 1126, 1240]]}})
p_bao = [(-364, -5989), (-780, -4549), (-1404, -3774)]
doi_tuyen("ts_bao", "ts", p_bao, cot(150, 10, 2.2), {10: {"s": [[0, .5, "chay", 1300, 1480], [.5, 1, "ngam", 1480, 1480]]}})

# ---------------------------------------------------------------- KHƯƠNG THƯỢNG – ĐỐNG ĐA (C12 = 11)
ben = (-2028.0, 3588.0); tgt = (-1820.0, 4197.0); L = math.hypot(tgt[0] - ben[0], tgt[1] - ben[1]); d = ((tgt[0] - ben[0]) / L, (tgt[1] - ben[1]) / L)
dd = lambda m: [round(d[0] * m, 2), round(d[1] * m, 2)]
tsdd = TT["20e_KhuongThuong_TaySon"]
kb_dd = {11: scene(dd(-60), seg(0, .36, "khom", dd(100)), seg(.36, .6, "chay", dd(160)), seg(.6, .85, "chem"), seg(.85, 1, "chay", dd(80)))}
kb_dd_vat = {11: scene(dd(-60), seg(0, .36, "di", dd(100)), seg(.36, .6, "chay", dd(160)), seg(.6, .85, "roi"), seg(.85, 1, "chay", dd(80)))}
doi("ts_dongda", "ts", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Linh" in p[0]], kb_dd)
doi("ts_voi_dd", "voi", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Voi" in p[0]], kb_dd_vat)
doi("ts_ngua_dd", "ngua", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Ngua" in p[0]], kb_dd_vat)
doi("th_kt", "th", [mem(p[1], p[2], p[4]) for p in TT["20f_KhuongThuong_QuanThanh"]], {
    1: scene([0, 0], seg(0, 1, "nghi")),
    11: scene([0, 0], seg(0, .42, "nghi"), seg(.42, .6, "vapnga"), seg(.6, 1, "chay", [120, 260]))})

# ---------------------------------------------------------------- THĂNG LONG (C01 = 0, C02 = 1, C13 = 12, C14 = 13)
tl = TT["20g_ThangLong_TonSiNghi"]
cp = (2756.0, 7076.0); tly = (2184.0, 6910.0); dcp = [round((cp[0] - tly[0]) * .8, 1), round((cp[1] - tly[1]) * .8, 1)]
doi("th_canve", "th", [mem(p[1], p[2], p[4]) for p in tl if "Linh" in p[0]], {
    0: scene([0, 0], seg(0, 1, "nghi")), 1: scene([0, 0], seg(0, 1, "nghi")),
    12: scene([0, 0], seg(0, .19, "nghi"), seg(.19, .6, "chay", dcp), seg(.6, 1, "an"))})
doi("th_tsn", "tsn", [mem(p[1], p[2], p[4]) for p in tl if "TonSiNghi" in p[0]], {
    0: scene([0, 0], seg(0, 1, "dung")), 1: scene([0, 0], seg(0, 1, "dung")),
    12: scene([0, 0], seg(0, .19, "dung"), seg(.19, .6, "di", dcp), seg(.6, 1, "an"))})
p_song = [(1092, 7297), (2340, 7187), (3796, 7740), (5044, 8847)]
doi_tuyen("th_rut", "th", p_song, cot(160, 8, 2.3), {12: {"s": [[0, .9, "chay", 700, 1050], [.9, 1, "vapnga", 1050, 1060]]}})
p_vao = [(1450, 3950), (1508, 4529), (1320, 5500), (980, 6500), (560, 7150)]
doi_tuyen("ts_vao", "ts", p_vao, cot(200, 8, 2.2), {12: {"s": [[0, .2, "an", 0, 0], [.2, .9, "chay", 250, 520], [.9, 1, "dung", 520, 520]]}})
ht = cot(240, 16, 2.4)
doi_tuyen("ts_hoangthanh", "ts", [(468, 6700), (468, 7150)], ht, {13: {"s": [[0, 1, "dung", 420, 420]]}})


# ---------------------------------------------------------------- V8b: đội bổ sung để máy quay có cảnh cận theo lời dẫn
p_vao_tl = [(4700, 8700), (4004, 8183), (2756, 7076), (2184, 6910)]          # Bồ Đề → cầu phao → Tây Long
doi_tuyen("th_vao", "th", p_vao_tl, cot(240, 6, 2.0), {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "chay", 200, 420, .55]]},
    1: {"s": [[0, .45, "chay", 700, 1000, .55], [.45, 1, "nghi", 1000, 1000]]}})
doi_tuyen("th_vao_ky", "ngua", p_vao_tl, cot(12, 3, 3.2), {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "di", 240, 460]]},
    1: {"s": [[0, .45, "di", 740, 1040], [.45, 1, "dung", 1040, 1040]]}})
p_hq = [(3276, -12299), (2236, -8978), (1300, -5989)]                            # đường thiên lý từ nam lên
doi_tuyen("ts_hq", "ts", p_hq, cot(300, 6, 1.9), {
    1: {"s": [[0, .85, "an", 0, 0], [.85, 1, "buoc", 260, 275]]},
    3: {"s": [[0, 1, "buoc", 230, 380]]},
    5: {"s": [[0, 1, "khom", 150, 260]]}})
doi_tuyen("ts_hq_voi", "voi", p_hq, [[-110 - k * 9, (1 if k % 2 else -1) * 1.5, R.random(), 0] for k in range(4)], {
    3: {"s": [[0, 1, "di", 230, 380]]}, 5: {"s": [[0, 1, "di", 150, 260]]}})
doi_tuyen("ts_hq_ngua", "ngua", p_hq, [[-150 - k * 4, (1 if k % 2 else -1) * 1.2, R.random(), 0] for k in range(10)], {
    3: {"s": [[0, 1, "di", 230, 380]]}, 5: {"s": [[0, 1, "di", 150, 260]]}})
# tập hợp trước Quang Trung (minh hoạ ở mép nam sa bàn; Phú Xuân, Tam Điệp nằm ngoài khung)
TK = (2700.0, -11400.0)
tk = [mem(TK[0] + (k % 20 - 9.5) * 1.6 + R.uniform(-.2, .2), TK[1] + (k // 20) * 1.8, 0.0) for k in range(300)]
doi("ts_tapket", "ts", tk, {2: scene([0, 0], seg(0, .6, "dung"), seg(.6, 1, "buoc", [0, -12])), 4: scene([0, 0], seg(0, 1, "dung"))})
doi("ts_tapket_voi", "voi", [mem(TK[0] + s * 24, TK[1] + 8, 0.0) for s in (-1, 1)], {2: scene([0, 0], seg(0, 1, "dung")), 4: scene([0, 0], seg(0, 1, "dung"))})
# Hà Hồi: vây lặng lẽ rồi gọi hàng (ngoài khung, minh hoạ)
HH = (3900.0, -13960.0)
vay = [mem(HH[0] + 110 * math.cos(a), HH[1] + 110 * math.sin(a), math.atan2(-math.cos(a), math.sin(a))) for a in [k / 160 * 2 * math.pi for k in range(160)]]
doi("ts_vay", "ts", vay, {6: scene([0, 0], seg(0, .14, "khom", [0, 0]), seg(.14, .45, "thu"), seg(.45, 1, "ngam"))})
thh = [mem(HH[0] + R.uniform(-11, 11), HH[1] + R.uniform(-11, 11), R.uniform(-3.1, 3.1)) for k in range(60)]
doi("th_hahoi", "th", thh, {6: scene([0, 0], seg(0, .36, "nghi"), seg(.36, .47, "vapnga"), seg(.47, 1, "dung"))})
json.dump({"note": "Tái dựng mô phỏng. Mật độ quân là minh hoạ, không phải quân số sử liệu.",
           "quangtrung": {"2": [TK[0], TK[1] - 14, math.pi], "4": [TK[0], TK[1] - 14, math.pi], "7": qt + [YAW_N], "8": qt + [YAW_N], "9": qt + [YAW_N], "12": [520, 7000, math.pi], "13": [468, 7110, math.pi]},
           "groups": G}, open(os.path.join(HERE, "..", "web", "quan.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(len(G), "đội", sum(len(g["m"]) for g in G), "thành viên")
