/* ============================================================
   VERSION.js — obvious build indicator (top-right).
   BUILD is bumped +1 on EVERY push so you can confirm a Render
   deploy went live just by watching the number change.
   ============================================================ */
(function () {
  var BUILD = 1;                       // <-- +1 every push
  var VERSION = "v0." + BUILD;
  window.JARS_BUILD = BUILD;
  window.JARS_VERSION = VERSION;

  function mount() {
    var b = document.createElement("div");
    b.className = "version-badge";
    b.title = "JARSOS build " + BUILD;
    b.innerHTML =
      '<span class="version-badge__v">JARSOS</span>' +
      '<b class="version-badge__num">' + VERSION + '</b>' +
      '<span class="version-badge__b">BUILD ' + BUILD + '</span>';
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
