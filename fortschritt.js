// =====================================================================
//  FORTSCHRITT – merkt sich, wo man stehengeblieben ist
//  Alles bleibt NUR auf diesem Handy (Browser-Speicher „localStorage“).
//  Keine Anmeldung, nichts geht ins Internet. Wer die Browserdaten löscht,
//  fängt wieder von vorne an.
//
//  Gespeichert wird (unter „igt-checker-fortschritt“):
//    zuletzt  – welches Blatt zuletzt offen war und wann
//    blaetter – pro Blatt: Eingaben, welche Aufgaben geprüft sind, erledigt ja/nein
//  Ein Blatt ist erledigt, wenn alle Pflicht-Aufgaben einmal geprüft wurden
//  (egal ob alles grün). Blätter ohne Aufgaben: Knopf „Blatt erledigt“.
// =====================================================================
(function () {
  "use strict";

  var SCHLUESSEL = "igt-checker-fortschritt";

  function laden() {
    try {
      var d = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
      if (d && typeof d === "object" && d.blaetter) return d;
    } catch (e) { /* kaputt oder gesperrt: neu anfangen */ }
    return { zuletzt: null, blaetter: {} };
  }

  function speichern(d) {
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(d)); } catch (e) { /* privater Modus: dann eben ohne */ }
  }

  // "…/igt-checker/inhalte/w3/blatt-2.html" → "inhalte/w3/blatt-2.html" (so wie in inhalte.js)
  function blattName(pfad) {
    var m = String(pfad || "").match(/inhalte\/w\d+\/blatt-\d+\.html/);
    return m ? m[0] : null;
  }

  function blatt(datei) {
    return laden().blaetter[datei] || null;
  }

  // Ein Blatt ändern: f bekommt den gespeicherten Eintrag (oder einen leeren) und darf ihn ändern
  function aendern(datei, f) {
    var d = laden();
    var b = d.blaetter[datei] || { geprueft: [], anzahl: 0, fertig: false, werte: null };
    f(b);
    b.zeit = Date.now();
    d.blaetter[datei] = b;
    d.zuletzt = { datei: datei, zeit: b.zeit };
    speichern(d);
    return b;
  }

  function vergessen(datei) {
    var d = laden();
    delete d.blaetter[datei];
    speichern(d);
  }

  // "heute", "gestern", "vor 3 Tagen"
  function wann(zeit) {
    if (!zeit) return "";
    var heute = new Date(); heute.setHours(0, 0, 0, 0);
    var tag = new Date(zeit); tag.setHours(0, 0, 0, 0);
    var tage = Math.round((heute - tag) / 86400000);
    if (tage <= 0) return "heute";
    if (tage === 1) return "gestern";
    return "vor " + tage + " Tagen";
  }

  // Quiz: bestes Ergebnis pro Woche merken ("…/inhalte/w3/quiz.html" → "w3")
  function quizMerken(pfad, richtig, gesamt) {
    var m = String(pfad || "").match(/inhalte\/(w\d+)\/quiz\.html/);
    if (!m) return;
    var d = laden();
    d.quiz = d.quiz || {};
    var alt = d.quiz[m[1]];
    if (!alt || richtig >= alt.richtig) d.quiz[m[1]] = { richtig: richtig, gesamt: gesamt, zeit: Date.now() };
    speichern(d);
  }

  window.FORTSCHRITT = { laden: laden, blatt: blatt, aendern: aendern, vergessen: vergessen, blattName: blattName, wann: wann, quizMerken: quizMerken };

  // ---------- Auf einem Blatt ----------
  var datei = blattName(location.pathname);
  if (!datei) return;

  // Merken: dieses Blatt war zuletzt offen
  var d = laden();
  d.zuletzt = { datei: datei, zeit: Date.now() };
  speichern(d);

  // Blätter OHNE Aufgaben zum Prüfen (nur lesen / am Papier): Knopf „Blatt erledigt“ ans Ende.
  // Blätter mit Aufgaben erledigt ausfuellen.js.
  document.addEventListener("DOMContentLoaded", function () {
    if (window.AUSFUELLEN) return;
    var haupt = document.querySelector(".blatt");
    if (!haupt) return;
    var box = document.createElement("div");
    box.className = "pruef-box";
    var knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "gross-knopf";
    var info = document.createElement("p");
    info.className = "pruef-ergebnis";
    info.setAttribute("aria-live", "polite");
    function zeigen() {
      var b = blatt(datei);
      var fertig = !!(b && b.fertig);
      knopf.textContent = fertig ? "✓ Erledigt" : "Blatt erledigt";
      knopf.setAttribute("aria-pressed", fertig ? "true" : "false");
      info.textContent = fertig ? "Super! Tippe oben auf ← und mach weiter." : "";
      info.className = "pruef-ergebnis" + (fertig ? " gut" : "");
    }
    knopf.addEventListener("click", function () {
      aendern(datei, function (b) { b.fertig = !b.fertig; b.anzahl = 0; });
      zeigen();
    });
    var hinweis = document.createElement("p");
    hinweis.className = "tipp";
    hinweis.textContent = "Fertig gelesen und am Papier gezeichnet? Dann tippe hier:";
    box.appendChild(hinweis);
    box.appendChild(knopf);
    box.appendChild(info);
    haupt.appendChild(box);
    zeigen();
  });
})();
