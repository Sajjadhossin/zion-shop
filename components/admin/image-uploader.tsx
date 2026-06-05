"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ProductImage } from "@/components/shop/product-image";

type Img = { url: string; alt?: string };

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "zion_shop_products";

export function ImageUploader({
  value,
  onChange,
}: {
  value: Img[];
  onChange: (imgs: Img[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  async function handleFile(file: File) {
    setError(null);
    if (!CLOUD) {
      setError("Cloudinary not configured — paste an image URL below instead.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (data.secure_url) onChange([...value, { url: data.secure_url, alt: "" }]);
      else setError(data.error?.message ?? "Upload failed.");
    } catch {
      setError("Upload failed. Check your Cloudinary upload preset is unsigned.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img, i) => (
          <div key={i} className="relative h-24 w-20 overflow-hidden rounded-lg border border-neutral-200">
            <ProductImage src={img.url} alt={img.alt ?? ""} label="img" className="h-full w-full" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400 hover:border-brand-400 hover:text-brand-600">
          {busy ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
          <span className="mt-1 text-[10px]">Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="…or paste an image URL"
          className="h-9 flex-1 rounded-md border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={() => {
            const u = manual.trim();
            if (u) {
              onChange([...value, { url: u, alt: "" }]);
              setManual("");
            }
          }}
          className="h-9 shrink-0 rounded-md bg-neutral-900 px-4 text-sm text-white hover:bg-neutral-800"
        >
          Add
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
