const errorMessages=document.getElementById("errorMessages");
const ausgabeContainer=document.getElementById("ausgabeContainer");
const rechenwegOutput=document.getElementById("rechenwegOutput");
const typeButtons=document.querySelectorAll(".gleichungTypeBtn");

let currentType = "allgemein"; 

typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        typeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentType = btn.dataset.type;
        if(currentType==="allgemein"){
            document.getElementById("allgemeineGleichungsContainer").style.display="flex";
            document.getElementById("lineareGleichungsContainer").style.display="none";
            document.getElementById("mathInputAllgemein")?.dispatchEvent(new Event("input"));
        }else if(currentType==="linear"){
            document.getElementById("allgemeineGleichungsContainer").style.display="none";
            document.getElementById("lineareGleichungsContainer").style.display="flex";
            validateLinearSystem();
        }
    });
});


const btnAddInput    = document.getElementById("btnAddInput");
const btnDeleteInput = document.getElementById("btnDeleteInput");
const container = document.querySelector(".inputsContainer");

const maxZusatzInputs = 10;
let anzahlZusatzInputs = 0;


btnAddInput.addEventListener("click", () => {
    if (anzahlZusatzInputs >= maxZusatzInputs) {
        showError(`Maximum number of ${maxZusatzInputs + 2} input fields reached!`);
        setTimeout(() => { hideError(); }, 3000);
        return;
    }
    anzahlZusatzInputs++;

    const wrapperInput = document.createElement("div");
    wrapperInput.className = "inputRow zusatzElement"; 
    wrapperInput.innerHTML = `
        <span class="rowNumber">${anzahlZusatzInputs + 2}&#41;</span><math-field class="numberInputField lgsGleichungInput" placeholder="$$a+7b=6 $$"></math-field>
    `;

    container.appendChild(wrapperInput);

    hideError();
    validateLinearSystem();
});

btnDeleteInput.addEventListener("click", () => {
    const zusatzElemente = container.querySelectorAll(".zusatzElement");

    if (zusatzElemente.length >= 1) {
        container.removeChild(zusatzElemente[zusatzElemente.length - 1]);

        anzahlZusatzInputs--;
        validateLinearSystem();
    } else {
        showError("The default input fields cannot be deleted!");
        setTimeout(() => { hideError(); }, 3000);
    }
});

function showError(message) {
    errorMessages.textContent = message;
    errorMessages.style.display = "block";
}

function hideError() {
    errorMessages.style.display = "none";
}



const procedureSelect = document.getElementById("selectProcedure");
const expandBtn = document.querySelector(".expandBtn");

expandBtn.addEventListener("click", () => {
    if (procedureSelect.style.display === "none" || procedureSelect.style.display === "") {
        procedureSelect.style.display = "block";
        expandBtn.innerHTML = `<i class="fa fa-chevron-up"></i>`;
    } else {
        procedureSelect.style.display = "none";
        expandBtn.innerHTML = `<i class="fa fa-chevron-down"></i>`;
    }
});








class FormulaError extends Error {}

function exaktRunden(n) {
    return Math.round(n * 1e10) / 1e10;
}


const BLACKLIST_CHECKS = [
    { re: /\\int|\\iint|\\iiint|\\oint/, msg: "Integrals are not supported." },
    { re: /\\sum/, msg: "Summation notation is not supported." },
    { re: /\\prod/, msg: "Product notation is not supported." },
    { re: /\\lim/, msg: "Limits are not supported." },
    { re: /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)\}/, msg: "Matrices and piecewise functions are not supported." },
    { re: /\\vec|\\overrightarrow/, msg: "Vectors are not supported." },
    { re: /\\det/, msg: "Determinants are not supported." },
    { re: /\\in\b|\\notin|\\subset|\\subseteq|\\cup|\\cap|\\emptyset|\\forall|\\exists/, msg: "Set theory notation is not supported." },
    { re: /\\Rightarrow|\\Leftrightarrow|\\rightarrow|\\wedge|\\vee|\\neg/, msg: "Logic operators are not supported." },
    { re: /\\leq|\\geq|\\neq|\\approx|\\equiv|[<>]/, msg: "Inequalities are not supported – only equations with \"=\"." },
    { re: /\\partial|\\nabla|\\prime/, msg: "Derivatives are not supported." },
    { re: /\\Im\b|\\Re\b|\\overline\{|\\bar\{|\\mathbb\{C\}/, msg: "Complex numbers are not supported." },
    { re: /\\binom|\\choose/, msg: "Binomial coefficients are not supported." }
];

function checkBlacklist(latex) {
    for (const { re, msg } of BLACKLIST_CHECKS) {
        if (re.test(latex)) throw new FormulaError(msg);
    }
}

const GREEK_LETTERS = {
    alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε",
    zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ",
    lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", rho: "ρ",
    sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", chi: "χ",
    psi: "ψ", omega: "ω",

    Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ",
    Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω"
};

// Tokenizer

function readBraceOrBareArgument(latex, i, contextLabel) {
    const n = latex.length;
    while (i < n && /\s/.test(latex[i])) i++;

    if (latex[i] === "{") {
        let depth = 0;
        const start = i;
        for (let k = i; k < n; k++) {
            if (latex[k] === "{") depth++;
            else if (latex[k] === "}") {
                depth--;
                if (depth === 0) {
                    const end = k + 1;
                    const inner = latex.slice(start + 1, end - 1);
                    const innerTokens = tokenize(inner).slice(0, -1);
                    return { tokens: [{ type: "LBRACE" }, ...innerTokens, { type: "RBRACE" }], nextIndex: end };
                }
            }
        }
        throw new FormulaError("A curly brace was not closed properly.");
    }

    if (latex[i] === "\\") {
        let j = i + 1;
        while (j < n && /[a-zA-Z]/.test(latex[j])) j++;
        const innerTokens = tokenize(latex.slice(i, j)).slice(0, -1);
        if (innerTokens.length !== 1) {
            throw new FormulaError(`After "${contextLabel}" without curly braces, a single digit, letter, or "\\pi" is expected.`);
        }
        return { tokens: [{ type: "LBRACE" }, ...innerTokens, { type: "RBRACE" }], nextIndex: j };
    }

    if (/[0-9a-zA-Z]/.test(latex[i])) {
        const innerTokens = tokenize(latex[i]).slice(0, -1);
        return { tokens: [{ type: "LBRACE" }, ...innerTokens, { type: "RBRACE" }], nextIndex: i + 1 };
    }

    throw new FormulaError(`"${contextLabel}" is incomplete.`);
}

function tokenize(latex) {
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
                case "left": case "right": continue; // transparent
                case "cdot": case "times": tokens.push({ type: "MUL" }); continue;
                case "div": tokens.push({ type: "DIV" }); continue;
                                case "frac": {
                    const numArg = readBraceOrBareArgument(latex, i, "\\frac");
                    const denArg = readBraceOrBareArgument(latex, numArg.nextIndex, "\\frac");
                    tokens.push({ type: "FRAC" }, ...numArg.tokens, ...denArg.tokens);
                    i = denArg.nextIndex;
                    continue;
                }
                case "sqrt": {
                    let cursor = i;
                    while (cursor < n && /\s/.test(latex[cursor])) cursor++;
                    const indexTokens = [];
                    if (latex[cursor] === "[") {
                        let depth = 0, bracketEnd = -1;
                        for (let k = cursor; k < n; k++) {
                            if (latex[k] === "[") depth++;
                            else if (latex[k] === "]") { depth--; if (depth === 0) { bracketEnd = k + 1; break; } }
                        }
                        if (bracketEnd === -1) throw new FormulaError("The root index was not closed.");
                        const innerIndex = latex.slice(cursor + 1, bracketEnd - 1);
                        indexTokens.push({ type: "LBRACKET" }, ...tokenize(innerIndex).slice(0, -1), { type: "RBRACKET" });
                        cursor = bracketEnd;
                    }
                    const arg = readBraceOrBareArgument(latex, cursor, "\\sqrt");
                    tokens.push({ type: "SQRT" }, ...indexTokens, ...arg.tokens);
                    i = arg.nextIndex;
                    continue;
                }
                case "pi": tokens.push({ type: "CONST", name: "pi" }); continue;
                case "sin": case "cos": case "tan":
                case "ln": case "exp":
                    tokens.push({ type: "FUNC", name: cmd }); continue;
                case "log":
                    tokens.push({ type: "FUNC", name: "log" }); continue;
                case "arcsin": tokens.push({ type: "FUNC", name: "asin" }); continue;
                case "arccos": tokens.push({ type: "FUNC", name: "acos" }); continue;
                case "arctan": tokens.push({ type: "FUNC", name: "atan" }); continue;
                default:
                    if (GREEK_LETTERS.hasOwnProperty(cmd)) {
                        tokens.push({ type: "LETTER", value: GREEK_LETTERS[cmd] });
                        continue;
                    }
                    throw new FormulaError("This mathematical element is currently not supported.");
            }
        }

        if (ch === "{") { tokens.push({ type: "LBRACE" }); i++; continue; }
        if (ch === "}") { tokens.push({ type: "RBRACE" }); i++; continue; }
        if (ch === "[") { tokens.push({ type: "LBRACKET" }); i++; continue; }
        if (ch === "]") { tokens.push({ type: "RBRACKET" }); i++; continue; }
        if (ch === "(") { tokens.push({ type: "LPAREN" }); i++; continue; }
        if (ch === ")") { tokens.push({ type: "RPAREN" }); i++; continue; }
        if (ch === "|") { tokens.push({ type: "PIPE" }); i++; continue; }
        if (ch === "^") { tokens.push({ type: "CARET" }); i++; continue; }
        if (ch === "_") { tokens.push({ type: "UNDERSCORE" }); i++; continue; }
        if (ch === "+") { tokens.push({ type: "PLUS" }); i++; continue; }
        if (ch === "-") { tokens.push({ type: "MINUS" }); i++; continue; }
        if (ch === "*") { tokens.push({ type: "MUL" }); i++; continue; }
        if (ch === "/") { tokens.push({ type: "DIV" }); i++; continue; }
        if (ch === "=") { tokens.push({ type: "EQUALS" }); i++; continue; }

        if (/[0-9]/.test(ch) || ((ch === "." || ch === ",") && /[0-9]/.test(latex[i + 1] || ""))) {
            let j = i;
            let raw = "";
            while (j < n && /[0-9]/.test(latex[j])) { raw += latex[j]; j++; }
            if (latex[j] === "." || latex[j] === ",") {
                raw += "."; j++;
                while (j < n && /[0-9]/.test(latex[j])) { raw += latex[j]; j++; }
            }
            tokens.push({ type: "NUM", value: parseFloat(raw), raw });
            i = j;
            continue;
        }

        if (/[a-zA-Z]/.test(ch)) {
            tokens.push({ type: "LETTER", value: ch });
            i++;
            continue;
        }

        throw new FormulaError(`The character "${ch}" is not recognized. Please check your input.`);
    }

    tokens.push({ type: "EOF" });
    return tokens;
}


// parseEquation

