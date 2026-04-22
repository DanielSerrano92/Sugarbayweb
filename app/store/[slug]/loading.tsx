import LoadingGrid from "@/components/ui/loading-grid";

export default function StoreProductLoading() {
  return (
    <div className="space-y-6">
      <section className="sb-window grid gap-6 rounded-3xl p-6 lg:grid-cols-2">
        <div className="sb-skeleton h-[420px] rounded-2xl" />
        <div className="space-y-3">
          <div className="sb-skeleton h-6 w-1/3 rounded" />
          <div className="sb-skeleton h-10 w-2/3 rounded" />
          <div className="sb-skeleton h-20 rounded" />
          <div className="sb-skeleton h-44 rounded-2xl" />
        </div>
      </section>
      <LoadingGrid cards={4} />
    </div>
  );
}
