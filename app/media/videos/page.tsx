import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import VideoFilters from "@/components/media/video-filters";
import VideoPagination from "@/components/media/video-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import type { MediaVideoQueryParams } from "@/lib/media/types";
import { getVideoCatalog } from "@/lib/repositories/media";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

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
    <div className="space-y-6">
      <PageHero
        eyebrow="Media / Videos"
        title="Colecciones y videos unicos"
        description="Explora los videos oficiales de Sugarbay con filtros por fecha, tipo y orden."
      />

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <VideoFilters basePath="/media/videos" filters={catalog.filters} />

        <div>
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} resultados.
          </p>

          {catalog.items.length === 0 ? (
            <EmptyState
              title="No hay videos con esos filtros"
              description="Prueba ajustando tipo, fechas o criterio de orden."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((item) => (
                  <article
                    key={`${item.kind}-${item.id}`}
                    className="sb-panel overflow-hidden rounded-2xl"
                  >
                    <div className="relative h-48 bg-zinc-100">
                      <Image
                        src={resolveImageUrl(item.coverImageUrl)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        {item.kind === "collection" ? "Coleccion" : "Video unico"}
                      </p>
                      <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>
                      <p className="text-sm text-zinc-600">{formatDate(item.dateIso)}</p>
                      <p className="text-sm text-zinc-600">
                        {item.videoCount} {item.videoCount === 1 ? "video" : "videos"}
                      </p>
                      <Link
                        href={`/media/videos/${item.slug}`}
                        className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <VideoPagination
                basePath="/media/videos"
                filters={catalog.filters}
                totalPages={catalog.totalPages}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}


