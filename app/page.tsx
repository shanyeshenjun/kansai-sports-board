import { EventCard } from "@/components/event-card";
import { areas, sports } from "@/lib/constants";
import { listEvents } from "@/lib/store";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    sport_type: one(params.sport_type) ?? "",
    area: one(params.area) ?? "",
    date: one(params.date) ?? "",
    onlyOpen: one(params.onlyOpen) === "1"
  };
  const events = await listEvents(filters);
  const openCount = events.filter((event) => event.status === "open").length;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <section className="mb-4 rounded-lg border border-line bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-teal-700">Kansai Sports Board</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-950">関西のスポーツ活動を探す</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">大阪・京都・神戸を中心に、参加できるスポーツ活動を掲載しています。</p>
            <p className="mt-1 text-xs text-slate-500">中文対応は拡張予定です。</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:w-48">
            <div className="rounded-md bg-slate-100 px-3 py-2">
              <div className="text-lg font-black">{events.length}</div>
              <div className="text-xs font-bold text-slate-500">表示中</div>
            </div>
            <div className="rounded-md bg-teal-50 px-3 py-2 text-teal-900">
              <div className="text-lg font-black">{openCount}</div>
              <div className="text-xs font-bold">受付中</div>
            </div>
          </div>
        </div>
      </section>

      <form className="mb-5 grid gap-3 rounded-lg border border-line bg-white p-3 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
        <select className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="sport_type" defaultValue={filters.sport_type}>
          <option value="">すべての種目</option>
          {sports.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} / {item.zh}
            </option>
          ))}
        </select>
        <select className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="area" defaultValue={filters.area}>
          <option value="">すべてのエリア</option>
          {areas.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} / {item.zh}
            </option>
          ))}
        </select>
        <input className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="date" type="date" defaultValue={filters.date} />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-[auto_auto]">
          <label className="touch-target flex items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-bold">
            <input name="onlyOpen" type="checkbox" value="1" defaultChecked={filters.onlyOpen} />
            受付中のみ
          </label>
          <button className="touch-target rounded-md bg-teal-700 px-5 py-2 text-sm font-black text-white" type="submit">
            検索
          </button>
        </div>
      </form>

      {events.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
          <h2 className="font-black text-slate-900">現在、該当する活動はありません</h2>
          <p className="mt-2 text-sm text-slate-500">条件を変えてもう一度検索してください。</p>
        </div>
      )}
    </main>
  );
}
