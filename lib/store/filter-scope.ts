import {
  ROOT_STORE_CATEGORIES,
  type RootStoreCategory,
  type StoreCategoryTree,
  type StoreFilters,
} from "./types";

type StoreScopeInput = {
  category?: string;
  subcategory?: string;
};

function normalizeSlug(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function toRootCategory(value: string | undefined): RootStoreCategory | undefined {
  if (!value) return undefined;
  return ROOT_STORE_CATEGORIES.includes(value as RootStoreCategory)
    ? (value as RootStoreCategory)
    : undefined;
}

function buildSubcategoryToRootMap(
  categories: StoreCategoryTree[],
): Map<string, RootStoreCategory> {
  const map = new Map<string, RootStoreCategory>();

  for (const category of categories) {
    const rootSlug = toRootCategory(normalizeSlug(category.slug));
    if (!rootSlug) continue;

    map.set(rootSlug, rootSlug);

    for (const child of category.children) {
      const childSlug = normalizeSlug(child.slug);
      if (!childSlug) continue;
      map.set(childSlug, rootSlug);
    }
  }

  return map;
}

export function resolveStoreCategoryScope(
  input: StoreScopeInput,
  categories: StoreCategoryTree[],
): RootStoreCategory | undefined {
  const directCategory = toRootCategory(normalizeSlug(input.category));
  if (directCategory) return directCategory;

  const normalizedSubcategory = normalizeSlug(input.subcategory);
  if (!normalizedSubcategory) return undefined;

  const subcategoryMap = buildSubcategoryToRootMap(categories);
  return subcategoryMap.get(normalizedSubcategory);
}

export function isSubcategoryInCategory(
  subcategory: string | undefined,
  category: string | undefined,
  categories: StoreCategoryTree[],
): boolean {
  const normalizedCategory = toRootCategory(normalizeSlug(category));
  const normalizedSubcategory = normalizeSlug(subcategory);
  if (!normalizedCategory || !normalizedSubcategory) return false;

  const subcategoryMap = buildSubcategoryToRootMap(categories);
  return subcategoryMap.get(normalizedSubcategory) === normalizedCategory;
}

export function normalizeStoreFiltersByScope(
  filters: StoreFilters,
  categories: StoreCategoryTree[],
): StoreFilters {
  const normalized: StoreFilters = { ...filters };
  const scopeCategory = resolveStoreCategoryScope(normalized, categories);

  if (
    normalized.category &&
    normalized.subcategory &&
    !isSubcategoryInCategory(normalized.subcategory, normalized.category, categories)
  ) {
    normalized.subcategory = undefined;
  }

  if (scopeCategory && scopeCategory !== "ropa") {
    normalized.size = undefined;
    normalized.gender = undefined;
  }

  if (scopeCategory && scopeCategory !== "media") {
    normalized.mediaType = undefined;
  }

  if (
    typeof normalized.priceMin === "number" &&
    typeof normalized.priceMax === "number" &&
    normalized.priceMin > normalized.priceMax
  ) {
    normalized.priceMax = undefined;
  }

  return normalized;
}

export function shouldShowApparelFilters(
  scopeCategory: RootStoreCategory | undefined,
): boolean {
  return !scopeCategory || scopeCategory === "ropa";
}

export function shouldShowMediaFilters(
  scopeCategory: RootStoreCategory | undefined,
): boolean {
  return !scopeCategory || scopeCategory === "media";
}

export function shouldShowAccessoryFilters(
  scopeCategory: RootStoreCategory | undefined,
): boolean {
  return !scopeCategory || scopeCategory === "accesorios";
}