function parseEquation(tokens) {
    let pos = 0;
    let openPipes = 0;
    const peek = () => tokens[pos];
    const advance = () => tokens[pos++];
    const expect = (type, msg) => {
        if (peek().type !== type) throw new FormulaError(msg || `Expected: ${type}`);
        return advance();
    };
    const atomStartTypes = ["NUM", "LETTER", "CONST", "LPAREN", "PIPE", "FRAC", "SQRT", "FUNC"];
    const startsAtom = (t) => atomStartTypes.includes(t);

    function parseExpression() {
        let node = parseTerm();
        while (peek().type === "PLUS" || peek().type === "MINUS") {
            const op = advance().type;
            const rhs = parseTerm();
            node = { type: op === "PLUS" ? "add" : "sub", left: node, right: rhs };
        }
        return node;
    }

    function parseTerm() {
        let node = parseFactor();
        while (true) {
            const t = peek().type;
            if (t === "MUL") { advance(); node = { type: "mul", left: node, right: parseFactor() }; }
            else if (t === "DIV") { advance(); node = { type: "div", left: node, right: parseFactor() }; }
            else if (t === "PIPE" && openPipes > 0) { break; } // closing absolute value bar, no implicit multiplication
            else if (startsAtom(t)) { node = { type: "mul", left: node, right: parseFactor() }; }
            else break;
        }
        return node;
    }

    function parseFactor() {
        if (peek().type === "MINUS") {
            advance();
            return { type: "neg", arg: parseFactor() };
        }
        return parsePower();
    }

    function parsePower() {
        let base = parseAtom();
        if (peek().type === "CARET") {
            advance();
            const exp = parseExponent();
            return { type: "pow", base, exp };
        }
        return base;
    }

    function parseExponent() {
        if (peek().type === "LBRACE") {
            advance();
            const e = parseExpression();
            expect("RBRACE", "The exponent was not closed properly.");
            return e;
        }
        return parseFactor();
    }

    function parseSubscriptRaw() {
        if (peek().type === "LBRACE") {
            advance();
            let text = "";
            while (peek().type !== "RBRACE") {
                if (peek().type === "EOF") throw new FormulaError("The subscript was not closed.");
                const t = advance();
                if (t.type === "LETTER") text += t.value;
                else if (t.type === "NUM") text += t.raw;
                else throw new FormulaError("The subscript contains an invalid character.");
            }
            advance();
            return text;
        }
        const t = advance();
        if (t.type === "LETTER") return t.value;
        if (t.type === "NUM") return t.raw;
        throw new FormulaError("The subscript contains an invalid character.");
    }

    function parseSubscriptExpr() {
        if (peek().type === "LBRACE") {
            advance();
            const e = parseExpression();
            expect("RBRACE", "The logarithm base was not closed properly.");
            return e;
        }
        return parseAtom();
    }

    function parseFuncArgNoParens() {
        let node = parseFactor();
        while (startsAtom(peek().type)) {
            node = { type: "mul", left: node, right: parseFactor() };
        }
        return node;
    }

    function parseAtom() {
        const t = peek();

        switch (t.type) {
            case "NUM":
                advance();
                return { type: "num", value: t.value, raw: t.raw };

            case "CONST":
                advance();
                return { type: "const", name: t.name };

                        case "LETTER": {
                advance();
                let name = t.value;
                if (peek().type === "UNDERSCORE") {
                    advance();
                    name += "_" + parseSubscriptRaw();
                }
                return { type: "var", name };
            }

            case "LPAREN": {
                advance();
                const e = parseExpression();
                expect("RPAREN", "A parenthesis was not closed.");
                return e;
            }

            case "PIPE": {
                openPipes++;
                advance();
                const e = parseExpression();
                expect("PIPE", "The absolute value bars were not closed.");
                openPipes--;
                return { type: "abs", arg: e };
            }

            case "FRAC": {
                advance();
                expect("LBRACE", "The fraction is incomplete – the numerator is missing.");
                const num = parseExpression();
                expect("RBRACE", "The numerator of the fraction was not properly closed.");
                expect("LBRACE", "The fraction is incomplete – the denominator is missing.");
                const den = parseExpression();
                expect("RBRACE", "The denominator of the fraction was not properly closed.");
                return { type: "div", left: num, right: den };
            }

            case "SQRT": {
                advance();
                let index = null;
                if (peek().type === "LBRACKET") {
                    advance();
                    index = parseExpression();
                    expect("RBRACKET", "The root index was not closed.");
                }
                expect("LBRACE", "The contents of the square root are missing.");
                const arg = parseExpression();
                expect("RBRACE", "The square root was not properly closed.");
                return { type: "sqrt", arg, index };
            }

            case "FUNC": {
                advance();
                let base = null;
                if (t.name === "log" && peek().type === "UNDERSCORE") {
                    advance();
                    base = parseSubscriptExpr();
                }
                let funcExponent = null;
                if (peek().type === "CARET") {
                    advance();
                    funcExponent = parseExponent();
                }
                if (peek().type === "LPAREN") {
                    advance();
                    const arg = parseExpression();
                    expect("RPAREN", "The parenthesis following the function was not closed.");
                    const funcNode = { type: "func", name: t.name, arg, base };
                    return funcExponent ? { type: "pow", base: funcNode, exp: funcExponent } : funcNode;
                }
                if (!startsAtom(peek().type) && peek().type !== "MINUS") {
                    throw new FormulaError(`An argument is missing after the function "${t.name}" (e.g., a number, variable, or parenthesis).`);
                }
                const arg = parseFuncArgNoParens();
                const funcNode = { type: "func", name: t.name, arg, base };
                return funcExponent ? { type: "pow", base: funcNode, exp: funcExponent } : funcNode;
            }

            default:
                throw new FormulaError("The formula contains an unexpected element at this position.");
        }
    }

    const left = parseExpression();
    expect("EQUALS", "Your formula must contain exactly one equals sign (=).");
    const right = parseExpression();
    if (peek().type === "EQUALS") {
        throw new FormulaError("Only one equals sign (=) is allowed.");
    }
    if (peek().type !== "EOF") {
        throw new FormulaError("There are extra characters at the end of the formula. Please check your input.");
    }
    return { left, right };
}


// AST HELPER FUNCTIONS

function getChildren(node) {
    switch (node.type) {
        case "num": case "var": case "const": return [];
        case "add": case "sub": case "mul": case "div": return [node.left, node.right];
        case "neg": return [node.arg];
        case "pow": return [node.base, node.exp];
        case "sqrt": return node.index ? [node.arg, node.index] : [node.arg];
        case "abs": return [node.arg];
        case "func": return node.base ? [node.arg, node.base] : [node.arg];
        default: return [];
    }
}

function containsVar(node, name) {
    if (node.type === "var" && node.name === name) return true;
    return getChildren(node).some(c => containsVar(c, name));
}

function countVarOccurrences(node, name) {
    let count = (node.type === "var" && node.name === name) ? 1 : 0;
    for (const c of getChildren(node)) count += countVarOccurrences(c, name);
    return count;
}

function collectVariableNames(eq) {
    const set = new Set();
    (function walk(node) {
        if (node.type === "var") set.add(node.name);
        getChildren(node).forEach(walk);
    })(eq.left);
    (function walk(node) {
        if (node.type === "var") set.add(node.name);
        getChildren(node).forEach(walk);
    })(eq.right);
    return Array.from(set);
}

function isConstNum(node, val) {
    return node.type === "num" && node.value === val;
}

function numNode(v) {
    const r = exaktRunden(v);
    return { type: "num", value: r, raw: String(r) };
}


// AST HELPER FUNCTIONS (TERM COMBINING)

function flattenTerms(node, sign, terms) {
    if (node.type === "add") {
        flattenTerms(node.left, sign, terms);
        flattenTerms(node.right, sign, terms);
    } else if (node.type === "sub") {
        flattenTerms(node.left, sign, terms);
        flattenTerms(node.right, -sign, terms);
    } else if (node.type === "neg") {
        flattenTerms(node.arg, -sign, terms);
    } else {
        terms.push({ sign, node });
    }
}

// Structural key of an expression to identify like terms (e.g. 3x
// and 2x, or 3·√x and √x) regardless of their numerical coefficient.
function structuralKey(node) {
    switch (node.type) {
        case "num": return `num:${node.value}`;
        case "const": return `const:${node.name}`;
        case "var": return `var:${node.name}`;
        case "neg": return `neg:${structuralKey(node.arg)}`;
        case "add": return `add:${structuralKey(node.left)}:${structuralKey(node.right)}`;
        case "sub": return `sub:${structuralKey(node.left)}:${structuralKey(node.right)}`;
        case "mul": return `mul:${structuralKey(node.left)}:${structuralKey(node.right)}`;
        case "div": return `div:${structuralKey(node.left)}:${structuralKey(node.right)}`;
        case "pow": return `pow:${structuralKey(node.base)}:${structuralKey(node.exp)}`;
        case "sqrt": return `sqrt:${structuralKey(node.arg)}:${node.index ? structuralKey(node.index) : ""}`;
        case "abs": return `abs:${structuralKey(node.arg)}`;
        case "func": return `func:${node.name}:${structuralKey(node.arg)}:${node.base ? structuralKey(node.base) : ""}`;
        default: return "?";
    }
}

// Splits a term into coefficient and "base" (e.g. 3·x -> coefficient 3, base x).
function extractCoefficient(node) {
    if (node.type === "mul") {
        if (node.left.type === "num") {
            const inner = extractCoefficient(node.right);
            return { coeff: node.left.value * inner.coeff, base: inner.base };
        }
        if (node.right.type === "num") {
            const inner = extractCoefficient(node.left);
            return { coeff: node.right.value * inner.coeff, base: inner.base };
        }
    }
    if (node.type === "div" && node.right.type === "num" && node.right.value !== 0) {
        const inner = extractCoefficient(node.left);
        return { coeff: inner.coeff / node.right.value, base: inner.base };
    }
    return { coeff: 1, base: node };
}

function combineAddSub(node) {
    const terms = [];
    flattenTerms(node, 1, terms);

    let constantSum = 0;
    let hasConstant = false;
    const symbolicTerms = [];

    terms.forEach(t => {
        if (t.node.type === "num") {
            constantSum += t.sign * t.node.value;
            hasConstant = true;
        } else {
            symbolicTerms.push(t);
        }
    });
    constantSum = exaktRunden(constantSum);

    // Combine like terms (e.g. 3x + 2x -> 5x, 2x − x -> x),
    // so that a variable remains isolatable even with multiple coefficients.
    const groups = [];
    const groupIndexByKey = new Map();

    symbolicTerms.forEach(t => {
        const { coeff, base } = extractCoefficient(t.node);
        const key = structuralKey(base);
        const signedCoeff = t.sign * coeff;

        if (groupIndexByKey.has(key)) {
            groups[groupIndexByKey.get(key)].coeff += signedCoeff;
        } else {
            groupIndexByKey.set(key, groups.length);
            groups.push({ base, coeff: signedCoeff });
        }
    });

    const combinedTerms = groups
        .map(g => ({ coeff: exaktRunden(g.coeff), base: g.base }))
        .filter(g => g.coeff !== 0)
        .map(g => {
            if (g.coeff === 1)  return { sign: 1,  node: g.base };
            if (g.coeff === -1) return { sign: -1, node: g.base };
            return g.coeff > 0
                ? { sign: 1,  node: { type: "mul", left: numNode(g.coeff), right: g.base } }
                : { sign: -1, node: { type: "mul", left: numNode(-g.coeff), right: g.base } };
        });

    if (combinedTerms.length === 0) return numNode(constantSum);

    // Prefers a positive symbolic term as the starting element. If there isn't one,
    // but there is a positive constant, lead with the constant (e.g., "5 − λ_2" instead of
    // "−λ_2 + 5"). Only if both are missing, the first term is negated.
    const firstPosIdx = combinedTerms.findIndex(t => t.sign === 1);
    const leadWithConstant = firstPosIdx === -1 && hasConstant && constantSum > 0;

    let result, remainingSymbolic;

    if (firstPosIdx !== -1) {
        result = combinedTerms[firstPosIdx].node;
        remainingSymbolic = combinedTerms.filter((_, i) => i !== firstPosIdx);
    } else if (leadWithConstant) {
        result = numNode(constantSum);
        remainingSymbolic = combinedTerms;
    } else {
        result = { type: "neg", arg: combinedTerms[0].node };
        remainingSymbolic = combinedTerms.slice(1);
    }

    remainingSymbolic.forEach(t => {
        result = t.sign === 1
            ? { type: "add", left: result, right: t.node }
            : { type: "sub", left: result, right: t.node };
    });

    if (hasConstant && constantSum !== 0 && !leadWithConstant) {
        result = constantSum > 0
            ? { type: "add", left: result, right: numNode(constantSum) }
            : { type: "sub", left: result, right: numNode(-constantSum) };
    }

    return result;
}

