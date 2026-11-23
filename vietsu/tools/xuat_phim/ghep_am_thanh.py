#!/usr/bin/env python3
"""Dựng âm thanh bằng ffmpeg từ tệp gốc của sa bàn và ghép với hình đã xuất → MP4 (H.264 + AAC) để đăng.

Dùng:  python3 vietsu/tools/xuat_phim/ghep_am_thanh.py [khoanh_khac_thanh_co_916] [--hinh ket_qua/thanh_co_916.h264] [--ra ket_qua/thanh_co_916.mp4]

- Giọng đọc: các đoạn cắt từ audio/voice/<tệp> (khai báo `loi_dan` trong danh sách khoảnh khắc), đặt đúng giây.
- Nhạc nền: tệp `nhac.tep` của sa bàn, từ giây `nhac.tu`, tự hạ khi có lời dẫn (sidechain), hiện/lặng dần đầu–cuối.
- Tiếng động (tệp gốc trong audio/ của sa bàn): mỗi tiếng nổ dàn dựng (`su_kien` có `no`) thêm một `bom-no.mp3`
  đúng giây; khoảnh khắc có `nen_sung` (0–1) thêm một đoạn `sung-nen.mp3` làm nền giao tranh. Cùng nhạc, tự hạ khi có lời dẫn.
- Nhạc nằm ngoài repo (vd. Epidemic Sound trên ổ ngoài): `nhac.tep` là đường dẫn tuyệt đối, hoặc truyền `--nhac <tệp>`.
- Chuẩn âm lượng −14 LUFS (mức YouTube), AAC 192 kbps 48 kHz. Hình giữ nguyên (không mã hoá lại).
Cần ffmpeg (Mac: `brew install ffmpeg`).
"""
import json, os, subprocess, sys, argparse

GOC = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.normpath(os.path.join(GOC, '..', '..', 'static'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ds', nargs='?', default='khoanh_khac_thanh_co_916')
    ap.add_argument('--hinh'); ap.add_argument('--ra'); ap.add_argument('--nhac'); ap.add_argument('--chi_am', action='store_true')
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
            k = len(vao) // 2
            vao += ['-i', os.path.join(sb, 'audio', 'voice', ld['tep'])]
            tre = int(round((t0 + ld['luc']) * 1000))
            loc.append(f"[{k}:a]atrim={ld['tu']}:{ld['den']},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                       f"afade=t=in:d=0.04,afade=t=out:st={max(0, ld['den'] - ld['tu'] - 0.08):.3f}:d=0.08,adelay={tre}|{tre}[v{k}]")
            nhan.append(f'[v{k}]')
    # tiếng động: nổ dàn dựng + nền súng
    hu = cfg.get('hieu_ung', {}); dong = []
    for j, (m, t0) in enumerate(zip(ds, moc)):
        for e in m.get('su_kien', []):
            if not (e.get('no') or e.get('no_truoc')):
                continue
            cach = e['no_truoc'][0] if e.get('no_truoc') else 120   # tiếng đến trễ theo khoảng cách (340 m/s)
            k = len(vao) // 2; vao += ['-i', os.path.join(sb, 'audio', hu.get('tep_no', 'bom-no.mp3'))]
            tre = int(round((t0 + e['luc'] + e.get('tre_tieng', cach / 340)) * 1000))
            vl = hu.get('no', 0.55) * (1.0 if e.get('lon', bool(e.get('no_truoc'))) else 0.7) * min(1.3, max(0.35, 60 / cach)) * e.get('am_luong', 1)
            loc.append(f"[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={vl:.3f},adelay={tre}|{tre}[d{k}]"); dong.append(f'[d{k}]')
        if m.get('nen_sung'):
            k = len(vao) // 2; vao += ['-i', os.path.join(sb, 'audio', hu.get('tep_nen', 'sung-nen.mp3'))]
            st = (j * 13.7) % 90; tre = int(round(t0 * 1000)); d = m['dai']
            loc.append(f"[{k}:a]atrim=start={st:.2f}:duration={d:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                       f"volume={hu.get('nen', 0.5) * m['nen_sung']:.3f},afade=t=in:d=0.15,afade=t=out:st={max(0, d - 0.2):.3f}:d=0.2,adelay={tre}|{tre}[d{k}]"); dong.append(f'[d{k}]')
    g = cfg.get('giong', {}); nh = cfg['nhac']
    km = len(vao) // 2
    tep_nhac = os.path.abspath(a.nhac) if a.nhac else os.path.expanduser(nh['tep'])
    vao += ['-i', tep_nhac if os.path.isabs(tep_nhac) else os.path.join(sb, tep_nhac)]
    loc.append(f"[{km}:a]atrim=start={nh['tu']}:duration={tong:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
               f"volume={nh.get('am_luong', 0.9)},afade=t=in:d={nh.get('vao', 0.4)},afade=t=out:st={max(0, tong - nh.get('ra', 2.5)):.3f}:d={nh.get('ra', 2.5)}[nhac0]")
    if dong:
        loc.append(f"{''.join(dong)}amix=inputs={len(dong)}:normalize=0,apad=whole_dur={tong:.3f}[dong]")
        loc.append("[nhac0][dong]amix=inputs=2:normalize=0:duration=first[nhac]")
    else:
        loc.append('[nhac0]anull[nhac]')
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
