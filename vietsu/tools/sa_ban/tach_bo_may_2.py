#!/usr/bin/env python3
"""Dựng bộ máy sa bàn 2.0.0 (họ Bạch Đằng) và gói bach-dang-938 từ mã Bạch Đằng 938 V1.2.

Cách tách (xem docs/KHUNG_SA_BAN.md mục 4): chia app.js thành các khối cấp cao nhất (hàm, hằng, phần có tiêu đề).
- Khối giống (≥ 75 %) với mã Như Nguyệt 1077 V1.6 → phần chung → engine/2.0.0/loi.js.
- Khối khác hoặc chỉ có ở Bạch Đằng → phần riêng của trận → packs/bach-dang-938/rieng.js, chia thành các đoạn theo thứ tự;
  ở loi.js mỗi đoạn để lại một chỗ cắm /*@@RIENG:sN@@*/. Trang sa-ban.html ghép loi.js + rieng.js thành một mô-đun rồi chạy.
Đây là bước tạm của Giai đoạn 2: phần biên đạo (thuyền, quân, góc máy, bầu trời theo chương) còn là mã; khi gộp Như Nguyệt,
những gì hai trận dùng chung tiếp tục chuyển sang loi.js.

Dùng:  python3 vietsu/tools/sa_ban/tach_bo_may_2.py <thư mục mã Bạch Đằng> <app.js Như Nguyệt>
"""
import difflib, re, sys
from pathlib import Path

KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/bdsrc")
NN = Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/src/nn/app.js")

def blocks(s):
    L = s.split("\n"); out = []; cur = None
    for l in L:
        m = re.match(r"^(?:async )?function (\w+)|^(?:const|let|var) ([\w$]+)|^// -{10,} (.*)", l)
        if m:
            cur = [m.group(1) or m.group(2) or ("#" + (m.group(3) or "")[:40]), []]; out.append(cur)
        elif cur is None:
            cur = ["#dau", []]; out.append(cur)
        cur[1].append(l)
    return out

bd = (SRC / "app.js").read_text(encoding="utf-8")
nn = NN.read_text(encoding="utf-8")
NB = {n: "\n".join(t) for n, t in blocks(nn)}
B = blocks(bd)

# Ép một số khối về phần chung / phần riêng cho rõ ràng (bất kể độ giống)
CHUNG = {"#dau", "$", "lp", "showErr", "progress", "getJSON", "loadBitmap", "hbmp", "HG", "WM", "hAt", "isWater", "texLoader", "b64", "loadModel", "nvLoad",
         "NVK", "nvIM", "nvFrame", "nvGrip", "clamp", "sstep", "lerp", "ease", "keys", "angLerp", "rnd", "clock", "frame", "first"}
RIENG = {"update"}

def kind(name, text):
    if name in CHUNG: return "c"
    if name in RIENG: return "r"
    if name not in NB: return "r"
    if len(text) > 20000: return "c" if text == NB[name] else "r"
    return "c" if difflib.SequenceMatcher(None, text, NB[name], autojunk=False).ratio() >= 0.75 else "r"

core, secs, n = [], [], 0
prev = None
for name, lines in B:
    t = "\n".join(lines); k = kind(name, t)
    if k == "r":
        if prev != "r":
            n += 1; secs.append([f"s{n}", []]); core.append(f"/*@@RIENG:s{n}@@*/")
        secs[-1][1].append(t)
    else:
        core.append(t)
    prev = k
loi = "\n".join(core)

def rep(o, nw, c=1):
    global loi
    k = loi.count(o)
    if k != c: raise SystemExit(f"loi.js: không khớp ({k}≠{c}): {o[:100]}")
    loi = loi.replace(o, nw)

