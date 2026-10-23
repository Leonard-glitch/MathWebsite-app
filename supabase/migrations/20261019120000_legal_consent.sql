-- =============================================================================
-- Globomath – Zustimmung zu Privacy Policy, Terms of Service und Alter (14+)
--
-- Einfache Variante:
--   user_consents   : EINE Zeile pro Nutzer = aktueller Stand der Zustimmung
--                     (privacy_version/-accepted_at, terms_version/-accepted_at, age_confirmed_at)
--   consent_history : einfache Liste früherer Zustimmungen (wird automatisch befüllt)
--   current_legal_versions() : die aktuellen Versionen - NUR hier festgelegt, nie vom Client
--
-- Ablauf:
--   Registrierung  -> Trigger auf auth.users lehnt ab, wenn die drei Zustimmungs-Flags
--                     nicht exakt true sind, und speichert die Zustimmung mit Server-Version
--                     und Server-Zeit. Das greift auch bei direkten Aufrufen von /auth/v1/signup.
--   Neue Version   -> Nutzer sieht einen Dialog, get_my_consent_status() / accept_legal_documents().
--
-- Clients haben auf beide Tabellen KEINEN direkten Zugriff, nur auf die zwei Funktionen.
-- Gespeichert werden keine IP-Adresse und kein User-Agent.
-- Der bestehende Trigger handle_new_user() wird nicht verändert.
--
-- Die Migration ist wiederholbar (idempotent): erneutes Ausführen lässt vorhandene Daten stehen.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 0. Aufräumen, falls die erste (komplexere) Variante dieser Migration schon lief.
--    Auf einer frischen Datenbank passiert hier nichts. Gelöscht werden nur die
--    Objekte der ersten Variante (Test-Zustimmungen gehen verloren; betroffene Nutzer
--    bestätigen beim nächsten Login einfach erneut).
-- -----------------------------------------------------------------------------
do $$
begin
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'user_consents'
                 and column_name = 'doc_type') then
        drop table public.user_consents cascade;
    end if;
end $$;

drop table if exists public.legal_documents cascade;
drop function if exists public.publish_legal_document(text, text, text, timestamptz);
drop function if exists public.accept_legal_documents(boolean, boolean, boolean, text, text);
drop function if exists public.user_consents_block_update();
drop function if exists public.user_consents_block_delete();
drop function if exists public.legal_documents_guard();

-- -----------------------------------------------------------------------------
-- 1. Aktuelle Versionen (einzige Quelle der Wahrheit)
--    Neue Version veröffentlichen = diese Funktion per neuer Migration ersetzen,
--    z. B. select '1.1'::text, '1.0'::text. Die Version muss zum Text
--    "Version x.y" in den HTML-Seiten passen.
-- -----------------------------------------------------------------------------
create or replace function public.current_legal_versions()
returns table (privacy_version text, terms_version text)
language sql
stable
set search_path = ''
as $$
    select '1.0'::text, '1.0'::text
$$;

revoke all on function public.current_legal_versions() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. Aktueller Stand pro Nutzer
--    timestamptz wird von Postgres intern als UTC gespeichert.
-- -----------------------------------------------------------------------------
create table if not exists public.user_consents (
    user_id             uuid        primary key references auth.users (id) on delete cascade,
    privacy_version     text        not null,
    privacy_accepted_at timestamptz not null,
    terms_version       text        not null,
    terms_accepted_at   timestamptz not null,
    age_confirmed_at    timestamptz not null
);

-- RLS an, bewusst OHNE Policies, und keine Tabellenrechte für Clients:
-- gelesen/geschrieben wird nur über die Funktionen unten (und vom Betreiber im Dashboard).
alter table public.user_consents enable row level security;
revoke all on public.user_consents from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Einfache Historie (wird per Trigger befüllt, siehe unten)
-- -----------------------------------------------------------------------------
create table if not exists public.consent_history (
    id          bigint      generated always as identity primary key,
    user_id     uuid        not null references auth.users (id) on delete cascade,
    document    text        not null check (document in ('privacy', 'terms')),
    version     text        not null,
    accepted_at timestamptz not null
);

