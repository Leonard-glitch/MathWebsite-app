// Select the relevant elements
const advancedCheckbox = document.querySelector('.advancedMode input[type="checkbox"]');
const targetContainer = document.getElementById('quickAccessContainer');

// 1. Template for Advanced Mode
const quickAccessContainerAdvanced = `
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-sq" data-insert="^{2}">x²</button>
        <button class="padButton" id="btn-adv-pow" data-insert="^{#0}" data-placeholder="true">xʸ</button>
        <button class="padButton" id="btn-adv-sqrt" data-insert="\\sqrt{#0}" data-placeholder="true">√</button>
        <button class="padButton" id="btn-adv-cbrt" data-insert="\\sqrt[3]{#0}" data-placeholder="true">³√</button>
    </div>
    
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-sin" data-insert="\\sin(#0)" data-placeholder="true">sin</button>
        <button class="padButton" id="btn-adv-cos" data-insert="\\cos(#0)" data-placeholder="true">cos</button>
        <button class="padButton" id="btn-adv-tan" data-insert="\\tan(#0)" data-placeholder="true">tan</button>
        <button class="padButton" id="btn-adv-pi" data-insert="\\pi">π</button>
    </div>
    
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-asin" data-insert="\\arcsin(#0)" data-placeholder="true">asin</button>
        <button class="padButton" id="btn-adv-acos" data-insert="\\arccos(#0)" data-placeholder="true">acos</button>
        <button class="padButton" id="btn-adv-atan" data-insert="\\arctan(#0)" data-placeholder="true">atan</button>
        <button class="padButton" id="btn-adv-e" data-insert="e">e</button>
    </div>
    
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-ln" data-insert="\\ln(#0)" data-placeholder="true">ln</button>
        <button class="padButton" id="btn-adv-log" data-insert="\\log(#0)" data-placeholder="true">log</button>
        <button class="padButton" id="btn-adv-exp" data-insert="e^{#0}" data-placeholder="true">eˣ</button>
        <button class="padButton" id="btn-adv-tenpow" data-insert="10^{#0}" data-placeholder="true">10ˣ</button>
    </div>
    
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-inv" data-insert="\\frac{1}{#0}" data-placeholder="true">1/x</button>
        <button class="padButton" id="btn-adv-percent" data-insert="\\%">%</button>
        <button class="padButton" id="btn-adv-fact" data-insert="!">!</button>
        <button class="padButton" id="btn-adv-mod" data-insert="\\bmod ">mod</button>
    </div>
    
    <div class="customInputContainerRow">
        <button class="padButton" id="btn-adv-abs" data-insert="|#0|" data-placeholder="true">abs</button>
        <button class="padButton" id="btn-adv-floor" data-insert="\\lfloor #0 \\rfloor" data-placeholder="true">floor</button>
        <button class="padButton" id="btn-adv-ceil" data-insert="\\lceil #0 \\rceil" data-placeholder="true">ceil</button>
        <button class="padButton" id="btn-adv-ans" data-action="ans">Ans</button>
    </div>`;

// 2. Template for Standard Mode (disabled)
const quickAccessContainerStandard = `
<div class="customInputContainerRow">
    <button class="padButton" id="btn-std-sq" data-insert="^{2}">x²</button>
    <button class="padButton" id="btn-std-sqrt" data-insert="\\sqrt{#0}" data-placeholder="true">√</button>
    <button class="padButton" id="btn-std-sin" data-insert="\\sin(#0)" data-placeholder="true">sin</button>
    <button class="padButton" id="btn-std-cos" data-insert="\\cos(#0)" data-placeholder="true">cos</button>
</div>
<div class="customInputContainerRow">
    <button class="padButton" id="btn-std-tan" data-insert="\\tan(#0)" data-placeholder="true">tan</button>
    <button class="padButton" id="btn-std-pi" data-insert="\\pi">π</button>
    <button class="padButton" id="btn-std-percent" data-insert="\\%">%</button>
    <div style="flex: 1;"></div>
</div>`;

// Function to toggle modes
function updateAdvancedMode() {
    // Clear the container before populating it
    targetContainer.innerHTML = '';

    if (advancedCheckbox.checked) {
        // If active: Insert advanced content
        targetContainer.innerHTML = quickAccessContainerAdvanced;
    } else {
        // If disabled: Insert standard content
        targetContainer.innerHTML = quickAccessContainerStandard;
    }
}

// Bind persistence + toggle together (account or guest, see common-login.js)
window.MV.bindAdvancedToggle(advancedCheckbox, 'matheRechner', updateAdvancedMode);





// ==========================================================================
// CALCULATION ENGINE (Phase 1: Standard feature set)
// Pure numeric expressions – no equations, no variables. Grammar is
// deliberately leaner than Formel Umformer: since variables are completely
// forbidden, every successfully parsed expression is automatically fully
// numerically evaluable (no tryEvalNumeric null-case needed).
// ==========================================================================

class CalcError extends Error {}

