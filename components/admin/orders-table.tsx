"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/account/status-badge";
import { formatBDT } from "@/lib/utils";

type Row = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
};

const ORDER = ["", "PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const METHODS = ["", "COD", "BKASH", "SSLCOMMERZ"];
const selectCls =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function OrdersTable({ orders }: { orders: Row[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `/admin/orders?${qs}` : "/admin/orders");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", q.trim());
          }}
          className="relative"
        >
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order # or customer…"
            className="h-9 w-64 rounded-md border border-neutral-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>
        <select className={selectCls} value={sp.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
          {ORDER.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
        <select className={selectCls} value={sp.get("method") ?? ""} onChange={(e) => setParam("method", e.target.value)}>
          {METHODS.map((m) => <option key={m} value={m}>{m || "All methods"}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-neutral-50" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brand-600" onClick={(e) => e.stopPropagation()}>
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-400">
                      {new Date(o.createdAt).toLocaleDateString()} · {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{o.customer}</td>
                  <td className="px-4 py-3 text-neutral-600">{o.paymentMethod}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={o.orderStatus} /></td>
                  <td className="px-4 py-3 font-semibold">{formatBDT(o.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
