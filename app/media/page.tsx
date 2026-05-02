import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import { getMediaOverviewStats } from "@/lib/repositories/media";

export const metadata: Metadata = {
  title: "Media",
  description: "Centro multimedia de Sugarbay: fotos y videos oficiales.",
};

export default async function MediaPage() {
  const stats = await getMediaOverviewStats();

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Media"
          title="Fotos y videos"
          description="Explora albumes fotograficos y colecciones de video de Sugarbay con filtros avanzados."
        />
      )}
    >
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/media/photos"
          className="sb-panel rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Fotos</h2>
          <p className="mt-2 text-sm text-zinc-700">
            {stats.photoAlbums} albumes y {stats.photoItems} fotos publicadas.
          </p>
        </Link>

        <Link
          href="/media/videos"
          className="sb-panel rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Videos</h2>
          <p className="mt-2 text-sm text-zinc-700">
            {stats.videoCollections} colecciones y {stats.videoItems} videos publicados.
          </p>
        </Link>
      </section>
    </PageShell>
  );
}

