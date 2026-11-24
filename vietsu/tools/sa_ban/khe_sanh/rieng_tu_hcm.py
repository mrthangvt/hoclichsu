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
