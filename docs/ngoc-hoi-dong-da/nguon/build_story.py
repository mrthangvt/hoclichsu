import json
S = json.load(open('scenes_parsed.json'))
A = lambda name, d, az, el, off=(0, 0): dict(at=name, off=list(off), d=d, az=az, el=el)
L = lambda lat, lon, d, az, el: dict(ll=[lat, lon], d=d, az=az, el=el)
EXTRA = {
 "C01": dict(date="Cuối năm Mậu Thân 1788", state="none", night=0.0, keys=[
   (0, L(21.00, 105.845, 14000, 190, 38)), (14, A("ThangLong_PhoCho", 700, 200, 14)), (28, A("ThangLong_PhoCho", 900, 240, 18, (-400, 300))),
   (42, A("ThangLong_HoangThanh", 5000, 170, 40)), (55, A("TayLong", 900, 120, 25))]),
 "C02": dict(date="Cuối năm Mậu Thân 1788", state="thanh", night=0.0, keys=[
   (0, A("TayLong", 900, 120, 25)), (16, A("TayLong", 1600, 60, 30)), (27, L(20.965, 105.835, 16000, 180, 55)),
   (43, L(20.965, 105.835, 16000, 200, 62)), (50, A("CauPhao_SongHong", 1100, 150, 28)), (65, A("CauPhao_SongHong", 1100, 210, 28))]),
 "C03": dict(date="Phú Xuân · cuối năm Mậu Thân", state="hanhquan", night=0.0, outside="Phú Xuân (Huế) ở ngoài khung sa bàn — camera nhìn về phương Nam.", keys=[
   (0, L(20.90, 105.85, 18000, 0, 35)), (30, L(20.862, 105.866, 4000, 5, 12)), (65, L(20.860, 105.866, 2500, 350, 8))]),
 "C04": dict(date="Hành quân ra Bắc", state="hanhquan", night=0.2, outside="Đường hành quân Phú Xuân – Nghệ An – Thanh Hóa – Tam Điệp ở ngoài khung; mũi tên đỏ là hướng tiến vào khung sa bàn.", keys=[
   (0, L(20.858, 105.866, 1500, 180, 12)), (25, L(20.88, 105.858, 1200, 200, 10)), (50, L(20.86, 105.866, 6000, 180, 25)),
   (75, L(20.90, 105.85, 9000, 170, 35)), (95, L(20.95, 105.84, 22000, 180, 50))]),
 "C05": dict(date="Tam Điệp – Biện Sơn", state="kehoach", night=0.0, outside="Tam Điệp – Biện Sơn ở ngoài khung; sa bàn hiện các hướng tiến công trong kế hoạch.", keys=[
   (0, L(20.96, 105.83, 22000, 180, 60)), (32, L(20.96, 105.82, 20000, 200, 70)), (65, L(20.93, 105.83, 12000, 180, 45))]),
 "C06": dict(date="Đêm giao thừa Tết Kỷ Dậu", state="hahoi", night=1.0, outside="Gián Khẩu, Nguyệt Quyết, Nhật Tảo ở ngoài khung (phía Nam).", keys=[
   (0, L(20.858, 105.866, 900, 190, 8)), (32, L(20.87, 105.861, 700, 180, 10)), (65, L(20.89, 105.855, 1400, 185, 12))]),
 "C07": dict(date="Nửa đêm mùng 3 Tết Kỷ Dậu", state="hahoi", night=1.0, outside="Đồn Hà Hồi cách mép nam sa bàn khoảng 1,8 km.", keys=[
   (0, A("HaHoi", 2500, 10, 25)), (25, A("HaHoi", 1500, 60, 20)), (65, L(20.875, 105.861, 3000, 190, 25))]),
 "C08": dict(date="Trước bình minh mùng 5 Tết", state="ngochoi", night=0.45, keys=[
   (0, A("NgocHoi_Don", 1300, 200, 32)), (14, A("NgocHoi_Don", 120, 200, 20, (0, -230))), (28, A("NgocHoi_Don", 160, 180, 10, (0, -420))),
   (55, A("NgocHoi_Don", 700, 185, 30, (0, -450)))]),
 "C09": dict(date="Mờ sáng mùng 5 Tết Kỷ Dậu", state="ngochoi", night=0.25, keys=[
   (0, A("NgocHoi_Don", 150, 190, 6, (0, -650))), (19, A("NgocHoi_Don", 400, 270, 12, (-250, -500))), (38, A("NgocHoi_Don", 500, 140, 25, (0, -450))),
   (57, A("NgocHoi_Don", 250, 220, 15, (0, -350))), (76, A("NgocHoi_Don", 1200, 200, 45, (0, -400))), (95, A("NgocHoi_Don", 900, 160, 40, (0, -350)))]),
 "C10": dict(date="Sáng mùng 5 Tết Kỷ Dậu", state="ngochoi", night=0.15, keys=[
   (0, A("NgocHoi_Don", 70, 180, 12, (0, -330))), (21, A("NgocHoi_Don", 160, 0, 8, (0, -300))), (42, A("NgocHoi_Don", 600, 180, 75, (0, -300))),
   (63, A("NgocHoi_Don", 60, 185, 6, (0, -280))), (84, A("NgocHoi_Don", 220, 270, 10, (-150, -260))), (105, A("NgocHoi_Don", 300, 200, 30, (0, -200))),
   (125, A("NgocHoi_Don", 900, 190, 45, (0, -150)))]),
 "C11": dict(date="Mùng 5 Tết Kỷ Dậu", state="dammuc", night=0.0, keys=[
   (0, A("DamMuc", 2600, 170, 32)), (14, L(20.92, 105.83, 9000, 180, 60)), (28, A("DamMuc", 900, 120, 15, (200, 0))), (55, A("DamMuc", 3500, 200, 40))]),
 "C12": dict(date="Rạng đông mùng 5 Tết Kỷ Dậu", state="dongda", night=0.7, night_end=0.0, keys=[
   (0, L(20.965, 105.835, 21000, 180, 65)), (18, A("NhanMuc", 1200, 250, 18)), (36, A("ToLich_BenVuot", 800, 220, 12)), (54, A("KhuongThuong", 1400, 210, 22)),
   (72, A("LoaSon_DongDa", 600, 160, 25)), (90, A("LoaSon_DongDa", 600, 260, 25)), (105, L(21.02, 105.832, 3000, 200, 25))]),
 "C13": dict(date="Mùng 5 Tết Kỷ Dậu (1789)", state="thanglong", night=0.0, keys=[
   (0, A("ThangLong_HoangThanh", 5500, 170, 55)), (18, A("CauPhao_SongHong", 1400, 200, 22)), (36, A("O_CauDen", 500, 190, 12)),
   (54, A("ThangLong_HoangThanh", 900, 190, 25)), (70, A("ThangLong_HoangThanh", 3000, 180, 40))]),
 "C14": dict(date="Mùa xuân Kỷ Dậu 1789", state="all", night=0.0, keys=[
   (0, L(20.93, 105.845, 9000, 180, 30)), (21, L(20.97, 105.84, 12000, 190, 35)), (42, L(21.00, 105.83, 9000, 200, 30)),
   (63, A("ThangLong_HoangThanh", 20000, 180, 70)), (85, L(20.966, 105.835, 32000, 180, 80))]),
}
SIM = {
 "_all": ["Địa hình là sơ đồ tương đối: không có bản đồ cao độ năm 1789; sông, đê, làng đặt theo vị trí tương đối.",
          "Nhà cửa, đồn trại, lều, cây là hình khối tạm, chờ thay mô hình chi tiết.",
          "Hồ Tây, Hồ Gươm, hồ Linh Đàm lấy hình dạng hiện nay làm mốc nhận diện."],
 "C02": ["Vị trí đóng quân Thanh tại Thăng Long, Ngọc Hồi, Khương Thượng hiển thị bằng mốc; quy mô từng đồn là giả định."],
 "C03": ["Lễ lên ngôi ở núi Bân (Phú Xuân) chưa dựng trên sa bàn này."],
 "C05": ["Mũi tên hướng tiến công là quy ước đồ họa theo bản đồ diễn biến, không phải lộ trình chính xác."],
 "C08": ["Đồn Ngọc Hồi: lũy đất 4,5 m, hào khô, dải chông là kích thước giả định tạo hình."],
 "C10": ["Hai mươi tấm mộc ghép ván bọc rơm ướt theo mô tả trong Hoàng Lê nhất thống chí; mô hình mộc và đội hình chưa dựng."],
 "C12": ["Người chỉ huy mũi Đống Đa còn có cách ghi khác nhau (Đô đốc Long / Đặng Tiến Đông).", "Chi tiết hàng rào lửa là truyền thuật, chưa dựng."],
 "C13": ["Cầu phao trên sông Hồng hiển thị bằng mốc; vị trí chính xác cần thẩm định."],
}
for s in S:
    e = EXTRA[s["id"]]
    s.update({k: v for k, v in e.items() if k != "keys"})
    s["keys"] = [dict(t=t, **k) for t, k in e["keys"]]
    s["simulated"] = SIM.get(s["id"], []) + SIM["_all"]
