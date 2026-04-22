import Link from "next/link";

import type { BandNewsFilters } from "@/lib/band/types";

type BandNewsFiltersProps = {
  basePath: string;
  filters: BandNewsFilters;
};

export default function BandNewsFilters({
  basePath,
  filters,
}: BandNewsFiltersProps) {
  return (
    <form
      method="get"
      className="sb-panel grid gap-3 rounded-2xl p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <div>
        <label htmlFor="band-news-from" className="mb-1 block text-xs font-semibold uppercase">
          Fecha desde
        </label>
        <input
          id="band-news-from"
          name="from"
          type="date"
          defaultValue={filters.from ?? ""}
          className="sb-input"
        />
      </div>

      <div>
        <label htmlFor="band-news-to" className="mb-1 block text-xs font-semibold uppercase">
          Fecha hasta
        </label>
        <input
          id="band-news-to"
          name="to"
          type="date"
          defaultValue={filters.to ?? ""}
          className="sb-input"
        />
      </div>

      <div>
        <label htmlFor="band-news-tag" className="mb-1 block text-xs font-semibold uppercase">
          Tag
        </label>
        <input
          id="band-news-tag"
          name="tag"
          type="text"
          defaultValue={filters.tag ?? ""}
          placeholder="tour, studio..."
          className="sb-input"
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="sb-btn-primary px-4 py-2 text-sm font-semibold"
        >
          Aplicar
        </button>
        <Link
          href={basePath}
          className="sb-btn-secondary px-4 py-2 text-sm font-medium text-zinc-200"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