# ── đầu tệp: three.js đặt sẵn (đường dẫn tuyệt đối, trang ghép thay @@ENGINE@@), gói và đường dẫn tệp trong gói
rep("""import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';""",
"""// Bộ máy sa bàn Việt Sử 2.0.0 (họ Bạch Đằng) — docs/KHUNG_SA_BAN.md. Tách bằng tools/sa_ban/tach_bo_may_2.py từ Bạch Đằng 938 V1.2:
// phần giống Như Nguyệt 1077 nằm ở đây; phần riêng của từng trận ở packs/<id>/rieng.js, cắm vào các chỗ /*@@RIENG:sN@@*/.
import * as THREE from '@@ENGINE@@vendor/three/three.module.min.js';
import { OrbitControls } from '@@ENGINE@@vendor/three/addons/controls/OrbitControls.js';
const PACK = window.__SB.pack, PBASE = window.__SB.base;
const DUONG = [['data/meta.json', 'terrain/meta.json'], ['data/inst.json', 'placement.json'], ['data/story.json', 'story.json'],
  ['data/height.png', 'terrain/height.png'], ['data/color.jpg', 'terrain/color.jpg'], ['data/', 'props/'], ['models/', 'units/'],
  ['nhanvat/', 'units/'], ['am/', 'audio/'], ['nhac/', 'audio/nhac/']];
const PU = (f) => { for (const [a, b] of DUONG) if (f.startsWith(a)) { f = b + f.slice(a.length); break; } return new URL(f, PBASE).href; };   // tệp trong gói""")
rep("const getJSON = (u) => fetch(u).then(", "const getJSON = (u) => fetch(PU(u)).then(")
rep("  const b = await (await fetch(url)).blob();", "  const b = await (await fetch(PU(url))).blob();")
loi = re.sub(r"texLoader\.loadAsync\(('[^']*'(?: \+ [\w.]+)?)\)", r"texLoader.loadAsync(PU(\1))", loi)
loi = loi.replace("new THREE.TextureLoader().loadAsync('data/color.jpg')", "new THREE.TextureLoader().loadAsync(PU('data/color.jpg'))")

# ── nhân vật: tệp .nvz (tools/sa_ban/nv_sang_nvz.py) thay cho nv_*.json base64
a = loi.index("async function nvLoad(kind, cap) {"); b = loi.index("  // bản soi gương", a)
loi = loi[:a] + """async function nvzRead(url) {                  // gzip("NVZ1" + u32 + JSON đầu + khối nhị phân)
  const r = await fetch(url); if (!r.ok) throw new Error('không tải được ' + url);
  let buf = await r.arrayBuffer(); const h8 = new Uint8Array(buf, 0, 2);
  if (h8[0] === 0x1f && h8[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const dv = new DataView(buf); if (dv.getUint32(0, false) !== 0x4e565a31) throw new Error('tệp không phải NVZ1: ' + url);
  const hl = dv.getUint32(4, true), H = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 8, hl))), b0 = (8 + hl + 3) & ~3;
  return { H, arr: (ref, T) => new T(buf, b0 + ref[0], ref[1] / T.BYTES_PER_ELEMENT) };
}
function nvzFrames(Z, posRef, norRef, n, q) {
  const D = Z.arr(posRef, Int16Array), DN = Z.arr(norRef, Int8Array), nv = D.length / n / 3, acc = new Int16Array(nv * 3), an = new Int8Array(nv * 2), out = [];
  for (let f = 0; f < n; f++) {
    const p = new Float32Array(nv * 3), nr = new Float32Array(nv * 3);
    for (let i = 0, o = f * nv * 3; i < nv * 3; i++) { acc[i] += D[o + i]; p[i] = acc[i] * q; }
    for (let i = 0, o = f * nv * 2; i < nv; i++) {
      an[i * 2] += DN[o + i * 2]; an[i * 2 + 1] += DN[o + i * 2 + 1];
      let x = an[i * 2] / 127, y = an[i * 2 + 1] / 127; const z = 1 - Math.abs(x) - Math.abs(y);
      if (z < 0) { const ox = x; x = (1 - Math.abs(y)) * (ox >= 0 ? 1 : -1); y = (1 - Math.abs(ox)) * (y >= 0 ? 1 : -1); }
      const l = Math.hypot(x, y, z) || 1; nr[i * 3] = x / l; nr[i * 3 + 1] = y / l; nr[i * 3 + 2] = z / l;
    }
    out.push([p, nr]);
  }
  return out;
}
async function nvLoad(kind, cap) {
  const Z = await nvzRead(PU('nhanvat/' + kind + '.nvz')), H = Z.H;
  const map = await texLoader.loadAsync(PU('nhanvat/' + kind + '.jpg')); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }); clipList.push(mat);
  const index = new THREE.BufferAttribute(H.idx32 ? Z.arr(H.idx, Uint32Array) : Z.arr(H.idx, Uint16Array), 1);
  const uv = new THREE.BufferAttribute(Z.arr(H.uv, Float32Array), 2);
  const clips = {};
  for (const [name, c] of Object.entries(H.clips)) {
    const frames = nvzFrames(Z, c.pos, c.nor, c.n, H.q).map(([pos, nor]) => {
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uv);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 3); return g;
    });
    clips[name] = { fps: c.fps, once: !!c.once, frames, mg: Z.arr(c.mg, Float32Array), mt: c.mt ? Z.arr(c.mt, Float32Array) : null, ims: [] };
  }
""" + loi[b:]

