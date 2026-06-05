"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";

type Cat = { name: string; slug: string };

export function MobileMenu({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex text-neutral-700 hover:text-brand-600"
      >
        <Menu size={22} />
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              onClick={close}
              className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
            <aside
              className={`fixed left-0 top-0 z-[70] flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl transition-transform duration-300 ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
              aria-hidden={!open}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <span className="font-semibold">Menu</span>
                <button onClick={close} aria-label="Close menu" className="text-neutral-500 hover:text-neutral-900">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-4">
                <Link href="/products" onClick={close} className="block rounded-md px-3 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                  All products
                </Link>
                <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Categories
                </p>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={close}
                    className="block rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-neutral-200 px-2 py-3">
                <Link href="/account" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100">
                  <User size={18} /> Account
                </Link>
                <Link href="/wishlist" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100">
                  <Heart size={18} /> Wishlist
                </Link>
                <Link href="/cart" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100">
                  <ShoppingBag size={18} /> Cart
                </Link>
              </div>
            </aside>
          </>,
          document.body
        )}
    </div>
  );
}
