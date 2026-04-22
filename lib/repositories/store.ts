import type { Prisma, VariantSize } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";
import {
  getStorePageSize,
  parseStoreFilters,
} from "@/lib/store/filters";
import {
  MEDIA_TYPES,
  type ApparelGenderFilter,
  type MediaTypeFilter,
  type StoreCatalogResult,
  type StoreCategoryTree,
  type StoreFilters,
  type StoreProductCard,
  type StoreProductDetail,
  type StoreQueryParams,
} from "@/lib/store/types";

function decimalToNumber(value: Prisma.Decimal | number | string | null): number {
  if (value === null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().toLowerCase()
    : undefined;
}

function normalizeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function readMetadataObject(value: Prisma.JsonValue | null): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function inferMediaType(
  tags: string[],
  metadata: Prisma.JsonValue | null,
): MediaTypeFilter | null {
  const metadataObject = readMetadataObject(metadata);
  const metadataValue = normalizeString(metadataObject.mediaType);
  if (metadataValue && MEDIA_TYPES.includes(metadataValue as MediaTypeFilter)) {
    return metadataValue as MediaTypeFilter;
  }

  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  if (normalizedTags.includes("cd")) return "cd";
  if (normalizedTags.includes("vinyl") || normalizedTags.includes("vinilo")) {
    return "vinilo";
  }
  if (normalizedTags.includes("pelicula")) return "pelicula";
  if (normalizedTags.includes("libro")) return "libro";
  return null;
}

function inferGender(
  tags: string[],
  metadata: Prisma.JsonValue | null,
): ApparelGenderFilter | null {
  const metadataObject = readMetadataObject(metadata);
  const metadataValue = normalizeString(metadataObject.gender);
  if (
    metadataValue === "hombre" ||
    metadataValue === "mujer" ||
    metadataValue === "unisex"
  ) {
    return metadataValue;
  }

  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  if (normalizedTags.includes("hombre")) return "hombre";
  if (normalizedTags.includes("mujer")) return "mujer";
  if (normalizedTags.includes("unisex")) return "unisex";
  return null;
}

function extractTracklist(metadata: Prisma.JsonValue | null): string[] {
  const metadataObject = readMetadataObject(metadata);
  return normalizeStringArray(metadataObject.tracklist);
}

function extractLinerNotes(metadata: Prisma.JsonValue | null): string | null {
  const metadataObject = readMetadataObject(metadata);
  const value = metadataObject.linerNotes;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

type ProductCardRecord = Prisma.ProductGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    description: true;
    productType: true;
    basePrice: true;
    compareAtPrice: true;
    currency: true;
    tags: true;
    metadata: true;
    createdAt: true;
    category: {
      select: {
        slug: true;
        name: true;
        parent: {
          select: {
            slug: true;
          };
        };
      };
    };
    images: {
      select: {
        imageUrl: true;
        isPrimary: true;
        sortOrder: true;
      };
      orderBy: [
        { isPrimary: "desc" },
        { sortOrder: "asc" },
      ];
      take: 1;
    };
    orderItems: {
      select: {
        quantity: true;
      };
    };
    variants: {
      select: {
        size: true;
      };
      where: {
        isActive: true;
      };
    };
  };
}>;

function mapProductCard(record: ProductCardRecord): StoreProductCard {
  const totalSold = record.orderItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    productType: record.productType,
    createdAt: record.createdAt,
    price: decimalToNumber(record.basePrice),
    compareAtPrice: record.compareAtPrice
      ? decimalToNumber(record.compareAtPrice)
      : null,
    currency: record.currency,
    category: {
      slug: record.category.slug,
      name: record.category.name,
      parentSlug: record.category.parent?.slug ?? null,
    },
    coverImageUrl: record.images[0]?.imageUrl ?? null,
    totalSold,
  };
}

