import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

function hasSupportRequestDelegate(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false;

  const candidate = client as PrismaClient & { supportRequest?: unknown };
  return typeof candidate.supportRequest !== "undefined";
}

function createPrismaClient() {
  return new PrismaClient({
    adapter,
  });
}

const reusedPrisma = hasSupportRequestDelegate(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : undefined;

export const prisma = reusedPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
