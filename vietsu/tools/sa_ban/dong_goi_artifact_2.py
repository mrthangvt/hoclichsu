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
# bộ máy đúng bản gói khai báo (^2.1 → 2.1.x mới nhất): loi.js mỗi bản có chỗ cắm khác nhau, ghép rieng.js của 2.1 vào loi.js 2.2 là hỏng
_v = re.match(r"\^?(\d+)\.(\d+)", str(P.get("engine", "2")))
_ds = sorted((KG / "engine").glob(f"{_v.group(1)}.{_v.group(2)}.*" if _v else "2.*"), key=lambda d: [int(x) for x in d.name.split(".")])
E = _ds[-1] if _ds else sorted((KG / "engine").glob("2.*"))[-1]
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
# ảnh bìa: packs/<id>/thumb.webp → thumb.jpg ở gốc artifact (artifact chỉ nhận PNG/JPEG làm ảnh xem trước)
thumb = ""
if (D / "thumb.webp").exists():
    from PIL import Image
    Image.open(D / "thumb.webp").convert("RGB").save(RA / "thumb.jpg", quality=86)
    thumb = '<link rel="artifact-thumbnail" href="thumb.jpg">'
vjs = f"""const a = new Audio(); a.preload = "auto"; window.__voxA = a;
fetch("packs/{goi}/{voice}").then((r) => (r.ok ? r.blob() : Promise.reject(r.status))).then((b) => {{ a.src = URL.createObjectURL(b); a.load(); }}).catch(() => {{ a.src = "packs/{goi}/{voice}"; a.load(); }});""" if voice else ""
(RA / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sa bàn {P['title']}</title>{thumb}
<style>html,body{{margin:0;height:100%;background:#17130f;overflow:hidden}}iframe{{position:fixed;inset:0;width:100%;height:100%;border:0;display:block}}#cau{{position:fixed;inset:0;z-index:5;pointer-events:none;overflow:hidden;transition:opacity .8s}}#cau img{{width:100%;height:100%;object-fit:cover;display:block;animation:cauZ 14s ease-out forwards}}#cau span{{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,15,10,.55);color:#f1e2b8;font:600 13px system-ui,sans-serif;padding:6px 14px;border-radius:99px}}#cau .td{{position:absolute;left:0;right:0;top:38%;text-align:center;color:#fff;font:800 clamp(26px,5vw,56px)/1.15 system-ui,sans-serif;text-shadow:0 2px 18px rgba(0,0,0,.75),0 0 3px #000;padding:0 6vw;animation:cauT 1.2s ease-out}}#cau .td small{{display:block;color:#f0c040;font-size:.42em;letter-spacing:.25em;margin-bottom:.4em}}@keyframes cauT{{from{{opacity:0;transform:translateY(12px)}}to{{opacity:1}}}}@keyframes cauZ{{from{{transform:scale(1)}}to{{transform:scale(1.07)}}}}</style></head>
<body><script>
{vjs}
let khung = null, cho = null, choTang = "";
const boKhung = (f) => {{ try {{ f.contentWindow.__dong && f.contentWindow.__dong(); }} catch (e) {{}} f.remove(); }};
// đổi tầng: nếu tầng mới đã được nạp sẵn trong khung chờ (ẩn) thì chỉ việc hiện khung đó và chạy tiếp — không còn màn tải
// V1.6 (anh Thắng: bỏ đoạn đen mờ khi chuyển hồi): "cầu" — ảnh khung hình cuối của tầng cũ phủ lên màn, từ từ phóng nhẹ, trong lúc tầng mới tải phía sau;
// tầng mới tải xong (màn tải của nó đã gỡ) thì ảnh mờ dần. Không bao giờ có hai sa bàn WebGL cùng chạy.
let cau = null;
const boCau = () => {{ if (!cau) return; const c = cau; cau = null; c.style.opacity = "0"; setTimeout(() => c.remove(), 900); }};
const choXong = (f) => {{ const t0 = Date.now(), lap = setInterval(() => {{ let xong = false; try {{ const d = f.contentDocument, l = d && d.getElementById("load");
  xong = !!(d && d.body && d.body.classList.contains("ready") && (!l || l.classList.contains("done"))); }} catch (e) {{}}
  if (xong || Date.now() - t0 > 30000 || !f.isConnected) {{ clearInterval(lap); setTimeout(boCau, xong ? 350 : 0); }} }}, 250); }};
window.__doiTang = (q, anh) => {{ const p = new URLSearchParams(q), tg = p.get("tang") || "";
  if (anh) {{ if (cau) cau.remove(); cau = document.createElement("div"); cau.id = "cau"; const im = new Image(); im.src = anh; const s = document.createElement("span"); s.textContent = "Đang chuyển cảnh…"; cau.append(im, s);
    const td = p.get("tieude"); if (td) {{ const [h, ten] = td.split("|"), d = document.createElement("div"); d.className = "td"; const sm = document.createElement("small"); sm.textContent = (h || "").toUpperCase(); d.append(sm, document.createTextNode((ten || "").toUpperCase())); cau.append(d); s.textContent = "…"; }}   // V1.8: khoảng chờ đổi tầng thành màn mở chương
    document.body.append(cau); }}
  if (cho && choTang === tg) {{ let w = null; try {{ w = cho.contentWindow; }} catch (e) {{}}
    if (w && w.__sanSang && w.__tiep) {{ const f = cho; cho = null; choTang = ""; f.style.opacity = "1"; f.style.pointerEvents = "auto"; f.style.zIndex = "2";
      w.__tiep(parseFloat(p.get("t")), p.get("phat") === "1"); try {{ w.focus(); }} catch (e) {{}} if (khung) boKhung(khung); khung = f; return; }}
  }}
  // V1.6 (bấm chuyển hồi bị treo): khung chờ không dùng tới và khung cũ phải trả bộ nhớ đồ hoạ NGAY (trước đây chỉ gỡ khỏi trang, ngữ cảnh WebGL còn giữ tới khi
  // trình duyệt dọn rác → hai, ba sa bàn cùng chiếm card đồ hoạ, máy treo)
  if (cho) {{ boKhung(cho); cho = null; choTang = ""; }}
  if (khung) {{ boKhung(khung); khung = null; }}   // V1.5 (Khe Sanh, anh Thắng: hồi 5 đơ hình, chỉ còn tiếng): trả ngữ cảnh WebGL của khung cũ TRƯỚC khi tạo khung mới — không lúc nào có hai sa bàn cùng chạy
  const f = document.createElement("iframe"); f.allow = "autoplay; fullscreen; screen-wake-lock"; f.title = "Sa bàn"; f.style.zIndex = "2";
  f.src = "app.html#" + q; document.body.append(f); f.addEventListener("load", () => {{ try {{ f.contentWindow.focus(); }} catch (e) {{}} }});
  if (cau) choXong(f);
  if (khung) boKhung(khung); khung = f; }};
window.__chuanBi = (q) => {{ const tg = new URLSearchParams(q).get("tang") || ""; if (cho && choTang === tg) return; if (cho) boKhung(cho);
  const f = document.createElement("iframe"); f.allow = "autoplay; fullscreen; screen-wake-lock"; f.title = "Sa bàn (nạp sẵn)"; f.style.cssText = "opacity:0;pointer-events:none;z-index:0";
  f.src = "app.html#" + q + "&cho=1"; document.body.prepend(f); cho = f; choTang = tg; }};
// V1.7 (anh Thắng: điện thoại gần các chương cuối bị tải lại từ đầu): ghi chỗ đang xem mỗi 3 s; trang bị trình duyệt tải lại thì mở lại đúng tầng, đúng phút
const KHOA = "sa-ban-tiep:{goi}";
setInterval(() => {{ try {{ const s = khung && khung.contentWindow && khung.contentWindow.__sa; if (!s || cau) return; const t = s.T;
  if (t > 5 && t < s.DUR - 3) localStorage.setItem(KHOA, JSON.stringify({{ tang: s.TANG, t: +t.toFixed(1), luc: Date.now() }})); else if (t >= s.DUR - 3) localStorage.removeItem(KHOA); }} catch (e) {{}} }}, 3000);
let dau = location.hash === "#chan-doan" ? "chan-doan=1" : "";
try {{ const g = JSON.parse(localStorage.getItem(KHOA) || "null"); if (!dau && g && Date.now() - g.luc < 6 * 3600e3 && g.t > 5) dau = "tang=" + encodeURIComponent(g.tang) + "&t=" + g.t + "&tiep=1"; }} catch (e) {{}}
window.__doiTang(dau);
</script></body></html>
""", encoding="utf-8")
tep = [p for p in RA.rglob("*") if p.is_file()]
print(f"{RA}: {len(tep)} tệp, {sum(p.stat().st_size for p in tep) / 1e6:.1f} MB, lớn nhất {max(p.stat().st_size for p in tep) / 1e6:.1f} MB")
