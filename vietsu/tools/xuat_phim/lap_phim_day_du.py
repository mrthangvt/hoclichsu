#!/usr/bin/env python3
"""Lập danh sách khoảnh khắc cho PHIM ĐẦY ĐỦ 16:9 từ kịch bản của sa bàn (data/episodes.json).

Mỗi phân cảnh = một khoảnh khắc, dùng máy quay của bộ dẫn chuyện (góc máy đã dựng cho màn hình ngang),
phụ đề = lời dẫn, giọng đọc = audio/voice/<id>-<nn>.mp3 đúng giây, nhạc nền theo chương (khai báo `music` trong
episodes.json, tệp Epidemic Sound nằm ngoài repo), nền tiếng súng theo mức `audio.battle` của chương.

Dùng: python3 vietsu/tools/xuat_phim/lap_phim_day_du.py [--w 3840 --h 2160] [--ra khoanh_khac_thanh_co_169_day_du]
"""
import argparse, json, os, subprocess

GOC = os.path.dirname(os.path.abspath(__file__))
SB = os.path.normpath(os.path.join(GOC, '..', '..', 'static', 'khong-gian', 'thanh-co-quang-tri'))
# tên tệp nhạc trong sa bàn → tệp gốc Epidemic Sound (thư mục _KHO-CHUNG/nhac-nen trên ổ xMABUx)
NHAC = {
    'hiep-si.mp3': 'ES_I Will Be Your Knight - Jo Wandrini.mp3',
    'tro-ve.mp3': 'ES_Tough Return - Phoenix Tail.mp3',
    'ke-thu.mp3': 'ES_Arbitrary Enemy - Experia.mp3',
    'quyet-chien.mp3': 'ES_Final Battle - Max Anson.mp3',
    'giai-dieu.mp3': 'ES_Run! STEMS MELODY - Christoffer Moe Ditlevsen.mp3',
    'giua-tran.mp3': 'ES_The Thick of It - Jon Bjork.mp3',
    'thuc-day.mp3': 'ES_It Has Awoken - Dream Cave.mp3',
    'vi-thanh.mp3': 'ES_Hero Epilogue - Experia.mp3',
}


