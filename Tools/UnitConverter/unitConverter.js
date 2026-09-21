// Vollständige Einheiten-Struktur (Aufgeteilt in Basic und Advanced)
const unitsConfig = {
length: {
basics: {
mm: 0.001,
cm: 0.01,
dm: 0.1,
m: 1,
dam: 10,
hm: 100,
km: 1000
},
advanced: {
nm: 0.000000001,
µm: 0.000001,
in: 0.0254,
ft: 0.3048,
yd: 0.9144,
mi: 1609.344,
nmi: 1852,
ly: 9460730472580800
}
},

mass: {
basics: {
mg: 0.001,
g: 1,
kg: 1000,
t: 1000000
},
advanced: {
µg: 0.000001,
cg: 0.01,
dg: 0.1,
dag: 10,
hg: 100,
dt: 100000,
gr: 0.06479891,
oz: 28.349523125,
lb: 453.59237,
st: 6350.29318,
ct: 0.2
}
},

time: {
basics: {
s: 1,
min: 60,
h: 3600,
d: 86400
},
advanced: {
ns: 0.000000001,
µs: 0.000001,
ms: 0.001,
wk: 604800,
mo: 2628000,
yr: 31536000,
dec: 315360000,
cen: 3153600000
}
},

area: {
basics: {
"mm²": 0.000001,
"cm²": 0.0001,
"dm²": 0.01,
"m²": 1,
"a": 100,
"ha": 10000,
"km²": 1000000
},
advanced: {
"in²": 0.00064516,
"ft²": 0.09290304,
"yd²": 0.83612736,
"ac": 4046.8564224,
"mi²": 2589988.110336
}
},

speed: {
basics: {
"mm/s": 0.001,
"cm/s": 0.01,
"m/s": 1,
"km/h": 0.27777777778,
"km/s": 1000
},
advanced: {
"in/s": 0.0254,
"ft/s": 0.3048,
"mph": 0.44704,
"kn": 0.51444444444,
"mach": 340.3,
"c": 299792458
}
},

volume: {
basics: {
"mm³": 0.000001,
"ml": 0.001,
"cm³": 0.001,
"cl": 0.01,
"dl": 0.1,
"l": 1,
"dm³": 1,
"hl": 100,
"m³": 1000,
"dam³": 1000000,
"hm³": 1000000000,
"km³": 1000000000000
},
advanced: {
"µl": 0.000001,
"nl": 0.000000001,
"in³": 0.016387064,
"fl oz (UK)": 0.0284130625,
"fl oz (US)": 0.0295735295625,
"pt (US)": 0.473176473,
"pt (UK)": 0.56826125,
"gal (US)": 3.785411784,
"gal (UK)": 4.54609,
"ft³": 28.316846592
}
},

pressure: {
basics: { Pa: 1, hPa: 100, kPa: 1000, MPa: 1000000, bar: 100000 },
advanced: { mbar: 100, atm: 101325, mmHg: 133.322, psi: 6894.757293168, inHg: 3386.389 }
},

energy: {
basics: { J: 1, kJ: 1000, MJ: 1000000, Wh: 3600, kWh: 3600000 },
advanced: { MWh: 3600000000, cal: 4.184, kcal: 4184, eV: 1.602176634e-19, BTU: 1055.05585262 }
},

frequency: {
basics: { Hz: 1, kHz: 1000, MHz: 1000000, GHz: 1000000000 },
advanced: { THz: 1000000000000, rpm: 0.0166666667 }
},

decimalprefixes: {
basics: { m: 0.001, c: 0.01, d: 0.1, Einheit: 1, da: 10, h: 100, k: 1000, M: 1000000, G: 1000000000 },
advanced: { y: 1e-24, z: 1e-21, a: 1e-18, f: 1e-15, p: 1e-12, n: 1e-9, µ: 1e-6, T: 1e12, P: 1e15, E: 1e18, Z: 1e21, Y: 1e24 }
},

angle: {
basics: { "°": 1, rad: 57.29577951308232, gon: 0.9 },
advanced: { "′": 0.0166666667, "″": 0.0002777778, Umdrehung: 360 }
},

datasize: {
basics: { Bit: 0.125, Byte: 1, KB: 1000, KiB: 1024, MB: 1000000, MiB: 1048576 },
advanced: { GB: 1000000000, GiB: 1073741824, TB: 1000000000000, TiB: 1099511627776, PB: 1000000000000000, PiB: 1125899906842624 }
},

// Werte hier sind NUR Dropdown-Sortierung! Die echte Umrechnung läuft über
// temperatureConversions weiter unten (Offset-Formeln, kein fester Faktor).
temperature: {
basics: { "°C": 1, "°F": 2, "K": 3 },
advanced: { "°R": 4 }
},

// Werte hier sind NUR Dropdown-Sortierung! Die echte Umrechnung läuft über
// fuelConstants weiter unten (reziprokes Verhältnis, kein fester Faktor).
fuelconsumption: {
basics: { "l/100km": 1, "km/l": 2 },
advanced: { "mpg (US)": 3, "mpg (UK)": 4 }
}

};