function filterByAdvancedRules(
  products: ProductCardRecord[],
  filters: StoreFilters,
): ProductCardRecord[] {
  return products.filter((product) => {
    if (filters.gender) {
      if (product.productType !== "APPAREL") return false;
      const gender = inferGender(product.tags, product.metadata);
      if (gender !== filters.gender) return false;
    }

    if (filters.mediaType) {
      if (product.productType !== "MEDIA") return false;
      const mediaType = inferMediaType(product.tags, product.metadata);
      if (mediaType !== filters.mediaType) return false;
    }

    return true;
  });
}

function sortProducts(products: StoreProductCard[], sort: StoreFilters["sort"]) {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
      break;
    case "oldest":
      sorted.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime() ||
          a.name.localeCompare(b.name),
      );
      break;
    case "best-selling":
      sorted.sort(
        (a, b) => b.totalSold - a.totalSold || a.name.localeCompare(b.name),
      );
      break;
    case "newest":
      sorted.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime() ||
          a.name.localeCompare(b.name),
      );
      break;
    default:
      break;
  }

  return sorted;
}

export async function getStoreCategories(): Promise<StoreCategoryTree[]> {
  const records = await withDatabaseFallback(
    () =>
      prisma.productCategory.findMany({
        where: {
          isActive: true,
          parent: {
            slug: "tienda",
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          children: {
            where: {
              isActive: true,
            },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    [] as Array<
      Prisma.ProductCategoryGetPayload<{
        include: {
          children: {
            select: {
              id: true;
              name: true;
              slug: true;
            };
          };
        };
      }>
    >,
  );

  return records.map((record) => ({
    id: record.id,
    name: record.name,
    slug: record.slug,
    children: record.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
    })),
  }));
}

function buildStoreWhere(filters: StoreFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isPublished: true }];

  if (filters.category && filters.subcategory) {
    and.push({
      category: {
        slug: filters.subcategory,
        parent: {
          slug: filters.category,
        },
      },
    });
  } else if (filters.category) {
    and.push({
      OR: [
        { category: { slug: filters.category } },
        {
          category: {
            parent: {
              slug: filters.category,
            },
          },
        },
      ],
    });
  } else if (filters.subcategory) {
    and.push({
      category: { slug: filters.subcategory },
    });
  }

  if (typeof filters.priceMin === "number" || typeof filters.priceMax === "number") {
    const priceFilter: Prisma.DecimalFilter<"Product"> = {};
    if (typeof filters.priceMin === "number") {
      priceFilter.gte = filters.priceMin;
    }
    if (typeof filters.priceMax === "number") {
      priceFilter.lte = filters.priceMax;
    }
    and.push({
      basePrice: priceFilter,
    });
  }

  if (filters.size) {
    and.push({
      variants: {
        some: {
          isActive: true,
          size: filters.size,
        },
      },
    });
  }

  if (filters.mediaType) {
    const mediaTag = filters.mediaType === "vinilo" ? "vinyl" : filters.mediaType;
    and.push({
      productType: "MEDIA",
    });
    and.push({
      OR: [{ tags: { has: filters.mediaType } }, { tags: { has: mediaTag } }],
    });
  }

  if (filters.gender) {
    and.push({
      productType: "APPAREL",
    });
    and.push({
      tags: {
        has: filters.gender,
      },
    });
  }

  return {
    AND: and,
  };
}

function buildOrderBy(sort: StoreFilters["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ basePrice: "asc" }, { name: "asc" }];
    case "price-desc":
      return [{ basePrice: "desc" }, { name: "asc" }];
    case "oldest":
      return [{ createdAt: "asc" }];
    case "newest":
    case "best-selling":
    default:
      return [{ createdAt: "desc" }];
  }
}

export async function getStoreCatalog(
  searchParams: StoreQueryParams,
): Promise<StoreCatalogResult> {
  const filters = parseStoreFilters(searchParams);
  const categories = await getStoreCategories();
  const where = buildStoreWhere(filters);

  const records = await withDatabaseFallback(
    () =>
      prisma.product.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          tags: true,
          metadata: true,
          createdAt: true,
          category: {
            select: {
              slug: true,
              name: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              imageUrl: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
          variants: {
            select: {
              size: true,
            },
            where: {
              isActive: true,
            },
          },
        },
        orderBy: buildOrderBy(filters.sort),
      }),
    [] as ProductCardRecord[],
  );

  const filteredRecords = filterByAdvancedRules(records, filters);
  const mapped = filteredRecords.map(mapProductCard);
  const sorted = sortProducts(mapped, filters.sort);

  const pageSize = getStorePageSize();
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(filters.page, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const products = sorted.slice(offset, offset + pageSize);

  return {
    categories,
    filters: {
      ...filters,
      page: currentPage,
    },
    products,
    totalItems,
    totalPages,
  };
}

