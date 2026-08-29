/**
 * userArea.js – MathVerse Settings Page Logic (ES Module)
 *
 * Alle User-Daten (Theme, Fontsize, Username, E-Mail, Favoriten,
 * Pinned Groups, Container-Reihenfolge) laufen jetzt über window.MV
 * und damit über das einheitliche currentUser-Objekt.
 */

import { tools, groups } from './toolsCollection.js';


const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;

// Tools mit eigenem Advanced Mode – bei neuen Tools mit Advanced Mode hier ergänzen.
const ADVANCED_MODE_TOOLS = [
    { key: 'einheitenUmrechner', label: 'Unit Converter', icon: 'fa-arrows-h' },
    { key: 'prozentrechner', label: 'Percentage Calculator', icon: 'fa-percent' },
    { key: 'matheRechner', label: 'Math Calculator', icon: 'fa-calculator' }
];

// ── State ─────────────────────────────────────────────────────────────────────
let pendingTheme    = window.MV.getTheme();
let pendingFontSize = window.MV.getFontSize();

// ── DOM-Referenzen ────────────────────────────────────────────────────────────
const navItems        = document.querySelectorAll('.navItem[data-panel]');
const panels          = document.querySelectorAll('.settingsPanel');

const sidebarAvatar   = document.getElementById('sidebarAvatarEl');
const sidebarUsername = document.getElementById('sidebarUsernameEl');
const sidebarEmail    = document.getElementById('sidebarEmailEl');
const profileAvatar   = document.getElementById('profileAvatarEl');
const displayName     = document.getElementById('displayNameEl');
const viewUsername    = document.getElementById('view-username');
const viewEmail       = document.getElementById('view-email');

const viewMemberSince = document.getElementById('view-member-since');

function formatMemberSince(timestamp) {
    if (!timestamp) return "–";

    return new Date(timestamp).toLocaleDateString("de-AT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

// ── Shake-Keyframe (einmalig injiziert) ───────────────────────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes settingsShake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-5px); }
        40%     { transform: translateX(5px); }
        60%     { transform: translateX(-3px); }
        80%     { transform: translateX(3px); }
    }
`;
document.head.appendChild(shakeStyle);

// Schutz vor dem "Zurück"-Button (bfcache) nach dem Logout
window.addEventListener('pageshow', (e) => {
    // Wenn die Seite aus dem Cache geladen wird (e.persisted) 
    // ODER normal geladen wird, prüfen wir den Login-Status.
    // Falls der User nicht (mehr) eingeloggt ist -> ab zum Login!
    if (!window.MV.isLoggedIn()) {
        window.location.href = '../html/login.html'; // Pfad ggf. anpassen
    }
});

// ── Initialisierung ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Ohne Account gibt es nichts zu verwalten -> zurück zum Login
    if (!window.MV.isLoggedIn()) {
        window.location.href = '../html/login.html';
        return;
    }

    window.MV.applyTheme(pendingTheme);
    window.MV.applyFontSize(pendingFontSize);

    populateUserInfo();
    initPanelNav();
    initAccountPanel();
    initSecurityPanel();
    initAppearancePanel();
    initExtrasPanel();
    initDeletePanel();
    initLogoutModal();
    initPasswordToggles();
    initMobileSidebar();
});

// Zentrales Signal aus common-login.js: feuert bei bfCache-Restore (Zurück/Vor)
// und bei Änderungen in anderen Tabs (z.B. Währung in UserArea, während der
// Finanzrechner offen ist – und umgekehrt).
window.addEventListener('mv:staterestore', () => {
    populateUserInfo();
    refreshExtrasPanelValues();
});

// =============================================================================
// PANEL NAVIGATION
// =============================================================================

function initPanelNav() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            switchPanel(item.dataset.panel);
            closeMobileSidebar(); // Sidebar auf Mobile nach Auswahl schließen
        });
    });
}

function switchPanel(panelId) {
    panels.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`panel-${panelId}`);
    if (target) target.classList.add('active');

    if (panelId === 'favorites') populateFavorites();
}

// =============================================================================
// USER INFO
// =============================================================================

function maskEmail(email) {
    if (!email || !email.includes('@')) return '–';
    const [local, domain] = email.split('@');
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.min(local.length - 2, 5))}@${domain}`;
}

