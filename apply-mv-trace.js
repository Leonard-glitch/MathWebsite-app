#!/usr/bin/env node
// ============================================================================
// Baut den temporären Diagnose-Trace in common-login.js ein (oder wieder aus).
//
//   node apply-mv-trace.js javaScript/Common/common-login.js            -> einbauen
//   node apply-mv-trace.js javaScript/Common/common-login.js --remove   -> ausbauen
//
// Voraussetzung: mv-trace-block.js liegt im selben Ordner wie dieses Skript.
//
// Sicherheitsnetz:
//   - bricht ab, OHNE die Datei zu ändern, wenn ein Anker nicht genau 1x gefunden wird
//   - prüft die Syntax des Ergebnisses, bevor geschrieben wird
//   - legt vor dem Einbauen <datei>.bak-mvtrace an
//   - "--remove" stellt den Originaltext Byte für Byte wieder her
// ============================================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const target = process.argv[2];
const remove = process.argv.includes('--remove');
if (!target) {
    console.error('Aufruf: node apply-mv-trace.js <pfad/zu/common-login.js> [--remove]');
    process.exit(1);
}

const BEGIN = '/* MV-TRACE-BEGIN */';
const END = '/* MV-TRACE-END */';
const LINE_MARK = '/* MV-TRACE-LINE */';

const source = fs.readFileSync(target, 'utf8');
const eol = source.includes('\r\n') ? '\r\n' : '\n';

function fail(msg) { console.error('ABBRUCH: ' + msg + ' – Datei wurde NICHT verändert.'); process.exit(2); }

function checkSyntax(code) {
    try { new vm.Script(code); } catch (e) { fail('Ergebnis hätte einen Syntaxfehler (' + e.message + ')'); }
}

// ── Ausbauen ────────────────────────────────────────────────────────────────
if (remove) {
    if (!source.includes(BEGIN)) fail('Es ist kein Trace eingebaut (Marker fehlt)');
    let out = source.replace(/^\/\* MV-TRACE-BEGIN \*\/[\s\S]*?\/\* MV-TRACE-END \*\/\r?\n/m, '');
    out = out.replace(/^[ \t]*window\.MV_TRACE && window\.MV_TRACE\.log\([^\r\n]*\/\* MV-TRACE-LINE \*\/\r?\n/m, '');
    if (out.includes('MV-TRACE')) fail('Es sind noch Trace-Reste übrig');
    checkSyntax(out);
    fs.writeFileSync(target, out);
    console.log('Trace ausgebaut: ' + target);
    process.exit(0);
}

// ── Einbauen ────────────────────────────────────────────────────────────────
if (source.includes(BEGIN) || source.includes(LINE_MARK)) fail('Trace ist bereits eingebaut');

const blockFile = fs.readFileSync(path.join(__dirname, 'mv-trace-block.js'), 'utf8');
const start = blockFile.indexOf('(function installTrace()');
if (start === -1) fail('mv-trace-block.js enthält installTrace() nicht');
const blockCode = blockFile.slice(start).trimEnd().replace(/\r?\n/g, eol);

// Anker 1: der pageshow-Listener (Block kommt direkt davor)
const pageshowRe = /^[ \t]*window\.addEventListener\('pageshow',\s*function\s*\(e\)\s*\{/gm;
const pageshowHits = [...source.matchAll(pageshowRe)];
if (pageshowHits.length !== 1) fail('pageshow-Listener wurde ' + pageshowHits.length + 'x gefunden (erwartet: 1)');

// Anker 2: `cache = fresh;` in hydrate() – erkennbar daran, dass persistMirror() und
// dispatchStateRestore() in den FOLGEZEILEN stehen (loginUser/registerUser haben es einzeilig)
const freshRe = /^([ \t]*)cache = fresh;\r?\n(?=[ \t]*persistMirror\(\);\r?\n[ \t]*dispatchStateRestore\(\);)/gm;
const freshHits = [...source.matchAll(freshRe)];
if (freshHits.length !== 1) fail('"cache = fresh;" in hydrate() wurde ' + freshHits.length + 'x gefunden (erwartet: 1)');

// Reihenfolge: erst die spätere Stelle ersetzen, damit die Indizes der früheren gültig bleiben
const pageshowIdx = pageshowHits[0].index;
const freshHit = freshHits[0];
const freshEnd = freshHit.index + freshHit[0].length;
const traceLine = `${freshHit[1]}window.MV_TRACE && window.MV_TRACE.log('cache = fresh (gerade gesetzt)'); ${LINE_MARK}${eol}`;

const edits = [
    { idx: pageshowIdx, text: `${BEGIN}${eol}${blockCode}${eol}${END}${eol}` },
    { idx: freshEnd, text: traceLine }
].sort((a, b) => b.idx - a.idx);

let out = source;
for (const e of edits) out = out.slice(0, e.idx) + e.text + out.slice(e.idx);

checkSyntax(out);
fs.writeFileSync(target + '.bak-mvtrace', source);
fs.writeFileSync(target, out);
console.log('Trace eingebaut: ' + target + '  (Backup: ' + target + '.bak-mvtrace)');
