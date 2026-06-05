import { ProductCard } from "./product-card";
import type { ProductListItem } from "@/lib/queries/products";

export function ProductGrid({
  products,
  empty,
}: {
  products: ProductListItem[];
  empty?: string;
}) {
  if (!products.length) {
    return (
      <p className="py-20 text-center text-neutral-500">
        {empty ?? "No products found."}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