function exaktRunden(n) {
    // Numbers of this magnitude do not need decimal cleanup,
    // and ×1e10 would overflow to Infinity anyway (e.g., 170!, 10^300).
    if (!Number.isFinite(n) || Math.abs(n) >= 1e15) return n;
    return Math.round(n * 1e10) / 1e10;
}

const CALC_BLACKLIST_CHECKS = [
    { re: /\\int|\\iint|\\iiint|\\oint/, msg: "Integrals are not supported." },
    { re: /\\sum/, msg: "Summation symbols are not supported." },
    { re: /\\prod/, msg: "Product symbols are not supported." },
    { re: /\\lim/, msg: "Limits are not supported." },
    { re: /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)\}/, msg: "Matrices are not supported." },
    { re: /\\vec|\\overrightarrow/, msg: "Vectors are not supported." },
    { re: /\\det/, msg: "Determinants are not supported." },
    { re: /\\in\b|\\notin|\\subset|\\subseteq|\\cup|\\cap|\\emptyset|\\forall|\\exists/, msg: "Set theory is not supported." },
    { re: /\\Rightarrow|\\Leftrightarrow|\\rightarrow|\\wedge|\\vee|\\neg/, msg: "Logic operators are not supported." },
    { re: /\\leq|\\geq|\\neq|\\approx|\\equiv|[<>]/, msg: "Inequalities are not supported." },
    { re: /\\partial|\\nabla|\\prime/, msg: "Derivatives are not supported." },
    { re: /\\Im\b|\\Re\b|\\overline\{|\\bar\{|\\mathbb\{C\}/, msg: "Complex numbers are not supported." },
    { re: /\\binom|\\choose/, msg: "Binomial coefficients are not supported." }
];

function checkCalcBlacklist(latex) {
    for (const { re, msg } of CALC_BLACKLIST_CHECKS) {
        if (re.test(latex)) throw new CalcError(msg);
    }
}

// Reads ONE argument for \frac or \sqrt in bracketless LaTeX shorthand notation
// (e.g., "\frac36" = 3/6): either a bracketed group {...} or exactly ONE
// single character (digit, "e", or \pi) – never a multi-digit sequence,
// so that numerator and denominator do not merge into a single number "36".
function readCalcBraceOrBareArgument(latex, i, contextLabel) {
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
                    const innerTokens = tokenizeCalc(inner).slice(0, -1); // without EOF
                    return { tokens: [{ type: "LBRACE" }, ...innerTokens, { type: "RBRACE" }], nextIndex: end };
                }
            }
        }
        throw new CalcError("A curly brace was not closed properly.");
    }

    if (latex[i] === "\\") {
        let j = i + 1;
        while (j < n && /[a-zA-Z]/.test(latex[j])) j++;
        const cmd = latex.slice(i + 1, j);
        if (cmd === "pi") {
            return { tokens: [{ type: "LBRACE" }, { type: "CONST", name: "pi" }, { type: "RBRACE" }], nextIndex: j };
        }
        throw new CalcError(`A single digit, "e", or "\\pi" is expected after "${contextLabel}" without curly braces.`);
    }

    if (/[0-9]/.test(latex[i])) {
        return { tokens: [{ type: "LBRACE" }, { type: "NUM", value: parseFloat(latex[i]) }, { type: "RBRACE" }], nextIndex: i + 1 };
    }

    if (latex[i] === "e") {
        return { tokens: [{ type: "LBRACE" }, { type: "CONST", name: "e" }, { type: "RBRACE" }], nextIndex: i + 1 };
    }

    throw new CalcError(`"${contextLabel}" is incomplete.`);
}

