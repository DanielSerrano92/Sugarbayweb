"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";

import FilterModalShell from "@/components/ui/filter-modal-shell";
import {
  continentOptions,
  getCountriesForContinent,
  isCountryInContinent,
} from "@/lib/concerts/locations";
import type { ConcertContinent, ConcertFilters } from "@/lib/concerts/types";

type ConcertFiltersProps = {
  basePath: string;
  filters: ConcertFilters;
  mode?: "panel" | "icon-modal";
};

function getValidSelectedCountry(filters: ConcertFilters): string {
  if (!filters.country) return "";
  return isCountryInContinent(filters.country, filters.continent)
    ? filters.country
    : "";
}

export default function ConcertFilters({
  basePath,
  filters,
  mode = "panel",
}: ConcertFiltersProps) {
  const [selectedContinent, setSelectedContinent] =
    useState<ConcertContinent>(filters.continent);
  const [selectedCountry, setSelectedCountry] = useState(() =>
    getValidSelectedCountry(filters),
  );
  const isIconMode = mode === "icon-modal";
  const formClassName = isIconMode ? "space-y-4 p-4 text-black" : "mt-4 space-y-4";
  const labelClassName = isIconMode
    ? "mb-1.5 block text-sm font-bold text-black"
    : "mb-1.5 block text-sm font-semibold text-zinc-700";
  const fieldClassName = isIconMode ? "win-input" : "sb-input";
  const selectClassName = isIconMode ? "win-input" : "sb-select";
  const actionButtonClassName = isIconMode
    ? "win-button"
    : "sb-btn-primary inline-flex px-4 py-2 text-sm font-semibold";
  const resetButtonClassName = isIconMode
    ? "win-button"
    : "sb-btn-secondary inline-flex px-4 py-2 text-sm font-semibold text-zinc-200";
  const availableCountries = getCountriesForContinent(selectedContinent);

  const handleContinentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextContinent = event.target.value as ConcertContinent;

    setSelectedContinent(nextContinent);

    if (
      selectedCountry &&
      !isCountryInContinent(selectedCountry, nextContinent)
    ) {
      setSelectedCountry("");
    }
  };

  const form = (
    <form method="get" className={formClassName}>
      <div>
        <label htmlFor="concert-from" className={labelClassName}>
          Fecha desde
        </label>
        <input
          id="concert-from"
          name="from"
          type="date"
          defaultValue={filters.from ?? ""}
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="concert-to" className={labelClassName}>
          Fecha hasta
        </label>
        <input
          id="concert-to"
          name="to"
          type="date"
          defaultValue={filters.to ?? ""}
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="concert-continent" className={labelClassName}>
          Continente
        </label>
        <select
          id="concert-continent"
          name="continent"
          value={selectedContinent}
          onChange={handleContinentChange}
          className={selectClassName}
        >
          {continentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="concert-country" className={labelClassName}>
          Pais
        </label>
        <select
          id="concert-country"
          name="country"
          value={selectedCountry}
          onChange={(event) => setSelectedCountry(event.target.value)}
          className={selectClassName}
        >
          <option value="">Todos los paises</option>
          {availableCountries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className={actionButtonClassName}>
          Aplicar
        </button>
        <Link
          href={basePath}
          className={resetButtonClassName}
        >
          Reset
        </Link>
      </div>
    </form>
  );

  if (!isIconMode) {
    return (
      <aside className="sb-panel h-fit rounded-2xl p-4">
        <h2 className="text-base font-bold text-zinc-900">Filtros</h2>
        {form}
      </aside>
    );
  }

  return <FilterModalShell modalId="concert-filters-modal">{form}</FilterModalShell>;
}
