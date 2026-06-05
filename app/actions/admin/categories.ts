"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Gender } from "@prisma/client";
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

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  parentId: z.string().optional().or(z.literal("")),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]).optional().or(z.literal("")),
});

type CategoryInput = z.infer<typeof schema>;

export async function createCategory(input: CategoryInput): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  let slug = slugify(d.name);
  const clash = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

  await prisma.category.create({
    data: {
      name: d.name,
      slug,
      parentId: d.parentId || null,
      gender: (d.gender || null) as Gender | null,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };

  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  if (d.parentId && d.parentId === id)
    return { ok: false, error: "A category can't be its own parent." };

  await prisma.category.update({
    where: { id },
    data: {
      name: d.name,
      parentId: d.parentId || null,
      gender: (d.gender || null) as Gender | null,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };

  const counts = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true, children: true } } },
  });
  if (!counts) return { ok: false, error: "Category not found." };
  if (counts._count.products > 0)
    return { ok: false, error: "Move or remove its products first." };
  if (counts._count.children > 0)
    return { ok: false, error: "Delete its sub-categories first." };

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}
