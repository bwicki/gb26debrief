/* gb26debrief.wicki.aero – Oberfläche. Seiten: #start, #teil-A … #teil-H, #gemeinsam, #admin, #texte.
   Entwürfe bleiben im Browser (localStorage, je Person), bis sie gespeichert oder anonym abgeschickt sind.
   Texte und Listen: Standard in src/content.js, Änderungen des Admins aus der API (gehen vor). Antworten hängen an
   den Kennungen (id) der Einträge, nicht am Wortlaut. */
(function () {
  'use strict';
  const DEF = window.GB26_DEFAULT, CFG = window.GB26CONFIG, API = window.GB26API;
  const app = document.getElementById('app');
  let C = DEF, TM = null;   // TM: wer die Texte zuletzt gespeichert hat (nur Admin und Redaktion)
  let S = { me: null, deadline: null, open: true, named: {}, confidential: null };

  // ---------- Hilfen ----------
  function el(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c instanceof Node ? c : document.createTextNode(String(c))); }
    return e;
  }
  const clone = o => JSON.parse(JSON.stringify(o));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* voll */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* egal */ } }
  };
  const key = (part, what) => `gb26.${S.me.id}.${part}.${what}`;
  const dmy = iso => iso ? iso.slice(0, 10).split('-').reverse().join('.') : '';
  const deadlineText = () => S.deadline ? new Date(S.deadline).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const vorname = () => (S.me && S.me.name || '').split(' ')[0];
  const fill = (s, x) => String(s || '').replace(/\{vorname\}/g, (x && x.vorname) || vorname()).replace(/\{frist\}/g, deadlineText()).replace(/\{link\}/g, (x && x.link) || '');
  const vis = list => (list || []).filter(x => !x.aus && !(x.t != null && !String(x.t).trim()));   // ausgeblendete und leere Einträge weglassen
  const label = (list, id) => { const x = (list || []).find(y => y.id === id); return x ? x.t : id; };
  // Standard und gespeicherte Änderungen zusammenführen: Objekte schlüsselweise, Listen als Ganzes
  function merge(def, ov) {
    if (!ov || typeof ov !== 'object') return clone(def);
    const out = clone(def);
    for (const k of Object.keys(ov)) {
      if (Array.isArray(ov[k]) || typeof ov[k] !== 'object' || ov[k] == null || Array.isArray(def[k]) || typeof def[k] !== 'object') out[k] = clone(ov[k]);
      else out[k] = Object.assign({}, def[k] || {}, clone(ov[k]));
    }
    for (const id of Object.keys(DEF.teile)) out.teile[id] = Object.assign({}, DEF.teile[id], (out.teile || {})[id] || {});
    return out;
  }

  // Nur Abweichungen vom Standard speichern: spätere Ergänzungen in src/content.js bleiben so wirksam
  function diff(def, cur) {
    const out = {}, same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    for (const k of Object.keys(cur)) {
      if (same(def[k], cur[k])) continue;
      if (cur[k] && typeof cur[k] === 'object' && !Array.isArray(cur[k]) && def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) {
        const o = {};
        for (const j of Object.keys(cur[k])) if (!same(def[k][j], cur[k][j])) o[j] = cur[k][j];
        if (Object.keys(o).length) out[k] = o;
      } else out[k] = cur[k];
    }
    return out;
  }

  // Eigene Änderungen (gegenüber base) auf einen neueren Stand (theirs) übertragen; bei gleichem Abschnitt gilt die eigene Fassung
  function rebase(base, mine, theirs) {
    const out = clone(theirs), same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    for (const k of Object.keys(mine)) {
      if (same(mine[k], base[k])) continue;
      if (mine[k] && typeof mine[k] === 'object' && !Array.isArray(mine[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = Object.assign({}, out[k] || {});
        for (const j of Object.keys(mine[k])) if (!same(mine[k][j], base[k][j])) out[k][j] = clone(mine[k][j]);
      } else out[k] = clone(mine[k]);
    }
    return out;
  }
  const whenText = iso => new Date(iso).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ---------- Meldungen: bleiben stehen, kopierbar ----------
  const msgs = el('div', { id: 'msgs', 'aria-live': 'polite' });
  document.body.append(msgs);
  function msg(text, kind) {
    const t = new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    const box = el('div', { class: 'msg ' + (kind || 'ok') },
      el('time', { text: t }), el('div', { class: 'txt', text }),
      el('button', { class: 'ghost', title: 'Kopieren', onclick: () => navigator.clipboard && navigator.clipboard.writeText(text) }, '⧉'),
      el('button', { class: 'ghost', title: 'Schliessen', onclick: () => box.remove() }, '✕'));
    msgs.append(box);
    while (msgs.children.length > 6) msgs.firstChild.remove();
  }
  const err = e => msg((e && e.message) || String(e), 'err');

  // ---------- Teile ----------
  const PART_IDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const ANON_OK = { B: 1, C: 1, D: 1, E: 1, F: 1, G: 1 };
  const P = id => ({ id, t: C.teile[id].t, d: C.teile[id].d, anon: !!ANON_OK[id] });

  function partStatus(id) {
    if (id === 'H') return S.confidential ? ['ok', 'gespeichert ' + dmy(S.confidential.updated)] : (LS.get(key('H', 'draft')) ? ['', 'Entwurf'] : ['', 'offen']);
    const sent = LS.get(key(id, 'sent'));
    if (S.named[id]) return ['ok', 'mit Namen ' + dmy(S.named[id].updated)];
    if (sent) return ['ok', 'anonym abgeschickt'];
    if (LS.get(key(id, 'draft'))) return ['', 'Entwurf'];
    return ['', 'offen'];
  }
  function draftOf(id) {
    const d = LS.get(key(id, 'draft'));
    if (d) return d;
    if (id === 'H') return S.confidential ? clone(S.confidential.data) : {};
    return S.named[id] ? clone(S.named[id].data) : {};
  }
  const fnIds = () => draftOf('A').funktionen || [];
  function fnLabels() { const a = draftOf('A'); return fnIds().map(id => label(C.funktionen, id)).concat(a.andere ? [a.andere] : []); }

  // ---------- Rahmen ----------
  function shell(active, ...content) {
    const nav = [['start', 'Start'], ['teil-A', 'Hausaufgabe'], ['gemeinsam', 'Gemeinsam']];
    if (S.me.admin) nav.push(['admin', 'Admin']);
    if (S.me.editor) nav.push(['texte', 'Texte']);
    app.replaceChildren(
      el('header', { class: 'top' },
        el('div', { class: 'brand' }, el('strong', { text: 'Debriefing GB26' }), el('span', { class: 'sub', text: 'Team SUI-2 · Hausaufgabe und gemeinsamer Bereich' })),
        el('nav', { class: 'main' }, nav.map(([h, t]) => el('a', { href: '#' + h, 'aria-current': (active === h || (h === 'teil-A' && active.startsWith('teil-'))) ? 'page' : null, text: t }))),
        el('div', { class: 'top-right' },
          el('div', { class: 'who' }, S.me.name, el('br'), el('span', { class: 'small', text: S.open ? 'Frist ' + deadlineText() : 'Frist abgelaufen' })),
          el('div', { class: 'logo' }, el('img', { src: './img/logo.png', alt: 'Wicki Partners Ballonteam' }), el('span', { class: 'ver', text: 'v' + CFG.version })))),
      el('main', {}, ...content));
  }
  const stepsNav = cur => el('div', { class: 'steps' }, PART_IDS.map(id => { const [c, st] = partStatus(id); return el('a', { href: '#teil-' + id, class: c, 'aria-current': id === cur ? 'page' : null }, el('b', { text: id }), el('span', { text: P(id).t }), el('span', { class: 'st', text: st })); }));

  // ---------- Start ----------
  function viewStart() {
    const T = C.texte;
    shell('start',
      el('h1', { text: fill(T.start_titel) }),
      el('div', { class: 'card stack' },
        el('h2', { text: 'Debriefing Gordon Bennett 2026' }),
        el('p', { text: fill(T.termin) }),
        el('p', { text: fill(T.start_ziel) }),
        el('p', {}, el('b', { text: fill(T.start_frist) }))),
      el('div', { class: 'card stack' },
        el('h2', { text: 'Hausaufgabe' }), stepsNav(null),
        el('div', { class: 'row' },
          el('a', { class: 'btn', href: '#teil-' + nextOpenPart() }, 'Weiterarbeiten'),
          S.me.done
            ? el('button', { class: 'sec', onclick: () => setDone(false) }, '✓ Als abgeschlossen gemeldet – rückgängig')
            : el('button', { class: 'sec', onclick: () => setDone(true) }, 'Hausaufgabe als abgeschlossen melden'))),
      el('div', { class: 'card stack' },
        el('h2', { text: fill(T.anon_titel) }),
        el('ul', {}, String(T.anon_regeln || '').split('\n').filter(s => s.trim()).map(s => el('li', { text: fill(s) })),
          el('li', {}, 'Der Quellcode ist einsehbar: ', el('a', { href: 'https://github.com/bwicki/gb26debrief', target: '_blank', rel: 'noopener', text: 'github.com/bwicki/gb26debrief' }), '.'))));
  }
  function nextOpenPart() { const id = PART_IDS.find(x => partStatus(x)[0] !== 'ok'); return id || 'A'; }
  async function setDone(v) { try { await API.setDone(v); S.me.done = v; msg(v ? 'Danke – als abgeschlossen gemeldet.' : 'Meldung zurückgenommen.'); viewStart(); } catch (e) { err(e); } }

  // ---------- Teil-Seite ----------
  function viewPart(id) {
    if (!PART_IDS.includes(id)) return viewStart();
    const part = P(id), idx = PART_IDS.indexOf(id);
    const d = draftOf(id);
    const save = () => LS.set(key(id, 'draft'), d);
    const rerender = () => { const y = window.scrollY; viewPart(id); window.scrollTo(0, y); };
    const mode = part.anon ? (LS.get(key(id, 'mode')) || 'named') : 'named';
    const showFn = LS.get(key(id, 'fn'), false);
    const sent = LS.get(key(id, 'sent'));
    const ro = !S.open;
    const prev = idx > 0 ? el('a', { class: 'btn sec', href: '#teil-' + PART_IDS[idx - 1] }, '← ' + PART_IDS[idx - 1]) : el('span');
    const next = idx < PART_IDS.length - 1 ? el('a', { class: 'btn sec', href: '#teil-' + PART_IDS[idx + 1] }, PART_IDS[idx + 1] + ' →') : el('a', { class: 'btn sec', href: '#start' }, 'Übersicht');

    const modeBox = part.anon ? el('div', { class: 'mode' },
      el('span', { class: 'label', text: 'Abgabe' }),
      el('div', { class: 'seg' },
        el('button', { 'aria-pressed': mode === 'named' ? 'true' : 'false', onclick: () => { LS.set(key(id, 'mode'), 'named'); rerender(); } }, 'Mit Namen'),
        el('button', { 'aria-pressed': mode === 'anon' ? 'true' : 'false', onclick: () => { LS.set(key(id, 'mode'), 'anon'); rerender(); } }, 'Anonym')),
      mode === 'anon' ? el('label', {}, el('input', { type: 'checkbox', checked: showFn, onchange: e => LS.set(key(id, 'fn'), e.target.checked) }), 'Funktion anzeigen (' + (fnLabels().join(', ') || 'in Teil A noch keine gewählt') + ')') : null,
      mode === 'anon' && S.named[id] ? el('span', { class: 'small', text: 'Beim anonymen Absenden wird deine namentliche Fassung dieses Teils gelöscht.' }) : null) : null;

    const head = el('div', { class: 'stack' }, el('h1', { text: 'Teil ' + id + ' – ' + part.t }), el('p', { class: 'note', text: fill(part.d) }),
      ro ? el('div', { class: 'confirm', text: 'Die Frist ist abgelaufen; Eingaben sind nicht mehr möglich.' }) : null);

    if (part.anon && mode === 'anon' && sent && !LS.get(key(id, 'draft'))) {
      shell('teil-' + id, stepsNav(id), head, modeBox,
        el('div', { class: 'locked' }, 'Teil ' + id + ' wurde am ' + dmy(sent) + ' anonym abgeschickt. Er lässt sich nicht mehr ändern. ',
          ro ? null : el('button', { class: 'sec', onclick: () => { LS.set(key(id, 'draft'), {}); rerender(); } }, 'Weiteren anonymen Eintrag erfassen')),
        el('div', { class: 'spread' }, prev, next));
      return;
    }

    const form = el('div', { class: 'card' }, RENDER[id](d, save, rerender));
    if (ro) form.querySelectorAll('input,textarea,select,button').forEach(x => { x.disabled = true; });
    const actions = el('div', { class: 'actions' });
    if (!ro) {
      if (mode === 'named') {
        actions.append(el('button', { onclick: async () => {
          try {
            if (id === 'H') { const r = await API.saveConfidential(d); S.confidential = { data: d, updated: r.updated }; }
            else { const r = await API.saveNamed(id, d); S.named[id] = { data: d, updated: r.updated }; }
            LS.del(key(id, 'draft')); msg('Teil ' + id + ' gespeichert.'); rerender();
          } catch (e) { err(e); }
        } }, id === 'H' ? 'Vertraulich speichern' : 'Mit Namen speichern'));
      } else {
        const confirmBox = el('div', { class: 'confirm', hidden: true },
          el('span', { text: 'Anonym abschicken? Danach lässt sich dieser Eintrag nicht mehr ändern.' }),
          el('button', { onclick: async () => {
            try {
              await API.sendAnon(id, d, LS.get(key(id, 'fn'), false) ? fnLabels().join(', ') : null);
              if (S.named[id]) { await API.deleteNamed(id); delete S.named[id]; }
              LS.set(key(id, 'sent'), new Date().toISOString().slice(0, 10)); LS.del(key(id, 'draft'));
              msg('Teil ' + id + ' anonym abgeschickt.'); rerender();
            } catch (e) { err(e); }
          } }, 'Ja, anonym abschicken'),
          el('button', { class: 'sec', onclick: () => { confirmBox.hidden = true; } }, 'Abbrechen'));
        actions.append(confirmBox, el('button', { onclick: () => { confirmBox.hidden = false; } }, 'Anonym abschicken'));
      }
    }
    shell('teil-' + id, stepsNav(id), head, modeBox, form, el('div', { class: 'spread' }, prev, actions, next));
  }

  // ---------- Formularbausteine ----------
  const ta = (obj, k, save, ph) => el('textarea', { placeholder: ph || '', value: obj[k] || '', oninput: e => { obj[k] = e.target.value; save(); } });
  const tx = (obj, k, save, ph) => el('input', { type: 'text', placeholder: ph || '', value: obj[k] || '', oninput: e => { obj[k] = e.target.value; save(); } });
  const q = (title, ...rest) => el('div', { class: 'q' }, el('div', { class: 'qt', text: title }), ...rest);
  function choice(obj, k, opts, save, rr) {
    return el('div', { class: 'chips' }, vis(opts).map(o => el('button', { class: 'chip', 'aria-pressed': obj[k] === o.id ? 'true' : 'false', onclick: () => { obj[k] = obj[k] === o.id ? '' : o.id; save(); rr(); } }, o.t)));
  }
  function sel(value, opts, onchange) { return el('select', { onchange: e => onchange(e.target.value) }, opts.map(o => el('option', { value: o.id, selected: o.id === value ? true : null }, o.t))); }

  const RENDER = {
    A(d, save, rr) {
      d.funktionen = d.funktionen || [];
      return el('div', { class: 'stack' },
        q(C.a.funktion_frage, el('div', { class: 'qd', text: C.a.funktion_hinweis }),
          el('div', { class: 'chips' }, vis(C.funktionen).map(f => el('button', { class: 'chip', 'aria-pressed': d.funktionen.includes(f.id) ? 'true' : 'false', onclick: () => { d.funktionen = d.funktionen.includes(f.id) ? d.funktionen.filter(x => x !== f.id) : d.funktionen.concat(f.id); save(); rr(); } }, f.t))),
          tx(d, 'andere', save, C.a.andere_ph)),
        q(C.a.teilnahme_frage, choice(d, 'teilnahme', C.a.teilnahme, save, rr)));
    },
    B(d, save, rr) {
      d.felder = d.felder || {};
      return el('div', {}, vis(C.felder).map((fd, i) => {
        const f = d.felder[fd.id] = d.felder[fd.id] || {};
        return el('div', { class: 'q' },
          el('div', { class: 'qt', text: (i + 1) + '  ' + fd.t }), el('div', { class: 'qd', text: fd.d || '' }),
          el('div', { class: 'rate' }, [1, 2, 3, 4, 5, 0].map(v => el('button', { 'aria-pressed': f.r === v ? 'true' : 'false', onclick: () => { f.r = f.r === v ? undefined : v; save(); rr(); } }, v === 0 ? 'k. A.' : String(v)))),
          ta(f, 'k', save, 'Kommentar'));
      }));
    },
    C(d, save, rr) {
      d.marken = d.marken || [];
      const ph = vis(C.phasen);
      return el('div', { class: 'stack' },
        el('details', {}, el('summary', { text: 'Bezugspunkte aus Notion und Fahrtdaten anzeigen' }),
          ph.map(p => [el('div', { class: 'phase', text: p.t }),
            el('ul', { class: 'bez' }, (C.bezugspunkte || []).filter(b => b.p === p.id).map(b => el('li', {}, el('span', { class: 't', text: b.z }), el('span', { text: b.t }))))])),
        d.marken.length ? null : el('p', { class: 'note', text: 'Noch keine Markierung.' }),
        d.marken.map((m, i) => el('div', { class: 'item' },
          sel(m.phase, ph, v => { m.phase = v; save(); }),
          el('div', { class: 'seg' },
            el('button', { 'aria-pressed': m.farbe === 'g' ? 'true' : 'false', onclick: () => { m.farbe = 'g'; save(); rr(); } }, 'grün'),
            el('button', { 'aria-pressed': m.farbe === 'r' ? 'true' : 'false', onclick: () => { m.farbe = 'r'; save(); rr(); } }, 'rot')),
          el('div', { class: 'stack' }, tx(m, 'zeit', save, 'Zeitpunkt (optional, z. B. 30.08. 14:00)'), ta(m, 'text', save, 'Ein Satz: was lief gut oder schlecht?')),
          el('button', { class: 'ghost', title: 'Entfernen', onclick: () => { d.marken.splice(i, 1); save(); rr(); } }, '✕'))),
        el('div', {}, el('button', { class: 'sec', onclick: () => { d.marken.push({ phase: (ph[0] || {}).id, farbe: 'g', zeit: '', text: '' }); save(); rr(); } }, '+ Markierung')));
    },
    D(d, save, rr) {
      d.antw = d.antw || {};
      const fn = fnIds(), sets = vis(C.fragen);
      if (!d.sets) d.sets = sets.filter(s => (s.fn || []).some(f => fn.includes(f))).map(s => s.id);
      return el('div', { class: 'stack' },
        q('Fragenblöcke', el('div', { class: 'qd', text: fn.length ? 'Vorgewählt nach Teil A: ' + fnLabels().join(', ') : 'In Teil A ist noch keine Funktion gewählt – Blöcke hier wählen.' }),
          el('div', { class: 'chips' }, sets.map(s => el('button', { class: 'chip', 'aria-pressed': d.sets.includes(s.id) ? 'true' : 'false', onclick: () => { d.sets = d.sets.includes(s.id) ? d.sets.filter(x => x !== s.id) : d.sets.concat(s.id); save(); rr(); } }, s.t)))),
        sets.filter(s => d.sets.includes(s.id)).map(s => { const a = d.antw[s.id] = d.antw[s.id] || {}; return el('div', { class: 'stack' }, el('h3', { text: s.t }), vis(s.q).map(x => q(x.t, ta(a, x.id, save)))); }));
    },
    E(d, save, rr) {
      d.eintraege = d.eintraege || [];
      const K = vis(C.kategorien), Bq = vis(C.bereiche);
      return el('div', { class: 'stack' },
        d.eintraege.length ? null : el('p', { class: 'note', text: 'Noch kein Eintrag. Je Eintrag ein Gedanke.' }),
        d.eintraege.map((x, i) => el('div', { class: 'item' },
          sel(x.kat, C.kategorien, v => { x.kat = v; save(); }),
          sel(x.bereich, C.bereiche, v => { x.bereich = v; save(); }),
          ta(x, 'text', save, 'Was genau?'),
          el('button', { class: 'ghost', title: 'Entfernen', onclick: () => { d.eintraege.splice(i, 1); save(); rr(); } }, '✕'))),
        el('div', { class: 'row' }, K.map(k => el('button', { class: 'sec', onclick: () => { d.eintraege.push({ kat: k.id, bereich: (Bq[0] || {}).id, text: '' }); save(); rr(); } }, '+ ' + k.t))));
    },
    F(d, save, rr) {
      d.rb = d.rb || {};
      let grp = null;
      return el('div', { class: 'tablewrap' }, el('table', { class: 'grid' },
        el('thead', {}, el('tr', {}, el('th', { text: 'Runbook' }), el('th', { text: 'Genutzt' }), el('th', { text: 'Tauglich' }), el('th', { text: 'Anpassung nötig' }))),
        el('tbody', {}, vis(C.runbooks).map(rb => {
          const r = d.rb[rb.id] = d.rb[rb.id] || {};
          const rows = [];
          if (rb.g !== grp) { grp = rb.g; rows.push(el('tr', {}, el('td', { colspan: '4', class: 'label', text: rb.g }))); }
          rows.push(el('tr', {},
            el('td', { text: rb.t }),
            el('td', {}, el('div', { class: 'seg' }, ['ja', 'nein', '?'].map(v => el('button', { 'aria-pressed': r.g === v ? 'true' : 'false', title: v === '?' ? 'weiss nicht' : v, onclick: () => { r.g = r.g === v ? undefined : v; save(); rr(); } }, v)))),
            el('td', {}, el('div', { class: 'rate' }, [1, 2, 3, 4, 5].map(v => el('button', { 'aria-pressed': r.t === v ? 'true' : 'false', onclick: () => { r.t = r.t === v ? undefined : v; save(); rr(); } }, String(v))))),
            el('td', {}, el('div', { class: 'stack' }, el('label', {}, el('input', { type: 'checkbox', checked: !!r.a, onchange: e => { r.a = e.target.checked; save(); } }), 'ja'), tx(r, 's', save, 'Stichwort')))));
          return rows;
        }))));
    },
    G(d, save) { return el('div', {}, vis(C.g).map(x => q(x.t, ta(d, x.id, save)))); },
    H(d, save, rr) {
      const H = C.h;
      return el('div', {},
        q(H.bereitschaft_frage, choice(d, 'bereitschaft', H.bereitschaft, save, rr)),
        q(H.rolle_frage, tx(d, 'rolle', save)),
        q(H.verf_frage, choice(d, 'verf', H.verf, save, rr), tx(d, 'verf_text', save, H.verf_ph)),
        q(H.trainings_frage, tx(d, 'trainings', save)),
        q(H.voraus_frage, ta(d, 'voraus', save)),
        q(H.anliegen_frage, ta(d, 'anliegen', save)));
    }
  };

  // ---------- Gemeinsam ----------
  async function viewShared() {
    shell('gemeinsam', el('h1', { text: 'Gemeinsamer Bereich' }), el('div', { class: 'card', text: 'Wird geladen …' }));
    let docs = [];
    try { docs = await API.docs(); } catch (e) { err(e); }
    const ed = S.me.editor;   // Admin und Redaktion: Unterlagen hinzufügen und entfernen
    const rmBtn = x => {
      const ok = el('span', { hidden: true },
        el('button', { class: 'danger', onclick: async () => { try { await API.deleteDoc(x.id); msg('Unterlage «' + x.title + '» entfernt.', 'warn'); viewShared(); } catch (e) { err(e); } } }, 'Ja, entfernen'),
        el('button', { class: 'ghost', onclick: () => { ok.hidden = true; } }, 'Abbrechen'));
      return el('span', {}, el('button', { class: 'ghost', onclick: () => { ok.hidden = false; } }, 'entfernen'), ok);
    };
    const nd = { title: '', url: '', body: '' };
    shell('gemeinsam', el('h1', { text: 'Gemeinsamer Bereich' }),
      el('div', { class: 'card stack' }, el('h2', { text: 'Unterlagen' }),
        docs.length ? el('ul', {}, docs.map(x => el('li', {}, x.url ? el('a', { href: x.url, target: '_blank', rel: 'noopener', text: x.title }) : el('b', { text: x.title }), ed ? [' ', rmBtn(x)] : null, x.body ? el('div', { class: 'small', style: 'white-space:pre-wrap', text: x.body }) : null)))
          : el('p', { class: 'note', text: 'Noch keine Unterlagen.' }),
        ed ? el('details', {}, el('summary', { text: '+ Unterlage hinzufügen' }),
          el('div', { class: 'stack', style: 'margin-top:10px' },
            el('div', { class: 'row' }, tx(nd, 'title', () => {}, 'Titel'), tx(nd, 'url', () => {}, 'Link https://… (optional)')),
            ta(nd, 'body', () => {}, 'Text (optional)'),
            el('div', {}, el('button', { class: 'sec', onclick: async () => { try { await API.addDoc(nd); msg('Unterlage «' + nd.title + '» hinzugefügt.'); viewShared(); } catch (e) { err(e); } } }, 'Hinzufügen')),
            el('p', { class: 'note', text: 'Sichtbar für alle Teilnehmenden. Ein Link führt auf eine Seite ausserhalb der App (z. B. Notion, Dropbox); dort gelten deren Zugriffsrechte.' }))) : null),
      el('div', { class: 'card stack' }, el('h2', { text: 'Ablauf 18.12.2026' }),
        el('table', { class: 'grid' }, el('tbody', {}, (C.ablauf || []).map(a => el('tr', {}, el('td', { class: 'mono', text: a.z }), el('td', { text: a.t })))))),
      el('div', { class: 'card stack' }, el('h2', { text: 'Ergebnisse und Live-Ansicht' }), el('p', { class: 'note', text: fill(C.texte.gemeinsam_ergebnisse) })));
  }

  // ---------- Admin ----------
  let A = { list: [], link: null };
  async function viewAdmin() {
    if (!S.me.admin) return viewStart();
    try { A.list = await API.admin.participants(); } catch (e) { err(e); }
    renderAdmin();
  }
  function renderAdmin() {
    const box = A.link ? (() => {
      const p = A.list.find(x => x.id === A.link.id) || { name: '' };
      const link = CFG.appUrl + '#t=' + A.link.token;
      const t = el('textarea', { value: fill(C.texte.whatsapp, { vorname: p.name.split(' ')[0], link }), style: 'min-height:160px' });
      return el('div', { class: 'linkbox' },
        el('b', { text: 'Persönlicher Link für ' + p.name + ' – wird nur jetzt angezeigt' }),
        el('code', { text: link }), t,
        el('div', { class: 'row' },
          el('button', { onclick: () => { window.open('https://wa.me/?text=' + encodeURIComponent(t.value), '_blank', 'noopener'); } }, 'In WhatsApp öffnen'),
          el('button', { class: 'sec', onclick: () => navigator.clipboard.writeText(link).then(() => msg('Link kopiert.')) }, 'Link kopieren'),
          el('button', { class: 'sec', onclick: () => navigator.clipboard.writeText(t.value).then(() => msg('Nachricht kopiert.')) }, 'Nachricht kopieren'),
          el('button', { class: 'ghost', onclick: () => { A.link = null; renderAdmin(); } }, 'Schliessen')),
        el('p', { class: 'note', text: 'Der Text kommt aus «Texte → WhatsApp-Einladung» und lässt sich hier für diese Nachricht anpassen. In WhatsApp wählst du den Kontakt selbst. Ein neuer Link ersetzt den bisherigen.' }));
    })() : null;

    const mkLink = async p => { try { const t = await API.admin.link(p.id); A.link = { id: p.id, token: t }; await viewAdmin(); window.scrollTo(0, 0); } catch (e) { err(e); } };
    const rows = A.list.map(p => {
      const confirm = el('span', { hidden: true },
        el('button', { class: 'danger', onclick: () => mkLink(p) }, 'Ja, neuer Link'),
        el('button', { class: 'ghost', onclick: () => { confirm.hidden = true; } }, 'Abbrechen'));
      return el('tr', {},
        el('td', {}, el('b', { text: p.name }), p.rolle === 'admin' ? el('span', { class: 'badge', text: 'Admin' }) : p.rolle === 'redaktion' ? el('span', { class: 'badge', text: 'Redaktion' }) : null, el('div', { class: 'small muted', text: [p.funktion, p.team].filter(Boolean).join(' · ') })),
        el('td', {}, el('span', { class: 'badge ' + (p.link_state === 'aktiv' ? 'g' : p.link_state === 'widerrufen' ? 'r' : ''), text: p.link_state })),
        el('td', { class: 'mono small', text: (p.named_parts.join(' ') || '–') + (p.confidential ? ' · H' : '') }),
        el('td', {}, p.done ? el('span', { class: 'badge g', text: 'abgeschlossen' }) : el('span', { class: 'muted', text: '–' })),
        el('td', {}, el('div', { class: 'row' },
          p.link_state === 'aktiv'
            ? [el('button', { class: 'sec', onclick: () => { confirm.hidden = false; } }, 'Neuer Link'), confirm,
               el('button', { class: 'ghost', onclick: async () => { try { await API.admin.revoke(p.id); msg('Link von ' + p.name + ' widerrufen.', 'warn'); viewAdmin(); } catch (e) { err(e); } } }, 'Widerrufen')]
            : el('button', { onclick: () => mkLink(p) }, 'Link erstellen'),
          p.rolle === 'admin' ? null : el('button', { class: 'ghost', title: 'Redaktion: Texte, Ablauf und Unterlagen bearbeiten; keine Antworten, keine Links', onclick: async () => {
            try { await API.admin.patchParticipant(p.id, { rolle: p.rolle === 'redaktion' ? 'teilnehmer' : 'redaktion' }); msg(p.name + (p.rolle === 'redaktion' ? ': Redaktion entzogen.' : ': Redaktion erteilt.')); viewAdmin(); } catch (e) { err(e); }
          } }, p.rolle === 'redaktion' ? 'Redaktion entziehen' : 'Redaktion geben'))));
    });

    const nf = { name: '', funktion: '', team: '' };
    const doneN = A.list.filter(p => p.done).length, activeN = A.list.filter(p => p.link_state === 'aktiv').length;
    const dl = el('input', { type: 'datetime-local', value: S.deadline ? toLocalInput(S.deadline) : '' });

    shell('admin', el('h1', { text: 'Admin' }), box,
      el('div', { class: 'card stack' },
        el('div', { class: 'spread' }, el('h2', { text: 'Teilnehmende' }), el('span', { class: 'small muted', text: `${A.list.length} Personen · ${activeN} Links aktiv · ${doneN} abgeschlossen` })),
        el('div', { class: 'tablewrap' }, el('table', { class: 'grid' },
          el('thead', {}, el('tr', {}, ['Name', 'Link', 'Teile mit Namen', 'Hausaufgabe', ''].map(t => el('th', { text: t })))),
          el('tbody', {}, rows))),
        el('p', { class: 'note', text: 'Anonym abgeschickte Teile erscheinen hier nicht – sie sind keiner Person zugeordnet. Redaktion: bearbeitet unter «Texte» alle Texte und den Ablauf sowie die Unterlagen im gemeinsamen Bereich, sieht aber keine Antworten, keine Links und diese Admin-Seite nicht.' }),
        el('div', { class: 'row' }, tx(nf, 'name', () => {}, 'Name'), tx(nf, 'funktion', () => {}, 'Funktion'), tx(nf, 'team', () => {}, 'Team'),
          el('button', { class: 'sec', onclick: async () => { try { await API.admin.addParticipant(nf); msg(nf.name + ' hinzugefügt.'); viewAdmin(); } catch (e) { err(e); } } }, '+ Person'))),
      el('div', { class: 'card stack' }, el('h2', { text: 'Frist' }),
        el('div', { class: 'row' }, dl, el('button', { class: 'sec', onclick: async () => { try { await API.admin.setDeadline(new Date(dl.value).toISOString()); const m = await API.me(); S.deadline = m.deadline; S.open = m.open; msg('Frist geändert.'); renderAdmin(); } catch (e) { err(e); } } }, 'Frist speichern')),
        el('p', { class: 'note', text: 'Anonyme Einträge gibt die API erst nach der Frist heraus.' })),
      el('div', { class: 'card stack' }, el('h2', { text: 'Auswertung (JSON)' }),
        el('div', { class: 'row' },
          el('button', { class: 'sec', onclick: () => dump('gb26debrief_namentlich', API.admin.named) }, 'Teile mit Namen'),
          el('button', { class: 'sec', onclick: () => dump('gb26debrief_teil_H', API.admin.confidential) }, 'Teil H (vertraulich)'),
          el('button', { class: 'sec', disabled: S.open ? true : null, onclick: () => dump('gb26debrief_anonym', API.admin.anon) }, S.open ? 'Anonyme Teile (ab Frist)' : 'Anonyme Teile'),
          el('button', { class: 'sec', onclick: () => dump('gb26debrief_texte', async () => C) }, 'Texte und Fragen')),
        el('p', { class: 'note', text: 'Die Antworten enthalten die Kennungen der Fragen; «Texte und Fragen» liefert dazu den Wortlaut.' })),
      el('div', { class: 'card stack' }, el('h2', { text: 'Unterlagen' }),
        el('p', { class: 'note' }, 'Unterlagen fügen Admin und Redaktion direkt im ', el('a', { href: '#gemeinsam', text: 'gemeinsamen Bereich' }), ' hinzu oder entfernen sie dort.')));
  }
  function toLocalInput(iso) { const d = new Date(iso); const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`; }
  function download(name, obj) {
    const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })), download: name + '_' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(a); a.click(); a.remove();
  }
  async function dump(name, fn) { try { download(name, await fn()); } catch (e) { err(e); } }

  // ---------- Texte (Admin) ----------
  let E = null, dirty = false;
  function viewTexte() {
    if (!S.me.editor) return viewStart();
    if (!E) E = clone(C);
    const ch = () => { dirty = true; const s = document.getElementById('texte-st'); if (s) s.textContent = 'Ungespeicherte Änderungen'; };
    const rr = () => { const y = window.scrollY; const open = [...document.querySelectorAll('details[data-sec]')].filter(x => x.open).map(x => x.dataset.sec); viewTexte(); document.querySelectorAll('details[data-sec]').forEach(x => { if (open.includes(x.dataset.sec)) x.open = true; }); window.scrollTo(0, y); };
    const fT = (obj, k, lbl, area, hint) => el('div', { class: 'q' }, el('div', { class: 'qt', text: lbl }), hint ? el('div', { class: 'qd', text: hint }) : null,
      area ? el('textarea', { value: obj[k] || '', style: area === 'big' ? 'min-height:150px' : null, oninput: e => { obj[k] = e.target.value; ch(); } })
           : el('input', { type: 'text', value: obj[k] || '', style: 'width:100%', oninput: e => { obj[k] = e.target.value; ch(); } }));
    // Liste mit Einträgen: Felder je Eintrag, Reihenfolge, Ausblenden (Antworten bleiben) oder Entfernen (ohne Antworten)
    function items(arr, fields, opt) {
      opt = opt || {};
      return el('div', { class: 'stack' },
        arr.map((it, i) => el('div', { class: 'item', style: 'grid-template-columns:1fr auto' + (it.aus ? ';opacity:.55' : '') },
          el('div', { class: 'stack' }, fields.map(f => f.sel
            ? el('label', { class: 'small' }, f.l + ' ', el('select', { onchange: e => { it[f.k] = e.target.value; ch(); } }, f.sel().map(o => el('option', { value: o.id, selected: o.id === it[f.k] ? true : null }, o.t))))
            : f.chips
              ? el('div', { class: 'stack' }, el('span', { class: 'small muted', text: f.l }), el('div', { class: 'chips' }, f.chips().map(o => el('button', { class: 'chip', 'aria-pressed': (it[f.k] || []).includes(o.id) ? 'true' : 'false', onclick: () => { const s = it[f.k] || []; it[f.k] = s.includes(o.id) ? s.filter(x => x !== o.id) : s.concat(o.id); ch(); rr(); } }, o.t))))
              : f.area
                ? el('textarea', { placeholder: f.l, value: it[f.k] || '', style: 'min-height:48px', oninput: e => { it[f.k] = e.target.value; ch(); } })
                : el('input', { type: 'text', placeholder: f.l, value: it[f.k] || '', style: f.w ? 'width:' + f.w : 'width:100%', oninput: e => { it[f.k] = e.target.value; ch(); } })),
            opt.sub ? opt.sub(it) : null,
            it.id && opt.showId !== false ? el('span', { class: 'small muted mono', text: 'Kennung ' + it.id + (it.aus ? ' · ausgeblendet' : '') }) : null),
          el('div', { class: 'stack' },
            el('button', { class: 'ghost', title: 'nach oben', disabled: i === 0 ? true : null, onclick: () => { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); ch(); rr(); } }, '↑'),
            el('button', { class: 'ghost', title: 'nach unten', disabled: i === arr.length - 1 ? true : null, onclick: () => { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); ch(); rr(); } }, '↓'),
            opt.remove
              ? el('button', { class: 'ghost', title: 'Entfernen', onclick: () => { arr.splice(i, 1); ch(); rr(); } }, '✕')
              : el('button', { class: 'ghost', title: it.aus ? 'Einblenden' : 'Ausblenden (Antworten bleiben erhalten)', onclick: () => { it.aus = !it.aus; if (!it.aus) delete it.aus; ch(); rr(); } }, it.aus ? 'einblenden' : 'ausblenden')))),
        opt.add ? el('div', {}, el('button', { class: 'sec', onclick: () => { arr.push(opt.add()); ch(); rr(); } }, '+ Eintrag')) : null);
    }
    const nid = p => p + Math.random().toString(36).slice(2, 7);
    const reset = k => el('button', { class: 'ghost', onclick: e => { e.preventDefault(); E[k] = clone(DEF[k]); ch(); rr(); } }, 'Standard');
    let n = 0;
    const sec = (title, resetBtn, ...body) => el('details', { class: 'card', 'data-sec': String(n++) }, el('summary', {}, el('b', { text: title }), ' ', resetBtn || null), el('div', { class: 'stack', style: 'margin-top:10px' }, ...body));

    const bar = el('div', { class: 'card spread', style: 'position:sticky;top:0;z-index:5' },
      el('div', { class: 'stack' }, el('b', { text: 'Texte bearbeiten' }), el('span', { id: 'texte-st', class: 'small muted', text: dirty ? 'Ungespeicherte Änderungen' : 'Gespeicherter Stand' }),
        TM ? el('span', { class: 'small muted', text: 'Zuletzt gespeichert: ' + TM.by + ', ' + whenText(TM.at) }) : null),
      el('div', { class: 'row' },
        el('button', { onclick: saveTexte }, 'Speichern'),
        el('button', { class: 'sec', onclick: () => { E = clone(C); dirty = false; rr(); } }, 'Verwerfen'),
        el('button', { class: 'sec', onclick: () => download('gb26debrief_texte', E) }, 'Export'),
        el('label', { class: 'btn sec' }, 'Import', el('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async e => { try { const f = e.target.files[0]; E = merge(DEF, JSON.parse(await f.text())); dirty = true; msg('Import geladen – mit «Speichern» übernehmen.', 'warn'); rr(); } catch (x) { err(x); } } })),
        el('button', { class: 'ghost', onclick: () => { E = clone(DEF); dirty = true; msg('Alle Texte auf Standard gesetzt – mit «Speichern» übernehmen.', 'warn'); rr(); } }, 'Alles auf Standard')));

    async function saveTexte() {
      try {
        const ov = diff(DEF, E);
        const r = await API.saveTexts(Object.keys(ov).length ? ov : null, TM && TM.v);
        TM = r.meta; C = merge(DEF, ov); E = clone(C); dirty = false;
        msg('Texte gespeichert – gelten ab sofort für alle.'); rr();
      } catch (e) {
        if (e.status !== 409) return err(e);
        try {   // jemand anders hat inzwischen gespeichert: eigene Änderungen auf dessen Stand übertragen
          const t = await API.texts(); const theirs = merge(DEF, t.content);
          E = rebase(C, E, theirs); C = theirs; TM = t.meta; dirty = true;
          msg(e.message + ' Deine Änderungen sind auf diesen Stand übertragen; wo ihr beide denselben Text oder dieselbe Liste geändert habt, steht jetzt deine Fassung. Bitte prüfen und nochmals speichern.', 'warn'); rr();
        } catch (x) { err(x); }
      }
    }
    const T = E.texte;
    shell('texte', bar,
      el('p', { class: 'note', text: 'Admin und Redaktion bearbeiten dieselben Texte; wer später speichert, bekommt den neueren Stand angezeigt und speichert dann nochmals. Platzhalter: {vorname}, {frist}, {link}. Antworten hängen an der Kennung eines Eintrags, nicht am Wortlaut: Texte dürfen frei geändert werden. Einträge mit möglichen Antworten werden ausgeblendet statt gelöscht; die Antworten bleiben erhalten. «Standard» stellt einen Abschnitt wieder her; wirksam wird alles erst mit «Speichern».' }),
      sec('Startseite und Allgemein', reset('texte'),
        fT(T, 'termin', 'Termin'), fT(T, 'start_titel', 'Begrüssung'), fT(T, 'start_ziel', 'Ziel', true), fT(T, 'start_frist', 'Hinweis zur Frist', true),
        fT(T, 'anon_titel', 'Titel Anonymität'), fT(T, 'anon_regeln', 'Regeln zur Anonymität', 'big', 'Eine Regel pro Zeile.'),
        fT(T, 'gemeinsam_ergebnisse', 'Gemeinsamer Bereich: Hinweis zu Ergebnissen und Live-Ansicht', true),
        fT(T, 'gate_text', 'Zugangsseite ohne Link'), fT(T, 'gate_hinweis', 'Zugangsseite: Hinweis', true)),
      sec('WhatsApp-Einladung', null, fT(T, 'whatsapp', 'Vorlage', 'big', 'Platzhalter {vorname} und {link} werden beim Erstellen des Links ersetzt.'),
        el('div', {}, el('button', { class: 'ghost', onclick: () => { T.whatsapp = DEF.texte.whatsapp; ch(); rr(); } }, 'Standard'))),
      sec('Teile A–H: Titel und Beschreibung', reset('teile'), PART_IDS.map(id => el('div', { class: 'stack' }, el('span', { class: 'label', text: 'Teil ' + id }), fT(E.teile[id], 't', 'Titel'), fT(E.teile[id], 'd', 'Beschreibung', true)))),
      sec('Teil A: Funktionen und Teilnahme', null,
        fT(E.a, 'funktion_frage', 'Frage Funktion'), fT(E.a, 'funktion_hinweis', 'Hinweis'), fT(E.a, 'andere_ph', 'Feld «andere Funktion»'),
        el('div', { class: 'row' }, el('b', { text: 'Funktionen' }), reset('funktionen')),
        items(E.funktionen, [{ k: 't', l: 'Funktion' }], { add: () => ({ id: nid('f_'), t: '' }) }),
        fT(E.a, 'teilnahme_frage', 'Frage Teilnahme'),
        items(E.a.teilnahme, [{ k: 't', l: 'Antwort' }], { add: () => ({ id: nid('t_'), t: '' }) }),
        el('div', { class: 'row' }, el('span', { class: 'small muted', text: 'Fragen und Antworten von Teil A' }), reset('a'))),
      sec('Teil B: Themenfelder', reset('felder'), items(E.felder, [{ k: 't', l: 'Themenfeld' }, { k: 'd', l: 'Beschreibung', area: true }], { add: () => ({ id: nid('b_'), t: '', d: '' }) })),
      sec('Teil C: Phasen und Bezugspunkte', null,
        el('div', { class: 'row' }, el('b', { text: 'Phasen' }), reset('phasen')),
        items(E.phasen, [{ k: 't', l: 'Phase' }], { add: () => ({ id: nid('p_'), t: '' }) }),
        el('div', { class: 'row' }, el('b', { text: 'Bezugspunkte' }), reset('bezugspunkte')),
        items(E.bezugspunkte, [{ k: 'p', l: 'Phase', sel: () => E.phasen }, { k: 'z', l: 'Zeit', w: '160px' }, { k: 't', l: 'Text' }], { remove: true, showId: false, add: () => ({ p: (E.phasen[0] || {}).id, z: '', t: '' }) })),
      sec('Teil D: Fragenblöcke', reset('fragen'),
        items(E.fragen, [{ k: 't', l: 'Titel des Blocks' }, { k: 'fn', l: 'Vorgewählt für die Funktionen', chips: () => vis(E.funktionen) }], {
          add: () => ({ id: nid('d_'), t: '', fn: [], q: [] }),
          sub: it => el('div', { class: 'stack', style: 'padding-left:12px;border-left:3px solid var(--hair)' }, el('span', { class: 'small muted', text: 'Fragen' }),
            items(it.q = it.q || [], [{ k: 't', l: 'Frage', area: true }], { add: () => ({ id: nid(it.id + '_'), t: '' }) }))
        })),
      sec('Teil E: Kategorien und Bereiche', null,
        el('div', { class: 'row' }, el('b', { text: 'Kategorien' }), reset('kategorien')), items(E.kategorien, [{ k: 't', l: 'Kategorie' }], { add: () => ({ id: nid('k_'), t: '' }) }),
        el('div', { class: 'row' }, el('b', { text: 'Bereiche' }), reset('bereiche')), items(E.bereiche, [{ k: 't', l: 'Bereich' }], { add: () => ({ id: nid('r_'), t: '' }) })),
      sec('Teil F: Runbooks', reset('runbooks'), items(E.runbooks, [{ k: 'g', l: 'Abschnitt' }, { k: 't', l: 'Runbook' }], { add: () => ({ id: nid('rb_'), g: '', t: '' }) })),
      sec('Teil G: Fragen', reset('g'), items(E.g, [{ k: 't', l: 'Frage', area: true }], { add: () => ({ id: nid('g_'), t: '' }) })),
      sec('Teil H: Fragen und Antworten', reset('h'),
        fT(E.h, 'bereitschaft_frage', 'Frage Bereitschaft'), items(E.h.bereitschaft, [{ k: 't', l: 'Antwort' }], { add: () => ({ id: nid('h_'), t: '' }) }),
        fT(E.h, 'rolle_frage', 'Frage Wunschrolle'),
        fT(E.h, 'verf_frage', 'Frage Verfügbarkeit'), items(E.h.verf, [{ k: 't', l: 'Antwort' }], { add: () => ({ id: nid('v_'), t: '' }) }), fT(E.h, 'verf_ph', 'Feld Ergänzung'),
        fT(E.h, 'trainings_frage', 'Frage Trainings'), fT(E.h, 'voraus_frage', 'Frage Voraussetzungen'), fT(E.h, 'anliegen_frage', 'Frage Anliegen')),
      sec('Gemeinsam: Ablauf 18.12.', reset('ablauf'), items(E.ablauf, [{ k: 'z', l: 'Zeit', w: '120px' }, { k: 't', l: 'Programmpunkt' }], { remove: true, showId: false, add: () => ({ z: '', t: '' }) })));
  }

  // ---------- Zugang und Routen ----------
  function gate(text) {
    app.replaceChildren(el('main', {}, el('div', { class: 'card stack gate' },
      el('div', { class: 'logo' }, el('img', { src: './img/logo.png', alt: 'Wicki Partners Ballonteam' })),
      el('h1', { text: 'Debriefing GB26' }),
      el('p', { text: text }),
      el('p', { class: 'note', text: C.texte.gate_hinweis }))));
  }
  function route() {
    if (!S.me) return;
    const h = (location.hash || '#start').slice(1);
    if (h.startsWith('teil-')) return viewPart(h.slice(5).toUpperCase());
    if (h === 'gemeinsam') return viewShared();
    if (h === 'admin') return viewAdmin();
    if (h === 'texte') return viewTexte();
    return viewStart();
  }
  async function boot() {
    const m = location.hash.match(/^#t=([A-Za-z0-9_-]{20,100})$/);
    if (m) { API.setToken(m[1]); history.replaceState(null, '', location.pathname + '#start'); }
    if (!API.token) return gate(C.texte.gate_text);
    try {
      const [j, tx] = await Promise.all([API.me(), API.texts().catch(() => null)]);
      S = { me: j.me, deadline: j.deadline, open: j.open, named: j.named || {}, confidential: j.confidential };
      S.me.editor = !!(S.me.editor || S.me.admin);
      C = merge(DEF, tx && tx.content); TM = (tx && tx.meta) || null; E = null;
    } catch (e) {
      if (e.status === 401) { API.setToken(null); return gate(e.message); }
      return gate('Die App ist im Moment nicht erreichbar: ' + e.message);
    }
    route();
  }
  window.addEventListener('hashchange', () => {
    if (/^#t=/.test(location.hash)) return boot();       // Link in einem offenen Tab eingefügt
    if (S.me) { route(); window.scrollTo(0, 0); }
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  boot();
})();