# ── tiếng, nhạc trong gói
loi = loi.replace("fetch('am/' + n + '.mp3')", "fetch(PU('am/' + n + '.mp3'))")
loi = loi.replace("D.el.src = 'nhac/' + f + '.mp3';", "D.el.src = PU('nhac/' + f + '.mp3');")

# ── phần riêng
rieng = ["// " + "Bạch Đằng 938 · phần riêng của trận, cắm vào bộ máy 2.0.0 tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/tach_bo_may_2.py).",
         "// Mỗi đoạn bắt đầu bằng dòng //@@ sN. Mã chạy chung phạm vi với bộ máy: dùng được hAt, nvPut, scene, THREE… như mã gốc."]
for sid, ts in secs:
    body = "\n".join(ts)
    rieng.append(f"//@@ {sid}\n{body}")
rj = "\n".join(rieng) + "\n"
rj = rj.replace("fetch('am/' + n + '.mp3')", "fetch(PU('am/' + n + '.mp3'))").replace("D.el.src = 'nhac/' + f + '.mp3';", "D.el.src = PU('nhac/' + f + '.mp3');")
rj = re.sub(r"texLoader\.loadAsync\(('[^']*'(?: \+ [\w.]+)?)\)", r"texLoader.loadAsync(PU(\1))", rj)

(KG / "engine" / "2.0.0" / "loi.js").write_text(loi, encoding="utf-8")
P = KG / "packs" / "bach-dang-938"; P.mkdir(parents=True, exist_ok=True)
(P / "rieng.js").write_text(rj, encoding="utf-8")
print(f"loi.js {len(loi)} ký tự · rieng.js {len(rj)} ký tự · {len(secs)} đoạn riêng")

# ══ giao diện: CSS (Bạch Đằng + các lớp Như Nguyệt thêm) và khung HTML lấy chữ từ pack.json
html = (SRC / "index.html").read_text(encoding="utf-8")
css = html[html.index("<style>") + 7:html.index("</style>")]
nnh = (NN.parent / "index.html").read_text(encoding="utf-8")
ncss = nnh[nnh.index("<style>") + 7:nnh.index("</style>")]
bset = set(css.splitlines())
extra = [l for l in ncss.splitlines() if l.strip() and l not in bset and not l.strip().startswith("/*") and "{" in l
         and "body:not(.ready) #splay" not in l]                 # Như Nguyệt ẩn nút Phát tới khi tải xong; Bạch Đằng không có bước đó
css = css + "\n/* ── thêm từ Như Nguyệt 1077 */\n" + "\n".join(extra) + "\n"
(KG / "engine" / "2.0.0" / "sa-ban.css").write_text(css.strip() + "\n", encoding="utf-8")

