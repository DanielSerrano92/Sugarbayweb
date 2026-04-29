import type { ReactNode } from "react";
import Image from "next/image";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Imagen de fondo */}
      <div className="relative h-[260px] w-full">
        <Image
          src="/images/hero-concerts.png"
          alt="Conciertos Sugarbay"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
              {eyebrow}
            </span>
          )}

          <h1 className="mt-2 text-4xl font-black tracking-wide drop-shadow-lg md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-xl text-sm font-semibold drop-shadow">
              {description}
            </p>
          )}

          {actions && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
