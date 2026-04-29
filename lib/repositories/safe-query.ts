import { Prisma } from "@/app/generated/prisma/client";

const recoverablePrismaErrorCodes = new Set([
  "P1001", // Can't reach database server.
  "P1017", // Server closed the connection.
  "P2021", // Table does not exist.
  "P2022", // Column does not exist.
]);

function isRecoverablePrismaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return recoverablePrismaErrorCodes.has(error.code);
  }

  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}

export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  options?: {
    onFallback?: (error: unknown) => void;
  },
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isRecoverablePrismaError(error)) {
      options?.onFallback?.(error);
      return fallback;
    }

    throw error;
  }
}
