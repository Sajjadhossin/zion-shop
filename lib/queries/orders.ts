import "server-only";
import { prisma } from "@/lib/prisma";

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
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
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    address: order.shippingAddress,
    items: order.items.map((it) => ({
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

/** Sequential, human-friendly order number e.g. ZION-000042. */
export async function nextOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  return `ZION-${String(count + 1).padStart(6, "0")}`;
}

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    total: Number(o.total),
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    itemCount: o._count.items,
    createdAt: o.createdAt.toISOString(),
  }));
}
