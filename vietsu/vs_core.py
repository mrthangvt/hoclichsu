"""Học Lịch Sử V3.8 — cấu hình, cơ sở dữ liệu, xác thực và tiện ích dùng chung."""
from __future__ import annotations

import hmac
import json
import os
import re
import sqlite3
import threading
import time
import unicodedata
from collections import defaultdict, deque
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from fastapi import HTTPException, Request

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
STATIC = BASE / "static"
UPLOADS = STATIC / "uploads"
VERSION = "4.6.0"


def _load_dotenv() -> None:
    """Đọc file .env cạnh main.py (nếu có) mà không cần thư viện ngoài.
    Biến môi trường đã đặt sẵn (systemd, aaPanel…) luôn được ưu tiên."""
    env = BASE / ".env"
    if not env.is_file():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()

DB_PATH = Path(os.getenv("VIETSU_DB", str(DATA / "vietsucms.sqlite3")))
# Máy chủ Docker (VPS hoclichsu.com): các file JSON mà CMS sửa được để ở thư mục bền VIETSU_DU_LIEU,
# không bị ghi đè khi dựng lại container. Lần đầu chép từ data/ của mã nguồn. Không đặt biến → dùng data/ như cũ.
DU_LIEU = Path(os.environ["VIETSU_DU_LIEU"]) if os.getenv("VIETSU_DU_LIEU") else None


def tep_du_lieu(ten: str) -> Path:
    if DU_LIEU is None:
        return DATA / ten
    p = DU_LIEU / ten
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        goc = DATA / ten
        if goc.is_file():
            import shutil
            shutil.copy2(goc, p)
    return p
SITE_URL = os.getenv("SITE_URL", "http://127.0.0.1:8000").rstrip("/")
ADMIN_TOKEN = os.getenv("VIETSU_ADMIN_TOKEN", "")
REVIEW_TOKEN = os.getenv("VIETSU_REVIEW_TOKEN", "")
# V5.9.2: bỏ bước thẩm định riêng — mã quản trị được xuất bản (đặt VIETSU_ADMIN_CAN_PUBLISH=0 để bật lại).
ADMIN_CAN_PUBLISH = os.getenv("VIETSU_ADMIN_CAN_PUBLISH", "1") == "1"
ENABLE_DOCS = os.getenv("VIETSU_ENABLE_DOCS", "0") == "1"
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "").split(",") if h.strip()]
MIN_TOKEN_LEN = 24
MAX_BODY_BYTES = int(os.getenv("VIETSU_MAX_BODY_MB", "8")) * 1024 * 1024

_write_lock = threading.RLock()


# ---------------------------------------------------------------- helpers
def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFD", (value or "").lower()).replace("đ", "d")
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    return re.sub(r"(^-+|-+$)", "", re.sub("[^a-z0-9]+", "-", value))[:120] or "bai-viet"


SAFE_URL_RE = re.compile(r"^(https://[^\s\"'<>`\\]{3,1000}|/(?!/)[^\s\"'<>`\\]{0,500})$")


def is_safe_url(value: str, allow_relative: bool = True) -> bool:
    """https://… hoặc đường dẫn nội bộ /… ; không có dấu nháy, khoảng trắng, < >."""
    if not value:
        return False
    if not SAFE_URL_RE.match(value):
        return False
    if value.startswith("/") and not allow_relative:
        return False
    if value.startswith("https://"):
        host = urlparse(value).hostname
        return bool(host and "." in host)
    return True


def clean_url_list(urls: list[str], limit: int = 30) -> list[str]:
    out = []
    for u in urls or []:
        u = str(u).strip()
        if not u:
            continue
        if not (u.startswith("https://") or u.startswith("http://")) or not SAFE_URL_RE.match(u.replace("http://", "https://", 1)):
            raise HTTPException(422, f"URL nguồn không hợp lệ: {u[:80]}")
        out.append(u)
    return list(dict.fromkeys(out))[:limit]


def site_is_public() -> bool:
    """Không cho phép localhost/bản thử nghiệm bị lập chỉ mục."""
    parsed = urlparse(SITE_URL)
    return parsed.scheme in ("http", "https") and bool(parsed.hostname) and parsed.hostname not in (
        "localhost", "127.0.0.1", "0.0.0.0", "::1")


# ------------------------------------------------------------- JSON files
_json_cache: dict[str, tuple[float, object]] = {}


def read_json(path: Path, default=None):
    """Đọc JSON có cache theo mtime — tránh đọc lại file lớn ở mỗi request."""
    try:
        mtime = path.stat().st_mtime
    except OSError:
        return default
    key = str(path)
    hit = _json_cache.get(key)
    if hit and hit[0] == mtime:
        return json.loads(json.dumps(hit[1])) if isinstance(hit[1], (dict, list)) else hit[1]
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default
    _json_cache[key] = (mtime, obj)
    return json.loads(json.dumps(obj))


def write_json(path: Path, data) -> None:
    """Ghi nguyên tử (file tạm + replace) và khóa luồng để không hỏng dữ liệu khi ghi đồng thời."""
    with _write_lock:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(path)
        _json_cache.pop(str(path), None)


