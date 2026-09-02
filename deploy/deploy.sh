#!/usr/bin/env bash
# 构建前端并同步到服务器。
#
#   ./deploy/deploy.sh root@107.149.92.201
#
# 需要已经配好密钥登录（服务器的 authorized_keys 里有你的公钥）。
set -euo pipefail

TARGET="${1:?用法: ./deploy/deploy.sh user@host}"
REMOTE_DIR="/var/www/dope-website"

echo "==> 构建前端"
npm --prefix frontend ci
npm --prefix frontend run build

echo "==> 同步到 $TARGET:$REMOTE_DIR"
# --delete 会清掉服务器上多余的旧文件，避免上一版的残留一直留着
rsync -avz --delete \
    frontend/dist/ \
    "$TARGET:$REMOTE_DIR/"

echo "==> 完成。检查一下："
echo "    curl -I http://${TARGET#*@}/"
