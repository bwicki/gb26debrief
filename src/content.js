/* gb26debrief.wicki.aero – Inhalte der Hausaufgabe (Konzept v1.1, Kap. 5 und 7). Quellen: Notion «Gordon Bennett 2026»
   (Rollen, Runbooks, Briefing, Zeitliche Planung) und Fahrtdaten SUI-2. Texte hier ändern, nicht im Code. */
window.GB26 = {
  termin: 'Freitag, 18.12.2026, 15:00–18:00, Universität Bern (und Zoom); ab 18:30 gemeinsames Nachtessen',

  funktionen: [
    'Leitung Command Center', 'Strategie', 'Capcom', 'Chasecom', 'Meteo', 'Flugmodellierung / Trajektorien',
    'Operations / Luftraum', 'Sicherheit und Umfeld / Routing', 'IT / Infrastruktur', 'Hospitality / Unterstützung',
    'Pilot', 'Verfolger'
  ],

  // Teil B: Themenfelder (Konzept Kap. 5)
  felder: [
    ['1', 'Strategie & Entscheidfindung', 'Strategie-Optionen, Entscheidzeitpunkte, Verabschiedung und Weitergabe der Strategie'],
    ['2', 'Meteorologie', 'Grosswetterlage, Szenarien mit Wahrscheinlichkeiten, Nowcasting, Startfenster, Landesituation'],
    ['3', 'Trajektorien & Flugmodellierung', 'NETBAT, Ensemble, deterministische Trajektorien, Erreichbarkeit, Abgleich Modell–Fahrt'],
    ['4', 'Luftraum & Operations', 'Lufträume, Freigaben, ATC-Unterstützung, Ressourcenverbrauch im Korb, Abweichungen von der Trajektorie'],
    ['5', 'Sicherheit, Terrain & Konkurrenz', 'Notlandemöglichkeiten, Terrain, Stromleitungen, Konkurrenzanalyse'],
    ['6', 'Landephase', 'Landevorbereitung, Landeanfahrt, Landenachbereitung'],
    ['7', 'Kommunikation & Lagebild', 'Capcom, Chasecom, Zello, Briefings für die Piloten, Lageinformation zum Rennverlauf, Reporting'],
    ['8', 'Zusammenarbeit Korb – Command Center – Verfolger', 'Rückmeldungen zur Arbeit der Piloten und der Verfolger; Bedarf an Ausrüstung und Prozessen im Korb'],
    ['9', 'Verfolger', 'Ziele und Navigation, Fahrzeiten, Fähren, Grenzen, Fahrerwechsel, Sondenstart, Rückholung'],
    ['10', 'Betrieb Command Center & Infrastruktur', 'Leitung, Schichten, Pausen, Übergaben, Retrospektiven, Ressourcenmanagement, Werdtberg, IT, Race Planner'],
    ['11', 'Vorbereitung, Training & Team', 'Jahresrhythmus, Trainingsfahrten, Probeläufe Command Center, Ausbildung, Besetzung, Rekrutierung, Uni Bern / ETH Zürich']
  ],

  // Teil C: Phasen der Zeitachse und Bezugspunkte
  phasen: [
    ['V', 'Vorbereitung (bis 28.08.)'],
    ['S', 'Startnacht 28./29.08.'],
    ['T1', 'Fahrt Samstag 29.08.'],
    ['N', 'Nacht 29./30.08.'],
    ['T2', 'Fahrt Sonntag 30.08.'],
    ['L', 'Landephase und Landung 30.08.'],
    ['R', 'Rückführung und Nachbereitung']
  ],
  bezugspunkte: [
    ['V', '24.08. 18:00', 'Abstimmung Command Center – Piloten (Notion, Zeitliche Planung)'],
    ['V', '26.08.', 'Aufbau Infrastruktur (Notion)'],
    ['V', '27.08.', 'Startstrategie, Briefing «Startfenster Gladbeck», General Briefing (Notion)'],
    ['S', '28.08. 22:00', 'Briefing «Start 28.8. 23:00Z»: Nord vs. Ost (Notion)'],
    ['S', '29.08. 01:31', 'Start Gladbeck, erster Ballon von 23 (MESZ)'],
    ['S', '29.08. 03:00', 'Entscheidpunkt Nord vs. Ost, Kriterium Nord-Trajektorie ≤ 50° (Notion, geplant)'],
    ['T1', '29.08. 08:30', 'Zwischenbriefing «Hamburg» (Notion)'],
    ['T1', '29.08. 11:25', 'Hinaus auf die Ostsee bei Heiligendamm (MESZ)'],
    ['T1', '29.08. 12:00', 'Zwischenbriefing «Küste» (Notion)'],
    ['T1', '29.08. 16:25', 'Südostspitze Schweden (MESZ)'],
    ['T1', '29.08. 19:00', 'Briefing «Kaliningrad» (Notion); ab 19:01 MESZ in Führung'],
    ['N', '30.08. 03:25', 'Saaremaa (MESZ)'],
    ['N', '30.08. 04:30', 'Briefing «Saaremaa» (Notion)'],
    ['T2', '30.08. 07:00', 'Briefing «Tallinn» (Notion)'],
    ['T2', '30.08. 11:00', 'Briefing «Helsinki» (Notion)'],
    ['T2', '30.08. 14:07', 'Gewitter über Estland, Winddrehung auf Ost (MESZ)'],
    ['T2', '30.08. 14:30', 'Briefing «Golf von Finnland» (Notion)'],
    ['L', '30.08. 18:13', 'Letzter Ballast, am KKW Loviisa vorbei (MESZ)'],
    ['L', '30.08. 18:34', 'Landung bei Loviisa, 19:34 Ortszeit (MESZ 18:34)'],
    ['R', '05.09.', 'Siegerehrung Gladbeck']
  ],

  // Teil D: Fragen je Funktion (Konzept Kap. 7.6)
  fragen: {
    meteo: { titel: 'Meteo', fn: ['Meteo'], q: [
      'Welche Analysen haben Entscheide getragen?',
      'Wo wich die Wetterentwicklung von den Analysen ab?',
      'Welche Daten, Modelle oder Rechenressourcen fehlten?',
      'Was braucht ihr 2027 (Daten, Zugang, Nutzen für die Forschung)?'] },
    modell: { titel: 'Flugmodellierung', fn: ['Flugmodellierung / Trajektorien'], q: [
      'Wie gut stimmten berechnete Trajektorien und Fahrt überein?',
      'Datenstand und Rechenzyklen: was hat funktioniert, was nicht?',
      'Darstellung für Strategie und Piloten: verständlich und rechtzeitig?',
      'Bedarf 2027?'] },
    leitung: { titel: 'Leitung, Strategie, Infrastruktur', fn: ['Leitung Command Center', 'Strategie', 'IT / Infrastruktur', 'Hospitality / Unterstützung'], q: [
      'Wie liefen Optionen, Briefings, Verabschiedung und Weitergabe der Strategie?',
      'Schichten, Übergaben, Ruhezeiten: wie organisiert, wie eingehalten?',
      'Infrastruktur Werdtberg und IT: was hat getragen, was fehlte?',
      'Wurden Runbooks und Retrospektiven genutzt?'] },
    ops: { titel: 'Operations, Sicherheit & Umfeld', fn: ['Operations / Luftraum', 'Sicherheit und Umfeld / Routing'], q: [
      'Lufträume und Freigaben: Ablauf und Unterstützung durch ATC?',
      'Überwachung der Ressourcen im Korb: Daten und Meldungen ausreichend?',
      'Gefahren- und Konkurrenzanalyse: Aufwand und Nutzen?',
      'Landevorbereitung: was lag rechtzeitig vor, was fehlte?'] },
    com: { titel: 'Capcom, Chasecom', fn: ['Capcom', 'Chasecom'], q: [
      'Erreichbarkeit und Kanäle (Zello, Telefon): was hat funktioniert?',
      'Qualität und Rhythmus der Meldungen aus Korb und Verfolgung?',
      'Welche Regeln für den Sprechverkehr braucht es 2027?'] },
    piloten: { titel: 'Piloten', fn: ['Pilot'], q: [
      'Was habt ihr vom Command Center und von den Verfolgern gebraucht, was kam, was fehlte?',
      'Briefings auf dem iPad: Inhalt, Umfang, Zeitpunkt?',
      'Welcher Bedarf an Ausrüstung und Prozessen im Korb ergibt sich für die Zusammenarbeit?'] },
    verfolger: { titel: 'Verfolger', fn: ['Verfolger'], q: [
      'Ziele und Navigation vom Command Center: klar und rechtzeitig?',
      'Planung ohne bekanntes Zielland: Fähren, Grenzen, Fahrerwechsel, Ruhezeiten?',
      'Fahrzeug, Ausrüstung, Kommunikation: was fehlte?'] }
  },

  // Teil E
  kategorien: ['Beibehalten', 'Zukünftig tun', 'Zukünftig vermeiden', 'Ideen', 'Kudos'],
  bereiche: ['Command Center', 'Piloten', 'Verfolger', 'Gesamtteam'],

  // Teil F: Runbooks gemäss Notion «Command Center / Runbooks»
  runbooks: [
    ['A', 'Retrospektive'],
    ['B', 'Briefing Piloten (zur Vorbereitung)'],
    ['B', 'Besprechung'],
    ['C', 'Startstrategie erarbeiten (Erste 6 Stunden)'],
    ['C', 'Strategie erarbeiten'],
    ['C', 'Strategie überprüfen (Korrektheit u. Durchführung)'],
    ['C', 'Strategie verabschieden'],
    ['Analysen', 'Wetteranalyse'],
    ['Analysen', 'Analyse Lufträume'],
    ['Analysen', 'Gefahrenanalyse (Terrain, Wetter, See, ..)'],
    ['Analysen', 'Konkurrenzanalyse'],
    ['Operations', 'Freigabe Luftraum'],
    ['Operations', 'Landevorbereitung'],
    ['Operations', 'Landenachbereitung'],
    ['Operations', 'Zielsetzung u. Navigation Verfolger'],
    ['Operations', 'Sondenstart']
  ]
};
