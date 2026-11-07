// =====================================================================
//  LERNKARTEN – eine Karte nach der anderen
//  Vorne steht die Frage. Antippen → die Antwort wird aufgedeckt.
//  Die Karten stehen in der Seite selbst (var KARTEN = [{ f: Frage, a: Antwort }, …]).
//  Es wird NICHTS gespeichert.
// =====================================================================
(function () {
  "use strict";

  var ort = document.getElementById("karten");
  var karten = KARTEN.slice();
  var nr = 0, offen = false;

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  // Reihenfolge zufällig mischen
  function mischen() {
    for (var i = karten.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = karten[i];
      karten[i] = karten[j]; karten[j] = t;
    }
    nr = 0; offen = false; zeigen();
  }

  function zeigen() {
    var k = karten[nr];
    ort.innerHTML = "";
    ort.appendChild(el("p", "stand", "Karte " + (nr + 1) + " von " + karten.length));

    var karte = el("div", "karte");
    karte.setAttribute("role", "button");
    karte.setAttribute("tabindex", "0");
    karte.setAttribute("aria-label", offen ? "Antwort zudecken" : "Antwort aufdecken");
    karte.appendChild(el("div", "karte-frage", k.f));
    if (offen) karte.appendChild(el("div", "karte-antwort", k.a));
    else karte.appendChild(el("div", "karte-tipp", "Überleg dir die Antwort. Dann tippe auf die Karte."));
    karte.addEventListener("click", function () { offen = !offen; zeigen(); });
    karte.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); offen = !offen; zeigen(); } });
    ort.appendChild(karte);

    var reihe = el("div", "knopf-reihe");
    var zurueck = el("button", "rand-knopf", "← Zurück");
    zurueck.type = "button";
    zurueck.disabled = nr === 0;
    zurueck.addEventListener("click", function () { nr--; offen = false; zeigen(); });
    var weiter = el("button", "rand-knopf", nr === karten.length - 1 ? "Von vorn" : "Weiter →");
    weiter.type = "button";
    weiter.addEventListener("click", function () { nr = (nr + 1) % karten.length; offen = false; zeigen(); });
    reihe.appendChild(zurueck);
    reihe.appendChild(weiter);
    ort.appendChild(reihe);

    var neu = el("button", "rand-knopf", "Karten mischen");
    neu.type = "button";
    neu.style.width = "100%";
    neu.style.marginTop = "12px";
    neu.addEventListener("click", mischen);
    ort.appendChild(neu);
  }

  zeigen();
})();
