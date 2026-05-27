import Link from "next/link";
import {
  cancelOrganizerEventAction,
  changeOrganizerEventStatusAction,
  deleteOrganizerEventAction,
  finishOrganizerEventAction,
  organizerLogoutAction,
  requireOrganizer
} from "@/app/actions";
import { DeleteEventButton } from "@/components/delete-event-button";
import { areaName, sportName, statusName, statuses } from "@/lib/constants";
import { formatDate, formatDateTimeJST, formatTime, listOrganizerEvents } from "@/lib/store";

export default async function OrganizerPage() {
  const organizer = await requireOrganizer();
  const events = await listOrganizerEvents(organizer.id, { includeDeleted: true });

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <section className="mb-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-teal-700">Organizer Console</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">主催者后台</h1>
            <p className="mt-1 text-sm text-slate-600">{organizer.display_name} さんの活動だけを管理できます。</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link className="touch-target inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/organizer/events/new">
              新しい活動
            </Link>
            <form action={organizerLogoutAction}>
              <button className="touch-target w-full rounded-md border border-line bg-white px-4 py-3 text-sm font-bold" type="submit">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {events.length ? (
          events.map((event) => {
            const status = statusName(event.status);
            const sport = sportName(event.sport_type);
            const deleted = Boolean(event.deleted_at);
            return (
              <article key={event.id} className={`rounded-xl border border-line bg-white p-4 shadow-sm ${deleted || event.status === "cancelled" || event.status === "finished" ? "opacity-75" : ""}`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sport.color}`}>{sport.label}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{areaName(event.area).label}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.color}`}>{status.label}</span>
                      {deleted ? <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">削除済み</span> : null}
                    </div>
                    <h2 className="mt-2 text-lg font-black leading-snug text-slate-950">{event.title}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {formatDate(event.start_datetime)} {formatTime(event.start_datetime)} / {event.venue_name} / {event.current_participants}/{event.max_participants}名
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      作成: {formatDateTimeJST(event.created_at)} / 更新: {formatDateTimeJST(event.updated_at)}
                    </p>
                  </div>

                  <div className="grid gap-2 lg:w-[440px]">
                    <form action={changeOrganizerEventStatusAction} className="grid grid-cols-[1fr_auto] gap-2">
                      <input name="event_id" type="hidden" value={event.id} />
                      <select className="touch-target min-w-0 rounded-md border border-line px-3 text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400" name="status" defaultValue={event.status} disabled={deleted}>
                        {statuses.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <button className="touch-target rounded-md border border-line px-4 text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400" type="submit" disabled={deleted}>
                        変更
                      </button>
                    </form>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <form action={finishOrganizerEventAction}>
                        <input name="event_id" type="hidden" value={event.id} />
                        <button className="touch-target w-full rounded-md border border-line px-3 py-2 text-sm font-bold disabled:bg-slate-100 disabled:text-slate-400" type="submit" disabled={deleted}>
                          終了にする
                        </button>
                      </form>
                      <form action={cancelOrganizerEventAction}>
                        <input name="event_id" type="hidden" value={event.id} />
                        <button className="touch-target w-full rounded-md border border-amber-200 px-3 py-2 text-sm font-bold text-amber-700 disabled:bg-slate-100 disabled:text-slate-400" type="submit" disabled={deleted}>
                          キャンセル
                        </button>
                      </form>
                      {deleted ? (
                        <button className="touch-target w-full rounded-md border border-line px-3 py-2 text-sm font-bold text-slate-400" type="button" disabled>
                          削除済み
                        </button>
                      ) : (
                        <DeleteEventButton eventId={event.id} action={deleteOrganizerEventAction} />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/organizer/events/${event.id}/edit`}>
                        編集
                      </Link>
                      <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/organizer/events/${event.id}/registrations`}>
                        参加者
                      </Link>
                      <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/organizer/events/${event.id}/registrations/export`}>
                        CSV
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-white p-8 text-center">
            <h2 className="font-black text-slate-900">まだ活動がありません</h2>
            <p className="mt-2 text-sm text-slate-500">最初の活動を作成して、参加者に公開しましょう。</p>
          </div>
        )}
      </div>
    </main>
  );
}