export async function getStoreProductBySlug(
  slug: string,
): Promise<StoreProductDetail | null> {
  const record = await withDatabaseFallback(
    () =>
      prisma.product.findFirst({
        where: {
          slug,
          isPublished: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          tags: true,
          metadata: true,
          category: {
            select: {
              slug: true,
              name: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          },
          variants: {
            where: {
              isActive: true,
            },
            orderBy: [{ stock: "desc" }, { size: "asc" }],
            select: {
              id: true,
              title: true,
              size: true,
              color: true,
              stock: true,
              priceOverride: true,
              sku: true,
            },
          },
        },
      }),
    null,
  );

  if (!record) return null;

  const tracklist = extractTracklist(record.metadata);
  const linerNotes = extractLinerNotes(record.metadata);
  const mediaType = inferMediaType(record.tags, record.metadata);
  const gender = inferGender(record.tags, record.metadata);

  const variants = record.variants.map((variant) => ({
    id: variant.id,
    title: variant.title,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    price: decimalToNumber(variant.priceOverride ?? record.basePrice),
    sku: variant.sku,
  }));

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    productType: record.productType,
    price: decimalToNumber(record.basePrice),
    compareAtPrice: record.compareAtPrice
      ? decimalToNumber(record.compareAtPrice)
      : null,
    currency: record.currency,
    category: {
      slug: record.category.slug,
      name: record.category.name,
      parentSlug: record.category.parent?.slug ?? null,
    },
    images: record.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
    })),
    variants,
    tracklist,
    linerNotes,
    mediaType,
    gender,
  };
}

export async function getRelatedStoreProducts(
  categorySlug: string,
  excludeProductId: string,
  limit = 4,
): Promise<StoreProductCard[]> {
  const records = await withDatabaseFallback(
    () =>
      prisma.product.findMany({
        where: {
          isPublished: true,
          category: {
            slug: categorySlug,
          },
          id: {
            not: excludeProductId,
          },
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          tags: true,
          metadata: true,
          createdAt: true,
          category: {
            select: {
              slug: true,
              name: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              imageUrl: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
          variants: {
            select: {
              size: true,
            },
            where: {
              isActive: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: limit,
      }),
    [] as ProductCardRecord[],
  );

  return records.map(mapProductCard);
}

export async function getStoreFeaturedProducts(limit = 4): Promise<StoreProductCard[]> {
  const records = await withDatabaseFallback(
    () =>
      prisma.product.findMany({
        where: {
          isPublished: true,
          isFeatured: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          productType: true,
          basePrice: true,
          compareAtPrice: true,
          currency: true,
          tags: true,
          metadata: true,
          createdAt: true,
          category: {
            select: {
              slug: true,
              name: true,
              parent: {
                select: {
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              imageUrl: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
          variants: {
            select: {
              size: true,
            },
            where: {
              isActive: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        take: limit,
      }),
    [] as ProductCardRecord[],
  );

  return records.map(mapProductCard);
}

export function shouldShowSizeSelector(product: StoreProductDetail): boolean {
  if (product.productType !== "APPAREL") return false;
  return product.variants.some((variant) => variant.size !== "OS");
}

export function getSizeOptions(product: StoreProductDetail): VariantSize[] {
  const unique = new Set<VariantSize>();
  for (const variant of product.variants) {
    if (variant.size !== "OS") unique.add(variant.size);
  }
  return Array.from(unique.values());
}

export function isPhysicalMediaWithNotes(product: StoreProductDetail): boolean {
  return product.mediaType === "cd" || product.mediaType === "vinilo";
}
