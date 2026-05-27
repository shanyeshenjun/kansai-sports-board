import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteOrganizerEventAction, requireOrganizer, updateOrganizerEventAction } from "@/app/actions";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventForm } from "@/components/event-form";
import { getOrganizerEvent } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function OrganizerEditEventPage({ params }: { params: Params }) {
  const organizer = await requireOrganizer();
  const { id } = await params;
  const event = await getOrganizerEvent(id, organizer.id);
  if (!event) notFound();
  const deleted = Boolean(event.deleted_at);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/organizer">
        主催者后台へ戻る
      </Link>
      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-black text-slate-950">活動を編集</h1>
            <p className="text-sm text-slate-600">自分が作成した活動だけを編集できます。</p>
            {deleted ? <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">この活動は削除済みです。一般ページには表示されません。</p> : null}
          </div>
          {deleted ? null : <DeleteEventButton eventId={event.id} action={deleteOrganizerEventAction} className="touch-target rounded-md border border-red-200 px-4 py-3 text-sm font-bold text-red-700" />}
        </div>
        <EventForm event={event} action={updateOrganizerEventAction.bind(null, event.id)} showCurrentParticipants={false} />
      </section>
    </main>
  );
}
