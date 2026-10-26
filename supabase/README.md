# Zustimmung zu Privacy Policy, Terms of Service und Alter (14+)

Dieser Ordner wird **nicht** öffentlich ausgeliefert (`.assetsignore`). Er enthält die Datenbank-Migration.

## Was gespeichert wird

Tabelle `user_consents`, eine Zeile pro Nutzer:

| Spalte | Inhalt |
|---|---|
| `privacy_version`, `privacy_accepted_at` | Version der Privacy Policy und Zeitpunkt der Zustimmung (UTC) |
| `terms_version`, `terms_accepted_at` | Version der Terms of Service und Zeitpunkt der Zustimmung (UTC) |
| `age_confirmed_at` | Zeitpunkt der Bestätigung "mindestens 14 Jahre alt" |

Tabelle `consent_history`: Wird automatisch befüllt und enthält jede akzeptierte Version (`privacy`/`terms`, Version, Zeitpunkt), also auch ältere.

Nicht gespeichert: IP-Adresse, User-Agent.

## Wie es abgesichert ist

- Der Browser schickt bei `signUp` nur drei Wahrheitswerte (`consent_privacy`, `consent_age`, `consent_terms`). Ein Datenbank-Trigger auf `auth.users` lehnt die Registrierung ab, wenn eines davon nicht exakt `true` ist. Das gilt auch für Aufrufe, die an der Website vorbei direkt an Supabase gehen.
- Versionen und Zeitpunkte setzt ausschließlich die Datenbank. Die aktuellen Versionen stehen in der Funktion `current_legal_versions()`;Clients können die Funktion nicht aufrufen (die Versionen sehen sie nur über `get_my_consent_status()`).
- Clients haben auf `user_consents` und `consent_history` keinerlei Zugriff (kein Lesen, Schreiben, Löschen). Sie können nur `get_my_consent_status()` und `accept_legal_documents()` aufrufen, und diese wirken nur auf den eigenen Nutzer (aus dem Login, nicht aus einem Parameter).
- Das spätere Ändern von `user_metadata` (`supabase.auth.updateUser`) hat keinen Einfluss auf das Gespeicherte.
- Wer im Dashboard als Betreiber (`service_role`/`postgres`) arbeitet, kann Zeilen ändern. Das ist bewusst nicht gesperrt.

## Wichtig: erneute Registrierung mit unbestätigter E-Mail

Registriert sich jemand mit einer E-Mail erneut, deren Konto noch **nicht bestätigt** ist, legt Supabase **keinen neuen Nutzer** an und ändert **weder Username noch Passwort noch Zustimmung**. Es wird nur der Bestätigungslink erneut gesendet. Es gelten also Username, Passwort und Zustimmung der **ersten** Registrierung.

- Die Zustimmung wird deshalb nur beim Anlegen des Nutzers (Trigger) gespeichert, nie über einen zweiten `signUp`-Versuch.
- Wurde zwischen erster und zweiter Registrierung eine neue Version veröffentlicht, ist beim ersten Login die gespeicherte Version veraltet. Der Nutzer wird dann wie bei jeder neuen Version um Zustimmung gebeten.
- Die Seite `verify-email.html` zeigt in diesem Fall einen Hinweis (best effort, siehe `registerUser()`).

## Einspielen (Reihenfolge wichtig)

1. **Zuerst das Frontend deployen** (Branch mergen). Es funktioniert auch ohne Migration, der Dialog für neue Versionen bleibt dann einfach aus.
2. **Dann** den Inhalt von `migrations/20261019120000_legal_consent.sql` im Supabase-Dashboard unter *SQL Editor* ausführen.
   - Ab diesem Moment scheitert jede Registrierung ohne die drei Flags. Ein Browser mit altem, noch gecachtem JavaScript kann sich kurz nicht registrieren.
   - Die Migration räumt die erste, komplexere Variante (`legal_documents`, Mehrzeilen-`user_consents`) auf, falls sie schon eingespielt wurde, und lässt vorhandene Daten der neuen Variante bei erneutem Ausführen stehen.
