"use client";

type PastConcertsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PastConcertsError({
  error,
  reset,
}: PastConcertsErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-[0_20px_32px_rgba(16,4,12,0.45)]">
      <h2 className="text-xl font-black text-red-900">
        Error cargando conciertos anteriores
      </h2>
      <p className="mt-2 text-sm text-red-800">
        {error.message || "No se pudo cargar el historico en este momento."}
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
