"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { BandNewsItemView } from "@/lib/band/types";
import { resolveImageUrl } from "@/lib/services/imagekit";
import { formatDate } from "@/lib/utils";

type BandNewsListClientProps = {
  items: BandNewsItemView[];
};

export default function BandNewsListClient({ items }: BandNewsListClientProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(id: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => {
        const expanded = expandedIds.has(item.id);

        return (
          <article
            key={item.id}
            id={`news-${item.slug}`}
            className="sb-panel rounded-2xl p-5"
          >
            <div className="relative h-48 overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={resolveImageUrl(item.imageUrl)}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
              {formatDate(item.publishedAtIso, "es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            <h2 className="mt-2 text-xl font-black text-zinc-900">{item.title}</h2>
            <p className="mt-3 text-sm text-zinc-700">{item.summary}</p>

            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              className="sb-btn-secondary mt-4 px-3 py-2 text-sm font-semibold text-zinc-200"
              aria-expanded={expanded}
              aria-controls={`news-content-${item.id}`}
            >
              {expanded ? "Menos" : "Mas"}
            </button>

            <div
              id={`news-content-${item.id}`}
              className={`${expanded ? "mt-4 block" : "hidden"} space-y-3`}
            >
              <p className="text-sm leading-relaxed text-zinc-700">{item.content}</p>

              {item.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {item.relatedLinks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Enlaces relacionados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.relatedLinks.map((link) => (
                      <Link
                        key={`${item.id}-${link.href}`}
                        href={link.href}
                        className="sb-btn-secondary px-3 py-2 text-sm font-semibold text-zinc-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
