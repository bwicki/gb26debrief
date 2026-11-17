# Einrichtung – gb26debrief.wicki.aero

Alles im Browser. Schlüssel nie in Dateien des Repositories schreiben und nie im Chat weitergeben.

## 1 Cloudflare-Token und Secrets (erledigt am 17.11.2026)

GitHub `bwicki/gb26debrief` → **Settings → Secrets and variables → Actions**: `CLOUDFLARE_API_TOKEN` (Token mit
Workers Scripts Edit, D1 Edit, Account Settings Read) und `CLOUDFLARE_ACCOUNT_ID`.

## 2 Datenbank und Worker

* D1-Datenbank `gb26debrief` (ID in `worker/wrangler.toml`), angelegt am 17.11.2026.
* Workflow **Deploy worker** läuft bei jeder Änderung unter `worker/`: Schema einspielen, `gb26debrief-api`
  deployen, `/api/health` prüfen. Manuell: GitHub → Actions → Deploy worker → Run workflow.

## 3 GitHub Pages

Settings → Pages → Branch `main`, Ordner `/ (root)`; Custom domain `gb26debrief.wicki.aero` (Datei `CNAME`).
DNS bei united-domains: `CNAME gb26debrief → bwicki.github.io`.

## 4 Teilnehmende und Links

Admin-Seite `#admin`: je Person **Link erstellen** → **In WhatsApp öffnen** (Kontakt in WhatsApp wählen) oder
Link kopieren. Der Link wird nur in diesem Moment angezeigt.
