import Link from "next/link";

import { serializePhotoFilters } from "@/lib/media/filters";
import type { MediaPhotoFilters } from "@/lib/media/types";

type PhotoPaginationProps = {
  basePath: string;
  filters: MediaPhotoFilters;
  totalPages: number;
};

function buildHref(basePath: string, filters: MediaPhotoFilters, page: number): string {
  const params = serializePhotoFilters(filters, { page });
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export default function PhotoPagination({
  basePath,
  filters,
  totalPages,
}: PhotoPaginationProps) {
  if (totalPages <= 1) return null;

  const currentPage = filters.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label="Paginacion de albums de fotos" className="mt-6 flex flex-wrap items-center gap-2">
      <Link
        href={buildHref(basePath, filters, previousPage)}
        className={`rounded-xl border px-3 py-2 text-sm font-medium ${
          currentPage === 1
            ? "pointer-events-none border-zinc-200 text-zinc-400"
            : "sb-btn-secondary text-zinc-200"
        }`}
      >
        Anterior
      </Link>

      {visiblePages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, filters, page)}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
            page === currentPage
              ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_20px_rgba(50,30,120,0.45)]"
              : "sb-btn-secondary text-zinc-200"
          }`}
        >
          {page}
        </Link>
      ))}

      <Link
        href={buildHref(basePath, filters, nextPage)}
        className={`rounded-xl border px-3 py-2 text-sm font-medium ${
          currentPage === totalPages
            ? "pointer-events-none border-zinc-200 text-zinc-400"
            : "sb-btn-secondary text-zinc-200"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}

