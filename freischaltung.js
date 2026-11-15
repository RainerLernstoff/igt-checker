// =====================================================================
//  FREISCHALTUNG – welche Wochen sind offen?
//  Bis einschließlich OFFEN_BIS ist der ganze Kurs offen (Ansehen für die Landesinnungen).
//  Danach ist die App eine Probe-Version: nur die Wochen in IMMER_FREI sind offen,
//  die anderen Wochen zeigen „🔒 … gibt es in der Vollversion“.
//
//  Verlängern = nur OFFEN_BIS ändern, neu bauen, hochladen (die PDFs ändern sich dabei nicht).
//  Das Datum kommt von der Uhr am Handy. Das ist ein einfacher Schutz, kein echter.
//
//  Zum Testen am PC (nur localhost): im Browser
//    localStorage.setItem("igt-checker-testdatum", "2026-12-21")
//  tut so, als wäre heute der 21.12.2026. Wieder weg: localStorage.removeItem("igt-checker-testdatum")
// =====================================================================
(function () {
  "use strict";

  var OFFEN_BIS = "2026-12-20";
  var IMMER_FREI = ["w1", "w2"];

  function zwei(n) { return (n < 10 ? "0" : "") + n; }

  // Heutiges Datum als "JJJJ-MM-TT" (Uhr am Gerät)
  function heute() {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      try {
        var t = localStorage.getItem("igt-checker-testdatum");
        if (/^\d{4}-\d{2}-\d{2}$/.test(t || "")) return t;
      } catch (e) { /* ohne Speicher: echtes Datum */ }
    }
    var d = new Date();
    return d.getFullYear() + "-" + zwei(d.getMonth() + 1) + "-" + zwei(d.getDate());
  }

  // Probe-Version? (Beim PDF-Bauen läuft die Seite als Datei: dann nie sperren)
  function probe() {
    if (location.protocol === "file:") return false;
    return heute() > OFFEN_BIS;
  }

  // Ist diese Woche ("w3") gesperrt?
  function gesperrt(wocheId) {
    return probe() && IMMER_FREI.indexOf(wocheId) < 0;
  }

  window.FREISCHALTUNG = { probe: probe, gesperrt: gesperrt, offenBis: OFFEN_BIS, immerFrei: IMMER_FREI.slice() };

  // ---------- Auf einer Seite einer gesperrten Woche (Blatt, Lernkarten, Quiz) ----------
  var m = location.pathname.match(/inhalte\/(w\d+)\//);
  if (!m || !gesperrt(m[1])) return;
  var nr = m[1].slice(1);

  // Inhalt gleich verstecken, damit er nicht kurz aufblitzt
  document.documentElement.classList.add("seite-gesperrt");

  document.addEventListener("DOMContentLoaded", function () {
    var alt = document.querySelector("main");
    if (!alt) return;
    var neu = document.createElement("main");
    neu.className = "app gesperrt-box";
    neu.innerHTML =
      '<p class="begruessung">🔒 Woche ' + nr + ' gibt es in der Vollversion.</p>' +
      '<p class="untertitel">Woche 1 und 2 kannst du frei machen.</p>' +
      '<nav class="knopf-liste"><a class="knopf weiter" href="../../index.html#/">' +
      '<span class="knopf-name">▶ Zur Startseite</span>' +
      '<span class="knopf-info">Woche 1 und 2</span></a></nav>' +
      '<a class="link-klein" href="../../info.html">Infos für Eltern und Lehrbetriebe</a>';
    alt.parentNode.replaceChild(neu, alt);
    document.documentElement.classList.remove("seite-gesperrt");
  });
})();
