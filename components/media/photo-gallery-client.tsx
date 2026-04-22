"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { PhotoDetailItem } from "@/lib/media/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

type PhotoGalleryClientProps = {
  photos: PhotoDetailItem[];
};

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
    <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="sb-panel max-h-[640px] overflow-auto rounded-2xl p-3">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-zinc-600">
          Miniaturas
        </h2>
        <div className="space-y-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`block w-full overflow-hidden rounded-xl border ${
                index === selectedIndex
                  ? "border-emerald-700"
                  : "border-zinc-200 hover:border-emerald-300"
              }`}
            >
              <div className="relative h-24 w-full bg-zinc-100">
                <Image
                  src={resolveImageUrl(photo.imageUrl)}
                  alt={photo.title ?? `Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
            </button>
          ))}
        </div>
      </aside>

      <article className="sb-panel rounded-2xl p-4">
        <div className="relative h-[520px] overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={resolveImageUrl(selected.imageUrl)}
            alt={selected.title ?? "Foto seleccionada"}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedIndex((current) => Math.max(0, current - 1))}
            disabled={selectedIndex === 0}
            className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Foto anterior
          </button>
          <p className="text-sm font-medium text-zinc-700">
            {selectedIndex + 1} / {photos.length}
          </p>
          <button
            type="button"
            onClick={() =>
              setSelectedIndex((current) => Math.min(photos.length - 1, current + 1))
            }
            disabled={selectedIndex === photos.length - 1}
            className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Foto siguiente
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-zinc-700">
          <p className="text-lg font-bold text-zinc-900">
            {selected.title ?? `Foto ${selectedIndex + 1}`}
          </p>
          {selected.caption ? <p>{selected.caption}</p> : null}
          <p>
            Fotografo: <span className="font-semibold">{selected.photographer}</span>
          </p>
          {selected.takenAtIso ? <p>Fecha: {formatDate(selected.takenAtIso)}</p> : null}
        </div>
      </article>
    </section>
  );
}