create index if not exists consent_history_user_id_idx on public.consent_history (user_id);

alter table public.consent_history enable row level security;
revoke all on public.consent_history from anon, authenticated;

create or replace function public.log_consent_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' or new.privacy_version is distinct from old.privacy_version then
        insert into public.consent_history (user_id, document, version, accepted_at)
        values (new.user_id, 'privacy', new.privacy_version, new.privacy_accepted_at);
    end if;
    if tg_op = 'INSERT' or new.terms_version is distinct from old.terms_version then
        insert into public.consent_history (user_id, document, version, accepted_at)
        values (new.user_id, 'terms', new.terms_version, new.terms_accepted_at);
    end if;
    return null;
end;
$$;

revoke all on function public.log_consent_history() from public, anon, authenticated;

drop trigger if exists user_consents_log on public.user_consents;
create trigger user_consents_log
    after insert or update on public.user_consents
    for each row execute function public.log_consent_history();

-- -----------------------------------------------------------------------------
-- 4. Registrierung: Zustimmung erzwingen und speichern
--    AFTER INSERT auf auth.users: wirft die Funktion einen Fehler, wird der Insert
--    zurückgerollt und signUp() scheitert (GoTrue: "Database error saving new user").
--    Gelesen werden NUR die drei Flags; alles andere im user_metadata (Versionen,
--    Zeitstempel, ...) wird ignoriert.
--
--    WICHTIG: Der Trigger läuft nur, wenn ein NEUER Nutzer angelegt wird. Registriert
--    sich jemand erneut mit einer E-Mail, deren Konto noch unbestätigt ist, legt Supabase
--    keinen neuen Nutzer an und ändert weder Metadaten noch Passwort - es schickt nur den
--    Bestätigungslink erneut. Es gilt dann die Zustimmung der ersten Registrierung.
-- -----------------------------------------------------------------------------
create or replace function public.record_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v record;
begin
    if (new.raw_user_meta_data -> 'consent_privacy') is distinct from 'true'::jsonb
       or (new.raw_user_meta_data -> 'consent_age')   is distinct from 'true'::jsonb
       or (new.raw_user_meta_data -> 'consent_terms') is distinct from 'true'::jsonb then
        raise exception 'consent_required: privacy policy, age confirmation and terms of service must be accepted'
            using errcode = 'check_violation';
    end if;

    select * into v from public.current_legal_versions();

    insert into public.user_consents
        (user_id, privacy_version, privacy_accepted_at, terms_version, terms_accepted_at, age_confirmed_at)
    values
        (new.id, v.privacy_version, now(), v.terms_version, now(), now());

    return new;
end;
$$;

revoke all on function public.record_signup_consent() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_record_consent on auth.users;
create trigger on_auth_user_created_record_consent
    after insert on auth.users
    for each row execute function public.record_signup_consent();

-- -----------------------------------------------------------------------------
-- 5. Status + Zustimmung zu neuen Versionen (eingeloggte Nutzer)
--    Der Nutzer wird nur aus dem JWT bestimmt (kein user_id-Parameter).
-- -----------------------------------------------------------------------------
create or replace function public.get_my_consent_status()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid       uuid := auth.uid();
    v           record;
    c           public.user_consents%rowtype;
    v_has_row   boolean;
    v_privacy   boolean;
    v_terms     boolean;
begin
    if v_uid is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    select * into v from public.current_legal_versions();
    select * into c from public.user_consents where user_id = v_uid;
    v_has_row := found;

    v_privacy := v_has_row and c.privacy_version is not distinct from v.privacy_version;
    v_terms   := v_has_row and c.terms_version   is not distinct from v.terms_version;

    return jsonb_build_object(
        'needs_acceptance',       not (v_privacy and v_terms),
        -- Die Altersbestätigung wird nur einmal pro Nutzer verlangt (solange es noch keine Zeile gibt).
        'needs_age_confirmation', not v_has_row,
        'documents', jsonb_build_array(
            jsonb_build_object('doc_type', 'privacy_policy',   'version', v.privacy_version, 'accepted', v_privacy),
            jsonb_build_object('doc_type', 'terms_of_service', 'version', v.terms_version,   'accepted', v_terms)
        )
    );
