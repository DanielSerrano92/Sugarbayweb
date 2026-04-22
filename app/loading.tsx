import LoadingGrid from "@/components/ui/loading-grid";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="sb-skeleton h-52 rounded-3xl" />
      <LoadingGrid cards={6} />
    </div>
  );
}