// ── Tokenizer ──────────────────────────────────────────────────────────────
function tokenizeCalc(latex) {
    const tokens = [];
    let i = 0;
    const n = latex.length;

    while (i < n) {
        const ch = latex[i];
        if (/\s/.test(ch)) { i++; continue; }

        if (ch === "\\") {
            if (latex[i + 1] === "%") { tokens.push({ type: "PERCENT" }); i += 2; continue; }
            let j = i + 1;
            while (j < n && /[a-zA-Z]/.test(latex[j])) j++;
            const cmd = latex.slice(i + 1, j);
            i = j;
            switch (cmd) {
                case "left": case "right": continue;
                case "cdot": case "times": tokens.push({ type: "MUL" }); continue;
                case "div": tokens.push({ type: "DIV" }); continue;
                case "frac": {
                    const numArg = readCalcBraceOrBareArgument(latex, i, "\\frac");
                    const denArg = readCalcBraceOrBareArgument(latex, numArg.nextIndex, "\\frac");
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
                        if (bracketEnd === -1) throw new CalcError("The root index was not closed.");
                        const innerIndex = latex.slice(cursor + 1, bracketEnd - 1);
                        indexTokens.push({ type: "LBRACKET" }, ...tokenizeCalc(innerIndex).slice(0, -1), { type: "RBRACKET" });
                        cursor = bracketEnd;
                    }
                    const arg = readCalcBraceOrBareArgument(latex, cursor, "\\sqrt");
                    tokens.push({ type: "SQRT" }, ...indexTokens, ...arg.tokens);
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
                case "floor": tokens.push({ type: "FUNC", name: "floor" }); continue;
                case "ceil": tokens.push({ type: "FUNC", name: "ceil" }); continue;
                case "abs": tokens.push({ type: "FUNC", name: "abs" }); continue;
                case "bmod": case "mod": tokens.push({ type: "MOD" }); continue;
                case "lfloor": tokens.push({ type: "LFLOOR" }); continue;
                case "rfloor": tokens.push({ type: "RFLOOR" }); continue;
                case "lceil": tokens.push({ type: "LCEIL" }); continue;
                case "rceil": tokens.push({ type: "RCEIL" }); continue;
                default:
                    throw new CalcError("This function is currently not supported.");
            }
        }

        if (ch === "{") { tokens.push({ type: "LBRACE" }); i++; continue; }
        if (ch === "}") { tokens.push({ type: "RBRACE" }); i++; continue; }
        if (ch === "[") { tokens.push({ type: "LBRACKET" }); i++; continue; }
        if (ch === "]") { tokens.push({ type: "RBRACKET" }); i++; continue; }
        if (ch === "(") { tokens.push({ type: "LPAREN" }); i++; continue; }
        if (ch === ")") { tokens.push({ type: "RPAREN" }); i++; continue; }
        if (ch === "^") { tokens.push({ type: "CARET" }); i++; continue; }
        if (ch === "+") { tokens.push({ type: "PLUS" }); i++; continue; }
        if (ch === "-") { tokens.push({ type: "MINUS" }); i++; continue; }
        if (ch === "*" || ch === "×") { tokens.push({ type: "MUL" }); i++; continue; }
        if (ch === "/" || ch === "÷") { tokens.push({ type: "DIV" }); i++; continue; }
        if (ch === "=") { tokens.push({ type: "EQUALS" }); i++; continue; }
        if (ch === "π") { tokens.push({ type: "CONST", name: "pi" }); i++; continue; }

        if (ch === "!") { tokens.push({ type: "FACTORIAL" }); i++; continue; }
        if (ch === "%") { tokens.push({ type: "PERCENT" }); i++; continue; }
        if (ch === "|") { tokens.push({ type: "PIPE" }); i++; continue; }

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

        if (ch === "e") { tokens.push({ type: "CONST", name: "e" }); i++; continue; }
        if (/[a-zA-Z]/.test(ch)) {
            throw new CalcError("Variables are not supported here – only numbers and the provided functions are allowed.");
        }

        throw new CalcError(`The character "${ch}" is not recognized.`);
    }

    tokens.push({ type: "EOF" });
    return tokens;
}

function assertNoEquals(tokens) {
    if (tokens.some(t => t.type === "EQUALS")) {
        throw new CalcError("Equations are not supported here. Simply enter a mathematical expression.");
    }
}