function simplify(node) {
    switch (node.type) {
        case "num": case "var": case "const":
            return node;

        case "neg": {
            const arg = simplify(node.arg);
            if (arg.type === "neg") return arg.arg;
            if (arg.type === "sub") return simplify({ type: "sub", left: arg.right, right: arg.left });
            if (arg.type === "num") return numNode(-arg.value);
            return { type: "neg", arg };
        }

        case "add":
        case "sub": {
            const left = simplify(node.left), right = simplify(node.right);
            return combineAddSub({ type: node.type, left, right });
        }

        case "mul": {
            const left = simplify(node.left), right = simplify(node.right);

            // Distributive law: a·(b±c) -> a·b ± a·c (and mirrored (b±c)·a)
            if (left.type === "add" || left.type === "sub") {
                return simplify({ type: left.type, left: { type: "mul", left: left.left, right }, right: { type: "mul", left: left.right, right } });
            }
            if (right.type === "add" || right.type === "sub") {
                return simplify({ type: right.type, left: { type: "mul", left, right: right.left }, right: { type: "mul", left, right: right.right } });
            }

            if (left.type === "num" && right.type === "num") return numNode(left.value * right.value);
            if (left.type === "num" && left.value === 0) return numNode(0);
            if (right.type === "num" && right.value === 0) return numNode(0);
            if (left.type === "num" && left.value === 1) return right;
            if (right.type === "num" && right.value === 1) return left;

            // Coefficient folding in nested multiplication: a·(b·c) -> (a·b)·c,
            // if a and b are numbers – otherwise e.g. 2·(3·x) and 6·x remain structurally
            // distinct, preventing combineAddSub from combining like terms.
            if (left.type === "num" && right.type === "mul") {
                if (right.left.type === "num")  return simplify({ type: "mul", left: numNode(left.value * right.left.value),  right: right.right });
                if (right.right.type === "num") return simplify({ type: "mul", left: numNode(left.value * right.right.value), right: right.left });
            }
            if (right.type === "num" && left.type === "mul") {
                if (left.left.type === "num")  return simplify({ type: "mul", left: numNode(right.value * left.left.value),  right: left.right });
                if (left.right.type === "num") return simplify({ type: "mul", left: numNode(right.value * left.right.value), right: left.left });
            }

            return { type: "mul", left, right };
        }

        case "div": {
            const left = simplify(node.left), right = simplify(node.right);

            // Distribution for division by a number: (a±b)/c -> a/c ± b/c
            if ((left.type === "add" || left.type === "sub") && right.type === "num" && right.value !== 0) {
                return simplify({ type: left.type, left: { type: "div", left: left.left, right }, right: { type: "div", left: left.right, right } });
            }

            if (left.type === "num" && right.type === "num" && right.value !== 0) return numNode(left.value / right.value);
            if (left.type === "num" && left.value === 0 && right.type !== "num") return numNode(0);
            if (right.type === "num" && right.value === 1) return left;
            return { type: "div", left, right };
        }

        case "pow": {
            const base = simplify(node.base), exp = simplify(node.exp);
            if (base.type === "num" && exp.type === "num") return numNode(Math.pow(base.value, exp.value));
            if (exp.type === "num" && exp.value === 1) return base;
            if (exp.type === "num" && exp.value === 0 && !(base.type === "num" && base.value === 0)) return numNode(1);
            return { type: "pow", base, exp };
        }

        case "sqrt": {
            const arg = simplify(node.arg);
            const index = node.index ? simplify(node.index) : null;
            const numeric = tryEvalNumeric({ type: "sqrt", arg, index });
            return numeric !== null ? numNode(numeric) : { type: "sqrt", arg, index };
        }

        case "abs": {
            const arg = simplify(node.arg);
            const numeric = tryEvalNumeric({ type: "abs", arg });
            return numeric !== null ? numNode(numeric) : { type: "abs", arg };
        }

        case "func": {
            const arg = simplify(node.arg);
            const base = node.base ? simplify(node.base) : null;
            const numeric = tryEvalNumeric({ type: "func", name: node.name, arg, base });
            return numeric !== null ? numNode(numeric) : { type: "func", name: node.name, arg, base };
        }

        default:
            return node;
    }
}


function tryEvalNumeric(node) {
    switch (node.type) {
        case "num": return node.value;
        case "const": return node.name === "pi" ? Math.PI : Math.E;
        case "var": return null;
        case "neg": { const a = tryEvalNumeric(node.arg); return a === null ? null : -a; }
        case "add": { const a = tryEvalNumeric(node.left), b = tryEvalNumeric(node.right); return (a === null || b === null) ? null : a + b; }
        case "sub": { const a = tryEvalNumeric(node.left), b = tryEvalNumeric(node.right); return (a === null || b === null) ? null : a - b; }
        case "mul": { const a = tryEvalNumeric(node.left), b = tryEvalNumeric(node.right); return (a === null || b === null) ? null : a * b; }
        case "div": { const a = tryEvalNumeric(node.left), b = tryEvalNumeric(node.right); return (a === null || b === null || b === 0) ? null : a / b; }
        case "pow": {
            const a = tryEvalNumeric(node.base), b = tryEvalNumeric(node.exp);
            if (a === null || b === null) return null;
            if (a < 0 && !Number.isInteger(b)) return null; // e.g. (-4)^0.5 is not real
            return Math.pow(a, b);
        }
        case "sqrt": {
            const a = tryEvalNumeric(node.arg);
            const n = node.index ? tryEvalNumeric(node.index) : 2;
            if (a === null || n === null || (a < 0 && n % 2 === 0)) return null;
            return a < 0 ? -Math.pow(-a, 1 / n) : Math.pow(a, 1 / n);
        }
        case "abs": { const a = tryEvalNumeric(node.arg); return a === null ? null : Math.abs(a); }
        case "func": {
            const a = tryEvalNumeric(node.arg);
            if (a === null) return null;
            switch (node.name) {
                case "sin": return Math.sin(a);
                case "cos": return Math.cos(a);
                case "tan": return Math.tan(a);
                case "asin": return (a < -1 || a > 1) ? null : Math.asin(a);
                case "acos": return (a < -1 || a > 1) ? null : Math.acos(a);
                case "atan": return Math.atan(a);
                case "ln": return a > 0 ? Math.log(a) : null;
                case "exp": return Math.exp(a);
                case "log": {
                    const base = node.base ? tryEvalNumeric(node.base) : 10;
                    return (base === null || base <= 0 || base === 1 || a <= 0) ? null : Math.log(a) / Math.log(base);
                }
                default: return null;
            }
        }
        default: return null;
    }
}


// RENDERER

const FUNC_LABELS = {
    sin: "sin", cos: "cos", tan: "tan",
    asin: "sin⁻¹", acos: "cos⁻¹", atan: "tan⁻¹",
    ln: "ln", log: "log", exp: "exp"
};

const FUNC_INVERSE = {
    sin: "asin", cos: "acos", tan: "atan",
    asin: "sin", acos: "cos", atan: "tan",
    ln: "exp", exp: "ln"
};

function formatVarName(name) {
    const idx = name.indexOf("_");
    if (idx === -1) return name;
    return `${name.slice(0, idx)}<sub>${name.slice(idx + 1)}</sub>`;
}

function formatNumber(node) {
    return node.raw !== undefined && node.raw !== null ? node.raw : String(node.value);
}

function renderExpr(node) {
    switch (node.type) {
        case "num": return formatNumber(node);
        case "const": return node.name === "pi" ? "π" : "e";
        case "var": return formatVarName(node.name);

        case "neg": {
            const a = node.arg;
            const inner = (a.type === "add" || a.type === "sub") ? `(${renderExpr(a)})` : renderExpr(a);
            return `−${inner}`;
        }

        case "add":
            return `${renderExpr(node.left)} + ${renderExpr(node.right)}`;

        case "sub": {
            const r = (node.right.type === "add" || node.right.type === "sub")
                ? `(${renderExpr(node.right)})` : renderExpr(node.right);
            return `${renderExpr(node.left)} − ${r}`;
        }

        case "mul": {
            const wrap = (n) => (n.type === "add" || n.type === "sub" || n.type === "neg") ? `(${renderExpr(n)})` : renderExpr(n);
            return `${wrap(node.left)} · ${wrap(node.right)}`;
        }

        case "div":
            return `<span class="fu-frac"><span class="fu-frac-num">${renderExpr(node.left)}</span><span class="fu-frac-bar"></span><span class="fu-frac-den">${renderExpr(node.right)}</span></span>`;

        case "pow": {
            const b = node.base;
            const wrapBase = (
                b.type === "add" || b.type === "sub" || b.type === "mul" ||
                b.type === "div" || b.type === "neg" || b.type === "pow" ||
                (b.type === "num" && b.value < 0)
            );
            const baseHtml = wrapBase ? `(${renderExpr(b)})` : renderExpr(b);
            return `${baseHtml}<sup class="fu-exp">${renderExpr(node.exp)}</sup>`;
        }

        case "sqrt": {
            const idx = node.index ? `<sup class="fu-sqrt-index">${renderExpr(node.index)}</sup>` : "";
            return `<span class="fu-sqrt">${idx}<span class="fu-sqrt-symbol">√</span><span class="fu-sqrt-radicand">${renderExpr(node.arg)}</span></span>`;
        }

        case "abs":
            return `<span class="fu-abs">${renderExpr(node.arg)}</span>`;

        case "func": {
            const label = FUNC_LABELS[node.name] || node.name;
            const baseHtml = node.base ? `<sub>${renderExpr(node.base)}</sub>` : "";
            return `${label}${baseHtml}(${renderExpr(node.arg)})`;
        }

        default:
            return "?";
    }
}

// Compact representation of operands for the "| Operation" shorthand
// (adds parentheses so that e.g. ": 2 · π" does not look ambiguous)
function opnd(node) {
    if (node.type === "add" || node.type === "sub" || node.type === "mul" || node.type === "div" || node.type === "neg") {
        return `(${renderExpr(node)})`;
    }
    return renderExpr(node);
}


// ==========================================================================
// SOLVER (Gleichungslöser)
// ==========================================================================

