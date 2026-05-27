-- Light member accounts, public profiles, friendships, and friend reviews.
-- This does not modify existing events, registrations, or organizers tables.
-- The app accesses these tables only from server actions with SUPABASE_SERVICE_ROLE_KEY.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  login_id text unique not null,
  password_hash text not null,
  display_name text not null,
  gender text not null default 'private' check (gender in ('male', 'female', 'private')),
  skill_level integer check (skill_level between 1 and 5),
  bio text,
  title text,
  profile_public boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.members(id) on delete cascade,
  receiver_id uuid not null references public.members(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> receiver_id)
);

create table if not exists public.profile_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.members(id) on delete cascade,
  target_id uuid not null references public.members(id) on delete cascade,
  rating_skill integer check (rating_skill between 1 and 5),
  comment text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  constraint profile_reviews_not_self check (reviewer_id <> target_id)
);

create index if not exists idx_members_profile_public on public.members(profile_public);
create unique index if not exists idx_friendships_unique_pair on public.friendships(least(requester_id, receiver_id), greatest(requester_id, receiver_id));
create index if not exists idx_friendships_receiver_status on public.friendships(receiver_id, status);
create index if not exists idx_friendships_requester_status on public.friendships(requester_id, status);
create index if not exists idx_profile_reviews_target_visible on public.profile_reviews(target_id, is_visible, created_at desc);

alter table public.members enable row level security;
alter table public.friendships enable row level security;
alter table public.profile_reviews enable row level security;

-- No anon policies are added in this first version.
-- RLS stays enabled so browser-side anon clients cannot read member data directly.
-- Server-side service-role access is used for registration, login, profiles, friendships, and reviews.
