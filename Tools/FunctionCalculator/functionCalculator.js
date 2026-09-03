const toolbarButtons = [
    {
        id: "undo",
        icon: "fa-undo",
        tooltip: "Rückgängig (Strg+Z)",
        position: { top: "10px", left: "10px" }
    },
    {
        id: "redo",
        icon: "fa-repeat", // In FA 4.7 heißt Redo "fa-repeat"
        tooltip: "Wiederholen (Strg+Y)",
        position: { top: "10px", left: "80px" }
    },
    {
        id: "settings",
        icon: "fa-cog",
        tooltip: "Einstellungen",
        position: { top: "10px", right: "10px" }
    },
    {
        id: "reset",
        icon: "fa-home",
        tooltip: "Ansicht zurücksetzen",
        position: { bottom: "115px", right: "10px" }
    },
    {
        id: "zoom-in",
        icon: "fa-search-plus",
        tooltip: "Vergrößern",
        position: { bottom: "80px", right: "10px" }
    },
    {
        id: "zoom-out",
        icon: "fa-search-minus",
        tooltip: "Verkleinern",
        position: { bottom: "45px", right: "10px" }
    },
    {
        id: "fullscreen",
        icon: "fa-expand",
        tooltip: "Vollbild",
        position: { bottom: "10px", right: "10px" }
    }
    
];

window.addEventListener('pageshow', (e) => {
 
        window.location.href = '../../index.html'; // Pfad ggf. anpassen
});

// ── Initialisierung ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Ohne Account gibt es nichts zu verwalten -> zurück zum Login
   
        window.location.href = '../../index.html'; // Pfad ggf. anpassen
        
});    

function renderToolbarButtons() {
    const container = document.querySelector('.cordSystemContainer');
    if (!container) return;

    toolbarButtons.forEach(btnData => {
        const btn = document.createElement('button');
        btn.id = btnData.id;
        btn.className = 'coord-btn';
        btn.title = btnData.tooltip;
        btn.innerHTML = `<i class="fa ${btnData.icon}"></i>`;

        // Positionen zuweisen
        if (btnData.position) {
            Object.keys(btnData.position).forEach(key => {
                btn.style[key] = btnData.position[key];
            });
        }

        const alreadyWiredElsewhere = ['fullscreen', 'zoom-in', 'zoom-out', 'reset', 'settings', 'undo', 'redo'];
        btn.addEventListener('click', () => {
            if (btnData.id === 'fullscreen') {
                toggleFullscreen();
            } else if (!alreadyWiredElsewhere.includes(btnData.id)) {
                console.log(`Button ${btnData.id} geklickt!`);
            }
        });

        container.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', renderToolbarButtons);


// Funktion zum Umschalten des Fullscreen-Modus
function toggleFullscreen() {
    const container = document.querySelector('.functionsContainer');
    const fullscreenBtnIcon = document.querySelector('#fullscreen i');
    const targetElement = document.querySelector('.topNavlistContainer');

    if (container) {
        // Fullscreen toggeln
        container.classList.toggle('is-fullscreen');
        const isFullscreen = container.classList.contains('is-fullscreen');

        // Icon toggeln
        if (fullscreenBtnIcon) {
            fullscreenBtnIcon.classList.toggle('fa-expand');
            fullscreenBtnIcon.classList.toggle('fa-compress');
        }

        // Klasse toggeln (schaltet display: flex an/aus)
        if (targetElement) {
            targetElement.classList.toggle('is-visible');
        }

        // Favoriten-Herz in den zweiten Header verschieben, solange der
        // Hauptheader durch den Vollbild-Modus verdeckt ist – zurück an
        // seinen Ursprungsort (body), sobald Fullscreen verlassen wird.
        const heartBtn = document.querySelector('.tool-page-heart');
        const heartSlot = document.getElementById('boxForFavoriteHeart');
        if (heartBtn && heartSlot) {
            if (isFullscreen) {
                heartSlot.appendChild(heartBtn);
            } else {
                document.body.appendChild(heartBtn);
            }
        }
    }
}

// Schließen des Fullscreen-Modus mit der ESC-Taste
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const container = document.querySelector('.functionsContainer');
        if (container && container.classList.contains('is-fullscreen')) {
            toggleFullscreen();
        }
    }
});

function initSecondNavToggle() {
    const navBtn = document.querySelector('#buttonForSecondNavList');
    const secondNav = document.querySelector('.secondNavList');

    if (navBtn && secondNav) {
        navBtn.addEventListener('click', () => {
            // Toggelt das Menü (Auf-/Zuklappen)
            secondNav.classList.toggle('is-open');
            
            // Toggelt den Button (damit sich die Pfeile drehen)
            navBtn.classList.toggle('is-open');
        });
    }
}

// Initialisieren, sobald das HTML geladen ist
document.addEventListener('DOMContentLoaded', initSecondNavToggle);




function initAccordionOutput() {
    const loesungBtn = document.querySelector('.loesungText');
    const loesungOutput = document.querySelector('#loesungOutput');
    const rechenwegDiv = document.querySelector('.rechenwegDiv');

    const rechenwegBtn = document.querySelector('.rechenwegText');
    const rechenwegOutput = document.querySelector('#rechenwegOutput');

    // 1. Ergebnisse ausklappen & Rechenweg-Button anzeigen
    if (loesungBtn && loesungOutput) {
        loesungBtn.addEventListener('click', () => {
            const isOpen = loesungOutput.classList.toggle('is-open');
            loesungBtn.classList.toggle('is-open');

            // Rechenweg-Bereich anzeigen/verstecken
            if (rechenwegDiv) {
                if (isOpen) {
                    rechenwegDiv.classList.add('is-visible');
                } else {
                    rechenwegDiv.classList.remove('is-visible');
                    // Wenn Ergebnisse zugeklappt werden, klappen wir den Rechenweg gleich mit zu
                    if (rechenwegOutput) rechenwegOutput.classList.remove('is-open');
                    if (rechenwegBtn) rechenwegBtn.classList.remove('is-open');
                }
            }
        });
    }

    // 2. Rechenweg ausklappen
    if (rechenwegBtn && rechenwegOutput) {
        rechenwegBtn.addEventListener('click', () => {
            rechenwegOutput.classList.toggle('is-open');
            rechenwegBtn.classList.toggle('is-open');
        });
    }
}

// Beim Laden der Seite ausführen
document.addEventListener('DOMContentLoaded', initAccordionOutput);




// ==========================================================================
// FUNKTIONSLISTE – Zustand, Buchstaben-/Farbvergabe, Rendering
// ==========================================================================

const FUNCTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Gleiche 6 Akzentfarben wie die Theme-Auswahl in der UserArea (siehe
// THEMES in common-login.js) – konsistent mit dem Rest der Website statt
// neue, beliebige Farben einzuführen. Ab der 7. Funktion wiederholt sich
// der Zyklus.
const FUNCTION_COLORS = ["#8a16ff", "#00ffcc", "#1e90ff", "#ff2d78", "#ff6a00", "#f5c518"];

let functionsState = [];
let nextFunctionId = 1;
let editingFunctionId = null;
let openFunctionMenuId = null;
let openFunctionModalForEdit = () => {}; // wird in initAddFunctionModal() gesetzt
let requestGraphRedraw = () => {}; // wird in initCoordinateSystem() gesetzt
let requestAutoScale = () => {}; // wird in initCoordinateSystem() gesetzt

// ==========================================================================
// UNDO/REDO – wie in GeoGebra: der Verlauf erfasst nur Änderungen an der
// Funktionsliste (Hinzufügen/Bearbeiten/Löschen/Sichtbarkeit). Pan/Zoom der
// Ansicht sind bewusst NICHT Teil des Undo-Stacks, exakt wie in GeoGebra.
// ==========================================================================

let functionsHistory = [[]];
let functionsHistoryIndex = 0;

// Speichert nur die serialisierbaren Felder – "ast" wird beim Wiederherstellen
// aus "latex" neu kompiliert statt als Referenz mitgespeichert zu werden.
function snapshotFunctionsState() {
    return functionsState.map(fn => ({ id: fn.id, latex: fn.latex, visible: fn.visible }));
}

function pushFunctionsHistory() {
    functionsHistory = functionsHistory.slice(0, functionsHistoryIndex + 1);
    functionsHistory.push(snapshotFunctionsState());
    functionsHistoryIndex++;
    updateUndoRedoButtons();
}

function restoreFunctionsSnapshot(snapshot) {
    functionsState = snapshot.map(entry => {
        let ast = null;
        try { ast = compileGraphFormula(entry.latex); } catch (err) { /* war beim ursprünglichen Speichern bereits gültig */ }
        const singularities = ast ? findSingularities(ast) : [];
        return { id: entry.id, latex: entry.latex, visible: entry.visible, ast, singularities };
    });
    openFunctionMenuId = null;
    renderFunctionsList();
    updateUndoRedoButtons();
}

function undoFunctionsChange() {
    if (functionsHistoryIndex <= 0) return;
    functionsHistoryIndex--;
    restoreFunctionsSnapshot(functionsHistory[functionsHistoryIndex]);
}

function redoFunctionsChange() {
    if (functionsHistoryIndex >= functionsHistory.length - 1) return;
    functionsHistoryIndex++;
    restoreFunctionsSnapshot(functionsHistory[functionsHistoryIndex]);
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    if (undoBtn) undoBtn.disabled = functionsHistoryIndex <= 0;
    if (redoBtn) redoBtn.disabled = functionsHistoryIndex >= functionsHistory.length - 1;
}

function initUndoRedoButtons() {
    document.getElementById('undo')?.addEventListener('click', undoFunctionsChange);
    document.getElementById('redo')?.addEventListener('click', redoFunctionsChange);
    updateUndoRedoButtons();

    // Tastenkürzel wie in GeoGebra: Strg/Cmd+Z für Rückgängig, Strg/Cmd+Y
    // ODER Strg/Cmd+Shift+Z für Wiederholen (beide gängigen Konventionen
    // abgedeckt). Wird ignoriert, solange der Fokus in einem Eingabefeld
    // liegt – dort soll die native Text-Undo-Funktion des Browsers/von
    // MathLive unangetastet bleiben (z.B. beim Tippen einer Formel).
    function isTypingContext() {
        const el = document.activeElement;
        if (!el) return false;
        if (["INPUT", "TEXTAREA", "MATH-FIELD"].includes(el.tagName)) return true;
        return !!el.isContentEditable;
    }

    document.addEventListener('keydown', (event) => {
        if (!(event.ctrlKey || event.metaKey) || isTypingContext()) return;

        const key = event.key.toLowerCase();
        if (key === "z" && !event.shiftKey) {
            event.preventDefault();
            undoFunctionsChange();
        } else if (key === "y" || (key === "z" && event.shiftKey)) {
            event.preventDefault();
            redoFunctionsChange();
        }
    });
}

// Buchstabe nach Listenposition: A, B, ... Z, A1, B1, ... Z1, A2, ...
// Buchstabe UND Farbe werden aus der Position berechnet, nicht fest pro
// Funktion gespeichert – beim Löschen rücken nachfolgende Funktionen nach.
function letterForIndex(index) {
    const cycle = Math.floor(index / FUNCTION_LETTERS.length);
    const base = FUNCTION_LETTERS[index % FUNCTION_LETTERS.length];
    return cycle === 0 ? base : `${base}${cycle}`;
}

function colorForIndex(index) {
    return FUNCTION_COLORS[index % FUNCTION_COLORS.length];
}

// Kleine Farblegende im Graphen (Settings: "Legende anzeigen"). Wird nur bei
// Änderungen an der Funktionsliste neu befüllt, nicht pro Render-Frame –
// die reine Sichtbarkeit steuert render() selbst (siehe initCoordinateSystem).
function renderGraphLegend() {
    const legend = document.getElementById('graphLegend');
    if (!legend) return;

    const visibleEntries = functionsState
        .map((fn, index) => ({ fn, index }))
        .filter(({ fn }) => fn.visible);

    legend.innerHTML = visibleEntries.map(({ index }) => {
        const letter = letterForIndex(index);
        const color = colorForIndex(index);
        return `<div class="graphLegendItem"><span class="graphLegendDot" style="background-color:${color};"></span>${letter}(x)</div>`;
    }).join("");
}

// Leichte Eingabe-Hygiene für die Modal-Validierung. Eine vollständige
// mathematische Prüfung (lässt sich die Formel auswerten?) folgt mit der
// Funktionsdarstellung im Koordinatensystem – dafür wird der bestehende
// Parser aus Formel Umformer/Gleichungslöser wiederverwendet statt hier
// ein drittes Mal nachgebaut zu werden.
function validateFunctionInput(latex) {
    if (!latex || !latex.trim()) {
        return "Bitte gib eine Funktion ein.";
    }

    // Der frühere separate Klammer-Vorcheck ist entfernt: compileGraphFormula()
    // prüft Klammern jetzt selbst, mit präziseren, kontextbezogenen Meldungen
    // (z.B. "Der Zähler des Bruchs wurde nicht richtig abgeschlossen." statt
    // einer generischen "Klammern nicht korrekt geschlossen"-Meldung) – exakt
    // wie bei Formel Umformer und Gleichungslöser.
    try {
        compileGraphFormula(latex);
    } catch (err) {
        return err instanceof GraphFormulaError
            ? err.message
            : "Diese Funktion konnte nicht verarbeitet werden. Bitte überprüfe deine Eingabe.";
    }

    return null; // gültig
}

// Baut NUR die HTML-Liste neu auf (Buchstabe, Farbe, Formel, Sichtbarkeits-/
// Menü-Zustand) – OHNE Analyse-Neuberechnung. Für reine UI-Zustandsänderungen
// (Menü öffnen/schließen), bei denen sich an den Funktionen nichts ändert.
function renderFunctionListHTML() {
    const container = document.querySelector('.allFunctionsContainer');
    if (!container) return;

    if (functionsState.length === 0) {
        container.innerHTML = `<p class="functionListEmpty">Noch keine Funktion hinzugefügt.</p>`;
        return;
    }

    container.innerHTML = functionsState.map((fn, index) => {
        const letter = letterForIndex(index);
        const color = colorForIndex(index);
        const visibilityIcon = fn.visible ? "fa-eye" : "fa-eye-slash";
        const visibilityLabel = fn.visible ? "Ausblenden" : "Einblenden";
        const menuOpen = openFunctionMenuId === fn.id;

        return `
            <div class="function-item ${fn.visible ? "" : "is-hidden"}" data-id="${fn.id}">
                <span class="functionLetter">${letter}</span>
                <span class="functionColorDot" style="background-color:${color}; color:${color};"></span>
                <div class="functionFormula"><math-field read-only>${fn.latex}</math-field></div>
                <button type="button" class="functionVisibilityBtn ${fn.visible ? "" : "is-hidden-state"}" data-action="toggle-visibility" aria-label="${visibilityLabel}">
                    <i class="fa ${visibilityIcon}"></i>
                </button>
                <div class="functionMenuWrapper">
                    <button type="button" class="functionMenuBtn" data-action="toggle-menu" aria-haspopup="true" aria-expanded="${menuOpen}" aria-label="Menü öffnen">
                        <i class="fa fa-ellipsis-v"></i>
                    </button>
                    <div class="functionMenuDropdown ${menuOpen ? "is-open" : ""}">
                        <button type="button" class="functionMenuItem" data-action="edit"><i class="fa fa-pencil"></i> Bearbeiten</button>
                        <button type="button" class="functionMenuItem functionMenuItem--danger" data-action="delete"><i class="fa fa-trash"></i> Löschen</button>
                    </div>
                </div>
            </div>`;
    }).join("");
}

// Voller Zyklus: Analyse neu berechnen (Nullstellen/Extrema/Symmetrie/Marker),
// Tabelle/Rechenweg/Legende/Liste aktualisieren, Graph neu zeichnen. NUR bei
// tatsächlichen Datenänderungen aufrufen (Hinzufügen/Bearbeiten/Löschen/
// Sichtbarkeit) – für reine Menü-Interaktionen renderFunctionListHTML()
// direkt verwenden (siehe closeFunctionMenu() und initFunctionListEvents()).
function renderFunctionsList(options = {}) {
    const analysisData = computeAnalysisData();
    renderResultsTable(analysisData);
    updateFunctionMarkersCache(analysisData);
    renderRechenweg(analysisData);
    renderGraphLegend();

    if (options.autoScale) {
        const bounds = computeAutoScaleBounds(analysisData);
        if (bounds) requestAutoScale(bounds);
    }

    renderFunctionListHTML();
    requestGraphRedraw();
}
function closeFunctionMenu() {
    if (openFunctionMenuId === null) return;
    openFunctionMenuId = null;
    renderFunctionListHTML();
}

// Event-Delegation: ein Listener für Sichtbarkeit, Menü, Bearbeiten, Löschen
// statt pro Zeile einzeln zu binden (Liste wird bei jeder Änderung neu gerendert).
function initFunctionListEvents() {
    const container = document.querySelector('.allFunctionsContainer');
    if (!container) return;

    container.addEventListener('click', (event) => {
        const actionBtn = event.target.closest('[data-action]');
        if (!actionBtn) return;

        const item = actionBtn.closest('.function-item');
        const id = item ? parseInt(item.dataset.id, 10) : null;
        const action = actionBtn.dataset.action;

        event.stopPropagation();

        if (action === 'toggle-visibility' && id !== null) {
            const fn = functionsState.find(f => f.id === id);
            if (fn) fn.visible = !fn.visible;
            openFunctionMenuId = null;
            pushFunctionsHistory();
            renderFunctionsList();
        } else if (action === 'toggle-menu' && id !== null) {
            // Reine UI-Zustandsänderung – keine Analyse-Neuberechnung nötig.
            openFunctionMenuId = (openFunctionMenuId === id) ? null : id;
            renderFunctionListHTML();
        } else if (action === 'edit' && id !== null) {
            openFunctionMenuId = null;
            renderFunctionListHTML();
            openFunctionModalForEdit(id);
        } else if (action === 'delete' && id !== null) {
            functionsState = functionsState.filter(f => f.id !== id);
            openFunctionMenuId = null;
            pushFunctionsHistory();
            renderFunctionsList();
        }
    });

    // Menü schließen bei Klick außerhalb oder Escape
    document.addEventListener('click', closeFunctionMenu);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeFunctionMenu();
    });
}

