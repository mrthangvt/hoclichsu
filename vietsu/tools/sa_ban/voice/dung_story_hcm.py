"""Dựng lại story.json của sa bàn HCM 1975 theo bản voice anh Thắng thu (24/11/2026): 12 hồi, mốc từng câu đo trên bản thu.
python3 dung_story_hcm.py <asr.json> <gói ho-chi-minh-1975>
- asr.json: ra từ asr_onnx.py (từ + giây). Voice là đồng hồ chính: cảnh, cú máy, phụ đề, sự kiện đều theo giây voice.
- Phụ đề: lấy từ chính lời đọc (nhận dạng), sửa chính tả tên riêng, số, lỗi nhận dạng theo bảng SUA; khi có bản Word anh đã sửa thì thay bằng câu chữ gốc.
- story.moc: các mốc sự kiện (giây voice) cho rieng.js."""
import json, re, sys
ASR, GOI = sys.argv[1], sys.argv[2]
A = json.load(open(ASR)); TU = A['tu']; DAI = A['dai']
W = [w.lower() for w, a, b in TU]
def tim(cum, sau=0.0):
    s = cum.split()
    for i in range(len(W) - len(s) + 1):
        if TU[i][1] >= sau and W[i:i + len(s)] == s: return i
    raise SystemExit('không thấy: ' + cum)
def t(cum, sau=0.0): return TU[tim(cum, sau)][1]
# ---- tiêu đề các hồi (đọc liền trong voice) → dòng phụ đề riêng
HOI = [('chiến dịch hồ chí minh năm một nghìn chín trăm bảy mươi lăm ba mươi tháng tư bản hùng ca thống nhất non sông', 'CHIẾN DỊCH HỒ CHÍ MINH 1975 · 30 THÁNG 4 – BẢN HÙNG CA THỐNG NHẤT NON SÔNG'),
       ('hồi một xuân lộc cánh cửa phía đông', 'HỒI 1 · XUÂN LỘC – CÁNH CỬA PHÍA ĐÔNG'),
       ('hồi hai năm cánh quân một mục tiêu', 'HỒI 2 · NĂM CÁNH QUÂN, MỘT MỤC TIÊU'),
       ('hồi ba giờ g đã điểm', 'HỒI 3 · GIỜ G ĐÃ ĐIỂM'),
       ('hồi bốn phi đội quyết thắng', 'HỒI 4 · PHI ĐỘI QUYẾT THẮNG'),
       ('hồi năm phá tan tuyến phòng thủ vòng ngoài', 'HỒI 5 · PHÁ TAN TUYẾN PHÒNG THỦ VÒNG NGOÀI'),
       ('hồi sáu rạng sáng ba mươi tháng tư', 'HỒI 6 · RẠNG SÁNG 30 THÁNG 4'),
       ('hồi bảy sân bay tân sơn nhất', 'HỒI 7 · SÂN BAY TÂN SƠN NHẤT'),
       ('hồi tám bộ tổng tham mưu', 'HỒI 8 · BỘ TỔNG THAM MƯU'),
       ('hồi chín từ phía tây nam tiến vào sài gòn', 'HỒI 9 · TỪ PHÍA TÂY NAM TIẾN VÀO SÀI GÒN'),
       ('hội mười mũi thặc sâu phía đông', 'HỒI 10 · MŨI THỌC SÂU PHÍA ĐÔNG'),
       ('hồi mười một cổng dinh độc lập', 'HỒI 11 · CỔNG DINH ĐỘC LẬP'),
       ('hồi mười hai trưa ba mươi tháng tư non sông liền một dải', 'HỒI 12 · TRƯA 30 THÁNG 4 – NON SÔNG LIỀN MỘT DẢI')]
HD = {}                                       # chỉ số từ đầu → (số từ, chữ)
for cum, chu in HOI:
    s = cum.split(); i = tim(s[0] + ' ' + s[1] + ' ' + s[2]) if not cum.startswith('chiến dịch') else 0
    HD[i] = (len(s), chu)
