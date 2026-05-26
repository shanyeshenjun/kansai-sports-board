"use client";

export function DeleteEventButton({
  eventId,
  action,
  className = "touch-target w-full rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
}: {
  eventId: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm("この活動を削除しますか？\n参加申込データがある場合、その扱いに注意してください。");
        if (!confirmed) event.preventDefault();
      }}
    >
      <input name="event_id" type="hidden" value={eventId} />
      <button className={className} type="submit">
        削除
      </button>
    </form>
  );
}
