const dropdownAusg = document.getElementById("basea");
const dropdownZiel = document.getElementById("basez");
const zahl = document.getElementById("zahlenInput");
const zahlenOutput = document.getElementById("loesungOutput");
const rechenwegOutput = document.getElementById("rechenwegOutput");
const btn = document.getElementById("buttonZahlenInput");
const errorMessages = document.getElementById("errorMessages");

dropdownAusg.value = "10";
dropdownZiel.value = "2";

function exaktRunden(n) {
    return Math.round(n * 1e12) / 1e12;
}

btn.addEventListener("click", function() {
    const basisAusg = parseInt(dropdownAusg.value);
    const basisZiel = parseInt(dropdownZiel.value);
    const rawInput = zahl.value.trim();
    const inputZahl = rawInput.replace(",", ".");
    const standardPrecision = 10;

    function showError(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        rechenwegOutput.innerHTML = "";
        document.querySelector(".rechenwegDiv").style.display = "none";
        zahlenOutput.textContent = "";
    }

    if (rawInput === "") {
        return showError("Please enter a number!");
    }

    if (inputZahl.includes("-")) {
        return showError("Negative numbers are not supported.");
    }

    if (inputZahl.split(".").length > 2) {
        return showError("Invalid format: Too many decimal points.");
    }

    const dezimal = toDecimalMitKomma(inputZahl, basisAusg);

    if (isNaN(dezimal)) {
        return showError(`Invalid input for base ${basisAusg}.`);
    }

    const isPrecisionLost = Math.abs(dezimal) > Number.MAX_SAFE_INTEGER;

    errorMessages.style.display = "none";

    const ergebnis = fromDecimalMitKomma(dezimal, basisZiel, standardPrecision);

    let ganz = Math.floor(exaktRunden(dezimal));
    let restKomma = exaktRunden(dezimal - ganz);
    let checkCount = 0;
    let istAbgeschnitten = false;

    let tempKomma = restKomma;
    while (tempKomma > 0 && checkCount < standardPrecision) {
        tempKomma = exaktRunden(tempKomma * basisZiel);
        let ziffer = Math.floor(tempKomma);
        tempKomma = exaktRunden(tempKomma - ziffer);
        checkCount++;
        if (checkCount === standardPrecision && tempKomma > 0) {
            istAbgeschnitten = true;
        }
    }

    zahlenOutput.innerHTML = `
        ${ergebnis}<sub>${basisZiel}</sub>
        ${istAbgeschnitten ? `<div style="font-size: 0.5em; margin-top: 5px; color: #666; font-weight: normal;">Result rounded to ${standardPrecision} decimal places</div>` : ''}
        ${isPrecisionLost ? `<div style="font-size: 0.5em; margin-top: 5px; color: #d9534f; font-weight: normal;">Warning: Number is extremely large. Precision loss may occur.</div>` : ''}
    `;

    let lwegAnzeigen = document.querySelector(".rechenwegDiv");
    lwegAnzeigen.style.display = "flex";

    if (basisAusg == basisZiel) {
        rechenwegOutput.innerHTML = `<p class="loesungEndeRechnung">No conversion necessary.</p>`;
    } else if (basisAusg != 10 && basisZiel == 10) {
        rechenwegOutput.innerHTML = rechenwegZuDezimalKomma(inputZahl, basisAusg);
    } else if (basisAusg != 10 && basisZiel != 10) {
        rechenwegOutput.innerHTML = rechenwegKombi(inputZahl, basisAusg, basisZiel, standardPrecision);
    } else {
        rechenwegOutput.innerHTML = rechenwegVonDezimalKomma(dezimal, basisZiel, basisAusg, standardPrecision);
    }
});

zahl.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        btn.click();
    }
});

zahl.addEventListener("focus", function() {
    zahl.select();
});

zahl.addEventListener("input", function(){
    errorMessages.style.display = "none";
});

function fromDecimalMitKomma(dezimal, basis, precision = 10) {
    let ganz = Math.floor(exaktRunden(dezimal));
    let komma = exaktRunden(dezimal - ganz);
    let ganzStr = ganz.toString(basis).toUpperCase();
    let kommaStr = "";
    let count = 0;

    while (komma > 0 && count < precision) {
        komma = exaktRunden(komma * basis);
        let ziffer = Math.floor(komma);
        kommaStr += ziffer.toString(basis).toUpperCase();
        komma = exaktRunden(komma - ziffer);
        count++;
    }
    return kommaStr ? `${ganzStr}.${kommaStr}` : ganzStr;
}

