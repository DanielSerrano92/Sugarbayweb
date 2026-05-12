import type { Metadata } from "next";

import PageShell from "@/components/ui/page-shell";

const FANCLUB_PAGE_HEADER_IMAGE_SRC =
  "https://ik.imagekit.io/gq1enkszp/fotos/fanclub.png?tr=w-2400,h-760,cm-extract,fo-top";

export const metadata: Metadata = {
  title: "Fanclub",
  description: "Comunidad oficial de Sugarbay: preventas, perks y contenido exclusivo.",
};

function RetroStarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-fanclub-icon" aria-hidden="true">
      <path d="m8 1.8 1.8 3.7 4.1.6-2.9 2.9.7 4.1L8 11.2 4.3 13.1 5 9 2.1 6.1l4.1-.6L8 1.8Z" fill="currentColor" />
    </svg>
  );
}

function RetroTicketIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-fanclub-icon" aria-hidden="true">
      <path d="M1.8 4.2h12.4v2.1a1.5 1.5 0 0 0 0 3v2.5H1.8V9.3a1.5 1.5 0 0 0 0-3V4.2Zm6.2 1.2v1.2m0 1.1v1.2m0 1.1V11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RetroGiftIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-fanclub-icon" aria-hidden="true">
      <path d="M2 6.1h12v7.7H2V6.1Zm5.3 0h1.4v7.7H7.3V6.1ZM2 3.6h12v2.5H2V3.6Zm3-.1a1.7 1.7 0 0 1 3 0 1.7 1.7 0 0 1 3 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RetroHeadsetIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-fanclub-icon" aria-hidden="true">
      <path d="M3 8a5 5 0 1 1 10 0m-9.5 0H2.4v3h1.1m9.1-3h1.1v3h-1.1M5.2 11h1.4v2H5.2v-2Zm4.2 0h1.4v2H9.4v-2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FanclubPage() {
  return (
    <PageShell
      eyebrow="Fanclub"
      title="Sugarbay Fanclub"
      description="Estamos preparando una experiencia exclusiva para la comunidad: preventas, contenido inedito, sorteos y encuentros."
      headerImageSrc={FANCLUB_PAGE_HEADER_IMAGE_SRC}
    >
      <section className="retro-fanclub-grid">
        <article className="retro-concert-card retro-fanclub-main-card overflow-hidden">
          <div className="retro-concert-header">Comunidad oficial</div>
          <div className="retro-concert-body">
            <div className="retro-concert-title-block">
              <h2 className="retro-concert-title">Lanzamiento en preparacion</h2>
            </div>

            <div className="retro-concert-meta">
              <div className="retro-concert-meta-item">
                <p className="retro-concert-meta-label">Estado</p>
                <div className="retro-concert-row">
                  <RetroStarIcon />
                  <span>Acceso inicial durante 2026</span>
                </div>
              </div>
              <div className="retro-concert-meta-item">
                <p className="retro-concert-meta-label">Objetivo</p>
                <div className="retro-concert-row">
                  <RetroHeadsetIcon />
                  <span>Centralizar perks y experiencias para fans</span>
                </div>
              </div>
            </div>

            <div className="retro-concert-copy">
              <p className="retro-concert-description">
                Estamos cerrando la estructura de membresias por niveles, acceso prioritario a
                conciertos y contenido especial para la comunidad de Sugarbay.
              </p>
            </div>

            <div className="retro-fanclub-highlights-block">
              <p className="retro-fanclub-highlights-label">Beneficios clave</p>
              <ul className="retro-fanclub-highlights" aria-label="Beneficios principales del fanclub">
                <li className="retro-fanclub-highlight">
                  <RetroTicketIcon />
                  <div className="retro-fanclub-highlight-content">
                    <p className="retro-fanclub-highlight-title">Preventas prioritarias</p>
                    <p className="retro-fanclub-highlight-copy">
                      Cupos reservados para miembros en conciertos seleccionados.
                    </p>
                  </div>
                </li>
                <li className="retro-fanclub-highlight">
                  <RetroHeadsetIcon />
                  <div className="retro-fanclub-highlight-content">
                    <p className="retro-fanclub-highlight-title">Contenido exclusivo</p>
                    <p className="retro-fanclub-highlight-copy">
                      Demos, making-of y sesiones privadas dentro de la comunidad.
                    </p>
                  </div>
                </li>
                <li className="retro-fanclub-highlight">
                  <RetroGiftIcon />
                  <div className="retro-fanclub-highlight-content">
                    <p className="retro-fanclub-highlight-title">Perks y recompensas</p>
                    <p className="retro-fanclub-highlight-copy">
                      Merch, sorteos y experiencias backstage para fans activos.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </article>
      </section>
    </PageShell>
  );
}
