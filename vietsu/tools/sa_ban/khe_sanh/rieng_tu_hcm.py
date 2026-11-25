"""GĐ3 (25/11/2026): chuyển rieng.js nền (bản HCM V1.9) sang khung Khe Sanh: tắt mọi biên đạo Sài Gòn bằng cờ HCM=false,
thay mốc, góc nhìn, nút tầng, máy quay (máy quay tạm theo cỡ cảnh của kịch bản camera, chỉnh từng cú máy ở GĐ4)."""
import re, sys
from pathlib import Path
p = Path(sys.argv[1]); s = p.read_text()
def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c >= n, (a[:70], c)
    s = s.replace(a, b) if n == 0 or c == n else s.replace(a, b)
# 1. cờ tắt biên đạo HCM
s = s.replace("//@@ s2\n", "//@@ s2\nconst HCM = false;   // GĐ3: biên đạo Sài Gòn của bản nền HCM V1.9 tắt hết; Khe Sanh dựng dần ở GĐ4\n", 1)
s = s.replace("// Sa bàn Chiến dịch Hồ Chí Minh 1975 — three.js, bộ máy 2.2.0 (họ Bạch Đằng). Tái dựng mô phỏng.", "// Sa bàn Chiến dịch Đường 9 – Khe Sanh 1968 — three.js, bộ máy 2.2.0 (họ Bạch Đằng). Tái dựng mô phỏng.")
s = s.replace("TANG === 'noi-do'", "(HCM && TANG === 'noi-do')")
s = s.replace("const HUONG = TANG === 'chien-dich' ? [", "const HUONG = HCM && TANG === 'chien-dich' ? [")
s = s.replace("if (TANG === 'chien-dich') {\n  const sc = STORY.scenes.find((c) => c.id === 'C05');", "if (HCM && TANG === 'chien-dich') {\n  const sc = STORY.scenes.find((c) => c.id === 'C05');")
s = s.replace("progress(0.35, 'Đang dựng địa hình ' + ((HCM && TANG === 'noi-do') ? 'nội đô Sài Gòn' : 'toàn chiến dịch') + '…');",
              "progress(0.35, 'Đang dựng địa hình ' + (TANG === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch Đường 9') + '…');")
