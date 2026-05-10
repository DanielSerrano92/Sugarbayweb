import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { parsePhotoFilters, parseVideoFilters, toDateRange } from "@/lib/media/filters";
import type {
  MediaOverviewStats,
  MediaPhotoQueryParams,
  MediaSortOption,
  MediaVideoQueryParams,
  PhotoAlbumCard,
  PhotoAlbumDetail,
  PhotoAlbumsCatalogResult,
  PhotoFilterType,
  VideoCatalogCard,
  VideoCatalogResult,
  VideoDetailResult,
  VideoEmbedItem,
} from "@/lib/media/types";
import {
  extractYouTubeVideoId,
  inferYouTubeVideoType,
  resolveVideoEmbedUrl,
} from "@/lib/media/video";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";

const PHOTO_PAGE_SIZE = 9;
const VIDEO_PAGE_SIZE = 9;

type PhotoAlbumRecord = Prisma.PhotoAlbumGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    coverImageUrl: true;
    eventDate: true;
    createdAt: true;
    photos: {
      select: {
        id: true;
        imageUrl: true;
        sortOrder: true;
        isCover: true;
      };
      orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }];
    };
  };
}>;

type PhotoAlbumDetailRecord = Prisma.PhotoAlbumGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    coverImageUrl: true;
    eventDate: true;
    photos: {
      select: {
        id: true;
        title: true;
        caption: true;
        imageUrl: true;
        width: true;
        height: true;
        takenAt: true;
        sortOrder: true;
        isCover: true;
      };
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }];
    };
  };
}>;

type VideoCollectionRecord = Prisma.VideoCollectionGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    coverImageUrl: true;
    sortOrder: true;
    createdAt: true;
    videos: {
      select: {
        id: true;
        slug: true;
        title: true;
        description: true;
        platform: true;
        videoUrl: true;
        thumbnailUrl: true;
        durationSeconds: true;
        publishedAt: true;
        createdAt: true;
        sortOrder: true;
      };
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }];
    };
  };
}>;

type VideoSingleRecord = Prisma.VideoItemGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    platform: true;
    videoUrl: true;
    thumbnailUrl: true;
    durationSeconds: true;
    publishedAt: true;
    createdAt: true;
    videoCollection: {
      select: {
        id: true;
        slug: true;
        title: true;
        coverImageUrl: true;
        isPublished: true;
      };
    };
  };
}>;

type SortableItem<T> = {
  date: Date;
  title: string;
  item: T;
};

function inferPhotoTypeFromText(text: string): PhotoFilterType {
  const value = text.toLowerCase();
  if (/(tour|live|show|concert|gira|concierto)/.test(value)) return "concierto";
  if (/(studio|estudio|record|session)/.test(value)) return "estudio";
  if (/(backstage|detras|behind)/.test(value)) return "backstage";
  if (/(promo|press|editorial|prensa)/.test(value)) return "promocional";
  return "general";
}

function inferPhotoType(album: { slug: string; title: string; description: string | null }): PhotoFilterType {
  const text = `${album.slug} ${album.title} ${album.description ?? ""}`;
  return inferPhotoTypeFromText(text);
}

function parsePhotographer(rawText: string): string {
  const socialMatch = rawText.match(/@([a-z0-9_.]+)/i);
  if (socialMatch?.[1]) return `@${socialMatch[1]}`;

  const byMatch = rawText.match(/(?:foto|photo|by)[:\s-]+([a-zA-Z0-9 ._-]{2,40})/i);
  if (byMatch?.[1]) return byMatch[1].trim();

  return "Sugarbay Media Team";
}

function compareBySort<T>(
  left: SortableItem<T>,
  right: SortableItem<T>,
  sort: MediaSortOption,
): number {
  switch (sort) {
    case "oldest":
      return left.date.getTime() - right.date.getTime() || left.title.localeCompare(right.title);
    case "title-asc":
      return left.title.localeCompare(right.title) || right.date.getTime() - left.date.getTime();
    case "title-desc":
      return right.title.localeCompare(left.title) || right.date.getTime() - left.date.getTime();
    case "newest":
    default:
      return right.date.getTime() - left.date.getTime() || left.title.localeCompare(right.title);
  }
}

function mapVideoEmbedItem(video: VideoCollectionRecord["videos"][number]): VideoEmbedItem {
  return {
    id: video.id,
    slug: video.slug,
    title: video.title,
    youtubeId: extractYouTubeVideoId(video.videoUrl),
    type: inferYouTubeVideoType(video.videoUrl),
    description: video.description,
    platform: video.platform,
    videoUrl: video.videoUrl,
    embedUrl: resolveVideoEmbedUrl(video.platform, video.videoUrl),
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: video.durationSeconds,
    publishedAtIso: video.publishedAt ? video.publishedAt.toISOString() : null,
  };
}

