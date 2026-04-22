import LoadingGrid from "@/components/ui/loading-grid";

export default function StoreLoading() {
  return (
    <div className="space-y-6">
      <div className="sb-skeleton h-40 rounded-3xl" />
      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="sb-skeleton h-96 rounded-2xl" />
        <LoadingGrid cards={6} />
      </section>
    </div>
  );
}

