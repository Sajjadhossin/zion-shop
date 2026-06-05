import type { Metadata } from "next";
import { Catalog } from "@/components/shop/catalog";
import { parseFilters } from "@/lib/queries/products";

export const metadata: Metadata = { title: "All Products" };

type SP = Record<string, string | string[] | undefined>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  return <Catalog filters={parseFilters(sp)} title="All Products" />;
}
