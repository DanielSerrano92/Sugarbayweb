import Link from "next/link";

import { continentOptions } from "@/lib/concerts/locations";
import type { ConcertCountryOption, ConcertFilters } from "@/lib/concerts/types";

type ConcertFiltersProps = {
  basePath: string;
  filters: ConcertFilters;
  availableCountries: ConcertCountryOption[];
};

export default function ConcertFilters({
  basePath,
  filters,
  availableCountries,
}: ConcertFiltersProps) {
  return (
    <aside className="sb-panel h-fit rounded-2xl p-4">
      <h2 className="text-base font-bold text-zinc-900">Filtros</h2>

      <form method="get" className="mt-4 space-y-4">
        <div>
          <label htmlFor="concert-from" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Fecha desde
          </label>
          <input
            id="concert-from"
            name="from"
            type="date"
            defaultValue={filters.from ?? ""}
            className="sb-input"
          />
        </div>

        <div>
          <label htmlFor="concert-to" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Fecha hasta
          </label>
          <input
            id="concert-to"
            name="to"
            type="date"
            defaultValue={filters.to ?? ""}
            className="sb-input"
          />
        </div>

        <div>
          <label
            htmlFor="concert-continent"
            className="mb-1.5 block text-sm font-semibold text-zinc-700"
          >
            Continente
          </label>
          <select
            id="concert-continent"
            name="continent"
            defaultValue={filters.continent}
            className="sb-select"
          >
            {continentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="concert-country" className="mb-1.5 block text-sm font-semibold text-zinc-700">
            Pais
          </label>
          <select
            id="concert-country"
            name="country"
            defaultValue={filters.country ?? ""}
            className="sb-select"
          >
            <option value="">Todos los paises</option>
            {availableCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="sb-btn-primary inline-flex px-4 py-2 text-sm font-semibold"
          >
            Aplicar
          </button>
          <Link
            href={basePath}
            className="sb-btn-secondary inline-flex px-4 py-2 text-sm font-semibold text-zinc-200"
          >
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}