function peelOnce(node, other, varName) {
    switch (node.type) {
        case "add": {
            const inLeft = containsVar(node.left, varName);
            const keep = inLeft ? node.left : node.right;
            const move = inLeft ? node.right : node.left;
            return {
                opLabel: `− ${opnd(move)}`,
                newSubject: keep,
                newOther: { type: "sub", left: other, right: move }
            };
        }

        case "sub": {
            if (containsVar(node.left, varName)) {
                const B = node.right;
                return {
                    opLabel: `+ ${opnd(B)}`,
                    newSubject: node.left,
                    newOther: { type: "add", left: other, right: B }
                };
            }
            const A = node.left;
            return {
                opLabel: `− ${opnd(A)}`,
                newSubject: { type: "neg", arg: node.right },
                newOther: { type: "sub", left: other, right: A }
            };
        }

        case "neg": {
            return {
                opLabel: `· (−1)`,
                newSubject: node.arg,
                newOther: { type: "neg", arg: other }
            };
        }

        case "mul": {
            const inLeft = containsVar(node.left, varName);
            const keep = inLeft ? node.left : node.right;
            const divisor = inLeft ? node.right : node.left;

            const divisorVal = tryEvalNumeric(divisor);
            if (divisorVal === 0) {
                return { domainError: "Division by 0 is not possible." };
            }

            return {
                opLabel: `: ${opnd(divisor)}`,
                newSubject: keep,
                newOther: { type: "div", left: other, right: divisor },
                note: divisorVal === null ? `Assuming ${renderExpr(divisor)} ≠ 0.` : undefined
            };
        }

        case "div": {
            const A = node.left, B = node.right;

            const bVal = tryEvalNumeric(B);
            if (bVal === 0) {
                return { domainError: "Division by 0 is not possible." };
            }

            return {
                opLabel: `· ${opnd(B)}`,
                newSubject: A,
                newOther: { type: "mul", left: other, right: B }
            };
        }

        case "pow": {
            const inBase = containsVar(node.base, varName);
            const inExp = containsVar(node.exp, varName);
            if (inBase && !inExp) {
                const isSquare = isConstNum(node.exp, 2);
                const expVal = node.exp.type === "num" ? node.exp.value : null;
                const isEven = expVal !== null && Number.isInteger(expVal) && expVal % 2 === 0;

                const otherVal = tryEvalNumeric(other);
                if (isEven && otherVal !== null && otherVal < 0) {
                    return { domainError: "This equation has no real solution – an even power cannot be negative." };
                }

                if (isEven && otherVal !== null) {
                    return {
                        ambiguous: `The target variable is raised to an even power here (${isSquare ? "square" : `exponent ${opnd(node.exp)}`}). This usually leads to two possible solutions (positive and negative branches) – branch handling is currently not supported.`
                    };
                }

                return {
                    opLabel: isSquare ? `√` : `${opnd(node.exp)}√`,
                    newSubject: node.base,
                    newOther: { type: "sqrt", arg: other, index: isSquare ? null : node.exp }
                };
            }
            if (inExp && !inBase) {
                const baseIsTen = isConstNum(node.base, 10);

                const baseVal = tryEvalNumeric(node.base);
                if (baseVal !== null && (baseVal <= 0 || baseVal === 1)) {
                    return { domainError: "This equation does not have a valid logarithm base (must be positive and ≠ 1)." };
                }
                
                // FIX: Fälschliche otherVal <= 0 Prüfung für den Logarithmus entfernt

                return {
                    opLabel: baseIsTen ? `log( )` : `log_${opnd(node.base)}( )`,
                    newSubject: node.exp,
                    newOther: { type: "func", name: "log", base: node.base, arg: other }
                };
            }
            return null; 
        }

        case "sqrt": {
            if (!containsVar(node.arg, varName)) return null; 
            const isSquare = !node.index;
            const n = node.index || { type: "num", value: 2, raw: "2" };

            const nVal = n.type === "num" ? n.value : null;
            const isEvenRoot = nVal !== null && Number.isInteger(nVal) && nVal % 2 === 0;
            const otherVal = tryEvalNumeric(other);
            if (isEvenRoot && otherVal !== null && otherVal < 0) {
                return { domainError: "This equation has no real solution – a root cannot be negative." };
            }

            return {
                opLabel: isSquare ? `( )²` : `( )^${opnd(n)}`,
                newSubject: node.arg,
                newOther: { type: "pow", base: other, exp: n }
            };
        }

        case "abs": {
            const otherVal = tryEvalNumeric(other);
            if (otherVal !== null && otherVal < 0) {
                return { domainError: "This equation has no real solution – an absolute value cannot be negative." };
            }
            return {
                ambiguous: "This equation contains an absolute value of the target variable. Absolute values usually lead to two possible solutions (e.g., x = 5 or x = −5) – branch handling is currently not supported."
            };
        }

        case "func": {
            if (node.name === "log") {
                const base = node.base || { type: "num", value: 10, raw: "10" };

                const baseVal = tryEvalNumeric(base);
                if (baseVal !== null && (baseVal <= 0 || baseVal === 1)) {
                    return { domainError: "This equation does not have a valid logarithm base (must be positive and ≠ 1)." };
                }
                
                // FIX: Fälschliche otherVal <= 0 Prüfung ebenfalls entfernt

                return {
                    opLabel: `${opnd(base)}^( )`,
                    newSubject: node.arg,
                    newOther: { type: "pow", base, exp: other }
                };
            }
            const invName = FUNC_INVERSE[node.name];
            if (!invName) return null;

            const otherVal = tryEvalNumeric(other);
            if (node.name === "exp" && otherVal !== null && otherVal <= 0) {
                return { domainError: "This equation has no real solution – the natural logarithm is only defined for positive numbers." };
            }
            if ((node.name === "sin" || node.name === "cos") && otherVal !== null && (otherVal < -1 || otherVal > 1)) {
                return { domainError: "This equation has no real solution – sine and cosine values are always between −1 and 1." };
            }

            if (node.name === "sin" || node.name === "cos" || node.name === "tan") {
                return {
                    ambiguous: `The target variable is in the argument of ${FUNC_LABELS[node.name]}(...). Trigonometric functions are periodic and have infinitely many solutions – currently only principal values are supported, and complete solution sets are not calculated yet.`
                };
            }

            return {
                opLabel: `${FUNC_LABELS[invName]}( )`,
                newSubject: node.arg,
                newOther: { type: "func", name: invName, arg: other, base: null }
            };
        }

        default:
            return null;
    }
}



function isolate(eq, varName) {
    const steps = [];
    let curLeft = eq.left;
    let curRight = eq.right;

    if (!containsVar(curLeft, varName) && !containsVar(curRight, varName)) return null;

    // Variable on BOTH sides (e.g., "5x + 2 = 3x + 10"): first move all
    // variable terms from the right side to the left and
    // combine them ("combine like terms" as taught in school).
    if (containsVar(curLeft, varName) && containsVar(curRight, varName)) {
        const rightTerms = [];
        flattenTerms(curRight, 1, rightTerms);
        const rightVarTerm = rightTerms.find(t => containsVar(t.node, varName));

        const beforeLeft = curLeft, beforeRight = curRight;
        const opLabel = rightVarTerm.sign === 1 ? `− ${opnd(rightVarTerm.node)}` : `+ ${opnd(rightVarTerm.node)}`;
        const buildOp = rightVarTerm.sign === 1 ? "sub" : "add";

        const newLeft = simplify({ type: buildOp, left: curLeft, right: rightVarTerm.node });
        const newRight = simplify({ type: buildOp, left: curRight, right: rightVarTerm.node });

        if (countVarOccurrences(newLeft, varName) + countVarOccurrences(newRight, varName) !== 1) {
            return null;
        }

        steps.push({ beforeLeft, beforeRight, opLabel });
        curLeft = newLeft;
        curRight = newRight;
    }

    let guard = 0;
    while (!((curLeft.type === "var" && curLeft.name === varName) ||
             (curRight.type === "var" && curRight.name === varName))) {
        if (++guard > 60) return null; // Safety net against infinite loops

        const varOnLeft = containsVar(curLeft, varName);
        const targetNode = varOnLeft ? curLeft : curRight;
        const otherNode = varOnLeft ? curRight : curLeft;

        // Safety net: peelOnce assumes that the variable is located ONLY
        // in targetNode. Multiple occurrences within a single side
        // (e.g., "x + sin(x)"), which combineAddSub could not combine,
        // would otherwise lead to incorrect results.
        if (countVarOccurrences(targetNode, varName) !== 1) return null;

        const result = peelOnce(targetNode, otherNode, varName);
        if (!result) return null;
        if (result.domainError) return { error: result.domainError };
        if (result.ambiguous) return { error: result.ambiguous };

        steps.push({ beforeLeft: curLeft, beforeRight: curRight, opLabel: result.opLabel, note: result.note });

        const newSubject = simplify(result.newSubject);
        const newOther = simplify(result.newOther);

        if (varOnLeft) { curLeft = newSubject; curRight = newOther; }
        else { curRight = newSubject; curLeft = newOther; }
    }

    const varIsLeft = curLeft.type === "var" && curLeft.name === varName;
    const headlineResult = varIsLeft ? curRight : curLeft;

    return { steps, finalLeft: curLeft, finalRight: curRight, headlineResult };
}

function canSolveFor(eq, varName) {
    if (countVarOccurrences(eq.left, varName) + countVarOccurrences(eq.right, varName) === 0) return false;
    return isolate(eq, varName) !== null;
}

function hasVarInSqrtIndex(node, varName) {
    if (!node) return false;
    if (node.type === "sqrt" && node.index && containsVar(node.index, varName)) return true;
    return getChildren(node).some(child => hasVarInSqrtIndex(child, varName));
}

function findSpecificSolveIssue(eq, varName) {
    const totalOccurrences = countVarOccurrences(eq.left, varName) + countVarOccurrences(eq.right, varName);

    if (totalOccurrences > 1) {
        return `The variable ${formatVarName(varName)} appears multiple times in the equation (e.g., possibly appearing in both base and exponent). Currently, only equations where the target variable appears exactly once can be solved.`;
    }
    if (totalOccurrences === 0) return null;

    if (hasVarInSqrtIndex(eq.left, varName) || hasVarInSqrtIndex(eq.right, varName)) {
        return `The variable ${formatVarName(varName)} is inside a root index. Solving for a variable in this position is currently not supported.`;
    }

    return `This type of equation is currently not supported for ${formatVarName(varName)}.`;
}


// UI INTEGRATION MODE 1 (General Equations)


document.addEventListener("DOMContentLoaded", () => {
    const selectVariable = document.getElementById("selectVariableAllgemein");
    const btn            = document.getElementById("buttonZahlenInput");
    const loesungOutput  = document.getElementById("loesungOutput");
    const tipp           = document.getElementById("tipp");
    const rechenwegDiv    = document.querySelector(".rechenwegDiv");

    if (!selectVariable || !btn) return;

    let currentEquationAllgemein = null;

    function resetOutputAllgemein() {
        loesungOutput.innerHTML = "";
        rechenwegOutput.innerHTML = "";
        rechenwegDiv.style.display = "none";
        tipp.textContent = "";
    }

    function disableSelectionAllgemein() {
        selectVariable.innerHTML = '<option value=""> ...</option>';
        selectVariable.disabled = true;
        btn.disabled = true;
    }

    function showErrorAllgemein(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        resetOutputAllgemein();
        disableSelectionAllgemein();
    }

    function hideErrorAllgemein() {
        errorMessages.style.display = "none";
    }

    function showSolveErrorAllgemein(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        loesungOutput.innerHTML = "";
        rechenwegOutput.innerHTML = "";
        rechenwegDiv.style.display = "none";
        tipp.textContent = "";
    }

    function analyzeFormulaAllgemein(latex) {
        resetOutputAllgemein();

        if (!latex || !latex.trim()) {
            hideErrorAllgemein();
            disableSelectionAllgemein();
            currentEquationAllgemein = null;
            return;
        }

        try {
            checkBlacklist(latex);
            const tokens = tokenize(latex);
            const eq = parseEquation(tokens);
            eq.left = simplify(eq.left);
            eq.right = simplify(eq.right);

            const varNames = collectVariableNames(eq);
            const solvable = varNames.filter(name => canSolveFor(eq, name));

            if (solvable.length === 0) {
                currentEquationAllgemein = null;
                disableSelectionAllgemein();
                hideErrorAllgemein();
                tipp.textContent = (varNames.length === 1 && findSpecificSolveIssue(eq, varNames[0]))
                    || "This equation does not contain a variable that can be uniquely isolated — e.g., because a variable appears multiple times, is in a root index, or appears simultaneously in both base and exponent.";
                return;
            }

            currentEquationAllgemein = eq;
            selectVariable.innerHTML = solvable
                .map(name => `<option value="${name}">${name.replace("_", " ")}</option>`)
                .join("");
            selectVariable.disabled = false;
            btn.disabled = false;
            hideErrorAllgemein();

        } catch (err) {
            currentEquationAllgemein = null;
            const msg = err instanceof FormulaError ? err.message : "Your formula could not be processed. Please check your input.";
            showErrorAllgemein(msg);
        }
    }

    function renderSolutionAllgemein() {
        if (!currentEquationAllgemein) return;
        const varName = selectVariable.value;
        if (!varName) return;

        const result = isolate(currentEquationAllgemein, varName);
        if (!result) {
            showSolveErrorAllgemein("This variable cannot be isolated with the currently supported algebraic transformations.");
            return;
        }
        if (result.error) {
            showSolveErrorAllgemein(result.error);
            return;
        }

        hideErrorAllgemein();

        loesungOutput.innerHTML = `${formatVarName(varName)} = ${renderExpr(result.headlineResult)}`;

        const rows = result.steps.map(st => {
            const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
            return `
                <div class="umformZeile">
                    <span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span>
                    <span class="umformOperation">| ${st.opLabel}</span>
                </div>${noteHtml}`;
        }).join("");

        const finalRow = `
            <div class="umformZeile umformFinal">
                <span class="umformGleichung">${renderExpr(result.finalLeft)} = ${renderExpr(result.finalRight)}</span>
            </div>`;

        rechenwegOutput.innerHTML = `<div class="umformBox">${rows}${finalRow}</div>`;
        rechenwegDiv.style.display = "flex";
    }

    // ── Bind MathLive Field ───────────────────────────────────────────
    Promise.race([
        customElements.whenDefined("math-field"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("MathLive timeout")), 3000))
    ]).then(() => {
        const mf = document.getElementById("mathInputAllgemein");
        if (!mf) return;

        try {
            if (window.mathVirtualKeyboard) {
                window.mathVirtualKeyboard.layouts = ["numeric", "alphabetic", "greek"];
            }
        } catch (e) { /* Version-dependent, non-blocking */ }

        let debounceTimer = null;
        mf.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => analyzeFormulaAllgemein(mf.value), 400);
        });

        mf.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (currentType === "allgemein") btn.click();
            }
        });

        // Mode switch: the button is shared between both modes.
        // Tool wird erst scharfgeschaltet, wenn MathLive erfolgreich geladen ist.
        btn.addEventListener("click", () => {
            if (currentType === "allgemein") renderSolutionAllgemein();
        });

        disableSelectionAllgemein();

    }).catch(() => {
        // Fallback: MathLive konnte nach 3 Sekunden nicht geladen werden
        const mfAllgemein = document.getElementById("mathInputAllgemein");
        const lgsInputs = document.querySelectorAll(".lgsGleichungInput");
        
        // Dynamisch eine Fehlermeldung generieren (falls nicht im HTML vordefiniert)
        let errorMessages = document.getElementById("errorMessages");
        if (!errorMessages && mfAllgemein && mfAllgemein.parentElement) {
            errorMessages = document.createElement("div");
            errorMessages.style.color = "var(--error-color, #d32f2f)";
            errorMessages.style.marginTop = "10px";
            errorMessages.style.fontSize = "0.9em";
            mfAllgemein.parentElement.appendChild(errorMessages);
        }

        if (errorMessages) {
            errorMessages.textContent = "Error: Math components could not be loaded. Please check your internet connection or disable your ad blocker.";
            errorMessages.style.display = "block";
        }

        // Deaktiviere das allgemeine Eingabefeld
        if (mfAllgemein) {
            mfAllgemein.style.opacity = "0.5";
            mfAllgemein.style.pointerEvents = "none";
        }

        // Deaktiviere alle potenziellen linearen Gleichungsfelder
        lgsInputs.forEach(input => {
            input.style.opacity = "0.5";
            input.style.pointerEvents = "none";
        });
        
        // Deaktiviere den Lösungs-Button
        if (typeof btn !== 'undefined' && btn) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
        }
    });
});


