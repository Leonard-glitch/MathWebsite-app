

class FormulaError extends Error {}

// Rounds to 10 decimal places to eliminate JS floating-point errors
// (same principle as exaktRunden() in the number system converter).
function exaktRunden(n) {
    return Math.round(n * 1e10) / 1e10;
}

const BLACKLIST_CHECKS = [
    { re: /\\int|\\iint|\\iiint|\\oint/, msg: "Integrals are not supported." },
    { re: /\\sum/, msg: "Summations are not supported." },
    { re: /\\prod/, msg: "Products are not supported." },
    { re: /\\lim/, msg: "Limits are not supported." },
    { re: /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)\}/, msg: "Matrices and piecewise functions are not supported." },
    { re: /\\vec|\\overrightarrow/, msg: "Vectors are not supported." },
    { re: /\\det/, msg: "Determinants are not supported." },
    { re: /\\in\b|\\notin|\\subset|\\subseteq|\\cup|\\cap|\\emptyset|\\forall|\\exists/, msg: "Set theory is not supported." },
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

// ==========================================================================
// 2. TOKENIZER
// ==========================================================================

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

// ==========================================================================
// 3. PARSER (recursive descent, grammar = whitelist)
// ==========================================================================

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
            else if (t === "PIPE" && openPipes > 0) { break; } // closing absolute value bracket, no implicit multiplication
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
            expect("RBRACE", "The base of the logarithm was not closed properly.");
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
                expect("RBRACE", "The fraction's numerator was not properly closed.");
                expect("LBRACE", "The fraction is incomplete – the denominator is missing.");
                const den = parseExpression();
                expect("RBRACE", "The fraction's denominator was not properly closed.");
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
                expect("LBRACE", "The content of the root is missing.");
                const arg = parseExpression();
                expect("RBRACE", "The root was not properly closed.");
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
                    expect("RPAREN", "The parenthesis after the function was not closed.");
                    const funcNode = { type: "func", name: t.name, arg, base };
                    return funcExponent ? { type: "pow", base: funcNode, exp: funcExponent } : funcNode;
                }
                if (!startsAtom(peek().type) && peek().type !== "MINUS") {
                    throw new FormulaError(`An argument (e.g., a number, variable, or parenthesis) is missing after the function "${t.name}".`);
                }
                const arg = parseFuncArgNoParens();
                const funcNode = { type: "func", name: t.name, arg, base };
                return funcExponent ? { type: "pow", base: funcNode, exp: funcExponent } : funcNode;
            }

            default:
                throw new FormulaError("The formula contains an unexpected element at this point.");
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

// ==========================================================================
// 4. AST HELPER FUNCTIONS
// ==========================================================================

function getChildren(node) {
    switch (node.type) {
        case "num": case "var": case "const": return [];
        case "add": case "sub": case "mul": case "div": return [node.left, node.right];
        case "neg": return [node.arg];
        case "pow": return [node.base, node.exp];
        case "sqrt": return node.index ? [node.arg, node.index] : [node.arg];
        case "abs": return [node.arg];
        case "func": return node.base ? [node.arg, node.base] : [node.arg];
        case "pm": return [node.arg];
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

// ==========================================================================
// 5. SIMPLIFY (Resolve double negatives, combine numbers – for a
//    clean, educational solution path instead of "4 − 10" or "−(−x)")
// ==========================================================================

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

// Structural key of an expression to identify like terms (e.g., 3x
// and 2x, or 3·√x and √x) independently of their coefficient.
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
        case "pm": return `pm:${structuralKey(node.arg)}`;
        default: return "?";
    }
}

// Decomposes a term into a coefficient and a "base" (e.g., 3·x -> coefficient 3, base x).
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
        // Division wird hier bewusst NICHT in einen Koeffizienten zerlegt
    // (U/2 bleibt "U/2", nicht "0.5 · U") – Brüche bleiben wie eingegeben.
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

    // Combine like terms (e.g., 3x + 2x -> 5x, 2x − x -> x),
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

    // Prefers starting with a positive symbolic term. If none exists,
    // but a positive constant is available, the constant leads (e.g., "5 − λ_2" instead of
    // "−λ_2 + 5"). Only if both are missing is the first term negated.
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
            // if a and b are numbers – otherwise, e.g., 2·(3·x) and 6·x remain structurally
            // different and combineAddSub cannot combine like terms.
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

            // Distribution in division by a number: (a±b)/c -> a/c ± b/c
            if ((left.type === "add" || left.type === "sub") && right.type === "num" && right.value !== 0) {
                return simplify({ type: left.type, left: { type: "div", left: left.left, right }, right: { type: "div", left: left.right, right } });
            }

                        // Brüche bleiben wie eingegeben (keine Auto-Dezimalfaltung) –
            // der Formel-Umformer formt nur um, er rechnet nicht.
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

        case "pm": return { type: "pm", arg: simplify(node.arg) };

        default:
            return node;
    }
}


