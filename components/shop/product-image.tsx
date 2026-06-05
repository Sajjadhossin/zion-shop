"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image with a graceful gradient fallback. Seed data uses placeholder
 * Cloudinary URLs that 404, so this keeps the catalog looking intentional
 * until real product photos are uploaded.
 */
export function ProductImage({
  src,
  alt,
  label,
  className,
}: {
  src?: string | null;
  alt?: string | null;
  label?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200",
          className
        )}
      >
        <span className="px-4 text-center text-xs font-medium uppercase tracking-wide text-neutral-400">
          {label ?? alt ?? "Zion Shop"}
        </span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
