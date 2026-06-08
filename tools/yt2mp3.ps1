# yt2mp3.ps1 — download audio from a video/YouTube URL as MP3 into assets/music/
#
# REQUIRES: yt-dlp + ffmpeg
#   winget install yt-dlp.yt-dlp
#   winget install Gyan.FFmpeg
#
# USAGE (from the repo root):
#   .\tools\yt2mp3.ps1 -Url "https://www.youtube.com/watch?v=..." [-Title "My Song"]
#
# !! Only convert audio you OWN or are LICENSED to use. Respect copyright and
#    each platform's Terms of Service. This tool is for your own/licensed media.

param(
  [Parameter(Mandatory = $true)][string]$Url,
  [string]$Title
)
$ErrorActionPreference = "Stop"

if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
  Write-Error "yt-dlp not found. Install: winget install yt-dlp.yt-dlp"; exit 1
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Error "ffmpeg not found. Install: winget install Gyan.FFmpeg"; exit 1
}

$out = "assets/music"
New-Item -ItemType Directory -Force -Path $out | Out-Null

if ($Title) { $tmpl = "$out/$Title.%(ext)s" } else { $tmpl = "$out/%(title)s.%(ext)s" }

yt-dlp -x --audio-format mp3 --audio-quality 0 -o $tmpl $Url

Write-Host ""
Write-Host "Done. MP3 saved to $out/" -ForegroundColor Green
Write-Host "Now add it to js/content.js -> music: [ { title: '...', src: 'assets/music/FILE.mp3' } ]"
