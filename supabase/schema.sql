create extension if not exists "pgcrypto";

create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  login_id text unique not null,
  display_name text not null,
  password_hash text not null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  admin_note text
);

create table if not exists public.events (
  id text primary key default gen_random_uuid()::text,
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
  organizer_id uuid references public.organizers(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  participant_name text not null,
  contact text not null,
  number_of_people integer not null check (number_of_people > 0),
  note text not null default '',
  display_name text,
  gender text not null default 'private' check (gender in ('male', 'female', 'private')),
  skill_level integer check (skill_level between 1 and 5),
  is_public boolean not null default false,
  cancel_code text not null default upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10)),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id text primary key default gen_random_uuid()::text,
  auth_user_id uuid unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists events_start_datetime_idx on public.events(start_datetime);
create index if not exists events_sport_type_idx on public.events(sport_type);
create index if not exists events_area_idx on public.events(area);
create index if not exists events_deleted_at_idx on public.events(deleted_at);
create index if not exists events_organizer_id_idx on public.events(organizer_id);
create index if not exists registrations_event_id_idx on public.registrations(event_id);
create index if not exists registrations_status_idx on public.registrations(status);
create index if not exists organizers_status_idx on public.organizers(status);

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
