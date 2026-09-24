window.MV_BASE = ((document.currentScript || {}).src || '')
    .replace(/\/javaScript\/Common\/common-login\.js([?#].*)?$/, '')
    .replace(/\/+$/, '');            // NEU: nie ein trailing Slash

// NEU: einzige Stelle, die Auth-Redirect-URLs baut. Garantiert genau einen
// Slash zwischen Base und Pfad – ein doppelter Slash würde die Supabase-
// Redirect-Allowlist nicht mehr matchen (Byte-Vergleich).
window.MV_URL = function (path) {
    return window.MV_BASE + '/' + String(path || '').replace(/^\/+/, '');
};
/* =============================================================================
 * VORAUSSETZUNG (muss VOR diesem Script geladen werden, in jeder HTML-Datei):
 *
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *   <script src=".../javaScript/Common/theme-init.js"></script>
 *   <script src=".../javaScript/Common/common-login.js"></script>
 *
 * Grund: common-login.js ist bewusst weiterhin ein klassisches <script> (kein
 * type="module"), damit sich an der Lade-Reihenfolge/-Art der ~20 HTML-Seiten
 * nichts ändern muss. Die UMD-Version des Supabase-Clients stellt sich dafür
 * als window.supabase zur Verfügung.
 *
 * TODO (zwingend vor dem ersten Test auszufüllen):
 * ============================================================================= */
const MV_SUPABASE_URL = 'https://kdfulescwtiyjilnmewg.supabase.co';
const MV_SUPABASE_ANON_KEY = 'sb_publishable_5cGoljlRhJDfdxV9G0-3fw_-639_H1o';

(function () {

    const { getTheme: getThemeInit, getDesign: getDesignInit, getFontSize: getFontSizeInit,
            applyTheme, applyDesign, applyFontSize, THEMES } = window.MV_THEME;

    const CURRENCIES = {
        EUR: 'Euro', USD: 'US Dollar', GBP: 'British Pound', JPY: 'Japanese Yen',
        CHF: 'Swiss Franc', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
        CNY: 'Chinese Yuan', INR: 'Indian Rupee', BRL: 'Brazilian Real'
    };

    const supabaseClient = window.supabase.createClient(MV_SUPABASE_URL, MV_SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    // ==========================================================================
    // CACHE / LOCALSTORAGE-MIRROR
    // cache ist die einzige Quelle, aus der alle SYNCHRONEN Getter lesen.
    // Beim Laden wird er sofort (synchron) aus dem localStorage-Mirror befüllt,
    // danach im Hintergrund (asynchron) gegen Supabase abgeglichen.
    // ==========================================================================

    const CACHE_KEY = 'currentUser';       // gleicher Key wie zuvor -> theme-init.js
    const LOGGED_IN_KEY = 'isLoggedIn';    // liest ihn direkt, braucht daher KEINE Änderung
    const PENDING_REGISTRATION_KEY = 'mv-pending-registration';
    const PENDING_REGISTRATION_TTL_MS = 24 * 60 * 60 * 1000;
    const HISTORY_LIMIT = 50;

    let cache = { id: null, email: null, profile: null, toolHistory: {} };

    function isLoggedIn() { return !!cache.id; }

    function dbRowToProfile(row) {
        return {
            username: row.username,
            theme: row.theme,
            design: row.design,
            fontsize: row.fontsize,
            currency: row.currency,
            decimalPlaces: row.decimal_places,
            liveResult: row.live_result,
            angleMode: row.angle_mode,
            isPro: row.is_pro,
            favoriten: row.favorites || [],
            pinnedGroups: row.pinned_groups || [],
            containerOrders: row.container_orders || {},
            advancedModes: row.advanced_modes || {},
            toolStates: row.tool_states || {},
            createdAt: row.created_at
        };
    }

    // Mappt die (deutschen) camelCase-Feldnamen der App auf die englischen
    // DB-Spaltennamen aus Schritt 1 - einzige Stelle, die diese Übersetzung kennen muss.
    function profilePatchToDbColumns(patch) {
        const map = {
            username: 'username', theme: 'theme', design: 'design', fontsize: 'fontsize',
            currency: 'currency', decimalPlaces: 'decimal_places', liveResult: 'live_result',
            angleMode: 'angle_mode', isPro: 'is_pro', favoriten: 'favorites',
            pinnedGroups: 'pinned_groups', containerOrders: 'container_orders',
            advancedModes: 'advanced_modes', toolStates: 'tool_states'
        };
        const out = {};
        Object.entries(patch).forEach(([key, val]) => {
            if (map[key] !== undefined) out[map[key]] = val;
        });
        return out;
    }

    function loadMirrorSync() {
        try {
            const loggedIn = localStorage.getItem(LOGGED_IN_KEY) === 'true';
            const stored = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (loggedIn && stored && stored.id) {
                cache = {
                    id: stored.id,
                    email: stored.email || null,
                    profile: {
                        username: stored.username, theme: stored.theme, design: stored.design,
                        fontsize: stored.fontsize, currency: stored.currency,
                        decimalPlaces: stored.decimalPlaces, liveResult: stored.liveResult,
                        angleMode: stored.angleMode, isPro: stored.isPro,
                        favoriten: stored.favoriten || [], pinnedGroups: stored.pinnedGroups || [],
                        containerOrders: stored.containerOrders || {},
                        advancedModes: stored.advancedModes || {},
                        toolStates: stored.toolStates || {}, createdAt: stored.createdAt
                    },
                    toolHistory: stored.toolHistory || {}
                };
                return;
            }
        } catch { /* kaputter/fehlender Mirror - als Gast starten, hydrate() korrigiert */ }
        cache = { id: null, email: null, profile: null, toolHistory: {} };
    }

    // Abgelaufene Pending-Registration entfernen, auch wenn sich nie jemand
    // mit dieser Adresse anmeldet.
    (function pruneExpiredPendingRegistration() {
        try {
            const stash = JSON.parse(localStorage.getItem(PENDING_REGISTRATION_KEY) || 'null');
            if (!stash) return;
            if (!stash.createdAt || Date.now() - stash.createdAt > PENDING_REGISTRATION_TTL_MS) {
                localStorage.removeItem(PENDING_REGISTRATION_KEY);
            }
        } catch { localStorage.removeItem(PENDING_REGISTRATION_KEY); }
    })();

    function persistMirror() {
        if (!cache.id || !cache.profile) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(LOGGED_IN_KEY);
            return;
        }
        const flat = { id: cache.id, email: cache.email, ...cache.profile, toolHistory: cache.toolHistory };
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(flat));
            localStorage.setItem(LOGGED_IN_KEY, 'true');
        } catch { /* Storage voll o.ä. - Mirror bleibt ggf. veraltet, kein harter Fehler */ }
    }

    // Entfernt die von supabase-js selbst verwaltete Session hart aus dem
    // Storage. Nötig als Fallback: schlug signOut() fehl (offline), hätte
    // hydrate() den User beim nächsten Laden wieder eingeloggt – obwohl die
    // UI "ausgeloggt" gezeigt und weg navigiert hat.
    function purgeSupabaseAuthKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && /^sb-.*-auth-token/.test(key)) keys.push(key);
            }
            keys.forEach(k => localStorage.removeItem(k));
        } catch { /* Storage nicht verfügbar */ }
    }

    // Personenbezogene Reste, die clearMirror() bisher stehen ließ.
    // Theme/Design/Fontsize bleiben bewusst erhalten (reine Darstellung,
    // sonst springt die Optik beim Logout).
    function clearLocalPersonalData() {
        try {
            localStorage.removeItem(PENDING_REGISTRATION_KEY);
            localStorage.removeItem(GUEST_HISTORY_KEY);
            const toolStateKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mv-toolstate-')) toolStateKeys.push(key);
            }
            toolStateKeys.forEach(k => localStorage.removeItem(k));
            sessionStorage.removeItem('mv-return-url');
            sessionStorage.removeItem('mv-pending-verify-email');
            sessionStorage.removeItem('mv-login-fails');
            sessionStorage.removeItem('mv-login-lock-until');
        } catch { /* Storage nicht verfügbar */ }
    }

    function clearMirror() {
        cache = { id: null, email: null, profile: null, toolHistory: {} };
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(LOGGED_IN_KEY);
    }

    // Schreibt eine Profil-Änderung SOFORT in den Cache (Optimistic Update),
    // schickt sie parallel im Hintergrund an Supabase. Für die vielen kleinen,
    // unkritischen Einstellungs-Writes (Theme, Favoriten, Tool-States, ...) -
    // NICHT für sicherheitsrelevante Vorgänge (siehe registerUser/loginUser/etc.,
    // die bewusst auf die echte Server-Antwort warten).
    function patchProfileOptimistic(patch) {
        Object.assign(cache.profile, patch);
        persistMirror();
        const dbPatch = profilePatchToDbColumns(patch);
        supabaseClient.from('profiles').update(dbPatch).eq('id', cache.id)
            .then(({ error }) => {
                if (error) console.warn('[MV] Speichern fehlgeschlagen (wird beim nächsten Laden ggf. zurückgesetzt):', error.message);
            });
    }

    // ==========================================================================
    // HYDRATE – einmalig beim Laden, danach bei Auth-State-Änderungen
    // ==========================================================================

    async function fetchFreshState(userId, email) {
        const [{ data: profileRow, error: profileErr }, { data: historyRows, error: historyErr }] = await Promise.all([
            supabaseClient.from('profiles').select('*').eq('id', userId).single(),
            supabaseClient.from('tool_history').select('*').eq('user_id', userId).order('created_at', { ascending: true })
        ]);

        if (profileErr) {
            console.warn('[MV] Profil konnte nicht geladen werden:', profileErr.message);
            return null;
        }
        if (historyErr) {
            console.warn('[MV] Verlauf konnte nicht geladen werden:', historyErr.message);
        }

        const toolHistory = {};
        (historyRows || []).forEach(row => {
            if (!toolHistory[row.tool_key]) toolHistory[row.tool_key] = [];
            toolHistory[row.tool_key].push({ id: row.id, expr: row.expression, result: row.result, timestamp: row.created_at });
        });

        return { id: userId, email, profile: dbRowToProfile(profileRow), toolHistory };
    }

    // Überträgt die bei der Registrierung übergebenen Gast-Daten (Theme,
    // Favoriten, Tool-History, ...) auf das echte Profil. Läuft NUR einmalig,
    // NUR wenn die E-Mail zur gerade aktiven Session passt (verhindert, dass
    // ein Login in ein ANDERES/bestehendes Konto versehentlich Gast-Daten
    // dieses Browsers übernimmt).
    async function applyRegistrationPayload(userId, payload) {
        const patch = profilePatchToDbColumns({
            favoriten: payload.favoriten, pinnedGroups: payload.pinnedGroups,
            containerOrders: payload.containerOrders, theme: payload.theme,
            fontsize: payload.fontsize, currency: payload.currency,
            decimalPlaces: payload.decimalPlaces, liveResult: payload.liveResult,
            angleMode: payload.angleMode, toolStates: payload.toolStates, isPro: payload.isPro
        });
        if (Object.keys(patch).length > 0) {
            const { error } = await supabaseClient.from('profiles').update(patch).eq('id', userId);
            if (error) console.warn('[MV] Registrierungsdaten (Einstellungen) konnten nicht übernommen werden:', error.message);
        }

        const rows = [];
        Object.entries(payload.toolHistory || {}).forEach(([toolKey, entries]) => {
            (entries || []).forEach(entry => {
                rows.push({ user_id: userId, tool_key: toolKey, expression: entry.expr, result: entry.result, created_at: entry.timestamp });
            });
        });
        if (rows.length > 0) {
            const { error } = await supabaseClient.from('tool_history').insert(rows);
            if (error) console.warn('[MV] Registrierungsdaten (Verlauf) konnten nicht übernommen werden:', error.message);
        }
    }

    async function applyPendingRegistrationIfMatching(userId, email) {
        let stash;
        try { stash = JSON.parse(localStorage.getItem(PENDING_REGISTRATION_KEY) || 'null'); } catch { stash = null; }
        if (!stash) return;

        // Abgelaufen (nie bestätigte Registrierung): enthält die E-Mail-Adresse
        // und lag bisher unbegrenzt im Browser.
        const age = Date.now() - (stash.createdAt || 0);
        if (!stash.createdAt || age > PENDING_REGISTRATION_TTL_MS) {
            localStorage.removeItem(PENDING_REGISTRATION_KEY);
            return;
        }
        if (stash.email !== email) return;

        // Erst NACH applyRegistrationPayload() entfernen: schlägt der Write
        // fehl, bleibt der Stash für einen erneuten Versuch beim nächsten
        // Login erhalten, statt endgültig verloren zu gehen.
        await applyRegistrationPayload(userId, stash.payload);
        localStorage.removeItem(PENDING_REGISTRATION_KEY);
    }

    // Guards overlapping hydrate() calls finishing out of order — only the
    // most recently STARTED call may write to cache.
    let hydrateSeq = 0;

    async function hydrate() {
        const seq = ++hydrateSeq;
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();

            if (!session) {
                if (seq !== hydrateSeq) return;
                if (cache.id) { clearMirror(); dispatchStateRestore(); }
                return;
            }

            // Bewusst NICHT mehr hier: lief sonst bei jedem Seitenaufruf/Auth-
            // Event mit bestehender Session, nicht nur bei bewusstem Login –
            // bleibt jetzt auf loginUser() beschränkt (siehe Reviewbericht).
            const fresh = await fetchFreshState(session.user.id, session.user.email);
            if (seq !== hydrateSeq) return; // newer hydrate() already started — discard stale result
            if (fresh) {
                cache = fresh;
                persistMirror();
                dispatchStateRestore();
            }
        } catch (err) {
            // Netzwerk/Supabase nicht erreichbar: Cache bleibt auf dem Stand des
            // localStorage-Mirrors (letzter bekannter guter Zustand) - Seite
            // bleibt nutzbar, nur eben ohne Aktualisierung in diesem Moment.
            console.warn('[MV] Hydrate fehlgeschlagen (evtl. offline). Nutze lokalen Cache-Stand.', err && err.message ? err.message : err);
        }
    }

    let initialHydrateStarted = false;
    // Wird von loginUser()/registerUser() gesetzt, unmittelbar bevor sie selbst
    // signInWithPassword()/signUp() aufrufen: verhindert, dass der dadurch
    // ausgelöste SIGNED_IN-Event zusätzlich zum ohnehin schon in loginUser()/
    // registerUser() laufenden Fetch NOCH EINEN hydrate()-Durchlauf startet
    // (sonst: doppelte profiles-/tool_history-Abfragen pro Login).
    let skipNextAuthEvent = false;

    // Für reset-password.js (Schritt 3): Supabase erkennt einen gültigen
    // Recovery-Link selbst (detectSessionInUrl) und feuert dafür EINMALIG
    // 'PASSWORD_RECOVERY' statt eines prüfbaren Tokens. Da dieses Event auch
    // schon feuern kann, bevor reset-password.js seinen eigenen Listener
    // registriert hat, wird das Ergebnis zusätzlich in einem Flag gemerkt.
    let passwordRecoveryDetected = false;
    function isPasswordRecoverySession() { return passwordRecoveryDetected; }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            passwordRecoveryDetected = true;
            window.dispatchEvent(new CustomEvent('mv:passwordrecovery'));
        }
        if (!initialHydrateStarted || event === 'INITIAL_SESSION') return;
        if (skipNextAuthEvent && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
            skipNextAuthEvent = false;
            return;
        }
        if (event === 'SIGNED_OUT') {
            if (cache.id) { clearMirror(); dispatchStateRestore(); }
            return;
        }
        if (event === 'SIGNED_IN' && session) {
            // Bedingung "session.user.id !== cache.id" entfernt: nach dem Klick
            // auf den zweiten Bestätigungslink feuert SIGNED_IN für DENSELBEN
            // User (detectSessionInUrl) – die geänderte E-Mail wurde dadurch
            // nie nachgeladen. Dieselbe Falle wie zuvor bei USER_UPDATED.
            hydrate();
        } else if (event === 'USER_UPDATED' && session) {
            hydrate();
        }
    });

    loadMirrorSync();
    initialHydrateStarted = true;
    hydrate();

    // ==========================================================================
    // GRUNDLEGENDE GETTER
    // ==========================================================================

    function getCurrentUser() {
        if (!cache.id || !cache.profile) return null;
        return {
            id: cache.id, email: cache.email,
            username: cache.profile.username, theme: cache.profile.theme, design: cache.profile.design,
            fontsize: cache.profile.fontsize, currency: cache.profile.currency,
            decimalPlaces: cache.profile.decimalPlaces, liveResult: cache.profile.liveResult,
            angleMode: cache.profile.angleMode, isPro: cache.profile.isPro,
            favoriten: cache.profile.favoriten, pinnedGroups: cache.profile.pinnedGroups,
            containerOrders: cache.profile.containerOrders, advancedModes: cache.profile.advancedModes,
            toolStates: cache.profile.toolStates, toolHistory: cache.toolHistory,
            createdAt: cache.profile.createdAt
        };
    }

    function saveCurrentUser(userLike) {
        if (!userLike || !isLoggedIn()) return;
        updateCurrentUser(userLike);
    }

    function updateCurrentUser(patch) {
        if (!isLoggedIn()) return null;
        patchProfileOptimistic(patch);
        return getCurrentUser();
    }

    function redirectIfLoggedIn(path) {
        if (!isLoggedIn()) return;
        const returnUrl = sessionStorage.getItem('mv-return-url');
        if (returnUrl) {
            sessionStorage.removeItem('mv-return-url');
            window.location.href = returnUrl;
        } else {
            window.location.href = path;
        }
    }

    // ==========================================================================
    // AUTH-AKTIONEN (kritisch -> KEIN Optimistic Update, echte Server-Antwort abwarten)
    // ==========================================================================

    async function registerUser(userData) {
        const { username, email, password, ...rest } = userData;

        skipNextAuthEvent = true;
        let data, error;
        try {
            ({ data, error } = await supabaseClient.auth.signUp({
                email, password,
                options: {
                    data: { username }, // <- handle_new_user() liest username von hier
                    emailRedirectTo: window.MV_URL('index.html')
                }
            }));
        } catch (err) {
            skipNextAuthEvent = false;
            return { success: false, reason: 'network_error' };
        }

        if (error) { skipNextAuthEvent = false; return { success: false, reason: error.message }; }

        if (data.session) {
            // E-Mail-Bestätigung deaktiviert bzw. sofortige Session vorhanden:
            // Registrierungsdaten direkt übernehmen.
            await applyRegistrationPayload(data.user.id, rest);
            const fresh = await fetchFreshState(data.user.id, data.user.email);
            if (fresh) { cache = fresh; persistMirror(); dispatchStateRestore(); }
            return { success: true, needsEmailConfirmation: false };
        }

        // E-Mail-Bestätigung aktiv (aktueller Stand bei dir): keine Session
        // verfügbar, RLS würde einen Write jetzt ohnehin blocken. Payload für
        // den ersten Login nach Bestätigung zwischenspeichern.
        //
        // AUSNAHME: Bei einer bereits bestätigten Email liefert Supabase auch
        // hier error=null/session=null (Anti-Enumeration), aber identities=[].
        // Dann NICHT stashen, sonst überschreibt diese Default-Payload beim
        // nächsten Login des echten Accounts dessen echtes Profil. Rückgabewert
        // bleibt in beiden Fällen identisch (No-Enumeration bleibt gewahrt).
        const isExistingConfirmedEmail = data.user?.identities?.length === 0;

        if (!isExistingConfirmedEmail) {
            try {
                localStorage.setItem(PENDING_REGISTRATION_KEY,
                JSON.stringify({ email, payload: rest, createdAt: Date.now() }));
            } catch { /* Storage voll o.ä. – nicht blockierend */ }
        }

        return { success: true, needsEmailConfirmation: true };
    }

    async function resendConfirmationEmail(email) {
        try {
            const { error } = await supabaseClient.auth.resend({
                type: 'signup',
                email: (email || '').trim(),
                options: { emailRedirectTo: window.MV_URL('index.html') }
            });
            if (error) return { success: false, reason: error.message };
            return { success: true };
        } catch (err) {
            return { success: false, reason: 'network_error' };
        }
    }

    async function loginUser(identifier, password) {
        const email = (identifier || '').trim();
        if (!email.includes('@')) {
            // Login nur noch per E-Mail möglich, siehe Zusammenfassung/Risiken.
            return { success: false, reason: 'email_required' };
        }

        skipNextAuthEvent = true;
        let data, error;
        try {
            ({ data, error } = await supabaseClient.auth.signInWithPassword({ email, password }));
        } catch (err) {
            skipNextAuthEvent = false;
            return { success: false, reason: 'network_error' };
        }
        if (error) { skipNextAuthEvent = false; return { success: false, reason: 'invalid_credentials' }; }

        await applyPendingRegistrationIfMatching(data.user.id, data.user.email);
        const fresh = await fetchFreshState(data.user.id, data.user.email);
        if (fresh) { cache = fresh; persistMirror(); }

        return { success: true, user: getCurrentUser() };
    }

    // Async: Aufrufer MÜSSEN awaiten, bevor sie wegnavigieren – sonst kann die
    // von supabase-js selbst verwaltete Session (localStorage-Key
    // sb-<ref>-auth-token) beim Redirect noch bestehen und auf der Zielseite
    // fälschlich als gültig re-hydriert werden. App-eigener Mirror/State wird
    // weiterhin sofort (optimistisch) geleert, UI reagiert ohne Wartezeit.
    // Reihenfolge umgedreht: erst serverseitig widerrufen, dann lokal löschen.
    // Vorher war es optimistisch – bei fehlgeschlagenem signOut() blieb eine
    // gültige Session zurück, während die UI bereits "ausgeloggt" zeigte.
    async function logout() {
        let signedOut = false;
        try {
            const { error } = await supabaseClient.auth.signOut();   // scope: 'global'
            signedOut = !error;
            if (error) console.warn('[MV] Server-Logout fehlgeschlagen:', error.message);
        } catch (err) {
            console.warn('[MV] Server-Logout nicht erreichbar:', err && err.message);
        }

        if (!signedOut) {
            try { await supabaseClient.auth.signOut({ scope: 'local' }); } catch { /* s.u. */ }
            purgeSupabaseAuthKeys();   // harte Notbremse
        }

        clearMirror();
        clearLocalPersonalData();
        dispatchStateRestore();
        return { success: signedOut };
    }

    async function deleteCurrentAccount() {
        if (!isLoggedIn()) return { success: false, reason: 'not_logged_in' };

        let result;
        try {
            result = await supabaseClient.functions.invoke('delete-account', { method: 'POST' });
        } catch (err) {
            console.error('[MV] Account deletion – Netzwerkfehler:', err);
            return { success: false, reason: 'network_error' };
        }

        if (result.error) {
            // FunctionsHttpError liefert in error.message nur "non-2xx status code".
            // Die echte Serverantwort steckt in error.context (Response-Objekt).
            let detail = result.error.message || 'unknown_error';
            try {
                const body = await result.error.context?.json?.();
                if (body && (body.message || body.error)) detail = body.message || body.error;
            } catch { /* kein JSON-Body (z.B. CORS-/Netzwerkfehler) */ }
            console.error('[MV] Account deletion failed:', detail, result.error);
            return { success: false, reason: detail };
        }

        // Der Auth-User existiert nicht mehr: ein globaler signOut() würde 401
        // liefern. 'local' entfernt nur den Token aus diesem Browser – genau das,
        // was hier nötig ist, damit hydrate() nicht gegen einen toten User läuft.
        try {
            await supabaseClient.auth.signOut({ scope: 'local' });
        } catch { /* egal – purge unten räumt hart auf */ }
        purgeSupabaseAuthKeys();

        clearMirror();
        clearLocalPersonalData();
        dispatchStateRestore();
        return { success: true };
    }

    // Prüft das Passwort OHNE signInWithPassword(). Der bisherige Weg war ein
    // echter Login: er rotierte Tokens mitten im Flow, zählte auf denselben
    // Rate-Limit-Zähler wie der Login (Nutzer konnten sich selbst aussperren)
    // und war das stärkste Signal für den Browser-Passwortmanager.
    // Fallback auf den alten Weg, falls die RPC (noch) nicht existiert.
    async function verifyCurrentPassword(pw) {
        if (!isLoggedIn() || !cache.email) return { success: false, reason: 'not_logged_in' };
        if (!pw) return { success: false, reason: 'wrong_password' };

        try {
            const { data, error } = await supabaseClient.rpc('verify_user_password', { password: pw });
            if (!error) {
                return data === true ? { success: true } : { success: false, reason: 'wrong_password' };
            }
            console.warn('[MV] verify_user_password RPC nicht verfügbar, nutze Fallback:', error.message);
        } catch (err) {
            console.warn('[MV] verify_user_password RPC fehlgeschlagen:', err && err.message);
        }

        try {
            skipNextAuthEvent = true;   // kein zusätzliches hydrate() auslösen
            const { error } = await supabaseClient.auth.signInWithPassword({ email: cache.email, password: pw });
            if (error) { skipNextAuthEvent = false; return { success: false, reason: 'wrong_password' }; }
            return { success: true };
        } catch {
            skipNextAuthEvent = false;
            return { success: false, reason: 'network_error' };
        }
    }

    async function updateUsername(name) {
        if (!isLoggedIn()) return { success: false, reason: 'not_logged_in' };
        const { error } = await supabaseClient.from('profiles').update({ username: name }).eq('id', cache.id);
        if (error) return { success: false, reason: error.message };
        cache.profile.username = name;
        persistMirror();
        return { success: true };
    }

    async function updatePassword(pw) {
        const { error } = await supabaseClient.auth.updateUser({ password: pw });
        if (error) return { success: false, reason: error.message };
        return { success: true };
    }

    // ==========================================================================
    // THEME / DESIGN / FONTSIZE (Gast: localStorage, Login: Cache+Supabase)
    // ==========================================================================

    function getTheme() {
        if (isLoggedIn() && cache.profile.theme) return cache.profile.theme;
        return localStorage.getItem('mv-theme') || 'violet';
    }
    function setTheme(theme) {
        if (isLoggedIn()) { patchProfileOptimistic({ theme }); }
        else { localStorage.setItem('mv-theme', theme); }
    }

    function getDesign() {
        if (isLoggedIn() && cache.profile.design) return cache.profile.design;
        return localStorage.getItem('mv-design') || 'abyss';
    }
    function setDesign(design) {
        if (isLoggedIn()) { patchProfileOptimistic({ design }); }
        else { localStorage.setItem('mv-design', design); }
    }

    function getFontSize() {
        if (isLoggedIn() && cache.profile.fontsize) return cache.profile.fontsize;
        return parseInt(localStorage.getItem('mv-fontsize') || '20', 10);
    }
    function setFontSize(size) {
        if (isLoggedIn()) { patchProfileOptimistic({ fontsize: size }); }
        else { localStorage.setItem('mv-fontsize', String(size)); }
    }

    function getAngleMode() {
        if (isLoggedIn() && cache.profile.angleMode) return cache.profile.angleMode;
        return localStorage.getItem('mv-angleMode') || 'deg';
    }
    function setAngleMode(mode) {
        if (isLoggedIn()) { patchProfileOptimistic({ angleMode: mode }); }
        else { localStorage.setItem('mv-angleMode', mode); }
    }

    function getCurrency() {
        if (isLoggedIn() && cache.profile.currency) return cache.profile.currency;
        return localStorage.getItem('mv-currency') || 'EUR';
    }
    function setCurrency(code) {
        if (isLoggedIn()) { patchProfileOptimistic({ currency: code }); }
        else { localStorage.setItem('mv-currency', code); }
    }
    function getCurrencySymbol() {
        const parts = new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency() }).formatToParts(0);
        const symbolPart = parts.find(p => p.type === 'currency');
        return symbolPart ? symbolPart.value : getCurrency();
    }
    function formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency() }).format(amount);
    }
    function formatCurrencyCompact(amount) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency(), maximumFractionDigits: 0 }).format(amount);
    }

    function getDecimalPlaces() {
        if (isLoggedIn() && cache.profile.decimalPlaces !== undefined) return parseInt(cache.profile.decimalPlaces, 10);
        return parseInt(localStorage.getItem('mv-decimalPlaces') || '2', 10);
    }
    function setDecimalPlaces(count) {
        if (isLoggedIn()) { patchProfileOptimistic({ decimalPlaces: count }); }
        else { localStorage.setItem('mv-decimalPlaces', String(count)); }
    }

    function getLiveResult() {
        if (isLoggedIn() && cache.profile.liveResult !== undefined) return !!cache.profile.liveResult;
        const stored = localStorage.getItem('mv-liveResult');
        return stored === null ? false : stored === 'true';
    }
    function setLiveResult(value) {
        if (isLoggedIn()) { patchProfileOptimistic({ liveResult: value }); }
        else { localStorage.setItem('mv-liveResult', String(!!value)); }
    }

    // ==========================================================================
    // FAVORITEN / ANGEPINNTE GRUPPEN / CONTAINER-REIHENFOLGE
    // (nur eingeloggt nutzbar - identisches Verhalten wie zuvor)
    // ==========================================================================

    function getFavorites() {
        return (isLoggedIn() && cache.profile) ? (cache.profile.favoriten || []) : [];
    }
    function setFavorites(arr) {
        if (!isLoggedIn()) return;
        patchProfileOptimistic({ favoriten: arr });
    }
    function toggleFavorite(id) {
        if (!isLoggedIn()) return false;
        const favs = getFavorites();
        const isFav = favs.includes(id);
        setFavorites(isFav ? favs.filter(f => f !== id) : [...favs, id]);
        return !isFav;
    }

    function getPinnedGroups() {
        if (isLoggedIn() && cache.profile) {
            return cache.profile.pinnedGroups !== undefined ? cache.profile.pinnedGroups : ['favoritenGroupStar'];
        }
        return ['favoritenGroupStar'];
    }
    function setPinnedGroups(arr) {
        if (!isLoggedIn()) return;
        patchProfileOptimistic({ pinnedGroups: arr });
    }

    function getContainerOrders() {
        return (isLoggedIn() && cache.profile) ? (cache.profile.containerOrders || {}) : {};
    }
    function setContainerOrders(obj) {
        if (!isLoggedIn()) return;
        patchProfileOptimistic({ containerOrders: obj });
    }

    // ==========================================================================
    // ADVANCED MODES
    // ==========================================================================

    function getAdvancedModes() {
        return (isLoggedIn() && cache.profile) ? (cache.profile.advancedModes || {}) : {};
    }
    function setAdvancedModes(obj) {
        if (!isLoggedIn()) return;
        patchProfileOptimistic({ advancedModes: obj });
    }
    function getAdvancedMode(key) { return !!getAdvancedModes()[key]; }
    function toggleAdvancedMode(key) {
        if (!isLoggedIn()) return false;
        const modes = getAdvancedModes();
        const newVal = !modes[key];
        setAdvancedModes({ ...modes, [key]: newVal });
        return newVal;
    }

    function bindAdvancedToggle(checkbox, key, onChange) {
        if (!checkbox) return;
        const wrapper = checkbox.closest('.advancedMode') || checkbox.parentElement;

        function applyState() {
            const loggedIn = isLoggedIn();
            checkbox.checked = loggedIn ? getAdvancedMode(key) : false;
            if (wrapper) wrapper.classList.toggle('locked', !loggedIn);
            if (typeof onChange === 'function') onChange(checkbox.checked);
        }

        checkbox.addEventListener('change', () => {
            if (!isLoggedIn()) {
                checkbox.checked = false;
                showLoginPrompt('Please log in to use the advanced mode.');
                if (typeof onChange === 'function') onChange(false);
                return;
            }
            toggleAdvancedMode(key);
            if (typeof onChange === 'function') onChange(checkbox.checked);
        });

        applyState();
        // Deckt jetzt auch Logout im selben Tab und bfcache-Restore ab,
        // nicht nur Cross-Tab-Änderungen.
        window.addEventListener('mv:staterestore', applyState);
    }

    // ==========================================================================
    // TOOL STATES
    // ==========================================================================

    function getToolState(toolKey, fallback = null) {
        if (isLoggedIn()) {
            return (cache.profile && cache.profile.toolStates && cache.profile.toolStates[toolKey] !== undefined)
                ? cache.profile.toolStates[toolKey] : fallback;
        }
        try {
            const raw = localStorage.getItem('mv-toolstate-' + toolKey);
            return raw !== null ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    }
    function setToolState(toolKey, stateObj) {
        if (isLoggedIn()) {
            const toolStates = { ...(cache.profile.toolStates || {}), [toolKey]: stateObj };
            patchProfileOptimistic({ toolStates });
        } else {
            try { localStorage.setItem('mv-toolstate-' + toolKey, JSON.stringify(stateObj)); } catch { /* Storage voll o.ä. */ }
        }
    }
    function getAllGuestToolStates() {
        const result = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('mv-toolstate-')) continue;
            try { result[key.slice('mv-toolstate-'.length)] = JSON.parse(localStorage.getItem(key)); } catch { /* defekter Eintrag - überspringen */ }
        }
        return result;
    }

    // ==========================================================================
    // TOOL HISTORY (Gast: unverändert localStorage / Login: Cache + tool_history)
    // ==========================================================================

    const GUEST_HISTORY_KEY = 'mv-toolHistory';

    function getGuestToolHistoryStore() {
        try {
            const store = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY));
            return (store && typeof store === 'object') ? store : {};
        } catch { return {}; }
    }
    function saveGuestToolHistoryStore(store) {
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(store));
    }
    function getAllGuestToolHistory() { return getGuestToolHistoryStore(); }
    function clearGuestToolHistoryStore() { localStorage.removeItem(GUEST_HISTORY_KEY); }

    function getToolHistory(key) {
        if (isLoggedIn()) return cache.toolHistory[key] || [];
        return getGuestToolHistoryStore()[key] || [];
    }

    function addToolHistoryEntry(key, entry) {
        const fullEntry = {
            id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            ...entry
        };

        if (isLoggedIn()) {
            cache.toolHistory[key] = [...(cache.toolHistory[key] || []), fullEntry].slice(-HISTORY_LIMIT);
            supabaseClient.from('tool_history').insert({
                id: fullEntry.id, user_id: cache.id, tool_key: key,
                expression: fullEntry.expr, result: fullEntry.result, created_at: fullEntry.timestamp
            }).then(({ error }) => { if (error) console.warn('[MV] Verlaufseintrag konnte nicht gespeichert werden:', error.message); });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = [...(store[key] || []), fullEntry].slice(-HISTORY_LIMIT);
            saveGuestToolHistoryStore(store);
        }
        return fullEntry;
    }

    function deleteToolHistoryEntry(key, id) {
        if (isLoggedIn()) {
            cache.toolHistory[key] = (cache.toolHistory[key] || []).filter(e => e.id !== id);
            supabaseClient.from('tool_history').delete().eq('id', id).eq('user_id', cache.id)
                .then(({ error }) => { if (error) console.warn('[MV] Löschen fehlgeschlagen:', error.message); });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = (store[key] || []).filter(e => e.id !== id);
            saveGuestToolHistoryStore(store);
        }
    }

    function clearToolHistory(key) {
        if (isLoggedIn()) {
            cache.toolHistory[key] = [];
            supabaseClient.from('tool_history').delete().eq('user_id', cache.id).eq('tool_key', key)
                .then(({ error }) => { if (error) console.warn('[MV] Verlauf löschen fehlgeschlagen:', error.message); });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = [];
            saveGuestToolHistoryStore(store);
        }
    }

    // ==========================================================================
    // USERNAME-PRÜFUNG
    // ==========================================================================

    const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;
    const RESERVED_USERNAMES = ['admin', 'test', 'max_mustermann', 'mathverse', 'moderator'];

    function isUsernameFormatValid(username) { return !!username && USERNAME_REGEX.test(username); }
    function isUsernameReserved(username) { return !!username && RESERVED_USERNAMES.includes(username.toLowerCase()); }

    // WICHTIG: jetzt async (vorher synchron) - siehe Zusammenfassung/Risiken.
    async function isUsernameTaken(username, excludeUsername = null) {
        if (!username) return false;
        if (excludeUsername && username.toLowerCase() === excludeUsername.toLowerCase()) return false;
        const { data, error } = await supabaseClient.rpc('is_username_available', { check_name: username });
        if (error) {
            console.warn('[MV] Verfügbarkeitsprüfung fehlgeschlagen:', error.message);
            return false; // im Zweifel nicht blockieren - harte Prüfung erfolgt ohnehin serverseitig beim Signup
        }
        return data === false;
    }

    function getPasswordStrength(pw) {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 8) score++;
        if (pw.length >= 12) score++;
        if (pw.length >= 16) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(4, Math.max(1, Math.ceil(score / 1.5)));
    }

    // ==========================================================================
    // PASSWORT-RESET (nativ, Supabase Auth)
    // ==========================================================================

    async function requestPasswordReset(email) {
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(
                (email || '').trim(),
                { redirectTo: window.MV_URL('html/reset-password.html') }
            );
            if (error) console.warn('[MV] Passwort-Reset-Anfrage:', error.message);
        } catch (err) {
            console.warn('[MV] Passwort-Reset-Anfrage fehlgeschlagen:', err && err.message);
        }
        return { requested: true };   // No-Enumeration: immer identische Antwort
    }

    async function resetPasswordWithToken(_token, newPassword) {
        // _token wird nicht mehr manuell geprüft: Supabase erkennt den Recovery-Link
        // automatisch aus der URL (detectSessionInUrl) und stellt eine befristete
        // Session her, BEVOR dieser Aufruf passiert.
        if (!newPassword || newPassword.length < 8) return { success: false, reason: 'weak_password' };
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) return { success: false, reason: error.message };
        return { success: true };
    }

    // ==========================================================================
    // E-MAIL-ÄNDERUNG (nativ, Option A)
    // ==========================================================================

        async function requestEmailChange(newEmail) {
        if (!isLoggedIn()) return { success: false, code: 'not_logged_in' };
        try {
            const { error } = await supabaseClient.auth.updateUser(
                { email: (newEmail || '').trim() },
                { emailRedirectTo: window.MV_URL('index.html') }
            );
            if (error) {
                // Rate Limit unterscheidbar machen – vorher lief es in dieselbe
                // generische Meldung wie "Adresse vergeben", weshalb Nutzer
                // endlos weitergetippt und die Sperre verlängert haben.
                const msg = (error.message || '').toLowerCase();
                const isRateLimited = error.status === 429 ||
                    msg.includes('rate limit') || msg.includes('you can only request');
                return { success: false, code: isRateLimited ? 'rate_limited' : 'invalid', reason: error.message };
            }
            return { success: true, confirmationSent: true };
        } catch (err) {
            return { success: false, code: 'network_error', reason: err && err.message };
        }
    }

    // Supabase führt eine angeforderte, noch nicht vollständig bestätigte
    // Adresse in auth.users.email_change / user.new_email. Der Client hat das
    // bisher nie gelesen – nach einem Reload war der Pending-State unsichtbar.
    async function getPendingEmailChange() {
        if (!isLoggedIn()) return null;
        try {
            const { data, error } = await supabaseClient.auth.getUser();
            if (error || !data || !data.user) return null;
            return data.user.new_email || null;
        } catch {
            return null;
        }
    }

    // ==========================================================================
    // LOGIN-PROMPT MODAL (unverändert, keine Supabase-Abhängigkeit)
    // ==========================================================================

    let modalReady = false;

    function injectModal() {
        if (modalReady) return;
        modalReady = true;

        const style = document.createElement('style');
        style.textContent = `
            .mv-modalOverlay { position: fixed; inset: 0; background: rgba(9, 9, 14, 0.85);
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; animation: mvFadeIn 0.15s ease; }
            .mv-modalBox { background: var(--bg-surface); border: 1px solid var(--border-glow);
                border-radius: var(--radius-md); padding: 2rem; max-width: 380px; width: 90%;
                box-shadow: 0 0 40px var(--glow-soft), var(--shadow-main);
                animation: mvScaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align: center; }
            .mv-modalTitle { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.6rem; }
            .mv-modalText { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
            .mv-modalActions { display: flex; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
            .mv-modalActions a, .mv-modalActions button {
                font-family: var(--font-main); border-radius: var(--radius-sm); padding: 0.55rem 1.2rem;
                font-size: 0.78rem; font-weight: 700; cursor: pointer; text-decoration: none;
                transition: all var(--transition-fast); border: 1px solid var(--border-color); }
            .mv-modalBtnPrimary { background-color: var(--border-glow); color: #fff; border: none; }
            .mv-modalBtnPrimary:hover { background-color: var(--accent-hover); box-shadow: 0 0 20px var(--glow-soft); }
            .mv-modalBtnSecondary { background: transparent; color: var(--text-secondary); }
            .mv-modalBtnSecondary:hover { color: var(--text-primary); border-color: var(--text-secondary); }
            @keyframes mvFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes mvScaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.className = 'mv-modalOverlay';
        overlay.id = 'mvLoginPromptModal';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="mv-modalBox">
                <h2 class="mv-modalTitle">Login required</h2>
                <p class="mv-modalText" id="mvLoginPromptText">Please log in to use this feature.</p>
                <div class="mv-modalActions">
                    <button class="mv-modalBtnSecondary" id="mvLoginPromptCancel">Cancel</button>
                    <a class="mv-modalBtnPrimary" href="${window.MV_BASE}/html/login.html">Log in</a>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', e => { if (e.target === overlay) hideLoginPrompt(); });
        overlay.querySelector('#mvLoginPromptCancel').addEventListener('click', hideLoginPrompt);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') hideLoginPrompt(); });
    }

    function hideLoginPrompt() {
        const overlay = document.getElementById('mvLoginPromptModal');
        if (overlay) overlay.style.display = 'none';
    }
    function showLoginPrompt(message) {
        injectModal();
        const overlay = document.getElementById('mvLoginPromptModal');
        const text = document.getElementById('mvLoginPromptText');
        if (message) text.textContent = message;
        overlay.style.display = 'flex';
    }

    // ==========================================================================
    // PUBLIC API
    // ==========================================================================
    window.MV = {
        THEMES, CURRENCIES,
        redirectIfLoggedIn, isLoggedIn, getCurrentUser, saveCurrentUser, updateCurrentUser, logout,
        getFavorites, setFavorites, toggleFavorite,
        getPinnedGroups, setPinnedGroups,
        getContainerOrders, setContainerOrders,
        getTheme, setTheme, getFontSize, setFontSize,
        getDesign, setDesign,
        getAngleMode, setAngleMode,
        applyTheme, applyFontSize, applyDesign,
        getCurrency, setCurrency, getCurrencySymbol, formatCurrency, formatCurrencyCompact,
        getDecimalPlaces, setDecimalPlaces,
        getToolHistory, addToolHistoryEntry, deleteToolHistoryEntry, clearToolHistory,
        getAllGuestToolHistory, clearGuestToolHistoryStore,
        getLiveResult, setLiveResult,
        getToolState, setToolState, getAllGuestToolStates,
        getPasswordStrength,
        showLoginPrompt, hideLoginPrompt,
        getUsername: () => (getCurrentUser()?.username) || 'Guest',
        getEmail: () => (getCurrentUser()?.email) || '',
        isUsernameTaken, isUsernameFormatValid, isUsernameReserved,
        registerUser, loginUser, deleteCurrentAccount, resendConfirmationEmail,
        verifyCurrentPassword, updateUsername, updatePassword,
        getAdvancedModes, setAdvancedModes, getAdvancedMode, toggleAdvancedMode,
        bindAdvancedToggle,
        requestPasswordReset, resetPasswordWithToken, isPasswordRecoverySession,
        requestEmailChange, getPendingEmailChange
    };

    // ==========================================================================
    // NAVBAR: Login/Register -> Useraccount-Link, wenn eingeloggt (unverändert)
    // ==========================================================================
    const navUserAreas = document.querySelectorAll('[id^="navUserArea"]');

    function changeNavUserArea() {
        if (!navUserAreas.length) return;
        const name = window.MV.getUsername();
        const displayName = name.length > 10 ? name.substring(0, 10) + '...' : name;

        navUserAreas.forEach(area => {
            const userAccount = document.createElement('a');
            userAccount.href = `${window.MV_BASE}/html/userArea.html`;
            userAccount.target = '_self';
            userAccount.classList.add('userAccount');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'userName';
            nameSpan.textContent = displayName;

            const icon = document.createElement('i');
            icon.className = 'fa fa-cog settings-icon';

            userAccount.append(nameSpan, icon);

            area.innerHTML = '';
            area.appendChild(userAccount);
        });
    }

    if (isLoggedIn() && navUserAreas.length) changeNavUserArea();

    // Zentrale Navbar-Synchronisierung – ausgelöst über mv:staterestore
    // (Logout im selben Tab, Cross-Tab-Änderungen, bfcache-Restore).
    function syncNavUserArea() {
        if (!navUserAreas.length) return;
        navUserAreas.forEach(area => {
            area.innerHTML = `
                <a href="${window.MV_BASE}/html/login.html" class="navTextBorder">Login</a>
                <a href="${window.MV_BASE}/html/register.html" class="navTextBorder">Register</a>`;
        });
        if (isLoggedIn()) changeNavUserArea();
    }

    // ==========================================================================
    // NAVBAR BURGER MENU (unverändert, keine Supabase-Abhängigkeit)
    // ==========================================================================
    (function fixSearchContainer() {
        document.querySelectorAll('[id^="searchInput"]').forEach(input => {
            if (!input.parentElement.classList.contains('searchContainer')) {
                input.parentElement.classList.add('searchContainer');
            }
        });
    })();

    function initNavBurger() {
        if (document.querySelector('.settingsLayout')) return;
        document.querySelectorAll('.navbar').forEach(setupNavBurgerFor);
    }

    function setupNavBurgerFor(navRow) {
        const burger = document.createElement('button');
        burger.className = 'navBurger';
        burger.setAttribute('aria-label', 'Open menu');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = `<span class="burgerLine"></span><span class="burgerLine"></span><span class="burgerLine"></span>`;
        navRow.appendChild(burger);

        function openMenu() {
            navRow.classList.add('nav-open');
            burger.classList.add('is-open');
            burger.setAttribute('aria-expanded', 'true');
            burger.setAttribute('aria-label', 'Close menu');
        }
        function closeMenu() {
            navRow.classList.remove('nav-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Open menu');
        }

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navRow.classList.contains('nav-open') ? closeMenu() : openMenu();
        });
        document.addEventListener('click', (e) => { if (!navRow.contains(e.target)) closeMenu(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
        navRow.querySelector('[id^="navUserArea"]')?.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
        navRow.querySelector('[id^="searchResults"]')?.addEventListener('click', closeMenu);
    }

    initNavBurger();

    const _mvPath = window.location.pathname;
    if (!_mvPath.includes('login') && !_mvPath.includes('register') &&
        !_mvPath.includes('forgot-password') && !_mvPath.includes('reset-password')) {
        sessionStorage.setItem('mv-return-url', window.location.href);
    }

    // ==========================================================================
    // ZENTRALES STATE-RESTORE-SIGNAL
    // ==========================================================================
    const RESTORE_STORAGE_KEYS = ['currentUser', 'isLoggedIn', 'mv-currency', 'mv-theme', 'mv-design', 'mv-fontsize', 'mv-decimalPlaces', 'mv-liveResult', 'mv-angleMode', 'mv-toolHistory'];

    function dispatchStateRestore() {
        window.dispatchEvent(new CustomEvent('mv:staterestore'));
    }

    window.addEventListener('storage', (e) => {
        if (!RESTORE_STORAGE_KEYS.includes(e.key)) return;
        applyTheme(getThemeInit());
        applyFontSize(getFontSizeInit());
        applyDesign(getDesignInit());
        loadMirrorSync();
        dispatchStateRestore();
    });

    // Zentrale Reaktion auf JEDES State-Restore-Signal (Logout, Cross-Tab-
    // Änderungen, bfcache-Restore) – hält die Navbar in jedem Fall konsistent.
    window.addEventListener('mv:staterestore', syncNavUserArea);

    window.addEventListener('pageshow', function (e) {
        if (!e.persisted) return;

        applyTheme(getThemeInit());
        applyFontSize(getFontSizeInit());
        applyDesign(getDesignInit());

        const path = window.location.pathname;

        if (path.endsWith('userArea.html') && !isLoggedIn()) {
            window.location.replace(window.MV_BASE + '/html/login.html');
            return;
        }

        const isAuthPage = path.includes('login') || path.includes('register') ||
            path.includes('forgot-password') || path.includes('reset-password') || path.includes('verify-email');

        if (isAuthPage && isLoggedIn()) {
            const returnUrl = sessionStorage.getItem('mv-return-url') || (window.MV_BASE + '/index.html');
            sessionStorage.removeItem('mv-return-url');
            window.location.replace(returnUrl);
            return;
        }

        // Navbar-Reset entfernt – läuft jetzt zentral über syncNavUserArea()
        // via mv:staterestore (siehe unten), ausgelöst durch dispatchStateRestore().
        hydrate();
        dispatchStateRestore();
    });

})();