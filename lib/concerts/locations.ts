import type { ConcertContinent } from "@/lib/concerts/types";

export const continentOptions: Array<{
  value: ConcertContinent;
  label: string;
}> = [
  { value: "all", label: "Todos los continentes" },
  { value: "europe", label: "Europa" },
  { value: "north-america", label: "Norteamerica" },
  { value: "south-america", label: "Sudamerica" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
  { value: "other", label: "Otros" },
];

type CountryMeta = {
  label: string;
  continent: Exclude<ConcertContinent, "all">;
};

const countryDirectory: Record<string, CountryMeta> = {
  ES: { label: "Espana", continent: "europe" },
  SPAIN: { label: "Espana", continent: "europe" },
  ESPANA: { label: "Espana", continent: "europe" },
  FR: { label: "Francia", continent: "europe" },
  FRANCE: { label: "Francia", continent: "europe" },
  PT: { label: "Portugal", continent: "europe" },
  PORTUGAL: { label: "Portugal", continent: "europe" },
  IT: { label: "Italia", continent: "europe" },
  ITALY: { label: "Italia", continent: "europe" },
  DE: { label: "Alemania", continent: "europe" },
  GERMANY: { label: "Alemania", continent: "europe" },
  GB: { label: "Reino Unido", continent: "europe" },
  UK: { label: "Reino Unido", continent: "europe" },
  UNITEDKINGDOM: { label: "Reino Unido", continent: "europe" },
  IE: { label: "Irlanda", continent: "europe" },
  IRELAND: { label: "Irlanda", continent: "europe" },
  CH: { label: "Suiza", continent: "europe" },
  SWITZERLAND: { label: "Suiza", continent: "europe" },
  NL: { label: "Paises Bajos", continent: "europe" },
  NETHERLANDS: { label: "Paises Bajos", continent: "europe" },
  BE: { label: "Belgica", continent: "europe" },
  BELGIUM: { label: "Belgica", continent: "europe" },
  NO: { label: "Noruega", continent: "europe" },
  NORWAY: { label: "Noruega", continent: "europe" },
  SE: { label: "Suecia", continent: "europe" },
  SWEDEN: { label: "Suecia", continent: "europe" },
  DK: { label: "Dinamarca", continent: "europe" },
  DENMARK: { label: "Dinamarca", continent: "europe" },
  US: { label: "Estados Unidos", continent: "north-america" },
  USA: { label: "Estados Unidos", continent: "north-america" },
  UNITEDSTATES: { label: "Estados Unidos", continent: "north-america" },
  CA: { label: "Canada", continent: "north-america" },
  CANADA: { label: "Canada", continent: "north-america" },
  MX: { label: "Mexico", continent: "north-america" },
  MEXICO: { label: "Mexico", continent: "north-america" },
  BR: { label: "Brasil", continent: "south-america" },
  BRAZIL: { label: "Brasil", continent: "south-america" },
  AR: { label: "Argentina", continent: "south-america" },
  ARGENTINA: { label: "Argentina", continent: "south-america" },
  CL: { label: "Chile", continent: "south-america" },
  CHILE: { label: "Chile", continent: "south-america" },
  CO: { label: "Colombia", continent: "south-america" },
  COLOMBIA: { label: "Colombia", continent: "south-america" },
  PE: { label: "Peru", continent: "south-america" },
  PERU: { label: "Peru", continent: "south-america" },
  JP: { label: "Japon", continent: "asia" },
  JAPAN: { label: "Japon", continent: "asia" },
  KR: { label: "Corea del Sur", continent: "asia" },
  SOUTHKOREA: { label: "Corea del Sur", continent: "asia" },
  CN: { label: "China", continent: "asia" },
  CHINA: { label: "China", continent: "asia" },
  SG: { label: "Singapur", continent: "asia" },
  SINGAPORE: { label: "Singapur", continent: "asia" },
  AU: { label: "Australia", continent: "oceania" },
  AUSTRALIA: { label: "Australia", continent: "oceania" },
  NZ: { label: "Nueva Zelanda", continent: "oceania" },
  NEWZEALAND: { label: "Nueva Zelanda", continent: "oceania" },
  ZA: { label: "Sudafrica", continent: "africa" },
  SOUTHAFRICA: { label: "Sudafrica", continent: "africa" },
  MA: { label: "Marruecos", continent: "africa" },
  MOROCCO: { label: "Marruecos", continent: "africa" },
};

function normalizeCountryKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export function getCountryMeta(rawCountry: string): CountryMeta {
  const normalized = normalizeCountryKey(rawCountry);
  return (
    countryDirectory[normalized] ?? {
      label: rawCountry,
      continent: "other",
    }
  );
}

export function getCountryLabel(rawCountry: string): string {
  return getCountryMeta(rawCountry).label;
}

export function getContinentForCountry(
  rawCountry: string,
): Exclude<ConcertContinent, "all"> {
  return getCountryMeta(rawCountry).continent;
}
