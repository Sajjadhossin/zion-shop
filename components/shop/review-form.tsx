"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

export function ReviewForm({
  productId,
  initialRating = 0,
  initialComment = "",
}: {
  productId: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit() {
    setError(null);
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    start(async () => {
      const res = await submitReview({ productId, rating, comment });
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else setError(res.error);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              size={22}
              className={cn(
                (hover || rating) >= i
                  ? "fill-amber-400 text-amber-400"
                  : "fill-neutral-200 text-neutral-200"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share what you liked (optional)…"
        className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {done && <p className="mt-2 text-sm text-green-600">Thanks — your review is live!</p>}

      <button
        onClick={submit}
        disabled={pending}
        className="mt-3 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
