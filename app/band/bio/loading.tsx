import LoadingGrid from "@/components/ui/loading-grid";

export default function LoadingBandBio() {
  return (
    <div className="space-y-5">
      <div className="sb-skeleton h-44 rounded-3xl" />
      <LoadingGrid cards={2} />
    </div>
  );
}

