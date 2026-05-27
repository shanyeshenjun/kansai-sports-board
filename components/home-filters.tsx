"use client";

import { areas, sports } from "@/lib/constants";
import { T, useLanguage } from "@/components/language-ui";

type Filters = {
  sport_type: string;
  area: string;
  date: string;
  onlyOpen: boolean;
};

export function HomeFilters({ filters }: { filters: Filters }) {
  const { t } = useLanguage();

  return (
    <form className="mb-5 grid gap-3 rounded-xl border border-line bg-white/95 p-3 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
      <select className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="sport_type" defaultValue={filters.sport_type} aria-label={t("allSports")}>
        <option value="">{t("allSports")}</option>
        {sports.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label} / {item.zh}
          </option>
        ))}
      </select>
      <select className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="area" defaultValue={filters.area} aria-label={t("allAreas")}>
        <option value="">{t("allAreas")}</option>
        {areas.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label} / {item.zh}
          </option>
        ))}
      </select>
      <input className="touch-target rounded-md border border-line bg-white px-3 text-sm font-bold" name="date" type="date" defaultValue={filters.date} aria-label={t("date")} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-[auto_auto]">
        <label className="touch-target flex items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-bold">
          <input name="onlyOpen" type="checkbox" value="1" defaultChecked={filters.onlyOpen} />
          <T textKey="openOnly" />
        </label>
        <button className="touch-target rounded-md bg-teal-700 px-5 py-2 text-sm font-black text-white" type="submit">
          <T textKey="search" />
        </button>
      </div>
    </form>
  );
}
