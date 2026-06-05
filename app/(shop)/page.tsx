import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getFeaturedProducts,
  getNavCategories,
  getNewArrivals,
} from "@/lib/queries/products";
import { ProductGrid } from "@/components/shop/product-grid";

export default async function HomePage() {
  const [featured, arrivals, cats] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(4),
    getNavCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">
              New season, new you
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              Fashion that feels like home.
            </h1>
            <p className="mt-4 text-lg text-neutral-600">
              Modern styles for men and women, delivered across Bangladesh. Pay
              with bKash, SSLCommerz, or Cash on Delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Shop all <ArrowRight size={16} />
              </Link>
              <Link
                href="/category/women"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-800 hover:border-neutral-400"
              >
                Women’s collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {cats.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cats.flatMap((parent) =>
              parent.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/category/${child.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">
                      {parent.name}
                    </p>
                    <p className="font-medium group-hover:text-brand-600">
                      {child.name}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-brand-600"
                  />
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
            <Link href="/products" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      {/* New arrivals */}
      {arrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">New arrivals</h2>
          <div className="mt-6">
            <ProductGrid products={arrivals} />
          </div>
        </section>
      )}
    </div>
  );
}
