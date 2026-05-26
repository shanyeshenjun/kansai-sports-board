-- Add privacy-aware public participant fields.
-- Run this in Supabase SQL Editor before deploying the code that submits these fields.

alter table public.registrations
add column if not exists display_name text,
add column if not exists gender text,
add column if not exists skill_level integer,
add column if not exists is_public boolean;

alter table public.registrations
drop constraint if exists registrations_gender_check;

alter table public.registrations
drop constraint if exists registrations_skill_level_check;

alter table public.registrations
add constraint registrations_gender_check
check (gender in ('male', 'female', 'private'));

alter table public.registrations
add constraint registrations_skill_level_check
check (skill_level is null or skill_level between 1 and 5);

update public.registrations
set
  gender = coalesce(nullif(gender, ''), 'private'),
  is_public = coalesce(is_public, false)
where gender is null
   or gender = ''
   or is_public is null;

alter table public.registrations
alter column gender set default 'private',
alter column gender set not null,
alter column is_public set default false,
alter column is_public set not null;

drop function if exists public.register_for_event(text, text, text, integer, text);
drop function if exists public.register_for_event(text, text, text, integer, text, text, text, boolean);
drop function if exists public.register_for_event(text, text, text, integer, text, text, text, integer, boolean);

create or replace function public.register_for_event(
  p_event_id text,
  p_participant_name text,
  p_contact text,
  p_number_of_people integer,
  p_note text default '',
  p_display_name text default null,
  p_gender text default 'private',
  p_skill_level integer default null,
  p_is_public boolean default false
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

  if coalesce(p_is_public, false) and length(trim(coalesce(p_display_name, ''))) = 0 then
    return query select false, '公開表示する場合は、表示用ニックネームを入力してください。', null::text;
    return;
  end if;

  if coalesce(p_gender, 'private') not in ('male', 'female', 'private') then
    return query select false, '性別の選択が正しくありません。', null::text;
    return;
  end if;

  if p_skill_level is null or p_skill_level not between 1 and 5 then
    return query select false, 'レベルを選択してください。', null::text;
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
    note,
    display_name,
    gender,
    skill_level,
    is_public
  ) values (
    v_registration_id,
    p_event_id,
    p_participant_name,
    p_contact,
    p_number_of_people,
    coalesce(p_note, ''),
    nullif(trim(coalesce(p_display_name, '')), ''),
    coalesce(p_gender, 'private'),
    p_skill_level,
    coalesce(p_is_public, false)
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

revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from public;
revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from anon;
revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from authenticated;
grant execute on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) to service_role;
