"use client";

import type { VideoEmbedItem } from "@/lib/media/types";
import { formatDate } from "@/lib/utils";

type VideoCollectionViewerProps = {
  videos: VideoEmbedItem[];
};

export default function VideoCollectionViewer({ videos }: VideoCollectionViewerProps) {
  if (videos.length === 0) return null;

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {videos.map((video, index) => (
        <article key={video.id} className="sb-panel space-y-3 rounded-2xl p-4">
          <div
            className={`relative overflow-hidden rounded-xl border border-zinc-200 bg-black ${
              video.type === "short"
                ? "mx-auto aspect-[9/16] w-full max-w-[360px]"
                : "aspect-video w-full"
            }`}
          >
            <iframe
              src={video.embedUrl}
              title={video.title}
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-zinc-900">{video.title}</h3>
            {video.description ? (
              <p className="text-sm text-zinc-700">{video.description}</p>
            ) : null}
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              {video.type === "short" ? "YouTube Short" : "Video"} {index + 1}
            </p>
            {video.publishedAtIso ? (
              <p className="text-sm text-zinc-600">
                Publicado: {formatDate(video.publishedAtIso)}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
