// =====================================================================
//  AUSFÜLLEN – macht ein Blatt zum Antippen und Prüfen
//  Felder (input.eintrag) → eintippen.
//  Auswahl (.wahl-gruppe mit button.wahl) → eine Möglichkeit antippen.
//  Kästchen (button.kreuz) → antippen = ✗.
//  Unter jeder Aufgabe ein Knopf „Prüfen“: zeigt grün/rot und die Punkte.
//  Punkte: jedes richtige Feld, jede richtige Auswahl, jedes richtige Kreuz = 1 Punkt.
//  Eingaben und geprüfte Aufgaben merkt sich fortschritt.js NUR auf diesem Handy.
//  Beim Wiederöffnen: „Willkommen zurück“ und weiter bei der ersten ungeprüften Aufgabe.
// =====================================================================
(function () {
  "use strict";
  window.AUSFUELLEN = true;   // fortschritt.js: dieses Blatt hat Aufgaben zum Prüfen

  // Die richtige Antwort steht leicht verschlüsselt im Blatt (data-s), damit man sie nicht sofort sieht.
  function soll(el) {
    try { return decodeURIComponent(escape(atob(el.getAttribute("data-s")))); } catch (e) { return ""; }
  }

  // Zahl lesen: "2,8" und "2.8" gehen beide (manche Handys haben nur den Punkt)
  function zahl(t) {
    t = String(t).trim().replace(/\s+/g, "");
    return /^-?\d+([.,]\d+)?$/.test(t) ? parseFloat(t.replace(",", ".")) : NaN;
  }

  // Eingaben vergleichbar machen: Groß/klein egal, Leerzeichen egal, "3,0" = "3", "2.8" = "2,8", "-" = "–"
  function gleich(eingabe, richtig) {
    function sauber(t) {
      t = String(t).trim().toLowerCase().replace(/\s+/g, "").replace(/[-‐‑–—]/g, "–");
      if (!isNaN(zahl(t))) return String(zahl(t));
      return t.replace(/\./g, "");
    }
    return sauber(eingabe) !== "" && sauber(eingabe) === sauber(richtig);
  }

  // Gerundete Ergebnisse (Feld mit data-t, z. B. bei π oder Wurzel):
  // richtig, wenn höchstens 1 % daneben ODER richtig auf 0, 1 oder 2 Kommastellen gerundet.
  // Beim Runden aber höchstens 5 % daneben: sonst wäre z. B. "1" für 1,172 oder "0" für 0,08 richtig.
  function ungefaehr(eingabe, richtig) {
    var x = zahl(eingabe), s = zahl(richtig);
    if (isNaN(x) || isNaN(s)) return false;
    if (Math.abs(x - s) <= Math.abs(s) * 0.01 + 1e-9) return true;
    if (Math.abs(x - s) > Math.abs(s) * 0.05) return false;
    for (var k = 0; k <= 2; k++) {
      var f = Math.pow(10, k);
      if (Math.abs(Math.round(s * f) / f - x) < 1e-9) return true;
    }
    return false;
  }

  // Auswahl-Möglichkeiten bei jedem Öffnen neu mischen.
  // Die richtige Antwort steht gleichmäßig verteilt an allen Stellen (1., 2., 3. …)
  // und nie öfter als 2-mal hintereinander an derselben Stelle.
  function gemischt(liste) {
    liste = liste.slice();
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = liste[i];
      liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }
  function verteilteStellen(anzahlen) {
    // anzahlen = wie viele Möglichkeiten jede Aufgabe hat, z. B. [3, 3, 4, …]
    // Zufällig würfeln, bis es passt: jede Stelle kommt ungefähr gleich oft vor,
    // keine Stelle 3-mal hintereinander. (Bei 4 Möglichkeiten kann es auch die 4. Stelle sein.)
    // Keine Auswahl auf dem Blatt: nichts zu verteilen (sonst läuft die Schleife unten endlos)
    if (!anzahlen.length) return [];
    var min = Math.min.apply(null, anzahlen), n = anzahlen.length, beste = null;
    for (var versuch = 0; versuch < 2000; versuch++) {
      var stellen = anzahlen.map(function (k) { return Math.floor(Math.random() * k); });
      var ok = true;
      for (var k = 2; k < n; k++) if (stellen[k] === stellen[k - 1] && stellen[k] === stellen[k - 2]) ok = false;
      for (var s = 0; s < min && ok; s++) {
        var wie = stellen.filter(function (x) { return x === s; }).length;
        if (wie < Math.floor(n / min) - 1 || wie > Math.ceil(n / min) + 1) ok = false;
      }
      beste = stellen;
      if (ok) break;
    }
    return beste;
  }
  var gruppen = [].slice.call(document.querySelectorAll(".wahl-gruppe"));
  var stellen = verteilteStellen(gruppen.map(function (g) { return g.querySelectorAll(".wahl").length; }));
  gruppen.forEach(function (g, n) {
    var alle = [].slice.call(g.querySelectorAll(".wahl"));
    var richtig = alle.filter(function (b) { return soll(b) === "1"; })[0];
    var falsch = gemischt(alle.filter(function (b) { return b !== richtig; }));
    falsch.splice(stellen[n], 0, richtig);
    falsch.forEach(function (b) { g.appendChild(b); });
  });

  // Antippen: Kästchen umschalten, bei einer Auswahl genau eine Möglichkeit markieren
  document.addEventListener("click", function (e) {
    var w = e.target.closest(".wahl");
    if (w) {
      var gruppe = w.closest(".wahl-gruppe");
      gruppe.querySelectorAll(".wahl").forEach(function (b) { b.setAttribute("aria-pressed", b === w ? "true" : "false"); });
      gruppe.classList.remove("ist-richtig", "ist-falsch");
      return;
    }
    var k = e.target.closest(".kreuz");
    if (!k) {
      var zelle = e.target.closest("td");
      if (zelle && zelle.querySelectorAll(".kreuz").length === 1) k = zelle.querySelector(".kreuz");
    }
    if (!k) return;
    var an = k.getAttribute("aria-pressed") !== "true";
    k.setAttribute("aria-pressed", an ? "true" : "false");
    k.textContent = an ? "✗" : "";
  });

  // Aufgaben finden: alles von einer Überschrift "Aufgabe …" bis zur nächsten Überschrift
  var haupt = document.querySelector(".blatt");
  var aufgaben = [];
  haupt.querySelectorAll("h2").forEach(function (h) {
    if (!/^Aufgabe\s+\d+/.test(h.textContent.trim())) return;
    var teile = [], el = h.nextElementSibling;
    while (el && el.tagName !== "H2") { teile.push(el); el = el.nextElementSibling; }
    var felder = [], kreuze = [], gruppen = [];
    teile.forEach(function (t) {
      [t].concat([].slice.call(t.querySelectorAll("*"))).forEach(function (x) {
        if (x.matches("input.eintrag")) felder.push(x);
        else if (x.matches("button.kreuz")) kreuze.push(x);
        else if (x.matches(".wahl-gruppe")) gruppen.push(x);
      });
    });
    if (!felder.length && !kreuze.length && !gruppen.length) return;
    aufgaben.push({ felder: felder, kreuze: kreuze, gruppen: gruppen, letztes: teile[teile.length - 1], kopf: h });
  });

  // Pflicht = alle Aufgaben vor der Überschrift „Extra“ (gibt es keine, ist alles Pflicht)
  var extra = haupt.querySelector("h2.extra");
  aufgaben.forEach(function (a) {
    a.pflicht = !extra || !!(a.kopf.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_FOLLOWING);
  });

  // Kreuze nach Tabellenzeilen ordnen (eine Zeile zählt nur, wenn sie ganz stimmt)
  function zeilen(kreuze) {
    var liste = [];
    kreuze.forEach(function (k) {
      var tr = k.closest("tr");
      var z = liste.find(function (x) { return x.tr === tr; });
      if (!z) { z = { tr: tr, kreuze: [] }; liste.push(z); }
      z.kreuze.push(k);
    });
    return liste;
  }

  function maxPunkte(a) {
    var p = a.felder.length + a.gruppen.length;
    a.kreuze.forEach(function (k) { if (soll(k) === "1") p++; });
    return p;
  }

  function pruefen(a) {
    var punkte = 0;
    a.felder.forEach(function (f) {
      var ok = f.hasAttribute("data-t") ? ungefaehr(f.value, soll(f)) : gleich(f.value, soll(f));
      f.classList.toggle("ist-richtig", ok);
      f.classList.toggle("ist-falsch", !ok);
      if (ok) punkte++;
    });
    a.gruppen.forEach(function (g) {
      var gewaehlt = g.querySelector('.wahl[aria-pressed="true"]');
      var ok = !!gewaehlt && soll(gewaehlt) === "1";
      g.classList.toggle("ist-richtig", ok);
      g.classList.toggle("ist-falsch", !ok);
      if (ok) punkte++;
    });
    zeilen(a.kreuze).forEach(function (z) {
      var ok = z.kreuze.every(function (k) { return (k.getAttribute("aria-pressed") === "true") === (soll(k) === "1"); });
      z.tr.classList.toggle("ist-richtig", ok);
      z.tr.classList.toggle("ist-falsch", !ok);
      if (ok) z.kreuze.forEach(function (k) { if (soll(k) === "1") punkte++; });
    });
    a.ausgabe.textContent = punkte + " von " + a.max + (a.max === 1 ? " Punkt" : " Punkten") +
      (punkte === a.max ? " – super!" : " – schau bei Rot noch einmal nach.");
    a.ausgabe.className = "pruef-ergebnis " + (punkte === a.max ? "gut" : "nochmal");
  }

  // Knopf "Prüfen" unter jede Aufgabe
  aufgaben.forEach(function (a) {
    a.max = maxPunkte(a);
    var box = document.createElement("div");
    box.className = "pruef-box";
    var knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "pruef-knopf";
    knopf.textContent = "Prüfen";
    knopf.addEventListener("click", function () { pruefen(a); geprueft(a); });
    a.ausgabe = document.createElement("p");
    a.ausgabe.className = "pruef-ergebnis";
    a.ausgabe.setAttribute("aria-live", "polite");
    box.appendChild(knopf);
    box.appendChild(a.ausgabe);
    a.letztes.after(box);
  });

  // =====================================================================
  //  MERKEN (nur auf diesem Handy, über fortschritt.js)
  // =====================================================================
  var F = window.FORTSCHRITT;
  var datei = F && F.blattName(location.pathname);
  if (!F || !datei) return;

  var alleFelder = [].slice.call(haupt.querySelectorAll("input.eintrag"));
  var alleGruppen = [].slice.call(haupt.querySelectorAll(".wahl-gruppe"));
  var alleKreuze = [].slice.call(haupt.querySelectorAll("button.kreuz"));
  var pflichtAnzahl = aufgaben.filter(function (a) { return a.pflicht; }).length;

  // Was gerade eingetragen ist (Auswahl über den Text, weil sie bei jedem Öffnen neu gemischt wird)
  function werte() {
    return {
      f: alleFelder.map(function (f) { return f.value; }),
      w: alleGruppen.map(function (g) {
        var b = g.querySelector('.wahl[aria-pressed="true"]');
        return b ? b.textContent : null;
      }),
      k: alleKreuze.map(function (k) { return k.getAttribute("aria-pressed") === "true" ? 1 : 0; })
    };
  }

  function sichern(extraArbeit) {
    F.aendern(datei, function (b) {
      b.werte = werte();
      b.anzahl = pflichtAnzahl;
      if (extraArbeit) extraArbeit(b);
      var erledigt = aufgaben.filter(function (a, i) { return a.pflicht && b.geprueft.indexOf(i) >= 0; }).length;
      b.fertig = erledigt >= pflichtAnzahl;
      b.erledigt = erledigt;
    });
  }

  function haken(a) {
    if (a.kopf.querySelector(".haken")) return;
    var s = document.createElement("span");
    s.className = "haken";
    s.textContent = " ✓";
    s.setAttribute("aria-label", "geprüft");
    a.kopf.appendChild(s);
  }

  function geprueft(a) {
    if (!F || !datei) return;   // ohne Speicher (z. B. als Datei geöffnet): einfach nichts merken
    var i = aufgaben.indexOf(a);
    haken(a);
    sichern(function (b) { if (b.geprueft.indexOf(i) < 0) b.geprueft.push(i); });
  }

  // Beim Tippen und Antippen mitspeichern (kurz warten, damit nicht bei jedem Buchstaben)
  var warte = null;
  function spaeter() { clearTimeout(warte); warte = setTimeout(function () { sichern(); }, 400); }
  haupt.addEventListener("input", function (e) { if (e.target.matches("input.eintrag")) spaeter(); });
  document.addEventListener("click", function (e) { if (e.target.closest(".wahl, .kreuz, td")) spaeter(); });
  window.addEventListener("pagehide", function () { if (warte) { clearTimeout(warte); sichern(); } });

  // ---------- Beim Öffnen: Gespeichertes zurückholen ----------
  var alt = F.blatt(datei);
  var hatEtwas = alt && alt.werte && (
    alt.werte.f.some(function (x) { return x; }) || alt.werte.w.some(function (x) { return x; }) ||
    alt.werte.k.some(function (x) { return x; }) || alt.geprueft.length);

  if (hatEtwas) {
    alleFelder.forEach(function (f, i) { if (alt.werte.f[i] != null) f.value = alt.werte.f[i]; });
    alleGruppen.forEach(function (g, i) {
      var text = alt.werte.w[i];
      if (!text) return;
      g.querySelectorAll(".wahl").forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === text ? "true" : "false"); });
    });
    alleKreuze.forEach(function (k, i) {
      var an = alt.werte.k[i] === 1;
      k.setAttribute("aria-pressed", an ? "true" : "false");
      k.textContent = an ? "✗" : "";
    });
    // Schon geprüfte Aufgaben wieder grün/rot zeigen
    alt.geprueft.forEach(function (i) { if (aufgaben[i]) { pruefen(aufgaben[i]); haken(aufgaben[i]); } });

    // Erste Pflicht-Aufgabe, die noch nicht geprüft ist
    var naechste = aufgaben.filter(function (a, i) { return a.pflicht && alt.geprueft.indexOf(i) < 0; })[0];
    var kasten = document.createElement("div");
    kasten.className = "willkommen";
    kasten.setAttribute("role", "status");
    var t1 = document.createElement("p");
    t1.className = "willkommen-titel";
    var t2 = document.createElement("p");
    if (naechste) {
      t1.textContent = "Willkommen zurück!";
      t2.textContent = "Deine Eingaben sind noch da. Weiter bei " + naechste.kopf.firstChild.textContent.replace(/\s*[★✓].*$/, "").trim() + ".";
      naechste.kopf.before(kasten);
    } else {
      t1.textContent = "✓ Dieses Blatt hast du schon erledigt.";
      t2.textContent = "Deine Eingaben sind noch da." + (extra ? " Wenn du magst: Mach das Extra." : "");
      var h1 = haupt.querySelector("h1");
      (h1 || haupt.firstChild).after(kasten);
    }
    kasten.appendChild(t1);
    kasten.appendChild(t2);
    if (naechste) setTimeout(function () { kasten.scrollIntoView({ block: "start" }); window.scrollBy(0, -70); }, 50);
  }

  // Ganz unten: alles leeren und neu anfangen
  var neu = document.createElement("div");
  neu.className = "neu-box";
  var neuKnopf = document.createElement("button");
  neuKnopf.type = "button";
  neuKnopf.className = "rand-knopf";
  neuKnopf.textContent = "Alles leeren und neu anfangen";
  neuKnopf.addEventListener("click", function () {
    if (!window.confirm("Alle Eingaben auf diesem Blatt löschen und neu anfangen?")) return;
    F.vergessen(datei);
    location.reload();
  });
  neu.appendChild(neuKnopf);
  haupt.appendChild(neu);
})();
