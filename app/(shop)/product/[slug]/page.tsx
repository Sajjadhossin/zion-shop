import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/products";
import { isWishlisted } from "@/lib/queries/wishlist";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/shop/product-gallery";
import { VariantSelector } from "@/components/shop/variant-selector";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { StarRating } from "@/components/shop/star-rating";
import { ProductGrid } from "@/components/shop/product-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [related, wishlisted] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.slug, 4),
    user ? isWishlisted(user.id, product.id) : Promise.resolve(false),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-brand-600"
        >
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand && (
            <p className="text-sm uppercase tracking-wide text-neutral-400">
              {product.brand}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <div className="mt-3">
            <StarRating value={product.rating} count={product.reviewCount} />
          </div>

          <div className="mt-6">
            <VariantSelector
              product={{
                slug: product.slug,
                name: product.name,
                image: product.images[0]?.url ?? null,
              }}
              variants={product.variants}
              basePrice={product.basePrice}
            />
          </div>

          <div className="mt-3">
            <WishlistButton productId={product.id} initial={wishlisted} />
          </div>
        </div>
      </div>

      {/* Details */}
      <section className="mt-16 max-w-3xl">
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-600">
          {product.description}
        </p>
      </section>

      {/* Reviews */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-lg font-semibold">
          Reviews ({product.reviewCount})
        </h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <ul className="mt-4 space-y-6">
            {product.reviews.map((r) => (
              <li key={r.id} className="border-b border-neutral-100 pb-6">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{r.author}</span>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm text-neutral-600">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Shipping */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-lg font-semibold">Shipping &amp; Returns</h2>
        <p className="mt-3 text-sm text-neutral-600">
          Delivery across Bangladesh in 2–5 business days. Cash on Delivery
          available. Easy 7-day returns on unworn items.
        </p>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            You might also like
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
