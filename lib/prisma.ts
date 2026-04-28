import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 *
 * Next.js dev mode hot-reloads modules, which can spawn dozens of PrismaClient
 * instances and exhaust the database connection pool. Stashing the client on
 * `globalThis` keeps a single instance across reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
