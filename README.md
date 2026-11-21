# Debriefing GB26 — gb26debrief.wicki.aero

**App 0.1.3 · README Dok. 261121-02**

Hausaufgabe und gemeinsamer Bereich für das Debriefing Gordon Bennett 2026 des Teams SUI-2 am 18.12.2026
(Universität Bern und Zoom). Zugang nur mit persönlichem Link, den der Admin je Person erstellt und per WhatsApp
versendet. Grundlage: Konzept v1.2 (Dropbox «047 Debriefing GB26\01_Konzept»).

**Live:** https://gb26debrief.wicki.aero · **Repository:** https://github.com/bwicki/gb26debrief
**Stack:** HTML/CSS/JS ohne Build-Schritt (GitHub Pages aus dem Repository-Stamm), Cloudflare Worker
`gb26debrief-api` mit D1 `gb26debrief`, IBM Plex. Gestaltung wie krt2.wicki.aero / analyze.wicki.aero.

## Seiten

| Seite | Inhalt | Stand |
|---|---|---|
| `#start` | Übersicht, Status der Teile A–H, «Hausaufgabe abgeschlossen», Regeln zur Anonymität | 0.1.0 |
| `#teil-A` … `#teil-H` | Hausaufgabe: A Person & Funktion, B Gesamtteam, C Zeitstrahl, D Fachbereich, E Retrospektive, F Runbooks, G Ausblick GB27, H vertraulich | 0.1.1 |
| `#gemeinsam` | Unterlagen (Admin und Redaktion fügen hinzu und entfernen), Ablauf 18.12.; Ergebnisse ab 15.12. und Live-Ansicht am 18.12. folgen | 0.1.3 |
| `#admin` | Teilnehmende, Rolle Redaktion, persönliche Links (WhatsApp, Kopieren, Widerrufen), Frist, Auswertung als JSON | 0.1.3 |
| `#texte` | Admin und Redaktion: alle Texte und Listen der Oberfläche bearbeiten | 0.1.2 |

## Rollen

| Rolle | `participants.is_admin` | darf |
|---|---|---|
| Admin | 1 | alles: Teilnehmende, Links, Frist, Auswertung (auch Teil H), Unterlagen, Texte |
| Redaktion | 2 | Hausaufgabe wie alle, dazu `#texte` (alle Texte, Listen, Ablauf) und Unterlagen im gemeinsamen Bereich (`POST /api/docs`, `DELETE /api/docs/:id`); keine Antworten, keine Links, keine Admin-Seite |
| Teilnehmende | 0 | eigene Hausaufgabe, gemeinsamer Bereich |

Die Redaktion vergibt und entzieht der Admin in der Teilnehmerliste («Redaktion geben»). Die Admin-Rolle lässt sich
dort nicht ändern.

## Texte und Listen

* Standard: `src/content.js` (`GB26_DEFAULT`). Unter `#texte` bearbeitet der Admin Texte, WhatsApp-Vorlage,
  Titel und Beschreibung der Teile A–H, Funktionen, Themenfelder, Phasen, Bezugspunkte, Fragenblöcke mit Fragen,
  Kategorien, Bereiche, Runbooks, Fragen G und H, Ablauf. Platzhalter: `{vorname}`, `{frist}`, `{link}`.
* Gespeichert werden nur die Abweichungen vom Standard, in D1 `settings` (`k = 'content'`); sie gelten sofort für
  alle. «Alles auf Standard» und Speichern löscht den Eintrag. Export/Import als JSON.
* Zwei Personen können gleichzeitig bearbeiten: `settings` `k = 'content_meta'` hält Stand, Name und Zeit der
  letzten Speicherung. Wer auf einem älteren Stand speichert, erhält 409; die App überträgt die eigenen Änderungen
  auf den neueren Stand (je Abschnitt, bei gleichem Abschnitt gilt die eigene Fassung) und lässt nochmals speichern.
* Antworten hängen an der Kennung (`id`) eines Eintrags, nicht am Wortlaut. Einträge mit möglichen Antworten
  werden ausgeblendet (`aus: true`) statt gelöscht; die Antworten bleiben erhalten. Leere Einträge erscheinen
  nicht. Bezugspunkte und Ablauf lassen sich entfernen (keine Antworten daran).
* API: `GET /api/texts` (Teilnehmende; Admin und Redaktion erhalten zusätzlich `meta`),
  `PUT /api/texts {content, base}` (Admin und Redaktion; `null` = Standard, max. 256 KB).

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
