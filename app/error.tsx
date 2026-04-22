"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logging bsico para facilitar diagnstico en produccin.
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-[0_20px_32px_rgba(16,4,12,0.45)]">
      <h1 className="text-2xl font-bold text-red-700">Algo sali mal</h1>
      <p className="mt-2 text-sm text-red-700/90">
        Hemos capturado el error para revisarlo. Puedes reintentar ahora.
      </p>
      <button
        type="button"
        onClick={reset}
        className="sb-btn-danger mt-4 px-4 py-2 text-sm font-semibold"
      >
        Reintentar
      </button>
    </div>
  );
}


