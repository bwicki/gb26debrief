/* gb26debrief.wicki.aero – Standardtexte und Listen (Konzept v1.2). Im Betrieb bearbeitet der Admin alles unter
   «Texte»; gespeicherte Änderungen gehen diesen Standards vor. Antworten sind an die Kennungen (id) gebunden, nicht
   an den Wortlaut: Texte dürfen frei geändert werden; Einträge mit Antworten werden ausgeblendet («aus»), nicht gelöscht.
   Platzhalter: {vorname}, {frist}, {link}. */
window.GB26_DEFAULT = {
  texte: {
    termin: 'Freitag, 18.12.2026, 15:00–18:00, Universität Bern (und Zoom); ab 18:30 gemeinsames Nachtessen',
    start_titel: 'Willkommen, {vorname}',
    start_ziel: 'Ziel: festhalten, was sich bewährt hat; benennen, wo Lücken waren; Massnahmen für den GB27 in Münster (09.–18.09.2027) festlegen. Die Inhalte erfassen wir vorher schriftlich, am Termin wird eingeordnet, priorisiert und entschieden.',
    start_frist: 'Hausaufgabe: 45–60 Minuten, bis {frist}. Entwürfe bleiben in diesem Browser gespeichert, bis du sie speicherst oder abschickst.',
    anon_titel: 'Mit Namen oder anonym',
    anon_regeln: 'Für jeden der Teile B–G wählst du, ob du ihn mit Namen oder anonym abgibst. Teil A gehört zu deiner Person, Teil H ist vertraulich und nur für Balthasar Wicki sichtbar.\nAnonyme Einträge werden ohne Name, ohne Kennung, ohne IP-Adresse und ohne Zeitstempel gespeichert und erst nach der Frist angezeigt – auch dem Admin.\nEin anonym abgeschickter Teil lässt sich nicht mehr ändern, weil dafür eine Verbindung zu dir nötig wäre. Teile mit Namen kannst du bis zur Frist ändern.\nBei anonymen Einträgen entscheidest du, ob deine Funktion angezeigt wird. Bei Funktionen mit wenigen Personen macht die Funktion dich erkennbar; auch Freitext kann Rückschlüsse erlauben.',
    gemeinsam_ergebnisse: 'Die Auswertung der Hausaufgabe erscheint hier ab 15.12.2026; die Live-Ansicht für das stille Schreiben und die Punktevergabe am 18.12.2026.',
    gate_text: 'Bitte öffne den persönlichen Link aus deiner Einladung.',
    gate_hinweis: 'Zugang nur mit persönlicher Einladung. Den Link erhältst du von Balthasar Wicki per WhatsApp.',
    whatsapp: 'Hallo {vorname}\n\nFür das Debriefing GB26 am Freitag, 18.12.2026, 15:00–18:00 an der Uni Bern (auch über Zoom) bitte ich dich, bis 09.12. die Hausaufgabe auszufüllen (45–60 Minuten). Dein persönlicher Zugang:\n{link}\n\nDer Link ist nur für dich. Jeden Teil kannst du mit Namen oder anonym abgeben.\n\nBalthasar'
  },

  teile: {
    A: { t: 'Person & Funktion', d: 'Deine Funktion(en) am GB26 und deine Teilnahme am 18.12.' },
    B: { t: 'Gesamtteam', d: 'Bewertung 1–5 je Themenfeld mit Kommentar. 1 = ungenügend, 5 = sehr gut, «k. A.» = kann ich nicht beurteilen.' },
    C: { t: 'Zeitstrahl', d: 'Markiere Momente, in denen es aus deiner Sicht gut (grün) oder schlecht (rot) lief – je mit einem Satz.' },
    D: { t: 'Fachbereich', d: 'Fragen zu deiner Funktion. Die Fragenblöcke richten sich nach Teil A; du kannst weitere Blöcke dazunehmen.' },
    E: { t: 'Retrospektive', d: 'Einträge wie im Retrospektive-Board des Command Centers. Rückmeldungen über die Bereichsgrenzen sind ausdrücklich erwünscht.' },
    F: { t: 'Runbooks', d: 'Je Runbook aus Notion: genutzt, tauglich, Anpassung nötig.' },
    G: { t: 'Ausblick GB27', d: 'GB27 in Münster, 09.–18.09.2027.' },
    H: { t: 'Vertraulich', d: 'Nur für Balthasar Wicki sichtbar und mit den Teilen B–G nicht verknüpft.' }
  },

  a: {
    funktion_frage: 'Funktion(en) am GB26',
    funktion_hinweis: 'Nach den Rollen in Notion; Mehrfachwahl möglich.',
    andere_ph: 'Andere Funktion (optional)',
    teilnahme_frage: 'Teilnahme am 18.12.2026',
    teilnahme: [
      { id: 'ort', t: 'vor Ort in Bern' },
      { id: 'zoom', t: 'remote über Zoom' },
      { id: 'nein', t: 'kann nicht teilnehmen' }
    ]
  },

  funktionen: [
    { id: 'leitung', t: 'Leitung Command Center' },
    { id: 'strategie', t: 'Strategie' },
    { id: 'capcom', t: 'Capcom' },
    { id: 'chasecom', t: 'Chasecom' },
    { id: 'meteo', t: 'Meteo' },
    { id: 'modell', t: 'Flugmodellierung / Trajektorien' },
    { id: 'ops', t: 'Operations / Luftraum' },
    { id: 'sicherheit', t: 'Sicherheit und Umfeld / Routing' },
    { id: 'it', t: 'IT / Infrastruktur' },
    { id: 'hospitality', t: 'Hospitality / Unterstützung' },
    { id: 'pilot', t: 'Pilot' },
    { id: 'verfolger', t: 'Verfolger' }
  ],

  felder: [
    { id: '1', t: 'Strategie & Entscheidfindung', d: 'Strategie-Optionen, Entscheidzeitpunkte, Verabschiedung und Weitergabe der Strategie' },
    { id: '2', t: 'Meteorologie', d: 'Grosswetterlage, Szenarien mit Wahrscheinlichkeiten, Nowcasting, Startfenster, Landesituation' },
    { id: '3', t: 'Trajektorien & Flugmodellierung', d: 'NETBAT, Ensemble, deterministische Trajektorien, Erreichbarkeit, Abgleich Modell–Fahrt' },
    { id: '4', t: 'Luftraum & Operations', d: 'Lufträume, Freigaben, ATC-Unterstützung, Ressourcenverbrauch im Korb, Abweichungen von der Trajektorie' },
    { id: '5', t: 'Sicherheit, Terrain & Konkurrenz', d: 'Notlandemöglichkeiten, Terrain, Stromleitungen, Konkurrenzanalyse' },
    { id: '6', t: 'Landephase', d: 'Landevorbereitung, Landeanfahrt, Landenachbereitung' },
    { id: '7', t: 'Kommunikation & Lagebild', d: 'Capcom, Chasecom, Zello, Briefings für die Piloten, Lageinformation zum Rennverlauf, Reporting' },
    { id: '8', t: 'Zusammenarbeit Korb – Command Center – Verfolger', d: 'Rückmeldungen zur Arbeit der Piloten und der Verfolger; Bedarf an Ausrüstung und Prozessen im Korb' },
    { id: '9', t: 'Verfolger', d: 'Ziele und Navigation, Fahrzeiten, Fähren, Grenzen, Fahrerwechsel, Sondenstart, Rückholung' },
    { id: '10', t: 'Betrieb Command Center & Infrastruktur', d: 'Leitung, Schichten, Pausen, Übergaben, Retrospektiven, Ressourcenmanagement, Werdtberg, IT, Race Planner' },
    { id: '11', t: 'Vorbereitung, Training & Team', d: 'Jahresrhythmus, Trainingsfahrten, Probeläufe Command Center, Ausbildung, Besetzung, Rekrutierung, Uni Bern / ETH Zürich' }
  ],

  phasen: [
    { id: 'V', t: 'Vorbereitung (bis 28.08.)' },
    { id: 'S', t: 'Startnacht 28./29.08.' },
    { id: 'T1', t: 'Fahrt Samstag 29.08.' },
    { id: 'N', t: 'Nacht 29./30.08.' },
    { id: 'T2', t: 'Fahrt Sonntag 30.08.' },
    { id: 'L', t: 'Landephase und Landung 30.08.' },
    { id: 'R', t: 'Rückführung und Nachbereitung' }
  ],
  bezugspunkte: [
    { p: 'V', z: '24.08. 18:00', t: 'Abstimmung Command Center – Piloten (Notion, Zeitliche Planung)' },
    { p: 'V', z: '26.08.', t: 'Aufbau Infrastruktur (Notion)' },
    { p: 'V', z: '27.08.', t: 'Startstrategie, Briefing «Startfenster Gladbeck», General Briefing (Notion)' },
    { p: 'S', z: '28.08. 22:00', t: 'Briefing «Start 28.8. 23:00Z»: Nord vs. Ost (Notion)' },
    { p: 'S', z: '29.08. 01:31', t: 'Start Gladbeck, erster Ballon von 23 (MESZ)' },
    { p: 'S', z: '29.08. 03:00', t: 'Entscheidpunkt Nord vs. Ost, Kriterium Nord-Trajektorie ≤ 50° (Notion, geplant)' },
    { p: 'T1', z: '29.08. 08:30', t: 'Zwischenbriefing «Hamburg» (Notion)' },
    { p: 'T1', z: '29.08. 11:25', t: 'Hinaus auf die Ostsee bei Heiligendamm (MESZ)' },
    { p: 'T1', z: '29.08. 12:00', t: 'Zwischenbriefing «Küste» (Notion)' },
    { p: 'T1', z: '29.08. 16:25', t: 'Südostspitze Schweden (MESZ)' },
    { p: 'T1', z: '29.08. 19:00', t: 'Briefing «Kaliningrad» (Notion); ab 19:01 MESZ in Führung' },
    { p: 'N', z: '30.08. 03:25', t: 'Saaremaa (MESZ)' },
    { p: 'N', z: '30.08. 04:30', t: 'Briefing «Saaremaa» (Notion)' },
    { p: 'T2', z: '30.08. 07:00', t: 'Briefing «Tallinn» (Notion)' },
    { p: 'T2', z: '30.08. 11:00', t: 'Briefing «Helsinki» (Notion)' },
    { p: 'T2', z: '30.08. 14:07', t: 'Gewitter über Estland, Winddrehung auf Ost (MESZ)' },
    { p: 'T2', z: '30.08. 14:30', t: 'Briefing «Golf von Finnland» (Notion)' },
    { p: 'L', z: '30.08. 18:13', t: 'Letzter Ballast, am KKW Loviisa vorbei (MESZ)' },
    { p: 'L', z: '30.08. 18:34', t: 'Landung bei Loviisa, 19:34 Ortszeit (MESZ 18:34)' },
    { p: 'R', z: '05.09.', t: 'Siegerehrung Gladbeck' }
  ],

  fragen: [
    { id: 'meteo', t: 'Meteo', fn: ['meteo'], q: [
      { id: 'meteo1', t: 'Welche Analysen haben Entscheide getragen?' },
      { id: 'meteo2', t: 'Wo wich die Wetterentwicklung von den Analysen ab?' },
      { id: 'meteo3', t: 'Welche Daten, Modelle oder Rechenressourcen fehlten?' },
      { id: 'meteo4', t: 'Was braucht ihr 2027 (Daten, Zugang, Nutzen für die Forschung)?' }] },
    { id: 'modell', t: 'Flugmodellierung', fn: ['modell'], q: [
      { id: 'modell1', t: 'Wie gut stimmten berechnete Trajektorien und Fahrt überein?' },
      { id: 'modell2', t: 'Datenstand und Rechenzyklen: was hat funktioniert, was nicht?' },
      { id: 'modell3', t: 'Darstellung für Strategie und Piloten: verständlich und rechtzeitig?' },
      { id: 'modell4', t: 'Bedarf 2027?' }] },
    { id: 'leitung', t: 'Leitung, Strategie, Infrastruktur', fn: ['leitung', 'strategie', 'it', 'hospitality'], q: [
      { id: 'leitung1', t: 'Wie liefen Optionen, Briefings, Verabschiedung und Weitergabe der Strategie?' },
      { id: 'leitung2', t: 'Schichten, Übergaben, Ruhezeiten: wie organisiert, wie eingehalten?' },
      { id: 'leitung3', t: 'Infrastruktur Werdtberg und IT: was hat getragen, was fehlte?' },
      { id: 'leitung4', t: 'Wurden Runbooks und Retrospektiven genutzt?' }] },
    { id: 'ops', t: 'Operations, Sicherheit & Umfeld', fn: ['ops', 'sicherheit'], q: [
      { id: 'ops1', t: 'Lufträume und Freigaben: Ablauf und Unterstützung durch ATC?' },
      { id: 'ops2', t: 'Überwachung der Ressourcen im Korb: Daten und Meldungen ausreichend?' },
      { id: 'ops3', t: 'Gefahren- und Konkurrenzanalyse: Aufwand und Nutzen?' },
      { id: 'ops4', t: 'Landevorbereitung: was lag rechtzeitig vor, was fehlte?' }] },
    { id: 'com', t: 'Capcom, Chasecom', fn: ['capcom', 'chasecom'], q: [
      { id: 'com1', t: 'Erreichbarkeit und Kanäle (Zello, Telefon): was hat funktioniert?' },
      { id: 'com2', t: 'Qualität und Rhythmus der Meldungen aus Korb und Verfolgung?' },
      { id: 'com3', t: 'Welche Regeln für den Sprechverkehr braucht es 2027?' }] },
    { id: 'piloten', t: 'Piloten', fn: ['pilot'], q: [
      { id: 'piloten1', t: 'Was habt ihr vom Command Center und von den Verfolgern gebraucht, was kam, was fehlte?' },
      { id: 'piloten2', t: 'Briefings auf dem iPad: Inhalt, Umfang, Zeitpunkt?' },
      { id: 'piloten3', t: 'Welcher Bedarf an Ausrüstung und Prozessen im Korb ergibt sich für die Zusammenarbeit?' }] },
    { id: 'verfolger', t: 'Verfolger', fn: ['verfolger'], q: [
      { id: 'verfolger1', t: 'Ziele und Navigation vom Command Center: klar und rechtzeitig?' },
      { id: 'verfolger2', t: 'Planung ohne bekanntes Zielland: Fähren, Grenzen, Fahrerwechsel, Ruhezeiten?' },
      { id: 'verfolger3', t: 'Fahrzeug, Ausrüstung, Kommunikation: was fehlte?' }] }
  ],

  kategorien: [
    { id: 'beibehalten', t: 'Beibehalten' }, { id: 'tun', t: 'Zukünftig tun' }, { id: 'vermeiden', t: 'Zukünftig vermeiden' },
    { id: 'ideen', t: 'Ideen' }, { id: 'kudos', t: 'Kudos' }
  ],
  bereiche: [
    { id: 'cc', t: 'Command Center' }, { id: 'piloten', t: 'Piloten' }, { id: 'verfolger', t: 'Verfolger' }, { id: 'gesamt', t: 'Gesamtteam' }
  ],

  runbooks: [
    { id: 'rb01', g: 'A  Lernen', t: 'Retrospektive' },
    { id: 'rb02', g: 'B  Abstimmung und Entscheidung', t: 'Briefing Piloten (zur Vorbereitung)' },
    { id: 'rb03', g: 'B  Abstimmung und Entscheidung', t: 'Besprechung' },
    { id: 'rb04', g: 'C  Strategie erarbeiten / aktualisieren', t: 'Startstrategie erarbeiten (Erste 6 Stunden)' },
    { id: 'rb05', g: 'C  Strategie erarbeiten / aktualisieren', t: 'Strategie erarbeiten' },
    { id: 'rb06', g: 'C  Strategie erarbeiten / aktualisieren', t: 'Strategie überprüfen (Korrektheit u. Durchführung)' },
    { id: 'rb07', g: 'C  Strategie erarbeiten / aktualisieren', t: 'Strategie verabschieden' },
    { id: 'rb08', g: 'Analysen', t: 'Wetteranalyse' },
    { id: 'rb09', g: 'Analysen', t: 'Analyse Lufträume' },
    { id: 'rb10', g: 'Analysen', t: 'Gefahrenanalyse (Terrain, Wetter, See, ..)' },
    { id: 'rb11', g: 'Analysen', t: 'Konkurrenzanalyse' },
    { id: 'rb12', g: 'Operations', t: 'Freigabe Luftraum' },
    { id: 'rb13', g: 'Operations', t: 'Landevorbereitung' },
    { id: 'rb14', g: 'Operations', t: 'Landenachbereitung' },
    { id: 'rb15', g: 'Operations', t: 'Zielsetzung u. Navigation Verfolger' },
    { id: 'rb16', g: 'Operations', t: 'Sondenstart' }
  ],

  g: [
    { id: 'premortem', t: 'Pre-Mortem: «Herbst 2027, das Ziel ist verfehlt – woran lag es im Team?»' },
    { id: 'personen', t: 'Personen: wen oder welche Fähigkeiten sollten wir ins Team holen?' },
    { id: 'partner', t: 'Partner: Hochschulen, Organisationen, Unterstützer' },
    { id: 'technik', t: 'Technik und Infrastruktur' },
    { id: 'training', t: 'Training und Vorbereitung (Rhythmus, Trainingsfahrten, Probeläufe)' },
    { id: 'finanzen', t: 'Hinweis zu Finanzen (optional)' }
  ],

  h: {
    bereitschaft_frage: 'Bereitschaft für 2027',
    bereitschaft: [{ id: 'ja', t: 'ja' }, { id: 'einschr', t: 'ja, mit Einschränkungen' }, { id: 'nein', t: 'nein' }, { id: 'offen', t: 'noch offen' }],
    rolle_frage: 'Wunschrolle 2027',
    verf_frage: 'Verfügbarkeit GB27 Münster, 09.–18.09.2027',
    verf: [{ id: 'ganz', t: 'ganze Zeit' }, { id: 'teil', t: 'teilweise' }, { id: 'nein', t: 'nicht verfügbar' }, { id: 'offen', t: 'noch offen' }],
    verf_ph: 'Ergänzung, z. B. welche Tage',
    trainings_frage: 'Verfügbarkeit für Trainingsfahrten und Probeläufe',
    voraus_frage: 'Was müsste gegeben sein oder sich ändern, damit du dabei bist?',
    anliegen_frage: 'Anliegen zu Zusammenarbeit und Belastung, die du nur vertraulich ansprechen möchtest'
  },

  ablauf: [
    { z: '15:00', t: 'Eröffnung' }, { z: '15:10', t: 'Zeitstrahl der Fahrt' }, { z: '15:30', t: 'Beibehalten' },
    { z: '15:55', t: 'Schlüsselmomente a–c' }, { z: '16:25', t: 'Pause' }, { z: '16:40', t: 'Schlüsselmomente d–e' },
    { z: '17:00', t: 'Lücken & Ideen GB27' }, { z: '17:30', t: 'Massnahmen & Organisation 2027' }, { z: '17:50', t: 'Abschluss' },
    { z: '18:30', t: 'Nachtessen' }
  ]
};
