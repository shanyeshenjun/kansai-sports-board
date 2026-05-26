create extension if not exists "pgcrypto";

alter table public.registrations
add column if not exists cancel_code text,
add column if not exists status text,
add column if not exists cancelled_at timestamptz,
add column if not exists cancellation_reason text;

update public.registrations
set
  cancel_code = coalesce(nullif(cancel_code, ''), upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10))),
  status = coalesce(nullif(status, ''), 'active')
where cancel_code is null
   or cancel_code = ''
   or status is null
   or status = '';

alter table public.registrations
drop constraint if exists registrations_status_check;

alter table public.registrations
add constraint registrations_status_check
check (status in ('active', 'cancelled'));

alter table public.registrations
alter column cancel_code set default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10)),
alter column cancel_code set not null,
alter column status set default 'active',
alter column status set not null;

create index if not exists registrations_status_idx on public.registrations(status);

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
returns table(ok boolean, message text, registration_id text, cancel_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_registration_id text := gen_random_uuid()::text;
  v_cancel_code text := upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10));
  v_next_count integer;
begin
  if p_number_of_people is null or p_number_of_people <= 0 then
    return query select false, '人数を1名以上にしてください。', null::text, null::text;
    return;
  end if;

  if coalesce(p_is_public, false) and length(trim(coalesce(p_display_name, ''))) = 0 then
    return query select false, '公開表示する場合は、表示用ニックネームを入力してください。', null::text, null::text;
    return;
  end if;

  if coalesce(p_gender, 'private') not in ('male', 'female', 'private') then
    return query select false, '性別の選択が正しくありません。', null::text, null::text;
    return;
  end if;

  if p_skill_level is null or p_skill_level not between 1 and 5 then
    return query select false, 'レベルを選択してください。', null::text, null::text;
    return;
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
    and deleted_at is null
  for update;

  if not found then
    return query select false, '活動が見つかりません。', null::text, null::text;
    return;
  end if;

  if v_event.status <> 'open' then
    return query select false, 'この活動は現在受付していません。', null::text, null::text;
    return;
  end if;

  if v_event.end_datetime < now() then
    update public.events
    set status = 'finished', updated_at = now()
    where id = p_event_id;

    return query select false, 'この活動は終了しています。', null::text, null::text;
    return;
  end if;

  v_next_count := v_event.current_participants + p_number_of_people;

  if v_next_count > v_event.max_participants then
    return query select false, ('残り' || greatest(v_event.max_participants - v_event.current_participants, 0)::text || '名まで申し込み可能です。'), null::text, null::text;
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
    is_public,
    cancel_code,
    status
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
    coalesce(p_is_public, false),
    v_cancel_code,
    'active'
  );

  update public.events
  set
    current_participants = v_next_count,
    status = case when v_next_count >= max_participants then 'full' else status end,
    updated_at = now()
  where id = p_event_id;

  return query select true, '申し込みを受け付けました。', v_registration_id, v_cancel_code;
end;
$$;

drop function if exists public.cancel_registration(text, text, text);

create or replace function public.cancel_registration(
  p_registration_id text,
  p_cancel_code text,
  p_reason text default ''
)
returns table(ok boolean, message text, event_id text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration public.registrations%rowtype;
  v_event public.events%rowtype;
  v_deadline timestamptz;
  v_next_count integer;
begin
  select * into v_registration
  from public.registrations
  where id = p_registration_id
  for update;

  if not found then
    return query select false, '申込が見つかりません。', null::text;
    return;
  end if;

  if upper(coalesce(v_registration.cancel_code, '')) <> upper(trim(coalesce(p_cancel_code, ''))) then
    return query select false, 'キャンセルコードが正しくありません。', v_registration.event_id;
    return;
  end if;

  select * into v_event
  from public.events
  where id = v_registration.event_id
  for update;

  if not found then
    return query select false, '活動が見つかりません。', v_registration.event_id;
    return;
  end if;

  if coalesce(v_registration.status, 'active') = 'cancelled' then
    return query select false, 'この申込はすでにキャンセルされています。', v_registration.event_id;
    return;
  end if;

  if v_event.status in ('cancelled', 'finished') then
    return query select false, 'この活動は現在自助キャンセルできません。主催者または管理者までご連絡ください。', v_registration.event_id;
    return;
  end if;

  v_deadline := ((((v_event.start_datetime at time zone 'Asia/Tokyo')::date - 1)::timestamp + time '13:00') at time zone 'Asia/Tokyo');
  if now() >= v_deadline then
    return query select false, '自助キャンセル期限を過ぎています。' || chr(10) || 'キャンセルをご希望の場合は、主催者または管理者までご連絡ください。', v_registration.event_id;
    return;
  end if;

  update public.registrations
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = nullif(trim(coalesce(p_reason, '')), '')
  where id = v_registration.id;

  v_next_count := greatest(v_event.current_participants - v_registration.number_of_people, 0);

  update public.events
  set
    current_participants = v_next_count,
    status = case when status = 'full' and v_next_count < max_participants then 'open' else status end,
    updated_at = now()
  where id = v_event.id;

  return query select true, 'キャンセルを受け付けました。', v_event.id;
end;
$$;

revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from public;
revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from anon;
revoke all on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) from authenticated;
grant execute on function public.register_for_event(text, text, text, integer, text, text, text, integer, boolean) to service_role;

revoke all on function public.cancel_registration(text, text, text) from public;
revoke all on function public.cancel_registration(text, text, text) from anon;
revoke all on function public.cancel_registration(text, text, text) from authenticated;
grant execute on function public.cancel_registration(text, text, text) to service_role;