// ==========================================================================
// MODAL "FUNKTION HINZUFÜGEN" / "BEARBEITEN"
// ==========================================================================
function initAddFunctionModal() {
    const addBtn = document.querySelector('#addFunctionButton');
    const modal = document.querySelector('#functionModal');
    const modalTitle = document.querySelector('#functionModalTitle');
    const cancelBtn = document.querySelector('#cancelFunctionBtn');
    const saveBtn = document.querySelector('#saveFunctionBtn');
    const input = document.querySelector('#functionInput'); // math-field Element
    const errorBox = document.getElementById('errorMessages');

    if (!addBtn || !modal || !modalTitle || !cancelBtn || !saveBtn || !input || !errorBox) return;

    let modalErrorValue = null; // Wert, der zum aktuell angezeigten Fehler geführt hat

    function showModalError(msg, value) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        modalErrorValue = value;
    }

    function hideModalError() {
        errorBox.style.display = 'none';
        modalErrorValue = null;
    }

    function openModal() {
        hideModalError();
        modal.classList.add('is-visible');
        // Doppeltes requestAnimationFrame statt fester setTimeout-Wartezeit:
        // stellt zuverlässig sicher, dass der Browser Sichtbarkeit/Layout
        // wirklich verarbeitet hat, bevor fokussiert wird. Ein zu früher
        // programmatischer Fokus-Aufruf ist der Grund, warum die physische
        // Tastatur gelegentlich erst nach Interaktion mit der virtuellen
        // Tastatur wieder reagiert hat.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => input.focus());
        });
    }

    // 1. Popup öffnen (Neu)
    addBtn.addEventListener('click', () => {
        editingFunctionId = null;
        modalTitle.textContent = 'Neue Funktion hinzufügen';
        saveBtn.textContent = 'Funktion hinzufügen';
        input.value = '';
        openModal();
    });

    // 1b. Popup öffnen (Bearbeiten) – von initFunctionListEvents() aufgerufen
    openFunctionModalForEdit = (id) => {
        const fn = functionsState.find(f => f.id === id);
        if (!fn) return;
        editingFunctionId = id;
        modalTitle.textContent = 'Funktion bearbeiten';
        saveBtn.textContent = 'Änderungen speichern';
        input.value = fn.latex;
        openModal();
    };

    // 2. Schließen (Abbrechen)
    const closeModal = () => {
        modal.classList.remove('is-visible');
        editingFunctionId = null;
        input.blur(); // sauberer Fokus-Zustand, damit der nächste Öffnen-Vorgang nicht auf Altlasten trifft
    };

    cancelBtn.addEventListener('click', closeModal);

    // Klick außerhalb schließt Modal
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // 3. Funktion speichern (Neu ODER Bearbeiten)
    const saveFunction = () => {
        const latexValue = input.value.trim();
        const error = validateFunctionInput(latexValue);

        if (error) {
            showModalError(error, latexValue);
            return;
        }

        // Kompilierung kann hier praktisch nicht mehr fehlschlagen (validateFunctionInput
        // hat das bereits geprüft) – try/catch bleibt trotzdem als Sicherheitsnetz,
        // damit ein unvorhergesehener Fall die Funktion nicht zeichnet statt abzustürzen.
        let ast = null;
        try { ast = compileGraphFormula(latexValue); } catch (err) { /* siehe Kommentar oben */ }
        const singularities = ast ? findSingularities(ast) : [];

        const isNewFunction = editingFunctionId === null;

        if (!isNewFunction) {
            const fn = functionsState.find(f => f.id === editingFunctionId);
            if (fn) { fn.latex = latexValue; fn.ast = ast; fn.singularities = singularities; }
        } else {
            functionsState.push({ id: nextFunctionId++, latex: latexValue, visible: true, ast, singularities });
        }

        pushFunctionsHistory();
        // Automatische Skalierung (falls aktiviert) nur beim Hinzufügen einer
        // NEUEN Funktion – beim Bearbeiten/Löschen/Toggle bliebe der Viewport
        // sonst unerwartet in Bewegung, während der Nutzer gerade manuell
        // navigiert hat.
        renderFunctionsList({ autoScale: isNewFunction });
        closeModal();
    };

    saveBtn.addEventListener('click', saveFunction);

    // 4. Tastatur-Support (Enter = Speichern, ESC = Abbrechen)
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Verhindert Zeilenumbruch im Formelfeld
            saveFunction();
        } else if (event.key === 'Escape') {
            closeModal();
        }
    });

    input.addEventListener('input', () => {
        // MathLive feuert bei Enter intern zusätzlich ein "input"-Event mit
        // demselben (weiterhin ungültigen) Wert – dieses Echo würde die
        // gerade erst gezeigte Fehlermeldung sofort wieder verstecken.
        // Nur bei einer TATSÄCHLICHEN Wertänderung ausblenden.
        if (modalErrorValue !== null && input.value.trim() === modalErrorValue) return;
        hideModalError();
    });

    
}

document.addEventListener('DOMContentLoaded', () => {
    initAddFunctionModal();
    initFunctionListEvents();
    renderFunctionsList();
    initUndoRedoButtons();
});


// ==========================================================================
// FUNKTIONSAUSWERTUNG – schlanker Parser NUR für numerische Auswertung an
// einer x-Stelle (kein Gleichungen-Lösen nötig, daher bewusst NICHT die
// große Engine aus Formel Umformer/Gleichungslöser wiederverwendet)
// ==========================================================================

class GraphFormulaError extends Error {}