SUA = [  # (cụm đọc → chữ viết), áp theo thứ tự
    ('một nghìn chín trăm bảy mươi lăm', '1975'), ('mùng chín tháng tư', 'mùng 9 tháng 4'), ('hai mươi mốt tháng tư', '21 tháng 4'), ('mười bốn tháng tư', '14 tháng 4'),
    ('hai mươi sáu tháng tư', '26 tháng 4'), ('hai mươi tám tháng tư', '28 tháng 4'), ('hai mươi chín tháng tư', '29 tháng 4'), ('ba mươi tháng tư', '30 tháng 4'),
    ('tháng tư năm', 'tháng 4 năm'), ('mười sáu giờ mười lăm phút', '16 giờ 15 phút'), ('mười tám giờ mười lăm phút', '18 giờ 15 phút'), ('mười bảy giờ', '17 giờ'),
    ('mười giờ ba mươi phút', '10 giờ 30 phút'), ('mười một giờ ba mươi phút', '11 giờ 30 phút'), ('năm giờ ba mươi phút', '5 giờ 30 phút'), ('hai mươi ba giờ', '23 giờ'),
    ('bảy giờ mười lăm phút', '7 giờ 15 phút'), ('bảy giờ ba mươi phút', '7 giờ 30 phút'), ('chín giờ bốn mươi lăm phút', '9 giờ 45 phút'), ('chín giờ ba mươi phút', '9 giờ 30 phút'),
    ('tám mươi cây số', '80 cây số'), ('đường số một', 'đường số 1'),
    ('quân đoàn một', 'Quân đoàn 1'), ('quân đoàn hai', 'Quân đoàn 2'), ('quân đoàn ba', 'Quân đoàn 3'), ('quân đoàn bốn', 'Quân đoàn 4'),
    ('đoàn hai trăm ba mươi hai', 'Đoàn 232'), ('đoàn hai ba hai', 'Đoàn 232'), ('sư đoàn hai lăm', 'Sư đoàn 25'), ('sư đoàn ba hai mươi a', 'Sư đoàn 320A'),
    ('lữ đoàn xe tăng hai lẻ ba', 'Lữ đoàn xe tăng 203'), ('lữ đoàn hai lẻ ba', 'Lữ đoàn 203'), ('lữ đoàn đặc công biệt động ba mười sáu', 'Lữ đoàn đặc công biệt động 316'),
    ('trung đoàn hai trăm bảy ba', 'Trung đoàn 273'), ('trung đoàn hai mươi tư', 'Trung đoàn 24'), ('trung đoàn hai tư', 'Trung đoàn 24'), ('trung đoàn bốn tám', 'Trung đoàn 48'),
    ('trung đoàn hai tám', 'Trung đoàn 28'), ('trung đoàn một thuộc sư đoàn chín', 'Trung đoàn 1 thuộc Sư đoàn 9'), ('trung đoàn sáu sáu', 'Trung đoàn 66'),
    ('sư đoàn mười', 'Sư đoàn 10'), ('đại đội bốn', 'Đại đội 4'), ('cổng số một', 'cổng số 1'), ('cổng số hai', 'cổng số 2'),
    ('a ba bảy', 'A-37'), ('m bốn tám', 'M48'), ('m một một ba', 'M113'), ('m bốn mốt', 'M41'),
    ('ba trăm chín mươi', '390'), ('ba chín mươi', '390'), ('tám trăm bốn mươi ba', '843'), ('tám bốn ba', '843'), ('năm chiếc', '5 chiếc'),
    # lỗi nhận dạng
    ('huyện chi', 'huyện Củ Chi'), ('đánh chiến', 'đánh chiếm'), ('loay chuyển', 'lay chuyển'), ('trứng ngại', 'chướng ngại'), ('gạch chiếc', 'Rạch Chiếc'),
    ('tổng nhà cảnh sát', 'Tổng nha Cảnh sát'), ('bùi quang thuận', 'Bùi Quang Thận'), ('sở chỉ huy đoàn', 'sở chỉ huy sư đoàn'), ('tổng thống văn minh', 'Tổng thống Dương Văn Minh'),
    ('hạ cánh an toàn xuống sân bay tân sơn nhất', 'hạ cánh an toàn xuống sân bay Thành Sơn'),   # voice đọc nhầm "Tân Sơn Nhất" — S17: hạ cánh ở Thành Sơn (Phan Rang); đã báo anh Thắng thu lại câu này
    ('nước trong long thành', 'Nước Trong, Long Thành'), ('sân dinh', 'sân Dinh'), ('vào dinh', 'vào Dinh'), ('và tây nam', 'và Tây Nam'), ('rầm', 'Rầm!'),
    ('mặt trận giải phóng dân tộc miền nam việt nam', 'Mặt trận Dân tộc Giải phóng miền Nam Việt Nam'), ('giờ g', 'giờ G'), ('mũi thặc sâu', 'mũi thọc sâu'),
    # tên riêng
    ('chiến dịch hồ chí minh', 'Chiến dịch Hồ Chí Minh'), ('quân giải phóng', 'Quân Giải phóng'), ('bộ chính trị', 'Bộ Chính trị'), ('bản đồ quyết tâm', 'bản đồ Quyết tâm'),
    ('bộ tổng tham mưu', 'Bộ Tổng tham mưu'), ('bộ quốc phòng', 'Bộ Quốc phòng'), ('bộ tư lệnh biệt khu thủ đô', 'Bộ Tư lệnh Biệt khu Thủ đô'), ('biệt khu thủ đô', 'Biệt khu Thủ đô'),
    ('bộ tư lệnh cảnh sát quốc gia', 'Bộ Tư lệnh Cảnh sát quốc gia'), ('đài phát thanh', 'Đài phát thanh'), ('dinh độc lập', 'Dinh Độc Lập'), ('tân sơn nhất', 'Tân Sơn Nhất'),
    ('phi đội quyết thắng', 'Phi đội Quyết Thắng'), ('dương văn minh', 'Dương Văn Minh'), ('vũ đăng toàn', 'Vũ Đăng Toàn'), ('nguyễn văn tập', 'Nguyễn Văn Tập'),
    ('lê văn duyệt', 'Lê Văn Duyệt'), ('cầu chữ y', 'cầu Chữ Y'), ('hồng thập tự', 'Hồng Thập Tự'), ('việt nam', 'Việt Nam'), ('miền nam', 'miền Nam'),
] + [(w, w.title()) for w in ['sài gòn', 'xuân lộc', 'long khánh', 'biên hòa', 'bạch đằng', 'long thành', 'phan rang', 'đồng dù', 'củ chi', 'rạch chiếc',
                               'bà quẹo', 'bảy hiền', 'hàng xanh', 'thị nghè']] + \
      [(f'{a} {h}', f'{a} {h.title()}') for a in ('phía', 'hướng') for h in ('đông nam', 'tây nam', 'tây bắc', 'đông', 'tây', 'nam', 'bắc')]
