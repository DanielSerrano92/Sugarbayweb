import { VariantSize } from "@/app/generated/prisma/client";

import {
  APPAREL_GENDERS,
  MEDIA_TYPES,
  ROOT_STORE_CATEGORIES,
  STORE_SORT_OPTIONS,
  type StoreFilters,
  type StoreQueryParams,
} from "./types";

const DEFAULT_PAGE = 1;
const DEFAULT_SORT = "newest";
const MIN_PRICE = 0;
const MAX_PAGE_SIZE = 12;

function pickFirstString(value: string | string[] | undefined): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  const trimmed = candidate?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const numericValue = Number.parseInt(value, 10);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
}

function parsePrice(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const numericValue = Number.parseFloat(value);
  if (!Number.isFinite(numericValue)) return undefined;
  return Math.max(MIN_PRICE, numericValue);
}

function parseEnumValue<T extends readonly string[]>(
  value: string | undefined,
  options: T,
): T[number] | undefined {
  if (!value) return undefined;
  return (options as readonly string[]).includes(value)
    ? (value as T[number])
    : undefined;
}

export function getStorePageSize(): number {
  return MAX_PAGE_SIZE;
}

export function parseStoreFilters(params: StoreQueryParams): StoreFilters {
  const sortValues = STORE_SORT_OPTIONS.map((option) => option.value);
  const sizeValue = pickFirstString(params.size);
  const variantSizes = Object.values(VariantSize);

  const category = parseEnumValue(
    pickFirstString(params.category),
    ROOT_STORE_CATEGORIES,
  );
  const subcategory = pickFirstString(params.subcategory);
  const size =
    sizeValue && variantSizes.includes(sizeValue as VariantSize)
      ? (sizeValue as VariantSize)
      : undefined;
  const gender = parseEnumValue(
    pickFirstString(params.gender),
    APPAREL_GENDERS,
  );
  const mediaType = parseEnumValue(
    pickFirstString(params.mediaType),
    MEDIA_TYPES,
  );
  const priceMin = parsePrice(pickFirstString(params.minPrice));
  const priceMax = parsePrice(pickFirstString(params.maxPrice));
  const page = parsePositiveInteger(pickFirstString(params.page), DEFAULT_PAGE);
  const sort = parseEnumValue(pickFirstString(params.sort), sortValues) ?? DEFAULT_SORT;

  return {
    category,
    subcategory,
    priceMin,
    priceMax,
    size,
    gender,
    mediaType,
    sort,
    page,
  };
}

type SerializableFilterInput = Partial<StoreFilters>;

export function serializeStoreFilters(
  filters: SerializableFilterInput,
  overrides?: SerializableFilterInput,
): URLSearchParams {
  const merged = {
    ...filters,
    ...overrides,
  };

  const params = new URLSearchParams();

  if (merged.category) params.set("category", merged.category);
  if (merged.subcategory) params.set("subcategory", merged.subcategory);
  if (typeof merged.priceMin === "number") {
    params.set("minPrice", String(merged.priceMin));
  }
  if (typeof merged.priceMax === "number") {
    params.set("maxPrice", String(merged.priceMax));
  }
  if (merged.size) params.set("size", merged.size);
  if (merged.gender) params.set("gender", merged.gender);
  if (merged.mediaType) params.set("mediaType", merged.mediaType);
  if (merged.sort) params.set("sort", merged.sort);
  if (typeof merged.page === "number" && merged.page > 1) {
    params.set("page", String(merged.page));
  }

  return params;
}
