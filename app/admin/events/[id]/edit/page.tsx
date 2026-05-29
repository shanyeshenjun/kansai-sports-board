import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEventAction, requireAdmin, updateEventAction } from "@/app/actions";
import { DeleteEventButton } from "@/components/delete-event-button";
import { EventForm } from "@/components/event-form";
import { T } from "@/components/language-ui";
import { getAdminEvent } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function EditEventPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const event = await getAdminEvent(id);
  if (!event) notFound();
  const deleted = Boolean(event.deleted_at);
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/admin">
        <T textKey="backToAdmin" />
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-black text-slate-950">
              <T textKey="editEvent" />
            </h1>
            <p className="text-sm text-slate-600">
              <T textKey="editEventDescription" />
            </p>
            {deleted ? (
              <p className="mt-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
                <T textKey="deletedEventNotice" />
              </p>
            ) : null}
          </div>
          {deleted ? null : <DeleteEventButton eventId={event.id} action={deleteEventAction} className="touch-target rounded-md border border-red-200 px-4 py-3 text-sm font-bold text-red-700" />}
        </div>
        <EventForm event={event} action={updateEventAction.bind(null, event.id)} />
      </section>
    </main>
  );
}
