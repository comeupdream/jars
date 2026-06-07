/* ============================================================
   CONTENT.js — all the words, icons, windows, flavors.
   Edit THIS file to change copy / add windows / drop in your
   AI images & video.

   Add an image:   media: '<img src="assets/your.jpg" alt="">'
   Add a video:    '<video src="assets/clip.mp4" autoplay muted loop playsinline></video>'
   Hide a link in media/info: add  data-secret="TARGET"  to any element.
   ============================================================ */
window.JARS_CONTENT = {

  boot: [
    "JARSOS BIOS v9.81  (c) SUGAR INDUSTRIES",
    "Detecting jars................. 1 FOUND",
    "Sugar level....................... MAX",
    "Pineapple integrity............... 100%",
    "Koolaid pressure............ DANGEROUS",
    "Loading flavors.dll....... ALL OF THEM",
    "Mounting /dev/jar................. OK",
    "Summoning purple man.............. OK",
    "WARNING: do not drink the bios",
    "",
    "Starting JARSOS...",
  ],

  marquee: [
    "KOOL-AID IN A JAR",
    "EVERY FLAVOR",
    "IT'S JUST PINEAPPLE",
    "IN A JAR",
    "OH YEAH",
  ],

  // ALL the kool-aid flavors on full display. Clicking one re-themes the OS.
  flavors: [
    { name: "Tropical Punch", c: "#ff2d55" },
    { name: "Cherry",         c: "#d80c1f" },
    { name: "Grape",          c: "#7b2ff7" },
    { name: "Blue Raspberry", c: "#1b6dff" },
    { name: "Lemonade",       c: "#ffd60a" },
    { name: "Lime",           c: "#6fd400" },
    { name: "Orange",         c: "#ff7a00" },
    { name: "Pink Lemonade",  c: "#ff5fa2" },
    { name: "Watermelon",     c: "#ff3b6b" },
    { name: "Black Cherry",   c: "#5a0d2a" },
  ],

  icons: [
    { id: "readme",   glyph: "📄", label: "READ_ME.txt" },
    { id: "product",  glyph: "🫙", label: "JARS" },
    { id: "flavors",  glyph: "🌈", label: "FLAVORS" },
    { id: "info",     glyph: "ℹ️", label: "(info)" },
    { id: "sweeper",  glyph: "💣", label: "Jarsweeper" },
    { id: "doom",     glyph: "🔫", label: "DOOMAID.exe" },
    { id: "gallery",  glyph: "🖼️", label: "gallery" },
    { id: "secret",   glyph: "🚫", label: "do_not_open" },
  ],

  start: [
    { gl: "🫙", label: "JARS", open: "product" },
    { gl: "🌈", label: "Flavors", open: "flavors" },
    { gl: "ℹ️", label: "Info", open: "info" },
    { gl: "🖼️", label: "Gallery", open: "gallery" },
    { sep: true },
    { gl: "💣", label: "Jarsweeper", open: "sweeper" },
    { gl: "🔫", label: "DOOMAID", open: "doom" },
    { sep: true },
    { gl: "🔌", label: "Shut Down (don't)", action: "bsod" },
  ],

  windows: {
    readme: {
      title: "READ_ME.txt — Notepad", icon: "📄", x: 50, y: 60, w: 340,
      body: `
        <div class="sunken" style="font-family:'Courier New',monospace;font-size:13px">
          <p><b>welcome to the jar.</b></p><br>
          <p>real pineapple spears. drowned in kool-aid. straight outta the
          store-bought pineapple jar. every flavor. no notes.</p><br>
          <p>OH YEAH meets MS-DOS. click stuff, drag windows,
          re-flavor the whole machine. some links are hidden in the
          pictures and the (info) tab. one icon you should NOT open.</p><br>
          <p>— management 🟣</p>
        </div>`,
    },

    product: {
      title: "JARS — Properties", icon: "🫙", x: 300, y: 90, w: 440,
      body: `
        <img src="assets/logo.svg" alt="JARS" style="width:100%;margin:-4px 0 8px" data-secret="LOGO_EASTER_EGG">
        <p class="kicker">koolaid pineapple spears</p>
        <div class="slot" style="margin:10px 0">[ drop hero photo/video of the real jar → assets/ ]</div>
        <ul style="margin:8px 0 12px 18px;font-size:13px">
          <li>real pineapple spears (the store jar)</li>
          <li>actual kool-aid — <b>every flavor</b> (open FLAVORS)</li>
          <li>one (1) jar of pure danger</li>
        </ul>
        <button class="btn-loud" data-burst>I WANT THE JAR</button>`,
    },

    flavors: {
      title: "FLAVORS — full display", icon: "🌈", x: 120, y: 70, w: 420,
      body: `
        <p class="kicker">click a flavor → re-flavor the whole OS</p>
        <div id="flavor-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px"></div>`,
      onOpen: "initFlavors",
    },

    info: {
      title: "(info)", icon: "ℹ️", x: 200, y: 130, w: 360,
      body: `
        <div class="sunken" style="font-size:13px">
          <p><b>JARS</b> — koolaid pineapple spears.</p>
          <p style="margin-top:8px">questions? lore? wholesale? the purple man knows things.</p>
          <p style="margin-top:8px">mascot: <span data-secret="MASCOT">🟣 ask him</span></p>
          <p style="margin-top:8px;color:#888;font-size:11px">
            (psst — one word in here is a door. you'll find it.)</p>
        </div>`,
    },

    gallery: {
      title: "gallery — My Pictures", icon: "🖼️", x: 180, y: 80, w: 470,
      body: `
        <p class="kicker">your AI imagery + video edits land here</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <div class="slot" data-secret="IMG1">[ img 1 — hidden link ]</div>
          <div class="slot" data-secret="IMG2">[ img 2 — hidden link ]</div>
          <div class="slot" data-secret="VID1">[ video edit — hidden link ]</div>
          <div class="slot">[ img 4 ]</div>
        </div>`,
    },

    sweeper: {
      title: "Jarsweeper", icon: "💣", x: 240, y: 90, w: 320,
      body: `
        <p class="kicker">don't click the purple man</p>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0">
          <span>🟣 <b id="sw-mines">0</b></span>
          <button class="win__btn" id="sw-reset" style="width:auto;padding:0 8px">🙂 reset</button>
          <span id="sw-status">dig in</span>
        </div>
        <div id="sw-grid" class="sunken" style="padding:4px;display:inline-block"></div>`,
      onOpen: "initSweeper",
    },

    doom: {
      title: "DOOMAID.exe", icon: "🔫", x: 160, y: 70, w: 360,
      body: `
        <img src="assets/yeahhh.jpg" alt="" style="width:100%;border:2px solid #000;margin-bottom:6px"
             onerror="this.style.display='none'">
        <p class="kicker">WASD move · mouse/←→ turn · SPACE/click shoot</p>
        <p style="font-size:12px;margin:4px 0">blast the kool-aid men. grab jars. survive.</p>
        <canvas id="doom-canvas" width="320" height="200"
          style="width:100%;background:#000;border:2px solid #000;image-rendering:pixelated;cursor:crosshair"></canvas>
        <p style="font-size:12px;margin-top:6px">jars: <b id="doom-jars">0</b> · hp: <b id="doom-hp">100</b></p>`,
      onOpen: "initDoom",
    },

    secret: {
      title: "⚠ do_not_open", icon: "🚫", x: 260, y: 160, w: 320,
      body: `
        <div style="text-align:center">
          <p class="glitch huge" data-text="OH YEAH">OH YEAH</p>
          <img src="assets/faviconmascot.jpg" alt="" style="width:120px;margin:8px auto"
               onerror="this.onerror=null;this.src='assets/koolaid-man.svg'">
          <div class="slot" style="margin:8px 0">[ cursed gif / secret drop ]</div>
          <p style="font-size:12px">secret target = your call (discount? discord? lore?)</p>
        </div>`,
      onOpen: "secretBurst",
    },
  },
};
