"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  createCoupon,
  deleteCoupon,
  toggleCoupon,
} from "@/app/actions/admin/coupons";
import { cn, formatBDT } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

const EMPTY = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
};

const inputCls =
  "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof typeof EMPTY, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  function create() {
    setError(null);
    start(async () => {
      const res = await createCoupon({
        code: form.code,
        discountType: form.discountType as "PERCENTAGE" | "FIXED",
        discountValue: Number(form.discountValue) || 0,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || "",
      });
      if (res.ok) {
        setForm(EMPTY);
        setOpen(false);
        router.refresh();
      } else setError(res.error);
    });
  }
  function toggle(id: string, next: boolean) {
    start(async () => {
      await toggleCoupon(id, next);
      router.refresh();
    });
  }
  function remove(id: string) {
    setError(null);
    start(async () => {
      const res = await deleteCoupon(id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
        {!open && (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} /> New coupon
          </button>
        )}
      </div>

      {open && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputCls} placeholder="CODE" value={form.code} onChange={(e) => set("code", e.target.value)} />
            <select className={inputCls} value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed (৳)</option>
            </select>
            <input className={inputCls} type="number" placeholder="Value" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} />
            <input className={inputCls} type="number" placeholder="Min order (৳, optional)" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} />
            <input className={inputCls} type="number" placeholder="Max discount (৳, optional)" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} />
            <input className={inputCls} type="number" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} />
            <input className={inputCls} type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={create} disabled={pending} className="rounded-md bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {pending ? "Creating…" : "Create"}
            </button>
            <button onClick={() => { setOpen(false); setError(null); }} className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium hover:border-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      {error && !open && <p className="mb-3 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Usage</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No coupons yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatBDT(c.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c.id, !c.isActive)} disabled={pending} className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", c.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500")}>
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c.id)} disabled={pending} className="text-neutral-400 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
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
