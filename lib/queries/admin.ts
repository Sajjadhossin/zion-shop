import "server-only";
import type { OrderStatus, PaymentMethod, Prisma } from "@prisma/client";
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

// ───────────────────────── Orders ─────────────────────────

export async function getAdminOrders(filters: {
  status?: string;
  method?: string;
  q?: string;
}) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.orderStatus = filters.status as OrderStatus;
  if (filters.method) where.paymentMethod = filters.method as PaymentMethod;
  if (filters.q) {
    where.OR = [
      { orderNumber: { contains: filters.q, mode: "insensitive" } },
      { user: { name: { contains: filters.q, mode: "insensitive" } } },
      { user: { email: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  const rows = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });
  return rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user.name ?? o.user.email,
    total: Number(o.total),
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    itemCount: o._count.items,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getAdminOrder(id: string) {
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      shippingAddress: true,
      payment: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                  slug: true,
                  images: { orderBy: { order: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.user.name ?? "—",
    customerEmail: o.user.email,
    customerPhone: o.user.phone ?? o.shippingAddress.phone,
    subtotal: Number(o.subtotal),
    shippingFee: Number(o.shippingFee),
    discount: Number(o.discount),
    total: Number(o.total),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt.toISOString(),
    address: o.shippingAddress,
    items: o.items.map((it) => ({
      id: it.id,
      name: it.variant.product.name,
      slug: it.variant.product.slug,
      image: it.variant.product.images[0]?.url ?? null,
      color: it.variant.color,
      size: it.variant.size,
      quantity: it.quantity,
      price: Number(it.priceAtPurchase),
    })),
  };
}

// ───────────────────────── Customers ─────────────────────────

export async function getAdminCustomers(q?: string) {
  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const [users, spend] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);
  const spendMap = new Map(spend.map((s) => [s.userId, Number(s._sum.total ?? 0)]));
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    orders: u._count.orders,
    spent: spendMap.get(u.id) ?? 0,
    createdAt: u.createdAt.toISOString(),
  }));
}

// ───────────────────────── Coupons ─────────────────────────

export async function getAdminCoupons() {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
    maxDiscount: c.maxDiscount != null ? Number(c.maxDiscount) : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
  }));
}

// ───────────────────────── Store settings ─────────────────────────

export async function getStoreSettingsRow() {
  const s = await prisma.storeSettings.findFirst();
  return {
    storeName: s?.storeName ?? "Zion Shop",
    logoUrl: s?.logoUrl ?? "",
    primaryColor: s?.primaryColor ?? "",
    secondaryColor: s?.secondaryColor ?? "",
    contactEmail: s?.contactEmail ?? "",
    contactPhone: s?.contactPhone ?? "",
    address: s?.address ?? "",
    facebookUrl: s?.facebookUrl ?? "",
    instagramUrl: s?.instagramUrl ?? "",
    whatsappNumber: s?.whatsappNumber ?? "",
  };
}

// ───────────────────────── Analytics ─────────────────────────

export async function getAdminAnalytics() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start30 = new Date(startToday);
  start30.setDate(start30.getDate() - 29);

  const [todayOrders, todayRevenue, newCustomers, recentPaid, statusGroups, topVariants] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startToday } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startToday }, paymentStatus: "PAID" },
      }),
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: startToday } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: start30 }, paymentStatus: "PAID" },
        select: { createdAt: true, total: true },
      }),
      prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
      prisma.orderItem.groupBy({
        by: ["productVariantId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 12,
      }),
    ]);

  // 30-day revenue series
  const days: { label: string; revenue: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30);
    d.setDate(start30.getDate() + i);
    days.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: 0,
    });
  }
  for (const o of recentPaid) {
    const idx = Math.floor(
      (o.createdAt.getTime() - start30.getTime()) / 86400000
    );
    if (idx >= 0 && idx < 30) days[idx].revenue += Number(o.total);
  }

  // Top products (roll variant sales up to product)
  const variantIds = topVariants.map((t) => t.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true, product: { select: { name: true, slug: true } } },
  });
  const vmap = new Map(variants.map((v) => [v.id, v]));
  const prodMap = new Map<string, { name: string; slug: string; qty: number }>();
  for (const t of topVariants) {
    const v = vmap.get(t.productVariantId);
    if (!v) continue;
    const cur = prodMap.get(v.productId) ?? {
      name: v.product.name,
      slug: v.product.slug,
      qty: 0,
    };
    cur.qty += t._sum.quantity ?? 0;
    prodMap.set(v.productId, cur);
  }
  const topProducts = [...prodMap.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total ?? 0),
    newCustomers,
    revenueSeries: days,
    statusDistribution: statusGroups.map((g) => ({
      status: g.orderStatus,
      count: g._count._all,
    })),
    topProducts,
  };
}
