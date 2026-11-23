#!/usr/bin/env python3
"""Dựng âm thanh bằng ffmpeg từ tệp gốc của sa bàn và ghép với hình đã xuất → MP4 (H.264 + AAC) để đăng.

Dùng:  python3 vietsu/tools/xuat_phim/ghep_am_thanh.py [khoanh_khac_thanh_co_916] [--hinh ket_qua/thanh_co_916.h264] [--ra ket_qua/thanh_co_916.mp4]

- Giọng đọc: các đoạn cắt từ audio/voice/<tệp> (khai báo `loi_dan` trong danh sách khoảnh khắc), đặt đúng giây.
- Nhạc nền: tệp `nhac.tep` của sa bàn, từ giây `nhac.tu`, tự hạ khi có lời dẫn (sidechain), hiện/lặng dần đầu–cuối.
- Chuẩn âm lượng −14 LUFS (mức YouTube), AAC 192 kbps 48 kHz. Hình giữ nguyên (không mã hoá lại).
Cần ffmpeg (Mac: `brew install ffmpeg`).
"""
import json, os, subprocess, sys, argparse

GOC = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.normpath(os.path.join(GOC, '..', '..', 'static'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ds', nargs='?', default='khoanh_khac_thanh_co_916')
    ap.add_argument('--hinh'); ap.add_argument('--ra'); ap.add_argument('--chi_am', action='store_true')
    a = ap.parse_args()
    cfg = json.load(open(os.path.join(GOC, a.ds.removesuffix('.json') + '.json'), encoding='utf-8'))
    ten, fps = cfg['ten'], cfg['khung']['fps']
    hinh = a.hinh or os.path.join(GOC, 'ket_qua', ten + '.h264')
    ra = a.ra or os.path.join(GOC, 'ket_qua', ten + '.mp4')
    sb = os.path.join(STATIC, 'khong-gian', cfg['sa_ban'])

    # mốc bắt đầu của từng khoảnh khắc (số khung làm tròn như bộ quay)
    ds = list(cfg['khoanh_khac']) + ([cfg['ket']] if cfg.get('ket') else [])
    moc, n = [], 0
    for m in ds:
        moc.append(n / fps); n += round(m['dai'] * fps)
    tong = n / fps

    vao, loc, nhan = [], [], []
    for m, t0 in zip(ds, moc):
        for ld in m.get('loi_dan', []):
            k = len(vao)
            vao += ['-i', os.path.join(sb, 'audio', 'voice', ld['tep'])]
            tre = int(round((t0 + ld['luc']) * 1000))
            loc.append(f"[{k}:a]atrim={ld['tu']}:{ld['den']},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                       f"afade=t=in:d=0.04,afade=t=out:st={max(0, ld['den'] - ld['tu'] - 0.08):.3f}:d=0.08,adelay={tre}|{tre}[v{k}]")
            nhan.append(f'[v{k}]')
    g = cfg.get('giong', {}); nh = cfg['nhac']
    km = len(vao)
    vao += ['-i', os.path.join(sb, nh['tep'])]
    loc.append(f"[{km}:a]atrim=start={nh['tu']}:duration={tong:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
               f"volume={nh.get('am_luong', 0.9)},afade=t=in:d={nh.get('vao', 0.4)},afade=t=out:st={max(0, tong - nh.get('ra', 2.5)):.3f}:d={nh.get('ra', 2.5)}[nhac]")
    if nhan:
        loc.append(f"{''.join(nhan)}amix=inputs={len(nhan)}:normalize=0,apad=whole_dur={tong:.3f},volume={g.get('am_luong', 1.0)},asplit=2[giong][sc]")
        # nhạc tự hạ khi có lời dẫn: ha_khi_doc ≈ mức còn lại (0,35 → hạ ~9 dB)
        ha = nh.get('ha_khi_doc', 0.35)
        loc.append(f"[nhac][sc]sidechaincompress=threshold=0.02:ratio={max(2, 1 / ha * 2):.1f}:attack=60:release=450:makeup=1[nhac2]")
        loc.append(f"[nhac2][giong]amix=inputs=2:normalize=0:duration=first[tron]")
    else:
        loc.append('[nhac]anull[tron]')
    loc.append(f"[tron]atrim=0:{tong:.3f},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[am]")

    am = os.path.join(GOC, 'ket_qua', ten + '_am.m4a')
    lenh = ['ffmpeg', '-y', '-v', 'error', *vao, '-filter_complex', ';'.join(loc), '-map', '[am]', '-c:a', 'aac', '-b:a', '192k', am]
    subprocess.run(lenh, check=True)
    print('âm thanh:', am, f'({tong:.2f} s)')
    if a.chi_am:
        return
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(fps), '-i', hinh, '-i', am,
                    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-shortest',
                    '-movflags', '+faststart', '-metadata', 'title=' + cfg.get('tieu_de', ten), ra], check=True)
    print('phim:', ra)


if __name__ == '__main__':
    main()
