// Hell oder dunkel.
// Am Anfang richtet sich die App nach dem Handy (helles oder dunkles Design).
// Tippt man auf ◐, wird umgeschaltet. Das Handy merkt sich NUR diese Einstellung
// (keine Namen, keine Ergebnisse).
(function () {
  var SCHLUESSEL = "vorbereitungskurs-thema";
  var wurzel = document.documentElement;

  var gemerkt = null;
  try { gemerkt = localStorage.getItem(SCHLUESSEL); } catch (e) { /* privater Modus: egal */ }
  if (gemerkt === "hell" || gemerkt === "dunkel") wurzel.setAttribute("data-thema", gemerkt);

  function jetzt() {
    var t = wurzel.getAttribute("data-thema");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dunkel" : "hell";
  }

  function umschalten() {
    var neu = jetzt() === "dunkel" ? "hell" : "dunkel";
    wurzel.setAttribute("data-thema", neu);
    try { localStorage.setItem(SCHLUESSEL, neu); } catch (e) { /* egal */ }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var knoepfe = document.querySelectorAll("[data-thema-knopf]");
    for (var i = 0; i < knoepfe.length; i++) knoepfe[i].addEventListener("click", umschalten);
  });
})();
