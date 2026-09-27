#!/bin/sh
# Runs on the Zone.ee server from cron: pulls master from GitHub and, when it
# has changed, syncs the site into the web root.
#   */5 * * * * /bin/sh $HOME/tiblu.com-src/scripts/pull-deploy.sh >> $HOME/logs/tiblu-deploy.log 2>&1
set -eu

REPO_URL="https://github.com/tiblu/tiblu.com.git"
SRC="$HOME/tiblu.com-src"
WEBROOT="$HOME/domeenid/www.tiblu.com/htdocs"

STAMP="$HOME/.tiblu-deployed"   # commit last synced to the web root

if [ ! -d "$SRC/.git" ]; then
  git clone --quiet --branch master "$REPO_URL" "$SRC"
fi

cd "$SRC"
git fetch --quiet origin master
REMOTE=$(git rev-parse origin/master)

if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$REMOTE" ]; then
  exit 0
fi

git reset --quiet --hard origin/master

# --delete keeps the web root identical to the repo; .well-known is left alone
# (used for SSL certificate checks).
rsync -rlt --delete \
  --exclude=".git" --exclude=".github" --exclude=".gitignore" \
  --exclude="README.md" --exclude="scripts" --exclude="reference images" \
  --exclude=".well-known" \
  "$SRC/" "$WEBROOT/"

echo "$REMOTE" > "$STAMP"
echo "$(date '+%Y-%m-%d %H:%M:%S') deployed $(git rev-parse --short HEAD): $(git log -1 --format=%s)"
