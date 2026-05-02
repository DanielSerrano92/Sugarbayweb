"use client";

import { useState } from "react";
import Link from "next/link";

import AppModal from "@/components/ui/app-modal";
import { continentOptions } from "@/lib/concerts/locations";
import type { ConcertCountryOption, ConcertFilters } from "@/lib/concerts/types";

type ConcertFiltersProps = {
  basePath: string;
  filters: ConcertFilters;
  availableCountries: ConcertCountryOption[];
  mode?: "panel" | "icon-modal";
};

export default function ConcertFilters({
  basePath,
  filters,
  availableCountries,
  mode = "panel",
}: ConcertFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isIconMode = mode === "icon-modal";
  const formClassName = isIconMode ? "space-y-4 p-4 sm:p-5" : "mt-4 space-y-4";

  const form = (
    <form method="get" className={formClassName}>
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
          onClick={() => setIsModalOpen(false)}
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

  return (
    <>
      <button
        type="button"
        className="concert-filter-icon-btn sb-btn-secondary"
        aria-label="Abrir filtros"
        aria-haspopup="dialog"
        onClick={() => setIsModalOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
        </svg>
      </button>

      {isModalOpen ? (
        <AppModal
          title="Filtros de conciertos"
          onClose={() => setIsModalOpen(false)}
          maxWidth="620px"
          bodyClassName="p-0 sm:p-0"
          overlayOpacity={0.35}
        >
          {form}
        </AppModal>
      ) : null}
    </>
  );
}