// DOM Elemente abgreifen
const einheitA = document.getElementById("einheitA");
const einheitZ = document.getElementById("einheitZ");
const inputEinheit = document.getElementById("inputEinheit");
const loesungOutput = document.getElementById("loesungOutput");
const rechenwegOutput = document.getElementById("rechenwegOutput");
const errorMessages = document.getElementById("errorMessages");
const unitsButtons = document.querySelectorAll(".btnUnits");
const advancedCheckbox = document.querySelector(".advancedMode input[type='checkbox']");

let currentCategory = "length";

// Liste aller imperialen, US-amerikanischen und astronomischen Einheiten
const imperialUnits = [
"in", "ft", "yd", "mi", "nmi", "ly",
"gr", "oz", "lb", "st", "ct",
"in²", "ft²", "yd²", "ac", "mi²",
"in/s", "ft/s", "mph", "kn", "mach", "c",
"in³", "ft³", "fl oz (UK)", "fl oz (US)", "pt (US)", "pt (UK)", "gal (US)", "gal (UK)",
"psi", "inHg", "BTU",
"°F", "°R",
"mpg (US)", "mpg (UK)"
];

// Standard-Zuordnungen beim harten Wechsel der Hauptkategorie
const categoryDefaults = {
length: { from: "m",    to: "cm" },
mass:   { from: "kg",   to: "g" },
time:   { from: "h",    to: "min" },
area:   { from: "m²",   to: "cm²" },
speed:  { from: "km/h", to: "m/s" },
volume: { from: "l",    to: "ml" },
pressure: { from: "bar", to: "psi" },
energy: { from: "kcal", to: "kJ" },
frequency: { from: "Hz", to: "kHz" },
decimalprefixes: { from: "k", to: "M" },
angle: { from: "°", to: "rad" },
datasize: { from: "MB", to: "GB" },
temperature: { from: "°C", to: "°F" },
fuelconsumption: { from: "l/100km", to: "mpg (US)" }
};

// ==========================================================================
// GESPEICHERTER ZUSTAND – zuletzt gewählte Kategorie + Einheiten pro Kategorie
//
// Bewusst KEIN Modul-Snapshot mehr (vorher: "let savedUnitState = getToolState(...)"
// beim Script-Parse). Drei Probleme daran:
//  1. War hydrate() noch nicht durch, galt der Nutzer als Gast -> gelesen und
//     geschrieben wurde der Gast-localStorage statt des Profils.
//  2. Der Snapshot wurde nie nachgezogen und überschrieb beim nächsten Write
//     den frischeren Serverstand (Last-Write-Wins mit alten Daten).
//  3. Eingeloggt liefert getToolState() die LIVE-Referenz aus dem Cache –
//     Mutationen daran veränderten den Cache ohne Persistierung.
// Muster jetzt identisch zu Finanz-/Mathe-Rechner: frisch lesen, nur bei
// Nutzeraktionen schreiben, per mv:staterestore nachziehen.
// ==========================================================================
const UNIT_STATE_KEY = "einheitenUmrechner";

let isRestoringUnitState = false;
let lastKnownLoginState = window.MV.isLoggedIn();

function readUnitState() {
    const raw = window.MV.getToolState(UNIT_STATE_KEY, null);
    const state = (raw && typeof raw === "object") ? raw : {};
    return {
        lastCategory: state.lastCategory || null,
        units: { ...(state.units || {}) }   // Kopie, nie die Cache-Referenz
    };
}

