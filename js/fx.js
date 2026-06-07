/* ============================================================
   FX.js — transparent overlay canvas.
   The animated tropical gradient + bubble "screensaver" was
   replaced by the background video (assets/desktop-bg.mp4).
   This now only renders short-lived "juice burst" particles on
   interaction, painted over the video. Pure canvas, no deps.
   ============================================================ */
(function () {
  const canvas = document.getElementById("fx-bg");
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
  }
  resize();
  addEventListener("resize", resize);

  const COLORS = ["#ffd60a", "#ff9e00", "#ff2d55", "#00e5ff", "#b6ff00", "#7b2ff7"];
  const parts = []; // only burst particles now

  function makeBurst(px, py) {
    return {
      x: px * dpr + (Math.random() - 0.5) * 60 * dpr,
      y: py * dpr,
      r: (3 + Math.random() * 9) * dpr,
      vy: (2 + Math.random() * 4) * dpr,
      vx: (Math.random() - 0.5) * 1.2 * dpr,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: 0.85,
      wob: Math.random() * Math.PI * 2,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, W, H); // transparent: video shows through
    for (let i = parts.length - 1; i >= 0; i--) {
      const b = parts[i];
      b.y -= b.vy;
      b.wob += 0.05;
      b.x += b.vx + Math.sin(b.wob) * 0.5 * dpr;
      b.a -= 0.012;
      if (b.a <= 0 || b.y + b.r < 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = b.a;
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = b.a * 0.6;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();

  window.FX = {
    burst(px, py, n = 18) {
      if (reduce) n = Math.min(n, 6);
      for (let i = 0; i < n; i++) parts.push(makeBurst(px, py));
      if (parts.length > 400) parts.splice(0, parts.length - 400);
    },
  };
})();
