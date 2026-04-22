"use client";

import { useMemo, useState } from "react";

import type { VideoEmbedItem } from "@/lib/media/types";
import { formatDate } from "@/lib/utils";

type VideoCollectionViewerProps = {
  videos: VideoEmbedItem[];
};

function formatDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function VideoCollectionViewer({ videos }: VideoCollectionViewerProps) {
  const [selectedSlug, setSelectedSlug] = useState(videos[0]?.slug ?? null);
  const selectedVideo = useMemo(
    () => videos.find((video) => video.slug === selectedSlug) ?? videos[0] ?? null,
    [selectedSlug, videos],
  );

  if (!selectedVideo) return null;

  return (
    <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="sb-panel rounded-2xl p-3">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
          Videos
        </h2>
        <div className="space-y-2">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setSelectedSlug(video.slug)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                video.slug === selectedVideo.slug
                  ? "border-emerald-500 bg-zinc-100 text-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <p className="font-semibold">{video.title}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {video.publishedAtIso ? formatDate(video.publishedAtIso) : "Fecha no disponible"}
                {" · "}
                {formatDuration(video.durationSeconds)}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <article className="sb-panel space-y-3 rounded-2xl p-4">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-black pt-[56.25%]">
          <iframe
            src={selectedVideo.embedUrl}
            title={selectedVideo.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div>
          <h3 className="text-xl font-black text-zinc-900">{selectedVideo.title}</h3>
          {selectedVideo.description ? (
            <p className="mt-1 text-sm text-zinc-700">{selectedVideo.description}</p>
          ) : null}
        </div>
      </article>
    </section>
  );
}
