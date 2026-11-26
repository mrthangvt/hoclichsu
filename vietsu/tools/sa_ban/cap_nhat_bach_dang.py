#!/usr/bin/env python3
"""Bộ máy 2.1.1 (họ Bạch Đằng) + phần riêng rieng.js của gói bach-dang-938 bản V1.3 (lời dẫn thu âm, 26/11/2026).

Như Nguyệt 1077 vẫn chạy bộ máy 2.1.0 (không đổi). Cách làm giống tools/sa_ban/tach_bo_may_2.py, khác ở chỗ:
- nguồn Như Nguyệt là mã đang chạy trong repo (engine/2.1.0/loi.js ghép với packs/nhu-nguyet-1077/rieng.js), nên phần
  chung mới vẫn là "khối giống hệt nhau ở hai trận";
- chỉ ghi engine/2.1.1/ và packs/bach-dang-938/rieng.js; three.js dùng chung thư mục engine/2.1.0/vendor/.
Dùng:  python3 vietsu/tools/sa_ban/cap_nhat_bach_dang.py <thư mục mã Bạch Đằng có app.js, index.html>
Sau đó chép tài nguyên bằng chuyen_bach_dang.py.
"""
import difflib, re, sys
from pathlib import Path

KG = Path(__file__).resolve().parents[2] / "static" / "khong-gian"
VER = "2.1.1"
BD = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/bdsrc")
E = KG / "engine" / VER
E0 = KG / "engine" / "2.1.0"

PREAMBLE = f"""// Bộ máy sa bàn Học Lịch Sử {VER} (họ Bạch Đằng) — docs/KHUNG_SA_BAN.md. Tách bằng tools/sa_ban/cap_nhat_bach_dang.py từ
// Bạch Đằng 938 V1.3 (lời dẫn thu âm) và Như Nguyệt 1077 (bộ máy 2.1.0 + rieng.js): ở đây là các khối mã giống hệt nhau ở hai trận; phần riêng của từng trận
// ở packs/<id>/rieng.js, cắm vào các chỗ /*@@RIENG:sN@@*/.
import * as THREE from '@@ENGINE@@../2.1.0/vendor/three/three.module.min.js';
import {{ OrbitControls }} from '@@ENGINE@@../2.1.0/vendor/three/addons/controls/OrbitControls.js';
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


def ghep(loi, rieng):
    """Ghép như sa-ban.html: thay /*@@RIENG:sN@@*/ bằng đoạn //@@ sN của rieng.js."""
    doan = {}
    for m in re.split(r"^//@@ ", rieng, flags=re.M)[1:]:
        k = m[:m.index("\n")].strip(); doan[k] = m[m.index("\n") + 1:]
    return re.sub(r"/\*@@RIENG:(s\d+)@@\*/", lambda x: doan.get(x.group(1), ""), loi)

# ══ nguồn Như Nguyệt: mã đang chạy, bỏ phần mở đầu của bộ máy (import, PU, fetch) rồi đặt lại dòng import như mã gốc
loi0 = (E0 / "loi.js").read_text(encoding="utf-8")
nn = ghep(loi0, (KG / "packs" / "nhu-nguyet-1077" / "rieng.js").read_text(encoding="utf-8"))
mk = "THREE.DefaultLoadingManager.setURLModifier("
cut = nn.index("\n", nn.index(mk)) + 1
nn = "import * as THREE from 'three';\nimport { OrbitControls } from 'three/addons/controls/OrbitControls.js';\n" + nn[cut:]
bd = (BD / "app.js").read_text(encoding="utf-8")
A_ = blocks(sua(bd, "bach-dang-938")); B_ = blocks(sua(nn, "nhu-nguyet-1077"))
sm = difflib.SequenceMatcher(None, [n + "\0" + t for n, t in A_], [n + "\0" + t for n, t in B_], autojunk=False)
core, rieng, ia, ib, n = [PREAMBLE.rstrip("\n")], [], 0, 0, 0
for m in sm.get_matching_blocks():
    ga = A_[ia:m.a]
    if ga or B_[ib:m.b]:
        n += 1; sid = f"s{n}"; core.append(f"/*@@RIENG:{sid}@@*/"); rieng.append((sid, "\n".join(t for _, t in ga)))
    core += [t for _, t in A_[m.a:m.a + m.size]]
    ia, ib = m.a + m.size, m.b + m.size
loi = "\n".join(core) + "\n"
E.mkdir(parents=True, exist_ok=True)
(E / "loi.js").write_text(loi, encoding="utf-8")
head = ["// Bạch Đằng 938 · phần riêng của trận, cắm vào bộ máy 2.1.1 tại các chỗ /*@@RIENG:sN@@*/ (tools/sa_ban/cap_nhat_bach_dang.py).",
        "// Mỗi đoạn bắt đầu bằng dòng //@@ sN (đoạn rỗng: trận này không có gì ở chỗ đó). Mã chạy chung phạm vi với bộ máy."]