SUAW = sorted([(a.split(), b) for a, b in SUA], key=lambda x: -len(x[0]))
TREO = {'trên', 'từ', 'phía', 'đến', 'một', 'các', 'những', 'là', 'và', 'của', 'với', 'ở', 'tại', 'dương', 'bảy', 'hồi'}
# ---- đoạn (câu) theo khoảng lặng > 0,6 s; từ treo cuối đoạn chuyển sang đoạn sau; "phía tây | nam" nối lại
doan, cur = [], []
for i, (w, a, b) in enumerate(TU):
    if i in HD:
        if cur: doan.append(cur); cur = []
        n, chu = HD[i]; doan.append(('HD', TU[i][1], TU[i + n - 1][2], chu)); HD_skip = i + n; continue
    if any(isinstance(d, tuple) and False for d in ()): pass
    if 'HD_skip' in dir() and i < HD_skip: continue
    if cur and a - cur[-1][2] > 0.6: doan.append(cur); cur = []
    cur.append([w.lower(), a, b])
if cur: doan.append(cur)
for k in range(len(doan) - 1):
    A_, B_ = doan[k], doan[k + 1]
    if isinstance(A_, tuple) or isinstance(B_, tuple): continue
    while len(A_) > 1 and A_[-1][0] in TREO: B_.insert(0, A_.pop())
    if B_ and B_[0][0] == 'nam' and A_ and A_[-1][0] in ('tây', 'đông'): A_.append(B_.pop(0))
def token(ws):                                                       # gộp cụm cần sửa thành một token (giữ mốc giờ)
    out, i = [], 0
    while i < len(ws):
        for pat, rep in SUAW:
            if [x[0] for x in ws[i:i + len(pat)]] == pat: out.append([rep, ws[i][1], ws[i + len(pat) - 1][2]]); i += len(pat); break
        else: out.append(list(ws[i])); i += 1
    return out
