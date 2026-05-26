import Link from "next/link";
import { confirmCancellationAction, lookupCancellationAction, readCancellationRequestCookie } from "@/app/actions";
import { formatCancelDeadlineJST, formatDate, formatTime, getCancellationPreview } from "@/lib/store";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CancelPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : "";
  const isSuccess = query.success === "1";
  const isConfirm = query.confirm === "1";

  if (isSuccess) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <section className="w-full rounded-lg border border-line bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">キャンセルを受け付けました</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">参加人数を更新しました。必要に応じて主催者にもご連絡ください。</p>
          <Link className="touch-target mt-5 flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/">
            活動一覧へ戻る
          </Link>
        </section>
      </main>
    );
  }

  if (isConfirm) {
    const request = await readCancellationRequestCookie();
    const preview = request?.registration_id && request.cancel_code ? await getCancellationPreview(request.registration_id, request.cancel_code) : null;

    return (
      <main className="mx-auto min-h-screen max-w-md px-4 py-6">
        <Link className="text-sm font-bold text-teal-700" href="/">
          活動一覧へ戻る
        </Link>
        <section className="mt-4 rounded-lg border border-line bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-slate-950">申込キャンセル</h1>
          {!preview ? (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
              キャンセル情報の有効期限が切れました。もう一度入力してください。
            </p>
          ) : !preview.ok ? (
            <p className="mt-4 whitespace-pre-line rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{preview.message}</p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-slate-600">以下の申し込みをキャンセルします。内容を確認してください。</p>
              <dl className="mt-4 grid gap-2 text-sm">
                <Info label="活動" value={preview.event.title} />
                <Info label="日時" value={`${formatDate(preview.event.start_datetime)} ${formatTime(preview.event.start_datetime)}-${formatTime(preview.event.end_datetime)}`} />
                <Info label="会場" value={preview.event.venue_name} />
                <Info label="人数" value={`${preview.registration.number_of_people}名`} />
                <Info label="期限" value={formatCancelDeadlineJST(preview.event.start_datetime)} />
              </dl>
              {preview.event.deleted_at ? <p className="mt-3 rounded-md bg-slate-100 p-3 text-xs font-bold text-slate-600">この活動は現在、一般公開されていません。</p> : null}
              {request?.reason ? <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">理由: {request.reason}</p> : null}
              <form action={confirmCancellationAction} className="mt-5">
                <button className="touch-target w-full rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white" type="submit">
                  キャンセルを確定する
                </button>
              </form>
            </>
          )}
          <Link className="touch-target mt-3 flex items-center justify-center rounded-md border border-line px-4 py-3 text-sm font-black text-slate-700" href="/cancel">
            入力画面へ戻る
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <Link className="text-sm font-bold text-teal-700" href="/">
        活動一覧へ戻る
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black text-slate-950">申込キャンセル</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          申し込み完了時に表示された申込IDとキャンセルコードを入力してください。自助キャンセルは活動前日の13:00までです。
        </p>
        {error ? <p className="mt-4 whitespace-pre-line rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{error}</p> : null}
        <form action={lookupCancellationAction} className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            申込ID
            <input className="touch-target rounded-md border border-line px-3 font-mono" name="registration_id" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            キャンセルコード
            <input className="touch-target rounded-md border border-line px-3 font-mono uppercase" name="cancel_code" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            キャンセル理由（任意）
            <textarea className="min-h-24 rounded-md border border-line px-3 py-2" name="cancellation_reason" />
          </label>
          <p className="rounded-md bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
            自助キャンセル期限を過ぎている場合は、このページからは手続きできません。主催者または管理者までご連絡ください。
          </p>
          <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
            内容を確認する
          </button>
        </form>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-3 border-b border-line py-2 last:border-b-0">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}
