"""Kịch bản 11 hồi (phương án B, anh Thắng duyệt 25/11/2026) từ kịch bản camera của anh, kèm các chỗ sửa lời dẫn theo tư liệu mục 3."""
import json
from pathlib import Path
R = Path(__file__).resolve().parents[4]; K = R / 'vietsu/static/khong-gian/packs/khe-sanh-1968'
SB = json.loads((R / 'docs/du-lieu/khe-sanh-1968_camera_timeline_v1.json').read_text())
SC = {s['id']: s for s in SB['scenes']}
VO = {k: [p.strip() for p in s['voiceover'].split('\n') if p.strip()] for k, s in SC.items()}
# tốc độ đọc (chữ/giây) đo trên kịch bản gốc của anh
W = lambda L: sum(len(x.split()) for x in L)
TOC = sum(W(VO[k]) for k in VO) / sum(s['duration_sec'] for s in SB['scenes'])

def thay(L, cu, moi):
    i = L.index(cu); L[i:i + 1] = moi if isinstance(moi, list) else [moi]

v = {k: list(L) for k, L in VO.items()}
thay(v['C01'], 'Nơi đây, những con đường xuyên qua núi rừng nối miền Đông với biên giới Việt – Lào. Những thung lũng nhỏ nằm giữa các cao điểm, quanh năm chìm trong sương mù và mưa lạnh.',
     'Nơi đây, Đường 9 xuyên qua núi rừng, nối đồng bằng ven biển Đông Hà với biên giới Việt – Lào. Những thung lũng nhỏ nằm giữa các cao điểm, quanh năm chìm trong sương mù và mưa lạnh.')
i0 = v['C02'].index('Đồi 861.'); i1 = v['C02'].index('Đồi 558.')
v['C02'][i0:i1 + 1] = ['Đồi 881 Nam.', 'Đồi 861.', 'Đồi 861A.', 'Đồi 558.']   # 881 Bắc không phải chốt Mỹ (M5, M22)
v['C02'].remove('Trên bản đồ, những căn cứ ấy như một chuỗi mắt xích nằm giữa núi rừng.')
thay(v['C04'], 'Ngoài những ngọn đồi, giao tranh bùng lên tại các vị trí tiền tiêu.',
     ['Cùng đêm ấy, quân Giải phóng tiến công quận lỵ Hướng Hóa.', 'Trên những ngọn đồi, giao tranh bùng lên tại các vị trí tiền tiêu.'])
thay(v['C05'], 'Và trong trận đánh này, một loại khí tài lần đầu tiên được sử dụng trong chiến đấu bởi lực lượng tăng thiết giáp Quân đội nhân dân Việt Nam.',
     'Và trận đánh này sẽ trở thành trận đầu đánh thắng của bộ đội Tăng – Thiết giáp Quân đội nhân dân Việt Nam.')
thay(v['C05'], 'Đến khoảng 10 giờ ngày 7 tháng 2, quân Giải phóng làm chủ Làng Vây.',
     ['Rạng sáng ngày 7 tháng 2, quân Giải phóng cơ bản làm chủ cứ điểm.', 'Đến 10 giờ, Làng Vây hoàn toàn bị đánh chiếm.'])
thay(v['C06'], 'Trên những sườn đồi và vùng đất quanh Tà Cơn, các đơn vị Quân Giải phóng tiến hành những hoạt động vây lấn kéo dài.',
     'Trên những sườn đồi và vùng đất quanh Tà Cơn, các đơn vị Quân Giải phóng tiến hành vây lấn suốt khoảng 50 ngày đêm.')
# Gộp C09 (lòng đất) vào cuối C06, giữ phần cảm xúc chính
c09 = ['Trong những đoạn hào chật hẹp, họ phải quan sát, di chuyển, vận chuyển đạn dược và chăm sóc đồng đội bị thương.',
       'Ở phía bên kia chiến tuyến, những người lính trong căn cứ cũng sống giữa sức ép thường trực của pháo kích và sự bất định.',
       'Khe Sanh không chỉ là những mũi tên trên bản đồ.',
       'Đằng sau mỗi vị trí chiến đấu là những con người đang phải chịu đựng hiểm nguy, mất mát và những tháng ngày xa gia đình.']
