import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrganizer } from "@/app/actions";
import { genderName, registrationStatusName, skillLevelName } from "@/lib/constants";
import { formatDate, formatDateTimeJST, formatTime, getOrganizerEvent, listRegistrations } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function OrganizerRegistrationsPage({ params }: { params: Params }) {
  const organizer = await requireOrganizer();
  const { id } = await params;
  const event = await getOrganizerEvent(id, organizer.id);
  if (!event) notFound();
  const registrations = await listRegistrations(id);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/organizer">
        主催者后台へ戻る
      </Link>
      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-950">参加者一覧</h1>
            <p className="mt-1 text-sm text-slate-600">
              {event.title} / {formatDate(event.start_datetime)} {formatTime(event.start_datetime)}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">この一覧は活動連絡のためだけに利用してください。他の主催者の活動は表示できません。</p>
          </div>
          <a className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-bold" href={`/organizer/events/${event.id}/registrations/export`}>
            CSVをダウンロード
          </a>
        </div>

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
                  <th className="whitespace-nowrap py-2 pr-4">キャンセル日時</th>
                  <th className="whitespace-nowrap py-2 pr-4">申込日時</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr className={`border-b border-line last:border-b-0 ${(registration.status ?? "active") === "cancelled" ? "bg-slate-50 text-slate-500" : ""}`} key={registration.id}>
                    <td className="whitespace-nowrap py-3 pr-4 font-bold">{registration.participant_name}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.contact}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.number_of_people}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registrationStatusName(registration.status)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.display_name || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{genderName(registration.gender)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{skillLevelName(registration.skill_level)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.is_public ? "公開" : "非公開"}</td>
                    <td className="min-w-48 py-3 pr-4">{registration.note || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.cancelled_at ? formatDateTimeJST(registration.cancelled_at) : "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{formatDateTimeJST(registration.created_at)}</td>
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
