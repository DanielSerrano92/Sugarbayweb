import Link from "next/link";

import { MEDIA_SORT_OPTIONS, type MediaVideoFilters } from "@/lib/media/types";

type VideoFiltersProps = {
  basePath: string;
  filters: MediaVideoFilters;
};

export default function VideoFilters({ basePath, filters }: VideoFiltersProps) {
  return (
    <aside className="sb-panel h-fit rounded-2xl p-4">
      <h2 className="text-base font-bold text-zinc-900">Filtros</h2>

      <form method="get" className="mt-4 space-y-4">
        <div>
          <label htmlFor="videos-from" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Fecha desde
          </label>
          <input
            id="videos-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="sb-input"
          />
        </div>

        <div>
          <label htmlFor="videos-to" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Fecha hasta
          </label>
          <input
            id="videos-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="sb-input"
          />
        </div>

        <div>
          <label htmlFor="videos-type" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Tipo
          </label>
          <select
            id="videos-type"
            name="type"
            defaultValue={filters.type}
            className="sb-select"
          >
            <option value="all">Todo</option>
            <option value="collection">Colecciones</option>
            <option value="single">Videos unicos</option>
          </select>
        </div>

        <div>
          <label htmlFor="videos-sort" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Orden
          </label>
          <select
            id="videos-sort"
            name="sort"
            defaultValue={filters.sort}
            className="sb-select"
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
            className="sb-btn-primary px-4 py-2 text-sm font-semibold"
          >
            Aplicar
          </button>
          <Link
            href={basePath}
            className="sb-btn-secondary px-4 py-2 text-sm font-semibold text-zinc-200"
          >
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}

