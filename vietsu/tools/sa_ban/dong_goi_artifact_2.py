# -*- coding: utf-8 -*-
"""Đóng gói một gói sa bàn bộ máy 2.x thành thư mục tĩnh để đăng Artifact (xem online, không cần máy chủ).

    python3 vietsu/tools/sa_ban/dong_goi_artifact_2.py nhu-nguyet-1077 [thư mục ra]

Artifact chặn script tạo từ blob: và không truyền ?goi=…, nên ở đây ghép sẵn loi.js + rieng.js thành app.js
(đúng cách sa-ban.html ghép lúc chạy), index.html gọi thẳng gói đã chọn. Giữ nguyên đường dẫn engine/<bản>/, packs/<id>/.
"""
import sys, re, json, shutil
from pathlib import Path

KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
goi = sys.argv[1]
RA = Path(sys.argv[2] if len(sys.argv) > 2 else f"dist_{goi}").resolve()
D = KG / "packs" / goi
P = json.loads((D / "pack.json").read_text(encoding="utf-8"))
E = sorted((KG / "engine").glob("2.*"))[-1]
if RA.exists(): shutil.rmtree(RA)
(RA / "packs").mkdir(parents=True)

# 1. ghép mã như sa-ban.html: //@@ sN trong rieng.js điền vào /*@@RIENG:sN@@*/ của loi.js
loi = (E / "loi.js").read_text(encoding="utf-8")
rieng = (D / P["script"]).read_text(encoding="utf-8") if P.get("script") else ""
doan = {}
for m in re.split(r"^//@@ ", rieng, flags=re.M)[1:]:
    k, _, body = m.partition("\n"); doan[k.strip()] = body
thieu = []
def dien(mo):
    k = mo.group(1)
    if k not in doan: thieu.append(k)
    return doan.get(k, "")
ma = re.sub(r"/\*@@RIENG:(s\d+)@@\*/", dien, loi).replace("@@ENGINE@@", f"./engine/{E.name}/")
if thieu: print("rieng.js thiếu đoạn:", ", ".join(thieu))
(RA / "app.js").write_text(ma, encoding="utf-8")

# 2. bộ máy (trừ loi.js, sa-ban.html) và gói (trừ rieng.js)
shutil.copytree(E, RA / "engine" / E.name, ignore=shutil.ignore_patterns("loi.js", "sa-ban.html", "LICENSE*"))
shutil.copytree(D, RA / "packs" / goi, ignore=shutil.ignore_patterns(P.get("script") or "-", "*.md"))
# Artifact không phục vụ đuôi .nvz, .glb: lưu thành chữ base64 (<tên>.b64.txt), trang đổi ngược khi tải (máy chủ nén gzip phần chữ khi gửi)
import base64
NHI_PHAN = (".nvz", ".glb", ".bin")
for f in list((RA / "packs").rglob("*")):
    if f.is_file() and f.suffix in NHI_PHAN:
        f.with_name(f.name + ".b64.txt").write_text(base64.b64encode(f.read_bytes()).decode()); f.unlink()

# 3. trang chính: khung giao diện từ pack.json, rồi nạp app.js
html = (E / "sa-ban.html").read_text(encoding="utf-8")
html = html.replace('href="sa-ban.css"', f'href="engine/{E.name}/sa-ban.css"')
dau = html.index('<script type="module">'); cuoi = html.index("</script>", dau) + len("</script>")
html = html[:dau] + f'''<script type="module">
import {{ khungHTML }} from "./engine/{E.name}/khung.js";
const say = (m) => {{ const el = document.getElementById("err"); if (el) el.textContent = m; else document.body.insertAdjacentHTML("afterbegin", `<p style="padding:24px;font-family:system-ui">${{m}}</p>`); }};
addEventListener("error", (e) => say("Không dựng được sa bàn: " + (e.message || "lỗi không rõ") + ". Hãy tải lại trang."));
const _f = globalThis.fetch.bind(globalThis);          // tệp nhị phân .nvz/.glb nằm dưới dạng base64 .b64.txt
globalThis.fetch = async (u, o) => {{
  const s = typeof u === "string" ? u : u instanceof URL ? u.href : u.url;
  if (!/\\.(nvz|glb|bin)(\\?|$)/.test(s)) return _f(u, o);
  const r = await _f(s.replace(/(\\.(nvz|glb|bin))(\\?|$)/, "$1.b64.txt$3"), o); if (!r.ok) return r;
  const t = (await r.text()).trim(), b = Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  return new Response(b, {{ status: 200, headers: {{ "content-type": "application/octet-stream" }} }});
}};
try {{
  const base = new URL("packs/{goi}/", location.href).href;
  const P = await (await fetch(base + "pack.json")).json();
  document.title = "Sa bàn " + P.title;
  document.body.insertAdjacentHTML("afterbegin", khungHTML(P, base));
  window.__SB = {{ pack: P, base }};
  await import("./app.js");
}} catch (e) {{ console.error(e); say("Không dựng được sa bàn: " + e.message); }}
</script>''' + html[cuoi:]
html = re.sub(r"<title>.*?</title>", f"<title>Sa bàn {P['title']}</title>", html)
(RA / "index.html").write_text(html, encoding="utf-8")
tep = [p for p in RA.rglob("*") if p.is_file()]
print(f"{RA}: {len(tep)} tệp, {sum(p.stat().st_size for p in tep) / 1e6:.1f} MB, lớn nhất {max(p.stat().st_size for p in tep) / 1e6:.1f} MB")
