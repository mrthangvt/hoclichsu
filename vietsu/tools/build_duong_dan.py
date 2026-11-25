#!/usr/bin/env python3
"""Dựng trang chia sẻ cho từng đường dẫn của Học Lịch Sử (chạy trong pages.yml, sau khi gom _site/).

    SITE_URL=https://hoclichsu.com python3 vietsu/tools/build_duong_dan.py _site

Với mỗi mục trong vietsu/data/duong_dan.json:
  _site/<duong>/index.html : tiêu đề, mô tả, thẻ Open Graph/Twitter + ảnh riêng, rồi chuyển ngay về
                             trang chủ ?p=<duong> (static/v59-duong-dan.js mở đúng mục, giữ địa chỉ rõ ràng).
  _site/static/og/<ten>.jpg: ảnh chia sẻ 1200×630 có tên bài, nhóm, logo Học Lịch Sử.
Thêm ảnh chia sẻ mặc định cho trang chủ, 404.html (đường dẫn lạ vẫn mở được trang), sitemap.xml.
Cần Pillow (pip install pillow).
"""
import hashlib, html, json, os, pathlib, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

GOC = pathlib.Path(__file__).resolve().parents[1]
SITE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "_site")
URL = os.environ.get("SITE_URL", "https://mrthangvt.github.io/hoclichsu").rstrip("/")
TEN_WEB = "Học Lịch Sử"
MO_TA_WEB = ("Dòng thời gian lịch sử Việt Nam và thế giới: triều đại, nhân vật, sự kiện, cuộc đời Chủ tịch "
             "Hồ Chí Minh, sách giáo khoa Lịch sử lớp 6–12 và không gian lịch sử 3D.")
F = GOC / "tools" / "fonts"
W, H = 1200, 630
NEN, VANG, CHU, MO = (24, 33, 40), (214, 172, 92), (246, 240, 228), (176, 184, 186)


def font(kieu, co):
    return ImageFont.truetype(str(F / f"BeVietnamPro-{kieu}.ttf"), co)


def xuong_dong(d, chu, f, rong, toi_da):
    tu, dong, cur = chu.split(), [], ""
    for t in tu:
        thu = (cur + " " + t).strip()
        if d.textlength(thu, font=f) <= rong:
            cur = thu
        else:
            if cur: dong.append(cur)
            cur = t
    if cur: dong.append(cur)
    if len(dong) > toi_da:
        dong = dong[:toi_da]
        while d.textlength(dong[-1] + "…", font=f) > rong and " " in dong[-1]:
            dong[-1] = dong[-1].rsplit(" ", 1)[0]
        dong[-1] += "…"
    return dong


_logo = None
def logo(rong):
    global _logo
    if _logo is None:
        _logo = Image.open(GOC / "static" / "v53" / "logo-toi.webp").convert("RGBA")
    h = round(_logo.height * rong / _logo.width)
    return _logo.resize((rong, h), Image.LANCZOS)


def nen():
    im = Image.new("RGB", (W, H), NEN)
    g = Image.new("L", (W, H), 0)
    ImageDraw.Draw(g).ellipse((-300, -380, 900, 520), fill=70)
    g = g.filter(ImageFilter.GaussianBlur(160))
    im.paste(Image.new("RGB", (W, H), (58, 70, 74)), (0, 0), g)
    d = ImageDraw.Draw(im)
    d.rectangle((0, H - 10, W, H), fill=VANG)
    return im


