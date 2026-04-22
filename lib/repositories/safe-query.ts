import { Prisma } from "@/app/generated/prisma/client";

const recoverablePrismaErrorCodes = new Set(["P1001", "P2021", "P2022"]);

export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      recoverablePrismaErrorCodes.has(error.code)
    ) {
      return fallback;
    }

    throw error;
  }
}
