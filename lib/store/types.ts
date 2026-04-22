import type { ProductType, VariantSize } from "@/app/generated/prisma/client";

export const ROOT_STORE_CATEGORIES = ["ropa", "accesorios", "media"] as const;
export type RootStoreCategory = (typeof ROOT_STORE_CATEGORIES)[number];

export const MEDIA_TYPES = ["cd", "vinilo", "pelicula", "libro"] as const;
export type MediaTypeFilter = (typeof MEDIA_TYPES)[number];

export const APPAREL_GENDERS = ["hombre", "mujer", "unisex"] as const;
export type ApparelGenderFilter = (typeof APPAREL_GENDERS)[number];

export const STORE_SORT_OPTIONS = [
  {
    value: "price-asc",
    label: "Menor a mayor precio",
  },
  {
    value: "price-desc",
    label: "Mayor a menor precio",
  },
  {
    value: "newest",
    label: "Menos antiguo a mas antiguo",
  },
  {
    value: "oldest",
    label: "Mas antiguo a menos antiguo",
  },
  {
    value: "best-selling",
    label: "Mas vendido",
  },
] as const;

export type StoreSortOption = (typeof STORE_SORT_OPTIONS)[number]["value"];

export type StoreFilters = {
  category?: RootStoreCategory;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  size?: VariantSize;
  gender?: ApparelGenderFilter;
  mediaType?: MediaTypeFilter;
  sort: StoreSortOption;
  page: number;
};

export type StoreQueryParams = {
  category?: string | string[];
  subcategory?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  size?: string | string[];
  gender?: string | string[];
  mediaType?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export type StoreCategoryTree = {
  id: string;
  name: string;
  slug: string;
  children: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type StoreProductCard = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productType: ProductType;
  createdAt: Date;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  category: {
    slug: string;
    name: string;
    parentSlug: string | null;
  };
  coverImageUrl: string | null;
  totalSold: number;
};

export type StoreProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  productType: ProductType;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  category: {
    slug: string;
    name: string;
    parentSlug: string | null;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    title: string | null;
    size: VariantSize;
    color: string | null;
    stock: number;
    price: number;
    sku: string;
  }>;
  tracklist: string[];
  linerNotes: string | null;
  mediaType: MediaTypeFilter | null;
  gender: ApparelGenderFilter | null;
};

export type StoreCatalogResult = {
  categories: StoreCategoryTree[];
  filters: StoreFilters;
  products: StoreProductCard[];
  totalItems: number;
  totalPages: number;
};
