"""Dựng rieng.js cho sa bàn Hà Nội – Điện Biên Phủ trên không 1972 từ rieng.js của gói Khe Sanh 1968 (V2.1, bộ máy 2.2.0):
giữ phần máy móc chung (bầu trời, nhãn, giao tranh, đạn vạch, voice, nhạc, đi bộ, kiểm tra __kiem…), thay ba khối biên đạo Khe Sanh
(bien_dao_gd4.js, dan_canh_gd4.js, bao_tang_gd4.js) bằng bien_dao_dbpk.js, thay mốc, tầng, góc nhìn, chữ ngày giờ, nhạc theo cảnh.

python3 rieng_tu_ks.py <packs/khe-sanh-1968/rieng.js> <packs/dien-bien-phu-tren-khong-1972/rieng.js>"""
import sys
from pathlib import Path
D = Path(__file__).resolve().parent; KS = D.parent / 'khe_sanh'
src, dst = Path(sys.argv[1]), Path(sys.argv[2]); s = src.read_text()
def rep(a, b, n=1):
    global s
    assert a in s, ('không thấy', a[:90]); s = s.replace(a, b, n)
# 1. ba khối biên đạo Khe Sanh → một khối Điện Biên Phủ trên không
bd = (KS / 'bien_dao_gd4.js').read_text().rstrip(); dc = (KS / 'dan_canh_gd4.js').read_text().rstrip(); bt = (KS / 'bao_tang_gd4.js').read_text().rstrip()
rep(bd + '\n', (D / 'bien_dao_dbpk.js').read_text().rstrip() + '\n'); rep(dc + '\n', ''); rep('{\n' + bt + '\n}\n', '')
# 2. đầu tệp
rep('// Chiến dịch Đường 9 – Khe Sanh 1968 · phần riêng của trận', '// Hà Nội – Điện Biên Phủ trên không 1972 · phần riêng của trận')
rep('// Sa bàn Chiến dịch Đường 9 – Khe Sanh 1968 — three.js', '// Sa bàn Hà Nội – Điện Biên Phủ trên không 1972 — three.js (dựng từ rieng.js Khe Sanh V2.1 bằng tools/sa_ban/dbpk/rieng_tu_ks.py)')
rep("progress(0.35, 'Đang dựng địa hình ' + (TANG === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch Đường 9') + '…');",
    "progress(0.35, 'Đang dựng địa hình ' + (TANG === 'ha-noi' ? 'Hà Nội 1972' : 'miền Bắc') + '…');")
