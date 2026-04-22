import type { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/db";
import { normalizeSearchTerm } from "@/lib/utils";

import { getFeaturedProducts } from "./shop";
import { withDatabaseFallback } from "./safe-query";

export type ConcertScope = "proximos" | "anteriores" | "todos";

export async function getConcerts(scope: ConcertScope = "todos") {
  const now = new Date();
  const where: Prisma.ConcertWhereInput = {};

  if (scope === "proximos") {
    where.startsAt = { gte: now };
  }

  if (scope === "anteriores") {
    where.startsAt = { lt: now };
  }

  return withDatabaseFallback(
    () =>
      prisma.concert.findMany({
        where,
        orderBy: [
          {
            startsAt: scope === "anteriores" ? "desc" : "asc",
          },
        ],
      }),
    [],
  );
}

export async function getNewsArticles(options?: {
  query?: string;
  tag?: string;
}) {
  const normalizedQuery = normalizeSearchTerm(options?.query);
  const normalizedTag = normalizeSearchTerm(options?.tag);

  const where: Prisma.NewsWhereInput = {
    status: "PUBLISHED",
  };

  if (normalizedTag) {
    where.tags = { has: normalizedTag };
  }

  if (normalizedQuery) {
    where.OR = [
      { title: { contains: normalizedQuery, mode: "insensitive" } },
      { summary: { contains: normalizedQuery, mode: "insensitive" } },
      { content: { contains: normalizedQuery, mode: "insensitive" } },
    ];
  }

  return withDatabaseFallback(
    () =>
      prisma.news.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getBandMembers() {
  return withDatabaseFallback(
    () =>
      prisma.bandMember.findMany({
        orderBy: [{ memberType: "asc" }, { sortOrder: "asc" }],
      }),
    [],
  );
}

export async function getHomeSnapshot() {
  const [upcomingConcerts, news, featuredProducts] = await Promise.all([
    withDatabaseFallback(
      () =>
        prisma.concert.findMany({
          where: {
            startsAt: {
              gte: new Date(),
            },
          },
          orderBy: [{ startsAt: "asc" }],
          take: 3,
        }),
      [],
    ),
    withDatabaseFallback(
      () =>
        prisma.news.findMany({
          where: {
            status: "PUBLISHED",
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 3,
        }),
      [],
    ),
    getFeaturedProducts(4),
  ]);

  return {
    upcomingConcerts,
    news,
    featuredProducts,
  };
}
