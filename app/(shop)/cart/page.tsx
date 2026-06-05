"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/stores/cart";
import { ProductImage } from "@/components/shop/product-image";
import { formatBDT } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotal(items);

  if (!mounted) {
    return <div className="mx-auto max-w-5xl px-4 py-16" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-neutral-200 p-10 text-center">
          <p className="text-neutral-500">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <ul className="divide-y divide-neutral-100">
            {items.map((i) => (
              <li key={i.variantId} className="flex gap-4 py-5">
                <div className="h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <ProductImage src={i.image} alt={i.name} label={i.name} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col">
                  <Link href={`/product/${i.slug}`} className="font-medium hover:text-brand-600">
                    {i.name}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    {i.color} / {i.size}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{formatBDT(i.price)}</p>

                  <div className="mt-auto flex items-center gap-4 pt-3">
                    <div className="flex items-center rounded-md border border-neutral-300">
                      <button onClick={() => setQty(i.variantId, i.quantity - 1)} disabled={i.quantity <= 1} className="px-2.5 py-1.5 text-neutral-600 disabled:opacity-40" aria-label="Decrease">
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm">{i.quantity}</span>
                      <button onClick={() => setQty(i.variantId, i.quantity + 1)} disabled={i.quantity >= i.maxStock} className="px-2.5 py-1.5 text-neutral-600 disabled:opacity-40" aria-label="Increase">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => remove(i.variantId)} className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-600">
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {formatBDT(i.price * i.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium">{formatBDT(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-neutral-500">Shipping</span>
              <span className="text-neutral-400">Calculated at checkout</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-md bg-brand-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-brand-700"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