// ── Parser (recursive descent) ──────────────────────────────────────────────
function parseCalcExpression(tokens) {
    let pos = 0;
    const peek = () => tokens[pos];
    const advance = () => tokens[pos++];
    const expect = (type, msg) => {
        if (peek().type !== type) throw new CalcError(msg);
        return advance();
    };
    const atomStartTypes = ["NUM", "CONST", "LPAREN", "PIPE", "LFLOOR", "LCEIL", "FRAC", "SQRT", "FUNC"];
    const startsAtom = (t) => atomStartTypes.includes(t);
    let openPipes = 0;

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
            else if (t === "MOD") { advance(); node = { type: "mod", left: node, right: parseFactor() }; }
            else if (t === "PIPE" && openPipes > 0) { break; } // closing absolute value bar, no implicit multiplication
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
            expect("RBRACE", "The exponent was not closed properly.");
            return e;
        }
        return parseFactor();
    }

    function parsePower() {
        let base = parseAtomPostfix();
        if (peek().type === "CARET") {
            advance();
            return { type: "pow", base, exp: parseExponent() };
        }
        return base;
    }

    // Factorial (!) and percent (%) bind directly to the preceding value,
    // before a potential exponentiation is evaluated (2^3! = 2^(3!), not (2^3)!).
    function parseAtomPostfix() {
        let node = parseAtom();
        while (peek().type === "FACTORIAL" || peek().type === "PERCENT") {
            const opType = advance().type;
            node = { type: opType === "FACTORIAL" ? "fact" : "percent", arg: node };
        }
        return node;
    }

    function parseAtom() {
        const t = peek();
        switch (t.type) {
            case "NUM": advance(); return { type: "num", value: t.value };
            case "CONST": advance(); return { type: "const", name: t.name };
            case "LPAREN": {
                advance();
                const e = parseExpr();
                expect("RPAREN", "A parenthesis was not closed.");
                return e;
            }
            case "PIPE": {
                openPipes++;
                advance();
                const e = parseExpr();
                expect("PIPE", "The absolute value bars were not closed.");
                openPipes--;
                return { type: "func", name: "abs", arg: e };
            }
            case "LFLOOR": {
                advance();
                const e = parseExpr();
                expect("RFLOOR", "The floor bracket was not closed properly.");
                return { type: "func", name: "floor", arg: e };
            }
            case "LCEIL": {
                advance();
                const e = parseExpr();
                expect("RCEIL", "The ceiling bracket was not closed properly.");
                return { type: "func", name: "ceil", arg: e };
            }
            case "FRAC": {
                advance();
                expect("LBRACE", "The fraction is incomplete – the numerator is missing.");
                const num = parseExpr();
                expect("RBRACE", "The numerator of the fraction was not closed properly.");
                expect("LBRACE", "The fraction is incomplete – the denominator is missing.");
                const den = parseExpr();
                expect("RBRACE", "The denominator of the fraction was not closed properly.");
                return { type: "div", left: num, right: den };
            }
            case "SQRT": {
                advance();
                let index = null;
                if (peek().type === "LBRACKET") {
                    advance();
                    index = parseExpr();
                    expect("RBRACKET", "The root index was not closed.");
                }
                expect("LBRACE", "The content of the root is missing.");
                const arg = parseExpr();
                expect("RBRACE", "The root was not closed properly.");
                return { type: "sqrt", arg, index };
            }
            case "FUNC": {
                advance();
                if (peek().type === "LPAREN") {
                    advance();
                    const arg = parseExpr();
                    expect("RPAREN", "The parenthesis after the function was not closed.");
                    return { type: "func", name: t.name, arg };
                }
                if (!startsAtom(peek().type) && peek().type !== "MINUS") {
                    throw new CalcError(`A number or parenthesis is missing after "${t.name}".`);
                }
                return { type: "func", name: t.name, arg: parseFactor() };
            }
            default:
                throw new CalcError("The input is incomplete or contains an unexpected character at this position.");
        }
    }

    const expr = parseExpr();
    if (peek().type !== "EOF") {
        throw new CalcError("There are extra characters at the end of the input.");
    }
    return expr;
}

// ── Auswertung ────────────────────────────────────────────────────────────
function currentAngleMode() {
    const sel = document.getElementById("degradSwitch");
    return sel && sel.value === "rad" ? "rad" : "deg";
}

function evaluateCalcNode(node) {
    switch (node.type) {
        case "num": return node.value;
        case "const": return node.name === "pi" ? Math.PI : Math.E;
        case "neg": return exaktRunden(-evaluateCalcNode(node.arg));
        case "add": return exaktRunden(evaluateCalcNode(node.left) + evaluateCalcNode(node.right));
        case "sub": return exaktRunden(evaluateCalcNode(node.left) - evaluateCalcNode(node.right));
        case "mul": return exaktRunden(evaluateCalcNode(node.left) * evaluateCalcNode(node.right));
        case "div": {
            const a = evaluateCalcNode(node.left);
            const b = evaluateCalcNode(node.right);
            if (b === 0) throw new CalcError("Division by zero is not possible.");
            return exaktRunden(a / b);
        }
        case "pow": {
            const base = evaluateCalcNode(node.base);
            const exp = evaluateCalcNode(node.exp);
            if (base < 0 && !Number.isInteger(exp)) {
                throw new CalcError("This calculation has no real result.");
            }
            return exaktRunden(Math.pow(base, exp));
        }
        case "sqrt": {
            const a = evaluateCalcNode(node.arg);
            const idx = node.index ? evaluateCalcNode(node.index) : 2;
            if (a < 0 && idx % 2 === 0) {
                throw new CalcError("This calculation has no real result – an even root cannot be taken from a negative number.");
            }
            return exaktRunden(a < 0 ? -Math.pow(-a, 1 / idx) : Math.pow(a, 1 / idx));
        }
        case "fact": {
            const a = evaluateCalcNode(node.arg);
            if (a < 0 || !Number.isInteger(a)) {
                throw new CalcError("The factorial is defined only for non-negative integers.");
            }
            if (a > 170) {
                throw new CalcError("This number is too large for a factorial calculation.");
            }
            let result = 1;
            for (let k = 2; k <= a; k++) result *= k;
            return exaktRunden(result);
        }
        case "percent": {
            return exaktRunden(evaluateCalcNode(node.arg) / 100);
        }
        case "mod": {
            const a = evaluateCalcNode(node.left);
            const b = evaluateCalcNode(node.right);
            if (b === 0) throw new CalcError("Division by zero is not possible with modulo.");
            return exaktRunden(a % b);
        }
        case "func": {
            const a = evaluateCalcNode(node.arg);
            const deg = currentAngleMode() === "deg";
            const inRad = deg ? a * Math.PI / 180 : a;
            const toCurrentMode = (rad) => deg ? rad * 180 / Math.PI : rad;

            switch (node.name) {
                case "sin": return exaktRunden(Math.sin(inRad));
                case "cos": return exaktRunden(Math.cos(inRad));
                case "tan": {
                    if (Math.abs(Math.cos(inRad)) < 1e-12) {
                        throw new CalcError("Tangent is undefined at this point.");
                    }
                    return exaktRunden(Math.tan(inRad));
                }
                case "asin":
                    if (a < -1 || a > 1) throw new CalcError("Arcsine is defined only for values between −1 and 1.");
                    return exaktRunden(toCurrentMode(Math.asin(a)));
                case "acos":
                    if (a < -1 || a > 1) throw new CalcError("Arccosine is defined only for values between −1 and 1.");
                    return exaktRunden(toCurrentMode(Math.acos(a)));
                case "atan":
                    return exaktRunden(toCurrentMode(Math.atan(a)));
                case "ln":
                    if (a <= 0) throw new CalcError("Natural logarithm is defined only for positive numbers.");
                    return exaktRunden(Math.log(a));
                case "log":
                    if (a <= 0) throw new CalcError("Logarithm is defined only for positive numbers.");
                    return exaktRunden(Math.log10(a));
                case "floor": return exaktRunden(Math.floor(a));
                case "ceil": return exaktRunden(Math.ceil(a));
                case "abs": return exaktRunden(Math.abs(a));
                default:
                    throw new CalcError("This function is currently not supported.");
            }
        }
        default:
            throw new CalcError("This input is currently not supported.");
    }
}

