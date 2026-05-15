import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PhotoFilters from "@/components/media/photo-filters";
import PhotoPagination from "@/components/media/photo-pagination";
import EmptyState from "@/components/ui/empty-state";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import { buildMediaPhotosBreadcrumb } from "@/lib/navigation/breadcrumbs";
import type { MediaPhotoQueryParams } from "@/lib/media/types";
import { getPhotoAlbumsCatalog } from "@/lib/repositories/media";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

const MEDIA_PHOTOS_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/fotos.png?tr=w-2400,h-760,cm-extract,fo-top";

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

function RetroPhotoIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M2 4H5L6 2H10L11 4H14V14H2V4ZM4 8A4 4 0 1 0 12 8A4 4 0 1 0 4 8ZM6 8A2 2 0 1 1 10 8A2 2 0 0 1 6 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Media Fotos",
  description: "Albumes fotograficos de Sugarbay con filtros y detalle.",
};

type MediaPhotosPageProps = {
  searchParams: Promise<MediaPhotoQueryParams>;
};

export default async function MediaPhotosPage({ searchParams }: MediaPhotosPageProps) {
  const params = await searchParams;
  const catalog = await getPhotoAlbumsCatalog(params);

  return (
    <PageShell
      eyebrow="Media / Fotos"
      title="Albumes de fotos"
      description="Galerias oficiales de Sugarbay con filtros por fecha, tipo y orden."
      breadcrumbItems={buildMediaPhotosBreadcrumb()}
      toolbarLeft={(
        <div className="concert-top-controls">
          <PhotoFilters basePath="/media/photos" filters={catalog.filters} />
          <PhotoPagination
            basePath="/media/photos"
            filters={catalog.filters}
            totalPages={catalog.totalPages}
          />
        </div>
      )}
      headerImageSrc={MEDIA_PHOTOS_PAGE_HEADER_IMAGE_SRC}
    >
      <section>
        {catalog.totalPages > 1 ? (
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} albumes.
          </p>
        ) : null}

        {catalog.items.length === 0 ? (
          <EmptyState
            title="No hay albumes con esos filtros"
            description="Prueba otro rango de fechas o cambia el tipo."
          />
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:gap-7 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-4">
            {catalog.items.map((album) => (
              <article
                key={album.id}
                className="retro-concert-card w-full max-w-[26.5rem] overflow-hidden"
              >
                <div className="retro-concert-header">
                  {album.inferredType}
                </div>

                <div className="retro-concert-body">
                  <div className="retro-concert-meta-item !p-0 overflow-hidden">
                    <div className="relative h-48 bg-zinc-100">
                      <Image
                        src={resolveImageUrl(album.coverImageUrl)}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                  </div>

                  <div className="retro-concert-title-block">
                    <h2 className="retro-concert-title">{album.title}</h2>
                  </div>

                  <div className="retro-concert-meta">
                    <div className="retro-concert-meta-item">
                      <p className="retro-concert-meta-label">Fecha</p>
                      <div className="retro-concert-row">
                        <RetroCalendarIcon />
                        <span>
                          {album.eventDateIso
                            ? formatDate(album.eventDateIso)
                            : "Fecha por confirmar"}
                        </span>
                      </div>
                    </div>

                    <div className="retro-concert-meta-item">
                      <p className="retro-concert-meta-label">Contenido</p>
                      <div className="retro-concert-row">
                        <RetroPhotoIcon />
                        <span>{album.photoCount} fotos</span>
                      </div>
                    </div>
                  </div>

                  <div className="retro-concert-copy">
                    <p className="retro-concert-description">
                      Explora la galeria completa con capturas oficiales del evento.
                    </p>
                  </div>

                  <div className="retro-card-actions retro-card-actions-upcoming">
                    <Link href={`/media/photos/${album.slug}`} className="retro-card-action">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <IconNavigationLink href="/media/videos" label="Videos" />
      </section>
    </PageShell>
  );
}