function toDecimalMitKomma(input, basis) {
    let [ganz, komma] = input.split(".");
    let dezimal = 0;
    let ganzArr = ganz.split("").reverse();

    for (let i = 0; i < ganzArr.length; i++) {
        let val = parseInt(ganzArr[i], basis);
        if (isNaN(val)) return NaN;
        dezimal += val * Math.pow(basis, i);
    }

    if (komma) {
        let kommaArr = komma.split("");
        for (let i = 0; i < kommaArr.length; i++) {
            let val = parseInt(kommaArr[i], basis);
            if (isNaN(val)) return NaN;
            dezimal += val * Math.pow(basis, -(i + 1));
        }
    }
    return exaktRunden(dezimal);
}

function rechenwegVonDezimalKomma(dezimal, basis, basisAusg, precision = 10) {
    let ganz = Math.floor(exaktRunden(dezimal));
    let komma = exaktRunden(dezimal - ganz);
    let ganzLines = [], kommaLines = [], ganzErg = "";

    let temp = ganz;
    if (temp === 0) ganzLines.push(`0 : ${basis} = 0 R 0`);
    while (temp > 0) {
        let rest = temp % basis;
        let quot = Math.floor(temp / basis);
        ganzLines.push(`${temp} : ${basis} = ${quot} R ${rest.toString(basis).toUpperCase()}`);
        ganzErg = rest.toString(basis).toUpperCase() + ganzErg;
        temp = quot;
    }
    if (ganzErg === "") ganzErg = "0";

    let count = 0, kommaErg = "";
    let aktuellesKomma = komma;

    while (aktuellesKomma > 0 && count < precision) {
        let altKomma = aktuellesKomma;
        let mult = exaktRunden(aktuellesKomma * basis);
        let ziffer = Math.floor(mult);
        
        kommaLines.push(`${altKomma} × ${basis} = ${mult} → ${ziffer.toString(basis).toUpperCase()}`);
        
        kommaErg += ziffer.toString(basis).toUpperCase();
        aktuellesKomma = exaktRunden(mult - ziffer);
        count++;
    }

    const hatKomma = kommaLines.length > 0;
    const finalesErgebnis = `${ganzErg}${kommaErg ? "." + kommaErg : ""}`;

    return `
        <p class="zahlInfo">Number: ${dezimal}<sub>${basisAusg}</sub></p>
        ${hatKomma ? '<p><b>Integer part:</b></p>' : ''}
        <pre>${ganzLines.join("\n")}</pre>
        ${hatKomma ? `<p><b>Fractional part:</b></p><pre>${kommaLines.join("\n")}</pre>` : ''}
        <p class="loesungEndeRechnung">Result: ${finalesErgebnis}<sub>${basis}</sub></p>`;
}

function rechenwegZuDezimalKomma(inputZahl, basis) {
    let [ganz, komma] = inputZahl.split(".");
    let dezimalGanz = 0, dezimalKomma = 0;
    let ganzLines = [], kommaLines = [];

    let ganzArr = ganz.split("").reverse();
    for (let i = 0; i < ganzArr.length; i++) {
        let val = parseInt(ganzArr[i], basis);
        let teil = val * Math.pow(basis, i);
        dezimalGanz += teil;
        ganzLines.push(`${ganzArr[i]} × ${basis}<sup>${i}</sup> = ${teil}`);
    }

    if (komma) {
        let kommaArr = komma.split("");
        for (let i = 0; i < kommaArr.length; i++) {
            let val = parseInt(kommaArr[i], basis);
            let teil = val * Math.pow(basis, -(i + 1));
            dezimalKomma += teil;
            kommaLines.push(`${kommaArr[i]} × ${basis}<sup>-${i+1}</sup> = ${exaktRunden(teil)}`);
        }
    }

    const hatKomma = kommaLines.length > 0;
    const gesamt = exaktRunden(dezimalGanz + dezimalKomma);
    return `
        <p class="zahlInfo">Number: ${inputZahl}<sub>${basis}</sub></p>
        ${hatKomma ? '<p><b>Integer part:</b></p>' : ''}
        <pre>${ganzLines.join("\n")}</pre>
        ${hatKomma ? `<p><b>Fractional part:</b></p><pre>${kommaLines.join("\n")}</pre>` : ''}
        <p class="loesungEndeRechnung">Result: ${gesamt}<sub>10</sub></p>`;
}

function rechenwegKombi(inputZahl, basisAusg, basisZiel, precision = 10) {
    let dezimal = toDecimalMitKomma(inputZahl, basisAusg);
    return `
        <p class="rechenSchrittText"><b>Step 1: Convert to decimal</b></p>
        ${rechenwegZuDezimalKomma(inputZahl, basisAusg)}
        <p class="rechenSchrittText"><b>Step 2: Convert to base ${basisZiel}</b></p>
        ${rechenwegVonDezimalKomma(dezimal, basisZiel, 10, precision)}`;
}