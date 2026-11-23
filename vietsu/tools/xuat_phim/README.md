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
5. `khoanh_khac_thanh_co_916.json` — danh sách khoảnh khắc trailer dọc Thành cổ (góc máy, chữ, đoạn lời dẫn, nhạc).
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
Kết quả trong `vietsu/tools/xuat_phim/ket_qua/` (không đưa lên git): `<ten>.h264` (hình), `<ten>_m*.jpg` (ảnh giữa mỗi
khoảnh khắc), `<ten>_xuat.json` (thời gian xuất thật), `<ten>.mp4` (bản đăng).

Phim 16:9 4K: dùng `?w=3840&h=2160` với một danh sách khoảnh khắc ngang (bộ mã hoá tự chọn H.264 level 5.1, 60 Mbit/s).

## Lưu ý nội dung
- Nhãn "Tái dựng mô phỏng" luôn hiện. Chữ trên trailer **không ghi ngày tháng**: mốc thời gian của kịch bản vượt sông
  chưa chốt (xem `docs/TOM_TAT.md` mục 1).
- Bản quyền trước khi đăng: xem `docs/TOM_TAT.md` mục "Xuất phim" (nhạc nền, giọng đọc, dữ liệu OSM).
