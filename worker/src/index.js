// gb26debrief.wicki.aero – API (Cloudflare Worker + D1)
// Zugang nur mit persönlichem Link: zufälliges Token, in D1 nur als SHA-256 gespeichert.
// Anonymität: Einträge in «anon» werden ohne Personenkennung, ohne Zeitstempel und ohne IP gespeichert; der Worker
// schreibt keine Anfragedaten in Logs (Observability in wrangler.toml ausgeschaltet). Anonyme Einträge gibt die API
// erst nach der Frist heraus, auch an den Admin.

const VERSION = '0.1.0';
const PARTS_NAMED = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const PARTS_ANON = ['B', 'C', 'D', 'E', 'F', 'G'];
const MAX_DATA = 64 * 1024;

class HttpError extends Error { constructor(status, code, message) { super(message || code); this.status = status; this.code = code; } }
const bad = (code, msg) => new HttpError(400, code, msg);

export default {
  async fetch(req, env) {
    const cors = corsHeaders(env, req.headers.get('Origin') || '');
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    let res;
    try { res = await route(req, env, new URL(req.url)); }
    catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      res = json({ ok: false, error: e instanceof HttpError ? e.code : 'server', message: e instanceof HttpError ? e.message : 'Interner Fehler' }, status);
    }
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  }
};

