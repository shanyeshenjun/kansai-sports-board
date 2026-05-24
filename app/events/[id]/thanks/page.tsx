import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="rounded-lg border border-line bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-950">申し込みを受け付けました</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">主催者の連絡先から、最終的な参加方法を確認してください。</p>
        <Link className="touch-target mt-5 flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/">
          活動一覧へ戻る
        </Link>
      </div>
    </main>
  );
}
