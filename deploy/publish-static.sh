#!/usr/bin/env bash
set -euo pipefail
umask 077

exec 9>/run/lock/portafolio-static-deploy.lock
flock -w 60 9

stage=$(mktemp -d)
trap 'rm -rf -- "$stage"' EXIT
git -C "$stage" init -q
git -C "$stage" fetch -q --depth=1 https://github.com/carlosperalesa/Web.git refs/heads/main
revision=$(git -C "$stage" rev-parse FETCH_HEAD)
mkdir "$stage/public"
git -C "$stage" archive "$revision" -- css fonts historial img js proyectos sounds robots.txt sitemap.xml google4b4f0b50c3f33b93.html index.html |
    tar -xf - -C "$stage/public"

root=/var/www/portafolio
backup=$(mktemp -d "/var/backups/portafolio-actions-${revision:0:12}.XXXXXXXX")
options=(-r --checksum --no-links --chown=root:root --chmod=D755,F644 --backup "--backup-dir=$backup" --delay-updates)
rsync "${options[@]}" --exclude='*.html' "$stage/public/" "$root/"
rsync "${options[@]}" --include='*/' --include='*.html' --exclude='*' "$stage/public/" "$root/"

origin=https://carlosperales.dev
curl -fsS --max-time 15 "$origin/" | cmp - "$stage/public/index.html"
curl -fsS --max-time 15 "$origin/api/health" >/dev/null
printf 'Deployed %s\n' "$revision"