# 2. mốc Khe Sanh
a = s.index('const MOC = {'); b = s.index('};', a) + 2
s = s[:a] + """// mốc Khe Sanh (toạ độ: OSM 25/11/2026; điểm cao 881 Nam/Bắc, 950, Bản Huội San theo M27–M29 trong sources.json;
// 861, 861A, 558: lưới bản đồ quân sự XD 803-443, 806-445, 820-451 so với căn cứ XD 841-419 (M30), đặt lệch từ toạ độ OSM của căn cứ;
// Co Roc là ƯỚC LƯỢNG (~13 km tây nam căn cứ, M12) — chỉnh ở GĐ4 khi đối chiếu bản đồ 1:50 000)
const MOC = {
  tacon: [16.65433, 106.7243, 'Căn cứ Tà Cơn (Khe Sanh)'],
  h881n: [16.69069, 106.65958, 'Điểm cao 881 Bắc'],
  h881s: [16.67167, 106.66256, 'Điểm cao 881 Nam'],
  h861: [16.6760, 106.6887, 'Điểm cao 861'],
  h861a: [16.6778, 106.6915, 'Điểm cao 861A'],
  h558: [16.6833, 106.7046, 'Điểm cao 558'],
  h950: [16.6885, 106.725, 'Điểm cao 950'],
  khesanh: [16.62732, 106.7377, 'Quận lỵ Hướng Hóa (làng Khe Sanh)'],
  cubo: [16.6243, 106.73923, 'Đồi Cu Bốc'],
  langvay: [16.60048, 106.66822, 'Cứ điểm Làng Vây'],
  coroc: [16.575, 106.640, 'Núi Co Roc (Lào, ước lượng)'],
  huoisan: [16.611, 106.538, 'Bản Huội San (Lào)'],
  rockpile: [16.77972, 106.85267, 'Rockpile'],
  carroll: [16.77191, 106.92826, 'Trại Carroll'],
};
const MOC_LON = new Set(['tacon', 'langvay']);""" + s[b:]
s = s.replace("const DUONG_DINH = (INST.duong && INST.duong.dinh) || [];", "const DUONG_DINH = [];")
# 3. ANCH: mốc trong vòng sa bàn của tầng đang mở + thị xã (chiến dịch)
a = s.index('const ANCH = TANG ==='); b = s.index('\n//@@ s39', a)
s = s[:a] + """const ANCH = [
  ...Object.entries(MOC).filter(([k, [la, lo]]) => Math.hypot(LLx(la, lo), LLz(la, lo)) < R * 0.96)
    .map(([k, [la, lo, ten]]) => [k, ten, LLx(la, lo), LLz(la, lo), 'Mốc (toạ độ OSM hoặc theo nguồn trong sources.json; "ước lượng" là chưa chốt)', MOC_LON.has(k)]),
  ...(TANG === 'chien-dich' ? META.places.filter((p) => p[0] === 'city').map(([typ, ten, x, y], k) => ['p' + k, ten, x, -y, 'Thị xã (tên hiện nay)', false]) : []),
];""" + s[b:]
s = s.replace("flyTo(A.x, A.z, (HCM && TANG === 'noi-do') ? 500 : 9000)", "flyTo(A.x, A.z, TANG === 'ta-con' ? 1500 : 9000)")
# 4. tâm, máy quay tạm theo cỡ cảnh
s = s.replace("const SG = LL(10.785, 106.69, 0);", "const SG = LL(MOC.tacon[0], MOC.tacon[1], 0);")
a = s.index("const SHOTS = TANG === 'chien-dich' ? {"); b = s.index('\n//@@ s35', a)
s = s[:a] + """// GĐ3: máy quay TẠM cho mọi cú máy của tầng đang mở — xoay quanh mốc chính của hồi, xa gần theo cỡ cảnh trong kịch bản camera
// (đại toàn / toàn / trung / cận). Chỉnh tay từng cú máy, máy bám xe, máy qua vai ở GĐ4 (KHUNG_SA_BAN §10 B: máy luôn trong vòng R, trên mặt đất).
const MOC_HOI = { H01: 'tacon', H02: 'tacon', H03: 'tacon', H04: 'tacon', H05: null, H06: 'langvay', H07: 'tacon', H08: 'tacon', H09: 'rockpile', H10: 'tacon', H11: null };
const CO = { 'Đại toàn': [0.85, 0.55], 'Toàn': [0.32, 0.2], 'Trung': [0.11, 0.06], 'Cận': [0.04, 0.018] };
const SHOTS = {};
for (const sc of STORY.scenes) { if ((sc.tang || 'chien-dich') !== TANG) continue;
  const k = MOC_HOI[sc.id], m = k && MOC[k] ? LL(MOC[k][0], MOC[k][1], 0) : V3(0, 0, 0);
  if (Math.hypot(m.x, m.z) > R * 0.9) m.set(0, 0, 0);
  m.y = hG(m.x, m.z);
  sc.shots.forEach((sh, i) => { const [rr, hh] = CO[sh.size] || CO['Toàn'], a0 = 2.4 + i * 0.9;
    const r = Math.min(R * rr, R * 0.9), h = R * hh + (sh.size === 'Cận' ? 30 : 0);
    SHOTS[sh.id] = orbit(m, r, h, a0, a0 + 0.45, 45); });
}""" + s[b:]
# 5. góc nhìn, nút tầng, chú giải bản đồ nhỏ
a = s.index("const VIEWS = (() => {"); b = s.index("})();", a) + 5
s = s[:a] + """const VIEWS = (() => {
  const v = (k, d, az, el) => { const [la, lo] = MOC[k]; return [LLx(la, lo), LLz(la, lo), d, az, el]; };
  if (TANG === 'chien-dich') return { all: [0, 0, R * 1.9, 180, 40], tacon: v('tacon', 9000, 200, 35), langvay: v('langvay', 9000, 200, 35), rockpile: v('rockpile', 9000, 200, 35) };
  return { all: [0, 0, R * 1.9, 180, 40], tacon: v('tacon', 2200, 200, 30), h881s: v('h881s', 2200, 200, 30), langvay: v('langvay', 2200, 200, 30), khesanh: v('khesanh', 2200, 200, 30) };
})();""" + s[b:]
s = s.replace("b.textContent = (HCM && TANG === 'noi-do') ? '⇄ Toàn chiến dịch' : '⇄ Nội đô Sài Gòn';", "b.textContent = TANG === 'ta-con' ? '⇄ Toàn chiến dịch' : '⇄ Căn cứ Tà Cơn';")
s = s.replace("doiTang((HCM && TANG === 'noi-do') ? 'chien-dich' : 'noi-do', T, playing)", "doiTang(TANG === 'ta-con' ? 'chien-dich' : 'ta-con', T, playing)")
s = s.replace("$('mmLeg').textContent = (HCM && TANG === 'noi-do') ? 'Bấm để bay tới · ô đỏ: xe tăng · ô vàng: mốc' : 'Bấm để bay tới · ô vàng: thị xã, thị trấn (tên 1975)';",
              "$('mmLeg').textContent = 'Bấm để bay tới · ô vàng: mốc, điểm cao';")
