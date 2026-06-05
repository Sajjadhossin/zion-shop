import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAdminProducts(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { brand: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const rows = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice),
    category: p.category.name,
    image: p.images[0]?.url ?? null,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    variants: p._count.variants,
    gender: p.gender,
  }));
}

export async function getAdminProduct(id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    gender: p.gender,
    categoryId: p.categoryId,
    brand: p.brand ?? "",
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
    variants: p.variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
      price: v.price != null ? Number(v.price) : null,
    })),
  };
}

export async function getCategoryOptions() {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { parent: { select: { name: true } } },
  });
  return cats.map((c) => ({
    id: c.id,
    label: c.parent ? `${c.parent.name} › ${c.name}` : c.name,
  }));
}

export async function getAllCategories() {
  const cats = await prisma.category.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    gender: c.gender,
    parentId: c.parentId,
    parentName: c.parent?.name ?? null,
    productCount: c._count.products,
    childCount: c._count.children,
  }));
}
