"""Việt Sử V3.8 — render HTML phía máy chủ (an toàn XSS) cho trang bài viết / bài học SEO."""
from __future__ import annotations

import html
import json
import re

from vs_core import SITE_URL, is_safe_url, site_is_public

esc = lambda v: html.escape("" if v is None else str(v), quote=True)  # noqa: E731

_INLINE_LINK = re.compile(r"\[([^\]\n]{1,300})\]\(([^)\s]{1,1000})\)")
_INLINE_IMG = re.compile(r"!\[([^\]\n]{0,300})\]\(([^)\s]{1,1000})\)")
_BOLD = re.compile(r"\*\*(?=\S)(.+?)(?<=\S)\*\*")
_ITAL = re.compile(r"(?<![\*\w])\*(?=\S)([^*\n]+?)(?<=\S)\*(?!\*)")


def _url_ok(escaped_url: str) -> str | None:
    raw = html.unescape(escaped_url)
    return escaped_url if is_safe_url(raw) else None


def _inline(text: str) -> str:
    """text đã được escape. Chỉ thêm thẻ an toàn: b, i, a(https|/), img(https|/)."""
    def img(m):
        url = _url_ok(m.group(2))
        if not url:
            return m.group(0)
        return f'<img src="{url}" alt="{m.group(1)}" loading="lazy" decoding="async">'

    def link(m):
        url = _url_ok(m.group(2))
        if not url:
            return m.group(1)
        ext = ' target="_blank" rel="noopener noreferrer nofollow"' if url.startswith("https://") else ""
        return f'<a href="{url}"{ext}>{m.group(1)}</a>'

    text = _INLINE_IMG.sub(img, text)
    text = _INLINE_LINK.sub(link, text)
    text = _BOLD.sub(r"<strong>\1</strong>", text)
    text = _ITAL.sub(r"<em>\1</em>", text)
    return text


def markdown_safe(raw: str, inline_ad_after: int = 0, ad_html: str = "") -> str:
    """Markdown rút gọn: # / ## / ### tiêu đề, đoạn, danh sách -, 1., trích dẫn >, ---, **đậm**, *nghiêng*,
    [liên kết](https://…), ![ảnh](https://…). Mọi HTML người dùng nhập đều bị escape."""
    lines = (raw or "").replace("\r\n", "\n").split("\n")
    out: list[str] = []
    para: list[str] = []
    lst: list[str] = []
    lst_tag = ""
    quote: list[str] = []
    pcount = 0

    def flush_para():
        nonlocal pcount
        if para:
            out.append("<p>" + _inline(esc(" ".join(para))) + "</p>")
            para.clear()
            pcount += 1
            if inline_ad_after and pcount == inline_ad_after and ad_html:
                out.append(ad_html)

    def flush_list():
        nonlocal lst_tag
        if lst:
            out.append(f"<{lst_tag}>" + "".join("<li>" + _inline(esc(x)) + "</li>" for x in lst) + f"</{lst_tag}>")
            lst.clear()
            lst_tag = ""

    def flush_quote():
        if quote:
            out.append("<blockquote>" + "<br>".join(_inline(esc(x)) for x in quote) + "</blockquote>")
            quote.clear()

    for line in lines:
        s = line.strip()
        if not s:
            flush_para(); flush_list(); flush_quote()
            continue
        m = re.match(r"^(#{1,4})\s+(.+)$", s)
        if m:
            flush_para(); flush_list(); flush_quote()
            level = min(len(m.group(1)) + 1, 5)
            out.append(f"<h{level}>" + _inline(esc(m.group(2))) + f"</h{level}>")
            continue
        if re.match(r"^(-{3,}|\*{3,})$", s):
            flush_para(); flush_list(); flush_quote()
            out.append("<hr>")
            continue
        m = re.match(r"^[-*•]\s+(.+)$", s)
        if m:
            flush_para(); flush_quote()
            if lst_tag and lst_tag != "ul":
                flush_list()
            lst_tag = "ul"; lst.append(m.group(1)); continue
        m = re.match(r"^\d{1,3}[.)]\s+(.+)$", s)
        if m:
            flush_para(); flush_quote()
            if lst_tag and lst_tag != "ol":
                flush_list()
            lst_tag = "ol"; lst.append(m.group(1)); continue
        if s.startswith(">"):
            flush_para(); flush_list()
            quote.append(s.lstrip("> ").strip()); continue
        flush_list(); flush_quote()
        para.append(s)
    flush_para(); flush_list(); flush_quote()
    return "\n".join(out)


def plain_text(raw: str, limit: int = 180) -> str:
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", raw or "")
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"[#>*_`]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t if len(t) <= limit else t[: limit - 1].rsplit(" ", 1)[0] + "…"


def json_ld(data) -> str:
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace("<", "\\u003c") + "</script>"


