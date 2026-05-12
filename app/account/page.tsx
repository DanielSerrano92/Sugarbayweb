import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/ui/page-shell";
import { getCurrentUser, requireSession } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Gestiona tus datos de perfil, carrito y accesos rapidos.",
};

const ACCOUNT_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/mi-cuenta.png?tr=w-2400,h-760,cm-extract,fo-top";

export default async function AccountPage() {
  await requireSession("/account");
  const user = await getCurrentUser();

  return (
    <PageShell
      eyebrow="Mi cuenta"
      title={`Hola, ${user?.firstName ?? "Fan"}`}
      description="Revisa tus datos de perfil y continua tu experiencia Sugarbay."
      headerImageSrc={ACCOUNT_PAGE_HEADER_IMAGE_SRC}
    >
      <section className="grid items-start gap-4 md:grid-cols-2">
        <article className="retro-concert-card h-full min-h-0 overflow-hidden">
          <div className="retro-concert-header">Perfil</div>
          <div className="retro-concert-body">
            <div className="retro-concert-title-block">
              <h2 className="retro-concert-title">Datos de tu cuenta</h2>
            </div>
            <dl className="retro-concert-meta">
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Nombre</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user ? `${user.firstName} ${user.lastName}` : "-"}
                </dd>
              </div>
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Usuario</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user?.username ?? "-"}
                </dd>
              </div>
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Email</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user?.email ?? "-"}
                </dd>
              </div>
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Pais</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user?.country ?? "-"}
                </dd>
              </div>
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Nacimiento</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user ? formatDate(user.birthDate) : "-"}
                </dd>
              </div>
              <div className="retro-concert-meta-item">
                <dt className="retro-concert-meta-label">Miembro desde</dt>
                <dd className="font-retro-ui break-words text-sm font-bold text-[#171717]">
                  {user ? formatDate(user.createdAt) : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </article>

        <article className="retro-concert-card h-full min-h-0 overflow-hidden">
          <div className="retro-concert-header">Panel rapido</div>
          <div className="retro-concert-body">
            <div className="retro-concert-title-block">
              <h2 className="retro-concert-title">Acciones rapidas</h2>
            </div>
            <div className="retro-concert-copy">
              <p className="retro-concert-description">
                Puedes continuar tu compra o explorar la tienda oficial.
              </p>
            </div>
            <div className="retro-card-actions retro-card-actions-upcoming">
              <Link href="/carrito" className="retro-card-action">
                Ir al carrito
              </Link>
              <Link href="/store" className="retro-card-action">
                Ver tienda
              </Link>
            </div>
          </div>
        </article>
      </section>
    </PageShell>
  );
}
