# Debriefing GB26 — gb26debrief.wicki.aero

**App 0.1.0 · README Dok. 261117-01**

Hausaufgabe und gemeinsamer Bereich für das Debriefing Gordon Bennett 2026 des Teams SUI-2 am 18.12.2026
(Universität Bern und Zoom). Zugang nur mit persönlichem Link, den der Admin je Person erstellt und per WhatsApp
versendet. Grundlage: Konzept v1.1 (Dropbox «047 Debriefing GB26\01_Konzept»).

**Live:** https://gb26debrief.wicki.aero · **Repository:** https://github.com/bwicki/gb26debrief
**Stack:** HTML/CSS/JS ohne Build-Schritt (GitHub Pages aus dem Repository-Stamm), Cloudflare Worker
`gb26debrief-api` mit D1 `gb26debrief`, IBM Plex. Gestaltung wie krt2.wicki.aero / analyze.wicki.aero.

## Seiten

| Seite | Inhalt | Stand |
|---|---|---|
| `#start` | Übersicht, Status der Teile A–H, «Hausaufgabe abgeschlossen», Regeln zur Anonymität | 0.1.0 |
| `#teil-A` … `#teil-H` | Hausaufgabe: A Person & Funktion, B Gesamtteam, C Zeitstrahl, D Fachbereich, E Retrospektive, F Runbooks, G Ausblick GB27, H vertraulich | 0.1.0 |
| `#gemeinsam` | Unterlagen, Ablauf 18.12.; Ergebnisse ab 15.12. und Live-Ansicht am 18.12. folgen | 0.1.0 |
| `#admin` | Teilnehmende, persönliche Links (WhatsApp, Kopieren, Widerrufen), Frist, Auswertung als JSON, Unterlagen | 0.1.0 |

Inhalte der Hausaufgabe (Themenfelder, Bezugspunkte, Fragen je Funktion, Runbooks): `src/content.js`.

## Zugang

* Der persönliche Link hat die Form `https://gb26debrief.wicki.aero/#t=<Token>`. Der Teil nach `#` wird nicht an
  den Server übertragen; die App speichert das Token im Browser und schickt es nur an die eigene API.
* In D1 steht nur der SHA-256-Wert des Tokens. Ein Link wird beim Erstellen einmal angezeigt; ein neuer Link
  ersetzt den bisherigen, «Widerrufen» sperrt ihn.

## Anonymität (Konzept Kap. 7.5)

| Daten | Tabelle | Bezug zur Person | sichtbar für |
|---|---|---|---|
| Teile A–G mit Namen | `named` | ja (Datum ohne Uhrzeit) | Admin (Auswertung) |
| Teile B–G anonym | `anon` | **nein**: keine Personenkennung, kein Zeitstempel, keine IP, zufällige Kennung, `WITHOUT ROWID` | Admin erst nach der Frist |
| Teil H vertraulich | `confidential` | ja, getrennt von B–G | nur Admin |
| Abgeschlossen ja/nein | `participants.done` | ja, ohne Zeit | Admin |

* Worker-Logs ausgeschaltet (`[observability] enabled = false`); der Worker schreibt keine Anfragedaten.
* Anonym abgeschickte Teile sind nicht mehr änderbar; der Entwurf bleibt bis zum Absenden im Browser.
* Grenze: Wer Zugriff auf das Cloudflare-Konto hat, kann Code und Speicherung ändern oder den Eingang direkt in
  D1 beobachten. Jede Code-Änderung ist in diesem Repository nachvollziehbar.

## Einrichtung

`SETUP.md`. Deploy des Workers über GitHub Actions (`.github/workflows/deploy-worker.yml`) bei jeder Änderung
unter `worker/`; Schema `worker/schema.sql` wird jedes Mal nachgezogen (wiederholbar).

## Lizenz

Source-available, Nutzung nur mit Zustimmung — siehe `LICENSE`.
