"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image: string | null;
  maxStock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  /** Adds (or increments) an item, clamped to available stock. */
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (item, qty = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.variantId === item.variantId);
        if (existing) {
          existing.quantity = clamp(
            existing.quantity + qty,
            1,
            item.maxStock
          );
        } else {
          items.push({ ...item, quantity: clamp(qty, 1, item.maxStock) });
        }
        set({ items, isOpen: true });
      },

      remove: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      setQty: (variantId, qty) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: clamp(qty, 1, i.maxStock) }
              : i
          ),
        }),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "zion-cart",
      // Only persist the line items — not the drawer open/closed flag.
      partialize: (s) => ({ items: s.items }),
    }
  )
);

/** Derived helpers (call inside components). */
export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.price * i.quantity, 0);
