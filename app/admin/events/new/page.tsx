import Link from "next/link";
import { createEventAction, requireAdmin } from "@/app/actions";
import { EventForm } from "@/components/event-form";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/admin">
        管理画面へ戻る
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <h1 className="mb-1 text-xl font-black text-slate-950">活動を作成</h1>
        <p className="mb-4 text-sm text-slate-600">公開する活動情報を入力してください。</p>
        <EventForm action={createEventAction} />
      </section>
    </main>
  );
}
