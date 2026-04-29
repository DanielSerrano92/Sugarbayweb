"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { continentOptions } from "@/lib/concerts/locations";
import type { ConcertCountryOption, ConcertFilters } from "@/lib/concerts/types";

type ConcertFiltersProps = {
  basePath: string;
  filters: ConcertFilters;
  availableCountries: ConcertCountryOption[];
  mode?: "panel" | "folder-modal";
};

export default function ConcertFilters({
  basePath,
  filters,
  availableCountries,
  mode = "panel",
}: ConcertFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolderMode = mode === "folder-modal";

  useEffect(() => {
    if (!isFolderMode || !isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFolderMode, isOpen]);

  const form = (
    <form method="get" className="space-y-4 p-4 text-black">
      <div>
        <label htmlFor="concert-from" className="mb-1.5 block text-sm font-bold text-black">
          Fecha desde
        </label>
        <input
          id="concert-from"
          name="from"
          type="date"
          defaultValue={filters.from ?? ""}
          className="win-input"
        />
      </div>

      <div>
        <label htmlFor="concert-to" className="mb-1.5 block text-sm font-bold text-black">
          Fecha hasta
        </label>
        <input
          id="concert-to"
          name="to"
          type="date"
          defaultValue={filters.to ?? ""}
          className="win-input"
        />
      </div>

      <div>
        <label htmlFor="concert-continent" className="mb-1.5 block text-sm font-bold text-black">
          Continente
        </label>
        <select
          id="concert-continent"
          name="continent"
          defaultValue={filters.continent}
          className="win-input"
        >
          {continentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="concert-country" className="mb-1.5 block text-sm font-bold text-black">
          Pais
        </label>
        <select
          id="concert-country"
          name="country"
          defaultValue={filters.country ?? ""}
          className="win-input"
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
        <button type="submit" className="win-button">
          Aplicar
        </button>

        <Link href={basePath} className="win-button" onClick={() => setIsOpen(false)}>
          Reset
        </Link>
      </div>
    </form>
  );

  if (!isFolderMode) {
    return (
      <aside className="win-window h-fit overflow-hidden">
        <div className="win-titlebar">Filtros</div>
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
        aria-expanded={isOpen}
        aria-controls="concert-filters-modal"
        onClick={() => setIsOpen(true)}
      >
        <span className="retro-folder-icon" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="retro-modal-overlay"
            aria-label="Cerrar modal de filtros"
            onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
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
