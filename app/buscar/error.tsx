"use client";

import { useEffect } from "react";

export default function BuscarErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-[0_20px_32px_rgba(16,4,12,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Busqueda</p>
      <h1 className="text-2xl font-black text-red-700">No pudimos cargar resultados</h1>
      <p className="text-sm text-red-700/90">
        Reintenta en unos segundos para volver a consultar paginas y productos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="sb-btn-danger px-4 py-2 text-sm font-semibold"
      >
        Reintentar
      </button>
    </div>
  );
}

