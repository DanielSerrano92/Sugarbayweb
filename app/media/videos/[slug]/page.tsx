import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import VideoCollectionViewer from "@/components/media/video-collection-viewer";
import EmptyState from "@/components/ui/empty-state";
import PageShell from "@/components/ui/page-shell";
import { getVideoDetailBySlug } from "@/lib/repositories/media";

type VideoDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: VideoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    return {
      title: "Video",
      description: "Detalle de video oficial de Sugarbay.",
    };
  }

  return {
    title: detail.kind === "collection" ? `Videos: ${detail.title}` : `Video: ${detail.title}`,
    description:
      detail.description ?? "Detalle de coleccion o video oficial de Sugarbay.",
  };
}

export default async function MediaVideoDetailPage({ params }: VideoDetailPageProps) {
  const { slug } = await params;
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  const detailDescription =
    detail.description ??
    (detail.kind === "collection"
      ? "Coleccion de videos oficiales de Sugarbay."
      : "Video oficial de Sugarbay.");
  const videos = detail.kind === "collection" ? detail.videos : [detail.video];

  return (
    <PageShell
      eyebrow="Media / Videos"
      title={detail.title}
      description={detailDescription}
    >
      <div className="flex flex-wrap gap-2">
        <Link
          href="/media/videos"
          className="retro-pixel-back-link"
        >
          <span aria-hidden="true" className="retro-pixel-back-arrow">
            ◀
          </span>
          <span>Volver a videos</span>
        </Link>
        {detail.kind === "single" && detail.collection ? (
          <Link
            href={`/media/videos/${detail.collection.slug}`}
            className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
          >
            Ver coleccion
          </Link>
        ) : null}
      </div>

      {detail.description ? (
        <p className="sb-panel-soft rounded-2xl px-4 py-3 text-sm leading-7 text-zinc-700">
          {detail.description}
        </p>
      ) : null}

      {videos.length > 0 ? (
        <VideoCollectionViewer videos={videos} />
      ) : (
        <EmptyState
          title="Esta coleccion no tiene videos publicados"
          description="Publica videos en esta coleccion para mostrar su detalle."
        />
      )}
    </PageShell>
  );
}
