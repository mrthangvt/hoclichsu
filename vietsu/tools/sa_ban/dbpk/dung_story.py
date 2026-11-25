"""story.json + audio/voice.mp3 cho sa bàn Điện Biên Phủ trên không 1972 theo bản voice anh Thắng (dienbienphutrenkhong-voice.mp3, 865 s).
python3 dung_story.py <voice gốc.mp3> <can.json> <thư mục gói>
- can.json: can_voice.py (nhận dạng asr_onnx.py ↔ lời dẫn KICH_BAN_CLAUDE_12_CANH.md, khớp 98,5 % số từ).
- Voice đọc liền giữa các cảnh (~0,3 s) → chèn 1,2 s lặng trước mỗi cảnh 2…12 và 0,8 s đầu phim (như Khe Sanh).
- Cú máy: mỗi cảnh chia theo câu đọc (CU), cỡ cảnh theo định hướng toàn – trung – cận của kịch bản; máy quay từng cú ở bien_dao_dbpk.js.
- story.moc['C04.13'] = giây bắt đầu câu 13 của cảnh C04 (đồng hồ của mọi hoạt cảnh)."""
import json, sys, subprocess
from pathlib import Path
GOC, CAN, GOI = sys.argv[1], sys.argv[2], Path(sys.argv[3])
A = json.load(open(CAN)); CANH = A['canh']
DAU, LANG = 0.8, 1.2
CAT = [round((CANH[k - 1]['cau'][-1][1] + CANH[k]['cau'][0][0]) / 2, 3) for k in range(1, 12)]
doi = lambda t: round(t + DAU + LANG * sum(1 for c in CAT if t >= c), 2)
mp3 = GOI / 'audio/voice.mp3'
seg = [0.0] + CAT + [A['dai']]
f = ''.join(f'[0]atrim={a}:{b},asetpts=PTS-STARTPTS[s{i}];' for i, (a, b) in enumerate(zip(seg, seg[1:])))
f += f'anullsrc=r=24000:cl=mono,atrim=0:{DAU}[l0];' + ''.join(f'anullsrc=r=24000:cl=mono,atrim=0:{LANG}[l{i + 1}];' for i in range(len(CAT)))
f += '[l0]' + ''.join(f'[s{i}][l{i + 1}]' for i in range(len(CAT))) + f'[s{len(CAT)}]concat=n={2 * len(CAT) + 2}:v=0:a=1,aresample=32000[o]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', GOC, '-filter_complex', f, '-map', '[o]', '-ac', '1', '-b:a', '48k', str(mp3)], check=True)
DAI = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)], capture_output=True, text=True).stdout)
# ---------------- cảnh: tầng, nơi, ngày, cú máy theo câu đọc [câu bắt đầu, cỡ, chủ thể, cách máy]
TANG = {'C02': 'mien-bac', 'C08': 'mien-bac', 'C09': 'mien-bac'}
NOI = {'C01': 'Hà Nội', 'C02': 'Vùng trời miền Bắc', 'C03': 'Hà Nội và mạng lưới phòng không', 'C04': 'Hà Nội; Phù Lỗ, Đông Anh', 'C05': 'Các trận địa tên lửa quanh Hà Nội',
       'C06': 'Trận địa tên lửa, xe điều khiển', 'C07': 'Khâm Thiên, Bạch Mai', 'C08': 'Hà Nội, Hải Phòng', 'C09': 'Sân bay Yên Bái, vùng trời Tây Bắc', 'C10': 'Hà Nội',
       'C11': 'Hà Nội, hồ Hữu Tiệp', 'C12': 'Hà Nội'}
NGAY = {'C01': 'tháng 12/1972', 'C02': '18 – 29/12/1972', 'C03': 'tháng 12/1972', 'C04': 'tối 18/12/1972', 'C05': 'đêm 20, rạng sáng 21/12/1972', 'C06': '18 – 29/12/1972',
        'C07': 'đêm 26/12/1972', 'C08': 'đêm 26/12/1972', 'C09': 'đêm 27 và 28/12/1972', 'C10': '29 – 30/12/1972', 'C11': '18 – 29/12/1972', 'C12': '27/1/1973 – hôm nay'}
