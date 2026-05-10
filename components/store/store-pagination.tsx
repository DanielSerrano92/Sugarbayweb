import { Fragment } from "react";
import Link from "next/link";

import { serializeStoreFilters } from "@/lib/store/filters";
import type { StoreFilters } from "@/lib/store/types";

type StorePaginationProps = {
  currentPage: number;
  totalPages: number;
  filters: StoreFilters;
  className?: string;
};

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

function buildHref(filters: StoreFilters, page: number): string {
  const params = serializeStoreFilters(filters, { page });
  const query = params.toString();
  return query ? `/store?${query}` : "/store";
}

export default function StorePagination({
  currentPage,
  totalPages,
  filters,
  className,
}: StorePaginationProps) {
  const effectiveTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);
  const previousPage = Math.max(1, safeCurrentPage - 1);
  const nextPage = Math.min(effectiveTotalPages, safeCurrentPage + 1);
  const pages = getVisiblePages(safeCurrentPage, effectiveTotalPages);
  const isPreviousDisabled = safeCurrentPage === 1;
  const isNextDisabled = safeCurrentPage === effectiveTotalPages;

  return (
    <nav
      aria-label="Paginacion de productos"
      className={["concert-pagination-shell", className].filter(Boolean).join(" ")}
    >
      <Link
        href={buildHref(filters, previousPage)}
        className={`concert-pagination-arrow ${
          isPreviousDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        aria-label="Pagina anterior"
        aria-disabled={isPreviousDisabled}
      >
        <span aria-hidden="true">&lt;</span>
      </Link>

      <div className="concert-pagination-pages">
        {pages.map((page, index) => (
          <Fragment key={`page-${page}`}>
            {index > 0 ? <span className="concert-pagination-separator">,</span> : null}
            <Link
              href={buildHref(filters, page)}
              aria-current={page === safeCurrentPage ? "page" : undefined}
              className={`concert-pagination-page ${page === safeCurrentPage ? "is-active" : ""}`}
            >
              {page}
            </Link>
          </Fragment>
        ))}
        {pages[pages.length - 1] < effectiveTotalPages ? (
          <>
            <span className="concert-pagination-separator">,</span>
            <span className="concert-pagination-ellipsis">...</span>
          </>
        ) : null}
      </div>

      <Link
        href={buildHref(filters, nextPage)}
        className={`concert-pagination-arrow ${
          isNextDisabled ? "pointer-events-none opacity-50" : ""
        }`}
        aria-label="Pagina siguiente"
        aria-disabled={isNextDisabled}
      >
        <span aria-hidden="true">&gt;</span>
      </Link>
    </nav>
  );
}
