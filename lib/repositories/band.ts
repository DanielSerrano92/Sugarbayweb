import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getBiographySectionImage } from "@/lib/band/content";
import { parseBandNewsFilters, toDateRange } from "@/lib/band/filters";
import type {
  BandBiographySectionView,
  BandMemberLink,
  BandMemberView,
  BandMembersDirectory,
  BandNewsCatalogResult,
  BandNewsItemView,
  BandNewsQueryParams,
} from "@/lib/band/types";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";

const BAND_NEWS_PAGE_SIZE = 6;
const NEWS_IMAGE_OVERRIDES: Record<string, string> = {
  "sugarbay-anuncia-single-y-fecha-madrid":
    "https://ik.imagekit.io/gq1enkszp/fotos/noticia.png",
};
const MIDNIGHT_FREQUENCY_SONG_SLUG = "midnight-frequency";
const NEWS_SINGLE_CARD_SLUG = "sugarbay-anuncia-single-y-fecha-madrid";
const DISCOMANIACS_NEWS_SLUG = "estreno-video-discomaniacs-mitch-bucano-johnny-funk-feat-wazoo";

type NewsRecord = Prisma.NewsGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    summary: true;
    content: true;
    publishedAt: true;
    createdAt: true;
    coverImageUrl: true;
    tags: true;
  };
}>;

type BiographySectionRecord = Prisma.BiographySectionGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    content: true;
  };
}>;

type BandMemberRecord = Prisma.BandMemberGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    roleTitle: true;
    bio: true;
    avatarUrl: true;
    memberType: true;
    socialLinks: true;
  };
}>;

function parseMemberLinks(value: Prisma.JsonValue | null): BandMemberLink[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  const entries = Object.entries(value as Record<string, unknown>);
  return entries
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([key, url]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      url,
    }))
    .filter((entry) => entry.url.startsWith("http"));
}

function mapBandMember(record: BandMemberRecord): BandMemberView {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    roleTitle: record.roleTitle,
    bio: record.bio ?? "Proximamente mas informacion sobre este integrante.",
    avatarUrl: record.avatarUrl,
    memberType: record.memberType,
    links: parseMemberLinks(record.socialLinks),
  };
}

function mapBandNews(record: NewsRecord): BandNewsItemView {
  const publishedAt = record.publishedAt ?? record.createdAt;

  const relatedLinks = [
    ...record.tags
      .slice(0, 2)
      .filter((tag) => tag.trim().toLowerCase() !== "tour")
      .filter((tag) =>
        !(record.slug === NEWS_SINGLE_CARD_SLUG && tag.trim().toLowerCase() === "single")
      )
      .filter((tag) =>
        !(record.slug === DISCOMANIACS_NEWS_SLUG && tag.trim().toLowerCase() === "estreno")
      )
      .filter((tag) =>
        !(record.slug === DISCOMANIACS_NEWS_SLUG && tag.trim().toLowerCase() === "video")
      )
      .map((tag) => {
        if (record.slug === NEWS_SINGLE_CARD_SLUG && tag.trim().toLowerCase() === "single") {
          return {
            label: "VER MAS SOBRE ESTE SINGLE",
            href: `/musica?type=song&song=${encodeURIComponent(MIDNIGHT_FREQUENCY_SONG_SLUG)}`,
          };
        }

        return {
          label: `Mas sobre ${tag}`,
          href: `/band/news?tag=${encodeURIComponent(tag)}`,
        };
      }),
  ];

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary ?? record.content.slice(0, 160),
    content: record.content,
    publishedAtIso: publishedAt.toISOString(),
    imageUrl: NEWS_IMAGE_OVERRIDES[record.slug] ?? record.coverImageUrl,
    tags: record.tags,
    relatedLinks,
  };
}

function normalizePage(totalPages: number, requestedPage: number): number {
  if (totalPages <= 1) return 1;
  return Math.min(Math.max(1, requestedPage), totalPages);
}

export async function getBandNewsCatalog(
  params: BandNewsQueryParams,
): Promise<BandNewsCatalogResult> {
  const filters = parseBandNewsFilters(params);
  const dateRange = toDateRange({ from: filters.from, to: filters.to });

  const where: Prisma.NewsWhereInput = {
    status: "PUBLISHED",
  };

  if (dateRange.from || dateRange.to) {
    where.publishedAt = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }

  if (filters.tag) {
    where.tags = {
      has: filters.tag,
    };
  }

  const totalItems = await withDatabaseFallback(
    () =>
      prisma.news.count({
        where,
      }),
    0,
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / BAND_NEWS_PAGE_SIZE));
  const page = normalizePage(totalPages, filters.page);
  const skip = (page - 1) * BAND_NEWS_PAGE_SIZE;

  const records = await withDatabaseFallback(
    () =>
      prisma.news.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: BAND_NEWS_PAGE_SIZE,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          content: true,
          publishedAt: true,
          createdAt: true,
          coverImageUrl: true,
          tags: true,
        },
      }),
    [] as NewsRecord[],
  );

  return {
    filters: {
      ...filters,
      page,
    },
    items: records.map(mapBandNews),
    totalItems,
    totalPages,
    pageSize: BAND_NEWS_PAGE_SIZE,
  };
}

export async function getBandBiographySections(): Promise<BandBiographySectionView[]> {
  const sections = await withDatabaseFallback(
    () =>
      prisma.biographySection.findMany({
        where: {
          isPublished: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          content: true,
        },
      }),
    [] as BiographySectionRecord[],
  );

  return sections.map((section) => ({
    id: section.id,
    slug: section.slug,
    title: section.title,
    content: section.content,
    imageUrl: getBiographySectionImage(section.slug),
    anchorId: `bio-section-${section.slug}`,
  }));
}

export async function getBandMembersDirectory(): Promise<BandMembersDirectory> {
  const records = await withDatabaseFallback(
    () =>
      prisma.bandMember.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ memberType: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          roleTitle: true,
          bio: true,
          avatarUrl: true,
          memberType: true,
          socialLinks: true,
        },
      }),
    [] as BandMemberRecord[],
  );

  const mapped = records.map(mapBandMember);

  return {
    bandMembers: mapped.filter((member) => member.memberType === "CORE"),
    collaborators: mapped.filter((member) => member.memberType === "COLLABORATOR"),
  };
}