PAGE_CSS = """
:root{--bg:#f6f1e7;--panel:#fffaf0;--fg:#22302f;--muted:#5d6b68;--gold:#94641f;--edge:#dccfb6;--chip:#efe4cf;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0d1a20;--panel:#14252c;--fg:#eee6d5;--muted:#a9b9b6;--gold:#e3bf7f;--edge:#2f474e;--chip:#1c3238;color-scheme:dark}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.75 "Be Vietnam Pro",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;overflow-wrap:anywhere}
a{color:var(--gold)}img{max-width:100%;height:auto;border-radius:12px}
.top{border-bottom:1px solid var(--edge);padding:12px max(16px,env(safe-area-inset-left))}
.top a{text-decoration:none;font-weight:700;letter-spacing:.06em}
.wrap{max-width:820px;margin:0 auto;padding:28px max(16px,env(safe-area-inset-left)) 60px max(16px,env(safe-area-inset-right))}
.crumb{font-size:13px;color:var(--muted)}.crumb a{color:var(--muted)}
h1{font-size:clamp(26px,4.4vw,42px);line-height:1.25;margin:10px 0 12px;text-wrap:balance}
h2,h3,h4,h5{line-height:1.35;margin:1.6em 0 .5em;text-wrap:balance}h2{font-size:1.45em}h3{font-size:1.2em}
.lede{font-size:1.08em;color:var(--muted)}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 20px}.chip{background:var(--chip);border:1px solid var(--edge);border-radius:999px;padding:3px 11px;font-size:13px}
.panel{background:var(--panel);border:1px solid var(--edge);border-radius:16px;padding:18px 20px;margin:22px 0}
blockquote{margin:1em 0;padding:.6em 1em;border-left:4px solid var(--gold);background:var(--panel);border-radius:0 12px 12px 0}
figure{margin:18px 0}figcaption{font-size:13px;color:var(--muted);margin-top:6px}
table{border-collapse:collapse;width:100%}
.lessons{list-style:none;padding:0;display:grid;gap:8px}.lessons li{background:var(--panel);border:1px solid var(--edge);border-radius:12px;padding:10px 14px}
.lessons small{color:var(--muted)}
.back{margin-top:36px}
.vs-ad{margin:26px 0;min-height:110px;text-align:center}
.vs-ad-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}
.vs-ad:has(ins[data-ad-status="unfilled"]){display:none}
"""


def ad_slot_html(ads: dict, pos: str) -> str:
    """Khối quảng cáo đặt sẵn; chỉ in ra khi AdSense đã bật và slot có mã."""
    if not ads.get("active"):
        return ""
    slot = (ads.get("slots") or {}).get(pos, "")
    if ads.get("preview") and not slot:
        return f'<div class="vs-ad" style="border:1px dashed var(--edge);border-radius:12px;padding:30px 10px;color:var(--muted)">Vị trí quảng cáo: {esc(pos)}</div>'
    if not slot:
        return ""
    test = ' data-adtest="on"' if ads.get("test_mode") else ""
    return (f'<div class="vs-ad" data-pos="{esc(pos)}"><div class="vs-ad-label">Quảng cáo</div>'
            f'<ins class="adsbygoogle" style="display:block" data-ad-client="{esc(ads["client"])}" data-ad-slot="{esc(slot)}" '
            f'data-ad-format="auto" data-full-width-responsive="true"{test}></ins>'
            '<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>')


def page_shell(*, title: str, description: str, canonical: str, body: str, ads_head: str = "",
               indexable: bool = True, og_type: str = "article", schema=None, image: str = "") -> str:
    robots = "index, follow, max-image-preview:large" if (indexable and site_is_public()) else "noindex, nofollow"
    og_img = ""
    if image:
        abs_img = image if image.startswith("https://") else SITE_URL + image
        og_img = f'<meta property="og:image" content="{esc(abs_img)}">'
    return ("<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\">"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">"
            f"<title>{esc(title)}</title><meta name=\"description\" content=\"{esc(description)}\">"
            f"<link rel=\"canonical\" href=\"{esc(canonical)}\"><meta name=\"robots\" content=\"{robots}\">"
            f"<meta property=\"og:type\" content=\"{esc(og_type)}\"><meta property=\"og:locale\" content=\"vi_VN\">"
            f"<meta property=\"og:title\" content=\"{esc(title)}\"><meta property=\"og:description\" content=\"{esc(description)}\">"
            f"<meta property=\"og:url\" content=\"{esc(canonical)}\">{og_img}"
            "<link rel=\"preload\" href=\"/static/fonts/be-vietnam-pro-vietnamese-400-normal.woff2\" as=\"font\" type=\"font/woff2\" crossorigin>"
            "<link rel=\"stylesheet\" href=\"/static/fonts/be-vietnam-pro.css\">"
            f"<style>{PAGE_CSS}</style>{json_ld(schema) if schema else ''}{ads_head}</head><body>"
            "<div class=\"top\"><a href=\"/\">VIỆT SỬ · 越史</a></div>"
            f"<main class=\"wrap\">{body}</main></body></html>")
