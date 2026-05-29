"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-ui";
import { venueShortName } from "@/lib/constants";
import { translatedStatusKey } from "@/lib/i18n";
import type { Event, EventStatus } from "@/lib/types";

type CalendarEvent = Event & { dateKey: string; startTime: string; endTime: string };

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const markerColors: Record<EventStatus, string> = {
  open: "bg-teal-600",
  full: "bg-amber-500",
  finished: "bg-slate-300",
  cancelled: "bg-red-300"
};

const summaryStyles: Record<EventStatus, string> = {
  open: "border-teal-100 bg-teal-50 text-teal-900 hover:border-teal-300 hover:text-teal-800",
  full: "border-amber-100 bg-amber-50 text-amber-900 hover:border-amber-300",
  finished: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
  cancelled: "border-red-100 bg-red-50 text-red-700 hover:border-red-200"
};

function jstParts(value: string | Date) {
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
  return {
    year: Number(part("year")),
    month: Number(part("month")),
    day: Number(part("day")),
    dateKey: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`
  };
}

function monthLabel(year: number, month: number) {
  return `${year}年${String(month).padStart(2, "0")}月`;
}

function dayOfWeek(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addMonths(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta;
  return {
    year: Math.floor(index / 12),
    month: (index % 12) + 1
  };
}

export function EventCalendar({ events }: { events: Event[] }) {
  const { t } = useLanguage();
  const calendarEvents = useMemo(
    () =>
      events
        .map((event) => {
          const start = jstParts(event.start_datetime);
          const end = jstParts(event.end_datetime);
          return { ...event, dateKey: start.dateKey, startTime: start.time, endTime: end.time };
        })
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()),
    [events]
  );

  const todayKey = jstParts(new Date()).dateKey;
  const initialDate = calendarEvents[0]?.dateKey ?? todayKey;
  const initial = useMemo(() => jstParts(`${initialDate}T00:00:00+09:00`), [initialDate]);
  const [visibleMonth, setVisibleMonth] = useState({ year: initial.year, month: initial.month });
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of calendarEvents) {
      map.set(event.dateKey, [...(map.get(event.dateKey) ?? []), event]);
    }
    return map;
  }, [calendarEvents]);

  const days = useMemo(() => {
    const daysInMonth = new Date(Date.UTC(visibleMonth.year, visibleMonth.month, 0)).getUTCDate();
    const firstDayOffset = dayOfWeek(visibleMonth.year, visibleMonth.month, 1);
    return [
      ...Array.from({ length: firstDayOffset }, (_, index) => ({ key: `blank-${index}`, day: null as number | null, dateKey: "" })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        return {
          key: String(day),
          day,
          dateKey: `${visibleMonth.year}-${String(visibleMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        };
      })
    ];
  }, [visibleMonth]);

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  function moveMonth(delta: number) {
    const next = addMonths(visibleMonth.year, visibleMonth.month, delta);
    setVisibleMonth(next);
    setSelectedDate(`${next.year}-${String(next.month).padStart(2, "0")}-01`);
  }

  return (
    <aside className="rounded-lg border border-line bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-950">{t("calendar")}</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{t("date")} / {t("openNow")}</p>
        </div>
        <div className="flex gap-1">
          <button className="touch-target h-9 w-9 rounded-md border border-line text-sm font-black" type="button" onClick={() => moveMonth(-1)} aria-label={t("previousMonth")}>
            &lt;
          </button>
          <button className="touch-target h-9 w-9 rounded-md border border-line text-sm font-black" type="button" onClick={() => moveMonth(1)} aria-label={t("nextMonth")}>
            &gt;
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-sm font-black text-slate-800">{monthLabel(visibleMonth.year, visibleMonth.month)}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500">
        {weekdays.map((weekday) => (
          <div key={weekday}>{weekday}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((item) => {
          if (!item.day) return <div key={item.key} className="aspect-square" />;
          const dayEvents = eventsByDate.get(item.dateKey) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isToday = item.dateKey === todayKey;
          const isSelected = item.dateKey === selectedDate;

          return (
            <button
              key={item.key}
              className={`aspect-square rounded-md border text-sm font-black transition ${
                isSelected ? "border-teal-700 bg-teal-50 text-teal-900" : isToday ? "border-amber-300 bg-amber-50 text-amber-900" : "border-transparent text-slate-800 hover:border-line hover:bg-slate-50"
              }`}
              type="button"
              onClick={() => setSelectedDate(item.dateKey)}
            >
              <span className="block leading-5">{item.day}</span>
              <span className="mt-0.5 flex h-1.5 justify-center gap-0.5">
                {hasEvents
                  ? dayEvents.slice(0, 3).map((event) => <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${markerColors[event.status]}`} />)
                  : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-500">{t("selectedDateEvents", { date: selectedDate.replaceAll("-", "/") })}</p>
        {selectedEvents.length ? (
          <div className="mt-2 grid gap-2">
            {selectedEvents.map((event) => (
              <Link key={event.id} className={`rounded-md border px-3 py-2 text-sm font-bold ${summaryStyles[event.status]}`} href={`/events/${event.id}`}>
                <span className="block truncate">
                  {venueShortName(event.venue_name)} {event.startTime}-{event.endTime}
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
                  {t(translatedStatusKey(event.status))} / {event.title}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm font-medium text-slate-500">{t("noEventsOnDate")}</p>
        )}
      </div>
    </aside>
  );
}
