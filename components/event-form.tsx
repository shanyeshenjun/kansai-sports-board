import type { InputHTMLAttributes } from "react";
import { areas, contactTypes, levels, sports, statuses } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { TimeSlotFields } from "@/components/time-slot-fields";
import { VenueSelectFields } from "@/components/venue-select-fields";

export function EventForm({ event, action }: { event?: Event; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="grid gap-4">
      <Field name="title" label="活動タイトル" defaultValue={event?.title} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="sport_type" label="種目" defaultValue={event?.sport_type} options={sports.map((item) => [item.value, item.label])} />
        <Select name="area" label="エリア" defaultValue={event?.area} options={areas.map((item) => [item.value, item.label])} />
      </div>
      <VenueSelectFields defaultValue={event?.venue_name} />
      <Field name="address" label="住所" defaultValue={event?.address} required />
      <TimeSlotFields defaultStart={event?.start_datetime} defaultEnd={event?.end_datetime} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="fee" label="参加費（円）" type="number" min="0" defaultValue={event?.fee ?? 0} required />
        <Field name="max_participants" label="最大人数" type="number" min="1" defaultValue={event?.max_participants ?? 12} required />
        <Field name="current_participants" label="現在人数" type="number" min="0" defaultValue={event?.current_participants ?? 0} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="level" label="レベル" defaultValue={event?.level} options={levels.map((item) => [item.value, item.label])} />
        <Select name="status" label="ステータス" defaultValue={event?.status ?? "open"} options={statuses.map((item) => [item.value, item.label])} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="organizer_name" label="主催者名" defaultValue={event?.organizer_name} required />
        <Select name="organizer_contact_type" label="連絡先タイプ" defaultValue={event?.organizer_contact_type} options={contactTypes.map((item) => [item.value, item.label])} />
        <Field name="organizer_contact_value" label="連絡先" defaultValue={event?.organizer_contact_value} required />
      </div>
      <TextArea name="description" label="活動内容" defaultValue={event?.description} required />
      <TextArea name="notes" label="注意事項" defaultValue={event?.notes} />
      <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
        {event ? "更新する" : "活動を作成"}
      </button>
    </form>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, name, ...inputProps } = props;
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      {label}
      <input className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" name={name} {...inputProps} />
    </label>
  );
}

function TextArea({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      {label}
      <textarea className="min-h-28 rounded-md border border-line bg-white px-3 py-2 font-normal" name={name} defaultValue={defaultValue} required={required} />
    </label>
  );
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[][] }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      {label}
      <select className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" name={name} defaultValue={defaultValue}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
