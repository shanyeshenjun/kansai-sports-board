import Link from "next/link";
import { notFound } from "next/navigation";
import { changeRegistrationStatusAction, requireAdmin } from "@/app/actions";
import { genderName, registrationStatusName, skillLevelName } from "@/lib/constants";
import { formatDate, formatDateTimeJST, formatTime, getAdminEvent, listRegistrations } from "@/lib/store";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegistrationsPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const event = await getAdminEvent(id);
  if (!event) notFound();
  const registrations = await listRegistrations(id);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/admin">
        管理画面へ戻る
      </Link>
      <section className="mt-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-950">参加者一覧</h1>
            <p className="mt-1 text-sm text-slate-600">
              {event.title} / {formatDate(event.start_datetime)} {formatTime(event.start_datetime)}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              参加者情報は活動連絡のためだけに利用してください。不要になったテスト申し込みは Supabase の cleanup SQL で整理できます。
            </p>
          </div>
          <a
            className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-bold"
            href={`/admin/events/${event.id}/registrations/export`}
          >
            CSVをダウンロード
          </a>
        </div>
        {query.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}

        {registrations.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-slate-500">
                <tr>
                  <th className="whitespace-nowrap py-2 pr-4">名前</th>
                  <th className="whitespace-nowrap py-2 pr-4">連絡先</th>
                  <th className="whitespace-nowrap py-2 pr-4">人数</th>
                  <th className="whitespace-nowrap py-2 pr-4">状態</th>
                  <th className="whitespace-nowrap py-2 pr-4">表示名</th>
                  <th className="whitespace-nowrap py-2 pr-4">性別</th>
                  <th className="whitespace-nowrap py-2 pr-4">レベル</th>
                  <th className="whitespace-nowrap py-2 pr-4">公開</th>
                  <th className="whitespace-nowrap py-2 pr-4">備考</th>
                  <th className="whitespace-nowrap py-2 pr-4">キャンセルコード</th>
                  <th className="whitespace-nowrap py-2 pr-4">キャンセル日時</th>
                  <th className="whitespace-nowrap py-2 pr-4">キャンセル理由</th>
                  <th className="whitespace-nowrap py-2 pr-4">申込日時</th>
                  <th className="whitespace-nowrap py-2 pr-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr className={`border-b border-line last:border-b-0 ${(registration.status ?? "active") === "cancelled" ? "bg-slate-50 text-slate-500" : ""}`} key={registration.id}>
                    <td className="whitespace-nowrap py-3 pr-4 font-bold">{registration.participant_name}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.contact}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.number_of_people}</td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-black ${
                          (registration.status ?? "active") === "cancelled" ? "bg-slate-200 text-slate-600" : "bg-teal-50 text-teal-800"
                        }`}
                      >
                        {registrationStatusName(registration.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.display_name || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{genderName(registration.gender)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{skillLevelName(registration.skill_level)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.is_public ? "公開" : "非公開"}</td>
                    <td className="min-w-48 py-3 pr-4">{registration.note || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4 font-mono">{registration.cancel_code || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.cancelled_at ? formatDateTimeJST(registration.cancelled_at) : "-"}</td>
                    <td className="min-w-48 py-3 pr-4">{registration.cancellation_reason || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{formatDateTimeJST(registration.created_at)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <form action={changeRegistrationStatusAction}>
                        <input name="event_id" type="hidden" value={event.id} />
                        <input name="registration_id" type="hidden" value={registration.id} />
                        <input name="status" type="hidden" value={(registration.status ?? "active") === "cancelled" ? "active" : "cancelled"} />
                        <button className="rounded-md border border-line px-3 py-1.5 text-xs font-bold text-slate-700" type="submit">
                          {(registration.status ?? "active") === "cancelled" ? "有効に戻す" : "キャンセル済みにする"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-md bg-slate-100 p-4 text-sm text-slate-600">まだ申し込みはありません。</p>
        )}
      </section>
    </main>
  );
}
