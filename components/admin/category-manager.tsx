"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/admin/categories";
import { cn } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  childCount: number;
};

const GENDERS = ["", "MEN", "WOMEN", "UNISEX"] as const;
const inputCls =
  "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const parents = categories.filter((c) => c.parentId === null);

  function openNew() {
    setName("");
    setParentId("");
    setGender("");
    setError(null);
    setEditing("new");
  }
  function openEdit(c: Cat) {
    setName(c.name);
    setParentId(c.parentId ?? "");
    setGender(c.gender ?? "");
    setError(null);
    setEditing(c.id);
  }
  function save() {
    setError(null);
    start(async () => {
      const input = { name, parentId: parentId || undefined, gender: (gender || undefined) as never };
      const res =
        editing === "new"
          ? await createCategory(input)
          : await updateCategory(editing as string, input);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else setError(res.error);
    });
  }
  function remove(c: Cat) {
    setError(null);
    start(async () => {
      const res = await deleteCategory(c.id);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        {editing === null && (
          <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {editing !== null && (
        <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5">
          <p className="mb-4 font-medium">{editing === "new" ? "New category" : "Edit category"}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select className={inputCls} value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— Top level —</option>
              {parents.filter((p) => p.id !== editing).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
              {GENDERS.map((g) => <option key={g} value={g}>{g || "Any gender"}</option>)}
            </select>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button onClick={save} disabled={pending} className="rounded-md bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {pending ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-md border border-neutral-300 px-5 py-2 text-sm font-medium hover:border-neutral-400">Cancel</button>
          </div>
        </div>
      )}

      {error && editing === null && <p className="mb-3 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Parent</th>
              <th className="px-4 py-3 font-medium">Gender</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-neutral-500">No categories yet.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.parentName ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.gender ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.productCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-neutral-400">
                      <button onClick={() => openEdit(c)} className="hover:text-brand-600" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => remove(c)} disabled={pending} className="hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
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
