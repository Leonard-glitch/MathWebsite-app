-- =============================================================================
-- Globomath – serverseitige Protokollierung der Zustimmung zu Privacy Policy
-- und Terms of Service (inkl. Alters-Bestätigung 14+)
--
-- Architektur:
--   legal_documents  : welche Version ist aktuell (nur der Server schreibt)
--   user_consents    : append-only Historie der Zustimmungen (nur der Server schreibt)
--   Trigger auf auth.users : lehnt Registrierungen OHNE Zustimmung ab und
--                            schreibt die Zustimmung mit SERVER-Version/-Zeit
--   RPC get_my_consent_status / accept_legal_documents : Re-Consent bei neuen
--                            Versionen und für Bestandsnutzer
--
-- Der Client liefert ausschließlich zwei Wahrheitswerte (Checkbox gesetzt).
-- Versionen, Zeitstempel und Dokument-Hash stammen NIE vom Client.
--
-- Der bestehende Trigger handle_new_user() wird bewusst NICHT verändert.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. legal_documents – Versionsverzeichnis
-- -----------------------------------------------------------------------------
create table if not exists public.legal_documents (
    doc_type       text        not null check (doc_type in ('privacy_policy', 'terms_of_service')),
    version        text        not null check (length(version) between 1 and 32),
    effective_at   timestamptz not null default now(),
    content_sha256 text        check (content_sha256 ~ '^[0-9a-f]{64}$'),
    is_current     boolean     not null default false,
    created_at     timestamptz not null default now(),
    primary key (doc_type, version)
);

-- Pro Dokumenttyp darf höchstens EINE Version aktuell sein.
create unique index if not exists legal_documents_one_current_per_type
    on public.legal_documents (doc_type) where is_current;

alter table public.legal_documents enable row level security;

drop policy if exists legal_documents_public_read on public.legal_documents;
create policy legal_documents_public_read on public.legal_documents
    for select to anon, authenticated using (true);

revoke all on public.legal_documents from anon, authenticated;
grant select on public.legal_documents to anon, authenticated;

-- Hash darf einmalig gesetzt, danach nie mehr geändert werden; Typ/Version sind fix.
create or replace function public.legal_documents_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.doc_type is distinct from old.doc_type or new.version is distinct from old.version then
        raise exception 'legal_documents: doc_type and version are immutable';
    end if;
    if old.content_sha256 is not null and new.content_sha256 is distinct from old.content_sha256 then
        raise exception 'legal_documents: content_sha256 must not be changed once set';
    end if;
    return new;
end;
$$;

drop trigger if exists legal_documents_guard on public.legal_documents;
create trigger legal_documents_guard
    before update on public.legal_documents
    for each row execute function public.legal_documents_guard();

-- -----------------------------------------------------------------------------
-- 2. user_consents – append-only Historie
--    Eine Zeile = "diese Version wurde zu diesem Zeitpunkt akzeptiert".
--    Das Fehlen einer Zeile bedeutet "nicht akzeptiert".
-- -----------------------------------------------------------------------------
create table if not exists public.user_consents (
    id              uuid        primary key default gen_random_uuid(),
    user_id         uuid        not null references auth.users (id) on delete cascade,
    doc_type        text        not null,
    doc_version     text        not null,
    accepted_at     timestamptz not null default now(),   -- timestamptz wird intern als UTC gespeichert
    document_sha256 text,                                 -- Kopie des Hashs zum Zeitpunkt der Zustimmung
    source          text        not null check (source in ('signup', 'reconsent')),
    age_confirmed   boolean,                              -- true, wenn die 14+-Bestätigung Teil der Zustimmung war
    constraint user_consents_document_fk
        foreign key (doc_type, doc_version) references public.legal_documents (doc_type, version),
    constraint user_consents_once_per_version
        unique (user_id, doc_type, doc_version)
);

alter table public.user_consents enable row level security;

drop policy if exists user_consents_select_own on public.user_consents;
create policy user_consents_select_own on public.user_consents
    for select to authenticated using (user_id = (select auth.uid()));

-- Keine INSERT/UPDATE/DELETE-Policies und keine Tabellenrechte für Clients.
revoke all on public.user_consents from anon, authenticated;
grant select on public.user_consents to authenticated;

-- Append-only auch gegen Rollen, die RLS umgehen (service_role, versehentliche
-- Dashboard-Edits): UPDATE und TRUNCATE sind generell gesperrt, DELETE nur dann
-- erlaubt, wenn der Nutzer selbst nicht mehr existiert (= Cascade bei Kontolöschung,
-- siehe Privacy Policy Abschnitt 7: beim Löschen werden alle Kontodaten entfernt).
-- Ein Superuser kann Trigger weiterhin bewusst deaktivieren - das ist gewollt.
create or replace function public.user_consents_block_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    raise exception 'user_consents is append-only';
end;
$$;

create or replace function public.user_consents_block_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if exists (select 1 from auth.users u where u.id = old.user_id) then
        raise exception 'user_consents is append-only: rows are only removed together with the account';
    end if;
    return old;
