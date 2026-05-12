"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";

import AppModal from "@/components/ui/app-modal";

const BIOGRAPHY_DEMO = `Surgida entre luces de neon, riffs funk y una estetica retrofuturista, Sugarbay mezcla energia de directo, groove ochentero y una identidad visual inspirada en el synthwave.

La banda construye una experiencia que combina musica, narrativa visual y una comunidad fanclub activa.

Cada lanzamiento busca sonar a carretera nocturna, pantallas de tubo y escenarios llenos de color, manteniendo siempre una conexion muy cercana con su publico.`;

const MAIN_MEMBERS = ["Johnny Funk", "Mitch Bucano", "Wazoo"] as const;
const COLLABORATORS = ["Toxos da Rue", "Borja", "Martin", "Garrido"] as const;

type BandBioModalKey = "biography" | "members" | null;

export default function BandBioModals() {
  const [openModal, setOpenModal] = useState<BandBioModalKey>(null);
  const biographyParagraphs = BIOGRAPHY_DEMO.split("\n\n");

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>, target: BandBioModalKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpenModal(target);
    }
  }

  return (
    <>
      <section className="retro-news-concert-grid">
        <article
          role="button"
          tabIndex={0}
          onClick={() => setOpenModal("biography")}
          onKeyDown={(event) => handleCardKeyDown(event, "biography")}
          className="retro-concert-card retro-news-concert-card retro-news-featured-card retro-bio-modal-card cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1538]"
          aria-label="Abrir biografia"
        >
          <div className="retro-concert-header retro-news-header">Biografia</div>
          <div className="retro-concert-body">
            <div className="retro-concert-title-block">
              <h2 className="retro-concert-title">Historia de Sugarbay</h2>
            </div>

            <div className="retro-concert-meta">
              <div className="retro-concert-meta-item">
                <p className="retro-concert-meta-label">Seccion</p>
                <div className="retro-concert-row">
                  <span>Trayectoria oficial</span>
                </div>
              </div>
            </div>

            <div className="retro-concert-copy">
              <p className="retro-concert-description">
                Abre la historia de Sugarbay en un modal, con lectura comoda y cierre rapido.
              </p>
            </div>

            <div className="retro-card-actions retro-card-actions-upcoming">
              <span className="retro-card-action">Abrir biografia</span>
            </div>
          </div>
        </article>

        <article
          role="button"
          tabIndex={0}
          onClick={() => setOpenModal("members")}
          onKeyDown={(event) => handleCardKeyDown(event, "members")}
          className="retro-concert-card retro-news-concert-card retro-news-featured-card retro-bio-modal-card cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1538]"
          aria-label="Abrir miembros"
        >
          <div className="retro-concert-header retro-news-header">Miembros</div>
          <div className="retro-concert-body">
            <div className="retro-concert-title-block">
              <h2 className="retro-concert-title">Equipo y colaboradores</h2>
            </div>

            <div className="retro-concert-meta">
              <div className="retro-concert-meta-item">
                <p className="retro-concert-meta-label">Seccion</p>
                <div className="retro-concert-row">
                  <span>Integrantes actuales</span>
                </div>
              </div>
            </div>

            <div className="retro-concert-copy">
              <p className="retro-concert-description">
                Consulta miembros principales y colaboradores sin salir de esta pagina.
              </p>
            </div>

            <div className="retro-card-actions retro-card-actions-upcoming">
              <span className="retro-card-action">Abrir miembros</span>
            </div>
          </div>
        </article>
      </section>

      {openModal === "biography" ? (
        <AppModal
          title="Biografia"
          onClose={() => setOpenModal(null)}
          maxWidth="760px"
          overlayOpacity={0.62}
          variant="win95"
          bodyClassName="retro-bio-read-modal-body p-3 sm:p-4"
          heightMode="content"
        >
          <div className="retro-bio-read-modal-shell">
            <section className="retro-bio-read-modal-hero">
              <p className="retro-bio-read-modal-kicker">Seccion oficial</p>
              <h3 className="retro-bio-read-modal-title">Historia de Sugarbay</h3>
              <p className="retro-bio-read-modal-subline">
                Trayectoria artistica, identidad visual y evolucion sonora del proyecto.
              </p>
            </section>

            <section className="retro-bio-read-modal-content" aria-label="Texto de biografia">
              {biographyParagraphs.map((paragraph, index) => (
                <article key={`bio-paragraph-${index + 1}`} className="retro-bio-read-modal-block">
                  <p className="retro-bio-read-modal-label">{`Bloque ${String(index + 1).padStart(2, "0")}`}</p>
                  <p className="retro-bio-read-modal-text">{paragraph}</p>
                </article>
              ))}
            </section>
          </div>
        </AppModal>
      ) : null}

      {openModal === "members" ? (
        <AppModal
          title="Miembros"
          onClose={() => setOpenModal(null)}
          maxWidth="760px"
          overlayOpacity={0.62}
          variant="win95"
          bodyClassName="retro-bio-members-modal-body p-3 sm:p-4"
          heightMode="content"
        >
          <div className="retro-bio-members-modal-shell">
            <section className="retro-bio-members-modal-hero">
              <p className="retro-bio-members-modal-kicker">Seccion oficial</p>
              <h3 className="retro-bio-members-modal-title">Equipo y colaboradores</h3>
              <p className="retro-bio-members-modal-subline">
                Consulta miembros principales y colaboradores activos de Sugarbay.
              </p>
            </section>

            <section className="retro-bio-members-modal-content" aria-label="Listado de miembros">
              <article className="retro-bio-members-modal-block">
                <h4 className="retro-bio-members-modal-label">Miembros principales</h4>
                <ul className="retro-bio-members-modal-list">
                  {MAIN_MEMBERS.map((member) => (
                    <li key={member} className="retro-bio-members-modal-item">
                      {member}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="retro-bio-members-modal-block">
                <h4 className="retro-bio-members-modal-label">Colaboradores</h4>
                <ul className="retro-bio-members-modal-list">
                  {COLLABORATORS.map((member) => (
                    <li key={member} className="retro-bio-members-modal-item">
                      {member}
                    </li>
                  ))}
                </ul>
              </article>
            </section>
          </div>
        </AppModal>
      ) : null}
    </>
  );
}
