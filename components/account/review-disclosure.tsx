"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ReviewForm } from "@/components/shop/review-form";

export function ReviewDisclosure({
  productId,
  reviewed,
  rating,
  comment,
}: {
  productId: string;
  reviewed: boolean;
  rating: number;
  comment: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
      >
        <Star size={13} className={reviewed ? "fill-amber-400 text-amber-400" : ""} />
        {reviewed ? "Edit your review" : "Write a review"}
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-neutral-200 p-4">
          <ReviewForm
            productId={productId}
            initialRating={rating}
            initialComment={comment}
          />
        </div>
      )}
    </div>
  );
}
