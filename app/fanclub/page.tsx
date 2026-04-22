import type { Metadata } from "next";
import PageHero from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Fanclub",
  description: "Placeholder del fanclub oficial de Sugarbay.",
};

export default function FanclubPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Fanclub"
        title="Sugarbay Fanclub"
        description="Estamos preparando una experiencia exclusiva para la comunidad: preventas, contenido indito, sorteos y encuentros."
      />

      <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100 p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(127,82,255,0.3),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,141,75,0.25),transparent_45%)]" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <h2 className="font-display text-5xl leading-none tracking-wide text-zinc-900">
            proximamente
          </h2>
          <p className="text-sm text-zinc-700 lg:text-base">
            El Fanclub esta en fase de diseno. La arquitectura queda preparada para
            membresas por niveles, perks por antigedad y acceso prioritario a
            experiencias especiales.
          </p>
          <div className="sb-panel-soft rounded-2xl p-4">
            <p className="text-sm font-semibold text-zinc-900">
              Quieres enterarte cuando abramos?
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              Mantente atento a nuestras redes y noticias dentro de la web.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}




