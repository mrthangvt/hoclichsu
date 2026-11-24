#!/usr/bin/env python3
"""Dựng bộ máy sa bàn 2.1.0 (họ Bạch Đằng) và phần riêng rieng.js của hai gói bach-dang-938, nhu-nguyet-1077.

Nguồn: mã Bạch Đằng 938 V1.2 và Như Nguyệt 1077 V1.6 (hai bản artifact cùng dòng mã).
Cách tách (docs/KHUNG_SA_BAN.md mục 4):
1. Sửa giống nhau ở cả hai nguồn: three.js tự host, mọi đường dẫn tệp đi qua PU() (fetch, TextureLoader, Audio),
   nhân vật đọc tệp .nvz thay cho nv_*.json.
2. Chia mỗi app.js thành các khối cấp cao nhất (hàm, hằng, phần có tiêu đề).
3. Khối giống hệt nhau ở hai trận, theo cùng thứ tự (dãy con chung dài nhất) → phần chung engine/2.1.0/loi.js.
   Giữa hai khối chung liên tiếp là một chỗ cắm /*@@RIENG:sN@@*/; mỗi gói điền chỗ đó bằng các khối riêng của mình
   (có thể rỗng) trong packs/<id>/rieng.js, đoạn //@@ sN. Thứ tự chạy trong mỗi trận giữ nguyên như mã gốc.
4. Khung HTML (khung.js) và CSS lấy từ bố cục Bạch Đằng; chữ, lớp, chú giải, góc nhìn, thanh mực nước của từng trận
   lấy từ pack.json › ui.

Dùng:  python3 vietsu/tools/sa_ban/tach_bo_may_2.py <thư mục mã Bạch Đằng> <thư mục mã Như Nguyệt>
"""
import difflib, re, shutil, sys
from pathlib import Path

KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
VER = "2.1.0"
SRC = {"bach-dang-938": Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/bdsrc"),
       "nhu-nguyet-1077": Path(sys.argv[2] if len(sys.argv) > 2 else "/tmp/nnzip/x")}
TEN = {"bach-dang-938": "Bạch Đằng 938", "nhu-nguyet-1077": "Như Nguyệt 1077"}
E = KG / "engine" / VER

PREAMBLE = f"""// Bộ máy sa bàn Việt Sử {VER} (họ Bạch Đằng) — docs/KHUNG_SA_BAN.md. Tách bằng tools/sa_ban/tach_bo_may_2.py từ
// Bạch Đằng 938 V1.2 và Như Nguyệt 1077 V1.6: ở đây là các khối mã giống hệt nhau ở hai trận; phần riêng của từng trận
// ở packs/<id>/rieng.js, cắm vào các chỗ /*@@RIENG:sN@@*/.
import * as THREE from '@@ENGINE@@vendor/three/three.module.min.js';
import {{ OrbitControls }} from '@@ENGINE@@vendor/three/addons/controls/OrbitControls.js';
const PACK = window.__SB.pack, PBASE = window.__SB.base;
const DUONG = [['data/meta.json', 'terrain/meta.json'], ['data/inst.json', 'placement.json'], ['data/story.json', 'story.json'],
  ['data/height.png', 'terrain/height.png'], ['data/color.jpg', 'terrain/color.jpg'], ['data/', 'props/'], ['models/', 'units/'],
  ['nhanvat/', 'units/'], ['am/', 'audio/'], ['nhac/', 'audio/nhac/']];
const PU = (f) => {{ for (const [a, b] of DUONG) if (f.startsWith(a)) {{ f = b + f.slice(a.length); break; }} return new URL(f, PBASE).href; }};   // tệp trong gói
const fetch = (u, o) => globalThis.fetch(typeof u === 'string' ? PU(u) : u, o);                // mọi fetch của sa bàn đọc trong gói
THREE.DefaultLoadingManager.setURLModifier((u) => (/^(blob|data):/.test(u) ? u : PU(u)));     // ảnh, vân bề mặt cũng vậy
"""