body = html[html.index('<body class="m-film">') + len('<body class="m-film">'):html.index("<script>\n(function")]
def hr(o, n):
    global body
    if body.count(o) != 1: raise SystemExit(f"khung: không khớp {body.count(o)}: {o[:80]}")
    body = body.replace(o, n)
a = body.index('<div class="c02" id="c02" hidden>'); b = body.index('<div id="card">')
body = body[:a] + "${(UI.extraHtml || '').replace(/\\{BASE\\}/g, B)}\n" + body[b:]
hr('<div class="card" id="gauge" aria-hidden="true">', '<div class="card" id="gauge" aria-hidden="true"${UI.gauge === false ? " hidden" : ""}>')
hr('<div class="eyebrow">Không gian lịch sử</div><h1>Bạch Đằng 938</h1>', '<div class="eyebrow">Không gian lịch sử</div><h1>${e(P.title)}</h1>')
hr('''    <h1>Bạch Đằng 938</h1>
    <p id="sdate">Cuối năm 938 · cửa sông Bạch Đằng</p>
    <span class="tag">TÁI DỰNG MÔ PHỎNG</span>''', '''    <h1>${e(P.title)}</h1>
    <p id="sdate">${e(P.subtitle || "")}</p>
    <span class="tag">${e((P.label || "Tái dựng mô phỏng").toUpperCase())}</span>''')
a = body.index('      <label><input type="checkbox" id="ly-ten" checked>'); b = body.index('      <label><input type="checkbox" id="ly-pin" checked>')
body = body[:a] + '      ${(UI.layers || []).map(([id, t, on]) => `<label><input type="checkbox" id="ly-${e(id)}"${on ? " checked" : ""}> ${e(t)}</label>`).join("\\n      ")}\n' + body[b:]
a = body.index('      <div class="items">') + len('      <div class="items">\n'); b = body.index('      </div>\n      <div class="now" id="legNow">')
body = body[:a] + '        ${(UI.legend || []).map(([c, t, st]) => `<div><i class="${e(c)}"${st ? " style=\\"" + e(st) + "\\"" : ""}></i>${e(t)}</div>`).join("")}\n' + body[b:]
body = re.sub(r'<p class="small muted">Sa bàn tương tác tái dựng mô phỏng[^<]*</p>', '<p class="small muted">${e(UI.legendNote || "")}</p>', body)
hr('<h3>14 cảnh · kịch bản V1</h3>', '<h3>${e(P.storyLabel || "Kịch bản")}</h3>')
hr('<b id="stitle">Kịch bản V1 · 14 cảnh</b>', '<b id="stitle">${e(P.storyLabel || "Kịch bản")}</b>')
a = body.index('      <button data-v="all" class="on">'); b = body.index('    </div>', a)
body = body[:a] + '      ${(P.views || []).map(([k, t], n) => `<button data-v="${e(k)}"${n ? "" : \' class="on"\'}>${e(t)}</button>`).join("\\n      ")}\n' + body[b:]
body = re.sub(r'<select id="role" aria-label="Chọn vai">.*?</select>', '<select id="role" aria-label="Chọn vai">${(P.roles || []).map(([k, t]) => `<option value="${e(k)}">${e(t)}</option>`).join("")}</select>', body)
body = re.sub(r'placeholder="VD: Dời bãi cọc[^"]*"', 'placeholder="${e(UI.notePlaceholder || "VD: Dời mốc sang phía đông 200 m")}"', body)
body = body.replace("`", "\\`")
js = '''// Khung giao diện bộ máy 2.0 (bố cục Bạch Đằng 938). Chữ riêng của trận lấy từ pack.json › ui, views, roles.
const e = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
export function khungHTML(P, B) {
  const UI = P.ui || {};
  return `''' + body + '''`;
}
'''
js = js.replace("\\`<", "`<").replace(">\\`", ">`")   # giữ các template con viết ở trên
(KG / "engine" / "2.0.0" / "khung.js").write_text(js, encoding="utf-8")
print("khung.js, sa-ban.css xong")
