-- =====================================================================
-- Lalith & Anjana wedding invitation — security configuration (Part B)
-- Run this SECOND, after 01_schema.sql.
--
-- Access model
--   * The browser NEVER talks to the database directly. The public "anon"/publishable
--     key is not used by this site at all.
--   * All reads/writes go through Netlify Functions using the service-role (secret) key,
--     which bypasses RLS and is stored only in Netlify environment variables.
--   * RLS is enabled with NO policies for anon/authenticated, so even if someone finds the
--     project URL and the public key, every table, view and function returns nothing.
-- =====================================================================

-- 1. Turn on Row Level Security everywhere (deny-by-default).
alter table public.events               enable row level security;
alter table public.guests               enable row level security;
alter table public.invitations          enable row level security;
alter table public.rsvp_responses       enable row level security;
alter table public.rsvp_event_responses enable row level security;
alter table public.rsvp_photos          enable row level security;

-- 2. Remove the default Supabase grants for public API roles.
revoke all on table public.events, public.guests, public.invitations, public.rsvp_responses,
                    public.rsvp_event_responses, public.rsvp_photos, public.guest_tracker
  from anon, authenticated, public;

revoke all on function public.submit_rsvp(uuid, uuid, text, text, boolean, integer, boolean, integer, text, text, integer) from anon, authenticated, public;
revoke all on function public.rsvp_totals() from anon, authenticated, public;
revoke all on function public.touch_updated_at() from anon, authenticated, public;

-- 3. Server-side role used by the Netlify Functions.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.guests, public.invitations, public.rsvp_responses,
                                         public.rsvp_event_responses, public.rsvp_photos to service_role;
grant select on table public.events, public.guest_tracker to service_role;
grant execute on function public.submit_rsvp(uuid, uuid, text, text, boolean, integer, boolean, integer, text, text, integer) to service_role;
grant execute on function public.rsvp_totals() to service_role;

-- Stop future tables in "public" from being auto-exposed to the public API roles.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- 4. Private Storage bucket for guest photos: 5 MB, JPG/PNG/WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guest-photos', 'guest-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 5. Storage policies: none for anon/authenticated on this bucket.
--    Uploads happen only through one-time signed upload URLs created by the
--    rsvp-photo Netlify Function; viewing happens only through short-lived signed
--    URLs created by the wishes / admin-guests functions. No listing, no public URLs.
--    (storage.objects already has RLS enabled by Supabase; we simply add no
--    permissive policy for 'guest-photos'.) Remove any policy someone may have
--    added by hand for this bucket:
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') like '%guest-photos%' or coalesce(with_check, '') like '%guest-photos%')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

-- 6. Quick self-check (should list rls_enabled = true for every table).
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;
