// ==========================================================================
// PERCENTAGE CALCULATOR – Basic Calculations + Advanced Mode
// ==========================================================================

const button_calc = document.querySelectorAll("button");
const error = document.getElementById("errorMessages");
const advancedCheckbox = document.querySelector(".advancedMode input[type='checkbox']");
const advancedToolsGroup = document.getElementById("advancedToolsGroup");

// Reads an input field within a .tool block and converts it to a number.
// Empty/Whitespace inputs are deliberately converted to NaN (not 0), so "Invalid input"
// is reliably triggered even when fields are accidentally cleared.
function getVal(tool, role) {
const el = tool.querySelector(`[data-role="${role}"]`);
if (!el) return NaN;
const raw = el.value.trim();
if (raw === "") return NaN;
return Number(raw.replace(",", "."));
}

// Reads the value of a <select> within a .tool block (e.g. direction for VAT).
function getSelectVal(tool, role) {
const el = tool.querySelector(`[data-role="${role}"]`);
return el ? el.value : undefined;
}

// Rounds to 2 decimal places and removes typical floating-point residues (e.g. 49.999999998)
function round2(num) {
return Math.round((num + Number.EPSILON) * 100) / 100;
}

button_calc.forEach(button => {
  button.addEventListener("click", (b) => {
  const tool = b.target.closest(".tool");
  if (!tool) return;

const type = tool.dataset.type;

const outputContainer = tool.querySelector(".formulaErgebnis");
const ergebnisOutput = tool.querySelector(".ergebnisText");
const rechenwegContainer = document.getElementById("rechenwegOutput");

let ergebnis;
let rechenweg;
error.style.display = "none";
outputContainer.style.display = "none";
rechenwegContainer.innerHTML = "";

if (type === "share-of") {
const p = getVal(tool, "p");
const G = getVal(tool, "G");
if (isNaN(p) || isNaN(G)) return showError("Invalid input");

const result = round2((p / 100) * G);
rechenweg = `(${p}% / 100) * ${G} = ${result}`;
ergebnis = `${p}% of ${G} = <span class="ergebnisOutput">${result}</span>`;
}
else if (type === "percent-of") {
const A = getVal(tool, "A");
const G = getVal(tool, "G");
if (isNaN(A) || isNaN(G) || G === 0) return showError("Invalid input");

const result = round2((A / G) * 100);
rechenweg = `(${A} / ${G}) * 100 = ${result}`;
ergebnis = `${A} of ${G} is <span class="ergebnisOutput">${result}</span>%`;
}
else if (type === "basis-value-of") {
const A = getVal(tool, "A");
const p = getVal(tool, "p");
if (isNaN(A) || isNaN(p) || p === 0) return showError("Invalid input");

const result = round2(A / (p / 100));
rechenweg = `${A} / (${p}% / 100) = ${result}`;
ergebnis = `${A} is ${p}% of <span class="ergebnisOutput">${result}</span>`;
}
else if (type === "percent-change") {
const alt = getVal(tool, "alt");
const neu = getVal(tool, "neu");
if (isNaN(alt) || isNaN(neu) || alt === 0) return showError("Invalid input");

const result = round2(((neu - alt) / alt) * 100);
const richtung = result >= 0 ? "Increase" : "Decrease";
rechenweg = `((${neu} - ${alt}) / ${alt}) * 100 = ${result}%`;
ergebnis = `${alt} → ${neu}: <span class="ergebnisOutput">${result}%</span> (${richtung})`;
}
else if (type === "increase-decrease") {
const G = getVal(tool, "G");
const p = getVal(tool, "p");
const op = getSelectVal(tool, "op");
if (isNaN(G) || isNaN(p)) return showError("Invalid input");

const sign = op === "decrease" ? "-" : "+";
const faktor = op === "decrease" ? (1 - p / 100) : (1 + p / 100);
const result = round2(G * faktor);
const opText = op === "decrease" ? "decreased" : "increased";
rechenweg = `${G} * (1 ${sign} ${p}/100) = ${result}`;
ergebnis = `${G} ${opText} by ${p}% = <span class="ergebnisOutput">${result}</span>`;
}
else if (type === "vat") {
const wert = getVal(tool, "wert");
const steuersatz = getVal(tool, "steuersatz");
const direction = getSelectVal(tool, "direction");
if (isNaN(wert) || isNaN(steuersatz)) return showError("Invalid input");
// NEW: Prevent division by zero for -100% VAT in Gross -> Net
if (direction === "gross-to-net" && steuersatz === -100) {
    return showError("Invalid input"); 
}
if (direction === "gross-to-net") {
const netto = round2(wert / (1 + steuersatz / 100));
const mwst = round2(wert - netto);
rechenweg = `${wert} / (1 + ${steuersatz}/100) = ${netto}`;
ergebnis = `${wert} gross − ${steuersatz}% VAT = <span class="ergebnisOutput">${netto}</span> net (VAT: ${mwst})`;
} else {
const brutto = round2(wert * (1 + steuersatz / 100));
const mwst = round2(brutto - wert);
rechenweg = `${wert} * (1 + ${steuersatz}/100) = ${brutto}`;
ergebnis = `${wert} net + ${steuersatz}% VAT = <span class="ergebnisOutput">${brutto}</span> gross (VAT: ${mwst})`;
}
}
else if (type === "discount") {
const G = getVal(tool, "G");
const p = getVal(tool, "p");
if (isNaN(G) || isNaN(p)) return showError("Invalid input");

const rabattbetrag = round2(G * (p / 100));
const endpreis = round2(G - rabattbetrag);
rechenweg = `${G} - (${G} * ${p}/100) = ${endpreis}`;
ergebnis = `${G} − ${p}% discount = <span class="ergebnisOutput">${endpreis}</span> (Discount: ${rabattbetrag})`;
}

console.log({ type, ergebnis, rechenweg });

if (ergebnis !== undefined) {
if (outputContainer) outputContainer.style.display = "flex";
if (ergebnisOutput) ergebnisOutput.innerHTML = ergebnis;
if (rechenwegContainer) rechenwegContainer.innerHTML = rechenweg;
}


});
});

const inputs = document.querySelectorAll(".numberInputField");

inputs.forEach(input => {
// Hide error on typing
input.addEventListener("input", () => {
error.style.display = "none";
});

// Handle Enter Key
input.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
const tool = input.closest(".tool");
const btn = tool?.querySelector("button");
if (btn) btn.click();
}
});
});

// Selection dropdowns (direction/operation) should also hide errors when changed
document.querySelectorAll(".selectPercent").forEach(select => {
select.addEventListener("change", () => {
error.style.display = "none";
});
});

function showError(msg) {
error.textContent = msg;
error.style.display = "block";
}

// ==========================================================================
// ADVANCED MODE – same logic/storage as the Units Converter
// (window.MV.bindAdvancedToggle, Key = "prozentrechner")
// ==========================================================================

function updateAdvancedVisibility(isAdvanced) {
if (advancedToolsGroup) advancedToolsGroup.classList.toggle("visible", isAdvanced);
}

document.addEventListener("DOMContentLoaded", () => {
window.MV.bindAdvancedToggle(advancedCheckbox, "prozentrechner", (isChecked) => {
updateAdvancedVisibility(isChecked);
});
});