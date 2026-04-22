import type { ReactNode } from "react";

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
    <section className="sb-window relative overflow-hidden rounded-3xl px-6 py-10 text-white lg:px-10">
      <div className="sb-titlebar -mx-6 -mt-10 mb-8 flex items-center justify-between px-6 py-2 lg:-mx-10 lg:px-10">
        <span className="text-white">Sugarbay Interface</span>
        <span className="hidden text-white sm:inline">Live Session</span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(127,82,255,0.34),transparent_52%),radial-gradient(circle_at_bottom_left,rgba(255,141,75,0.22),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(166,142,231,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(166,142,231,0.22)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="relative z-10 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.3em] text-white">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-black leading-tight lg:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm text-white lg:text-base">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
