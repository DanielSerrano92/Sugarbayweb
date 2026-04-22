import Link from "next/link";

import { serializeStoreFilters } from "@/lib/store/filters";
import type { StoreFilters } from "@/lib/store/types";

type StorePaginationProps = {
  currentPage: number;
  totalPages: number;
  filters: StoreFilters;
};

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let offset = 1; offset <= 2; offset += 1) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function StorePagination({
  currentPage,
  totalPages,
  filters,
}: StorePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="Paginacion de productos"
      className="mt-6 flex flex-wrap items-center gap-2"
    >
      <Link
        href={`/store?${serializeStoreFilters(filters, { page: previousPage }).toString()}`}
        aria-disabled={currentPage === 1}
        className={`rounded-xl border px-3 py-2 text-sm font-medium ${
          currentPage === 1
            ? "pointer-events-none border-zinc-200 text-zinc-400"
            : "sb-btn-secondary border-zinc-300 text-zinc-200"
        }`}
      >
        Anterior
      </Link>

      {pages.map((page) => (
        <Link
          key={`page-${page}`}
          href={`/store?${serializeStoreFilters(filters, { page }).toString()}`}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            page === currentPage
              ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_20px_rgba(50,30,120,0.45)]"
              : "sb-btn-secondary border-zinc-300 text-zinc-200"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={`/store?${serializeStoreFilters(filters, { page: nextPage }).toString()}`}
        aria-disabled={currentPage === totalPages}
        className={`rounded-xl border px-3 py-2 text-sm font-medium ${
          currentPage === totalPages
            ? "pointer-events-none border-zinc-200 text-zinc-400"
            : "sb-btn-secondary border-zinc-300 text-zinc-200"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
