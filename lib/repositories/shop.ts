import {
  getRelatedStoreProducts,
  getStoreCategories,
  getStoreFeaturedProducts,
  getStoreProductBySlug,
  getStoreCatalog,
} from "@/lib/repositories/store";
import type {
  StoreProductCard as ShopProduct,
  StoreFilters as ShopFilters,
} from "@/lib/store/types";

export type { ShopProduct, ShopFilters };

export async function getShopCategories() {
  return getStoreCategories();
}

export async function getShopProducts(filters: Partial<ShopFilters> = {}) {
  const catalog = await getStoreCatalog({
    category: filters.category,
    subcategory: filters.subcategory,
    minPrice:
      typeof filters.priceMin === "number" ? String(filters.priceMin) : undefined,
    maxPrice:
      typeof filters.priceMax === "number" ? String(filters.priceMax) : undefined,
    size: filters.size,
    gender: filters.gender,
    mediaType: filters.mediaType,
    sort: filters.sort,
    page: filters.page ? String(filters.page) : undefined,
  });

  return catalog.products;
}

export async function getFeaturedProducts(limit = 4) {
  return getStoreFeaturedProducts(limit);
}

export async function getProductBySlug(slug: string) {
  return getStoreProductBySlug(slug);
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeProductId: string,
  limit = 4,
) {
  return getRelatedStoreProducts(categorySlug, excludeProductId, limit);
}
