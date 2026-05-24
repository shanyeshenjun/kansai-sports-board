-- Rollback for supabase/security.sql.
-- Use only if RLS / grants were applied incorrectly and the app stops working.
-- This restores broad table access for anon/authenticated clients.
-- After recovery, review policies again before operating publicly.

alter table public.events disable row level security;
alter table public.registrations disable row level security;
alter table public.admin_users disable row level security;

grant select, insert, update, delete on table public.events to anon, authenticated;
grant select, insert, update, delete on table public.registrations to anon, authenticated;
grant select, insert, update, delete on table public.admin_users to anon, authenticated;

grant execute on function public.register_for_event(text, text, text, integer, text) to public;
grant execute on function public.register_for_event(text, text, text, integer, text) to anon;
grant execute on function public.register_for_event(text, text, text, integer, text) to authenticated;
