import Link from "next/link";
import { cancelEventAction, changeStatusAction, logoutAction, requireAdmin } from "@/app/actions";
import { areaName, sportName, statusName, statuses } from "@/lib/constants";
import { formatDate, formatTime, listEvents } from "@/lib/store";

export default async function AdminPage() {
  await requireAdmin();
  const events = listEvents();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <div className="mb-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">管理画面</h1>
            <p className="mt-1 text-sm text-slate-600">活動の作成、編集、ステータス変更、参加者確認を行います。</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link className="touch-target inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/admin/events/new">
              活動を作成
            </Link>
            <form action={logoutAction}>
              <button className="touch-target w-full rounded-md border border-line bg-white px-4 py-3 text-sm font-bold" type="submit">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {events.map((event) => {
          const status = statusName(event.status);
          const sport = sportName(event.sport_type);
          return (
            <article key={event.id} className={`rounded-lg border border-line bg-white p-4 shadow-sm ${event.status === "cancelled" || event.status === "finished" ? "opacity-75" : ""}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sport.color}`}>{sport.label}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{areaName(event.area).label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.color}`}>{status.label}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-black leading-snug text-slate-950">{event.title}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {formatDate(event.start_datetime)} {formatTime(event.start_datetime)} / {event.venue_name} / {event.current_participants}/{event.max_participants}名
                  </p>
                </div>

                <div className="grid gap-2 lg:w-[440px]">
                  <form action={changeStatusAction} className="grid grid-cols-[1fr_auto] gap-2">
                    <input name="event_id" type="hidden" value={event.id} />
                    <select className="touch-target min-w-0 rounded-md border border-line px-3 text-sm font-bold" name="status" defaultValue={event.status}>
                      {statuses.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <button className="touch-target rounded-md border border-line px-4 text-sm font-bold" type="submit">
                      変更
                    </button>
                  </form>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/admin/events/${event.id}/edit`}>
                      編集
                    </Link>
                    <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/admin/events/${event.id}/registrations`}>
                      参加者
                    </Link>
                    <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 py-2 text-center text-sm font-bold" href={`/admin/events/${event.id}/registrations/export`}>
                      CSV
                    </Link>
                    <form action={cancelEventAction}>
                      <input name="event_id" type="hidden" value={event.id} />
                      <button className="touch-target w-full rounded-md border border-red-200 px-3 py-2 text-sm font-bold text-red-700" type="submit">
                        キャンセル
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
