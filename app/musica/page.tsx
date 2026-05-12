import type { Metadata } from "next";
import MusicCatalogClient from "@/components/music/music-catalog-client";
import MusicFiltersPanel from "@/components/music/music-filters";
import MusicPagination from "@/components/music/music-pagination";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import type { MusicQueryParams } from "@/lib/music/types";
import { getMusicCatalog } from "@/lib/repositories/music";

const MUSIC_PAGE_HEADER_IMAGE_ALBUMS_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/albumes.png?tr=w-2400,h-760,cm-extract,fo-top";
const MUSIC_PAGE_HEADER_IMAGE_SONGS_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/canciones.png?tr=w-2400,h-760,cm-extract,fo-top";

export const metadata: Metadata = {
  title: "Musica",
  description: "Catalogo mixto de canciones y albumes de Sugarbay.",
};

type MusicaPageProps = {
  searchParams: Promise<MusicQueryParams>;
};

export default async function MusicaPage({ searchParams }: MusicaPageProps) {
  const params = await searchParams;
  const catalog = await getMusicCatalog(params);
  const currentType = catalog.filters.type;
  const headerImageSrc =
    currentType === "song"
      ? MUSIC_PAGE_HEADER_IMAGE_SONGS_SRC
      : MUSIC_PAGE_HEADER_IMAGE_ALBUMS_SRC;

  const hasDirectionalSwitch = currentType === "song" || currentType === "album";
  const nextType = currentType === "song" ? "album" : "song";
  const nextLabel = currentType === "song" ? "Albumes" : "Canciones";

  const switchParams = new URLSearchParams();
  switchParams.set("type", nextType);
  switchParams.set("sort", catalog.filters.sort);
  if (catalog.filters.from) switchParams.set("from", catalog.filters.from);
  if (catalog.filters.to) switchParams.set("to", catalog.filters.to);
  const switchHref = `/musica?${switchParams.toString()}`;

  return (
    <PageShell
      eyebrow="Musica"
      title="Canciones y albumes"
      description="Catalogo mixto con filtros por fecha, tipo y orden. Abre cualquier tarjeta para ver su detalle completo."
      headerImageSrc={headerImageSrc}
    >
      <section>
        <div className="mb-5 flex justify-end">
          <div className="concert-top-controls concert-top-controls-right">
            <MusicFiltersPanel basePath="/musica" filters={catalog.filters} />
            <MusicPagination
              basePath="/musica"
              filters={catalog.filters}
              totalPages={catalog.totalPages}
            />
          </div>
        </div>

        {catalog.totalPages > 1 ? (
          <p className="mb-4 text-sm text-zinc-600">
            Mostrando {catalog.items.length} de {catalog.totalItems} elementos.
          </p>
        ) : null}

        {catalog.items.length === 0 ? (
          <EmptyState
            title="No hay resultados para estos filtros"
            description="Prueba otro rango de fechas, tipo o criterio de orden."
          />
        ) : (
          <MusicCatalogClient
            items={catalog.items}
            songsBySlug={catalog.songsBySlug}
            albumsBySlug={catalog.albumsBySlug}
          />
        )}
      </section>

      {hasDirectionalSwitch ? (
        <IconNavigationLink href={switchHref} label={nextLabel} />
      ) : null}
    </PageShell>
  );
}

