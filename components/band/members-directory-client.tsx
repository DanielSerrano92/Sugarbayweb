"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { BandMemberView } from "@/lib/band/types";
import { resolveImageUrl } from "@/lib/services/imagekit";

type MembersDirectoryClientProps = {
  bandMembers: BandMemberView[];
  collaborators: BandMemberView[];
};

type MembersGroupProps = {
  title: string;
  members: BandMemberView[];
  onSelect: (slug: string) => void;
};

function MembersGroup({ title, members, onSelect }: MembersGroupProps) {
  if (members.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-black text-zinc-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member.slug)}
            className="group text-left"
          >
            <article className="sb-panel h-full rounded-2xl p-4 transition group-hover:-translate-y-0.5 group-hover:border-emerald-300">
              <div className="relative h-44 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={resolveImageUrl(member.avatarUrl)}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900">{member.name}</h3>
              <p className="mt-1 text-sm font-semibold text-emerald-600">{member.roleTitle}</p>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-700">{member.bio}</p>
            </article>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function MembersDirectoryClient({
  bandMembers,
  collaborators,
}: MembersDirectoryClientProps) {
  const allMembers = useMemo(
    () => [...bandMembers, ...collaborators],
    [bandMembers, collaborators],
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedMember = useMemo(
    () => allMembers.find((member) => member.slug === selectedSlug) ?? null,
    [allMembers, selectedSlug],
  );

  useEffect(() => {
    if (!selectedMember) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedSlug(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedMember]);

  return (
    <>
      <div className="space-y-8">
        <MembersGroup
          title="Banda"
          members={bandMembers}
          onSelect={setSelectedSlug}
        />
        <MembersGroup
          title="Colaboradores"
          members={collaborators}
          onSelect={setSelectedSlug}
        />
      </div>

      {selectedMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedSlug(null)}
            className="absolute inset-0 bg-black/70"
            aria-label="Cerrar detalle de miembro"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
            className="sb-window relative z-10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="member-modal-title" className="text-2xl font-black text-zinc-900">
                  {selectedMember.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-600">
                  {selectedMember.roleTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlug(null)}
                className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="relative h-52 overflow-hidden rounded-xl bg-zinc-100">
                <Image
                  src={resolveImageUrl(selectedMember.avatarUrl)}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-zinc-700">{selectedMember.bio}</p>

                {selectedMember.links.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Enlaces
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.links.map((link) => (
                        <a
                          key={`${selectedMember.id}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Este perfil aun no tiene enlaces publicados.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
