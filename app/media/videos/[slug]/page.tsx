import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import VideoCollectionViewer from "@/components/media/video-collection-viewer";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
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
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "No disponible";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function RetroCalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M3 2H4V4H6V2H10V4H12V2H13V4H14V14H2V4H3V2ZM3 5V13H13V5H3ZM4 7H6V9H4V7ZM7 7H9V9H7V7ZM10 7H12V9H10V7ZM4 10H6V12H4V10ZM7 10H9V12H7V10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RetroVideoIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M2 3H11V13H2V3ZM12 6L15 4V12L12 10V6ZM4 5V11H9V5H4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function MediaVideoDetailPage({ params }: VideoDetailPageProps) {
  const { slug } = await params;
  const detail = await getVideoDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  if (detail.kind === "collection") {
    return (
      <PageShell
        eyebrow="Media / Videos"
        title={detail.title}
        description={detail.description ?? "Coleccion de videos oficiales de Sugarbay."}
      >
        <VideoCollectionViewer videos={detail.videos} />
        <IconNavigationLink href="/media/videos" label="Videos" />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Media / Videos"
      title={detail.title}
      description={detail.description ?? "Video oficial de Sugarbay."}
    >

      <div className="retro-video-detail-toolbar">
        {detail.collection ? (
          <Link
            href={`/media/videos/${detail.collection.slug}`}
            className="retro-card-action retro-video-detail-action"
          >
            Ver coleccion: {detail.collection.title}
          </Link>
        ) : null}
      </div>

      <article className="retro-concert-card w-full overflow-hidden">
        <div className="retro-concert-header">Video unico</div>
        <div className="retro-concert-body">
          <div className="retro-concert-meta-item !p-0 overflow-hidden">
            <div className="relative bg-black pt-[56.25%]">
              <iframe
                src={detail.video.embedUrl}
                title={detail.video.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="retro-concert-title-block">
            <h2 className="retro-concert-title">{detail.video.title}</h2>
          </div>

          <div className="retro-concert-meta">
            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Fecha</p>
              <div className="retro-concert-row">
                <RetroCalendarIcon />
                <span>{formatDate(detail.dateIso)}</span>
              </div>
            </div>

            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Duracion</p>
              <div className="retro-concert-row">
                <RetroVideoIcon />
                <span>{formatDuration(detail.video.durationSeconds)}</span>
              </div>
            </div>

            <div className="retro-concert-meta-item">
              <p className="retro-concert-meta-label">Plataforma</p>
              <div className="retro-concert-row">
                <RetroVideoIcon />
                <span>{detail.video.platform}</span>
              </div>
            </div>
          </div>

          {detail.description ? (
            <div className="retro-concert-copy">
              <p className="retro-concert-description">{detail.description}</p>
            </div>
          ) : null}
        </div>
      </article>
      <IconNavigationLink href="/media/videos" label="Videos" />
    </PageShell>
  );
}
