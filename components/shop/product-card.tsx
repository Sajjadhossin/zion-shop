import Link from "next/link";
import { ProductImage } from "./product-image";
import { formatBDT } from "@/lib/utils";
import type { ProductListItem } from "@/lib/queries/products";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
        <ProductImage
          src={product.image?.url}
          alt={product.image?.alt ?? product.name}
          label={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          {product.categoryName}
        </p>
        <h3 className="line-clamp-1 text-sm font-medium text-neutral-900 group-hover:text-brand-600">
          {product.name}
        </h3>
        <p className="text-sm font-semibold">{formatBDT(product.price)}</p>
      </div>
    </Link>
  );
}
