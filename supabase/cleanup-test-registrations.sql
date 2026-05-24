-- Safe cleanup template for test registrations.
-- Prefer deleting by explicit registration ids copied from Supabase Table Editor.
-- This avoids accidentally deleting real participant data.

-- 1. Put test registration ids here.
create temporary table test_registration_ids (
  id text primary key
) on commit drop;

-- Example:
-- insert into test_registration_ids (id) values
--   ('copy-registration-id-here'),
--   ('copy-another-registration-id-here');

-- 2. Preview what will be deleted.
select
  r.id,
  r.event_id,
  e.title as event_title,
  r.participant_name,
  r.contact,
  r.number_of_people,
  r.note,
  r.created_at
from public.registrations r
join public.events e on e.id = r.event_id
where r.id in (select id from test_registration_ids)
order by r.created_at desc;

-- 3. Delete and repair participant counts.
-- Run this only after previewing the rows above.
with deleted as (
  delete from public.registrations
  where id in (select id from test_registration_ids)
  returning event_id, number_of_people
),
totals as (
  select event_id, sum(number_of_people)::integer as removed_people
  from deleted
  group by event_id
)
update public.events e
set
  current_participants = greatest(e.current_participants - totals.removed_people, 0),
  status = case
    when e.status = 'full' and greatest(e.current_participants - totals.removed_people, 0) < e.max_participants then 'open'
    else e.status
  end,
  updated_at = now()
from totals
where e.id = totals.event_id;
