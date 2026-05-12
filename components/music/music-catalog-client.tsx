"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import AppModal from "@/components/ui/app-modal";
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

type ExternalLinkKind =
  | "spotify"
  | "youtube"
  | "instagram"
  | "soundcloud"
  | "apple"
  | "tiktok"
  | "x"
  | "bandcamp"
  | "web";

function resolveExternalLinkKind(label: string, url: string): ExternalLinkKind {
  const source = `${label} ${url}`.toLowerCase();

  if (source.includes("spotify")) return "spotify";
  if (source.includes("youtube") || source.includes("youtu.be")) return "youtube";
  if (source.includes("instagram")) return "instagram";
  if (source.includes("soundcloud")) return "soundcloud";
  if (source.includes("apple music") || source.includes("music.apple") || source.includes("itunes")) {
    return "apple";
  }
  if (source.includes("tiktok")) return "tiktok";
  if (source.includes("x.com") || source.includes("twitter")) return "x";
  if (source.includes("bandcamp")) return "bandcamp";

  return "web";
}

function RetroExternalLinkIcon({ kind }: { kind: ExternalLinkKind }) {
  if (kind === "spotify") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M7.2 10.2C10 8.9 13.3 8.9 16.4 10" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M7.8 12.9C10.2 11.8 12.8 11.8 15.2 12.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8.6 15.4C10.2 14.7 12 14.7 13.6 15.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "youtube") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <rect x="3.2" y="6.4" width="17.6" height="11.2" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 9.4L15 12L10 14.6V9.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <rect x="4.1" y="4.1" width="15.8" height="15.8" rx="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "soundcloud") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <path d="M8.2 16.4H18.6A2.9 2.9 0 0 0 18.7 10.6A4.6 4.6 0 0 0 10.1 9.6A3.2 3.2 0 0 0 8.2 16.4Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M4.2 11.3V16.4M6 10.6V16.4M7.8 10.2V16.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "apple") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <path d="M14.8 4.6V14a3 3 0 1 1-2-2.8V7.4L18 6v7.5a3 3 0 1 1-2-2.8V5.8L14.8 4.6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <path d="M12.8 5.1V14.2A3.2 3.2 0 1 1 10.7 11.2V9.1A5.6 5.6 0 0 0 8.8 9A5.2 5.2 0 1 0 15 14.2V9.5A5.9 5.9 0 0 0 18.7 11V8.9A3.7 3.7 0 0 1 15 5.1H12.8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "x") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <path d="M5.2 4.8L10.8 12.3L5.1 19.2H7.6L12 13.9L15.9 19.2H19L13.1 11.3L18.4 4.8H15.9L11.9 9.8L8.3 4.8H5.2Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "bandcamp") {
    return (
      <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
        <path d="M6 16.8L11.4 7.2H18L12.6 16.8H6Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="retro-music-link-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.8 12H20.2M12 3.8A13.2 13.2 0 0 1 12 20.2M12 3.8A13.2 13.2 0 0 0 12 20.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
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

  const selectedSongExternalLinks = useMemo(() => {
    if (!selectedSong) return [];

    const seenUrls = new Set<string>();
    const seenPlatform = new Set<ExternalLinkKind>();

    return selectedSong.externalLinks.filter((link) => {
      const normalizedUrl = link.url.trim().toLowerCase();
      if (seenUrls.has(normalizedUrl)) return false;
      seenUrls.add(normalizedUrl);

      const kind = resolveExternalLinkKind(link.label, link.url);
      if (kind === "spotify" || kind === "apple") {
        if (seenPlatform.has(kind)) return false;
        seenPlatform.add(kind);
      }

      return true;
    });
  }, [selectedSong]);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 md:gap-6">
        {items.map((item) => (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            onClick={() =>
              item.kind === "song"
                ? setSelectedSongSlug(item.slug)
                : setSelectedAlbumSlug(item.slug)
            }
            className="retro-music-card-trigger w-full text-left"
            aria-label={`Abrir detalle de ${item.kind === "song" ? "cancion" : "album"}: ${item.title}`}
            aria-haspopup="dialog"
          >
            <article className="retro-concert-card w-full overflow-hidden">
              <div className="retro-concert-header">
                {item.kind === "song" ? "Cancion" : "Album"}
              </div>

              <div className="retro-concert-body">
                <div className="retro-concert-meta-item !p-0 overflow-hidden">
                  <div className="relative mx-auto aspect-square w-full max-w-[16.5rem] bg-zinc-100">
                    <Image
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.kind === "album" ? "Imagen del album de Sugarbay" : item.title}
                      fill
                      className="object-contain object-top p-1.5"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                </div>

                <div className="retro-concert-title-block">
                  <h2 className="retro-concert-title">{item.title}</h2>
                </div>

                <div className="retro-concert-meta">
                  <div className="retro-concert-meta-item">
                    <p className="retro-concert-meta-label">Lanzamiento</p>
                    <div className="retro-concert-row">
                      <RetroCalendarIcon />
                      <span>{formatDate(item.dateIso)}</span>
                    </div>
                  </div>

                  <div className="retro-concert-meta-item">
                    <p className="retro-concert-meta-label">Tipo</p>
                    <div className="retro-concert-row">
                      <span>{item.kind === "song" ? "Cancion" : "Album"}</span>
                    </div>
                  </div>
                </div>

                <div className="retro-concert-copy">
                  <p className="retro-concert-description">
                    {item.kind === "song"
                      ? "Abre el detalle para ver letra, creditos y recursos de la cancion."
                      : "Abre el detalle para ver tracklist, creditos y notas del album."}
                  </p>
                </div>

                <div className="retro-card-actions retro-card-actions-upcoming">
                  <span className="retro-card-action">Ver detalle</span>
                </div>
              </div>
            </article>
          </button>
        ))}
      </div>

      {selectedSong ? (
        <AppModal
          title="Detalle cancion"
          onClose={() => setSelectedSongSlug(null)}
          maxWidth="1220px"
          bodyClassName="retro-music-modal-body"
          overlayOpacity={0.3}
          variant="win95"
        >
          <div className="retro-music-modal-shell">
            <div className="retro-music-modal-meta">
              <p className="retro-music-modal-kind">Cancion</p>
              <p className="retro-music-modal-release">{selectedSong.title}</p>
              <p className="retro-music-modal-subline">
                {selectedSong.releaseTitle} - {formatDate(selectedSong.releaseDateIso)}
              </p>
            </div>

            <div className="retro-music-modal-layout">
              <div className="retro-music-modal-cover relative h-56 overflow-hidden bg-zinc-100">
                <Image
                  src={resolveImageUrl(selectedSong.imageUrl)}
                  alt={selectedSong.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>

              <div className="retro-music-modal-sections">
                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Info</h4>
                  <p className="retro-music-modal-text">
                    {selectedSong.info ?? "Sin informacion adicional."}
                  </p>
                  <p className="retro-music-modal-text">
                    Duracion: {formatDuration(selectedSong.durationSeconds)}
                  </p>
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Musicos y roles</h4>
                  {selectedSong.credits.length > 0 ? (
                    <ul className="retro-music-modal-list">
                      {selectedSong.credits.map((credit) => (
                        <li key={`${selectedSong.id}-${credit.id}-${credit.role}`}>
                          {credit.name} - {credit.role}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="retro-music-modal-muted">No hay creditos publicados.</p>
                  )}
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Letra</h4>
                  <p className="retro-music-modal-text whitespace-pre-line leading-relaxed">
                    {selectedSong.lyrics ?? "Letra no disponible por el momento."}
                  </p>
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Partitura</h4>
                  {selectedSong.sheetMusicUrl ? (
                    <a
                      href={selectedSong.sheetMusicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="retro-card-action retro-music-modal-link"
                    >
                      Abrir partitura
                    </a>
                  ) : (
                    <p className="retro-music-modal-muted">Partitura no disponible.</p>
                  )}
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Liner notes</h4>
                  <p className="retro-music-modal-text">
                    {selectedSong.linerNotes ?? "Sin liner notes publicados."}
                  </p>
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Enlaces externos</h4>
                  {selectedSongExternalLinks.length > 0 ? (
                    <div className="retro-music-modal-links">
                      {selectedSongExternalLinks.map((link) => (
                        <a
                          key={`${selectedSong.id}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="retro-music-modal-icon-link"
                          aria-label={`Abrir ${link.label}`}
                        >
                          <span className="retro-music-modal-icon-wrap" aria-hidden="true">
                            <RetroExternalLinkIcon
                              kind={resolveExternalLinkKind(link.label, link.url)}
                            />
                          </span>
                          <span className="retro-music-modal-icon-label">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="retro-music-modal-muted">Sin enlaces externos.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </AppModal>
      ) : null}

      {selectedAlbum ? (
        <AppModal
          title={selectedAlbum.title}
          onClose={() => setSelectedAlbumSlug(null)}
          maxWidth="1220px"
          bodyClassName="retro-music-modal-body"
          overlayOpacity={0.3}
          variant="win95"
        >
          <div className="retro-music-modal-shell">
            <div className="retro-music-modal-meta">
              <p className="retro-music-modal-kind">Album</p>
              <p className="retro-music-modal-release">
                {formatDate(selectedAlbum.releaseDateIso)}
              </p>
            </div>

            <div className="retro-music-modal-layout">
              <div className="retro-music-modal-cover relative h-56 overflow-hidden bg-zinc-100">
                <Image
                  src={resolveImageUrl(selectedAlbum.imageUrl)}
                  alt={selectedAlbum.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>

              <div className="retro-music-modal-sections">
                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Info</h4>
                  <p className="retro-music-modal-text">
                    {selectedAlbum.info ?? "Sin informacion adicional."}
                  </p>
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Musicos y roles</h4>
                  {selectedAlbum.credits.length > 0 ? (
                    <ul className="retro-music-modal-list">
                      {selectedAlbum.credits.map((credit) => (
                        <li key={`${selectedAlbum.id}-${credit.id}-${credit.role}`}>
                          {credit.name} - {credit.role}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="retro-music-modal-muted">No hay creditos publicados.</p>
                  )}
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Tracklist</h4>
                  {selectedAlbum.tracks.length > 0 ? (
                    <ol className="retro-music-modal-tracklist">
                      {selectedAlbum.tracks.map((track) => (
                        <li key={track.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAlbumSlug(null);
                              setSelectedSongSlug(track.slug);
                            }}
                            className="retro-music-modal-track"
                          >
                            <span>
                              {track.trackNumber}. {track.title}
                            </span>
                            <span className="retro-music-modal-muted">
                              {formatDuration(track.durationSeconds)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="retro-music-modal-muted">Sin tracks publicados.</p>
                  )}
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Liner notes</h4>
                  <p className="retro-music-modal-text">
                    {selectedAlbum.linerNotes ?? "Sin liner notes publicados."}
                  </p>
                </section>

                <section className="retro-music-modal-section">
                  <h4 className="retro-music-modal-heading">Enlaces externos</h4>
                  {selectedAlbum.externalLinks.length > 0 ? (
                    <div className="retro-music-modal-links">
                      {selectedAlbum.externalLinks.map((link) => (
                        <a
                          key={`${selectedAlbum.id}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="retro-music-modal-icon-link"
                          aria-label={`Abrir ${link.label}`}
                        >
                          <span className="retro-music-modal-icon-wrap" aria-hidden="true">
                            <RetroExternalLinkIcon
                              kind={resolveExternalLinkKind(link.label, link.url)}
                            />
                          </span>
                          <span className="retro-music-modal-icon-label">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="retro-music-modal-muted">Sin enlaces externos.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </AppModal>
      ) : null}
    </>
  );
}