// MODE 2 SKELETON (Systems of Linear Equations)


const selectVariableLinear = document.getElementById("selectVariableLinear");
const btnLoesen            = document.getElementById("buttonZahlenInput");
const loesungOutput        = document.getElementById("loesungOutput");
const tipp                 = document.getElementById("tipp");
const rechenwegDiv          = document.querySelector(".rechenwegDiv");

let currentLgsEquations = null; // Array of { left, right } (already simplified)
let currentLgsVarNames  = null;

function resetOutputLinear() {
    loesungOutput.innerHTML = "";
    rechenwegOutput.innerHTML = "";
    rechenwegDiv.style.display = "none";
    tipp.textContent = "";
}

function disableLinearSolution() {
    selectVariableLinear.innerHTML = '<option value="all">All</option><option value="">...</option>';
    selectVariableLinear.disabled = true;
    if (currentType === "linear") btnLoesen.disabled = true;
}

// ── Linearity Check ────────────────────────────────────────────────────────
// Checks whether a sub-expression contains ANY variable (regardless of name).
function hasAnyVariable(node) {
    if (node.type === "var") return true;
    return getChildren(node).some(hasAnyVariable);
}

// Finds the first non-linear building block (product of two variables,
// variable in the exponent/under the root/inside a function/in the denominator).
// Pure additions/subtractions as well as Constant · Variable remain linear.
function findNonlinearReason(node) {
    if (!node) return null;
    switch (node.type) {
        case "mul": {
            if (hasAnyVariable(node.left) && hasAnyVariable(node.right)) return "mul";
            return findNonlinearReason(node.left) || findNonlinearReason(node.right);
        }
        case "div":
            if (hasAnyVariable(node.right)) return "div";
            return findNonlinearReason(node.left) || findNonlinearReason(node.right);
        case "pow":
            if (hasAnyVariable(node.base) && !isConstNum(node.exp, 1)) return "pow";
            if (hasAnyVariable(node.exp)) return "pow";
            return findNonlinearReason(node.base) || findNonlinearReason(node.exp);
        case "sqrt":
            if (hasAnyVariable(node.arg)) return "sqrt";
            return findNonlinearReason(node.arg) || (node.index ? findNonlinearReason(node.index) : null);
        case "func":
            if (hasAnyVariable(node.arg)) return "func";
            return findNonlinearReason(node.arg) || (node.base ? findNonlinearReason(node.base) : null);
        case "abs":
            if (hasAnyVariable(node.arg)) return "abs";
            return findNonlinearReason(node.arg);
        default:
            for (const c of getChildren(node)) {
                const r = findNonlinearReason(c);
                if (r) return r;
            }
            return null;
    }
}

// ── Parse a Single Line ────────────────────────────────────────────────────
function parseLgsLine(latex, rowNumber) {
    if (!latex || !latex.trim()) {
        return { errorMsg: `Equation ${rowNumber}: Please enter a complete equation.` };
    }
    try {
        checkBlacklist(latex);
        const tokens = tokenize(latex);
        const eq = parseEquation(tokens);
        eq.left = simplify(eq.left);
        eq.right = simplify(eq.right);

        if (findNonlinearReason(eq.left) || findNonlinearReason(eq.right)) {
            return { errorMsg: `Equation ${rowNumber}: This type of equation is currently not supported — in "Systems of Linear Equations" mode, only linear terms are allowed (no multiplication of two variables, powers, roots, or functions of a variable).` };
        }

        return { eq };
    } catch (err) {
        const msg = err instanceof FormulaError ? err.message : "This equation could not be processed. Please check your input.";
        return { errorMsg: `Equation ${rowNumber}: ${msg}` };
    }
}

function getLgsFields() {
    return Array.from(document.querySelectorAll(".lgsGleichungInput"));
}

// ── Validate Entire System ─────────────────────────────────────────────────
function validateLinearSystem() {
    resetOutputLinear();
    hideError();

    const fields = getLgsFields();
    const allFilled = fields.every(f => f.value && f.value.trim() !== "");
    const equations = [];

    for (let i = 0; i < fields.length; i++) {
        const result = parseLgsLine(fields[i].value, i + 1);
        if (result.errorMsg) {
            currentLgsEquations = null;
            currentLgsVarNames = null;
            disableLinearSolution();
            // Only show the error if ALL fields are actually filled —
            // otherwise, an error message flashes with every intermediate input.
            if (allFilled) showError(result.errorMsg);
            return;
        }
        equations.push(result.eq);
    }

    const varSet = new Set();
    equations.forEach(eq => collectVariableNames(eq).forEach(name => varSet.add(name)));
    const varNames = Array.from(varSet);

    if (varNames.length === 0) {
        currentLgsEquations = null;
        currentLgsVarNames = null;
        disableLinearSolution();
        return;
    }

    if (equations.length < varNames.length) {
        currentLgsEquations = null;
        currentLgsVarNames = null;
        disableLinearSolution();
        showError("The number of equations is insufficient to determine all variables.");
        return;
    }

    currentLgsEquations = equations;
    currentLgsVarNames  = varNames;

    selectVariableLinear.innerHTML = `<option value="all">All</option>` +
        varNames.map(name => `<option value="${name}">${name.replace("_", " ")}</option>`).join("");
    selectVariableLinear.disabled = false;
    if (currentType === "linear") btnLoesen.disabled = false;
    hideError();
}

// ── Input Events (Delegation, since rows are added dynamically) ───────────
let lgsDebounce = null;
container.addEventListener("input", (e) => {
    if (!e.target.classList || !e.target.classList.contains("lgsGleichungInput")) return;
    clearTimeout(lgsDebounce);
    lgsDebounce = setTimeout(validateLinearSystem, 400);
});

disableLinearSolution();



// SUBSTITUTION METHOD – builds upon isolate()/simplify() from the AST framework


// AST Substitution: replaces every occurrence of varName with replacement.
// Mirrors exactly the node types from getChildren()/simplify().
function substituteVar(node, varName, replacement) {
    switch (node.type) {
        case "num": case "const":
            return node;
        case "var":
            return node.name === varName ? replacement : node;
        case "add": case "sub": case "mul": case "div":
            return {
                type: node.type,
                left: substituteVar(node.left, varName, replacement),
                right: substituteVar(node.right, varName, replacement)
            };
        case "neg":
            return { type: "neg", arg: substituteVar(node.arg, varName, replacement) };
        case "pow":
            return {
                type: "pow",
                base: substituteVar(node.base, varName, replacement),
                exp: substituteVar(node.exp, varName, replacement)
            };
        case "sqrt":
            return {
                type: "sqrt",
                arg: substituteVar(node.arg, varName, replacement),
                index: node.index ? substituteVar(node.index, varName, replacement) : null
            };
        case "abs":
            return { type: "abs", arg: substituteVar(node.arg, varName, replacement) };
        case "func":
            return {
                type: "func", name: node.name,
                arg: substituteVar(node.arg, varName, replacement),
                base: node.base ? substituteVar(node.base, varName, replacement) : null
            };
        default:
            return node;
    }
}

// Detects whether a "leftover" equation is already variable-free
// (e.g., "0 = 0" or "0 = 5") and distinguishes between the two edge cases taught in school.
function findDegenerateMessage(eqs) {
    for (const eq of eqs) {
        if (collectVariableNames(eq).length === 0) {
            const l = tryEvalNumeric(eq.left);
            const r = tryEvalNumeric(eq.right);
            if (l !== null && r !== null) {
                return Math.abs(l - r) < 1e-9
                    ? "This system of equations has infinitely many solutions."
                    : "This system of equations has no solution.";
            }
        }
    }
    return null;
}

function solveLinearSystemSubstitution(equations, varNames, targetVar) {
    let eqs = equations.map(eq => ({ left: eq.left, right: eq.right }));
    let remainingVars = varNames.slice();
    const steps = [];
    const solvedValues = {};
    const eliminationOrder = [];
    // Eliminate the target variable last if possible, so that at the end it follows
    // directly (without back-substitution) from the last equation.
    const avoidVar = (targetVar && targetVar !== "all") ? targetVar : null;

    while (remainingVars.length > 0) {
        let chosen = null;
        const orderedVars = avoidVar && remainingVars.length > 1
            ? [...remainingVars.filter(v => v !== avoidVar), avoidVar]
            : remainingVars;

        for (let i = 0; i < eqs.length && !chosen; i++) {
            for (const vName of orderedVars) {
                if (canSolveFor(eqs[i], vName)) {
                    chosen = { eqIndex: i, varName: vName };
                    break;
                }
            }
        }

        if (!chosen) {
            return { error: findDegenerateMessage(eqs) || "This system of equations cannot currently be solved using the substitution method.", steps };
        }

        const { eqIndex, varName } = chosen;
        const isolated = isolate(eqs[eqIndex], varName);

        if (!isolated) {
            return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps };
        }
        if (isolated.error) {
            return { error: isolated.error, steps };
        }

        const expr = simplify(isolated.headlineResult);
        steps.push({ type: "isolate", varName, isolateSteps: isolated.steps, resultExpr: expr });

        eqs.splice(eqIndex, 1);
        remainingVars = remainingVars.filter(v => v !== varName);

        const applied = [];
        eqs = eqs.map(otherEq => {
            const leftHas  = containsVar(otherEq.left, varName);
            const rightHas = containsVar(otherEq.right, varName);
            if (!leftHas && !rightHas) return otherEq;

            const newLeft  = leftHas  ? simplify(substituteVar(otherEq.left,  varName, expr)) : otherEq.left;
            const newRight = rightHas ? simplify(substituteVar(otherEq.right, varName, expr)) : otherEq.right;
            applied.push({ after: { left: newLeft, right: newRight } });
            return { left: newLeft, right: newRight };
        });

        if (applied.length > 0) {
            steps.push({ type: "substitute", varName, expr, applied });
        }

        solvedValues[varName] = expr;
        eliminationOrder.push(varName);
    }

    // Back-substitution: the last eliminated variable is already a
    // pure number; its value is now substituted into previous expressions.
    const finalValues = {};
    for (let i = eliminationOrder.length - 1; i >= 0; i--) {
        const vName = eliminationOrder[i];
        let expr = solvedValues[vName];
        for (const [otherVar, otherVal] of Object.entries(finalValues)) {
            if (containsVar(expr, otherVar)) {
                expr = simplify(substituteVar(expr, otherVar, otherVal));
            }
        }
        finalValues[vName] = expr;
        if (avoidVar && vName === avoidVar) break; // Remaining vars not needed for the target variable
    }

    return { steps, values: finalValues, eliminationOrder };
}

