"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { formatBDT } from "@/lib/utils";

type Row = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  orders: number;
  spent: number;
  createdAt: string;
};

export function CustomersTable({ customers }: { customers: Row[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = q.trim();
          router.push(t ? `/admin/customers?q=${encodeURIComponent(t)}` : "/admin/customers");
        }}
        className="mb-4 max-w-sm"
      >
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="h-9 w-full rounded-md border border-neutral-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No customers found.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name ?? "—"}</p>
                    <p className="text-xs text-neutral-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={c.role === "ADMIN" ? "rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white" : "text-neutral-600"}>
                      {c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold">{formatBDT(c.spent)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
