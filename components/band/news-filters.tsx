import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";
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
    <FilterModalShell modalId="band-news-filters-modal">
      <form method="get" className="space-y-4 p-4 text-black">
        <div>
          <label htmlFor="band-news-from" className="mb-1.5 block text-sm font-bold text-black">
            Fecha desde
          </label>
          <input
            id="band-news-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="band-news-to" className="mb-1.5 block text-sm font-bold text-black">
            Fecha hasta
          </label>
          <input
            id="band-news-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="band-news-tag" className="mb-1.5 block text-sm font-bold text-black">
            Tag
          </label>
          <input
            id="band-news-tag"
            name="tag"
            type="text"
            defaultValue={filters.tag ?? ""}
            placeholder="tour, studio..."
            className="win-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="win-button">
            Aplicar
          </button>
          <Link href={basePath} className="win-button">
            Reset
          </Link>
        </div>
      </form>
    </FilterModalShell>
  );
}