REFS = [
 ["Tạp chí Quốc phòng toàn dân — nghệ thuật tổ chức lực lượng", "https://tapchiqptd.vn/Sites/newsDeail.aspx?catetitle=nghien-cuu-trao-doi&cul=vi&newsid=4939&newstitle=nghe-thuat-to-chuc-luc-luong-trong-tran-quyet-chien-chien-luoc-ngoc-hoi-dong-da-nam-1789"],
 ["Công viên văn hóa Đống Đa — sa bàn và diễn biến", "https://godongda.vn/exhibition/sa-ban-tran-chien-ngoc-hoi-dong-da"],
 ["Bảo tàng Lịch sử TP.HCM — hậu cần và hỏa khí", "https://www.baotanglichsutphcm.com.vn/ban-tin/cong-tac-bao-dam-hau-can-tran-ngoc-hoi-dong-da-tet-ky-dau-1789"],
 ["ĐH KHXH&NV — nghiên cứu Đặng Tiến Đông", "https://his.ussh.vnu.edu.vn/vi/news/le-huu-quan/do-doc-dang-tien-dong-mot-tuong-tay-son-chi-huy-tran-dong-da-gs-phan-huy-le-5674.html"],
 ["Nghiên cứu lịch sử — so sánh Hoàng Lê nhất thống chí và Cương mục", "https://nghiencuulichsu.com/2016/09/12/chien-thuat-ha-thanh-ngoc-hoi-cua-quan-tay-son/"],
 ["Viện Sử học — Ngọc Hồi, Đống Đa, Khương Thượng", "https://viensuhoc.vass.gov.vn/bao-ve-nen-tang-tu-tuong-cua-dang/chien-thang-ngoc-hoi-mua-xuan-nam-ky-dau-1789-dau-an-lich-su-va-van-hoa-560605"],
]
# mũi tên theo bản đồ diễn biến (lat, lon); red = Tây Sơn, blue = quân Thanh rút
ARROWS = {
 "ts_main": dict(c="red", w=260, pts=[[20.855, 105.867], [20.885, 105.857], [20.912, 105.848]]),
 "ts_main2": dict(c="red", w=260, pts=[[20.928, 105.845], [20.965, 105.843], [20.995, 105.849], [21.018, 105.846], [21.030, 105.842]]),
 "ts_bao": dict(c="red", w=230, pts=[[20.866, 105.758], [20.885, 105.785], [20.902, 105.808], [20.918, 105.814]]),
 "ts_bao2": dict(c="red", w=170, pts=[[20.912, 105.832], [20.925, 105.828], [20.932, 105.822]]),
 "ts_long": dict(c="red", w=240, pts=[[20.962, 105.758], [20.985, 105.785], [20.999, 105.806], [21.004, 105.818]]),
 "ts_long2": dict(c="red", w=200, pts=[[21.010, 105.826], [21.020, 105.832], [21.030, 105.836]]),
 "th_dammuc": dict(c="blue", w=150, pts=[[20.918, 105.842], [20.924, 105.830], [20.929, 105.819]]),
 "th_song": dict(c="blue", w=180, pts=[[21.032, 105.846], [21.031, 105.858], [21.036, 105.872], [21.046, 105.884]]),
 "th_song2": dict(c="blue", w=150, pts=[[21.022, 105.852], [21.020, 105.866], [21.027, 105.884]]),
}
STATES = {"none": [], "thanh": [], "hanhquan": ["ts_main"], "kehoach": ["ts_main", "ts_main2", "ts_bao", "ts_long", "ts_long2"],
          "hahoi": ["ts_main"], "ngochoi": ["ts_main"], "dammuc": ["ts_main", "ts_bao", "ts_bao2", "th_dammuc"],
          "dongda": ["ts_main", "ts_long", "ts_long2"], "thanglong": ["ts_main2", "ts_long2", "th_song", "th_song2"],
          "all": ["ts_main", "ts_main2", "ts_bao", "ts_bao2", "ts_long", "ts_long2", "th_dammuc", "th_song", "th_song2"]}
