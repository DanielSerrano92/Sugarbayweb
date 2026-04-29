"use client";

import { useEffect, useMemo, useState } from "react";

import type { ConcertCardView, ConcertPeriod } from "@/lib/concerts/types";
import { formatDate } from "@/lib/utils";

type ConcertCardsClientProps = {
  period: ConcertPeriod;
  concerts: ConcertCardView[];
};

function RetroCalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path
        d="M3 2H4V4H6V2H10V4H12V2H13V4H14V14H2V4H3V2ZM3 5V13H13V5H3ZM4 7H6V9H4V7ZM7 7H9V9H7V7ZM10 7H12V9H10V7ZM4 10H6V12H4V10ZM7 10H9V12H7V10Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RetroHouseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="retro-concert-icon" aria-hidden="true">
      <path d="M8 1L15 7V8H13V15H9V11H7V15H3V8H1V7L8 1Z" fill="currentColor" />
    </svg>
  );
}

function ExternalLink({
  href,
  label,
  className = "win-button",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}

export default function ConcertCardsClient({
  period,
  concerts,
}: ConcertCardsClientProps) {
  const [selectedConcertId, setSelectedConcertId] = useState<string | null>(null);

  const selectedConcert = useMemo(
    () => concerts.find((concert) => concert.id === selectedConcertId) ?? null,
    [concerts, selectedConcertId],
  );

  useEffect(() => {
    if (!selectedConcert) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedConcertId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedConcert]);

  return (
    <>
      <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3">
        {concerts.map((concert) => (
          <article
            key={concert.id}
            className="retro-concert-card w-full max-w-[280px] overflow-hidden"
          >
            <div className="retro-concert-header">
              {concert.city}, {concert.countryLabel}
            </div>

            <div className="retro-concert-body">
              <h2 className="retro-concert-title">{concert.title}</h2>

              <div className="retro-concert-row">
                <RetroCalendarIcon />
                <span>
                  {formatDate(concert.startsAtIso, "es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              <a
                href={concert.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="retro-concert-row retro-concert-link"
              >
                <RetroHouseIcon />
                <span className="retro-concert-location">{concert.locationLabel}</span>
              </a>

              <p className="retro-concert-description">{concert.description}</p>

              <div className="retro-card-actions">
                <button
                  type="button"
                  onClick={() => setSelectedConcertId(concert.id)}
                  className="retro-card-action"
                >
                  {concert.infoButtonLabel}
                </button>

                {period === "upcoming" ? (
                  concert.actionUrl ? (
                    <a
                      href={concert.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="retro-card-action"
                    >
                      {concert.actionLabel}
                    </a>
                  ) : (
                    <span className="retro-card-action opacity-60">
                      {concert.actionLabel}
                    </span>
                  )
                ) : (
                  <>
                    {concert.pastDetails?.photos[0] ? (
                      <ExternalLink
                        href={concert.pastDetails.photos[0].url}
                        label="Fotos"
                        className="retro-card-action"
                      />
                    ) : (
                      <span className="retro-card-action opacity-60">
                        Fotos
                      </span>
                    )}
                    {concert.pastDetails?.videos[0] ? (
                      <ExternalLink
                        href={concert.pastDetails.videos[0].url}
                        label="Videos"
                        className="retro-card-action"
                      />
                    ) : (
                      <span className="retro-card-action opacity-60">
                        Videos
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedConcert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar modal de informacion"
            onClick={() => setSelectedConcertId(null)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="concert-modal-title"
            className="win-window relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-0"
          >
            <div className="win-titlebar flex items-center justify-between gap-4">
              <span>Detalle concierto</span>
              <button
                type="button"
                onClick={() => setSelectedConcertId(null)}
                className="win-button text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 p-5 text-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black">
                  {selectedConcert.countryLabel} - {selectedConcert.city}
                </p>
                <h3 id="concert-modal-title" className="mt-2 text-2xl font-black text-black">
                  {selectedConcert.title}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-sm text-black">{selectedConcert.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-black">
                Tipos de experiencia / entradas
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedConcert.experiences.map((experience) => (
                  <span
                    key={experience}
                    className="win-button px-2 py-1 text-xs"
                  >
                    {experience}
                  </span>
                ))}
              </div>
            </div><section className="win-window mt-5 p-4">

            
              <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-black">
                Lugar del evento
              </h4>

              {selectedConcert.venueDetails.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedConcert.venueDetails.photoUrl}
                  alt={selectedConcert.venueDetails.name}
                  className="mt-3 h-48 w-full object-cover"
                  loading="lazy"
                />
              ) : null}

              <p className="mt-3 text-sm font-semibold text-black">
                {selectedConcert.venueDetails.name}
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {selectedConcert.venueDetails.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <ExternalLink href={selectedConcert.venueDetails.googleMapsUrl} label="Google Maps" />
                {selectedConcert.venueDetails.websiteUrl ? (
                  <ExternalLink href={selectedConcert.venueDetails.websiteUrl} label="Web oficial" />
                ) : null}
                {selectedConcert.venueDetails.contacts.map((contact) => (
                  <ExternalLink key={contact.url} href={contact.url} label={contact.label} />
                ))}
              </div>
            </section>

            {period === "past" && selectedConcert.pastDetails ? (
              <section className="win-window mt-5 p-4">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-black">
                    Cronica
                  </h4>
                  <p className="mt-2 text-sm text-black">
                    {selectedConcert.pastDetails.chronicle}
                  </p>
                </div>

                {selectedConcert.pastDetails.tracklist.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-black">
                      Tracklist
                    </h4>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-black">
                      {selectedConcert.pastDetails.tracklist.map((track) => (
                        <li key={track}>{track}</li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {selectedConcert.pastDetails.links.map((link) => (
                    <ExternalLink key={link.url} href={link.url} label={link.label} />
                  ))}
                </div>
              </section>
            ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
