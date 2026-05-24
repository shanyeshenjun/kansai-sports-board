import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, updateEventAction } from "@/app/actions";
import { EventForm } from "@/components/event-form";
import { getEvent } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function EditEventPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/admin">
        管理画面へ戻る
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <h1 className="mb-1 text-xl font-black text-slate-950">活動を編集</h1>
        <p className="mb-4 text-sm text-slate-600">内容を変更して「更新する」を押してください。</p>
        <EventForm event={event} action={updateEventAction.bind(null, event.id)} />
      </section>
    </main>
  );
}
