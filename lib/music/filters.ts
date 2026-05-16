import type {
  MusicCatalogItemType,
  MusicFilters,
  MusicQueryParams,
  MusicSortOption,
} from "@/lib/music/types";
import { MUSIC_CATALOG_ITEM_TYPES, MUSIC_SORT_OPTIONS } from "@/lib/music/types";

const DEFAULT_PAGE = 1;
const DEFAULT_SORT: MusicSortOption = "newest";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pickString(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositivePage(value: string | undefined): number {
  if (!value) return DEFAULT_PAGE;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PAGE;
  return parsed;
}

function parseType(
  directValue: string | undefined,
  tabValue: string | undefined,
): MusicCatalogItemType {
  if (
    directValue &&
    (MUSIC_CATALOG_ITEM_TYPES as readonly string[]).includes(directValue)
  ) {
    return directValue as MusicCatalogItemType;
  }

  if (tabValue === "albumes") return "album";
  if (tabValue === "canciones") return "song";
  return "all";
}

export function parseMusicFilters(params: MusicQueryParams): MusicFilters {
  const sortValues = MUSIC_SORT_OPTIONS.map((option) => option.value);

  const type = parseType(pickString(params.type), pickString(params.tab));
  const sortValue = pickString(params.sort);
  const sort =
    sortValue && (sortValues as readonly string[]).includes(sortValue)
      ? (sortValue as MusicSortOption)
      : DEFAULT_SORT;

  const from = pickString(params.from);
  const to = pickString(params.to);
  const song = pickString(params.song);
  const album = pickString(params.album);

  return {
    type,
    sort,
    from: from && ISO_DATE_PATTERN.test(from) ? from : undefined,
    to: to && ISO_DATE_PATTERN.test(to) ? to : undefined,
    page: parsePositivePage(pickString(params.page)),
    song,
    album,
  };
}

type PartialMusicFilters = Partial<MusicFilters>;

export function serializeMusicFilters(
  filters: PartialMusicFilters,
  overrides?: PartialMusicFilters,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();
  if (merged.type && merged.type !== "all") params.set("type", merged.type);
  if (merged.sort) params.set("sort", merged.sort);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.song) params.set("song", merged.song);
  if (merged.album) params.set("album", merged.album);
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

