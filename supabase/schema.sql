create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sport_type text not null check (sport_type in ('badminton', 'basketball', 'table_tennis', 'volleyball', 'futsal')),
  area text not null check (area in ('osaka', 'kyoto', 'kobe', 'nara', 'hyogo', 'kansai_other')),
  venue_name text not null,
  address text not null,
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  fee integer not null default 0 check (fee >= 0),
  max_participants integer not null check (max_participants > 0),
  current_participants integer not null default 0 check (current_participants >= 0),
  level text not null check (level in ('beginner_welcome', 'beginner', 'intermediate', 'advanced', 'anyone')),
  organizer_name text not null,
  organizer_contact_type text not null check (organizer_contact_type in ('wechat', 'line', 'instagram', 'email', 'phone')),
  organizer_contact_value text not null,
  description text not null default '',
  notes text not null default '',
  status text not null default 'open' check (status in ('open', 'full', 'finished', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_name text not null,
  contact text not null,
  number_of_people integer not null check (number_of_people > 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists events_start_datetime_idx on public.events(start_datetime);
create index if not exists events_sport_type_idx on public.events(sport_type);
create index if not exists events_area_idx on public.events(area);
create index if not exists registrations_event_id_idx on public.registrations(event_id);
