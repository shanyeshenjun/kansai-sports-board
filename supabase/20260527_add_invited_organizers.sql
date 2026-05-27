create extension if not exists "pgcrypto";

create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  login_id text unique not null,
  display_name text not null,
  password_hash text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  admin_note text
);

alter table public.organizers
drop constraint if exists organizers_status_check;

alter table public.organizers
add constraint organizers_status_check
check (status in ('active', 'disabled'));

alter table public.events
add column if not exists organizer_id uuid references public.organizers(id) on delete set null;

create index if not exists events_organizer_id_idx on public.events(organizer_id);
create index if not exists organizers_status_idx on public.organizers(status);

grant usage on schema public to service_role;
grant select, insert, update on table public.organizers to service_role;
grant select, update on table public.events to service_role;

-- Existing events keep organizer_id = null and remain admin-managed.
-- Organizer passwords are created by the app with Node.js scrypt hashes.
