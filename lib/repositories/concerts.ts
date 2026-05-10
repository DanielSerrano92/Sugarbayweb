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

function addDays(base: Date, days: number, hour = 0, minutes = 0): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date;
}

function getLocalFallbackConcertRecords(): ConcertRecord[] {
  const now = new Date();

  return [
    {
      id: "fallback-concert-upcoming-madrid",
      slug: "sugarbay-live-madrid-2026",
      title: "Sugarbay Live in Madrid",
      description:
        "Concierto principal del tramo espanol de la gira Summer Lights 2026.",
      startsAt: addDays(now, 45, 21, 0),
      city: "Madrid",
      country: "ES",
      venueName: "Sala Riviera",
      venueAddress: "Paseo Bajo de la Virgen del Puerto S/N",
      ticketUrl: "https://www.ticketmaster.es/search?q=Sugarbay",
      externalEventUrl: "https://www.salariviera.com",
    },
    {
      id: "fallback-concert-past-barcelona",
      slug: "sugarbay-barcelona-closing-night-2025",
      title: "Sugarbay Sunset Session Barcelona",
      description:
        "Cierre especial de temporada con setlist ampliado y cronica disponible.",
      startsAt: addDays(now, -120, 21, 0),
      city: "Barcelona",
      country: "ES",
      venueName: "Razzmatazz",
      venueAddress: "Carrer dels Almogavers 122",
      ticketUrl: null,
      externalEventUrl: "https://www.salarazzmatazz.com",
    },
  ];
}

function filterLocalConcertRecordsForBase(
  records: ConcertRecord[],
  period: ConcertPeriod,
  filters: ConcertFilters,
): ConcertRecord[] {
  const now = new Date();
  const dateRange = toDateRange({
    from: filters.from,
    to: filters.to,
  });

  return records
    .filter((concert) => {
      if (period === "upcoming") {
        const lowerBound =
          dateRange.from && dateRange.from > now ? dateRange.from : now;

        if (concert.startsAt < lowerBound) return false;
        if (dateRange.to && concert.startsAt > dateRange.to) return false;
      } else {
        const upperBound =
          dateRange.to && dateRange.to < now ? dateRange.to : now;

        if (concert.startsAt >= upperBound) return false;
        if (dateRange.from && concert.startsAt < dateRange.from) return false;
      }

      if (filters.country && concert.country !== filters.country) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      const byDate =
        period === "upcoming"
          ? left.startsAt.getTime() - right.startsAt.getTime()
          : right.startsAt.getTime() - left.startsAt.getTime();

      if (byDate !== 0) return byDate;
      return left.city.localeCompare(right.city, "es", { sensitivity: "base" });
    });
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
  const detail = getConcertExtraContent(params.concert.slug);
  const cityKey = normalizeForMatch(params.concert.city);
  const slugKey = normalizeForMatch(params.concert.slug);
  const linkedPhotoAlbum = detail?.photoAlbumSlug
    ? params.photoAlbums.find((album) => album.slug === detail.photoAlbumSlug)
    : null;

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
    photoAlbumSlug: linkedPhotoAlbum?.slug ?? null,
    photoAlbumHref: linkedPhotoAlbum
      ? `/media/photos/${linkedPhotoAlbum.slug}`
      : null,
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
            photoAlbumSlug: media.photoAlbumSlug,
            photoAlbumHref: media.photoAlbumHref,
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

export async function getConcertCatalog(
  period: ConcertPeriod,
  params: ConcertQueryParams,
): Promise<ConcertCatalogResult> {
  const requestedFilters = parseConcertFilters(params);

  const whereForList = buildBaseWhere(period, requestedFilters);
  const orderDirection = sortDirectionForPeriod(period);
  let usedDatabaseFallback = false;

  const onDatabaseFallback = () => {
    usedDatabaseFallback = true;
  };

  const [rawConcerts, photoAlbums, videoCollections] =
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
        { onFallback: onDatabaseFallback },
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
            { onFallback: onDatabaseFallback },
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
            { onFallback: onDatabaseFallback },
          )
        : Promise.resolve([] as VideoCollectionRecord[]),
    ]);

  const localFallbackRecords =
    usedDatabaseFallback && rawConcerts.length === 0
      ? getLocalFallbackConcertRecords()
      : [];

  const sourceConcerts =
    localFallbackRecords.length > 0
      ? filterLocalConcertRecordsForBase(
          localFallbackRecords,
          period,
          requestedFilters,
        )
      : rawConcerts;

  const continentFilteredConcerts =
    requestedFilters.continent === "all"
      ? sourceConcerts
      : sourceConcerts.filter(
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
  };
}
