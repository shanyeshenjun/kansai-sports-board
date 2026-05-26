-- Add soft delete support for events.
-- Run this in Supabase SQL Editor before deploying the code that uses deleted_at.

alter table public.events
add column if not exists deleted_at timestamptz;

create index if not exists events_deleted_at_idx on public.events(deleted_at);

create or replace function public.register_for_event(
  p_event_id text,
  p_participant_name text,
  p_contact text,
  p_number_of_people integer,
  p_note text default ''
)
returns table(ok boolean, message text, registration_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_registration_id text := gen_random_uuid()::text;
  v_next_count integer;
begin
  if p_number_of_people is null or p_number_of_people <= 0 then
    return query select false, '人数を1名以上にしてください。', null::text;
    return;
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
    and deleted_at is null
  for update;

  if not found then
    return query select false, '活動が見つかりません。', null::text;
    return;
  end if;

  if v_event.status <> 'open' then
    return query select false, 'この活動は現在受付していません。', null::text;
    return;
  end if;

  if v_event.end_datetime < now() then
    update public.events
    set status = 'finished', updated_at = now()
    where id = p_event_id
      and deleted_at is null;

    return query select false, 'この活動は終了しています。', null::text;
    return;
  end if;

  v_next_count := v_event.current_participants + p_number_of_people;

  if v_next_count > v_event.max_participants then
    return query select false, ('残り' || greatest(v_event.max_participants - v_event.current_participants, 0)::text || '名まで申し込み可能です。'), null::text;
    return;
  end if;

  insert into public.registrations (
    id,
    event_id,
    participant_name,
    contact,
    number_of_people,
    note
  ) values (
    v_registration_id,
    p_event_id,
    p_participant_name,
    p_contact,
    p_number_of_people,
    coalesce(p_note, '')
  );

  update public.events
  set
    current_participants = v_next_count,
    status = case when v_next_count >= max_participants then 'full' else status end,
    updated_at = now()
  where id = p_event_id
    and deleted_at is null;

  return query select true, '申し込みを受け付けました。', v_registration_id;
end;
$$;
