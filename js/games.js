/* ============================================================
   GAMES.js — onOpen hooks registered on window.JARS_GAMES
   - initFlavors : the all-flavors palette (re-themes the OS)
   - initSweeper : Jarsweeper (Minesweeper reskin, mines = purple men)
   - initDoom    : DOOMAID (raycaster; kool-aid men enemies, jar pickups)
   ============================================================ */
window.JARS_GAMES = (function () {

  /* ---------------- FLAVORS ---------------- */
  function initFlavors(win) {
    const grid = win.querySelector("#flavor-grid");
    if (!grid) return;
    (window.JARS_CONTENT.flavors || []).forEach((f) => {
      const b = document.createElement("button");
      b.style.cssText =
        `border:3px solid #000;box-shadow:3px 3px 0 #000;color:#fff;font-weight:900;` +
        `text-transform:uppercase;font-size:12px;padding:14px 6px;background:${f.c};text-shadow:1px 1px 0 #0008`;
      b.textContent = f.name;
      b.addEventListener("click", () => {
        window.JARS_setFlavor && window.JARS_setFlavor(f.c);
        const r = b.getBoundingClientRect();
        window.FX && window.FX.burst(r.left + r.width / 2, r.top, 14);
      });
      grid.appendChild(b);
    });
  }

  /* ---------------- JARSWEEPER ---------------- */
  function initSweeper(win) {
    const host = win.querySelector("#sw-grid");
    const N = 9, MINES = 12;
    const status = win.querySelector("#sw-status");
    const minesEl = win.querySelector("#sw-mines");

    function build() {
      let cells = [], over = false, revealed = 0;
      minesEl.textContent = MINES;
      status.textContent = "dig in";
      // layout
      const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ mine: false, r: false, f: false, n: 0 })));
      // mines
      let placed = 0;
      while (placed < MINES) {
        const y = (Math.random() * N) | 0, x = (Math.random() * N) | 0;
        if (!grid[y][x].mine) { grid[y][x].mine = true; placed++; }
      }
      // counts
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (grid[y][x].mine) continue;
        let c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < N && nx >= 0 && nx < N && grid[ny][nx].mine) c++;
        }
        grid[y][x].n = c;
      }
      // dom
      host.innerHTML = "";
      host.style.cssText += `display:grid;grid-template-columns:repeat(${N},24px);gap:2px;background:#9a9a9a`;
      const COLORS = ["", "#1b6dff", "#0a7d2c", "#d80c1f", "#5b2a86", "#7a4a00", "#0a7d7d", "#000", "#555"];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const b = document.createElement("button");
        b.style.cssText = "width:24px;height:24px;font-weight:900;font-size:13px;border:2px solid;border-color:#fff #404040 #404040 #fff;background:#c3c3c3";
        const cell = grid[y][x];
        function reveal(y, x) {
          const c = grid[y][x];
          if (c.r || c.f || over) return;
          c.r = true; revealed++;
          c.btn.style.borderColor = "#9a9a9a";
          c.btn.style.background = "#cfcbc4";
          if (c.mine) { c.btn.textContent = "🟣"; lose(); return; }
          if (c.n) { c.btn.textContent = c.n; c.btn.style.color = COLORS[c.n]; }
          else {
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny >= 0 && ny < N && nx >= 0 && nx < N) reveal(ny, nx);
            }
          }
          if (revealed === N * N - MINES) win_();
        }
        b.addEventListener("click", () => reveal(y, x));
        b.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          if (cell.r || over) return;
          cell.f = !cell.f; b.textContent = cell.f ? "🚩" : "";
        });
        cell.btn = b; cell.reveal = reveal;
        host.appendChild(b);
      }
      function lose() {
        over = true; status.textContent = "💀 BUSTED";
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y][x].mine && !grid[y][x].r) grid[y][x].btn.textContent = "🟣";
      }
      function win_() { over = true; status.textContent = "😎 ALL JARS"; window.FX && window.FX.burst(innerWidth / 2, innerHeight / 2, 30); }
    }
    win.querySelector("#sw-reset").addEventListener("click", build);
    build();
  }

  /* ---------------- DOOMAID (raycaster) ---------------- */
  const MAP = [
    1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,1,
    1,0,1,0,0,1,0,1,
    1,0,0,0,0,0,0,1,
    1,0,0,1,1,0,0,1,
    1,0,1,0,0,0,0,1,
    1,0,0,0,0,1,0,1,
    1,1,1,1,1,1,1,1,
  ];
  const MW = 8;
  const mapAt = (x, y) => MAP[(y | 0) * MW + (x | 0)] || 0;

  function initDoom(win) {
    const cv = win.querySelector("#doom-canvas"); if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue("--punch").trim() || "#ff2d55";

    const p = { x: 3.5, y: 3.5, a: 0 };
    let dirX = 1, dirY = 0, planeX = 0, planeY = 0.66;
    let hp = 100, jarsGot = 0;
    const enemies = [
      { x: 5.5, y: 5.5, alive: true }, { x: 6.5, y: 2.5, alive: true },
      { x: 2.5, y: 6.5, alive: true }, { x: 5.5, y: 1.5, alive: true },
    ];
    const jars = [{ x: 1.5, y: 1.5, got: false }, { x: 6.5, y: 6.5, got: false }, { x: 3.5, y: 4.5, got: false }];
    const zbuf = new Float32Array(W);

    const keys = {};
    function kd(e) { keys[e.key.toLowerCase()] = true; if ([" ", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault(); }
    function ku(e) { keys[e.key.toLowerCase()] = false; }
    addEventListener("keydown", kd); addEventListener("keyup", ku);
    cv.addEventListener("mousemove", (e) => { p.a += (e.movementX || 0) * 0.003; });
    cv.addEventListener("click", () => { cv.requestPointerLock && cv.requestPointerLock(); shoot(); });

    function setDir() {
      dirX = Math.cos(p.a); dirY = Math.sin(p.a);
      planeX = -Math.sin(p.a) * 0.66; planeY = Math.cos(p.a) * 0.66;
    }
    function tryMove(nx, ny) {
      if (mapAt(nx, p.y) === 0) p.x = nx;
      if (mapAt(p.x, ny) === 0) p.y = ny;
    }
    function shoot() {
      // kill nearest enemy near the crosshair (center column)
      let best = null, bestd = 6;
      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx) - p.a;
        const na = Math.atan2(Math.sin(ang), Math.cos(ang));
        if (Math.abs(na) < 0.18 && dist < bestd) { best = e; bestd = dist; }
      }
      if (best) { best.alive = false; window.FX && window.FX.burst(innerWidth / 2, innerHeight / 2, 12); }
    }

    function loop() {
      if (!win.isConnected) { removeEventListener("keydown", kd); removeEventListener("keyup", ku); return; }
      if (win.classList.contains("is-min")) { requestAnimationFrame(loop); return; }
      setDir();
      const spd = 0.045, rot = 0.03;
      if (keys["w"]) tryMove(p.x + dirX * spd, p.y + dirY * spd);
      if (keys["s"]) tryMove(p.x - dirX * spd, p.y - dirY * spd);
      if (keys["a"]) tryMove(p.x + dirY * spd, p.y - dirX * spd);
      if (keys["d"]) tryMove(p.x - dirY * spd, p.y + dirX * spd);
      if (keys["arrowleft"]) p.a -= rot;
      if (keys["arrowright"]) p.a += rot;
      if (keys[" "]) { keys[" "] = false; shoot(); }

      // ceiling / floor
      ctx.fillStyle = "#1a0030"; ctx.fillRect(0, 0, W, H / 2);
      ctx.fillStyle = "#2a0a14"; ctx.fillRect(0, H / 2, W, H / 2);

      // walls (DDA)
      const col = accent();
      for (let x = 0; x < W; x++) {
        const cameraX = (2 * x) / W - 1;
        const rdx = dirX + planeX * cameraX, rdy = dirY + planeY * cameraX;
        let mx = p.x | 0, my = p.y | 0;
        const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
        let stepX, stepY, sdx, sdy;
        if (rdx < 0) { stepX = -1; sdx = (p.x - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - p.x) * ddx; }
        if (rdy < 0) { stepY = -1; sdy = (p.y - my) * ddy; } else { stepY = 1; sdy = (my + 1 - p.y) * ddy; }
        let side = 0, hit = 0;
        while (!hit) {
          if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
          if (mapAt(mx, my)) hit = 1;
        }
        const dist = side === 0 ? sdx - ddx : sdy - ddy;
        zbuf[x] = dist;
        const h = Math.min(H, (H / dist) | 0);
        const y0 = (H - h) / 2;
        ctx.fillStyle = side === 1 ? shade(col, 0.6) : col;
        ctx.fillRect(x, y0, 1, h);
      }

      // sprites (jars + enemies), far to near
      const sprites = [];
      for (const j of jars) if (!j.got) sprites.push({ ...j, kind: "jar", ref: j });
      for (const e of enemies) if (e.alive) sprites.push({ ...e, kind: "foe", ref: e });
      sprites.sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y));
      const invDet = 1 / (planeX * dirY - dirX * planeY);
      for (const s of sprites) {
        const sx = s.x - p.x, sy = s.y - p.y;
        const tx = invDet * (dirY * sx - dirX * sy);
        const ty = invDet * (-planeY * sx + planeX * sy);
        if (ty <= 0.2) continue;
        const screenX = (W / 2) * (1 + tx / ty);
        const size = Math.min(H, Math.abs((H / ty) | 0));
        const top = (H - size) / 2, half = size / 2;
        if (screenX > -half && screenX < W + half && ty < (zbuf[Math.max(0, Math.min(W - 1, screenX | 0))] || 99)) {
          if (s.kind === "jar") drawJar(ctx, screenX, top + size * 0.25, size * 0.5);
          else drawFoe(ctx, screenX, top, size);
        }
        // pickups / damage
        const d = Math.hypot(sx, sy);
        if (s.kind === "jar" && d < 0.5) { s.ref.got = true; jarsGot++; win.querySelector("#doom-jars").textContent = jarsGot; }
        if (s.kind === "foe" && d < 0.9) { hp = Math.max(0, hp - 0.4); win.querySelector("#doom-hp").textContent = hp | 0; }
      }

      // crosshair + gun
      ctx.fillStyle = "#fff";
      ctx.fillRect(W / 2 - 5, H / 2, 10, 1); ctx.fillRect(W / 2, H / 2 - 5, 1, 10);
      ctx.fillStyle = "#ffd60a"; ctx.fillRect(W / 2 - 16, H - 24, 32, 24);

      if (hp <= 0) {
        ctx.fillStyle = "rgba(120,0,0,.6)"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
        ctx.fillText("YOU GOT JARRED", W / 2, H / 2);
        ctx.textAlign = "left";
        return;
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  function shade(hex, f) {
    const h = hex.replace("#", "");
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const r = (parseInt(n.slice(0, 2), 16) * f) | 0, g = (parseInt(n.slice(2, 4), 16) * f) | 0, b = (parseInt(n.slice(4, 6), 16) * f) | 0;
    return `rgb(${r},${g},${b})`;
  }
  function drawFoe(ctx, cx, top, size) {
    const w = size * 0.6, x = cx - w / 2;
    ctx.fillStyle = "#7b2ff7"; ctx.fillRect(x, top, w, size);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w * 0.2, top + size * 0.3, w * 0.18, size * 0.18);
    ctx.fillRect(x + w * 0.6, top + size * 0.3, w * 0.18, size * 0.18);
    ctx.fillStyle = "#2a0a52";
    ctx.fillRect(x + w * 0.3, top + size * 0.6, w * 0.4, size * 0.22);
  }
  function drawJar(ctx, cx, top, size) {
    const w = size * 0.7, x = cx - w / 2;
    ctx.fillStyle = "#ffd60a"; ctx.fillRect(x, top, w, size);
    ctx.fillStyle = "#ff2d55"; ctx.fillRect(x, top, w, size * 0.18);
  }

  return { initFlavors, initSweeper, initDoom };
})();