// ==========================================================================
// BLACKLIST – identisch zu Formel Umformer/Gleichungslöser (bis auf die
// Ungleichungs-Meldung, an den Funktions-Kontext angepasst)
// ==========================================================================
const GRAPH_BLACKLIST_CHECKS = [
    { re: /\\int|\\iint|\\iiint|\\oint/, msg: "Integrale werden nicht unterstützt." },
    { re: /\\sum/, msg: "Summenzeichen werden nicht unterstützt." },
    { re: /\\prod/, msg: "Produktzeichen werden nicht unterstützt." },
    { re: /\\lim/, msg: "Grenzwerte werden nicht unterstützt." },
    { re: /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)\}/, msg: "Matrizen/Fallunterscheidungen werden nicht unterstützt." },
    { re: /\\vec|\\overrightarrow/, msg: "Vektoren werden nicht unterstützt." },
    { re: /\\det/, msg: "Determinanten werden nicht unterstützt." },
    { re: /\\in\b|\\notin|\\subset|\\subseteq|\\cup|\\cap|\\emptyset|\\forall|\\exists/, msg: "Mengenlehre wird nicht unterstützt." },
    { re: /\\Rightarrow|\\Leftrightarrow|\\rightarrow|\\wedge|\\vee|\\neg/, msg: "Logikoperatoren werden nicht unterstützt." },
    { re: /\\leq|\\geq|\\neq|\\approx|\\equiv|[<>]/, msg: "Ungleichungen werden nicht unterstützt – gib eine Funktion in der Form f(x) = ... ein." },
    { re: /\\partial|\\nabla|\\prime/, msg: "Ableitungen werden nicht unterstützt." },
    { re: /\\Im\b|\\Re\b|\\overline\{|\\bar\{|\\mathbb\{C\}/, msg: "Komplexe Zahlen werden nicht unterstützt." },
    { re: /\\binom|\\choose/, msg: "Binomialkoeffizienten werden nicht unterstützt." }
];

function checkGraphBlacklist(latex) {
    for (const { re, msg } of GRAPH_BLACKLIST_CHECKS) {
        if (re.test(latex)) throw new GraphFormulaError(msg);
    }
}

// Liest die Variable aus der linken Seite (z.B. "t" aus "f(t)=...", "r" aus
// "h(r)=..."). Ohne erkennbare Klammer-Variable (z.B. "y=2x+3" oder reine
// Eingabe ohne "=") wird "x" als Standard angenommen.
function extractGraphVariable(latex) {
    const eqIndex = latex.indexOf("=");
    if (eqIndex === -1) return "x";
    const lhs = latex.slice(0, eqIndex).replace(/\\left|\\right/g, "");
    const match = lhs.match(/\(\s*([a-zA-Z])\s*\)/);
    return match ? match[1] : "x";
}

// Findet das Ende einer Klammergruppe "{...}" (auch verschachtelt).
function findMatchingBrace(latex, start) {
    let depth = 0;
    for (let k = start; k < latex.length; k++) {
        if (latex[k] === "{") depth++;
        else if (latex[k] === "}") {
            depth--;
            if (depth === 0) return k + 1;
        }
    }
    throw new GraphFormulaError("Eine geschweifte Klammer wurde nicht richtig geschlossen.");
}

// Liest EIN Argument von \frac oder \sqrt ein – entweder eine geklammerte
// Gruppe {...} oder (LaTeX-Kurzschreibweise für einstellige Argumente, z.B.
// "\frac34" für 3/4) genau EIN einzelnes Zeichen bzw. "\pi". Gibt fertige
// Tokens zurück, bereits in LBRACE/RBRACE eingebettet, damit der Parser nur
// eine einzige Form kennen muss.
function readBraceOrBareArgument(latex, i, contextLabel, varName) {
    const n = latex.length;
    while (i < n && /\s/.test(latex[i])) i++;

    if (latex[i] === "{") {
        const end = findMatchingBrace(latex, i);
        const inner = latex.slice(i + 1, end - 1);
        const innerTokens = tokenizeGraphFormula(inner, varName).slice(0, -1); // ohne EOF
        return { tokens: [{ type: "LBRACE" }, ...innerTokens, { type: "RBRACE" }], nextIndex: end };
    }
    if (latex[i] === "\\") {
        let j = i + 1;
        while (j < n && /[a-zA-Z]/.test(latex[j])) j++;
        const cmd = latex.slice(i + 1, j);
        if (cmd !== "pi") {
            throw new GraphFormulaError(`Nach „${contextLabel}" ohne geschweifte Klammern wird eine einzelne Ziffer, „${varName}" oder „\\pi" erwartet.`);
        }
        return { tokens: [{ type: "LBRACE" }, { type: "CONST", name: "pi" }, { type: "RBRACE" }], nextIndex: j };
    }
    if (/[0-9]/.test(latex[i])) {
        return { tokens: [{ type: "LBRACE" }, { type: "NUM", value: parseFloat(latex[i]) }, { type: "RBRACE" }], nextIndex: i + 1 };
    }
    if (latex[i] === varName) {
        return { tokens: [{ type: "LBRACE" }, { type: "VAR" }, { type: "RBRACE" }], nextIndex: i + 1 };
    }
    if (latex[i] === "e") {
        return { tokens: [{ type: "LBRACE" }, { type: "CONST", name: "e" }, { type: "RBRACE" }], nextIndex: i + 1 };
    }

    throw new GraphFormulaError(`„${contextLabel}" ist unvollständig.`);
}

function tokenizeGraphFormula(latex, varName) {
    const tokens = [];
    let i = 0;
    const n = latex.length;

    while (i < n) {
        const ch = latex[i];
        if (/\s/.test(ch)) { i++; continue; }

        if (ch === "\\") {
            let j = i + 1;
            while (j < n && /[a-zA-Z]/.test(latex[j])) j++;
            const cmd = latex.slice(i + 1, j);
            i = j;
            switch (cmd) {
                case "left": case "right": continue;
                case "cdot": case "times": tokens.push({ type: "MUL" }); continue;
                case "div": tokens.push({ type: "DIV" }); continue;
                case "frac": {
                    const numArg = readBraceOrBareArgument(latex, i, "\\frac", varName);
                    const denArg = readBraceOrBareArgument(latex, numArg.nextIndex, "\\frac", varName);
                    tokens.push({ type: "FRAC" }, ...numArg.tokens, ...denArg.tokens);
                    i = denArg.nextIndex;
                    continue;
                }
                case "sqrt": {
                    const arg = readBraceOrBareArgument(latex, i, "\\sqrt", varName);
                    tokens.push({ type: "SQRT" }, ...arg.tokens);
                    i = arg.nextIndex;
                    continue;
                }
                case "pi": tokens.push({ type: "CONST", name: "pi" }); continue;
                case "sin": case "cos": case "tan": case "ln":
                    tokens.push({ type: "FUNC", name: cmd }); continue;
                case "log": tokens.push({ type: "FUNC", name: "log" }); continue;
                case "arcsin": tokens.push({ type: "FUNC", name: "asin" }); continue;
                case "arccos": tokens.push({ type: "FUNC", name: "acos" }); continue;
                case "arctan": tokens.push({ type: "FUNC", name: "atan" }); continue;
                default:
                    throw new GraphFormulaError(`Der Befehl „\\${cmd}" wird für Funktionsgraphen nicht unterstützt. Unterstützt werden Zahlen, ${varName}, +, −, ×, ÷, Potenzen, Klammern sowie sin, cos, tan, sin⁻¹, cos⁻¹, tan⁻¹, √, ln, log, π und Beträge.`);
            }
        }

        if (ch === "{") { tokens.push({ type: "LBRACE" }); i++; continue; }
        if (ch === "}") { tokens.push({ type: "RBRACE" }); i++; continue; }
        if (ch === "(") { tokens.push({ type: "LPAREN" }); i++; continue; }
        if (ch === ")") { tokens.push({ type: "RPAREN" }); i++; continue; }
        if (ch === "|") { tokens.push({ type: "PIPE" }); i++; continue; }
        if (ch === "^") { tokens.push({ type: "CARET" }); i++; continue; }
        if (ch === "+") { tokens.push({ type: "PLUS" }); i++; continue; }
        if (ch === "-") { tokens.push({ type: "MINUS" }); i++; continue; }
        if (ch === "*") { tokens.push({ type: "MUL" }); i++; continue; }
        if (ch === "/") { tokens.push({ type: "DIV" }); i++; continue; }
        if (ch === "π") { tokens.push({ type: "CONST", name: "pi" }); i++; continue; }

        if (/[0-9]/.test(ch) || ((ch === "." || ch === ",") && /[0-9]/.test(latex[i + 1] || ""))) {
            let raw = "";
            while (i < n && /[0-9]/.test(latex[i])) { raw += latex[i]; i++; }
            if (latex[i] === "." || latex[i] === ",") {
                raw += "."; i++;
                while (i < n && /[0-9]/.test(latex[i])) { raw += latex[i]; i++; }
            }
            tokens.push({ type: "NUM", value: parseFloat(raw) });
            continue;
        }

        if (ch === varName) { tokens.push({ type: "VAR" }); i++; continue; }
        if (ch === "e") { tokens.push({ type: "CONST", name: "e" }); i++; continue; }
        if (/[a-zA-Z]/.test(ch)) {
            throw new GraphFormulaError(`Nur die Variable „${varName}" wird unterstützt (gefunden: „${ch}"). Achte darauf, dass die Variable in der Klammer links vom „=" mit der Variable auf der rechten Seite übereinstimmt.`);
        }

        throw new GraphFormulaError(`Das Zeichen „${ch}" wird nicht erkannt. Bitte überprüfe deine Eingabe.`);
    }

    tokens.push({ type: "EOF" });
    return tokens;
}

function compileGraphFormula(latex) {
    checkGraphBlacklist(latex);

    const eqCount = (latex.match(/=/g) || []).length;
    if (eqCount > 1) {
        throw new GraphFormulaError("Es darf nur ein Gleichheitszeichen (=) vorkommen.");
    }

    const varName = extractGraphVariable(latex);
    const eqIndex = latex.indexOf("=");
    const rhs = eqIndex === -1 ? latex : latex.slice(eqIndex + 1);
    return parseGraphExpression(tokenizeGraphFormula(rhs, varName));
}

function parseGraphExpression(tokens) {
    let pos = 0;
    let openPipes = 0;
    const peek = () => tokens[pos];
    const advance = () => tokens[pos++];
    const expect = (type, msg) => {
        if (peek().type !== type) throw new GraphFormulaError(msg || `Erwartet: ${type}`);
        return advance();
    };
    const atomStartTypes = ["NUM", "VAR", "CONST", "LPAREN", "PIPE", "FRAC", "SQRT", "FUNC"];
    const startsAtom = (t) => atomStartTypes.includes(t);

    function parseExpr() {
        let node = parseTerm();
        while (peek().type === "PLUS" || peek().type === "MINUS") {
            const op = advance().type;
            node = { type: op === "PLUS" ? "add" : "sub", left: node, right: parseTerm() };
        }
        return node;
    }

    function parseTerm() {
        let node = parseFactor();
        while (true) {
            const t = peek().type;
            if (t === "MUL") { advance(); node = { type: "mul", left: node, right: parseFactor() }; }
            else if (t === "DIV") { advance(); node = { type: "div", left: node, right: parseFactor() }; }
            else if (t === "PIPE" && openPipes > 0) break;
            else if (startsAtom(t)) { node = { type: "mul", left: node, right: parseFactor() }; }
            else break;
        }
        return node;
    }

    function parseFactor() {
        if (peek().type === "MINUS") { advance(); return { type: "neg", arg: parseFactor() }; }
        return parsePower();
    }

    function parseExponent() {
        if (peek().type === "LBRACE") {
            advance();
            const e = parseExpr();
            expect("RBRACE", "Der Exponent wurde nicht richtig geschlossen.");
            return e;
        }
        return parseFactor();
    }

    function parsePower() {
        let base = parseAtom();
        if (peek().type === "CARET") {
            advance();
            return { type: "pow", base, exp: parseExponent() };
        }
        return base;
    }

    function parseAtom() {
        const t = peek();
        switch (t.type) {
            case "NUM": advance(); return { type: "num", value: t.value };
            case "VAR": advance(); return { type: "var" };
            case "CONST": advance(); return { type: "const", name: t.name };
            case "LPAREN": {
                advance();
                const e = parseExpr();
                expect("RPAREN", "Eine runde Klammer wurde nicht geschlossen.");
                return e;
            }
            case "PIPE": {
                openPipes++;
                advance();
                const e = parseExpr();
                expect("PIPE", "Die Betragsstriche wurden nicht geschlossen.");
                openPipes--;
                return { type: "abs", arg: e };
            }
            case "FRAC": {
                advance();
                expect("LBRACE", "Der Bruch ist unvollständig – der Zähler fehlt.");
                const num = parseExpr();
                expect("RBRACE", "Der Zähler des Bruchs wurde nicht richtig abgeschlossen.");
                expect("LBRACE", "Der Bruch ist unvollständig – der Nenner fehlt.");
                const den = parseExpr();
                expect("RBRACE", "Der Nenner des Bruchs wurde nicht richtig abgeschlossen.");
                return { type: "div", left: num, right: den };
            }
            case "SQRT": {
                advance();
                expect("LBRACE", "Der Inhalt der Wurzel fehlt.");
                const arg = parseExpr();
                expect("RBRACE", "Die Wurzel wurde nicht richtig geschlossen.");
                return { type: "sqrt", arg };
            }
            case "FUNC": {
                advance();
                if (peek().type === "LPAREN") {
                    advance();
                    const arg = parseExpr();
                    expect("RPAREN", "Die Klammer nach der Funktion wurde nicht geschlossen.");
                    return { type: "func", name: t.name, arg };
                }
                return { type: "func", name: t.name, arg: parseFactor() };
            }
            default:
                throw new GraphFormulaError("Die Formel enthält an dieser Stelle ein unerwartetes Element.");
        }
    }

    const expr = parseExpr();
    if (peek().type !== "EOF") {
        throw new GraphFormulaError("Am Ende der Formel befinden sich überzählige Zeichen. Bitte überprüfe deine Eingabe.");
    }
    return expr;
}

// Wertet einen AST-Knoten an einer konkreten x-Stelle aus. Gibt null zurück
// bei Definitionslücken (Division durch 0, Wurzel aus negativer Zahl, ln von
// nicht-positiver Zahl, ...) statt NaN/Infinity durchzureichen – so kann die
// Rendering-Seite daraus sauber eine Lücke im Funktionsgraphen machen.
function evaluateGraphNode(node, xValue) {
    switch (node.type) {
        case "num": return node.value;
        case "var": return xValue;
        case "const": return node.name === "pi" ? Math.PI : Math.E;
        case "neg": { const a = evaluateGraphNode(node.arg, xValue); return a === null ? null : -a; }
        case "add": { const a = evaluateGraphNode(node.left, xValue), b = evaluateGraphNode(node.right, xValue); return (a === null || b === null) ? null : a + b; }
        case "sub": { const a = evaluateGraphNode(node.left, xValue), b = evaluateGraphNode(node.right, xValue); return (a === null || b === null) ? null : a - b; }
        case "mul": { const a = evaluateGraphNode(node.left, xValue), b = evaluateGraphNode(node.right, xValue); return (a === null || b === null) ? null : a * b; }
        case "div": {
            const a = evaluateGraphNode(node.left, xValue), b = evaluateGraphNode(node.right, xValue);
            return (a === null || b === null || b === 0) ? null : a / b;
        }
        case "pow": {
            const a = evaluateGraphNode(node.base, xValue), b = evaluateGraphNode(node.exp, xValue);
            if (a === null || b === null) return null;
            if (a < 0 && !Number.isInteger(b)) return null; // nicht reell
            return Math.pow(a, b);
        }
        case "sqrt": {
            const a = evaluateGraphNode(node.arg, xValue);
            return (a === null || a < 0) ? null : Math.sqrt(a);
        }
        case "abs": {
            const a = evaluateGraphNode(node.arg, xValue);
            return a === null ? null : Math.abs(a);
        }
        case "func": {
            const a = evaluateGraphNode(node.arg, xValue);
            if (a === null) return null;
            switch (node.name) {
                case "sin": return Math.sin(a);
                case "cos": return Math.cos(a);
                case "tan": return Math.tan(a);
                case "ln": return a > 0 ? Math.log(a) : null;
                case "log": return a > 0 ? Math.log(a) / Math.LN10 : null;
                case "asin": return (a < -1 || a > 1) ? null : Math.asin(a);
                case "acos": return (a < -1 || a > 1) ? null : Math.acos(a);
                case "atan": return Math.atan(a);
                default: return null;
            }
        }
        default: return null;
    }
}




// Globales Objekt mit allen Einstellungen
const settingsState = {
    showGrid: true,
    showAxes: true,
    showLabels: true,
    showLegend: true,
    markRoots: true,
    markIntersects: true,
    markYIntercept: true,
    autoScale: true,
    zoomMouseWheel: true,
    panEnabled: true
};

function initSettingsModal() {
    const settingsBtn = document.querySelector('#settings'); // Toolbar Button
    const settingsModal = document.querySelector('#settingsModal');
    const closeBtn = document.querySelector('#closeSettingsBtn');

    if (!settingsModal || !closeBtn) return;

    // 1. Modal öffnen
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('is-visible');
        });
    }

    // 2. Modal schließen (per Button)
    const closeModal = () => {
        settingsModal.classList.remove('is-visible');
    };

    closeBtn.addEventListener('click', closeModal);

    // Per ESC-Taste schließen
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsModal.classList.contains('is-visible')) {
            closeModal();
        }
    });

    // 3. Status-Updates bei Änderungen der Switches (Live Preview!)
    const checkboxes = settingsModal.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const key = e.target.id.replace('set-', '');

            if (key in settingsState) {
                settingsState[key] = e.target.checked;
                requestGraphRedraw();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initSettingsModal);




