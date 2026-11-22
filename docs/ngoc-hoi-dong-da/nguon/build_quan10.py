# V10 · Sinh web10/quan.json: đội hình nhân vật và kịch bản chuyển động theo từng cảnh (V7).
# Toạ độ: mét cục bộ Blender (X Đông, Y Bắc). Mỗi đoạn: [u0, u1, động_tác, dx, dy] (u = tỉ lệ thời gian cảnh 0..1).
# Đội "path": thành viên có (dọc, ngang) theo tuyến; đoạn: [u0, u1, động_tác, s0, s1] (s = mét dọc tuyến).
# Động tác "an" = ẩn. Mật độ quân là minh hoạ, KHÔNG phải quân số sử liệu.
import json, math, random, os
from moc_cu import U as UC

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
def seg(u0, u1, clip, d=(0, 0), spd=None):
    return [u0, u1, clip, d[0], d[1]] + ([spd] if spd else [])
def scene(o, *segs):
    return {"o": o, "s": list(segs)}
# binh khí theo người (g.vk lặp theo thứ tự thành viên): 0 tay không, 1 súng hỏa hồ, 2 giáo, 3 gươm
VK_TS = [2, 3, 2, 1, 3]; VK_TH = [2, 3, 2, 1, 2]; VK_SUNG = [1]; VK_KHONG = [0]

# ---------------------------------------------------------------- NGỌC HỒI (C08 = 7, C09 = 8, C10 = 9)
TIEN = 50.0                            # lùi tuyến xuất phát lên 50 m so với bản Blender (mộc ở u ≈ −420)
moc = [p for p in TT["20b_NgocHoi_20Moc (moc chua hoan thien)"] if p[0].startswith("MOC")]
moc_xy = [F(*(lambda uv: (uv[0] - TIEN * 0 + TIEN, uv[1]))(local(p[1], p[2]))) for p in moc]
# V10.5 theo sử: mỗi bức mộc = 3 tấm ghép, nghiêng 60°, 10 người cùng khiêng (2 hàng × 5, không đòn), lưng giắt dao ngắn;
# 20 người mang binh khí theo sau (4 hàng × 5); 20 bức dàn hàng ngang thành trận chữ "nhất"
khieng, theo = [], []
for (mx, my) in moc_xy:
    mu, mvv = local(mx, my)
    for r in range(2):
        for c in range(5):
            x, y = F(mu - 0.45 - r * 0.6, mvv + (c - 2) * 0.66); khieng.append(mem(x, y, YAW_N))
    for r in range(4):
        for c in range(5):
            x, y = F(mu - 2.3 - r * 1.3 + R.uniform(-.1, .1), mvv + (c - 2) * 0.75 + R.uniform(-.08, .08)); theo.append(mem(x, y, YAW_N))
A9 = mv(60, 0); A10a = mv(162, 0); A10b = mv(15, 0); A10c = mv(70, 0)
O8 = [0, 0]; O9 = A9; O10 = [A9[0] + A10a[0], A9[1] + A10a[1]]
kb_moc = {7: scene([0, 0], seg(0, 1, "dung")),
          8: scene(O8, seg(0, .55, "dung"), seg(.55, 1, "khieng", A9)),
          9: scene(O9, seg(0, .66, "khieng", A10a), seg(.66, .74, "chay", A10b), seg(.74, .86, "danh"), seg(.86, 1, "chay", A10c))}
kb_theo = {7: scene([0, 0], seg(0, 1, "thu")),
           8: scene(O8, seg(0, .55, "thu"), seg(.55, 1, "buoc", A9)),
           9: scene(O9, seg(0, .66, "buoc", A10a), seg(.66, .74, "chay", A10b), seg(.74, .86, "danh"), seg(.86, 1, "chay", A10c))}
doi("ts_khieng", "ts", khieng, kb_moc, vk=VK_KHONG, vk2=[3], dense=0)
doi("ts_xungkich", "ts", theo, kb_theo, vk=VK_TS)
kb_tam = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene(O8, seg(0, .55, "dung"), seg(.55, 1, "dung", A9)),
          9: scene(O9, seg(0, .66, "dung", A10a), seg(.66, 1, "nam"))}
