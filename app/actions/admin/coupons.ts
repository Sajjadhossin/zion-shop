"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { DiscountType } from "@prisma/client";
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

const schema = z.object({
  code: z.string().min(2, "Code is too short"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Value must be > 0"),
  minOrderAmount: z.number().nonnegative().nullable().optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().optional().or(z.literal("")),
});

type CouponInput = z.infer<typeof schema>;

export async function createCoupon(input: CouponInput): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;
  const code = d.code.trim().toUpperCase();

  const clash = await prisma.coupon.findUnique({ where: { code }, select: { id: true } });
  if (clash) return { ok: false, error: "That code already exists." };

  await prisma.coupon.create({
    data: {
      code,
      discountType: d.discountType as DiscountType,
      discountValue: d.discountValue,
      minOrderAmount: d.minOrderAmount ?? null,
      maxDiscount: d.maxDiscount ?? null,
      usageLimit: d.usageLimit ?? null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch {
    await prisma.coupon.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/coupons");
    return {
      ok: false,
      error: "Coupon is used by existing orders, so it was deactivated instead.",
    };
  }
}
