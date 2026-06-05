import "server-only";
import { prisma } from "@/lib/prisma";

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAddress(userId: string, id: string) {
  return prisma.address.findFirst({ where: { id, userId } });
}
