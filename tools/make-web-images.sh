#!/usr/bin/env bash
# Creates lighter web copies of the original photos in assets/web/.
# Originals in assets/photos/ are never modified. Requires ImageMagick.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/web
for src in assets/photos/*; do
  name="$(basename "${src%.*}")"
  for size in 480 960 1600; do
    convert "$src" -auto-orient -resize "${size}x${size}>" -strip \
      -interlace Plane -sampling-factor 4:2:0 -quality 80 \
      "assets/web/${name}-${size}.jpg"
  done
done
