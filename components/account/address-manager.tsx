"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  addAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from "@/app/actions/addresses";
import { DISTRICTS } from "@/lib/shipping";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  postalCode: string | null;
  isDefault: boolean;
};

const EMPTY = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  district: "Dhaka",
  postalCode: "",
};

const inputCls =
  "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  function openNew() {
    setForm(EMPTY);
    setError(null);
    setEditing("new");
  }
  function openEdit(a: Address) {
    setForm({
      fullName: a.fullName,
      phone: a.phone,
      addressLine: a.addressLine,
      city: a.city,
      district: a.district,
      postalCode: a.postalCode ?? "",
    });
    setError(null);
    setEditing(a.id);
  }
  function save() {
    setError(null);
    start(async () => {
      const input = { ...form, postalCode: form.postalCode || undefined };
      const res =
        editing === "new"
          ? await addAddress(input)
          : await updateAddress(editing as string, input);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else setError(res.error);
    });
  }
  function onDelete(id: string) {
    start(async () => {
      await deleteAddress(id);
      router.refresh();
    });
  }
  function onDefault(id: string) {
    start(async () => {
      await setDefaultAddress(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>
        {editing === null && (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="mt-6 rounded-xl border border-neutral-200 p-5">
          <p className="mb-4 font-medium">
            {editing === "new" ? "New address" : "Edit address"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
            <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <input className={cn(inputCls, "sm:col-span-2")} placeholder="Address line" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} />
            <input className={inputCls} placeholder="City / Thana" value={form.city} onChange={(e) => set("city", e.target.value)} />
            <select className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="Postal code (optional)" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={save} disabled={pending} className="rounded-md bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {pending ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium hover:border-neutral-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 && editing === null ? (
        <p className="mt-6 rounded-xl border border-neutral-200 p-10 text-center text-sm text-neutral-500">
          No saved addresses yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-xl border border-neutral-200 p-5 text-sm">
              <div className="flex items-start justify-between">
                <p className="font-medium">
                  {a.fullName}
                  {a.isDefault && (
                    <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase text-neutral-500">
                      Default
                    </span>
                  )}
                </p>
                <div className="flex gap-2 text-neutral-400">
                  <button onClick={() => openEdit(a)} aria-label="Edit" className="hover:text-brand-600"><Pencil size={15} /></button>
                  <button onClick={() => onDelete(a.id)} aria-label="Delete" className="hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-1 text-neutral-600">{a.phone}</p>
              <p className="text-neutral-600">
                {a.addressLine}, {a.city}, {a.district}
                {a.postalCode ? ` – ${a.postalCode}` : ""}
              </p>
              {!a.isDefault && (
                <button onClick={() => onDefault(a.id)} className="mt-3 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                  <Star size={12} /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
