"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  storeName: z.string().min(1, "Store name is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  primaryColor: z.string().optional().or(z.literal("")),
  secondaryColor: z.string().optional().or(z.literal("")),
  contactEmail: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  instagramUrl: z.string().optional().or(z.literal("")),
  whatsappNumber: z.string().optional().or(z.literal("")),
});

type SettingsInput = z.infer<typeof schema>;

export async function updateStoreSettings(
  input: SettingsInput
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const data = {
    storeName: d.storeName,
    logoUrl: d.logoUrl || null,
    primaryColor: d.primaryColor || null,
    secondaryColor: d.secondaryColor || null,
    contactEmail: d.contactEmail || null,
    contactPhone: d.contactPhone || null,
    address: d.address || null,
    facebookUrl: d.facebookUrl || null,
    instagramUrl: d.instagramUrl || null,
    whatsappNumber: d.whatsappNumber || null,
  };

  const existing = await prisma.storeSettings.findFirst();
  if (existing) {
    await prisma.storeSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.storeSettings.create({ data });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}
