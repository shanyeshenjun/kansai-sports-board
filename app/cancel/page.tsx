import Link from "next/link";
import type { ReactNode } from "react";
import { confirmCancellationAction, lookupCancellationAction, readCancellationRequestCookie } from "@/app/actions";
import { T } from "@/components/language-ui";
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
          <h1 className="text-xl font-black text-slate-950"><T textKey="cancelSuccessTitle" /></h1>
          <p className="mt-3 text-sm leading-6 text-slate-600"><T textKey="cancelSuccessBody" /></p>
          <Link className="touch-target mt-5 flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/">
            <T textKey="backToList" />
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
          <T textKey="backToList" />
        </Link>
        <section className="mt-4 rounded-lg border border-line bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-slate-950"><T textKey="cancelPageTitle" /></h1>
          {!preview ? (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
              キャンセル情報の有効期限が切れました。もう一度入力してください。
            </p>
          ) : !preview.ok ? (
            <p className="mt-4 whitespace-pre-line rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{preview.message}</p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-slate-600"><T textKey="checkDetails" /></p>
              <dl className="mt-4 grid gap-2 text-sm">
                <Info label={<T textKey="eventContent" />} value={preview.event.title} />
                <Info label={<T textKey="time" />} value={`${formatDate(preview.event.start_datetime)} ${formatTime(preview.event.start_datetime)}-${formatTime(preview.event.end_datetime)}`} />
                <Info label={<T textKey="venue" />} value={preview.event.venue_name} />
                <Info label={<T textKey="people" />} value={`${preview.registration.number_of_people}名`} />
                <Info label={<T textKey="date" />} value={formatCancelDeadlineJST(preview.event.start_datetime)} />
              </dl>
              {preview.event.deleted_at ? <p className="mt-3 rounded-md bg-slate-100 p-3 text-xs font-bold text-slate-600">この活動は現在、一般公開されていません。</p> : null}
              {request?.reason ? <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">理由: {request.reason}</p> : null}
              <form action={confirmCancellationAction} className="mt-5">
                <button className="touch-target w-full rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white" type="submit">
                  <T textKey="confirmCancel" />
                </button>
              </form>
            </>
          )}
          <Link className="touch-target mt-3 flex items-center justify-center rounded-md border border-line px-4 py-3 text-sm font-black text-slate-700" href="/cancel">
            <T textKey="backToInput" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <Link className="text-sm font-bold text-teal-700" href="/">
        <T textKey="backToList" />
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black text-slate-950"><T textKey="cancelPageTitle" /></h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          <T textKey="cancelFormDescription" />
        </p>
        {error ? <p className="mt-4 whitespace-pre-line rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{error}</p> : null}
        <form action={lookupCancellationAction} className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            <T textKey="registrationId" />
            <input className="touch-target rounded-md border border-line px-3 font-mono" name="registration_id" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            <T textKey="cancelCode" />
            <input className="touch-target rounded-md border border-line px-3 font-mono uppercase" name="cancel_code" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            <T textKey="cancellationReason" />
            <textarea className="min-h-24 rounded-md border border-line px-3 py-2" name="cancellation_reason" />
          </label>
          <p className="rounded-md bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
            自助キャンセル期限を過ぎている場合は、このページからは手続きできません。主催者または管理者までご連絡ください。
          </p>
          <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
            <T textKey="checkDetails" />
          </button>
        </form>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="grid grid-cols-[78px_1fr] gap-3 border-b border-line py-2 last:border-b-0">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}