function writeUnitState(patch) {
    if (isRestoringUnitState) return;       // Init/Restore darf nicht persistieren
    window.MV.setToolState(UNIT_STATE_KEY, { ...readUnitState(), ...patch });
}

// Führt fn aus, ohne dass dabei etwas persistiert wird. Die Freigabe erfolgt
// erst im nächsten Tick, damit auch nachgelagerte mv:staterestore-Listener
// (z.B. applyState aus bindAdvancedToggle) nicht doch noch schreiben.
function withRestoreGuard(fn) {
    isRestoringUnitState = true;
    try { fn(); } finally { setTimeout(() => { isRestoringUnitState = false; }, 0); }
}

function findCategoryButton(categoryKey) {
    return Array.from(unitsButtons).find(b => b.dataset.category.replace("btn", "").toLowerCase() === categoryKey);
}

// Wendet für die aktuelle Kategorie die zuletzt gespeicherten Einheiten an –
// Fallback auf categoryDefaults, falls noch nichts gespeichert ist oder die
// gespeicherte Einheit (z.B. wegen ausgeschaltetem Advanced Mode) gerade
// nicht in der aktiven Liste vorhanden ist.
function applyUnitsForCurrentCategory() {
    const keys = Object.keys(getActiveUnits());
    const state = readUnitState();
    const saved = state.units[currentCategory];
    const defaults = categoryDefaults[currentCategory];

    einheitA.value = (saved && keys.includes(saved.from)) ? saved.from : (defaults ? defaults.from : keys[0]);
    einheitZ.value = (saved && keys.includes(saved.to))   ? saved.to   : (defaults ? defaults.to   : (keys[1] || keys[0]));

    writeUnitState({ lastCategory: currentCategory });
}

// Speichert die aktuell gewählten Einheiten – nur bei manueller Auswahl/Tausch.
function saveCurrentUnitsForCategory() {
    const state = readUnitState();
    state.units[currentCategory] = { from: einheitA.value, to: einheitZ.value };
    writeUnitState({ lastCategory: currentCategory, units: state.units });
}

// Stellt Kategorie + Einheiten aus dem gespeicherten Zustand wieder her.
function restoreUnitStateFromStorage() {
    const state = readUnitState();
    let startButton = null;

    if (state.lastCategory) {
        const isAdvancedCat = advancedCategoryNames.includes(state.lastCategory);
        if (!isAdvancedCat || advancedCheckbox.checked) {
            startButton = findCategoryButton(state.lastCategory);
        }
    }
    if (!startButton) startButton = document.querySelector('[data-category="btnLength"]');
    if (startButton) startButton.click();
}

