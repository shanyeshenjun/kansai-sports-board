import Link from "next/link";
import { areaName, sportName, statusName } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { formatDate, formatTime, yen } from "@/lib/store";

export function EventCard({ event }: { event: Event }) {
  const sport = sportName(event.sport_type);
  const area = areaName(event.area);
  const status = statusName(event.status);
  const remaining = Math.max(event.max_participants - event.current_participants, 0);
  const isClosed = event.status === "finished" || event.status === "cancelled";
  const isAlmostFull = event.status === "open" && remaining > 0 && remaining <= Math.max(2, Math.ceil(event.max_participants * 0.2));
  const seatsText = event.status === "open" ? (isAlmostFull ? `残りわずか ${remaining}名` : `残り${remaining}名`) : status.label;
  const seatsPanel = isAlmostFull ? "border-yellow-200 bg-yellow-50 text-yellow-900" : status.panel;

  return (
    <article className={`border-l-4 ${sport.border} rounded-xl border-y border-r border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isClosed ? "opacity-75" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-black/5 ${sport.color}`}>
            {sport.label}
            <span className="ml-1 text-[11px] font-semibold opacity-80">{sport.zh}</span>
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{area.label}</span>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${status.color}`}>{status.label}</span>
      </div>

      <h2 className="mt-3 text-lg font-black leading-snug text-slate-950">{event.title}</h2>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <Info label="日付" value={formatDate(event.start_datetime)} tone="teal" />
        <Info label="時間" value={`${formatTime(event.start_datetime)}-${formatTime(event.end_datetime)}`} tone="slate" />
        <Info label="会場" value={event.venue_name} wide />
        <Info label="費用" value={yen(event.fee)} />
        <Info label="定員" value={`${event.current_participants}/${event.max_participants}名`} />
      </dl>

      <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-black ${seatsPanel}`}>
        {seatsText}
      </div>

      <Link className="touch-target mt-3 flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm" href={`/events/${event.id}`}>
        詳細を見る
      </Link>
    </article>
  );
}

function Info({ label, value, wide = false, tone = "slate" }: { label: string; value: string; wide?: boolean; tone?: "slate" | "teal" }) {
  return (
    <div className={`${wide ? "col-span-2" : ""} rounded-lg bg-slate-50 px-3 py-2`}>
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className={`mt-0.5 truncate font-black ${tone === "teal" ? "text-teal-800" : "text-slate-800"}`}>{value}</dd>
    </div>
  );
}
