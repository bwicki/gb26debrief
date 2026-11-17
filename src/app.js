/* gb26debrief.wicki.aero – Oberfläche. Seiten: #start, #teil-A … #teil-H, #gemeinsam, #admin.
   Entwürfe bleiben im Browser (localStorage, je Person), bis sie gespeichert oder anonym abgeschickt sind. */
(function () {
  'use strict';
  const C = window.GB26, CFG = window.GB26CONFIG, API = window.GB26API;
  const app = document.getElementById('app');
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
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* voll */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* egal */ } }
  };
  const key = (part, what) => `gb26.${S.me.id}.${part}.${what}`;
  const dmy = iso => iso ? iso.slice(0, 10).split('-').reverse().join('.') : '';
  const deadlineText = () => S.deadline ? new Date(S.deadline).toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const vorname = () => (S.me && S.me.name || '').split(' ')[0];

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
  const PARTS = [
    { id: 'A', t: 'Person & Funktion', anon: false, d: 'Deine Funktion(en) am GB26 und deine Teilnahme am 18.12.' },
    { id: 'B', t: 'Gesamtteam', anon: true, d: 'Bewertung 1–5 je Themenfeld mit Kommentar. 1 = ungenügend, 5 = sehr gut, «k. A.» = kann ich nicht beurteilen.' },
    { id: 'C', t: 'Zeitstrahl', anon: true, d: 'Markiere Momente, in denen es aus deiner Sicht gut (grün) oder schlecht (rot) lief – je mit einem Satz.' },
    { id: 'D', t: 'Fachbereich', anon: true, d: 'Fragen zu deiner Funktion. Die Fragenblöcke richten sich nach Teil A; du kannst weitere Blöcke dazunehmen.' },
    { id: 'E', t: 'Retrospektive', anon: true, d: 'Einträge wie im Retrospektive-Board des Command Centers. Rückmeldungen über die Bereichsgrenzen sind ausdrücklich erwünscht.' },
    { id: 'F', t: 'Runbooks', anon: true, d: 'Je Runbook aus Notion: genutzt, tauglich, Anpassung nötig.' },
    { id: 'G', t: 'Ausblick GB27', anon: true, d: 'GB27 in Münster, 09.–18.09.2027.' },
    { id: 'H', t: 'Vertraulich', anon: false, d: 'Nur für Balthasar Wicki sichtbar und mit den Teilen B–G nicht verknüpft.' }
  ];
  const partById = id => PARTS.find(p => p.id === id);

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
    if (id === 'H') return S.confidential ? JSON.parse(JSON.stringify(S.confidential.data)) : {};
    return S.named[id] ? JSON.parse(JSON.stringify(S.named[id].data)) : {};
  }
  function funktionen() { const a = draftOf('A'); return [].concat(a.funktionen || [], a.andere ? [a.andere] : []); }

  // ---------- Rahmen ----------
  function shell(active, ...content) {
    const nav = [['start', 'Start'], ['teil-A', 'Hausaufgabe'], ['gemeinsam', 'Gemeinsam']];
    if (S.me.admin) nav.push(['admin', 'Admin']);
    app.replaceChildren(
      el('header', { class: 'top' },
        el('div', { class: 'brand' }, el('strong', { text: 'Debriefing GB26' }), el('span', { class: 'sub', text: 'Team SUI-2 · Hausaufgabe und gemeinsamer Bereich' })),
        el('nav', { class: 'main' }, nav.map(([h, t]) => el('a', { href: '#' + h, 'aria-current': (active === h || (h === 'teil-A' && active.startsWith('teil-'))) ? 'page' : null, text: t }))),
        el('div', { class: 'top-right' },
          el('div', { class: 'who' }, S.me.name, el('br'), el('span', { class: 'small', text: S.open ? 'Frist ' + deadlineText() : 'Frist abgelaufen' })),
          el('div', { class: 'logo' }, el('img', { src: './img/logo.png', alt: 'Wicki Partners Ballonteam' }), el('span', { class: 'ver', text: 'v' + CFG.version })))),
      el('main', {}, ...content));
  }

  // ---------- Start ----------
  function viewStart() {
    const steps = el('div', { class: 'steps' }, PARTS.map(p => { const [c, st] = partStatus(p.id); return el('a', { href: '#teil-' + p.id, class: c }, el('b', { text: p.id }), el('span', { text: p.t }), el('span', { class: 'st', text: st })); }));
    shell('start',
      el('h1', { text: 'Willkommen, ' + vorname() }),
      el('div', { class: 'card stack' },
        el('h2', { text: 'Debriefing Gordon Bennett 2026' }),
        el('p', { text: C.termin }),
        el('p', {}, 'Ziel: festhalten, was sich bewährt hat; benennen, wo Lücken waren; Massnahmen für den GB27 in Münster (09.–18.09.2027) festlegen. Die Inhalte erfassen wir vorher schriftlich, am Termin wird eingeordnet, priorisiert und entschieden.'),
        el('p', {}, el('b', { text: 'Hausaufgabe: 45–60 Minuten, bis ' + deadlineText() + '.' }), ' Entwürfe bleiben in diesem Browser gespeichert, bis du sie speicherst oder abschickst.')),
      el('div', { class: 'card stack' },
        el('h2', { text: 'Hausaufgabe' }), steps,
        el('div', { class: 'row' },
          el('a', { class: 'btn', href: '#teil-' + nextOpenPart() }, 'Weiterarbeiten'),
          S.me.done
            ? el('button', { class: 'sec', onclick: () => setDone(false) }, '✓ Als abgeschlossen gemeldet – rückgängig')
            : el('button', { class: 'sec', onclick: () => setDone(true) }, 'Hausaufgabe als abgeschlossen melden'))),
      el('div', { class: 'card stack' },
        el('h2', { text: 'Mit Namen oder anonym' }),
        el('ul', {},
          el('li', { text: 'Für jeden der Teile B–G wählst du, ob du ihn mit Namen oder anonym abgibst. Teil A gehört zu deiner Person, Teil H ist vertraulich und nur für Balthasar Wicki sichtbar.' }),
          el('li', { text: 'Anonyme Einträge werden ohne Name, ohne Kennung, ohne IP-Adresse und ohne Zeitstempel gespeichert und erst nach der Frist angezeigt – auch dem Admin.' }),
          el('li', { text: 'Ein anonym abgeschickter Teil lässt sich nicht mehr ändern, weil dafür eine Verbindung zu dir nötig wäre. Teile mit Namen kannst du bis zur Frist ändern.' }),
          el('li', { text: 'Bei anonymen Einträgen entscheidest du, ob deine Funktion angezeigt wird. Bei Funktionen mit wenigen Personen macht die Funktion dich erkennbar; auch Freitext kann Rückschlüsse erlauben.' }),
          el('li', {}, 'Der Quellcode ist einsehbar: ', el('a', { href: 'https://github.com/bwicki/gb26debrief', target: '_blank', rel: 'noopener', text: 'github.com/bwicki/gb26debrief' }), '.'))));
  }
  function nextOpenPart() { const p = PARTS.find(x => partStatus(x.id)[0] !== 'ok'); return p ? p.id : 'A'; }
  async function setDone(v) { try { await API.setDone(v); S.me.done = v; msg(v ? 'Danke – als abgeschlossen gemeldet.' : 'Meldung zurückgenommen.'); viewStart(); } catch (e) { err(e); } }

  // ---------- Teil-Seite ----------
  function viewPart(id) {
    const P = partById(id); if (!P) return viewStart();
    const idx = PARTS.indexOf(P);
    let d = draftOf(id);
    const save = () => LS.set(key(id, 'draft'), d);
    const rerender = () => { const y = window.scrollY; viewPart(id); window.scrollTo(0, y); };
    const mode = P.anon ? (LS.get(key(id, 'mode')) || 'named') : 'named';
    const showFn = LS.get(key(id, 'fn'), false);
    const sent = LS.get(key(id, 'sent'));
    const ro = !S.open;

    const steps = el('div', { class: 'steps' }, PARTS.map(p => { const [c, st] = partStatus(p.id); return el('a', { href: '#teil-' + p.id, class: c, 'aria-current': p.id === id ? 'page' : null }, el('b', { text: p.id }), el('span', { text: p.t }), el('span', { class: 'st', text: st })); }));

    const modeBox = P.anon ? el('div', { class: 'mode' },
      el('span', { class: 'label', text: 'Abgabe' }),
      el('div', { class: 'seg' },
        el('button', { 'aria-pressed': mode === 'named' ? 'true' : 'false', onclick: () => { LS.set(key(id, 'mode'), 'named'); rerender(); } }, 'Mit Namen'),
        el('button', { 'aria-pressed': mode === 'anon' ? 'true' : 'false', onclick: () => { LS.set(key(id, 'mode'), 'anon'); rerender(); } }, 'Anonym')),
      mode === 'anon' ? el('label', {}, el('input', { type: 'checkbox', checked: showFn, onchange: e => LS.set(key(id, 'fn'), e.target.checked) }), 'Funktion anzeigen (' + (funktionen().join(', ') || 'in Teil A noch keine gewählt') + ')') : null,
      mode === 'anon' && S.named[id] ? el('span', { class: 'small', text: 'Beim anonymen Absenden wird deine namentliche Fassung dieses Teils gelöscht.' }) : null) : null;

    const form = el('div', { class: 'card' }, RENDER[id](d, save, rerender));
    if (ro) form.querySelectorAll('input,textarea,select,button').forEach(x => { x.disabled = true; });

    const actions = el('div', { class: 'actions' });
    const nav = el('div', { class: 'spread' },
      idx > 0 ? el('a', { class: 'btn sec', href: '#teil-' + PARTS[idx - 1].id }, '← ' + PARTS[idx - 1].id) : el('span'),
      actions,
      idx < PARTS.length - 1 ? el('a', { class: 'btn sec', href: '#teil-' + PARTS[idx + 1].id }, PARTS[idx + 1].id + ' →') : el('a', { class: 'btn sec', href: '#start' }, 'Übersicht'));

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
              await API.sendAnon(id, d, LS.get(key(id, 'fn'), false) ? funktionen().join(', ') : null);
              if (S.named[id]) { await API.deleteNamed(id); delete S.named[id]; }
              LS.set(key(id, 'sent'), new Date().toISOString().slice(0, 10)); LS.del(key(id, 'draft'));
              msg('Teil ' + id + ' anonym abgeschickt.'); rerender();
            } catch (e) { err(e); }
          } }, 'Ja, anonym abschicken'),
          el('button', { class: 'sec', onclick: () => { confirmBox.hidden = true; } }, 'Abbrechen'));
        actions.append(confirmBox, el('button', { onclick: () => { confirmBox.hidden = false; } }, 'Anonym abschicken'));
      }
    }

    const head = el('div', { class: 'stack' }, el('h1', { text: 'Teil ' + id + ' – ' + P.t }), el('p', { class: 'note', text: P.d }),
      ro ? el('div', { class: 'confirm', text: 'Die Frist ist abgelaufen; Eingaben sind nicht mehr möglich.' }) : null);

    if (P.anon && mode === 'anon' && sent && !LS.get(key(id, 'draft'))) {
      shell('teil-' + id, steps, head, modeBox,
        el('div', { class: 'locked' }, 'Teil ' + id + ' wurde am ' + dmy(sent) + ' anonym abgeschickt. Er lässt sich nicht mehr ändern. ',
          ro ? null : el('button', { class: 'sec', onclick: () => { LS.set(key(id, 'draft'), {}); rerender(); } }, 'Weiteren anonymen Eintrag erfassen')),
        el('div', { class: 'spread' }, idx > 0 ? el('a', { class: 'btn sec', href: '#teil-' + PARTS[idx - 1].id }, '← ' + PARTS[idx - 1].id) : el('span'),
          idx < PARTS.length - 1 ? el('a', { class: 'btn sec', href: '#teil-' + PARTS[idx + 1].id }, PARTS[idx + 1].id + ' →') : el('a', { class: 'btn sec', href: '#start' }, 'Übersicht')));
      return;
    }
    shell('teil-' + id, steps, head, modeBox, form, nav);
  }

  // ---------- Formularbausteine ----------
  const ta = (obj, k, save, ph) => el('textarea', { placeholder: ph || '', value: obj[k] || '', oninput: e => { obj[k] = e.target.value; save(); } });
  const tx = (obj, k, save, ph) => el('input', { type: 'text', placeholder: ph || '', value: obj[k] || '', oninput: e => { obj[k] = e.target.value; save(); } });
  function radios(obj, k, opts, save, rerender) {
    return el('div', { class: 'chips' }, opts.map(o => el('button', { class: 'chip', 'aria-pressed': obj[k] === o ? 'true' : 'false', onclick: () => { obj[k] = obj[k] === o ? '' : o; save(); rerender(); } }, o)));
  }
  function sel(value, opts, onchange) { return el('select', { onchange: e => onchange(e.target.value) }, opts.map(o => el('option', { value: o, selected: o === value ? true : null }, o))); }

  const RENDER = {
    A(d, save, rr) {
      d.funktionen = d.funktionen || [];
      return el('div', { class: 'stack' },
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Funktion(en) am GB26' }),
          el('div', { class: 'qd', text: 'Nach den Rollen in Notion; Mehrfachwahl möglich.' }),
          el('div', { class: 'chips' }, C.funktionen.map(f => el('button', { class: 'chip', 'aria-pressed': d.funktionen.includes(f) ? 'true' : 'false', onclick: () => { d.funktionen = d.funktionen.includes(f) ? d.funktionen.filter(x => x !== f) : d.funktionen.concat(f); save(); rr(); } }, f))),
          tx(d, 'andere', save, 'Andere Funktion (optional)')),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Teilnahme am 18.12.2026' }),
          radios(d, 'teilnahme', ['vor Ort in Bern', 'remote über Zoom', 'kann nicht teilnehmen'], save, rr)));
    },
    B(d, save, rr) {
      d.felder = d.felder || {};
      return el('div', {}, C.felder.map(([n, t, desc]) => {
        const f = d.felder[n] = d.felder[n] || {};
        return el('div', { class: 'q' },
          el('div', { class: 'qt', text: n + '  ' + t }), el('div', { class: 'qd', text: desc }),
          el('div', { class: 'rate' }, [1, 2, 3, 4, 5, 0].map(v => el('button', { 'aria-pressed': f.r === v ? 'true' : 'false', onclick: () => { f.r = f.r === v ? undefined : v; save(); rr(); } }, v === 0 ? 'k. A.' : String(v)))),
          ta(f, 'k', save, 'Kommentar'));
      }));
    },
    C(d, save, rr) {
      d.marken = d.marken || [];
      const phases = C.phasen.map(p => p[1]);
      const pname = id => (C.phasen.find(p => p[0] === id) || [, id])[1];
      return el('div', { class: 'stack' },
        el('details', {}, el('summary', { text: 'Bezugspunkte aus Notion und Fahrtdaten anzeigen' }),
          C.phasen.map(([pid, pt]) => [el('div', { class: 'phase', text: pt }),
            el('ul', { class: 'bez' }, C.bezugspunkte.filter(b => b[0] === pid).map(b => el('li', {}, el('span', { class: 't', text: b[1] }), el('span', { text: b[2] }))))])),
        d.marken.length ? null : el('p', { class: 'note', text: 'Noch keine Markierung.' }),
        d.marken.map((m, i) => el('div', { class: 'item' },
          sel(pname(m.phase) || phases[0], phases, v => { m.phase = C.phasen.find(p => p[1] === v)[0]; save(); }),
          el('div', { class: 'seg' },
            el('button', { 'aria-pressed': m.farbe === 'g' ? 'true' : 'false', onclick: () => { m.farbe = 'g'; save(); rr(); } }, 'grün'),
            el('button', { 'aria-pressed': m.farbe === 'r' ? 'true' : 'false', onclick: () => { m.farbe = 'r'; save(); rr(); } }, 'rot')),
          el('div', { class: 'stack' }, tx(m, 'zeit', save, 'Zeitpunkt (optional, z. B. 30.08. 14:00)'), ta(m, 'text', save, 'Ein Satz: was lief gut oder schlecht?')),
          el('button', { class: 'ghost', title: 'Entfernen', onclick: () => { d.marken.splice(i, 1); save(); rr(); } }, '✕'))),
        el('div', {}, el('button', { class: 'sec', onclick: () => { d.marken.push({ phase: C.phasen[0][0], farbe: 'g', zeit: '', text: '' }); save(); rr(); } }, '+ Markierung')));
    },
    D(d, save, rr) {
      d.antw = d.antw || {};
      const fn = funktionen();
      const auto = Object.keys(C.fragen).filter(k => C.fragen[k].fn.some(f => fn.includes(f)));
      d.sets = d.sets || auto;
      const active = Object.keys(C.fragen).filter(k => d.sets.includes(k));
      return el('div', { class: 'stack' },
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Fragenblöcke' }),
          el('div', { class: 'qd', text: fn.length ? 'Vorgewählt nach Teil A: ' + fn.join(', ') : 'In Teil A ist noch keine Funktion gewählt – Blöcke hier wählen.' }),
          el('div', { class: 'chips' }, Object.entries(C.fragen).map(([k, s]) => el('button', { class: 'chip', 'aria-pressed': d.sets.includes(k) ? 'true' : 'false', onclick: () => { d.sets = d.sets.includes(k) ? d.sets.filter(x => x !== k) : d.sets.concat(k); save(); rr(); } }, s.titel)))),
        active.map(k => { const a = d.antw[k] = d.antw[k] || {}; return el('div', { class: 'stack' }, el('h3', { text: C.fragen[k].titel }), C.fragen[k].q.map((q, i) => el('div', { class: 'q' }, el('div', { class: 'qt', text: q }), ta(a, String(i), save)))); }));
    },
    E(d, save, rr) {
      d.eintraege = d.eintraege || [];
      return el('div', { class: 'stack' },
        d.eintraege.length ? null : el('p', { class: 'note', text: 'Noch kein Eintrag. Je Eintrag ein Gedanke.' }),
        d.eintraege.map((x, i) => el('div', { class: 'item' },
          sel(x.kat, C.kategorien, v => { x.kat = v; save(); }),
          sel(x.bereich, C.bereiche, v => { x.bereich = v; save(); }),
          ta(x, 'text', save, 'Was genau?'),
          el('button', { class: 'ghost', title: 'Entfernen', onclick: () => { d.eintraege.splice(i, 1); save(); rr(); } }, '✕'))),
        el('div', { class: 'row' }, C.kategorien.map(k => el('button', { class: 'sec', onclick: () => { d.eintraege.push({ kat: k, bereich: C.bereiche[0], text: '' }); save(); rr(); } }, '+ ' + k))));
    },
    F(d, save, rr) {
      d.rb = d.rb || {};
      let grp = '';
      return el('div', { class: 'tablewrap' }, el('table', { class: 'grid' },
        el('thead', {}, el('tr', {}, el('th', { text: 'Runbook' }), el('th', { text: 'Genutzt' }), el('th', { text: 'Tauglich' }), el('th', { text: 'Anpassung nötig' }))),
        el('tbody', {}, C.runbooks.map(([g, n]) => {
          const r = d.rb[n] = d.rb[n] || {};
          const rows = [];
          if (g !== grp) { grp = g; rows.push(el('tr', {}, el('td', { colspan: '4', class: 'label', text: g.length === 1 ? 'Abschnitt ' + g : g }))); }
          rows.push(el('tr', {},
            el('td', { text: n }),
            el('td', {}, el('div', { class: 'seg' }, ['ja', 'nein', '?'].map(v => el('button', { 'aria-pressed': r.g === v ? 'true' : 'false', title: v === '?' ? 'weiss nicht' : v, onclick: () => { r.g = r.g === v ? undefined : v; save(); rr(); } }, v)))),
            el('td', {}, el('div', { class: 'rate' }, [1, 2, 3, 4, 5].map(v => el('button', { 'aria-pressed': r.t === v ? 'true' : 'false', onclick: () => { r.t = r.t === v ? undefined : v; save(); rr(); } }, String(v))))),
            el('td', {}, el('div', { class: 'stack' }, el('label', {}, el('input', { type: 'checkbox', checked: !!r.a, onchange: e => { r.a = e.target.checked; save(); } }), 'ja'), tx(r, 's', save, 'Stichwort')))));
          return rows;
        }))));
    },
    G(d, save) {
      const q = (k, t, ph) => el('div', { class: 'q' }, el('div', { class: 'qt', text: t }), ta(d, k, save, ph));
      return el('div', {},
        q('premortem', 'Pre-Mortem: «Herbst 2027, das Ziel ist verfehlt – woran lag es im Team?»'),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Ideen zur Stärkung unserer Ressourcen' }), el('div', { class: 'qd', text: 'Was könnten wir zusätzlich tun? Auch Ungewöhnliches.' })),
        q('personen', 'Personen: wen oder welche Fähigkeiten sollten wir ins Team holen?'),
        q('partner', 'Partner: Hochschulen, Organisationen, Unterstützer'),
        q('technik', 'Technik und Infrastruktur'),
        q('training', 'Training und Vorbereitung (Rhythmus, Trainingsfahrten, Probeläufe)'),
        q('finanzen', 'Hinweis zu Finanzen (optional)'));
    },
    H(d, save, rr) {
      return el('div', {},
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Bereitschaft für 2027' }), radios(d, 'bereitschaft', ['ja', 'ja, mit Einschränkungen', 'nein', 'noch offen'], save, rr)),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Wunschrolle 2027' }), tx(d, 'rolle', save)),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Verfügbarkeit GB27 Münster, 09.–18.09.2027' }), radios(d, 'verf', ['ganze Zeit', 'teilweise', 'nicht verfügbar', 'noch offen'], save, rr), tx(d, 'verf_text', save, 'Ergänzung, z. B. welche Tage')),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Verfügbarkeit für Trainingsfahrten und Probeläufe' }), tx(d, 'trainings', save)),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Was müsste gegeben sein oder sich ändern, damit du dabei bist?' }), ta(d, 'voraus', save)),
        el('div', { class: 'q' }, el('div', { class: 'qt', text: 'Anliegen zu Zusammenarbeit und Belastung, die du nur vertraulich ansprechen möchtest' }), ta(d, 'anliegen', save)));
    }
  };

  // ---------- Gemeinsam ----------
  async function viewShared() {
    shell('gemeinsam', el('h1', { text: 'Gemeinsamer Bereich' }), el('div', { class: 'card', text: 'Wird geladen …' }));
    let docs = [];
    try { docs = await API.docs(); } catch (e) { err(e); }
    shell('gemeinsam', el('h1', { text: 'Gemeinsamer Bereich' }),
      el('div', { class: 'card stack' }, el('h2', { text: 'Unterlagen' }),
        docs.length ? el('ul', {}, docs.map(x => el('li', {}, x.url ? el('a', { href: x.url, target: '_blank', rel: 'noopener', text: x.title }) : el('b', { text: x.title }), x.body ? el('div', { class: 'small', style: 'white-space:pre-wrap', text: x.body }) : null)))
          : el('p', { class: 'note', text: 'Noch keine Unterlagen.' })),
      el('div', { class: 'card stack' }, el('h2', { text: 'Ablauf 18.12.2026' }),
        el('table', { class: 'grid' }, el('tbody', {}, [
          ['15:00', 'Eröffnung'], ['15:10', 'Zeitstrahl der Fahrt'], ['15:30', 'Beibehalten'], ['15:55', 'Schlüsselmomente a–c'], ['16:25', 'Pause'],
          ['16:40', 'Schlüsselmomente d–e'], ['17:00', 'Lücken & Ideen GB27'], ['17:30', 'Massnahmen & Organisation 2027'], ['17:50', 'Abschluss'], ['18:30', 'Nachtessen']
        ].map(([t, x]) => el('tr', {}, el('td', { class: 'mono', text: t }), el('td', { text: x })))))),
      el('div', { class: 'card stack' }, el('h2', { text: 'Ergebnisse und Live-Ansicht' }),
        el('p', { class: 'note', text: 'Die Auswertung der Hausaufgabe erscheint hier ab 15.12.2026; die Live-Ansicht für das stille Schreiben und die Punktevergabe am 18.12.2026.' })));
  }

  // ---------- Admin ----------
  let A = { list: [], link: null };
  async function viewAdmin() {
    if (!S.me.admin) return viewStart();
    try { A.list = await API.admin.participants(); } catch (e) { err(e); }
    renderAdmin();
  }
  function waText(name, link) {
    return `Hallo ${name.split(' ')[0]}\n\nFür das Debriefing GB26 am Freitag, 18.12.2026, 15:00–18:00 an der Uni Bern (auch über Zoom) bitte ich dich, bis 09.12. die Hausaufgabe auszufüllen (45–60 Minuten). Dein persönlicher Zugang:\n${link}\n\nDer Link ist nur für dich. Jeden Teil kannst du mit Namen oder anonym abgeben.\n\nBalthasar`;
  }
  function renderAdmin() {
    const box = A.link ? (() => {
      const p = A.list.find(x => x.id === A.link.id) || { name: '' };
      const link = CFG.appUrl + '#t=' + A.link.token;
      const t = el('textarea', { value: waText(p.name, link), style: 'min-height:160px' });
      return el('div', { class: 'linkbox' },
        el('b', { text: 'Persönlicher Link für ' + p.name + ' – wird nur jetzt angezeigt' }),
        el('code', { text: link }),
        t,
        el('div', { class: 'row' },
          el('button', { onclick: () => { window.open('https://wa.me/?text=' + encodeURIComponent(t.value), '_blank', 'noopener'); } }, 'In WhatsApp öffnen'),
          el('button', { class: 'sec', onclick: () => navigator.clipboard.writeText(link).then(() => msg('Link kopiert.')) }, 'Link kopieren'),
          el('button', { class: 'sec', onclick: () => navigator.clipboard.writeText(t.value).then(() => msg('Nachricht kopiert.')) }, 'Nachricht kopieren'),
          el('button', { class: 'ghost', onclick: () => { A.link = null; renderAdmin(); } }, 'Schliessen')),
        el('p', { class: 'note', text: 'In WhatsApp wählst du den Kontakt selbst. Ein neuer Link ersetzt den bisherigen.' }));
    })() : null;

    const rows = A.list.map(p => {
      const confirm = el('span', { hidden: true },
        el('button', { class: 'danger', onclick: async () => { try { const t = await API.admin.link(p.id); A.link = { id: p.id, token: t }; await viewAdmin(); window.scrollTo(0, 0); } catch (e) { err(e); } } }, 'Ja, neuer Link'),
        el('button', { class: 'ghost', onclick: () => { confirm.hidden = true; } }, 'Abbrechen'));
      return el('tr', {},
        el('td', {}, el('b', { text: p.name }), p.is_admin ? el('span', { class: 'badge', text: 'Admin' }) : null, el('div', { class: 'small muted', text: [p.funktion, p.team].filter(Boolean).join(' · ') })),
        el('td', {}, el('span', { class: 'badge ' + (p.link_state === 'aktiv' ? 'g' : p.link_state === 'widerrufen' ? 'r' : ''), text: p.link_state })),
        el('td', { class: 'mono small', text: (p.named_parts.join(' ') || '–') + (p.confidential ? ' · H' : '') }),
        el('td', {}, p.done ? el('span', { class: 'badge g', text: 'abgeschlossen' }) : el('span', { class: 'muted', text: '–' })),
        el('td', {}, el('div', { class: 'row' },
          p.link_state === 'aktiv'
            ? [el('button', { class: 'sec', onclick: () => { confirm.hidden = false; } }, 'Neuer Link'), confirm,
               el('button', { class: 'ghost', onclick: async () => { try { await API.admin.revoke(p.id); msg('Link von ' + p.name + ' widerrufen.', 'warn'); viewAdmin(); } catch (e) { err(e); } } }, 'Widerrufen')]
            : el('button', { onclick: async () => { try { const t = await API.admin.link(p.id); A.link = { id: p.id, token: t }; await viewAdmin(); window.scrollTo(0, 0); } catch (e) { err(e); } } }, 'Link erstellen'))));
    });

    const nf = { name: '', funktion: '', team: '' };
    const doneN = A.list.filter(p => p.done).length, activeN = A.list.filter(p => p.link_state === 'aktiv').length;
    const dl = el('input', { type: 'datetime-local', value: S.deadline ? toLocalInput(S.deadline) : '' });
    const nd = { title: '', url: '', body: '' };

    shell('admin', el('h1', { text: 'Admin' }), box,
      el('div', { class: 'card stack' },
        el('div', { class: 'spread' }, el('h2', { text: 'Teilnehmende' }), el('span', { class: 'small muted', text: `${A.list.length} Personen · ${activeN} Links aktiv · ${doneN} abgeschlossen` })),
        el('div', { class: 'tablewrap' }, el('table', { class: 'grid' },
          el('thead', {}, el('tr', {}, ['Name', 'Link', 'Teile mit Namen', 'Hausaufgabe', ''].map(t => el('th', { text: t })))),
          el('tbody', {}, rows))),
        el('p', { class: 'note', text: 'Anonym abgeschickte Teile erscheinen hier nicht – sie sind keiner Person zugeordnet.' }),
        el('div', { class: 'row' }, tx(nf, 'name', () => {}, 'Name'), tx(nf, 'funktion', () => {}, 'Funktion'), tx(nf, 'team', () => {}, 'Team'),
          el('button', { class: 'sec', onclick: async () => { try { await API.admin.addParticipant(nf); msg(nf.name + ' hinzugefügt.'); viewAdmin(); } catch (e) { err(e); } } }, '+ Person'))),
      el('div', { class: 'card stack' }, el('h2', { text: 'Frist' }),
        el('div', { class: 'row' }, dl, el('button', { class: 'sec', onclick: async () => { try { await API.admin.setDeadline(new Date(dl.value).toISOString()); const m = await API.me(); S.deadline = m.deadline; S.open = m.open; msg('Frist geändert.'); renderAdmin(); } catch (e) { err(e); } } }, 'Frist speichern')),
        el('p', { class: 'note', text: 'Anonyme Einträge gibt die API erst nach der Frist heraus.' })),
      el('div', { class: 'card stack' }, el('h2', { text: 'Auswertung (JSON)' }),
        el('div', { class: 'row' },
          el('button', { class: 'sec', onclick: () => dump('gb26debrief_namentlich', API.admin.named) }, 'Teile mit Namen'),
          el('button', { class: 'sec', onclick: () => dump('gb26debrief_teil_H', API.admin.confidential) }, 'Teil H (vertraulich)'),
          el('button', { class: 'sec', disabled: S.open ? true : null, onclick: () => dump('gb26debrief_anonym', API.admin.anon) }, S.open ? 'Anonyme Teile (ab Frist)' : 'Anonyme Teile'))),
      el('div', { class: 'card stack' }, el('h2', { text: 'Unterlagen im gemeinsamen Bereich' }),
        el('div', { class: 'row' }, tx(nd, 'title', () => {}, 'Titel'), tx(nd, 'url', () => {}, 'Link https://… (optional)')),
        ta(nd, 'body', () => {}, 'Text (optional)'),
        el('div', {}, el('button', { class: 'sec', onclick: async () => { try { await API.admin.addDoc(nd); msg('Unterlage hinzugefügt.'); docsAdmin(); } catch (e) { err(e); } } }, '+ Unterlage')),
        el('div', { id: 'docsadmin' })));
    docsAdmin();
  }
  async function docsAdmin() {
    const t = document.getElementById('docsadmin'); if (!t) return;
    try {
      const docs = await API.docs();
      t.replaceChildren(el('ul', {}, docs.map(x => el('li', {}, x.title + ' ', el('button', { class: 'ghost', onclick: async () => { try { await API.admin.deleteDoc(x.id); docsAdmin(); } catch (e) { err(e); } } }, 'entfernen')))));
    } catch (e) { err(e); }
  }
  function toLocalInput(iso) { const d = new Date(iso); const z = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`; }
  async function dump(name, fn) {
    try {
      const items = await fn();
      const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })), download: name + '_' + new Date().toISOString().slice(0, 10) + '.json' });
      document.body.append(a); a.click(); a.remove();
    } catch (e) { err(e); }
  }

  // ---------- Zugang und Routen ----------
  function gate(text) {
    app.replaceChildren(el('main', {}, el('div', { class: 'card stack gate' },
      el('div', { class: 'logo' }, el('img', { src: './img/logo.png', alt: 'Wicki Partners Ballonteam' })),
      el('h1', { text: 'Debriefing GB26' }),
      el('p', { text: text }),
      el('p', { class: 'note', text: 'Zugang nur mit persönlicher Einladung. Den Link erhältst du von Balthasar Wicki per WhatsApp.' }))));
  }
  function route() {
    if (!S.me) return;
    const h = (location.hash || '#start').slice(1);
    if (h.startsWith('teil-')) return viewPart(h.slice(5).toUpperCase());
    if (h === 'gemeinsam') return viewShared();
    if (h === 'admin') return viewAdmin();
    return viewStart();
  }
  async function boot() {
    const m = location.hash.match(/^#t=([A-Za-z0-9_-]{20,100})$/);
    if (m) { API.setToken(m[1]); history.replaceState(null, '', location.pathname + '#start'); }
    if (!API.token) return gate('Bitte öffne den persönlichen Link aus deiner Einladung.');
    try {
      const j = await API.me();
      S = { me: j.me, deadline: j.deadline, open: j.open, named: j.named || {}, confidential: j.confidential };
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
  boot();
})();