i = v['C06'].index('Cuộc chiến tại Khe Sanh đã trở thành cuộc đọ sức dai dẳng về sức chịu đựng, hỏa lực và hậu cần của cả hai phía.')
for x in ['Những người lính phải sống và chiến đấu trong điều kiện vô cùng gian khổ.']: pass
v['C06'][i:i] = c09
thay(v['C10'], 'Quân Giải phóng tiếp tục tổ chức đánh chặn, gây sức ép lên các vị trí và tuyến cơ động.',
     ['Quân Giải phóng lập chốt Làng Khoai ngay trên Đường 9, chặn đánh đội hình giải tỏa suốt bốn ngày.', 'Các đơn vị khác tiếp tục gây sức ép lên các vị trí và tuyến cơ động.'])
thay(v['C10'], 'Đến đầu tháng 4, các lực lượng giải tỏa đã nối được liên lạc trực tiếp với quân Mỹ tại Khe Sanh.',
     'Ngày 8 tháng 4, các lực lượng giải tỏa tới được căn cứ Khe Sanh.')
# Gộp C11 vào đầu C12
c11 = ['Chiến dịch Pegasus kết thúc giai đoạn vây hãm căn cứ, nhưng chiến trường Khe Sanh vẫn chưa trở lại yên bình.',
       'Từ tháng 5, Quân Giải phóng mở đợt tiến công mới, khôi phục thế vây lấn Tà Cơn.',
       'Khe Sanh giờ đây không chỉ là một căn cứ.', 'Mà đã trở thành một vấn đề chiến lược đối với bộ chỉ huy Mỹ.']
thay(v['C12'], 'Cuối tháng 6 và đầu tháng 7, hoạt động rút căn cứ của quân Mỹ được triển khai.',
     'Từ ngày 27 tháng 6, quân Mỹ rút khỏi căn cứ. Đến ngày 5 tháng 7, căn cứ được giải thể.')
thay(v['C12'], 'Đến giữa tháng 7 năm 1968, Chiến dịch Đường 9 – Khe Sanh, theo cách phân kỳ của lịch sử quân sự Việt Nam, kết thúc.',
     ['Ngày 9 tháng 7, lá cờ chiến thắng tung bay trên sân bay Tà Cơn.', 'Ngày 15 tháng 7 năm 1968, Chiến dịch Đường 9 – Khe Sanh kết thúc.'])
v['C12'] = c11 + v['C12']
# rút gọn cho khoảng 13,5 phút
for x in ['Ban ngày, tiếng máy bay vang trên bầu trời.', 'Ban đêm, tiếng pháo và những cuộc giao tranh lại khiến chiến trường không yên.',
          'Ở phía bên kia chiến tuyến, những người lính trong căn cứ cũng sống giữa sức ép thường trực của pháo kích và sự bất định.']: v['C06'].remove(x)
for x in ['Các đơn vị rút người và phương tiện.', 'Những trang bị không thể vận chuyển được xử lý tại chỗ.',
          'Đó là một diễn biến có ý nghĩa quan trọng đối với chiến trường Đường 9.', 'Trong khi đó, quân Giải phóng tiếp tục các hoạt động quân sự tại khu vực.']: v['C12'].remove(x)

