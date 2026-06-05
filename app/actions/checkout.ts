"use server";

import type { PaymentMethod } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { shippingFee } from "@/lib/shipping";
import { nextOrderNumber } from "@/lib/queries/orders";
import { sendOrderConfirmation } from "@/lib/email";
import {
  placeOrderSchema,
  type CouponResult,
  type PlaceOrderInput,
  type PlaceOrderResult,
} from "@/lib/validation";

export async function applyCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !coupon.isActive)
    return { ok: false, error: "Invalid coupon code." };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { ok: false, error: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { ok: false, error: "This coupon has reached its usage limit." };
  if (coupon.minOrderAmount != null && subtotal < Number(coupon.minOrderAmount))
    return {
      ok: false,
      error: `Spend at least ৳${Number(coupon.minOrderAmount)} to use this coupon.`,
    };

  let discount =
    coupon.discountType === "PERCENTAGE"
      ? (subtotal * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);
  if (coupon.maxDiscount != null)
    discount = Math.min(discount, Number(coupon.maxDiscount));
  discount = Math.min(discount, subtotal);

  return { ok: true, code: coupon.code, discount: Math.round(discount) };
}

export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid order data." };
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in to place your order." };

  // Only COD is enabled in this build; bKash/SSLCommerz routes are scaffolded.
  if (data.paymentMethod !== "COD") {
    return {
      ok: false,
      error: "Online payment isn't enabled yet — please choose Cash on Delivery.",
    };
  }

  // Defensive: ensure the app-side User row exists for the FK.
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@placeholder.local`,
      name: (user.user_metadata?.name as string | undefined) ?? null,
      role: "CUSTOMER",
    },
  });

  // Resolve shipping address (existing or newly entered).
  let addressId = data.addressId;
  if (!addressId && data.newAddress) {
    const existing = await prisma.address.count({ where: { userId: user.id } });
    const { isDefault, postalCode, ...rest } = data.newAddress;
    const created = await prisma.address.create({
      data: {
        userId: user.id,
        ...rest,
        postalCode: postalCode || null,
        isDefault: existing === 0 || !!isDefault,
      },
    });
    addressId = created.id;
  }
  if (!addressId) return { ok: false, error: "Please provide a shipping address." };
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!address) return { ok: false, error: "Shipping address not found." };

  // Authoritative pricing + stock from the DB (never trust client prices).
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: data.items.map((i) => i.variantId) } },
    include: {
      product: { select: { name: true, basePrice: true, isActive: true } },
    },
  });
  const vmap = new Map(variants.map((v) => [v.id, v]));

  let subtotal = 0;
  const lineItems: { variantId: string; quantity: number; price: number }[] = [];
  for (const item of data.items) {
    const v = vmap.get(item.variantId);
    if (!v || !v.product.isActive)
      return { ok: false, error: "One of your items is no longer available." };
    if (item.quantity > v.stock)
      return {
        ok: false,
        error: `Only ${v.stock} left of "${v.product.name}". Please update your cart.`,
      };
    const price = v.price != null ? Number(v.price) : Number(v.product.basePrice);
    subtotal += price * item.quantity;
    lineItems.push({ variantId: v.id, quantity: item.quantity, price });
  }

  const fee = shippingFee(address.district, subtotal);

  let discount = 0;
  let couponId: string | undefined;
  if (data.couponCode) {
    const c = await applyCoupon(data.couponCode, subtotal);
    if (c.ok) {
      discount = c.discount;
      const cp = await prisma.coupon.findUnique({
        where: { code: c.code },
        select: { id: true },
      });
      couponId = cp?.id;
    }
  }

  const total = Math.max(0, subtotal + fee - discount);
  const orderNumber = await nextOrderNumber();
  const method = data.paymentMethod as PaymentMethod;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        orderNumber,
        subtotal,
        shippingFee: fee,
        discount,
        total,
        paymentMethod: method,
        paymentStatus: "PENDING",
        orderStatus: "PLACED",
        shippingAddressId: address.id,
        couponId,
        items: {
          create: lineItems.map((li) => ({
            productVariantId: li.variantId,
            quantity: li.quantity,
            priceAtPurchase: li.price,
          })),
        },
        payment: { create: { method, amount: total, status: "PENDING" } },
      },
    });

    for (const li of lineItems) {
      await tx.productVariant.update({
        where: { id: li.variantId },
        data: { stock: { decrement: li.quantity } },
      });
    }
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
    return created;
  });

  // Confirmation email — best effort, never blocks the order.
  await sendOrderConfirmation(user.email ?? "", {
    orderNumber,
    total,
    paymentMethod: method,
    customerName: address.fullName,
  });

  return { ok: true, orderId: order.id };
}
