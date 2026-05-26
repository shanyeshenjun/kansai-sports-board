"use client";

import { useMemo, useState } from "react";
import { venueOptions } from "@/lib/constants";

const otherVenue = "__other__";

export function VenueSelectFields({ defaultValue }: { defaultValue?: string }) {
  const isKnownVenue = defaultValue ? venueOptions.includes(defaultValue as (typeof venueOptions)[number]) : true;
  const initialSelection = defaultValue && isKnownVenue ? defaultValue : defaultValue ? otherVenue : venueOptions[0];
  const [selection, setSelection] = useState(initialSelection);
  const [customVenue, setCustomVenue] = useState(defaultValue && !isKnownVenue ? defaultValue : "");
  const venueName = useMemo(() => (selection === otherVenue ? customVenue : selection), [selection, customVenue]);

  return (
    <div className="grid gap-3">
      <input name="venue_name" type="hidden" value={venueName} />
      <label className="grid gap-1.5 text-sm font-bold text-slate-800">
        会場名
        <select className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal" value={selection} onChange={(event) => setSelection(event.target.value)}>
          {venueOptions.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
          <option value={otherVenue}>その他 / 手動入力</option>
        </select>
      </label>
      {selection === otherVenue ? (
        <label className="grid gap-1.5 text-sm font-bold text-slate-800">
          その他の会場名
          <input
            className="touch-target rounded-md border border-line bg-white px-3 py-2 font-normal"
            required
            value={customVenue}
            onChange={(event) => setCustomVenue(event.target.value)}
            placeholder="例：〇〇スポーツセンター"
          />
        </label>
      ) : null}
    </div>
  );
}
