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
# bộ máy 2.2 đổi tầng địa hình bằng cách tải lại trang với ?tang=…&t=…; trong Artifact tải lại trang không giữ được tham số
# → bản Artifact: trang khung ngoài (index.html) giữ thẻ voice và một iframe app.html#tang=…&t=…; đổi tầng = thay iframe (trang ngoài không tải lại)
ma = ma.replace("const QS = new URLSearchParams(location.search);",
  "const QS = (() => { const q = new URLSearchParams(location.search); for (const [k, v] of new URLSearchParams(location.hash.slice(1))) q.set(k, v); return q; })();", 1)
ma = ma.replace("const q = new URLSearchParams(location.search); q.set('tang', ten);", "const q = new URLSearchParams(QS); q.set('tang', ten);", 1)
ma = ma.replace("setTimeout(() => { location.search = q.toString(); }",
  "setTimeout(() => { if (window.parent !== window && window.parent.__doiTang) window.parent.__doiTang(q.toString()); else location.search = q.toString(); }", 1)
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
// báo lỗi lên màn hình (Artifact không cho xem console): luôn hiện khi có lỗi; thêm #chan-doan vào địa chỉ để xem nhịp chạy
const hop = document.createElement("pre"); hop.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;max-width:70vw;max-height:45vh;overflow:auto;background:#000d;color:#fa8;font:12px/1.35 monospace;padding:6px 8px;margin:0;white-space:pre-wrap;pointer-events:none;border-radius:6px";
const ghi = (m) => {{ hop.textContent = (hop.textContent + m + "\\n").slice(-4000); if (!hop.isConnected) document.documentElement.append(hop); }};
addEventListener("error", (e) => ghi("Lỗi: " + (e.message || "") + " · " + String(e.filename || "").split("/").pop() + ":" + e.lineno));
addEventListener("unhandledrejection", (e) => ghi("Lỗi (promise): " + (e.reason && (e.reason.stack || e.reason.message) || e.reason)));
if (/chan-doan/.test(location.hash)) {{ ghi("chẩn đoán: " + location.href.split("?")[0].slice(-40) + " · search=" + location.search.slice(0, 80));
  setInterval(() => {{ const s = window.__sa; ghi(s ? `tầng ${{s.TANG}} · T ${{(+s.T).toFixed(1)}} · ${{document.getElementById("fps") ? document.getElementById("fps").textContent : ""}}` : "chưa có __sa"); }}, 3000); }}
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
(RA / "app.html").write_text(html, encoding="utf-8")
# trang khung ngoài: một iframe app.html; giữ voice (nếu gói có) để lời dẫn chạy liền qua các lần đổi tầng
voice = (P.get("audio") or {}).get("voice")
vjs = f"""const a = new Audio(); a.preload = "auto"; window.__voxA = a;
fetch("packs/{goi}/{voice}").then((r) => (r.ok ? r.blob() : Promise.reject(r.status))).then((b) => {{ a.src = URL.createObjectURL(b); a.load(); }}).catch(() => {{ a.src = "packs/{goi}/{voice}"; a.load(); }});""" if voice else ""
(RA / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sa bàn {P['title']}</title>
<style>html,body{{margin:0;height:100%;background:#17130f;overflow:hidden}}iframe{{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}}</style></head>
<body><script>
{vjs}
let khung = null;
window.__doiTang = (q) => {{ const f = document.createElement("iframe"); f.allow = "autoplay; fullscreen"; f.title = "Sa bàn";
  f.src = "app.html#" + q; document.body.append(f); f.addEventListener("load", () => {{ try {{ f.contentWindow.focus(); }} catch (e) {{}} }});
  if (khung) khung.remove(); khung = f; }};
window.__doiTang(location.hash === "#chan-doan" ? "chan-doan=1" : "");
</script></body></html>
""", encoding="utf-8")
tep = [p for p in RA.rglob("*") if p.is_file()]
print(f"{RA}: {len(tep)} tệp, {sum(p.stat().st_size for p in tep) / 1e6:.1f} MB, lớn nhất {max(p.stat().st_size for p in tep) / 1e6:.1f} MB")