// ==========================================================================
// AUSGESCHRIEBENE EINHEITENNAMEN für die Dropdowns
// Jeder Eintrag enthält bereits den fertigen Anzeigetext (inkl. Symbol in
// Klammern, wo das sinnvoll ist). Bei Einheiten, deren Symbol selbst schon
// runde Klammern enthält (z.B. "pt (US)") oder die schon ein eigenständiges
// Wort sind (z.B. "Byte"), wird das Symbol bewusst NICHT noch einmal
// angehängt, um doppelte Klammern bzw. Wiederholungen zu vermeiden.
// ==========================================================================
const unitLabels = {
length: {
mm: "Millimeter (mm)", cm: "Centimeter (cm)", dm: "Decimeter (dm)", m: "Meter (m)",
dam: "Decameter (dam)", hm: "Hectometer (hm)", km: "Kilometer (km)",
nm: "Nanometer (nm)", µm: "Micrometer (µm)", in: "Inch (in)", ft: "Foot (ft)",
yd: "Yard (yd)", mi: "Mile (mi)", nmi: "Nautical mile (nmi)", ly: "Light-year (ly)"
},
mass: {
mg: "Milligram (mg)", g: "Gram (g)", kg: "Kilogram (kg)", t: "Tonne (t)",
µg: "Microgram (µg)", cg: "Centigram (cg)", dg: "Decigram (dg)", dag: "Dekagram (dag)",
hg: "Hectogram (hg)", dt: "Quintal (dt)", gr: "Grain (gr)", oz: "Ounce (oz)",
lb: "Pound (lb)", st: "Stone (st)", ct: "Carat (ct)"
},
time: {
s: "Second (s)", min: "Minute (min)", h: "Hour (h)", d: "Day (d)",
ns: "Nanosecond (ns)", µs: "Microsecond (µs)", ms: "Millisecond (ms)",
wk: "Week (wk)", mo: "Month (mo)", yr: "Year (yr)", dec: "Decade (dec)", cen: "Century (cen)"
},
area: {
"mm²": "Square millimeter (mm²)", "cm²": "Square centimeter (cm²)", "dm²": "Square decimeter (dm²)",
"m²": "Square meter (m²)", "a": "Are (a)", "ha": "Hectare (ha)", "km²": "Square kilometer (km²)",
"in²": "Square inch (in²)", "ft²": "Square foot (ft²)", "yd²": "Square yard (yd²)",
"ac": "Acre (ac)", "mi²": "Square mile (mi²)"
},
speed: {
"mm/s": "Millimeter per second (mm/s)", "cm/s": "Centimeter per second (cm/s)",
"m/s": "Meter per second (m/s)", "km/h": "Kilometer per hour (km/h)",
"km/s": "Kilometer per second (km/s)", "in/s": "Inch per second (in/s)",
"ft/s": "Foot per second (ft/s)", "mph": "Miles per hour (mph)",
"kn": "Knot (kn)", "mach": "Mach (mach)", "c": "Speed of light (c)"
},
volume: {
"mm³": "Cubic millimeter (mm³)", "ml": "Milliliter (ml)", "cm³": "Cubic centimeter (cm³)",
"cl": "Centiliter (cl)", "dl": "Deciliter (dl)", "l": "Liter (l)", "dm³": "Cubic decimeter (dm³)",
"hl": "Hectoliter (hl)", "m³": "Cubic meter (m³)", "dam³": "Cubic decameter (dam³)",
"hm³": "Cubic hectometer (hm³)", "km³": "Cubic kilometer (km³)",
"µl": "Microliter (µl)", "nl": "Nanoliter (nl)", "in³": "Cubic inch (in³)",
"fl oz (UK)": "Fluid ounce (UK)", "fl oz (US)": "Fluid ounce (US)",
"pt (US)": "Pint (US)", "pt (UK)": "Pint (UK)",
"gal (US)": "Gallon (US)", "gal (UK)": "Gallon (UK)", "ft³": "Cubic foot (ft³)"
},
pressure: {
Pa: "Pascal (Pa)", hPa: "Hectopascal (hPa)", kPa: "Kilopascal (kPa)", MPa: "Megapascal (MPa)",
bar: "Bar (bar)", mbar: "Millibar (mbar)", atm: "Atmosphere (atm)",
mmHg: "Millimeters of mercury (mmHg)", psi: "Pounds per square inch (psi)",
inHg: "Inches of mercury (inHg)"
},
energy: {
J: "Joule (J)", kJ: "Kilojoule (kJ)", MJ: "Megajoule (MJ)", Wh: "Watt-hour (Wh)",
kWh: "Kilowatt-hour (kWh)", MWh: "Megawatt-hour (MWh)", cal: "Calorie (cal)",
kcal: "Kilocalorie (kcal)", eV: "Electronvolt (eV)", BTU: "British Thermal Unit (BTU)"
},
frequency: {
Hz: "Hertz (Hz)", kHz: "Kilohertz (kHz)", MHz: "Megahertz (MHz)", GHz: "Gigahertz (GHz)",
THz: "Terahertz (THz)", rpm: "Revolutions per minute (rpm)"
},
decimalprefixes: {
y: "Yocto (y)", z: "Zepto (z)", a: "Atto (a)", f: "Femto (f)", p: "Pico (p)", n: "Nano (n)",
µ: "Micro (µ)", m: "Milli (m)", c: "Centi (c)", d: "Deci (d)", Einheit: "No prefix",
da: "Deka (da)", h: "Hecto (h)", k: "Kilo (k)", M: "Mega (M)", G: "Giga (G)",
T: "Tera (T)", P: "Peta (P)", E: "Exa (E)", Z: "Zetta (Z)", Y: "Yotta (Y)"
},
angle: {
"°": "Degree (°)", rad: "Radian (rad)", gon: "Gon (gon)",
"′": "Arcminute (′)", "″": "Arcsecond (″)", Umdrehung: "Revolution"
},
datasize: {
Bit: "Bit", Byte: "Byte", KB: "Kilobyte (KB)", KiB: "Kibibyte (KiB)",
MB: "Megabyte (MB)", MiB: "Mebibyte (MiB)", GB: "Gigabyte (GB)", GiB: "Gibibyte (GiB)",
TB: "Terabyte (TB)", TiB: "Tebibyte (TiB)", PB: "Petabyte (PB)", PiB: "Pebibyte (PiB)"
},
temperature: {
"°C": "Degrees Celsius (°C)", "°F": "Degrees Fahrenheit (°F)", "K": "Kelvin (K)", "°R": "Degrees Rankine (°R)"
},
fuelconsumption: {
"l/100km": "Liters per 100 km (l/100km)", "km/l": "Kilometers per liter (km/l)",
"mpg (US)": "Miles per gallon US (mpg)", "mpg (UK)": "Miles per gallon UK (mpg)"
}
};

