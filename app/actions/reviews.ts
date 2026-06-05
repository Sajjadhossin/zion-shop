"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export async function submitReview(input: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in to write a review." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review." };
  const { productId, rating, comment } = parsed.data;

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

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) return { ok: false, error: "Product not found." };

  // Verified-purchase gate: the user must have a DELIVERED order with this product.
  const delivered = await prisma.order.findFirst({
    where: {
      userId: user.id,
      orderStatus: "DELIVERED",
      items: { some: { variant: { productId } } },
    },
    select: { id: true },
  });
  if (!delivered) {
    return {
      ok: false,
      error: "You can only review products from an order that has been delivered.",
    };
  }

  // One review per user per product — upsert lets them edit later.
  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    update: { rating, comment: comment || null },
    create: { productId, userId: user.id, rating, comment: comment || null },
  });

  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/account/reviews");
  return { ok: true };
}