// ── Rechenweg (schrittweise Reduktion des AST, ein Schritt pro Operation) ──

function isAtomicCalc(node) {
    return node.type === "num" || node.type === "const";
}

function atomicValue(node) {
    return node.type === "num" ? node.value : (node.name === "pi" ? Math.PI : Math.E);
}

function resultToNode(value) {
    return { type: "num", value: exaktRunden(value) };
}

function formatCalcNum(v) {
    return exaktRunden(v).toString().replace("-", "−");
}

function calcOpSymbol(type) {
    switch (type) {
        case "add": return "+";
        case "sub": return "−";
        case "mul": return "×";
        case "div": return "÷";
        case "mod": return "mod";
        default: return "?";
    }
}

function calcOpTitle(type) {
    switch (type) {
        case "add": return "Addition";
        case "sub": return "Subtraction";
        case "mul": return "Multiplication";
        case "div": return "Division";
        case "mod": return "Modulo";
        default: return "Calculation";
    }
}

const CALC_FUNC_TITLES = {
    sin: "Apply sine", cos: "Apply cosine", tan: "Apply tangent",
    asin: "Apply arcsine", acos: "Apply arccosine", atan: "Apply arctangent",
    ln: "Apply natural logarithm", log: "Apply logarithm",
    floor: "Round down", ceil: "Round up", abs: "Calculate absolute value"
};

const CALC_FUNC_LABELS = {
    sin: "sin", cos: "cos", tan: "tan",
    asin: "sin⁻¹", acos: "cos⁻¹", atan: "tan⁻¹",
    ln: "ln", log: "log", floor: "floor", ceil: "ceil"
};

// Klammert einen Operanden, wenn er ohne Klammern missverständlich wäre
// (z.B. "3 × −5" statt "3 × -5", oder "2 × (3 + 4)" statt "2 × 3 + 4").
function calcNeedsParens(n) {
    return n.type === "add" || n.type === "sub" || n.type === "neg" ||
        (n.type === "num" && n.value < 0);
}

function renderCalcExpr(node) {
    switch (node.type) {
        case "num": return formatCalcNum(node.value);
        case "const": return node.name === "pi" ? "π" : "e";
        case "neg": {
            const inner = calcNeedsParens(node.arg) ? `(${renderCalcExpr(node.arg)})` : renderCalcExpr(node.arg);
            return `−${inner}`;
        }
        case "add": return `${renderCalcExpr(node.left)} + ${renderCalcExpr(node.right)}`;
        case "sub": {
            const r = calcNeedsParens(node.right) ? `(${renderCalcExpr(node.right)})` : renderCalcExpr(node.right);
            return `${renderCalcExpr(node.left)} − ${r}`;
        }
        case "mul": case "div": case "mod": {
            const wrap = (n) => calcNeedsParens(n) ? `(${renderCalcExpr(n)})` : renderCalcExpr(n);
            return `${wrap(node.left)} ${calcOpSymbol(node.type)} ${wrap(node.right)}`;
        }
        case "pow": {
            const wrapBase = calcNeedsParens(node.base) || node.base.type === "mul" || node.base.type === "div" || node.base.type === "pow";
            const baseHtml = wrapBase ? `(${renderCalcExpr(node.base)})` : renderCalcExpr(node.base);
            return `${baseHtml}^${renderCalcExpr(node.exp)}`;
        }
        case "sqrt": {
            const prefix = node.index ? `${renderCalcExpr(node.index)}√` : "√";
            return `${prefix}(${renderCalcExpr(node.arg)})`;
        }
        case "fact": return `${renderCalcExpr(node.arg)}!`;
        case "percent": return `${renderCalcExpr(node.arg)}%`;
        case "func": {
            if (node.name === "abs") return `|${renderCalcExpr(node.arg)}|`;
            if (node.name === "floor") return `⌊${renderCalcExpr(node.arg)}⌋`;
            if (node.name === "ceil") return `⌈${renderCalcExpr(node.arg)}⌉`;
            return `${CALC_FUNC_LABELS[node.name] || node.name}(${renderCalcExpr(node.arg)})`;
        }
        default: return "?";
    }
}

