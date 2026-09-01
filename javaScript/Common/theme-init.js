/**
 * theme-init.js – Zero-Flash Theme/Design/Fontsize Bootstrap
 *
 * MUSS als allererstes <script> im <head> jeder Seite eingebunden werden,
 * VOR allen <link rel="stylesheet">-Tags. Nur so kann es die gespeicherten
 * Design-Variablen anwenden, BEVOR der Browser den ersten Frame malt – das
 * verhindert den Flash of inaccurate color Theme (Standard-Theme blitzt kurz
 * auf, bevor common-login.js am Ende von <body> das echte Theme setzt).
 *
 * Single source of truth für THEMES/DESIGNS + deren Anwendung. common-login.js
 * referenziert diese Objekte/Funktionen über window.MV_THEME statt sie
 * erneut zu definieren.
 *
 * Bewusst als klassisches, synchrones <script src="..."> ohne defer/async/
 * type="module" eingebunden – jede dieser Optionen würde die Ausführung bis
 * nach dem ersten Paint verschieben und den Flash wieder zurückbringen.
 */
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
            '--bg-body': '#09090e', '--bg-surface': '#0b1528', '--bg-surface-glow': '#142036',
            '--bg-input': '#05060c', '--bg-navbar': 'rgba(9, 9, 14, 0.75)', '--border-color': '#1c2740',
            '--text-primary': '#f3f4f6', '--text-secondary': '#8f8fbc', '--text-muted': '#44496a',
            '--shadow-main': '0 10px 30px rgba(0, 0, 0, 0.6)',
            '--accent-live': '#00ffcc', '--accent-error': '#ff2a5f',
            '--glow-live': 'rgba(0, 255, 204, 0.2)', '--glow-error': 'rgba(255, 42, 95, 0.35)',
        },
        dark: {
            '--bg-body': '#121214', '--bg-surface': '#1a1a1e', '--bg-surface-glow': '#232328',
            '--bg-input': '#0e0e10', '--bg-navbar': 'rgba(18, 18, 20, 0.75)', '--border-color': '#2a2a30',
            '--text-primary': '#ffffff', '--text-secondary': '#a0a0ab', '--text-muted': '#5a5a64',
            '--shadow-main': '0 10px 30px rgba(0, 0, 0, 0.6)',
            '--accent-live': '#00ffcc', '--accent-error': '#ff2a5f',
            '--glow-live': 'rgba(0, 255, 204, 0.2)', '--glow-error': 'rgba(255, 42, 95, 0.35)',
        },
        light: {
            '--bg-body': '#f8fafc', '--bg-surface': '#ffffff', '--bg-surface-glow': '#f1f3f6',
            '--bg-input': '#f3f4f7', '--bg-navbar': 'rgba(255, 255, 255, 0.75)', '--border-color': '#e2e4ea',
            '--text-primary': '#0f172a', '--text-secondary': '#51566b', '--text-muted': '#9598a8',
            '--shadow-main': '0 10px 30px rgba(15, 23, 42, 0.08)',
            '--accent-live': '#0c7c69', '--accent-error': '#dc2626',
            '--glow-live': 'rgba(12, 124, 105, 0.18)', '--glow-error': 'rgba(220, 38, 38, 0.18)',
        }
    };

    // Deliberately lightweight instead of the full getCurrentUser() from
    // common-login.js (with DEFAULT_USER merge): at this point in the load
    // process, common-login.js doesn't exist yet. For the three fields we
    // need here (theme/design/fontsize), the raw stored object is enough –
    // they're always saved directly on registration/update.
    function readStoredUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch {
            return null;
        }
    }

    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('currentUser');
    }

    function getTheme() {
        const u = readStoredUser();
        if (isLoggedIn() && u && u.theme) return u.theme;
        return localStorage.getItem('mv-theme') || 'violet';
    }

    function getDesign() {
        const u = readStoredUser();
        if (isLoggedIn() && u && u.design) return u.design;
        return localStorage.getItem('mv-design') || 'abyss';
    }

    function getFontSize() {
        const u = readStoredUser();
        if (isLoggedIn() && u && u.fontsize) return parseInt(u.fontsize, 10);
        return parseInt(localStorage.getItem('mv-fontsize') || '20', 10);
    }

    function applyTheme(themeName) {
        const vars = THEMES[themeName] || THEMES.violet;
        Object.entries(vars).forEach(([key, val]) =>
            document.documentElement.style.setProperty(key, val)
        );
    }

    function applyDesign(designName) {
        const vars = DESIGNS[designName] || DESIGNS.abyss;
        Object.entries(vars).forEach(([key, val]) =>
            document.documentElement.style.setProperty(key, val)
        );
    }

    function applyFontSize(size) {
        const isMobile = window.innerWidth <= 768;
        const effective = isMobile ? Math.min(size, 20) : size;
        document.documentElement.style.fontSize = `${effective}px`;
    }

    // ── The actual fix: apply immediately, before the CSS stylesheet loads ──
    applyTheme(getTheme());
    applyDesign(getDesign());
    applyFontSize(getFontSize());

    window.addEventListener('resize', () => applyFontSize(getFontSize()), { passive: true });

    // Single source of truth – common-login.js reads from this instead of
    // duplicating the data/logic.
    window.MV_THEME = {
        THEMES, DESIGNS,
        getTheme, getDesign, getFontSize,
        applyTheme, applyDesign, applyFontSize
    };

})();