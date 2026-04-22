import {
  MEDIA_SORT_OPTIONS,
  PHOTO_FILTER_TYPES,
  VIDEO_FILTER_TYPES,
  type MediaPhotoFilters,
  type MediaPhotoQueryParams,
  type MediaSortOption,
  type MediaVideoFilters,
  type MediaVideoQueryParams,
  type PhotoFilterType,
  type VideoFilterType,
} from "@/lib/media/types";

const DEFAULT_PAGE = 1;
const DEFAULT_SORT: MediaSortOption = "newest";

function pickString(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePage(value: string | undefined): number {
  if (!value) return DEFAULT_PAGE;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PAGE;
  return parsed;
}

function parseSort(value: string | undefined): MediaSortOption {
  const options = MEDIA_SORT_OPTIONS.map((option) => option.value);
  if (value && (options as readonly string[]).includes(value)) {
    return value as MediaSortOption;
  }
  return DEFAULT_SORT;
}

function isIsoDate(value: string | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parsePhotoFilters(params: MediaPhotoQueryParams): MediaPhotoFilters {
  const rawType = pickString(params.type);
  const type =
    rawType && (PHOTO_FILTER_TYPES as readonly string[]).includes(rawType)
      ? (rawType as PhotoFilterType)
      : "all";

  const from = pickString(params.from);
  const to = pickString(params.to);

  return {
    from: isIsoDate(from) ? from : undefined,
    to: isIsoDate(to) ? to : undefined,
    type,
    sort: parseSort(pickString(params.sort)),
    page: parsePage(pickString(params.page)),
  };
}

type PartialPhotoFilters = Partial<MediaPhotoFilters>;

export function serializePhotoFilters(
  filters: PartialPhotoFilters,
  overrides?: PartialPhotoFilters,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  if (merged.sort) params.set("sort", merged.sort);
  if (typeof merged.page === "number" && merged.page > 1) {
    params.set("page", String(merged.page));
  }
  return params;
}

export function parseVideoFilters(params: MediaVideoQueryParams): MediaVideoFilters {
  const rawType = pickString(params.type);
  const type =
    rawType && (VIDEO_FILTER_TYPES as readonly string[]).includes(rawType)
      ? (rawType as VideoFilterType)
      : "all";

  const from = pickString(params.from);
  const to = pickString(params.to);

  return {
    from: isIsoDate(from) ? from : undefined,
    to: isIsoDate(to) ? to : undefined,
    type,
    sort: parseSort(pickString(params.sort)),
    page: parsePage(pickString(params.page)),
  };
}

type PartialVideoFilters = Partial<MediaVideoFilters>;

export function serializeVideoFilters(
  filters: PartialVideoFilters,
  overrides?: PartialVideoFilters,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  if (merged.sort) params.set("sort", merged.sort);
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

