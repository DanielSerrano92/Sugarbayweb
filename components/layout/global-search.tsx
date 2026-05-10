"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatCurrency } from "@/lib/utils";

type SearchPageItem = {
  id: string;
  title: string;
  href: string;
  description: string;
};

type SearchProductItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  currency: string;
  coverImageUrl: string | null;
};

type SearchApiResponse = {
  query: string;
  pages: SearchPageItem[];
  products: SearchProductItem[];
};

type FlattenedItem =
  | {
      id: string;
      key: string;
      type: "page";
      title: string;
      href: string;
      subtitle: string;
      imageUrl: null;
      price: null;
    }
  | {
      id: string;
      key: string;
      type: "product";
      title: string;
      href: string;
      subtitle: string;
      imageUrl: string | null;
      price: string;
    };

type GlobalSearchProps = {
  className?: string;
};

const DEBOUNCE_MS = 250;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeaderSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <circle cx="7.6" cy="7.8" r="5.4" />
      <path d="m11.6 11.8 2.8 2.8" />
      <path d="M14.8 7.2H21.8" />
      <path d="M14.8 12H21.8" />
      <path d="M14.8 16.8H21.8" />
    </svg>
  );
}

export default function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchApiResponse>({
    query: "",
    pages: [],
    products: [],
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    let cancelled = false;

    const runSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar resultados");
        }

        const payload = (await response.json()) as SearchApiResponse;
        if (!cancelled) {
          setResults(payload);
        }
      } catch (fetchError: unknown) {
        if (
          fetchError &&
          typeof fetchError === "object" &&
          "name" in fetchError &&
          fetchError.name === "AbortError"
        ) {
          return;
        }

        if (!cancelled) {
          setError("No pudimos cargar la busqueda en este momento.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    runSearch();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, debouncedQuery]);

  const flattenedItems = useMemo<FlattenedItem[]>(() => {
    const pageItems: FlattenedItem[] = results.pages.map((page) => ({
      id: page.id,
      key: `page-${page.id}`,
      type: "page",
      title: page.title,
      href: page.href,
      subtitle: page.description,
      imageUrl: null,
      price: null,
    }));

    const productItems: FlattenedItem[] = results.products.map((product) => ({
      id: product.id,
      key: `product-${product.id}`,
      type: "product",
      title: product.name,
      href: `/store/${product.slug}`,
      subtitle: "Producto",
      imageUrl: product.coverImageUrl,
      price: formatCurrency(product.basePrice, product.currency),
    }));

    return [...pageItems, ...productItems];
  }, [results.pages, results.products]);

  const normalizedActiveIndex = useMemo(() => {
    if (flattenedItems.length === 0) return -1;
    if (activeIndex < 0) return -1;
    return Math.min(activeIndex, flattenedItems.length - 1);
  }, [activeIndex, flattenedItems.length]);

  function closeSearch() {
    setOpen(false);
  }

  function goToResult(item: FlattenedItem) {
    router.push(item.href);
    closeSearch();
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!flattenedItems.length) return;
      setActiveIndex((current) => (current + 1) % flattenedItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!flattenedItems.length) return;
      setActiveIndex((current) =>
        current <= 0 ? flattenedItems.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeItem =
        normalizedActiveIndex >= 0
          ? flattenedItems[normalizedActiveIndex]
          : undefined;

      if (activeItem) {
        goToResult(activeItem);
        return;
      }

      if (query.trim()) {
        router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
        closeSearch();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    }
  }

  const activeOptionId =
    normalizedActiveIndex >= 0
      ? `global-search-option-${normalizedActiveIndex}`
      : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="global-search-dialog"
        className={
          className ??
          "sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-200"
        }
      >
        <HeaderSearchIcon />
        <span className="hidden sm:inline">Buscar</span>
        <span className="sb-kbd hidden lg:inline">
          Ctrl+K
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 py-12">
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Cerrar buscador"
            className="absolute inset-0"
          />

          <section
            id="global-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="sb-window relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl p-0"
          >
            <div className="sb-titlebar flex items-center justify-between gap-3 px-4 py-2">
              <h2 id="global-search-title" className="text-sm font-bold">
                Busqueda rapida
              </h2>
              <button
                type="button"
                onClick={closeSearch}
                className="sb-btn-secondary px-3 py-1.5 text-xs font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="sb-panel-soft rounded-xl px-3 py-2">
              <label htmlFor="global-search-input" className="sr-only">
                Buscar paginas y productos
              </label>
              <input
                ref={inputRef}
                id="global-search-input"
                role="combobox"
                aria-controls="global-search-results"
                aria-expanded={flattenedItems.length > 0}
                aria-activedescendant={activeOptionId}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Buscar paginas y productos..."
                className="sb-input w-full border-0 bg-transparent px-0 py-0 text-sm"
              />
              </div>
            </div>

            <div className="space-y-3 px-4 pb-4">
              {loading ? (
                <p className="text-sm text-zinc-600">Buscando resultados...</p>
              ) : error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : flattenedItems.length === 0 ? (
                <p className="sb-panel-soft rounded-xl px-3 py-2 text-sm text-zinc-600">
                  No encontramos resultados rapidos para esta busqueda.
                </p>
              ) : (
                <ul
                  id="global-search-results"
                  role="listbox"
                  aria-label="Resultados rapidos"
                  className="space-y-2"
                >
                  {flattenedItems.map((item, index) => {
                    const isActive = index === normalizedActiveIndex;

                    return (
                      <li key={item.key} role="presentation">
                        <button
                          id={`global-search-option-${index}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => goToResult(item)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                            isActive
                              ? "border-emerald-500 bg-zinc-100"
                              : "border-zinc-300 bg-zinc-50 hover:border-emerald-300 hover:bg-zinc-100"
                          }`}
                        >
                          {item.type === "product" ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-200">
                              <Image
                                src={resolveImageUrl(item.imageUrl)}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-300 text-zinc-500">
                              <SearchIcon />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-900">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-zinc-500">{item.subtitle}</p>
                          </div>

                          <div className="text-right">
                            {item.price ? (
                              <p className="text-xs font-semibold text-zinc-700">{item.price}</p>
                            ) : null}
                            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                              {item.type === "page" ? "Pagina" : "Producto"}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
                    closeSearch();
                  }}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                >
                  Ver resultados completos
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
