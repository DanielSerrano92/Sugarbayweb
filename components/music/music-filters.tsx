import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";
import { MUSIC_SORT_OPTIONS, type MusicFilters } from "@/lib/music/types";

type MusicFiltersProps = {
  basePath: string;
  filters: MusicFilters;
};

export default function MusicFiltersPanel({ basePath, filters }: MusicFiltersProps) {
  return (
    <FilterModalShell modalId="music-filters-modal">
      <form method="get" className="space-y-4 p-4 text-black">
        <div>
          <label htmlFor="music-from" className="mb-1.5 block text-sm font-bold text-black">
            Fecha desde
          </label>
          <input
            id="music-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="music-to" className="mb-1.5 block text-sm font-bold text-black">
            Fecha hasta
          </label>
          <input
            id="music-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="music-type" className="mb-1.5 block text-sm font-bold text-black">
            Tipo
          </label>
          <select
            id="music-type"
            name="type"
            defaultValue={filters.type}
            className="win-input"
          >
            <option value="all">Todo</option>
            <option value="song">Canciones</option>
            <option value="album">Albumes</option>
          </select>
        </div>

        <div>
          <label htmlFor="music-sort" className="mb-1.5 block text-sm font-bold text-black">
            Orden
          </label>
          <select
            id="music-sort"
            name="sort"
            defaultValue={filters.sort}
            className="win-input"
          >
            {MUSIC_SORT_OPTIONS.map((option) => (
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
