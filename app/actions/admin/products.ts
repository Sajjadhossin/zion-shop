"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Gender, Size } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type Result = { ok: true; id: string } | { ok: false; error: string };
type SimpleResult = { ok: true } | { ok: false; error: string };

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

const productSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().nonnegative("Price must be ≥ 0"),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  categoryId: z.string().min(1, "Choose a category"),
  brand: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })),
  variants: z
    .array(
      z.object({
        size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
        color: z.string().min(1),
        stock: z.number().int().nonnegative(),
        price: z.number().nonnegative().nullable().optional(),
      })
    )
    .min(1, "Add at least one variant"),
});

type ProductInput = z.infer<typeof productSchema>;

function dedupeVariants(variants: ProductInput["variants"]) {
  const map = new Map<string, ProductInput["variants"][number]>();
  for (const v of variants) map.set(`${v.color.toLowerCase()}|${v.size}`, v);
  return [...map.values()];
}

export async function createProduct(input: ProductInput): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  const d = parsed.data;

  let slug = slugify(d.name);
  const clash = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const variants = dedupeVariants(d.variants);

  const product = await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.description,
      basePrice: d.basePrice,
      gender: d.gender as Gender,
      categoryId: d.categoryId,
      brand: d.brand || null,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      images: {
        create: d.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || null,
          order: i,
        })),
      },
      variants: {
        create: variants.map((v) => ({
          size: v.size as Size,
          color: v.color,
          sku: `${slug}-${slugify(v.color)}-${v.size}`.toUpperCase(),
          stock: v.stock,
          price: v.price ?? null,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true, id: product.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Result> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!existing) return { ok: false, error: "Product not found." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product." };
  const d = parsed.data;
  const slug = existing.slug; // keep slug stable to preserve URLs
  const variants = dedupeVariants(d.variants);

  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      description: d.description,
      basePrice: d.basePrice,
      gender: d.gender as Gender,
      categoryId: d.categoryId,
      brand: d.brand || null,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      images: {
        deleteMany: {},
        create: d.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || null,
          order: i,
        })),
      },
    },
  });

  // Upsert variants by (product, size, color); we don't delete removed ones to
  // avoid FK conflicts with existing orders — set stock to 0 to retire them.
  for (const v of variants) {
    await prisma.productVariant.upsert({
      where: {
        productId_size_color: {
          productId: id,
          size: v.size as Size,
          color: v.color,
        },
      },
      update: { stock: v.stock, price: v.price ?? null },
      create: {
        productId: id,
        size: v.size as Size,
        color: v.color,
        sku: `${slug}-${slugify(v.color)}-${v.size}`.toUpperCase(),
        stock: v.stock,
        price: v.price ?? null,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  return { ok: true, id };
}

export async function toggleProductActive(
  id: string,
  isActive: boolean
): Promise<SimpleResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<SimpleResult> {
  const adminId = await requireAdmin();
  if (!adminId) return { ok: false, error: "Not authorized." };
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { ok: true };
  } catch {
    // Likely referenced by existing orders — deactivate instead of deleting.
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/products");
    return {
      ok: false,
      error: "This product has existing orders, so it was deactivated instead.",
    };
  }
}