NGUON = {'C01': ['S1', 'M1'], 'C02': ['M1', 'M2', 'M3'], 'C03': ['S2', 'S5'], 'C04': ['S1', 'S2', 'S3', 'S4'], 'C05': ['S6', 'S7', 'S8'], 'C06': ['S6', 'S9'], 'C07': ['S10', 'S11', 'S12'],
         'C08': ['S13', 'S5'], 'C09': ['S14', 'S15', 'S16'], 'C10': ['S17', 'S18'], 'C11': ['S5', 'M1', 'M3'], 'C12': ['S1']}
CU = {
 'C01': [[0, 'Đại toàn', 'Hà Nội mùa đông 1972: sông Hồng, cầu Long Biên, Hồ Tây, phố cổ', 'Bay cao vòng chậm'], [3, 'Trung', 'Phố Đinh Tiên Hoàng: xe đạp, tàu điện', 'Máy ngang mái nhà, lướt theo phố'],
         [5, 'Toàn', 'Nhà máy Xe lửa Gia Lâm, ống khói', 'Vòng nghiêng'], [6, 'Trung', 'Trận địa tên lửa ban ngày, lính trực', 'Qua bệ phóng'], [7, 'Đại toàn', 'Hà Nội nhìn từ trên cao', 'Kéo lên'],
         [9, 'Toàn', 'Bản đồ: Hà Nội và Hải Phòng — hai mục tiêu trọng điểm', 'Thẻ bản đồ'], [12, 'Đại toàn', 'Hà Nội lúc chạng vạng', 'Vòng rộng, trời tối dần']],
 'C02': [[0, 'Toàn', 'Bản đồ: căn cứ Andersen (Guam) và U-Tapao (Thái Lan)', 'Thẻ bản đồ'], [1, 'Cận', 'B-52D: tám động cơ, khoang bom', 'Bám cạnh thân'],
         [2, 'Toàn', 'Đội hình ba chiếc một tốp', 'Bay song song'], [3, 'Toàn', 'Máy bay hộ tống, nhiễu, sợi nhiễu', 'Phía sau đội hình'],
         [5, 'Đại toàn', 'Các tốp tiến vào miền Bắc từ nhiều hướng', 'Rất cao'], [6, 'Trung', 'Trận địa phòng không chờ đánh', 'Mặt đất nhìn lên'], [8, 'Đại toàn', 'Hà Nội về đêm', 'Vòng']],
 'C03': [[0, 'Đại toàn', 'Thế trận nhiều tầng quanh Hà Nội', 'Rất cao, ghim khí tài'], [1, 'Trung', 'Đài ra-đa cảnh giới P-12 quay', 'Vòng quanh ăng-ten'],
         [2, 'Toàn', 'Tiểu đoàn tên lửa S-75: sáu bệ phóng quanh xe điều khiển', 'Nghiêng cao'], [3, 'Trung', 'Pháo cao xạ bên cầu Long Biên', 'Thấp, qua nòng pháo'],
         [4, 'Toàn', 'MiG-21 trên sân bay Nội Bài', 'Dọc đường băng'], [5, 'Trung', 'Dân quân tự vệ với súng 12,7 mm', 'Ngang'], [6, 'Đại toàn', 'Mạng lưới phòng không thống nhất', 'Vòng cao'],
         [8, 'Cận', 'Màn hình ra-đa (mô phỏng)', 'Thẻ màn hình'], [9, 'Trung', 'Kíp chiến đấu trong trận địa', 'Thấp'], [10, 'Đại toàn', 'Hà Nội trong đêm', 'Vòng']],
 'C04': [[0, 'Cận', 'Màn hình ra-đa: dải nhiễu B-52 (mô phỏng)', 'Thẻ màn hình'], [2, 'Trung', 'Sở chỉ huy: bàn tiêu đồ', 'Ngang bàn'],
         [4, 'Đại toàn', 'Các tốp B-52 tiến về từ hướng Tam Đảo', 'Cao phía nam nhìn lên bắc'], [5, 'Toàn', 'Phố Hà Nội: còi báo động, đèn tắt dần', 'Ngang mái nhà'],
         [7, 'Trung', 'Người dân xuống hầm', 'Thấp trên phố'], [8, 'Trung', 'Bộ đội tên lửa vào vị trí', 'Qua bệ phóng'],
         [9, 'Đại toàn', 'Bom rơi khu Đông Anh, Gia Lâm, Yên Viên', 'Cao'], [11, 'Toàn', 'Tên lửa, đạn cao xạ lao lên', 'Từ mặt đất nhìn lên'],
         [13, 'Trung', 'Tiểu đoàn 59 phóng hai quả đạn', 'Cạnh bệ phóng'], [14, 'Đại toàn', 'B-52 trúng đạn, rơi xuống cánh đồng Phù Lỗ', 'Bám theo chiếc rơi'],
         [16, 'Toàn', 'Xác B-52 cháy trên cánh đồng', 'Vòng thấp'], [18, 'Đại toàn', 'Hà Nội đêm đầu tiên', 'Kéo lên']],
 'C05': [[0, 'Toàn', 'Trận địa cơ động, xe chở đạn', 'Bám xe'], [3, 'Cận', 'Màn hình ra-đa trong nhiễu (mô phỏng)', 'Thẻ màn hình'],
         [4, 'Đại toàn', 'Các tốp B-52 liên tiếp tiếp cận', 'Cao'], [7, 'Toàn', 'Các trận địa phóng đạn', 'Nhìn lên'], [8, 'Đại toàn', '5 giờ 02 – 5 giờ 11: bốn chiếc trúng đạn ở bốn nơi', 'Rất cao + đồng hồ'],
         [11, 'Trung', 'Kíp điều khiển', 'Ngang xe điều khiển'], [14, 'Trung', 'Chiến sĩ chuyển đạn lên bệ', 'Cạnh xe chở đạn'], [16, 'Đại toàn', 'Bầu trời Hà Nội trước bình minh', 'Vòng']],
 'C06': [[0, 'Đại toàn', 'Tốp B-52 trong màn nhiễu', 'Cao bên cạnh'], [2, 'Toàn', 'Nhiễu điện tử và sợi nhiễu quanh đội hình', 'Phía sau'],
         [3, 'Cận', 'Màn hình điều khiển: mục tiêu lẫn trong dải nhiễu (mô phỏng)', 'Thẻ màn hình'], [6, 'Trung', 'Xe điều khiển, ăng-ten quét', 'Vòng thấp'],
         [11, 'Toàn', 'Hậu cần chuyển đạn, cơ động khí tài', 'Bám xe'], [12, 'Đại toàn', 'Trận địa giữa đêm', 'Kéo lên']],
 'C07': [[0, 'Toàn', 'Phố Hà Nội sau những trận bom', 'Ngang mái'], [2, 'Trung', 'Nhà đổ sập, gạch đá', 'Thấp'], [4, 'Toàn', 'Bệnh viện Bạch Mai bị tàn phá (đêm 21 rạng 22/12)', 'Vòng'],
         [5, 'Đại toàn', 'Đêm 26/12: vệt bom B-52 dọc phố Khâm Thiên', 'Cao'], [6, 'Toàn', 'Khâm Thiên chìm trong khói lửa', 'Thấp trên phố'],
         [9, 'Trung', 'Dân quân, y tế, người dân tìm kiếm cứu nạn', 'Ngang người'], [11, 'Cận', 'Vật dụng gia đình giữa đổ nát', 'Sát mặt đất'], [13, 'Toàn', 'Khâm Thiên rạng sáng', 'Kéo lên']],
 'C08': [[0, 'Đại toàn', 'Đêm 26/12: các hướng tập kích vào Hà Nội, Hải Phòng', 'Rất cao, mũi tên'], [3, 'Toàn', 'Bầu trời bừng sáng đạn tên lửa', 'Trên Hà Nội'],
         [4, 'Trung', 'Kíp chiến đấu theo dõi đội hình', 'Cạnh bệ phóng'], [6, 'Toàn', 'Tên lửa lao lên', 'Nhìn lên'], [7, 'Đại toàn', 'B-52 trúng đạn ở nhiều nơi', 'Cao'],
         [11, 'Toàn', 'Đám cháy trong thành phố', 'Vòng'], [13, 'Đại toàn', 'Miền Bắc giữa đêm', 'Kéo lên']],
 'C09': [[0, 'Đại toàn', 'Sân bay Yên Bái trong đêm', 'Vòng cao'], [2, 'Trung', 'MiG-21 trực chiến', 'Ngang cánh'], [5, 'Toàn', 'B-52 và máy bay hộ tống', 'Bay song song'],
         [8, 'Trung', 'Phạm Tuân cất cánh từ Yên Bái', 'Bám đuôi'], [9, 'Đại toàn', 'Dẫn đường mặt đất, tiếp cận đội hình B-52 hướng Mộc Châu', 'Cao, đường bay'],
         [10, 'Toàn', 'Phóng tên lửa, B-52 trúng đạn', 'Bên đội hình'], [11, 'Đại toàn', 'Đêm 28/12: Vũ Xuân Thiều cất cánh từ Cẩm Thủy', 'Cao'],
         [14, 'Toàn', 'Đánh trúng B-52 trên vùng trời Tây Bắc', 'Bên đội hình'], [15, 'Trung', 'Cánh bay không trở về', 'Xa dần'], [17, 'Đại toàn', 'Hai đường bay trên bản đồ', 'Rất cao']],
 'C10': [[0, 'Toàn', 'Đêm 29/12: bầu trời thưa B-52', 'Vòng'], [5, 'Trung', 'Trận địa trực chiến', 'Qua bệ phóng'], [6, 'Cận', 'Màn hình ra-đa (mô phỏng)', 'Thẻ màn hình'],
         [7, 'Trung', 'Pháo cao xạ sẵn sàng', 'Thấp'], [9, 'Toàn', 'Tiểu đoàn 79 phóng đạn, B-52 trúng đạn', 'Nhìn lên'], [10, 'Đại toàn', 'Rạng sáng 30/12', 'Bình minh'],
         [12, 'Toàn', 'Bầu trời Thủ đô yên tĩnh', 'Vòng chậm'], [13, 'Trung', 'Dấu tích bom đạn', 'Thấp']],
 'C11': [[0, 'Toàn', 'Xác B-52 dưới hồ Hữu Tiệp', 'Vòng quanh hồ'], [1, 'Toàn', 'Số liệu: phía Việt Nam / phía Mỹ (có nguồn)', 'Thẻ số liệu'],
         [7, 'Trung', 'Bộ đội tên lửa', 'Bệ phóng'], [9, 'Trung', 'Bộ đội ra-đa', 'Ăng-ten'], [10, 'Trung', 'Bộ đội không quân', 'MiG-21'], [11, 'Trung', 'Pháo cao xạ', 'Nòng pháo'],
         [12, 'Trung', 'Dân quân tự vệ', 'Súng 12,7 mm'], [13, 'Toàn', 'Hậu cần, cứu thương, sơ tán', 'Phố'], [14, 'Toàn', 'Khâm Thiên, Bạch Mai: những mất mát', 'Chậm'],
         [18, 'Cận', 'Những mất mát: vật dụng gia đình giữa đổ nát', 'Sát']],
 'C12': [[0, 'Toàn', 'Hà Nội đầu năm 1973', 'Vòng'], [4, 'Trung', 'Cột cờ Hà Nội', 'Ngẩng lên'], [6, 'Trung', 'Những người làm nên chiến thắng', 'Lần lượt'],
         [10, 'Đại toàn', 'Từ chiến hào tới mái nhà Thủ đô', 'Cao'], [12, 'Đại toàn', 'Mười hai ngày đêm', 'Kéo lên'], [14, 'Trung', 'Cờ Tổ quốc trên Cột cờ Hà Nội', 'Ngẩng lên'],
         [16, 'Đại toàn', 'Hà Nội hôm nay — hoà bình', 'Vòng rộng, trời sáng']],
}
scenes, moc, subs_all = [], {}, []
for k, c in enumerate(CANH):
    t0 = 0.0 if k == 0 else round(doi(c['cau'][0][0]) - 0.5, 2)
    cau = [[doi(a), doi(b), tx] for a, b, tx, _ in c['cau']]
    for j, (a, b, tx) in enumerate(cau): moc[f"{c['id']}.{j}"] = a
    scenes.append({'id': c['id'], 'hoi': f'Cảnh {k + 1}', 'ten': c['ten'], 'title': f"Cảnh {k + 1} · {c['ten']}", 'tang': TANG.get(c['id'], 'ha-noi'),
                   'place': NOI[c['id']], 'date': NGAY[c['id']], 't0': t0, 'nguon': NGUON[c['id']], 'hinh': c['hinh'], 'vo': [x[2] for x in cau], '_cau': cau})