3. Kontrolle:
   ```sql
   select * from public.current_legal_versions();
   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
   ```
   Erwartet: `1.0 | 1.0` und der neue Trigger `on_auth_user_created_record_consent` neben dem bestehenden `handle_new_user`-Trigger.
4. Test: neuen Account registrieren, dann
   ```sql
   select * from public.user_consents order by privacy_accepted_at desc limit 3;
   ```

**Bestehende Nutzer** (z. B. Test-Accounts) haben noch keine Zustimmung gespeichert und bestätigen sie beim nächsten Login in einem Dialog.

## Neue Version eines Dokuments

Nutzer mind. 14 Tage vorher per E-Mail informieren (ToS 15.2), Text und Migration erst zum Stichtag ausspielen.

1. Text ändern, "Version x.y" und Datum im Text anheben.
2. Neue Migration anlegen, die `public.current_legal_versions()` ersetzt, z. B. Terms 1.1:
   ```sql
   create or replace function public.current_legal_versions()
   returns table (privacy_version text, terms_version text)
   language sql stable set search_path = ''
   as $$ select '1.0'::text, '1.1'::text $$;
   ```
3. Frontend und Migration ausspielen. Eingeloggte Nutzer sehen beim nächsten Seitenaufruf, sobald der 15-Minuten-Merker des Tabs abgelaufen ist. Bereits geöffnete Seiten ohne Neuladen zeigen den Dialog nicht. den Bestätigungs-Dialog für das geänderte Dokument. Die 14+-Bestätigung wird nicht erneut verlangt. Die bisherige Zustimmung bleibt in `consent_history`.

## Nachweis im Streitfall

```sql
select u.email, u.email_confirmed_at at time zone 'UTC' as email_confirmed_utc,
       c.privacy_version, c.privacy_accepted_at at time zone 'UTC' as privacy_utc,
       c.terms_version,   c.terms_accepted_at   at time zone 'UTC' as terms_utc,
       c.age_confirmed_at at time zone 'UTC' as age_utc
from auth.users u join public.user_consents c on c.user_id = u.id
where u.email = 'nutzer@example.com';

select * from public.consent_history where user_id = '<uuid>' order by accepted_at;
```

## Hinweise

- **Nutzer manuell anlegen** (Dashboard "Add user" oder Admin-API) scheitert absichtlich, weil keine Zustimmung vorliegt. Über die Admin-API `createUser` nur mit `user_metadata: { consent_privacy: true, consent_age: true, consent_terms: true }` anlegen, wenn die Person tatsächlich zugestimmt hat.
- **Google/OAuth-Login (später)**: Der Trigger verlangt die drei Flags bei *jeder* Neuanlage eines Nutzers, ein OAuth-Login würde also mit "Database error saving new user" scheitern. Vor dem Einbau ist eine kleine Anpassung nötig: Der Trigger `record_signup_consent()` überspringt dann **ausdrücklich genannte** Provider (`new.raw_app_meta_data ->> 'provider' in ('google', ...)`, das setzt Supabase selbst, der Browser kann es nicht beeinflussen), alle anderen bleiben abgelehnt. Die Zustimmung kommt dann beim ersten Login über den vorhandenen Dialog (`get_my_consent_status()` meldet ohne Zeile alles offen, `accept_legal_documents()` legt die Zeile an). Zusätzlich braucht `handle_new_user` einen Weg für den Username, den Google nicht mitliefert.
- **Konto löschen** entfernt auch `user_consents` und `consent_history` (Cascade), so steht es in der Privacy Policy. Eine längere Aufbewahrung ist vorerst nicht vorgesehen und wird vor einer Monetarisierung (Pro-Version) neu bewertet.
- **Neue Version = nur UI-Sperre**: Der Dialog sperrt die Oberfläche, der Server blockiert nichts. Das genügt, solange es nichts rechtlich oder finanziell Relevantes gibt. Sobald es Checkout, Pro-Funktionen oder Bezahlvorgänge gibt, dort serverseitig prüfen, ob `user_consents` zu `current_legal_versions()` passt.
- **Rollback**: siehe Kommentar am Ende der Migration.