function makeCalcStep(title, node, value) {
    return { title, formula: `${renderCalcExpr(node)} = ${formatCalcNum(value)}` };
}

// Reduces exactly one level: searches (left-to-right, inside-out) for the
// first operation whose operands are already numbers/constants, evaluates
// only this operation, and returns the tree with the replaced position.
// null = this node is already completely atomic.
function tryReduceCalc(node) {
    switch (node.type) {
        case "num": case "const":
            return null;

        case "neg": {
            const childResult = tryReduceCalc(node.arg);
            if (childResult) return { node: { type: "neg", arg: childResult.node }, step: childResult.step };
            // The sign of an already known number is pure notation,
            // not an independent calculation step (otherwise e.g. "−5 = −5").
            return { node: resultToNode(-atomicValue(node.arg)), step: null };
        }

        case "add": case "sub": case "mul": case "div": case "mod": {
            const leftResult = tryReduceCalc(node.left);
            if (leftResult) return { node: { ...node, left: leftResult.node }, step: leftResult.step };
            const rightResult = tryReduceCalc(node.right);
            if (rightResult) return { node: { ...node, right: rightResult.node }, step: rightResult.step };
            const value = evaluateCalcNode(node);
            return { node: resultToNode(value), step: makeCalcStep(calcOpTitle(node.type), node, value) };
        }

        case "pow": {
            const baseResult = tryReduceCalc(node.base);
            if (baseResult) return { node: { ...node, base: baseResult.node }, step: baseResult.step };
            const expResult = tryReduceCalc(node.exp);
            if (expResult) return { node: { ...node, exp: expResult.node }, step: expResult.step };
            const value = evaluateCalcNode(node);
            return { node: resultToNode(value), step: makeCalcStep("Calculate exponent", node, value) };
        }

        case "sqrt": {
            if (node.index) {
                const idxResult = tryReduceCalc(node.index);
                if (idxResult) return { node: { ...node, index: idxResult.node }, step: idxResult.step };
            }
            const argResult = tryReduceCalc(node.arg);
            if (argResult) return { node: { ...node, arg: argResult.node }, step: argResult.step };
            const value = evaluateCalcNode(node);
            return { node: resultToNode(value), step: makeCalcStep("Calculate root", node, value) };
        }

        case "fact": case "percent": {
            const argResult = tryReduceCalc(node.arg);
            if (argResult) return { node: { ...node, arg: argResult.node }, step: argResult.step };
            const value = evaluateCalcNode(node);
            const title = node.type === "fact" ? "Calculate factorial" : "Convert percentage";
            return { node: resultToNode(value), step: makeCalcStep(title, node, value) };
        }

        case "func": {
            const argResult = tryReduceCalc(node.arg);
            if (argResult) return { node: { ...node, arg: argResult.node }, step: argResult.step };
            const value = evaluateCalcNode(node);
            return { node: resultToNode(value), step: makeCalcStep(CALC_FUNC_TITLES[node.name] || "Apply function", node, value) };
        }

        default:
            return null;
    }
}

function buildCalcSteps(ast) {
    const steps = [];
    let current = ast;
    let guard = 0;

    while (!isAtomicCalc(current) && guard < 200) {
        guard++;
        const result = tryReduceCalc(current);
        if (!result) break;
        if (result.step) steps.push(result.step);
        current = result.node;
    }

    const value = isAtomicCalc(current) ? exaktRunden(atomicValue(current)) : NaN;
    if (steps.length > 0) {
        steps[steps.length - 1].solution = `Result: ${formatCalcNum(value)}`;
    }
    return { steps, value };
}

function renderCalcSteps(steps) {
    if (steps.length === 0) {
        return `<div class="step-container final-step"><div class="step-title">No steps required</div><div class="step-text">This input is already a single value.</div></div>`;
    }
    return steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return `
            <div class="step-container ${isLast ? "final-step" : ""}">
                <div class="step-title">${step.title}</div>
                <div class="step-formula-box">${step.formula}</div>
                ${step.solution ? `<div class="step-sub-solution">${step.solution}</div>` : ""}
            </div>`;
    }).join("");
}

// ── History (Persistence via window.MV, see common-login.js) ─────────────

const MATH_HISTORY_KEY = "matheRechner";

