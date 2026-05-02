import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/ui/page-hero";
import PageShell from "@/components/ui/page-shell";
import { getCurrentUser, requireSession } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Gestiona tus datos de perfil, carrito y accesos rapidos.",
};

export default async function AccountPage() {
  await requireSession("/account");
  const user = await getCurrentUser();

  return (
    <PageShell
      hero={(
        <PageHero
          eyebrow="Mi cuenta"
          title={`Hola, ${user?.firstName ?? "Fan"}`}
          description="Revisa tus datos de perfil y continua tu experiencia Sugarbay."
        />
      )}
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="sb-panel rounded-2xl p-5">
          <h2 className="text-lg font-bold text-zinc-900">Perfil</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Nombre</dt>
              <dd className="font-medium text-zinc-900">
                {user ? `${user.firstName} ${user.lastName}` : "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Usuario</dt>
              <dd className="font-medium text-zinc-900">
                {user?.username ?? "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-900">{user?.email ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Pais</dt>
              <dd className="font-medium text-zinc-900">{user?.country ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Nacimiento</dt>
              <dd className="font-medium text-zinc-900">
                {user ? formatDate(user.birthDate) : "-"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Miembro desde</dt>
              <dd className="font-medium text-zinc-900">
                {user ? formatDate(user.createdAt) : "-"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="sb-panel rounded-2xl p-5">
          <h2 className="text-lg font-bold text-zinc-900">Acciones rapidas</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Puedes continuar tu compra o explorar la tienda oficial.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/carrito"
              className="sb-btn-primary px-3 py-2 text-sm font-semibold"
            >
              Ir al carrito
            </Link>
            <Link
              href="/store"
              className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
            >
              Ver tienda
            </Link>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