def dai(f):
    try:
        return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    except Exception:
        return 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--w', type=int, default=3840); ap.add_argument('--h', type=int, default=2160)
    ap.add_argument('--ra', default='khoanh_khac_thanh_co_169_day_du')
    ap.add_argument('--don_gian', action='store_true', help='như video thường: chỉ logo kênh Trường Thắng Documentary góc trên phải, không nhãn, thẻ, phụ đề, khung kết')
    ap.add_argument('--giao_dien', action='store_true', help='quay kèm giao diện app (mở bằng khung.html), logo Học Lịch Sử')
    a = ap.parse_args()
    d = json.load(open(os.path.join(SB, 'data', 'episodes.json'), encoding='utf-8'))
    eps = [e for e in d['episodes'] if e.get('ready') and e.get('cam')]
    ds, nhac = [], []
    t0 = 0.0
    for e in eps:
        dur = e['duration_sec']
        phu, giong = [], []
        L = e.get('lines', [])
        for n, l in enumerate(L):
            if not l.get('text'):
                continue
            tep = f"{e['id']}-{n + 1:02d}.mp3"
            du = dai(os.path.join(SB, 'audio', 'voice', tep))
            ke = L[n + 1]['t'] if n + 1 < len(L) else dur
            phu.append({'tu': l['t'], 'den': round(min(ke, l['t'] + (du + 0.5 if du else 6)), 2), 'text': l['text']})
            if du:
                giong.append({'tep': tep, 'tu': 0.0, 'den': round(du, 3), 'luc': l['t']})
        # mức tiếng súng nền: trung bình theo thời gian của audio.battle
        mk = [(k['t'], k['audio']['battle']) for k in e.get('env', []) if 'audio' in k and 'battle' in k['audio']]
        bat = 0.0
        for j, (t, b) in enumerate(mk):
            ke = mk[j + 1][0] if j + 1 < len(mk) else dur
            bat += b * (ke - t) / dur
        # nhạc theo chương
        M = e.get('music') or []
        M = M if isinstance(M, list) else [M]
        for j, m in enumerate(M):
            ke = M[j + 1]['start'] if j + 1 < len(M) else dur
            ten = os.path.basename(m['src'])
            if ten not in NHAC:
                continue
            nhac.append({'tep': NHAC[ten], 'luc': round(t0 + m['start'], 3), 'tu': m.get('from', 0), 'dai': round(ke - m['start'], 3),
                         'am_luong': m.get('volume', 0.45), 'vao': m.get('fade_in', 2.5), 'ra': m.get('fade_out', 3)})
        k = {'id': e['id'], 'ten': e['title'], 'chuong': e['id'], 'tu': 0, 'dai': dur, 'chuan_bi': 0,
             'may': {'dao_dien': True, 'fov': 50}, 'the': {'chu': e['title'], 'nho': f"PHẦN {e.get('sequence', len(ds) + 1)}", 'tu': 0.4, 'den': 4.6},
             'phu_de': phu, 'loi_dan': giong, 'nen_sung': round(bat, 2)}
        if not ds:
            k['den_vao'] = 1.2
        ds.append(k)
        t0 += dur
    cfg = {
        '_ghi_chu': 'Phim đầy đủ 16:9 sinh bằng lap_phim_day_du.py từ data/episodes.json (sửa kịch bản thì chạy lại lệnh này). '
                    'Máy quay = bộ dẫn chuyện của sa bàn; phụ đề = lời dẫn; nhạc theo chương (Epidemic Sound, thư mục thu_muc_nhac); '
                    'tach_tep: ghi từng phần ~10 s (phim dài, khung 4K).',
        'ten': 'thanh_co_169_day_du', 'sa_ban': 'thanh-co-quang-tri',
        'khung': {'w': a.w, 'h': a.h, 'fps': 30}, 'hat': 1972, 'tach_tep': True,
        'ma_hoa': {'bitrate': 35000000 if a.w * a.h > 2.2e6 else 16000000},
        'nhan': 'TÁI DỰNG MÔ PHỎNG', 'logo': '/xuat_phim/tai_nguyen/logo-hoc-lich-su-chu.webp', 'logo_rong': 170,
        'thu_muc_nhac': '/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/_KHO-CHUNG/nhac-nen',
        'nhac_doan': nhac, 'nhac': {'ha_khi_doc': 0.45},
        'giong': {'am_luong': 1.0}, 'hieu_ung': {'tep_no': 'bom-no.mp3', 'no_ghi_lai': 0.22, 'tep_nen': 'sung-nen.mp3', 'nen': 0.32},
        'khoanh_khac': ds,
        'ket': {'chuong': eps[-1]['id'], 'tu': max(0, eps[-1]['duration_sec'] - 9), 'dai': 9, 'chuan_bi': 0,
                'may': {'dao_dien': True, 'fov': 50}, 'chu': 'Khám phá sa bàn 3D tại Học Lịch Sử', 'web': 'hoclichsu.com',
                'logo': '/xuat_phim/tai_nguyen/logo-hoc-lich-su.webp', 'logo_rong': 400, 'logo_y': 330,
                'cong': 'Tái dựng mô phỏng, cần đối chiếu tư liệu · Lời dẫn và nguồn tư liệu trong sa bàn · Nhạc nền: Epidemic Sound · Dữ liệu bản đồ © OpenStreetMap contributors',
                'den_ra': 1.2},
    }
    if a.don_gian:
        cfg.update({'ten': 'thanh_co_169_video', 'nhan': False, 'logo_kenh': '/xuat_phim/tai_nguyen/logo-truong-thang.png',
                    'logo_kenh_rong': 260, 'logo_kenh_tren': True, 'logo_kenh_mo': 0.9})
        cfg.pop('logo', None); cfg.pop('ket', None)
        for k in ds:
            k.pop('the', None); k.pop('phu_de', None)
        ds[-1]['den_ra'] = 2.5
        if a.ra == 'khoanh_khac_thanh_co_169_day_du':
            a.ra = 'khoanh_khac_thanh_co_169_video'
    if a.giao_dien:   # bản quay kèm nút/thẻ/phụ đề của app: không chèn nhãn, thẻ, phụ đề riêng; logo Học Lịch Sử
        cfg.update({'ten': 'thanh_co_169_giao_dien', 'giao_dien': True, 'logo': '/xuat_phim/tai_nguyen/logo-hoc-lich-su-chu.webp',
                    'logo_ui': {'rong': 190, 'x': -28, 'y': -150, 'mo': 0.92}})
        cfg.pop('logo_kenh', None); cfg.pop('logo_kenh_rong', None)
        cfg['ket'].update({'chu': 'Khám phá sa bàn 3D tại Học Lịch Sử', 'web': '', 'logo': '/xuat_phim/tai_nguyen/logo-hoc-lich-su.webp',
                           'logo_rong': 520, 'logo_y': 360, 'chu_y': 720})
        if a.ra == 'khoanh_khac_thanh_co_169_day_du':
            a.ra = 'khoanh_khac_thanh_co_169_giao_dien'
    out = os.path.join(GOC, a.ra + '.json')
    json.dump(cfg, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(out, f'{t0 + 9:.0f} s', len(nhac), 'đoạn nhạc')


if __name__ == '__main__':
    main()
