import Image from "next/image";

import type { BandBiographySectionView } from "@/lib/band/types";
import { resolveImageUrl } from "@/lib/services/imagekit";

type BiographySectionsProps = {
  sections: BandBiographySectionView[];
};

export default function BiographySections({ sections }: BiographySectionsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="sb-panel h-fit rounded-2xl p-4 lg:sticky lg:top-24">
        <h2 className="text-base font-bold text-zinc-900">Indice</h2>
        <nav className="mt-3 flex flex-col gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.anchorId}`}
              className="rounded-xl px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <div className="space-y-5">
        {sections.map((section) => (
          <article
            key={section.id}
            id={section.anchorId}
            className="sb-panel scroll-mt-28 rounded-2xl p-5"
          >
            <div className="relative h-52 overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={resolveImageUrl(section.imageUrl)}
                alt={section.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>
            <h3 className="mt-4 text-2xl font-black text-zinc-900">{section.title}</h3>

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-700">
              {section.content.split("\n").map((paragraph, index) => (
                <p key={`${section.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
