import type { Metadata } from "next";

import BandBioModals from "@/components/band/band-bio-modals";
import IconNavigationLink from "@/components/ui/icon-navigation-link";
import PageShell from "@/components/ui/page-shell";
import { buildBandBioBreadcrumb } from "@/lib/navigation/breadcrumbs";

const BIO_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/bio.png?tr=w-2400,h-760,cm-extract,fo-top";

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
      breadcrumbItems={buildBandBioBreadcrumb()}
      headerImageSrc={BIO_PAGE_HEADER_IMAGE_SRC}
      contentClassName="space-y-6 pt-0"
    >
      <BandBioModals />
      <IconNavigationLink href="/band/news" label="Noticias" />
    </PageShell>
  );
}

