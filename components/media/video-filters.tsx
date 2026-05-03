import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";
import { MEDIA_SORT_OPTIONS, type MediaVideoFilters } from "@/lib/media/types";

type VideoFiltersProps = {
  basePath: string;
  filters: MediaVideoFilters;
};

export default function VideoFilters({ basePath, filters }: VideoFiltersProps) {
  return (
    <FilterModalShell modalId="video-filters-modal">
      <form method="get" className="space-y-4 p-4 text-black">
        <div>
          <label htmlFor="videos-from" className="mb-1.5 block text-sm font-bold text-black">
            Fecha desde
          </label>
          <input
            id="videos-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="videos-to" className="mb-1.5 block text-sm font-bold text-black">
            Fecha hasta
          </label>
          <input
            id="videos-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="videos-type" className="mb-1.5 block text-sm font-bold text-black">
            Tipo
          </label>
          <select
            id="videos-type"
            name="type"
            defaultValue={filters.type}
            className="win-input"
          >
            <option value="all">Todo</option>
            <option value="collection">Colecciones</option>
            <option value="single">Videos unicos</option>
          </select>
        </div>

        <div>
          <label htmlFor="videos-sort" className="mb-1.5 block text-sm font-bold text-black">
            Orden
          </label>
          <select
            id="videos-sort"
            name="sort"
            defaultValue={filters.sort}
            className="win-input"
          >
            {MEDIA_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="win-button"
          >
            Aplicar
          </button>
          <Link
            href={basePath}
            className="win-button"
          >
            Reset
          </Link>
        </div>
      </form>
    </FilterModalShell>
  );
}

