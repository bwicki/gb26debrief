/* gb26debrief.wicki.aero – Zugriff auf die API. Das Zugangstoken aus dem persönlichen Link bleibt im Browser. */
(function (root) {
  'use strict';
  const LS_T = 'gb26.token';
  let token = null;
  try { token = localStorage.getItem(LS_T); } catch (e) { /* ohne Speicher */ }
  const base = () => String((root.GB26CONFIG || {}).apiBase || '').replace(/\/+$/, '');
  class ApiError extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } }
  function setToken(t) { token = t; try { if (t) localStorage.setItem(LS_T, t); else localStorage.removeItem(LS_T); } catch (e) { /* egal */ } }
  async function call(method, path, body) {
    let r;
    try {
      r = await fetch(base() + path, { method, headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: body !== undefined ? JSON.stringify(body) : undefined });
    } catch (e) { throw new ApiError(0, 'network', 'Server nicht erreichbar (' + e.message + ')'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new ApiError(r.status, j.error || 'http', j.message || ('HTTP ' + r.status));
    return j;
  }
  root.GB26API = {
    ApiError, setToken, get token() { return token; },
    me: () => call('GET', '/api/me'),
    saveNamed: (part, data) => call('PUT', '/api/named/' + part, { data }),
    deleteNamed: part => call('DELETE', '/api/named/' + part),
    sendAnon: (part, data, funktion) => call('POST', '/api/anon', { part, data, funktion: funktion || null }),
    saveConfidential: data => call('PUT', '/api/confidential', { data }),
    setDone: done => call('POST', '/api/done', { done }),
    docs: () => call('GET', '/api/docs').then(j => j.docs),
    texts: () => call('GET', '/api/texts'),
    saveTexts: (content, base) => call('PUT', '/api/texts', { content, base: base || null }),
    admin: {
      participants: () => call('GET', '/api/admin/participants').then(j => j.participants),
      addParticipant: o => call('POST', '/api/admin/participants', o),
      patchParticipant: (id, o) => call('PATCH', '/api/admin/participants/' + id, o),
      link: id => call('POST', '/api/admin/participants/' + id + '/link').then(j => j.token),
      revoke: id => call('POST', '/api/admin/participants/' + id + '/revoke'),
      confidential: () => call('GET', '/api/admin/confidential').then(j => j.items),
      named: () => call('GET', '/api/admin/named').then(j => j.items),
      anon: () => call('GET', '/api/admin/anon').then(j => j.items),
      addDoc: o => call('POST', '/api/admin/docs', o),
      deleteDoc: id => call('DELETE', '/api/admin/docs/' + id),
      settings: () => call('GET', '/api/admin/settings'),
      setDeadline: d => call('PUT', '/api/admin/settings', { deadline: d })
    }
  };
})(window);
