import ConcertCardsClient from "@/components/concerts/concert-cards-client";
import ConcertFilters from "@/components/concerts/concert-filters";
import ConcertPagination from "@/components/concerts/concert-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import { getConcertCatalog } from "@/lib/repositories/concerts";
import type { ConcertPeriod, ConcertQueryParams } from "@/lib/concerts/types";

type ConcertsCatalogPageProps = {
  period: ConcertPeriod;
  searchParams: Promise<ConcertQueryParams>;
};

function resolvePageMeta(period: ConcertPeriod) {
  if (period === "upcoming") {
    return {
      basePath: "/concerts/upcoming",
      eyebrow: "Conciertos",
      title: "Proximos conciertos",
      description:
        "Agenda de Sugarbay con fechas confirmadas, ubicacion y entradas.",
    };
  }

  return {
    basePath: "/concerts/past",
    eyebrow: "Conciertos",
    title: "Conciertos anteriores",
    description:
      "Historico de shows de Sugarbay con cronica, tracklist y recursos multimedia.",
  };
}

export default async function ConcertsCatalogPage({
  period,
  searchParams,
}: ConcertsCatalogPageProps) {
  const params = await searchParams;
  const pageMeta = resolvePageMeta(period);
  const catalog = await getConcertCatalog(period, params);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={pageMeta.eyebrow}
        title={pageMeta.title}
        description={pageMeta.description}
      />

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ConcertFilters
          basePath={pageMeta.basePath}
          filters={catalog.filters}
          availableCountries={catalog.availableCountries}
        />

        <div>
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.concerts.length} de {catalog.totalItems} conciertos.
          </p>

          {catalog.concerts.length === 0 ? (
            <EmptyState
              title="No hay conciertos con estos filtros"
              description="Prueba cambiando rango de fechas o ubicacion."
            />
          ) : (
            <>
              <ConcertCardsClient period={period} concerts={catalog.concerts} />
              <ConcertPagination
                basePath={pageMeta.basePath}
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