doi("tam_moc", "moc", [mem(x, y, YAW_N) for (x, y) in moc_xy], kb_tam)

# voi chiến: đứng giữa phía trước, C09 tiến lên rồi tách sang hai sườn để lộ đội mộc
voi = []
for k in range(8):
    s = -1 if k < 4 else 1; v = s * (40 + (k % 4) * 22)
    x, y = F(-350 + R.uniform(-6, 6), v); voi.append(mem(x, y, YAW_N))
doi("ts_voi", "voi", voi[:4], {7: scene([0, 0], seg(0, 1, "dung")),
    8: scene([0, 0], seg(0, .24, "di", mv(55, 0)), seg(.24, .34, "roi", mv(5, 0)), seg(.34, .62, "dung"), seg(.62, .8, "chay", mv(10, -95)), seg(.8, 1, "dung")),
    9: scene(mv(70, -95), seg(0, 1, "dung"))}, linh=1)
doi("ts_voi2", "voi", voi[4:], {7: scene([0, 0], seg(0, 1, "dung")),
    8: scene([0, 0], seg(0, .24, "di", mv(55, 0)), seg(.24, .34, "roi", mv(5, 0)), seg(.34, .62, "dung"), seg(.62, .8, "chay", mv(10, 95)), seg(.8, 1, "dung")),
    9: scene(mv(70, 95), seg(0, 1, "dung"))}, linh=1)
# kỵ binh Thanh ra cửa Nam nghênh đánh, rối loạn trước voi, lui về đồn (ngựa tạm, chưa có người cưỡi)
ky = []
for k in range(16):
    x, y = F(-200 - (k // 8) * 6, -40 + (k % 8) * 11); ky.append(mem(x, y, YAW_N + math.pi))
_kc = F(-255, 0)
doi("th_ky", "nguath", ky, {8: scene([0, 0], seg(0, .08, "an"), seg(.08, .24, "chay", mv(-75, 0)), seg(.24, .3, "roi"),
    seg(.3, .62, "chay"), seg(.62, 1, "an"))}, tam=True, tan={"8": [.3, .62, 320, _kc[0] - EU[0] * 40, _kc[1] - EU[1] * 40]})
# Quang Trung, voi chỉ huy, ngựa tướng phía sau giữa
x, y = F(-510, 0); qt = [x, y]
doi("ts_voi_chihuy", "voi", [mem(*F(-510, 9), YAW_N)], {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")), 9: scene([0, 0], seg(0, .7, "dung"), seg(.7, 1, "di", mv(150, 0)))})
doi("ts_ngua_tuong", "ngua", [mem(*F(-516, -6 - k * 3), YAW_N) for k in range(4)], {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")), 9: scene([0, 0], seg(0, 1, "dung"))},
    ten={"0": "Hám Hổ hầu", "1": "Phan Văn Lân"})
# quân dự bị: hàng đầu là lính súng (ngắm), C10 cuối cảnh tràn lên
db = TT["20a_NgocHoi_TaySon"]; db = [p for p in db if p[0].startswith("NV_LinhTaySon")]
hang = sorted(db, key=lambda p: -local(p[1], p[2])[0])
sung, sau = hang[:30], hang[30:]
kb_db = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "dung")),
         9: scene([0, 0], seg(0, .74, "dung"), seg(.74, 1, "chay", mv(170, 0)))}
kb_sung = {7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, .3, "dung"), seg(.3, 1, "ngam")),
           9: scene([0, 0], seg(0, .74, "ngam"), seg(.74, 1, "chay", mv(170, 0)))}
doi("ts_dubi", "ts", [mem(p[1], p[2], YAW_N, TIEN) for p in sau], kb_db, vk=VK_TS)
doi("ts_sung", "ts", [mem(p[1], p[2], YAW_N, TIEN + 25) for p in sung], kb_sung, vk=VK_SUNG)
# quân Thanh trên lũy và trong đồn
luy = [p for p in TT["20c_NgocHoi_QuanThanh"] if "LOD1" in p[0]]; trong = [p for p in TT["20c_NgocHoi_QuanThanh"] if "LOD2" in p[0]]
nam = [p for p in luy if local(p[1], p[2])[0] < -150]; khac = [p for p in luy if local(p[1], p[2])[0] >= -150]
lui = mv(140, 0)
doi("th_luy_nam", "th", [mem(p[1], p[2], p[4]) for p in nam], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, .25, "nghi"), seg(.25, 1, "ngam")),
    9: scene([0, 0], seg(0, .74, "ngam"), seg(.74, .8, "danh"), seg(.8, .84, "trungdon"), seg(.84, 1, "chay", lui))}, vk=VK_TH, nga=[3, .82], loan=1)
