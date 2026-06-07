/* ============================================================
   FX.js — procedural background: animated tropical gradient +
   rising koolaid juice-bubbles + drifting pineapple chunks.
   Pure canvas, no deps. Respects prefers-reduced-motion.
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

  // --- particles ---
  const COLORS = ["#ffd60a", "#ff9e00", "#ff2d55", "#00e5ff", "#b6ff00", "#7b2ff7"];
  const bubbles = [];
  const COUNT = reduce ? 0 : 70;
  function spawn(y) {
    return {
      x: Math.random() * W,
      y: y == null ? Math.random() * H : y,
      r: (4 + Math.random() * 16) * dpr,
      vy: (0.2 + Math.random() * 0.9) * dpr,
      vx: (Math.random() - 0.5) * 0.4 * dpr,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: 0.25 + Math.random() * 0.4,
      wob: Math.random() * Math.PI * 2,
    };
  }
  for (let i = 0; i < COUNT; i++) bubbles.push(spawn());

  let t = 0;
  function frame() {
    t += 0.005;
    // animated tropical gradient background
    const g = ctx.createLinearGradient(0, 0, W, H);
    const shift = (Math.sin(t) + 1) / 2;
    g.addColorStop(0, "#1a0030");
    g.addColorStop(0.4 + shift * 0.2, "#3a0d4f");
    g.addColorStop(1, "#5e0a2e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // soft radial glow that pulses
    const cx = W * (0.5 + Math.sin(t * 0.7) * 0.15);
    const cy = H * (0.45 + Math.cos(t * 0.5) * 0.12);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
    rg.addColorStop(0, "rgba(255,157,0,0.18)");
    rg.addColorStop(1, "rgba(255,157,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // bubbles
    for (const b of bubbles) {
      b.y -= b.vy;
      b.wob += 0.03;
      b.x += b.vx + Math.sin(b.wob) * 0.4 * dpr;
      if (b.y + b.r < 0) Object.assign(b, spawn(H + b.r));
      ctx.beginPath();
      ctx.globalAlpha = b.a;
      ctx.fillStyle = b.c;
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.globalAlpha = b.a * 0.6;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
  if (reduce) frame(); // one static paint

  // expose a "juice burst" used by clicks / mini interactions
  window.FX = {
    burst(px, py, n = 18) {
      // temporarily add fast-rising colored particles near a point
      for (let i = 0; i < n; i++) {
        const b = spawn(py * dpr);
        b.x = px * dpr + (Math.random() - 0.5) * 60 * dpr;
        b.vy = (2 + Math.random() * 4) * dpr;
        b.r = (3 + Math.random() * 8) * dpr;
        bubbles.push(b);
      }
      // trim back to baseline so it doesn't grow forever
      while (bubbles.length > COUNT + 60) bubbles.shift();
    },
  };
})();
