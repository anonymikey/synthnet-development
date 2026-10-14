#!/usr/bin/env bash
# Creates a complete, self-contained release ZIP of the project.
# Usage: npm run package:release -- <label>      e.g. initial-ui
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION="$(node -p "require('./package.json').version")"
LABEL="${1:-release}"
FOLDER="SYNTHNET_v${VERSION}"
ZIP_NAME="SYNTHNET_v${VERSION}_${LABEL}.zip"
STAGE="$(mktemp -d)"

mkdir -p "release" "${STAGE}/${FOLDER}"

# Copy everything except dependencies, build output, VCS data, caches and secrets.
tar \
  --exclude="./node_modules" \
  --exclude="./.next" \
  --exclude="./.git" \
  --exclude="./.vercel" \
  --exclude="./release" \
  --exclude="./out" \
  --exclude="./.env" \
  --exclude="./.env.local" \
  --exclude="./.env.*.local" \
  --exclude="*.tsbuildinfo" \
  --exclude=".DS_Store" \
  --exclude="Thumbs.db" \
  -cf - . | (cd "${STAGE}/${FOLDER}" && tar -xf -)

rm -f "release/${ZIP_NAME}"
(cd "${STAGE}" && zip -qr "${OLDPWD}/release/${ZIP_NAME}" "${FOLDER}")
rm -rf "${STAGE}"

echo "Created release/${ZIP_NAME}"
unzip -l "release/${ZIP_NAME}" | tail -n 1