LEG = {"none": "Sông Hồng · kinh thành Thăng Long", "thanh": "Mốc xanh: các vị trí quân Thanh đóng giữ (minh hoạ)",
       "hanhquan": "Mũi đỏ: hướng hành quân của Tây Sơn tiến vào khung sa bàn",
       "kehoach": "Mũi đỏ: các hướng tiến công trong kế hoạch (quy ước đồ hoạ)",
       "hahoi": "Mũi đỏ: đạo chủ lực hướng Hà Hồi – Ngọc Hồi", "ngochoi": "Mũi đỏ: đạo chủ lực đánh Ngọc Hồi",
       "dammuc": "Đỏ: Tây Sơn đón lõng ở Đầm Mực · Xanh: quân Thanh rút chạy",
       "dongda": "Đỏ: mũi Đống Đa (Nhân Mục – Khương Thượng) đánh song song với Ngọc Hồi",
       "thanglong": "Đỏ: các mũi tiến vào Thăng Long · Xanh: quân Thanh rút qua sông Hồng",
       "all": "Toàn bộ thế trận mùa Xuân Kỷ Dậu (quy ước đồ hoạ)"}
json.dump(dict(scenes=S, refs=REFS, arrows=ARROWS, states=STATES, legend=LEG), open('../web/story.json', 'w'), ensure_ascii=False)
print("ok", sum(s['dur'] for s in S))
