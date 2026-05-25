#!/usr/bin/env bash
# transcode_videos.sh — trim + downscale + H.264 the 3 episode MP4s for web.
set -euo pipefail

EPISODE_ID="${EPISODE_ID:-1778330002413}"
START_SEC="${START_SEC:-0}"
DURATION_SEC="${DURATION_SEC:-30}"
SRC_DIR="${SRC_DIR:-$HOME/Documents/Samples}"
OUT_DIR="public/samples/episodes/${EPISODE_ID}"

mkdir -p "$OUT_DIR"

transcode() {
  local src="$1"
  local dst="$2"
  local scale="$3"
  local crf="$4"
  echo "[transcode] $(basename "$src") -> $dst"
  ffmpeg -y -loglevel error -ss "$START_SEC" -i "$src" -t "$DURATION_SEC" \
    -vf "scale=${scale}:flags=lanczos" \
    -c:v libx264 -preset slow -crf "$crf" -pix_fmt yuv420p \
    -movflags +faststart \
    -an \
    "$dst"
}

transcode "$SRC_DIR/Frame_${EPISODE_ID}.mp4"         "$OUT_DIR/head.mp4"        "960:540"  23
transcode "$SRC_DIR/LeftWristCam_${EPISODE_ID}.mp4"  "$OUT_DIR/wrist_left.mp4"  "640:360"  25
transcode "$SRC_DIR/RightWristCam_${EPISODE_ID}.mp4" "$OUT_DIR/wrist_right.mp4" "640:360"  25

DIAGRAMS_OUT="$OUT_DIR/diagrams"
mkdir -p "$DIAGRAMS_OUT"
for f in "Camera Extrinsics (0.055).png" "Camera Extrinsics (0.08).png" "Coordinate System Diagram (Right-Handed Coordinate System).jpg" "Dataset Naming Convention.png"; do
  [ -f "$SRC_DIR/$f" ] && cp "$SRC_DIR/$f" "$DIAGRAMS_OUT/" || true
done
mv "$DIAGRAMS_OUT/Camera Extrinsics (0.055).png" "$DIAGRAMS_OUT/extrinsics_055.png" 2>/dev/null || true
mv "$DIAGRAMS_OUT/Camera Extrinsics (0.08).png"  "$DIAGRAMS_OUT/extrinsics_08.png"  2>/dev/null || true
mv "$DIAGRAMS_OUT/Coordinate System Diagram (Right-Handed Coordinate System).jpg" "$DIAGRAMS_OUT/coord_rh_flu.jpg" 2>/dev/null || true
mv "$DIAGRAMS_OUT/Dataset Naming Convention.png" "$DIAGRAMS_OUT/naming_convention.png" 2>/dev/null || true

echo "[done] outputs in $OUT_DIR"
ls -lh "$OUT_DIR"