function formatHistoryTime(iso) {
    try {
        return new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

function renderHistoryList(onReuse) {
    const historyOutput = document.getElementById("historyOutput");
    const deleteWrapper = document.querySelector(".deleteHistory");
    if (!historyOutput) return;

    const isOpen = historyOutput.classList.contains("is-open");

    if (!window.MV.isLoggedIn()) {
        historyOutput.innerHTML = `<p class="historyEmptyState">Log in to see your history.</p>`;
        if (deleteWrapper) deleteWrapper.classList.remove("is-visible");
        return;
    }

    const entries = window.MV.getToolHistory(MATH_HISTORY_KEY);

    if (entries.length === 0) {
        historyOutput.innerHTML = `<p class="historyEmptyState">No calculations in history yet.</p>`;
        if (deleteWrapper) deleteWrapper.classList.remove("is-visible");
        return;
    }

    // Newest first
    historyOutput.innerHTML = entries.slice().reverse().map(entry => `
        <div class="historyEntry" data-id="${entry.id}">
            <button type="button" class="historyEntryMain" data-action="reuse" aria-label="Reuse expression">
                <math-field read-only class="historyEntryExpr">${entry.expr}</math-field>
                <span class="historyEntryResult">= ${entry.result}</span>
            </button>
            <span class="historyEntryTime">${formatHistoryTime(entry.timestamp)}</span>
            <button type="button" class="historyEntryDelete" data-action="delete" aria-label="Delete entry">
                <i class="fa fa-trash-o"></i>
            </button>
        </div>
    `).join("");

    if (deleteWrapper) deleteWrapper.classList.toggle("is-visible", isOpen);

    historyOutput.querySelectorAll(".historyEntry").forEach(row => {
        const id = row.dataset.id;
        row.querySelector('[data-action="reuse"]')?.addEventListener("click", () => {
            const entry = window.MV.getToolHistory(MATH_HISTORY_KEY).find(e => e.id === id);
            if (entry && typeof onReuse === "function") onReuse(entry.expr);
        });
        row.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
            window.MV.deleteToolHistoryEntry(MATH_HISTORY_KEY, id);
            renderHistoryList(onReuse);
        });
    });
}

function initHistoryPanel(onReuse) {
    const showBtn = document.getElementById("showHistoryBtn");
    const historyOutput = document.getElementById("historyOutput");
    const deleteBtn = document.getElementById("deleteHistoryBtn");
    const deleteWrapper = document.querySelector(".deleteHistory");
    if (!showBtn || !historyOutput) return;

    showBtn.addEventListener("click", () => {
        const nowOpen = historyOutput.classList.toggle("is-open");
        showBtn.classList.toggle("is-open", nowOpen);
        if (deleteWrapper) {
            const hasEntries = window.MV.isLoggedIn() && window.MV.getToolHistory(MATH_HISTORY_KEY).length > 0;
            deleteWrapper.classList.toggle("is-visible", nowOpen && hasEntries);
        }
    });

    deleteBtn?.addEventListener("click", () => {
        window.MV.clearToolHistory(MATH_HISTORY_KEY);
        renderHistoryList(onReuse);
    });

    renderHistoryList(onReuse);

    // Cross-Tab/bfcache-Sync (similar to financial calculator / geometry calculator)
    window.addEventListener("mv:staterestore", () => renderHistoryList(onReuse));
}

