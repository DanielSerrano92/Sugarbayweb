import type { ProductType } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";
import { getQuickSearchPages, searchSitePages } from "@/lib/search/pages";
import type {
  HeaderSearchResult,
  SearchMenuResult,
  SearchPageResult,
} from "@/lib/search/types";
import { formatCurrency, formatDate, normalizeSearchTerm } from "@/lib/utils";

const DEFAULT_RESULT_LIMIT = 120;
const CONCERTS_PAGE_SIZE = 6;
const NEWS_PAGE_SIZE = 6;

type ScoredResult = {
  item: SearchMenuResult;
  score: number;
};

function decimalToString(value: number | string | { toString(): string } | null): string {
  if (value === null) return "0";
  return typeof value === "string" ? value : value.toString();
}

function scoreCandidate(
  normalizedQuery: string,
  normalizedValue: string,
  weight: number,
): number {
  if (!normalizedValue) return -1;
  const index = normalizedValue.indexOf(normalizedQuery);
  if (index < 0) return -1;

  if (normalizedValue === normalizedQuery) return weight * 10_000 + 500;
  if (normalizedValue.startsWith(normalizedQuery)) return weight * 10_000 + 250;
  return weight * 10_000 - index;
}

function scoreByFields(
  normalizedQuery: string,
  fields: Array<{ value: string | null | undefined; weight: number }>,
): number {
  let best = -1;
  for (const field of fields) {
    const score = scoreCandidate(
      normalizedQuery,
      normalizeSearchTerm(field.value),
      field.weight,
    );
    if (score > best) {
      best = score;
    }
  }
  return best;
}

function sortScoredItems(items: ScoredResult[]): SearchMenuResult[] {
  return items
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .map(({ item }) => item);
}

function buildPageResultItems(
  pages: SearchPageResult[],
): ScoredResult[] {
  return pages.map((page, index) => ({
    score: 8_000 - index,
    item: {
      id: page.id,
      type: "page",
      title: page.title,
      href: page.href,
      description: page.description,
      categoryLabel: "Pagina",
      imageUrl: null,
      price: null,
    },
  }));
}

function buildConcertHref(period: "upcoming" | "past", page: number, slug: string): string {
  const path = period === "upcoming" ? "/concerts/upcoming" : "/concerts/past";
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  params.set("concert", slug);
  return `${path}?${params.toString()}`;
}

function buildNewsHref(page: number, slug: string): string {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  params.set("news", slug);
  return `/band/news?${params.toString()}`;
}

function productTypeLabel(productType: ProductType): string {
  if (productType === "MEDIA") return "Tienda - Media";
  if (productType === "APPAREL") return "Tienda - Ropa";
  return "Tienda - Accesorios";
}

function buildProductDescription(params: {
  productType: ProductType;
  categoryName: string;
  parentCategoryName: string | null;
}): string {
  const categoryPath = params.parentCategoryName
    ? `${params.parentCategoryName} / ${params.categoryName}`
    : params.categoryName;
  return `${productTypeLabel(params.productType)} - ${categoryPath}`;
}