// ── Solution Steps Rendering (Same notation as Mode 1: umformZeile/umformBox) ──
function renderLgsSubstitutionRechenweg(equations, result, targetVar, varNames) {
    let html = `<div class="lgsSchrittTitel">Initial System</div><div class="umformBox">`;
    equations.forEach((eq, i) => {
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span><span class="umformOperation">(${i + 1})</span></div>`;
    });
    html += `</div>`;

    result.steps.forEach(step => {
        if (step.type === "isolate") {
            html += `<div class="lgsSchrittTitel">Solve for ${formatVarName(step.varName)}</div><div class="umformBox">`;
            step.isolateSteps.forEach(st => {
                const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span><span class="umformOperation">| ${st.opLabel}</span></div>${noteHtml}`;
            });
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(step.varName)} = ${renderExpr(step.resultExpr)}</span></div></div>`;
        } else if (step.type === "substitute") {
            html += `<div class="lgsSchrittTitel">Substitute ${formatVarName(step.varName)} = ${renderExpr(step.expr)}</div><div class="umformBox">`;
            step.applied.forEach(a => {
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(a.after.left)} = ${renderExpr(a.after.right)}</span></div>`;
            });
            html += `</div>`;
        }
    });

    if (result.error) {
        html += `<div class="umformBox"><div class="umformZeile"><span class="umformGleichung">${result.error}</span></div></div>`;
        return html;
    }

    html += `<div class="lgsSchrittTitel">Result</div><div class="umformBox">`;
    if (targetVar === "all") {
        varNames.forEach(vName => {
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(vName)} = ${renderExpr(result.values[vName])}</span></div>`;
        });
    } else {
        html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(targetVar)} = ${renderExpr(result.values[targetVar])}</span></div>`;
    }
    html += `</div>`;

    return html;
}

function showSolveErrorLinear(msg) {
    errorMessages.textContent = msg;
    errorMessages.style.display = "block";
    loesungOutput.innerHTML = "";
    rechenwegOutput.innerHTML = "";
    rechenwegDiv.style.display = "none";
    tipp.textContent = "";
}

// AUTOMATIC – Selects the best method based on variable count and equation structure

function chooseAutomaticProcedure(equations, varNames) {
    const n = varNames.length;

    // Check normalizability first: Gaussian elimination and Elimination method require 
    // canonical coefficient form, while Substitution method works without it.
    const canonicals = equations.map(normalizeToCanonical);
    if (canonicals.some(c => c === null)) {
        return { procedure: "substitution", reason: "The substitution method handles the structure of this system best." };
    }

    if (n >= 3) {
        return { procedure: "gaussian", reason: "For three or more variables, Gaussian elimination remains the clearest approach." };
    }

    // Is the exact same variable already isolated in at least two equations (e.g. "y = 2x+3" and "y = -x+9")?
    const isolatedCount = {};
    equations.forEach(eq => {
        if (eq.left.type === "var")  isolatedCount[eq.left.name]  = (isolatedCount[eq.left.name]  || 0) + 1;
        if (eq.right.type === "var") isolatedCount[eq.right.name] = (isolatedCount[eq.right.name] || 0) + 1;
    });
    if (Object.values(isolatedCount).some(c => c >= 2)) {
        return { procedure: "equalization", reason: "A variable is already isolated in multiple equations — the equalization method fits best here." };
    }

    // Elimination method is ideal when a variable cancels out directly without scaling 
    // (coefficients are already identical or exact opposites) — requiring only one addition/subtraction, 
    // without any multiplication.
    if (n === 2) {
        const [c1, c2] = canonicals;
        const freeVar = varNames.find(v => {
            const { kA, kB } = computeEliminationFactors(c1.coeffs[v] || 0, c2.coeffs[v] || 0);
            return Math.abs(kA) === 1 && Math.abs(kB) === 1;
        });
        if (freeVar) {
            return { procedure: "addition", reason: `For ${formatVarName(freeVar)}, the coefficients cancel out directly — the elimination method requires no scaling here.` };
        }
    }

    const hasUnitCoefficient = canonicals.some(c =>
        varNames.some(v => Math.abs(c.coeffs[v] || 0) === 1)
    );

    if (hasUnitCoefficient) {
        return { procedure: "substitution", reason: "At least one variable has a coefficient of 1 — the substitution method reaches the solution fastest." };
    }

    return { procedure: "addition", reason: "Since no variable has a coefficient of 1, the elimination method avoids unnecessary fractions when isolating." };
}

// ── Overdetermined Systems (More Equations Than Variables) ───────────
// Solves the system using the first n equations (via Gaussian elimination, 
// regardless of chosen method) and checks if the remaining equations are satisfied by this solution.
function verifyExtraEquations(coreEquations, extraEquations, varNames) {
    const fullSolve = solveLinearSystemGauss(coreEquations, varNames, "all");
    if (fullSolve.error) {
        return { verified: false };
    }

    const values = fullSolve.values;
    let failingIndex = null;

    for (let i = 0; i < extraEquations.length; i++) {
        let left = extraEquations[i].left;
        let right = extraEquations[i].right;

        varNames.forEach(vName => {
            left = simplify(substituteVar(left, vName, values[vName]));
            right = simplify(substituteVar(right, vName, values[vName]));
        });

        const leftVal = tryEvalNumeric(left);
        const rightVal = tryEvalNumeric(right);

        if (leftVal === null || rightVal === null || Math.abs(leftVal - rightVal) > 1e-6) {
            failingIndex = i;
            break;
        }
    }

    return { verified: true, allConsistent: failingIndex === null, failingIndex, values };
}

