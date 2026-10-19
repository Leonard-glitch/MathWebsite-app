# Zustimmungs-Protokollierung (Privacy Policy / Terms of Service)

Dieser Ordner wird **nicht** öffentlich ausgeliefert (`.assetsignore`). Er enthält nur die Datenbank-Migration und ein Hilfsskript.

## Wie es funktioniert (Kurzfassung)

| Baustein | Aufgabe |
|---|---|
| `legal_documents` | Welche Version ist aktuell? (+ SHA-256 des Textes). Schreiben nur der Betreiber. |
| `user_consents` | Append-only-Historie: *Nutzer X hat Dokument Y in Version Z am Zeitpunkt T akzeptiert.* Kein Schreibzugriff für Clients. |
| Trigger `record_signup_consent` auf `auth.users` | Lehnt jede Registrierung ohne `consent_privacy:true` und `consent_terms:true` ab und schreibt die Zustimmung mit **Server**-Version, **Server**-Zeit und **Server**-Hash. Gilt auch für Aufrufe direkt an `/auth/v1/signup`. |
| RPC `get_my_consent_status` / `accept_legal_documents` | Re-Consent für Bestandsnutzer und neue Versionen. |
| RPC `publish_legal_document` | Neue Version veröffentlichen (nur Betreiber, nicht für Clients aufrufbar). |

## Einspielen (Reihenfolge wichtig)

1. **Zuerst das Frontend deployen** (`register.js`, `common-login.js`, Rechtstexte). Das Frontend funktioniert auch ohne Migration (der Re-Consent-Dialog bleibt dann einfach aus).
2. **Dann** den Inhalt von `migrations/20261018120000_legal_consent_tracking.sql` im Supabase-Dashboard unter *SQL Editor* ausführen.
   - Ab diesem Moment scheitert jede Registrierung ohne Zustimmungs-Flags. Ein Browser, der noch das alte `common-login.js` aus dem Cache hat, kann sich deshalb kurz nicht registrieren, bis der Cache erneuert ist.
3. Kontrolle:
   ```sql
   select * from public.legal_documents;
   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
   ```
   Erwartet: zwei Zeilen `1.0` (beide `is_current`) und ein neuer Trigger `on_auth_user_created_record_consent` neben dem bestehenden `handle_new_user`-Trigger.
4. Test: neuen Account registrieren, dann
   ```sql
   select doc_type, doc_version, accepted_at at time zone 'UTC' as accepted_utc, source, age_confirmed
   from public.user_consents order by accepted_at desc limit 4;
   ```

## Vor dem Livegang (einmalig)

- Rechtstexte finalisieren (DRAFT-Hinweis und alle `[CONFIRM]`-Marker entfernen).
- `git tag privacy-v1.0` und `git tag terms-v1.0` setzen.
- `node supabase/tools/legal-hash.mjs` ausführen und die ausgegebenen `update ...`-Statements im SQL Editor ausführen. Ein einmal gesetzter Hash kann nicht mehr geändert werden.
- Test-Accounts, die vor diesem Schritt entstanden sind, haben `document_sha256 = NULL` – für echte Nutzer irrelevant.

## Neue Version eines Dokuments veröffentlichen

1. Text ändern, "Version x.y" und Datum im Text anheben, committen, taggen.
2. `node supabase/tools/legal-hash.mjs` → SQL `select public.publish_legal_document('<doc_type>', '<x.y>', '<sha256>');` im SQL Editor ausführen.
3. Ab sofort: neue Registrierungen bekommen automatisch die neue Version; eingeloggte Bestandsnutzer sehen beim nächsten Laden (spätestens nach ca. 15 Min.) den Bestätigungs-Dialog. Bei einer neuen Privacy Policy wird die 14+-Bestätigung nicht erneut verlangt, wenn sie schon vorliegt.

## Nachweis im Streitfall

```sql
select u.email,
       u.created_at         at time zone 'UTC' as registered_utc,
       u.email_confirmed_at at time zone 'UTC' as email_confirmed_utc,
       c.doc_type, c.doc_version,
       c.accepted_at        at time zone 'UTC' as accepted_utc,
       c.document_sha256, c.source, c.age_confirmed
from auth.users u
join public.user_consents c on c.user_id = u.id
where u.email = 'nutzer@example.com'
order by c.accepted_at;
```

Beweiskette: Zeitpunkt + Version (Server) → Hash und Git-Tag (exakter Wortlaut) → bestätigte E-Mail-Adresse (Double-Opt-in).

## Hinweise

- **Nutzer manuell anlegen** (Dashboard "Add user" oder Admin-API) scheitert absichtlich, weil keine Zustimmung vorliegt. Über die Admin-API `createUser` mit `user_metadata: { consent_privacy: true, consent_terms: true }` nur anlegen, wenn die Person tatsächlich zugestimmt hat.
- **Andere Login-Arten** (Google, Apple, …): Der Trigger erwartet die Flags bei *jeder* Registrierung. Beim Hinzufügen eines OAuth-Logins muss der Registrierungsweg angepasst werden.
- **Konto löschen** entfernt auch die Zustimmungs-Datensätze (Cascade) – so steht es in der Privacy Policy. Sollen sie zur Rechtsverteidigung länger bleiben, muss das in der Privacy Policy stehen und der Fremdschlüssel angepasst werden (rechtliche Prüfung).
- **Rollback**: siehe Kommentar am Ende der Migration.
