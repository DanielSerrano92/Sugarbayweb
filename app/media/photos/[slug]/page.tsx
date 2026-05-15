import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PhotoGalleryClient from "@/components/media/photo-gallery-client";
import EmptyState from "@/components/ui/empty-state";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import { buildMediaPhotosBreadcrumb } from "@/lib/navigation/breadcrumbs";
import { getPhotoAlbumDetailBySlug } from "@/lib/repositories/media";

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
      eyebrow="Media / Fotos"
      title={album.title}
      description={album.description ?? "Detalle completo del album fotografico."}
      breadcrumbItems={buildMediaPhotosBreadcrumb(album.title)}
    >
      {album.photos.length === 0 ? (
        <EmptyState
          title="Este album no tiene fotos publicadas"
          description="Sube fotos al album para activar la galeria."
        />
      ) : (
        <PhotoGalleryClient photos={album.photos} />
      )}

      <IconNavigationLink href="/media/photos" label="Fotos" />
    </PageShell>
  );
}