function resolveCollectionDate(collection: VideoCollectionRecord): Date {
  if (collection.videos.length === 0) return collection.createdAt;
  return collection.videos.reduce((latest, video) => {
    const current = video.publishedAt ?? video.createdAt;
    return current.getTime() > latest.getTime() ? current : latest;
  }, collection.videos[0]!.publishedAt ?? collection.videos[0]!.createdAt);
}

function inDateRange(date: Date, from?: Date, to?: Date): boolean {
  if (from && date.getTime() < from.getTime()) return false;
  if (to && date.getTime() > to.getTime()) return false;
  return true;
}

export async function getMediaOverviewStats(): Promise<MediaOverviewStats> {
  const [photoAlbums, photoItems, videoCollections, videoItems] = await Promise.all([
    withDatabaseFallback(
      () =>
        prisma.photoAlbum.count({
          where: { isPublished: true },
        }),
      0,
    ),
    withDatabaseFallback(
      () =>
        prisma.photo.count({
          where: { photoAlbum: { isPublished: true } },
        }),
      0,
    ),
    withDatabaseFallback(
      () =>
        prisma.videoCollection.count({
          where: { isPublished: true },
        }),
      0,
    ),
    withDatabaseFallback(
      () =>
        prisma.videoItem.count({
          where: { videoCollection: { isPublished: true } },
        }),
      0,
    ),
  ]);

  return {
    photoAlbums,
    photoItems,
    videoCollections,
    videoItems,
  };
}

