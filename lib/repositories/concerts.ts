import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getConcertExtraContent } from "@/lib/concerts/content";
import { parseConcertFilters, toDateRange } from "@/lib/concerts/filters";
import {
  getContinentForCountry,
  getCountryLabel,
} from "@/lib/concerts/locations";
import type {
  ConcertCardView,
  ConcertCatalogResult,
  ConcertCountryOption,
  ConcertFilters,
  ConcertPeriod,
  ConcertQueryParams,
} from "@/lib/concerts/types";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";

const PAGE_SIZE = 6;

type ConcertRecord = Prisma.ConcertGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    startsAt: true;
    city: true;
    country: true;
    venueName: true;
    venueAddress: true;
    ticketUrl: true;
    externalEventUrl: true;
  };
}>;

type PhotoAlbumRecord = Prisma.PhotoAlbumGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    eventDate: true;
    coverImageUrl: true;
    photos: {
      select: {
        title: true;
        imageUrl: true;
      };
      orderBy: [{ sortOrder: "asc" }];
      take: 6;
    };
  };
}>;

type VideoCollectionRecord = Prisma.VideoCollectionGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    coverImageUrl: true;
    videos: {
      select: {
        title: true;
        videoUrl: true;
      };
      orderBy: [{ sortOrder: "asc" }];
      take: 6;
    };
  };
}>;

