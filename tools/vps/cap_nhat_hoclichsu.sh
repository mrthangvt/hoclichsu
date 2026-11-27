#!/bin/bash
# Tự cập nhật hoclichsu.com trên VPS aaPanel (chạy bằng Cron của aaPanel, mỗi 5 phút).
# GitHub Actions dựng sẵn bản hoàn chỉnh lên nhánh ban-may-chu; script này chỉ tải phần thay đổi về.
# Không có gì mới thì không làm gì. Xem docs/VPS_AAPANEL.md.
WEB=/www/wwwroot/hoclichsu.com          # thư mục website do aaPanel tạo
KHO=/www/hoclichsu.git                  # kho git để NGOÀI thư mục web (không lộ .git ra Internet)
REPO=https://github.com/mrthangvt/hoclichsu.git
NHANH=ban-may-chu

command -v git >/dev/null || { apt-get update -qq && apt-get install -y -qq git; }
[ -d "$WEB" ] || { echo "Chưa có thư mục $WEB — tạo website hoclichsu.com trong aaPanel trước."; exit 1; }
if [ ! -d "$KHO" ]; then
  git init -q --bare "$KHO" && git --git-dir="$KHO" config core.bare false
  git --git-dir="$KHO" remote add origin "$REPO"
fi
G="git --git-dir=$KHO --work-tree=$WEB"
$G fetch -q --depth 1 origin "$NHANH" || { echo "Không tải được nhánh $NHANH (GitHub chưa dựng xong?)"; exit 1; }
MOI=$($G rev-parse FETCH_HEAD)
CU=$($G rev-parse -q --verify HEAD 2>/dev/null)
if [ "$MOI" = "$CU" ]; then exit 0; fi
$G reset -q --hard "$MOI"
# Xóa file cũ không còn trong bản mới, giữ file của aaPanel và chứng chỉ SSL.
$G clean -q -f -d -e .user.ini -e .well-known -e .htaccess
chown -R www:www "$WEB" 2>/dev/null
# Dọn bản cũ trong kho để không đầy ổ.
git --git-dir="$KHO" reflog expire --expire=now --all
git --git-dir="$KHO" gc -q --prune=now
echo "$(date '+%F %T') Đã cập nhật: $($G log -1 --format=%s)"