// ==========================================================================
// FUNKTIONSANALYSE – numerische Nullstellen-/Extrempunkt-/Symmetriebestimmung
// für die Ergebnisse-Tabelle. Bewusst numerisch statt symbolisch: der
// Funktionsrechner hat keine Ableitungs-Engine, und der Parser erlaubt
// beliebige Kombinationen aus trig/ln/Wurzel/Betrag – eine allgemeine
// analytische Lösung ist damit nicht praktikabel. Durchsucht x ∈ [-50, 50].
// Wendepunkte werden NICHT berechnet (zweite Ableitung ist bei numerischer
// Schätzung zu störanfällig) – zeigt "–", analog zu ggT/kgV bei
// Dezimalzahlen in der Zahlenanalyse.
// ==========================================================================

const ANALYSIS_RANGE = 50;
const ANALYSIS_SAMPLES = 6000;
const ANALYSIS_MAX_ENTRIES = 8;
const ANALYSIS_DERIV_H = 1e-4;
// Gröbere Schrittweite für den Kontinuitäts-Check in findFunctionExtrema():
// an einer echten Extremstelle bleibt die Steigung auch mit größerem h nahe 0,
// an einer Definitionslücke (1/x, tan(x), ...) divergiert sie dort massiv.
const ANALYSIS_DERIV_COARSE_H = 0.01;
const ANALYSIS_EXTREMA_SLOPE_LIMIT = 1;

function formatAnalysisNum(n) {
    return (Math.round(n * 1e4) / 1e4).toString();
}

function analysisSafeEval(ast, x) {
    const v = evaluateGraphNode(ast, x);
    return (v === null || !Number.isFinite(v)) ? null : v;
}

function analysisDerivative(ast, x, h = ANALYSIS_DERIV_H) {
    const left = analysisSafeEval(ast, x - h);
    const right = analysisSafeEval(ast, x + h);
    if (left === null || right === null) return null;
    return (right - left) / (2 * h);
}

function analysisBisect(g, a, b, ga) {
    for (let i = 0; i < 30; i++) {
        const mid = (a + b) / 2;
        const gm = g(mid);
        if (gm === null) return null;
        if ((ga < 0) === (gm < 0)) { a = mid; ga = gm; } else { b = mid; }
    }
    return (a + b) / 2;
}

function analysisDedupe(values, tolerance = 1e-2) {
    const sorted = [...values].sort((a, b) => a - b);
    const result = [];
    sorted.forEach(v => {
        if (result.length === 0 || Math.abs(v - result[result.length - 1]) > tolerance) {
            result.push(v);
        }
    });
    return result;
}

function findFunctionRoots(ast) {
    const step = (2 * ANALYSIS_RANGE) / ANALYSIS_SAMPLES;
    const roots = [];
    let prevX = -ANALYSIS_RANGE;
    let prevY = analysisSafeEval(ast, prevX);

    for (let i = 1; i <= ANALYSIS_SAMPLES; i++) {
        const x = -ANALYSIS_RANGE + i * step;
        const y = analysisSafeEval(ast, x);

        if (prevY !== null && y !== null && (prevY < 0) !== (y < 0)) {
            const root = analysisBisect(v => analysisSafeEval(ast, v), prevX, x, prevY);
            // Echte Nullstelle vs. Sprungstelle (z.B. 1/x bei x=0) unterscheiden:
            // an einer echten Nullstelle liegt |f(root)| nahe 0, an einer
            // Polstelle bleibt der Wert deutlich von 0 entfernt.
            if (root !== null) {
                const value = analysisSafeEval(ast, root);
                if (value !== null && Math.abs(value) < 1e-3) roots.push(root);
            }
        }
        prevX = x; prevY = y;
    }

    return analysisDedupe(roots);
}

function findSingularities(ast) {
    const points = [];

    function walk(node) {
        if (!node) return;
        switch (node.type) {
            case "div":
                points.push(...findFunctionRoots(node.right));
                walk(node.left);
                walk(node.right);
                break;
            case "func":
                if (node.name === "tan") {
                    points.push(...findFunctionRoots({ type: "func", name: "cos", arg: node.arg }));
                }
                walk(node.arg);
                break;
            case "neg": case "sqrt": case "abs":
                walk(node.arg);
                break;
            case "add": case "sub": case "mul":
                walk(node.left);
                walk(node.right);
                break;
            case "pow":
                walk(node.base);
                walk(node.exp);
                break;
            default:
                break; // num, var, const – keine Kinder
        }
    }

    walk(ast);
    return analysisDedupe(points);
}

function findFunctionExtrema(ast) {
    const step = (2 * ANALYSIS_RANGE) / ANALYSIS_SAMPLES;
    const found = [];
    let prevX = -ANALYSIS_RANGE;
    let prevD = analysisDerivative(ast, prevX);

    for (let i = 1; i <= ANALYSIS_SAMPLES; i++) {
        const x = -ANALYSIS_RANGE + i * step;
        const d = analysisDerivative(ast, x);

        if (prevD !== null && d !== null && (prevD < 0) !== (d < 0)) {
            const critX = analysisBisect(v => analysisDerivative(ast, v), prevX, x, prevD);
            if (critX !== null) {
                // Klassifikation über direkten Wertevergleich statt zweiter
                // Ableitung (numerisch robuster für diesen Schritt).
                const yHere = analysisSafeEval(ast, critX);
                const yLeft = analysisSafeEval(ast, critX - 0.01);
                const yRight = analysisSafeEval(ast, critX + 0.01);
                if (yHere !== null && yLeft !== null && yRight !== null) {
                    const isMax = yHere > yLeft && yHere > yRight;
                    const isMin = yHere < yLeft && yHere < yRight;

                    // Definitionslücken-Filter: An einer Polstelle (1/x bei x=0,
                    // tan(x) bei π/2+kπ, ...) kann die fein geschätzte Ableitung
                    // (h=1e-4) einen Vorzeichenwechsel vortäuschen, weil x-h/x+h
                    // die Lücke überspannen – der Wertevergleich oben erkennt das
                    // nicht, da die Funktion auf einer Seite gegen +∞, auf der
                    // anderen gegen −∞ läuft. Mit deutlich größerem h bleibt die
                    // Steigung an einer ECHTEN Extremstelle weiter nahe 0, an
                    // einer Polstelle divergiert sie – das trennt beide sauber.
                    if (isMax || isMin) {
                        const coarseSlope = analysisDerivative(ast, critX, ANALYSIS_DERIV_COARSE_H);
                        if (coarseSlope !== null && Math.abs(coarseSlope) < ANALYSIS_EXTREMA_SLOPE_LIMIT) {
                            found.push({ x: critX, y: yHere, type: isMax ? "max" : "min" });
                        }
                    }
                }
            }
        }
        prevX = x; prevD = d;
    }

    found.sort((a, b) => a.x - b.x);
    const result = [];
    found.forEach(c => {
        const last = result[result.length - 1];
        if (!last || Math.abs(c.x - last.x) > 1e-2) result.push(c);
    });
    return result;
}

function checkFunctionSymmetry(ast) {
    const testPoints = [0.5, 1, 1.7, 2.3, 3.1, 5, 8.4, 12];
    let allEven = true, allOdd = true, anyValid = false;

    for (const x of testPoints) {
        const fPos = analysisSafeEval(ast, x);
        const fNeg = analysisSafeEval(ast, -x);
        if (fPos === null || fNeg === null) continue;
        anyValid = true;
        if (Math.abs(fPos - fNeg) > 1e-3) allEven = false;
        if (Math.abs(fPos + fNeg) > 1e-3) allOdd = false;
    }

    if (!anyValid) return "–";
    if (allEven) return "Achsensymmetrisch (y-Achse)";
    if (allOdd) return "Punktsymmetrisch (Ursprung)";
    return "Keine";
}

