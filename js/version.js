/* ============================================================
   VERSION.js — obvious build indicator (top-right).
   BUILD bumps +1 each push; COMMIT is stamped by build.sh at
   deploy time (Render RENDER_GIT_COMMIT) so it always matches
   exactly what's live.
   ============================================================ */
(function () {
  var BUILD = 4;                       // <-- +1 every push
  var VERSION = "v0." + BUILD;
  var COMMIT = window.JARS_COMMIT || "local";
  var BUILT = window.JARS_BUILT || "dev";
  window.JARS_BUILD = BUILD;
  window.JARS_VERSION = VERSION;

  function mount() {
    var b = document.createElement("div");
    b.className = "version-badge";
    b.title = "JARSOS " + VERSION + " · commit " + COMMIT + " · built " + BUILT;
    b.innerHTML =
      '<span class="version-badge__v">JARSOS</span>' +
      '<b class="version-badge__num">' + VERSION + '</b>' +
      '<span class="version-badge__b">BUILD ' + BUILD + '</span>' +
      '<span class="version-badge__sha">#' + COMMIT + '</span>';
    document.body.appendChild(b);

    // floating "+1" pop on every fresh load
    var pop = document.createElement("div");
    pop.className = "version-pop";
    pop.textContent = "+1";
    b.appendChild(pop);
    requestAnimationFrame(function () { pop.classList.add("go"); });
  }

  if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
