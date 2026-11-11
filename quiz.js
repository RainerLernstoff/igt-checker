// =====================================================================
//  QUIZ – eine Frage nach der anderen, sofort Rückmeldung
//  Die Fragen stehen in der Seite selbst (var QUIZ = [{ f: Frage, a: [Antworten], s: … }, …]).
//  Die richtige Antwort steht leicht verschlüsselt in "s" (Base64), damit man sie nicht sofort sieht.
//  Fragen und Antworten kommen jedes Mal in anderer Reihenfolge.
//  Es wird NICHTS gespeichert.
// =====================================================================
(function () {
  "use strict";

  var ort = document.getElementById("quiz");
  var fragen, nr, richtig;

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  function gemischt(liste) {
    liste = liste.slice();
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = liste[i];
      liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }

  function loesung(q) {
    try { return parseInt(atob(q.s), 10); } catch (e) { return -1; }
  }

  // Wo die richtige Antwort steht: gleichmäßig verteilt (1., 2., 3. …),
  // nie 3-mal hintereinander an derselben Stelle.
  function verteilteStellen(anzahlen) {
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

  function start() {
    var reihe = gemischt(QUIZ);
    var stellen = verteilteStellen(reihe.map(function (q) { return q.a.length; }));
    fragen = reihe.map(function (q, n) {
      var r = loesung(q);
      // Falsche Antworten mischen, die richtige an ihre Stelle setzen
      var antworten = gemischt(q.a.filter(function (t, i) { return i !== r; }).map(function (t) { return { text: t, ok: false }; }));
      antworten.splice(stellen[n], 0, { text: q.a[r], ok: true });
      return { f: q.f, antworten: antworten };
    });
    nr = 0; richtig = 0;
    frageZeigen();
  }

  function frageZeigen() {
    var q = fragen[nr];
    ort.innerHTML = "";
    ort.appendChild(el("p", "stand", "Frage " + (nr + 1) + " von " + fragen.length + "  ·  richtig: " + richtig));
    ort.appendChild(el("p", "frage", q.f));

    var box = el("div", "antworten");
    var meldung = el("p", "rueckmeldung");
    meldung.setAttribute("aria-live", "polite");
    var weiter = el("button", "gross-knopf", nr === fragen.length - 1 ? "Ergebnis zeigen" : "Weiter →");
    weiter.type = "button";
    weiter.hidden = true;
    weiter.addEventListener("click", function () {
      nr++;
      if (nr < fragen.length) frageZeigen(); else ergebnis();
    });

    var knoepfe = q.antworten.map(function (a) {
      var b = el("button", "antwort", a.text);
      b.type = "button";
      b.addEventListener("click", function () {
        knoepfe.forEach(function (k, i) {
          k.disabled = true;
          if (q.antworten[i].ok) k.classList.add("ist-richtig");
        });
        if (a.ok) {
          richtig++;
          meldung.textContent = "Richtig!";
          meldung.className = "rueckmeldung gut";
        } else {
          b.classList.add("ist-falsch");
          meldung.textContent = "Leider falsch. Die grüne Antwort ist richtig.";
          meldung.className = "rueckmeldung nochmal";
        }
        weiter.hidden = false;
        weiter.focus();
      });
      box.appendChild(b);
      return b;
    });

    ort.appendChild(box);
    ort.appendChild(meldung);
    ort.appendChild(weiter);
    window.scrollTo(0, 0);
  }

  function ergebnis() {
    var anteil = richtig / fragen.length;
    ort.innerHTML = "";
    ort.appendChild(el("h1", null, "Dein Ergebnis"));
    ort.appendChild(el("p", "ergebnis-zahl", richtig + " von " + fragen.length));
    // Bestes Ergebnis merken (nur auf diesem Handy) – für „Mein Fortschritt“
    if (window.FORTSCHRITT) window.FORTSCHRITT.quizMerken(location.pathname, richtig, fragen.length);
    var text = anteil === 1 ? "Super! Alles richtig."
      : anteil >= 0.7 ? "Gut gemacht! Schau dir die Fehler noch einmal im Blatt an."
      : "Lies das Blatt noch einmal durch. Dann probier es wieder.";
    ort.appendChild(el("p", "hinweis", text));
    var nochmal = el("button", "gross-knopf", "Nochmal spielen");
    nochmal.type = "button";
    nochmal.addEventListener("click", start);
    ort.appendChild(nochmal);
    window.scrollTo(0, 0);
  }

  start();
})();