export async function searchHeaderContent(
  rawQuery: string,
  options?: { limit?: number },
): Promise<HeaderSearchResult> {
  const limit = Math.max(1, options?.limit ?? DEFAULT_RESULT_LIMIT);
  const query = normalizeSearchTerm(rawQuery);
  const quickLinks = getQuickSearchPages();

  if (!query) {
    return {
      quickLinks,
      items: [],
    };
  }

  const now = new Date();
  const [
    upcomingConcerts,
    pastConcerts,
    newsItems,
    releases,
    photoAlbums,
    videoCollections,
    products,
    pageMatches,
  ] = await Promise.all([
    withDatabaseFallback(
      () =>
        prisma.concert.findMany({
          where: {
            startsAt: {
              gte: now,
            },
          },
          orderBy: [{ startsAt: "asc" }, { city: "asc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            startsAt: true,
            venueName: true,
            venueAddress: true,
            city: true,
            country: true,
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        startsAt: Date;
        venueName: string;
        venueAddress: string | null;
        city: string;
        country: string;
      }>,
    ),
    withDatabaseFallback(
      () =>
        prisma.concert.findMany({
          where: {
            startsAt: {
              lt: now,
            },
          },
          orderBy: [{ startsAt: "desc" }, { city: "asc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            startsAt: true,
            venueName: true,
            venueAddress: true,
            city: true,
            country: true,
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        startsAt: Date;
        venueName: string;
        venueAddress: string | null;
        city: string;
        country: string;
      }>,
    ),
    withDatabaseFallback(
      () =>
        prisma.news.findMany({
          where: {
            status: "PUBLISHED",
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            content: true,
            tags: true,
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        summary: string | null;
        content: string;
        tags: string[];
      }>,
    ),
    withDatabaseFallback(
      () =>
        prisma.musicRelease.findMany({
          where: {
            isPublished: true,
          },
          orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            releaseDate: true,
            tracks: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
              orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }, { title: "asc" }],
            },
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        releaseDate: Date;
        tracks: Array<{
          id: string;
          slug: string;
          title: string;
        }>;
      }>,
    ),
    withDatabaseFallback(
      () =>
        prisma.photoAlbum.findMany({
          where: {
            isPublished: true,
          },
          orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            coverImageUrl: true,
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        coverImageUrl: string | null;
      }>,
    ),
    withDatabaseFallback(
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
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        coverImageUrl: string | null;
      }>,
    ),
    withDatabaseFallback(
      () =>
        prisma.product.findMany({
          where: {
            isPublished: true,
          },
          orderBy: [{ updatedAt: "desc" }],
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            basePrice: true,
            currency: true,
            productType: true,
            tags: true,
            category: {
              select: {
                name: true,
                parent: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            images: {
              select: {
                imageUrl: true,
                isPrimary: true,
                sortOrder: true,
              },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
            },
          },
        }),
      [] as Array<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        basePrice: string | number | { toString(): string };
        currency: string;
        productType: ProductType;
        tags: string[];
        category: {
          name: string;
          parent: {
            name: string;
          } | null;
        };
        images: Array<{
          imageUrl: string;
        }>;
      }>,
    ),
    Promise.resolve(searchSitePages(query, Math.max(limit, 24))),
  ]);

  const scored: ScoredResult[] = [...buildPageResultItems(pageMatches)];

  upcomingConcerts.forEach((concert, index) => {
    const eventDateIso = concert.startsAt.toISOString().slice(0, 10);
    const eventDateLabel = formatDate(concert.startsAt, "es-ES");
    const score = scoreByFields(query, [
      { value: concert.title, weight: 9 },
      { value: concert.venueName, weight: 8 },
      { value: concert.city, weight: 7 },
      { value: concert.venueAddress, weight: 6 },
      { value: concert.description, weight: 5 },
      { value: eventDateIso, weight: 4 },
      { value: eventDateLabel, weight: 3 },
      { value: concert.slug, weight: 2 },
    ]);

    if (score < 0) return;
    const page = Math.floor(index / CONCERTS_PAGE_SIZE) + 1;

    scored.push({
      score,
      item: {
        id: concert.id,
        type: "concert-upcoming",
        title: concert.title,
        href: buildConcertHref("upcoming", page, concert.slug),
        description: `${concert.venueName} - ${concert.city}, ${concert.country}`,
        categoryLabel: "Concierto",
        imageUrl: null,
        price: null,
      },
    });
  });

  pastConcerts.forEach((concert, index) => {
    const eventDateIso = concert.startsAt.toISOString().slice(0, 10);
    const eventDateLabel = formatDate(concert.startsAt, "es-ES");
    const score = scoreByFields(query, [
      { value: concert.title, weight: 9 },
      { value: concert.venueName, weight: 8 },
      { value: concert.city, weight: 7 },
      { value: concert.venueAddress, weight: 6 },
      { value: concert.description, weight: 5 },
      { value: eventDateIso, weight: 4 },
      { value: eventDateLabel, weight: 3 },
      { value: concert.slug, weight: 2 },
    ]);

    if (score < 0) return;
    const page = Math.floor(index / CONCERTS_PAGE_SIZE) + 1;

    scored.push({
      score,
      item: {
        id: concert.id,
        type: "concert-past",
        title: concert.title,
        href: buildConcertHref("past", page, concert.slug),
        description: `${concert.venueName} - ${concert.city}, ${concert.country}`,
        categoryLabel: "Concierto",
        imageUrl: null,
        price: null,
      },
    });
  });

  newsItems.forEach((news, index) => {
    const score = scoreByFields(query, [
      { value: news.title, weight: 9 },
      { value: news.summary, weight: 7 },
      { value: news.content, weight: 5 },
      { value: news.tags.join(" "), weight: 4 },
      { value: news.slug, weight: 2 },
    ]);

    if (score < 0) return;
    const page = Math.floor(index / NEWS_PAGE_SIZE) + 1;

    scored.push({
      score,
      item: {
        id: news.id,
        type: "news",
        title: news.title,
        href: buildNewsHref(page, news.slug),
        description: news.summary ?? "Noticia oficial de la banda",
        categoryLabel: "Noticia",
        imageUrl: null,
        price: null,
      },
    });
  });

  releases.forEach((release) => {
    const albumScore = scoreByFields(query, [
      { value: release.title, weight: 9 },
      { value: release.description, weight: 6 },
      { value: release.slug, weight: 3 },
    ]);

    if (albumScore >= 0) {
      scored.push({
        score: albumScore,
        item: {
          id: release.id,
          type: "album",
          title: release.title,
          href: `/musica?album=${encodeURIComponent(release.slug)}`,
          description: `Album - ${formatDate(release.releaseDate, "es-ES")}`,
          categoryLabel: "Album",
          imageUrl: null,
          price: null,
        },
      });
    }

    release.tracks.forEach((track) => {
      const songScore = scoreByFields(query, [
        { value: track.title, weight: 9 },
        { value: release.title, weight: 5 },
        { value: track.slug, weight: 3 },
      ]);
      if (songScore < 0) return;

      scored.push({
        score: songScore,
        item: {
          id: track.id,
          type: "song",
          title: track.title,
          href: `/musica?song=${encodeURIComponent(track.slug)}`,
          description: `Cancion - ${release.title}`,
          categoryLabel: "Cancion",
          imageUrl: null,
          price: null,
        },
      });
    });
  });

  photoAlbums.forEach((album) => {
    const score = scoreByFields(query, [
      { value: album.title, weight: 9 },
      { value: album.description, weight: 6 },
      { value: album.slug, weight: 4 },
    ]);
    if (score < 0) return;

    scored.push({
      score,
      item: {
        id: album.id,
        type: "photo-collection",
        title: album.title,
        href: `/media/photos/${album.slug}`,
        description: "Coleccion de fotos",
        categoryLabel: "Fotos",
        imageUrl: album.coverImageUrl,
        price: null,
      },
    });
  });

  videoCollections.forEach((collection) => {
    const score = scoreByFields(query, [
      { value: collection.title, weight: 9 },
      { value: collection.description, weight: 6 },
      { value: collection.slug, weight: 4 },
    ]);
    if (score < 0) return;

    scored.push({
      score,
      item: {
        id: collection.id,
        type: "video-collection",
        title: collection.title,
        href: `/media/videos/${collection.slug}`,
        description: "Coleccion de videos",
        categoryLabel: "Videos",
        imageUrl: collection.coverImageUrl,
        price: null,
      },
    });
  });

  products.forEach((product) => {
    const score = scoreByFields(query, [
      { value: product.name, weight: 10 },
      { value: product.description, weight: 7 },
      { value: product.tags.join(" "), weight: 6 },
      { value: product.category.name, weight: 5 },
      { value: product.category.parent?.name, weight: 4 },
      { value: product.productType, weight: 2 },
      { value: product.slug, weight: 2 },
    ]);
    if (score < 0) return;

    scored.push({
      score,
      item: {
        id: product.id,
        type: "product",
        title: product.name,
        href: `/store/${product.slug}`,
        description: buildProductDescription({
          productType: product.productType,
          categoryName: product.category.name,
          parentCategoryName: product.category.parent?.name ?? null,
        }),
        categoryLabel: "Producto",
        imageUrl: product.images[0]?.imageUrl ?? null,
        price: formatCurrency(decimalToString(product.basePrice), product.currency),
      },
    });
  });

  const items = sortScoredItems(scored).slice(0, limit);

  return {
    quickLinks,
    items,
  };
}
