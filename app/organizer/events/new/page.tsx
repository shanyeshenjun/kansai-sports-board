import Link from "next/link";
import { createOrganizerEventAction, requireOrganizer } from "@/app/actions";
import { EventForm } from "@/components/event-form";

export default async function OrganizerNewEventPage() {
  await requireOrganizer();
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/organizer">
        主催者后台へ戻る
      </Link>
      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <h1 className="mb-1 text-xl font-black text-slate-950">活動を作成</h1>
        <p className="mb-4 text-sm text-slate-600">作成した活動は、この主催者アカウントに紐づきます。</p>
        <EventForm action={createOrganizerEventAction} showCurrentParticipants={false} />
      </section>
    </main>
  );
}