function populateUserInfo() {
    const user   = window.MV.getCurrentUser() || {};
    const name   = user.username || 'Guest';
    const email  = user.email || '';
    const letter = name.charAt(0).toUpperCase();

    if (sidebarAvatar)   sidebarAvatar.textContent  = letter;
    if (sidebarUsername) sidebarUsername.textContent = name;
    if (sidebarEmail)    sidebarEmail.textContent    = maskEmail(email);
    if (profileAvatar)   profileAvatar.textContent   = letter;
    if (displayName)     displayName.textContent     = name;
    if (viewUsername)    viewUsername.textContent     = name;
    if (viewEmail)       viewEmail.textContent        = maskEmail(email) || '–';


    if (viewMemberSince) {
    viewMemberSince.textContent = formatMemberSince(user.createdAt);
}

    const inputUsername = document.getElementById('input-username');
    const inputEmail    = document.getElementById('input-email');
    if (inputUsername)       inputUsername.value = name;
    if (inputEmail && email) inputEmail.value    = email;
}

// =============================================================================
// KONTO-PANEL
// =============================================================================

function initAccountPanel() {
    const editBtn   = document.getElementById('editAccountBtn');
    const cancelBtn = document.getElementById('cancelAccountBtn');
    const saveBtn   = document.getElementById('saveAccountBtn');
    const viewMode  = document.getElementById('accountViewMode');
    const editMode  = document.getElementById('accountEditMode');
    const toast     = document.getElementById('accountToast');

    if (!editBtn) return;

    editBtn.addEventListener('click', () => {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        editBtn.classList.add('hidden');
        document.getElementById('input-current-pw').value = '';
    });

    cancelBtn.addEventListener('click', () => {
        exitEditMode(viewMode, editMode, editBtn);
        document.getElementById('input-current-pw').value = '';
    });

    saveBtn.addEventListener('click', () => {
        const newName   = document.getElementById('input-username').value.trim();
        const newEmail  = document.getElementById('input-email').value.trim();
        const currentPw = document.getElementById('input-current-pw').value;
        const user      = window.MV.getCurrentUser();

        // FIX: Prüfen, ob die Session noch existiert (verhindert Cross-Tab-Logout-Absturz)
        if (!user) {
            alert('Your session has expired. Please log in again.');
            window.location.href = '../html/login.html';
            return;
        }

        if (!currentPw || currentPw !== (user.password || '')) {
            shakeElement(document.getElementById('input-current-pw'));
            return;
        }
        if (!newName || !USERNAME_REGEX.test(newName)) {
            shakeElement(document.getElementById('input-username'));
            return;
        }
        if (window.MV.isUsernameTaken(newName, user.username)) {
            shakeElement(document.getElementById('input-username'));
            return;
        }
        if (newEmail && window.MV.isEmailTaken(newEmail, user.username)) {
            shakeElement(document.getElementById('input-email'));
            return;
        }

        window.MV.updateCurrentUser({
            username: newName,
            email: newEmail || user.email
        });

        populateUserInfo();
        exitEditMode(viewMode, editMode, editBtn);
        document.getElementById('input-current-pw').value = '';

        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    });
}

function exitEditMode(viewMode, editMode, editBtn) {
    editMode.classList.add('hidden');
    viewMode.classList.remove('hidden');
    editBtn.classList.remove('hidden');
}

// =============================================================================
// SICHERHEITS-PANEL
// =============================================================================

