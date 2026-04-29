import { Fragment } from "react";
import Link from "next/link";

import { serializeConcertFilters } from "@/lib/concerts/filters";
import type { ConcertFilters } from "@/lib/concerts/types";

type ConcertPaginationProps = {
  basePath: string;
  filters: ConcertFilters;
  totalPages: number;
};

function buildHref(basePath: string, filters: ConcertFilters, page: number): string {
  const params = serializeConcertFilters(filters, { page });
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

export default function ConcertPagination({
  basePath,
  filters,
  totalPages,
}: ConcertPaginationProps) {
  const effectiveTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, filters.page), effectiveTotalPages);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(effectiveTotalPages, currentPage + 1);
  const visiblePages = getVisiblePages(currentPage, effectiveTotalPages);

  return (
    <nav aria-label="Paginacion de conciertos" className="retro-pagination-shell">
      <Link
        href={buildHref(basePath, filters, previousPage)}
        className={`retro-pagination-arrow ${
          currentPage === 1 ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <span aria-hidden="true">&lt;</span>
      </Link>

      <div className="retro-pagination-pages">
        {visiblePages.map((page, index) => (
          <Fragment key={page}>
            {index > 0 ? <span className="retro-pagination-separator">,</span> : null}
            <Link
              href={buildHref(basePath, filters, page)}
              className={`retro-pagination-page ${page === currentPage ? "is-active" : ""}`}
            >
              {page}
            </Link>
          </Fragment>
        ))}
        {visiblePages[visiblePages.length - 1] < effectiveTotalPages ? (
          <>
            <span className="retro-pagination-separator">,</span>
            <span className="retro-pagination-ellipsis">...</span>
          </>
        ) : null}
      </div>

      <Link
        href={buildHref(basePath, filters, nextPage)}
        className={`retro-pagination-arrow ${
          currentPage === effectiveTotalPages ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <span aria-hidden="true">&gt;</span>
      </Link>
    </nav>
  );
}
