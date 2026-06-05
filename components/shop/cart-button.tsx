"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/stores/cart";

export function CartButton() {
  const open = useCart((s) => s.open);
  const count = useCart((s) => cartCount(s.items));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={open}
      aria-label="Open cart"
      className="relative text-neutral-700 hover:text-brand-600"
    >
      <ShoppingBag size={20} />
      {mounted && count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
