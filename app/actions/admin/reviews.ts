"use server";

import { revalidatePath } from "next/cache";
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

export async function deleteReview(id: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
