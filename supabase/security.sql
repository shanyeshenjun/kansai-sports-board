-- Third-stage hardening SQL.
-- Run this after confirming the app uses SUPABASE_SERVICE_ROLE_KEY only on the server.
-- The current Next.js app does not query Supabase directly from the browser.

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.admin_users enable row level security;

-- Remove direct browser/client access to operational tables.
revoke all on table public.events from anon, authenticated;
revoke all on table public.registrations from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

-- Do not allow public clients to execute the registration function directly.
revoke all on function public.register_for_event(text, text, text, integer, text) from public;
revoke all on function public.register_for_event(text, text, text, integer, text) from anon;
revoke all on function public.register_for_event(text, text, text, integer, text) from authenticated;

-- The deployed Next.js server uses the service role key and can keep operating.
grant execute on function public.register_for_event(text, text, text, integer, text) to service_role;

-- Optional read-only browser policy for a future client-side Supabase version.
-- Do not enable this unless you intentionally move event list reads to the browser.
--
-- grant select on table public.events to anon;
-- create policy "Public can read visible events"
-- on public.events
-- for select
-- to anon
-- using (status in ('open', 'full', 'finished', 'cancelled'));
