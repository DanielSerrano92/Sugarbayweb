import type { Metadata } from "next";
import Link from "next/link";

import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { searchHeaderContent } from "@/lib/repositories/search";
import { formatCurrency } from "@/lib/utils";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function pickQuery(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value ?? "").trim();
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = pickQuery(params.q);

  return {
    title: query ? `Buscar: ${query}` : "Buscar",
    description: query
      ? `Resultados de paginas y productos para "${query}".`
      : "Busca paginas y productos en Sugarbay.",
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = pickQuery(params.q);
  const results = await searchHeaderContent(query, { limit: 24 });

  const totalResults = results.products.length + results.pages.length;

  return (
    <PageShell
      eyebrow="Busqueda"
      title="Resultados"
      description={
        query
          ? `Mostrando coincidencias para "${query}".`
          : "Busca paginas y productos desde el header."
      }
    >
      {!query ? (
        <EmptyState
          title="Escribe algo para buscar"
          description="Usa el buscador para encontrar paginas o productos."
        />
      ) : totalResults === 0 ? (
        <EmptyState
          title="No encontramos resultados"
          description="Prueba con otra palabra clave o explora las secciones principales."
        />
      ) : (
        <div className="space-y-6">
          {results.pages.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-4xl tracking-wide text-zinc-900">Paginas</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.pages.map((page) => (
                  <Link
                    key={page.id}
                    href={page.href}
                    className="sb-panel rounded-2xl p-4 hover:border-emerald-300"
                  >
                    <p className="text-base font-bold text-zinc-900">{page.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{page.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {results.products.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-4xl tracking-wide text-zinc-900">Productos</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/${product.slug}`}
                    className="sb-panel rounded-2xl p-4 hover:border-emerald-300"
                  >
                    <p className="text-base font-bold text-zinc-900">{product.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatCurrency(product.basePrice, product.currency)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