end;
$$;

revoke all on function public.get_my_consent_status() from public, anon;
grant execute on function public.get_my_consent_status() to authenticated;

-- Der Aufruf selbst ist die Zustimmung. Version und Zeit setzt der Server.
-- Es müssen genau die Zustimmungen gegeben werden, die noch offen sind.
create or replace function public.accept_legal_documents(
    p_privacy boolean default false,
    p_terms   boolean default false,
    p_age     boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid        uuid := auth.uid();
    v            record;
    c            public.user_consents%rowtype;
    v_has_row    boolean;
    v_privacy_open boolean;
    v_terms_open   boolean;
    v_now        timestamptz := now();
begin
    if v_uid is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    select * into v from public.current_legal_versions();
    select * into c from public.user_consents where user_id = v_uid for update;
    v_has_row := found;

    v_privacy_open := not v_has_row or c.privacy_version is distinct from v.privacy_version;
    v_terms_open   := not v_has_row or c.terms_version   is distinct from v.terms_version;

    if v_privacy_open and not coalesce(p_privacy, false) then
        raise exception 'consent_required: privacy policy must be accepted' using errcode = 'check_violation';
    end if;
    if v_terms_open and not coalesce(p_terms, false) then
        raise exception 'consent_required: terms of service must be accepted' using errcode = 'check_violation';
    end if;
    if not v_has_row and not coalesce(p_age, false) then
        raise exception 'age_confirmation_required' using errcode = 'check_violation';
    end if;

    if not v_has_row then
        insert into public.user_consents
            (user_id, privacy_version, privacy_accepted_at, terms_version, terms_accepted_at, age_confirmed_at)
        values
            (v_uid, v.privacy_version, v_now, v.terms_version, v_now, v_now)
        on conflict (user_id) do nothing;   -- parallele Anfrage war schneller: deren Werte gelten
    elsif v_privacy_open or v_terms_open then
        update public.user_consents set
            privacy_version     = case when v_privacy_open then v.privacy_version else privacy_version end,
            privacy_accepted_at = case when v_privacy_open then v_now else privacy_accepted_at end,
            terms_version       = case when v_terms_open then v.terms_version else terms_version end,
            terms_accepted_at   = case when v_terms_open then v_now else terms_accepted_at end
        where user_id = v_uid;
    end if;

    return public.get_my_consent_status();
end;
$$;

revoke all on function public.accept_legal_documents(boolean, boolean, boolean) from public, anon;
grant execute on function public.accept_legal_documents(boolean, boolean, boolean) to authenticated;

-- Zusätzliche Absicherung: PostgREST soll die neuen Funktionen sofort kennen (Supabase lädt den
-- Schema-Cache nach DDL meist selbst nach). Die Benachrichtigung wird beim commit zugestellt.
notify pgrst, 'reload schema';

commit;

-- =============================================================================
-- Kontrollabfragen (nach dem Ausführen):
--   select * from public.current_legal_versions();
--   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
--
-- Nachweis für einen Nutzer:
--   select u.email, u.email_confirmed_at at time zone 'UTC' as email_confirmed_utc,
--          c.privacy_version, c.privacy_accepted_at at time zone 'UTC' as privacy_utc,
--          c.terms_version,   c.terms_accepted_at   at time zone 'UTC' as terms_utc,
--          c.age_confirmed_at at time zone 'UTC' as age_utc
--     from auth.users u join public.user_consents c on c.user_id = u.id
--    where u.email = 'nutzer@example.com';
--   select * from public.consent_history where user_id = '<uuid>' order by accepted_at;
--
-- Rollback (nur falls nötig):
--   drop trigger if exists on_auth_user_created_record_consent on auth.users;
--   drop function if exists public.record_signup_consent();
--   drop function if exists public.accept_legal_documents(boolean, boolean, boolean);
--   drop function if exists public.get_my_consent_status();
--   drop table if exists public.consent_history;
--   drop table if exists public.user_consents;
--   drop function if exists public.log_consent_history();
--   drop function if exists public.current_legal_versions();
--   notify pgrst, 'reload schema';
-- =============================================================================