// Tries to evaluate an expression completely numerically – only possible
// if it contains exclusively numbers/constants (no variables).
// Used exclusively for domain constraint checks.
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
            if (a < 0 && !Number.isInteger(b)) return null; // e.g., (-4)^0.5 is not real
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

// ==========================================================================
// 6. RENDERER (AST -> HTML matching the design of the other solution paths)
// ==========================================================================

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
        case "pm": {
            const inner = (node.arg.type === "add" || node.arg.type === "sub") ? `(${renderExpr(node.arg)})` : renderExpr(node.arg);
            return `±${inner}`;
        }

        default:
            return "?";
    }
}

// Compact operand representation for the "| operation" notation
// (wraps in parentheses so e.g. ": 2 · π" does not look ambiguous)
function opnd(node) {
    if (node.type === "add" || node.type === "sub" || node.type === "mul" || node.type === "div" || node.type === "neg" || node.type === "pm") {
        return `(${renderExpr(node)})`;
    }
    return renderExpr(node);
}

// ==========================================================================
// 7. SOLVER – invert one layer of the target side ("peelOnce"), then
//    repeat until the variable is isolated ("isolate")
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

                // Formel-Umformer formt nur um: nimmt immer die Hauptwurzel
                // statt bei ± zu blockieren (das bleibt dem Gleichungslöser
                // vorbehalten, der bei konkreten Zahlenwerten weiter blockt).

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
                const otherVal = tryEvalNumeric(other);
                if (otherVal !== null && otherVal <= 0) {
                    return { domainError: "This equation has no real solution – the logarithm is only defined for positive numbers." };
                }

                return {
                    opLabel: baseIsTen ? `log( )` : `log_${opnd(node.base)}( )`,
                    newSubject: node.exp,
                    newOther: { type: "func", name: "log", base: node.base, arg: other }
                };
            }
            return null; // Variable in base AND exponent -> not supported
        }

        case "sqrt": {
            if (!containsVar(node.arg, varName)) return null; // Variable in root index -> not supported
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
                opLabel: "remove | | (±)",
                newSubject: node.arg,
                newOther: { type: "pm", arg: other }
            };
        }

        case "func": {
            if (node.name === "log") {
                const base = node.base || { type: "num", value: 10, raw: "10" };

                const baseVal = tryEvalNumeric(base);
                if (baseVal !== null && (baseVal <= 0 || baseVal === 1)) {
                    return { domainError: "This equation does not have a valid logarithm base (must be positive and ≠ 1)." };
                }
                
                // FIX: Die fälschliche Prüfung von otherVal <= 0 wurde hier entfernt!

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
                    ambiguous: `The target variable is inside the argument of ${FUNC_LABELS[node.name]}(...). Trigonometric functions are periodic and have infinitely many solutions – currently only the principal value is supported, a complete solution set is not calculated yet.`
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
    // variable terms from the right side to the left side and
    // combine them ("combine variables" like in school).
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
        // (e.g., "x*x" or "x + 1/x"), which combineAddSub could not
        // combine, would otherwise lead to incorrect results.
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
    const result = isolate(eq, varName);
    return result !== null && !result.error;
}

function hasVarInSqrtIndex(node, varName) {
    if (!node) return false;
    if (node.type === "sqrt" && node.index && containsVar(node.index, varName)) return true;
    return getChildren(node).some(child => hasVarInSqrtIndex(child, varName));
}

function findSpecificSolveIssue(eq, varName) {
    const totalOccurrences = countVarOccurrences(eq.left, varName) + countVarOccurrences(eq.right, varName);

    if (totalOccurrences > 1) {
        return `The variable ${formatVarName(varName)} occurs multiple times in the equation (e.g., if it appears simultaneously in base and exponent). Currently, only equations where the target variable appears exactly once can be solved.`;
    }
    if (totalOccurrences === 0) return null;

    if (hasVarInSqrtIndex(eq.left, varName) || hasVarInSqrtIndex(eq.right, varName)) {
        return `The variable ${formatVarName(varName)} is located in the root index. Solving for a variable in this position is currently not supported.`;
    }

    return `This type of equation is currently not supported for ${formatVarName(varName)}.`;
}

// ==========================================================================
// 8. UI INTEGRATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const selectVariable = document.getElementById("selectVariable");
    const btn = document.getElementById("buttonZahlenInput");
    const errorMessages = document.getElementById("errorMessages");
    const loesungOutput = document.getElementById("loesungOutput");
    const rechenwegOutput = document.getElementById("rechenwegOutput");
    const tipp = document.getElementById("tipp");
    const rechenwegDiv = document.querySelector(".rechenwegDiv");

    let currentEquation = null;

    function resetOutput() {
        loesungOutput.innerHTML = "";
        rechenwegOutput.innerHTML = "";
        rechenwegDiv.style.display = "none";
        tipp.textContent = "";
    }

    function disableSelection() {
        selectVariable.innerHTML = '<option value=""> ...</option>';
        selectVariable.disabled = true;
        btn.disabled = true;
    }

    function showError(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        resetOutput();
        disableSelection();
    }

    function hideError() {
        errorMessages.style.display = "none";
    }

    function showSolveError(msg) {
        errorMessages.textContent = msg;
        errorMessages.style.display = "block";
        loesungOutput.innerHTML = "";
        rechenwegOutput.innerHTML = "";
        rechenwegDiv.style.display = "none";
        tipp.textContent = "";
    }

    function analyzeFormula(latex) {
        resetOutput();

        if (!latex || !latex.trim()) {
            hideError();
            disableSelection();
            currentEquation = null;
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
                currentEquation = null;
                disableSelection();
                hideError();
                tipp.textContent = (varNames.length === 1 && findSpecificSolveIssue(eq, varNames[0]))
                    || "This equation does not contain a variable that can be uniquely isolated – e.g., because a variable appears multiple times, is located in the root index, or appears in both the base and exponent simultaneously.";
                return;
            }

            currentEquation = eq;
            selectVariable.innerHTML = solvable
                .map(name => `<option value="${name}">${name.replace("_", " ")}</option>`)
                .join("");
            selectVariable.disabled = false;
            btn.disabled = false;
            hideError();

        } catch (err) {
            currentEquation = null;
            const msg = err instanceof FormulaError ? err.message : "Your formula could not be processed. Please check your input.";
            showError(msg);
        }
    }

    function renderSolution() {
        if (!currentEquation) return;
        const varName = selectVariable.value;
        if (!varName) return;

        const result = isolate(currentEquation, varName);
        if (!result) {
            showSolveError("This variable cannot be isolated using the currently supported transformations.");
            return;
        }
        if (result.error) {
            showSolveError(result.error);
            return;
        }

        hideError();

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

    // ── Connect MathLive field ───────────────────────────────────────────
    Promise.race([
        customElements.whenDefined("math-field"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("MathLive timeout")), 3000))
    ]).then(() => {
        const mf = document.getElementById("mathInput");
        if (!mf) return;

        try {
            if (window.mathVirtualKeyboard) {
                window.mathVirtualKeyboard.layouts = [
                    "numeric",
                    "alphabetic",
                    "greek"
                ];
            }
        } catch (e) { /* Version-dependent, non-blocking */ }

        let debounceTimer = null;
        mf.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => analyzeFormula(mf.value), 400);
        });

        mf.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btn.click();
            }
        });

        // Tool nur scharfschalten, wenn MathLive erfolgreich geladen wurde
        btn.addEventListener("click", renderSolution);
        disableSelection();

    }).catch(() => {
        // Fallback: MathLive konnte nach 3 Sekunden nicht geladen werden
        const mf = document.getElementById("mathInput");
        
        // Dynamisch eine Fehlermeldung generieren (falls nicht im HTML vordefiniert)
        let errorMessages = document.getElementById("errorMessages");
        if (!errorMessages && mf && mf.parentElement) {
            errorMessages = document.createElement("div");
            errorMessages.style.color = "var(--error-color, #d32f2f)";
            errorMessages.style.marginTop = "10px";
            errorMessages.style.fontSize = "0.9em";
            mf.parentElement.appendChild(errorMessages);
        }

        if (errorMessages) {
            errorMessages.textContent = "Error: Math components could not be loaded. Please check your internet connection or disable your ad blocker.";
            errorMessages.style.display = "block";
        }

        if (mf) {
            mf.style.opacity = "0.5";
            mf.style.pointerEvents = "none";
        }
        
        if (typeof btn !== 'undefined' && btn) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
        }
    });
}); // Schließt die äußere Funktion (z.B. DOMContentLoaded), passend zum Ursprungscode