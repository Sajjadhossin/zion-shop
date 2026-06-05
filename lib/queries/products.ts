import "server-only";
import { prisma } from "@/lib/prisma";
import type { Gender, Prisma, Size } from "@prisma/client";

export const PAGE_SIZE = 12;

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  gender: Gender;
  brand: string | null;
  isFeatured: boolean;
  image: { url: string; alt: string | null } | null;
  categoryName: string;
};

export type ProductFilters = {
  categorySlug?: string;
  gender?: Gender;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
};

const cardInclude = {
  category: { select: { name: true } },
  images: { orderBy: { order: "asc" as const }, take: 1 },
};

type CardRow = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

function toCard(p: CardRow): ProductListItem {
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
}

export async function getProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.gender) where.gender = filters.gender;

  if (filters.categorySlug) {
    where.category = {
      OR: [{ slug: filters.categorySlug }, { parent: { slug: filters.categorySlug } }],
    };
  }

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { brand: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.basePrice = {};
    if (filters.minPrice != null) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice != null) where.basePrice.lte = filters.maxPrice;
  }

  const variantWhere: Prisma.ProductVariantWhereInput = {};
  if (filters.sizes?.length) variantWhere.size = { in: filters.sizes as Size[] };
  if (filters.colors?.length) variantWhere.color = { in: filters.colors };
  if (Object.keys(variantWhere).length) where.variants = { some: variantWhere };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { basePrice: "asc" }
      : filters.sort === "price-desc"
        ? { basePrice: "desc" }
        : { createdAt: "desc" };

  const page = Math.max(1, filters.page ?? 1);

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: cardInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map(toCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: cardInclude,
  });
  return rows.map(toCard);
}

export async function getNewArrivals(limit = 8): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: cardInclude,
  });
  return rows.map(toCard);
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      slug: { not: excludeSlug },
      category: { OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }] },
    },
    take: limit,
    include: cardInclude,
  });
  return rows.map(toCard);
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!p) return null;

  const ratings = p.reviews.map((r) => r.rating);
  const avg = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    gender: p.gender,
    brand: p.brand,
    basePrice: Number(p.basePrice),
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      price: v.price != null ? Number(v.price) : null,
    })),
    rating: avg,
    reviewCount: ratings.length,
    reviews: p.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: r.user.name ?? "Anonymous",
      date: r.createdAt.toISOString(),
    })),
  };
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    include: {
      children: { orderBy: { name: "asc" }, select: { name: true, slug: true } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

/** Distinct sizes/colors across active variants — powers the filter sidebar. */
export async function getFilterFacets() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { isActive: true } },
    select: { size: true, color: true },
  });
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))].sort();
  const sizeOrder: Record<string, number> = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  sizes.sort((a, b) => (sizeOrder[a] ?? 99) - (sizeOrder[b] ?? 99));
  return { sizes, colors };
}

/** Build typed ProductFilters from raw URL searchParams. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>
): ProductFilters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = one(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const list = (k: string) =>
    one(k)?.split(",").filter(Boolean) ?? undefined;

  const g = one("gender");
  const gender =
    g === "MEN" || g === "WOMEN" || g === "UNISEX" ? (g as Gender) : undefined;

  const s = one("sort");
  const sort = s === "price-asc" || s === "price-desc" ? s : undefined;

  return {
    gender,
    sizes: list("sizes"),
    colors: list("colors"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    q: one("q")?.trim() || undefined,
    sort,
    page: num("page"),
  };
}

export async function getUserReview(userId: string, productId: string) {
  const r = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { rating: true, comment: true },
  });
  return r ? { rating: r.rating, comment: r.comment ?? "" } : null;
}
