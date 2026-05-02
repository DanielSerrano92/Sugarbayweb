import type { Metadata } from "next";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import StoreFiltersSidebar from "@/components/store/store-filters-sidebar";
import StorePagination from "@/components/store/store-pagination";
import StoreProductCard from "@/components/store/store-product-card";
import { getStoreCatalog } from "@/lib/repositories/store";
import type { StoreQueryParams } from "@/lib/store/types";

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

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Store"
          title="Tienda oficial Sugarbay"
          description="Ropa, accesorios y media con filtros avanzados, ordenacion y paginacion."
        />
      )}
    >
      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <StoreFiltersSidebar
          categories={catalog.categories}
          filters={catalog.filters}
        />

        <div>
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.products.length} de {catalog.totalItems} productos.
          </p>

          {catalog.products.length === 0 ? (
            <EmptyState
              title="No hay productos con esos filtros"
              description="Prueba cambiando categoria, precio o tipo."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.products.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>

              <StorePagination
                currentPage={catalog.filters.page}
                totalPages={catalog.totalPages}
                filters={catalog.filters}
              />
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