function formatAnalysisList(points, formatter) {
    if (points.length === 0) return "Keine";
    const shown = points.slice(0, ANALYSIS_MAX_ENTRIES).map(formatter);
    const extra = points.length - shown.length;
    return shown.join(", ") + (extra > 0 ? `, … (+${extra} weitere)` : "");
}

function analyzeFunction(fn, index) {
    const varName = extractGraphVariable(fn.latex);
    const name = `${letterForIndex(index)}(${varName})`;

    if (!fn.ast) {
        return { name, nullstellen: "–", yAbschnitt: "–", extrempunkte: "–", wendepunkte: "–", symmetrie: "–", raw: null };
    }

    const roots = findFunctionRoots(fn.ast);
    const yValue = analysisSafeEval(fn.ast, 0);
    const extrema = findFunctionExtrema(fn.ast);

    return {
        name,
        nullstellen: formatAnalysisList(roots, x => `N(${formatAnalysisNum(x)} | 0)`),
        yAbschnitt: yValue === null ? "Nicht definiert" : `S_y(0 | ${formatAnalysisNum(yValue)})`,
        extrempunkte: formatAnalysisList(extrema, e => `${e.type === "max" ? "Hochpunkt" : "Tiefpunkt"}(${formatAnalysisNum(e.x)} | ${formatAnalysisNum(e.y)})`),
        wendepunkte: "–",
        symmetrie: checkFunctionSymmetry(fn.ast),
        raw: { roots, yValue, extrema }
    };
}

function computeAnalysisData() {
    return functionsState.map((fn, index) => analyzeFunction(fn, index));
}

// ==========================================================================
// GRAPH-MARKER (Nullstellen, y-Achsenabschnitt, Schnittpunkte) – nutzen die
// Rohdaten aus computeAnalysisData() weiter. Wird NUR bei Änderungen an der
// Funktionsliste neu berechnet, NICHT in render() – Pan/Zoom bleibt dadurch
// bei der reinen Koordinatenumrechnung aus Fix 2 (Pooling), ohne erneute
// Nullstellen-/Schnittpunktsuche pro Frame.
// ==========================================================================

let functionMarkersCache = { roots: [], yIntercepts: [], intersections: [] };

function analysisDiffFn(astA, astB) {
    return x => {
        const a = analysisSafeEval(astA, x);
        const b = analysisSafeEval(astB, x);
        return (a === null || b === null) ? null : a - b;
    };
}

function dedupePoints(points, tolerance = 1e-2) {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const result = [];
    sorted.forEach(p => {
        const last = result[result.length - 1];
        if (!last || Math.abs(p.x - last.x) > tolerance) result.push(p);
    });
    return result;
}

function findFunctionIntersections(astA, astB) {
    const step = (2 * ANALYSIS_RANGE) / ANALYSIS_SAMPLES;
    const diff = analysisDiffFn(astA, astB);
    const points = [];
    let prevX = -ANALYSIS_RANGE;
    let prevD = diff(prevX);

    for (let i = 1; i <= ANALYSIS_SAMPLES; i++) {
        const x = -ANALYSIS_RANGE + i * step;
        const d = diff(x);

        if (prevD !== null && d !== null && (prevD < 0) !== (d < 0)) {
            const crossX = analysisBisect(diff, prevX, x, prevD);
            if (crossX !== null) {
                // Wie bei Nullstellen: echten Schnittpunkt von einer Polstelle
                // unterscheiden (z.B. tan(x) springt, das sieht beim Sampling
                // wie ein Vorzeichenwechsel der Differenz aus).
                const yA = analysisSafeEval(astA, crossX);
                const yB = analysisSafeEval(astB, crossX);
                if (yA !== null && yB !== null && Math.abs(yA - yB) < 1e-2) {
                    points.push({ x: crossX, y: yA });
                }
            }
        }
        prevX = x; prevD = d;
    }

    return dedupePoints(points);
}

function updateFunctionMarkersCache(analysisData) {
    const roots = [];
    const yIntercepts = [];

    functionsState.forEach((fn, index) => {
        if (!fn.visible) return;
        const raw = analysisData[index] && analysisData[index].raw;
        if (!raw) return;
        raw.roots.forEach(x => roots.push({ x, y: 0 }));
        if (raw.yValue !== null) yIntercepts.push({ x: 0, y: raw.yValue });
    });

    const intersections = [];
    const visible = functionsState.filter(fn => fn.visible && fn.ast);
    for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
            intersections.push(...findFunctionIntersections(visible[i].ast, visible[j].ast));
        }
    }

    functionMarkersCache = { roots, yIntercepts, intersections };
}

// Bounding-Box aus allen aktuell bekannten "interessanten" Punkten (Nullstellen,
// y-Achsenabschnitt, Extrempunkte, Schnittpunkte) – Basis für "Automatische
// Skalierung".
function computeAutoScaleBounds(analysisData) {
    const xs = [];
    const ys = [];

    functionsState.forEach((fn, index) => {
        if (!fn.visible) return;
        const raw = analysisData[index] && analysisData[index].raw;
        if (!raw) return;
        raw.roots.forEach(x => { xs.push(x); ys.push(0); });
        if (raw.yValue !== null) { xs.push(0); ys.push(raw.yValue); }
        raw.extrema.forEach(e => { xs.push(e.x); ys.push(e.y); });
    });

    functionMarkersCache.intersections.forEach(p => { xs.push(p.x); ys.push(p.y); });

    if (xs.length === 0) return null;

    return {
        minX: Math.min(...xs), maxX: Math.max(...xs),
        minY: Math.min(...ys), maxY: Math.max(...ys)
    };
}

function renderResultsTable(functionsData) {
    const table = document.querySelector('#resultsTable');
    if (!table) return;

    // Table leeren
    table.innerHTML = '';

    // --- 1. HEAD (Für Desktop) ---
    const thead = document.createElement('thead');
    let headHTML = '<tr><th>Kennwert</th>';
    functionsData.forEach(fn => {
        headHTML += `<th>${fn.name}</th>`;
    });
    headHTML += '</tr>';
    thead.innerHTML = headHTML;
    table.appendChild(thead);

    // --- 2. BODY (Zeilen für Kennwerte) ---
    const tbody = document.createElement('tbody');

    // Liste aller Kategorien, die ausgegeben werden sollen
    const categories = [
        { key: 'nullstellen', label: 'Nullstellen' },
        { key: 'yAbschnitt', label: 'y-Achsenabschnitt' },
        { key: 'extrempunkte', label: 'Extrempunkte' },
        { key: 'wendepunkte', label: 'Wendepunkte' },
        { key: 'symmetrie', label: 'Symmetrie' }
    ];

    // Für jede Kategorie eine Tabellenzeile erstellen
    categories.forEach(cat => {
        const tr = document.createElement('tr');

        // Erste Spalte: Kategorie-Name
        let rowHTML = `<td class="mobile-card-header"><strong>${cat.label}</strong></td>`;

        // Für jede Funktion den entsprechenden Wert einfügen
        functionsData.forEach(fn => {
            const val = fn[cat.key] || '-';
            // data-label sorgt auf Mobile für den vorangestellten Text!
            rowHTML += `<td data-label="${cat.label}:">${val}</td>`;
        });

        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);
    });

   table.appendChild(tbody);
}

// Rechenweg-Bereich: pro Funktion eine kompakte Erklärung der numerischen
// Methode + Ergebnisse (siehe computeAnalysisData/analyzeFunction). Bewusst
// KEINE Schritt-für-Schritt-Algebra wie bei Gleichungslöser/Formel Umformer,
// da hier keine symbolische Ableitung existiert – stattdessen Transparenz
// darüber, WIE numerisch gesucht wurde und WAS gefunden wurde.
function buildFunctionRechenweg(fn, entry) {
    const label = entry.name;

    if (!entry.raw) {
        return `
            <div class="step-container">
                <div class="step-title">${label}</div>
                <div class="step-text">„${fn.latex}" konnte nicht ausgewertet werden.</div>
            </div>`;
    }

    const { roots, yValue } = entry.raw;
    const rootsResult = roots.length > 0 ? roots.map(x => formatAnalysisNum(x)).join(", ") : "keine gefunden";
    const yResult = yValue === null ? "nicht definiert" : formatAnalysisNum(yValue);

    return `
        <div class="step-container">
            <div class="step-title">${label} – Nullstellen</div>
            <div class="step-text">Numerische Vorzeichenwechsel-Suche im Bereich x ∈ [−50, 50], anschließend per Bisektion eingegrenzt (keine symbolische Auflösung, da beliebige Funktionsterme wie trigonometrische Ausdrücke, Wurzeln oder Beträge unterstützt werden).</div>
            <div class="step-formula-box">Gefundene x-Werte: ${rootsResult}</div>
        </div>
        <div class="step-container">
            <div class="step-title">${label} – y-Achsenabschnitt</div>
            <div class="step-text">Direkte Auswertung an der Stelle x = 0:</div>
            <div class="step-formula-box">${label} bei x=0: ${yResult}</div>
        </div>
        <div class="step-container">
            <div class="step-title">${label} – Extrempunkte</div>
            <div class="step-text">Die Ableitung wird über den zentralen Differenzenquotienten geschätzt. Vorzeichenwechsel der Ableitung markieren Kandidaten, die anschließend durch Vergleich mit den Nachbarwerten als Hoch- oder Tiefpunkt klassifiziert werden.</div>
        </div>
        <div class="step-container">
            <div class="step-title">${label} – Symmetrie</div>
            <div class="step-text">Stichprobenvergleich von ${label} an mehreren Stellen x und −x.</div>
            <div class="step-sub-solution">Wendepunkte werden aktuell nicht berechnet – die zweite Ableitung ist bei rein numerischer Schätzung zu störanfällig für ein verlässliches Ergebnis.</div>
        </div>`;
}

