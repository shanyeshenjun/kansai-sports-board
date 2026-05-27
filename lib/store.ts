import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { promisify } from "util";
import { createClient } from "@supabase/supabase-js";
import type { Area, Event, EventStatus, Gender, Organizer, OrganizerStatus, Registration, RegistrationStatus, SkillLevel, SportType } from "@/lib/types";

type Store = {
  events: Event[];
  registrations: Registration[];
  organizers: Organizer[];
};

type RegistrationResult = {
  ok: boolean;
  message?: string;
  registration_id?: string | null;
  cancel_code?: string | null;
};

type CancellationPreview =
  | {
      ok: true;
      event: Event;
      registration: Registration;
      deadline: string;
    }
  | {
      ok: false;
      message: string;
      event?: Event | null;
      registration?: Registration | null;
      deadline?: string;
    };

type CancellationResult = {
  ok: boolean;
  message?: string;
  event_id?: string | null;
};

type AdminRegistrationStatusResult = {
  ok: boolean;
  message?: string;
  event_id?: string | null;
};

type EventFilters = {
  sport_type?: string;
  area?: string;
  date?: string;
  onlyOpen?: boolean;
  includeDeleted?: boolean;
};

type OrganizerInput = {
  login_id: string;
  display_name: string;
  password: string;
  admin_note: string;
};

const scrypt = promisify(scryptCallback);

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "mock-store.json");
const globalForStore = globalThis as typeof globalThis & { __kansaiSportsStore?: Store };

const now = new Date().toISOString();

const seedEvents: Event[] = [
  {
    id: "osaka-badminton-umeda",
    title: "大阪・梅田 平日夜バドミントン交流",
    sport_type: "badminton",
    area: "osaka",
    venue_name: "大阪市立北スポーツセンター",
    address: "大阪府大阪市北区中津3-4-27",
    start_datetime: "2026-06-06T19:00:00+09:00",
    end_datetime: "2026-06-06T21:00:00+09:00",
    fee: 800,
    max_participants: 18,
    current_participants: 9,
    level: "beginner_welcome",
    organizer_name: "Kansai Shuttle",
    organizer_contact_type: "line",
    organizer_contact_value: "kansai-shuttle",
    description: "初心者と経験者が混ざってダブルス中心に回します。ラケット貸出は数本あります。",
    notes: "室内シューズを持参してください。",
    status: "open",
    created_at: now,
    updated_at: now
  },
  {
    id: "tennoji-basketball",
    title: "天王寺エリア 3x3 & 軽めゲーム会",
    sport_type: "basketball",
    area: "osaka",
    venue_name: "天王寺スポーツセンター",
    address: "大阪府大阪市天王寺区真田山町5-109",
    start_datetime: "2026-06-08T18:30:00+09:00",
    end_datetime: "2026-06-08T20:30:00+09:00",
    fee: 1000,
    max_participants: 15,
    current_participants: 15,
    level: "anyone",
    organizer_name: "Tennoji Hoops",
    organizer_contact_type: "wechat",
    organizer_contact_value: "tennoji-hoops",
    description: "社会人中心の気軽なバスケ会です。",
    notes: "満員の場合はキャンセル待ちになります。",
    status: "full",
    created_at: now,
    updated_at: now
  },
  {
    id: "namba-table-tennis",
    title: "難波 卓球フリー練習",
    sport_type: "table_tennis",
    area: "osaka",
    venue_name: "なんば卓球ラウンジ",
    address: "大阪府大阪市浪速区難波中2-6-12",
    start_datetime: "2026-06-12T20:00:00+09:00",
    end_datetime: "2026-06-12T22:00:00+09:00",
    fee: 1200,
    max_participants: 12,
    current_participants: 4,
    level: "beginner",
    organizer_name: "Namba Ping",
    organizer_contact_type: "instagram",
    organizer_contact_value: "@namba_ping",
    description: "ラリー練習、サーブ練習、軽い試合を自由に行う会です。",
    notes: "ラケット持参推奨。",
    status: "open",
    created_at: now,
    updated_at: now
  },
  {
    id: "kobe-volleyball",
    title: "神戸三宮 男女ミックスバレー",
    sport_type: "volleyball",
    area: "kobe",
    venue_name: "中央体育館",
    address: "兵庫県神戸市中央区楠町4-1-1",
    start_datetime: "2026-06-15T17:30:00+09:00",
    end_datetime: "2026-06-15T20:30:00+09:00",
    fee: 700,
    max_participants: 24,
    current_participants: 16,
    level: "intermediate",
    organizer_name: "Kobe Mix Volley",
    organizer_contact_type: "email",
    organizer_contact_value: "kobe-volley@example.com",
    description: "男女ミックスで6人制ゲームを行います。",
    notes: "ネット設営にご協力ください。",
    status: "open",
    created_at: now,
    updated_at: now
  },
  {
    id: "kyoto-futsal",
    title: "京都駅近く エンジョイフットサル",
    sport_type: "futsal",
    area: "kyoto",
    venue_name: "フットサルスクエア京都南",
    address: "京都府京都市南区東九条下殿田町70",
    start_datetime: "2026-06-18T19:30:00+09:00",
    end_datetime: "2026-06-18T21:30:00+09:00",
    fee: 1500,
    max_participants: 20,
    current_participants: 11,
    level: "anyone",
    organizer_name: "Kyoto Futsal Friends",
    organizer_contact_type: "line",
    organizer_contact_value: "kyoto-futsal",
    description: "勝ち負けよりも楽しく蹴ることを大切にしたフットサル会です。",
    notes: "フットサルシューズをご用意ください。",
    status: "open",
    created_at: now,
    updated_at: now
  }
];

