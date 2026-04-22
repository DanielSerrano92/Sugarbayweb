import type {
  ConcertContinent,
  ConcertFilters,
  ConcertQueryParams,
} from "@/lib/concerts/types";

const DEFAULT_PAGE = 1;
const continentValues: ConcertContinent[] = [
  "all",
  "africa",
  "asia",
  "europe",
  "north-america",
  "south-america",
  "oceania",
  "other",
];

function pickString(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositivePage(rawValue: string | undefined): number {
  if (!rawValue) return DEFAULT_PAGE;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PAGE;
  return parsed;
}

function isIsoDate(rawValue: string | undefined): rawValue is string {
  if (!rawValue) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(rawValue);
}

export function parseConcertFilters(params: ConcertQueryParams): ConcertFilters {
  const page = parsePositivePage(pickString(params.page));
  const fromValue = pickString(params.from);
  const toValue = pickString(params.to);
  const continentValue = pickString(params.continent);
  const countryValue = pickString(params.country);

  return {
    page,
    from: isIsoDate(fromValue) ? fromValue : undefined,
    to: isIsoDate(toValue) ? toValue : undefined,
    continent: continentValues.includes(continentValue as ConcertContinent)
      ? (continentValue as ConcertContinent)
      : "all",
    country: countryValue || undefined,
  };
}

type PartialConcertFilters = Partial<ConcertFilters>;

export function serializeConcertFilters(
  filters: PartialConcertFilters,
  overrides?: PartialConcertFilters,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();

  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.continent && merged.continent !== "all") {
    params.set("continent", merged.continent);
  }
  if (merged.country) {
    params.set("country", merged.country);
  }
  if (typeof merged.page === "number" && merged.page > 1) {
    params.set("page", String(merged.page));
  }

  return params;
}

export function toDateRange(params: {
  from?: string;
  to?: string;
}): { from?: Date; to?: Date } {
  const from = params.from ? new Date(`${params.from}T00:00:00.000Z`) : undefined;
  const to = params.to ? new Date(`${params.to}T23:59:59.999Z`) : undefined;

  return {
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
  };
}
