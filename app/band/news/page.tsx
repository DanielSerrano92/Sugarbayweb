import type { Metadata } from "next";
import BandNewsFilters from "@/components/band/news-filters";
import BandNewsListClient from "@/components/band/news-list-client";
import BandNewsPagination from "@/components/band/news-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import type { BandNewsQueryParams } from "@/lib/band/types";
import { getBandNewsCatalog } from "@/lib/repositories/band";

export const metadata: Metadata = {
  title: "Banda Noticias",
  description: "Noticias oficiales de Sugarbay con filtros y detalle expandible.",
};

type BandNewsPageProps = {
  searchParams: Promise<BandNewsQueryParams>;
};

export default async function BandNewsPage({ searchParams }: BandNewsPageProps) {
  const params = await searchParams;
  const catalog = await getBandNewsCatalog(params);

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Band"
          title="Noticias de Sugarbay"
          description="Actualidad oficial de la banda con detalle expandible y enlaces relacionados."
        />
      )}
    >
      <BandNewsFilters basePath="/band/news" filters={catalog.filters} />

      <p className="text-sm text-zinc-600">
        Mostrando {catalog.items.length} de {catalog.totalItems} noticias.
      </p>

      {catalog.items.length === 0 ? (
        <EmptyState
          title="No hay noticias con ese filtro"
          description="Prueba cambiando el rango de fechas o resetear filtros."
        />
      ) : (
        <>
          <BandNewsListClient items={catalog.items} />
          <BandNewsPagination
            basePath="/band/news"
            filters={catalog.filters}
            totalPages={catalog.totalPages}
          />
        </>
      )}
    </PageShell>
  );
}