SUB = []
for d in doan:
    if isinstance(d, tuple): SUB.append([d[1], d[2], d[3]]); continue
    if not d: continue
    tk = token(d); tk[0][0] = tk[0][0][:1].upper() + tk[0][0][1:]
    lines, cur = [], []
    for x in tk:
        if cur and len(' '.join(y[0] for y in cur + [x])) > 84:
            j = max(range(max(1, len(cur) // 2), len(cur)), key=lambda k: cur[k][1] - cur[k - 1][2]) if len(cur) > 3 else len(cur)
            lines.append(cur[:j]); cur = cur[j:]
        cur.append(x)
    lines.append(cur)
    for k, L in enumerate(lines):
        tx = ' '.join(y[0] for y in L) + ('.' if k == len(lines) - 1 else '')
        SUB.append([L[0][1], L[-1][2], tx])
for k in range(len(SUB)):
    nxt = SUB[k + 1][0] if k + 1 < len(SUB) else DAI
    SUB[k] = [round(SUB[k][0], 2), round(min(SUB[k][1] + 0.6, nxt - 0.05), 2), SUB[k][2]]
# ---- cảnh (hồi), cú máy, mốc sự kiện
H = [0.0] + [t(c.split()[0] + ' ' + c.split()[1] + ' ' + c.split()[2]) for c, _ in HOI[2:]] + [DAI]
B = dict(c02=H[1], c03=H[2], c04=H[3], c05=H[4], c06=H[5], c07=H[6], c08=H[7], c09=H[8], c10=H[9], c11=H[10], c12=H[11])
M = dict(
    hoi1=t('hồi một'), c01_phao0=t('quân đoàn bốn quân giải phóng mở'), c01_phao1=t('rút khỏi xuân lộc') - 3, c01_rut=t('rút khỏi xuân lộc'), c01_mt=t('con đường tiến về biên hòa') - 2,
    c02_m=[t('quân đoàn một tiến'), t('quân đoàn ba hướng tới'), t('quân đoàn bốn nhận'), t('quân đoàn hai cùng'), t('đoàn hai trăm ba mươi hai')], c02_vay=t('năm cánh quân hình thành'),
    c03_phao0=t('pháo của quân đoàn hai') - 1.5, c03_phao1=t('ở những hướng còn lại'),
    c04_catcanh=t('mười sáu giờ mười lăm'), c04_muctieu=t('mục tiêu của phi đội'), c04_bom=t('những quả bom'), c04_ve=t('mười tám giờ mười lăm'),
    c05_phao0=t('năm giờ ba mươi phút pháo binh'), c05_phao1=t('trận chiến diễn ra quyết liệt đến'), c05_co=t('cắm cờ trên sở chỉ huy'), c05_btt=t('hai mươi ba giờ', 360), c05_rc=t('cầu rạch chiếc', 370),
    c06_tc=t('năm cánh quân đồng loạt', 410), c06_phao=t('bảy giờ mười lăm'), c06_rc=t('bảy giờ ba mươi phút'),
    c07_tc=t('sư đoàn mười cùng'), c07_24=t('chín giờ bốn mươi lăm'), c07_chu=t('mười một giờ ba mươi phút theo'),
    c08_tc=t('sư đoàn mười đánh'), c08_xt=t('những chiếc xe tăng vượt qua cổng'), c08_chu=t('mười một giờ ba mươi phút bộ'),
    c09_tay=t('trung đoàn một thuộc'), c09_lvd=t('theo đường lê văn duyệt'), c09_cy=t('cầu chữ y'), c09_cs=t('mười giờ ba mươi phút lực'), c09_hoi=t('vòng vây bên ngoài'),
    c10_dai=t('văn minh lên đài'), c10_cau=t('tiến qua cầu sài gòn'), c10_m48=t('tại đầu cầu'), c10_hx=t('tới ngã tư hàng xanh'), c10_ban=t('bắn cháy một chiếc xe bọc thép'),
    c10_tn=t('không dừng lại', 700), c10_htt=t('phía trước là đường hồng'),
    c11_toi=t('gần trưa', 760), c11_843=t('xe mang số'), c11_ram=t('rầm'), c11_390=t('trưởng xe là'), c11_cham=t('một cú chạm'), c11_vao=t('chiếc xe tăng ba chín mươi tiến vào'),
    c11_thao=t('từ chiếc xe tăng tám trăm bốn mươi ba'), c11_chay=t('anh chạy vào dinh'), c11_noc=t('trên nóc dinh', 830), c11_ha=t('bắt đầu hạ lá cờ'), c11_keo=t('được kéo lên'),
    c12_dai=t('tại đài phát thanh', 880), c12_dan=t('trên các tuyến đường người dân'), c12_ket=t('năm cánh quân nhiều hướng'), c12_tt=t('chiến dịch hồ chí minh toàn thắng'))
def sc(id_, ten, tang, t0, t1, shots, nguon):
    sh = []
    for k, (sid, a, size, desc) in enumerate(shots):
        b = shots[k + 1][1] if k + 1 < len(shots) else t1; sh.append(dict(id=sid, t0=round(a, 2), t1=round(b, 2), size=size, desc=desc))
    return dict(id=id_, title=ten, tang=tang, t0=round(t0, 2), t1=round(t1, 2), shots=sh, subs=[s for s in SUB if t0 - 0.01 <= s[0] < t1], nguon=nguon)
S = [
    sc('C01', 'Xuân Lộc – cánh cửa phía Đông (9 – 21/4/1975)', 'chien-dich', 0, B['c02'],
       [('T01-A', 0, 'Đại toàn', 'Mở đầu: toàn chiến dịch'), ('C01-A', M['hoi1'], 'Toàn', 'Xuân Lộc'), ('C01-B', M['c01_rut'] - 1, 'Toàn', 'Cửa phía Đông mở về Biên Hòa')], ['S21']),
    sc('C02', 'Năm cánh quân, một mục tiêu (14 – 26/4/1975)', 'chien-dich', B['c02'], B['c03'],
       [('C02-A', B['c02'], 'Đại toàn', 'Bay vào toàn chiến dịch'), ('T01-B', M['c02_m'][0] - 2, 'Toàn', 'Vòng quanh Sài Gòn, năm mũi tên hiện lần lượt'), ('C02-C', M['c02_vay'], 'Đại toàn', 'Vòng vây năm hướng')], ['S3', 'S2', 'S5', 'S4', 'S6']),
    sc('C03', 'Giờ G đã điểm (17 giờ, 26/4/1975)', 'chien-dich', B['c03'], B['c04'], [('C03-A', B['c03'], 'Toàn', 'Pháo binh Quân đoàn 2 nổ súng, hướng Đông – Đông Nam'), ('C03-B', M['c03_phao1'], 'Đại toàn', 'Các hướng siết vòng vây')], ['S2', 'S26', 'S39']),
    sc('C04', 'Phi đội Quyết Thắng (16 giờ 15, 28/4/1975)', 'noi-do', B['c04'], B['c05'],
       [('C04-A', B['c04'], 'Toàn', 'Sân bay Tân Sơn Nhất, khu đỗ máy bay (sơ đồ 1968)'), ('C04-B', M['c04_bom'] - 7, 'Trung', 'Bám sau chiếc A-37 dẫn đầu'), ('C04-C', M['c04_bom'] + 6, 'Toàn', 'Khói lửa trên khu đỗ')], ['S29', 'S17', 'S14']),
    sc('C05', 'Phá tan tuyến phòng thủ vòng ngoài (29/4/1975)', 'chien-dich', B['c05'], B['c06'],
       [('C05-A', B['c05'], 'Toàn', 'Căn cứ Đồng Dù: pháo bắn chuẩn bị, cắm cờ'), ('C05-B', M['c05_btt'], 'Toàn', '23 giờ: Quân đoàn 3 nhận nhiệm vụ đánh Bộ Tổng tham mưu'), ('C05-C', M['c05_rc'], 'Toàn', 'Cầu Rạch Chiếc')], ['S5', 'S19']),
    sc('C06', 'Rạng sáng 30/4: tổng công kích', 'chien-dich', B['c06'], B['c07'],
       [('C06-A', B['c06'], 'Đại toàn', 'Năm cánh quân đồng loạt tiến công'), ('C06-B', M['c06_phao'] - 1, 'Toàn', '7 giờ 15: pháo cối vào Tân Sơn Nhất, Bộ Tổng tham mưu'), ('C06-C', M['c06_rc'], 'Toàn', '7 giờ 30: xe tăng Lữ đoàn 203 qua cầu Rạch Chiếc')], ['S1', 'S19']),
    sc('C07', 'Sân bay Tân Sơn Nhất (30/4, 5 giờ 30 – 11 giờ 30)', 'noi-do', B['c07'], B['c08'],
       [('C07-A', B['c07'], 'Toàn', 'Tân Sơn Nhất sáng 30/4'), ('C07-B', M['c07_24'], 'Trung', 'Đội hình tiến vào khu đỗ'), ('C07-C', M['c07_chu'], 'Toàn', 'Làm chủ sân bay')], ['S27', 'S1']),
    sc('C08', 'Bộ Tổng tham mưu (30/4, đến 11 giờ 30)', 'noi-do', B['c08'], B['c09'],
       [('C08-A', B['c08'], 'Toàn', 'Bộ Tổng tham mưu: tiến công từ hai phía'), ('C08-B', M['c08_xt'], 'Trung', 'Làm chủ mục tiêu lúc 11 giờ 30')], ['S1', 'S5']),
    sc('C09', 'Từ phía Tây Nam tiến vào Sài Gòn (30/4)', 'noi-do', B['c09'], B['c10'],
       [('C09-A', B['c09'], 'Toàn', 'Bà Quẹo – Bảy Hiền – Lê Văn Duyệt'), ('C09-B', M['c09_cy'] - 2, 'Toàn', 'Cầu Chữ Y'), ('C09-C', M['c09_hoi'], 'Đại toàn', 'Năm cánh quân hội tụ giữa nội đô')], ['S1']),
    sc('C10', 'Mũi thọc sâu phía Đông (sáng 30/4)', 'noi-do', B['c10'], B['c11'],
       [('C10-A', B['c10'], 'Toàn', 'Đầu cầu Sài Gòn'), ('C10-B', M['c10_cau'], 'Trung', 'Bám xe 843 qua cầu Sài Gòn'), ('C10-C', M['c10_hx'], 'Trung', 'Ngã tư Hàng Xanh: xe 390 bắn cháy M113'),
        ('C10-D', M['c10_tn'], 'Trung', 'Cầu Thị Nghè'), ('C10-E', M['c10_htt'], 'Trung', 'Đường Hồng Thập Tự về Dinh')], ['S18', 'S26', 'S33', 'S36']),
    sc('C11', 'Cổng Dinh Độc Lập (trưa 30/4)', 'noi-do', B['c11'], B['c12'],
       [('T02-A', B['c11'], 'Trung', 'Bám sau xe 843'), ('T02-C', M['c11_843'], 'Toàn', 'Cổng Dinh: 843 húc chưa đổ, 390 húc đổ cổng chính'), ('T03-A', M['c11_thao'], 'Trung', 'Bùi Quang Thận rời xe 843, chạy về cổng chính'),
        ('T03-A2', M['c11_chay'], 'Trung', 'Băng qua bãi cỏ vào Dinh'), ('T03-B', M['c11_noc'], 'Cận', 'Nóc Dinh: hạ cờ ba sọc, kéo cờ Mặt trận')], ['S32', 'S10', 'S7', 'S8', 'S18', 'S34', 'S37', 'S38', 'S12']),
    sc('C12', 'Trưa 30/4 – non sông liền một dải', 'noi-do', B['c12'], DAI,
       [('C12-A', B['c12'], 'Toàn', 'Dinh Độc Lập, lá cờ trên nóc'), ('C12-B', M['c12_dan'], 'Trung', 'Người dân Sài Gòn ra đường'), ('C12-C', M['c12_ket'], 'Đại toàn', 'Sài Gòn từ trên cao')], ['S25', 'S32', 'S1']),
]
ST = json.load(open(f'{GOI}/story.json'))
ST['scenes'] = S; ST['duration'] = round(DAI, 2); ST['moc'] = {k: (round(v, 2) if not isinstance(v, list) else [round(x, 2) for x in v]) for k, v in M.items()}
ST['voice'] = dict(file='audio/voice.mp3', nguon='Bản thu của anh Thắng, 24/11/2026 (voi-chiendich-hcm.mp3, 16 phút 08 giây); mốc câu nhận dạng bằng tools/sa_ban/voice/asr_onnx.py')
ST['note'] = 'Dòng thời gian theo voice thu âm (giây voice). Dựng bằng tools/sa_ban/voice/dung_story_hcm.py. Phụ đề lấy từ lời đọc (nhận dạng tiếng nói, đã sửa tên riêng, số).'
json.dump(ST, open(f'{GOI}/story.json', 'w'), ensure_ascii=False, indent=1)
print(len(S), 'cảnh', len(SUB), 'dòng phụ đề', 'dài', DAI)
for s in S: print(s['id'], s['t0'], s['t1'], [x['id'] + '@' + str(x['t0']) for x in s['shots']])
