import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PhotoGalleryClient from "@/components/media/photo-gallery-client";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import { getPhotoAlbumDetailBySlug } from "@/lib/repositories/media";
import { formatDate } from "@/lib/utils";

type PhotoAlbumDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PhotoAlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPhotoAlbumDetailBySlug(slug);

  if (!album) {
    return {
      title: "Album de fotos",
      description: "Galeria de fotos de Sugarbay.",
    };
  }

  return {
    title: `Fotos: ${album.title}`,
    description:
      album.description ?? "Detalle de album fotografico oficial de Sugarbay.",
  };
}

export default async function PhotoAlbumDetailPage({ params }: PhotoAlbumDetailPageProps) {
  const { slug } = await params;
  const album = await getPhotoAlbumDetailBySlug(slug);

  if (!album) {
    notFound();
  }

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Media / Fotos"
          title={album.title}
          description={album.description ?? "Detalle completo del album fotografico."}
        />
      )}
    >

      <div className="flex flex-wrap gap-2">
        <Link
          href="/media/photos"
          className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
        >
          Volver a albumes
        </Link>
        {album.eventDateIso ? (
          <p className="sb-panel-soft rounded-xl px-3 py-2 text-sm text-zinc-600">
            Fecha del evento: {formatDate(album.eventDateIso)}
          </p>
        ) : null}
      </div>

      {album.photos.length === 0 ? (
        <EmptyState
          title="Este album no tiene fotos publicadas"
          description="Sube fotos al album para activar la galeria."
        />
      ) : (
        <PhotoGalleryClient photos={album.photos} />
      )}
    </PageShell>
  );
}
