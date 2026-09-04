#!/usr/bin/env bash
#
# 重装系统之后，把服务器恢复到"CI 能接手"的状态。
#
# CI 只做一件事：把 frontend/dist/ rsync 到 /var/www/dope-website/。
# 它不装 nginx、不写 vhost、不签证书、不建目录 —— 那些都是这个脚本干的。
#
# 用法（在服务器上，root）：
#   scp -r deploy/ root@<IP>:/tmp/            # 本机执行
#   ssh root@<IP> 'bash /tmp/deploy/bootstrap.sh'
#
# 同目录下如果放了 acme.sh-backup.tar.gz，就直接恢复原来的证书，
# 不重新签发 —— Let's Encrypt 对"同一组域名重复签发"有一周 5 张的配额，
# 反复重装很容易撞上，撞上就是几天没有 HTTPS。而 .dev 是 HSTS 预加载域，
# 没有 HTTPS 等于整个站打不开，不是降级而是全挂。
set -euo pipefail

DOMAIN=l9k.dev
WEBROOT=/var/www/dope-website
ACMEROOT=/var/www/acme
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "要用 root 跑"
[ -f "$HERE/nginx.conf" ] || die "同目录下找不到 nginx.conf，把整个 deploy/ 传上来"

# ---------------------------------------------------------------- 1. nginx
say "装 nginx（用 nginx.org 官方源）"
# 不能用发行版自带的：
#   - Debian 12 / Ubuntu 24.04 自带 1.22 / 1.24，而 nginx.conf 里的
#     `http2 on;` 要 1.25.1 才有，配置会直接起不来
#   - 它们的 nginx 跑在 www-data 下，而 CI 里写死了 chown nginx:nginx
command -v apt-get >/dev/null || die "这个脚本只写了 apt（Debian / Ubuntu）。
换了别的发行版告诉我，我补上对应分支 —— 别在这儿凭感觉改，
nginx 源的路径和用户名都不一样。"

. /etc/os-release
apt-get update -qq
# cron 不是想当然就有的：Debian 13 的最小镜像不装它，而 acme.sh 的
# --install-cronjob 是往 crontab 里写的 —— 没有 cron 它只打印一句
# "cannot install cron jobs" 就过去了，证书到期前三个月都不会有人发现
apt-get install -y -qq curl gnupg2 ca-certificates
# cron 单独装并且不要 recommends：它推荐一个 MTA（exim），
# 一台只跑网站的机器不需要多一个监听邮件的服务
apt-get install -y -qq --no-install-recommends cron
systemctl enable --now cron

# --batch --yes：钥匙串已经存在时 gpg 会问"要覆盖吗"，而通过 ssh 跑
# 是没有 tty 的，它会直接以 "cannot open /dev/tty" 失败 ——
# 也就是这个脚本第一次能跑、第二次就跑不了。加上这两个才是可重入的
curl -fsSL https://nginx.org/keys/nginx_signing.key \
  | gpg --batch --yes --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
http://nginx.org/packages/${ID}/ ${VERSION_CODENAME} nginx" \
  > /etc/apt/sources.list.d/nginx.list
apt-get update -qq
apt-get install -y -qq nginx
nginx -v

id nginx >/dev/null 2>&1 || die "没有 nginx 这个用户，CI 里的 chown 会失败"

# ---------------------------------------------------------------- 2. 目录
say "建目录"
# ACME 校验目录单独放，不能在站点目录里 —— CI 的 rsync --delete 会清掉
# 站点目录里的多余文件，续期撞上就失败
mkdir -p "$WEBROOT" "$ACMEROOT/.well-known/acme-challenge" /etc/nginx/ssl
chmod 700 /etc/nginx/ssl
chown -R nginx:nginx "$WEBROOT" "$ACMEROOT"
chmod -R a+rX "$WEBROOT" "$ACMEROOT"
# CI 的探针步骤要求这个目录已经存在且可写，先放个占位页
[ -f "$WEBROOT/index.html" ] || echo '<!doctype html>bootstrapping' > "$WEBROOT/index.html"