end;
$$;

drop trigger if exists user_consents_no_update on public.user_consents;
create trigger user_consents_no_update
    before update on public.user_consents
    for each row execute function public.user_consents_block_update();

drop trigger if exists user_consents_no_delete on public.user_consents;
create trigger user_consents_no_delete
    before delete on public.user_consents
    for each row execute function public.user_consents_block_delete();

drop trigger if exists user_consents_no_truncate on public.user_consents;
create trigger user_consents_no_truncate
    before truncate on public.user_consents
    for each statement execute function public.user_consents_block_update();

revoke all on function public.user_consents_block_update() from public, anon, authenticated;
revoke all on function public.user_consents_block_delete() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Registrierung: Zustimmung erzwingen und protokollieren
--    AFTER INSERT: schlägt die Funktion fehl, wird der INSERT in auth.users
--    zurückgerollt und signUp() scheitert (GoTrue: "Database error saving new user").
--    Gelesen werden NUR die beiden booleschen Flags; alles andere im
--    user_metadata (Versionen, Zeitstempel, ...) wird ignoriert.
-- -----------------------------------------------------------------------------
create or replace function public.record_signup_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_privacy public.legal_documents%rowtype;
    v_terms   public.legal_documents%rowtype;
    v_now     timestamptz := now();
begin
    if (new.raw_user_meta_data -> 'consent_privacy') is distinct from 'true'::jsonb
       or (new.raw_user_meta_data -> 'consent_terms') is distinct from 'true'::jsonb then
        raise exception 'consent_required: privacy policy and terms of service must be accepted'
            using errcode = 'check_violation';
    end if;

    select * into v_privacy from public.legal_documents
        where doc_type = 'privacy_policy' and is_current;
    select * into v_terms from public.legal_documents
        where doc_type = 'terms_of_service' and is_current;

    if v_privacy.version is null or v_terms.version is null then
        raise exception 'no_current_legal_documents: current legal document versions are not configured'
            using errcode = 'check_violation';
    end if;

    insert into public.user_consents
        (user_id, doc_type, doc_version, accepted_at, document_sha256, source, age_confirmed)
    values
        (new.id, v_privacy.doc_type, v_privacy.version, v_now, v_privacy.content_sha256, 'signup', true),
        (new.id, v_terms.doc_type,   v_terms.version,   v_now, v_terms.content_sha256,   'signup', null);

    return new;
end;
$$;

revoke all on function public.record_signup_consent() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_record_consent on auth.users;
create trigger on_auth_user_created_record_consent
    after insert on auth.users
    for each row execute function public.record_signup_consent();

-- -----------------------------------------------------------------------------
-- 4. Status + Re-Consent (Bestandsnutzer, neue Versionen)
-- -----------------------------------------------------------------------------
create or replace function public.get_my_consent_status()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
    with docs as (
        select d.doc_type, d.version,
               exists (
                   select 1 from public.user_consents c
                   where c.user_id = (select auth.uid())
                     and c.doc_type = d.doc_type
                     and c.doc_version = d.version
               ) as accepted
        from public.legal_documents d
        where d.is_current
    )
    select jsonb_build_object(
        'needs_acceptance', coalesce(bool_or(not accepted), false),
        'needs_age_confirmation',
            coalesce(bool_or(doc_type = 'privacy_policy' and not accepted), false)
            and not exists (
                select 1 from public.user_consents c
                where c.user_id = (select auth.uid()) and c.age_confirmed is true
            ),
        'documents', coalesce(
            jsonb_agg(jsonb_build_object('doc_type', doc_type, 'version', version, 'accepted', accepted)
                      order by doc_type),
            '[]'::jsonb)
    )
    from docs;
$$;

revoke all on function public.get_my_consent_status() from public, anon;
grant execute on function public.get_my_consent_status() to authenticated;

