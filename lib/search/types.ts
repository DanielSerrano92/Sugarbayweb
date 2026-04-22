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

export type SearchProductResult = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  currency: string;
  coverImageUrl: string | null;
};

export type HeaderSearchResult = {
  pages: SearchPageResult[];
  products: SearchProductResult[];
};

