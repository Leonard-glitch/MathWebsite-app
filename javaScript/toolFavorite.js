/**
 * toolFavorite.js – Floating heart button on tool pages
 * Uses window.MV (from common-login.js) for login checks and
 * favorite management, matching the homepage logic exactly.
 *
 * HTML: <script type="module" src="../../javaScript/toolFavorite.js"></script>
 */

import { tools } from './toolsCollection.js';

// Hol den letzten Teil der URL (z.B. "fractionCalculator" oder "fractionCalculator.html")
const rawFilename = window.location.pathname.split('/').pop();
// Entferne '.html' falls vorhanden, um eine saubere Basis zu haben
const currentName = rawFilename ? rawFilename.replace('.html', '') : '';

// Vergleiche flexibel, egal ob mit oder ohne .html in der Collection
const toolData = tools.find(t => t.filename.replace('.html', '') === currentName);

if (toolData) init(toolData.id);

function init(toolId) {

    // ── Build the heart button ────────────────────────────────────────────
    const btn = document.createElement('button');
    btn.className = 'tool-page-heart';
    btn.setAttribute('aria-label', 'Add to favorites');
    btn.innerHTML = `
        <svg class="heart-svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
                   a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78
                   1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="heart-tooltip-label"></span>
    `;
    document.body.appendChild(btn);

    // ── Render state ─────────────────────────────────────────────────────
    function render() {
        const loggedIn = window.MV.isLoggedIn();
        const isFav    = loggedIn && window.MV.getFavorites().includes(toolId);

        btn.classList.toggle('is-active', isFav);
        btn.classList.toggle('is-disabled', !loggedIn);

        btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
        btn.querySelector('.heart-tooltip-label').textContent = isFav ? 'Favorite' : 'Favorite?';
    }

    // ── Click handling ────────────────────────────────────────────────────
    btn.addEventListener('click', () => {
        if (!window.MV.isLoggedIn()) {
            window.MV.showLoginPrompt('Log in to save tools as favorites.');
            return;
        }
        window.MV.toggleFavorite(toolId);
        render();
    });

    // ── Cross-tab sync ───────────────────────────────────────────────────
    window.addEventListener('storage', (e) => {
        if (e.key === 'currentUser' || e.key === 'isLoggedIn') render();
    });

    render();
}