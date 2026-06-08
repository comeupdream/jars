#!/usr/bin/env bash
# yt2mp3.sh — download audio from a video/YouTube URL as MP3 into assets/music/
#
# REQUIRES: yt-dlp + ffmpeg
#   macOS:  brew install yt-dlp ffmpeg
#   Linux:  pipx install yt-dlp   &&   sudo apt install ffmpeg
#
# USAGE (from the repo root):
#   tools/yt2mp3.sh "<URL>" ["Optional Title"]
#
# !! Only convert audio you OWN or are LICENSED to use. Respect copyright and
#    each platform's Terms of Service. This tool is for your own/licensed media.

set -euo pipefail

URL="${1:?Usage: tools/yt2mp3.sh <URL> [title]}"
TITLE="${2:-}"
OUT="assets/music"

command -v yt-dlp >/dev/null || { echo "yt-dlp not found (see header for install)"; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg not found (see header for install)"; exit 1; }

mkdir -p "$OUT"

if [ -n "$TITLE" ]; then
  yt-dlp -x --audio-format mp3 --audio-quality 0 -o "$OUT/${TITLE}.%(ext)s" "$URL"
else
  yt-dlp -x --audio-format mp3 --audio-quality 0 -o "$OUT/%(title)s.%(ext)s" "$URL"
fi

echo ""
echo "Done. MP3 saved to $OUT/"
echo "Now add it to js/content.js -> music: [ { title: '...', src: 'assets/music/FILE.mp3' } ]"
