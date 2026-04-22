"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type {
  MusicAlbumDetail,
  MusicCatalogCard,
  MusicSongDetail,
} from "@/lib/music/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

type MusicCatalogClientProps = {
  items: MusicCatalogCard[];
  songsBySlug: Record<string, MusicSongDetail>;
  albumsBySlug: Record<string, MusicAlbumDetail>;
};

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function MusicCatalogClient({
  items,
  songsBySlug,
  albumsBySlug,
}: MusicCatalogClientProps) {
  const [selectedSongSlug, setSelectedSongSlug] = useState<string | null>(null);
  const [selectedAlbumSlug, setSelectedAlbumSlug] = useState<string | null>(null);

  const selectedSong = useMemo(
    () => (selectedSongSlug ? songsBySlug[selectedSongSlug] ?? null : null),
    [selectedSongSlug, songsBySlug],
  );

  const selectedAlbum = useMemo(
    () => (selectedAlbumSlug ? albumsBySlug[selectedAlbumSlug] ?? null : null),
    [selectedAlbumSlug, albumsBySlug],
  );

  useEffect(() => {
    if (!selectedSong && !selectedAlbum) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSongSlug(null);
        setSelectedAlbumSlug(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedAlbum, selectedSong]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            onClick={() =>
              item.kind === "song"
                ? setSelectedSongSlug(item.slug)
                : setSelectedAlbumSlug(item.slug)
            }
            className="group text-left"
          >
            <article className="sb-panel h-full overflow-hidden rounded-2xl transition group-hover:-translate-y-0.5 group-hover:border-emerald-300">
              <div className="relative h-48 bg-zinc-100">
                <Image
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {item.kind === "song" ? "Cancion" : "Album"}
                </p>
                <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>
                <p className="text-sm text-zinc-600">{formatDate(item.dateIso)}</p>
              </div>
            </article>
          </button>
        ))}
      </div>

      {selectedSong ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedSongSlug(null)}
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar detalle de cancion"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="song-detail-title"
            className="sb-window relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Cancion</p>
                <h3 id="song-detail-title" className="mt-1 text-3xl font-black text-zinc-900">
                  {selectedSong.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {selectedSong.releaseTitle} · {formatDate(selectedSong.releaseDateIso)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSongSlug(null)}
                className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="relative h-56 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={resolveImageUrl(selectedSong.imageUrl)}
                  alt={selectedSong.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>

              <div className="space-y-5">
                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Info
                  </h4>
                  <p className="text-sm text-zinc-700">
                    {selectedSong.info ?? "Sin informacion adicional."}
                  </p>
                  <p className="text-sm text-zinc-700">
                    Duracion: {formatDuration(selectedSong.durationSeconds)}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Musicos y roles
                  </h4>
                  {selectedSong.credits.length > 0 ? (
                    <ul className="space-y-1 text-sm text-zinc-700">
                      {selectedSong.credits.map((credit) => (
                        <li key={`${selectedSong.id}-${credit.id}-${credit.role}`}>
                          {credit.name} · {credit.role}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500">No hay creditos publicados.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Letra
                  </h4>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                    {selectedSong.lyrics ?? "Letra no disponible por el momento."}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Partitura
                  </h4>
                  {selectedSong.sheetMusicUrl ? (
                    <a
                      href={selectedSong.sheetMusicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
                    >
                      Abrir partitura
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-500">Partitura no disponible.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Liner notes
                  </h4>
                  <p className="text-sm text-zinc-700">
                    {selectedSong.linerNotes ?? "Sin liner notes publicados."}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Enlaces externos
                  </h4>
                  {selectedSong.externalLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSong.externalLinks.map((link) => (
                        <a
                          key={`${selectedSong.id}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Sin enlaces externos.</p>
                  )}
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedAlbum ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedAlbumSlug(null)}
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar detalle de album"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="album-detail-title"
            className="sb-window relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Album</p>
                <h3 id="album-detail-title" className="mt-1 text-3xl font-black text-zinc-900">
                  {selectedAlbum.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  {formatDate(selectedAlbum.releaseDateIso)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlbumSlug(null)}
                className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="relative h-56 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={resolveImageUrl(selectedAlbum.imageUrl)}
                  alt={selectedAlbum.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>

              <div className="space-y-5">
                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Info
                  </h4>
                  <p className="text-sm text-zinc-700">
                    {selectedAlbum.info ?? "Sin informacion adicional."}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Musicos y roles
                  </h4>
                  {selectedAlbum.credits.length > 0 ? (
                    <ul className="space-y-1 text-sm text-zinc-700">
                      {selectedAlbum.credits.map((credit) => (
                        <li key={`${selectedAlbum.id}-${credit.id}-${credit.role}`}>
                          {credit.name} · {credit.role}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-zinc-500">No hay creditos publicados.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Tracklist
                  </h4>
                  {selectedAlbum.tracks.length > 0 ? (
                    <ol className="space-y-1">
                      {selectedAlbum.tracks.map((track) => (
                        <li key={track.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAlbumSlug(null);
                              setSelectedSongSlug(track.slug);
                            }}
                            className="sb-panel-soft flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                          >
                            <span>
                              {track.trackNumber}. {track.title}
                            </span>
                            <span className="text-zinc-500">
                              {formatDuration(track.durationSeconds)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-zinc-500">Sin tracks publicados.</p>
                  )}
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Liner notes
                  </h4>
                  <p className="text-sm text-zinc-700">
                    {selectedAlbum.linerNotes ?? "Sin liner notes publicados."}
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-600">
                    Enlaces externos
                  </h4>
                  {selectedAlbum.externalLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAlbum.externalLinks.map((link) => (
                        <a
                          key={`${selectedAlbum.id}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Sin enlaces externos.</p>
                  )}
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