doi("th_luy", "th", [mem(p[1], p[2], p[4]) for p in khac], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, 1, "ngam")),
    9: scene([0, 0], seg(0, .78, "ngam"), seg(.78, .83, "trungdon"), seg(.83, 1, "chay", mv(60, -80)))}, vk=VK_TH, nga=[4, .81], loan=1)
doi("th_trong", "th", [mem(p[1], p[2], YAW_N + math.pi) for p in trong], {
    1: scene([0, 0], seg(0, 1, "nghi")), 7: scene([0, 0], seg(0, 1, "nghi")), 8: scene([0, 0], seg(0, 1, "thu")),
    9: scene([0, 0], seg(0, .8, "thu"), seg(.8, .84, "danh"), seg(.84, 1, "chay", mv(40, -120)))}, vk=VK_TH, nga=[5, .83], loan=1)
# lính Thanh tuần tra 4 góc đồn: cầm giáo, gươm đi lại dọc tường (C02, C08, đầu C09); bị đánh thì ngã, chạy
for gi, (cu, cv, du, dv) in enumerate([(150, -105, -45, 0), (150, 105, 0, -45), (-150, 105, 45, 0), (-150, -105, 0, 45)]):
    pts = [mem(*F(cu + R.uniform(-2, 2), cv + (k - 2) * 1.4), 0.0) for k in range(5)]
    for p in pts: p[2] = round(yaw_of(*mv(du, dv)), 3)
    go, ve = mv(du, dv), mv(-du, -dv)
    doi("th_tuantra%d" % gi, "th", pts, {
        1: scene([0, 0], seg(0, .5, "di", go), seg(.5, 1, "di", ve)),
        7: scene([0, 0], seg(0, .5, "di", go), seg(.5, 1, "di", ve)),
        8: scene([0, 0], seg(0, .3, "di", go), seg(.3, 1, "ngam")),
        9: scene(go, seg(0, .8, "ngam"), seg(.8, .84, "trungdon"), seg(.84, 1, "chay", mv(120, 0)))}, vk=[2, 3, 2, 3, 1], nga=[2, .82], loan=1)