txt = "\n".join(head + [f"//@@ {sid}\n{b}" for sid, b in rieng]) + "\n"
(KG / "packs" / "bach-dang-938" / "rieng.js").write_text(txt, encoding="utf-8")
# kiểm: ghép lại phải ra đúng mã Bạch Đằng (sau bước sửa chung)
mau = PREAMBLE.rstrip("\n") + "\n" + "\n".join(t for _, t in A_) + "\n"
bo = lambda s: [l for l in s.splitlines() if l.strip()]
assert bo(ghep(loi, txt)) == bo(mau), "ghép lại không khớp mã gốc"
chung = sum(len(t) for t in core[1:] if not t.startswith("/*@@"))
print(f"loi.js {len(loi)} ký tự ({chung} chung với Như Nguyệt) · {n} chỗ cắm · rieng.js {len(txt)} ký tự")

# ══ CSS: Bạch Đằng V1.3 + các quy tắc Như Nguyệt đã thêm ở 2.1.0
bdh = (BD / "index.html").read_text(encoding="utf-8")
css = bdh[bdh.index("<style>") + 7:bdh.index("</style>")]
THAY = "body.cancanh #labels .lbl:not(.pin) { opacity: 0; transition: opacity .3s; }"
if THAY in css: css = css.replace(THAY, THAY.replace(":not(.pin)", ":not(.pin):not(.hero)"))
css0 = (E0 / "sa-ban.css").read_text(encoding="utf-8"); MK = "/* ── thêm từ Như Nguyệt 1077 */"
extra = [l for l in css0[css0.index(MK) + len(MK):].splitlines() if l.strip() and l not in css]
css = css.replace("(Việt Sử)", "(Học Lịch Sử)") + "\n" + MK + "\n" + "\n".join(extra) + "\n"
(E / "sa-ban.css").write_text(css.strip() + "\n", encoding="utf-8")

# ══ khung HTML: lấy chữ riêng từ pack.json
body = bdh[bdh.index('<body class="m-film">') + len('<body class="m-film">'):bdh.index("<script>\n(function")]
def hr(o, nw):
    global body
    if body.count(o) != 1: raise SystemExit(f"khung: không khớp {body.count(o)}: {o[:80]}")
    body = body.replace(o, nw)
a = body.index('<div class="c02" id="c02" hidden>'); b = body.index('<div id="card">')
body = body[:a] + "${UI.css ? '<style>' + UI.css + '</style>' : ''}\n${(UI.extraHtml || '').replace(/\\{BASE\\}/g, B)}\n" + body[b:]
hr('<div class="card" id="gauge" aria-hidden="true">', '<div class="card" id="gauge" aria-hidden="true"${UI.gauge === false ? " hidden" : ""}>')
body = body.replace("Không gian lịch sử · Việt Sử", "Không gian lịch sử · Học Lịch Sử")
hr('<h1>Bạch Đằng 938</h1>\n  <div class="track">', '<h1>${e(P.title)}</h1>\n  <div class="track">')
hr('<div class="track"><div class="fill" id="fill"></div></div><small id="ld-step">Đang tải địa hình…</small>',
   '<div class="track" id="ldtrack"><div class="fill" id="fill"></div></div><small id="ld-step">Đang tải địa hình…</small>${UI.loaderHtml || ""}')
hr("""    <h1>Bạch Đằng 938</h1>
    <p id="sdate">Cuối năm 938 · cửa sông Bạch Đằng</p>
    <span class="tag">TÁI DỰNG MÔ PHỎNG</span>""", """    <h1>${e(P.title)}</h1>
    <p id="sdate">${e(P.subtitle || "")}</p>
    <span class="tag">${e((P.label || "Tái dựng mô phỏng").toUpperCase())}</span>""")
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
body = re.sub(r'<small id="walkhelp" class="muted" hidden>[^<]*</small>', '<small id="walkhelp" class="muted" hidden>${e(UI.walkHelp || "Phím ảo bên trái (hoặc W A S D / mũi tên) để đi · giữ Shift để chạy")}</small>', body)
body = body.replace("`", "\\`")
js = f'''// Khung giao diện bộ máy {VER} (bố cục Bạch Đằng 938 V1.3). Chữ riêng của trận lấy từ pack.json › ui, views, roles.
const e = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }})[c]);
export function khungHTML(P, B) {{
  const UI = P.ui || {{}}, TD = UI.tide || {{}};
  return `''' + body + '''`;
}
'''
js = js.replace("\\`<", "`<").replace(">\\`", ">`")
(E / "khung.js").write_text(js, encoding="utf-8")
h = (E0 / "sa-ban.html").read_text(encoding="utf-8").replace("2.1.0", VER)
(E / "sa-ban.html").write_text(h, encoding="utf-8")
print("engine/2.1.1: loi.js, khung.js, sa-ban.css, sa-ban.html")
