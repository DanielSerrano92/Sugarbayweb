import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { parseMusicFilters, toDateRange } from "@/lib/music/filters";
import type {
  MusicAlbumDetail,
  MusicCatalogCard,
  MusicCatalogResult,
  MusicCredit,
  MusicExternalLink,
  MusicQueryParams,
  MusicSongDetail,
  MusicSortOption,
} from "@/lib/music/types";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";

const MUSIC_PAGE_SIZE = 8;
const ALBUM_CARD_IMAGE_OVERRIDES: Record<string, string> = {
  "neon-coastline": "https://ik.imagekit.io/gq1enkszp/fotos/album.png",
};
const SONG_CARD_IMAGE_OVERRIDES: Record<string, string> = {
  "midnight-frequency": "https://ik.imagekit.io/gq1enkszp/fotos/cancion.png",
};

type MusicReleaseRecord = Prisma.MusicReleaseGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    releaseType: true;
    description: true;
    coverImageUrl: true;
    releaseDate: true;
    labelName: true;
    catalogNumber: true;
    externalLinks: true;
    contributors: {
      select: {
        role: true;
        creditOrder: true;
        musicContributor: {
          select: {
            id: true;
            name: true;
          };
        };
      };
      orderBy: {
        creditOrder: "asc";
      };
    };
    tracks: {
      select: {
        id: true;
        slug: true;
        title: true;
        trackNumber: true;
        discNumber: true;
        durationSeconds: true;
        trackType: true;
        isrc: true;
        lyrics: true;
        audioPreviewUrl: true;
        spotifyUrl: true;
        appleMusicUrl: true;
        youtubeUrl: true;
        contributors: {
          select: {
            role: true;
            creditOrder: true;
            musicContributor: {
              select: {
                id: true;
                name: true;
              };
            };
          };
          orderBy: {
            creditOrder: "asc";
          };
        };
      };
      orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }, { title: "asc" }];
    };
  };
}>;

type SortableMusicCard = MusicCatalogCard & {
  date: Date;
};

function parseExternalLinks(value: Prisma.JsonValue | null): MusicExternalLink[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([label, url]) => ({
      label,
      url,
    }))
    .filter((entry) => entry.url.startsWith("http"));
}

function mapCredits(
  credits: Array<{
    role: MusicCredit["role"];
    musicContributor: {
      id: string;
      name: string;
    };
  }>,
): MusicCredit[] {
  return credits.map((credit) => ({
    id: credit.musicContributor.id,
    name: credit.musicContributor.name,
    role: credit.role,
  }));
}

function formatAlbumInfo(record: MusicReleaseRecord): string | null {
  const values: string[] = [];
  values.push(`Tipo: ${record.releaseType}`);
  if (record.labelName) values.push(`Sello: ${record.labelName}`);
  if (record.catalogNumber) values.push(`Catalogo: ${record.catalogNumber}`);
  return values.length > 0 ? values.join(" · ") : null;
}

function formatSongInfo(record: MusicReleaseRecord, track: MusicReleaseRecord["tracks"][number]): string | null {
  const values: string[] = [];
  values.push(`Track ${track.trackNumber}`);
  values.push(`Tipo: ${track.trackType}`);
  if (track.isrc) values.push(`ISRC: ${track.isrc}`);
  return values.join(" · ");
}

function getSheetMusicUrl(
  releaseLinks: MusicExternalLink[],
  audioPreviewUrl: string | null,
): string | null {
  const fromRelease = releaseLinks.find((entry) =>
    entry.label.toLowerCase().includes("partitura") ||
    entry.label.toLowerCase().includes("sheet"),
  );
  if (fromRelease) return fromRelease.url;

  if (audioPreviewUrl?.toLowerCase().endsWith(".pdf")) {
    return audioPreviewUrl;
  }

  return null;
}

function getSongExternalLinks(
  releaseLinks: MusicExternalLink[],
  track: MusicReleaseRecord["tracks"][number],
): MusicExternalLink[] {
  const links: MusicExternalLink[] = [];

  if (track.spotifyUrl) links.push({ label: "Spotify", url: track.spotifyUrl });
  if (track.appleMusicUrl) links.push({ label: "Apple Music", url: track.appleMusicUrl });
  if (track.youtubeUrl) links.push({ label: "YouTube", url: track.youtubeUrl });

  for (const link of releaseLinks) {
    if (!links.some((current) => current.url === link.url)) {
      links.push(link);
    }
  }

  return links;
}

function sortCards(items: SortableMusicCard[], sort: MusicSortOption): SortableMusicCard[] {
  const sorted = [...items];
  switch (sort) {
    case "oldest":
      sorted.sort(
        (left, right) => left.date.getTime() - right.date.getTime() ||
          left.title.localeCompare(right.title),
      );
      break;
    case "title-asc":
      sorted.sort(
        (left, right) => left.title.localeCompare(right.title) ||
          right.date.getTime() - left.date.getTime(),
      );
      break;
    case "title-desc":
      sorted.sort(
        (left, right) => right.title.localeCompare(left.title) ||
          right.date.getTime() - left.date.getTime(),
      );
      break;
    case "newest":
    default:
      sorted.sort(
        (left, right) => right.date.getTime() - left.date.getTime() ||
          left.title.localeCompare(right.title),
      );
      break;
  }
  return sorted;
}

