"use client";

import { useState } from "react";
import { ProductImage } from "./product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const imgs = images.length ? images : [{ url: "", alt: name }];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
        <ProductImage
          src={imgs[active]?.url}
          alt={imgs[active]?.alt ?? name}
          label={name}
          className="h-full w-full"
        />
      </div>

      {imgs.length > 1 && (
        <div className="mt-3 flex gap-3">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "aspect-square w-20 overflow-hidden rounded-lg bg-neutral-100",
                i === active && "ring-2 ring-brand-600"
              )}
            >
              <ProductImage
                src={img.url}
                alt={img.alt ?? name}
                label={name}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