// ── UI Binding ──────────────────────────────────────────────────────────
Promise.race([
    customElements.whenDefined("math-field"),
    new Promise((_, reject) => setTimeout(() => reject(new Error("MathLive timeout")), 3000))
]).then(() => {
    const mf = document.getElementById("mathInput");
    const resultOutput = document.getElementById("resultoutput");
    const errorMessages = document.getElementById("errorMessages");
    const pathOutput = document.getElementById("pathOutput");
    const liveResultCheckbox = document.querySelector(".liveresultbutton input[type='checkbox']");
    
    liveResultCheckbox.checked = window.MV.getLiveResult();
    liveResultCheckbox.addEventListener("change", () => {
        window.MV.setLiveResult(liveResultCheckbox.checked);
    });
    window.addEventListener("mv:staterestore", () => {
        liveResultCheckbox.checked = window.MV.getLiveResult();
    });

    const degradSwitch = document.getElementById("degradSwitch");
    if (degradSwitch) {
        degradSwitch.value = window.MV.getAngleMode();
        degradSwitch.addEventListener("change", () => {
            window.MV.setAngleMode(degradSwitch.value);
            calculate(); // displayed result was calculated in the old mode
        });
        window.addEventListener("mv:staterestore", () => {
            degradSwitch.value = window.MV.getAngleMode();
        });
    }

    if (!mf) return;

    // The dedicated quick access / numeric keypad covers the entire feature set
    // -> deliberately prevent MathLive's own virtual keyboard from showing automatically
    // (otherwise two keyboards are visible simultaneously, causing layout issues on mobile).
    try {
        if (window.MathfieldElement) {
            window.MathfieldElement.mathVirtualKeyboardPolicy = "manual";
        }
    } catch (e) { /* Version dependent, non-blocking */ }

    let lastAnswer = null;

    function showCalcError(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        resultOutput.textContent = "";
    }

    function hideCalcError() {
        errorMessages.style.display = "none";
    }

    function calculate(addToHistory = false) {
        const latex = mf.value;

        if (!latex || !latex.trim()) {
            hideCalcError();
            resultOutput.textContent = "";
            pathOutput.innerHTML = "";
            return;
        }

        try {
            checkCalcBlacklist(latex);
            const tokens = tokenizeCalc(latex);
            assertNoEquals(tokens);
            const ast = parseCalcExpression(tokens);
            const { steps, value } = buildCalcSteps(ast);

            hideCalcError();
            resultOutput.textContent = formatCalcNum(value);
            pathOutput.innerHTML = renderCalcSteps(steps);
            lastAnswer = value;

            if (addToHistory) {
                window.MV.addToolHistoryEntry(MATH_HISTORY_KEY, {
                    expr: latex,
                    result: formatCalcNum(value),
                    timestamp: new Date().toISOString()
                });
                renderHistoryList(reuseExpression);
            }
        } catch (err) {
            const msg = err instanceof CalcError ? err.message : "Your input could not be processed. Please check the expression.";
            showCalcError(msg);
            pathOutput.innerHTML = "";
        }
    }

    function reuseExpression(expr) {
        mf.value = expr;
        mf.focus();
        calculate(false);
    }

    let debounceTimer = null;
    mf.addEventListener("input", () => {
        clearTimeout(debounceTimer);

        // "=" pressed via the virtual MathLive keyboard does not end up in the "keydown"
        // handler below, but here as a normal value change – even if the cursor
        // is currently inside a fraction or parentheses, not necessarily at the end.
        // Therefore, the entire value is searched instead of checking only the end.
        const eqIndex = mf.value.indexOf("=");
        if (eqIndex !== -1) {
            mf.value = mf.value.slice(0, eqIndex) + mf.value.slice(eqIndex + 1);
            calculate(true);
            return;
        }

        if (!mf.value || !mf.value.trim()) {
            hideCalcError();
            resultOutput.textContent = "";
            pathOutput.innerHTML = "";
            return;
        }

        debounceTimer = setTimeout(() => {
            if (liveResultCheckbox.checked) calculate();
        }, 400);
    });

    mf.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "=") {
            e.preventDefault();
            clearTimeout(debounceTimer);
            calculate(true);
        }
    });

    initHistoryPanel(reuseExpression);

    // ── Quick access & numeric keypad → MathLive field ──────────────────
    // Event delegation on the stable parent node: #quickAccessContainer is
    // rebuilt via innerHTML on every Advanced/Standard toggle (see updateAdvancedMode())
    // – direct listeners on individual buttons would be lost. #numericKeypadContainer
    // uses the same handler for consistency, even though it is never re-rendered.
    const keypadWrapper = document.querySelector(".customInputsSec");
    keypadWrapper?.addEventListener("click", (e) => {
        const btn = e.target.closest(".padButton");
        if (!btn) return;

        mf.focus();

        switch (btn.dataset.action) {
            case "clear":
                mf.executeCommand("deleteAll");
                hideCalcError();
                resultOutput.textContent = "";
                pathOutput.innerHTML = "";
                return;
            case "delete":
                mf.executeCommand("deleteBackward");
                return;
            case "equals":
                calculate(true);
                return;
            case "ans":
                if (lastAnswer === null) {
                    showCalcError("There is no previous result yet.");
                    return;
                }
                // Intentionally using the raw numeric value (ASCII "-"), not formatCalcNum():
                // formatCalcNum uses the Unicode minus sign "−" for display, which the
                // tokenizer would not recognize as a minus when recalculating.
                mf.insert(String(lastAnswer));
                return;
        }

        const latex = btn.dataset.insert;
        if (!latex) return;

        mf.insert(latex, btn.dataset.placeholder === "true" ? { selectionMode: "placeholder" } : undefined);
    });

}).catch(() => {
    // Fallback: MathLive failed to load within 3 seconds
    const errorMessages = document.getElementById("errorMessages");
    const mf = document.getElementById("mathInput");
    
    if (errorMessages) {
        errorMessages.textContent = "Error: Math components could not be loaded. Please check your internet connection or disable your ad blocker.";
        errorMessages.style.display = "block";
    }
    
    if (mf) {
        mf.style.opacity = "0.5";
        mf.style.pointerEvents = "none";
    }
});

// ── Solution path accordion ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    const pathBtn = document.getElementById("pathDropoutBtn");
    const pathOutputEl = document.getElementById("pathOutput");
    if (!pathBtn || !pathOutputEl) return;

    pathBtn.addEventListener("click", () => {
        pathOutputEl.classList.toggle("is-open");
        pathBtn.classList.toggle("is-open");
    });
});