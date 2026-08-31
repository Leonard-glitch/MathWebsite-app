
window.MV_BASE = ((document.currentScript || {}).src || '')
    .replace(/\/javaScript\/Common\/common-login\.js([?#].*)?$/, '');

(function () {

    const THEMES = {
        violet: { '--border-glow': '#8a16ff', '--accent-color': '#8a16ff', '--accent-hover': '#a142ff', '--glow-soft': 'rgba(138, 22, 255, 0.25)', '--glow-hard': 'rgba(138, 22, 255, 0.4)', '--border-accent': '#8a16ff' },
        cyan:   { '--border-glow': '#00e5b5', '--accent-color': '#00e5b5', '--accent-hover': '#00ffcc', '--glow-soft': 'rgba(0, 229, 181, 0.25)', '--glow-hard': 'rgba(0, 229, 181, 0.4)', '--border-accent': '#00e5b5' },
        blue:   { '--border-glow': '#1e90ff', '--accent-color': '#1e90ff', '--accent-hover': '#4dabff', '--glow-soft': 'rgba(30, 144, 255, 0.25)', '--glow-hard': 'rgba(30, 144, 255, 0.4)', '--border-accent': '#1e90ff' },
        pink:   { '--border-glow': '#ff2d78', '--accent-color': '#ff2d78', '--accent-hover': '#ff5e97', '--glow-soft': 'rgba(255, 45, 120, 0.25)', '--glow-hard': 'rgba(255, 45, 120, 0.4)', '--border-accent': '#ff2d78' },
        orange: { '--border-glow': '#ff6a00', '--accent-color': '#ff6a00', '--accent-hover': '#ff8c33', '--glow-soft': 'rgba(255, 106, 0, 0.25)', '--glow-hard': 'rgba(255, 106, 0, 0.4)', '--border-accent': '#ff6a00' },
        gold:   { '--border-glow': '#f5c518', '--accent-color': '#f5c518', '--accent-hover': '#f7d04e', '--glow-soft': 'rgba(245, 197, 24, 0.25)', '--glow-hard': 'rgba(245, 197, 24, 0.4)', '--border-accent': '#f5c518' },
    };

    const DESIGNS = {
    abyss: {
        '--bg-body':         '#09090e',
        '--bg-surface':      '#0b1528',
        '--bg-surface-glow': '#142036',
        '--bg-input':        '#05060c',
        '--bg-navbar':       'rgba(9, 9, 14, 0.75)',
        '--border-color':    '#1c2740',
        '--text-primary':    '#f3f4f6',
        '--text-secondary':  '#8f8fbc',
        '--text-muted':      '#44496a',
        '--shadow-main':     '0 10px 30px rgba(0, 0, 0, 0.6)',
        '--accent-live':  '#00ffcc',
        '--accent-error': '#ff2a5f',
        '--glow-live':    'rgba(0, 255, 204, 0.2)',
        '--glow-error':   'rgba(255, 42, 95, 0.35)',
    },
    dark: {
        '--bg-body':         '#121214',
        '--bg-surface':      '#1a1a1e',
        '--bg-surface-glow': '#232328',
        '--bg-input':        '#0e0e10',
        '--bg-navbar':       'rgba(18, 18, 20, 0.75)',
        '--border-color':    '#2a2a30',
        '--text-primary':    '#ffffff',
        '--text-secondary':  '#a0a0ab',
        '--text-muted':      '#5a5a64',
        '--shadow-main':     '0 10px 30px rgba(0, 0, 0, 0.6)',
        '--accent-live':  '#00ffcc',
        '--accent-error': '#ff2a5f',
        '--glow-live':    'rgba(0, 255, 204, 0.2)',
        '--glow-error':   'rgba(255, 42, 95, 0.35)',
    },
    light: {
        '--bg-body':         '#f8fafc',
        '--bg-surface':      '#ffffff',
        '--bg-surface-glow': '#f1f3f6',
        '--bg-input':        '#f3f4f7',
        '--bg-navbar':       'rgba(255, 255, 255, 0.75)',
        '--border-color':    '#e2e4ea',
        '--text-primary':    '#0f172a',
        '--text-secondary':  '#51566b',
        '--text-muted':      '#9598a8',
        '--shadow-main':     '0 10px 30px rgba(15, 23, 42, 0.08)',
        '--accent-live':  '#0c7c69',
        '--accent-error': '#dc2626',
        '--glow-live':    'rgba(12, 124, 105, 0.18)',
        '--glow-error':   'rgba(220, 38, 38, 0.18)',
    }
};

    // Top-10-Währungen für Finanz-Tools (weltweite Nutzung). Locale bleibt
    // fest 'de-DE' (Zahlenformat der restlichen Seite), nur der Currency-Code
    // wechselt – siehe formatCurrency() weiter unten.
    const CURRENCIES = {
        EUR: 'Euro',
        USD: 'US Dollar',
        GBP: 'British Pound',
        JPY: 'Japanese Yen',
        CHF: 'Swiss Franc',
        CAD: 'Canadian Dollar',
        AUD: 'Australian Dollar',
        CNY: 'Chinese Yuan',
        INR: 'Indian Rupee',
        BRL: 'Brazilian Real'
    };

    // Schema für currentUser anpassen (Standard auf 'abyss')
    const DEFAULT_USER = () => ({
        username: 'Gast',
        email: '',
        password: '',
        favoriten: [],
        pinnedGroups: [],
        containerOrders: {},
        advancedModes: {},
        theme: 'violet',
        design: 'abyss',
        fontsize: 20,
        currency: 'EUR',
        decimalPlaces: 2,
        liveResult: false,
        angleMode: 'deg',
        toolHistory: {},
        isPro: false,

        createdAt: null
    });



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

    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('currentUser');
    }

    function getCurrentUser() {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser'));
            return u ? { ...DEFAULT_USER(), ...u } : null;
        } catch {
            return null;
        }
    }

    function saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    function updateCurrentUser(patch) {
        const user = getCurrentUser() || DEFAULT_USER();
        const updated = { ...user, ...patch };
        saveCurrentUser(updated);

        // Änderungen auch in der "Datenbank" (allUsers) spiegeln
        const users = getAllUsers();
        const idx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...patch };
            saveAllUsers(users);
        }

        return updated;
    }

    function logout() {
    // allUsers bleibt unberührt – Account & Daten existieren weiterhin.
    // currentUser wird beim nächsten Login wieder aus allUsers geladen.
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    }


    // ==========================================================================
    // "DATENBANK"-SIMULATION: allUsers (alle registrierten Accounts)
    // -> currentUser bleibt der "eingeloggte" Account, allUsers ist die
    //    komplette User-Tabelle. Spätere echte DB kann hier 1:1 andocken.
    // ==========================================================================
    const ALL_USERS_KEY = 'allUsers';

    function getAllUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(ALL_USERS_KEY));
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }

    function saveAllUsers(users) {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }

    function findUserByUsername(username) {
        if (!username) return undefined;
        return getAllUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    function findUserByEmail(email) {
        if (!email) return undefined;
        return getAllUsers().find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    }

    function findUserByUsernameOrEmail(identifier) {
        if (!identifier) return undefined;
        const id = identifier.toLowerCase();
        return getAllUsers().find(u =>
            u.username.toLowerCase() === id || (u.email && u.email.toLowerCase() === id)
        );
    }

    // excludeUsername: erlaubt einem User, seinen EIGENEN Namen/seine
    // EIGENE Mail beim Bearbeiten zu "behalten", ohne dass er sich
    // selbst als "vergeben" meldet.
    function isUsernameTaken(username, excludeUsername = null) {
        if (!username) return false;
        return getAllUsers().some(u =>
            u.username.toLowerCase() === username.toLowerCase() &&
            (!excludeUsername || u.username.toLowerCase() !== excludeUsername.toLowerCase())
        );
    }

    function isEmailTaken(email, excludeUsername = null) {
        if (!email) return false;
        return getAllUsers().some(u =>
            u.email && u.email.toLowerCase() === email.toLowerCase() &&
            (!excludeUsername || u.username.toLowerCase() !== excludeUsername.toLowerCase())
        );
    }

    // Registriert einen neuen User in "allUsers" und loggt ihn direkt ein
    function registerUser(userData) {
        const newUser = { ...DEFAULT_USER(), ...userData };
        const users = getAllUsers();
        users.push(newUser);
        saveAllUsers(users);

        saveCurrentUser(newUser);
        localStorage.setItem('isLoggedIn', 'true');
        return newUser;
    }

    // Prüft Zugangsdaten gegen "allUsers" und loggt bei Erfolg ein
    function loginUser(identifier, password) {
        const user = findUserByUsernameOrEmail(identifier);
        if (!user) return { success: false, reason: 'notfound' };
        if ((user.password || '') !== password) return { success: false, reason: 'wrongpassword' };

        saveCurrentUser(user);
        localStorage.setItem('isLoggedIn', 'true');
        return { success: true, user };
    }

    // Löscht den aktuell eingeloggten Account vollständig aus "allUsers"
    function deleteCurrentAccount() {
        const user = getCurrentUser();
        if (user) {
            const users = getAllUsers().filter(
                u => u.username.toLowerCase() !== user.username.toLowerCase()
            );
            saveAllUsers(users);
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
    }

    // ==========================================================================
    // FAVORITEN / GRUPPEN-PINS / CONTAINER-REIHENFOLGE
    // -> nur verfügbar, wenn eingeloggt (siehe Punkt 1 der Anfrage)
    // ==========================================================================
    function getFavorites() {
        const u = getCurrentUser();
        return (isLoggedIn() && u) ? (u.favoriten || []) : [];
    }
    function setFavorites(arr) {
        if (!isLoggedIn()) return;
        updateCurrentUser({ favoriten: arr });
    }
    function toggleFavorite(id) {
        if (!isLoggedIn()) return false;
        const favs = getFavorites();
        const isFav = favs.includes(id);
        const updated = isFav ? favs.filter(f => f !== id) : [...favs, id];
        setFavorites(updated);
        return !isFav;
    }

    function getPinnedGroups() {
    const u = getCurrentUser();
    if (window.MV.isLoggedIn() && u) {
        // Prüfen, ob der User das Array schon initialisiert hat.
        // Wenn nicht (undefined), gib standardmäßig die Favoriten zurück.
        return u.pinnedGroups !== undefined ? u.pinnedGroups : ["favoritenGroupStar"];
    }
    // Für nicht eingeloggte Gäste immer die Favoriten als angepinnt zurückgeben
    return ["favoritenGroupStar"];
}
    function setPinnedGroups(arr) {
        if (!isLoggedIn()) return;
        updateCurrentUser({ pinnedGroups: arr });
    }

    function getContainerOrders() {
        const u = getCurrentUser();
        return (isLoggedIn() && u) ? (u.containerOrders || {}) : {};
    }
    function setContainerOrders(obj) {
        if (!isLoggedIn()) return;
        updateCurrentUser({ containerOrders: obj });
    }


    // ==========================================================================
    // ADVANCED MODES – pro Tool ein eigener Eintrag, NUR eingeloggt nutzbar
    // (gleiche Logik wie Favoriten)
    // ==========================================================================
    function getAdvancedModes() {
        const u = getCurrentUser();
        return (isLoggedIn() && u) ? (u.advancedModes || {}) : {};
    }
    function setAdvancedModes(obj) {
        if (!isLoggedIn()) return;
        updateCurrentUser({ advancedModes: obj });
    }
    function getAdvancedMode(key) {
        return !!getAdvancedModes()[key];
    }
    function toggleAdvancedMode(key) {
        if (!isLoggedIn()) return false;
        const modes = getAdvancedModes();
        const newVal = !modes[key];
        setAdvancedModes({ ...modes, [key]: newVal });
        return newVal;
    }

    // Bindet eine Advanced-Mode-Checkbox an Login-Status + eigenen Speicherplatz.
    // key      = eindeutiger Bezeichner DIESES Tools/Switches, z.B. "einheitenUmrechner"
    // onChange = wird nach jeder Statusänderung (auch beim Initial-Load) aufgerufen
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

        // Cross-Tab-Sync (Login/Logout in anderem Tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser' || e.key === 'isLoggedIn') applyState();
        });
    }

    // ==========================================================================
    // THEME & SCHRIFTGRÖSSE
    // Eingeloggt -> Teil von currentUser. Nicht eingeloggt -> lokale
    // Geräte-Einstellung (eigener Key), damit es trotzdem funktioniert.
    // ==========================================================================
    function getTheme() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.theme) return u.theme;
        return localStorage.getItem('mv-theme') || 'violet';
    }
    function setTheme(theme) {
        if (isLoggedIn()) {
            updateCurrentUser({ theme });
        } else {
            localStorage.setItem('mv-theme', theme);
        }
    }
    function getFontSize() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.fontsize) return parseInt(u.fontsize, 10);
        return parseInt(localStorage.getItem('mv-fontsize') || '20', 10);
    }
    function setFontSize(size) {
        if (isLoggedIn()) {
            updateCurrentUser({ fontsize: size });
        } else {
            localStorage.setItem('mv-fontsize', String(size));
        }
    }
    function applyTheme(themeName) {
        const vars = THEMES[themeName] || THEMES.violet;
        Object.entries(vars).forEach(([key, val]) =>
            document.documentElement.style.setProperty(key, val)
        );
    }
    function applyFontSize(size) {
    const isMobile = window.innerWidth <= 768;
    const effective = isMobile ? Math.min(size, 20) : size;
    document.documentElement.style.fontSize = `${effective}px`;
    }

    // ==========================================================================
    // DESIGN (Hintergrund- und Textfarben) – gleiche Logik wie Theme, aber
    // eigenständiger Speicher
    // ==========================================================================

    function getDesign() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.design) return u.design;
        return localStorage.getItem('mv-design') || 'abyss'; // Standard: abyss
    }

    function setDesign(design) {
        if (isLoggedIn()) {
            updateCurrentUser({ design });
        } else {
            localStorage.setItem('mv-design', design);
        }
    }

    function applyDesign(designName) {
        // Holt die CSS-Variablen aus dem DESIGNS-Objekt (Fallback zu abyss)
        const vars = DESIGNS[designName] || DESIGNS.abyss;
        Object.entries(vars).forEach(([key, val]) =>
            document.documentElement.style.setProperty(key, val)
        );
    }

    // ==========================================================================
    // WÄHRUNG – gleiche Logik wie Theme/Design (global, nicht pro-Tool wie die
    // Advanced Modes), damit künftige Finanz-Tools dieselbe Einstellung nutzen.
    // ==========================================================================

    function getCurrency() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.currency) return u.currency;
        return localStorage.getItem('mv-currency') || 'EUR';
    }

    function setCurrency(code) {
        if (isLoggedIn()) {
            updateCurrentUser({ currency: code });
        } else {
            localStorage.setItem('mv-currency', code);
        }
    }

    // Reines Symbol/Kürzel der aktuellen Währung (z.B. "€", "$") – für
    // Einheiten-Labels neben Eingabefeldern, ohne vollen Zahlenwert.
    function getCurrencySymbol() {
        const parts = new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency() }).formatToParts(0);
        const symbolPart = parts.find(p => p.type === 'currency');
        return symbolPart ? symbolPart.value : getCurrency();
    }

    // Formatiert einen Betrag in der gespeicherten Währung. Locale bleibt
    // 'de-DE'; Nachkommastellen richten sich nach der jeweiligen Währung
    // (z.B. 0 bei Yen), statt sie hart auf 2 zu erzwingen.
    function formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency() }).format(amount);
    }

    // Kompakte Variante ohne Nachkommastellen, für Achsenbeschriftungen/Range-Labels.
    function formatCurrencyCompact(amount) {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: getCurrency(), maximumFractionDigits: 0 }).format(amount);
    }

    // ==========================================================================
    // NACHKOMMASTELLEN (Geometrie Rechner u.a.) – gleiche Logik wie Währung
    // ==========================================================================

    function getDecimalPlaces() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.decimalPlaces !== undefined) return parseInt(u.decimalPlaces, 10);
        return parseInt(localStorage.getItem('mv-decimalPlaces') || '2', 10);
    }

    function setDecimalPlaces(count) {
        if (isLoggedIn()) {
            updateCurrentUser({ decimalPlaces: count });
        } else {
            localStorage.setItem('mv-decimalPlaces', String(count));
        }
    }

    // ==========================================================================
    // TOOL-ZUSTAND (z.B. zuletzt gewählte Einheiten/Kategorien pro Tool) –
    // gleiche Login/Gast-Logik wie Währung/Nachkommastellen, aber generisch:
    // jedes Tool bekommt unter seinem eigenen Key ein beliebiges,
    // JSON-serialisierbares Objekt.
    // ==========================================================================

    function getToolState(toolKey, fallback = null) {
        if (isLoggedIn()) {
            const u = getCurrentUser();
            return (u && u.toolStates && u.toolStates[toolKey] !== undefined) ? u.toolStates[toolKey] : fallback;
        }
        try {
            const raw = localStorage.getItem('mv-toolstate-' + toolKey);
            return raw !== null ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function setToolState(toolKey, stateObj) {
        if (isLoggedIn()) {
            const u = getCurrentUser() || DEFAULT_USER();
            const toolStates = { ...(u.toolStates || {}), [toolKey]: stateObj };
            updateCurrentUser({ toolStates });
        } else {
            try {
                localStorage.setItem('mv-toolstate-' + toolKey, JSON.stringify(stateObj));
            } catch {
                /* Speicher voll oder deaktiviert – kein Blocker */
            }
        }
    }

    // Liest alle als Gast gespeicherten Tool-Zustände aus localStorage – wird
    // bei der Registrierung genutzt, um sie in den neuen Account zu übernehmen
    // (gleiches Migrations-Prinzip wie bei Währung/Nachkommastellen in register.js).
    function getAllGuestToolStates() {
        const result = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('mv-toolstate-')) continue;
            try {
                result[key.slice('mv-toolstate-'.length)] = JSON.parse(localStorage.getItem(key));
            } catch {
                /* einzelner defekter Eintrag – überspringen statt Migration abzubrechen */
            }
        }
        return result;
    }


    function getLiveResult() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.liveResult !== undefined) return !!u.liveResult;
        const stored = localStorage.getItem('mv-liveResult');
        return stored === null ? false : stored === 'true';
    }

    function setLiveResult(value) {
        if (isLoggedIn()) {
            updateCurrentUser({ liveResult: value });
        } else {
            localStorage.setItem('mv-liveResult', String(!!value));
        }
    }

    function getAngleMode() {
        const u = getCurrentUser();
        if (isLoggedIn() && u && u.angleMode) return u.angleMode;
        return localStorage.getItem('mv-angleMode') || 'deg';
    }

    function setAngleMode(mode) {
        if (isLoggedIn()) {
            updateCurrentUser({ angleMode: mode });
        } else {
            localStorage.setItem('mv-angleMode', mode);
        }
    }

    const GUEST_HISTORY_KEY = 'mv-toolHistory';
    const HISTORY_LIMIT = 50;

    function getGuestToolHistoryStore() {
        try {
            const store = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY));
            return (store && typeof store === 'object') ? store : {};
        } catch {
            return {};
        }
    }

    function saveGuestToolHistoryStore(store) {
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(store));
    }

    // Verlauf wird IMMER aufgezeichnet, unabhängig vom Login-Status – nur das
    // ANZEIGEN ist login-abhängig (Prüfung erfolgt Tool-seitig, siehe matheRechner.js).
    function getToolHistory(key) {
        if (isLoggedIn()) {
            const u = getCurrentUser();
            return (u && u.toolHistory && u.toolHistory[key]) || [];
        }
        return getGuestToolHistoryStore()[key] || [];
    }

    function addToolHistoryEntry(key, entry) {
        const fullEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...entry };

        if (isLoggedIn()) {
            const u = getCurrentUser();
            const history = { ...(u.toolHistory || {}) };
            history[key] = [...(history[key] || []), fullEntry].slice(-HISTORY_LIMIT);
            updateCurrentUser({ toolHistory: history });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = [...(store[key] || []), fullEntry].slice(-HISTORY_LIMIT);
            saveGuestToolHistoryStore(store);
        }
        return fullEntry;
    }

    function deleteToolHistoryEntry(key, id) {
        if (isLoggedIn()) {
            const u = getCurrentUser();
            const history = { ...(u.toolHistory || {}) };
            history[key] = (history[key] || []).filter(e => e.id !== id);
            updateCurrentUser({ toolHistory: history });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = (store[key] || []).filter(e => e.id !== id);
            saveGuestToolHistoryStore(store);
        }
    }

    function clearToolHistory(key) {
        if (isLoggedIn()) {
            const u = getCurrentUser();
            const history = { ...(u.toolHistory || {}) };
            history[key] = [];
            updateCurrentUser({ toolHistory: history });
        } else {
            const store = getGuestToolHistoryStore();
            store[key] = [];
            saveGuestToolHistoryStore(store);
        }
    }

    // Für die Registrierung: kompletter Gast-Verlauf aller Tools zur Übernahme in den neuen Account.
    function getAllGuestToolHistory() {
        return getGuestToolHistoryStore();
    }

    function clearGuestToolHistoryStore() {
        localStorage.removeItem(GUEST_HISTORY_KEY);
    }

    function getPasswordStrength(pw) {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 8)  score++;
        if (pw.length >= 12) score++;
        if (pw.length >= 16) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return Math.min(4, Math.max(1, Math.ceil(score / 1.5)));
    }


    // ==========================================================================
    // PASSWORT VERGESSEN – Reset-Token-Verwaltung
    //
    // WICHTIG FÜR DIE SPÄTERE BACKEND-ANBINDUNG (Supabase + Resend):
    // Diese Simulation läuft komplett im Browser (localStorage) und ersetzt
    // später einen echten Server-Endpunkt. Beim Umstieg:
    //   1. requestPasswordReset() wird zu einem Aufruf einer Supabase Edge
    //      Function / API-Route, die serverseitig:
    //        - den Token generiert und NUR gehasht in der DB speichert,
    //        - eine E-Mail über Resend mit dem Reset-Link verschickt,
    //        - IMMER dieselbe Antwort liefert, egal ob die Adresse existiert
    //          (verhindert User-Enumeration),
    //        - Rate-Limiting serverseitig durchsetzt (hier nur clientseitig
    //          und rein kosmetisch).
    //   2. validatePasswordResetToken() / resetPasswordWithToken() werden zu
    //      Supabase-Abfragen, die den gehashten Token serverseitig vergleichen.
    //   3. Der console.info()-Aufruf mit dem Klartext-Link MUSS entfernt
    //      werden, sobald Resend echte E-Mails verschickt.
    // ==========================================================================

    const PASSWORD_RESETS_KEY   = 'mv-passwordResets';
    const RESET_TOKEN_TTL_MS    = 60 * 60 * 1000; // 1 Stunde gültig
    const RESET_RATE_LIMIT_MS   = 60 * 1000;      // 1 Anfrage pro Minute und E-Mail
    const RESET_RATE_LIMIT_KEY  = 'mv-resetRateLimit';

    function getPasswordResets() {
        try {
            const arr = JSON.parse(localStorage.getItem(PASSWORD_RESETS_KEY));
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    function savePasswordResets(arr) {
        localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(arr));
    }

    // Entfernt abgelaufene Einträge, damit der Speicher nicht unbegrenzt wächst
    // (in einer echten DB würde das ein TTL-Index übernehmen).
    function pruneExpiredResets() {
        const now = Date.now();
        const remaining = getPasswordResets().filter(r => !r.used && r.expiresAt > now);
        savePasswordResets(remaining);
        return remaining;
    }

    function generateRawToken() {
        const bytes = new Uint8Array(32);
        (window.crypto || window.msCrypto).getRandomValues(bytes);
        let binary = '';
        bytes.forEach(b => { binary += String.fromCharCode(b); });
        // Base64url ohne Padding – URL-sicher als Query-Parameter
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    async function hashResetToken(token) {
        if (window.crypto && window.crypto.subtle) {
            const data = new TextEncoder().encode(token);
            const digest = await window.crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Fallback ohne Web Crypto API (z.B. kein sicherer Kontext) – deutlich
        // schwächer, nur als Notlösung. Entfällt komplett mit dem Supabase-Umstieg.
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
        }
        return 'fallback-' + hash.toString(16);
    }

    // Rein clientseitiges Rate-Limiting, KEIN Ersatz für serverseitiges
    // Rate-Limiting (folgt mit Supabase). Absichtlich lautlos gegenüber dem
    // Nutzer, damit es nicht zur Unterscheidung "E-Mail existiert" missbraucht
    // werden kann.
    function isResetRateLimited(emailLower) {
        try {
            const store = JSON.parse(localStorage.getItem(RESET_RATE_LIMIT_KEY)) || {};
            const last = store[emailLower];
            return !!last && (Date.now() - last) < RESET_RATE_LIMIT_MS;
        } catch {
            return false;
        }
    }

    function markResetRateLimit(emailLower) {
        try {
            const store = JSON.parse(localStorage.getItem(RESET_RATE_LIMIT_KEY)) || {};
            store[emailLower] = Date.now();
            localStorage.setItem(RESET_RATE_LIMIT_KEY, JSON.stringify(store));
        } catch { /* Speicher voll o.ä. – kein Blocker */ }
    }

    // Fordert einen Passwort-Reset an. Liefert bewusst keine unterschiedlichen
    // Signale nach außen, je nachdem ob die E-Mail existiert – siehe
    // forgot-password.js, das immer dieselbe Meldung anzeigt.
    async function requestPasswordReset(identifierEmail) {
        const emailLower = (identifierEmail || '').trim().toLowerCase();
        if (!emailLower) return { requested: false };

        if (isResetRateLimited(emailLower)) return { requested: false };
        markResetRateLimit(emailLower);

        const user = findUserByEmail(emailLower);
        if (!user) return { requested: false }; // bewusst kein Unterschied nach außen

        // Alle noch gültigen Tokens für diesen Account entwerten – es soll
        // immer nur maximal ein aktiver Reset-Link existieren.
        const resets = pruneExpiredResets().filter(r => r.usernameLower !== user.username.toLowerCase());

        const rawToken = generateRawToken();
        const tokenHash = await hashResetToken(rawToken);

        resets.push({
            usernameLower: user.username.toLowerCase(),
            tokenHash,
            expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
            used: false,
            createdAt: Date.now()
        });
        savePasswordResets(resets);

        const resetLink = `${window.MV_BASE}/html/reset-password.html?token=${encodeURIComponent(rawToken)}`;

        // ── TODO (Resend-Integration) ────────────────────────────────────────
        // Hier muss später ein Aufruf an eine Supabase Edge Function o.ä. hin,
        // die den Reset-Link per Resend an user.email verschickt. Bis dahin nur
        // Konsolen-Ausgabe zum lokalen Testen – NIEMALS so in Produktion lassen!
        console.info('[DEV ONLY – wird durch Resend ersetzt] Passwort-Reset-Link:', resetLink);

        return { requested: true, devResetLink: resetLink };
    }

    async function validatePasswordResetToken(token) {
        if (!token) return { valid: false, reason: 'missing' };
        const tokenHash = await hashResetToken(token);
        const resets = pruneExpiredResets();
        const record = resets.find(r => r.tokenHash === tokenHash && !r.used);
        if (!record) return { valid: false, reason: 'invalid_or_expired' };
        return { valid: true, usernameLower: record.usernameLower };
    }

    async function resetPasswordWithToken(token, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, reason: 'weak_password' };
        }

        const check = await validatePasswordResetToken(token);
        if (!check.valid) return { success: false, reason: check.reason };

        const users = getAllUsers();
        const idx = users.findIndex(u => u.username.toLowerCase() === check.usernameLower);
        if (idx === -1) return { success: false, reason: 'user_not_found' };

        users[idx] = { ...users[idx], password: newPassword };
        saveAllUsers(users);

        // Falls der Account gerade in diesem Browser eingeloggt ist, auch
        // currentUser aktualisieren.
        const current = getCurrentUser();
        if (current && current.username.toLowerCase() === check.usernameLower) {
            saveCurrentUser({ ...current, password: newPassword });
        }

        // Alle Reset-Tokens dieses Accounts entwerten – nach einem erfolgreichen
        // Reset sind alte Links tot.
        const remaining = getPasswordResets().filter(r => r.usernameLower !== check.usernameLower);
        savePasswordResets(remaining);

        return { success: true };
    }

        // ==========================================================================
    // EMAIL CHANGE – Verification Code Management (mirrors the password reset
    // flow above in security level: hashed codes, expiry, rate limiting)
    //
    // IMPORTANT FOR THE LATER BACKEND MIGRATION (Supabase + Resend):
    // This simulation runs entirely in the browser (localStorage) and stands
    // in for a real server endpoint. When migrating:
    //   1. requestEmailChange() becomes a call to a Supabase Edge Function
    //      that generates the code server-side, stores it ONLY hashed, and
    //      sends it to the NEW address via Resend.
    //   2. verifyEmailChangeCode() becomes a server-side comparison of the
    //      hashed code.
    //   3. The console.info() call with the plaintext code MUST be removed
    //      once Resend sends real emails.
    // ==========================================================================

    const EMAIL_CHANGES_KEY = 'mv-emailChanges';
    const EMAIL_CHANGE_CODE_TTL_MS = 15 * 60 * 1000; // valid for 15 minutes
    const EMAIL_CHANGE_RATE_LIMIT_MS = 60 * 1000;    // 1 request per minute per account
    const EMAIL_CHANGE_RATE_LIMIT_KEY = 'mv-emailChangeRateLimit';
    const EMAIL_CHANGE_MAX_ATTEMPTS = 5; // protects against guessing the 6-digit code

    function getEmailChanges() {
        try {
            const arr = JSON.parse(localStorage.getItem(EMAIL_CHANGES_KEY));
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    function saveEmailChanges(arr) {
        localStorage.setItem(EMAIL_CHANGES_KEY, JSON.stringify(arr));
    }

    function pruneExpiredEmailChanges() {
        const now = Date.now();
        const remaining = getEmailChanges().filter(r => !r.used && r.expiresAt > now);
        saveEmailChanges(remaining);
        return remaining;
    }

    function generateEmailCode() {
        const bytes = new Uint32Array(1);
        (window.crypto || window.msCrypto).getRandomValues(bytes);
        return String(bytes[0] % 1000000).padStart(6, '0');
    }

    function isEmailChangeRateLimited(usernameLower) {
        try {
            const store = JSON.parse(localStorage.getItem(EMAIL_CHANGE_RATE_LIMIT_KEY)) || {};
            const last = store[usernameLower];
            return !!last && (Date.now() - last) < EMAIL_CHANGE_RATE_LIMIT_MS;
        } catch {
            return false;
        }
    }

    function markEmailChangeRateLimit(usernameLower) {
        try {
            const store = JSON.parse(localStorage.getItem(EMAIL_CHANGE_RATE_LIMIT_KEY)) || {};
            store[usernameLower] = Date.now();
            localStorage.setItem(EMAIL_CHANGE_RATE_LIMIT_KEY, JSON.stringify(store));
        } catch { /* storage full or disabled – not a blocker */ }
    }

    // Step 1: request a new address -> a code is sent to the NEW address
    // (confirms the user actually has access to that inbox). The current
    // password is checked beforehand in userArea.js (proof of account
    // ownership); isLoggedIn() here is a second, server-side-equivalent check.
    async function requestEmailChange(newEmail) {
        if (!isLoggedIn()) return { success: false, reason: 'not_logged_in' };
        const user = getCurrentUser();
        if (!user) return { success: false, reason: 'not_logged_in' };

        const emailLower = (newEmail || '').trim().toLowerCase();
        if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
            return { success: false, reason: 'invalid_email' };
        }
        if (emailLower === (user.email || '').toLowerCase()) {
            return { success: false, reason: 'same_email' };
        }
        if (isEmailTaken(emailLower, user.username)) {
            return { success: false, reason: 'email_taken' };
        }

        const usernameLower = user.username.toLowerCase();
        if (isEmailChangeRateLimited(usernameLower)) {
            return { success: false, reason: 'rate_limited' };
        }
        markEmailChangeRateLimit(usernameLower);

        // Invalidate any previous, still-open request for this account –
        // only one active code should exist at a time.
        const changes = pruneExpiredEmailChanges().filter(r => r.usernameLower !== usernameLower);

        const rawCode = generateEmailCode();
        const codeHash = await hashResetToken(rawCode);

        changes.push({
            usernameLower,
            newEmail: emailLower,
            codeHash,
            expiresAt: Date.now() + EMAIL_CHANGE_CODE_TTL_MS,
            used: false,
            attempts: 0,
            createdAt: Date.now()
        });
        saveEmailChanges(changes);

        // ── TODO (Resend integration) ────────────────────────────────────────
        // This needs to call a Supabase Edge Function or similar later, which
        // sends the code to the NEW address via Resend. Console output only
        // for local testing until then – NEVER leave this in production!
        console.info('[DEV ONLY – will be replaced by Resend] Email change code for', emailLower + ':', rawCode);

        return { success: true, devCode: rawCode, expiresInMs: EMAIL_CHANGE_CODE_TTL_MS };
    }

    // Step 2: verify the code and apply the new email address on success
    async function verifyEmailChangeCode(code) {
        if (!isLoggedIn()) return { success: false, reason: 'not_logged_in' };
        const user = getCurrentUser();
        if (!user) return { success: false, reason: 'not_logged_in' };

        const usernameLower = user.username.toLowerCase();
        const changes = pruneExpiredEmailChanges();
        const record = changes.find(r => r.usernameLower === usernameLower && !r.used);

        if (!record) return { success: false, reason: 'no_pending_request' };

        if (record.attempts >= EMAIL_CHANGE_MAX_ATTEMPTS) {
            saveEmailChanges(changes.filter(r => r !== record));
            return { success: false, reason: 'too_many_attempts' };
        }

        const inputHash = await hashResetToken((code || '').trim());
        if (inputHash !== record.codeHash) {
            record.attempts += 1;
            saveEmailChanges(changes);
            return { success: false, reason: 'invalid_code', attemptsLeft: EMAIL_CHANGE_MAX_ATTEMPTS - record.attempts };
        }

        // Code correct -> apply the email address and remove the request
        // (only one active attempt is allowed per account, so a separate
        // "used" flag would be redundant).
        saveEmailChanges(changes.filter(r => r !== record));
        updateCurrentUser({ email: record.newEmail });

        return { success: true, newEmail: record.newEmail };
    }

    // Discards a still-open request (e.g. when the user cancels the modal).
    function cancelPendingEmailChange() {
        const user = getCurrentUser();
        if (!user) return;
        const usernameLower = user.username.toLowerCase();
        saveEmailChanges(getEmailChanges().filter(r => r.usernameLower !== usernameLower));
    }

    let modalReady = false;

    function injectModal() {
        if (modalReady) return;
        modalReady = true;

        const style = document.createElement('style');
        style.textContent = `
            .mv-modalOverlay {
                position: fixed; inset: 0;
                background: rgba(9, 9, 14, 0.85);
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; animation: mvFadeIn 0.15s ease;
            }
            .mv-modalBox {
                background: var(--bg-surface);
                border: 1px solid var(--border-glow);
                border-radius: var(--radius-md);
                padding: 2rem; max-width: 380px; width: 90%;
                box-shadow: 0 0 40px var(--glow-soft), var(--shadow-main);
                animation: mvScaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                text-align: center;
            }
            .mv-modalTitle { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.6rem; }
            .mv-modalText { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
            .mv-modalActions { display: flex; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
            .mv-modalActions a, .mv-modalActions button {
                font-family: var(--font-main);
                border-radius: var(--radius-sm);
                padding: 0.55rem 1.2rem;
                font-size: 0.78rem; font-weight: 700;
                cursor: pointer; text-decoration: none;
                transition: all var(--transition-fast);
                border: 1px solid var(--border-color);
            }
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
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', e => { if (e.target === overlay) hideLoginPrompt(); });
        overlay.querySelector('#mvLoginPromptCancel').addEventListener('click', hideLoginPrompt);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') hideLoginPrompt();
        });
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
        THEMES,
        CURRENCIES,
        redirectIfLoggedIn,
        isLoggedIn,
        getCurrentUser,
        saveCurrentUser,
        updateCurrentUser,
        logout,
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
        getAllUsers, saveAllUsers,
        findUserByUsername, findUserByEmail, findUserByUsernameOrEmail,
        isUsernameTaken, isEmailTaken,
        registerUser, loginUser, deleteCurrentAccount,
        getAdvancedModes, setAdvancedModes, getAdvancedMode, toggleAdvancedMode,
        bindAdvancedToggle,
        requestPasswordReset, validatePasswordResetToken, resetPasswordWithToken,
        requestEmailChange, verifyEmailChangeCode, cancelPendingEmailChange
    };

    // ==========================================================================
    // THEME & FONTSIZE GLOBAL ANWENDEN (auf jeder Seite, sofort)
    // ==========================================================================
    applyTheme(getTheme());
    applyFontSize(getFontSize());
    applyDesign(getDesign());
    window.addEventListener("resize", () => applyFontSize(getFontSize()), { passive: true });

    // ==========================================================================
    // NAVBAR: Login/Register -> Useraccount-Link, wenn eingeloggt
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
            userAccount.innerHTML = `
                <span class="userName">${displayName}</span>
                <i class="fa fa-cog settings-icon"></i>
            `;

            area.innerHTML = '';
            area.appendChild(userAccount);
        });
    }

    if (isLoggedIn() && navUserAreas.length) {
        changeNavUserArea();
    }

    // ══════════════════════════════════════════════════════════════════════
    // NAVBAR BURGER MENU (beide Versionen: eingeloggt + nicht eingeloggt)
    // ══════════════════════════════════════════════════════════════════════

    // Auto-fix: searchContainer-Klasse setzen falls nicht vorhanden
    (function fixSearchContainer() {
        document.querySelectorAll('[id^="searchInput"]').forEach(input => {
            if (!input.parentElement.classList.contains('searchContainer')) {
                input.parentElement.classList.add('searchContainer');
            }
        });
    })();

    function initNavBurger() {
        // Nicht auf der UserArea-Seite (hat eigenes Layout)
        if (document.querySelector('.settingsLayout')) return;

        // .secondNavList (Funktionsrechner Fullscreen) hat bereits ihr eigenes
        // Auf-/Zuklapp-Gate über #buttonForSecondNavList (.is-open) – ein
        // zusätzlicher Burger würde ein zweites, verschachteltes Ausklappen
        // erzwingen. Nur die normale .navbar bekommt daher den Burger.
        document.querySelectorAll('.navbar').forEach(setupNavBurgerFor);
    }

    function setupNavBurgerFor(navRow) {
        // Burger-Button erstellen und anhängen
        const burger = document.createElement('button');
        burger.className = 'navBurger';
        burger.setAttribute('aria-label', 'Menü öffnen');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = `
            <span class="burgerLine"></span>
            <span class="burgerLine"></span>
            <span class="burgerLine"></span>
        `;
        navRow.appendChild(burger);

        function openMenu() {
            navRow.classList.add('nav-open');
            burger.classList.add('is-open');
            burger.setAttribute('aria-expanded', 'true');
            burger.setAttribute('aria-label', 'Menü schließen');
        }

        function closeMenu() {
            navRow.classList.remove('nav-open');
            burger.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Menü öffnen');
        }

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navRow.classList.contains('nav-open') ? closeMenu() : openMenu();
        });

        // Schließen bei Klick außerhalb
        document.addEventListener('click', (e) => {
            if (!navRow.contains(e.target)) closeMenu();
        });

        // Schließen bei Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        // Schließen wenn Nav-Link oder Suchergebnis geklickt
        navRow.querySelector('[id^="navUserArea"]')?.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeMenu();
        });
        navRow.querySelector('[id^="searchResults"]')?.addEventListener('click', closeMenu);
    }

    initNavBurger();

    const _mvPath = window.location.pathname;
    if (
        !_mvPath.includes('login') && 
        !_mvPath.includes('register') && 
        !_mvPath.includes('forgot-password') && 
        !_mvPath.includes('reset-password')
    ) {
        sessionStorage.setItem('mv-return-url', window.location.href);
    }

    // ==========================================================================
    // ZENTRALES STATE-RESTORE-SIGNAL
    // Feuert bei bfCache-Restore (Zurück/Vor-Navigation) und bei
    // Storage-Änderungen aus anderen Tabs (Login/Logout, Theme, Währung, ...).
    // Einzelne Tools/Seiten brauchen dafür KEINE eigenen pageshow/storage-
    // Listener mehr zu bauen, sondern hören nur noch auf dieses eine Event:
    //   window.addEventListener('mv:staterestore', meineRefreshFunktion)
    // ==========================================================================
    const RESTORE_STORAGE_KEYS = ['currentUser', 'isLoggedIn', 'mv-currency', 'mv-theme', 'mv-design', 'mv-fontsize', 'mv-decimalPlaces', 'mv-liveResult', 'mv-angleMode', 'mv-toolHistory'];

    function dispatchStateRestore() {
        window.dispatchEvent(new CustomEvent('mv:staterestore'));
    }

    window.addEventListener('storage', (e) => {
        if (!RESTORE_STORAGE_KEYS.includes(e.key)) return;
        applyTheme(getTheme());
        applyFontSize(getFontSize());
        applyDesign(getDesign());
        dispatchStateRestore();
    });

    window.addEventListener('pageshow', function (e) {
        if (!e.persisted) return;

        applyTheme(getTheme());
        applyFontSize(getFontSize());
        applyDesign(getDesign());

        const path = window.location.pathname;

        if (path.endsWith('userArea.html') && !isLoggedIn()) {
            window.location.replace(window.MV_BASE + '/html/login.html');
            return;
        }

        // NEU: Prüft auf alle 4 Gäste-Seiten
        const isAuthPage = path.includes('login') || 
                        path.includes('register') || 
                        path.includes('forgot-password') || 
                        path.includes('reset-password');

        if (isAuthPage && isLoggedIn()) {
            const returnUrl = sessionStorage.getItem('mv-return-url') || (window.MV_BASE + '/index.html');
            sessionStorage.removeItem('mv-return-url');
            window.location.replace(returnUrl);
            return;
        }

        if (navUserAreas.length) {
            navUserAreas.forEach(area => {
                area.innerHTML = `
                    <a href="${window.MV_BASE}/html/login.html" class="navTextBorder">Login</a>
                    <a href="${window.MV_BASE}/html/register.html" class="navTextBorder">Register</a>
                `;
            });
            if (isLoggedIn()) changeNavUserArea();
        }

        dispatchStateRestore();
    });

})();