NVLOAD = """async function nvzRead(url) {                  // gzip("NVZ1" + u32 + JSON đầu + khối nhị phân)
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
  const Z = await nvzRead('nhanvat/' + kind + '.nvz'), H = Z.H, j = H;   // j: tên cũ của dữ liệu nhân vật trong mã gốc
  const map = await texLoader.loadAsync('nhanvat/' + kind + '.jpg'); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
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
"""

def sua(s, ten):
    """Bước 1: sửa giống nhau ở mọi nguồn."""
    s = re.sub(r"^import \{? ?\*? ?(?:as THREE|OrbitControls ?\}) from '[^']+';\n", "", s, flags=re.M)
    if "import " in s.split("\n", 5)[0]: raise SystemExit(ten + ": còn dòng import")
    a = s.index("async function nvLoad(kind, cap) {"); b = s.index("  // bản soi gương", a)
    s = s[:a] + NVLOAD + s[b:]
    s = re.sub(r"(\.src = )('(?:data|models|nhanvat|am|nhac)/[^;]*);", r"\1PU(\2);", s)   # Audio, <img> không đi qua fetch
    return s

def blocks(s):
    out, cur = [], None
    for l in s.split("\n"):
        m = re.match(r"^(?:async )?function (\w+)|^(?:const|let|var) ([\w$]+)|^// -{10,} (.*)", l)
        if m:
            cur = [m.group(1) or m.group(2) or ("#" + (m.group(3) or "")[:40]), []]; out.append(cur)
        elif cur is None:
            cur = ["#dau", []]; out.append(cur)
        cur[1].append(l)
    return [(n, "\n".join(t)) for n, t in out]

B = {k: blocks(sua(p.joinpath("app.js").read_text(encoding="utf-8"), k)) for k, p in SRC.items()}
ka, kb = list(SRC)
A_, B_ = B[ka], B[kb]
sm = difflib.SequenceMatcher(None, [n + "\0" + t for n, t in A_], [n + "\0" + t for n, t in B_], autojunk=False)
core, rieng, ia, ib, n = [PREAMBLE.rstrip("\n")], {ka: [], kb: []}, 0, 0, 0
for m in sm.get_matching_blocks():
    ga, gb = A_[ia:m.a], B_[ib:m.b]
    if ga or gb:
        n += 1; sid = f"s{n}"; core.append(f"/*@@RIENG:{sid}@@*/")
        rieng[ka].append((sid, "\n".join(t for _, t in ga))); rieng[kb].append((sid, "\n".join(t for _, t in gb)))
    core += [t for _, t in A_[m.a:m.a + m.size]]
    ia, ib = m.a + m.size, m.b + m.size
loi = "\n".join(core) + "\n"
E.mkdir(parents=True, exist_ok=True)
(E / "loi.js").write_text(loi, encoding="utf-8")
for k, secs in rieng.items():
    head = [f"// {TEN[k]} · phần riêng của trận, cắm vào bộ máy {VER} tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/tach_bo_may_2.py).",
            "// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy."]
    txt = "\n".join(head + [f"//@@ {sid}\n{body}" for sid, body in secs]) + "\n"
    (KG / "packs" / k).mkdir(parents=True, exist_ok=True)
    (KG / "packs" / k / "rieng.js").write_text(txt, encoding="utf-8")
    print(f"{k}/rieng.js {len(txt)} ký tự")
chung = sum(len(t) for t in core[1:] if not t.startswith("/*@@"))
print(f"loi.js {len(loi)} ký tự ({chung} ký tự mã chung của hai trận) · {n} chỗ cắm")

# ══ giao diện: CSS (Bạch Đằng + các lớp Như Nguyệt thêm) và khung HTML lấy chữ từ pack.json
bdh = (SRC[ka] / "index.html").read_text(encoding="utf-8"); nnh = (SRC[kb] / "index.html").read_text(encoding="utf-8")
css = bdh[bdh.index("<style>") + 7:bdh.index("</style>")]
ncss = nnh[nnh.index("<style>") + 7:nnh.index("</style>")]
bset = set(css.splitlines())
extra = [l for l in ncss.splitlines() if l.strip() and l not in bset and not l.strip().startswith("/*") and "{" in l
         and "body:not(.ready) #splay" not in l]                 # quy tắc riêng Như Nguyệt: pack.json › ui.css