// Holt den Anzeigetext für eine Einheit; fällt auf das reine Symbol zurück,
// falls (noch) kein ausgeschriebener Name hinterlegt ist.
function getUnitDisplayLabel(unit) {
return (unitLabels[currentCategory] && unitLabels[currentCategory][unit]) || unit;
}

// Kategorien, die nur im Advanced Mode als Buttons sichtbar sind
const advancedCategoryNames = [
"volume", "pressure", "energy", "frequency",
"decimalprefixes", "angle", "datasize",
"temperature", "fuelconsumption"
]; // wird mit jeder neuen Advanced-Kategorie ergänzt

function updateAdvancedCategoryVisibility(isAdvanced) {
document.querySelectorAll(".advancedCategory").forEach(btn => {
btn.classList.toggle("visible", isAdvanced);
});

// Wenn Advanced Mode ausgeschaltet wird, während eine Advanced-Kategorie aktiv ist:
// zurück zur Standard-Kategorie (Länge) wechseln
if (!isAdvanced && advancedCategoryNames.includes(currentCategory)) {
const lengthButton = document.querySelector('[data-category="btnLength"]');
if (lengthButton) lengthButton.click();
}

}

// ==========================================================================
// SONDERFÄLLE: Temperatur & Kraftstoffverbrauch
// Diese zwei Kategorien lassen sich NICHT über einen einzelnen
// Multiplikationsfaktor umrechnen (Temperatur hat einen Offset,
// Kraftstoffverbrauch ist ein reziprokes Verhältnis), deshalb bekommen
// sie eigene Umrechnungsfunktionen statt nur einen Eintrag in unitsConfig.
// ==========================================================================

const specialCategories = ["temperature", "fuelconsumption"];

// --- Temperatur: Kelvin als Dreh- und Angelpunkt ---
const temperatureConversions = {
"°C": { toKelvin: c => c + 273.15, fromKelvin: k => k - 273.15 },
"°F": { toKelvin: f => (f - 32) * 5 / 9 + 273.15, fromKelvin: k => (k - 273.15) * 9 / 5 + 32 },
"K":  { toKelvin: k => k, fromKelvin: k => k },
"°R": { toKelvin: r => r * 5 / 9, fromKelvin: k => k * 9 / 5 }
};

function convertTemperature(value, fromUnit, toUnit) {
const kelvin = temperatureConversions[fromUnit].toKelvin(value);
return temperatureConversions[toUnit].fromKelvin(kelvin);
}

// --- Kraftstoffverbrauch: l/100km als Dreh- und Angelpunkt ---
// "null" bei l/100km bedeutet "ist schon die Basis, keine Konstante nötig"
const fuelConstants = {
"l/100km": null,
"km/l": 100,
"mpg (US)": 235.214583,
"mpg (UK)": 282.480936
};

function fuelToBase(value, unit) {
const c = fuelConstants[unit];
return c === null ? value : c / value;
}

function fuelFromBase(literPer100km, unit) {
const c = fuelConstants[unit];
return c === null ? literPer100km : c / literPer100km;
}

function convertFuel(value, fromUnit, toUnit) {
const literPer100km = fuelToBase(value, fromUnit);
return fuelFromBase(literPer100km, toUnit);
}

