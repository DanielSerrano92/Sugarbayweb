import type { BandNewsFilters, BandNewsQueryParams } from "@/lib/band/types";

const DEFAULT_PAGE = 1;

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

export function parseBandNewsFilters(params: BandNewsQueryParams): BandNewsFilters {
  const page = parsePositivePage(pickString(params.page));
  const from = pickString(params.from);
  const to = pickString(params.to);
  const tag = pickString(params.tag);

  return {
    page,
    from: isIsoDate(from) ? from : undefined,
    to: isIsoDate(to) ? to : undefined,
    tag,
  };
}

type PartialBandNewsFilters = Partial<BandNewsFilters>;

export function serializeBandNewsFilters(
  filters: PartialBandNewsFilters,
  overrides?: PartialBandNewsFilters,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.tag) params.set("tag", merged.tag);
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
