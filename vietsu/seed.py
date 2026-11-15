"""Tạo bốn không gian thử nghiệm và các đề cương học liệu làm bản nháp."""
import json
import sqlite3
from pathlib import Path
from main import db, slugify, now

BASE = Path(__file__).resolve().parent
with db() as con:
    for exp in json.loads((BASE / 'data/experiences_seed.json').read_text(encoding='utf-8')):
        d = exp.copy()
        d['hotspots'] = json.dumps(d['hotspots'], ensure_ascii=False)
        d['source_urls'] = json.dumps(d['source_urls'], ensure_ascii=False)
        con.execute('INSERT INTO experiences (' + ','.join(d) + ') VALUES (' + ','.join('?' for _ in d) +
                    ') ON CONFLICT(id) DO UPDATE SET ' + ','.join(f'{k}=excluded.{k}' for k in d if k!='id'),tuple(d.values()))

    # Các đề cương này KHÔNG được công bố, chỉ để tác nghiệp biên tập.
    articles = [
        ('1890–1911: Tuổi thơ Hồ Chí Minh tại Kim Liên',1890,'hcm:1890','Tìm hiểu thời niên thiếu ở Hoàng Trù và Kim Liên.',
         'Cần bổ sung thông tin học thuật về gia đình, quê quán, các địa điểm di tích; tách dữ kiện được chứng thực và tái dựng.\n\nĐề nghị trích dẫn tài liệu Hồ Chí Minh – Tiểu sử và tư liệu Khu Di tích Kim Liên.',
         ['https://baotanghochiminh.vn/khu-di-tich-kim-lien-xa-kim-lien-huyen-nam-dan-tinh-nghe-an.htm']),
        ('1911–1924: Hành trình tìm đường cứu nước',1911,'hcm:1911','Từ chuyến đi 1911 đến các hoạt động ở Pháp và Liên Xô.',
         'Đề cương: chuyến đi năm 1911; Bản yêu sách của nhân dân An Nam năm 1919; Đại hội Tours năm 1920; hoạt động đầu thập niên 1920.\n\nCác sự kiện chi tiết cần đối chiếu tiểu sử học thuật.',
         ['https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/book/ho-chi-minh/tieu-su-cuoc-doi-va-su-nghiep/ho-chi-minh-tieu-su-bao-tang-ho-chi-minh-nxb-chinh-tri-quoc-gia-ha-noi-nam-2008-20?categoryId=3000384']),
        ('1924–1941: Hoạt động cách mạng ở nước ngoài',1924,'hcm:1924','Hoạt động tại Quảng Châu và hội nghị năm 1930.',
         'Đề cương gồm các mốc 1924, 1925 và 1930. Các địa danh, tổ chức, vai trò cần rà soát nguồn.',
         ['https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/book/ho-chi-minh/tieu-su-cuoc-doi-va-su-nghiep/ho-chi-minh-tieu-su-bao-tang-ho-chi-minh-nxb-chinh-tri-quoc-gia-ha-noi-nam-2008-20?categoryId=3000384']),
        ('1941–1945: Từ Pác Bó đến Tuyên ngôn Độc lập',1941,'hcm:1941','Trở về Việt Nam và diễn biến Cách mạng Tháng Tám.',
         'Đề cương: Pác Bó, xây dựng lực lượng, Tổng khởi nghĩa, ngày 2/9/1945. Yêu cầu sơ đồ nhân vật và địa điểm.',
         ['https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/book/ho-chi-minh/tieu-su-cuoc-doi-va-su-nghiep/ho-chi-minh-tieu-su-bao-tang-ho-chi-minh-nxb-chinh-tri-quoc-gia-ha-noi-nam-2008-20?categoryId=3000384']),
        ('1945–1954: Lãnh đạo đất nước và kháng chiến',1945,'hcm:1945','Các sự kiện lớn từ năm 1945 đến Hiệp định Genève.',
         'Đề cương: Tuyên ngôn Độc lập, kháng chiến chống Pháp, Điện Biên Phủ và Hiệp định Genève.',
         ['https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/book/ho-chi-minh/tieu-su-cuoc-doi-va-su-nghiep/ho-chi-minh-tieu-su-bao-tang-ho-chi-minh-nxb-chinh-tri-quoc-gia-ha-noi-nam-2008-20?categoryId=3000384']),
        ('1954–1969: Hoạt động cuối đời Chủ tịch Hồ Chí Minh',1954,'hcm:1954','Bối cảnh chính trị và hoạt động thời kỳ 1954–1969.',
         'Đề cương: xây dựng miền Bắc, đấu tranh thống nhất, hoạt động đối ngoại và những tư liệu cuối đời.',
         ['https://tulieuvankien.dangcongsan.vn/c-mac-angghen-lenin-ho-chi-minh/book/ho-chi-minh/tieu-su-cuoc-doi-va-su-nghiep/ho-chi-minh-tieu-su-bao-tang-ho-chi-minh-nxb-chinh-tri-quoc-gia-ha-noi-nam-2008-20?categoryId=3000384']),
        ('Di sản Hồ Chí Minh sau năm 1969',1969,'hcm:1969','Bảo tồn di tích và hoạt động nghiên cứu, giáo dục.',
         'Đề cương: bảo tồn Khu Di tích Kim Liên, bảo tàng và mạng lưới di tích; cách giới thiệu hiện vật một cách có nguồn.',
         ['https://baotanghochiminh.vn/le-ky-niem-70-nam-bao-ton-va-phat-huy-gia-tri-khu-di-tich-kim-lien-1956-2026.htm']),
        ('Nhà Trần: ba cuộc kháng chiến chống Mông – Nguyên',1288,'tran','Một bài tổng quan dùng cho bản đồ chiến trận và trắc nghiệm.',
         'Đề cương: bối cảnh nhà Trần, năm 1258, 1285, 1287–1288, vai trò Trần Hưng Đạo, Trần Nhân Tông, tác động của đế quốc Mông Cổ.',[]),
        ('Tây Sơn và trận Rạch Gầm – Xoài Mút 1785',1785,'tayson','Một bài mẫu liên kết sa bàn và nhân vật Nguyễn Huệ.',
         'Đề cương: phong trào Tây Sơn, lực lượng tham chiến, điều kiện sông nước, kết quả và ý nghĩa. Cần khảo cứu địa hình trước khi xây sa bàn.',[]),
    ]
    for title,year,eid,intro,body,sources in articles:
        slug=slugify(title)
        con.execute('''INSERT OR IGNORE INTO articles (slug,title,intro,body,seo_title,meta_description,focus_keyword,category,timeline_year,entity_id,source_urls,tags,status,created_at,updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                    (slug,title,intro,body,title,intro[:180],title,'Lịch sử',year,eid,json.dumps(sources,ensure_ascii=False),'["Đề cương", "Cần thẩm định"]','draft',now(),now()))
print('Đã tạo nội dung nháp. Không có bài nào được tự công bố.')
