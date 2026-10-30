-- =====================================================================
-- Lalith & Anjana wedding invitation — Supabase schema (Part A)
-- Run this FIRST in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE.
-- =====================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Events (reference data: one row per celebration)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  code        text primary key check (code in ('wedding', 'reception')),
  title       text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  venue       text not null,
  address     text not null,
  map_url     text,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

insert into public.events (code, title, starts_at, ends_at, venue, address, map_url) values
  ('wedding',   'Wedding (Muhurtham)', '2026-11-29 08:00+05:30', '2026-11-29 09:20+05:30', 'Central Auditorium', 'North Paravur, Kerala, India', 'https://maps.app.goo.gl/XAEM92g9pdnygrfF6'),
  ('reception', 'Reception',           '2026-12-06 18:00+05:30', '2026-12-06 22:30+05:30', 'Annalakshmi Restaurant', '6 Mayor Ramanathan Salai, Chennai, India', 'https://maps.app.goo.gl/vN3tiGAB5BfHAyBB8')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Guests (people you invite) — one row per invited guest / family
-- ---------------------------------------------------------------------
create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null check (char_length(btrim(display_name)) between 1 and 80),
  name_key      text not null,                          -- normalised lower-case name, prevents duplicates
  language      text not null default 'en' check (language in ('en', 'ta', 'ml')),
  phone         text check (phone is null or phone ~ '^\+?[0-9]{6,15}$'),
  notes         text check (notes is null or char_length(notes) <= 500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint guests_name_key_unique unique (name_key)
);

-- ---------------------------------------------------------------------
-- Invitations — the personal link. The token is random (192-bit), never the guest id.
-- ---------------------------------------------------------------------
create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  guest_id        uuid not null references public.guests(id) on delete cascade,
  token           text not null check (token ~ '^[A-Za-z0-9_-]{32}$'),
  status          text not null default 'created' check (status in ('created', 'sent')),
  sent_at         timestamptz,
  last_opened_at  timestamptz,
  revoked_at      timestamptz,
  max_guests      smallint not null default 1 check (max_guests between 1 and 10),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint invitations_token_unique unique (token),
  constraint invitations_guest_unique unique (guest_id)   -- one personal link per guest
);

alter table public.invitations add column if not exists max_guests smallint not null default 1;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invitations_max_guests_valid'
      and conrelid = 'public.invitations'::regclass
  ) then
    alter table public.invitations
      add constraint invitations_max_guests_valid check (max_guests between 1 and 10);
  end if;
end $$;

-- ---------------------------------------------------------------------
-- RSVP responses — one per invitation (updated on resubmission);
-- invitation_id is NULL for guests who replied from the general link.
-- ---------------------------------------------------------------------
create table if not exists public.rsvp_responses (
  id                    uuid primary key default gen_random_uuid(),
  invitation_id         uuid references public.invitations(id) on delete set null,
  client_submission_id  uuid not null,                  -- idempotency key from the browser (prevents double submits)
  submitted_name        text not null check (char_length(btrim(submitted_name)) between 1 and 120),
  wishes                text check (wishes is null or char_length(wishes) <= 1000),
  wish_approved         boolean not null default false, -- only approved wishes appear on the public wishes wall
  revision              integer not null default 1 check (revision >= 1),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint rsvp_responses_invitation_unique unique (invitation_id),
  constraint rsvp_responses_submission_unique unique (client_submission_id)
);

-- ---------------------------------------------------------------------
-- Per-event attendance — wedding and reception recorded independently
-- ---------------------------------------------------------------------
create table if not exists public.rsvp_event_responses (
  id           uuid primary key default gen_random_uuid(),
  response_id  uuid not null references public.rsvp_responses(id) on delete cascade,
  event_code   text not null references public.events(code),
  attending    boolean not null,
  guest_count  smallint not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint rsvp_event_unique unique (response_id, event_code),
  constraint rsvp_event_count_valid check (
    (attending and guest_count between 1 and 10) or (not attending and guest_count = 0)
  )
);

-- ---------------------------------------------------------------------
-- Optional guest photo (file lives in the private Storage bucket "guest-photos")
-- ---------------------------------------------------------------------
create table if not exists public.rsvp_photos (
  id            uuid primary key default gen_random_uuid(),
  response_id   uuid not null references public.rsvp_responses(id) on delete cascade,
  storage_path  text not null check (storage_path ~ '^rsvp/[0-9a-f-]{36}/[0-9a-f]{32}\.(jpg|png|webp)$'),
  content_type  text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes    integer check (size_bytes is null or size_bytes between 0 and 5242880),
  created_at    timestamptz not null default now(),
  constraint rsvp_photos_response_unique unique (response_id),
  constraint rsvp_photos_path_unique unique (storage_path)
);