function renderRechenweg(analysisData) {
    const container = document.getElementById('rechenwegOutput');
    if (!container) return;

    if (functionsState.length === 0) {
        container.innerHTML = `<p class="functionListEmpty">Noch keine Funktion hinzugefügt.</p>`;
        return;
    }

    container.innerHTML = functionsState
        .map((fn, index) => buildFunctionRechenweg(fn, analysisData[index]))
        .join("");
}



// ==========================================================================
// KOORDINATENSYSTEM – SVG-Viewport mit Grid, Achsen, Pan & Zoom
// ==========================================================================
function initCoordinateSystem() {
    const container = document.querySelector(".cordSystemContainer");
    const svg = document.getElementById("functionGraphSvg");
    const gridGroup = document.getElementById("graphGrid");
    const axesGroup = document.getElementById("graphAxes");
    const labelsGroup = document.getElementById("graphLabels");
    const functionsGroup = document.getElementById("graphFunctions");
    const markersGroup = document.getElementById("graphMarkers");
    const legendEl = document.getElementById("graphLegend");
    if (!container || !svg || !gridGroup || !axesGroup || !labelsGroup || !functionsGroup || !markersGroup) return;

    const svgNS = "http://www.w3.org/2000/svg";

    // ── Viewport-State ────────────────────────────────────────────────────
    // 1:1-Skalierung (mathematisch korrekt): eine Einheit ist auf x und y
    // gleich viele Pixel groß, damit z.B. Steigungen visuell stimmen.
    const viewport = {
        centerX: 0,
        centerY: 0,
        pixelsPerUnit: 40
    };

    let widthPx = 0;
    let heightPx = 0;

    // ── Koordinatentransformation ────────────────────────────────────────
    function toScreenX(mathX) { return widthPx / 2 + (mathX - viewport.centerX) * viewport.pixelsPerUnit; }
    function toScreenY(mathY) { return heightPx / 2 - (mathY - viewport.centerY) * viewport.pixelsPerUnit; }
    function toMathX(screenX) { return viewport.centerX + (screenX - widthPx / 2) / viewport.pixelsPerUnit; }
    function toMathY(screenY) { return viewport.centerY - (screenY - heightPx / 2) / viewport.pixelsPerUnit; }

    function clampZoom(value) {
        return Math.min(4000, Math.max(2, value));
    }

    // "Schöne" Schrittweite ermitteln (1/2/5 · 10^n), Ziel: ~70px pro Schritt
    function niceStep() {
        const targetPx = 70;
        const rawUnit = targetPx / viewport.pixelsPerUnit;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawUnit)));
        const residual = rawUnit / magnitude;
        let niceResidual;
        if (residual < 1.5) niceResidual = 1;
        else if (residual < 3.5) niceResidual = 2;
        else if (residual < 7.5) niceResidual = 5;
        else niceResidual = 10;
        return niceResidual * magnitude;
    }

    // Rundet Anzeige-Werte, um Fließkomma-Reste (0.30000000004) zu killen
    function formatLabel(value) {
        return (Math.round(value * 1e9) / 1e9).toString();
    }

    // Liefert das i-te Kind einer Gruppe vom Typ "tag" – erstellt es nur bei
    // Bedarf neu. Verhindert Destroy+Recreate aller SVG-Knoten bei jedem
    // render()-Aufruf (Hauptursache für das Ruckeln bei Pan/Zoom, v.a. nah an
    // Polstellen wie bei f(x)=1/x, wo häufig und nah herangezoomt wird).
    function pooledChild(group, index, tag) {
        let node = group.children[index];
        if (!node) {
            node = document.createElementNS(svgNS, tag);
            group.appendChild(node);
        }
        return node;
    }

    // Entfernt überzählige Kinder ab "count" (z.B. weniger Gitterlinien nach
    // dem Herauszoomen).
    function trimPoolExcess(group, count) {
        while (group.children.length > count) {
            group.removeChild(group.lastElementChild);
        }
    }

    function setAttrs(node, attrs) {
        Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, val));
    }

    // ── Zeichnen ──────────────────────────────────────────────────────────
    function render() {
        if (widthPx === 0 || heightPx === 0) return;

        svg.setAttribute("viewBox", `0 0 ${widthPx} ${heightPx}`);

        const step = niceStep();
        const minX = toMathX(0), maxX = toMathX(widthPx);
        const minY = toMathY(heightPx), maxY = toMathY(0);

        const originScreenX = toScreenX(0);
        const originScreenY = toScreenY(0);
        const xAxisVisible = minY <= 0 && 0 <= maxY;
        const yAxisVisible = minX <= 0 && 0 <= maxX;

        // Sichtbarkeits-Einstellungen aus dem Settings-Modal anwenden
        gridGroup.style.display = settingsState.showGrid ? "" : "none";
        axesGroup.style.display = settingsState.showAxes ? "" : "none";
        labelsGroup.style.display = settingsState.showLabels ? "" : "none";
        if (legendEl) legendEl.style.display = settingsState.showLegend ? "" : "none";

        let gridIndex = 0;
        let labelIndex = 0;

        // Vertikale Linien (konstantes x)
        const startXi = Math.floor(minX / step);
        const endXi = Math.ceil(maxX / step);
        for (let i = startXi; i <= endXi; i++) {
            const sx = toScreenX(i * step);
            setAttrs(pooledChild(gridGroup, gridIndex++, "line"),
                { class: "graphGridLine", x1: sx, y1: 0, x2: sx, y2: heightPx });

            if (i !== 0) {
                const label = pooledChild(labelsGroup, labelIndex++, "text");
                setAttrs(label, {
                    class: "graphAxisLabel",
                    x: sx + 4,
                    y: xAxisVisible ? originScreenY - 6 : 14
                });
                label.textContent = formatLabel(i * step);
            }
        }

        // Horizontale Linien (konstantes y)
        const startYi = Math.floor(minY / step);
        const endYi = Math.ceil(maxY / step);
        for (let i = startYi; i <= endYi; i++) {
            const sy = toScreenY(i * step);
            setAttrs(pooledChild(gridGroup, gridIndex++, "line"),
                { class: "graphGridLine", x1: 0, y1: sy, x2: widthPx, y2: sy });

            if (i !== 0) {
                const label = pooledChild(labelsGroup, labelIndex++, "text");
                setAttrs(label, {
                    class: "graphAxisLabel",
                    x: yAxisVisible ? originScreenX + 6 : 4,
                    y: sy - 4
                });
                label.textContent = formatLabel(i * step);
            }
        }

        trimPoolExcess(gridGroup, gridIndex);
        trimPoolExcess(labelsGroup, labelIndex);

        // Achsen (gleiches Pool-Muster, max. 2 Elemente)
        let axisIndex = 0;
        if (yAxisVisible) {
            setAttrs(pooledChild(axesGroup, axisIndex++, "line"),
                { class: "graphAxisLine", x1: originScreenX, y1: 0, x2: originScreenX, y2: heightPx });
        }
        if (xAxisVisible) {
            setAttrs(pooledChild(axesGroup, axisIndex++, "line"),
                { class: "graphAxisLine", x1: 0, y1: originScreenY, x2: widthPx, y2: originScreenY });
        }
        trimPoolExcess(axesGroup, axisIndex);

        // Funktionen (ein <path> pro sichtbarer Funktion)
        let pathIndex = 0;
        functionsState.forEach((fn, index) => {
            if (!fn.visible || !fn.ast) return;
            const d = pointsToPathD(samplePoints(fn));
            if (!d) return;
            setAttrs(pooledChild(functionsGroup, pathIndex++, "path"), {
                d,
                fill: "none",
                stroke: colorForIndex(index),
                "stroke-width": 2.5,
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
            });
        });
        trimPoolExcess(functionsGroup, pathIndex);

        // Marker – Rohpositionen kommen aus functionMarkersCache (siehe oben),
        // hier nur math->screen-Umrechnung, damit Pan/Zoom günstig bleibt.
        let markerIndex = 0;
        const drawMarker = (mathX, mathY, cssClass) => {
            const sx = toScreenX(mathX), sy = toScreenY(mathY);
            if (sx < -20 || sx > widthPx + 20 || sy < -20 || sy > heightPx + 20) return;
            setAttrs(pooledChild(markersGroup, markerIndex++, "circle"), { cx: sx, cy: sy, r: 5, class: cssClass });
        };

        if (settingsState.markRoots) {
            functionMarkersCache.roots.forEach(p => drawMarker(p.x, p.y, "graphMarkerRoot"));
        }
        if (settingsState.markYIntercept) {
            functionMarkersCache.yIntercepts.forEach(p => drawMarker(p.x, p.y, "graphMarkerYIntercept"));
        }
        if (settingsState.markIntersects) {
            functionMarkersCache.intersections.forEach(p => drawMarker(p.x, p.y, "graphMarkerIntersection"));
        }
        trimPoolExcess(markersGroup, markerIndex);
    }

    // Sampling: pro sichtbarer Pixel-Spalte mehrere Unterpunkte auswerten und
    // deren Bildschirm-Y auf einen FESTEN Rand jenseits des Viewports klemmen
    // (statt Punkte je nach Zufalls-Distanz zur Polstelle zu verwerfen). Neue
    // Kurvenzweige entstehen nur bei echtem Vorzeichenwechsel der Klemm-Richtung
    // (oben->unten), nicht anhand roher Pixelabstände.
    function samplePoints(fn) {
        const MARGIN = 60;
        const TOP = -MARGIN;
        const BOTTOM = heightPx + MARGIN;
        const SUBSAMPLES = 6;
        const SINGULARITY_EPS = 1e-6; // Mathe-Einheiten, zoomunabhängig

        // Sichtbare, aus dem AST bekannte Singularitäten -> Segmentgrenzen.
        // Ersetzt die alte Polstellen-Erkennung über Subsample-Zufallstreffer.
        const viewMinX = toMathX(0);
        const viewMaxX = toMathX(widthPx);
        const boundaries = (fn.singularities || []).filter(s => s > viewMinX && s < viewMaxX);

        let cursor = viewMinX;
        let cursorIsSingularity = false;
        const segments = [];
        boundaries.forEach(s => {
            segments.push({ start: cursor, end: s, startAtSingularity: cursorIsSingularity, endAtSingularity: true });
            cursor = s;
            cursorIsSingularity = true;
        });
        segments.push({ start: cursor, end: viewMaxX, startAtSingularity: cursorIsSingularity, endAtSingularity: false });

        const points = [];
        segments.forEach(seg => {
            const segPoints = sampleSegment(fn.ast, seg, TOP, BOTTOM, SUBSAMPLES, SINGULARITY_EPS);
            if (points.length > 0 && segPoints.length > 0) points.push(null); // Segmentgrenze -> nie über eine Singularität hinweg verbinden
            points.push(...segPoints);
        });

        return points;
    }

    // Samplet EIN Segment. Spalten-Logik (Subsamples, Hüllkurve, Clamp) 1:1
    // wie zuvor – läuft jetzt nur strikt innerhalb der Segmentgrenzen. An
    // einer echten Singularität wird zusätzlich knapp innerhalb des Segments
    // ausgewertet (fester Epsilon-Abstand), statt auf einen zufällig nahen
    // Subsample-Treffer zu hoffen.
    function sampleSegment(ast, seg, TOP, BOTTOM, SUBSAMPLES, EPS) {
        const points = [];

        if (seg.startAtSingularity) {
            const y = evaluateGraphNode(ast, seg.start + EPS);
            if (y !== null && Number.isFinite(y)) {
                let sy = toScreenY(y);
                if (sy < TOP) sy = TOP; else if (sy > BOTTOM) sy = BOTTOM;
                points.push({ x: toScreenX(seg.start), y: sy });
            }
        }

        const pxStart = Math.max(0, Math.floor(toScreenX(seg.start) / 2) * 2);
        const pxEnd = Math.min(widthPx, Math.ceil(toScreenX(seg.end) / 2) * 2);
        let clampSign = 0;

        for (let px = pxStart; px <= pxEnd; px += 2) {
            const xLeft = Math.max(toMathX(px), seg.start);
            const xRight = Math.min(toMathX(px + 2), seg.end);
            if (xRight <= xLeft) continue;

            let colMin = Infinity, colMax = -Infinity, anyFinite = false;

            for (let s = 0; s < SUBSAMPLES; s++) {
                const xSample = xLeft + (xRight - xLeft) * (s / (SUBSAMPLES - 1));
                const mathY = evaluateGraphNode(ast, xSample);
                if (mathY === null || !Number.isFinite(mathY)) continue;
                let sy = toScreenY(mathY);
                if (sy < TOP) sy = TOP; else if (sy > BOTTOM) sy = BOTTOM;
                anyFinite = true;
                if (sy < colMin) colMin = sy;
                if (sy > colMax) colMax = sy;
            }

            if (!anyFinite) { points.push(null); clampSign = 0; continue; }

            const touchesTop = colMin <= TOP;
            const touchesBottom = colMax >= BOTTOM;

            if (touchesTop && touchesBottom) {
                if (clampSign !== 0) points.push(null);
                points.push({ x: px, y: colMin });
                points.push({ x: px, y: colMax });
                clampSign = 0;
            } else {
                const side = touchesTop ? -1 : touchesBottom ? 1 : 0;
                if (side !== 0 && clampSign !== 0 && side !== clampSign) points.push(null);
                if (colMax - colMin < 0.5) {
                    points.push({ x: px, y: colMin });
                } else {
                    points.push({ x: px, y: colMin });
                    points.push({ x: px, y: colMax });
                }
                clampSign = side;
            }
        }

        if (seg.endAtSingularity) {
            const y = evaluateGraphNode(ast, seg.end - EPS);
            if (y !== null && Number.isFinite(y)) {
                let sy = toScreenY(y);
                if (sy < TOP) sy = TOP; else if (sy > BOTTOM) sy = BOTTOM;
                points.push({ x: toScreenX(seg.end), y: sy });
            }
        }

        return points;
    }

    function pointsToPathD(points) {
        let d = "";
        let penDown = false;
        points.forEach(p => {
            if (p === null) { penDown = false; return; }
            d += (penDown ? "L" : "M") + p.x.toFixed(1) + "," + p.y.toFixed(1) + " ";
            penDown = true;
        });
        return d.trim();
    }

    // ── Größenänderung (Container-Resize, inkl. Fullscreen-Toggle) ────────
    const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        widthPx = entry.contentRect.width;
        heightPx = entry.contentRect.height;
        render();
    });
    resizeObserver.observe(container);

    // Bündelt schnell aufeinanderfolgende Redraws (Pan-Drag, Pinch, Mausrad)
    // auf maximal einen pro Frame – Grid/Achsen/Funktionen zusammen sind
    // teurer als der reine Grid/Achsen-Redraw aus Phase 1.
    let renderScheduled = false;
    function scheduleRender() {
        if (renderScheduled) return;
        renderScheduled = true;
        requestAnimationFrame(() => {
            renderScheduled = false;
            render();
        });
    }

    // ── Pointer-Interaktionen: Pan (1 Finger/Maus) & Pinch-Zoom (2 Finger) ──
    const activePointers = new Map(); // pointerId -> {x, y}
    let panStartScreen = null;
    let panStartCenter = null;
    let pinchStartDistance = null;
    let pinchStartZoom = null;

    function distanceBetween(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    svg.addEventListener("pointerdown", (e) => {
        if (e.button !== undefined && e.button > 0) return; // nur Links-/Primärklick
        svg.setPointerCapture(e.pointerId);
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 1 && settingsState.panEnabled) {
            panStartScreen = { x: e.clientX, y: e.clientY };
            panStartCenter = { x: viewport.centerX, y: viewport.centerY };
            svg.classList.add("is-panning");
        } else if (activePointers.size === 2) {
            const pts = Array.from(activePointers.values());
            pinchStartDistance = distanceBetween(pts[0], pts[1]);
            pinchStartZoom = viewport.pixelsPerUnit;
            panStartScreen = null; // Pan pausiert während Pinch
        }
    });

    svg.addEventListener("pointermove", (e) => {
        if (!activePointers.has(e.pointerId)) return;
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 2 && pinchStartDistance) {
            const pts = Array.from(activePointers.values());
            const distance = distanceBetween(pts[0], pts[1]);
            viewport.pixelsPerUnit = clampZoom(pinchStartZoom * (distance / pinchStartDistance));
            scheduleRender();
            return;
        }

        if (activePointers.size === 1 && panStartScreen) {
            const dxPx = e.clientX - panStartScreen.x;
            const dyPx = e.clientY - panStartScreen.y;
            viewport.centerX = panStartCenter.x - dxPx / viewport.pixelsPerUnit;
            viewport.centerY = panStartCenter.y + dyPx / viewport.pixelsPerUnit;
            scheduleRender();
        }
    });

    function endPointer(e) {
        activePointers.delete(e.pointerId);
        try { svg.releasePointerCapture(e.pointerId); } catch (err) { /* bereits freigegeben */ }

        if (activePointers.size < 2) pinchStartDistance = null;

        if (activePointers.size === 1 && settingsState.panEnabled) {
            // Von Pinch zurück zu Pan: neuen Startpunkt setzen, damit der
            // verbleibende Finger nicht springt
            const remaining = Array.from(activePointers.values())[0];
            panStartScreen = { x: remaining.x, y: remaining.y };
            panStartCenter = { x: viewport.centerX, y: viewport.centerY };
        }

        if (activePointers.size === 0) {
            panStartScreen = null;
            svg.classList.remove("is-panning");
        }
    }
    svg.addEventListener("pointerup", endPointer);
    svg.addEventListener("pointercancel", endPointer);

    // ── Zoom (Mausrad, zentriert um den Cursor) ─────────────────────────────
    svg.addEventListener("wheel", (e) => {
        if (!settingsState.zoomMouseWheel) return;
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const cursorScreenX = e.clientX - rect.left;
        const cursorScreenY = e.clientY - rect.top;
        const cursorMathXBefore = toMathX(cursorScreenX);
        const cursorMathYBefore = toMathY(cursorScreenY);

        const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        viewport.pixelsPerUnit = clampZoom(viewport.pixelsPerUnit * zoomFactor);

        // Punkt unter dem Cursor bleibt an derselben Bildschirmposition
        viewport.centerX = cursorMathXBefore - (cursorScreenX - widthPx / 2) / viewport.pixelsPerUnit;
        viewport.centerY = cursorMathYBefore + (cursorScreenY - heightPx / 2) / viewport.pixelsPerUnit;

        scheduleRender();
    }, { passive: false });

    // ── Toolbar-Buttons anbinden ─────────────────────────────────────────
    document.getElementById("zoom-in")?.addEventListener("click", () => {
        viewport.pixelsPerUnit = clampZoom(viewport.pixelsPerUnit * 1.3);
        render();
    });
    document.getElementById("zoom-out")?.addEventListener("click", () => {
        viewport.pixelsPerUnit = clampZoom(viewport.pixelsPerUnit / 1.3);
        render();
    });
    document.getElementById("reset")?.addEventListener("click", () => {
        viewport.centerX = 0;
        viewport.centerY = 0;
        viewport.pixelsPerUnit = 40;
        render();
    });

    requestGraphRedraw = render;

    // "Automatische Skalierung": zentriert den Viewport auf eine übergebene
    // mathematische Bounding-Box (siehe computeAutoScaleBounds), mit Puffer.
    requestAutoScale = function (bounds) {
        if (!bounds || widthPx === 0 || heightPx === 0) return;

        const spanX = Math.max(bounds.maxX - bounds.minX, 2) * 1.6;
        const spanY = Math.max(bounds.maxY - bounds.minY, 2) * 1.6;

        viewport.centerX = (bounds.minX + bounds.maxX) / 2;
        viewport.centerY = (bounds.minY + bounds.maxY) / 2;
        viewport.pixelsPerUnit = clampZoom(Math.min(widthPx / spanX, heightPx / spanY));

        render();
    };
}

document.addEventListener("DOMContentLoaded", initCoordinateSystem);