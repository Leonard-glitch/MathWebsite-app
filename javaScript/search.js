// search.js – supports multiple search instances (for example main + second header)
import { tools } from "./toolsCollection.js";

const searchInputs = document.querySelectorAll('[id^="searchInput"]');

searchInputs.forEach(initSearchInstance);

function initSearchInstance(searchInput) {
    const wrapper = searchInput.parentElement;
    const searchResults = wrapper ? wrapper.querySelector('[id^="searchResults"]') : null;
    if (!wrapper || !searchResults) return;

    // Width and position are based on the entire nav row (logo to login) –
    // exactly like the original "width: 100%" behavior, not the narrower input wrapper.
    const navRow = searchInput.closest(".navbar, .secondNavList") || wrapper;

    function positionResults() {
        const rect = navRow.getBoundingClientRect();
        // Keine Rundung verwenden, um Sub-Pixel-Überhänge und 
        // das Auslösen der horizontalen Scrollbar zu vermeiden.
        searchResults.style.top   = `${rect.bottom + 8}px`;
        searchResults.style.left  = `${rect.left}px`;
        searchResults.style.width = `${rect.width}px`;
    }

    function showResultsForCurrentQuery() {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length === 0) {
            searchResults.style.display = "none";
            searchResults.innerHTML = "";
            return;
        }

        // 1. Zuerst filtern wir alle passenden Tools heraus (wie bisher)
        const matches = tools.filter(tool => {
            const titleMatch = tool.title.toLowerCase().includes(query);
            const tagMatch   = tool.tags.some(tag => tag.toLowerCase().includes(query));
            return titleMatch || tagMatch;
        });

        // 2. Jetzt sortieren wir die Ergebnisse nach Priorität
        matches.sort((a, b) => {
            const getScore = (tool) => {
                const title = tool.title.toLowerCase();
                
                // Prio 1: Titel BEGINNT exakt mit dem Suchbegriff 
                // (z.B. "ge" -> "Geometry Calculator")
                if (title.startsWith(query)) {
                    return 100;
                }
                
                // Prio 2: Der Suchbegriff ist der ANFANG eines WORTES mitten im Titel 
                // (z.B. "calc" -> "Math Calculator")
                if (title.includes(" " + query)) {
                    // Wir ziehen ein winziges bisschen für die Position ab, 
                    // aber es bleibt stark um die 90 Punkte.
                    return 90 - (title.indexOf(" " + query) * 0.1);
                }
                
                // Prio 3: Suchbegriff ist MITTEN in einem Wort enthalten 
                // (z.B. "ge" -> "Percentage Calculator")
                const titleIndex = title.indexOf(query);
                if (titleIndex > 0) {
                    // Math.max stellt sicher, dass der Titel-Score NIEMALS unter 20 fällt.
                    // So bleibt ein Titel-Treffer immer wertvoller als ein reiner Tag-Treffer (10).
                    return Math.max(20, 80 - titleIndex); 
                }
                
                // Prio 4: Suchbegriff wurde nur in den TAGS gefunden
                return 10;
            };

            // Absteigend sortieren (Höchster Score ganz oben)
            return getScore(b) - getScore(a);
        });

        // Render first, then position: prevents calculation based on layout that is still changing.
        renderResults(searchResults, matches);
        positionResults();
    }

    searchInput.addEventListener("input", showResultsForCurrentQuery);
    searchInput.addEventListener("focus", showResultsForCurrentQuery);

    // NEU: Enter-Taste im Suchfeld öffnet das erste Ergebnis
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Verhindert z.B. unbeabsichtigtes Neuladen bei Formularen
            
            // Prüfen, ob die Ergebnisliste gerade sichtbar ist
            if (searchResults.style.display === "block") {
                // Selektiert explizit das erste <a> Tag (ignoriert das "No results" <div>)
                const firstResult = searchResults.querySelector("a.searchResult");
                
                if (firstResult && firstResult.href) {
                    // Zum Link des ersten Ergebnisses navigieren
                    window.location.href = firstResult.href;
                }
            }
        }
    });

    document.addEventListener("click", e => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = "none";
        }
    });

    window.addEventListener("scroll", () => {
        if (searchResults.style.display === "block") positionResults();
    }, { capture: true, passive: true });

    window.addEventListener("resize", () => {
        if (searchResults.style.display === "block") positionResults();
    }, { passive: true });
}

function renderResults(searchResults, results) {

    if (results.length === 0) {
        searchResults.innerHTML = `<div class="searchResult">No results found</div>`;
        searchResults.style.display = "block";
        return;
    }

    searchResults.innerHTML = "";

    results.forEach(tool => {
        const result = document.createElement("a");
        result.href  = tool.url;
        result.classList.add("searchResult");

        result.innerHTML = `
            <div class="searchResultTitle">${tool.title}</div>
            <div class="searchResultTags">${tool.tags.map(tag => `#${tag}`).join(" ")}</div>
        `;

        searchResults.appendChild(result);
    });

    searchResults.style.display = "block";
}