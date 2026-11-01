-- =====================================================================
-- Lalith & Anjana wedding invitation — Team Bride / Team Groom (Part C)
-- Run this THIRD, after 01_schema.sql and 02_security.sql. Safe to re-run.
--
-- One pick per device (visitor_id, a random UUID kept in the browser) and,
-- when the guest opened a personal link, one pick per invitation.
-- Written only by the /api/team serverless function (service role).
-- =====================================================================

create table if not exists public.team_picks (
  id             uuid primary key default gen_random_uuid(),
  visitor_id     uuid not null,
  invitation_id  uuid references public.invitations(id) on delete set null,
  guest_name     text check (guest_name is null or char_length(guest_name) <= 120),
  side           text not null check (side in ('bride', 'groom')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint team_picks_visitor_unique unique (visitor_id)
);

create unique index if not exists team_picks_invitation_unique
  on public.team_picks (invitation_id) where invitation_id is not null;

drop trigger if exists team_picks_touch on public.team_picks;
create trigger team_picks_touch before update on public.team_picks
  for each row execute function public.touch_updated_at();

create or replace function public.team_totals() returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'bride', count(*) filter (where side = 'bride'),
    'groom', count(*) filter (where side = 'groom')
  ) from team_picks;
$$;

-- Create-or-update a pick; returns the new totals.
create or replace function public.submit_team_pick(
  p_visitor_id uuid, p_invitation_id uuid, p_name text, p_side text
) returns jsonb
language plpgsql security invoker set search_path = public as $$
declare
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
begin
  if p_side is null or p_side not in ('bride', 'groom') then
    raise exception 'invalid_side';
  end if;

  if p_invitation_id is not null then
    -- An anonymous pick from this device is superseded by the personal-link pick.
    delete from team_picks
     where visitor_id = p_visitor_id
       and invitation_id is distinct from p_invitation_id;
    insert into team_picks (visitor_id, invitation_id, guest_name, side)
    values (p_visitor_id, p_invitation_id, v_name, p_side)
    on conflict (invitation_id) where invitation_id is not null do update
      set side       = excluded.side,
          visitor_id = excluded.visitor_id,
          guest_name = coalesce(excluded.guest_name, team_picks.guest_name);
  else
    insert into team_picks (visitor_id, guest_name, side)
    values (p_visitor_id, v_name, p_side)
    on conflict (visitor_id) do update
      set side       = excluded.side,
          guest_name = coalesce(excluded.guest_name, team_picks.guest_name);
  end if;

  return team_totals();
end $$;

-- Handy view for the Supabase Table Editor: who picked which side.
create or replace view public.team_tracker
with (security_invoker = true) as
select coalesce(g.display_name, t.guest_name, '(anonymous)') as guest,
       t.side, t.invitation_id is not null as personal_link, t.created_at, t.updated_at
  from team_picks t
  left join invitations i on i.id = t.invitation_id
  left join guests g on g.id = i.guest_id
 order by t.updated_at desc;

-- Security: deny-by-default, service role only (same model as 02_security.sql).
alter table public.team_picks enable row level security;
revoke all on table public.team_picks, public.team_tracker from anon, authenticated, public;
revoke all on function public.team_totals() from anon, authenticated, public;
revoke all on function public.submit_team_pick(uuid, uuid, text, text) from anon, authenticated, public;
grant select, insert, update, delete on table public.team_picks to service_role;
grant select on table public.team_tracker to service_role;
grant execute on function public.team_totals() to service_role;
grant execute on function public.submit_team_pick(uuid, uuid, text, text) to service_role;
