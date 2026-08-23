const btnAddInput    = document.getElementById("btnAddInput");
const btnDeleteInput = document.getElementById("btnDeleteInput");
const btnRechnen     = document.getElementById("buttonZahlenInput");
const container      = document.getElementById("systemeContainer");

const output           = document.getElementById("loesungOutput");
const errorBox         = document.getElementById("errorMessages");
const ausgabeContainer = document.getElementById("ausgabeContainer");
const rechenwegDiv     = document.querySelector(".rechenwegDiv");
const rechenwegOutput  = document.getElementById("rechenwegOutput");

let anzahlZusatzInputs = 0;

function exaktRunden(n) {
    return Math.round(n * 1e12) / 1e12;
}

function isValidForBase(value, base) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
    const regex = new RegExp(`^-?[${chars}]+(\\.[${chars}]+)?$`, "i");
    return regex.test(value.trim());
}

function parseBaseNumber(value, base) {
    value = value.trim().toUpperCase();
    if (!isValidForBase(value, base)) return null;

    let sign = 1;
    if (value.startsWith("-")) {
        sign = -1;
        value = value.slice(1);
    }

    let [intPart, fracPart] = value.split(".");

    let intValue = 0;
    for (let i = 0; i < intPart.length; i++) {
        intValue *= base;
        intValue += parseInt(intPart[i], base);
    }

    let fracValue = 0;
    if (fracPart) {
        for (let i = 0; i < fracPart.length; i++) {
            fracValue = exaktRunden(fracValue + parseInt(fracPart[i], base) / Math.pow(base, i + 1));
        }
    }

    return exaktRunden(sign * (intValue + fracValue));
}

function toBaseString(number, base, precision = 10) {
    if (isNaN(number)) return "Fehler";

    let sign = number < 0 ? "-" : "";
    number = Math.abs(number);

    let intPart = Math.floor(number);
    let fracPart = exaktRunden(number - intPart);

    let intStr = intPart.toString(base).toUpperCase();
    if (fracPart === 0) return sign + intStr;

    let fracStr = "";
    for (let i = 0; i < precision; i++) {
        fracPart = exaktRunden(fracPart * base);
        let digit = Math.floor(fracPart);
        fracStr += digit.toString(base).toUpperCase();
        fracPart = exaktRunden(fracPart - digit);
        if (fracPart === 0) break;
    }

    return sign + intStr + "." + fracStr;
}

function calculate(a, b, op) {
    if (op === "+") return exaktRunden(a + b);
    if (op === "-") return exaktRunden(a - b);
    if (op === "*") return exaktRunden(a * b);
    if (op === "/") {
        if (b === 0) return "DIV0";
        return exaktRunden(a / b);
    }
}

function hideAusgabe() {
    rechenwegDiv.style.display = "none";
    output.textContent = "";
    rechenwegOutput.innerHTML = "";
}

function showAusgabe() {
    ausgabeContainer.style.display = "flex";
    rechenwegDiv.style.display = "flex";
}

function zeigeFehler(text) {
    errorBox.textContent = text;
    errorBox.style.display = "block";
    hideAusgabe();
}

function buildRechenwegHTML(zeilen, ergebnisStr, base) {
    let maxLaenge = ergebnisStr.length;
    zeilen.forEach(item => {
        maxLaenge = Math.max(maxLaenge, item.op.length + item.zahl.length);
    });

    const padLeft = (str, len) => " ".repeat(Math.max(0, len - str.length)) + str;

    const zeilenText = zeilen
        .map(item => padLeft(item.op + item.zahl, maxLaenge))
        .join("\n");

    const trennlinie = "-".repeat(maxLaenge);
    const schriftlicheRechnung = `${zeilenText}\n${trennlinie}\n${padLeft(ergebnisStr, maxLaenge)}<sub>${base}</sub>`;

    return `<pre>${schriftlicheRechnung}</pre>`;
}

btnAddInput.addEventListener("click", () => {
    anzahlZusatzInputs++;

    const wrapperOp = document.createElement("div");
    wrapperOp.className = "rechenZeichenSelectDiv zusatzElement"; 
    wrapperOp.innerHTML = `
        <select class="rechenZeichenSelect zusatzSelect">
            <option value="+">+</option>
            <option value="-">−</option>
            <option value="*">×</option>
            <option value="/">÷</option>
        </select>
    `;

    const wrapperInput = document.createElement("div");
    wrapperInput.className = "SytemDiv zusatzElement";
    wrapperInput.innerHTML = `
        <input type="text" 
               placeholder="Number ${anzahlZusatzInputs + 2}" 
               class="zahlenInput zusatzInput">
    `;

    container.appendChild(wrapperOp);
    container.appendChild(wrapperInput);

    errorBox.style.display = "none";
});

