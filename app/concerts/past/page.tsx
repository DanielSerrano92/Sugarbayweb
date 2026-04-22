import type { Metadata } from "next";
import ConcertsCatalogPage from "@/components/concerts/concerts-catalog-page";
import type { ConcertQueryParams } from "@/lib/concerts/types";

export const metadata: Metadata = {
  title: "Conciertos anteriores",
  description: "Historico de conciertos y cronicas de Sugarbay.",
};

type PastConcertsPageProps = {
  searchParams: Promise<ConcertQueryParams>;
};

export default function PastConcertsPage({ searchParams }: PastConcertsPageProps) {
  return <ConcertsCatalogPage period="past" searchParams={searchParams} />;
}

