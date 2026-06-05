"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/validation";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  phone: z.string().optional().or(z.literal("")),
});

export async function updateProfile(input: {
  name: string;
  phone: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true };
}