function corsHeaders(env, origin) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = { 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization', 'Access-Control-Max-Age': '86400', Vary: 'Origin' };
  if (allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
const today = () => new Date().toISOString().slice(0, 10);
async function body(req) { try { return await req.json(); } catch { throw bad('json', 'Ungültige Anfrage (JSON erwartet)'); } }

// ---------- Kryptografie ----------
const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
function rand(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
const newId = () => b64u(rand(12));
const newToken = () => b64u(rand(32));
async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }

// ---------- Prüfungen ----------
function text(s, max, code) { const t = String(s == null ? '' : s).trim(); if (t.length > max) throw bad(code, `${code}: höchstens ${max} Zeichen`); return t; }
function data(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) throw bad('data', 'Daten fehlen');
  const s = JSON.stringify(d);
  if (s.length > MAX_DATA) throw bad('data', 'Eingabe zu umfangreich');
  return s;
}
function partOf(p, list) { const x = String(p || '').toUpperCase(); if (!list.includes(x)) throw bad('part', 'Unbekannter Teil'); return x; }

// ---------- Zugang ----------
async function who(req, env) {
  const h = req.headers.get('Authorization') || '';
  const m = h.match(/^Bearer ([A-Za-z0-9_-]{20,100})$/);
  if (!m) throw new HttpError(401, 'auth', 'Kein gültiger Zugang – bitte den persönlichen Link aus der Einladung öffnen');
  const p = await env.DB.prepare('SELECT id, name, funktion, team, is_admin, done FROM participants WHERE token_hash = ? AND link_state = ?')
    .bind(await sha256(m[1]), 'aktiv').first();
  if (!p) throw new HttpError(401, 'auth', 'Dieser Link ist nicht (mehr) gültig – bitte bei Balthasar Wicki einen neuen anfordern');
  return p;
}
async function admin(req, env) { const p = await who(req, env); if (!p.is_admin) throw new HttpError(403, 'admin', 'Nur für den Admin'); return p; }

async function setting(env, k) { const r = await env.DB.prepare('SELECT v FROM settings WHERE k = ?').bind(k).first(); return r ? r.v : null; }
async function isOpen(env) { const d = await setting(env, 'deadline'); return !d || Date.now() <= Date.parse(d); }
async function requireOpen(env) { if (!(await isOpen(env))) throw new HttpError(409, 'closed', 'Die Frist für die Hausaufgabe ist abgelaufen'); }

// ---------- Routen ----------
async function route(req, env, url) {
  const p = url.pathname.replace(/\/+$/, '');
  const M = req.method;
  const seg = p.split('/').filter(Boolean); // ['api', ...]
  if (seg[0] !== 'api') throw new HttpError(404, 'notfound', 'Nicht gefunden');

  if (p === '/api/health' && M === 'GET') return json({ ok: true, version: VERSION });

  // ----- Teilnehmende -----
  if (p === '/api/me' && M === 'GET') {
    const me = await who(req, env);
    const named = {};
    const rows = await env.DB.prepare('SELECT part, data, updated FROM named WHERE participant_id = ?').bind(me.id).all();
    for (const r of rows.results) named[r.part] = { data: JSON.parse(r.data), updated: r.updated };
    const c = await env.DB.prepare('SELECT data, updated FROM confidential WHERE participant_id = ?').bind(me.id).first();
    return json({ ok: true, version: VERSION, me: { id: me.id, name: me.name, funktion: me.funktion, team: me.team, admin: !!me.is_admin, done: !!me.done },
      deadline: await setting(env, 'deadline'), open: await isOpen(env), named, confidential: c ? { data: JSON.parse(c.data), updated: c.updated } : null });
  }
  if (seg[1] === 'named' && seg.length === 3) {
    const me = await who(req, env);
    const part = partOf(seg[2], PARTS_NAMED);
    await requireOpen(env);
    if (M === 'PUT') {
      const d = data((await body(req)).data);
      await env.DB.prepare('INSERT INTO named (participant_id, part, data, updated) VALUES (?, ?, ?, ?) ON CONFLICT(participant_id, part) DO UPDATE SET data = excluded.data, updated = excluded.updated')
        .bind(me.id, part, d, today()).run();
      return json({ ok: true, updated: today() });
    }
    if (M === 'DELETE') { await env.DB.prepare('DELETE FROM named WHERE participant_id = ? AND part = ?').bind(me.id, part).run(); return json({ ok: true }); }
  }
  if (p === '/api/anon' && M === 'POST') {
    await who(req, env);                       // nur Eingeladene dürfen absenden – die Person wird nicht gespeichert
    await requireOpen(env);
    const b = await body(req);
    const part = partOf(b.part, PARTS_ANON);
    const funktion = b.funktion ? text(b.funktion, 200, 'Funktion') : null;
    await env.DB.prepare('INSERT INTO anon (id, part, funktion, data) VALUES (?, ?, ?, ?)').bind(newId(), part, funktion, data(b.data)).run();
    return json({ ok: true });
  }
  if (p === '/api/confidential' && M === 'PUT') {
    const me = await who(req, env);
    await requireOpen(env);
    const d = data((await body(req)).data);
    await env.DB.prepare('INSERT INTO confidential (participant_id, data, updated) VALUES (?, ?, ?) ON CONFLICT(participant_id) DO UPDATE SET data = excluded.data, updated = excluded.updated')
      .bind(me.id, d, today()).run();
    return json({ ok: true, updated: today() });
  }
  if (p === '/api/done' && M === 'POST') {
    const me = await who(req, env);
    const b = await body(req);
    await env.DB.prepare('UPDATE participants SET done = ? WHERE id = ?').bind(b.done ? 1 : 0, me.id).run();
    return json({ ok: true, done: !!b.done });
  }
  if (p === '/api/docs' && M === 'GET') {
    await who(req, env);
    const r = await env.DB.prepare('SELECT id, title, url, body FROM docs ORDER BY sort, created').all();
    return json({ ok: true, docs: r.results });
  }

  // ----- Admin -----
  if (seg[1] === 'admin') {
    await admin(req, env);
    const sub = seg.slice(2);
    if (sub[0] === 'participants') {
      if (sub.length === 1 && M === 'GET') {
        const r = await env.DB.prepare('SELECT id, name, funktion, team, is_admin, link_state, done, sort FROM participants ORDER BY sort, name').all();
        const parts = await env.DB.prepare('SELECT participant_id, part FROM named').all();
        const conf = await env.DB.prepare('SELECT participant_id FROM confidential').all();
        const np = {}; for (const x of parts.results) (np[x.participant_id] = np[x.participant_id] || []).push(x.part);
        const cf = new Set(conf.results.map(x => x.participant_id));
        return json({ ok: true, participants: r.results.map(x => ({ ...x, is_admin: !!x.is_admin, done: !!x.done, named_parts: (np[x.id] || []).sort(), confidential: cf.has(x.id) })) });
      }
      if (sub.length === 1 && M === 'POST') {
        const b = await body(req);
        const name = text(b.name, 120, 'Name'); if (!name) throw bad('name', 'Name fehlt');
        const id = newId();
        await env.DB.prepare('INSERT INTO participants (id, name, funktion, team, sort) VALUES (?, ?, ?, ?, ?)')
          .bind(id, name, text(b.funktion, 200, 'Funktion'), text(b.team, 100, 'Team'), Number(b.sort) || 0).run();
        return json({ ok: true, id });
      }
      const id = sub[1];
      if (sub.length === 2 && M === 'PATCH') {
        const b = await body(req);
        const cur = await env.DB.prepare('SELECT * FROM participants WHERE id = ?').bind(id).first();
        if (!cur) throw new HttpError(404, 'notfound', 'Person nicht gefunden');
        await env.DB.prepare('UPDATE participants SET name = ?, funktion = ?, team = ?, sort = ? WHERE id = ?')
          .bind(b.name != null ? text(b.name, 120, 'Name') : cur.name, b.funktion != null ? text(b.funktion, 200, 'Funktion') : cur.funktion,
            b.team != null ? text(b.team, 100, 'Team') : cur.team, b.sort != null ? Number(b.sort) || 0 : cur.sort, id).run();
        return json({ ok: true });
      }
      if (sub.length === 3 && sub[2] === 'link' && M === 'POST') {
        const t = newToken();
        const r = await env.DB.prepare("UPDATE participants SET token_hash = ?, link_state = 'aktiv' WHERE id = ?").bind(await sha256(t), id).run();
        if (!r.meta.changes) throw new HttpError(404, 'notfound', 'Person nicht gefunden');
        return json({ ok: true, token: t });
      }
      if (sub.length === 3 && sub[2] === 'revoke' && M === 'POST') {
        await env.DB.prepare("UPDATE participants SET token_hash = NULL, link_state = 'widerrufen' WHERE id = ?").bind(id).run();
        return json({ ok: true });
      }
    }
    if (sub[0] === 'confidential' && M === 'GET') {
      const r = await env.DB.prepare('SELECT p.name, c.data, c.updated FROM confidential c JOIN participants p ON p.id = c.participant_id ORDER BY p.sort, p.name').all();
      return json({ ok: true, items: r.results.map(x => ({ name: x.name, updated: x.updated, data: JSON.parse(x.data) })) });
    }
    if (sub[0] === 'named' && M === 'GET') {
      const r = await env.DB.prepare('SELECT p.name, p.funktion, n.part, n.data, n.updated FROM named n JOIN participants p ON p.id = n.participant_id ORDER BY n.part, p.sort, p.name').all();
      return json({ ok: true, items: r.results.map(x => ({ name: x.name, funktion: x.funktion, part: x.part, updated: x.updated, data: JSON.parse(x.data) })) });
    }
    if (sub[0] === 'anon' && M === 'GET') {
      if (await isOpen(env)) throw new HttpError(403, 'open', 'Anonyme Einträge werden erst nach der Frist angezeigt');
      const r = await env.DB.prepare('SELECT part, funktion, data FROM anon ORDER BY part, id').all();
      return json({ ok: true, items: r.results.map(x => ({ part: x.part, funktion: x.funktion, data: JSON.parse(x.data) })) });
    }
    if (sub[0] === 'docs') {
      if (sub.length === 1 && M === 'POST') {
        const b = await body(req);
        const title = text(b.title, 200, 'Titel'); if (!title) throw bad('title', 'Titel fehlt');
        const u = text(b.url, 1000, 'Link'); if (u && !/^https:\/\//.test(u)) throw bad('url', 'Link muss mit https:// beginnen');
        const id = newId();
        await env.DB.prepare('INSERT INTO docs (id, title, url, body, sort, created) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, title, u, text(b.body, 20000, 'Text'), Number(b.sort) || 0, today()).run();
        return json({ ok: true, id });
      }
      if (sub.length === 2 && M === 'DELETE') { await env.DB.prepare('DELETE FROM docs WHERE id = ?').bind(sub[1]).run(); return json({ ok: true }); }
    }
    if (sub[0] === 'settings') {
      if (M === 'GET') return json({ ok: true, deadline: await setting(env, 'deadline'), open: await isOpen(env) });
      if (M === 'PUT') {
        const b = await body(req);
        if (!b.deadline || isNaN(Date.parse(b.deadline))) throw bad('deadline', 'Frist ungültig');
        await env.DB.prepare("INSERT INTO settings (k, v) VALUES ('deadline', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(new Date(b.deadline).toISOString()).run();
        return json({ ok: true });
      }
    }
  }
  throw new HttpError(404, 'notfound', 'Nicht gefunden');
}
