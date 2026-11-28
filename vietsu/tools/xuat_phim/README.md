# Xuất sa bàn ra phim (công cụ riêng, chạy trên Mac)

Công cụ **chỉ dùng trên máy anh Thắng** để dựng trailer/phim từ sa bàn. Không thuộc website: thư mục này nằm ngoài
`vietsu/static/` nên GitHub Pages không đăng, không thêm nút hay đường dẫn nào cho người xem. Không sửa mã sa bàn.

## Cách làm việc
1. `may_chu.py` — máy chủ tại máy (127.0.0.1:8765). Phục vụ sa bàn nguyên bản và trang quay `/quay/<sa-ban>/`:
   chèn `<base>` + `dong_ho_ao.js` vào đầu `<head>` (trong bộ nhớ, không ghi đè tệp). Nhận tệp kết quả qua `POST /xuat_phim/luu`.
2. `dong_ho_ao.js` — thay `performance.now`, `requestAnimationFrame`, `setTimeout` của trang bằng đồng hồ ảo:
   mỗi bước đúng 1/30 giây, nên khung hình đều nhau dù máy vẽ nhanh hay chậm. `Math.random` có hạt giống (`?hat=`)
   để mỗi lần xuất cảnh giống nhau. Khung vẽ cố định `?w=&h=` (tỉ lệ điểm ảnh 1).
3. `quay.js` — đọc danh sách khoảnh khắc, gọi `window.__STORY.goto()` tới đúng phân cảnh/giây, đặt máy quay dọc riêng
   (bám nhân vật qua `__QT.anchor`), ghép chữ + nhãn "Tái dựng mô phỏng" + logo, mã hoá H.264 bằng WebCodecs
   (card đồ hoạ của Mac), gửi `ket_qua/<ten>.h264` về máy chủ. Giao diện sa bàn không vào hình (chỉ lấy khung vẽ 3D).
4. `ghep_am_thanh.py` — dựng âm thanh bằng ffmpeg từ tệp gốc (đoạn lời dẫn `audio/voice/…`, nhạc nền), tự hạ nhạc khi
   có lời dẫn, chuẩn −14 LUFS, ghép với hình (không mã hoá lại) → `ket_qua/<ten>.mp4`.
5. `tai_nguyen/` — logo Việt Sử (tách nền từ bản phác thảo logo vietsu.com.vn, phương án 3): `logo-viet-su-chu.png`
   (chữ, góc trên phải), `logo-viet-su-cong.png` (cổng + chữ, khung kết). Thay bằng tệp logo gốc khi có.
6. `khoanh_khac_thanh_co_916.json` — danh sách khoảnh khắc trailer dọc Thành cổ (góc máy, chữ, đoạn lời dẫn, nhạc).
   Sửa tệp này rồi xuất lại. Giải thích từng trường ở `_ghi_chu` đầu tệp.

## Chạy
```bash
python3 vietsu/tools/xuat_phim/may_chu.py
```
Mở trong Chrome (máy Mac, dùng card đồ hoạ):
- Xem thử (1 ảnh/khoảnh khắc, nhanh): `http://127.0.0.1:8765/quay/thanh-co-quang-tri/?auto&w=1080&h=1920&hat=1972&che_do=xem_thu`
- Xuất cả trailer: `http://127.0.0.1:8765/quay/thanh-co-quang-tri/?auto&w=1080&h=1920&hat=1972&che_do=xuat`
- Chỉ vài khoảnh khắc: thêm `&chi=m2,m5` · danh sách khác: `&k=<tên tệp json>`

Góc dưới trái trang hiện tiến độ. Xong thì:
```bash
python3 vietsu/tools/xuat_phim/ghep_am_thanh.py khoanh_khac_thanh_co_916     # cần ffmpeg: brew install ffmpeg
```
(Máy Mac chưa có ffmpeg thì chạy lệnh này trong máy ảo Linux của Claude desktop — có sẵn ffmpeg 4.4.)

Lần đầu (23/11/2026, Mac M1, Chrome): xem thử 9 ảnh ~30 s; xuất 1575 khung 1080×1920 (gồm cả chạy trước) **57,5 s**,
H.264 High phần cứng (`avc1.640028`), 20 Mbit/s; ghép âm thanh ~9 s. Bản đăng 130 MB, 52,5 s, −13,8 LUFS.

