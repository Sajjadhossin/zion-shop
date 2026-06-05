"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/admin/products";
import { ImageUploader } from "./image-uploader";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
type SizeT = (typeof SIZES)[number];
const GENDERS = ["MEN", "WOMEN", "UNISEX"] as const;
type GenderT = (typeof GENDERS)[number];

type Img = { url: string; alt?: string };
type VariantRow = { size: SizeT; color: string; stock: string; price: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  gender: GenderT;
  categoryId: string;
  brand: string;
  isActive: boolean;
  isFeatured: boolean;
  images: Img[];
  variants: { size: SizeT; color: string; stock: number; price: number | null }[];
};

const inputCls =
  "h-10 w-full rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; label: string }[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    initial ? String(initial.basePrice) : ""
  );
  const [gender, setGender] = useState<GenderT>(initial?.gender ?? "MEN");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [images, setImages] = useState<Img[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map((v) => ({
      size: v.size,
      color: v.color,
      stock: String(v.stock),
      price: v.price != null ? String(v.price) : "",
    })) ?? [{ size: "M", color: "", stock: "0", price: "" }]
  );

  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  function submit() {
    setError(null);
    const payload = {
      name,
      description,
      basePrice: Number(basePrice) || 0,
      gender,
      categoryId,
      brand,
      isActive,
      isFeatured,
      images,
      variants: variants
        .filter((v) => v.color.trim())
        .map((v) => ({
          size: v.size,
          color: v.color.trim(),
          stock: Number(v.stock) || 0,
          price: v.price ? Number(v.price) : null,
        })),
    };
    start(async () => {
      const res = initial
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload);
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else setError(res.error);
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className={cn(inputCls, "h-28 py-2")} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Base price (৳)</label>
          <input type="number" min={0} className={inputCls} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Brand</label>
          <input className={inputCls} value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Gender</label>
          <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value as GenderT)}>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-brand-600" />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-brand-600" />
          Featured
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Images</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Variants (size · color · stock · price)</label>
          <button
            type="button"
            onClick={() => setVariants((r) => [...r, { size: "M", color: "", stock: "0", price: "" }])}
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
          >
            <Plus size={14} /> Add variant
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <select className={cn(inputCls, "w-24")} value={v.size} onChange={(e) => setVariant(i, { size: e.target.value as SizeT })}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className={inputCls} placeholder="Color" value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} />
              <input type="number" min={0} className={cn(inputCls, "w-24")} placeholder="Stock" value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} />
              <input type="number" min={0} className={cn(inputCls, "w-28")} placeholder="Price ↺" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} />
              <button type="button" onClick={() => setVariants((r) => r.filter((_, j) => j !== i))} className="shrink-0 text-neutral-400 hover:text-red-600" aria-label="Remove variant">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-400">Leave price blank to use the base price.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button onClick={submit} disabled={pending} className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        <button onClick={() => router.push("/admin/products")} className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:border-neutral-400">
          Cancel
        </button>
      </div>
    </div>
  );
}
