/* ============================================================
   PLAYER.js — JARSAMP: a Winamp-style audio widget.
   Playlist comes from window.JARS_CONTENT.music (edit content.js).
   Audio persists globally so music keeps playing if you close the
   window; reopening re-syncs the UI. WebAudio visualizer with a
   procedural fallback. Registers initPlayer() on window.JARS_GAMES.
   ============================================================ */
(function () {
  var G = window.JARSAMP || (window.JARSAMP = {
    audio: null, idx: 0, ctx: null, analyser: null, src: null, data: null, failed: false,
  });

  function tracks() { return (window.JARS_CONTENT && window.JARS_CONTENT.music) || []; }

  function ensureAudio() {
    if (!G.audio) {
      G.audio = new Audio();
      G.audio.preload = "metadata";
      G.audio.volume = 0.8;
    }
    return G.audio;
  }

  // WebAudio analyser is created once (a media element can only be tapped once)
  function setupAnalyser() {
    if (G.analyser || G.failed) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { G.failed = true; return; }
      G.ctx = new AC();
      G.src = G.ctx.createMediaElementSource(G.audio);
      G.analyser = G.ctx.createAnalyser();
      G.analyser.fftSize = 64;
      G.src.connect(G.analyser);
      G.analyser.connect(G.ctx.destination);
      G.data = new Uint8Array(G.analyser.frequencyBinCount);
    } catch (e) { G.failed = true; }
  }

  function load(i, play) {
    var t = tracks(); if (!t.length) return;
    G.idx = (i % t.length + t.length) % t.length;
    var a = ensureAudio();
    a.src = t[G.idx].src;
    if (play) a.play().catch(function () {});
  }

  function initPlayer(win) {
    var a = ensureAudio();
    var t = tracks();
    var titleEl = win.querySelector("#amp-title");
    var listEl = win.querySelector("#amp-list");
    var playBtn = win.querySelector("#amp-play");
    var seek = win.querySelector("#amp-seek");
    var vol = win.querySelector("#amp-vol");
    var timeEl = win.querySelector("#amp-time");
    var cv = win.querySelector("#amp-viz");
    var vx = cv && cv.getContext("2d");

    function fmt(s) { s = s || 0; var m = Math.floor(s / 60), ss = Math.floor(s % 60); return m + ":" + (ss < 10 ? "0" : "") + ss; }

    function renderList() {
      listEl.innerHTML = "";
      if (!t.length) {
        listEl.innerHTML = '<li class="amp-empty">no songs yet — drop mp3s in assets/music/ and list them in js/content.js (music: [...])</li>';
        return;
      }
      t.forEach(function (tr, i) {
        var li = document.createElement("li");
        li.className = "amp-track" + (i === G.idx ? " active" : "");
        li.textContent = (i + 1) + ". " + (tr.title || tr.src);
        li.addEventListener("click", function () { setupAnalyser(); resumeCtx(); load(i, true); });
        listEl.appendChild(li);
      });
    }
    function syncTitle() {
      titleEl.textContent = t.length ? (t[G.idx].title || t[G.idx].src) : "— no track —";
      var items = listEl.querySelectorAll(".amp-track");
      items.forEach(function (x, i) { x.classList.toggle("active", i === G.idx); });
    }
    function syncPlay() { playBtn.textContent = a.paused ? "▶" : "⏸"; }
    function resumeCtx() { if (G.ctx && G.ctx.state === "suspended") G.ctx.resume(); }

    playBtn.onclick = function () {
      if (!t.length) return;
      setupAnalyser(); resumeCtx();
      if (!a.src) load(G.idx, false);
      if (a.paused) a.play().catch(function () {}); else a.pause();
    };
    win.querySelector("#amp-prev").onclick = function () { setupAnalyser(); resumeCtx(); load(G.idx - 1, true); };
    win.querySelector("#amp-next").onclick = function () { setupAnalyser(); resumeCtx(); load(G.idx + 1, true); };
    vol.value = a.volume;
    vol.oninput = function () { a.volume = +vol.value; };
    seek.oninput = function () { if (a.duration) a.currentTime = (+seek.value / 100) * a.duration; };

    // assign (not addEventListener) so reopening doesn't stack duplicate handlers
    a.onplay = syncPlay;
    a.onpause = syncPlay;
    a.onended = function () { load(G.idx + 1, true); };
    a.onloadedmetadata = syncTitle;
    a.ontimeupdate = function () {
      if (a.duration) seek.value = (a.currentTime / a.duration) * 100;
      timeEl.textContent = fmt(a.currentTime) + " / " + fmt(a.duration);
    };
    a.onerror = function () { titleEl.textContent = "⚠ missing: " + (t[G.idx] && (t[G.idx].title || t[G.idx].src) || ""); };

    if (!a.src && t.length) load(G.idx, false);
    renderList(); syncTitle(); syncPlay();

    (function viz() {
      if (!win.isConnected) return;
      if (vx) {
        vx.clearRect(0, 0, cv.width, cv.height);
        var bars = 16;
        if (G.analyser) G.analyser.getByteFrequencyData(G.data);
        for (var i = 0; i < bars; i++) {
          var h;
          if (G.analyser) h = (G.data[i] / 255) * cv.height;
          else h = !a.paused ? Math.abs(Math.sin(Date.now() / 200 + i)) * (cv.height * 0.8) + 2 : 2;
          var x = i * (cv.width / bars);
          vx.fillStyle = i % 2 ? "#ff2d55" : "#b6ff00";
          vx.fillRect(x + 1, cv.height - h, cv.width / bars - 2, h);
        }
      }
      requestAnimationFrame(viz);
    })();
  }

  window.JARS_GAMES = Object.assign(window.JARS_GAMES || {}, { initPlayer: initPlayer });
})();