# 3. mốc
a = s.index('const MOC = {'); b = s.index('};', a) + 2
s = s[:a] + """// mốc Hà Nội – miền Bắc (toạ độ OSM hôm nay, làm tròn). Trận địa tên lửa: chỉ Tiểu đoàn 77 ở Chèm có nguồn ghi địa danh (S3);
// các trận địa khác, đài ra-đa, sân bay Cẩm Thủy là ƯỚC LƯỢNG (ghi rõ trên nhãn) — chờ đối chiếu sơ đồ bố trí của Quân chủng PK-KQ.
const MOC = {
  hanoi: [21.0285, 105.8542, 'Hà Nội'], haiphong: [20.8650, 106.6830, 'Hải Phòng'],
  hoankiem: [21.0288, 105.8524, 'Hồ Hoàn Kiếm'], longbien: [21.0425, 105.8605, 'Cầu Long Biên'], hotay: [21.0560, 105.8200, 'Hồ Tây'],
  khamthien: [21.0195, 105.8355, 'Phố Khâm Thiên'], bachmai: [21.0010, 105.8410, 'Bệnh viện Bạch Mai'], huutiep: [21.0405, 105.8327, 'Hồ Hữu Tiệp (làng Ngọc Hà)'],
  cotco: [21.0326, 105.8399, 'Cột cờ Hà Nội'], dinhtienhoang: [21.0300, 105.8535, 'Phố Đinh Tiên Hoàng'],
  phulo: [21.2060, 105.8420, 'Xã Phù Lỗ (Đông Anh, nay thuộc Sóc Sơn)'], noibai: [21.2190, 105.8070, 'Sân bay Nội Bài'], dongan: [21.1400, 105.8480, 'Đông Anh'],
  yenvien: [21.0820, 105.9180, 'Ga Yên Viên'], gialam: [21.0400, 105.8860, 'Sân bay Gia Lâm'], thanhtri: [20.9600, 105.8550, 'Thanh Trì'], coloa: [21.1150, 105.8730, 'Cổ Loa'],
  td59: [21.1080, 105.8650, 'Trận địa Tiểu đoàn 59 (ước lượng)'], td57: [21.1250, 105.8000, 'Trận địa Tiểu đoàn 57 (ước lượng, bắc sông Hồng)'],
  td77: [21.0830, 105.7860, 'Trận địa Tiểu đoàn 77 (Chèm)'], td79: [21.0000, 105.8000, 'Trận địa Tiểu đoàn 79 (ước lượng, nam sông Hồng)'], td72: [21.0350, 105.7700, 'Trận địa Tiểu đoàn 72 (ước lượng)'],
  p12a: [21.1600, 105.7700, 'Đài ra-đa (ước lượng)'], p12b: [20.9700, 105.9100, 'Đài ra-đa (ước lượng)'], tdhp: [20.8800, 106.6500, 'Trận địa tên lửa Hải Phòng (ước lượng)'],
  yenbai: [21.7275, 104.8725, 'Sân bay Yên Bái'], camthuy: [20.2050, 105.4700, 'Sân bay Cẩm Thủy (Thanh Hóa, ước lượng)'], mocchau: [20.8500, 104.6500, 'Mộc Châu (Sơn La)'],
  taybac: [21.0500, 104.6000, 'Vùng trời Tây Bắc (hướng Sơn La)'], tamdao: [21.4560, 105.6450, 'Tam Đảo'],
};
const MOC_LON = new Set(['hanoi', 'haiphong', 'hoankiem']);""" + s[b:]
a = s.index('const MOC_LON = new Set'); b = s.index('\n', s.index('const MOC_LON = new Set', a + 30))   # bỏ dòng MOC_LON cũ của Khe Sanh (dòng thứ hai)
s = s[:a] + s[a:].replace("const MOC_LON = new Set(['tacon', 'langvay']);\n", '', 1)
rep("const SG = LL(MOC.tacon[0], MOC.tacon[1], 0);", "const SG = LL(MOC.hoankiem[0], MOC.hoankiem[1], 0);")
rep("const MOC_HOI = { H01: 'tacon', H02: 'tacon', H03: 'tacon', H04: 'tacon', H05: null, H06: 'langvay', H07: 'tacon', H08: 'tacon', H09: 'rockpile', H10: 'tacon', H11: null };",
    "const MOC_HOI = { C01: 'hoankiem', C02: 'hanoi', C03: 'hoankiem', C04: 'phulo', C05: 'hoankiem', C06: 'td79', C07: 'khamthien', C08: 'hanoi', C09: 'yenbai', C10: 'hoankiem', C11: 'huutiep', C12: 'cotco' };")
rep("if ((sc.tang || 'chien-dich') !== TANG) continue;\n  const k = MOC_HOI", "if ((sc.tang || 'ha-noi') !== TANG) continue;\n  const k = MOC_HOI")
rep("...(TANG === 'chien-dich' ? META.places.filter((p) => p[0] === 'city')", "...(TANG === 'mien-bac' ? META.places.filter((p) => p[0] === 'city')")
rep("flyTo(A.x, A.z, TANG === 'ta-con' ? 1500 : 9000)", "flyTo(A.x, A.z, TANG === 'ha-noi' ? 1500 : 30000)")
rep("  ...Object.entries(MOC).filter(([k, [la, lo]]) => Math.hypot(LLx(la, lo), LLz(la, lo)) < R * 0.96)",
    "  ...Object.entries(MOC).filter(([k, [la, lo]]) => Math.hypot(LLx(la, lo), LLz(la, lo)) < R * 0.96 && (TANG === 'mien-bac' ? MOC_MB.has(k) : !MOC_MB.has(k)))")
