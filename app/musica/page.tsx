import type { Metadata } from "next";
import MusicCatalogClient from "@/components/music/music-catalog-client";
import MusicFiltersPanel from "@/components/music/music-filters";
import MusicPagination from "@/components/music/music-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import type { MusicQueryParams } from "@/lib/music/types";
import { getMusicCatalog } from "@/lib/repositories/music";

export const metadata: Metadata = {
  title: "Musica",
  description: "Catalogo mixto de canciones y albumes de Sugarbay.",
};

type MusicaPageProps = {
  searchParams: Promise<MusicQueryParams>;
};

export default async function MusicaPage({ searchParams }: MusicaPageProps) {
  const params = await searchParams;
  const catalog = await getMusicCatalog(params);

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Musica"
          title="Canciones y albumes"
          description="Catalogo mixto con filtros por fecha, tipo y orden. Abre cualquier tarjeta para ver su detalle completo."
        />
      )}
    >
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <MusicFiltersPanel basePath="/musica" filters={catalog.filters} />

        <div>
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} elementos.
          </p>

          {catalog.items.length === 0 ? (
            <EmptyState
              title="No hay resultados para estos filtros"
              description="Prueba otro rango de fechas, tipo o criterio de orden."
            />
          ) : (
            <>
              <MusicCatalogClient
                items={catalog.items}
                songsBySlug={catalog.songsBySlug}
                albumsBySlug={catalog.albumsBySlug}
              />
              <MusicPagination
                basePath="/musica"
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

