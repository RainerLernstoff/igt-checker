// =====================================================================
//  PROGRAMM der App „Vorbereitungskurs“
//  Liest die Inhaltsliste (inhalte.js) und baut daraus die Knöpfe.
//  Welche Seite gerade zu sehen ist, steht in der Adresse nach dem #:
//    #/              → Startseite: Fächer und Wochen
//    #/fach/fk       → alle Wochen von Fachkunde
//    #/woche/w1      → Blätter, Lernkarten und Quiz von Woche 1
// =====================================================================
(function () {
  "use strict";

  var haupt = document.getElementById("haupt");
  var titel = document.getElementById("titel");
  var zurueck = document.getElementById("zurueck");

  // Einen großen Knopf bauen (eigentlich ein Link, darum <a>).
  // Ohne Ziel wird er grau und man kann ihn nicht antippen („kommt bald“).
  function knopf(name, info, ziel) {
    var a = document.createElement(ziel ? "a" : "div");
    a.className = ziel ? "knopf" : "knopf aus";
    if (ziel) a.href = ziel;
    var gross = document.createElement("span");
    gross.className = "knopf-name";
    gross.textContent = name;
    a.appendChild(gross);
    if (info) {
      var klein = document.createElement("span");
      klein.className = "knopf-info";
      klein.textContent = info;
      a.appendChild(klein);
    }
    return a;
  }

  function suche(liste, id) {
    if (!liste || !id) return null;
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return null;
  }

  // Knopf für eine Woche: grau, solange es noch keine Teile gibt
  function wochenKnopf(w) {
    var fertig = w.teile.length > 0;
    return knopf("Woche " + w.nr + ": " + w.name, fertig ? w.info : "kommt bald", fertig ? "#/woche/" + w.id : null);
  }

  function absatz(text, klasse) {
    var p = document.createElement(klasse === "abschnitt" ? "h2" : "p");
    p.className = klasse;
    p.textContent = text;
    return p;
  }

  function liste(knoepfe) {
    var nav = document.createElement("nav");
    nav.className = "knopf-liste";
    knoepfe.forEach(function (k) { nav.appendChild(k); });
    return nav;
  }

  function zeichnen() {
    // Adresse zerlegen: "#/woche/w1" → ["woche", "w1"]
    var teile = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    var fach = teile[0] === "fach" ? suche(INHALTE.faecher, teile[1]) : null;
    var woche = teile[0] === "woche" ? suche(INHALTE.wochen, teile[1]) : null;
    var inhalt = [], ueberschrift = null, zurueckZiel = null;

    if (woche) {
      ueberschrift = "Woche " + woche.nr;
      zurueckZiel = "#/";
      inhalt.push(absatz(woche.name + ": " + woche.info, "hinweis"));
      if (woche.teile.length) {
        inhalt.push(liste(woche.teile.map(function (t) { return knopf(t.name, t.info, t.datei); })));
      } else {
        inhalt.push(absatz("Diese Woche kommt bald.", "hinweis"));
      }
    } else if (fach) {
      ueberschrift = fach.name;
      zurueckZiel = "#/";
      inhalt.push(absatz("Wähle eine Woche.", "hinweis"));
      inhalt.push(liste(INHALTE.wochen.filter(function (w) { return w.faecher.indexOf(fach.id) >= 0; }).map(wochenKnopf)));
    } else {
      inhalt.push(absatz("Vorbereitungskurs Installations- und Gebäudetechnik", "untertitel"));
      inhalt.push(absatz("Wähle ein Fach oder eine Woche.", "hinweis"));
      inhalt.push(absatz("Fächer", "abschnitt"));
      inhalt.push(liste(INHALTE.faecher.map(function (f) { return knopf(f.name, f.info, "#/fach/" + f.id); })));
      inhalt.push(absatz("Kursablauf: 10 Wochen", "abschnitt"));
      inhalt.push(liste(INHALTE.wochen.map(wochenKnopf)));
    }

    // Auf der Startseite steht der Name im Logo-Stil
    titel.textContent = ueberschrift || "IGT Checker";
    titel.classList.toggle("logo", !zurueckZiel);
    document.title = zurueckZiel ? ueberschrift + " – IGT Checker" : "IGT Checker";
    if (zurueckZiel) { zurueck.href = zurueckZiel; zurueck.hidden = false; } else { zurueck.hidden = true; }

    haupt.innerHTML = "";
    inhalt.forEach(function (el) { haupt.appendChild(el); });
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", zeichnen);
  zeichnen();

  // Offline-Speicher einschalten (geht nur über http/https, nicht als Datei)
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(function () { /* ohne Offline geht es auch */ });
  }
})();
