import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";
import { MEDIA_SORT_OPTIONS, type MediaPhotoFilters } from "@/lib/media/types";

type PhotoFiltersProps = {
  basePath: string;
  filters: MediaPhotoFilters;
};

export default function PhotoFilters({ basePath, filters }: PhotoFiltersProps) {
  return (
    <FilterModalShell modalId="photo-filters-modal">
      <form method="get" className="space-y-4 p-4 text-black">
        <div>
          <label htmlFor="photos-from" className="mb-1.5 block text-sm font-bold text-black">
            Fecha desde
          </label>
          <input
            id="photos-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="photos-to" className="mb-1.5 block text-sm font-bold text-black">
            Fecha hasta
          </label>
          <input
            id="photos-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="win-input"
          />
        </div>

        <div>
          <label htmlFor="photos-type" className="mb-1.5 block text-sm font-bold text-black">
            Tipo
          </label>
          <select
            id="photos-type"
            name="type"
            defaultValue={filters.type}
            className="win-input"
          >
            <option value="all">Todos</option>
            <option value="concierto">Concierto</option>
            <option value="estudio">Estudio</option>
            <option value="backstage">Backstage</option>
            <option value="promocional">Promocional</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label htmlFor="photos-sort" className="mb-1.5 block text-sm font-bold text-black">
            Orden
          </label>
          <select
            id="photos-sort"
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

