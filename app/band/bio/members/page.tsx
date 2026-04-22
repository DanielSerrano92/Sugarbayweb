import type { Metadata } from "next";
import Link from "next/link";

import MembersDirectoryClient from "@/components/band/members-directory-client";
import EmptyState from "@/components/ui/empty-state";
import PageHero from "@/components/ui/page-hero";
import { getBandMembersDirectory } from "@/lib/repositories/band";

export const metadata: Metadata = {
  title: "Miembros",
  description: "Perfiles de miembros y colaboradores de Sugarbay.",
};

export default async function BandMembersPage() {
  const directory = await getBandMembersDirectory();
  const totalMembers = directory.bandMembers.length + directory.collaborators.length;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Band / Bio"
        title="Miembros y colaboradores"
        description="Listado del equipo de Sugarbay con hover visual y detalle individual."
      />

      <Link
        href="/band/bio"
        className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
      >
        Volver a Bio
      </Link>

      {totalMembers === 0 ? (
        <EmptyState
          title="No hay perfiles publicados"
          description="Activa miembros en base de datos para mostrarlos en esta seccion."
        />
      ) : (
        <MembersDirectoryClient
          bandMembers={directory.bandMembers}
          collaborators={directory.collaborators}
        />
      )}
    </div>
  );
}

