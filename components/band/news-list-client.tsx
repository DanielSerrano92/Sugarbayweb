"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { BandNewsItemView } from "@/lib/band/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

type BandNewsListClientProps = {
  items: BandNewsItemView[];
  selectedNewsSlug?: string;
};

function RetroCalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M3 2H4V4H6V2H10V4H12V2H13V4H14V14H2V4H3V2ZM3 5V13H13V5H3ZM4 7H6V9H4V7ZM7 7H9V9H7V7ZM10 7H12V9H10V7ZM4 10H6V12H4V10ZM7 10H9V12H7V10Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function BandNewsListClient({
  items,
  selectedNewsSlug,
}: BandNewsListClientProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (!selectedNewsSlug) return new Set();

    const selectedItem = items.find((item) => item.slug === selectedNewsSlug);
    return selectedItem ? new Set([selectedItem.id]) : new Set();
  });
  const scrolledNewsSlugRef = useRef<string | null>(null);
  const selectedNewsId = useMemo(() => {
    if (!selectedNewsSlug) return null;
    return items.find((item) => item.slug === selectedNewsSlug)?.id ?? null;
  }, [items, selectedNewsSlug]);

  useEffect(() => {
    if (!selectedNewsSlug || !selectedNewsId) return;
    if (scrolledNewsSlugRef.current === selectedNewsSlug) return;

    const targetElement = document.getElementById(`news-${selectedNewsSlug}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      scrolledNewsSlugRef.current = selectedNewsSlug;
    }
  }, [selectedNewsId, selectedNewsSlug]);

  function toggleExpanded(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="retro-news-concert-grid">
      {items.map((item) => {
        const expanded = expandedIds.has(item.id);
        const publishedLabel = formatDate(item.publishedAtIso, "es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        const headerLabel = item.tags[0] ? `#${item.tags[0]}` : "Noticias Sugarbay";
        const imageHeightClass = "h-60 sm:h-64 lg:h-72";

        return (
          <article
            key={item.id}
            id={`news-${item.slug}`}
            className="retro-concert-card retro-news-concert-card overflow-hidden"
          >
            <div className="retro-concert-header retro-news-header">{headerLabel}</div>

            <div className="retro-concert-body">
              <div className="retro-concert-meta-item retro-news-image-frame !p-0 overflow-hidden">
                <div className={`relative bg-zinc-100 ${imageHeightClass}`}>
                  <Image
                    src={resolveImageUrl(item.imageUrl)}
                    alt={item.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
              </div>

              <div className="retro-concert-title-block text-center">
                <h2 className="retro-concert-title">{item.title}</h2>
              </div>

              <div className="retro-concert-meta">
                <div className="retro-concert-meta-item">
                  <p className="retro-concert-meta-label">Publicado</p>
                  <div className="retro-concert-row">
                    <RetroCalendarIcon />
                    <span>{publishedLabel}</span>
                  </div>
                </div>
              </div>

              <div className="retro-concert-copy">
                <p className="retro-concert-description">{item.summary}</p>
              </div>

              <div
                id={`news-content-${item.id}`}
                className={expanded ? "retro-concert-copy space-y-3" : "hidden"}
              >
                <p className="retro-concert-description">{item.content}</p>

                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}`} className="retro-card-action !w-auto px-3">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.relatedLinks.length > 0 ? (
                  <div className="retro-card-actions retro-card-actions-upcoming">
                    {item.relatedLinks.map((link) => (
                      <Link
                        key={`${item.id}-${link.href}`}
                        href={link.href}
                        className="retro-card-action"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="retro-card-actions retro-card-actions-upcoming">
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.id)}
                  className="retro-card-action"
                  aria-expanded={expanded}
                  aria-controls={`news-content-${item.id}`}
                >
                  {expanded ? "Menos" : "Mas"}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