function normalizeForMatch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildGoogleMapsUrl(concert: {
  venueName: string;
  venueAddress: string | null;
  city: string;
  country: string;
}): string {
  const query = [
    concert.venueName,
    concert.venueAddress,
    concert.city,
    concert.country,
  ]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildBaseWhere(period: ConcertPeriod, filters: ConcertFilters) {
  const now = new Date();
  const dateRange = toDateRange({
    from: filters.from,
    to: filters.to,
  });

  const startsAt: Prisma.DateTimeFilter = {};

  if (period === "upcoming") {
    const lowerBound =
      dateRange.from && dateRange.from > now ? dateRange.from : now;
    startsAt.gte = lowerBound;
    if (dateRange.to) {
      startsAt.lte = dateRange.to;
    }
  } else {
    const upperBound =
      dateRange.to && dateRange.to < now ? dateRange.to : now;
    startsAt.lt = upperBound;
    if (dateRange.from) {
      startsAt.gte = dateRange.from;
    }
  }

  const where: Prisma.ConcertWhereInput = {
    startsAt,
  };

  if (filters.country) {
    where.country = filters.country;
  }

  return where;
}

function sortDirectionForPeriod(
  period: ConcertPeriod,
): Prisma.SortOrder {
  return period === "upcoming" ? "asc" : "desc";
}

function daysBetween(left: Date, right: Date): number {
  const millis = Math.abs(left.getTime() - right.getTime());
  return Math.floor(millis / (1000 * 60 * 60 * 24));
}

function pickMediaForConcert(params: {
  concert: ConcertRecord;
  photoAlbums: PhotoAlbumRecord[];
  videoCollections: VideoCollectionRecord[];
}) {
  const cityKey = normalizeForMatch(params.concert.city);
  const slugKey = normalizeForMatch(params.concert.slug);

  const matchedAlbums = params.photoAlbums
    .filter((album) => {
      const titleKey = normalizeForMatch(`${album.title} ${album.slug}`);
      const sameCity = titleKey.includes(cityKey);
      const sameTour = titleKey.includes("tour") || titleKey.includes(slugKey);
      const closeDate =
        album.eventDate &&
        daysBetween(album.eventDate, params.concert.startsAt) <= 14;

      return Boolean(sameCity || sameTour || closeDate);
    })
    .slice(0, 2);

  const matchedCollections = params.videoCollections
    .filter((collection) => {
      const titleKey = normalizeForMatch(`${collection.title} ${collection.slug}`);
      return titleKey.includes(cityKey) || titleKey.includes("live");
    })
    .slice(0, 2);

  const photos = matchedAlbums.flatMap((album) =>
    album.photos.map((photo) => ({
      title: photo.title || album.title,
      url: photo.imageUrl,
    })),
  );

  const videos = matchedCollections.flatMap((collection) =>
    collection.videos.map((video) => ({
      title: video.title,
      url: video.videoUrl,
    })),
  );

  return {
    photos,
    videos,
    venuePhotoUrl: matchedAlbums[0]?.coverImageUrl ?? null,
  };
}

function mapConcert(
  concert: ConcertRecord,
  period: ConcertPeriod,
  media: ReturnType<typeof pickMediaForConcert>,
): ConcertCardView {
  const countryCode = concert.country;
  const countryLabel = getCountryLabel(countryCode);
  const continent = getContinentForCountry(countryCode);
  const googleMapsUrl = buildGoogleMapsUrl({
    venueName: concert.venueName,
    venueAddress: concert.venueAddress,
    city: concert.city,
    country: countryCode,
  });
  const detail = getConcertExtraContent(concert.slug);
  const actionUrl = concert.ticketUrl ?? concert.externalEventUrl ?? googleMapsUrl;
  const isFree = !concert.ticketUrl;

  const commonLinks = [
    concert.ticketUrl
      ? { label: "Entradas", url: concert.ticketUrl }
      : null,
    concert.externalEventUrl
      ? { label: "Evento externo", url: concert.externalEventUrl }
      : null,
    { label: "Google Maps", url: googleMapsUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link));

  const photos = [...(detail?.photos ?? []), ...media.photos]
    .filter((item) => item.url)
    .slice(0, 8);
  const videos = [...(detail?.videos ?? []), ...media.videos]
    .filter((item) => item.url)
    .slice(0, 8);

  return {
    id: concert.id,
    slug: concert.slug,
    title: concert.title,
    description:
      concert.description ??
      "Evento oficial de Sugarbay. Consulta informacion y enlaces en el modal.",
    startsAtIso: concert.startsAt.toISOString(),
    city: concert.city,
    countryCode,
    countryLabel,
    continent,
    venueName: concert.venueName,
    locationLabel: `${concert.venueName} - ${concert.city}, ${countryLabel}`,
    googleMapsUrl,
    infoButtonLabel: "Informacion",
    actionLabel: isFree ? "Gratuito" : "Comprar",
    actionUrl,
    isFree,
    experiences:
      detail?.experiences && detail.experiences.length > 0
        ? detail.experiences
        : ["Entrada general"],
    venueDetails: {
      name: concert.venueName,
      photoUrl: detail?.venuePhotoUrl ?? media.venuePhotoUrl ?? null,
      description:
        detail?.venueDescription ??
        `Espacio de concierto en ${concert.city}, ${countryLabel}.`,
      googleMapsUrl,
      websiteUrl: detail?.venueWebsiteUrl ?? concert.externalEventUrl ?? null,
      contacts: detail?.contacts ?? [],
    },
    pastDetails:
      period === "past"
        ? {
            chronicle:
              detail?.chronicle ??
              concert.description ??
              "Concierto completado con gran respuesta del publico.",
            tracklist: detail?.tracklist ?? [],
            links: [...(detail?.extraLinks ?? []), ...commonLinks],
            photos,
            videos,
          }
        : null,
  };
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const offset = (page - 1) * pageSize;
  return items.slice(offset, offset + pageSize);
}

function normalizePage(totalPages: number, requestedPage: number): number {
  if (totalPages <= 1) return 1;
  return Math.min(Math.max(1, requestedPage), totalPages);
}

function buildCountryOptions(records: ConcertRecord[]): ConcertCountryOption[] {
  const byCountry = new Map<string, ConcertCountryOption>();

  for (const concert of records) {
    if (byCountry.has(concert.country)) continue;

    byCountry.set(concert.country, {
      code: concert.country,
      label: getCountryLabel(concert.country),
      continent: getContinentForCountry(concert.country),
    });
  }

  return Array.from(byCountry.values()).sort((left, right) =>
    left.label.localeCompare(right.label, "es", { sensitivity: "base" }),
  );
}

export async function getConcertCatalog(
  period: ConcertPeriod,
  params: ConcertQueryParams,
): Promise<ConcertCatalogResult> {
  const requestedFilters = parseConcertFilters(params);

  const whereForList = buildBaseWhere(period, requestedFilters);
  const orderDirection = sortDirectionForPeriod(period);

  const [rawConcerts, filterConcerts, photoAlbums, videoCollections] =
    await Promise.all([
      withDatabaseFallback(
        () =>
          prisma.concert.findMany({
            where: whereForList,
            orderBy: [{ startsAt: orderDirection }, { city: "asc" }],
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              startsAt: true,
              city: true,
              country: true,
              venueName: true,
              venueAddress: true,
              ticketUrl: true,
              externalEventUrl: true,
            },
          }),
        [] as ConcertRecord[],
      ),
      withDatabaseFallback(
        () =>
          prisma.concert.findMany({
            where: buildBaseWhere(period, {
              ...requestedFilters,
              country: undefined,
            }),
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              startsAt: true,
              city: true,
              country: true,
              venueName: true,
              venueAddress: true,
              ticketUrl: true,
              externalEventUrl: true,
            },
          }),
        [] as ConcertRecord[],
      ),
      period === "past"
        ? withDatabaseFallback(
            () =>
              prisma.photoAlbum.findMany({
                where: {
                  isPublished: true,
                },
                orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  eventDate: true,
                  coverImageUrl: true,
                  photos: {
                    select: {
                      title: true,
                      imageUrl: true,
                    },
                    orderBy: [{ sortOrder: "asc" }],
                    take: 6,
                  },
                },
              }),
            [] as PhotoAlbumRecord[],
          )
        : Promise.resolve([] as PhotoAlbumRecord[]),
      period === "past"
        ? withDatabaseFallback(
            () =>
              prisma.videoCollection.findMany({
                where: {
                  isPublished: true,
                },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  coverImageUrl: true,
                  videos: {
                    select: {
                      title: true,
                      videoUrl: true,
                    },
                    orderBy: [{ sortOrder: "asc" }],
                    take: 6,
                  },
                },
              }),
            [] as VideoCollectionRecord[],
          )
        : Promise.resolve([] as VideoCollectionRecord[]),
    ]);

  const continentFilteredConcerts =
    requestedFilters.continent === "all"
      ? rawConcerts
      : rawConcerts.filter(
          (concert) =>
            getContinentForCountry(concert.country) === requestedFilters.continent,
        );

  const mappedConcerts = continentFilteredConcerts.map((concert) =>
    mapConcert(
      concert,
      period,
      pickMediaForConcert({
        concert,
        photoAlbums,
        videoCollections,
      }),
    ),
  );

  const totalItems = mappedConcerts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const page = normalizePage(totalPages, requestedFilters.page);
  const concerts = paginate(mappedConcerts, page, PAGE_SIZE);

  const availableCountries = buildCountryOptions(filterConcerts).filter((option) =>
    requestedFilters.continent === "all"
      ? true
      : option.continent === requestedFilters.continent,
  );

  return {
    period,
    filters: {
      ...requestedFilters,
      page,
    },
    concerts,
    totalItems,
    totalPages,
    pageSize: PAGE_SIZE,
    availableCountries,
  };
}