export async function getMusicCatalog(
  params: MusicQueryParams,
): Promise<MusicCatalogResult> {
  const filters = parseMusicFilters(params);
  const dateRange = toDateRange({ from: filters.from, to: filters.to });

  const releases = await withDatabaseFallback(
    () =>
      prisma.musicRelease.findMany({
        where: {
          isPublished: true,
          releaseDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        orderBy: [{ releaseDate: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          releaseType: true,
          description: true,
          coverImageUrl: true,
          releaseDate: true,
          labelName: true,
          catalogNumber: true,
          externalLinks: true,
          contributors: {
            select: {
              role: true,
              creditOrder: true,
              musicContributor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              creditOrder: "asc",
            },
          },
          tracks: {
            select: {
              id: true,
              slug: true,
              title: true,
              trackNumber: true,
              discNumber: true,
              durationSeconds: true,
              trackType: true,
              isrc: true,
              lyrics: true,
              audioPreviewUrl: true,
              spotifyUrl: true,
              appleMusicUrl: true,
              youtubeUrl: true,
              contributors: {
                select: {
                  role: true,
                  creditOrder: true,
                  musicContributor: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
                orderBy: {
                  creditOrder: "asc",
                },
              },
            },
            orderBy: [{ discNumber: "asc" }, { trackNumber: "asc" }, { title: "asc" }],
          },
        },
      }),
    [] as MusicReleaseRecord[],
  );

  const albumsBySlug: Record<string, MusicAlbumDetail> = {};
  const songsBySlug: Record<string, MusicSongDetail> = {};

  const albumCards: SortableMusicCard[] = [];
  const songCards: SortableMusicCard[] = [];

  for (const release of releases) {
    const releaseLinks = parseExternalLinks(release.externalLinks);

    if (release.releaseType === "ALBUM") {
      const albumImageUrl = ALBUM_CARD_IMAGE_OVERRIDES[release.slug] ?? release.coverImageUrl;

      albumsBySlug[release.slug] = {
        id: release.id,
        slug: release.slug,
        title: release.title,
        imageUrl: albumImageUrl,
        releaseDateIso: release.releaseDate.toISOString(),
        releaseType: release.releaseType,
        info: formatAlbumInfo(release),
        linerNotes: release.description,
        credits: mapCredits(release.contributors),
        tracks: release.tracks.map((track) => ({
          id: track.id,
          slug: track.slug,
          title: track.title,
          trackNumber: track.trackNumber,
          discNumber: track.discNumber,
          durationSeconds: track.durationSeconds,
        })),
        externalLinks: releaseLinks,
      };

      albumCards.push({
        id: release.id,
        kind: "album",
        slug: release.slug,
        title: release.title,
        dateIso: release.releaseDate.toISOString(),
        imageUrl: albumImageUrl,
        date: release.releaseDate,
      });
    }

    for (const track of release.tracks) {
      const songImageUrl = SONG_CARD_IMAGE_OVERRIDES[track.slug] ?? release.coverImageUrl;

      songsBySlug[track.slug] = {
        id: track.id,
        slug: track.slug,
        title: track.title,
        imageUrl: songImageUrl,
        releaseTitle: release.title,
        releaseDateIso: release.releaseDate.toISOString(),
        durationSeconds: track.durationSeconds,
        trackType: track.trackType,
        isrc: track.isrc,
        lyrics: track.lyrics,
        sheetMusicUrl: getSheetMusicUrl(releaseLinks, track.audioPreviewUrl),
        info: formatSongInfo(release, track),
        linerNotes: release.description,
        credits: mapCredits(track.contributors),
        externalLinks: getSongExternalLinks(releaseLinks, track),
      };

      songCards.push({
        id: track.id,
        kind: "song",
        slug: track.slug,
        title: track.title,
        dateIso: release.releaseDate.toISOString(),
        imageUrl: songImageUrl,
        date: release.releaseDate,
      });
    }
  }

  const candidates =
    filters.type === "album"
      ? albumCards
      : filters.type === "song"
      ? songCards
      : [...albumCards, ...songCards];
  const sorted = sortCards(candidates, filters.sort);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / MUSIC_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const offset = (page - 1) * MUSIC_PAGE_SIZE;
  const pageItems = sorted.slice(offset, offset + MUSIC_PAGE_SIZE);

  const pageAlbumsBySlug: Record<string, MusicAlbumDetail> = {};
  const pageSongsBySlug: Record<string, MusicSongDetail> = {};
  const requiredSongSlugs = new Set<string>();

  for (const item of pageItems) {
    if (item.kind === "album") {
      const album = albumsBySlug[item.slug];
      if (!album) continue;
      pageAlbumsBySlug[item.slug] = album;
      for (const track of album.tracks) {
        requiredSongSlugs.add(track.slug);
      }
      continue;
    }

    requiredSongSlugs.add(item.slug);
  }

  for (const slug of requiredSongSlugs) {
    const song = songsBySlug[slug];
    if (song) {
      pageSongsBySlug[slug] = song;
    }
  }

  return {
    filters: {
      ...filters,
      page,
    },
    items: pageItems.map((item) => ({
      id: item.id,
      kind: item.kind,
      slug: item.slug,
      title: item.title,
      dateIso: item.dateIso,
      imageUrl:
        item.kind === "album"
          ? ALBUM_CARD_IMAGE_OVERRIDES[item.slug] ?? item.imageUrl
          : item.imageUrl,
    })),
    songsBySlug: pageSongsBySlug,
    albumsBySlug: pageAlbumsBySlug,
    totalItems,
    totalPages,
    pageSize: MUSIC_PAGE_SIZE,
  };
}