-- ---------------------------------------------------------------------
-- Indexes (unique constraints above already create their own indexes)
-- ---------------------------------------------------------------------
create index if not exists guests_created_at_idx           on public.guests (created_at desc);
create index if not exists invitations_status_idx          on public.invitations (status);
create index if not exists rsvp_responses_unlinked_idx     on public.rsvp_responses (created_at desc) where invitation_id is null;
create index if not exists rsvp_responses_approved_idx     on public.rsvp_responses (updated_at desc) where wish_approved;
create index if not exists rsvp_event_responses_event_idx  on public.rsvp_event_responses (event_code) where attending;

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['guests', 'invitations', 'rsvp_responses', 'rsvp_event_responses'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- submit_rsvp: atomic create-or-update of a guest's RSVP (called only by Netlify Functions)
--  * same client_submission_id again  -> treated as a retry, nothing duplicated
--  * same invitation again            -> answer is updated (revision + 1)
--  * no invitation (general link)     -> stored as an unlinked response
-- ---------------------------------------------------------------------
create or replace function public.submit_rsvp(
  p_invitation_id       uuid,
  p_submission_id       uuid,
  p_name                text,
  p_wishes              text,
  p_wedding_attending   boolean,
  p_wedding_count       integer,
  p_reception_attending boolean,
  p_reception_count     integer,
  p_photo_path          text default null,
  p_photo_type          text default null,
  p_photo_size          integer default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_updated boolean := false;
begin
  if p_name is null or char_length(btrim(p_name)) = 0 then
    raise exception 'name required' using errcode = '22023';
  end if;

  -- Retry of the very same submission: return the existing row.
  select id into v_id from rsvp_responses where client_submission_id = p_submission_id;
  if v_id is not null then
    return jsonb_build_object('response_id', v_id, 'duplicate', true);
  end if;

  if p_invitation_id is not null then
    if not exists (select 1 from invitations where id = p_invitation_id and revoked_at is null) then
      raise exception 'invalid invitation' using errcode = '22023';
    end if;
    select id into v_id from rsvp_responses where invitation_id = p_invitation_id for update;
  end if;

  if v_id is null then
    insert into rsvp_responses (invitation_id, client_submission_id, submitted_name, wishes)
    values (p_invitation_id, p_submission_id, btrim(p_name), nullif(btrim(coalesce(p_wishes, '')), ''))
    returning id into v_id;
  else
    v_updated := true;
    update rsvp_responses
       set client_submission_id = p_submission_id,
           submitted_name       = btrim(p_name),
           wishes               = nullif(btrim(coalesce(p_wishes, '')), ''),
           wish_approved        = case when wishes is distinct from nullif(btrim(coalesce(p_wishes, '')), '') then false else wish_approved end,
           revision             = revision + 1
     where id = v_id;
  end if;

  insert into rsvp_event_responses (response_id, event_code, attending, guest_count) values
    (v_id, 'wedding',   p_wedding_attending,   case when p_wedding_attending   then p_wedding_count   else 0 end),
    (v_id, 'reception', p_reception_attending, case when p_reception_attending then p_reception_count else 0 end)
  on conflict (response_id, event_code) do update
    set attending = excluded.attending, guest_count = excluded.guest_count;

  if p_photo_path is not null then
    insert into rsvp_photos (response_id, storage_path, content_type, size_bytes)
    values (v_id, p_photo_path, p_photo_type, p_photo_size)
    on conflict (response_id) do update
      set storage_path = excluded.storage_path, content_type = excluded.content_type,
          size_bytes = excluded.size_bytes, created_at = now();
  end if;

  return jsonb_build_object('response_id', v_id, 'duplicate', false, 'updated', v_updated);
end $$;

-- Aggregate head-counts only (no names) for the public RSVP page.
create or replace function public.rsvp_totals() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'wedding',   coalesce(sum(guest_count) filter (where event_code = 'wedding'   and attending), 0),
    'reception', coalesce(sum(guest_count) filter (where event_code = 'reception' and attending), 0)
  ) from rsvp_event_responses;
$$;

-- Handy view for browsing in the Supabase Table Editor (not exposed to the public API — see security.sql).
create or replace view public.guest_tracker
with (security_invoker = true) as
select g.display_name, g.language, g.phone,
       i.status as invitation_status, i.sent_at, i.last_opened_at,
       r.submitted_name, r.updated_at as responded_at, r.wishes, r.wish_approved,
       w.attending as wedding_attending, w.guest_count as wedding_guests,
       c.attending as reception_attending, c.guest_count as reception_guests
from guests g
left join invitations i on i.guest_id = g.id
left join rsvp_responses r on r.invitation_id = i.id
left join rsvp_event_responses w on w.response_id = r.id and w.event_code = 'wedding'
left join rsvp_event_responses c on c.response_id = r.id and c.event_code = 'reception';