const seedRegistrations: Registration[] = [
  {
    id: "reg-1",
    event_id: "osaka-badminton-umeda",
    participant_name: "山田",
    contact: "line:yamada",
    number_of_people: 2,
    note: "初心者2名です",
    display_name: "山田",
    gender: "private",
    skill_level: null,
    is_public: false,
    cancel_code: "SAMPLE1234",
    status: "active",
    cancelled_at: null,
    cancellation_reason: null,
    created_at: now
  }
];

const seedOrganizers: Organizer[] = [];

function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function cloneStore(store: Store): Store {
  return {
    events: store.events.map((item) => ({ ...item })),
    registrations: store.registrations.map((item) => ({ ...item })),
    organizers: (store.organizers ?? []).map((item) => ({ ...item }))
  };
}

function seedStore(): Store {
  return cloneStore({ events: seedEvents, registrations: seedRegistrations, organizers: seedOrganizers });
}

function memoryStore(): Store {
  if (!globalForStore.__kansaiSportsStore) {
    globalForStore.__kansaiSportsStore = seedStore();
  }
  return globalForStore.__kansaiSportsStore;
}

function readLocalStore(): Store {
  if (process.env.VERCEL === "1") {
    return memoryStore();
  }

  try {
    if (!existsSync(dataFile)) {
      const store = seedStore();
      writeLocalStore(store);
      return store;
    }
    const store = JSON.parse(readFileSync(dataFile, "utf8")) as Store;
    return { events: store.events ?? [], registrations: store.registrations ?? [], organizers: store.organizers ?? [] };
  } catch {
    return memoryStore();
  }
}

function writeLocalStore(store: Store) {
  if (process.env.VERCEL === "1") {
    globalForStore.__kansaiSportsStore = store;
    return;
  }

  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(dataFile, JSON.stringify(store, null, 2));
  } catch {
    globalForStore.__kansaiSportsStore = store;
  }
}

function isDeleted(event: Event) {
  return Boolean(event.deleted_at);
}

function isEventEnded(event: Event) {
  return new Date(event.end_datetime).getTime() < Date.now();
}

function visibleStatus(event: Event): Event {
  if (isDeleted(event)) return event;
  if (event.status === "cancelled") return event;
  if (event.status === "finished" || isEventEnded(event)) return { ...event, status: "finished" };
  if (event.status === "full" || event.current_participants >= event.max_participants) return { ...event, status: "full" };
  return event;
}

function generateCancelCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, hash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const stored = Buffer.from(hash, "hex");
  const derived = (await scrypt(password, salt, stored.length)) as Buffer;
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

function registrationStatus(registration: Registration) {
  return registration.status ?? "active";
}

function jstDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo"
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function cancelDeadlineAtJST(startDatetime: string) {
  const eventDate = new Date(`${jstDateKey(startDatetime)}T13:00:00+09:00`);
  return new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
}

export function formatCancelDeadlineJST(startDatetime: string) {
  return `${formatDateTimeJST(cancelDeadlineAtJST(startDatetime).toISOString()).slice(0, 16)}まで`;
}

function canSelfCancel(event: Event) {
  return Date.now() < cancelDeadlineAtJST(event.start_datetime).getTime();
}

function nextDate(date: string) {
  const value = new Date(`${date}T00:00:00+09:00`);
  value.setDate(value.getDate() + 1);
  return value.toISOString();
}

async function listSupabaseEvents(filters?: EventFilters) {
  let query = supabaseAdmin().from("events").select("*").order("start_datetime", { ascending: true });
  if (!filters?.includeDeleted) query = query.is("deleted_at", null);
  if (filters?.sport_type) query = query.eq("sport_type", filters.sport_type);
  if (filters?.area) query = query.eq("area", filters.area);
  if (filters?.date) {
    query = query.gte("start_datetime", `${filters.date}T00:00:00+09:00`).lt("start_datetime", nextDate(filters.date));
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return ((data ?? []) as Event[])
    .map(visibleStatus)
    .filter((event) => !filters?.onlyOpen || event.status === "open");
}

function listLocalEvents(filters?: EventFilters) {
  return readLocalStore()
    .events.map(visibleStatus)
    .filter((event) => filters?.includeDeleted || !isDeleted(event))
    .filter((event) => !filters?.sport_type || event.sport_type === filters.sport_type)
    .filter((event) => !filters?.area || event.area === filters.area)
    .filter((event) => !filters?.date || event.start_datetime.slice(0, 10) === filters.date)
    .filter((event) => !filters?.onlyOpen || event.status === "open")
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
}

export async function listEvents(filters?: EventFilters) {
  return supabaseConfigured() ? listSupabaseEvents(filters) : listLocalEvents(filters);
}

export async function listOrganizerEvents(organizerId: string, filters?: EventFilters) {
  const events = await listEvents({ ...filters, includeDeleted: filters?.includeDeleted ?? true });
  return events.filter((event) => event.organizer_id === organizerId);
}

export async function getEvent(id: string, options?: { includeDeleted?: boolean }) {
  if (supabaseConfigured()) {
    let query = supabaseAdmin().from("events").select("*").eq("id", id);
    if (!options?.includeDeleted) query = query.is("deleted_at", null);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? visibleStatus(data as Event) : null;
  }

  const event = readLocalStore().events.find((item) => item.id === id);
  if (!event || (!options?.includeDeleted && isDeleted(event))) return null;
  return visibleStatus(event);
}

export async function getAdminEvent(id: string) {
  return getEvent(id, { includeDeleted: true });
}

export async function getOrganizerEvent(id: string, organizerId: string) {
  const event = await getEvent(id, { includeDeleted: true });
  return event?.organizer_id === organizerId ? event : null;
}

export async function saveEvent(input: Omit<Event, "id" | "created_at" | "updated_at">, id?: string, ownerOrganizerId?: string) {
  const timestamp = new Date().toISOString();

  if (supabaseConfigured()) {
    if (id) {
      if (ownerOrganizerId) {
        const event = await getOrganizerEvent(id, ownerOrganizerId);
        if (!event) throw new Error("この活動を編集する権限がありません。");
      }
      const { error } = await supabaseAdmin()
        .from("events")
        .update({ ...input, updated_at: timestamp })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    }

    const eventId = randomUUID();
    const { error } = await supabaseAdmin()
      .from("events")
      .insert({ ...input, id: eventId, organizer_id: ownerOrganizerId ?? input.organizer_id ?? null, created_at: timestamp, updated_at: timestamp });
    if (error) throw new Error(error.message);
    return eventId;
  }

  const store = readLocalStore();
  if (id) {
    if (ownerOrganizerId && store.events.find((event) => event.id === id)?.organizer_id !== ownerOrganizerId) {
      throw new Error("この活動を編集する権限がありません。");
    }
    store.events = store.events.map((event) => (event.id === id ? { ...event, ...input, updated_at: timestamp } : event));
    writeLocalStore(store);
    return id;
  }

  const eventId = randomUUID();
  store.events.unshift({ ...input, id: eventId, organizer_id: ownerOrganizerId ?? input.organizer_id ?? null, created_at: timestamp, updated_at: timestamp });
  writeLocalStore(store);
  return eventId;
}

export async function setEventStatus(id: string, status: EventStatus, ownerOrganizerId?: string) {
  if (supabaseConfigured()) {
    if (ownerOrganizerId) {
      const event = await getOrganizerEvent(id, ownerOrganizerId);
      if (!event) throw new Error("この活動を変更する権限がありません。");
    }
    const { error } = await supabaseAdmin().from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  if (ownerOrganizerId && store.events.find((event) => event.id === id)?.organizer_id !== ownerOrganizerId) {
    throw new Error("この活動を変更する権限がありません。");
  }
  store.events = store.events.map((event) => (event.id === id ? { ...event, status, updated_at: new Date().toISOString() } : event));
  writeLocalStore(store);
}

export async function softDeleteEvent(id: string, ownerOrganizerId?: string) {
  const timestamp = new Date().toISOString();

  if (supabaseConfigured()) {
    if (ownerOrganizerId) {
      const event = await getOrganizerEvent(id, ownerOrganizerId);
      if (!event) throw new Error("この活動を削除する権限がありません。");
    }
    const { error } = await supabaseAdmin().from("events").update({ deleted_at: timestamp, updated_at: timestamp }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  if (ownerOrganizerId && store.events.find((event) => event.id === id)?.organizer_id !== ownerOrganizerId) {
    throw new Error("この活動を削除する権限がありません。");
  }
  store.events = store.events.map((event) => (event.id === id ? { ...event, deleted_at: timestamp, updated_at: timestamp } : event));
  writeLocalStore(store);
}

export async function register(
  eventId: string,
  input: { participant_name: string; contact: string; number_of_people: number; note: string; display_name: string; gender: Gender; skill_level: SkillLevel | null; is_public: boolean }
): Promise<RegistrationResult> {
  const displayName = input.is_public ? input.display_name.trim() : input.display_name.trim();
  if (input.is_public && !displayName) return { ok: false, message: "公開表示する場合は、表示用ニックネームを入力してください。" };
  if (!input.skill_level) return { ok: false, message: "レベルを選択してください。" };

  if (supabaseConfigured()) {
    const event = await getEvent(eventId);
    if (!event) return { ok: false, message: "活動が見つかりません。" };
    if (event.status !== "open") return { ok: false, message: "この活動は現在受付していません。" };

    const { data, error } = await supabaseAdmin()
      .rpc("register_for_event", {
        p_event_id: eventId,
        p_participant_name: input.participant_name,
        p_contact: input.contact,
        p_number_of_people: input.number_of_people,
        p_note: input.note,
        p_display_name: displayName || null,
        p_gender: input.gender,
        p_skill_level: input.skill_level,
        p_is_public: input.is_public
      })
      .single();

    if (error) return { ok: false, message: error.message };
    const result = data as RegistrationResult;
    return { ok: result.ok, message: result.message, registration_id: result.registration_id, cancel_code: result.cancel_code };
  }

  const store = readLocalStore();
  const event = store.events.find((item) => item.id === eventId);
  if (!event) return { ok: false, message: "活動が見つかりません。" };
  if (isDeleted(event)) return { ok: false, message: "活動が見つかりません。" };
  const current = visibleStatus(event);
  if (current.status !== "open") return { ok: false, message: "この活動は現在受付していません。" };
  if (event.current_participants + input.number_of_people > event.max_participants) {
    return { ok: false, message: `残り${event.max_participants - event.current_participants}名まで申し込み可能です。` };
  }

  const registrationId = randomUUID();
  const cancelCode = generateCancelCode();
  store.registrations.push({
    id: registrationId,
    event_id: eventId,
    ...input,
    display_name: displayName || null,
    cancel_code: cancelCode,
    status: "active",
    cancelled_at: null,
    cancellation_reason: null,
    created_at: new Date().toISOString()
  });
  store.events = store.events.map((item) =>
    item.id === eventId
      ? {
          ...item,
          current_participants: item.current_participants + input.number_of_people,
          status: item.current_participants + input.number_of_people >= item.max_participants ? "full" : item.status,
          updated_at: new Date().toISOString()
        }
      : item
  );
  writeLocalStore(store);
  return { ok: true, registration_id: registrationId, cancel_code: cancelCode };
}

export async function listRegistrations(eventId: string) {
  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin().from("registrations").select("*").eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Registration[];
  }

  return readLocalStore().registrations.filter((item) => item.event_id === eventId);
}

export async function listOrganizers() {
  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin().from("organizers").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Organizer[];
  }

  return readLocalStore().organizers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrganizer(id: string) {
  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin().from("organizers").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (data as Organizer) : null;
  }

  return readLocalStore().organizers.find((organizer) => organizer.id === id) ?? null;
}

export async function getOrganizerByLoginId(loginId: string) {
  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin().from("organizers").select("*").eq("login_id", loginId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (data as Organizer) : null;
  }

  return readLocalStore().organizers.find((organizer) => organizer.login_id === loginId) ?? null;
}

export async function createOrganizer(input: OrganizerInput) {
  const timestamp = new Date().toISOString();
  const loginId = input.login_id.trim();
  if (!loginId || !input.display_name.trim() || !input.password) throw new Error("必須項目を入力してください。");
  const passwordHash = await hashPassword(input.password);

  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("organizers").insert({
      id: randomUUID(),
      login_id: loginId,
      display_name: input.display_name.trim(),
      password_hash: passwordHash,
      status: "active",
      admin_note: input.admin_note.trim() || null,
      created_at: timestamp
    });
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  if (store.organizers.some((organizer) => organizer.login_id === loginId)) throw new Error("このログインIDはすでに使われています。");
  store.organizers.unshift({
    id: randomUUID(),
    login_id: loginId,
    display_name: input.display_name.trim(),
    password_hash: passwordHash,
    status: "active",
    admin_note: input.admin_note.trim() || null,
    last_login_at: null,
    created_at: timestamp
  });
  writeLocalStore(store);
}

export async function setOrganizerStatus(id: string, status: OrganizerStatus) {
  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("organizers").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.organizers = store.organizers.map((organizer) => (organizer.id === id ? { ...organizer, status } : organizer));
  writeLocalStore(store);
}

export async function resetOrganizerPassword(id: string, password: string) {
  if (!password) throw new Error("新しいパスワードを入力してください。");
  const passwordHash = await hashPassword(password);

  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("organizers").update({ password_hash: passwordHash }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.organizers = store.organizers.map((organizer) => (organizer.id === id ? { ...organizer, password_hash: passwordHash } : organizer));
  writeLocalStore(store);
}

export async function markOrganizerLogin(id: string) {
  const timestamp = new Date().toISOString();
  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("organizers").update({ last_login_at: timestamp }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.organizers = store.organizers.map((organizer) => (organizer.id === id ? { ...organizer, last_login_at: timestamp } : organizer));
  writeLocalStore(store);
}

async function getSupabaseRegistration(id: string) {
  const { data, error } = await supabaseAdmin().from("registrations").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? ((data as Registration) ?? null) : null;
}

export async function getCancellationPreview(registrationId: string, cancelCode: string): Promise<CancellationPreview> {
  const normalizedCode = cancelCode.trim().toUpperCase();
  const registration = supabaseConfigured() ? await getSupabaseRegistration(registrationId) : readLocalStore().registrations.find((item) => item.id === registrationId) ?? null;
  if (!registration) return { ok: false, message: "申込が見つかりません。" };
  if ((registration.cancel_code ?? "").toUpperCase() !== normalizedCode) return { ok: false, message: "キャンセルコードが正しくありません。" };

  const event = await getEvent(registration.event_id, { includeDeleted: true });
  if (!event) return { ok: false, message: "活動が見つかりません。", registration };
  const deadline = formatCancelDeadlineJST(event.start_datetime);

  if (registrationStatus(registration) === "cancelled") {
    return { ok: false, message: "この申込はすでにキャンセルされています。", event, registration, deadline };
  }
  if (event.status === "cancelled" || event.status === "finished") {
    return { ok: false, message: "この活動は現在自助キャンセルできません。主催者または管理者までご連絡ください。", event, registration, deadline };
  }
  if (!canSelfCancel(event)) {
    return {
      ok: false,
      message: "自助キャンセル期限を過ぎています。\nキャンセルをご希望の場合は、主催者または管理者までご連絡ください。",
      event,
      registration,
      deadline
    };
  }

  return { ok: true, event, registration, deadline };
}

export async function cancelRegistrationByCode(registrationId: string, cancelCode: string, reason: string): Promise<CancellationResult> {
  const normalizedCode = cancelCode.trim().toUpperCase();

  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin()
      .rpc("cancel_registration", {
        p_registration_id: registrationId,
        p_cancel_code: normalizedCode,
        p_reason: reason
      })
      .single();
    if (error) return { ok: false, message: error.message };
    return data as CancellationResult;
  }

  const preview = await getCancellationPreview(registrationId, normalizedCode);
  if (!preview.ok) return { ok: false, message: preview.message, event_id: preview.event?.id ?? null };

  const timestamp = new Date().toISOString();
  const store = readLocalStore();
  store.registrations = store.registrations.map((registration) =>
    registration.id === registrationId
      ? {
          ...registration,
          status: "cancelled",
          cancelled_at: timestamp,
          cancellation_reason: reason
        }
      : registration
  );
  store.events = store.events.map((event) =>
    event.id === preview.registration.event_id
      ? {
          ...event,
          current_participants: Math.max(event.current_participants - preview.registration.number_of_people, 0),
          status: event.status === "full" && event.current_participants - preview.registration.number_of_people < event.max_participants ? "open" : event.status,
          updated_at: timestamp
        }
      : event
  );
  writeLocalStore(store);
  return { ok: true, event_id: preview.registration.event_id };
}

export async function setRegistrationStatusByAdmin(registrationId: string, status: RegistrationStatus): Promise<AdminRegistrationStatusResult> {
  const timestamp = new Date().toISOString();

  if (supabaseConfigured()) {
    const { data: registrationData, error: registrationError } = await supabaseAdmin().from("registrations").select("*").eq("id", registrationId).maybeSingle();
    if (registrationError) return { ok: false, message: registrationError.message };
    if (!registrationData) return { ok: false, message: "申込が見つかりません。" };

    const registration = registrationData as Registration;
    const currentStatus = registrationStatus(registration);
    if (currentStatus === status) return { ok: true, event_id: registration.event_id };

    const event = await getEvent(registration.event_id, { includeDeleted: true });
    if (!event) return { ok: false, message: "活動が見つかりません。", event_id: registration.event_id };

    const delta = status === "cancelled" ? -registration.number_of_people : registration.number_of_people;
    const nextCount = Math.max(event.current_participants + delta, 0);
    if (status === "active" && nextCount > event.max_participants) {
      return { ok: false, message: "定員を超えるため、有効に戻せません。", event_id: event.id };
    }

    const { error: updateRegistrationError } = await supabaseAdmin()
      .from("registrations")
      .update({
        status,
        cancelled_at: status === "cancelled" ? timestamp : null,
        cancellation_reason: status === "cancelled" ? "管理者操作" : null
      })
      .eq("id", registration.id);
    if (updateRegistrationError) return { ok: false, message: updateRegistrationError.message, event_id: event.id };

    const nextEventStatus = event.status === "full" && nextCount < event.max_participants ? "open" : event.status === "open" && nextCount >= event.max_participants ? "full" : event.status;
    const { error: updateEventError } = await supabaseAdmin()
      .from("events")
      .update({ current_participants: nextCount, status: nextEventStatus, updated_at: timestamp })
      .eq("id", event.id);
    if (updateEventError) return { ok: false, message: updateEventError.message, event_id: event.id };

    return { ok: true, event_id: event.id };
  }

  const store = readLocalStore();
  const registration = store.registrations.find((item) => item.id === registrationId);
  if (!registration) return { ok: false, message: "申込が見つかりません。" };
  const currentStatus = registrationStatus(registration);
  if (currentStatus === status) return { ok: true, event_id: registration.event_id };
  const event = store.events.find((item) => item.id === registration.event_id);
  if (!event) return { ok: false, message: "活動が見つかりません。", event_id: registration.event_id };

  const delta = status === "cancelled" ? -registration.number_of_people : registration.number_of_people;
  const nextCount = Math.max(event.current_participants + delta, 0);
  if (status === "active" && nextCount > event.max_participants) {
    return { ok: false, message: "定員を超えるため、有効に戻せません。", event_id: event.id };
  }

  store.registrations = store.registrations.map((item) =>
    item.id === registrationId
      ? {
          ...item,
          status,
          cancelled_at: status === "cancelled" ? timestamp : null,
          cancellation_reason: status === "cancelled" ? "管理者操作" : null
        }
      : item
  );
  store.events = store.events.map((item) =>
    item.id === event.id
      ? {
          ...item,
          current_participants: nextCount,
          status: item.status === "full" && nextCount < item.max_participants ? "open" : item.status === "open" && nextCount >= item.max_participants ? "full" : item.status,
          updated_at: timestamp
        }
      : item
  );
  writeLocalStore(store);
  return { ok: true, event_id: event.id };
}

export function csvEscape(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function parseEventForm(formData: FormData): Omit<Event, "id" | "created_at" | "updated_at"> {
  const start = String(formData.get("start_datetime") ?? "");
  const end = String(formData.get("end_datetime") ?? "");
  return {
    title: String(formData.get("title") ?? ""),
    sport_type: String(formData.get("sport_type") ?? "badminton") as SportType,
    area: String(formData.get("area") ?? "osaka") as Area,
    venue_name: String(formData.get("venue_name") ?? ""),
    address: String(formData.get("address") ?? ""),
    start_datetime: start.length === 16 ? `${start}:00+09:00` : start,
    end_datetime: end.length === 16 ? `${end}:00+09:00` : end,
    fee: Number(formData.get("fee") ?? 0),
    max_participants: Number(formData.get("max_participants") ?? 1),
    current_participants: Number(formData.get("current_participants") ?? 0),
    level: String(formData.get("level") ?? "anyone") as Event["level"],
    organizer_name: String(formData.get("organizer_name") ?? ""),
    organizer_contact_type: String(formData.get("organizer_contact_type") ?? "email") as Event["organizer_contact_type"],
    organizer_contact_value: String(formData.get("organizer_contact_value") ?? ""),
    description: String(formData.get("description") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    status: String(formData.get("status") ?? "open") as EventStatus
  };
}

export function yen(value: number) {
  return value <= 0 ? "無料" : `${value.toLocaleString("ja-JP")}円`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit", weekday: "short", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function formatDateTimeJST(value: string) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo"
  }).formatToParts(new Date(value));

  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}/${part("month")}/${part("day")} ${part("hour")}:${part("minute")}:${part("second")}`;
}

export function datetimeLocal(value: string) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo"
  }).formatToParts(new Date(value));

  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
