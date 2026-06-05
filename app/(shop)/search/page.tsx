import type { Metadata } from "next";
import { Catalog } from "@/components/shop/catalog";
import { parseFilters } from "@/lib/queries/products";

export const metadata: Metadata = { title: "Search" };

type SP = Record<string, string | string[] | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const q = filters.q ?? "";

  return (
    <Catalog
      filters={filters}
      title={q ? `Results for “${q}”` : "Search"}
      description={q ? undefined : "Type in the search bar to find products."}
    />
  );
}
