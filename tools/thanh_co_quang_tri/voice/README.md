# Căn lại voice Thành cổ Quảng Trị (23/11/2026)

- Nguồn: `thanhcoquangtri/thanhcoquangtri_Recorded/thanh-co-quang-tri-thu-am.mp3` (639 s).
- `asr.py`: nhận dạng tiếng Việt (sherpa-onnx, mô hình zipformer-vi-int8-2025-04-20) lấy mốc từng từ.
- `can.py`: so chuỗi từ nhận dạng với phụ đề trong `data/episodes.json`, tìm chỗ lặng giữa hai câu để cắt, giữ 0,2 s trước tiếng đầu và 0,55 s sau tiếng cuối.
- `cut.json`: mốc cắt [a, b] (giây trong bản thu) của 61 câu. Cắt lại: `ffmpeg -ss a -t (b-a) -i ... -ac 1 -b:a 80k audio/voice/<id>-<nn>.mp3`.
- Lỗi cũ: chương 1, 2 và một số câu chương 6, 10 bị cắt lệch (đuôi câu trước nằm ở đầu tệp câu sau).

## V2.1 (23/11/2026, chiều)
- Nguồn mới: `Voice-ThanhCoQuangTri-Final.mp3` (cùng lượt đọc, đã xử lý âm lượng −13,6 LUFS).
- `can2.py`: như `can.py` nhưng chỗ cắt được dời vào giữa khoảng lặng thật đo bằng năng lượng (mốc từ của nhận dạng lệch 0,3–1 s ở chỗ đọc liền), giữ ≥ 0,25 s sau tiếng cuối (đuôi câu không còn bị cụt), 0,3 s trước tiếng đầu. Kết quả: `cut2.json`. Mã hoá 96 kbps mono.
