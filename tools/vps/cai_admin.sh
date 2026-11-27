#!/bin/bash
# Cài CMS /admin cho hoclichsu.com trên VPS aaPanel — chạy MỘT lần trong Terminal của aaPanel:
#   curl -fsSL https://raw.githubusercontent.com/mrthangvt/hoclichsu/main/tools/vps/cai_admin.sh -o /root/cai_admin.sh && bash /root/cai_admin.sh
# Tạo thư mục dữ liệu bền + mã quản trị, dựng container hoclichsu-api (127.0.0.1:8010).
# Sau đó dán khối cấu hình Nginx (docs/VPS_AAPANEL.md) vào Website → hoclichsu.com → Config.
set -e
DL=/www/hoclichsu-du-lieu
CONG=8010

command -v docker >/dev/null || { echo "Chưa có Docker. Vào aaPanel → Docker → Install, xong chạy lại lệnh này."; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker chưa chạy. Vào aaPanel → Docker để bật, xong chạy lại."; exit 1; }
if ! docker ps -q -f name=^hoclichsu-api$ | grep -q . && ss -ltn | grep -q ":$CONG "; then
  echo "Cổng $CONG đang bị chương trình khác dùng — báo lại để đổi cổng."; exit 1
fi

mkdir -p "$DL/data" "$DL/uploads" "$DL/trang-phuc"
chmod 700 "$DL"
MOI_TAO=0
if [ ! -f "$DL/.env" ]; then
  MA=$(head -c 30 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32)
  cat > "$DL/.env" <<EOF
SITE_URL=https://hoclichsu.com
ALLOWED_HOSTS=hoclichsu.com,www.hoclichsu.com,127.0.0.1,localhost
PORT=$CONG
VIETSU_ADMIN_TOKEN=$MA
# Muốn dùng nút "AI viết nháp" trong /admin thì thêm: OPENAI_API_KEY=...
EOF
  chmod 600 "$DL/.env"
  MOI_TAO=1
fi

curl -fsSL https://raw.githubusercontent.com/mrthangvt/hoclichsu/main/tools/vps/cap_nhat_hoclichsu.sh -o /root/cap_nhat_hoclichsu.sh
echo "Đang dựng máy chủ CMS (lần đầu 1–3 phút)…"
bash /root/cap_nhat_hoclichsu.sh

for i in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:$CONG/api/health" >/dev/null 2>&1 && break
  sleep 2
done
if curl -fsS "http://127.0.0.1:$CONG/api/health" >/dev/null 2>&1; then
  echo
  echo "=== CMS đã chạy ở 127.0.0.1:$CONG ==="
  if [ "$MOI_TAO" = 1 ]; then
    echo "MÃ QUẢN TRỊ (lưu lại cẩn thận, dùng để đăng nhập https://hoclichsu.com/admin):"
    echo "    $MA"
  else
    echo "Mã quản trị giữ nguyên như cũ (xem trong $DL/.env, dòng VIETSU_ADMIN_TOKEN)."
  fi
  echo "Bước tiếp: dán khối cấu hình Nginx vào aaPanel → Website → hoclichsu.com → Config (docs/VPS_AAPANEL.md)."
else
  echo "CMS chưa chạy được. Xem lỗi: docker logs --tail 30 hoclichsu-api"
  exit 1
fi