for k, s in enumerate(scenes):
    s['t1'] = scenes[k + 1]['t0'] if k < 11 else round(max(s['_cau'][-1][1] + 4.0, DAI), 2)
    cau = s.pop('_cau'); sh = []
    for i, (ci, size, desc, may) in enumerate(CU[s['id']]):
        a = s['t0'] if i == 0 else round(cau[ci][0] - 0.25, 2)
        sh.append({'id': f"{s['id']}-{i + 1:02d}", 't0': a, 'size': size, 'desc': desc, 'may': may})
    for i, x in enumerate(sh): x['t1'] = sh[i + 1]['t0'] if i + 1 < len(sh) else s['t1']
    s['shots'] = sh
    # phụ đề: câu dài tách ở dấu phẩy (≤ 88 ký tự)
    subs = []
    for a, b, tx in cau:
        if len(tx) <= 88: subs.append([a, b, tx]); continue
        parts, cur = [], ''
        for w in tx.split(', '):
            if cur and len(cur) + len(w) + 2 > 88: parts.append(cur + ','); cur = w
            else: cur = (cur + ', ' + w) if cur else w
        parts.append(cur); L = sum(len(p) for p in parts); x = a
        for p in parts: y = x + (b - a) * len(p) / L; subs.append([round(x, 2), round(y, 2), p]); x = y
    s['subs'] = subs