rep("...(TANG === 'mien-bac' ? META.places.filter((p) => p[0] === 'city')", "...(false ? META.places.filter((p) => p[0] === 'city')")   # tên phường, thành phố hôm nay (sau sáp nhập 2025) — không dùng cho nhãn 1972
rep("const MOC_LON = new Set(['hanoi', 'haiphong', 'hoankiem']);", "const MOC_LON = new Set(['hanoi', 'haiphong', 'hoankiem']);\nconst MOC_MB = new Set(['hanoi', 'haiphong', 'yenbai', 'camthuy', 'mocchau', 'taybac', 'tamdao']);   // mốc hiện ở tầng miền Bắc")
# 4. góc nhìn, nút tầng, chỗ đứng xem
a = s.index('const VIEWS = (() => {'); b = s.index('})();', a) + 5
s = s[:a] + """const VIEWS = (() => {
  const v = (k, d, az, el) => { const [la, lo] = MOC[k]; return [LLx(la, lo), LLz(la, lo), d, az, el]; };
  if (TANG === 'mien-bac') return { all: [0, 0, R * 1.9, 180, 40], hanoi: v('hanoi', 40000, 200, 35), haiphong: v('haiphong', 40000, 200, 35), yenbai: v('yenbai', 30000, 200, 35) };
  return { all: [0, 0, R * 1.9, 180, 40], hoankiem: v('hoankiem', 2500, 200, 30), khamthien: v('khamthien', 1500, 200, 30), longbien: v('longbien', 2500, 200, 30), phulo: v('phulo', 3000, 200, 30) };
})();""" + s[b:]
rep("b.textContent = TANG === 'ta-con' ? '⇄ Toàn chiến dịch' : '⇄ Căn cứ Tà Cơn';", "b.textContent = TANG === 'ha-noi' ? '⇄ Toàn miền Bắc' : '⇄ Hà Nội';")
rep("doiTang(TANG === 'ta-con' ? 'chien-dich' : 'ta-con', T, playing)", "doiTang(TANG === 'ha-noi' ? 'mien-bac' : 'ha-noi', T, playing)")
a = s.index("  : (() => { const P = (k) => LL(MOC[k][0], MOC[k][1], 0), tc = P('tacon')"); b = s.index('})();', a) + 5
s = s[:a] + """  : (() => { const P = (k) => LL(MOC[k][0], MOC[k][1], 0);   // đứng xem (Hà Nội 1972)
      const L = TANG === 'ha-noi' ? [['Bên Hồ Hoàn Kiếm', P('hoankiem').x + 120, P('hoankiem').z + 60, 3, [P('hoankiem').x, P('hoankiem').z]], ['Đầu cầu Long Biên', P('longbien').x - 400, P('longbien').z + 120, 12, [P('longbien').x, P('longbien').z]],
        ['Phố Khâm Thiên', P('khamthien').x, P('khamthien').z, 3, [P('khamthien').x + 200, P('khamthien').z]], ['Trận địa Tiểu đoàn 77 (Chèm)', P('td77').x + 60, P('td77').z + 60, 3, [P('td77').x, P('td77').z]]]
        : [['Trên trời Hà Nội', P('hanoi').x, P('hanoi').z, 3000, [P('hanoi').x + 20000, P('hanoi').z]]];
      return L.filter((q) => Math.hypot(q[1], q[2]) < R * 0.95); })();""" + s[b:]
rep("$('sub').textContent = 'Thả thanh thời gian để chuyển sang ' + (scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch')", "$('sub').textContent = 'Thả thanh thời gian để chuyển sang ' + (scn.tang === 'ha-noi' ? 'Hà Nội' : 'toàn miền Bắc')")
rep("(scn.tang === 'ta-con' ? 'căn cứ Tà Cơn' : 'toàn chiến dịch'))", "(scn.tang === 'ha-noi' ? 'Hà Nội' : 'toàn miền Bắc'))")
# 5. bầu trời: mốc đổi trời có thời gian chuyển riêng (phần tử thứ ba, giây) — đổi cảnh thì đổi ngay
rep("if (i > 0 && t - SKYKEYS[i][0] < 7) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, 7, t - SKYKEYS[i][0]); }",
    "const dd = SKYKEYS[i][2] !== undefined ? SKYKEYS[i][2] : 7; if (i > 0 && t - SKYKEYS[i][0] < dd) { B = A; A = SKY[SKYKEYS[i - 1][1]]; u = sstep(0, dd, t - SKYKEYS[i][0]); }")
# 6. chữ ngày giờ, nhạc theo cảnh
a = s.index('const NGAY_HOI = {'); b = s.index('};', a) + 2
s = s[:a] + """const NGAY_HOI = { C01: ['', 'Tháng 12.1972', 'Hà Nội mùa đông'], C02: ['', '18 – 29.12.1972', 'Chiến dịch Linebacker II'], C03: ['', 'Tháng 12.1972', 'Thế trận phòng không Hà Nội'],
  C04: ['Tối', '18.12.1972', 'Đêm đầu tiên'], C05: ['Đêm 20, rạng sáng', '21.12.1972', 'Bẻ gãy những đợt tập kích'], C06: ['', '18 – 29.12.1972', 'Đấu trí trong màn nhiễu'],
  C07: ['Đêm', '26.12.1972', 'Phố Khâm Thiên'], C08: ['Đêm', '26.12.1972', 'Trận đánh quyết liệt'], C09: ['Đêm', '27 và 28.12.1972', 'MiG-21 xuất kích'],
  C10: ['', '29 – 30.12.1972', 'Đêm cuối cùng'], C11: ['', '18 – 29.12.1972', 'Chiến thắng và mất mát'], C12: ['', '27.1.1973', 'Hiệp định Paris được ký kết'] };""" + s[b:]
