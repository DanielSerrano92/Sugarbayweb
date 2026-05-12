import type {
  ConcertContinent,
  ConcertCountryOption,
} from "@/lib/concerts/types";

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

type ListedContinent = Exclude<ConcertContinent, "all" | "other">;

export const COUNTRIES_BY_CONTINENT: Record<
  ListedContinent,
  ConcertCountryOption[]
> = {
  europe: [
    { code: "ES", label: "Espana", continent: "europe" },
    { code: "FR", label: "Francia", continent: "europe" },
    { code: "DE", label: "Alemania", continent: "europe" },
    { code: "GB", label: "Reino Unido", continent: "europe" },
    { code: "IT", label: "Italia", continent: "europe" },
    { code: "PT", label: "Portugal", continent: "europe" },
    { code: "NL", label: "Paises Bajos", continent: "europe" },
    { code: "BE", label: "Belgica", continent: "europe" },
    { code: "IE", label: "Irlanda", continent: "europe" },
    { code: "SE", label: "Suecia", continent: "europe" },
  ],
  "north-america": [
    { code: "US", label: "Estados Unidos", continent: "north-america" },
    { code: "CA", label: "Canada", continent: "north-america" },
    { code: "MX", label: "Mexico", continent: "north-america" },
  ],
  "south-america": [
    { code: "AR", label: "Argentina", continent: "south-america" },
    { code: "CL", label: "Chile", continent: "south-america" },
    { code: "CO", label: "Colombia", continent: "south-america" },
    { code: "BR", label: "Brasil", continent: "south-america" },
    { code: "PE", label: "Peru", continent: "south-america" },
  ],
  asia: [
    { code: "JP", label: "Japon", continent: "asia" },
    { code: "KR", label: "Corea del Sur", continent: "asia" },
    { code: "CN", label: "China", continent: "asia" },
    { code: "IN", label: "India", continent: "asia" },
    { code: "TH", label: "Tailandia", continent: "asia" },
    { code: "SG", label: "Singapur", continent: "asia" },
  ],
  oceania: [
    { code: "AU", label: "Australia", continent: "oceania" },
    { code: "NZ", label: "Nueva Zelanda", continent: "oceania" },
  ],
  africa: [
    { code: "ZA", label: "Sudafrica", continent: "africa" },
    { code: "MA", label: "Marruecos", continent: "africa" },
    { code: "EG", label: "Egipto", continent: "africa" },
  ],
};

const countryAliases: Record<string, string[]> = {
  AR: ["ARGENTINA"],
  AU: ["AUSTRALIA"],
  BE: ["BELGIUM", "BELGICA"],
  BR: ["BRAZIL", "BRASIL"],
  CA: ["CANADA"],
  CL: ["CHILE"],
  CN: ["CHINA"],
  CO: ["COLOMBIA"],
  DE: ["GERMANY", "ALEMANIA"],
  EG: ["EGYPT", "EGIPTO"],
  ES: ["SPAIN", "ESPANA"],
  FR: ["FRANCE", "FRANCIA"],
  GB: ["UK", "UNITED KINGDOM", "UNITEDKINGDOM", "REINO UNIDO", "REINOUNIDO"],
  IE: ["IRELAND", "IRLANDA"],
  IN: ["INDIA"],
  IT: ["ITALY", "ITALIA"],
  JP: ["JAPAN", "JAPON"],
  KR: ["SOUTH KOREA", "SOUTHKOREA", "COREA DEL SUR", "COREADELSUR"],
  MA: ["MOROCCO", "MARRUECOS"],
  MX: ["MEXICO"],
  NL: ["NETHERLANDS", "PAISES BAJOS", "PAISESBAJOS"],
  NZ: ["NEW ZEALAND", "NEWZEALAND", "NUEVA ZELANDA", "NUEVAZELANDA"],
  PE: ["PERU"],
  PT: ["PORTUGAL"],
  SE: ["SWEDEN", "SUECIA"],
  SG: ["SINGAPORE", "SINGAPUR"],
  TH: ["THAILAND", "TAILANDIA"],
  US: ["USA", "UNITED STATES", "UNITEDSTATES", "ESTADOS UNIDOS", "ESTADOSUNIDOS"],
  ZA: ["SOUTH AFRICA", "SOUTHAFRICA", "SUDAFRICA"],
};

function normalizeCountryKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function getAllConcertCountries(): ConcertCountryOption[] {
  return Object.values(COUNTRIES_BY_CONTINENT).flat();
}

function buildCountryDirectory(): Record<string, CountryMeta> {
  const directory: Record<string, CountryMeta> = {};

  for (const country of getAllConcertCountries()) {
    const meta: CountryMeta = {
      label: country.label,
      continent: country.continent,
    };

    directory[normalizeCountryKey(country.code)] = meta;

    for (const alias of countryAliases[country.code] ?? []) {
      directory[normalizeCountryKey(alias)] = meta;
    }
  }

  return directory;
}

const countryDirectory = buildCountryDirectory();

export function getCountriesForContinent(
  continent: ConcertContinent,
): ConcertCountryOption[] {
  if (continent === "all") {
    return getAllConcertCountries();
  }

  if (continent === "other") {
    return [];
  }

  return COUNTRIES_BY_CONTINENT[continent];
}

export function isCountryInContinent(
  countryCode: string,
  continent: ConcertContinent,
): boolean {
  return getCountriesForContinent(continent).some(
    (country) => country.code === countryCode,
  );
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
