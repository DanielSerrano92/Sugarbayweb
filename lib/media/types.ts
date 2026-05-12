import type { VideoPlatform } from "@/app/generated/prisma/client";

export const MEDIA_SORT_OPTIONS = [
  { value: "newest", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguos" },
  { value: "title-asc", label: "Titulo A-Z" },
  { value: "title-desc", label: "Titulo Z-A" },
] as const;
export type MediaSortOption = (typeof MEDIA_SORT_OPTIONS)[number]["value"];

export const PHOTO_FILTER_TYPES = [
  "all",
  "concierto",
  "estudio",
  "backstage",
  "promocional",
  "general",
] as const;
export type PhotoFilterType = (typeof PHOTO_FILTER_TYPES)[number];

export const VIDEO_FILTER_TYPES = ["all", "collection", "single"] as const;
export type VideoFilterType = (typeof VIDEO_FILTER_TYPES)[number];

export type MediaPhotoQueryParams = {
  from?: string | string[];
  to?: string | string[];
  type?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export type MediaPhotoFilters = {
  from?: string;
  to?: string;
  type: PhotoFilterType;
  sort: MediaSortOption;
  page: number;
};

export type PhotoAlbumCard = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  eventDateIso: string | null;
  photoCount: number;
  inferredType: PhotoFilterType;
};

export type PhotoDetailItem = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
  width: number | null;
  height: number | null;
  takenAtIso: string | null;
  photographer: string;
};

export type PhotoAlbumDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  eventDateIso: string | null;
  inferredType: PhotoFilterType;
  photos: PhotoDetailItem[];
};

export type PhotoAlbumsCatalogResult = {
  filters: MediaPhotoFilters;
  items: PhotoAlbumCard[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

export type MediaVideoQueryParams = {
  from?: string | string[];
  to?: string | string[];
  type?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export type MediaVideoFilters = {
  from?: string;
  to?: string;
  type: VideoFilterType;
  sort: MediaSortOption;
  page: number;
};

export type VideoCatalogCard = {
  id: string;
  kind: "collection" | "single";
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  dateIso: string;
  videoCount: number;
  platform: VideoPlatform | null;
};

export type VideoEmbedItem = {
  id: string;
  slug: string;
  title: string;
  youtubeId: string | null;
  type: "normal" | "short";
  description: string | null;
  platform: VideoPlatform;
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  publishedAtIso: string | null;
};

export type VideoCollectionDetail = {
  kind: "collection";
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  dateIso: string;
  videos: VideoEmbedItem[];
};

export type VideoSingleDetail = {
  kind: "single";
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  dateIso: string;
  video: VideoEmbedItem;
  collection: {
    slug: string;
    title: string;
  } | null;
};

export type VideoDetailResult = VideoCollectionDetail | VideoSingleDetail;

export type VideoCatalogResult = {
  filters: MediaVideoFilters;
  items: VideoCatalogCard[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
};

export type HomeVideoBandItem = {
  id: string;
  slug: string;
  title: string;
  collectionTitle: string;
  previewImageUrl: string | null;
  publishedAtIso: string;
};

export type MediaOverviewStats = {
  photoAlbums: number;
  photoItems: number;
  videoCollections: number;
  videoItems: number;
};
