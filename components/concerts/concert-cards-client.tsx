"use client";

import { useMemo, useState } from "react";

import AppModal from "@/components/ui/app-modal";
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

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="retro-card-action"
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
                      <ExternalLink href={concert.pastDetails.photos[0].url} label="Fotos" />
                    ) : (
                      <span className="retro-card-action opacity-60">
                        Fotos
                      </span>
                    )}
                    {concert.pastDetails?.videos[0] ? (
                      <ExternalLink href={concert.pastDetails.videos[0].url} label="Videos" />
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
        <AppModal
          title={selectedConcert.title}
          onClose={() => setSelectedConcertId(null)}
          maxWidth="1220px"
          overlayOpacity={0.3}
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {selectedConcert.countryLabel} - {selectedConcert.city}
                </p>
                <h3 className="mt-2 text-2xl font-black text-zinc-900">
                  {selectedConcert.title}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-sm text-zinc-700">{selectedConcert.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                Tipos de experiencia / entradas
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedConcert.experiences.map((experience) => (
                  <span
                    key={experience}
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
                  >
                    {experience}
                  </span>
                ))}
              </div>
            </div>

            <section className="sb-panel-soft mt-5 rounded-2xl p-4">
              <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                Lugar del evento
              </h4>

              {selectedConcert.venueDetails.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedConcert.venueDetails.photoUrl}
                  alt={selectedConcert.venueDetails.name}
                  className="mt-3 h-48 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              ) : null}

              <p className="mt-3 text-sm font-semibold text-zinc-900">
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
              <section className="sb-panel-soft mt-5 space-y-4 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                    Cronica
                  </h4>
                  <p className="mt-2 text-sm text-zinc-700">
                    {selectedConcert.pastDetails.chronicle}
                  </p>
                </div>

                {selectedConcert.pastDetails.tracklist.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-700">
                      Tracklist
                    </h4>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-800">
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
        </AppModal>
      ) : null}
    </>
  );
}
