import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import PhotoFilters from "@/components/media/photo-filters";
import PhotoPagination from "@/components/media/photo-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import type { MediaPhotoQueryParams } from "@/lib/media/types";
import { getPhotoAlbumsCatalog } from "@/lib/repositories/media";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

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
    >
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <PhotoFilters basePath="/media/photos" filters={catalog.filters} />

        <div>
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} albumes.
          </p>

          {catalog.items.length === 0 ? (
            <EmptyState
              title="No hay albumes con esos filtros"
              description="Prueba otro rango de fechas o cambia el tipo."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((album) => (
                  <article
                    key={album.id}
                    className="sb-panel overflow-hidden rounded-2xl"
                  >
                    <div className="relative h-48 bg-zinc-100">
                      <Image
                        src={resolveImageUrl(album.coverImageUrl)}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {album.inferredType}
                      </p>
                      <h2 className="text-lg font-bold text-zinc-900">{album.title}</h2>
                      <p className="text-sm text-zinc-600">
                        {album.eventDateIso ? formatDate(album.eventDateIso) : "Fecha por confirmar"}
                      </p>
                      <p className="text-sm text-zinc-600">{album.photoCount} fotos</p>
                      <Link
                        href={`/media/photos/${album.slug}`}
                        className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <PhotoPagination
                basePath="/media/photos"
                filters={catalog.filters}
                totalPages={catalog.totalPages}
              />
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}


