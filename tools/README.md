# tools/

Local helper scripts (run on your machine — these are NOT part of the deployed site).

## yt2mp3 — make MP3s for JARSAMP

Downloads the audio track from a video/YouTube URL and saves it as an MP3 into
`assets/music/`, ready to add to the player.

**Windows (PowerShell), from the repo root:**
```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
.\tools\yt2mp3.ps1 -Url "https://www.youtube.com/watch?v=XXXX" -Title "My Song"
```

**macOS / Linux:**
```bash
brew install yt-dlp ffmpeg        # macOS  (Linux: pipx install yt-dlp; apt install ffmpeg)
chmod +x tools/yt2mp3.sh
tools/yt2mp3.sh "https://www.youtube.com/watch?v=XXXX" "My Song"
```

Then list the new file in `js/content.js`:
```js
music: [
  { title: "My Song", src: "assets/music/My Song.mp3" },
],
```

> ⚠️ **Rights:** Only convert audio you **own** or are **licensed** to use
> (your own tracks, royalty-free/Creative-Commons music, etc.). Respect
> copyright and each platform's Terms of Service.