DUR = scenes[-1]['t1']
the = [[round(s['t0'] + 0.3, 2), round(s['t0'] + 5.0, 2), s['hoi'].upper(), s['ten'].upper()] for s in scenes]
story = {'note': 'KỊCH BẢN 12 CẢNH THEO VOICE (giây voice). Dựng bằng tools/sa_ban/dbpk/dung_story.py từ can.json (nhận dạng voice ↔ lời dẫn KICH_BAN_CLAUDE_12_CANH.md, khớp '
         + f"{A['khop'] * 100:.1f} % số từ). Phụ đề: câu chữ lời dẫn, mốc theo voice. moc['Cxx.n']: giây bắt đầu câu n của cảnh Cxx.",
         'duration': DUR, 'scenes': scenes, 'arrows': {}, 'states': {'none': []}, 'legend': {}, 'refs': [], 'danY': [], 'moc': moc,
         'voice': {'file': 'audio/voice.mp3', 'nguon': f"Bản voice anh Thắng làm (dienbienphutrenkhong-voice.mp3, {A['dai']:.0f} s; chèn {LANG} s lặng trước mỗi cảnh 2–12, {DAU} s đầu phim); mốc từng từ nhận dạng bằng tools/sa_ban/voice/asr_onnx.py, khớp {A['khop'] * 100:.1f} % số từ lời dẫn"},
         'the': the}
json.dump(story, open(GOI / 'story.json', 'w'), ensure_ascii=False, indent=1)
print('voice', round(DAI, 2), 's · phim', DUR, 's ·', sum(len(s['shots']) for s in scenes), 'cú máy')
for s in scenes: print(s['id'], s['tang'], s['t0'], s['t1'], len(s['shots']))
