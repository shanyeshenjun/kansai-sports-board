import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Area, Event, EventStatus, Registration, SportType } from "@/lib/types";

type Store = {
  events: Event[];
  registrations: Registration[];
};

type RegistrationResult = {
  ok: boolean;
  message?: string;
};

type EventFilters = {
  sport_type?: string;
  area?: string;
  date?: string;
  onlyOpen?: boolean;
  includeDeleted?: boolean;
};

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
    created_at: now
  }
];

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
    registrations: store.registrations.map((item) => ({ ...item }))
  };
}

function seedStore(): Store {
  return cloneStore({ events: seedEvents, registrations: seedRegistrations });
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
    return JSON.parse(readFileSync(dataFile, "utf8")) as Store;
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

function visibleStatus(event: Event): Event {
  if (isDeleted(event)) return event;
  if (event.status === "cancelled" || event.status === "finished" || event.status === "full") return event;
  if (event.current_participants >= event.max_participants) return { ...event, status: "full" };
  if (new Date(event.end_datetime).getTime() < Date.now()) return { ...event, status: "finished" };
  return event;
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

export async function saveEvent(input: Omit<Event, "id" | "created_at" | "updated_at">, id?: string) {
  const timestamp = new Date().toISOString();

  if (supabaseConfigured()) {
    if (id) {
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
      .insert({ ...input, id: eventId, created_at: timestamp, updated_at: timestamp });
    if (error) throw new Error(error.message);
    return eventId;
  }

  const store = readLocalStore();
  if (id) {
    store.events = store.events.map((event) => (event.id === id ? { ...event, ...input, updated_at: timestamp } : event));
    writeLocalStore(store);
    return id;
  }

  const eventId = randomUUID();
  store.events.unshift({ ...input, id: eventId, created_at: timestamp, updated_at: timestamp });
  writeLocalStore(store);
  return eventId;
}

export async function setEventStatus(id: string, status: EventStatus) {
  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("events").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.events = store.events.map((event) => (event.id === id ? { ...event, status, updated_at: new Date().toISOString() } : event));
  writeLocalStore(store);
}

export async function softDeleteEvent(id: string) {
  const timestamp = new Date().toISOString();

  if (supabaseConfigured()) {
    const { error } = await supabaseAdmin().from("events").update({ deleted_at: timestamp, updated_at: timestamp }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  const store = readLocalStore();
  store.events = store.events.map((event) => (event.id === id ? { ...event, deleted_at: timestamp, updated_at: timestamp } : event));
  writeLocalStore(store);
}

export async function register(eventId: string, input: { participant_name: string; contact: string; number_of_people: number; note: string }): Promise<RegistrationResult> {
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
        p_note: input.note
      })
      .single();

    if (error) return { ok: false, message: error.message };
    const result = data as RegistrationResult;
    return { ok: result.ok, message: result.message };
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

  store.registrations.push({ id: randomUUID(), event_id: eventId, ...input, created_at: new Date().toISOString() });
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
  return { ok: true };
}

export async function listRegistrations(eventId: string) {
  if (supabaseConfigured()) {
    const { data, error } = await supabaseAdmin().from("registrations").select("*").eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Registration[];
  }

  return readLocalStore().registrations.filter((item) => item.event_id === eventId);
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
