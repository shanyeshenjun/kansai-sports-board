"use client";

import { useMemo, useState } from "react";
import { timeSlotOptions } from "@/lib/constants";

const customSlot = "custom";

function datePartsJST(value?: string) {
  const date = value ? new Date(value) : new Date();
  const parts = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo"
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`
  };
}

function datetimeLocalJST(value?: string) {
  const parts = datePartsJST(value);
  return `${parts.date}T${parts.time}`;
}

export function TimeSlotFields({ defaultStart, defaultEnd }: { defaultStart?: string; defaultEnd?: string }) {
  const start = datePartsJST(defaultStart);
  const end = datePartsJST(defaultEnd);
  const matchingSlot = timeSlotOptions.find((slot) => slot.start === start.time && slot.end === end.time);
  const [date, setDate] = useState(defaultStart ? start.date : "");
  const [slotValue, setSlotValue] = useState<string>(matchingSlot?.value ?? timeSlotOptions[0].value);
  const [customStart, setCustomStart] = useState(defaultStart ? datetimeLocalJST(defaultStart) : "");
  const [customEnd, setCustomEnd] = useState(defaultEnd ? datetimeLocalJST(defaultEnd) : "");

  const selectedSlot = timeSlotOptions.find((slot) => slot.value === slotValue);
  const startDatetime = useMemo(() => (selectedSlot ? `${date}T${selectedSlot.start}` : customStart), [customStart, date, selectedSlot]);
  const endDatetime = useMemo(() => (selectedSlot ? `${date}T${selectedSlot.end}` : customEnd), [customEnd, date, selectedSlot]);

  return (
    <div className="grid gap-4">
      <input name="start_datetime" type="hidden" value={startDatetime} />
      <input name="end_datetime" type="hidden" value={endDatetime} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-bold text-slate-800">
          開催日
          <input className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-800">
          時間帯
          <select className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" value={slotValue} onChange={(event) => setSlotValue(event.target.value)}>
            {timeSlotOptions.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
            <option value={customSlot}>カスタム時間</option>
          </select>
        </label>
      </div>
      {slotValue === customSlot ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            開始日時
            <input className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" type="datetime-local" required value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            終了日時
            <input className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" type="datetime-local" required value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          </label>
        </div>
      ) : null}
    </div>
  );
}