THAY = "body.cancanh #labels .lbl:not(.pin) { opacity: 0; transition: opacity .3s; }"   # Như Nguyệt giữ tên tướng (.hero) khi cận cảnh;
if css.count(THAY) != 1: raise SystemExit("CSS: không thấy quy tắc cancanh")      # Bạch Đằng không có nhãn .hero nên dùng chung được
css = css.replace(THAY, THAY.replace(":not(.pin)", ":not(.pin):not(.hero)"))
extra = [l for l in extra if l not in css]
css = css + "\n/* ── thêm từ Như Nguyệt 1077 */\n" + "\n".join(extra) + "\n"
(E / "sa-ban.css").write_text(css.strip() + "\n", encoding="utf-8")

body = bdh[bdh.index('<body class="m-film">') + len('<body class="m-film">'):bdh.index("<script>\n(function")]
def hr(o, nw):
    global body
    if body.count(o) != 1: raise SystemExit(f"khung: không khớp {body.count(o)}: {o[:80]}")
    body = body.replace(o, nw)
a = body.index('<div class="c02" id="c02" hidden>'); b = body.index('<div id="card">')
body = body[:a] + "${UI.css ? '<style>' + UI.css + '</style>' : ''}\n${(UI.extraHtml || '').replace(/\\{BASE\\}/g, B)}\n" + body[b:]
hr('<div class="card" id="gauge" aria-hidden="true">', '<div class="card" id="gauge" aria-hidden="true"${UI.gauge === false ? " hidden" : ""}>')
hr('<div class="eyebrow">Không gian lịch sử</div><h1>Bạch Đằng 938</h1>', '<div class="eyebrow">Không gian lịch sử</div><h1>${e(P.title)}</h1>')
hr('<div class="track"><div class="fill" id="fill"></div></div><small id="ld-step">Đang tải địa hình…</small>',
   '<div class="track" id="ldtrack"><div class="fill" id="fill"></div></div><small id="ld-step">Đang tải địa hình…</small>${UI.loaderHtml || ""}')
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
body = re.sub(r'<span class="lbltxt">Mực nước</span><input id="tide" type="range" min="-2.6" max="2.2" step="0.05" value="2.2" aria-label="Mực nước"><button class="chip on" id="btide" aria-pressed="true">Triều theo cảnh</button>',
              '<span class="lbltxt">${e(TD.label || "Mực nước")}</span><input id="tide" type="range" min="${TD.min ?? -2}" max="${TD.max ?? 2}" step="${TD.step ?? 0.05}" value="${TD.value ?? 0}" aria-label="Mực nước"><button class="chip on" id="btide" aria-pressed="true">${e(TD.button || "Theo cảnh")}</button>', body)
if "TD.label" not in body: raise SystemExit("khung: không thấy thanh mực nước")
body = body.replace("`", "\\`")
js = f'''// Khung giao diện bộ máy {VER} (bố cục Bạch Đằng 938). Chữ riêng của trận lấy từ pack.json › ui, views, roles.
const e = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }})[c]);
export function khungHTML(P, B) {{
  const UI = P.ui || {{}}, TD = UI.tide || {{}};
  return `''' + body + '''`;
}
'''
js = js.replace("\\`<", "`<").replace(">\\`", ">`")   # giữ các template con viết ở trên
(E / "khung.js").write_text(js, encoding="utf-8")

# ══ trang ghép và three.js: lấy từ bản 2.0.0 (nếu còn) hoặc bản đang có
old = KG / "engine" / "2.0.0"
html = (E / "sa-ban.html") if (E / "sa-ban.html").exists() else (old / "sa-ban.html")
h = html.read_text(encoding="utf-8").replace("2.0.0", VER)
(E / "sa-ban.html").write_text(h, encoding="utf-8")
if not (E / "vendor").exists(): shutil.copytree(old / "vendor", E / "vendor")
print("khung.js, sa-ban.css, sa-ban.html xong")
