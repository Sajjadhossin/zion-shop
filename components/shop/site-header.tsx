import Link from "next/link";
import { Heart, User } from "lucide-react";
import { getNavCategories } from "@/lib/queries/products";
import { getStoreSettings } from "@/lib/queries/store";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";

export async function SiteHeader() {
  const [cats, store] = await Promise.all([
    getNavCategories(),
    getStoreSettings(),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight">
          {store.storeName}
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/products" className="text-sm text-neutral-700 hover:text-brand-600">
            All
          </Link>
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="text-sm text-neutral-700 hover:text-brand-600"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <SearchBar className="ml-auto hidden w-64 lg:block" />

        <div className="ml-auto flex items-center gap-4 lg:ml-2">
          <Link href="/wishlist" aria-label="Wishlist" className="text-neutral-700 hover:text-brand-600">
            <Heart size={20} />
          </Link>
          <Link href="/account" aria-label="Account" className="text-neutral-700 hover:text-brand-600">
            <User size={20} />
          </Link>
          <CartButton />
        </div>
      </div>

      <div className="px-4 pb-3 lg:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
