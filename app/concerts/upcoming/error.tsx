"use client";

type UpcomingConcertsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function UpcomingConcertsError({
  error,
  reset,
}: UpcomingConcertsErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-[0_20px_32px_rgba(16,4,12,0.45)]">
      <h2 className="text-xl font-black text-red-900">
        Error cargando proximos conciertos
      </h2>
      <p className="mt-2 text-sm text-red-800">
        {error.message || "No se pudo cargar la agenda en este momento."}
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
