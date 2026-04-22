import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Banda Bio",
  description: "Historia de Sugarbay, biografia y miembros.",
};

export default function BandBioPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Band"
        title="Bio de Sugarbay"
        description="Explora la historia de la banda y conoce a sus miembros y colaboradores."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/band/bio/biography"
          className="sb-panel rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Biografia</h2>
          <p className="mt-3 text-sm text-zinc-700">
            Contenido por secciones con indice lateral y navegacion por anclas.
          </p>
        </Link>

        <Link
          href="/band/bio/members"
          className="sb-panel rounded-2xl p-6 transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Miembros</h2>
          <p className="mt-3 text-sm text-zinc-700">
            Diferenciacion entre banda principal y colaboradores, con detalle de cada persona.
          </p>
        </Link>
      </section>
    </div>
  );
}

