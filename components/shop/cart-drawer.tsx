"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/stores/cart";
import { ProductImage } from "./product-image";
import { cn, formatBDT } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock body scroll while open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const subtotal = cartSubtotal(items);

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={close} aria-label="Close cart" className="text-neutral-500 hover:text-neutral-900">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!mounted ? null : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">
              Your cart is empty.
            </p>
          ) : (
            <ul className="space-y-5">
              {items.map((i) => (
                <li key={i.variantId} className="flex gap-3">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    <ProductImage src={i.image} alt={i.name} label={i.name} className="h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${i.slug}`} onClick={close} className="text-sm font-medium hover:text-brand-600">
                      {i.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {i.color} / {i.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{formatBDT(i.price)}</p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-neutral-300">
                        <button
                          onClick={() => setQty(i.variantId, i.quantity - 1)}
                          disabled={i.quantity <= 1}
                          className="px-2 py-1 text-neutral-600 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm">{i.quantity}</span>
                        <button
                          onClick={() => setQty(i.variantId, i.quantity + 1)}
                          disabled={i.quantity >= i.maxStock}
                          className="px-2 py-1 text-neutral-600 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(i.variantId)}
                        className="text-neutral-400 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {mounted && items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-lg font-semibold">{formatBDT(subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={close}
              className="mt-4 flex w-full items-center justify-center rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium hover:border-neutral-400"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
