type LoadingGridProps = {
  cards?: number;
};

export default function LoadingGrid({ cards = 6 }: LoadingGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={`skeleton-${index}`} className="sb-skeleton h-44 rounded-2xl" />
      ))}
    </div>
  );
}