// Hilfsfunktion: Holt die aktivierten Einheiten und sortiert sie sauber nach System und Größe
function getActiveUnits() {
const category = unitsConfig[currentCategory];
let combinedUnits = {};

if (advancedCheckbox.checked) {
combinedUnits = { ...category.basics, ...category.advanced };
} else {
combinedUnits = { ...category.basics };
}

// Einheiten nach System und Wert sortieren
return sortUnitsBySystemAndValue(combinedUnits);

}

// Sortiert ein Objekt: Erst Metrisch (klein -> groß), dann Imperial/Astro (klein -> groß)
function sortUnitsBySystemAndValue(obj) {
const entries = Object.entries(obj);

// 1. Metrische Einheiten filtern und sortieren
const metricEntries = entries
.filter(([key]) => !imperialUnits.includes(key))
.sort((a, b) => a[1] - b[1]);

// 2. Imperiale / US / Astro Einheiten filtern und sortieren
const imperialEntries = entries
.filter(([key]) => imperialUnits.includes(key))
.sort((a, b) => a[1] - b[1]);

// Beide sortierten Arrays wieder zu einem einzigen Objekt zusammenführen
return Object.fromEntries([...metricEntries, ...imperialEntries]);

}

// DOM Element für den Ausgabe-Container greifen
const ausgabeContainer = document.getElementById("ausgabeContainer");
const rechenwegDiv = document.querySelector(".rechenwegDiv");

// Hilfsfunktionen für die Sichtbarkeit von Fehlern und Ergebnissen
function hideError() {
errorMessages.style.display = "none";
}

function showError(msg = "Invalid input") {
// 1. Rechenweg-Box komplett unsichtbar machen
ausgabeContainer.style.display = "none";

// 2. Fehlermeldung befüllen und anzeigen
errorMessages.textContent = msg;
errorMessages.style.display = "block";

}

// Die Berechnungs-Funktion
function calculate() {
const inputValue = inputEinheit.value.trim();

// Fall 1: Das Eingabefeld ist komplett leer
if (inputValue === "") {
loesungOutput.innerText = "Result";
rechenwegOutput.innerHTML = "";
ausgabeContainer.style.display = "none";
hideError();
return;
}

const cleanedInput = inputValue.replace(",", ".");

// Fall 2: Die Eingabe ist keine gültige Zahl (FEHLERFALL)
if (isNaN(Number(cleanedInput)) || cleanedInput === "") {
loesungOutput.innerText = "Error";
rechenwegOutput.innerHTML = "";
showError("Invalid input");
return;
}

// Wenn wir hier landen, ist die Zahl valide -> Fehler wegschalten!
hideError();

const parsedValue = parseFloat(cleanedInput);
const unitFrom = einheitA.value;
const unitTo = einheitZ.value;

if (!unitFrom || !unitTo) return;

// ── SONDERFÄLLE abfangen, bevor die normale Faktor-Logik startet ───────
if (specialCategories.includes(currentCategory)) {
calculateSpecial(parsedValue, unitFrom, unitTo);
return;
}

const currentUnitsList = getActiveUnits();

if (!currentUnitsList[unitFrom] || !currentUnitsList[unitTo]) {
loesungOutput.innerText = "Result";
rechenwegOutput.innerHTML = "";
ausgabeContainer.style.display = "none";
return;
}

// Mathematische Berechnung
const directFactor = currentUnitsList[unitFrom] / currentUnitsList[unitTo];
const result = parsedValue * directFactor;

let formattedResult;
if (result !== 0 && (Math.abs(result) < 0.00001 || Math.abs(result) > 100000000)) {
formattedResult = result.toExponential(5);
} else {
formattedResult = Number(result.toFixed(6));
}

loesungOutput.innerText = `${formattedResult} ${unitTo}`;

// Fall 3: Erfolgreiche Berechnung -> Rechenweg-Box einblenden
ausgabeContainer.style.display = "flex";

if (unitFrom === unitTo) {
rechenwegOutput.innerHTML = `<pre>Identical units: No calculation necessary.</pre>`;
} else {
// Faktor für die ANZEIGE bestimmen: manchmal ist der Kehrwert "schöner"
// (z.B. ÷ 3.6 statt × 0.2777777778 bei km/h -> m/s)
let displayOperator = "×";
let displayFactor = directFactor;

if (directFactor >= 0.0001 && directFactor < 1) {
const inverse = 1 / directFactor;
if (countDecimals(inverse) <= 4 && countDecimals(inverse) < countDecimals(directFactor)) {
displayOperator = "÷";
displayFactor = inverse;
}
}

const printFactor = formatFactor(displayFactor);

const formelLine = `Formula:    Value ${displayOperator} ${printFactor}`;
const rechnungLine = wrapAtEquals(
`Calculation:  ${parsedValue} ${unitFrom} ${displayOperator} ${printFactor} = <b>${formattedResult} ${unitTo}</b>`
);

rechenwegOutput.innerHTML = `<pre>${formelLine}\n${rechnungLine}</pre>`;
}

}

