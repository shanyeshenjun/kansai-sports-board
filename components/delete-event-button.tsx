"use client";

import { useLanguage } from "@/components/language-ui";

export function DeleteEventButton({
  eventId,
  action,
  className = "touch-target w-full rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
}: {
  eventId: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(`${t("delete")}?\n${t("participants")} / ${t("notes")}`);
        if (!confirmed) event.preventDefault();
      }}
    >
      <input name="event_id" type="hidden" value={eventId} />
      <button className={className} type="submit">
        {t("delete")}
      </button>
    </form>
  );
}
