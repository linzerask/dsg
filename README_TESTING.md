# DSG Liga - Leitfaden zur Qualitaetssicherung und Systempruefung

Dieses Dokument dient als Uebersicht fuer das Test-Team zur Ueberpruefung der neuesten Funktionen, Optimierungen und Fehlerbehebungen auf der DSG Liga Plattform.

---

## 1. Zugang und Testumgebung

- Oeffentliche Webseite: https://dsg.anonymcreator.online (oder GitHub Pages Mirror)
- Admin-Bereich: Ueber die Navigation oder direkt via `/#/admin`
- Standard-PIN fuer Admin-Zugriff: `1111`
- Testgeraete: Desktop-Browser (Chrome, Firefox, Safari, Edge) und mobile Endgeraete (iOS Safari, Android Chrome).

---

## 2. Testbereiche im Ueberblick

### Testbereich A: Mobiles Cookie-Banner und Layout
- Ziel: Sicherstellen, dass das Banner auf Smartphones kompakt und benutzerfreundlich dargestellt wird.
- Testschritte:
  1. Webseite auf einem mobilen Endgeraet oder im Browser im Handy-Modus aufrufen (evtl. Cache leeren oder Inkognito-Modus nutzen).
  2. Pruefen, ob das Cookie-Banner schlank am unteren Bildschirmrand liegt und keine uebermaessigen Leerraeume erzeugt.
  3. Schaltflaechen "Alle akzeptieren" und "Nur notwendige" antippen.
  4. Pruefen, ob das Banner sofort verschwindet und die Seite fluessig bedienbar bleibt.

---

### Testbereich B: Spielminuten und Auswechslungen (ab Runde 8)
- Ziel: Korrekte Erfassung und Darstellung exakter Spielminuten sowie Spielerwechsel.
- Testschritte Oeffentlicher Bereich:
  1. Navigation aufrufen: "Liga" -> Reiter "Spiele".
  2. Zu Runde 8 navigieren und ein ausgetragenes Spiel auswaehlen.
  3. Pruefen, ob Tore und Karten mit der exakten Spielminute angezeigt werden (z. B. "23'", "78'").
- Testschritte Admin-Bereich:
  1. In den Admin-Bereich einloggen (PIN: 1111) und Reiter "Spiele" oeffnen.
  2. Bei einem Spiel auf den Spielbericht-Button klicken.
  3. Den Bereich fuer Auswechslungen pruefen: Spieler einwechseln, Spieler auswechseln und Minute erfassen.
  4. Bericht speichern und kontrollieren, ob die Daten dauerhaft erhalten bleiben.

---

### Testbereich C: All-Time Statistiken und Hall of Fame
- Ziel: Vollstaendige Einbindung aller historischen Saisons.
- Testschritte:
  1. Menuepunkt "Statistiken" oeffnen.
  2. Den Saison-Filter pruefen: Es muessen alle historischen Spielzeiten von der Saison 2022/2023 bis hin zur aktuellen Saison 2026/2027 verfuegbar sein.
  3. "Hall of Fame" bzw. Gesamtstatistiken anwaehlen.
  4. Verifizieren, dass Bestenlisten, Torschuetzen und Rekorde die Daten der gesamten Historie beruecksichtigen.

---

### Testbereich D: Testliga-Verwaltung und Sichtbarkeit
- Ziel: Unabhaengiges Ein- und Ausblenden sowie reibungslose Navigation von Test- und Sonderligen.
- Testschritte:
  1. Im Admin-Bereich den Reiter "Ligen verwalten" aufrufen.
  2. Den Schalter fuer die Testliga auf "Auf Homepage anzeigen: Nein" setzen und speichern.
  3. Auf die Startseite oder den Liga-Bereich wechseln: Die Testliga darf im Liga-Auswahlmenue nicht mehr sichtbar sein.
  4. Zurueck in die Liga-Verwaltung gehen und den Schalter auf "Auf Homepage anzeigen: Ja" setzen und speichern.
  5. Im Liga-Auswahlmenue pruefen: Die Testliga muss wieder erscheinen, separat anklickbar sein und ihre eigenen Tabellen und Spiele korrekt laden.

---

### Testbereich E: Automatische Datensicherung (Backup herunterladen)
- Ziel: Schneller und zuverlaessiger Export der gesamten Datenbank.
- Testschritte:
  1. Im Admin-Bereich in der oberen Leiste auf die Schaltflaeche "Backup herunterladen" klicken.
  2. Pruefen, ob eine vollstaendige `.json`-Datei mit aktuellem Zeitstempel im Download-Ordner landet.
  3. Datei kurz mit einem Texteditor oeffnen und pruefen, ob Mannschaften, Spieler, Spielplaene und Statistiken vollstaendig enthalten sind.

---

### Testbereich F: Erstellung zukuenftiger Saisons
- Ziel: Konfliktfreie, universelle Generierung neuer Spielzeiten ohne manuelle Code-Anpassung.
- Testschritte:
  1. Im Admin-Bereich unter "Ligen verwalten" auf "Neue Saison anlegen" klicken.
  2. Eine zukuenftige Saison wie "2027/2028" definieren.
  3. Pruefen, ob die Saison sauber angelegt wird und die Datenstrukturen konfliktfrei bleiben.

---

### Testbereich G: Echtzeit-Synchronisation (Realtime Sync)
- Ziel: Sofortige Aktualisierung ueber mehrere Geraete hinweg ohne manuelles Neuladen.
- Testschritte:
  1. Die Seite auf zwei Geraeten gleichzeitig oeffnen (z. B. Laptop und Smartphone).
  2. Auf Geraet A ein Spielergebnis oder ein Detail im Admin-Bereich aendern und speichern.
  3. Auf Geraet B beobachten, ob die Aktualisierung innerhalb von wenigen Sekunden automatisch ohne Refresh uebernommen wird.

---

## 3. Rueckmeldung von Fehlern

Falls waehrend des Tests ein unerwartetes Verhalten oder ein Darstellungsfehler auftritt, bitte folgende Angaben erfassen:
1. Betroffene Seite bzw. URL (z. B. `/#/statistiken`).
2. Verwendetes Geraet und Betriebssystem (z. B. iPhone 15 mit iOS 18 oder Desktop Windows 11).
3. Verwendeter Browser (z. B. Safari, Chrome).
4. Kurze Beschreibung, was passiert ist und was erwartet wurde.
5. Screenshot oder Bildschirmfoto des Fehlers.
