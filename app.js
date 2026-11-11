// =====================================================================
//  PROGRAMM der App „Vorbereitungskurs“
//  Liest die Inhaltsliste (inhalte.js) und baut daraus die Knöpfe.
//  Welche Seite gerade zu sehen ist, steht in der Adresse nach dem #:
//    #/              → Startseite: Begrüßung, „Weiter“-Knopf, So geht's, 10 Wochen, Fächer unten
//    #/fach/fk       → alle Wochen von Fachkunde
//    #/woche/w1      → Blätter, Lernkarten und Quiz von Woche 1 (mit Fortschritt)
//    #/fortschritt   → Mein Fortschritt: Blätter, Punkte, Quiz pro Woche (zum Herzeigen)
//  Den Fortschritt (nur auf diesem Handy) liefert fortschritt.js.
// =====================================================================
(function () {
  "use strict";

  var F = window.FORTSCHRITT || { laden: function () { return { zuletzt: null, blaetter: {} }; }, wann: function () { return ""; } };

  // ---------- Fortschritt auswerten ----------
  function istBlatt(t) { return /blatt-\d+\.html$/.test(t.datei); }

  // Alle Blätter in Kursreihenfolge (W1 Blatt 1 … W10 Blatt 2)
  function alleBlaetter() {
    var liste = [];
    INHALTE.wochen.forEach(function (w) {
      w.teile.forEach(function (t) { if (istBlatt(t)) liste.push({ woche: w, teil: t }); });
    });
    return liste;
  }

  // Wie steht ein Blatt? → { fertig, angefangen, text }
  function stand(t, daten) {
    var b = daten.blaetter[t.datei];
    if (!b) return { fertig: false, angefangen: false, text: "" };
    if (b.fertig) return { fertig: true, angefangen: true, text: "✓ erledigt" };
    var n = b.erledigt || 0;
    if (b.anzahl) return { fertig: false, angefangen: true, text: n + " von " + b.anzahl + " Aufgaben" };
    return { fertig: false, angefangen: true, text: "angefangen" };
  }

  // Wie steht eine Woche? → erledigte Blätter von allen Blättern
  function wochenStand(w, daten) {
    var bl = w.teile.filter(istBlatt);
    var fertig = bl.filter(function (t) { return stand(t, daten).fertig; }).length;
    return { fertig: fertig, alle: bl.length };
  }

  // Wo geht's weiter? Zuerst das zuletzt offene Blatt (wenn nicht fertig),
  // sonst das nächste nicht fertige Blatt danach, sonst das erste nicht fertige überhaupt.
  function weiterZiel(daten) {
    var liste = alleBlaetter();
    var offen = function (x) { return !stand(x.teil, daten).fertig; };
    var z = daten.zuletzt && daten.zuletzt.datei;
    var pos = -1;
    liste.forEach(function (x, i) { if (x.teil.datei === z) pos = i; });
    if (pos >= 0 && offen(liste[pos])) return liste[pos];
    for (var i = pos + 1; i < liste.length; i++) if (offen(liste[i])) return liste[i];
    for (var j = 0; j < liste.length; j++) if (offen(liste[j])) return liste[j];
    return null;   // alles erledigt
  }

  // ---------- Seite „Mein Fortschritt“ (zum Herzeigen für Ausbilder / Berufsschule) ----------
  function fortschrittSeite(daten) {
    var teile = [];
    var heute = new Date();
    var zwei = function (n) { return (n < 10 ? "0" : "") + n; };
    teile.push(absatz("Stand: " + zwei(heute.getDate()) + "." + zwei(heute.getMonth() + 1) + "." + heute.getFullYear(), "untertitel"));

    var bl = alleBlaetter();
    var fertig = bl.filter(function (x) { return stand(x.teil, daten).fertig; }).length;
    teile.push(absatz(fertig + " von " + bl.length + " Blättern erledigt", "begruessung"));

    var balken = document.createElement("div");
    balken.className = "balken";
    balken.setAttribute("role", "img");
    balken.setAttribute("aria-label", Math.round(100 * fertig / bl.length) + " Prozent erledigt");
    var fuell = document.createElement("div");
    fuell.style.width = Math.round(100 * fertig / bl.length) + "%";
    balken.appendChild(fuell);
    teile.push(balken);

    // Punkte aus allen geprüften Aufgaben (letztes Prüfen zählt)
    var p = 0, max = 0;
    Object.keys(daten.blaetter).forEach(function (k) {
      var pk = daten.blaetter[k].punkte || {};
      Object.keys(pk).forEach(function (i) { p += pk[i][0]; max += pk[i][1]; });
    });
    teile.push(absatz(max ? "Punkte in den Blättern: " + p + " von " + max : "Punkte in den Blättern: noch keine Aufgabe geprüft", "untertitel"));

    // Eine Zeile pro Woche
    var tab = document.createElement("div");
    tab.className = "fortschritt-liste";
    INHALTE.wochen.forEach(function (w) {
      if (!w.teile.length) return;
      var s = wochenStand(w, daten);
      var q = daten.quiz && daten.quiz[w.id];
      var zeile = document.createElement("div");
      zeile.className = "fortschritt-zeile" + (s.alle && s.fertig === s.alle ? " fertig" : "");
      var links = document.createElement("span");
      links.className = "fortschritt-woche";
      links.textContent = "Woche " + w.nr + (s.alle && s.fertig === s.alle ? " ✓" : "");
      var rechts = document.createElement("span");
      rechts.className = "fortschritt-zahl";
      rechts.textContent = s.fertig + " von " + s.alle + " · Quiz " + (q ? q.richtig + "/" + q.gesamt : "–");
      zeile.appendChild(links);
      zeile.appendChild(rechts);
      tab.appendChild(zeile);
    });
    teile.push(tab);

    var hinweis = document.createElement("div");
    hinweis.className = "so-gehts";
    hinweis.appendChild(absatz("Zeig diese Seite deinem Ausbilder oder am ersten Schultag deinem Lehrer. Du kannst auch ein Bildschirmfoto machen.", ""));
    teile.push(hinweis);
    return teile;
  }

  function blattNr(t) { var m = t.datei.match(/blatt-(\d+)\.html$/); return m ? m[1] : ""; }

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

  // Kleine Stand-Anzeige rechts im Knopf („✓ fertig“, „1 von 2“)
  function standDazu(k, text) {
    if (!text) return k;
    var s = document.createElement("span");
    s.className = "knopf-stand";
    s.textContent = text;
    k.insertBefore(s, k.firstChild);
    return k;
  }

  // Knopf für eine Woche: grau, solange es noch keine Teile gibt. Mit Fortschritt.
  function wochenKnopf(w, daten, hier, ohneInfo) {
    var fertig = w.teile.length > 0;
    var k = knopf("Woche " + w.nr + ": " + w.name, fertig ? (ohneInfo ? "" : w.info) : "kommt bald", fertig ? "#/woche/" + w.id : null);
    if (!fertig || !daten) return k;
    var s = wochenStand(w, daten);
    if (hier) { k.classList.add("hier"); }
    return standDazu(k, s.alle && s.fertig === s.alle ? "✓ fertig" : s.fertig + " von " + s.alle + (hier ? " · hier bist du" : ""));
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
    var meinFortschritt = teile[0] === "fortschritt";
    var inhalt = [], ueberschrift = null, zurueckZiel = null;
    var daten = F.laden();
    var ziel = weiterZiel(daten);
    var etwasGemacht = Object.keys(daten.blaetter).length > 0;
    var hierWoche = etwasGemacht && ziel ? ziel.woche.id : null;

    if (meinFortschritt) {
      ueberschrift = "Mein Fortschritt";
      zurueckZiel = "#/";
      fortschrittSeite(daten).forEach(function (el) { inhalt.push(el); });
    } else if (woche) {
      ueberschrift = "Woche " + woche.nr;
      zurueckZiel = "#/";
      inhalt.push(absatz(woche.name + ": " + woche.info, "hinweis"));
      if (woche.teile.length) {
        inhalt.push(liste(woche.teile.map(function (t) {
          var k = knopf(t.name, t.info, t.datei);
          if (!istBlatt(t)) return k;
          var s = stand(t, daten);
          if (etwasGemacht && ziel && ziel.teil === t) {
            k.classList.add("hier");
            k.appendChild(absatz("→ Hier geht's weiter", "knopf-weiter"));
          }
          return standDazu(k, s.text);
        })));
        inhalt.push(absatz("Die Woche ist fertig, wenn alle Blätter erledigt sind. Lernkarten und Quiz: zum Schluss.", "untertitel"));
      } else {
        inhalt.push(absatz("Diese Woche kommt bald.", "hinweis"));
      }
    } else if (fach) {
      ueberschrift = fach.name;
      zurueckZiel = "#/";
      inhalt.push(absatz("Wähle eine Woche.", "hinweis"));
      inhalt.push(liste(INHALTE.wochen.filter(function (w) { return w.faecher.indexOf(fach.id) >= 0; })
        .map(function (w) { return wochenKnopf(w, daten, w.id === hierWoche); })));
    } else {
      inhalt.push(absatz("Vorbereitungskurs Installations- und Gebäudetechnik", "untertitel"));
      inhalt.push(absatz("Mach dich fit für die Berufsschule", "begruessung"));
      inhalt.push(absatz("Hier lernst du den Stoff für deinen ersten Lehrgang. Im Betrieb, am Handy, wann du Zeit hast.", "untertitel"));

      // Großer Knopf: dort weitermachen, wo man aufgehört hat
      var weiter;
      if (!ziel) {
        weiter = knopf("✓ Alle Blätter erledigt!", "Wiederhole mit Lernkarten und Quiz.", "#/woche/" + INHALTE.wochen[0].id);
      } else if (!etwasGemacht) {
        weiter = knopf("▶ Los geht's: Woche " + ziel.woche.nr, ziel.woche.name, ziel.teil.datei);
      } else {
        var zuletzt = daten.zuletzt && daten.zuletzt.datei === ziel.teil.datei ? " · zuletzt: " + F.wann(daten.zuletzt.zeit) : "";
        weiter = knopf("▶ Weiter: Woche " + ziel.woche.nr + ", Blatt " + blattNr(ziel.teil),
          ziel.teil.name.replace(/^\d+\s*/, "") + zuletzt, ziel.teil.datei);
      }
      weiter.classList.add("weiter");
      inhalt.push(weiter);

      // So geht's (zum Zuklappen; beim ersten Mal offen)
      var so = document.createElement("details");
      so.className = "so-gehts";
      if (!etwasGemacht) so.open = true;
      var sum = document.createElement("summary");
      sum.textContent = "So geht's";
      so.appendChild(sum);
      var ol = document.createElement("ol");
      ["Erledige eine Woche nach der anderen.",
       "Lies das Blatt. Füll die Kästchen aus.",
       "Tippe auf „Prüfen“: Grün = richtig, Rot = schau noch einmal.",
       "Zum Schluss: Lernkarten und Quiz."].forEach(function (t) {
        var li = document.createElement("li"); li.textContent = t; ol.appendChild(li);
      });
      so.appendChild(ol);
      so.appendChild(absatz("✎ Am Papier = Heft und Bleistift. Rechner: dein Handy.", ""));
      so.appendChild(absatz("Was du machst, merkt sich nur dieses Handy. Wenn du die Browserdaten löschst, ist es weg.", "untertitel"));
      inhalt.push(so);

      inhalt.push(absatz("Dein Kurs: 10 Wochen", "abschnitt"));
      inhalt.push(liste(INHALTE.wochen.map(function (w) { return wochenKnopf(w, daten, w.id === hierWoche, true); })));

      var mf = knopf("Mein Fortschritt", "zum Herzeigen", "#/fortschritt");
      mf.classList.add("mein-fortschritt");
      inhalt.push(mf);

      inhalt.push(absatz("Nach Fach suchen", "abschnitt"));
      var faecher = liste(INHALTE.faecher.map(function (f) { return knopf(f.name, "", "#/fach/" + f.id); }));
      faecher.classList.add("klein");
      inhalt.push(faecher);
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