def the(muc):
    im = nen()
    d = ImageDraw.Draw(im)
    rong = 1040
    anh = muc.get("anh")
    if anh and (GOC / anh).exists():
        a = Image.open(GOC / anh).convert("RGB")
        ar, ah = 440, H - 10
        s = max(ar / a.width, ah / a.height)
        a = a.resize((round(a.width * s), round(a.height * s)), Image.LANCZOS)
        a = a.crop(((a.width - ar) // 2, (a.height - ah) // 2, (a.width - ar) // 2 + ar, (a.height - ah) // 2 + ah))
        m = Image.linear_gradient("L").rotate(90).resize((ar, ah))  # trái tối → phải sáng
        m = m.point(lambda v: min(255, v * 2))
        im.paste(a, (W - ar, 0), m)
        rong = 640
    x, y = 80, 70
    nhan = (muc.get("nhan") or "").upper()
    if nhan:
        d.text((x, y), nhan, font=font("SemiBold", 26), fill=VANG)
        y += 56
    ten = muc["ten"]
    for co, toi in ((68, 3), (58, 3), (50, 4)):
        f = font("Bold", co)
        dong = xuong_dong(d, ten, f, rong, toi)
        if not dong[-1].endswith("…") or co == 50:
            break
    for t in dong:
        d.text((x, y), t, font=f, fill=CHU)
        y += round(co * 1.22)
    phu = muc.get("phu") or ""
    if phu:
        y += 14
        for t in xuong_dong(d, phu, font("Regular", 30), rong, 2):
            d.text((x, y), t, font=font("Regular", 30), fill=MO)
            y += 40
    lg = logo(230)
    im.paste(lg, (x, H - 10 - 40 - lg.height), lg)
    return im


def the_web():
    im = nen()
    lg = logo(560)
    im.paste(lg, ((W - lg.width) // 2, 120), lg)
    d = ImageDraw.Draw(im)
    f = font("Regular", 32)
    t = "Dòng thời gian lịch sử Việt Nam và thế giới"
    d.text(((W - d.textlength(t, font=f)) // 2, 130 + lg.height + 40), t, font=f, fill=MO)
    return im


def the_meta(tieu_de, mo_ta, url, anh):
    e = lambda s: html.escape(s, quote=True)
    return (f'<title>{e(tieu_de)}</title><meta name="description" content="{e(mo_ta)}">'
            f'<link rel="canonical" href="{e(url)}">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="{TEN_WEB}">'
            f'<meta property="og:locale" content="vi_VN">'
            f'<meta property="og:title" content="{e(tieu_de)}"><meta property="og:description" content="{e(mo_ta)}">'
            f'<meta property="og:url" content="{e(url)}"><meta property="og:image" content="{e(anh)}">'
            f'<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(tieu_de)}">'
            f'<meta name="twitter:description" content="{e(mo_ta)}"><meta name="twitter:image" content="{e(anh)}">')


def trang_trung_gian(duong, meta):
    ve = "../" * duong.count("/")
    p = json.dumps(duong)
    return ('<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">' + meta +
            f'<link rel="icon" href="{ve}favicon.ico">'
            f'<script>location.replace("{ve}?p="+encodeURIComponent({p})+location.hash)</script>'
            '<style>body{background:#18212a;color:#f6f0e4;font:16px system-ui;display:grid;place-items:center;height:100vh;margin:0}a{color:#d6ac5c}</style>'
            f'</head><body><p>Đang mở… <a href="{ve}?p={html.escape(duong)}">bấm vào đây nếu trang không tự chuyển</a></p></body></html>')


def main():
    ds = json.loads((GOC / "data" / "duong_dan.json").read_text(encoding="utf-8"))["duong_dan"]
    og = SITE / "static" / "og"
    og.mkdir(parents=True, exist_ok=True)
    the_web().save(og / "hoc-lich-su.jpg", quality=86, optimize=True)
    anh_web = f"{URL}/static/og/hoc-lich-su.jpg"
    for muc in ds:
        duong = muc["duong"]
        ma = hashlib.sha1(duong.encode()).hexdigest()[:10]
        ten_anh = duong.strip("/").replace("/", "--")[:90] + "-" + ma[:4] + ".jpg"
        the(muc).save(og / ten_anh, quality=84, optimize=True)
        tieu_de = f'{muc["ten"]} – {TEN_WEB}'
        mo_ta = muc.get("mo_ta") or (f'{muc["ten"]} trên {TEN_WEB}: ' + MO_TA_WEB)
        meta = the_meta(tieu_de, mo_ta, f"{URL}/{duong}", f"{URL}/static/og/{ten_anh}")
        ra = SITE / duong / "index.html"
        ra.parent.mkdir(parents=True, exist_ok=True)
        ra.write_text(trang_trung_gian(duong, meta), encoding="utf-8")
    # Trang chủ: thẻ chia sẻ mặc định.
    chu = SITE / "index.html"
    s = chu.read_text(encoding="utf-8")
    i = s.find("<title>"); j = s.find("</title>", i) + len("</title>")
    tieu_de = html.unescape(s[i + 7:j - 8])
    import re
    s = re.sub(r'<meta name="description"[^>]*>', "", s, count=1)
    i = s.find("<title>"); j = s.find("</title>", i) + len("</title>")
    s = s[:j] + the_meta(tieu_de, MO_TA_WEB, URL + "/", anh_web).replace(f"<title>{html.escape(tieu_de)}</title>", "", 1) + s[j:]
    chu.write_text(s, encoding="utf-8")
    # Địa chỉ lạ: chuyển về trang chủ ?p=… (router tự bỏ qua nếu không khớp).
    (SITE / "404.html").write_text(
        '<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Học Lịch Sử</title><script>'
        '(function(){var p=location.pathname,m=p.match(/^(.*?\\/)(dong-thoi-gian-su-viet|chu-tich-ho-chi-minh|nhan-vat-lich-su|'
        'khong-gian-lich-su|sach-giao-khoa-lich-su|bo-de-on-su|su-kien)(\\/.*|$)/);'
        'if(m)location.replace(m[1]+"?p="+encodeURIComponent(m[2]+(m[3]||"/")));'
        'else{var g=p.split("/").filter(Boolean);location.replace((location.hostname.endsWith("github.io")&&g.length?"/"+g[0]+"/":"/"));}'
        '})()</script></head><body></body></html>', encoding="utf-8")
    (SITE / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + f"<url><loc>{URL}/</loc></url>\n"
        + "".join(f"<url><loc>{html.escape(URL + '/' + m['duong'])}</loc></url>\n" for m in ds)
        + "</urlset>\n", encoding="utf-8")
    print(f"Trang chia sẻ: {len(ds)} đường dẫn + ảnh 1200×630 trong {og} (SITE_URL={URL})")


if __name__ == "__main__":
    main()
