import { prisma } from "@/lib/db";
import { withDatabaseFallback } from "@/lib/repositories/safe-query";
import { searchSitePages } from "@/lib/search/pages";
import type { HeaderSearchResult, SearchProductResult } from "@/lib/search/types";
import { normalizeSearchTerm } from "@/lib/utils";

const DEFAULT_RESULT_LIMIT = 6;

function decimalToString(value: number | string | { toString(): string } | null): string {
  if (value === null) return "0";
  return typeof value === "string" ? value : value.toString();
}

export async function searchHeaderContent(
  rawQuery: string,
  options?: { limit?: number },
): Promise<HeaderSearchResult> {
  const limit = options?.limit ?? DEFAULT_RESULT_LIMIT;
  const query = normalizeSearchTerm(rawQuery);
  const pages = searchSitePages(query, limit);

  const productsRaw = await withDatabaseFallback(
    () =>
      prisma.product.findMany({
        where: query
          ? {
              isPublished: true,
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { has: query } },
              ],
            }
          : {
              isPublished: true,
              isFeatured: true,
            },
        orderBy: query ? [{ updatedAt: "desc" }] : [{ updatedAt: "desc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          currency: true,
          images: {
            select: {
              imageUrl: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      }),
    [] as Array<{
      id: string;
      name: string;
      slug: string;
      basePrice: { toString(): string } | string | number;
      currency: string;
      images: Array<{
        imageUrl: string;
      }>;
    }>,
  );

  const products: SearchProductResult[] = productsRaw.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice: decimalToString(product.basePrice),
    currency: product.currency,
    coverImageUrl: product.images[0]?.imageUrl ?? null,
  }));

  return {
    pages,
    products,
  };
}

