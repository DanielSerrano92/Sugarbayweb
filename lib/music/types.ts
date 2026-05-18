import type { ContributorRole, MusicReleaseType, TrackType } from "@/app/generated/prisma/client";

export const MUSIC_CATALOG_ITEM_TYPES = ["all", "song", "album"] as const;
export type MusicCatalogItemType = (typeof MUSIC_CATALOG_ITEM_TYPES)[number];

export const MUSIC_SORT_OPTIONS = [
  { value: "newest", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "title-asc", label: "Titulo A-Z" },
  { value: "title-desc", label: "Titulo Z-A" },
] as const;
export type MusicSortOption = (typeof MUSIC_SORT_OPTIONS)[number]["value"];

export type MusicQueryParams = {
  type?: string | string[];
  tab?: string | string[];
  sort?: string | string[];
  from?: string | string[];
  to?: string | string[];
  page?: string | string[];
  song?: string | string[];
  album?: string | string[];
};

export type MusicFilters = {
  type: MusicCatalogItemType;
  sort: MusicSortOption;
  from?: string;
  to?: string;
  page: number;
  song?: string;
  album?: string;
};

export type MusicCatalogCard = {
  id: string;
  kind: "song" | "album";
  slug: string;
  title: string;
  dateIso: string;
  imageUrl: string | null;
};

export type MusicCredit = {
  id: string;
  name: string;
  role: ContributorRole;
};

export type MusicExternalLink = {
  label: string;
  url: string;
};

export type MusicSongDetail = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  releaseTitle: string;
  releaseDateIso: string;
  durationSeconds: number;
  trackType: TrackType;
  isrc: string | null;
  lyrics: string | null;
  sheetMusicUrl: string | null;
  info: string | null;
  linerNotes: string | null;
  credits: MusicCredit[];
  externalLinks: MusicExternalLink[];
};

export type MusicAlbumTrack = {
  id: string;
  slug: string;
  title: string;
  trackNumber: number;
  discNumber: number;
  durationSeconds: number;
};

export type MusicAlbumDetail = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  releaseDateIso: string;
  releaseType: MusicReleaseType;
  info: string | null;
  linerNotes: string | null;
  credits: MusicCredit[];
  tracks: MusicAlbumTrack[];
  externalLinks: MusicExternalLink[];
};

export type MusicCatalogResult = {
  filters: MusicFilters;
  items: MusicCatalogCard[];
  songsBySlug: Record<string, MusicSongDetail>;
  albumsBySlug: Record<string, MusicAlbumDetail>;
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

