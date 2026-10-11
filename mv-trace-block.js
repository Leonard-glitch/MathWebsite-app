// ============================================================================
// TEMPORÄRER TRACE – Diagnose "Zurück zeigt altes Design / Änderungen erst nach F5"
//
// EINFÜGEN: in common-login.js, innerhalb der IIFE, direkt ÜBER
//     window.addEventListener('pageshow', function (e) { ... });
// (also nach dem setInterval(...) für reconcileSession).
//
// ZUSÄTZLICH (eine Zeile): in hydrate() direkt nach `cache = fresh;`
//     window.MV_TRACE && window.MV_TRACE.log('cache = fresh (gerade gesetzt)');
//
// Das Log liegt in sessionStorage['mv-trace'] und überlebt Navigationen im selben Tab.
//   Auslesen: MV_TRACE.dump()      Leeren: MV_TRACE.clear()
//
// ENTFERNEN nach der Diagnose: diesen Block + die eine Zeile in hydrate().
// ============================================================================
(function installTrace() {
    const KEY = 'mv-trace';
    const MAX = 500;
    const PID = Math.random().toString(36).slice(2, 6);          // neu bei jedem Dokument-Laden, gleich bei bfcache-Restore
    const PAGE = location.pathname.split('/').pop() || 'index';

    const fmt = o => (o ? `${o.theme}/${o.design}/${o.fontsize}` : '–');

    // Momentaufnahme: m = localStorage-Mirror, c = In-Memory-cache, d = tatsächlich angewendet (DOM)
    function snap() {
        let m = '–', d = '?';
        try { m = fmt(JSON.parse(localStorage.getItem('currentUser'))); } catch { m = 'ERR'; }
        try {
            const cs = getComputedStyle(document.documentElement);
            const glow = cs.getPropertyValue('--border-glow').trim().toLowerCase();
            const bg = cs.getPropertyValue('--bg-body').trim().toLowerCase();
            const th = Object.keys(THEMES).find(k => THEMES[k]['--border-glow'].toLowerCase() === glow) || glow;
            const ds = Object.keys(window.MV_THEME.DESIGNS).find(k => window.MV_THEME.DESIGNS[k]['--bg-body'].toLowerCase() === bg) || bg;
            d = `${th}/${ds}/${document.documentElement.style.fontSize || '–'}`;
        } catch { d = 'ERR'; }
        return { m, c: fmt(cache && cache.profile), d };
    }

    function log(ev, x) {
        try {
            const list = JSON.parse(sessionStorage.getItem(KEY) || '[]');
            list.push({ t: Date.now(), pid: PID, pg: PAGE, ev, x: x || null, ...snap() });
            sessionStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
        } catch { /* Der Trace darf nie etwas kaputt machen */ }
    }

    // Name der Funktion, die den Wrapper aufgerufen hat (Chrome- und Safari/Firefox-Stackformat)
    function caller() {
        try {
            let lines = (new Error().stack || '').split('\n').map(s => s.trim()).filter(Boolean);
            if (/^Error/.test(lines[0])) lines = lines.slice(1);
            const l = lines[2] || '';   // 0 = caller(), 1 = Wrapper, 2 = eigentlicher Aufrufer
            const chrome = l.match(/^at (?:async )?([^\s(]+) \(/);
            if (chrome) return chrome[1];
            const other = l.match(/^([^@\s]*)@/);
            return (other && other[1]) || 'anonymous';
        } catch { return '?'; }
    }

    function text() {
        let list = [];
        try { list = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch { /* leer */ }
        if (!list.length) return '(Trace ist leer)';
        const t0 = list[0].t;
        return list.map(e =>
            `+${String(e.t - t0).padStart(6)}ms  ${e.pid} ${String(e.pg).padEnd(26)} ${e.ev}${e.x ? ' ' + JSON.stringify(e.x) : ''}\n` +
            `${' '.repeat(12)}mirror=${e.m}   cache=${e.c}   dom=${e.d}`
        ).join('\n');
    }

    window.MV_TRACE = {
        log, text,
        dump() { const s = text(); console.log(s); return s; },
        clear() { sessionStorage.removeItem(KEY); }
    };

    // ── Wrapper (Funktionsdeklarationen der IIFE werden per Name aufgerufen,
    //    daher greifen die Wrapper für alle bestehenden Aufrufstellen) ────────
    const _loadMirrorSync = loadMirrorSync;
    loadMirrorSync = function () { log('loadMirrorSync:before'); _loadMirrorSync(); log('loadMirrorSync:after'); };

    const _persistMirror = persistMirror;
    persistMirror = function () { log('persistMirror:before', { by: caller() }); _persistMirror(); log('persistMirror:after'); };

    const _clearMirror = clearMirror;
    clearMirror = function () { log('clearMirror:before', { by: caller() }); _clearMirror(); log('clearMirror:after'); };

    const _dispatchStateRestore = dispatchStateRestore;
    dispatchStateRestore = function () { log('dispatchStateRestore:before', { by: caller() }); _dispatchStateRestore(); log('dispatchStateRestore:after'); };

    const _fetchFreshState = fetchFreshState;
    fetchFreshState = async function (...args) {
        log('fetchFresh:start');
        const r = await _fetchFreshState(...args);
        log('fetchFresh:done', { server: r ? fmt(r.profile) : null });
        return r;
    };

    const _hydrate = hydrate;
    hydrate = function (...args) {
        const seq = hydrateSeq + 1;                       // so wird hydrate() intern zählen
        log('hydrate:call', { seq, by: caller() });
        return _hydrate(...args).then(r => { log('hydrate:done', { seq, latest: hydrateSeq }); return r; });
    };

    const _patch = patchProfileOptimistic;
    patchProfileOptimistic = function (patch) {
        log('patch:start', { keys: Object.keys(patch).join(','), by: caller() });
        const p = _patch(patch);
        p.then(r => log('patch:response', { success: r && r.success, reason: (r && r.reason) || null }));
        return p;
    };

    // ── Ereignisse ─────────────────────────────────────────────────────────
    window.addEventListener('pageshow', e => log('pageshow', { persisted: e.persisted }));
    window.addEventListener('pagehide', e => log('pagehide', { persisted: e.persisted }));
    document.addEventListener('visibilitychange', () => log('visibility', { state: document.visibilityState }));
    window.addEventListener('storage', e => log('storage-event', { key: e.key }));
    // läuft nach dem Theme-Listener von common-login.js (der ist früher registriert) -> dom = Ergebnis des Restore
    window.addEventListener('mv:staterestore', () => log('staterestore:after-theme-apply'));
    supabaseClient.auth.onAuthStateChange(event => log('auth:event', { event }));

    log('init', { nav: (performance.getEntriesByType('navigation')[0] || {}).type, readyState: document.readyState });
})();
