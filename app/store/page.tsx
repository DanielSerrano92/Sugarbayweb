import type { Metadata } from "next";
import PageShell from "@/components/ui/page-shell";
import StoreFiltersSidebar from "@/components/store/store-filters-sidebar";
import StorePagination from "@/components/store/store-pagination";
import StoreProductCard from "@/components/store/store-product-card";
import { getStoreCatalog } from "@/lib/repositories/store";
import type { StoreQueryParams } from "@/lib/store/types";

const STORE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/tienda.png?tr=w-2400,h-760,cm-extract,fo-top";
const STORE_ROPA_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/ropa.png?tr=w-2400,h-760,cm-extract,fo-top";
const STORE_ACCESORIOS_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/accesorios.png?tr=w-2400,h-760,cm-extract,fo-top";
const STORE_MEDIA_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/media.png?tr=w-2400,h-760,cm-extract,fo-top";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Catalogo oficial de Sugarbay con ropa, accesorios y media.",
};

type StorePageProps = {
  searchParams: Promise<StoreQueryParams>;
};

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const catalog = await getStoreCatalog(params);
  const hasNoProducts = catalog.products.length === 0;
  const headerImageSrc =
    catalog.filters.category === "ropa"
      ? STORE_ROPA_HEADER_IMAGE_SRC
      : catalog.filters.category === "accesorios"
        ? STORE_ACCESORIOS_HEADER_IMAGE_SRC
        : catalog.filters.category === "media"
          ? STORE_MEDIA_HEADER_IMAGE_SRC
          : STORE_HEADER_IMAGE_SRC;

  return (
    <PageShell
      eyebrow="Store"
      title="Tienda oficial Sugarbay"
      description="Ropa, accesorios y media con filtros avanzados, ordenacion y paginacion."
      headerImageSrc={headerImageSrc}
      contentClassName="space-y-6 store-catalog-content"
    >
      <section className="store-catalog-layout grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="store-results-toolbar mb-5 flex justify-end lg:col-start-2 lg:row-start-1 lg:mb-4">
          <div className="concert-top-controls concert-top-controls-right store-top-controls">
            <div className="store-mobile-filters-trigger lg:hidden">
              <StoreFiltersSidebar
                categories={catalog.categories}
                filters={catalog.filters}
                mode="icon-modal"
              />
            </div>
            <StorePagination
              currentPage={catalog.filters.page}
              totalPages={catalog.totalPages}
              filters={catalog.filters}
              className="store-pagination-shell"
            />
          </div>
        </div>

        <div className="store-catalog-sidebar hidden lg:block lg:col-start-1 lg:row-start-2">
          <StoreFiltersSidebar
            categories={catalog.categories}
            filters={catalog.filters}
          />
        </div>

        <div className="lg:col-start-2 lg:row-start-2">
          <div className={`store-results-shell ${hasNoProducts ? "store-results-shell-empty" : ""}`}>
            {hasNoProducts ? (
              <article className="retro-concert-card store-empty-results-card w-full overflow-hidden">
                <div className="retro-concert-header">Sin resultados</div>
                <div className="retro-concert-body">
                  <div className="retro-concert-title-block">
                    <h2 className="retro-concert-title">
                      No hay productos con esos filtros
                    </h2>
                  </div>

                  <div className="retro-concert-meta">
                    <div className="retro-concert-meta-item">
                      <p className="retro-concert-meta-label">Sugerencia</p>
                      <p className="retro-concert-description">
                        Prueba cambiando categoria, precio o tipo.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <div className="store-products-grid grid gap-5">
                {catalog.products.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

