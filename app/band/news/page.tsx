import type { Metadata } from "next";
import BandNewsFilters from "@/components/band/news-filters";
import BandNewsListClient from "@/components/band/news-list-client";
import BandNewsPagination from "@/components/band/news-pagination";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { buildBandNewsBreadcrumb } from "@/lib/navigation/breadcrumbs";
import type { BandNewsQueryParams } from "@/lib/band/types";
import { getBandNewsCatalog } from "@/lib/repositories/band";

const NEWS_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/noticias.png?tr=w-2400,h-760,cm-extract,fo-top";

export const metadata: Metadata = {
  title: "Banda Noticias",
  description: "Noticias oficiales de Sugarbay con filtros y detalle expandible.",
};

type BandNewsPageProps = {
  searchParams: Promise<BandNewsQueryParams>;
};

function pickSingleQueryParam(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

export default async function BandNewsPage({ searchParams }: BandNewsPageProps) {
  const params = await searchParams;
  const catalog = await getBandNewsCatalog(params);
  const selectedNewsSlug = pickSingleQueryParam(params.news);
  const selectedNewsTitle = selectedNewsSlug
    ? catalog.items.find((item) => item.slug === selectedNewsSlug)?.title
    : undefined;

  return (
    <PageShell
      eyebrow="Band"
      title="Noticias de Sugarbay"
      description="Actualidad oficial de la banda con detalle expandible y enlaces relacionados."
      breadcrumbItems={buildBandNewsBreadcrumb(selectedNewsTitle)}
      toolbarLeft={(
        <div className="concert-top-controls">
          <BandNewsFilters basePath="/band/news" filters={catalog.filters} />
          <BandNewsPagination
            basePath="/band/news"
            filters={catalog.filters}
            totalPages={catalog.totalPages}
          />
        </div>
      )}
      headerImageSrc={NEWS_PAGE_HEADER_IMAGE_SRC}
    >
      <section>
        {catalog.totalPages > 1 ? (
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} noticias.
          </p>
        ) : null}

        {catalog.items.length === 0 ? (
          <EmptyState
            title="No hay noticias con ese filtro"
            description="Prueba cambiando el rango de fechas o resetear filtros."
          />
        ) : (
          <BandNewsListClient items={catalog.items} selectedNewsSlug={selectedNewsSlug} />
        )}
      </section>
    </PageShell>
  );
}

