import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import VideoCollectionViewer from "@/components/media/video-collection-viewer";
import EmptyState from "@/components/ui/empty-state";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import { getVideoDetailBySlug } from "@/lib/repositories/media";

type VideoDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    video?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: VideoDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    return {
      title: "Videos",
      description: "Coleccion de videos oficiales de Sugarbay.",
    };
  }

  return {
    title: `Videos: ${detail.title}`,
    description:
      detail.description ?? "Coleccion de videos oficiales de Sugarbay.",
  };
}

export default async function MediaVideoDetailPage({
  params,
  searchParams,
}: VideoDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  const detailDescription =
    detail.description ?? "Coleccion de videos oficiales de Sugarbay.";
  const selectedVideoSlugCandidate = Array.isArray(resolvedSearchParams.video)
    ? resolvedSearchParams.video[0]
    : resolvedSearchParams.video;
  const selectedVideoSlug =
    typeof selectedVideoSlugCandidate === "string" &&
      selectedVideoSlugCandidate.trim().length > 0
      ? selectedVideoSlugCandidate.trim()
      : undefined;

  return (
    <PageShell
      eyebrow="Media / Videos"
      title={detail.title}
      description={detailDescription}
    >
      <div className="flex flex-wrap gap-2">
        <Link href="/media/videos" className="retro-pixel-back-link">
          <span aria-hidden="true" className="retro-pixel-back-arrow">
            {"<"}
          </span>
          <span>Volver a videos</span>
        </Link>
      </div>

      {detail.videos.length > 0 ? (
        <VideoCollectionViewer
          key={`${detail.id}-${selectedVideoSlug ?? "default"}`}
          videos={detail.videos}
          selectedVideoSlug={selectedVideoSlug}
        />
      ) : (
        <EmptyState
          title="Esta coleccion no tiene videos publicados"
          description="Publica videos en esta coleccion para mostrar su detalle."
        />
      )}

      <IconNavigationLink href="/media/videos" label="Videos" />
    </PageShell>
  );
}
