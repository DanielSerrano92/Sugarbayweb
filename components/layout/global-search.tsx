"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { resolveImageUrl } from "@/lib/services/imagekit";

type SearchQuickLinkItem = {
  id: string;
  title: string;
  href: string;
  description: string;
};

type SearchMenuResultItem = {
  id: string;
  type:
    | "page"
    | "concert-upcoming"
    | "concert-past"
    | "news"
    | "song"
    | "album"
    | "photo-collection"
    | "video-collection"
    | "product";
  title: string;
  href: string;
  description: string;
  categoryLabel: string;
  imageUrl: string | null;
  price: string | null;
};

type SearchApiResponse = {
  query: string;
  quickLinks: SearchQuickLinkItem[];
  items: SearchMenuResultItem[];
};

type FlattenedItem = {
  id: string;
  key: string;
  type: SearchMenuResultItem["type"];
  title: string;
  href: string;
  subtitle: string;
  imageUrl: string | null;
  price: string | null;
  categoryLabel: string;
};

type GlobalSearchProps = {
  className?: string;
  showFloatingBubble?: boolean;
  floatingThreshold?: number;
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

export default function GlobalSearch({
  className,
  showFloatingBubble = false,
  floatingThreshold = 120,
}: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [pinAnchor, setPinAnchor] = useState({
    top: 18,
    left: 18,
    width: 0,
    height: 0,
  });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchApiResponse>({
    query: "",
    quickLinks: [],
    items: [],
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const captureAnchor = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const nextRect = trigger.getBoundingClientRect();
    if (nextRect.width <= 0 || nextRect.height <= 0) return;

    const absoluteTop = nextRect.top + window.scrollY;
    const nextAnchor = {
      top: absoluteTop,
      left: nextRect.left,
      width: nextRect.width,
      height: nextRect.height,
    };

    setPinAnchor((currentAnchor) => {
      const changed =
        Math.abs(currentAnchor.top - nextAnchor.top) > 0.5 ||
        Math.abs(currentAnchor.left - nextAnchor.left) > 0.5 ||
        Math.abs(currentAnchor.width - nextAnchor.width) > 0.5 ||
        Math.abs(currentAnchor.height - nextAnchor.height) > 0.5;

      return changed ? nextAnchor : currentAnchor;
    });
  }, []);

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
    if (!showFloatingBubble) return;

    const threshold = Math.max(0, floatingThreshold);
    const syncPinnedState = (shouldCaptureAnchor: boolean) => {
      const currentScroll = window.scrollY;
      const shouldPin = currentScroll > threshold;

      if (shouldCaptureAnchor || currentScroll <= 8) {
        captureAnchor();
      }

      setIsPinned((currentPinned) =>
        currentPinned === shouldPin ? currentPinned : shouldPin,
      );
    };

    const onScroll = () => syncPinnedState(false);
    const onResize = () => syncPinnedState(true);

    syncPinnedState(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncPinnedState(true))
        : null;

    if (resizeObserver && triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
    };
  }, [captureAnchor, floatingThreshold, showFloatingBubble]);

  useEffect(() => {
    if (!showFloatingBubble) return;
    captureAnchor();
  }, [captureAnchor, showFloatingBubble]);

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

  const hasTypedQuery = query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery, hasTypedQuery]);

  const flattenedItems = useMemo<FlattenedItem[]>(() => {
    if (!hasTypedQuery) {
      return results.quickLinks.map((page) => ({
        id: page.id,
        key: `quick-${page.id}`,
        type: "page",
        title: page.title,
        href: page.href,
        subtitle: page.description,
        imageUrl: null,
        price: null,
        categoryLabel: "Pagina",
      }));
    }

    return results.items.map((item) => ({
      id: item.id,
      key: `${item.type}-${item.id}`,
      type: item.type,
      title: item.title,
      href: item.href,
      subtitle: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      categoryLabel: item.categoryLabel,
    }));
  }, [hasTypedQuery, results.items, results.quickLinks]);

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

      if (flattenedItems[0]) {
        goToResult(flattenedItems[0]);
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
  const pinnedVisible = showFloatingBubble && isPinned && !open;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="global-search-dialog"
        aria-hidden={pinnedVisible}
        tabIndex={pinnedVisible ? -1 : 0}
        className={
          [
            className ??
              "sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-200",
            pinnedVisible ? "sb-header-search-hidden" : "",
          ].filter(Boolean).join(" ")
        }
      >
        <HeaderSearchIcon />
        <span className="hidden sm:inline">Buscar</span>
        <span className="sb-kbd hidden lg:inline">
          Ctrl+K
        </span>
      </button>

      {pinnedVisible ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir busqueda"
          className={`${
            className ??
            "sb-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-200"
          } sb-header-search-pinned`}
          style={{
            top: pinAnchor.top > 0 ? `${pinAnchor.top - 6}px` : `${pinAnchor.top}px`,
            left: pinAnchor.left > 0 ? `${pinAnchor.left - 6}px` : `${pinAnchor.left}px`,
            width: pinAnchor.width > 0 ? `${pinAnchor.width + 12}px` : undefined,
            height: pinAnchor.height > 0 ? `${pinAnchor.height + 12}px` : undefined,
          }}
        >
          <HeaderSearchIcon />
          <span className="hidden sm:inline">Buscar</span>
          <span className="sb-kbd hidden lg:inline">
            Ctrl+K
          </span>
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-2 py-2 sm:items-center sm:px-4 sm:py-6">
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Cerrar buscador"
            className="global-search-overlay absolute inset-0"
          />

          <section
            id="global-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="win-window global-search-window relative z-10 flex w-full max-w-4xl min-h-0 flex-col overflow-hidden p-0"
          >
            <div className="win-titlebar flex items-center justify-between gap-3">
              <h2 id="global-search-title" className="min-w-0 truncate pr-2">
                Busqueda rapida
              </h2>
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Cerrar busqueda rapida"
                className="win-button retro-win-close"
              >
                X
              </button>
            </div>

            <div className="global-search-modal-body flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden p-3 sm:p-4">
              <div className="global-search-input-shell p-2">
                <label htmlFor="global-search-input" className="sr-only">
                  Buscar contenido en la web
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
                  placeholder="Buscar conciertos, noticias, musica, media y tienda..."
                  className="win-input global-search-input text-sm"
                />
              </div>

              <div className="global-search-results-frame min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
                {loading ? (
                  <p className="global-search-status">Buscando resultados...</p>
                ) : error ? (
                  <p className="global-search-error">
                    {error}
                  </p>
                ) : flattenedItems.length === 0 ? (
                  <p className="global-search-empty">
                    {hasTypedQuery
                      ? "No encontramos resultados para esta busqueda."
                      : "Accesos directos de navegacion principal."}
                  </p>
                ) : (
                  <ul
                    id="global-search-results"
                    role="listbox"
                    aria-label={hasTypedQuery ? "Resultados de busqueda" : "Accesos rapidos"}
                    className="space-y-2"
                  >
                    {flattenedItems.map((item, index) => {
                      const isActive = index === normalizedActiveIndex;
                      const hasImage = Boolean(item.imageUrl);

                      return (
                        <li key={item.key} role="presentation">
                          <button
                            id={`global-search-option-${index}`}
                            role="option"
                            aria-selected={isActive}
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => goToResult(item)}
                            className={`global-search-result ${isActive ? "global-search-result-active" : ""}`}
                          >
                            {hasImage ? (
                              <div className="global-search-result-thumb relative h-11 w-11 shrink-0 overflow-hidden">
                                <Image
                                  src={resolveImageUrl(item.imageUrl)}
                                  alt={item.title}
                                  fill
                                  className="object-cover object-center"
                                  sizes="44px"
                                />
                              </div>
                            ) : (
                              <div className="global-search-page-icon">
                                <SearchIcon />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black uppercase tracking-[0.04em] text-[#16161a]">
                                {item.title}
                              </p>
                              <p className="truncate text-xs text-[#2c2940]">{item.subtitle}</p>
                            </div>

                            <div className="shrink-0 text-right">
                              {item.price ? (
                                <p className="text-xs font-bold text-[#1f2458]">{item.price}</p>
                              ) : null}
                              <p className="global-search-result-kind">
                                {item.categoryLabel}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
