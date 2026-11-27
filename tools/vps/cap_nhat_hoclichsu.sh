#!/bin/bash
# Tự cập nhật hoclichsu.com trên VPS aaPanel (Cron aaPanel 5 phút/lần: bash /root/cap_nhat_hoclichsu.sh).
# GitHub Actions dựng sẵn:
#   nhánh ban-may-chu      → trang tĩnh, tải về /www/wwwroot/hoclichsu.com
#   nhánh ban-may-chu-api  → mã máy chủ CMS (/admin, /api/), dựng container Docker hoclichsu-api
# Không có gì mới thì không làm gì. Xem docs/VPS_AAPANEL.md.
REPO=https://github.com/mrthangvt/hoclichsu.git
WEB=/www/wwwroot/hoclichsu.com        # thư mục website do aaPanel tạo
KHO=/www/hoclichsu.git                # kho git để NGOÀI thư mục web (không lộ .git ra Internet)
API=/www/hoclichsu-api
KHO_API=/www/hoclichsu-api.git
DL=/www/hoclichsu-du-lieu             # dữ liệu CMS bền: .env, CSDL, ảnh tải lên
exec 9>/tmp/cap_nhat_hoclichsu.lock; flock -n 9 || exit 0   # tránh hai lần chạy chồng nhau

command -v git >/dev/null || { apt-get update -qq && apt-get install -y -qq git; }

# keo <kho git> <thư mục> <nhánh>: tải bản mới nhất về thư mục; in "moi" nếu có thay đổi.
keo() {
  local K=$1 T=$2 N=$3
  mkdir -p "$T"
  if [ ! -d "$K" ]; then
    git init -q --bare "$K" && git --git-dir="$K" config core.bare false
    git --git-dir="$K" remote add origin "$REPO"
  fi
  local G="git --git-dir=$K --work-tree=$T"
  $G fetch -q --depth 1 origin "$N" || { echo "Không tải được nhánh $N" >&2; return 1; }
  local MOI CU
  MOI=$($G rev-parse FETCH_HEAD); CU=$($G rev-parse -q --verify HEAD 2>/dev/null)
  [ "$MOI" = "$CU" ] && return 0
  $G reset -q --hard "$MOI"
  # Xóa file cũ không còn trong bản mới, giữ file của aaPanel và chứng chỉ SSL.
  $G clean -q -f -d -e .user.ini -e .well-known -e .htaccess
  git --git-dir="$K" reflog expire --expire=now --all; git --git-dir="$K" gc -q --prune=now
  echo moi
}

# 1) Trang tĩnh
[ -d "$WEB" ] || { echo "Chưa có thư mục $WEB — tạo website hoclichsu.com trong aaPanel trước."; exit 1; }
if [ "$(keo "$KHO" "$WEB" ban-may-chu)" = moi ]; then
  chown -R www:www "$WEB" 2>/dev/null
  echo "$(date '+%F %T') Đã cập nhật trang: $(git --git-dir=$KHO log -1 --format=%s)"
fi

# 2) Máy chủ CMS — chỉ khi đã cài bằng tools/vps/cai_admin.sh (có $DL/.env) và máy có Docker.
if [ -f "$DL/.env" ] && command -v docker >/dev/null; then
  if docker compose version >/dev/null 2>&1; then DC="docker compose"; else DC="docker-compose"; fi
  KQ=$(keo "$KHO_API" "$API" ban-may-chu-api)
  if [ "$KQ" = moi ] || [ -z "$(docker ps -q -f name=^hoclichsu-api$)" ]; then
    mkdir -p "$DL/data" "$DL/uploads" "$DL/trang-phuc"
    (cd "$API" && $DC up -d --build --remove-orphans 2>&1 | tail -3)
    docker image prune -f >/dev/null 2>&1
    echo "$(date '+%F %T') Đã dựng lại CMS: $(git --git-dir=$KHO_API log -1 --format=%s)"
  fi
  # Tự cập nhật chính script này theo bản trong repo (ghi file mới rồi đổi tên, an toàn khi đang chạy).
  if [ -f "$API/cap_nhat_hoclichsu.sh" ] && ! cmp -s "$API/cap_nhat_hoclichsu.sh" "$0"; then
    cp "$API/cap_nhat_hoclichsu.sh" "$0.moi" && mv -f "$0.moi" "$0" && echo "Đã cập nhật script cập nhật."
  fi
fi
