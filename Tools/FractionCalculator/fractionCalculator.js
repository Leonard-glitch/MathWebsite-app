// ==========================================================================
// STATE 
// ==========================================================================

let currentOperation = "add";

const opButtons       = document.querySelectorAll(".btnUnits");
const mixedToggle     = document.getElementById("mixedToggle");
const opZeichen       = document.getElementById("operationZeichen");
const wrapperBruch2   = document.getElementById("wrapperBruch2");
const bruch2Eingabe   = document.getElementById("bruch2Eingabe");

const inputs = {
    g1:     document.getElementById("ganzzahl1"),
    z1:     document.getElementById("zaehler1"),
    n1:     document.getElementById("nenner1"),
    g2:     document.getElementById("ganzzahl2"),
    z2:     document.getElementById("zaehler2"),
    n2:     document.getElementById("nenner2"),
    factor: document.getElementById("erwFaktor")
};

const loesungOutput    = document.getElementById("loesungOutput");
const rechenwegOutput  = document.getElementById("rechenwegOutput");
const errorMessages    = document.getElementById("errorMessages");
const ausgabeContainer = document.getElementById("ausgabeContainer");

// ── Mathematical helper functions 
function ggt(a, b) {
    return b === 0 ? Math.abs(a) : ggt(b, a % b);
}

function kgv(a, b) {
    return Math.abs(a * b) / ggt(a, b);
}

// ── Error handling 
function hideError() {
    errorMessages.style.display = "none";
}

function showError(msg) {
    ausgabeContainer.style.display = "none";
    loesungOutput.innerText        = "Error";
    errorMessages.textContent      = msg;
    errorMessages.style.display    = "block";
}

// ── UI update (Operation & Mixed Mode) 
function updateUI() {
    const isMixed = mixedToggle.checked;

    // Show / hide whole number fields
    document.querySelectorAll(".mixed-field").forEach(el => {
        el.style.display = isMixed ? "block" : "none";
    });

    // Reset default state
    wrapperBruch2.style.display   = "flex";
    bruch2Eingabe.style.display   = "flex";
    inputs.factor.style.display   = "none";

    // Operation-specific layout
    if (currentOperation === "kuerzen") {
        opZeichen.textContent       = "➔";
        wrapperBruch2.style.display = "none";

    } else if (currentOperation === "erweitern") {
        opZeichen.textContent       = "×";
        bruch2Eingabe.style.display = "none";
        inputs.g2.style.display     = "none";  
        inputs.factor.style.display = "block";

    } else {
        const symbols = { add: "+", sub: "−", mul: "×", div: "÷" };
        opZeichen.textContent = symbols[currentOperation];
    }

    calculate();
}

// ── Read fraction from input fields 
function getFraction(gEl, zEl, nEl) {
    let g = mixedToggle.checked ? (parseInt(gEl.value) || 0) : 0;
    let z = parseInt(zEl.value);
    let n = parseInt(nEl.value);

    if (isNaN(z) || isNaN(n)) return null;
    if (n === 0)               return "NaN_Nenner";

    if (g !== 0) {
        n = Math.abs(n);
        const absZ = Math.abs(z);
        z = g < 0 ? g * n - absZ : g * n + absZ;
    } else if (n < 0) {
        // Pure fraction: normalize negative denominator early
        z = -z;
        n = -n;
    }

    return { z, n };
}

// ── Format result as HTML 
function formatResultHTML(z, n) {
    if (z === 0) return "0";
    if (n === 1) return `${z}`;

    let extraMixed = "";
    if (mixedToggle.checked && Math.abs(z) > n) {
        const ganz  = Math.trunc(z / n);
        const restZ = Math.abs(z % n);
        extraMixed = restZ !== 0
            ? ` = ${ganz}<div class="resBruch"><span>${restZ}</span><div class="resBruchStrich"></div><span>${n}</span></div>`
            : ` = ${ganz}`;
    }

    return `<div class="resBruch"><span>${z}</span><div class="resBruchStrich"></div><span>${n}</span></div>${extraMixed}`;
}