a = s.index('const NHAC_KS = {'); b = s.index('};', a) + 2
s = s[:a] + """const NHAC_KS = { C01: ['thuc-day', 0, 0.3], C02: ['ke-thu', 0, 0.36], C03: ['giua-tran', 0, 0.32], C04: ['quyet-chien', 0, 0.34], C05: ['ke-thu', 50, 0.34], C06: ['giua-tran', 40, 0.3],
  C07: ['tro-ve', 0, 0.3], C08: ['quyet-chien', 20, 0.36], C09: ['hiep-si', 50, 0.38], C10: ['giua-tran', 0, 0.32], C11: ['tro-ve', 0, 0.32], C12: ['vi-thanh', 0, 0.44] };   // nhạc theo cảnh (dùng lại nhạc gói HCM / Khe Sanh, MINH HOẠ, anh duyệt lại)""" + s[b:]
# 7. đám đông: bỏ lính VNCH, lính Mỹ; thêm người dân Hà Nội (dùng tạm mẫu dân đô thị của gói HCM 1975 — MINH HOẠ)
rep("dongNap('vnch', 'linh-vnch', 'linh-vnch', 200);", "dongNap('danNam1', 'dan-sg-nam', 'dan-sg-nam-trang', 200); dongNap('danNam2', 'dan-sg-nam', 'dan-sg-nam-xanh', 200); dongNap('danNu0', 'dan-sg-nu', 'dan-sg-nu-trang', 200); dongNap('danNu1', 'dan-sg-nu', 'dan-sg-nu-xanh', 200);")
rep(" dongNap('vnchx', 'linh-vnch-x', 'linh-vnch', 400); dongNap('my', 'linh-my', 'linh-my', 300); dongNap('myx', 'linh-my-x', 'linh-my', 600);", "")
# 8. V0.2 (anh Thắng 26/11): lính không cầm súng (kíp thao tác tên lửa, trắc thủ ra-đa) — mẫu Thành cổ bỏ súng (nuong_nvz.py KHONG_SUNG=1); thêm màu áo dân (áo dài hồng, tím; sơ mi kem)
rep("dongNap('danNu1', 'dan-sg-nu', 'dan-sg-nu-xanh', 200);", "dongNap('danNu1', 'dan-sg-nu', 'dan-sg-nu-xanh', 200); dongNap('danNu2', 'dan-sg-nu', 'dan-sg-nu-hong', 200); dongNap('danNu3', 'dan-sg-nu', 'dan-sg-nu-tim', 200); dongNap('danNam3', 'dan-sg-nam', 'dan-sg-nam-kem', 200);\n  dongNap('ktA', 'linh-kt-a', 'linh-kt-a', 300); dongNap('ktB', 'linh-kt-b', 'linh-kt-b', 300);")
rep("let n = ten === 'qgp' ? (vi % 2 ? 'qgpA' : 'qgpB') : ten;", "let n = ten === 'qgp' ? (vi % 2 ? 'qgpA' : 'qgpB') : ten === 'kt' ? (vi % 2 ? 'ktA' : 'ktB') : ten;")
# 9. âm thanh mới (kho nhạc nền anh Thắng 26/11): tiếng máy bay ném bom (nền lặp), bom rơi rồi nổ, còi báo động, tiếng nổ ngắn
rep("const HCM_BED = ['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang'];",
    "const HCM_BED = ['xetang', 'gio', 'ak47', 'maybay', 'oto', 'trucan', 'lua', 'maybaynb'], HCM_ONE = ['no', 'daibac', 'lua', 'vut', 'coi', 'dang', 'bomroi', 'coibd', 'nongan'];")
# 10. "Cảnh" → "Hồi" (anh Thắng 26/11)
rep("$('sdate').textContent = `Cảnh ${i + 1}/${NSC} · ${scn.title}`", "$('sdate').textContent = `Hồi ${i + 1}/${NSC} · ${scn.ten || scn.title}`")
# 11. Khám phá: nhân vật bắt đầu trên phố (KS.diBo), không đứng giữa hồ
rep("if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { if (XEX.DL)",
    "if (KS.diBo && (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30 || hG(x, z) < tideNow + 0.5)) { [x, z] = KS.diBo; } else if (camera.position.distanceTo(controls.target) > 3000 || Math.hypot(x, z) > R - 30) { if (XEX.DL)")
dst.write_text(s); print('ok', len(s))
