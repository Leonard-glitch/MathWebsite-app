#!/usr/bin/env node
// Berechnet die SHA-256-Prüfsumme der Rechtstexte und gibt das passende SQL aus.
//
//   node supabase/tools/legal-hash.mjs            -> Prüfsummen + SQL für die aktuellen Versionen
//
// Gehasht wird der Inhalt der HTML-Datei mit vereinheitlichten Zeilenenden (CRLF -> LF),
// damit Windows- und Linux-Checkouts denselben Wert ergeben.
//
// ABLAUF bei jeder neuen Version (und einmalig vor dem Livegang):
//   1. Text final machen (DRAFT-Hinweis und [CONFIRM]-Marker entfernen, "Version"/Datum im Text anheben).
//   2. Änderung committen und taggen:  git tag privacy-v1.1   /   git tag terms-v1.1
//      (der Tag macht den exakten Wortlaut später rekonstruierbar).
//   3. Dieses Skript ausführen und das SQL im Supabase SQL Editor ausführen.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const docs = [
  { type: 'privacy_policy',   file: 'html/Privacypolicy.html' },
  { type: 'terms_of_service', file: 'html/Terms-of-Service.html' },
];

for (const d of docs) {
  const text = readFileSync(join(root, d.file), 'utf8').replace(/\r\n/g, '\n');
  const sha = createHash('sha256').update(text, 'utf8').digest('hex');
  const version = (text.match(/Version\s+(\d+(?:\.\d+)*)/) || [])[1] || '???';
  console.log(`-- ${d.file}  (Version laut Seite: ${version})  sha256 = ${sha}`);
  console.log(`-- Erstmals setzen (Version existiert schon, Hash noch NULL):`);
  console.log(`update public.legal_documents set content_sha256 = '${sha}'`);
  console.log(`  where doc_type = '${d.type}' and version = '${version}';`);
  console.log(`-- ODER neue Version veröffentlichen (setzt die bisherige auf nicht-aktuell):`);
  console.log(`-- select public.publish_legal_document('${d.type}', '${version}', '${sha}');`);
  console.log('');
}
