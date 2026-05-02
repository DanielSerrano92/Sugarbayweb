import type { Metadata } from "next";

import BandBioModals from "@/components/band/band-bio-modals";
import PageShell from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "Banda Bio",
  description: "Historia de Sugarbay, biografia y miembros.",
};

export default function BandBioPage() {
  return (
    <PageShell
      eyebrow="Band"
      title="Bio de Sugarbay"
      description="Explora la historia de la banda y conoce a sus miembros y colaboradores."
    >
      <BandBioModals />
    </PageShell>
  );
}