-- Der Aufruf selbst ist die Zustimmung. Der Nutzer wird ausschließlich aus dem
-- JWT bestimmt (kein user_id-Parameter), Version/Zeit/Hash setzt der Server.
-- Für Dokumente, deren aktuelle Version bereits akzeptiert ist, wird nichts geschrieben.
--
-- p_privacy_version / p_terms_version sind KEINE Eingabe für die gespeicherte
-- Version, sondern nur eine Prüfung ("ich habe Version X gesehen"): weicht sie von
-- der aktuellen Serverversion ab, wird abgelehnt (document_version_changed), statt
-- stillschweigend eine Version zu protokollieren, die der Nutzer nie gesehen hat
-- (veralteter Tab, neue Version zwischenzeitlich veröffentlicht).
create or replace function public.accept_legal_documents(
    p_privacy         boolean default false,
    p_terms           boolean default false,
    p_age_confirmed   boolean default false,
    p_privacy_version text    default null,
    p_terms_version   text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid       uuid := auth.uid();
    v_doc       public.legal_documents%rowtype;
    v_needs_age boolean;
    v_now       timestamptz := now();
    v_seen      text;
begin
    if v_uid is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    -- Alters-Bestätigung nötig: Datenschutzerklärung steht zur Annahme an
    -- UND für diesen Nutzer existiert noch keine 14+-Bestätigung.
    v_needs_age :=
        exists (
            select 1 from public.legal_documents d
            where d.is_current and d.doc_type = 'privacy_policy'
              and not exists (
                  select 1 from public.user_consents c
                  where c.user_id = v_uid and c.doc_type = d.doc_type and c.doc_version = d.version
              )
        )
        and not exists (
            select 1 from public.user_consents c
            where c.user_id = v_uid and c.age_confirmed is true
        );

    for v_doc in
        select * from public.legal_documents where is_current order by doc_type
    loop
        if exists (
            select 1 from public.user_consents c
            where c.user_id = v_uid and c.doc_type = v_doc.doc_type and c.doc_version = v_doc.version
        ) then
            continue;
        end if;

        if (v_doc.doc_type = 'privacy_policy'   and not coalesce(p_privacy, false))
           or (v_doc.doc_type = 'terms_of_service' and not coalesce(p_terms, false)) then
            raise exception 'consent_required: % must be accepted', v_doc.doc_type
                using errcode = 'check_violation';
        end if;

        v_seen := case v_doc.doc_type when 'privacy_policy' then p_privacy_version
                                      else p_terms_version end;
        if v_seen is not null and v_seen is distinct from v_doc.version then
            raise exception 'document_version_changed: % is now version %', v_doc.doc_type, v_doc.version
                using errcode = 'check_violation';
        end if;

        if v_doc.doc_type = 'privacy_policy' and v_needs_age and not coalesce(p_age_confirmed, false) then
            raise exception 'age_confirmation_required' using errcode = 'check_violation';
        end if;

        insert into public.user_consents
            (user_id, doc_type, doc_version, accepted_at, document_sha256, source, age_confirmed)
        values
            (v_uid, v_doc.doc_type, v_doc.version, v_now, v_doc.content_sha256, 'reconsent',
             case when v_doc.doc_type = 'privacy_policy' and v_needs_age then true else null end)
        on conflict (user_id, doc_type, doc_version) do nothing;
    end loop;

    return public.get_my_consent_status();
end;
$$;

revoke all on function public.accept_legal_documents(boolean, boolean, boolean, text, text) from public, anon;
grant execute on function public.accept_legal_documents(boolean, boolean, boolean, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Neue Version veröffentlichen (nur postgres/service_role, nie vom Client)
--    Beispiel:
--      select public.publish_legal_document('terms_of_service', '1.1', '<sha256>');
-- -----------------------------------------------------------------------------
create or replace function public.publish_legal_document(
    p_doc_type     text,
    p_version      text,
    p_sha256       text,
    p_effective_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.legal_documents set is_current = false
        where doc_type = p_doc_type and is_current;
    insert into public.legal_documents (doc_type, version, content_sha256, effective_at, is_current)
        values (p_doc_type, p_version, p_sha256, p_effective_at, true);
end;
$$;

revoke all on function public.publish_legal_document(text, text, text, timestamptz)
    from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Startversionen (entsprechen "Version 1.0" in den Rechtstexten).
--    content_sha256 ist bewusst NULL: Die Texte sind noch Entwürfe (DRAFT-Hinweis
--    und [CONFIRM]-Marker in den HTML-Dateien). Vor dem Livegang einmalig setzen,
--    siehe supabase/README.md:
--      update public.legal_documents set content_sha256 = '<sha256>'
--        where doc_type = 'privacy_policy' and version = '1.0';
-- -----------------------------------------------------------------------------
insert into public.legal_documents (doc_type, version, effective_at, is_current) values
    ('privacy_policy',   '1.0', '2026-10-14 00:00:00+00', true),
    ('terms_of_service', '1.0', '2026-10-16 00:00:00+00', true)
on conflict (doc_type, version) do nothing;

commit;

-- =============================================================================
-- Kontrollabfragen (nach dem Ausführen):
--   select * from public.legal_documents;
--   select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;
--   select doc_type, doc_version, accepted_at at time zone 'UTC' as accepted_utc, source
--     from public.user_consents where user_id = '<uuid>' order by accepted_at;
--
-- Rollback (nur falls nötig):
--   drop trigger if exists on_auth_user_created_record_consent on auth.users;
--   drop function if exists public.record_signup_consent();
--   drop function if exists public.accept_legal_documents(boolean, boolean, boolean, text, text);
--   drop function if exists public.get_my_consent_status();
--   drop function if exists public.publish_legal_document(text, text, text, timestamptz);
--   drop table if exists public.user_consents;
--   drop table if exists public.legal_documents;
--   drop function if exists public.user_consents_block_update();
--   drop function if exists public.user_consents_block_delete();
--   drop function if exists public.legal_documents_guard();
-- =============================================================================
