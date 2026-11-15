#!/usr/bin/env python3
"""Việt Sử V3.9 — đóng gói giao diện.

Đầu vào (thư mục frontend/):
  Viet_Su_Timeline_base_V3.7.html   giao diện gốc (một file, đã nhúng ảnh base64)
  v38-early.js, v38.css, v38.js     lớp vá V3.8 (font, chống tràn, CMS SGK, quảng cáo)

Đầu ra:
  static/build/index.html            bản ONLINE (máy chủ phục vụ ở "/"): ảnh tách thành file,
                                     JS lớn tách file có băm tên → trình duyệt cache lâu dài.
  static/build/media/*, js/*         tài nguyên đã băm
  static/fonts/be-vietnam-pro.css    khai báo font tự host
  static/Viet_Su_Timeline_V3.9_Offline.html   bản OFFLINE mở trực tiếp bằng trình duyệt (font nhúng sẵn)

Chạy:  python tools/build_frontend.py
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONT = ROOT / "frontend"
STATIC = ROOT / "static"
BUILD = STATIC / "build"
FONTS = STATIC / "fonts"
BASE_HTML = FRONT / "Viet_Su_Timeline_base_V3.7.html"
OFFLINE_OUT = STATIC / "Viet_Su_Timeline_V3.9_Offline.html"

RANGES = {
    "vietnamese": "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
    "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
}
WEIGHTS = [(w, "normal") for w in (300, 400, 500, 600, 700, 800, 900)] + [(400, "italic"), (500, "italic")]
OFFLINE_WEIGHTS = [(400, "normal"), (500, "normal"), (600, "normal"), (700, "normal"), (800, "normal"), (400, "italic")]

LEAFLET = {
    "js": ("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "/static/vendor/leaflet/leaflet.js",
           "sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH"),
    "css": ("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "/static/vendor/leaflet/leaflet.css",
            "sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"),
}

DATA_URI = re.compile(r"data:(image/(?:png|jpeg|jpg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)")
EXT = {"image/png": ".png", "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/webp": ".webp",
       "image/gif": ".gif", "image/svg+xml": ".svg"}


def font_face(sub: str, weight: int, style: str, src: str) -> str:
    return (f"@font-face{{font-family:'Be Vietnam Pro';font-style:{style};font-display:swap;font-weight:{weight};"
            f"src:url({src}) format('woff2');unicode-range:{RANGES[sub]}}}")


def online_font_css() -> str:
    rules = []
    for sub in ("vietnamese", "latin-ext", "latin"):
        for w, st in WEIGHTS:
            name = f"be-vietnam-pro-{sub}-{w}-{st}.woff2"
            if (FONTS / name).is_file():
                rules.append(font_face(sub, w, st, "./" + name))
    return "/* Be Vietnam Pro — SIL Open Font License 1.1 (xem OFL-LICENSE.txt) */\n" + "\n".join(rules) + "\n"


def offline_font_css() -> str:
    rules = []
    for sub in ("vietnamese", "latin"):
        for w, st in OFFLINE_WEIGHTS:
            p = FONTS / f"be-vietnam-pro-{sub}-{w}-{st}.woff2"
            if p.is_file():
                rules.append(font_face(sub, w, st, "data:font/woff2;base64," + base64.b64encode(p.read_bytes()).decode()))
    return "\n".join(rules)



def offline_published_textbook() -> dict:
    """Đóng gói bài học ĐÃ CÔNG BỐ vào HTML ngoại tuyến, không đưa bản nháp ra ngoài."""
    import sqlite3
    db_file = ROOT / "data" / "vietsucms.sqlite3"
    if not db_file.exists():
        return {}
    result = {}
    try:
        if str(ROOT) not in sys.path: sys.path.insert(0,str(ROOT))
        from vs_render import markdown_safe
        con = sqlite3.connect(f"file:{db_file}?mode=ro", uri=True)
        try:
            exists = con.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='textbook_lessons'").fetchone()
            if not exists:
                return {}
            for ident, state, raw in con.execute("SELECT id,live_state,live FROM textbook_lessons WHERE live_state='published'"):
                rec = json.loads(raw)
                if len((rec.get('content') or '').strip()) < 150:
                    continue
                fields = {k:rec.get(k) for k in ('grade','title','chapter','summary','key_points','review_questions','sources')}
                fields['content_html'] = markdown_safe(rec.get('content') or '')
                result[str(ident)] = fields
        finally:
            con.close()
    except (OSError, ValueError, sqlite3.DatabaseError):
        return {}
    return result


def optimize_offline_data_uris(html: str) -> tuple[str, int]:
    """Giảm dung lượng HTML một tệp: chuyển PNG nhúng lớn sang WebP có alpha, giữ ảnh sắc nét."""
    import io
    try:
        from PIL import Image
    except ImportError:
        return html, 0
    processed = 0
    cache = {}
    def convert(m: re.Match) -> str:
        nonlocal processed
        mime, encoded = m.group(1), m.group(2)
        if mime not in ('image/png','image/jpeg','image/jpg') or len(encoded) < 28000:
            return m.group(0)
        if encoded in cache:
            return cache[encoded]
        result = m.group(0)
        try:
            blob = base64.b64decode(encoded, validate=True)
            im = Image.open(io.BytesIO(blob)); im.load()
            if max(im.size)>1300: im.thumbnail((1300,1300),Image.Resampling.LANCZOS)
            if im.mode not in ('RGB','RGBA'): im = im.convert('RGBA' if 'A' in im.getbands() or 'transparency' in im.info else 'RGB')
            out = io.BytesIO();im.save(out,'WEBP',quality=88,method=1)
            data=out.getvalue()
            if len(data)<len(blob)*.82:
                result = 'data:image/webp;base64,' + base64.b64encode(data).decode('ascii')
                processed+=1
        except (OSError, ValueError):
            pass
        cache[encoded]=result
        return result
    html = DATA_URI.sub(convert, html)
    return html, processed

def patch_common(html: str) -> str:
    html = re.sub(r"<title>[^<]*</title>", "<title>VIỆT SỬ · Bản đồ thời gian</title>", html, count=1)
    return html


def inject(html: str, head_extra: str, body_extra: str) -> str:
    i = html.index("</title>") + len("</title>")
    html = html[:i] + head_extra + html[i:]
    j = html.rindex("</body>") if "</body>" in html else len(html)
    return html[:j] + body_extra + html[j:]


def build_offline(base: str) -> None:
    html = patch_common(base)
    # Leaflet tải từ CDN chỉ khi người dùng bật bản đồ trực tuyến → thêm SRI chống giả mạo thư viện
    js_url, _, js_sri = LEAFLET["js"]
    css_url, _, css_sri = LEAFLET["css"]
    html = html.replace(f"s.src='{js_url}';", f"s.src='{js_url}';s.integrity='{js_sri}';s.crossOrigin='anonymous';", 1)
    html = html.replace(f"css.href='{css_url}';", f"css.href='{css_url}';css.integrity='{css_sri}';css.crossOrigin='anonymous';", 1)
    head = (f"<style id=\"v38-fonts\">{offline_font_css()}</style>"
            f"<script id=\"v38-early\">{(FRONT / 'v38-early.js').read_text(encoding='utf-8')}</script>")
    lessons=json.dumps(offline_published_textbook(),ensure_ascii=False).replace('<', chr(92)+'u003c')
    body = (f'<style id="v38-style">{(FRONT / "v38.css").read_text(encoding="utf-8")}</style>'
            f'<script id="v38-script">{(FRONT / "v38.js").read_text(encoding="utf-8")}</script>'
            f'<style id="v39-style">{(FRONT / "v39.css").read_text(encoding="utf-8")}</style>'
            f'<script>window.VS39_OFFLINE_LESSONS={lessons};</script>'
            f'<script id="v39-script">{(FRONT / "v39.js").read_text(encoding="utf-8")}</script>')
    final, count=optimize_offline_data_uris(inject(html,head,body))
    OFFLINE_OUT.write_text(final, encoding="utf-8")
    print(f"Tối ưu {count} ảnh nhúng cho bản offline.")


def h(data: bytes, n: int = 12) -> str:
    return hashlib.sha256(data).hexdigest()[:n]


def optimize_image(blob: bytes, ext: str) -> tuple[bytes, str]:
    """PNG/JPG > 120 KB: thu nhỏ tối đa 1000 px và chuyển WebP (giữ nền trong suốt). Cần Pillow; thiếu thì bỏ qua."""
    if ext not in (".png", ".jpg") or len(blob) < 120_000:
        return blob, ext
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(blob))
        im.load()
        if max(im.size) > 1000:
            im.thumbnail((1000, 1000), Image.LANCZOS)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() or im.mode == "P" else "RGB")
        out = io.BytesIO()
        im.save(out, "WEBP", quality=85, method=1)
        data = out.getvalue()
        return (data, ".webp") if len(data) < len(blob) * 0.9 else (blob, ext)
    except Exception:  # noqa: BLE001
        return blob, ext


def build_online(base: str) -> dict:
    if BUILD.exists():
        shutil.rmtree(BUILD)
    (BUILD / "media").mkdir(parents=True)
    (BUILD / "js").mkdir(parents=True)
    html = patch_common(base)
    for key in ("js", "css"):
        cdn, local, _ = LEAFLET[key]
        html = html.replace(cdn, local)

    # 1) ảnh base64 → file băm tên
    seen: dict[str, str] = {}

    def repl(m: re.Match) -> str:
        mime, b64 = m.group(1), m.group(2)
        key = hashlib.sha1(b64.encode()).hexdigest()
        if key not in seen:
            try:
                blob = base64.b64decode(b64, validate=True)
            except Exception:  # noqa: BLE001
                return m.group(0)
            if len(blob) < 600:          # ảnh rất nhỏ: giữ inline, đỡ 1 request
                seen[key] = m.group(0)
            else:
                ext = EXT[mime]
                blob, ext = optimize_image(blob, ext)
                name = h(blob) + ext
                (BUILD / "media" / name).write_bytes(blob)
                seen[key] = "/static/build/media/" + name
        return seen[key]

    html = DATA_URI.sub(repl, html)

    # 2) script inline lớn → file .js băm tên (giữ nguyên thứ tự thực thi: script cổ điển, không async/defer)
    def ext_script(m: re.Match) -> str:
        attrs, code = m.group(1), m.group(2)
        if "type=" in attrs or "src=" in attrs or len(code) < 15000:
            return m.group(0)
        sid = re.search(r'id="([\w-]+)"', attrs)
        name = f"{sid.group(1) if sid else 'app'}.{h(code.encode())}.js"
        (BUILD / "js" / name).write_text(code, encoding="utf-8")
        return f'<script{attrs} src="/static/build/js/{name}"></script>'

    html = re.sub(r"<script([^>]*)>(.*?)</script>", ext_script, html, flags=re.S)

    # 3) lớp V3.8
    css = (FRONT / "v38.css").read_text(encoding="utf-8")
    js = (FRONT / "v38.js").read_text(encoding="utf-8")
    css_name, js_name = f"v38.{h(css.encode())}.css", f"v38.{h(js.encode())}.js"
    (BUILD / css_name).write_text(css, encoding="utf-8")
    (BUILD / "js" / js_name).write_text(js, encoding="utf-8")
    css39=(FRONT / 'v39.css').read_text(encoding='utf-8')
    js39=(FRONT / 'v39.js').read_text(encoding='utf-8')
    ncss39, njs39=f"v39.{h(css39.encode())}.css", f"v39.{h(js39.encode())}.js"
    (BUILD / ncss39).write_text(css39,encoding='utf-8')
    (BUILD / 'js' / njs39).write_text(js39,encoding='utf-8')
    head = ('<link rel="preload" href="/static/fonts/be-vietnam-pro-vietnamese-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
            '<link rel="preload" href="/static/fonts/be-vietnam-pro-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
            '<link rel="stylesheet" href="/static/fonts/be-vietnam-pro.css">'
            f"<script id=\"v38-early\">{(FRONT / 'v38-early.js').read_text(encoding='utf-8')}</script>")
    body = (f'<link rel="stylesheet" id="v38-style" href="/static/build/{css_name}">'
            f'<script id="v38-script" src="/static/build/js/{js_name}"></script>')
    body += (f'<link rel="stylesheet" id="v39-style" href="/static/build/{ncss39}">'
             f'<script id="v39-script" src="/static/build/js/{njs39}"></script>')
    html = inject(html, head, body)
    (BUILD / "index.html").write_text(html, encoding="utf-8")
    return {"media": len({v for v in seen.values() if v.startswith('/static/')}), "html": len(html.encode())}


def main() -> int:
    if not BASE_HTML.is_file():
        print("Không thấy", BASE_HTML)
        return 1
    base = BASE_HTML.read_text(encoding="utf-8")
    (FONTS / "be-vietnam-pro.css").write_text(online_font_css(), encoding="utf-8")
    build_offline(base)
    info = build_online(base)
    total = sum(p.stat().st_size for p in BUILD.rglob("*") if p.is_file())
    print(f"Offline: {OFFLINE_OUT.relative_to(ROOT)} ({OFFLINE_OUT.stat().st_size/1e6:.2f} MB)")
    print(f"Online : static/build/index.html ({info['html']/1e3:.0f} KB) + {info['media']} ảnh; tổng build {total/1e6:.2f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
