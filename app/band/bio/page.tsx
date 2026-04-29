import type { Metadata } from "next";

import BandBioModals from "@/components/band/band-bio-modals";
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

      <BandBioModals />
    </div>
  );
}

