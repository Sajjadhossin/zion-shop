"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteReview } from "@/app/actions/admin/reviews";
import { StarRating } from "@/components/shop/star-rating";

type Row = {
  id: string;
  rating: number;
  comment: string | null;
  date: string;
  productName: string;
  productSlug: string;
  customer: string;
};

export function ReviewsTable({ reviews }: { reviews: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    start(async () => {
      await deleteReview(id);
      router.refresh();
    });
  }

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
        No reviews yet. They appear here once customers review delivered orders.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/product/${r.productSlug}`} className="font-medium hover:text-brand-600">
                  {r.productName}
                </Link>
                <StarRating value={r.rating} size={14} />
              </div>
              <p className="mt-0.5 text-xs text-neutral-400">
                {r.customer} · {new Date(r.date).toLocaleDateString()}
              </p>
              {r.comment && <p className="mt-2 text-sm text-neutral-700">{r.comment}</p>}
            </div>
            <button
              onClick={() => remove(r.id)}
              disabled={pending}
              className="shrink-0 text-neutral-400 hover:text-red-600"
              aria-label="Delete review"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
