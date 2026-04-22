type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="sb-empty rounded-2xl px-6 py-10 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Sin contenido
      </p>
      <h2 className="mt-3 text-lg font-bold text-zinc-900">{title}</h2>
      <p className="mt-2 text-sm text-zinc-700">{description}</p>
    </div>
  );
}
