"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  return dbUser?.role === "ADMIN" ? user.id : null;
}

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };
  if (!ORDER_STATUSES.includes(status))
    return { ok: false, error: "Invalid status." };
  await prisma.order.update({
    where: { id },
    data: { orderStatus: status as OrderStatus },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function updatePaymentStatus(
  id: string,
  status: string
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };
  if (!PAYMENT_STATUSES.includes(status))
    return { ok: false, error: "Invalid status." };
  await prisma.order.update({
    where: { id },
    data: {
      paymentStatus: status as PaymentStatus,
      payment: { update: { status: status as PaymentStatus } },
    },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
