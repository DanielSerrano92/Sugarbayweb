import ConcertCardsClient from "@/components/concerts/concert-cards-client";
import ConcertFilters from "@/components/concerts/concert-filters";
import ConcertPagination from "@/components/concerts/concert-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { buildConcertBreadcrumb } from "@/lib/navigation/breadcrumbs";
import { getConcertCatalog } from "@/lib/repositories/concerts";
import type { ConcertPeriod, ConcertQueryParams } from "@/lib/concerts/types";

const UPCOMING_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/proximos-conciertos.png?tr=w-2400,h-760,cm-extract,fo-top&updatedAt=1778369713978";
const PAST_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/conciertos-anteriores.png?tr=w-2400,h-760,cm-extract,fo-top";

type ConcertsCatalogPageProps = {
  period: ConcertPeriod;
  searchParams: Promise<ConcertQueryParams>;
};

function pickSingleQueryParam(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

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
  const selectedConcertSlug = pickSingleQueryParam(params.concert);
  const pageMeta = resolvePageMeta(period);
  const catalog = await getConcertCatalog(period, params);
  const filtersKey = [
    catalog.filters.from ?? "",
    catalog.filters.to ?? "",
    catalog.filters.continent,
    catalog.filters.country ?? "",
  ].join("-");
  return (
    <PageShell
      eyebrow={pageMeta.eyebrow}
      title={pageMeta.title}
      description={pageMeta.description}
      breadcrumbItems={buildConcertBreadcrumb(period)}
      toolbarLeft={(
        <div className="concert-top-controls">
          <ConcertFilters
            key={filtersKey}
            basePath={pageMeta.basePath}
            filters={catalog.filters}
            mode="icon-modal"
          />
          <ConcertPagination
            basePath={pageMeta.basePath}
            filters={catalog.filters}
            totalPages={catalog.totalPages}
          />
        </div>
      )}
      headerImageSrc={
        period === "upcoming"
          ? UPCOMING_PAGE_HEADER_IMAGE_SRC
          : PAST_PAGE_HEADER_IMAGE_SRC
      }
    >
      <section>
        {catalog.totalPages > 1 ? (
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.concerts.length} de {catalog.totalItems} conciertos.
          </p>
        ) : null}

        {catalog.concerts.length === 0 ? (
          <EmptyState
            title="No hay conciertos con estos filtros"
            description="Prueba cambiando rango de fechas o ubicacion."
          />
        ) : (
          <ConcertCardsClient
            period={period}
            concerts={catalog.concerts}
            selectedConcertSlug={selectedConcertSlug}
          />
        )}
      </section>
    </PageShell>
  );
}

