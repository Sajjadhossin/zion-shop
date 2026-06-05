import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "./product-image";
import { formatBDT } from "@/lib/utils";
import type { ProductListItem } from "@/lib/queries/products";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/[0.04] transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-neutral-900/10">
        <ProductImage
          src={product.image?.url}
          alt={product.image?.alt ?? product.name}
          label={product.name}
          className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* subtle bottom scrim for legibility on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-700 backdrop-blur">
            Featured
          </span>
        )}

        {/* quick "View" affordance, slides up on hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center justify-center gap-1.5 rounded-full bg-white/95 py-2.5 text-sm font-medium text-neutral-900 backdrop-blur">
            View product <ArrowUpRight size={15} />
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="text-[11px] uppercase tracking-wide text-neutral-400">
          {product.brand || product.categoryName}
        </p>
        <h3 className="line-clamp-1 text-sm font-medium text-neutral-900 transition-colors group-hover:text-brand-600">
          {product.name}
        </h3>
        <p className="pt-0.5 text-sm font-semibold text-neutral-900">
          {formatBDT(product.price)}
        </p>
      </div>
    </Link>
  );
}
