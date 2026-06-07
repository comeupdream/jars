/* ============================================================
   CURSORS.js — Custom Cursor app + procedural themed cursors.
   Cursors are inline SVG (base64) so they need no asset files.
   Selection persists in localStorage and applies site-wide.
   Registers initCursors() on window.JARS_GAMES (loaded before os.js).
   ============================================================ */
(function () {
  function toCursor(svg, hx, hy) {
    return 'url("data:image/svg+xml;base64,' + btoa(svg) + '") ' + hx + " " + hy + ", auto";
  }

  var ARROW =
    "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='28' viewBox='0 0 20 28'>" +
    "<path d='M2 2 L2 22 L7 17 L11 26 L14 25 L10 16 L17 16 Z' fill='#fff' stroke='#000' stroke-width='1.5'/></svg>";

  var PINEAPPLE =
    "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewBox='0 0 40 48'>" +
    "<g stroke='#000' stroke-width='2' stroke-linejoin='round'>" +
    "<path d='M20 3 L13 15 L20 13 L27 15 Z' fill='#43a047'/>" +
    "<path d='M20 5 L11 17 L20 14 Z' fill='#2e7d32'/>" +
    "<path d='M20 5 L29 17 L20 14 Z' fill='#2e7d32'/>" +
    "<ellipse cx='20' cy='31' rx='13' ry='15' fill='#ffb300'/></g>" +
    "<g stroke='#8a4b00' stroke-width='1.4' opacity='.85'>" +
    "<line x1='9' y1='25' x2='31' y2='35'/><line x1='9' y1='33' x2='31' y2='43'/>" +
    "<line x1='31' y1='25' x2='9' y2='35'/><line x1='31' y1='33' x2='9' y2='43'/></g></svg>";

  var JAR =
    "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='48' viewBox='0 0 40 48'>" +
    "<g stroke='#000' stroke-width='2' stroke-linejoin='round'>" +
    "<rect x='10' y='5' width='20' height='7' rx='2' fill='#7b2ff7'/>" +
    "<rect x='8' y='12' width='24' height='31' rx='5' fill='#ffffff'/>" +
    "<path d='M9 23 q11 -4 22 0 v14 q-11 4 -22 0 z' fill='#ff2d55'/></g>" +
    "<rect x='12' y='15' width='3' height='24' rx='1.5' fill='#fff' opacity='.6'/></svg>";

  var SPEAR =
    "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='44' viewBox='0 0 36 44'>" +
    "<g stroke='#000' stroke-width='2' stroke-linejoin='round'>" +
    "<path d='M14 4 L22 4 L18 10 Z' fill='#43a047'/>" +
    "<rect x='12' y='9' width='12' height='30' rx='6' fill='#ffd60a'/></g>" +
    "<g stroke='#c98a00' stroke-width='1.3' opacity='.8'>" +
    "<line x1='14' y1='15' x2='22' y2='19'/><line x1='14' y1='21' x2='22' y2='25'/>" +
    "<line x1='14' y1='27' x2='22' y2='31'/><line x1='14' y1='33' x2='22' y2='37'/></g></svg>";

  var DROP =
    "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='42' viewBox='0 0 32 42'>" +
    "<path d='M16 2 C16 2 27 20 27 28 A11 11 0 0 1 5 28 C5 20 16 2 16 2 Z' fill='#7b2ff7' stroke='#000' stroke-width='2'/>" +
    "<ellipse cx='12' cy='27' rx='3' ry='5' fill='#fff' opacity='.55'/></svg>";

  var LIST = [
    { id: "default",   name: "Default",   hx: 2,  hy: 2, svg: ARROW },
    { id: "pineapple", name: "Pineapple", hx: 20, hy: 3, svg: PINEAPPLE },
    { id: "jar",       name: "Koolaid Jar", hx: 20, hy: 5, svg: JAR },
    { id: "spear",     name: "Spear",     hx: 18, hy: 4, svg: SPEAR },
    { id: "drop",      name: "Koolaid Drop", hx: 16, hy: 2, svg: DROP },
  ];
  var byId = {};
  LIST.forEach(function (c) { c.css = toCursor(c.svg, c.hx, c.hy); byId[c.id] = c; });

  function apply(id) {
    var c = byId[id] || byId.default;
    document.body.style.cursor = c.css;
    document.documentElement.dataset.cursor = c.id;
    try { localStorage.setItem("jars-cursor", c.id); } catch (e) {}
  }
  function applySaved() {
    var id = "default";
    try { id = localStorage.getItem("jars-cursor") || "default"; } catch (e) {}
    apply(id);
  }
  if (document.body) applySaved();
  else document.addEventListener("DOMContentLoaded", applySaved);

  window.JARS_CURSORS = {
    list: LIST,
    apply: apply,
    current: function () { return document.documentElement.dataset.cursor || "default"; },
  };

  // register the app's onOpen hook so os.js can call it
  window.JARS_GAMES = Object.assign(window.JARS_GAMES || {}, {
    initCursors: function (win) {
      var grid = win.querySelector("#cursor-grid");
      if (!grid) return;
      var cur = window.JARS_CURSORS.current();
      LIST.forEach(function (c) {
        var b = document.createElement("button");
        b.className = "cursor-option" + (c.id === cur ? " active" : "");
        b.innerHTML =
          '<span class="cursor-option__pic">' + c.svg + "</span>" +
          '<span class="cursor-option__name">' + c.name + "</span>";
        b.addEventListener("click", function () {
          window.JARS_CURSORS.apply(c.id);
          grid.querySelectorAll(".cursor-option").forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          var r = b.getBoundingClientRect();
          window.FX && window.FX.burst(r.left + r.width / 2, r.top, 10);
        });
        grid.appendChild(b);
      });
    },
  });
})();