function initSecurityPanel() {
    const newPwInput  = document.getElementById('sec-new-pw');
    const confPwInput = document.getElementById('sec-confirm-pw');
    const saveBtn     = document.getElementById('savePwBtn');
    const errorEl     = document.getElementById('sec-error');

    if (!newPwInput) return;

    newPwInput.addEventListener('input', () => updateStrength(newPwInput.value));

    newPwInput.addEventListener('animationstart', (e) => {
        if (e.animationName === 'settingsAutoFillStart') {
            updateStrength(newPwInput.value);
        }
    });

    saveBtn.addEventListener('click', () => {
        const cur  = document.getElementById('sec-current-pw').value;
        const nw   = newPwInput.value;
        const conf = confPwInput.value;
        const user = window.MV.getCurrentUser();

        errorEl.classList.add('hidden');

        // FIX: Prüfen, ob die Session noch existiert (verhindert Cross-Tab-Logout-Absturz)
        if (!user) {
            alert('Your session has expired. Please log in again.');
            window.location.href = '../html/login.html';
            return;
        }

        if (!cur || cur !== (user.password || '')) {
            showFormError(errorEl, 'The current password is incorrect.');
            shakeElement(document.getElementById('sec-current-pw'));
            return;
        }
        if (nw.length < 6) {
            showFormError(errorEl, 'The new password must be at least 6 characters long.');
            shakeElement(newPwInput);
            return;
        }
        if (nw !== conf) {
            showFormError(errorEl, 'The passwords do not match.');
            shakeElement(confPwInput);
            return;
        }

        window.MV.updateCurrentUser({ password: nw });

        document.getElementById('sec-current-pw').value = '';
        newPwInput.value  = '';
        confPwInput.value = '';
        updateStrength('');
        showFormError(errorEl, '✓ Password changed successfully.', true);
        setTimeout(() => errorEl.classList.add('hidden'), 3000);
    });
}

function updateStrength(pw) {
    const fill  = document.getElementById('sec-strengthFill');
    const label = document.getElementById('sec-strengthLabel');
    if (!fill) return;

    if (!pw) {
        fill.style.width           = '0';
        fill.style.backgroundColor = '';
        if (label) label.textContent = '';
        return;
    }

    const lvl    = window.MV.getPasswordStrength(pw);
    const labels = ['', 'Weak', 'Okay', 'Good', 'Strong'];
    const colors = ['', '#ff2a5f', '#ff9100', '#ffcc00', '#00ffcc'];

    fill.style.width           = `${lvl * 25}%`;
    fill.style.backgroundColor = colors[lvl];

    if (label) {
        label.textContent = labels[lvl];
        label.style.color = colors[lvl];
    }
}

// =============================================================================
// ERSCHEINUNGSBILD-PANEL
// =============================================================================

// =============================================================================
// ERSCHEINUNGSBILD-PANEL
// =============================================================================

