import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-300 bg-zinc-50/80 text-zinc-200 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Sugarbay</p>
          <p className="mt-2 text-sm text-zinc-600">
            Musica, conciertos y comunidad con pulso retrofuturista.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/store" className="hover:text-emerald-600">
            Tienda
          </Link>
          <Link href="/concerts/upcoming" className="hover:text-emerald-600">
            Conciertos
          </Link>
          <Link href="/fanclub" className="hover:text-emerald-600">
            Fanclub
          </Link>
          <Link href="/account" className="hover:text-emerald-600">
            Mi cuenta
          </Link>
        </div>
      </div>
    </footer>
  );
}