function renderExtraEquationsCheck(extraEquations, check, n) {
    let html = `<div class="lgsSchrittTitel">Additional Equation(s) (more equations than variables)</div><div class="umformBox">`;

    extraEquations.forEach((eq, i) => {
        let status = "";
        if (check.verified) status = (check.failingIndex === i) ? " ✗" : " ✓";
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span><span class="umformOperation">(${n + i + 1})${status}</span></div>`;
    });

    if (!check.verified) {
        html += `<div class="umformHinweis">These additional equation(s) could not be automatically verified.</div>`;
    } else if (check.allConsistent) {
        html += `<div class="umformHinweis">All additional equations are satisfied by the solution — the overall system is consistent.</div>`;
    } else {
        html += `<div class="umformHinweis">Equation (${n + check.failingIndex + 1}) is not satisfied by the solution — the overall system is inconsistent.</div>`;
    }

    html += `</div>`;
    return html;
}

// ── Click Handler (Dedicated listener, isolates Phase 2 code) ──
btnLoesen.addEventListener("click", () => {
    if (currentType !== "linear") return;
    if (!currentLgsEquations || !currentLgsVarNames) return;

    const targetVar = selectVariableLinear.value;
    if (!targetVar) return;

    const n = currentLgsVarNames.length;
    const coreEquations = currentLgsEquations.slice(0, n);
    const extraEquations = currentLgsEquations.slice(n);

    let verfahren = procedureSelect.value;
    let autoNote = "";

    if (verfahren === "automatic") {
        const choice = chooseAutomaticProcedure(coreEquations, currentLgsVarNames);
        verfahren = choice.procedure;
        const verfahrenNamen = {
            substitution: "Substitution Method",
            equalization: "Equalization Method",
            addition: "Elimination Method",
            gaussian: "Gaussian Elimination"
        };
        autoNote = `<div class="lgsAutoNote"><strong>Automatically selected: ${verfahrenNamen[verfahren]}.</strong> ${choice.reason}</div>`;
    }

    let result, rechenwegHtml;

    if (verfahren === "substitution") {
        result = solveLinearSystemSubstitution(coreEquations, currentLgsVarNames, targetVar);
        rechenwegHtml = renderLgsSubstitutionRechenweg(coreEquations, result, targetVar, currentLgsVarNames);
    } else if (verfahren === "equalization") {
        result = solveLinearSystemEqualization(coreEquations, currentLgsVarNames, targetVar);
        rechenwegHtml = renderLgsEqualizationRechenweg(coreEquations, result, targetVar, currentLgsVarNames);
    } else if (verfahren === "addition") {
        result = solveLinearSystemAddition(coreEquations, currentLgsVarNames, targetVar);
        rechenwegHtml = renderLgsAdditionRechenweg(coreEquations, result, targetVar, currentLgsVarNames);
    } else if (verfahren === "gaussian") {
        result = solveLinearSystemGauss(coreEquations, currentLgsVarNames, targetVar);
        rechenwegHtml = renderLgsGaussRechenweg(coreEquations, result, targetVar, currentLgsVarNames);
    } else {
        showSolveErrorLinear("This solving procedure is currently unavailable.");
        return;
    }

    if (result.error) {
        errorMessages.textContent = result.error;
        errorMessages.style.display = "block";
        loesungOutput.innerHTML = "";
        rechenwegOutput.innerHTML = autoNote + rechenwegHtml;
        rechenwegDiv.style.display = "flex";
        return;
    }

    // ── Check Overdetermined Systems (More equations than variables) ──
    let extraNote = "";
    if (extraEquations.length > 0) {
        const check = verifyExtraEquations(coreEquations, extraEquations, currentLgsVarNames);

        if (check.verified && !check.allConsistent) {
            errorMessages.textContent = `The system of equations is inconsistent: Equation ${n + check.failingIndex + 1} is not satisfied by the solution of the first ${n} equations.`;
            errorMessages.style.display = "block";
            loesungOutput.innerHTML = "";
            rechenwegOutput.innerHTML = autoNote + rechenwegHtml + renderExtraEquationsCheck(extraEquations, check, n);
            rechenwegDiv.style.display = "flex";
            return;
        }

        extraNote = renderExtraEquationsCheck(extraEquations, check, n);
    }

    hideError();

    if (targetVar === "all") {
        loesungOutput.innerHTML = currentLgsVarNames
            .map(vName => `${formatVarName(vName)} = ${renderExpr(result.values[vName])}`)
            .join(", &nbsp; ");
    } else {
        loesungOutput.innerHTML = `${formatVarName(targetVar)} = ${renderExpr(result.values[targetVar])}`;
    }

    rechenwegOutput.innerHTML = autoNote + rechenwegHtml + extraNote;
    rechenwegDiv.style.display = "flex";
});



// EQUALIZATION METHOD – isolates the same variable in all equations, then sets them equal to each other


function solveLinearSystemEqualization(equations, varNames, targetVar) {
    let eqs = equations.map(eq => ({ left: eq.left, right: eq.right }));
    let remainingVars = varNames.slice();
    const steps = [];
    const isolatedExprByVar = {};
    const eliminationOrder = [];
    const avoidVar = (targetVar && targetVar !== "all") ? targetVar : null;

    while (eqs.length > 1) {
        let chosenVar = null;
        let chosenIndices = null;
        const orderedVars = avoidVar && remainingVars.length > 1
            ? [...remainingVars.filter(v => v !== avoidVar), avoidVar]
            : remainingVars;

        for (const vName of orderedVars) {
            const containingIdx = [];
            let allIsolatable = true;

            eqs.forEach((eq, i) => {
                const hasVar = containsVar(eq.left, vName) || containsVar(eq.right, vName);
                if (hasVar) {
                    containingIdx.push(i);
                    if (!canSolveFor(eq, vName)) allIsolatable = false;
                }
            });

            if (allIsolatable && containingIdx.length >= 2) {
                chosenVar = vName;
                chosenIndices = containingIdx;
                break;
            }
        }

        if (!chosenVar) {
            return { error: findDegenerateMessage(eqs) || "This system of equations cannot currently be solved using the equalization method.", steps };
        }

        const isolatedResults = chosenIndices.map(i => ({ idx: i, result: isolate(eqs[i], chosenVar) }));
        for (const ir of isolatedResults) {
            if (!ir.result) return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps };
            if (ir.result.error) return { error: ir.result.error, steps };
        }

        const exprs = isolatedResults.map(ir => simplify(ir.result.headlineResult));

        steps.push({
            type: "isolateMultiple",
            varName: chosenVar,
            entries: isolatedResults.map((ir, k) => ({ isolateSteps: ir.result.steps, resultExpr: exprs[k] }))
        });

        const newEquations = [];
        for (let k = 1; k < exprs.length; k++) {
            newEquations.push({ left: exprs[0], right: exprs[k] });
        }
        steps.push({ type: "equalize", varName: chosenVar, newEquations });

        isolatedExprByVar[chosenVar] = exprs[0];

        const remainingEqs = eqs.filter((_, i) => !chosenIndices.includes(i));
        eqs = [...remainingEqs, ...newEquations];
        remainingVars = remainingVars.filter(v => v !== chosenVar);
        eliminationOrder.push(chosenVar);
    }

    if (eqs.length !== 1 || remainingVars.length !== 1) {
        return { error: "This system of equations cannot currently be solved using the equalization method.", steps };
    }

    const lastVar = remainingVars[0];
    const finalIsolate = isolate(eqs[0], lastVar);
    if (!finalIsolate) return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps };
    if (finalIsolate.error) return { error: finalIsolate.error, steps };

    const lastValue = simplify(finalIsolate.headlineResult);
    steps.push({ type: "finalSolve", varName: lastVar, isolateSteps: finalIsolate.steps, resultExpr: lastValue });

    const values = { [lastVar]: lastValue };
    for (let i = eliminationOrder.length - 1; i >= 0; i--) {
        if (avoidVar && Object.prototype.hasOwnProperty.call(values, avoidVar)) break;
        const vName = eliminationOrder[i];
        let expr = isolatedExprByVar[vName];
        for (const [otherVar, otherVal] of Object.entries(values)) {
            if (containsVar(expr, otherVar)) {
                expr = simplify(substituteVar(expr, otherVar, otherVal));
            }
        }
        values[vName] = expr;
    }

    return { steps, values, eliminationOrder: [...eliminationOrder, lastVar] };
}

// ── Solution Steps Rendering (Same umformZeile/umformBox notation) ──────────
function renderLgsEqualizationRechenweg(equations, result, targetVar, varNames) {
    let html = `<div class="lgsSchrittTitel">Initial System</div><div class="umformBox">`;
    equations.forEach((eq, i) => {
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span><span class="umformOperation">(${i + 1})</span></div>`;
    });
    html += `</div>`;

    result.steps.forEach(step => {
        if (step.type === "isolateMultiple") {
            html += `<div class="lgsSchrittTitel">Solve for ${formatVarName(step.varName)}</div>`;
            step.entries.forEach(entry => {
                html += `<div class="umformBox">`;
                entry.isolateSteps.forEach(st => {
                    const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
                    html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span><span class="umformOperation">| ${st.opLabel}</span></div>${noteHtml}`;
                });
                html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(step.varName)} = ${renderExpr(entry.resultExpr)}</span></div></div>`;
            });
        } else if (step.type === "equalize") {
            html += `<div class="lgsSchrittTitel">Set Equal (${formatVarName(step.varName)})</div><div class="umformBox">`;
            step.newEquations.forEach(eq => {
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span></div>`;
            });
            html += `</div>`;
        } else if (step.type === "finalSolve") {
            html += `<div class="lgsSchrittTitel">Solve for ${formatVarName(step.varName)}</div><div class="umformBox">`;
            step.isolateSteps.forEach(st => {
                const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span><span class="umformOperation">| ${st.opLabel}</span></div>${noteHtml}`;
            });
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(step.varName)} = ${renderExpr(step.resultExpr)}</span></div></div>`;
        }
    });

    if (result.error) {
        html += `<div class="umformBox"><div class="umformZeile"><span class="umformGleichung">${result.error}</span></div></div>`;
        return html;
    }

    html += `<div class="lgsSchrittTitel">Result</div><div class="umformBox">`;
    if (targetVar === "all") {
        varNames.forEach(vName => {
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(vName)} = ${renderExpr(result.values[vName])}</span></div>`;
        });
    } else {
        html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(targetVar)} = ${renderExpr(result.values[targetVar])}</span></div>`;
    }
    html += `</div>`;

    return html;
}




// ELIMINATION METHOD – normalizes equations into coefficients per variable + constant


// Decomposes an equation into coefficients per variable + constant.
// Returns null if a term is not in "Number · Variable" form
// (e.g., a variable in the denominator) — currently non-normalizable.
function normalizeToCanonical(eq) {
    const diffTerms = [];
    flattenTerms(eq.left, 1, diffTerms);
    flattenTerms(eq.right, -1, diffTerms);

    let constantSum = 0;
    const coeffs = {};

    for (const t of diffTerms) {
        if (t.node.type === "num") {
            constantSum += t.sign * t.node.value;
            continue;
        }
        const { coeff, base } = extractCoefficient(t.node);
        if (base.type !== "var") return null;
        coeffs[base.name] = exaktRunden((coeffs[base.name] || 0) + t.sign * coeff);
    }

    return { coeffs, constant: exaktRunden(-constantSum) };
}

function gcdNum(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b > 1e-9) { const t = a % b; a = b; b = t; }
    return a || 1;
}

// Calculates factors kA, kB such that kA·cA + kB·cB = 0 (canceling out the variable
// upon addition), preferring small integer factors via GCD.
function computeEliminationFactors(cA, cB) {
    if (Number.isInteger(cA) && Number.isInteger(cB)) {
        const g = gcdNum(cA, cB) || 1;
        let kA = exaktRunden(cB / g);
        let kB = exaktRunden(-cA / g);
        if (kA < 0) { kA = -kA; kB = -kB; }
        return { kA, kB };
    }
    return { kA: cB, kB: -cA };
}

function formatFactorForDisplay(k) {
    return k < 0 ? `(${k})` : `${k}`;
}

function scaleEquation(eq, factor) {
    if (factor === 1) return { left: eq.left, right: eq.right };
    if (factor === -1) {
        return {
            left: simplify({ type: "neg", arg: eq.left }),
            right: simplify({ type: "neg", arg: eq.right })
        };
    }
    const mulNode = (n) => simplify({ type: "mul", left: numNode(factor), right: n });
    return { left: mulNode(eq.left), right: mulNode(eq.right) };
}

function addEquations(eqA, eqB) {
    return {
        left: simplify({ type: "add", left: eqA.left, right: eqB.left }),
        right: simplify({ type: "add", left: eqA.right, right: eqB.right })
    };
}

function solveLinearSystemAddition(equations, varNames, targetVar) {
    let workingEquations = equations.map(eq => ({ left: eq.left, right: eq.right }));
    let remainingVars = varNames.slice();
    const steps = [];
    const referenceEquations = {};
    const eliminationOrder = [];
    const avoidVar = (targetVar && targetVar !== "all") ? targetVar : null;

    while (workingEquations.length > 1) {
        let chosenVar = null;
        let candidates = null;
        const orderedVars = avoidVar && remainingVars.length > 1
            ? [...remainingVars.filter(v => v !== avoidVar), avoidVar]
            : remainingVars;

        for (const vName of orderedVars) {
            const found = [];
            let normalizationFailed = false;

            workingEquations.forEach((eq, i) => {
                const canon = normalizeToCanonical(eq);
                if (canon === null) { normalizationFailed = true; return; }
                const c = canon.coeffs[vName] || 0;
                if (c !== 0) found.push({ index: i, coeff: c });
            });

            if (normalizationFailed) {
                return { error: "This system of equations contains terms that cannot currently be processed for the elimination method (e.g., a variable in the denominator).", steps };
            }

            if (found.length >= 2) {
                chosenVar = vName;
                candidates = found;
                break;
            }
        }

        if (!chosenVar) {
            return { error: findDegenerateMessage(workingEquations) || "This system of equations cannot currently be solved using the elimination method.", steps };
        }

        // Pivot = first equation containing this variable; ALL other
        // equations containing this variable are eliminated pairwise against the pivot
        // so that the variable is completely removed from all equations.
        const pivot = candidates[0];
        const pivotEq = workingEquations[pivot.index];
        const eliminationSteps = [];
        const newEquations = [];

        for (let k = 1; k < candidates.length; k++) {
            const other = candidates[k];
            const otherEq = workingEquations[other.index];
            const { kA, kB } = computeEliminationFactors(pivot.coeff, other.coeff);

            const scaledA = scaleEquation(pivotEq, kA);
            const scaledB = scaleEquation(otherEq, kB);
            const newEq = addEquations(scaledA, scaledB);

            if (containsVar(newEq.left, chosenVar) || containsVar(newEq.right, chosenVar)) {
                return { error: "This system of equations cannot currently be solved using the elimination method.", steps };
            }

            eliminationSteps.push({ eqA: pivotEq, eqB: otherEq, kA, kB, scaledA, scaledB, newEq });
            newEquations.push(newEq);
        }

        steps.push({ type: "eliminate", varName: chosenVar, eliminationSteps });
        referenceEquations[chosenVar] = pivotEq;

        const involvedIndices = candidates.map(c => c.index);
        const keepIndices = workingEquations.map((_, i) => i).filter(i => !involvedIndices.includes(i));
        workingEquations = [...keepIndices.map(i => workingEquations[i]), ...newEquations];
        remainingVars = remainingVars.filter(v => v !== chosenVar);
        eliminationOrder.push(chosenVar);
    }

   if (workingEquations.length !== 1 || remainingVars.length !== 1) {
        return { error: "This system of equations cannot currently be solved using the elimination method.", steps };
    }

    const lastVar = remainingVars[0];
    const finalIsolate = isolate(workingEquations[0], lastVar);
    if (!finalIsolate) return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps };
    if (finalIsolate.error) return { error: finalIsolate.error, steps };

    const values = { [lastVar]: simplify(finalIsolate.headlineResult) };
    steps.push({ type: "finalSolve", varName: lastVar, isolateSteps: finalIsolate.steps, resultExpr: values[lastVar] });

    for (let i = eliminationOrder.length - 1; i >= 0; i--) {
        if (avoidVar && Object.prototype.hasOwnProperty.call(values, avoidVar)) break;
        const vName = eliminationOrder[i];
        let refEq = referenceEquations[vName];
        const substSteps = [];

        Object.entries(values).forEach(([otherVar, otherVal]) => {
            if (containsVar(refEq.left, otherVar) || containsVar(refEq.right, otherVar)) {
                refEq = {
                    left: simplify(substituteVar(refEq.left, otherVar, otherVal)),
                    right: simplify(substituteVar(refEq.right, otherVar, otherVal))
                };
                substSteps.push({ varName: otherVar, value: otherVal, afterEq: refEq });
            }
        });

        const backIsolate = isolate(refEq, vName);
        if (!backIsolate) return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps };
        if (backIsolate.error) return { error: backIsolate.error, steps };

        values[vName] = simplify(backIsolate.headlineResult);
        steps.push({ type: "backSubstitute", varName: vName, refEq: referenceEquations[vName], substSteps, isolateSteps: backIsolate.steps, resultExpr: values[vName] });
    }

    return { steps, values, eliminationOrder: [...eliminationOrder, lastVar] };
}

// ── Solution Steps Rendering ───────────────────────────────────────────────
function renderLgsAdditionRechenweg(equations, result, targetVar, varNames) {
    let html = `<div class="lgsSchrittTitel">Initial System</div><div class="umformBox">`;
    equations.forEach((eq, i) => {
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span><span class="umformOperation">(${i + 1})</span></div>`;
    });
    html += `</div>`;

    result.steps.forEach(step => {
        if (step.type === "eliminate") {
            html += `<div class="lgsSchrittTitel">Eliminate ${formatVarName(step.varName)}</div>`;
            step.eliminationSteps.forEach(sub => {
                html += `<div class="umformBox">`;
                const labelA = sub.kA === 1 ? "" : ` &nbsp;| &middot; ${formatFactorForDisplay(sub.kA)}`;
                const labelB = sub.kB === 1 ? "" : ` &nbsp;| &middot; ${formatFactorForDisplay(sub.kB)}`;

                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(sub.eqA.left)} = ${renderExpr(sub.eqA.right)}</span><span class="umformOperation">I${labelA}</span></div>`;
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(sub.eqB.left)} = ${renderExpr(sub.eqB.right)}</span><span class="umformOperation">II${labelB}</span></div>`;

                if (sub.kA !== 1 || sub.kB !== 1) {
                    html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(sub.scaledA.left)} = ${renderExpr(sub.scaledA.right)}</span><span class="umformOperation">I'</span></div>`;
                    html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(sub.scaledB.left)} = ${renderExpr(sub.scaledB.right)}</span><span class="umformOperation">II'</span></div>`;
                }

                html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${renderExpr(sub.newEq.left)} = ${renderExpr(sub.newEq.right)}</span><span class="umformOperation">I' + II'</span></div>`;
                html += `</div>`;
            });
        } else if (step.type === "finalSolve" || step.type === "backSubstitute") {
            const titel = step.type === "finalSolve"
                ? `Solve for ${formatVarName(step.varName)}`
                : `Determine ${formatVarName(step.varName)} via substitution`;
            html += `<div class="lgsSchrittTitel">${titel}</div><div class="umformBox">`;

            if (step.type === "backSubstitute") {
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(step.refEq.left)} = ${renderExpr(step.refEq.right)}</span></div>`;
                step.substSteps.forEach(s => {
                    html += `<div class="umformZeile"><span class="umformGleichung">Substitute ${formatVarName(s.varName)} = ${renderExpr(s.value)}: ${renderExpr(s.afterEq.left)} = ${renderExpr(s.afterEq.right)}</span></div>`;
                });
            }

            step.isolateSteps.forEach(st => {
                const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
                html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span><span class="umformOperation">| ${st.opLabel}</span></div>${noteHtml}`;
            });
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(step.varName)} = ${renderExpr(step.resultExpr)}</span></div></div>`;
        }
    });

    if (result.error) {
        html += `<div class="umformBox"><div class="umformZeile"><span class="umformGleichung">${result.error}</span></div></div>`;
        return html;
    }

    html += `<div class="lgsSchrittTitel">Result</div><div class="umformBox">`;
    if (targetVar === "all") {
        varNames.forEach(vName => {
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(vName)} = ${renderExpr(result.values[vName])}</span></div>`;
        });
    } else {
        html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(targetVar)} = ${renderExpr(result.values[targetVar])}</span></div>`;
    }
    html += `</div>`;

    return html;
}