function initAppearancePanel() {
    const swatches = document.querySelectorAll('.colorSwatch');
    const slider   = document.getElementById('fontSizeSlider');
    const display  = document.getElementById('fontSizeDisplay');
    const saveBtn  = document.getElementById('saveAppearanceBtn');
    const resetBtn = document.getElementById('resetAppearanceBtn');
    const toast    = document.getElementById('appearanceToast');

    // NEU: Design Buttons holen
    const designButtons = document.querySelectorAll('.designBtn');

    // Aktuelle Werte als "Pending" (Vorschau-Zustand) laden
    let pendingTheme    = window.MV.getTheme();
    let pendingFontSize = window.MV.getFontSize();
    let pendingDesign   = window.MV.getDesign(); // NEU

    // Initialen aktiven Zustand für Akzentfarbe setzen
    swatches.forEach(s => s.classList.remove('active'));
    document.querySelector(`.colorSwatch[data-theme="${pendingTheme}"]`)
        ?.classList.add('active');

    // NEU: Initialen aktiven Zustand für Design Buttons setzen
    designButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.designBtn[data-design="${pendingDesign}"]`)
        ?.classList.add('active');

    // Event-Listener für Akzentfarben (Live-Vorschau)
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            pendingTheme = swatch.dataset.theme;
            window.MV.applyTheme(pendingTheme);
        });
    });

    // NEU: Event-Listener für Design-Buttons (Live-Vorschau über var())
    designButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            designButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pendingDesign = btn.dataset.design;
            window.MV.applyDesign(pendingDesign); // Wendet die CSS-Variablen live an
        });
    });

    // Font-Size Slider Logik
    if (slider) {
        slider.value = pendingFontSize;
        if (display) display.textContent = pendingFontSize;

        slider.addEventListener('input', () => {
            pendingFontSize = parseInt(slider.value, 10);
            if (display) display.textContent = pendingFontSize;
            window.MV.applyFontSize(pendingFontSize);
        });
    }

    // Design speichern
    saveBtn?.addEventListener('click', () => {
        window.MV.setTheme(pendingTheme);
        window.MV.setFontSize(pendingFontSize);
        window.MV.setDesign(pendingDesign); // NEU

        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    });

    // Zurücksetzen auf Standardwerte
    resetBtn?.addEventListener('click', () => {
        pendingTheme    = 'violet';
        pendingFontSize = 20;
        pendingDesign   = 'abyss'; // NEU: Standard ist Abyss

        window.MV.applyTheme(pendingTheme);
        window.MV.applyFontSize(pendingFontSize);
        window.MV.applyDesign(pendingDesign); // NEU

        if (slider)  slider.value         = 20;
        if (display) display.textContent  = 20;

        swatches.forEach(s => s.classList.remove('active'));
        document.querySelector('.colorSwatch[data-theme="violet"]')
            ?.classList.add('active');

        // NEU: Buttons auf Abyss zurücksetzen
        designButtons.forEach(b => b.classList.remove('active'));
        document.querySelector('.designBtn[data-design="abyss"]')
            ?.classList.add('active');
    });
}

// =============================================================================
// ZUSATZEINSTELLUNGEN-PANEL (Währung, Advanced Modes – werkzeugübergreifend)
// =============================================================================

function initExtrasPanel() {
    const currencySelect = document.getElementById('extrasCurrencySelect');
    const decimalSelect  = document.getElementById('extrasDecimalSelect');
    const togglesList    = document.getElementById('advancedModesList');
    const toast          = document.getElementById('extrasToast');

    if (!currencySelect && !decimalSelect && !togglesList) return;

    function showExtrasToast() {
        if (!toast) return;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    // ── Währung ──────────────────────────────────────────────────────────
    if (currencySelect) {
        currencySelect.innerHTML = Object.entries(window.MV.CURRENCIES)
            .map(([code, name]) => `<option value="${code}">${code} – ${name}</option>`)
            .join('');
        currencySelect.value = window.MV.getCurrency();

        currencySelect.addEventListener('change', () => {
            window.MV.setCurrency(currencySelect.value);
            showExtrasToast();
        });
    }

    // ── Nachkommastellen ─────────────────────────────────────────────────
    if (decimalSelect) {
        decimalSelect.innerHTML = [0, 1, 2, 3, 4, 5]
            .map(n => `<option value="${n}">${n}</option>`)
            .join('');
        decimalSelect.value = window.MV.getDecimalPlaces();

        decimalSelect.addEventListener('change', () => {
            window.MV.setDecimalPlaces(parseInt(decimalSelect.value, 10));
            showExtrasToast();
        });
    }

    // ── Advanced Modes ───────────────────────────────────────────────────
    if (togglesList) {
        togglesList.innerHTML = ADVANCED_MODE_TOOLS.map(tool => `
            <div class="extrasToggleRow">
                <span class="extrasToggleLabel"><i class="fa ${tool.icon}"></i> ${tool.label}</span>
                <label class="switch">
                    <input type="checkbox" data-advanced-key="${tool.key}">
                    <span class="slider round"></span>
                </label>
            </div>
        `).join('');

        togglesList.querySelectorAll('input[data-advanced-key]').forEach(input => {
            const key = input.dataset.advancedKey;
            input.checked = window.MV.getAdvancedMode(key);

            input.addEventListener('change', () => {
                window.MV.toggleAdvancedMode(key);
                showExtrasToast();
            });
        });
    }
}

// Hält Währung + Advanced-Mode-Schalter synchron, falls sie in einem anderen
// Tab (oder via bfCache-Restore) geändert wurden – siehe mv:staterestore weiter unten.
function refreshExtrasPanelValues() {
    const currencySelect = document.getElementById('extrasCurrencySelect');
    if (currencySelect) currencySelect.value = window.MV.getCurrency();

    const decimalSelect = document.getElementById('extrasDecimalSelect');
    if (decimalSelect) decimalSelect.value = window.MV.getDecimalPlaces();

    document.querySelectorAll('#advancedModesList input[data-advanced-key]').forEach(input => {
        input.checked = window.MV.getAdvancedMode(input.dataset.advancedKey);
    });
}

// =============================================================================
// FAVORITEN-PANEL
// =============================================================================
function populateFavorites() {
    const grid       = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('favEmptyState');

    const favs = window.MV.getFavorites();

    grid.innerHTML = '';

    if (favs.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    favs.forEach(id => {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;

    const group = groups.find(g => g.id === tool.group);
    const icon  = group?.icon || 'fa-star';   // <- statt GROUP_ICONS[tool.group]

    const card = document.createElement('a');
    card.href       = tool.url;
    card.className  = 'favCard';
    card.innerHTML  = `
        <i class="fa ${icon} favCardIcon"></i>
        <div class="favCardTitle">${tool.title}</div>
        <div class="favCardTag">${group?.title ?? ''}</div>
    `;
    grid.appendChild(card);
});
}

// =============================================================================
// KONTO-LÖSCHEN-PANEL
// =============================================================================

function initDeletePanel() {
    const input = document.getElementById('deleteConfirmInput');
    const btn   = document.getElementById('deleteAccountBtn');

    if (!input || !btn) return;

    input.addEventListener('input', () => {
        btn.disabled = input.value !== 'DELETE';
    });

   btn.addEventListener('click', () => {
        window.MV.deleteCurrentAccount();
        alert('Account deleted. You will be redirected to the homepage.');
        window.location.href = '../index.html';
    });
}

// =============================================================================
// LOGOUT-MODAL
// =============================================================================

function initLogoutModal() {
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    const modal        = document.getElementById('logoutModal');
    const cancelBtn    = document.getElementById('logoutCancelBtn');
    const confirmBtn   = document.getElementById('logoutConfirmBtn');

    if (!logoutNavBtn || !modal) return;

    logoutNavBtn.addEventListener('click', () => modal.classList.remove('hidden'));

    cancelBtn?.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });

    confirmBtn?.addEventListener('click', () => {
        window.MV.logout();
        window.location.href = '../index.html';
    });
}

// =============================================================================
// PASSWORT-TOGGLES (global für alle Panels)
// =============================================================================

function initPasswordToggles() {
    document.querySelectorAll('.pwToggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            btn.querySelector('i').className = isHidden ? 'fa fa-eye-slash' : 'fa fa-eye';
        });
    });
}

// =============================================================================
// HILFSFUNKTIONEN
// =============================================================================

function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'settingsShake 0.35s ease';
    setTimeout(() => { el.style.animation = ''; }, 400);
}

function showFormError(el, msg, isSuccess = false) {
    el.textContent           = msg;
    el.style.color           = isSuccess ? 'var(--accent-live)'     : 'var(--accent-error)';
    el.style.borderColor     = isSuccess ? 'var(--accent-live)'     : 'rgba(255,42,95,0.3)';
    el.style.backgroundColor = isSuccess ? 'rgba(0,255,204,0.06)'   : 'rgba(255,42,95,0.06)';
    el.classList.remove('hidden');
}

// =============================================================================
// MOBILE SIDEBAR
// =============================================================================

function initMobileSidebar() {
    const toggleBtn = document.getElementById('sidebarMobileToggle');
    const closeBtn  = document.getElementById('sidebarMobileClose');
    const overlay   = document.getElementById('sidebarOverlay');

    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', openMobileSidebar);
    closeBtn?.addEventListener('click',  closeMobileSidebar);
    overlay?.addEventListener('click',   closeMobileSidebar);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMobileSidebar();
    });
}

function openMobileSidebar() {
    document.querySelector('.settingsSidebar')?.classList.add('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    document.querySelector('.settingsSidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
}