# ---------------------------------------------------------------- 3. 临时 vhost
say "先上一个只有 80 端口的临时 vhost"
# 完整配置引用了 /etc/nginx/ssl 下还不存在的证书，nginx -t 会直接失败、
# 起不来，也就没法响应 ACME 校验 —— 先有鸡还是先有蛋。所以分两步。
rm -f /etc/nginx/conf.d/default.conf
cat > /etc/nginx/conf.d/dope-website.conf <<'TEMPVHOST'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/acme;
        try_files $uri =404;
    }

    root /var/www/dope-website;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
TEMPVHOST
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# ---------------------------------------------------------------- 4. 证书
if [ -f "$HERE/acme.sh-backup.tar.gz" ]; then
  say "从备份恢复证书（不重新签发，避开配额）"
  tar -xzf "$HERE/acme.sh-backup.tar.gz" -C /root
else
  say "装 acme.sh 并签发证书"
  # 用 acme.sh 不用 certbot：这套东西要能在很旧的系统上跑，acme.sh 是纯 shell
  TAG=$(curl -fsSL https://api.github.com/repos/acmesh-official/acme.sh/releases/latest \
        | grep -m1 '"tag_name"' | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')
  curl -fsSL "https://github.com/acmesh-official/acme.sh/archive/refs/tags/${TAG}.tar.gz" -o /tmp/acme.tar.gz
  tar -xzf /tmp/acme.tar.gz -C /tmp
  (cd "/tmp/acme.sh-${TAG}" && ./acme.sh --install --home /root/.acme.sh)
  # 默认 CA 是 ZeroSSL，注册要邮箱；换成 Let's Encrypt 就不用
  /root/.acme.sh/acme.sh --set-default-ca --server letsencrypt
  /root/.acme.sh/acme.sh --issue -d "$DOMAIN" -d "www.$DOMAIN" \
    -w "$ACMEROOT" --keylength ec-256 --server letsencrypt
fi

say "装证书到 nginx 能读的位置"
# --ecc 不能漏：证书是 ec-256 的，存在 <域名>_ecc/ 下，不加就找不到
/root/.acme.sh/acme.sh --install-cert -d "$DOMAIN" --ecc \
  --key-file       /etc/nginx/ssl/${DOMAIN}.key \
  --fullchain-file /etc/nginx/ssl/${DOMAIN}.fullchain.cer \
  --reloadcmd      "systemctl reload nginx"

/root/.acme.sh/acme.sh --install-cronjob || true
crontab -l 2>/dev/null | grep -q acme.sh || die "续期的 cron 没进去，手动确认"

# ---------------------------------------------------------------- 5. 换正式配置
say "换上正式 vhost"
cp "$HERE/nginx.conf" /etc/nginx/conf.d/dope-website.conf
nginx -t
systemctl reload nginx

# ---------------------------------------------------------------- 6. 自检
say "自检"
fail=0
check() { printf '  %-46s %s\n' "$1" "$2"; [ "$2" = OK ] || fail=1; }

ss -lnt | grep -q ':80 '  && check "80 在监听" OK  || check "80 在监听" 失败
ss -lnt | grep -q ':443 ' && check "443 在监听" OK || check "443 在监听" 失败
[ -s /etc/nginx/ssl/${DOMAIN}.key ] && check "私钥就位" OK || check "私钥就位" 失败
openssl x509 -in /etc/nginx/ssl/${DOMAIN}.fullchain.cer -noout -checkend 0 >/dev/null 2>&1 \
  && check "证书未过期" OK || check "证书未过期" 失败
id nginx >/dev/null 2>&1 && check "nginx 用户存在（CI 的 chown 要用）" OK || check "nginx 用户存在" 失败
[ -d "$WEBROOT" ] && [ -w "$WEBROOT" ] && check "站点目录可写（CI 探针要用）" OK || check "站点目录可写" 失败
crontab -l 2>/dev/null | grep -q acme.sh && check "续期 cron 已装" OK || check "续期 cron 已装" 失败

echo
if [ "$fail" = 0 ]; then
  cat <<'DONE'
服务器这边好了。剩下两步在别处做：

  1. 把 deploy 公钥放进 /root/.ssh/authorized_keys（如果重装时没注入）
  2. 去 GitHub 站点仓库 Actions 里手动触发一次 Deploy frontend
     （workflow_dispatch 是开着的），站点文件就回来了

现在访问 https://l9k.dev 会看到 bootstrap 占位页，跑完 CI 才是真站点。
DONE
else
  die "有检查没过，别急着跑 CI，先看上面哪一条"
fi
