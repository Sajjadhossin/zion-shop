import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getWishlistProducts } from "@/lib/queries/wishlist";
import { ProductGrid } from "@/components/shop/product-grid";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function AccountWishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const products = await getWishlistProducts(user.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">My Wishlist</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {products.length} saved item{products.length !== 1 ? "s" : ""}. Open a
        product to remove it.
      </p>
      <div className="mt-6">
        <ProductGrid
          products={products}
          empty="Your wishlist is empty. Tap the heart on any product to save it."
        />
      </div>
    </div>
  );
}
