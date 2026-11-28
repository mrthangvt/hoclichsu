"""Làm sạch HTML bài viết (V6) — chỉ giữ thẻ và thuộc tính an toàn, bỏ script/style/sự kiện.

Dùng cho nội dung từ trình biên tập bài viết trước khi lưu và trước khi hiển thị công khai.
"""
from __future__ import annotations

import html
import re
from html.parser import HTMLParser

THE = {"p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li", "a", "img",
       "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div", "sup", "sub", "code", "pre"}
RONG = {"br", "img", "hr"}  # thẻ không có thẻ đóng
BO_CA_NOI_DUNG = {"script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math", "form", "head", "title"}
THUOC_TINH = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "width", "height", "title"},
    "td": {"colspan", "rowspan"}, "th": {"colspan", "rowspan", "scope"},
    "ol": {"start"},
    "span": {"class", "title"},
    "figure": {"class"},          # căn ảnh: anh-trai · anh-phai · anh-giua · anh-rong   # chỉ class="ghi-chu" (ghi chú), title = nội dung ghi chú
}
CANH = {"left", "center", "right", "justify"}
LOP_ANH = {"anh-trai", "anh-phai", "anh-giua", "anh-rong"}
SO_RE = re.compile(r"^\d{1,4}$")


def _url_an_toan(u: str, anh: bool = False) -> str | None:
    u = (u or "").strip()
    if not u or any(c in u for c in "\x00\r\n\t"):
        return None
    thap = u.lower()
    if thap.startswith(("https://", "http://")):
        return u
    if u.startswith("/") and not u.startswith("//"):
        return u
    if not anh and (u.startswith("#") or thap.startswith("mailto:")):
        return u
    return None


class _LamSach(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ra: list[str] = []
        self.mo: list[str] = []
        self.bo = 0  # đang trong thẻ bị bỏ cả nội dung

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in BO_CA_NOI_DUNG:
            if tag not in RONG:
                self.bo += 1
            return
        if self.bo or {"b": "strong", "i": "em", "h1": "h2", "h5": "h4", "h6": "h4"}.get(tag, tag) not in THE:
            return
        tag = {"b": "strong", "i": "em", "h1": "h2", "h5": "h4", "h6": "h4"}.get(tag, tag)
        cho_phep = THUOC_TINH.get(tag, set())
        out = []
        canh = None
        for k, v in attrs:
            k = (k or "").lower()
            v = v or ""
            if k == "style":
                m = re.search(r"text-align\s*:\s*(left|center|right|justify)", v, re.I)
                if m and tag in {"p", "h2", "h3", "h4", "div", "figure", "td", "th", "li"}:
                    canh = m.group(1).lower()
                continue
            if k == "align" and v.lower() in CANH and tag in {"p", "h2", "h3", "h4", "div", "td", "th"}:
                canh = v.lower()
                continue
            if k not in cho_phep:
                continue
            if k in ("href", "src"):
                v = _url_an_toan(v, anh=(k == "src"))
                if v is None:
                    continue
            elif k in ("width", "height", "colspan", "rowspan", "start"):
                if not SO_RE.match(v):
                    continue
            elif k == "class":
                if tag == "span" and v.strip() == "ghi-chu":
                    v = "ghi-chu"
                elif tag == "figure" and v.strip() in LOP_ANH:
                    v = v.strip()
                else:
                    continue
            elif k == "title" and tag == "span":
                v = re.sub(r"\s+", " ", v).strip()[:1000]
                if not v:
                    continue
            elif k == "target":
                v = "_blank" if v == "_blank" else None
                if v is None:
                    continue
            out.append(f' {k}="{html.escape(v, quote=True)}"')
        if tag == "img" and not any(o.startswith(" src=") for o in out):
            return
        if tag == "a":
            if any(o.startswith(' href="http') for o in out):
                out.append(' rel="noopener noreferrer"' if any(o.startswith(" target=") for o in out) else ' rel="noopener"')
        if tag == "img":
            out.append(' loading="lazy"')
        if canh and canh != "left":
            out.append(f' style="text-align:{canh}"')
        self.ra.append(f"<{tag}{''.join(out)}>")
        if tag not in RONG:
            self.mo.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        t = tag.lower()
        t = {"b": "strong", "i": "em"}.get(t, t)
        if t not in RONG and self.mo and self.mo[-1] == t:
            self.mo.pop()
            self.ra.append(f"</{t}>")

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in BO_CA_NOI_DUNG:
            if tag not in RONG and self.bo:
                self.bo -= 1
            return
        if self.bo:
            return
        tag = {"b": "strong", "i": "em", "h1": "h2", "h5": "h4", "h6": "h4"}.get(tag, tag)
        if tag in RONG or tag not in self.mo:
            return
        while self.mo:
            t = self.mo.pop()
            self.ra.append(f"</{t}>")
            if t == tag:
                break

    def handle_data(self, data):
        if not self.bo:
            self.ra.append(html.escape(data, quote=False))

    def ket_qua(self) -> str:
        while self.mo:
            self.ra.append(f"</{self.mo.pop()}>")
        return "".join(self.ra)


def lam_sach(h: str) -> str:
    p = _LamSach()
    p.feed(h or "")
    p.close()
    s = p.ket_qua()
    s = re.sub(r"(<p>\s*(<br>)?\s*</p>\s*){2,}", "<p><br></p>", s)
    return s.strip()


def chu_tron(h: str) -> str:
    """Chữ thuần (để tính độ dài, tóm tắt, tìm kiếm)."""
    s = re.sub(r"<(br|/p|/h\d|/li|/blockquote|/tr)[^>]*>", "\n", h or "", flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"[ \t]+", " ", html.unescape(s)).strip()
