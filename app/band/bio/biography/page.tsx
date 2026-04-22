import type { Metadata } from "next";
import Link from "next/link";

import BiographySections from "@/components/band/biography-sections";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import { getBandBiographySections } from "@/lib/repositories/band";

export const metadata: Metadata = {
  title: "Biografia",
  description: "Biografia por secciones de la banda Sugarbay.",
};

export default async function BandBiographyPage() {
  const sections = await getBandBiographySections();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Band / Bio"
        title="Biografia"
        description="Recorrido por las etapas clave de Sugarbay, con indice lateral y anclas."
      />

      <Link
        href="/band/bio"
        className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
      >
        Volver a Bio
      </Link>

      {sections.length === 0 ? (
        <EmptyState
          title="No hay secciones publicadas"
          description="Publica secciones de biografia para mostrarlas en esta vista."
        />
      ) : (
        <BiographySections sections={sections} />
      )}
    </div>
  );
}

