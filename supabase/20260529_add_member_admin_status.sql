-- Admin member management support.
-- Adds a soft account status used by /admin/members.

alter table public.members
  add column if not exists status text not null default 'active' check (status in ('active', 'disabled'));

create index if not exists idx_members_status on public.members(status);