p.write_text(s); print('ok', len(s))
s = p.read_text()
a = "  : [['Đầu cầu Rạch Chiếc', C05.rc.x + 120, C05.rc.z + 80, 4, [C05.rc.x, C05.rc.z]], ['Trên đồi nhìn về Sài Gòn', SG.x + 9000, SG.z - 6000, 60, [SG.x, SG.z]]];"
assert a in s
s = s.replace(a, """  : (() => { const P = (k) => LL(MOC[k][0], MOC[k][1], 0), tc = P('tacon'), h = P('h881s'), lv = P('langvay');   // đứng xem (Khe Sanh)
      const L = [['Trên điểm cao 881 Nam nhìn về căn cứ', h.x, h.z, 4, [tc.x, tc.z]], ['Đầu đường băng Tà Cơn', tc.x + 500, tc.z, 3, [tc.x - 600, tc.z]], ['Cứ điểm Làng Vây', lv.x + 150, lv.z + 120, 3, [lv.x, lv.z]]];
      return L.filter((q) => Math.hypot(q[1], q[2]) < R * 0.95); })();""")
p.write_text(s); print('pov ok')
s = p.read_text()
a = s.index('const MOC_NGAY = { L: ['); b = s.index('  el: null, cur: -1,', a)
s = s[:a] + """// chữ ngày giờ (V1.9): mỗi hồi hiện một mốc sau thẻ hồi; ngày theo bảng mốc docs/KHE_SANH_1968_TU_LIEU.md mục 2. Khi có voice: đặt theo câu đọc (GĐ5)
const NGAY_HOI = { H01: ['', '1968', 'Thung lũng Khe Sanh, phía Tây Quảng Trị'], H02: ['', 'Cuối 1967 – đầu 1968', 'Căn cứ Tà Cơn và các điểm cao'],
  H03: ['', 'Cuối năm 1967', 'Chuẩn bị Chiến dịch Đường 9 – Khe Sanh'], H04: ['Đêm 20, rạng sáng', '21.1.1968', 'Chiến dịch mở màn'],
  H05: ['Đêm 30, rạng sáng', '31.1.1968', 'Tổng tiến công và nổi dậy Tết Mậu Thân'], H06: ['Đêm 6, rạng sáng', '7.2.1968', 'Trận Làng Vây'],
  H07: ['', '10.2 – 31.3.1968', 'Vây lấn Tà Cơn'], H08: ['', '21.1 – 8.4.1968', 'Không kích và không vận quanh Khe Sanh'],
  H09: ['', '1.4.1968', 'Chiến dịch Pegasus bắt đầu'], H10: ['', 'Mùa hè 1968', 'Quân Mỹ rút khỏi Tà Cơn'], H11: ['', '20.1 – 15.7.1968', 'Chiến dịch Đường 9 – Khe Sanh'] };
const MOC_NGAY = { L: STORY.scenes.filter((c) => NGAY_HOI[c.id]).map((c) => { const [g, d, x] = NGAY_HOI[c.id]; return [c.t0 + 5.5, (g ? g + ' · ' : '') + d, x]; }),
""" + s[b:]
p.write_text(s); print('ngay ok')
# GĐ4: biên đạo Khe Sanh (tools/sa_ban/khe_sanh/bien_dao_gd4.js) chèn trước chỗ đặt ghim GHIM_SAU; gọi KS.cap mỗi khung
s = p.read_text()
s = s.replace("const HCM = false;", "const HCM = false;\nconst KS = {};       // biên đạo Khe Sanh (GĐ4) — khai báo sớm, tránh TDZ giữa các đoạn", 1)
bd = Path(__file__).resolve().parent.joinpath('bien_dao_gd4.js')
if not bd.exists(): bd = Path('/home/claude/vietsu/vietsu/tools/sa_ban/khe_sanh/bien_dao_gd4.js')
a = "if (XEX.ghimND) XEX.ghimND(); for (const f of GHIM_SAU) f();"
assert a in s
s = s.replace(a, bd.read_text().rstrip() + "\n" + a, 1)
a = "if (C05.cap) C05.cap(t);"
assert a in s
s = s.replace(a, "if (KS.cap) KS.cap(t, dt); " + a, 1)
p.write_text(s); print('bien dao ok')
# âm thanh: bỏ tiếng reo hò, vỗ tay của bản HCM (không có tệp trong gói); nhạc nền theo hồi Khe Sanh (nhạc dùng lại của gói HCM)
s = p.read_text()
a = "const HCM_BED = ['xetang', 'gio', 'reoho', 'ak47', 'maybay', 'oto'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'votay', 'dang'];"
assert a in s
s = s.replace(a, "const HCM_BED = ['xetang', 'gio', 'ak47'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang'];   // Khe Sanh: chỉ các tệp có trong gói", 1)
a = "const nhacCua = (i) => NHAC[SC[i].id] || ['thuc-day', 0, 0.3];"
assert a in s
s = s.replace(a, """const NHAC_KS = { H01: ['thuc-day', 0, 0.34], H02: ['hiep-si', 50, 0.4], H03: ['giua-tran', 0, 0.34], H04: ['quyet-chien', 0, 0.34], H05: ['ke-thu', 0, 0.32], H06: ['quyet-chien', 20, 0.36],
  H07: ['giua-tran', 40, 0.34], H08: ['ke-thu', 50, 0.32], H09: ['hiep-si', 100, 0.38], H10: ['tro-ve', 0, 0.36], H11: ['vi-thanh', 0, 0.44] };   // nhạc theo hồi Khe Sanh (MINH HOẠ, anh duyệt lại)
const nhacCua = (i) => (HCM ? NHAC : NHAC_KS)[SC[i].id] || ['thuc-day', 0, 0.3];""", 1)
p.write_text(s); print('am thanh ok')
# chữ báo đổi tầng theo tên tầng Khe Sanh
s = p.read_text()
a = "(scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch')"
assert a in s
s = s.replace(a, "(HCM ? (scn.tang === 'noi-do' ? 'nội đô Sài Gòn' : 'toàn chiến dịch') : (scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch'))", 1)
p.write_text(s); print('doi tang ok')
# lính thủy đánh bộ Mỹ (mẫu Tripo anh Thắng gắn xương 25/11, nướng bằng tools/sa_ban/nhan_vat_lai/lam_linh_my.py + nuong_nvz.py): đám đông 'my', hai mức chi tiết
s = p.read_text()
a = "dongNap('vnchx', 'linh-vnch-x', 'linh-vnch', 400);"
assert a in s
s = s.replace(a, a + " dongNap('my', 'linh-my', 'linh-my', 300); dongNap('myx', 'linh-my-x', 'linh-my', 600);", 1)
a = "if (n === 'qgpA' || n === 'qgpB' || n === 'vnch') {"
assert a in s
s = s.replace(a, "if (n === 'qgpA' || n === 'qgpB' || n === 'vnch' || n === 'my') {", 1)
p.write_text(s); print('linh my ok')
# GĐ4b: dàn cảnh, máy quay từng cú (tools/sa_ban/khe_sanh/dan_canh_gd4.js) — chạy sau biên đạo, trước chỗ đặt ghim
s = p.read_text()
dc = Path(__file__).resolve().parent.joinpath('dan_canh_gd4.js')
if not dc.exists(): dc = Path('/home/claude/vietsu/vietsu/tools/sa_ban/khe_sanh/dan_canh_gd4.js')
a = "if (XEX.ghimND) XEX.ghimND(); for (const f of GHIM_SAU) f();"
assert a in s
s = s.replace(a, dc.read_text().rstrip() + "\n" + a, 1)
p.write_text(s); print('dan canh ok')
# V1.4 (anh Thắng: kéo timeline lùi bị treo hình): đang kéo thanh thời gian thì không đổi tầng (trước đây đổi ngay giữa lúc kéo → tải lại trang dưới tay người xem);
# thả tay mới đổi. Thêm pointerup/touchend phòng khi trình duyệt không bắn sự kiện 'change'.
s = p.read_text()
a = "if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) {"
assert a in s
s = s.replace(a, "if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi && seeking) { $('sub').hidden = false; $('sub').textContent = 'Thả thanh thời gian để chuyển sang ' + (scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch') + '…'; }\n  else if (appMode === 'film' && scn.tang && scn.tang !== TANG && !update.doi) {", 1)
a = "voxInit();"
assert a in s
s = s.replace(a, a + "\nfor (const ev of ['pointerup', 'touchend', 'mouseup']) $('seek').addEventListener(ev, () => { seeking = false; });", 1)
p.write_text(s); print('tua ok')
# V1.4 âm thanh Khe Sanh: nền + tiếng nổ theo sự kiện nổ trên hình (KS.amPlan/amThem/amMoc/amLap ở bien_dao_gd4.js), tiếng trực thăng tổng hợp
s = p.read_text()
a = "const HCM_BED = ['xetang', 'gio', 'ak47'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang'];"
assert a in s
s = s.replace(a, "const HCM_BED = ['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang'];", 1)
a = "  switch (id) {\n    case 'C01': return { gio: 0.32 };"
assert a in s
s = s.replace(a, "  if (!HCM && KS.amPlan) return KS.amPlan(id, t, u);\n" + a, 1)
a = "const AM_LAP = () => ["
assert a in s
s = s.replace(a, "const AM_LAP = () => !HCM ? (KS.amLap ? KS.amLap() : []) : [", 1)
a = "const AM_MOC = () => ["
assert a in s
s = s.replace(a, "const AM_MOC = () => !HCM ? (KS.amMoc ? (AM_MOC.c && AM_MOC.ct === Math.round(T / 2) ? AM_MOC.c : (AM_MOC.ct = Math.round(T / 2), AM_MOC.c = KS.amMoc())) : []) : [", 1)
a = "  xe = clamp(xe, 0, 1); p.oto = Math.max(p.oto || 0, 0.85 * xe); p.xetang = Math.max(p.xetang || 0, 0.7 * xe); return p; };"
assert a in s
s = s.replace(a, "  xe = clamp(xe, 0, 1); p.oto = Math.max(p.oto || 0, 0.85 * xe); p.xetang = Math.max(p.xetang || 0, 0.7 * xe); if (!HCM && KS.amThem) p = KS.amThem(p, cp); return p; };", 1)
a = "  oto: (ctx) => {"
assert a in s
s = s.replace(a, """  trucan: (ctx) => { const sr = ctx.sampleRate, n = sr * 2, b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let l1 = 0;   /* trực thăng: nhiễu trầm đập theo nhịp cánh quạt ~5,5 lần/giây */
    for (let i = 0; i < n; i++) { const t = i / sr, w = Math.random() * 2 - 1; l1 += 0.05 * (w - l1); const nh = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * 5.5 * t), 6); d[i] = (l1 * 3.2 * (0.25 + nh) + Math.sin(2 * Math.PI * 55 * t) * 0.08) * 0.9; }
    return b; },
""" + a, 1)
p.write_text(s); print('am thanh ks ok')
