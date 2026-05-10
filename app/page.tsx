import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/shop/product-card";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { TICKETMASTER_SUGARBAY_SEARCH_URL } from "@/lib/concerts/ticketmaster";
import { getHomeSnapshot } from "@/lib/repositories/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Web oficial de Sugarbay con conciertos, noticias, musica y tienda oficial.",
};

export default async function HomePage() {
  const { upcomingConcerts, news, featuredProducts } = await getHomeSnapshot();

  return (
    <PageShell
      eyebrow="Web oficial"
      title="Sugarbay en directo, en streaming y en tu armario"
      description="Bienvenido al nuevo espacio de Sugarbay. Descubre conciertos, escucha la msica ms reciente y visita la tienda oficial con drops exclusivos."
      actions={
        <>
          <Link
            href="/concerts/upcoming"
            className="sb-btn-primary px-4 py-2.5 text-sm font-bold"
          >
            Ver Proximos conciertos
          </Link>
          <Link
            href="/store"
            className="sb-btn-secondary px-4 py-2.5 text-sm font-semibold text-zinc-200"
          >
            Ir a la tienda
          </Link>
        </>
      }
      contentClassName="space-y-8"
    >
          <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-4xl tracking-wide text-zinc-900">
              Proximos Shows
            </h2>
            <Link href="/concerts/upcoming" className="text-sm font-semibold text-emerald-700">
              Ver todos
            </Link>
          </div>
          {upcomingConcerts.length === 0 ? (
            <EmptyState
              title="Aun no hay conciertos publicados"
              description="Estamos cerrando nuevas fechas. Vuelve pronto para ver el calendario."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {upcomingConcerts.map((concert) => (
                <article
                  key={concert.id}
                  className="sb-panel rounded-2xl p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {formatDate(concert.startsAt)}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{concert.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {concert.venueName} - {concert.city}
                  </p>
                  {concert.ticketUrl ? (
                    <a
                      href={TICKETMASTER_SUGARBAY_SEARCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sb-btn-secondary mt-4 inline-block px-3 py-2 text-sm font-semibold text-zinc-200"
                    >
                      Entradas
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          </section>

          <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-4xl tracking-wide text-zinc-900">
              Tienda Oficial
            </h2>
            <Link href="/store" className="text-sm font-semibold text-emerald-700">
              Ver catalogo
            </Link>
          </div>
          {featuredProducts.length === 0 ? (
            <EmptyState
              title="Sin productos por ahora"
              description="Estamos preparando nueva merch para la proxima gira."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          </section>

          <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-4xl tracking-wide text-zinc-900">
              ltimas Noticias
            </h2>
            <Link href="/band/news" className="text-sm font-semibold text-emerald-700">
              Ir a banda
            </Link>
          </div>
          {news.length === 0 ? (
            <EmptyState
              title="Sin noticias publicadas"
              description="Cuando haya novedades oficiales de Sugarbay apareceran aqui."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {news.map((article) => (
                <article
                  key={article.id}
                  className="sb-panel rounded-2xl p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {article.publishedAt
                      ? formatDate(article.publishedAt)
                      : formatDate(article.createdAt)}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-zinc-900">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                    {article.summary ?? article.content}
                  </p>
                </article>
              ))}
            </div>
          )}
          </section>
    </PageShell>
  );
}





