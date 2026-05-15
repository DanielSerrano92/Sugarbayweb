export type ConcertPeriod = "upcoming" | "past";

export type ConcertContinent =
  | "all"
  | "africa"
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "oceania"
  | "other";

export type ConcertQueryParams = {
  page?: string | string[];
  from?: string | string[];
  to?: string | string[];
  continent?: string | string[];
  country?: string | string[];
  concert?: string | string[];
};

export type ConcertFilters = {
  page: number;
  from?: string;
  to?: string;
  continent: ConcertContinent;
  country?: string;
};

export type ConcertLink = {
  label: string;
  url: string;
};

export type ConcertMediaItem = {
  title: string;
  url: string;
};

export type ConcertVenueDetails = {
  name: string;
  photoUrl: string | null;
  description: string;
  googleMapsUrl: string;
  websiteUrl: string | null;
  contacts: ConcertLink[];
};

export type ConcertPastDetails = {
  chronicle: string;
  tracklist: string[];
  links: ConcertLink[];
  photoAlbumSlug: string | null;
  photoAlbumHref: string | null;
  photos: ConcertMediaItem[];
  videos: ConcertMediaItem[];
};

export type ConcertCardView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  startsAtIso: string;
  city: string;
  countryCode: string;
  countryLabel: string;
  continent: ConcertContinent;
  venueName: string;
  locationLabel: string;
  googleMapsUrl: string;
  infoButtonLabel: string;
  actionLabel: string;
  actionUrl: string | null;
  isFree: boolean;
  experiences: string[];
  venueDetails: ConcertVenueDetails;
  pastDetails: ConcertPastDetails | null;
};

export type ConcertCountryOption = {
  code: string;
  label: string;
  continent: Exclude<ConcertContinent, "all">;
};

export type ConcertCatalogResult = {
  period: ConcertPeriod;
  filters: ConcertFilters;
  concerts: ConcertCardView[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
};
