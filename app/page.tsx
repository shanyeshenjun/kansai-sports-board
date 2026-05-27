import { EventCard } from "@/components/event-card";
import { EventCalendar } from "@/components/event-calendar";
import { HomeFilters } from "@/components/home-filters";
import { T } from "@/components/language-ui";
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
  const sportTags = ["バドミントン", "バスケ", "卓球", "バレー", "フットサル"];

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5">
      <section className="mb-4 overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-sky-50 p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-black uppercase tracking-wide text-teal-700">Kansai Sports Board</p>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800 ring-1 ring-amber-200">
            <T textKey="beta" />
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              <T textKey="appName" />
            </h1>
            <p className="mt-1 text-sm font-bold text-teal-900">Kansai Sports Board</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              <T textKey="homeSubtitle" />
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <T textKey="homeNotice" />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sportTags.map((tag) => (
                <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs font-black text-slate-700 shadow-sm" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:w-48">
            <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2 shadow-sm">
              <div className="text-lg font-black">{events.length}</div>
              <div className="text-xs font-bold text-slate-500">
                <T textKey="displayed" />
              </div>
            </div>
            <div className="rounded-lg border border-teal-100 bg-teal-600 px-3 py-2 text-white shadow-sm">
              <div className="text-lg font-black">{openCount}</div>
              <div className="text-xs font-bold">
                <T textKey="openNow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFilters filters={filters} />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
        <EventCalendar events={events} />
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
      </div>
    </main>
  );
}
