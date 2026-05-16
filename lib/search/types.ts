export type SearchPageEntry = {
  id: string;
  title: string;
  href: string;
  description: string;
  keywords: string[];
};

export type SearchPageResult = {
  id: string;
  title: string;
  href: string;
  description: string;
};

export type SearchMenuResultType =
  | "page"
  | "concert-upcoming"
  | "concert-past"
  | "news"
  | "song"
  | "album"
  | "photo-collection"
  | "video-collection"
  | "product";

export type SearchMenuResult = {
  id: string;
  type: SearchMenuResultType;
  title: string;
  href: string;
  description: string;
  categoryLabel: string;
  imageUrl: string | null;
  price: string | null;
};

export type SearchProductRecord = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  currency: string;
  coverImageUrl: string | null;
};

export type HeaderSearchResult = {
  quickLinks: SearchPageResult[];
  items: SearchMenuResult[];
};

