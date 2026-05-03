import ConcertCardsClient from "@/components/concerts/concert-cards-client";
import ConcertFilters from "@/components/concerts/concert-filters";
import ConcertPagination from "@/components/concerts/concert-pagination";
import ConcertsNavigationLink from "@/components/concerts/concerts-navigation-link";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
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
  const navigationLink =
    period === "upcoming"
      ? { href: "/concerts/past", label: "Anteriores" }
      : { href: "/concerts/upcoming", label: "Próximos" };

  return (
    <PageShell
      eyebrow={pageMeta.eyebrow}
      title={pageMeta.title}
      description={pageMeta.description}
    >
      <section>
        <div className="mb-5 flex justify-end">
          <div className="concert-top-controls">
            <ConcertFilters
              basePath={pageMeta.basePath}
              filters={catalog.filters}
              availableCountries={catalog.availableCountries}
              mode="icon-modal"
            />
            <ConcertPagination
              basePath={pageMeta.basePath}
              filters={catalog.filters}
              totalPages={catalog.totalPages}
            />
          </div>
        </div>

        <p className="mb-4 text-sm text-zinc-600">
          Mostrando {catalog.concerts.length} de {catalog.totalItems} conciertos.
        </p>

        {catalog.concerts.length === 0 ? (
          <EmptyState
            title="No hay conciertos con estos filtros"
            description="Prueba cambiando rango de fechas o ubicacion."
          />
        ) : (
          <ConcertCardsClient period={period} concerts={catalog.concerts} />
        )}

        <ConcertsNavigationLink
          href={navigationLink.href}
          label={navigationLink.label}
        />
      </section>
    </PageShell>
  );
}
