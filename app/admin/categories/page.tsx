import type { Metadata } from "next";
import { getAllCategories } from "@/lib/queries/admin";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  return <CategoryManager categories={categories} />;
}
