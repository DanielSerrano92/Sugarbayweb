"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { HomeVideoBandItem } from "@/lib/media/types";
import { resolveImageUrl } from "@/lib/services/imagekit";

type HomeVideosBandProps = {
  items: HomeVideoBandItem[];
};

const AUTO_SCROLL_MS = 4400;

function formatShortDate(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HomeVideosBand({ items }: HomeVideosBandProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(items.length > 1);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const maxScrollLeft = Math.max(scrollWidth - clientWidth, 0);
      setCanGoPrev(scrollLeft > 6);
      setCanGoNext(scrollLeft + clientWidth < scrollWidth - 6);
      if (maxScrollLeft <= 6) {
        setScrollProgress(100);
        return;
      }
      const progress = Math.min(100, Math.max(0, (scrollLeft / maxScrollLeft) * 100));
      setScrollProgress(progress);
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items.length]);

  const scrollTrack = useCallback((direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;

    const firstItem = track.querySelector<HTMLElement>(".home-videos-band-item");
    const step = firstItem ? firstItem.offsetWidth + 10 : Math.round(track.clientWidth * 0.85);
    const maxLeft = Math.max(track.scrollWidth - track.clientWidth, 0);
    const isAtStart = track.scrollLeft <= 6;
    const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 6;

    if (direction === "next" && isAtEnd) {
      track.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      return;
    }

    if (direction === "prev" && isAtStart) {
      track.scrollTo({
        left: maxLeft,
        behavior: "smooth",
      });
      return;
    }

    const delta = direction === "next" ? step : -step;

    track.scrollBy({
      left: delta,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (items.length <= 1 || isAutoPaused) return;
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const intervalId = window.setInterval(() => {
      scrollTrack("next");
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(intervalId);
  }, [items.length, isAutoPaused, scrollTrack]);

  return (
    <section
      className="home-videos-band"
      aria-label="Banda de videos de Sugarbay"
      onMouseEnter={() => setIsAutoPaused(true)}
      onMouseLeave={() => setIsAutoPaused(false)}
      onFocusCapture={() => setIsAutoPaused(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsAutoPaused(false);
        }
      }}
    >
      <article className="win-window home-videos-band-window">
        <div className="win-titlebar home-videos-band-titlebar">
          <button
            type="button"
            className="win-button home-videos-band-nav"
            onClick={() => scrollTrack("prev")}
            aria-label="Ver videos anteriores"
            disabled={!canGoPrev}
          >
            {"<"}
          </button>

          <p className="home-videos-band-label">VIDEOS</p>

          <button
            type="button"
            className="win-button home-videos-band-nav"
            onClick={() => scrollTrack("next")}
            aria-label="Ver videos siguientes"
            disabled={!canGoNext}
          >
            {">"}
          </button>
        </div>

        <div ref={trackRef} className="home-videos-band-track" role="list">
          {items.length === 0 ? (
            <p className="home-videos-band-empty">
              No hay videos publicados por ahora. Vuelve pronto.
            </p>
          ) : (
            items.map((video) => (
              <Link
                key={video.id}
                href={`/media/videos/${video.collectionSlug}?video=${encodeURIComponent(video.videoSlug)}`}
                className="home-videos-band-item"
                role="listitem"
              >
                <div className="home-videos-band-thumb-frame">
                  <Image
                    src={resolveImageUrl(video.previewImageUrl)}
                    alt={`Video: ${video.title}`}
                    fill
                    sizes="(max-width: 767px) 68vw, (max-width: 1279px) 36vw, 290px"
                    className="home-videos-band-thumb"
                  />
                  <div className="home-videos-band-thumb-overlay">
                    <span className="home-videos-band-play" aria-hidden="true">
                      <svg viewBox="0 0 16 16" className="home-videos-band-play-icon">
                        <path d="M5 3L13 8L5 13V3Z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="home-videos-band-meta">
                  <p className="home-videos-band-collection">{video.collectionTitle}</p>
                  <h3 className="home-videos-band-title">{video.title}</h3>
                  <p className="home-videos-band-date">{formatShortDate(video.publishedAtIso)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="home-videos-band-progress-wrap" aria-hidden="true">
            <div className="home-hero-carousel-progress home-videos-band-progress">
              <span
                className="home-hero-carousel-progress-fill"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}

