-- gb26debrief.wicki.aero – Datenbank D1 «gb26debrief». Wiederholbar (IF NOT EXISTS).
-- Anonymität: Tabelle «anon» enthält keine Personenkennung, keinen Zeitstempel und keine fortlaufende Nummer
-- (zufällige Kennung, WITHOUT ROWID). Teil H («confidential») ist von den Teilen B–G getrennt.

CREATE TABLE IF NOT EXISTS participants (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  funktion   TEXT NOT NULL DEFAULT '',
  team       TEXT NOT NULL DEFAULT '',
  is_admin   INTEGER NOT NULL DEFAULT 0,
  token_hash TEXT UNIQUE,
  link_state TEXT NOT NULL DEFAULT 'neu',
  done       INTEGER NOT NULL DEFAULT 0,
  sort       INTEGER NOT NULL DEFAULT 0
);

-- Namentliche Teile A–G: je Person und Teil eine Zeile; Datum ohne Uhrzeit
CREATE TABLE IF NOT EXISTS named (
  participant_id TEXT NOT NULL,
  part           TEXT NOT NULL,
  data           TEXT NOT NULL,
  updated        TEXT NOT NULL,
  PRIMARY KEY (participant_id, part)
);

-- Anonyme Einträge Teile B–G
CREATE TABLE IF NOT EXISTS anon (
  id       TEXT PRIMARY KEY,
  part     TEXT NOT NULL,
  funktion TEXT,
  data     TEXT NOT NULL
) WITHOUT ROWID;

-- Teil H, vertraulich, nur Admin
CREATE TABLE IF NOT EXISTS confidential (
  participant_id TEXT PRIMARY KEY,
  data           TEXT NOT NULL,
  updated        TEXT NOT NULL
);

-- Gemeinsamer Bereich: Unterlagen
CREATE TABLE IF NOT EXISTS docs (
  id      TEXT PRIMARY KEY,
  title   TEXT NOT NULL,
  url     TEXT NOT NULL DEFAULT '',
  body    TEXT NOT NULL DEFAULT '',
  sort    INTEGER NOT NULL DEFAULT 0,
  created TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (k, v) VALUES ('deadline', '2026-12-09T22:59:59Z');
