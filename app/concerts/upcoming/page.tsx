import type { Metadata } from "next";
import ConcertsCatalogPage from "@/components/concerts/concerts-catalog-page";
import type { ConcertQueryParams } from "@/lib/concerts/types";

export const metadata: Metadata = {
  title: "Proximos conciertos",
  description: "Agenda de proximos conciertos de Sugarbay.",
};

type UpcomingConcertsPageProps = {
  searchParams: Promise<ConcertQueryParams>;
};

export default function UpcomingConcertsPage({
  searchParams,
}: UpcomingConcertsPageProps) {
  return <ConcertsCatalogPage period="upcoming" searchParams={searchParams} />;
}