// GAUSSIAN ELIMINATION – classic forward elimination on the augmented matrix


const ROW_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function formatGaussNum(n) {
    return exaktRunden(n).toString().replace("-", "−");
}

// Reconstructs an AST equation "c1·var1 + c2·var2 + ... = constant" for isolate() 
// from a matrix row [c1, c2, ..., cn, constant].
function rowToEquationNode(row, varNames) {
    const n = varNames.length;
    let leftNode = null;
    for (let j = 0; j < n; j++) {
        const c = row[j];
        if (c === 0) continue;
        const term = c === 1
            ? { type: "var", name: varNames[j] }
            : { type: "mul", left: numNode(c), right: { type: "var", name: varNames[j] } };
        leftNode = leftNode === null ? term : { type: "add", left: leftNode, right: term };
    }
    if (leftNode === null) leftNode = numNode(0);
    return { left: simplify(leftNode), right: numNode(row[n]) };
}

function solveLinearSystemGauss(equations, varNames, targetVar) {
    // Sort target variable as the last column: allows direct solution 
    // in the last row (no back-substitution required for other variables).
    const avoidVar = (targetVar && targetVar !== "all") ? targetVar : null;
    const orderedVarNames = avoidVar && varNames.includes(avoidVar)
        ? [...varNames.filter(v => v !== avoidVar), avoidVar]
        : varNames;
    const n = orderedVarNames.length;

    const initialMatrix = equations.map(eq => {
        const canon = normalizeToCanonical(eq);
        if (!canon) return null;
        return [...orderedVarNames.map(v => exaktRunden(canon.coeffs[v] || 0)), canon.constant];
    });

    if (initialMatrix.some(r => r === null)) {
        return { error: "This system of equations contains terms that cannot currently be processed for Gaussian elimination (e.g., a variable in the denominator)." };
    }

    let matrix = initialMatrix.map(r => r.slice());
    let rowLabels = ROW_LABELS.slice(0, n);
    const steps = [];

    for (let pivotCol = 0; pivotCol < n; pivotCol++) {
        let pivotRow = pivotCol;

        // Determine largest available pivot in this column (used for numerical stability checks below).
        let bestRow = pivotCol;
        let bestAbs = Math.abs(matrix[pivotCol][pivotCol]);
        for (let r = pivotCol + 1; r < n; r++) {
            if (Math.abs(matrix[r][pivotCol]) > bestAbs) {
                bestAbs = Math.abs(matrix[r][pivotCol]);
                bestRow = r;
            }
        }

        const naturalAbs = Math.abs(matrix[pivotRow][pivotCol]);

        // Only swap rows if the natural pivot is (effectively) 0 OR significantly smaller 
        // (factor 1000+) than the largest available pivot in the column.
        if (naturalAbs < 1e-9 || (bestAbs > 1e-9 && naturalAbs < bestAbs / 1000)) {
            pivotRow = bestRow;
        }

        const maxAbs = Math.abs(matrix[pivotRow][pivotCol]);

        if (maxAbs < 1e-9) {
            let hasContradiction = false;
            let hasRedundant = false;
            for (let r = pivotCol; r < n; r++) {
                const allZeroCoeffs = matrix[r].slice(pivotCol, n).every(c => Math.abs(c) < 1e-9);
                if (allZeroCoeffs) {
                    if (Math.abs(matrix[r][n]) > 1e-9) hasContradiction = true;
                    else hasRedundant = true;
                }
            }
            if (hasContradiction) return { error: "This system of equations has no solution.", steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
            if (hasRedundant) return { error: "This system of equations has infinitely many solutions.", steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
            return { error: "This system of equations has no unique solution.", steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
        }

        if (pivotRow !== pivotCol) {
            const labelA = rowLabels[pivotCol];
            const labelB = rowLabels[pivotRow];
            [matrix[pivotCol], matrix[pivotRow]] = [matrix[pivotRow], matrix[pivotCol]];
            [rowLabels[pivotCol], rowLabels[pivotRow]] = [rowLabels[pivotRow], rowLabels[pivotCol]];
            steps.push({ type: "swap", labelA, labelB, matrix: matrix.map(r => r.slice()), labels: rowLabels.slice() });
        }

        for (let r = pivotCol + 1; r < n; r++) {
            const factor = exaktRunden(matrix[r][pivotCol] / matrix[pivotCol][pivotCol]);
            if (factor === 0) continue;
            for (let c = pivotCol; c <= n; c++) {
                matrix[r][c] = exaktRunden(matrix[r][c] - factor * matrix[pivotCol][c]);
            }
            steps.push({
                type: "eliminate", targetRow: r, pivotRow: pivotCol, factor,
                matrix: matrix.map(rr => rr.slice()), labels: rowLabels.slice()
            });
        }
    }

    for (let i = 0; i < n; i++) {
        if (Math.abs(matrix[i][i]) < 1e-9) {
            return { error: "This system of equations has no unique solution.", steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
        }
    }

    const values = {};
    for (let i = n - 1; i >= 0; i--) {
        const vName = orderedVarNames[i];
        let eq = rowToEquationNode(matrix[i], orderedVarNames);
        const substApplied = [];

        for (let j = i + 1; j < n; j++) {
            const otherVar = orderedVarNames[j];
            const val = values[otherVar];
            if (containsVar(eq.left, otherVar) || containsVar(eq.right, otherVar)) {
                eq = {
                    left: simplify(substituteVar(eq.left, otherVar, val)),
                    right: simplify(substituteVar(eq.right, otherVar, val))
                };
                substApplied.push({ varName: otherVar, value: val, afterEq: eq });
            }
        }

        const isoResult = isolate(eq, vName);
        if (!isoResult) return { error: "This variable cannot be isolated with the currently supported algebraic transformations.", steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
        if (isoResult.error) return { error: isoResult.error, steps, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };

        values[vName] = simplify(isoResult.headlineResult);
        steps.push({
            type: "backSubstitute", varName: vName,
            baseEq: rowToEquationNode(matrix[i], orderedVarNames),
            substApplied, isolateSteps: isoResult.steps, resultExpr: values[vName]
        });
        if (avoidVar && vName === avoidVar) break; // Remaining values are not needed for the target variable
    }

    return { steps, values, initialMatrix, initialLabels: ROW_LABELS.slice(0, n), varNamesUsed: orderedVarNames };
}

// ── Matrix Rendering ───────────────────────────────────────────────────────
function renderGaussMatrix(matrix, labels, varNames, opLabel) {
    const n = varNames.length;
    let html = `<div class="gaussMatrixBlock">`;
    if (opLabel) html += `<div class="gaussOpLabel">${opLabel}</div>`;
    html += `<table class="gaussMatrix"><thead><tr><td></td>`;
    varNames.forEach(v => { html += `<td class="gaussHeaderCell">${formatVarName(v)}</td>`; });
    html += `<td></td><td class="gaussHeaderCell">=</td></tr></thead><tbody>`;
    matrix.forEach((row, i) => {
        html += `<tr><td class="gaussRowLabel">${labels[i]}</td>`;
        for (let j = 0; j < n; j++) {
            html += `<td class="gaussCell">${formatGaussNum(row[j])}</td>`;
        }
        html += `<td class="gaussSep">|</td><td class="gaussCell gaussConst">${formatGaussNum(row[n])}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
}

function renderLgsGaussRechenweg(equations, result, targetVar, varNames) {
    const matrixVarNames = result.varNamesUsed || varNames;
    const initialLabels = result.initialLabels || ROW_LABELS.slice(0, equations.length);

    let html = `<div class="lgsSchrittTitel">Initial System</div><div class="umformBox">`;
    equations.forEach((eq, i) => {
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(eq.left)} = ${renderExpr(eq.right)}</span><span class="umformOperation">(${initialLabels[i]})</span></div>`;
    });
    html += `</div>`;

    if (result.initialMatrix) {
        html += `<div class="lgsSchrittTitel">Augmented Coefficient Matrix</div>`;
        html += renderGaussMatrix(result.initialMatrix, initialLabels, matrixVarNames, null);
    }

    (result.steps || []).forEach(step => {
        if (step.type === "swap") {
            html += renderGaussMatrix(step.matrix, step.labels, matrixVarNames, `Swap ${step.labelA} ↔ ${step.labelB}`);
        } else if (step.type === "eliminate") {
            const labels = step.labels;
            const opSign = step.factor >= 0 ? "−" : "+";
            const absFactor = Math.abs(step.factor);
            const factorLabel = absFactor === 1 ? "" : `${formatGaussNum(absFactor)}·`;
            const opLabel = `${labels[step.targetRow]} → ${labels[step.targetRow]} ${opSign} ${factorLabel}${labels[step.pivotRow]}`;
            html += renderGaussMatrix(step.matrix, step.labels, matrixVarNames, opLabel);
        }
    });

    if (result.error) {
        html += `<div class="umformBox"><div class="umformZeile"><span class="umformGleichung">${result.error}</span></div></div>`;
        return html;
    }

    html += `<div class="lgsSchrittTitel">Back-Substitution</div>`;
    result.steps.filter(s => s.type === "backSubstitute").forEach(step => {
        html += `<div class="umformBox">`;
        html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(step.baseEq.left)} = ${renderExpr(step.baseEq.right)}</span></div>`;
        step.substApplied.forEach(s => {
            html += `<div class="umformZeile"><span class="umformGleichung">Substitute ${formatVarName(s.varName)} = ${renderExpr(s.value)}: ${renderExpr(s.afterEq.left)} = ${renderExpr(s.afterEq.right)}</span></div>`;
        });
        step.isolateSteps.forEach(st => {
            const noteHtml = st.note ? `<div class="umformHinweis">${st.note}</div>` : "";
            html += `<div class="umformZeile"><span class="umformGleichung">${renderExpr(st.beforeLeft)} = ${renderExpr(st.beforeRight)}</span><span class="umformOperation">| ${st.opLabel}</span></div>${noteHtml}`;
        });
        html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(step.varName)} = ${renderExpr(step.resultExpr)}</span></div></div>`;
    });

    html += `<div class="lgsSchrittTitel">Result</div><div class="umformBox">`;
    if (targetVar === "all") {
        varNames.forEach(vName => {
            html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(vName)} = ${renderExpr(result.values[vName])}</span></div>`;
        });
    } else {
        html += `<div class="umformZeile umformFinal"><span class="umformGleichung">${formatVarName(targetVar)} = ${renderExpr(result.values[targetVar])}</span></div>`;
    }
    html += `</div>`;

    return html;
}