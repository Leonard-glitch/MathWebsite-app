const inputContainer  = document.getElementById("cardDezimalContainer");
const outputContainer = document.getElementById("cardBruchContainer");
const swapBtn          = document.getElementById("swapBtn");
const errorMessages    = document.getElementById("errorMessages");
const ausgabeContainer = document.getElementById("ausgabeContainer");
const rechenwegOutput  = document.getElementById("rechenwegOutput");

const cardDezHTML = `
    <div class="card">
        <h2>Decimal</h2>
        <input type="number" id="inputFeld3" placeholder="0.75" class="numberInputField">
    </div>`;

const cardBruchHTML = `
    <div class="card">
        <h2>Fraction</h2>
        <div class="bruchEingabe">
            <input type="number" id="zaehler1" placeholder="Numerator" class="numberInputField" step="1">
            <div class="bruchStrich"></div>
            <input type="number" id="nenner1" placeholder="Denominator" class="numberInputField" step="1">
        </div>
    </div>`;

let isDezimalToBruch = true;

const MAX_NACHKOMMASTELLEN = 10;

function ggt(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : ggt(b, a % b);
}

// "1e-7" -> "0.0000001", "2.5E3" -> "2500"
function expandExponent(str) {
    const m = /^([+-]?)(\d*)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(str);
    if (!m) return str;
    const [, sign, intDigits, fracDigits = "", expStr] = m;
    const digits = intDigits + fracDigits;
    const pointPos = intDigits.length + parseInt(expStr, 10);
    let out;
    if (pointPos <= 0)                  out = "0." + "0".repeat(-pointPos) + digits;
    else if (pointPos >= digits.length) out = digits + "0".repeat(pointPos - digits.length);
    else                                out = digits.slice(0, pointPos) + "." + digits.slice(pointPos);
    return sign + out;
}

function hideError() {
    errorMessages.style.display = "none";
}

function showError(msg) {
    ausgabeContainer.style.display = "none";
    errorMessages.textContent = msg;
    errorMessages.style.display = "block";
}

function renderRechenweg(steps) {
    rechenwegOutput.innerHTML = steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return `
            <div class="step-container ${isLast ? "final-step" : ""}">
                <div class="step-title">${step.title}</div>
                ${step.text     ? `<div class="step-text">${step.text}</div>`         : ""}
                ${step.formula  ? `<div class="step-formula-box">${step.formula}</div>` : ""}
                ${step.solution ? `<div class="step-sub-solution">${step.solution}</div>` : ""}
            </div>`;
    }).join("");
}

function berechneLive() {
    hideError();
    rechenwegOutput.innerHTML = "";

    if (isDezimalToBruch) {
        berechneDezimalZuBruch();
    } else {
        berechneBruchZuDezimal();
    }
}

function berechneDezimalZuBruch() {
    const dezInput   = document.getElementById("inputFeld3");
    const zaehlerOut = document.getElementById("zaehler1");
    const nennerOut  = document.getElementById("nenner1");

    const rawValue = expandExponent(dezInput.value.trim().replace(",", "."));

    if (rawValue === "") {
        zaehlerOut.value = "";
        nennerOut.value  = "";
        ausgabeContainer.style.display = "none";
        return;
    }

    if (!Number.isFinite(Number(rawValue))) {
        showError("Please enter a valid decimal number.");
        return;
    }

    const [intPart, rawFrac = ""] = rawValue.split(".");
    const fracPart           = rawFrac.slice(0, MAX_NACHKOMMASTELLEN);
    const nachkommastellen   = fracPart.length;
    const erweiterungsFaktor = Math.pow(10, nachkommastellen);
    const decimalNumber      = parseFloat(fracPart ? `${intPart}.${fracPart}` : intPart);

    const startZaehler = Math.round(decimalNumber * erweiterungsFaktor);
    const startNenner  = erweiterungsFaktor;

    const teiler  = ggt(startZaehler, startNenner);
    const zaehler = startZaehler / teiler;
    const nenner  = startNenner / teiler;

    // Non-zero input that becomes 0 after cutting at 10 decimal places (e.g. 1e-12)
    if (startZaehler === 0 && /[1-9]/.test(rawValue)) {
        showError(`Value too small: only the first ${MAX_NACHKOMMASTELLEN} decimal places are supported.`);
        return;
    }

    zaehlerOut.value = zaehler;
    nennerOut.value  = nenner;

    const steps = [{
        title:   "Step 1: Count decimal places",
        text:    nachkommastellen > 0
            ? `${decimalNumber} has ${nachkommastellen} decimal place(s) → Expansion factor 10^${nachkommastellen}.`
            : `${decimalNumber} has no decimal places.`,
        formula: `Expansion factor = ${erweiterungsFaktor}`
    }, {
        title:    "Step 2: Expand with the factor",
        text:     "Multiply the number by the expansion factor to get a fraction without decimals:",
        formula:  `${decimalNumber} × ${erweiterungsFaktor} = ${startZaehler}`,
        solution: `Intermediate result: ${startZaehler}/${startNenner}`
    }];

    if (teiler > 1) {
        steps.push({
            title:    "Step 3: Simplify the fraction",
            text:     "Calculate the greatest common divisor (GCD) of numerator and denominator and simplify:",
            formula:  `GCD(${startZaehler}, ${startNenner}) = ${teiler}\n${startZaehler} ÷ ${teiler} = ${zaehler}\n${startNenner} ÷ ${teiler} = ${nenner}`,
            solution: `Final result: ${zaehler}/${nenner}`
        });
    } else {
        steps[steps.length - 1].solution = `Final result: ${zaehler}/${nenner} (already fully simplified)`;
    }

    renderRechenweg(steps);
    ausgabeContainer.style.display = "flex";
}

