import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import EmptyState from "@/components/ui/empty-state";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import { getVideoCatalog } from "@/lib/repositories/media";
import { resolveImageUrl } from "@/lib/services/imagekit";

export const metadata: Metadata = {
  title: "Media Videos",
  description: "Colecciones de videos oficiales de Sugarbay.",
};

export default async function MediaVideosPage() {
  const catalog = await getVideoCatalog();

  return (
    <PageShell
      eyebrow="Media / Videos"
      title="Colecciones de videos"
      description="Explora colecciones oficiales de Sugarbay y abre cada una para ver sus videos."
    >
      <section>
        <p className="mb-4 text-sm text-zinc-600">
          Mostrando {catalog.items.length} colecciones.
        </p>

        {catalog.items.length === 0 ? (
          <EmptyState
            title="No hay colecciones de videos publicadas"
            description="Publica al menos una coleccion para mostrar tarjetas en esta seccion."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.items.map((item) => (
              <Link
                key={item.id}
                href={`/media/videos/${item.slug}`}
                className="group block"
              >
                <article className="sb-panel h-full overflow-hidden rounded-2xl border border-transparent transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-pink-400">
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
                    <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>
                    <p className="text-sm text-zinc-600">
                      {item.videoCount} {item.videoCount === 1 ? "video" : "videos"}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        <IconNavigationLink href="/media/photos" label="Fotos" />
      </section>
    </PageShell>
  );
}


