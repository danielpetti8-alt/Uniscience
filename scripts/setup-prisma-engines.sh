#!/usr/bin/env bash
# =============================================================================
# Sandbox-only yordamchi skript.
# Bu muhitda binaries.prisma.sh domeni bloklangan, shuning uchun Prisma
# engine'lari (libquery_engine, schema-engine, prisma-fmt, query-engine)
# GitHub'dagi ochiq mirror'dan olinib, Prisma CLI ularni kutgan joylarga
# o'rnatiladi. Oddiy kompyuterda (internet ochiq) bu skript KERAK EMAS —
# `npm install` o'zi engineslarni yuklab oladi.
#
# Ishlatish:  bash scripts/setup-prisma-engines.sh
# =============================================================================
set -euo pipefail

COMMIT="605197351a3c8bdd595af2d2a9bc3025bca48ea2"   # prisma 5.22.0 engines
PLATFORM="debian-openssl-3.0.x"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$HOME/.cache/prisma/master/$COMMIT/$PLATFORM"

if [ ! -f "$CACHE/schema-engine" ]; then
  echo ">> Mirror'dan engineslar yuklab olinmoqdi (~49 MB)..."
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  curl -sL --max-time 300 \
    "https://codeload.github.com/owengretzinger/prisma-engines-mirror/tar.gz/refs/heads/mirror" \
    -o "$TMP/mirror.tar.gz"
  tar xzf "$TMP/mirror.tar.gz" -C "$TMP"
  SRC="$TMP/prisma-engines-mirror-mirror/all_commits/$COMMIT/$PLATFORM"
  mkdir -p "$CACHE"
  for f in libquery_engine.so.node prisma-fmt query-engine schema-engine; do
    gunzip -c "$SRC/$f.gz" > "$CACHE/$f"
    chmod +x "$CACHE/$f"
    cut -d' ' -f1 "$SRC/$f.sha256" | tr -d '\n' > "$CACHE/$f.sha256"
  done
  echo ">> Kesh to'ldirildi: $CACHE"
fi

# Prisma CLI va @prisma/engines engine fayllarni shu joylarda qidiradi
for dest in "$REPO_ROOT/node_modules/prisma" "$REPO_ROOT/node_modules/@prisma/engines"; do
  [ -d "$dest" ] || continue
  cp "$CACHE/libquery_engine.so.node" "$dest/libquery_engine-$PLATFORM.so.node"
  cp "$CACHE/schema-engine" "$dest/schema-engine-$PLATFORM"
  chmod +x "$dest/schema-engine-$PLATFORM"
done

echo ">> Prisma engines tayyor. Endi 'npx prisma generate/migrate/seed' ishlaydi."
