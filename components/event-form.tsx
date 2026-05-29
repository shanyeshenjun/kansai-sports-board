import type { InputHTMLAttributes } from "react";
import type { ReactNode } from "react";
import { T } from "@/components/language-ui";
import { areas, contactTypes, levels, sports, statuses } from "@/lib/constants";
import type { TranslationKey } from "@/lib/i18n";
import type { Event } from "@/lib/types";
import { TimeSlotFields } from "@/components/time-slot-fields";
import { VenueSelectFields } from "@/components/venue-select-fields";

export function EventForm({ event, action, showCurrentParticipants = true }: { event?: Event; action: (formData: FormData) => Promise<void>; showCurrentParticipants?: boolean }) {
  return (
    <form action={action} className="grid gap-4">
      <Field name="title" labelKey="eventTitle" defaultValue={event?.title} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="sport_type" labelKey="sportType" defaultValue={event?.sport_type} options={sports.map((item) => [item.value, item.label])} />
        <Select name="area" labelKey="area" defaultValue={event?.area} options={areas.map((item) => [item.value, item.label])} />
      </div>
      <VenueSelectFields defaultValue={event?.venue_name} />
      <Field name="address" labelKey="address" defaultValue={event?.address} required />
      <TimeSlotFields defaultStart={event?.start_datetime} defaultEnd={event?.end_datetime} />
      <div className={`grid gap-4 ${showCurrentParticipants ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <Field name="fee" labelKey="participantFeeYen" type="number" min="0" defaultValue={event?.fee ?? 0} required />
        <Field name="max_participants" labelKey="maxParticipants" type="number" min="1" defaultValue={event?.max_participants ?? 12} required />
        {showCurrentParticipants ? (
          <Field name="current_participants" labelKey="currentParticipants" type="number" min="0" defaultValue={event?.current_participants ?? 0} required />
        ) : (
          <input name="current_participants" type="hidden" value={event?.current_participants ?? 0} />
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="level" labelKey="level" defaultValue={event?.level} options={levels.map((item) => [item.value, item.label])} />
        <Select name="status" labelKey="status" defaultValue={event?.status ?? "open"} options={statuses.map((item) => [item.value, item.label])} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="organizer_name" labelKey="organizerName" defaultValue={event?.organizer_name} required />
        <Select name="organizer_contact_type" labelKey="contactType" defaultValue={event?.organizer_contact_type} options={contactTypes.map((item) => [item.value, item.label])} />
        <Field name="organizer_contact_value" labelKey="contact" defaultValue={event?.organizer_contact_value} required />
      </div>
      <TextArea name="description" labelKey="eventContent" defaultValue={event?.description} required />
      <TextArea name="notes" labelKey="notes" defaultValue={event?.notes} />
      <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
        <T textKey={event ? "update" : "createEvent"} />
      </button>
    </form>
  );
}

function Field(props: InputHTMLAttributes<HTMLInputElement> & { labelKey: TranslationKey; name: string }) {
  const { labelKey, name, ...inputProps } = props;
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      <T textKey={labelKey} />
      <input className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" name={name} {...inputProps} />
    </label>
  );
}

function TextArea({ labelKey, name, defaultValue, required }: { labelKey: TranslationKey; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      <T textKey={labelKey} />
      <textarea className="min-h-28 rounded-md border border-line bg-white px-3 py-2 font-normal" name={name} defaultValue={defaultValue} required={required} />
    </label>
  );
}

function Select({ labelKey, name, defaultValue, options }: { labelKey: TranslationKey; name: string; defaultValue?: string; options: Array<[string, ReactNode]> }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-800">
      <T textKey={labelKey} />
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
