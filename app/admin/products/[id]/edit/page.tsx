import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct, getCategoryOptions } from "@/lib/queries/admin";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit Product · Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategoryOptions(),
  ]);
  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    description: product.description,
    basePrice: product.basePrice,
    gender: product.gender as ProductFormInitial["gender"],
    categoryId: product.categoryId,
    brand: product.brand,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    images: product.images,
    variants: product.variants.map((v) => ({
      size: v.size as ProductFormInitial["variants"][number]["size"],
      color: v.color,
      stock: v.stock,
      price: v.price,
    })),
  };

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-600 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-semibold tracking-tight">Edit product</h1>
      <ProductForm categories={categories} initial={initial} />
    </div>
  );
}