HOI = [  # (cảnh nguồn, tên, tầng, ngày, nguồn, cảnh gộp)
 ('C01', 'Thung lũng Khe Sanh – Vùng đất chiến lược', 'chien-dich', '1968', ['M6', 'M11'], []),
 ('C02', 'Những pháo đài trên Đường 9', 'ta-con', 'cuối 1967 – đầu 1968', ['M5', 'M25', 'S1'], []),
 ('C03', 'Thế trận trước giờ nổ súng', 'chien-dich', 'cuối 1967', ['S3', 'S4'], []),
 ('C04', 'Ngày 21 tháng 1 – Khe Sanh bùng cháy', 'ta-con', 'đêm 20 – rạng sáng 21/1/1968', ['S7', 'S3', 'M7'], []),
 ('C08', 'Tết Mậu Thân – Hai chiến trường, một thời khắc', 'chien-dich', 'đêm 29/1 – 31/1/1968', ['S16'], []),
 ('C05', 'Làng Vây – Xe tăng Việt Nam xuất trận', 'ta-con', 'đêm 6 – sáng 7/2/1968', ['S2', 'S8', 'M12'], []),
 ('C06', 'Những chiến hào siết chặt Tà Cơn', 'ta-con', '10/2 – 31/3/1968', ['S1', 'S5', 'M21'], ['C09']),
 ('C07', 'Bầu trời Khe Sanh – Mưa bom và tiếp tế', 'ta-con', '21/1 – 8/4/1968', ['M1', 'M9', 'M10'], []),
 ('C10', 'Pegasus – Chiến dịch giải tỏa Khe Sanh', 'chien-dich', '1 – 15/4/1968', ['M2', 'M3', 'M4', 'S13'], []),
 ('C12', 'Mùa hè 1968 – Quân Mỹ rời Tà Cơn', 'ta-con', '5 – 15/7/1968', ['S17', 'M8', 'S14', 'S4'], ['C11']),
 ('C13', 'Khe Sanh – Dấu ấn một chiến dịch', 'chien-dich', '20/1 – 15/7/1968', ['S4'], []),
]
scenes, the, t = [], [], 0.0
for n, (sid, ten, tang, ngay, nguon, gop) in enumerate(HOI, 1):
    vo = v[sid]; dur = round(W(vo) / TOC)
    goc = [x for x in SB['shots'] if x['scene_id'] in [sid] + gop]
    # gộp cú máy: giữ cú máy của cảnh chính, thêm tối đa 2 cú cận của cảnh gộp; co giãn đều theo thời lượng mới
    phu = [x for x in goc if x['scene_id'] in gop and x['shot_type'] in ('cận', 'trung')][:2]
    chinh = [x for x in goc if x['scene_id'] == sid]
    ds = chinh[:-1] + phu + chinh[-1:] if phu else chinh
    tong = sum(x['global_end_sec'] - x['global_start_sec'] for x in ds); u = t
    shots = []
    for x in ds:
        d = (x['global_end_sec'] - x['global_start_sec']) * dur / tong
        shots.append({'id': x['shot_id'], 't0': round(u, 2), 't1': round(u + d, 2), 'size': x['shot_type'].capitalize(),
                      'desc': x['focus'], 'may': x['camera_move'], 'canh': x['subject_action']}); u += d
    scenes.append({'id': f'H{n:02d}', 'goc': [sid] + gop, 'hoi': f'Hồi {n}', 'ten': ten, 'title': f'Hồi {n} · {ten}', 'tang': tang,
                   'place': SC[sid]['place'], 'date': ngay, 't0': round(t, 2), 't1': round(t + dur, 2), 'nguon': nguon,
                   'shots': shots, 'vo': vo, 'subs': []})
    the.append([round(t, 2), round(t + 5, 2), f'HỒI {n}', ten.upper()]); t += dur
story = {
 'note': 'KỊCH BẢN 11 HỒI (anh Thắng duyệt 25/11/2026: phương án B, đưa Tết lên hồi 5, gộp cảnh "lòng đất" vào hồi 7, "chưa yên tiếng súng" vào hồi 10; sửa lời theo docs/KHE_SANH_1968_TU_LIEU.md mục 3). Nguồn: docs/du-lieu/khe-sanh-1968_camera_timeline_v1.json. Chưa có voice: t0/t1 ước theo số chữ (tốc độ đọc của kịch bản gốc); khi có bản thu sẽ dựng lại theo voice. Trường goc: mã cảnh trong kịch bản camera; nguon: mã trong sources.json.',
 'duration': round(t, 2), 'scenes': scenes, 'arrows': {}, 'states': {'none': []}, 'legend': {}, 'refs': [], 'danY': [], 'moc': {},
 'voice': {'file': None, 'nguon': 'chưa thu'}, 'the': the}
(K / 'story.json').write_text(json.dumps(story, ensure_ascii=False, indent=1))
print(f'tốc độ {TOC:.2f} chữ/s · tổng {t:.0f} s = {t/60:.1f} phút')
for s in scenes: print(s['hoi'], s['ten'], s['t1'] - s['t0'], 's', len(s['shots']), 'cú')
