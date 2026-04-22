import Link from "next/link";

export default function NotFound() {
  return (
    <div className="sb-window rounded-3xl p-10 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-black text-zinc-900">Pgina no encontrada</h1>
      <p className="mt-3 text-sm text-zinc-600">
        Puede que el contenido haya cambiado de ruta o an no exista.
      </p>
      <Link
        href="/"
        className="sb-btn-primary mt-6 inline-flex px-4 py-2.5 text-sm font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
}