// ==========================================================================
// SONDERFÄLLE: Berechnung für Temperatur & Kraftstoffverbrauch
// ==========================================================================

function calculateSpecial(parsedValue, unitFrom, unitTo) {
const validLookup = currentCategory === "temperature" ? temperatureConversions : fuelConstants;

// Schutz, falls Dropdowns gerade erst umgebaut werden (Race Condition)
if (!validLookup.hasOwnProperty(unitFrom) || !validLookup.hasOwnProperty(unitTo)) {
loesungOutput.innerText = "Result";
rechenwegOutput.innerHTML = "";
ausgabeContainer.style.display = "none";
return;
}

const result = currentCategory === "temperature"
? convertTemperature(parsedValue, unitFrom, unitTo)
: convertFuel(parsedValue, unitFrom, unitTo);

if (!isFinite(result)) {
showError("This conversion is not possible for this value (division by zero).");
return;
}

const formattedResult = Number(result.toFixed(4));
loesungOutput.innerText = `${formattedResult} ${unitTo}`;
ausgabeContainer.style.display = "flex";

if (unitFrom === unitTo) {
rechenwegOutput.innerHTML = `<pre>Identical units: No calculation necessary.</pre>`;
return;
}

rechenwegOutput.innerHTML = currentCategory === "temperature"
? buildTemperatureRechenweg(parsedValue, unitFrom, unitTo, result)
: buildFuelRechenweg(parsedValue, unitFrom, unitTo, result);

}

function buildTemperatureRechenweg(value, fromUnit, toUnit, result) {
const kelvin = temperatureConversions[fromUnit].toKelvin(value);
const lines = [];

if (fromUnit !== "K") {
lines.push(`Step 1: ${fromUnit} → K (Kelvin as intermediate step)`);
lines.push(wrapAtEquals(`${value} ${fromUnit} = ${kelvin.toFixed(4)} K`));
}
if (toUnit !== "K") {
lines.push(`${fromUnit !== "K" ? "Step 2" : "Step 1"}: K → ${toUnit}`);
lines.push(wrapAtEquals(`${kelvin.toFixed(4)} K = ${result.toFixed(4)} ${toUnit}`));
}

return `<pre>${lines.join("\n")}\n\nResult: <b>${result.toFixed(4)} ${toUnit}</b></pre>`;

}

function buildFuelRechenweg(value, fromUnit, toUnit, result) {
const literPer100km = fuelToBase(value, fromUnit);
const lines = [];

if (fromUnit !== "l/100km") {
lines.push(`Step 1: ${fromUnit} → l/100km`);
lines.push(wrapAtEquals(`${formatFactor(fuelConstants[fromUnit])} ÷ ${value} = ${literPer100km.toFixed(4)} l/100km`));
}
if (toUnit !== "l/100km") {
lines.push(`${fromUnit !== "l/100km" ? "Step 2" : "Step 1"}: l/100km → ${toUnit}`);
lines.push(wrapAtEquals(`${formatFactor(fuelConstants[toUnit])} ÷ ${literPer100km.toFixed(4)} = ${result.toFixed(4)} ${toUnit}`));
}

return `<pre>${lines.join("\n")}\n\nResult: <b>${result.toFixed(4)} ${toUnit}</b></pre>`;

}

