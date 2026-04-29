import Link from "next/link";

import ConcertCardsClient from "@/components/concerts/concert-cards-client";
import ConcertFilters from "@/components/concerts/concert-filters";
import ConcertPagination from "@/components/concerts/concert-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import type { ConcertPeriod, ConcertQueryParams } from "@/lib/concerts/types";
import { getConcertCatalog } from "@/lib/repositories/concerts";

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
    <div
      className="retro-upcoming-theme flex flex-1 flex-col"
    >
      <PageHero
        eyebrow={pageMeta.eyebrow}
        title={pageMeta.title}
        description={pageMeta.description}
      />

      <section className="flex flex-1 flex-col px-8 py-10">
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex w-full max-w-[280px] justify-end justify-self-center md:col-start-2 lg:col-start-3">
            <div className="retro-top-controls">
              <ConcertFilters
                basePath={pageMeta.basePath}
                filters={catalog.filters}
                availableCountries={catalog.availableCountries}
                mode="folder-modal"
              />
              <ConcertPagination
                basePath={pageMeta.basePath}
                filters={catalog.filters}
                totalPages={catalog.totalPages}
              />
            </div>
          </div>
        </div>

        {catalog.concerts.length === 0 ? (
          <EmptyState
            title="No hay conciertos con estos filtros"
            description="Prueba cambiando rango de fechas o ubicacion."
          />
        ) : (
          <ConcertCardsClient period={period} concerts={catalog.concerts} />
        )}

        {period === "upcoming" || period === "past" ? (
          <div className="mt-auto flex justify-center pt-12">
            <Link
              href={period === "upcoming" ? "/concerts/past" : "/concerts/upcoming"}
              className="block text-center text-black"
            >
              <div className="mx-auto mb-2 grid h-20 w-16 place-items-center text-5xl">
                &#127757;
              </div>
              <p className="font-black leading-tight">
                {period === "upcoming" ? (
                  <>
                    Conciertos
                    <br />
                    Anteriores
                  </>
                ) : (
                  <>
                    Conciertos
                    <br />
                    Proximos
                  </>
                )}
              </p>
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
