"use client";

import { useEffect, useMemo, useState } from "react";

import type { ConcertCardView, ConcertPeriod } from "@/lib/concerts/types";
import { formatDate } from "@/lib/utils";

type ConcertCardsClientProps = {
  period: ConcertPeriod;
  concerts: ConcertCardView[];
};

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="sb-btn-secondary inline-flex px-3 py-2 text-sm font-semibold text-zinc-200"
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
      <div className="grid gap-4 lg:grid-cols-2">
        {concerts.map((concert) => (
          <article
            key={concert.id}
            className="sb-panel rounded-2xl p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              {concert.countryLabel} - {concert.city}
            </p>
            <h2 className="mt-2 text-xl font-black text-zinc-900">{concert.title}</h2>
            <p className="mt-1 text-sm font-medium text-zinc-700">
              {formatDate(concert.startsAtIso, "es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            <a
              href={concert.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-sm text-emerald-600 hover:text-emerald-500"
            >
              {concert.locationLabel}
            </a>

            <p className="mt-3 text-sm text-zinc-700">{concert.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedConcertId(concert.id)}
                className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
              >
                {concert.infoButtonLabel}
              </button>

              {period === "upcoming" ? (
                concert.actionUrl ? (
                  <a
                    href={concert.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${
                      concert.isFree
                        ? "sb-btn-secondary text-zinc-200"
                        : "sb-btn-primary"
                    }`}
                  >
                    {concert.actionLabel}
                  </a>
                ) : (
                  <span className="rounded-xl bg-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700">
                    {concert.actionLabel}
                  </span>
                )
              ) : (
                <>
                  {concert.pastDetails?.photos[0] ? (
                    <ExternalLink href={concert.pastDetails.photos[0].url} label="Fotos" />
                  ) : (
                    <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-500">
                      Fotos
                    </span>
                  )}
                  {concert.pastDetails?.videos[0] ? (
                    <ExternalLink href={concert.pastDetails.videos[0].url} label="Videos" />
                  ) : (
                    <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-500">
                      Videos
                    </span>
                  )}
                </>
              )}
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
            className="sb-window relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-0 shadow-2xl"
          >
            <div className="sb-titlebar flex items-center justify-between gap-4 px-6 py-2">
              <span>Detalle concierto</span>
              <button
                type="button"
                onClick={() => setSelectedConcertId(null)}
                className="sb-btn-secondary px-3 py-2 text-xs font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {selectedConcert.countryLabel} - {selectedConcert.city}
                </p>
                <h3 id="concert-modal-title" className="mt-2 text-2xl font-black text-zinc-900">
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
          </section>
        </div>
      ) : null}
    </>
  );
}
