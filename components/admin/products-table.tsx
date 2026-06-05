"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Search, Trash2 } from "lucide-react";
import {
  deleteProduct,
  toggleProductActive,
} from "@/app/actions/admin/products";
import { ProductImage } from "@/components/shop/product-image";
import { cn, formatBDT } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string | null;
  isActive: boolean;
  isFeatured: boolean;
  variants: number;
  gender: string;
};

export function ProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/admin/products?q=${encodeURIComponent(t)}` : "/admin/products");
  }

  function toggle(id: string, next: boolean) {
    start(async () => {
      await toggleProductActive(id, next);
      router.refresh();
    });
  }
  function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    setMsg(null);
    start(async () => {
      const res = await deleteProduct(id);
      if (!res.ok) setMsg(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={search} className="mb-4 max-w-sm">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="h-9 w-full rounded-md border border-neutral-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </form>

      {msg && <p className="mb-3 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{msg}</p>}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                        <ProductImage src={p.image} alt={p.name} label={p.name} className="h-full w-full" />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.gender}{p.isFeatured ? " · Featured" : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                  <td className="px-4 py-3 font-medium">{formatBDT(p.price)}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.variants}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p.id, !p.isActive)}
                      disabled={pending}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        p.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-neutral-400">
                      <Link href={`/admin/products/${p.id}/edit`} className="hover:text-brand-600" aria-label="Edit"><Pencil size={16} /></Link>
                      <button onClick={() => remove(p.id, p.name)} disabled={pending} className="hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
