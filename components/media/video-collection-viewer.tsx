"use client";

import { useMemo, useState } from "react";

import type { VideoEmbedItem } from "@/lib/media/types";
import { formatDate } from "@/lib/utils";

type VideoCollectionViewerProps = {
  videos: VideoEmbedItem[];
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

function RetroVideoIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M2 3H11V13H2V3ZM12 6L15 4V12L12 10V6ZM4 5V11H9V5H4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) {
    return "No disponible";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function VideoCollectionViewer({
  videos,
}: VideoCollectionViewerProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    videos[0]?.slug ?? null,
  );

  const selectedVideo = useMemo(
    () => videos.find((video) => video.slug === selectedSlug) ?? videos[0],
    [selectedSlug, videos],
  );

  if (videos.length === 0 || !selectedVideo) return null;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] lg:gap-5">
      <aside className="retro-concert-card w-full overflow-hidden">
        <div className="retro-concert-header retro-video-collection-header">
          Videos de la coleccion
        </div>

        <div className="retro-concert-body">
          <div className="retro-music-modal-tracklist">
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelectedSlug(video.slug)}
                className={`retro-music-modal-track ${
                  video.slug === selectedVideo.slug
                    ? "retro-video-track-active"
                    : ""
                }`}
              >
                <span className="retro-video-track-title">{video.title}</span>
                <span className="retro-music-modal-muted">
                  {video.publishedAtIso
                    ? formatDate(video.publishedAtIso)
                    : "Fecha no disponible"}
                  {" - "}
                  {formatDuration(video.durationSeconds)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <article className="retro-concert-card w-full overflow-hidden">
        <div className="retro-concert-header">Reproductor</div>

        <div className="retro-concert-body">
          <div className="retro-concert-meta-item !p-0 overflow-hidden">
            <div
              className={`relative bg-black ${
                selectedVideo.type === "short"
                  ? "mx-auto aspect-[9/16] w-full max-w-[360px]"
                  : "pt-[56.25%]"
              }`}
            >
              <iframe
                src={selectedVideo.embedUrl}
                title={selectedVideo.title}
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="retro-concert-title-block">
            <h3 className="retro-concert-title">{selectedVideo.title}</h3>
          </div>

          <div className="retro-concert-meta">
            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Publicado</p>
              <div className="retro-concert-row">
                <RetroCalendarIcon />
                <span>
                  {selectedVideo.publishedAtIso
                    ? formatDate(selectedVideo.publishedAtIso)
                    : "Fecha no disponible"}
                </span>
              </div>
            </div>

            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Duracion</p>
              <div className="retro-concert-row">
                <RetroVideoIcon />
                <span>{formatDuration(selectedVideo.durationSeconds)}</span>
              </div>
            </div>
          </div>

          {selectedVideo.description ? (
            <div className="retro-concert-copy">
              <p className="retro-concert-description">
                {selectedVideo.description}
              </p>
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}