"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { addressSchema, type AddressInput, type ActionResult } from "@/lib/validation";

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function addAddress(input: AddressInput): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please log in." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  const { isDefault, postalCode, ...rest } = parsed.data;

  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = isDefault || count === 0;

  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  await prisma.address.create({
    data: { userId, ...rest, postalCode: postalCode || null, isDefault: makeDefault },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function updateAddress(
  id: string,
  input: AddressInput
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please log in." };

  const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { ok: false, error: "Address not found." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid address." };
  const { isDefault, postalCode, ...rest } = parsed.data;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  await prisma.address.update({
    where: { id },
    data: { ...rest, postalCode: postalCode || null, isDefault: !!isDefault },
  });

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please log in." };

  const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { ok: false, error: "Address not found." };

  await prisma.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please log in." };

  const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { ok: false, error: "Address not found." };

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
  return { ok: true };
}
