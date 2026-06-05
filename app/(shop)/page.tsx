import Link from "next/link";
import {
  ArrowRight,
  Gem,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tags,
  Truck,
  Wallet,
} from "lucide-react";
import {
  getFeaturedProducts,
  getNavCategories,
  getNewArrivals,
} from "@/lib/queries/products";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductImage } from "@/components/shop/product-image";
import { formatBDT } from "@/lib/utils";

const TRUST = [
  { icon: Truck, title: "Free delivery", sub: "On orders over ৳3,000" },
  { icon: Wallet, title: "Cash on Delivery", sub: "Pay when it arrives" },
  { icon: ShieldCheck, title: "Secure checkout", sub: "bKash & SSLCommerz" },
  { icon: RotateCcw, title: "Easy returns", sub: "7-day return policy" },
];

export default async function HomePage() {
  const [featured, arrivals, cats] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getNavCategories(),
  ]);

  const hero = featured[0];
  const subCategories = cats.flatMap((p) =>
    p.children.map((c) => ({ ...c, parent: p.name }))
  );

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-brand-700 backdrop-blur">
                <Sparkles size={14} /> New season · 2026
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-6xl">
                Fashion that feels
                <span className="block text-brand-600">like home.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-neutral-600">
                Thoughtfully designed styles for men and women, delivered across
                Bangladesh. Premium quality, fair prices, and the payment
                methods you already trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
                >
                  Shop the collection <ArrowRight size={16} />
                </Link>
                <Link
                  href="/category/women"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/60 px-7 py-3.5 text-sm font-medium text-neutral-800 backdrop-blur transition hover:border-neutral-400"
                >
                  Women’s edit
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5"><Truck size={14} /> Free delivery over ৳3,000</span>
                <span className="flex items-center gap-1.5"><Wallet size={14} /> Cash on Delivery</span>
                <span className="flex items-center gap-1.5"><RotateCcw size={14} /> 7-day returns</span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              {hero ? (
                <Link href={`/product/${hero.slug}`} className="group block">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand-900/10 ring-1 ring-black/5">
                    <ProductImage
                      src={hero.image?.url}
                      alt={hero.name}
                      label={hero.name}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 backdrop-blur">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-neutral-400">Featured</p>
                        <p className="line-clamp-1 text-sm font-medium">{hero.name}</p>
                      </div>
                      <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                        {formatBDT(hero.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="mx-auto aspect-[4/5] w-full max-w-md rounded-[2rem] bg-gradient-to-br from-brand-100 to-brand-200" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────── */}
      <section className="border-y border-neutral-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-neutral-100 px-4 sm:grid-cols-4">
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="flex items-center gap-3 bg-white px-2 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.title}</p>
                  <p className="text-xs text-neutral-500">{t.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      {subCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Shop by category</h2>
              <p className="mt-1 text-sm text-neutral-500">Find your style, faster.</p>
            </div>
            <Link href="/products" className="hidden items-center gap-1 text-sm text-brand-600 hover:underline sm:flex">
              All products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {subCategories.map((child) => (
              <Link
                key={child.slug}
                href={`/category/${child.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 transition hover:border-brand-300 hover:shadow-lg hover:shadow-neutral-900/5"
              >
                <p className="text-xs uppercase tracking-wide text-neutral-400">{child.parent}</p>
                <p className="mt-1 text-lg font-medium text-neutral-900 group-hover:text-brand-600">{child.name}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-brand-600">
                  Explore
                  <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured ────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-neutral-50/60 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured pieces</h2>
              <Link href="/products" className="text-sm text-brand-600 hover:underline">View all</Link>
            </div>
            <div className="mt-8">
              <ProductGrid products={featured} />
            </div>
          </div>
        </section>
      )}

      {/* ── Brand story / values ────────────────────────────── */}
      <section className="border-y border-neutral-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:gap-12">
          <h2 className="max-w-[16rem] text-xl font-semibold leading-snug tracking-tight">
            Built for the way <span className="text-brand-600">Bangladesh</span> shops.
          </h2>
          <div className="grid flex-1 gap-x-8 gap-y-5 sm:grid-cols-3">
            {[
              { icon: Gem, t: "Quality you can feel", d: "Durable fabrics, built to last." },
              { icon: Tags, t: "Fair, honest pricing", d: "Premium style, no markups." },
              { icon: Wallet, t: "Pay your way", d: "bKash, SSLCommerz or COD." },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{v.t}</p>
                    <p className="text-sm text-neutral-500">{v.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── New arrivals ────────────────────────────────────── */}
      {arrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">New arrivals</h2>
            <Link href="/products?sort=newest" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={arrivals} />
          </div>
        </section>
      )}

    </div>
  );
}