function berechneBruchZuDezimal() {
    const zaehlerInput = document.getElementById("zaehler1");
    const nennerInput  = document.getElementById("nenner1");
    const dezOut       = document.getElementById("inputFeld3");

    const zRaw = zaehlerInput.value.trim().replace(",", ".");
    const nRaw = nennerInput.value.trim().replace(",", ".");

    if (zRaw === "" || nRaw === "") {
        dezOut.value = "";
        ausgabeContainer.style.display = "none";
        return;
    }

    const z = Number(zRaw);
    const n = Number(nRaw);

    if (isNaN(z) || isNaN(n)) {
        showError("Please enter valid numbers.");
        return;
    }

    if (!Number.isInteger(z) || !Number.isInteger(n)) {
        showError("Numerator and denominator must be whole numbers.");
        return;
    }

    if (n === 0) {
        showError("Division by 0 is not allowed! (Denominator cannot be 0)");
        return;
    }

    const ergebnis       = z / n;
    const gerundet       = Math.round((ergebnis + Number.EPSILON) * 1e6) / 1e6;
    const wurdeGerundet  = ergebnis !== gerundet;

    dezOut.value = gerundet;

    const steps = [{
        title:   "Step 1: Understand fraction as division",
        text:    "A fraction represents the division of the numerator by the denominator:",
        formula: `${z}/${n} = ${z} ÷ ${n}`
    }, {
        title:    "Step 2: Calculate division",
        text:     wurdeGerundet
            ? "Calculate result (rounded to 6 decimal places as the decimal number is infinitely long):"
            : "Calculate result:",
        formula:  `${z} ÷ ${n} = ${gerundet}`,
        solution: `Final result: ${gerundet}`
    }];

    renderRechenweg(steps);
    ausgabeContainer.style.display = "flex";
}

function initLiveEvents() {
    if (isDezimalToBruch) {
        document.getElementById("inputFeld3")?.addEventListener("input", berechneLive);
    } else {
        document.getElementById("zaehler1")?.addEventListener("input", berechneLive);
        document.getElementById("nenner1")?.addEventListener("input", berechneLive);
    }
}

function swapCards() {
    const dezValue     = document.getElementById("inputFeld3")?.value ?? "";
    const zaehlerValue = document.getElementById("zaehler1")?.value ?? "";
    const nennerValue  = document.getElementById("nenner1")?.value ?? "";

    isDezimalToBruch = !isDezimalToBruch;

    if (isDezimalToBruch) {
        inputContainer.innerHTML  = cardDezHTML;
        outputContainer.innerHTML = cardBruchHTML;
        document.getElementById("inputFeld3").value = dezValue;
    } else {
        inputContainer.innerHTML  = cardBruchHTML;
        outputContainer.innerHTML = cardDezHTML;
        document.getElementById("zaehler1").value = zaehlerValue;
        document.getElementById("nenner1").value  = nennerValue;
    }

    outputContainer.querySelectorAll("input").forEach(input => input.setAttribute("readonly", true));

    initLiveEvents();
    berechneLive();
}

swapBtn.addEventListener("click", () => {
    swapBtn.classList.add("rotate");
    setTimeout(() => swapBtn.classList.remove("rotate"), 350);
    swapCards();
});

document.addEventListener("DOMContentLoaded", () => {
    outputContainer.querySelectorAll("input").forEach(input => input.setAttribute("readonly", true));
    initLiveEvents();
});