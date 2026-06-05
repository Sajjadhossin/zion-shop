import "server-only";
import { prisma } from "@/lib/prisma";

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
}

export async function getUserReviews(userId: string) {
  const rows = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt.toISOString(),
    productName: r.product.name,
    productSlug: r.product.slug,
  }));
}

export async function getAccountCounts(userId: string) {
  const [orders, wishlist, addresses] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.wishlist.count({ where: { userId } }),
    prisma.address.count({ where: { userId } }),
  ]);
  return { orders, wishlist, addresses };
}
