import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryOptions } from "@/lib/queries/admin";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add Product · Admin" };

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-600 hover:underline">
        ← Products
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-semibold tracking-tight">Add product</h1>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          Create a category first in{" "}
          <Link href="/admin/categories" className="text-brand-600 hover:underline">
            Categories
          </Link>
          .
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
