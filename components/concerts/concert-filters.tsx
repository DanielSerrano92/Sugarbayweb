"use client";

import { useEffect, useState } from "react";
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  mode = "panel",
}: ConcertFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    if (!isIconMode || !isModalOpen) return;

    const originalOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isIconMode, isModalOpen]);

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
          defaultValue={filters.continent}
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
          defaultValue={filters.country ?? ""}
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
        className="retro-folder-button"
        aria-label="Abrir filtros"
        aria-expanded={isModalOpen}
        aria-controls="concert-filters-modal"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="retro-folder-icon" aria-hidden="true" />
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="retro-modal-overlay"
            aria-label="Cerrar modal de filtros"
            onClick={() => setIsModalOpen(false)}
          />

          <section
            id="concert-filters-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="concert-filters-title"
            className="win-window retro-filters-modal relative z-10 w-full max-w-lg overflow-hidden"
          >
            <div className="win-titlebar flex items-center justify-between gap-4">
              <span id="concert-filters-title">Filtros</span>
              <button
                type="button"
                className="win-button retro-win-close"
                aria-label="Cerrar modal de filtros"
                onClick={() => setIsModalOpen(false)}
              >
                X
              </button>
            </div>
            {form}
          </section>
        </div>
      ) : null}
    </>
  );
}
