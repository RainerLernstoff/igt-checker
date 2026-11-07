// =====================================================================
//  INHALTSLISTE der App „Vorbereitungskurs“
//  Hier steht, welche Fächer und Wochen die App zeigt.
//  Neue Woche befüllen = bei der Woche "teile" ergänzen. Am Programm (app.js) ändert sich nichts.
//
//  Aufbau:
//    faecher – die drei Fächer (Knöpfe oben auf der Startseite)
//    wochen  – der Kursablauf (10 Wochen). Jede Woche gehört zu einem oder mehreren Fächern.
//              "teile" = Blätter, Lernkarten, Quiz. Ist die Liste leer, steht „kommt bald“.
//  Ein „Teil“ hat:
//    name   – steht groß auf dem Knopf
//    info   – steht klein darunter
//    datei  – welche Seite sich öffnet (Pfad ab dem Ordner app\)
//
//  WICHTIG: Hier kommen nur Schüler-Seiten hinein, NIE Lösungsblätter.
// =====================================================================

const INHALTE = {
  faecher: [
    { id: "fk", name: "Fachkunde",    info: "Zeichnen, Wasser, Heizung, Werkstoffe, Sicherheit" },
    { id: "m",  name: "Mathematik",   info: "Formeln, Längen, Flächen, Volumen, Masse" }
  ],

  wochen: [
    {
      id: "w1", nr: 1, name: "Ansichten und Rohre", faecher: ["fk"],
      info: "Normalprojektion, Rohre zeichnen, Rohrabmessungen",
      teile: [
        { name: "1 Normalprojektion",  info: "Lesen und am Papier zeichnen", datei: "inhalte/w1/blatt-1.html" },
        { name: "2 Rohrabmessungen",   info: "Zum Ausfüllen und Prüfen",     datei: "inhalte/w1/blatt-2.html" },
        { name: "Lernkarten",          info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w1/lernkarten.html" },
        { name: "✓ Quiz",              info: "10 Fragen, ca. 5 Minuten",     datei: "inhalte/w1/quiz.html" }
      ]
    },
    {
      id: "w2", nr: 2, name: "Formeln und Längen", faecher: ["m"],
      info: "Umformen von Formeln, Längenberechnung",
      teile: [
        { name: "1 Gleichungen",          info: "Zum Ausfüllen und Prüfen",        datei: "inhalte/w2/blatt-1.html" },
        { name: "2 Formeln umformen",     info: "Richtige Formel antippen",        datei: "inhalte/w2/blatt-2.html" },
        { name: "3 Längen umrechnen",     info: "Pflicht + Extra",        datei: "inhalte/w2/blatt-3.html" },
        { name: "4 Kreis und Bogen",      info: "Mit Taschenrechner",              datei: "inhalte/w2/blatt-4.html" },
        { name: "5 Dreieck und zusammengesetzte Flächen", info: "Mit Taschenrechner", datei: "inhalte/w2/blatt-5.html" },
        { name: "Lernkarten",             info: "Frage lesen, Antwort aufdecken",  datei: "inhalte/w2/lernkarten.html" },
        { name: "✓ Quiz",                 info: "10 Fragen, ca. 5 Minuten",        datei: "inhalte/w2/quiz.html" }
      ]
    },
    {
      id: "w3", nr: 3, name: "Sanitärgegenstände", faecher: ["fk"],
      info: "Waschtisch, Klosett, Badewanne zeichnen",
      teile: [
        { name: "1 Sanitärgegenstände zeichnen", info: "Lesen und am Papier zeichnen",   datei: "inhalte/w3/blatt-1.html" },
        { name: "2 Leitungen und Kennfarben",    info: "Antippen und am Papier zeichnen", datei: "inhalte/w3/blatt-2.html" },
        { name: "Lernkarten",                    info: "Frage lesen, Antwort aufdecken",  datei: "inhalte/w3/lernkarten.html" },
        { name: "✓ Quiz",                        info: "10 Fragen, ca. 5 Minuten",        datei: "inhalte/w3/quiz.html" }
      ]
    },
    {
      id: "w4", nr: 4, name: "Wasser und Heizung", faecher: ["fk"],
      info: "Warmwasser, Wasserkreislauf, Heizungskreislauf",
      teile: [
        { name: "1 Warmwasserbereitung",                info: "Lesen und richtiges Wort antippen", datei: "inhalte/w4/blatt-1.html" },
        { name: "2 Wasserkreislauf",                    info: "Lesen und richtiges Wort antippen", datei: "inhalte/w4/blatt-2.html" },
        { name: "3 Heizungskreislauf",                  info: "Lesen und richtiges Wort antippen", datei: "inhalte/w4/blatt-3.html" },
        { name: "4 Sinnbilder und Kreisläufe zeichnen", info: "Lesen und am Papier zeichnen",      datei: "inhalte/w4/blatt-4.html" },
        { name: "Lernkarten",                           info: "Frage lesen, Antwort aufdecken",    datei: "inhalte/w4/lernkarten.html" },
        { name: "✓ Quiz",                               info: "10 Fragen, ca. 5 Minuten",          datei: "inhalte/w4/quiz.html" }
      ]
    },
    {
      id: "w5", nr: 5, name: "Flächen", faecher: ["m"],
      info: "Flächenberechnung mit Rohrflächen",
      teile: [
        { name: "1 Flächen umrechnen",  info: "Pflicht + Extra",       datei: "inhalte/w5/blatt-1.html" },
        { name: "2 Kreisfläche",        info: "Pflicht + Extra, Taschenrechner",             datei: "inhalte/w5/blatt-2.html" },
        { name: "3 Dreieck und zusammengesetzte Flächen", info: "Pflicht + Extra, Taschenrechner", datei: "inhalte/w5/blatt-3.html" },
        { name: "4 Rohrflächen",        info: "Pflicht + Extra, Taschenrechner",             datei: "inhalte/w5/blatt-4.html" },
        { name: "5 Mantelfläche",       info: "Pflicht + Extra, Taschenrechner",             datei: "inhalte/w5/blatt-5.html" },
        { name: "Lernkarten",           info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w5/lernkarten.html" },
        { name: "✓ Quiz",               info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w5/quiz.html" }
      ]
    },
    {
      id: "w6", nr: 6, name: "Luft", faecher: ["fk"],
      info: "Luft, Luftdruck, Verbrennung",
      teile: [
        { name: "1 Luft",            info: "Lesen und antippen",             datei: "inhalte/w6/blatt-1.html" },
        { name: "2 Lückentext Luft", info: "Richtiges Wort antippen",        datei: "inhalte/w6/blatt-2.html" },
        { name: "Lernkarten",        info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w6/lernkarten.html" },
        { name: "✓ Quiz",            info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w6/quiz.html" }
      ]
    },
    {
      id: "w7", nr: 7, name: "Volumen", faecher: ["m"],
      info: "Rohrinhalt, Rohrmaterial",
      teile: [
        { name: "1 Volumen umrechnen",        info: "Pflicht + Extra",       datei: "inhalte/w7/blatt-1.html" },
        { name: "2 Prisma",                   info: "Pflicht + Extra, Taschenrechner", datei: "inhalte/w7/blatt-2.html" },
        { name: "3 Zylinder",                 info: "Pflicht + Extra, Taschenrechner", datei: "inhalte/w7/blatt-3.html" },
        { name: "4 Rohrinhalt",               info: "Pflicht + Extra, Taschenrechner", datei: "inhalte/w7/blatt-4.html" },
        { name: "5 Volumen vom Rohrmaterial", info: "Pflicht + Extra, Taschenrechner", datei: "inhalte/w7/blatt-5.html" },
        { name: "Lernkarten",                 info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w7/lernkarten.html" },
        { name: "✓ Quiz",                     info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w7/quiz.html" }
      ]
    },
    {
      id: "w8", nr: 8, name: "Werkstoffe", faecher: ["fk"],
      info: "Stahl, Kupfer, Kunststoff",
      teile: [
        { name: "1 Stahl",      info: "Lesen und antippen",             datei: "inhalte/w8/blatt-1.html" },
        { name: "2 Kupfer",     info: "Lesen und antippen",             datei: "inhalte/w8/blatt-2.html" },
        { name: "3 Kunststoff", info: "Lesen und antippen",             datei: "inhalte/w8/blatt-3.html" },
        { name: "Lernkarten",   info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w8/lernkarten.html" },
        { name: "✓ Quiz",       info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w8/quiz.html" }
      ]
    },
    {
      id: "w9", nr: 9, name: "Masse", faecher: ["m"],
      info: "Masseberechnung",
      teile: [
        { name: "1 Masse und Dichte", info: "Zum Ausfüllen und Prüfen",       datei: "inhalte/w9/blatt-1.html" },
        { name: "2 Masse vom Rohr",   info: "Pflicht + Extra, Taschenrechner",             datei: "inhalte/w9/blatt-2.html" },
        { name: "Lernkarten",         info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w9/lernkarten.html" },
        { name: "✓ Quiz",             info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w9/quiz.html" }
      ]
    },
    {
      id: "w10", nr: 10, name: "Sicherheit", faecher: ["fk"],
      info: "Sicherheit am Arbeitsplatz, PSA",
      teile: [
        { name: "1 Sicherheit am Arbeitsplatz",   info: "Lesen und antippen",             datei: "inhalte/w10/blatt-1.html" },
        { name: "2 Persönliche Schutzausrüstung", info: "Lesen und antippen",             datei: "inhalte/w10/blatt-2.html" },
        { name: "Lernkarten",                     info: "Frage lesen, Antwort aufdecken", datei: "inhalte/w10/lernkarten.html" },
        { name: "✓ Quiz",                         info: "10 Fragen, ca. 5 Minuten",       datei: "inhalte/w10/quiz.html" }
      ]
    }
  ]
};
