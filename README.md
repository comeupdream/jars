# JARS // KOOLAID PINEAPPLE SPEARS

> IT'S JUST PINEAPPLE. IN KOOLAID. IN A JAR.

A maximalist hype site built as a haunted fake operating system — **JARSOS**.
Boots into a cursed Win95/98 × XP desktop possessed by a tropical sugar demon.
Pit-Viper-dumb-simple copy over loud procedural motion. Real product:
**pineapple spears soaking in Kool-Aid inside the store-bought jar — every flavor.**

Mascot: the **purple Kool-Aid Man**. Brand/hook: **JARS** (custom dripping logo).

## Run it
No build step. Just open `index.html` in a browser (or serve the folder):
```
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's built (v0 scaffold)
- **Boot sequence** — POST log → JARSOS loading bar → desktop
- **Windowing engine** — draggable / focusable / minimizable windows, taskbar, Start menu, live clock
- **Procedural FX** (`js/fx.js`) — animated tropical gradient, rising juice-bubble particles, click "bursts"; CRT scanlines + vignette (CSS)
- **All-flavors palette** — click a flavor to **re-theme the entire OS** to that liquid color
- **Mascot** — purple Kool-Aid Man helper that drops tips (bottom-right)
- **Games**
  - **Jarsweeper** — Minesweeper reskin (mines = 🟣 purple men)
  - **DOOMAID.exe** — canvas raycaster; shoot Kool-Aid Men, grab jars (WASD + mouse/arrows, click/space to fire)
- **Hidden links** — seeded in gallery images, the product logo, and the `(info)` tab (`data-secret`); Konami code (↑↑↓↓←→←→ B A) opens the secret window

## File map
```
index.html        markup + script/style loading
css/reset.css     reset + custom cursor
css/os.css        window chrome, taskbar, start menu (all colors are CSS vars)
css/fx.css        CRT, boot, marquee, glitch type, mascot
js/fx.js          procedural canvas background + FX.burst()
js/content.js     ALL copy, icons, windows, flavor list  <-- edit this most
js/games.js       flavors palette, Jarsweeper, DOOMAID
js/os.js          the JARSOS engine (boot, windows, taskbar, mascot, konami)
assets/logo.svg          procedural JARS dripping wordmark
assets/koolaid-man.svg   procedural purple Kool-Aid Man mascot
```

## Where to drop YOUR assets
Put files in `assets/` and reference them in `js/content.js`:
- **Hero photo/video of the real jar** → replace the `.slot` in the `product` window
- **AI imagery + video edits** → the `gallery` window slots
- To hide a link in any media/element, add `data-secret="WHATEVER"` to it.

## Still need from you
- Real **liquid colors** per flavor (so procedural graphics match exactly)
- Hero **photos/video** of the actual jar
- Where hidden links should **go** (discount code? Discord? lore page?)
- Is this for sale / a drop / pure mythology (decides the `buy`/CTA wiring)