# --------------------------------------------------------------- database
@contextmanager
def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=15)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    con.execute("PRAGMA busy_timeout = 15000")
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def init_db_pragmas() -> None:
    with db() as con:
        try:
            con.execute("PRAGMA journal_mode = WAL")
        except sqlite3.DatabaseError:
            pass


# ------------------------------------------------------------ rate limits
class RateLimiter:
    """Giới hạn số request theo IP trong cửa sổ trượt (bộ nhớ trong — đủ cho 1 tiến trình)."""

    def __init__(self, limit: int, window: float):
        self.limit, self.window = limit, window
        self.hits: dict[str, deque] = defaultdict(deque)
        self.lock = threading.Lock()

    def hit(self, key: str) -> bool:
        t = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and t - q[0] > self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(t)
            if len(self.hits) > 20000:  # chống phình bộ nhớ
                for k in list(self.hits)[:5000]:
                    if not self.hits[k] or t - self.hits[k][-1] > self.window:
                        self.hits.pop(k, None)
            return True

    def count(self, key: str) -> int:
        t = time.monotonic()
        with self.lock:
            q = self.hits.get(key) or deque()
            return sum(1 for x in q if t - x <= self.window)


api_limiter = RateLimiter(int(os.getenv("VIETSU_RATE_PER_MIN", "240")), 60)
write_limiter = RateLimiter(60, 60)
ai_limiter = RateLimiter(10, 3600)
auth_fail_limiter = RateLimiter(10, 900)


def client_ip(request: Request | None) -> str:
    """IP người dùng. Chỉ tin X-Real-IP / X-Forwarded-For khi request đến từ reverse proxy trên chính máy chủ
    (nginx/aaPanel → 127.0.0.1), tránh bị giả mạo header từ Internet."""
    if request is None or request.client is None:
        return "unknown"
    peer = request.client.host or "unknown"
    if peer in ("127.0.0.1", "::1", "localhost"):
        real = (request.headers.get("x-real-ip") or "").strip()
        if real:
            return real[:64]
        xff = [x.strip() for x in (request.headers.get("x-forwarded-for") or "").split(",") if x.strip()]
        if xff:
            return xff[-1][:64]
    return peer


# ---------------------------------------------------------------- auth
def _token_ok(given: str, expected: str) -> bool:
    return bool(expected) and len(expected) >= MIN_TOKEN_LEN and hmac.compare_digest(
        given.encode("utf-8"), expected.encode("utf-8"))


def require_role(token: str | None, reviewer: bool = False, request: Request | None = None) -> str:
    """Trả về 'reviewer' hoặc 'admin'. Chặn dò mã: 10 lần sai / 15 phút / IP."""
    ip = client_ip(request)
    if not ADMIN_TOKEN or len(ADMIN_TOKEN) < MIN_TOKEN_LEN:
        raise HTTPException(503, f"Đặt VIETSU_ADMIN_TOKEN (tối thiểu {MIN_TOKEN_LEN} ký tự) trong file .env trên máy chủ.")
    if auth_fail_limiter.count(ip) >= auth_fail_limiter.limit:
        raise HTTPException(429, "Nhập sai mã quá nhiều lần. Thử lại sau 15 phút.")
    if not token:
        raise HTTPException(401, "Thiếu mã quản trị.")
    token = token.strip()
    is_reviewer = _token_ok(token, REVIEW_TOKEN)
    is_admin = _token_ok(token, ADMIN_TOKEN)
    if not (is_reviewer or is_admin):
        auth_fail_limiter.hit(ip)
        raise HTTPException(403, "Mã quản trị không hợp lệ.")
    if request is not None and not write_limiter.hit("w:" + ip):
        raise HTTPException(429, "Thao tác quá nhanh, vui lòng chờ một phút.")
    if reviewer and not is_reviewer and not ADMIN_CAN_PUBLISH:
        raise HTTPException(403, "Chỉ mã thẩm định (VIETSU_REVIEW_TOKEN) mới được công bố.")
    return "reviewer" if is_reviewer else "admin"


# -------------------------------------------------------------- images
IMAGE_TYPES = [
    (b"\x89PNG\r\n\x1a\n", ".png", "image/png"),
    (b"\xff\xd8\xff", ".jpg", "image/jpeg"),
]


def sniff_image(blob: bytes) -> tuple[str, str]:
    for magic, ext, mime in IMAGE_TYPES:
        if blob.startswith(magic):
            return ext, mime
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        return ".webp", "image/webp"
    raise HTTPException(415, "Chỉ nhận ảnh PNG, JPG hoặc WebP")


def decode_image_data(data: str, max_bytes: int) -> tuple[bytes, str, str]:
    import base64
    raw = (data or "").split(",", 1)[-1].strip()
    try:
        blob = base64.b64decode(raw, validate=True)
    except Exception:
        raise HTTPException(400, "Ảnh base64 không hợp lệ")
    if len(blob) < 50:
        raise HTTPException(400, "Ảnh rỗng")
    if len(blob) > max_bytes:
        raise HTTPException(413, f"Ảnh tối đa {max_bytes / 1_000_000:.1f} MB")
    ext, mime = sniff_image(blob)
    return blob, ext, mime