// ── Main calculation
function calculate() {
    hideError();

    const f1 = getFraction(inputs.g1, inputs.z1, inputs.n1);
    if (!f1)               { resetOutput(); return; }
    if (f1 === "NaN_Nenner") { showError("Denominator cannot be 0!"); return; }

    let finalZ, finalN;
    const steps = [];
    const printBruch = (z, n) => `${z}/${n}`;

    // ── Simplify 
    if (currentOperation === "kuerzen") {
        const teiler = ggt(f1.z, f1.n);
        finalZ = f1.z / teiler;
        finalN = f1.n / teiler;

        steps.push({
            title:   "Step 1: Find the Greatest Common Divisor (GCD)",
            text:    `Original fraction: ${printBruch(f1.z, f1.n)}`,
            formula: `GCD(${f1.z}, ${f1.n}) = ${teiler}`
        });

        steps.push({
            title:    "Step 2: Simplify the numerator and denominator",
            text:     `Divide by the GCD (${teiler}):`,
            formula:  `Numerator: ${f1.z} ÷ ${teiler} = ${finalZ}\nDenominator: ${f1.n} ÷ ${teiler} = ${finalN}`,
            solution: `Simplified fraction: ${printBruch(finalZ, finalN)}`
        });

    // ── Expand 
    } else if (currentOperation === "erweitern") {
        const factor = parseInt(inputs.factor.value);
        if (isNaN(factor)) { resetOutput(); return; }
        if (factor === 0)  { showError("Expansion factor cannot be 0!"); return; }

        finalZ = f1.z * factor;
        finalN = f1.n * factor;

        steps.push({
            title:    "Step 1: Multiply the numerator and denominator",
            text:     `Expanding by factor: ${factor}`,
            formula:  `Numerator: ${f1.z} × ${factor} = ${finalZ}\nDenominator: ${f1.n} × ${factor} = ${finalN}`,
            solution: `Expanded fraction: ${printBruch(finalZ, finalN)}`
        });

    // ── Basic arithmetic operations 
    } else {
        const f2 = getFraction(inputs.g2, inputs.z2, inputs.n2);
        if (!f2)               { resetOutput(); return; }
        if (f2 === "NaN_Nenner") { showError("Denominator cannot be 0!"); return; }

        if (currentOperation === "add" || currentOperation === "sub") {
            const hauptnenner = kgv(f1.n, f2.n);
            const mf1         = hauptnenner / f1.n;
            const mf2         = hauptnenner / f2.n;
            const z1_erw      = f1.z * mf1;
            const z2_erw      = f2.z * mf2;

            steps.push({
                title:   "Step 1: Find the Least Common Denominator",
                text:    `Compare denominators (${f1.n} and ${f2.n}):`,
                formula: `LCM(${f1.n}, ${f2.n}) = ${hauptnenner}`
            });

            steps.push({
                title:   "Step 2: Convert the fractions to a common denominator",
                text:    "Calculate and apply the expansion factors:",
                formula: `Fraction 1 (×${mf1}): (${f1.z}×${mf1}) / (${f1.n}×${mf1}) = ${z1_erw}/${hauptnenner}\nFraction 2 (×${mf2}): (${f2.z}×${mf2}) / (${f2.n}×${mf2}) = ${z2_erw}/${hauptnenner}`
            });

            if (currentOperation === "add") {
                finalZ = z1_erw + z2_erw;
                steps.push({
                    title:    "Step 3: Add the numerators",
                    text:     `The denominator (${hauptnenner}) remains unchanged:`,
                    formula:  `${z1_erw}/${hauptnenner} + ${z2_erw}/${hauptnenner} = (${z1_erw} + ${z2_erw}) / ${hauptnenner} = ${finalZ}/${hauptnenner}`,
                    solution: `Intermediate result: ${printBruch(finalZ, hauptnenner)}`
                });

            } else {
                finalZ = z1_erw - z2_erw;
                steps.push({
                    title:    "Step 3: Subtract the numerators",
                    text:     `The denominator (${hauptnenner}) remains unchanged:`,
                    formula:  `${z1_erw}/${hauptnenner} - ${z2_erw}/${hauptnenner} = (${z1_erw} - ${z2_erw}) / ${hauptnenner} = ${finalZ}/${hauptnenner}`,
                    solution: `Intermediate result: ${printBruch(finalZ, hauptnenner)}`
                });
            }

            finalN = hauptnenner;

        } else if (currentOperation === "mul") {
            finalZ = f1.z * f2.z;
            finalN = f1.n * f2.n;

            steps.push({
                title:    "Step 1: Apply the multiplication rule",
                text:     "Multiply numerator by numerator and denominator by denominator:",
                formula:  `Numerator: ${f1.z} × ${f2.z} = ${finalZ}\nDenominator: ${f1.n} × ${f2.n} = ${finalN}`,
                solution: `Intermediate result: ${printBruch(finalZ, finalN)}`
            });

        } else if (currentOperation === "div") {
            if (f2.z === 0) { showError("Division by 0 is not allowed!"); return; }
            finalZ = f1.z * f2.n;
            finalN = f1.n * f2.z;

            steps.push({
                title:   "Step 1: Find the reciprocal",
                text:    `Division becomes multiplication by the reciprocal of ${printBruch(f2.z, f2.n)}:`,
                formula: `Reciprocal: ${printBruch(f2.n, f2.z)}\nSetup: (${f1.z}/${f1.n}) × (${f2.n}/${f2.z})`
            });

            steps.push({
                title:    "Step 2: Multiply",
                text:     "Multiply numerator by numerator and denominator by denominator:",
                formula:  `Numerator: ${f1.z} × ${f2.n} = ${finalZ}\nDenominator: ${f1.n} × ${f2.z} = ${finalN}`,
                solution: `Intermediate result: ${printBruch(finalZ, finalN)}`
            });
        }

        // ---> NEUER FIX: Vorzeichen normieren VOR dem finalen Kürzen <---
        if (finalN < 0) {
            finalZ = -finalZ;
            finalN = Math.abs(finalN);
        }

        // Automatically simplify the final result
        const endTeiler = ggt(finalZ, finalN);
        if (endTeiler > 1) {
            const vorZ = finalZ, vorN = finalN;
            finalZ /= endTeiler;
            finalN /= endTeiler;
            steps.push({
                title:    `Step ${steps.length + 1}: Fully simplify the result`,
                text:     `Divide the numerator and denominator by the common divisor (${endTeiler}):`,
                formula:  `${vorZ} ÷ ${endTeiler} = ${finalZ}\n${vorN} ÷ ${endTeiler} = ${finalN}`,
                solution: `Final result: ${printBruch(finalZ, finalN)}`
            });
        } else {
            // Mark the last existing step as the final result (jetzt mit korrigierten Vorzeichen)
            const last = steps[steps.length - 1];
            if (last) last.solution = `Final result: ${printBruch(finalZ, finalN)}`;
        }
    }

    // Generelles Sicherheitsnetz für negative Nenner (z.B. beim Erweitern mit negativen Zahlen)
    if (finalN < 0) {
        finalZ = -finalZ;
        finalN = Math.abs(finalN);
    }

    // ── Render output 
    loesungOutput.innerHTML = formatResultHTML(finalZ, finalN);

    rechenwegOutput.innerHTML = steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return `
            <div class="step-container ${isLast ? "final-step" : ""}">
                <div class="step-title">${step.title}</div>
                ${step.text     ? `<div class="step-text">${step.text}</div>`         : ""}
                <div class="step-formula-box">${step.formula}</div>
                ${step.solution ? `<div class="step-sub-solution">${step.solution}</div>` : ""}
            </div>`;
    }).join("");

    ausgabeContainer.style.display = "flex";
}

// ── Reset 
function resetOutput() {
    loesungOutput.innerText        = "Result";
    rechenwegOutput.innerHTML      = "";
    ausgabeContainer.style.display = "none";
}

// ── Event Listener 
opButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        opButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentOperation = btn.dataset.operation;
        updateUI();
    });
});

mixedToggle.addEventListener("change", updateUI);

Object.values(inputs).forEach(input => {
    input.addEventListener("input", calculate);
});

// ── Initialization 
document.addEventListener("DOMContentLoaded", updateUI);