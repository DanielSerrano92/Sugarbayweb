"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { PhotoDetailItem } from "@/lib/media/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

type PhotoGalleryClientProps = {
  photos: PhotoDetailItem[];
};

function RetroCameraIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M2 4H5L6 2H10L11 4H14V14H2V4ZM4 8A4 4 0 1 0 12 8A4 4 0 1 0 4 8ZM6 8A2 2 0 1 1 10 8A2 2 0 0 1 6 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

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

export default function PhotoGalleryClient({ photos }: PhotoGalleryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = useMemo(() => photos[selectedIndex] ?? null, [photos, selectedIndex]);

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => Math.min(photos.length - 1, current + 1));
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => Math.max(0, current - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [photos.length, selected]);

  if (!selected) return null;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:gap-5">
      <aside className="retro-concert-card retro-photo-detail-card w-full overflow-hidden">
        <div className="retro-concert-header">Miniaturas</div>
        <div className="retro-concert-body">
          <div className="retro-photo-thumbs-scroll">
            <div className="retro-photo-thumbs-grid">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`retro-photo-thumb-btn ${
                    index === selectedIndex ? "retro-photo-thumb-active" : ""
                  }`}
                  aria-label={`Seleccionar foto ${index + 1}`}
                  aria-current={index === selectedIndex ? "true" : undefined}
                >
                  <div className="relative h-24 w-full bg-zinc-100">
                    <Image
                      src={resolveImageUrl(photo.imageUrl)}
                      alt={photo.title ?? `Foto ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <article className="retro-concert-card retro-photo-detail-card w-full overflow-hidden">
        <div className="retro-concert-header">Vista previa</div>
        <div className="retro-concert-body">
          <div className="retro-concert-meta-item !p-0 overflow-hidden">
            <div className="retro-photo-main-frame relative h-[420px] bg-zinc-100 sm:h-[520px]">
              <Image
                src={resolveImageUrl(selected.imageUrl)}
                alt={selected.title ?? "Foto seleccionada"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 70vw"
              />
            </div>
          </div>

          <div className="retro-photo-nav">
            <button
              type="button"
              onClick={() => setSelectedIndex((current) => Math.max(0, current - 1))}
              disabled={selectedIndex === 0}
              className="retro-card-action retro-photo-nav-btn"
            >
              Foto anterior
            </button>
            <p className="retro-photo-counter" aria-live="polite">
              {selectedIndex + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((current) => Math.min(photos.length - 1, current + 1))
              }
              disabled={selectedIndex === photos.length - 1}
              className="retro-card-action retro-photo-nav-btn"
            >
              Foto siguiente
            </button>
          </div>

          <div className="retro-concert-title-block">
            <h3 className="retro-concert-title">{selected.title ?? `Foto ${selectedIndex + 1}`}</h3>
          </div>

          <div className="retro-concert-meta">
            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Fotografo</p>
              <div className="retro-concert-row">
                <RetroCameraIcon />
                <span>{selected.photographer}</span>
              </div>
            </div>
            {selected.takenAtIso ? (
              <div className="retro-concert-meta-item">
                <p className="retro-concert-meta-label">Fecha del evento</p>
                <div className="retro-concert-row">
                  <RetroCalendarIcon />
                  <span>{formatDate(selected.takenAtIso)}</span>
                </div>
              </div>
            ) : null}
          </div>

          {selected.caption ? (
            <div className="retro-concert-copy">
              <p className="retro-concert-description">{selected.caption}</p>
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