Kết quả trong `vietsu/tools/xuat_phim/ket_qua/` (không đưa lên git): `<ten>.h264` (hình), `<ten>_m*.jpg` (ảnh giữa mỗi
khoảnh khắc), `<ten>_xuat.json` (thời gian xuất thật), `<ten>.mp4` (bản đăng).

Phim 16:9 4K: dùng `?w=3840&h=2160` với một danh sách khoảnh khắc ngang (bộ mã hoá tự chọn H.264 level 5.1, 60 Mbit/s).

## Bản B (`khoanh_khac_thanh_co_916_b.json`, 55 s)
Nhiều cảnh toàn, cảnh cận đặt máy sau lưng nhân vật nhìn về phía đạn, pháo nổ. `su_kien` dàn dựng tiếng nổ/pháo sáng
bằng chính API của sa bàn (`__QT.boomAt`, `__QT.flare`); `no_truoc: [cách, ngang]` đặt điểm nổ theo hướng máy quay.
`ghep_am_thanh.py` tự thêm `bom-no.mp3` đúng lúc nổ (trễ theo khoảng cách) và `sung-nen.mp3` theo `nen_sung`.
Nhạc Epidemic nằm ngoài repo (ổ xMABUx `_KHO-CHUNG/nhac-nen/`), truyền bằng `--nhac`:
```bash
python3 vietsu/tools/xuat_phim/ghep_am_thanh.py khoanh_khac_thanh_co_916_b --nhac "/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/_KHO-CHUNG/nhac-nen/ES_Final Battle - Max Anson.mp3"
```

## Phim đầy đủ 16:9 4K (`khoanh_khac_thanh_co_169_day_du.json`)
Sinh bằng `python3 vietsu/tools/xuat_phim/lap_phim_day_du.py` từ `data/episodes.json` (10 phân cảnh + khung kết, 16:55):
máy quay của bộ dẫn chuyện, phụ đề lời dẫn, thẻ tên phần, nhạc theo chương (Epidemic, `thu_muc_nhac`), nền súng theo
`audio.battle`, tiếng nổ dựng theo lúc nổ ghi lại khi quay. Hình ghi thành phần ~10 s (`tach_tep`), ghép bằng `concat:`.
```bash
# Chrome: /quay/thanh-co-quang-tri/?auto&w=3840&h=2160&hat=1972&che_do=xuat&k=khoanh_khac_thanh_co_169_day_du
python3 vietsu/tools/xuat_phim/ghep_am_thanh.py khoanh_khac_thanh_co_169_day_du --thu_muc_nhac "/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/_KHO-CHUNG/nhac-nen"
```
Lần đầu (24/11/2026, M1): dựng 30.450 khung 4K mất ~27 phút, ghép âm thanh ~2 phút; MP4 3,07 GB, 24 Mbit/s, −14,2 LUFS.
Ổ trong còn ít chỗ: đặt `KET_QUA=/Volumes/xMABUx/...` khi chạy `may_chu.py` và `ghep_am_thanh.py` để ghi thẳng ra SSD.
Lưu ý: sau khi nhường luồng (`await`), khung vẽ WebGL bị xoá → luôn vẽ khung rồi đọc ảnh ngay, không chen `await` giữa.

## Lưu ý nội dung
- Nhãn "Tái dựng mô phỏng" luôn hiện. Chữ trên trailer **không ghi ngày tháng**: mốc thời gian của kịch bản vượt sông
  chưa chốt (xem `docs/TOM_TAT.md` mục 1).
- Bản quyền trước khi đăng: xem `docs/TOM_TAT.md` mục "Xuất phim" (nhạc nền, giọng đọc, dữ liệu OSM).
- Lưu ý khi chỉnh: sau khi đổi vị trí máy quay đột ngột cần ≥ 2 khung mới thấy nhân vật (sa bàn cắt nhân vật ngoài khung
  nhìn theo máy của khung trước) — bộ quay đã chạy trước `chuan_bi` giây nên không ảnh hưởng.
- Hoa đăng ở phân cảnh 10 chỉ là đốm sáng mờ, quay cận không rõ → trailer dùng cảnh Thành cổ hôm nay.