// Generiert die Optionen für die Dropdowns basierend auf dem Advanced-Status
function updateDropdowns() {
const currentUnitsList = getActiveUnits();
const keys = Object.keys(currentUnitsList);

// Aktuelle Auswahl sichern, um sie wenn möglich zu behalten
const oldFrom = einheitA.value;
const oldTo = einheitZ.value;

einheitA.innerHTML = "";
einheitZ.innerHTML = "";

keys.forEach(unit => {
const displayText = getUnitDisplayLabel(unit);
einheitA.innerHTML += `<option value="${unit}">${displayText}</option>`;
einheitZ.innerHTML += `<option value="${unit}">${displayText}</option>`;
});

// Versuchen die alten Werte zu setzen, sonst Fallback auf Standard basics
if (keys.includes(oldFrom)) einheitA.value = oldFrom;
else einheitA.value = keys[0];

if (keys.includes(oldTo)) einheitZ.value = oldTo;
else einheitZ.value = keys[1] || keys[0];

}

// Event Listener für die Kategorie-Buttons
unitsButtons.forEach(button => {
button.addEventListener("click", function() {
unitsButtons.forEach(b => b.classList.remove("active"));
button.classList.add("active");

const type = button.dataset.category;
currentCategory = type.replace("btn", "").toLowerCase();

updateDropdowns();
applyUnitsForCurrentCategory();

calculate();
});

});

// Rundet auf 10 Nachkommastellen (killt Floating-Point-Reste wie 3.5999999999997)
// und zählt, wie viele "echte" Nachkommastellen übrig bleiben.
function countDecimals(num) {
const rounded = Math.round(num * 1e10) / 1e10;
const str = rounded.toString();
if (str.includes("e")) return Infinity;
const parts = str.split(".");
return parts[1] ? parts[1].length : 0;
}

// Formatiert einen Faktor für die Anzeige im Rechenweg
function formatFactor(num) {
if (num !== 0 && (Math.abs(num) < 0.000001 || Math.abs(num) > 10000000)) {
return num.toExponential(6);
}
return parseFloat(num.toFixed(10)).toString();
}

// Macht eine Zeile mit "=" gezielt umbruchfähig: Ersetzt alle Leerzeichen
// AUSSER dem einen direkt nach "=" durch   (nicht umbrechbar). Dadurch
// kann der Browser nur an genau dieser Stelle umbrechen - und tut das auch
// nur, wenn die Zeile tatsächlich zu lang für die Box ist ("wenn nötig").
function wrapAtEquals(line) {
const idx = line.lastIndexOf("=");
if (idx === -1) return line;

const before = line.slice(0, idx + 1).replace(/ /g, "&nbsp;");
const after = line.slice(idx + 1).trim().replace(/ /g, "&nbsp;");

return `${before} ${after}`;
}

document.getElementById("swapEinheiten")?.addEventListener("click", () => {
const tmp = einheitA.value;
einheitA.value = einheitZ.value;
einheitZ.value = tmp;
saveCurrentUnitsForCategory();
calculate();
});

inputEinheit.addEventListener("input", calculate);
einheitA.addEventListener("change", () => { saveCurrentUnitsForCategory(); calculate(); });
einheitZ.addEventListener("change", () => { saveCurrentUnitsForCategory(); calculate(); });

// Initialisierung beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    withRestoreGuard(() => {
        window.MV.bindAdvancedToggle(advancedCheckbox, UNIT_STATE_KEY, (isChecked) => {
            updateAdvancedCategoryVisibility(isChecked);
            updateDropdowns();
            applyUnitsForCurrentCategory();
            calculate();
        });
        restoreUnitStateFromStorage();
    });
    lastKnownLoginState = window.MV.isLoggedIn();
});

// Zieht den Zustand nach, wenn sich die Datenquelle ändert: hydrate() nach dem
// Laden (der Race-Fix), Cross-Tab-Änderungen, bfcache-Restore. Analog zu
// refreshCurrencyFromStorage() im Finanzrechner.
window.addEventListener("mv:staterestore", () => {
    const nowLoggedIn = window.MV.isLoggedIn();
    const loginChanged = nowLoggedIn !== lastKnownLoginState;
    lastKnownLoginState = nowLoggedIn;

    withRestoreGuard(() => {
        if (loginChanged) {
            // Login/Logout/verspätetes hydrate: kompletter Zustandswechsel
            restoreUnitStateFromStorage();
        } else {
            // Gleiche Identität: nur Einheiten nachziehen, nicht die Kategorie
            // wegreißen, während der Nutzer gerade arbeitet.
            applyUnitsForCurrentCategory();
        }
        calculate();
    });
});
