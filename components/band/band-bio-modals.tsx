"use client";

import { useState } from "react";

import AppModal from "@/components/ui/app-modal";

const BIOGRAPHY_DEMO = `Surgida entre luces de neon, riffs funk y una estetica retrofuturista, Sugarbay mezcla energia de directo, groove ochentero y una identidad visual inspirada en el synthwave.

La banda construye una experiencia que combina musica, narrativa visual y una comunidad fanclub activa.

Cada lanzamiento busca sonar a carretera nocturna, pantallas de tubo y escenarios llenos de color, manteniendo siempre una conexion muy cercana con su publico.`;

const MAIN_MEMBERS = ["Johnny Funk", "Mitch Bucano", "Wazoo"] as const;
const COLLABORATORS = ["Toxos da Rue", "Borja", "Martin", "Garrido"] as const;

type BandBioModalKey = "biography" | "members" | null;

export default function BandBioModals() {
  const [openModal, setOpenModal] = useState<BandBioModalKey>(null);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpenModal("biography")}
          className="sb-panel rounded-2xl p-6 text-left transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Biografia</h2>
          <p className="mt-3 text-sm text-zinc-700">
            Abre la historia de Sugarbay en un modal, con lectura comoda y cierre rapido.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setOpenModal("members")}
          className="sb-panel rounded-2xl p-6 text-left transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Seccion</p>
          <h2 className="mt-2 text-2xl font-black text-zinc-900">Miembros</h2>
          <p className="mt-3 text-sm text-zinc-700">
            Consulta miembros principales y colaboradores sin salir de esta pagina.
          </p>
        </button>
      </section>

      {openModal === "biography" ? (
        <AppModal
          title="Biografia"
          onClose={() => setOpenModal(null)}
          maxWidth="1220px"
          overlayOpacity={0.3}
        >
          <div className="space-y-4 text-sm leading-relaxed text-zinc-700">
            {BIOGRAPHY_DEMO.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </AppModal>
      ) : null}

      {openModal === "members" ? (
        <AppModal
          title="Miembros"
          onClose={() => setOpenModal(null)}
          maxWidth="1220px"
          overlayOpacity={0.3}
        >
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-zinc-700">
                Miembros principales
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {MAIN_MEMBERS.map((member) => (
                  <article key={member} className="sb-panel-soft rounded-xl px-4 py-3">
                    <p className="text-base font-bold text-zinc-900">{member}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-zinc-700">
                Colaboradores
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {COLLABORATORS.map((member) => (
                  <article key={member} className="sb-panel-soft rounded-xl px-4 py-3">
                    <p className="text-base font-bold text-zinc-900">{member}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </AppModal>
      ) : null}
    </>
  );
}