btnDeleteInput.addEventListener("click", () => {
    const zusatzElemente = container.querySelectorAll(".zusatzElement");

    if (zusatzElemente.length >= 2) {
        container.removeChild(zusatzElemente[zusatzElemente.length - 1]); 
        container.removeChild(zusatzElemente[zusatzElemente.length - 2]); 

        anzahlZusatzInputs--;
    } else {
        errorBox.textContent = "The standard input fields cannot be deleted!";
        errorBox.style.display = "block";
        setTimeout(() => { errorBox.style.display = "none"; }, 3000);
    }
});

btnRechnen.addEventListener("click", () => {
    errorBox.style.display = "none";
    const base = parseInt(document.getElementById("basea").value);
    const standardPrecision = 10;

    const zahl1Raw = document.getElementById("zahl1Input").value;
    const zahl2Raw = document.getElementById("zahl2Input").value;
    const opMain   = document.getElementById("rechenZeichenMain").value;

    const zahl1 = parseBaseNumber(zahl1Raw, base);
    const zahl2 = parseBaseNumber(zahl2Raw, base);

    if (zahl1 === null || zahl2 === null) {
        zeigeFehler(`Invalid input for base ${base}`);
        return;
    }

    // Präzisionsprüfer für große Zahlen
    let isPrecisionLost = Math.abs(zahl1) > Number.MAX_SAFE_INTEGER || Math.abs(zahl2) > Number.MAX_SAFE_INTEGER;

    const rechenwegZeilen = [
        { op: "", zahl: toBaseString(zahl1, base) },
        { op: opMain, zahl: toBaseString(zahl2, base) }
    ];

    let aktuellesErgebnis = calculate(zahl1, zahl2, opMain);

    if (aktuellesErgebnis === "DIV0") {
        zeigeFehler("Division by 0!");
        return;
    }

    if (Math.abs(aktuellesErgebnis) > Number.MAX_SAFE_INTEGER) {
        isPrecisionLost = true;
    }

    const ops    = document.querySelectorAll(".zusatzSelect");
    const values = document.querySelectorAll(".zusatzInput");

    for (let i = 0; i < ops.length; i++) {
        const valParsed = parseBaseNumber(values[i].value, base);

        if (valParsed === null) {
            zeigeFehler(`Invalid input in additional field ${i + 1}`);
            return;
        }

        if (Math.abs(valParsed) > Number.MAX_SAFE_INTEGER) {
            isPrecisionLost = true;
        }

        rechenwegZeilen.push({ op: ops[i].value, zahl: toBaseString(valParsed, base) });
        aktuellesErgebnis = calculate(aktuellesErgebnis, valParsed, ops[i].value);

        if (aktuellesErgebnis === "DIV0") {
            zeigeFehler("Division by 0!");
            return;
        }

        if (Math.abs(aktuellesErgebnis) > Number.MAX_SAFE_INTEGER) {
            isPrecisionLost = true;
        }
    }

    const strErgebnis = toBaseString(aktuellesErgebnis, base, standardPrecision);

    // Nachkommastellen-Rundung prüfen
    let tempFrac = exaktRunden(Math.abs(aktuellesErgebnis) - Math.floor(Math.abs(aktuellesErgebnis)));
    let checkCount = 0;
    let isTruncated = false;

    while (tempFrac > 0 && checkCount < standardPrecision) {
        tempFrac = exaktRunden(tempFrac * base);
        let ziffer = Math.floor(tempFrac);
        tempFrac = exaktRunden(tempFrac - ziffer);
        checkCount++;
        if (checkCount === standardPrecision && tempFrac > 0) {
            isTruncated = true;
        }
    }

    rechenwegOutput.innerHTML = buildRechenwegHTML(rechenwegZeilen, strErgebnis, base);
    
    output.innerHTML = `
        ${strErgebnis}<sub>${base}</sub>
        ${isTruncated ? `<div style="font-size: 0.5em; margin-top: 5px; color: #666; font-weight: normal;">Result rounded to ${standardPrecision} decimal places</div>` : ''}
        ${isPrecisionLost ? `<div style="font-size: 0.5em; margin-top: 5px; color: #d9534f; font-weight: normal;">Warning: Number is extremely large. Precision loss may occur.</div>` : ''}
    `;

    showAusgabe();
});

hideAusgabe();

document.querySelector(".zahlenBody").addEventListener("input", () => {
    errorBox.style.display = "none";
});