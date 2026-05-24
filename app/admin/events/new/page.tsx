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
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <p className="font-black">入力の目安</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>会場名と住所は、参加者が迷わない程度に具体的に入力してください。</li>
            <li>費用は1人あたりの目安を円で入力し、無料の場合は0にしてください。</li>
            <li>最大人数は、安全に運営できる人数にしてください。</li>
            <li>初心者歓迎の場合は、レベルを「初心者歓迎」または「誰でもOK」にしてください。</li>
            <li>連絡先には、公開してもよい微信、LINE、Instagram、メール、電話だけを入力してください。</li>
          </ul>
        </div>
        <EventForm action={createEventAction} />
      </section>
    </main>
  );
}
