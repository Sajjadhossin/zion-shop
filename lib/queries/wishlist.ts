import "server-only";
import { prisma } from "@/lib/prisma";
import type { ProductListItem } from "./products";

export async function isWishlisted(userId: string, productId: string) {
  const row = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  return !!row;
}

export async function getWishlistProducts(
  userId: string
): Promise<ProductListItem[]> {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      },
    },
  });

  return rows
    .filter((r) => r.product.isActive)
    .map((r) => {
      const p = r.product;
      const img = p.images[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.basePrice),
        gender: p.gender,
        brand: p.brand,
        isFeatured: p.isFeatured,
        image: img ? { url: img.url, alt: img.alt } : null,
        categoryName: p.category.name,
      };
    });
}
