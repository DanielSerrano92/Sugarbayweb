import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import VideoFilters from "@/components/media/video-filters";
import VideoPagination from "@/components/media/video-pagination";
import EmptyState from "@/components/ui/empty-state";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import type { MediaVideoQueryParams } from "@/lib/media/types";
import { getVideoCatalog } from "@/lib/repositories/media";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

const MEDIA_VIDEOS_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/videos.png?tr=w-2400,h-760,cm-extract,fo-top";

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

export const metadata: Metadata = {
  title: "Media Videos",
  description: "Colecciones y videos unicos de Sugarbay con detalle embebido.",
};

type MediaVideosPageProps = {
  searchParams: Promise<MediaVideoQueryParams>;
};

export default async function MediaVideosPage({ searchParams }: MediaVideosPageProps) {
  const params = await searchParams;
  const catalog = await getVideoCatalog(params);

  return (
    <PageShell
      eyebrow="Media / Videos"
      title="Colecciones y videos unicos"
      description="Explora los videos oficiales de Sugarbay con filtros por fecha, tipo y orden."
      headerImageSrc={MEDIA_VIDEOS_PAGE_HEADER_IMAGE_SRC}
    >
      <section>
        <div className="mb-5 flex justify-end">
          <div className="concert-top-controls concert-top-controls-right">
            <VideoFilters basePath="/media/videos" filters={catalog.filters} />
            <VideoPagination
              basePath="/media/videos"
              filters={catalog.filters}
              totalPages={catalog.totalPages}
            />
          </div>
        </div>

        {catalog.totalPages > 1 ? (
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} resultados.
          </p>
        ) : null}

        {catalog.items.length === 0 ? (
          <EmptyState
            title="No hay videos con esos filtros"
            description="Prueba ajustando tipo, fechas o criterio de orden."
          />
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:gap-7 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-4">
            {catalog.items.map((item) => (
              <article
                key={`${item.kind}-${item.id}`}
                className="retro-concert-card w-full max-w-[26.5rem] overflow-hidden"
              >
                <div className="retro-concert-header">
                  {item.kind === "collection" ? "Coleccion" : "Video unico"}
                </div>

                <div className="retro-concert-body">
                  <div className="retro-concert-meta-item !p-0 overflow-hidden">
                    <div className="relative h-48 bg-zinc-100">
                      <Image
                        src={resolveImageUrl(item.coverImageUrl)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                  </div>

                  <div className="retro-concert-title-block">
                    <h2 className="retro-concert-title">{item.title}</h2>
                  </div>

                  <div className="retro-concert-meta">
                    <div className="retro-concert-meta-item">
                      <p className="retro-concert-meta-label">Fecha</p>
                      <div className="retro-concert-row">
                        <RetroCalendarIcon />
                        <span>{formatDate(item.dateIso)}</span>
                      </div>
                    </div>

                    <div className="retro-concert-meta-item">
                      <p className="retro-concert-meta-label">Contenido</p>
                      <div className="retro-concert-row">
                        <RetroVideoIcon />
                        <span>
                          {item.videoCount} {item.videoCount === 1 ? "video" : "videos"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="retro-concert-copy">
                    <p className="retro-concert-description">
                      Accede al detalle para ver la coleccion y reproducir los videos.
                    </p>
                  </div>

                  <div className="retro-card-actions retro-card-actions-upcoming">
                    <Link href={`/media/videos/${item.slug}`} className="retro-card-action">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <IconNavigationLink href="/media/photos" label="Fotos" />
      </section>
    </PageShell>
  );
}


