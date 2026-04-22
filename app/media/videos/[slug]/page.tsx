import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import VideoCollectionViewer from "@/components/media/video-collection-viewer";
import PageHero from "@/components/ui/page-hero";
import { getVideoDetailBySlug } from "@/lib/repositories/media";
import { formatDate } from "@/lib/utils";

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
    title: `Video: ${detail.title}`,
    description:
      detail.description ?? "Detalle de coleccion o video oficial de Sugarbay.",
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default async function MediaVideoDetailPage({ params }: VideoDetailPageProps) {
  const { slug } = await params;
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  if (detail.kind === "collection") {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Media / Videos"
          title={detail.title}
          description={detail.description ?? "Coleccion de videos oficiales de Sugarbay."}
        />

        <div className="flex flex-wrap gap-2">
          <Link
            href="/media/videos"
            className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
          >
            Volver a videos
          </Link>
          <p className="sb-panel-soft rounded-xl px-3 py-2 text-sm text-zinc-600">
            Publicado: {formatDate(detail.dateIso)}
          </p>
        </div>

        <VideoCollectionViewer videos={detail.videos} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Media / Videos"
        title={detail.title}
        description={detail.description ?? "Video oficial de Sugarbay."}
      />

        <div className="flex flex-wrap gap-2">
          <Link
            href="/media/videos"
            className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
          >
            Volver a videos
          </Link>
          {detail.collection ? (
            <Link
              href={`/media/videos/${detail.collection.slug}`}
              className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
            >
              Ver coleccion: {detail.collection.title}
            </Link>
          ) : null}
        </div>

      <article className="sb-panel space-y-4 rounded-2xl p-4">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-black pt-[56.25%]">
          <iframe
            src={detail.video.embedUrl}
            title={detail.video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="space-y-1 text-sm text-zinc-700">
          <p>Fecha: {formatDate(detail.dateIso)}</p>
          <p>Duracion: {formatDuration(detail.video.durationSeconds)}</p>
          <p>Plataforma: {detail.video.platform}</p>
        </div>
      </article>
    </div>
  );
}
