/* ============================================================
   OS.js — the JARSOS engine.
   Boots, renders desktop/taskbar/start menu, manages draggable
   focusable minimizable windows, clock, secrets, and games.
   ============================================================ */
(function () {
  const C = window.JARS_CONTENT;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, cls, html) => { const e = document.createElement(t); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const open = new Map();   // id -> {win, task}
  let zTop = 10;

  /* ---------------- BOOT ---------------- */
  function boot() {
    const log = $("#boot-log");
    const lines = C.boot;
    let i = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    (function type() {
      if (i < lines.length) {
        log.textContent += lines[i++] + "\n";
        setTimeout(type, reduce ? 60 : 220 + Math.random() * 160);
      } else {
        const bar = $("#boot-bar"); bar.hidden = false;
        const hero = $("#boot-hero");
        const stage = $("#boot-stage");
        const vid = $("#boot-video");

        // loading bar is eye-candy now; the intro video drives the handoff
        let p = 0, advanced = false;
        const fill = $("#boot-fill");
        const t = setInterval(() => {
          p += 4 + Math.random() * 12; if (p > 100) p = 100;
          fill.style.width = p + "%";
          if (p >= 100) clearInterval(t);
        }, reduce ? 30 : 120);

        const go = () => { if (advanced) return; advanced = true; clearInterval(t); startDesktop(); };

        // once the Kool-Aid Man drops to his final position, play the video
        // ONCE with the heavy wavy CRT effect, then enter the desktop.
        const playIntro = () => {
          if (!vid) { setTimeout(go, 1000); return; }
          if (hero) hero.hidden = true;
          vid.hidden = false;
          if (stage) stage.classList.add("is-playing");
          vid.loop = false;
          vid.addEventListener("ended", go, { once: true });
          vid.addEventListener("error", () => setTimeout(go, 800), { once: true });
          const pr = vid.play();
          if (pr && pr.catch) pr.catch(() => setTimeout(go, 1500));
          setTimeout(go, 14000); // safety net so the intro can never hang
        };

        if (hero) {
          hero.hidden = false;
          if (reduce) setTimeout(playIntro, 300);           // slam disabled under reduced-motion
          else hero.addEventListener("animationend", playIntro, { once: true });
        } else {
          playIntro();
        }
      }
    })();
  }

  function startDesktop() {
    $("#boot").hidden = true;
    $("#desktop").hidden = false;
    $("#taskbar").hidden = false;
    renderIcons();
    renderMarquee();
    renderStart();
    tickClock();
    setInterval(tickClock, 1000);
    initMascot();
    // open windows so it doesn't feel empty; CA popup opens last (on top, centered)
    openWindow("readme");
    openWindow("ca");
  }

  /* ---------------- DESKTOP ICONS ---------------- */
  function renderIcons() {
    const wrap = $("#desktop-icons");
    wrap.innerHTML = "";
    C.icons.forEach((ic) => {
      const b = el("button", "dicon",
        `<span class="dicon__glyph">${ic.glyph}</span><span class="dicon__label">${ic.label}</span>`);
      b.addEventListener("dblclick", () => openWindow(ic.id));
      b.addEventListener("click", (e) => { if (e.detail === 0) openWindow(ic.id); });
      wrap.appendChild(b);
    });
  }

  function renderMarquee() {
    const host = $("#bg-banners");
    if (!host) return;
    host.innerHTML = "";
    const phrases = C.marquee;
    const ROWS = 7;
    for (let r = 0; r < ROWS; r++) {
      const row = el("div", "bg-row" + (r % 2 ? " rev" : ""));
      let line = "";
      for (let k = 0; k < 6; k++) line += `<span>${phrases[(k + r) % phrases.length]} ✦ </span>`;
      const track = el("div", "bg-row__track", line + line); // double for seamless loop
      row.style.top = 4 + r * 13 + "%";
      track.style.animationDuration = 16 + (r % 3) * 7 + "s";
      track.style.fontSize = `clamp(26px, ${6 + (r % 3) * 2}vw, ${64 + (r % 3) * 26}px)`;
      track.style.opacity = r % 2 ? ".22" : ".32";
      row.appendChild(track);
      host.appendChild(row);
    }
  }

  /* ---------------- START MENU ---------------- */
  function renderStart() {
    const list = $("#start-list");
    list.innerHTML = "";
    C.start.forEach((it) => {
      if (it.sep) { list.appendChild(el("li", "start-menu__sep")); return; }
      const li = el("li", null, `<span class="gl">${it.gl}</span><span>${it.label}</span>`);
      li.addEventListener("click", () => {
        toggleStart(false);
        if (it.open) openWindow(it.open);
        else if (it.action === "bsod") bsod();
      });
      list.appendChild(li);
    });
    $("#start-btn").addEventListener("click", () => toggleStart());
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) toggleStart(false);
    });
  }
  function toggleStart(force) {
    const m = $("#start-menu"), b = $("#start-btn");
    const show = force == null ? m.hidden : force;
    m.hidden = !show;
    b.classList.toggle("is-open", show);
  }

  /* ---------------- WINDOWS ---------------- */
  function openWindow(id) {
    const def = C.windows[id];
    if (!def) return;
    if (open.has(id)) { focusWin(id); restore(id); return; }

    const win = el("div", "win");
    if (def.w) win.style.width = def.w + "px";
    const cx = def.center ? Math.max(8, (innerWidth - (def.w || 320)) / 2) : (def.x || 80);
    win.style.left = cx + "px";
    win.style.top = (def.y || 80) + "px";
    win.innerHTML = `
      <div class="win__bar">
        <span class="win__icon">${def.icon || "🪟"}</span>
        <span class="win__title">${def.title || id}</span>
        <span class="win__btns">
          <button class="win__btn" data-min title="minimize">_</button>
          <button class="win__btn" data-close title="close">✕</button>
        </span>
      </div>
      <div class="win__body">${def.body || ""}</div>`;
    $("#window-layer").appendChild(win);

    // taskbar button
    const task = el("button", "task", `<span>${def.icon || "🪟"}</span><span>${def.title || id}</span>`);
    $("#tasks").appendChild(task);
    task.addEventListener("click", () => {
      if (win.classList.contains("is-min")) restore(id);
      else if (win.classList.contains("is-focused")) minimize(id);
      else focusWin(id);
    });

    open.set(id, { win, task });

    // controls
    win.addEventListener("mousedown", () => focusWin(id));
    $("[data-close]", win).addEventListener("click", (e) => { e.stopPropagation(); closeWindow(id); });
    $("[data-min]", win).addEventListener("click", (e) => { e.stopPropagation(); minimize(id); });
    makeDraggable(win, $(".win__bar", win));
    wireBody(win);

    focusWin(id);
    if (def.onOpen && GAMES[def.onOpen]) GAMES[def.onOpen](win);
  }

  function closeWindow(id) {
    const o = open.get(id); if (!o) return;
    o.win.remove(); o.task.remove(); open.delete(id);
  }
  function minimize(id) { const o = open.get(id); if (o) { o.win.classList.add("is-min"); o.task.classList.remove("is-active"); } }
  function restore(id)  { const o = open.get(id); if (o) { o.win.classList.remove("is-min"); focusWin(id); } }
  function focusWin(id) {
    open.forEach((o, k) => {
      const f = k === id;
      o.win.classList.toggle("is-focused", f);
      o.task.classList.toggle("is-active", f && !o.win.classList.contains("is-min"));
      if (f) o.win.style.zIndex = ++zTop;
    });
  }

  function makeDraggable(win, handle) {
    let sx, sy, ox, oy, drag = false;
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".win__btn")) return;
      drag = true; sx = e.clientX; sy = e.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
      e.preventDefault();
    });
    addEventListener("mousemove", (e) => {
      if (!drag) return;
      win.style.left = Math.max(0, ox + e.clientX - sx) + "px";
      win.style.top = Math.max(0, oy + e.clientY - sy) + "px";
    });
    addEventListener("mouseup", () => (drag = false));
    // touch
    handle.addEventListener("touchstart", (e) => {
      if (e.target.closest(".win__btn")) return;
      const t = e.touches[0]; drag = true; sx = t.clientX; sy = t.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
    }, { passive: true });
    addEventListener("touchmove", (e) => {
      if (!drag) return; const t = e.touches[0];
      win.style.left = Math.max(0, ox + t.clientX - sx) + "px";
      win.style.top = Math.max(0, oy + t.clientY - sy) + "px";
    }, { passive: true });
    addEventListener("touchend", () => (drag = false));
  }

  // wire interactive bits inside a window body
  function wireBody(win) {
    win.querySelectorAll("[data-burst]").forEach((b) =>
      b.addEventListener("click", (e) => { const r = b.getBoundingClientRect(); window.FX && FX.burst(r.left + r.width / 2, r.top); }));
    win.querySelectorAll("[data-secret]").forEach((a) =>
      a.addEventListener("click", (e) => { e.preventDefault(); openWindow("secret"); }));
    win.querySelectorAll("[data-copy]").forEach((b) =>
      b.addEventListener("click", () => {
        const text = b.getAttribute("data-copy");
        copyText(text);
        const old = b.textContent;
        b.textContent = "✅ COPIED!";
        setTimeout(() => { b.textContent = old; }, 1600);
        const r = b.getBoundingClientRect();
        window.FX && FX.burst(r.left + r.width / 2, r.top, 20);
      }));
  }

  // clipboard copy with a fallback for non-secure / older contexts
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }

  /* ---------------- TASKBAR EXTRAS ---------------- */
  function tickClock() {
    const d = new Date();
    $("#clock").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /* ---------------- BSOD ---------------- */
  function bsod() {
    const b = $("#boot");
    b.hidden = false; b.classList.add("is-bsod");
    b.innerHTML = `<div>
      <p style="font-size:20px">:(</p>
      <p style="margin-top:14px">JARSOS ran into a problem and needs more koolaid.</p>
      <p style="margin-top:10px;font-size:13px">PINEAPPLE_OVERFLOW_EXCEPTION</p>
      <p style="margin-top:20px;font-size:13px">click anywhere to reboot</p></div>`;
    b.addEventListener("click", () => location.reload(), { once: true });
  }

  /* ---------------- FLAVOR THEMING ---------------- */
  window.JARS_setFlavor = function (color) {
    document.documentElement.style.setProperty("--punch", color);
    document.documentElement.style.setProperty("--berry", color);
  };

  /* ---------------- MASCOT (purple kool-aid man) ---------------- */
  const TIPS = [
    "OH YEAH. drag a window.",
    "click a FLAVOR to repaint everything.",
    "there are hidden links in the pictures…",
    "the (info) tab has a door in it.",
    "don't open do_not_open. (open it.)",
    "try: up up down down left right left right B A",
  ];
  function initMascot() {
    const m = $("#mascot"), bubble = $("#mascot-bubble");
    m.hidden = false;
    let i = 0;
    function say(txt) { bubble.textContent = txt; bubble.classList.add("show"); clearTimeout(say._t); say._t = setTimeout(() => bubble.classList.remove("show"), 5000); }
    m.addEventListener("click", () => { say(TIPS[i++ % TIPS.length]); window.FX && FX.burst(innerWidth - 80, innerHeight - 80, 10); });
    setTimeout(() => say("psst. it's just pineapple in koolaid in a jar."), 2500);
    setInterval(() => { if (Math.random() < 0.5) say(TIPS[(Math.random() * TIPS.length) | 0]); }, 16000);
  }

  /* ---------------- GAMES / onOpen hooks ---------------- */
  const GAMES = Object.assign({
    secretBurst() {
      let n = 0;
      const id = setInterval(() => { window.FX && FX.burst(innerWidth * Math.random(), innerHeight); if (++n > 6) clearInterval(id); }, 120);
    },
  }, window.JARS_GAMES || {});

  /* ---------------- KONAMI EASTER EGG ---------------- */
  const KON = [38,38,40,40,37,39,37,39,66,65]; let kbuf = [];
  addEventListener("keydown", (e) => {
    kbuf.push(e.keyCode); kbuf = kbuf.slice(-KON.length);
    if (KON.join() === kbuf.join()) openWindow("secret");
  });

  /* ---------------- GO ---------------- */
  document.addEventListener("DOMContentLoaded", boot);
})();