# ---------------------------------------------------------------- ĐẦM MỰC (C11 = 10): quân Thanh tháo chạy, đạo quân Bảo chặn
def cot(n, w, gap=2.2, back=0.0):
    out = []
    for k in range(n):
        out.append([round(-back - (k // w) * gap + R.uniform(-.4, .4), 2), round((k % w - (w - 1) / 2) * 1.6 + R.uniform(-.3, .3), 2), round(R.random(), 3), R.randrange(4)])
    return out
p_dm = [(676, -5324), (-572, -4660), (-1716, -4106)]
doi_tuyen("th_dammuc", "th", p_dm, cot(150, 3, 1.6), {10: {"s": [[0, .58, "chay", 880, 1120], [.58, .7, "chay", 1120, 1150], [.7, 1, "chay", 1150, 1260]]}},
          vk=VK_TH, loan=1, nga=[7, .6], rai={"10": [0.08, 70, 55]}, nhip=1)
p_bao = [(-364, -5989), (-780, -4549), (-1404, -3774)]
doi_tuyen("ts_bao", "ts", p_bao, cot(300, 30, 2.0), {10: {"s": [[0, .5, "chay", 1300, 1480], [.5, 1, "ngam", 1480, 1480]]}}, vk=[1, 1, 2, 3])
doi_tuyen("ts_bao_tuong", "ngua", p_bao, [[8.0, 0.0, 0.2, 0]], {10: {"s": [[0, .5, "chay", 1300, 1480], [.5, 1, "dung", 1480, 1480]]}}, ten={"0": "Đại đô đốc Bảo"})

# ---------------------------------------------------------------- KHƯƠNG THƯỢNG – ĐỐNG ĐA (C12 = 11)
ben = (-2028.0, 3588.0); tgt = (-1820.0, 4197.0); L = math.hypot(tgt[0] - ben[0], tgt[1] - ben[1]); d = ((tgt[0] - ben[0]) / L, (tgt[1] - ben[1]) / L)
dd = lambda m: [round(d[0] * m, 2), round(d[1] * m, 2)]
tsdd = TT["20e_KhuongThuong_TaySon"]
kb_dd = {11: scene(dd(-60), seg(0, .36, "chay", dd(100), 0.7), seg(.36, .6, "chay", dd(160)), seg(.6, .85, "chem"), seg(.85, 1, "chay", dd(80)))}
kb_dd_vat = {11: scene(dd(-60), seg(0, .36, "di", dd(100)), seg(.36, .6, "chay", dd(160)), seg(.6, .85, "roi"), seg(.85, 1, "chay", dd(80)))}
doi("ts_dongda", "ts", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Linh" in p[0]], kb_dd, vk=VK_TS, duoc=4)
U_SND = UC(11, "Sầm Nghi Đống")
doi("th_snd", "snd", [mem(-1247.9, 4790.0, math.pi * 0.85)], {11: scene([0, 0], seg(0, U_SND + .01, "dung"), seg(U_SND + .01, 1, "nga"))}, ten={"0": "Sầm Nghi Đống"})
doi("th_snd_ve", "th", [mem(-1247.9 + 4 * math.cos(a), 4806.2 + 4 * math.sin(a), a + math.pi / 2) for a in [k / 8 * 2 * math.pi for k in range(8)]],
    {11: scene([0, 0], seg(0, U_SND - .02, "dung"), seg(U_SND - .02, 1, "chay", [-60, 140]))}, vk=VK_TH, loan=1)
doi("ts_voi_dd", "voi", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Voi" in p[0]], kb_dd_vat)
doi("ts_ngua_dd", "ngua", [mem(p[1] + d[0] * 150, p[2] + d[1] * 150, p[4]) for p in tsdd if "Ngua" in p[0]], kb_dd_vat, ten={"0": "Đặng Tiến Đông"})
doi("th_kt", "th", [mem(p[1], p[2], p[4]) for p in TT["20f_KhuongThuong_QuanThanh"]], {
    1: scene([0, 0], seg(0, 1, "nghi")),
    11: scene([0, 0], seg(0, .42, "nghi"), seg(.42, .5, "trungdon"), seg(.5, .6, "vap"), seg(.6, 1, "chay", [120, 260]))}, vk=VK_TH, nga=[4, .48], loan=1)

# ---------------------------------------------------------------- THĂNG LONG (C01 = 0, C02 = 1, C13 = 12, C14 = 13)
tl = TT["20g_ThangLong_TonSiNghi"]
U_TIN = UC(12, "Tôn Sĩ Nghị vội vã"); U_CAT = UC(12, "Phía sau, các cánh quân", them=0.6)
P_CAU = [(2184.0, 6910.0), (2420.0, 6947.0), (3092.0, 7205.0), (4004.0, 8183.0), (4700.0, 8700.0), (5200.0, 9150.0)]   # Tây Long → cầu phao vắt ngang sông Hồng (qua mốc Cầu phao) → Bồ Đề
hang_tl = []
for k in range(len(tl) - 1 + 120):
    hang_tl.append([round(-6 - (k // 10) * 1.6, 2), round((k % 10 - 4.5) * 1.3, 2), round(R.random(), 3), R.randrange(4)])
doi_tuyen("th_canve", "th", P_CAU, hang_tl, {
    0: {"s": [[0, 1, "dung", 60, 60]]}, 1: {"s": [[0, 1, "dung", 60, 60]]},
    12: {"s": [[0, U_TIN, "dung", 60, 60], [U_TIN, .9, "chay", 60, 1700], [.9, 1, "dung", 1700, 1700]]}}, vk=VK_TH, loan=1, cau=1)
doi_tuyen("th_tsn", "nguatsn", P_CAU, [[3.0, 0.0, 0.3, 0]], {
    12: {"s": [[0, U_TIN, "dung", 60, 60], [U_TIN, U_TIN + .06, "chay", 60, 150], [U_TIN + .06, U_CAT - .02, "chay", 965, 1150],
               [U_CAT - .02, .62, "chay", 1150, 1600], [.62, 1, "an", 1600, 1600]]}}, cau=1, ten={"0": "Tôn Sĩ Nghị"})
_v = (2000 / .82); _s0 = 900 - _v * (U_CAT - .08)                 # mũi đoàn rút tới gần chỗ chặt cầu đúng lúc cầu đứt
doi_tuyen("th_rut", "th", P_CAU, cot(220, 3, 1.7), {12: {"s": [[0, .08, "an", 0, 0], [.08, .9, "chay", round(_s0), round(_s0 + 2000)], [.9, 1, "dung", round(_s0 + 2000), round(_s0 + 2000)]]}}, vk=VK_TH, loan=1, cau=1)
p_vao = [(1450, 3950), (1508, 4529), (1320, 5500), (980, 6500), (560, 7150)]
doi_tuyen("ts_vao", "ts", p_vao, cot(200, 4, 2.0), {12: {"s": [[0, .2, "an", 0, 0], [.2, .9, "chay", 250, 520], [.9, 1, "dung", 520, 520]]}}, vk=VK_TS)
ht = cot(240, 16, 2.4)
doi_tuyen("ts_hoangthanh", "ts", [(468, 6700), (468, 7150)], ht, {13: {"s": [[0, 1, "dung", 420, 420]]}}, vk=VK_TS)


# ---------------------------------------------------------------- V8b: đội bổ sung để máy quay có cảnh cận theo lời dẫn
p_vao_tl = list(reversed(P_CAU))          # Bồ Đề → cầu phao → Tây Long
doi_tuyen("th_vao", "th", p_vao_tl, cot(600, 3, 1.8), {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "di", 660, 880]]},
    1: {"s": [[0, .45, "di", 1160, 1510], [.45, 1, "dung", 1510, 1510]]}}, vk=VK_TH, cau=1)
doi_tuyen("th_vao_ky", "nguath", p_vao_tl, cot(16, 2, 3.2), {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "di", 700, 920]]},
    1: {"s": [[0, .45, "di", 1200, 1550], [.45, 1, "dung", 1550, 1550]]}}, cau=1)
doi_tuyen("th_tsn_vao", "nguatsn", p_vao_tl, [[0.0, 0.0, 0.3, 0]], {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "di", 725, 945]]},
    1: {"s": [[0, .45, "di", 1225, 1575], [.45, 1, "dung", 1575, 1575]]}}, cau=1, ten={"0": "Tôn Sĩ Nghị"})
doi_tuyen("th_snd_vao", "nguasnd", p_vao_tl, [[-9.0, 1.2, 0.55, 0]], {
    0: {"s": [[0, .55, "an", 0, 0], [.55, 1, "di", 725, 945]]},
    1: {"s": [[0, .45, "di", 1225, 1575], [.45, 1, "dung", 1575, 1575]]}}, cau=1, ten={"0": "Sầm Nghi Đống"})
p_hq = [tuple(q) for q in json.load(open(os.path.join(HERE, "thienly.json")))]   # V10.8: bám đúng đường thiên lý trên bản đồ (Duong_ThienLy)
doi_tuyen("ts_hq", "ts", p_hq, cot(960, 3, 1.9), {
    1: {"s": [[0, .85, "an", 0, 0], [.85, 1, "chay", 660, 700]]},
    3: {"s": [[0, 1, "chay", 660, 1040]]},
    5: {"s": [[0, 1, "chay", 580, 830]]}}, duoc=4, vk=VK_TS)
doi_tuyen("ts_hq_voi", "voi", p_hq, [[-300 - k * 9, (1 if k % 2 else -1) * 4.5, R.random(), 0] for k in range(4)], {
    3: {"s": [[0, 1, "chay", 660, 1040]]}, 5: {"s": [[0, 1, "chay", 580, 830]]}}, linh=1)
doi_tuyen("ts_hq_ngua", "ngua", p_hq, [[12 - k * 4, (1 if k % 2 else -1) * 1.4, R.random(), 0] for k in range(8)], {
    3: {"s": [[0, 1, "chay", 660, 1040]]}, 5: {"s": [[0, 1, "chay", 580, 830]]}})
# tập hợp trước Quang Trung (minh hoạ ở mép nam sa bàn; Phú Xuân, Tam Điệp nằm ngoài khung)
TK = (2700.0, -11400.0)
tk = [mem(TK[0] + (k % 20 - 9.5) * 1.6 + R.uniform(-.2, .2), TK[1] + (k // 20) * 1.8, 0.0) for k in range(300)]
doi("ts_tapket", "ts", tk, {2: scene([0, 0], seg(0, .6, "dung"), seg(.6, 1, "chay", [0, -12])), 4: scene([0, 0], seg(0, 1, "dung"))}, vk=VK_TS)
# V10.3: C03 Quang Trung đứng trên lưng voi trước ba quân, hai bên 10 tướng cưỡi ngựa cầm cờ (mỗi bên 5)
doi("ts_voi_qt", "voi", [mem(TK[0], TK[1] - 16, math.pi)], {2: scene([0, 0], seg(0, 1, "dung"))})
tuong = [mem(TK[0] + s * (9 + k * 4.6), TK[1] - 15 + k * 0.6, math.pi) for s in (-1, 1) for k in range(5)]
doi("ts_tuong", "ngua", tuong, {2: scene([0, 0], seg(0, 1, "dung"))}, co=1,
    ten={"0": "Phan Văn Lân", "1": "Hám Hổ hầu", "5": "Đặng Tiến Đông", "6": "Đại đô đốc Bảo"})
# C05 Tam Điệp: Ngô Văn Sở, Ngô Thì Nhậm giữ phòng tuyến, ra đón vua
doi("ts_tuong_td", "ngua", [mem(TK[0] + s * 12, TK[1] - 22, 0.0) for s in (-1, 1)], {4: scene([0, 0], seg(0, 1, "dung"))},
    ten={"0": "Ngô Văn Sở", "1": "Ngô Thì Nhậm"})
doi("ts_tapket_voi", "voi", [mem(TK[0] + s * 24, TK[1] + 8, 0.0) for s in (-1, 1)], {2: scene([0, 0], seg(0, 1, "dung")), 4: scene([0, 0], seg(0, 1, "dung"))})
# Hà Hồi: vây lặng lẽ rồi gọi hàng (ngoài khung, minh hoạ)
HH = (3900.0, -13960.0)
vay = [mem(HH[0] + 110 * math.cos(a), HH[1] + 110 * math.sin(a), math.atan2(-math.cos(a), math.sin(a))) for a in [k / 160 * 2 * math.pi for k in range(160)]]
doi("ts_vay", "ts", vay, {6: scene([0, 0], seg(0, .14, "buoc", [0, 0]), seg(.14, .45, "thu"), seg(.45, 1, "ngam"))}, vk=[1, 2, 3], duoc=3)
# V10.1: trại Hà Hồi – lính Thanh rải rác giữa các lều, vài toán đi tuần; bị vây, nghe loa thì tháo chạy tứ phía (tan)
thh = []
while len(thh) < 70:
    r = 12 + 62 * math.sqrt(R.random()); a = R.uniform(0, 2 * math.pi)
    thh.append(mem(HH[0] + r * math.cos(a), HH[1] + r * math.sin(a), R.uniform(-3.1, 3.1)))
TAN = {"6": [.38, 1.0, 170, HH[0], HH[1]]}
doi("th_hahoi", "th", thh, {6: scene([0, 0], seg(0, .38, "dung"), seg(.38, 1, "chay"))}, vk=VK_TH, tan=TAN, nga={"6": [6, .5]}, loan=1)
DUR6 = 65.0
for kq, (rr, n0) in enumerate([(58, 0.0), (58, 0.5), (80, 0.25), (80, 0.75)]):
    vong = [(HH[0] + rr * math.cos(t / 24 * 2 * math.pi * (1 if kq % 2 else -1)), HH[1] + rr * math.sin(t / 24 * 2 * math.pi * (1 if kq % 2 else -1))) for t in range(25)]
    Lv = 2 * math.pi * rr; s0 = n0 * Lv; s1 = s0 + 1.3 * DUR6 * .38
    doi_tuyen("th_hahoi_tuan%d" % kq, "th", vong, [[-k * 1.6, (k % 2 - .5) * 1.2, round(R.random(), 3), R.randrange(4)] for k in range(4)],
              {6: {"s": [[0, .38, "di", s0, s1], [.38, 1, "chay", s1, s1]]}}, vk=[2, 3, 2, 1], tan=TAN, loan=1)
NGA_CANH = {"th_luy_nam": 9, "th_luy": 9, "th_trong": 9, "th_dammuc": 10, "th_kt": 11}
for g in G:
    if isinstance(g.get("nga"), list): g["nga"] = {str(NGA_CANH.get(g["id"], 9)): g["nga"]}
CO = {"ts_hq": 12, "ts_tapket": 15, "ts_xungkich": 20, "ts_dubi": 25, "ts_dongda": 15, "ts_vao": 14, "ts_hoangthanh": 16, "ts_vay": 20, "ts_bao": 20,
      "th_vao": 12, "th_canve": 15, "th_luy": 30}                  # V10.2: cứ n người có 1 người cầm cờ
for g in G:
    if g["id"] in CO: g["co"] = CO[g["id"]]
for g in G:
    if g["kind"] in ("ts", "th") and "vk" not in g: g["vk"] = VK_TS if g["kind"] == "ts" else VK_TH
TOA = {"9": [.875, 1.0]}
for g in G:
    if g["id"] in ("ts_khieng", "ts_xungkich", "ts_dubi", "ts_sung"): g["toa"] = TOA
# bục bắn trong lũy nam + lính trên vọng gác
buc = [mem(*F(-175.5, v + R.uniform(-.3, .3)), YAW_N + math.pi) for v in [-118 + k * 4.2 for k in range(57)]]
doi("th_buc", "th", buc, {7: scene([0, 0], seg(0, 1, "ngam")), 8: scene([0, 0], seg(0, 1, "ngam")),
    9: scene([0, 0], seg(0, .8, "ngam"), seg(.8, .84, "trungdon"), seg(.84, 1, "chay", mv(150, 0)))}, vk=[1, 1, 2, 1, 3], buc=1, nga={"9": [4, .82]}, loan=1)
gac = []
for (gu, gv) in [(-180, -130), (-180, 130), (-180, 13), (-180, 39), (-49, -130), (-23, -130)]:
    for (a, b) in [(-1.1, -1.0), (1.1, -1.0), (0, 1.1)]:
        x, y = F(gu, gv); gac.append(mem(x + a, y + b, YAW_N + math.pi + R.uniform(-.5, .5)))
doi("th_gac", "th", gac, {1: scene([0, 0], seg(0, 1, "dung")), 7: scene([0, 0], seg(0, 1, "dung")), 8: scene([0, 0], seg(0, 1, "ngam")),
    9: scene([0, 0], seg(0, .84, "ngam"), seg(.84, 1, "an"))}, vk=[1, 2, 1], tren=[10.28, 7.27], dense=0)
CATCAU = {"i": 12, "u": U_CAT, "gap": [860, 902]}     # mét dọc tuyến P_CAU: đoạn cầu bị chặt (gần bờ Bồ Đề)
for g in G:
    if g["id"] in ("th_rut", "th_canve"): g["cat"] = 1
json.dump({"catcau": CATCAU, "note": "Tái dựng mô phỏng. Mật độ quân là minh hoạ, không phải quân số sử liệu.",
           "quangtrung": {"2": {"g": "ts_voi_qt", "off": [-0.17, 0.30, 2.66]}, "4": [TK[0], TK[1] - 14, math.pi], "7": {"g": "ts_voi_chihuy", "off": [-0.17, 0.30, 2.66]}, "8": {"g": "ts_voi_chihuy", "off": [-0.17, 0.30, 2.66]}, "9": {"g": "ts_voi_chihuy", "off": [-0.17, 0.30, 2.66]}, "12": [520, 7000, math.pi], "13": [468, 7110, math.pi]},
           "groups": G}, open(os.path.join(HERE, "..", "web10", "quan.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(len(G), "đội", sum(len(g["m"]) for g in G), "thành viên")
