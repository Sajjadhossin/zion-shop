"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initial,
}: {
  productId: string;
  initial: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if ("needsAuth" in res) {
        router.push("/login?redirect=/wishlist");
        return;
      }
      setWishlisted(res.wishlisted);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-medium transition-colors disabled:opacity-60",
        wishlisted
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-neutral-300 text-neutral-800 hover:border-neutral-400"
      )}
    >
      <Heart size={18} className={cn(wishlisted && "fill-red-500 text-red-500")} />
      {wishlisted ? "In your wishlist" : "Add to Wishlist"}
    </button>
  );
}
