"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type WishlistResult = { wishlisted: boolean } | { needsAuth: true };

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { needsAuth: true };

  // Defensive: ensure the app-side User row exists before FK insert.
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

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { wishlisted: false };
  }

  await prisma.wishlist.create({ data: { userId: user.id, productId } });
  revalidatePath("/wishlist");
  return { wishlisted: true };
}