export async function getPhotoAlbumsCatalog(
  params: MediaPhotoQueryParams,
): Promise<PhotoAlbumsCatalogResult> {
  const filters = parsePhotoFilters(params);
  const dateRange = toDateRange({ from: filters.from, to: filters.to });

  const records = await withDatabaseFallback(
    () =>
      prisma.photoAlbum.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImageUrl: true,
          eventDate: true,
          createdAt: true,
          photos: {
            select: {
              id: true,
              imageUrl: true,
              sortOrder: true,
              isCover: true,
            },
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    [] as PhotoAlbumRecord[],
  );

  const sortable: SortableItem<PhotoAlbumCard>[] = [];

  for (const record of records) {
    const inferredType = inferPhotoType(record);
    if (filters.type !== "all" && inferredType !== filters.type) continue;

    const eventDate = record.eventDate ?? record.createdAt;
    if (!inDateRange(eventDate, dateRange.from, dateRange.to)) continue;

    const coverImage = record.coverImageUrl ?? record.photos[0]?.imageUrl ?? null;
    sortable.push({
      date: eventDate,
      title: record.title,
      item: {
        id: record.id,
        slug: record.slug,
        title: record.title,
        description: record.description,
        coverImageUrl: coverImage,
        eventDateIso: record.eventDate ? record.eventDate.toISOString() : null,
        photoCount: record.photos.length,
        inferredType,
      },
    });
  }

  sortable.sort((left, right) => compareBySort(left, right, filters.sort));

  const totalItems = sortable.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PHOTO_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const offset = (page - 1) * PHOTO_PAGE_SIZE;
  const items = sortable.slice(offset, offset + PHOTO_PAGE_SIZE).map((entry) => entry.item);

  return {
    filters: {
      ...filters,
      page,
    },
    items,
    totalItems,
    totalPages,
    pageSize: PHOTO_PAGE_SIZE,
  };
}

export async function getPhotoAlbumDetailBySlug(
  slug: string,
): Promise<PhotoAlbumDetail | null> {
  const album = await withDatabaseFallback(
    () =>
      prisma.photoAlbum.findFirst({
        where: {
          slug,
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImageUrl: true,
          eventDate: true,
          photos: {
            select: {
              id: true,
              title: true,
              caption: true,
              imageUrl: true,
              width: true,
              height: true,
              takenAt: true,
              sortOrder: true,
              isCover: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    null as PhotoAlbumDetailRecord | null,
  );

  if (!album) return null;

  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    description: album.description,
    coverImageUrl: album.coverImageUrl ?? album.photos[0]?.imageUrl ?? null,
    eventDateIso: album.eventDate ? album.eventDate.toISOString() : null,
    inferredType: inferPhotoType(album),
    photos: album.photos.map((photo) => ({
      id: photo.id,
      title: photo.title,
      caption: photo.caption,
      imageUrl: photo.imageUrl,
      width: photo.width,
      height: photo.height,
      takenAtIso: photo.takenAt ? photo.takenAt.toISOString() : null,
      photographer: parsePhotographer(`${photo.title ?? ""} ${photo.caption ?? ""}`),
    })),
  };
}

export async function getVideoCatalog(
  params: MediaVideoQueryParams = {},
): Promise<VideoCatalogResult> {
  const filters = parseVideoFilters(params);

  const collections = await withDatabaseFallback(
    () =>
      prisma.videoCollection.findMany({
        where: {
          isPublished: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImageUrl: true,
          sortOrder: true,
          createdAt: true,
          videos: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              platform: true,
              videoUrl: true,
              thumbnailUrl: true,
              durationSeconds: true,
              publishedAt: true,
              createdAt: true,
              sortOrder: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    [] as VideoCollectionRecord[],
  );

  const collectionCards: SortableItem<VideoCatalogCard>[] = [];

  for (const collection of collections) {
    const collectionDate = resolveCollectionDate(collection);
    const videosCount = collection.videos.length;

    collectionCards.push({
      date: collectionDate,
      title: collection.title,
      item: {
        id: collection.id,
        kind: "collection",
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        coverImageUrl: collection.coverImageUrl ?? collection.videos[0]?.thumbnailUrl ?? null,
        dateIso: collectionDate.toISOString(),
        videoCount: videosCount,
        platform: null,
      },
    });
  }

  const filteredByDate = collectionCards;
  const totalItems = filteredByDate.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / VIDEO_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const offset = (page - 1) * VIDEO_PAGE_SIZE;
  const items = filteredByDate.slice(offset, offset + VIDEO_PAGE_SIZE).map((entry) => entry.item);

  return {
    filters: {
      ...filters,
      page,
    },
    items,
    totalItems,
    totalPages,
    pageSize: VIDEO_PAGE_SIZE,
  };
}

export async function getVideoDetailBySlug(slug: string): Promise<VideoDetailResult | null> {
  const collection = await withDatabaseFallback(
    () =>
      prisma.videoCollection.findFirst({
        where: {
          slug,
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImageUrl: true,
          sortOrder: true,
          createdAt: true,
          videos: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              platform: true,
              videoUrl: true,
              thumbnailUrl: true,
              durationSeconds: true,
              publishedAt: true,
              createdAt: true,
              sortOrder: true,
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    null as VideoCollectionRecord | null,
  );

  if (collection) {
    const date = resolveCollectionDate(collection);
    return {
      kind: "collection",
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      description: collection.description,
      coverImageUrl: collection.coverImageUrl ?? collection.videos[0]?.thumbnailUrl ?? null,
      dateIso: date.toISOString(),
      videos: collection.videos.map(mapVideoEmbedItem),
    };
  }

  const single = await withDatabaseFallback(
    () =>
      prisma.videoItem.findFirst({
        where: {
          slug,
          videoCollection: {
            isPublished: true,
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          platform: true,
          videoUrl: true,
          thumbnailUrl: true,
          durationSeconds: true,
          publishedAt: true,
          createdAt: true,
          videoCollection: {
            select: {
              id: true,
              slug: true,
              title: true,
              coverImageUrl: true,
              isPublished: true,
            },
          },
        },
      }),
    null as VideoSingleRecord | null,
  );

  if (!single || !single.videoCollection.isPublished) return null;

  const publishedAt = single.publishedAt ?? single.createdAt;
  return {
    kind: "single",
    id: single.id,
    slug: single.slug,
    title: single.title,
    description: single.description,
    coverImageUrl: single.thumbnailUrl ?? single.videoCollection.coverImageUrl,
    dateIso: publishedAt.toISOString(),
    video: {
      id: single.id,
      slug: single.slug,
      title: single.title,
      youtubeId: extractYouTubeVideoId(single.videoUrl),
      type: inferYouTubeVideoType(single.videoUrl),
      description: single.description,
      platform: single.platform,
      videoUrl: single.videoUrl,
      embedUrl: resolveVideoEmbedUrl(single.platform, single.videoUrl),
      thumbnailUrl: single.thumbnailUrl,
      durationSeconds: single.durationSeconds,
      publishedAtIso: single.publishedAt ? single.publishedAt.toISOString() : null,
    },
    collection: {
      slug: single.videoCollection.slug,
      title: single.videoCollection.title,
    },
  };
}
