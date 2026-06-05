import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWishlistProducts } from "@/lib/queries/wishlist";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Your Wishlist</h1>
        <p className="mt-2 text-neutral-500">
          Log in to view and manage your saved items.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  const products = await getWishlistProducts(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your Wishlist</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {products.length} saved item{products.length !== 1 ? "s" : ""}. Open a
        product to remove it.
      </p>
      <div className="mt-8">
        <ProductGrid
          products={products}
          empty="Your wishlist is empty. Tap the heart on any product to save it."
        />
      </div>
    </div>
  );
}
