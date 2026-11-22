# Việt Sử V5.4 — Mobile: thẻ trang phục gọn, nhãn "Tóc & Mũ", menu dưới một hàng

**Yêu cầu của chủ dự án (22/11/2026):**
1. Trên mobile, thẻ trang phục trong dòng thời gian bị vỡ bố cục: chữ bị ép thành cột một ký tự, không đọc được và chiếm nhiều chỗ.
2. Đổi "Hair & Hat" thành "Tóc & Mũ".
3. Menu dưới trên mobile nằm gọn một hàng, không xuống hàng.

## Cách làm
- Lớp mới `v54.css` / `v54.js`; `vietsu/tools/build_v54.py` chỉ chèn hai dòng vào HTML V5.3. Pages dựng bằng `build_v54.py`.
- Thẻ "Trang phục" và "Tóc & Mũ" (≤ 700 px): hai thẻ cạnh nhau, ảnh 38 px ở trên, tên ở dưới, mô tả tối đa 2 dòng (đầy đủ khi bấm mở). Màn hẹp ≤ 360 px cho tên xuống dòng.
- Nhãn "Tóc & Mũ" đổi bằng `v54.js` (áp dụng cả desktop), tự cập nhật khi dòng thời gian vẽ lại.
- Menu dưới: 6 mục (Dòng thời gian, Hồ Chí Minh, Nhân vật, Không gian, Bộ đề, Sách giáo khoa) chia đều trên một hàng.
- Desktop giữ nguyên bố cục.

## Đã kiểm tra (Chromium, bản dựng như Pages)
- 390 px và 320 px: thẻ trang phục đọc được, menu một hàng (6 nút cùng hàng). Desktop 1440 px không đổi bố cục, nhãn đã là "Tóc & Mũ". Không lỗi JavaScript.

## V5.4.1 — Thanh chọn năm nhanh trên mobile (22/11/2026)
- Theo yêu cầu chủ dự án: mobile hiện lại thanh mốc năm (2879 TCN … 1975) ở đầu dòng thời gian, dính đầu màn hình khi cuộn, vuốt ngang để chọn; bấm một mốc thì nhảy tới đúng mốc đó và mốc được tô sáng. Thêm vào cuối `v54.css`, không cần đổi bản dựng.
- Đã thử 390 px: bấm 1789 → mốc 1789 nằm ngay dưới thanh, không bị che.
